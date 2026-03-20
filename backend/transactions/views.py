# transactions/views.py

from django.utils import timezone
from datetime import timedelta
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from pricing.auth import SupabaseJWTAuthentication
from .payment import generate_payment_data, get_payfast_url
import traceback
import sys
import uuid
import os
import requests as http_requests


def home(request):
    return JsonResponse({
        'message': 'Welcome to GigSafe Escrow API',
        'endpoints': {
            'my_transactions': '/api/transactions/my-transactions/',
            'confirm_delivery': '/api/transactions/<id>/confirm-delivery/',
            'request_release': '/api/transactions/<id>/request-release/',
            'fund_escrow': '/api/transactions/<id>/fund/',
        }
    })


def _get_user_uuid(request):
    """auth.py stores the Supabase UUID as the Django username."""
    try:
        return str(uuid.UUID(str(request.user.username)))
    except (ValueError, AttributeError):
        return None


def _supabase_headers():
    """Return headers for Supabase REST API calls using service role key."""
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    return {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
    }


def _get_transaction(transaction_id: str) -> dict | None:
    """Fetch a single transaction from Supabase by ID."""
    supabase_url = os.getenv("SUPABASE_URL", "")
    response = http_requests.get(
        f"{supabase_url}/rest/v1/transactions",
        headers=_supabase_headers(),
        params={"id": f"eq.{transaction_id}", "select": "*"},
        timeout=10,
    )
    if response.status_code == 200 and response.json():
        return response.json()[0]
    return None


def _update_transaction(transaction_id: str, data: dict) -> bool:
    """Update a transaction in Supabase by ID."""
    supabase_url = os.getenv("SUPABASE_URL", "")
    response = http_requests.patch(
        f"{supabase_url}/rest/v1/transactions",
        headers={**_supabase_headers(), "Prefer": "return=minimal"},
        params={"id": f"eq.{transaction_id}"},
        json=data,
        timeout=10,
    )
    return response.status_code in [200, 204]


@api_view(['GET'])
@authentication_classes([SupabaseJWTAuthentication])
@permission_classes([IsAuthenticated])
def my_transactions(request):
    """Return transactions for the logged-in user (as buyer or seller)"""
    user_id = _get_user_uuid(request)
    if not user_id:
        return JsonResponse({'error': 'Invalid user ID'}, status=400)

    supabase_url = os.getenv("SUPABASE_URL", "")

    as_buyer = http_requests.get(
        f"{supabase_url}/rest/v1/transactions",
        headers=_supabase_headers(),
        params={"from_user_id": f"eq.{user_id}", "select": "*"},
        timeout=10,
    ).json()

    as_seller = http_requests.get(
        f"{supabase_url}/rest/v1/transactions",
        headers=_supabase_headers(),
        params={"to_user_id": f"eq.{user_id}", "select": "*"},
        timeout=10,
    ).json()

    transactions = []

    for t in (as_buyer if isinstance(as_buyer, list) else []):
        transactions.append({
            'id': t['id'],
            'role': 'buyer',
            'amount': t['amount'],
            'type': t['type'],
            'other_party_id': t.get('to_user_id'),
            'created_at': t.get('created_at'),
        })

    for t in (as_seller if isinstance(as_seller, list) else []):
        transactions.append({
            'id': t['id'],
            'role': 'seller',
            'amount': t['amount'],
            'type': t['type'],
            'other_party_id': t.get('from_user_id'),
            'created_at': t.get('created_at'),
        })

    return JsonResponse({'transactions': transactions})


@csrf_exempt
@api_view(['POST'])
@authentication_classes([SupabaseJWTAuthentication])
@permission_classes([IsAuthenticated])
def confirm_delivery(request, transaction_id):
    """Buyer confirms they received the item — triggers fund release"""
    try:
        user_id = _get_user_uuid(request)
        if not user_id:
            return JsonResponse({'error': 'Invalid user ID'}, status=400)

        transaction = _get_transaction(str(transaction_id))
        if not transaction:
            return JsonResponse({'success': False, 'error': 'Transaction not found'}, status=404)

        if str(transaction.get('from_user_id')) != str(user_id):
            return JsonResponse({'success': False, 'error': 'You are not the buyer'}, status=403)

        if transaction.get('type') != 'hold':
            return JsonResponse({
                'success': False,
                'error': f'Transaction type is {transaction.get("type")}, expected hold'
            }, status=400)

        # Calculate fees using PlatformFee model
        from .models import PlatformFee
        from decimal import Decimal

        config = PlatformFee.get_active()
        gross = Decimal(str(transaction['amount']))
        payfast_fee = (gross * Decimal(str(config.payfast_percentage)) / Decimal('100')) + Decimal(str(config.payfast_fixed))
        platform_fee = (gross * Decimal(str(config.platform_percentage)) / Decimal('100')) + Decimal(str(config.platform_fixed))
        total_fee = payfast_fee + platform_fee
        net = gross - total_fee

        # Update transaction in Supabase
        _update_transaction(str(transaction_id), {
            'type': 'release',
            'fee_amount': float(round(total_fee, 2)),
            'total_amount': float(round(net, 2)),
            'subtotal_amount': float(gross),
        })

        # Call PayFast payout
        from .release import get_user_email_from_supabase
        from .payfast import payout_to_seller

        seller_email = get_user_email_from_supabase(str(transaction.get('to_user_id')))
        if seller_email:
            payout_to_seller(
                seller_email=seller_email,
                amount=net,
                transaction_id=str(transaction_id)
            )

        return JsonResponse({
            'success': True,
            'message': 'Delivery confirmed! Funds released to seller.',
            'details': {
                'success': True,
                'gross_amount': str(gross),
                'payfast_fee': str(round(payfast_fee, 2)),
                'platform_fee': str(round(platform_fee, 2)),
                'net_to_seller': str(round(net, 2)),
            }
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
@authentication_classes([SupabaseJWTAuthentication])
@permission_classes([IsAuthenticated])
def request_release(request, transaction_id):
    """Seller requests payment release"""
    try:
        user_id = _get_user_uuid(request)
        if not user_id:
            return JsonResponse({'error': 'Invalid user ID'}, status=400)

        transaction = _get_transaction(str(transaction_id))
        if not transaction:
            return JsonResponse({'success': False, 'error': 'Transaction not found'}, status=404)

        if str(transaction.get('to_user_id')) != str(user_id):
            return JsonResponse({'success': False, 'error': 'You are not the seller'}, status=403)

        if transaction.get('type') != 'hold':
            return JsonResponse({
                'success': False,
                'error': 'Transaction must be in hold (funded) state first'
            }, status=400)

        _update_transaction(str(transaction_id), {
            'release_requested_at': timezone.now().isoformat(),
        })

        return JsonResponse({
            'success': True,
            'message': 'Release request sent to buyer'
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


def fund_escrow(request, transaction_id):
    """
    Redirect buyer to PayFast to fund escrow.
    Accepts JWT token either as Authorization header OR as ?token= query param
    so it works with both browser redirects and API calls.
    """
    print("\n" + "=" * 70)
    print("FUND_ESCROW CALLED")
    print("=" * 70)

    try:
        # Try Authorization header first, then fall back to query param
        token = request.GET.get('token')
        user_id = None

        if token:
            # Validate token via Supabase
            import requests as req
            supabase_url = os.getenv("SUPABASE_URL", "")
            anon_key = os.getenv("SUPABASE_ANON_KEY", "")
            resp = req.get(
                f"{supabase_url}/auth/v1/user",
                headers={"Authorization": f"Bearer {token}", "apikey": anon_key},
                timeout=10,
            )
            if resp.status_code == 200:
                payload = resp.json()
                try:
                    user_id = uuid.UUID(str(payload.get("id")))
                except Exception:
                    user_id = None
        else:
            user_id = _get_user_uuid(request)

        if not user_id:
            return JsonResponse({'error': 'Invalid or missing authentication'}, status=403)

        print(f"Transaction ID: {transaction_id}")
        print(f"User ID: {user_id}")

        transaction = _get_transaction(str(transaction_id))
        if not transaction:
            return JsonResponse({'success': False, 'error': 'Transaction not found'}, status=404)

        if str(transaction.get('from_user_id')) != str(user_id):
            return JsonResponse({'success': False, 'error': 'You are not the buyer'}, status=403)

        if transaction.get('type') != 'hold':
            return JsonResponse({'success': False, 'error': 'Transaction is not in hold state'}, status=400)

        print(f"Transaction found: ID={transaction['id']}, Amount={transaction['amount']}, Type={transaction['type']}")

        ngrok_url = os.getenv('NGROK_URL', '').rstrip('/')

        notify_url = ngrok_url + "/api/transactions/payfast-webhook/"
        return_url = ngrok_url + "/api/transactions/funding-success/"
        cancel_url = ngrok_url + "/api/transactions/funding-cancelled/"

        print(f"Notify URL: {notify_url}")
        print(f"Return URL: {return_url}")
        print(f"Cancel URL: {cancel_url}")

        # Create a simple object for generate_payment_data
        class TransactionObj:
            def __init__(self, t):
                self.id = t['id']
                self.amount = t['amount']

        payment_data = generate_payment_data(
            TransactionObj(transaction),
            return_url,
            cancel_url,
            notify_url
        )

        payfast_url = get_payfast_url()
        print(f"PayFast URL: {payfast_url}")

        html = f'''
        <html>
        <head><title>Redirecting to PayFast...</title></head>
        <body>
            <h3>Redirecting to PayFast...</h3>
            <form id="payfast_form" action="{payfast_url}" method="post">
        '''

        for key, value in payment_data.items():
            html += f'<input type="hidden" name="{key}" value="{value}">\n'

        html += '''
            </form>
            <script>
                document.getElementById('payfast_form').submit();
            </script>
            <noscript>
                <button type="submit" form="payfast_form">Pay Now</button>
            </noscript>
        </body>
        </html>
        '''

        print("HTML form created successfully")
        print("=" * 70 + "\n")
        return HttpResponse(html)

    except Exception as e:
        print(f"ERROR: {str(e)}")
        traceback.print_exc(file=sys.stdout)
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def payfast_webhook(request):
    """Handle PayFast ITN webhook"""
    print("\n" + "=" * 70)
    print("WEBHOOK HIT")
    print("=" * 70)

    if request.method == 'POST':
        data = request.POST.dict()
        for key, value in data.items():
            print(f"  {key}: {value}")

        transaction_id = data.get('m_payment_id')
        payment_status = data.get('payment_status')

        if transaction_id and payment_status:
            print(f"Processing transaction {transaction_id} — status: {payment_status}")

            if payment_status == 'COMPLETE':
                success = _update_transaction(transaction_id, {
                    'type': 'hold',
                    'payfast_payment_id': data.get('pf_payment_id'),
                })
                if success:
                    print(f"Transaction {transaction_id} updated — PayFast payment confirmed")
                else:
                    print(f"Failed to update transaction {transaction_id} in Supabase")

            elif payment_status == 'FAILED':
                _update_transaction(transaction_id, {
                    'note': 'PayFast payment FAILED',
                })
                print(f"Transaction {transaction_id} marked as failed")
        else:
            print("Missing m_payment_id or payment_status")
    else:
        print(f"Invalid request method: {request.method}")

    print("=" * 70 + "\n")
    return HttpResponse("OK")


def funding_success(request):
    print("Funding success page accessed")
    from django.shortcuts import redirect
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return redirect(f"{frontend_url}/my-gigs?payment=success")


def funding_cancelled(request):
    print("Funding cancelled page accessed")
    from django.shortcuts import redirect
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return redirect(f"{frontend_url}/my-gigs?payment=cancelled")


@csrf_exempt
@api_view(['POST'])
@authentication_classes([SupabaseJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_from_gig(request):
    """
    Creates an escrow transaction from a gig acceptance.
    Called by the frontend after the hustler accepts a gig via Supabase directly.
    """
    try:
        user_id = _get_user_uuid(request)
        if not user_id:
            return JsonResponse({'error': 'Invalid user ID'}, status=400)

        gig_id = request.data.get('gig_id')
        client_id = request.data.get('client_id')
        amount = request.data.get('amount')

        if not gig_id or not client_id or not amount:
            return JsonResponse({'error': 'gig_id, client_id and amount are required'}, status=400)

        supabase_url = os.getenv("SUPABASE_URL", "")
        service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

        transaction_id = str(uuid.uuid4())

        payload = {
            "id": transaction_id,
            "gig_id": gig_id,
            "from_user_id": client_id,
            "to_user_id": str(user_id),
            "amount": float(amount),
            "type": "hold",
            "note": f"Escrow hold for gig {gig_id}",
        }

        headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }

        response = http_requests.post(
            f"{supabase_url}/rest/v1/transactions",
            json=payload,
            headers=headers,
            timeout=10,
        )

        if response.status_code in [200, 201]:
            print(f"Transaction {transaction_id} created from gig {gig_id}")
            return JsonResponse({
                'success': True,
                'transaction_id': transaction_id,
                'next_step': f'Client must fund escrow at: /api/transactions/{transaction_id}/fund/'
            })
        else:
            return JsonResponse({'success': False, 'error': response.text}, status=400)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# TESTING ONLY — remove before final submission
def fund_escrow_test(request, transaction_id):
    try:
        transaction = _get_transaction(str(transaction_id))
        if not transaction:
            return JsonResponse({'error': 'Transaction not found'}, status=404)

        ngrok_url = os.getenv('NGROK_URL', '').rstrip('/')
        notify_url = ngrok_url + "/api/transactions/payfast-webhook/"
        return_url = ngrok_url + "/api/transactions/funding-success/"
        cancel_url = ngrok_url + "/api/transactions/funding-cancelled/"

        class TransactionObj:
            def __init__(self, t):
                self.id = t['id']
                self.amount = t['amount']

        payment_data = generate_payment_data(TransactionObj(transaction), return_url, cancel_url, notify_url)
        payfast_url = get_payfast_url()

        html = f'<html><body><form id="f" action="{payfast_url}" method="post">'
        for key, value in payment_data.items():
            html += f'<input type="hidden" name="{key}" value="{value}">'
        html += '</form><script>document.getElementById("f").submit();</script></body></html>'
        return HttpResponse(html)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
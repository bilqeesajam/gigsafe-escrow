# transactions/release.py

from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Transaction
from .payfast import payout_to_seller
import logging
import requests

logger = logging.getLogger(__name__)


def get_user_email_from_supabase(user_id: str) -> str:
    """
    Look up a user's email from Supabase using the service role key.
    Returns the email string, or None if not found.
    """
    url = f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get('email')
        else:
            logger.error(f"Supabase user lookup failed for {user_id}: {response.status_code} {response.text}")
            return None
    except Exception as e:
        logger.error(f"Supabase user lookup error for {user_id}: {e}")
        return None


class ReleaseService:
    def __init__(self, transaction):
        self.transaction = transaction

    def release_funds(self):
        """Main function to release money to seller"""
        try:
            if self.transaction.type != 'hold':
                return {
                    'success': False,
                    'error': f'Transaction type is {self.transaction.type}, expected hold (funded)'
                }

            # 1. Calculate fees
            seller_amount = self.transaction.calculate_fees()
            self.transaction.save()

            breakdown = self.transaction.get_fee_breakdown()
            print(f"\nFee Breakdown for Transaction {self.transaction.id}:")
            print(f"  Gross Amount:   R{breakdown['gross_amount']}")
            print(f"  PayFast Fee:    R{breakdown['payfast_fee']}")
            print(f"  Platform Fee:   R{breakdown['platform_fee']}")
            print(f"  Net to Seller:  R{breakdown['net_to_seller']}")

            # 2. Look up seller email from Supabase
            seller_email = get_user_email_from_supabase(str(self.transaction.to_user_id))
            if not seller_email:
                return {'success': False, 'error': 'Could not retrieve seller email from Supabase'}

            # 3. Call PayFast payout
            success = payout_to_seller(
                seller_email=seller_email,
                amount=seller_amount,
                transaction_id=self.transaction.id
            )

            if success:
                # 4. Update transaction to released
                self.transaction.type = 'release'
                self.transaction.released_at = timezone.now()
                self.transaction.save()

                # 5. Send notifications
                self._send_notifications(seller_email, breakdown)

                return {
                    'success': True,
                    'gross_amount': str(breakdown['gross_amount']),
                    'payfast_fee': str(breakdown['payfast_fee']),
                    'platform_fee': str(breakdown['platform_fee']),
                    'net_to_seller': str(breakdown['net_to_seller']),
                }
            else:
                return {'success': False, 'error': 'PayFast payout failed — check PayFast logs'}

        except ValueError as e:
            return {'success': False, 'error': str(e)}
        except Exception as e:
            logger.error(f"ReleaseService error: {e}")
            return {'success': False, 'error': str(e)}

    def _send_notifications(self, seller_email: str, breakdown: dict):
        """Send emails to buyer and seller after release"""
        try:
            print("\n" + "=" * 50)
            print("SENDING EMAILS")
            print("=" * 50)

            send_mail(
                subject='Payment Released!',
                message=(
                    f'Your payment for transaction {self.transaction.id} has been released.\n\n'
                    f'Gross Amount:  R{breakdown["gross_amount"]}\n'
                    f'PayFast Fee:   R{breakdown["payfast_fee"]}\n'
                    f'Platform Fee:  R{breakdown["platform_fee"]}\n'
                    f'You Received:  R{breakdown["net_to_seller"]}\n'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[seller_email],
                fail_silently=False,
            )
            print(f"Seller email sent to: {seller_email}")

            buyer_email = get_user_email_from_supabase(str(self.transaction.from_user_id))
            if buyer_email:
                send_mail(
                    subject='Funds Released to Seller',
                    message=(
                        f'Funds for transaction {self.transaction.id} have been released.\n\n'
                        f'Amount Released: R{breakdown["net_to_seller"]}\n'
                        f'Seller ID: {self.transaction.to_user_id}\n'
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[buyer_email],
                    fail_silently=False,
                )
                print(f"Buyer email sent to: {buyer_email}")
            else:
                print("Could not retrieve buyer email — skipping buyer notification")

            print("=" * 50 + "\n")

        except Exception as e:
            print(f"EMAIL ERROR: {e}")
            logger.error(f"Notification email error: {e}")
# transactions/payment.py

import hashlib
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()


def generate_signature(data: dict, passphrase: str) -> str:
    """
    Generate PayFast signature exactly as their docs specify.
    Values must be URL-encoded using quote_plus before hashing.
    """
    # Build parameter string in the order keys appear in `data`
    parts = []
    for key, value in data.items():
        # URL-encode the value (spaces become +, special chars become %XX)
        encoded = quote_plus(str(value))
        parts.append(f"{key}={encoded}")

    param_string = "&".join(parts)

    # Append passphrase (also URL-encoded)
    param_string += f"&passphrase={quote_plus(passphrase)}"

    print(f"\n🔐 String to hash:\n  {param_string}")

    signature = hashlib.md5(param_string.encode("utf-8")).hexdigest()
    print(f"✨ Generated signature: {signature}")
    return signature


def generate_payment_data(transaction, return_url, cancel_url, notify_url):
    """
    Generate data for PayFast payment form.

    Key fixes vs previous version:
    1. Amount is in RANDS (e.g. "300.00"), NOT cents.
       PayFast's payment page expects rands; only the payout API uses cents.
    2. All values are URL-encoded when building the signature string.
    3. item_name space is handled correctly by quote_plus.
    """
    print("\n" + "=" * 70)
    print("🔧 GENERATE_PAYMENT_DATA CALLED")
    print("=" * 70)

    MERCHANT_ID = os.getenv('PAYFAST_MERCHANT_ID')
    MERCHANT_KEY = os.getenv('PAYFAST_MERCHANT_KEY')
    PASSPHRASE = os.getenv('PAYFAST_PASSPHRASE')

    print(f"📋 Transaction ID: {transaction.id}")
    print(f"💰 Amount: {transaction.amount}")

    # ✅ FIX 1: Amount in rands, formatted to 2 decimal places
    amount_rands = f"{float(transaction.amount):.2f}"
    print(f"💵 Amount in rands: {amount_rands}")

    item_name = f"Transaction {transaction.id}"

    # ✅ FIX 2: Build the dict in EXACT PayFast-required order
    # Order matters — do not rearrange these keys
    data = {
        'merchant_id': MERCHANT_ID,
        'merchant_key': MERCHANT_KEY,
        'return_url': return_url,
        'cancel_url': cancel_url,
        'notify_url': notify_url,
        'm_payment_id': str(transaction.id),
        'amount': amount_rands,
        'item_name': item_name,
    }

    print(f"\n📝 Parameters (pre-signature):")
    for k, v in data.items():
        print(f"  {k} = {v}")

    # ✅ FIX 3: Generate signature with URL-encoded values
    signature = generate_signature(data, PASSPHRASE)

    # Add signature to the form data (NOT to the signature string itself)
    form_data = dict(data)
    form_data['signature'] = signature

    print(f"\n📤 Final form data:")
    for key, value in form_data.items():
        print(f"  🔹 {key}: {value}")

    print("=" * 70 + "\n")
    return form_data


def get_payfast_url():
    is_sandbox = os.getenv('PAYFAST_SANDBOX', 'True') == 'True'
    if is_sandbox:
        return "https://sandbox.payfast.co.za/eng/process"
    return "https://www.payfast.co.za/eng/process"
# transactions/payfast.py

import requests
import os
from dotenv import load_dotenv

load_dotenv()

def payout_to_seller(seller_email, amount, transaction_id):
    """
    PayFast payout with sandbox credentials
    """
    url = "https://sandbox.payfast.co.za/eng/process"
    
    amount_cents = str(int(float(amount) * 100))
    
    data = {
        'merchant_id': os.getenv('PAYFAST_MERCHANT_ID'),
        'merchant_key': os.getenv('PAYFAST_MERCHANT_KEY'),
        'amount': amount_cents,
        'email': seller_email,
        'reference': f"TRANS-{transaction_id}",
        'item_name': f'Transaction #{transaction_id}',
        'item_description': f'Escrow payment for transaction #{transaction_id}',
        'passphrase': os.getenv('PAYFAST_PASSPHRASE'),
    }
    
    try:
        print(f"Sending payout to PayFast for transaction {transaction_id}")
        print(f"Amount (cents): {amount_cents}")
        print(f"Seller: {seller_email}")
        
        response = requests.post(url, data=data, timeout=10)
        
        print(f"PayFast response status: {response.status_code}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"PayFast error: {e}")
        return False
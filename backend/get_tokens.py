import requests, os
from dotenv import load_dotenv
load_dotenv()

# Client token
resp = requests.post(
    os.getenv('SUPABASE_URL') + '/auth/v1/token?grant_type=password',
    headers={'apikey': os.getenv('SUPABASE_ANON_KEY'), 'Content-Type': 'application/json'},
    json={'email': 'waxieburg@gmail.com', 'password': '123456'}
)
print('CLIENT Status:', resp.status_code)
print('CLIENT Token:', resp.json().get('access_token'))

# Hustler token
resp2 = requests.post(
    os.getenv('SUPABASE_URL') + '/auth/v1/token?grant_type=password',
    headers={'apikey': os.getenv('SUPABASE_ANON_KEY'), 'Content-Type': 'application/json'},
    json={'email': 'spietersen2017@mysbf.co.za', 'password': '123456'}
)
print('HUSTLER Status:', resp2.status_code)
print('HUSTLER Token:', resp2.json().get('access_token'))
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command

try:
    with open('api_data.json', 'r', encoding='utf-16') as f: # Try utf-16 if default fails, or check first
        data = f.read()
    
    # Write back as utf-8
    with open('api_data_utf8.json', 'w', encoding='utf-8') as f:
        f.write(data)
    
    print("Converted to UTF-8")
    call_command('loaddata', 'api_data_utf8.json')
    print("Successfully loaded api data")
except Exception as e:
    print(f"Error: {e}")
    # Try reading as utf-8 directly if utf-16 failed
    try:
        call_command('loaddata', 'api_data.json')
        print("Successfully loaded api data directly")
    except Exception as e2:
        print(f"Direct load error: {e2}")

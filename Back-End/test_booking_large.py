import requests

# 5MB of base64 data
large_base64 = "A" * (5 * 1024 * 1024)

payload = {
    "venue": "Test",
    "facility": "Test Facility",
    "date": "2026-10-10",
    "startTime": "10:00",
    "endTime": "11:00",
    "purpose": "Test",
    "requestor": "Test",
    "email": "test@test.com",
    "phoneNumber": "1234",
    "selectedEquipment": [],
    "attachmentName": "large_file.txt",
    "attachment": f"data:text/plain;base64,{large_base64}"
}

try:
    response = requests.post("http://localhost:8000/bookings/", json=payload)
    print("Status:", response.status_code)
    # The new view logic will return a JSON with 'detail' and 'traceback'
    print("Response text:", response.text[:5000])
except Exception as e:
    print("Error:", e)

import requests

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
    "attachment": "data:text/plain;base64,SGVsbG8gV29ybGQ=",
    "attachmentName": "test.txt"
}

try:
    response = requests.post("http://localhost:8000/bookings/", json=payload)
    print("Status:", response.status_code)
    print("Response snippet:", response.text[:500])
except Exception as e:
    print("Error:", e)

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
    "attachmentName": "",
    "attachment": None,
    "status": "PENDING",
    "region": "Test Region",
    "createdAt": "2026-03-23T03:47:00.000Z"
}

try:
    response = requests.post("http://localhost:8000/bookings/", json=payload)
    print("Status:", response.status_code)
    if response.status_code == 500:
        # Save HTML to file to view the traceback
        with open("error.html", "w") as f:
            f.write(response.text)
        print("Saved error to error.html")
    else:
        print("Response:", response.text[:500])
except Exception as e:
    print("Error:", e)

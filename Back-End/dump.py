import urllib.request, json
try:
    users = json.loads(urllib.request.urlopen('http://localhost:8000/users/').read().decode())
    offices = json.loads(urllib.request.urlopen('http://localhost:8000/offices/').read().decode())
    bookings = json.loads(urllib.request.urlopen('http://localhost:8000/bookings/').read().decode())

    print("--- USERS (Admins) ---")
    for u in users:
        if u['role'] == 'admin':
            print(f"ID:{u['id']} Email:{u['email']} Region:'{u['assignedRegion']}' Office:'{u['assignedOffice']}'")

    print("\n--- OFFICES ---")
    for o in offices:
        print(f"ID:{o['id']} Name:'{o['name']}' Region:'{o['region']}'")

    print("\n--- BOOKINGS (Pending) ---")
    for b in bookings:
        if b['status'] == 'PENDING':
            print(f"ID:{b['id']} Venue:'{b['venue']}' Region:'{b.get('region','')}'")
except Exception as e:
    print(e)

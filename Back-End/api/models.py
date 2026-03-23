from django.db import models

class Office(models.Model):
    region = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    address = models.TextField()

    def __str__(self):
        return f"{self.name} ({self.region})"

class Room(models.Model):
    office = models.ForeignKey(Office, related_name='rooms', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} - {self.office.name}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'PENDING'),
        ('APPROVED', 'APPROVED'),
        ('REJECTED', 'REJECTED'),
        ('CANCELLED', 'CANCELLED'),
    ]

    venue = models.CharField(max_length=255)
    facility = models.CharField(max_length=255)
    date = models.DateField()
    startTime = models.CharField(max_length=20)
    endTime = models.CharField(max_length=20)
    purpose = models.TextField()
    requestor = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    phoneNumber = models.CharField(max_length=50)
    selectedEquipment = models.JSONField(default=list)
    equipmentQuantities = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    remarks = models.TextField(blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    attachment = models.TextField(blank=True, null=True) # LongText base64 or similar
    attachmentName = models.CharField(max_length=255, blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requestor} - {self.venue} ({self.date})"

class Inventory(models.Model):
    name = models.CharField(max_length=255)
    available = models.IntegerField()
    venue = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Template(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    subject = models.CharField(max_length=255)
    body = models.TextField()

    def __str__(self):
        return self.id

class CustomUser(models.Model):
    ROLE_CHOICES = [
        ('admin', 'admin'),
        ('super-admin', 'super-admin'),
    ]

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    assignedRegion = models.CharField(max_length=100, blank=True, null=True)
    assignedOffice = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.email

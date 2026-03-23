from django.db import models
from django.utils import timezone

class Gpass(models.Model):
    # Define the fields based on the provided JSON data
    
    userID = models.IntegerField()
    tracknumber = models.CharField(max_length=20, unique=True, blank=True)
    reason = models.CharField(max_length=100)
    specific = models.CharField(max_length=300)
    requestor = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    departure = models.TextField(default='')
    returns = models.TextField(default='')
    to = models.IntegerField(default=0)
    venue = models.TextField(default='')
    signedBy = models.IntegerField(default=0)
    remarks = models.CharField(max_length=100,default='', blank=True)
    status = models.CharField(max_length=20, default='Pending')
    datesubmitted = models.DateField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.tracknumber:
            # Get the current maximum id in the database
            max_id =  Gpass.objects.all().aggregate(max_id=models.Max("id"))["max_id"]
            if max_id is None:
                max_id = 0
            self.tracknumber = 'GPASS' + timezone.now().strftime("%Y") + str(max_id + 1).zfill(3)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

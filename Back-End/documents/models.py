from django.db import models
from django.utils import timezone

class Document(models.Model):
    # Define the fields based on the provided JSON data
    userID = models.IntegerField()
    tracknumber = models.CharField(max_length=20, unique=True, blank=True)
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    requestor = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    to = models.IntegerField(default=0)
    signedBy = models.IntegerField(default=0)
    message = models.TextField(default='')
    remarks = models.CharField(max_length=100,default='')
    datesubmitted = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, default='Pending')
    updatedAt = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.tracknumber:
            # Get the current maximum id in the database
            max_id =  Document.objects.all().aggregate(max_id=models.Max("id"))["max_id"]
            if max_id is None:
                max_id = 0
            self.tracknumber = 'DOC' + timezone.now().strftime("%Y") + str(max_id + 1).zfill(3)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

from django.db import models
class Office(models.Model):
    officeID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    officeMail = models.EmailField(max_length=255)
    street = models.CharField(max_length=300)
    city = models.CharField(max_length=300)
    province = models.CharField(max_length=300)
    region = models.CharField(max_length=300)
    numUsers = models.IntegerField(default=0)

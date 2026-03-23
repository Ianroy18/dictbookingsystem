from rest_framework import serializers
from .models import Office

class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ['officeID', 'name', 'officeMail', 'street', 'city', 'province', 'region', 'numUsers']

    
    


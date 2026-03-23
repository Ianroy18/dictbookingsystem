from rest_framework import serializers
from .models import  Gpass

class  GpassSerializer(serializers.ModelSerializer):
    class Meta:
        model =  Gpass
        fields = ['id','userID','tracknumber', 'reason', 'specific', 'requestor','to','position', 'venue','returns','departure', 'remarks', 'datesubmitted','signedBy', 'status','updatedAt']

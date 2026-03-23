from rest_framework import serializers
from .models import  Document

class  DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model =  Document
        fields = ['id','userID','tracknumber', 'title', 'type', 'requestor','to','position', 'message', 'remarks', 'datesubmitted','signedBy', 'status','updatedAt']

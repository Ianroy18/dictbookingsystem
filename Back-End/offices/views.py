from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Office
from .serializers import OfficeSerializer
from rest_framework import status
from rest_framework.permissions import AllowAny

class OfficeViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    def list(self, request):
        self.check_permissions(request)
        queryset = Office.objects.all()
        serializer = OfficeSerializer(queryset, many=True)
        return Response(serializer.data)
      

    def create(self, request):
        user = request.user
        if user.is_superuser:
            serializer = OfficeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)
        else:
            return Response({"detail": "You do not have permission to perform this action. Ew Feeling Admin hahahaha"}, status=status.HTTP_403_FORBIDDEN)
        
       

    def retrieve(self, request, pk=None):
        queryset = Office.objects.all()
        office = get_object_or_404(queryset, pk=pk)
        serializer = OfficeSerializer(office)
        return Response(serializer.data)

    def update(self, request, pk=None):
        queryset = Office.objects.all()
        office = get_object_or_404(queryset, pk=pk)
        serializer = OfficeSerializer(office, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        user = request.user
        if user.is_superuser:
            queryset = Office.objects.all()
            office = get_object_or_404(queryset, pk=pk)
            office.delete()
            return Response(status=204)
        else:
            return Response({"detail": "You do not have permission to perform this action. Ew Feeling Admin hahahaha"}, status=status.HTTP_403_FORBIDDEN)
            
        
    
    
    

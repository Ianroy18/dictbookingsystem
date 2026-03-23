from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import  Document
from .serializers import  DocumentSerializer
from rest_framework import status



class  DocumentViewSet(viewsets.ModelViewSet):
    queryset =  Document.objects.all().order_by('-id')  # Order by id in descending order
    serializer_class =  DocumentSerializer

    def list(self, request):
        user = request.user
        if user.is_superuser:
            queryset = Document.objects.all().order_by('-id')
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"detail": "You do not have permission to perform this action. Ew Feeling Admin hahahaha"}, status=status.HTTP_403_FORBIDDEN)

    # Define the create operation
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data)

    # Define the retrieve operation
    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # Define the update operation
    def update(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    # Define the delete operation
    def destroy(self, request, pk=None):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=204)

    # Define a custom action to retrieve a letter by tracknumber
    @action(detail=True, methods=['get'])
    def by_tracknumber(self, request, tracknumber=None):
        letter =  Document.objects.get(tracknumber=tracknumber)
        serializer = self.get_serializer(letter)
        return Response(serializer.data)
    
    # Define a custom action to update the signedBy field
    @action(detail=True, methods=['patch'])
    def sign_document(self, request, pk=None):
        remarks = request.data.get('remarks', '')
        try:
            document = Document.objects.get(id=pk)
            document.signedBy = request.user.id
            document.remarks = remarks
            document.status = 'Received'
            document.save()
            serializer = self.get_serializer(document)
            return Response(serializer.data)
        except Document.DoesNotExist:
            return Response({"error": "Document with id {} does not exist".format(pk)}, status=status.HTTP_404_NOT_FOUND)


        
    @action(detail=False, methods=['get'])
    def get_documents(self, request):
        user = request.user
        documents = Document.objects.none()  
        
        if user.acc_lvl >= 0 and user.acc_lvl <= 2:
            documents = Document.objects.all().order_by('-id').filter(to=user.office.officeID)

        user_documents = Document.objects.filter(userID=user.id)
        documents = documents | user_documents  # Merge the two querysets
        
        # Remove duplicates
        documents = documents.distinct()
        
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)


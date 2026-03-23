from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Office, Booking, Inventory, Template, CustomUser, Room
from .serializers import OfficeSerializer, BookingSerializer, InventorySerializer, TemplateSerializer, CustomUserSerializer, RoomSerializer

class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.all()
    serializer_class = OfficeSerializer

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-createdAt')
    serializer_class = BookingSerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def get_queryset(self):
        queryset = CustomUser.objects.all()
        email = self.request.query_params.get('email', None)
        if email is not None:
            queryset = queryset.filter(email=email)
        return queryset

from accounts.models import UserAccount

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Check UserAccount first
    try:
        user = UserAccount.objects.get(email=email)
        # Handle plain text password or hashed
        if user.password == password or user.check_password(password):
            return Response({
                "id": user.id,
                "email": user.email,
                "role": "super-admin" if user.is_superuser else "admin",
                "assignedRegion": user.office.region if user.office else "All",
                "assignedOffice": user.office.name if user.office else "All",
                "first_name": user.first_name,
                "last_name": user.last_name
            })
    except UserAccount.DoesNotExist:
        pass

    try:
        user = CustomUser.objects.get(email=email, password=password)
        serializer = CustomUserSerializer(user)
        return Response(serializer.data)
    except CustomUser.DoesNotExist:
        return Response({"message": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)


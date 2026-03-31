from django.conf import settings
from django.core.mail import send_mail
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Office, Booking, Inventory, Template, CustomUser, Room
from .serializers import OfficeSerializer, BookingSerializer, InventorySerializer, TemplateSerializer, CustomUserSerializer, RoomSerializer

EMAIL_NOTIFICATION_FROM = settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER
ADMIN_NOTIFICATION_EMAIL = EMAIL_NOTIFICATION_FROM

BOOKING_TEMPLATE_MAP = {
    'APPROVED': 'approval',
    'REJECTED': 'rejection',
    'CANCELLED': 'rejection',
    'PENDING': 'notification_to_approver',
}


def get_template_for_status(status):
    template_id = BOOKING_TEMPLATE_MAP.get(status, 'notification_to_approver')
    return Template.objects.filter(pk=template_id).first()


def format_equipment_list(equipment):
    if not equipment:
        return 'None'
    try:
        return ', '.join([f"{item.get('name', 'Item')} (x{item.get('requestedQty', item.get('quantity', 1))})" for item in equipment])
    except Exception:
        return str(equipment)


def render_booking_email(template, booking, status):
    replacements = {
        '{requestor}': booking.requestor or 'Requestor',
        '{venue}': booking.venue or 'Unknown Venue',
        '{date}': booking.date.isoformat() if hasattr(booking.date, 'isoformat') else str(booking.date or ''),
        '{id}': booking.id,
        '{equipment}': format_equipment_list(booking.selectedEquipment),
        '{remarks}': booking.remarks or 'No additional remarks.',
        '{status}': status,
    }

    subject = template.subject
    body = template.body

    for key, value in replacements.items():
        subject = subject.replace(key, str(value))
        body = body.replace(key, str(value))

    return subject, body


def send_booking_notification(booking, status):
    template = get_template_for_status(status)
    if template:
        subject, body = render_booking_email(template, booking, status)
    else:
        subject = f"Booking {status}: {booking.venue or 'Unknown Venue'}"
        body = (
            f"Booking ID: {booking.id}\n"
            f"Requestor: {booking.requestor}\n"
            f"Venue: {booking.venue}\n"
            f"Date: {booking.date}\n"
            f"Status: {status}\n"
            f"Remarks: {booking.remarks or 'No additional remarks.'}\n"
            f"Equipment: {format_equipment_list(booking.selectedEquipment)}"
        )

    recipient_list = [booking.email] if booking.email else []
    if ADMIN_NOTIFICATION_EMAIL and ADMIN_NOTIFICATION_EMAIL.lower() not in [r.lower() for r in recipient_list]:
        recipient_list.append(ADMIN_NOTIFICATION_EMAIL)
    recipient_list = list(dict.fromkeys(recipient_list))

    if not recipient_list:
        return

    try:
        send_mail(subject, body, EMAIL_NOTIFICATION_FROM, recipient_list, fail_silently=False)
        print(f"Booking notification email sent successfully to: {recipient_list} | subject: '{subject}' | status: {status} | booking_id: {booking.id}")
    except Exception as exc:
        print('Booking notification email failed:', exc)


class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.all()
    serializer_class = OfficeSerializer

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-createdAt')
    serializer_class = BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        booking = serializer.instance
        try:
            send_booking_notification(booking, booking.status or 'PENDING')
        except Exception as exc:
            print('Booking create notification failed:', exc)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        old_status = instance.status
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        new_status = serializer.instance.status
        if 'status' in serializer.validated_data and new_status != old_status:
            try:
                send_booking_notification(serializer.instance, new_status)
            except Exception as exc:
                print('Booking status change notification failed:', exc)
        return Response(serializer.data)

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


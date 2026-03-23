from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OfficeViewSet, BookingViewSet, InventoryViewSet, TemplateViewSet, CustomUserViewSet, login, RoomViewSet

router = DefaultRouter()
router.register(r'offices', OfficeViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'templates', TemplateViewSet)
router.register(r'users', CustomUserViewSet)
router.register(r'rooms', RoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api/login/', login, name='login'),
]

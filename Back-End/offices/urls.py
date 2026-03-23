from django.urls import path
from .views import OfficeViewSet

urlpatterns = [
    path('all/',  OfficeViewSet.as_view({'get': 'list', 'post': 'create'}), name='office-list-create'),
    path('<int:pk>/',  OfficeViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='office-detail'),
    # add more paths as needed
]

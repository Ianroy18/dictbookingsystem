from django.urls import path
from . import views
from .views import  DocumentViewSet

urlpatterns = [
    path('all/',  DocumentViewSet.as_view({'get': 'list', 'post': 'create'}), name='letter-list-create'),
    path('',  DocumentViewSet.as_view({'post': 'create'}), name='letter-list-create'),
    path('<int:pk>',  DocumentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='letter-detail'),
    path('tracknumber/<str:tracknumber>',  DocumentViewSet.as_view({'get': 'by_tracknumber'}), name='letter-by-tracknumber'),
    path('by_office/',  DocumentViewSet.as_view({'get': 'get_documents'}), name='letter-get_documents'),
    path('sign_document/<int:pk>', DocumentViewSet.as_view({'patch': 'sign_document'}), name='letter-sign'),
]

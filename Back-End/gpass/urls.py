from django.urls import path
from . import views
from .views import  GpassViewSet

urlpatterns = [
    path('all/',  GpassViewSet.as_view({'get': 'list', 'post': 'create'}), name='letter-list-create'),
    path('',  GpassViewSet.as_view({'post': 'create'}), name='letter-list-create'),
    path('<int:pk>',  GpassViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='letter-detail'),
    path('tracknumber/<str:tracknumber>',  GpassViewSet.as_view({'get': 'by_tracknumber'}), name='letter-by-tracknumber'),
    path('by_office/',  GpassViewSet.as_view({'get': 'get_documents'}), name='letter-get_documents'),
    path('sign_document/<int:pk>', GpassViewSet.as_view({'patch': 'sign_document'}), name='letter-sign'),
]

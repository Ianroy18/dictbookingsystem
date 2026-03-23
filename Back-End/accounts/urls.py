from django.urls import path
from .views import ListUsersView,UserDetailView

urlpatterns = [
    path('all/', ListUsersView.as_view(), name='user-list'),
    path('update/<int:id>/', ListUsersView.as_view(), name='user-detail'),
    path('user/<int:id>/', UserDetailView.as_view(), name='user-detail'),
    # other paths...
]

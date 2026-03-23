from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .serializers import UserCreateSerializer
from rest_framework.generics import RetrieveUpdateAPIView
from django.contrib.auth.hashers import make_password

User = get_user_model()

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .serializers import UserCreateSerializer

User = get_user_model()

class UserDetailView(APIView):
    """
    View to get a user's details in the system using their ID.

    * This view is accessible to anyone.
    """

    def get(self, request, id=None, format=None):
        """
        Return the details of a user.
        """
        try:
            user = User.objects.get(id=id)
            serializer = UserCreateSerializer(user)
            user_data = serializer.data
            office_name = user.office.name
            response_data = f"{user_data['first_name'].capitalize()} {user_data['last_name'].capitalize()} | {user_data['position']} |  {office_name}"
            return Response({"detail": response_data})
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class ListUsersView(APIView):
    """
    View to list all users in the system.

    * Only superusers are able to access this view.
    """

    def get(self, request, format=None):
        """
        Return a list of all users.
        """
        # Check if the user is a superuser
        if request.user.is_superuser:
            users = User.objects.all()
            serializer = UserCreateSerializer(users, many=True)
            return Response(serializer.data)
        else:
            return Response({"detail": "You do not have permission to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)

    def put(self, request, id=None, format=None):
        """
        Update a user.
        """
        # Check if the user is a superuser
        if request.user.is_superuser:
            user = User.objects.get(id=id)
            data = request.data.copy()  # copy the request data

            # Check if the password is in the request data
            password = data.get('password')
            if password:
                data['password'] = make_password(password)  # hash the password

            serializer = UserCreateSerializer(user, data=data, partial=True)  # set partial=True to update a subset of the fields
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"detail": "You do not have permission to perform this action."},
                            status=status.HTTP_403_FORBIDDEN)
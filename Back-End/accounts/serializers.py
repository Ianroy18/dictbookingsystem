from djoser.serializers import UserCreateSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from rest_framework import serializers as drf_serializers
from rest_framework.settings import api_settings

User = get_user_model()

#For creating user accounts
class UserCreateSerializer(UserCreateSerializer):


    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'password', 'position','office', 'acc_lvl', 'is_active', 'is_staff' )


    # Admin update user: Overriding the password validation to avoid attribute error when the password is empty
    def validate(self, attrs):
        user = User(**attrs)
        password = attrs.get("password")

        if password is not None:
            try:
                validate_password(password, user)
            except django_exceptions.ValidationError as e:
                serializer_error = drf_serializers.as_serializer_error(e)
                raise drf_serializers.ValidationError(
                    {"password": serializer_error[api_settings.NON_FIELD_ERRORS_KEY]}
                )

        return attrs
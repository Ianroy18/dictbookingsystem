from django.contrib.auth.tokens import default_token_generator

from djoser.email import ActivationEmail

from djoser import utils
from djoser.conf import settings
# For account activation using email address
class CustomeActivationEmail(ActivationEmail):
    template_name = "email/activation.html"

    def get_context_data(self):
        # ActivationEmail can be deleted
        context = super().get_context_data()

        user = context.get("user")
        context["uid"] = utils.encode_uid(user.pk)
        context["token"] = default_token_generator.make_token(user)
        context["url"] = settings.ACTIVATION_URL.format(**context)
        return context

#For  Confirmation in email
class ConfirmationEmail(ActivationEmail):
    template_name = "email/confirmation.html"

#For resetting password
class PasswordResetEmail(ActivationEmail):
    template_name = "email/password_reset.html"

    def get_context_data(self):
        # PasswordResetEmail can be deleted
        context = super().get_context_data()

        user = context.get("user")
        context["uid"] = utils.encode_uid(user.pk)
        context["token"] = default_token_generator.make_token(user)
        context["url"] = settings.PASSWORD_RESET_CONFIRM_URL.format(**context)
        return context

# //after reset
# For password confirmation in changing user password

class PasswordChangedConfirmationEmail(ActivationEmail):
    template_name = "email/password_changed_confirmation.html"
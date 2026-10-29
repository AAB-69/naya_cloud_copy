from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import CloudService, UserSubscription
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    CloudServiceSerializer,
    UserSubscriptionSerializer,
)


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Registers a new user, saves extended profile info, and returns auth token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "User registered successfully.",
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Validates username and password, returns authentication token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "Login successful.",
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    """
    GET /api/auth/user/
    Returns currently authenticated user profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(
            {
                "user": serializer.data,
                "status": "authenticated"
            },
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Invalidates authentication token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except (AttributeError, Token.DoesNotExist):
            pass

        return Response(
            {"message": "Successfully logged out."},
            status=status.HTTP_200_OK
        )


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier', '').strip()
        if not identifier:
            return Response(
                {"error": "Please provide your username or email address."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": f"If an account exists for '{identifier}', password reset instructions have been sent."
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# NAYATEL CLOUD SERVICES & SUBSCRIPTIONS APIs
# ============================================================

class CloudServicesListView(APIView):
    """
    GET /api/services/
    Returns list of all available Nayatel Cloud services, specs, and pricing.
    Publicly accessible so prospective customers can view catalog.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        services = CloudService.objects.filter(is_active=True).order_by('category', 'price_pkr')
        serializer = CloudServiceSerializer(services, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserSubscriptionsView(APIView):
    """
    GET /api/subscriptions/
    Returns list of services the authenticated user has applied to or subscribed to.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subscriptions = UserSubscription.objects.filter(user=request.user)
        serializer = UserSubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CheckoutSubscriptionView(APIView):
    """
    POST /api/subscriptions/checkout/
    Subscribes the authenticated user to one or multiple selected cloud services.
    Request body: { "service_ids": [1, 3], "custom_notes": "Deployment for e-commerce" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        service_ids = request.data.get('service_ids', [])
        notes = request.data.get('custom_notes', '')

        if not service_ids or not isinstance(service_ids, list):
            return Response(
                {"error": "Please provide a list of service_ids to subscribe to."},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_subscriptions = []
        for sid in service_ids:
            try:
                service = CloudService.objects.get(id=sid, is_active=True)
                sub = UserSubscription.objects.create(
                    user=request.user,
                    service=service,
                    status='active',
                    custom_notes=notes
                )
                created_subscriptions.append(sub)
            except CloudService.DoesNotExist:
                continue

        serializer = UserSubscriptionSerializer(created_subscriptions, many=True)
        return Response(
            {
                "message": f"Successfully subscribed to {len(created_subscriptions)} service(s)!",
                "subscriptions": serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class CancelSubscriptionView(APIView):
    """
    POST /api/subscriptions/<int:sub_id>/cancel/
    Removes or cancels a user's subscription (cross-off item).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, sub_id):
        try:
            sub = UserSubscription.objects.get(id=sub_id, user=request.user)
            sub.status = 'cancelled'
            sub.save()
            # Or sub.delete() if full removal is desired
            return Response(
                {"message": f"Subscription to {sub.service.name} has been cancelled."},
                status=status.HTTP_200_OK
            )
        except UserSubscription.DoesNotExist:
            return Response(
                {"error": "Subscription not found."},
                status=status.HTTP_404_NOT_FOUND
            )

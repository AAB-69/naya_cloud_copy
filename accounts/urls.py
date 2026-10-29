from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    UserDetailView,
    LogoutView,
    ForgotPasswordView,
    CloudServicesListView,
    UserSubscriptionsView,
    CheckoutSubscriptionView,
    CancelSubscriptionView,
)

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/user/', UserDetailView.as_view(), name='user-detail'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),

    # Services catalog & subscription endpoints
    path('services/', CloudServicesListView.as_view(), name='services-list'),
    path('subscriptions/', UserSubscriptionsView.as_view(), name='user-subscriptions'),
    path('subscriptions/checkout/', CheckoutSubscriptionView.as_view(), name='checkout-subscription'),
    path('subscriptions/<int:sub_id>/cancel/', CancelSubscriptionView.as_view(), name='cancel-subscription'),
]

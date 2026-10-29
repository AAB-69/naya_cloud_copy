"""
URL configuration for django_rest_main project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Master API router: /api/auth/*, /api/services/*, /api/subscriptions/*
    path('api/', include('accounts.urls')),
]

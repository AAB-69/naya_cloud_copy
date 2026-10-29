from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import UserProfile, CloudService, UserSubscription


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['full_name', 'phone', 'company']


class UserSerializer(serializers.ModelSerializer):
    """
    Public user profile details including extended Nayatel customer profile.
    """
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'profile']


class RegisterSerializer(serializers.ModelSerializer):
    """
    User registration serializer with extended Nayatel customer fields.
    """
    email = serializers.EmailField(required=True)
    full_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    company = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=6
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Confirm Password'
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'phone', 'company', 'password', 'password2']

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        full_name = validated_data.pop('full_name', '')
        phone = validated_data.pop('phone', '')
        company = validated_data.pop('company', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Update profile
        if hasattr(user, 'profile'):
            user.profile.full_name = full_name
            user.profile.phone = phone
            user.profile.company = company or 'Individual Account'
            user.profile.save()

        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer to authenticate an existing user using username and password.
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError("Both username and password are required.")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please check your username and password.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been disabled.")

        data['user'] = user
        return data


class CloudServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for Nayatel Cloud catalog items.
    """
    class Meta:
        model = CloudService
        fields = '__all__'


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for subscribed services with nested service details.
    """
    service = CloudServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=CloudService.objects.all(),
        source='service',
        write_only=True
    )

    class Meta:
        model = UserSubscription
        fields = ['id', 'service', 'service_id', 'status', 'subscribed_at', 'custom_notes']

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Extends the built-in Django User model with Nayatel customer information.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=25, blank=True)
    company = models.CharField(max_length=150, blank=True, default='Individual Account')

    def __str__(self):
        return f"{self.user.username} ({self.full_name or 'No Name'})"


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()


class CloudService(models.Model):
    """
    Nayatel Cloud Services Catalog.
    Organized by Main Service Category with multiple plan/tier options.
    """
    CATEGORY_CHOICES = [
        ('IAAS', 'IAAS (Infrastructure as a Service)'),
        ('CUBES', 'CUBES (Container as a Service)'),
        ('DB as a Service', 'DB as a Service (Managed Databases)'),
        ('Cloud Storage', 'Cloud & Object Storage'),
        ('WEB-HOSTING', 'WEB-HOSTING (Fast Web Hosting & SSL)'),
        ('NMAIL', 'NMAIL (Secure Business Email)'),
        ('DOMAIN', 'DOMAIN (Domain Name Registration)'),
    ]

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='IAAS')
    name = models.CharField(max_length=150)
    tagline = models.CharField(max_length=255, blank=True)
    specs = models.CharField(max_length=250, help_text="e.g. 4 vCPUs, 8GB RAM, 160GB NVMe SSD")
    description = models.TextField()
    price_pkr = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price in PKR")
    billing_cycle = models.CharField(max_length=30, default='Monthly')
    action_button_label = models.CharField(max_length=50, default='See Details')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"[{self.category}] {self.name} - PKR {self.price_pkr}"


class UserSubscription(models.Model):
    """
    Tracks which Nayatel Cloud services a user has subscribed / applied to.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending Approval'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    service = models.ForeignKey(CloudService, on_delete=models.CASCADE, related_name='subscriptions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    subscribed_at = models.DateTimeField(auto_now_add=True)
    custom_notes = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-subscribed_at']

    def __str__(self):
        return f"{self.user.username} -> {self.service.name} [{self.status}]"

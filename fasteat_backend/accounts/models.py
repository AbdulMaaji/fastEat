from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    USER_ROLES = (
        ('customer', 'Customer'),
        ('vendor', 'Vendor'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    )

    role = models.CharField(max_length=20, choices=USER_ROLES, default='customer')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
from django.db import models

class Vendor(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    avatar = models.URLField(max_length=1000, blank=True)
    cover_image = models.URLField(max_length=1000, blank=True)
    is_open = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    rating = models.FloatField(default=0.0)
    rating_count = models.IntegerField(default=0)
    followers = models.IntegerField(default=0)
    delivery_enabled = models.BooleanField(default=True)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    min_delivery_time = models.IntegerField(default=15)
    max_delivery_time = models.IntegerField(default=45)
    
    # Store location as JSON for simplicity: {lat: float, lng: float, address: str}
    location = models.JSONField(default=dict)
    
    owner_user_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

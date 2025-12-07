from django.db import models
from restaurants.models import Vendor

class MenuItem(models.Model):
    vendor = models.ForeignKey(Vendor, related_name='menu_items', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.URLField(max_length=1000, blank=True)
    ingredients = models.JSONField(default=list)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

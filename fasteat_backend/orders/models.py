from django.db import models
from restaurants.models import Vendor
from menu.models import MenuItem

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'PENDING'),
        ('PREPARING', 'PREPARING'),
        ('READY', 'READY'),
        ('AWAITING_ACCEPTANCE', 'AWAITING_ACCEPTANCE'),
        ('DRIVER_ASSIGNED', 'DRIVER_ASSIGNED'),
        ('PICKED_UP', 'PICKED_UP'),
        ('NEARBY', 'NEARBY'),
        ('ARRIVED', 'ARRIVED'),
        ('COMPLETED', 'COMPLETED'),
        ('CANCELLED', 'CANCELLED'),
    ]
    
    TYPE_CHOICES = [
        ('PICKUP', 'PICKUP'),
        ('DELIVERY', 'DELIVERY'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    vendor = models.ForeignKey(Vendor, related_name='orders', on_delete=models.CASCADE)
    customer_id = models.CharField(max_length=100)
    driver_id = models.CharField(max_length=100, blank=True, null=True)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='PICKUP')
    
    total = models.DecimalField(max_digits=8, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    preferred_time = models.CharField(max_length=100, blank=True) # Accepting timestamp string
    
    delivery_location = models.JSONField(blank=True, null=True)
    points_redeemed = models.IntegerField(default=0)
    points_earned = models.IntegerField(default=0)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    def __str__(self):
        return f"Order {self.id} - {self.vendor.name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, related_name='order_items', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    
    # Snapshot price in case menu price changes
    price_at_time = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} in {self.order.id}"

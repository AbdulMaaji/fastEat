from django.core.management.base import BaseCommand
from restaurants.models import Vendor
from menu.models import MenuItem

class Command(BaseCommand):
    help = 'Seeds database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # Vendor 1: Burger King
        v1, _ = Vendor.objects.get_or_create(
            name="Burger King",
            defaults={
                "bio": "Home of the Whopper",
                "avatar": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80",
                "cover_image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000&q=80",
                "rating": 4.5,
                "rating_count": 120,
                "delivery_fee": 2.99,
                "min_delivery_time": 20,
                "max_delivery_time": 35,
                "location": {"lat": 37.7749, "lng": -122.4194, "address": "Market St, SF"}
            }
        )
        
        MenuItem.objects.get_or_create(
            vendor=v1,
            name="Whopper Meal",
            defaults={
                "description": "Flame-grilled beef patty with fresh ingredients",
                "price": 9.99,
                "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
                "ingredients": ["Beef", "Lettuce", "Tomato", "Mayo"]
            }
        )

        MenuItem.objects.get_or_create(
            vendor=v1,
            name="Chicken Fries",
            defaults={
                "description": "Crispy chicken strips",
                "price": 5.49,
                "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80",
                "ingredients": ["Chicken", "Breading"]
            }
        )

        # Vendor 2: Pizza Hut
        v2, _ = Vendor.objects.get_or_create(
            name="Pizza Hut",
            defaults={
                "bio": "No One OutPizzas the Hut",
                "avatar": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80",
                "cover_image": "https://images.unsplash.com/photo-1574126154517-d1e0d89e734e?w=1000&q=80",
                "rating": 4.2,
                "rating_count": 89,
                "delivery_fee": 3.99,
                "min_delivery_time": 30,
                "max_delivery_time": 50,
                "location": {"lat": 37.7849, "lng": -122.4094, "address": "Union Square, SF"}
            }
        )
        
        MenuItem.objects.get_or_create(
            vendor=v2,
            name="Pepperoni Pizza",
            defaults={
                "description": "Classic pepperoni pizza",
                "price": 14.99,
                "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80",
                "ingredients": ["Dough", "Tomato Sauce", "Cheese", "Pepperoni"]
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))

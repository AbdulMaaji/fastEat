from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from restaurants.views import VendorViewSet
from orders.views import OrderViewSet

router = DefaultRouter()
router.register(r'vendors', VendorViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

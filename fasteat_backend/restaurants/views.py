from rest_framework import serializers, viewsets
from .models import Vendor
from menu.models import MenuItem

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class VendorSerializer(serializers.ModelSerializer):
    menu = MenuItemSerializer(many=True, read_only=True, source='menu_items')

    class Meta:
        model = Vendor
        fields = '__all__'

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

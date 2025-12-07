from rest_framework import serializers, viewsets
from .models import Order, OrderItem
from menu.models import MenuItem

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source='menu_item', write_only=True
    )
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item_id', 'quantity', 'price_at_time']
        read_only_fields = ['price_at_time']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['total']  # We calculate total on server usually

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate total if not provided (or overwrite it)
        # For simplicity trusting frontend total or calculating?
        # Let's calculate from items to be safe.
        total = 0
        order = Order.objects.create(**validated_data, total=0)
        
        for item_data in items_data:
            menu_item = item_data['menu_item']
            quantity = item_data['quantity']
            price = menu_item.price
            total += price * quantity
            
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=quantity,
                price_at_time=price
            )
            
        order.total = total
        order.save()
        
        return order

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

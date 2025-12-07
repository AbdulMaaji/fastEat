import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingBag, MapPin, ChevronRight, Minus, Plus, Store, Truck, Clock, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../types';

const OrdersPage: React.FC = () => {
    const {
        cart,
        vendors,
        updateCartQuantity,
        userProfile,
        setOrders,
        setCart,
        setUserProfile,
        currentDriver
    } = useAppContext();

    const navigate = useNavigate();

    const [orderType, setOrderType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
    const [preferredOrderTime, setPreferredOrderTime] = useState<string>('ASAP');

    const activeCartVendorId = cart.length > 0 ? cart[0].vendorId : null;
    const activeCartVendor = activeCartVendorId ? vendors.find(v => v.id === activeCartVendorId) : null;

    // Time slots
    const timeSlots = useMemo(() => {
        const slots = [{ label: 'ASAP (Standard)', value: 'ASAP' }];
        const now = new Date();
        const remainder = 15 - (now.getMinutes() % 15);
        const start = new Date(now.getTime() + remainder * 60000);
        for (let i = 0; i < 8; i++) {
            const slotTime = new Date(start.getTime() + i * 15 * 60000);
            slots.push({
                label: slotTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                value: slotTime.getTime().toString()
            });
        }
        return slots;
    }, []);

    const calculatePointsDiscount = (vendorId: string, points: number) => {
        return points * 0.10;
    };

    const handleCheckout = () => {
        if (cart.length === 0 || !activeCartVendorId) return;

        const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
        const vendor = vendors.find(v => v.id === activeCartVendorId);

        const deliveryCost = orderType === 'DELIVERY' && vendor && vendor.deliveryEnabled
            ? vendor.deliveryFee
            : 0;

        let discount = 0;
        let pointsToDeduct = 0;

        if (orderType === 'DELIVERY' && useLoyaltyPoints) {
            const availablePoints = userProfile.loyaltyPoints[activeCartVendorId] || 0;
            const maxDiscount = calculatePointsDiscount(activeCartVendorId, availablePoints);
            discount = maxDiscount;

            if (discount > (cartTotal + deliveryCost)) {
                discount = cartTotal + deliveryCost;
            }
            pointsToDeduct = availablePoints;
        }

        const finalTotal = Math.max(0, cartTotal + deliveryCost - discount);
        const pointsEarned = Math.floor(cartTotal);

        setUserProfile(prev => {
            const current = prev.loyaltyPoints[activeCartVendorId] || 0;
            const newBalance = current - pointsToDeduct + pointsEarned;
            return {
                ...prev,
                loyaltyPoints: {
                    ...prev.loyaltyPoints,
                    [activeCartVendorId]: Math.max(0, newBalance)
                }
            };
        });

        const scheduledTime = preferredOrderTime === 'ASAP' ? Date.now() : parseInt(preferredOrderTime);

        const newOrder: Order = {
            id: `ord-${Date.now()}`,
            vendorId: activeCartVendorId,
            customerId: 'user-1',
            items: [...cart],
            total: finalTotal,
            status: OrderStatus.PREPARING,
            type: orderType,
            timestamp: Date.now(),
            preferredTime: scheduledTime,
            deliveryLocation: orderType === 'DELIVERY' ? { address: deliveryAddress || 'Current Location' } : undefined,
            pointsRedeemed: pointsToDeduct,
            pointsEarned: pointsEarned,
            deliveryFee: deliveryCost
        };

        setOrders(prev => [newOrder, ...prev]);
        setCart([]);
        setUseLoyaltyPoints(false);
        setPreferredOrderTime('ASAP');

        // Simulate acceptance delay
        if (orderType === 'DELIVERY') {
            setTimeout(() => {
                setOrders(prev => prev.map(o =>
                    o.id === newOrder.id
                        ? { ...o, status: OrderStatus.READY }
                        : o
                ));
            }, 5000);
        }

        // Navigate to history or tracking?
        // navigate('/history');
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const deliveryFee = activeCartVendor && activeCartVendor.deliveryEnabled && orderType === 'DELIVERY' ? activeCartVendor.deliveryFee : 0;

    let pointsDiscount = 0;
    if (orderType === 'DELIVERY' && activeCartVendorId && useLoyaltyPoints) {
        const points = userProfile.loyaltyPoints[activeCartVendorId] || 0;
        pointsDiscount = calculatePointsDiscount(activeCartVendorId, points);
        if (pointsDiscount > (subtotal + deliveryFee)) pointsDiscount = subtotal + deliveryFee;
    }
    const total = Math.max(0, subtotal + deliveryFee - pointsDiscount);

    const driverAvailability = orderType === 'DELIVERY' && currentDriver?.isOnline
        ? `Driver online until ${currentDriver.workingHours.end}`
        : 'No drivers available';

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <ShoppingBag size={64} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Your bag is empty</p>
                <button onClick={() => navigate('/feed')} className="mt-4 bg-brand-orange text-white px-6 py-2 rounded-full font-bold text-sm">Start Ordering</button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-24 p-4">
            {/* Vendor Header */}
            <div className="flex items-start justify-between mb-5 border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-brand-dark">{activeCartVendor?.name}</h2>
                    <p className="text-xs text-gray-500 font-medium">{cart.length} items</p>
                </div>
                <button
                    onClick={() => navigate('/map')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                >
                    <MapPin size={12} className="text-brand-orange" />
                    <span className="text-[10px] font-bold">{activeCartVendor?.location.address}</span>
                    <ChevronRight size={12} className="text-gray-400" />
                </button>
            </div>

            {/* Items */}
            <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <img src={item.menuItem.image} className="w-16 h-16 rounded-xl object-cover bg-gray-100" alt={item.menuItem.name} />
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <h3 className="font-bold text-sm text-gray-900">{item.menuItem.name}</h3>
                                <span className="font-bold text-sm text-brand-dark">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">{item.menuItem.description}</p>

                            <div className="flex items-center bg-gray-50 rounded-lg w-max p-1">
                                <button
                                    onClick={() => updateCartQuantity(item.menuItem.id, -1)}
                                    className="p-1 hover:bg-white rounded-md transition-colors"
                                >
                                    <Minus size={14} className="text-gray-500" />
                                </button>
                                <span className="mx-3 text-xs font-bold">{item.quantity}</span>
                                <button
                                    onClick={() => updateCartQuantity(item.menuItem.id, 1)}
                                    className="p-1 hover:bg-white rounded-md transition-colors"
                                >
                                    <Plus size={14} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delivery Options */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex bg-white p-1 rounded-xl mb-4 shadow-sm">
                    <button
                        onClick={() => setOrderType('PICKUP')}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${orderType === 'PICKUP' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Store size={14} /> Pickup
                    </button>
                    <button
                        onClick={() => setOrderType('DELIVERY')}
                        disabled={!activeCartVendor?.deliveryEnabled}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${orderType === 'DELIVERY' ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'} ${!activeCartVendor?.deliveryEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Truck size={14} /> Delivery
                    </button>
                </div>

                {/* Scheduled Time Selector */}
                <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={16} />
                        <span className="text-xs font-bold">Time</span>
                    </div>
                    <select
                        value={preferredOrderTime}
                        onChange={(e) => setPreferredOrderTime(e.target.value)}
                        className="text-xs font-bold text-brand-dark bg-transparent focus:outline-none text-right cursor-pointer"
                    >
                        {timeSlots.map(slot => (
                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                    </select>
                </div>

                {orderType === 'DELIVERY' ? (
                    <div className="space-y-3">
                        <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-700 flex items-center"><MapPin size={14} className="mr-1" /> Delivery Address</span>
                                <button className="text-[10px] font-bold text-brand-orange flex items-center">
                                    Use Current
                                </button>
                            </div>
                            <div className="relative">
                                <select
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    className="w-full bg-gray-50 text-xs font-medium p-2 rounded-lg border-none focus:ring-0 text-brand-dark"
                                >
                                    <option value="">Select an address...</option>
                                    {userProfile.savedAddresses.map(addr => (
                                        <option key={addr.id} value={addr.address}>{addr.label}: {addr.address}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {activeCartVendorId && userProfile.loyaltyPoints[activeCartVendorId] > 0 && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-indigo-900 flex items-center"><Gift size={12} className="mr-1" /> Use Loyalty Points</p>
                                    <p className="text-[10px] text-indigo-700">Balance: {userProfile.loyaltyPoints[activeCartVendorId]} pts</p>
                                </div>
                                <button
                                    onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
                                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${useLoyaltyPoints ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full transition-transform ${useLoyaltyPoints ? 'translate-x-5' : ''}`}></div>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-gray-700 mb-1">Pickup Location</p>
                        <p className="text-xs text-gray-500">{activeCartVendor?.location.address}</p>
                    </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
                    <Clock size={12} />
                    {orderType === 'PICKUP'
                        ? 'Est. pickup in 15-20 mins'
                        : `Est. delivery: ${activeCartVendor?.minDeliveryTime}-${activeCartVendor?.maxDeliveryTime} mins • ${driverAvailability}`
                    }
                </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                {orderType === 'DELIVERY' && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery Fee</span>
                        <span className="font-bold">${deliveryFee.toFixed(2)}</span>
                    </div>
                )}
                {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm text-indigo-600">
                        <span className="font-medium">Loyalty Discount</span>
                        <span className="font-bold">-${pointsDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-base pt-2 border-t border-gray-100">
                    <span className="font-bold text-brand-dark">Total</span>
                    <span className="font-black text-brand-orange text-xl">${total.toFixed(2)}</span>
                </div>
            </div>

            <button
                onClick={handleCheckout}
                disabled={orderType === 'DELIVERY' && !deliveryAddress}
                className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
            >
                Checkout
            </button>
        </div>
    );
};

export default OrdersPage;


import React, { useState, useMemo } from 'react';
import { X, MapPin, Store, Truck, ShoppingBag, Gift, Clock } from 'lucide-react';
import { CartItem, Vendor } from '../types';

interface QuickCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onPlaceOrder: (type: 'PICKUP' | 'DELIVERY', address?: string, pointsRedeemed?: number, preferredTime?: number) => void;
  vendor?: Vendor;
  userPoints: number;
}

const QuickCheckoutModal: React.FC<QuickCheckoutModalProps> = ({ isOpen, onClose, items, onPlaceOrder, vendor, userPoints }) => {
  const [orderType, setOrderType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [address, setAddress] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('ASAP');

  // Generate time slots
  const timeSlots = useMemo(() => {
      const slots = [{ label: 'ASAP (Standard)', value: 'ASAP' }];
      const now = new Date();
      // Round up to next 15 min
      const remainder = 15 - (now.getMinutes() % 15);
      const start = new Date(now.getTime() + remainder * 60000);
      
      // Generate next 8 slots (2 hours)
      for(let i = 0; i < 8; i++) {
          const slotTime = new Date(start.getTime() + i * 15 * 60000);
          slots.push({
              label: slotTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
              value: slotTime.getTime().toString()
          });
      }
      return slots;
  }, []);

  if (!isOpen || !vendor) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const deliveryFee = (orderType === 'DELIVERY' && vendor.deliveryEnabled) ? vendor.deliveryFee : 0;
  
  // Discount Logic: 1 Point = $0.10 discount (example)
  const POINT_VALUE = 0.10;
  const potentialDiscount = userPoints * POINT_VALUE;
  
  // Discount applies if Delivery selected and toggle ON
  const discount = (usePoints && orderType === 'DELIVERY') ? potentialDiscount : 0;
  const pointsToUse = usePoints ? userPoints : 0;

  const total = Math.max(0, subtotal + deliveryFee - discount);

  const handlePlaceOrder = () => {
      const time = selectedTimeSlot === 'ASAP' ? Date.now() : parseInt(selectedTimeSlot);
      onPlaceOrder(orderType, address, usePoints ? pointsToUse : 0, time);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 relative z-10 animate-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-brand-dark">Quick Checkout</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        </div>

        {/* Vendor Info */}
        <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-xl">
            <img src={vendor.avatar} className="w-10 h-10 rounded-full object-cover mr-3" alt={vendor.name}/>
            <div>
                <h3 className="font-bold text-sm text-brand-dark">{vendor.name}</h3>
                <p className="text-xs text-gray-500">{items.length} items</p>
            </div>
        </div>

        {/* Items */}
        <div className="max-h-[20vh] overflow-y-auto mb-6 space-y-3 pr-1">
            {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                         <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-xs mr-2">{item.quantity}x</span>
                         <span className="text-gray-700">{item.menuItem.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        {/* Delivery Toggle */}
        {vendor.deliveryEnabled ? (
            <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                <button
                    onClick={() => setOrderType('PICKUP')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${orderType === 'PICKUP' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500'}`}
                >
                    <Store size={14}/> Pickup
                </button>
                <button
                    onClick={() => setOrderType('DELIVERY')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${orderType === 'DELIVERY' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500'}`}
                >
                    <Truck size={14}/> Delivery
                </button>
            </div>
        ) : (
             <div className="bg-orange-50 text-orange-700 text-xs font-bold p-3 rounded-xl mb-4 text-center flex items-center justify-center gap-2">
                <Store size={14}/> Pickup Only
            </div>
        )}

        {/* Time Selector */}
        <div className="mb-4">
             <div className="relative">
                 <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                 <select
                     value={selectedTimeSlot}
                     onChange={(e) => setSelectedTimeSlot(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-orange appearance-none"
                 >
                     {timeSlots.map(slot => (
                         <option key={slot.value} value={slot.value}>{slot.label}</option>
                     ))}
                 </select>
             </div>
        </div>

        {/* Address Input */}
        {orderType === 'DELIVERY' && (
            <div className="mb-4">
                <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Delivery Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-orange"
                    />
                </div>
            </div>
        )}
        
        {/* Loyalty Points Redemption */}
        {orderType === 'DELIVERY' && userPoints > 0 && (
             <div className="bg-indigo-50 rounded-xl p-3 mb-4 flex justify-between items-center">
                 <div>
                     <p className="text-xs font-bold text-indigo-900 flex items-center"><Gift size={14} className="mr-1.5"/> Loyalty Discount</p>
                     <p className="text-[10px] text-indigo-700">Available: {userPoints} points (${potentialDiscount.toFixed(2)})</p>
                 </div>
                 <button 
                    onClick={() => setUsePoints(!usePoints)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${usePoints ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                    <div className={`bg-white w-4 h-4 rounded-full transition-transform ${usePoints ? 'translate-x-5' : ''}`}></div>
                </button>
             </div>
        )}

        {/* Totals */}
        <div className="flex justify-between items-end mb-6">
            <div>
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-black text-brand-dark">${total.toFixed(2)}</p>
            </div>
            <div className="text-right">
                 {orderType === 'DELIVERY' && vendor.deliveryEnabled && (
                      <p className="text-xs text-gray-400 mb-0.5">+ ${deliveryFee.toFixed(2)} Delivery</p>
                 )}
                 {discount > 0 && (
                      <p className="text-xs text-indigo-600 font-bold">- ${discount.toFixed(2)} Points</p>
                 )}
            </div>
        </div>

        <button
            onClick={handlePlaceOrder}
            disabled={orderType === 'DELIVERY' && !address}
            className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-orange-600 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
            <ShoppingBag size={18}/> Place Order
        </button>
      </div>
    </div>
  );
};

export default QuickCheckoutModal;

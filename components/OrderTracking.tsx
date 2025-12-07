import React from 'react';
import { Order, OrderStatus, Vendor, Driver } from '../types';
import { ArrowLeft, Phone, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import RouteMap from './RouteMap';

interface OrderTrackingProps {
    order: Order;
    vendor: Vendor;
    driver?: Driver;
    onBack: () => void;
    onConfirmDelivery?: (orderId: string) => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ order, vendor, driver, onBack }) => {

    const getStatusLabel = (status: OrderStatus) => {
        switch(status) {
            case OrderStatus.PREPARING: return 'Preparing your order';
            case OrderStatus.DRIVER_ASSIGNED: return 'Driver assigned';
            case OrderStatus.PICKED_UP: return 'On the way';
            case OrderStatus.NEARBY: return 'Driver is nearby';
            case OrderStatus.ARRIVED: return 'Driver has arrived';
            default: return 'Processing';
        }
    };

    const getStatusDescription = (status: OrderStatus) => {
         switch(status) {
            case OrderStatus.PREPARING: return `${vendor.name} is cooking up your meal.`;
            case OrderStatus.DRIVER_ASSIGNED: return `${driver?.name || 'A driver'} is heading to the restaurant.`;
            case OrderStatus.PICKED_UP: return 'Your food is on the move!';
            case OrderStatus.NEARBY: return 'Get ready to eat!';
            case OrderStatus.ARRIVED: return 'Meet your driver at the door.';
            default: return 'We have received your order.';
        }
    };

    return (
        <div className="bg-white min-h-screen pb-24 relative z-50">
            {/* Map Simulation Area */}
            <div className="relative w-full h-[45vh] bg-slate-100">
                
                {/* Back Button */}
                <button onClick={onBack} className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md z-20 hover:bg-gray-50">
                    <ArrowLeft size={20} className="text-brand-dark"/>
                </button>

                {/* Route Map Component */}
                <RouteMap 
                    status={order.status} 
                    vendorAvatar={vendor.avatar}
                    customerAddress={order.deliveryLocation?.address}
                    isDriverView={false}
                    vendorCoords={vendor.location}
                    customerCoords={order.deliveryLocation}
                />
            </div>

            {/* Tracking Sheet */}
            <div className="-mt-6 bg-white rounded-t-3xl relative z-10 px-6 py-8 min-h-[55vh] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                 <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>

                 {/* Status Header */}
                 <div className="mb-8 text-center">
                     <h1 className="text-2xl font-bold text-brand-dark mb-1 animate-pulse">
                         {getStatusLabel(order.status)}
                     </h1>
                     <p className="text-gray-500 text-sm">
                         {getStatusDescription(order.status)}
                     </p>
                     <div className="mt-2 inline-flex items-center bg-gray-100 px-3 py-1 rounded-full">
                         <Clock size={12} className="mr-1.5 text-gray-500"/>
                         <span className="text-xs font-bold text-gray-700">Est. Arrival: 12:45 PM</span>
                     </div>
                 </div>

                 {/* Driver Card */}
                 {driver && (
                     <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-8 flex items-center justify-between">
                         <div className="flex items-center">
                             <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden border-2 border-white shadow-sm">
                                 <img src={driver.avatar} className="w-full h-full object-cover" alt="Driver"/>
                             </div>
                             <div>
                                 <h3 className="font-bold text-gray-900">{driver.name}</h3>
                                 <div className="flex items-center text-xs text-gray-500">
                                     <span>{driver.vehicle}</span>
                                 </div>
                             </div>
                         </div>
                         <div className="flex gap-2">
                             <button className="p-2.5 bg-white rounded-full shadow-sm text-brand-dark hover:bg-gray-100">
                                 <MessageSquare size={18}/>
                             </button>
                             <button className="p-2.5 bg-brand-dark rounded-full shadow-sm text-white hover:bg-gray-800">
                                 <Phone size={18}/>
                             </button>
                         </div>
                     </div>
                 )}

                 {/* Confirm Received for Customer */}
                 {(order.status === OrderStatus.ARRIVED || order.status === OrderStatus.NEARBY) && onConfirmDelivery && (
                     <div className="mt-6">
                         <button onClick={() => onConfirmDelivery(order.id)} className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold">Confirm Received</button>
                     </div>
                 )}

                 {/* Timeline */}
                 <div className="space-y-6 pl-2 relative border-l-2 border-gray-100 ml-2">
                     {[
                         { s: OrderStatus.PREPARING, l: 'Order Confirmed', t: '12:10 PM' },
                         { s: OrderStatus.PICKED_UP, l: 'Driver Picked Up', t: '12:25 PM' },
                         { s: OrderStatus.ARRIVED, l: 'Arrived at Location', t: '---' },
                     ].map((step, i) => {
                         const isCompleted = [OrderStatus.PICKED_UP, OrderStatus.NEARBY, OrderStatus.ARRIVED, OrderStatus.COMPLETED].includes(order.status) && step.s !== OrderStatus.ARRIVED 
                                             || order.status === OrderStatus.ARRIVED && step.s === OrderStatus.ARRIVED
                                             || order.status === OrderStatus.PREPARING && step.s === OrderStatus.PREPARING;

                         return (
                             <div key={i} className="relative pl-6">
                                 <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-brand-orange border-brand-orange' : 'bg-white border-gray-300'}`}>
                                     {isCompleted && <CheckCircle2 size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>}
                                 </div>
                                 <p className={`text-sm font-bold ${isCompleted ? 'text-brand-dark' : 'text-gray-400'}`}>{step.l}</p>
                                 <p className="text-xs text-gray-400">{step.t}</p>
                             </div>
                         );
                     })}
                 </div>
            </div>
        </div>
    );
};

export default OrderTracking;
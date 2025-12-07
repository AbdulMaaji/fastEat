import React from 'react';
import { useAppContext } from '../context/AppContext';
import { History, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderStatus } from '../types';

const OrderHistoryPage: React.FC = () => {
    const { orders, vendors, addToCart } = useAppContext();
    const navigate = useNavigate();

    const handleReorder = (items: any[]) => {
        // Reorder logic
        items.forEach(item => {
            addToCart(item.menuItem, item.vendorId, item.quantity);
        });
        navigate('/orders');
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center gap-3 z-10">
                <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-50 rounded-full"><ArrowLeft size={20} /></button>
                <h1 className="font-bold text-lg text-brand-dark">Order History</h1>
            </div>
            <div className="px-4 pt-2 mb-4">
                {orders.filter(o => o.status === OrderStatus.COMPLETED).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <History size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No past orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.filter(o => o.status === OrderStatus.COMPLETED).map(order => {
                            const vendor = vendors.find(v => v.id === order.vendorId);
                            return (
                                <div key={order.id} className="border border-gray-100 rounded-2xl p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center">
                                            <img src={vendor?.avatar} className="w-10 h-10 rounded-full object-cover mr-3 bg-gray-100" alt={vendor?.name} />
                                            <div>
                                                <h3 className="font-bold text-brand-dark text-sm">{vendor?.name}</h3>
                                                <p className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-brand-dark">${order.total.toFixed(2)}</span>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-gray-600">{item.quantity}x {item.menuItem.name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-gray-50">
                                        <button
                                            onClick={() => handleReorder(order.items)}
                                            className="flex-1 py-2 bg-brand-dark text-white rounded-xl text-xs font-bold"
                                        >
                                            Reorder
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;

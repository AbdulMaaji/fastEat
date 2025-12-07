
import React, { useState } from 'react';
import { Order, OrderStatus, Vendor, Driver } from '../types';
import { Navigation, Package, CheckCircle, Phone, Settings, Power, DollarSign, Wallet, ArrowUpRight, ChevronRight } from 'lucide-react';
import RouteMap from './RouteMap';

interface DriverDashboardProps {
    orders: Order[];
    vendors: Vendor[];
    driverProfile: Driver;
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
    onRespondToAssignment?: (orderId: string, driverId: string, accepted: boolean) => void;
    onUpdateDriverProfile: (updates: Partial<Driver>) => void;
    onSignOut: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ orders, vendors, driverProfile, onUpdateStatus, onUpdateDriverProfile, onSignOut }) => {
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'earnings'>('active');
    const [showSettings, setShowSettings] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [localProfile, setLocalProfile] = useState<Driver>(driverProfile);

    // Filter orders relevant to drivers
    // Pending assignments specifically offered to this driver
    const pendingAssignments = orders.filter(o => o.type === 'DELIVERY' && o.pendingDriverId === driverProfile.id && o.status === OrderStatus.AWAITING_ACCEPTANCE);

    // Available: Delivery orders that are Ready or Preparing, and have no driver yet and are not pending for someone else
    const availableOrders = orders.filter(o => o.type === 'DELIVERY' && (o.status === OrderStatus.READY || o.status === OrderStatus.PREPARING) && !o.driverId && !o.pendingDriverId);
    
    // Active: Orders assigned to this driver that aren't completed
    const activeOrders = orders.filter(o => o.type === 'DELIVERY' && o.driverId === driverProfile.id && o.status !== OrderStatus.COMPLETED);

    const getVendor = (id: string) => vendors.find(v => v.id === id);

    const handleShiftToggle = () => {
        onUpdateDriverProfile({ isOnline: !driverProfile.isOnline });
    };

    // Sync localProfile when prop changes
    React.useEffect(() => {
        setLocalProfile(driverProfile);
    }, [driverProfile]);

    const handleHoursChange = (type: 'start' | 'end', value: string) => {
        onUpdateDriverProfile({
            workingHours: {
                ...driverProfile.workingHours,
                [type]: value
            }
        });
    };

    const handleProfileChange = (field: keyof Driver, value: any) => {
        setLocalProfile(prev => ({ ...prev, [field]: value } as Driver));
    };

    const saveProfile = () => {
        // Persist all editable fields including delivery preferences
        const { name, phone, avatar, deliveryFee, minDeliveryTime, maxDeliveryTime, workingHours } = localProfile;
        onUpdateDriverProfile({ name, phone, avatar, deliveryFee, minDeliveryTime, maxDeliveryTime, workingHours });
        setEditingProfile(false);
    };

    const handleCashOut = () => {
        alert(`Processing cash out of $${driverProfile.walletBalance?.toFixed(2)} to your bank account.`);
        onUpdateDriverProfile({ walletBalance: 0 });
    };

    const renderOrderCard = (order: Order, isActive: boolean) => {
        const vendor = getVendor(order.vendorId);
        if (!vendor) return null;

        const earnings = order.deliveryFee || 0;

        return (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full mr-3 overflow-hidden border border-gray-100">
                            <img src={vendor.avatar} className="w-full h-full object-cover" alt="Vendor"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-dark">{vendor.name}</h3>
                            <p className="text-xs text-gray-500">Order #{order.id.slice(-4)}</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <span className="block font-bold text-brand-orange bg-orange-50 px-2 py-1 rounded text-xs mb-1">
                            Earn ${earnings.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-400">{(order.total * 0.15).toFixed(1)} mi</span>
                    </div>
                </div>

                {/* Route Visual / Navigation Tracking */}
                {isActive ? (
                     <div className="h-48 w-full mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-200 relative">
                         <RouteMap 
                            status={order.status} 
                            vendorAvatar={vendor.avatar} 
                                     customerAddress={order.deliveryLocation?.address}
                                     isDriverView={true}
                                     vendorCoords={vendor.location}
                                     customerCoords={order.deliveryLocation}
                         />
                         <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold border border-gray-100">
                             Est. Arrival: 14 min
                         </div>
                     </div>
                ) : (
                    <div className="relative pl-4 border-l-2 border-dashed border-gray-300 ml-2 space-y-6 my-4">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-brand-dark rounded-full border-2 border-white shadow-sm"></div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Pickup</p>
                            <p className="text-sm font-bold text-gray-800">{vendor.location.address}</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-brand-orange rounded-full border-2 border-white shadow-sm"></div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Dropoff</p>
                            <p className="text-sm font-bold text-gray-800">{order.deliveryLocation?.address || 'Unknown Location'}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {!isActive ? (
                    <button 
                        onClick={() => onUpdateStatus(order.id, OrderStatus.DRIVER_ASSIGNED)}
                        disabled={!driverProfile.isOnline}
                        className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                       {driverProfile.isOnline ? 'Accept Delivery' : 'Go Online to Accept'}
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                         {order.status === OrderStatus.DRIVER_ASSIGNED && (
                            <button 
                                onClick={() => onUpdateStatus(order.id, OrderStatus.PICKED_UP)}
                                className="col-span-2 bg-brand-orange text-white py-3 rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors"
                            >
                                Confirm Pickup
                            </button>
                         )}
                         {order.status === OrderStatus.PICKED_UP && (
                            <button 
                                onClick={() => onUpdateStatus(order.id, OrderStatus.NEARBY)}
                                className="col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors"
                            >
                                Arriving Soon (Notify User)
                            </button>
                         )}
                         {order.status === OrderStatus.NEARBY && (
                            <button 
                                onClick={() => onUpdateStatus(order.id, OrderStatus.ARRIVED)}
                                className="col-span-2 bg-green-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-700 transition-colors"
                            >
                                Arrived at Location
                            </button>
                         )}
                         {order.status === OrderStatus.ARRIVED && (
                            <button 
                                onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
                                className="col-span-2 bg-brand-dark text-white py-3 rounded-xl font-bold shadow-md hover:bg-gray-800 transition-colors"
                            >
                                Complete Delivery
                            </button>
                         )}
                         
                         <button className="bg-gray-100 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-gray-200 transition-colors text-xs">
                             <Phone size={16} className="mr-2"/> Call Cust.
                         </button>
                         <button className="bg-gray-100 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center hover:bg-gray-200 transition-colors text-xs">
                             <Navigation size={16} className="mr-2"/> Navigate
                         </button>
                    </div>
                )}
            </div>
        );
    };

    const renderEarnings = () => {
        const history = driverProfile.earningsHistory || [];
        const sortedHistory = [...history].reverse();

        return (
            <div className="space-y-4">
                {/* Wallet Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                        <Wallet size={12}/> Total Balance
                    </p>
                    <h2 className="text-3xl font-bold mb-6">${(driverProfile.walletBalance || 0).toFixed(2)}</h2>
                    
                    <button 
                        onClick={handleCashOut}
                        disabled={(driverProfile.walletBalance || 0) <= 0}
                        className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:shadow-none"
                    >
                        Cash Out Now
                    </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <h3 className="font-bold text-brand-dark mb-4 text-sm">Recent Earnings</h3>
                    {sortedHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs">
                            <DollarSign size={24} className="mx-auto mb-2 opacity-30"/>
                            No earnings yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedHistory.map((entry, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                            <ArrowUpRight size={16}/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-gray-900">Delivery Payout</p>
                                            <p className="text-[10px] text-gray-500">{entry.date} {entry.orderId ? `• #${entry.orderId.slice(-4)}` : ''}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm text-green-600">+${entry.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <button className="w-full mt-3 py-2 text-xs font-bold text-gray-500 hover:text-brand-dark flex items-center justify-center">
                        View All History <ChevronRight size={12} className="ml-1"/>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            {/* Driver Header / Status Bar */}
            <div className="bg-brand-dark text-white p-6 pb-8 rounded-b-3xl mb-4 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Driver Portal</h1>
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${driverProfile.isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
                             <p className="text-gray-400 text-sm">{driverProfile.isOnline ? 'Online & Accepting' : 'Offline'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-white/20 text-white' : 'bg-transparent text-gray-400 hover:bg-white/10'}`}
                    >
                        <Settings size={20} />
                    </button>
                </div>

                {/* Shift / Settings Panel */}
                {showSettings && (
                    <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-100 mb-3">
                                <img src={localProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <h4 className="font-bold text-lg text-gray-800 mb-1">{localProfile.name}</h4>
                            <p className="text-xs text-gray-500 mb-3">{localProfile.phone}</p>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-2 h-2 rounded-full ${localProfile.isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-xs text-gray-600">{localProfile.isOnline ? 'Online' : 'Offline'}</span>
                            </div>

                            <div className="flex gap-2 w-full">
                                <button onClick={() => setEditingProfile(!editingProfile)} className="flex-1 bg-brand-dark text-white py-2 rounded-lg font-bold">{editingProfile ? 'Cancel' : 'Edit Profile'}</button>
                                <button onClick={() => { onSignOut(); }} className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg">Sign Out</button>
                            </div>

                            {!editingProfile && (
                                <div className="mt-4 w-full grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-xs text-gray-400">Rating</div>
                                        <div className="font-bold">{localProfile.rating?.toFixed ? localProfile.rating.toFixed(1) : localProfile.rating || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">Wallet</div>
                                        <div className="font-bold">${(localProfile.walletBalance || 0).toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">ETA</div>
                                        <div className="font-bold">{(localProfile.minDeliveryTime || 15)}-{(localProfile.maxDeliveryTime || 45)}m</div>
                                    </div>
                                </div>
                            )}

                            {editingProfile && (
                                <div className="mt-4 w-full space-y-3">
                                    <input value={localProfile.name} onChange={(e) => handleProfileChange('name', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                                    <input value={localProfile.phone} onChange={(e) => handleProfileChange('phone', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                                    <input value={localProfile.avatar} onChange={(e) => handleProfileChange('avatar', e.target.value)} className="w-full px-3 py-2 rounded-lg border" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" value={localProfile.deliveryFee ?? 0} onChange={(e) => handleProfileChange('deliveryFee', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border" placeholder="Fee ($)" />
                                        <input type="number" value={localProfile.minDeliveryTime ?? 15} onChange={(e) => handleProfileChange('minDeliveryTime', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border" placeholder="Min (min)" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={saveProfile} className="flex-1 bg-brand-orange text-white py-2 rounded-lg font-bold">Save</button>
                                        <button onClick={() => { setEditingProfile(false); setLocalProfile(driverProfile); }} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Tab Switcher */}
                <div className="flex bg-white/10 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'active' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Active
                    </button>
                    <button 
                        onClick={() => setActiveTab('available')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'available' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Available ({availableOrders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('earnings')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === 'earnings' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Earnings
                    </button>
                </div>
            </div>

            <div className="px-4">
                {/* Pending Assignments Section */}
                {pendingAssignments.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-bold mb-2">Pending Delivery Requests</h3>
                        {pendingAssignments.map(o => {
                            const vendor = getVendor(o.vendorId);
                            return (
                                <div key={o.id} className="bg-white p-3 rounded-lg mb-2 border">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <div className="font-bold">Order #{o.id.slice(-6)}</div>
                                            <div className="text-[11px] text-gray-500">{vendor?.name} • ${o.total.toFixed(2)}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onRespondToAssignment && onRespondToAssignment(o.id, driverProfile.id, true)} className="px-3 py-1 bg-brand-dark text-white rounded text-xs font-bold">Accept</button>
                                            <button onClick={() => onRespondToAssignment && onRespondToAssignment(o.id, driverProfile.id, false)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs">Decline</button>
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-gray-500">Pickup: {vendor?.location.address}</div>
                                    <div className="text-[11px] text-gray-500">Dropoff: {o.deliveryLocation?.address}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {activeTab === 'available' && (
                    <>
                        {availableOrders.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <Package size={48} className="mx-auto mb-2 opacity-50"/>
                                <p className="text-sm">No orders nearby.</p>
                                {!driverProfile.isOnline && <p className="text-xs text-orange-500 mt-1">You are offline.</p>}
                            </div>
                        )}
                        {availableOrders.map(o => renderOrderCard(o, false))}
                    </>
                )}

                {activeTab === 'active' && (
                    <>
                        {activeOrders.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <CheckCircle size={48} className="mx-auto mb-2 opacity-50"/>
                                <p className="text-sm">No active deliveries.</p>
                                <button onClick={() => setActiveTab('available')} className="text-brand-orange text-xs font-bold mt-2 hover:underline">Check available orders</button>
                            </div>
                        )}
                        {activeOrders.map(o => renderOrderCard(o, true))}
                    </>
                )}

                {activeTab === 'earnings' && renderEarnings()}
            </div>
        </div>
    );
};

export default DriverDashboard;

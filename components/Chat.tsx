import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, ShieldAlert, ChevronRight, DollarSign, ShoppingBag, Store, Truck, ChevronLeft, History, Plus, RotateCcw, ScrollText, Minus, Check } from 'lucide-react';
import { ChatMessage, UserRole, Order, Vendor, CartItem, OrderStatus, MenuItem } from '../types';

interface ChatProps {
    currentUserRole: UserRole;
    vendors: Vendor[];
    allOrders: Order[];
    onQuickOrder: (items: CartItem[]) => void;
}

const QUICK_ACTIONS = [
    { id: 'price', label: 'Price', icon: DollarSign, text: 'Can I check the current prices for the menu?' },
    { id: 'order', label: 'Status', icon: ShoppingBag, text: 'What is the current status of my order?' },
    { id: 'pickup', label: 'Pickup', icon: Store, text: 'Where is the pickup counter located?' },
    { id: 'delivery', label: 'Delivery', icon: Truck, text: 'What is the estimated time for delivery?' },
];

const Chat: React.FC<ChatProps> = ({ currentUserRole, vendors, allOrders, onQuickOrder }) => {
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isModerating, setIsModerating] = useState(false);
    const [blockedReason, setBlockedReason] = useState<string | null>(null);
    const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
    const [showMenuDropdown, setShowMenuDropdown] = useState(false);
    const [menuQuantities, setMenuQuantities] = useState<{ [itemId: string]: number }>({});

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter vendors to only those user has interacted with (has orders) or if vendor role, show customers (mocked as list of users)
    const relevantVendorIds = useMemo(() => {
        const ids = new Set(allOrders.map(o => o.vendorId));
        // Also add all vendors from props to allow starting new chats
        vendors.forEach(v => ids.add(v.id));
        return Array.from(ids);
    }, [allOrders, vendors]);

    const chatList = relevantVendorIds.map(vid => vendors.find(v => v.id === vid)).filter(Boolean) as Vendor[];

    const selectedVendor = vendors.find(v => v.id === selectedVendorId);

    // Filter orders for the selected vendor (Active and Past)
    const vendorOrders = useMemo(() => {
        if (!selectedVendorId) return [];
        return allOrders.filter(o => o.vendorId === selectedVendorId).sort((a, b) => b.timestamp - a.timestamp);
    }, [allOrders, selectedVendorId]);

    const activeOrder = vendorOrders.find(o => o.status !== OrderStatus.COMPLETED);

    // Calculate totals for the menu dropdown
    const totalMenuQuantity = (Object.values(menuQuantities) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalMenuPrice = selectedVendor?.menu.reduce((total, item) => {
        const qty = menuQuantities[item.id] || 0;
        return total + (item.price * qty);
    }, 0) || 0;

    // --- Message Handling ---

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (selectedVendorId) scrollToBottom();
    }, [messages, selectedVendorId]);

    const processMessage = async (textToSend: string) => {
        if (!textToSend.trim() || !selectedVendorId) return;

        setBlockedReason(null);

        // Direct send without moderation
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: currentUserRole === UserRole.CUSTOMER ? 'customer' : 'vendor',
            text: textToSend,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);

        if (currentUserRole === UserRole.CUSTOMER) {
            setTimeout(() => {
                const reply: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    senderId: 'vendor',
                    text: "Got it! We'll update you shortly.",
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, reply]);
            }, 2000);
        }
    };

    const handleSendClick = () => {
        processMessage(inputText);
        setInputText('');
    };

    const handleQuickAction = (text: string) => {
        processMessage(text);
    };

    const updateMenuQuantity = (itemId: string, delta: number) => {
        setMenuQuantities(prev => {
            const current = prev[itemId] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [itemId]: next };
        });
    };

    const handlePlaceBulkOrder = () => {
        if (!selectedVendorId || !selectedVendor) return;

        const itemsToOrder: CartItem[] = [];
        selectedVendor.menu.forEach(item => {
            const qty = menuQuantities[item.id] || 0;
            if (qty > 0) {
                itemsToOrder.push({
                    menuItem: item,
                    quantity: qty,
                    vendorId: selectedVendorId
                });
            }
        });

        if (itemsToOrder.length > 0) {
            onQuickOrder(itemsToOrder);
            setMenuQuantities({}); // Reset quantities
            setShowMenuDropdown(false);
        }
    };

    // --- Views ---

    if (!selectedVendorId) {
        // CHAT LIST VIEW
        return (
            <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
                <div className="bg-white px-3 py-3 shadow-sm border-b border-gray-100">
                    <h1 className="text-lg font-bold text-gray-900">Messages</h1>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {chatList.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-10">No active conversations.</p>
                    )}
                    {chatList.map(vendor => {
                        // Find last order for preview
                        const lastOrder = allOrders.find(o => o.vendorId === vendor.id);
                        return (
                            <button
                                key={vendor.id}
                                onClick={() => setSelectedVendorId(vendor.id)}
                                className="w-full bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="relative">
                                    <img src={vendor.avatar} alt={vendor.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                                    {vendor.isOpen && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className="font-bold text-sm text-gray-900 truncate">{vendor.name}</h3>
                                        {lastOrder && <span className="text-[10px] text-gray-400">{new Date(lastOrder.timestamp).toLocaleDateString()}</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {lastOrder ? `Last order: ${lastOrder.items.length} items` : 'Start a conversation...'}
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // SPECIFIC CHAT ROOM VIEW
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 relative">

            {/* Sticky Header */}
            <div className="bg-white shadow-sm z-30">
                <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setSelectedVendorId(null)} className="p-1 -ml-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={22} className="text-gray-600" />
                        </button>
                        <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                            <img src={selectedVendor?.avatar} alt="Vendor" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-gray-900 leading-none">{selectedVendor?.name}</h2>
                            {selectedVendor?.isOpen ? (
                                <p className="text-[9px] text-green-600 font-medium mt-0.5">Online</p>
                            ) : (
                                <p className="text-[9px] text-gray-400 font-medium mt-0.5">Offline</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => {
                                setShowMenuDropdown(!showMenuDropdown);
                                setShowHistoryDropdown(false);
                            }}
                            className={`p-1.5 rounded-full transition-colors relative ${showMenuDropdown ? 'bg-orange-50 text-brand-orange' : 'bg-gray-50 text-gray-500'}`}
                            title="Menu"
                        >
                            <ScrollText size={18} />
                            {totalMenuQuantity > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setShowHistoryDropdown(!showHistoryDropdown);
                                setShowMenuDropdown(false);
                            }}
                            className={`p-1.5 rounded-full transition-colors ${showHistoryDropdown ? 'bg-orange-50 text-brand-orange' : 'bg-gray-50 text-gray-500'}`}
                            title="History"
                        >
                            <History size={18} />
                        </button>
                    </div>
                </div>

                {/* Moderation Banner */}
                <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-1 flex items-center justify-center">
                    <ShieldAlert size={10} className="text-indigo-600 mr-1.5" />
                    <span className="text-[9px] font-bold text-indigo-800 tracking-wide uppercase">Business Only</span>
                </div>

                {/* Active Order Widget */}
                {activeOrder && (
                    <div className="bg-white border-b border-gray-100 p-2">
                        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-2 shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange"></div>
                            <div className="flex-1 ml-2">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        #{activeOrder.id}
                                    </span>
                                    <span className="text-[9px] font-bold text-brand-orange flex items-center">
                                        {activeOrder.status.replace('_', ' ')} <ChevronRight size={10} className="ml-0.5" />
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-[11px] text-gray-600 font-medium">
                                        {activeOrder.items.length} items • {activeOrder.type}
                                    </p>
                                    <p className="text-xs font-bold text-gray-900">${activeOrder.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Menu Dropdown */}
            {showMenuDropdown && selectedVendor && (
                <div className="absolute top-[90px] left-0 w-full bg-white shadow-2xl z-40 border-b border-gray-200 animate-in slide-in-from-top-2 rounded-b-2xl flex flex-col max-h-[60vh]">
                    <div className="p-3 flex-1 overflow-y-auto space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm text-gray-900">Menu</h3>
                            <span className="text-xs text-gray-400">{selectedVendor.menu.length} items</span>
                        </div>
                        <div className="grid gap-2 pb-2">
                            {selectedVendor.menu.map(item => {
                                const qty = menuQuantities[item.id] || 0;
                                return (
                                    <div key={item.id} className="flex gap-2 border border-gray-100 p-2 rounded-lg hover:border-brand-orange/30 transition-colors">
                                        <img src={item.image} className="w-14 h-14 rounded-lg object-cover bg-gray-100" alt={item.name} />
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{item.name}</h4>
                                                <p className="text-[10px] text-gray-500 line-clamp-1">{item.description}</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="font-bold text-xs text-brand-dark">${item.price}</span>
                                                {qty === 0 ? (
                                                    <button
                                                        onClick={() => updateMenuQuantity(item.id, 1)}
                                                        className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm hover:bg-gray-200"
                                                    >
                                                        Add
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center bg-brand-orange text-white rounded-full p-0.5 shadow-sm">
                                                        <button onClick={() => updateMenuQuantity(item.id, -1)} className="p-1 hover:bg-orange-600 rounded-full transition-colors">
                                                            <Minus size={10} />
                                                        </button>
                                                        <span className="text-[10px] font-bold w-4 text-center">{qty}</span>
                                                        <button onClick={() => updateMenuQuantity(item.id, 1)} className="p-1 hover:bg-orange-600 rounded-full transition-colors">
                                                            <Plus size={10} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Menu Footer - Bulk Order Button */}
                    {totalMenuQuantity > 0 && (
                        <div className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
                            <button
                                onClick={handlePlaceBulkOrder}
                                className="w-full bg-brand-orange text-white py-2.5 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all flex items-center justify-between px-4 text-sm"
                            >
                                <span>Review Order ({totalMenuQuantity})</span>
                                <span>${totalMenuPrice.toFixed(2)}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* History / Reorder Dropdown */}
            {showHistoryDropdown && (
                <div className="absolute top-[90px] left-0 w-full max-h-[60vh] overflow-y-auto bg-white shadow-2xl z-40 border-b border-gray-200 animate-in slide-in-from-top-2 rounded-b-2xl">
                    <div className="p-3 space-y-3">
                        <h3 className="font-bold text-sm text-gray-900">Past Orders</h3>
                        {vendorOrders.filter(o => o.status === OrderStatus.COMPLETED).length === 0 && (
                            <p className="text-center text-xs text-gray-400 py-4">No past orders found.</p>
                        )}
                        {vendorOrders.filter(o => o.status === OrderStatus.COMPLETED).map(order => (
                            <div key={order.id} className="border border-gray-200 rounded-xl p-2.5">
                                <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-1.5">
                                    <span className="text-[10px] font-bold text-gray-500">{new Date(order.timestamp).toLocaleDateString()}</span>
                                    <span className="text-xs font-bold text-brand-dark">${order.total.toFixed(2)}</span>
                                </div>
                                <div className="space-y-1.5 mb-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <img src={item.menuItem.image} className="w-6 h-6 rounded object-cover bg-gray-100 mr-2" alt={item.menuItem.name} />
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-800">{item.quantity}x {item.menuItem.name}</p>
                                                    <p className="text-[9px] text-gray-500">${item.menuItem.price}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    onQuickOrder([{ ...item, quantity: 1 }]);
                                                    setShowHistoryDropdown(false);
                                                }}
                                                className="p-1 bg-orange-50 text-brand-orange rounded-full hover:bg-brand-orange hover:text-white transition-colors"
                                                title="Reorder 1 Item"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        onQuickOrder(order.items);
                                        setShowHistoryDropdown(false);
                                    }}
                                    className="w-full bg-gray-100 hover:bg-brand-dark hover:text-white text-brand-dark text-[10px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <RotateCcw size={10} /> Reorder Full Order
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Overlay when dropdowns are open */}
            {(showHistoryDropdown || showMenuDropdown) && (
                <div
                    className="absolute inset-0 bg-black/20 z-30 top-[90px]"
                    onClick={() => {
                        setShowHistoryDropdown(false);
                        setShowMenuDropdown(false);
                    }}
                ></div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/50" id="chat-container">
                {messages.length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-10">No messages yet. Start a conversation!</p>
                )}
                {messages.map((msg) => {
                    const isMe = (msg.senderId === 'customer' && currentUserRole === UserRole.CUSTOMER) ||
                        (msg.senderId === 'vendor' && currentUserRole === UserRole.VENDOR);

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <div className="w-6 h-6 rounded-full bg-gray-200 mr-1.5 self-end mb-1 overflow-hidden">
                                    <img src={selectedVendor?.avatar} className="w-full h-full object-cover" alt="Avatar" />
                                </div>
                            )}
                            <div className={`max-w-[80%] px-3 py-2 text-sm ${isMe
                                    ? 'bg-brand-dark text-white rounded-2xl rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm border border-gray-100'
                                }`}>
                                <p className="leading-relaxed text-[13px]">{msg.text}</p>
                                <div className={`text-[9px] mt-1 font-medium ${isMe ? 'text-gray-400' : 'text-gray-300'} text-right`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-1 border-t border-gray-100 z-20">
                {blockedReason && (
                    <div className="mb-1 mx-1 p-1.5 bg-red-50 border border-red-100 rounded-lg flex items-center space-x-2 animate-pulse">
                        <ShieldAlert className="text-red-500 shrink-0" size={12} />
                        <p className="text-[10px] text-red-600 font-medium">{blockedReason}</p>
                    </div>
                )}

                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-1 pb-0.5 px-1">
                    {QUICK_ACTIONS.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => handleQuickAction(action.text)}
                            disabled={isModerating}
                            className="flex items-center flex-shrink-0 px-2 py-1 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-brand-orange/30 text-gray-600 hover:text-brand-orange rounded-lg text-[10px] font-semibold transition-all active:scale-95"
                        >
                            <action.icon size={12} className="mr-1 opacity-70" />
                            {action.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                                if (blockedReason) setBlockedReason(null);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendClick()}
                            placeholder={isModerating ? "Reviewing..." : "Business inquiry..."}
                            disabled={isModerating}
                            className="w-full bg-gray-100 text-gray-900 rounded-full px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark/10 focus:bg-white transition-all"
                        />
                        {isModerating && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSendClick}
                        disabled={!inputText.trim() || isModerating}
                        className="bg-brand-orange text-white p-2 rounded-full shadow-md shadow-orange-100 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all hover:bg-orange-600"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
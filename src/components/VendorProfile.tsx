import React from 'react';
import { Vendor, Post, CartItem, MenuItem } from '../types';
import { Heart, MessageCircle, ShoppingBag, MapPin, ChevronLeft, Plus, Minus, Star, Clock } from 'lucide-react';

interface VendorProfileProps {
    vendor: Vendor;
    posts: Post[];
    cartItems: CartItem[];
    isFavorite: boolean;
    currentUserPoints: number;
    onBack: () => void;
    onToggleFavorite: (vendorId: string) => void;
    onProductClick: (item: MenuItem) => void;
    onMessageClick: () => void;
    onViewBag: () => void;
    onLocationClick: () => void;
    onUpdateCart: (item: MenuItem, delta: number) => void;
}

const VendorProfile: React.FC<VendorProfileProps> = ({
    vendor,
    posts,
    cartItems,
    isFavorite,
    currentUserPoints,
    onBack,
    onToggleFavorite,
    onProductClick,
    onMessageClick,
    onViewBag,
    onLocationClick,
    onUpdateCart
}) => {
    // Calculate total cart items for this vendor
    const vendorCartItems = cartItems.filter(c => c.vendorId === vendor.id);
    const cartItemCount = vendorCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = vendorCartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Header / Cover */}
            <div className="relative h-64">
                <img src={vendor.cover_image} alt={vendor.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Navbar */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10">
                    <button onClick={onBack} className="p-2 bg-black/20 backdrop-blur-md rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => onToggleFavorite(vendor.id)} className="p-2 bg-black/20 backdrop-blur-md rounded-full">
                            <Heart size={24} className={isFavorite ? "fill-brand-orange text-brand-orange" : "text-white"} />
                        </button>
                    </div>
                </div>

                {/* Vendor Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h1 className="text-3xl font-black mb-2">{vendor.name}</h1>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="flex items-center gap-1 bg-brand-orange px-2 py-0.5 rounded-lg text-white">
                            <Star size={12} className="fill-white" />
                            {vendor.rating}
                        </span>
                        <span>{vendor.ratingCount} reviews</span>
                        <span>•</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg">{vendor.followers} Followers</span>
                    </div>
                </div>
            </div>

            <div className="p-6 -mt-4 bg-white rounded-t-3xl relative z-10">
                {/* Stats & Actions */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Loyalty Points</span>
                        <span className="text-2xl font-black text-brand-dark">{currentUserPoints}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onMessageClick} className="p-3 bg-gray-100 rounded-2xl text-brand-dark hover:bg-gray-200 transition-colors">
                            <MessageCircle size={24} />
                        </button>
                        <button onClick={onLocationClick} className="p-3 bg-gray-100 rounded-2xl text-brand-dark hover:bg-gray-200 transition-colors">
                            <MapPin size={24} />
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-brand-dark mb-2">About</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{vendor.bio}</p>
                </div>

                {/* Menu / Feed Toggle (Simplified for now, just showing Menu) */}
                <h2 className="text-xl font-bold text-brand-dark mb-6">Menu</h2>
                <div className="space-y-6">
                    {vendor.menu.map(item => {
                        const inCart = vendorCartItems.find(c => c.menuItem.id === item.id);
                        const qty = inCart ? inCart.quantity : 0;

                        return (
                            <div key={item.id} className="flex gap-4">
                                <div
                                    className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                                    onClick={() => onProductClick(item)}
                                >
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="font-bold text-brand-dark mb-1">{item.name}</h3>
                                        <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="font-black text-lg text-brand-dark">${item.price.toFixed(2)}</span>
                                        {qty === 0 ? (
                                            <button
                                                onClick={() => onUpdateCart(item, 1)}
                                                className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-brand-orange/30"
                                            >
                                                <Plus size={16} strokeWidth={3} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                                                <button onClick={() => onUpdateCart(item, -1)} className="w-6 h-6 rounded-full bg-white text-brand-dark flex items-center justify-center shadow-sm">
                                                    <Minus size={12} strokeWidth={3} />
                                                </button>
                                                <span className="font-bold text-sm">{qty}</span>
                                                <button onClick={() => onUpdateCart(item, 1)} className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-sm">
                                                    <Plus size={12} strokeWidth={3} />
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

            {/* Float Cart Button */}
            {cartItemCount > 0 && (
                <div className="fixed bottom-6 left-6 right-6 z-50">
                    <button
                        onClick={onViewBag}
                        className="w-full bg-brand-dark text-white p-4 rounded-2xl shadow-xl shadow-brand-dark/20 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
                                {cartItemCount}
                            </div>
                            <span className="font-bold">View Bag</span>
                        </div>
                        <span className="font-black text-lg">${cartTotal.toFixed(2)}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default VendorProfile;

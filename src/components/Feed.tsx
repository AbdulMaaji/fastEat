import React from 'react';
import { Post, CartItem, Vendor, UserRole, MenuItem } from '../types';
import { Heart, MessageCircle, ShoppingBag, MapPin, Search } from 'lucide-react';

interface FeedProps {
    posts: Post[];
    cartItems: CartItem[];
    onOrderClick: (itemId: string) => void;
    onProductClick: (itemId: string) => void;
    vendors: Vendor[];
    favorites: Set<string>;
    onToggleFavorite: (vendorId: string) => void;
    onVendorClick: (vendor: Vendor) => void;
    onLocationClick: (vendor: Vendor) => void;
    role: UserRole;
    onOpenVendorDashboard: () => void;
}

const Feed: React.FC<FeedProps> = ({
    posts,
    vendors,
    favorites,
    onToggleFavorite,
    onVendorClick,
    onProductClick,
    onLocationClick
}) => {
    return (
        <div className="pb-20 max-w-2xl mx-auto">
            {/* Header */}
            <div className="p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="What are you craving?"
                        className="w-full bg-white border-none rounded-2xl py-3 pl-10 pr-4 shadow-sm text-sm font-medium focus:ring-2 focus:ring-brand-orange/20"
                    />
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
            </div>

            {/* Stories / Vendors */}
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
                {vendors.map(vendor => (
                    <div
                        key={vendor.id}
                        className="flex flex-col items-center flex-shrink-0 cursor-pointer"
                        onClick={() => onVendorClick(vendor)}
                    >
                        <div className="w-16 h-16 rounded-full p-0.5 border-2 border-brand-orange/30 mb-1">
                            <img src={vendor.avatar} alt={vendor.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 truncate w-16 text-center">{vendor.name}</span>
                    </div>
                ))}
            </div>

            {/* Posts Feed */}
            <div className="space-y-6 p-4 pt-0">
                {posts.map(post => {
                    const vendor = vendors.find(v => v.id === post.vendorId);
                    const isFav = vendor ? favorites.has(vendor.id) : false;

                    return (
                        <div key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                            {/* Post Header */}
                            <div className="p-3 flex items-center justify-between">
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => vendor && onVendorClick(vendor)}
                                >
                                    <img src={post.vendorAvatar} alt={post.vendorName} className="w-8 h-8 rounded-full object-cover" />
                                    <span className="font-bold text-sm text-brand-dark">{post.vendorName}</span>
                                </div>
                                <button onClick={() => vendor && onToggleFavorite(vendor.id)}>
                                    <Heart
                                        size={20}
                                        className={isFav ? "fill-brand-orange text-brand-orange" : "text-gray-300"}
                                    />
                                </button>
                            </div>

                            {/* Image */}
                            <div
                                className="aspect-[4/5] bg-gray-100 relative cursor-pointer"
                                onClick={() => onProductClick(post.id)} // Assuming post.id maps to product for now or opens detail
                            >
                                <img src={post.image} alt="Food" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pt-10">
                                    <p className="text-white font-medium text-sm line-clamp-2">{post.caption}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-3 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1">
                                        <Heart size={20} className="text-brand-dark" />
                                        <span className="text-xs font-bold">{post.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle size={20} className="text-brand-dark" />
                                        <span className="text-xs font-bold">24</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShoppingBag size={20} className="text-brand-dark" />
                                        <span className="text-xs font-bold">{post.purchaseCount} bought</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => vendor && onLocationClick(vendor)}
                                    className="text-gray-400 hover:text-brand-orange"
                                >
                                    <MapPin size={20} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Feed;

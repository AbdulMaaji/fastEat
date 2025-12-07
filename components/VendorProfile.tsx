import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Search, Heart, MessageSquare, Share2, BookOpen, Plus, Minus, Eye, ShoppingBag, Star, User, Crown, Trophy, Award, X } from 'lucide-react';
import { Vendor, Post, MenuItem, CartItem } from '../types';

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
  const [activeTab, setActiveTab] = useState<'menu' | 'posts' | 'loyalty'>('menu');
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  // Calculate cart totals for this vendor
  const vendorCartItems = cartItems.filter(item => item.vendorId === vendor.id);
  const itemCount = vendorCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = vendorCartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white pb-24 relative z-50 animate-in fade-in slide-in-from-right-8 duration-300">
      {/* Cover Image & Header */}
      <div className="relative h-48 w-full bg-gray-200">
        <img src={vendor.coverImage} className="w-full h-full object-cover" alt="Cover" />
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Top Nav */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
            <button onClick={onBack} className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div className="flex gap-2">
                <button onClick={() => onToggleFavorite(vendor.id)} className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                    <Heart size={20} className={isFavorite ? "fill-brand-red text-brand-red" : ""} />
                </button>
                <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                    <Share2 size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-10 relative mb-4">
          <div className="flex justify-between items-end mb-3">
              <div className="w-20 h-20 rounded-full p-1 bg-white shadow-md">
                  <img src={vendor.avatar} className="w-full h-full rounded-full object-cover" alt={vendor.name} />
              </div>
              <div className="flex gap-2 mb-1">
                  <button 
                    onClick={() => setActiveTab('menu')}
                    className={`bg-white border border-gray-200 text-brand-dark px-3 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${activeTab === 'menu' ? 'ring-2 ring-brand-orange/20 border-brand-orange' : ''}`}
                  >
                      <BookOpen size={14} /> Catalog
                  </button>
                  <button 
                    onClick={onMessageClick}
                    className="bg-brand-orange text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                      <MessageSquare size={14} /> Message
                  </button>
              </div>
          </div>
          
          <h1 className="text-2xl font-bold text-brand-dark mb-1">{vendor.name}</h1>
          
          <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => setShowReviewsModal(true)}
                className="flex items-center gap-1.5 hover:bg-gray-50 rounded-lg px-1 py-0.5 -ml-1 transition-colors"
              >
                  <Star size={14} className="fill-brand-orange text-brand-orange" />
                  <span className="text-sm font-bold text-brand-dark">{vendor.rating || 0}</span>
                  <span className="text-xs text-gray-500">({vendor.ratingCount} reviews)</span>
              </button>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <User size={12} />
                  <span>{vendor.followers >= 1000 ? (vendor.followers / 1000).toFixed(1) + 'k' : vendor.followers} Customers</span>
              </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{vendor.bio}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-4">
              <button 
                onClick={onLocationClick}
                className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                  <MapPin size={12} /> 
                  <span>{vendor.location.address}</span>
              </button>
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                  <Clock size={12} /> 
                  <span className={vendor.isOpen ? "text-green-600" : "text-red-500"}>
                      {vendor.isOpen ? "Open Now" : "Closed"}
                  </span>
              </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('menu')}
                className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'menu' ? 'text-brand-dark' : 'text-gray-400'}`}
              >
                  Catalog
                  {activeTab === 'menu' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-dark rounded-t-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'posts' ? 'text-brand-dark' : 'text-gray-400'}`}
              >
                  Feed
                  {activeTab === 'posts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-dark rounded-t-full"></div>}
              </button>
              {vendor.loyaltyProgramEnabled && (
                  <button 
                    onClick={() => setActiveTab('loyalty')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === 'loyalty' ? 'text-brand-dark' : 'text-gray-400'}`}
                  >
                      Loyalty
                      {activeTab === 'loyalty' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-dark rounded-t-full"></div>}
                  </button>
              )}
          </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-24">
          {activeTab === 'menu' && (
              <div className="space-y-4">
                  <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input type="text" placeholder="Search menu items..." className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-brand-orange"/>
                  </div>

                  {vendor.menu.length === 0 && (
                      <p className="text-center text-gray-400 text-xs py-4">No items in catalog yet.</p>
                  )}

                  <div className="grid gap-3">
                      {vendor.menu.map(item => {
                          const inCartQty = vendorCartItems.find(i => i.menuItem.id === item.id)?.quantity || 0;
                          return (
                            <div 
                                key={item.id} 
                                className={`flex flex-col p-3 border rounded-2xl transition-all shadow-sm ${inCartQty > 0 ? 'border-brand-orange/30 bg-orange-50/10' : 'border-gray-100 bg-white'}`}
                            >
                                <div className="flex gap-3">
                                    <div 
                                        className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                                        onClick={() => onProductClick(item)}
                                    >
                                        <img src={item.image} className="w-full h-full object-cover" alt={item.name}/>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div onClick={() => onProductClick(item)} className="cursor-pointer">
                                            <h3 className="font-bold text-brand-dark text-sm mb-1 line-clamp-1">{item.name}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{item.description}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="font-bold text-brand-dark text-base">${item.price}</span>
                                            
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onProductClick(item);
                                                }}
                                                className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-100 rounded-full transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Catalog Actions */}
                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                    {inCartQty > 0 ? (
                                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateCart(item, -1);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-brand-red active:scale-95 transition-all"
                                            >
                                                <Minus size={16}/>
                                            </button>
                                            <span className="w-10 text-center font-bold text-sm text-brand-dark">{inCartQty}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateCart(item, 1);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-brand-green active:scale-95 transition-all"
                                            >
                                                <Plus size={16}/>
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateCart(item, 1);
                                            }}
                                            className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-orange-100 hover:bg-orange-600 active:scale-95 transition-all"
                                        >
                                            <ShoppingBag size={14}/> Add to Cart
                                        </button>
                                    )}
                                    
                                    {inCartQty > 0 && (
                                        <span className="text-xs font-bold text-brand-orange">
                                            ${(item.price * inCartQty).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                          );
                      })}
                  </div>
              </div>
          )}

          {activeTab === 'posts' && (
              <div className="grid grid-cols-3 gap-1">
                  {posts.length === 0 ? (
                      <p className="col-span-3 text-center text-xs text-gray-400 py-8">No posts yet.</p>
                  ) : (
                      posts.map(post => (
                          <div key={post.id} className="aspect-square bg-gray-100 relative group cursor-pointer" onClick={() => post.menuItemId && onProductClick(vendor.menu.find(m => m.id === post.menuItemId!)!)}>
                              <img src={post.image} className="w-full h-full object-cover" alt="Post"/>
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                      ))
                  )}
              </div>
          )}

          {activeTab === 'loyalty' && (
              <div className="space-y-6 pt-4">
                  {/* User Status Card */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative z-10">
                          <p className="text-xs font-medium text-indigo-200 mb-1">Your Loyalty Points</p>
                          <h2 className="text-4xl font-black mb-4">{currentUserPoints}</h2>
                          <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-max px-3 py-1 rounded-lg backdrop-blur-sm">
                              <Crown size={14} className="text-yellow-300 fill-yellow-300"/>
                              Silver Member
                          </div>
                          <p className="mt-4 text-[10px] text-indigo-200">
                              Earn 1 point for every $1 spent. Redeem points for delivery discounts.
                          </p>
                      </div>
                  </div>

                  {/* Leaderboard */}
                  <div>
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-brand-dark flex items-center gap-2">
                              <Trophy size={18} className="text-yellow-500 fill-yellow-500"/> Top Loyal Customers
                          </h3>
                          <span className="text-xs text-gray-400">This Month</span>
                      </div>
                      
                      <p className="text-center text-gray-400 text-xs py-4">Leaderboard will update as customers order.</p>
                  </div>
              </div>
          )}
      </div>

      {/* View Bag Floating Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-4 z-50 bg-white/80 backdrop-blur-sm border-t border-gray-100 animate-in slide-in-from-bottom-4">
            <button 
                onClick={onViewBag}
                className="w-full bg-brand-orange text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-200 active:scale-95 transition-transform flex justify-between px-6 items-center"
            >
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 px-2 py-0.5 rounded text-xs font-black">{itemCount}</div>
                    <span className="text-sm">View Bag</span>
                </div>
                <span className="text-sm">${subtotal.toFixed(2)}</span>
            </button>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviewsModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl p-5 w-full max-w-md relative animate-in zoom-in-95">
                  <button onClick={() => setShowReviewsModal(false)} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
                  <h3 className="font-bold text-lg text-brand-dark mb-4">Customer Reviews</h3>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                      <p className="text-center text-gray-400 text-xs py-4">No reviews yet.</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default VendorProfile;
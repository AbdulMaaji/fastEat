import React, { useState } from 'react';
import { ShoppingBag, MoreHorizontal, ArrowRight, X, Store, CheckCircle2, MapPin, Star, User, Plus } from 'lucide-react';
import { Post, CartItem, Vendor, UserRole } from '../types';

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
    role?: UserRole;
    onOpenVendorDashboard?: () => void;
}

const Feed: React.FC<FeedProps> = ({ 
    posts, 
    cartItems, 
    onOrderClick, 
    onProductClick,
    vendors, 
    favorites, 
    onToggleFavorite,
    onVendorClick,
    onLocationClick,
    role,
    onOpenVendorDashboard
}) => {
  
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [showRatingsModal, setShowRatingsModal] = useState<string | null>(null);

  const getPostVendor = (vendorId: string) => {
      return vendors.find(v => v.id === vendorId);
  };

  if (posts.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
              <Store size={48} className="text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">Feed is Empty</h3>
              <p className="text-sm text-gray-400 mt-2">Vendors haven't posted anything yet. Be the first vendor to post!</p>
          </div>
      );
  }

  return (
    <div className="max-w-[400px] mx-auto">
      {posts.map((post) => {
        const isInCart = cartItems.some(item => item.menuItem.id === post.menuItemId);
        const vendor = getPostVendor(post.vendorId);

        return (
          <div key={post.id} className="bg-white border-b border-gray-100">
            {/* Stall Header (Location & Verification) */}
            <div className="flex items-center justify-between px-3 py-3">
              <div 
                  className="flex items-center space-x-3 cursor-pointer group"
                  onClick={() => vendor && onVendorClick(vendor)}
              >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 p-0.5 overflow-hidden shadow-sm group-hover:border-brand-orange transition-colors">
                      <img src={post.vendorAvatar} alt={post.vendorName} className="w-full h-full rounded-md object-cover" />
                  </div>
                  <div>
                      <h3 className="font-bold text-sm text-brand-dark leading-none group-hover:text-brand-orange transition-colors flex items-center gap-1">
                          {post.vendorName}
                          {vendor?.isVerified && <CheckCircle2 size={12} className="text-blue-500 fill-blue-500/10" />}
                      </h3>
                      <div 
                          className="flex items-center gap-1 mt-1 group/loc"
                          onClick={(e) => {
                              e.stopPropagation();
                              vendor && onLocationClick(vendor);
                          }}
                          title="View on Map"
                      >
                           <MapPin size={10} className="text-gray-400 group-hover/loc:text-brand-orange transition-colors" />
                           <span className="text-[10px] font-medium text-gray-500 group-hover/loc:text-brand-orange group-hover/loc:underline transition-colors">
                               {vendor?.location.address || 'San Francisco, CA'}
                           </span>
                      </div>
                  </div>
              </div>
              <button 
                onClick={() => setActiveMenuPostId(post.id)}
                className="text-gray-400 hover:text-brand-dark p-1"
              >
                  <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Catalog Image (Stall Display) - 4:3 Aspect Ratio */}
            <div className="relative w-full bg-gray-50 aspect-[4/3] group cursor-pointer px-3" onClick={() => post.menuItemId && onProductClick(post.menuItemId)}>
              <div className="w-full h-full rounded-xl overflow-hidden relative shadow-sm border border-gray-100">
                  <img src={post.image} alt="Food" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  {/* Ingredients Overlay */}
                  {post.ingredients && post.ingredients.length > 0 && (
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10">
                          <p className="text-white/90 text-[9px] uppercase font-bold tracking-wider mb-0.5 opacity-80">Fresh Ingredients</p>
                          <p className="text-white text-xs font-medium leading-tight">
                              {post.ingredients.join(' • ')}
                          </p>
                      </div>
                  )}
              </div>
            </div>

            {/* Stall Details (Catalog Stats) */}
            <div className="px-4 pt-3 pb-4">
              <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                      <p className="text-sm text-gray-900 leading-snug mb-2 font-medium">
                          {post.caption}
                      </p>
                      
                      {/* Trade Fair Stats */}
                      <div className="flex items-center gap-3">
                           {post.purchaseCount !== undefined && (
                              <span className="flex items-center text-xs font-bold text-brand-dark bg-gray-100 px-2 py-1 rounded-lg">
                                  🛍️ {(post.purchaseCount / 1000).toFixed(1)}k sold
                              </span>
                          )}
                          {post.rating !== undefined && (
                               <button 
                                  onClick={() => setShowRatingsModal(post.id)}
                                  className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg hover:bg-orange-100 transition-colors"
                               >
                                   <Star size={10} className="fill-orange-600 mr-1"/> {post.rating}
                               </button>
                           )}
                      </div>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                  {vendor && (
                      <button 
                        onClick={() => onVendorClick(vendor)}
                        className="flex-1 bg-gray-50 text-gray-600 border border-gray-200 py-2.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                      >
                          <Store size={14} /> Visit Stall
                      </button>
                  )}
                  
                  {post.menuItemId && (
                    <button 
                        onClick={() => onOrderClick(post.menuItemId!)}
                        className={`flex-[2] py-2.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 ${
                        isInCart 
                            ? 'bg-white text-brand-dark border border-gray-200 hover:bg-gray-50' 
                            : 'bg-brand-orange text-white hover:bg-orange-600 border border-transparent'
                        }`}
                    >
                        {isInCart ? (
                        <>View Order <ArrowRight size={14}/></>
                        ) : (
                        <>Order Now <ShoppingBag size={14}/></>
                        )}
                    </button>
                  )}
              </div>
            </div>
          </div>
        );
      })}

      {/* RATINGS MODAL */}
      {showRatingsModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl p-5 w-full max-w-sm relative animate-in zoom-in-95 duration-200">
                  <button onClick={() => setShowRatingsModal(null)} className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><X size={18}/></button>
                  <h3 className="font-bold text-lg text-brand-dark mb-1">Customer Reviews</h3>
                  
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 text-center py-4">
                      <p className="text-gray-400 text-sm">No reviews yet for this item.</p>
                  </div>
              </div>
          </div>
      )}

      {/* ACTION SHEET / MODAL (More Options) */}
      {activeMenuPostId && (() => {
          const activePost = posts.find(p => p.id === activeMenuPostId);
          if (!activePost) return null;
          const vendor = getPostVendor(activePost.vendorId);
          if (!vendor) return null;
          const isFavorite = favorites.has(vendor.id);

          return (
              <div className="fixed inset-0 z-[70] flex flex-col justify-end">
                  <div 
                    className="absolute inset-0 bg-black/60 animate-in fade-in duration-200" 
                    onClick={() => setActiveMenuPostId(null)}
                  ></div>
                  
                  <div className="relative bg-white rounded-t-2xl p-5 animate-in slide-in-from-bottom duration-300 pb-safe">
                      <div className="flex items-center mb-5 pb-5 border-b border-gray-100">
                          <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden mr-3 bg-gray-50">
                              <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover"/>
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-1">
                                  {vendor.name}
                                  {vendor.isVerified && <CheckCircle2 size={16} className="text-blue-500 fill-blue-500/10" />}
                              </h3>
                              <div 
                                className="flex items-center text-sm text-gray-500 cursor-pointer hover:text-brand-orange hover:underline"
                                onClick={() => {
                                    onLocationClick(vendor);
                                    setActiveMenuPostId(null);
                                }}
                              >
                                  <MapPin size={12} className="mr-1"/> {vendor.location.address}
                              </div>
                          </div>
                          <button onClick={() => setActiveMenuPostId(null)} className="ml-auto p-2 bg-gray-100 rounded-full text-gray-500">
                              <X size={20}/>
                          </button>
                      </div>

                      <div className="space-y-2">
                          <button 
                            onClick={() => {
                                onToggleFavorite(vendor.id);
                            }}
                            className="w-full flex items-center p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                              <Star size={20} className={`mr-3 ${isFavorite ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-700'}`} />
                              <span className="font-bold text-gray-700">{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                          </button>

                          <button 
                             onClick={() => {
                                 onVendorClick(vendor);
                                 setActiveMenuPostId(null);
                             }}
                             className="w-full flex items-center p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                              <Store size={20} className="mr-3 text-gray-700" />
                              <span className="font-bold text-gray-700">Visit Stall Profile</span>
                          </button>

                          <button 
                             onClick={() => setActiveMenuPostId(null)}
                             className="w-full flex items-center justify-center p-3.5 mt-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                              <span className="font-bold text-gray-900">Cancel</span>
                          </button>
                      </div>
                  </div>
              </div>
          );
      })()}

            {role === UserRole.VENDOR && onOpenVendorDashboard && (
                <div className="fixed bottom-20 right-4 md:bottom-12 md:right-12 z-40">
                    <button
                        onClick={onOpenVendorDashboard}
                        className="bg-brand-orange text-white p-3 rounded-full shadow-lg flex items-center gap-2"
                        title="Create New Post"
                    >
                        <Plus size={16} />
                        <span className="hidden md:inline text-sm font-bold">New Post</span>
                    </button>
                </div>
            )}
    </div>
  );
};

export default Feed;

// Vendor-only floating action button handled by Feed host via props
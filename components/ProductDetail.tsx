
import React, { useState } from 'react';
import { ArrowLeft, Share2, Minus, Plus, Info } from 'lucide-react';
import { MenuItem } from '../types';

interface ProductDetailProps {
  product: MenuItem;
  vendorId: string;
  onGoBack: () => void;
  onAddToCart: (product: MenuItem, vendorId: string, qty: number) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, vendorId, onGoBack, onAddToCart }) => {
  const [qty, setQty] = useState(1);

  return (
    <div className="min-h-screen bg-white pb-24 relative z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Hero Image */}
      <div className="relative h-[40vh] w-full">
        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:bg-white transition-colors"
        >
          <ArrowLeft size={20} className="text-brand-dark"/>
        </button>
        <button className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:bg-white transition-colors">
          <Share2 size={20} className="text-brand-dark"/>
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6 -mt-8 relative bg-white rounded-t-3xl min-h-[50vh]">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
        
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-brand-dark leading-tight max-w-[70%]">{product.name}</h1>
          <span className="text-2xl font-bold text-brand-orange">${product.price}</span>
        </div>

        {/* Ingredients Tags */}
        {product.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {product.ingredients.map((ing, i) => (
              <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-100">
                {ing}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center"><Info size={16} className="mr-1.5"/> Description</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description || "A delicious meal prepared with fresh ingredients. Perfect for satisfying your cravings."}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-xl px-2">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-gray-600 hover:text-brand-dark"><Minus size={18}/></button>
            <span className="font-bold text-lg w-8 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="p-3 text-gray-600 hover:text-brand-dark"><Plus size={18}/></button>
          </div>
          <button 
            onClick={() => onAddToCart(product, vendorId, qty)}
            className="flex-1 bg-brand-orange text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-200 active:scale-95 transition-transform flex justify-between px-6"
          >
            <span>Add to Order</span>
            <span>${(product.price * qty).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

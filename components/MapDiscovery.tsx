import React, { useState, useMemo, useEffect } from 'react';
import { Vendor } from '../types';
import { Navigation, Filter, MapPin, ChevronDown } from 'lucide-react';

interface MapDiscoveryProps {
  vendors: Vendor[];
  onVendorSelect: (vendor: Vendor) => void;
  initialSelectedVendorId?: string;
}

const MapDiscovery: React.FC<MapDiscoveryProps> = ({ vendors, onVendorSelect, initialSelectedVendorId }) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(initialSelectedVendorId || null);
  const [maxRadius, setMaxRadius] = useState(5);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);

  // Mock User Location (San Francisco Center for demo)
  const userLat = 37.7749;
  const userLng = -122.4194;

  useEffect(() => {
      if (initialSelectedVendorId) {
          setSelectedVendorId(initialSelectedVendorId);
      }
  }, [initialSelectedVendorId]);

  // Haversine Distance Calculation
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 3958.8; // Radius of the earth in miles
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
      return R * c; // Distance in miles
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
        const distance = getDistance(userLat, userLng, vendor.location.lat, vendor.location.lng);
        // Filter by radius (and mock check for open/delivery if we added those filters)
        return distance <= maxRadius;
    });
  }, [vendors, maxRadius]);

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {/* Map Base */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Map Decor */}
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Header Overlay & Filters */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 bg-gradient-to-b from-white/95 to-transparent pb-12">
        <div className="flex justify-between items-start mb-3">
            <div>
                <h2 className="text-2xl font-bold text-brand-dark">Explore Nearby</h2>
                <p className="text-sm text-gray-500 flex items-center">
                <Navigation size={12} className="mr-1 text-brand-orange" /> 
                Current Location: Downtown
                </p>
            </div>
        </div>
        
        {/* Simple Filter Pills */}
        <div className="flex space-x-2 overflow-x-visible no-scrollbar items-center pr-4 pb-2">
            <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 flex-shrink-0">
                <Filter size={12} className="mr-1 text-gray-500" />
                <span className="text-xs font-bold text-gray-700">Filter:</span>
            </div>

            {/* Radius Filter */}
            <div className="relative">
                <button
                    onClick={() => setShowRadiusSlider(!showRadiusSlider)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border flex-shrink-0 flex items-center gap-1 transition-colors ${showRadiusSlider ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                    <MapPin size={10} /> Radius: {maxRadius} mi <ChevronDown size={10} />
                </button>
                
                {showRadiusSlider && (
                    <div className="absolute top-full mt-2 left-0 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-50 w-56 animate-in zoom-in-95 origin-top-left">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-gray-900">Delivery Distance</span>
                            <span className="text-xs font-black text-brand-orange bg-orange-50 px-2 py-0.5 rounded">{maxRadius} mi</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="1"
                            value={maxRadius}
                            onChange={(e) => setMaxRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                            <span>1 mi</span>
                            <span>20 mi</span>
                        </div>
                    </div>
                )}
            </div>

            <button className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-gray-600 border border-gray-200 flex-shrink-0">
                Open Now
            </button>
            <button className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-gray-600 border border-gray-200 flex-shrink-0">
                Delivery Available
            </button>
        </div>
      </div>

      {/* Overlay for clicking outside filter */}
      {showRadiusSlider && (
          <div className="absolute inset-0 z-0" onClick={() => setShowRadiusSlider(false)}></div>
      )}

      {/* Vendor Pins */}
      <div className="absolute inset-0 mt-16 mb-20 z-0 pointer-events-none">
        <div className="w-full h-full relative pointer-events-auto">
            {filteredVendors.map((vendor, index) => {
                // Pseudo-random placement based on ID hash to simulate geolocation
                // In a real app, calculate x/y based on lat/lng relative to map bounds
                const x = (parseInt(vendor.id, 16) * 17) % 80 + 10; 
                const y = (parseInt(vendor.id, 16) * 23) % 70 + 15;
                
                const isSelected = selectedVendorId === vendor.id;

                return (
                    <div 
                        key={vendor.id}
                        style={{ left: `${x}%`, top: `${y}%`, zIndex: isSelected ? 50 : 20 + index }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300"
                        onClick={() => setSelectedVendorId(vendor.id)}
                    >
                        <div className={`relative flex flex-col items-center ${isSelected ? 'scale-110' : 'scale-100 hover:scale-105'}`}>
                            <div className={`w-12 h-12 rounded-full border-2 overflow-hidden shadow-lg ${isSelected ? 'border-brand-orange' : 'border-white'}`}>
                                <img src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover" />
                            </div>
                            {isSelected && (
                                <div className="absolute bottom-full mb-2 bg-white px-3 py-2 rounded-xl shadow-xl w-40 text-center animate-bounce-short">
                                    <h3 className="font-bold text-sm truncate">{vendor.name}</h3>
                                    <p className="text-[10px] text-gray-500 mb-1 flex justify-center items-center">
                                        <MapPin size={10} className="mr-0.5"/> Fast Food
                                    </p>
                                    <button 
                                        className="mt-1 w-full bg-brand-dark text-white text-xs py-1.5 rounded-md font-bold shadow-md hover:bg-gray-800"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onVendorSelect(vendor);
                                        }}
                                    >
                                        View Menu
                                    </button>
                                </div>
                            )}
                            {!isSelected && (
                                <div className="mt-1 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm flex items-center gap-1">
                                    <span>{vendor.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            
            {/* User Location Pulse */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md z-10 relative"></div>
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MapDiscovery;
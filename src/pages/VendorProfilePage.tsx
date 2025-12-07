import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VendorProfile from '../components/VendorProfile';
import { useAppContext } from '../context/AppContext';
import { Vendor } from '../types';

interface VendorProfilePageProps {
    vendorSlug?: string;
    view?: 'menu' | 'info';
}

const VendorProfilePage: React.FC<VendorProfilePageProps> = ({ vendorSlug, view }) => {
    const { vendorId } = useParams<{ vendorId: string }>();
    const {
        vendors,
        posts,
        cart,
        favorites,
        userProfile,
        toggleFavorite,
        addToCart,
        updateCartQuantity
    } = useAppContext();

    const navigate = useNavigate();
    const [vendor, setVendor] = useState<Vendor | null>(null);

    useEffect(() => {
        let found: Vendor | undefined;

        if (vendorSlug) {
            // In a real app, we'd query by slug. For now, assume slug might be ID or name-based
            // Simple mock: find by ID if slug matches ID, or just pick first for demo if "vendor"
            found = vendors.find(v => v.id === vendorSlug || v.name.toLowerCase().replace(/\s+/g, '-') === vendorSlug);
            if (!found && vendorSlug === 'vendor') found = vendors[0]; // Fallback for demo
        } else if (vendorId) {
            found = vendors.find(v => v.id === vendorId);
        }

        setVendor(found || null);
    }, [vendorId, vendorSlug, vendors]);

    if (!vendor) {
        return <div className="p-10 text-center">Vendor not found</div>;
    }

    const vendorPosts = posts.filter(p => p.vendorId === vendor.id);
    const isFav = favorites.has(vendor.id);

    return (
        <VendorProfile
            vendor={vendor}
            posts={vendorPosts}
            cartItems={cart}
            isFavorite={isFav}
            currentUserPoints={userProfile.loyaltyPoints[vendor.id] || 0}
            onBack={() => navigate(-1)}
            onToggleFavorite={toggleFavorite}
            onProductClick={(item) => {
                // Handle product click - maybe open modal or go to detail page
                console.log('Product clicked', item);
            }}
            onMessageClick={() => {
                navigate('/chat');
            }}
            onViewBag={() => {
                navigate('/orders');
            }}
            onLocationClick={() => {
                navigate('/map');
            }}
            onUpdateCart={(item, delta) => {
                if (delta > 0) addToCart(item, vendor.id, delta);
                else updateCartQuantity(item.id, delta);
            }}
        />
    );
};

export default VendorProfilePage;

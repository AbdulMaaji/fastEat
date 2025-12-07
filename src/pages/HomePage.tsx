import React from 'react';
import Feed from '../components/Feed';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const {
        posts,
        cart,
        vendors,
        favorites,
        toggleFavorite,
        currentUserRole
    } = useAppContext();

    const navigate = useNavigate();

    const handleOrderClick = (itemId: string) => {
        // Logic to handle order click - might need to be moved to context or kept here if simple
        console.log('Order clicked', itemId);
        // For now, just navigate to vendor profile or add to cart logic
    };

    const handleFeedProductClick = (itemId: string) => {
        // Find vendor and navigate
        for (const vendor of vendors) {
            const foundItem = vendor.menu.find(m => m.id === itemId);
            if (foundItem) {
                navigate(`/profile/${vendor.id}`);
                break;
            }
        }
    };

    return (
        <Feed
            posts={posts}
            cartItems={cart}
            onOrderClick={handleOrderClick}
            onProductClick={handleFeedProductClick}
            vendors={vendors}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onVendorClick={(vendor) => navigate(`/profile/${vendor.id}`)}
            onLocationClick={(vendor) => {
                // Set selected vendor in context if needed, then nav
                navigate('/map');
            }}
            role={currentUserRole}
            onOpenVendorDashboard={() => { }} // TODO: Handle vendor dashboard route
        />
    );
};

export default HomePage;

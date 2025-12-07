import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Notifications from '../components/Notifications';
import { useAppContext } from '../context/AppContext';
import { UserRole, OrderStatus } from '../types';
import { Heart, ChevronRight } from 'lucide-react';

const MainLayout: React.FC = () => {
    const {
        currentUser,
        currentUserRole,
        cart,
        notifications,
        removeNotification,
        orders,
        setOrders,
        favorites,
        toggleFavorite
    } = useAppContext();

    const location = useLocation();
    const activeTab = location.pathname.substring(1) || 'feed';

    // Helper for active order
    const activeGlobalOrder = orders.find(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-brand-gray font-sans text-brand-dark">
            <Notifications notifications={notifications} onClose={removeNotification} />

            {/* GLOBAL FIXED HEADER */}
            <div className="fixed top-0 left-0 w-full z-[60] bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between h-[64px]">
                <Link to="/" className="flex items-center space-x-1">
                    <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center transform -rotate-3 shadow-sm">
                        <span className="text-white font-black text-base italic">F</span>
                    </div>
                    <span className="text-xl font-black text-brand-dark tracking-tighter italic">FastEat<span className="text-brand-orange">.</span></span>
                </Link>

                <div className="flex items-center space-x-3">
                    {activeGlobalOrder && (
                        <Link to="/orders" className="bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-full px-3 py-1.5 flex items-center gap-2 transition-colors">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                            </div>
                            <span className="text-[10px] font-bold text-brand-dark truncate max-w-[100px]">
                                Order Update
                            </span>
                        </Link>
                    )}
                    {/* Favorites Button */}
                    <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-brand-red transition-colors">
                        <Heart size={18} />
                    </button>
                    {/* Auth Status */}
                    {currentUser ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold hidden sm:inline">{currentUser.username}</span>
                            <Link to="/profile">
                                <img src={currentUser.avatar || 'https://via.placeholder.com/32'} className="w-8 h-8 rounded-full bg-gray-200 border border-gray-100 object-cover" alt="Profile" />
                            </Link>
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-1.5 bg-brand-dark text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors">
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* NAVIGATION SIDEBAR */}
            {currentUserRole !== UserRole.DRIVER && (
                <Navigation
                    currentTab={activeTab}
                    onTabChange={() => { }} // Navigation handles links now
                    role={currentUserRole}
                    cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
                />
            )}

            {/* MAIN CONTENT */}
            <main className="flex-1 min-w-0 pt-[65px] pb-20 md:pb-0">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;

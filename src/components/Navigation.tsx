import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, ShoppingBag, MessageCircle, User } from 'lucide-react';
import { UserRole } from '../types';

interface NavigationProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
    role: UserRole;
    cartCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ cartCount }) => {
    const navItems = [
        { id: 'feed', icon: Home, label: 'Feed', path: '/' },
        { id: 'map', icon: Compass, label: 'Explore', path: '/map' },
        { id: 'orders', icon: ShoppingBag, label: 'Bag', path: '/orders', badge: cartCount },
        { id: 'chat', icon: MessageCircle, label: 'Chat', path: '/chat' },
        { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-4 z-50 flex justify-between md:hidden">
            {navItems.map(item => (
                <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-600'}`
                    }
                >
                    <div className="relative">
                        <item.icon size={22} strokeWidth={2.5} />
                        {item.badge && item.badge > 0 && (
                            <span className="absolute -top-1 -right-2 bg-brand-dark text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                {item.badge}
                            </span>
                        )}
                    </div>
                </NavLink>
            ))}
        </div>
    );
};

export default Navigation;

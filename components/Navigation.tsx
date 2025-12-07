import React from 'react';
import { Home, Map, ShoppingBag, MessageSquare, User, ChefHat, Truck } from 'lucide-react';
import { UserRole } from '../types';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  role: UserRole;
  cartCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, role, cartCount }) => {
  const getButtonClass = (tabName: string) => 
    `group relative flex items-center justify-center md:justify-start md:px-4 md:w-full p-3 rounded-xl md:rounded-2xl transition-all duration-300 ${
      currentTab === tabName 
        ? 'text-brand-dark md:text-brand-orange md:bg-orange-50' 
        : 'text-gray-400 hover:text-gray-600 md:hover:bg-gray-50'
    }`;

  return (
    <>
      {/* 
        RESPONSIVE NAVIGATION CONTAINER 
        Mobile: Fixed bottom, full width, no radius, border top.
        Desktop (md+): Sticky left sidebar, full height column, icons + text.
      */}
      <div className="
        z-50 transition-all duration-300
        
        /* Mobile Styles */
        fixed bottom-0 left-0 right-0
        h-16
        bg-white/95 backdrop-blur-md
        border-t border-gray-100
        flex flex-row items-center justify-around px-2 pb-safe
        
        /* Desktop Styles */
        md:relative md:inset-auto md:transform-none
        md:w-64 md:h-screen md:sticky md:top-0
        md:flex-col md:justify-start md:pt-24 md:space-y-2 md:px-4
        md:border-r md:border-t-0 md:shadow-none md:bg-white md:flex-shrink-0
      ">
        
        <button onClick={() => onTabChange('feed')} className={getButtonClass('feed')} title="Feed">
          <Home size={22} strokeWidth={currentTab === 'feed' ? 2.5 : 2} />
          <span className="hidden md:block ml-3 font-medium text-sm">Feed</span>
        </button>

        <button onClick={() => onTabChange('map')} className={getButtonClass('map')} title="Discovery">
          <Map size={22} strokeWidth={currentTab === 'map' ? 2.5 : 2} />
          <span className="hidden md:block ml-3 font-medium text-sm">Discovery</span>
        </button>

        {role === UserRole.CUSTOMER && (
          <button onClick={() => onTabChange('orders')} className={getButtonClass('orders')} title="Orders">
            <div className="relative">
              <ShoppingBag size={22} strokeWidth={currentTab === 'orders' ? 2.5 : 2} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-red text-white text-[9px] font-bold flex items-center justify-center rounded-full animate-bounce-short ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden md:block ml-3 font-medium text-sm">My Bag</span>
          </button>
        )}
        
        {role === UserRole.VENDOR && (
          <button 
            onClick={() => onTabChange('vendor-dash')} 
            className={`
              group relative flex items-center justify-center md:justify-start md:px-4 md:w-full p-3 rounded-2xl transition-all duration-300
              ${currentTab === 'vendor-dash' 
                ? 'text-brand-dark md:bg-brand-dark md:text-white md:hover:bg-gray-800' 
                : 'text-gray-400 hover:text-gray-600'}
            `}
            title="Vendor Dashboard"
          >
            <ChefHat size={22} />
            <span className="hidden md:block ml-3 font-medium text-sm">Dashboard</span>
          </button>
        )}

        {role === UserRole.DRIVER && (
           <button 
             onClick={() => onTabChange('driver-dash')} 
             className={`
               group relative flex items-center justify-center md:justify-start md:px-4 md:w-full p-3 rounded-2xl transition-all duration-300
               ${currentTab === 'driver-dash' 
                 ? 'text-brand-dark md:bg-brand-dark md:text-white md:hover:bg-gray-800' 
                 : 'text-gray-400 hover:text-gray-600'}
             `}
             title="Driver Portal"
           >
             <Truck size={22} />
             <span className="hidden md:block ml-3 font-medium text-sm">Driver Log</span>
           </button>
        )}

        <button onClick={() => onTabChange('chat')} className={getButtonClass('chat')} title="Chat">
          <MessageSquare size={22} strokeWidth={currentTab === 'chat' ? 2.5 : 2} />
          <span className="hidden md:block ml-3 font-medium text-sm">Messages</span>
        </button>

        <button onClick={() => onTabChange('profile')} className={getButtonClass('profile')} title="Profile">
          <User size={22} strokeWidth={currentTab === 'profile' ? 2.5 : 2} />
          <span className="hidden md:block ml-3 font-medium text-sm">Profile</span>
        </button>

        {/* Desktop Only: Bottom Actions / Decor */}
        <div className="hidden md:flex flex-1 flex-col justify-end pb-8 w-full items-center opacity-50">
            <div className="text-[10px] text-gray-400 font-medium">v1.1.0</div>
        </div>

      </div>
    </>
  );
};

export default Navigation;
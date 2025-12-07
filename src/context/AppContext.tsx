import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, User as AppUser, Post, Vendor, Order, CartItem, MenuItem, OrderStatus, UserProfile, Driver } from '../types';

interface AppContextType {
    // Auth
    currentUser: AppUser | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
    currentUserRole: UserRole;
    setCurrentUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;

    // Data
    vendors: Vendor[];
    setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
    drivers: Driver[];
    setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
    posts: Post[];
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

    // Cart
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    addToCart: (item: MenuItem, vendorId: string, qty?: number) => void;
    updateCartQuantity: (itemId: string, delta: number) => void;
    clearCart: () => void;

    // UI State
    favorites: Set<string>;
    toggleFavorite: (vendorId: string) => void;
    notifications: NotificationItem[];
    addNotification: (n: Omit<NotificationItem, 'id'>) => void;
    removeNotification: (id: string) => void;

    // Location
    currentLocation: string;
    setCurrentLocation: React.Dispatch<React.SetStateAction<string>>;
}

interface NotificationItem { id: string; title?: string; message: string; type?: 'info' | 'success' | 'warning' | 'error'; }

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Auth State
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.CUSTOMER);
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '',
        bio: 'Hungry user.',
        avatar: 'https://via.placeholder.com/150',
        loyaltyPoints: {},
        savedAddresses: []
    });

    // Data State
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);

    // UI State
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [currentLocation, setCurrentLocation] = useState('Select Location');

    // Helpers
    const addNotification = (n: Omit<NotificationItem, 'id'>) => {
        const id = `n-${Date.now()}`;
        const item: NotificationItem = { id, ...n };
        setNotifications(prev => [item, ...prev]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(x => x.id !== id));
        }, 6000);
    };

    const removeNotification = (id: string) => setNotifications(prev => prev.filter(x => x.id !== id));

    const addToCart = (item: MenuItem, vendorId: string, qty: number = 1) => {
        setCart(prev => {
            const existing = prev.find(i => i.menuItem.id === item.id);
            if (existing) {
                return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
            }
            // Check if adding from different vendor
            if (prev.length > 0 && prev[0].vendorId !== vendorId) {
                if (!confirm('Start a new basket? Adding items from a different vendor will clear your current cart.')) {
                    return prev;
                }
                return [{ menuItem: item, quantity: qty, vendorId }];
            }
            return [...prev, { menuItem: item, quantity: qty, vendorId }];
        });
    };

    const updateCartQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.menuItem.id === itemId) {
                    return { ...item, quantity: Math.max(0, item.quantity + delta) };
                }
                return item;
            }).filter(item => item.quantity > 0);
        });
    };

    const clearCart = () => setCart([]);

    const toggleFavorite = (vendorId: string) => {
        setFavorites(prev => {
            const newFavs = new Set(prev);
            if (newFavs.has(vendorId)) {
                newFavs.delete(vendorId);
            } else {
                newFavs.add(vendorId);
            }
            return newFavs;
        });
    };

    // Initial Effects
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation('Current Location');
                },
                (error) => {
                    console.log('Location access denied or error', error);
                }
            );
        }
    }, []);

    return (
        <AppContext.Provider value={{
            currentUser, setCurrentUser,
            currentUserRole, setCurrentUserRole,
            userProfile, setUserProfile,
            vendors, setVendors,
            drivers, setDrivers,
            posts, setPosts,
            orders, setOrders,
            cart, setCart,
            addToCart, updateCartQuantity, clearCart,
            favorites, toggleFavorite,
            notifications, addNotification, removeNotification,
            currentLocation, setCurrentLocation
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

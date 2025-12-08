import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, User as AppUser, Post, Vendor, Order, CartItem, MenuItem, OrderStatus, UserProfile, Driver } from '../types';
import { api } from '../services/api';

interface AppContextType {
    // Auth
    currentUser: AppUser | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
    currentUserRole: UserRole;
    userProfile: UserProfile;
    login: (credentials: any) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => void;

    // Data
    vendors: Vendor[];
    drivers: Driver[];
    posts: Post[];
    orders: Order[];

    // Cart
    cart: CartItem[];
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
        bio: '',
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
            const next = new Set(prev);
            if (next.has(vendorId)) {
                next.delete(vendorId);
            } else {
                next.add(vendorId);
            }
            return next;
        });
    };

    const login = async (credentials: any) => {
        try {
            const res = await api.login(credentials);
            if (res.access) {
                localStorage.setItem('accessToken', res.access);
                localStorage.setItem('refreshToken', res.refresh);
                // Fetch user
                const user = await api.getMe();
                setCurrentUser(user);
                setCurrentUserRole(user.role);
                addNotification({ message: 'Logged in successfully', type: 'success' });
            }
        } catch (err: any) {
            addNotification({ message: err.message || 'Login failed', type: 'error' });
            throw err;
        }
    };

    // Sync currentUser to userProfile
    useEffect(() => {
        if (currentUser) {
            setUserProfile(prev => ({
                ...prev,
                name: currentUser.username,
                email: currentUser.email,
                phone: currentUser.phone_number || prev.phone,
                avatar: currentUser.avatar || prev.avatar
            }));
        }
    }, [currentUser]);

    const signup = async (data: any) => {
        try {
            const res = await api.signup(data);
            if (res.access) {
                localStorage.setItem('accessToken', res.access);
                localStorage.setItem('refreshToken', res.refresh);
                // Fetch user
                const user = await api.getMe();
                setCurrentUser(user);
                setCurrentUserRole(user.role);
                addNotification({ message: 'Account created!', type: 'success' });
            }
        } catch (err: any) {
            addNotification({ message: err.message || 'Signup failed', type: 'error' });
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setCurrentUser(null);
        setCurrentUserRole(UserRole.CUSTOMER);
        setCart([]);
        addNotification({ message: 'Logged out', type: 'info' });
    };

    // Initial Effects
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const user = await api.getMe();
                    setCurrentUser(user);
                    setCurrentUserRole(user.role);
                } catch (e) {
                    console.error("Token invalid", e);
                    logout();
                }
            }
        };
        checkAuth();

        api.getVendors().then(vs => {
            setVendors(vs);
        }).catch(err => console.error("Failed to load vendors", err));

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
            currentUserRole,
            userProfile,
            login, signup, logout,
            vendors,
            drivers,
            posts,
            orders,
            cart, addToCart, updateCartQuantity, clearCart,
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

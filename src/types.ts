export enum UserRole {
    CUSTOMER = 'customer',
    VENDOR = 'vendor',
    DRIVER = 'driver',
    ADMIN = 'admin'
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    phone_number?: string;
    avatar?: string;
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    bio: string;
    avatar: string;
    loyaltyPoints: Record<string, number>;
    savedAddresses: string[];
}

export interface MenuItem {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    ingredients: string[];
    available: boolean;
}

export interface Vendor {
    id: string;
    name: string;
    bio: string;
    avatar: string;
    cover_image: string;
    isOpen: boolean;
    isVerified: boolean;
    rating: number;
    ratingCount: number;
    followers: number;
    deliveryEnabled: boolean;
    deliveryFee: number;
    minDeliveryTime: number;
    maxDeliveryTime: number;
    location: { lat?: number, lng?: number, address?: string };
    menu: MenuItem[];
    walletBalance?: number;
}

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    vendorId: string;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    PREPARING = 'PREPARING',
    READY = 'READY',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface Order {
    id: string;
    vendorId: string;
    customerId: string;
    driverId?: string;
    items: CartItem[];
    total: number;
    status: OrderStatus;
    timestamp: number;
    type: 'DELIVERY' | 'PICKUP' | 'DINE_IN';
    deliveryAddress?: string;
    pendingDriverId?: string;
}

export interface Driver {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    location?: { lat: number, lng: number };
    currentOrderId?: string;
    deliveryFee?: number;
    minDeliveryTime?: number;
    maxDeliveryTime?: number;
}

export interface Post {
    id: string;
    vendorId: string;
    vendorName: string;
    vendorAvatar: string;
    image: string;
    caption: string;
    likes: number;
    shares: number;
    purchaseCount: number;
    rating: number;
    timestamp: number;
    ingredients?: string[];
}

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
}

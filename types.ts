export enum UserRole {
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  avatar?: string;
}

export interface Vendor {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  coverImage: string;
  isOpen: boolean;
  isVerified?: boolean; // New: Verification badge
  rating: number;
  ratingCount: number;
  followers: number; // New: "Customers" count
  loyaltyProgramEnabled: boolean; // New: Toggle for loyalty
  location: {
      lat: number;
      lng: number;
      address: string;
  };
  menu: MenuItem[];
  deliveryEnabled: boolean;
  deliveryFee: number;
  minDeliveryTime: number;
  maxDeliveryTime: number;
  walletBalance?: number; 
  ownerUserId?: string;
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

export interface InteractionUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

export interface Post {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  image: string;
  caption: string;
  menuItemId?: string; 
  likes: number;
  shares: number;
  purchaseCount?: number; // New: Number of times bought
  rating?: number;        // New: Rating for this specific item/post
  timestamp: number;
  ingredients?: string[];
  likedBy?: InteractionUser[];
  sharedBy?: InteractionUser[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  vendorId: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    bio: string;
    avatar: string;
    loyaltyPoints: Record<string, number>; // vendorId -> points
    savedAddresses: SavedAddress[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  AWAITING_ACCEPTANCE = 'AWAITING_ACCEPTANCE',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  NEARBY = 'NEARBY',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Driver {
    id: string;
    name: string;
    avatar: string;
    vehicle: string;
    plateNumber: string;
    rating: number;
    phone: string;
    isOnline: boolean;
    workingHours: {
        start: string; 
        end: string;   
    };
    walletBalance?: number;
    earningsHistory?: {
        date: string;
        amount: number;
        orderId?: string;
    }[];
  // Optional delivery preferences set by driver
  deliveryFee?: number;
  minDeliveryTime?: number;
  maxDeliveryTime?: number;
}

export interface Order {
  id: string;
  vendorId: string;
  customerId: string;
  driverId?: string;
  // When a vendor assigns an order, we mark a pending driver who must accept/decline
  pendingDriverId?: string;
  assignRequestedAt?: number;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  type: 'PICKUP' | 'DELIVERY';
  timestamp: number;
  preferredTime?: number; 
  isRated?: boolean;
  userRating?: number;
  deliveryLocation?: {
      address: string;
      lat?: number;
      lng?: number;
  };
  driverLocation?: {
      lat: number;
      lng: number;
  };
  pointsRedeemed?: number;
  pointsEarned?: number;
  deliveryFee?: number; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}
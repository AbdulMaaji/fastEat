import { Order, Vendor, OrderStatus, User, UserRole } from '../types';

const API_Base = 'http://localhost:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    // Auth
    async login(credentials: { username?: string; email?: string; password: string }) {
        const res = await fetch(`${API_Base}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Login failed');
        }
        return res.json();
    },

    async signup(data: any) {
        const res = await fetch(`${API_Base}/auth/signup/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            // Handle django field errors
            const msg = Object.keys(err).map(k => `${k}: ${err[k]}`).join('\n');
            throw new Error(msg || 'Signup failed');
        }
        return res.json();
    },

    async getMe(): Promise<User> {
        const res = await fetch(`${API_Base}/auth/me/`, {
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
    },

    // Data
    async getVendors(): Promise<Vendor[]> {
        const res = await fetch(`${API_Base}/vendors/`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch vendors');
        return res.json();
    },

    async createOrder(orderData: any): Promise<Order> {
        const res = await fetch(`${API_Base}/orders/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderData),
        });
        if (!res.ok) throw new Error('Failed to create order');
        return res.json();
    },

    async getOrders(): Promise<Order[]> {
        const res = await fetch(`${API_Base}/orders/`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    },

    async getOrderStatus(orderId: string): Promise<OrderStatus> {
        const res = await fetch(`${API_Base}/orders/${orderId}/`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch order status');
        const data = await res.json();
        return data.status;
    }
};

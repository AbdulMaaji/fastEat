import { Order, Vendor, OrderStatus } from '../types';

const API_Base = 'http://localhost:8000/api';

export const api = {
    async getVendors(): Promise<Vendor[]> {
        const res = await fetch(`${API_Base}/vendors/`);
        if (!res.ok) throw new Error('Failed to fetch vendors');
        return res.json();
    },

    async createOrder(orderData: any): Promise<Order> {
        const res = await fetch(`${API_Base}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        if (!res.ok) throw new Error('Failed to create order');
        return res.json();
    },

    async getOrders(): Promise<Order[]> {
        const res = await fetch(`${API_Base}/orders/`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    },

    async getOrderStatus(orderId: string): Promise<OrderStatus> {
        const res = await fetch(`${API_Base}/orders/${orderId}/`);
        if (!res.ok) throw new Error('Failed to fetch order status');
        const data = await res.json();
        return data.status;
    }
};

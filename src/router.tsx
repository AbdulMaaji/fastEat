import React from 'react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import VendorLayout from './layouts/VendorLayout';
import HomePage from './pages/HomePage';
import VendorProfilePage from './pages/VendorProfilePage';
import ChatPage from './pages/ChatPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrdersPage from './pages/OrdersPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';

// Helper to check for subdomain
const getSubdomain = () => {
    const host = window.location.host;
    const parts = host.split('.');
    // localhost:3000 -> parts.length = 1 (no subdomain) or 2 if localhost.com (unlikely)
    // vendor.fasteat.com -> parts.length = 3 (subdomain = vendor)
    // vendor.localhost:3000 -> parts.length = 2 (subdomain = vendor)

    if (parts.length > 2 && parts[0] !== 'www') {
        return parts[0];
    }
    // For local testing with localhost subdomains (needs hosts file edit usually, or just assume path routing for now)
    if (host.includes('localhost') && parts.length > 1) {
        return parts[0];
    }
    return null;
};

const subdomain = getSubdomain();

const router = createBrowserRouter(
    createRoutesFromElements(
        subdomain ? (
            <Route element={<VendorLayout />}>
                <Route path="/" element={<VendorProfilePage vendorSlug={subdomain} />} />
                <Route path="/menu" element={<VendorProfilePage vendorSlug={subdomain} view="menu" />} />
            </Route>
        ) : (
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/feed" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/history" element={<OrderHistoryPage />} />
                <Route path="/profile/:vendorId" element={<VendorProfilePage />} />
            </Route>
        )
    )
);

export const AppRouter: React.FC = () => {
    return <RouterProvider router={router} />;
};

import React from 'react';
import { Outlet } from 'react-router-dom';
import Notifications from '../components/Notifications';
import { useAppContext } from '../context/AppContext';

const VendorLayout: React.FC = () => {
    const { notifications, removeNotification } = useAppContext();

    return (
        <div className="min-h-screen bg-white font-sans text-brand-dark">
            <Notifications notifications={notifications} onClose={removeNotification} />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default VendorLayout;

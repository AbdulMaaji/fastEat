import React from 'react';

interface NotificationItem {
    id: string;
    title?: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationsProps {
    notifications: NotificationItem[];
    onClose: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
            {notifications.map(n => (
                <div key={n.id} className="w-80 bg-white shadow-lg border border-gray-100 rounded-xl p-3">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            {n.title && <div className="font-bold text-sm text-gray-900 mb-1">{n.title}</div>}
                            <div className="text-[13px] text-gray-600">{n.message}</div>
                        </div>
                        <div>
                            <button onClick={() => onClose(n.id)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Notifications;

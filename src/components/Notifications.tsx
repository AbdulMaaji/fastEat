import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface NotificationItem {
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
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-[70] space-y-2 pointer-events-none">
            {notifications.map(n => (
                <div
                    key={n.id}
                    className="pointer-events-auto bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[280px] max-w-sm flex items-start gap-3 animate-in fade-in slide-in-from-right-4 duration-300"
                >
                    <div className={`mt-0.5 ${n.type === 'success' ? 'text-green-500' :
                            n.type === 'error' ? 'text-red-500' :
                                n.type === 'warning' ? 'text-yellow-500' :
                                    'text-blue-500'
                        }`}>
                        {n.type === 'success' && <CheckCircle size={18} />}
                        {n.type === 'error' && <AlertCircle size={18} />}
                        {n.type === 'warning' && <AlertCircle size={18} />}
                        {(!n.type || n.type === 'info') && <Info size={18} />}
                    </div>
                    <div className="flex-1">
                        {n.title && <h4 className="font-bold text-sm text-gray-900">{n.title}</h4>}
                        <p className="text-xs text-gray-600 font-medium">{n.message}</p>
                    </div>
                    <button onClick={() => onClose(n.id)} className="text-gray-400 hover:text-gray-600">
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Notifications;

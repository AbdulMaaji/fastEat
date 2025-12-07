import React from 'react';
import Chat from '../components/Chat';
import { useAppContext } from '../context/AppContext';

const ChatPage: React.FC = () => {
    const { currentUserRole, vendors, orders } = useAppContext();

    return (
        <Chat
            currentUserRole={currentUserRole}
            vendors={vendors}
            allOrders={orders}
            onQuickOrder={(items) => console.log('Quick order', items)}
        />
    );
};

export default ChatPage;

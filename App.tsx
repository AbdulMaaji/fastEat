import React from 'react';
import { AppProvider } from './src/context/AppContext';
import { AppRouter } from './src/router';

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppRouter />
        </AppProvider>
    );
};

export default App;
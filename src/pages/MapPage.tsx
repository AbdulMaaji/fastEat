import React from 'react';
import MapDiscovery from '../components/MapDiscovery';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const MapPage: React.FC = () => {
    const { vendors } = useAppContext();
    const navigate = useNavigate();

    return (
        <MapDiscovery
            vendors={vendors}
            onVendorSelect={(vendor) => navigate(`/profile/${vendor.id}`)}
            initialSelectedVendorId={undefined}
        />
    );
};

export default MapPage;

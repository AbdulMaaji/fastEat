import React from 'react';
import { Vendor } from '../types';

interface MapDiscoveryProps {
    vendors: Vendor[];
    onVendorSelect: (vendor: Vendor) => void;
    initialSelectedVendorId?: string;
}

const MapDiscovery: React.FC<MapDiscoveryProps> = ({ vendors, onVendorSelect }) => {
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Map View</h1>
            <div className="grid gap-4">
                {vendors.map(v => (
                    <div
                        key={v.id}
                        onClick={() => onVendorSelect(v)}
                        className="p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                    >
                        <div className="font-bold">{v.name}</div>
                        <div className="text-sm text-gray-500">{v.location?.address || 'No address'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapDiscovery;

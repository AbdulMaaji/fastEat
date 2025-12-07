
import React, { useEffect, useState } from 'react';
import { OrderStatus } from '../types';

interface RouteMapProps {
    status: OrderStatus;
    vendorAvatar: string;
    customerAddress?: string;
    isDriverView?: boolean;
    // optional coordinates for a simple mock route
    vendorCoords?: { lat: number; lng: number };
    customerCoords?: { lat: number; lng: number };
}

const RouteMap: React.FC<RouteMapProps> = ({ status, vendorAvatar, customerAddress, isDriverView, vendorCoords, customerCoords }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let target = 0;
        switch (status) {
            case OrderStatus.PENDING:
                target = 0;
                break;
            case OrderStatus.PREPARING:
                target = 5;
                break;
            case OrderStatus.DRIVER_ASSIGNED:
                target = 15;
                break;
            case OrderStatus.PICKED_UP:
                target = 40;
                break;
            case OrderStatus.NEARBY:
                target = 85;
                break;
            case OrderStatus.ARRIVED:
            case OrderStatus.COMPLETED:
                target = 100;
                break;
            default:
                target = 0;
        }

        const timer = setTimeout(() => setProgress(target), 120);
        return () => clearTimeout(timer);
    }, [status]);

    const renderMockRoute = () => {
        const defaultStart = { x: 80, y: 50 };
        const defaultEnd = { x: 920, y: 50 };

        const toPoint = (c?: { lat: number; lng: number }) => {
            if (!c) return null;
            const x = ((c.lng + 180) / 360) * 1000;
            const y = (1 - (c.lat + 90) / 180) * 300;
            return { x, y };
        };

        const start = toPoint(vendorCoords) || defaultStart;
        const end = toPoint(customerCoords) || defaultEnd;

        const dx = (end.x - start.x) / 2;
        const control1 = { x: start.x + dx * 0.3, y: start.y - 60 };
        const control2 = { x: start.x + dx * 0.7, y: end.y + 60 };

        const path = `M ${start.x},${start.y} C ${control1.x},${control1.y} ${control2.x},${control2.y} ${end.x},${end.y}`;

        const t = Math.min(1, Math.max(0, progress / 100));
        const markerX = start.x + (end.x - start.x) * t;
        const markerY = start.y + (end.y - start.y) * t;

        return (
            <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="routeGrad" x1="0%" x2="100%">
                        <stop offset="0%" stopColor="#ffd6a5" />
                        <stop offset="100%" stopColor="#ff7b00" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="#f8fafc" />
                <path d={path} fill="none" stroke="#e6e7ea" strokeWidth={18} strokeLinecap="round" />
                <path d={path} fill="none" stroke="url(#routeGrad)" strokeWidth={10} strokeLinecap="round" strokeDasharray={Math.max(1, t * 1000)} />

                <g transform={`translate(${start.x}, ${start.y})`}>
                    <circle r={14} fill="#fff" stroke="#ddd" strokeWidth={2} />
                    <image href={vendorAvatar} x={-12} y={-12} height={24} width={24} />
                </g>

                <g transform={`translate(${end.x}, ${end.y})`}>
                    <circle r={14} fill="#ff7b00" stroke="#fff" strokeWidth={3} />
                    <g transform="translate(-6,-6)">
                        <text x={0} y={8} fontSize={12} fill="#fff">📍</text>
                    </g>
                </g>

                <g transform={`translate(${markerX}, ${markerY})`}>
                    <circle r={12} fill="#111827" />
                    {isDriverView ? (
                        <g transform="translate(-6,-6)">
                            <text x={0} y={8} fontSize={12} fill="#ffcc88">➡</text>
                        </g>
                    ) : null}
                </g>

                {customerAddress && (
                    <foreignObject x={Math.max(0, end.x - 80)} y={Math.max(0, end.y + 10)} width={160} height={40}>
                        <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.7)', padding: '6px', borderRadius: 8 }}>
                            {customerAddress}
                        </div>
                    </foreignObject>
                )}
            </svg>
        );
    };

    return (
        <div className="relative w-full h-full bg-slate-100 overflow-hidden rounded-2xl border border-gray-200 shadow-inner">
            {renderMockRoute()}
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm border border-gray-100">
                {progress < 100 ? 'Live Tracking' : 'Arrived'}
            </div>
        </div>
    );
};

export default RouteMap;

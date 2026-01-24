'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Leaflet faqat client-side'da ishlashi uchun guard
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

type Center = {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  rating?: number;
};

type Props = {
  centers?: Center[]; // Ko'p markazlar uchun
  lat?: number;       // Yagona markaz uchun (eski props saqlab qolindi)
  lng?: number;
  zoom?: number;
  className?: string;
};

export default function CenterMapClient({ centers, lat, lng, zoom = 12, className }: Props) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Leaflet'ni dinamik import qilish
    import('leaflet').then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (typeof window === 'undefined' || !L) {
    return <div className={`bg-gray-100 animate-pulse ${className}`} style={{ height: 300 }} />;
  }

  const htmlMarker = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(37,99,235,0.4);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  // Agar centers massivi kelsa, o'shani ishlatsin, bo'lmasa yagona nuqtani
  const markers = centers || (lat && lng ? [{ id: 'single', name: 'Markaz', lat, lng }] : []);
  const centerPos: [number, number] = centers && centers.length > 0 
    ? [centers[0].lat, centers[0].lng] 
    : [lat || 41.311081, lng || 69.240562];

  return (
    <div className={className}>
      <div className="rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
        {/* @ts-ignore */}
        <MapContainer center={centerPos} zoom={zoom} style={{ height: 400, width: '100%' }}>
          {/* @ts-ignore */}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m) => (
            /* @ts-ignore */
            <Marker key={m.id} position={[m.lat, m.lng]} icon={htmlMarker}>
              {/* @ts-ignore */}
              <Popup>
                <div className="p-1 font-sans">
                  <p className="font-bold text-gray-900 m-0">{m.name}</p>
                  {m.rating && <p className="text-xs text-amber-500 m-0">⭐ {m.rating}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

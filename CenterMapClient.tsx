'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// dynamic import of react-leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
};

const htmlMarker = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    background: #111827;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid #fff;
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export default function CenterMapClient({ lat, lng, zoom = 13, className }: Props) {
  // simple guard for cases where leaflet can't run
  if (typeof window === 'undefined') return null;

  return (
    <div className={className}>
      {/* container height control */}
      <div className="rounded-lg overflow-hidden shadow">
        {/* MapContainer must be rendered client-side (we dynamic-import above) */}
        {/* @ts-ignore - MapContainer is dynamically imported */}
        <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: 300, width: '100%' }}>
          {/* @ts-ignore */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* @ts-ignore */}
          <Marker position={[lat, lng]} icon={htmlMarker} />
        </MapContainer>
      </div>
    </div>
  );
}

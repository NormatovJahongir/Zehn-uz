"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Marker ikonkalarini to'g'irlash
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/8066/8066601.png', // O'quv qalpoqchasi ikonasi
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export default function MapComponent({ centers }: { centers: any[] }) {
  const defaultPosition: [number, number] = [41.3111, 69.2797]; // Toshkent

  return (
    <MapContainer center={defaultPosition} zoom={12} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {centers.map((center) => (
        <Marker 
          key={center.id} 
          position={[center.latitude, center.longitude]} 
          icon={customIcon}
        >
          <Popup>
            <div className="p-1 min-w-[150px]">
              <h4 className="font-bold text-lg mb-1">{center.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{center.address}</p>
              <Link 
                href={`/center/${center.id}`}
                className="block text-center bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Batafsil ma'lumot
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

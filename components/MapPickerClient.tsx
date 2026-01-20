'use client';

import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// 1. Props nomlarini page.tsx dagi chaqiruvga moslashtiramiz
type Props = {
  initialPos?: [number, number]; // initialPosition -> initialPos
  zoom?: number;
  onLocationSelect?: (location: { lat: number; lng: number }) => void; // onChange -> onLocationSelect
};

const DefaultZoom = 13;

const htmlMarker = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    background: #2563eb;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function ClickHandler({
  setPosition,
  onLocationSelect,
}: {
  setPosition: (p: [number, number]) => void;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      setPosition([lat, lng]);
      onLocationSelect?.({ lat, lng });
    },
  });
  return null;
}

export default function MapPicker({ 
  initialPos = [41.311081, 69.240562], 
  zoom = DefaultZoom, 
  onLocationSelect 
}: Props) {
  const [position, setPosition] = React.useState<[number, number]>(initialPos);

  function onMarkerDragEnd(e: L.DragEndEvent) {
    const marker = e.target;
    const latlng = marker.getLatLng();
    const lat = Number(latlng.lat.toFixed(6));
    const lng = Number(latlng.lng.toFixed(6));
    setPosition([lat, lng]);
    onLocationSelect?.({ lat, lng });
  }

  return (
    <div className="space-y-4">
      <div className="h-80 rounded-lg overflow-hidden shadow-sm">
        <MapContainer center={position} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler setPosition={setPosition} onLocationSelect={onLocationSelect} />

          <Marker
            position={position}
            icon={htmlMarker}
            draggable
            eventHandlers={{ dragend: onMarkerDragEnd }}
          />
        </MapContainer>
      </div>

      <div className="bg-white rounded-lg p-3 shadow border flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">Latitude</label>
            <input
              readOnly
              value={position[0]}
              className="mt-1 w-full text-sm px-2 py-1 border rounded bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Longitude</label>
            <input
              readOnly
              value={position[1]}
              className="mt-1 w-full text-sm px-2 py-1 border rounded bg-gray-50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onLocationSelect?.({ lat: position[0], lng: position[1] });
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            Tanlash
          </button>

          <button
            type="button"
            onClick={() => {
              const defaultPos: [number, number] = [41.311081, 69.240562];
              setPosition(defaultPos);
              onLocationSelect?.({ lat: defaultPos[0], lng: defaultPos[1] });
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-bold"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

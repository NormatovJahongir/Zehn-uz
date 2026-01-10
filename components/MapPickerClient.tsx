'use client';

import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

type Props = {
  initialPosition?: [number, number];
  zoom?: number;
  // called whenever the user picks/moves the marker
  onChange?: (lat: number, lng: number) => void;
};

const DefaultZoom = 13;

// Use a simple HTML/CSS based marker to avoid image asset issues in Next.js
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
  onChange,
}: {
  setPosition: (p: [number, number]) => void;
  onChange?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      setPosition([lat, lng]);
      onChange?.(lat, lng);
    },
  });
  return null;
}

export default function MapPicker({ initialPosition = [41.311081, 69.240562], zoom = DefaultZoom, onChange }: Props) {
  const [position, setPosition] = React.useState<[number, number]>(initialPosition);

  // when marker is dragged, update position & notify parent
  function onMarkerDragEnd(e: L.DragEndEvent) {
    const marker = e.target;
    const latlng = marker.getLatLng();
    const lat = Number(latlng.lat.toFixed(6));
    const lng = Number(latlng.lng.toFixed(6));
    setPosition([lat, lng]);
    onChange?.(lat, lng);
  }

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="h-80 rounded-lg overflow-hidden shadow-sm">
        <MapContainer center={position} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* allow clicking on the map to set marker */}
          <ClickHandler setPosition={setPosition} onChange={onChange} />

          {/* draggable marker using divIcon */}
          <Marker
            position={position}
            icon={htmlMarker}
            draggable
            eventHandlers={{ dragend: onMarkerDragEnd }}
          />
        </MapContainer>
      </div>

      {/* Coordinates panel */}
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
              // center map on current position by updating state to the same value,
              // MapContainer will keep center but a nicer behaviour would be to use map instance.
              // Parent apps can take the coords via onChange and perform persistence.
              onChange?.(position[0], position[1]);
            }}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Use these coordinates
          </button>

          <button
            type="button"
            onClick={() => {
              // reset to a default (could be adjusted)
              const defaultPos: [number, number] = [41.311081, 69.240562];
              setPosition(defaultPos);
              onChange?.(defaultPos[0], defaultPos[1]);
            }}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
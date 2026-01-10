'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client map so it never runs on the server
const MapPicker = dynamic(() => import('../../../components/MapPickerClient'), { ssr: false });

export default function AdminSettingsPage() {
  // savedCoords represents the admin-selected center location in local UI state.
  const [savedCoords, setSavedCoords] = React.useState<{ lat: number; lng: number } | null>(() => {
    // try hydrate from localStorage for demo persistence
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('admin:center:coords');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // liveCoords are updated as the user interacts with the map; savedCoords only changes when the admin "saves"
  const [liveCoords, setLiveCoords] = React.useState<{ lat: number; lng: number } | null>(
    savedCoords ?? { lat: 41.311081, lng: 69.240562 }
  );

  function handleMapChange(lat: number, lng: number) {
    setLiveCoords({ lat, lng });
  }

  function handleSave() {
    if (!liveCoords) return;
    setSavedCoords(liveCoords);
    // persist to localStorage as a demo — replace with API call to persist to DB
    try {
      localStorage.setItem('admin:center:coords', JSON.stringify(liveCoords));
    } catch {}
  }

  function handleClear() {
    setSavedCoords(null);
    try {
      localStorage.removeItem('admin:center:coords');
    } catch {}
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Admin Settings — Center Location</h1>
            <p className="text-sm text-gray-600">Pick your center on the map. Click the map or drag the marker.</p>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">Saved coords</div>
            <div className="text-sm font-medium text-gray-800">
              {savedCoords ? `${savedCoords.lat}, ${savedCoords.lng}` : 'Not saved'}
            </div>
          </div>
        </header>

        <section className="mb-4">
          <MapPicker
            initialPosition={savedCoords ? [savedCoords.lat, savedCoords.lng] : undefined}
            onChange={(lat, lng) => handleMapChange(lat, lng)}
          />
        </section>

        <section className="flex items-center gap-3">
          <div>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save coordinates
            </button>
          </div>

          <div>
            <button
              onClick={handleClear}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              Clear saved
            </button>
          </div>

          <div className="ml-auto text-sm text-gray-700">
            Live: {liveCoords ? `${liveCoords.lat}, ${liveCoords.lng}` : '—'}
          </div>
        </section>
      </div>
    </main>
  );
}
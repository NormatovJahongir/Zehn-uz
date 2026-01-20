'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Komponentni yuklash
const MapPicker = dynamic(() => import('../../../components/MapPickerClient'), { 
  ssr: false,
  loading: () => <div className="h-80 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Xarita yuklanmoqda...</div>
});

export default function AdminSettingsPage() {
  const [savedCoords, setSavedCoords] = React.useState<{ lat: number; lng: number } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('admin:center:coords');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [liveCoords, setLiveCoords] = React.useState<{ lat: number; lng: number } | null>(
    savedCoords ?? { lat: 41.311081, lng: 69.240562 }
  );

  // MapPicker dan keladigan obyektni qabul qilish uchun funksiyani moslashtiramiz
  function handleMapChange(coords: { lat: number; lng: number }) {
    setLiveCoords(coords);
  }

  function handleSave() {
    if (!liveCoords) return;
    setSavedCoords(liveCoords);
    try {
      localStorage.setItem('admin:center:coords', JSON.stringify(liveCoords));
      alert("Koordinatalar saqlandi!");
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
            <h1 className="text-2xl font-bold text-gray-800">Admin Sozlamalari — Markaz Joylashuvi</h1>
            <p className="text-sm text-gray-600">Xaritadan markazni tanlang. Marker ustiga bosing yoki uni sudrang.</p>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase font-bold">Saqlangan nuqta</div>
            <div className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {savedCoords ? `${savedCoords.lat.toFixed(4)}, ${savedCoords.lng.toFixed(4)}` : 'Saqlanmagan'}
            </div>
          </div>
        </header>

        <section className="mb-6 bg-white p-4 rounded-2xl shadow-sm border">
          {/* TypeScript xatolarini tuzatish: prop nomlarini yangilaymiz */}
          <MapPicker
            initialPos={savedCoords ? [savedCoords.lat, savedCoords.lng] : [41.311081, 69.240562]}
            onLocationSelect={handleMapChange}
          />
        </section>

        <section className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100"
          >
            Koordinatalarni saqlash
          </button>

          <button
            onClick={handleClear}
            className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all font-bold"
          >
            Tozalash
          </button>

          <div className="ml-auto text-xs font-mono text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-dashed">
            Jonli: {liveCoords ? `${liveCoords.lat.toFixed(4)}, ${liveCoords.lng.toFixed(4)}` : '—'}
          </div>
        </section>
      </div>
    </main>
  );
}

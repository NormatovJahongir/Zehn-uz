"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic'; // Dinamik import uchun
import { useLanguage } from '../../context/LanguageContext';
import { Save, Building2, AlignLeft, MapPin, Loader2 } from 'lucide-react';

// MUHIM: MapPickerClient ni faqat brauzerda yuklash uchun dinamik import qilamiz
const MapPickerClient = dynamic(() => import('../../../components/MapPickerClient'), { 
  ssr: false, // Server-side renderingni o'chiradi
  loading: () => (
    <div className="h-80 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200">
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <Loader2 className="animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest">Xarita yuklanmoqda...</span>
      </div>
    </div>
  )
});

export default function CenterSettingsPage() {
  const { currentLang } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lat: 41.311081,
    lng: 69.240562,
  });

  const t = {
    UZ: { title: "Markaz sozlamalari", name: "Markaz nomi", desc: "Tavsif", loc: "Xaritadagi joylashuv", save: "Saqlash", success: "Muvaffaqiyatli saqlandi!" },
    RU: { title: "Настройки центра", name: "Название центра", desc: "Описание", loc: "Местоположение на карте", save: "Сохранить", success: "Успешно сохранено!" },
    EN: { title: "Center Settings", name: "Center Name", desc: "Description", loc: "Location on Map", save: "Save Changes", success: "Successfully saved!" }
  }[currentLang as 'UZ' | 'RU' | 'EN'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/center/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(t.success);
      }
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t.title}</h1>
          <p className="text-gray-500 font-medium">Markazingiz haqidagi ma'lumotlarni tahrirlang</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {t.save}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form bo'limi */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 uppercase tracking-tighter">
                <Building2 size={16} className="text-blue-500" /> {t.name}
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium transition-all outline-none"
                placeholder="Masalan: Zehn Akademiyasi"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 uppercase tracking-tighter">
                <AlignLeft size={16} className="text-blue-500" /> {t.desc}
              </label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium transition-all outline-none resize-none"
                placeholder="Markaz haqida qisqacha..."
              />
            </div>
          </div>
        </div>

        {/* Xarita bo'limi */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4 uppercase tracking-tighter">
              <MapPin size={18} className="text-blue-500" /> {t.loc}
            </label>
            
            <MapPickerClient 
              initialPos={[formData.lat, formData.lng]}
              onLocationSelect={(loc: {lat: number, lng: number}) => {
                setFormData(prev => ({ ...prev, lat: loc.lat, lng: loc.lng }));
              }}
            />
            
            <div className="mt-4 flex gap-4 text-[10px] font-mono font-bold text-blue-400 bg-blue-50/50 p-3 rounded-xl w-fit">
               <span className="bg-white px-2 py-1 rounded-md border border-blue-100">LAT: {formData.lat}</span>
               <span className="bg-white px-2 py-1 rounded-md border border-blue-100">LNG: {formData.lng}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

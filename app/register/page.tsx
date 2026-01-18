"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Building2, Phone, User, ArrowRight } from 'lucide-react';

// TypeScript uchun Telegram WebApp turlarini e'lon qilish
declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export default function RegisterCenter() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    centerName: '',
    adminName: '',
    phone: '',
    telegramId: ''
  });

  useEffect(() => {
    // Telegram Web App ma'lumotlarini olish
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand(); // Oynani to'liq ochish
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setFormData(prev => ({
          ...prev,
          telegramId: user.id.toString(),
          adminName: `${user.first_name} ${user.last_name || ''}`.trim()
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API ga so'rov yuborish (Keyingi qadamda API ni yozamiz)
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Muvaffaqiyatli ro'yxatdan o'tgach, dashboardga o'tish
        router.push(`/center/${data.centerId}`);
      } else {
        alert(data.message || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg rotate-3">
            <LayoutGrid size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Markazni ro'yxatdan o'tkazish</h1>
          <p className="text-gray-500 mt-2">Edu Market tizimiga xush kelibsiz</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Markaz Nomi */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 ml-1">O'quv markazi nomi</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Masalan: Zehn Akademiyasi"
                value={formData.centerName}
                onChange={(e) => setFormData({...formData, centerName: e.target.value})}
              />
            </div>
          </div>

          {/* Admin Ismi */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 ml-1">Admin ismi</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition"
                value={formData.adminName}
                onChange={(e) => setFormData({...formData, adminName: e.target.value})}
              />
            </div>
          </div>

          {/* Telefon */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600 ml-1">Telefon raqam</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="tel"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition"
                placeholder="+998 90 123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? "Saqlanmoqda..." : "Tasdiqlash"} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

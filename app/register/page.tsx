"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Building2, Phone, User, ArrowRight, Lock, UserCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// TypeScript uchun Telegram WebApp turlari
declare global {
  interface window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export default function RegisterCenter() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    centerName: '',
    adminName: '',
    username: '',
    password: '',
    phone: '',
    telegramId: ''
  });

  useEffect(() => {
    // Telegram WebApp orqali kirilganda ma'lumotlarni avtomatik olish
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.expand();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setFormData(prev => ({
          ...prev,
          telegramId: user.id.toString(),
          adminName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          username: user.username || '' 
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.centerId) {
        // Muvaffaqiyatli ro'yxatdan o'tgach, markazning dashboard sahifasiga o'tish
        router.push(`/center/${data.centerId}`);
      } else {
        setError(data.error || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Register error:", error);
      setError("Server bilan ulanishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
            <LayoutGrid size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">EduMarket</h1>
          <p className="text-gray-500 mt-1 italic text-sm">Markazni ro'yxatdan o'tkazish</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Markaz Nomi */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase ml-1">O'quv markazi nomi</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Masalan: Zehn Akademiyasi"
                value={formData.centerName}
                onChange={(e) => setFormData({...formData, centerName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Admin Ismi */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase ml-1">Ismingiz</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  value={formData.adminName}
                  onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                />
              </div>
            </div>

            {/* Telefon */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase ml-1">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="tel"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  placeholder="+998..."
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Login (Username) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase ml-1">Tizim uchun login</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="admin_login"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          {/* Parol */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase ml-1">Parol</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password"
                required
                minLength={6}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="******"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-70`}
          >
            {loading ? "Saqlanmoqda..." : "Tasdiqlash"} <ArrowRight size={20} />
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Akkauntingiz bormi?{' '}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Kirish
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

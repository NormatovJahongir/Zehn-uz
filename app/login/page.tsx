"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, LineChart, Users, Smartphone, 
  User, Lock, LogIn, Send, ArrowLeft, AlertCircle, UserPlus 
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.centerId) {
          router.push(`/center/${data.centerId}`);
        } else if (data.role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || "Login yoki parol xato");
      }
    } catch (err) {
      setError("Server bilan ulanishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        
        {/* Chap tomon: Xususiyatlar */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <GraduationCap size={40} className="text-blue-200" />
              <h1 className="text-3xl font-bold tracking-tight">EduMarket</h1>
            </div>
            <p className="text-blue-100 text-lg mb-12">O'quv markazlari boshqaruv tizimi</p>

            <div className="space-y-8">
              <FeatureItem 
                icon={LineChart} 
                title="Analitika va hisobotlar" 
                desc="O'quvchilar va o'qituvchilar statistikasi" 
              />
              <FeatureItem 
                icon={Users} 
                title="CRM tizimi" 
                desc="O'quvchilar va to'lovlarni boshqarish" 
              />
              <FeatureItem 
                icon={Smartphone} 
                title="Telegram Bot" 
                desc="Mobil qurilmalarda ishlash imkoniyati" 
              />
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-blue-500/50 text-blue-200 text-sm italic">
            Biz bilan ta'lim sifatini oshiring.
          </div>
        </div>

        {/* O'ng tomon: Kirish formasi */}
        <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">Tizimga kirish</h2>
            <p className="text-gray-500 mb-8 text-center md:text-left text-sm">Davom etish uchun hisobingizga kiring</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl text-sm animate-pulse">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} /> Foydalanuvchi nomi
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 text-gray-900"
                  placeholder="Username kiriting"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock size={16} /> Parol
                </label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 text-gray-900"
                  placeholder="Parol kiriting"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {loading ? "Kirilmoqda..." : <><LogIn size={20} /> Kirish</>}
              </button>
            </form>

            {/* Ro'yxatdan o'tish qismi - Yangi qo'shilgan */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600 mb-3">O'quv markazingiz hali yo'qmi?</p>
              <Link 
                href="/register" 
                className="w-full border-2 border-dashed border-gray-200 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 hover:border-blue-200 transition flex items-center justify-center gap-2"
              >
                <UserPlus size={18} /> Markazni ro'yxatdan o'tkazish
              </Link>
            </div>

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <span className="relative bg-white px-4 text-sm text-gray-400">yoki</span>
            </div>

            <a 
              href="https://t.me/edu_market_biznes_bot" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-blue-500 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2 mb-8"
            >
              <Send size={18} className="fill-current" /> Telegram orqali kirish
            </a>

            <div className="text-center">
              <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition font-medium">
                <ArrowLeft size={16} /> Bosh sahifaga qaytish
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-4 group">
      <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-white/20 transition shrink-0">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="font-bold text-white mb-0.5">{title}</h3>
        <p className="text-blue-200 text-sm leading-tight">{desc}</p>
      </div>
    </div>
  );
}

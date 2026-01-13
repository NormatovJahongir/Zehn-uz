"use client";

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, Star, Users, BookOpen, Info, 
  Briefcase, MapPin, Phone, Mail, Globe, 
  UserPlus, MessageSquare, ChevronRight 
} from 'lucide-react';
import dynamic from 'next/dynamic';

const CenterMapClient = dynamic(() => import('@/components/CenterMapClient'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-200 animate-pulse rounded-2xl" />
});

export default function CenterDetailPage({ params }: { params: { id: string } }) {
  // Bu ma'lumotlar keyinchalik API orqali params.id ga qarab keladi
  const center = {
    name: "Zehn Akademiyasi",
    rating: 4.8,
    student_count: 540,
    description: "Bizning markazimizda zamonaviy IT va til o'rgatish metodikalari qo'llaniladi. 5 yillik tajribaga ega o'qituvchilar jamoasi sizga xizmat qiladi.",
    address: "Toshkent sh., Chilonzor 2-mavze",
    phone: "+998 90 123 45 67",
    email: "info@zehn.uz",
    website: "www.zehn.uz",
    lat: 41.2995,
    lng: 69.2401
  };

  const subjects = [
    { id: 1, name: "Matematika (Pre-IELTS)", price: 450000, duration: 9 },
    { id: 2, name: "Ingliz tili (IELTS 7+)", price: 600000, duration: 6 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <GraduationCap size={48} />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{center.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-blue-100">
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm">
                <Star size={16} className="text-yellow-400 fill-yellow-400" /> {center.rating} reyting
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm">
                <Users size={16} /> {center.student_count} o'quvchi
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm">
                <BookOpen size={16} /> {subjects.length} fan
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
              <Info className="text-blue-600" /> Markaz haqida
            </h2>
            <p className="text-gray-600 leading-relaxed bg-white p-6 rounded-2xl border">
              {center.description}
            </p>
          </section>

          {/* Subjects */}
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <BookOpen className="text-blue-600" /> Fanlar va Kurslar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((sub) => (
                <div key={sub.id} className="bg-white p-6 rounded-2xl border hover:shadow-md transition group">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600">{sub.name}</h3>
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{sub.price.toLocaleString()} so'm / oy</span>
                    <span>{sub.duration} oy</span>
                  </div>
                  <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2">
                    <UserPlus size={18} /> Ro'yxatdan o'tish
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews (Mockup) */}
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <MessageSquare className="text-blue-600" /> Sharhlar
            </h2>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">O'quvchi ismi</span>
                    <div className="flex text-yellow-400"><Star size={14} fill="currentColor" /></div>
                  </div>
                  <p className="text-gray-600 text-sm italic">"Juda zo'r markaz, darslar sifatli o'tiladi."</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-24">
            <h3 className="text-lg font-bold mb-4">Aloqa va Manzil</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="text-blue-600 shrink-0" size={20} />
                <span>{center.address}</span>
              </div>
              <div className="flex gap-3">
                <Phone className="text-blue-600 shrink-0" size={20} />
                <a href={`tel:${center.phone}`} className="hover:text-blue-600">{center.phone}</a>
              </div>
              <div className="flex gap-3">
                <Mail className="text-blue-600 shrink-0" size={20} />
                <span>{center.email}</span>
              </div>
            </div>

            <div className="mt-6 h-48 rounded-xl overflow-hidden border">
                {/* Bu yerda kichik xarita chiqadi */}
                <div className="bg-gray-100 h-full flex items-center justify-center text-gray-400">
                    Xarita yuklanmoqda...
                </div>
            </div>

            <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
              Markaz bilan bog'lanish
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}



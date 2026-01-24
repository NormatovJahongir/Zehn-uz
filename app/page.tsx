"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Map as MapIcon, School, Users, 
  BookOpen, Star, Rocket, Info, 
  UserPlus, Store, GraduationCap, Globe,
  ArrowRight, LogIn
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Xarita serverda render bo'lmasligi uchun dynamic import
const CenterMapClient = dynamic(() => import('../components/CenterMapClient'), { 
  ssr: false,
  loading: () => <div className="h-[450px] bg-gray-100 animate-pulse rounded-[2.5rem]" />
});

// 1. Ko'p tilli lug'at
const translations: any = {
  UZ: {
    heroTitle: "Kelajagingiz uchun eng yaxshi bilim maskanini toping",
    heroDesc: "Barcha o'quv markazlari yagona platformada. Solishtiring va ro'yxatdan o'ting.",
    searchPlaceholder: "Markaz, fan yoki manzil...",
    topCenters: "Top o'quv markazlari",
    viewMap: "Markazlar xaritada",
    stats: ["Markazlar", "O'quvchilar", "Kurslar", "Reyting"],
    addCenter: "Hoziroq qo'shiling",
    more: "Batafsil ma'lumot",
    login: "Kirish",
    mapBtn: "Xarita"
  },
  RU: {
    heroTitle: "Найдите лучшее учебное заведение для вашего будущего",
    heroDesc: "Все учебные центры на одной платформе. Сравнивайте и регистрируйтесь.",
    searchPlaceholder: "Центр, предмет или адрес...",
    topCenters: "Топ учебных центров",
    viewMap: "Центры на карте",
    stats: ["Центры", "Ученики", "Курсы", "Рейтинг"],
    addCenter: "Присоединяйтесь сейчас",
    more: "Подробнее",
    login: "Войти",
    mapBtn: "Карта"
  },
  EN: {
    heroTitle: "Find the best educational center for your future",
    heroDesc: "All learning centers in one platform. Compare and register.",
    searchPlaceholder: "Center, subject or address...",
    topCenters: "Top Educational Centers",
    viewMap: "Centers on Map",
    stats: ["Centers", "Students", "Courses", "Rating"],
    addCenter: "Join Now",
    more: "Learn More",
    login: "Login",
    mapBtn: "Map"
  }
};

export default function MarketplacePage() {
  const [lang, setLang] = useState('UZ');
  const [searchTerm, setSearchTerm] = useState("");
  const t = translations[lang];

  // 2. Markazlar ma'lumotlari
  const allCenters = [
    { id: 1, name: "Zehn Akademiyasi", rating: 4.9, students: 1200, subjects: 12, address: "Chilonzor", desc: "Zamonaviy IT va xorijiy tillar markazi.", lat: 41.2833, lng: 69.2123 },
    { id: 2, name: "Smart School", rating: 4.5, students: 850, subjects: 8, address: "Yunusobod", desc: "Matematika va fizika fanlariga ixtisoslashgan.", lat: 41.3645, lng: 69.2868 },
    { id: 3, name: "Everest Learning", rating: 4.7, students: 2100, subjects: 15, address: "Mirzo Ulug'bek", desc: "IELTS va til o'rgatish bo'yicha yetakchi.", lat: 41.3265, lng: 69.3289 },
  ];

  // 3. Qidiruv va Reyting bo'yicha filtr
  const topCenters = useMemo(() => {
    return allCenters
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   c.address.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.rating - a.rating);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER & NAV */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">EduMarket</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-bold text-gray-500">
          <Link href="/marketplace" className="hover:text-blue-600 transition">Marketplace</Link>
          <a href="#map-section" className="hover:text-blue-600 transition flex items-center gap-1">
            <MapIcon size={18} /> {t.mapBtn}
          </a>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1 border border-gray-200">
            {['UZ', 'RU', 'EN'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${lang === l ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100">
             <LogIn size={18} /> {t.login}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 space-y-20 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] py-20 px-8 text-center text-white shadow-2xl mt-6">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full backdrop-blur-md text-sm font-bold">
              <Rocket size={18} className="text-blue-200" /> {t.addCenter}
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              {t.heroTitle}
            </h1>
            <p className="text-blue-100 text-xl max-w-2xl mx-auto opacity-90 font-medium">
              {t.heroDesc}
            </p>

            <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-3 bg-white p-2.5 rounded-[2rem] shadow-2xl">
              <div className="flex-1 relative bg-gray-50 rounded-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-800 outline-none font-semibold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                <Globe size={20}/>
              </button>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={School} value="150+" label={t.stats[0]} color="blue" />
          <StatCard icon={Users} value="25k+" label={t.stats[1]} color="indigo" />
          <StatCard icon={BookOpen} value="400+" label={t.stats[2]} color="emerald" />
          <StatCard icon={Star} value="4.8" label={t.stats[3]} color="amber" />
        </div>

        {/* MAP SECTION */}
        <section id="map-section" className="space-y-8 scroll-mt-28">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <MapIcon className="text-blue-600" size={32} /> {t.viewMap}
            </h2>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm italic">
              Toshkent shahri
            </div>
          </div>
          <div className="rounded-[3rem] overflow-hidden border-[12px] border-gray-50 shadow-2xl h-[500px]">
            <CenterMapClient centers={allCenters} />
          </div>
        </section>

        {/* TOP CENTERS GRID */}
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Star className="text-amber-500 fill-amber-500" size={32} /> {t.topCenters}
            </h2>
            <Link href="/marketplace" className="text-blue-600 font-bold flex items-center gap-1 hover:underline transition-all">
              Hammasini ko'rish <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {topCenters.map((center) => (
              <CenterCard key={center.id} center={center} btnText={t.more} />
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="bg-slate-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -mr-40 -mt-40"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-black leading-tight">O'quv markazingizni <br/><span className="text-blue-500">biz bilan o'stiring!</span></h2>
              <p className="text-slate-400 text-xl max-w-lg font-medium">
                Raqamli boshqaruv va minglab potensial o'quvchilar sizni kutmoqda.
              </p>
            </div>
            <Link href="/register" className="group bg-blue-600 text-white px-12 py-6 rounded-3xl font-black text-xl hover:bg-blue-700 transition-all flex items-center gap-3 shadow-2xl shadow-blue-900/40">
              Bepul boshlash <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600"
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-3">
      <div className={`${colors[color]} p-5 rounded-2xl`}>
        <Icon size={32} />
      </div>
      <div>
        <div className="text-3xl font-black text-gray-900">{value}</div>
        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
}

function CenterCard({ center, btnText }: any) {
  return (
    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group">
      <div className="h-60 bg-slate-100 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60" />
         <div className="absolute inset-0 flex items-center justify-center text-slate-300">
           <GraduationCap size={100} className="group-hover:scale-110 transition-transform duration-700 opacity-20" />
         </div>
         <div className="absolute top-6 left-6 z-20 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
           TOP RATED
         </div>
         <div className="absolute bottom-6 left-6 z-20 text-white font-black text-lg flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-xl">
           <Star size={20} className="text-amber-400 fill-amber-400" /> {center.rating}
         </div>
      </div>
      <div className="p-10 space-y-6">
        <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{center.name}</h3>
        <p className="text-gray-500 font-medium line-clamp-2 leading-relaxed h-12">{center.desc}</p>
        
        <div className="flex items-center gap-6 py-5 border-y border-gray-50">
          <div className="flex items-center gap-2.5 text-sm font-black text-gray-700">
            <Users size={20} className="text-blue-500" /> {center.students}
          </div>
          <div className="flex items-center gap-2.5 text-sm font-black text-gray-700">
            <BookOpen size={20} className="text-indigo-500" /> {center.subjects} fan
          </div>
        </div>

        <Link href={`/center/${center.id}`} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-200">
          {btnText} <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { 
  UserCircle, BookOpen, CalendarCheck, 
  TrendingUp, Wallet, School, Users, 
  Calendar, Check, X, ChevronRight,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

// --- Yordamchi komponentlar ---
const CourseCard = ({ title, center, teacher, status, date }: any) => (
  <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-bold text-gray-900 group-hover:text-blue-600">{title}</h3>
      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${status === 'Faol' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
        {status}
      </span>
    </div>
    <div className="space-y-1.5 mb-4">
      <p className="text-xs text-gray-500 flex items-center gap-1.5"><School size={12} /> {center}</p>
      <p className="text-xs text-gray-500 flex items-center gap-1.5"><Users size={12} /> {teacher}</p>
    </div>
    <div className="flex items-center justify-between pt-3 border-t">
      <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10} /> {date}</span>
      <button className="text-xs font-bold text-blue-600 flex items-center gap-1">Batafsil <ChevronRight size={14} /></button>
    </div>
  </div>
);

// --- Asosiy Dashboard Sahifasi ---
export default function StudentDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // LocalStorage'dan markaz ID sini olamiz
        const centerId = localStorage.getItem('centerId');
        if (centerId) {
          const res = await fetch(`/api/center/data?centerId=${centerId}`);
          if (res.ok) {
            const data = await res.json();
            setUserData(data);
          }
        }
      } catch (error) {
        console.error("Dashboard yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Header - Endi bazadan kelgan markaz nomi chiqadi */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white">
            <UserCircle size={40} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {userData?.name || "O'quv Markazi"}
            </h1>
            <p className="text-gray-500">Tizim holati va umumiy statistika</p>
          </div>
        </div>
        <Link href="/settings" className="flex items-center gap-2 text-blue-600 font-semibold hover:underline">
          Sozlamalar <ChevronRight size={18} />
        </Link>
      </header>

      {/* Statistika - Bazadagi real sonlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Fanlar" value={userData?.subjects?.length || 0} icon={BookOpen} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="O'qituvchilar" value={userData?.teachers?.length || 0} icon={Users} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="O'quvchilar" value={userData?.students?.length || 0} icon={GraduationCap} color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="Kutilmoqda" value="1" icon={Wallet} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <GraduationCap className="text-blue-600" /> Oxirgi qo'shilgan fanlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData?.subjects?.slice(0, 2).map((sub: any) => (
                <CourseCard 
                  key={sub.id}
                  title={sub.name} 
                  center={userData.name} 
                  teacher="Tayinlanmagan" 
                  status="Faol" 
                  date={new Date(sub.createdAt).toLocaleDateString()} 
                />
              ))}
              {(!userData?.subjects || userData?.subjects.length === 0) && (
                <p className="text-gray-400 text-sm italic">Hozircha fanlar yo'q</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Kichik yordamchi komponent
function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className={`${bg} ${color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
        <Icon size={24} />
      </div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  );
}

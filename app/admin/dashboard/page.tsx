"use client";

import React, { useEffect, useState } from 'react';
import { 
  Users, School, GraduationCap, DollarSign, 
  LayoutDashboard, BookOpen, CalendarCheck, 
  BarChart3, Bell, Settings, RefreshCcw, 
  Trophy, Receipt, PlusCircle, Star
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Chart.js ni ro'yxatdan o'tkazish
ChartJS.register(
  CategoryScale, LinearScale, PointElement, 
  LineElement, ArcElement, Tooltip, Legend, Filler
);

export default function AdminDashboard() {
  const [role, setRole] = useState('super_admin'); // Buni keyinchalik sessiondan olamiz

  // Mock ma'lumotlar (Bular keyinchalik bazadan API orqali keladi)
  const stats = [
    { label: "O'quv markazlari", value: "24", icon: School, color: "bg-blue-500" },
    { label: "O'quvchilar", value: "1,240", icon: Users, color: "bg-green-500" },
    { label: "O'qituvchilar", value: "86", icon: GraduationCap, color: "bg-orange-500" },
    { label: "Umumiy daromad", value: "45,000,000 so'm", icon: DollarSign, color: "bg-purple-500" },
  ];

  // Grafik ma'lumotlari
  const lineData = {
    labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
    datasets: [{
      label: "O'quvchilar soni",
      data: [120, 190, 230, 280, 350, 420],
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const doughnutData = {
    labels: ["To'langan", 'Kutilmoqda', 'Kechikkan'],
    datasets: [{
      data: [65, 25, 10],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
    }]
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Jahongir Normatov</h4>
            <p className="text-xs text-slate-400">Super Admin</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          {role === 'super_admin' && <NavItem icon={School} label="Markazlar" />}
          <NavItem icon={Users} label="O'quvchilar" />
          <NavItem icon={GraduationCap} label="O'qituvchilar" />
          <NavItem icon={BookOpen} label="Fanlar" />
          <NavItem icon={DollarSign} label="To'lovlar" />
          <NavItem icon={CalendarCheck} label="Davomat" />
          <NavItem icon={BarChart3} label="Natijalar" />
          <NavItem icon={Bell} label="Bildirishnomalar" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <LayoutDashboard size={24} className="text-blue-600" /> Boshqaruv paneli
          </h1>
          
          <div className="flex gap-2">
            {role === 'super_admin' && (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition text-sm">
                <PlusCircle size={18} /> Yangi Admin
              </button>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-full transition"><RefreshCcw size={20} className="text-gray-600" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition"><Settings size={20} className="text-gray-600" /></button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600" /> O'quvchilar dinamikasi
              </h3>
              <div className="h-[300px]">
                <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Receipt size={18} className="text-green-600" /> To'lovlar statistikasi
              </h3>
              <div className="h-[300px]">
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          {/* Data Table Mockup */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold flex items-center gap-2"><Trophy className="text-yellow-500" /> Eng yaxshi markazlar</h3>
              <button className="text-blue-600 text-sm font-medium hover:underline">Barchasini ko'rish</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Markaz nomi</th>
                    <th className="px-6 py-3 font-medium text-center">Reyting</th>
                    <th className="px-6 py-3 font-medium text-center">O'quvchilar</th>
                    <th className="px-6 py-3 font-medium text-center">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">Grand Edu</td>
                    <td className="px-6 py-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-yellow-600 font-bold">
                        <Star size={14} fill="currentColor" /> 4.9
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">450</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Faol</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Yordamchi komponent
function NavItem({ icon: Icon, label, active = false }: any) {
  return (
    <a href="#" className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm ${
      active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}>
      <Icon size={18} /> {label}
    </a>
  );
}
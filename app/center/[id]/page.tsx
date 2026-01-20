"use client";

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, BookOpen, Plus, 
  UserCheck, Settings, Trash2, Save, X, Loader2,
  TrendingUp, CreditCard, ChevronRight, LayoutDashboard,
  Bell, CalendarCheck, Receipt, School, BarChart3
} from 'lucide-react';

// Grafiklar uchun (Agar npm orqali o'rnatilmagan bo'lsa, xatolik bermasligi uchun shartli tekshirish qo'shish mumkin)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, ArcElement
);

export default function CenterAdminPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'teachers' | 'students'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    phone: '',
  });

  // Grafik ma'lumotlari (Dummy data)
  const lineData = {
    labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun'],
    datasets: [{
      label: "O'quvchilar o'sishi",
      data: [65, 80, 120, 190, 240, 310],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/center/data?centerId=${params.id}`);
        const data = await res.json();
        if (data.success) {
          setSubjects(data.subjects || []);
          setTeachers(data.teachers || []);
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error("Ma'lumot yuklashda xato:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/center/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab === 'dashboard' ? 'subjects' : activeTab,
          centerId: params.id,
          name: formData.name,
          price: formData.price,
          phone: formData.phone,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        if (activeTab === 'subjects') setSubjects([...subjects, result.data]);
        if (activeTab === 'teachers') setTeachers([...teachers, result.data]);
        if (activeTab === 'students') setStudents([...students, result.data]);
        setIsModalOpen(false);
        setFormData({ name: '', price: '', phone: '' });
      }
    } catch (err) {
      alert("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar - Professional yon menyu */}
      <aside className="w-72 bg-[#1E293B] text-white hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl">
        <div className="p-8 flex items-center gap-3 border-b border-slate-700">
          <div className="bg-blue-600 p-2 rounded-xl rotate-3">
            <GraduationCap size={28} />
          </div>
          <span className="text-xl font-black tracking-tighter">EduMarket</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={BookOpen} label="Fanlar" active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} />
          <SidebarLink icon={UserCheck} label="Ustozlar" active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} />
          <SidebarLink icon={Users} label="O'quvchilar" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
          <SidebarLink icon={CreditCard} label="To'lovlar" />
          <SidebarLink icon={CalendarCheck} label="Davomat" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b h-20 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Paneli</h1>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-gray-900">Admin User</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">ID: {params.id}</span>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg transition-transform active:scale-90">
              <Plus size={20} />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Dashboard Stats View */}
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={BookOpen} label="Fanlar" value={subjects.length} color="blue" />
                <StatCard icon={UserCheck} label="Ustozlar" value={teachers.length} color="purple" />
                <StatCard icon={Users} label="O'quvchilar" value={students.length} color="green" />
                <StatCard icon={TrendingUp} label="Daromad" value="12,5M" color="orange" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-[32px] border shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <BarChart3 className="text-blue-600" size={20} /> O'quvchilar dinamikasi
                  </h3>
                  <div className="h-64">
                    <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Receipt className="text-orange-600" size={20} /> To'lovlar holati
                  </h3>
                  <div className="h-64 flex justify-center">
                    <Doughnut data={{
                      labels: ["To'langan", "Qarzdor"],
                      datasets: [{ data: [75, 25], backgroundColor: ['#10b981', '#f43f5e'] }]
                    }} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* List Views */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'subjects' && subjects.map((sub: any) => (
              <div key={sub.id} className="bg-white p-6 rounded-[28px] border hover:shadow-xl transition-all relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform" />
                <h3 className="font-black text-gray-800 text-xl relative z-10">{sub.name}</h3>
                <p className="text-blue-600 font-bold mt-2">{sub.price?.toLocaleString()} so'm</p>
                <button className="mt-4 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            ))}
            {/* O'qituvchilar va O'quvchilar ro'yxati shu yerda */}
          </div>
        </div>
      </main>

      {/* Modal - Oldingi koddagi modal saqlab qolindi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900">
              <X size={28} />
            </button>
            <h2 className="text-3xl font-black text-gray-900 mb-8">Ma'lumot qo'shish</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <input 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" 
                placeholder="Nomi / Ismi" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Saqlash</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Yordamchi Komponentlar
function SidebarLink({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const styles: any = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white p-6 rounded-[32px] border shadow-sm flex items-center gap-5 hover:scale-105 transition-transform">
      <div className={`${styles[color]} w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

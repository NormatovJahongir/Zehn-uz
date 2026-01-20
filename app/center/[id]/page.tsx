"use client";

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, BookOpen, Plus, 
  UserCheck, Settings, Trash2, Save, X, Loader2,
  TrendingUp, CreditCard, ChevronRight
} from 'lucide-react';

export default function CenterAdminPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'subjects' | 'teachers' | 'students'>('subjects');
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
          type: activeTab,
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
      } else {
        alert(result.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Saqlashda xato:", err);
      alert("Server bilan aloqa uzildi");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-500 font-medium italic">Markaz ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Top Header Section */}
      <div className="bg-white border-b px-6 py-8 shadow-sm mb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 rotate-3">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Boshqaruv Markazi</h1>
              <p className="text-gray-400 text-sm font-medium">ID: {params.id}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-100 group"
          >
            <Plus size={22} className="group-hover:rotate-90 transition-transform" /> Yangi qo'shish
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={BookOpen} label="Fanlar" value={subjects.length} color="blue" />
          <StatCard icon={UserCheck} label="Ustozlar" value={teachers.length} color="purple" />
          <StatCard icon={Users} label="O'quvchilar" value={students.length} color="green" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100 w-full max-w-md mx-auto">
          {[
            { id: 'subjects', label: 'Fanlar', icon: <BookOpen size={18} /> },
            { id: 'teachers', label: 'Ustozlar', icon: <GraduationCap size={18} /> },
            { id: 'students', label: 'O\'quvchilar', icon: <Users size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? "bg-blue-600 text-white shadow-md shadow-blue-100 scale-105" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'subjects' && subjects.length === 0 && <EmptyState label="Hali fanlar qo'shilmagan" />}
          
          {activeTab === 'subjects' && subjects.map((sub: any) => (
            <div key={sub.id} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[80px] -z-0 transition-all group-hover:bg-blue-100" />
              <div className="relative z-10">
                <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold">
                  {sub.name.charAt(0)}
                </div>
                <h3 className="font-black text-gray-800 text-xl mb-1">{sub.name}</h3>
                <p className="text-blue-600 font-bold flex items-center gap-1">
                  <TrendingUp size={14} /> {sub.price?.toLocaleString()} so'm
                </p>
                <div className="mt-4 flex justify-end">
                  <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'teachers' && teachers.map((t: any) => (
            <div key={t.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-100">
                <UserCheck size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{t.firstName}</h3>
                <p className="text-xs text-gray-400 font-medium">Professional Ustoz</p>
                <p className="text-xs text-blue-600 mt-1">{t.phone}</p>
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </div>
          ))}

          {activeTab === 'students' && students.map((s: any) => (
            <div key={s.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100">
                <Users size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{s.firstName}</h3>
                <p className="text-xs text-gray-400 font-medium">Faol O'quvchi</p>
                <p className="text-xs text-emerald-600 mt-1">{s.phone}</p>
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors">
              <X size={28} />
            </button>
            
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900">
                {activeTab === 'subjects' ? "Yangi Fan" : activeTab === 'teachers' ? "Yangi Ustoz" : "Yangi O'quvchi"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">Ma'lumotlarni kiriting</p>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">To'liq nomi</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium" 
                  placeholder="Kiriting..." 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {activeTab === 'subjects' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Oylik narxi (so'm)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-blue-600" 
                      placeholder="Masalan: 500000" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                    <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Telefon raqami</label>
                  <input 
                    type="tel" 
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium" 
                    placeholder="+998 90..." 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95"
              >
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
function StatCard({ icon: Icon, label, value, color }: any) {
  const styles: any = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-50",
    purple: "bg-purple-50 text-purple-600 shadow-purple-50",
    green: "bg-emerald-50 text-emerald-600 shadow-emerald-50",
  };
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
      <div className={`${styles[color]} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-gray-200">
        <Plus className="text-gray-300" size={32} />
      </div>
      <p className="text-gray-400 font-medium">{label}</p>
      <p className="text-gray-300 text-sm italic">Yangi ma'lumot qo'shish uchun yuqoridagi tugmani bosing</p>
    </div>
  );
}

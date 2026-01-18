"use client";

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Users, BookOpen, Plus, 
  UserCheck, Settings, Trash2, Save, X 
} from 'lucide-react';

export default function CenterAdminPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'subjects' | 'teachers' | 'students'>('subjects');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ma'lumotlar holati (Bular API dan keladi)
  const [subjects, setSubjects] = useState([
    { id: 1, name: "Matematika (Pre-IELTS)", price: 450000, duration: "9 oy" },
    { id: 2, name: "Ingliz tili (IELTS 7+)", price: 600000, duration: "6 oy" }
  ]);

  const [teachers, setTeachers] = useState([
    { id: 1, name: "Asilbek Olimov", specialization: "Matematika", phone: "+998 90 111 22 33" }
  ]);

  const [students, setStudents] = useState([
    { id: 1, name: "Jamshid Normatov", group: "IELTS 7+", phone: "+998 93 444 55 66" }
  ]);

  // Yangi ma'lumot qo'shish funksiyasi (Simulatsiya)
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    // Bu yerda API ga so'rov yuboriladi
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 p-4">
      
      {/* Admin Header */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
            <Settings size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Boshqaruv Paneli</h1>
            <p className="text-gray-500 text-sm">Markaz ID: {params.id}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition"
        >
          <Plus size={20} /> Yangi qo'shish
        </button>
      </div>

      {/* Navigatsiya Tablari */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full max-w-md">
        {[
          { id: 'subjects', label: 'Fanlar', icon: <BookOpen size={18} /> },
          { id: 'teachers', label: 'O\'qituvchilar', icon: <GraduationCap size={18} /> },
          { id: 'students', label: 'O\'quvchilar', icon: <Users size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Asosiy Kontent Ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === 'subjects' && subjects.map(sub => (
          <div key={sub.id} className="bg-white p-5 rounded-2xl border hover:border-blue-300 transition group relative">
            <h3 className="font-bold text-lg">{sub.name}</h3>
            <p className="text-blue-600 font-semibold">{sub.price.toLocaleString()} so'm</p>
            <p className="text-gray-400 text-sm">{sub.duration}</p>
            <button className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {activeTab === 'teachers' && teachers.map(t => (
          <div key={t.id} className="bg-white p-5 rounded-2xl border flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-blue-600">
              <UserCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold">{t.name}</h3>
              <p className="text-sm text-gray-500">{t.specialization}</p>
              <p className="text-xs text-blue-600">{t.phone}</p>
            </div>
          </div>
        ))}

        {activeTab === 'students' && students.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-2xl border flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-sm text-gray-500">Guruh: {s.group}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ma'lumot qo'shish Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-blue-600" /> 
              {activeTab === 'subjects' ? "Yangi fan" : activeTab === 'teachers' ? "O'qituvchi" : "O'quvchi"} qo'shish
            </h2>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">Nom / Ism-sharif</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition" placeholder="Kiriting..." required />
              </div>
              {activeTab === 'subjects' && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Narxi (oylik)</label>
                  <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition" placeholder="Masalan: 500000" />
                </div>
              )}
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Save size={20} /> Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

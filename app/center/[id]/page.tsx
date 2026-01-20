"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Users, BookOpen, Plus, 
  UserCheck, Trash2, Save, X, Loader2,
  TrendingUp, CreditCard, ChevronRight, LayoutDashboard,
  CalendarCheck, School, Map as MapIcon, ShoppingBag, Edit3
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Xaritani dinamik yuklash (SSR error oldini olish uchun)
const MapPicker = dynamic(() => import('../../../components/MapPickerClient'), { 
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
      Xarita yuklanmoqda...
    </div>
  )
});

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type TabType = 'dashboard' | 'subjects' | 'teachers' | 'students' | 'marketplace' | 'map';

export default function CenterAdminPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // 2. Markaz nomi uchun holat (Dastlab bo'sh yoki yuklanmoqda)
  const [centerName, setCenterName] = useState("Yuklanmoqda...");
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [location, setLocation] = useState({ lat: 41.2995, lng: 69.2401 });

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    phone: '',
    subjectId: '',
    teacherId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/center/data?centerId=${params.id}`);
        const data = await res.json();
        if (data.success) {
          // Ro'yxatdan o'tgan vaqtdagi nomni o'rnatish
          setCenterName(data.centerName || "Nomsiz Markaz");
          setSubjects(data.subjects || []);
          setTeachers(data.teachers || []);
          setStudents(data.students || []);
          if (data.location) setLocation(data.location);
        }
      } catch (err) {
        console.error("Xato:", err);
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
      const method = formData.id ? 'PUT' : 'POST';
      const response = await fetch('/api/center/data', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: activeTab, centerId: params.id }),
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (err) {
      alert("Xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name || item.firstName || '',
        price: item.price || '',
        phone: item.phone || '',
        subjectId: item.subjectId || '',
        teacherId: item.teacherId || '',
      });
    } else {
      setFormData({ id: '', name: '', price: '', phone: '', subjectId: '', teacherId: '' });
    }
    setIsModalOpen(true);
  };

  if (initialLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1E293B] text-white hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl z-40">
        <div className="p-8 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-xl"><School size={24} /></div>
            <span className="text-xl font-black tracking-tighter">EduMarket</span>
          </div>
          <div className="space-y-1">
            <SidebarLink icon={ShoppingBag} label="Marketplace" active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
            <SidebarLink icon={MapIcon} label="Xarita" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 mb-2">Management</p>
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
        <header className="bg-white border-b h-20 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <span className="text-blue-600">{centerName}</span> 
             <ChevronRight size={16} className="text-gray-400" />
             <span className="capitalize">{activeTab}</span>
          </h1>
          
          {/* Dashboardda qo'shish tugmasi ko'rinmaydi, faqat ma'lumot ko'rish uchun */}
          {activeTab !== 'dashboard' && activeTab !== 'map' && activeTab !== 'marketplace' && (
            <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100">
              <Plus size={20} /> Qo'shish
            </button>
          )}
        </header>

        <div className="p-8 space-y-8">
          {/* 1. Dashboard Faqat ko'rish rejimi */}
          {activeTab === 'dashboard' && <DashboardView subjects={subjects} teachers={teachers} students={students} />}
          
          {/* Subjects View */}
          {activeTab === 'subjects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((sub: any) => (
                <div key={sub.id} className="bg-white p-6 rounded-[28px] border hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><BookOpen size={24} /></div>
                    <div className="flex gap-2">
                       <button onClick={() => openModal(sub)} className="text-gray-400 hover:text-blue-600 p-1"><Edit3 size={18} /></button>
                       <button className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <h3 className="font-black text-gray-800 text-xl mt-4">{sub.name}</h3>
                  <p className="text-blue-600 font-bold mt-1 text-lg">{sub.price?.toLocaleString()} so'm</p>
                </div>
              ))}
            </div>
          )}

          {/* Teachers View */}
          {activeTab === 'teachers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teachers.map((t: any) => (
                <div key={t.id} className="bg-white p-6 rounded-[28px] border flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center"><UserCheck size={32} /></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{t.name || t.firstName}</h3>
                    <p className="text-sm text-gray-500">{t.phone}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="bg-purple-50 text-purple-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest">
                        {subjects.find((s: any) => s.id === t.subjectId)?.name || "Fan biriktirilmagan"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => openModal(t)} className="text-gray-300 hover:text-blue-600"><Edit3 size={20} /></button>
                </div>
              ))}
            </div>
          )}

          {/* Students View */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-[32px] border overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Ism</th>
                      <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Fan</th>
                      <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Ustoz</th>
                      <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-widest text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-800">{s.name || s.firstName}</td>
                        <td className="px-6 py-4 text-sm">{subjects.find((sub: any) => sub.id === s.subjectId)?.name || "—"}</td>
                        <td className="px-6 py-4 text-sm">{teachers.find((t: any) => t.id === s.teacherId)?.name || "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openModal(s)} className="text-blue-600 hover:underline font-bold text-xs">Tahrirlash</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {/* Map View Integration */}
          {activeTab === 'map' && (
            <div className="bg-white p-8 rounded-[32px] border shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black">Markaz joylashuvi</h2>
                <div className="text-sm text-gray-400 font-mono">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div>
              </div>
              <MapPicker onLocationSelect={(ll: any) => setLocation(ll)} initialPos={[location.lat, location.lng]} />
            </div>
          )}
        </div>
      </main>

      {/* Dynamic Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900"><X size={28} /></button>
            <h2 className="text-2xl font-black text-gray-900 mb-6 capitalize">{formData.id ? 'Tahrirlash' : 'Yangi'} - {activeTab}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <input className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-blue-600 outline-none transition-all font-medium" placeholder="To'liq nomi" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              
              {activeTab === 'subjects' && (
                <input type="number" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-blue-600 outline-none transition-all font-bold text-blue-600" placeholder="Kurs narxi" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              )}

              {(activeTab === 'teachers' || activeTab === 'students') && (
                <input className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 focus:border-blue-600 outline-none transition-all font-medium" placeholder="Telefon raqami" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              )}

              {(activeTab === 'teachers' || activeTab === 'students') && (
                <select className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 outline-none" value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})}>
                  <option value="">Fan biriktirish</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}

              {activeTab === 'students' && (
                <select className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 outline-none" value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})}>
                  <option value="">Ustoz biriktirish</option>
                  {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 mt-4">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Saqlash</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard Faqat ma'lumotlarni ko'rish uchun
function DashboardView({ subjects, teachers, students }: any) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={BookOpen} label="Fanlar" value={subjects.length} color="blue" />
        <StatCard icon={UserCheck} label="Ustozlar" value={teachers.length} color="purple" />
        <StatCard icon={Users} label="O'quvchilar" value={students.length} color="green" />
        <StatCard icon={TrendingUp} label="Daromad" value="12.5M" color="orange" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[32px] border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Oylik o'sish ko'rsatkichi</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400">
             Grafik ma'lumotlari tahlil qilinmoqda...
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[32px] border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">So'nggi faollik</h3>
          <div className="space-y-4">
            {students.slice(0, 3).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {s.name?.charAt(0) || "S"}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{s.name} qo'shildi</p>
                  <p className="text-xs text-gray-400">Hozirgina</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all font-bold ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const styles: any = { blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600", green: "bg-emerald-50 text-emerald-600", orange: "bg-orange-50 text-orange-600" };
  return (
    <div className="bg-white p-6 rounded-[32px] border shadow-sm flex items-center gap-5">
      <div className={`${styles[color]} w-14 h-14 rounded-2xl flex items-center justify-center`}><Icon size={28} /></div>
      <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</p><h3 className="text-2xl font-black text-gray-800">{value}</h3></div>
    </div>
  );
}



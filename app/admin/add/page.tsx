"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function AddAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Bu yerda API orqali bazaga yuboramiz
    const res = await fetch("/api/admin/add", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/admin/settings");
    } else {
      alert("Xatolik yuz berdi!");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Card Header */}
        <div className="bg-blue-600 p-4 flex items-center gap-3">
          <UserPlus className="text-white" />
          <h4 className="text-white font-semibold text-lg">Yangi Admin Qo'shish</h4>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To'liq ism (F.I.O)
              </label>
              <input
                type="text"
                name="full_name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Masalan: Ali Valiyev"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login (Username)
              </label>
              <input
                type="text"
                name="username"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="admin_center1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parol
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> Bekor qilish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
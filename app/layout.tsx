"use client";

import { Inter } from "next/font/google";
import "./globals.css"; 
import Link from "next/link";
import Script from "next/script";
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { 
  GraduationCap, Home, MapPinned, 
  LayoutDashboard, LogOut, LogIn, 
  Phone, Mail, Send, Instagram, Facebook  
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/center/');
  
  // Tilni global boshqarish (Hozircha layout darajasida)
  const [currentLang, setCurrentLang] = useState('UZ');

  return (
    <html lang={currentLang.toLowerCase()}>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased`}>
        
        {/* TO'G'RILANGAN NAVIGATSIYA */}
        {!isAdminPage && (
          <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-[100] shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-20 items-center">
                
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="bg-blue-600 p-2.5 rounded-xl group-hover:rotate-6 transition-transform shadow-lg shadow-blue-200">
                    <GraduationCap className="text-white" size={26} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tight text-gray-900 leading-none">EduMarket</span>
                    <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Management</span>
                  </div>
                </Link>

                {/* Markaziy Linklar */}
                <div className="hidden md:flex items-center gap-8">
                  <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition font-bold">
                    <Home size={18} /> Marketplace
                  </Link>
                  <a href="#map-section" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition font-bold cursor-pointer">
                    <MapPinned size={18} /> Xarita
                  </a>
                </div>

                {/* O'ng tomon: Kirish va Til */}
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-1 rounded-xl flex gap-1 border border-gray-200">
                    {['UZ', 'RU', 'EN'].map((l) => (
                      <button 
                        key={l}
                        onClick={() => setCurrentLang(l)}
                        className={`text-[11px] font-black px-3 py-1.5 rounded-lg transition-all ${currentLang === l ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  
                  <Link href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition font-bold shadow-lg shadow-gray-200 active:scale-95">
                    <LogIn size={18} /> Kirish
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        )}

        <main className={`flex-grow ${isAdminPage ? 'bg-[#F0F2F5]' : ''}`}>
          {/* Marketplace page'ga tilni context yoki props orqali uzatish mumkin */}
          {/* Hozircha MarketplacePage o'z ichida state'ni boshqaradi, lekin layout'dagi duplications olib tashlandi */}
          {children}
        </main>

        {!isAdminPage && (
          <footer className="bg-white border-t border-gray-100 mt-20">
             {/* Footer kodi o'zgarishsiz qoladi... */}
          </footer>
        )}
      </body>
    </html>
  );
}

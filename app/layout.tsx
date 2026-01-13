import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; 
import Link from "next/link";
import { 
  GraduationCap, Home, MapPinned, 
  LayoutDashboard, LogOut, LogIn, 
  Phone, Mail, Send, Instagram, Facebook  
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduMarket & Management System",
  description: "O'quv markazlari uchun yagona platforma va boshqaruv tizimi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- TUZATISH: userRole tipini string deb e'lon qilamiz ---
  // Bu TypeScript-ga 'student' qiymati kelajakda boshqa string bo'lishi mumkinligini aytadi
  const isLoggedIn: boolean = false; 
  const userRole: string = 'student'; 

  return (
    <html lang="uz">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased`}>
        
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-[100] shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-3 group shrink-0">
                <div className="bg-blue-600 p-2.5 rounded-xl group-hover:rotate-6 transition-transform shadow-lg shadow-blue-200">
                  <GraduationCap className="text-white" size={26} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-gray-900 leading-none">
                    EduMarket
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">
                    Management
                  </span>
                </div>
              </Link>

              {/* Nav Links - Desktop */}
              <div className="hidden md:flex items-center gap-8">
                <nav className="flex items-center gap-6 border-r pr-8 mr-2">
                  <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition font-semibold">
                    <Home size={18} /> Marketplace
                  </Link>
                  <Link href="/map" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition font-semibold">
                    <MapPinned size={18} /> Xarita
                  </Link>
                </nav>

                <div className="flex items-center gap-4">
                  {isLoggedIn ? (
                    <>
                      <Link 
                        href={userRole === 'super_admin' ? '/admin/dashboard' : '/dashboard'} 
                        className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-xl transition font-bold"
                      >
                        <LayoutDashboard size={18} className="text-blue-600" /> Panel
                      </Link>
                      <button className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition font-bold">
                        <LogOut size={18} /> Chiqish
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition font-bold shadow-lg shadow-gray-200 active:scale-95">
                      <LogIn size={18} /> Kirish
                    </Link>
                  )}
                  
                  {/* Language Switcher */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-lg ml-2">
                    <button className="text-[10px] font-black px-2 py-1 bg-white rounded shadow-sm text-blue-600">UZ</button>
                    <button className="text-[10px] font-black px-2 py-1 text-gray-400 hover:text-gray-600 uppercase">RU</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              
              {/* Brand Col */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-black">EduMarket</h3>
                </div>
                <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
                  O&apos;zbekistondagi barcha o&apos;quv markazlarini birlashtiruvchi zamonaviy ekotizim va CRM platformasi.
                </p>
                <div className="flex gap-4">
                  <SocialLink href="#" icon={<Send size={20} />} hover="hover:bg-blue-50 hover:text-blue-600" />
                  <SocialLink href="#" icon={<Instagram size={20} />} hover="hover:bg-pink-50 hover:text-pink-600" />
                  <SocialLink href="#" icon={<Facebook size={20} />} hover="hover:bg-blue-100 hover:text-blue-800" />
                </div>
              </div>

              {/* Contact Col */}
              <div className="space-y-6">
                <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Bog&apos;lanish</h4>
                <div className="space-y-4">
                  <a href="tel:+998992954957" className="group flex items-center gap-3 text-gray-500 hover:text-blue-600 transition">
                    <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 transition"><Phone size={18} /></div>
                    <span className="font-medium">+998 99 295 49 57</span>
                  </a>
                  <a href="mailto:info@edumarket.uz" className="group flex items-center gap-3 text-gray-500 hover:text-blue-600 transition">
                    <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 transition"><Mail size={18} /></div>
                    <span className="font-medium">info@edumarket.uz</span>
                  </a>
                </div>
              </div>

              {/* Links Col */}
              <div className="space-y-6 text-right md:text-left">
                <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Tezkor havolalar</h4>
                <ul className="space-y-3 font-medium text-gray-500">
                  <li><Link href="/" className="hover:text-blue-600 transition">Marketplace</Link></li>
                  <li><Link href="/map" className="hover:text-blue-600 transition">Markazlar xaritasi</Link></li>
                  <li><Link href="/login" className="hover:text-blue-600 transition">Markazlar uchun</Link></li>
                </ul>
              </div>

            </div>
            
            <div className="border-t mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm font-medium">
              <p>&copy; {new Date().getFullYear()} EduMarket. Barcha huquqlar himoyalangan.</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-gray-600 transition">Maxfiylik siyosati</Link>
                <Link href="/terms" className="hover:text-gray-600 transition">Foydalanish shartlari</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function SocialLink({ href, icon, hover }: { href: string, icon: React.ReactNode, hover: string }) {
  return (
    <a href={href} className={`bg-gray-50 p-3 rounded-2xl text-gray-400 transition-all duration-300 ${hover} shadow-sm active:scale-90`}>
      {icon}
    </a>
  );
}

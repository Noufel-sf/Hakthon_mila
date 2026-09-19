'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  Warehouse, 
  RotateCcw,
  Sparkles,
  Layers,
  HeartHandshake,
  MapPin,
  ClipboardList,
  SlidersHorizontal
} from 'lucide-react';
import { useRelief } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const { resetAllData } = useRelief();

  const navLinks = [
    {
      href: '/',
      label: 'الرئيسية',
      icon: Warehouse,
    },
    {
      href: '/needs',
      label: 'الاحتياجات والنواقص',
      icon: ClipboardList,
    },
    {
      href: '/depots',
      label: 'المستودعات ونقاط التفريغ',
      icon: MapPin,
    },
    {
      href: '/admin',
      label: 'إدارة المستودع (Depot Ops)',
      icon: SlidersHorizontal,
    },
  ];

  const handleReset = () => {
    if (confirm('هل تريد إعادة تعيين البيانات التجريبية للوضع الافتراضي؟')) {
      resetAllData();
      alert('تمت إعادة ضبط البيانات بنجاح!');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-rose-950">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  إغاثة
                </span>
                <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">
                  Ighatha DZ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                تنسيق الإمدادات وتوجيه القوافل
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="إعادة تعيين البيانات للهاكاثون"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">إعادة ضبط تجريبي</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

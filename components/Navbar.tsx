'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Warehouse, 
  MapPin, 
  ClipboardList, 
  SlidersHorizontal,
  RotateCcw,
  HeartHandshake,
  ArrowLeft
} from 'lucide-react';
import { useReliefStore } from '@/lib/store';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const resetAllData = useReliefStore((state) => state.resetAllData);

  const navLinks = [
    {
      href: '/',
      label: 'الرئيسية',
    },
    {
      href: '/needs',
      label: 'الاحتياجات والنواقص',
    },
    {
      href: '/depots',
      label: 'المستودعات',
    },
    {
      href: '/admin',
      label: 'إدارة المستودع',
    },
  ];

  const handleReset = () => {
    if (confirm('هل تريد إعادة تعيين البيانات التجريبية للوضع الافتراضي؟')) {
      resetAllData();
      alert('تمت إعادة ضبط البيانات بنجاح!');
    }
  };

  return (
    <header className="sticky top-3 z-40 max-w-6xl mx-auto px-4 w-full">
      <div className="rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm px-5 sm:px-7 py-2.5 flex items-center justify-between gap-4 transition-all">
        
        {/* Right: Brand Logo (RTL layout) */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="h-9 w-9 rounded-full bg-[#FFF2F0] dark:bg-[#341611] border border-[#FAD8D2] dark:border-[#52231A] flex items-center justify-center text-[#E0533C] shadow-2xs group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-header text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              إغاثــة
            </span>
            <span className="text-[10px] font-bold font-mono tracking-wider text-[#E0533C] hidden sm:inline">
              DZ
            </span>
          </div>
        </Link>

        {/* Center: Navigation Menu Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-header text-sm sm:text-base font-bold transition-colors py-1 relative ${
                  isActive
                    ? 'text-[#E0533C]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#E0533C] dark:hover:text-[#E0533C]'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1.5 right-0 left-0 h-0.5 bg-[#E0533C] rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Left: Actions (Theme toggle, Reset Demo, and Pill Buttons) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* Reset Demo Data button */}
          <button
            onClick={handleReset}
            title="إعادة تعيين البيانات للهاكاثون"
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Admin link pill (Like 'تسجيل الدخول' in screenshot) */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-xs font-header font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <span>إدارة المستودع</span>
          </Link>

          {/* Primary Action Button (Solid dark pill like 'ابدأ مجاناً' in screenshot) */}
          <Link
            href="/needs"
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-header font-bold bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <span>استكشف النواقص</span>
          </Link>
        </div>

      </div>
    </header>
  );
}

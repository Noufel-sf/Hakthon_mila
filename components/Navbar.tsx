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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Right: Navigation Menu Links (RTL layout) */}
          <nav className="flex items-center gap-1 sm:gap-6">
            {navLinks.map(link => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#E0533C] font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#E0533C] dark:hover:text-[#E0533C]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-[#E0533C] rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Center: Brand Logo (Styled like the screenshot logo mark + title + subtitle) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-11 w-11 rounded-2xl bg-[#FFF2F0] dark:bg-[#341611] border border-[#FAD8D2] dark:border-[#52231A] flex items-center justify-center text-[#E0533C] shadow-sm group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="flex flex-col text-center">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                إغاثــة
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E0533C] mt-1">
                IGHATHA DZ
              </span>
            </div>
          </Link>

          {/* Left: Actions (Theme toggle, Reset Demo, and Primary Pill Button) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Dark / Light) */}
            <ThemeToggle />

            {/* Reset Demo Data button */}
            <button
              onClick={handleReset}
              title="إعادة تعيين البيانات للهاكاثون"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-all text-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Primary Action Button (Pill button like 'احجز الآن' in screenshot) */}
            <Link
              href="/needs"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#E0533C] hover:bg-[#C9442E] text-white shadow-md shadow-[#E0533C]/20 transition-all hover:shadow-lg hover:shadow-[#E0533C]/30 hover:-translate-y-0.5"
            >
              <span>استكشف النواقص</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 

  Compass
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: '/',
      label: 'الرئيسية',
    },
    {
      href: '/map',
      label: 'الخريطة الميدانية',
      isLive: true,
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

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-3 z-40 max-w-6xl mt-5 mx-auto px-4 w-full">
      <div className="rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm px-5 sm:px-7 py-2.5 flex items-center justify-between gap-4 transition-all">
        
        {/* Right: Brand Logo (RTL layout) */}
        <Link href="/" aria-label="الرئيسية - منصة البوصلة + لإغاثة الكوارث" className="flex items-center gap-2.5 group shrink-0">
          <div className="h-9 w-9 rounded-full bg-primary border border-primary flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-header text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              البوصلة <span className="text-primary">+</span>
            </span>
            <span className="text-[10px] font-bold font-mono tracking-wider text-[#03120D] dark:text-white hidden sm:inline px-1.5 py-0.5 bg-[#03120D]/10 dark:bg-white/10 rounded border border-[#03120D]/20 dark:border-white/20">
              DZ
            </span>
          </div>
        </Link>

        {/* Center: Navigation Menu Links */}
        <nav aria-label="القائمة الرئيسية" className="hidden md:flex items-center gap-6">
          {navLinks.map(link => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-header text-sm sm:text-base font-bold transition-colors py-1 relative flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#03120D] dark:text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#03120D] dark:hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {link.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0E4B35] dark:bg-emerald-500"></span>
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1.5 right-0 left-0 h-0.5 bg-[#03120D] dark:bg-white rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Left: Actions (Theme toggle and Action Buttons) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle (Dark / Light) */}

          {/* Admin link pill */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex text-bold items-center px-4 py-2 rounded-full text-xs font-header font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <span>إدارة المستودع</span>
          </Link>

          {/* Primary Action Button (Solid dark pill like 'ابدأ مجاناً' in screenshot) */}
          <Link
            href="/needs"
            className="inline-flex items-center text-bold gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-header font-bold bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <span className="text-xs">استكشف النواقص</span>
          </Link>
        </div>

      </div>
    </header>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass,
  Menu,
  X,
  Home,
  Map as MapIcon,
  ClipboardList,
  Warehouse,
  ShieldCheck
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile menu upon navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      href: '/',
      label: 'الرئيسية',
      icon: Home,
    },
    {
      href: '/map',
      label: 'الخريطة الميدانية',
      icon: MapIcon,
      isLive: true,
    },
    {
      href: '/needs',
      label: 'الاحتياجات والنواقص',
      icon: ClipboardList,
    },
    {
      href: '/depots',
      label: 'المستودعات',
      icon: Warehouse,
    },
    {
      href: '/admin',
      label: 'إدارة المستودع',
      icon: ShieldCheck,
    },
  ];

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-3 z-40 max-w-6xl mt-3 sm:mt-5 mx-auto px-4 w-full">
      <div className="rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm px-4 sm:px-7 py-2.5 flex items-center justify-between gap-3 transition-all">
        
        {/* Right: Brand Logo (RTL layout) */}
        <Link href="/" aria-label="الرئيسية - منصة البوصلة + لإغاثة الكوارث" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary border border-primary flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-1 sm:gap-1.5">
            <span className="font-header text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              البوصلة <span className="text-primary">+</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold font-mono tracking-wider text-[#03120D] dark:text-white hidden sm:inline px-1.5 py-0.5 bg-[#03120D]/10 dark:bg-white/10 rounded border border-[#03120D]/20 dark:border-white/20">
              DZ
            </span>
          </div>
        </Link>

        {/* Center: Navigation Menu Links (Desktop) */}
        <nav aria-label="القائمة الرئيسية" className="hidden md:flex items-center gap-6">
          {navLinks.map(link => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

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

        {/* Left: Actions & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Admin link pill (Desktop) */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex text-bold items-center px-4 py-2 rounded-full text-xs font-header font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <span>إدارة المستودع</span>
          </Link>

          {/* Primary Action Button */}
          <Link
            href="/needs"
            className="inline-flex items-center text-bold gap-1 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-header font-bold bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-sm hover:shadow-md transition-all"
          >
            <span className="text-xs">استكشف النواقص</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة الرئيسية'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#0E4B35]"
          >
            <span className={`inline-flex transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 border border-slate-200/90 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl shadow-xl p-4 space-y-3 rounded-2xl animate-mobile-drawer">
          <nav aria-label="قائمة الهاتف المحمول" className="space-y-1">
            {navLinks.map(link => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-header text-sm font-bold transition-all active:scale-[0.98] ${
                    isActive
                      ? 'bg-[#0E4B35] text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>

                  {link.isLive && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      مباشر
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-header font-bold text-slate-500 dark:text-slate-400">
              المظهر:
            </span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}


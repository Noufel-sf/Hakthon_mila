'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Map as MapIcon, 
  ClipboardList, 
  Warehouse, 
  ShieldCheck 
} from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin routes so it doesn't conflict with admin layout
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      label: 'الرئيسية',
      icon: Home,
      exact: true,
    },
    {
      href: '/map',
      label: 'الخريطة',
      icon: MapIcon,
      isLive: true,
    },
    {
      href: '/needs',
      label: 'النواقص',
      icon: ClipboardList,
    },
    {
      href: '/depots',
      label: 'المستودعات',
      icon: Warehouse,
    },
    {
      href: '/admin',
      label: 'الإدارة',
      icon: ShieldCheck,
    },
  ];

  return (
    <nav
      aria-label="شريط التنقل السفلي للهواتف"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)] animate-mobile-nav-enter"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-full py-1 transition-all duration-150 select-none group active:scale-95 ${
                isActive
                  ? 'text-[#0E4B35] dark:text-emerald-400 font-bold bg-[#0E4B35]/5 dark:bg-emerald-500/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {/* Active Top Line Indicator with Animation */}
              {isActive && (
                <span className="absolute top-0 inset-x-3 h-0.5 bg-[#0E4B35] dark:bg-emerald-400 animate-tab-indicator origin-center" />
              )}

              {/* Icon Container with optional Live Ping */}
              <div className="relative mb-1">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'animate-tab-icon' : 'group-hover:scale-105'}`} />
                {item.isLive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] font-header tracking-tight leading-none ${isActive ? 'font-bold scale-105' : 'font-medium'} transition-transform`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

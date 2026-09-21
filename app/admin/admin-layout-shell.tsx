'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRelief } from '@/lib/store';
import { 
  LayoutGrid, 
  Truck, 
  Clock, 
  Warehouse, 
  ClipboardList, 
  ExternalLink, 
  Bell, 
  Search, 
  Calendar, 
  ChevronDown, 
  Menu, 
  X, 
  ShieldCheck, 
  Package, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  Users 
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/Badge';

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { depots, selectedDepotId, setSelectedDepotId, getDepot, fetchDepotsOnly } = useRelief();
  const [isLoadingDepots, setIsLoadingDepots] = useState(depots.length === 0);

  // Fetch only depots list on mount if empty
  React.useEffect(() => {
    if (depots.length === 0) {
      fetchDepotsOnly().finally(() => setIsLoadingDepots(false));
    }
  }, [depots.length, fetchDepotsOnly]);

  const currentDepot = (selectedDepotId ? getDepot(selectedDepotId) : null) || depots[0];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState('آخر 30 يوماً');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Find expiring items count in current depot for red badge
  const expiringCount = currentDepot?.batches?.filter(b => b.status === 'expiring_soon')?.length || 0;

  const navItems = [
    {
      href: '/admin',
      label: 'لوحة القيادة',
      icon: LayoutGrid,
      exact: true,
    },
    {
      href: '/admin/depots',
      label: 'إدارة المستودعات',
      icon: Warehouse,
    },
    {
      href: '/admin/needs',
      label: 'إدارة الاحتياجات',
      icon: ClipboardList,
    },
    {
      href: '/admin/families',
      label: 'العائلات المستفيدة',
      icon: Users,
    },
    {
      href: '/admin/distributions',
      label: 'سجل التوزيع الميداني',
      icon: Package,
    },
    {
      href: '/admin/expiry',
      label: 'تتبع الصلاحية (FIFO)',
      icon: Clock,
      badge: expiringCount > 0 ? `${expiringCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      href: '/admin/intake',
      label: 'استلام الشحنات',
      icon: Truck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased">
      
      {/* ================= RTL DESKTOP SIDEBAR (RIGHT SIDE) ================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-l border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen sticky top-0 h-screen z-30 transition-colors">
        
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="font-header">ب+</span>
            </div>
            <div>
              <div className="font-header font-black text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                البوصلة <span className="text-primary">+</span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold">أدمن</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">منظومة الإدارة والتوجيه اللوجستي</p>
            </div>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            القائمة الرئيسية
          </div>

          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            المستودع النشط
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentDepot?.name || 'جاري تحميل المستودع...'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {currentDepot?.address || 'مستودع إغاثة ميداني معتمد'}
            </p>
            <div className="text-[10px] text-primary font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              جاهز لتفريغ الشحنات وتحديث الجرد
            </div>
          </div>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                كب
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  كريم بن عيسى
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  مدير العمليات اللوجستية
                </p>
              </div>
            </div>

            <Link 
              href="/"
              title="العودة للمنصة العامة"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* ================= TOP HEADER BAR ================= */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors">
          
          {/* Right Header Section: Mobile Menu + Depot Switcher */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Depot Selector with icon */}
            <div className="relative flex items-center">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-xs font-semibold">
                <Warehouse className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-slate-500 dark:text-slate-400">المستودع:</span>
                <select
                  value={currentDepot?.id || ''}
                  onChange={(e) => setSelectedDepotId(e.target.value)}
                  aria-label="اختيار المستودع"
                  className="bg-transparent text-slate-800 dark:text-white font-bold focus:outline-none cursor-pointer pr-1"
                >
                  {depots.map(d => (
                    <option key={d.id} value={d.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                      {d.name} ({d.wilaya})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Depot select */}
              <div className="sm:hidden">
                <select
                  value={currentDepot?.id || ''}
                  onChange={(e) => setSelectedDepotId(e.target.value)}
                  aria-label="اختيار المستودع"
                  className="text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {depots.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Left Header Section: Date Range Selector, Search, Bell, Profile Avatar, ThemeToggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Date Range Selector Pill (matches reference design "آخر 30 يوماً") */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{activeDateRange}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showDatePicker && (
                <div className="absolute left-0 mt-2 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  {['اليوم', 'آخر 7 أيام', 'آخر 30 يوماً', 'آخر 90 يوماً', 'كامل العام'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setActiveDateRange(range);
                        setShowDatePicker(false);
                      }}
                      className={`w-full text-right px-3.5 py-2 text-xs transition-colors ${
                        activeDateRange === range 
                          ? 'bg-primary/10 text-primary font-bold' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell with indicator */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="الإشعارات"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">تنبيهات النظام</span>
                    <span className="text-[10px] text-primary font-semibold">3 جديدة</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 py-1 text-xs">
                    <div className="py-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">شحنة حليب معقم قاربت على الصلاحية</p>
                      <span className="text-[10px] text-slate-400">مستودع ميلة • متبقي 3 أيام</span>
                    </div>
                    <div className="py-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">تم استلام شحنة أفرشة بنجاح</p>
                      <span className="text-[10px] text-slate-400">اليوم 10:45 ص</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Admin Avatar */}
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer">
              <span>ك</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-1.5 z-20">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            
            <div className="pt-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
                <span>العودة إلى المنصة العامة</span>
              </Link>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

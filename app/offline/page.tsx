'use client';

import React from 'react';
import Link from 'next/link';
import { 
  WifiOff, 
  PhoneCall, 
  ShieldAlert, 
  RefreshCw, 
  Warehouse, 
  Compass, 
  ArrowRight,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const emergencyContacts = [
    {
      service: 'الحماية المدنية الجزائرية (طوارئ الكوارث والإنقاذ)',
      number: '14',
      altNumber: '1021',
      color: 'bg-rose-600 text-white',
      desc: 'تدخل فوري للحرائق، الفيضانات، والانهيارات',
    },
    {
      service: 'الدرك الوطني (طوارئ الطرق والتوجيه الميداني)',
      number: '1055',
      color: 'bg-emerald-800 text-white',
      desc: 'تنسيق المسالك الجبلية وقوافل الإغاثة',
    },
    {
      service: 'الأمن الوطني / الشرطة الجزائرية',
      number: '1548',
      altNumber: '17',
      color: 'bg-blue-700 text-white',
      desc: 'الأمن العام والنجدة في المراكز الحضرية',
    },
    {
      service: 'الإسعاف الطبي الاستعجالي (SAMU)',
      number: '115',
      color: 'bg-amber-600 text-white',
      desc: 'نقل الجرحى والحالات الطبية الحرجة',
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-sm">
        
        {/* Offline Beacon Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <WifiOff className="w-8 h-8 animate-pulse" />
          </div>

          <h1 className="font-header text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            وضع الطوارئ دون اتصال (Offline)
          </h1>

          <p className="font-sub text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
            انقطع الاتصال بشبكة الإنترنت. تم تفعيل نظام التخزين الميداني لتمكينك من تصفح البيانات المحفوظة والوصول إلى أرقام النجدة المباشرة.
          </p>
        </div>

        {/* Retry & Cached Access Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={handleReload}
            className="w-full sm:w-auto rounded-none gap-2 font-header font-bold bg-[#0E4B35] hover:bg-[#125e43] text-white"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة محاولة الاتصال</span>
          </Button>

          <Link href="/depots" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full rounded-none gap-2 font-header font-bold border-slate-300 dark:border-slate-700"
            >
              <Warehouse className="w-4 h-4 text-emerald-600" />
              <span>المستودعات المخزنة محلياً</span>
            </Button>
          </Link>

          <Link href="/map" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full rounded-none gap-2 font-header font-bold border-slate-300 dark:border-slate-700"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>الخريطة الميدانية</span>
            </Button>
          </Link>
        </div>

        {/* Critical Emergency Hotlines */}
        <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="flex items-center gap-2 text-xs font-header font-bold text-slate-700 dark:text-slate-300">
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>أرقام الطوارئ الميدانية الوطنية (تعمل بدون إنترنت):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.service}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="font-header font-bold text-xs text-slate-900 dark:text-white leading-tight mb-1">
                    {contact.service}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {contact.desc}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <a
                    href={`tel:${contact.number}`}
                    className={`px-3 py-1 text-xs font-mono font-bold flex items-center gap-1.5 ${contact.color}`}
                  >
                    <span>اتصل:</span>
                    <span>{contact.number}</span>
                  </a>
                  {contact.altNumber && (
                    <a
                      href={`tel:${contact.altNumber}`}
                      className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                    >
                      {contact.altNumber}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-[#0E4B35] dark:text-emerald-300 flex items-center gap-2 font-sub">
          <HeartHandshake className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            تطبيق البوصلة + مهيأ بتقنية PWA للعمل الميداني حتى في أشد مناطق الكوارث انقطاعاً للشبكة.
          </span>
        </div>
      </div>
    </div>
  );
}

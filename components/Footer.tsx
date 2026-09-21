'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MapPin, Mail, HeartHandshake } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer aria-label="تذييل الصفحة ومعلومات التواصل" className="w-full pt-10 pb-12 mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 2: Contact, Navigation & Copyright */}
          <div className="lg:col-span-8 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 sm:p-9 shadow-xs flex flex-col justify-between space-y-8">
            
            {/* Top Links and Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              {/* Contact Us Column */}
              <div className="space-y-4">
                <h4 className="font-header font-bold text-base text-slate-900 dark:text-white border-r-2 border-[#0E4B35] pr-2">
                  تواصل معنا
                </h4>
                
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span dir="ltr" className="font-mono">+213 34 50 12 34 , +213 550 12 34 56</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>المستودع المركزي الميداني — ميلة، الجزائر</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono">contact@ighatha-dz.org</span>
                  </li>
                </ul>
              </div>

              {/* Navigation Column */}
              <div className="space-y-4">
                <h4 className="font-header font-bold text-base text-slate-900 dark:text-white border-r-2 border-[#0E4B35] pr-2">
                  لتنسيق أفضل
                </h4>
                
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li>
                    <Link href="/depots" className="hover:text-[#0E4B35] dark:hover:text-emerald-400 transition-colors">
                      دليل المستودعات الميدانية
                    </Link>
                  </li>
                  <li>
                    <Link href="/needs" className="hover:text-[#0E4B35] dark:hover:text-emerald-400 transition-colors">
                      مرصد النواقص والاحتياجات
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin" className="hover:text-[#0E4B35] dark:hover:text-emerald-400 transition-colors">
                      لوحة إدارة المستودع الذكي
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/intake" className="hover:text-[#0E4B35] dark:hover:text-emerald-400 transition-colors">
                      تفريغ وتوجيه الشاحنات (Staging)
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom Row: Copyright */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <span>© 2026 البوصلة الجزائر — منصة التضامن وإغاثة الكوارث 🇩🇿</span>
              <span className="text-[11px] text-slate-400">هاكاثون ميلة للإغاثة الذكية</span>
            </div>

          </div>

          {/* Card 1: Brand Mission & CTA */}
          <div className="lg:col-span-4 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 sm:p-9 shadow-xs flex flex-col justify-between space-y-6">
            
            {/* Top Brand Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-[#0E4B35] text-white flex items-center justify-center font-bold rounded-none">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <span className="font-header text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                البوصلة الجزائر
              </span>
            </div>

            {/* Arabic Mission Text */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              منصة تنسيق التضامن والإغاثة الميدانية أثناء الكوارث الطبيعية. مهمتنا توجيه المساعدات للمكان والوقت والاحتياج الصحيح.
            </p>

            {/* Primary Action Button */}
            <Link
              href="/needs"
              className="w-full py-3 px-6 rounded-none bg-[#0E4B35] hover:bg-[#093525] text-white font-header font-bold text-sm text-center shadow-xs transition-colors"
            >
              استكشف النواقص والاحتياجات
            </Link>

          </div>

        </div>
      </div>
    </footer>
  );
}

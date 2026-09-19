'use client';

import React from 'react';
import Link from 'next/link';
import { HeartHandshake, Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full pt-10 pb-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Card 2 (Left in LTR, Left in RTL screenshot): Contact, Navigation & Copyright */}
          <div className="lg:col-span-8 rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 sm:p-9 shadow-xs flex flex-col justify-between space-y-8">
            
            {/* Top Links and Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              {/* Contact Us Column */}
              <div className="space-y-4">
                <h4 className="font-header font-bold text-base text-slate-900 dark:text-white">
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
                <h4 className="font-header font-bold text-base text-slate-900 dark:text-white">
                  لتنسيق أفضل
                </h4>
                
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li>
                    <Link href="/depots" className="hover:text-[#E0533C] transition-colors">
                      دليل المستودعات الميدانية
                    </Link>
                  </li>
                  <li>
                    <Link href="/needs" className="hover:text-[#E0533C] transition-colors">
                      مرصد النواقص والاحتياجات
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin" className="hover:text-[#E0533C] transition-colors">
                      لوحة إدارة المستودع الذكي
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/intake" className="hover:text-[#E0533C] transition-colors">
                      تفريغ وتوجيه الشاحنات (Staging)
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom Row: Copyright and Socials */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <span>© 2026 IGHATHA DZ — هاكاثون ميلة للإغاثة الذكية</span>
              
              <div className="flex items-center gap-4 text-slate-400">
                {/* Twitter / X Icon */}
                <a href="#" aria-label="Twitter" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* LinkedIn Icon */}
                <a href="#" aria-label="LinkedIn" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28M5.07 18.5h2.78v-8.37H5.07v8.37z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>

          {/* Card 1 (Right in RTL screenshot): Brand Mission & CTA */}
          <div className="lg:col-span-4 rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 sm:p-9 shadow-xs flex flex-col justify-between space-y-6">
            
            {/* Top Brand Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#FFF2F0] dark:bg-[#341611] text-[#E0533C] flex items-center justify-center font-bold">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="font-header text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                إغاثــة
              </span>
            </div>

            {/* Meaningful Arabic Mission Text */}
            <p className="font-sub text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              إغاثة خلاتك ترتاح — كلشي منظم، شفاف ومباشر. وجّه تبرعك بناءً على العجز الحقيقي وتفادى تكدس المساعدات وتلفها في الميدان.
            </p>

            {/* Primary Action Button */}
            <Link
              href="/needs"
              className="w-full py-3.5 px-6 rounded-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-header font-bold text-sm text-center shadow-md hover:shadow-lg transition-all"
            >
              استكشف النواقص — مجاناً
            </Link>

          </div>

        </div>
      </div>
    </footer>
  );
}

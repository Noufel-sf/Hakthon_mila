'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useReliefStore } from '@/lib/store';
import DepotCard from '@/components/DepotCard';
import { 
  Search, 
  MapPin, 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ClipboardList,
  Warehouse,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { AID_CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  const depots = useReliefStore((state) => state.depots);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate global summary stats
  const totalDepots = depots.length;
  let totalDeficitItems = 0;
  let totalSatisfiedItems = 0;

  depots.forEach(depot => {
    depot.items.forEach(item => {
      if (item.targetNeed > item.currentStock) {
        totalDeficitItems++;
      } else {
        totalSatisfiedItems++;
      }
    });
  });

  // Filter depots based on search or category
  const filteredDepots = depots.filter(depot => {
    const matchesCategory = selectedCategory === 'all' || depot.items.some(i => i.category === selectedCategory);
    const matchesSearch = 
      depot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter categories for the floating search card pills
  const pillFilters = [
    { id: 'all', label: 'كافة الاحتياجات' },
    { id: 'furniture', label: 'أرائك وأثاث' },
    { id: 'bedding', label: 'أفرشة وبطانيات' },
    { id: 'appliances', label: 'أجهزة كهرومنزلية' },
    { id: 'food', label: 'مواد غذائية' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12">
      
      {/* 🌟 HERO SECTION (Inspired directly by the screenshot: Simple, clean, less text, Zain & Amiri Quran fonts) */}
      <div className="relative pt-12 pb-10 sm:pt-16 sm:pb-14 flex flex-col items-center text-center overflow-hidden">
        
        {/* Subtle delicate background sparkles and soft ambient glow */}
        <div className="absolute top-1/4 right-1/6 text-slate-300 dark:text-slate-700 text-sm select-none pointer-events-none animate-pulse">✦</div>
        <div className="absolute top-1/3 left-1/5 text-slate-300 dark:text-slate-700 text-xs select-none pointer-events-none">✦</div>
        <div className="absolute bottom-1/4 right-1/4 text-slate-200 dark:text-slate-800 text-base select-none pointer-events-none">✦</div>
        <div className="absolute top-1/6 left-1/3 w-1.5 h-1.5 rounded-full bg-cyan-300/40 pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full bg-rose-300/40 pointer-events-none"></div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-gradient-to-t from-cyan-100/40 dark:from-cyan-950/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-5 px-4">
          
          {/* Top Pill Tag (Like 'لتسيير تجارتك' in screenshot) */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs sm:text-sm font-header font-bold bg-[#E6F8F9] dark:bg-[#11353B] text-[#126972] dark:text-[#5EEAD4] border border-[#C6EFF2] dark:border-[#1E525B] shadow-2xs">
            <span>لتنسيق إغاثة الكوارث</span>
          </div>

          {/* Main Headline with Highlight box (Font: Zain) */}
          <h1 className="font-header text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]">
            وجّه ونسّق المساعدات الميدانية <br />
            <span className="relative inline-block mt-2 px-5 py-1 bg-[#D3F4F6] dark:bg-[#14444D] text-[#0A565E] dark:text-[#67E8F9] rounded-2xl shadow-xs">
              من منصة واحدة
            </span>
          </h1>

          {/* Subtitle (Font: Amiri Quran with much less text) */}
          <p className="font-sub text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed pt-1">
            منصة جزائرية مفتوحة تساعد المتطوعين والمتبرعين على كشف النواقص الحقيقية لكل مستودع، وتوجيه الإغاثة لحظياً لتفادي تكدسها وتلفها.
          </p>

          {/* Action Pill Buttons (Primary solid dark + Secondary white pill) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/needs"
              className="px-8 py-3 rounded-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-header font-bold text-sm sm:text-base shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              استكشف النواقص
            </Link>

            <Link
              href="/depots"
              className="px-8 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-header font-bold text-sm sm:text-base shadow-2xs transition-all hover:-translate-y-0.5"
            >
              دليل المستودعات
            </Link>
          </div>

        </div>

      </div>

      {/* 🔍 SEARCH & CATEGORY FILTER BAR */}
      <div className="max-w-3xl mx-auto px-4 w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm transition-colors space-y-3">
          
          {/* Top: Pill Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {pillFilters.map(pill => {
              const isActive = selectedCategory === pill.id;

              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-header font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E0533C] text-white shadow-sm shadow-[#E0533C]/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Bottom: Search Input + Action Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="أكتب هنا للبحث عن صنف، بلدية أو مستودع..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl pl-4 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#E0533C] transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => {}}
              className="px-6 py-2.5 rounded-2xl bg-[#E0533C] hover:bg-[#C9442E] text-white font-header font-bold text-xs sm:text-sm transition-all shadow-sm shadow-[#E0533C]/20 shrink-0 cursor-pointer"
            >
              إبحــث الآن
            </button>
          </div>

        </div>
      </div>

      {/* Depots Preview Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#E0533C] uppercase tracking-wider block mb-1">
              المستودعات الميدانية
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              الوضع اللحظي لمراكز التوزيع
            </h2>
          </div>

          <Link
            href="/depots"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E0533C] hover:underline"
          >
            <span>عرض دليل المستودعات بالكامل</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {filteredDepots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepots.map(depot => (
              <DepotCard key={depot.id} depot={depot} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Info className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">لا توجد نتائج مطابقة</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              جرب اختيار صنف آخر أو مسح عبارة البحث
            </p>
          </div>
        )}
      </div>

      {/* Core Philosophy Section (3 clean cards in modern light theme) */}
      <div className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-8 sm:p-10">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-bold text-[#E0533C] uppercase tracking-wider block mb-1">
            لماذا منصة إغاثة؟
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            توفير المعلومة الدقيقة بدل فرض البيروقراطية
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-xl bg-[#FFF2F0] dark:bg-[#341611] text-[#E0533C] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm">
              التبرع العفوي الواعي
            </h4>
            <p className="leading-relaxed">
              المواطنون يتبرعون تلقائياً. المنصة لا تطلب تسجيل قوافل ولا تفرض قيوداً، بل تعرض بوضوح أين يوجد النقص الحقيقي.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm">
              منع تلف المساعدات (FIFO)
            </h4>
            <p className="leading-relaxed">
              تسجيل تواريخ انتهاء الدفعات وإطلاق تنبيهات استباقية للمواد الغذائية سريعة التلف لتوزيعها قبل أن تفسد في المستودعات.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm">
              التفريغ الذكي (Smart Staging)
            </h4>
            <p className="leading-relaxed">
              توجيه الشاحنات لحظة الوصول للأرصفة المحددة (Zone A, B, C, D) حسب الصنف لمنع التفريغ المخلط وتوفير عمال الفرز والتحميل.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

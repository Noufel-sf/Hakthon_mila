'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useReliefStore, mapSummaryToDepot } from '@/lib/store';
import { api } from '@/lib/api';
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
  ArrowUpRight,
  HeartHandshake
} from 'lucide-react';
import { AID_CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  const depots = useReliefStore((state) => state.depots);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(depots.length === 0);

  // Fetch only this page's required requests: depots list & needs list
  useEffect(() => {
    let isMounted = true;
    async function loadPageData() {
      try {
        const [depotList, needsList] = await Promise.all([
          api.depots.list().catch(() => []),
          api.needs.list().catch(() => []),
        ]);
        if (isMounted) {
          if (depotList && depotList.length > 0) {
            const mapped = depotList.map(d => mapSummaryToDepot(d, needsList, []));
            useReliefStore.getState().setDepots(mapped);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) setIsLoading(false);
      }
    }
    loadPageData();
    return () => { isMounted = false; };
  }, []);

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

  // Filter categories for the floating search card pills (OpenAPI AidCategory)
  const pillFilters = [
    { id: 'all', label: 'كافة الاحتياجات' },
    { id: 'FOOD', label: 'مواد غذائية' },
    { id: 'WATER', label: 'مياه شرب' },
    
    { id: 'MATTRESSES', label: 'أفرشة وبطانيات' },
    { id: 'APPLIANCES', label: 'أجهزة كهرومنزلية' },
    { id: 'FURNITURE', label: 'أثاث وأرائك' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12">
      
      {/* 🌟 HERO SECTION (Inspired directly by the screenshot: Simple, clean, less text, Zain & Amiri Quran fonts) */}
      <div className="relative pt-12 pb-10 sm:pt-16 sm:pb-14 flex flex-col items-center text-center overflow-hidden">
        
        {/* 🎨 ANIMATED HERO DOODLE ICONS (CSS Only — Inspired by reference landing page) */}
        
        {/* Top-Left: Doodle Sunburst */}
        <div className="absolute top-3 sm:top-6 left-3 sm:left-8 lg:left-14 pointer-events-none select-none animate-hero-pulse-soft z-0">
          <svg className="w-11 h-11 sm:w-15 sm:h-15 text-primary dark:text-primary opacity-80" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="32" cy="32" r="11" />
            <line x1="32" y1="6" x2="32" y2="13" />
            <line x1="32" y1="51" x2="32" y2="58" />
            <line x1="6" y1="32" x2="13" y2="32" />
            <line x1="51" y1="32" x2="58" y2="32" />
            <line x1="14" y1="14" x2="19" y2="19" />
            <line x1="45" y1="45" x2="50" y2="50" />
            <line x1="14" y1="50" x2="19" y2="45" />
            <line x1="45" y1="19" x2="50" y2="14" />
          </svg>
        </div>

        {/* Upper-Left: 4-Point Sparkle Twinkle */}
        <div className="absolute top-14 sm:top-20 left-16 sm:left-28 lg:left-40 pointer-events-none select-none animate-hero-float-1 z-0">
          <svg className="w-8 h-8 sm:w-11 sm:h-11 text-primary dark:text-primary opacity-70" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 4 C24 16 16 24 4 24 C16 24 24 32 24 44 C24 32 32 24 44 24 C32 24 24 16 24 4 Z" />
            <circle cx="38" cy="10" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="10" cy="38" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>

        {/* Mid-Left: Curly Looped Arrow */}
        <div className="absolute top-36 sm:top-44 left-3 sm:left-12 lg:left-20 pointer-events-none select-none animate-hero-wobble-slow z-0">
          <svg className="w-10 h-10 sm:w-14 sm:h-14 text-slate-800 dark:text-slate-200 opacity-75" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 48 C 10 38, 26 34, 22 26 C 18 18, 32 16, 36 24 C 40 32, 46 16, 52 12" />
            <path d="M44 11 L53 11 L53 20" />
          </svg>
        </div>

        {/* Far Top-Right: Sprouting Seedling Plant */}
        <div className="absolute top-3 sm:top-5 right-3 sm:right-8 lg:right-14 pointer-events-none select-none animate-hero-float-3 z-0">
          <svg className="w-10 h-10 sm:w-14 sm:h-14 text-primary dark:text-primary opacity-75" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="52" x2="52" y2="52" />
            <path d="M30 52 C30 36 30 24 30 18" />
            <path d="M30 20 C22 10 12 18 20 28 C26 34 30 26 30 20 Z" />
            <path d="M30 24 C38 12 50 18 42 30 C36 38 30 28 30 24 Z" />
          </svg>
        </div>

        {/* Upper-Right: Doodle Pine Tree */}
        <div className="absolute top-8 sm:top-14 right-16 sm:right-28 lg:right-40 pointer-events-none select-none animate-hero-float-2 z-0">
          <svg className="w-10 h-10 sm:w-13 sm:h-13 text-primary dark:text-primary opacity-80" viewBox="0 0 54 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M27 6 L12 24 L20 24 L8 42 L22 42 L16 52 L38 52 L32 42 L46 42 L34 24 L42 24 Z" />
            <line x1="27" y1="52" x2="27" y2="60" />
          </svg>
        </div>

        {/* Lower-Right: Doodle Floating Leaf */}
        <div className="absolute top-38 sm:top-48 right-5 sm:right-16 lg:right-24 pointer-events-none select-none animate-hero-float-1 z-0">
          <svg className="w-9 h-9 sm:w-12 sm:h-12 text-primary dark
          :text-primary opacity-70" viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 42 C12 42 16 26 30 14 C44 2 48 8 46 18 C44 28 32 40 12 42 Z" />
            <line x1="12" y1="42" x2="34" y2="20" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-5 px-4">
          
          {/* Top Pill Tag (Like 'لتسيير تجارتك' in screenshot) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs sm:text-sm font-header font-bold bg-primary text-white border border-primary ">
              <span>لتنسيق إغاثة الكوارث</span>
            </div>
          </div>

          {/* Main Headline with Highlight box (Font: Zain) */}
          <h1 className="font-header text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]">
            وجّه ونسّق المساعدات الميدانية <br />
            <span className="relative inline-block mt-2 px-5 py-1 bg-primary text-white rounded-2xl ">
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
              className="px-8 py-3 rounded-full bg-[#03120D] hover:bg-[#07261C] text-white font-header font-bold text-sm sm:text-base transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              استكشف النواقص
            </Link>

            <Link
              href="/depots"
              className="px-8 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-header font-bold text-sm sm:text-base  transition-all hover:-translate-y-0.5"
            >
              دليل المستودعات
            </Link>
          </div>

        </div>

      </div>

      {/* 🔍 SEARCH & CATEGORY FILTER BAR */}
      <div className="max-w-3xl mx-auto px-4 w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5  transition-colors space-y-3">
          
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
                      ? 'bg-[#03120D] text-white '
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
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl pl-4 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#03120D] transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => {}}
              className="px-6 py-2.5 rounded-2xl bg-[#03120D] hover:bg-[#07261C] text-white font-header font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer"
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
            <span className="text-xs font-bold text-[#03120D] dark:text-white uppercase tracking-wider block mb-1">
              المستودعات الميدانية
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              الوضع اللحظي لمراكز التوزيع
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/depots"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#03120D] dark:text-white hover:underline"
            >
              <span>عرض دليل المستودعات بالكامل</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {isLoading && depots.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredDepots.length > 0 ? (
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

      {/* 🌟 Our Values & Core Philosophy Section */}
      <section id="values" className="space-y-8 pt-4">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-header font-bold bg-primary/10 text-primary border border-primary/20">
            <span>قيمنا ومبادئ العمل الميداني</span>
          </span>
          <h2 className="font-header text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            لماذا نعتمد منظومة البوصلة + الذكية؟
          </h2>
          <p className="font-sub text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            توفير المعلومة الدقيقة للمواطنين والمتبرعين لترشيد العطاء ومنع البيروقراطية وحماية المساعدات من التلف.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Value 1 */}
          <div className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 transition-all hover:-translate-y-0.5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-header text-xl font-bold text-slate-900 dark:text-white">
                التبرع العفوي الواعي
              </h3>
              <p className="font-sub text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                المواطنون يتبرعون بتلقائية وحرية. لا نطلب تسجيل قوافل ولا نفرض قيوداً إدارية، بل نكشف بشفافية أين يوجد النقص الحقيقي لتوجيه القوافل إليه مباشرة.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-header font-semibold text-primary">
              حرية التبرع • دقة التوجيه
            </div>
          </div>

          {/* Value 2 */}
          <div className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7  transition-all hover:-translate-y-0.5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-header text-xl font-bold text-slate-900 dark:text-white">
                منع تلف المساعدات (FIFO)
              </h3>
              <p className="font-sub text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                تسجيل ومتابعة تواريخ انتهاء الدفعات الحساسة كالحليب والمواد التموينية، وإطلاق إنذارات استباقية لصرفها وفق أولوية التاريخ قبل أن تفسد في المستودعات.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-header font-semibold text-amber-500">
              صفر هدر • أولوية الصلاحية
            </div>
          </div>

          {/* Value 3 */}
          <div className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7  transition-all hover:-translate-y-0.5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Warehouse className="w-5 h-5" />
              </div>
              <h3 className="font-header text-xl font-bold text-slate-900 dark:text-white">
                التفريغ والتوجيه الذكي
              </h3>
              <p className="font-sub text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                توجيه الشاحنات فور وصولها لأرصفة محددة (Zone A, B, C, D) وفق صنف الشحنة، لمنع تفريغ المواد بشكل عشوائي وتوفير عمال الفرز والتحميل الميداني.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-header font-semibold text-emerald-500">
              تنظيم الأرصفة • تسريع الإغاثة
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

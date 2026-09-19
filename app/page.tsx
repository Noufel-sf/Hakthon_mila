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
        
        {/* Subtle delicate background sparkles and soft ambient glow */}
        <div className="absolute top-1/4 right-1/6 text-primary dark:text-primary text-sm select-none pointer-events-none animate-pulse">✦</div>
        <div className="absolute top-1/3 left-1/5 text-primary dark:text-primary text-xs select-none pointer-events-none">✦</div>
        <div className="absolute bottom-1/4 right-1/4 text-primary dark:text-primary text-base select-none pointer-events-none">✦</div>
        <div className="absolute top-1/6 left-1/3 w-1.5 h-1.5 rounded-full bg-primary/40 pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full bg-primary/40 pointer-events-none"></div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-gradient-to-t from-primary/40 dark:from-primary/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-5 px-4">
          
          {/* Top Pill Tag (Like 'لتسيير تجارتك' in screenshot) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs sm:text-sm font-header font-bold bg-primary text-white border border-primary shadow-2xs">
              <span>لتنسيق إغاثة الكوارث</span>
            </div>
          </div>

          {/* Main Headline with Highlight box (Font: Zain) */}
          <h1 className="font-header text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]">
            وجّه ونسّق المساعدات الميدانية <br />
            <span className="relative inline-block mt-2 px-5 py-1 bg-primary text-white rounded-2xl shadow-xs">
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
              className="px-8 py-3 rounded-full bg-[#03120D] hover:bg-[#07261C] text-white font-header font-bold text-sm sm:text-base shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
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
                      ? 'bg-[#03120D] text-white shadow-sm shadow-[#03120D]/25'
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
              className="px-6 py-2.5 rounded-2xl bg-[#03120D] hover:bg-[#07261C] text-white font-header font-bold text-xs sm:text-sm transition-all shadow-sm shadow-[#03120D]/20 shrink-0 cursor-pointer"
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>خادم حي (Live API Render)</span>
            </span>

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
          <div className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 space-y-4 flex flex-col justify-between">
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
          <div className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 space-y-4 flex flex-col justify-between">
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
          <div className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 space-y-4 flex flex-col justify-between">
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

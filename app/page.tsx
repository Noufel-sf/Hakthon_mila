'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRelief } from '@/lib/store';
import DepotCard from '@/components/DepotCard';
import { 
  Truck, 
  Search, 
  MapPin, 
  ShieldAlert, 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const { depots } = useRelief();
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique wilayas
  const wilayas = Array.from(new Set(depots.map(d => d.wilaya)));

  // Filtered depots
  const filteredDepots = depots.filter(depot => {
    const matchesWilaya = selectedWilaya === 'all' || depot.wilaya === selectedWilaya;
    const matchesSearch = 
      depot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesWilaya && matchesSearch;
  });

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>بوابة الشفافية وتوجيه الإغاثة الميدانية</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            لا ترسل شاحنتك عشوائياً! <br />
            <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-rose-500 bg-clip-text text-transparent">
              اعرف ماذا ينقص وأين ينقص
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            المنصة المفتوحة للجمهور والقوافل الشعبية لمتابعة احتياجات المستودعات لحظة بلحظة. 
            تجنب تكدس المواد الفائضة وتوجيه المساعدات للمناطق التي تعاني عجزاً حقيقياً في الأفرشة، الأجهزة، أو الأغذية.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/convoy"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02]"
            >
              <Truck className="w-5 h-5" />
              <span>وجّه شاحنتك وقافلتك الآن (موجّه القوافل)</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>دخول مسؤولي المستودع (Smart Staging)</span>
            </Link>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">المستودعات الفعالة</span>
            <span className="text-2xl font-mono font-extrabold text-white">{totalDepots}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">جاهزة للاستلام</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">أصناف تعاني من عجز 🔴</span>
            <span className="text-2xl font-mono font-extrabold text-rose-400">{totalDeficitItems}</span>
            <span className="text-[10px] text-rose-400 block mt-0.5">أولوية قصوى للقوافل</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">أصناف مكتفية ومستقرة ✅</span>
            <span className="text-2xl font-mono font-extrabold text-emerald-400">{totalSatisfiedItems}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">تجنب إرسال المزيد</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">نظام التخزين الذكي</span>
            <span className="text-sm font-bold text-amber-400 mt-1 block">Zone A / B / C / D</span>
            <span className="text-[10px] text-slate-400 block">تفريغ مباشر ومنع الفوضى</span>
          </div>
        </div>
      </div>

      {/* Convoy Feature Callout Card */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              عندك شاحنة تبرعات وتريد أن تعرف أين تفرغ حمولتك بالضبط؟
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              أدخل ما تحمله (مثلاً: 80 أريكة أو 300 بطانية) ليقترح عليك النظام فوراً المستودع الأكثر حاجة دون تفريغ عشوائي.
            </p>
          </div>
        </div>
        <Link
          href="/convoy"
          className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
        >
          تجربة موجّه القوافل الذكي
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            استكشاف حالة المستودعات الميدانية (Depots Live Status)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            اختر الولاية أو ابحث عن صنف معين للاطلاع على المخزون الحالي ونسبة النقص
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن مستودع أو مادة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Wilaya Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedWilaya('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedWilaya === 'all'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              جميع الولايات ({depots.length})
            </button>
            {wilayas.map(w => (
              <button
                key={w}
                onClick={() => setSelectedWilaya(w)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedWilaya === w
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Depots Grid */}
      {filteredDepots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepots.map(depot => (
            <DepotCard key={depot.id} depot={depot} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">لا توجد نتائج مطابقة</h3>
          <p className="text-xs text-slate-400">
            جرب البحث عن ولاية أخرى أو كلمة مفتاحية مختلفة
          </p>
        </div>
      )}

      {/* Core Philosophy Section (من صلب فكرة المشروع) */}
      <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
        <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          فلسفة إغاثة: توفير المعلومة الدقيقة بدل فرض البيروقراطية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-rose-400 font-bold text-sm block mb-1">1. التبرع العفوي الواعي</span>
            <p>
              الشعب الجزائري يتبرع فوراً في الكوارث. المنصة لا تلزم القوافل بالتسجيل الإجباري، بل توفر لهم شاشة شفافة لمعرفة أي مستودع يحتاج حمولتهم تحديداً.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-amber-400 font-bold text-sm block mb-1">2. منع تلف المساعدات</span>
            <p>
              نظام إدارة الصلاحية (FIFO Expiration) يضمن توزيع المواد سريعة التلف (مثل الحليب والأجبان) قبل انتهاء صلاحيتها وتفادي رميها في المستودعات.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-emerald-400 font-bold text-sm block mb-1">3. التفريغ الذكي (Smart Staging)</span>
            <p>
              توجيه الشاحنات لحظة الوصول لأرصفة التخزين المخصصة (غذاء: Zone A، أفرشة: Zone B، كهرومنزلي: Zone C، أثاث: Zone D) لمنع خلط السلع وتوفير عمال الفرز والتحميل.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

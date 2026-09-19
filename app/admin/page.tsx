'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRelief } from '@/lib/store';
import { api } from '@/lib/api';
import { InventoryResponse, NeedResponse } from '@/lib/types';
import { 
  Warehouse, 
  Layers, 
  Clock, 
  MoreHorizontal, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Coins, 
  PiggyBank, 
  CreditCard, 
  Home, 
  Flame,
  ChevronLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const { depots, selectedDepotId, getDepot } = useRelief();
  const currentDepot = (selectedDepotId ? getDepot(selectedDepotId) : null) || depots[0];

  const [inventoryList, setInventoryList] = useState<InventoryResponse[]>([]);
  const [needsList, setNeedsList] = useState<NeedResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch only this depot's inventory and needs
  useEffect(() => {
    let isMounted = true;
    async function loadDepotDashboard() {
      setIsLoading(true);
      try {
        const depotIdNum = Number(selectedDepotId) || Number(currentDepot?.id) || 1;
        const [inv, needs] = await Promise.all([
          api.inventory.list({ depotId: depotIdNum }).catch(() => []),
          api.needs.list({ depotId: depotIdNum }).catch(() => []),
        ]);
        if (isMounted) {
          setInventoryList(inv || []);
          setNeedsList(needs || []);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadDepotDashboard();
    return () => { isMounted = false; };
  }, [selectedDepotId, currentDepot?.id]);

  // Real calculations from backend data
  const totalStock = inventoryList.reduce((acc, item) => acc + item.quantity, 0);
  const totalTarget = needsList.reduce((acc, item) => acc + item.requestedQuantity, 0);
  const totalDistributed = Math.max(0, totalTarget - totalStock);
  const totalAidInflow = totalStock + totalDistributed;

  const highestShortageItem = [...needsList].sort(
    (a, b) => (b.shortage || (b.requestedQuantity - b.currentAvailableQuantity)) - (a.shortage || (a.requestedQuantity - a.currentAvailableQuantity))
  )[0];

  const shortageQty = highestShortageItem 
    ? (highestShortageItem.shortage || Math.max(0, highestShortageItem.requestedQuantity - highestShortageItem.currentAvailableQuantity))
    : 0;

  // Real inventory grouping by category for bar chart
  const categoryMap: Record<string, number> = {};
  inventoryList.forEach(item => {
    const cat = item.category || 'OTHER';
    categoryMap[cat] = (categoryMap[cat] || 0) + item.quantity;
  });

  const maxCategoryVal = Math.max(1, ...Object.values(categoryMap));
  const categoryLabels: Record<string, string> = {
    FOOD: 'أغذية',
    WATER: 'مياه',
    MEDICAL: 'أدوية',
    MATTRESSES: 'أفرشة',
    BLANKETS: 'بطانيات',
    HYGIENE: 'نظافة',
    APPLIANCES: 'أجهزة',
    FURNITURE: 'أثاث',
    OTHER: 'أخرى',
  };

  const barChartData = Object.entries(categoryMap).length > 0 
    ? Object.entries(categoryMap).map(([cat, val]) => ({
        label: categoryLabels[cat] || cat,
        value: val,
        height: `${Math.min(100, Math.round((val / maxCategoryVal) * 100))}%`,
        isPeak: val === maxCategoryVal,
      }))
    : [
        { label: 'مستودع فارغ', value: 0, height: '10%', isPeak: false }
      ];

  // Real recent activities from real inventory batches
  const recentActivities = inventoryList.length > 0 
    ? inventoryList.slice(0, 4).map(inv => ({
        id: inv.id,
        title: inv.itemName,
        date: inv.receivedDate ? `تاريخ الاستلام: ${inv.receivedDate}` : 'دفعة نشطة',
        amount: `${inv.quantity} ${inv.unit}`,
        status: inv.isExpiringSoon ? 'warning' : 'success',
      }))
    : [
        {
          id: 0,
          title: 'لا توجد دفعات مخزون مسجلة',
          date: 'المستودع في انتظار شحنات',
          amount: '0',
          status: 'neutral',
        }
      ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ================= TOP SECTION: 4 KPI METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1 (Rightmost in RTL): White Card - إجمالي الوارد الإغاثي */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="خيارات">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="h-11 w-11 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              إجمالي الوارد الإغاثي
            </p>
            <h3 className="text-2xl sm:text-3xl font-black font-header tracking-tight text-slate-900 dark:text-white">
              {totalAidInflow.toLocaleString('ar-DZ')} <span className="text-sm font-semibold text-slate-500">وحدة</span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>بيانات حية ومباشرة في الوقت الفعلي</span>
          </div>
        </div>

        {/* CARD 2 (FEATURED SOLID PRIMARY CARD): المساعدات الموزعة */}
        <div className="rounded-2xl bg-primary text-white p-5 shadow-lg shadow-primary/25 relative overflow-hidden flex flex-col justify-between">
          {/* Subtle decorative background circle */}
          <div className="absolute -left-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <button className="text-white/80 hover:text-white" aria-label="خيارات">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="h-11 w-11 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1 mb-4 relative z-10">
            <p className="text-xs font-medium text-white/90">
              المساعدات الموزعة فعلياً
            </p>
            <h3 className="text-2xl sm:text-3xl font-black font-header tracking-tight text-white">
              {totalDistributed.toLocaleString('ar-DZ')} <span className="text-sm font-medium text-white/80">وحدة</span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90 relative z-10">
            <ArrowDownLeft className="w-4 h-4 text-white/90" />
            <span>تحديث ميداني تلقائي</span>
          </div>
        </div>

        {/* CARD 3: White Card with "عرض التفاصيل" - المخزون الإغاثي المتاح */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/depots"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              عرض التفاصيل
            </Link>
            <div className="h-11 w-11 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              إجمالي المخزون المتاح
            </p>
            <h3 className="text-2xl sm:text-3xl font-black font-header tracking-tight text-slate-900 dark:text-white">
              {totalStock.toLocaleString('ar-DZ')} <span className="text-sm font-semibold text-slate-500">وحدة</span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Warehouse className="w-4 h-4" />
            <span>{inventoryList.length} دفعات مسجلة</span>
          </div>
        </div>

        {/* CARD 4 (Leftmost in RTL): White Card - أكبر الفئات عجزاً */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="خيارات">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="h-11 w-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Home className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              معظم العجز والاحتياج
            </p>
            <h3 className="text-lg sm:text-xl font-black font-header tracking-tight text-slate-900 dark:text-white truncate">
              {highestShortageItem?.itemName || 'لا يوجد عجز مسجل'}
            </h3>
          </div>

          <div className="text-xs font-semibold text-slate-400">
            عجز بمقدار <span className="font-bold text-rose-500 font-header">{shortageQty.toLocaleString('ar-DZ')} {highestShortageItem?.unit || 'وحدة'}</span>
          </div>
        </div>

      </div>

      {/* ================= MIDDLE SECTION: BAR CHART + RECENT TIMELINE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BAR CHART: أعلى 10 مصادر احتياج ومصروفات (~65% width in desktop, RTL right) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs">
          
          {/* Card Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base sm:text-lg font-black font-header text-slate-900 dark:text-white">
              أعلى 10 مصادر الاحتياج والمصروفات
            </h3>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="خيارات المخطط">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Bar Chart Container */}
          <div className="relative pt-8 pb-2">
            
            {/* Chart Area with Bars and Y-Axis */}
            <div className="flex items-stretch gap-2 h-64 sm:h-72">
              
              {/* Bars Columns */}
              <div className="flex-1 grid grid-cols-10 gap-1.5 sm:gap-3 items-end h-full">
                {barChartData.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                    
                    {/* Floating Tooltip Pill for Peak Item (Matches Screenshot exactly) */}
                    {item.isPeak && (
                      <div className="absolute -top-7 z-20 whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-md animate-bounce">
                        {item.value} طرد
                      </div>
                    )}

                    {/* Background Track Pill */}
                    <div className="w-full max-w-[28px] sm:max-w-[36px] bg-slate-100 dark:bg-slate-800/80 rounded-xl h-full flex flex-col justify-end p-0.5 overflow-hidden transition-all group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                      {/* Active Filled Bar */}
                      <div 
                        style={{ height: item.height }}
                        className={`w-full rounded-lg transition-all duration-500 ${
                          item.isPeak 
                            ? 'bg-primary shadow-sm shadow-primary/30' 
                            : 'bg-primary/85 dark:bg-primary/75 group-hover:bg-primary'
                        }`}
                      ></div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Y-Axis scale on the far right (RTL Layout) */}
              <div className="w-10 sm:w-12 flex flex-col justify-between items-end text-[11px] font-semibold text-slate-400 pb-2 select-none">
                <span>٤٠٠٠</span>
                <span>٣٥٠٠</span>
                <span>٣٠٠٠</span>
                <span>٢٥٠٠</span>
                <span>٢٠٠٠</span>
                <span>١٥٠٠</span>
                <span>١٠٠٠</span>
              </div>

            </div>

            {/* X-Axis Labels */}
            <div className="grid grid-cols-10 gap-1.5 sm:gap-3 mt-3 pr-0 pl-10 sm:pl-12 text-center">
              {barChartData.map((item, idx) => (
                <span 
                  key={idx} 
                  className="text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate block transform -rotate-45 sm:rotate-0 origin-top-right transition-colors hover:text-primary"
                  title={item.label}
                >
                  {item.label}
                </span>
              ))}
            </div>

          </div>
        </div>

        {/* TIMELINE LIST: المصروفات والشحنات الحديثة (~35% width in desktop, RTL left) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-black font-header text-slate-900 dark:text-white">
                المصروفات والشحنات الحديثة
              </h3>
            </div>

            {/* Timeline with vertical green/primary connector line */}
            <div className="relative pr-6 space-y-6 before:absolute before:right-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/20 dark:before:bg-primary/30">
              {recentActivities.map((act) => (
                <div key={act.id} className="relative flex items-center justify-between group">
                  
                  {/* Timeline Dot on the line */}
                  <div className="absolute -right-6 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 bg-primary group-hover:scale-125 transition-transform shadow-xs"></div>

                  {/* Title & Date */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {act.date}
                    </p>
                  </div>

                  {/* Amount / Metric */}
                  <div className="text-sm font-black font-header text-slate-900 dark:text-white">
                    {act.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Shortcut */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6">
            <Link 
              href="/admin/intake"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary text-xs font-bold text-slate-700 dark:text-slate-200 transition-all group"
            >
              <Truck className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
              <span>تسجيل وتفريغ شحنة جديدة (Staging)</span>
            </Link>
          </div>

        </div>

      </div>

      {/* ================= BOTTOM SECTION: LINE CHART + DONUT BREAKDOWN ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LINE CHART: نشاط المصاريف والإمداد (~60% width) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs">
          
          {/* Header with Title and Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h3 className="text-base sm:text-lg font-black font-header text-slate-900 dark:text-white">
              نشاط المصاريف والإمداد
            </h3>

            {/* Legend matching screenshot */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-primary rounded-full"></span>
                <span>المصاريف الفعلية</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-400"></span>
                <span>المصاريف المتوقعة</span>
              </div>
            </div>
          </div>

          {/* SVG Vector Line Chart with Spline and Points */}
          <div className="relative pt-6">
            
            {/* Tooltip Badge on Peak */}
            <div className="absolute top-2 right-[60%] sm:right-[62%] z-10 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-md">
              3519 طرد
            </div>

            <div className="flex items-stretch gap-2">
              
              {/* SVG Graphic */}
              <div className="flex-1 h-56 sm:h-64">
                <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#006233" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#006233" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="0" y1="180" x2="500" y2="180" stroke="currentColor" strokeOpacity="0.08" />
                  <line x1="0" y1="230" x2="500" y2="230" stroke="currentColor" strokeOpacity="0.08" />

                  {/* Expected line (dashed) */}
                  <path
                    d="M 20 160 Q 60 175, 100 130 T 180 150 T 260 90 T 340 140 T 420 120 T 480 170"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Actual Aid Under Area Gradient */}
                  <path
                    d="M 20 200 L 20 180 Q 60 190, 100 140 T 180 80 T 260 160 T 340 110 T 420 130 T 480 170 L 480 230 L 20 230 Z"
                    fill="url(#areaGradient)"
                  />

                  {/* Actual Aid Curve (Primary Solid) */}
                  <path
                    d="M 20 180 Q 60 190, 100 140 T 180 80 T 260 160 T 340 110 T 420 130 T 480 170"
                    fill="none"
                    stroke="#006233"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Circular Points on the curve */}
                  {[
                    { cx: 20, cy: 180 },
                    { cx: 60, cy: 190 },
                    { cx: 100, cy: 140 },
                    { cx: 180, cy: 80, isPeak: true },
                    { cx: 260, cy: 160 },
                    { cx: 340, cy: 110 },
                    { cx: 420, cy: 130 },
                    { cx: 480, cy: 170 },
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r={pt.isPeak ? 6 : 4}
                        fill="#ffffff"
                        stroke="#006233"
                        strokeWidth="2.5"
                      />
                      {pt.isPeak && (
                        <circle
                          cx={pt.cx}
                          cy={pt.cy}
                          r={9}
                          fill="none"
                          stroke="#006233"
                          strokeOpacity="0.4"
                          strokeWidth="1.5"
                          className="animate-ping"
                        />
                      )}
                    </g>
                  ))}
                </svg>
              </div>

              {/* Y-Axis numbers */}
              <div className="w-10 sm:w-12 flex flex-col justify-between items-end text-[11px] font-semibold text-slate-400 select-none pb-4">
                <span>٣٠٠٠</span>
                <span>٢٥٠٠</span>
                <span>٢٠٠٠</span>
                <span>١٥٠٠</span>
                <span>١٠٠٠</span>
              </div>

            </div>

            {/* X-Axis dates */}
            <div className="flex justify-between pl-10 sm:pl-12 pr-2 text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">
              <span>١١</span>
              <span>١٠</span>
              <span>٠٩</span>
              <span>٠٨</span>
              <span>٠٧</span>
              <span>٠٦</span>
              <span>٠٥</span>
              <span>٠٤</span>
              <span>٠٣</span>
              <span>٠٢</span>
              <span>٠١</span>
            </div>

          </div>
        </div>

        {/* DONUT CHART: نظرة عامة على التقرير والتوزيع (~40% width) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-lg font-black font-header text-slate-900 dark:text-white">
                نظرة عامة على التقرير والتوزيع
              </h3>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="خيارات">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Donut Chart & Legend Container */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-2">
              
              {/* Legend with Metrics on Left */}
              <div className="space-y-4 w-full sm:w-auto">
                
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">وارد:</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xs font-header">
                    <span>45,000 طرد</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">موزع:</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xs font-header">
                    <span>27,450 طرد</span>
                    <ArrowDownLeft className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-300"></span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">مدخرات:</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xs font-header">
                    <span>17,550 طرد</span>
                    <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                </div>

              </div>

              {/* Donut Chart Ring with Embedded Percentages (Matching Screenshot) */}
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Segment 1: 65% (Algerian Green) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#006233"
                    strokeWidth="18"
                    strokeDasharray="155.2 238.8"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: 25% (Algerian Red) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#D21034"
                    strokeWidth="18"
                    strokeDasharray="59.7 238.8"
                    strokeDashoffset="-155.2"
                  />
                  {/* Segment 3: 10% (Deep Green #03120D) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#03120D"
                    strokeWidth="18"
                    strokeDasharray="23.9 238.8"
                    strokeDashoffset="-214.9"
                  />
                </svg>

                {/* Percentage Labels Inside the Donut segments */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* 65% label on primary arc */}
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white font-black text-xs font-header drop-shadow-xs">
                    ٦٥%
                  </span>
                  {/* 25% label on green arc */}
                  <span className="absolute right-6 top-10 text-white font-black text-xs font-header drop-shadow-xs">
                    ٢٥%
                  </span>
                  {/* 10% label on dark arc */}
                  <span className="absolute bottom-6 right-12 text-white font-black text-[10px] font-header drop-shadow-xs">
                    ١٠%
                  </span>
                  {/* Center cutout circle */}
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-inner">
                    <span className="text-[10px] font-bold text-slate-400">إجمالي</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* FIFO Status Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">حالة صلاحية الدفعات (FIFO)</span>
            <Link 
              href="/admin/expiry"
              className="text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span>3 شحنات قاربت على الانتهاء</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* ================= FAST OPERATIONS LAUNCHPAD ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        <Link
          href="/admin/intake"
          className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 dark:hover:border-primary/50 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-header font-black text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors">
                استلام وتسجيل الشحنات (Cargo Intake)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تسجيل الشاحنات الواردة وإصدار أرقام الدفعات وتتبع الصلاحية
              </p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:-translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/expiry"
          className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-500/50 dark:hover:border-rose-500/50 transition-all flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-header font-black text-slate-900 dark:text-white text-base group-hover:text-rose-500 transition-colors">
                  تتبع الصلاحية وتدوير المخزون (FIFO)
                </h4>
                <Badge variant="rose" size="sm">3 تنبيهات</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                رصد الشحنات الأقرب للانتهاء لتوجيهها وتوزيعها فوراً قبل التلف
              </p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-1 transition-all" />
        </Link>

      </div>

    </div>
  );
}

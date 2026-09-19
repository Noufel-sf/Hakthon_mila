'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useReliefStore } from '@/lib/store';
import { 
  Warehouse, 
  Search, 
  Info,
  MapPin,
  Phone,
  Navigation,
  ExternalLink,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Layers,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';

export default function DepotsDirectoryPage() {
  const depots = useReliefStore((state) => state.depots);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const wilayas = Array.from(new Set(depots.map(d => d.wilaya)));

  const filteredDepots = depots.filter(depot => {
    const matchesWilaya = selectedWilaya === 'all' || depot.wilaya === selectedWilaya;
    const matchesSearch = 
      depot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesWilaya && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-10">
      
      {/* Centered Page Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-header font-bold">
          <Warehouse className="w-3.5 h-3.5" />
          <span>دليل مستودعات ونقاط التفريغ المعتمدة</span>
        </div>
        
        <h1 className="font-header text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          مستودعات الإغاثة الميدانية
        </h1>
        
        <p className="font-sub text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          بيان شامل ومباشر لجميع المستودعات الميدانية، نسب إشغالها الحالية، النواقص الحرجة، ونقاط التفريغ المباشرة على Google Maps.
        </p>
      </div>

      {/* Centered Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Wilaya Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedWilaya('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-header font-bold transition-all cursor-pointer ${
              selectedWilaya === 'all'
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            جميع الولايات ({depots.length})
          </button>
          {wilayas.map(w => {
            const count = depots.filter(d => d.wilaya === w).length;
            const isSelected = selectedWilaya === w;

            return (
              <button
                key={w}
                onClick={() => setSelectedWilaya(w)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-header font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white font-bold shadow-sm shadow-primary/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                ولاية {w} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xl mx-auto w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن مستودع، بلدية، أو مادة ناقصة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full pr-11 pl-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Depots List: Only One Depot per Row (Full Width in Centered Container) */}
      <div className="space-y-6">
        {filteredDepots.length > 0 ? (
          filteredDepots.map((depot) => {
            const criticalItems = depot.items.filter(
              item => item.targetNeed - item.currentStock > 0
            );
            const sufficientItems = depot.items.filter(
              item => item.currentStock >= item.targetNeed
            );

            return (
              <div
                key={depot.id}
                className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-6"
              >
                {/* Depot Card Header: Code, Wilaya, Name & Capacity Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {depot.code}
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-xs font-header font-bold bg-primary/10 text-primary border border-primary/20">
                        ولاية {depot.wilaya}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        بلدية {depot.municipality}
                      </span>
                    </div>

                    <h2 className="font-header text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {depot.name}
                    </h2>
                  </div>

                  {/* Occupancy Indicator Badge */}
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">حالة الإشغال</span>
                      <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
                        {depot.totalCapacityPercent}% ممتلئ
                      </span>
                    </div>
                    <div className="w-16 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          depot.totalCapacityPercent > 80 
                            ? 'bg-rose-500' 
                            : depot.totalCapacityPercent > 50 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${depot.totalCapacityPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Logistics Info: Location & Manager Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-header font-bold text-slate-900 dark:text-white block">العنوان الميداني:</span>
                      <span>{depot.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-header font-bold text-slate-900 dark:text-white block">المسؤول الميداني:</span>
                      <span>{depot.manager} • <span dir="ltr" className="font-mono text-slate-700 dark:text-slate-200 font-bold">{depot.phone}</span></span>
                    </div>
                  </div>
                </div>

                {/* Critical Deficits Banner for this Depot */}
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-header font-bold text-primary flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      أكبر النواقص العاجلة بهذا المستودع (توجيه مباشر للتبرعات):
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {criticalItems.length} مواد بها عجز
                    </span>
                  </div>

                  {criticalItems.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {criticalItems.map(item => {
                        const deficit = item.targetNeed - item.currentStock;
                        return (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1.5 text-xs font-header font-bold px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs"
                          >
                            <span>{item.name}:</span>
                            <span className="underline font-mono">نقص {deficit} {item.unit}</span>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      جميع المواد والاحتياجات الأساسية مكتفية حالياً في هذا المستودع.
                    </p>
                  )}

                  {/* Covered items notice */}
                  {sufficientItems.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-header font-bold">✅ متوفر بوفرة (لا داعي لإرسالها هنا):</span>
                      <span className="truncate">{sufficientItems.map(i => i.name).slice(0, 3).join('، ')}</span>
                    </div>
                  )}
                </div>

                {/* Smart Warehouse Zones Mini Visualizer */}
                {depot.zones && depot.zones.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-header font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        أرصفة ومناطق التخزين الذكي (Smart Staging Zones):
                      </span>
                      <span>سعة الأرصفة الميدانية</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {depot.zones.map(z => {
                        const pct = Math.round((z.currentUnits / z.maxCapacity) * 100);
                        return (
                          <div 
                            key={z.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-header font-bold text-slate-800 dark:text-slate-200 text-[11px]">{z.id}</span>
                              <span className="font-mono text-[10px] text-slate-400">{pct}%</span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mb-1">
                              {z.title.split('-')[0]}
                            </span>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${Math.min(100, pct)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    آخر تحديث ميداني: {depot.lastUpdated}
                  </span>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {depot.googleMapsUrl && (
                      <a
                        href={depot.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button variant="primary" size="sm" className="w-full text-xs font-header font-bold shadow-sm shadow-primary/20">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>الاتجاه للمستودع (Google Maps)</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    )}

                    <Link href={`/depots/${depot.id}`} className="w-full sm:w-auto">
                      <Button variant="secondary" size="sm" className="w-full text-xs font-header font-bold">
                        <span>عرض الجرد الكامل</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-3">
            <Info className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-header text-lg font-bold text-slate-800 dark:text-white">
              لا توجد مستودعات مطابقة للبحث
            </h3>
            <p className="font-sub text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              جرب مسح شريط البحث أو اختيار ولاية أخرى للاطلاع على المستودعات المتاحة.
            </p>
            <button
              onClick={() => {
                setSelectedWilaya('all');
                setSearchQuery('');
              }}
              className="mt-2 px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-header font-bold transition-all"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>

    </div>
  );
}


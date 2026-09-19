'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useReliefStore } from '@/lib/store';
import { AidCategory } from '@/lib/types';
import { AID_CATEGORIES } from '@/lib/constants';
import { 
  ClipboardList, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  Warehouse,
  ExternalLink,
  Navigation,
  ChevronLeft,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';

export default function NeedsPage() {
  const depots = useReliefStore((state) => state.depots);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collect and aggregate items across all depots
  interface AggregatedItem {
    name: string;
    nameFr?: string;
    category: AidCategory;
    totalStock: number;
    totalNeed: number;
    totalDeficit: number;
    unit: string;
    depotsNeeding: { depotId: string; depotName: string; wilaya: string; deficit: number; mapsUrl: string }[];
    depotsSurplus: { depotId: string; depotName: string; wilaya: string; surplus: number }[];
  }

  const itemsMap = new Map<string, AggregatedItem>();

  depots.forEach((depot) => {
    depot.items.forEach((item) => {
      const key = item.name.trim().toLowerCase();
      const deficit = Math.max(0, item.targetNeed - item.currentStock);
      const surplus = Math.max(0, item.currentStock - item.targetNeed);

      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          name: item.name,
          nameFr: item.nameFr || item.name,
          category: item.category,
          totalStock: item.currentStock,
          totalNeed: item.targetNeed,
          totalDeficit: deficit,
          unit: item.unit,
          depotsNeeding: deficit > 0 ? [{ depotId: depot.id, depotName: depot.name, wilaya: depot.wilaya, deficit, mapsUrl: depot.googleMapsUrl }] : [],
          depotsSurplus: surplus > 0 ? [{ depotId: depot.id, depotName: depot.name, wilaya: depot.wilaya, surplus }] : [],
        });
      } else {
        const existing = itemsMap.get(key)!;
        existing.totalStock += item.currentStock;
        existing.totalNeed += item.targetNeed;
        existing.totalDeficit += deficit;
        if (deficit > 0) {
          existing.depotsNeeding.push({ depotId: depot.id, depotName: depot.name, wilaya: depot.wilaya, deficit, mapsUrl: depot.googleMapsUrl });
        }
        if (surplus > 0) {
          existing.depotsSurplus.push({ depotId: depot.id, depotName: depot.name, wilaya: depot.wilaya, surplus });
        }
      }
    });
  });

  const allItems = Array.from(itemsMap.values());

  // Filter items
  const filteredItems = allItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameFr?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort by highest deficit first
  const sortedItems = [...filteredItems].sort((a, b) => b.totalDeficit - a.totalDeficit);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-10">
      
      {/* Centered Page Header */}
      <div className="flex flex-col items-center mt-5 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-header font-bold">
          <ClipboardList className="w-3.5 h-3.5" />
          <span>المرصد الميداني لاحتياجات ونواقص الإغاثة</span>
        </div>
        
        <h1 className="font-header text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          جدول الاحتياجات الميدانية <span className="text-primary">والأولويات العاجلة</span>
        </h1>
        
        <p className="font-sub text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          بيان شفاف يوضح السلع الأكثر طلباً في كل ولاية ومستودع (أرائك، أفرشة، ثلاجات، مواد تموين)، لتوجيه التبرع بذكاء ومنع تكدس المواد الفائضة.
        </p>
      </div>

      {/* Centered Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-header font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            جميع الأصناف ({allItems.length})
          </button>
          {AID_CATEGORIES.map((cat) => {
            const count = allItems.filter(i => i.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-header font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white font-bold shadow-sm shadow-primary/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.nameAr.split(' ')[0]} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xl mx-auto w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن مادة أو صنف محدد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full pr-11 pl-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Main Needs Cards List: Only One Need Card per Row */}
      <div className="space-y-5">
        {sortedItems.length > 0 ? (
          sortedItems.map((item) => {
            const fulfillmentPct = Math.min(100, Math.round((item.totalStock / (item.totalNeed || 1)) * 100));
            const hasCriticalDeficit = item.totalDeficit > 0;
            const isSurplus = item.totalStock >= item.totalNeed * 1.3;

            return (
              <div
                key={item.name}
                className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-5"
              >
                {/* Need Card Header: Name, Category & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-xs font-header font-bold bg-primary/10 text-primary border border-primary/20">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.nameFr}
                      </span>
                    </div>

                    <h2 className="font-header text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {item.name}
                    </h2>
                  </div>

                  {/* Status Badges */}
                  <div className="self-start sm:self-auto">
                    {hasCriticalDeficit ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-header font-bold bg-primary/10 text-primary border border-primary/20">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        <span>عجز إجمالي: {item.totalDeficit} {item.unit}</span>
                      </span>
                    ) : isSurplus ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-header font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        <span>فائض مستقر (لا حاجة للتبرع) ✅</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-header font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        <span>اكتفاء نسبي مغطى ✅</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock vs Target Need Progress Bar */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      المتوفر حالياً: <strong className="font-mono text-slate-900 dark:text-white font-bold">{item.totalStock} {item.unit}</strong>
                    </span>
                    <span className="text-slate-400">
                      الاحتياج المقدر: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{item.totalNeed} {item.unit}</span>
                    </span>
                    <span className="font-mono font-bold text-primary text-xs">
                      {fulfillmentPct}% تغطية
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${hasCriticalDeficit ? 'bg-primary' : 'bg-emerald-500'}`}
                      style={{ width: `${fulfillmentPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Depots Needing This Item (Directly Actionable) */}
                {item.depotsNeeding.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <span className="text-xs font-header font-bold text-primary flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      المستودعات التي تعاني من نقص مباشر (وجّه شاحنتك إليها):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {item.depotsNeeding.map((depot) => (
                        <div
                          key={depot.depotId}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <Link 
                              href={`/depots/${depot.depotId}`} 
                              className="font-header font-bold text-slate-900 dark:text-white hover:text-primary transition-colors block text-sm"
                            >
                              {depot.depotName}
                            </Link>
                            <span className="text-slate-400 font-mono text-[11px]">ولاية {depot.wilaya}</span>
                          </div>

                          <div className="text-left shrink-0 space-y-1">
                            <span className="font-header font-bold text-primary font-mono block">
                              نقص {depot.deficit} {item.unit}
                            </span>
                            {depot.mapsUrl && (
                              <a
                                href={depot.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-header font-bold text-white bg-primary px-2.5 py-0.5 rounded-md transition-colors"
                              >
                                <span>Google Maps</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Surplus Depots Notice */}
                {item.depotsSurplus.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-header font-bold">✅ مستودعات بها وفرة (لا داعي للإرسال إليها):</span>
                    <span className="truncate">{item.depotsSurplus.map(d => `${d.depotName} (فائض ${d.surplus})`).join('، ')}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-3">
            <Info className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-header text-lg font-bold text-slate-800 dark:text-white">
              لا توجد نتائج مطابقة للبحث
            </h3>
            <p className="font-sub text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              جرب مسح شريط البحث أو اختيار صنف آخر للاطلاع على قائمة الاحتياجات.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
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


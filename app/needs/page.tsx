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
  ArrowRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';

export default function NeedsPage() {
  const depots = useReliefStore((state) => state.depots);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collect and aggregate items across all depots
  interface AggregatedItem {
    name: string;
    nameFr: string;
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
          nameFr: item.nameFr,
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
      item.nameFr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort by highest deficit first
  const sortedItems = [...filteredItems].sort((a, b) => b.totalDeficit - a.totalDeficit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
          <ClipboardList className="w-4 h-4" />
          <span>المرصد الوطني لاحتياجات ونواقص الإغاثة</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          جدول الاحتياجات الميدانية <span className="text-amber-400">والأولويات العاجلة</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          جدول شامل يوضح ما تحتاجه كل المناطق المتضررة من أرائك، أفرشة، أجهزة كهرومنزلية، ومواد تموين. 
          تعرف مباشرة على السلع الأكثر عجزاً وأين يحتاجونها لتوجيه تبرعك بوعي ومسؤولية.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            جميع الأصناف
          </button>
          {AID_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.nameAr.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث عن مادة محددة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Main Needs Cards / Table */}
      <div className="space-y-4">
        {sortedItems.map((item) => {
          const fulfillmentPct = Math.min(100, Math.round((item.totalStock / (item.totalNeed || 1)) * 100));
          const hasCriticalDeficit = item.totalDeficit > 0;
          const isSurplus = item.totalStock >= item.totalNeed * 1.3;

          return (
            <div
              key={item.name}
              className={`rounded-2xl border p-5 transition-all bg-slate-900/70 backdrop-blur-sm space-y-4 ${
                hasCriticalDeficit
                  ? 'border-rose-900/50 hover:border-rose-700'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{item.name}</h3>
                    <span className="text-xs text-slate-400">({item.nameFr})</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    الصنف: <strong className="text-slate-300">{item.category}</strong>
                  </span>
                </div>

                {/* Status Badges */}
                <div>
                  {hasCriticalDeficit ? (
                    <Badge variant="rose" size="lg" className="animate-pulse">
                      عجز إجمالي: {item.totalDeficit} {item.unit} 🔴
                    </Badge>
                  ) : isSurplus ? (
                    <Badge variant="blue" size="lg">
                      فائض مستقر (لا حاجة للتبرع حالياً) ✅
                    </Badge>
                  ) : (
                    <Badge variant="emerald" size="lg">
                      اكتفاء نسبي مغطى ✅
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress and Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">إجمالي المتوفر حالياً:</span>
                  <span className="font-mono font-bold text-base text-white">
                    {item.totalStock} {item.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">إجمالي الاحتياج المقدر:</span>
                  <span className="font-mono font-bold text-base text-slate-300">
                    {item.totalNeed} {item.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">نسبة التغطية:</span>
                  <span className="font-mono font-bold text-base text-amber-400">
                    {fulfillmentPct}%
                  </span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-slate-400 block mb-1">مؤشر الاستجابة:</span>
                  <Progress
                    value={fulfillmentPct}
                    className="h-2 bg-slate-800"
                    indicatorClassName={hasCriticalDeficit ? 'bg-rose-500' : 'bg-emerald-500'}
                  />
                </div>
              </div>

              {/* Depots Needing This Item */}
              {item.depotsNeeding.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-rose-300 block flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    المستودعات التي تعاني من نقص مباشر في هذا الصنف:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {item.depotsNeeding.map((depot) => (
                      <div
                        key={depot.depotId}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{depot.depotName}</span>
                          <span className="text-slate-400 font-mono text-[11px]">ولاية {depot.wilaya}</span>
                        </div>
                        <div className="text-left shrink-0">
                          <span className="font-bold text-rose-400 font-mono block">
                            نقص {depot.deficit} {item.unit}
                          </span>
                          {depot.mapsUrl && (
                            <a
                              href={depot.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-0.5 justify-end"
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

              {/* Surplus depots notice */}
              {item.depotsSurplus.length > 0 && (
                <div className="text-xs text-slate-400 pt-1 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✅ مستودعات بها وفرة:</span>
                  <span>{item.depotsSurplus.map(d => `${d.depotName} (فائض ${d.surplus})`).join('، ')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

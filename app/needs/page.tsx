'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AidCategory, NeedResponse, DepotSummaryResponse, Priority } from '@/lib/types';
import { api } from '@/lib/api';
import { AID_CATEGORIES, getItemNameAr, getUnitNameAr, PRIORITY_LABELS } from '@/lib/constants';
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
  Info,
  RefreshCw,
  Sparkles,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';

interface DepotNeedDetail {
  needId: number | string;
  depotId: string;
  depotName: string;
  wilaya: string;
  deficit: number;
  requestedQuantity: number;
  availableQuantity: number;
  priority: Priority;
  status: string;
  notes?: string;
  mapsUrl: string;
}

interface AggregatedItem {
  name: string;
  nameFr?: string;
  category: AidCategory;
  totalStock: number;
  totalNeed: number;
  totalDeficit: number;
  unit: string;
  depotsNeeding: DepotNeedDetail[];
  depotsSurplus: { depotId: string; depotName: string; wilaya: string; surplus: number }[];
}

export default function NeedsPage() {
  const [needs, setNeeds] = useState<NeedResponse[]>([]);
  const [depots, setDepots] = useState<DepotSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchNeedsData = async () => {
    try {
      setIsRefreshing(true);
      const [needsList, depotList] = await Promise.all([
        api.needs.list().catch(() => []),
        api.depots.list().catch(() => []),
      ]);
      setNeeds(needsList || []);
      setDepots(depotList || []);
    } catch (err) {
      console.warn('[Needs Page] Error loading needs:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNeedsData();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const itemsMap = new Map<string, AggregatedItem>();

  needs.forEach((need) => {
    const key = need.itemName.trim().toLowerCase();
    const deficit = need.shortage > 0 
      ? need.shortage 
      : Math.max(0, need.requestedQuantity - need.currentAvailableQuantity);
    const surplus = Math.max(0, need.currentAvailableQuantity - need.requestedQuantity);

    const depotInfo = depots.find(d => String(d.id) === String(need.depotId));
    const wilaya = depotInfo?.location?.wilaya || '';
    const mapsUrl = depotInfo?.location?.googleMapsUrl || '';

    const arName = getItemNameAr(need.itemName);
    const arUnit = getUnitNameAr(need.unit);

    const needDetail: DepotNeedDetail = {
      needId: need.id,
      depotId: String(need.depotId),
      depotName: need.depotName || depotInfo?.name || `مستودع #${need.depotId}`,
      wilaya,
      deficit,
      requestedQuantity: need.requestedQuantity,
      availableQuantity: need.currentAvailableQuantity,
      priority: need.priority,
      status: need.status || 'OPEN',
      notes: need.notes,
      mapsUrl,
    };

    if (!itemsMap.has(key)) {
      itemsMap.set(key, {
        name: arName,
        nameFr: need.itemName,
        category: need.category,
        totalStock: need.currentAvailableQuantity,
        totalNeed: need.requestedQuantity,
        totalDeficit: deficit,
        unit: arUnit,
        depotsNeeding: deficit > 0 ? [needDetail] : [],
        depotsSurplus: surplus > 0 ? [{ 
          depotId: String(need.depotId), 
          depotName: need.depotName || depotInfo?.name || `مستودع #${need.depotId}`, 
          wilaya, 
          surplus 
        }] : [],
      });
    } else {
      const existing = itemsMap.get(key)!;
      existing.totalStock += need.currentAvailableQuantity;
      existing.totalNeed += need.requestedQuantity;
      existing.totalDeficit += deficit;
      if (deficit > 0) {
        const existD = existing.depotsNeeding.find(d => d.depotId === String(need.depotId));
        if (existD) {
          existD.deficit += deficit;
          if (need.notes && !existD.notes) existD.notes = need.notes;
        } else {
          existing.depotsNeeding.push(needDetail);
        }
      }
      if (surplus > 0) {
        const existS = existing.depotsSurplus.find(d => d.depotId === String(need.depotId));
        if (existS) {
          existS.surplus += surplus;
        } else {
          existing.depotsSurplus.push({ 
            depotId: String(need.depotId), 
            depotName: need.depotName || depotInfo?.name || `مستودع #${need.depotId}`, 
            wilaya, 
            surplus 
          });
        }
      }
    }
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-10">
      
      {/* Centered Page Header */}
      <div className="flex flex-col items-center mt-5 text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-header font-bold">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>المرصد الميداني لاحتياجات ونواقص الإغاثة</span>
          </div>
        </div>
        
        <h1 className="font-header text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          احتياجات ونواقص المستودعات
        </h1>
        
        <p className="font-sub text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          جدول تفصيلي ومباشر يوضح حجم العجز الفعلي في كل مادة عبر جميع المستودعات، مع الملاحظات الميدانية لتوجيه القوافل بدقة.
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

      {/* Main Needs Cards List */}
      <div className="space-y-5">
        {isLoading && sortedItems.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-[2rem] bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : sortedItems.length > 0 ? (
          sortedItems.map((item, itemIdx) => {
            const fulfillmentPct = Math.min(100, Math.round((item.totalStock / (item.totalNeed || 1)) * 100));
            const hasCriticalDeficit = item.totalDeficit > 0;
            const isSurplus = item.totalStock >= item.totalNeed * 1.3;

            return (
              <div
                key={`${item.name}-${itemIdx}`}
                className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-5"
              >
                {/* Need Card Header: Name, Category & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-xs font-header font-bold bg-primary/10 text-primary border border-primary/20">
                        {item.category}
                      </span>
                      {item.nameFr && (
                        <span className="text-xs text-slate-400 font-mono">
                          {item.nameFr}
                        </span>
                      )}
                    </div>

                    <h2 className="font-header text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {item.name}
                    </h2>
                  </div>

                  {/* Status Badges */}
                  <div className="self-start sm:self-auto">
                    {hasCriticalDeficit ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-header font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                        <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse"></span>
                        <span>عجز إجمالي: {item.totalDeficit.toLocaleString('ar-DZ')} {item.unit}</span>
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
                      المتوفر حالياً: <strong className="font-mono text-slate-900 dark:text-white font-bold">{item.totalStock.toLocaleString('ar-DZ')} {item.unit}</strong>
                    </span>
                    <span className="text-slate-400">
                      الاحتياج المقدر: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{item.totalNeed.toLocaleString('ar-DZ')} {item.unit}</span>
                    </span>
                    <span className="font-mono font-bold text-primary text-xs">
                      {fulfillmentPct}% تغطية
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${hasCriticalDeficit ? 'bg-rose-600' : 'bg-primary'}`}
                      style={{ width: `${fulfillmentPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Depots Needing This Item (Detailed Real Data) */}
                {item.depotsNeeding.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <span className="text-xs font-header font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      المستودعات التي تعاني من نقص مباشر (وجّه شاحنتك إليها):
                    </span>

                    <div className="grid grid-cols-1 gap-3">
                      {item.depotsNeeding.map((depot, dIdx) => {
                        const priorityMeta = PRIORITY_LABELS[depot.priority] || { label: depot.priority, color: 'slate' };

                        return (
                          <div
                            key={`${depot.depotId}-${dIdx}`}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Link 
                                  href={`/depots/${depot.depotId}`} 
                                  className="font-header font-bold text-slate-900 dark:text-white hover:text-primary transition-colors text-sm"
                                >
                                  {depot.depotName}
                                </Link>
                                {depot.wilaya && (
                                  <span className="text-slate-500 font-mono text-xs">
                                    • ولاية {depot.wilaya}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  depot.priority === 'CRITICAL' 
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' 
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                }`}>
                                  {priorityMeta.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="font-header font-bold text-rose-600 dark:text-rose-400 font-mono text-xs">
                                  نقص {depot.deficit.toLocaleString('ar-DZ')} {item.unit}
                                </span>

                                {depot.mapsUrl && (
                                  <a
                                    href={depot.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-header font-bold text-white bg-primary hover:bg-primary/90 px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    <span>Google Maps</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}

                                <Link href={`/depots/${depot.depotId}`}>
                                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary bg-slate-200/80 dark:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors">
                                    تفاصيل المستودع
                                    <ChevronLeft className="w-3 h-3" />
                                  </span>
                                </Link>
                              </div>
                            </div>

                            {/* Real Field Note from the Ground */}
                            {depot.notes && (
                              <div className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20 text-[11px] leading-relaxed">
                                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span><strong>ملاحظة ميدانية:</strong> {depot.notes}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Surplus Depots Notice */}
                {item.depotsSurplus.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-header font-bold">✅ مستودعات بها وفرة (لا داعي للإرسال إليها):</span>
                    <span className="truncate">{item.depotsSurplus.map(d => `${d.depotName} (فائض ${d.surplus.toLocaleString('ar-DZ')})`).join('، ')}</span>
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

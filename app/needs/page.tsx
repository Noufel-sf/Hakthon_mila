
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AidCategory, NeedResponse, DepotSummaryResponse, Priority } from '@/lib/types';
import { api } from '@/lib/api';
import { AID_CATEGORIES, getItemNameAr, getUnitNameAr, PRIORITY_LABELS } from '@/lib/constants';
import { 
  ClipboardList, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  ChevronLeft, 
  Info, 
  FileText 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNeedsQuery, useDepotsQuery } from '@/hooks/queries';
import LiveTelemetryBadge from '@/components/LiveTelemetryBadge';
import SmartEmptyState from '@/components/SmartEmptyState';

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
  const router = useRouter();
  const { 
    data: needs = [], 
    isLoading: isLoadingNeeds, 
    refetch: refetchNeeds, 
    isFetching: isFetchingNeeds 
  } = useNeedsQuery();
  const { 
    data: depots = [], 
    isLoading: isLoadingDepots, 
    refetch: refetchDepots, 
    isFetching: isFetchingDepots 
  } = useDepotsQuery();
  const isLoading = isLoadingNeeds || isLoadingDepots;
  const isRefreshing = isFetchingNeeds || isFetchingDepots;

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
        existing.depotsNeeding.push(needDetail);
      }
      if (surplus > 0) {
        const alreadyInSurplus = existing.depotsSurplus.some(d => d.depotId === String(need.depotId));
        if (!alreadyInSurplus) {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-8">
      
      {/* Centered Page Header */}
      <div className="flex flex-col items-center mt-4 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0E4B35]/10 text-[#0E4B35] dark:text-emerald-400 border border-[#0E4B35]/20 text-xs font-header font-bold rounded-none">
          <ClipboardList className="w-3.5 h-3.5" />
          <span>المرصد الميداني لاحتياجات ونواقص الإغاثة</span>
        </div>
        
        <h1 className="font-header text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
          احتياجات ونواقص المستودعات
        </h1>
        
        <p className="font-sub text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          جدول تفصيلي ومباشر يوضح حجم العجز الفعلي في كل مادة عبر جميع المستودعات، مع الملاحظات الميدانية لتوجيه القوافل بدقة.
        </p>

        {/* Live Telemetry Heartbeat */}
        <div className="pt-1">
          <LiveTelemetryBadge
            onRefresh={() => {
              refetchNeeds();
              refetchDepots();
            }}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>

      {/* Centered Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-xs space-y-4">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs sm:text-sm font-header font-bold transition-all cursor-pointer rounded-none border ${
              selectedCategory === 'all'
                ? 'bg-[#0E4B35] text-white border-[#0E4B35]'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
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
                className={`px-4 py-2 text-xs sm:text-sm font-header font-semibold flex items-center gap-1.5 transition-all cursor-pointer rounded-none border ${
                  isSelected
                    ? 'bg-[#0E4B35] text-white font-bold border-[#0E4B35]'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
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
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-none pr-11 pl-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0E4B35] transition-colors"
          />
        </div>
      </div>

      {/* Main Needs Cards List: Sharp Box Layout */}
      <div className="space-y-4">
        {isLoading && sortedItems.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-none animate-pulse" />
            ))}
          </div>
        ) : sortedItems.length > 0 ? (
          sortedItems.map((item, itemIdx) => {
            const fulfillmentPct = Math.min(100, Math.round((item.totalStock / (item.totalNeed || 1)) * 100));
            const hasCriticalDeficit = item.totalDeficit > 0;
            const isSurplus = item.totalStock >= item.totalNeed * 1.3;
            const targetDepotId = item.depotsNeeding[0]?.depotId || item.depotsSurplus[0]?.depotId;

            return (
              <div
                key={`${item.name}-${itemIdx}`}
                onClick={() => {
                  if (targetDepotId) {
                    router.push(`/depots/${targetDepotId}`);
                  }
                }}
                className={`rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-[#0E4B35] hover:shadow-md transition-all space-y-4 group ${
                  targetDepotId ? 'cursor-pointer' : ''
                }`}
              >
                {/* Need Card Header: Name, Category & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-none text-xs font-header font-bold bg-[#0E4B35]/10 text-[#0E4B35] dark:text-emerald-400 border border-[#0E4B35]/20">
                        {item.category}
                      </span>
                      {item.nameFr && (
                        <span className="text-xs text-slate-400 font-mono">
                          {item.nameFr}
                        </span>
                      )}
                    </div>

                    <h2 className="font-header text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#0E4B35] transition-colors tracking-tight">
                      {item.name}
                    </h2>
                  </div>

                  {/* Status Badges */}
                  <div className="self-start sm:self-auto">
                    {hasCriticalDeficit ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-header font-bold bg-rose-50 dark:bg-rose-950/40 text-[#C52233] dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-radar-crisis">
                        <span className="h-2 w-2 rounded-none bg-[#C52233] animate-pulse"></span>
                        <span>عجز إجمالي: {item.totalDeficit.toLocaleString('ar-DZ')} {item.unit}</span>
                      </span>
                    ) : isSurplus ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-header font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        <span>فائض مستقر (لا حاجة للتبرع) ✅</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-header font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#0E4B35] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        <span>اكتفاء نسبي مغطى ✅</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock vs Target Need Progress Bar */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-none border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-600 dark:text-slate-300">
                      المتوفر حالياً: <strong className="font-mono text-slate-900 dark:text-white font-bold">{item.totalStock.toLocaleString('ar-DZ')} {item.unit}</strong>
                    </span>
                    <span className="text-slate-400">
                      الاحتياج المقدر: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{item.totalNeed.toLocaleString('ar-DZ')} {item.unit}</span>
                    </span>
                    <span className="font-mono font-bold text-[#0E4B35] dark:text-emerald-400 text-xs">
                      {fulfillmentPct}% تغطية
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-none overflow-hidden">
                    <div
                      className={`h-full rounded-none transition-all duration-500 ${hasCriticalDeficit ? 'bg-[#C52233]' : 'bg-[#0E4B35]'}`}
                      style={{ width: `${fulfillmentPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Depots Needing This Item */}
                {item.depotsNeeding.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <span className="text-xs font-header font-bold text-[#C52233] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      المستودعات التي تعاني من نقص مباشر (وجّه شاحنتك إليها):
                    </span>

                    <div className="grid grid-cols-1 gap-2.5">
                      {item.depotsNeeding.map((depot, dIdx) => {
                        const priorityMeta = PRIORITY_LABELS[depot.priority] || { label: depot.priority, color: 'slate' };

                        return (
                          <div
                            key={`${depot.depotId}-${dIdx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/depots/${depot.depotId}`);
                            }}
                            className="p-3.5 rounded-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-[#0E4B35] hover:shadow-xs transition-all space-y-2 text-xs cursor-pointer group/sub"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-header font-bold text-slate-900 dark:text-white group-hover/sub:text-[#0E4B35] transition-colors text-sm">
                                  {depot.depotName}
                                </span>
                                {depot.wilaya && (
                                  <span className="text-slate-500 font-mono text-xs">
                                    • ولاية {depot.wilaya}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${
                                  depot.priority === 'CRITICAL' 
                                    ? 'bg-rose-100 dark:bg-rose-950 text-[#C52233] dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-radar-crisis' 
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                }`}>
                                  {priorityMeta.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="font-header font-bold text-[#C52233] font-mono text-xs px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 animate-radar-crisis">
                                  نقص {depot.deficit.toLocaleString('ar-DZ')} {item.unit}
                                </span>

                                {depot.mapsUrl && (
                                  <a
                                    href={depot.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] font-header font-bold text-white bg-[#0E4B35] hover:bg-[#093525] px-2.5 py-1 rounded-none transition-colors"
                                  >
                                    <span>Google Maps</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}

                                <div className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover/sub:text-[#0E4B35] bg-slate-200/80 dark:bg-slate-800 px-2.5 py-1 rounded-none transition-colors pointer-events-none">
                                  <span>تفاصيل المستودع</span>
                                  <ChevronLeft className="w-3 h-3 group-hover/sub:-translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </div>

                            {/* Real Field Note from the Ground */}
                            {depot.notes && (
                              <div className="flex items-start gap-1.5 p-2 rounded-none bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border border-amber-300/40 text-[11px] leading-relaxed">
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
                    <span className="text-[#0E4B35] dark:text-emerald-400 font-header font-bold">✅ مستودعات بها وفرة:</span>
                    <span className="truncate">{item.depotsSurplus.map(d => `${d.depotName} (فائض ${d.surplus.toLocaleString('ar-DZ')})`).join('، ')}</span>
                  </div>
                )}

                {/* Footer Action Indicator */}
                {targetDepotId && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      انقر في أي مكان في البطاقة للانتقال إلى تفاصيل وجرد المستودع
                    </span>
                    <div className="inline-flex items-center gap-1 font-header font-bold text-[#0E4B35] dark:text-emerald-400 group-hover:translate-x-[-3px] transition-transform">
                      <span>عرض تفاصيل المستودع والجرد</span>
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <SmartEmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory !== 'all' ? selectedCategory : undefined}
            onReset={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSearchQuery('');
            }}
          />
        )}
      </div>

    </div>
  );
}

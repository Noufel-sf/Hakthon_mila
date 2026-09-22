'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mapSummaryToDepot } from '@/lib/store';
import { useDepotsQuery, useNeedsQuery } from '@/hooks/queries';
import { 
  Warehouse, 
  Search, 
  Info, 
  MapPin, 
  Phone, 
  Navigation, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronLeft,
  Map as MapIcon,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import LiveTelemetryBadge from '@/components/LiveTelemetryBadge';
import SmartEmptyState from '@/components/SmartEmptyState';

export default function DepotsDirectoryPage() {
  const router = useRouter();
  const { data: depotList = [], isLoading: isLoadingDepots, refetch: refetchDepots, isFetching: isFetchingDepots } = useDepotsQuery();
  const { data: needsList = [], isLoading: isLoadingNeeds, refetch: refetchNeeds, isFetching: isFetchingNeeds } = useNeedsQuery();

  const isRefreshing = isFetchingDepots || isFetchingNeeds;

  const depots = useMemo(() => {
    return depotList.map((d) => mapSummaryToDepot(d, needsList, []));
  }, [depotList, needsList]);

  const isLoading = isLoadingDepots || isLoadingNeeds;

  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const wilayas = Array.from(new Set(depots.map(d => d.wilaya).filter(Boolean)));

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
      
      {/* Centered Page Header */}
      <div className="flex flex-col items-center mt-4 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0E4B35]/10 text-[#0E4B35] dark:text-emerald-400 border border-[#0E4B35]/20 text-xs font-header font-bold rounded-none">
          <Warehouse className="w-3.5 h-3.5" />
          <span>دليل مراكز الاستقبال ونقاط التفريغ المعتمدة</span>
        </div>
        
        <h1 className="font-header text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
          مستودعات الإغاثة الميدانية
        </h1>
        
        <p className="font-sub text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          بيان شامل ومباشر لجميع المستودعات الميدانية، نسب إشغالها الحالية، النواقص الحرجة، ونقاط التفريغ المباشرة على Google Maps.
        </p>

        {/* Live Telemetry Badge */}
        <div className="pt-1">
          <LiveTelemetryBadge
            onRefresh={() => {
              refetchDepots();
              refetchNeeds();
            }}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* View Switcher: Cards vs Field Map */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="px-4 py-1.5 text-xs font-header font-bold bg-[#0E4B35] text-white flex items-center gap-1.5 shadow-xs">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>شبكة البطاقات</span>
            </span>
            <Link
              href="/map"
              className="px-4 py-1.5 text-xs font-header font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>الخريطة الميدانية (GIS)</span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Centered Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 shadow-xs space-y-4">
        {/* Wilaya Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedWilaya('all')}
            className={`px-4 py-2 text-xs sm:text-sm font-header font-bold transition-all cursor-pointer rounded-none border ${
              selectedWilaya === 'all'
                ? 'bg-[#0E4B35] text-white border-[#0E4B35]'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
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
                className={`px-4 py-2 text-xs sm:text-sm font-header font-semibold transition-all cursor-pointer rounded-none border ${
                  isSelected
                    ? 'bg-[#0E4B35] text-white font-bold border-[#0E4B35]'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
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
            placeholder="ابحث باسم المستودع، البلدية، المادة، أو المسؤول..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-none text-sm font-sub focus:outline-none focus:border-[#0E4B35] focus:ring-1 focus:ring-[#0E4B35] text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Depots List / Cards */}
      <div className="space-y-4 pb-16">
        {filteredDepots.length > 0 ? (
          filteredDepots.map(depot => {
            const criticalItems = depot.items.filter(i => {
              const deficit = i.targetNeed - i.currentStock;
              return deficit > 0;
            });

            return (
              <div
                key={depot.id}
                onClick={() => router.push(`/depots/${depot.id}`)}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 sm:p-6 transition-all duration-200 hover:border-[#0E4B35]/60 hover:shadow-md cursor-pointer space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-[#0E4B35]/10 text-[#0E4B35] dark:text-emerald-400 text-xs font-header font-bold rounded-none border border-[#0E4B35]/20">
                        ولاية {depot.wilaya} • {depot.municipality}
                      </span>
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                        {depot.id}
                      </span>
                    </div>

                    <h2 className="font-header text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-[#0E4B35] dark:group-hover:text-emerald-400 transition-colors">
                      {depot.name}
                    </h2>
                  </div>

                  {/* Occupancy Indicator */}
                  <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 border border-slate-200 dark:border-slate-700">
                    <div className="text-right">
                      <div className="text-[11px] font-sub text-slate-400">نسبة الإشغال</div>
                      <div className="text-base font-mono font-bold text-slate-900 dark:text-white">
                        {depot.totalCapacityPercent}%
                      </div>
                    </div>
                    <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          depot.totalCapacityPercent >= 90
                            ? 'bg-[#C52233]'
                            : depot.totalCapacityPercent >= 70
                            ? 'bg-amber-500'
                            : 'bg-[#0E4B35]'
                        }`}
                        style={{ width: `${Math.min(depot.totalCapacityPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Contact Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sub">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0E4B35] shrink-0" />
                    <span className="truncate">{depot.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#0E4B35] shrink-0" />
                    <span>{depot.manager} • <span dir="ltr" className="font-mono text-slate-700 dark:text-slate-200 font-bold">{depot.phone}</span></span>
                  </div>
                </div>

                {/* Urgent Deficit Quick Tags with Radar Ripple */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="font-header font-bold text-[#C52233] flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    أبرز النواقص:
                  </span>

                  {criticalItems.length > 0 ? (
                    criticalItems.slice(0, 3).map(item => {
                      const deficit = item.targetNeed - item.currentStock;
                      return (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-xs font-header font-bold bg-rose-50 text-[#C52233] border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50 animate-radar-crisis"
                        >
                          <span>{item.name}</span>
                          <span className="font-mono">(نقص {deficit} {item.unit})</span>
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-[#0E4B35] dark:text-emerald-400 font-header font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      مكتفي بالكامل حالياً
                    </span>
                  )}

                  {criticalItems.length > 3 && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      +{criticalItems.length - 3} مواد أخرى
                    </span>
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    آخر تحديث: {depot.lastUpdated}
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {depot.googleMapsUrl && (
                      <a
                        href={depot.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full sm:w-auto"
                      >
                        <Button variant="primary" size="sm" className="w-full text-xs font-header font-bold shadow-xs">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    )}

                    <div className="w-full sm:w-auto">
                      <Button variant="secondary" size="sm" className="w-full text-xs font-header font-bold group-hover:bg-[#0E4B35] group-hover:text-white transition-colors pointer-events-none">
                        <span>التفاصيل والجرد الكامل</span>
                        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <SmartEmptyState
            searchQuery={searchQuery}
            selectedWilaya={selectedWilaya !== 'all' ? selectedWilaya : undefined}
            onReset={() => {
              setSelectedWilaya('all');
              setSearchQuery('');
            }}
            onSelectWilaya={(w) => {
              setSelectedWilaya(w);
              setSearchQuery('');
            }}
          />
        )}
      </div>

    </div>
  );
}

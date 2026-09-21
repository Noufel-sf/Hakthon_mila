'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useReliefStore, mapSummaryToDepot } from '@/lib/store';
import { api } from '@/lib/api';
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
  ChevronLeft,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';

export default function DepotsDirectoryPage() {
  const depots = useReliefStore((state) => state.depots);
  const [isLoading, setIsLoading] = useState<boolean>(depots.length === 0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDepotsData = async () => {
    try {
      setIsRefreshing(true);
      const [depotList, needsList] = await Promise.all([
        api.depots.list().catch(() => []),
        api.needs.list().catch(() => []),
      ]);
      if (depotList && depotList.length > 0) {
        const mapped = depotList.map(d => mapSummaryToDepot(d, needsList, []));
        useReliefStore.getState().setDepots(mapped);
      }
    } catch (err) {
      console.warn('[Depots Page] Failed to fetch depots:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepotsData();
  }, []);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-10">
      
      {/* Centered Page Header */}
      <div className="flex flex-col items-center mt-5 text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-header font-bold">
            <Warehouse className="w-3.5 h-3.5" />
            <span>دليل مستودعات ونقاط التفريغ المعتمدة</span>
          </div>
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

      {/* Depots List: Only One Depot per Row (Clean, minimal, focused on essentials) */}
      <div className="space-y-5">
        {isLoading && depots.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-[2rem] bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredDepots.length > 0 ? (
          filteredDepots.map((depot) => {
            const criticalItems = depot.items.filter(
              item => item.targetNeed - item.currentStock > 0
            );

            return (
              <div
                key={depot.id}
                className="rounded-[2rem] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-5"
              >
                {/* Depot Card Header: Name, Location Badge & Capacity */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {depot.code}
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-xs font-header font-bold bg-primary/10 text-primary border border-primary/20">
                        ولاية {depot.wilaya}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {depot.municipality}
                      </span>
                    </div>

                    <h2 className="font-header text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {depot.name}
                    </h2>
                  </div>

                  {/* Occupancy Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 dark:bg-slate-950/60 px-3.5 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                    <span className={`h-2 w-2 rounded-full ${
                      depot.totalCapacityPercent > 80 
                        ? 'bg-rose-500' 
                        : depot.totalCapacityPercent > 50 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}></span>
                    <span className="text-xs font-header font-bold text-slate-700 dark:text-slate-200">
                      نسبة الإشغال: <span className="font-mono">{depot.totalCapacityPercent}%</span>
                    </span>
                  </div>
                </div>

                {/* Essential Info Row: Address & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{depot.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{depot.manager} • <span dir="ltr" className="font-mono text-slate-700 dark:text-slate-200 font-bold">{depot.phone}</span></span>
                  </div>
                </div>

                {/* Urgent Deficit Quick Tags (Clean 1-line display) */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="font-header font-bold text-primary flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    أبرز النواقص:
                  </span>

                  {criticalItems.length > 0 ? (
                    criticalItems.slice(0, 3).map(item => {
                      const deficit = item.targetNeed - item.currentStock;
                      return (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-header font-bold bg-primary/10 text-primary border border-primary/20"
                        >
                          <span>{item.name}</span>
                          <span className="font-mono">(نقص {deficit} {item.unit})</span>
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-header font-bold flex items-center gap-1">
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
                        className="w-full sm:w-auto"
                      >
                        <Button variant="primary" size="sm" className="w-full text-xs font-header font-bold shadow-xs">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    )}

                    <Link href={`/depots/${depot.id}`} className="w-full sm:w-auto">
                      <Button variant="secondary" size="sm" className="w-full text-xs font-header font-bold">
                        <span>التفاصيل والجرد الكامل</span>
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


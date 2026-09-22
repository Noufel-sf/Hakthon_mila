'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDepotsQuery, useNeedsQuery } from '@/hooks/queries';
import { mapSummaryToDepot } from '@/lib/store';
import ReliefMap from '@/components/map/ReliefMap';
import { MapDepotItem } from '@/components/map/ReliefMapInner';
import { resolveDepotCoordinates, WILAYA_COORDINATES, ALGERIA_CENTER } from '@/lib/geo';
import { AidCategory } from '@/lib/types';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Filter, 
  LayoutGrid, 
  Layers, 
  ExternalLink,
  Search,
  Crosshair,
  PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import LiveTelemetryBadge from '@/components/LiveTelemetryBadge';

// Quick convoy items for "أين أوجه شاحنتي؟"
const CONVOY_CATEGORIES: { id: AidCategory; label: string; icon: string }[] = [
  { id: 'WATER', label: 'مياه الشرب', icon: '💧' },
  { id: 'FOOD', label: 'طرود غذائية', icon: '🍲' },
  { id: 'BLANKETS', label: 'أغطية وبطانيات', icon: '🧣' },
  { id: 'MATTRESSES', label: 'أفرشة إسفنجية', icon: '🛏️' },
  { id: 'MEDICAL', label: 'إسعافات وطبية', icon: '🩺' },
];

export default function ReliefMapPage() {
  const { data: depotList = [], isLoading: isLoadingDepots, refetch: refetchDepots, isFetching: isFetchingDepots } = useDepotsQuery();
  const { data: needsList = [], isLoading: isLoadingNeeds, refetch: refetchNeeds, isFetching: isFetchingNeeds } = useNeedsQuery();

  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [selectedDepotId, setSelectedDepotId] = useState<string | number | null>(null);
  const [filterCriticalOnly, setFilterCriticalOnly] = useState<boolean>(false);
  const [activeConvoyCategory, setActiveConvoyCategory] = useState<AidCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusedCoords, setFocusedCoords] = useState<[number, number] | null>(null);

  // Combine depot and needs data
  const richDepots = useMemo(() => {
    return depotList.map(d => mapSummaryToDepot(d, needsList, []));
  }, [depotList, needsList]);

  // Transform to MapDepotItem for map rendering
  const mapItems: MapDepotItem[] = useMemo(() => {
    return richDepots.map(depot => {
      const activeShortages = depot.items.filter(
        item => item.targetNeed > item.currentStock || item.priority === 'CRITICAL'
      );

      const hasCritical = activeShortages.some(i => i.priority === 'CRITICAL') || depot.status === 'AT_CAPACITY';

      return {
        id: depot.id,
        name: depot.name,
        wilaya: depot.wilaya,
        commune: depot.municipality,
        status: depot.status,
        activeShortageCount: activeShortages.length,
        hasCriticalNeeds: hasCritical,
        occupancyPercentage: depot.occupancyPercentage,
        googleMapsUrl: depot.googleMapsUrl,
        latitude: depot.location?.latitude,
        longitude: depot.location?.longitude,
      };
    });
  }, [richDepots]);

  // Available wilayas for filtering
  const wilayas = useMemo(() => {
    const set = new Set(richDepots.map(d => d.wilaya).filter(Boolean));
    return Array.from(set);
  }, [richDepots]);

  // Filtered depots based on controls
  const filteredMapItems = useMemo(() => {
    return mapItems.filter(item => {
      const matchWilaya = selectedWilaya === 'all' || item.wilaya === selectedWilaya;
      const matchCritical = !filterCriticalOnly || item.hasCriticalNeeds;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.commune.toLowerCase().includes(searchQuery.toLowerCase());

      return matchWilaya && matchCritical && matchSearch;
    });
  }, [mapItems, selectedWilaya, filterCriticalOnly, searchQuery]);

  // Statistics
  const totalDepotsCount = mapItems.length;
  const criticalHotspotsCount = mapItems.filter(i => i.hasCriticalNeeds).length;
  const totalWilayasCount = wilayas.length;

  // Convoy Guidance Helper: "أين أوجه شاحنتي؟"
  const handleConvoyDirect = (category: AidCategory) => {
    setActiveConvoyCategory(category);

    // Find the depot with the highest urgent deficit for this category
    let bestDepotId: string | number | null = null;
    let maxDeficit = -1;

    richDepots.forEach(depot => {
      const matchingItems = depot.items.filter(i => i.category === category);
      const depotDeficit = matchingItems.reduce((acc, item) => {
        const gap = Math.max(0, item.targetNeed - item.currentStock);
        const weight = item.priority === 'CRITICAL' ? 3 : item.priority === 'HIGH' ? 2 : 1;
        return acc + gap * weight;
      }, 0);

      if (depotDeficit > maxDeficit) {
        maxDeficit = depotDeficit;
        bestDepotId = depot.id;
      }
    });

    if (bestDepotId) {
      setSelectedDepotId(bestDepotId);
      const targetDepot = mapItems.find(d => String(d.id) === String(bestDepotId));
      if (targetDepot) {
        const coords = resolveDepotCoordinates({
          id: targetDepot.id,
          wilaya: targetDepot.wilaya,
          location: {
            wilaya: targetDepot.wilaya,
            commune: targetDepot.commune,
            latitude: targetDepot.latitude,
            longitude: targetDepot.longitude,
          },
        });
        setFocusedCoords(coords);
      }
    }
  };

  // Wilaya quick jump
  const handleWilayaChange = (wilaya: string) => {
    setSelectedWilaya(wilaya);
    if (wilaya === 'all') {
      setFocusedCoords(ALGERIA_CENTER);
    } else {
      const geo = WILAYA_COORDINATES[wilaya];
      if (geo) {
        setFocusedCoords([geo.lat, geo.lng]);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0E4B35]/10 text-[#0E4B35] dark:text-emerald-400 border border-[#0E4B35]/20 text-xs font-header font-bold rounded-none">
            <Compass className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
            <span>نظام المعلومات الجغرافية الميداني (Algeria Disaster Relief GIS)</span>
          </div>

          <h1 className="font-header text-2xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            الخريطة الميدانية التفاعلية للإغاثة
          </h1>

          <p className="font-sub text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            تتبع مباشر لمواقع مستودعات الإغاثة المعتمدة، رصد بؤر النقص الحرج بالأقمار الصناعية، وتوجيه قوافل الإمداد والشاحنات إلى أكثر المراكز احتياجاً.
          </p>
        </div>

        {/* Action Switch & Telemetry */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <LiveTelemetryBadge
            onRefresh={() => {
              refetchDepots();
              refetchNeeds();
            }}
            isRefreshing={isFetchingDepots || isFetchingNeeds}
          />
          <Link href="/depots">
            <Button variant="outline" className="rounded-none gap-2 font-bold text-xs h-10 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              <LayoutGrid className="w-4 h-4 text-slate-500" />
              <span>عرض شبكة البطاقات</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Operational Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0E4B35]/10 dark:bg-emerald-950/40 text-[#0E4B35] dark:text-emerald-400 flex items-center justify-center font-black text-lg border border-[#0E4B35]/20">
            {totalDepotsCount}
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">مستودعات معتمدة</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">نقاط تفريغ نشطة</div>
          </div>
        </div>

        <div className={`bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 p-3.5 flex items-center gap-3 ${criticalHotspotsCount > 0 ? 'animate-radar-crisis' : ''}`}>
          <div className="w-10 h-10 bg-rose-600/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-lg border border-rose-600/30">
            {criticalHotspotsCount}
          </div>
          <div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-none bg-rose-600 inline-block animate-ping"></span>
              <span>بؤر احتياج حرج</span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white">تتطلب إمداداً فورياً</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg border border-blue-600/20">
            {totalWilayasCount}
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">ولايات مغطاة</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">ميلة، جيجل، سكيكدة...</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-600/20">
            <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">توجيه الشاحنات</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">توجيه ذكي حسب النقص</div>
          </div>
        </div>
      </div>

      {/* Convoy Routing Helper Bar ("أين أوجه شاحنتي؟") */}
      <div className="p-4  flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-header text-sm font-black tracking-tight flex items-center gap-2">
              <span>أين أوجه شاحنتي الإغاثية؟</span>
              <span className="text-[10px] bg-emerald-600 px-1.5 py-0.2 font-mono uppercase text-white font-bold">Smart Routing</span>
            </div>
            <div className="text-xs ">
              اختر نوع الحمولة لمعاينة وتحديد المستودع الجزائري الأكثر حاجة إليها فورياً على الخريطة:
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CONVOY_CATEGORIES.map(cat => {
            const isSelected = activeConvoyCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleConvoyDirect(cat.id)}
                type="button"
                className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 border rounded-none ${
                  isSelected
                    ? 'bg-[#0E4B35] text-white border-emerald-400 shadow-sm scale-105'
                    : 'bg-primary text-white  hover:bg-primary'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Workspace (Side Panel + GIS Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left/Main Column: The Interactive GIS Map */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Controls toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
            
            {/* Wilaya selector */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">الولاية:</span>
              <select
                value={selectedWilaya}
                onChange={e => handleWilayaChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white rounded-none focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">كل الولايات الجزائرية</option>
                {wilayas.map(w => (
                  <option key={w} value={w}>
                    ولاية {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Critical only filter */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
                className={`px-3 py-1.5 text-xs font-bold border transition-colors flex items-center gap-1.5 rounded-none ${
                  filterCriticalOnly
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-none bg-rose-500 inline-block"></span>
                <span>بؤر الاحتياج الحرج فقط ({criticalHotspotsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedWilaya('all');
                  setFilterCriticalOnly(false);
                  setActiveConvoyCategory(null);
                  setSelectedDepotId(null);
                  setSearchQuery('');
                  setFocusedCoords(ALGERIA_CENTER);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-mono"
              >
                إعادة الضبط
              </button>
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
            <ReliefMap
              depots={filteredMapItems}
              selectedDepotId={selectedDepotId}
              onSelectDepot={depot => setSelectedDepotId(depot.id)}
              focusedCoordinates={focusedCoords}
              className="h-[560px] sm:h-[640px] w-full"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-mono">
            <span>بيانات جغرافية حية موثوقة • ولايات الشرق والوسط الجزائري</span>
            <span>المرجع: الحماية المدنية والهلال الأحمر الجزائري</span>
          </div>
        </div>

        {/* Right Column: Depots List & Active Selection Details */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search in list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن مستودع أو بلدية..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 pl-3 pr-9 py-2 text-xs text-slate-900 dark:text-white rounded-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-2">
              <span>المستودعات الظاهرة ({filteredMapItems.length})</span>
              <span className="text-[11px] font-mono">انقر للتركيز على الخريطة</span>
            </div>
          </div>

          {/* List of Depots */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredMapItems.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <div className="font-bold text-sm">لا توجد مستودعات مطابقة للفلتر</div>
                <div className="text-xs">يرجى تعديل خيارات البحث أو الولاية المحددة</div>
              </div>
            ) : (
              filteredMapItems.map(depot => {
                const isSelected = String(selectedDepotId) === String(depot.id);

                return (
                  <div
                    key={depot.id}
                    onClick={() => {
                      setSelectedDepotId(depot.id);
                      const coords = resolveDepotCoordinates({
                        id: depot.id,
                        wilaya: depot.wilaya,
                        location: {
                          wilaya: depot.wilaya,
                          commune: depot.commune,
                          latitude: depot.latitude,
                          longitude: depot.longitude,
                        },
                      });
                      setFocusedCoords(coords);
                    }}
                    className={`p-3.5 bg-white dark:bg-slate-900 border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary dark:border-emerald-500 ring-1 ring-primary dark:ring-emerald-500 shadow-md bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-header font-black text-sm text-slate-900 dark:text-white leading-tight">
                        {depot.name}
                      </h3>
                      {depot.hasCriticalNeeds ? (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 bg-rose-600 text-white border border-rose-700">
                          نقص حرج
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 bg-[#0E4B35]/10 text-[#0E4B35] dark:text-emerald-400 border border-[#0E4B35]/30">
                          نشط
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>ولاية {depot.wilaya} • {depot.commune || 'المركز'}</span>
                    </div>

                    {depot.activeShortageCount && depot.activeShortageCount > 0 ? (
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-2 mb-2.5 flex items-center justify-between">
                        <span>المواد المطلوبة عاجلاً:</span>
                        <span className="font-mono">{depot.activeShortageCount} مواد</span>
                      </div>
                    ) : null}

                    {/* Quick action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href={`/depots/${depot.id}`}
                        className="py-1.5 px-2 text-center text-xs font-bold bg-[#0E4B35] hover:bg-[#125e43] text-white transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        تفاصيل المستودع
                      </Link>
                      <a
                        href={
                          depot.googleMapsUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            depot.name + ' ' + depot.wilaya + ' الجزائر'
                          )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 text-center text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <span>توجيه GPS</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { 
  useDepotDetailsQuery, 
  useAdminDepotQuery,
  useNeedsQuery, 
  useInventoryQuery 
} from '@/hooks/queries';
import { 
  PublicDepotDetailResponse, 
  DepotResponse, 
  NeedResponse, 
  InventoryResponse,
  PublicInventorySummaryDTO 
} from '@/lib/types';
import { AID_CATEGORIES, getItemNameAr, getUnitNameAr, PRIORITY_LABELS } from '@/lib/constants';
import { 
  Warehouse, 
  MapPin, 
  Phone, 
  Mail,
  ArrowRight, 
  Truck, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Navigation,
  ExternalLink,
  RefreshCw,
  Package,
  Layers,
  Calendar,
  FileText,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';

export default function DepotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const numericId = Number(resolvedParams.id);

  // TanStack Query hooks for depot detail, admin details, needs, and inventory
  const { 
    data: publicDepot, 
    isLoading: isLoadingPublic, 
    isFetching: isRefreshingPublic, 
    refetch: refetchPublic 
  } = useDepotDetailsQuery(numericId);

  const {
    data: adminDepot,
    isLoading: isLoadingAdmin,
    isFetching: isRefreshingAdmin,
    refetch: refetchAdmin
  } = useAdminDepotQuery(numericId);

  const { 
    data: needs = [], 
    isLoading: isLoadingNeeds, 
    refetch: refetchNeeds 
  } = useNeedsQuery(numericId);

  const { 
    data: inventory = [], 
    isLoading: isLoadingInventory, 
    refetch: refetchInventory 
  } = useInventoryQuery(numericId);

  const availableSupplies = publicDepot?.availableSupplies || [];
  const isLoading = isLoadingPublic && isLoadingAdmin;
  const isRefreshing = isRefreshingPublic || isRefreshingAdmin;
  const [needsViewMode, setNeedsViewMode] = useState<'table' | 'grid'>('table');
  const [batchesViewMode, setBatchesViewMode] = useState<'table' | 'grid'>('table');

  const fetchLiveDepotDetails = () => {
    refetchPublic();
    refetchAdmin();
    refetchNeeds();
    refetchInventory();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-primary/10 text-primary font-bold text-sm animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>جاري جلب تفاصيل المستودع مباشرة من الخادم...</span>
        </div>
      </div>
    );
  }

  // If neither public nor admin depot was returned from the live API
  if (!publicDepot && !adminDepot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-none bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
          <Warehouse className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">المستودع غير موجود</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
          لم يتم العثور على مستودع بالمعرف ({resolvedParams.id}).
        </p>
        <Link href="/depots">
          <Button variant="primary">العودة لدليل المستودعات المتاحة</Button>
        </Link>
      </div>
    );
  }

  // Pure real fields from backend
  const depotName = publicDepot?.depotName || adminDepot?.name || `مستودع إغاثة #${numericId}`;
  const depotDesc = publicDepot?.description || adminDepot?.description || '';
  const loc = publicDepot?.location || adminDepot?.location;
  const wilaya = loc?.wilaya || '';
  const commune = loc?.commune || '';
  const address = loc?.address || '';
  const googleMapsUrl = loc?.googleMapsUrl || '';

  const manager = adminDepot?.contactInfo?.managerName || '';
  const phone = adminDepot?.contactInfo?.phone || '';
  const email = adminDepot?.contactInfo?.email || '';

  const totalCapacity = adminDepot?.totalCapacity || 0;
  const currentUsage = adminDepot?.currentUsage || 0;
  const capacityUnit = adminDepot?.capacityUnit || 'PALLETS';
  const occupancyPercentage = adminDepot?.occupancyPercentage !== undefined 
    ? Math.round(adminDepot.occupancyPercentage) 
    : 0;

  // Real urgent deficits
  const urgentDeficits = needs.filter(n => n.shortage > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-8">
      
      {/* Back navigation & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/depots"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-emerald-400 transition-colors mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لدليل المستودعات</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {depotName}
            </h1>
            {wilaya && (
              <span className="px-3 py-1 rounded-none text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                ولاية {wilaya}
              </span>
            )}
            {commune && (
              <span className="px-2.5 py-1 rounded-none text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                بلدية {commune}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-none text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              #{numericId}
            </span>
          </div>
          {depotDesc && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {depotDesc}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
    
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="primary" className="w-full shadow-md shadow-primary/20">
                <Navigation className="w-4 h-4" />
                <span>الاتجاه للمستودع (Google Maps)</span>
              </Button>
            </a>
          )}
          <Link href="/admin">
            <Button variant="secondary">
              <span>إدارة المستودع</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Cards Row (Purely Real Fields) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Address Card */}
        <div className="rounded-none border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              الموقع ونقطة التفريغ الميدانية
            </span>
            <p className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              {address || 'الموقع الميداني المعتمد'}
            </p>
            {(commune || wilaya) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                البلدية: {commune} — ولاية {wilaya}
              </p>
            )}
          </div>
          {googleMapsUrl && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/50 px-3 py-1.5 rounded-none transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>فتح نقطة التفريغ في Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Contact & Manager */}
        <div className="rounded-none border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold mb-1">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              المسؤول الميداني والتنسيق
            </span>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {manager || 'إدارة المركز الميداني'}
            </p>
            {phone && (
              <p className="text-sm text-slate-600 dark:text-slate-300 font-mono mt-0.5" dir="ltr">
                {phone}
              </p>
            )}
            {email && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5" dir="ltr">
                {email}
              </p>
            )}
          </div>
          <span className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            متاح لاستقبال اتصالات المتبرعين وتنسيق تفريغ الشاحنات
          </span>
        </div>

        {/* Capacity & Usage (Real Data from Admin API) */}
        <div className="rounded-none border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold mb-1">
              <Warehouse className="w-4 h-4 text-amber-500" />
              الطاقة الاستيعابية والإشغال
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                {occupancyPercentage}%
              </span>
              {totalCapacity > 0 && (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {currentUsage.toLocaleString('ar-DZ')} / {totalCapacity.toLocaleString('ar-DZ')} {capacityUnit}
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-none overflow-hidden">
            <div 
              className={`h-full rounded-none transition-all duration-500 ${
                occupancyPercentage > 80 ? 'bg-rose-500' : occupancyPercentage > 50 ? 'bg-primary' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Guidance Notice Banner */}
      {urgentDeficits.length > 0 ? (
        <div className="rounded-none border border-[#FDD0D6] dark:border-[#3D1016] bg-[#FFF5F6] dark:bg-[#1E080C] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-rose-200">
                توجيه عاجل لأصحاب القوافل والشاحنات المتجهة نحو {depotName}:
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                هذا المستودع يعاني من عجز في: <strong className="text-rose-600 dark:text-rose-400 font-bold">{urgentDeficits.map(i => `${getItemNameAr(i.itemName)} (${i.shortage} ${getUnitNameAr(i.unit)})`).join('، ')}</strong>. 
                يرجى إعطاء الأولوية لهذه المواد قبل إرسال شاحنات إضافية.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-none border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              حالة استقرار في المخزون
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              لا توجد نواقص حرجة مسجلة حالياً لهذا المستودع. يمكن توجيه التبرعات للمستودعات المجاورة التي تعاني من نقص.
            </p>
          </div>
        </div>
      )}

      {/* ================= SECTION 1: REAL NEEDS TABLE & GRID ================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              جدول الاحتياجات الميدانية والنواقص (Live Needs & Shortages)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              بيان صادر من الميدان يوضح حجم المطلوب، المتوفر حالياً، والعجز الفعلي المطلوب تغطيته
            </p>
          </div>

          {/* View Mode Toggle: Table vs Grid */}
          {needs.length > 0 && (
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setNeedsViewMode('table')}
                className={`px-3 py-1.5 text-xs font-header font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  needsViewMode === 'table'
                    ? 'bg-[#0E4B35] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>عرض الجدول</span>
              </button>
              <button
                type="button"
                onClick={() => setNeedsViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-header font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  needsViewMode === 'grid'
                    ? 'bg-[#0E4B35] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>شبكة البطاقات ({needs.length})</span>
              </button>
            </div>
          )}
        </div>

        {needs.length > 0 ? (
          needsViewMode === 'table' ? (
            /* TABLE VIEW */
            <div className="overflow-x-auto rounded-none border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-5">المادة / الصنف</th>
                    <th className="py-4 px-5">الفئة</th>
                    <th className="py-4 px-5">المتوفر حالياً</th>
                    <th className="py-4 px-5">المطلوب</th>
                    <th className="py-4 px-5">حالة العجز</th>
                    <th className="py-4 px-5">الأولوية</th>
                    <th className="py-4 px-5">ملاحظات الميدان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {needs.map((need, idx) => {
                    const arName = getItemNameAr(need.itemName);
                    const arUnit = getUnitNameAr(need.unit);
                    const isDeficit = need.shortage > 0;
                    const fulfillmentPct = Math.min(100, Math.round((need.currentAvailableQuantity / (need.requestedQuantity || 1)) * 100));
                    const priorityMeta = PRIORITY_LABELS[need.priority] || { label: need.priority, color: 'slate' };

                    return (
                      <tr key={`${need.id || idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Item Name */}
                        <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                          <span className="text-base block">{arName}</span>
                          <span className="text-xs font-normal text-slate-400 font-mono">{need.itemName}</span>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-none text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                            {need.category}
                          </span>
                        </td>

                        {/* Current Stock */}
                        <td className="py-4 px-5 font-mono font-bold text-slate-900 dark:text-white">
                          {need.currentAvailableQuantity.toLocaleString('ar-DZ')}
                          <span className="text-xs font-normal text-slate-400 mr-1.5">{arUnit}</span>
                        </td>

                        {/* Target Need */}
                        <td className="py-4 px-5 font-mono text-slate-500 dark:text-slate-400">
                          {need.requestedQuantity.toLocaleString('ar-DZ')}
                          <span className="text-xs font-normal text-slate-400 mr-1.5">{arUnit}</span>
                        </td>

                        {/* Deficit / Progress */}
                        <td className="py-4 px-5">
                          {isDeficit ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                              <span className="h-1.5 w-1.5 rounded-none bg-rose-600 animate-pulse"></span>
                              <span>عجز {need.shortage} {arUnit}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>مكتفي ✅</span>
                            </div>
                          )}
                          <div className="w-28 mt-1.5">
                            <Progress 
                              value={fulfillmentPct} 
                              className="h-1 bg-slate-100 dark:bg-slate-800"
                              indicatorClassName={isDeficit ? "bg-rose-600" : "bg-primary"}
                            />
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-none text-xs font-bold ${
                            need.priority === 'CRITICAL' 
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : need.priority === 'HIGH'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          }`}>
                            {priorityMeta.label}
                          </span>
                        </td>

                        {/* Field Notes */}
                        <td className="py-4 px-5 text-xs text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                          {need.notes ? (
                            <span className="block bg-slate-50 dark:bg-slate-800/80 p-2 rounded-none border border-slate-200/60 dark:border-slate-700/60">
                              {need.notes}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {needs.map((need, idx) => {
                const arName = getItemNameAr(need.itemName);
                const arUnit = getUnitNameAr(need.unit);
                const isDeficit = need.shortage > 0;
                const fulfillmentPct = Math.min(100, Math.round((need.currentAvailableQuantity / (need.requestedQuantity || 1)) * 100));
                const priorityMeta = PRIORITY_LABELS[need.priority] || { label: need.priority, color: 'slate' };

                return (
                  <div
                    key={`grid-need-${need.id || idx}`}
                    className="rounded-none border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-[#0E4B35] dark:hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4"
                  >
                    {/* Card Header: Category & Priority Badges */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-none text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          {need.category}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-none text-xs font-bold flex items-center gap-1 ${
                            need.priority === 'CRITICAL'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : need.priority === 'HIGH'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          }`}
                        >
                          {need.priority === 'CRITICAL' && (
                            <span className="w-1.5 h-1.5 rounded-none bg-rose-600 animate-ping"></span>
                          )}
                          <span>{priorityMeta.label}</span>
                        </span>
                      </div>

                      {/* Item Names */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                          {arName}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          {need.itemName}
                        </p>
                      </div>
                    </div>

                    {/* Deficit Callout Box */}
                    <div>
                      {isDeficit ? (
                        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                            <span className="w-2 h-2 rounded-none bg-rose-600 animate-pulse"></span>
                            <span>عجز ميداني مطلوب:</span>
                          </div>
                          <span className="font-mono font-black text-sm text-rose-700 dark:text-rose-300">
                            {need.shortage.toLocaleString('ar-DZ')} {arUnit}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>حالة المخزون:</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            مكتفي ومغطى بالكامل ✅
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantities Breakdown & Progress */}
                    <div className="space-y-2 bg-slate-50/70 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">المتوفر حالياً:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            {need.currentAvailableQuantity.toLocaleString('ar-DZ')} {arUnit}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">المطلوب الكلي:</span>
                          <span className="font-mono text-slate-600 dark:text-slate-300 text-sm">
                            {need.requestedQuantity.toLocaleString('ar-DZ')} {arUnit}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>نسبة تغطية الاحتياج</span>
                          <span className="font-mono font-bold">{fulfillmentPct}%</span>
                        </div>
                        <Progress
                          value={fulfillmentPct}
                          className="h-1.5 bg-slate-200 dark:bg-slate-700"
                          indicatorClassName={isDeficit ? "bg-rose-600" : "bg-emerald-600"}
                        />
                      </div>
                    </div>

                    {/* Field Notes (if any) */}
                    {need.notes && (
                      <div className="text-xs bg-slate-50 dark:bg-slate-800/80 p-2.5 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block text-[11px] mb-0.5">
                          ملاحظة الميدان:
                        </span>
                        <span>{need.notes}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد طلبات احتياج مسجلة حالياً لهذا المستودع
            </p>
          </div>
        )}
      </div>

      {/* ================= SECTION 2: AVAILABLE SUPPLIES (Real Public Breakdown) ================= */}
      {availableSupplies.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>مخزون المواد المتاحة حالياً للتوزيع (Available Supplies Overview)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              بيانات المخزون الإجمالي الجاهز للتوزيع والموثق في قاعدة بيانات المستودع
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {availableSupplies.map((supp, sIdx) => {
              const catMeta = AID_CATEGORIES.find(c => c.id === supp.category);
              const statusLabel = 
                supp.stockLevelStatus === 'SUFFICIENT' ? 'وفرة كافية ✅' :
                supp.stockLevelStatus === 'SURPLUS' ? 'فائض مستقر 📦' :
                supp.stockLevelStatus === 'MODERATE' ? 'مستوى متوسط ⚠️' :
                supp.stockLevelStatus === 'CRITICAL' ? 'حرج جداً 🚨' : 'متاح';

              return (
                <div 
                  key={`${supp.category}-${sIdx}`}
                  className="p-4 rounded-none border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{catMeta?.icon || '📦'}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {statusLabel}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {catMeta?.nameAr.split(' ')[0] || supp.category}
                    </h4>
                    <p className="text-xl font-mono font-black text-primary mt-1">
                      {supp.totalQuantity.toLocaleString('ar-DZ')}
                      <span className="text-xs font-normal text-slate-400 mr-1.5">{getUnitNameAr(supp.unit)}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SECTION 3: REAL INVENTORY BATCHES (TABLE & GRID) ================= */}
      {inventory.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <span>سجل الشحنات والطرود المخزنة فعلياً (Live Stored Batches)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تفاصيل الدفعات المخزنة، أرقام الشحنات (Batch Numbers)، وتواريخ الصلاحية الفعلية
              </p>
            </div>

            {/* View Mode Toggle: Table vs Grid */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setBatchesViewMode('table')}
                className={`px-3 py-1.5 text-xs font-header font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  batchesViewMode === 'table'
                    ? 'bg-[#0E4B35] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>عرض الجدول</span>
              </button>
              <button
                type="button"
                onClick={() => setBatchesViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-header font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  batchesViewMode === 'grid'
                    ? 'bg-[#0E4B35] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>شبكة البطاقات ({inventory.length})</span>
              </button>
            </div>
          </div>

          {batchesViewMode === 'table' ? (
            /* TABLE VIEW */
            <div className="overflow-x-auto rounded-none border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-5">رقم الشحنة (Batch)</th>
                    <th className="py-4 px-5">المادة</th>
                    <th className="py-4 px-5">الكمية المخزنة</th>
                    <th className="py-4 px-5">تاريخ الاستلام</th>
                    <th className="py-4 px-5">تاريخ انتهاء الصلاحية</th>
                    <th className="py-4 px-5">الحالة</th>
                    <th className="py-4 px-5">الملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {inventory.map((inv, idx) => {
                    const arName = getItemNameAr(inv.itemName);
                    const arUnit = getUnitNameAr(inv.unit);

                    return (
                      <tr key={`${inv.id || idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Batch Number */}
                        <td className="py-4 px-5 font-mono text-xs font-bold text-primary">
                          {inv.batchNumber || `BATCH-${inv.id}`}
                        </td>

                        {/* Item Name */}
                        <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                          <span className="block">{arName}</span>
                          <span className="text-xs font-normal text-slate-400 font-mono">{inv.itemName}</span>
                        </td>

                        {/* Quantity */}
                        <td className="py-4 px-5 font-mono font-bold text-slate-900 dark:text-white">
                          {inv.quantity.toLocaleString('ar-DZ')}
                          <span className="text-xs font-normal text-slate-400 mr-1.5">{arUnit}</span>
                        </td>

                        {/* Received Date */}
                        <td className="py-4 px-5 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {inv.receivedDate || '—'}
                        </td>

                        {/* Expiration Date */}
                        <td className="py-4 px-5 text-xs">
                          {inv.expirationDate ? (
                            <span className={`font-mono font-bold ${
                              inv.isExpired ? 'text-rose-600' : inv.isExpiringSoon ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'
                            }`}>
                              {inv.expirationDate}
                              {inv.isExpiringSoon && ' (قريب الانتهاء ⚠️)'}
                              {inv.isExpired && ' (منتهي الصلاحية 🚨)'}
                            </span>
                          ) : (
                            <span className="text-slate-400">غير قابل للتلف</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-none text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                            {inv.status === 'AVAILABLE' ? 'جاهز للتوزيع' : inv.status}
                          </span>
                        </td>

                        {/* Notes */}
                        <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                          {inv.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((inv, idx) => {
                const arName = getItemNameAr(inv.itemName);
                const arUnit = getUnitNameAr(inv.unit);

                return (
                  <div
                    key={`grid-batch-${inv.id || idx}`}
                    className="rounded-none border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-[#0E4B35] dark:hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4"
                  >
                    {/* Header: Batch Number & Status */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-none font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-primary dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                          {inv.batchNumber || `BATCH-${inv.id}`}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-none text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                          {inv.status === 'AVAILABLE' ? 'جاهز للتوزيع ✅' : inv.status}
                        </span>
                      </div>

                      {/* Item Names */}
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                          {arName}
                        </h4>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          {inv.itemName}
                        </p>
                      </div>
                    </div>

                    {/* Stored Quantity Callout */}
                    <div className="bg-[#0E4B35]/5 dark:bg-emerald-950/20 border border-[#0E4B35]/20 dark:border-emerald-900/40 p-3 flex items-center justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">
                        الكمية المخزنة:
                      </span>
                      <span className="text-lg font-mono font-black text-primary dark:text-emerald-400">
                        {inv.quantity.toLocaleString('ar-DZ')}{' '}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{arUnit}</span>
                      </span>
                    </div>

                    {/* Dates & Logistics Details */}
                    <div className="space-y-2 bg-slate-50/70 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">تاريخ الاستلام:</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          {inv.receivedDate || '—'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-400">تاريخ انتهاء الصلاحية:</span>
                        {inv.expirationDate ? (
                          <span
                            className={`font-mono font-bold ${
                              inv.isExpired
                                ? 'text-rose-600 dark:text-rose-400'
                                : inv.isExpiringSoon
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {inv.expirationDate}
                            {inv.isExpiringSoon && ' ⚠️'}
                            {inv.isExpired && ' 🚨'}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">غير قابل للتلف</span>
                        )}
                      </div>
                    </div>

                    {/* Field Notes (if any) */}
                    {inv.notes && (
                      <div className="text-xs bg-slate-50 dark:bg-slate-800/80 p-2.5 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block text-[11px] mb-0.5">
                          ملاحظة الشحنة:
                        </span>
                        <span>{inv.notes}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

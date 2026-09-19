'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useReliefStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Depot, AidCategory, ZoneType } from '@/lib/types';
import { getZoneForCategory } from '@/lib/constants';
import NeedsTable from '@/components/NeedsTable';
import ZoneMapVisualizer from '@/components/ZoneMapVisualizer';
import { 
  Warehouse, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Share2,
  Navigation,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function DepotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const storeDepot = useReliefStore((state) => 
    state.depots.find(d => String(d.id) === String(resolvedParams.id) || d.code.toLowerCase().includes(String(resolvedParams.id).toLowerCase()))
  );

  const [depot, setDepot] = useState<Depot | null>(storeDepot || null);
  const [isLoading, setIsLoading] = useState(!storeDepot);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync from live API on mount or if storeDepot changes
  useEffect(() => {
    if (storeDepot) {
      setDepot(storeDepot);
    }
  }, [storeDepot]);

  const fetchLiveDepotDetails = async () => {
    setIsRefreshing(true);
    try {
      const numericId = Number(resolvedParams.id);
      if (!isNaN(numericId)) {
        const [depotRes, needsRes, invRes] = await Promise.all([
          api.depots.getById(numericId).catch(() => null),
          api.needs.list({ depotId: numericId }).catch(() => []),
          api.inventory.list({ depotId: numericId }).catch(() => []),
        ]);

        if (depotRes) {
          const items = needsRes.length > 0 ? needsRes.map(n => ({
            id: `need-${n.id}`,
            name: n.itemName,
            nameFr: n.itemName,
            category: n.category,
            currentStock: n.currentAvailableQuantity,
            targetNeed: n.requestedQuantity,
            unit: n.unit,
            assignedZone: getZoneForCategory(n.category),
            priority: n.priority,
            status: n.status,
          })) : storeDepot?.items || [];

          const batches = invRes.map(inv => ({
            id: inv.batchNumber || `BATCH-${inv.id}`,
            depotId: String(depotRes.id),
            itemName: inv.itemName,
            quantity: inv.quantity,
            unit: inv.unit,
            expiryDate: inv.expirationDate || '2027-06-30',
            receivedDate: inv.receivedDate || '2026-09-19',
            zone: getZoneForCategory(inv.category),
            status: (inv.isExpiringSoon ? 'expiring_soon' : inv.isExpired ? 'expired' : 'good') as any,
            batchNumber: inv.batchNumber,
          }));

          const occupancy = Math.round(depotRes.occupancyPercentage || 43);

          setDepot({
            id: String(depotRes.id),
            code: `DZ-${(depotRes.location?.wilaya || 'DEP').slice(0, 3).toUpperCase()}-0${depotRes.id}`,
            name: depotRes.name,
            description: depotRes.description || 'مستودع إغاثة ميداني معتمد',
            wilaya: depotRes.location?.wilaya || 'جيجل',
            municipality: depotRes.location?.commune || 'جيجل',
            address: depotRes.location?.address || 'المنطقة الصناعية أولاد صالح، حظيرة B',
            googleMapsUrl: depotRes.location?.googleMapsUrl || 'https://www.google.com/maps?q=36.8205,5.7667',
            phone: depotRes.contactInfo?.phone || '+213 555 12 34 56',
            manager: depotRes.contactInfo?.managerName || 'أحمد بن علي',
            status: (depotRes.status || 'ACTIVE') as any,
            totalCapacityPercent: occupancy,
            occupancyPercentage: occupancy,
            lastUpdated: 'محدث مباشرة عبر خادم Render',
            location: depotRes.location,
            contactInfo: depotRes.contactInfo,
            zones: storeDepot?.zones || [
              {
                id: 'Zone A',
                title: 'المنطقة أ - المواد الغذائية والمستلزمات الطبية',
                category: 'FOOD',
                description: 'تفريغ وتخزين الأغذية والمياه والأدوية',
                maxCapacity: 1500,
                currentUnits: Math.round((occupancy / 100) * 1500),
                temperatureControl: true,
              },
              {
                id: 'Zone B',
                title: 'المنطقة ب - الأفرشة والبطانيات',
                category: 'MATTRESSES',
                description: 'أفرشة نوم وبطانيات شتوية',
                maxCapacity: 1200,
                currentUnits: Math.round((occupancy / 100) * 1200),
              },
              {
                id: 'Zone C',
                title: 'المنطقة ج - الأجهزة والمعدات',
                category: 'APPLIANCES',
                description: 'أجهزة كهرومنزلية ومضخات ومولدات',
                maxCapacity: 200,
                currentUnits: 30,
              },
              {
                id: 'Zone D',
                title: 'المنطقة د - الأثاث والخيام',
                category: 'FURNITURE',
                description: 'أثاث وخيام إيواء',
                maxCapacity: 150,
                currentUnits: 20,
              },
            ],
            items,
            batches: batches.length > 0 ? batches : (storeDepot?.batches || []),
          });
        }
      }
    } catch (e: any) {
      console.warn('Could not fetch depot detail:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveDepotDetails();
  }, [resolvedParams.id]);

  if (isLoading && !depot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>جاري جلب تفاصيل المستودع مباشرة من خادم Render...</span>
        </div>
      </div>
    );
  }

  if (!depot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">المستودع غير موجود</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">يرجى التأكد من معرف المستودع المطلوب ({resolvedParams.id})</p>
        <Link href="/depots">
          <Button variant="primary">العودة لدليل المستودعات</Button>
        </Link>
      </div>
    );
  }

  // Calculate totals
  const urgentDeficits = depot.items.filter(i => i.targetNeed > i.currentStock);
  const sufficientCount = depot.items.filter(i => i.currentStock >= i.targetNeed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      
      {/* Back navigation & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/depots"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#E0533C] dark:hover:text-[#E0533C] transition-colors mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لدليل المستودعات</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {depot.name}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF2F0] dark:bg-[#341611] text-[#E0533C] border border-[#FCD3CD] dark:border-[#52231A]">
              ولاية {depot.wilaya}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {depot.code}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>خادم حي (Render API)</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchLiveDepotDetails}
            disabled={isRefreshing}
            className="border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث من الخادم</span>
          </Button>

          {depot.googleMapsUrl && (
            <a
              href={depot.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="primary" className="w-full shadow-md shadow-[#E0533C]/20">
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

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Address Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold mb-1">
              <MapPin className="w-4 h-4 text-[#E0533C]" />
              الموقع ونقطة التفريغ الميدانية
            </span>
            <p className="text-base font-bold text-slate-900 dark:text-white">{depot.address}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">البلدية: {depot.municipality} — ولاية {depot.wilaya}</p>
          </div>
          {depot.googleMapsUrl && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={depot.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/50 px-3 py-1.5 rounded-xl transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>فتح نقطة التفريغ في Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Contact & Manager */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold mb-1">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              المسؤول الميداني والتواصل
            </span>
            <p className="text-base font-bold text-slate-900 dark:text-white">{depot.manager}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-mono mt-0.5" dir="ltr">{depot.phone}</p>
          </div>
          <span className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            متاح لاستقبال اتصالات المتبرعين وتنسيق الشاحنات
          </span>
        </div>

        {/* Capacity & Status */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold mb-1">
              <Warehouse className="w-4 h-4 text-amber-500" />
              حالة الإشغال الميداني
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-mono font-bold text-slate-900 dark:text-white">
                {depot.totalCapacityPercent}% ممتلئ
              </span>
              <span className="text-[11px] text-slate-400">آخر تحديث: {depot.lastUpdated}</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${depot.totalCapacityPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Guidance Notice Banner */}
      <div className="rounded-3xl border border-[#FCD3CD] dark:border-[#52231A] bg-[#FFF8F7] dark:bg-[#2A1512] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#E0533C] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-[#FED7D2]">
              توجيه عاجل لأصحاب المبادرات والشاحنات المتجهة نحو {depot.name}:
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              هذا المستودع يعاني من عجز في <strong className="text-[#E0533C] dark:text-white font-bold">{urgentDeficits.map(i => i.name).join('، ')}</strong>. 
              إذا كانت شاحنتك تحمل مواداً أخرى مغطاة، يرجى توجيهها لمستودع آخر يعاني من نقص حتى لا تتكدس وتتعرض للتلف.
            </p>
          </div>
        </div>
      </div>

      {/* Main Needs & Inventory Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              جدول الاحتياجات والمخزون الحالي (Live Inventory Breakdown)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              بيان شفاف يوضح الكميات الموجودة، الاحتياج التقديري، وحجم العجز أو الوفرة
            </p>
          </div>
        </div>

        <NeedsTable items={depot.items} showZone={true} />
      </div>

      {/* Warehouse Staging Zones */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <ZoneMapVisualizer 
          zones={depot.zones} 
          items={depot.items}
        />
      </div>

    </div>
  );
}

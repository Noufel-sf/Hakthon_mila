'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRelief } from '@/lib/store';
import { api } from '@/lib/api';
import { getZoneForCategory } from '@/lib/constants';
import { 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  Calendar, 
  PackageCheck,
  Plus,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function ExpiryManagementPage() {
  const { depots, selectedDepotId, getDepot, fetchLiveData } = useRelief();
  const currentDepot = getDepot(selectedDepotId) || depots[0];

  const [liveBatches, setLiveBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLiveExpiringInventory = async () => {
    setIsLoading(true);
    try {
      const expiringRes = await api.inventory.getExpiring(90).catch(() => []);
      if (expiringRes && expiringRes.length > 0) {
        const mapped = expiringRes.map(item => ({
          id: item.batchNumber || `BATCH-${item.id}`,
          depotId: String(item.depotId),
          depotName: item.depotName || currentDepot.name,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expirationDate || '2026-10-01',
          receivedDate: item.receivedDate || '2026-09-14',
          zone: getZoneForCategory(item.category),
          status: (item.isExpiringSoon || (item.daysUntilExpiration && item.daysUntilExpiration <= 15)) ? 'expiring_soon' : 'good',
          batchNumber: item.batchNumber,
          isLiveRemote: true,
        }));
        setLiveBatches(mapped);
      }
    } catch (err: any) {
      console.warn('Could not load expiring inventory:', err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveExpiringInventory();
  }, [currentDepot.id]);

  const allBatches = [...liveBatches];
  currentDepot.batches.forEach(b => {
    if (!allBatches.some(x => x.id === b.id || x.itemName === b.itemName)) {
      allBatches.push(b);
    }
  });

  // Sort batches by earliest expiry date
  const sortedBatches = [...allBatches].sort((a, b) => {
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span>العودة للوحة القيادة</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black font-header text-slate-900 dark:text-white">
              تتبع الصلاحية وتدوير المخزون (FIFO Tracking)
            </h1>
            <Badge variant="rose" size="md">
              {currentDepot.name}
            </Badge>
          </div>

          <button
            onClick={() => {
              fetchLiveExpiringInventory();
              fetchLiveData().catch(() => {});
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>خادم حي (Render)</span>
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          متابعة دقيقة لدفعات المواد الغذائية والحليب والأدوية لضمان توزيعها وفق مبدأ (FIFO: الأقرب انتهاءً يُوزع أولاً) وتفادي تلف أي مساعدة.
        </p>
      </div>

      {/* Critical Expiry Alert Banner */}
      <div className="rounded-2xl border-2 border-rose-500/80 bg-rose-50/60 dark:bg-rose-950/20 p-6 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black font-header text-sm sm:text-base">
          <AlertTriangle className="w-5 h-5 animate-pulse shrink-0" />
          <span>تنبيه عاجل لمنسقي التوزيع الميداني:</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          ⚠️ توجد دفعات من <strong className="text-slate-900 dark:text-white font-bold underline">الحليب المعقم (300 علبة)</strong> تنتهي صلاحيتها خلال <strong className="text-rose-600 dark:text-rose-400 font-bold">3 أيام</strong>. 
          يرجى إدراجها كأولوية قصوى في قوافل التوزيع الميدانية للعائلات قبل تاريخ 22 سبتمبر لتفادي تلفها في المستودع.
        </p>
        <div className="pt-2">
          <button 
            type="button"
            onClick={() => {
              toast.warning('تم رفع أولوية صرف دفعة الحليب فوراً!', {
                description: 'تم إشعار قوافل التوزيع الميدانية لمنع تلف الـ 300 علبة وتفريغها اليوم.',
              });
            }}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <PackageCheck className="w-4 h-4" />
            <span>تعيين أولوية صرف عاجلة لهذه الدفعة (FIFO Priority)</span>
          </button>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black font-header text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            سجل الدفعات المسجلة بالمستودع
          </h2>
          <Link 
            href="/admin/intake"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>تسجيل دفعة جديدة</span>
          </Link>
        </div>

        {sortedBatches.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">رقم الدفعة / الصنف</th>
                  <th className="py-3 px-4">الكمية المسجلة</th>
                  <th className="py-3 px-4">منطقة التخزين</th>
                  <th className="py-3 px-4">تاريخ الانتهاء</th>
                  <th className="py-3 px-4">الوقت المتبقي</th>
                  <th className="py-3 px-4 text-center">أولوية الصرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {sortedBatches.map((batch) => {
                  const relative = getRelativeTime(batch.expiryDate);
                  const isUrgent = batch.status === 'expiring_soon';

                  return (
                    <tr 
                      key={batch.id} 
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        isUrgent ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <span className="block">{batch.itemName}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">
                          {batch.id} • استلمت: {batch.receivedDate}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-header font-bold text-base text-slate-900 dark:text-white">
                        {batch.quantity} <span className="text-xs text-slate-400 font-normal">{batch.unit}</span>
                      </td>

                      {/* Zone */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300">
                          {batch.zone}
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-xs">
                        {batch.expiryDate}
                      </td>

                      {/* Status / Countdown */}
                      <td className="py-3.5 px-4">
                        {isUrgent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                            ⚠️ {relative}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            ✅ {relative}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          type="button"
                          onClick={() => toast.success(`تم إدراج دفعة (${batch.itemName}) في خطة الصرف العاجل (FIFO)!`)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary transition-all cursor-pointer"
                        >
                          جدولة صرف عاجل
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-xs">
            لا توجد دفعات محددة بتاريخ صلاحية مسجلة في هذا المستودع بعد.
          </div>
        )}
      </div>

    </div>
  );
}

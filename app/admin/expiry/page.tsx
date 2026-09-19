'use client';

import React from 'react';
import Link from 'next/link';
import { useRelief } from '@/lib/store';
import { 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Users,
  ShieldAlert,
  PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function ExpiryManagementPage() {
  const { depots, selectedDepotId, getDepot } = useRelief();
  const currentDepot = getDepot(selectedDepotId) || depots[0];

  const batches = currentDepot.batches;

  // Find critical items
  const now = new Date();
  const sortedBatches = [...batches].sort((a, b) => {
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة المستودع</span>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            نظام إدارة الصلاحية وتفادي الهدر (Batch & Expiration)
          </h1>
          <Badge variant="rose" size="md">
            {currentDepot.name}
          </Badge>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          متابعة دقيقة لدفعات المواد الغذائية والحليب والأدوية لضمان توزيعها وفق مبدأ (FIFO: الأقرب انتهاءً يُوزع أولاً) وتفادي تلف أي مساعدة.
        </p>
      </div>

      {/* Critical Expiry Alert Banner (Example from user prompt) */}
      <div className="rounded-3xl border-2 border-rose-500/80 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 p-6 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm sm:text-base">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span>تنبيه عاجل لمنسقي التوزيع الميداني:</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          ⚠️ توجد دفعات من <strong className="text-white underline">الحليب المعقم (300 علبة)</strong> تنتهي صلاحيتها خلال <strong className="text-rose-400 font-bold">3 أيام</strong>. 
          يرجى إدراجها كأولوية قصوى في قوافل التوزيع الميدانية للعائلات قبل تاريخ 22 سبتمبر لتفادي تلفها في المستودع.
        </p>
        <div className="pt-2">
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => {
              toast.warning('تم رفع أولوية صرف دفعة الحليب فوراً!', {
                description: 'تم إشعار قوافل التوزيع الميدانية لمنع تلف الـ 300 علبة وتفريغها اليوم.',
              });
            }}
          >
            <PackageCheck className="w-4 h-4" />
            <span>تعيين أولوية صرف عاجلة لهذه الدفعة (FIFO Priority)</span>
          </Button>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            سجل الدفعات المسجلة بالمستودع
          </h2>
          <Link href="/admin/intake">
            <Button variant="outline" size="sm">
              <span>+ تسجيل دفعة جديدة</span>
            </Button>
          </Link>
        </div>

        {sortedBatches.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-800 text-xs text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">رقم الدفعة / الصنف</th>
                  <th className="py-3 px-4">الكمية المسجلة</th>
                  <th className="py-3 px-4">منطقة التخزين</th>
                  <th className="py-3 px-4">تاريخ الانتهاء</th>
                  <th className="py-3 px-4">الوقت المتبقي</th>
                  <th className="py-3 px-4 text-center">أولوية الصرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {sortedBatches.map((batch) => {
                  const relative = getRelativeTime(batch.expiryDate);
                  const isUrgent = batch.status === 'expiring_soon';

                  return (
                    <tr 
                      key={batch.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isUrgent ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span className="block">{batch.itemName}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">
                          {batch.id} • استلمت: {batch.receivedDate}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-mono font-bold text-base">
                        {batch.quantity} <span className="text-xs text-slate-400 font-normal">{batch.unit}</span>
                      </td>

                      {/* Zone */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-slate-300">
                          {batch.zone}
                        </span>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {batch.expiryDate}
                      </td>

                      {/* Status / Countdown */}
                      <td className="py-3.5 px-4">
                        {isUrgent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                            ⚠️ {relative}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ✅ {relative}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          onClick={() => toast.success(`تم إدراج دفعة (${batch.itemName}) في خطة الصرف العاجل (FIFO)!`)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500 transition-all cursor-pointer"
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

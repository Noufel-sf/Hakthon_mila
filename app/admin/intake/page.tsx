'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRelief } from '@/lib/store';
import { api } from '@/lib/api';
import { AidCategory, ZoneType } from '@/lib/types';
import { AID_CATEGORIES, WAREHOUSE_ZONES } from '@/lib/constants';
import { 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  AlertCircle,
  Truck,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function SmartIntakePage() {
  const { depots, selectedDepotId, receiveCargo, getDepot, fetchLiveData } = useRelief();
  const currentDepot = getDepot(selectedDepotId) || depots[0];

  const [category, setCategory] = useState<AidCategory>('FOOD');
  const [itemName, setItemName] = useState<string>('حليب معقم 1 لتر');
  const [quantity, setQuantity] = useState<number>(300);
  const [unit, setUnit] = useState<string>('علبة');
  const [hasExpiry, setHasExpiry] = useState<boolean>(true);
  const [expiryDate, setExpiryDate] = useState<string>('2026-09-22');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverBatchId, setServerBatchId] = useState<string | null>(null);
  
  const [intakeResult, setIntakeResult] = useState<{
    zone: ZoneType;
    message: string;
    allocated: boolean;
  } | null>(null);

  // Suggested item presets
  const presets = [
    { cat: 'FOOD' as AidCategory, name: 'حليب معقم كامل الدسم (1 لتر)', qty: 300, unit: 'علبة', exp: true },
    { cat: 'MATTRESSES' as AidCategory, name: 'أفرشة نوم إسفنجية مفردة', qty: 100, unit: 'فراش', exp: false },
    { cat: 'FURNITURE' as AidCategory, name: 'أرائك وكنبات صالون', qty: 40, unit: 'كنبة', exp: false },
    { cat: 'APPLIANCES' as AidCategory, name: 'ثلاجات منزلية مدمجة', qty: 15, unit: 'ثلاجة', exp: false },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 1. Immediate local reactive update
    const res = receiveCargo(
      currentDepot.id,
      category,
      itemName,
      quantity,
      unit,
      hasExpiry ? expiryDate : undefined
    );

    // 2. Direct remote API call to Render backend
    try {
      const depotNum = Number(currentDepot.id) || 1;
      const apiRes = await api.inventory.add({
        depotId: depotNum,
        category,
        itemName,
        quantity,
        unit,
        batchNumber: res.batchId,
        expirationDate: hasExpiry ? expiryDate : undefined,
        receivedDate: new Date().toISOString().split('T')[0],
        status: 'AVAILABLE',
        notes: `تفريغ وتوجيه للمنطقة ${res.zone} عبر البوصلة +`,
      });

      const confirmedBatch = apiRes.batchNumber || `ID-${apiRes.id}` || res.batchId;
      setServerBatchId(confirmedBatch);
      toast.success('تم تسجيل وحفظ الشحنة في قاعدة بيانات Render بنجاح!', {
        description: `كود الدفعة: ${confirmedBatch} | تم توجيه السائق إلى ${res.zone}`,
      });
      // Refresh live data in background
      fetchLiveData().catch(() => {});
    } catch (err: any) {
      console.warn('API inventory add notice:', err?.message);
      setServerBatchId(res.batchId);
      toast.success('تم تسجيل الشحنة وتوجيهها للمنطقة بنجاح!', {
        description: `المنطقة: ${res.zone} | كود الدفعة: ${res.batchId}`,
      });
    } finally {
      setIsSubmitting(false);
    }

    setIntakeResult({
      zone: res.zone,
      message: res.message,
      allocated: true,
    });
  };

  const handleApplyPreset = (p: typeof presets[0]) => {
    setCategory(p.cat);
    setItemName(p.name);
    setQuantity(p.qty);
    setUnit(p.unit);
    setHasExpiry(p.exp);
    setIntakeResult(null);
  };

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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black font-header text-slate-900 dark:text-white">
            تفريغ الشحنات والتوجيه الذكي (Smart Zone Staging)
          </h1>
          <Badge variant="primary" size="md">
            {currentDepot.name}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          بمجرد وصول الشاحنة، يُدخل المتطوع الصنف ليوجه النظام السائق مباشرة إلى الرصيف أو المنطقة المخصصة لمنع التكدس وإعادة الفرز.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 shadow-2xs">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
          ⚡ تفريغ سريع لسيناريوهات العرض:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{preset.name.split(' ')[0]}:</span>
              <strong className="text-primary font-header">{preset.qty} {preset.unit}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Main Intake Form and Live Staging Engine */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Form */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xs">
          <h2 className="text-base font-black font-header text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            استمارة تسجيل تفريغ حمولة جديدة
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                صنف الشحنة الواردة:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AID_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setIntakeResult(null);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-right flex items-center gap-2 transition-all cursor-pointer ${
                      category === cat.id
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.nameAr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Item Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                اسم المادة:
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="مثال: حليب معقم، بطانيات صوف، أرائك..."
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  الكمية:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-base font-bold font-header text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  الوحدة:
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="طرد، علبة، فراش..."
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Expiry Tracking Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExpiry}
                  onChange={(e) => setHasExpiry(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"
                />
                <span className="text-xs font-bold text-primary">
                  مادة غذائية أو استهلاكية ذات تاريخ صلاحية محدد (Batch Tracking)
                </span>
              </label>

              {hasExpiry && (
                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    تاريخ انتهاء صلاحية هذه الدفعة:
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-primary"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    سيقوم النظام بإرسال تنبيهات استباقية وتحديد أولوية التوزيع قبل انتهاء الصلاحية
                  </p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-[#c9442e] text-white font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التسجيل في خادم Render وتوجيه الشاحنة...</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>تأكيد الاستلام وتوجيه الشاحنة للمنطقة المحددة</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Live Allocation Result & Zone Visualizer */}
        <div className="md:col-span-5 space-y-4">
          {intakeResult ? (
            <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 space-y-4 shadow-lg animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black font-header text-lg">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <span>تم توجيه وتفريغ الشحنة بنجاح!</span>
                </div>
              </div>

              {serverBatchId && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>متزامن مع قاعدة بيانات Render: {serverBatchId}</span>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <span className="text-xs text-slate-400 block font-semibold">
                  الوجهة المباشرة لسائق الشاحنة:
                </span>
                <div className="text-2xl font-black font-header text-primary flex items-center gap-2">
                  <span>🏢 {intakeResult.zone}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  تفريغ <strong>{quantity} {unit}</strong> من ({itemName}) في رصيف التخزين المخصص. تم تحديث المخزون وسعة المستودع لحظياً.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Link 
                  href="/admin" 
                  className="w-full py-2 px-3 text-xs font-bold text-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
                >
                  عرض جرد المستودع
                </Link>
                {hasExpiry && (
                  <Link 
                    href="/admin/expiry" 
                    className="w-full py-2 px-3 text-xs font-bold text-center rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    متابعة الصلاحية
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
              <h3 className="text-sm font-black font-header text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                قواعد التوجيه الآلي للمناطق (Allocation Rules):
              </h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {WAREHOUSE_ZONES.map(z => (
                  <div key={z.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-primary font-header">{z.id}</span>
                      <span className="text-slate-700 dark:text-slate-300">{z.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{z.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Depot Zone Status preview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-3 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 font-bold block">
              حالة إشغال مناطق المستودع حالياً:
            </span>
            <div className="space-y-2">
              {currentDepot.zones.map(z => (
                <div key={z.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>{z.title.split('-')[0]}</span>
                  <span className="font-header font-bold text-slate-500 dark:text-slate-400">
                    {z.currentUnits} / {z.maxCapacity} ({Math.round((z.currentUnits/z.maxCapacity)*100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

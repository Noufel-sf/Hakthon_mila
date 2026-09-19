'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRelief } from '@/lib/store';
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
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function SmartIntakePage() {
  const { depots, selectedDepotId, receiveCargo, getDepot } = useRelief();
  const currentDepot = getDepot(selectedDepotId) || depots[0];

  const [category, setCategory] = useState<AidCategory>('food');
  const [itemName, setItemName] = useState<string>('حليب معقم 1 لتر');
  const [quantity, setQuantity] = useState<number>(300);
  const [unit, setUnit] = useState<string>('علبة');
  const [hasExpiry, setHasExpiry] = useState<boolean>(true);
  const [expiryDate, setExpiryDate] = useState<string>('2026-09-22');
  
  const [intakeResult, setIntakeResult] = useState<{
    zone: ZoneType;
    message: string;
    allocated: boolean;
  } | null>(null);

  // Suggested item presets
  const presets = [
    { cat: 'food' as AidCategory, name: 'حليب معقم كامل الدسم (1 لتر)', qty: 300, unit: 'علبة', exp: true },
    { cat: 'bedding' as AidCategory, name: 'أفرشة نوم إسفنجية مفردة', qty: 100, unit: 'فراش', exp: false },
    { cat: 'furniture' as AidCategory, name: 'أرائك وكنبات صالون', qty: 40, unit: 'كنبة', exp: false },
    { cat: 'appliances' as AidCategory, name: 'ثلاجات منزلية مدمجة', qty: 15, unit: 'ثلاجة', exp: false },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = receiveCargo(
      currentDepot.id,
      category,
      itemName,
      quantity,
      unit,
      hasExpiry ? expiryDate : undefined
    );

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
            التفريغ والتوجيه الذكي للمناطق (Smart Zone Staging)
          </h1>
          <Badge variant="amber" size="md">
            {currentDepot.name}
          </Badge>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          بمجرد وصول الشاحنة، يُدخل المتطوع الصنف ليوجه النظام السائق مباشرة إلى الرصيف أو المنطقة المخصصة لمنع التكدس وإعادة الفرز.
        </p>
      </div>

      {/* Preset Buttons for Live Pitch */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
        <span className="text-xs text-slate-400 font-semibold block">
          ⚡ تفريغ سريع لسيناريوهات العرض أمام الحكام:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1.5"
            >
              <span>{preset.name.split(' ')[0]}:</span>
              <strong className="text-amber-400 font-mono">{preset.qty} {preset.unit}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Main Intake Form and Live Staging Engine */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Form */}
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            استمارة تسجيل تفريغ حمولة جديدة
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
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
                    className={`p-2.5 rounded-xl border text-xs font-bold text-right flex items-center gap-2 transition-all ${
                      category === cat.id
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
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
              <label className="text-xs font-semibold text-slate-300 block">
                اسم المادة:
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="مثال: حليب معقم، بطانيات صوف، أرائك..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  الكمية:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  الوحدة:
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="طرد، علبة، فراش..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Expiry Tracking Toggle */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExpiry}
                  onChange={(e) => setHasExpiry(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span className="text-xs font-bold text-amber-300">
                  مادة غذائية أو استهلاكية ذات تاريخ صلاحية محدد (Batch Tracking)
                </span>
              </label>

              {hasExpiry && (
                <div className="space-y-1 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-400 block flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    تاريخ انتهاء صلاحية هذه الدفعة:
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    سيقوم النظام بإرسال تنبيهات استباقية وتحديد أولوية التوزيع قبل انتهاء الصلاحية
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2">
              <Package className="w-4 h-4" />
              <span>تأكيد الاستلام وتوجيه الشاحنة للمنطقة المحددة</span>
            </Button>
          </form>
        </div>

        {/* Right Side: Live Allocation Result & Zone Visualizer */}
        <div className="md:col-span-5 space-y-4">
          {intakeResult ? (
            <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-slate-900 to-emerald-950/30 p-6 space-y-4 shadow-2xl animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-lg">
                <CheckCircle2 className="w-6 h-6" />
                <span>تم توجيه وتفريغ الشحنة بنجاح!</span>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs text-slate-400 block font-semibold">
                  الوجهة المباشرة لسائق الشاحنة:
                </span>
                <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
                  <span>🏢 {intakeResult.zone}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تفريغ <strong>{quantity} {unit}</strong> من ({itemName}) في رصيف التخزين المخصص. تم تحديث المخزون وسعة المستودع لحظياً.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/admin" className="w-full">
                  <Button variant="secondary" className="w-full text-xs">
                    عرض جرد المستودع المحدث
                  </Button>
                </Link>
                {hasExpiry && (
                  <Link href="/admin/expiry" className="w-full">
                    <Button variant="outline" className="w-full text-xs text-rose-300 border-rose-500/30">
                      متابعة الصلاحية
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                قواعد التوجيه الآلي للمناطق (Allocation Rules):
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                {WAREHOUSE_ZONES.map(z => (
                  <div key={z.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-amber-400">{z.id}</span>
                      <span className="text-slate-400">{z.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{z.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Depot Zone Status preview */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
            <span className="text-slate-400 font-semibold block">
              حالة إشغال مناطق المستودع حالياً:
            </span>
            {currentDepot.zones.map(z => (
              <div key={z.id} className="flex items-center justify-between text-slate-300">
                <span>{z.title.split('-')[0]}</span>
                <span className="font-mono text-slate-400">
                  {z.currentUnits} / {z.maxCapacity} ({Math.round((z.currentUnits/z.maxCapacity)*100)}%)
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

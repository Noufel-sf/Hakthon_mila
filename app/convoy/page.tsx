'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRelief } from '@/lib/store';
import { AidCategory } from '@/lib/types';
import { AID_CATEGORIES } from '@/lib/constants';
import { 
  Truck, 
  MapPin, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  Sparkles, 
  Navigation,
  ArrowLeft,
  Warehouse,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function ConvoyRouterPage() {
  const { depots, getZoneForCategory } = useRelief();

  const [selectedCategory, setSelectedCategory] = useState<AidCategory>('furniture');
  const [cargoItemName, setCargoItemName] = useState<string>('أرائك وكنبات صالون (Sofas)');
  const [cargoQuantity, setCargoQuantity] = useState<number>(80);
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);
  const [confirmedDestination, setConfirmedDestination] = useState<string | null>(null);

  // Quick preset cargo items for fast demo during hackathon pitch!
  const presets = [
    {
      category: 'furniture' as AidCategory,
      name: 'أرائك وكنبات صالون (Sofas)',
      qty: 80,
      note: 'مثال الفكرة: نقص 80 أريكة بجيجل',
    },
    {
      category: 'bedding' as AidCategory,
      name: 'أغطية وبطانيات صوفية (Blankets)',
      qty: 300,
      note: 'نقص 300 بطانية بجيجل',
    },
    {
      category: 'appliances' as AidCategory,
      name: 'ثلاجات منزلية مدمجة (Fridges)',
      qty: 25,
      note: 'نقص 25 ثلاجة بجيجل',
    },
    {
      category: 'food' as AidCategory,
      name: 'طرود غذائية متكاملة (Food Parcels)',
      qty: 500,
      note: 'اختبار الفائض (مكتفي بجيجل، ناقص بميلة)',
    },
  ];

  // Calculate recommendation ranking for this cargo
  const depotEvaluations = depots.map(depot => {
    // Find matching item in this depot
    const matchingItem = depot.items.find(
      i => i.category === selectedCategory || i.name.toLowerCase().includes(cargoItemName.toLowerCase())
    );

    let deficit = 0;
    let currentStock = 0;
    let targetNeed = 0;
    let isSurplus = false;

    if (matchingItem) {
      currentStock = matchingItem.currentStock;
      targetNeed = matchingItem.targetNeed;
      deficit = Math.max(0, targetNeed - currentStock);
      isSurplus = currentStock >= targetNeed;
    } else {
      deficit = 50; // default estimated need
    }

    // Match score: higher deficit means better destination
    return {
      depot,
      matchingItem,
      deficit,
      currentStock,
      targetNeed,
      isSurplus,
      assignedZone: getZoneForCategory(selectedCategory),
    };
  });

  // Sort: highest deficit first
  const sortedDepots = [...depotEvaluations].sort((a, b) => b.deficit - a.deficit);
  const topRecommendation = sortedDepots[0];
  const surplusDepots = sortedDepots.filter(d => d.isSurplus);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSelectedCategory(p.category);
    setCargoItemName(p.name);
    setCargoQuantity(p.qty);
    setHasCalculated(true);
    setConfirmedDestination(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      
      {/* Page Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
          <Truck className="w-4 h-4" />
          <span>الموجّه الذكي للشاحنات والقوافل الشعبية</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          وجّه قافلتك: <span className="text-amber-400">لا تتبرع عشوائياً!</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          أدخل محتويات شاحنتك لمعرفة أي مستودع يعاني عجزاً حقيقياً فيها، 
          وتجنب التوجه للمستودعات التي حققت الاكتفاء حتى لا تتكدس المساعدات أو تفسد.
        </p>
      </div>

      {/* Cargo Presets for Hackathon Judges */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
        <span className="text-xs text-slate-400 font-semibold block">
          ⚡ سيناريوهات سريعة للتجربة أثناء العرض (Hackathon Demo Presets):
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-all text-right flex items-center gap-2"
            >
              <span className="font-bold text-amber-400">{preset.name.split(' ')[0]}:</span>
              <span>{preset.qty} وحدة</span>
              <span className="text-[10px] text-slate-400">({preset.note})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form and Recommendation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Cargo Input Form */}
        <div className="lg:col-span-5 space-y-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            بيانات حمولة القافلة / الشاحنة
          </h2>

          {/* Category Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              نوع وصنف المساعدات المحمولة:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AID_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setConfirmedDestination(null);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold text-right flex items-center gap-2 transition-all ${
                    selectedCategory === cat.id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="truncate">{cat.nameAr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Specific item name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              اسم المادة بالتحديد:
            </label>
            <input
              type="text"
              value={cargoItemName}
              onChange={(e) => setCargoItemName(e.target.value)}
              placeholder="مثال: أرائك صالون، بطانيات، أفرشة، حليب..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              الكمية المتوفرة بالشاحنة (العدد أو الوحدات):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={cargoQuantity}
                onChange={(e) => setCargoQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-amber-400"
              />
              <span className="text-sm font-semibold text-slate-400 shrink-0">وحدة / طرد</span>
            </div>
          </div>

          {/* Pre-assigned Zone Notice */}
          <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
            <span className="text-amber-400 font-bold block">
              منطقة التفريغ المقترحة بالمستودع:
            </span>
            <p>
              عند وصولك، سيتم توجيه هذه الشحنة تلقائياً إلى{' '}
              <strong className="text-white font-mono">{getZoneForCategory(selectedCategory)}</strong>{' '}
              لتفادي خلط المساعدات وسرعة الفرز.
            </p>
          </div>
        </div>

        {/* Right Side: Smart Recommendation Results */}
        <div className="lg:col-span-7 space-y-6">
          {topRecommendation && (
            <div className="rounded-3xl border-2 border-amber-500/80 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 p-6 sm:p-8 relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 text-xs font-extrabold px-4 py-1.5 rounded-br-2xl flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-4 h-4" />
                <span>الوجهة الأنسب الموصى بها أولاً</span>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {topRecommendation.depot.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{topRecommendation.depot.address}</span>
                    </p>
                  </div>
                  <Badge variant="rose" size="lg">
                    عجز حاد في هذا الصنف
                  </Badge>
                </div>

                {/* Analysis of the Match */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">الموجود حالياً</span>
                      <span className="font-mono font-bold text-base text-slate-200">
                        {topRecommendation.currentStock}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">الاحتياج المقدر</span>
                      <span className="font-mono font-bold text-base text-slate-200">
                        {topRecommendation.targetNeed}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <span className="text-rose-400 block text-[11px]">العجز المطلوب</span>
                      <span className="font-mono font-bold text-base text-rose-400">
                        {topRecommendation.deficit}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-300 flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      حمولة شاحنتك (<strong>{cargoQuantity} وحدة</strong>) ستغطي{' '}
                      <strong>
                        {Math.min(100, Math.round((cargoQuantity / (topRecommendation.deficit || 1)) * 100))}%
                      </strong>{' '}
                      من النقص الحرج المسجل في هذا المستودع وتلبي حاجة العائلات المتضررة فوراً!
                    </span>
                  </p>
                </div>

                {/* Contact and Navigation Details */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>المسؤول الميداني: {topRecommendation.depot.manager}</span>
                    </div>
                    <div className="font-mono text-slate-400" dir="ltr">
                      {topRecommendation.depot.phone}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {confirmedDestination === topRecommendation.depot.id ? (
                      <div className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-bounce">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم تأكيد توجه القافلة! في انتظاركم بالمستودع</span>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setConfirmedDestination(topRecommendation.depot.id);
                          toast.success(`تم تأكيد توجيه القافلة بنجاح إلى ${topRecommendation.depot.name}!`, {
                            description: `حمولة ${cargoQuantity} وحدة موجهة إلى ${topRecommendation.assignedZone}. شكراً لعطائكم!`,
                          });
                        }}
                      >
                        <Navigation className="w-4 h-4" />
                        <span>تأكيد توجه شاحنتي لهذا المستودع</span>
                      </Button>
                    )}

                    <Link href={`/depots/${topRecommendation.depot.id}`}>
                      <Button variant="outline">
                        <span>عرض الجرد الكامل</span>
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Warning on Surplus Depots */}
          {surplusDepots.length > 0 && (
            <div className="rounded-2xl border border-blue-900/50 bg-blue-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <AlertCircle className="w-4 h-4 text-blue-400" />
                <span>مستودعات لا يُنصح بالتوجه إليها بهذه الحمولة (لتحقيق الاكتفاء أو الفائض):</span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                {surplusDepots.map(s => (
                  <div key={s.depot.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                    <span>{s.depot.name}</span>
                    <span className="text-blue-400 font-bold">
                      المتوفر: {s.currentStock} / الاحتياج: {s.targetNeed} (فائض ومستقر ✅)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Alternative Depots */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-300">
              خيارات وبدائل أخرى للمستودعات:
            </h4>
            <div className="space-y-2">
              {sortedDepots.slice(1).map(item => (
                <div 
                  key={item.depot.id}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between hover:border-slate-700 transition-all text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{item.depot.name}</span>
                    <span className="text-slate-400">ولاية {item.depot.wilaya} — {item.depot.address}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-400 block">العجز المسجل:</span>
                    <span className={`font-mono font-bold ${item.deficit > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.deficit > 0 ? `نقص ${item.deficit} وحدة` : 'مكتفي ✅'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

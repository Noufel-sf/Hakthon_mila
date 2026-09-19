'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRelief } from '@/lib/store';
import { AidCategory } from '@/lib/types';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  AlertCircle, 
  MapPin, 
  Phone, 
  UserCheck, 
  History,
  Sparkles,
  Barcode
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function FamilyIDRegistryPage() {
  const { 
    families, 
    depots, 
    selectedDepotId, 
    getFamily, 
    distributeToFamily, 
    registerFamily 
  } = useRelief();

  const [searchQuery, setSearchQuery] = useState<string>('JIJ-AID-82931');
  const [activeFamily, setActiveFamily] = useState(getFamily('JIJ-AID-82931') || families[0]);

  // Distribution form state
  const [distributeItemName, setDistributeItemName] = useState<string>('ثلاجة منزلية مدمجة (Refrigerator)');
  const [distributeCategory, setDistributeCategory] = useState<AidCategory>('appliances');
  const [distributeQty, setDistributeQty] = useState<number>(1);
  const [distributeUnit, setDistributeUnit] = useState<string>('ثلاجة');
  const [distributionSuccess, setDistributionSuccess] = useState<string | null>(null);

  // New Family Form state
  const [showNewFamilyModal, setShowNewFamilyModal] = useState<boolean>(false);
  const [newHeadName, setNewHeadName] = useState<string>('');
  const [newFamilyName, setNewFamilyName] = useState<string>('');
  const [newNatId, setNewNatId] = useState<string>('');
  const [newWilaya, setNewWilaya] = useState<string>('جيجل');
  const [newMembers, setNewMembers] = useState<number>(4);
  const [newPhone, setNewPhone] = useState<string>('');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const found = getFamily(searchQuery);
    if (found) {
      setActiveFamily(found);
      setDistributionSuccess(null);
    } else {
      alert('لم يتم العثور على معرّف عائلة بهذا الرقم');
    }
  };

  const handleSelectPreset = (id: string) => {
    setSearchQuery(id);
    const found = getFamily(id);
    if (found) {
      setActiveFamily(found);
      setDistributionSuccess(null);
    }
  };

  const handleDistribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFamily) return;

    const res = distributeToFamily(activeFamily.id, selectedDepotId, [
      {
        itemName: distributeItemName,
        category: distributeCategory,
        quantity: distributeQty,
        unit: distributeUnit,
      },
    ]);

    setDistributionSuccess(res.message);
    // Refresh active family
    const updated = getFamily(activeFamily.id);
    if (updated) setActiveFamily(updated);
  };

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `${newWilaya.substring(0, 3).toUpperCase()}-AID-${Math.floor(10000 + Math.random() * 90000)}`;
    const created = registerFamily({
      id: newId,
      nationalId: newNatId || `${Date.now()}`,
      headName: newHeadName,
      familyName: newFamilyName,
      wilaya: newWilaya,
      municipality: 'المركز',
      phone: newPhone || '0550 00 00 00',
      familyMembers: newMembers,
      damageLevel: 'severe',
      registrationDate: new Date().toISOString().split('T')[0],
    });

    setActiveFamily(created);
    setSearchQuery(created.id);
    setShowNewFamilyModal(false);
    alert(`تم إصدار بطاقة إغاثة جديدة برقم: ${created.id}`);
  };

  // Check received items status for prompt example
  const mattressesCount = activeFamily?.receivedAids
    .filter(a => a.itemName.includes('فراش') || a.category === 'bedding')
    .reduce((sum, a) => sum + a.quantity, 0) || 0;

  const blanketsCount = activeFamily?.receivedAids
    .filter(a => a.itemName.includes('بطانية') || a.itemName.includes('أغطية'))
    .reduce((sum, a) => sum + a.quantity, 0) || 0;

  const fridgeCount = activeFamily?.receivedAids
    .filter(a => a.itemName.includes('ثلاجة') || a.itemName.includes('Refrigerator'))
    .reduce((sum, a) => sum + a.quantity, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>منظومة بطاقة الإغاثة الموحدة لمنع الازدواجية والتكرار</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            بطاقة العائلة الموحدة <span className="text-emerald-400">(One Family ID)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            سجل موحد يربط المستفيد برقم هويته أو معرّف الإغاثة لتتبع ما استلمته كل عائلة عبر جميع نقاط التوزيع وضمان العدالة.
          </p>
        </div>

        <Button 
          variant="primary" 
          onClick={() => setShowNewFamilyModal(true)}
          className="shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إصدار بطاقة إغاثة لعائلة جديدة</span>
        </Button>
      </div>

      {/* Quick Search and Hackathon Presets */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الإغاثة (مثال: JIJ-AID-82931) أو برقم التعريف الوطني..."
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pr-11 pl-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <Button type="submit" variant="secondary">
            <span>فحص السجل</span>
          </Button>
        </form>

        {/* Demo Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold">عائلات تجريبية للعرض:</span>
          {families.map(fam => (
            <button
              key={fam.id}
              onClick={() => handleSelectPreset(fam.id)}
              className={`px-3 py-1 rounded-xl border transition-all ${
                activeFamily?.id === fam.id
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {fam.headName} ({fam.id})
            </button>
          ))}
        </div>
      </div>

      {/* Beneficiary Details View */}
      {activeFamily && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Family ID Digital Card & Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Visual Digital Aid Card */}
            <div className="rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <Barcode className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-300 tracking-wider">بطاقة الإغاثة الموحدة</span>
                </div>
                <Badge variant="emerald" size="md" className="font-mono">
                  {activeFamily.id}
                </Badge>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">ربّ الأسرة / المستفيد:</span>
                <h2 className="text-2xl font-black text-white">{activeFamily.headName}</h2>
                <p className="text-xs text-slate-300">عائلة {activeFamily.familyName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">الولاية / البلدية</span>
                  <span className="font-bold text-slate-200">
                    {activeFamily.wilaya} — {activeFamily.municipality}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">عدد أفراد الأسرة</span>
                  <span className="font-bold text-slate-200">
                    {activeFamily.familyMembers} أفراد
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">رقم التعريف الوطني</span>
                  <span className="font-mono text-slate-200 text-[11px] truncate block">
                    {activeFamily.nationalId}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">رقم الهاتف</span>
                  <span className="font-mono text-slate-200" dir="ltr">
                    {activeFamily.phone}
                  </span>
                </div>
              </div>

              {/* Exact Prompt Scenario Matrix */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-300 font-bold block">
                  مصفوفة الاستحقاق الميداني (حسب سجل الكارثة):
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      الأفرشة (Mattresses):
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      استفاد من {mattressesCount} أفرشة ✅
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      الأغطية والبطانيات (Blankets):
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      استفاد من {blanketsCount} أغطية ✅
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      {fridgeCount > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      الثلاجة والأجهزة (Refrigerator):
                    </span>
                    <span className={`font-bold font-mono ${fridgeCount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {fridgeCount > 0 ? `استفاد من ${fridgeCount} ثلاجة ✅` : 'لم يستفد بعد ❌ (أولوية)'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Form to Distribute an Item to this Family */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                تسجيل تسليم مساعدة جديدة لهذه العائلة
              </h3>

              {distributionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{distributionSuccess}</span>
                </div>
              )}

              <form onSubmit={handleDistribute} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">المادة المسلمة:</label>
                  <input
                    type="text"
                    required
                    value={distributeItemName}
                    onChange={(e) => setDistributeItemName(e.target.value)}
                    placeholder="مثال: ثلاجة منزلية مدمجة، طرد غذائي..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold block">الكمية:</label>
                    <input
                      type="number"
                      min="1"
                      value={distributeQty}
                      onChange={(e) => setDistributeQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold block">الوحدة:</label>
                    <input
                      type="text"
                      value={distributeUnit}
                      onChange={(e) => setDistributeUnit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <Button type="submit" variant="success" className="w-full text-xs">
                  <span>تأكيد التسليم وحفظ السجل الموحد</span>
                </Button>
              </form>
            </div>

          </div>

          {/* Right Column: Historical Distribution Records */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  سجل الاستفادة الكامل عبر جميع المستودعات
                </h3>
                <p className="text-xs text-slate-400">
                  أي استفادة سابقة في أي مستودع تظهر هنا مباشرة لمنع الاستفادة المكررة
                </p>
              </div>
              <Badge variant="slate" size="sm">
                {activeFamily.receivedAids.length} عمليات تسليم
              </Badge>
            </div>

            {activeFamily.receivedAids.length > 0 ? (
              <div className="space-y-3">
                {activeFamily.receivedAids.map((aid) => (
                  <div
                    key={aid.id}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-base">
                          {aid.itemName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                          {aid.quantity} {aid.unit}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        نقطة الاستلام: <strong className="text-slate-200">{aid.depotName}</strong>
                      </p>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 block" dir="ltr">
                        {aid.date}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        مسجلة بالنظام المركزي
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                لم تسجل هذه العائلة أي استفادة حتى الآن.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modal: Register New Family */}
      {showNewFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              إصدار معرّف إغاثة جديد لعائلة متضررة
            </h3>

            <form onSubmit={handleCreateFamily} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">اسم رب الأسرة:</label>
                <input
                  type="text"
                  required
                  value={newHeadName}
                  onChange={(e) => setNewHeadName(e.target.value)}
                  placeholder="مثال: يوسف بلقاسم"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">اللقب العائلي:</label>
                  <input
                    type="text"
                    required
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder="بلقاسم"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">عدد الأفراد:</label>
                  <input
                    type="number"
                    min="1"
                    value={newMembers}
                    onChange={(e) => setNewMembers(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">الولاية:</label>
                  <input
                    type="text"
                    value={newWilaya}
                    onChange={(e) => setNewWilaya(e.target.value)}
                    placeholder="جيجل أو ميلة..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0661 00 00 00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">رقم التعريف الوطني (إن وُجد):</label>
                <input
                  type="text"
                  value={newNatId}
                  onChange={(e) => setNewNatId(e.target.value)}
                  placeholder="1987..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewFamilyModal(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  توليد البطاقة وتثبيتها
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

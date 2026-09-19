'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRelief } from '@/lib/store';
import ZoneMapVisualizer from '@/components/ZoneMapVisualizer';
import { 
  Warehouse, 
  Layers, 
  Clock, 
  Users, 
  PlusCircle, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2,
  Package,
  Edit3,
  TrendingDown,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const { depots, selectedDepotId, setSelectedDepotId, getDepot, updateDepotItem } = useRelief();
  const currentDepot = getDepot(selectedDepotId) || depots[0];

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editTarget, setEditTarget] = useState<number>(0);

  const startEdit = (item: typeof currentDepot.items[0]) => {
    setEditingItemId(item.id);
    setEditStock(item.currentStock);
    setEditTarget(item.targetNeed);
  };

  const saveEdit = (itemId: string) => {
    updateDepotItem(currentDepot.id, itemId, editStock, editTarget);
    setEditingItemId(null);
    toast.success('تم تحديث بيانات المخزون والاحتياج بنجاح!');
  };

  // Find expiring items in this depot
  const expiringBatches = currentDepot.batches.filter(b => b.status === 'expiring_soon');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      
      {/* Header with Depot Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="indigo" size="sm">
              نظام إدارة المستودع الذكي
            </Badge>
            <Badge variant="slate" size="sm" className="font-mono">
              Smart Staging & Ops
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            لوحة تسيير المستودع: {currentDepot.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            الموقع: {currentDepot.address} — مسؤول المستودع: {currentDepot.manager}
          </p>
        </div>

        {/* Switch Depot Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-semibold shrink-0">
            التبديل إلى مستودع آخر:
          </label>
          <select
            value={currentDepot.id}
            onChange={(e) => setSelectedDepotId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            {depots.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.wilaya})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Action Hub for Warehouse Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Action 1: Smart Cargo Intake (Zone Allocation) */}
        <Link 
          href="/admin/intake"
          className="group rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/20 p-5 hover:border-amber-500 transition-all hover:shadow-xl hover:shadow-amber-950/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
            تفريغ شحنة وتوجيه المناطق (Smart Zone Staging)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            وصول شاحنة جديدة وتوجيه المواد تلقائياً لـ Zone A / B / C / D لمنع خلط المساعدات.
          </p>
        </Link>

        {/* Action 2: Expiry Tracker */}
        <Link 
          href="/admin/expiry"
          className="group rounded-2xl border border-rose-500/30 bg-gradient-to-br from-slate-900 to-rose-950/20 p-5 hover:border-rose-500 transition-all hover:shadow-xl hover:shadow-rose-950/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {expiringBatches.length} تنبيهات عاجلة
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
            تتبع تواريخ الصلاحية (Batch & Expiration)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            إدارة دفعات الحليب والأغذية سريعة التلف والتوزيع الفوري قبل الهدر.
          </p>
        </Link>

        {/* Action 3: Convoy Traffic & Guidance */}
        <Link 
          href="/convoy"
          className="group rounded-2xl border border-sky-500/30 bg-gradient-to-br from-slate-900 to-sky-950/20 p-5 hover:border-sky-500 transition-all hover:shadow-xl hover:shadow-sky-950/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-sky-400 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
            موجّه القوافل والشاحنات الواردة
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            متابعة توجيه الشاحنات نحو المستودعات الأكثر عجزاً ومنع تدفق السلع الفائضة.
          </p>
        </Link>
      </div>

      {/* Warehouse Management Tabs */}
      <Tabs defaultValue="zones" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="zones">المخطط الهيكلي والمناطق (Zones)</TabsTrigger>
          <TabsTrigger value="inventory">جدول تعديل المخزون (Stock)</TabsTrigger>
        </TabsList>

        {/* Tab 1: Warehouse Zones */}
        <TabsContent value="zones" className="mt-0">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <ZoneMapVisualizer 
              zones={currentDepot.zones} 
              items={currentDepot.items}
            />
          </div>
        </TabsContent>

        {/* Tab 2: Stock Management */}
        <TabsContent value="inventory" className="mt-0">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  إدارة المخزون وتحديد الاحتياجات التقديرية
                </h3>
                <p className="text-xs text-slate-400">
                  يمكنك تعديل المخزون الحالي أو رفع سقف الاحتياج ليعكس الوضع الحقيقي فوراً على الواجهة العامة
                </p>
              </div>
              <Link href="/admin/intake">
                <Button variant="primary" size="sm">
                  <PlusCircle className="w-4 h-4" />
                  <span>تسجيل تفريغ شحنة جديدة</span>
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-800 text-xs text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">المادة</th>
                    <th className="py-3 px-4">المنطقة</th>
                    <th className="py-3 px-4">المخزون الفعلي</th>
                    <th className="py-3 px-4">سقف الاحتياج</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {currentDepot.items.map((item) => {
                    const isEditing = editingItemId === item.id;
                    const deficit = item.targetNeed - item.currentStock;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-white">
                          {item.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs text-slate-400">
                            {item.assignedZone}
                          </span>
                        </td>

                        {/* Current Stock */}
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                              className="w-24 bg-slate-950 border border-amber-500 rounded px-2 py-1 text-sm font-mono text-white"
                            />
                          ) : (
                            <span className="font-mono font-bold text-base">
                              {item.currentStock} {item.unit}
                            </span>
                          )}
                        </td>

                        {/* Target Need */}
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editTarget}
                              onChange={(e) => setEditTarget(parseInt(e.target.value) || 0)}
                              className="w-24 bg-slate-950 border border-amber-500 rounded px-2 py-1 text-sm font-mono text-white"
                            />
                          ) : (
                            <span className="font-mono text-slate-400">
                              {item.targetNeed} {item.unit}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {deficit > 0 ? (
                            <span className="text-xs font-bold text-rose-400">
                              عجز: {deficit} {item.unit}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-400">
                              مكتفي ✅
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => saveEdit(item.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                              >
                                حفظ
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                              title="تعديل الأرقام"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}

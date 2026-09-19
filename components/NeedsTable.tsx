'use client';

import React from 'react';
import { DepotItem } from '@/lib/types';
import { CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp, HelpCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface NeedsTableProps {
  items: DepotItem[];
  showZone?: boolean;
}

export default function NeedsTable({ items, showZone = true }: NeedsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-xl">
      <table className="w-full text-right text-sm">
        <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
          <tr>
            <th className="py-3.5 px-4 font-semibold text-slate-200">المادة / الصنف</th>
            <th className="py-3.5 px-4 font-semibold text-slate-200">الموجود حالياً</th>
            <th className="py-3.5 px-4 font-semibold text-slate-200">الاحتياج المقدر</th>
            <th className="py-3.5 px-4 font-semibold text-slate-200">حالة النقص / الوفرة</th>
            {showZone && <th className="py-3.5 px-4 font-semibold text-slate-200">منطقة التخزين</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-300">
          {items.map((item) => {
            const deficit = item.targetNeed - item.currentStock;
            const isSufficient = item.currentStock >= item.targetNeed;
            const isSurplus = item.currentStock >= item.targetNeed * 1.5;
            const fulfillmentPct = Math.min(100, Math.round((item.currentStock / item.targetNeed) * 100));

            return (
              <tr 
                key={item.id} 
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Item Name */}
                <td className="py-3.5 px-4 font-medium text-white flex flex-col">
                  <span className="text-base">{item.name}</span>
                  <span className="text-xs text-slate-400">{item.nameFr}</span>
                </td>

                {/* Available Stock */}
                <td className="py-3.5 px-4 font-mono font-bold text-lg text-slate-100">
                  {item.currentStock.toLocaleString('ar-DZ')}
                  <span className="text-xs font-normal text-slate-400 mr-1.5">{item.unit}</span>
                </td>

                {/* Target Need */}
                <td className="py-3.5 px-4 font-mono text-slate-400">
                  {item.targetNeed.toLocaleString('ar-DZ')}
                  <span className="text-xs font-normal text-slate-400 mr-1.5">{item.unit}</span>
                </td>

                {/* Status / Deficit Badge */}
                <td className="py-3.5 px-4">
                  {deficit > 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                      <span>عجز: {deficit} {item.unit}</span>
                    </div>
                  ) : isSurplus ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>فائض (يرجى التوجيه لمستودع آخر)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>كافي ومستقر ✅</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="w-32 mt-2">
                    <Progress 
                      value={fulfillmentPct} 
                      className="h-1.5 bg-slate-800"
                      indicatorClassName={isSufficient ? "bg-emerald-500" : "bg-rose-500"}
                    />
                  </div>
                </td>

                {/* Storage Zone */}
                {showZone && (
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                      🏢 {item.assignedZone}
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

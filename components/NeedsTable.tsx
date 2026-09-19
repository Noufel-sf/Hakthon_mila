'use client';

import React from 'react';
import { DepotItem } from '@/lib/types';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface NeedsTableProps {
  items: DepotItem[];
  showZone?: boolean;
}

export default function NeedsTable({ items, showZone = true }: NeedsTableProps) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <table className="w-full text-right text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="py-4 px-5">المادة / الصنف</th>
            <th className="py-4 px-5">الموجود حالياً</th>
            <th className="py-4 px-5">الاحتياج المقدر</th>
            <th className="py-4 px-5">حالة النقص / الوفرة</th>
            {showZone && <th className="py-4 px-5">منطقة التخزين</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
          {items.map((item) => {
            const deficit = item.targetNeed - item.currentStock;
            const isSufficient = item.currentStock >= item.targetNeed;
            const isSurplus = item.currentStock >= item.targetNeed * 1.3;
            const fulfillmentPct = Math.min(100, Math.round((item.currentStock / item.targetNeed) * 100));

            return (
              <tr 
                key={item.id} 
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Item Name */}
                <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                  <span className="text-base block">{item.name}</span>
                  <span className="text-xs font-normal text-slate-400">{item.nameFr}</span>
                </td>

                {/* Available Stock */}
                <td className="py-4 px-5 font-mono font-bold text-lg text-slate-900 dark:text-white">
                  {item.currentStock.toLocaleString('ar-DZ')}
                  <span className="text-xs font-normal text-slate-400 mr-1.5">{item.unit}</span>
                </td>

                {/* Target Need */}
                <td className="py-4 px-5 font-mono text-slate-500 dark:text-slate-400">
                  {item.targetNeed.toLocaleString('ar-DZ')}
                  <span className="text-xs font-normal text-slate-400 mr-1.5">{item.unit}</span>
                </td>

                {/* Status / Deficit Badge */}
                <td className="py-4 px-5">
                  {deficit > 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0F2] dark:bg-[#2D0B12] text-[#D21034] dark:text-[#FFA3B0] border border-[#F8B8C2] dark:border-[#52131F]">
                      <span className="h-2 w-2 rounded-full bg-[#D21034] animate-pulse"></span>
                      <span>عجز: {deficit} {item.unit}</span>
                    </div>
                  ) : isSurplus ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF4F0] dark:bg-[#07261C] text-[#006233] dark:text-emerald-300 border border-[#C5DFD6] dark:border-[#0E4734]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>فائض مستقر</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>كافي ومستقر ✅</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="w-32 mt-2">
                    <Progress 
                      value={fulfillmentPct} 
                      className="h-1.5 bg-slate-100 dark:bg-slate-800"
                      indicatorClassName={isSufficient ? "bg-[#006233]" : "bg-[#D21034]"}
                    />
                  </div>
                </td>

                {/* Storage Zone */}
                {showZone && (
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
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

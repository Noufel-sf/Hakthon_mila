'use client';

import React from 'react';
import { Radio } from 'lucide-react';
import { useReliefStore } from '@/lib/store';

export default function LiveCrisisTicker() {
  const depots = useReliefStore((state) => state.depots);

  const urgentNeeds = depots.flatMap(depot => {
    return depot.items
      .filter(item => item.targetNeed - item.currentStock > 0 && item.priority === 'urgent')
      .map(item => ({
        depotName: depot.name,
        wilaya: depot.wilaya,
        itemName: item.name,
        deficit: item.targetNeed - item.currentStock,
        unit: item.unit,
      }));
  });

  return (
    <div className="bg-[#FFF5F3] dark:bg-[#201311] border-b border-[#FDDCD6] dark:border-[#3D1E19] text-[#9A2D1F] dark:text-[#FCA597] text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 font-bold text-[#E0533C] shrink-0 bg-[#FCE9E5] dark:bg-[#341611] px-2.5 py-0.5 rounded-full border border-[#F8CEC6] dark:border-[#4E221B]">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#E0533C]" />
          <span>تحديث ميداني مباشر</span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 text-xs">
          {urgentNeeds.length > 0 ? (
            urgentNeeds.slice(0, 4).map((need, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E0533C]"></span>
                <span className="font-semibold text-slate-900 dark:text-white">{need.wilaya}:</span>
                <span>{need.depotName} بحاجة عاجلة إلى</span>
                <strong className="text-[#E0533C] dark:text-[#F87171] font-bold">
                  {need.deficit} {need.unit} {need.itemName}
                </strong>
              </span>
            ))
          ) : (
            <span>كل المستودعات في حالة توازن نسبي حالياً.</span>
          )}

          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>✅ المواد الغذائية مستقرة، الأولوية للتبرع بالأفرشة والأجهزة المنزلية.</span>
          </span>
        </div>
      </div>
    </div>
  );
}

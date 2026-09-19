'use client';

import React from 'react';
import { AlertCircle, Radio, Sparkles } from 'lucide-react';
import { useRelief } from '@/lib/store';

export default function LiveCrisisTicker() {
  const { depots } = useRelief();

  // Find urgent needs across depots
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
    <div className="bg-rose-950/70 border-b border-rose-800/60 text-rose-200 text-xs sm:text-sm py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 font-bold text-rose-400 shrink-0 bg-rose-900/60 px-2.5 py-0.5 rounded-full border border-rose-700/50">
          <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
          <span>تحديث مباشر</span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 text-xs text-rose-200">
          {urgentNeeds.length > 0 ? (
            urgentNeeds.slice(0, 4).map((need, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                <span className="font-semibold text-rose-100">{need.wilaya}:</span>
                <span>{need.depotName} بحاجة عاجلة إلى</span>
                <strong className="text-white font-bold underline decoration-rose-500">
                  {need.deficit} {need.unit} {need.itemName}
                </strong>
              </span>
            ))
          ) : (
            <span>كل المستودعات في حالة توازن نسبي حالياً.</span>
          )}

          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>✅ تنبيه: المواد الغذائية بجيجل مستقرة وفائضة، يرجى التوجيه للأفرشة والأجهزة.</span>
          </span>
        </div>
      </div>
    </div>
  );
}

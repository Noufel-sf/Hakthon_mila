'use client';

import React from 'react';
import Link from 'next/link';
import { Depot } from '@/lib/types';
import { MapPin, Phone, Warehouse, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DepotCardProps {
  depot: Depot;
  highlightCategory?: string;
}

export default function DepotCard({ depot, highlightCategory }: DepotCardProps) {
  // Calculate critical deficits
  const criticalItems = depot.items.filter(
    item => item.targetNeed - item.currentStock > 0
  );

  const sufficientItems = depot.items.filter(
    item => item.currentStock >= item.targetNeed
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-slate-900/50 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {depot.code}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                ولاية {depot.wilaya}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
              {depot.name}
            </h3>
          </div>

          <div className="text-left shrink-0">
            <span className="text-xs text-slate-400 block">نسبة الاستيعاب</span>
            <span className="text-base font-mono font-bold text-slate-200">
              {depot.totalCapacityPercent}%
            </span>
          </div>
        </div>

        {/* Address and Manager */}
        <div className="space-y-1.5 text-xs text-slate-400 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{depot.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span dir="ltr">{depot.phone}</span>
            <span className="text-slate-400">• {depot.manager}</span>
          </div>
        </div>

        {/* Critical Needs Snapshot */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              أكبر نواقص هذا المستودع:
            </span>
            <span className="text-[11px] text-slate-400">
              {criticalItems.length} أصناف بحاجة لدعم
            </span>
          </div>

          {criticalItems.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {criticalItems.slice(0, 3).map(item => {
                const deficit = item.targetNeed - item.currentStock;
                return (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  >
                    <span>{item.name}:</span>
                    <span className="text-rose-400 underline font-mono">
                      نقص {deficit} {item.unit}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              جميع الاحتياجات الأساسية مغطاة حالياً
            </p>
          )}

          {/* Quick Notice on Sufficient Items */}
          {sufficientItems.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✅ متوفر بكثرة:</span>
              <span>{sufficientItems.map(i => i.name).slice(0, 2).join('، ')} (لا داعي للتبرع به هنا)</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          آخر تحديث: {depot.lastUpdated}
        </span>
        <Link
          href={`/depots/${depot.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-lg transition-all"
        >
          <span>عرض الجرد الكامل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

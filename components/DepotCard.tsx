'use client';

import React from 'react';
import Link from 'next/link';
import { Depot } from '@/lib/types';
import { MapPin, Phone, ArrowLeft, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';

interface DepotCardProps {
  depot: Depot;
}

export default function DepotCard({ depot }: DepotCardProps) {
  const criticalItems = depot.items.filter(
    item => item.targetNeed - item.currentStock > 0
  );

  const sufficientItems = depot.items.filter(
    item => item.currentStock >= item.targetNeed
  );

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/40 hover:-translate-y-0.5 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {depot.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#FFF2F0] dark:bg-[#341611] text-[#E0533C]">
                ولاية {depot.wilaya}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-[#E0533C] transition-colors">
              {depot.name}
            </h3>
          </div>

          <div className="text-left shrink-0">
            <span className="text-[11px] text-slate-400 block">الإشغال</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
              {depot.totalCapacityPercent}%
            </span>
          </div>
        </div>

        {/* Address & Google Maps link */}
        <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 mb-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{depot.address}</span>
            </div>
            {depot.googleMapsUrl && (
              <a
                href={depot.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary text-white px-2 py-0.5 rounded-md transition-colors shrink-0"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span dir="ltr" className="font-mono text-slate-600 dark:text-slate-300">{depot.phone}</span>
            <span>• {depot.manager}</span>
          </div>
        </div>

        {/* Critical Needs Snapshot Box */}
        <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800/80 mb-5">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-[#E0533C] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              أكبر نواقص هذا المستودع:
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              {criticalItems.length} مواد
            </span>
          </div>

          {criticalItems.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {criticalItems.slice(0, 3).map(item => {
                const deficit = item.targetNeed - item.currentStock;
                return (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FFF2F0] dark:bg-[#341611] text-[#9A2D1F] dark:text-[#FCA597] border border-[#FCD3CD] dark:border-[#52231A]"
                  >
                    <span>{item.name}:</span>
                    <span className="underline font-mono">نقص {deficit} {item.unit}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              جميع الاحتياجات الأساسية مغطاة حالياً
            </p>
          )}

          {/* Quick Notice on Sufficient Items */}
          {sufficientItems.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✅ متوفر بكثرة:</span>
              <span className="truncate">{sufficientItems.map(i => i.name).slice(0, 2).join('، ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          تحديث: {depot.lastUpdated}
        </span>
        <Link
          href={`/depots/${depot.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E0533C] hover:text-[#C9442E] transition-colors"
        >
          <span>عرض الجرد الكامل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

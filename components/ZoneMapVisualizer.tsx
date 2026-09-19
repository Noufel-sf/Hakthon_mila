'use client';

import React from 'react';
import { DepotZoneInfo, DepotItem } from '@/lib/types';
import { Package, Thermometer, ShieldCheck, Layers } from 'lucide-react';

interface ZoneMapProps {
  zones: DepotZoneInfo[];
  items?: DepotItem[];
  highlightZone?: string;
  onSelectZone?: (zoneId: string) => void;
}

export default function ZoneMapVisualizer({ 
  zones, 
  items = [], 
  highlightZone,
  onSelectZone 
}: ZoneMapProps) {
  const getZoneTheme = (id: string) => {
    switch (id) {
      case 'Zone A':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          bar: 'bg-emerald-500',
          border: 'border-emerald-700/50 hover:border-emerald-500',
          icon: '🍏',
        };
      case 'Zone B':
        return {
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          bar: 'bg-indigo-500',
          border: 'border-indigo-700/50 hover:border-indigo-500',
          icon: '🛏️',
        };
      case 'Zone C':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          bar: 'bg-amber-500',
          border: 'border-amber-700/50 hover:border-amber-500',
          icon: '⚡',
        };
      case 'Zone D':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          bar: 'bg-rose-500',
          border: 'border-rose-700/50 hover:border-rose-500',
          icon: '🛋️',
        };
      default:
        return {
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          bar: 'bg-slate-500',
          border: 'border-slate-700 hover:border-slate-500',
          icon: '📦',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            المخطط الهيكلي لمناطق المستودع الذكي (Smart Warehouse Zones)
          </h4>
          <p className="text-xs text-slate-400">
            توزيع السلع حسب النوع لمنع الفوضى وإلغاء الحاجة لإعادة الفرز والتحميل
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => {
          const theme = getZoneTheme(zone.id);
          const pct = Math.round((zone.currentUnits / zone.maxCapacity) * 100);
          const isSelected = highlightZone === zone.id;

          // Find items in this zone
          const zoneItems = items.filter(i => i.assignedZone === zone.id);

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone && onSelectZone(zone.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-slate-900/80 backdrop-blur-sm flex flex-col justify-between ${theme.border} ${
                isSelected ? 'ring-2 ring-amber-400 scale-[1.02] shadow-xl' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{theme.icon}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${theme.badge}`}>
                    {zone.id}
                  </span>
                </div>

                <h5 className="text-sm font-bold text-white mb-1">
                  {zone.title}
                </h5>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                  {zone.description}
                </p>

                {zone.temperatureControl && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded-md mb-2">
                    <Thermometer className="w-3 h-3" />
                    تكييف وتبريد للمواد الحساسة
                  </span>
                )}

                {/* Items in this Zone */}
                {zoneItems.length > 0 && (
                  <div className="my-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
                    <span className="text-slate-400 font-semibold block">المواد المتواجدة هنا:</span>
                    <div className="flex flex-wrap gap-1">
                      {zoneItems.map(i => (
                        <span key={i.id} className="text-slate-300 bg-slate-800/90 px-1.5 py-0.5 rounded">
                          {i.name} ({i.currentStock})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">سعة المنطقة:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {zone.currentUnits} / {zone.maxCapacity} وحدة ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

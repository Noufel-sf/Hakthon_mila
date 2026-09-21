'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapDepotItem } from './ReliefMapInner';
import { Loader2 } from 'lucide-react';

// Dynamic import with SSR disabled to prevent window is not defined during SSR
const ReliefMapInner = dynamic(() => import('./ReliefMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      <div className="text-sm font-header text-slate-300">جارٍ تحميل الخريطة الجغرافية الميدانية للجزائر...</div>
      <div className="text-xs text-slate-500">GIS OpenStreetMap / CartoDB Voyager Engine</div>
    </div>
  ),
});

export interface ReliefMapProps {
  depots: MapDepotItem[];
  selectedDepotId?: string | number | null;
  onSelectDepot?: (depot: MapDepotItem) => void;
  focusedCoordinates?: [number, number] | null;
  className?: string;
}

export default function ReliefMap(props: ReliefMapProps) {
  return <ReliefMapInner {...props} />;
}

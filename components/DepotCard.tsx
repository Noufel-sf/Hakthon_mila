'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Depot } from '@/lib/types';
import { 
  MapPin, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

interface DepotCardProps {
  depot: Depot;
}

export default function DepotCard({ depot }: DepotCardProps) {
  // Determine image based on depot id or wilaya
  const getDepotImage = (id: string, wilaya: string) => {
    if (id.includes('mila') || wilaya.includes('ميلة')) {
      return '/relief-depot-mila.jpg';
    }
    if (id.includes('skikda') || wilaya.includes('سكيكدة')) {
      return '/relief-depot-skikda.jpg';
    }
    return '/relief-depot-jijel.jpg';
  };

  const depotImage = getDepotImage(depot.id, depot.wilaya);

  const criticalItems = depot.items.filter(
    item => item.targetNeed - item.currentStock > 0
  );

  const occupancy = depot.occupancyPercentage ?? depot.totalCapacityPercent ?? 0;

  return (
    <div className="rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-[#0E4B35] transition-colors flex flex-col justify-between group">
      
      <div>
        {/* ================= TOP: DEPOT IMAGE ================= */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-none border-b border-slate-200 dark:border-slate-800">
          <Image
            src={depotImage}
            alt={`مستودع إغاثة ${depot.name} - ولاية ${depot.wilaya}`}
            fill
            className="object-cover rounded-none"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Elegant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

          {/* Top Badges on Image */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
            
            {/* Wilaya & Code Box */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-slate-950/80 border border-white/20 text-white text-xs font-bold font-header shadow-xs">
              <span className="h-1.5 w-1.5 bg-[#0E4B35] dark:bg-emerald-400"></span>
              <span>ولاية {depot.wilaya}</span>
              <span className="text-white/60 font-mono text-[10px] mr-1">({depot.code})</span>
            </div>

            {/* Status Chip */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#0E4B35] text-white text-[11px] font-bold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>جاهز للتفريغ</span>
            </div>
          </div>

          {/* Bottom Floating Stats Bar inside Image */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white pointer-events-none">
            <div className="px-2.5 py-1 rounded-none bg-slate-950/80 border border-white/10 flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-300">نسبة الإشغال:</span>
              <span className="font-header font-black text-white">{occupancy}%</span>
            </div>

            {depot.googleMapsUrl && (
              <a
                href={depot.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#0E4B35] hover:bg-[#093525] text-white text-xs font-bold font-header shadow-xs transition-colors"
                title="فتح موقع المستودع على Google Maps"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* ================= CARD BODY ================= */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Depot Name */}
          <div>
            <h3 className="text-lg sm:text-xl font-black font-header text-slate-900 dark:text-white group-hover:text-[#0E4B35] transition-colors leading-tight">
              {depot.name}
            </h3>
            {depot.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {depot.description}
              </p>
            )}
          </div>

          {/* Address & Manager details */}
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0E4B35] shrink-0" />
              <span className="truncate">{depot.address || depot.location?.address}</span>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span dir="ltr" className="font-mono text-slate-700 dark:text-slate-300">
                  {depot.phone || depot.contactInfo?.phone}
                </span>
              </div>
              <span className="truncate">• مسؤول: {depot.manager || depot.contactInfo?.managerName}</span>
            </div>
          </div>

          {/* Occupancy Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>سعة التخزين الحالية</span>
              <span className="font-header font-bold text-slate-800 dark:text-slate-200">{occupancy}% ممتلئ</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-none h-2 overflow-hidden">
              <div 
                className={`h-full rounded-none transition-all duration-500 ${
                  occupancy > 80 ? 'bg-[#C52233]' : occupancy > 50 ? 'bg-[#0E4B35]' : 'bg-emerald-600'
                }`}
                style={{ width: `${occupancy}%` }}
              ></div>
            </div>
          </div>

          {/* Critical Shortages Box */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-none p-3 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold font-header">
              <span className="text-[#C52233] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                أكبر نواقص هذا المستودع:
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {criticalItems.length} مواد مطلوبة
              </span>
            </div>

            {criticalItems.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {criticalItems.slice(0, 3).map(item => {
                  const deficit = item.targetNeed - item.currentStock;
                  return (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-none bg-rose-50 text-[#C52233] border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50"
                    >
                      <span>{item.name}:</span>
                      <strong className="underline font-header font-bold">عجز {deficit} {item.unit}</strong>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#0E4B35] dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                جميع الاحتياجات الأساسية متوفرة حالياً
              </p>
            )}
          </div>

        </div>
      </div>

      {/* ================= FOOTER ACTION ================= */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          تحديث: {depot.lastUpdated}
        </span>
        <Link
          href={`/depots/${depot.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold font-header text-[#0E4B35] dark:text-emerald-400 hover:text-[#093525] transition-colors"
        >
          <span>عرض الجرد الكامل</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}

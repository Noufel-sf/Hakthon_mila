'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useRelief } from '@/lib/store';
import NeedsTable from '@/components/NeedsTable';
import ZoneMapVisualizer from '@/components/ZoneMapVisualizer';
import { 
  Warehouse, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Share2,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function DepotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { getDepot } = useRelief();
  const depot = getDepot(resolvedParams.id);

  if (!depot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">المستودع غير موجود</h2>
        <p className="text-slate-400 mb-6">يرجى التأكد من معرف المستودع المطلوب</p>
        <Link href="/">
          <Button variant="secondary">العودة للرئيسية</Button>
        </Link>
      </div>
    );
  }

  // Calculate totals
  const urgentDeficits = depot.items.filter(i => i.targetNeed > i.currentStock);
  const sufficientCount = depot.items.filter(i => i.currentStock >= i.targetNeed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      
      {/* Back navigation & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لكل المستودعات</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {depot.name}
            </h1>
            <Badge variant="rose" size="md">
              ولاية {depot.wilaya}
            </Badge>
            <Badge variant="slate" size="md" className="font-mono">
              {depot.code}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {depot.googleMapsUrl && (
            <a
              href={depot.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="primary" className="w-full">
                <Navigation className="w-4 h-4" />
                <span>الاتجاه إلى المستودع (Google Maps)</span>
              </Button>
            </a>
          )}
          <Link href="/admin">
            <Button variant="secondary">
              <span>إدارة المستودع</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Address Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold mb-1">
              <MapPin className="w-4 h-4 text-rose-500" />
              الموقع ونقطة التفريغ الميدانية
            </span>
            <p className="text-sm font-bold text-white">{depot.address}</p>
            <p className="text-xs text-slate-400">البلدية: {depot.municipality} — {depot.wilaya}</p>
          </div>
          {depot.googleMapsUrl && (
            <div className="pt-2 border-t border-slate-800/80">
              <a
                href={depot.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-800/50 px-3 py-1.5 rounded-xl transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>فتح نقطة التفريغ في Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Contact & Manager */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
            <Phone className="w-4 h-4 text-emerald-400" />
            المسؤول الميداني والتواصل
          </span>
          <p className="text-sm font-bold text-white">{depot.manager}</p>
          <p className="text-xs text-slate-300 font-mono" dir="ltr">{depot.phone}</p>
        </div>

        {/* Capacity & Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
            <Warehouse className="w-4 h-4 text-amber-400" />
            حالة الإشغال الميداني
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-mono font-bold text-white">
              {depot.totalCapacityPercent}% ممتلئ
            </span>
            <span className="text-xs text-slate-400">آخر تحديث: {depot.lastUpdated}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${depot.totalCapacityPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Convoy Guidance Notice */}
      <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-200">
              توجيه هام لأصحاب القوافل والشاحنات المتجهة نحو {depot.name}:
            </h4>
            <p className="text-xs text-rose-300/80 mt-0.5">
              هذا المستودع يعاني من عجز في <strong className="text-white underline">{urgentDeficits.map(i => i.name).join('، ')}</strong>. 
              إذا كانت شاحنتك تحمل مواداً أخرى مغطاة (مثل المواد الغذائية)، يرجى توجيهها لمستودع آخر حتى لا تتكدس وتتعرض للتلف.
            </p>
          </div>
        </div>
      </div>

      {/* Main Needs & Inventory Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              جدول الاحتياجات والمخزون الحالي (Live Inventory Breakdown)
            </h2>
            <p className="text-xs text-slate-400">
              بيان شفاف يوضح الكميات الموجودة، الاحتياج التقديري، وحجم العجز أو الوفرة
            </p>
          </div>
        </div>

        <NeedsTable items={depot.items} showZone={true} />
      </div>

      {/* Warehouse Staging Zones */}
      <div className="pt-4 border-t border-slate-800">
        <ZoneMapVisualizer 
          zones={depot.zones} 
          items={depot.items}
        />
      </div>

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useReliefStore } from '@/lib/store';
import DepotCard from '@/components/DepotCard';
import { 
  Warehouse, 
  Search, 
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DepotsDirectoryPage() {
  const depots = useReliefStore((state) => state.depots);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const wilayas = Array.from(new Set(depots.map(d => d.wilaya)));

  const filteredDepots = depots.filter(depot => {
    const matchesWilaya = selectedWilaya === 'all' || depot.wilaya === selectedWilaya;
    const matchesSearch = 
      depot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      depot.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWilaya && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF2F0] dark:bg-[#341611] text-[#E0533C] text-xs font-bold">
            <Warehouse className="w-4 h-4" />
            <span>دليل مستودعات ونقاط التفريغ المعتمدة</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            مستودعات الإغاثة الميدانية
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            قائمة بالمستودعات الفعالة في الولايات المتضررة، مواقعها على Google Maps، ونسب الإشغال الحالية.
          </p>
        </div>

        <Link href="/admin">
          <Button variant="secondary" size="sm">
            <span>دخول مسؤولي المستودع</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
        {/* Wilaya Filter */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedWilaya('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedWilaya === 'all'
                ? 'bg-[#E0533C] text-white shadow-sm shadow-[#E0533C]/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            جميع الولايات ({depots.length})
          </button>
          {wilayas.map(w => (
            <button
              key={w}
              onClick={() => setSelectedWilaya(w)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedWilaya === w
                  ? 'bg-[#E0533C] text-white font-bold shadow-sm shadow-[#E0533C]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ولاية {w}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث عن مستودع، بلدية أو عنوان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#E0533C]"
          />
        </div>
      </div>

      {/* Depots Grid */}
      {filteredDepots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepots.map(depot => (
            <DepotCard key={depot.id} depot={depot} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Info className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">لا توجد نتائج مطابقة</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            جرب اختيار ولاية أخرى أو كتابة اسم بلدية مختلف
          </p>
        </div>
      )}

    </div>
  );
}

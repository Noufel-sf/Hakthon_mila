'use client';

import React from 'react';
import Link from 'next/link';
import { SearchX, RotateCcw, Compass, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SmartEmptyStateProps {
  searchQuery?: string;
  selectedCategory?: string;
  selectedWilaya?: string;
  onReset: () => void;
  onSelectCategory?: (category: string) => void;
  onSelectWilaya?: (wilaya: string) => void;
}

export default function SmartEmptyState({
  searchQuery,
  selectedCategory,
  selectedWilaya,
  onReset,
  onSelectCategory,
  onSelectWilaya,
}: SmartEmptyStateProps) {
  const suggestedCategories = [
    { id: 'WATER', label: 'مياه الشرب', icon: '💧' },
    { id: 'FOOD', label: 'طرود تموين', icon: '🍲' },
    { id: 'BLANKETS', label: 'أغطية صوفية', icon: '🧣' },
    { id: 'MEDICAL', label: 'أدوية وإسعافات', icon: '🩺' },
  ];

  const suggestedWilayas = ['ميلة', 'جيجل', 'سكيكدة', 'بجاية'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-xs animate-in fade-in duration-300">
      
      {/* Icon with alert aura */}
      <div className="relative inline-flex items-center justify-center mx-auto">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
          <SearchX className="w-8 h-8" />
        </div>
      </div>

      {/* Main Message */}
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="font-header text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          لم يتم العثور على نتائج مطابقة
        </h3>
        <p className="font-sub text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {searchQuery ? (
            <span>
              لا توجد مواد أو مستودعات تطابق كلمة البحث <strong className="text-slate-900 dark:text-white font-mono">«{searchQuery}»</strong>.
            </span>
          ) : (
            <span>
              لا توجد عناصر مطابقة لخيارات الفلترة المحددة حالياً.
            </span>
          )}
        </p>
      </div>

      {/* Smart Logistics Tip Box */}
      <div className="max-w-xl mx-auto p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-right space-y-3 font-sans">
        <div className="flex items-center gap-2 text-xs font-header font-bold text-[#0E4B35] dark:text-emerald-400">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>توجيه ميداني ذكي لقوافل الإغاثة:</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          تسجل مستودعات ولايات الشرق والوسط الجزائري طلباً عاجلاً للمواد الإغاثية الأساسية. يمكنك اختيار صنف سريع لمعاينة النواقص الحرجة:
        </p>

        {/* Quick Suggestion Chips */}
        {onSelectCategory && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {suggestedCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-[#0E4B35] hover:text-white dark:hover:bg-emerald-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Suggested Wilayas if filtering by wilaya */}
        {onSelectWilaya && (
          <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              ولايات ذات أولوية:
            </span>
            {suggestedWilayas.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onSelectWilaya(w)}
                className="px-2 py-0.5 text-xs font-mono font-bold bg-white dark:bg-slate-800 text-[#0E4B35] dark:text-emerald-300 border border-emerald-300/50 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
              >
                ولاية {w}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          onClick={onReset}
          className="w-full sm:w-auto rounded-none gap-2 font-header font-bold text-xs h-9 bg-[#0E4B35] hover:bg-[#125e43] text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط جميع الفلاتر</span>
        </Button>

        <Link href="/map" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full rounded-none gap-2 font-header font-bold text-xs h-9 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>عرض الخريطة الميدانية التفاعلية</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

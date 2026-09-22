'use client';

import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Radio } from 'lucide-react';

interface LiveTelemetryBadgeProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export default function LiveTelemetryBadge({
  onRefresh,
  isRefreshing = false,
  className = '',
}: LiveTelemetryBadgeProps) {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Reset timer when refreshing completes
  useEffect(() => {
    if (isRefreshing) {
      setSecondsAgo(0);
    }
  }, [isRefreshing]);

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSecondsAgo(0);
    if (onRefresh) {
      onRefresh();
    }
  };

  const getTimeText = () => {
    if (secondsAgo < 5) return 'محدث قبل لحظات';
    if (secondsAgo < 60) return `محدث قبل ${secondsAgo} ثانية`;
    const mins = Math.floor(secondsAgo / 60);
    return `محدث قبل ${mins} دقيقة`;
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs text-xs font-mono select-none ${className}`}
      title="نظام تتبع الرادار الميداني المتصل بالأقمار الصناعية"
    >
      {/* Live radar pulsing beacon */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0E4B35] dark:bg-emerald-500 animate-radar-live"></span>
        </span>
        <span className="font-header font-bold text-slate-800 dark:text-slate-200 text-[11px]">
          رادار الإغاثة المباشر
        </span>
      </div>

      <span className="text-slate-300 dark:text-slate-700">|</span>

      {/* Relative time */}
      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">
        {getTimeText()}
      </span>

      {/* Manual refresh button */}
      {onRefresh && (
        <button
          type="button"
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5"
          title="تحديث البيانات فورياً"
        >
          <RefreshCw
            className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`}
          />
        </button>
      )}
    </div>
  );
}

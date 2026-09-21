'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export default function PwaRegister() {
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    // 1. Service Worker registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker active with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      });
    }

    // 2. Network connectivity listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 w-full bg-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-header font-bold shadow-md flex items-center justify-between gap-3 animate-fade-in"
    >
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            أنت تعمل حالياً دون اتصال بالإنترنت (Offline) — البيانات المعروضة مأخوذة من الذاكرة المحلية للتطبيق.
          </span>
        </div>

        <button
          onClick={() => window.location.reload()}
          type="button"
          className="shrink-0 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-mono transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    </div>
  );
}

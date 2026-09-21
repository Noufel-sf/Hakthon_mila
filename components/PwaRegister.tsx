'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function PwaRegister() {
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Service Worker immediate registration
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('[PWA] Service Worker registered with scope:', registration.scope);

          // Warm up core routes in background while online
          if (navigator.onLine) {
            const routesToWarm = ['/', '/needs', '/depots', '/map', '/offline'];
            routesToWarm.forEach((r) => {
              fetch(r, { cache: 'force-cache' }).catch(() => {});
            });
          }
        } catch (error) {
          console.warn('[PWA] Service Worker registration failed:', error);
        }
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // 2. Connectivity listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Seamless Offline Navigation Fallback
    // When offline, if Next.js soft-routing fails to fetch RSC chunks, fallback to browser navigation
    const handleGlobalClick = (e: MouseEvent) => {
      if (navigator.onLine) return;

      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/api') &&
        target.target !== '_blank'
      ) {
        // Force full page navigation to let Service Worker serve the cached HTML directly
        e.preventDefault();
        window.location.assign(href);
      }
    };

    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('click', handleGlobalClick, true);
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
            أنت تعمل حالياً دون اتصال بالإنترنت (Offline) — يتم التصفح بالكامل من الذاكرة المحلية المخزنة.
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

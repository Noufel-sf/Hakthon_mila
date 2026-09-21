'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone PWA mode already
    if (typeof window !== 'undefined') {
      const isAppStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      setIsStandalone(isAppStandalone);
      if (isAppStandalone) return;

      // Check if user dismissed prompt recently
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (dismissed) return;

      // Detect iOS Safari
      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua);
      const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);

      if (isIosDevice && isSafari) {
        setIsIos(true);
        // Delay showing iOS prompt slightly for smooth entry
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }

      // Android / Chromium BeforeInstallPrompt handler
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted installation');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 relative bg-[#0E4B35] border border-emerald-500/40 shrink-0 flex items-center justify-center p-1.5 shadow-sm">
            <Image
              src="/logo2.PNG"
              alt="البوصلة +"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h4 className="font-header font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>تثبيت تطبيق البوصلة +</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0E4B35] text-white">PWA</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              وصول فوري، عمل دون إنترنت، وتوجيه ميداني لقوافل الإغاثة
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          type="button"
          aria-label="إغلاق إشعار التثبيت"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isIos ? (
        <div className="text-xs bg-slate-50 dark:bg-slate-800 p-2.5 border border-slate-200 dark:border-slate-700 space-y-1.5 text-slate-700 dark:text-slate-300">
          <div className="font-bold flex items-center gap-1 text-[#0E4B35] dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>طريقة التثبيت على أجهزة iPhone / iPad:</span>
          </div>
          <p className="leading-relaxed">
            1. اضغط على زر المشاركة <Share className="inline w-3.5 h-3.5 mx-1 text-blue-500" /> في متصفح Safari.
          </p>
          <p className="leading-relaxed">
            2. اختر <strong>«إضافة إلى الصفحة الرئيسية»</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-1 text-emerald-600" />.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={handleInstallClick}
            className="flex-1 rounded-none gap-2 font-header font-bold text-xs h-9 bg-[#0E4B35] hover:bg-[#125e43] text-white"
          >
            <Download className="w-4 h-4" />
            <span>تثبيت التطبيق الآن</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleDismiss}
            className="rounded-none font-header font-bold text-xs h-9 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            لاحقاً
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground opacity-50">
        <Sun className="h-4 w-4" />
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-brand dark:hover:text-brand hover:border-brand/40 transition-all shadow-sm cursor-pointer"
      title={theme === 'dark' ? 'التحويل للوضع النهاري (Light)' : 'التحويل للوضع الليلي (Dark)'}
      aria-label="تبديل المظهر"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400 transition-all" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600 transition-all" />
      )}
    </button>
  );
}

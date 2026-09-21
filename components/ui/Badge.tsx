import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'rose' | 'amber' | 'emerald' | 'blue' | 'slate' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ 
  children, 
  className, 
  variant = 'slate', 
  size = 'md',
  ...props 
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold rounded-none border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

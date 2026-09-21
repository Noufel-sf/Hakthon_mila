import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-none transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantStyles = {
    primary: 'bg-[#0E4B35] hover:bg-[#093525] text-white shadow-xs focus:ring-[#0E4B35]',
    secondary: 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white dark:border-slate-700 focus:ring-[#0E4B35]',
    outline: 'bg-white border-2 border-[#0E4B35] text-[#0E4B35] hover:bg-[#0E4B35] hover:text-white dark:bg-transparent dark:border-emerald-500 dark:text-emerald-400 focus:ring-[#0E4B35]',
    danger: 'bg-[#C52233] hover:bg-[#A71B2A] text-white shadow-xs focus:ring-[#C52233]',
    success: 'bg-[#0E4B35] hover:bg-[#093525] text-white shadow-xs focus:ring-[#0E4B35]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

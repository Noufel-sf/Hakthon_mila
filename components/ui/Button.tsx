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
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantStyles = {
    primary: 'bg-[#03120D] hover:bg-[#07261C] text-white shadow-md shadow-[#03120D]/20 focus:ring-[#03120D]',
    secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#08281e] dark:hover:bg-[#0b3628] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#0e3b2d] focus:ring-[#03120D]',
    outline: 'border border-slate-300 dark:border-[#0e3b2d] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#08281e] focus:ring-[#03120D]',
    danger: 'bg-[#D21034] hover:bg-[#b50d2c] text-white shadow-md shadow-[#D21034]/20 focus:ring-[#D21034]',
    success: 'bg-[#03120D] hover:bg-[#07261C] text-white shadow-md shadow-[#03120D]/20 focus:ring-[#03120D]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
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

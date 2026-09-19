import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArabicNumber(num: number): string {
  return num.toLocaleString('ar-DZ');
}

export function calculateDeficit(target: number, current: number): {
  deficit: number;
  isSurplus: boolean;
  isSufficient: boolean;
  percentage: number;
} {
  const diff = target - current;
  return {
    deficit: Math.max(0, diff),
    isSurplus: current >= target * 1.3,
    isSufficient: current >= target && current < target * 1.3,
    percentage: Math.min(100, Math.round((current / (target || 1)) * 100)),
  };
}

export function getRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'منتهية الصلاحية ❌';
    if (diffDays === 1) return 'تنتهي غداً ⚠️';
    if (diffDays <= 5) return `تنتهي خلال ${diffDays} أيام ⚠️`;
    return `متبقي ${diffDays} يوم`;
  } catch {
    return dateStr;
  }
}

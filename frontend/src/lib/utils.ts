import { clsx, type ClassValue } from 'clsx';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function getDaysRemaining(endDate: string | Date): number {
  return differenceInDays(new Date(endDate), new Date());
}

export function isSubscriptionActive(startDate: string | Date, endDate: string | Date): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return isAfter(now, start) && isBefore(now, end);
}

export function isSubscriptionExpired(endDate: string | Date): boolean {
  return new Date() > new Date(endDate);
}

export function getBillingCycleLabel(cycle: string): string {
  switch (cycle.toLowerCase()) {
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    default:
      return cycle;
  }
}

export function getBillingCycleDiscount(basePrice: number, cyclePrice: number): number {
  return Math.round(((basePrice - cyclePrice) / basePrice) * 100);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(obj: Record<string, any>): { isValid: boolean; missing: string[] } {
  const missing = Object.entries(obj)
    .filter(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''))
    .map(([key]) => key);

  return {
    isValid: missing.length === 0,
    missing,
  };
}

export function calculateSubscriptionPeriod(startDate: string | Date, billingCycle: string): Date {
  const start = new Date(startDate);
  const end = new Date(start);

  switch (billingCycle.toLowerCase()) {
    case 'weekly':
      end.setDate(start.getDate() + 7);
      break;
    case 'monthly':
      end.setMonth(start.getMonth() + 1);
      break;
    case 'yearly':
      end.setFullYear(start.getFullYear() + 1);
      break;
    default:
      end.setMonth(start.getMonth() + 1); // Default to monthly
  }

  return end;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
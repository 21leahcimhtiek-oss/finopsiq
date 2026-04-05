import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  compact: boolean = false
): string {
  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(
  date: string | Date,
  formatStr: string = "MMM d, yyyy"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}

export function calculateBudgetUsage(
  current: number,
  limit: number
): {
  percentage: number;
  status: "healthy" | "warning" | "critical";
  remaining: number;
} {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const remaining = Math.max(0, limit - current);

  let status: "healthy" | "warning" | "critical";
  if (percentage >= 90) {
    status = "critical";
  } else if (percentage >= 70) {
    status = "warning";
  } else {
    status = "healthy";
  }

  return { percentage, status, remaining };
}

export function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    aws: "#FF9900",
    gcp: "#4285F4",
    azure: "#0089D6",
  };
  return colors[provider.toLowerCase()] ?? "#6B7280";
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}
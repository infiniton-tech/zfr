import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Single source of truth for currency display: Bangladeshi Taka (BDT)
export function formatPrice(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `৳${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Normalize admin-entered links: keep absolute URLs as-is, ensure internal paths start with "/"
export function normalizeHref(link?: string | null, fallback = "/"): string {
  const trimmed = (link || "").trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `/${trimmed.replace(/^\/+/, "")}`;
}

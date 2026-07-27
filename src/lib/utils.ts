import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Single source of truth for currency display: Bangladeshi Taka (BDT)
export function formatPrice(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `৳${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Normalize admin-entered links: keep absolute URLs as-is, ensure internal paths start with "/" and remove duplicate department segments
export function normalizeHref(link?: string | null, fallback = "/"): string {
  let trimmed = (link || "").trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (!trimmed.startsWith("/")) {
    trimmed = `/${trimmed}`;
  }

  // Deduplicate repeated department prefixes (e.g. /man/man/punjabi -> /man/punjabi)
  while (/^\/(man|woman|kids)\/\1(\/|$)/i.test(trimmed)) {
    trimmed = trimmed.replace(/^\/(man|woman|kids)\/\1(\/|$)/i, "/$1$2");
  }

  // Remove trailing slashes (except root "/")
  if (trimmed.length > 1 && trimmed.endsWith("/")) {
    trimmed = trimmed.slice(0, -1);
  }

  return trimmed;
}

import { clsx, type ClassValue } from "clsx";

/**
 * Merge class names with Tailwind-friendly conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Estimate reading time in minutes (avg 200 words per minute).
 */
export function readingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Format date for display.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Truncate text to word boundary.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim().replace(/\s+\S*$/, "") + "…";
}

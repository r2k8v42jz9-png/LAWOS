import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "2026-06-27" -> "Jun 27". */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "2026-06-27" -> "Saturday, 27 June 2026". */
export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Relative day count from a fixed "today" used across the demo. */
const REFERENCE_TODAY = new Date("2026-06-27T00:00:00Z");

export function daysUntil(iso: string, from: Date = REFERENCE_TODAY): number {
  const target = new Date(iso);
  const ms = target.getTime() - from.getTime();
  return Math.round(ms / 86_400_000);
}

/** Human "in 3 days" / "2 days ago" / "today". */
export function relativeDay(iso: string): string {
  const diff = daysUntil(iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `in ${diff} days`;
}

/** Relative time from an ISO datetime, e.g. "2h ago". */
export function relativeTime(iso: string, now: Date = new Date("2026-06-27T09:00:00Z")): string {
  const then = new Date(iso);
  const seconds = Math.round((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(iso);
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

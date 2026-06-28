import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/*  Dates                                                              */
/*                                                                     */
/*  Vault dates are date-only ("YYYY-MM-DD"). `new Date("YYYY-MM-DD")`  */
/*  parses as UTC midnight, which then shifts by a day when displayed   */
/*  with local getters in non-UTC timezones. So we parse date-only     */
/*  strings as *local* midnight and compare against local "today".      */
/* ------------------------------------------------------------------ */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

/** Parse a date string to a local Date (date-only → local midnight). */
export function parseDateLocal(iso: string): Date {
  const m = iso.match(DATE_ONLY);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(iso); // full datetime — let the engine handle the offset
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Today's date as "YYYY-MM-DD" in local time. */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Day-of-month from a date string, timezone-safe. */
export function isoDay(iso: string): number {
  const m = iso.match(DATE_ONLY);
  return m ? Number(m[3]) : parseDateLocal(iso).getDate();
}

/** Short month ("Jun") from a date string, timezone-safe. */
export function isoMonthShort(iso: string): string {
  const d = parseDateLocal(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short" });
}

/** "2026-06-27" -> "Jun 27". */
export function formatShortDate(iso: string): string {
  if (!iso) return "";
  const date = parseDateLocal(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "2026-06-27" -> "Saturday, 27 June 2026". */
export function formatLongDate(iso: string): string {
  if (!iso) return "";
  const date = parseDateLocal(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Whole-day difference from today (negative = past), timezone-safe. */
export function daysUntil(iso: string, from: Date = new Date()): number {
  const target = startOfDay(parseDateLocal(iso));
  if (Number.isNaN(target.getTime())) return NaN;
  const ms = target.getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** Human "in 3 days" / "2 days ago" / "Today". */
export function relativeDay(iso: string): string {
  if (!iso) return "";
  const diff = daysUntil(iso);
  if (Number.isNaN(diff)) return iso;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `in ${diff} days`;
}

/** Relative time from an ISO datetime, e.g. "2h ago". */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;
  const seconds = Math.max(0, Math.round((now.getTime() - then.getTime()) / 1000));
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

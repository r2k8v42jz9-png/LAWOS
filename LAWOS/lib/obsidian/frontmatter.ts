/**
 * Tiny, defensive coercion helpers for YAML frontmatter values.
 *
 * Frontmatter is user-authored, so any field may be missing, null, the wrong
 * type, or a placeholder comment. These helpers always return a usable value.
 */
import type { Status, Priority } from "@/lib/data/types";

type FM = Record<string, unknown>;

export function str(fm: FM, key: string, fallback = ""): string {
  const v = fm[key];
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

export function num(fm: FM, key: string, fallback = 0): number {
  const v = fm[key];
  if (v === null || v === undefined || v === "") return fallback;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

/** Returns undefined (not 0) when absent — for genuinely optional numbers. */
export function numOpt(fm: FM, key: string): number | undefined {
  const v = fm[key];
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export function list(fm: FM, key: string): string[] {
  const v = fm[key];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string" && v.trim()) {
    return v.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

/** ISO date string or undefined. Ignores YAML comment placeholders. */
export function date(fm: FM, key: string): string | undefined {
  const raw = str(fm, key);
  if (!raw || raw.startsWith("#")) return undefined;
  // Accept "2026-06-26" or full ISO; keep the date portion.
  const m = raw.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : undefined;
}

/* ------------------------------------------------------------------ */
/*  Status / priority vocab mapping (per VAULT_ARCHITECTURE.md)        */
/* ------------------------------------------------------------------ */

const STATUS_MAP: Record<string, Status> = {
  // shared
  done: "done",
  // tasks: todo|doing|done
  todo: "not_started",
  doing: "in_progress",
  // subjects: active|completed
  active: "in_progress",
  completed: "done",
  // books: planned|reading|finished
  planned: "not_started",
  reading: "in_progress",
  finished: "done",
  // research-project: idea|active|drafting|done
  idea: "not_started",
  drafting: "review",
  // legal-prep: not-started|learning|reviewed
  "not-started": "not_started",
  learning: "in_progress",
  reviewed: "done",
  // scholarship: researching|eligible|preparing|applied|awarded|rejected
  researching: "not_started",
  eligible: "not_started",
  preparing: "in_progress",
  applied: "review",
  awarded: "done",
  rejected: "archived",
  // university app_status: researching|shortlisted|preparing|submitted|offer|rejected|declined
  shortlisted: "not_started",
  submitted: "review",
  offer: "done",
  declined: "archived",
  // milestone: todo|done (covered)
};

export function status(fm: FM, key = "status", fallback: Status = "not_started"): Status {
  const raw = str(fm, key).toLowerCase().replace(/^#/, "");
  return STATUS_MAP[raw] ?? fallback;
}

/** Map a 1–5 score (priority_score / fit_score) to a Priority bucket. */
export function priorityFromScore(score: number | undefined): Priority {
  if (score === undefined) return "medium";
  if (score >= 5) return "critical";
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

/** Strip the leading `--- ... ---` frontmatter block, returning prose only. */
export function body(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
}

/** The note's title for display: frontmatter `title` → basename. */
export function titleOf(fm: FM, basename: string): string {
  return str(fm, "title", basename) || basename;
}

/** Days from a fixed "today" — kept consistent with lib/utils. */
export function progressFromPages(read: number, total: number): number {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((read / total) * 100)));
}

import type { AreaKey, Priority, Status } from "@/lib/data/types";

export interface AreaMeta {
  key: AreaKey;
  label: string;
  /** Tailwind text colour token. */
  text: string;
  /** Tailwind background tint (subtle). */
  tint: string;
  /** Tailwind border tint. */
  ring: string;
  /** Raw hex, used by charts. */
  hex: string;
}

export const AREA_META: Record<AreaKey, AreaMeta> = {
  foundation: { key: "foundation", label: "Foundation", text: "text-indigo-400", tint: "bg-indigo-500/10", ring: "ring-indigo-500/20", hex: "#818cf8" },
  llb: { key: "llb", label: "LLB", text: "text-violet-400", tint: "bg-violet-500/10", ring: "ring-violet-500/20", hex: "#a78bfa" },
  "legal-english": { key: "legal-english", label: "Legal English", text: "text-sky-400", tint: "bg-sky-500/10", ring: "ring-sky-500/20", hex: "#38bdf8" },
  reading: { key: "reading", label: "Reading", text: "text-amber-400", tint: "bg-amber-500/10", ring: "ring-amber-500/20", hex: "#fbbf24" },
  research: { key: "research", label: "Research", text: "text-emerald-400", tint: "bg-emerald-500/10", ring: "ring-emerald-500/20", hex: "#34d399" },
  scholarships: { key: "scholarships", label: "Scholarships", text: "text-rose-400", tint: "bg-rose-500/10", ring: "ring-rose-500/20", hex: "#fb7185" },
  career: { key: "career", label: "Career", text: "text-cyan-400", tint: "bg-cyan-500/10", ring: "ring-cyan-500/20", hex: "#22d3ee" },
  general: { key: "general", label: "General", text: "text-neutral-400", tint: "bg-neutral-500/10", ring: "ring-neutral-500/20", hex: "#a3a3a3" },
};

export const CHART_PALETTE = [
  "#818cf8",
  "#34d399",
  "#fbbf24",
  "#38bdf8",
  "#fb7185",
  "#22d3ee",
  "#a78bfa",
];

export const STATUS_META: Record<Status, { label: string; className: string }> = {
  not_started: { label: "Not started", className: "bg-neutral-500/10 text-neutral-400 ring-neutral-500/20" },
  in_progress: { label: "In progress", className: "bg-sky-500/10 text-sky-400 ring-sky-500/20" },
  blocked: { label: "Blocked", className: "bg-rose-500/10 text-rose-400 ring-rose-500/20" },
  review: { label: "Review", className: "bg-amber-500/10 text-amber-400 ring-amber-500/20" },
  done: { label: "Done", className: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" },
  archived: { label: "Archived", className: "bg-neutral-500/10 text-neutral-500 ring-neutral-500/20" },
};

export const PRIORITY_META: Record<Priority, { label: string; className: string; dot: string }> = {
  low: { label: "Low", className: "text-neutral-400", dot: "bg-neutral-500" },
  medium: { label: "Medium", className: "text-sky-400", dot: "bg-sky-500" },
  high: { label: "High", className: "text-amber-400", dot: "bg-amber-500" },
  critical: { label: "Critical", className: "text-rose-400", dot: "bg-rose-500" },
};

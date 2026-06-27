/**
 * Adapter factory — the ONE place that decides where data comes from.
 *
 * Every page does:
 *
 *   import { getAdapter } from "@/lib/data";
 *   const data = await getAdapter().getDashboardData();
 *
 * The single source of truth is the Obsidian vault, read through the Local REST
 * API (see lib/obsidian). There is no mock data: when the vault is empty or the
 * API is unreachable, the adapter returns empty/zeroed structures and the UI
 * renders graceful empty states.
 */
import type { DataAdapter } from "./adapter";
import { obsidianAdapter } from "@/lib/obsidian/obsidian-adapter";

export type AdapterId = DataAdapter["id"];

export function getAdapter(): DataAdapter {
  return obsidianAdapter;
}

export type { DataAdapter } from "./adapter";
export * from "./types";

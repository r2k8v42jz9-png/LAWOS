/**
 * Adapter factory — the ONE place that decides where data comes from.
 *
 * Every page does:
 *
 *   import { getAdapter } from "@/lib/data";
 *   const data = await getAdapter().getDashboardData();
 *
 * To go live with the vault later, flip `LAWOS_ADAPTER=obsidian` (or change the
 * default below) and implement `lib/obsidian/obsidian-adapter.ts`. No component
 * changes are required.
 */
import type { DataAdapter } from "./adapter";
import { mockAdapter } from "./mock-adapter";

export type AdapterId = DataAdapter["id"];

let cached: DataAdapter | null = null;

function resolveAdapterId(): AdapterId {
  const fromEnv = process.env.NEXT_PUBLIC_LAWOS_ADAPTER ?? process.env.LAWOS_ADAPTER;
  if (fromEnv === "obsidian") return "obsidian";
  return "mock";
}

/**
 * Returns the active adapter as a singleton. Synchronous so it can be called at
 * the top of any server component; the adapter's *methods* are async.
 */
export function getAdapter(): DataAdapter {
  if (cached) return cached;

  const id = resolveAdapterId();

  switch (id) {
    case "obsidian":
      // Lazy require keeps fs-dependent code out of the bundle until needed.
      // Until the reader is implemented we fall back to the mock so the app
      // never crashes during the migration.
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { obsidianAdapter } = require("@/lib/obsidian/obsidian-adapter");
        cached = obsidianAdapter as DataAdapter;
      } catch {
        cached = mockAdapter;
      }
      break;
    case "mock":
    default:
      cached = mockAdapter;
  }

  return cached;
}

export type { DataAdapter } from "./adapter";
export * from "./types";

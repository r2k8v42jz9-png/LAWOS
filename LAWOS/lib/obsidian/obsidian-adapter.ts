/**
 * Obsidian vault adapter — FUTURE WORK (not wired in yet).
 *
 * This stub documents the migration plan. When implemented, it will read
 * markdown + frontmatter from the vault at `LAWOS_VAULT_PATH` (default:
 * "Law Journey 2026-2030/") and project it into the exact same domain types
 * the mock adapter returns today.
 *
 * Suggested vault structure the reader will map from:
 *
 *   Law Journey 2026-2030/
 *   ├── 00-Dashboard/Mission.md
 *   ├── 01-Foundation/{Subjects,Assignments,Exams}/*.md
 *   ├── 02-LLB/{Modules,Universities}/*.md
 *   ├── 03-Legal-English/{Vocabulary,Mock-Tests}/*.md
 *   ├── 04-Reading/{Books,Notes}/*.md
 *   ├── 05-Research/{Projects,Sources,Ideas}/*.md
 *   ├── 06-Scholarships/*.md
 *   ├── 07-Career/{Evidence,Internships,Skills}/*.md
 *   └── 99-Meta/Settings.md
 *
 * Each note's YAML frontmatter carries the structured fields (status, due,
 * progress, etc.); the body carries prose (summaries, notes, excerpts).
 *
 * Implementation outline:
 *   1. `readVault(path)` — recursively glob *.md, parse frontmatter (gray-matter).
 *   2. `mappers/*.ts` — pure functions: ParsedNote[] -> FoundationData, etc.
 *   3. Cache + file-watch (chokidar) for live updates.
 *   4. Implement `DataAdapter` by composing the mappers.
 *
 * Until then, importing this module throws, and the factory in `index.ts`
 * gracefully falls back to the mock adapter.
 */
import type { DataAdapter } from "@/lib/data/adapter";

const NOT_IMPLEMENTED =
  "Obsidian adapter is not implemented yet. Set LAWOS_ADAPTER=mock (default) " +
  "until lib/obsidian/obsidian-adapter.ts is built.";

function notImplemented(): never {
  throw new Error(NOT_IMPLEMENTED);
}

export const obsidianAdapter: DataAdapter = {
  id: "obsidian",
  getDashboardData: notImplemented,
  getFoundationData: notImplemented,
  getLLBData: notImplemented,
  getLegalEnglishData: notImplemented,
  getReadingData: notImplemented,
  getResearchData: notImplemented,
  getScholarshipsData: notImplemented,
  getCareerData: notImplemented,
  getAnalyticsData: notImplemented,
  getSettings: notImplemented,
};

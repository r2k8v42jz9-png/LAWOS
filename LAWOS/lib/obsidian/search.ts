/**
 * Global search index. Builds a flat, lightweight list of every record in the
 * vault — typed records (with real titles from frontmatter) plus general and
 * daily notes (title from filename, no content fetch). The result is cached for
 * a few seconds and invalidated on writes, so the command palette stays
 * responsive and avoids hammering the REST API on every keystroke.
 */
import type { SearchRecord } from "@/lib/data/types";
import { getNotesByTag, listFiles } from "./client";
import { isExcludedPath, AREA_FOLDERS } from "./config";
import { classify } from "./classify";
import { str } from "./frontmatter";

const INDEX_TAGS = [
  "book",
  "subject",
  "assignment",
  "exam",
  "project",
  "research-project",
  "research-paper",
  "source",
  "evidence",
  "ielts-mock",
  "vocabulary",
  "scholarship",
  "university",
  "milestone",
];

const TTL_MS = 5_000;
let cache: { at: number; data: SearchRecord[] } | null = null;

const folderOf = (path: string) => path.split("/").slice(0, -1).join("/");

export function invalidateSearchIndex() {
  cache = null;
}

export async function buildSearchIndex(): Promise<SearchRecord[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  const seen = new Set<string>();
  const records: SearchRecord[] = [];

  // 1) Typed records — real titles + classification from frontmatter.
  const typedGroups = await Promise.all(INDEX_TAGS.map((t) => getNotesByTag(t)));
  for (const group of typedGroups) {
    for (const n of group) {
      if (seen.has(n.path)) continue;
      seen.add(n.path);
      const c = classify(n.path, n.tags, str(n.frontmatter, "category"));
      records.push({
        path: n.path,
        title: str(n.frontmatter, "title", n.basename),
        kind: c.kind,
        kindLabel: c.kindLabel,
        folder: folderOf(n.path),
        href: c.href,
        area: c.area,
      });
    }
  }

  // 2) General + daily notes — filename only, no per-note fetch (cheap at scale).
  const fileLists = await Promise.all(Object.values(AREA_FOLDERS).map((f) => listFiles(f)));
  for (const list of fileLists) {
    for (const path of list) {
      if (seen.has(path) || isExcludedPath(path)) continue;
      seen.add(path);
      const c = classify(path, []);
      records.push({
        path,
        title: (path.split("/").pop() ?? "").replace(/\.md$/, ""),
        kind: c.kind,
        kindLabel: c.kindLabel,
        folder: folderOf(path),
        href: c.href,
        area: c.area,
      });
    }
  }

  records.sort((a, b) => a.title.localeCompare(b.title));
  cache = { at: Date.now(), data: records };
  return records;
}

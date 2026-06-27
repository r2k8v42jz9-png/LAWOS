/**
 * Low-level client for the Obsidian Local REST API.
 *
 * This is the ONLY module that talks HTTP to Obsidian. Everything above it
 * (mappers, adapter) works with the typed results returned here. Every function
 * fails soft: network errors, a stopped Obsidian, a missing note or an empty
 * vault all resolve to `null` / `[]` / `false` rather than throwing — so the UI
 * degrades to empty states instead of crashing.
 *
 * Reusable API surface (as requested):
 *   getFile, getNote, getFolder, getNotes, getNotesByTag, searchByTag,
 *   updateFile, createFile, ping
 */
import { Agent, fetch as undiciFetch, type RequestInit as UndiciRequestInit } from "undici";
import { obsidianConfig, isObsidianConfigured, isExcludedPath } from "./config";

export interface ObsidianStat {
  ctime: number;
  mtime: number;
  size: number;
}

export interface ObsidianNote {
  path: string;
  /** Filename without extension, derived from `path`. */
  basename: string;
  /** Full markdown content (including frontmatter block). */
  content: string;
  /** Parsed YAML frontmatter. */
  frontmatter: Record<string, unknown>;
  /** All tags (frontmatter + inline). */
  tags: string[];
  stat: ObsidianStat;
}

/* ------------------------------------------------------------------ */
/*  Transport — auth + self-signed TLS for localhost                   */
/* ------------------------------------------------------------------ */

/**
 * A dispatcher that accepts the plugin's self-signed certificate — applied ONLY
 * to Obsidian requests (passed per-fetch), so global TLS verification for every
 * other host is left untouched.
 */
let insecureDispatcher: Agent | undefined;
function getDispatcher(): Agent | undefined {
  if (!(obsidianConfig.insecureTls && obsidianConfig.apiUrl.startsWith("https://"))) return undefined;
  if (!insecureDispatcher) {
    insecureDispatcher = new Agent({ connect: { rejectUnauthorized: false } });
  }
  return insecureDispatcher;
}

let warnedOnce = false;

type ApiResponse = Awaited<ReturnType<typeof undiciFetch>>;

async function api(path: string, init: UndiciRequestInit = {}): Promise<ApiResponse | null> {
  if (!isObsidianConfigured()) {
    if (!warnedOnce) {
      warnedOnce = true;
      console.warn(
        "[obsidian] OBSIDIAN_API_KEY is not set — returning empty data. " +
          "Set it in .env.local to connect your vault."
      );
    }
    return null;
  }
  try {
    // Use undici's fetch directly so the per-request `dispatcher` (which trusts
    // the plugin's self-signed localhost cert) is honoured — Next.js's wrapped
    // global fetch strips it.
    const res = await undiciFetch(`${obsidianConfig.apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${obsidianConfig.apiKey}`,
        ...(init.headers ?? {}),
      },
      dispatcher: getDispatcher(),
    });
    return res;
  } catch (err) {
    if (!warnedOnce) {
      warnedOnce = true;
      console.warn(
        `[obsidian] Could not reach ${obsidianConfig.apiUrl} — is Obsidian running ` +
          `with the Local REST API plugin enabled? Falling back to empty data.`,
        err instanceof Error ? err.message : err
      );
    }
    return null;
  }
}

/** Encode a vault path for use in a URL while keeping the slash separators. */
function encodePath(p: string): string {
  return p
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

function noteFromJson(json: any): ObsidianNote {
  const path: string = json.path ?? "";
  const fm = (json.frontmatter ?? {}) as Record<string, unknown>;
  const fmTags = Array.isArray(fm.tags) ? (fm.tags as string[]) : [];
  const allTags: string[] = Array.isArray(json.tags) ? json.tags : [];
  const tags = Array.from(new Set([...allTags, ...fmTags].map((t) => String(t).replace(/^#/, ""))));
  return {
    path,
    basename: (path.split("/").pop() ?? "").replace(/\.md$/, ""),
    content: json.content ?? "",
    frontmatter: fm,
    tags,
    stat: json.stat ?? { ctime: 0, mtime: 0, size: 0 },
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/** Liveness check — true if the API answers. */
export async function ping(): Promise<boolean> {
  const res = await api("/");
  return !!res && res.ok;
}

/** Raw markdown of a single note, or null if missing/unreachable. */
export async function getFile(path: string): Promise<string | null> {
  const res = await api(`/vault/${encodePath(path)}`, {
    headers: { Accept: "text/markdown" },
  });
  if (!res || !res.ok) return null;
  return res.text();
}

/** A single note with parsed frontmatter + tags + stat, or null. */
export async function getNote(path: string): Promise<ObsidianNote | null> {
  const res = await api(`/vault/${encodePath(path)}`, {
    headers: { Accept: "application/vnd.olrapi.note+json" },
  });
  if (!res || !res.ok) return null;
  try {
    return noteFromJson(await res.json());
  } catch {
    return null;
  }
}

/**
 * List a folder's immediate children. Subfolders come back with a trailing "/".
 * Returns vault-relative paths. Empty array if the folder is missing/empty.
 */
export async function getFolder(path: string): Promise<string[]> {
  const clean = path.replace(/\/$/, "");
  const res = await api(`/vault/${encodePath(clean)}/`);
  if (!res || !res.ok) return [];
  try {
    const data = (await res.json()) as any;
    const files: string[] = Array.isArray(data?.files) ? data.files : [];
    return files.map((f) => (clean ? `${clean}/${f}` : f));
  } catch {
    return [];
  }
}

/**
 * Recursively gather every markdown note under a folder as ObsidianNote[].
 * Hidden/`.fuse_*`/non-markdown entries are skipped.
 */
export async function getNotes(folder: string, recursive = true): Promise<ObsidianNote[]> {
  const entries = await getFolder(folder);
  const filePaths: string[] = [];
  const subfolders: string[] = [];

  for (const entry of entries) {
    const name = (entry.replace(/\/$/, "").split("/").pop() ?? "");
    if (name.startsWith(".")) continue; // skip dotfiles & .fuse_* artefacts
    if (entry.endsWith("/")) {
      if (recursive) subfolders.push(entry.replace(/\/$/, ""));
    } else if (entry.endsWith(".md")) {
      filePaths.push(entry);
    }
  }

  const notes = await Promise.all(filePaths.map((p) => getNote(p)));
  const resolved = notes.filter((n): n is ObsidianNote => n !== null);

  if (recursive && subfolders.length) {
    const nested = await Promise.all(subfolders.map((f) => getNotes(f, true)));
    for (const group of nested) resolved.push(...group);
  }

  return resolved;
}

/** Filenames (vault-relative paths) of notes carrying `#tag` anywhere. */
export async function searchByTag(tag: string): Promise<string[]> {
  const res = await api(`/search/`, {
    method: "POST",
    headers: { "Content-Type": "application/vnd.olrapi.jsonlogic+json" },
    body: JSON.stringify({ in: [tag, { var: "tags" }] }),
  });
  if (!res || !res.ok) return [];
  try {
    const data = (await res.json()) as any;
    if (!Array.isArray(data)) return [];
    return data.map((r) => r.filename as string).filter(Boolean);
  } catch {
    return [];
  }
}

/** Frontmatter markers that identify an aggregator/dashboard, never a record. */
const NON_RECORD_TYPES = new Set(["dashboard", "system", "architecture", "moc", "index"]);
const NON_RECORD_TAGS = new Set(["dashboard", "system", "lawos", "template", "index", "moc"]);

/** True if a note is a dashboard/system/template note rather than a data record. */
export function isAggregatorNote(n: ObsidianNote): boolean {
  const type = String(n.frontmatter["type"] ?? "").toLowerCase();
  if (NON_RECORD_TYPES.has(type)) return true;
  const fmTags = Array.isArray(n.frontmatter.tags) ? (n.frontmatter.tags as string[]) : [];
  return fmTags.some((t) => NON_RECORD_TAGS.has(String(t).replace(/^#/, "").toLowerCase()));
}

/**
 * The primary record loader: every note whose **frontmatter** declares the
 * given primary tag, excluding templates/system/archive folders and any
 * dashboard/system/MOC note. This is how the adapter pulls "all books",
 * "all subjects", etc. — only real records, never the Dataview dashboards.
 */
export async function getNotesByTag(tag: string): Promise<ObsidianNote[]> {
  const paths = (await searchByTag(tag)).filter((p) => !isExcludedPath(p));
  const notes = await Promise.all(paths.map((p) => getNote(p)));
  return notes.filter((n): n is ObsidianNote => {
    if (!n) return false;
    // Keep only notes that carry the tag in *frontmatter* (true records),
    // not dashboards that merely mention `#tag` inside a Dataview query.
    const fmTags = Array.isArray(n.frontmatter.tags) ? (n.frontmatter.tags as string[]) : [];
    const hasTag = fmTags.map((t) => String(t).replace(/^#/, "")).includes(tag);
    return hasTag && !isAggregatorNote(n);
  });
}

/** Create or overwrite a note with raw markdown. Returns success. */
export async function updateFile(path: string, content: string): Promise<boolean> {
  const res = await api(`/vault/${encodePath(path)}`, {
    method: "PUT",
    headers: { "Content-Type": "text/markdown" },
    body: content,
  });
  return !!res && res.ok;
}

/** Alias of updateFile — PUT creates the note if it doesn't exist. */
export async function createFile(path: string, content: string): Promise<boolean> {
  return updateFile(path, content);
}

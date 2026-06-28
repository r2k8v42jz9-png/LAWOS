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
import { cache } from "react";
import { Agent, fetch as undiciFetch, type RequestInit as UndiciRequestInit } from "undici";
import { obsidianConfig, isObsidianConfigured, isExcludedPath, TAG_FOLDERS } from "./config";

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
  /** Vault paths of notes that link to this one (for safe rename). */
  backlinks: string[];
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
    // global fetch strips it. A timeout prevents a hung vault from hanging a
    // request indefinitely.
    const res = await undiciFetch(`${obsidianConfig.apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${obsidianConfig.apiKey}`,
        ...(init.headers ?? {}),
      },
      dispatcher: getDispatcher(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    warnedOnce = false; // recovered — allow the next outage to warn again
    return res;
  } catch (err) {
    if (!warnedOnce) {
      warnedOnce = true;
      const reason = err instanceof Error && err.name === "TimeoutError" ? "timed out" : "unreachable";
      console.warn(
        `[obsidian] ${obsidianConfig.apiUrl} ${reason} — is Obsidian running with the ` +
          `Local REST API plugin enabled? Falling back to empty data.`,
        err instanceof Error ? err.message : err
      );
    }
    return null;
  }
}

/** Per-request read timeout for the Local REST API. */
const REQUEST_TIMEOUT_MS = 8_000;

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
    backlinks: Array.isArray(json.backlinks) ? json.backlinks : [],
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

export type ConnectionStatus = "ok" | "no-key" | "unreachable" | "invalid-key";

/**
 * Diagnose exactly why the vault can't be reached, so the UI can show a precise
 * message. Root (`/`) needs no auth; `/vault/` does, so a 401 there means the
 * key is wrong while the server is up.
 */
export async function checkConnection(): Promise<ConnectionStatus> {
  if (!isObsidianConfigured()) return "no-key";
  const root = await api("/");
  if (!root) return "unreachable";
  const vault = await api("/vault/");
  if (!vault) return "unreachable";
  if (vault.status === 401 || vault.status === 403) return "invalid-key";
  return "ok";
}

/** Human-readable explanation for a connection status. */
export function connectionMessage(status: ConnectionStatus): string {
  switch (status) {
    case "no-key":
      return "No API key configured. Add OBSIDIAN_API_KEY to .env.local and restart.";
    case "unreachable":
      return `Can't reach the Local REST API at ${obsidianConfig.apiUrl}. Open Obsidian and make sure the “Local REST API” plugin is enabled.`;
    case "invalid-key":
      return "The Obsidian API key is invalid. Update OBSIDIAN_API_KEY in .env.local to match the plugin's key.";
    case "ok":
      return "Connected to your Obsidian vault.";
  }
}

/** Raw markdown of a single note, or null if missing/unreachable. */
export async function getFile(path: string): Promise<string | null> {
  const res = await api(`/vault/${encodePath(path)}`, {
    headers: { Accept: "text/markdown" },
  });
  if (!res || !res.ok) return null;
  return res.text();
}

/**
 * A single note with parsed frontmatter + tags + stat, or null.
 * Memoized per server request so overlapping reads (dashboard + search index)
 * hit the REST API at most once per path per render.
 */
export const getNote = cache(async (path: string): Promise<ObsidianNote | null> => {
  const res = await api(`/vault/${encodePath(path)}`, {
    headers: { Accept: "application/vnd.olrapi.note+json" },
  });
  if (!res || !res.ok) return null;
  try {
    return noteFromJson(await res.json());
  } catch {
    return null;
  }
});

/**
 * List a folder's immediate children. Subfolders come back with a trailing "/".
 * Returns vault-relative paths. Empty array if the folder is missing/empty.
 */
export const getFolder = cache(async (path: string): Promise<string[]> => {
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
});

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

/** Recursively collect markdown file paths under a folder, WITHOUT fetching them. */
export async function listFiles(folder: string, recursive = true): Promise<string[]> {
  const entries = await getFolder(folder);
  const files: string[] = [];
  const subfolders: string[] = [];
  for (const entry of entries) {
    const name = entry.replace(/\/$/, "").split("/").pop() ?? "";
    if (name.startsWith(".")) continue;
    if (entry.endsWith("/")) {
      if (recursive) subfolders.push(entry.replace(/\/$/, ""));
    } else if (entry.endsWith(".md")) {
      files.push(entry);
    }
  }
  if (recursive && subfolders.length) {
    const nested = await Promise.all(subfolders.map((f) => listFiles(f, true)));
    for (const g of nested) files.push(...g);
  }
  return files;
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
  // Union the search index with a direct scan of the tag's folders, so records
  // created via the UI appear immediately even before Obsidian re-indexes.
  const [searched, ...folderLists] = await Promise.all([
    searchByTag(tag),
    ...(TAG_FOLDERS[tag] ?? []).map((f) => listFiles(f)),
  ]);
  const paths = Array.from(new Set([...searched, ...folderLists.flat()])).filter(
    (p) => !isExcludedPath(p)
  );
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

/** Delete a note. Returns success (also true if it was already gone). */
export async function deleteFile(path: string): Promise<boolean> {
  const res = await api(`/vault/${encodePath(path)}`, { method: "DELETE" });
  return !!res && (res.ok || res.status === 404);
}

/** True if a note exists at the given path. */
export async function fileExists(path: string): Promise<boolean> {
  const res = await api(`/vault/${encodePath(path)}`, { headers: { Accept: "text/markdown" } });
  return !!res && res.ok;
}

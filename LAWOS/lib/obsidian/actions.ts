"use server";

/**
 * Server actions for vault writes. These run on the server, reuse the existing
 * Obsidian client (createFile/updateFile/deleteFile), and revalidate every route
 * so the UI reflects the change without a manual reload.
 */
import { revalidatePath } from "next/cache";
import {
  createFile,
  updateFile,
  deleteFile,
  getFile,
  getNote,
  fileExists,
  checkConnection,
  connectionMessage,
} from "./client";
import { buildNote, replaceFrontmatter, slugifyTitle } from "./markdown";
import { getEntityDef, buildEntries, bodyFor, validate, type FormValues } from "./entities";
import { buildSearchIndex, invalidateSearchIndex } from "./search";
import { parseCapture } from "./capture";
import type { SearchRecord } from "@/lib/data/types";

export interface ActionResult {
  ok: boolean;
  path?: string;
  message?: string;
  errors?: Record<string, string>;
}

function refreshAll() {
  // One call revalidates every route under the root layout.
  revalidatePath("/", "layout");
  // Drop the cached search index so the next search reflects the change.
  invalidateSearchIndex();
}

async function uniquePath(folder: string, base: string): Promise<string> {
  let candidate = `${folder}/${base}.md`;
  let n = 2;
  while (await fileExists(candidate)) {
    candidate = `${folder}/${base} ${n}.md`;
    n++;
    if (n > 50) break;
  }
  return candidate;
}

/**
 * When a write fails, diagnose *why* (vault closed, plugin off, bad key, …) so
 * the message is actionable instead of generic.
 */
async function diagnose(action: string): Promise<string> {
  const status = await checkConnection();
  if (status === "ok") return `${action} failed unexpectedly — the vault is reachable but rejected the write.`;
  return connectionMessage(status);
}

/** Create a new record note in the vault. */
export async function createEntity(entityKey: string, values: FormValues): Promise<ActionResult> {
  const entity = getEntityDef(entityKey);
  if (!entity) return { ok: false, message: "Unknown record type." };

  const errors = validate(entity, values);
  if (Object.keys(errors).length) return { ok: false, errors };

  const title = (values[entity.titleField] ?? "").trim();
  const path = await uniquePath(entity.folder, slugifyTitle(title));
  const note = buildNote(buildEntries(entity, values), bodyFor(entity, values));

  const ok = await createFile(path, note);
  if (!ok) return { ok: false, message: await diagnose("Creating the note") };

  refreshAll();
  return { ok: true, path };
}

/** Update an existing record, preserving its body and original `created` date. */
export async function updateEntity(
  entityKey: string,
  path: string,
  values: FormValues
): Promise<ActionResult> {
  const entity = getEntityDef(entityKey);
  if (!entity) return { ok: false, message: "Unknown record type." };

  const errors = validate(entity, values);
  if (Object.keys(errors).length) return { ok: false, errors };

  const existing = await getNote(path);
  if (!existing) return { ok: false, message: "That note no longer exists in the vault." };

  const created =
    typeof existing.frontmatter.created === "string" ? existing.frontmatter.created : undefined;
  const entries = buildEntries(entity, values, { created });
  const content = replaceFrontmatter(existing.content, entries);

  const ok = await updateFile(path, content);
  if (!ok) return { ok: false, message: await diagnose("Updating the note") };

  refreshAll();
  return { ok: true, path };
}

/** Delete a record note from the vault. */
export async function deleteEntity(path: string): Promise<ActionResult> {
  if (!path) return { ok: false, message: "Missing note path." };
  const ok = await deleteFile(path);
  if (!ok) return { ok: false, message: await diagnose("Deleting the note") };
  refreshAll();
  return { ok: true };
}

/**
 * Optionally rename a record's markdown file to match a new title — safely.
 * The note's wiki-links are preserved by rewriting every backlink to point at
 * the new filename, so `[[Old Name]]` references keep working.
 */
export async function renameEntityFile(
  entityKey: string,
  oldPath: string,
  newTitle: string
): Promise<ActionResult & { linksUpdated?: number }> {
  const entity = getEntityDef(entityKey);
  if (!entity) return { ok: false, message: "Unknown record type." };

  const title = (newTitle ?? "").trim();
  if (!title) return { ok: false, message: "A title is required to rename the file." };

  const folder = oldPath.includes("/") ? oldPath.slice(0, oldPath.lastIndexOf("/")) : "";
  const oldBase = (oldPath.split("/").pop() ?? "").replace(/\.md$/, "");
  const newBase = slugifyTitle(title);
  if (newBase === oldBase) return { ok: true, path: oldPath, linksUpdated: 0 };

  const note = await getNote(oldPath);
  if (!note) return { ok: false, message: "That note no longer exists in the vault." };

  const newPath = await uniquePath(folder, newBase);

  // 1) Write the content to the new path.
  if (!(await createFile(newPath, note.content))) {
    return { ok: false, message: await diagnose("Renaming the note") };
  }

  // 2) Rewrite wiki-links in every backlinking note so nothing breaks.
  const finalBase = (newPath.split("/").pop() ?? "").replace(/\.md$/, "");
  const esc = oldBase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const linkRe = new RegExp(`(\\[\\[[^\\]\\n]*?)${esc}([\\]|#])`, "g");
  let linksUpdated = 0;
  const backlinks = Array.isArray(note.backlinks) ? note.backlinks : [];
  for (const src of backlinks) {
    if (src === oldPath) continue;
    const body = await getFile(src);
    if (!body) continue;
    const rewritten = body.replace(linkRe, `$1${finalBase}$2`);
    if (rewritten !== body && (await updateFile(src, rewritten))) linksUpdated++;
  }

  // 3) Remove the old file.
  await deleteFile(oldPath);

  refreshAll();
  return { ok: true, path: newPath, linksUpdated };
}

/**
 * Load a record's current frontmatter as form values (strings) to prefill the
 * edit form. Arrays are joined; everything is stringified.
 */
export async function loadEntity(entityKey: string, path: string): Promise<FormValues | null> {
  const entity = getEntityDef(entityKey);
  if (!entity) return null;
  const note = await getNote(path);
  if (!note) return null;

  const out: FormValues = {};
  for (const field of entity.fields) {
    const v = note.frontmatter[field.name];
    if (v === undefined || v === null) out[field.name] = "";
    else if (Array.isArray(v)) out[field.name] = v.join(", ");
    else out[field.name] = String(v);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Global search + quick capture                                      */
/* ------------------------------------------------------------------ */

/** The full search index (cached server-side, refreshed on writes). */
export async function fetchSearchIndex(): Promise<SearchRecord[]> {
  return buildSearchIndex();
}

/** Parse a quick-capture string and create the record. */
export async function quickCapture(input: string): Promise<ActionResult & { entityLabel?: string }> {
  const parsed = parseCapture(input);
  if (!parsed) {
    return {
      ok: false,
      message: "Start with a type, e.g. “book Constitutional Law” or “exam Criminal Law”.",
    };
  }
  const entity = getEntityDef(parsed.entityKey)!;
  const res = await createEntity(parsed.entityKey, { [entity.titleField]: parsed.title });
  return { ...res, entityLabel: parsed.entityLabel };
}

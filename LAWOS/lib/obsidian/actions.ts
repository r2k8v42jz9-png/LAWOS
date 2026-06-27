"use server";

/**
 * Server actions for vault writes. These run on the server, reuse the existing
 * Obsidian client (createFile/updateFile/deleteFile), and revalidate every route
 * so the UI reflects the change without a manual reload.
 */
import { revalidatePath } from "next/cache";
import { createFile, updateFile, deleteFile, getNote, fileExists } from "./client";
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
  if (!ok) return { ok: false, message: "Couldn't write to the vault. Is Obsidian running?" };

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
  if (!ok) return { ok: false, message: "Couldn't update the vault." };

  refreshAll();
  return { ok: true, path };
}

/** Delete a record note from the vault. */
export async function deleteEntity(path: string): Promise<ActionResult> {
  if (!path) return { ok: false, message: "Missing note path." };
  const ok = await deleteFile(path);
  if (!ok) return { ok: false, message: "Couldn't delete the note." };
  refreshAll();
  return { ok: true };
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

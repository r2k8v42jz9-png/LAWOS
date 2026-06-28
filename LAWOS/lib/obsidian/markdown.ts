/**
 * Markdown + YAML generation for notes written back to the vault.
 *
 * The goal is to NEVER produce invalid markdown: values are serialised to safe
 * YAML, and frontmatter is replaced surgically on edit so any prose the user
 * wrote in Obsidian is preserved.
 */

export type FrontmatterValue = string | number | boolean | string[] | null | undefined;
export type FrontmatterEntry = [key: string, value: FrontmatterValue];

const NEEDS_QUOTING = /[:#\[\]{}>|*&!%@,"'`]|[\n\r\t]|^\s|\s$|^[?&*!|>%@`-]/;

function yamlScalar(v: string | number | boolean): string {
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  const s = String(v);
  if (s === "") return "";
  // Bare dates / simple tokens stay unquoted; anything risky is double-quoted.
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (NEEDS_QUOTING.test(s)) {
    // Double-quoted YAML: escape backslash, quote, and control whitespace so a
    // multi-line value never breaks the frontmatter block.
    const escaped = s
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t");
    return `"${escaped}"`;
  }
  return s;
}

/** Serialise ordered entries into a YAML frontmatter block (with `---` fences). */
export function buildFrontmatter(entries: FrontmatterEntry[]): string {
  const lines: string[] = ["---"];
  for (const [key, value] of entries) {
    if (value === undefined || value === null) {
      lines.push(`${key}:`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) lines.push(`  - ${yamlScalar(item)}`);
      }
    } else if (value === "") {
      lines.push(`${key}:`);
    } else {
      lines.push(`${key}: ${yamlScalar(value)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

/** Assemble a full note from frontmatter entries + a markdown body. */
export function buildNote(entries: FrontmatterEntry[], body: string): string {
  return `${buildFrontmatter(entries)}\n\n${body.trim()}\n`;
}

/**
 * Replace only the leading frontmatter block of an existing note, preserving the
 * body. If the note had no frontmatter, the new block is prepended.
 */
export function replaceFrontmatter(content: string, entries: FrontmatterEntry[]): string {
  const fm = buildFrontmatter(entries);
  if (/^---\n[\s\S]*?\n---/.test(content)) {
    return content.replace(/^---\n[\s\S]*?\n---/, fm);
  }
  return `${fm}\n\n${content.trim()}\n`;
}

/**
 * Turn a title into a clean, filesystem-safe note filename (no extension).
 * Keeps it human-readable (Obsidian shows the filename), just strips characters
 * that are illegal in paths or break Obsidian links.
 */
export function slugifyTitle(title: string): string {
  const cleaned = title
    .replace(/[\\/:*?"<>|#^[\]]/g, " ") // illegal / link-breaking chars
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || "Untitled";
}

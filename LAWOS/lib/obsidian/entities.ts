/**
 * Entity registry — the single source of truth for everything LawOS can create.
 *
 * Each definition drives: the form fields, client + server validation, the
 * vault folder, the primary `#tag`, and the YAML frontmatter that gets written.
 * Field names match exactly what the readers in `mappers.ts` expect, so a record
 * created here round-trips back onto its page. Schemas follow the vault's
 * VAULT_ARCHITECTURE / Templates — nothing is invented beyond `#vocabulary`
 * (which had no prior schema but is needed for the Legal English page).
 *
 * Pure data: no server-only imports, so both client forms and server actions
 * can import it.
 */
import type { FrontmatterEntry, FrontmatterValue } from "./markdown";

export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "list";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  /** Span both columns in the form grid. */
  full?: boolean;
}

export interface EntityDef {
  key: string;
  /** Singular noun shown on buttons/titles, e.g. "Book". */
  label: string;
  /** Primary frontmatter tag. */
  tag: string;
  /** Vault folder records are written to. */
  folder: string;
  /** Which field becomes the filename + note title. */
  titleField: string;
  /** Frontmatter forced on every record of this type (e.g. category). */
  fixed?: Record<string, FrontmatterValue>;
  fields: FieldDef[];
}

/* ------------------------------------------------------------------ */
/*  Shared option sets (from VAULT_ARCHITECTURE vocab)                 */
/* ------------------------------------------------------------------ */

const opt = (...vals: string[]) =>
  vals.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, " ") }));

const BOOK_STATUS = opt("planned", "reading", "finished");
const BOOK_CATEGORY = opt("law", "politics", "history", "economics", "psychology", "writing", "philosophy", "biography", "communication");
const TASK_STATUS = opt("todo", "doing", "done");
const SUBJECT_STATUS = opt("active", "completed");
const RESEARCH_STATUS = opt("idea", "active", "drafting", "done");
const SOURCE_TYPE = opt("case", "statute", "article", "book", "report");
const SCHOLARSHIP_STATUS = opt("researching", "eligible", "preparing", "applied", "awarded", "rejected");
const EVIDENCE_CATEGORY = opt("gpa", "research", "leadership", "volunteering", "competition", "certificate", "public-speaking", "project", "portfolio", "networking", "internship");
const VOCAB_STATUS = opt("learning", "mastered");
const YES_NO = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

/* ------------------------------------------------------------------ */
/*  Registry                                                           */
/* ------------------------------------------------------------------ */

export const ENTITIES: Record<string, EntityDef> = {
  book: {
    key: "book",
    label: "Book",
    tag: "book",
    folder: "05 Library/Books",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "The Concept of Law" },
      { name: "author", label: "Author", type: "text", placeholder: "H.L.A. Hart" },
      { name: "category", label: "Category", type: "select", options: BOOK_CATEGORY },
      { name: "status", label: "Status", type: "select", options: BOOK_STATUS },
      { name: "rating", label: "Rating (0–5)", type: "number", min: 0, max: 5, step: 1 },
      { name: "pages", label: "Total pages", type: "number", min: 0 },
      { name: "pages_read", label: "Pages read", type: "number", min: 0 },
      { name: "started", label: "Started", type: "date" },
      { name: "finished", label: "Finished", type: "date" },
    ],
  },

  subject: {
    key: "subject",
    label: "Subject",
    tag: "subject",
    folder: "01 Foundation/Subjects",
    titleField: "name",
    fields: [
      { name: "name", label: "Subject name", type: "text", required: true, full: true, placeholder: "Constitutional Law" },
      { name: "semester", label: "Semester", type: "select", options: opt("1", "2") },
      { name: "credits", label: "Credits", type: "number", min: 0 },
      { name: "status", label: "Status", type: "select", options: SUBJECT_STATUS },
      { name: "grade", label: "Grade", type: "text", placeholder: "A" },
      { name: "grade_point", label: "Grade point", type: "number", min: 0, max: 4, step: 0.01 },
      { name: "instructor", label: "Instructor", type: "text" },
    ],
  },

  course: {
    key: "course",
    label: "Course",
    tag: "subject",
    folder: "02 LLB/Modules",
    titleField: "name",
    fields: [
      { name: "name", label: "Course name", type: "text", required: true, full: true, placeholder: "Public Law" },
      { name: "credits", label: "Credits", type: "number", min: 0 },
      { name: "status", label: "Status", type: "select", options: SUBJECT_STATUS },
      { name: "grade", label: "Grade", type: "text" },
      { name: "grade_point", label: "Grade point", type: "number", min: 0, max: 4, step: 0.01 },
      { name: "instructor", label: "Instructor", type: "text" },
    ],
  },

  assignment: {
    key: "assignment",
    label: "Assignment",
    tag: "assignment",
    folder: "02 LLB/Assignments",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Judicial review essay" },
      { name: "subject", label: "Subject", type: "text" },
      { name: "due", label: "Due date", type: "date" },
      { name: "weight", label: "Weight (%)", type: "number", min: 0, max: 100 },
      { name: "status", label: "Status", type: "select", options: TASK_STATUS },
    ],
  },

  exam: {
    key: "exam",
    label: "Exam",
    tag: "exam",
    folder: "02 LLB/Exams",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Public Law — Zone A" },
      { name: "subject", label: "Subject", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "location", label: "Location", type: "text" },
      { name: "status", label: "Status", type: "select", options: TASK_STATUS },
    ],
  },

  research: {
    key: "research",
    label: "Research",
    tag: "research-project",
    folder: "06 Research/Projects",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Algorithmic Accountability" },
      { name: "field", label: "Topic / field", type: "text", placeholder: "Technology Law" },
      { name: "status", label: "Status", type: "select", options: RESEARCH_STATUS },
      { name: "due", label: "Due date", type: "date" },
      { name: "target_words", label: "Target words", type: "number", min: 0 },
      { name: "summary", label: "Summary", type: "textarea", full: true },
    ],
  },

  case: {
    key: "case",
    label: "Case / Source",
    tag: "source",
    folder: "06 Research/Sources",
    titleField: "title",
    fixed: { cited: false },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Quintavalle v HFEA [2005] UKHL 28" },
      { name: "author", label: "Author / court", type: "text" },
      { name: "year", label: "Year", type: "number", min: 0, max: 3000 },
      { name: "type", label: "Type", type: "select", options: SOURCE_TYPE },
      { name: "cited", label: "Cited?", type: "select", options: YES_NO },
    ],
  },

  evidence: {
    key: "evidence",
    label: "Evidence",
    tag: "evidence",
    folder: "07 Portfolio",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Moot Court — Best Oralist" },
      { name: "category", label: "Category", type: "select", options: EVIDENCE_CATEGORY },
      { name: "date", label: "Date", type: "date" },
      { name: "outcome", label: "Outcome", type: "textarea", full: true, placeholder: "One line: what was achieved" },
      { name: "skills", label: "Skills", type: "list", placeholder: "research, advocacy" },
      { name: "usable_for", label: "Usable for", type: "list", placeholder: "scholarship, cv" },
      { name: "proof", label: "Proof (link)", type: "text", full: true },
    ],
  },

  vocabulary: {
    key: "vocabulary",
    label: "Vocabulary",
    tag: "vocabulary",
    folder: "03 Legal English/Vocabulary",
    titleField: "term",
    fields: [
      { name: "term", label: "Term", type: "text", required: true, placeholder: "Estoppel" },
      { name: "status", label: "Status", type: "select", options: VOCAB_STATUS },
      { name: "definition", label: "Definition", type: "textarea", required: true, full: true },
      { name: "example", label: "Example sentence", type: "text", full: true },
    ],
  },

  "ielts-mock": {
    key: "ielts-mock",
    label: "IELTS Mock",
    tag: "ielts-mock",
    folder: "03 Legal English/Mock Tests",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Cambridge Mock 15" },
      { name: "date", label: "Date", type: "date" },
      { name: "band_overall", label: "Overall band", type: "number", min: 0, max: 9, step: 0.5 },
      { name: "band_listening", label: "Listening", type: "number", min: 0, max: 9, step: 0.5 },
      { name: "band_reading", label: "Reading", type: "number", min: 0, max: 9, step: 0.5 },
      { name: "band_writing", label: "Writing", type: "number", min: 0, max: 9, step: 0.5 },
      { name: "band_speaking", label: "Speaking", type: "number", min: 0, max: 9, step: 0.5 },
      { name: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },

  scholarship: {
    key: "scholarship",
    label: "Scholarship",
    tag: "scholarship",
    folder: "08 Scholarships",
    titleField: "title",
    fields: [
      { name: "title", label: "Name", type: "text", required: true, full: true, placeholder: "Chevening Scholarship" },
      { name: "provider", label: "Provider", type: "text" },
      { name: "university", label: "University", type: "text" },
      { name: "amount", label: "Amount", type: "text", placeholder: "Full + stipend" },
      { name: "deadline", label: "Deadline", type: "date" },
      { name: "status", label: "Status", type: "select", options: SCHOLARSHIP_STATUS },
      { name: "country", label: "Country", type: "text" },
      { name: "priority_score", label: "Priority (1–5)", type: "number", min: 1, max: 5, step: 1 },
      { name: "eligibility", label: "Eligibility", type: "textarea", full: true },
    ],
  },

  /* ---- Career presets (all #evidence with a preset category) ---- */
  opportunity: {
    key: "opportunity",
    label: "Opportunity",
    tag: "evidence",
    folder: "09 Career",
    titleField: "title",
    fixed: { category: "networking" },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Clifford Chance open day" },
      { name: "organization", label: "Organization", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "outcome", label: "Notes", type: "textarea", full: true },
    ],
  },

  internship: {
    key: "internship",
    label: "Internship",
    tag: "evidence",
    folder: "09 Career",
    titleField: "title",
    fixed: { category: "internship" },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Clifford Chance — Vacation Scheme" },
      { name: "organization", label: "Organization", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "date", label: "Start date", type: "date" },
    ],
  },

  application: {
    key: "application",
    label: "Application",
    tag: "evidence",
    folder: "09 Career",
    titleField: "title",
    fixed: { category: "project" },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Training contract — Application" },
      { name: "organization", label: "Organization", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "outcome", label: "Status / notes", type: "textarea", full: true },
    ],
  },
};

export type EntityKey = keyof typeof ENTITIES;

export function getEntityDef(key: string): EntityDef | undefined {
  return ENTITIES[key];
}

/* ------------------------------------------------------------------ */
/*  Value coercion + frontmatter assembly                             */
/* ------------------------------------------------------------------ */

export type FormValues = Record<string, string>;

function coerce(field: FieldDef, raw: string | undefined): FrontmatterValue {
  const v = (raw ?? "").trim();
  if (field.type === "number") {
    if (v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  if (field.type === "list") {
    return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }
  if (field.name === "cited" || v === "true" || v === "false") {
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return v === "" ? "" : v;
}

/** Build ordered frontmatter entries for a new/edited record. */
export function buildEntries(entity: EntityDef, values: FormValues, opts?: { created?: string }): FrontmatterEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  const entries: FrontmatterEntry[] = [["tags", [entity.tag]]];
  for (const [k, v] of Object.entries(entity.fixed ?? {})) entries.push([k, v]);
  for (const field of entity.fields) entries.push([field.name, coerce(field, values[field.name])]);
  entries.push(["created", opts?.created ?? today]);
  entries.push(["updated", today]);
  return entries;
}

/** Default markdown body for a freshly created note. */
export function bodyFor(entity: EntityDef, values: FormValues): string {
  const title = values[entity.titleField]?.trim() || entity.label;
  return `# ${title}\n`;
}

/** Required-field validation. Returns a map of field → message (empty if valid). */
export function validate(entity: EntityDef, values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of entity.fields) {
    if (field.required && !(values[field.name] ?? "").trim()) {
      errors[field.name] = `${field.label} is required`;
    }
    if (field.type === "number") {
      const raw = (values[field.name] ?? "").trim();
      if (raw !== "") {
        const n = Number(raw);
        if (!Number.isFinite(n)) errors[field.name] = `${field.label} must be a number`;
        else if (field.min !== undefined && n < field.min) errors[field.name] = `${field.label} must be ≥ ${field.min}`;
        else if (field.max !== undefined && n > field.max) errors[field.name] = `${field.label} must be ≤ ${field.max}`;
      }
    }
  }
  return errors;
}

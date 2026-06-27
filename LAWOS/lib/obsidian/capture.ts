/**
 * Quick-capture parsing: "book Constitutional Law" -> create a Book titled
 * "Constitutional Law". The first word is a type keyword; the rest is the title.
 * Pure — safe on client and server.
 */
import { getEntityDef } from "./entities";

/** Keyword (and natural-language synonyms) -> entity key. */
const KEYWORDS: Record<string, string> = {
  book: "book",
  read: "book",
  subject: "subject",
  course: "course",
  module: "course",
  assignment: "assignment",
  essay: "assignment",
  task: "assignment",
  exam: "exam",
  test: "exam",
  midterm: "exam",
  final: "exam",
  vocab: "vocabulary",
  vocabulary: "vocabulary",
  word: "vocabulary",
  term: "vocabulary",
  research: "research",
  paper: "research",
  evidence: "evidence",
  case: "case",
  source: "case",
  scholarship: "scholarship",
  opportunity: "opportunity",
  internship: "internship",
  application: "application",
};

export interface ParsedCapture {
  entityKey: string;
  entityLabel: string;
  title: string;
  keyword: string;
}

export function captureKeywords(): string[] {
  return Object.keys(KEYWORDS);
}

/** Parse a capture string, or null if it doesn't start with a known keyword + title. */
export function parseCapture(input: string): ParsedCapture | null {
  const trimmed = input.trim();
  const m = trimmed.match(/^(\S+)\s+(.+)$/);
  if (!m) return null;
  const keyword = m[1].toLowerCase();
  const entityKey = KEYWORDS[keyword];
  if (!entityKey) return null;
  const entity = getEntityDef(entityKey);
  if (!entity) return null;
  const title = m[2].trim();
  if (!title) return null;
  return { entityKey, entityLabel: entity.label, title, keyword };
}

/** Suggested keyword chips shown in the quick-capture UI. */
export const CAPTURE_HINTS: { keyword: string; label: string }[] = [
  { keyword: "book", label: "Book" },
  { keyword: "assignment", label: "Assignment" },
  { keyword: "exam", label: "Exam" },
  { keyword: "vocab", label: "Vocabulary" },
  { keyword: "research", label: "Research" },
  { keyword: "scholarship", label: "Scholarship" },
];

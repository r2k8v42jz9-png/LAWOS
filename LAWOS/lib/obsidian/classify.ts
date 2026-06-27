/**
 * Classification helpers shared by the search index, the calendar and the
 * adapter — one place that decides, for any note: which area it belongs to,
 * which page opens it, a human label for its kind, and (when editable) which
 * entity key drives its edit form.
 *
 * Pure: safe to import from both server and client.
 */
import { ALL_NAV_ITEMS } from "@/lib/nav";
import type { AreaKey } from "@/lib/data/types";

export function areaFromPath(path: string): AreaKey {
  if (path.startsWith("01 Foundation")) return "foundation";
  if (path.startsWith("02 LLB")) return "llb";
  if (path.startsWith("03 Legal English")) return "legal-english";
  if (path.startsWith("05 Library")) return "reading";
  if (path.startsWith("06 Research")) return "research";
  if (path.startsWith("07 Portfolio") || path.startsWith("09 Career")) return "career";
  if (path.startsWith("08 Scholarships")) return "scholarships";
  return "general";
}

/** The page a record of this area lives on. */
export function hrefForArea(area: AreaKey): string {
  const item = ALL_NAV_ITEMS.find((i) => i.area === area);
  return item?.href ?? "/";
}

/** Known record tags → display label. */
const TAG_LABEL: Record<string, string> = {
  book: "Book",
  subject: "Subject",
  assignment: "Assignment",
  exam: "Exam",
  project: "Project",
  "research-project": "Research",
  "research-paper": "Research",
  source: "Case / Source",
  evidence: "Evidence",
  "ielts-mock": "IELTS Mock",
  vocabulary: "Vocabulary",
  scholarship: "Scholarship",
  university: "University",
  milestone: "Milestone",
};

const KNOWN_TAGS = Object.keys(TAG_LABEL);

/** The primary record tag of a note, if any. */
export function primaryTag(tags: string[]): string | undefined {
  return tags.map((t) => t.replace(/^#/, "")).find((t) => KNOWN_TAGS.includes(t));
}

export interface Classification {
  kind: string; // group key
  kindLabel: string;
  area: AreaKey;
  href: string;
  entityKey?: string;
}

/**
 * Resolve a note's classification from its tags + path + frontmatter category.
 * `tag` may be omitted to classify an untagged general/daily note.
 */
export function classify(path: string, tags: string[], category?: string): Classification {
  const area = areaFromPath(path);
  const href = hrefForArea(area);
  const tag = primaryTag(tags);

  if (!tag) {
    const isDaily = path.startsWith("10 Daily Notes");
    return {
      kind: isDaily ? "daily" : "note",
      kindLabel: isDaily ? "Daily Note" : "Note",
      area,
      href: isDaily ? "/" : href,
    };
  }

  // subject splits into Subject (Foundation) vs Course (LLB) by folder.
  if (tag === "subject") {
    const isCourse = path.startsWith("02 LLB");
    return { kind: "subject", kindLabel: isCourse ? "Course" : "Subject", area, href, entityKey: isCourse ? "course" : "subject" };
  }

  // evidence splits by category into the Career presets.
  if (tag === "evidence") {
    const cat = (category ?? "").toLowerCase();
    const entityKey = cat === "internship" ? "internship" : cat === "networking" ? "opportunity" : cat === "project" ? "application" : "evidence";
    return { kind: "evidence", kindLabel: TAG_LABEL.evidence, area, href, entityKey };
  }

  const ENTITY_BY_TAG: Record<string, string | undefined> = {
    book: "book",
    assignment: "assignment",
    exam: "exam",
    "research-project": "research",
    "research-paper": "research",
    source: "case",
    "ielts-mock": "ielts-mock",
    vocabulary: "vocabulary",
    scholarship: "scholarship",
  };

  return { kind: tag, kindLabel: TAG_LABEL[tag], area, href, entityKey: ENTITY_BY_TAG[tag] };
}

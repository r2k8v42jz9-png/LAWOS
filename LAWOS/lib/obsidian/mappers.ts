/**
 * Pure mappers: ObsidianNote -> LawOS domain entities.
 *
 * Each maps the vault's tag/frontmatter schema (see 90 System/VAULT_ARCHITECTURE)
 * into the types the UI already consumes. They never throw and fill safe
 * defaults for missing fields, so partially-filled notes still render.
 */
import type {
  Assignment,
  Book,
  Evidence,
  Exam,
  IeltsBand,
  MockTest,
  Project,
  Research,
  Scholarship,
  Source,
  Subject,
  TimelineEvent,
  University,
  Status,
} from "@/lib/data/types";
import type { ObsidianNote } from "./client";
import { CHART_PALETTE } from "@/lib/areas";
import {
  str,
  num,
  numOpt,
  list,
  date,
  status as fmStatus,
  priorityFromScore,
  body,
  titleOf,
  progressFromPages,
} from "./frontmatter";

/* stable id from the note path */
const idOf = (n: ObsidianNote) => n.path;

const colorFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return CHART_PALETTE[h % CHART_PALETTE.length];
};

const progressFromStatus = (s: Status): number =>
  s === "done" ? 100 : s === "review" ? 75 : s === "in_progress" ? 50 : 0;

const firstParagraph = (content: string): string => {
  const text = body(content)
    .replace(/^#.*$/gm, "")
    .replace(/^>.*$/gm, "")
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1")
    .trim();
  const para = text.split(/\n\s*\n/).map((p) => p.trim()).find((p) => p.length > 0);
  return para ? para.replace(/\s+/g, " ").slice(0, 240) : "";
};

/* ------------------------------------------------------------------ */

export function mapBook(n: ObsidianNote): Book {
  const fm = n.frontmatter;
  const total = num(fm, "pages", 0);
  const read = num(fm, "pages_read", 0);
  const st = fmStatus(fm, "status", "not_started");
  return {
    id: idOf(n),
    title: titleOf(fm, n.basename),
    author: str(fm, "author", "Unknown"),
    category: str(fm, "category", "General"),
    totalPages: total,
    currentPage: Math.min(read, total || read),
    status: st,
    rating: numOpt(fm, "rating"),
    startedAt: date(fm, "started"),
    finishedAt: date(fm, "finished"),
    coverColor: colorFor(n.basename),
  };
}

export function mapSubject(n: ObsidianNote): Subject {
  const fm = n.frontmatter;
  const st = fmStatus(fm, "status", "in_progress");
  return {
    id: idOf(n),
    code: str(fm, "code", n.basename.split(" ")[0] || "—"),
    name: titleOf(fm, n.basename),
    credits: num(fm, "credits", 0),
    progress: progressFromStatus(st),
    grade: str(fm, "grade") || undefined,
    instructor: str(fm, "instructor") || undefined,
    status: st,
  };
}

export function mapAssignment(n: ObsidianNote): Assignment {
  const fm = n.frontmatter;
  return {
    id: idOf(n),
    title: titleOf(fm, n.basename),
    subject: str(fm, "subject", "—"),
    due: date(fm, "due") ?? date(fm, "date") ?? "",
    status: fmStatus(fm, "status", "not_started"),
    weight: numOpt(fm, "weight"),
  };
}

export function mapExam(n: ObsidianNote): Exam {
  const fm = n.frontmatter;
  return {
    id: idOf(n),
    title: titleOf(fm, n.basename),
    subject: str(fm, "subject", "—"),
    date: date(fm, "date") ?? date(fm, "due") ?? "",
    location: str(fm, "location") || undefined,
    status: fmStatus(fm, "status", "not_started"),
  };
}

export function mapProject(n: ObsidianNote): Project {
  const fm = n.frontmatter;
  const st = fmStatus(fm, "status", "not_started");
  return {
    id: idOf(n),
    title: titleOf(fm, n.basename),
    subject: str(fm, "subject") || undefined,
    progress: numOpt(fm, "progress") ?? progressFromStatus(st),
    due: date(fm, "due"),
    status: st,
  };
}

export function mapUniversity(n: ObsidianNote): University {
  const fm = n.frontmatter;
  return {
    id: idOf(n),
    name: titleOf(fm, n.basename),
    program: str(fm, "programme", str(fm, "program", "—")),
    country: str(fm, "country", "—"),
    ranking: numOpt(fm, "ranking"),
    status: fmStatus(fm, "app_status", "not_started"),
    notes: str(fm, "eligibility") || firstParagraph(n.content) || undefined,
  };
}

/** Pull "- [ ] / - [x]" checklist items from the note body as requirements. */
function requirementsFromBody(content: string): { label: string; met: boolean }[] {
  const out: { label: string; met: boolean }[] = [];
  for (const line of body(content).split("\n")) {
    const m = line.match(/^\s*[-*]\s*\[( |x|X)\]\s+(.*)$/);
    if (m) {
      const label = m[2].replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1").trim();
      if (label) out.push({ label, met: m[1].toLowerCase() === "x" });
    }
  }
  return out;
}

const SCHOLARSHIP_PROGRESS: Record<string, number> = {
  researching: 10,
  eligible: 25,
  preparing: 55,
  applied: 85,
  awarded: 100,
  rejected: 0,
};

export function mapScholarship(n: ObsidianNote): Scholarship {
  const fm = n.frontmatter;
  const rawStatus = str(fm, "status").toLowerCase();
  return {
    id: idOf(n),
    name: titleOf(fm, n.basename),
    provider: str(fm, "provider", "—"),
    amount: str(fm, "amount") || undefined,
    deadline: date(fm, "deadline") ?? "",
    priority: priorityFromScore(numOpt(fm, "priority_score")),
    status: fmStatus(fm, "status", "not_started"),
    progress: SCHOLARSHIP_PROGRESS[rawStatus] ?? 0,
    requirements: requirementsFromBody(n.content),
    country: str(fm, "country") || undefined,
  };
}

const EVIDENCE_KIND: Record<string, Evidence["kind"]> = {
  certificate: "certificate",
  gpa: "certificate",
  research: "publication",
  publication: "publication",
  competition: "award",
  award: "award",
  "public-speaking": "experience",
  leadership: "experience",
  volunteering: "experience",
  networking: "experience",
  internship: "experience",
  project: "project",
  portfolio: "project",
};

export function mapEvidence(n: ObsidianNote): Evidence {
  const fm = n.frontmatter;
  const category = str(fm, "category", "project").toLowerCase();
  return {
    id: idOf(n),
    title: titleOf(fm, n.basename).replace(/^Evidence\s*[—-]\s*/i, ""),
    kind: EVIDENCE_KIND[category] ?? "experience",
    date: date(fm, "date") ?? "",
    description: str(fm, "outcome") || firstParagraph(n.content) || undefined,
    area: "career",
  };
}

export function mapMockTest(n: ObsidianNote): MockTest {
  const fm = n.frontmatter;
  const band = (skill: IeltsBand["skill"], key: string): IeltsBand => ({
    skill,
    current: num(fm, key, 0),
    target: 9,
  });
  return {
    id: idOf(n),
    title: titleOf(fm, n.basename),
    date: date(fm, "date") ?? "",
    overall: num(fm, "band_overall", 0),
    bands: [
      band("Listening", "band_listening"),
      band("Reading", "band_reading"),
      band("Writing", "band_writing"),
      band("Speaking", "band_speaking"),
    ],
  };
}

export function mapResearch(n: ObsidianNote): Research {
  const fm = n.frontmatter;
  const st = fmStatus(fm, "status", "not_started");
  return {
    id: idOf(n),
    title: titleOf(fm, n.basename),
    field: str(fm, "field", str(fm, "area", "Research")),
    progress: numOpt(fm, "progress") ?? progressFromStatus(st),
    status: st,
    due: date(fm, "due"),
    wordCount: numOpt(fm, "word_count") ?? numOpt(fm, "words"),
    targetWords: numOpt(fm, "target_words"),
    summary: str(fm, "summary") || firstParagraph(n.content) || undefined,
  };
}

export function mapSource(n: ObsidianNote): Source {
  const fm = n.frontmatter;
  const rawType = str(fm, "type", "article").toLowerCase();
  const type = (["case", "statute", "article", "book", "report"] as const).includes(rawType as any)
    ? (rawType as Source["type"])
    : "article";
  return {
    id: idOf(n),
    title: titleOf(fm, n.basename),
    author: str(fm, "author") || undefined,
    year: numOpt(fm, "year"),
    type,
    cited: String(fm["cited"]).toLowerCase() === "true",
  };
}

export function mapMilestone(n: ObsidianNote): TimelineEvent {
  const fm = n.frontmatter;
  return {
    id: idOf(n),
    title: titleOf(fm, n.basename),
    date: date(fm, "due") ?? date(fm, "date") ?? "",
    kind: "milestone",
    done: fmStatus(fm, "status", "not_started") === "done",
  };
}

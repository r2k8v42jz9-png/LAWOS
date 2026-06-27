/**
 * Obsidian vault adapter — the live data source for LawOS.
 *
 * Implements the same `DataAdapter` contract the UI already consumes, reading
 * everything from the Obsidian Local REST API. No data is hardcoded: records
 * come from tagged notes, and aggregates (GPA, deadlines, distribution, recent
 * activity) are *computed* from those records. Missing tags/folders simply
 * yield empty arrays, so every page degrades gracefully on an empty vault.
 */
import type { DataAdapter } from "@/lib/data/adapter";
import type {
  ActivityItem,
  ActivityKind,
  AnalyticsData,
  AreaKey,
  AreaProgress,
  CareerData,
  DashboardData,
  Deadline,
  FoundationData,
  LLBData,
  LegalEnglishData,
  ReadingData,
  ResearchData,
  ScholarshipsData,
  SeriesPoint,
  SettingsData,
  Stat,
  Task,
  TimelineEvent,
} from "@/lib/data/types";
import { getNote, getNotesByTag, ping, type ObsidianNote } from "./client";
import { obsidianConfig } from "./config";
import {
  mapAssignment,
  mapBook,
  mapEvidence,
  mapExam,
  mapMilestone,
  mapMockTest,
  mapProject,
  mapResearch,
  mapScholarship,
  mapSource,
  mapSubject,
  mapUniversity,
} from "./mappers";
import { str, num, numOpt, body } from "./frontmatter";
import { daysUntil } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function areaFromPath(path: string): AreaKey {
  if (path.startsWith("01 Foundation")) return "foundation";
  if (path.startsWith("02 LLB")) return "llb";
  if (path.startsWith("03 Legal English")) return "legal-english";
  if (path.startsWith("05 Library")) return "reading";
  if (path.startsWith("06 Research")) return "research";
  if (path.startsWith("07 Portfolio") || path.startsWith("09 Career")) return "career";
  if (path.startsWith("08 Scholarships")) return "scholarships";
  return "general";
}

function kindFromTags(tags: string[]): ActivityKind {
  if (tags.includes("book")) return "reading";
  if (tags.some((t) => t.startsWith("research") || t === "source")) return "research";
  if (tags.includes("evidence")) return "evidence";
  if (tags.includes("ielts-mock") || tags.includes("ielts-error")) return "review";
  if (tags.includes("milestone")) return "milestone";
  if (["subject", "assignment", "exam", "project"].some((t) => tags.includes(t))) return "task";
  return "note";
}

/** Weighted GPA from #subject notes that carry a numeric grade_point + credits. */
function computeGpa(subjects: ObsidianNote[]): number {
  let points = 0;
  let credits = 0;
  for (const n of subjects) {
    const gp = numOpt(n.frontmatter, "grade_point");
    const cr = num(n.frontmatter, "credits", 0);
    if (gp !== undefined && cr > 0) {
      points += gp * cr;
      credits += cr;
    }
  }
  return credits > 0 ? Math.round((points / credits) * 100) / 100 : 0;
}

function recentActivity(notes: ObsidianNote[], limit = 6): ActivityItem[] {
  return [...notes]
    .filter((n) => n.stat?.mtime)
    .sort((a, b) => b.stat.mtime - a.stat.mtime)
    .slice(0, limit)
    .map((n) => ({
      id: n.path,
      kind: kindFromTags(n.tags),
      title: str(n.frontmatter, "title", n.basename),
      area: areaFromPath(n.path),
      timestamp: new Date(n.stat.mtime).toISOString(),
    }));
}

/** Activity-per-weekday over the last 7 days, from note modification times. */
function focusFromActivity(notes: ObsidianNote[]): SeriesPoint[] {
  const counts = new Array(7).fill(0);
  const now = Date.now();
  for (const n of notes) {
    if (!n.stat?.mtime) continue;
    if (now - n.stat.mtime > 7 * 86_400_000) continue;
    counts[new Date(n.stat.mtime).getDay()]++;
  }
  // Mon..Sun ordering to match the UI's week.
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((d) => ({ label: WEEKDAYS[d], value: counts[d] }));
}

function distribution(buckets: { area: AreaKey; label: string; value: number }[]) {
  const total = buckets.reduce((s, b) => s + b.value, 0);
  if (!total) return [];
  return buckets
    .filter((b) => b.value > 0)
    .map((b) => ({ ...b, value: Math.round((b.value / total) * 100) }));
}

function deadlinesFrom(
  items: { id: string; title: string; date: string; area: AreaKey; priority: Task["priority"] }[],
  limit = 6
): Deadline[] {
  return items
    .filter((i) => i.date)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
    .slice(0, limit)
    .map((i) => ({ id: i.id, title: i.title, area: i.area, date: i.date, priority: i.priority }));
}

/* ------------------------------------------------------------------ */
/*  Adapter                                                            */
/* ------------------------------------------------------------------ */

export const obsidianAdapter: DataAdapter = {
  id: "obsidian",

  /* ---------- Foundation ---------- */
  async getFoundationData(): Promise<FoundationData> {
    const [subjectNotes, assignmentNotes, examNotes, projectNotes, milestoneNotes] = await Promise.all([
      getNotesByTag("subject"),
      getNotesByTag("assignment"),
      getNotesByTag("exam"),
      getNotesByTag("project"),
      getNotesByTag("milestone"),
    ]);

    const subjects = subjectNotes.map(mapSubject);
    const assignments = assignmentNotes.map(mapAssignment);
    const exams = examNotes.map(mapExam);
    const projects = projectNotes.map(mapProject);

    const creditsEarned = subjects.filter((s) => s.status === "done").reduce((s, x) => s + x.credits, 0);
    const creditsTotal = subjects.reduce((s, x) => s + x.credits, 0);
    const semesterProgress = subjects.length
      ? Math.round((subjects.filter((s) => s.status === "done").length / subjects.length) * 100)
      : 0;

    const timeline: TimelineEvent[] = [
      ...milestoneNotes.map(mapMilestone),
      ...exams.map((e) => ({ id: e.id, title: e.title, date: e.date, kind: "exam" as const, done: e.status === "done" })),
      ...assignments.map((a) => ({ id: a.id, title: a.title, date: a.due, kind: "assignment" as const, done: a.status === "done" })),
    ]
      .filter((t) => t.date)
      .sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

    return {
      semester: { name: "Foundation in Arts", progress: semesterProgress, start: "", end: "" },
      gpa: computeGpa(subjectNotes),
      creditsEarned,
      creditsTotal,
      subjects,
      assignments,
      exams,
      projects,
      timeline,
    };
  },

  /* ---------- LLB ---------- */
  async getLLBData(): Promise<LLBData> {
    const [subjectNotes, universityNotes, milestoneNotes] = await Promise.all([
      getNotesByTag("subject"),
      getNotesByTag("university"),
      getNotesByTag("milestone"),
    ]);

    // LLB-specific modules/milestones live under the "02 LLB" folder.
    const modules = subjectNotes.filter((n) => n.path.startsWith("02 LLB")).map(mapSubject);
    const universities = universityNotes.map(mapUniversity);
    const creditsEarned = modules.filter((m) => m.status === "done").reduce((s, m) => s + m.credits, 0);
    const creditsTotal = modules.reduce((s, m) => s + m.credits, 0);

    const timeline = milestoneNotes
      .filter((n) => n.path.startsWith("02 LLB"))
      .map(mapMilestone)
      .filter((t) => t.date)
      .sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

    return {
      program: obsidianConfig.vaultName.includes("LLB") ? obsidianConfig.vaultName : "LLB (Hons)",
      year: 1,
      gpa: computeGpa(subjectNotes.filter((n) => n.path.startsWith("02 LLB"))),
      creditsEarned,
      creditsTotal,
      modules,
      universities,
      assignments: [],
      exams: [],
      timeline,
    };
  },

  /* ---------- Legal English ---------- */
  async getLegalEnglishData(): Promise<LegalEnglishData> {
    const [mockNotes, dash] = await Promise.all([
      getNotesByTag("ielts-mock"),
      getNote("03 Legal English/IELTS Dashboard.md"),
    ]);
    const dfm = dash?.frontmatter ?? {};
    const targetOverall = numOpt(dfm, "target_band") ?? 8.0;
    const targetEach = numOpt(dfm, "target_each") ?? targetOverall;

    const mocks = mockNotes
      .map(mapMockTest)
      .filter((m) => m.date)
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    const latest = mocks[0];
    // Overall band: latest mock → IELTS Dashboard `current_band` → 0.
    const overall = latest?.overall ?? numOpt(dfm, "current_band") ?? 0;
    const dashBand = (skill: string, key: string) => ({
      skill: skill as "Listening" | "Reading" | "Writing" | "Speaking",
      current: numOpt(dfm, key) ?? 0,
      target: targetEach,
    });
    const bands = latest
      ? latest.bands.map((b) => ({ ...b, target: targetEach }))
      : [
          dashBand("Listening", "band_listening"),
          dashBand("Reading", "band_reading"),
          dashBand("Writing", "band_writing"),
          dashBand("Speaking", "band_speaking"),
        ];

    const progressSeries: SeriesPoint[] = [...mocks]
      .reverse()
      .map((m) => ({ label: MONTHS[new Date(m.date).getMonth()] ?? m.title, value: m.overall }));

    const bandOf = (s: string) => bands.find((b) => b.skill === s)?.current ?? 0;
    const skills = {
      writing: Math.round((bandOf("Writing") / 9) * 100),
      speaking: Math.round((bandOf("Speaking") / 9) * 100),
      reading: Math.round((bandOf("Reading") / 9) * 100),
      listening: Math.round((bandOf("Listening") / 9) * 100),
    };

    const stats: Stat[] = [
      { id: "ov", label: "Overall Band", value: overall ? overall.toFixed(1) : "—", hint: `target ${targetOverall.toFixed(1)}`, progress: Math.round((overall / 9) * 100) },
      { id: "mock", label: "Mock Tests", value: mocks.length, hint: mocks.length ? `latest ${overall.toFixed(1)}` : "none yet" },
      { id: "writing", label: "Writing", value: bandOf("Writing") ? bandOf("Writing").toFixed(1) : "—", hint: "focus area", progress: skills.writing },
      { id: "speaking", label: "Speaking", value: bandOf("Speaking") ? bandOf("Speaking").toFixed(1) : "—", progress: skills.speaking },
    ];

    return {
      ielts: { overall, target: targetOverall, bands },
      progressSeries,
      vocabulary: [],
      mockTests: mocks,
      stats,
      skills,
    };
  },

  /* ---------- Reading ---------- */
  async getReadingData(): Promise<ReadingData> {
    const [bookNotes, dashboard] = await Promise.all([
      getNotesByTag("book"),
      getNote("05 Library/Reading Dashboard.md"),
    ]);

    const books = bookNotes.map(mapBook).sort((a, b) => (a.status === "in_progress" ? -1 : 0));
    const finished = books.filter((b) => b.status === "done");
    const inProgress = books.filter((b) => b.status === "in_progress");
    const currentBook = [...inProgress].sort((a, b) => b.currentPage - a.currentPage)[0];

    const goalTarget =
      numOpt(dashboard?.frontmatter ?? {}, "books_goal") ??
      numOpt(dashboard?.frontmatter ?? {}, "goal") ??
      numOpt(dashboard?.frontmatter ?? {}, "reading_goal") ??
      books.length;

    // Pages per month from finished books (real, derived from `finished` dates).
    const pagesByMonth = new Map<number, number>();
    for (const b of finished) {
      if (!b.finishedAt) continue;
      const m = new Date(b.finishedAt).getMonth();
      pagesByMonth.set(m, (pagesByMonth.get(m) ?? 0) + b.totalPages);
    }
    const pagesSeries: SeriesPoint[] = [...pagesByMonth.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([m, v]) => ({ label: MONTHS[m], value: v }));

    // Book notes: blockquote lines pulled from each book's body.
    const notes = bookNotes
      .flatMap((n) => {
        const quotes = body(n.content)
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith(">") && l.replace(/^>+\s*/, "").length > 8)
          .slice(0, 1)
          .map((l, i) => ({
            id: `${n.path}#${i}`,
            bookId: n.path,
            bookTitle: str(n.frontmatter, "title", n.basename),
            excerpt: l.replace(/^>+\s*/, ""),
            createdAt: new Date(n.stat.mtime).toISOString().slice(0, 10),
          }));
        return quotes;
      })
      .slice(0, 6);

    const pagesRead = books.reduce((s, b) => s + b.currentPage, 0);
    const stats: Stat[] = [
      { id: "books", label: "Books Read", value: finished.length, hint: `of ${goalTarget} goal`, progress: goalTarget ? Math.round((finished.length / goalTarget) * 100) : 0 },
      { id: "reading", label: "In Progress", value: inProgress.length },
      { id: "pages", label: "Pages Read", value: pagesRead },
      { id: "library", label: "In Library", value: books.length },
    ];

    return {
      goal: { target: goalTarget, completed: finished.length, year: new Date().getFullYear() },
      stats,
      currentBook,
      books,
      notes,
      pagesSeries,
    };
  },

  /* ---------- Research ---------- */
  async getResearchData(): Promise<ResearchData> {
    const [projectNotes, paperNotes, sourceNotes] = await Promise.all([
      getNotesByTag("research-project"),
      getNotesByTag("research-paper"),
      getNotesByTag("source"),
    ]);

    const ideaNotes = projectNotes.filter((n) => str(n.frontmatter, "status").toLowerCase() === "idea");
    const activeProjectNotes = projectNotes.filter((n) => str(n.frontmatter, "status").toLowerCase() !== "idea");

    const projects = [...activeProjectNotes, ...paperNotes].map(mapResearch);
    const ideas = ideaNotes.map((n) => ({
      id: n.path,
      title: str(n.frontmatter, "title", n.basename),
      field: str(n.frontmatter, "field", str(n.frontmatter, "area", "Research")),
      createdAt: new Date(n.stat.mtime).toISOString().slice(0, 10),
      promise: "medium" as const,
    }));
    const sources = sourceNotes.map(mapSource);

    const deadlines = deadlinesFrom(
      projects.filter((p) => p.due).map((p) => ({ id: p.id, title: p.title, date: p.due!, area: "research" as const, priority: "medium" as const }))
    );

    const words = projects.reduce((s, p) => s + (p.wordCount ?? 0), 0);
    const stats: Stat[] = [
      { id: "active", label: "Active Projects", value: projects.filter((p) => p.status !== "done").length },
      { id: "words", label: "Words Written", value: words >= 1000 ? `${(words / 1000).toFixed(1)}k` : words },
      { id: "sources", label: "Sources", value: sources.length, hint: `${sources.filter((s) => s.cited).length} cited` },
      { id: "ideas", label: "Open Ideas", value: ideas.length },
    ];

    return { projects, ideas, sources, deadlines, stats };
  },

  /* ---------- Scholarships ---------- */
  async getScholarshipsData(): Promise<ScholarshipsData> {
    const notes = await getNotesByTag("scholarship");
    const scholarships = notes.map(mapScholarship);

    const deadlines = deadlinesFrom(
      scholarships
        .filter((s) => s.deadline)
        .map((s) => ({ id: s.id, title: s.name, date: s.deadline, area: "scholarships" as const, priority: s.priority }))
    );

    const nextDays = deadlines.length ? daysUntil(deadlines[0].date) : undefined;
    const avgReady = scholarships.length
      ? Math.round(scholarships.reduce((s, x) => s + x.progress, 0) / scholarships.length)
      : 0;

    const stats: Stat[] = [
      { id: "active", label: "Active Applications", value: scholarships.filter((s) => s.status !== "archived").length },
      { id: "awarded", label: "Awarded", value: scholarships.filter((s) => s.status === "done").length },
      { id: "next", label: "Next Deadline", value: nextDays !== undefined ? `${Math.max(nextDays, 0)} days` : "—", hint: deadlines[0]?.title },
      { id: "ready", label: "Avg. Readiness", value: `${avgReady}%`, progress: avgReady },
    ];

    return { scholarships, deadlines, stats };
  },

  /* ---------- Career ---------- */
  async getCareerData(): Promise<CareerData> {
    const evidenceNotes = await getNotesByTag("evidence");
    const evidence = evidenceNotes.map(mapEvidence).sort((a, b) => (a.date < b.date ? 1 : -1));

    const portfolio = evidence
      .filter((e) => e.kind === "project" || e.kind === "publication")
      .map((e) => ({ id: e.id, title: e.title, type: e.kind, date: e.date, url: "#" }));

    const internships = evidenceNotes
      .filter((n) => str(n.frontmatter, "category").toLowerCase() === "internship")
      .map((n) => ({
        id: n.path,
        organization: str(n.frontmatter, "organization", str(n.frontmatter, "title", n.basename)),
        role: str(n.frontmatter, "role", "Intern"),
        start: str(n.frontmatter, "date") || undefined,
        status: "in_progress" as const,
        location: str(n.frontmatter, "location") || undefined,
      }));

    // Skills: frequency of `skills:` across evidence notes.
    const skillCount = new Map<string, number>();
    for (const n of evidenceNotes) {
      const skills = Array.isArray(n.frontmatter.skills) ? (n.frontmatter.skills as string[]) : [];
      for (const s of skills) {
        const key = String(s).trim();
        if (key) skillCount.set(key, (skillCount.get(key) ?? 0) + 1);
      }
    }
    const skills = [...skillCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], i) => ({
        id: `sk-${i}`,
        name: name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        category: "Evidence",
        level: Math.min(100, count * 25),
      }));

    const achievements = evidence
      .filter((e) => e.kind === "award")
      .map((e) => ({ id: e.id, title: e.title, date: e.date, description: e.description }));

    const stats: Stat[] = [
      { id: "evid", label: "Evidence Logged", value: evidence.length },
      { id: "intern", label: "Internships", value: internships.length },
      { id: "skills", label: "Skills Tracked", value: skills.length },
      { id: "awards", label: "Awards", value: achievements.length },
    ];

    return { portfolio, evidence, internships, skills, achievements, stats };
  },

  /* ---------- Analytics ---------- */
  async getAnalyticsData(): Promise<AnalyticsData> {
    const [subjects, books, research, papers, ielts, scholarships, evidence] = await Promise.all([
      getNotesByTag("subject"),
      getNotesByTag("book"),
      getNotesByTag("research-project"),
      getNotesByTag("research-paper"),
      getNotesByTag("ielts-mock"),
      getNotesByTag("scholarship"),
      getNotesByTag("evidence"),
    ]);
    const all = [...subjects, ...books, ...research, ...papers, ...ielts, ...scholarships, ...evidence];

    const areaDistribution = distribution([
      { area: "foundation", label: "Foundation", value: subjects.length },
      { area: "reading", label: "Reading", value: books.length },
      { area: "research", label: "Research", value: research.length + papers.length },
      { area: "legal-english", label: "Legal English", value: ielts.length },
      { area: "scholarships", label: "Scholarships", value: scholarships.length },
      { area: "career", label: "Career", value: evidence.length },
    ]);

    // GPA by semester (1 & 2) from #subject notes.
    const gpaSeries: SeriesPoint[] = [1, 2]
      .map((sem) => {
        const inSem = subjects.filter((n) => num(n.frontmatter, "semester", 0) === sem);
        return { label: `S${sem}`, value: computeGpa(inSem), n: inSem.length };
      })
      .filter((p) => p.n > 0)
      .map(({ label, value }) => ({ label, value }));

    // Books finished per month.
    const finishedByMonth = new Map<number, number>();
    for (const n of books) {
      const fin = str(n.frontmatter, "finished");
      const m = fin.match(/\d{4}-(\d{2})-\d{2}/);
      if (m) {
        const idx = parseInt(m[1], 10) - 1;
        finishedByMonth.set(idx, (finishedByMonth.get(idx) ?? 0) + 1);
      }
    }
    const readingSeries: SeriesPoint[] = [...finishedByMonth.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([m, v]) => ({ label: MONTHS[m], value: v }));

    const productivityByDay = focusFromActivity(all).map((p) => ({ label: p.label, value: p.value }));
    const gpa = computeGpa(subjects);

    const stats: Stat[] = [
      { id: "notes", label: "Records Tracked", value: all.length, hint: "across the vault" },
      { id: "gpa", label: "Current GPA", value: gpa ? gpa.toFixed(2) : "—", progress: gpa ? Math.round((gpa / 4) * 100) : 0 },
      { id: "books", label: "Books Finished", value: books.filter((n) => str(n.frontmatter, "status").toLowerCase() === "finished").length },
      { id: "apps", label: "Applications", value: scholarships.length },
    ];

    return {
      stats,
      focusSeries: focusFromActivity(all).map((p) => ({ label: p.label, value: p.value })),
      areaDistribution,
      gpaSeries,
      readingSeries,
      productivityByDay,
      streak: { current: 0, best: 0, days: new Array(14).fill(false) },
    };
  },

  /* ---------- Dashboard (composed) ---------- */
  async getDashboardData(): Promise<DashboardData> {
    const [subjects, assignments, exams, projects, books, research, papers, ielts, scholarships, evidence, home] =
      await Promise.all([
        getNotesByTag("subject"),
        getNotesByTag("assignment"),
        getNotesByTag("exam"),
        getNotesByTag("project"),
        getNotesByTag("book"),
        getNotesByTag("research-project"),
        getNotesByTag("research-paper"),
        getNotesByTag("ielts-mock"),
        getNotesByTag("scholarship"),
        getNotesByTag("evidence"),
        getNote("00 Dashboard/HOME.md"),
      ]);

    const all = [...subjects, ...assignments, ...exams, ...projects, ...books, ...research, ...papers, ...ielts, ...scholarships, ...evidence];
    const gpa = computeGpa(subjects);

    // Tasks = assignments/exams/projects not yet done, with a due date.
    const taskItems: Task[] = [
      ...assignments.map(mapAssignment).map((a) => ({ id: a.id, title: a.title, area: "foundation" as AreaKey, status: a.status, priority: "high" as const, due: a.due, done: a.status === "done" })),
      ...exams.map(mapExam).map((e) => ({ id: e.id, title: e.title, area: "foundation" as AreaKey, status: e.status, priority: "high" as const, due: e.date, done: e.status === "done" })),
      ...projects.map(mapProject).map((p) => ({ id: p.id, title: p.title, area: "foundation" as AreaKey, status: p.status, priority: "medium" as const, due: p.due, done: p.status === "done" })),
    ].filter((t) => t.due);

    const todaysTasks = taskItems
      .filter((t) => !t.done && daysUntil(t.due!) <= 7)
      .sort((a, b) => daysUntil(a.due!) - daysUntil(b.due!))
      .slice(0, 6);

    const overdue = taskItems.filter((t) => !t.done && daysUntil(t.due!) < 0).length;
    const dueThisWeek = taskItems.filter((t) => !t.done && daysUntil(t.due!) >= 0 && daysUntil(t.due!) <= 7).length;

    // Deadlines across areas.
    const upcomingDeadlines = deadlinesFrom([
      ...assignments.map(mapAssignment).map((a) => ({ id: a.id, title: a.title, date: a.due, area: "foundation" as AreaKey, priority: "high" as const })),
      ...exams.map(mapExam).map((e) => ({ id: e.id, title: e.title, date: e.date, area: "foundation" as AreaKey, priority: "high" as const })),
      ...scholarships.map(mapScholarship).map((s) => ({ id: s.id, title: s.name, date: s.deadline, area: "scholarships" as AreaKey, priority: s.priority })),
      ...[...research, ...papers].map(mapResearch).filter((r) => r.due).map((r) => ({ id: r.id, title: r.title, date: r.due!, area: "research" as AreaKey, priority: "medium" as const })),
    ].filter((d) => d.date && daysUntil(d.date) >= -3));

    // Per-area progress (computed, honest).
    const mockSorted = ielts.map(mapMockTest).filter((m) => m.date).sort((a, b) => (a.date < b.date ? 1 : -1));
    const ieltsOverall = mockSorted[0]?.overall ?? 0;
    const finishedBooks = books.filter((n) => str(n.frontmatter, "status").toLowerCase() === "finished").length;
    const doneSubjects = subjects.filter((n) => str(n.frontmatter, "status").toLowerCase() === "completed").length;
    const scholarshipObjs = scholarships.map(mapScholarship);

    const areaProgress: AreaProgress[] = [
      { area: "foundation", label: "Foundation", progress: subjects.length ? Math.round((doneSubjects / subjects.length) * 100) : 0, caption: `${doneSubjects}/${subjects.length} subjects complete` },
      { area: "reading", label: "Reading", progress: books.length ? Math.round((finishedBooks / Math.max(books.length, finishedBooks)) * 100) : 0, caption: `${finishedBooks} books finished` },
      { area: "research", label: "Research", progress: research.length + papers.length ? Math.round(([...research, ...papers].map(mapResearch).reduce((s, r) => s + r.progress, 0)) / (research.length + papers.length)) : 0, caption: `${research.length + papers.length} projects` },
      { area: "legal-english", label: "Legal English", progress: Math.round((ieltsOverall / 9) * 100), caption: ieltsOverall ? `Band ${ieltsOverall.toFixed(1)}` : "No mocks yet" },
      { area: "scholarships", label: "Scholarships", progress: scholarshipObjs.length ? Math.round(scholarshipObjs.reduce((s, x) => s + x.progress, 0) / scholarshipObjs.length) : 0, caption: `${scholarshipObjs.length} applications` },
      { area: "career", label: "Career", progress: evidence.length ? Math.min(100, evidence.length * 10) : 0, caption: `${evidence.length} evidences logged` },
    ];

    const currentBook = books.map(mapBook).filter((b) => b.status === "in_progress").sort((a, b) => b.currentPage - a.currentPage)[0];
    const currentResearch = [...research, ...papers].map(mapResearch).filter((r) => r.status !== "done").sort((a, b) => b.progress - a.progress)[0];
    const recentEvidence = evidence.map(mapEvidence).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);

    const mission =
      str(home?.frontmatter ?? {}, "mission") ||
      str(home?.frontmatter ?? {}, "focus") ||
      (todaysTasks.length
        ? `You have ${todaysTasks.length} task${todaysTasks.length > 1 ? "s" : ""} on deck and ${upcomingDeadlines.length} deadline${upcomingDeadlines.length !== 1 ? "s" : ""} ahead. Keep the streak alive.`
        : "Your vault is connected. Add tasks, books, and research notes in Obsidian and they'll appear here.");

    const stats: Stat[] = [
      { id: "tasks", label: "Today's Tasks", value: todaysTasks.length, hint: `${taskItems.filter((t) => t.done).length} done` },
      { id: "overdue", label: "Overdue", value: overdue, hint: overdue ? "needs attention" : "all clear" },
      { id: "week", label: "Due This Week", value: dueThisWeek },
      { id: "gpa", label: "Current GPA", value: gpa ? gpa.toFixed(2) : "—", progress: gpa ? Math.round((gpa / 4) * 100) : 0 },
      { id: "ielts", label: "IELTS Progress", value: ieltsOverall ? ieltsOverall.toFixed(1) : "—", hint: "target 8.0", progress: Math.round((ieltsOverall / 9) * 100) },
    ];

    return {
      missionToday: mission,
      gpa,
      stats,
      areaProgress,
      focusSeries: focusFromActivity(all),
      areaDistribution: distribution([
        { area: "foundation", label: "Foundation", value: subjects.length },
        { area: "reading", label: "Reading", value: books.length },
        { area: "research", label: "Research", value: research.length + papers.length },
        { area: "legal-english", label: "Legal English", value: ielts.length },
        { area: "scholarships", label: "Scholarships", value: scholarships.length },
        { area: "career", label: "Career", value: evidence.length },
      ]),
      recentActivity: recentActivity(all),
      upcomingDeadlines,
      todaysTasks,
      recentEvidence,
      currentBook,
      currentResearch,
    };
  },

  /* ---------- Settings ---------- */
  async getSettings(): Promise<SettingsData> {
    const alive = await ping();
    return {
      vaultPath: obsidianConfig.apiUrl,
      vaultName: obsidianConfig.vaultName,
      theme: "dark",
      adapter: "obsidian",
      sync: {
        state: alive ? "synced" : "disconnected",
        lastSync: alive ? new Date().toISOString() : undefined,
        provider: "Obsidian Local REST API",
      },
      plugins: [
        { id: "local-rest", name: "Local REST API", enabled: alive, version: "—" },
      ],
    };
  },
};

/**
 * Mock adapter — deterministic, hand-authored data that mirrors the real vault
 * shape. This is the ONLY place mock data lives. Components never import it.
 *
 * When the Obsidian reader lands, this file is simply no longer selected by the
 * factory in `index.ts`; nothing else changes.
 */
import type { DataAdapter } from "./adapter";
import type {
  AnalyticsData,
  CareerData,
  DashboardData,
  FoundationData,
  LLBData,
  LegalEnglishData,
  ReadingData,
  ResearchData,
  ScholarshipsData,
  SettingsData,
} from "./types";

/* A fixed "now" keeps the demo coherent regardless of wall-clock time. */
const TODAY = "2026-06-27";
const d = (s: string) => s; // readability helper for ISO dates

/* ------------------------------------------------------------------ */
/*  Books (referenced by both Reading and Dashboard)                   */
/* ------------------------------------------------------------------ */

const currentBook = {
  id: "bk-constitutional",
  title: "Constitutional & Administrative Law",
  author: "Hilaire Barnett",
  category: "Public Law",
  totalPages: 812,
  currentPage: 486,
  status: "in_progress" as const,
  rating: 5,
  startedAt: d("2026-05-10"),
  coverColor: "#6366f1",
};

const currentResearch = {
  id: "rs-ai-liability",
  title: "Algorithmic Accountability: Liability for Autonomous Systems",
  field: "Technology Law",
  progress: 62,
  status: "in_progress" as const,
  due: d("2026-08-15"),
  wordCount: 7400,
  targetWords: 12000,
  summary:
    "A comparative analysis of liability frameworks for AI-driven decisions across EU, UK and US jurisdictions.",
};

/* ------------------------------------------------------------------ */
/*  Adapter implementation                                             */
/* ------------------------------------------------------------------ */

export const mockAdapter: DataAdapter = {
  id: "mock",

  async getDashboardData(): Promise<DashboardData> {
    return {
      missionToday:
        "Finish the Constitutional Law chapter, draft 800 words of the AI liability paper, and clear two IELTS writing tasks.",
      gpa: 3.86,
      stats: [
        { id: "tasks", label: "Today's Tasks", value: 6, hint: "2 completed", progress: 33 },
        {
          id: "overdue",
          label: "Overdue",
          value: 1,
          hint: "Cite-check memo",
          trend: { delta: -2, direction: "down", label: "vs last week" },
        },
        {
          id: "week",
          label: "Due This Week",
          value: 9,
          hint: "across 4 areas",
          trend: { delta: 3, direction: "up", label: "vs last week" },
        },
        {
          id: "gpa",
          label: "Current GPA",
          value: "3.86",
          hint: "Top 5% of cohort",
          trend: { delta: 0.08, direction: "up", label: "this semester" },
          progress: 96,
        },
        {
          id: "ielts",
          label: "IELTS Progress",
          value: "7.5",
          hint: "target 8.0",
          trend: { delta: 0.5, direction: "up", label: "since March" },
          progress: 88,
        },
      ],
      areaProgress: [
        { area: "foundation", label: "Foundation", progress: 78, caption: "Semester 2 · 78% complete", trend: { delta: 6, direction: "up" } },
        { area: "llb", label: "LLB", progress: 41, caption: "Year 1 modules underway", trend: { delta: 4, direction: "up" } },
        { area: "reading", label: "Reading", progress: 64, caption: "16 / 25 books this year", trend: { delta: 8, direction: "up" } },
        { area: "research", label: "Research", progress: 62, caption: "AI liability paper", trend: { delta: 5, direction: "up" } },
        { area: "legal-english", label: "Legal English", progress: 88, caption: "Band 7.5 → 8.0", trend: { delta: 3, direction: "up" } },
        { area: "scholarships", label: "Scholarships", progress: 55, caption: "4 active applications", trend: { delta: 2, direction: "up" } },
        { area: "career", label: "Career", progress: 47, caption: "Portfolio + 12 evidences", trend: { delta: 9, direction: "up" } },
      ],
      focusSeries: [
        { label: "Mon", value: 4.2 },
        { label: "Tue", value: 5.6 },
        { label: "Wed", value: 3.1 },
        { label: "Thu", value: 6.0 },
        { label: "Fri", value: 4.8 },
        { label: "Sat", value: 7.2 },
        { label: "Sun", value: 5.4 },
      ],
      areaDistribution: [
        { area: "foundation", label: "Foundation", value: 28 },
        { area: "research", label: "Research", value: 22 },
        { area: "reading", label: "Reading", value: 18 },
        { area: "legal-english", label: "Legal English", value: 16 },
        { area: "scholarships", label: "Scholarships", value: 9 },
        { area: "career", label: "Career", value: 7 },
      ],
      recentActivity: [
        { id: "a1", kind: "research", title: "Drafted §3 on EU AI Act liability", area: "research", timestamp: "2026-06-27T08:12:00Z" },
        { id: "a2", kind: "reading", title: "Read 24 pages of Constitutional Law", area: "reading", timestamp: "2026-06-27T07:40:00Z" },
        { id: "a3", kind: "review", title: "Completed Tort Law flashcard review", area: "foundation", timestamp: "2026-06-26T19:05:00Z" },
        { id: "a4", kind: "evidence", title: "Added moot court certificate", area: "career", timestamp: "2026-06-26T16:22:00Z" },
        { id: "a5", kind: "task", title: "Submitted Contract Law essay", area: "foundation", timestamp: "2026-06-26T11:00:00Z" },
        { id: "a6", kind: "milestone", title: "IELTS mock test → 7.5 overall", area: "legal-english", timestamp: "2026-06-25T14:30:00Z" },
      ],
      upcomingDeadlines: [
        { id: "d1", title: "Cite-check memo", area: "foundation", date: d("2026-06-26"), priority: "high" },
        { id: "d2", title: "Chevening essay draft", area: "scholarships", date: d("2026-06-29"), priority: "critical" },
        { id: "d3", title: "Tort Law problem question", area: "foundation", date: d("2026-07-01"), priority: "high" },
        { id: "d4", title: "Research supervisor check-in", area: "research", date: d("2026-07-03"), priority: "medium" },
        { id: "d5", title: "IELTS writing task 2", area: "legal-english", date: d("2026-07-04"), priority: "medium" },
      ],
      todaysTasks: [
        { id: "t1", title: "Read Constitutional Law ch. 12", area: "reading", status: "in_progress", priority: "high", due: TODAY, estimateMinutes: 60, done: false },
        { id: "t2", title: "Draft 800 words — AI liability §4", area: "research", status: "in_progress", priority: "critical", due: TODAY, estimateMinutes: 90, done: false },
        { id: "t3", title: "IELTS writing — 2 tasks", area: "legal-english", status: "not_started", priority: "medium", due: TODAY, estimateMinutes: 50, done: false },
        { id: "t4", title: "Review Tort flashcards", area: "foundation", status: "done", priority: "medium", due: TODAY, done: true },
        { id: "t5", title: "Log moot court evidence", area: "career", status: "done", priority: "low", due: TODAY, done: true },
        { id: "t6", title: "Chevening — outline leadership essay", area: "scholarships", status: "not_started", priority: "high", due: TODAY, estimateMinutes: 40, done: false },
      ],
      recentEvidence: [
        { id: "e1", title: "Moot Court — Best Oralist (Regional)", kind: "award", date: d("2026-06-26"), area: "career", description: "Top advocate, regional rounds." },
        { id: "e2", title: "Pro-bono legal clinic — 40 hours", kind: "experience", date: d("2026-06-18"), area: "career" },
        { id: "e3", title: "Published case note — UKSC 2026/14", kind: "publication", date: d("2026-06-10"), area: "research" },
      ],
      currentBook,
      currentResearch,
    };
  },

  async getFoundationData(): Promise<FoundationData> {
    return {
      semester: { name: "Semester 2 · 2025/26", progress: 78, start: d("2026-02-03"), end: d("2026-07-10") },
      gpa: 3.86,
      creditsEarned: 96,
      creditsTotal: 120,
      subjects: [
        { id: "s1", code: "LAW101", name: "Contract Law", credits: 20, progress: 92, grade: "A", instructor: "Dr. E. Hart", status: "in_progress" },
        { id: "s2", code: "LAW102", name: "Tort Law", credits: 20, progress: 74, grade: "A-", instructor: "Prof. M. Singh", status: "in_progress" },
        { id: "s3", code: "LAW103", name: "Constitutional Law", credits: 20, progress: 81, grade: "A", instructor: "Dr. P. Owens", status: "in_progress" },
        { id: "s4", code: "LAW104", name: "Legal System & Method", credits: 20, progress: 100, grade: "A+", instructor: "Dr. K. Reyes", status: "done" },
        { id: "s5", code: "LAW105", name: "Criminal Law", credits: 20, progress: 58, grade: "B+", instructor: "Prof. A. Cole", status: "in_progress" },
        { id: "s6", code: "LAW106", name: "EU Law", credits: 20, progress: 40, instructor: "Dr. L. Marchetti", status: "in_progress" },
      ],
      assignments: [
        { id: "as1", title: "Tort Law problem question", subject: "Tort Law", due: d("2026-07-01"), status: "in_progress", weight: 40 },
        { id: "as2", title: "Contract Law essay", subject: "Contract Law", due: d("2026-06-26"), status: "done", weight: 30 },
        { id: "as3", title: "Constitutional moot brief", subject: "Constitutional Law", due: d("2026-07-08"), status: "not_started", weight: 25 },
        { id: "as4", title: "Criminal Law case analysis", subject: "Criminal Law", due: d("2026-07-12"), status: "not_started", weight: 35 },
      ],
      exams: [
        { id: "ex1", title: "Constitutional Law — Final", subject: "Constitutional Law", date: d("2026-07-09"), location: "Hall A", status: "not_started" },
        { id: "ex2", title: "EU Law — Final", subject: "EU Law", date: d("2026-07-14"), location: "Hall C", status: "not_started" },
        { id: "ex3", title: "Criminal Law — Mid", subject: "Criminal Law", date: d("2026-06-30"), location: "Room 214", status: "review" },
      ],
      projects: [
        { id: "p1", title: "Comparative remedies casebook", subject: "Contract Law", progress: 70, due: d("2026-07-05"), status: "in_progress" },
        { id: "p2", title: "Constitutional reform group brief", subject: "Constitutional Law", progress: 35, due: d("2026-07-15"), status: "in_progress" },
      ],
      timeline: [
        { id: "tl1", title: "Semester 2 begins", date: d("2026-02-03"), kind: "term", done: true },
        { id: "tl2", title: "Contract Law essay", date: d("2026-06-26"), kind: "assignment", done: true },
        { id: "tl3", title: "Criminal Law mid", date: d("2026-06-30"), kind: "exam", done: false },
        { id: "tl4", title: "Tort problem question", date: d("2026-07-01"), kind: "assignment", done: false },
        { id: "tl5", title: "Constitutional Law final", date: d("2026-07-09"), kind: "exam", done: false },
        { id: "tl6", title: "Semester ends", date: d("2026-07-10"), kind: "term", done: false },
      ],
    };
  },

  async getLLBData(): Promise<LLBData> {
    return {
      program: "LLB (Hons) — University of London",
      year: 1,
      gpa: 3.86,
      creditsEarned: 60,
      creditsTotal: 360,
      modules: [
        { id: "m1", code: "UOL-01", name: "Public Law", credits: 30, progress: 52, grade: "A-", status: "in_progress" },
        { id: "m2", code: "UOL-02", name: "Criminal Law", credits: 30, progress: 44, grade: "B+", status: "in_progress" },
        { id: "m3", code: "UOL-03", name: "Contract Law", credits: 30, progress: 61, grade: "A", status: "in_progress" },
        { id: "m4", code: "UOL-04", name: "Elements of the Law of Tort", credits: 30, progress: 33, status: "in_progress" },
      ],
      universities: [
        { id: "u1", name: "University of London", program: "LLB (Hons)", country: "UK", ranking: 1, status: "in_progress", notes: "Current enrolment — international programme." },
        { id: "u2", name: "King's College London", program: "LLM Transfer", country: "UK", ranking: 31, status: "not_started", notes: "Target for year 3 transfer." },
        { id: "u3", name: "Leiden University", program: "LLB Exchange", country: "Netherlands", ranking: 27, status: "not_started" },
      ],
      assignments: [
        { id: "la1", title: "Public Law — judicial review essay", subject: "Public Law", due: d("2026-07-02"), status: "in_progress", weight: 50 },
        { id: "la2", title: "Contract — formation problem", subject: "Contract Law", due: d("2026-07-10"), status: "not_started", weight: 50 },
      ],
      exams: [
        { id: "le1", title: "Public Law — Zone A", subject: "Public Law", date: d("2026-08-04"), location: "British Council", status: "not_started" },
        { id: "le2", title: "Contract Law — Zone A", subject: "Contract Law", date: d("2026-08-06"), location: "British Council", status: "not_started" },
      ],
      timeline: [
        { id: "lt1", title: "Year 1 enrolment", date: d("2025-10-01"), kind: "term", done: true },
        { id: "lt2", title: "Public Law essay", date: d("2026-07-02"), kind: "assignment", done: false },
        { id: "lt3", title: "Public Law exam", date: d("2026-08-04"), kind: "exam", done: false },
        { id: "lt4", title: "Year 1 results", date: d("2026-09-15"), kind: "milestone", done: false },
      ],
    };
  },

  async getLegalEnglishData(): Promise<LegalEnglishData> {
    return {
      ielts: {
        overall: 7.5,
        target: 8.0,
        bands: [
          { skill: "Listening", current: 8.0, target: 8.5 },
          { skill: "Reading", current: 8.0, target: 8.5 },
          { skill: "Writing", current: 6.5, target: 7.5 },
          { skill: "Speaking", current: 7.5, target: 8.0 },
        ],
      },
      progressSeries: [
        { label: "Jan", value: 6.5 },
        { label: "Feb", value: 6.5 },
        { label: "Mar", value: 7.0 },
        { label: "Apr", value: 7.0 },
        { label: "May", value: 7.5 },
        { label: "Jun", value: 7.5 },
      ],
      vocabulary: [
        { id: "v1", term: "Estoppel", definition: "A bar preventing a party from asserting a fact contrary to a previous position.", mastered: true, addedAt: d("2026-06-01") },
        { id: "v2", term: "Ultra vires", definition: "Acting beyond one's legal power or authority.", mastered: true, addedAt: d("2026-06-03") },
        { id: "v3", term: "Mens rea", definition: "The mental element of a crime; guilty mind.", mastered: true, addedAt: d("2026-06-05") },
        { id: "v4", term: "Laches", definition: "Unreasonable delay in pursuing a right, barring equitable relief.", mastered: false, addedAt: d("2026-06-20") },
        { id: "v5", term: "Res judicata", definition: "A matter already judged cannot be relitigated.", mastered: false, addedAt: d("2026-06-22") },
        { id: "v6", term: "Obiter dictum", definition: "A judge's incidental remark, not binding precedent.", mastered: true, addedAt: d("2026-06-12") },
      ],
      mockTests: [
        { id: "mt1", title: "Cambridge Mock 14", date: d("2026-06-25"), overall: 7.5, bands: [
          { skill: "Listening", current: 8.0, target: 8.5 },
          { skill: "Reading", current: 8.0, target: 8.5 },
          { skill: "Writing", current: 6.5, target: 7.5 },
          { skill: "Speaking", current: 7.5, target: 8.0 },
        ] },
        { id: "mt2", title: "Cambridge Mock 13", date: d("2026-05-28"), overall: 7.0, bands: [
          { skill: "Listening", current: 7.5, target: 8.5 },
          { skill: "Reading", current: 7.5, target: 8.5 },
          { skill: "Writing", current: 6.0, target: 7.5 },
          { skill: "Speaking", current: 7.0, target: 8.0 },
        ] },
      ],
      stats: [
        { id: "ov", label: "Overall Band", value: "7.5", hint: "target 8.0", progress: 88 },
        { id: "vocab", label: "Vocabulary", value: 412, hint: "68% mastered", progress: 68 },
        { id: "mock", label: "Mock Tests", value: 14, hint: "+0.5 last attempt" },
        { id: "writing", label: "Writing", value: "6.5", hint: "focus area", progress: 72 },
      ],
      skills: { writing: 72, speaking: 84, reading: 91, listening: 92 },
    };
  },

  async getReadingData(): Promise<ReadingData> {
    return {
      goal: { target: 25, completed: 16, year: 2026 },
      stats: [
        { id: "books", label: "Books Read", value: 16, hint: "of 25 goal", progress: 64 },
        { id: "pages", label: "Pages This Month", value: 642, trend: { delta: 12, direction: "up", label: "vs May" } },
        { id: "streak", label: "Reading Streak", value: "23 days", hint: "best: 41" },
        { id: "avg", label: "Avg / Book", value: "9 days", hint: "down from 12" },
      ],
      currentBook,
      books: [
        currentBook,
        { id: "bk2", title: "The Concept of Law", author: "H.L.A. Hart", category: "Jurisprudence", totalPages: 336, currentPage: 336, status: "done", rating: 5, finishedAt: d("2026-06-12"), coverColor: "#10b981" },
        { id: "bk3", title: "Letters to a Law Student", author: "Nicholas McBride", category: "Study", totalPages: 320, currentPage: 320, status: "done", rating: 4, finishedAt: d("2026-05-30"), coverColor: "#f59e0b" },
        { id: "bk4", title: "Law's Empire", author: "Ronald Dworkin", category: "Jurisprudence", totalPages: 470, currentPage: 120, status: "in_progress", coverColor: "#ec4899" },
        { id: "bk5", title: "Tort Law: Text & Materials", author: "Mark Lunney", category: "Tort", totalPages: 1024, currentPage: 0, status: "not_started", coverColor: "#3b82f6" },
        { id: "bk6", title: "Bleak House", author: "Charles Dickens", category: "Fiction", totalPages: 989, currentPage: 410, status: "in_progress", coverColor: "#8b5cf6" },
      ],
      notes: [
        { id: "n1", bookId: "bk-constitutional", bookTitle: "Constitutional & Administrative Law", excerpt: "Parliamentary sovereignty remains the cornerstone, yet the HRA 1998 introduces a subtle interpretive constraint via s.3.", page: 472, createdAt: d("2026-06-27") },
        { id: "n2", bookId: "bk2", bookTitle: "The Concept of Law", excerpt: "The union of primary and secondary rules is the 'key to the science of jurisprudence'.", page: 98, createdAt: d("2026-06-11") },
        { id: "n3", bookId: "bk4", bookTitle: "Law's Empire", excerpt: "Law as integrity asks judges to interpret the law as the best constructive account of the community's practice.", page: 95, createdAt: d("2026-06-22") },
      ],
      pagesSeries: [
        { label: "Jan", value: 380 },
        { label: "Feb", value: 420 },
        { label: "Mar", value: 510 },
        { label: "Apr", value: 470 },
        { label: "May", value: 575 },
        { label: "Jun", value: 642 },
      ],
    };
  },

  async getResearchData(): Promise<ResearchData> {
    return {
      projects: [
        currentResearch,
        { id: "rs2", title: "Digital Privacy & the Right to be Forgotten", field: "Data Protection", progress: 38, status: "in_progress", due: d("2026-09-30"), wordCount: 3200, targetWords: 8000 },
        { id: "rs3", title: "Restorative Justice in Juvenile Sentencing", field: "Criminal Justice", progress: 100, status: "done", wordCount: 9500, targetWords: 9000, summary: "Published in the undergraduate law review, Spring 2026." },
      ],
      ideas: [
        { id: "id1", title: "Liability gaps in decentralised autonomous organisations", field: "Corporate Law", createdAt: d("2026-06-20"), promise: "high" },
        { id: "id2", title: "Climate litigation as constitutional remedy", field: "Environmental Law", createdAt: d("2026-06-15"), promise: "critical" },
        { id: "id3", title: "Neuro-rights and mental privacy", field: "Human Rights", createdAt: d("2026-06-09"), promise: "medium" },
      ],
      sources: [
        { id: "src1", title: "EU AI Act, Regulation (EU) 2024/1689", type: "statute", year: 2024, cited: true },
        { id: "src2", title: "Quintavalle v HFEA [2005] UKHL 28", author: "House of Lords", type: "case", year: 2005, cited: true },
        { id: "src3", title: "Liability for Artificial Intelligence", author: "Expert Group, EC", type: "report", year: 2019, cited: true },
        { id: "src4", title: "The Reasonable Robot", author: "Ryan Abbott", type: "book", year: 2020, cited: false },
        { id: "src5", title: "Tort Liability for AI Decisions", author: "J. Turner", type: "article", year: 2023, cited: true },
      ],
      deadlines: [
        { id: "rd1", title: "AI liability — §4 draft", area: "research", date: d("2026-07-03"), priority: "high" },
        { id: "rd2", title: "Supervisor check-in", area: "research", date: d("2026-07-03"), priority: "medium" },
        { id: "rd3", title: "Privacy paper — literature review", area: "research", date: d("2026-07-20"), priority: "medium" },
      ],
      stats: [
        { id: "active", label: "Active Projects", value: 2, hint: "1 published" },
        { id: "words", label: "Words Written", value: "10.6k", trend: { delta: 800, direction: "up", label: "this week" } },
        { id: "sources", label: "Sources", value: 47, hint: "38 cited" },
        { id: "ideas", label: "Open Ideas", value: 3, hint: "2 high-promise" },
      ],
    };
  },

  async getScholarshipsData(): Promise<ScholarshipsData> {
    return {
      scholarships: [
        { id: "sc1", name: "Chevening Scholarship", provider: "UK Government (FCDO)", amount: "Full + stipend", deadline: d("2026-11-05"), priority: "critical", status: "in_progress", progress: 60, country: "UK", requirements: [
          { label: "Two years work experience", met: true },
          { label: "Three university offers", met: false },
          { label: "Leadership essay", met: false },
          { label: "Networking essay", met: true },
        ] },
        { id: "sc2", name: "Rhodes Scholarship", provider: "Rhodes Trust", amount: "Full — Oxford", deadline: d("2026-08-01"), priority: "high", status: "in_progress", progress: 35, country: "UK", requirements: [
          { label: "Academic transcript", met: true },
          { label: "Personal statement", met: false },
          { label: "8 references", met: false },
        ] },
        { id: "sc3", name: "Fulbright Foreign Student", provider: "U.S. Dept. of State", amount: "Full tuition", deadline: d("2026-10-12"), priority: "high", status: "not_started", progress: 10, country: "USA", requirements: [
          { label: "TOEFL/IELTS", met: true },
          { label: "Research proposal", met: false },
        ] },
        { id: "sc4", name: "Erasmus Mundus LLM", provider: "European Commission", amount: "€49,000", deadline: d("2026-07-15"), priority: "medium", status: "in_progress", progress: 72, country: "EU", requirements: [
          { label: "Motivation letter", met: true },
          { label: "Two recommendations", met: true },
          { label: "Language certificate", met: false },
        ] },
      ],
      deadlines: [
        { id: "scd1", title: "Erasmus Mundus — submit", area: "scholarships", date: d("2026-07-15"), priority: "high" },
        { id: "scd2", title: "Rhodes — personal statement", area: "scholarships", date: d("2026-07-20"), priority: "high" },
        { id: "scd3", title: "Fulbright — research proposal", area: "scholarships", date: d("2026-09-01"), priority: "medium" },
      ],
      stats: [
        { id: "active", label: "Active Applications", value: 4, hint: "1 critical" },
        { id: "value", label: "Potential Value", value: "$210k+", hint: "across awards" },
        { id: "next", label: "Next Deadline", value: "18 days", hint: "Erasmus Mundus" },
        { id: "ready", label: "Avg. Readiness", value: "44%", progress: 44 },
      ],
    };
  },

  async getCareerData(): Promise<CareerData> {
    return {
      portfolio: [
        { id: "pf1", title: "Case Note — UKSC 2026/14", type: "Publication", date: d("2026-06-10"), url: "#" },
        { id: "pf2", title: "Moot Court Brief — Constitutional", type: "Advocacy", date: d("2026-05-22"), url: "#" },
        { id: "pf3", title: "AI Liability Working Paper", type: "Research", date: d("2026-06-25"), url: "#" },
        { id: "pf4", title: "Legal Tech Hackathon — 2nd place", type: "Project", date: d("2026-04-14"), url: "#" },
      ],
      evidence: [
        { id: "ev1", title: "Moot Court — Best Oralist (Regional)", kind: "award", date: d("2026-06-26"), area: "career", description: "Top advocate in regional rounds." },
        { id: "ev2", title: "Pro-bono legal clinic — 40 hours", kind: "experience", date: d("2026-06-18"), area: "career" },
        { id: "ev3", title: "Published case note — UKSC", kind: "publication", date: d("2026-06-10"), area: "research" },
        { id: "ev4", title: "Dean's List — Semester 1", kind: "certificate", date: d("2026-02-01"), area: "foundation" },
        { id: "ev5", title: "Legal Tech Hackathon finalist", kind: "project", date: d("2026-04-14"), area: "career" },
      ],
      internships: [
        { id: "in1", organization: "Clifford Chance", role: "Vacation Scheme", start: d("2026-08-03"), end: d("2026-08-21"), status: "in_progress", location: "London" },
        { id: "in2", organization: "Citizens Advice", role: "Legal Volunteer", start: d("2026-03-01"), status: "in_progress", location: "Remote" },
        { id: "in3", organization: "UN Office (OHCHR)", role: "Research Intern", status: "not_started", location: "Geneva" },
      ],
      skills: [
        { id: "sk1", name: "Legal Research", category: "Core", level: 88 },
        { id: "sk2", name: "Legal Writing", category: "Core", level: 82 },
        { id: "sk3", name: "Advocacy", category: "Core", level: 78 },
        { id: "sk4", name: "Case Analysis", category: "Core", level: 85 },
        { id: "sk5", name: "Negotiation", category: "Soft", level: 64 },
        { id: "sk6", name: "Public Speaking", category: "Soft", level: 80 },
      ],
      achievements: [
        { id: "ac1", title: "Best Oralist — Regional Moot", date: d("2026-06-26"), description: "Awarded across 32 competitors." },
        { id: "ac2", title: "Dean's List", date: d("2026-02-01"), description: "Top 5% of cohort." },
        { id: "ac3", title: "Hackathon Runner-up", date: d("2026-04-14"), description: "Legal Tech for Access to Justice." },
      ],
      stats: [
        { id: "evid", label: "Evidence Logged", value: 12, trend: { delta: 3, direction: "up", label: "this month" } },
        { id: "intern", label: "Internships", value: 3, hint: "1 starting Aug" },
        { id: "skills", label: "Skills Tracked", value: 6, hint: "avg 79%", progress: 79 },
        { id: "awards", label: "Awards", value: 3, hint: "2 this year" },
      ],
    };
  },

  async getAnalyticsData(): Promise<AnalyticsData> {
    return {
      stats: [
        { id: "focus", label: "Focus Hours", value: "36.3", hint: "this week", trend: { delta: 4.2, direction: "up", label: "vs last week" } },
        { id: "gpa", label: "GPA Trend", value: "3.86", trend: { delta: 0.08, direction: "up", label: "this term" }, progress: 96 },
        { id: "completion", label: "Task Completion", value: "84%", progress: 84, trend: { delta: 6, direction: "up" } },
        { id: "streak", label: "Current Streak", value: "23 days", hint: "best: 41" },
      ],
      focusSeries: [
        { label: "W1", value: 28, secondary: 22 },
        { label: "W2", value: 31, secondary: 26 },
        { label: "W3", value: 27, secondary: 24 },
        { label: "W4", value: 34, secondary: 29 },
        { label: "W5", value: 32, secondary: 30 },
        { label: "W6", value: 36, secondary: 33 },
      ],
      areaDistribution: [
        { area: "foundation", label: "Foundation", value: 28 },
        { area: "research", label: "Research", value: 22 },
        { area: "reading", label: "Reading", value: 18 },
        { area: "legal-english", label: "Legal English", value: 16 },
        { area: "scholarships", label: "Scholarships", value: 9 },
        { area: "career", label: "Career", value: 7 },
      ],
      gpaSeries: [
        { label: "S1", value: 3.62 },
        { label: "S2", value: 3.71 },
        { label: "S3", value: 3.78 },
        { label: "S4", value: 3.86 },
      ],
      readingSeries: [
        { label: "Jan", value: 2 },
        { label: "Feb", value: 3 },
        { label: "Mar", value: 3 },
        { label: "Apr", value: 2 },
        { label: "May", value: 3 },
        { label: "Jun", value: 3 },
      ],
      productivityByDay: [
        { label: "Mon", value: 72 },
        { label: "Tue", value: 81 },
        { label: "Wed", value: 64 },
        { label: "Thu", value: 88 },
        { label: "Fri", value: 76 },
        { label: "Sat", value: 92 },
        { label: "Sun", value: 70 },
      ],
      streak: {
        current: 23,
        best: 41,
        days: [true, true, true, false, true, true, true, true, true, true, false, true, true, true],
      },
    };
  },

  async getSettings(): Promise<SettingsData> {
    return {
      vaultPath: "~/Documents/Law Journey 2026-2030",
      vaultName: "Law Journey 2026-2030",
      theme: "dark",
      adapter: "mock",
      sync: { state: "synced", lastSync: "2026-06-27T08:15:00Z", provider: "Obsidian Sync" },
      plugins: [
        { id: "dataview", name: "Dataview", enabled: true, version: "0.5.67" },
        { id: "tasks", name: "Tasks", enabled: true, version: "7.8.0" },
        { id: "templater", name: "Templater", enabled: true, version: "2.4.1" },
        { id: "local-rest", name: "Local REST API", enabled: false, version: "3.1.0" },
        { id: "metadata-menu", name: "Metadata Menu", enabled: true, version: "0.8.6" },
      ],
    };
  },
};

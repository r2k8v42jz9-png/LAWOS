/**
 * LawOS domain model.
 *
 * These interfaces describe the *shape* of the data that every page consumes.
 * They are intentionally decoupled from any storage mechanism. Today the data
 * is produced by the mock adapter (`lib/data/mock-adapter.ts`); tomorrow it can
 * be produced by an Obsidian vault reader (`lib/obsidian/*`) without touching a
 * single component.
 *
 * Golden rule: components depend on these types, never on a concrete adapter.
 */

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

export type ISODate = string; // e.g. "2026-06-27"

export type Status =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "review"
  | "done"
  | "archived";

export type Priority = "low" | "medium" | "high" | "critical";

export type TrendDirection = "up" | "down" | "flat";

export interface Trend {
  /** Signed delta versus the previous period. */
  delta: number;
  /** Optional human label, e.g. "vs last week". */
  label?: string;
  direction: TrendDirection;
}

/** A single point in a time series, used by charts. */
export interface SeriesPoint {
  label: string;
  value: number;
  /** Optional secondary value for dual-series charts. */
  secondary?: number;
}

/* ------------------------------------------------------------------ */
/*  Tasks & reviews                                                    */
/* ------------------------------------------------------------------ */

export interface Task {
  id: string;
  title: string;
  area: AreaKey;
  status: Status;
  priority: Priority;
  due?: ISODate;
  estimateMinutes?: number;
  done: boolean;
}

export interface Review {
  id: string;
  /** What was reviewed — a spaced-repetition deck, a chapter, a topic. */
  subject: string;
  area: AreaKey;
  due: ISODate;
  /** 0–100 retention / confidence score. */
  retention: number;
}

/* ------------------------------------------------------------------ */
/*  Deadlines & activity (shared, cross-area)                          */
/* ------------------------------------------------------------------ */

export interface Deadline {
  id: string;
  title: string;
  area: AreaKey;
  date: ISODate;
  priority: Priority;
}

export type ActivityKind =
  | "task"
  | "note"
  | "reading"
  | "research"
  | "evidence"
  | "review"
  | "milestone";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  area: AreaKey;
  timestamp: string; // ISO datetime
}

/* ------------------------------------------------------------------ */
/*  Foundation / University                                            */
/* ------------------------------------------------------------------ */

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  progress: number; // 0–100
  grade?: string; // e.g. "A", "B+"
  instructor?: string;
  status: Status;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  due: ISODate;
  status: Status;
  weight?: number; // % of final grade
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  date: ISODate;
  location?: string;
  status: Status;
}

export interface Project {
  id: string;
  title: string;
  subject?: string;
  progress: number;
  due?: ISODate;
  status: Status;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: ISODate;
  kind: "exam" | "assignment" | "milestone" | "term";
  done: boolean;
}

export interface University {
  id: string;
  name: string;
  program: string; // e.g. "LLB (Hons)"
  country: string;
  ranking?: number;
  status: Status;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/*  Reading                                                            */
/* ------------------------------------------------------------------ */

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string; // "Law" | "Philosophy" | ...
  totalPages: number;
  currentPage: number;
  status: Status;
  rating?: number; // 0–5
  startedAt?: ISODate;
  finishedAt?: ISODate;
  coverColor?: string; // hex accent used for the spine
}

export interface BookNote {
  id: string;
  bookId: string;
  bookTitle: string;
  excerpt: string;
  page?: number;
  createdAt: ISODate;
}

/* ------------------------------------------------------------------ */
/*  Research                                                           */
/* ------------------------------------------------------------------ */

export interface Research {
  id: string;
  title: string;
  field: string;
  progress: number;
  status: Status;
  due?: ISODate;
  wordCount?: number;
  targetWords?: number;
  summary?: string;
}

export interface ResearchIdea {
  id: string;
  title: string;
  field: string;
  createdAt: ISODate;
  promise: Priority; // how promising
}

export interface Source {
  id: string;
  title: string;
  author?: string;
  year?: number;
  type: "case" | "statute" | "article" | "book" | "report";
  cited: boolean;
}

/* ------------------------------------------------------------------ */
/*  Legal English / IELTS                                              */
/* ------------------------------------------------------------------ */

export interface VocabEntry {
  id: string;
  term: string;
  definition: string;
  mastered: boolean;
  addedAt: ISODate;
}

export interface IeltsBand {
  skill: "Listening" | "Reading" | "Writing" | "Speaking";
  current: number; // 0–9
  target: number;
}

export interface MockTest {
  id: string;
  title: string;
  date: ISODate;
  overall: number;
  bands: IeltsBand[];
}

/* ------------------------------------------------------------------ */
/*  Scholarships                                                       */
/* ------------------------------------------------------------------ */

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount?: string;
  deadline: ISODate;
  priority: Priority;
  status: Status;
  progress: number; // application completeness 0–100
  requirements: { label: string; met: boolean }[];
  country?: string;
}

/* ------------------------------------------------------------------ */
/*  Career                                                             */
/* ------------------------------------------------------------------ */

export interface Evidence {
  id: string;
  title: string;
  kind: "certificate" | "publication" | "project" | "award" | "experience";
  date: ISODate;
  description?: string;
  area: AreaKey;
}

export interface Internship {
  id: string;
  organization: string;
  role: string;
  start?: ISODate;
  end?: ISODate;
  status: Status;
  location?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 0–100
}

export interface Achievement {
  id: string;
  title: string;
  date: ISODate;
  description?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  url?: string;
  date: ISODate;
}

/* ------------------------------------------------------------------ */
/*  Areas (used for tagging, colours, navigation)                      */
/* ------------------------------------------------------------------ */

export type AreaKey =
  | "foundation"
  | "llb"
  | "legal-english"
  | "reading"
  | "research"
  | "scholarships"
  | "career"
  | "general";

/* ------------------------------------------------------------------ */
/*  Stat — generic KPI used across dashboards                          */
/* ------------------------------------------------------------------ */

export interface Stat {
  id: string;
  label: string;
  value: string | number;
  hint?: string;
  trend?: Trend;
  /** Optional 0–100 progress for the card's ring/bar. */
  progress?: number;
}

/* ------------------------------------------------------------------ */
/*  Per-area progress summary (dashboard "Progress cards")             */
/* ------------------------------------------------------------------ */

export interface AreaProgress {
  area: AreaKey;
  label: string;
  progress: number; // 0–100
  caption: string;
  trend?: Trend;
}

/* ------------------------------------------------------------------ */
/*  Page-level aggregates                                              */
/* ------------------------------------------------------------------ */

export interface DashboardData {
  missionToday: string;
  stats: Stat[];
  areaProgress: AreaProgress[];
  focusSeries: SeriesPoint[]; // study hours / focus over time
  areaDistribution: { area: AreaKey; label: string; value: number }[];
  recentActivity: ActivityItem[];
  upcomingDeadlines: Deadline[];
  upcomingExams: Deadline[];
  todaysTasks: Task[];
  recentEvidence: Evidence[];
  currentBook?: Book;
  currentResearch?: Research;
  activeScholarships: Scholarship[];
  internships: Internship[];
  vocab: { total: number; mastered: number };
  readingStats: { booksRead: number; pagesRead: number; inProgress: number; goal: number };
  ielts: { overall: number; target: number };
  gpa: number;
}

export interface FoundationData {
  semester: { name: string; progress: number; start: ISODate; end: ISODate };
  gpa: number;
  creditsEarned: number;
  creditsTotal: number;
  subjects: Subject[];
  assignments: Assignment[];
  exams: Exam[];
  projects: Project[];
  timeline: TimelineEvent[];
}

export interface LLBData {
  program: string;
  year: number;
  gpa: number;
  creditsEarned: number;
  creditsTotal: number;
  modules: Subject[];
  universities: University[];
  assignments: Assignment[];
  exams: Exam[];
  timeline: TimelineEvent[];
}

export interface ReadingData {
  goal: { target: number; completed: number; year: number };
  stats: Stat[];
  currentBook?: Book;
  books: Book[];
  notes: BookNote[];
  pagesSeries: SeriesPoint[];
}

export interface ResearchData {
  projects: Research[];
  ideas: ResearchIdea[];
  sources: Source[];
  deadlines: Deadline[];
  stats: Stat[];
}

export interface LegalEnglishData {
  ielts: { overall: number; target: number; bands: IeltsBand[] };
  progressSeries: SeriesPoint[];
  vocabulary: VocabEntry[];
  mockTests: MockTest[];
  stats: Stat[];
  skills: { writing: number; speaking: number; reading: number; listening: number };
}

export interface ScholarshipsData {
  scholarships: Scholarship[];
  deadlines: Deadline[];
  stats: Stat[];
}

export interface CareerData {
  portfolio: PortfolioItem[];
  evidence: Evidence[];
  internships: Internship[];
  skills: Skill[];
  achievements: Achievement[];
  stats: Stat[];
}

export interface AnalyticsData {
  stats: Stat[];
  focusSeries: SeriesPoint[];
  areaDistribution: { area: AreaKey; label: string; value: number }[];
  gpaSeries: SeriesPoint[];
  readingSeries: SeriesPoint[];
  pagesSeries: SeriesPoint[];
  vocabSeries: SeriesPoint[];
  assignmentsSeries: SeriesPoint[];
  productivityByDay: SeriesPoint[];
  productivityByWeek: SeriesPoint[];
  semesterCompletion: number;
  streak: { current: number; best: number; days: boolean[] };
}

/* ------------------------------------------------------------------ */
/*  Search + calendar (Phase 2)                                        */
/* ------------------------------------------------------------------ */

export interface SearchRecord {
  /** Vault path (also the stable id). */
  path: string;
  title: string;
  /** Group key, e.g. "book", "subject", "note". */
  kind: string;
  kindLabel: string;
  folder: string;
  /** Page the record lives on. */
  href: string;
  area: AreaKey;
}

export type CalendarEventKind =
  | "assignment"
  | "exam"
  | "research"
  | "scholarship"
  | "milestone"
  | "reading";

export interface CalendarEvent {
  id: string;
  title: string;
  date: ISODate;
  kind: CalendarEventKind;
  area: AreaKey;
  /** Entity key for opening the edit dialog, when the record is editable. */
  entityKey?: string;
  path: string;
}

export type SyncState = "synced" | "syncing" | "error" | "disconnected";

export interface SettingsData {
  vaultPath: string;
  vaultName: string;
  theme: "system" | "dark" | "light";
  sync: { state: SyncState; lastSync?: string; provider: string };
  plugins: { id: string; name: string; enabled: boolean; version: string }[];
  adapter: "mock" | "obsidian";
}

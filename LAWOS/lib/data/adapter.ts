/**
 * The single contract every data source must satisfy.
 *
 * The UI talks to a `DataAdapter` and nothing else. The mock adapter implements
 * it today; the Obsidian vault reader will implement the *exact same* interface
 * later. Swapping the source is a one-line change in `lib/data/index.ts`.
 *
 * All methods are async on purpose: reading markdown from disk, calling a local
 * Obsidian REST plugin, or hitting a sync API are all asynchronous operations.
 * Returning promises today means the migration requires zero signature changes.
 */
import type {
  AnalyticsData,
  CalendarEvent,
  CareerData,
  DashboardData,
  FoundationData,
  LLBData,
  LegalEnglishData,
  ReadingData,
  ResearchData,
  ScholarshipsData,
  SearchRecord,
  SettingsData,
} from "./types";

export interface DataAdapter {
  /** Stable identifier, surfaced in Settings → adapter. */
  readonly id: "mock" | "obsidian";

  getDashboardData(): Promise<DashboardData>;
  getFoundationData(): Promise<FoundationData>;
  getLLBData(): Promise<LLBData>;
  getLegalEnglishData(): Promise<LegalEnglishData>;
  getReadingData(): Promise<ReadingData>;
  getResearchData(): Promise<ResearchData>;
  getScholarshipsData(): Promise<ScholarshipsData>;
  getCareerData(): Promise<CareerData>;
  getAnalyticsData(): Promise<AnalyticsData>;
  getSettings(): Promise<SettingsData>;

  /** Flat index of every record in the vault, for global search. */
  getSearchIndex(): Promise<SearchRecord[]>;
  /** Dated records across all areas, for the unified calendar. */
  getCalendarData(): Promise<CalendarEvent[]>;
}

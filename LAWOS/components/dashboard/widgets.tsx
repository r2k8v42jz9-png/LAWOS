import { BookOpen, BookA, Award, Building2 } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { ProgressRing } from "@/components/ui/progress-ring";
import { MiniBar } from "@/components/shared/bits";
import { StatusBadge } from "@/components/ui/status-badge";
import { relativeDay } from "@/lib/utils";
import type { DashboardData } from "@/lib/data/types";

/** Reading roll-up: books vs goal, pages read, in-progress count. */
export function ReadingProgressWidget({ stats }: { stats: DashboardData["readingStats"] }) {
  const pct = stats.goal ? Math.round((stats.booksRead / stats.goal) * 100) : 0;
  return (
    <Panel title="Reading progress" icon={BookOpen} description={`${stats.booksRead} of ${stats.goal} books`}>
      <div className="flex items-center gap-5">
        <ProgressRing value={pct} size={88} stroke={8} gradientFrom="#fbbf24" gradientTo="#f97316">
          <div className="text-center">
            <p className="text-xl font-semibold text-foreground">{stats.booksRead}</p>
            <p className="text-[10px] text-muted-foreground">/ {stats.goal}</p>
          </div>
        </ProgressRing>
        <div className="space-y-1.5 text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{stats.pagesRead.toLocaleString()}</span> pages read
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{stats.inProgress}</span> in progress
          </p>
        </div>
      </div>
    </Panel>
  );
}

/** Vocabulary learned: total terms + mastered share. */
export function VocabWidget({ vocab }: { vocab: DashboardData["vocab"] }) {
  const pct = vocab.total ? Math.round((vocab.mastered / vocab.total) * 100) : 0;
  return (
    <Panel title="Vocabulary" icon={BookA} description="Legal terms learned">
      <div className="flex items-end justify-between">
        <p className="text-3xl font-semibold tracking-tight text-foreground">{vocab.total}</p>
        <span className="mb-1 text-xs text-muted-foreground">{vocab.mastered} mastered</span>
      </div>
      <MiniBar value={pct} color="#38bdf8" className="mt-2" />
      <p className="mt-2 text-xs text-muted-foreground">{pct}% mastered</p>
    </Panel>
  );
}

/** Active scholarship applications with readiness + deadline. */
export function ScholarshipTrackerWidget({ items }: { items: DashboardData["activeScholarships"] }) {
  return (
    <Panel title="Scholarship tracker" icon={Award} description={`${items.length} active`}>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No active applications.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s) => (
            <li key={s.id} className="rounded-xl border border-hairline bg-surface-2/40 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                {s.deadline && (
                  <span className="shrink-0 text-[11px] text-muted-foreground">{relativeDay(s.deadline)}</span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{s.provider}</p>
              <div className="mt-2 flex items-center gap-3">
                <MiniBar value={s.progress} color="#fb7185" height={5} />
                <span className="shrink-0 text-[11px] font-medium text-foreground">{s.progress}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** Internship applications. */
export function InternshipWidget({ items }: { items: DashboardData["internships"] }) {
  return (
    <Panel title="Internships" icon={Building2} description={`${items.length} tracked`}>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No internships yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2 rounded-xl border border-hairline bg-surface-2/40 p-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{i.role}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {i.organization}
                  {i.location ? ` · ${i.location}` : ""}
                </p>
              </div>
              <StatusBadge status={i.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

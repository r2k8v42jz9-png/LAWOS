import { GraduationCap, FileText, CalendarClock, FolderKanban, BookMarked } from "lucide-react";
import { getAdapter } from "@/lib/data";
import { formatShortDate, relativeDay, isoDay, isoMonthShort } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/shared/panel";
import { MetricPill, MiniBar } from "@/components/shared/bits";
import { Timeline } from "@/components/shared/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { Stagger, StaggerItem, HoverLift } from "@/components/motion/primitives";
import { NewEntityButton } from "@/components/entities/new-button";
import { RecordActions } from "@/components/entities/record-actions";
import { EntityEmptyState } from "@/components/entities/empty-state";

export const metadata = { title: "Foundation" };

// Data is read live from the Obsidian vault on each request.
export const dynamic = "force-dynamic";

export default async function FoundationPage() {
  const data = await getAdapter().getFoundationData();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Academics"
        title="Foundation"
        description={`${data.semester.name} — building the bedrock of legal study.`}
        actions={<NewEntityButton entityKey="subject" />}
      />

      {/* Semester overview */}
      <Panel title="Semester progress" icon={GraduationCap} description={data.semester.name}>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-2 flex items-end justify-between">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {data.semester.progress}%
              </span>
              {data.semester.start && data.semester.end && (
                <span className="text-xs text-muted-foreground">
                  {formatShortDate(data.semester.start)} → {formatShortDate(data.semester.end)}
                </span>
              )}
            </div>
            <MiniBar value={data.semester.progress} height={8} />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricPill label="GPA" value={data.gpa ? data.gpa.toFixed(2) : "—"} sub="weighted" />
              <MetricPill label="Credits" value={`${data.creditsEarned}/${data.creditsTotal}`} sub="earned" />
              <MetricPill label="Subjects" value={data.subjects.length} sub="this term" />
              <MetricPill label="Exams" value={data.exams.length} sub="scheduled" />
            </div>
          </div>
          <div className="rounded-xl border border-hairline bg-surface-2/40 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Term timeline</p>
            <Timeline events={data.timeline} />
          </div>
        </div>
      </Panel>

      {/* Subjects */}
      <Panel
        title="Current subjects"
        icon={BookMarked}
        description={`${data.subjects.length} active modules`}
        action={data.subjects.length > 0 ? <NewEntityButton entityKey="subject" variant="secondary" /> : undefined}
      >
        {data.subjects.length === 0 ? (
          <EntityEmptyState entityKey="subject" hint="Add your Foundation subjects — saved to 01 Foundation/Subjects in your vault." />
        ) : (
          <Stagger className="grid gap-3 md:grid-cols-2">
            {data.subjects.map((s) => (
              <StaggerItem key={s.id}>
                <HoverLift data-record-card className="rounded-xl border border-hairline bg-surface-2/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-hairline">
                          {s.code}
                        </span>
                        {s.grade && <span className="text-xs font-semibold text-emerald-400">{s.grade}</span>}
                      </div>
                      <p className="mt-1.5 truncate text-sm font-semibold text-foreground">{s.name}</p>
                      {s.instructor && <p className="truncate text-xs text-muted-foreground">{s.instructor}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <StatusBadge status={s.status} />
                      <RecordActions entityKey="subject" path={s.id} name={s.name} />
                    </div>
                  </div>
                  <div className="mt-3.5 flex items-center gap-3">
                    <MiniBar value={s.progress} />
                    <span className="shrink-0 text-xs font-medium text-foreground">{s.progress}%</span>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">{s.credits} credits</p>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Assignments */}
        <Panel title="Assignments" icon={FileText} description={`${data.assignments.length} total`}>
          <ul className="divide-y divide-hairline">
            {data.assignments.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.subject}
                    {a.weight ? ` · ${a.weight}% weight` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={a.status} />
                  <span className="text-[11px] text-muted-foreground">{relativeDay(a.due)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Exams */}
        <Panel title="Exams" icon={CalendarClock} description={`${data.exams.length} scheduled`}>
          <ul className="divide-y divide-hairline">
            {data.exams.map((ex) => (
              <li key={ex.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20">
                  <span className="text-sm font-semibold leading-none">{ex.date ? isoDay(ex.date) : "—"}</span>
                  <span className="text-[9px] uppercase leading-none">{isoMonthShort(ex.date)}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{ex.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ex.subject}
                    {ex.location ? ` · ${ex.location}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeDay(ex.date)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Projects */}
      <Panel title="Projects" icon={FolderKanban} description="Group and individual work">
        <Stagger className="grid gap-3 md:grid-cols-2">
          {data.projects.map((p) => (
            <StaggerItem key={p.id}>
              <div className="rounded-xl border border-hairline bg-surface-2/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{p.title}</p>
                  <StatusBadge status={p.status} />
                </div>
                {p.subject && <p className="mt-1 text-xs text-muted-foreground">{p.subject}</p>}
                <div className="mt-3 flex items-center gap-3">
                  <MiniBar value={p.progress} />
                  <span className="shrink-0 text-xs font-medium text-foreground">{p.progress}%</span>
                </div>
                {p.due && <p className="mt-2 text-[11px] text-muted-foreground">Due {formatShortDate(p.due)}</p>}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Panel>
    </div>
  );
}

import { Scale, Building2, FileText, CalendarClock, GraduationCap } from "lucide-react";
import { getAdapter } from "@/lib/data";
import { formatShortDate, relativeDay } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/shared/panel";
import { MetricPill, MiniBar } from "@/components/shared/bits";
import { Timeline } from "@/components/shared/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { Stagger, StaggerItem, HoverLift } from "@/components/motion/primitives";

export const metadata = { title: "LLB" };

// Data is read live from the Obsidian vault on each request.
export const dynamic = "force-dynamic";

export default async function LLBPage() {
  const data = await getAdapter().getLLBData();
  const overall = data.creditsTotal ? Math.round((data.creditsEarned / data.creditsTotal) * 100) : 0;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Academics"
        title="LLB (Hons)"
        description={data.program}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricPill label="Year" value={`Year ${data.year}`} sub="of 3" />
        <MetricPill label="GPA" value={data.gpa.toFixed(2)} sub="cumulative" />
        <MetricPill label="Credits" value={`${data.creditsEarned}/${data.creditsTotal}`} sub={`${overall}% of degree`} />
        <MetricPill label="Modules" value={data.modules.length} sub="in progress" />
      </div>

      <Panel title="Degree progress" icon={GraduationCap} description={`${overall}% toward 360 credits`}>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-semibold tracking-tight text-foreground">{overall}%</span>
          <span className="text-xs text-muted-foreground">{data.creditsTotal - data.creditsEarned} credits remaining</span>
        </div>
        <MiniBar value={overall} height={8} className="mt-2" />
      </Panel>

      <Panel title="Current modules" icon={Scale} description={`${data.modules.length} active`}>
        <Stagger className="grid gap-3 md:grid-cols-2">
          {data.modules.map((m) => (
            <StaggerItem key={m.id}>
              <HoverLift className="rounded-xl border border-hairline bg-surface-2/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground ring-1 ring-hairline">
                      {m.code}
                    </span>
                    <p className="mt-1.5 truncate text-sm font-semibold text-foreground">{m.name}</p>
                  </div>
                  {m.grade ? (
                    <span className="text-sm font-semibold text-emerald-400">{m.grade}</span>
                  ) : (
                    <StatusBadge status={m.status} />
                  )}
                </div>
                <div className="mt-3.5 flex items-center gap-3">
                  <MiniBar value={m.progress} color="#a78bfa" />
                  <span className="shrink-0 text-xs font-medium text-foreground">{m.progress}%</span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{m.credits} credits</p>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </Panel>

      <Panel title="Universities" icon={Building2} description="Current enrolment & transfer targets">
        <Stagger className="grid gap-3 md:grid-cols-3">
          {data.universities.map((u) => (
            <StaggerItem key={u.id}>
              <HoverLift className="h-full rounded-xl border border-hairline bg-surface-2/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-lg bg-violet-500/12 text-violet-400 ring-1 ring-inset ring-violet-500/20">
                    <Building2 className="size-4" />
                  </span>
                  {u.ranking && (
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-hairline">
                      #{u.ranking}
                    </span>
                  )}
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.program} · {u.country}</p>
                {u.notes && <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{u.notes}</p>}
                <div className="mt-3">
                  <StatusBadge status={u.status} />
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Assignments" icon={FileText}>
          <ul className="divide-y divide-hairline">
            {data.assignments.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.subject}{a.weight ? ` · ${a.weight}%` : ""}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={a.status} />
                  <span className="text-[11px] text-muted-foreground">{relativeDay(a.due)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Exams" icon={CalendarClock}>
          <ul className="divide-y divide-hairline">
            {data.exams.map((ex) => (
              <li key={ex.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 ring-1 ring-inset ring-violet-500/20">
                  <span className="text-sm font-semibold leading-none">{new Date(ex.date).getDate()}</span>
                  <span className="text-[9px] uppercase leading-none">
                    {new Date(ex.date).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{ex.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{ex.subject}{ex.location ? ` · ${ex.location}` : ""}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeDay(ex.date)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Programme timeline" icon={CalendarClock}>
        <Timeline events={data.timeline} />
      </Panel>
    </div>
  );
}

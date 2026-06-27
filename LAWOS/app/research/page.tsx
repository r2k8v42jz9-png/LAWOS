import { FlaskConical, Lightbulb, Library, CalendarClock, FileText } from "lucide-react";
import { getAdapter } from "@/lib/data";
import { formatShortDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatGrid } from "@/components/shared/stat-card";
import { Panel } from "@/components/shared/panel";
import { MiniBar } from "@/components/shared/bits";
import { DeadlinesList } from "@/components/dashboard/deadlines-list";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem, HoverLift } from "@/components/motion/primitives";

export const metadata = { title: "Research" };

const SOURCE_VARIANT = {
  case: "info",
  statute: "default",
  article: "success",
  book: "warning",
  report: "neutral",
} as const;

// Data is read live from the Obsidian vault on each request.
export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const data = await getAdapter().getResearchData();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Knowledge"
        title="Research"
        description="Active papers, the idea backlog, and every source that supports them."
      />

      <StatGrid stats={data.stats} />

      {/* Projects */}
      <Panel title="Research projects" icon={FlaskConical} description={`${data.projects.length} tracked`}>
        <Stagger className="grid gap-3 lg:grid-cols-2">
          {data.projects.map((p) => (
            <StaggerItem key={p.id}>
              <HoverLift className="flex h-full flex-col rounded-xl border border-hairline bg-surface-2/40 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    {p.field}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{p.title}</p>
                {p.summary && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.summary}</p>}
                <div className="mt-auto pt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {(p.wordCount ?? 0).toLocaleString()} / {(p.targetWords ?? 0).toLocaleString()} words
                    </span>
                    <span className="font-medium text-foreground">{p.progress}%</span>
                  </div>
                  <MiniBar value={p.progress} color="#34d399" />
                  {p.due && <p className="mt-2 text-[11px] text-muted-foreground">Due {formatShortDate(p.due)}</p>}
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Ideas */}
        <Panel title="Ideas" icon={Lightbulb} description="The backlog" className="lg:col-span-1">
          <Stagger className="space-y-2.5">
            {data.ideas.map((idea) => (
              <StaggerItem key={idea.id}>
                <div className="rounded-xl border border-hairline bg-surface-2/40 p-3.5">
                  <p className="text-sm font-medium text-foreground">{idea.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{idea.field}</span>
                    <PriorityBadge priority={idea.promise} />
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Panel>

        {/* Sources */}
        <Panel title="Sources" icon={Library} description={`${data.sources.length} references`} className="lg:col-span-2">
          <ul className="divide-y divide-hairline">
            {data.sources.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted-foreground ring-1 ring-hairline">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{s.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.author ?? "—"}{s.year ? ` · ${s.year}` : ""}
                  </p>
                </div>
                <Badge variant={SOURCE_VARIANT[s.type]} className="capitalize">{s.type}</Badge>
                {s.cited && <span className="hidden text-[11px] font-medium text-emerald-400 sm:inline">cited</span>}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Deadlines */}
      <Panel title="Deadlines" icon={CalendarClock}>
        <DeadlinesList deadlines={data.deadlines} />
      </Panel>
    </div>
  );
}

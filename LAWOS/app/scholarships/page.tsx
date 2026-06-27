import { Award, CalendarClock, CheckCircle2, Circle, MapPin } from "lucide-react";
import { getAdapter } from "@/lib/data";
import { cn, formatShortDate, daysUntil } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatGrid } from "@/components/shared/stat-card";
import { Panel } from "@/components/shared/panel";
import { MiniBar } from "@/components/shared/bits";
import { DeadlinesList } from "@/components/dashboard/deadlines-list";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Stagger, StaggerItem, HoverLift } from "@/components/motion/primitives";
import { NewEntityButton } from "@/components/entities/new-button";
import { RecordActions } from "@/components/entities/record-actions";
import { EntityEmptyState } from "@/components/entities/empty-state";

export const metadata = { title: "Scholarships" };

// Data is read live from the Obsidian vault on each request.
export const dynamic = "force-dynamic";

export default async function ScholarshipsPage() {
  const data = await getAdapter().getScholarshipsData();
  const sorted = [...data.scholarships].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Future"
        title="Scholarships"
        description="Every application, requirement and deadline — prioritised by what's closing soonest."
        actions={<NewEntityButton entityKey="scholarship" />}
      />

      <StatGrid stats={data.stats} />

      <Panel
        title="Applications"
        icon={Award}
        description={`${data.scholarships.length} active`}
        action={data.scholarships.length > 0 ? <NewEntityButton entityKey="scholarship" variant="secondary" /> : undefined}
      >
        {data.scholarships.length === 0 ? (
          <EntityEmptyState
            entityKey="scholarship"
            hint="Track an application — saved to 08 Scholarships in your vault."
          />
        ) : (
        <Stagger className="grid gap-3 lg:grid-cols-2">
          {sorted.map((s) => {
            const days = daysUntil(s.deadline);
            const met = s.requirements.filter((r) => r.met).length;
            return (
              <StaggerItem key={s.id}>
                <HoverLift data-record-card className="flex h-full flex-col rounded-xl border border-hairline bg-surface-2/40 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.provider}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <PriorityBadge priority={s.priority} />
                      <RecordActions entityKey="scholarship" path={s.id} name={s.name} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {s.amount && (
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                        {s.amount}
                      </span>
                    )}
                    {s.country && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <MapPin className="size-3" /> {s.country}
                      </span>
                    )}
                  </div>

                  {/* Requirements checklist */}
                  <ul className="mt-4 space-y-1.5">
                    {s.requirements.map((r, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        {r.met ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />
                        )}
                        <span className={cn(r.met ? "text-muted-foreground line-through" : "text-foreground")}>
                          {r.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{met}/{s.requirements.length} requirements</span>
                      <span className="font-medium text-foreground">{s.progress}% ready</span>
                    </div>
                    <MiniBar value={s.progress} color="#fb7185" />
                    <div className="mt-3 flex items-center justify-between">
                      <StatusBadge status={s.status} />
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                          days <= 14
                            ? "bg-rose-500/10 text-rose-400 ring-rose-500/20"
                            : "bg-surface-2 text-muted-foreground ring-hairline"
                        )}
                      >
                        {formatShortDate(s.deadline)} · {days}d
                      </span>
                    </div>
                  </div>
                </HoverLift>
              </StaggerItem>
            );
          })}
        </Stagger>
        )}
      </Panel>

      <Panel title="Deadlines" icon={CalendarClock} description="Closing soon">
        <DeadlinesList deadlines={data.deadlines} />
      </Panel>
    </div>
  );
}

import {
  Briefcase,
  Award,
  FolderGit2,
  Building2,
  Trophy,
  Gauge,
  ExternalLink,
} from "lucide-react";
import { getAdapter } from "@/lib/data";
import { formatShortDate, relativeDay } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatGrid } from "@/components/shared/stat-card";
import { Panel } from "@/components/shared/panel";
import { MiniBar } from "@/components/shared/bits";
import { SkillRadarChart } from "@/components/charts/charts";
import { StatusBadge } from "@/components/ui/status-badge";
import { AreaTag } from "@/components/shared/area-tag";
import { Stagger, StaggerItem, HoverLift } from "@/components/motion/primitives";

export const metadata = { title: "Career" };

const KIND_COLOR: Record<string, string> = {
  certificate: "#38bdf8",
  publication: "#34d399",
  project: "#a78bfa",
  award: "#fbbf24",
  experience: "#22d3ee",
};

export default async function CareerPage() {
  const data = await getAdapter().getCareerData();
  const radar = data.skills.map((s) => ({ label: s.name.split(" ")[0], value: s.level }));

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Future"
        title="Career"
        description="Your professional evidence base — portfolio, experience, skills and wins."
      />

      <StatGrid stats={data.stats} />

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Portfolio */}
        <Panel title="Portfolio" icon={FolderGit2} description={`${data.portfolio.length} pieces`}>
          <Stagger className="space-y-2">
            {data.portfolio.map((p) => (
              <StaggerItem key={p.id}>
                <a
                  href={p.url ?? "#"}
                  className="group flex items-center gap-3 rounded-xl border border-hairline bg-surface-2/40 p-3.5 transition-colors hover:bg-surface-2"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
                    <FolderGit2 className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.type} · {formatShortDate(p.date)}</p>
                  </div>
                  <ExternalLink className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </Panel>

        {/* Skills radar */}
        <Panel title="Skills" icon={Gauge} description="Self-assessed proficiency">
          <SkillRadarChart data={radar} height={220} />
          <div className="mt-4 space-y-2.5">
            {data.skills.map((s) => (
              <div key={s.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">{s.level}%</span>
                </div>
                <MiniBar value={s.level} height={5} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Evidence */}
      <Panel title="Evidence" icon={Award} description={`${data.evidence.length} proofs of work`}>
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.evidence.map((ev) => (
            <StaggerItem key={ev.id}>
              <HoverLift className="h-full rounded-xl border border-hairline bg-surface-2/40 p-4">
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-9 place-items-center rounded-lg ring-1 ring-inset"
                    style={{ background: `${KIND_COLOR[ev.kind]}1a`, color: KIND_COLOR[ev.kind] }}
                  >
                    <Award className="size-4" />
                  </span>
                  <AreaTag area={ev.area} />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{ev.title}</p>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">{ev.kind} · {formatShortDate(ev.date)}</p>
                {ev.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{ev.description}</p>}
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Internships */}
        <Panel title="Internships" icon={Building2}>
          <ul className="space-y-3">
            {data.internships.map((i) => (
              <li key={i.id} className="rounded-xl border border-hairline bg-surface-2/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{i.role}</p>
                    <p className="text-xs text-muted-foreground">{i.organization}{i.location ? ` · ${i.location}` : ""}</p>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
                {(i.start || i.end) && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {i.start ? formatShortDate(i.start) : "TBD"}
                    {i.end ? ` → ${formatShortDate(i.end)}` : i.start ? ` · starts ${relativeDay(i.start)}` : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        {/* Achievements */}
        <Panel title="Achievements" icon={Trophy}>
          <Stagger className="space-y-2.5">
            {data.achievements.map((a) => (
              <StaggerItem key={a.id}>
                <div className="flex gap-3 rounded-xl border border-hairline bg-surface-2/40 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20">
                    <Trophy className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{formatShortDate(a.date)}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Panel>
      </div>
    </div>
  );
}

import {
  CheckSquare,
  CalendarClock,
  Activity,
  PieChart as PieIcon,
  TrendingUp,
  Award,
} from "lucide-react";
import { getAdapter } from "@/lib/data";
import { AREA_META, CHART_PALETTE } from "@/lib/areas";
import { formatShortDate } from "@/lib/utils";

import { PageHeader } from "@/components/layout/page-header";
import { StatGrid } from "@/components/shared/stat-card";
import { Panel } from "@/components/shared/panel";
import { AreaTrendChart, DonutChart } from "@/components/charts/charts";
import {
  MissionCard,
  CurrentBookCard,
  CurrentResearchCard,
} from "@/components/dashboard/hero-cards";
import { TasksList } from "@/components/dashboard/tasks-list";
import { DeadlinesList } from "@/components/dashboard/deadlines-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AreaProgressGrid } from "@/components/dashboard/area-progress-grid";

// Data is read live from the Obsidian vault on each request.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getAdapter().getDashboardData();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Saturday · 27 June"
        title="Good morning, Aziz"
        description="Your command center across Foundation, LLB, research, reading and beyond."
      />

      {/* Hero row */}
      <div className="grid gap-3 lg:grid-cols-4">
        <MissionCard mission={data.missionToday} gpa={data.gpa} />
        {data.currentBook && <CurrentBookCard book={data.currentBook} />}
        {data.currentResearch && <CurrentResearchCard research={data.currentResearch} />}
      </div>

      {/* KPI stats */}
      <StatGrid stats={data.stats} className="lg:grid-cols-5" />

      {/* Charts + tasks */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          title="Activity this week"
          description="Vault notes updated per day"
          icon={TrendingUp}
          className="lg:col-span-2"
          action={
            <span className="text-sm font-semibold text-foreground">
              {data.focusSeries.reduce((s, p) => s + p.value, 0)}{" "}
              <span className="text-xs font-medium text-muted-foreground">updates</span>
            </span>
          }
        >
          <AreaTrendChart data={data.focusSeries} height={250} />
        </Panel>

        <Panel title="Today's Tasks" description="What moves the needle now" icon={CheckSquare}>
          <TasksList tasks={data.todaysTasks} />
        </Panel>
      </div>

      {/* Distribution + deadlines + activity */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="Where time goes" description="Effort distribution by area" icon={PieIcon}>
          <DonutChart data={data.areaDistribution} height={200} />
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {data.areaDistribution.map((d, i) => (
              <li key={d.area} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2 rounded-full"
                  style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                />
                <span className="text-muted-foreground">{d.label}</span>
                <span className="ml-auto font-medium text-foreground">{d.value}%</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Upcoming deadlines" description="Next 7 days" icon={CalendarClock}>
          <DeadlinesList deadlines={data.upcomingDeadlines} />
        </Panel>

        <Panel title="Recent activity" description="Your latest moves" icon={Activity}>
          <ActivityFeed items={data.recentActivity} />
        </Panel>
      </div>

      {/* Per-area progress */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Progress across the journey</h2>
          <span className="text-xs text-muted-foreground">7 areas tracked</span>
        </div>
        <AreaProgressGrid items={data.areaProgress} />
      </div>

      {/* Recent evidence */}
      <Panel title="Recent evidence" description="Proof of work for your portfolio" icon={Award}>
        <ul className="divide-y divide-hairline">
          {data.recentEvidence.map((ev) => {
            const meta = AREA_META[ev.area];
            return (
              <li key={ev.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className="grid size-9 place-items-center rounded-lg ring-1 ring-inset"
                  style={{ background: `${meta.hex}1a`, color: meta.hex }}
                >
                  <Award className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
                  <p className="truncate text-xs capitalize text-muted-foreground">
                    {ev.kind} · {formatShortDate(ev.date)}
                  </p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">{meta.label}</span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

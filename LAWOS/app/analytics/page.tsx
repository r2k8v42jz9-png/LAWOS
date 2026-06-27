import { BarChart3, TrendingUp, PieChart as PieIcon, Flame, GraduationCap, BookOpen } from "lucide-react";
import { getAdapter } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatGrid } from "@/components/shared/stat-card";
import { Panel } from "@/components/shared/panel";
import {
  DualAreaChart,
  DonutChart,
  LineTrendChart,
  BarMiniChart,
} from "@/components/charts/charts";
import { CHART_PALETTE } from "@/lib/areas";

export const metadata = { title: "Analytics" };

// Data is read live from the Obsidian vault on each request.
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAdapter().getAnalyticsData();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="System"
        title="Analytics"
        description="The aggregate view — where your effort goes and how the trends are bending."
      />

      <StatGrid stats={data.stats} />

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          title="Focus & deep work"
          icon={TrendingUp}
          description="Weekly hours, last 6 weeks"
          className="lg:col-span-2"
        >
          <DualAreaChart data={data.focusSeries} height={260} />
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" /> Total focus
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" /> Deep work
            </span>
          </div>
        </Panel>

        <Panel title="Effort by area" icon={PieIcon}>
          <DonutChart data={data.areaDistribution} height={190} />
          <ul className="mt-4 space-y-1.5">
            {data.areaDistribution.map((d, i) => (
              <li key={d.area} className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-full" style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                <span className="text-muted-foreground">{d.label}</span>
                <span className="ml-auto font-medium text-foreground">{d.value}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="GPA trend" icon={GraduationCap} description="Cumulative, by semester">
          <LineTrendChart data={data.gpaSeries} domain={[3.4, 4]} height={220} />
        </Panel>
        <Panel title="Books finished" icon={BookOpen} description="Per month">
          <BarMiniChart data={data.readingSeries} unit=" books" color="#fbbf24" height={220} />
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="Productivity by day" icon={BarChart3} className="lg:col-span-2">
          <BarMiniChart data={data.productivityByDay} unit="%" height={220} />
        </Panel>

        <Panel title="Consistency" icon={Flame} description="Daily study streak">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-foreground">{data.streak.current}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Personal best: {data.streak.best} days</p>
          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {data.streak.days.map((active, i) => (
              <span
                key={i}
                className={cn(
                  "aspect-square rounded-md ring-1 ring-inset transition-colors",
                  active
                    ? "bg-emerald-500/70 ring-emerald-400/40"
                    : "bg-surface-2 ring-hairline"
                )}
                title={active ? "Studied" : "Missed"}
              />
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Last 14 days</p>
        </Panel>
      </div>
    </div>
  );
}

import { Languages, TrendingUp, BookA, ClipboardCheck, Target, Radar } from "lucide-react";
import { getAdapter } from "@/lib/data";
import { formatShortDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatGrid } from "@/components/shared/stat-card";
import { Panel } from "@/components/shared/panel";
import { MiniBar } from "@/components/shared/bits";
import { LineTrendChart, SkillRadarChart } from "@/components/charts/charts";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Legal English" };

const BAND_COLOR = "#38bdf8";

// Data is read live from the Obsidian vault on each request.
export const dynamic = "force-dynamic";

export default async function LegalEnglishPage() {
  const data = await getAdapter().getLegalEnglishData();
  const radar = [
    { label: "Writing", value: data.skills.writing },
    { label: "Speaking", value: data.skills.speaking },
    { label: "Reading", value: data.skills.reading },
    { label: "Listening", value: data.skills.listening },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Academics"
        title="Legal English"
        description="IELTS preparation, legal vocabulary and the four core skills."
      />

      <StatGrid stats={data.stats} />

      <div className="grid gap-3 lg:grid-cols-3">
        {/* IELTS overview */}
        <Panel title="IELTS overall" icon={Target} className="lg:col-span-1">
          <div className="flex flex-col items-center py-2">
            <ProgressRing value={(data.ielts.overall / 9) * 100} size={140} stroke={10} gradientFrom={BAND_COLOR} gradientTo="#6366f1">
              <div className="text-center">
                <p className="text-3xl font-semibold text-foreground">{data.ielts.overall.toFixed(1)}</p>
                <p className="text-[11px] text-muted-foreground">target {data.ielts.target.toFixed(1)}</p>
              </div>
            </ProgressRing>
            <div className="mt-5 w-full space-y-3">
              {data.ielts.bands.map((b) => (
                <div key={b.skill}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{b.skill}</span>
                    <span className="font-medium text-foreground">
                      {b.current.toFixed(1)} <span className="text-muted-foreground">/ {b.target.toFixed(1)}</span>
                    </span>
                  </div>
                  <MiniBar value={(b.current / 9) * 100} color={BAND_COLOR} height={5} />
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Progress over time */}
        <Panel title="Band progression" icon={TrendingUp} description="Overall band over 6 months" className="lg:col-span-2">
          <LineTrendChart data={data.progressSeries} color={BAND_COLOR} domain={[6, 9]} height={200} />
          <div className="mt-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Radar className="size-3.5" /> Skill balance
            </p>
            <SkillRadarChart data={radar} height={240} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Vocabulary */}
        <Panel
          title="Vocabulary"
          icon={BookA}
          description={`${data.vocabulary.filter((v) => v.mastered).length} mastered of ${data.vocabulary.length} shown`}
        >
          <Stagger className="space-y-2">
            {data.vocabulary.map((v) => (
              <StaggerItem key={v.id}>
                <div className="rounded-xl border border-hairline bg-surface-2/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{v.term}</p>
                    <Badge variant={v.mastered ? "success" : "neutral"}>
                      {v.mastered ? "Mastered" : "Learning"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{v.definition}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Panel>

        {/* Mock tests */}
        <Panel title="Mock tests" icon={ClipboardCheck} description={`Latest: ${data.mockTests[0]?.overall.toFixed(1)} overall`}>
          <ul className="space-y-3">
            {data.mockTests.map((t) => (
              <li key={t.id} className="rounded-xl border border-hairline bg-surface-2/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{formatShortDate(t.date)}</p>
                  </div>
                  <span className="grid size-11 place-items-center rounded-full bg-sky-500/10 text-sm font-semibold text-sky-400 ring-1 ring-inset ring-sky-500/20">
                    {t.overall.toFixed(1)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {t.bands.map((b) => (
                    <div key={b.skill} className="rounded-lg bg-surface-2 px-2 py-1.5 text-center">
                      <p className="text-[10px] text-muted-foreground">{b.skill.slice(0, 4)}</p>
                      <p className="text-sm font-semibold text-foreground">{b.current.toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

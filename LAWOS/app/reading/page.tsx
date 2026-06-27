import { BookOpen, Target, NotebookPen, Library, Star, TrendingUp } from "lucide-react";
import { getAdapter } from "@/lib/data";
import { cn, formatShortDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatGrid } from "@/components/shared/stat-card";
import { Panel } from "@/components/shared/panel";
import { MiniBar } from "@/components/shared/bits";
import { BarMiniChart } from "@/components/charts/charts";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Stagger, StaggerItem, HoverLift } from "@/components/motion/primitives";

export const metadata = { title: "Reading" };

function Stars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("size-3", i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
        />
      ))}
    </span>
  );
}

export default async function ReadingPage() {
  const data = await getAdapter().getReadingData();
  const goalPct = Math.round((data.goal.completed / data.goal.target) * 100);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Knowledge"
        title="Reading"
        description={`${data.goal.completed} of ${data.goal.target} books in ${data.goal.year} — and counting.`}
      />

      <StatGrid stats={data.stats} />

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Reading goal */}
        <Panel title="Reading goal" icon={Target} description={`${data.goal.year} challenge`}>
          <div className="flex items-center gap-5">
            <ProgressRing value={goalPct} size={104} stroke={9} gradientFrom="#fbbf24" gradientTo="#f97316">
              <div className="text-center">
                <p className="text-2xl font-semibold text-foreground">{data.goal.completed}</p>
                <p className="text-[10px] text-muted-foreground">/ {data.goal.target}</p>
              </div>
            </ProgressRing>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                You're <span className="font-semibold text-foreground">{goalPct}%</span> to your goal.
              </p>
              <p className="text-xs text-muted-foreground">
                {data.goal.target - data.goal.completed} books to go · roughly 1.5 per month keeps you on pace.
              </p>
            </div>
          </div>
        </Panel>

        {/* Current book */}
        {data.currentBook && (
          <Panel title="Current book" icon={BookOpen} className="lg:col-span-2">
            <div className="flex items-center gap-5">
              <div
                className="relative h-28 w-20 shrink-0 rounded-lg shadow-xl"
                style={{ background: `linear-gradient(150deg, ${data.currentBook.coverColor}, ${data.currentBook.coverColor}99)` }}
              >
                <span className="absolute inset-y-0 left-1.5 w-px bg-white/20" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-foreground">{data.currentBook.title}</p>
                <p className="text-sm text-muted-foreground">{data.currentBook.author}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted-foreground ring-1 ring-hairline">
                    {data.currentBook.category}
                  </span>
                  <Stars rating={data.currentBook.rating} />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <MiniBar value={Math.round((data.currentBook.currentPage / data.currentBook.totalPages) * 100)} color="#fbbf24" />
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {data.currentBook.currentPage}/{data.currentBook.totalPages}
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </div>

      {/* Statistics chart */}
      <Panel title="Pages read" icon={TrendingUp} description="Monthly trend" >
        <BarMiniChart data={data.pagesSeries} color="#fbbf24" unit=" pages" height={220} />
      </Panel>

      {/* Library */}
      <Panel title="Library" icon={Library} description={`${data.books.length} books tracked`}>
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.books.map((b) => {
            const pct = Math.round((b.currentPage / b.totalPages) * 100);
            return (
              <StaggerItem key={b.id}>
                <HoverLift className="flex gap-4 rounded-xl border border-hairline bg-surface-2/40 p-4">
                  <div
                    className="relative h-24 w-16 shrink-0 rounded-md shadow-lg"
                    style={{ background: `linear-gradient(150deg, ${b.coverColor}, ${b.coverColor}99)` }}
                  >
                    <span className="absolute inset-y-0 left-1 w-px bg-white/20" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-semibold text-foreground">{b.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{b.author}</p>
                    <div className="mt-1"><Stars rating={b.rating} /></div>
                    <div className="mt-auto pt-3">
                      <div className="mb-1.5"><StatusBadge status={b.status} /></div>
                      <MiniBar value={pct} color={b.coverColor} height={4} />
                    </div>
                  </div>
                </HoverLift>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Panel>

      {/* Notes */}
      <Panel title="Book notes" icon={NotebookPen} description="Highlights worth keeping">
        <Stagger className="space-y-3">
          {data.notes.map((n) => (
            <StaggerItem key={n.id}>
              <figure className="rounded-xl border border-hairline bg-surface-2/40 p-4">
                <blockquote className="border-l-2 border-amber-400/60 pl-3 text-sm italic leading-relaxed text-foreground">
                  “{n.excerpt}”
                </blockquote>
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {n.bookTitle}{n.page ? ` · p. ${n.page}` : ""} · {formatShortDate(n.createdAt)}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </Panel>
    </div>
  );
}

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate, relativeDay } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/data/types";

const KIND_STYLE: Record<TimelineEvent["kind"], string> = {
  exam: "text-rose-400",
  assignment: "text-amber-400",
  milestone: "text-violet-400",
  term: "text-sky-400",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-0.5">
      {events.map((ev, i) => {
        const last = i === events.length - 1;
        return (
          <li key={ev.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && (
              <span className="absolute left-[11px] top-6 h-[calc(100%-0.75rem)] w-px bg-hairline" />
            )}
            <span
              className={cn(
                "z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ring-1 ring-inset",
                ev.done
                  ? "bg-primary/15 text-primary ring-primary/30"
                  : "bg-surface-2 text-muted-foreground ring-hairline"
              )}
            >
              {ev.done ? <Check className="size-3.5" strokeWidth={3} /> : <Circle className="size-2 fill-current" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={cn("truncate text-sm font-medium", ev.done ? "text-muted-foreground" : "text-foreground")}>
                  {ev.title}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">{formatShortDate(ev.date)}</span>
              </div>
              <p className={cn("text-[11px] font-medium capitalize", KIND_STYLE[ev.kind])}>
                {ev.kind} · {relativeDay(ev.date)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

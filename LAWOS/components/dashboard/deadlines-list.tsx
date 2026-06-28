import { cn, relativeDay, daysUntil, isoDay, isoMonthShort } from "@/lib/utils";
import type { Deadline } from "@/lib/data/types";
import { AREA_META, PRIORITY_META } from "@/lib/areas";

export function DeadlinesList({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <ul className="space-y-1">
      {deadlines.map((dl) => {
        const days = daysUntil(dl.date);
        const overdue = days < 0;
        const soon = days >= 0 && days <= 2;
        const meta = AREA_META[dl.area];
        return (
          <li
            key={dl.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2"
          >
            <span
              className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg text-center ring-1 ring-inset"
              style={{ background: `${meta.hex}1a`, color: meta.hex }}
            >
              <span className="text-[13px] font-semibold leading-none">{isoDay(dl.date)}</span>
              <span className="text-[9px] uppercase leading-none opacity-80">{isoMonthShort(dl.date)}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{dl.title}</p>
              <p className="flex items-center gap-1.5 text-[11px]">
                <span className={meta.text}>{meta.label}</span>
                <span className="text-muted-foreground/50">·</span>
                <span className={PRIORITY_META[dl.priority].className}>{PRIORITY_META[dl.priority].label}</span>
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                overdue
                  ? "bg-rose-500/10 text-rose-400 ring-rose-500/20"
                  : soon
                  ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                  : "bg-surface-2 text-muted-foreground ring-hairline"
              )}
            >
              {overdue ? `${Math.abs(days)}d overdue` : relativeDay(dl.date)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

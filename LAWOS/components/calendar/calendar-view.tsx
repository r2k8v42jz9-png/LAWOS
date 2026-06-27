"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EntityDialog } from "@/components/entities/entity-dialog";
import { hrefForArea } from "@/lib/obsidian/classify";
import { relativeDay } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/data/types";

const KIND_META: Record<CalendarEvent["kind"], { label: string; color: string }> = {
  assignment: { label: "Assignment", color: "#fbbf24" },
  exam: { label: "Exam", color: "#fb7185" },
  research: { label: "Research", color: "#34d399" },
  scholarship: { label: "Scholarship", color: "#f472b6" },
  milestone: { label: "Milestone", color: "#a78bfa" },
  reading: { label: "Reading", color: "#38bdf8" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TODAY_ISO = new Date().toISOString().slice(0, 10);

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();
  const initial = new Date();
  const [year, setYear] = React.useState(initial.getFullYear());
  const [month, setMonth] = React.useState(initial.getMonth());
  const [editing, setEditing] = React.useState<{ entityKey: string; path: string } | null>(null);

  const byDate = React.useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      if (!m.has(e.date)) m.set(e.date, []);
      m.get(e.date)!.push(e);
    }
    return m;
  }, [events]);

  const open = (e: CalendarEvent) => {
    if (e.entityKey) setEditing({ entityKey: e.entityKey, path: e.path });
    else router.push(hrefForArea(e.area));
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const iso = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const upcoming = React.useMemo(
    () => events.filter((e) => e.date >= TODAY_ISO).slice(0, 8),
    [events]
  );

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
      {/* Month grid */}
      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            {MONTHS[month]} {year}
          </h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={prev} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setYear(initial.getFullYear()); setMonth(initial.getMonth()); }}
            >
              Today
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={next} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-hairline">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[11px] font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dateIso = day ? iso(day) : "";
            const dayEvents = day ? byDate.get(dateIso) ?? [] : [];
            const isToday = dateIso === TODAY_ISO;
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[92px] border-b border-r border-hairline p-1.5 last:border-r-0",
                  (i + 1) % 7 === 0 && "border-r-0",
                  !day && "bg-surface-2/20"
                )}
              >
                {day && (
                  <>
                    <div className="mb-1 flex justify-end">
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full text-[11px]",
                          isToday ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground"
                        )}
                      >
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((e) => {
                        const meta = KIND_META[e.kind];
                        return (
                          <button
                            key={e.id}
                            onClick={() => open(e)}
                            title={`${meta.label}: ${e.title}`}
                            className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] text-foreground transition-colors hover:bg-surface-2"
                            style={{ background: `${meta.color}1a` }}
                          >
                            <span className="size-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                            <span className="truncate">{e.title}</span>
                          </button>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <p className="px-1 text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming list */}
      <div className="surface-card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-hairline px-5 py-4">
          <span className="grid size-8 place-items-center rounded-lg bg-surface-2 text-muted-foreground ring-1 ring-hairline">
            <CalendarDays className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Upcoming</h3>
            <p className="text-xs text-muted-foreground">{upcoming.length} events ahead</p>
          </div>
        </div>
        <div className="p-3">
          {upcoming.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No upcoming dated records. Add a due date to an assignment, exam, or scholarship.
            </p>
          ) : (
            <ul className="space-y-1">
              {upcoming.map((e) => {
                const meta = KIND_META[e.kind];
                return (
                  <li key={e.id}>
                    <button
                      onClick={() => open(e)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg text-center"
                        style={{ background: `${meta.color}1a`, color: meta.color }}
                      >
                        <span className="text-[13px] font-semibold leading-none">{new Date(e.date).getDate()}</span>
                        <span className="text-[9px] uppercase leading-none opacity-80">
                          {new Date(e.date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                        <p className="text-[11px]" style={{ color: meta.color }}>
                          {meta.label} · {relativeDay(e.date)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {editing && (
        <EntityDialog
          entityKey={editing.entityKey}
          mode="edit"
          path={editing.path}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      )}
    </div>
  );
}

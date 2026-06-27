"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/data/types";
import { AREA_META, PRIORITY_META } from "@/lib/areas";
import { relativeDay } from "@/lib/utils";

export function TasksList({ tasks }: { tasks: Task[] }) {
  const [state, setState] = React.useState(tasks);

  const toggle = (id: string) =>
    setState((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done, status: t.done ? "in_progress" : "done" } : t))
    );

  const done = state.filter((t) => t.done).length;

  if (state.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
        <p className="text-sm font-medium text-foreground">No tasks due</p>
        <p className="text-xs text-muted-foreground">
          Add an assignment, exam or project in your vault to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {done} of {state.length} complete
        </span>
        <span className="font-medium text-foreground">{Math.round((done / state.length) * 100)}%</span>
      </div>
      <ul className="space-y-1">
        {state.map((task) => {
          const meta = AREA_META[task.area];
          return (
            <li key={task.id}>
              <button
                onClick={() => toggle(task.id)}
                className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2"
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md border transition-all",
                    task.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-hairline group-hover:border-muted-foreground"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {task.done ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </motion.span>
                    ) : (
                      <Circle className="size-2.5 text-transparent" />
                    )}
                  </AnimatePresence>
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm transition-colors",
                      task.done ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                  >
                    {task.title}
                  </span>
                </span>
                <span className="hidden items-center gap-2 sm:flex">
                  <span className={cn("size-1.5 rounded-full", PRIORITY_META[task.priority].dot)} />
                  <span className={cn("text-[11px] font-medium", meta.text)}>{meta.label}</span>
                </span>
                {task.due && (
                  <span className="shrink-0 text-[11px] text-muted-foreground">{relativeDay(task.due)}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

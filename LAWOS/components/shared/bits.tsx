"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/components/motion/primitives";

/** Thin animated progress bar with optional colour. */
export function MiniBar({
  value,
  className,
  color,
  height = 6,
}: {
  value: number;
  className?: string;
  color?: string;
  height?: number;
}) {
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-surface-2", className)}
      style={{ height }}
    >
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
        className="h-full rounded-full"
        style={{
          background: color
            ? `linear-gradient(90deg, ${color}, ${color}bb)`
            : "linear-gradient(90deg, var(--primary), #a78bfa)",
        }}
      />
    </div>
  );
}

/** A labelled metric chip, e.g. "Credits 96 / 120". */
export function MetricPill({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-2/50 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

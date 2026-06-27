"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Stat } from "@/lib/data/types";
import { Stagger, StaggerItem, HoverLift } from "@/components/motion/primitives";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { ProgressRing } from "@/components/ui/progress-ring";

/** Parses "3.86", "$210k+", "23 days" → animatable lead number + the rest. */
function splitValue(value: string | number): { num: number | null; decimals: number; prefix: string; suffix: string } {
  const s = String(value);
  const match = s.match(/^([^\d-]*)(-?\d+(?:\.(\d+))?)(.*)$/);
  if (!match) return { num: null, decimals: 0, prefix: "", suffix: s };
  const [, prefix, numStr, frac, suffix] = match;
  return { num: parseFloat(numStr), decimals: frac ? frac.length : 0, prefix, suffix };
}

export function StatCard({ stat, className }: { stat: Stat; className?: string }) {
  const { num, decimals, prefix, suffix } = splitValue(stat.value);
  const TrendIcon = stat.trend
    ? stat.trend.direction === "up"
      ? ArrowUpRight
      : stat.trend.direction === "down"
      ? ArrowDownRight
      : Minus
    : null;
  const trendColor =
    stat.trend?.direction === "up"
      ? "text-emerald-400"
      : stat.trend?.direction === "down"
      ? "text-rose-400"
      : "text-muted-foreground";

  return (
    <StaggerItem className={className}>
      <HoverLift className="surface-card card-sheen group h-full p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {num !== null ? (
                <AnimatedNumber value={num} decimals={decimals} prefix={prefix} suffix={suffix} />
              ) : (
                String(stat.value)
              )}
            </p>
          </div>
          {stat.progress !== undefined && (
            <ProgressRing value={stat.progress} size={44} stroke={4}>
              <span className="text-[10px] font-semibold text-foreground">{stat.progress}%</span>
            </ProgressRing>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          {stat.trend && TrendIcon && (
            <span className={cn("inline-flex items-center gap-0.5 font-medium", trendColor)}>
              <TrendIcon className="size-3.5" />
              {stat.trend.delta > 0 ? "+" : ""}
              {stat.trend.delta}
            </span>
          )}
          {stat.hint && <span className="truncate text-muted-foreground">{stat.hint}</span>}
          {stat.trend?.label && !stat.hint && (
            <span className="truncate text-muted-foreground">{stat.trend.label}</span>
          )}
        </div>
      </HoverLift>
    </StaggerItem>
  );
}

export function StatGrid({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <Stagger className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((s) => (
        <StatCard key={s.id} stat={s} />
      ))}
    </Stagger>
  );
}

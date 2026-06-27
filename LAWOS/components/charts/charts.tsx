"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_PALETTE } from "@/lib/areas";
import type { SeriesPoint } from "@/lib/data/types";

const AXIS = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-hairline glass px-3 py-2 text-xs shadow-xl">
      {label != null && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: entry.color ?? entry.payload?.fill }} />
          <span className="text-foreground font-medium">
            {entry.value}
            {unit ?? ""}
          </span>
          <span>{entry.name}</span>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Area trend (focus hours, IELTS, pages...)                          */
/* ------------------------------------------------------------------ */

export function AreaTrendChart({
  data,
  height = 240,
  color = "var(--primary)",
  unit,
  showAxis = true,
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  unit?: string;
  showAxis?: boolean;
}) {
  const id = React.useId();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxis && <XAxis dataKey="label" {...AXIS} dy={6} />}
        {showAxis && <YAxis {...AXIS} width={32} />}
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: "var(--hairline)" }} />
        <Area
          type="monotone"
          dataKey="value"
          name="Value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${id})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Dual area (e.g. planned vs actual focus)                           */
/* ------------------------------------------------------------------ */

export function DualAreaChart({ data, height = 260 }: { data: SeriesPoint[]; height?: number }) {
  const a = React.useId();
  const b = React.useId();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={a} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={b} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" {...AXIS} dy={6} />
        <YAxis {...AXIS} width={32} />
        <Tooltip content={<ChartTooltip unit="h" />} cursor={{ stroke: "var(--hairline)" }} />
        <Area type="monotone" dataKey="value" name="Focus" stroke="var(--primary)" strokeWidth={2.5} fill={`url(#${a})`} dot={false} animationDuration={900} />
        <Area type="monotone" dataKey="secondary" name="Deep work" stroke="#34d399" strokeWidth={2} fill={`url(#${b})`} dot={false} animationDuration={1100} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Bar                                                                */
/* ------------------------------------------------------------------ */

export function BarMiniChart({
  data,
  height = 220,
  unit,
  color = "var(--primary)",
}: {
  data: SeriesPoint[];
  height?: number;
  unit?: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <XAxis dataKey="label" {...AXIS} dy={6} />
        <YAxis {...AXIS} width={32} />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: "var(--hairline)", opacity: 0.4 }} />
        <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]} animationDuration={800}>
          {data.map((_, i) => (
            <Cell key={i} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Line                                                               */
/* ------------------------------------------------------------------ */

export function LineTrendChart({
  data,
  height = 220,
  color = "var(--primary)",
  unit,
  domain,
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  unit?: string;
  domain?: [number, number];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <XAxis dataKey="label" {...AXIS} dy={6} />
        <YAxis {...AXIS} width={32} domain={domain ?? ["auto", "auto"]} />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: "var(--hairline)" }} />
        <Line
          type="monotone"
          dataKey="value"
          name="Value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, strokeWidth: 0, fill: color }}
          activeDot={{ r: 5, strokeWidth: 0 }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Donut (area distribution)                                          */
/* ------------------------------------------------------------------ */

export function DonutChart({
  data,
  height = 240,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip content={<ChartTooltip unit="%" />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius="62%"
          outerRadius="92%"
          paddingAngle={3}
          stroke="none"
          animationDuration={900}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Radar (skills)                                                     */
/* ------------------------------------------------------------------ */

export function SkillRadarChart({
  data,
  height = 280,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--hairline)" />
        <PolarAngleAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <Tooltip content={<ChartTooltip />} />
        <Radar
          dataKey="value"
          name="Level"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="var(--primary)"
          fillOpacity={0.22}
          animationDuration={900}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

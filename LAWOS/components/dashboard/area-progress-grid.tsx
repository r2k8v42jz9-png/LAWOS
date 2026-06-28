"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { AreaProgress } from "@/lib/data/types";
import { AREA_META } from "@/lib/areas";
import { ALL_NAV_ITEMS } from "@/lib/nav";
import { Stagger, StaggerItem, HoverLift } from "@/components/motion/primitives";

function hrefForArea(area: string) {
  return ALL_NAV_ITEMS.find((i) => i.area === area)?.href ?? "/";
}

export function AreaProgressGrid({ items }: { items: AreaProgress[] }) {
  return (
    <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const meta = AREA_META[item.area];
        return (
          <StaggerItem key={item.area}>
            <HoverLift>
              <Link
                href={hrefForArea(item.area)}
                className="surface-card card-sheen group block overflow-hidden p-4"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                    style={{ background: `${meta.hex}1a`, color: meta.hex }}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {item.label}
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <p className="text-3xl font-semibold tracking-tight text-foreground">{item.progress}%</p>
                  {item.trend && (
                    <span className="mb-1 text-xs font-medium text-emerald-400">
                      +{item.trend.delta}%
                    </span>
                  )}
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${meta.hex}, ${meta.hex}aa)` }}
                  />
                </div>
                <p className="mt-2.5 truncate text-xs text-muted-foreground">{item.caption}</p>
              </Link>
            </HoverLift>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

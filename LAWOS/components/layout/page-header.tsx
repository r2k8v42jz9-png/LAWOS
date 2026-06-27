"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE } from "@/components/motion/primitives";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary/80">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
          <span className="text-gradient">{title}</span>
        </h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, FlaskConical, ArrowRight } from "lucide-react";
import { formatLongDate } from "@/lib/utils";
import type { Book, Research } from "@/lib/data/types";
import { EASE } from "@/components/motion/primitives";
import { ProgressRing } from "@/components/ui/progress-ring";

export function MissionCard({ mission, gpa }: { mission: string; gpa: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="surface-card card-sheen relative overflow-hidden p-6 lg:col-span-2"
    >
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-[0.4]" />
      <div
        aria-hidden
        className="absolute -right-20 -top-24 size-64 rounded-full bg-primary/15 blur-[90px]"
      />
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
          <Sparkles className="size-3.5" />
          Mission Today
        </span>
        <span className="text-xs text-muted-foreground">{formatLongDate("2026-06-27")}</span>
      </div>
      <p className="mt-4 max-w-2xl text-balance text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl">
        {mission}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/foundation"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Start focus session
          <ArrowRight className="size-4" />
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-hairline bg-surface-2/60 px-3 py-2">
          <span className="text-xs text-muted-foreground">GPA</span>
          <span className="text-sm font-semibold text-foreground">{gpa.toFixed(2)}</span>
          <span className="text-xs font-medium text-emerald-400">Top 5%</span>
        </div>
      </div>
    </motion.div>
  );
}

export function CurrentBookCard({ book }: { book: Book }) {
  const pct = Math.round((book.currentPage / book.totalPages) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
      className="surface-card card-sheen flex flex-col p-5"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
        <BookOpen className="size-4" /> Currently Reading
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="relative h-20 w-14 shrink-0 rounded-md shadow-lg"
          style={{ background: `linear-gradient(150deg, ${book.coverColor}, ${book.coverColor}99)` }}
        >
          <span className="absolute inset-y-0 left-1 w-px bg-white/20" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{book.title}</p>
          <p className="truncate text-xs text-muted-foreground">{book.author}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            p. {book.currentPage} / {book.totalPages}
          </p>
        </div>
        <div className="ml-auto">
          <ProgressRing value={pct} size={52} stroke={5} gradientTo="#fbbf24">
            <span className="text-[11px] font-semibold text-foreground">{pct}%</span>
          </ProgressRing>
        </div>
      </div>
    </motion.div>
  );
}

export function CurrentResearchCard({ research }: { research: Research }) {
  const words = research.wordCount ?? 0;
  const target = research.targetWords ?? 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
      className="surface-card card-sheen flex flex-col p-5"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
        <FlaskConical className="size-4" /> Active Research
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-foreground">{research.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{research.field}</p>
      <div className="mt-auto pt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {words.toLocaleString()} / {target.toLocaleString()} words
          </span>
          <span className="font-medium text-foreground">{research.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${research.progress}%` }}
            transition={{ duration: 1, ease: EASE, delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
          />
        </div>
      </div>
    </motion.div>
  );
}

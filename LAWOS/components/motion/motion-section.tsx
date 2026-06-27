"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE } from "./primitives";

/**
 * Client-only animated section wrapper. Kept separate so server components
 * (like <Panel>) can stay server components and still render an entrance
 * animation by composing this around their children.
 */
export function MotionSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

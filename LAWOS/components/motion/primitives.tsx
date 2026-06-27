"use client";

import * as React from "react";
import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Shared easing — a calm, premium curve used everywhere.            */
/* ------------------------------------------------------------------ */

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE } },
};

/* ------------------------------------------------------------------ */
/*  Stagger — wrap a group; children use <Stagger.Item>.              */
/* ------------------------------------------------------------------ */

interface StaggerProps extends HTMLMotionProps<"div"> {
  delay?: number;
  gap?: number;
}

export function Stagger({ children, className, delay = 0.04, gap = 0.06, ...props }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { delayChildren: delay, staggerChildren: gap } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variant = "up",
  ...props
}: HTMLMotionProps<"div"> & { variant?: "up" | "in" | "scale" }) {
  const variants = variant === "in" ? fadeIn : variant === "scale" ? scaleIn : fadeUp;
  return (
    <motion.div variants={variants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  FadeIn — single element, viewport-triggered.                      */
/* ------------------------------------------------------------------ */

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 14,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  HoverCard — lifts subtly on hover. Pairs with surface-card.        */
/* ------------------------------------------------------------------ */

export function HoverLift({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

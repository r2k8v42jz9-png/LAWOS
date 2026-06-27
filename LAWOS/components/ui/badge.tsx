import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary/12 text-primary ring-primary/20",
        neutral: "bg-surface-2 text-muted-foreground ring-hairline",
        outline: "bg-transparent text-foreground ring-hairline",
        success: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
        danger: "bg-rose-500/10 text-rose-400 ring-rose-500/20",
        info: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

import * as React from "react";
import { cn } from "@/lib/utils";
import { MotionSection } from "@/components/motion/motion-section";

/**
 * A titled surface used for every content block on the pages.
 *
 * This is a Server Component on purpose, so pages can pass a Lucide icon
 * component directly (`icon={TrendingUp}`) without crossing the client
 * boundary. The entrance animation is delegated to <MotionSection>.
 */
export function Panel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
  delay = 0,
}: {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  delay?: number;
}) {
  return (
    <MotionSection className={cn("surface-card overflow-hidden", className)} delay={delay}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted-foreground ring-1 ring-hairline">
                <Icon className="size-4" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>}
              {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </MotionSection>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

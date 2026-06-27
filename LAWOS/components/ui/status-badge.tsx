import { cn } from "@/lib/utils";
import { STATUS_META, PRIORITY_META } from "@/lib/areas";
import type { Status, Priority } from "@/lib/data/types";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        meta.className,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.className, className)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

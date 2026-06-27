import { cn } from "@/lib/utils";
import { AREA_META } from "@/lib/areas";
import type { AreaKey } from "@/lib/data/types";

export function AreaTag({ area, className }: { area: AreaKey; className?: string }) {
  const meta = AREA_META[area];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        meta.tint,
        meta.text,
        meta.ring,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

export function AreaDot({ area, className }: { area: AreaKey; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 rounded-full", className)}
      style={{ background: AREA_META[area].hex }}
    />
  );
}

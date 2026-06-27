import {
  CheckCircle2,
  FileText,
  BookOpen,
  FlaskConical,
  Award,
  RotateCcw,
  Flag,
  type LucideIcon,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { ActivityItem, ActivityKind } from "@/lib/data/types";
import { AREA_META } from "@/lib/areas";

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  task: CheckCircle2,
  note: FileText,
  reading: BookOpen,
  research: FlaskConical,
  evidence: Award,
  review: RotateCcw,
  milestone: Flag,
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="relative space-y-0.5">
      {items.map((item, i) => {
        const Icon = KIND_ICON[item.kind];
        const meta = AREA_META[item.area];
        const last = i === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-3 pb-3">
            {!last && <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-hairline" />}
            <span
              className="z-10 grid size-8 shrink-0 place-items-center rounded-full ring-1 ring-inset"
              style={{ background: `${meta.hex}1a`, color: meta.hex, boxShadow: `inset 0 0 0 1px ${meta.hex}33` }}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm text-foreground">{item.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className={meta.text}>{meta.label}</span>
                <span className="opacity-40">·</span>
                {relativeTime(item.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

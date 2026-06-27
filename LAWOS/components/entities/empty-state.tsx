"use client";

import * as React from "react";
import { Plus, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEntityDef } from "@/lib/obsidian/entities";
import { EntityDialog } from "./entity-dialog";

/**
 * Elegant empty state with a primary "Create first X" action that opens the
 * create dialog. Drop it in wherever a list/section has no records yet.
 */
export function EntityEmptyState({
  entityKey,
  title,
  hint,
  actionLabel,
}: {
  entityKey: string;
  title?: string;
  hint?: string;
  actionLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const entity = getEntityDef(entityKey);
  if (!entity) return null;
  const noun = entity.label.toLowerCase();

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-hairline bg-surface-2/30 px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-muted-foreground ring-1 ring-hairline">
        <Inbox className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title ?? `No ${noun}s yet`}</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          {hint ?? `Create your first ${noun} — it's saved straight to your Obsidian vault.`}
        </p>
      </div>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {actionLabel ?? `Create first ${noun}`}
      </Button>
      <EntityDialog entityKey={entityKey} mode="create" open={open} onOpenChange={setOpen} />
    </div>
  );
}

"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEntityDef } from "@/lib/obsidian/entities";
import { EntityDialog } from "./entity-dialog";

/** A single "New X" button that opens the create dialog. */
export function NewEntityButton({
  entityKey,
  label,
  variant = "default",
  size = "sm",
}: {
  entityKey: string;
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const [open, setOpen] = React.useState(false);
  const entity = getEntityDef(entityKey);
  if (!entity) return null;
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {label ?? `New ${entity.label}`}
      </Button>
      <EntityDialog entityKey={entityKey} mode="create" open={open} onOpenChange={setOpen} />
    </>
  );
}

/** A "New ▾" dropdown for pages that create several record types. */
export function NewEntityMenu({
  items,
  buttonLabel = "New",
}: {
  items: { entityKey: string; label?: string }[];
  buttonLabel?: string;
}) {
  const [active, setActive] = React.useState<string | null>(null);
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button size="sm">
            <Plus className="size-4" />
            {buttonLabel}
            <ChevronDown className="size-3.5 opacity-70" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content asChild align="end" sideOffset={6}>
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.14 }}
              className="z-50 min-w-44 overflow-hidden rounded-xl border border-hairline glass p-1.5 shadow-2xl"
            >
              {items.map(({ entityKey, label }) => {
                const entity = getEntityDef(entityKey);
                if (!entity) return null;
                return (
                  <DropdownMenu.Item
                    key={entityKey}
                    onSelect={() => setActive(entityKey)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-surface-2"
                  >
                    <Plus className="size-3.5 text-muted-foreground" />
                    {label ?? `New ${entity.label}`}
                  </DropdownMenu.Item>
                );
              })}
            </motion.div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* One shared dialog, driven by which item was picked. */}
      {items.map(({ entityKey }) => (
        <EntityDialog
          key={entityKey}
          entityKey={entityKey}
          mode="create"
          open={active === entityKey}
          onOpenChange={(o) => setActive(o ? entityKey : null)}
        />
      ))}
    </>
  );
}

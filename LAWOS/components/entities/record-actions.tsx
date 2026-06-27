"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEntityDef } from "@/lib/obsidian/entities";
import { deleteEntity } from "@/lib/obsidian/actions";
import { EntityDialog } from "./entity-dialog";

/**
 * Kebab menu on a record card: Edit (opens the edit dialog) and Delete (asks for
 * confirmation, then removes the markdown file). Delete is optimistic — it hides
 * the nearest [data-record-card] immediately and restores it on failure.
 */
export function RecordActions({
  entityKey,
  path,
  name,
}: {
  entityKey: string;
  path: string;
  name?: string;
}) {
  const router = useRouter();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const entity = getEntityDef(entityKey);
  if (!entity) return null;

  const card = () => triggerRef.current?.closest<HTMLElement>("[data-record-card]") ?? null;

  async function onDelete() {
    setDeleting(true);
    setError(null);
    const el = card();
    if (el) el.style.opacity = "0.4";
    const res = await deleteEntity(path);
    if (res.ok) {
      if (el) el.style.display = "none";
      setConfirming(false);
      router.refresh();
    } else {
      if (el) el.style.opacity = "1";
      setError(res.message ?? "Couldn't delete.");
    }
    setDeleting(false);
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            ref={triggerRef}
            aria-label="Record actions"
            className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-surface-2 hover:text-foreground data-[state=open]:bg-surface-2"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content asChild align="end" sideOffset={6}>
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.12 }}
              className="z-50 min-w-36 overflow-hidden rounded-xl border border-hairline glass p-1.5 shadow-2xl"
            >
              <DropdownMenu.Item
                onSelect={() => setEditing(true)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none data-[highlighted]:bg-surface-2"
              >
                <Pencil className="size-3.5 text-muted-foreground" /> Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => setConfirming(true)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-rose-400 outline-none data-[highlighted]:bg-rose-500/10"
              >
                <Trash2 className="size-3.5" /> Delete
              </DropdownMenu.Item>
            </motion.div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <EntityDialog entityKey={entityKey} mode="edit" path={path} open={editing} onOpenChange={setEditing} />

      {/* Delete confirmation */}
      <Dialog.Root open={confirming} onOpenChange={(o) => !deleting && setConfirming(o)}>
        <AnimatePresence>
          {confirming && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild aria-describedby={undefined}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.16 }}
                  className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-hairline glass p-5 shadow-2xl"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20">
                      <Trash2 className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <Dialog.Title className="text-sm font-semibold text-foreground">
                        Delete {entity.label.toLowerCase()}?
                      </Dialog.Title>
                      <p className="mt-1 text-xs text-muted-foreground">
                        This permanently removes{" "}
                        <span className="font-medium text-foreground">{name ?? "this note"}</span> from
                        your Obsidian vault. This can't be undone.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                      <AlertCircle className="size-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={onDelete} disabled={deleting}>
                      {deleting && <Loader2 className="size-4 animate-spin" />}
                      Delete
                    </Button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}

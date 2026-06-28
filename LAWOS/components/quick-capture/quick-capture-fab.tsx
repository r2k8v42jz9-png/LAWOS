"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Zap, Loader2, CornerDownLeft, AlertCircle, Check } from "lucide-react";
import { Input } from "@/components/ui/field";
import { parseCapture, CAPTURE_HINTS } from "@/lib/obsidian/capture";
import { quickCapture } from "@/lib/obsidian/actions";
import { areaFromPath, hrefForArea } from "@/lib/obsidian/classify";

/**
 * Floating "+" quick-capture. Type "book Constitutional Law" and hit Enter to
 * create the record straight in the vault — no navigation. Reuses parseCapture
 * + quickCapture (which reuses createEntity), so there's no duplicated logic.
 */
export function QuickCaptureFab() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (!open) {
      setValue("");
      setError(null);
      setDone(null);
      setBusy(false);
    }
  }, [open]);

  // Let other UI (e.g. the topbar "New" button) open quick capture.
  React.useEffect(() => {
    const openCapture = () => setOpen(true);
    window.addEventListener("lawos:quick-capture", openCapture);
    return () => window.removeEventListener("lawos:quick-capture", openCapture);
  }, []);

  const parsed = parseCapture(value);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await quickCapture(value);
    setBusy(false);
    if (res.ok) {
      setDone(`${res.entityLabel ?? "Record"} created`);
      const href = res.path ? hrefForArea(areaFromPath(res.path)) : "/";
      router.refresh();
      setTimeout(() => {
        setOpen(false);
        router.push(href);
      }, 650);
    } else {
      setError(res.message ?? "Couldn't create that.");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Quick capture"
          className="fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-8px_var(--glow)] outline-none transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <Plus className="size-5" />
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined} onOpenAutoFocus={(e) => e.preventDefault()}>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-[20%] z-50 w-[92vw] max-w-md -translate-x-1/2 overflow-hidden rounded-2xl border border-hairline glass shadow-2xl"
              >
                <Dialog.Title className="sr-only">Quick capture</Dialog.Title>
                <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5 text-xs font-medium text-primary">
                  <Zap className="size-3.5" /> Quick capture
                </div>

                <div className="p-4">
                  <Input
                    autoFocus
                    value={value}
                    placeholder="book Constitutional Law"
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submit();
                      }
                    }}
                    disabled={busy || !!done}
                  />

                  {/* live preview */}
                  <div className="mt-2 min-h-5 text-xs">
                    {done ? (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="size-3.5" /> {done}
                      </span>
                    ) : error ? (
                      <span className="flex items-center gap-1.5 text-rose-400">
                        <AlertCircle className="size-3.5" /> {error}
                      </span>
                    ) : parsed ? (
                      <span className="text-muted-foreground">
                        Creates a{" "}
                        <span className="font-medium text-foreground">{parsed.entityLabel}</span> named “
                        <span className="text-foreground">{parsed.title}</span>”
                      </span>
                    ) : (
                      <span className="text-muted-foreground/70">
                        Start with a type, then a title.
                      </span>
                    )}
                  </div>

                  {/* hint chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {CAPTURE_HINTS.map((h) => (
                      <button
                        key={h.keyword}
                        onClick={() => setValue(`${h.keyword} `)}
                        className="rounded-full border border-hairline bg-surface-2/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                      >
                        {h.keyword}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-hairline px-4 py-2.5 text-[11px] text-muted-foreground">
                  <span>Saved straight to your vault</span>
                  <span className="flex items-center gap-1">
                    {busy ? <Loader2 className="size-3 animate-spin" /> : <CornerDownLeft className="size-3" />} create
                  </span>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import { ALL_NAV_ITEMS } from "@/lib/nav";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

interface CommandMenuContext {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Ctx = React.createContext<CommandMenuContext | null>(null);

export function useCommandMenu() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCommandMenu must be used within CommandMenuProvider");
  return ctx;
}

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isTyping(e))) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const run = React.useCallback(
    (fn: () => void) => {
      setOpen(false);
      fn();
    },
    []
  );

  return (
    <Ctx.Provider value={{ open, setOpen }}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
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
              <Dialog.Content
                asChild
                aria-describedby={undefined}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed left-1/2 top-[18%] z-50 w-[92vw] max-w-xl -translate-x-1/2"
                >
                  <Dialog.Title className="sr-only">Command menu</Dialog.Title>
                  <Command
                    className="overflow-hidden rounded-2xl border border-hairline glass shadow-2xl"
                    loop
                  >
                    <div className="flex items-center gap-3 border-b border-hairline px-4">
                      <Search className="size-4 text-muted-foreground" />
                      <Command.Input
                        autoFocus
                        placeholder="Search pages, jump to anything…"
                        className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                      <kbd className="hidden rounded border border-hairline bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                        ESC
                      </kbd>
                    </div>
                    <Command.List className="max-h-[340px] overflow-y-auto p-2">
                      <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                        No results found.
                      </Command.Empty>
                      <Command.Group heading="Navigate" className="px-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                        {ALL_NAV_ITEMS.map((item) => (
                          <Command.Item
                            key={item.href}
                            value={item.label}
                            onSelect={() => run(() => router.push(item.href))}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-surface-2"
                          >
                            <item.icon className="size-4 text-muted-foreground" />
                            <span>{item.label}</span>
                            {item.shortcut && (
                              <kbd className="ml-auto text-[10px] tracking-widest text-muted-foreground">
                                {item.shortcut}
                              </kbd>
                            )}
                          </Command.Item>
                        ))}
                      </Command.Group>
                      <Command.Group heading="Theme" className="px-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                        <Command.Item
                          value="toggle theme dark light"
                          onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-surface-2"
                        >
                          {theme === "dark" ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
                          <span>Toggle theme</span>
                        </Command.Item>
                      </Command.Group>
                    </Command.List>
                    <div className="flex items-center gap-3 border-t border-hairline px-3 py-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><ArrowUp className="size-3" /><ArrowDown className="size-3" /> navigate</span>
                      <span className="flex items-center gap-1"><CornerDownLeft className="size-3" /> select</span>
                    </div>
                  </Command>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </Ctx.Provider>
  );
}

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
}

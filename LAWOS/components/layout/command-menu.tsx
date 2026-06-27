"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Moon,
  Sun,
  Plus,
  Loader2,
  BookOpen,
  GraduationCap,
  Scale,
  FileText,
  CalendarClock,
  FlaskConical,
  Library,
  Award,
  Languages,
  BookA,
  ClipboardCheck,
  Building2,
  Flag,
  FolderKanban,
  FileQuestion,
  type LucideIcon,
} from "lucide-react";
import { ALL_NAV_ITEMS } from "@/lib/nav";
import { useTheme } from "next-themes";
import { fuzzyMatch, highlightSegments } from "@/lib/fuzzy";
import { areaFromPath, hrefForArea } from "@/lib/obsidian/classify";
import { parseCapture } from "@/lib/obsidian/capture";
import { fetchSearchIndex, quickCapture } from "@/lib/obsidian/actions";
import type { SearchRecord } from "@/lib/data/types";

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

const KIND_ICON: Record<string, LucideIcon> = {
  Book: BookOpen,
  Subject: GraduationCap,
  Course: Scale,
  Assignment: FileText,
  Exam: CalendarClock,
  Project: FolderKanban,
  Research: FlaskConical,
  "Case / Source": Library,
  Evidence: Award,
  "IELTS Mock": ClipboardCheck,
  Vocabulary: BookA,
  Scholarship: Award,
  University: Building2,
  Milestone: Flag,
  "Daily Note": CalendarClock,
  Note: FileText,
};

function Highlight({ text, indices }: { text: string; indices: number[] }) {
  return (
    <>
      {highlightSegments(text, indices).map((seg, i) =>
        seg.hit ? (
          <span key={i} className="text-foreground font-medium underline decoration-primary/40 underline-offset-2">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState<SearchRecord[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [capturing, setCapturing] = React.useState(false);
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

  // Load (refresh) the search index whenever the palette opens.
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    let alive = true;
    setLoading(true);
    fetchSearchIndex()
      .then((data) => alive && setIndex(data))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open]);

  const run = React.useCallback((fn: () => void) => {
    setOpen(false);
    fn();
  }, []);

  /* ---- derived results ---- */
  const capture = parseCapture(query);

  const records = React.useMemo(() => {
    if (!query.trim()) return [] as { record: SearchRecord; indices: number[]; score: number }[];
    const scored: { record: SearchRecord; indices: number[]; score: number }[] = [];
    for (const r of index) {
      const m = fuzzyMatch(query, r.title);
      if (m) scored.push({ record: r, indices: m.indices, score: m.score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 30);
  }, [query, index]);

  const grouped = React.useMemo(() => {
    const groups = new Map<string, typeof records>();
    for (const item of records) {
      const key = item.record.kindLabel;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return [...groups.entries()];
  }, [records]);

  const navMatches = React.useMemo(() => {
    if (!query.trim()) return ALL_NAV_ITEMS;
    return ALL_NAV_ITEMS.map((i) => ({ i, m: fuzzyMatch(query, i.label) }))
      .filter((x) => x.m)
      .map((x) => x.i);
  }, [query]);

  async function onCapture() {
    setCapturing(true);
    const res = await quickCapture(query);
    setCapturing(false);
    if (res.ok) {
      setOpen(false);
      const href = res.path ? hrefForArea(areaFromPath(res.path)) : "/";
      router.push(href);
      router.refresh();
    }
  }

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
              <Dialog.Content asChild aria-describedby={undefined} onOpenAutoFocus={(e) => e.preventDefault()}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed left-1/2 top-[12%] z-50 w-[92vw] max-w-xl -translate-x-1/2"
                >
                  <Dialog.Title className="sr-only">Search and commands</Dialog.Title>
                  <Command className="overflow-hidden rounded-2xl border border-hairline glass shadow-2xl" shouldFilter={false} loop>
                    <div className="flex items-center gap-3 border-b border-hairline px-4">
                      {loading ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Search className="size-4 text-muted-foreground" />
                      )}
                      <Command.Input
                        autoFocus
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Search the vault, or type “book Title” to create…"
                        className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                      <kbd className="hidden rounded border border-hairline bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                        ESC
                      </kbd>
                    </div>

                    <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                      {!loading && query.trim() && records.length === 0 && !capture && (
                        <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                          No matches in your vault.
                        </Command.Empty>
                      )}

                      {/* Quick capture */}
                      {capture && (
                        <Command.Group heading="Quick capture" className="px-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                          <Command.Item
                            value={`__capture__${query}`}
                            onSelect={onCapture}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-surface-2"
                          >
                            {capturing ? <Loader2 className="size-4 animate-spin text-primary" /> : <Plus className="size-4 text-primary" />}
                            <span>
                              Create {capture.entityLabel}:{" "}
                              <span className="font-medium">{capture.title}</span>
                            </span>
                            <kbd className="ml-auto text-[10px] text-muted-foreground">Enter</kbd>
                          </Command.Item>
                        </Command.Group>
                      )}

                      {/* Record results, grouped by kind */}
                      {grouped.map(([label, items]) => {
                        const Icon = KIND_ICON[label] ?? FileQuestion;
                        return (
                          <Command.Group
                            key={label}
                            heading={label}
                            className="px-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                          >
                            {items.map(({ record, indices }) => (
                              <Command.Item
                                key={record.path}
                                value={record.path}
                                onSelect={() => run(() => router.push(record.href))}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground data-[selected=true]:bg-surface-2"
                              >
                                <Icon className="size-4 shrink-0 text-muted-foreground" />
                                <span className="truncate text-foreground">
                                  <Highlight text={record.title} indices={indices} />
                                </span>
                                <span className="ml-auto shrink-0 truncate pl-3 text-[11px] text-muted-foreground/70">
                                  {record.folder}
                                </span>
                              </Command.Item>
                            ))}
                          </Command.Group>
                        );
                      })}

                      {/* Navigate */}
                      {navMatches.length > 0 && (
                        <Command.Group heading="Navigate" className="px-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                          {navMatches.map((item) => (
                            <Command.Item
                              key={item.href}
                              value={`nav:${item.label}`}
                              onSelect={() => run(() => router.push(item.href))}
                              className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-surface-2"
                            >
                              <item.icon className="size-4 text-muted-foreground" />
                              <span>{item.label}</span>
                              {item.shortcut && (
                                <kbd className="ml-auto text-[10px] tracking-widest text-muted-foreground">{item.shortcut}</kbd>
                              )}
                            </Command.Item>
                          ))}
                        </Command.Group>
                      )}

                      {!query.trim() && (
                        <Command.Group heading="Theme" className="px-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                          <Command.Item
                            value="toggle theme"
                            onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-surface-2"
                          >
                            {theme === "dark" ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
                            <span>Toggle theme</span>
                          </Command.Item>
                        </Command.Group>
                      )}
                    </Command.List>

                    <div className="flex items-center gap-3 border-t border-hairline px-3 py-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><ArrowUp className="size-3" /><ArrowDown className="size-3" /> navigate</span>
                      <span className="flex items-center gap-1"><CornerDownLeft className="size-3" /> open</span>
                      <span className="ml-auto hidden sm:flex items-center gap-1">
                        <Plus className="size-3" /> type a type + title to create
                      </span>
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

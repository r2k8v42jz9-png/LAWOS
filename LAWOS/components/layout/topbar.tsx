"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, Plus } from "lucide-react";
import { ALL_NAV_ITEMS } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { useCommandMenu } from "./command-menu";

export function Topbar() {
  const pathname = usePathname();
  const { setOpen } = useCommandMenu();
  const current =
    ALL_NAV_ITEMS.find((i) => (i.href === "/" ? pathname === "/" : pathname.startsWith(i.href))) ??
    ALL_NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-hairline bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <MobileNav />

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">LawOS</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">{current?.label}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="group hidden h-9 items-center gap-2 rounded-lg border border-hairline bg-surface-2/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground sm:flex"
        >
          <Search className="size-4" />
          <span className="pr-6">Search…</span>
          <kbd className="rounded border border-hairline bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-muted-foreground sm:hidden" aria-label="Search">
          <Search className="size-[18px]" />
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label="Notifications">
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--glow)]" />
        </Button>

        <ThemeToggle />

        <Button size="sm" className="hidden md:inline-flex">
          <Plus className="size-4" />
          New
        </Button>

        <Avatar className="ml-1 ring-1 ring-hairline">
          <AvatarFallback>AS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

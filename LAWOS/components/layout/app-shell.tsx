"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandMenuProvider } from "./command-menu";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <CommandMenuProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* ambient background glow */}
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 left-1/3 size-[520px] rounded-full bg-primary/10 blur-[120px] animate-aurora" />
            <div className="absolute -right-40 top-20 size-[420px] rounded-full bg-violet-500/10 blur-[120px] animate-aurora [animation-delay:-6s]" />
          </div>
          <Topbar />
          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </CommandMenuProvider>
  );
}

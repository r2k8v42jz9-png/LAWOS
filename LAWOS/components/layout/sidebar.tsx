"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronsLeft, Sparkles } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="sticky top-0 z-30 hidden h-svh shrink-0 flex-col border-r border-hairline bg-surface/60 backdrop-blur-xl lg:flex"
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-4">
        <Logo />
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col leading-none"
          >
            <span className="text-[15px] font-semibold tracking-tight text-foreground">LawOS</span>
            <span className="text-[11px] text-muted-foreground">Operating System</span>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="mb-1.5">
            {section.title && !collapsed && (
              <p className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                {section.title}
              </p>
            )}
            {section.title && collapsed && <div className="my-3 h-px bg-hairline" />}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-2/70",
                        collapsed && "justify-center"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-lg bg-surface-2 ring-1 ring-hairline"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          "relative z-10 size-[18px] shrink-0 transition-colors",
                          active && "text-primary"
                        )}
                      />
                      {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                      {!collapsed && active && (
                        <span className="relative z-10 ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--glow)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-hairline p-3">
        {!collapsed ? (
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/5 p-3 ring-1 ring-hairline">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">Vault connected</p>
              <p className="truncate text-[11px] text-muted-foreground">Law Journey 2026–2030</p>
            </div>
          </div>
        ) : null}
        <Button
          variant="ghost"
          size={collapsed ? "icon-sm" : "sm"}
          onClick={onToggle}
          className={cn("w-full text-muted-foreground", !collapsed && "justify-start")}
        >
          <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </motion.aside>
  );
}

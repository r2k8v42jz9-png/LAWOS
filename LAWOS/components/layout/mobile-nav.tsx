"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 360, damping: 38 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-hairline bg-surface p-3 lg:hidden"
              >
                <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                <div className="flex h-14 items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <Logo size={30} />
                    <span className="font-semibold tracking-tight">LawOS</span>
                  </div>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Close">
                      <X className="size-4" />
                    </Button>
                  </Dialog.Close>
                </div>
                <nav className="mt-2 space-y-1.5 overflow-y-auto">
                  {NAV_SECTIONS.map((section, si) => (
                    <div key={si}>
                      {section.title && (
                        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                          {section.title}
                        </p>
                      )}
                      <ul className="space-y-0.5">
                        {section.items.map((item) => {
                          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                  active
                                    ? "bg-surface-2 text-foreground ring-1 ring-hairline"
                                    : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground"
                                )}
                              >
                                <item.icon className={cn("size-[18px]", active && "text-primary")} />
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </nav>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

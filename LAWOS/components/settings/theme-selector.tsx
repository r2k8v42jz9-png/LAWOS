"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

const OPTIONS = [
  { value: "dark", label: "Dark", icon: Moon, hint: "Default · easy on the eyes" },
  { value: "light", label: "Light", icon: Sun, hint: "Bright workspaces" },
  { value: "system", label: "System", icon: Monitor, hint: "Match your OS" },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const active = mounted ? theme : undefined;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {OPTIONS.map((opt) => {
        const selected = active === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "group relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all",
              selected
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/30"
                : "border-hairline bg-surface-2/40 hover:bg-surface-2"
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-lg ring-1 ring-inset",
                selected ? "bg-primary/15 text-primary ring-primary/20" : "bg-surface-2 text-muted-foreground ring-hairline"
              )}
            >
              <opt.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.hint}</p>
            </div>
            {selected && (
              <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

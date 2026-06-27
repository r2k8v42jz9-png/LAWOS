import {
  Palette,
  FolderTree,
  Plug,
  RefreshCw,
  Database,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { getAdapter } from "@/lib/data";
import { cn, relativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/shared/panel";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Settings" };

const SYNC_META = {
  synced: { label: "Synced", className: "text-emerald-400", dot: "bg-emerald-400" },
  syncing: { label: "Syncing", className: "text-sky-400", dot: "bg-sky-400" },
  error: { label: "Error", className: "text-rose-400", dot: "bg-rose-400" },
  disconnected: { label: "Disconnected", className: "text-muted-foreground", dot: "bg-muted-foreground" },
} as const;

export default async function SettingsPage() {
  const data = await getAdapter().getSettings();
  const sync = SYNC_META[data.sync.state];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Theme, the Obsidian vault, plugins and sync — the plumbing behind LawOS."
      />

      {/* Theme */}
      <Panel title="Appearance" icon={Palette} description="Dark-first, always premium">
        <ThemeSelector />
      </Panel>

      {/* Data source */}
      <Panel title="Data source" icon={Database} description="Where LawOS reads from">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">Active adapter</p>
              <Badge variant={data.adapter === "mock" ? "warning" : "success"} className="capitalize">
                {data.adapter}
              </Badge>
            </div>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
              Currently serving hand-authored mock data. The interface is wired to a single{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[11px]">DataAdapter</code>{" "}
              contract — point it at the Obsidian vault to go live with zero component changes.
            </p>
          </div>
        </div>
      </Panel>

      {/* Vault */}
      <Panel title="Vault" icon={FolderTree} description="Your Obsidian source of truth">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface-2/40 p-3.5">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Vault name</p>
              <p className="truncate text-sm font-medium text-foreground">{data.vaultName}</p>
            </div>
            <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface-2/40 p-3.5">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Path</p>
              <p className="truncate font-mono text-sm text-foreground">{data.vaultPath}</p>
            </div>
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted-foreground ring-1 ring-hairline">
              <Copy className="size-4" />
            </span>
          </div>
        </div>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Plugins */}
        <Panel title="Plugin status" icon={Plug} description={`${data.plugins.filter((p) => p.enabled).length} of ${data.plugins.length} enabled`}>
          <ul className="space-y-2">
            {data.plugins.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-hairline bg-surface-2/40 p-3">
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-lg ring-1 ring-inset",
                    p.enabled ? "bg-primary/12 text-primary ring-primary/20" : "bg-surface-2 text-muted-foreground ring-hairline"
                  )}
                >
                  <Plug className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">v{p.version}</p>
                </div>
                <Switch defaultChecked={p.enabled} aria-label={`Toggle ${p.name}`} />
              </li>
            ))}
          </ul>
        </Panel>

        {/* Sync */}
        <Panel title="Sync status" icon={RefreshCw} description={data.sync.provider}>
          <div className="rounded-xl border border-hairline bg-surface-2/40 p-5">
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full animate-pulse-glow", sync.dot)} />
              <span className={cn("text-sm font-semibold", sync.className)}>{sync.label}</span>
            </div>
            {data.sync.lastSync && (
              <p className="mt-2 text-xs text-muted-foreground">
                Last synced {relativeTime(data.sync.lastSync)} via {data.sync.provider}.
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-2 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Provider</p>
                <p className="text-sm font-medium text-foreground">{data.sync.provider}</p>
              </div>
              <div className="rounded-lg bg-surface-2 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Conflicts</p>
                <p className="text-sm font-medium text-emerald-400">None</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

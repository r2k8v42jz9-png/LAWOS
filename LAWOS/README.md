# LawOS

> An operating system for an academic, legal and professional life.
> The website is the interface — Obsidian is only the database.

LawOS is a production-grade dashboard for tracking a law journey end-to-end:
Foundation studies, the LLB, Legal English / IELTS, reading, research,
scholarships and career evidence. It is designed to feel like Linear, Raycast,
Notion and the Vercel dashboard — minimal, premium, fast, **dark mode first**.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS-first tokens) · **shadcn/ui** primitives
- **Framer Motion** (animation) · **Recharts** (charts) · **lucide-react**
- **next-themes** · deploys cleanly to **Vercel**

## Getting started

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Architecture — the data layer is the point

The UI **never stores data and never imports mock data directly.** Every page is
a server component that pulls from a single adapter:

```ts
import { getAdapter } from "@/lib/data";
const data = await getAdapter().getDashboardData();
```

```
lib/
  data/
    types.ts          # the domain model (DashboardData, Book, Research, …)
    adapter.ts        # the DataAdapter contract every source must satisfy
    mock-adapter.ts   # today's source — hand-authored, deterministic
    index.ts          # getAdapter() factory (the ONE switch point)
  obsidian/
    obsidian-adapter.ts  # FUTURE: reads markdown from the vault (stubbed)
```

### Going live with Obsidian later

1. Implement `lib/obsidian/obsidian-adapter.ts` against the same `DataAdapter`
   interface (parse frontmatter → project into the domain types).
2. Set `LAWOS_ADAPTER=obsidian` and `LAWOS_VAULT_PATH=".../Law Journey 2026-2030"`.
3. **No component changes.** The factory swaps the source; the UI is untouched.

Until then the factory gracefully falls back to the mock adapter.

## Project structure

```
app/            # routes: dashboard + 9 area pages, layout, loading, 404, icon
components/
  layout/       # sidebar, topbar, command menu (⌘K), app shell, theme toggle
  ui/           # shadcn-style primitives (button, card, badge, progress, …)
  charts/       # Recharts wrappers (area, bar, line, donut, radar)
  motion/       # Framer Motion primitives (stagger, fade, animated number)
  dashboard/    # dashboard-specific widgets
  shared/       # cross-page building blocks (StatCard, Panel, Timeline…)
  settings/     # settings controls
hooks/          # use-mounted, …
lib/            # data layer, nav config, area metadata, utils
types/          # public type barrel (@/types)
styles/         # notes; tokens live in app/globals.css (Tailwind v4)
```

## Design system

Tokens, theming and keyframes live in `app/globals.css` (Tailwind v4 is
CSS-first). Highlights: `.surface-card`, `.card-sheen`, `.bg-grid`,
`.text-gradient`, plus `aurora` / `shimmer` / `pulse-glow` animations. Respects
`prefers-reduced-motion`.

## Keyboard

- `⌘K` / `Ctrl K` (or `/`) — open the command palette to jump anywhere.
```

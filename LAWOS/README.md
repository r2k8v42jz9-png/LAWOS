# LawOS

> An operating system for an academic, legal and professional life.
> The website is the interface — Obsidian is only the database.

LawOS is a production-grade dashboard for tracking a law journey end-to-end:
Foundation studies, the LLB, Legal English / IELTS, reading, research,
scholarships and career evidence. It is designed to feel like Linear, Raycast,
Notion and the Vercel dashboard — minimal, premium, fast, **dark mode first**.

> **Status: v1.0 web — stable and feature-complete.** Records are created,
> edited and deleted directly in the UI and written to your Obsidian vault.
> A native **Tauri v2 desktop** shell is also available — see [DESKTOP.md](DESKTOP.md).
> See [CHANGELOG.md](CHANGELOG.md).

## Features

- **Read & write the vault** — full CRUD for Books, Subjects, Courses,
  Assignments, Exams, Vocabulary, Research, Cases, Evidence, Scholarships,
  Internships, Opportunities and Applications. Optional **safe file rename**
  that rewrites `[[wiki-links]]` so nothing breaks.
- **Dashboard intelligence** — what's due, overdue, coming up and what changed,
  computed live from the vault.
- **Global search (⌘K)** — fuzzy, grouped, with folder paths and highlighting.
- **Quick Capture** — `book Constitutional Law` → a record, from anywhere.
- **Calendar & Analytics** — every dated record on one calendar; charts driven
  entirely by real vault data.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS-first tokens) · **shadcn/ui** primitives
- **Framer Motion** (animation) · **Recharts** (charts) · **lucide-react**
- **next-themes** · deploys cleanly to **Vercel**

## Getting started

```bash
npm install
cp .env.example .env.local      # then paste your OBSIDIAN_API_KEY
npm run dev                     # → http://localhost:3000
```

Prerequisite: Obsidian open with the **Local REST API** plugin enabled. Copy the
API key from the plugin's settings into `.env.local`.

## Architecture — the Obsidian vault is the database

The UI **never stores data.** Every page is a server component that pulls from a
single adapter, which reads your Obsidian vault live over the Local REST API:

```ts
import { getAdapter } from "@/lib/data";
const data = await getAdapter().getDashboardData();
```

```
lib/
  data/
    types.ts          # the domain model (DashboardData, Book, Research, …)
    adapter.ts        # the DataAdapter contract
    index.ts          # getAdapter() factory → the Obsidian adapter
  obsidian/
    config.ts         # env config (URL, key, TLS)
    client.ts         # reusable REST fns: getFile/getNote/getFolder/getNotes/
                      #   getNotesByTag/searchByTag/updateFile/createFile/
                      #   deleteFile/ping/checkConnection
    frontmatter.ts    # defensive YAML coercion + status/priority vocab mapping
    markdown.ts       # YAML/frontmatter serialization + filename slugify
    entities.ts       # entity registry: fields, folders, tags, validation
    actions.ts        # server actions: create/update/delete/rename/quickCapture
    mappers.ts        # ObsidianNote -> domain entities (book, subject, …)
    classify.ts       # note → area / href / entity-kind helpers
    search.ts         # cached global search index
    obsidian-adapter.ts  # implements DataAdapter; computes all aggregates
```

### How it reads your vault

Records are **tagged notes** (`tags: [book|subject|university|scholarship|
evidence|ielts-mock|research-project|…]`) with structured frontmatter — exactly
the schema in `90 System/VAULT_ARCHITECTURE.md`. The adapter:

- finds records by tag (`POST /search/`), skips Templates/System/Archive folders
  and any `type: dashboard|system` aggregator note;
- maps frontmatter → the domain types, filling safe defaults for missing fields;
- **computes** GPA, deadlines, area progress, distribution and recent activity
  from the records (nothing is hardcoded);
- reads config from the dashboard notes (IELTS targets, reading goal).

Empty tags/folders simply yield empty arrays, so every page renders graceful
empty states on an unpopulated vault. If Obsidian is closed or the key is
missing, the adapter fails soft (empty data + a console warning) instead of
crashing.

### Configuration

Copy `.env.example` → `.env.local` and set:

| Variable | Default | Purpose |
|---|---|---|
| `OBSIDIAN_API_KEY` | — (required) | Bearer token from the Local REST API plugin |
| `OBSIDIAN_API_URL` | `https://127.0.0.1:27124` | Plugin base URL (HTTPS, self-signed) |
| `OBSIDIAN_INSECURE_TLS` | `1` | Trust the plugin's self-signed localhost cert |
| `OBSIDIAN_VAULT_NAME` | `Obsidian Vault` | Display name (Settings page only) |

## Project structure

```
app/            # routes: dashboard, 8 area pages, calendar, analytics, settings
                #   + layout, loading, error, 404, icon
components/
  layout/       # sidebar, topbar, command menu (⌘K), app shell, live refresh
  entities/     # generic create/edit dialog, new-button, record actions, empty state
  quick-capture/# floating "+" capture
  calendar/     # month calendar view
  ui/           # primitives (button, badge, switch, avatar, field, progress-ring…)
  charts/       # Recharts wrappers (area, bar, line, donut, radar)
  motion/       # Framer Motion primitives (stagger, fade, animated number)
  dashboard/    # dashboard-specific widgets
  shared/       # cross-page building blocks (StatCard, Panel, Timeline…)
  settings/     # settings controls
hooks/          # use-mounted
lib/            # data layer, obsidian client, nav config, fuzzy, utils
types/          # public type barrel (@/types)
styles/         # notes; tokens live in app/globals.css (Tailwind v4)
```

## Design system

Tokens, theming and keyframes live in `app/globals.css` (Tailwind v4 is
CSS-first). Highlights: `.surface-card`, `.card-sheen`, `.bg-grid`,
`.text-gradient`, plus `aurora` / `shimmer` / `pulse-glow` animations. Respects
`prefers-reduced-motion`.

## Keyboard

- `⌘K` / `Ctrl K` (or `/`) — command palette: search every record, jump anywhere,
  or type a type + title (e.g. `exam Criminal Law`) to create on the spot.

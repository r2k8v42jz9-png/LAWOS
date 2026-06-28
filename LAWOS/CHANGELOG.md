# Changelog

All notable changes to LawOS are documented here.

## [2.0.0-phase1] — Tauri desktop (in progress)

Wrapped the existing Next.js app in a **Tauri v2** native desktop shell. No UI,
architecture, CRUD, dashboard, search, calendar, analytics or Obsidian logic was
changed — the desktop app runs the same app.

### Added
- `src-tauri/` Tauri v2 project (Cargo.toml, tauri.conf.json, build.rs,
  src/main.rs, src/lib.rs, capabilities, generated icons).
- Native window: title "LawOS", native title bar/controls, min size 920×640,
  centered, **remembers size + position** (`tauri-plugin-window-state`).
- Scripts: `tauri`, `tauri:dev`, `tauri:build`, `build:desktop` (web scripts kept).
- `next.config.ts` `output: "standalone"` so the desktop build can bundle and run
  the Next server (no effect on `next dev` or web/Vercel).
- `scripts/copy-standalone.mjs` to assemble the standalone server bundle.
- [DESKTOP.md](DESKTOP.md) — prerequisites, dev/build commands, per-OS installers.

### Fixed
- **Bundled app crashed on launch from Finder (`SIGABRT`/`abort()`).** macOS GUI
  apps don't inherit the shell `PATH`, so `Command::new("node")` failed with
  `ENOENT`; the error bubbled through `setup` into `.expect()` and aborted.

### Hardened (release launcher)
- Node is **always resolved with `find_node()`** (known install dirs + every
  `PATH` entry) — never a literal `Command::new("node")`.
- Before spawning, the launcher **logs** the resolved node path, `server.js` path
  and working directory, and **validates** that all three exist.
- Every server-start `unwrap()`/`expect()` is gone — `start_embedded_server`
  returns a descriptive `Result<(), String>`; an early server crash is detected
  via `try_wait()`.
- On any failure it prints the error, shows a **native Tauri dialog**
  (`tauri-plugin-dialog`, Rust-side only) and **exits gracefully** — the app never
  aborts because Node can't start.
- **Dev `ChunkLoadError` / stale chunks / HMR reload loops.** Added
  `scripts/tauri-dev.mjs` (run via `dev:tauri`) which frees port 3000 and starts a
  single `next dev` pinned to `127.0.0.1:3000`, matching `devUrl`/`frontendDist`
  exactly. Eliminates the orphan-server + port-auto-increment mismatch. Verified
  across repeated restarts: always one server on 3000, never 3001, clean shutdown.

### Notes
- Dev: native window over a pinned `next dev`. Release: Tauri launches the bundled
  Next standalone server. Obsidian integration is identical in both.
- Capabilities are minimal (`core:default` only).

## [1.0.0] — Web release

The web version of LawOS is feature-complete and stable. Every page reads and
writes the Obsidian vault live through the Local REST API; nothing is mocked.

### Added
- **Obsidian integration** — a typed data layer (`lib/obsidian`) over the Local
  REST API: reusable client (`getNote`/`getFolder`/`getNotes`/`getNotesByTag`/
  `searchByTag`/`updateFile`/`createFile`/`deleteFile`/`ping`/`checkConnection`),
  defensive frontmatter coercion, and entity mappers. Self-signed localhost TLS
  is trusted via a scoped undici dispatcher; requests have an 8s timeout.
- **CRUD for every entity** — Book, Subject, Course, Assignment, Exam,
  Vocabulary, Research, Case/Source, Evidence, Scholarship, Internship,
  Opportunity, Application. Driven by a single entity registry that defines
  fields, validation, folder placement and YAML frontmatter.
- **Create / Edit / Delete UI** — per-card actions, generic form dialog,
  required-field validation, optimistic delete with confirmation, and elegant
  empty states with "Create first …" actions.
- **Optional safe rename** — editing a title can optionally rename the markdown
  file; backlinks (`[[wiki-links]]`) are rewritten so nothing breaks. Default
  keeps the existing filename.
- **Dashboard intelligence** — today's tasks, overdue, upcoming deadlines &
  exams, current reading, active research, scholarships, internships, vocabulary,
  GPA, IELTS, recent activity and per-area progress — all computed from the vault.
- **Global search (⌘K)** — fuzzy search across every record, grouped by type with
  folder paths and match highlighting; cached index, client-side filtering.
- **Quick Capture** — floating "+" and the topbar "New" button; type
  `book Constitutional Law` to create records without leaving the page.
- **Calendar** — unified month view of assignments, exams, research, scholarships
  and milestones; click an event to open its record.
- **Analytics** — GPA trend, pages read, books finished, vocabulary growth,
  assignments completed, weekly/daily productivity, semester completion, streak.
- **Live sync** — soft refresh on tab focus and interval; writes revalidate every
  route, so the UI stays current without a reload.

### Fixed (v1.0 hardening)
- Real local "today" everywhere (no hardcoded reference date); timezone-safe
  date parsing fixes off-by-one day badges.
- YAML serialization escapes newlines/tabs/quotes — multi-line fields produce
  valid frontmatter and crafted titles can't inject YAML keys.
- Precise connection errors (vault closed · plugin unavailable · invalid API key)
  instead of a generic "couldn't write" message.
- Request timeouts, per-request read memoization, division-by-zero guards, and a
  route-level error boundary.
- Removed dead code, unused imports and orphan files.

### Known limitations
- Editing a title renames the file only when explicitly chosen; otherwise the
  filename is preserved (title is kept consistent via frontmatter).
- Search/calendar open the entity's page (no per-record routes by design).
- Live sync is focus/interval based, not push.

### Next
- Tauri desktop migration.

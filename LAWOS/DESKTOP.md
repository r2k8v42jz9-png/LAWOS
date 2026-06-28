# LawOS Desktop (Tauri v2)

LawOS ships as a native desktop app via **Tauri v2**. It is a thin native shell
around the **existing** Next.js application — no app logic, UI, architecture, or
Obsidian integration was changed. The web version is untouched and still runs
with `npm run dev`.

## Why a server, not a static export

LawOS uses Next.js **server components + server actions**, and the Obsidian
Local REST API is called **server-side** (undici, with the API key read from the
environment). That cannot be a static export. So the desktop app runs the real
Next server:

- **Development** → Tauri opens a native window pointed at the `next dev` server
  (`beforeDevCommand` + `devUrl` in `tauri.conf.json`).
- **Release** → `npm run build:desktop` produces a self-contained Next
  **standalone** server; Tauri bundles it and the Rust shell launches it
  (`src-tauri/src/lib.rs`) on `127.0.0.1:3000`, then the window loads it.

The Obsidian integration is byte-for-byte the same code in both modes.

## Prerequisites (one-time, on your machine)

- **Node.js** (already required for the web app).
- **Rust toolchain** via [rustup](https://rustup.rs/) — Tauri compiles the native
  shell. Not needed for web development.
- Platform build tools:
  - **macOS** — Xcode Command Line Tools (`xcode-select --install`).
  - **Windows** — Microsoft C++ Build Tools + WebView2 (preinstalled on Win 11).
  - **Linux** — `webkit2gtk`, `librsvg`, `libayatana-appindicator` (see Tauri docs).
- **Obsidian** open with the **Local REST API** plugin enabled, and
  `OBSIDIAN_API_KEY` in `.env.local` (same as the web app).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Web development (unchanged). |
| `npm run tauri:dev` | Launch the desktop app in dev (native window over `next dev`). |
| `npm run build:desktop` | Build the Next standalone server + copy static/public/env. |
| `npm run tauri:build` | Build the production desktop app + installers. |

## Run the desktop app (development)

```bash
npm install        # installs @tauri-apps/cli + api (already in devDeps)
npm run tauri:dev  # first run compiles Rust (a few minutes), then opens LawOS
```

> `npm run dev` (plain web, in a browser) is unchanged. Don't run `npm run dev`
> and `npm run tauri:dev` at the same time — `tauri:dev` owns port 3000.

### Dev-server stability (no more ChunkLoadError)

`tauri:dev` does **not** call `next dev` directly. Its `beforeDevCommand` runs
`npm run dev:tauri` → `scripts/tauri-dev.mjs`, a small launcher that:

- **Frees port 3000 first**, killing any orphaned dev server from a previous run.
- Starts exactly **one** `next dev` pinned to **`127.0.0.1:3000`** — the exact
  origin in `devUrl`/`frontendDist`, so the webview, HMR socket and chunks all
  share one origin.
- Forwards termination signals so the dev server dies with Tauri (no orphans).

This removes the classic failure where a leftover server makes the next run
auto-increment to 3001 while the webview still points at 3000 — the mismatch that
produced `ChunkLoadError`, broken HMR and stale chunks. Verified across repeated
start/stop cycles: always one server on 3000, never 3001, clean shutdown, no
chunk errors.

## Build installers (production)

```bash
npm run tauri:build
```

Outputs land in `src-tauri/target/release/bundle/`:

- **macOS** → `bundle/macos/LawOS.app` and `bundle/dmg/LawOS_1.0.0_aarch64.dmg`
- **Windows** → `bundle/msi/LawOS_1.0.0_x64_en-US.msi` and
  `bundle/nsis/LawOS_1.0.0_x64-setup.exe`
- **Linux** → `bundle/deb/…​.deb`, `bundle/appimage/…​.AppImage`, `bundle/rpm/…​.rpm`

> Each installer is produced **on its own OS** — you build the Windows installer
> on Windows, the macOS app on macOS, the Linux packages on Linux (or via CI).
> Tauri does not cross-compile between desktop OSes.

The bundled production app also needs **Node.js available on the machine** (the
Rust shell launches the Next server with `node`). The `OBSIDIAN_API_KEY` is read
from the `.env.local` embedded next to the bundled server (see the security note
in `scripts/copy-standalone.mjs`).

### Finding Node from a Finder-launched app

macOS apps launched from **Finder/Dock do not inherit your shell `PATH`** — they
get the minimal `/usr/bin:/bin:/usr/sbin:/sbin`. A Homebrew (`/opt/homebrew/bin`)
or nodejs.org (`/usr/local/bin`) Node install is therefore invisible, which is
why a naive `node` spawn crashes the bundled app on launch (`SIGABRT`) even though
it works from a terminal. `src-tauri/src/lib.rs` resolves Node's real path
explicitly — Homebrew (Apple Silicon + Intel), the nodejs.org pkg, nvm, fnm and
Volta — before falling back to `PATH`. If you installed Node somewhere exotic,
add its `bin` directory to `find_node()`.

To see exactly what the bundled app is doing, run the binary from a terminal:

```bash
/Applications/LawOS.app/Contents/MacOS/lawos
# logs: which node it found, the server path, and whether the server came up
```

The release launcher is defensive: it validates that Node, `server.js` and the
working directory all exist before spawning, never panics on a startup problem,
and if something is wrong it shows a **native error dialog** explaining what
failed and exits gracefully (no silent `SIGABRT`).

## Window behavior

Configured in `tauri.conf.json` + `src-tauri/src/lib.rs`:

- Title: **LawOS**, native title bar + window controls.
- Default 1280×832, **minimum 920×640**, resizable, centered on first launch.
- **Remembers size & position** across launches (`tauri-plugin-window-state`).
- App icon generated from `src-tauri/app-icon.svg` into `src-tauri/icons/`.

## Files

```
src-tauri/
  Cargo.toml              # Rust crate: tauri v2 + window-state plugin
  tauri.conf.json         # app/window/bundle config; dev + prod URLs
  build.rs                # tauri-build entry
  app-icon.svg            # 1024px source icon
  icons/                  # generated .icns / .ico / pngs
  capabilities/default.json  # minimal permissions (core:default only)
  src/
    main.rs               # desktop entry point
    lib.rs                # window-state plugin + release server launcher
scripts/copy-standalone.mjs  # post-build: copy static/public/env into standalone
```

## Security

- Capabilities are minimal: **`core:default` only** — no shell/fs/http plugins
  enabled. The Obsidian calls happen in the Next server process, exactly as on web.
- CSP is unset (the app loads its own localhost server, same-origin).

## Known limitations (Phase 1)

- The production bundle relies on **system Node** to run the embedded server, and
  embeds `.env.local` next to it for the API key (fine for a personal install;
  swap to `.env.production` to keep keys separate).
- No desktop-only features yet (no tray, notifications, auto-update, deep links,
  or filesystem watchers) — by design for this phase.
- Installers must be built on their target OS (no cross-compilation).

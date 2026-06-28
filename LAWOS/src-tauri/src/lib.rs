//! LawOS desktop shell.
//!
//! A thin native wrapper around the existing Next.js application — it does NOT
//! reimplement any app logic.
//!
//! * In **development** Tauri points the window at the `next dev` server
//!   (`beforeDevCommand` + `devUrl` in tauri.conf.json). Nothing to spawn here.
//! * In **release** we launch the bundled Next *standalone* server as a child
//!   process and wait for it to accept connections before the window loads.
//!
//! The release launcher is fully defensive: it resolves Node explicitly (Finder
//! does not pass the shell `PATH`), validates every input before spawning, and
//! never `unwrap()`/`expect()`/aborts on a startup problem. On failure it logs a
//! readable error, shows a native dialog, and exits gracefully.

/// Port the embedded Next server listens on (matches `devUrl`/`frontendDist`).
#[cfg(not(debug_assertions))]
const SERVER_PORT: u16 = 3000;

/// Resolve a real `node` executable.
///
/// macOS apps launched from Finder/Dock do not inherit the shell `PATH` (they
/// get the minimal `/usr/bin:/bin:/usr/sbin:/sbin`), so Homebrew/nvm installs are
/// invisible and `Command::new("node")` fails with `ENOENT`. We check the known
/// install locations and then every directory on `PATH`, returning the first
/// existing executable — or `None` if Node truly isn't installed.
#[cfg(not(debug_assertions))]
fn find_node() -> Option<std::path::PathBuf> {
    use std::path::PathBuf;

    let mut candidates: Vec<PathBuf> = vec![
        PathBuf::from("/opt/homebrew/bin/node"), // Apple Silicon Homebrew
        PathBuf::from("/usr/local/bin/node"),    // Intel Homebrew / nodejs.org pkg
        PathBuf::from("/usr/bin/node"),
    ];

    if let Some(home) = std::env::var_os("HOME") {
        let home = PathBuf::from(home);
        // nvm: ~/.nvm/versions/node/<version>/bin/node — newest version.
        if let Ok(entries) = std::fs::read_dir(home.join(".nvm/versions/node")) {
            let mut versions: Vec<PathBuf> = entries.filter_map(|e| e.ok().map(|e| e.path())).collect();
            versions.sort();
            if let Some(latest) = versions.pop() {
                candidates.push(latest.join("bin/node"));
            }
        }
        candidates.push(home.join(".fnm/aliases/default/bin/node")); // fnm
        candidates.push(home.join(".volta/bin/node")); // Volta
    }

    // Whatever PATH we do have (full when run from a terminal).
    if let Some(path_var) = std::env::var_os("PATH") {
        for dir in std::env::split_paths(&path_var) {
            candidates.push(dir.join("node"));
        }
    }

    candidates.into_iter().find(|p| p.is_file())
}

/// Resolve the bundled Next standalone `server.js`, tolerant of how the resource
/// directory nests the copied tree.
#[cfg(not(debug_assertions))]
fn find_server_js(resource_dir: &std::path::Path) -> Option<std::path::PathBuf> {
    for rel in ["server/server.js", "server/standalone/server.js"] {
        let p = resource_dir.join(rel);
        if p.is_file() {
            return Some(p);
        }
    }
    None
}

/// Validate everything, then launch the embedded server and wait for it to be
/// reachable. Returns a human-readable error string on any failure — it never
/// panics — so the caller can show a dialog and exit gracefully.
#[cfg(not(debug_assertions))]
fn start_embedded_server(app: &tauri::App) -> Result<(), String> {
    use std::net::TcpStream;
    use std::process::Command;
    use std::time::{Duration, Instant};
    use tauri::Manager;

    // --- resolve inputs -------------------------------------------------------
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Could not resolve the app resource directory: {e}"))?;

    let server_js = find_server_js(&resource_dir).ok_or_else(|| {
        format!(
            "Bundled Next server (server.js) was not found under:\n  {}\n\nThe desktop build may be incomplete — run `npm run build:desktop` before bundling.",
            resource_dir.display()
        )
    })?;

    let work_dir = server_js
        .parent()
        .ok_or_else(|| format!("Server file has no parent directory: {}", server_js.display()))?
        .to_path_buf();

    let node = find_node().ok_or_else(|| {
        "Node.js could not be found.\n\nLawOS runs a small local server with Node.js. Looked in Homebrew (/opt/homebrew/bin, /usr/local/bin), /usr/bin, nvm, fnm, Volta and your PATH.\n\nInstall Node.js from https://nodejs.org and relaunch.".to_string()
    })?;

    // --- validate (Requirement 4) --------------------------------------------
    if !node.is_file() {
        return Err(format!("Resolved Node.js path does not exist:\n  {}", node.display()));
    }
    if !server_js.is_file() {
        return Err(format!("Server file does not exist:\n  {}", server_js.display()));
    }
    if !work_dir.is_dir() {
        return Err(format!("Server working directory does not exist:\n  {}", work_dir.display()));
    }

    // --- log (Requirement 2) --------------------------------------------------
    eprintln!("[lawos] node executable : {}", node.display());
    eprintln!("[lawos] server.js       : {}", server_js.display());
    eprintln!("[lawos] working dir     : {}", work_dir.display());

    // --- spawn (Requirement 1: always the resolved executable) ----------------
    // Give the child a PATH that includes the usual Node locations too.
    let path_env = std::env::var("PATH").unwrap_or_default();
    let augmented_path = format!("/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:{path_env}");

    let mut child = Command::new(&node)
        .arg(&server_js)
        .current_dir(&work_dir)
        .env("PORT", SERVER_PORT.to_string())
        .env("HOSTNAME", "127.0.0.1")
        .env("NODE_ENV", "production")
        .env("PATH", augmented_path)
        .spawn()
        .map_err(|e| {
            format!(
                "Failed to launch Node.js:\n  {} {}\n\n{e}",
                node.display(),
                server_js.display()
            )
        })?;

    // --- wait for readiness, detecting an early crash -------------------------
    let addr = format!("127.0.0.1:{SERVER_PORT}");
    let deadline = Instant::now() + Duration::from_secs(20);
    while Instant::now() < deadline {
        match child.try_wait() {
            Ok(Some(status)) => {
                return Err(format!(
                    "The local server exited unexpectedly ({status}).\n\nCheck that OBSIDIAN_API_KEY is set (in the bundled .env.local) and that port {SERVER_PORT} is free."
                ));
            }
            Ok(None) => {}
            Err(e) => eprintln!("[lawos] could not poll server process: {e}"),
        }
        if TcpStream::connect(&addr).is_ok() {
            eprintln!("[lawos] server is up on {addr}");
            return Ok(());
        }
        std::thread::sleep(Duration::from_millis(200));
    }

    // Still running but slow — don't fail the launch; the webview will load once
    // it responds. (Node started fine, which was the requirement's concern.)
    eprintln!("[lawos] warning: server not reachable on {addr} within 20s; continuing");
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Restore + persist the window's size and position across launches.
        .plugin(tauri_plugin_window_state::Builder::default().build())
        // Native dialogs (used only from Rust, for the startup-error message).
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            #[cfg(not(debug_assertions))]
            {
                if let Err(message) = start_embedded_server(app) {
                    use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
                    eprintln!("[lawos] startup error: {message}");
                    app.dialog()
                        .message(format!(
                            "LawOS could not start its local server, so it can't open.\n\n{message}"
                        ))
                        .title("LawOS — startup error")
                        .kind(MessageDialogKind::Error)
                        .blocking_show();
                    // Graceful exit — no panic, no abort.
                    std::process::exit(1);
                }
            }
            #[cfg(debug_assertions)]
            let _ = app;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the LawOS desktop app");
}

// Deterministic dev-server launcher for `tauri dev`.
//
// Why this exists: Tauri's `beforeDevCommand` starts the Next dev server, but on
// exit the npm→next child can orphan. A leftover server on the port causes the
// next run's `next dev` to auto-increment (3000 → 3001) while Tauri's webview
// still points at the old port — the mismatch produces ChunkLoadError, broken
// HMR and stale chunks.
//
// This launcher guarantees a single, fresh Next dev server on a FIXED host:port
// that exactly matches Tauri's `devUrl` (http://127.0.0.1:3000), so the webview,
// HMR socket and chunks all share one origin. It frees the port first (killing
// any orphan), then runs `next dev` and forwards signals so it dies with Tauri.
import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import net from "node:net";

const require = createRequire(import.meta.url);
const HOST = "127.0.0.1";
const PORT = 3000;

/** Kill whatever is listening on the port (a previous orphaned dev server). */
function freePort(port) {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr LISTENING | findstr :${port}`, { stdio: ["ignore", "pipe", "ignore"] }).toString();
      const pids = new Set();
      for (const line of out.split("\n")) {
        const pid = line.trim().split(/\s+/).pop();
        if (/^\d+$/.test(pid)) pids.add(pid);
      }
      for (const pid of pids) {
        try { execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" }); } catch {}
      }
    } else {
      const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN || true`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
      for (const pid of out.split("\n").filter(Boolean)) {
        try { process.kill(Number(pid), "SIGKILL"); } catch {}
      }
    }
  } catch {
    /* lsof/netstat unavailable — best effort */
  }
}

/** Resolve when the port is free to bind, or after a short timeout. */
function waitForFreePort(port, host, timeoutMs = 4000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const tryBind = () => {
      const tester = net.createServer();
      tester.once("error", () => {
        if (Date.now() - start > timeoutMs) return resolve();
        setTimeout(tryBind, 150);
      });
      tester.once("listening", () => tester.close(() => resolve()));
      tester.listen(port, host);
    };
    tryBind();
  });
}

console.log(`[tauri-dev] ensuring a single Next dev server on http://${HOST}:${PORT}`);
freePort(PORT);
await waitForFreePort(PORT, HOST);

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "dev", "-H", HOST, "-p", String(PORT)], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(PORT), HOSTNAME: HOST },
});

// Die with the child; clean up the child when Tauri stops us.
const stop = (signal) => {
  if (!child.killed) child.kill(signal ?? "SIGTERM");
};
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => { stop(sig); });
process.on("exit", () => stop());
child.on("exit", (code) => process.exit(code ?? 0));

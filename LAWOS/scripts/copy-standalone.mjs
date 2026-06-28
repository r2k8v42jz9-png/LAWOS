// After `next build` with `output: "standalone"`, Next emits a self-contained
// server at .next/standalone but leaves static assets out. The desktop bundle
// runs that server, so copy `public/` and `.next/static/` into place. This runs
// only for the desktop build (`npm run build:desktop`); the web build is
// untouched.
import { existsSync, cpSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const standalone = resolve(root, ".next/standalone");

if (!existsSync(standalone)) {
  console.error(
    "[copy-standalone] .next/standalone not found. Ensure next.config has output: 'standalone' and `next build` ran."
  );
  process.exit(1);
}

const jobs = [
  { from: resolve(root, "public"), to: resolve(standalone, "public") },
  { from: resolve(root, ".next/static"), to: resolve(standalone, ".next/static") },
];

for (const { from, to } of jobs) {
  if (!existsSync(from)) continue;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`[copy-standalone] copied ${from.replace(root + "/", "")} → ${to.replace(root + "/", "")}`);
}

// The standalone Next server loads `.env*` from its own directory at runtime, so
// place the local env beside server.js. This makes the desktop bundle a single,
// self-contained app that talks to Obsidian out of the box.
//
// SECURITY NOTE: this embeds your OBSIDIAN_API_KEY in the *local* build output
// (.next is gitignored and never committed). It is intended for a personal,
// single-user desktop install. Prefer a dedicated `.env.production` to keep the
// dev key separate. Skip this entirely (delete the copy) to provide env another way.
const envFile = [".env.production", ".env.local"].find((f) => existsSync(resolve(root, f)));
if (envFile) {
  copyFileSync(resolve(root, envFile), resolve(standalone, ".env.local"));
  console.log(`[copy-standalone] embedded ${envFile} → .next/standalone/.env.local (local build only)`);
} else {
  console.warn(
    "[copy-standalone] no .env.production/.env.local found — the bundled app will need OBSIDIAN_API_KEY provided at runtime."
  );
}

console.log("[copy-standalone] standalone server is ready to bundle.");

/**
 * Obsidian Local REST API configuration — read entirely from the environment.
 *
 * Required:
 *   OBSIDIAN_API_KEY   — the Bearer token from the "Local REST API" plugin.
 *
 * Optional (sensible defaults for a standard local install):
 *   OBSIDIAN_API_URL   — default "https://127.0.0.1:27124" (the plugin's HTTPS
 *                        port; it uses a self-signed certificate).
 *   OBSIDIAN_INSECURE_TLS — "1" (default) accepts the plugin's self-signed cert
 *                        on localhost. Set "0" if you front it with a real cert.
 *   OBSIDIAN_VAULT_NAME — display name only, shown in Settings.
 */

export const obsidianConfig = {
  apiUrl: (process.env.OBSIDIAN_API_URL ?? "https://127.0.0.1:27124").replace(/\/$/, ""),
  apiKey: process.env.OBSIDIAN_API_KEY ?? "",
  vaultName: process.env.OBSIDIAN_VAULT_NAME ?? "Obsidian Vault",
  /** Accept the plugin's self-signed cert on localhost unless explicitly disabled. */
  insecureTls: process.env.OBSIDIAN_INSECURE_TLS !== "0",
};

export function isObsidianConfigured(): boolean {
  return obsidianConfig.apiKey.length > 0;
}

/**
 * Folders that hold templates / system / archive notes. Records living here are
 * never treated as real data (the vault's own rule: "aggregate queries exclude
 * templates"). Matching is by path prefix.
 */
export const EXCLUDED_PREFIXES = ["11 Templates/", "90 System/", "99 Archive/"];

export function isExcludedPath(path: string): boolean {
  return EXCLUDED_PREFIXES.some((p) => path.startsWith(p));
}

/** Canonical area → primary folder, per the vault architecture note. */
export const AREA_FOLDERS = {
  dashboard: "00 Dashboard",
  foundation: "01 Foundation",
  llb: "02 LLB",
  legalEnglish: "03 Legal English",
  legalStudies: "04 Legal Studies",
  library: "05 Library",
  research: "06 Research",
  portfolio: "07 Portfolio",
  scholarships: "08 Scholarships",
  career: "09 Career",
  daily: "10 Daily Notes",
} as const;

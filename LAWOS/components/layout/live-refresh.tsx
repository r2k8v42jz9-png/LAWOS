"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps the UI in sync with the vault without a reload. Server components are
 * force-dynamic, so a soft `router.refresh()` re-reads the vault and updates the
 * dashboard, analytics, calendar, etc. in place.
 *
 * Triggers: when the tab regains focus/visibility (you switched back from
 * Obsidian) and on a gentle interval. Refreshes are skipped while hidden to
 * avoid needless REST calls.
 */
export function LiveRefresh({ intervalMs = 45_000 }: { intervalMs?: number }) {
  const router = useRouter();

  React.useEffect(() => {
    let last = Date.now();
    const refresh = () => {
      last = Date.now();
      router.refresh();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);

    const id = window.setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - last >= intervalMs) refresh();
    }, intervalMs);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(id);
    };
  }, [router, intervalMs]);

  return null;
}

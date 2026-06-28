"use client";

import * as React from "react";
import { TriangleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Catches render/runtime errors in any page and
 * shows a calm recovery screen instead of a blank crash. Most failures here are
 * a transient vault/REST hiccup, so "Try again" re-runs the server render.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("[lawos] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-amber-500/12 text-amber-400 ring-1 ring-amber-500/20">
        <TriangleAlert className="size-7" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        This is usually a momentary hiccup talking to your Obsidian vault. Make sure Obsidian is
        running with the Local REST API plugin enabled, then try again.
      </p>
      <Button onClick={reset} className="mt-6">
        <RotateCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}

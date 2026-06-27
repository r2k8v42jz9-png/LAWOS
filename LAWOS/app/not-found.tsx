import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
        <Compass className="size-7" />
      </span>
      <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-primary/80">404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        This corner of the operating system doesn't exist yet. Let's get you back on track.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}

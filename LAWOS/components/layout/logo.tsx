import { cn } from "@/lib/utils";

/** LawOS mark — a stylised scales-of-justice glyph in a gradient tile. */
export function Logo({ className, size = 34 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-[10px] bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-[0_8px_24px_-10px_var(--glow)] card-sheen",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.6}
        height={size * 0.6}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v18" />
        <path d="M7 21h10" />
        <path d="M5 7h14" />
        <path d="M8 4.5 5 7l-2.5 5a3.2 3.2 0 0 0 5 0L5 7" />
        <path d="M16 4.5 19 7l2.5 5a3.2 3.2 0 0 1-5 0L19 7" />
      </svg>
    </div>
  );
}

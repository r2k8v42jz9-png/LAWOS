# styles/

LawOS uses **Tailwind CSS v4**, where the design system lives in CSS, not a JS
config. The single source of truth for tokens, theming and keyframes is:

    app/globals.css

That file defines:

- **Design tokens** (`:root` light, `.dark` dark) — backgrounds, surfaces,
  hairlines, primary/accent, the brand glow.
- **`@theme inline`** — maps tokens onto Tailwind utilities (`bg-card`,
  `text-muted-foreground`, `border-hairline`, radii, fonts, animations).
- **Reusable primitives** — `.surface-card`, `.card-sheen`, `.bg-grid`,
  `.text-gradient`, `glass`.
- **Keyframes** — `shimmer`, `aurora`, `pulse-glow`, `marquee`.

This folder is reserved for any future standalone stylesheets (e.g. print
styles, vendor overrides). Keep component styling in Tailwind utilities.

# Product logo ⚑

**If the project already has a logo, use it**, do not redraw or modify it (the logo is brand identity, `V1` in `review.md`). This file applies only when a new project lacks a logo and the screen includes a slot for one: sidebar header, authentication screens (`layouts/form.md`), standalone error pages (`layouts/app.md`). Tasks smaller than a full screen that lack a logo slot do not draw one (`S3`).

Search before drawing:

```bash
find . -path ./node_modules -prune -o \( -iname "*logo*" -o -iname "*brand*" -o -iname "icon.svg" -o -iname "favicon.svg" \) -print 2>/dev/null | head
```

**Do not count as an existing logo**: initial-letter boxes (an old skill pattern, file names like `brand-mark`), framework default favicons (Vite's purple bolt, Next logo, create-react-app's `favicon.ico`). Replace these following this file, preserving the imported component name.

The logo described here is a **simple logo for new projects**: a geometric mark and the product name. This is not an agency branding package; when users have a real logo, swap it in a single place.

---

## Visual: mark inside an accent box, name to the right

```
  ╭────╮
  │ ◐  │  Product name        size-8 box with 8px radius, accent background, white mark size-5
  ╰────╯
```

- **The mark is a hand-drawn SVG, not a letter inside a box.** An initial letter in a box is the pattern for user avatars and placeholder company logos in mock data (`S16`); using it for the product logo makes the sidebar header look like a list row, leaving the product faceless.
- **Do not use Lucide icons as the logo mark.** Sharing the exact icon set with sidebar navigation items below makes the logo read as just another nav item.
- **viewBox `0 0 24 24`, drawn within the 4–20 coordinate area**, using one to three primitive shapes (circle, rounded rectangle, arc, bar). Solid shapes, or stroke outlines with `strokeWidth` at least 2.5; no detail thinner than 2 units, as they vanish at 16px (favicon).
- **Single color, `currentColor`**: no gradients, no shadows, no secondary colors. Color is supplied by the container (`bg-primary text-primary-foreground`), so changing `--primary` updates the logo automatically, working correctly in wireframe grayscale and dark mode.
- **Product name**: `text-sm font-semibold text-foreground truncate`, spaced from the box with `gap-2.5`, using the app's standard font. Do not draw the name as an SVG path or use a custom font.
- **Avoid cliche shapes**: lightning bolts, sparkling stars, hexagons, cubes, letters in circles. Six out of ten new apps use these shapes, and users immediately recognize them as placeholder logos. Also avoid shapes immediately recognizable as existing major brand logos.

## Three directions, derived from the brief

Take the product name and primary purpose from `U1`, `U2`. One mark per direction:

| Direction | Formulation | Example |
| --- | --- | --- |
| **1. Geometric initial letter** (recommended for short, memorable names) | Initial letter constructed from primitive geometry, not typed font: includes a cut or offset angle to become a brand mark rather than a typographic letter | "Lumen": letter L formed from two bars with an inner circular dot |
| **2. Metaphor of core action** | A shape evoking what the user does, abstracted enough to avoid resembling a stock icon | Scheduling: two offset rounded squares; Finance: three ascending bars, the final one semicircular |
| **3. Intersecting shapes** | Two primitive shapes overlapping or intersecting, with the intersection subtracted | Circle with a corner notched out by a square |

Write one sentence of rationale for each direction, anchored to the product name or primary purpose; avoid vague buzzwords like "modern, minimal".

## Verification before presenting

Render the mark at **16px, 32px, 64px**, on accent background and on white background (mark in `text-foreground`), inspecting visual output:

- Recognizable at 16px, without collapsing into an indistinct blob.
- The three directions are distinctly different when viewed small, not a single shape rotated three ways.
- Placed alongside sidebar navigation icons, it does not blend in with them.

If any direction fails any criterion, redraw it before presenting in wireframes.

## Code

```tsx
// src/components/product-brand/product-mark.tsx
import type { ComponentProps } from "react";

// Product brand mark. Replace path when real logo is provided.
export function ProductMark(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6 4h3.5v12.5H18V20H6z" />
      <circle cx="15.5" cy="8.5" r="2.5" />
    </svg>
  );
}
```

```tsx
// src/components/product-brand/product-brand.tsx
import { cn } from "@/lib/utils";
import { ProductMark } from "./product-mark";

interface ProductBrandProps {
  name: string;
  className?: string;
}

export default function ProductBrand({ name, className }: ProductBrandProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ProductMark className="size-5" />
      </span>
      <span className="truncate text-sm font-semibold text-foreground">{name}</span>
    </span>
  );
}
```

- Collapsed sidebar: container stays fixed, name clips and fades like nav item labels (`layouts/app.md`, collapsed sidebar). Auth screens and standalone error pages share this exact component, without drawing a duplicate.
- **Favicon from the same mark**: an SVG file consisting of the rounded accent square and white mark (visible across both light and dark browser tabs). Next.js App Router places it at `app/icon.svg`; other projects use `public/favicon.svg` with `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`. Remove framework default favicons to avoid duplicates.

## Within the design workflow

- **When user requests a logo** ("make a logo", "build a logo", "change the logo", "design a logo"; logo trigger in item 1 of `SKILL.md`): render the **logo selection page** (below), pausing for user choice. This is the sole gate for this flow. If prompt says "directly" or specifies a direction, skip the page and build directly.
- **Wireframes (`U3`)**: when project lacks a logo, toolbar includes **Logo: 1 · 2 · 3** (`?logo=`), switching the mark across all logo instances on page. Users choose a logo alongside design options without adding gates. Unparameterized URLs show recommended direction.
- **Build directly without wireframes**: build recommended direction without asking.

### Logo selection page ⚑

A file `$TMPDIR/forge-design/logo.html`, container and toolbar matching `U3` wireframe (`design-process.md`: browser Tailwind, project tokens, single-line light bar, segmented control, rationale card). Do not modify project files before selection.

- **Toolbar**: **Logo: 1 · 2 · 3** (`?logo=`, recommended direction has accent dot) · **Color** (switch: off is Grayscale, on is project accent) · Accent (when project lacks brand color, per `U3`).
- **Rationale card**: direction name, "Recommended" badge, one sentence linking to name or core action.
- **Show each direction in its real context**, not an isolated large symbol on a blank page:
  1. Real sidebar header (box, name, nav items with icons below), both expanded and collapsed.
  2. Logo block on sign-in screen.
  3. Browser tab strip in light and dark, with 16px favicon beside page title.
  4. Size scale at 16, 32, 64px on accent and white backgrounds.
- Screenshot the page across all three directions, verify per "Verification before presenting" before sending.
- Send clickable link with: *"Choose `1`, `2`, or `3`; reply `ok` to build recommended direction. To adjust a direction, specify changes (e.g. '2 but more rounded')."* If user requests tweaks, redraw on same page and resubmit.
- **At delivery**, note a line in defaults section of `S15`: *"Logo: direction [n], [one-sentence rationale]. Mark defined in `product-mark.tsx`; replace SVG path when official logo is available; request if you prefer another direction."*

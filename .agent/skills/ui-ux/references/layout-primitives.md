# Intrinsic Layout Primitives (`LP-01`..`LP-19`)

Unified from *Every Layout* (3rd ed., Heydon Pickering & Andy Bell) `[EL]`,
Spatial & Responsive Craft `[IMP]`, and *Refactoring UI*
`[RUI]`. The executable CSS implementation lives in `references/primitives.css`.

---

## 1. Foundational Axioms (`LP-01`..`LP-05`)

- **`LP-01` Axiom of Measure (`CSS` / `Visual`)** `[EL:Axioms]`
  Human reading comfort peaks between `45ch` and `75ch` (`--measure: 65ch` default).
  Treat `--measure` as the primary unit of layout geometry: columns wrap when they can no
  longer hold a comfortable fraction of `--measure`, not at arbitrary device pixel widths.
- **`LP-02` Algorithmic layout without viewport `@media` queries (`CSS`)** `[EL:Boxes]`
  `references/primitives.css` contains zero `@media (min-width: ...)` or
  `@media (max-width: ...)` rules. Components adapt automatically to their parent
  container's available inline size using `flex-wrap`, `flex-basis` math, and CSS Grid
  `repeat(auto-fit, minmax(min(100%, var(--min)), 1fr))`.
- **`LP-03` Content-outward sizing (`CSS`)** `[EL:Boxes]`
  Never assign fixed `height` to elements containing text. Let inline size be governed by
  parent constraints (`min(100%, var(--measure))`) and block size emerge from content
  plus padding.
- **`LP-04` Parent-owned flow spacing (`CSS`)** `[EL:Stack]`
  Components must not declare external `margin-top` or `margin-bottom`. All spacing
  between siblings is owned by the parent layout primitive (`.l-stack`, `.l-cluster`,
  `.l-grid`, `.l-sidebar`, `.l-switcher`).
- **`LP-05` Logical properties for internationalization (`CSS`)** `[EL, WIG, ADMJ]`
  Use CSS logical properties (`inline-size`, `block-size`, `margin-inline`,
  `margin-block-start`, `padding-inline`, `border-inline-start`) so layouts adapt cleanly
  across LTR, RTL, and vertical writing modes.

---

## 2. The 12 Every Layout Primitives + Outer Container (`LP-06`..`LP-18`)

| ID | Primitive | Class | When to Use | Custom Properties & Data Attributes |
|---|---|---|---|---|
| `LP-06` | **The Stack** `[EL]` | `.l-stack` | Any vertical sequence: page sections, form fields, card body elements, article flow | `--space` (default `--space-4`), `[data-recursive]`, child `[data-split-after]` (pushes subsequent items to bottom) |
| `LP-07` | **The Box** `[EL]` | `.l-box` | Any padded surface with border or background fill: cards, callout banners, wells, table wrappers | `--padding` (`--space-4`), `--border-width` (`1px`), `--border-color`, `--radius`, `--bg`, `--fg`, `[data-invert]` |
| `LP-08` | **The Center** `[EL]` | `.l-center` | Horizontally centered prose column, narrow form container, or hero header block | `--measure` (`65ch`), `--gutters` (`--space-4`), `[data-intrinsic]` (centers narrower children), `[data-text]` |
| `LP-09` | **The Cluster** `[EL]` | `.l-cluster` | Wrapping inline rows of variable-width items: navigation links, filter pills, tag clouds, button toolbars | `--space` (`--space-2`), `--justify` (`flex-start` / `space-between`), `--align` (`center` / `baseline`) |
| `LP-10` | **The Sidebar** `[EL]` | `.l-sidebar` | Asymmetric two-pane split: app nav + workspace, filter rail + results, form + sticky summary, media + description | `--side-width` (`16rem`), `--content-min` (`55%`), `--space` (`--space-6`), `[data-side="right"]` |
| `LP-11` | **The Switcher** `[EL]` | `.l-switcher` | `2–4` equal-priority peers that sit side-by-side when wide enough and stack into a single column all at once when below `--threshold` | `--threshold` (`30rem`), `--space` (`--space-4`); automatically stacks vertically when `>= 5` children exist |
| `LP-12` | **The Cover** `[EL]` | `.l-cover` | Full-viewport hero, login screen, or empty state with optional top bar, vertically centered `[data-principal]`, and bottom footer | `--min-height` (`100dvh`), `--padding` (`--space-6`), `--space` (`--space-4`), child `[data-principal]` |
| `LP-13` | **The Grid** `[EL]` | `.l-grid` | Multi-row card grids, KPI tiles, gallery items, or product catalogs that reflow from `N` columns down to `1` column automatically | `--min` (`16rem` minimum card width), `--space` (`--space-4`) |
| `LP-14` | **The Frame** `[EL]` | `.l-frame` | Cropping images, video previews, or map embeds to a fixed aspect ratio without CLS | `--n` (`16`), `--d` (`9`) — e.g. `--n: 4; --d: 3` or `--n: 1; --d: 1` |
| `LP-15` | **The Reel** `[EL]` | `.l-reel` | Horizontal scrolling strip for wide data tables on mobile, kanban columns, timeline tracks, or media strips | `--item-width` (`auto` or `18rem`), `--reel-height` (`auto`), `--space` (`--space-4`) |
| `LP-16` | **The Imposter** `[EL]` | `.l-imposter` | Centered modal dialogs, loading overlays, or empty-state watermarks positioned over a container or viewport | `--positioning` (`absolute` or `fixed`), `[data-contain]` (prevents overflowing parent bounds) |
| `LP-17` | **The Icon** `[EL]` | `.l-icon` | Inline SVG icon paired with a text label inside buttons, nav links, badges, or metadata rows | `--space` (`0.5ch`), `--icon-size` (`0.85em`) |
| `LP-18` | **The Container** `[IMP]` | `.l-container` | Outer page shell bounding maximum workspace width while preserving mobile inline gutters | `--container-max` (`75rem` / `1200px`), `--gutter` (`--space-6`) |

---

## 3. Nesting & Composition Rules (`LP-19`)

- **`LP-19` Valid Primitive Composition Patterns (`DOM` / `CSS`)** `[EL, IMP:spatial]`
  - **Card**: `<article class="l-box l-stack">` containing a header `.l-cluster`, body copy, and a footer `.l-cluster` pushed down via `data-split-after` on the body. Never nest a bordered `.l-box` card inside another bordered `.l-box` card (`AP-32`).
  - **App Shell (Sidebar + Workspace)**: `<div class="l-sidebar" style="--side-width: 15rem; --content-min: 65%; --space: 0;">` wrapping `<nav class="l-box l-stack">` and `<main id="main" class="l-box l-stack">`.
  - **Dashboard View**: `.l-container > .l-stack` (`--space: var(--space-8)`) containing:
    1. Page header: `.l-cluster` (`--justify: space-between`) with title stack on the left and action `.l-cluster` on the right.
    2. KPI summary row: `.l-switcher` (`--threshold: 40rem`, max 4 cards) or `.l-grid` (`--min: 14rem`).
    3. Main workspace split: `.l-sidebar` (`data-side="right"`, `--side-width: 22rem`, `--content-min: 60%`) pairing the primary chart/table with an activity or detail rail.
  - **Marketing / Landing Page**:
    1. Hero: `.l-cover` (`--min-height: 85dvh`) with top `<header class="l-cluster">` and `[data-principal]` holding a `.l-sidebar` (copy stack on left, product preview `.l-frame` on right).
    2. Feature Comparison: `.l-container > .l-stack` alternating asymmetric `.l-sidebar` spotlights and a 3-card `.l-switcher`.
  - **Settings / Checkout Form**:
    - `.l-container > .l-sidebar` (`data-side="right"`, `--side-width: 22rem`) with `<form class="l-stack" style="--measure: 38rem">` on the left and a sticky order/status summary `.l-box.l-stack` on the right.

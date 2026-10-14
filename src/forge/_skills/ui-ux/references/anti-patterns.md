# Deterministic UI/UX Anti-Patterns & Craft-Floor Gate (`AP-01`..`AP-105`)

Every anti-pattern below defines a concrete DOM, CSS, or visual signature and its
deterministic remediation, distilled from `[IMP]`, `[FD]`, `[UIS]`, `[WIG]`, `[RUI]`,
`[EL]`, `[LUX]`, `[UPM]`, and `[ADMJ]`.

---

## 0. The 12-Rule Pre-Write Craft Floor

Before writing or modifying any UI markup or stylesheet, enforce these 12 non-negotiable
baselines:

1. **Semantic landmarks (`ST-01`..`ST-04`)**: Include `<header>`, `<main id="main">`, and
   a skip link (`<a href="#main">`), with a single `<h1>` and non-skipping heading levels.
2. **Every Layout primitives first (`LP-01`..`LP-17`)**: Compose structure with
   `.l-stack`, `.l-cluster`, `.l-sidebar`, `.l-switcher`, `.l-grid`, `.l-box`, `.l-center`,
   `.l-cover`, `.l-frame`, `.l-reel`, `.l-imposter`, and `.l-icon`.
3. **Tokenized OKLCH colors (`P-39`..`P-45`)**: Reference `--color-*` custom properties;
   no raw `#000000` or untinted grays.
4. **60-30-10 surface budget (`P-40`)**: `>= 60%` neutral surface, `~30%` secondary
   structure, `<= 10%` accent fill; at most 1 solid primary CTA per view (`P-07`).
5. **Measure `45ch–75ch` (`P-23`)**: Constrain every prose paragraph and form column to
   `max-inline-size: var(--measure, 65ch)`.
6. **Fluid typography + `tabular-nums` (`P-22`, `P-28`)**: Use `clamp()` type tokens and
   apply `font-variant-numeric: tabular-nums` to all numeric columns, KPIs, and timers.
7. **Concentric radii (`P-66`)**: Outer radius equals inner radius plus padding
   ($r_{\text{outer}} = r_{\text{inner}} + p$); never nest bordered card inside bordered card (`P-60`).
8. **Touch targets `>= 44x44px` (`P-19`)**: Interactive elements meet `44x44px` on touch
   viewports with `>= 8px` gap.
9. **Visible labels & accessible forms (`P-99`..`P-103`)**: Every input has a bound
   `<label>`, semantic `type`/`autocomplete`, and `aria-describedby` error binding.
10. **Compositor-only motion + reduced-motion (`P-95`..`P-98`)**: Animate only `transform`
    and `opacity` (`<= 320ms`, `--ease-out-quart`) and include `@media (prefers-reduced-motion: reduce)`.
11. **8 interactive states (`P-90`)**: Account for `default`, `hover`, `focus-visible`,
    `active`, `disabled`, `loading`, `empty`, and `error`.
12. **Zero horizontal overflow (`P-114`)**: `scrollWidth <= clientWidth` across `320px`,
    `375px`, `768px`, and `1440px`.

---

## 1. Typography Anti-Patterns (`AP-01`..`AP-15`)

- **`AP-01` Unbounded line length (`> 75ch`)** `[EL, IMP:typography]`
  - *Detector*: `<p>` or `<li>` with `clientWidth` exceeding `75ch` (`~680px` at `16px`).
  - *Fix*: Apply `max-inline-size: var(--measure, 65ch)` or wrap in `.l-center`.
- **`AP-02` Cramped narrow column (`< 35ch` on main prose)** `[IMP:typography]`
  - *Detector*: Main article paragraph narrower than `35ch` at desktop viewport.
  - *Fix*: Increase `.l-sidebar` `--content-min` to `>= 55%`.
- **`AP-03` Tight body line-height (`< 1.4`)** `[RUI, IMP:typography]`
  - *Detector*: Body `<p>` with computed `line-height / font-size < 1.4` (`< 1.7` for `:lang(ja)`).
  - *Fix*: Set `line-height: var(--leading-normal, 1.55)` (`1.8` for Japanese).
- **`AP-04` Loose display heading line-height (`> 1.3`)** `[RUI, IMP:typography]`
  - *Detector*: `<h1>`/`<h2>` (`>= 28px`) with `line-height / font-size > 1.3`.
  - *Fix*: Set `line-height: var(--leading-tight, 1.15)`.
- **`AP-05` Justified web text (`text-align: justify`)** `[IMP:typography, WIG, ADMJ]`
  - *Detector*: Computed `text-align === "justify"` on any element.
  - *Fix*: Use `text-align: start` (`left`) with `text-wrap: pretty`.
- **`AP-06` Unexamined default AI font stack (`Inter`/`Roboto`/`Arial` on bespoke briefs)** `[FD, IMP:typography]`
  - *Detector*: Brand-new marketing or product mockup defaulting to `Arial`, `Helvetica`, or unrequested `Inter` without an existing `DESIGN.md` mandate.
  - *Fix*: Select a purposeful pairing from `references/design-system.md`.
- **`AP-07` Font soup (`> 2` font families or `> 4` weights)** `[IMP:typography, UIS]`
  - *Detector*: More than 2 distinct `font-family` stacks (or 3 when `--font-mono` is used for code) across computed styles.
  - *Fix*: Consolidate to `--font-sans`, `--font-display`, and optional `--font-mono`.
- **`AP-08` Sub-16px form inputs triggering iOS zoom (`font-size < 16px`)** `[WIG, IMP:responsive]`
  - *Detector*: `<input>`, `<select>`, or `<textarea>` with computed `font-size < 16px`.
  - *Fix*: Set `font-size: var(--text-base, 1rem)`.
- **`AP-09` Micro-copy below `12px` (`< 0.75rem`)** `[IMP:typography, WCAG]`
  - *Detector*: Any visible text node with computed `font-size < 12px` (`13px` for Japanese kanji).
  - *Fix*: Floor small labels and badges at `--text-xs` (`0.75rem` / `12px`).
- **`AP-10` All-caps text without positive tracking** `[RUI, IMP:typography]`
  - *Detector*: `text-transform: uppercase` with `letter-spacing <= 0px` or length `> 25` characters.
  - *Fix*: Add `letter-spacing: 0.06em; font-weight: 600` and keep uppercase labels `<= 3` words.
- **`AP-11` Negative tracking on body copy** `[IMP:typography, ADMJ]`
  - *Detector*: `<p>` or `<li>` (`<= 18px`) with `letter-spacing < 0px`.
  - *Fix*: Keep body `letter-spacing: 0` (`>= 0.02em` for Japanese body).
- **`AP-12` Centered multi-line prose (`> 3` lines)** `[RUI, IMP:typography, UIS]`
  - *Detector*: `text-align: center` on an element whose height exceeds `3 * lineHeight`.
  - *Fix*: Left-align (`text-align: start`) any paragraph longer than 3 lines.
- **`AP-13` Missing `tabular-nums` on numbers, prices, and tables** `[WIG, RUI, IMP:typography]`
  - *Detector*: `<td>`, KPI metric, price tag, or timer without `tabular-nums` in `font-variant-numeric`.
  - *Fix*: Apply `font-variant-numeric: tabular-nums`.
- **`AP-14` Pure `vw` font-size breaking browser zoom** `[EL, WCAG 1.4.4]`
  - *Detector*: `font-size` using `vw` without `rem` inside `clamp()`.
  - *Fix*: Always include a `rem` component: `clamp(1rem, 0.9rem + 0.5vw, 1.25rem)`.
- **`AP-15` Straight typewriter quotes and raw `--` in UI prose** `[WIG, IMP:ux-writing]`
  - *Detector*: Visible prose containing `"..."` or ` -- ` outside `<code>`/`<pre>`.
  - *Fix*: Replace with `“…”`, `’`, and `—` or `–`.

---

## 2. Color & Contrast Anti-Patterns (`AP-16`..`AP-31`)

- **`AP-16` Pure `#000000` background or text in standard themes** `[IMP:color, RUI]`
  - *Detector*: `rgb(0, 0, 0)` on surfaces, text, or borders (unless `DESIGN.md` declares an explicit monochrome/OLED theme).
  - *Fix*: Use `var(--neutral-950)` (`oklch(0.145 0.009 H)`).
- **`AP-17` Untinted dead grays (`C == 0`) alongside brand hues** `[IMP:color, RUI]`
  - *Detector*: Neutral steps with `R == G == B` (`#808080`, `#cccccc`, `#f5f5f5`).
  - *Fix*: Tint neutrals with `C = 0.004..0.018` at the brand hue.
- **`AP-18` Gray text on colored backgrounds** `[RUI, IMP:color]`
  - *Detector*: Achromatic gray text placed over a non-neutral background (`C > 0.04`).
  - *Fix*: Use a lighter/darker step of the background's own hue.
- **`AP-19` Low-contrast muted/placeholder text (`< 4.5:1`)** `[WCAG 1.4.3, WIG]`
  - *Detector*: Body or secondary text with WCAG contrast ratio `< 4.5:1` against its effective surface.
  - *Fix*: Darken `--color-fg-muted` (`<= oklch(0.45 ...)` in light mode; `>= oklch(0.68 ...)` in dark mode).
- **`AP-20` White text on mid-tone amber, lime, or cyan buttons (`< 4.5:1`)** `[RUI, IMP:color, WCAG]`
  - *Detector*: `#ffffff` foreground over yellow/amber/green/cyan fills with `L > 0.62`.
  - *Fix*: Use dark foreground text (`oklch(0.20 0.04 H)`) on bright warm/cyan fills, or darken the button fill to `L <= 0.52`.
- **`AP-21` Accent overload (`> 10%` viewport area)** `[IMP:color, RUI, UPM]`
  - *Detector*: High-chroma accent fill covering large panels, sidebars, and multiple buttons simultaneously.
  - *Fix*: Restrict `--color-primary` fill to the single primary CTA and active indicators.
- **`AP-22` Saturated neon accents vibrating in dark mode** `[IMP:color, RUI]`
  - *Detector*: `[data-theme="dark"]` using light-mode `500/600` full-chroma tokens directly on dark surfaces.
  - *Fix*: Shift dark-mode accents to `L = 0.68..0.74` and reduce chroma by `15%`.
- **`AP-23` Color-only status indicator** `[WCAG 1.4.1, WIG, UPM]`
  - *Detector*: Status dot, chart line, or invalid input border that changes only color with no icon, text label, or `aria-invalid`.
  - *Fix*: Pair every status color with an explicit icon and text label.
- **`AP-24` Red/green simultaneous chart series without lightness delta** `[UPM, IMP:color]`
  - *Detector*: Chart pairing pure red and green at equal lightness (`Delta L < 0.10`).
  - *Fix*: Use blue + orange/amber or separate lightness by `Delta L >= 0.15` plus dashed/solid stroke patterns.
- **`AP-25` Hardcoded hex/rgb literals in component rules (`ST-06`)** `[UIS, IMP:color]`
  - *Detector*: Raw `#hex` or `rgb()` outside `:root` / `[data-theme="dark"]` token declarations.
  - *Fix*: Replace with semantic `var(--color-*)` tokens.
- **`AP-26` Using `opacity` on containers to dim text** `[RUI, WIG]`
  - *Detector*: `opacity < 1` applied to a non-disabled parent card or text block, causing background bleed-through and contrast failure.
  - *Fix*: Use `--color-fg-secondary` or `--color-fg-muted` tokens.
- **`AP-27` Missing `color-scheme` declaration** `[WIG]`
  - *Detector*: `:root` or `<html>` lacking `color-scheme: light` / `dark`.
  - *Fix*: Declare `color-scheme` on `:root` and `[data-theme="dark"]`.
- **`AP-28` Unscrimmed text over background images** `[RUI, WIG, WCAG]`
  - *Detector*: Text node overlapping an `<img>` or `background-image` without an intermediate scrim or solid badge.
  - *Fix*: Add a gradient scrim (`oklch(0.12 0.01 H / 0.80)`) behind the text region.
- **`AP-29` Heavy black drop shadows (`rgba(0,0,0, > 0.20)`)** `[RUI, UIS]`
  - *Detector*: `box-shadow` with alpha `> 0.20` in light mode or visible black shadow in dark mode.
  - *Fix*: Use `--shadow-sm` / `--shadow-md` (alpha `0.05–0.10`) in light mode and surface lightness + `1px` border in dark mode.
- **`AP-30` Muddy RGB gradient through dead gray** `[RUI, IMP:color]`
  - *Detector*: `linear-gradient` between complementary colors in sRGB without `in oklch`.
  - *Fix*: Interpolate gradients `in oklch` across adjacent hues (`Delta H <= 25°`).
- **`AP-31` Rainbow badge soup (`> 4` distinct badge hues in one table/list)** `[RUI, UIS]`
  - *Detector*: Every category tag assigned a different loud hue in the same view.
  - *Fix*: Style category tags in neutral tint (`--neutral-100`) and reserve semantic color badges for actionable statuses (`Warning`, `Failed`, `Active`).

---

## 3. Spatial & Layout Anti-Patterns (`AP-32`..`AP-52`)

- **`AP-32` Card-in-card nesting** `[IMP:spatial, UIS]`
  - *Detector*: An element with border/shadow and `border-radius > 0` containing an ancestor/descendant card with its own border/shadow and radius.
  - *Fix*: Flatten inner cards into `.l-stack` sections separated by whitespace or a `1px` horizontal rule.
- **`AP-33` Mismatched non-concentric border radii** `[RUI, UIS, IMP:spatial]`
  - *Detector*: Outer card (`border-radius: 8px; padding: 16px`) containing an inner media frame with `border-radius: 8px` or `12px`.
  - *Fix*: Enforce $r_{\text{outer}} = r_{\text{inner}} + p$ (or set inner radius smaller than outer radius).
- **`AP-34` Equal internal and external spacing (`Proximity failure`)** `[LUX-04, IMP:spatial]`
  - *Detector*: Card padding equals or falls below the internal stack gap, or heading `margin-top == margin-bottom`.
  - *Fix*: Make outer group gap `>= 1.5x` inner item gap, and heading top margin `>= 1.5x` bottom margin.
- **`AP-35` Off-scale arbitrary pixel spacing (`13px`, `17px`, `23px`)** `[RUI, IMP:spatial]`
  - *Detector*: `margin`, `padding`, or `gap` values not on the `--space-*` scale.
  - *Fix*: Snap to `--space-1`..`--space-24`.
- **`AP-36` Viewport `@media` queries where intrinsic primitives work** `[EL]`
  - *Detector*: `@media (min-width: 768px)` used merely to switch a 3-card row from column to row or to wrap a grid.
  - *Fix*: Use `.l-grid` (`repeat(auto-fit, minmax(min(100%, var(--min)), 1fr))`) or `.l-switcher`.
- **`AP-37` Fixed-column grid overflowing mobile (`grid-template-columns: repeat(3, 1fr)`)** `[EL, WIG]`
  - *Detector*: Multi-column grid that does not wrap at `375px`, crushing columns below `120px` or overflowing horizontally.
  - *Fix*: Replace with `.l-grid` using `minmax(min(100%, var(--min, 16rem)), 1fr)`.
- **`AP-38` Horizontal page scrollbar at any viewport (`320px–1920px`)** `[WCAG 1.4.10, WIG]`
  - *Detector*: `document.documentElement.scrollWidth > document.documentElement.clientWidth`.
  - *Fix*: Remove fixed pixel widths (`width: 900px`), add `min-inline-size: 0` on flex/grid children, and wrap wide tables in `.l-reel`.
- **`AP-39` Margin ownership on child components** `[EL]`
  - *Detector*: Reusable card/button/input classes declaring outer `margin-bottom: 16px`.
  - *Fix*: Zero child margins and let parent `.l-stack` or `.l-cluster` own the gap.
- **`AP-40` Full-bleed stretched forms or prose on desktop** `[RUI, EL]`
  - *Detector*: `<form>` or `<p>` wider than `800px` on a `1440px` screen.
  - *Fix*: Constrain to `.l-center` (`--measure: 40rem` for forms, `65ch` for prose) or pair with `.l-sidebar`.
- **`AP-41` Over-stuffed cards (`> 4` data points or `> 2` actions)** `[LUX-09, RUI, UIS]`
  - *Detector*: Card containing 5+ distinct fields, multiple badges, and 3 buttons.
  - *Fix*: Keep cards to title, 1–2 primary metrics/lines, 1 status indicator, and 1 primary action; move details to a drawer or detail page.
- **`AP-42` `100vh` layout clipping on mobile browsers** `[WIG, UIS, IMP:responsive]`
  - *Detector*: Stylesheet containing `height: 100vh` or `min-height: 100vh` (`h-screen`).
  - *Fix*: Replace with `min-block-size: 100dvh` (`min-h-dvh`).
- **`AP-43` Fixed height on text containers** `[EL, WCAG 1.4.4]`
  - *Detector*: `height: <px>` paired with `overflow: hidden` on cards, banners, or multi-line buttons.
  - *Fix*: Use `min-block-size` and padding so content expands safely.
- **`AP-44` Border clutter (borders on every row, column, and card)** `[RUI, IMP:spatial]`
  - *Detector*: Adjacent elements separated by both `border`, `box-shadow`, and background fill simultaneously.
  - *Fix*: Remove at least half of explicit borders; use spacing and surface contrast instead.
- **`AP-45` Arbitrary `z-index` wars (`z-index: 9999`)** `[UIS, RUI]`
  - *Detector*: `z-index > 50` outside token definitions.
  - *Fix*: Use `--z-sticky`..`--z-toast` (`10`..`50`).
- **`AP-46` Unaligned sibling card footers in a grid row** `[RUI, UIS]`
  - *Detector*: Cards in the same row whose bottom CTA buttons sit at different vertical Y coordinates.
  - *Fix*: Make each card a flex column (`.l-stack`) with `margin-block-start: auto` on the footer.
- **`AP-47` Cramped viewport with `< 20%` whitespace** `[IMP:spatial, RUI]`
  - *Detector*: Bounding boxes of bordered/filled widgets occupying `> 85%` of viewport area with `< 16px` section gaps.
  - *Fix*: Increase section spacing to `--space-8`..`--space-12` and outer gutters to `--space-6`.
- **`AP-48` Orphan single card on final grid row without flex/grid balance** `[IMP:spatial]`
  - *Detector*: A 4-item feature highlight forced into a 3-column grid leaving 1 isolated card on row 2.
  - *Fix*: Use a 2x2 grid, a 4-column `.l-switcher`, or an asymmetric 1+3 `.l-sidebar` layout.
- **`AP-49` Missing `min-inline-size: 0` causing flex child overflow** `[WIG, UIS]`
  - *Detector*: Long email, URL, or title inside a flex row pushing sibling buttons off-screen.
  - *Fix*: Set `min-inline-size: 0` on the text wrapper and apply `overflow: hidden; text-overflow: ellipsis`.
- **`AP-50` Missing `aspect-ratio` / dimensions on media causing CLS** `[WIG, EL:Frame]`
  - *Detector*: `<img>` without `width`+`height` attributes or parent `.l-frame`.
  - *Fix*: Provide explicit dimensions or wrap in `.l-frame`.
- **`AP-51` Stacked glassmorphism (`> 1` `backdrop-filter: blur()` layer)** `[UIS:motion, WIG]`
  - *Detector*: Multiple visible elements applying `backdrop-filter: blur(...)`.
  - *Fix*: Restrict `backdrop-filter` to a single sticky header or modal backdrop.
- **`AP-52` Center-aligned form labels and inputs** `[LUX, IMP:interaction]`
  - *Detector*: `<form>` with `align-items: center` or `text-align: center` on labels.
  - *Fix*: Left-align all form labels and inputs along a single vertical axis.

---

## 4. Motion & Performance Anti-Patterns (`AP-53`..`AP-64`)

- **`AP-53` `transition: all`** `[WIG, UIS:motion, IMP:motion]`
  - *Detector*: Any CSS rule containing `transition: all` or `transition-property: all`.
  - *Fix*: Name exact properties (`transition: background-color 150ms var(--ease-out-quart), transform 150ms var(--ease-out-quart)`).
- **`AP-54` Animating layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`)** `[UIS:motion, WIG]`
  - *Detector*: `transition` or `@keyframes` targeting geometry properties that trigger layout/paint.
  - *Fix*: Animate `transform` (`translate`, `scale`) and `opacity`, or `grid-template-rows: 0fr -> 1fr` for accordions.
- **`AP-55` Missing `@media (prefers-reduced-motion: reduce)`** `[WCAG 2.3.3, WIG, IMP:motion]`
  - *Detector*: Stylesheet with `animation` or `transition` rules and zero `prefers-reduced-motion` media query.
  - *Fix*: Include the global reduced-motion reset from `references/tokens.css`.
- **`AP-56` Sluggish UI transition (`> 500ms`)** `[IMP:motion, UIS, LUX-03]`
  - *Detector*: UI control or modal transition with `transition-duration > 500ms`.
  - *Fix*: Cap micro-interactions at `150ms` and modal/drawer transitions at `320ms`.
- **`AP-57` Bounce or elastic easing on productivity UI (`y2 > 1.05`)** `[IMP:motion, UIS]`
  - *Detector*: `cubic-bezier(x1, y1, x2, y2)` where `y1 < 0` or `y2 > 1.05`.
  - *Fix*: Use `--ease-out-quart` (`cubic-bezier(0.25, 1, 0.5, 1)`).
- **`AP-58` Linear easing on spatial movement** `[IMP:motion]`
  - *Detector*: `transition-timing-function: linear` on `transform` translations.
  - *Fix*: Reserve `linear` for continuous spinners or progress bars; use `--ease-out-quart` for movement.
- **`AP-59` Continuous decorative background animations** `[WCAG 2.2.2, UIS:motion]`
  - *Detector*: Infinite `@keyframes` (`animation-iteration-count: infinite`) on non-loading decorative blobs or marquees without a pause control.
  - *Fix*: Remove infinite decorative motion or run once on entrance.
- **`AP-60` Hover `scale()` shifting surrounding layout or clipping text** `[IMP:motion, UIS]`
  - *Detector*: Card hover scaling `> 1.03` or causing scrollbar flicker.
  - *Fix*: Use border/surface contrast shift on card hover instead of scaling whole cards.
- **`AP-61` Chained blocking animations delaying interaction** `[LUX-03, UIS:motion]`
  - *Detector*: Staggered entrance delays (`animation-delay > 200ms`) on interactive dashboard controls.
  - *Fix*: Render application controls immediately (`0ms` entrance delay); keep total stagger `< 150ms` on marketing reveals.
- **`AP-62` Permanent `will-change` on dozens of elements** `[WIG, UIS:motion]`
  - *Detector*: `will-change: transform, opacity` applied statically to `.card` or `*`.
  - *Fix*: Remove static `will-change`; apply only during active gesture if profiling proves a need.
- **`AP-63` Scrolljacking or overriding native scroll momentum** `[WIG, IMP:interaction]`
  - *Detector*: JS `wheel` / `touchmove` listeners calling `preventDefault()` on page scroll.
  - *Fix*: Use native browser scrolling and CSS `scroll-snap-type: x proximity`.
- **`AP-64` Slow exit animations** `[IMP:motion]`
  - *Detector*: Dropdown or modal close duration longer than its open duration.
  - *Fix*: Set exit duration `~25%` shorter than entrance (`150ms` close vs `200ms` open).

---

## 5. Interaction, Accessibility & Form Anti-Patterns (`AP-65`..`AP-84`)

- **`AP-65` `outline: none` without `:focus-visible` replacement** `[WCAG 2.4.7, WIG, UIS]`
  - *Detector*: `:focus { outline: none }` or `outline: 0` with no visible `:focus-visible` ring or box-shadow.
  - *Fix*: Apply `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` on `:focus-visible`.
- **`AP-66` Div/span with click handler instead of `<button>` or `<a>`** `[WCAG 4.1.2, WIG, UIS]`
  - *Detector*: `<div onclick>` or `<span role="button">` lacking `tabindex="0"` and `Enter`/`Space` keydown handlers.
  - *Fix*: Use native `<button type="button">` for actions and `<a href="...">` for navigation.
- **`AP-67` Icon-only button without accessible name** `[WCAG 4.1.2, WIG, UIS]`
  - *Detector*: `<button>` containing only an `<svg>` with no `aria-label`, `aria-labelledby`, or `.u-visually-hidden` text.
  - *Fix*: Add a concise, specific `aria-label` (e.g., `aria-label="Close dialog"`).
- **`AP-68` Placeholder used as the only field label** `[WCAG 3.3.2, WIG, UPM]`
  - *Detector*: `<input placeholder="...">` with no associated `<label>` or `aria-label`.
  - *Fix*: Add a visible `<label for="...">` above the input.
- **`AP-69` Touch target smaller than `44x44px` on mobile** `[WCAG 2.5.8, LUX-02, IMP:responsive]`
  - *Detector*: Interactive element with `getBoundingClientRect().width < 44` or `height < 44` at `375px` viewport.
  - *Fix*: Set `min-block-size: 2.75rem; min-inline-size: 2.75rem` or expand hit area via padding.
- **`AP-70` Premature inline error while user is still typing initial value** `[IMP:interaction, WIG]`
  - *Detector*: `input` event listener marking field invalid before first `blur` or `submit`.
  - *Fix*: Validate on `blur` or `submit`; clear errors live on `input`.
- **`AP-71` Blocking paste on password, email, or OTP fields** `[WIG, WCAG 3.3.8]`
  - *Detector*: `onpaste="return false"` or `addEventListener('paste', e => e.preventDefault())`.
  - *Fix*: Never block paste; support pasting full OTP codes across split inputs.
- **`AP-72` Hover-only actions invisible on touch and keyboard** `[WIG, IMP:responsive]`
  - *Detector*: Action buttons (`Edit`, `Delete`, `Copy`) with `opacity: 0` or `display: none` that only appear on `:hover`.
  - *Fix*: Keep actions visible on touch viewports (`@media (hover: none)`), and reveal on `:focus-within` as well as `:hover`.
- **`AP-73` Missing `Escape` key and focus trap on modals/drawers** `[WCAG 2.1.2, WIG, UIS]`
  - *Detector*: Custom modal `<div>` instead of `<dialog>`, or modal that does not close on `Escape` and restore focus to its trigger.
  - *Fix*: Use native `<dialog>` or trap focus inside `[role="dialog"][aria-modal="true"]`.
- **`AP-74` Generic `Submit` / `OK` / `Yes` / `Click here` labels** `[IMP:ux-writing, WIG]`
  - *Detector*: Button or link text matching `/^(submit|ok|yes|no|click here|learn more)$/i`.
  - *Fix*: Use verb + object labels (`Save billing address`, `Delete workspace`, `Read security whitepaper`).
- **`AP-75` Unconfirmed destructive action or missing Undo** `[LUX-05, IMP:interaction]`
  - *Detector*: Delete/revoke button that immediately destroys data with no confirmation dialog or undo toast.
  - *Fix*: Provide a confirmation `<dialog>` or an immediate `Undo` action.
- **`AP-76` Layout shift when button enters loading state** `[WIG, IMP:interaction]`
  - *Detector*: Button width shrinking or jumping when text changes to a spinner.
  - *Fix*: Preserve button `min-inline-size` or overlay the spinner while keeping label text wrapped in an `opacity: 0` span.
- **`AP-77` Missing `empty`, `loading`, or `error` state in data views** `[IMP:interaction, UIS]`
  - *Detector*: Table, list, or chart rendering only the happy-path populated state.
  - *Fix*: Provide explicit empty-state CTA, skeleton loader, and retryable error banner.
- **`AP-78` Multi-column zigzag form layout** `[LUX, IMP:interaction]`
  - *Detector*: Form placing unrelated fields in a 2- or 3-column grid requiring Z-pattern eye jumps.
  - *Fix*: Stack form controls in a single vertical `.l-stack` column.
- **`AP-79` Dropdown `<select>` for `<= 4` choices** `[RUI, LUX-02]`
  - *Detector*: `<select>` containing only 2–4 `<option>` elements.
  - *Fix*: Render visible radio buttons or segmented radio cards.
- **`AP-80` Positive `tabindex` (`tabindex="1"`, `"2"`) breaking focus order** `[WCAG 2.4.3, WIG]`
  - *Detector*: Any element with `tabindex` attribute `> 0`.
  - *Fix*: Use DOM source order (`tabindex="0"` or `-1` only).
- **`AP-81` Missing skip-to-content link on application/page shells** `[WCAG 2.4.1, WIG]`
  - *Detector*: Page shell without `<a href="#main">` as first focusable element.
  - *Fix*: Add a skip link styled with `.u-visually-hidden` that becomes visible on `:focus-visible`.
- **`AP-82` Autoplaying media with sound or unpaused carousels** `[WCAG 1.4.2, WIG, UPM]`
  - *Detector*: `<video autoplay>` without `muted`, or auto-advancing carousel without pause button.
  - *Fix*: Never auto-advance carousels; require explicit user interaction.
- **`AP-83` Dead-end `404` or error screen with no recovery path** `[IMP:ux-writing, LUX-05]`
  - *Detector*: Error state lacking a primary recovery button or link back to safety.
  - *Fix*: Always include a primary recovery action (`Retry request`, `Return to dashboard`).
- **`AP-84` Disabling browser zoom (`user-scalable=no` / `maximum-scale=1`)** `[WCAG 1.4.4, WIG]`
  - *Detector*: `<meta name="viewport">` containing `user-scalable=no` or `maximum-scale=1`.
  - *Fix*: Use `<meta name="viewport" content="width=device-width, initial-scale=1">`.

---

## 6. AI Slop Signatures (`AP-85`..`AP-97`)

- **`AP-85` Purple-to-blue gradient SaaS cliche** `[FD, IMP:color]`
  - *Detector*: Default `#6366f1` / `#8b5cf6` / `#ec4899` linear gradients on hero text, buttons, and glowing orbs when not requested by brand tokens.
  - *Fix*: Ground the palette in the domain's real-world material or industry palette from `references/design-system.md`.
- **`AP-86` Gradient text (`background-clip: text`) on headings** `[IMP:color, UIS]`
  - *Detector*: `h1`/`h2` using `-webkit-background-clip: text; color: transparent`.
  - *Fix*: Use solid high-contrast `--color-fg` and create emphasis through typography pairing (`--font-display`) or weight contrast.
- **`AP-87` Three identical icon-in-circle centered cards in a row** `[IMP:spatial, FD]`
  - *Detector*: Three equal columns each containing a centered circular icon badge, centered `h3`, and centered 2-line blurb.
  - *Fix*: Use an asymmetric `.l-sidebar` feature spotlight, a numbered editorial list, or left-aligned cards with varied visual evidence.
- **`AP-88` Pill badge above every single section heading** `[IMP:spatial, FD]`
  - *Detector*: Every `<section>` starting with a rounded pill (`✨ Features`, `🚀 How it works`, `💎 Pricing`) above an `<h2>`.
  - *Fix*: Use a pill kicker at most once on the page; vary section introductions with simple left-aligned headings or numbered indices (`01 / Architecture`).
- **`AP-89` Emoji icons in professional UI chrome** `[UPM, IMP, UIS]`
  - *Detector*: Unicode emojis used as navigation icons, feature bullets, or button prefixes.
  - *Fix*: Replace with inline SVG icons from a single stroke family.
- **`AP-90` Fake social proof and placeholder names (`John Doe`, `Acme Corp`, `Lorem ipsum`)** `[IMP:ux-writing, UIS]`
  - *Detector*: Text matching `/lorem ipsum|john doe|jane doe|foo|bar|asdf|123456/i` or fabricated `"Trusted by 10,000+ teams"` without real context.
  - *Fix*: Write realistic, domain-accurate copy and metrics matching the user's brief.
- **`AP-91` Glowing neon borders and blurred background blobs** `[FD, IMP:color, UIS]`
  - *Detector*: Decorative `filter: blur(80px)` colorful circles behind cards or multi-color glowing borders.
  - *Fix*: Remove decorative blur blobs; rely on typographic hierarchy, crisp `1px` borders, and intentional surface contrast.
- **`AP-92` Bento grid with no reading hierarchy** `[IMP:spatial, LUX]`
  - *Detector*: 6–8 rounded bento boxes packed together with competing animations, charts, and headlines of equal visual weight.
  - *Fix*: Establish a single dominant primary cell and give secondary cells quieter typography and generous padding.
- **`AP-93` Arbitrary metric cards with fake sparklines and meaningless percentages (`+24.5% ↑`)** `[RUI, IMP:ux-writing]`
  - *Detector*: KPI row where every card shows a random green percentage badge with no comparison baseline (`vs. last 30 days`).
  - *Fix*: State the comparison window explicitly (`+14.2% vs. prior 30d`) and only show deltas when actionable.
- **`AP-94` Left accent stripe on every card in a grid** `[IMP:spatial]`
  - *Detector*: `border-left: 4px solid var(--color-primary)` applied to every card in a dashboard.
  - *Fix*: Reserve inline-start accent borders (`P-51`) for callout alerts or a single selected item.
- **`AP-95` Monotonous symmetrical section stacking** `[FD, IMP:spatial]`
  - *Detector*: 4+ consecutive sections each using centered heading + centered subhead + 3-column grid.
  - *Fix*: Alternate spatial rhythm (e.g., full-width split `.l-sidebar` $\rightarrow$ dense data table $\rightarrow$ editorial `.l-switcher`).
- **`AP-96` AI buzzword copy (`Supercharge`, `Unleash`, `Next-Gen`, `Seamless`, `Revolutionize`)** `[IMP:ux-writing]`
  - *Detector*: Headlines containing generic hype verbs instead of concrete product outcomes.
  - *Fix*: State the concrete capability and measurable benefit in plain language.
- **`AP-97` Chat widget / floating action button obscuring bottom-right content** `[IMP:spatial, WIG]`
  - *Detector*: Unrequested floating chat bubble covering table pagination or form actions.
  - *Fix*: Omit unrequested floating widgets; place help actions in the shell header or sidebar.

---

## 7. Japanese & Mixed-Script Anti-Patterns (`AP-98`..`AP-105`)

- **`AP-98` Italicizing Japanese glyphs (`font-style: italic` on `:lang(ja)`)** `[ADMJ:JA-29]`
  - *Detector*: `<em>` or `italic` applied to hiragana, katakana, or kanji, causing synthetic oblique distortion.
  - *Fix*: Set `:lang(ja) em { font-style: normal; font-weight: 700; }` or use Kenten (`text-emphasis: filled sesame`).
- **`AP-99` Missing kinsoku line-breaking (`line-break: strict`)** `[ADMJ:JA-35]`
  - *Detector*: Japanese prose without `line-break: strict` and `overflow-wrap: anywhere`.
  - *Fix*: Apply `line-break: strict; overflow-wrap: anywhere; word-break: auto-phrase`.
- **`AP-100` Cramped Japanese body line-height (`< 1.70`)** `[ADMJ:JA-15]`
  - *Detector*: `:lang(ja)` body copy with `line-height < 1.70`.
  - *Fix*: Use `line-height: 1.75–1.90` for Japanese body copy.
- **`AP-101` Negative letter-spacing on Japanese body text** `[ADMJ:JA-20]`
  - *Detector*: `:lang(ja)` body paragraphs with `letter-spacing < 0`.
  - *Fix*: Use `letter-spacing: 0.02em..0.05em` on Japanese body text and `font-feature-settings: "palt" 1` on headings.
- **`AP-102` Full-width ASCII numerals/letters (`１２３`, `ＡＢＣ`) in Japanese UI** `[ADMJ:JA-45]`
  - *Detector*: Full-width Latin characters (`\uFF01-\uFF5E`) used for numbers, prices, or acronyms.
  - *Fix*: Always use half-width ASCII (`123`, `ABC`) with `tabular-nums`.
- **`AP-103` Ultra-bold (`>= 800`) small kanji (`< 18px`) turning into black blobs** `[ADMJ:JA-12]`
  - *Detector*: `:lang(ja)` text `< 18px` with `font-weight >= 800`.
  - *Fix*: Cap Japanese UI weight at `600` or `700` for small sizes.
- **`AP-104` Centering multi-line Japanese body paragraphs** `[ADMJ:JA-25]`
  - *Detector*: `text-align: center` on `:lang(ja)` `<p>` with `> 2` lines.
  - *Fix*: Left-align (`text-align: start`) multi-line Japanese copy.
- **`AP-105` Unadjusted Yu Gothic on Windows rendering overly thin `400` weight** `[ADMJ:JA-05]`
  - *Detector*: `font-family: "Yu Gothic"` without `@font-face` weight remapping (`AdjustedYuGothic`) or `"Yu Gothic Medium"`.
  - *Fix*: Use the `AdjustedYuGothic` `@font-face` mapping in `references/typography-ja.md`.

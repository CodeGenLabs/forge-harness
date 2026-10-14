# Visual & Interaction Craft Principles (`P-01`..`P-114` & `C-01`..`C-25`)

Every rule in this reference states a concrete, testable condition (`DOM`, `CSS`,
`Visual`, or `Artifact`) and cites its upstream source (`[RUI]`, `[EL]`, `[LUX]`,
`[IMP]`, `[UPM]`, `[WIG]`, `[UIS]`, `[FD]`, `[ADM]`, `[ADMJ]`, `[WCAG]`).

---

## 1. Visual Hierarchy (`P-01`..`P-10`)

- **`P-01` Weight and contrast before font size (`CSS` / `Visual`)** `[RUI, IMP:typography]`
  Establish hierarchy between sibling text elements by varying `font-weight` (`400` vs
  `600`) and foreground lightness (`--color-fg` vs `--color-fg-secondary`) before adding
  a new `font-size` step. A card or panel must not contain more than 3 distinct
  `font-size` values.
- **`P-02` Three-tier foreground contrast (`CSS`)** `[RUI, IMP:color]`
  Every surface defines three text tiers: primary (`--color-fg`, `>= 7:1` contrast),
  secondary (`--color-fg-secondary`, `>= 4.5:1`), and muted (`--color-fg-muted`,
  `>= 4.5:1` for `<= 18px` text or `>= 3:1` for `>= 24px` text). Never use CSS
  `opacity` to create secondary text over textured or colored surfaces.
- **`P-03` De-emphasize competing elements instead of enlarging primary (`Visual`)** `[RUI, IMP:spatial]`
  When a primary heading or action fails to stand out, reduce the contrast, weight, or
  border prominence of surrounding chrome and navigation rather than increasing the
  primary element's size or saturation.
- **`P-04` Combine labels with values (`DOM` / `Visual`)** `[RUI, IMP:ux-writing]`
  Omit redundant field labels when the value format is self-evident (e.g., display
  `inStock: 14 units` or `$49 / month` with the unit styled in `--color-fg-muted`
  instead of a separate `Price:` label).
- **`P-05` Decouple semantic heading rank from visual size (`DOM` / `CSS`)** `[RUI, WIG, WCAG]`
  Heading elements (`<h1>`–`<h6>`) reflect document outline (`ST-04`), while visual size
  is bound via classes or tokens (`--text-lg`, `--text-2xl`). Section titles in dense
  dashboards may use `<h2>` with `--text-sm` uppercase tracking while remaining
  semantically `h2`.
- **`P-06` Weight compensation for low-contrast text (`CSS`)** `[RUI, IMP:typography]`
  Small text (`<= 0.8125rem`) in muted color must use `font-weight: 500` or `600` so thin
  strokes remain legible on standard-DPI displays.
- **`P-07` Single primary action per view (`DOM` / `Visual`)** `[RUI, UIS, LUX-02]`
  Each screen or modal dialog has at most one high-fill primary button (`--color-primary`).
  Secondary actions use subtle outline or ghost treatments; tertiary actions use text
  links.
- **`P-08` Destructive actions do not default to solid red unless primary (`Visual`)** `[RUI, IMP:interaction]`
  In a list or settings view where deletion is not the primary intent, style the delete
  trigger as a neutral or subtle danger ghost button, reserving the high-saturation
  solid `--color-danger` fill for the confirmation dialog's final action.
- **`P-09` Squint test focal point (`Visual`)** `[IMP:spatial, FD]`
  Under a `4px` Gaussian blur, the primary focal element and primary CTA must remain the
  two highest-contrast regions in the viewport.
- **`P-10` Commit to an explicit aesthetic direction before writing markup (`Artifact`)** `[FD, IMP]`
  Every screen declares its domain persona, color temperature, typography pairing, and
  density target before implementation begins.

---

## 2. Spacing & Spatial Rhythm (`P-11`..`P-20`)

- **`P-11` Non-linear spacing scale (`CSS`)** `[RUI, IMP:spatial]`
  All `margin`, `padding`, and `gap` declarations must resolve to the non-linear token
  scale (`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px` / `--space-1`..`--space-24`).
  Adjacent steps must grow by `>= 25%` above `16px` so the eye perceives distinct steps.
- **`P-12` Internal padding strictly less than external group gap (`CSS` / `Visual`)** `[LUX-04, RUI, IMP:spatial]`
  By the Law of Proximity, spacing inside a grouped component (`--space-3` or
  `--space-4`) must be strictly smaller than the gap separating sibling components
  (`--space-6` or `--space-8`). For headings, `margin-block-start >= 1.5 * margin-block-end`.
- **`P-13` Start with generous whitespace and subtract only when needed (`Visual`)** `[RUI, IMP:spatial]`
  Default section vertical padding to `--space-12`..`--space-20` on marketing/editorial
  views and `--space-6`..`--space-8` on application shells; maintain `>= 25%` open
  background/surface area across the viewport.
- **`P-14` Avoid stretch-to-fill syndromes on wide viewports (`CSS` / `Visual`)** `[RUI, EL]`
  Never stretch a single form or narrow widget across `100%` of a `1440px` viewport.
  Constrain forms to `32rem–42rem` (`--measure`) or pair them with a contextual
  `.l-sidebar` pane.
- **`P-15` Flow spacing owned by parent primitives (`CSS`)** `[EL, IMP:spatial]`
  Child components must not declare outer `margin-top` or `margin-bottom`; vertical and
  horizontal gaps are owned by `.l-stack`, `.l-cluster`, `.l-grid`, or `.l-sidebar`.
- **`P-16` Consistent rhythm across columns and cards (`Visual`)** `[RUI, UIS]`
  Cards in the same `.l-grid` row share identical padding tokens (`--space-5` or
  `--space-6`) and align their footer actions to the bottom edge via `.l-stack` split
  margins (`margin-block-end: auto`).
- **`P-17` Optical alignment over geometric centering (`CSS` / `Visual`)** `[RUI, IMP:spatial]`
  Play icons inside circular buttons shift `1–2px` toward the triangle's apex; text links
  with trailing arrows hang the icon outside the text alignment box; form inputs use
  slightly larger inline padding (`--space-3`..`--space-4`) than block padding
  (`--space-2`..`--space-3`).
- **`P-18` Responsive spacing scales down on narrow viewports (`CSS`)** `[IMP:responsive, EL]`
  Section padding and grid gaps use `clamp()` or container-aware tokens so a `375px`
  viewport never loses more than `32px` total horizontal gutter (`16px` per side).
- **`P-19` Touch target spacing buffer (`CSS` / `Visual`)** `[WCAG 2.5.8, LUX-02, WIG]`
  Interactive controls have a hit area `>= 44x44px` on touch/mobile (`>= 24x24px` WCAG AA
  floor on desktop dense toolbars) with `>= 8px` (`--space-2`) clearance between adjacent
  targets.
- **`P-20` No fixed heights on text containers (`CSS`)** `[EL, WIG]`
  Containers holding text or localized strings use `min-block-size` and padding rather
  than fixed `height` so `200%` text zoom never clips content.

---

## 3. Typography (`P-21`..`P-38`)

- **`P-21` Maximum two font families per interface (`CSS`)** `[RUI, IMP:typography, UPM]`
  Use at most 2 font families (`--font-sans` + `--font-display`, or `--font-sans` +
  `--font-mono` when technical/numeric data is present).
- **`P-22` Modular fluid type scale (`CSS`)** `[EL, IMP:typography]`
  Define 6–8 fluid font-size steps using `clamp(min, base + vw, max)` so type scales
  smoothly without breakpoint jumps. Never include `vw` alone without a `rem` base
  (which breaks browser zoom).
- **`P-23` Line length constrained to `45ch–75ch` (`CSS` / `Visual`)** `[EL, RUI, IMP:typography]`
  Body prose blocks enforce `max-inline-size: 65ch` (`45ch–75ch` acceptable window;
  narrower captions/sidebars `25ch–40ch`).
- **`P-24` Line-height inversely proportional to font size (`CSS`)** `[RUI, IMP:typography]`
  Body copy (`1rem`) uses `line-height: 1.5–1.65`; multi-line subheadings use `1.25–1.35`;
  display headings (`>= 2rem`) use `1.08–1.20`.
- **`P-25` Negative tracking on display headings, positive on all-caps (`CSS`)** `[RUI, IMP:typography]`
  Display headings (`>= 1.875rem`) apply `letter-spacing: -0.02em` to `-0.03em`.
  Uppercase kickers/badges (`<= 0.8125rem`) apply `letter-spacing: 0.05em` to `0.08em`
  and `font-weight: 600`. Body text in Latin scripts never uses negative letter-spacing.
- **`P-26` Left-align body copy; never justify web prose (`CSS`)** `[RUI, IMP:typography, WIG]`
  Prose and multi-line descriptions (> 3 lines) are left-aligned (`text-align: start`).
  Centered text is restricted to short headlines or hero intros (`<= 3` lines).
  `text-align: justify` is banned in web UIs.
- **`P-27` Baseline alignment when mixing font sizes on one line (`CSS`)** `[RUI, IMP:typography]`
  Inline metrics (`$49` in `2.25rem` beside `/mo` in `0.875rem`) align via
  `align-items: baseline`, never `align-items: center`.
- **`P-28` Tabular numerals for aligned numbers and timers (`CSS`)** `[RUI, WIG, IMP:typography]`
  Tables, KPI cards, prices, counters, and timestamps apply
  `font-variant-numeric: tabular-nums` so digits align vertically and never jitter
  during updates.
- **`P-29` Balanced and pretty text wrapping (`CSS`)** `[WIG, IMP:typography, UIS]`
  Headings (`h1`–`h4`) apply `text-wrap: balance`; body paragraphs apply
  `text-wrap: pretty` to prevent single-word orphans.
- **`P-30` Base body font size `>= 16px` (`1rem`) (`CSS`)** `[IMP:typography, WIG, UPM]`
  Primary reading copy and all `<input>`, `<select>`, and `<textarea>` elements use
  `font-size >= 1rem` (`16px`) to prevent iOS Safari auto-zoom on focus.
- **`P-31` Dark-mode font-weight compensation (`CSS`)** `[RUI, IMP:typography]`
  Light text on dark backgrounds (`[data-theme="dark"]`) appears optically heavier due to
  halation; apply `-webkit-font-smoothing: antialiased` or step body weight down when
  supported by variable font axes (`GRAD`).
- **`P-32` Proper typographic punctuation (`DOM`)** `[WIG, IMP:ux-writing]`
  Use curly quotes (`“ ”`, `‘ ’`), real ellipsis (`…`), en-dash (`–`) for ranges, and
  non-breaking spaces (`&nbsp;`) between numbers and units (`10 MB`).
- **`P-33` Truncation safety with explicit fallback (`CSS` / `DOM`)** `[WIG, UIS]`
  Every flex child holding dynamic text sets `min-inline-size: 0` so `text-overflow:
  ellipsis` works without blowing out the flex track, and provides the full text via
  `title` or expandable disclosure.
- **`P-34` Font loading with metric-compatible fallback (`CSS`)** `[WIG, IMP:typography]`
  Web fonts declare `font-display: swap` (or `optional`) and `size-adjust` fallbacks to
  prevent layout shift (CLS).
- **`P-35` Restrict font weights to 3–4 active weights (`CSS`)** `[IMP:typography, UIS]`
  Load and use at most 3–4 weights (typically `400`, `500`, `600`, `700`). Avoid ultra-light
  (`100–200`) weights below `24px`.
- **`P-36` Paragraph spacing between `0.75em` and `1.25em` (`CSS`)** `[EL, IMP:typography]`
  Multi-paragraph prose separates `<p>` blocks by `1em` (`--space-4`) via `.l-stack`.
- **`P-37` Code and identifier blocks use monospace at `0.9em` (`CSS`)** `[ADM, IMP:typography]`
  Inline `<code>`, commit hashes, API keys, and keyboard shortcuts (`<kbd>`) render in
  `--font-mono` at `0.875em–0.925em` with a subtle surface pill (`--neutral-100`).
- **`P-38` Underline offset on text links (`CSS`)** `[WIG, IMP:typography]`
  Inline prose links remain distinguishable without color alone by setting
  `text-decoration: underline; text-underline-offset: 0.18em; text-decoration-thickness: 1px`.

---

## 4. Color & Contrast (`P-39`..`P-58`)

- **`P-39` Author tokens in OKLCH (`CSS` / `Artifact`)** `[IMP:color, RUI]`
  Define color scales in `oklch(L C H)` so lightness steps (`L`) are perceptually uniform
  across hues. Provide hex fallbacks only in exported documentation tables.
- **`P-40` 60-30-10 surface-to-accent allocation (`Visual`)** `[IMP:color, RUI, UPM]`
  At least `60%` of the viewport is primary background/surface (`--color-bg`,
  `--color-surface`), `~30%` is secondary structure/typography (`--neutral-*`), and at
  most `10%` uses high-chroma brand/accent fills (`--color-primary`).
- **`P-41` Tonal 9–10 step scales per hue (`CSS` / `Artifact`)** `[RUI, IMP:color]`
  Never define a single hex for a brand or neutral color; generate a 9-to-10 step scale
  (`50` through `900`/`950`) spanning `L = 0.98` down to `L = 0.14`.
- **`P-42` Chroma parabolic curve across lightness (`CSS`)** `[RUI, IMP:color]`
  Peak chroma (`C`) sits in steps `500–600`; reduce chroma at very high lightness (`50–100`)
  and very low lightness (`800–950`) so tints do not look neon and dark shades do not clip
  out of sRGB/P3 gamut.
- **`P-43` Hue rotation toward luminosity at extremes (`CSS`)** `[RUI, IMP:color]`
  Shift lighter steps (`50–200`) slightly toward the nearest luminous hue (`60°–95°`
  yellow, `195°` cyan, or `320°` magenta) and darker steps (`800–950`) toward deep
  indigo/violet (`260°–285°`) to avoid muddy yellows and dead grays.
- **`P-44` Ban pure `#000000` and pure achromatic grays (`CSS`)** `[IMP:color, RUI]`
  Never use `#000000` (`oklch(0 0 0)`) or zero-chroma grays (`oklch(L 0 0)`) alongside
  tinted brand colors.
- **`P-45` Tint neutrals with the brand hue (`CSS`)** `[IMP:color, RUI]`
  Neutral steps (`--neutral-50`..`--neutral-950`) carry a subtle chroma (`C = 0.004` to
  `0.018`) at the brand's warm (`40°–80°`) or cool (`240°–265°`) hue angle.
- **`P-46` WCAG AA contrast floor on every text/surface pair (`CSS` / `Visual`)** `[WCAG 1.4.3, WIG]`
  Normal text (`< 18px`, or `< 14px` bold) achieves `>= 4.5:1` contrast against its
  immediate background; large text (`>= 24px`, or `>= 18.66px` bold) achieves `>= 3.0:1`.
- **`P-47` Non-text UI and input border contrast `>= 3:1` (`CSS`)** `[WCAG 1.4.11, WIG, UIS]`
  Form control borders, checkbox/radio outlines, active tabs, and meaningful icons achieve
  `>= 3:1` contrast or pair a subtle border with a distinct surface fill delta.
- **`P-48` Status badges use light tint fill + dark shade text (`CSS`)** `[RUI, IMP:color]`
  In light mode, badges and alert banners use `--color-*-bg` (`L >= 0.95`, `C <= 0.04`)
  with dark text (`L <= 0.38`) in the same hue rather than white text on a bright mid-tone
  fill.
- **`P-49` Never rely on color alone to convey state (`DOM` / `Visual`)** `[WCAG 1.4.1, WIG, UPM]`
  Every status, validation error, or chart series pairs color with an icon, text label,
  pattern fill, or explicit shape marker.
- **`P-50` Accessible chart palettes (`Visual` / `Artifact`)** `[UPM, IMP:color]`
  Multi-series charts use `<= 5` distinct series per chart, separate adjacent hues in
  lightness (`Delta L >= 0.12`) for deuteranopia/protanopia safety, and label lines or
  bars directly whenever space permits.
- **`P-51` Accent borders on callouts (`CSS`)** `[RUI]`
  Add a `3px–4px` inline-start accent border (`border-inline-start`) on alert banners or
  blockquotes to anchor the eye without heavy full-perimeter borders.
- **`P-52` Semantic status hues stay distinct from brand primary (`CSS`)** `[RUI, UPM]`
  If the brand primary is red/coral or amber, shift `--color-danger` and `--color-warning`
  hues and pair them with unmistakable iconography so brand buttons never read as errors.
- **`P-53` Text over photography requires a scrim (`CSS`)** `[RUI, WIG, WCAG]`
  Text placed over dynamic imagery uses a gradient scrim (`linear-gradient(to top,
  oklch(0.12 0.01 255 / 0.82), transparent)`) or backdrop pill guaranteeing `>= 4.5:1`
  contrast across all image regions.
- **`P-54` Dark mode elevates surfaces by lightness, not drop shadows (`CSS`)** `[RUI, IMP:color, ADM]`
  In `[data-theme="dark"]`, deeper layers are darker (`--color-bg: L ~ 0.145`), cards are
  lighter (`--color-surface: L ~ 0.188`), and modals/popovers are lighter still
  (`--color-surface-raised: L ~ 0.232`), paired with a `1px` top/perimeter highlight
  (`oklch(1 0 0 / 0.08)`).
- **`P-55` Desaturate accent fills in dark mode (`CSS`)** `[IMP:color, RUI]`
  Reduce accent chroma by `10%–20%` and raise lightness (`L ~ 0.65–0.72`) in dark mode so
  accents do not vibrate against dark surfaces.
- **`P-56` Declare `color-scheme` on `:root` and `[data-theme="dark"]` (`CSS`)** `[WIG, IMP:color]`
  Set `color-scheme: light` and `color-scheme: dark` so native scrollbars, date pickers,
  and form autofill backgrounds match the active theme.
- **`P-57` No gray text on colored backgrounds (`CSS`)** `[RUI, IMP:color]`
  Secondary text on a colored surface (`--color-primary` or tinted banner) must use the
  same hue with adjusted lightness/chroma rather than achromatic gray.
- **`P-58` Gradients shift hue by `10°–25°` (`CSS`)** `[RUI, IMP:color]`
  When a subtle surface or button gradient is warranted by the brand, rotate the hue by
  `10°–25°` between stops in OKLCH space; never fade a color to muddy gray.

---

## 5. Elevation, Borders & Radii (`P-59`..`P-75`)

- **`P-59` Prefer spacing or surface contrast before adding borders (`CSS` / `Visual`)** `[RUI, IMP:spatial, ADM]`
  Separate list rows, table cells, or dashboard sections using `--space-4`..`--space-8`
  or a subtle surface step (`--color-bg` vs `--color-surface`) before reaching for a `1px`
  border.
- **`P-60` No nested card-in-card containers (`DOM` / `CSS`)** `[IMP:spatial, UIS]`
  A card (`border` or `box-shadow` + `border-radius`) must never contain another bordered
  or shadowed card. Group inner sub-sections with whitespace, subtle background tint
  (`--color-surface-sunken`), or a single divider.
- **`P-61` Five-level elevation system (`CSS`)** `[RUI]`
  Define at most 5 elevation levels (`xs`: inputs/buttons, `sm`: resting cards, `md`:
  dropdowns/hover cards, `lg`: popovers/drawers, `xl`: modal dialogs).
- **`P-62` Two-part natural shadows (`CSS`)** `[RUI]`
  Every elevation shadow above `xs` combines a larger, softer ambient shadow with a
  tighter, darker direct shadow (both tinted with the neutral hue, never pure black at
  high alpha), and applies negative spread (`-2px` to `-4px`) on `md`/`lg` shadows.
- **`P-63` Interactive elevation feedback (`CSS`)** `[RUI, IMP:interaction]`
  Draggable items elevate one shadow step on `:active`/drag; clickable cards use subtle
  border contrast increase (`--color-border-strong`) rather than exaggerated `translateY`
  leaps.
- **`P-64` Crisp `1px` ring or border for whisper-quiet luxury (`CSS`)** `[ADM:linear, ADM:vercel, UIS]`
  Modern technical UIs (`Linear`, `Vercel`, `Stripe`) favor `1px solid var(--color-border-subtle)`
  or `box-shadow: 0 0 0 1px ...` over heavy blurred drop shadows.
- **`P-65` Recessed inputs via subtle inner top shadow or darker border (`CSS`)** `[RUI]`
  Text inputs in light mode may use `--shadow-xs` or a slightly stronger top border to
  read as a slot awaiting input.
- **`P-66` Concentric border-radius formula (`CSS` / `Visual`)** `[RUI, UIS, IMP:spatial]`
  When a rounded child sits inside a rounded parent with padding $p$, enforce
  $r_{\text{outer}} = r_{\text{inner}} + p$ (e.g., `r_inner = 8px` + `padding = 8px`
  $\Rightarrow$ `r_outer = 16px`).
- **`P-67` Radius scale matches brand personality (`CSS`)** `[RUI, ADM, UPM]`
  Technical/precision brands use `4px–8px` (`--radius-xs`..`--radius-md`); approachable
  consumer tools use `8px–16px`; brutalist/Swiss editorial layouts use `0px–2px`. Never
  mix sharp `0px` cards with `24px` pill cards in the same view.
- **`P-68` Full pills (`9999px`) reserved for badges, tags, and compact toggles (`CSS`)** `[RUI, ADM]`
  Do not apply `border-radius: 9999px` to multi-line containers or large rectangular cards.
- **`P-69` Table cell borders use horizontal rules only (`CSS`)** `[RUI, UIS]`
  Data tables omit vertical cell borders by default, using horizontal row dividers
  (`1px solid var(--color-border-subtle)`) and right-aligned numeric columns.
- **`P-70` Sticky headers acquire a border or shadow on scroll (`CSS`)** `[WIG, IMP:interaction]`
  Fixed or sticky table headers and top bars separate cleanly from scrolling content with
  a `1px` bottom border and opaque/blurred surface (`backdrop-filter: blur(12px)` only on
  a single header layer).
- **`P-71` Limit `backdrop-filter: blur()` to at most one active overlay (`CSS`)** `[UIS:motion, WIG]`
  Never stack multiple blurred glass layers in the same viewport; doing so causes GPU
  overdraw and frame drops during scroll.
- **`P-72` Hairline inner ring on user avatars and thumbnails (`CSS`)** `[RUI, UIS]`
  Apply `outline: 1px solid oklch(0 0 0 / 0.08); outline-offset: -1px` on `<img>` avatars
  and screenshots so light-background images do not bleed into light surfaces.
- **`P-73` Empty states use dashed subtle borders or clean centered stacks (`Visual`)** `[RUI, IMP:interaction]`
  Empty states present an icon/illustration, a clear explanation of what belongs here, and
  a direct primary action to create the first item.
- **`P-74` Semantic z-index token tiers (`CSS`)** `[UIS, RUI]`
  Never write arbitrary `z-index: 9999`; use the 5-step token scale (`--z-sticky: 10`,
  `--z-dropdown: 20`, `--z-overlay: 30`, `--z-modal: 40`, `--z-toast: 50`) or isolate
  component stacking contexts with `isolation: isolate`.
- **`P-75` Divider lines do not span edge-to-edge inside padded cards (`CSS`)** `[RUI]`
  Inset list dividers to align with the text column (past leading icons/avatars) or use
  row gap spacing instead.

---

## 6. Imagery, Icons & Data Presentation (`P-76`..`P-89`)

- **`P-76` Never scale small vector icons up to fill large feature slots (`CSS` / `Visual`)** `[RUI]`
  A `24x24` stroke icon scaled to `64px` looks spindly and crude. Keep the icon at
  `20px–24px` and wrap it in a `40px–48px` tinted surface badge (`--primary-50` fill,
  `--primary-600` stroke, `--radius-md`).
- **`P-77` Consistent icon stroke width and optical grid (`DOM` / `CSS`)** `[UIS, IMP:spatial]`
  All icons in a view come from a single family with uniform stroke width (`1.5px` or
  `2px`) and `viewBox="0 0 24 24"`.
- **`P-78` Never downscale full-screen desktop screenshots into tiny card thumbnails (`Visual`)** `[RUI]`
  Unreadable micro-screenshots fail to communicate; crop to the relevant control region,
  render a simplified UI abstraction, or show a focused preview.
- **`P-79` Enforce explicit `width`, `height`, or `aspect-ratio` on every media element (`DOM` / `CSS`)** `[WIG, EL:Frame]`
  Every `<img>`, `<video>`, and `<svg>` declares dimensions or sits inside `.l-frame`
  so zero Cumulative Layout Shift (CLS) occurs during load.
- **`P-80` Decorative icons hide from assistive tech; semantic icons label themselves (`DOM`)** `[WCAG 1.1.1, WIG, UIS]`
  Decorative SVGs beside text carry `aria-hidden="true"`. Standalone icon buttons carry an
  explicit `aria-label` on the `<button>`.
- **`P-81` Cap-height icon alignment via `.l-icon` (`CSS`)** `[EL:Icon]`
  Inline icons paired with text use `.l-icon` (`0.85em–1em` size, baseline/center aligned
  with `0.5ch` gap).
- **`P-82` Never use emojis as application UI icons (`DOM`)** `[UPM, IMP, UIS]`
  Replace emojis (`🚀`, `⚙️`, `🔥`) in navigation, buttons, and status badges with crisp
  SVG icons.
- **`P-83` Avoid generic stock photography and AI-generated hero cliches (`Visual`)** `[RUI, IMP, FD]`
  Use authentic product UI previews, domain-specific diagrams, or typographic authority
  instead of generic corporate stock photos.
- **`P-84` Right-align numeric table columns and match header alignment (`CSS`)** `[RUI, WIG]`
  Text columns align start (`left` in LTR); numeric, currency, and percentage columns and
  their `<th>` headers align end (`right` in LTR) with `tabular-nums`.
- **`P-85` Combine related table columns to avoid horizontal overflow (`DOM` / `Visual`)** `[RUI]`
  Stack secondary row metadata (e.g., user email under user name, role badge beside title)
  into a single composite cell rather than adding 8+ sparse columns.
- **`P-86` Chart selection matches analytical task (`Visual` / `Artifact`)** `[UPM]`
  Trends over time use line/area charts; categorical comparisons use horizontal or
  vertical bar charts; part-to-whole with `<= 5` slices uses stacked bar or donut with a
  center total; pie charts with `> 5` slices are banned.
- **`P-87` Chart axes start at zero for bar and area charts (`Visual`)** `[UPM]`
  Bar and area charts anchor their baseline at `0` so bar lengths remain proportional to
  values.
- **`P-88` Direct data labeling over detached legends (`Visual`)** `[UPM, LUX]`
  When a chart has `<= 4` series, label series directly or place a compact inline header
  legend with matching semantic tokens.
- **`P-89` Skeleton placeholders mirror real content geometry (`CSS` / `DOM`)** `[WIG, LUX-03, IMP:interaction]`
  Loading skeletons match the exact height and layout of the loaded state and pulse
  subtly (`opacity` between `0.5` and `1.0` over `1.5s`), avoiding layout jumps when data
  arrives.

---

## 7. Interactive States, Forms, Motion & UX Writing (`P-90`..`P-114`)

- **`P-90` Eight-state completeness for interactive views and controls (`DOM` / `CSS`)** `[IMP:interaction, WIG, UIS]`
  Every interactive control and data view accounts for: `default`, `hover`, `focus-visible`,
  `active`, `disabled`, `loading`, `empty`, and `error`.
- **`P-91` Keyboard focus ring via `:focus-visible` (`CSS`)** `[WCAG 2.4.7, WIG, UIS]`
  Never write `outline: none` without a replacement. Apply
  `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` on `:focus-visible`.
- **`P-92` Guard hover styles for touch devices (`CSS`)** `[WIG, IMP:responsive]`
  Wrap hover-only visual shifts or hover-revealed actions in
  `@media (hover: hover) and (pointer: fine)` so touch taps do not leave sticky hover
  artifacts, and never hide critical actions behind hover alone.
- **`P-93` Tactile `:active` state (`CSS`)** `[IMP:interaction, UIS]`
  Buttons shift lightness or apply `transform: scale(0.98)` (or `translateY(1px)`) on
  `:active` for immediate physical feedback (`< 100ms` Doherty Threshold).
- **`P-94` Disabled buttons explain why or remain absent (`DOM` / `UX`)** `[IMP:interaction, WIG]`
  Prefer keeping the submit button enabled and validating on submit, or provide helper
  text explaining what is required rather than leaving an unexplained disabled button.
- **`P-95` Animate only `transform` and `opacity` on the compositor thread (`CSS`)** `[UIS:motion, WIG, IMP:motion]`
  Never animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`).
  Never write `transition: all`.
- **`P-96` Duration budget: `100ms–150ms` micro, `180ms–250ms` panel, `<= 350ms` modal (`CSS`)** `[IMP:motion, UIS, LUX-03]`
  Exit animations run `~25%` faster than entrance animations (`150ms` exit vs `200ms`
  enter). UI transitions exceeding `500ms` are banned.
- **`P-97` Natural exponential easing; no bounce or elastic curves (`CSS`)** `[IMP:motion, UIS]`
  Enter with `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-out-quint`) or `--ease-out-quart`;
  never use `linear` for spatial motion and never use overshooting bounce/elastic curves
  in productivity UIs.
- **`P-98` Honor `prefers-reduced-motion: reduce` globally (`CSS`)** `[WCAG 2.3.3, WIG, IMP:motion]`
  Collapse movement and transition durations to `0.01ms` or replace spatial translation
  with instant opacity crossfades when `prefers-reduced-motion: reduce` is active.
- **`P-99` Every form input has a persistent visible `<label>` (`DOM`)** `[WCAG 3.3.2, WIG, UPM]`
  Bind `<label for="id">` above the input. Placeholder text disappears on typing and must
  never substitute for a label; use placeholders only for format examples (`e.g.,
  jane@acme.com`).
- **`P-100` Prefer single-column vertical form layouts (`DOM` / `CSS`)** `[LUX, IMP:interaction, WIG]`
  Stack form fields in a single `.l-stack` column; only tightly coupled short fields
  (e.g., `City` + `Postal Code`, or `Start Date` + `End Date`) may share a row.
- **`P-101` Correct semantic `type`, `inputmode`, and `autocomplete` (`DOM`)** `[WIG, IMP:responsive]`
  Email, phone, URL, password, and OTP inputs declare matching `type`, `inputmode`, and
  `autocomplete` attributes (`email`, `tel`, `current-password`, `one-time-code`) and
  never block paste.
- **`P-102` Validate on blur or submit (`reward early, punish late`) (`DOM`)** `[IMP:interaction, WIG]`
  Do not show red error messages while the user is typing into a field for the first time;
  validate on `blur` or `submit`, then clear the error immediately on valid `input`.
- **`P-103` Programmatic error association via `aria-invalid` and `aria-describedby` (`DOM`)** `[WCAG 3.3.1, WIG, UIS]`
  Invalid fields set `aria-invalid="true"` and point `aria-describedby` to an inline error
  message element that explains both the problem and how to fix it.
- **`P-104` Replace native `<select>` with radio cards when options `<= 5` (`DOM`)** `[RUI, LUX-02]`
  When a single-choice field has `2–5` options, expose them as visible radio buttons or
  selectable radio cards so users compare choices without an extra click.
- **`P-105` Confirmation or Undo for destructive actions (`DOM` / `UX`)** `[LUX-05, IMP:interaction, WIG]`
  Reversible deletions offer an immediate toast with `Undo`; permanent deletions require a
  confirmation modal naming the specific resource and using a verb-specific button
  (`Delete project`, never generic `OK` or `Yes`).
- **`P-106` Submit buttons prevent double-submission (`DOM`)** `[WIG, IMP:interaction]`
  During async submission, set `aria-busy="true"`, disable duplicate clicks, and keep
  button width stable while showing an inline spinner + action verb (`Saving…`).
- **`P-107` Specific verb+noun button labels (`DOM`)** `[IMP:ux-writing, WIG]`
  Buttons state what they do (`Create API key`, `Export CSV`, `Save changes`). Ban vague
  labels (`Submit`, `Click here`, `OK`, `Yes/No`).
- **`P-108` Actionable, blame-free error messages (`DOM`)** `[IMP:ux-writing]`
  Error copy states what happened and the next step (`Payment declined by card issuer.
  Try another card or update billing details.`), never raw error codes (`Error 500:
  ECONNRESET`) or user-blaming language.
- **`P-109` Sentence case for UI headings, labels, and buttons (`DOM`)** `[IMP:ux-writing, ADM]`
  Default UI chrome, headings, navigation items, and buttons to Sentence case (capitalizing
  only the first word and proper nouns) for faster scanning.
- **`P-110` Optimistic UI for high-probability non-destructive toggles (`UX`)** `[LUX-03, IMP:interaction]`
  Bookmarking, starring, reordering, and theme toggles update visually in `< 50ms` and
  roll back with a non-blocking toast only if the request fails.
- **`P-111` URL reflects shareable view state (`UX`)** `[WIG]`
  Active tab, filter, sort, pagination, and search query parameters sync with the URL so
  refresh and deep-linking preserve state.
- **`P-112` Safe-area insets and `100dvh` on mobile shells (`CSS`)** `[WIG, IMP:responsive]`
  Full-height mobile shells use `min-block-size: 100dvh` (never `100vh`) and pad fixed
  bottom bars with `env(safe-area-inset-bottom)`.
- **`P-113` Container queries over viewport media queries for reusable components (`CSS`)** `[EL, IMP:responsive]`
  When a component must adapt to narrow vs wide slots, declare `container-type: inline-size`
  on its wrapper and query `@container (min-width: ...)` or use `.l-switcher` / `.l-sidebar`
  instead of `@media (min-width: ...)`.
- **`P-114` Zero horizontal page overflow from `320px` to `1920px` (`Visual` / `CSS`)** `[WCAG 1.4.10, WIG]`
  At every viewport width from `320px` up, `document.documentElement.scrollWidth <=
  document.documentElement.clientWidth`. Wide tables or code blocks scroll inside their
  own container (`.l-reel`), never stretching the page body.

---

## 8. Cross-Source Conflict Resolutions (`C-01`..`C-25`)

When upstream sources differ on thresholds, apply these binding resolutions:

| ID | Topic | Binding Resolution | Sources Reconciled |
|---|---|---|---|
| `C-01` | Color space | Author tokens in **OKLCH** with hex fallbacks in documentation tables | `[IMP]` vs `[RUI]`/`[UPM]` |
| `C-02` | Breakpoints vs intrinsic | **Every Layout primitives first** (`0` viewport `@media` queries in `primitives.css`); `@container` second; viewport `@media` only for shell nav collapse | `[EL]` vs `[RUI]`/`[UPM]` |
| `C-03` | Touch target size | **`44x44px` studio floor** on touch/mobile (`TG-01`); `24x24px` WCAG 2.2 AA minimum allowed only on dense desktop toolbars (`TG-02`) | `[IMP]`/`[UPM]` vs `[WCAG]` |
| `C-04` | Type scale sizing | **Fluid `clamp()` tokens** mapped to a named 8-step scale (`--text-xs`..`--text-4xl`) | `[EL]`/`[IMP]` vs `[RUI]` |
| `C-05` | Line length | **`65ch` default `--measure`**, `45ch–75ch` valid prose range, `25ch–40ch` narrow column exception | `[EL]` vs `[IMP]`/`[RUI]` |
| `C-06` | `Inter` / `Roboto` font policy | **Contextual**: avoid as unexamined default (`AP-06`) when choosing a fresh brand identity, but permitted when mandated by an existing `DESIGN.md` (e.g., Linear/Vercel) or Japanese Latin pairing | `[IMP]`/`[FD]` vs `[ADM]`/`[ADMJ]` |
| `C-07` | Pure black `#000000` | **Banned by default** (`AP-16`); use `oklch(0.145 0.009 H)`. Allowed only for explicit OLED/Monochrome Swiss themes documented in `DESIGN.md` (`Vercel`/`The Verge`) | `[IMP]`/`[RUI]` vs `[ADM]` |
| `C-08` | Shadows vs `1px` borders | Use **spacing/surface contrast first**, crisp `1px` subtle borders for technical/dark UI, and 2-part shadows (`--shadow-sm`..`--shadow-lg`) for elevated light-mode layers | `[RUI]` vs `[ADM]`/`[UIS]` |
| `C-09` | Maximum `z-index` Tiers | **5 semantic token tiers** (`10`..`50`) + `isolation: isolate`; arbitrary `z-index >= 100` is banned | `[UIS]` vs `[RUI]` |
| `C-10` | Animation duration ceiling | **`120ms–200ms` micro-interactions**, **`<= 320ms` modals/drawers**, hard ceiling **`500ms`** (`AN-03`) | `[IMP]`/`[UIS]` vs `[WIG]` |
| `C-11` | Spring/bounce physics | **Exponential ease-out (`--ease-out-quart` / `--ease-out-quint`)** by default; overshooting bounce (`cubic-bezier` with $y_2 > 1.05$) banned in productivity UI | `[IMP]` vs `[UIS]` |
| `C-12` | Heading case | **Sentence case** by default (`P-109`), uppercase allowed only for small kickers (`<= 13px`) with `letter-spacing >= 0.05em` | `[IMP]` vs `[RUI]` |
| `C-13` | Japanese vs Latin line-height | Latin body `1.5–1.65`; **Japanese (`:lang(ja)`) body `1.75–1.90`** and heading `1.25–1.40` (`JA-15`) | `[IMP]`/`[RUI]` vs `[ADMJ]` |
| `C-14` | Japanese letter-spacing | Latin display headings use `-0.02em`..`-0.03em`; **Japanese body never uses negative tracking (`>= 0em`)** (`JA-20`) | `[RUI]` vs `[ADMJ]` |
| `C-15` | Japanese italic & bold | **Never apply `font-style: italic` to Japanese glyphs** (`JA-29`) and avoid `font-weight >= 800` on intricate kanji below `20px` | `[IMP]` vs `[ADMJ]` |
| `C-16` | Top-level navigation count | **`<= 5` top-level nav items** on mobile bottom bars (`WF-20`), **`<= 7` items** on desktop headers/sidebars (`LUX-10`) | `[LUX]` vs `[UPM]` |
| `C-17` | Card internal complexity | **`<= 4` distinct data points** and **`<= 3` font sizes** per card (`LUX-09`, `P-01`) | `[RUI]` vs `[LUX]` |
| `C-18` | Form error trigger timing | **Validate on `blur` or `submit`**, then re-validate live on `input` only after an error is shown (`P-102`) | `[WIG]` vs `[IMP]` |
| `C-19` | Disabled submit buttons | Keep submit buttons enabled and trigger clear validation feedback on click, or explain the missing prerequisite right beside the button (`P-94`) | `[WIG]` vs `[UIS]` |
| `C-20` | `h-screen` / `100vh` | **Always use `100dvh`** (`min-block-size: 100dvh`); `100vh` is banned (`AP-42`) | `[UIS]`/`[WIG]` vs legacy CSS |
| `C-21` | Dark mode contrast ceiling | Body text in dark mode uses `L = 0.92–0.96` (`#ECEEF2`), not pure `#FFFFFF` on `#000000`, to prevent halation (`P-54`) | `[IMP]`/`[RUI]` vs `[WCAG]` |
| `C-22` | Placeholder usage | **Never use placeholder as a label** (`P-99`); omit redundant placeholders and use only for non-obvious format hints | `[WIG]`/`[UPM]` vs `[RUI]` |
| `C-23` | Grid column sizing | Use **RAM (`repeat(auto-fit, minmax(min(100%, var(--min)), 1fr))`)** instead of fixed `grid-template-columns: repeat(3, 1fr)` (`LP-13`) | `[EL]` vs `[RUI]` |
| `C-24` | Icon-to-text sizing | Inline icons use `0.85em–1em` via `.l-icon` (`LP-17`); standalone button icons use `18px–20px` inside a `>= 40px–44px` hit box | `[EL]` vs `[RUI]` |
| `C-25` | PrimeVue version guidance | Target **PrimeVue v4 (`@primevue/themes`)**; explicitly flag PrimeVue v5 license constraints before adoption | `[UPM]` studio policy |

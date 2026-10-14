# Deterministic UI/UX Audit Checklist (126 Rules & 5-Dimension Scoring)

Unified rules across Web Interface Audit `[WIG]`, Baseline UI Constraints `[UIS]`,
Craft & Polish `[IMP]`, Design-System Heuristics `[UPM]`, *Every Layout* `[EL]`,
*Refactoring UI* `[RUI]`, *Laws of UX* `[LUX]`, and `WCAG 2.2 AA` `[WCAG]`.

---

## 1. Automated Verification Rules (92 Rules Across 10 Categories)

### `ST` — Structural & Semantic Baseline (`ST-01`..`ST-12`)

- **`ST-01` (`DOM`, Error)** `[WCAG 3.1.1, WIG]`: `<html>` declares a valid `lang` attribute (`en`, `ja`, etc.).
- **`ST-02` (`DOM`, Error)** `[WCAG 1.3.1, WIG]`: Document includes `<main id="main">` (or `[role="main"]`) and `<header>`/`<nav>` landmarks.
- **`ST-03` (`DOM`, Error)** `[WCAG 2.4.1, WIG]`: First focusable element in `<body>` is a skip link (`<a href="#main">`).
- **`ST-04` (`DOM`, Error)** `[WCAG 1.3.1, UIS]`: Exactly one `<h1>` per view and heading ranks (`h1`..`h6`) never skip a level (`h1 -> h3` is an error).
- **`ST-05` (`DOM`, Error)** `[WIG]`: `<head>` includes `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">` (no `user-scalable=no`), and a descriptive `<title>`.
- **`ST-06` (`CSS`, Warning)** `[IMP:color, UIS]`: Component CSS rules use semantic custom properties (`var(--color-*)`, `var(--space-*)`) rather than raw hex/px literals.
- **`ST-07` (`CSS`, Error)** `[WIG, IMP:color]`: `:root` (and `[data-theme="dark"]` if present) declares `color-scheme`.
- **`ST-08` (`DOM`, Error)** `[WIG, UIS]`: Interactive actions use `<button type="button|submit">`; navigation uses `<a href="...">`. No `<div onclick>` or `<a href="#">`.
- **`ST-09` (`DOM`, Warning)** `[IMP:interaction]`: Major layout regions carry `data-block="<id>"` attributes for targeted block refinement.
- **`ST-10` (`DOM`, Error)** `[IMP:ux-writing, UIS]`: Zero placeholder/slop strings (`Lorem ipsum`, `John Doe`, `Acme Corp`, `TODO`, `foo`, `bar`).
- **`ST-11` (`DOM`, Error)** `[UPM, IMP]`: Zero Unicode emoji characters used as structural icons inside `<nav>`, `<button>`, or status badges.
- **`ST-12` (`DOM`, Error)** `[WIG]`: Zero broken local `src` or `href` asset references.

### `A11Y` — Accessibility & ARIA (`A11Y-01`..`A11Y-19`)

- **`A11Y-01` (`DOM`, Error)** `[WCAG 1.1.1, WIG]`: Every `<img>` has an `alt` attribute (`alt=""` for decorative images, descriptive text for informative images).
- **`A11Y-02` (`DOM`, Error)** `[WCAG 4.1.2, WIG]`: Icon-only `<button>` and `<a>` elements have a non-empty `aria-label`, `aria-labelledby`, or `.u-visually-hidden` span.
- **`A11Y-03` (`DOM`, Error)** `[WCAG 1.1.1, UIS]`: Decorative inline `<svg>` elements inside labeled buttons/links set `aria-hidden="true"` and `focusable="false"`.
- **`A11Y-04` (`DOM`, Error)** `[WCAG 3.3.2, WIG]`: Every `<input>`, `<select>`, and `<textarea>` has a programmatic label via `<label for="id">`, wrapping `<label>`, or `aria-label`.
- **`A11Y-05` (`DOM`, Error)** `[WCAG 4.1.2]`: Elements with `role="dialog"` or `<dialog>` declare `aria-labelledby` (or `aria-label`).
- **`A11Y-06` (`DOM`, Error)** `[WCAG 4.1.2, WIG]`: Toggle buttons and disclosures maintain `aria-pressed` or `aria-expanded` state attributes.
- **`A11Y-07` (`DOM`, Error)** `[WCAG 4.1.3, WIG]`: Dynamic status/toast containers declare `aria-live="polite"` (or `role="status"`) and critical errors declare `role="alert"`.
- **`A11Y-08` (`DOM`, Error)** `[WCAG 1.3.1, WIG]`: Data `<table>` elements include `<thead>`, `<th scope="col|row">`, and an accessible `<caption>` or `aria-label`.
- **`A11Y-09` (`DOM`, Error)** `[WCAG 2.4.4, WIG]`: Link text is descriptive out of context (no bare `Click here`, `Read more`, `Link`).
- **`A11Y-10` (`DOM`, Error)** `[WCAG 4.1.1]`: All `id` attributes in the document are unique, and every `for`, `aria-labelledby`, and `aria-describedby` target ID exists.
- **`A11Y-11` (`DOM`, Error)** `[WCAG 1.4.1, WIG]`: Status indicators, form errors, and chart series do not rely on color alone (paired with icon, text, or pattern).
- **`A11Y-12` (`DOM`, Error)** `[WCAG 2.4.6]`: Multiple `<nav>` landmarks distinguish themselves via `aria-label` (e.g., `Primary`, `Breadcrumb`, `Footer`).
- **`A11Y-13` (`DOM`, Error)** `[WCAG 1.3.1]`: Radio button groups and checkbox clusters sit inside `<fieldset>` with a `<legend>`.
- **`A11Y-14` (`DOM`, Error)** `[WCAG 4.1.2]`: Custom tabs follow the ARIA tab pattern (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`).
- **`A11Y-15` (`DOM`, Error)** `[WCAG 2.2.2, WIG]`: No `<video autoplay>` with audio or unpaused auto-rotating carousel.
- **`A11Y-16` (`CSS`, Error)** `[WCAG 1.4.4, WIG]`: Text scales to `200%` without clipping (`overflow: hidden` on fixed-height text containers is banned).
- **`A11Y-17` (`DOM`, Warning)** `[WIG]`: Current navigation link carries `aria-current="page"`.
- **`A11Y-18` (`DOM`, Error)** `[WCAG 1.3.5, WIG]`: Personal data inputs declare valid HTML `autocomplete` tokens.
- **`A11Y-19` (`DOM`, Error)** `[WCAG 3.3.1, WIG]`: Invalid inputs set `aria-invalid="true"` and link to their error message via `aria-describedby`.

### `CO` — Color & Contrast (`CO-01`..`CO-07`)

- **`CO-01` (`Visual`, Error)** `[WCAG 1.4.3]`: Normal text (`< 18px`, or `< 14px` bold) has WCAG contrast `>= 4.5:1` against its effective background.
- **`CO-02` (`Visual`, Error)** `[WCAG 1.4.3]`: Large text (`>= 24px`, or `>= 18.66px` bold) has WCAG contrast `>= 3.0:1`.
- **`CO-03` (`Visual`, Error)** `[WCAG 1.4.11]`: Interactive control boundaries, input borders, and meaningful icons achieve `>= 3.0:1` contrast.
- **`CO-04` (`CSS`, Warning)** `[IMP:color, RUI]`: Zero pure `#000000` (`rgb(0, 0, 0)`) or untinted gray (`R == G == B`) in standard brand palettes (`AP-16`, `AP-17`).
- **`CO-05` (`Visual`, Warning)** `[IMP:color, RUI]`: High-chroma accent fill covers `<= 10%` of the viewport (`60-30-10` rule, `P-40`).
- **`CO-06` (`Visual`, Error)** `[RUI, IMP:color]`: At most 1 high-saturation primary CTA button per screen/modal (`P-07`, `LUX-08`).
- **`CO-07` (`CSS`, Warning)** `[IMP:color, RUI]`: Dark mode elevates surfaces via lighter OKLCH lightness steps (`--color-surface-raised > --color-surface > --color-bg`), not heavy dark drop shadows (`P-54`).

### `KB` — Keyboard & Focus (`KB-01`..`KB-07`)

- **`KB-01` (`CSS`, Error)** `[WCAG 2.4.7, WIG]`: Every interactive element displays a visible `:focus-visible` indicator (`outline >= 2px` with contrast `>= 3:1`).
- **`KB-02` (`CSS`, Error)** `[WIG, UIS]`: Zero `:focus { outline: none }` without a matching `:focus-visible` ring (`AP-65`).
- **`KB-03` (`DOM`, Error)** `[WCAG 2.4.3, WIG]`: Zero elements with `tabindex > 0` (`AP-80`).
- **`KB-04` (`DOM`, Error)** `[WCAG 2.1.1]`: Every interactive control is reachable via sequential `Tab` navigation in logical visual order.
- **`KB-05` (`DOM`, Error)** `[WCAG 2.1.2, WIG]`: Modals and drawers trap `Tab` focus while open, close on `Escape`, and restore focus to the invoking trigger on close.
- **`KB-06` (`CSS`, Error)** `[WIG]`: Hidden or off-screen drawers/menus carry `hidden`, `inert`, or `visibility: hidden` so `Tab` never focuses invisible elements.
- **`KB-07` (`CSS`, Warning)** `[WIG]`: Sticky headers define `scroll-margin-top` on anchor targets so focused/linked elements are never obscured under sticky bars (`WCAG 2.4.11`).

### `TG` — Touch Targets & Motor Ergonomics (`TG-01`..`TG-07`)

- **`TG-01` (`Visual`, Error)** `[IMP:responsive, LUX-02]`: Interactive controls on mobile (`375px`) have bounding boxes `>= 44x44px`.
- **`TG-02` (`Visual`, Error)** `[WCAG 2.5.8]`: Interactive controls on desktop (`1440px`) have bounding boxes `>= 24x24px` (`>= 32x32px` recommended for primary buttons/inputs).
- **`TG-03` (`Visual`, Warning)** `[LUX-02, WIG]`: Adjacent interactive targets maintain `>= 8px` (`--space-2`) separation.
- **`TG-04` (`CSS`, Warning)** `[WIG]`: Interactive controls set `touch-action: manipulation` to eliminate tap delay.
- **`TG-05` (`CSS`, Warning)** `[WIG, IMP:responsive]`: Hover effects are scoped inside `@media (hover: hover) and (pointer: fine)` (`P-92`).
- **`TG-06` (`DOM`, Error)** `[WIG, IMP:responsive]`: Zero critical actions hidden exclusively behind `:hover` (`AP-72`).
- **`TG-07` (`Visual`, Warning)** `[LUX-02]`: Primary form submit button aligns with the form's left/full edge immediately below the final field.

### `FM` — Forms & Validation (`FM-01`..`FM-09`)

- **`FM-01` (`DOM`, Error)** `[WCAG 3.3.2, WIG]`: Persistent visible `<label>` above every form control (`P-99`, `AP-68`).
- **`FM-02` (`CSS`, Error)** `[WIG, IMP:responsive]`: Form inputs (`<input>`, `<select>`, `<textarea>`) have computed `font-size >= 16px` (`AP-08`).
- **`FM-03` (`DOM`, Warning)** `[WIG]`: Email, tel, URL, number, and search fields declare matching `type` and `inputmode` attributes (`P-101`).
- **`FM-04` (`DOM`, Error)** `[WIG, WCAG 3.3.8]`: No `onpaste` blocking on any input (`AP-71`).
- **`FM-05` (`Visual`, Warning)** `[LUX, IMP:interaction]`: Form fields stack in a single vertical column (except coupled short pairs like `City` + `Postal Code`, `P-100`).
- **`FM-06` (`DOM`, Warning)** `[RUI, LUX-02]`: Single-choice fields with `2–4` options use radio buttons/cards instead of `<select>` (`P-104`).
- **`FM-07` (`DOM`, Error)** `[WCAG 3.3.1, WIG]`: Error messages sit inline below the field, linked via `aria-describedby`, stating how to fix the input (`P-103`, `P-108`).
- **`FM-08` (`DOM`, Warning)** `[IMP:ux-writing, WIG]`: Submit button uses a specific verb + noun label (`Create account`, never bare `Submit`, `P-107`).
- **`FM-09` (`DOM`, Warning)** `[LUX-05]`: Optional fields are minimized (`LUX-25`) and explicitly marked `(optional)` rather than marking every field with `*`.

### `LY` — Spatial Layout & Responsive Reflow (`LY-01`..`LY-12`)

- **`LY-01` (`Visual`, Error)** `[WCAG 1.4.10, WIG]`: Zero horizontal page overflow (`scrollWidth <= clientWidth`) at `320px`, `375px`, `768px`, and `1440px` (`P-114`).
- **`LY-02` (`CSS`, Warning)** `[EL]`: Layout structure uses Every Layout primitives (`.l-stack`, `.l-cluster`, `.l-sidebar`, `.l-switcher`, `.l-grid`, `.l-box`, `.l-center`, `.l-cover`, `.l-frame`, `.l-reel`, `.l-imposter`, `.l-icon`).
- **`LY-03` (`DOM`, Error)** `[IMP:spatial, UIS]`: Zero nested card-in-card borders (`AP-32`, `P-60`).
- **`LY-04` (`Visual`, Warning)** `[RUI, UIS]`: Concentric border radii ($r_{\text{outer}} = r_{\text{inner}} + p$, `P-66`).
- **`LY-05` (`Visual`, Warning)** `[LUX-11, IMP:spatial]`: Group outer gap is `>= 1.5x` internal padding/gap (`P-12`, `AP-34`).
- **`LY-06` (`CSS`, Error)** `[WIG, UIS]`: Full-height blocks use `100dvh`, never `100vh` (`AP-42`).
- **`LY-07` (`DOM`, Error)** `[WIG, EL:Frame]`: Every `<img>` and `<video>` declares `width`+`height` or sits inside `.l-frame` (`P-79`, `AP-50`).
- **`LY-08` (`Visual`, Warning)** `[RUI,IMP:spatial]`: Viewport maintains `>= 25%` open background/surface whitespace (`P-13`, `AP-47`).
- **`LY-09` (`CSS`, Warning)** `[WIG, UIS]`: Flex children containing dynamic strings set `min-inline-size: 0` (`P-33`, `AP-49`).
- **`LY-10` (`Visual`, Error)** `[WIG]`: Zero unintended overlapping bounding boxes between sibling text or interactive controls (`scripts/probe.mjs` collision check).
- **`LY-11` (`Visual`, Warning)** `[RUI, UIS]`: Sibling cards in the same grid row share equal heights and aligned bottom footers (`P-16`, `AP-46`).
- **`LY-12` (`CSS`, Warning)** `[UIS, RUI]`: `z-index` values stay within the 5-tier token scale (`<= 50`, `P-74`, `AP-45`).

### `TY` — Typography & Readability (`TY-01`..`TY-09`)

- **`TY-01` (`Visual`, Warning)** `[EL, IMP:typography]`: Prose line length stays within `45ch–75ch` (`--measure: 65ch`, `P-23`, `AP-01`).
- **`TY-02` (`CSS`, Warning)** `[RUI, IMP:typography]`: Body `line-height` is `1.5–1.65` (`1.75–1.90` for `:lang(ja)`), and display heading `line-height` is `1.08–1.25` (`P-24`).
- **`TY-03` (`CSS`, Error)** `[IMP:typography, WIG]`: Zero `text-align: justify` (`P-26`, `AP-05`).
- **`TY-04` (`Visual`, Warning)** `[RUI, IMP:typography]`: Zero centered text blocks exceeding 3 lines (`P-26`, `AP-12`).
- **`TY-05` (`CSS`, Warning)** `[WIG, RUI]`: Numeric tables, KPI values, prices, and timers set `font-variant-numeric: tabular-nums` (`P-28`, `AP-13`).
- **`TY-06` (`CSS`, Warning)** `[WIG, IMP:typography]`: Headings set `text-wrap: balance` and body paragraphs set `text-wrap: pretty` (`P-29`).
- **`TY-07` (`CSS`, Warning)** `[IMP:typography, UPM]`: At most 2 font families (`+ 1` monospace for code/numbers) and `<= 4` font weights (`P-21`, `P-35`).
- **`TY-08` (`CSS`, Error)** `[IMP:typography, WCAG]`: Zero visible text smaller than `12px` (`0.75rem`, `AP-09`).
- **`TY-09` (`CSS`, Error)** `[ADMJ]`: When `:lang(ja)` is present, `line-break: strict; overflow-wrap: anywhere` is active and zero `:lang(ja)` elements use `font-style: italic` (`AP-98`, `AP-99`).

### `AN` — Animation & Motion Performance (`AN-01`..`AN-07`)

- **`AN-01` (`CSS`, Error)** `[WCAG 2.3.3, WIG]`: Stylesheet includes `@media (prefers-reduced-motion: reduce)` (`P-98`, `AP-55`).
- **`AN-02` (`CSS`, Error)** `[WIG, UIS:motion]`: Zero occurrences of `transition: all` (`P-95`, `AP-53`).
- **`AN-03` (`CSS`, Warning)** `[IMP:motion, UIS]`: UI transition durations do not exceed `350ms` (`500ms` hard ceiling, `P-96`, `AP-56`).
- **`AN-04` (`CSS`, Error)** `[UIS:motion, WIG]`: Transitions and animations target only `transform` and `opacity` (or `color`/`background-color`/`border-color`), never `width`, `height`, `top`, `left`, `margin`, or `padding` (`P-95`, `AP-54`).
- **`AN-05` (`CSS`, Warning)** `[IMP:motion, UIS]`: Zero bounce/elastic easing curves (`y2 > 1.05`) on productivity UI controls (`P-97`, `AP-57`).
- **`AN-06` (`CSS`, Warning)** `[WIG, UIS:motion]`: At most 1 active `backdrop-filter: blur()` layer per viewport (`P-71`, `AP-51`).
- **`AN-07` (`CSS`, Warning)** `[WIG, UIS:motion]`: Zero static `will-change` declarations on repeating cards or list items (`AP-62`).

### `SS` — State Completeness (`SS-01`..`SS-04`)

- **`SS-01` (`CSS`, Error)** `[IMP:interaction, WIG]`: Interactive controls define distinct `:hover`, `:focus-visible`, `:active`, and `:disabled` (`[aria-disabled="true"]`) styles (`P-90`).
- **`SS-02` (`DOM`, Warning)** `[IMP:interaction, UIS]`: Data-driven views (`table`, `feed`, `grid`, `chart`) provide an `empty` state with a clear explanation and primary CTA (`P-73`, `AP-77`).
- **`SS-03` (`DOM`, Warning)** `[IMP:interaction, WIG]`: Async views and forms provide a non-shifting `loading` state (skeleton or `[aria-busy="true"]` button, `P-89`, `P-106`).
- **`SS-04` (`DOM`, Warning)** `[IMP:interaction, LUX-06]`: Forms and data views provide an actionable `error` state with recovery instructions (`P-103`, `P-108`).

---

## 2. Human-Verified Craft Checklist (`HV-01`..`HV-34`)

Verify these 34 items visually at `375x812` (mobile) and `1440x900` (desktop):

1. **`HV-01`** `[FD, IMP]`: The screen expresses an unmistakable, domain-appropriate aesthetic direction rather than generic SaaS boilerplate.
2. **`HV-02`** `[IMP:spatial, P-09]`: Under the squint test, the primary focal point and single primary CTA dominate immediately.
3. **`HV-03`** `[RUI, P-01]`: Visual hierarchy relies on font weight and color contrast before font size jumps.
4. **`HV-04`** `[LUX-04, P-12]`: Related items sit closer to each other than to adjacent groups (`Proximity`).
5. **`HV-05`** `[RUI, P-59]`: Spacing and subtle surface steps replace unnecessary divider lines and box borders.
6. **`HV-06`** `[IMP:spatial, P-13]`: At least `25%` of the viewport remains open breathing room.
7. **`HV-07`** `[RUI, P-66]`: Nested rounded elements look optically concentric ($r_{\text{outer}} = r_{\text{inner}} + p$).
8. **`HV-08`** `[RUI, P-17]`: Icons, badges, and play triangles are optically centered relative to their text baseline or container.
9. **`HV-09`** `[RUI, P-76]`: Small vector icons sit inside `40px–48px` tinted badges rather than being scaled up crudely.
10. **`HV-10`** `[WIG, P-28]`: Numeric columns right-align with their headers and use `tabular-nums`.
11. **`HV-11`** `[IMP:typography, P-29]`: Headlines wrap cleanly (`text-wrap: balance`) with zero awkward single-word orphans.
12. **`HV-12`** `[IMP:color, P-45]`: Neutrals carry a cohesive warm or cool hue tint matching the brand primary.
13. **`HV-13`** `[IMP:color, P-54]`: If dark mode is supported, elevated surfaces step up in lightness with crisp `1px` highlights and desaturated accents.
14. **`HV-14`** `[UPM, P-50]`: Charts use the right chart type for the analytical question and remain distinguishable under deuteranopia/protanopia.
15. **`HV-15`** `[LUX-03, P-07]`: Top-level navigation and card density stay within Hick's (`<= 7` nav) and Miller's (`<= 4` data points per card) limits.
16. **`HV-16`** `[LUX-01]`: Navigation, search, and account controls sit in predictable landmarks (`Jakob's Law`).
17. **`HV-17`** `[LUX-02, P-100]`: Forms flow in a single vertical column with the submit CTA directly below the final input.
18. **`HV-18`** `[LUX-05, P-102]`: Inputs accept flexible user formatting and validate on blur/submit rather than punishing mid-keystroke.
19. **`HV-19`** `[LUX-06, P-108]`: Error states and completion states are human, blame-free, and provide an immediate next action.
20. **`HV-20`** `[IMP:ux-writing, P-107]`: Every button and link uses specific verb + object copy in Sentence case.
21. **`HV-21`** `[IMP:ux-writing, AP-90]`: All sample data, names, metrics, and timestamps read as authentic domain records.
22. **`HV-22`** `[WIG, P-33]`: Long dynamic strings (45-character names, German/Japanese translations) truncate or wrap cleanly without breaking sibling buttons.
23. **`HV-23`** `[EL, P-114]`: Narrowing the viewport from `1440px` to `320px` reflows grids and sidebars smoothly with zero horizontal overflow.
24. **`HV-24`** `[WIG, P-112]`: Mobile sticky bars respect `100dvh` and `env(safe-area-inset-bottom)`.
25. **`HV-25`** `[WIG, KB-04]`: Keyboard-only `Tab`, `Shift+Tab`, `Enter`, `Space`, and `Escape` operate every flow without mouse assistance.
26. **`HV-26`** `[IMP:motion, P-96]`: Micro-interactions feel crisp (`120ms–200ms`, exponential ease-out) with zero layout shift.
27. **`HV-27`** `[IMP:interaction, P-105]`: Destructive actions offer `Undo` or require explicit resource-named confirmation.
28. **`HV-28`** `[LUX-29]`: Zero dark patterns (no confirm-shaming, fake urgency, or hidden cancel paths).
29. **`HV-29`** `[ADM]`: Visual style adheres to the project's `DESIGN.md` and `tokens.json` contract.
30. **`HV-30`..`HV-34` (Japanese Locale `:lang(ja)`)** `[ADMJ]`:
    - `HV-30`: Japanese font stack renders clean Gothic/Mincho weights (`AdjustedYuGothic` on Windows).
    - `HV-31`: Body `line-height` (`1.75–1.90`) and `letter-spacing` (`>= 0.02em`) give kanji comfortable vertical air.
    - `HV-32`: Headings apply proportional kerning (`"palt" 1`) and `word-break: auto-phrase` (or `<wbr>` at semantic boundaries).
    - `HV-33`: Kinsoku (`line-break: strict`) prevents `。`, `、`, `」`, `）`, `ー`, `っ` from starting a line.
    - `HV-34`: Mixed-script (`混植`) numbers and acronyms use half-width ASCII with `tabular-nums` and zero synthetic italics.

---

## 3. Five-Dimension Audit Scoring Model (`/100`)

Score every audited screen across 5 dimensions of **20 points each**:

1. **Accessibility & Keyboard (`20 pts`)**: `ST-01`..`ST-05`, `A11Y-01`..`A11Y-19`, `CO-01`..`CO-03`, `KB-01`..`KB-07` (`-4 pts` per Error, `-1 pt` per Warning).
2. **Visual Hierarchy, Color & Typography (`20 pts`)**: `CO-04`..`CO-07`, `TY-01`..`TY-09`, `HV-01`..`HV-14`.
3. **Spatial Layout & Responsive Reflow (`20 pts`)**: `LY-01`..`LY-12`, `TG-01`..`TG-07`, `HV-22`..`HV-24`.
4. **Interaction, Forms & UX Heuristics (`20 pts`)**: `FM-01`..`FM-09`, `SS-01`..`SS-04`, `HV-15`..`HV-21`, `HV-27`..`HV-28`.
5. **Motion, Performance & Anti-Slop Craft (`20 pts`)**: `AN-01`..`AN-07`, `ST-06`..`ST-12`, `HV-26`, `HV-29` (`+ HV-30..34` for `:lang(ja)`).

- **Release Gate**: Total **`>= 85 / 100`** and **zero blocking `Error` violations** in
  `ST`, `A11Y`, `CO`, `KB`, `LY-01`, or `AN-01`.

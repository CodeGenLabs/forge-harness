# Full-Page Theme Reactivity, Zero-Literal i18n & 3-Pillar Mobile Optimization (`TH-01`..`TH-10`, `I18N-01`..`I18N-10`, `MOB-LY-01`..`08`, `MOB-PERF-01`..`06`, `MOB-UX-01`..`08`)

Distilled from `[RUI]`, `[EL]`, `[LUX]`, `[IMP]`, `[UPM]`, `[WIG]`, `[UIS]`, `[ADMJ]`, and `[WCAG]`
to eliminate the three most common systemic failures in AI-built front ends:
1. **Incomplete live theme switching** (`Primary`, `Neutral`, `Font`, `Icons`, `Radius`, `Light/Dark mode`) where parts of the page retain hardcoded styles.
2. **Hardcoded language strings** across frontend and backend leaving untranslated text when switching locales.
3. **Desktop-only layouts breaking on mobile (`320px-375px`)** across Layout (wrapped buttons, orphan words, crushed flex columns, horizontal overflow), Performance (CLS, unoptimized media, GPU overdraw), and Touch UX (tiny targets, iOS input zoom, hover traps).

---

## 1. Six-Axis Full-Page Theme Reactivity (`TH-01`..`TH-10`)

Every application or multi-theme interface exposes a **6-axis reactive token contract**
on `:root` (`document.documentElement`) in `references/tokens.css` so runtime changes
update 100% of the page simultaneously without unstyled islands:

| Axis | Root Token / Attribute | What Must React Across 100% of the Page |
|---|---|---|
| **1. Primary** | `--primary-hue` & `--color-primary-50..900` (`--color-primary`, `--color-on-primary`, `--color-focus-ring`) | Primary CTA buttons, active nav indicators, selected tabs, checked radio/checkbox/switch controls, focus rings, active links, primary chart series. |
| **2. Neutral** | `--neutral-hue`, `--neutral-chroma` & `--neutral-50..950` (`--color-bg`, `--color-surface*`, `--color-fg*`, `--color-border-*`) | Page canvas, cards, sidebars, modals, tables, dropdowns, skeletons, borders, dividers, and all 3 text hierarchy tiers. |
| **3. Font** | `--font-sans`, `--font-display`, `--font-mono` | Body copy, form inputs, buttons, headings, tables, tooltips, modals, and code/numeric blocks. |
| **4. Icons** | `--icon-stroke` (`1.5`..`2.0`) & `stroke="currentColor"` | All inline SVGs and icon components inherit text color via `currentColor` and stroke width via `var(--icon-stroke, 1.75)`. |
| **5. Radius** | `--radius-scale` (`0`..`1.5`) multiplying `--radius-xs..xl` | Buttons, inputs, cards, modals, dropdowns, alerts, and table wrappers scale proportionally (while badges/avatars using `--radius-full: 9999px` stay circular). |
| **6. Polarity** | `[data-theme="light\|dark"]` + `color-scheme: light\|dark` | Every surface, text tier, border, shadow, chart gridline, code block, and native browser scrollbar/datepicker switches cleanly. |

### Testable Theme Rules (`TH-01`..`TH-10`)

- **`TH-01` Ban hardcoded palette utilities in components (`CSS` / `DOM`)** `[UIS, IMP:color]`
  Never write static Tailwind/CSS palette classes (`bg-blue-600`, `text-slate-500`,
  `border-gray-200`, `bg-white`, `text-black`, `dark:bg-slate-900`) inside components.
  Always bind semantic tokens (`bg-[var(--color-primary)]`, `bg-[var(--color-surface)]`,
  `text-[var(--color-fg-secondary)]`, `border-[var(--color-border-subtle)]` or their
  `@theme` semantic aliases `bg-primary`, `bg-surface`, `text-foreground-secondary`).
- **`TH-02` Parameterized OKLCH hue & chroma scales (`CSS`)** `[RUI, IMP:color]`
  Derive `--neutral-50..950` from `var(--neutral-hue, 255)` and `--primary-50..900` from
  `var(--primary-hue, 258)` in `references/tokens.css` so updating a single CSS variable
  re-tints the entire 10-step scale in both light and dark modes.
- **`TH-03` Scalable concentric border-radius tokens (`CSS`)** `[RUI, UIS]`
  Define `--radius-xs` through `--radius-xl` using `calc(<base> * var(--radius-scale, 1))`.
  Setting `--radius-scale: 0` must turn every card, input, button, and modal sharp (`0px`)
  across the entire page (`--check-theme` radius mutation check).
- **`TH-04` Global font-family inheritance (`CSS`)** `[IMP:typography, WIG]`
  Declare `font-family: var(--font-sans)` on `body` and `font-family: inherit` on
  `button, input, select, textarea`. Never hardcode a `font-family` literal inside a
  child component or chart configuration.
- **`TH-05` Unified icon stroke and `currentColor` binding (`DOM` / `CSS`)** `[EL:Icon, UIS]`
  Every `<svg>` icon uses `stroke="currentColor"` (or `fill="currentColor"`) and
  `stroke-width: var(--icon-stroke, 1.75)`. Hardcoded hex strokes (`stroke="#1e293b"`)
  inside SVGs are banned because they turn invisible on dark surfaces or primary buttons.
- **`TH-06` Third-party & canvas/SVG chart theme synchronization (`DOM` / `CSS`)** `[UPM, IMP:color]`
  Charts, data grids, and portals (modals/toasts rendered under `<body>`) must read
  `getComputedStyle(document.documentElement)` or CSS custom properties (`var(--color-*)`)
  and re-render when `data-theme` or theme variables mutate.
- **`TH-07` Complete 6-axis Theme Settings UI control contract (`DOM` / `UX`)** `[UPM, UIS]`
  When a screen includes a Theme Customizer / Appearance Settings panel, it must expose
  accessible controls (`radiogroup` / segmented buttons) for all 6 axes (`Primary`,
  `Neutral`, `Font`, `Icon weight/style`, `Radius scale`, and `Light / Dark / System`),
  persist selections (`localStorage` + SSR cookie/head script to prevent FOUC), and
  provide a `Reset to defaults` action.
- **`TH-08` Zero Flash of Unstyled/Wrong Theme (`FOUC`) (`DOM`)** `[WIG]`
  Apply `data-theme` and custom property overrides in an inline `<head>` script or SSR
  root attribute before first paint, paired with `color-scheme: light dark`.
- **`TH-09` Automated Contrast Guard on Dynamic Primary Hues (`CSS`)** `[WCAG 1.4.3, RUI]`
  When `--primary-hue` shifts to high-luminance hues (`60deg-100deg` yellow/amber or
  `140deg-180deg` lime/cyan), adjust `--color-primary` lightness (`L <= 0.50` for white
  text, or switch `--color-on-primary` to dark ink `L = 0.16`) so button contrast never
  drops below `4.5:1`.
- **`TH-10` Runtime Theme Mutation Gate (`--check-theme` in `scripts/probe.mjs`) (`Visual` / `CSS`)** `[IMP, WIG]`
  During verification, `node scripts/probe.mjs <url> --check-theme` mutates `--primary-hue`,
  `--radius-scale`, `--font-sans`, and `data-theme="dark"` in the live browser and fails
  if any visible component retains a stale hardcoded surface, accent color, font family,
  or border radius (`unthemedElements`).

---

## 2. Zero-Literal Frontend & Backend Localization (`I18N-01`..`I18N-10`)

To guarantee that switching languages (`en` $\leftrightarrow$ `vi` $\leftrightarrow$ `ja`)
leaves zero untranslated text on the screen:

### Frontend Localization Rules (`I18N-01`..`I18N-06`)

- **`I18N-01` Zero hardcoded user-facing strings in templates or JSX (`DOM`)** `[WIG, IMP:ux-writing]`
  Every visible text node in `.vue`, `.tsx`, `.jsx`, or `.html` templates must resolve
  through the localization function (`$t('key')` / `t('key')`). Bare string literals inside
  headings, paragraphs, buttons, table headers, badges, or empty states are banned.
- **`I18N-02` Localize all accessible and form attributes (`DOM`)** `[WCAG 4.1.2, WIG]`
  Bind `placeholder`, `aria-label`, `title`, `alt`, and `aria-description` through the
  i18n dictionary (`:placeholder="$t('form.search.placeholder')"`). AI frequently translates
  visible `<label>` elements while leaving English `placeholder="Search..."` or
  `aria-label="Close"` untouched.
- **`I18N-03` Localize client-side validation, toasts, and modal dialogs (`DOM`)** `[IMP:ux-writing]`
  Validation schemas (Zod / VeeValidate / Yup), toast notifications, confirmation dialogs,
  and step indicators must resolve message keys at render/evaluation time (never freeze
  translated strings at module import time before locale switching occurs).
- **`I18N-04` Locale-aware dates, numbers, currencies, and plurals (`DOM`)** `[WIG]`
  Format all dates, relative times (`3 hours ago`), numbers (`1,234.56` vs `1.234,56`),
  and currencies via `Intl.DateTimeFormat(locale)`, `Intl.RelativeTimeFormat(locale)`,
  and `Intl.NumberFormat(locale)` plus ICU plural rules (`zero / one / other`).
- **`I18N-05` CSS resilience for text expansion (`+35%` to `+50%` width) (`CSS`)** `[EL, WIG]`
  Vietnamese and German strings expand `25%-45%` wider than English; Japanese kanji are
  denser horizontally but taller vertically (`line-height: 1.8`). Never set fixed `width`
  on buttons, tabs, or nav items; use `.l-cluster` with `min-inline-size` and padding.
- **`I18N-06` Synchronize `<html lang="...">` and typography rules on switch (`DOM` / `CSS`)** `[WCAG 3.1.1, ADMJ]`
  Switching the active locale must immediately update `document.documentElement.lang`
  (so `:lang(ja)` kinsoku rules and screen-reader pronunciation switch automatically).

### Backend & API Localization Rules (`I18N-07`..`I18N-10`)

- **`I18N-07` Backend APIs return structured `code` + `i18n_key` + `params`, never raw UI prose (`Artifact`)** `[LUX-05]`
  API error and status responses must return machine-readable identifiers and interpolation
  parameters:
  ```json
  {
    "error": {
      "code": "QUOTA_EXCEEDED",
      "i18nKey": "errors.billing.quotaExceeded",
      "params": { "limit": 50, "plan": "Starter" }
    }
  }
  ```
  The frontend translates `error.i18nKey` with `error.params` in the active locale. If the
  backend also formats localized strings (e.g., emails or PDF exports), it must read
  `Accept-Language` (or user profile locale) against the shared locale catalog.
- **`I18N-08` Translate database enums and status codes via dictionary namespaces (`DOM`)** `[IMP:ux-writing]`
  Never render raw backend enum values (`PENDING_APPROVAL`, `ROLE_ADMIN`, ` active `) into
  badges or table cells. Map every enum through `$t(\`enums.orderStatus.\${row.status}\`)`.
- **`I18N-09` 100% Key Parity & Zero Untranslated Fallback across Locale Files (`Artifact`)** `[WIG]`
  Every locale file (`locales/en.json`, `locales/vi.json`, `locales/ja.json`) must have
  the exact same nested key set:
  - Zero missing keys in any locale.
  - Zero empty string values (`""`).
  - Zero identical copy-pasted English sentences in non-English locale files (except
    explicitly allowlisted proper nouns/brand terms).
- **`I18N-10` Runtime Locale-Switch & Key-Leakage Gate (`--check-i18n` in `scripts/probe.mjs`) (`DOM`)** `[WIG]`
  `node scripts/probe.mjs <url> --check-i18n` scans the live DOM for:
  1. Leaked translation keys (`common.save`, `errors.auth.invalid`, `{{ ... }}`, `undefined`, `[object Object]`),
  2. Untranslated English attributes/buttons when `<html lang>` is non-English (`vi`, `ja`, etc.), and
  3. When two locale URLs or query params (`--check-i18n en,vi`) are supplied, flags any
     visible text node or attribute (`placeholder`, `aria-label`, `title`) that failed to
     translate between locales (`i18nIssues`).

---

## 3. Mandatory Three-Pillar Mobile Optimization (`320px-375px`)

Every screen must be designed and verified for mobile (`320px` and `375px` widths) across
three mandatory pillars: **Layout (`MOB-LY`)**, **Performance (`MOB-PERF`)**, and
**Touch UX (`MOB-UX`)**.

### Pillar A: Mobile Layout — Zero Text Drops, Zero Overflow (`MOB-LY-01`..`MOB-LY-08`)

- **`MOB-LY-01` Whole-control wrapping before internal label wrapping (`CSS`)** `[EL:Cluster, WIG]`
  Buttons, badges, filter pills, and tab triggers must set `white-space: nowrap` (unless
  explicitly a multi-line card button) and sit inside `.l-cluster` (`flex-wrap: wrap`).
  When viewport width narrows, the entire button drops cleanly to the next row instead of
  breaking its label into 2 cramped lines (`Save\nchanges`).
- **`MOB-LY-02` Prevent single-word orphan drops on the final line (`CSS` / `DOM`)** `[IMP:typography, WIG, ADMJ]`
  - Headings (`h1`-`h4`): apply `text-wrap: balance` (and `word-break: auto-phrase` for `:lang(ja)`).
  - Paragraphs and list items: apply `text-wrap: pretty`.
  - Keep indivisible compound tokens together (`100&nbsp;MB`, `24&nbsp;hours`, currency +
    amount, or `<span style="white-space: nowrap">`) so a trailing unit or single syllable
    never drops alone onto a new line (`orphanLastLineWords` in `probe.mjs`).
- **`MOB-LY-03` Prevent crushed vertical text columns in Flex/Grid rows (`CSS`)** `[EL:Sidebar,EL:Switcher]`
  Never place a text block beside multiple fixed badges/buttons in an non-wrapping flex
  row where the text column gets squeezed below `10ch` (`~80px`) on mobile (`crushedTextColumns`
  in `probe.mjs`). Use `.l-switcher` (`--threshold: 28rem`) or `flex-wrap: wrap` with
  `flex: 1 1 14rem` on the text container so auxiliary actions wrap underneath when narrow.
- **`MOB-LY-04` Safe truncation & long-token wrapping (`CSS`)** `[WIG, UIS]`
  - Every flex/grid child holding dynamic text declares `min-inline-size: 0` (`min-w-0`).
  - Long unbroken strings (URLs, emails, file paths, transaction hashes, UUIDs) declare
    `overflow-wrap: anywhere` so they never push container width past `100vw`.
- **`MOB-LY-05` Zero horizontal page overflow (`320px-1920px`) (`Visual` / `CSS`)** `[WCAG 1.4.10, WIG]`
  `document.documentElement.scrollWidth <= document.documentElement.clientWidth` at
  `320px`, `375px`, `768px`, `1024px`, and `1440px`. Never use fixed pixel widths
  (`width: 500px`); always use `inline-size: min(100%, 32rem)`.
- **`MOB-LY-06` Explicit mobile data-table strategy (`DOM` / `CSS`)** `[interface, RUI, WIG]`
  Wide tables on mobile (`< 640px`) must implement one of two patterns:
  1. **Comparison table**: Wrap in `.l-reel` (`overflow-x: auto; tabindex="0"`) with sticky
     first column (`position: sticky; inset-inline-start: 0; background: var(--color-surface)`).
  2. **Listing table**: Transform rows into structured mobile cards displaying the top 3-4
     fields with clear labels while preserving accessible semantics.
- **`MOB-LY-07` Fluid typography & compact mobile gutters (`CSS`)** `[EL, IMP:responsive]`
  Use `clamp()` fluid type tokens (`--text-xs`..`--text-4xl`) so `h1` scales from `~2.75rem`
  on desktop to `~1.75rem` on `375px` mobile without overflowing, and step outer page
  gutters from `24px-32px` down to `16px` (`--space-4`) on mobile so content retains
  `>= 88%` of viewport width.
- **`MOB-LY-08` Continuous viewport sweep (`1440px -> 320px`) (`Visual`)** `[WIG]`
  Layouts must hold at every intermediate width (`--sweep 1440,320,20` in `probe.mjs`),
  not just at `375px` and `1440px`.

### Pillar B: Mobile Performance — Fast Load, Zero CLS, 60fps Scroll (`MOB-PERF-01`..`MOB-PERF-06`)

- **`MOB-PERF-01` Zero Cumulative Layout Shift (`CLS = 0`) (`DOM` / `CSS`)** `[WIG, EL:Frame]`
  Every `<img>`, `<video>`, `<iframe>`, `<svg>`, and chart container declares explicit
  `width` and `height` attributes or sits inside `.l-frame` (`aspect-ratio: var(--n) / var(--d)`).
  Async data views render geometry-matched skeletons (`P-89`).
- **`MOB-PERF-02` Responsive & lazy media loading (`DOM`)** `[WIG]`
  - Below-the-fold images and iframes set `loading="lazy" decoding="async"`.
  - Above-the-fold hero LCP images set `fetchpriority="high"` (never `loading="lazy"`) and
    provide responsive `srcset` + `sizes` so mobile devices download appropriately sized WebP/AVIF assets.
- **`MOB-PERF-03` Compositor-only animations (`transform` & `opacity`) (`CSS`)** `[UIS:motion, WIG]`
  Mobile CPUs throttle layout recalculations heavily. Never animate `height`, `width`,
  `top`, `left`, `margin`, or `padding`; never use `transition: all`.
- **`MOB-PERF-04` Mobile GPU overdraw & blur budget (`CSS`)** `[UIS:motion, WIG]`
  Limit `backdrop-filter: blur()` to at most `1` small sticky bar or modal header on mobile
  (`<= 12px` blur radius), and ban decorative blurred background blobs (`filter: blur(60px+)`)
  that drain mobile battery and drop scroll frame rates.
- **`MOB-PERF-05` Offscreen rendering virtualization (`content-visibility: auto`) (`CSS`)** `[WIG]`
  Lists, feeds, or tables exceeding `30` rows apply `content-visibility: auto;
  contain-intrinsic-size: auto 72px` on row/card items to keep mobile initial render under `50ms`.
- **`MOB-PERF-06` Lightweight webfont budget (`<= 2` families, `font-display: swap`) (`CSS`)** `[IMP:typography, WIG]`
  Load at most 2 WOFF2 font families (`<= 4` weights total) with `font-display: swap` and
  metric-adjusted system fallbacks to eliminate Flash of Invisible Text (`FOIT`) on mobile networks.

### Pillar C: Mobile Touch & Interaction UX (`MOB-UX-01`..`MOB-UX-08`)

- **`MOB-UX-01` Minimum `44x44px` touch target & `>= 8px` clearance (`Visual` / `CSS`)** `[LUX-02, WCAG 2.5.8, IMP:responsive]`
  Every button, icon action, nav link, pagination control, checkbox, and radio row at
  `< 640px` viewport width has a hit box `>= 44x44px` (`2.75rem`) and `>= 8px` (`--space-2`)
  separation from adjacent targets.
- **`MOB-UX-02` `>= 16px` (`1rem`) font-size on all form controls (`CSS`)** `[WIG, IMP:responsive]`
  Every `<input>`, `<select>`, and `<textarea>` on mobile must have computed
  `font-size >= 16px` (`iosZoomInputs` check in `probe.mjs`). Any font size `< 16px` causes
  iOS Safari to forcibly zoom the viewport when the user taps the input.
- **`MOB-UX-03` Mobile-optimized virtual keyboards (`inputmode` & `autocomplete`) (`DOM`)** `[WIG, LUX-05]`
  Every text input declares the mobile keyboard matching its data type:
  - Phone: `type="tel" inputmode="tel" autocomplete="tel"`
  - Email: `type="email" inputmode="email" autocomplete="email" autocapitalize="none"`
  - OTP / PIN: `type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code"`
  - Price / Quantity: `type="text" inputmode="decimal"`
  - Search: `type="search" inputmode="search"`
- **`MOB-UX-04` Eliminate tap delay & hover-only traps (`CSS` / `DOM`)** `[WIG, IMP:responsive]`
  - Set `touch-action: manipulation` on interactive controls.
  - Wrap hover effects in `@media (hover: hover) and (pointer: fine)`.
  - Never hide row/card actions (`Edit`, `Delete`, `Share`) exclusively behind `:hover`;
    expose them directly or inside a `>= 44x44px` action menu trigger on touch devices.
- **`MOB-UX-05` Dynamic viewport height (`100dvh`) & Safe-Area insets (`CSS`)** `[WIG, UIS]`
  - Replace all `100vh` with `100dvh` so mobile address bars never clip bottom buttons.
  - Pad fixed bottom bars and sheets with `padding-bottom: max(var(--space-4), env(safe-area-inset-bottom))`.
- **`MOB-UX-06` Thumb-zone navigation & bottom sheets on mobile (`DOM` / `UX`)** `[LUX-02, IMP:responsive]`
  On `< 640px` viewports, collapse wide desktop navigation into a bottom tab bar (`<= 5`
  items) or a slide-over drawer with a `>= 44x44px` trigger, and present complex pickers or
  filters as bottom sheets anchored in the natural thumb arc.
- **`MOB-UX-07` Single-column mobile forms with inline scroll-to-error (`DOM` / `UX`)** `[LUX, WIG]`
  Stack all form fields in 1 vertical column on mobile, keep sticky/final submit CTAs
  immediately reachable, and automatically scroll + focus the first invalid field on submit.
- **`MOB-UX-08` Immediate tactile `:active` feedback (`< 100ms`) (`CSS`)** `[LUX-10, IMP:interaction]`
  Provide an instant `:active` visual response (`transform: scale(0.98)` or surface lightness
  shift) on every touch control so users never double-tap out of uncertainty.

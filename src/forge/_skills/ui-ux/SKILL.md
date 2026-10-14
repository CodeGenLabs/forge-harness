---
name: ui-ux
phase: implement
description: >
  Design, build, critique, polish, and document high-craft UI/UX screens and
  design systems using the distilled 10-source knowledge base, Every Layout
  primitives, OKLCH tokens, and deterministic verification.
requires-kernel: ["forge verify"]
reads: from-dag
writes: []
---

# ui-ux - deterministic interface design, construction, and audit

## Announce

> Running `ui-ux`: routing interface work through the distilled 10-source UI/UX knowledge base.

## What this does

This skill turns interface requests into verifiable engineering and design decisions.
Every rule in its companion knowledge base is concrete, testable (`DOM`, `CSS`,
`Visual`, or `Artifact`), and attributed to its upstream source in `references/sources.md`.

## 0. Route the request to one of seven actions

Match the user's request to the appropriate action procedure in `references/workflows.md`:

| Action | When to use | Primary companion references |
|---|---|---|
| `design-system` | Generate or update `tokens.json`, `tokens.css`, and `DESIGN.md` for a product or brand | `references/design-system.md`, `references/tokens.css`, `references/typography-ja.md` |
| `wireframe` | Explore 1-3 grayscale structural options (`A`, `B`, `C`) and score against the 100-point rubric (`R1`-`R8`) | `references/ux-heuristics.md`, `references/layout-primitives.md`, `references/primitives.css` |
| `mockup` | Build a production-ready screen, application view, or prototype | `references/principles.md`, `references/anti-patterns.md`, `references/theme-i18n-mobile.md`, `references/stacks-vue-nuxt.md` |
| `refine-block` | Redesign or repair a single `[data-block]` section or component in isolation | `references/principles.md`, `references/anti-patterns.md`, `references/theme-i18n-mobile.md` |
| `critique` | Run an unanchored holistic review (Nielsen 10 heuristics, 5 personas) plus the 126-rule deterministic audit | `references/workflows.md`, `references/audit-checklist.md`, `references/ux-heuristics.md` |
| `polish` | Execute the 5-tier pre-ship craft pass (alignment, type, contrast, states, motion) without a concealed redesign | `references/workflows.md`, `references/audit-checklist.md`, `references/theme-i18n-mobile.md` |
| `document` | Extract an existing codebase's design system (`Scan`) or formalize a brief (`Seed`) into `DESIGN.md` | `references/workflows.md`, `references/design-system.md`, `references/typography-ja.md` |

## 1. Audit codebase reality before writing code

Before generating markup or styles, inspect three layers of the repository:

1. **Stack and component library:** Check `package.json` and project configs. For Vue 3,
   Nuxt, `@nuxt/ui`, `shadcn-vue`, and Tailwind CSS v4 (`@theme`), follow the token and
   component bindings in `references/stacks-vue-nuxt.md`.
2. **Existing components and i18n dictionary:** Reuse the repository's existing primitives
   (`Button`, `Card`, `Table`, `Dialog`, `FormField`) and localization catalog (`locales/*.json`)
   rather than introducing duplicate wrappers or hardcoded strings.
3. **Design tokens and `DESIGN.md`:** Read existing CSS custom properties or `DESIGN.md`.
   When none exist, adopt `references/tokens.css`, `references/primitives.css`, and the
   domain palettes and font pairings in `references/design-system.md`. For Japanese
   interfaces (`:lang(ja)`), apply `references/typography-ja.md`.

State the detected stack, token source, and chosen action mode in one concise line.

## 2. Enforce the 15-rule pre-write craft floor

Every built or refined interface obeys `references/anti-patterns.md`,
`references/principles.md`, and `references/theme-i18n-mobile.md`:

1. **Semantic landmarks (`ST-01`..`ST-04`):** Include `<header>`, `<main id="main">`, a
   skip link (`<a href="#main">`), and a non-skipping `<h1>`..`<h6>` outline.
2. **Intrinsic layout without viewport breakpoints (`LP-01`..`LP-19`):** Compose layouts
   with Every Layout primitives from `references/primitives.css` (`.l-stack`, `.l-box`,
   `.l-center`, `.l-cluster`, `.l-sidebar`, `.l-switcher`, `.l-cover`, `.l-grid`,
   `.l-frame`, `.l-reel`, `.l-imposter`, `.l-icon`, `.l-container`).
3. **Six-axis full-page theme reactivity (`TH-01`..`TH-10`):** Bind all colors, surfaces,
   fonts, icons (`stroke="currentColor"` + `--icon-stroke`), radii (`--radius-scale`),
   and light/dark polarity (`[data-theme="dark"]`) to `references/tokens.css`. Never write
   hardcoded palette classes (`bg-blue-600`, `bg-white`, `text-gray-500`) that leave
   unstyled islands when theme settings change.
4. **Zero-literal frontend and backend localization (`I18N-01`..`I18N-10`):** Route 100%
   of user-facing text, `placeholder`, `aria-label`, `title`, `alt`, validation messages,
   and backend error/enum codes through the localization dictionary with 100% key parity
   across locales.
5. **60-30-10 surface budget and single primary action (`P-07`, `P-40`, `LUX-08`):** Keep
   `>= 60%` of the viewport neutral surface, `~30%` secondary structure, `<= 10%` accent
   fill, and at most one solid primary button per view.
6. **Measure and fluid typography (`P-22`..`P-30`):** Constrain prose and forms to
   `45ch-75ch` (`--measure: 65ch`), use `clamp()` fluid type tokens, and apply
   `font-variant-numeric: tabular-nums` to all numeric data.
7. **Proximity and concentric geometry (`P-12`, `P-60`, `P-66`):** Keep internal padding
   smaller than external group gaps (`>= 1.5x` outer-to-inner ratio), enforce concentric
   radii ($r_{\text{outer}} = r_{\text{inner}} + p$), and never nest bordered cards inside
   bordered cards.
8. **Mobile Pillar A - Layout (`MOB-LY-01`..`08`):** Zero horizontal overflow from
   `320px` to `1920px`; buttons and badges set `white-space: nowrap` inside `.l-cluster`
   so whole controls wrap before labels split; headings use `text-wrap: balance` and
   paragraphs use `text-wrap: pretty` to prevent single-word orphan drops; flex text
   columns never crush below `10ch`.
9. **Mobile Pillar B - Performance (`MOB-PERF-01`..`06`):** Zero CLS (explicit `width` +
   `height` or `.l-frame` `aspect-ratio` on all media), `loading="lazy" decoding="async"`
   on below-the-fold images, compositor-only transitions (`transform`, `opacity`), at
   most one `backdrop-filter: blur()`, and `content-visibility: auto` on long lists.
10. **Mobile Pillar C - Touch UX (`MOB-UX-01`..`08`):** Touch targets `>= 44x44px` with
    `>= 8px` gap on `< 640px` viewports, `<input>`/`<select>`/`<textarea>` `font-size >= 16px`
    (preventing iOS auto-zoom), matching `inputmode` and `autocomplete`, `touch-action: manipulation`,
    zero hover-only actions, and `100dvh` + `env(safe-area-inset-bottom)`.
11. **Accessible forms (`P-99`..`P-108`):** Pair every input with a visible `<label>`,
    stack fields in a single vertical column, validate on `blur` or `submit`, and bind
    actionable inline errors via `aria-invalid` and `aria-describedby`.
12. **Complete 8 interactive states (`P-90`):** Implement `default`, `hover`,
    `focus-visible`, `active`, `disabled`, `loading`, `empty`, and `error`.
13. **Zero AI slop signatures (`AP-85`..`AP-97`):** No purple-to-blue gradient cliches,
    no gradient heading text, no three identical icon-in-circle cards, no emoji UI icons,
    and no placeholder `Lorem ipsum` or `John Doe` copy.

## 3. Verify and exit

Before claiming completion:

1. Check the output against `references/audit-checklist.md` and `references/theme-i18n-mobile.md`.
2. When a live URL or HTML file and Playwright are available, run `scripts/probe.mjs`
   across mobile (`320px`, `375px`) and desktop (`1440px`) viewports with `--sweep`,
   `--check-theme`, and `--check-i18n`.
3. Run `forge verify` to confirm all project verification gates pass.

## Exit

Report:
- Action mode executed and companion references applied.
- How 6-axis theme reactivity, i18n completeness, and 3-pillar mobile rules were satisfied.
- Audit score or `forge verify` result.

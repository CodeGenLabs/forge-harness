# Distilled 10-source UI/UX knowledge base and theme/i18n/mobile enforcement in the ui-ux skill

## Purpose

Upgrade the packaged `ui-ux` skill with a deterministic, source-attributed knowledge
base distilled from ten canonical UI/UX design sources and enforce full-page 6-axis
theme reactivity, zero-literal frontend/backend localization (`i18n`), and 3-pillar
mobile optimization (layout, performance, and touch UX) across the skill references and
browser probe.

## ADDED Requirements

### Requirement: REQ-ui-ux-ten-source-kb - The ui-ux skill ships the distilled 10-source knowledge base

The packaged `ui-ux` skill SHALL ship English companion files under `references/` that
cover all ten canonical UI/UX design domains and standards (`IMP`, `FD`, `UPM`, `UIS`,
`WIG`, `ADM`, `ADMJ`, `EL`, `RUI`, `LUX`, and `WCAG`), where every rule is written in
original English prose, specifies a concrete checkable condition, and cites its domain
code.

#### Scenario: Core knowledge base files exist and cite sources

- Given the packaged `ui-ux` skill directory `src/forge/_skills/ui-ux`
- When its `references/` directory is inspected
- Then `principles.md`, `anti-patterns.md`, `layout-primitives.md`, `ux-heuristics.md`, `audit-checklist.md`, `typography-ja.md`, `design-system.md`, `workflows.md`, `stacks-vue-nuxt.md`, `theme-i18n-mobile.md`, `sources.md`, `primitives.css`, and `tokens.css` all exist
- And `sources.md` documents all domain citation codes (`RUI`, `EL`, `LUX`, `IMP`, `UPM`, `WIG`, `UIS`, `FD`, `ADM`, `ADMJ`, `WCAG`)

#### Scenario: Every Layout primitives and OKLCH tokens are shipped

- Given `references/layout-primitives.md`, `references/primitives.css`, and `references/tokens.css` under `ui-ux`
- When their contents are inspected
- Then `primitives.css` defines all twelve intrinsic layout primitives (`.l-stack`, `.l-box`, `.l-center`, `.l-cluster`, `.l-sidebar`, `.l-switcher`, `.l-cover`, `.l-grid`, `.l-frame`, `.l-reel`, `.l-imposter`, `.l-icon`) without viewport `@media` queries
- And `tokens.css` defines parameterized 6-axis tokens (`--primary-hue`, `--neutral-hue`, `--radius-scale`, `--icon-stroke`, `--font-sans`, and `[data-theme="dark"]`) in `oklch(...)`

#### Scenario: Laws of UX heuristics, Japanese typography, and Vue/Nuxt stack guides are present

- Given `references/ux-heuristics.md`, `references/typography-ja.md`, and `references/stacks-vue-nuxt.md`
- When their contents are inspected
- Then `ux-heuristics.md` defines `LUX-01` through `LUX-10` and the 100-point wireframe review rubric (`R1` through `R8`)
- And `typography-ja.md` defines Japanese kinsoku (`line-break: strict`), mixed-script, and OpenType `palt`/`tnum` rules (`JA-01` through `JA-61`)
- And `stacks-vue-nuxt.md` maps semantic tokens to Vue 3, Nuxt, Nuxt UI v4 (`@nuxt/ui`), shadcn-vue, and Tailwind CSS v4 (`@theme`)

### Requirement: REQ-ui-ux-studio-workflows - The ui-ux skill routes studio and harness actions

The `ui-ux` skill's `SKILL.md` and `references/workflows.md` SHALL define actionable
procedures for `design-system`, `wireframe`, `mockup`, `refine-block`, `critique`,
`polish`, and `document`, obeying all five `forge skill check` rules and containing
zero Vietnamese-specific letters or external repository branding across all companion files.

#### Scenario: SKILL.md routes all seven studio actions and passes skill check

- Given the packaged `ui-ux` skill
- When `forge skill check` runs
- Then zero errors are reported for `ui-ux`
- And `SKILL.md` names `design-system`, `wireframe`, `mockup`, `refine-block`, `critique`, `polish`, and `document` along with `scripts/probe.mjs` and `forge verify`

#### Scenario: Companion files are self-contained and free of external repository branding

- Given every markdown, HTML, and CSS file under `src/forge/_skills/ui-ux`
- When its contents are scanned
- Then it contains zero Vietnamese characters and zero external repository names

### Requirement: REQ-ui-ux-theme-i18n-mobile-gates - The harness enforces 6-axis theme reactivity, zero-literal i18n, and 3-pillar mobile optimization

The `ui-ux` skill (`SKILL.md`, `references/theme-i18n-mobile.md`, `references/audit-checklist.md`,
and `scripts/probe.mjs`) and the `interface` skill (`src/forge/_skills/interface/SKILL.md`)
SHALL enforce:
1. Full-page 6-axis theme reactivity (`Primary`, `Neutral`, `Font`, `Icons`, `Radius`,
   `Light/Dark mode`, rules `TH-01`..`TH-10`) so theme changes leave zero hardcoded elements behind;
2. Zero-literal frontend and backend localization (`I18N-01`..`I18N-10`) so language
   switching leaves zero untranslated strings, attributes, or raw translation keys; and
3. Mandatory 3-pillar mobile responsiveness at `320px-375px` across Layout (`MOB-LY-01`..`08`:
   zero wrapped buttons/badges, zero orphan word drops, zero crushed flex text columns,
   zero horizontal overflow), Performance (`MOB-PERF-01`..`06`: zero CLS, lazy media,
   compositor-only motion, single blur cap), and Touch UX (`MOB-UX-01`..`08`: `>= 44x44px`
   targets, `>= 16px` input font against iOS auto-zoom, `inputmode`, `100dvh` + safe-area).

#### Scenario: Theme, i18n, and mobile rules are documented and linked

- Given `src/forge/_skills/ui-ux/references/theme-i18n-mobile.md` and `src/forge/_skills/interface/SKILL.md`
- When their contents are inspected
- Then `theme-i18n-mobile.md` defines `TH-01`..`TH-10`, `I18N-01`..`I18N-10`, `MOB-LY-01`..`MOB-LY-08`, `MOB-PERF-01`..`MOB-PERF-06`, and `MOB-UX-01`..`MOB-UX-08`
- And both `ui-ux/SKILL.md` and `interface/SKILL.md` require 6-axis theme reactivity, zero-literal i18n, and 3-pillar mobile verification

#### Scenario: probe.mjs supports theme mutation, i18n leakage, and mobile 3-pillar checks

- Given `src/forge/_skills/ui-ux/scripts/probe.mjs`
- When its source is checked with `node --check` and inspected
- Then it supports `--check-theme` and `--check-i18n` CLI flags
- And it detects `iosZoomInputs`, `crushedTextColumns`, `orphanLastLineWords`, `mobilePerfIssues`, `i18nIssues`, and `unthemedElements`

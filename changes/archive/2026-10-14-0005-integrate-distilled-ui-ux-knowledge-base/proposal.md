# Proposal - integrate the distilled 10-source UI/UX knowledge base into the ui-ux skill

## Why

Change 0003 shipped the `ui-ux` skill with 49 fragmented companion files. We now upgrade
`ui-ux` into a unified, domain-attributed, deterministic knowledge base covering ten
core UI/UX design domains and standards:

1. `[IMP]` Craft & Polish Discipline (craft references across typography, color, spatial
   layout, motion, interaction, responsive, UX writing; anti-pattern detector rules;
   `critique`, `polish`, and `document` commands)
2. `[FD]` Aesthetic Direction & Anti-Convergence (aesthetic commitment and canonical
   `SKILL.md` progressive disclosure)
3. `[UPM]` Design-System Synthesis & Stack Matrix (curated industry palettes, font
   pairings, chart selection and accessibility rules, UX guidelines, design-system
   generation mechanism, and stack mappings prioritizing Vue, Nuxt, Nuxt UI,
   shadcn-vue, and Tailwind CSS)
4. `[UIS]` Baseline UI & Motion Constraints (baseline UI consistency constraints,
   accessibility fixes, and motion-performance gates)
5. `[WIG]` Web Interface & Accessibility Audit (audit rules across accessibility,
   keyboard navigation, forms, animation, and performance)
6. `[ADM]` Canonical `DESIGN.md` Specification (`DESIGN.md` format with YAML
   frontmatter, 8 canonical sections, and 5 real-world brand exemplars: Linear, Vercel,
   Stripe, Notion, and The Verge)
7. `[ADMJ]` Japanese Typography & `DESIGN.ja.md` (Japanese `DESIGN.ja.md` template and
   Japanese typography rules: font stacks, `AdjustedYuGothic`, line-height/letter-spacing
   profiles, `palt`/`tnum`, kinsoku `line-break: strict`, and mixed-script rules)
8. `[EL]` *Every Layout* Intrinsic CSS Primitives (12 intrinsic CSS layout primitives +
   `.l-container` that compose responsive layouts without viewport media queries)
9. `[RUI]` *Refactoring UI* Visual Hierarchy & Scale (visual hierarchy, spacing scales,
   OKLCH tonal color scales, and elevation/depth principles)
10. `[LUX]` *Laws of UX* Cognitive Heuristics (10 core UX laws, 19 sub-concepts,
    scriptable wireframe checks, and the 100-point wireframe/mockup review rubric)

Replacing `src/forge/_skills/ui-ux/references/` with this unified knowledge base upgrades
`forge`'s `ui-ux` skill to a rigorous, domain-cited engineering and design reference
where every rule is concrete and checkable (`DOM`, `CSS`, `Visual`, or `Artifact`).

## What changes

- Replace the legacy 49 reference files under `src/forge/_skills/ui-ux/references/`
  with 13 cohesive, self-contained English companion files:
  - `references/principles.md` (`P-01`..`P-114` + conflict resolutions `C-01`..`C-25`)
  - `references/anti-patterns.md` (`AP-01`..`AP-105` + craft-floor pre-write gates)
  - `references/layout-primitives.md` (`LP-01`..`LP-19` + 12 Every Layout primitives
    + `.l-container` + composition recipes)
  - `references/ux-heuristics.md` (`LUX-01`..`LUX-29` + scriptable UX checks +
    100-point wireframe/mockup rubric `R1`–`R8` + wireframe conventions `WF-01`..`WF-72`)
  - `references/audit-checklist.md` (126-rule automated + human-verified audit
    checklist across `ST`, `A11Y`, `CO`, `KB`, `TG`, `FM`, `LY`, `TY`, `AN`, `SS`,
    `HV` + 5-dimension `/20` scoring rubric)
  - `references/typography-ja.md` (`JA-01`..`JA-61` Japanese typography, kinsoku,
    mixed-script, and `AdjustedYuGothic` CSS)
  - `references/design-system.md` (DTCG `tokens.json` schema, contrast pairs,
    `DESIGN.md` & `DESIGN.ja.md` templates, 5 reference brand exemplars, and curated
    palette/font/chart seed tables)
  - `references/workflows.md` (action procedures: `design-system`, `wireframe`,
    `mockup`, `refine-block`, `critique`, `polish`, and `document`)
  - `references/stacks-vue-nuxt.md` (token-to-framework bridges prioritizing Vue 3,
    Nuxt, Nuxt UI v4, shadcn-vue, and Tailwind CSS v4 `@theme`, plus multi-library
    reference matrix)
  - `references/theme-i18n-mobile.md` (6-axis theme reactivity `TH-01`..`TH-10`,
    zero-literal frontend/backend i18n `I18N-01`..`I18N-10`, and 3-pillar mobile
    optimization `MOB-LY-01`..`08`, `MOB-PERF-01`..`06`, `MOB-UX-01`..`08`)
  - `references/sources.md` (domain registry and citation codes)
  - `references/primitives.css` (copy-ready stylesheet implementing the 12 Every
    Layout primitives + `.l-container` + `.u-visually-hidden`)
  - `references/tokens.css` (6-axis parameterized OKLCH semantic design tokens, fluid
    `@utopia` type scale, spacing scale, elevation, and motion tokens)
- Update `src/forge/_skills/ui-ux/SKILL.md` (English, `<= 250` lines, passing all 5
  skill linter rules) to route across the 7 harness modes (`design-system`,
  `wireframe`, `mockup`, `refine-block`, `critique`, `polish`, `document`) and link
  every companion file.
- Update `src/forge/_skills/interface/SKILL.md` so its companion links match the new
  distilled `ui-ux` reference layout while keeping `scripts/probe.mjs` as a candidate
  for `commands.ui`.
- Update `tests/test_skills.py` to verify the distilled knowledge base, rule-ID
  coverage, domain citations, and absence of Vietnamese characters or external repo
  branding.

## Capabilities

- Modified: `src/forge/_skills/ui-ux/SKILL.md` and `src/forge/_skills/ui-ux/references/**`
- Modified: `src/forge/_skills/interface/SKILL.md`
- Modified: `tests/test_skills.py`
- Regenerated: `.agent/skills/**` and `docs/system/derived/**`

## Not in this change

- Shipping raw multi-megabyte CSV files inside the Python wheel: datasets are distilled
  into concise markdown tables in `references/design-system.md` and
  `references/stacks-vue-nuxt.md`.
- Modifying `src/forge/skills.py`, `src/forge/scaffold.py`, or `src/forge/hosts.py`:
  the companion-file shipping and `skill.missing_reference` check added in change 0003
  already support the new companion files without kernel changes.

# Design - integrate the distilled 10-source UI/UX knowledge base

## Approach

Instead of carrying 49 fragmented component files from a single upstream kit or dumping
raw CSV datasets into the Python wheel, we structure `src/forge/_skills/ui-ux/references/`
into 10 topic-focused Markdown files plus 2 reference CSS files (`primitives.css` and
`tokens.css`):

1. **`references/principles.md`**:
   - Consolidates visual hierarchy, non-linear spacing scales, typography (`45ch–75ch`
     measure, fluid `@utopia` clamp scale, `tabular-nums`, dark-mode weight adjustment),
     OKLCH color systems (60-30-10 rule, hue-shifted neutrals, 9-step tonal scales,
     banned pure black/gray), elevation/borders/radii (concentric radius formula
     `r_outer = r_inner + padding`), imagery/icons, and 8 interactive states
     (`P-01`..`P-114`), plus the 25 cross-source conflict resolutions (`C-01`..`C-25`).
2. **`references/anti-patterns.md`**:
   - Catalogs deterministic anti-patterns (`AP-01`..`AP-105`) with concrete DOM/CSS
     detector logic and thresholds across typography, color, layout, motion,
     interaction, AI slop signatures, and dark mode, preceded by the 12-rule craft
     floor pre-write gate.
3. **`references/layout-primitives.md` + `references/primitives.css` + `references/tokens.css`**:
   - Documents intrinsic layout rules (`LP-01`..`LP-19`), the 12 Every Layout primitives
     (`.l-stack`, `.l-box`, `.l-center`, `.l-cluster`, `.l-sidebar`, `.l-switcher`,
     `.l-cover`, `.l-grid`, `.l-frame`, `.l-reel`, `.l-imposter`, `.l-icon`) plus
     `.l-container`, and screen composition recipes without viewport `@media` queries.
   - Ships copy-ready CSS in `references/primitives.css` and OKLCH semantic tokens in
     `references/tokens.css`.
4. **`references/ux-heuristics.md`**:
   - Distills all 10 chapters of *Laws of UX* (`LUX-01`..`LUX-10`) and 19 related UX
     heuristics (`LUX-11`..`LUX-29`), scriptable DOM/CSS checks, the 100-point
     wireframe/mockup rubric (`R1`–`R7` + `R8`), and wireframe/prototype conventions
     (`WF-01`..`WF-72`, 3-option structural diversity `A/B/C`).
5. **`references/audit-checklist.md`**:
   - Provides the 126-rule verification suite: 92 automated rules across 10 categories
     (`ST`, `A11Y`, `CO`, `KB`, `TG`, `FM`, `LY`, `TY`, `AN`, `SS`) and 34 human-verified
     items (`HV-01`..`HV-34`), plus the 5-dimension `/20` scoring model (100 points total).
6. **`references/typography-ja.md`**:
   - Defines Japanese typography rules (`JA-01`..`JA-61`): Japanese font stacks,
     `AdjustedYuGothic` `@font-face` descriptor, line-height (`1.75–1.90` body,
     `1.25–1.40` heading), letter-spacing (`>= 0` on body), OpenType `palt`/`tnum`,
     kinsoku (`line-break: strict; overflow-wrap: anywhere; word-break: auto-phrase`),
     and mixed-script (混植) formatting.
7. **`references/design-system.md`**:
   - Defines DTCG `tokens.json` schema (`$value`, `$type`), required contrast pairs,
     curated seed tables (product palettes in OKLCH+hex, font pairings, chart selection
     and colorblind safety), the canonical `DESIGN.md` format (YAML frontmatter + 8
     sections + `Agent Prompt Guide` + `Known Gaps`), the Japanese `DESIGN.ja.md`
     template, and 5 real-world brand exemplars (`Linear`, `Vercel`, `Stripe`, `Notion`,
     `The Verge`).
8. **`references/workflows.md`**:
   - Maps studio and craft commands into concrete step-by-step harness actions:
     `design-system`, `wireframe`, `mockup`, `refine-block`, `critique` (unanchored first
     impression, Nielsen 10 heuristics `/40`, cognitive load checklist, 5 personas, AI
     slop assessment, P0–P3 synthesis), `polish` (5-tier triage and path refinement
     without concealed redesign), and `document` (Scan mode and Seed mode).
9. **`references/stacks-vue-nuxt.md`**:
   - Prioritizes Vue 3, Nuxt, Nuxt UI v4 (`@nuxt/ui` `app.config.ts` + `@theme`),
     shadcn-vue (`reka-ui`), and Tailwind CSS v4 (`@theme`), followed by a concise
     mapping matrix for Vuetify, PrimeVue (noting the v5 license restriction), Element
     Plus, MUI, and Ant Design.
10. **`references/sources.md`**:
    - Documents domain registry and citation codes for all 11 codes.

## Alternatives rejected

- **Keep the 49 legacy files and append the new references beside them.** Creates
  conflicting rule IDs (`U1` vs `P-01`/`AP-01`), duplicates layout and token rules, and
  bloats the skill directory. User explicitly selected Option 1 (full replacement of
  `references/`).
- **Ship raw CSV files in the wheel.** Adds unnecessary bulk and rigid CSV parsing
  requirements when agents consume distilled markdown tables directly.

## Risks

- **`forge skill check` false positives on `SKILL.md`.** Mitigated by verifying
  `SKILL.md` line count (`<= 250`), ensuring no multi-word all-caps phrases outside
  `_SHOUT_ALLOWED` appear in prose, avoiding banned host-specific words, and ensuring
  every `references/...` and `scripts/...` path mentioned in `SKILL.md` resolves to an
  actual file.
- **Orphan files in `.agent/skills/ui-ux/references/`.** `forge skill export antigravity`
  writes current companion files, so we must also delete the removed legacy files from
  `.agent/skills/ui-ux/references/` before running `forge skill export antigravity`.

## ADR

None. The companion-file architecture established in change 0003 remains unchanged.

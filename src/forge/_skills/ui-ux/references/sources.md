# UI/UX Knowledge Base Domain Registry & Citation Codes

Every rule in the `ui-ux` companion references is written in original prose, states a
concrete, testable condition (`DOM`, `CSS`, `Visual`, or `Artifact`), and cites one or
more of the canonical domain codes below plus the W3C accessibility baseline.

## Domain & Citation Registry

| Code | Domain / Standard | Scope & Coverage | Verification Scope |
|---|---|---|---|
| `[IMP]` | Craft & Polish Discipline | 7 craft reference domains (`typography`, `color-and-contrast`, `spatial-design`, `motion-design`, `interaction-design`, `responsive-design`, `ux-writing`), deterministic anti-pattern thresholds, and the `critique`, `polish`, and `document` action workflows | `DOM`, `CSS`, `Visual`, `Artifact` |
| `[FD]` | Aesthetic Direction & Anti-Convergence | Pre-code aesthetic direction commitment, differentiation anchor, anti-convergence rules against generic AI fonts/palettes, and progressive-disclosure skill organization | `CSS`, `Visual`, `Artifact` |
| `[UPM]` | Design-System Synthesis & Stack Matrix | Industry color palettes (OKLCH + hex), font pairings, chart selection and colorblind safety rules, 99 UX guidelines (`ux#1`–`ux#99`), design-system synthesis pipeline, and stack guides prioritizing Vue, Nuxt, Nuxt UI, shadcn-vue, and Tailwind CSS | `DOM`, `CSS`, `Artifact` |
| `[UIS]` | Baseline UI & Motion Constraints | Baseline UI consistency constraints, accessibility remediation, compositor-only motion performance, component refinement, and design specification authoring | `DOM`, `CSS` |
| `[WIG]` | Web Interface & Accessibility Audit | Audit checklist rules across accessibility, keyboard navigation, focus rings, forms, animation performance, typography (`tabular-nums`, `text-wrap: balance`, curly quotes), and dark-mode `color-scheme` | `DOM`, `CSS` |
| `[ADM]` | Canonical `DESIGN.md` Specification | Canonical `DESIGN.md` format (YAML frontmatter + 8 sections + `Agent Prompt Guide` + `Known Gaps`) and 5 real-world brand reference exemplars (`linear.app`, `vercel`, `stripe`, `notion`, `theverge`) | `Artifact` |
| `[ADMJ]` | Japanese Typography & `DESIGN.ja.md` | Japanese `DESIGN.ja.md` template and Japanese typography rules (`JA-01`..`JA-61`: font stacks, `AdjustedYuGothic` `@font-face`, line-height/letter-spacing profiles, OpenType `palt`/`tnum`, kinsoku `line-break: strict`, and mixed-script spacing) | `DOM`, `CSS`, `Artifact` |
| `[EL]` | *Every Layout* Intrinsic CSS Primitives | Axiom of `60ch` measure, intrinsic algorithmic layout without viewport media queries, and the 12 CSS layout primitives (`Stack`, `Box`, `Center`, `Cluster`, `Sidebar`, `Switcher`, `Cover`, `Grid`, `Frame`, `Reel`, `Imposter`, `Icon`) plus `.l-container` | `CSS`, `Visual` |
| `[RUI]` | *Refactoring UI* Visual Hierarchy & Scale | Visual hierarchy via weight/contrast before size, non-linear spacing and type scales, 9–10 step tonal color scales, hue/saturation shifts at lightness extremes, elevation via two-part shadows or surface lightness in dark mode, and border minimization | `CSS`, `Visual` |
| `[LUX]` | *Laws of UX* Cognitive Heuristics | 10 core psychological UX laws (`LUX-01` Jakob's Law through `LUX-10` Miller's Law), 19 related UX concepts (`LUX-11`..`LUX-29`), scriptable DOM/CSS heuristics, and the 100-point wireframe/mockup review rubric (`R1`–`R8`) | `DOM`, `CSS`, `Visual`, `Artifact` |
| `[WCAG]` | W3C WCAG 2.1 / 2.2 Level AA & AAA & W3C DTCG | Contrast ratios (`4.5:1` body text, `3:1` large text and non-text UI), target size (`24x24px` AA minimum, `44x44px` touch floor), reflow at `320px`, focus visibility, and Design Tokens Community Group (`$value`/`$type`) format | `DOM`, `CSS`, `Artifact` |

## Verification Types Used Across Companion Files

- `DOM` — Verified by inspecting HTML elements, attributes, ARIA roles, or computed DOM structure.
- `CSS` — Verified by inspecting CSS rules, custom properties, selectors, or computed styles.
- `Visual` — Verified by inspecting rendered layout geometry, bounding boxes, or screenshot diffs across viewports (`375x812` mobile and `1440x900` desktop).
- `Artifact` — Verified by inspecting structured design artifacts (`tokens.json`, `DESIGN.md`, `wireframe-*.html`, or audit reports).

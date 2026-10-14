# Studio & Harness Action Workflows (`design-system`, `wireframe`, `mockup`, `refine-block`, `critique`, `polish`, `document`)

Unified action procedures across Craft & Polish `[IMP]`, Baseline UI Constraints `[UIS]`,
Design-System Synthesis `[UPM]`, and Aesthetic Direction `[FD]`.

---

## 1. Mode Routing Matrix

Route every UI/UX request to one of these 7 concrete action workflows:

| Action Mode | Trigger Intent | Required Inputs | Primary References | Output Artifacts |
|---|---|---|---|---|
| **`design-system`** | Create or regenerate tokens, color palette, typography scale, and `DESIGN.md` for a product or brand | Domain, persona, brand mood, locale (`en`/`ja`), polarity (`light`/`dark`/`dual`) | `references/design-system.md`, `references/tokens.css`, `references/typography-ja.md` | `tokens.json`, `tokens.css`, `DESIGN.md` (or `DESIGN.ja.md`) |
| **`wireframe`** | Explore layout topology and user flow before committing to visual styling | Feature brief, primary user task, target viewports | `references/ux-heuristics.md` (`WF-01`..`WF-72`, `R1`–`R8`), `references/layout-primitives.md`, `references/primitives.css` | 1–3 grayscale HTML wireframes (`wireframe-a/b/c.html`) + `R1`–`R8` rubric score |
| **`mockup`** | Build a production-ready screen, application view, or high-craft HTML/Vue/Nuxt interface | Approved wireframe or feature spec + `DESIGN.md` / `tokens.css` | `references/principles.md`, `references/anti-patterns.md`, `references/layout-primitives.md`, `references/stacks-vue-nuxt.md` | Production component/screen + `scripts/probe.mjs` & `forge verify` pass |
| **`refine-block`** | Redesign or fix a single section/component (`[data-block="..."]`) without disturbing the rest of the page | Target block selector/ID, issue or goal, surrounding page context | `references/principles.md`, `references/anti-patterns.md`, `references/stacks-vue-nuxt.md` | Scoped DOM/CSS patch preserving parent tokens and layout primitives |
| **`critique`** | Conduct a comprehensive UX, visual craft, accessibility, and anti-slop review (`[IMP]`) | Existing screen, URL, or codebase view | `references/audit-checklist.md`, `references/ux-heuristics.md`, `references/anti-patterns.md` | Structured Critique Report (First Impression, 10 Heuristics `/40`, 5-Dim Audit `/100`, `P0`–`P3` backlog) |
| **`polish`** | Final pre-ship pass fixing alignment, spacing, states, contrast, and token drift without a concealed redesign (`[IMP]`) | Functional screen or component nearing completion | `references/audit-checklist.md`, `references/principles.md`, `references/anti-patterns.md` | 5-tier triage fixes applied in-place + clean `scripts/probe.mjs` verification |
| **`document`** | Extract an existing codebase's implicit design system or formalize a seed into `DESIGN.md` (`[IMP]`) | Existing codebase (`Scan Mode`) or brief (`Seed Mode`) | `references/design-system.md`, `references/typography-ja.md` | `DESIGN.md` (with `Agent Prompt Guide` & `Known Gaps`) + `tokens.json` |

---

## 2. Step-by-Step Action Procedures

### 2.1 `design-system` — Synthesize Tokens & `DESIGN.md`

1. **Classify Archetype & Polarity**: Select the industry palette and font pairing from `references/design-system.md` (and `references/typography-ja.md` if `:lang(ja)`).
2. **Generate OKLCH Scales**: Author 10-step hue-tinted neutrals (`50`..`950`), 9-step brand primary (`50`..`900`), and semantic status pairs (`success`, `warning`, `danger`, `info`).
3. **Verify Contrast Pairs**: Confirm every pair in the Mandatory Contrast Matrix (`>= 4.5:1` normal text, `>= 3.0:1` large text and borders) across light and dark themes.
4. **Emit Files**: Write `tokens.json` (DTCG schema), `tokens.css`, and `DESIGN.md` (all 8 canonical sections + `Agent Prompt Guide` + `Known Gaps`).

### 2.2 `wireframe` — Structural Exploration & Rubric Gate (`LUX`, `EL`)

1. **Define User Flow & Blocks**: List the primary user goal, top-level landmarks (`ST-01`..`ST-04`), and ordered `[data-block]` regions.
2. **Author Structural Variants (`A / B / C`)**:
   - **Option A**: Conventional baseline (`LUX-01` Jakob's Law).
   - **Option B**: Streamlined task-first / progressive disclosure (`LUX-03` Hick's Law, `LUX-09` Tesler's Law).
   - **Option C**: Spatial master-detail or asymmetric split (`.l-sidebar` / `.l-switcher`).
3. **Enforce Grayscale & Primitives**: Style exclusively with achromatic wireframe tokens and `references/primitives.css`; include real domain copy and `empty`/`loading`/`error` state blocks (`WF-01`..`WF-72`).
4. **Score Against `R1`–`R8` (`references/ux-heuristics.md`)**: Present the `/100` score breakdown and recommend the highest-scoring option before moving to `mockup`.

### 2.3 `mockup` — High-Craft Screen Implementation (`FD`, `RUI`, `EL`, `IMP`)

1. **Three-Layer Context Audit**:
   - *Stack*: Inspect `package.json` / project files (Vue 3, Nuxt, `@nuxt/ui`, `shadcn-vue`, Tailwind v4, or vanilla HTML/CSS).
   - *Existing Components*: Reuse project components (`UButton`, `UCard`, `UTable`, `Dialog`) before creating new ones.
   - *Tokens*: Load `DESIGN.md` and `tokens.css` (or run `design-system` first if missing).
2. **Pre-Write Craft Floor Gate**: Verify all 12 rules in `references/anti-patterns.md` Section 0 (Every Layout primitives, `65ch` measure, `tabular-nums`, concentric radii, single primary CTA, 8 states, zero AI slop).
3. **Implement Screen**: Build the view with real domain copy, complete `default / hover / focus-visible / active / disabled / loading / empty / error` states, and responsive intrinsic reflow.
4. **Browser & Harness Verification**: Run `scripts/probe.mjs` (when a live URL is available) and `forge verify`.

### 2.4 `refine-block` — Scoped Block Surgery

1. **Lock Boundary**: Identify the target `[data-block="<id>"]` (or component file) and read the parent page's `tokens.css` and surrounding layout primitives.
2. **Preserve External Contract**: Do not alter global `:root` tokens, neighboring `[data-block]` siblings, or outer grid geometry unless explicitly requested.
3. **Apply Targeted Fixes**: Resolve hierarchy, spacing (`P-11`..`P-20`), contrast (`CO-01`..`CO-07`), or state completeness (`SS-01`..`SS-04`) inside the target block.
4. **Verify Isolation**: Confirm zero regressions in parent flow and zero horizontal overflow (`LY-01`).

### 2.5 `critique` — Holistic Design & UX Critique (`[IMP:critique]`)

Execute `critique` in **two strict phases** so automated rules never anchor or blind your holistic design judgment:

1. **Phase A — Unanchored Holistic Assessment (Before Reading Rule Checklists)**:
   - **First-Impression & Squint Test (`P-09`)**: State what the eye hits first, second, and third; whether the primary action is unmistakable; and what emotional/brand impression the interface conveys.
   - ** Aesthetic & Anti-Slop Evaluation (`FD`, `AP-85`..`AP-97`)**: Flag generic AI slop patterns (gradient text, 3 identical icon-in-circle cards, pill badges above every heading, fake metrics, decorative blur blobs).
   - **Nielsen's 10 Usability Heuristics Score (`/40`, `0–4` per heuristic)**:
     1. Visibility of system status
     2. Match between system and the real world (`LUX-22`)
     3. User control and freedom (`Undo` / `Escape`, `LUX-05`)
     4. Consistency and standards (`LUX-01`)
     5. Error prevention (`Poka-Yoke`, `LUX-27`)
     6. Recognition rather than recall (`LUX-28`)
     7. Flexibility and efficiency of use (shortcuts, defaults)
     8. Aesthetic and minimalist design (`Signal-to-noise`, `LUX-24`)
     9. Help users recognize, diagnose, and recover from errors (`P-108`)
     10. Help and documentation (contextual inline guidance)
   - **Cognitive Load Checklist (`LUX-03`, `LUX-04`, `LUX-19`)**: Count top-level nav items (`<= 7`), data points per card (`<= 4`), and competing primary CTAs (`<= 1`).
   - **Five-Persona Walkthrough**:
     1. *First-Time Visitor*: Understands what this product does and where to start within 5 seconds.
     2. *Power User*: Operates core flows via keyboard (`Tab`, `Enter`, `Escape`, shortcuts) with high density and zero friction.
     3. *Mobile Thumb Commuter (`375px`)*: Reaches primary controls (`>= 44x44px`) one-handed in bright sunlight without horizontal scroll.
     4. *Assistive Tech / Low-Vision User*: Navigates landmarks, labels, contrast (`>= 4.5:1`), `200%` zoom, and reduced motion cleanly.
     5. *Skeptical Decision Maker*: Finds authentic evidence, clear pricing/metrics, and zero dark patterns (`LUX-29`).
2. **Phase B — Deterministic 126-Rule Audit & Synthesis (`references/audit-checklist.md`)**:
   - Run through `ST`, `A11Y`, `CO`, `KB`, `TG`, `FM`, `LY`, `TY`, `AN`, `SS`, and `HV-01`..`HV-34`.
   - Compute the **5-Dimension Score (`/100`)** and the **R1–R7 UX Rubric Score (`/100`)**.
   - Emit a prioritized remediation backlog:
     - **`P0` Blockers**: Broken accessibility (`A11Y`/`KB`), contrast failures (`< 4.5:1`), horizontal overflow (`LY-01`), missing form labels, unconfirmed destructive actions.
     - **`P1` High-Impact Craft & UX**: Hierarchy failures, card-in-card nesting (`AP-32`), missing loading/empty/error states (`SS-02`..`04`), AI slop signatures.
     - **`P2` Polish & Rhythm**: Off-scale spacing, missing `tabular-nums`, non-concentric radii, suboptimal easing curves.
     - **`P3` Enhancements**: Micro-copy refinements, progressive disclosure opportunities, keyboard shortcut hints.

### 2.6 `polish` — Pre-Ship Craft Refinement (`[IMP:polish]`, `[UIS:improve-ui]`)

**Golden Rule of `polish`**: Elevate execution quality across every detail **without performing a concealed redesign** (preserve the existing brand palette, layout topology, and component architecture).

Sweep through these **5 tiers in order**:
1. **Tier 1 — Alignment, Spacing & Concentric Geometry**: Snap margins/paddings to `--space-*` (`P-11`), enforce `inner gap < outer gap` (`P-12`), align card footers (`P-16`), and fix concentric border radii ($r_{\text{outer}} = r_{\text{inner}} + p$, `P-66`).
2. **Tier 2 — Typography & Numeric Hygiene**: Apply `tabular-nums` to all numbers (`P-28`), `text-wrap: balance` to headings and `pretty` to paragraphs (`P-29`), constrain prose to `65ch` (`P-23`), and fix straight quotes/ellipses (`P-32`). For `:lang(ja)`, enforce `line-break: strict` and `"palt" 1` (`JA-31`, `JA-35`).
3. **Tier 3 — Color, Contrast & Surface Depth**: Replace hardcoded hexes with semantic tokens (`ST-06`), fix any contrast pair `< 4.5:1` (`CO-01`), remove nested card borders (`P-60`), and verify `color-scheme` (`ST-07`).
4. **Tier 4 — Interactive States & Accessibility**: Verify `:hover`, `:focus-visible`, `:active`, `:disabled`, `loading`, `empty`, and `error` states (`P-90`); ensure `<label>` bindings (`FM-01`), `>= 44x44px` mobile hit areas (`TG-01`), and `aria-hidden="true"` on decorative SVGs (`A11Y-03`).
5. **Tier 5 — Motion & Responsive Edge Cases**: Replace `transition: all` with explicit `transform`/`opacity` transitions (`<= 250ms`, `--ease-out-quart`, `AN-02`..`05`), verify `@media (prefers-reduced-motion: reduce)` (`AN-01`), add `min-inline-size: 0` on flex text children (`LY-09`), and confirm zero overflow at `320px`, `375px`, `768px`, and `1440px` (`LY-01`).

### 2.7 `document` — Extract or Author `DESIGN.md` (`[IMP:document]`, `[UIS:create-design-md]`)

- **Mode A — Scan Mode (Existing Codebase)**:
  1. Inspect CSS entrypoints, Tailwind `@theme` / config files, `app.config.ts`, and representative components.
  2. Extract the actual color tokens (converting hex/RGB to OKLCH + hex), font stacks, fluid/stepped sizes, spacing tokens, radii, elevation shadows, and layout patterns.
  3. Write `DESIGN.md` (using the canonical 8-section template in `references/design-system.md`) and `tokens.json`.
  4. Document inconsistencies, contrast violations, or missing states honestly under `## Known Gaps & Open Questions` — never invent tokens that do not exist in the codebase.
- **Mode B — Seed Mode (Greenfield Project)**:
  1. Translate the user's domain brief into a complete `DESIGN.md` and `tokens.json`/`tokens.css` following `design-system` (Section 2.1).

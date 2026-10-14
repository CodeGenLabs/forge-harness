# Laws of UX, Wireframe Conventions & 100-Point Review Rubric (`LUX-01`..`LUX-29`, `WF-01`..`WF-72`, `R1`–`R8`)

Unified cognitive heuristics from *Laws of UX* (2nd ed., Jon Yablonski) `[LUX]`,
UX Guidelines `[UPM]`, Craft & Polish `[IMP]`, and Web Interface Audit `[WIG]`.

---

## 1. The 10 Core Laws of UX (`LUX-01`..`LUX-10`)

Each law translates psychological research into a concrete, testable DOM/CSS/Visual
requirement:

| ID | Law | Psychological Principle | Testable UI Requirement & Scriptable Threshold |
|---|---|---|---|
| `LUX-01` | **Jakob's Law** `[LUX:Ch1]` | Users spend most of their time on other sites and expect yours to work the same way. | Keep primary navigation in standard landmarks (`top header` or `left sidebar`), place search and account controls in top-right (LTR), use standard form controls, and never invent custom scrollbars or non-standard modal close patterns. |
| `LUX-02` | **Fitts's Law** `[LUX:Ch2]` | Time to acquire a target is a function of distance and target size. | Interactive targets must be `>= 44x44px` on touch/mobile (`>= 24x24px` desktop toolbar minimum) with `>= 8px` gap (`TG-01`..`TG-03`). Place primary form submit buttons at the immediate end of the form flow (`margin-block-start: var(--space-4)`), not in a distant corner. |
| `LUX-03` | **Hick's Law** `[LUX:Ch3]` | Decision time increases logarithmically with the number and complexity of choices. | Limit top-level navigation to `<= 5` items on mobile and `<= 7` on desktop. Limit primary actions to `1` per view (`P-07`). When a filter list or settings page exceeds `7` controls, use progressive disclosure or categorized tabs. |
| `LUX-04` | **Miller's Law** `[LUX:Ch4]` | Working memory holds `7 ± 2` (practically `4–5`) chunks of information at once. | Group related items into chunks of `<= 5` cards/rows per visual group. Format long strings (credit cards `4-4-4-4`, phone numbers, API keys) into spaced chunks. Keep KPI summary rows to `3–4` cards maximum. |
| `LUX-05` | **Postel's Law** `[LUX:Ch5]` | Be liberal in what you accept, and conservative in what you send. | Accept flexible user input formats (spaces/hyphens in phone numbers and credit cards, pasted OTP codes, whitespace trimming) and normalize them in code instead of rejecting with validation errors. Emit concise, deterministic system outputs. |
| `LUX-06` | **Peak-End Rule** `[LUX:Ch6]` | People judge an experience largely by how they felt at its peak and at its end. | Make workflow completion states (order confirmation, onboarding finish, deployment success) clear and rewarding with concrete next steps, and make error/failure states (`Peak` frustration moments) helpful, blame-free, and immediately recoverable (`P-108`). |
| `LUX-07` | **Aesthetic-Usability Effect** `[LUX:Ch7]` | Users perceive aesthetically cohesive designs as easier to use, masking minor usability flaws during testing. | Maintain strict visual craft (tokens, spacing rhythm, alignment) to earn user trust, **but never let visual polish mask broken accessibility, keyboard traps, or unclear information architecture during `critique`**. |
| `LUX-08` | **Von Restorff Effect (Isolation)** `[LUX:Ch8]` | When multiple similar objects are present, the one that differs from the rest is most likely to be remembered and noticed. | Isolate at most `1` primary CTA button (`--color-primary` solid fill) or `1` highlighted pricing tier per screen. If 3+ badges or buttons use high-saturation fills, none stands out (`AP-21`, `AP-31`). |
| `LUX-09` | **Tesler's Law (Conservation of Complexity)** `[LUX:Ch9]` | Every process has an irreducible core of complexity; either the system absorbs it or the user must. | Shift complexity from the user to the software: pre-fill smart defaults, infer timezone/locale, auto-format inputs, and calculate totals automatically instead of asking the user for redundant fields. |
| `LUX-10` | **Doherty Threshold** `[LUX:Ch10]` | Productivity soars when computer and user interact at a pace (`< 400ms`, `< 100ms` for direct manipulation) that ensures neither waits on the other. | Provide visual feedback (`:active` state, optimistic toggle) within `< 100ms`, complete UI transitions within `120ms–320ms`, and display skeleton placeholders or progress indicators for any async operation exceeding `300ms`. |

---

## 2. Related UX Heuristics & Gestalt Laws (`LUX-11`..`LUX-29`)

- **`LUX-11` Law of Proximity** `[LUX, RUI]`: Internal padding/gap inside a group must be strictly smaller (`<= 0.67x`) than the external gap between groups (`P-12`, `AP-34`).
- **`LUX-12` Law of Common Region** `[LUX, RUI]`: Elements sharing a bordered `.l-box` or tinted surface (`--color-surface-sunken`) are perceived as a unit; do not add borders when proximity (`LUX-11`) already groups them (`P-59`).
- **`LUX-13` Law of Pragnanz (Simplicity)** `[LUX]`: Users interpret ambiguous shapes in the simplest form possible; prefer clean rectangular alignment axes over jagged staggered edges.
- **`LUX-14` Law of Similarity** `[LUX, UIS]`: Elements that look similar must behave similarly. Never style a non-clickable badge identically to a clickable pill button.
- **`LUX-15` Law of Uniform Connectedness** `[LUX]`: Connect related multi-step progress nodes or timeline events with a subtle `1px–2px` connecting line or shared rail.
- **`LUX-16` Serial Position Effect** `[LUX]`: Users best recall the first and last items in a sequence. Place the most frequent destinations (e.g., `Home`/`Overview` and `Settings`/`Profile`) at the start and end of navigation bars.
- **`LUX-17` Zeigarnik Effect** `[LUX, UPM]`: Incomplete tasks stay active in memory, **but artificial progress bars cause fatigue if overused**. Use step indicators (`Step 2 of 4`) only on genuine multi-step wizards or onboarding checklists that users can dismiss.
- **`LUX-18` Goal-Gradient Effect** `[LUX]`: Motivation increases as users approach completion; start multi-step onboarding with an already-completed first step (`Account created ✓`).
- **`LUX-19` Cognitive Load Cap** `[LUX, IMP:critique]`: Eliminate extraneous cognitive load (visual noise, inconsistent terminology, redundant borders) so working memory stays focused on the domain task.
- **`LUX-20` Progressive Disclosure** `[LUX, RUI]`: Show the 80% common controls immediately and tuck advanced filters, raw JSON views, or rare configuration options inside `<details>` disclosures or secondary drawers.
- **`LUX-21` Selective Attention & Banner Blindness** `[LUX]`: Users ignore anything that looks like an advertisement or decorative promo box. Format critical system warnings as clean inline banners (`border-inline-start: 4px solid var(--color-warning)`) right beside the affected control.
- **`LUX-22` Mental Model Alignment** `[LUX, IMP:critique]`: Name objects and actions using the user's domain vocabulary, never internal database table or microservice names.
- **`LUX-23` Paradox of Choice** `[LUX]`: On pricing or plan selection screens, offer `3–4` tiers maximum and pre-select or recommend the default tier for the primary persona.
- **`LUX-24` Occam's Razor** `[LUX]`: When two layouts communicate the same information equally well, remove the one with more boxes, borders, or decorative chrome.
- **`LUX-25` Parkinson's Law in Forms** `[LUX]`: Long multi-page forms expand perceived effort; trim every optional field that is not immediately required to complete the core transaction.
- **`LUX-26` Pareto Principle (80/20)** `[LUX, UPM]`: Dedicate `>= 70%` of workspace area and top-level hierarchy to the 20% of actions users perform daily.
- **`LUX-27` Poka-Yoke (Mistake Proofing)** `[LUX, WIG]`: Prevent errors structurally by constraining inputs (`min`/`max`, date range pickers where end date cannot precede start date, disabling incompatible combinations with an explanation).
- **`LUX-28` Recognition Over Recall** `[LUX, IMP:critique]`: Show recent searches, visible filter chips, and clear field format hints rather than forcing users to remember syntax or state from a previous screen.
- **`LUX-29` Humane Ethics & Anti-Dark-Patterns** `[LUX, IMP]`: Never use confirm-shaming copy, hidden unsubscribe paths, fake countdown timers, pre-checked opt-in marketing boxes, or roach-motel cancellation flows.

---

## 3. Wireframe Conventions (`WF-01`..`WF-72`)

When producing low-fidelity wireframes (`wireframe-a.html`, `wireframe-b.html`,
`wireframe-c.html`) before high-fidelity mockups:

- **`WF-01`..`WF-10` Grayscale Structural Discipline (`CSS`)** `[LUX, IMP]`
  Wireframes use strictly achromatic grayscale tokens (`#fafafa`, `#f4f4f5`, `#e4e4e7`,
  `#a1a1aa`, `#52525b`, `#18181b`) plus a single neutral focus ring (`#27272a`) so review
  focuses on information architecture, hierarchy, and flow rather than color taste.
- **`WF-11`..`WF-25` Structural Diversity Across Options A / B / C (`DOM` / `Visual`)** `[FD, LUX]`
  When exploring wireframe options, `A`, `B`, and `C` must differ structurally in layout
  topology and user flow—not merely swap alignment:
  - **Option A (Conventional / Jakob's Law Baseline)**: Familiar industry-standard layout
    (e.g., left `.l-sidebar` navigation + top summary + primary table/list).
  - **Option B (Task-Focused / Hick's & Tesler's Law)**: Streamlined command-first or
    progressive-disclosure flow that foregrounds the primary job-to-be-done and tucks
    secondary chrome into drawers.
  - **Option C (Spatial / Information-Dense Split)**: Master-detail `.l-sidebar` split or
    editorial `.l-switcher` workspace optimizing side-by-side comparison without page
    reloads.
- **`WF-26`..`WF-45` Real Copy & Realistic Data Density (`DOM`)** `[IMP:ux-writing, RUI]`
  Wireframes use real domain labels, realistic string lengths (including a 45-character
  long name and a zero/empty metric), and explicit `[data-block="..."]` attributes on
  every major section (`header`, `hero`, `kpi-summary`, `primary-workspace`, `footer`).
- **`WF-46`..`WF-60` Annotation & State Coverage (`DOM`)** `[IMP:interaction, WIG]`
  Each wireframe annotates its primary user flow (`1 -> 2 -> 3`), marks the single
  primary CTA (`[data-cta="primary"]`), and includes `<template>` or toggleable blocks
  demonstrating `empty`, `loading`, and `error` states.
- **`WF-61`..`WF-72` Self-Contained HTML + `primitives.css` (`Artifact`)** `[EL]`
  Wireframe HTML files link `primitives.css`, pass `ST-01`..`ST-12` semantic checks, and
  render without horizontal overflow at both `375x812` and `1440x900`.

---

## 4. The 100-Point Wireframe & Mockup Review Rubric (`R1`–`R8`)

Use this rubric to score wireframe candidates (`A`, `B`, `C`) or completed screens out of
**100 points**:

| Dimension | Weight | Laws & Rules Evaluated | Full-Score Criteria |
|---|---|---|---|
| **`R1` Hierarchy & Focal Point** | **20 pts** | `LUX-08` (Von Restorff), `P-01`..`P-09` | Unambiguous primary focal point in squint test; exactly 1 solid primary CTA per view; clear 3-tier typographic hierarchy. |
| **`R2` Cognitive Load & Chunking** | **15 pts** | `LUX-03` (Hick), `LUX-04` (Miller), `LUX-19`, `LUX-20` | Nav items `<= 7` (`<= 5` mobile); cards have `<= 4` data points; groups contain `<= 5` items; advanced options progressively disclosed. |
| **`R3` Spatial Grouping & Intrinsic Layout** | **15 pts** | `LUX-11` (Proximity), `LUX-12` (Common Region), `LP-01`..`LP-19` | Inner gap `<` outer gap (`>= 1.5x` ratio); built with Every Layout primitives; zero card-in-card nesting; `>= 25%` open whitespace. |
| **`R4` Target Acquisition & Motor Flow** | **15 pts** | `LUX-02` (Fitts), `P-19`, `P-100` | Touch targets `>= 44x44px` with `>= 8px` gap; single-column vertical forms; submit CTA immediately follows the last input. |
| **`R5` Convention & Mental Model Fit** | **10 pts** | `LUX-01` (Jakob), `LUX-16`, `LUX-22`, `LUX-28` | Standard landmark placement; domain-accurate labels; visible filter/state indicators (`Recognition over Recall`). |
| **`R6` Error Prevention, Peak-End & Feedback** | **15 pts** | `LUX-05` (Postel), `LUX-06` (Peak-End), `LUX-09` (Tesler), `LUX-10` (Doherty), `LUX-27` | Smart defaults; flexible input parsing; complete 8 states (`loading`, `empty`, `error` recovery); confirmation or `Undo` on destructive actions. |
| **`R7` Accessibility & Responsive Reflow** | **10 pts** | `WCAG 2.2 AA`, `ST-01`..`ST-12`, `P-114` | Valid landmarks, heading tree, `<label>` bindings, `:focus-visible`, and zero horizontal overflow from `320px` to `1440px`. |
| **`R8` Option Differentiation Gate (Multi-Option Reviews)** | **Pass / Fail** | `WF-11`..`WF-25`, `LUX-29` | Options `A`, `B`, `C` use distinct layout topologies and contain zero dark patterns (`LUX-29`). |

- **Pass threshold**: Total score **`>= 80 / 100`**, no single dimension below `60%` of
  its weight, and `R8 = Pass`.

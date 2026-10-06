---
name: ui-ux
phase: implement
description: >
  Build and polish application UI screens (dashboards, tables, forms, settings,
  modals) using project components, strict layout formulas, and numeric budgets.
requires-kernel: ["forge verify"]
reads: from-dag
writes: []
---

# ui-ux - user interface design and construction

## Announce

> Running `ui-ux`: designing and refining user interface screens.

## What this does

This skill directs the creation and refinement of application screens. It does not
rely on vague aesthetic adjectives. Instead, it enforces a disciplined sequence:
probe codebase reality before modifying code, reject repetitive artificial defaults,
and constrain geometry, spacing, and typography with exact numbers.

Scope: internal application screens (dashboards, lists, tables, forms, settings,
modals, and pricing tables). For marketing landing pages or storefronts, note that
unmodeled patterns fall back to foundational principles in `references/principles.md`.

## 0. Determine the mode

Identify the path matching the user's intent:

| Intent | Mode and Reference |
|---|---|
| Review existing UI | Run review mode in `references/review.md` with before/after issue table. |
| Rebuild keeping brand | Preserve brand colours and page shell; update controls per `references/review.md`. |
| Refactor code keeping appearance | Clean markup and CSS while preserving exact geometry per `references/refactor.md`. |
| Logo / brand mark | Generate 3 logo directions in context per `references/components/logo.md`. |
| Direct build without wireframes | For explicit fast delivery, skip wireframe selection and build the recommended layout directly. |
| Establish design system first | Define tokens and core primitives on a catalog page per `references/system.md`. |
| Component-level fix | For tasks smaller than a screen, directly fix the target control using component recipes. |
| Default: design or redesign a screen | Designer flow: brief, core action, 2-3 wireframes, pick, then construct per `references/design-process.md`. |

## 1. Audit codebase reality

Audit existing libraries and conventions before proposing or building markup:

1. **Stack:** Detect presence of Tailwind CSS, component libraries (shadcn/ui, Radix,
   MUI, Ant Design), and specialized tools (Recharts, TanStack Table, date pickers).
2. **Existing components:** Check if primitives (Button, Input, Avatar, Dialog) already
   exist in the repository. Use existing project components instead of introducing
   parallel implementations.
3. **Existing style:** Count style signals across files to identify whether the project
   favours flat borders, elevated cards, glassmorphism, or dark themes per `references/styles.md`.
4. **Design tokens:** Read colours and typography from existing CSS variables or Tailwind
   theme configuration. If none exist, adopt `references/tokens.css` and `references/brand-tokens.md`.

Report the audit outcome in one concise line before generating interface artifacts.

## 2. Layout and component selection

Do not invent screen layouts. Map the request to a tested archetype:

- **App shells, dashboards, tables, details, settings, and errors:** `references/layouts/app.md`
- **Forms, authentication, multi-step wizards:** `references/layouts/form.md`
- **Overlays, modals, slide-overs, dropdowns, and menus:** `references/layouts/overlay.md`
- **Pricing cards and plan comparison tables:** `references/layouts/pricing.md`

Assemble pages from tested component patterns under `references/components/`:
- Structure: `card.md`, `description-list.md`, `empty-state.md`
- Actions & controls: `button.md`, `choice-controls.md`, `input.md`, `small-controls.md`
- Data density: `list-row.md`, `sortable-header.md`, `charts.md`, `timeline.md`, `tree.md`
- Feedback & status: `banner.md`, `loading.md`, `otp-input.md`, `file-upload.md`

## 3. Strict scope rules

1. **Exact section count:** Build only requested sections. Never invent FAQ blocks,
   promotional banners, or extraneous cards.
2. **Realistic mock data:** Use domain-representative sample records. Include boundary
   cases (long titles, zero counts, missing avatars) rather than uniformly ideal text.
3. **Ambiguity defaults:** If phrasing is ambiguous, default to the standard meaning
   (e.g., "table" means tabular data; "card" means a content panel) and declare the
   choice at delivery.
4. **Interaction boundaries:** Provide styling for all states (default, hover, focus,
   active, disabled, empty, loading, error). Leave event handlers as clean props for
   application logic to wire up.

## 4. Verification and delivery

Prior to completing work:

1. Review against the release checklist in `references/checklist.md`.
2. Verify responsive behaviour at narrow viewports (375px) ensuring zero horizontal
   overflow, legible text, and minimum 44px tap targets per `references/responsive.md`.
3. For environments with Node.js and Playwright available, execute the visual audit
   tool `scripts/probe.mjs` to measure rendering across 375px to 1920px viewports.
4. Confirm verification with `forge verify`.

## Exit

Present the built or modified interface, declaring:
- Chosen layout formula and component references used.
- Explicit assumptions or defaults adopted.
- Verification status reported by `forge verify`.

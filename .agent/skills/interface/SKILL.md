---
name: interface
phase: implement
description: >
  Keep a user interface out of the two holes AI-built front ends fall into:
  the defaults that make every page look the same, and the responsive,
  theming, and localization failures that type-checking and linting cannot see.
requires-kernel: ["forge verify"]
reads: from-dag
writes: []
---

# interface

## Announce

> Reading `interface`: the banned defaults, and what the `ui` condition proves.

## What this does

Two halves that need opposite treatment, and mixing them is why most attempts
at this fail.

**The failure modes are checkable**, and `forge verify`'s `ui` condition
checks them. This skill says what the project's own suite should assert.

**The sameness is not checkable**, and this skill does not prescribe a style.
It bans defaults *because they are defaults*, which forces a choice, and a
choice can be justified. Nothing here limits what may be invented.

## 1. The banned defaults

A model predicts the most likely design, and the most likely design is the
mean of everything it has seen. That is the whole mechanism - not a lack of
capability. So the fix is to remove the mean from the menu.

**Banned because they are the average, not because they are bad:**

- **The purple-to-blue gradient.** The single most recognisable tell.
- **A default type stack chosen by not choosing.** Inter, or whatever the
  starter shipped, used everywhere including headings and numerals.
- **Four feature cards in a row**, and its relatives: hero, three cards,
  testimonials, pricing, CTA, in that order.
- **One border radius and one padding applied to everything.** This is the
  tell most people cannot name but can see: with uniform geometry the page
  reads flat, because nothing is nearer or further than anything else.
- **Emoji as section markers** where a typographic hierarchy is the job.
- **Centred everything.** A grid with one column is not a layout.

The rule is a category, not a list of colours. If the reaction to this section
is to avoid purple and ship the same green instead, it has failed - one
average has been swapped for another, and it now looks principled.

**What to do instead is deliberately unstated.** Pick a reference, state why
it fits this product, and diverge on purpose. Density, rhythm and hierarchy
carry more identity than palette does.

## 2. Reference systems worth reading

All publish tokens, components and usage guidance under permissive licences.
Read them for *reasoning*; copying them reintroduces the averaging from a
different direction.

- **Primer** (GitHub) - first for anything data-dense: dense information
  display, first-class dark mode, accessibility in the component API. The
  closest published thinking to a database client or an admin tool.
- **Carbon** (IBM) - the most complete token layer.
- **Spectrum** (Adobe), **Material 3** (Google), **Cloudscape** (AWS).

### The design procedure: `ui-ux`

When tasked with designing, redesigning, auditing, or refining a screen, invoke the
`ui-ux` skill. While `interface` establishes the invariant contract (the banned defaults
and what the `ui` verification proves), `ui-ux` provides the concrete step-by-step
procedures (`design-system`, `wireframe`, `mockup`, `refine-block`, `critique`, `polish`,
and `document`) backed by the distilled 10-source knowledge base (Every Layout
primitives, OKLCH token scales, Laws of UX heuristics, Japanese typography, Vue/Nuxt
stack mappings, 6-axis theme reactivity, zero-literal i18n, and 3-pillar mobile rules).

## 3. What the `ui` condition should prove

`forge verify` runs `commands.ui`. The kernel renders nothing and has no
opinion; it runs the line and records the result, exactly as for `tests`.
Declare it in `.forge/config.yaml`:

```yaml
commands:
  ui: npm run test:ui     # or `ui: none` if this project has no browser UI
```

For projects without an established UI test suite, `ui-ux/scripts/probe.mjs` from the
shipped `ui-ux` skill can serve as `commands.ui`:

```bash
node .forge/skills/ui-ux/scripts/probe.mjs http://localhost:3000 --sweep 1440,320,20 --check-theme --check-i18n
```

`ui: none` is a real answer. Saying nothing is not - it reports `unavailable`
and leaves the verdict unproven, which is the same contract every other
command has.

What that suite should assert, at minimum:

- **Three-pillar mobile readiness at 320px and 375px (`MOB-LY`, `MOB-PERF`, `MOB-UX`).**
  1. *Layout*: Zero horizontal overflow across 320, 375, 768, 1024 and 1440px;
     buttons and badges wrap as whole controls (`white-space: nowrap` in `.l-cluster`)
     rather than splitting their labels across lines; no single-word orphan drops on
     headings/paragraphs; no flex text column crushed below `10ch`.
  2. *Performance*: Explicit `width`/`height` or `aspect-ratio` on every media element
     (zero CLS); `loading="lazy"` below the fold; compositor-only transitions
     (`transform`, `opacity`); at most one `backdrop-filter: blur()`.
  3. *Touch UX*: Tap targets at least `44x44px` with `>= 8px` gap on mobile; form inputs
     `font-size >= 16px` (preventing iOS Safari auto-zoom); semantic `inputmode` and
     `autocomplete`; `100dvh` with safe-area insets; zero actions hidden behind `:hover`.
- **Full-page 6-axis theme reactivity (`--check-theme`).** Mutating primary hue,
  neutral hue, font family, icon stroke, border-radius scale, or light/dark polarity
  on `:root` updates 100% of the page with zero hardcoded islands left behind.
- **Zero-literal localization completeness (`--check-i18n`).** Switching locales leaves
  zero untranslated text nodes, `placeholder`, `aria-label`, or `title` attributes, and
  zero leaked translation keys (`common.save`, `undefined`) from frontend or backend.
- **WCAG AA contrast**, which is computed rather than judged.

Type-checking, linting and the build all pass while every one of these breaks.
That is why the condition exists separately rather than as a lint rule.

## 4. The table decision, which must be recorded

There is no correct responsive table, so this is a spec decision and not a
component-library default.

- A table used for **comparison** must keep rows and columns: scroll
  horizontally, pin the first column, and let the rest move. Values must stay
  comparable across rows, which stacking destroys.
- A table used for **listing** is better stacked into cards on narrow
  viewports.

The trap: **stacking by overriding `display` destroys the native table
semantics screen readers depend on.** A stacked table is more readable and
less accessible, and which of those matters more depends on the data. Write
the choice and the reason into the spec for that screen.

A second trap the accessibility checkers do catch: a horizontally scrolling
region that is not keyboard-focusable hides its clipped columns from anyone
not using a mouse.

## 5. Where this is advisory

Section 3 is enforced, through a condition the project itself supplies.
Sections 1, 2 and 4 are arguments.

Forge has measured its own mechanisms and published where they failed. It has
not earned authority over taste, and asserting it here would contradict that
record. A reviewer may overrule every word of section 1; they may not ship a
layout that breaks at 375px and call it verified.

## Exit

Say which of the banned defaults the design deliberately uses and why, if any,
and what `commands.ui` is declared as. If it is `none`, say that plainly - a
project with no browser UI is not failing anything.

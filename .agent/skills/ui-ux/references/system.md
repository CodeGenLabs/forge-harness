# Multiple screens — rules D

Open this file when the request covers **more than one surface**, or asks to build a design system first
(`D9`). A sentence like *"build a kanban board
for task management and a table for project management, with full CRUD"* is not two screens, it
is about **eight surfaces**: board, card, empty column, table, table row, create form, edit
form, delete confirmation dialog, filter.

**Root diagnosis:** a design system specifies colours and font sizes. It does **not** specify
that a kanban card and a table row must speak the same language. Each screen is valid on its own,
and put together they form two different apps.

A real complaint from a user: *there is a design system config in place but the output is still not
consistent across screens · not pretty, the AI keeps picking dark grey · I have to prompt corrections
many times.*

---

## D1. Define the primitive contract **first**, once, for the whole set

Before building the first screen, declare the seven primitives below. Every later screen uses
exactly that set. **Spawning variants midway is banned.**

| Primitive | Must settle |
| --- | --- |
| Button | the four kinds in `I1`, size, with or without icon |
| Status badge | shape, background or coloured text only, font size |
| Input | height, border, focus behaviour |
| Card | padding, radius, border or not |
| List row | height, padding, hover behaviour |
| Modal | width, button placement, whether clicking outside closes it |
| Empty state | icon, title, secondary sentence, button or not |

Write these seven rows out **in the reply**, before writing HTML. It is under
fifteen lines and it saves the whole build.

If the project already has a component library, this table is the **list of components
to go and find**, not a list to write. See `S9`.

---

## D2. One single status mapping table

`todo` / `doing` / `done`, priority levels, roles — declare them in **one place** as
*label + colour* pairs, and use them identically on every surface.

Banned: the board uses filled badges while the table uses dots. The same status with two
shapes means the user has to learn it twice.

```
STATUS = {
  todo:   { label: "To do",          colour: grey,  icon: "circle" },
  doing:  { label: "In progress",    colour: grey,  icon: "circle-dot" },
  review: { label: "Pending review", colour: amber, icon: "circle-ellipsis" },
  done:   { label: "Done",           colour: green, icon: "circle-check" },
}
```

Colour still follows `M4`: these are real statuses, so colour is allowed. The four tones and the
badge shape come straight from the table in `M7`; "In progress" is grey, not amber, because amber means
"needs attention" and green is reserved for "done". Two statuses
with the same tone are separated by icon; the icon table is also in `M7`.

**A status used as a heading has the same shape in every view.** The group rows of a table and the column headers
of a kanban are **icon + name + count**, no pill; only a status used as the value of a cell
is a pill. A grouped table using pills while the kanban uses plain text is one status with two
shapes.

---

## D3. CRUD uses one set of templates

- **Create and edit use the same form.** Only the title and the button text differ. Two separate
  forms are two places to drift apart.
- **Deletes that can be restored** (trash, soft delete) **delete immediately + an "Undo" toast**, like
  the big apps: a confirmation dialog for every trash action teaches people to click "OK" without
  reading. **Confirmation dialog** only when it cannot be undone, or when deleting many rows at once. Whether it
  can be restored is logic, the user decides (`N10`); if the request does not say, ask in one line
  at delivery. See `layouts/overlay.md`.
- A confirmation dialog that requires **retyping a phrase** is built only when the request asks for it (a product
  decision, not a default), **except for deleting a whole space** (workspace, organisation): that
  loses every member's data, so by default require retyping the name, and the delete button unlocks when it matches.
  The big products all add a step beyond the normal confirm dialog for this (typing
  the name is the most common; some send a code by email or ask for the password). When that field exists,
  clicking outside does not close it (`I20`). The dialog and field templates are in `layouts/overlay.md`.

---

## D4. With multiple screens, report the layout **once** for the whole set

A multi-screen request goes into branch `U` like any build request (`SKILL.md` question 1): `U2` one line per screen,
a wireframe for the whole set, then the `D1` primitive contract settled at `U4` before building the first screen.
The default layout of each screen type is only used directly in the "just build it" mode or for work smaller than one
screen. At delivery, report **one** paragraph: list the surfaces built, which option the main screen follows,
and which shared template the secondary surfaces (forms, confirmation dialogs, empty states) follow. If they want changes, the
user says so.

---

## D5. The accent colour must actually appear

List where it is used. If the whole set of screens has no place using the accent colour, that
is **undecided**, not minimal.

The difference lies exactly here: dark grey **by intent** still shows the accent colour on the primary
button, on the selected state, on links. Dark grey **from indecision** means the whole
page has no place using the accent colour, and it reads as a draft.

`M2` says 5% accent. **5% is not 0%.**

---

## D6. Name the regions, then use exactly those names throughout

A multi-screen system always has a shared frame: left column, content area, right column,
mobile top bar, mobile bottom bar. Name them once, write them down, then use exactly those names
in every later reply.

It sounds minor, but in a real project this is the **first** item of `AGENTS.md`,
because without it every turn has to describe "that left column thing" again, and every
re-description drifts a little.

Alongside the names, also record **dead code**: which components are no longer imported
anywhere, so a later turn does not revive them.

---

## D7. Change the shared frame last, or not at all

Order of touching things, from least coupled to most:

1. Blocks already grouped by feature
2. Pages with few selectors
3. Large pages
4. Things shared everywhere — shell, sidebar, modal

See `refactor.md` rule `L8` for how to measure scope before choosing.

---

## D8. Content repeated on several screens must have one component

The sign: the same "course card" appears on the list page, the search page,
and the right column. Three places written three times will certainly drift three times.

Extract it into one component that takes props, and each place only changes size via
`className`. The card title font size must be **the same at every breakpoint and every placement** —
see `T8`, because block headings are computed from it.

---

## D9. "Build the design system first" requests: foundation first, screens after ⚑

When the request says **"design system"**, "build components first", "UI kit", "settle tokens, spacing,
typography before building screens", "build a design system", "component library first", it comes
here (`SKILL.md` question 1), **not into branch `U`**: a design system has no layout to draw a
wireframe for; what needs approving is the look of each primitive. The `D1` contract in this mode is no longer
seven lines of text in the reply, it becomes real code and a viewable page.

1. **Audit question 2 like every mode.** If the project already has tokens or a component library (shadcn, MUI, an
   in-house set), the design system is **rearranging what exists**: their tokens go into the two border roles
   of `M14`, their components get token adjustments to match (`S9`). Do not build a second set next to the old one.
   With shadcn: **keep shadcn's token names, point their values at the skill's tokens**, so shadcn components
   added later still get the right colours. When a name matches but the meaning differs, follow shadcn: shadcn's `--muted` is a
   *background*, so the skill's secondary text (`text-muted`) is written as `text-muted-foreground` throughout the
   project.
2. **A one-block brief, no stopping**: product, users, accent colour, font, style (`P1`),
   light only or with dark (`M20`), copy language (`T24`). If the request does not say, take the defaults
   from `brand-tokens.md` (near black, Inter, flat, light only) and write them into the brief. If the project has no
   brand colour yet, the design system page has a group of three suggested colours, like the Accent group on the
   wireframe bar (`design-process.md`, `U3`).
3. **Tokens**: copy `tokens.css` into the project's token file following `brand-tokens.md`, changing only
   the font block and the accent colour. The font size scale, rhythm and control heights come from `budgets.md`; radius
   follows `F1`, `M19`. **Do not invent new scales or tokens** (`M14`, `M16`): the skill's set has
   been tested, rethinking it from scratch throws that away.
4. **Components: the seven primitives of `D1`** (button, status badge, input, card, list
   row, modal, empty state), **plus whatever the request names**. Each one copies its recipe from
   its template file (the table "Open when building exactly that block", section 2 of `SKILL.md`), placed according to the
   project's folder conventions. Do not build every template "for completeness" (`S1`); at delivery list
   the templates still available, and the user names any they need.
5. **One design system viewing page**: route `/design-system` (if the project has Storybook, write
   stories instead of the page; with no app, one HTML file). If the project has dark mode, the page has
   a theme toggle at the top (`M31`) to review both versions, and the colour table lists values for both themes.
   Block order:
   - **Colour**: swatches with token name and value; text pairs on the main backgrounds with contrast ratio. The
     ratio column shows only the number; **only failing pairs get a label** ("Below 4.5:1", warning colour), passing pairs
     are left blank. Eleven identical green "Passes AA" rows say one thing eleven times, and the eye has to scan
     the whole column to find out whether any pair fails.
   - **Type**: every step of the font size scale, written as real sentences in the project's language (for
     Vietnamese, with full diacritics, `T5`), with size and weight noted.
   - **Spacing, radius, borders, shadows**: the steps in use, the two border roles side by side,
     the shadows of elevated layers.
   - **Each component**, one static example per state placed side by side (default, hover, focus,
     disabled, loading, error), not requiring a click to see. The page uses **the very components just
     built**, not redrawn to look nice: a nice page with drifted components gets approved by mistake.
     **State labels ("Default", "Hover", "Typing", "Error", "Disabled") sit in the same place in every
     block**: small text `text-xs text-muted` right above the example. Do not put labels where the hint
     or error sentence under an input goes: "Typing" under a field looks exactly like that field's real hint. Inputs
     laid out side by side are spaced as in a real form (`gap-y-5` or more), not `gap-y-2`:
     the hint of the upper field sits only 10px from the label of the lower one and reads as the lower field's label.

   **Forced-state examples** (a button prefilled with the hover background, a field drawn with the focus border, a select and modal opened
   inside a static frame, a long-label button in a narrow frame) are wrapped in `<div inert data-demo-state="hover">` (the
   value is the state name). `inert`: Tab does not stop at a fake-focused field, hovering changes nothing. The probe skips
   these blocks in the hover, elevated-layer, decorative-border and wrapping-button checks; unwrapped, every
   example becomes a false Broken item. The "Default" example is **not** wrapped,
   it is the real component for the probe to measure.

   The page is a review tool: flat like the skill's style, no hero, no marketing copy.
6. **Probe that page** (`--sweep`) until the `P` list is empty, at most three rounds.
7. **The only gate of this mode**: send the link, with one line *"Reply `ok` to approve. If you want to change
   the accent colour, font or radius, say so: it changes at the token level, and every component follows."* Stop and wait.

After approval, write the accent colour currently shown on the page (the colour the user picked from the suggested group, or
the first one if none was picked) into the token file before working on screens. Later screens take the normal path (default branch
`U`): the `U3` wireframe pastes the project's token file, copies classes from the just-approved components, does not show
the Accent group; `U4` assembles from exactly those components; the `D1` table counts as settled, not declared again. When the request asks for both a design system and
screens ("build the design system and then the orders screen"), do this whole mode, pass the gate, and only then
enter `U1` for the screen.

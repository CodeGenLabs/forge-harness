# Colour — rule M

This is the **single source** for every rule about colour, borders and shadows. `SKILL.md` only copies
a one-line summary with the rule number; explanations, exceptions and evidence live here.

Rules marked ⚑ have not been through any test round yet.

---

## Background and surface hierarchy

**M1. Page background is light grey, not pure white. Only cards are white.**

*Flat style: for another style chosen via `P1`, see `P2` in `references/styles.md`.*

**M2. 95% neutral, 5% accent.**

*Flat style: for another style chosen via `P1`, see `P2` in `references/styles.md`.*

This is the most important rule in the group, and it decides whether a screen looks
intentional or looks like nobody decided anything.

Real evidence (one project): a page gradually accumulated **five background
colours** for five kinds of block: beige for reminders, pink-red for house rules, light blue for
gifts and the log, indigo for gift chips, plus the green/yellow of statuses. Every block
demanded attention, so **no block stood out**, and the page read as "rainbow UI".

The opposite failure also happened: strip all colour and the white "reminder" card sat
among white task cards and was misread as a task. So neutral **does not mean
no anchor**:

> Stand out with **one small spot of colour**, not by filling the whole block. Keep the card white, put the icon in
> a **light 28px square** with a label in the same colour.

**M3. Exactly one accent colour for the whole app.** The primary button, links, active controls (checkbox,
switch, selected filter chip) all share it. The selected **navigation** item (sidebar, tab,
current page) uses a grey background or a `--foreground` bar, not the accent colour (element
recipe table below, `small-controls.md`). A second colour needs permission.

---

## What colour says

**M4. Colour reports status, it does not classify.**

*Recipe B has colour: the stat card icon tile, the per-type icon tile at the start of a row and dashboard chart series are filled with categorical colour, see `P12` in `references/styles.md`.*

> `M4` and `M5` are **the default style for projects with no colour language yet**. A project that already colours
> its own way (counted in `P4`) follows the project; keep only the rules about meaning and legibility
> listed at the top of `principles.md` (red for errors and destruction, one status table, colour never
> stands alone, 4.5:1 contrast).

The palette of ONE screen, nothing added:

| Colour | Only for |
| --- | --- |
| Neutral grey | Everything else: frames, secondary text, badges, icons, borders |
| Accent colour | The primary action button when it truly needs to stand out, the selected item, links. **Not** for count badges, **not** for status |
| Green | "OK", "done": badges, completed progress bars (`M7`). Fixed, not taken from the accent colour |
| Amber | "Needs attention": overdue, late submission, missed |
| Error red — `red` | Real errors the user must deal with: rejected submission, form errors |
| Danger red — `rose` | Actions that answer "yes" to one of the three questions in `I4` (data loss, ending something running, cutting access): delete, cancel plan, revoke key, leave team, sign out. Being recoverable does not make it stop being red. A standalone button has a faint background + red text always visible; a menu item turns red only on hover (`I4`) |

The two reds are deliberate, not a typo — see `M30`.

How to apply: when you are about to add a background colour for a kind of block, **stop and ask: what
status does that colour report?** If you cannot answer, it is decoration; use grey.

House rules are not errors → not red. Gifts are not a status → no colour of their own.

**M5. Classify blocks with icon + text + border, not with background colour.**

Reminders, house rules, gifts and the log are all white cards with thin borders; what is what is said by the **lucide
icon + label**. Hierarchy comes from font size, weight and spacing: primary text black,
secondary text grey; airy between sections, compact inside each card.

**M6. One signal per idea.** If the label plus a coloured tile already says "note", do not add
a "Note" badge as well. Same spirit as `F6`: a highlighted element needs only one marker.

**M7. A status standing alone in a cell is a coloured badge. A status inside a sentence is coloured text.**

Status column in a table, corner of a kanban card, top of a detail page: **pill badge with a light
background, dot + text in the same tone**. Scanning down a 20-row column, the eye catches colour faster
than text; with a grey dot + black text the whole column looks the same ("Active"
and "Inactive" differ only in the opacity of a 4px dot).

```html
<span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
  <span class="size-1.5 rounded-full bg-current"></span>Active
</span>
```

Four tones, nothing added. Which status gets which tone follows **meaning**, not taste:

| Tone | Background / text | Token (no Tailwind) | Meaning | Examples |
| --- | --- | --- | --- | --- |
| Grey | `bg-zinc-100 text-zinc-600` | `--neutral-bg` / `--neutral` | Waiting, draft, not started, neutral | Prospect, Draft, To do |
| Green | `bg-emerald-50 text-emerald-700` | `--success-bg` / `--success` | OK, running, done | Active, Online, Paid, Delivered |
| Amber | `bg-amber-50 text-amber-700` | `--warning-bg` / `--warning` | Needs attention | Overdue, Expiring soon, Paused |
| Red | `bg-red-50 text-red-700` | `--error-bg` / `--error-strong` | Stopped, failed, rejected | Inactive, Cancelled, Error |

**If the project has dark mode, every `-700` class in the table above comes with a `dark:` `-400` version**
(`text-red-700 dark:text-red-400`; **amber alone is `text-amber-700 dark:text-orange-400`**, see
below; without Tailwind use the tokens, already flipped). `-700` does not change by
itself on a dark background: status text drops to 2.9–3.7:1 (`red-700` 2.9, `emerald-700` 3.5, `amber-700`
3.7). Miss one spot and the same meaning shows in two hues on one row ("Urgent" `text-amber-700` dark orange 3.74:1 next to "Overdue 3 days"
`dark:text-amber-400` bright yellow). Gather each tone into one helper so
you do not have to remember every spot.

**Pick the dark version by hue, not by step number.** Moving to a lighter step, most of the Tailwind scale keeps its hue
(red, green, blue, violet shift 0–6° OKLCH), but **amber drifts to yellow**: `amber-700` 49°,
`amber-400` 84°. "Overdue" orange in light mode becomes yellow in dark mode, reading as two colours, two meanings. Dark amber uses **`orange-400`** (56°, a 7° shift, 7.9:1 on a card); the badge
background keeps `amber-500/15` (a faint background does not read as a hue the way text does). Other colours outside this table (avatar, chart, user-picked
labels) work the same way: if the shift from the light version exceeds ~20° OKLCH, switch to a closer colour family. Probe `--dark` measures this pair.

**Every badge also gets `ring-1 ring-inset ring-black/5`** (dark background `ring-white/10`). The badge background
is so light it differs from what is under it by only a few percent: `zinc-100` (#f4f4f5) on a selected table
row or on the page background (#f4f4f6) loses its frame completely, and "Prospect" is just a dot and text.
A 5% inner ring keeps the frame on every background without adding weight.

**When one flow has both an "in progress" step and a "done" step, green belongs to "done".** Orders:
Pending → **amber** (the seller must do something), Shipping → **grey** (running, but
nobody has to do anything), Delivered → **green**, Cancelled → **red**. Making "Shipping" green too means
two statuses with different meanings share a colour (`N2`). A customer's "Active" stays green because
that flow has no "done" step.

**When a flow has two or more statuses in the same tone, the dot becomes an icon, one shape per status.**
Four tones are not enough for a work flow: by the paragraph above, To do and In progress are both grey, and
a table grouped by status shows three grey groups and one green, and a glance cannot tell the groups
apart. The large work management apps separate them by **shape**, not by adding colour:

| Status | Tone | Lucide icon | Why |
| --- | --- | --- | --- |
| To do | grey | `circle` | hollow ring: not started |
| In progress | grey | `circle-dot` | has a core: someone is on it, nobody else has to act |
| In review | amber | `circle-ellipsis` | the reviewer must do something, same reason as "Pending" |
| Done | green | `circle-check` | |
| Cancelled | red | `circle-x` | |

Icon `size-3.5` inside the badge (replacing the dot), `size-4` at group headers and kanban column headers, colour
`-600` of the same tone (`text-zinc-500` for grey). This one table is used on every surface (`D2`).

Dark background: Tailwind classes add `dark:` (background `-500/15`, text `-400`); tokens are already switched
in the `.dark` block of `tokens.css`.

- Green is a **fixed** colour, not taken from the accent colour. The default accent colour is near black, and a solid black badge in a table looks like a button.
- Text `-700`, not `-500`: small text on a light background needs weight to reach contrast (`P3`).
- No `border`. The `ring-black/5` inner ring above is a frame that keeps the badge from dissolving into the background; it does not count as a second signal (`M6`).
- One mapping table for the whole app, see `D2` in `system.md`.

A label **inside a line of secondary text** ("Weekly · 2 days overdue") stays coloured text,
no background. A pill in the middle of a sentence makes the line bulge.

---

## Approved exceptions

**M8. Data-encoding colour does not count against the one-accent-colour budget.**

Category tags, industry labels and model labels may use many colours, because the colour there **carries
information**. Four conditions; miss one and it goes:

- Only for real categories, things people need to tell apart at a glance.
- Always **light pastel**: background around 10%, strong text in the same tone, border one step darker than the background.
- **One label, one fixed colour** across the whole app. If "Technology" is blue, it is blue everywhere.
- Never spreads to buttons, block backgrounds or rules.

Name the categorical colour scale **differently from status names**. A real project used separate
`iris` / `magenta` / `coral` instead of reusing `accent` / `danger`, so that a red "B2C"
badge is not misread as an error.

**M9. Familiar symbols keep their colour, even when it is not a status.**

Settled, after neutralising destroyed the meaning:

- Top 3 medals filled gold / silver / bronze — colour **on the icon**, not on the card.
- The first-place card has a gold border, **background still white**. A light gold background turns beige and reads as an old or locked card. Tried and dropped.
- The streak flame is filled: yellow core, orange outline. A thin grey flame sinks completely.
- The `*` for required fields is red. It is not an error, but "red `*` = required" is so widespread a convention that grey is harder to read.

General principle: when neutral colour makes **a symbol lose its meaning**, choose the meaning,
state one sentence of reason, then record the exception here.

**M10. You do not control the colour of content the user writes.** SOPs, notes with
emoji, red text in markdown — only make the surrounding **frame** neutral; do not touch
the content.

**M34. Things the user creates get an identity colour.** Projects, boards, workspaces,
categories, kanban columns, channels: things the user names, that appear in many places, and that need recognising
at a glance in a long list. A one-accent app looks tidy but easily turns monotonous;
colour spots belong in the **data**, while the **frame** (buttons, sidebar, header, inputs) keeps one
accent colour as in `M2`. Different from `M8`: `M8` is a category label attached to an item, `M34` is the colour
of the entity itself. One card can carry both.

- **When to use:** the app has entities like the above, and they appear in two or more places (sidebar, table, breadcrumb, picker) or there are five or more of them. If not, skip it; do not invent entities to have something to colour. If so, just do it, do not ask.
- **The six avatar hues**, same order (`components/avatar.md`): emerald, sky, indigo, pink, amber, violet. No extra hues, no `red` / `rose` (`M30`).
- **Colour sits on small marks**, not large areas: a `size-2` dot in the `-500` hue (dark background `-400`) next to the name; a rounded square with the first letter, on the avatar pattern; an `h-1` strip at the top of a card or column header; a cover image the user uploads. **Do not** fill the whole card background, row background or column background, and do not colour the name text.
- **Colour is data, not computed at render time.** Creating a new one offers a six-colour picker, defaulting by `id` like the avatar; it is saved with the entity. Sidebar, table, breadcrumb and picker all show the same colour.
- **The name always shows next to the colour.** Colour helps scanning, it does not replace text; dots and squares get `aria-hidden`.
- **Frame states do not change:** the selected sidebar item keeps the neutral `bg-secondary` background (`checklist.md`, Sidebar section), and the dot keeps its colour; it does not switch to the entity colour.
- Does not count against the one-accent-colour budget (`budgets.md`). If the project already colours entities its own way, follow it.

```
  PROJECTS                      ┌─────────────────────┐
  ● Client A website            │▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│ ← h-1 strip in project colour
  ● Internal app                │ Fix signup form      │
  ● Marketing Q4                │ [Bug] [Urgent]       │ ← M8 labels
                                └─────────────────────┘
```

**M11. Text has only three shades.** Primary text, secondary text, and the colour on an accent background.

The only exception: **navigation items when not hovered/not selected** use
`foreground/70`, so hover has room to "light up" while the resting state still reads clearly. Using
`--muted` there makes item names too faint on white.

⚠️ A trap hit in a real project: a token named `--text-muted` was aliased to `--text-normal`,
so "secondary text" and "primary text" were the same black. Do not trust token names — open the real
value and look. See `refactor.md` rule L3.

**M12. No gradients.** The only exception: **avatars and identity marks**
— user avatars, workspace icons, organisation logos. They are small circles or squares
under 40px, and a gradient there plays the role of an image, not a background.

*Flat style: for another style chosen via `P1`, see `P2` in `references/styles.md`.*

Never for buttons, cards, page backgrounds or text (`bg-clip-text text-transparent`).

---

## Borders and shadows

> **⚠️ Rule reversed.** An old version of this skill banned card borders and required separating blocks by background
> difference. **That rule is gone.** Settled: the "1px hairline + radius,
> no shadow" style. Do not revive the old rule.

**M13. Separate blocks with a 1px hairline + radius, not with shadows.**

*Flat style: for another style chosen via `P1`, see `P2` in `references/styles.md`.*

The page is flat and clean; hierarchy comes from font size, weight and text colour.

*Exception: a card standing alone on an empty page — see `M29`.*

| Element | Recipe |
| --- | --- |
| Card / frame | white, 1px very light grey border, 16px radius `rounded-2xl` (`F1`), **no shadow** |
| List of many items | **one** frame, rows divided with `divide-y`. The header row and the final action row sit **inside** the frame |
| Secondary summary block | light grey background + border, radius like a card |
| Selected sidebar item, tree item | `--secondary` background + `font-medium`, **no border**, no accent colour; hover `--background`, unselected items have no background. Selected is one step darker than hover (`I10`, `I15`) |
| Horizontal tabs above a table / list | the selected tab has **a `bg-tab-selected` background (8% text overlay, correct on both cards and the page background), transparent border** (no white background, no `--surface-hover`: invisible at a glance on a white card), every tab has `border`, unselected items `border-transparent`. See "Tab bar" in `components/small-controls.md` |
| Input | border — this is where a border plays its role best; people must see the edge of the typeable area |

**M14. Two border tokens, split by role. There is no third.**

| Token | For | Why |
| --- | --- | --- |
| `--border` | Card borders, dropdown frames, dividers in lists and menus, **the rule under the sidebar head and under the header** (same colour as menu dividers, settled, `layouts/app.md`) | **Decorative**: it only marks a boundary, as light as it can be |
| `--border-strong` | **Input borders**, **outline button borders**, select, card border on hover, **every rule sitting directly on the grey page background** (page footer; see below the table; the `underline` tab row rail alone is `--tab-rail`, `components/small-controls.md`), the vertical sidebar rule **only when the content area is also white** (`layouts/app.md`) | **Functional**: inputs and outline buttons share the white of the card, and the border is the only thing saying "type here", "click here" (`I8`) |

Within each group every use shares exactly one token, so hairlines are not darker in some places
and lighter in others. To lighten card borders, lower `--border`; inputs do not get lighter with it.

**`--border` is only correct on white.** It is `#f7f7f8`, **lighter** than the page background `--background`
`#f4f4f6`: drawn directly on grey it becomes a faint pale streak, invisible at a glance, and on a close look
it seems like a bug. For every rule sitting **directly on `--background`**, with no white card
under it (`border-t` of the page footer, `border-b` under a grey title strip, `divide-y` between blocks
placed straight on the page background, `<hr>` between two areas), do one of two things:

1. **Drop the rule** and separate with whitespace (`mt-12`, `pt-8`) or a background difference. This is the default:
   the footer stands at the end of the page, the content above it has ended, and whitespace is enough to say "end of main content".
2. If a rule is required (a long multi-column footer continuing the content, a grey title strip that needs an edge),
   use **`border-border-strong`**, never `border-border`.

Before delivery, check every `border-*`/`divide-*` using `--border`: does that element or its nearest parent
have a white background (`bg-surface`, `bg-surface-overlay`)? If not, change it in one of the two ways above.

Unchecked checkboxes and radios also use `--border-strong`, the same weight as inputs.

Dark backgrounds keep exactly these two roles, both as translucent `rgba`: `--border` 1.23:1 on a card, `--border-strong`
1.33:1 (do not reuse `0.2`: 1.47:1, table rows become a grid). Inputs on a dark background
**keep their border** `--border-strong` (`M32`).

**The project already has its own border tokens** (building new in an existing project, the two rebuild modes): border
grey is **shape, not a colour role** (`review.md`), so map their tokens onto the two roles above
rather than keeping how the old version used them. The project's lightest step goes to the decorative role (card borders, dropdown
frames, dividers). App shell rules: **the segment under the sidebar head and the segment under the header
use the same token**, because the two segments join into one line (probe: "dividers aligned but different
colours"). Any step as dark as `#e4e4e7` or darker (~1.25:1 on white, the level already criticised as "heavy sidebar
rule") is not used for shell rules or card borders, only for inputs and outline
buttons. Already hit: the rule under the logo `border-light` `#f1f5f9` joined
the rule under the header `border` `#e2e8f0`, and the filter card, list card and detail card were also
`#e2e8f0`: the sidebar line was fine, everywhere else was heavy, and viewers assumed the brand demanded it.

> Tried darkening control borders to reach 3:1 (WCAG 1.4.11): inputs,
> selects, outline buttons to `#8a8a91`; checkboxes, radios to `--muted`; switch
> track to `muted/75`. Rejected: seen for real it was **heavy and ugly**, all reverted.
> Do not propose it again for ordinary projects; only for projects that must meet AA (see `P3`).

⚠️ **Do not use `--border` for inputs or outline buttons "for consistency".** Lowering
`--border` to lighten cards and dropdowns makes inputs and buttons dissolve into the background. It really
happened: `--border` was lowered from `#f3f3f4` to `#f7f7f8` for the dropdown frame,
and the outline button sharing the token looked disabled.

⚠️ Without a border colour class, Tailwind v4 leaves `border-color: currentColor` — a button with black text
gets a **near-black border**. If you see an unusually dark border, check this first before
suspecting the colour code.

**M15. Shadows only for elevated layers.**

*Flat style: for another style chosen via `P1`, see `P2` in `references/styles.md`.*

Modals, command palettes, dropdowns, popovers and toasts get a shadow because they sit **above**
the page. Nothing that sits **inside** the page does.

Elevated layer shadows go through two tokens; do not write bare `shadow-lg`, `shadow-xl`: `shadow-popover`
(dropdown, menu, popover, toast) and `shadow-modal` (modal, slide-over panel, command palette).
On light backgrounds they equal `shadow-lg` / `shadow-xl`; on dark they are stronger (`M23`). Every frame
also has `border border-border`. The background table for each block is at the top of `layouts/overlay.md`.

About to add `shadow-*` to a block inside the page → try a border first and see whether it separates
the block enough. It almost always does.

*Exceptions: a card standing alone on an empty page — see `M29`. The selected cell of a `segmented`
tab (a raised key on a sunken track), using exactly the two `--shadow-segment-*` tokens —
see "Tab bar" in `components/small-controls.md`.*

**M16. Do not spawn new border tokens from the accent colour.**

Static borders only have the normal border token (and at most one darker step). State borders
only have `--border-focus`, and it only shows on focus.

Finding yourself about to write `--primary-ring` or `--accent-border` is a sign you want to emphasise
a block with a border — and emphasis by border is the cheapest kind. It really happened: one
build invented `--primary-ring: rgba(233,237,245,0.22)` and then gave a card a highlighted border, which
glared on a dark background.

**M17. `ring` when layout must not be touched, `border` for everything else.**

`border` eats into the box under `box-sizing: border-box`, so fixed-size elements
shrink. For an outline around an avatar or a standard-size square, use `ring-1`.

**M18. Child elements in a hoverable row must not share a token with the row's hover background.**

A hovered row changes background (rule `I10`: `--item-hover` or `--surface-hover`). If a status square, checkbox or
avatar inside also uses that exact token as its background, or has only a light border, then on
hover they **disappear**.

*How to check:* hover the row and count whether everything is still visible.

---

## Nested radius

**M19. Nested radius: outer = inner + distance between the two edges.**

```
R_outer = r_inner + d        d = padding of the outer frame + border width (if any)
```

**Why:** two corners only look parallel, with an even gap all along the curve, when
they share **one centre**. The formula above is exactly the condition for the two centres to
coincide. Deviate from it and the gap at the corner differs from the gap along the side:

| Inner radius | Gap at the corner | Looks |
| --- | --- | --- |
| **Equal** to the outer radius (12 inside 12) | **≈ 1.4 × d**, wider than at the side | The corner bulges, like two shapes that do not fit |
| **= R − d** | **= d**, exactly as at the side | Parallel, tidy |
| Much smaller, or square | Narrower than d, may reach 0 | The inner corner is squeezed, poking into the outer curve |

**Common pairs, all on the Tailwind scale:**

| Outer frame | Padding | Inner element |
| --- | --- | --- |
| `rounded-xl` 12px | `p-1` 4px | `rounded-lg` 8px |
| `rounded-2xl` 16px | `p-1` 4px | `rounded-xl` 12px |
| `rounded-2xl` 16px | `p-2` 8px | `rounded-lg` 8px |

All three pairs only use steps on the four-step scale of `F1`. If the formula gives a number
off the scale (for example `p-1.5` gives 6px), **change the padding to fit the scale**; do not spawn
a new radius step.

**Only apply when the two edges are close** — when `d` is not larger than `R`. Dropdowns, menus,
pill-shaped tab bars, inputs with a button inside: all are this case, and the eye compares the two
corners immediately.

**At large distances drop the formula.** A `rounded-2xl` 16px card with `p-5` 20px holding
a button: the formula gives `16 − 20 = −4`. The two corners are too far apart for the eye to compare, so use
radius by role (`F1`): card 16px, buttons and inputs 12px, small controls 8px. Do not force
the formula into a negative number or 0.

With a 1px border, `d` gets 1 added. A 1px deviation is invisible, so just take the nearest step
on the scale.

Do not mix fully rounded buttons with square-ish buttons in the same group; status badges
are the exception.

---

## Dark mode

**M20. By default build light mode only.** Dark mode is double the work and double the places
to check contrast. Only do it when the user says they need it, and ask one question at delivery.
When doing it, follow all of `M21`–`M23`, `M31`–`M33`, and the `.dark` block of `tokens.css`.

*Flat style: for another style chosen via `P1`, see `P2` in `references/styles.md`.*

**M21. Elevation levels get lighter on dark backgrounds; filled areas are overlays that keep their contrast with the background behind
them, not their direction.**

Two kinds of surface, two ways of switching theme:

| Kind | Includes | Light background | Dark background |
| --- | --- | --- | --- |
| **Level** | page background → card → small elevated layer (`--surface-overlay`) | grey page, white card and elevated layer | **gets lighter**: `#05060f` → `#0f111a` → `#171a26`, each step ~1.07–1.09:1 |
| **Filled area** | secondary button, selected item / tab (`--secondary`), hover backgrounds (`--item-hover`, `--button-hover`), tracks, chips | overlay **darker** than the background behind | **translucent white** overlay, **lighter** than the background behind |

Filled areas are darker than the card on light backgrounds and lighter than the card on dark: correct in both. What must be kept
is the **contrast** with the background right behind it, equal across the two themes (selected `--secondary`
1.22:1 in both; hover background 1.10 / 1.12:1). This is how almost every large design system does it
(7/7 systems with data).

- **Dark filled areas are written as translucent white** (`white/4`–`white/10`), not solid grey.
  A translucent overlay is correct on the page background, a card or an elevated layer; solid grey is only correct on one background.
  In code: the `bg-foreground/5` overlay (flips with the theme) or a token, not `dark:bg-zinc-800`.
- **Do not use `--background` as a hover or selected background.** On dark it is darker than the card, so hover
  sinks to 1.07:1, almost invisible. The hover background for an indented item is `--item-hover` (`I10`).
- **Selected is exactly one step darker than hover in both themes** (`I10`, `I15`).

*How to check:* list the page background, card and elevated layer for each theme: the dark ones must get lighter. Then measure
the hover and selected backgrounds on a card in both themes: the contrast in both versions is about the same, and selected
is darker than hover.

> Do not make the secondary button **sink below the card** on dark: a dark `--secondary` of `#010207`, below even the page
> background, makes buttons and selected tabs almost inseparable from the background. A secondary button `#1c2030` on a card
> `#0f111a` that looks "raised" is the right direction; what to watch is the contrast, not the direction.

**M22. On dark backgrounds, the accent colour is only used as a fill, never as a thin line.**

In dark mode the accent colour is usually near white. As a button fill it looks good; used as an input
border on focus, an underline or a selection indicator it becomes a solid one-pixel white thread,
harsh and cheap. Thin lines use the same colour **with opacity lowered to about 42%**, just enough for 3:1 with the background
(WCAG 1.4.11). At 35% it is 2.9:1, a fail.

**M23. The skill's default dark mode is a very dark navy. This is style, not convention:
if the project already has its own dark palette, follow the project.**

Most large design systems use a neutral or near-neutral dark background; navy is one
style among many. If the project has zinc grey, neutral grey, or a dark background tinted with the brand colour, keep
it (`P10`, `V4`). If it has none, take the `.dark` block of `tokens.css`.

Whatever the style:

- **No absolute black, no absolute white**, including the primary button's hover background. Near-black background,
  near-white text. `--primary-hover` shifts **towards the background** by one step in both themes: lighter on a light
  background, darker on a dark one (`#e9edf5` → `#cfd5e0`), never up to `#ffffff`.
- **Borders are translucent `rgba`**, not solid colours, or they become a grid. On dark backgrounds borders
  **swap roles**: page background and card differ too little (1.07:1), so the border is the main thing separating blocks.
- **Shadows stay, get stronger, and pair with a 1px border.** A 10% shadow on a near-black background is almost invisible, so
  a dark elevated layer has three things at once: a background one step lighter (`M21`), a `border-border` border, a strong
  shadow (`--elevation-*` in the `.dark` block). Do not drop the shadow, do not replace it with a glow.
- **No coloured shadows on dark backgrounds** (orange shadow, amber shadow under a button): on dark they become
  a dirty glow. `dark:shadow-none` for every tinted shadow.

*Flat style: for another style chosen via `P1`, see `P2` in `references/styles.md`.*

**M31. Theme switch: Light / Dark / System, default System.**

- **All three options visible at once**, not a single button cycling through (the user has to click to
  find out what comes next). Default **System** (`prefers-color-scheme`), not Light.
- **Placement:** in an app it goes in **Settings → Appearance** or an Appearance item in the **account menu**;
  if the request puts it on the header, it is an **icon button** (`Sun` / `Moon`) opening a three-item menu, with the selected item
  marked ✓. Public pages, docs: a group of three icons (radiogroup) in the footer or an icon button on the header.
- **Auth screens and error pages do not need a theme switch**: the head script applies the saved choice or follows
  the system for every route, and the user changes it inside the app.
- **Remember the choice, no white flash on load.** A script sets the class on `<html>` before painting;
  `<html suppressHydrationWarning>` because the script modifies `<html>` before React.
- **Disable transitions for one tick when flipping the theme**, otherwise the page background changes instantly while buttons and cards
  transition for 200ms out of sync.
- **Browser layer:** `color-scheme` follows the theme (the `:root` / `.dark` blocks of `tokens.css`
  already have it), so native scrollbars, date pickers, autofill and `<select>` render in the right version. Two `theme-color` tags
  by `media` are optional.
- **`dark:` must follow the class, not the machine.** Tailwind v4 by default runs `dark:` on
  `prefers-color-scheme`; without the `@custom-variant dark` line in `tokens.css`, clicking Dark on
  a machine in light mode gives dark tokens and light `dark:` classes.

Next.js: `next-themes`.

```tsx
// app/layout.tsx
<html lang="vi" suppressHydrationWarning>
  <body>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  </body>
</html>
```

The header icon button reads `resolvedTheme` after mount (before that it renders a fixed icon), otherwise
the HTML mismatches on hydrate. Without Next, an inline script at the top of `<head>` reads `localStorage` +
`matchMedia("(prefers-color-scheme: dark)")`, attaches `.dark`, and listens for machine changes while on System.

**M32. On dark backgrounds, some things change how they are drawn, not just their colour.**

| Thing | Dark background | Why |
| --- | --- | --- |
| Input, select, textarea | **keep the border** `--border-strong`, translucent background `dark:bg-white/4` | dropping the border and keeping only a faint background loses the edge of the typeable area; every large system keeps the border |
| Inverted button (`--foreground` background, not `--primary`) | switch to the `secondary` variant, or translucent white background + border | inverting directly gives a glaring white block, heavier than the primary button. Only the accent colour may become a light block |
| Tooltip | **inverted**: `bg-foreground text-background` | on dark the tooltip is light, standing out from every level |
| Backdrop behind modal, panel, slide-over sidebar | **`bg-black/…`** in both themes, not `bg-foreground/…` | `foreground` flips to near white, and the backdrop becomes a bright fog over the page |
| Highlighted and selected items written with JS conditions (`isHighlighted && …`, `isActive && …`) | `bg-item-hover` (highlighted), `bg-secondary` (selected), like the `hover:` classes | `bg-background` in a JS condition slips past every `hover:` grep; on dark it becomes a hole punched in the dropdown (picker, command palette) |
| Status-coloured text and icons without background (`text-amber-700`, `text-red-700`, `text-emerald-700`) | add `dark:text-*-400` of the same hue (tokens `--warning`, `--error-strong`, `--success` already flipped) | `-700` on dark is only 2.9–3.7:1, below the text threshold (`M7`) |
| Light `-50`, `-100` backgrounds (badge, banner, chip, answer tile) | the `-500` colour at 10–20% overlay, text `-300`/`-400` | a `-50` background on dark is a pinkish-white block in a black screen. Meaningful colours are already in `tokens.css` |
| Gradients, decorative colour blobs | turn off (`dark:hidden`) or swap for a dark version | a light colour blob on a dark background glares |
| Charts | bars and filled areas use `--chart-fill` (accent colour at 70% on dark); the categorical scale has a dark version (`components/charts.md`) | near-white accent bars at 100% are the most glaring block on screen; the grey "Other" `slate-300` becomes the most prominent |
| White-background images, logos | images that need a dark version use `<picture><source media="(prefers-color-scheme: dark)">` or two images by class; logos switch to the light version | |
| Avatars, small images | `ring-1 ring-border` ring | dark images dissolve into the background |

**M33. Theme-locked areas redeclare tokens locally; external libraries read tokens.**

- **Always-light / always-dark areas** (a share page on a cream background, an always-dark hero): class `.force-light` /
  `.force-dark` on the outermost frame; `tokens.css` already makes these two classes re-read the right token set,
  and every child component follows without passing anything down. The `@custom-variant dark` of `tokens.css`
  already excludes `.force-light` areas, so `dark:` does not leak in. For a whole page locked to one theme, use `next-themes`
  `forcedTheme`, and hide the theme switch on that page.
- **External libraries read tokens**, not their own default colours: toasts, dialogs, page transition
  progress bars, editors, calendars. Overriding styles with `var(--surface-overlay)`,
  `var(--border)`, `var(--foreground)`, `var(--primary)` flips them with the theme automatically. Leaving the library's default
  colours gives a white box in the middle of a dark screen (only people who turn on dark mode see it, so it takes a very long time
  before anyone reports it).

---

## Token

**M24. Every colour goes through a token named by role.** No hex codes scattered in markup.

**M25. One concept, one token.** Every rule and border shares one name. Do not
use `divide-border` in one place and `border-muted/25` in another.

**M26. Every colour and font is gathered into a marked block at the top of the file.** Outside that block no
colour code may appear. With dark mode, the accent colour lives in **two places**: `:root` and
`.dark`. Missing the second place makes the accent colour invisible on dark backgrounds.

**M27. The rebranding block must be copied verbatim from `tokens.css`.** Open the file and
copy; do not retype from memory, do not invent hex codes. Once an AI invented
a purple `#a99cff` and a malformed `#fa99cff0d`. If you need another colour, change exactly one line.

**M28. At delivery, point out exactly where to rebrand.** One line: "change the accent colour on line
14, the font on line 8". With dark mode, say clearly that there are two places.

---

## Card standing alone

**M29. A screen with exactly one card on an empty page drops the border. If it sinks too much, use
a very faint shadow, not a darker border.**

*Flat style: for another style chosen via `P1`, see `P2` in `references/styles.md`.*

Sign in, sign up, forgot password, single-block onboarding screens. (Error pages do not use a card, see
"Error page" in `layouts/app.md`.) What they have
in common: **there is no second block to separate from.**

`M13` requires borders because borders mark boundaries between blocks sitting side by side.
On a screen with one card that job is gone — the border is now just
a line drawn around a box, and it makes the card look like a frame waiting for content.

Order to try, stop as soon as it is enough:

1. **No border, no shadow.** Grey page background (`--background`) + white card (`--surface`) already has enough contrast to read as a boundary. This is the default.
2. **If it sinks too much, add a very faint shadow.** About Tailwind's `shadow-sm` — faint enough to be felt rather than seen. The card is now **floating above** an empty page, so it fits the "elevated layer" spirit of `M15` better than a block inside the page.
3. **Never use both border and shadow.** The two do the same job. If you have a shadow and still feel a border is needed, the shadow is wrong, not the border missing.

**Do not patch it with a darker border.** Seeing the card sink and increasing the border weight
goes against `M14` — a darker border makes the box show more clearly than the content inside it.

With two or more cards on the screen, go back to `M13` as usual.

**Dark backgrounds keep exactly this, no border added even though `M23` says borders carry block separation.** A dark card differs from the background
by 1.07:1, close to the light version's 1.10:1, enough to read as a boundary. Tried on a sign-in screen: a
`--border` border turned the card into a frame, and the `--elevation-popover` shadow was almost invisible. `M23` is about blocks
sitting side by side in a page, not about a single card.

---

## Two reds

**M30. Red has two hues for two jobs. Do not mix them, do not add a third hue.**

| | Hue | Job | When it shows | Where |
| --- | --- | --- | --- | --- |
| **Error** | `red` | *Something is already wrong*, must be fixed to continue | After the user does something wrong | Inputs, error text, server error banner |
| **Danger** | `rose` | *Clicking it cannot be undone* | Button: always visible, faint background. Menu item: only on hover (`I4`) | Delete, close account, leave team, sign out (menu item) |

**Why separate them.** The two jobs differ in timing and weight:

- **Error** is something that **has happened**. It must be recognised immediately, not confused with anything — so it uses `red`, the standard red that anyone reads as "wrong".
- **Danger** is **a reminder before clicking**, showing only because the pointer passed over. Nothing is wrong yet. If it were as red as an error, every time the pointer crossed a menu the user would feel they had just broken something — so it uses `rose`, pinker, one step softer. Same spirit as `I4`: a delete button does not shout at the user.

**Test when unsure:** *has the user done anything wrong yet?* Yes → `red`. No,
just about to click → `rose`.

### Steps to use — do not invent your own

Each cell gives the Tailwind class, with the CSS token in brackets. Both ways give the same colour
(`tokens.css`); projects without Tailwind use the token.

| Job | Error (`red`) | Danger (`rose`) |
| --- | --- | --- |
| Text, icon | error text under an input: `text-red-600` (`--error-text`) — `red-500` on white is only 3.8:1, failing 4.5:1. The required-field `*` uses this hue too (exception `M9`) | `text-rose-700` (`--danger`) (always-visible button, menu item on hover) — `rose-500` on a faint background is only 3.2:1 |
| Border | `border-red-500` (`--error`) | — *(no red border)* |
| Faint background | `ring-red-500/10` (`--error-ring`) around an error input **with focus** | button: `bg-rose-500/10` (`--danger-bg`), hover `/15` (`--danger-bg-hover`) · menu item: `hover:bg-rose-500/10` |
| Banner | `bg-red-50` (`--error-bg`) · `border-red-200` (`--error-border`) · title `red-700` (`--error-strong`), description `text-foreground/80` (`components/banner.md`) | — *(no banner)* |

The "—" cells are **deliberately empty**: dangerous actions never get a red border or a red
banner. Finding yourself about to write `border-rose-*` means you are turning a reminder into a warning.

**There is no third hue.** No `pink`, no `orange-red`, no custom red
`#e53e3e` to **report status**. If you need something "lighter than an error but still needing attention",
that is **amber** (`M4`), not a new red.

**Scope: `M30` only applies to colour that carries meaning.** Identity colours — initial-letter avatar
backgrounds, workspace icons — report nothing, so they are outside this rule. Same reason as
the `M12` exception: there colour plays the role of an image, not a status. But so that
nobody has to hesitate, the avatar palette **does not use `red` or `rose`** — see
`references/components/avatar.md`.

### Rebranding

If the brand has its own red, edit the `--danger*` / `--error*` block in `tokens.css`,
and change **both groups at once**, keeping the distance between them: error stronger and more standard,
danger softer. Change one group and forget the other and the two jobs look like
one again. Projects using Tailwind classes must remap in `@theme` or replace the classes;
editing tokens alone does not change `text-rose-700` (see `tailwind-v4-traps.md`).
After changing, re-measure contrast: text on background must be at least 4.5:1.

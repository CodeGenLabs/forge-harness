# Shape and layout — rules F

The single source for every rule about blocks, grids and spacing. Exact numbers live in
`budgets.md`. Rules for narrow screens live in `responsive.md`.

---

## Blocks

**F1. Radius is assigned by role and by height, not by feel.**

Four steps, no more:

| Step | Value | For |
| --- | --- | --- |
| Round | `rounded-full` | Avatar, chip, badge, round things |
| Large | `rounded-2xl` 16px | Card, dropdown frame, modal |
| Middle | `rounded-xl` 12px | **Default.** Every element **40px tall or more**: button, input, sidebar link, list row with hover, 40px menu item |
| Small | `rounded-lg` 8px | **Only** elements **under 40px tall** (36px or less): small `h-9` button, compact menu item, `h-7`/`h-8` icon button, small square |

**Height rule: 40px or taller means at least 12px.** Look at the element's height
first, then pick the step; do not pick by type name ("menu item means 8px"). A 40px
menu item with an 8px radius has stiff corners and clashes with the 12px buttons and
inputs next to it (Settled). Below 40px, 12px starts to look too round for the
height, so drop to 8px.

Using `rounded-md`, `rounded` or a custom number creates a fifth step. *Named exception:
the checkbox square, 20px with `rounded-md`, 16px with `rounded` (`components/choice-controls.md`):
a square smaller than 24px with an 8px radius turns almost round and gets confused with a radio.* Only round things that **have a background or a
border**; an inline text link gets no radius.

Nested radii shrink with depth — see `M19`.

**F2. Nest blocks at most two levels deep.** Card inside card inside card is a sign
that nobody has decided what contains what.

**F3. Not one card per item.**

Many items of the same kind go into **one block**, separated by lines. Four identical
white cards in a grid read as four peer blocks, not as one
list.

The list's header row (icon + label, figure on the right) and the closing action row
("View all") sit **inside** the frame, not outside it.

*Exception: kanban cards*, because they are draggable objects.

**F4. Do not wrap a table in a card.** A table already frames itself with lines: the table itself is a white frame with a thin border; do not nest it inside a padded card.

**F5. Do not split into three equal columns just because there are three items.** Lay out by importance.
The most important widget takes more columns.

**F6. A highlighted element in a group needs only one signal.** If a card already has a badge and
is already taller than the other two, do not add a border too. Three signals for one thing is two
too many, and the extra one is always the cheapest one.

**F7. No full-screen hero.** Inside an app the user lands on the work — no
banner, no welcome line taking up space.

---

## Alignment

**F8. Cards in the same grid align at every tier, not just at the bottom.**

When descriptions differ in length, the price block, the horizontal rule, the list and the button all drift.
Give the description block a fixed `min-h`. **Horizontal rules that do not line up across three cards are
what the eye catches first.**

**F9. Align the bottom with `mt-auto` on the action button.** Content with different line counts
is normal; the buttons must still sit at the same height.

**F10. When a widget is stretched taller than its content, the content grows with it.**

For a `row-span-2` card, let the content grow with `flex-1` plus `min-h`. Do not fix the
height and push things to the bottom with `mt-auto` — the top becomes dead space.

`mt-auto` is only for **buttons**, not for content blocks.

*How to check:* any widget with dead space over a third of its height has content
that has not grown.

---

## Breathing room

**F11. Breathing room inside a card is wider than you think.** Card padding ~20–24px on
desktop, list rows ~12–16px vertically, equal gaps between cards. Exact
numbers are in `budgets.md`.

**F12. A small card is still a card.** Kanban cards, cards in a multi-column grid, cards in a
narrow panel all follow the shared scale. Do not drop a step on your own to make it compact — too compact becomes
cramped. The smallest step is only for chips, labels and small controls.

**F13. An element with a hover background needs padding on all four sides.**

Setting `py` and forgetting `px` shows nothing at rest, but on hover the background
appears hugging the text, the text touches the left and right edges, and it looks like a bug.

To keep the text aligned with other blocks while the hover background still extends wider, use
exactly this technique:

```html
<!-- Wrong: on hover the text touches both edges -->
<li class="py-3 hover:bg-item-hover">…</li>

<!-- Right: background extends past the margin, text stays aligned. The card has no horizontal padding, each block
     carries its own px: heading px-5, list block px-2 (= 5 − 3) so the row text at px-3 aligns with the heading -->
<section class="rounded-2xl bg-surface py-5">
  <h2 class="px-5">…</h2>
  <ul class="px-2">
    <li class="rounded-xl px-3 py-3 hover:bg-item-hover">…</li>
  </ul>
</section>
```

Do not pull the list out with `-mx-3` (`N11`). The per-block padding version and the `-mx-*` version match
pixel for pixel (heading text, checkbox, row background). Table cells work the same way: a cell holding a button drops padding by exactly the button's `px` (`td` `px-2` when
the button is `px-2`, other cells `px-4`); do not pull the button out.

**F14. No arbitrary spacing, no arbitrary radius.** Take them from `budgets.md`.

The trap that comes with it: for a progress bar, chip or badge rounded at **half its height**, do not write
a number that happens to equal half the current height — use `rounded-full`. Change
the height and the radius is wrong at once, and nobody remembers to fix it alongside.

---

## Icons

**F15. Thin-stroke icons, one grey colour, and one set for the whole screen.** No hand-drawn
inline SVG, no emoji. Where to get them depends on what the project has:

| Project | Where to get icons |
| --- | --- |
| Has npm | `lucide-react` (default), or the icon set already installed — do not add a second set |
| No npm, plain HTML | Lucide via CDN, or paste Lucide's SVG in. Still Lucide, only loaded differently |
| Has its own icon set | Use theirs. Mixing two icon sets on one screen shows immediately |

The rule here is **thin stroke, one colour, consistent** — not a library name.

**F16. Exception: third-party brand logos.** Sign-in buttons for Google, Apple,
GitHub must carry their exact logo, in its original colours, with the SVG pasted directly. Lucide
does not have them, and they are a functional identity mark.

**F17. Same group, same icon, unless each item truly means something different.**

With an icon tile next to each item, each item **may have a different icon**, as long as they share the set,
stroke weight, colour and box style. But three **identical** icons for three
items strip the tile of all meaning — better to drop it entirely.

**F18. An icon-only button needs an `aria-label`, and must be as tall as the text button next to it.**

---

## Effects

**F19. No glassmorphism.** `backdrop-blur` only when there is **really** an image behind
— for example, the user can set a background image, so the shell's transparency changes with it. No background
image, no blur.

*Flat style — if another style was chosen under `P1`, see `P2` in `references/styles.md`.*

**F20. No glowing borders, no `ring-4`, no neon-coloured shadows.**

*Flat style — if another style was chosen under `P1`, see `P2` in `references/styles.md`.*

**F21. No `border-dashed`.** Two exceptions: a file drop zone, and an empty slot in
a board or calendar.

**F22. Do not animate shapes.** No `scale-105` on hover, no lifting,
no extra shadow.

*Flat style — if another style was chosen under `P1`, see `P2` in `references/styles.md`.*

**F23. No entrance effects for static content.** No whole-page fade-in,
no charts drawing themselves, bars growing, or numbers counting up.

**F24. No `transition-all`** except in exactly one place: card hover. Everything else is
`transition-colors`.

---

## Dividers

**F25. A divider inside a padded block must span the full width, not indent with the
padding.**

Dropdowns, cards and panels all have `p-*` around their content. Put an `<hr>` inside and
it is indented at both ends, becoming a stray dash floating in the middle of the block — it looks like a missed stroke rather
than a partition.

A divider is what **divides the block**, so it must touch both edges of the block. Two ways, chosen
by structure:

Choose based on **whether the item's hover background is inset from the frame edge or not**:

```html
<!-- Way 1 — menu, dropdown: hover items are inset, a gap away from the frame edge.
     The frame has only vertical padding; the horizontal gap lives on each item group, the rule sits between two groups so it touches the edges by itself. -->
<div class="rounded-2xl py-1">
  <div class="px-1">
    <button class="flex h-10 w-full items-center rounded-xl px-3">…</button>
  </div>
  <hr class="my-1 border-border" />
  <div class="px-1">
    <button class="flex h-10 w-full items-center rounded-xl px-3">…</button>
  </div>
</div>

<!-- Way 2 — list inside a card: rows span the full width, not inset.
     The frame has no horizontal padding, the padding lives on each row. -->
<div class="py-1.5">
  <a class="block px-4 py-3">…</a>
  <hr class="border-border" />
  <a class="block px-4 py-3">…</a>
</div>
```

**Do not use way 2 for menus.** Dropping the frame's horizontal padding makes the hover background touch
the edge, the gap is lost, and the item radius and frame radius are no longer concentric
(`M19`).

**Way 1 does not pull the rule out with `-mx-*`** (`N11`). With a `p-2` frame and a `-mx-2`
rule, the two numbers must match; change the frame padding and forget the negative margin and the rule falls short
or overflows the frame again. Grouping items into `px-*` groups leaves no number to keep in sync. A group
is just a plain `<div>`, no `role`: screen readers still see the `menuitem`s as children of
`menu`. The position of every item, every rule and the menu height match the `-mx-1` version pixel for pixel.

For the same reason, `divide-y` on a list inside a card also spans the full width — see
`references/components/card.md`.

The only exception: a divider **between the rows of a list** that should start
aligned with the text (skipping the avatar on the left). That is a deliberate indent, and it must
indent by exactly the avatar width plus the gap, not by the padding.

**F26. When two bordered blocks sit right next to each other, only one side draws the shared edge.**

When every item has its own four-sided `border` and they are stacked with no `gap`, the shared
edge is **two 1px lines stacking into 2px**: twice as heavy as every other border, like
a thick pen stroke, visibly wrong at a glance. This applies in every direction, top/bottom and left/right, and to every kind of
block: list rows, grid cells, buttons in a button group, stacked cards, a header and the
toolbar right below it.

The shared edge **belongs to exactly one owner**:

- **Adjacent lists, rows, columns**: the frame border lives on the **parent**, the dividers via `divide-y`
  / `divide-x` on the parent. Child items have no `border` at all. Do not write `border-b` on
  items and forget `last:border-b-0`, because the last row will stack on the frame's bottom border.
- **Two-dimensional grids of adjacent cells** (cell-style data tables, month calendars, comparison tables): the parent is
  `grid gap-px bg-border` + outer border, cells are `bg-surface`. The 1px gap reveals the parent background as a line,
  no cell draws its own border, so nothing is thick.
- **Joined button groups** (segmented, outlined button groups): the first button has the full border, later buttons
  `border-l-0` (vertical: `border-t-0`). Do not overlap with `-ml-px` (`N11`).
- **A bordered block inside a bordered frame and touching its edge** (a table touching the card edge, a cell in a
  panel): where edges coincide, drop the inner block's border and keep the outer frame. Two horizontal lines from two adjacent
  blocks (header `border-b` + toolbar `border-t`) — delete one.
- To let each item keep its own border (cards in a grid), there must be a **gap** (`gap-2` or more):
  with a gap they are two separate blocks, no longer stacking.

Sweep before delivery: any element with a `border` whose neighbour also has a `border`, with no
`gap` between them, is a suspect. Zoom to 200% on the shared edge: any line thicker than the frame
border is the bug.

# Responsive

Every rule about narrow screens lives here. `rules-form.md` does not repeat them, it only points here.

**The check threshold is 375px.** Check before reporting done, not after being
criticised. The mandatory torture round is in `checklist.md` gate 3.

---

**R1. The page must never scroll horizontally.** The page body fits every width exactly, including 375px.

The easiest symptom to spot: scroll sideways and you see **an empty strip** on the right, because some element wider than the screen pushes the whole page out. Seeing that empty strip tells you right away that something is overflowing; find it by removing `min-w-0` step by step. Content that really is wide scrolls inside its own `overflow-x-auto` frame; do not let it push the whole page. Check at 375px **before** reporting done.

**R2. Grids drop to one column on mobile.** Default `grid-cols-1`, then `sm:grid-cols-2` and `lg:grid-cols-4`. Exception: a 2×2 row of stat tiles on mobile when every number fits its tile (`components/charts.md`, "Stat tiles on narrow screens").

**R3. Do not leave an element orphaned on its own row.** A wrap that leaves one item standing alone on the row below reads as a bug, not as a design.

- **Button groups never wrap.** Find a way to keep them on one row: shorten the label, reduce `px`, lower the height. If that still fails, drop the whole group to one column, each button on its own full row, rather than two buttons above and one below.
- **Grids with an odd column count go straight from 1 to that count**, skipping the middle step: `grid-cols-1 lg:grid-cols-3`; do not insert `sm:grid-cols-2`, because 3 items in 2 columns become 2 above and 1 below.
- **Even column counts wrap freely**: 4 items in 2 columns give 2 even rows, nobody left alone.

**R4. Mobile rhythm: card `p-4`, at most `p-5`.** Do not carry the wide screen's `p-8` down to a narrow one; 32px of padding on each side of a 375px screen eats a fifth of the width. Buttons on mobile drop to `h-10` — **except buttons inside a form**, which match the height of
the inputs (`h-11` on narrow screens); see `references/budgets.md`.

**R5. Cramped is broken, not responsive.** If shrinking leaves content bunched up, text breaking onto three or four lines, images distorted, it is not handled, not done. How to handle it, in the order to try:

1. Turn the horizontal row into a vertical stack.
2. Turn a rectangular image into a **small square**, `h-16 w-16` or `h-20 w-20`; do not keep the landscape ratio and squeeze it.
3. Drop the font size one step.
4. Clamp the title to at most two lines with `line-clamp-2`.

And always keep: **dates and secondary labels must be at least one step smaller than the title.** Title `text-sm` means date `text-xs`. If they are equal, the eye does not know which to read first.

**R6. Exception to R1 and R2: linear sequences must not wrap.** Status boards, process steps, timelines, filter chip rows and tab rows all belong here. Laid out in two rows, the eye reads in a Z shape and loses the flow; four chips at 375px put three on one row and one dropped below on its own, which looks like a bug. Let them scroll horizontally inside a frame, each element `shrink-0`, kanban columns `w-[248px] grow max-w-[320px]` (see `layouts/app.md` for why).

**Active filter chips (click to remove) are not a linear sequence**, so they are not covered by R6: from `sm` up use `flex-wrap`, put them on their own row below the filter bar, with "Clear filters" at the end and always visible. Only below `sm` do they scroll horizontally, and "Clear filters" stands **outside** the scroll frame (`shrink-0`), not at the end of the scrolling row. Inside the scroll frame, many chips push "Clear filters" out of view, and the button needed most is the one you cannot see.

**Padding for a scroll area goes on the inner row, not on the scroll frame.** Right padding on an `overflow-x-auto` frame is ignored by many browsers when scrolled to the end, so the last element sticks to the edge while the first one still has padding.

```html
<!-- Wrong: last column sticks to the edge -->
<div class="overflow-x-auto px-3"><div class="flex gap-4">...</div></div>

<!-- Right: parent only has vertical padding, other blocks carry their own padding, scroll frame touches the edge -->
<section class="py-3 sm:py-5">
  <h2 class="px-3 sm:px-5">…</h2>
  <div class="overflow-x-auto"><div class="flex gap-4 px-3 sm:px-5">...</div></div>
</section>
```

Do not pull the scroll frame out with `-mx-3 sm:-mx-5` to offset the parent's padding (`N11`): change the parent padding and
forget the negative value, and the scroll frame falls short or pokes out. Several consecutive non-scrolling blocks can
be grouped into one `<div class="px-3 sm:px-5">`. If a block between the page shell and the scroll frame has `max-w-*`,
widen that `max-w` by exactly the amount it extends on both sides, otherwise the sibling blocks get narrower.

Another approach also works: insert a spacer element at the end of the row, `<div class="w-3 shrink-0 sm:w-5" aria-hidden="true"></div>`.

---

**R7. Card text on mobile: the title keeps its size, the description is `text-sm`.** The card title is `text-base font-semibold` **at every breakpoint** (`D8`), always one step larger than the text inside (`T8`); if long, use `text-balance`, do not shrink it. The description is `text-sm` so the card does not run long. Do not drop the title to `text-sm` on mobile: it would equal the description, breaking both `T8` and `D8`.

**R8. Typeable text never goes below 16px on mobile.** `input`, `textarea`,
`select` — below 16px, iOS **zooms the whole page** when the field is tapped, and does not
zoom back out. A user filling in a form suddenly sees the page jump and end up off-centre.

```html
<input class="text-base md:text-sm" />
```

This is **an exception to `R7`**: text that is only read inside a card drops to `text-sm` on
mobile, typeable text does not. This rule is about **font size**, not height: the input
stays `h-11 md:h-10`; see `budgets.md`.

**R9. On narrow screens, tables scroll horizontally; do not squeeze columns.** This is the most common table bug: leaving the `<table>` to shrink with the screen width, so every cell is only a few dozen pixels, text breaks onto three or four lines, columns run into each other, and nothing is readable.

```html
<!-- Page shell py-4 sm:py-6, other blocks px-4 sm:px-6 (R6); the scroll frame has no parent padding to pull out -->
<div class="overflow-x-auto">
  <div class="min-w-[44rem] px-4 sm:px-6">
    <table class="w-full">…</table>
  </div>
</div>
```

- **`min-w`** on the block wrapping the table, enough for every column to breathe. Without it the table still shrinks.
- **`whitespace-nowrap`** for date, number, status and **person name** cells. A wrapping person name shrinks the column to one word per line ("Mary / Anne / Smith"), truncating loses the name people go by (`layouts/app.md`, table grouped by status). Only descriptions and long titles may wrap.
- Padding goes on the **inner block**, not on the scroll frame. See R6.
- If it scrolls horizontally, you **must** pin the identifying column (usually the first) with `sticky left-0` plus a `--surface` background; the pinned column takes no more than ~40% of the frame. If the first column is wider than that (name + email), do not scroll: **below `sm`, an admin table becomes a list of rows** (`layouts/app.md`, Data table section). Scrolling without pinning means one swipe loses the name, and the remaining cells belong to nobody you can tell.

This is a valid exception to R1, of the same kind as R6: scrolling inside a frame, not the whole page.

**On desktop, needing horizontal scroll is a sign of too many columns, not a width bug.** Try, in
order: merge columns (email below the name in the same cell), drop secondary columns, or push them into
a detail drawer. Count columns before building: a table in the app shell has ~970px at 1280px with the
sidebar open; more than 6 columns starts to get cramped.

**R10. Too many tabs or chips on narrow screens: shorten the labels; if that fails, group them into a dropdown.** Order to try:

1. **Shorten the label, if it still makes sense.** "Due today" becomes "Today". If meaning is lost, do not shorten.
2. **Let the whole row scroll horizontally**; see R6. Good when the items are equal peers.
3. **Group into one dropdown**, showing the selected item with an arrow. Good when there are more than six items, or when the scrolling row stops people seeing all the options.

Do not use `flex-wrap`; it is the only wrong one of the three approaches.

**A horizontally scrolling row fades its edge on the side where items are hidden**, the same way as the sidebar nav area (`layouts/app.md`): a 32px `mask-image`, left edge faded once scrolled away from the start, right edge faded while items remain behind, flags computed from `scrollLeft`/`scrollWidth`/`clientWidth`. The scrollbar is already hidden (`scrollbar-clean`), so an edge cutting straight through text signals nothing: at 375px the chip row cuts across "Sell|", while the "Suspended 6" tab sits entirely outside the frame, so it looks as if there are only three statuses. Apply to tab rows, chip rows, and horizontally scrolling table frames (`R9`).

**On devices with a mouse, a horizontally scrolling row must have arrow buttons on the side where items are hidden.** Build them up front, do not ask. A mouse usually only has a vertical wheel; with the scrollbar hidden (`scrollbar-clean`), a mouse user has no way to reach the items behind; the faded edge only says "there is more", it does not let you drag. Devices with a trackpad or a horizontal-scroll mouse can drag, so the builder never sees the bug. Tab rows, chip rows and card strips on desktop are all the same:

```tsx
<div className="relative min-w-0">
  <div ref={scrollerRef} className="scrollbar-clean overflow-x-auto …faded-edge mask…">{items}</div>
  {canScrollLeft ? (
    <div className="pointer-events-none absolute inset-y-0 left-0 hidden items-center any-pointer-fine:flex">
      <IconButton label="Scroll left" onClick={() => scrollByPage(-1)}
        className="pointer-events-auto size-8 rounded-full border border-border-strong bg-surface">
        <ChevronLeft className="size-4" />
      </IconButton>
    </div>
  ) : null}
  {/* canScrollRight: same block, right-0, ChevronRight, scrollByPage(1) */}
</div>
```

- **The same two flags as the faded edge** (`scrollLeft > 0`, `scrollLeft + clientWidth < scrollWidth - 1`): whichever side is faded has a button; scrolled to that end, the button hides.
- **A click scrolls about 80% of the frame width**: `scroller.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: "smooth" })`. Scrolling exactly one item means clicking forever on a long row; scrolling a full 100% loses the item you were looking at on the edge.
- **Only shown on devices with a mouse** (`any-pointer-fine:`; without Tailwind v4, `@media (any-pointer: fine)`). Phones can swipe, and adding buttons covers chips on narrow screens. Touch-screen laptops also have a mouse, so they still show.
- **A `--border-strong` border** like every bordered button (`M14`). **Fully rounded is an exception to `F1`**: a round arrow button floating over the faded strip is the common convention for scrolling rows, and is not confused with the buttons in the row.
- The button sits over the 32px faded strip, centred vertically with `inset-y-0 flex items-center`, not `-translate-y-1/2` (`N11`). Do not turn the vertical wheel into horizontal scroll: it hijacks page scrolling, and someone scrolling down gets stuck on the chip row.

**A custom position indicator bar: not built by default; suggest it in one line at delivery.** By default a horizontally
scrolling row only has the faded edge above. When delivering a screen with a tab/chip row that scrolls horizontally on narrow screens, report one
line, **phrased as the end user's problem, without naming any project or reference product**:
_"On phones there is no scrollbar, so users do not know this [filter tab] row can be swiped.
It currently fades out on the right edge; it could switch to a dropdown, or add a thin always-visible scrollbar
below the row."_ Build whichever option the user picks (settled:
this is a suggestion for the user, not applied up front). The recipe when building (approved
on a real project): the faded edge says "there is more on this side", the bar says "how much
more and where you are". The native iOS/Android scrollbar is an overlay bar, shown only **while
swiping**, so it cannot signal in advance; the 4px auto-hiding bar of `I18` only shows on hover,
and phones have no hover. A tab peeking at the edge is not guaranteed either: the tabs may end
flush with the frame edge.

```tsx
<div className="relative min-w-0">
  <div ref={scrollerRef} className="flex overflow-x-auto scrollbar-clean …">{items}</div>
  {isOverflowing ? (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-full mt-1 h-[3px] overflow-hidden rounded-full bg-foreground/5">
      {/* Width and position change with every pixel scrolled: style, not class. */}
      <div className="absolute inset-y-0 rounded-full bg-foreground/15"
        style={{ width: `${visibleRatio * 100}%`, left: `${offsetRatio * 100}%` }} />
    </div>
  ) : null}
</div>
```

- **Only shown when the row really overflows** (`scrollWidth > clientWidth + 1`), at every width, not only narrow screens. `visibleRatio = clientWidth / scrollWidth`, `offsetRatio = scrollLeft / scrollWidth`, measured on scroll (`passive`) and with a `ResizeObserver` (device rotation, font loading changes the width). Share the hook with the faded edge.
- **Floating (`absolute top-full mt-1`) below the row, not in the flow**: the bar only appears after measuring on load; in the flow, the whole page would jump down a step. The caller leaves at least 8px of space below the row (the bar takes 7px).
- **An underlined tab row with a baseline: the bar runs on top of that baseline** (`bottom-0 h-0.5`, the track is the baseline itself); do not draw a separate track below it: two lines close together read as a misaligned underline. An underlined tab row without a baseline uses a separate track as above.
- **Light, and no lighter**: the bar is a "you can drag" hint; darker pulls the eye away from the selected item; lighter disappears entirely in sunlight (about `/20` of the secondary-text grey, equivalent to `bg-foreground/15` here).
- **If the selected item is hidden, auto-scroll it to the middle of the row** on load and when the selection changes. Compute `scrollLeft` yourself and call `scroller.scrollTo`, **not `scrollIntoView`**: the row may be below the fold on load, and `scrollIntoView` drags the whole page down with it. First time `behavior: "auto"`, later times `"smooth"`.
- Apply to chip rows, tab rows that still scroll horizontally, and card strips/carousels. **A table's status tabs on narrow screens with a tab entirely outside the frame still become a dropdown** (`layouts/app.md`): the bar can say "there is more", it cannot say which statuses remain.

**R11. Narrow screens may hide secondary columns, but must not lose the row's main action.** Hiding badges, hiding row
buttons (`hidden sm:inline-flex`) and hiding the detail panel (`hidden lg:block`) all at once means that at 375px clicking
a row does nothing, and the screen's main job cannot be done on a phone. Everything hidden must have another
way in: clicking a row opens the panel as a page or a bottom sheet, the main button moves into the row's ⋯ menu, or the button
shrinks to an icon.

---

## Step-down table for mobile: do not carry the desktop rhythm down unchanged

| | Mobile (below `sm`) | From `sm` up |
| --- | --- | --- |
| Page padding | `p-4` | `sm:p-6` |
| Card padding | `p-4`, at most `p-5` | see `budgets.md` |
| Button height | `h-10` | see `budgets.md` |
| Card title | `text-base` | `text-base` (does not change by breakpoint, `D8`) |
| Card description | `text-sm` | `text-sm`: the card title is `text-base`, so text inside is at most `text-sm` (`T8`) |
| Dates, secondary labels | `text-xs`, always one step smaller than the title | as above |
| Input, textarea, select | **`text-base`, do not reduce.** Below 16px iOS auto-zooms | `md:text-sm` |

`p-8` is the wide-screen rhythm. Carried down to 375px, the padding alone eats
a fifth of the width.

---

## Check order at 375px

1. Does the page scroll horizontally? If so it is broken, except for the R6 exception.
2. For every horizontally scrolling area, scroll all the way right: does the last element still have padding?
3. Does any button group wrap, does any element stand alone on the row below?
4. Does any card still have `p-8`?
5. Are dates smaller than titles?
6. Overall look: is anything cramped and bunched up? Cramped means not done.

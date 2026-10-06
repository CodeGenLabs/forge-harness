# Button

> ⚠️ An earlier version of this file taught three variants `primary` / `ghost` / `danger` and
> "default button has no icon". **Both are reversed** — see rule `I1`. Settled:
> the default button is the **outline button**. A lucide icon left of the text only when the glyph names the
> action exactly; form buttons and modal buttons are text only (see `I1`).

---

## Four kinds, no more

```tsx
type ButtonVariant = "outline" | "primary" | "secondary" | "ghost";

function getVariantClasses(variant: ButtonVariant): string {
  return cn(
    // DEFAULT. Use this when building a new button.
    // Hover: ONLY the background changes to --button-hover (a solid colour), the border stays.
    variant === "outline" &&
      "border border-border-strong bg-surface text-foreground hover:bg-button-hover",
    // The ONE main action of an area, when it truly needs to stand out.
    variant === "primary" &&
      "bg-primary text-primary-foreground hover:bg-primary-hover",
    // A secondary button that needs a bit more than ghost without competing with the main button. No border.
    variant === "secondary" &&
      "bg-secondary text-foreground hover:bg-secondary-hover",
    // A secondary action in a row, dimmed at rest.
    // Hover foreground/5, NOT bg-background: ghost often sits directly on the grey page
    // background (header, toolbar), and painting --background there shows nothing on hover.
    variant === "ghost" &&
      "bg-transparent text-muted hover:bg-foreground/5 hover:text-foreground",
  );
}

<button
  className={cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl",
    // A fixed 40px height for one-line labels, with or without a border. min-h, not h:
    // a long label wraps and the button grows taller (T15).
    "min-h-10 px-4 py-2 text-sm font-medium transition-colors",
    // Long labels wrap, never overflow. Rule T15.
    "max-w-full text-center leading-tight [overflow-wrap:anywhere]",
    // No focus ring (I13). If the project needs accessibility, restore the ring on exactly this line (I14)
    "outline-hidden",
    "disabled:cursor-not-allowed disabled:not-aria-busy:opacity-50",
    getVariantClasses(variant),
  )}
>
  {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
  {children}
</button>
```

**Loading**

```tsx
<Button variant="primary" aria-disabled={isSending || undefined} aria-busy={isSending || undefined}
  onClick={(event) => { if (isSending) event.preventDefault(); }}>
  {isSending ? <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden /> : <Send className="size-4 shrink-0" aria-hidden />}
  Send invite
</Button>
```

- The spinner **takes the icon's place**, same `size-4`, text unchanged. The button keeps its width, the button row does not shift. **Text-only button** (no icon to replace): the button is `relative`, the text gets `invisible` so it still holds the width, the spinner is `absolute inset-0 m-auto` in the middle.
- Do not change the text to "Sending…": different text lengths make the button stretch and shrink. If you do change it, keep a `min-w` equal to the original.
- **While loading, block clicks with `aria-disabled` + `preventDefault` in `onClick`; never set `disabled`.** The browser strips focus from a `disabled` button: a keyboard user presses Enter and lands back on `<body>`, and when the work finishes they must Tab again from the top of the page. Blocking in `onClick` also blocks Enter in an input, because the form's implicit submit also goes through a click on the submit button. Build it once in the `Button` component (an `isLoading` prop), do not rewrite it on each page.
- A loading button is **not dimmed** like a regular disabled button; only the spinner says it is running, with a `cursor-progress` cursor. Dimmed reads as "cannot click because something is wrong". The base class still keeps `disabled:not-aria-busy:opacity-50` for projects that set `disabled` while loading anyway.

**Why it works**

- **`outline` is the default**, not `primary`. Accent-filled buttons scattered everywhere spread the brand colour, so when one button truly needs to stand out it no longer can (`I1`, `M2`).
- **An outline button on hover changes only its background, the border stays** (`hover:bg-button-hover`, `#f1f1f3`), as in most component libraries. The hover background must be a **solid colour**, distinct both from the background right behind the button and from the border colour. Three approaches failed: `hover:bg-item-hover` gives exactly the page background `#f4f4f6`, so the button dissolves into the page; a `foreground/5` overlay is transparent so it takes the colour behind it, which on the page background gives `#e9e9eb`, **the same as the border colour** `#eaeaea`, and the button becomes a grey patch with no border; `--surface-hover` `#f8f8fa` barely changes on a card. The stopgap "darken the border to `foreground/20`" is visible everywhere but heavy, and looks like the button is held down or selected (Settled: change only the background). **The hover colour follows the background right behind the button**, switching automatically through variables (`tokens.css`, the "outline button hover background" block): on a white card `#f1f1f3`, directly on the page background or inside a hovered row `#e4e4e7`. One colour `#f1f1f3` everywhere would differ by only 3 steps from the `#f4f4f6` page background, so the button dissolves into the page (Rejected: the argument "it sinks slightly but the border is still there"). The page-background hover colour must be at least 5 steps darker than the `#eaeaea` border: `#e7e7ea` is only 3 steps off, the border dissolves and the button becomes a grey patch; `#e4e4e7` is 6 steps off. That colour is too heavy on a white card, so cards keep `#f1f1f3`. The class is still `hover:bg-button-hover`; do not write a colour per placement. A button with an arrow that opens a list of choices does not follow this item but the Select field (see below).
- **`ghost` hovers to `hover:bg-foreground/5`**, not `bg-background` (ghost is transparent with no border to darken, so it must be an overlay). A ghost button sitting **inside a table / list row that has a hover background** (⋯, icon button, inline edit cell) uses `/8`, because it stacks on top of the hovered row background (`I10`).
- **A button that opens a list of choices** (filter buttons "Role ▾", "Status: All ▾", "Per page 10 ▾") **is a Select field, not an outline button**: use exactly the Select field classes (`choice-controls.md`), meaning **no hover**, only `cursor-pointer`; when open `aria-expanded:border-focus aria-expanded:ring-2 aria-expanded:ring-focus`, the background stays `bg-surface`, the arrow rotates. The arrow + cursor already say "clickable", just like a Select in a form and inputs, which have no hover; adding hover is a second signal for one idea (`N3`), and breaks the pattern of the Select field right inside a modal (`N5`). Settled. A button that opens an **action menu** (⋯, "Export ▾") is not a choice field: while open it keeps the hover background `aria-expanded:bg-foreground/5`.
- **`secondary` (grey background, no border)** is used when a secondary button needs a clearer presence than `ghost` but a thin border looks empty: a full-width button in a card (the regular plans in a pricing table, `layouts/pricing.md`), or a secondary button next to a `primary` button in a footer. It does not replace `outline` as the default (Settled).
- **A `ghost` at the start of a row aligns with the text above.** Its background is transparent, so the eye sees the edge of the text, not the edge of the button; left alone, the whole row looks indented 16px compared with the title and labels below. Buttons with a background or border are not compensated. Compensate in this order, do not pull the button out with `-ml-*` / `-mr-*` (`N11`):
  1. **The button is at the start or end of its own row** (header, list row): **the row reduces its padding on that side** by exactly the button's `px`, e.g. a header `pl-4 pr-3` when the last button is `h-8 px-3` in a `px-6` row. The "Mark as read" text in the notifications panel header aligns with the unread dots below; on hover the grey background sits closer to the panel edge than the title on the left, which is intended. Pixel-identical to the negative-margin version.
  2. **The button only changes text colour on hover, no background** (the button that opens the list of tool steps in chat): drop the `px`, the text aligns on its own.
  3. **A button with a hover background sits in the middle of a text column** (the Copy / Regenerate row under an answer): there is no row of its own to reduce padding on; splitting padding per block means every child block must remember `px-2` and `max-w` must be compensated (the `max-w-[80%]` bubble and the `55ch` column shift with it). Keep `-ml-2` with a comment giving the reason (`N11` step 4).
- The lucide icon goes **left of the text**, `size-4`, `shrink-0` so it is not squeezed when the label is long. `aria-hidden` because the text already says it.
- **No `white-space: nowrap`.** Measured on a real project: a 140px box, a nowrap button 192px wide, overflowing by 60px. `leading-tight` so two lines do not stick together. Rule `T15`.
- **No `shadow`.** Buttons sit in the page (`M15`).
- Only `transition-colors`. Buttons do not scale up, lift, or gain extra shadow on hover (`F22`).
- **No focus ring** (`I13`), even on Tab.
- **Height is set with `min-h-10`, not left to `py`.** `py-2.5` + `leading-tight` gives a 38px solid button and a 40px outline button because of the 2px border: two buttons side by side have misaligned bottoms. `min-h-10` includes the border, so every button is 40px; a long label wraps and the button grows taller, no overflow (`T15`). An icon-only button is `size-10`, the same height.
- **Buttons in a form or modal footer** add `min-h-11 md:min-h-10` to match the input height exactly (`budgets.md`).
- No `size` prop. For a different size, pass `className` — it avoids a variant × size matrix (`I6`). **For a button shorter than 40px, also pass `min-h-*`** (`size-8 min-h-8`, text link `h-auto min-h-0`): `h-8` or `size-8` cannot override the base class's `min-h-10`, so the button stays 40px.
- Class logic lives in `getVariantClasses()` outside the JSX, no ternaries stuffed into the markup.

---

## Delete button

A 10% red tint background and red text, **always**, without waiting for hover. On hover or Tab
the background darkens one step:

```tsx
<Button
  variant="ghost"
  className="bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 hover:text-rose-700 dark:text-rose-400"
>
  <Trash2 className="size-4 shrink-0" aria-hidden />
  Delete
</Button>
```

- **Text `rose-700`, not `rose-500`** (dangerous button `I4`). Measured on a `rose-500/10` background over white: `rose-500` is only 3.2:1, `rose-600` 3.9:1, both below the 4.5:1 required for 14px text. `rose-700` reaches 5.2:1 and still reads as red. On a dark background it is the opposite, the text lightens to `rose-400`.
- **Without Tailwind**: background `var(--danger-bg)`, hover `var(--danger-bg-hover)`, text + icon `var(--danger)`. The `.dark` block in `tokens.css` already switches to `rose-400`.
- **A tinted background, not solid red.** Immediately recognisable as a dangerous button but it does not shout like a `bg-rose-500 text-white` button (`I4`).
- **No red border** (`M30`). The tinted background already separates the button from the page.
- The icon uses the text colour — do not give the icon its own `text-muted`.
- When disabled, still `opacity-50` like every button.
- Applies only to **standalone buttons**: button rows, confirmation dialogs, danger zones in settings. **Menu items** (dropdown, sidebar) stay neutral at rest and turn red only on hover — see `I4`.

> Settled: the delete button is a 10% danger background + danger text. The earlier version
> (grey at rest, red only on hover) is dropped for buttons; it is kept for menu items.

---

## Icon-only button

Square, **exactly as tall** as the text button next to it, and always with an `aria-label`:

```tsx
<button
  aria-label="Filter list"
  className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border-strong bg-surface text-muted outline-hidden hover:bg-button-hover hover:text-foreground"
>
  <SlidersHorizontal className="size-4" aria-hidden />
</button>
```

A height mismatch with the input or text button next to it, even by one step, is visible right away.

---

## Warning

One `Button` in an old project ballooned to **8 variants, 3 sizes** and a
`glow` variant using three radial gradient layers. That is the counter-example. To add a fifth variant
you must be able to answer: how is it different from the other four, and why can the other four not
do that job.

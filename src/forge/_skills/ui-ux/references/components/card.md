# Card

```tsx
<section className="flex flex-col rounded-2xl border border-border bg-surface p-5">
  <header className="mb-4 flex items-start justify-between gap-3">
    {/* min-h-10 = matches action button height, ONLY when action is present: single-line title centers with button, multi-line pins button to top */}
    <div className={cn("flex min-w-0 items-center gap-2", action && "min-h-10")}>
      {icon}
      <h2 className="text-base font-semibold text-balance text-foreground">{title}</h2>
    </div>
    <div className="shrink-0">{action}</div>
  </header>

  <div className="min-h-0 flex-1">{children}</div>
</section>
```

**Why it works**

- The card separates from the background with a **1px hairline + border radius**, not with shadows. This is rule `M13`.
- Uses the exact `--border` token, the same token as dividers and dropdown borders, so the app has no inconsistent dark/light borders. Form inputs use `--border-strong`, one step darker (`M14`).
- **No `shadow-*`.** Shadows are only for elevated layers above the page — modals, dropdowns, popovers (`M15`). Cards living on the page do not use them.
- Card title is `text-base font-semibold`, exactly one step above the text inside (`T8`). No `text-2xl`, no uppercase, no wide tracking.
- Header and body are separated by `mb-4`, card padding is `p-5`. These two values repeat across all cards; no card invents its own.
- The action slot sits in the top-right header, so add buttons or filter buttons never drift into the middle of the content.
- **Header uses `items-start`, not `items-center`.** If a long title wraps to two lines, the button still pins to the top right instead of drifting to the vertical center. The title container's `min-h-10` matches the button height so on a single line, text still aligns with the button center. The title uses `min-w-0 text-balance` for balanced wrapping, and the button uses `shrink-0` to avoid being squished.
- **`min-h-10` only when the header has a button.** If a card only has a title but keeps `min-h-10`, the 24px line of text sits inside a 40px container, leaving 8px excess above and 8px below: the title sits ~32px from the top edge while the bottom content is ~20px from the bottom, and the title sits ~32px from its content. The title floats awkwardly between the card edge and content without anchoring to the block it names, leaving the card top-heavy. Exception: cards in the same grid row where only some have buttons should all keep `min-h-10` so titles align across the row.

---

## Cards containing hover-state rows: padding belongs on each block, not on the card

`p-5` on the card is only correct when the card body consists of text, numbers, or forms. When the body is a list with hover backgrounds (`list-row.md`, rows with `px-2`/`px-3` so hover background does not hug text tightly, `F13`), the row text indents by the row's `px`, misaligning with the card title edge. The shared `Card` component must provide this second pattern out of the box, rather than patching it ad-hoc everywhere:

```tsx
// isFlushList: body is a list of rows with hover backgrounds. Card has no px, header has px-5, list
// container has px-2 (= 5 − 3), row has px-3: row text aligns with title text, hover background still bleeds out 12px.
<section className={cn("flex flex-col rounded-2xl border border-border bg-surface", isFlushList ? "py-5" : "p-5")}>
  <header className={cn("flex items-start justify-between gap-3", isFlushList ? "px-5" : "mb-4", isFlushList && !action && "mb-1.5")}>…</header>
  <div className={cn("min-h-0 flex-1", isFlushList && "px-2")}>{children}</div>
</section>
```

- List container `px` = card padding − row `px`: row `px-3` means container `px-2`, row `px-2` means container `px-3`. On narrow screens with card `p-4`, subtract from 16.
- **Reduce header `mb-4` when body is a list**: the row already has `py-2.5` above its text. When header has an action, use `mb-0` (the `min-h-10` container already leaves ~10px below title text); without action, use `mb-1.5`. The distance from title text to first row text is then ~20px, matching the gap between rows. Keeping `mb-4` creates 36px, leaving the title floating.
- Do not pull the list outward using `-mx-3` (`N11`).

If a card with `p-5` places `px-2` rows directly in its body, row text is misaligned with the title text by 8px, and distance from title text to first row text becomes 36px while the gap between rows is 20px.

---

## When to use `ring` instead of `border`

`border` consumes box space under `box-sizing: border-box`, so **fixed-size** elements shrink by 1px on each side when border is applied. For cards this is not an issue — cards are flexible.

Use `ring-1` for elements with fixed dimensions: avatars, 28px square icon boxes, thumbnails. See rule `M17`.

---

## Multiple items of the same type belong in ONE shell, not multiple cards

Four identical white cards arranged in a grid are read by the eye as four peer blocks, not as a single list. Group them together:

```tsx
<section className="rounded-2xl border border-border bg-surface">
  <header className="flex items-center justify-between gap-3 px-5 py-4">
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    {action}
  </header>

  <ul className="divide-y divide-border border-t border-border">
    {items.map((item) => <ListRow key={item.id} item={item} />)}
  </ul>

  <footer className="flex justify-end border-t border-border px-5 py-3">
    <ViewAllButton />
  </footer>
</section>
```

The title row and trailing action row sit **INSIDE** the shell. Rule `F3`.

---

## Action slot in header

Where secondary actions for the entire block go: "View all", "Read more", filter button, new item button. **Always right-aligned, on the same line as the title.**

**Button style matches the action type**, do not use a single style for every action:

| Action | Button |
| --- | --- |
| Navigating to another screen: "View all", "Read more" | **text link** `h-8`, no horizontal padding, underline on hover, **no icon** (`I7`) |
| Performing a task: download, export, add, filter | `outline` border button **with leading icon** (`I1`): `download`, `plus`, `filter` |

Do not build "Download report" exactly like "View all" (without an icon): it will read as a link to another page rather than a download button.

"View all" is a `text-foreground/70` text link, no accent color, no arrow icon, no horizontal padding so the text aligns flush with the right edge of card content. When the header has a link, the title block still keeps `min-h-10` just like with a button (the link is `h-8` tall; add `my-1` to align with the title baseline). See rule `I7`.

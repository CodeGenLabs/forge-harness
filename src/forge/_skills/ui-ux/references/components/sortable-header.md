# Sortable column header

A table column header cell that can be clicked to sort rows. For the table around it (tabs, filters, multi-row selection,
pagination) see "Data table" in `../layouts/app.md`. If the project has `@tanstack/react-table`,
let it hold the sort state; the skill only handles how the cell looks (`N10`).

## Three states

```
Customer ⇅          Created ⇅         ⇅ Revenue       unsorted: text and two-way arrow text-muted
Customer ↑          Created ⇅         ⇅ Revenue       name A → Z: sorted column text and arrow text-foreground
Customer ⇅          Created ↓         ⇅ Revenue       newest on top
```

- **Every sortable column has an arrow, even before it is clicked**: `arrow-up-down` → `arrow-up` /
  `arrow-down`, `size-3.5`, `gap-1` from the text. Touch screens have no hover; without the arrow nobody
  knows which columns are clickable. Non-sortable columns get no arrow and are not buttons.
- **The sorted column only changes text colour** `text-muted` → `text-foreground`, keeping size and weight
  (`font-medium`) so the header row does not shift (`N1`). Only one column is sorted at a time.
- **Up arrow is ascending** (A → Z, old → new, small → large), down is descending.
- **For a right-aligned number column, the arrow comes before the text** (`flex-row-reverse`), so the text touches the right edge
  in line with the numbers below. With the arrow after the text, the text is indented 18px from the numbers.
- **`aria-sort="ascending" | "descending"` only on the sorted `<th>`**; other columns get none.

## How clicking works (default for whoever wires the logic)

The click cycle order is logic; the component only calls `onSort` (`N10`). When the request does not say, note this
default next to the handler:

- First click: **text columns ascending** (A → Z), **number and date columns descending** (largest, newest
  first: someone clicking "Revenue" wants to see who is highest). This is also TanStack Table's default.
- Second click reverses, **third click returns to unsorted** (the order the data came back in). Without a third click,
  "unsorted" is only seen on first page load and cannot be returned to.
- Clicking another column: the old column returns to unsorted, the new column starts again from the first click.

## Cell and hover

- **The button fills the cell, horizontal padding lives inside the button**, exactly equal to the padding of the data cells in the same column:
  the header text lines up with the data without pulling margins with negative values (`N11`). `h-11`, `text-xs
  font-medium`, `whitespace-nowrap`, `cursor-pointer`.
- **No hover background. On hover the text and arrow darken** (`hover:text-foreground`). An exception
  to `I10`, for the same reason as the accordion (`accordion.md`). Do not paint `--surface-hover` on hover:
  the cell-filling button becomes a 505px-wide `#f8f8fa` patch for a 12px label, and the first and
  last column cells touch the card edge, close to the page background `#f4f4f6`, so the card looks like a corner was cut out. Conventions split:
  some enterprise design systems paint the whole cell, some only show the arrow and darken the text; the skill
  chooses no background because of the case above.

```tsx
<th scope="col" aria-sort={direction ?? undefined} className="p-0">
  <Button
    variant="ghost"
    onClick={onSort}
    className={cn(
      "h-11 w-full justify-start gap-1 rounded-none px-4 py-0 text-xs whitespace-nowrap",
      // No hover background: first and last column cells touch the card edge, --surface-hover is close to the page background.
      "text-muted hover:bg-transparent hover:text-foreground",
      align === "right" && "flex-row-reverse",
      isSorted && "text-foreground",
    )}
  >
    {label}
    <SortIcon direction={direction} />
  </Button>
</th>
```

## Narrow screens

- **Below `sm` a management table becomes a list of rows** (`../layouts/app.md`) and the header row goes with it,
  so **sorting turns into a dropdown button** next to the Filter button: an outlined `h-10` button, label
  "Sort:" `text-muted` followed by the current choice ("Sort: Highest revenue"), `ChevronDown`,
  `w-fit`, the same pattern as the table's "Status:" button. Opening it shows a list where each item is a **column + direction
  in words**: "Name A → Z", "Name Z → A", "Newest", "Oldest", "Highest revenue", "Lowest
  revenue", plus "Default" for unsorted; the selected item has a check mark (the Select pattern in
  `choice-controls.md`). Words replace arrows because there is no column name next to them for an arrow to attach to.
- **If the table stays a table on narrow screens, every sortable column must be visible without scrolling.** A
  three-column `min-w-[28rem]` table scrolling horizontally inside a 341px frame puts the Revenue column fully outside the frame:
  "Revenue ascending" sorted at 375px with no revenue column in sight.
  If it does not fit, follow the bullet above; do not let sortable headers drift off screen.

## Check

- Hover the first and last column headers at 1280px: does any background patch touch the card edge?
- The left edge of the header text equals the left edge of that column's data text; number columns: the right edge of the header text equals the right
  edge of the numbers (measure with `Range`).
- At 375px: is a header (or the "Sort:" button) still visible for every sortable column?

# Folder tree

A nested list that expands and collapses: document folders, page tree, category tree.
Borrows the **sidebar submenu** pattern (`layouts/app.md`): same row height, same
hover background, same vertical line, same way of marking the selected item (`N5`).

```html
<ul class="space-y-1 text-sm"><!-- 4px between rows, see list-row.md -->
  <li>
    <button type="button" class="flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl px-2 outline-hidden hover:bg-item-hover" aria-expanded="true">
      <!-- h-10 rounded-xl: same height as a sidebar link, radius per F1. ChevronDown size-4 text-muted, rotates -rotate-90 when collapsed. File row: an empty size-4 placeholder.
         Selected row: drop hover, add bg-secondary font-medium, aria-current="page" -->
      <!-- FolderOpen / Folder / FileText size-4 shrink-0 -->
      <span class="min-w-0 truncate">Enterprise customers</span>
    </button>
    <ul class="ml-4 space-y-1 border-l border-border-strong pl-2"><!-- vertical line runs through the centre of the parent icon -->
      …
    </ul>
  </li>
</ul>
```

- **Selected row**: background `bg-secondary` + `font-medium` + **its segment of the vertical line darkens to `--foreground`**, exactly like the sidebar submenu. No accent colour, no border. The dark segment is `before:absolute before:inset-y-0 before:w-px before:bg-foreground` on the row, shifted left by exactly the list's `pl` plus the 1px border (`before:-left-[9px]` with `pl-2`); the negative value is deliberate (`N11` step 4), comment right above the line. The non-negative way is for each `<li>` to carry its own `border-l` and the selected segment to change border colour, but the `space-y-1` gap between rows breaks the vertical line into 4px pieces, and switching the gap to `pt-1` makes the dark segment 4px longer than the row background.
- **Hover `hover:bg-item-hover`, selected one step darker `bg-secondary`**, like a sidebar link (`I10`; settled). The tree has no checkboxes, so the background is the only selection mark: if hover used the selected background, every row you hover over would look just selected. "Hover and selected share the same faint background" is reserved for table rows with a ticked checkbox. Two adjacent rows lit at once (one selected, one hovered) still happens, so the list **must have `space-y-1`** (4px, locked rule 19), otherwise the two rows merge into one block.
- **Chevron only on rows that can expand.** File rows still reserve exactly one `size-4` cell so text lines up with folder rows. The folder icon follows the state: `FolderOpen` when expanded, `Folder` when collapsed. File icons come from the extension via the **shared table in `file-upload.md`** (same sheet-of-paper shape, one colour).
- **An empty folder shows one grey row "Empty folder"**, `text-muted`, **aligned with the text edge of sibling child rows** — not indented less, no icon. Without this row, opening the folder changes nothing visible and the user thinks the click missed (`N2`).
- **Long names are cut in the middle, keeping the last few characters of the name plus the file extension** ("sales-report…q3.xlsx", not "sales-report-ann….xlsx" with four dots), the `…` attached with no space (`T14`). A tooltip with the full name is attached **only when the name is actually cut** (compare `scrollWidth` with `clientWidth`) and does not cover the next row (`N8`). **The long-name tooltip wraps, no `whitespace-nowrap`**: `max-w-[min(20rem,calc(100vw-1rem))] whitespace-normal wrap-anywhere`, and `side="right"` flips below the row when there is no room. A `nowrap` tooltip with a 90-character name at 375px is 765px wide, overflows the screen by almost 400px, and cuts off exactly half of the name it exists to show.
- **Each level indents `ml-4`**, with the vertical line `border-l border-border-strong` running through the centre of the parent row's icon. A column as narrow as the sidebar (288px) must still nest four levels; deeper than that, indent less rather than allowing horizontal scroll (`R1`).
- **Expand/collapse slides with `grid-rows` 0fr ↔ 1fr**, the collapsed part gets `inert`; no conditional rendering, no `hidden`, no `<details>` (`I30`, pattern in `accordion.md`).
- Keyboard (`N9`): the default is **plain disclosure buttons** — the whole tree is nested `<ul>`, expandable rows are `<button aria-expanded>`, navigated with Tab, Enter/Space to expand/collapse. If you want arrow-key navigation you must build **the full WAI-ARIA tree pattern** (`role="tree"`, `treeitem`, `group`, `aria-level`, `aria-selected`, roving tabindex); do not bolt arrow keys onto plain buttons: screen readers do not announce that model.

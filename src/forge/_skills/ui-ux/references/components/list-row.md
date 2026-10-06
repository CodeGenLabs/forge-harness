# List row

Source: the reminder row of a real project.

```tsx
<li className="group flex items-center gap-3 rounded-xl px-1 py-2 hover:bg-item-hover">
  <IconButton ... />                          {/* primary action, always visible */}

  <div className="min-w-0 flex-1">
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
        {person.label}
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {reminder.title}
      </p>
    </div>
    <p className="mt-0.5 text-xs text-muted">
      {cadence} · <span className={DUE_TONE_CLASS[tone]}>{dueLabel}</span>
    </p>
  </div>

  <div className="flex items-center gap-0.5">
    <IconButton                                {/* secondary action, hidden */}
      className="pointer-events-none opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
    />
  </div>
</li>
```

**Why it works**

- This row has a hover background **because hovering reveals the hidden button** on the right. A read-only row with no link and no hidden button gets no hover background (`I9`, the converse).
- Hover is **the hover background `hover:bg-item-hover`** (light background: sinks to exactly the page background colour). If the row has an icon tile or badge on `bg-background`, that tile flips to `group-hover:bg-surface` on hover, otherwise it disappears (`I32`) — this works because the row is inset and has a radius. A row spanning the full width of its frame (a table) uses `--surface-hover`, see `I10`, meaning the row darkens slightly rather than lighting up, no border, no lifted shadow. It feels like the pointer pressing into the paper.
- **An IconButton inside the row hovers with `hover:bg-foreground/8`**, not `hover:bg-item-hover` like the row: hover the button and its background matches the row's, so the button vanishes. `/5` on top of a hovered row is also nearly identical, so inside a row it is `/8` (`I10`, `small-controls.md`).
- Three clear priority tiers within one row: the primary action always visible on the left, content in the middle, secondary actions hidden on the right. Not every button needs to be seen at the same time.
- Secondary buttons are hidden with `opacity-0` plus `pointer-events-none`. Without the second part the invisible button still takes clicks. **Reveal it again three ways**: hover (`group-hover`), Tab to it (`group-focus-within`, without it Tab lands on an invisible button), and devices without a mouse (`[@media(hover:none)]`, together with `pointer-events-auto`, otherwise the button shows but taps do nothing). If there is a delete action, follow `I11`: always visible.
- **Size of buttons shown directly in the row follows the list's density.** A sparse list (rows with an icon tile or `size-10` avatar, under ~10 rows: login sessions, integrations, API keys) uses form-size buttons `h-11 md:h-10 rounded-xl`, matching the icon tile and the other buttons on the page. Only a dense table (48–56px rows, many rows) uses small `h-8 rounded-lg` buttons. Touch screens: a 32px button is below the recommended 44px tap size.
- `min-w-0` appears on both wrapper levels around `truncate`. Without it the flex item refuses to shrink and a long title breaks the row. This is the most common bug in lists.
- Colour is used only for due dates, three levels: **overdue** amber text `text-amber-700` with the day count ("2 days overdue"), **today** `text-foreground font-medium` text with no colour, **later** `text-muted`. Overdue is "needs attention" per `M7`, not red: red is an error the user must fix to continue (`M30`). Today is not a warning so it has no colour, and that way it does not share amber with overdue. Outside those three spots the whole row is black, white and grey.
- The secondary line is `text-xs text-muted`, separated by `·`, not an em dash or a hyphen.
- **A secondary line with many pieces (4 or more) splits into two lines by meaning on narrow screens**; do not let the browser break it freely. Free breaking drops the `·` to the start of the next line ("· Never used"), and the break point shifts with each row's length, so five rows break five ways. Group the pieces into two groups (identity / time), each `block sm:inline`, with the `·` between the groups shown only from `sm`:

  ```tsx
  <p className="mt-0.5 text-xs text-muted">
    <span className="block sm:inline">
      <span className="font-mono">sk_live_…a3f9</span> · Full access
    </span>
    <span aria-hidden className="hidden sm:inline"> · </span>
    <span className="block sm:inline">Used 2 minutes ago · No expiry</span>
  </p>
  ```

  From `sm` it is still one line as before. If a group is still too long at 375px, make each piece in the group `whitespace-nowrap`, with the space between pieces outside the spans (otherwise the whole group has no break point and overflows the frame).
- Two font sizes per row, no more: `text-sm` for the title, `text-xs` for secondary text and labels. No `text-[10px]`: stacked two-level Vietnamese diacritics collide at 10px. Labels are `rounded-full` pills like badges (`F1`, `M7`), not 4px `rounded`.
- **Stacked rows with a radius are at least 4px apart** (`gap-1` / `space-y-1` on the list), not 2px `space-y-0.5`, not touching. Applies to **every list with a hover or selected background**: sidebar, folder tree, menu items, select, lesson outline (course, playlist), conversation list, reminder rows. Two adjacent rows lit at once (one selected, one hovered) that touch or are only 2px apart read as **one block twice as tall**, not two rows (hit on 05/10/2026, lesson outline: "Lesson 20" in progress and "Lesson 21" hovered merged together; settled: 4px). Rows spanning the full width of their frame (tables) do not need it, because they have no radius and already have divider lines. The probe reports "Rounded rows with backgrounds touch each other".

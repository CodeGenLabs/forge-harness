# Checkbox, radio, switch, select

Four selection controls (distinct from text inputs in `input.md`). If the project already provides these components, use them, only tuning sizes, colors, and focus states below.

Settled. All numbers below are **defaults**: if the project has its own rhythm (dense forms, dense tables), adjust sizes accordingly while preserving proportions and supporting all states.

---

## Sizes

| | Default | Small | Small used when |
| --- | --- | --- | --- |
| Checkbox | `size-5` 20px, radius `rounded-md` 6px, check icon `size-3.5` | `size-4` 16px, radius `rounded` 4px, check icon `size-3` | Inside tables, inside menus, `text-xs` rows |
| Radio | `size-5` 20px | `size-4` 16px | As above |
| Switch | track `h-6 w-11` (24×44), thumb `size-5`, travel `translate-x-5` | track `h-5 w-9` (20×36), thumb `size-4`, travel `translate-x-4` | Dense rows, small cards |
| Select | `h-11 md:h-10`, identical to text inputs | matches project's text input | |

Switch formula: `track width = 2 × thumb + 4px` (`p-0.5` padding on both sides), travel distance = thumb size. When changing sizes, preserve that formula so the thumb never hits the track edge.

16px is **small**, not default: next to `text-sm` text, a 16px control looks shrunken, and its touch target is too small on mobile. The actual clickable area includes the entire label (`I26`), so always wrap controls in `<label>`.

---

## Unchecked border

Unchecked controls use **`border-[1.5px] border-border-strong`**, sharing the same token as text input borders (`M14`), giving the entire form consistent border contrast. On hover, the border darkens, **only when unchecked**: `not-checked:hover:border-foreground` (checkboxes also add `not-indeterminate:`). Writing plain `hover:border-foreground` means that in Tailwind v4 CSS, `hover:` comes after `checked:`, so hovering a checked control overrides the accent border with text color: a selected radio turns gray, a red checkbox gets a black border. This skill's default tokens use an accent close to black matching text color so it isn't obvious, but in a project with a red accent it stands out immediately.

This border has only ~1.2:1 contrast against white backgrounds, which does not meet WCAG 1.4.11. Trying `--muted` (4.95:1) was deemed **too harsh and visually unappealing**, and rejected. This is an intentional tradeoff like text input borders, see `P3` in `styles.md`. To compensate: radios always accompany labels, radio groups always have one option pre-selected, so users still recognize them as selectable groups.

---

## Style, chosen by context

**Controls** have two fill styles:

| Style | Checked checkbox | Selected radio | Best suited |
| --- | --- | --- | --- |
| `filled` (default) | accent background, `--primary-foreground` checkmark | solid accent background, white center dot | Everywhere |
| `outline` | accent border, white background, accent checkmark | accent ring, white gap, accent dot | Pages with many solid blocks needing a lighter touch (`M2`) |

An app picks **one** fill style and uses it everywhere (`D1`).

**Layouts** have four types:

| Layout | Visual | Used when |
| --- | --- | --- |
| Row | control + label on a single line | Self-explanatory options: "Remember me" |
| Row with description | control + bold label + secondary sentence in `text-muted` | Options requiring a consequence explanation |
| Card | entire bordered frame is the clickable target, control in top-left | 2–4 **important** options, each with distinct consequences: posting permissions, billing tiers, delivery methods |
| Card with icon | like card, adding a Lucide icon inside a `size-10 rounded-lg bg-background` square left of text; cards with hover backgrounds must not use `bg-background` for hover (`I32`) | Like card, when options differ in **type**: Standard delivery / Express delivery / Store pickup |

Switches also have a **settings row** layout: label + description on the left, switch right-aligned, see end of file.

---

## Checkbox

```html
<label class="inline-flex w-fit cursor-pointer items-center gap-3 text-sm">
  <span class="relative inline-flex shrink-0">
    <input type="checkbox" class="peer size-5 cursor-pointer appearance-none rounded-md border-[1.5px] border-border-strong bg-surface outline-hidden transition-colors not-checked:not-indeterminate:hover:border-foreground checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary disabled:cursor-not-allowed disabled:opacity-50" />
    <i data-lucide="check" class="pointer-events-none absolute inset-0 m-auto size-3.5 stroke-[3] text-primary-foreground opacity-0 peer-checked:opacity-100"></i>
    <i data-lucide="minus" class="pointer-events-none absolute inset-0 m-auto size-3.5 stroke-[3] text-primary-foreground opacity-0 peer-indeterminate:opacity-100"></i>
  </span>
  Receive email notifications
</label>
```

- **Built on real `<input type="checkbox">`** + `appearance-none`, not built from `<div>`. Space key, form submission, and screen readers work out of the box.
- `outline`: change `checked:bg-primary` to `checked:bg-surface`, icon `text-primary`.
- **Three states** (table header checkbox: none / indeterminate / all) set via JS `input.indeterminate = true`, no HTML attribute exists. Uses `minus` icon instead of `check`.
- Error (required checkbox not ticked): `border-red-500`, error message below label per `input.md`.
- "I agree to the terms" checkboxes are **never pre-ticked**.

## Radio

```html
<!-- filled: thick 6px accent border, 8px white core forms the dot -->
<input type="radio" name="shipping" class="size-5 cursor-pointer appearance-none rounded-full border-[1.5px] border-border-strong bg-surface outline-hidden transition-[border-color,border-width] not-checked:hover:border-foreground checked:border-[6px] checked:border-primary disabled:cursor-not-allowed disabled:opacity-50" />

<!-- outline: background fills core only (bg-clip-content), 3px padding forms white gap -->
<input type="radio" name="shipping" class="size-5 cursor-pointer appearance-none rounded-full border-[1.5px] border-border-strong bg-clip-content p-[3px] outline-hidden not-checked:hover:border-foreground checked:border-2 checked:border-primary checked:bg-primary disabled:cursor-not-allowed disabled:opacity-50" />
```

Neither requires auxiliary DOM elements or icons. Small size `size-4`: `filled` uses `checked:border-[5px]`, `outline` uses `p-[2px]`.

- **Radio groups always have one option pre-selected** (usually the most common). Radios cannot be deselected, so an unselected group prevents users from returning to an unselected state. Exception: high-consequence monetary choices (paid plans) start empty and require an explicit pick.
- Wrap groups in `<fieldset>` + `<legend>` with the prompt. Without a legend, screen readers announce "Standard delivery, radio button" without context.
- 5 or more options: use a select.
- **Group arrangement: single horizontal row or single vertical column, never a 2-column grid.** From `sm` upwards when short labels fit on one line, use `flex gap-6`; below `sm`, stack vertically. A 2×2 grid reads in a Z-pattern; an ordered scale like priorities yields "Low, Medium / High, Urgent", forcing eyes to jump back to line start to realize "High" follows "Medium" (`R6`).
- **Below `sm`, each option is a 44px tall line with the entire line clickable**: `<label>` wraps control and text, `flex w-fit min-h-11 items-center gap-3` (still conforms to `I26`: width equals control + text, not spanning full row). A 20px control with a 20px label has only a 20px touch target; two rows 12px apart cause taps between lines to miss (probes flag 20×20 targets).

## Choice cards

When selected: **`--border-focus` border + `--ring-focus` ring**, exactly like a focused input. Border alone without a ring makes adjacent cards hard to differentiate; changing card background color is overly heavy.

```html
<fieldset class="space-y-3">
  <legend class="mb-3 text-sm font-medium">Who can post</legend>

  <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-border-strong bg-surface p-4 transition-colors hover:bg-surface-hover has-checked:border-focus has-checked:ring-2 has-checked:ring-focus">
    <input type="radio" name="post" checked class="mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-border-strong bg-surface outline-hidden checked:border-[6px] checked:border-primary" />
    <span class="min-w-0">
      <span class="block text-sm font-medium">All members</span>
      <span class="mt-1 block text-sm text-muted">Anyone who joins the community can post articles.</span>
    </span>
  </label>
  <!-- second card identical, without `checked` -->
</fieldset>
```

- **Tab focus adds nothing extra** (`I13`): no ring around card, no ring around circular input.
- `has-checked:` is Tailwind v4. Tailwind v3.4 uses `has-[:checked]:`.
- `mt-0.5` aligns the 20px control with the first line of `text-sm`, not vertically centered across the whole card.
- Unselected cards use `--border-strong` border like inputs.
- Checkbox cards work identically, changing `type="checkbox"`.

---

## Switch

Switch = **immediate effect**, without waiting for a Save button (`layouts/app.md`, settings page). If saving is required, use a checkbox.

```html
<button type="button" role="switch" aria-checked="false" aria-labelledby="notify-label"
  class="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-muted/40 p-0.5 outline-hidden before:absolute before:-inset-2 transition-colors hover:bg-muted/60 aria-checked:bg-primary aria-checked:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
  <span class="size-5 rounded-full bg-surface shadow-sm transition-transform group-aria-checked:translate-x-5 group-aria-checked:bg-primary-foreground motion-reduce:transition-none"></span>
</button>
```

- `role="switch"` + `aria-checked`, JS toggles `aria-checked` on click. Labeled via `aria-labelledby`.
- **Touch target expands to 40px while visuals stay 24px** (`N9`): `relative before:absolute before:-inset-2` (negative values intentionally kept per `N11`, like copy buttons in `description-list.md`). A bare 44×24 track on touch screens falls short of 32px targets; enlarging the track to `h-8` makes the switch heavier than its label. Two settings rows with `py-4` are spaced far enough that 40px targets do not overlap.
- Off track uses `bg-muted/40`, not `--background-hover`: faint gray on a white card looks like a disabled switch (`I8`).
- **Sliding thumb is an exception to `I12`** (color-only transitions): thumb position conveys state; snapping instantaneously makes it hard for the eye to catch the shift. Include `motion-reduce:transition-none`.
- `shadow-sm` on the thumb is a named exception to `M15`, like segmented tab active pills. Do not add drop shadows to the track.
- Do not print "On / Off" text inside the track. If text is needed, place it beside, describing the **action**, not the state.

**Settings row:**

```html
<div class="flex items-center justify-between gap-4 py-4">
  <div class="min-w-0">
    <p id="notify-label" class="text-sm font-medium">Email notifications</p>
    <p class="mt-1 text-sm text-muted">Send when someone mentions you.</p>
  </div>
  <!-- switch above -->
</div>
```

- Only one line below the label: on error, the red `text-red-600` error message replaces the description; when disabled, the reason (not dimmed with the control) replaces the description. Both use **`text-sm` matching the description**, so rows don't collapse or look mismatched with siblings.
- **Switches are only for toggle-and-done actions**, reversible immediately without further steps. If turning on requires scanning a QR code, entering a password, paying, or confirming, use a **button opening a flow**, beside a status line ("Not enabled" / "Enabled since 12/06/2026"). A switch opening a modal causes Cancel to toggle the switch back and forth, and "Saved" badges show up when nothing was saved. See "Security settings" in `../layouts/app.md`.

---

## Select

**The trigger button looks identical to a text input**: same height, border, radius. While open, border + ring match a focused input, because the user is still "inside" that control. **Focus uses `focus-visible:`, not `focus:`**: after picking with mouse, focus returns to the button; `focus:` makes the button retain its open styling after the dropdown closes (`rules-state.md`, below focus table). Date and time pickers share the same rule.

```html
<button type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false"
  class="group flex h-11 w-full md:h-10 cursor-pointer items-center justify-between gap-2 rounded-xl border border-border-strong bg-surface px-4 text-left text-base outline-hidden transition-colors md:text-sm focus-visible:border-focus aria-expanded:border-focus aria-expanded:ring-2 aria-expanded:ring-focus">
  <span class="truncate">California</span>
  <i data-lucide="chevron-down" class="size-4 shrink-0 text-muted transition-transform group-aria-expanded:rotate-180"></i>
</button>
```

- When unselected, text is placeholder in `text-muted`, written per `T25`: "Select state, province...".
- Radix / shadcn: replace `aria-expanded:` with `data-[state=open]:`.
- **Dropdown filter buttons outside forms** (width shrinks to text, `w-fit`) borrow this exact open state: `border-focus` border + `ring-2`, white background preserved. **No hover effect**, like select triggers inside forms: arrow icon + `cursor-pointer` sufficiently signal clickability (`button.md`). Do not borrow outline button hover: attempting gray hover backgrounds (blending into page background, even `--button-hover` `#f1f1f3` on `#f4f4f6` background differs by only 3 levels) followed by darker borders was rejected in favor of no hover.
- Error: identical to text inputs, `border-red-500`, soft `ring-red-500/10` ring only while focused.

**The dropdown menu** follows overlay panels in `layouts/overlay.md` (`rounded-2xl`, `p-1`, items `min-h-10 rounded-xl` separated by `gap-1`, portaled to `body` per `I22`):

- Width matches **trigger button width** (Radix: `w-(--radix-select-trigger-width)`), offset `mt-2`. Internal content (search box, list) spans full panel width, **never capped with `max-w`**: when the shell matches the trigger but content stops at `24rem`, an empty strip appears on the right with scrollbar awkwardly stranded in the middle (probes report "Overlay has empty margin strip").
- Maximum height **`max-h-83`** (332px), scrolling internally: reveals 7.5 items, with the 8th item cut in half to signal more content (`I18`). Calculated from 40px items + 4px gap (`rules-state.md`); cutting exactly between two items makes the list look finished. When opened, auto-scroll to the selected item and flash the scrollbar once (`flashScrollbar`, `I18`). Since the list fills the `rounded-2xl` frame, both ends of the track meet rounded corners: `[&::-webkit-scrollbar-track]:my-4`, padding `p-1 pr-0 [scrollbar-gutter:stable]` (`I18`).
- **Long option labels** (course names, project names): dropdown width is **at minimum** the trigger width; filter buttons sizing to text (`w-fit`, "Course ▾") expand the menu to `w-72`, not constrained to trigger width. If names are longer, wrap lines within the item (`min-h-10 py-2.5`, `text-pretty`), never `truncate`: multiple names starting with "HTML CSS Course…" become indistinguishable when truncated. The trigger button displaying the selected name uses `max-w-60 truncate` with `title`.
- **Items with descriptions** (roles, tiers, permissions): two tiers, name `text-sm font-medium` + a sentence in `text-sm text-muted` stating **what the permission allows**, item height sizing to content (`py-2.5`), not forced to `h-10`. Closed trigger shows only the title, omitting the description. Selecting roles without this explanation forces the inviter to guess how "Member" differs from "Viewer".
- **Selected item**: `font-medium` text + right-aligned `size-4` `check` icon. Gray `bg-item-hover` background belongs to the **highlighted item** (keyboard navigation or mouse hover, `data-[highlighted]`), not the selected item; on open, the selected item is highlighted first.
- Over 8 items: **search input at top of list**, left `search` icon, placeholder "Search state, province...", bottom divider spanning edge to edge (`F25`). Suggested (user decides): filter immediately on typing without Enter; client-side or server-side filtering uses an empty handler. If no results match, show a centered `text-muted` line: *No states or provinces found*. **Do not repeat the search keyword**: it sits right in the input above (`N3`), and long queries get awkwardly clipped mid-word.
- **Native `<select>` for touch devices only**: fewer than 8 items, no search needed, and component only displays on mobile (separate mobile view or mobile-only app) makes native `<select>` sufficient: `appearance-none` + `chevron-down` icon placed `absolute` on the right, `pr-10`. Mobile devices open native picker wheels, far easier to tap than custom lists. **Desktop viewports always render custom lists above**: styling native select triggers only works when closed; clicking still summons the operating system's raw gray menu, looking out of place. Shared components across breakpoints should render the custom list.

---

## Time picker

Trigger button looks identical to select (`h-11 md:h-10`, `clock` icon on the right, `tabular-nums` values), clicking opens a popover with scrollable columns.

```
┌──────────────────────────────┐
│   Hour     Minute   Second   │   <- column labels text-xs, active column: text-foreground
│   06        28       58      │
│   07        29       59      │
│ ┌──────────────────────────┐ │
│ │ 08        30       00    │ │   <- ONE background band spanning all three columns
│ └──────────────────────────┘ │
│   09        31       01      │
│   10        32       02      │
└──────────────────────────────┘
```

- **Selected value is ONE horizontal band across all three columns**, background `bg-item-hover` with `rounded-xl` corners, numerals inside using `font-semibold text-foreground`. Do not highlight each cell with solid `primary`: three black blocks inside a compact popover create the heaviest visual mass on screen, reading as three separate choices rather than a single unified timestamp "08:30:00". Same philosophy as select: selection is indicated by bold text, not accent fills.
- **All columns loop infinitely, including seconds**, without hard start or end. An intentional divergence from typical UI kits: common web pickers do not loop and pin the selected number to the top; this skill keeps the selection band fixed in the center, so looping is required for all numbers to reach the band. Above `00` is `23` (hour) or `59` (minutes, seconds); below `59` is `00`, like a clock face. This ensures selected values across all columns remain centered on the same row, keeping the scroll area full of numbers. **Do not insert empty padding above/below** to push `00` down: an empty upper half looks broken or unfinished.
- **Fixed central selection band is intentional** (wheel style): the number inside the band is the selected value. However, **scrolling is not the only way to pick**. Three input methods supported: **click any number** to slide it into the band and select it (`cursor-pointer`, text brightens to `text-foreground` on hover); trackpad/wheel scroll or drag; arrow keys. Limiting to scrolling makes desktop usage cumbersome: a single flick can jump past five or six numbers.
- Suggested (user decides): allow **direct typing into the input** across segments `HH`, `mm` like `<input type="time">`. Keyboard users type `0830` much faster than any wheel; the popover serves as secondary fallback.
- **Infinite looping must scroll smoothly.** Implementation: repeat the list multiple cycles (around 10 cycles: 240 hour cells, 600 minute cells, still very lightweight), open centered on the middle cycle, and **snap back to center cycle only after scrolling stops** (`scrollend`, or 150ms debounce on `scroll`), adjusting `scrollTop` by an exact multiple of cycle length so eyes notice no jump. Do not repeat only 3 cycles and snap mid-scroll: altering `scrollTop` during inertia cancels velocity, causing the wheel to jerk to a halt.
- **When unselected, input still displays placeholder** ("Select send time"). Opening the popover parks the wheels at a suggested default (rounded current time or consumer-passed value, consumer decides), but the value is written to the input only when the user scrolls, clicks, or hits Enter. Auto-filling `00:00:00` upon open takes choice away from the user.
- **No half-cut numbers**: scroll area height equals an odd multiple of cell height (5 cells `h-10` = `h-50`), `scroll-snap-type: y mandatory` + `snap-center` on each cell. Fade top and bottom edges smoothly using `mask-image` (transparent `linear-gradient` on both ends) to indicate continuity, rather than abruptly clipped text.
- **Active column (keyboard navigation)**: column label promotes to `text-foreground`, other columns remain `text-muted`. No ring around cells (`I13`).
- **Default shows only hours and minutes** (`HH:mm`). Seconds column added only when requirements demand seconds (consumer decides).
- Touch devices: suggest (user decides) native `<input type="time">`, where mobile OS opens built-in wheels that are easier to manipulate. Same rationale as select with fewer than 8 items.
- **Alternative style, built only when explicitly requested: column list** (Ant Design style). No shared band; each column highlights the selected cell with `bg-item-hover` and `font-semibold` text; selected item scrolls to column top; columns do not loop, with bottom padding so `59` can reach the top. Fits dense desktop layouts, but loses the benefit of reading time horizontally as a single row. The wheel style above remains default.
- Error and disabled states match text inputs: error has `red-500` border + soft red ring + error message below stating the required reference ("must be after start time 08:30"); disabled states follow table below.

## Date picker

> **Check libraries first** (specialized library table in `SKILL.md`). If the project has
> `react-day-picker` (shadcn `Calendar`), `@mantine/dates`, `react-datepicker`…
> use it, styled to match the visuals below. If none exists, build per this section;
> only propose a library when custom development is expensive (multiple timezones,
> lunar calendar, multi-locale).

Trigger button looks identical to text input (`h-11 md:h-10`, `calendar` icon on the right, placeholder "Select date"), clicking opens the month calendar popover.

```
┌────────────────────────────┐
│ [Sept 2026 ▾]        ‹  ›  │   <- header is a BUTTON: click to change month/year
│ Mo Tu We Th Fr Sa Su       │
│ 31  1  2  3  4  5  6       │   <- adjacent month days: text-muted
│  …                         │
│ 21 [22] 23 …               │   <- today: font-semibold + dot below
└────────────────────────────┘

Click header ──► ┌────────────────────────────┐
                 │ [2026 ▾]             ‹  ›  │   <- ‹ › changes year
                 │ Jan  Feb  Mar  Apr         │
                 │ May  Jun  Jul  Aug         │   <- 12-month grid
                 │ Sep  Oct  Nov  Dec         │
                 └────────────────────────────┘
Click year   ──►  12-year grid (2020–2031), ‹ › jumps 12 years
```

- **Changing month/year does not force users to click arrows month by month.** Header "Sept 2026" is a button (small `chevron-down` beside): clicking reveals a **12-month grid**, clicking year reveals a **12-year grid**. Selecting navigates back to that month's date grid. Reaching March next year takes two clicks, not six arrow clicks.
- Month and year grids share **exact same container dimensions** as the date grid: popover does not resize between views. Cells `h-10 rounded-xl`, selected and current month/year follow date cell conventions below. **Container sizes from date grid, not hardcoded**: date grid (day-of-week header + 6 rows) **stays in document flow** to establish width and height. In month/year views, date grid remains rendered but styled `invisible` + `aria-hidden`, while month/year view overlays with `absolute inset-0`. Removing the date grid from DOM collapses the shell to 0px, causing overlays to bleed outside. Hardcoding `height: 272px` when date grid needs 288px summons scrollbars (`layouts/overlay.md`, "Overlays have no scrollbars").
- **Selected date**: `primary` background, `primary-foreground` text. A named exception to "selection does not use accent fill" in select: date cells are bare numbers where bold text alone fails to stand out from 41 neighboring numbers, and the calendar contains only a single solid cell. **Today**: `font-semibold` + `size-1` dot beneath number, no background fill. Hover: `bg-background`. When today is also the selected date, retain both: `primary` background, dot changes to `primary-foreground` to remain visible.
- **Date grid uses `gap-y-1`, no horizontal gaps**, so all calendars (single date, date range, date-time) share one unified grid. Vertical gaps separate weeks; no horizontal gaps allow range selection bands to run continuously.
- **Always 6 rows**, even when a month fits in 5: popover height never jumps when browsing months. Days from adjacent months use `text-muted`.
- Week starts on **Monday** (`Mo … Su`), no distinct coloring for weekends. In English copy, first day follows locale (`T28`).
- Suggested (user decides): allow **direct typing into the input** formatted as `YYYY-MM-DD` or `MM/DD/YYYY`. Faraway dates (birthdays, contract end next year) are typed much faster than browsing grids. When typing is enabled, error messages can provide format examples; when typing is disabled, never display "e.g. 12/31/2026", as users have nowhere to type.
- Error messages describe **what went wrong**, rather than repeating placeholder text: "Expiration date is required", "Expiration date must be in the future". Not "Select expiration date".
- **Opening from a table cell (inline edit, like task deadline)** differs from form inputs in three ways:
  - **Clicking a date saves and closes**, no "Apply" button. `Esc` or clicking outside cancels, preserving previous value; focus returns to the cell.
  - **Clear date action exists.** When a deadline is set, the bottom of the grid includes a clear row: edge-to-edge `border-t border-border` divider (`F25`), followed by `p-1` and a **full-width menu item row**: `flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm text-foreground hover:bg-item-hover`, `calendar-x` icon `size-4 text-muted` + "Clear deadline", left-aligned. Without this row, setting a deadline once makes it impossible to return to `—`.
    - **Do not use a shrink-to-fit `ghost` button.** A lone compact button on an entire divided row looks abandoned, as if a sibling button is missing. A full-width row matches menu item conventions, reading as "another option in this popover", aligning with quick presets added later.
    - **Left-aligned, not right-aligned.** The bottom right edge of a popover is reserved for confirmation buttons ("Apply"); here clicking a date saves immediately, so placing "Clear" on the right misleads as primary action.
    - **Not red, even on hover.** Hovering red (`I4`) is reserved for **destructive entity deletion**: permanent data loss. Clearing a deadline merely resets a value to empty, easily restored: none of the three criteria in `I4` apply. Coloring it red creates hesitation over a harmless action, and dilutes the impact of red in the "Delete task" menu option on the same row. Do not prompt for confirmation.
    - When no deadline is set, omit this row (nothing to clear).
  - The cell opening the popover keeps its active hover background while open (`aria-expanded:bg-foreground/8`, not `bg-surface-hover` to avoid matching table row hover, not `/5` which is too subtle, `I10`), clearly identifying which cell is being edited.
  - **Affordance while idle**: when inline editing is secondary (deadline among three or four editable fields on a task row), show only on hover; when the cell is **the primary task of the screen** (roles on a member management page), `ChevronDown` remains permanently visible. See "Member management and permissions" in `../layouts/app.md`.
  - Suggested (user decides): quick presets "Today · Tomorrow · Next Monday" above the grid. Deadlines predominantly fall in the next few days.
- Alternative style, built only when requested: **two select dropdowns for month and year** replacing the header (suitable for birthday pickers jumping decades). Default remains clickable header above.

**Disabled dates** (past dates, holidays, outside allowed range): **which dates are disabled is business logic, user decides** (passed via props like `disabledDays`, `minDate`). The skill specifies only visual presentation: `text-muted opacity-50`, `cursor-not-allowed`, no hover, excluded from range selections. Distinguished from adjacent month dates (which are `text-muted` but still clickable) by dimming opacity. Any preset range overlapping disabled dates also becomes disabled.

### Date range

**Inherits all date picker rules above** (clickable header for month/year grid, always 6 rows, bold today with dot, week starts Monday, error copy). Below are additions.

```
┌──────────────┬──────────────────────────────┬──────────────────────────────┐
│ [Past 7 days]│ [Sept 2026 ▾]             ‹  │                    ›         │
│  Past 30 days│ …                            │ Oct 2026                     │
│  This month  │ 14 15 (16)▓17▓18▓19▓20▓      │ …                            │
│              │ ▓21▓(22) 23 …                │                              │
│              │ 7 days · 09/16 – 09/22/2026  │                              │
└──────────────┴──────────────────────────────┴──────────────────────────────┘
```

- **Two months side by side from `md`**, single month on narrow screens. **In dual-month view, omit adjacent month days** (leave cells blank), preventing the 30th and 31st from showing up twice in adjacent grids. Popover height sizes to the month with more rows. On open, **the month containing the end date sits on the right**, keeping the active range visible. Ranges crossing month boundaries are common; single-month pickers require clicking arrows midway through selection. ‹ sits on the left of the first month, › sits on the right of the second; first month header is clickable just like a single date picker.
- **Start date and end date**: `primary` background identical to selected single dates, sharing the **exact same class** `bg-primary text-primary-foreground`, without using `bg-primary/90` or hover styling on either end. Inconsistent shades make eyes perceive two different date types. Hovering either end shifts to slightly lighter `primary-hover`: correct, but screenshots should position the cursor outside the popover to avoid appearing mismatched. If today falls on either end, the dot switches to `primary-foreground`.
- **Connecting range band**: background `bg-item-hover` (in light mode matching page background; in dark mode a subtle white overlay, avoiding `bg-background` which creates dark holes in the popover, `M21`), spanning continuously between both ends. The band **underlays half the cell** of start date (right half) and end date (left half), so rounded corners of solid endpoint cells sit cleanly atop the band without exposing gap corners. When the band reaches week edges, **round the row ends** (`rounded-l-xl` on Monday, `rounded-r-xl` on Sunday), avoiding hard square cuts.
- **Continuous band horizontally, separated vertically.** Within a single week, cells touch seamlessly so the band reads as a continuous range; inserting horizontal gaps breaks the range into disconnected pills. Between week rows, add `gap-y-1`: without vertical gaps, adjacent weeks fuse into a stepped staircase block, obscuring individual weeks.
- **Between the two clicks**: a light preview band tracks the cursor from the start date to the hovered date, previewing the prospective range.
- **Footer text communicates the current step**, updating with state: before first click "Select start date", after first click "Select end date", both selected summarizes range "7 days · 09/16 – 09/22/2026". Still displaying "Select start date" after picking is incorrect.
- **Preset ranges on the left**: `w-40` column, each item `h-10 rounded-xl`, matching preset uses `bg-item-hover` + `font-medium`; unselected items use `text-foreground/70`, not dimmed to `text-muted` (which looks disabled, `I8`). Preset list is consumer-defined. On narrow screens (and compact variants in filter popovers), this column shifts to a **chip row above the calendar, `flex-wrap`, no horizontal scroll**: narrow calendar popovers match input width (~310px at 375px); three presets "Next 7 days · Next 30 days · This month" fall short by 28px; horizontal scrolling awkwardly clips the last chip at the edge, and a few fixed presets do not warrant a scroll container. Chip rows sit inside the popover's `px-*` container, never stretched with `-mx-*` (`N11`).
- Input displays `09/16/2026 – 09/22/2026`, joined by an en-dash `–` with spaces on both sides.
- **Initial open month depends on the field's temporal direction.** Backward-looking fields (reports, order history, "Past 7 days") place current month on the right, preceding month on the left. Forward-looking fields (deadlines, scheduling, "Next 7 days") place **current month on the left**, next month on the right: opening a deadline filter showing August + September when today is Sept 26 wastes half the calendar on past dates.
- Inside another overlay (filter popover), use the compact single-month variant across all breakpoints: one month, presets as chips, matching trigger width (`../layouts/overlay.md`, "Filter popover").
- Dual-month popover is wider than its trigger: if overflowing screen right edge, **shift horizontally** inward (horizontal shift does not cover the trigger, which is permitted), without squeezing the grid.

**Popovers never obscure the trigger that opened them** (applies to all popovers: select, time picker, date picker). If vertical space below is insufficient, flip above the trigger, keeping the trigger visible; if space above is also insufficient, let the page scroll rather than shifting the popover to cover the trigger. Radix: `side="bottom"` + `avoidCollisions`, do not enable `sticky="always"`.

### Combined date and time picker

**Inherits calendar from date picker and wheels from time picker.** Additions:

```
┌───────────────────────────────┬──────────────┐
│ [Sept 2026 ▾]           ‹  ›  │  Hour   Min  │
│ date grid                     │   22    04   │
│                               │ ▓ 23 ▓▓ 05 ▓ │
│                               │   00    06   │
├───────────────────────────────┴──────────────┤
│ 09/23/2026 23:05                      [Done] │
└──────────────────────────────────────────────┘
```

- **Calendar on left, wheels on right** from `sm`, separated by `border-l border-border`. On narrow screens, wheels move below calendar.
- **Wheels match calendar area height**, with selection band centered vertically. Wheels shorter than the calendar leave empty space below, making the right column appear unfinished.
- **Has a Done button, so values write to input only on clicking Done** (or Enter). While selecting, input retains previous value or placeholder; pending value displays in the **summary line** on the left of footer (`text-sm text-muted tabular-nums`). Esc or clicking outside cancels, leaving input unchanged. Do not combine Done button with immediate input updates: mixing patterns confuses users on whether Esc reverts.
- **Done** is the sole `primary` button in the popover (`I3`), right-aligned in footer. Footer uses `border-t border-border`, `px-4 py-3`.
- Input icon is `calendar-clock` (Lucide), not `calendar`: signals both date and time at a glance.
- Input displays `09/23/2026 23:05`, single space separating date and time, `tabular-nums`. If seconds are included, expand input and frame width accordingly.

## State completeness check

| State | Checkbox / radio | Switch | Select |
| --- | --- | --- | --- |
| Normal | border `--border-strong` | track `muted/40` | border `--border-strong` |
| Hover | unchecked: border `--foreground`; checked: preserve accent | track `muted/60` / `--primary-hover` | unchanged, `cursor-pointer` |
| Tab focus | unchanged (`I13`) | unchanged (`I13`) | border `--border-focus` |
| Checked / on / open | accent fill per style | accent track, thumb right | border + ring, chevron rotated |
| Indeterminate | `minus` icon (checkbox only) | — | — |
| Error | border `red-500` + error copy | — | border `red-500` + red ring |
| Disabled | `opacity-50`, `cursor-not-allowed`, **entire label** | as left | as left |

When disabled, dim the entire label alongside the control (`peer-disabled:` or `has-disabled:` on `<label>`). Dimming the box while leaving the label black invites users to tap the label, yielding no response.

**When disabled, explain why directly below the control**, with a `text-xs text-muted` hint: "Contact administrator to change cutoff time". In a **settings row** with a `text-sm` description, the reason (and error copy) replaces the description while preserving `text-sm`, not dropping to `text-xs` (`../layouts/app.md`, "Settings page"). A disabled control without explanation leads users to suspect a bug and leaves them stranded without next steps.

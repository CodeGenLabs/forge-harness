# Chips and IconButtons

Source: chips and icon buttons from a production project.

```tsx
// Chip: filters, selectable tags. Always include aria-pressed={isActive}
"inline-flex max-w-48 cursor-pointer items-center rounded-full px-3 py-1 text-xs font-medium outline-hidden transition-colors"
isActive && "bg-primary text-primary-foreground"
!isActive && "bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground"

// IconButton: secondary actions in table rows or headers
"inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors"
"hover:bg-foreground/5 hover:text-foreground"   // inside rows with hover background: hover:bg-foreground/8
"outline-hidden"
"disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
```

## Chip has two sizes, selected by role

Common mistake: taking widget-sized chips and making them the main page filter, making the row look shrunken.

| Role | Size | Paired with |
| --- | --- | --- |
| **Secondary chip in widgets**, tags, status labels | `px-3 py-1 text-xs` (~26px height) | Inside small cards, beside `text-xs` text |
| **Primary page filter chip** | `h-9 px-3.5 text-sm` | Beside `h-10` search inputs, beside `h-10` buttons |

General principle: **chips sharing a row with inputs or buttons should roughly match their height**; being off by more than one tier breaks the visual rhythm. A 26px chip beside a 40px input makes the filter cluster read as secondary, even when it is the primary filter.

---

**Why it works**

- **Unselected chips are subtle pills in `bg-foreground/5`, text `foreground/70`**; hover to `foreground/10`, selected fills with `bg-primary`. Sizing tint to text color ensures **consistent contrast across both gray page backgrounds and white cards**, without selecting tokens per surface. Do not use `bg-background`: on white cards it becomes 7 prominent gray pills, making an untouched filter row the second heaviest visual mass on screen; on gray page backgrounds it matches the background, hiding hover states. Do not omit background entirely leaving bare `text-muted` text: a row of text chips looks like **a second tab bar** directly below tabs, and `--muted` on `#f4f4f6` is only 3.5:1. Chips must retain pill silhouettes to contrast with tabs. No border: ten chips with borders look like a picket fence.
- Chips **inside popovers with confirmation buttons** (Filter popover) do not use `bg-primary` when selected, see "Filter popover" in `../layouts/overlay.md`: a black chip next to a black Apply button creates two equally heavy visual masses.
- Selected chip background is **`bg-primary text-primary-foreground`**, matching tokens, never raw hex or `text-white`. Using tokens handles dark mode automatically; hardcoded values become white text on white backgrounds. Also avoid mistakenly using `--primary-hover`: selected chips will appear lighter than adjacent primary buttons.
- **Truncate long labels, do not let chips bloat.** Chip `max-w-48`, text wrapped in `<span class="truncate">`, and full string in `title` so hovering reveals full text. A single wide chip next to compact chips throws the row off balance.
- **Filter chips are toggle buttons, requiring `aria-pressed={isActive}`.** Selection state is conveyed via background color alone; screen readers cannot see color, so without `aria-pressed` all chips announce identically as plain buttons. Single-select chips (tab style) use `role="radio"` + `aria-checked` inside `role="radiogroup"`, not `aria-pressed`.
- Chips use `rounded-full`, buttons use `rounded-xl` (or `rounded-lg` under 40px, `F1`). Different silhouettes immediately distinguish multi-select filters from action triggers.
- Square `size-8` IconButton, text `text-muted` at rest, darkening on hover. Auxiliary icons must not compete in darkness with primary content.
- **IconButton hover background uses overlay `bg-foreground/5`, not `bg-background`.** Buttons often live in list rows with `hover:bg-item-hover` (`list-row.md`): hovering the button matches row background, making it disappear. Overlays scale with the underlying surface so the button stands out everywhere. **Inside rows with hover backgrounds, elevate to `hover:bg-foreground/8`** (`I10`): `/5` on a hovered row blends in too closely.
- Disabled state must disable hover styles (`disabled:hover:bg-transparent`). Without this, disabled buttons illuminate on hover, confusing users on why clicks do nothing.
- `aria-label` and `title` always receive the exact same `label` string. Required for icon-only buttons.

---

## Applied filter chips (with ×) ⚑

Filter summary row next to result count (*8 results · [Near hospital ×] [Near college ×] Clear filters*) acts as a **dismiss filter button**, not an on/off toggle like filter chips. Different roles require different silhouettes:

```html
<button type="button" aria-label="Remove filter: Near hospital"
  class="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-border-strong bg-surface pr-2 pl-3 text-sm text-foreground outline-hidden transition-colors hover:bg-button-hover">
  Near hospital <i data-lucide="x" class="size-3.5 text-muted"></i>
</button>
```

- **Bordered, no gray background, no accent fill.** Background `bg-foreground/5` is the visual shape of **unselected** chips in filter rows: using it in summaries misleads as unselected. Filling with `bg-primary` adds a third or fourth accent mass next to active chips (`N3`). Border `--border-strong` matches outline buttons (`M14`): reading clearly as "clickable, click to dismiss".
- **The entire chip is the dismiss button**, not just the × glyph; `aria-label` explicitly states what filter is being removed.
- Labels convey full context standalone ("Near hospital", "Under $800"), not just "Hospital".
- **Only show filters hidden from view**: filters chosen inside dropdowns, popovers, panels (region, price range, room type). If a filter is already visible as an on-page chip, its active state already communicates selection; do not duplicate it in the summary row ("Two places for one fact", `V1b`; settled).
- **"Clear all"** is a ghost text button at row end, visible whenever at least one filter is active, **including visible chip filters**: it clears everything at once. With no hidden filters, the row shows only result count and "Clear all".

## Chip row on narrow screens

Filter chip rows **never `flex-wrap`**. Four chips at 375px turn into three on one row with an orphan wrapping below, reading like an error rather than intentional design.

```html
<!-- Wrapper container has 4px less horizontal padding than siblings (card px-5 means this wrapper uses px-4, R6):
     inner row px-1 brings first chip flush with column. -->
<div class="scrollbar-clean overflow-x-auto py-0.5">
  <div class="flex items-center gap-2 px-1">
    <button type="button" aria-pressed="true" class="shrink-0 cursor-pointer rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground outline-hidden">All</button>
    <button type="button" aria-pressed="false" class="shrink-0 cursor-pointer rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/70 outline-hidden hover:bg-foreground/10 hover:text-foreground">Overdue</button>
    <button type="button" aria-pressed="false" title="International Trade Fair 2026" class="max-w-48 shrink-0 cursor-pointer rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/70 outline-hidden hover:bg-foreground/10 hover:text-foreground">
      <span class="block truncate">International Trade Fair 2026</span>
    </button>
  </div>
</div>
```

`shrink-0` prevents chips from squishing; `scrollbar-clean` hides scrollbars. Hiding scrollbars on mouse devices requires arrow navigation buttons where hidden chips remain (`responsive.md`, after `R10`). Active dismissible chips (click to remove) behave differently: wrapping onto new lines from `sm` downwards, with "Clear all" always visible (`responsive.md`, after `R6`).

Place padding on the **inner row**, not the scroll viewport: `<div class="overflow-x-auto"><div class="flex gap-2 px-1">`. Viewport right padding is ignored when scrolled to the end, pinning the last chip against the edge. **Do not stretch the scroll container with `-mx-1`** (`N11`): the wrapper indents 4px less while sibling containers keep full margins (pattern in `R6`).

---

## Tab bar: four variants, chosen by context

Tabs and chips look similar but have distinct behaviors:

| | Tab | Filter chip |
| --- | --- | --- |
| Selection | **Strictly one**, one is always selected | None, one, or multiple |
| Example | All / In Progress / Prospects / Archived | Tags, assignee, price range |
| Silhouette | Per variant below | Pill `rounded-full`, selected is solid fill |

### Variant selection

| Variant | Visual | Context |
| --- | --- | --- |
| `boxed` (default) | Plain text, active tab is a **subtle tinted box with hairline border** | Above tables / lists, switching status: All / Pending / Delivered |
| `underline` | Edge-to-edge baseline, **2px indicator bar** beneath active tab | Dividing record detail page sections: Overview / Activity / Files. **Navigation between settings sub-pages**: Profile / Notifications / Security (`../layouts/app.md`, "Settings with multiple sub-pages") |
| `solid` | Active tab is an **accent-colored pill**, inverted text | Only when explicitly requested. Never for settings pages: screens packed with enabled `--primary` switches compete with a heavy black pill at the top |
| `segmented` | **Sunken track**, active tab is an **elevated white pill** like a physical key | 2–4 short choices toggling view modes: Day / Week / Month, List / Grid |

- **When a filter chip row sits directly beneath tabs, use `underline`, not `boxed`.** Chips are rounded gray pills; active `boxed` tabs are also rounded gray pills. Two rows of gray pills stacked together make active tabs look like another chip, obscuring the view state. A 2px underline uses a completely distinct visual language, instantly separating the rows (`N5`).
- **Only one variant per role on a page.** If table status tabs are `boxed`, all tables across the app must use `boxed`.
- **`solid` is not used for status tabs on tables.** A solid pill at the top of a table draws more attention than the data itself, reading like a primary action button. Avoid in settings areas; use `underline`.
- If `segmented` exceeds 4 choices or labels exceed two words, switch to `boxed` or `underline`.

### Defaults when unstated: no icons, no counts

Tabs default to **plain text**, without icons or counts. Only add when:

- **Icons:** explicitly requested, or existing tab patterns in the project include them.
- **Counts:** explicitly requested ("show count per tab"), or real data already includes counts. Never invent mock counts. Common cases: sub-record tabs on detail pages ("Orders 24", "Files 4"); stream tabs (Messages, Activity) remain plain text (`layouts/app.md`).

### Icons: three rules when present

Icons preceding text are **optional**, see defaults above. When included:

- **Every tab in the row has an icon**, or none do.
- Icon `size-4 shrink-0`, sourced from the project's icon library, **inheriting text color** (`currentColor`): unselected tab icons match gray text, active tab icons match dark text. Never style icons with unique colors.
- Icon-only `segmented` tabs must include `aria-label` and tooltips.

### Shared rules across all variants

```tsx
<div role="tablist" aria-label="Filter by status" className={getTabListClasses(variant)}>
  {views.map((view) => {
    const isSelected = view.value === activeView;

    return (
      <Button
        key={view.value}
        variant="ghost"
        role="tab"
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
        onClick={() => onChange(view.value)}
        className={getTabClasses(variant, isSelected)}
      >
        {view.icon && <view.icon className="size-4 shrink-0" />}
        {view.label}
        {view.count !== undefined && <span className="text-xs font-normal tabular-nums text-muted">{view.count}</span>}
        {view.isNew && <span className={getNewBadgeClasses(isSelected)}>New</span>}
      </Button>
    );
  })}
</div>
```

- **All tabs use `font-medium`**, even unselected. Weight shifts cause layout reflows.
- Unselected tabs use `foreground/70`. Hover uses `foreground/5` (except `underline` which darkens text only); keyboard focus has no ring (`I13`), **never gray background**. Do not use `--background` as hover background: tabs often sit on gray page backgrounds, making `--background` invisible on hover.
- WAI-ARIA keyboard navigation: only selected tab in Tab sequence, left/right arrows navigate and select, Home/End jump to ends.
- Counts are plain `text-foreground/70`, not pills, not colored. **Do not use `text-muted`**: on active `boxed` tabs with `--secondary` backgrounds, `--muted` is only 4.04:1 (`styles.md`). On active tabs it is one step softer than foreground; on inactive tabs it matches label color. If counts are missing, omit them; never create fake numbers.
- Tab bars never wrap; narrow screens scroll horizontally in `scrollbar-clean` containers (`R6`). Beyond 6 tabs, group excess into a "More" dropdown tab (`R10`).

### `boxed`: status tabs above tables

```ts
// Scroll viewport py-0.5, wrapper padding reduced by 4px (R6, no -mx-1): hover background of first/last tabs is not clipped. Row: gap-1 px-1.
"h-9 rounded-lg border px-3"
isSelected && "border-transparent bg-tab-selected text-foreground"
!isSelected && "border-transparent text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
```

- **Every tab has `border`**, inactive tabs use `border-transparent` to prevent 2px layout jitter.
- **Active tab: background `bg-tab-selected`, text `--foreground`, transparent border.** Token is 8% text overlay (`tokens.css`), naturally adapting to surface contrast: on gray page backgrounds contrast is 18 levels, on white cards 19 levels, dark mode inverts automatically. Avoid solid `bg-secondary`: on page backgrounds it has only 13 levels of contrast, blending into the background. Maintain at least 16 levels of contrast between the active tab and the **surface immediately beneath it** across both cards and page backgrounds (probes check "Active tab blends into background").
- **Do not use `bg-surface` (white) or `bg-surface-hover`.** These differ from white backgrounds by only 1–3%, making active tabs indistinguishable at a glance.
- **Contrast must be measured against the surface UNDERNEATH**, not sibling tabs. Moving the same class between white cards and gray pages alters visibility; test every gray shade on both backgrounds (`N2`).
- **Do not wrap `boxed` rows in a dedicated gray container.** They sit directly on page or card surfaces. Adding a gray wrapper creates a broken `segmented` control: thick dark track with stranded white pills.
- **`h-9 rounded-lg`**: heights under 40px use 8px radius (`F1`) without exception. Do not use 12px: a 36px tab with 12px radius looks overly bulbous. Standing beside `h-10` inputs differs by one acceptable tier.
- Sits alongside search inputs, **Filter** buttons (opening popovers for non-status fields), and **Sort** buttons if needed. All are `h-10 rounded-xl` outline buttons (`I1`), **matching `h-10` search inputs**: the entire toolbar shares uniform height, per the size table at top of file. A `h-9` button next to a `h-10` input has a 4px baseline mismatch, looking broken.

### `underline`: sectioning detail pages

```ts
// Row: baseline runs full width, drawn internally (1px inset shadow at bottom), active tab indicator overlays it.
"flex min-w-full gap-2 px-2 shadow-[inset_0_-1px_0_var(--tab-rail)]"
// Tab: indicator is ::after avoiding height shifts. box-content h-10 pb-px: tab is 41px tall overlaying baseline, bottom-0 indicator sits flush on it.
"relative box-content h-10 rounded-xl px-2 pb-px after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full"
isSelected && "text-foreground after:bg-foreground"
!isSelected && "text-foreground/70 after:bg-transparent hover:text-foreground"
```

- **When tabs share a row with search inputs/buttons in a table toolbar, omit the edge-to-edge baseline, keeping only the 2px active bar.** Full baselines stopping abruptly at search inputs look unfinished, and because scroll containers extend 8px beyond content columns (to align initial text), the baseline would protrude 8px past card boundaries below. Edge-to-edge baselines are reserved for standalone tab rows, like detail pages.
- Indicator bar uses `--foreground`, not accent color: accent is reserved for primary page actions (`M3`).
- **Bar position avoids negative `-bottom-px`** overlapping row `border-b` (`N11`). Horizontal scroll containers clip vertically as well; when the baseline sits on an outer wrapper (settings), the indicator's bottom edge is clipped, leaving only 1px. The `box-content pb-px` + `bottom-0` technique looks identical to negative offsets on standalone rows while preserving the full 2px indicator in settings areas.
- Wrapper container padding is reduced by 8px (`R6`), avoiding scroll container `-mx-2` (`N11`): first tab text aligns cleanly with content below.
- Active tabs have no background fill and no hover background shift. The indicator line is the sole signal.
- **No tab has a background, even on focus.** Keyboard focus changes nothing visually (`I13`). If tabs are `Button variant="ghost"` and legacy button styles treat focus like hover (gray background), focus conflicts with mouse hover: two tabs illuminate simultaneously, confusing which is active. Fix this in the shared `Button` component, not via ad-hoc patches.
- **Baseline uses `--tab-rail`** (10% text overlay), not `--border-strong`: tab rows frequently sit directly on gray page backgrounds where `--border-strong` differs by only 10 levels, making it invisible. Overlays guarantee ~22 levels of contrast on both white cards and gray pages. Measure line contrast against its immediate backdrop: under 16 levels is flagged as sinking into background.

### `solid`: solid pill tabs (only when explicitly requested)

```ts
"h-9 rounded-lg px-3"
isSelected && "bg-primary text-primary-foreground hover:bg-primary"
!isSelected && "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"

// "New" badge beside label: standard pill badge, color inverts with tab state.
function getNewBadgeClasses(isSelected: boolean) {
  return cn(
    "rounded-full px-2 py-0.5 text-xs font-medium",
    isSelected && "bg-primary-foreground text-primary",
    !isSelected && "bg-emerald-500/10 text-emerald-700",
  );
}
```

- Fills use `--primary` and `--primary-foreground`, not hardcoded `bg-black text-white`: dark mode inverts accent colors to near white.
- **Only one solid block on screen.** If an adjacent primary button exists, use `boxed` instead, avoiding competing solid blocks (`M2`).
- "New" badges represent status information, using status green (`M4`), inverting to `--primary-foreground` on active tabs. Max two badges per row to maintain utility.
- Pills use `rounded-full text-xs`, lowercase "New", not uppercase or `text-[10px]`: 10px uppercase crowds accents, and `rounded` 4px introduces an unnecessary fifth radius tier (`F1`).

### `segmented`: view toggles, elevated key style

Track is **sunken** (inner shadow), active thumb is **elevated** (subtle outer shadow + hairline border). Opposing shadow depths create physical realism; elevated thumbs alone look like flat cutouts.

```ts
// Track: subtle --background, NOT --secondary (overly dark, making white thumb look sunken).
// 12px radius, 4px padding, 8px inner thumb: concentric curves (M19).
"inline-flex w-fit max-w-full gap-1 rounded-xl bg-background p-1 shadow-(--shadow-segment-track)"
// Thumb
"h-8 rounded-lg px-3 transition-[color,background-color,box-shadow] duration-150"
isSelected && "bg-surface text-foreground shadow-(--shadow-segment-thumb)"
!isSelected && "text-foreground/60 hover:text-foreground"
```

Two shadow tokens defined in `tokens.css`, with dedicated dark mode variants:

```css
:root {
  --shadow-segment-track: inset 0 0 0 1px rgb(0 0 0 / 0.05), inset 0 1px 2px rgb(0 0 0 / 0.04);
  --shadow-segment-thumb: 0 0 0 1px rgb(0 0 0 / 0.04), 0 1px 2px rgb(0 0 0 / 0.06), 0 2px 6px -2px rgb(0 0 0 / 0.08);
}
.dark {
  --shadow-segment-track: inset 0 0 0 1px var(--border), inset 0 1px 2px rgb(0 0 0 / 0.4);
  --shadow-segment-thumb: 0 0 0 1px var(--border-strong), inset 0 1px 0 rgb(255 255 255 / 0.06), 0 1px 2px rgb(0 0 0 / 0.5);
}
```

- **Track is subtle, not heavy.** `--background` on white cards reveals the track cleanly; `--secondary` creates a heavy dark mass that competes with widget contents.
- Unselected thumbs have **no hover background**, shifting text color only. Gray hover fills inside gray tracks create muddy three-tier grays.
- Shadows here are a **named exception to `M15`**: active thumbs represent tactile physical keys. Do not copy this pattern to `boxed`, `underline`, `solid`, or other elements.
- Dark mode: dark shadows lose visibility (`M23`), so thumbs elevate via `--border-strong` borders and subtle `inset` top rim lighting.
- When placed directly on gray page backgrounds outside cards, switch tracks to `bg-foreground/5` so tracks remain darker than surroundings.

---

## Count badge

Unread tasks, items in a category, member counts. Found in sidebars, tabs, column headers.

Default is **plain numbers in gray text**, without frame or background. White pills with hairline borders are used only when explicitly requested. Five bordered pills in a column create five distracting visual boxes (applies to sidebars as well, `../layouts/app.md`).

```html
<!-- Default: plain numbers. Active row elevates number to text-foreground matching text. -->
<span class="ml-auto shrink-0 text-xs tabular-nums text-muted">4</span>

<!-- Explicitly requested: white pill, hairline border, gray text. -->
<span class="ml-auto shrink-0 rounded-full border border-border-strong bg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-muted">121</span>
```

- **One list uses ONE style.** If pills are chosen, all numbers become pills, even `4`. Never split styles by meaning (pills for unread, plain for regular counts): placed together, rows look inconsistent without communicating meaning.
- **Always right-aligned**, spaced from labels via `ml-auto` or `justify-between`.
- **No brand colors or solid backgrounds.** Brand badges with white text add visual clutter and scatter accent color across sidebars. Counts are informational, not actions (`M2`, `M4`). Projects wanting colored badges can add them; skills do not propose them unsolicited.
- **When using pills, background is `--surface` (white)**, not `--secondary`. White pills remain crisp against hovered rows (`--background`) and active rows (`--secondary`), whereas gray pills dissolve into rows.
- Apply color only when numbers indicate a **genuine alert** (overdue tasks: amber text, still without solid fills).
- `tabular-nums` ensures columns align cleanly.
- Compact large counts: `99+`, preventing numbers like `1,284` from expanding sidebar width.

---

## Pagination

Located at the bottom of table or list frames, separated from table bodies by `border-t border-border`. Single row, two clusters: **counts on left, all controls on right**.

```
1 to 10 of 1,284 orders                 Page size [10 ▾]   ‹ 1 2 3 4 5 … 129 ›
```

```tsx
<div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
  <p className="text-sm tabular-nums text-muted">1 to 10 of 1,284 orders</p>
  <div className="flex shrink-0 items-center gap-4">
    {/* "Page size" + select h-9 */}
    <nav aria-label="Pagination" className="flex items-center gap-1">{/* ‹ pages › */}</nav>
  </div>
</div>
```

```ts
// Page number button: square h-9, always includes border to avoid layout shift on page change
"inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm font-medium tabular-nums outline-hidden"
isCurrent && "border-transparent bg-secondary text-foreground"   // + aria-current="page"
!isCurrent && "border-transparent text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
// Arrow buttons ‹ ›: IconButton h-9 w-9, with aria-label "Previous page" / "Next page"
```

- **Never wraps, never shifts position.** Navigation remains in the right cluster aligned with count, regardless of page count. When crowded, **reduce page numbers first**: drop `2 3 4 5` leaving `‹ 1 … 12 … 129 ›`. Below `sm`, collapse to `‹ 12 / 129 ›`. Never drop navigation to a second line.
- **Below `sm`, counts show total only**: "32 customers", with "1 to 10 of" wrapped in `<span class="hidden sm:inline">`. Nav `‹ 1 / 4 ›` conveys position (`I16` satisfied: total on left, position on right). Leaving full text squeezes counts into ~168px next to nav at 375px, dropping words onto a second line and doubling footer height.
- **Current page button matches active `boxed` tab**: `--secondary` background, transparent border. **Do not use white background + border**: next to select `10 ▾` it looks like a text input, making users believe they can type page numbers.
- **"Page size" select sits in the right cluster, next to nav**, not immediately after count text. Count strings lengthen across pages ("1 to 10" then "1,271 to 1,280"); placing the select after text shifts its position on every navigation.
- **Window always displays 7 slots** (including `…`) when total pages > 7. Near ends, fill with adjacent numbers to maintain 7 slots:

  | Active | Display |
  | --- | --- |
  | Page 1 | `1 2 3 4 5 … 129` |
  | Page 12 | `1 … 11 12 13 … 129` |
  | Page 129 | `1 … 125 126 127 128 129` |

  Fixed slot counts guarantee fixed nav width, keeping selects stationary. `…` is non-interactive `text-muted` text.
- **Slot count sizes per container width for the whole table**, not per individual page. Desktop with sufficient space uses 7. Only when measurements indicate overflow, drop the **entire set** to 5 (`1 2 3 … 129`, `1 … 12 … 129`, `1 … 127 128 129`), before collapsing to `‹ 12 / 129 ›`. Showing 5 slots when space permits is incorrect.
- **Boundary arrows on first/last pages are `disabled`**, reserving space rather than hiding, preserving nav width.
- **Single page: hide nav.** Show count only ("7 members"). Retain "Page size" only if total exceeds the smallest page size option; otherwise hide it. Two disabled arrows and a lone `1` button add unnecessary noise.
- **Zero rows: hide entire footer.** The table's empty state communicates everything; do not render "0 customers" alongside dead controls.
- Numeric formatting: commas for thousands (`1,284`) and `tabular-nums`. Count format follows `I16`: "51 to 75 of 312 orders".

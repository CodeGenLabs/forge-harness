# Charts and metrics

Charts are where the single accent color rule is most frequently broken. Four metric tiles in four colors, green and red bars, a pie chart with seven slices in seven shades. It looks like a lot of information, but actually means no one decided what matters.

---

## Color

**One data series is one color.** Eight bars of the same metric all use `--chart-fill` (the light version is `--primary`, dark version drops to 70%, see "Dark mode" below). Bar height already conveys the difference; color doesn't need to repeat it.

**Two to four series distinguish by shade/lightness, not by hue** (when the project doesn't have a chart color scale). Changing hue forces the reader to learn a color legend they didn't ask for. One scale for the entire app, shared between grouped bar charts and donut segments (`N5`):

| Number of series / segments | Tier |
| --- | --- |
| 2 | `bg-chart-fill` · `bg-chart-fill/45` |
| 3 | `bg-chart-fill` · `bg-chart-fill/45` · `bg-chart-fill/15` |
| 4 | `bg-chart-fill` · `bg-chart-fill/65` · `bg-chart-fill/35` · `bg-chart-fill/15` |

Do not use `--muted` as a tier: it is close to `primary/60`, making two series look identical. Tiers `/15` and `/35` are below 3:1 on a white background, so **every bar and every segment must have an accompanying number** (a number atop the bar, a number in the donut legend); light color is never the sole carrier of value (`N4`). Legend dots use the exact same class as the bar.

**Categorical data with 5 or more groups uses one hue per group.** Industry, channel, country, customer type: with five shades of one color, human eyes can no longer distinguish tiers 4 and 5, and legend dots no longer clearly point to the right bar. Common analytics apps color each group with a distinct hue here (segmented bars, donuts, stacked bars). How to do it:

- **When the project already has a chart color palette** (shadcn's `--chart-1`…`--chart-5`, or a custom palette), use that exact palette in order. If the project has its own color language (`P4`), follow the project even with fewer than 5 groups.
- **When none exists**, use the default palette, ordered from largest to smallest group: `blue-500` · `sky-400` · `violet-500` · `fuchsia-400` · `teal-500` · `indigo-300`. Avoid hues that collide with the status palette (`red`, `rose`, `amber`, `emerald`) when status badges share the screen, so a group isn't misread as "error" or "done".
- **Maximum 6 hues**; the 7th group onwards is grouped into "Other" in `slate-300`. Seven or eight hues turn into a rainbow nobody remembers.
- **One group keeps a fixed color across the entire app** (like `M8`): "Media" in purple on a segmented bar stays purple in a donut and in table dots.
- **Color dots in tables use the exact bar color**, and each group always includes both numeric count and percentage in text: color only connects table to chart, it does not carry value alone (`N4`).

**Color may only change hue when it carries status meaning** (aside from categorical data with 5+ groups above), and must strictly match the app's status palette: red is broken or failed, amber is overdue or needs attention, emerald is done. An "overdue" bar colored amber is permitted (`M7`, `list-row.md`). A "March" bar colored red is not.

**In metric tiles, keep the numbers in the primary foreground color.** Do not color "In Progress" blue, "Overdue" red, "Completed" green. Four colors in a single row is a telltale sign that nobody picked what is most worth looking at. If a tile needs emphasis, emphasize it through position or secondary text, not through color.

**Dark mode** (`M32`). **Data fills use `--chart-fill`, not raw `--primary`.** In dark mode, the accent color is near white; a 100% bar becomes the most glaring block on screen, heavier even than the page title (settled at 70%; do not use blue-tinted gray: too faint, blending with in-progress period bars). The `.dark` block in `tokens.css` drops this token to 70%, and scales `/45`, `/15` scale proportionally, preserving exact ratios. Thin bars (progress bars, `h-2`) still use `bg-primary`: small surface area, no glare. Grid lines `stroke-border` and labels `text-muted` flip automatically with the theme. Explicit declarations needed:

- **Categorical scales** written with hue classes must include a dark mode variant, one step lighter: `blue-500 dark:blue-400` · `sky-400` kept · `violet-500 dark:violet-400` · `fuchsia-400` kept · `teal-500 dark:teal-400` · `indigo-300` kept. The "Other" group `slate-300` becomes **`dark:slate-600`**: left untouched, light gray becomes the brightest block in a dark chart.
- **Libraries rendering via color codes** (Recharts `fill="#…"`, Chart.js) should receive `var(--…)` or read tokens at render time; never hardcode hex: hardcoded hex does not switch with themes. shadcn chart: `ChartConfig` accepts `theme: { light, dark }`, or `--chart-1…5` provides `.dark` variants.

---

## Strip away the excess

- **No grid, no Y-axis** in charts within dashboard cards, panels, or metric tiles. Print numbers directly atop bars or at the end of lines. People want values, not to scan eyes horizontally across to an axis.
  **Exception: hero charts on report pages** (the chart people visit the page specifically to read, full-width, ~15+ data points). There, people compare one date against another ("Sept 13 ~70M, Sept 22 ~40M") without wanting to hover 30 times. Add **3–4 subtle horizontal grid lines** (`stroke-border`, 1px, solid, not dashed) at round numbers (0, 20M, 40M, 60M), with tick labels `text-xs text-muted tabular-nums` along the left edge, no vertical axis line, no vertical grid. The most popular dashboard component libraries enable horizontal grid lines and omit Y-axis labels; a major dashboard library and a large commerce platform's analytics pages enable both. All three sources include horizontal grid lines, making them the consensus; tick labels appear in two of three, preserved because report pages exist to read numbers. Recharts: `<CartesianGrid vertical={false} stroke="var(--border)" />` + `<YAxis axisLine={false} tickLine={false} tickCount={4} width={48} tick={{ fill: "var(--muted)", fontSize: 12 }} />`.
- **No detached legends** when labels can sit directly beside the data.
- **No pie charts for more than four slices.** Beyond four, eyes cannot compare; switch to horizontal bars sorted in descending order.
- **No page entrance animations.** Bars don't grow, lines don't draw themselves, numbers don't tick upwards. See rule `F23` in `../rules-form.md`.
- **No drop shadows, gradients, or 3D effects** on bars and areas.

---

## Render with libraries, the skill defines the visual shape

Line, bar, and donut charts in real projects are almost always rendered using libraries: they handle axis scale, responsiveness, mouse hover, and keyboard navigation. Therefore (`N10`, dedicated library table in `SKILL.md`):

1. **If the project already has** a chart library (Recharts, shadcn chart, Chart.js, ECharts, Tremor…), **use that exact library**, configured per the table below. Grep `package.json` before writing a single line.
2. **If none exists, do not install one.** Build as usual following the patterns in "Ready-to-use formulas". The skill's visual style eliminates almost everything libraries provide (grids, Y-axes, tooltips, legends, animations), so a few static charts on a dashboard page usually **need no library at all**: `<svg>` and `div` are sufficient and lightest.
3. **Only propose a library when there is a concrete need where custom building is costly**, and state that need clearly at delivery: multiple chart types across the app, datasets with thousands of points, zoom/pan or region selection, real-time streaming updates, or irregular time-series intervals. Without such needs, do not propose one.
4. **Select a library by criteria, not familiar names**: bundle size (check actual size on bundlephobia when proposing, do not recall from memory), capability to render the required chart types, compatibility with CSS tokens, active maintenance, and SSR support if applicable. Ecosystem fit is also a criterion: in a shadcn project, shadcn chart matches the rest of the codebase, even though underlying Recharts is not lightweight. State proposals in a single line with rationale: "If zooming into 10,000 data points is needed later, consider X because Y".

Progress bars and horizontal bars in lists should always be built with div elements, even when a chart library is present: they are merely bars with a `width`. **Sparklines** also need no library: an `<svg>` with a `<polyline>`, no axes, no hover interactions; never propose a library just for sparklines. If the project already has Recharts, plain `<LineChart>` is acceptable, but four `ResponsiveContainer` instances in a single row is heavier than necessary.

**The skill only prescribes the visual shape.** Every library turns on features the skill bans by default; disable them manually. For example, with Recharts / shadcn chart (as the most common example, not an endorsement):

| Visual rule | Configuration |
| --- | --- |
| No grid | Remove `<CartesianGrid>` (hero chart on report pages: horizontal grid only, see "Strip away the excess") |
| No Y-axis | `<YAxis hide domain={[0, "auto"]} />` (baseline always 0; report pages: show tick labels) |
| X-axis labels only, thin bottom baseline | `<XAxis tickLine={false} axisLine={{ stroke: "var(--border)" }} tick={{ fill: "var(--muted)", fontSize: 12 }} />` |
| No entrance animations (`F23`) | `isAnimationActive={false}` on all `<Line>`, `<Bar>`, `<Pie>` |
| Numbers atop bars | `<LabelList position="top" />`, same `--muted` color, `text-xs` |
| Line: dot and number only at endpoint (or active hover point) | `dot={false}`, `activeDot` disabled, draw dot + label manually via `<ReferenceDot>` or `label` matching the selected point index |
| No floating tooltip for line charts | Remove `<Tooltip>`, track active point via `onMouseMove` to reposition the dot and number |
| Rounded bar tops | `radius={[8, 8, 0, 0]}` (narrow grouped bars: `[6, 6, 0, 0]`) |
| Colors from tokens, correct lightness scale | `fill="var(--chart-fill)"` + `fillOpacity` per table in Color section, avoiding default library palettes |
| Donut | `<Pie innerRadius="72%" startAngle={90} endAngle={-270} paddingAngle={1} stroke="var(--surface)">`, data sorted descending |
| No data yet (distinct from 0) | Value `null` + `connectNulls={false}` to break the line |
| Legend | Remove library `<Legend>`, build HTML legend per spec (dots share bar class) |

For other libraries, look up the equivalent configuration options; the final visual presentation must match the table above. The HTML snippets below define the **target visual shape**: with a library, use them as reference; without a library, build directly to these patterns.

## Bars or lines

| Data | Type | Rationale |
| --- | --- | --- |
| **Discrete counts per period**, up to ~12 periods: completed tasks per week, orders per day, new customers per month | **Bar**, number atop each bar | Each period is a distinct number users want to read; bars show all numbers without hovering |
| Point-in-time levels or ratios: active users, churn rate, account balance, cumulative total. Monthly revenue when reading trend is primary | Line | Values flow continuously; the shape of ups and downs is what matters |
| Discrete counts per period exceeding ~12 periods (30 days, 52 weeks) | Line | Bars become too thin, numbers atop bars collide |

Common project management tools plot "completed tasks per week" with bars. Plotting 8 weeks with a line only lets users read the final week's number.

## Ready-to-use formulas

**Plot areas stretch to fit card height, not fixed.** Chart cards are frequently stretched taller by grid layouts. Use `flex-1 min-h-[14rem]` for the plot area so bars expand to fill; taller bars make differences between values easier to read. Do not fix `h-56` and push down with `mt-auto`.

If stretched fully and still leaving excess space, **shorten the card** (remove `row-span`) rather than inventing filler content. Suggest at delivery what might fill that space later, see rule `S5` in `../../SKILL.md`.

**Bar chart**, target visual shape (with a library, build using the library per the section above):

```html
<div class="flex min-h-[14rem] flex-1 items-end gap-2 sm:gap-3">
  <div class="flex h-full flex-1 flex-col justify-end gap-2">
    <p class="text-center text-xs font-medium text-muted">16</p>
    <!-- mx-auto w-full max-w-8: bar max 32px, centered in its slot -->
    <div class="mx-auto w-full max-w-8 rounded-t-md bg-chart-fill" style="height: 80%"></div>
  </div>
  <!-- other bars, same bg-chart-fill; current in-progress period (last bar) bg-chart-fill/35 -->
</div>

<div class="mt-3 flex gap-2 border-t border-border pt-3 sm:gap-3">
  <p class="flex-1 text-center text-xs text-muted">Jan</p>
  <!-- axis labels, matching gap with bar cluster for exact alignment -->
</div>
```

Axis labels must share the **exact same `gap` as the bar cluster**; being off by one step skews the entire row of labels away from the bars.

- **Bars max 32px** (`max-w-8`), with remaining slot space left empty. Allowing `flex-1` to expand unchecked turns 8 bars in a card into 56px black blocks; the entire chart becomes the heaviest dark mass on screen, overpowering the page title and metric rows (at 32px the mass disappears while numbers atop bars remain readable). On narrow screens, bars naturally shrink with their slots.
- **The in-progress period (this week, this month) is a muted bar `bg-chart-fill/35`, axis label reads "This week"**, with the number atop still present. Rendering an incomplete period in the same color as completed ones makes low bars look like "this week plummeted" and high bars look like "already exceeded" when two days remain. The metric row already compares against "same point last week"; the chart must also convey that this week is unfinished. Popular analytics tools always distinguish in-progress periods (muted color or dashed outline).
- **A single period is not yet a chart**, just like line charts: a single bar standing in an empty frame is a black rectangle compared to nothing. Replace the plot area with a text block, maintaining height: a `text-2xl font-semibold tabular-nums` number + "Completed this week. Trends appear starting next week".

**Grouped bar charts** (two or three periods side by side):

- Bars within a group use `gap-1.5`; groups are separated by noticeably wider spacing (`gap-6` or more) so eyes group correctly.
- **Time moves from left to right**, like a line chart axis: older periods on the left, **newest period on the right and darkest**. Legend follows the same order. Placing 2026 to the left of 2024 makes a growing group appear declining.
- Maximum three series. Beyond that, split into separate charts or switch to a table.
- **Zero is distinct from missing data**, just like line charts: zero has no bar, with `0` printed at the baseline; missing data (channel not yet opened that year) shows `—` at the baseline, not `0`.
- Long group names `truncate` with `title`, single line. When narrow screens lack space, wrap the bar cluster in a horizontal scroll container **within the frame** (`overflow-x-auto`), without scrolling the whole page (`R1`).
- Units are stated once in the card description or title ("million VND" or "$k"), not repeated on every bar.

**Donut** (share of total, maximum four slices):

- Ring on the left, legend on the right (narrow screens: ring on top, legend below). Ring center displays total `text-2xl font-semibold tabular-nums` + label `text-sm text-muted`.
- **Sorted descending**, starting from 12 o'clock clockwise, largest slice darkest per the scale above. Thin white gap between slices.
- Legend is a divided list: dot · name (`min-w-0 flex-1 truncate` + `title`) · count (`font-medium tabular-nums`) · percentage (`text-muted tabular-nums`, fixed width column). Count and percentage never wrap.
- Slices below 1% still render a minimal sliver to remain visible. **Consistent decimal places within a single chart**: if any slice is below 1%, use one decimal place across the entire table, otherwise integers. Rounded totals must sum to 100.
- **Total of 0**: only the track `bg-foreground/5` remains, ring center shows `0`, percentage column left blank (not `0%`, which resembles `0/0`).
- Beyond four slices, use the progress bar list below, sorted descending.

**Progress bars in lists:**

```html
<li class="py-3 first:pt-0">
  <div class="flex items-baseline justify-between gap-3">
    <p class="min-w-0 flex-1 truncate text-sm font-medium text-foreground">UI Design</p>
    <p class="shrink-0 text-sm font-medium text-foreground">92%</p>
  </div>
  <!-- Track uses overlay bg-foreground/5, not bg-background: in dark mode bg-background is darker than card, turning track into a heavy dark slash (M21). Light mode renders both identically. -->
  <div class="mt-2 h-2 rounded-full bg-foreground/5">
    <div class="h-2 rounded-full bg-primary" style="width: 92%"></div>
  </div>
</li>
```

Track background uses `--background`, not `--border`. Bar `h-2`, rounded `full`. Percentage printed at start/end of row, never inside the bar.

**Bars in lists always use `bg-primary`**, even when an item has an issue needing attention (a project with overdue tasks). The bar communicates exactly one thing: completion progress; issues are stated in text on the secondary line, and **only that snippet** uses `text-amber-700`, with the rest gray: `112 / 120 tasks · <span class="text-amber-700">2 overdue</span>`, matching the deadline pattern in `list-row.md`. Coloring the entire bar amber makes a 93% project look like "progress has failed", and several orange bars become the heaviest visual element on screen.
Status-based colors (below) apply only to **standalone bars**, where color reflects the exact metric the bar measures (storage nearly full). 100% completed items use emerald just like standalone bars.

**Standalone progress bar** (storage capacity, checklist): top row has label left + number right, bar in the middle, secondary line `text-xs text-muted` below.

- `role="progressbar"` + `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` matching the label. Screen readers cannot see bar length.
- **Status-based color matching the app status palette**: in progress `bg-primary`; **complete** `bg-emerald-600` (checklist full); needs attention `bg-amber-500`; broken or full `bg-red-500`. Color-shift thresholds (e.g. storage from 80%) are user-configurable via a `tone` prop. The secondary line shifts color accordingly (`amber-700`, `red-600`) and explains in text, because bar color alone is insufficient.
- **Completed bar remaining solid black** looks identical to "running at 99%". Standalone bars (storage, checklist) turn emerald when complete.
- **File uploads** (single or multiple files) do not use this template: follow `file-upload.md`. **The two heights are intentional, do not merge them**: the bar here (`h-2`) is the **primary metric** of the block, read for comparison; the upload bar (`h-1`) is merely **transient state** for a row whose primary content is the file name, disappearing upon completion. "File upload progress" demos within progress bar sets should also follow the file upload pattern. Thin bar `h-1`, only uploading files show a bar; completed and failed files remove the bar and percentage, leaving a single line of text; Retry is a text button after the error reason.
- **Nothing to count** (checklist with 0 tasks): do not write `0/0`, leave number slot empty, empty bar, secondary line "No tasks yet". `0/0` reads like a division by zero error.
- **Consistent numeric formatting across the app**: `12.4 / 20 GB` and `4 / 6 tasks`, with spaces on both sides of the slash. Inconsistent spacing looks unpolished. Numbers use `tabular-nums`.

⚠️ **Deprecated rule, do not revive:** failed upload keeping a red bar stopped midway with percentage, outlined "Retry" button at row end, `w-20` action column; completed upload keeping a solid green bar + `100%`. In a multi-file list this creates a messy striped stack of black, red, and green, and failed files lose the ✕ button to dismiss. The updated pattern lives in `file-upload.md`.

**Line chart** (monthly, daily trends):

- With a library, configure per the table in "Render with libraries"; without one, an `<svg>` with `<polyline>` is sufficient; only propose a library for the needs listed in item 3 above.
- A single `stroke-2` line in `--primary`, no area fill underneath, no smoothing that distorts values (`monotone` is acceptable, `basis`/`cardinal` overshooting real points is not).
- **Only one dot and one number, at the endpoint** (`size-2.5`, number `text-xs font-semibold tabular-nums` beside the dot). Hovering or arrow navigation moves the dot and number to that period, **without opening an additional floating tooltip**: same element, changing position (`N1`, `N3`). Build a static example for the hover state (`N2`).
- **When axis labels are sparse, numbers must include the date/period**: "Sept 13 · 70.9M" (or "13/09 · 70,9 `tr` `đ`"), not just the number alone. When 30 days only show Sept 2, Sept 7, Sept 12 on the axis, hovering on a point yields an ambiguous number without context. All major chart libraries show dates at the top of tooltips; the skill avoids floating tooltips but does not omit the date. Date is `text-muted font-normal`, number retains `font-semibold`. **Incomplete periods must always state the period name**: "Today · 44.4M", "This week · 330.1M", "Sept · 1.41B": an incomplete day's figure standing alone at the line end reads as "today plummeted". When axes label every tick (12 months), the number can stand alone with the period directly underneath.
- **Position labels away from the line.** By default the number sits above the dot, but when the point is lower than adjacent points, the connecting segment rises right there and text collides with the line (a `bg-surface` background behind text slices the line in half, looking broken). Choose based on two adjacent points: both lower or equal (peak) -> **above**; both higher (trough) -> **below** (`top: calc(y + 0.625rem)`); one higher and one lower (slope) -> **above, shifted toward the lower adjacent point** (right-align text to dot when lower point is on the left, left-align when on the right). First and last points only have one adjacent point: adjacent lower -> above, adjacent higher -> below. Two points differing by less than 2% of plot height are treated as equal: otherwise a point only slightly lower is classified as a trough, dropping the number below onto a nearly horizontal segment.
  **If that position doesn't fit, try alternatives in order:** direction per adjacent points → opposite side → **beside the dot horizontally** (vertically centered with dot, 8px away, favoring the side without an adjacent point or with the lower adjacent point). Pick the first position that is both **fully within the plot area** (above baseline 0, below top edge) and **does not touch the line**; calculated against all segments passing under the measured text bounds, not just segments connecting to the dot, without guessing by values: at 375px, 30 points occupy only ~260px, while ~100px text covers a dozen segments. If all four positions collide (thick line, narrow screen), keep the first alignment, push text entirely above the line segment beneath it (6px gap), then test entirely below; if still colliding, choose the inside-plot position touching the fewest segments. **Below baseline 0 belongs to axis labels**: numbers falling there read as a second axis label. Example: "Today · 6.8M" near bottom, adjacent point higher: placing below clips out of plot area into axis labels; placing horizontally to the left of the dot fits, because the segment drops almost vertically.
  Automated probes check both errors ("Value label overlaps chart line", "Value label overflows plot area").
- **Tab focus into chart: reveals the active point's value**, just like hovering; no ring around the dot (`I13`).
- **Baseline is 0**, baseline divider `border-border`, month labels `text-xs text-muted` below. Months with zero touch the baseline.
- **Missing data is distinct from zero.** Months with no data yet (future, unrecorded) **break the line**, rather than dropping to baseline: dropping to 0 falsely claims "zero sales that month".
- **Narrow viewports**: 12 month labels at 375px collide. Below `sm`, show **every other label, counting backwards from the final label** (last, last − 2, last − 4…); the line still contains all 12 points. Do not count forward ("odd labels + last label"): an even count places the final label directly against the last odd label, colliding at 375px. Bar charts follow the same rule.
- **A single point is not yet a chart.** A floating dot in an empty frame looks like a rendering bug. Replace the plot area with a text block, **preserving height**: a `text-2xl font-semibold tabular-nums` number + `text-sm text-muted` line "September figure. Trends appear starting next month" (`N6`). This rule applies when data **lacks** a second point (first month of sales). Report pages where users pick a single day do not apply: break down intervals by hour (see "Report pages" in `../layouts/app.md`). Replacing a chart with a number duplicates the "Revenue" metric tile directly above (`N3`).
- **Empty state**: preserve height, explaining why and when data appears: "No revenue yet. Metrics will appear after the first order" (`components/empty-state.md`). Remove the baseline divider as well: an isolated unlabeled baseline looks like an errant divider.
- `role="img"` + `aria-label` text summary ("12-month revenue, increasing from 0.9B to 1.46B"); focusable points each have `aria-label` with month + value.

**Metric tile row:** a single block divided by `divide-x`, not separate cards. See `layouts/app.md`.

---

## Metric tiles on narrow screens

This is the most common breaking point, and only surfaces when shrinking the window to 375px.

- **Mobile is 2×2**: `grid-cols-2 lg:grid-cols-4`, like most mobile apps. A single column stacks four short metric tiles (4, 140, 5, 23) to 417px tall, consuming almost the entire above-the-fold screen at 375px, pushing charts and tasks out of sight; 2×2 takes only 209px (settled). At 375px, each tile leaves **138px for numeric text** (`text-xl`, tile `p-4`): fits `1,284,500` (98px), `184.5M` / `184,5` `tr` `đ` (91px), `1.28B` / `1,28` `tỷ` `đ` (80px); does not fit `1,284,500,000` with currency symbol (161px).
  - **When numbers exceed 138px** (full currency amounts into billions): suggest compact notation per "Numbers exceeding 9 digits" below. If the user wants full numbers, fall back to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` to prevent wrapping or overflow.
  - **Odd tile counts** (3, 5): 2 columns leaves an orphaned tile on the bottom row (`R3`), so go directly to `grid-cols-1 sm:grid-cols-3`. 6 tiles works fine with 2 columns.
  - Deprecated rule: "Mobile is single column" for all metric rows out of fear of long numbers; most overview metrics are short counts.
  - Tiles in slide-over panels: see section below.
- **Inside slide-over panels or narrow columns: fixed 2×2 grid, single shell, numbers smaller than title.** A 448px panel is not an overview dashboard: metrics here are secondary attributes of a record, not the primary focus. Four separate `rounded-2xl p-5` cards with `text-3xl` numbers are the heaviest elements in the panel, overpowering the customer name (major CRMs keep customer metrics at normal text sizes). Build a single shell with 1px gap dividers, numbers `text-lg font-semibold`, never larger than the panel header title. Comparison lines retain only icon + number (period stated once, see "Comparison row"), fitting 2 columns at 375px without stacking into four tall vertical tiles.

```html
<p class="mb-2 text-xs text-muted">Past 12 months, vs. previous 12 months</p>
<div class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
  <div class="min-w-0 bg-surface p-4">
    <p class="text-xs font-medium text-muted">Revenue</p>
    <p class="mt-1 text-lg font-semibold tabular-nums text-foreground">184.5<span class="ml-1 text-muted">M</span></p>
    <p class="mt-0.5 flex items-center gap-1 text-xs font-medium tabular-nums text-emerald-700">
      <i data-lucide="trending-up" class="size-3.5"></i>12.4%
    </p>
  </div>
  <!-- 3 remaining tiles share same template -->
</div>
```
- **Every tile must have `min-w-0`.** Grid items by default refuse to shrink smaller than their content; omitting this rule forces the entire page into horizontal overflow.
- **Numbers across tiles in the same row always align horizontally, even when labels wrap.** Each tile uses `grid row-span-2 grid-rows-subgrid content-start` (three tiers use `row-span-3`); the outer container does not need row declarations: label rows size to the tallest label, and all numbers sit directly below that line. Without subgrid, a two-line label pushes its tile's number down by 16px relative to its peers.
- **Labels with a period break after the `·` symbol, never in the middle of the period**: `Delivered orders&nbsp;· 12&nbsp;months` yields "Delivered orders ·" / "12 months". With regular spaces, the browser wraps "· 12" / "months"; placing `&nbsp;` after the symbol causes `·` to fall to the start of the line.
- **Numeric font size drops one step on mobile**: `text-xl sm:text-2xl`.
- **Use `tabular-nums`** for all numbers. Monospaced numerals keep tiles aligned across columns and prevent jitter when values change.

```html
<!-- Separated by 1px gap revealing --border background (like grid in panel): divide-x cannot draw horizontal lines between rows in 2×2 -->
<div class="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
  <div class="min-w-0 bg-surface p-4 sm:p-5">
    <p class="text-xs font-medium text-muted">In Progress</p>
    <p class="mt-1 text-xl font-semibold tracking-tight tabular-nums text-foreground sm:text-2xl">1,284,500</p>
    <p class="mt-1 text-xs text-muted">Across 4 projects</p>
  </div>
</div>
```

### Comparison row and currency units

```html
<div class="min-w-0 p-5">
  <p class="text-xs font-medium text-muted">Revenue this month</p>
  <p class="mt-1 text-xl font-semibold sm:text-2xl tracking-tight tabular-nums text-foreground">
    1,284,500,000<span class="ml-1 font-semibold text-muted">đ</span>
  </p>
  <p class="mt-1 flex items-center gap-1 text-xs text-muted">
    <i data-lucide="trending-up" class="size-3.5 text-emerald-700"></i>
    <span class="font-medium tabular-nums text-emerald-700">12.4%</span> vs. last month
  </p>
</div>
```

- **The two currency rules below apply to VND currency in Vietnamese copy.** For other currencies or English copy, format according to locale (`T28`).
- **Do not format currency with `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`**: it automatically produces `₫`. Format numbers using `Intl.NumberFormat('vi-VN')` and manually append `đ`. Grep `currency: 'VND'` before looking elsewhere.
- **Currency unit uses lowercase `đ`, not symbol `₫`.** The symbol `₫` has a built-in underline glyph stroke that CSS cannot remove: at large sizes it looks like a link, and scaled down it turns into a tiny strikethrough blur. `đ` matches **the font size of the number**, `font-semibold`, only switching to `text-muted` with `ml-1` spacing: muted color is sufficient to separate unit from value. If the project already conventionally uses `₫`, follow the project.
- **Numbers exceeding 9 digits in narrow tiles**: suggest (user decides) compact forms like `1.28B` (or `1,28` `tỷ` `đ`), keeping the full number in `title`. Metric tiles exist to read trends, not to reconcile pennies.
- **Comparison row**: `trending-up` / `trending-down` icon `size-3.5` + colored `font-medium` percentage + remaining text in `text-muted`. Only the icon and number carry color, not the whole sentence.
- **Color by good/bad, not by up/down.** Revenue rising is green, but cost or cancellations rising is red. Expose a prop like `tone="positive" | "negative" | "neutral"` for the user/consumer to decide, do not infer color from numeric sign. Green `emerald-700`, red `red-700`: `text-xs` requires 4.5:1 contrast, while `emerald-600` and `red-500` fail.
- **Unchanged**: `minus` icon, `text-muted` text, no color. **A tile lacking a previous period** (while others have one): a short `text-muted` sentence ("No prior period"). Both cases **stay strictly on one line**, so tiles in the row maintain uniform height. The threshold for "unchanged" is user-determined.
- **Comparison period is stated ONCE for the whole row, not repeated in every tile.** Four tiles all ending in "vs. 2025" says one thing four times (`N3`), and that very suffix causes narrow tiles to wrap. State the period once in the section title or a `text-xs text-muted` line above the tile row ("Past 12 months, vs. previous 12 months"), so each tile only contains icon + number ("↗ 12.4%", "↗ 0.6 pts"). Tile labels also drop the period: "Revenue", not "12-month revenue" when adjacent tile is plain "Orders", which misleads readers into thinking they cover different periods. **The comparison period must match the measured period type**: measuring past 12 months compares to previous 12 months, not "year 2025".
- **When the whole row lacks a previous period, say so once**, at the exact spot where period is stated ("New customer, no prior period to compare"), and tiles omit the comparison row entirely. Four tiles each repeating "No prior period" is the same redundancy bug. Exception: when the same screen displays metrics counting the same thing across different periods (lifetime "Orders 42" tab), that specific tile includes the period in its label: "Delivered orders · 12 months" (`layouts/app.md`, "Record detail page").
- **When the whole row is empty (customer has zero orders), do not build a grid of zeros.** Four tiles with "$0", "0 orders", "—", "—" is four frames just to say "nothing here yet". Replace the entire row with a compact card sharing border and **the same `bg-surface` background** as cards (a transparent box on page background leaves an awkward floating gray sentence with an almost invisible `--border`), with a `text-sm text-muted` sentence explaining why and when data appears: "No orders yet. Metrics appear after the first order" (`components/empty-state.md`, `N6`). If an order creation button exists elsewhere on screen, do not duplicate it here. **On detail pages with an Orders tab, omit the metric row entirely**, without even a compact card: the empty tab already explains (`layouts/app.md`, "Record detail page").
- **`—` only when mathematically undefined** (denominator is 0: zero orders means return rate cannot be calculated). Having 3 orders and 0 returns is `0%`, not `—`: `—` there misleads as "missing data" when the figure is clear.
- **Tiles without a value use `—` in `text-muted font-normal`**, the same symbol as empty table cells (`T18`). Rendering `—` as `text-foreground font-semibold` at `text-2xl` makes a thick black bar that reads as a number rather than "empty".
- **When label already states the unit, number does not repeat it.** Label "Orders" -> number `24`, not `24 orders`; label "Customers" -> `1,204`, not `1,204 customers`. Text units are appended only when the label does not indicate them (label "Orders" could say `24 orders`, but is usually redundant).
- **Compact numbers keep suffix together with unit in a single muted span**: `184.5` then `M` (or `184,5` then `tr` `đ`) in `text-muted`, not black abbreviation and gray unit (which reads as "184.5 `tr`" is number and `đ` is unit, when `tr` is also a unit). Abbreviation words: `k`, `M`, `B` (or `nghìn`, `tr`, `tỷ`).
- **Comparison row is always single line, `text-xs`**, even with numbers. Never let icon and percentage sit on one line with "vs. last month" dropping below: it breaks into two disjointed ideas, adding a line of height. When narrow tiles lack room, shorten the suffix ("vs. Aug", "vs. prior period"), without wrapping. The same applies to the no-prior-period case: use "No prior period" rather than long phrases that wrap.
- **`%` attaches directly to the number without space**: `2.8%`, `12.4%`, uniform across main number and comparison line (`N5`). Unlike text units which take `ml-1`, `%` does not. When the primary number includes `%`, style `%` with `text-muted` like currency symbols.
- **Small integer counts compare via absolute difference, not percentage.** When the prior period is under 20 (overdue tasks, active projects), display "↗ 2", not "↗ 66.7%": going from 3 to 5 overdue tasks described as a 66.7% increase causes false panic. The tile label already states the unit, so use a raw number, not "2 tasks". Individual tiles in a row may differ in style (a tile with 140 open tasks still shows %).
- **Metrics that are already percentages compare via percentage points, not percentage change.** A churn rate rising from 2.2% to 2.8% is displayed as "↗ 0.6 pts", not "↗ 27.3%": 27.3% looks like churn jumped 27 points. Calculation is user logic; the skill specifies the slot and "pts" label.

### Sparkline in metric tiles

```tsx
// Shared flag for the whole row: reserve space only if at least one tile can render
const rowHasSparkline = tiles.some((tile) => tile.points.length >= 2);

<div className="flex min-w-0 flex-col p-5">
  {/* label, value, comparison row */}
  {tile.points.length >= 2 ? (
    <svg aria-hidden="true" className="mt-auto h-10 w-full pt-4">{/* polyline + endpoint dot */}</svg>
  ) : rowHasSparkline ? (
    // Placeholder only to match adjacent tile height. 2x2 row on mobile still has adjacent tiles so keep;
    // only rows collapsing to single column on mobile (long numbers, odd tile count) add max-sm:hidden
    <div aria-hidden="true" className={cn("mt-auto h-10 pt-4", isSingleColumnOnMobile && "max-sm:hidden")} />
  ) : null}
</div>
```

Do not set fixed `min-h` on tiles: tile height should derive from content, so when the whole row lacks sparklines, tiles naturally shorten (fixed `min-h` or standalone placeholders leave empty space on desktop).

- A single `stroke-[1.5]` `--primary` line, height `h-10` to `h-12`, full tile width, pinned to tile bottom (`mt-auto`). Dot `size-1.5` at endpoint. No axes, no labels, no hover: tiles exist for glancing at shapes.
- **Does not use 0 baseline**, unlike line charts: stretched across the series min–max to emphasize shape. Line charts provide numbers to read; sparklines only convey shape.
- **Line is always `--primary`**, even when the comparison row is red. Good/bad is already communicated by the comparison line; coloring the line red doubles up signals for one meaning (`N3`).
- All tiles in a row share point count, time span, and sparkline height.
- **Fewer than two points** (first month): do not draw, no stray dot, no fake flat line. **Reserve placeholder space only when adjacent tiles require alignment** (`N1`):
  - Sibling tile in row **has** a sparkline: missing tile reserves space matching exact sparkline height, keeping tiles equal height.
  - **Row collapses to single column on mobile** (unabbreviated numbers, odd tile count; default is 2×2, see "Metric tiles on narrow screens"): tiles stack vertically with no adjacent sibling; a placeholder would just be a large empty gap below each tile. Placeholder uses `max-sm:hidden`. 2×2 rows retain placeholders on mobile since adjacent tiles still need matching height.
  - **Entire row lacks** sparklines: omit placeholder entirely across all screen sizes; tile height ends at comparison row.
- `aria-hidden="true"` on `<svg>`: trend is already conveyed in text by comparison row.

For multi-period bar charts on narrow screens, wrap the entire cluster in a dedicated horizontal scroll container using `overflow-x-auto` with a minimum width for the cluster, rather than letting it force the whole page to scroll. See rule `R1` in `../responsive.md`.

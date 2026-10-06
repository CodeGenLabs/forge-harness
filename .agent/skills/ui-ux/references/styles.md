# Visual styles — rules P

The single source for: recognising which style the project uses, which rules that
style may override, and the traps specific to each style. The audit command lives in
`SKILL.md` question 2, tier 3. This file teaches how to **read** the result.

---

## Two tiers

**P1. The default is flat. If the project already has its own style, follow the project. Do not ask.**

Three cases, pick exactly one:

| Case | What to do |
| --- | --- |
| **The user names a style** ("make the pricing page glassmorphism") | Follow that style, **do not ask again** |
| **The audit finds the project uses a style other than flat** (`P4`) | **Follow the project's style**, build directly, report one line at delivery (template below) |
| **The project is flat or empty**, and the user names nothing | Flat (`P6`). Do not ask about style. Colourful (`P12`) only when the user asks for it in the request; the two rebuild modes: the Colourful row (`V1d`), not preselected. The wireframe no longer has a Colourful level |

Why follow the project and not flat: one flat screen in the middle of a glass app is
an outlier, and the user sees it immediately. Consistency beats the skill's style.

Template for the delivery line:

> The project uses **glass** (seen in 7 files: card, modal, sidebar), so this screen is
> glass to match. If you want flat, the skill's default, say so and I will switch.

Once the user has chosen, keep it for later screens in the same project.

**Whichever style is chosen, do not copy the project's mistakes.** Style and mistakes
are two different things. The project has a three-column pricing page, each column with
a button in a different colour (purple, white, blue), and the user chooses to follow the
project's style:

- **Follow:** purple gradient, large radius, dark background. That is style.
- **Do not follow:** three buttons in three colours, all equally heavy. That is the `I3` mistake. Only one button may be the primary button, whatever the style.

The test: *if you remove this, does the screen look **different**, or look **worse**?*
Different is style, follow it. Worse is a principle, it must not be dropped.

**P2. Which rules a style may override, and which it may not.**

| Kind | Rules | May a style chosen under `P1` override them |
| --- | --- | --- |
| **Flat style** | `M1` light grey background · `M2` 95/5 ratio · `M12` no gradient · `M13` separate with borders · `M15` shadows only for elevated layers · `M20` light by default · `M23` dark is navy · `M29` a lone card has no border · `F19` no glass · `F20` no glow · `F22` no animated shapes | **Yes**, exactly as the block for that style says below |
| **Principles** | All of `N` `S` `T` `I` `R` · `M3` one accent colour · `M4` status colours (narrow exception: `P12` recipe B overrides it only in the icon tile of stat cards, the per-type leading icon tile and chart series) · `M11` three text shades · `M19` nested radius · `M24`–`M28` tokens · `M30` two reds · layout `F1`–`F18`, `F21`, `F23`–`F25` · **`P3` contrast** | **Never** |

Every flat-style rule has a *"Flat style"* line right where it is written. If you see
that line and the chosen style is not flat, come back here.

**P3. Text contrast: hard numbers, in every style.**

| Thing | Minimum |
| --- | --- |
| Normal text | **4.5 : 1** against the background directly behind it |
| Large text (from 24px, or from 18.66px bold) | **3 : 1** |
| Meaningful icons; borders of **inputs, unchecked checkboxes and radios** | **3 : 1** against the adjacent background. A button with a text label does **not** need a 3:1 border (WCAG 1.4.11: the text already identifies the button) |

Default tokens:

| Token | Light background | Dark background | Passes |
| --- | --- | --- | --- |
| `--muted` (secondary text, placeholder) | 4.95 : 1 on card, 4.51 : 1 on page background | 6.1 : 1 | ✅ 4.5 |
| `--border-focus` | 16.8 : 1 | 3.6 : 1 | ✅ 3 |
| **Border of input, select, outline button, checkbox, radio** (`--border-strong`) | ~1.2 : 1 | ~1.5 : 1 | ❌ 3 |
| **Switch track when off** (`muted/40`) | ~1.6 : 1 | | ❌ 3 |

**`--muted` passes only on the three lightest backgrounds**: card `--surface`, `--surface-hover`, page
background `--background`. On darker greys it fails: `--secondary` 4.04, `--background-hover`
4.01, a `foreground/5` overlay on the page background 4.12, `foreground/8` on a hovered row 4.05.
Secondary text sitting on those backgrounds (the count in the selected tab, text in an inline-edit field on hover)
uses **`text-foreground/70`**: the overlay follows the text colour, so it darkens with the background, passing from 4.82 : 1
on every grey of the skill. Do not go lighter than `/70`: `/65` already fails on `--secondary` (4.17).
Secondary icons in `text-muted` can stay, icons only need 3 : 1.

⚠️ **Control borders do not pass 3 : 1, and that is a deliberate trade-off.** Passing needs a grey
border around `#8a8a91`; Rejected: the maintainers found it heavy and ugly.
`#f2f2f2` (1.1:1) is too faint, an unchecked radio is nearly invisible; `#e4e4e7` (1.27:1) makes
the sidebar rules heavy. Settled: `#eaeaea` (~1.2:1). Do not change it without asking. The skill
compensates with three other things so the user can recognise an input: a label always shown above
(`I26`), the placeholder, and border + ring on focus.

If the project **must fully meet WCAG AA** (government, healthcare, banking), add a
separate token for control borders (`--border-control: #8a8a91`, dark background `#5e6578`)
and switch the classes of inputs, selects, checkboxes and radios to it (outline buttons do not need it); raise the switch
track when off to `muted/75`. **Do not** change
`--border-strong` directly: the sidebar rules, tabs and badges that share that token would darken with it.

Flat rarely fails the text numbers, because dark text sits on solid white. Glass,
gradients and dark **fail first**. That is why this rule is written here, next to the
styles that make it fail.

**Measure at the worst spot**, not in the middle:

- On a gradient, measure at the **end closest to the text colour**.
- On glass, measure where what is behind is **least favourable**: for white text, measure over the lightest area of the image behind; for black text, over the darkest.
- Placeholders and secondary text count too. Secondary text `text-white/50` on a glass background is usually the first thing to fail.

---

## Recognition

**P4. Find the project's style yourself, to know whether to follow it. A style
only counts as "the project's" when it is present on the main surfaces.**

Run the tier 3 command in `SKILL.md` question 2, then read the numbers:

| Result | Conclusion |
| --- | --- |
| The signal appears in **3 or more component files**, on cards, modals, header, sidebar | It is the project's style → **follow**, report using the `P1` template |
| Only 1–2 files | A local exception: a banner, a promo page. It does **not** count as the project's style, build flat |
| It has its own tokens (`--glass-bg`, `--gradient-*`, `--shadow-card`) | Counts as the project's style **even if the file count is low**, because tokens mean intent → **follow** |
| **Dark**: the root layout has a dark background | Counts as the project's style **with just that one file**, because the dark background only lives at the root → **follow** |
| **Colour**: tinted backgrounds, borders and text (chips filled with a light accent colour, light blue background blocks, coloured pills) in **3 or more files** | The project has a colour language → **follow**: the new screen uses exactly those fills, it does not fall back to grey (the principle "the project already has a colour language" at the top of `principles.md`). The rules about meaning and legibility still hold |
| It has chart colour scale tokens (`--chart-1`…) | Categorical charts use that scale (`components/charts.md`) |
| No significant signal | Flat or an empty project → flat (`P6`) |

The count is there to **decide between the project's style and flat**. The 3-file threshold
stops a single banner from dragging the whole screen into another style.

If the user sends a **reference image**, that is the "names a style" case of `P1`: recognise
it by eye using the "Recognise from an image" line in each block below, then follow it directly,
without asking. When there is an image, the image beats the code.

**P5. When styles overlap, apply both blocks. When the codebase is mixed, follow the
newest part.**

- **Glass + dark** is a very common pair. Apply both `P8` and `P10`.
- **Elevated + gradient in one spot**: elevated cards, only the recommended plan has a gradient. Apply `P7`, and apply `P9` only to that one spot.
- **Mixed codebase** (old pages flat, new pages glass): follow the **newest** part (check file modification dates in git), because that is usually where the project is heading. At delivery, say clearly which area uses what and which side you followed.

---

## Each style

Each block has four parts: recognise, rules overridden, recipe, traps.

### P6. Hairline flat — the skill's default

**Always the default**, unless the user chooses otherwise under `P1`. All the `M`
and `F` rules are written for this style. It overrides nothing.

- **Recognise from code:** no `backdrop-blur`, no gradient on surfaces, shadows no stronger than `shadow-sm`, cards have a `border`.
- **Recognise from an image:** light grey background, white cards with very thin borders, almost no shadow.

### P7. Elevated — hierarchy through shadow

- **Recognise from code:** `shadow-md` or stronger on ordinary cards, cards with little or no `border`.
- **Recognise from an image:** cards lift off the background with soft shadows, the recommended plan sits higher than the others.
- **Overridden:** `M13`, `M15`, `M29`. `F22` is partly overridden: a clickable card **raises its shadow** one step on hover, still no `scale`.

```html
<div class="rounded-2xl bg-surface shadow-sm ring-1 ring-black/5 hover:shadow-md">
```

**Shadow scale, one step per layer, no two layers the same:**

| Layer | Shadow |
| --- | --- |
| Card | `shadow-sm` |
| Clickable card, on hover | `shadow-md` |
| Dropdown, popover | `shadow-popover` (= `shadow-lg`, `M15`) |
| Modal, sliding panel, **including the sliding sidebar on narrow screens** | `shadow-modal` (= `shadow-xl`) |

**Traps**

- **When the card and the modal share a shadow, the modal no longer lifts.** The scale above exists so a higher layer is always more elevated. Raise the card shadow to `shadow-lg` and the modal must go up too, and so must the dropdown.
- **The shadow token set has all four steps, even when the page has no modal yet.** The sliding sidebar below `lg` is a modal layer, and it only shows on narrow screens, so it gets forgotten. Define only three tokens (card, card on hover, popover) and the sliding sidebar lies flat on the overlay, shadowless, lower than even the cards behind it. The probe reports "Opened panel or modal is not elevated above the page".
- **`ring-1 ring-black/5` together with a shadow is valid here.** It draws the card edge crisply on a white background. This is where `M29` is overridden: in flat, border and shadow do not go together; in the elevated style they may.
- **On a dark background, a shadow alone is hard to see.** An elevated project with dark mode keeps the shadow scale in dark mode, stronger, adds a 1px border (`ring-1 ring-white/10`), and surfaces get lighter by layer (`M21`, `M23`). The three go together; do not just push the shadow up until it shows.
- `scale-105` on hover blurs text during the motion. Only raise the shadow, do not scale up.

### P8. Glass — frosted glass

- **Recognise from code:** `backdrop-blur`, `backdrop-filter`, semi-transparent backgrounds `bg-white/10`, `bg-black/20`, borders `border-white/10`.
- **Recognise from an image:** translucent surfaces, colour or images faintly visible behind, a thin light line along the edge.
- **Overridden:** `F19`, `M13` (the border becomes a faint white border), `M15`, `M1`.

```html
<!-- Dark background -->
<div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">

<!-- Light background -->
<div class="rounded-2xl border border-white/50 bg-white/60 shadow-sm backdrop-blur-xl">

<!-- If the browser does not support blur, fall back to a nearly solid background -->
<div class="bg-white/90 supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:backdrop-blur-xl">
```

**Traps**

- **Glass with nothing behind it is just a grey card.** This is the part of `F19` that still holds: blur only means something when there is an image, a gradient or content scrolling behind. If the project is glass and the new screen has a plain background, there **must be something behind**, usually the project's background gradient layer. Do not put glass on a flat background.
- **Contrast fails depending on what is behind** (`P3`). Your glass may pass on a dark background but fail when the user scrolls past a light image. Measure at the worst spot. If it fails, raise the opacity of the glass background, do not make the text heavier.
- **Blur costs GPU, especially on mobile.** The cost grows with area times the number of stacked layers. Use it for the header, sidebar, modal and one to three featured cards. Do **not** use it on every row of a long scrolling list, because the page will stutter.
- **Always have a fallback** like the third line above. Without blur support and with the background still at `/5`, the text sits on an almost transparent background.
- The faint white border is **required**. Without it the glass edge dissolves into the background and the block has no shape.

### P9. Gradients and solid brand colour

- **Recognise from code:** `bg-gradient-*`, `bg-linear-*` (Tailwind v4), `linear-gradient`, `radial-gradient` on cards or buttons; or a whole card filled with solid brand colour.
- **Recognise from an image:** the recommended plan is filled with a gradient or the brand colour across the whole block, buttons have colour transitions.
- **Overridden:** `M12`, and the `M2` ratio.

**Does not override `M3`.** The gradient still comes from **the project's accent colour**. Three plans with three
gradients in three colours are three accent colours, which fails `M3` and `I3` at once.

```html
<!-- Recommended plan: whole block filled, button inverted -->
<div class="rounded-2xl bg-linear-to-br from-primary to-primary-hover text-primary-foreground">
  <button class="bg-surface text-foreground">Choose this plan</button>
</div>
```

**Traps**

- **Gradients everywhere means nothing stands out.** A gradient says "this is the most important spot". Use it for **one** kind of surface: the recommended plan, or the primary button. Not both, and not every card. This is the part of `M2` that still holds.
- **Gradients cannot `transition`.** `transition-colors` cannot interpolate `background-image`, so hover either jumps abruptly or changes nothing. Do hover with `hover:brightness-110` plus `transition-[filter]`, or with an overlay that changes opacity.
- **Text on a gradient is measured at the lightest end** (`P3`). Passing in the middle does not mean passing in the corner.
- **A button on a filled block is inverted**: `--surface` background, `--foreground` text. An accent-coloured button on an accent-coloured background disappears.
- Gradients spread over a large area easily **band**. Keep the two colour stops close, or shrink the gradient area.

### P10. Dark first

- **Recognise from code:** a dark root background (`bg-zinc-950`, `bg-black`, `bg-neutral-900`) on `body` or the layout, few or no `dark:` variants, or `color-scheme: dark`.
- **Recognise from an image:** a black or near-black background is the default, not a mode you switch on.
- **Overridden:** `M1`, `M20`, `M23`. If the project uses zinc grey, keep zinc grey, do not switch to navy.
- **Still applies:** `M21`, `M22`. Those two rules are written for dark backgrounds, and the dark background here is the main one.

**Traps**

- **Do not use pure black with pure white.** `#000` against `#fff` is too harsh, text glows and blurs during long reading. Use a near-black background (`zinc-950`) and near-white text (`zinc-100`).
- **Font weight stays the same as the light version.** Text hierarchy on a dark background works through **lightness**: primary text near white, secondary text a proportionally lighter grey than in the light version (dark `--muted` `#8b93a7`, 6.6:1). No major design system lowers weight on dark backgrounds; if a font looks too thick, judge it by eye on that font, do not lower it by rule.
- **Hierarchy through surfaces getting lighter by layer, plus borders and shadows.** The page background is darkest, cards one step lighter, elevated layers lighter still (`M21`). Shadows stay but are stronger and paired with a 1px border, because a shadow alone is hard to see on a dark background (`M23`).
- `border-white/10` borders carry the job of separating blocks (`M23`), because the dark surfaces differ too little.
- Filled areas (secondary buttons, selected items, hover backgrounds) are a faint white overlay, lighter than the card (`M21`).
- Images and avatars need `ring-1 ring-white/10`. Without it dark images dissolve into the background.

### P11. Neumorphism and 3D — recognise, follow, but patch the contrast

- **Recognise neumorphism:** each block has **two** shadows in opposite directions (one light, one dark) on a background the **same colour** as the block itself.
- **Recognise 3D:** icons and illustrations rendered as solid shapes, clay-like, with lighting and cast shadows.

**Neumorphism fails `P3` by construction.** The block is the same colour as the background, so buttons are nearly
invisible, and pressed versus unpressed states are hard to tell apart. Follow their style,
but **the primary button must have the accent colour or a border that passes 3 : 1**, and the selected
state must differ by something other than shadow.

**3D usually lives in illustrations, not in the interface frame.** Treat 3D icons as images,
for the same reason as the avatar exception of `M12`. The frame (cards, buttons, inputs) follows the project's
base style. Do not build 3D buttons yourself because the project has 3D icons.

---

### P12. Colourful — two recipes: browse-to-pick page, and dashboard

Pure flat reads as "colourless" in two places: pages the end user browses to pick from (job search, room
search, products, courses), where every page looks like an admin page (as the maintainers observed); and the dashboard of a new project with no brand yet, where the accent colour
is near black, so choosing "Colour" is still black and white. The two rebuild modes turn it into the Colourful row
(`review.md`, `V1d`); if the user asks for it in the request, build with the recipes below; outside those two places,
follow `P1`. The wireframe has no Colourful level (`design-process.md`, `U3`).

- **Recognise from an image:** the top of the page is a strong colour band (solid or gradient) wrapping the header and the search field,
  the footer in the same colour; some list items have a light accent-colour background with labels like "Urgent", "Hot";
  bold item titles.
- **Overridden:** `M2` (95/5 ratio), `M12` (only in the band), `M4` (only the icon tiles and chart series of
  recipe B). The `P2` principles stay, especially `M3` one accent colour for actions and `P3`
  contrast.

**Recipe A, browse-to-pick page**, exactly five places, no sixth:

| Place | What to do |
| --- | --- |
| Top band | The block wrapping header + search field (or the page title row) has a strong accent background: `bg-primary`, or `bg-linear-to-r from-primary to-primary-hover` (two close stops, `P9`). Header text and links white; search field white; Search button inverted (`bg-surface text-foreground`, `P9`). The band ends below the search row, content starts on the page background as before, do not pull cards up over the band with negative values (`N11`) |
| Footer | Same colour as the band, white text. If the page has no footer, skip it |
| Featured item | **Only when the data has that field** (urgent, hot, sponsored): background `bg-primary/5`, border `border-primary/25`, solid label `bg-primary text-primary-foreground` in the corner. No field, no inventing; at delivery note "needs field … for featured items" |
| Text | Item titles `font-semibold`; the page title keeps `text-xl` (settled rule 11) but goes to `font-semibold`, a keyword or number in the page title gets `text-primary`; block headings in the detail panel `text-lg font-semibold`. Prices and salaries keep `font-semibold` as before |
| Small touches | List bullets in the detail view `marker:text-primary`; the initials tile that replaces a logo uses `bg-primary/10 text-primary` instead of grey |

**Recipe B, dashboards and in-app work pages**: no colour band, no "hot" items (out of place
on a report page). Additionally overrides `M4` (colour for categorisation) **only in icon tiles and chart series**:

| Place | What to do |
| --- | --- |
| Stat card icon tile | Tile `size-8 rounded-lg`, lucide icon `size-4`; each card a light tint (`bg-indigo-50 text-indigo-600`, `bg-teal-50 text-teal-600`, `bg-violet-50 text-violet-600`, `bg-sky-50 text-sky-600`), at most four tints per screen. The number stays `text-foreground`, not tinted |
| Per-type leading icon tile | Department, supplier, transaction type: the same set of light tints, **one fixed tint per type** across every screen (Engineering is always teal). No type, no tile |
| Chart | Main series in the accent colour; for multiple series take the tint set above in the same order; incomplete periods dashed or hatched (`charts.md`) |
| Status | As at the Colour level: `M4` on progress bars, overruns, overdue items. A category tint never matches a status tint on the same thing (a budget bar is not teal because the department is teal) |
| Status badge (the user asks for "coloured badges") | Red, amber, green keep their `M7` meaning. Only grey statuses (running along the normal flow) may take category tints, and **the tints within one status table are at least ~45° apart on the colour wheel**, never two neighbouring tints: `sky`–`blue` (~23°), `blue`–`indigo`, `indigo`–`violet`, `emerald`–`teal`. Never the accent colour's tint (teal primary button means no teal badge). If there are not enough distant tints, the status with the most rows (usually the most ordinary step, e.g. "Confirmed") stays grey: a list in one badge colour is a colour patch, with nothing left to distinguish. Wrong: "Confirmed" `sky-700` next to "In consultation" `blue-700`, which at a glance read as one blue |

**Traps**

- **Category tints carry no status meaning**: red, amber, green are reserved for `M4`. The icon tile for
  "Pending approval" is not amber just because it is "pending"; tint it from the category set.
- **The selected filter chip is not solid accent** when there is a band: six solid orange chips under an orange band are
  two equally heavy masses competing. Chips follow `layouts/overlay.md` (`foreground/10` background + `inset-ring`).
- **Featured items at most about one fifth of the list.** If every item is hot, no item is hot (`M2`).
- **A featured item still differs from the selected item**: selected keeps the `I10` background, not `bg-primary/5`.
- White text contrast on the band is measured at the lightest end (`P3`); for light accent colours (yellow, bright orange) the band
  uses `primary-hover` or one step darker, text still white.

## Not in the table

When you meet a style that matches no block (brutalism, retro, skeuomorphism...):

1. **Measure before guessing.** Open three main components (card, button, input) and read the real classes, do not infer from file names or from one image.
2. **Follow what you measured**, overriding exactly the flat-style rules that style touches.
3. **Keep the whole "Principles" column of `P2`.** No style, however unusual, can override `I3`, `P3`, or 375px.
4. **Report in the `Audit:` line** that this is a style outside the table, and which rules you overrode.

A style outside the table that the user **has not chosen** still follows `P1`: if the project has it,
follow the project, otherwise flat; report at delivery.

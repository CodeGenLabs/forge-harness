# Review existing UI — V rules

Open this file when the request explicitly specifies one of three tasks (table for question 1 in
`SKILL.md`): wanting to know **if the existing UI looks good** ("take a look", "review", "what's off",
"why does it look weird", "looks cluttered", sending a screenshot or app link of their own asking for
review), wanting to **rebuild while keeping the brand / keeping the interface**, or wanting to **rebuild
in the skill's style, discarding the legacy style**. If the request only says "make it look better",
"rebuild according to skill", that routes to the default `U` branch, not here.

Difference from branch `L` (`refactor.md`): `L` cleans up code and **preserves the exact visuals**. `V`
reviews visuals, **proposes visual changes**, and waits for the user to pick lines before editing. If the
request wants both code cleanup and better visuals, go through `U` first, then clean up per `L`; only
when the request says review or keep the brand does `V` replace `U` (`SKILL.md` question 1).

Difference from branch `U` (`design-process.md`): all three modes of `V` keep the **page shell**, only
fixing and streamlining. If the user wants to rethink what leads, where filters sit, or what viewing
modes exist ("UX still feels off", "redesign from scratch"), route to `U`.

In this branch, **the skill is only a reference**. An existing project having its own colours, radii, and
fonts is their system, not a bug.

## Three modes ⚑

Infer the mode from the request without asking, then state it in a single line in the opening at
delivery.

| | **Review** (default) | **Rebuild, keep the brand** | **Rebuild in the skill's style** |
| --- | --- | --- | --- |
| Identified by | "take a look", "review", "what's off", "looks cluttered", sending a screenshot or link asking for review | "rebuild **keep the brand**", "keep colors", "keep current UI", "just streamline", "keep the brand" | "**completely** in the skill's style", "drop old style", "switch to the skill's style", "no need to keep legacy style" |
| Style lines | Noted only, unchecked by default | **Pre-checked**, user can uncheck any line | Pre-checked |
| Structure lines (`V1b`) | None | Included: reordering is pre-checked, dropping information is unchecked | Same as middle column |
| Streamline lines (`V1c`) | None | **Included, pre-checked**: one line per main block, streamlined in skill's style, keeping colours | Same as middle column |
| Coloured lines (`V1d`) | None | Included on browse-to-pick pages or dashboards (formula B of `P12`), **unchecked by default**: one line for the entire route, colours drawn from the project's accent | Same as middle column |
| Styling: shadow, border, rhythm, font size, labels, overlays on images | Preserved | **Follows skill's style** | Follows skill's style |
| Colours by role, logo, font | Preserved | **Preserved** | Only keep logo and main accent colour |
| Components | Do not rewrite, fix only bugged spots | Allowed to replace native controls and custom blocks with skill templates (table below) | Same as middle column |
| Brand | Preserved | **Preserved per colour role table** (below): built following skill patterns, styled with project tokens and colour roles | **Discard colour role table**, use skill tokens and style (`tokens.css`, `principles.md`): light grey page background, white cards with thin border, selected items with light background, light badges. Only keep the project's **logo** and **primary accent colour** as the single accent (`brand-tokens.md`). At delivery state one line *"kept red as accent colour, let me know if you want to change it"* |
| Logic, handlers, data, copy | Do not touch (`N10`) | Do not touch: new components accept the exact props and state of the old ones. **Do not add fields to types or mock data, do not write new copy** (taglines, percentages, currency amounts, new button labels). If a new layout needs copy that does not exist, build using existing copy, or put it on the table as a line for the user to write | Same as middle column |
| Ask before fixing | Yes | Yes: table first, wait for user reply before fixing | Yes |
| After fixing | Take screenshots again, rerun probe on that route | Rerun probe **until the `P` list is empty**, at most three passes, as in gate 3 (`checklist.md`) | Same as middle column |

The rebuild mode is only entered when the request specifies keeping the brand or keeping the UI; if the
request only says "rebuild with the skill", route to branch `U` (settled), and that branch still
preserves the brand following the colour role table below (`U4`). The skill-style mode changes identity
and must be explicitly requested by the user.

**Colour role table, write before rebuilding** ⚑. Brand is not just the primary button colour, but **how
the project uses colours for each role**. Open the "before" screenshot and code, write a short table:

| Role | What the project currently does |
| --- | --- |
| Primary button | e.g.: solid red background, white text |
| Selected item (sidebar, tab, chip) | e.g.: solid red background, white text |
| Badge, small label ("New", count) | e.g.: red background, white text |
| Link, secondary action | e.g.: blue text, no border |
| Price, prominent figure | e.g.: bold red text |
| Bold colour block, gradient | e.g.: navy gradient wallet card |

The keep-brand mode allows changing **layout, rhythm, component structure, font size, shadows, borders,
and image overlays**: in short, mode 2 = style of mode 3 minus colours. Keeping colours while keeping all
clutter from the old version leaves the rebuilt page just as ugly as before (rebuilt card with correct
colours but still retaining prefix labels, two-tier card footers, and four overlays on images). Do not
change **colour roles**: if the selected item is solid red, the new version remains solid red, even if
the skill's style is light grey background. Once built, place before and after screenshots side-by-side,
walk through every row of the table. If any row changed role, fix it to match. At delivery write one line
*"Colour roles preserved: …"*.

**Each role gets exactly one colour code, the whole page is cohesive** ⚑. Before building, `grep`
hardcoded codes (`-[#…]`, `red-500`, `slate-…`) in files you will touch. Any code close to a colour in
the colour role table (different shade of red, different shade of blue) is the same role written
inconsistently: consolidate to that token. Greys (secondary text, border, background) go to the project's
grey tokens, one grey family, borders ordered per `M14` in `rules-color.md`. Codes matching no role
(decorative purple, orange) follow "Decorative colour clashing with role colour" in `V1b`. Observed
failures: three shades of red (`#e61e25` token, `#ef4444`, `#dc2626`), four shades of blue (`#0068ff`
token, `#2563eb`, `#3b82f6`, `#4f46e5`), card border darker than sidebar divider line; each block was
on-brand individually, but assembled together they clashed.

Observed failures: selected sidebar item turned from solid red to grey border, "New" badge turned from
red background to grey text, blue login link turned into bordered button. The new version was cleaner,
but identity was lost.

Blocks without a template in the skill (classified listing card, product card, custom project block) are
rebuilt following "Building something without a template" at the end of `principles.md`: borrow the
closest structure, build edge cases, auto-fix with probe, then visually check the five questions.

**Styling taken from the skill, not from legacy CSS** ⚑. Applies to both rebuild modes and to `U4` on
projects with existing UI. "Styled with project tokens" only refers to **colours by role**. Grey borders,
scrollbars, control heights, checkboxes, and motion of elevated layers are styling: if legacy CSS exists,
still replace them. If the project already has a dedicated component for it, **modify that exact
component** per the template, do not create a duplicate version (`S9`); if not present, build anew per
template, do not invent custom versions:

| What currently exists | Replace with |
| --- | --- |
| Native `<select>`, custom select | `components/choice-controls.md` (Select; from ~8 items include search input) |
| Native `<input type="range">`, price range slider | `components/range-slider.md` |
| Custom menu, dropdown, popover: frame, items, **open/close animation** | `layouts/overlay.md` (frame in "Dropdown", rhythm in "Motion"). Toggling via `{isOpen && …}` or `display` lacks motion |
| Checkbox, radio, switch, date picker | `components/choice-controls.md`. `accent-color` on native `<input>` does not count as styled |
| Tab, filter chip, pagination | `components/small-controls.md` |
| Input field, search input | `components/input.md` |
| Button, **button row in header** | `components/button.md`; header button row per "Button group on right side of header bar" in `layouts/app.md` |
| Card border, elevated frame, divider | `M14`: project's lightest grey step; border token around `#e2e8f0` reserved only for inputs, bordered buttons |
| Scrollbar (`::-webkit-scrollbar`) | scrollbar block from `tokens.css`: 4px, hidden until hovered or scrolled |
| Sidebar links, group labels | `layouts/app.md`, Sidebar section: standard items normal weight (400) `text-foreground/70`, only active item `font-medium`; group labels UPPERCASE `text-muted`. Active item background colour per colour role table |
| Focus ring | `I13` |

At delivery include a **"Styling:"** line walking through all the above items present on the page, each
noting which file it was updated against (*"Styling: dropdown per overlay.md, checkbox per
choice-controls.md, card border `--color-border-light`, scrollbar per tokens.css"*). Like the `Audit:`
line, this makes skipping **visible**. Observed in branch `U`: correct wireframe layout, correct red
colour, but custom dropdown opened abruptly without motion, native checkbox used `accent-color`, card
border and menu frame were `#e2e8f0`, scrollbar was 6px solid grey from legacy CSS, header buttons were
misaligned at 30–34px. The viewer assumed this was due to "keeping the brand" and felt it *"did not look
like the skill at all"*.

---

## Four defaults

1. **Review without asking; ask before fixing.** Take screenshots, measure, and assemble the table
   immediately. But **do not touch any project file** until the user selects lines. Apart from the two
   gates of branch `U` (brief approval, wireframe selection), this is the only place requiring user
   sign-off before modifying code: fixing a running product based on a review table requires
   confirmation.
2. **Read the project's system before evaluating.** Run question 2 audit and level 3 in `SKILL.md`, read
   `tailwind.config`, `globals.css` / `index.css`, token files, and shared components. Evaluate against
   that system, **not against the skill's `tokens.css`**.
3. **False positives are worse than omissions.** Calling a brand colour a bug with even a single line
   destroys user trust in the whole table. When hesitating between two tiers, choose the milder one. When
   uncertain whether something is a bug, drop that line.
4. **Do not create extra work.** Do not propose dark mode when the project lacks it (`V4`). Review mode
   does not propose changing styles; the two rebuild modes do, via the Streamline line (`V1c`). In review
   mode, do not rewrite components; each line fixes only the exact defective spot. The two rebuild modes
   may replace components per the table above.

---

## V1. One tier per line ⚑

| Tier | Basis | Example | Default |
| --- | --- | --- | --- |
| **Broken** | Violates universal brand rules | Contrast below 4.5:1 (large text 3:1), horizontal page scroll, clipped text or text hidden losing meaning, tap target below 24px, elevated layer bleeding off screen, dialog taller than viewport without scrolling, hover causing layout shift | Proposed to fix |
| **System drift** | Tokens and components **of the project itself** | Three button radius styles, two colours for the same state, fractional spacing outside their scale, hardcoded hex close to a token | Proposed to fix, following their system |
| **Style** | `principles.md` and skill rules | Sidebar has right border, badge has solid background, hover background darkness | Noted only, marked "style, up to you", unchecked by default |

- **System drift must point to where it is done right in the project.** "This button has 6px radius, four
  other buttons of the same type have 12px radius (`button.tsx:14`)" is System drift. Merely saying
  "should have 12px radius" without any precedent in the project is Style.
- **Counting values outside a scale is not System drift.** "There are 17 radius styles, consolidate to
  `sm` / `md` / `lg`" is imposing a foreign scale onto the project. It is only drift when **the same role
  differs**: two buttons of the same type side-by-side, two cards in the same grid. Cards of different
  types (panels, stat cards, promo cards) do not share the same role just because they are all cards, so
  different radii between them is not a bug. An off-token value used consistently for a single role (all
  dialogs have 20px radius, all feature cards have 28px radius) is their system, even if unlisted in
  token files. When finding hardcoded hex codes, record the role and `file:line` for each: "blue
  `#3b82f6` on count badge, while system blue is token `primary` `#2563eb`".
- **Unstyled native browser controls count as System drift in all modes**, without needing a styled
  counterpart on screen to compare against: `<select>` retaining square corners and browser grey borders,
  default `<input type="range">`, inset-bordered inputs. Inside a styled application, they read as
  forgotten spots. Fix column: if the project has a dedicated component, use it; if not, build following
  skill templates ("Three modes" table), styled with project tokens. A native select that is already
  styled (border-radius, token border, `appearance-none` with custom chevron) is not a bug in review
  mode. In the two rebuild modes, a styled native select **shown on desktop** must still be replaced:
  clicking it still triggers the OS menu (`choice-controls.md`, Select). Probe lists these in "Styled
  native select on desktop".
- **Find System drift in code with commands, do not just inspect screenshots.** Two similar shades of
  red, custom shadows, fractional radii inside a modal will not stand out in screenshots. Read tokens in
  `@theme` or `tailwind.config` first, then grep:

  ```bash
  # default Tailwind palette colours used where a token exists (red, blue, grey text…)
  grep -rnoE "\b(bg|text|border|ring|from|to|fill|stroke)-(red|rose|blue|sky|green|emerald|amber|orange|slate|gray|zinc)-[0-9]{2,3}\b" \
    src app components --include='*.tsx' --include='*.jsx' 2>/dev/null | head -40
  # hardcoded color codes, shadows, radii
  grep -rnoE "\[(#[0-9a-fA-F]{3,8}|rgba?\([^]]*\))\]|shadow-\[[^]]*\]|rounded-\[[^]]*\]" \
    src app components --include='*.tsx' --include='*.jsx' 2>/dev/null | head -60
  ```

For plain CSS, CSS Modules, or SCSS projects, those two commands return nothing. Run additional commands,
ignoring token files:

  ```bash
  # hardcoded colors and radii in CSS outside token files
  grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\([0-9]|border-radius:\s*[0-9]" src \
    --include='*.css' --include='*.scss' --include='*.less' 2>/dev/null | grep -vE "tokens?\.|variables\.|theme\." | head -60
  # hardcoded color maps in TS / JS files (status mapping -> hex)
  grep -rnoE "['\"]#[0-9a-fA-F]{3,8}['\"]" src --include='*.ts' --include='*.tsx' --include='*.js' 2>/dev/null | head -30
  ```

Results duplicating token values (hardcoded `#2563eb` when that token exists), or slightly deviating from
tokens for the same role (`#3b82f6` alongside blue token `#2563eb`), are System drift. Note the role and
`file:line`, consolidating shared roots. An uncommon value used consistently for one role is not drift
(see above). Missed in a CSS Modules project: primary button on one page overrode `#a3e635` instead of
token `#c6f432`, one card overrode `border-radius: 8px` among 20px cards. Running only Tailwind commands
missed them; inspecting screenshots caught both visually.
- **Button hierarchy is Style in review mode, not System drift.** Two primary buttons side-by-side in a
  header, even if another page uses a secondary button: each button uses correct tokens and components;
  deciding which action is primary is a product decision. Write a Style line (*"two buttons equally
  prominent, unclear which is the primary action"*). System drift is **different values for the same
  role** (colour, radius, size, badge variant), not different choices of variants. In the two rebuild
  modes, this goes into the Structure line "Competing signals" (`V1b`).
- **Never a bug**, unless violating readability rules in the Broken tier: accent and brand colours, large
  or small radii, fonts, shadows / gradients / glass effects used consistently across the project, dense
  or airy layout, projects more colourful than skill style (start of `principles.md`), bold brand colour
  blocks or gradients (wallet cards, banners), icons and badges each having distinct colours. "Not a bug"
  means **do not classify as Broken or System drift, do not fix automatically, do not pre-check**. It
  does not mean staying silent: if it looks bad, still propose changes per the section below.
- **Propose improvements wherever something looks bad, whether styling or identity** ⚑ (settled).
  Visually inspect each block side-by-side with the skill's closest template: badges, fonts, buttons,
  cards, icons, images, breathing room, shadows, gradients, decorative colours, sidebar, header… For each
  block that looks bad, write a line classified by type:
  - **Styling** (size, weight, radius, padding, border, shadow, position, density): branch `U` and both
    rebuild modes **auto-fix** per "Styling taken from the skill" and Streamline line `V1c`; review mode
    writes a Style line with before / after screenshots.
  - **Identity** (role colour, font, logo, bold brand blocks): do not auto-fix, do not pre-check. Propose
    as a line (review: Style; rebuild: unchecked line; branch `U`: "Observations" section of `U4`) with
    concrete direction and before / after screenshots. For fonts, name one or two verified fonts with
    required character subsets (`T5`). For colours, prioritize reducing prominence while keeping the hue
    (solid pill to text without background, small dot) before proposing a colour change.
  - **Quantity and hierarchy** (identical element repeated on every item, secondary elements heavier than
    primary): express with counts and locations, like "Non-distinguishing information" and "Competing
    signals" in `V1b`: *"8/8 cards have badges, 4 cards say 'New', eyes land on the badge before the
    price. Keep badges only on exceptional listings."*

**The reason must be something end users run into or see**: hard to read, eyes land on the wrong place,
looks like a draft, clashes with the rest of the page, broken font glyphs. "Does not match skill style"
or "looks outdated" are not valid reasons. In benchmark projects: a proposed line with rationale,
unchecked, **is not counted as a false positive**; classifying brand as Broken / System drift or
auto-editing brand is still a false positive.

⚠️ **Rule inversion, do not revive the legacy version:** the old version forbade putting those items
"even in the Style tier" to block lines demanding identity changes. That also blocked things worth
calling out: 8/8 cards having badges, five colours overlapping an image; ugly badges, fonts, and bold
sidebar text were suppressed.
- **Style tier maximum five lines** in review mode, placed at the end of the table. In both rebuild modes
  there is no line limit, but Style items for a primary block are consolidated into that block's
  Streamline line (`V1c`).

A probe report does not mean an issue is Broken. Many probe checks evaluate against the skill's style, so
reclassify tiers per this table. Broken items are automatically grouped by probe into `P1`, `P2`… at the
end of the report (see `V5`).

| Probe check | Tier |
| --- | --- |
| Page auto-scrolls on load, horizontal scroll, elevated layer bleeding off screen, button-triggered layer broken, hover causes layout shift, text contrast below threshold, container hiding text, text truncated too short, text in button wrapping, number label overlapping chart line, badge covering icon, block height cramped, truncation swallowing numbers, hover matches selected item colour, hover on selected item removes accent colour, scale / translate / rotate lacking transition (`W10`), horizontal scrolling row unreachable by mouse (`responsive.md`, after `R10`), aligned divider lines differing in colour (half light, half dark, wrong for any brand) | Broken |
| Tap target below 32px | Items noted "(below 24px)" are Broken, remainder (24 to 31px) are Style |
| Row in header / nav wrapping | Broken when overlapping or misaligning other blocks, otherwise System drift (compared to that row at other viewports). Inspect screenshots to decide |
| Button row in header with inconsistent sizes | System drift. In rebuild modes, goes into header Streamline line (`V1c`), per "Button group on right side of header bar" in `layouts/app.md` |
| Control row misaligned vertically, placeholder longer than field, block looks like input but wraps text, pagination with text buttons only, transparent header bar over grey background, menu divider darker than container border, overlay frame / line darker than token `--border`, left stripe clipped by container radius, translucent modal frame nested inside translucent backdrop, nearly equal heights that do not match, misaligned dividers between adjacent columns, misaligned text edges within same column, uneven delimiters, control retains browser default styling, container declares border but border invisible, blocks in same component have different radii, Tab navigation invisible while project draws focus rings elsewhere (exception to `I13`), child block disappears on hover, elevated layer has dead strip, elevated layer toggles without motion, native controls in elevated layer (checkbox, radio, slider, file input; styled native select and date picker follow "Styled native select on desktop"), bold decorative border, scrollbar differs from template, bold sidebar text or tightly packed items, incorrectly formatted localized numbers | System drift |
| Hover background barely visible, hover background dissolving into backdrop or matching background behind it (consolidate into one line listing buttons; in rebuild modes auto-fix per `components/button.md`), hover background matching button's own border colour, border changing colour on hover, hover shape differing from selected item, residual marks after click, focus ring persisting after Tab (`I13`: review mode notes a Style line, rebuild modes remove it), table horizontal scroll missing columns, option groups laid out in grid, currency amount wrapping, unaligned numbers, numeric label bleeding outside plot area, punctuation wrapping to start of line, font size below 12px (consolidate into one line noting smallest size and location; bump to at least 12px), sticky column scrolling independently, content floating mid-screen on wide viewports (`layouts/app.md`), repeated items heavy with text | Style |
| Styled native select on desktop, styled native date/time input, including inside elevated layers | Review mode: omit from table. Rebuild modes: System drift, replace with built Select (search box from 8 items) and date picker with calendar popover |
| Console errors | Omit from table. Note a single line below table |

Weak hover background is Style in review mode (settled): subtle hover breaks nothing, users can still
click, and it is the shadcn default. Only hover causing an **invalid state** is Broken: hover matching
selected colour, hover on selected removing accent, hover causing layout shift. Probe still places weak
hover in the `P` list (labelled "review: Style") because at build time, gate 3 must resolve everything.
In review tables, that check goes to Style. ⚠️ Do not classify as Broken: the table would produce three
Broken lines merely for ghost buttons and subtle shadcn table row hover.

---

## V1b. Structure tier, rebuild modes only ⚑

Review mode does not include this tier. When a user asks to "rebuild", beyond native controls, they want
to know whether the screen **arrangement** works: which blocks are overloaded, where elements compete,
which controls are the wrong type. Probe cannot measure these; inspect screenshots and read code.

| Type | Signs | Fix direction |
| --- | --- | --- |
| Competing signals (`N3`) | Inside one block three or more items use expensive signals (accent colour, solid fill, large bold text), or two buttons with equal visual weight sit adjacent | Keep one prominent item. For two buttons, make one primary, one secondary (`I1`). **Reduce prominence, do not change colour** |
| Two places, one job | Two buttons lead to the same action, one piece of information appears twice in the same block. At screen level: identical navigation appears twice (sidebar menu and category grid), page title repeats in header, heading, and selected item, identical callout in two places | Keep one |
| Non-distinguishing information | Every item in a list carries the identical label, 0 is displayed as meaningful data, missing values printed as text ("Post date unknown", "No description") | Show only on items that differ. Hide 0 or state in words. For missing values, hide that snippet entirely |
| Overloaded block | Card in grid contains more than ~6 data points, secondary line truncated with "…" even at standard viewports | Keep what is used to choose between items. Move the rest to detail page |
| Wrong control type | Oversized field for quick choice, select for two choices, custom control with dead sections | Follow templates in "Three modes" (chips, segmented control, `range-slider`…) |
| Misplaced | Control sits far from what it governs (sorting, filtering detached from list), adjacent labels misaligned vertically, one container mixing multiple layout paradigms | Place tight against what it controls. In same row, align top edges |
| Decorative colour clashing with role colour | Icons, illustrations, icon containers each have distinct colours, to the point primary button and price are no longer the most prominent | Consolidate decorative colours to one or two brand tones. **Only colours outside colour role table**, colours in table preserved |
| Promo block overwhelming content | Banner occupies over half initial viewport, states one idea twice (number in heading and in image), more than one button, text in illustration clipped | Reduce height, one heading and one button, drop repetition. Illustrations are theirs: do not redraw, only adjust frame and surrounding text |

- Each line pinpoints exact location (route, block, `file:line`) and speaks in terms of what end users
  trip over. "Card looks cluttered" is not a valid line.
- **Not a roundabout way to change colour.** Structure lines speak in hierarchy: what is competing, what
  to demote, colour preserved per colour role table. Wanting to change colour outright ("too many badge
  colours", "change red to grey") is an **identity** line per `V1`: unchecked by default, accompanied by
  rationale and before / after screenshots, not squeezed into Structure lines.
- **Pre-checked or unchecked.** Lines that only reorder (reduce prominence, change control type,
  relocate) are pre-checked ✓. Lines that remove, hide, or merge information, and lines consolidating
  decorative colours, are **unchecked by default**: those are product and identity decisions added at the
  user's discretion. This rule applies strictly to Structure lines: Style lines in rebuild modes remain
  **pre-checked** per the "Three modes" table.
- **One decision per line.** "Drop page title in header, and change active chip colour" are two lines:
  the user may want one without the other.
- **Check all types across each reviewed route**, not just control-heavy routes. Promo blocks and
  redundant navigation frequently sit on landing pages where probe detects little.
- Maximum ten lines, placed after System drift, before Style.
- Data formatting (long decimal numbers, mixed units) belongs in their formatting functions (`N10`): omit
  from table, mention in a single note below the table.

---

## V1c. Streamline line, rebuild modes only ⚑

When users ask to "rebuild keeping the brand", they expect the **new version to look distinctly different
from the old one**, not the legacy version with a few patches. Therefore, each primary block (repeated
card in grid, filter block, header, side panel, promo block) gets **one Streamline line**: place that
block side-by-side with the skill's closest template (`card.md`, `list-row.md`, `input.md`,
`small-controls.md`, `layouts/app.md`…) and record every difference, **excluding colours in the colour
role table, logo, and font**. Mode 3 changes colours as well.

Common patterns:

| Clutter | Streamline direction |
| --- | --- |
| Prefix labels before self-evident values ("Date: 12/09", "Total: $120.00") | Drop label, establish hierarchy via font size and position |
| Reserving space for two heading lines; single-line heading leaving dead space | Height sized to content, card footer pushed to bottom via flex |
| Three or more overlays on image (badge, label, count, button) | Maximum two: one badge and one button. Move the rest to text section |
| Two-tier card footer (separate timestamp row, separate button row), background different from card body | Single row. Move timestamp to meta line |
| Icon before every meta line | Keep only meaningful icons (location). Consolidate meta into one row delimited by `·` |
| Border plus shadow plus contrasting background: two or three boundaries separating one edge | Single separation method: thin border or background fill; shadow reserved for elevated layers (`budgets.md`) |
| Input field with accent border when unfocused | Standard token border; accent colour only on focus |
| Three or four shades of secondary text in one block | Two: primary text and `text-muted` |
| Irregular spacing, each block having unique rhythm | Follow skill scale (`budgets.md`, Rhythm) |

- A Streamline line consolidates multiple refinements for the **same block**, fix column lists them
  concisely, and **before / after screenshots are mandatory** (via temporary CSS injection, `V5`).
  Without screenshots, users cannot picture what "streamlined" means.
- Pre-checked ✓. Streamline lines do not drop information: dropping a prefix label retains the underlying
  value. Elements that must be completely removed (a piece of information, a button) must be split into a
  separate, unchecked Structure line (`V1b`).
- Boundary for keeping the brand: button colours, selected items, badges, and prices do not change. Radii
  preserve the project's radius family (rounded stays rounded, square stays square), only consolidated to
  consistent sizes for the same role.
- Placed after Structure, before Style.

## V1d. Coloured line, rebuild modes only ⚑

Rebuilding cleanly only to have the page feel "colourless" is a common issue on consumer-facing pages.
Rebuild modes therefore provide an additional **single Coloured line** for the whole route, following
`P12` in `styles.md`.

- **Only when all three hold**: consumer browse-to-pick page (job search, room search, products, courses,
  articles) per formula A of `P12`, **or dashboard** per formula B (light tint icon containers on stat
  cards, multi-hue charts); project is currently flat (`P4` yields flat); route has no earlier line that
  altered colours. Forms, settings, and pure admin tables do not get this line.
- **Unchecked by default.** Altering page-wide colour intensity is the user's decision, unlike Streamline
  lines.
- Fix column lists the exact spots from formula `P12` applied to this page (A: top band, footer, featured
  items, text, accents; B: icon tiles, row-leading tiles, charts, status, sidebar). Note reasons where
  inapplicable, e.g. *"featured item: data lacks urgent/hot field, omitted"*. Do not add fields, do not
  invent labels (three modes table, "Logic, handlers, data, copy").
- **Before / after screenshots mandatory** like Streamline lines (`V5`), full-screen at 1440 to show the
  band.
- Keep-brand mode: band colour is the accent from the colour role table, no other role altered. If solid
  accent filter chips already exist, the Fix column notes converting chips to light tint style (`P12`
  trap).
- Placed after Streamline, before Style.

---

## V2. Screenshot sources and confidence ⚑

- **Running app available** (localhost link or URL, or dev server can be started): capture automatically
  via probe (`V3`). Extract route list from router file. If blocked by login, requiring real data, or
  server cannot run, state clearly in one line and request screenshots, do not guess.
- **User provides screenshots**: user screenshots take precedence over automated captures when they
  diverge, as they reflect what the user actually sees (authenticated, real data). State any discrepancy
  in a single line.
- **Only screenshots available, no code**: proceed nonetheless. System drift tier relies strictly on
  visual inspection (two buttons of same type with differing radii), without referencing tokens.
- **Measure tap targets from screenshots.** An image matching exact viewport width (1280px image for 1280
  breakpoint) is 1x scale; if doubled, divide by 2. Measure small controls in pixels: switches,
  checkboxes, radios, icon-only buttons, table row action buttons, close buttons. Any dimension under
  24px is Broken, source *measured on 1x image*. Missed failure: inspecting a 32x18 switch (critiquing
  track contrast) without measuring dimensions. **Except checkboxes and radios drawn at 16–20px**:
  standard drawn size; actual tap target is typically expanded via padding, pseudo-elements, or clickable
  labels, which screenshots do not reveal. Omit from table under all tiers; include only if the drawn box
  is below 16px. For switches, icon buttons, and close buttons, drawn bounds usually match hit targets,
  so measure as above. False positive: shadcn checkbox drawn at 18px with 24px tap target mistakenly
  classified as Broken.
- **Video**: models cannot view video directly. Extract frames around motion: `ffmpeg -i recording.mp4
  -vf fps=4 "$TMPDIR/forge-review/frames/%03d.png"`.
- **Note source on every line**: *measured*, *seen in screenshot*, *read code*, or *inferred*. Static
  screenshots do not reveal hover, focus, transitions, a11y trees, or other viewport widths; **do not
  assert these based solely on screenshots**. Either state "requires runtime verification" or drop the
  line. Contrast read from images samples compressed pixels that may drift, so report only when
  distinctly low (below ~4:1).
- **Interactive bugs must be verified.** Hover, Tab, page load, opening elevated layers: write *measured*
  only when probe or you performed the interaction and observed the failure. If inferred solely from code
  ("has `group-hover:flex`, so card probably jumps"), write *read code, unverified*.

---

## V3. Comprehensive breakpoints, viewport sweep, opening elevated layers ⚑

One pass per route:

```bash
node <skill-directory>/scripts/probe.mjs http://localhost:5173/<route> \
  --sweep --out "$TMPDIR/forge-review/<route>"
```

| Breakpoint | Viewport | Common failure points |
| --- | --- | --- |
| Mobile | 375 | Horizontal overflow, excessive margins eating width, chip or tab rows wrapping |
| Tablet portrait | 768 | Two-column grid squished, sidebar uncollapsed while content is cramped |
| Tablet landscape | 1024 | Sidebar collapse threshold, drawer covering most content |
| Small laptop | 1280 | Multi-column table next to sidebar, toolbar wrapping |
| Desktop | 1440 | Overstretched content, excessively wide text lines |
| Wide screen | 1920 | Centred content drifting from sidebar, cards stretched with empty right halves |

- **Fixed-width captures are insufficient.** `--sweep` resizes viewports from 1440 down to 375 in 20px
  decrements, reporting **ranges of widths** containing defects. Open images under "Notable frames", and
  add frames around sidebar collapse and grid column thresholds: overlap or misaligned rows cannot be
  measured by machines. Only defective frames go into the table.
- **Measure horizontal overflow, do not just eyeball.** Probe identifies the overflowing element. Copy
  that selector into the table, tier Broken, source *measured*.
- **Open elevated layers at 375.** Probe automatically opens buttons with `aria-haspopup`, and on narrow
  screens attempts clicking elements **looking like triggers**: `aria-expanded`, labels like "menu",
  "filter", "notifications", "select"…, bell icons, kebab menus, chevrons, including icon-only buttons,
  clickable `div` rows, and creation buttons ("Create…", "Add…", plus icon) since these almost always
  open forms. It captures each opened layer (`<breakpoint>-open-<n>.png`) and measures boundary overflows
  and heights exceeding viewport. Action buttons (delete, save, favourite, submit, pay) are not clicked.
  Inspect each image. For elevated layers probe cannot trigger, **click manually** via Playwright at 375
  and capture. "Could not inspect X" is only written after an attempted click failed (auth required, row
  selection required, live API call), never as an excuse to skip. A closed-state screenshot will not
  reveal overflowing menus or modals exceeding screen height.
- **Record viewport or range of widths on each line**, e.g. "375px" or "860–1000px". Copy ranges from
  probe measurements, do not guess from CSS breakpoints: `@media` thresholds only specify where columns
  toggle, not where tables overflow. For precise bounds, measure small steps around that edge.

---

## V4. Dark mode: review both if present, do not invent if missing ⚑

Follows the spirit of `M20` (light only by default), but defer to existing project implementation.

- **"Dark mode present" means switchable, not merely declared.** Projects initialized with shadcn
  frequently contain `.dark` blocks in `globals.css` that are never activated. Consider present only when
  an **activation mechanism** is found:

  ```bash
  grep -rlE "next-themes|ThemeProvider|setTheme|classList\.(add|toggle)\(['\"]dark|prefers-color-scheme|data-theme" \
    --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' --include='*.css' . | grep -v node_modules
  ```

Then recapture with `--dark` and compare against light screenshots. If the screen does not invert
colours, dark mode is only declared (probe notes "page does not darken with --dark"). Probe adds the
`dark` class to `<html>` and emulates `prefers-color-scheme`; if the project switches via `data-theme`,
apply that attribute before capturing.
- **If absent (or merely declared), do not touch**: do not capture dark mode, do not propose dark mode,
  do not add `dark:` classes to fix code. State at most one line "project has not enabled dark mode" in
  the opening, omitted from the table.
- **If present, review both modes thoroughly.** Run an additional probe pass with `--dark` across all
  default breakpoints (no `--sweep` needed); "after" screenshots must include both versions. **The dark
  pass maintains an independent `P` list** and must be cross-checked just like light mode (`V5`): accent
  colours maintaining contrast on dark backgrounds vs falling below 4.5:1 can only be measured in the
  dark pass. Summary count splits into two: "light 78 items, dark 41 items". Dark colours follow the
  project's actual dark tokens (`.dark` block, `[data-theme="dark"]`), not the skill's navy tokens
  (`M23`).
- **Half-baked dark mode is Broken**: switch button present but accompanied by harsh white background
  patches, black text on dark background, invisible borders, dark logos on dark backgrounds, invisible
  shadows. Probe's "DARK MODE" section catches bright patches (Broken), inputs missing borders, sunken
  hover states, missing `color-scheme` (`M21`, `M31`, `M32`); the latter three classify as System drift.
- **When fixing one mode, recapture both.** Fixing light mode only to break dark mode is the most common
  bug in dual-mode projects.

---

## V5. Delivery table, "after" screenshots, and applying chosen lines ⚑

**"After" screenshots must be actual renders, not descriptions.**

- Running app available: inject temporary CSS into the page (`page.addStyleTag`) and capture at that
  exact viewport. Do not modify project files yet.
- Screenshots only: rebuild the affected region as static HTML, using colours sampled from their
  screenshots, not skill colours. Clearly label as "mockup".
- Style lines do not require "after" screenshots, except lines offering options to choose between (styles
  A / B / C): capture all options.

**Screenshots must be clickable links, not file paths** ⚑. `$TMPDIR/forge-review/…/current.png` in chat
cannot be opened by the user, rendering even great suggestions useless.

- Run a background static server on the images directory: `python3 -m http.server <port> -d
  "$TMPDIR/forge-review"`. Every Screenshot cell is a full link:
  `http://localhost:<port>/<route>/fix/1-before.png`.
- **If any line includes screenshots, generate `compare.html`** in the same directory: one block per
  table row, row number and defect name as heading, before / after screenshots or candidate options
  placed side-by-side at equal height, short captions under each, recommended option clearly indicated.
  Top of delivery message includes one line *"View comparison:
  http://localhost:<port>/<route>/compare.html"*.
- `curl -s -o /dev/null -w "%{http_code}"` each link before sending. If a server cannot be run, write
  `file://` with fully expanded absolute paths, never unexpanded `$TMPDIR`.

```html
<!doctype html><meta charset="utf-8"><title>Comparison</title>
<style>body{font:14px/1.5 system-ui;margin:24px;background:#f4f4f6;color:#2c2c2c}
section{margin-bottom:32px}h2{font-size:16px;margin:0 0 12px}
.row{display:flex;gap:16px;flex-wrap:wrap}figure{margin:0;background:#fff;border:1px solid #eaeaea;border-radius:12px;padding:8px}
figure img{display:block;height:320px;width:auto;border-radius:8px}figcaption{padding:8px 4px 0;color:#707070}</style>
<section><h2>6 · Badge overlapping image (Style)</h2><div class="row">
  <figure><img src="badge/current.png" alt=""><figcaption>Current</figcaption></figure>
  <figure><img src="badge/next-to-price.png" alt=""><figcaption><b>A · Next to price (recommended)</b></figcaption></figure>
</div></section>
```

**The delivery table is a markdown table in chat**; screenshots are accessed via links and the comparison
page above. Order:

1. **Opening**, one line per item: `Audit:` line (stack, token system location, style, dark mode: present
   / declared only / none), routes and breakpoints reviewed, unreviewed areas and why.
2. **Table**: Broken first, followed by System drift, Structure, Streamline and Coloured (rebuild modes
   only, `V1b`, `V1c`, `V1d`), Style last.

   | # | Tier | Location | Defect | Fix | Source | Screenshot |
   | --- | --- | --- | --- | --- | --- | --- |
   | 1 | Broken | `/orders`, 860–1000px, header `nav` | Top menu wraps to two lines, pushing page title down | Switch to menu button at 1000px instead of 860px | measured | [before](…) · [after](…) |
   | 7 | Style | Sidebar | Right border plus contrasting background: two boundaries separating one edge. Style, up to you | Remove border | read code | |

   - The **Defect** column describes what end users see ("menu wraps to two lines, pushing search field
     out of alignment"), not rule names.
   - The **Fix** column refers to the project's system: which token, which component, which file.
   - Defects recurring across screens sharing a single root (shared component) are consolidated into one
     row, noting affected screens.
3. **Cross-check probe's `P` list before delivery.** The probe report ends with "Items requiring
   cross-check": everything measured by machine that `V1` classifies as Broken, assigned codes `P1`,
   `P2`…, with viewport ranges. Each code must **appear in the table** (Source column records `measured
   P3`, multi-route reviews include route: `measured /orders P3`; shared roots consolidate multiple codes
   into one row) **or have an exclusion reason** below the table. Below the table always include a
   summary count line:

> Probe cross-check: 19 codes, 17 in table, 2 excluded: `/orders P7` (container hiding text is
intentional sliding carousel, verified via screenshot), `/orders P12` (bottom bar obscured text during
capture).

**Exclude only when the code is not an actual bug** (measurement artifact, intentional, verified clean
via screenshot). Real bugs requiring app-wide token changes must still appear in the table, clearly
noting "changes token, affects entire app": whether to accept is the user's choice, not a reason for
exclusion.

If detected by machine but absent from the table, users have no way of knowing it was omitted.
4. **Final check of Style and Structure tiers**: lines proposing changes to brand colours, fonts, or
   logos are **identity** lines (`V1`): they must have user-visible reasons, before / after screenshots,
   and remain unchecked by default; delete if lacking rationale. Check Streamline lines as well: changing
   colours listed in the colour role table violates mode 2.
5. **Conclusion**: *"Reply with the row numbers you want to fix, e.g. `fix 1, 3, 4`."* Review mode: do
   not propose fixing all. Rebuild modes: pre-checked lines marked with ✓ at the start of the row,
   concluding with *"I will apply the checked rows ✓. Reply `ok` to proceed, or uncheck items, e.g. `drop
   7, 12`."*

**Once the user makes selections:**

- Fix only those specified rows, using their tokens and components. If a defect resides in a shared
  component, fix it in that component and note beforehand that it affects other screens.
- After fixing, recapture at the same viewport (capturing both modes if dark mode exists), place before
  and after screenshots side-by-side, then rerun probe on that route to verify bugs are resolved without
  regressions.

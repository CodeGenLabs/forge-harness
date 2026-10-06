# Settled rules

The maintainers settled the rules below only after looking at real builds. **Do not overturn them, do not do
otherwise**, even when most products do it differently or an argument sounds reasonable. To change one, ask the maintainers
first.

The **"Rejected reasoning"** column records the exact sentences that once led to a wrong build. If you are writing a spec and
catch yourself thinking up a sentence like that, stop: it is an old bug coming back.

**When to open this file:** when writing a new section or editing a spec that mentions button colour, button weight
(`primary`, `outline`, `secondary`, red, neutral), radius, title font size, hover, focus,
motion. After editing the skill, run `node skills/ui-ux/scripts/lint-skill.mjs` (from the repo root).

| # | Settled rule | Settled on | Rejected reasoning | Source rule |
| --- | --- | --- | --- | --- |
| 1 | Dangerous actions are red according to the three questions of `I4` (loses data, ends something running, revokes access). Sign out, bulk sign out, cancel plan are all red | 23/09, 26/09, 27/09/2026 | "No data is lost, so neutral". "Still usable until the end of the period, so not red". "Many apps keep it neutral" | `rules-state.md` `I4` |
| 2 | The danger button is a faint `rose-500/10` background, `rose-700` text, always visible | 21/09/2026 | Solid red `bg-rose-500 text-white`. Red border | `rules-state.md` `I4`, `components/button.md` |
| 3 | A confirm dialog for a dangerous action is red like the delete dialog. A neutral dialog (grey icon, `primary` button) only when all three questions of `I4` are "no" | 26/09, 27/09/2026 | Using the bulk sign-out dialog and the cancel-plan dialog as examples of a neutral dialog | `layouts/overlay.md` |
| 4 | `outline` is the default button; `secondary` does not replace it | 21/09/2026 | Switch the default to `secondary` to "stand out more" | `components/button.md` |
| 5 | An outline button on hover only changes background to `--button-hover` (`#f1f1f3`), the border stays | 26/09/2026 | Border darkens to `foreground/20`. `hover:bg-background` (melts into the page background) | `components/button.md` |
| 6 | A dropdown-style filter button outside a form has no hover, like a Select | 25/09/2026 | Borrow the outline-button hover: grey fill, then a darker border | `components/choice-controls.md` |
| 7 | Below `sm`, status tabs become a dropdown button labelled "Status:" | 25/09/2026 | A button showing only "All · 32", no label | `layouts/app.md`, "Data table" |
| 8 | Table row with a ticked checkbox: selected and hovered share the same faint background (`I10`). Table rows only: sidebar and folder tree hover `hover:bg-item-hover`, selected `bg-secondary` + `font-medium`, no accent colour, no border (changed 29/09/2026) | 23/09, 29/09/2026 | "Every state needs a different background" for table rows. Applying "same background" to the sidebar and folder tree. Painting the selected sidebar item in the accent colour | `principles.md` `N2`, `layouts/app.md`, `components/tree.md` |
| 9 | Input focus: `--border-focus` border + faint `ring-2` (`I13`) | 21/09/2026 | Make the ring stronger, into a second border ring | `components/input.md` |
| 10 | Radius by height: 40px and up at least 12px, under 40px 8px | 21/09/2026 | Choosing by type name ("menu items are 8px") | `rules-form.md` |
| 11 | Page name `xl`, `2xl` only for the hero | 16/09/2026 | Page name `2xl` on desktop | `budgets.md` |
| 12 | Sliding panel 500ms in, 350ms out | 23/09/2026 | Shorten to 300/200ms to be "faster". `linear` | `layouts/overlay.md` |
| 13 | Scrollbar hidden with a transparent colour, keeping 4px width | 08/09/2026 | `scrollbar-width: none` (content shifts sideways when the bar appears) | `tokens.css` |
| 14 | A tab row that scrolls horizontally on narrow screens: only suggest to the user how to signal "there is more", do not apply one by default | 25/09/2026 | Applying a dropdown or an always-visible scrollbar on our own | `responsive.md` |
| 15 | The required-field `*` is red | 25/09/2026 | A grey `*` to be "less noisy" | `rules-color.md`, `principles.md` |
| 16 | No focus ring on buttons, links, tabs, chips, checkboxes, cards, rows; only bring it back when the request asks for accessibility (`I14`). Exception during review: if the project draws its own focus ring and one Tab stop shows nothing, report it as System drift and fix it with their ring | 28/09, 30/09/2026 | "A missing focus ring fails WCAG 2.4.7", added back during review on seeing a Tab stop with no indicator | `rules-state.md` `I13` |
| 17 | The default is branch `U` (brief, wireframe, pick, build) for every request to build or redo a screen, in Vietnamese or English; other modes only when the request says so explicitly | 29/09/2026 | "Just build a default layout, no questions" for a request that only says "build screen X" | `SKILL.md` question 1, `design-process.md` |
| 18 | The line under the header and under the sidebar top uses `border-border`, the same colour as dividers in menus and popovers | 01/10/2026 | "`--border` on white is almost invisible, the divider stops working", so use `--border-strong` (rule of 21/09/2026) | `layouts/app.md` "App shell with sidebar", `rules-color.md` |
| 19 | Stacked rounded rows with a hover or selected background (sidebar, tree, menu, select, lesson outline) are at least 4px apart (`gap-1`) | 05/10/2026 | "2px (`space-y-0.5`) is enough to separate two backgrounds"; menu items and lesson items kept flush to look tidy | `components/list-row.md`, `layouts/overlay.md` |

When the maintainers settle another rule, add a row here, at the same time as the edit to the source rule.

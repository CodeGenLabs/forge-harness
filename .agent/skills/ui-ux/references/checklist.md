# Checklist

Three gates. Each gate runs at a different moment — do not merge them into one final pass.

Every line here is a mistake that **actually happened**. A line that catches nothing in three
test rounds in a row gets deleted (rule in `SKILL.md` section 4).

---

## Gate 1 — before writing the first line of classes

- [ ] Has **question 1 of `SKILL.md`** been answered: branch `U` (the default for any request that builds or redoes one screen or more), review, rebuild keeping the brand, rebuild in the skill's style, refactor, build directly, or a job smaller than one screen? If not, do not go further.
- [ ] **Has the "Audit: …" line been reported?** Without that line there was no audit, grep or not.
- [ ] Have `package.json` and `components/ui` been grepped — do they use Tailwind? shadcn? Or another kit?
- [ ] **Does the thing about to be built already exist in the codebase?** Grep its name (`Avatar`, `Dropdown`, `Modal`…). If it exists, use it; do not build a second one.
- [ ] **Has the layer 3 (style) audit been run?** If the project has a style other than flat, follow the project, do not ask, mention it in one line at delivery; switching a flat project to glass on your own is wrong (`P1`).
- [ ] If the chosen style is not flat: has its block in `styles.md` been opened and every **Traps** item checked?
- [ ] **Contrast (`P3`)**: body text ≥ 4.5 : 1, measured at **the worst spot** — the light end of a gradient, the brightest area behind glass. Secondary `/50` text is the first to fail.
- [ ] Following the project's style but **not its mistakes**: still only one primary button (`I3`), still one accent colour (`M3`).
- [ ] **No `package.json`?** Then what code is about to be delivered — `.tsx` or plain HTML? Delivering JSX to a non-React project is broken.
- [ ] Have existing tokens been grepped (`--primary`, `--brand`, `font-family`)? If they exist, use them; do not ask.
- [ ] **What language will the copy be written in** — have i18n and existing labels been grepped (`T24`)? What language is the user writing in, so the reply uses that language (`T27`)?
- [ ] Does the request contain any ambiguous word (table, card, list, frame, page, calendar)?
- [ ] Open-ended request: has the **full default set of blocks** from the layout file been built, or is it paper-thin (`S5`)? Do not ask about scope.
- [ ] Branch `U`, wireframe: does the sample data include items whose state is derived from time (late, overdue); do any blocks overlap text; do the sidebar and `sticky` panels still stick on scroll; does the toolbar fit on one line at 1280 (`U3`)?
- [ ] Branch `U`: has the **chosen wireframe option** been built, or something invented (`U4`)? Build-directly mode: build the option you would recommend, report one line "Layout: … because …". Jobs smaller than one screen: the **default layout** in the layout file, report one line "say so if you want a different style".
- [ ] Project already has a UI (branch `U` or rebuild): does the delivery message have a **`Shape:`** line that went through the table "Shapes come from the skill, not from old CSS" (`review.md`)? Do dropdowns, checkboxes, card borders, scrollbars, header buttons follow the skill's templates, or is the project's old CSS still there?
- [ ] Same case: does the delivery message have a **"Still seen"** section (`U4`)? Have the things the build may not fix on its own (cutting information, consolidating decorative colours, multi-coloured badges competing with the price) been listed as numbered lines, or left as is in silence?
- [ ] Request covers more than one screen? Has the **primitives contract** (`system.md` `D1`) been settled at `U4`, before the first screen?
- [ ] The user said "I don't know what UI I want yet" → has direction A been built and B, C mentioned?

---

## Gate 2 — build finished, before reporting

- [ ] Have the **twelve tests `N1`–`N12`** (`principles.md`) been run? Anything without its own line in this checklist follows them.

### Scope

- [ ] Compare with the request: is there any section **you added yourself**? If so, remove it.
- [ ] Is there any number or policy you invented that should have been left as `[to fill]`?
- [ ] Is there any line left as `[to fill]` that should have been filled with a fake number?
- [ ] Does the project already have a component that you rewrote?

### Colour

- [ ] Count the accent colours on the screen. More than one, cut (category tags `M8` and entity identity colours `M34` do not count). If the app has user-created projects, boards or categories whose names are still plain grey, add colour dots per `M34`.
- [ ] **Does the screen use the accent colour anywhere at all?** None means undecided, not minimal (`D5`).
- [ ] Is any block filled with a colour background just to categorise? Categorise with icon + text (`M5`).
- [ ] Grep for hex codes. They may only appear in the brand-swap block at the top of the file.
- [ ] Does every hex code have exactly 6 or 8 characters after `#`? Anything else is CSS that dies silently.
- [ ] Does the brand block match `tokens.css` **character for character**?
- [ ] Is there any `text-muted` text on a grey darker than the page background (`--secondary`, `foreground/5`–`/8` overlays, `--background-hover`)? If so, change it to `text-foreground/70` (`styles.md`).

### Borders, shadows, blocks

- [ ] Is there any `shadow-*` on a block **inside the page**? Shadows are only for modals/dropdowns (`M15`); the only in-page exceptions are the selected cell of a `segmented` tab and the switch thumb (`shadow-sm`).
- [ ] Is there any border token invented outside `--border`, `--border-strong`, `--border-focus`?
- [ ] **Scrollbar**: has `::-webkit-scrollbar` been grepped in the root CSS to find the `tokens.css` block, and is `ScrollbarAutohide` mounted at the app root? Open a scroll area (page, sidebar, long dropdown, horizontally scrolling table): a fat default grey bar means the block is missing (`I18`). Even a project with its own tokens must copy it.
- [ ] Are there two bordered blocks standing flush with no gap, forming a 2px line (the last row's `border-b` stacking on the frame border, grid cells, button groups, header + toolbar)? Only one side keeps the shared edge: `divide-*` on the parent, a `gap-px bg-border` grid, `border-l-0` on following buttons (`F26`).
- [ ] Is there a `--border` line sitting straight on the grey page background (footer, title band, `<hr>`)? `--border` is lighter than the grey background and shows as a faint smear: drop the line, separate with whitespace, or switch to `border-border-strong` (`M14`).
- [ ] Is there any place with one card per item? Group them into one frame split by dividers (`F3`).
- [ ] A card with only a title and no header button: does it still have `min-h-10`? If so, the title sits farther from the top edge than the content does from the bottom, and the card looks top-heavy (`components/card.md`).
- [ ] Are the title row and the "View all" button **inside** the frame?
- [ ] Does a highlighted element carry more than one marker (badge + border + larger)?
- [ ] Is a table wrapped in a card?
- [ ] **Table**: hover over a row — is the hover background the same colour as the page background? It must be `--surface-hover` (`I10`). Is the status column a coloured badge (`M7`)? With 3 or more actions, or a delete, have they been grouped into a three-dot button (`I11`)? Are status tabs cells with a `--surface-hover` background and a thin border, not black chips?
- [ ] **Table grouped by status**: glancing at the group rows, can you tell the groups apart, or are all three the same grey pill? Do the group rows and kanban column headers share icon + name + count (`M7`, `D2`)? Within a group, are rows sorted by one key, with an arrow on the column currently sorted? Are people's names cut off at the given name while the title column still has room? Is any short column squeezed down to one word (missing `whitespace-nowrap`)? Does collapsing a group wrap a `<tr>` in a sliding `<div>`? Hover over an inline-edit cell in the hovered row: does the cell stand out, or is its background the same as the row's? Do empty cells in every column use the same `—`? Does the calendar opened from a due-date cell have "Clear date", or once set is there no way to remove it? Is "Clear date" a full-width row like a menu item, left-aligned, not red (`I4`: clearing a date loses no record), or a small lonely button? Does the skeleton include group rows? Is the kanban view mislabelled "Table"? At 375, 768 and 1024px (sidebar open) does the table scroll horizontally, are the ⋯ button and the due-date column inside the frame? In a narrow frame is the assignee reduced to an avatar, and below `@2xl` does it become a row with a two-line `text-pretty` task name (no single orphan word on line two), with empty fragments dropped entirely rather than left as "— —" (`layouts/app.md`)?
- [ ] **Empty kanban column**: is it a dashed border with no background, or a solid grey slab heavier than the cards (`components/empty-state.md`)?
- [ ] **Kanban board at 1366 and 1440px, sidebar open**: are all four columns visible, or is the last column a few px short at the right edge? Does the scroll frame have `scrollbar-clean` (it must not)? Is the ⋯ button on the last row before the avatar, measuring 32×32, shown only on hover / Tab into the card? Count task names cut with "…" in a 248px column: more than one or two cards means something is holding space to the right of the name? Is there an "Add task" button on the page and a `plus` at the top of each column? Try all three drag paths: mouse (4px threshold), 250ms press-and-hold, keyboard Space / ← → / Enter / Esc announced via `aria-live`; dragging to the edge auto-scrolls the board; lifting by keyboard into the last column brings that column fully into the frame, not under the faded edge (`layouts/app.md`, "Drag and drop cards").
- [ ] Are radii within the four steps, and is no plain text link without a background rounded by mistake?

### Buttons and states

- [ ] Is the default button an **outline button**, or is it an accent fill? Icons only on buttons whose glyph names the action exactly; form buttons and modal buttons are text only (`I1`)
- [ ] Is there exactly one accent-filled button per group?
- [ ] Does any secondary button look disabled? Is there enough contrast between text and background?
- [ ] Are "View all" / "Read more" (going to another screen) buttons with a hover background? They must be `h-8` text links with no horizontal padding, underlined on hover, text flush with the right edge of the content, no arrow icon (`I7`). Only load-more-in-place ("Show older activity") is a `ghost` button.
- [ ] **Hover over a row: does any child element disappear?** (`M18`)
- [ ] Hover over a row: does the hover background hug the text? It needs padding on all four sides.
- [ ] Screen with only **one** card in the middle of an empty page? Then the card must have **no border** (`M29`), and never both a border and a shadow.
- [ ] Is **Sign out** at the end of the menu after a divider, neutral by default, **red on hover** like a delete item (`I4`)?
- [ ] A standalone **delete button**: `rose-500/10` background + `rose-700` text right from the default state, no border, not solid red (`I4`)? A delete **item** in a menu: on hover do the text, icon **and** background all turn red? An icon still grey means `group` is missing. Is the red text `rose-700`, or bright pink `rose-500` (3.2:1, fails contrast)? With Radix, does moving with the arrow keys also turn it red (`data-[highlighted]`)?
- [ ] **A switch is only for things done by flipping it.** If turning it on requires scanning a code, entering a password, confirming (two-factor auth, custom domain, paid plan), is it a status row + a button that opens the flow (`components/choice-controls.md`, "Settings row")?
- [ ] Is a confirm dialog neutral (grey icon, `primary` button, the named exception of `I2`) only when **all three questions of `I4` are "no"** (no data loss, nothing running gets ended, no access is cut), such as bulk re-sending invites or bulk emails (`layouts/overlay.md`)? "No data loss" alone is not enough: sign out and cancel plan are still red.
- [ ] **Security page**: is "Enable two-factor authentication" a `primary` button (`I2`: the page's most recommended action)? Is the bulk sign-out button red from the start but the same `h-11 md:h-10` size as the in-row "Sign out" buttons (one button size for the whole page), while in-row buttons are red only on hover (`I4`, `layouts/app.md`)?
- [ ] **API keys page** (`layouts/app.md`): are row actions behind a `⋯` button (Rename, Revoke key / Delete), not outline buttons repeated on every row? At 375px does any `·` separator in the secondary line fall to the start of a line (it must split into two groups by meaning)? Do dates in the current year drop the year ("Used 07/09", not "07/09/2026")? Do expired keys have a badge without repeating the expiry fragment? Does the create dialog default to "Read only" and a specific expiry, not "Never expires"? Is the key-reveal step inside the same dialog, and does clicking outside not close it?
- [ ] **Billing page** (`layouts/app.md`): is the plan one row (plan name `text-base font-semibold`, price and "Renews on …" as two separate secondary lines), not split into tall label–date rows like rows with fields? Is there a payment method section (masked card number, card expiry, "Change card")? Is "Cancel plan" in the Danger zone at the end of the page, with a faint red background (`I4`, standalone button), not next to "Change plan"? Is the cancel confirm dialog red like a delete dialog (no grey icon, no black button)? When a charge is failing, has the plan block dropped the "Renews on …" line, and do the Danger zone text and cancel dialog no longer promise "use until the end of <renewal date>"? Is the "Update card" button in the banner a white outline button, not `primary`? Does the failed-charge case have an error banner at the top of the page with an "Update card" button, not just a red badge on the invoice row?
- [ ] **Clicking a button makes its own row disappear** (sign out a device, delete a row, bulk remove via a confirm dialog): what is `document.activeElement` afterwards? `<body>` is a bug (`I31`).
- [ ] Is red using the right shade (`M30`)? Errors are `red`, dangerous actions on hover are `rose`. No `rose` borders or banners.
- [ ] Dividers in dropdowns and cards: do they touch both edges of the block, or are they inset by the padding (`F25`)?
- [ ] **Nested radii (`M19`)**: outer radius = inner element radius + container padding? Default dropdown `rounded-2xl` + `p-1` + items `rounded-xl` (`layouts/overlay.md`). A wide command palette uses `p-2` + items `rounded-lg`. Inner equal to outer gives bulging corners.
- [ ] **Notifications panel**: is there a "Mark as read" button in the header? Are read items lighter than unread ones (not just missing the dot)? Does switching to an empty tab collapse the panel's height? Are long titles clipped at 2 lines? Is the panel's top edge 8px from the header line, or does the line poke into the rounded corner (`layouts/overlay.md`)?
- [ ] **Record panel with tabs** (customer, project): when the body scrolls, does only the name row + ✕ stay put, the tabs stick to the top, and the status and button row scroll away? Is the name the heaviest text in the panel, or are the stats larger than the name? Are the stat cells **one 2×2 frame** of `text-lg` numbers, or four separate cards of `text-3xl` numbers? Is the comparison period written once or repeated in every cell? For a customer with no orders, is there still a grid of zeros? Tabbing to the tab row: no grey background, no ring (`components/small-controls.md`)?
- [ ] **Record detail page**: is the first tab the main child records (a customer's Orders, a project's Tasks), as a compact table linking to each record, or do you have to wade through the Activity tab? Do child-record tabs have counts, while Messages / Activity tabs are plain text? Are email and phone number clickable with a copy button next to the value, or are "Call", "Copy email" hidden in the ⋯ menu? Is an order ID a link wherever it is mentioned? If the "Delivered orders" cell (12 months) and the "Orders" tab (lifetime) show different numbers, does the cell label say "· 12 months"? Does a long email wrap after the `@`, or break mid-word? Is "View all" at the end of the table left-aligned on the same side as "Show older activity"? For a customer with no orders, has the stats row been dropped, or is there still a "No orders yet" frame duplicating the empty tab? Is the "Order delivered" activity row a grey circle, not a column of green circles (`timeline.md`)? For a wrong ID, is there a "Not found" page with an `<h1>` and a way back to the list (`layouts/app.md`)?
- [ ] **Settings / personal profile page**: for rows with hint or error text under the field, is the label still centred on the field, or has it dropped to between the field and the text (missing `sm:items-start` on the row)? Is the large avatar on the page the same colour as that person's own avatar in the header? Does clearing the name field turn the avatar into "?" (it must keep the initial of the saved name)? Are the `*` in the label and in the note line the same red? Multi-line Email row: is the label aligned with the first line, or drifting to the middle? Are all states present — with photo (Change photo + Remove photo, both `outline`, Remove photo not red because there is Undo (`I4`), not a grey ghost that looks disabled), uploading photo, email awaiting confirmation? Does the email in the delete-account dialog at 375px wrap after the `@`, or break mid-domain (`layouts/app.md`, "Personal profile page")?
- [ ] **Breadcrumb** (`components/breadcrumb.md`): parent levels only, not repeating the text of the `<h1>` right below? Does each item's text match the destination page's name? One line, no wrapping; from 4 parent levels, is there a "…" button opening a menu, and does that button look like a text item (no background cell, the gap to the › separator equal to the text's gap)? Tabbing to an item: underlined text, no ring (`I13`)? At 375px only "‹ Parent" at 40px tall? Placed in exactly one spot, the header or the top of the page?
- [ ] **Settings area and notifications page**: does clicking "Settings" in the sidebar and in the header breadcrumb go to the first subpage, or a blank page? Is there an `underline` tab row linking the settings pages (Profile, Notifications, Security), with tabs as links carrying `aria-current`? Do subpages still have their own page header repeating the tab name? Are error and lock-reason lines in a settings row the same `text-sm` as the other rows' descriptions? Does the "Notify you when" section say clearly whether it applies to the bell, or contradict the line "The bell always receives everything"? Does the description of a switch that opens a section point to what it is hiding ("these hours") (`layouts/app.md`, "Settings area with multiple pages", "Notification preferences page")?
- [ ] **Members page**: do editable role cells have an always-visible `ChevronDown`, with locked rows (owner, yourself) as plain text without an arrow, or do you have to hover to find out it is editable? Is there a Status column repeating "Active" on almost every row (only invites get a "Pending" badge next to the email)? Is role filtering one dropdown next to the search field, or an extra row of chips under the tab row? Is an invite's email cut off at the domain? Does the invite modal accept multiple emails (tag input), and do duplicate emails distinguish "Already a member" from "Invited …, not yet accepted"? Does the bulk bar have "Change role" (`layouts/app.md`, "Members and permissions page")?
- [ ] **Record modal with previous / next buttons** (order detail): is the modal anchored to the top or centred vertically? Clicking Next order to an order of different height, do the ‹ › buttons stay under the cursor? At the first and last, is the button faded but still holding its place, and does focus move to the other button? Is only the ID part `font-mono`? Does money align to one right edge, does the subtotal count by quantity, and do the additions and subtractions add up (`layouts/overlay.md`)?
- [ ] **Scroll areas inside overlays** (select, long dropdown, command palette): before hovering, does the bottom edge cut through an item (showing about half of it)? Cutting exactly at the boundary between two items looks like the end of the list. On hover (without scrolling), does the scrollbar appear? Appearing only on scroll means the old scrollbar CSS is in use (`I18`).
- [ ] **Sidebar**: white background, not the same as the page background; with a grey content area there is **no `border-r`** between sidebar and content; hover `hover:bg-item-hover`, the selected item one step stronger `bg-secondary` + `font-medium`, no accent colour, no border (settled; "hover and selected share one background" now only applies to table rows with a ticked checkbox); on hover, icon and text both get stronger; counts are plain `text-muted` numbers, no pill, no brand-coloured badge (`I15`); group labels in uppercase, no dividers between groups (only whitespace + label), the profile is a borderless row with a `ChevronsUpDown` icon, many groups can be collapsed; the scrollbar auto-hides (`I18`); truncated long names show a tooltip with the full name on hover, even when the sidebar is open; below `lg` the sidebar is a panel sliding in from the left, overlay `bg-black/15`, 500/350ms sheet easing.
- [ ] **Collapsing the sidebar**: collapses to a `w-16` icon strip; **items visible when open stay visible when collapsed**, closed groups stay closed; group labels only get `opacity-0` + `inert`, keeping the row height, **replaced by a short `w-4` dash centred on the icons**; on short screens the edge of the nav area fades on the side that still has hidden items; the corner dot on an icon only for counts needing action, the same strength as the count when open; the selected item stays highlighted and is scrolled into view; the scrollbar is hidden when collapsed (still scrollable); when opening/collapsing, icons, logo and avatar **stay still** (no `justify-center`, no padding change), text is not removed from the DOM but gradually clipped and faded; every icon has a tooltip with its count; focus per `I13` (`layouts/app.md`).
- [ ] **Sidebar footer**: the profile is an `h-10` row with **no border**, avatar without a border, `ChevronsUpDown` icon at the right edge, the whole row is the button that opens the menu; when collapsed, hover shows a ring around the avatar, not a filled square; the email at the top of the menu is one line, cutting only the part before `@`, the domain intact; the menu is as wide as the row; Sign out at the end of the menu, red on hover (`layouts/app.md`). **Reload the page and open it right away the first time**, and collapse/expand the sidebar then click again: does the menu sit right against the button, or drift to the top of the sidebar? A hand-built menu that measures height before it has a width has this bug (`layouts/overlay.md`).
- [ ] **Submenu / account menu** (`layouts/overlay.md`): when it flies out, is the first row aligned with the parent item, does the parent item keep its highlight, and does moving the mouse diagonally across not close it? At 375px does the submenu **replace** the parent menu with a `‹` back button, or drop down below the parent item? Is any account row more than two lines (the email must be one line, cutting the part before `@`)? Does the top of the menu opened from the avatar repeat the avatar? A header with an avatar while the sidebar footer still has a profile row means two entrances to one menu.
- [ ] **Chat panel** (`components/chat.md`): do answers have a robot avatar circle (remove it)? Are tool step names smaller and lighter than the answer? Opening the list of running tools: are there still two spinners? A tool failed but there is still an answer: does it open automatically, with a red "1 error" on the top row? Does the step description repeat the number the answer is about to say? Does a stopped answer have the Copy / Regenerate row? Are suggestions outline buttons with bold text, or grey background with grey text that looks disabled? Are suggestions longer than one line, or wider than the answer column? Does a new chat show starter suggestions, or "No messages yet"? Empty composer: send button faded `opacity-30`, button corners parallel to the field's corners (`M19`)?
- [ ] **Move the mouse slowly from the left edge to the right edge** of every menu item, sidebar link, clickable row: does the cursor stay a hand the whole way? One change means the hit area has a gap (`I29`).
- [ ] Tailwind v4: does `<button>` have `cursor-pointer`, or has the base CSS restored it (`W7`)?
- [ ] **Tab through buttons, tabs, checkboxes**: no outer ring anywhere (`I13`)? **Inside menus**, the focused item changes background like hover.
- [ ] **Tab through inputs and selects**: is there a `--border-focus` border **and** a faint `--ring-focus` `ring-2` ring? `ring-4` is too thick (`F20`). An open select also keeps the border + ring.
- [ ] **No native browser controls left** (select, date / time inputs, checkboxes, radios, sliders, file inputs), including in closed dialogs, sheets and popovers, including when the old app uses styled native ones? Only selects and date inputs that appear only on mobile may stay native.
- [ ] **Checkbox / radio / switch** (`components/choice-controls.md`): default size 20px (switch 24×44), not 16px? Choice cards: selected has border + ring, Tabbing to it adds no extra ring? When disabled, does the label fade too? Does a radio group have one option preselected and a `<legend>`? Is the group laid out in one row or one column, not a 2×2 grid (a Low → Urgent scale read in a Z pattern)? At 375px is each option a 44px-tall row clickable across the whole row?
- [ ] Tabbing and hovering in a menu at the same time: are **two items highlighted at once**? Only one is allowed (`data-[highlighted]`).
- [ ] Hover over the **primary button**: does it change colour? The `primary` button is where hover is most often forgotten (`I9`).
- [ ] **Click the label text**: does the field get focus (`for`/`htmlFor`)? Does the cursor become a hand?
- [ ] **Click the empty space to the right of the label text**: the field must **not** get focus. Focus means `w-fit` is missing (`I26`).
- [ ] Form with a password field: is there a show/hide button, and does it have `type="button"` (`I27`)?
- [ ] Is there any placeholder that just repeats the label ("Enter your email")? If so, remove it (`T25`), except on standalone sign-in and sign-up screens.
- [ ] Read every error message: does any of them **repeat the wording** of that field's own placeholder or label? If so, remove it.
- [ ] Is the red text under a field really an error, or a **hint painted red**? Hints are grey and shown up front.
- [ ] **Auth screens: has one line been reported** about "forgot password" / remember me / social sign-in? Building with the defaults is fine; finishing in silence is not.
- [ ] **New project with no logo yet**: is the top of the sidebar an SVG mark in an accent-colour tile, or still a letter tile? Is the mark still recognisable at 16px, and has the framework's default favicon been replaced? (`components/logo.md`)
- [ ] Do the sign-in and sign-up screens have the product logo, a Google button, placeholders? Does sign-up have a redundant "Confirm password" field? (`layouts/form.md`)
- [ ] Forgot-password flow: does the code-entry step confirm whether the email has an account? Does an expired session still leave the password field and Save button under the error block? (`layouts/form.md`)
- [ ] OTP screen: does clicking Confirm before all six digits are entered show an error, or nothing?
- [ ] OTP screen: does "Change email" go back to the form with the data prefilled? Does clicking "Resend code" show "New code sent" (`role="status"`)? On a wrong or expired code, are the six cells cleared and the cursor put back in the first cell?
- [ ] Standalone pricing page: centred page header, page title `sm:text-3xl` (not smaller than the prices)? Does the stacked plan list have `max-w-lg` (open it at 768px and check whether the cards stretch to 650px)? Is the FAQ an accordion (`components/accordion.md`) in a `max-w-3xl` frame, with the longest question on one line on desktop? Does `h2` use the same font as `h1`? Is the line under the price drawn with `--border-strong`? Is the featured plan a `--primary` card with a white button? Plan buttons `h-12`?
- [ ] With an accordion: does it slide with `grid-rows` (no `<details>`), and do closed items have `inert`? Hovering the header: no grey background, only the chevron gets stronger? Tint the button, the wrapper and the content: is the button even on both sides even when open, does the content share the button's `px` and fill the wrapper (no `max-w`, no separate `pr`)? Do closed items not leak text while sliding? Header `text-pretty`? (`components/accordion.md`)
- [ ] Form with a collapsed "Advanced settings" section: is it a line of text with a chevron right after it, no frame (a frame nested in a card looks like a select when closed)? Do the fields inside share the left edge and width of the outer fields? Is the block clipped with `overflow-y-clip` (not `overflow-hidden`, which clips the focus glow on both sides)? On submit with an invalid field in the section, does the section open itself and put the cursor in that field? Is the private / public choice outside the section? (`components/accordion.md`)
- [ ] Multi-step form (`layouts/form.md`, style C): does the horizontal bar have labels only, no descriptions repeating the lead text in the card? On narrow screens is the line above the bar only "Step 2 / 3" when the card already has the step title? Are the circles, connectors and segments not yet reached `bg-secondary` (open it on the page background and check whether circle "3" is still visible)? Is the last step `flex-none`, with the bar spanning the full width of the card? Is "Optional" said exactly once? Does the confirmation step have an "Edit" link per group, with group titles in `font-semibold` clearly different from the value style (check at 375px)? Clicking Next with empty fields, do fields auto-filled from other fields (slug) turn red too?
- [ ] Is the "or" divider drawn with `--border-strong` (`--border` dissolves on a white card)? Is the eye button `size-10`? Submitting a valid form, does it move on, or do nothing? Does the next step show exactly the email just typed?
- [ ] Does every screen in the auth flow open with the cursor already in the first field? Does the new-password form have a hidden `username` field (`I28`)?
- [ ] Is "Forgot password?" on the same row as the label? Below the field it **competes for space with the error message**.
- [ ] Is "Forgot password?" faded? Faded reads as disabled (`I8`).
- [ ] From the email field, does Tab go straight to the password field, or land on "Forgot password?" first? The link must come after the field in the DOM.
- [ ] Wrong email or password: has the password field been cleared with the cursor in it? Does the error block have `role="alert"`?
- [ ] Buttons and inline-edit fields in a table row: on hover do they stand apart from the hovered row background (`bg-foreground/8`, not `/5`, `I10`)? For columns with arrow buttons (role, status), are the arrows aligned in one column (buttons as wide as the longest label)?
- [ ] Outline buttons standing directly on the page background: does hover dissolve them into the background? Hover only changes the background to the solid `--button-hover` (`#f1f1f3`), the border stays; `bg-background` or a `foreground/5` overlay dissolves, a darker border is heavy. Measure the button's background pixels against the page background; do not trust the class. Buttons with an arrow that open a list of choices ("Role ▾", "10 per page ▾") have **no hover**, same classes as a Select field. When open, does a dropdown filter button have a border + ring like a Select field (`components/button.md`)?
- [ ] If the project has its own colour language (the "colour" line in layer 3 from 3 files, or `--chart-*` present), is the new screen tinted the same way, or pulled back to grey and out of place among the old screens? Did a refactor accidentally neutralise their colours? Do categorical charts with 5+ groups give each group its own hue, do the dots in the table match the bar colours, at most 6 hues + "Other" (top of `principles.md`, `components/charts.md`)?
- [ ] Confirm dialog at 375px: do the consequence text, the retype-name field and the two buttons share the same left edge, or is the body still indented 56px after the icon, with the field narrower than the buttons (`layouts/overlay.md`, Confirm dialog)? The probe reports "Input misaligned with full-width button".
- [ ] Description under a modal / confirm dialog title: `mt-2` from the title with `text-sm/6` lines, or `mt-1` + 20px lines making Vietnamese diacritics touch the line above (`T30`)?
- [ ] Does the toast slide in from the edge of the screen and slide out when time is up, or pop? Rendering with `{toast && …}` loses the exit motion. Is an email in a toast on the lower level, wrapping after `@` (`layouts/overlay.md`, Toast)?
- [ ] Does the password field use `••••••` as its placeholder? It looks exactly like a typed password (`T26`).
- [ ] Form with a minimum length requirement: is it written out in the hint line, or reported only after a wrong entry?
- [ ] Field with a maximum ("Up to 120 characters"): at ~80% does a counter appear on the hint line, right-aligned? Does going over turn red, or stay silent? Does a `maxlength` cut off the end of pasted text (`layouts/form.md`, "Field with a character limit")?
- [ ] Does a modal with inputs still close when clicking outside? (`I20`)
- [ ] If a modal has had dismiss removed, **is there another way to close it**?
- [ ] Are all three states present: loading, empty, error? Is the skeleton **the right shape** for the content? Changing filter or page: is the old data still there with a thin bar on top, or does the whole table become a skeleton again? Does fast data make the skeleton flash (wait 300ms, hold 500ms)? Do toggles and card drags have spinners (they must change immediately)? Does an empty "No … yet" message flash while waiting? A second load fails: do tabs and chips revert to match the data on screen, or does the new tab light up over the old table? Background jobs: is there still a spinner in the button alongside a progress toast (`components/loading.md`)?
- [ ] Do lists over 25 rows have pagination, and do they show the total? At 375px does the count text wrap onto a second line next to the nav (below `sm` only the total remains, `components/small-controls.md`)?
- [ ] Pagination: is the nav on the right of the same row at every page count? Does the current page look like an input? With one page is the nav hidden, and with 0 rows is the footer hidden?
- [ ] **File upload** (`components/file-upload.md`): only uploading files have a bar (`h-1`), finished and failed files have no bar and no %? Do failed files have both Retry and ✕? While a file is dragged in, does the border get moderately stronger, not black dashes? When a row changes state, do the rows below jump? Does a long name cut in the middle keep the `.pdf` extension? Does a middle-cut name keep a few final characters, not become four dots "….docx"? Are file icons the same paper-sheet shape, with borders not clipped by a circle at the corners? Without permission, is the whole upload area hidden, not built as a locked box? Locked box: is the title the reason, a different background from the drag-in state, with a way-out button instead of a faded button?
- [ ] Toast: as wide as its text? Is the action a button with hover, pushed right alongside ✕? Has a long message been split into two levels instead of breaking into three lines? (`layouts/overlay.md`)

### Text

- [ ] Is a block's title larger than the text inside it by **at least one step**?
- [ ] Does `body` have `antialiased`?
- [ ] Is any line of text longer than 75 characters?
- [ ] Does any title leave one word alone on its last line, or break in a way that changes meaning?
- [ ] Is any description line being `truncate`d? Descriptions wrap.
- [ ] Do numbers in columns have `tabular-nums`?
- [ ] Is the font loaded, or falling back to `system-ui`?

### Content

- [ ] Are there emoji in titles, greetings, or standing in for icons?
- [ ] Is there redundant instructional text ("Click to save", the word "Yes" next to a tick)?
- [ ] Are there em dashes in prose, in any language (`T18`)?
- [ ] English copy: sentence case, correct plurals, money, numbers and dates following the locale, no labels translated word for word from Vietnamese (`T27`, `T28`, `T29`)?
- [ ] Is the delivery message in the same language as the user, and has no Vietnamese template sentence slipped into an English reply (`T27`)?
- [ ] Do the Google or Apple sign-in buttons have the original logos?
- [ ] Has each item been given a different icon by invention, or do three items share three identical icons?
- [ ] Overview screen: are counts per period shown as bars (`charts.md`, "Bars or lines")? Is any progress bar in a list tinted amber (it must be `bg-primary`, only the "overdue" group gets colour)? Is "Recent activity" borrowing the timeline template (it must be avatar + one sentence, 5 items)? Do the two grid columns end at roughly the same height? Does a new workspace have a "Getting started" frame (or a welcome block with a "Create project" button), not five "No … yet" frames?
- [ ] **Getting started** (`layouts/app.md`): only in one place, with no extra "Welcome" page repeating the overview's welcome block? Is the left circle a dashed tick box, not a number? Is only the next step open by default, its button below the why-sentence, the only solid button? Do locked steps have faded buttons (they must not)? Are completed step names struck through (they must not be)? Is there a hidden `X` button, aligned with the chevron column? When everything is done, does the frame collapse, not print five completed rows? Open a step and measure: is name → why-sentence smaller than sentence → button (the sentence must cling to the name)? Is the frame 24px from the grid below, with the stats row's caption not floating between the two blocks?
- [ ] **Is any sentence identical in every cell, every row** ("vs 2025" in four cells, "No previous period" in four cells, `/2026` on every timestamp)? Pull it out and write it once, or drop it (`N3`, `T16b`).

### One grep pass

```bash
grep -nE "gradient|backdrop-blur|shadow-(xl|2xl)|scale-1|text-transparent|border-dashed|<details|<summary" <file>
grep -nE "(^|[\" '`:])-(m[trblxy]?|space-[xy]|translate-[xy]|inset|top|left|right|bottom)-" <file>
# Projects using plain CSS / CSS Modules / styled: negatives sit inside values, the line above does not catch them
grep -nE "(margin[a-z-]*|inset[a-z-]*|top|left|right|bottom|translate|transform)\s*:[^;]*(\s|\(|:)-[0-9.]" <file.css>
```

Must be clean, except exceptions written into the rules. `<details>` / `<summary>` have no exception: they open/close instantly and cannot be animated (`I30`).
The second and third grep lines (negatives, `N11`): every result must have a reason comment right above it; if not, redo it with padding, `gap`, alignment. Only grep the files you just wrote or edited; the project's existing negatives are not this build's job.

---

## Gate 3 — the torture round, **mandatory** after every build

**Open the real page; do not answer this gate by rereading the code.** Reading code only shows
what you meant to write, not what the browser draws.

0. [ ] **Run `scripts/probe.mjs`** (next to `SKILL.md`) on exactly the route just built:
   `node <skill folder>/scripts/probe.mjs http://localhost:<port>/<route> --sweep`.
   The script opens the page at 375, 768, 1024, 1280, 1440, 1920px, screenshots each width, then drags the width from
   1440 down to 375 in 20px steps to catch bugs that sit between two widths. It measures: horizontal scrolling, console
   errors, text contrast, frames hiding text, text wrapping inside buttons, text truncated to fewer
   than 10 characters, same-kind elements differing in height by 1–4px, text in the same column misaligned, hit targets
   under 32px on touch screens, hover causing layout shift, the page
   scrolling itself on load, punctuation falling to the start of a line, separators (›, /) unevenly spaced on both sides. At 375px it clicks open menus,
   selects and sheets by itself, then screenshots and measures edge overflow and overflowing screen height. Dynamic checks (Tab, hover, click, overlays)
   only run at 375, 768, 1280; other widths measure the static page: dynamic checks at 1024, 1440, 1920 almost never
   find extra bugs but make the run half again as long.
   - If the dev server is not running, start it in the background with the project's dev command. If playwright is not installed,
     install it into a temp folder using the command the script prints, **not into the project**.
   - **Building from a chosen wireframe** (branch `U`): add `--wireframe "<option link>&mau=mau"`:
     the probe compares spacing, font size and weight, icon size, colour and text with the wireframe at 1440 and 375; differences
     go into the `P` list (`design-process.md`, `U4`).
   - If states live on another route (`/states`, an empty page), run it on that route too. If the project
     has dark mode, also run `--dark`.
   - **Fix and rerun until the "Items to reconcile" section at the end of the report is empty**
     (the list of codes `P1`, `P2`… are Broken-grade bugs the machine measured, `V1` in `review.md`), at most
     **three rounds**. From round two on, add `--dynamic-widths` as printed in the "Next fix round" line at the end of the report
     (widths that still have dynamic bugs, or `none`): the static part and `--sweep` still measure everything, only the dynamic checks are cut at widths
     already clean. Also fix the other items the probe prints (per the skill's style), because this is your own
     build. Any `P` code remaining after three rounds, or left on purpose (e.g. small hit targets in a dense
     table), gets written out at delivery with each code and its reason. No code may disappear silently.
   - **Open every screenshot and look at it**, reviewing against the twelve tests (`principles.md`). The script can only measure
     what can be measured: "today is bolder than the selected date", "the Today button is separate from ‹ ›" only
     the eye can see.
   - If the page cannot be opened (no dev server, the browser will not run), say one line at delivery:
     *"I could not open the real page because …, narrow screens have not been checked."* Do not stay silent and
     treat it as checked.

Then do six things on the real page (temporarily edit the fake data to test, and restore it afterwards):

1. [ ] Shrink the window to **375px**. **A page that scrolls horizontally is broken.**
2. [ ] For any area that scrolls horizontally, **scroll all the way right** — does the last element touch the edge?
   Admin tables at 768px and 1024px (sidebar open): do they still scroll horizontally, is the row's ⋯ button inside the frame? Below `@4xl`, hide secondary columns (company, created date) before allowing scroll (`layouts/app.md`, Data table).
3. [ ] Change a title into a **200-character** sentence.
4. [ ] Change one number to `0`, and one number to `1.284.500`.
5. [ ] Delete all the data in a list and look at the empty state.
6. [ ] If there is dark mode, review everything again in dark mode.

Also check at 375px:

- [ ] Do flex and grid items containing dynamic content have `min-w-0`? (`T13` — the number one cause of horizontal scrolling)
- [ ] Does any grid keep 2 columns on mobile? It must drop to 1 column, **except stat-cell rows**: 2×2 on mobile, and any number longer than 138px (full amounts in the billions) gets abbreviated or that row drops to 1 column; an odd number of cells means 1 column (`charts.md`).
- [ ] Does a chip row drop a single chip onto the next line? It must scroll horizontally. Except active filter chips (click to remove): from `sm` they wrap, and "Clear filters" is always visible.
- [ ] On desktop, does a horizontally scrolling row with a hidden scrollbar have arrow buttons on the side with hidden items? A regular mouse cannot scroll horizontally.
- [ ] Does a board or timeline wrap into 2 rows? It must scroll horizontally inside the frame.
- [ ] At 375px, does every main row action (buttons on the row, the detail panel) still have an entry point, or are they all hidden at once (`R11`)?
- [ ] Are table columns squeezed? From `sm` up, scroll horizontally inside the frame, with `min-w`, **the first column pinned**; below `sm` an admin table becomes a list of rows (name + email, badge + main number), no horizontal scroll. Do horizontally scrolling tab/chip rows have a faded edge on the side with hidden items (`R10`)?
- [ ] Does the page have **exactly one `<h1>`**? List pages: the name on the header bar is the `<h1>`, the content area does not repeat the name. Pages with their own page header: the `<h1>` is in the page header, the header bar shows only the parent level.
- [ ] **Quantity field − +**: on hover over a button, is the background an inset rounded square, or a slab covering edge to edge that cuts across the frame midway? Is a known limit (stock) set as `max` so the + button fades there, or can it still be clicked and only then report an error? Does the hint line state the real limit ("8 items left"), not "From 1 to 99" (`components/quantity-input.md`)?
- [ ] **Inline-edit name**: is the name text aligned with the parent link and the description line, or indented by the frame's padding? Click a long name: does the text stay still, does the line count stay the same, or does it wrap because the ✓ ✕ buttons eat the space? Is the error text aligned with the text in the field? Does clicking Cancel with the mouse turn into a save (`components/inline-edit.md`)?
- [ ] **Sortable column headers**: hover over the first and last column headers, does any background slab touch the card edge (only the text should get stronger)? Do number columns have the arrow before the text, with the text flush right with the numbers? At 375px can you still sort by each column (header or a "Sort by:" button), or does that column drift out of the frame (`components/sortable-header.md`)?
- [ ] Does a `type="search"` field still have the browser's × button (Chrome colours it blue)? It must be turned off, with a hand-built grey `X` button when the field has text (`components/input.md`).
- [ ] Search/filter with 0 results: does the message say exactly what is being filtered, is there a "Clear search"/"Clear filters" link (same text as the button at the end of the chip row), with only a keyword is the chip row showing a redundant "Clear filters" button, is the select-all checkbox hidden (`components/empty-state.md`)? At 375px is any status tab entirely outside the frame? It must become a dropdown labelled "Status:", left-aligned. Do horizontally scrolling rows (chips, tabs, card strips) have a faded edge on the side with hidden items, and has a position-indicator bar been proposed in one line at delivery (`R10`, not built up front)? If the user chose the bar: the bar floats, the page does not jump when the bar appears, the selected item scrolls itself to the centre.
- [ ] Do cards on mobile still have `p-8`? They must be `p-4`, at most `p-5`.
- [ ] Do filter chips sit on the same row as an input and differ in height by more than one step?
- [ ] Filter chips: is the selected state `bg-primary text-primary-foreground` (no hard-coded colours), except chips in a popover with an Apply button (strong border, `foreground/10` background)? Do long labels have `max-w-48` + `truncate` + `title`? Do they have `aria-pressed`?
- [ ] **Filter popover**: pick a person in the select field with the mouse and look again, does the field still have the black border + ring as if open (it must be `focus-visible:`)? Is the "Clear filters" text aligned with the left edge of the labels, or indented 16px because it is a `ghost` button? How many black blocks does the frame have (selected chips, Apply button): only Apply may be solid. Select all four levels: does the chip row become four thick black rings (selected chip border `inset-ring-1`, not `ring-1 ring-inset`; only when `I14` is enabled: Tabbing to a selected chip must show both the selection border and the focus ring)? Open the date-range field at 375px: is any quick preset in the row cut off (it must wrap)? At 1280px: does the calendar expand two months overflowing the frame, does the due-date filter open on the previous month (`layouts/overlay.md`, "Filter popover")?
- [ ] **Calendar page**: can you read task names in the cells at 1024px with the sidebar open, or is only one word left ("Prepare …")? The template follows the frame width (`@container`), not the viewport. In the compact calendar, pick a day other than today: is the solid circle on the selected day, or is today still the heaviest block? Hover and click a day: is the background a circle around the number, or a square over the whole cell overlapping the circle? Does "Today" sit right next to ‹ ›? Step through a few months: does the grid change height (measure the height of a row with 3 tasks)? Are the digits "1" and "31" aligned with the weekday names (`layouts/app.md`, "Calendar page")?
- [ ] **Error pages**: type a wrong path **inside** the app frame (e.g. `/dashboard/does-not-exist`): do you get a 404 page inside the frame, with the sidebar still there and the header saying "Page not found", or an empty content area with the header still showing the old page name? 403 and 500 for a page also sit inside the frame; only maintenance, signed-out and whole-app crashes stand alone, and standing alone is still a centred block without a card (logo on top), not a full-width black bar. Does the 404 have a small faded "404" line above the title? Is the title `font-semibold`, not red (`M30`: the user has nothing to fix), no illustration? Does an email mid-sentence let the full stop fall to the start of the line (`suffix` of `EmailText`), is it broken after `@` even though it fits on one line? 403 after sending: does the title change to "Request sent", or does a green line of text sit in the button's slot and throw the row off centre? Does "Switch account" sit on its own line under the email, or trail after the email making the footer line the widest in the block? Is the reopening time written as a sentence (`layouts/app.md`, "Error pages")?
- [ ] **Line chart** (`components/charts.md`): does the number at the last point sit on top of the line segment (if the last point is lower than its neighbour, the number must go below the dot; the probe reports "Number label overlaps chart line")? A point near the bottom (today only a few hours in, small number): does the number fall below the 0 line, crowding into the axis label row right above "27/09" (the probe reports "Number label outside plot area"; move it beside the dot)? Hover a middle point when the axis shows only a few labels: does the number come with its date ("13/09 · 70.9M"), or is it a bare number of unknown day? Is a partial period labelled "Today"? Tab into the chart: does the number of the current point appear?
- [ ] **Reports page** (`layouts/app.md`): choose "This month" and "This year": does the "Compared with…" line give the same period last month / last year, or "the previous 269 days" reaching back to an odd day? Choose a single day: is the chart split by hour, or does it become a block of text repeating the number in the Revenue cell? Does the main chart have horizontal gridlines and level labels? Does the calendar allow choosing days after today?
- [ ] Look over everything once more: is any spot **cramped and crowded**? Cramped means not done.

If there is dark mode:

- [ ] Is the accent colour used anywhere as a **thin line** (focus border, underline, selected indicator)? (`M22`)
- [ ] Dark backgrounds: do page background < card < dropdown / popover **get progressively lighter**? Are the hover background and selected item **lighter** than the card (faint white overlay), with selected one step stronger than hover? Grep `hover:bg-background`, `focus-visible:bg-background`, `data-[highlighted]:bg-background`, and `&& "bg-background` (JS conditions: pointed item, selected item): must return 0, use `bg-item-hover` / `bg-secondary` (`M21`, `I10`). The overlay behind a modal is `bg-black/…`; grep `bg-foreground/[2-6]0` on overlays (`M32`).
- [ ] Grep `text-white`. Text on accent backgrounds must be `--primary-foreground`.
- [ ] Has `.dark` redeclared the accent colour? If not, the accent colour goes invisible.
- [ ] Is there an `@custom-variant dark` line (Tailwind v4)? Without it, clicking Dark on a machine in light mode leaves `dark:` classes light (`M31`). Does `color-scheme` follow the theme?
- [ ] Does the theme switch have Light / Dark / System, default System, not cycling? Does reloading in dark mode flash white? When flipping the theme, does any spot change colour out of step (`M31`)?
- [ ] Do inputs and selects on dark backgrounds keep their borders (`M32`)? Are there any bright `-50`, `-100` background slabs left in the dark screen (badges, avatars, banners, chips, white-background images)? Grep `bg-[a-z]+-(50|100)\b` without `dark:` (`M32`).
- [ ] Do overlays use `bg-surface-overlay` / `bg-surface` + `border border-border` + `shadow-popover` / `shadow-modal`, not a bare `shadow-lg` (`M15`)? Is the sliding sidebar on narrow screens, also a panel, given `shadow-modal`? Do library toasts and dialogs still have white backgrounds in dark mode (`M33`)?
- [ ] Run the probe with `--dark` as well: the "DARK MODE" section must be empty.

> **In the four most recent test rounds, the three most valuable bugs all came from gate 3**, not
> from the build itself. Not running this gate means it has not been tested.
>
> This is also the kind of bug that grading by wide-screen screenshots **never** sees.

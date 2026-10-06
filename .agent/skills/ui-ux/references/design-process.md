# Design from scratch like a designer — rules U

**Default branch** (settled): every request to build or redo one screen or more
comes here, in Vietnamese or English, new product or existing screen. It only stays out when the request names
another mode explicitly (question 1 table in `SKILL.md`): review, keep the brand, rebuild in the skill's style, refactor, just build
it, or work smaller than one screen.

Different from branch `V` (`review.md`): `V` keeps the page shell, fixes bugs and tidies up. The result is a cleaner
hi-fi of **the same old wireframe**. Branch `U` starts from the question *"what does the user come to this screen
to do"*, so the shell may change too: what comes first, where the filters sit, what the card says, which
views exist. A rebuild under `V` is clean of every measurable bug and the viewer still says
"looks no different from the old one, still needs a UX person".

The two gates of this branch are the only two places the skill stops to ask. If the request already supplies enough for a gate
(the brief is clear, "go with A"), pass that gate without stopping.

**"Just build it" means no wireframes** (drawing wireframes costs a lot of tokens; settled).
If the request says "just build it", or the user replies `just build it` at gate 1: still do `U1`,
`U2` and pick the `U3` option you would recommend, **in your head, not sent, no stop**, then build directly
with that option (`U4`), colour at the recommended level. At delivery write one line: *"Layout: [option]
because [main job]. To see other directions, send `draw wireframes`."* When sending the brief at gate 1, add a final line: *"Reply `just build it` to skip the wireframes and
build directly."*

---

## Four steps, two gates

| Step | Output | Gate |
| --- | --- | --- |
| `U1` Brief | One short block: product, user, main job, platform | Merged with `U2`, **gate 1** |
| `U2` Main job per screen | Table: what they come to do, what they compare by, final action, conventions of the product type | **Gate 1**: the user edits or replies `ok` |
| `U3` Wireframe | 2–3 genuinely different layout options, real content, with images; one toolbar: option, concise, no repeats, colour, desktop / mobile, state, reasoning panel | **Gate 2**: the user picks |
| `U4` Real build | Code for the chosen option, probe until the `P` list is empty | Like gate 3 of `checklist.md` |

Before gate 2 is passed, **do not touch any project file**. Wireframes and screenshots go in
`$TMPDIR/forge-design/`.

---

## U1. Brief: read first, ask later ⚑

- **Run the question 2 audit of `SKILL.md` before writing the brief**, for every project, new product or
  existing UI: stack, existing components, style. The `Audit:` line goes at the top of the gate 1 message. Skip the audit
  and the wireframe draws controls the project already has in another form, and `U4` builds a second app.
- Read the README, route files, data types (types, mocks), the copy on existing screens. From that write
  a five-line block: **what product**, **for whom**, **one to three main jobs**, **main
  platform** (phone or computer), **differentiator** (what the product sells that others
  do not have).
- For any line that cannot be inferred, ask, **at most five questions, sent at once**, each with a pre-guessed
  answer so the user only needs to type `ok`.
- **No personas, no user journeys, no invented research numbers.**
  The model cannot interview anyone. The brief only records what was read from code or what the user said,
  with a source per line: *read from code*, *user said*, *guess*.

## U2. Main job per screen ⚑

One row per screen in scope:

| Screen | What they come to do | What they compare and decide by | Final action | What this product type usually does |
| --- | --- | --- | --- | --- |
| Course list | Find a course matching their level, within budget | Price, duration, level, rating | Open details, save | Filters sticky at the top, card shows price and level first, sort next to the result count |

- The "compare by" column decides cards and tables: what the user uses to choose between items
  must be **the most prominent and come first**. What does not help choosing moves down or goes to the detail page.
- Last column: **actually look up** how a few products of the same type do it (search the web if a tool exists), record
  it as a convention, never put product names into code or project files. If you cannot look it up,
  write *"from memory, needs checking"*. The majority convention beats personal taste.
- The differentiator from `U1` must **show on the main screen**, not only inside the filters.

Send `U1` and `U2` in **one** message, ending with *"If it is right reply `ok`; if a row is wrong, edit
that row."* Stop and wait.

## U3. Wireframe: 2–3 genuinely different options ⚑

- **Different in layout strategy, not in decoration.** Example for a list page:
  A keeps a card grid with a compact filter bar sticky at the top; B splits into a list and a detail panel;
  C puts the search box first, filters after. Three options that differ only in radius or colour are **one** option.
- **Grey by default.** Images are grey blocks with real aspect ratios. On opening, the user sees the layout first, without
  getting lost in colour; the accent colour only turns on with the Colour switch on the toolbar (below). Grey only turns off the accent colour,
  everything else is still real tokens and components (the "Wireframe built with the same tokens…" bullet below).
- **Real lucide icons exactly where every app puts them**, no placeholder squares (a square next to a
  sidebar item reads as a checkbox). Load `lucide` from `cdn.jsdelivr.net`, call
  `lucide.createIcons()`. **Every time you rewrite `innerHTML` you must redraw icons**: `createIcons()`
  only replaces the `<i data-lucide>` present at call time; tags written later stay empty. Attach once at the top of the
  script `new MutationObserver(() => { if (document.querySelector("i[data-lucide]")) lucide.createIcons(); }).observe(document.body, { childList: true, subtree: true })`
  instead of calling it by hand after each render. **The `i[data-lucide]` condition is required**: a drawn svg still carries
  `data-lucide`; calling `createIcons()` directly in the observer replaces svgs forever and the page hangs. Without the
  observer, picking an item makes the select and date inputs lose their icons (the svg becomes an empty `<i data-lucide>`),
  and they only show after reopening. Three places: **every sidebar item**; **a 32px icon tile with a light background in the corner of each stat
  card**; **an icon tile or avatar at the start of a row** when the row belongs to a type (department, supplier, transaction
  type). Block titles and meta lines get no icon (`V1c`). At the Grey level icons are grey; three identical icons
  for three items are better dropped (`F17`). A dashboard without icons looks "dull", the viewer
  says so at once. **Grey still has emphasis levels**: the main button is filled dark grey with white
  text, the secondary button is outlined. Two buttons of the same style in a wireframe means the hierarchy is not decided, and the real
  build will again have two buttons competing (`V1b`).
- **The wireframe is built with the same tokens, fonts and components the build will use** ⚑, because `U4` copies it
  verbatim. The wireframe's Colour level must **be** the build, only as an HTML file: the user picks what
  they see; build it identically and they are happy; build something different and they picked wrong.
  - **File shell like `layouts/app-kanban.html`**: load the font, Tailwind v4 browser build
    (`@tailwindcss/browser@4`), then paste the token block **verbatim** into `<style type="text/tailwindcss">`
    (`:root` and `@theme inline`). New product: `references/tokens.css`, accent colour from the Accent group
    (below). Project with existing UI: **the project's token file** (`globals.css`, `index.css`, theme config),
    colours arranged by role as `U4` will do (`review.md`, colour role table), shape per the "Shape taken from the
    skill" table. Do not set any colour code, radius or shadow outside the token block.
    **A project that has passed `D9`** (has a `/design-system` page or a design-system story, token file already edited)
    counts as **a project with existing UI** even with no screens yet: paste the project's token file, not the skill's
    `tokens.css`, otherwise the just-approved font and accent colour are lost.
  - **Components use exactly the classes the build will use**: if the project has a component library (shadcn, an in-house
    kit), open the project's `Button`, `Input`, `Badge`, `Card`… source and copy the class string of the
    variant to be used; if not, copy the recipe in `components/*.md`. Do not redraw it "to look similar".
  - **Spacing and sizes written directly as classes** on each block (page shell padding, `gap`, control
    height, font size, icon size), on the project's or the skill's scale, never left to the browser.
    When the user picks a wireframe they also pick its density.
  - **The Grey level only turns the accent and status colours grey** (override `--primary` and the status
    tokens on `:root[data-mau="xam"]`); background, border, text, radius, shadow, font keep their tokens.
    Turning Colour on shows exactly the build.
  - **Change the accent colour on `:root`, not on `body`, and carry every token derived from it.** A variable
    `--border-focus: var(--primary)` declared on `:root` is resolved right at `:root` before being inherited
    down: changing `--primary` on `body` changes the main button colour but the focus border keeps the old colour. Tokens hard-coded
    from the accent (`--ring-focus`, `--primary-hover`, `--primary-light`) must also be re-derived at each level,
    as `brand-tokens.md` instructs when changing `--primary`. Without re-deriving, picking
    teal gives a teal button, but the search box and select on focus keep an indigo border and ring at every level,
    even Grey. Probe reports "Focus token does not follow the accent colour".
- **Real content**: copy taken from the project's data, including the longest case and the empty case. A wireframe with
  "Lorem" text cannot show an overloaded card.
- **Sample data covers every state, especially states derived from time.** A screen with a "now" mark
  (appointments, deadlines, orders in delivery) usually most needs to show what is **past the mark
  and not done**: a customer late for an appointment who has not arrived, an overdue task, a late delivery. It is not
  in the list of states stored in the data (only "Confirmed"), it is computed from time, so it
  is often forgotten. Set the wireframe's "now" so there is at least one such item, draw it as its own
  state (`M4`: amber or red at the Colour level), and record in `U2` that it must stand out. Example: an appointment
  list at 10:40 where every earlier appointment has arrived, is in the exam or did not show, with nobody "late": the
  receptionist's main job at that moment (calling late patients) is not on the wireframe.
- **The right data shape**: how many images per item, which fields are often empty, how long the list
  is. Data with one image per listing but a wireframe drawing a three-image grid promises what the data
  does not have: the user picks for the image grid, the build shows one oversized image. If an option needs more data, draw exactly what exists and write *"better when
  X exists"* in the trade-off line.
- Each option gets **three lines**: where the main job now shows, what changed from the old one, the trade-off.
  Those three lines are also the content of the reasoning panel on the wireframe page (below), same words in both places.
  An option that needs data or logic not yet present (distance, a new view) says clearly
  *"needs data X, logic for you to wire"* (`N10`).
- **Count the app shell in the width.** If the app already has a navigation sidebar and the option adds a left
  filter column, state it in the trade-off line: two left columns, how many px remain for content at 1280.
- **Mark one option as recommended**, with one sentence why (tied to `U2`).
- One HTML file, every choice as a parameter (`?v=a&mau=xam&kho=desktop&tt=du-lieu`) so probe
  can open each one, and a link the user copies opens exactly what they are looking at.
- **Number each main block** (header, filter row, list, panel, footer…): `data-wf-block="1"`,
  the number shown small in the block's top-left corner. The user gives feedback by number (*"drop block 3"*, *"move block 2 to the
  top"*), not by describing "that small text bar above the table". The same block keeps the same number across options;
  a block only one option has gets a new number.
  **The number must not cover the block's text or icons.** A block without padding (toolbar row, status count
  row) has text right in the top-left corner: the number covers it and it reads "ThTu". After each draw, `placeBlockNumbers()`
  (template below) measures the text and icons under the number; if they overlap it sets `data-wf-block-out` so the number moves just above the block edge.
  **Put `data-wf-block` on a non-scrolling wrapper**: an `overflow-x-auto` block (chip row) clips a number
  outside its edge; wrap it in an extra `div` and number that.
- **Any block the skill already has a template for is drawn exactly as that template**, because `U4` builds exactly the wireframe:
  draw it wrong and the build copies it wrong. Before drawing, list the option's blocks, then open the matching
  template in the section 2 table of `SKILL.md` (`components/`, `layouts/`): button, input, select, date
  picker, checkbox, switch, tab, chip, pagination, badge, avatar, list row, card, stat
  card, chart, empty block, breadcrumb, header, sidebar, table. Copy the **shape and classes**: size, number of elements,
  arrangement, where text sits, the template's class string; no need to copy React code. Controls are real tags (`<input>`, `<button>`,
  `<select>` if the template uses it), no fake `div`s. Only blocks without a template are drawn freely. Two
  common bugs: pagination drawn as two "Previous / Next" text buttons of different widths instead of
  `‹ 1 2 3 … ›`; a search box that is a `div`, so a long placeholder wraps to a second line.
  **If the existing app uses the browser's native controls, the wireframe does not copy them**, even if
  the app has styled border and radius: a `<select>` or date / time input still opens the OS menu and calendar on click;
  native checkboxes, radios, sliders and file inputs look out of place in the app. Draw them with the skill's matching template
  (`components/choice-controls.md`, `range-slider.md`, `file-upload.md`), styled with the app's tokens. Keep a native control only when it only appears on mobile (the native `<select>` rule for
  touch screens there); a field inside a dialog used at both widths gets built. Blocks in elevated layers (dialog,
  sheet, popover) are also checked against templates: open them and look, not only the visible part of the page.
- **Self-check before probing**: for each block with a template, compare the wireframe with the template in one line ("pagination:
  matches", "search box: `<input>`, placeholder fits"). Probe catches part of it (placeholder longer than the field,
  a block that looks like an input but wraps text, pagination with only text buttons, a misaligned control row); the
  rest is for the eye.
- **All four states of `I19`**: data, loading, empty, error, switched with the State button.
  The empty screen has the sentence and button of `components/empty-state.md`; loading is a skeleton shaped like real
  rows. The user gives feedback on the empty screen at wireframe time, not only after the build.
- **The wireframe has states like the real thing**: one selected item marked `aria-current` (or
  `aria-selected`), with a hover background. A static wireframe without hover means nobody sees
  "hover matches the selected background" until the build is done.
- **Quick-probe each option before sending**: `probe.mjs "<option link>&mau=mau" --quick
  --widths 1280,375`, ~6 seconds per option. Fix until these are clean: the `P` list, a left stripe clipped
  by the radius, repeated items heavy with text, a sticky column scrolling on its own, content floating mid-screen on wide viewports, a button row dropping a
  single button (`R3`), native select and date inputs (including inside a closed dialog), "wireframe chrome breaking
  the design" (number over text, lost `sticky`, overflowing bar). Those are bugs of the layout itself: leave them for `U4`
  and the build drifts from what the user picked. The user does not notice "cards with way too
  much text" or "the stripe is clipped" on a grey wireframe; they pick by layout and then trip over the bug in the build (probe
  measures both on the wireframe file itself). Then run the Structure rules (`V1b` in `review.md`) by
  eye. Write one line when sending: *"Quick probe: A clean, B clean, C clean"*.
  **Do not run the full probe at this step**, and do not probe the Grey level (same layout, only colour differs): `--quick`
  skips Tab, hover, click and opening elevated layers (hover matching selected, overflowing layers, focus ring), which take
  most of the measuring time. The build does not copy hover and elevated layers from the wireframe but from the skill's templates, and
  `U4` runs the full probe and fixes during the build. A full probe of five options at two colour levels costs several minutes before gate 2.
- **Two content switches, Concise and No repeats, apply to every option** (`?gon=1`, `?bolap=1`,
  both can be on at once). Same layout, only less content, so the user turns them on and sees what they
  would not think of themselves, on the exact option they are viewing:
  - **Concise:** each item keeps only what is used to choose, from the "compare by" column of `U2`, at
    most three lines. The rest goes to the detail page or panel.
  - **No repeats:** each piece of information in one place on the screen: no repetition between an item and the detail panel, between
    header and sidebar, between page name and selected item (`V1b`, "Two places, one job").

  **No separate versions.** Each option draws its full content once, with `data-wf-gon` on the parts hidden when
  concise, `data-wf-lap` on the repeats; CSS hides them by `body[data-gon="1"]`, `body[data-bolap="1"]`
  (template below). The earlier version had two options D, E drawn only on the recommended option: someone picking C had to
  imagine "C concise", and could not see both on at once. If an option has nothing to trim
  or de-duplicate, the reasoning panel says so in one sentence (*"B is already concise: three facts per row"*): turning it on with no
  change makes the user think the switch is broken. The switches only hide content, so no separate probe is needed.

- **Colour switch** (off is Grey, on is Colour), applies to every option, not a separate version:
  - **Off, Grey:** default on opening, layout only.
  - **On, Colour:** what the build will look like by default (`P6`): accent colour on the main button, selected item, links,
    charts; **and the `M4` status colours on all stateful data**: over budget,
    overdue red or amber, done green, progress bars coloured by threshold. If at the Colour level a 103% bar
    is still black, the viewer asks *"I picked colour, why is it still black and white"*. If the project already
    has a style other than flat (`P4`), Colour is that style.

  ⚠️ **The third level "Coloured" has been removed from the wireframe (settled: adding it made
  little difference).** The brand colour the user needs to see is at the interaction points (clickable controls, below),
  not in decorative colour bands. If the user asks for "coloured" in the request, follow `P12` in `styles.md`
  during the build, do not draw it as a level.

  **Project without a brand colour** (the accent is the default near black, `brand-tokens.md`; a project that has passed
  `D9` has its accent settled at that gate, even if near black, and does not count as having none) adds the group
  **Accent: ● ● ●** with three suggested colours (indigo `#4f46e5`, teal `#0d9488`, orange `#ea580c`), changing
  `--primary` in place. Without this group a new project's Colour level is still black and white. The colour the user
  picks becomes the accent colour in the build (`brand-tokens.md`); if they do not pick, build with the first colour and report it in one line.
  Change colour via CSS variables on `:root[data-mau]`, `:root[data-nhan]` (not on `body`, see above), no redrawing. The quick probe at
  the Colour level measures the contrast of white text on the main button and on the selected item with the first accent; the other two
  are compared by eye on the screenshot; white text on orange is where it often falls short.

  **Project without a logo** adds the group **Logo: 1 · 2 · 3** (`?logo=`): three marks following the three directions of
  `components/logo.md`, already checked at 16px, swapped everywhere the logo appears on the page. The reasoning panel has one line
  explaining each mark. Without this group the sidebar top is a letter tile, and after reviewing, the user still
  has not seen what their product looks like. The logo the user picks becomes the logo in the build; if they do not pick,
  build the recommended direction and report it in one line.

- **Controls in the wireframe are clickable and show states like the real thing** ⚑: inputs and the search box on focus
  get the accent border and ring (`I13`: `--border-focus`, `--ring-focus`); selects, dropdowns and filter buttons
  open a list of real items on click per `layouts/overlay.md` (frame, motion), and close on outside click or
  Esc. A selected item with a badge shows the badge inverted like the build (`layouts/app.md`,
  Sidebar). Turning Colour on lets the user see the right brand colour exactly where they will click (settled:
  "letting the user see it is even better" than the Coloured level).

- **Width button: Desktop · Mobile.** Mobile shows that same page in a 375 × 812 frame centred on screen
  (an iframe with the same link, plus `frame=1` so the frame has no toolbar), so media queries really
  run. Users almost never shrink the window themselves, so they never see how the table becomes a list or the filters become a
  button on a phone.
  - **The ☰ button in the mobile frame is clickable**: it opens a panel sliding from the left per `layouts/app.md` (overlay,
    closes on outside click or Esc, no ✕ button), so the user sees how many menu items there are and which is
    selected. A ☰ that does not click makes mobile just a screenshot.
  - **An app with 5 or fewer main navigation items** adds the group **Nav: ☰ · Bottom bar** (only
    shown when Width is Mobile), draws a bottom navigation bar per `layouts/app.md`, and states in the
    reasoning panel which to use: an app used daily, switching sections constantly, gets the bottom bar; an admin
    app rarely opened on a phone gets ☰. From 6 items, ☰ only.

- **A toolbar at the top of the page, required, one line**, outside the design: a **light** strip 56px
  tall, white background, light grey bottom border, 14px text, **not sticky**: a sticky bar covers the sidebar,
  header and `sticky top-0` panels of the design itself, the viewer sees the sidebar lose its logo on scroll and
  thinks the build will do that. Groups are laid out from the left, 24px
  apart, in this order: Screen (multi-screen requests) · **Option** · **Concise · No repeats** · **Colour** (switch) · Accent (project without a brand) · Logo (project without a logo) · Width · Nav (mobile, few items)
  · **State**.
  - **A multi-screen request** (calendar and profile, list and detail) uses one file, with the **Screen** group first
    (`?man=`), labels of one or two words ("Calendar", "Profile"); each screen has its own A, B, C. **At 1280 the bar must
    fit one line without scrolling** (probe measures): long labels like "Today's schedule", "Patient
    record" push the bar to overflow, and "State" gets cut off.
  - **Each group is a segmented control**: a light grey track with 10px radius, buttons in the track have no background, the
    active button (`aria-current="page"`) has a white background, a thin shadow, bold black text; other buttons grey text. No
    dark strip, no loose white-text buttons: a dark strip is heavier than the design itself, pulling the eye from what
    needs viewing, and a dozen identically shaped buttons do not read as groups.
  - **Options show only the letter** `A B C`, preceded by a grey "Option" label; the full name goes in
    `title` and at the top of the reasoning panel. The recommended option has a small accent-coloured dot next to its letter. Long
    names on the bar ("A · One-page report (recommended)") push the whole bar into horizontal scroll at 1280.
  - **Width has icons**: a monitor before Desktop, a phone before Mobile (16px icon, stroke 2).
  - **State is a dropdown menu**, grey label "State:" with the current value in bold and a small arrow;
    clicking shows four links. The four states rarely change and do not deserve four buttons on the bar.
  - **Colour is a switch** preceded by a "Colour" label, not a segmented control: only two levels remain.
    The Accent and Nav groups need no label: the text in the buttons speaks for itself.
  - **Concise and No repeats are two toggle buttons sharing one track**, each with a small square before the text; when on,
    the square has a ✓ and the button has a white background (`aria-pressed`). Do not use two switches like Colour (adds nearly
    100px, the bar no longer fits 1280 when both Accent and Logo exist); do not use a plain segmented control (looks like
    choosing one of two, while both can be on at once).
  - **Text on the bar and the reasoning panel follows the language the user is writing in (`T27`)**, not
    `T24`: it is the skill speaking to the user, not the product's copy. The HTML template below is
    in English; if the user writes in another language, translate all of it: Option, Color, Accent (`aria-label`
    Indigo, Teal, Orange), Bottom bar, State
    (Data, Loading, Empty, Error), Recommended,
    Concise, No repeats, Pros, cons, Pros / Cons / Best when, Feedback
    ideas, plus option names, reasoning sentences and suggestion sentences. URL parameters (`v`, `gon`, `bolap`,
    `mau`, `kho`, `tt`…) stay as they are. Text **inside** the design still follows `T24`: if the project has
    Vietnamese labels, the wireframe stays Vietnamese even when the request is in English. A bar in a language the
    user does not read means they cannot read any button, and the bar is the only place to choose.

  Each button is a link that keeps all other choices and changes only its own parameter, **including things the user
  has opened in the wireframe chrome**: if the reasoning panel is open, switching option, colour or width keeps it open
  (`?uu=1`). The user opens Pros, cons to compare A with B; if clicking over to B closes the panel, they have to
  reopen it every time. Things opened later (comparison table, notes) are kept the same way. On narrow screens the bar
  scrolls horizontally, it does not wrap. Opening with no parameters gives: the recommended option, Concise and No repeats off,
  Colour off, Desktop, Data. Without the bar the user has to type `?v=` by hand.

- **The reasoning panel sits right under the bar**, not a modal (a modal covers the design exactly when you need to look),
  very light grey background. **Collapsed line**: option name in bold black, a "Recommended" tag (only on the recommended
  option), one reasoning sentence in `#525252` truncated to one line, a "Pros, cons ⌄" button pushed right: *"**A · Card grid**
  [Recommended] Users come to compare salaries, so salary leads every row"* (tied to the main job in `U2`,
  never "clean, modern"). Below 768px the reasoning sentence wraps to its own line and the button keeps only the arrow, so
  the name and tag stay on one line. Clicking expands the full panel:
  - **Three columns** Pros (green dot), Cons (amber dot), Best when (grey dot): 12px bold black headings,
    Pros 2–3 bullets, Cons 1–2, Best when one sentence, text `#404040`. Stacked on narrow screens. Changes with the
    option being viewed.
  - **Feedback ideas**: its own row below a divider, 3–4 short sentences the user copies back to the AI, **each
    sentence is a button** (the full sentence plus a copy icon, no wrapping; after clicking, the icon becomes a green ✓ for
    1.5 seconds). Choose them
    for this very page, in the language of the request: if the page is pale Grey, *"Add brand colour to the header
    and filter row"*; if titles are thin, *"Bolder titles"*; if blocks are tight, *"More breathing room, more
    spacing between blocks"*; *"A different font that suits the product better"*; *"Drop block 3"*. Do not suggest
    what the page already has (already colourful: no "add colour").

  Do not write everything as 13px grey `#737373` text in one solid block (Pros, Cons, Best when run together, a Copy
  button wedged mid-sentence, a suggestion broken over two lines): the viewer sees "washed-out colour, chaotic structure".

  ```html
  <nav class="wf-bar" aria-label="Wireframe">
    <div class="wf-group">
      <span class="wf-label">Option</span>
      <span class="wf-set" data-wf-param="v">
        <a data-value="a" title="A · Card grid (recommended)" data-recommended>A</a><a data-value="b" title="B · List + detail">B</a><a data-value="c" title="C · Table">C</a>
      </span>
    </div>
    <span class="wf-set wf-flags"><a data-wf-toggle="gon" data-on="1" data-off="0">Concise</a><a data-wf-toggle="bolap" data-on="1" data-off="0">No repeats</a></span>
    <a class="wf-switch" data-wf-toggle="mau" data-on="mau" data-off="xam" role="switch">Color <i></i></a>
    <span class="wf-set" data-wf-param="nhan"><a data-value="cham" aria-label="Indigo"><i></i></a><a data-value="ngoc" aria-label="Teal"><i></i></a><a data-value="cam" aria-label="Orange"><i></i></a></span>
    <span class="wf-set" data-wf-param="kho">
      <a data-value="desktop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>Desktop</a>
      <a data-value="mobile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>Mobile</a>
    </span>
    <span class="wf-set" data-wf-param="nav"><a data-value="menu">☰ Menu</a><a data-value="duoi">Bottom bar</a></span>
    <details class="wf-menu">
      <summary><span>State:</span><b data-wf-current="tt"></b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
      <div class="wf-popover" data-wf-param="tt"><a data-value="du-lieu">Data</a><a data-value="dang-tai">Loading</a><a data-value="rong">Empty</a><a data-value="loi">Error</a></div>
    </details>
  </nav>
  <details class="wf-reason" data-wf-reason>
    <summary>
      <span class="wf-reason-name">A · Card grid</span>
      <span class="wf-reason-tag">Recommended</span>
      <span class="wf-reason-why">Users come to compare salaries, so salary leads every row.</span>
      <span class="wf-reason-toggle"><span>Pros, cons</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span>
    </summary>
    <div class="wf-reason-body">
      <div class="wf-reason-cols">
        <section><h3><i data-tone="uu"></i>Pros</h3><ul><li>…</li><li>…</li></ul></section>
        <section><h3><i data-tone="nhuoc"></i>Cons</h3><ul><li>…</li></ul></section>
        <section><h3><i></i>Best when</h3><p>…</p></section>
      </div>
      <div class="wf-reason-tips">
        <h3>Feedback ideas</h3>
        <button type="button" data-copy="Bolder titles">Bolder titles<svg data-icon="chep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><svg data-icon="da-chep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></button>
        …one button per suggestion, as above…
      </div>
    </div>
  </details>
  <main id="wf-design">…blocks with data-wf-block="1", "2"…</main>
  <style>
    .wf-bar { position: relative; z-index: 50; display: flex; align-items: center; gap: 24px; height: 56px;
      padding: 0 16px; overflow-x: auto; white-space: nowrap; background: #fff; border-bottom: 1px solid #e5e5e5;
      color: #737373; font: 14px/1 system-ui, -apple-system, sans-serif; }
    .wf-bar *, .wf-reason * { box-sizing: border-box; }
    .wf-group { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .wf-set { display: flex; align-items: center; gap: 2px; flex-shrink: 0; padding: 3px; border-radius: 10px; background: #f4f4f5; }
    .wf-set a { position: relative; display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px;
      border-radius: 7px; color: #737373; text-decoration: none; }
    .wf-set a:hover { color: #171717; }
    .wf-switch { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; color: #737373; text-decoration: none; }
    .wf-switch i { position: relative; width: 36px; height: 20px; border-radius: 10px; background: #e4e4e7; transition: background .15s; }
    .wf-switch i::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%;
      background: #fff; box-shadow: 0 1px 2px rgb(0 0 0 / .2); transition: translate .15s; }
    .wf-switch[aria-checked="true"] i { background: #171717; }
    .wf-switch[aria-checked="true"] i::after { translate: 16px 0; }
    .wf-set a[aria-current="page"], .wf-flags a[aria-pressed="true"] { background: #fff; color: #171717; font-weight: 500;
      box-shadow: 0 1px 2px rgb(0 0 0 / .08), 0 0 0 1px rgb(0 0 0 / .04); }
    .wf-bar svg { width: 16px; height: 16px; flex-shrink: 0; }
    /* Square before the text: two independent toggles, not a choice of one of two. */
    .wf-flags a::before { content: ""; width: 12px; height: 12px; border: 1.5px solid #a3a3a3; border-radius: 3px; }
    .wf-flags a[aria-pressed="true"]::before { border-color: #171717; background: #171717 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E") center / 10px no-repeat; }
    body[data-gon="1"] [data-wf-gon], body[data-bolap="1"] [data-wf-lap] { display: none; }
    [data-wf-param="v"] a { justify-content: center; min-width: 32px; padding: 0 10px; }
    [data-wf-param="v"] a[data-recommended]::after { content: ""; position: absolute; top: 5px; right: 5px;
      width: 5px; height: 5px; border-radius: 50%; background: #4f46e5; }
    [data-wf-param="nhan"] a { padding: 0 8px; }
    [data-wf-param="nhan"] i { width: 14px; height: 14px; border-radius: 50%; background: currentColor; }
    [data-wf-param="nhan"] a[data-value="cham"] { color: #4f46e5; } [data-wf-param="nhan"] a[data-value="ngoc"] { color: #0d9488; }
    [data-wf-param="nhan"] a[data-value="cam"] { color: #ea580c; }
    .wf-menu { flex-shrink: 0; }
    .wf-menu summary { display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 10px; border-radius: 8px;
      cursor: pointer; list-style: none; }
    .wf-menu summary::-webkit-details-marker { display: none; }
    .wf-menu summary:hover, .wf-menu[open] summary { background: #f4f4f5; }
    .wf-menu b { color: #171717; font-weight: 500; }
    .wf-popover { position: fixed; z-index: 60; display: grid; min-width: 168px; padding: 4px; background: #fff;
      border: 1px solid #e5e5e5; border-radius: 10px; box-shadow: 0 8px 24px rgb(0 0 0 / .08); }
    .wf-popover a { display: flex; align-items: center; height: 34px; padding: 0 10px; border-radius: 6px; color: #404040; text-decoration: none; }
    .wf-popover a:hover, .wf-popover a[aria-current="page"] { background: #f4f4f5; color: #171717; }
    .wf-popover a[aria-current="page"] { font-weight: 500; }
    .wf-reason { border-bottom: 1px solid #e5e5e5; background: #fafafa; color: #404040; font: 13px/1.5 system-ui, -apple-system, sans-serif; }
    .wf-reason summary { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; min-height: 44px; padding: 8px 16px;
      cursor: pointer; list-style: none; }
    .wf-reason summary::-webkit-details-marker { display: none; }
    .wf-reason-name { min-width: 0; overflow: hidden; color: #171717; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
    .wf-reason-tag { flex-shrink: 0; height: 20px; padding: 0 8px; border-radius: 10px; background: #eef2ff; color: #4338ca;
      font-size: 12px; font-weight: 500; line-height: 20px; }
    .wf-reason-why { flex: 1; min-width: 0; overflow: hidden; color: #525252; text-overflow: ellipsis; white-space: nowrap; }
    .wf-reason[open] .wf-reason-why { white-space: normal; }
    .wf-reason-toggle { display: inline-flex; flex-shrink: 0; align-items: center; gap: 4px; height: 28px; margin-left: auto;
      padding: 0 8px; border-radius: 6px; color: #171717; font-weight: 500; }
    .wf-reason summary:hover .wf-reason-toggle { background: #f0f0f0; }
    .wf-reason-toggle svg { width: 16px; height: 16px; transition: rotate .15s; }
    .wf-reason[open] .wf-reason-toggle svg { rotate: 180deg; }
    /* minmax(0, 1fr) and min(240px, 100%): without them, at 375 the grid columns are sized by max-width and overflow horizontally. */
    .wf-reason-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; padding: 4px 16px 16px; }
    .wf-reason-cols { display: grid; max-width: 1120px; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: 16px 32px; }
    .wf-reason h3 { display: flex; align-items: center; gap: 6px; margin: 0 0 4px; color: #171717; font-size: 12px; font-weight: 600; }
    .wf-reason h3 i { width: 6px; height: 6px; border-radius: 50%; background: #a3a3a3; }
    .wf-reason h3 i[data-tone="uu"] { background: #16a34a; }
    .wf-reason h3 i[data-tone="nhuoc"] { background: #d97706; }
    .wf-reason ul { display: grid; gap: 2px; margin: 0; padding-left: 16px; }
    .wf-reason li::marker { color: #a3a3a3; }
    .wf-reason p { margin: 0; }
    .wf-reason-tips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-top: 12px; border-top: 1px solid #ebebeb; }
    .wf-reason-tips h3 { margin: 0 4px 0 0; }
    .wf-reason-tips button { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid #e5e5e5;
      border-radius: 8px; background: #fff; color: #262626; font: inherit; white-space: nowrap; cursor: pointer; }
    .wf-reason-tips button:hover { border-color: #d4d4d4; background: #f5f5f5; }
    .wf-reason-tips button svg { width: 14px; height: 14px; color: #737373; }
    .wf-reason-tips button [data-icon="da-chep"], .wf-reason-tips button[data-copied] [data-icon="chep"] { display: none; }
    .wf-reason-tips button[data-copied] [data-icon="da-chep"] { display: block; color: #16a34a; }
    .wf-reason :focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
    @media (max-width: 767px) {
      .wf-reason-why { order: 1; flex-basis: 100%; }
      /* Only the arrow remains so the name and tag stay on one line; the text is still there for screen readers. */
      .wf-reason-toggle span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
      .wf-reason-tips h3 { flex-basis: 100%; }
    }
    /* Inside a layer: a rule outside any layer beats every Tailwind utility, the sidebar's `sticky` becomes `relative`, and the sidebar
       drifts on scroll. Without Tailwind, the project's `sticky` class still beats the rule inside the layer. */
    @layer base { [data-wf-block] { position: relative; } }
    [data-wf-block]::before { content: attr(data-wf-block); position: absolute; top: 4px; left: 4px; z-index: 5;
      display: grid; place-items: center; width: 18px; height: 18px; border-radius: 9px; background: #1f1f1f; color: #fff; font-size: 11px; }
    [data-wf-block][data-wf-block-out]::before { top: auto; bottom: 100%; } /* number covers text: move it above the block edge */
    body[data-frame] .wf-bar, body[data-frame] .wf-reason { display: none; }
    body:not([data-kho="mobile"]) [data-wf-param="nav"] { display: none; }
    /* The accent changes on :root, where the tokens are declared: var(--primary) declared on :root is already resolved at :root; changing it on
       body leaves the focus border, ring and hover in the old colour. */
    :root[data-mau="xam"] { --primary: #2c2c2c; } /* Grey level: drop the accent colour, and the status colours */
    :root:not([data-mau="xam"])[data-nhan="cham"] { --primary: #4f46e5; } /* …ngoc, cam likewise */
    /* Tokens derived from the accent, recomputed per level (brand-tokens.md). Only at the Grey level or when the Accent group exists: a project that
       already has a brand keeps its own tokens at the Colour level. */
    :root[data-mau="xam"], :root:has([data-wf-param="nhan"]) {
      --primary-hover: color-mix(in oklab, var(--primary) 85%, var(--background)); /* shifted towards the background */
      --primary-light: color-mix(in srgb, var(--primary) 5%, transparent);
      --ring-focus: color-mix(in srgb, var(--primary) 10%, transparent);
      --border-focus: var(--primary);
      --chart-fill: var(--primary);
    }
    .wf-drawer { position: fixed; inset: 0 auto 0 0; width: 280px; translate: -100% 0; transition: translate .35s; }
    body[data-menu-open] .wf-drawer { translate: 0 0; }
  </style>
  <script>
    const params = new URLSearchParams(location.search);
    // Defaults: recommended option, full content, Grey, first suggested accent, Desktop, ☰, Data.
    const state = { v: "a", gon: "0", bolap: "0", mau: "xam", nhan: "cham", kho: "desktop", nav: "menu", tt: "du-lieu", uu: "0" };
    for (const key of Object.keys(state)) state[key] = params.get(key) || state[key];
    Object.assign(document.body.dataset, state);
    Object.assign(document.documentElement.dataset, { mau: state.mau, nhan: state.nhan }); // accent changes on :root
    if (params.has("frame")) document.body.dataset.frame = "1";
    const linkTo = (changes) => `?${new URLSearchParams({ ...state, ...changes })}`;
    // Call again whenever state changes in place (reasoning panel opened, closed), so every link carries the new state.
    function updateLinks() {
      for (const set of document.querySelectorAll("[data-wf-param]")) {
        for (const link of set.querySelectorAll("a")) {
          link.href = linkTo({ [set.dataset.wfParam]: link.dataset.value });
          if (state[set.dataset.wfParam] !== link.dataset.value) continue;
          link.setAttribute("aria-current", "page");
          const currentLabel = document.querySelector(`[data-wf-current="${set.dataset.wfParam}"]`);
          if (currentLabel) currentLabel.textContent = link.textContent;
        }
      }
      // Colour switch, Concise and No repeats buttons: one link, clicking goes to the other level.
      for (const toggle of document.querySelectorAll("[data-wf-toggle]")) {
        const param = toggle.dataset.wfToggle;
        const isOn = state[param] === toggle.dataset.on;
        toggle.setAttribute(toggle.getAttribute("role") === "switch" ? "aria-checked" : "aria-pressed", String(isOn));
        toggle.href = linkTo({ [param]: isOn ? toggle.dataset.off : toggle.dataset.on });
      }
    }
    updateLinks();
    // The reasoning panel keeps its open state when choices change: written to the URL (kept when the user copies the link), links rebuilt.
    const reasonBox = document.querySelector("[data-wf-reason]");
    if (reasonBox) {
      reasonBox.open = state.uu === "1";
      reasonBox.addEventListener("toggle", () => {
        state.uu = reasonBox.open ? "1" : "0";
        history.replaceState(null, "", linkTo({}));
        updateLinks();
      });
    }
    // State menu: the horizontally scrolling bar clips absolute blocks, so the menu is fixed, placed right under the button.
    const statusMenu = document.querySelector(".wf-menu");
    statusMenu?.addEventListener("toggle", () => {
      const summaryRect = statusMenu.querySelector("summary").getBoundingClientRect();
      Object.assign(statusMenu.querySelector(".wf-popover").style, { top: `${summaryRect.bottom + 6}px`, left: `${summaryRect.left}px` });
    });
    document.addEventListener("click", (event) => { if (statusMenu && !statusMenu.contains(event.target)) statusMenu.open = false; });
    if (state.kho === "mobile" && !params.has("frame")) {
      const frameSource = `?${new URLSearchParams({ ...state, kho: "desktop", frame: "1" })}`;
      document.getElementById("wf-design").innerHTML =
        `<div style="display:grid;place-items:center;padding:24px"><iframe src="${frameSource}" title="Mobile" style="width:375px;height:812px;border:1px solid #ddd;border-radius:24px;background:#fff"></iframe></div>`;
    }
    // ☰ in the mobile frame opens the sliding panel; clicking the overlay or Esc closes it.
    for (const toggle of document.querySelectorAll("[data-wf-menu]")) {
      toggle.addEventListener("click", () => document.body.toggleAttribute("data-menu-open"));
    }
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      document.body.removeAttribute("data-menu-open");
      if (statusMenu) statusMenu.open = false;
    });
    for (const button of document.querySelectorAll("[data-copy]")) {
      button.addEventListener("click", async () => {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.setAttribute("data-copied", "");
        setTimeout(() => button.removeAttribute("data-copied"), 1500);
      });
    }
    // A block number covering text or an icon moves above the block edge. Call after each redraw, after two frames: the Tailwind
    // browser build generates CSS after the HTML enters the page; measured immediately, no block has layout yet and every number "overlaps".
    function placeBlockNumbers() {
      const isOverlap = (first, second) => first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
      for (const block of document.querySelectorAll("[data-wf-block]")) {
        const blockRect = block.getBoundingClientRect();
        const numberRect = { left: blockRect.left + 4, top: blockRect.top + 4, right: blockRect.left + 22, bottom: blockRect.top + 22 };
        const contentRects = [...block.querySelectorAll("svg, img")].map((node) => node.getBoundingClientRect());
        const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          contentRects.push(...range.getClientRects());
        }
        block.toggleAttribute("data-wf-block-out", contentRects.some((rect) => rect.width > 0 && isOverlap(rect, numberRect)));
      }
    }
    requestAnimationFrame(() => requestAnimationFrame(placeBlockNumbers));
    addEventListener("resize", placeBlockNumbers);
  </script>
  ```

  If the project already has a brand colour, drop the Accent group; if it already has a logo, drop the Logo group; if the app has 6 or more main items, drop the Nav group. The bottom bar is pre-drawn on the page, shown only when `body[data-kho="mobile"][data-nav="duoi"]` (inside the frame it is `frame=1` with `nav=duoi`).

- **Send clickable links for each option**, not just image paths. Run a background static server on the wireframe directory (`python3 -m http.server <port> -d "$TMPDIR/forge-design"`, in the background), then list each option on its own line as a complete link that the user can click or copy into their browser immediately:

  ```
  - A · Card grid + compact filter row (recommended): http://localhost:<port>/wireframe.html?v=a
  - B · List + map: http://localhost:<port>/wireframe.html?v=b
  - C · Table: http://localhost:<port>/wireframe.html?v=c
  ```

  Include one line: *"Each page has a top bar: toggle Concise, No repeats, turn on Colour, view Mobile, view Empty / Error, and the reasoning panel includes ready-to-copy feedback ideas."*

  Test-open each link (if probe already opened it, that is enough) before sending. If a server cannot be run, write the file path `file://…/wireframe.html` and mention the `?v=` parameter to select an option.

End with *"Choose A, B, or C, with Concise or No repeats if desired (sending back the link you are viewing is enough). Feedback by block number is also welcome."* The build follows the Colour level. Stop and wait.

If the user replies `ok`, `build directly` without specifying any letter, build the **recommended option**, with colour and accent following the recommended level, without asking again.

## U4. Real build ⚑

- **Project already has UI:** keep the brand per the colour role table (`review.md`, rebuild mode keeping the brand), styling follows the skill's style: walk through the entire table **"Styling taken from the skill, not from legacy CSS"** in `review.md` (dropdown, checkbox, border, scrollbar, header button…); at delivery include a `Styling:` line. Keeping the brand only means keeping colours by role, logo, and font. Page shell follows the selected option. Do not touch logic, handlers, or data; items needing new data get empty props and handlers, listed at delivery.
- **New product:** question 2 audit already ran at `U1`; proceed to question 3 in section 0 of `SKILL.md`, then build according to the selected option instead of the default layout in question 4. If there is no logo yet, build `ProductBrand` with the mark selected in the Logo group, with a favicon from the same mark (`components/logo.md`).
- **Request with more than one screen:** settle the elemental contract `D1` (`system.md`) here, before building the first screen. The selected wireframe specifies the shell; table `D1` specifies which control uses which variant across the whole set.
- Assemble using the skill's templates (`SKILL.md` section 2). Run probe `--sweep --wireframe "<link to selected option>&mau=mau"` until the `P` list is empty, at most three passes (from the second pass onwards add `--dynamic-widths` following the "Fix passes" line of the report, gate 3). **Fix probe items regarding styling as well**, even if not in `P`: header button row with inconsistent sizes, focus rings, native controls, elevated layers without motion, bold decorative borders, scrollbars. In `U4` styling belongs to the skill, so these are not "System drift left for customisation" as during review. **The `P` list includes the app shell on that route** (header, sidebar, bottom bar, notifications menu): the user looks at the whole screen, not just the newly built section. If the app shell has bugs, fix it directly in the shared component and state that it changes other screens as well. If a rebuilt page has the right layout but the header is still cramped, the viewer will still judge it as "ugly".
- **If the wireframe draws the app shell (header, sidebar), the app shell is also an option**: rebuild the shared component following the wireframe (number of items, which item is a solid button, which item is icon-only), styling follows the skill's style, colour follows colour roles. Do not leave the old header intact and merely patch it to prevent wrapping.
- **Build exactly the selected wireframe, do not invent.** The wireframe at the Colour level is the specification, already using tokens and components of the build (`U3`): the build is that rewritten in the project's code. **Do not add** items, text lines, badges, buttons, or blocks that the wireframe does not have; **do not remove** things the wireframe has; do not change the order. If you notice something missing in the wireframe, ask or note a line at delivery, do not insert it on your own.
  **If the user selects with Concise or No repeats**, the build is the wireframe with those toggles turned on: parts carrying `data-wf-gon`, `data-wf-lap` are not built; the `--wireframe` link keeps `&gon=1`, `&bolap=1` so the probe compares against the exact selected version.
- **Spacing, sizes, colours, and copy are copied intact from the wireframe, down to the exact px** ⚑. Padding of the page shell and each block, `gap` between blocks and within rows, height of header, search input, button, chip, sidebar width, card image dimensions, font size, font weight, line height, icon size; text colour, background, border following the tokens used by the wireframe. Copy is also copied intact: headings, placeholders, result count sentences, last row of lists, button labels. Method: open the wireframe file, **for each block copy the class string into the build** (the wireframe was already written using the project's classes and tokens, `U3`), do not rewrite from memory or project habits.
  - **If the project's existing page shell (container, layout, `PageShell`) has different padding from the wireframe, the wireframe wins**: change the padding on that shell (if shared, note that it changes other screens, as with the app shell above), do not let the old shell throw off the whole page. This is the most common mismatch.
  - Values in the wireframe not present in the project's spacing scale use that exact px (`pt-[18px]`), do not round to the nearest step: rounding causes a drift of a few px at every block, accumulating towards the bottom of the page.
  - **Run probe with `--wireframe "<link to selected option>&mau=mau"`** (`U3` link, or if the server was stopped, `file://$TMPDIR/forge-design/wireframe.html?v=<letter>&mau=mau`). Probe opens both at 1440 and 375, anchors by text, placeholder, icon, and reports **the exact delta** (*"«Rooms» → search input: build 33px, wireframe 16px"*), font size, font weight, different icon size, text colour, icon colour, different background (grouped by colour pairs, one wrong token is one line), missing or added text and icons. Without `mau=mau`, probe will not compare colours, because the Grey level intentionally disables accent colours. Those items go into the `P` list, fixed until empty like all `P` items. Deviations are only allowed when explicitly requested by the user or when real data differs from the wireframe (longer text causing an extra line); note each deviation at delivery.

  A few px drift per block, changing the count text, changing placeholders, or missing the last list row will make every block jump when sliding the wireframe-vs-build comparison slider back and forth.
- **Navigation items pointing to screens outside the request** (sidebar has "Patients" while the request only asked for a single record): that screen has not gone through `U2` and has no wireframe, so do not invent a layout. Build minimally following the skill's default pattern for that screen type (for a list, "List with filters" in `layouts/app.md`: search box, row per `components/list-row.md` with comparison values on the right), then note one line at delivery: *"Screen [X] is outside the request, built temporarily so menus do not lead to an empty page; let me know if you want it fully built."* Do not invent a layout: that ends up as a 1500px wide name + code column with the right half empty, no search box, and no comparison values.
- **Cross-check wireframe block by block before delivery.** Open the screenshot of the selected wireframe side-by-side with the 1440 build screenshot, walk through each block (header, sidebar, filter row, list, panel): item count, order, which item has a solid button, which item is icon-only, what the wireframe omitted. Spacing and copy are covered by probe's `--wireframe` comparison (above); your eyes watch what probe cannot anchor: blocks without text, images. Fix any mismatch, or write one line explaining why it differs (missing data, user requested). Colour follows "Each role gets exactly one colour code" in `review.md`: the grey wireframe did not specify colour, but the build must be cohesive from border to brand. The delivery message includes a *"Wireframe cross-check"* table: block, what wireframe has, what build has, match or reason for divergence. Include text line count for each item on both sides (probe "repeated items heavy with text").
- **After building, run one cleanup pass** on the new blocks **and the route's app shell**: `V1b` and `V1c` in `review.md` (cards varying in height because some rows have data and some do not, links looking like plain text, half-empty blocks on wide screens). Fix directly, do not present a table: the user has already chosen an option.
- **Call out things you cannot self-fix, do not stay silent** ⚑ (projects with existing UI). The cleanup pass only fixes styling and rearrangement. `V1b` items that remove, hide, merge information, consolidate decorative colours, competing colour roles (multi-coloured badges heavier than the price), and all **identity** issues that look bad per `V1` in `review.md` (role colours, fonts, logo, dark coloured blocks) are product and brand decisions: the build preserves them, but the delivery message includes an **"Observations"** section, at most five numbered lines. Each line describes one problem that end users run into along with a fix direction, stated in terms of hierarchy rather than colour (`V1b`, "Not a roundabout way to change colour"): *"1. Every card has a badge, five colours overlapping the image, eyes stop at the badge before the price. Keep badges only on exceptional listings (discount, verified)."* End with *"To fix any line, reply with its number, e.g. `fix 1, 3`."* If nothing is observed, write "Observations: none". This is not a gate: delivery is complete, whether the user replies or not is up to them. **Styling bugs covered by skill rules must be fixed before delivery, not pushed into "Observations"**: this section is reserved for decisions the build cannot make autonomously (e.g. 375px count row cutting the last item without faded edge per `R10`, email wrapping at domain hyphen per `description-list.md`: fix them, do not put them in "Observations").
- **Perform visual self-checks before delivery and write them down.** Open the 375, 1440, and 1920 screenshots from probe, answer each question as a line in the delivery message (if any question finds a bug, fix it first, then write "no"):
  1. Do cards or rows of the same type have varying heights because one row is missing a snippet?
  2. Do clickable elements ("View more" links, text buttons) look like plain text?
  3. Across the screen, how many bordered frames sit adjacent or nested? Can any be merged?
  4. At 1920, where is there unmotivated empty space (half cards, empty flanks)?
  5. Is the heaviest element on screen (boldest, most colourful) truly the primary task from `U2`?

  Without these lines written out, review is considered incomplete. If the user spots a bug covered by these five questions, the skill did not finish its job.
- **At delivery**, speak in experience language, not class names: how many steps the primary task now takes, where it is visible across breakpoints; before-and-after screenshots at 1280 and 375 as clickable links and a `compare.html` page like `V5` in `review.md` (including screenshots for items in "Observations"); list of things that need logic hooked up or data added. End with a **To adjust, let me know** line with 3–4 short sentences tailored to the build just completed, like the reasoning panel in `U3` (*"Add colour to the header"*, *"Bolder headings"*, *"More breathing room"*, *"Change font"*). Users often feel something is "not quite right" without being able to name it.

---

## U5. What not to do

- No moodboards, no separate hi-fi mocks then rebuilding: for this skill, code is hi-fi.
- Do not add features outside `U2` (chat, notifications, reviews) just for "completeness".
- Do not change colour roles of an existing project, unless the user explicitly asked to discard the old style (`review.md`, rebuild mode following the skill's style).
- Do not fall back to branch `V` midway through to "patch it quickly": the user asked to rethink the shell.

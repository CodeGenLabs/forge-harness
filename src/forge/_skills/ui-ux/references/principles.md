# General principles — rules N

Twelve principles that sit **behind** the M, T, F, I, R rules and the component files. These
are **not new rules**: each line gathers mistakes already made across many different
components, and points back to the original rule. Read this file **before building anything**,
especially anything that has no template file in `components/`: no skill writes a full spec
for every UI, so where there is no spec, the principles are the only thing to hold on to.

Each principle has a **test**: a question you can answer yourself by looking at the build.
Answering "no" means you are in violation, even if there is no specific rule for that
component yet.

**Above all twelve principles: follow the majority convention.** Wherever there is already a way
of doing something that most apps do and users are used to (a red `*` for required fields, a logo
in the top-left corner that goes home, ✕ in the top-right corner to close, Cancel to the left of the
primary button), do exactly that, **even when another way looks cleaner**. The user should not have
to stop and wonder. The skill's style (muted, few signals) only decides the places that have no
convention yet. Settled.

*Test:* does a first-time user opening this screen hit any spot where they have to ask "what does
this mean" or "where do I click to…"? If so, you are breaking convention there.

**Also above the twelve principles: if the project already has a colour language, follow the
project.** The skill's low-colour style (grey + one accent colour, `M4`, `M5`, single-hue charts in
light and dark shades) is **the default for an empty project**, not a filter to run over an existing
project. If the project already tints chips with a light accent colour, uses light-blue step blocks,
small purple pill labels at the top of sections, a glow on the primary button, one colour per category
in charts, then a newly built screen uses **the same approach** (`N5`), and a refactor **does not
neutralise** their colours. Walking into a colourful project and pulling it back to grey breaks their
identity; it does not make it prettier (settled). How to recognise it: count it like a
style, `P4` in `styles.md` (the "colour" line in layer 3, `SKILL.md` question 2).

Following the project means following **how it uses colour**; the **rules about meaning and
legibility** still hold in every project, because those are right and wrong, not taste:
- Red only for errors and for things that cannot be undone (`M30`). A red brand colour in content
  (logos, images) does not count.
- One status table for the whole app: "done" is the same colour everywhere (`M7`).
- Colour is never the only carrier of meaning or value: there is always text, a number or an icon with it (`N4`).
- Text meets 4.5:1 contrast, including coloured text on a light tinted background.
- One brand colour serves one role: if the project's accent colour is blue, then the primary button,
  the selected tab and links share that blue, with no second accent colour.

If the project uses colour haphazardly, with no pattern (each screen its own way), follow the
**newest** part as in `P5`, and mention it in one line at delivery.

*Test:* put the new screen next to the project's existing screens. Do they look like the same
product, or is the new screen a pale grey stranger among colourful screens?

---

**N1. Changing state does not make the interface jump or stretch.**

The user clicks, hovers, changes page, data arrives: everything **around** the spot that just
changed must stay still. Two ways to hold it: reserve space for the largest state up front, or change
with colour and opacity instead of adding or removing elements. Self-updating numbers (countdowns,
percentages, counters) are always `tabular-nums`.

Already happened: a tab adding a border when selected shoved the whole row (tabs always have a
`border`); pagination nav changing its number of cells per page (always 7 cells); the "Per page"
select drifting with the count string; a spinner inserted into a button made it swell (the spinner
replaces the icon); a % column misaligned because the buttons at the end of each row had different
widths (action column `w-20`); a calendar with 5 or 6 rows (always 6); a skeleton of the wrong shape
(`I19`); a scrollbar taking space when it appears (`I18`); changing the font weight of a tab when
selected; an OTP error line inserted that pushed the Confirm button out from under the cursor (the
error line reserves its space when it sits between the input and the button); an error or lock-reason
line replacing a `text-sm` description but dropping to `text-xs`, so the settings row shrank on toggle (the replacement line keeps the size of the line it replaces).

**Reserving space is for matching the neighbouring element**, not for keeping a shape. If there is
nothing alongside (a narrow screen stacked in one column, the whole row missing the same thing), drop
the reserved space so it does not become meaningless whitespace (already happened: the first month's
sparkline reserved space on mobile).

**Moving to a whole different screen does not count** (changing form step, changing page): the whole
screen has been replaced, there is nothing "alongside" left to hold. Do not `truncate` text that must
be read just to keep the height across screens (already happened: step names in the collapsed bar cut to "…").

**Open/close that deliberately pushes what is below** (accordion, collapsible group) cannot reserve
space, so it must **slide**, not jerk: `grid-rows` 0fr ↔ 1fr, no `<details>`, no conditional
rendering (`I30`).

*Test:* toggle each state in turn, and watch the **neighbouring element**, not the element that just
changed. Does anything move, even by 1px?

---

**N2. Every state is built, and each one can be told apart at a glance.**

List the states before building: default, hover, keyboard focus (only inputs and menu items; the rest
draw no focus ring, per `I13`), selected, disabled, loading, empty, error, done, and **edge cases**
(nothing, one, very long, very many). One static example per state (`SKILL.md` scope). Two states
with different meanings must look clearly
different.

Already happened: done but the bar still full black as if running (done is emerald); the current page
looking like an input; a secondary button looking disabled (`I8`); today and the selected date
confused with each other (bold text + dot, versus solid background); one page and 0 rows still showing
all their dead controls; an error step with no shape of its own; a file rejected for being too large still having an empty progress track, reading as "waiting to run"; a disabled upload box with the same background as while a file is being dragged in; a collapsed step bar filling in the whole current
segment so "on the last step" looked like "all done", fixed by making it grey so "Step 2 / 3"
then read like a missing bar (in progress is a third level, half strength).

Named exception: a **selected** table row and a **hovered** row share the same faint background,
because the two states are already separated by the ticked checkbox (settled, `I10`). A different
look does not have to mean a different background. This exception is **only for table rows with a
checkbox**. The sidebar and file tree have no checkbox, so selected is one step stronger than hover:
hover `hover:bg-item-hover`, selected `bg-secondary` + `font-medium`, no accent colour, no border
(settled).

*Test:* cover the text and look only at the shapes. Can you still say which state this is?

---

**N3. One signal per idea. Save the strongest signal for exactly one place.**

Accent-colour backgrounds, solid filled blocks, red, bold text are **expensive** signals: each screen
spends them once. Hierarchy comes from font size, weight and position first; colour and shadow last
(`M13`, `T8`). If there is already one marker, do not add a second marker for the same idea (`M6`, `F6`).

Already happened: three black blocks in the time picker (one light band); a trash icon at the top of
the dialog and on the button (the button is text only); a banner tinting its whole description (only the
icon and title); an error line saying "then try again" next to a Try again button; "View all" wanting to
be black on every card (`I1`, `I3`); the page title lighter than the section titles beneath it; an
expired OTP screen with both "Send new code" in the error line and "Resend code" below (two buttons, one
job: keep one); a finished upload with a full green bar + `100%` + "Upload complete" (three signals,
one idea: drop the bar and the number, keep the text).

**The same sentence in every cell, every row, is also one idea said many times**: pull it out and say
it once at the top of the group. Already happened: "vs 2025" in all four stat cells
(that very suffix made the narrow cells wrap; do not fix it by stacking into one column instead of
dropping the suffix); a new customer showing "No previous period" four times; `/2026` on every
timestamp; a Status column with a green "Active" badge on 14/18 rows. **The normal state needs no marker; only exceptions get one** (an invite "Pending"). In
a customer panel, `text-3xl` stats larger than the customer's name are also wrong: the heaviest thing must be the thing that answers "what
am I looking at".

**The thing just clicked to open something is also one saying.** Already happened: click the
avatar to open a menu, and the top of the menu has another 40px avatar larger than the button just
clicked; a header with an avatar while the sidebar footer still has a profile row opening the same menu
(two entrances to one place); on a narrow screen the account list drops right below the menu header,
so the current account appears twice in a row.

**Once something is said by position, do not say it again with a shape. One running task, one spinner.**
Already happened in a chat panel: right-aligned bubbles already said "who is speaking", yet every
answer still had a robot circle; opening the tool list showed a spinner on both the top row and the
step row; a failed tool whose failure the answer already explained still had a red "1 error", a red
icon, and a description line, four times one idea (`components/chat.md`). On the same screen, tool
step names were as heavy as the answer: **the process is always lighter than the result**, and it does
not pre-announce the result (a step description saying "total 409,000,000" right above an answer that
opens with that exact number).

*Test:* count the solid-filled or coloured spots on the screen. Can each one answer "what does it say
that no other spot has said yet"?

---

**N4. Colour states status, from exactly one table for the whole app, and always comes with text.**

Colour is not for decoration and not for categorising (`M4`, `M5`). Which status gets which colour
comes from **one** table (`M7`, `D2`, `M30`): grey pending, green done, amber needs
attention, red broken. Colour follows **good or bad**, not up or down. Colour never
stands alone: there is always text or an icon saying the same thing, because colour-blind users and
screen readers cannot see colour.

Already happened: up/down colour inferred from the sign of the number (costs went up and showed
green); the lightest grey series in a chart almost white, saved only by the numbers on top of the bars;
a progress bar changing colour with no line of text; only a red segment on the step bar on narrow
screens without saying which step was wrong.

*Test:* switch the screen to black and white. Can every state still be read?

---

**N5. Same role, same template, same classes.**

If something already has a template, copy the template; do not mould a variant (`SKILL.md` section 2
"assemble, do not redraw", `D1`, `D8`). When a new component shares a part with an existing one, borrow
exactly that part: a field that opens a popover looks exactly like an input, a button in a form is as
tall as the input, every calendar uses one grid.

Already happened: the two ends of a date range in different shades; an error step circle shaped
differently from a done step circle; "Download report" borrowing the "View all" template by mistake
(buttons follow the type of action, not where they stand); `₫` here and `VND` there; `12,4 / 20` next to `4/6`; the grey scale of a grouped bar chart differing from the donut's grey scale; `2,8 %` in the main number next to `27,3%` in the
comparison line; a label–value block
writing status, category labels and money as plain text instead of using the existing badge,
pill and currency format; a large avatar on the profile page built separately, so it differed in colour from
the same person's avatar in the header; an email in a confirm dialog not using the line-breaking
already defined in the label–value block. **A value that has its own template uses that template everywhere**,
even when it sits inside another component. **Borrowing a template means borrowing the classes too**, not just
the look (font size, connector thickness, how the first line aligns with the circle).

*Test:* for each new element, does the skill already have something with **the same role**?
If so, are the classes the same?

---

**N6. Text does the job: what happened, why, what to do next.**

Long messages split into **two levels**: the top level says what happened, the lower level says why or
the consequence, with concrete numbers and dates. Error messages say how to fix it, without repeating the
label or placeholder (`T20`, `T22`, `layouts/form.md`). Disabled things say why they are disabled. Pointers
to somewhere else are buttons or links, not plain text.

Already happened: an error toast breaking into three lines; a load error with a single sentence and no
reason; "Choose an expiry date" as an error message (reads like an instruction); "e.g. 31/12/2026" for
a field you cannot type in; "Change in Settings" not clickable; the line under the calendar still
saying "Choose a start date" after it was chosen. An OTP screen with no "Change email": a mistyped
email means you are stuck, with no way back. **Every step needs a way out when the user takes a wrong
turn.** Stopping something yourself can also be a wrong turn: a stopped answer with no Regenerate means
retyping the whole question (`components/chat.md`).

**An error message must not invent a rule the system never checks.** It teaches the user something
wrong, and contradicts the data shown on the same screen (a multi-tag input
saying "needs an @ and a .com ending" while the valid emails right above it are
`@saoviet.vn`). Write what is actually checked: "needs an @ and a domain".

**When the screen is empty and the user is the one who has to start, the empty state is something
clickable right away**, not a "nothing yet" notice. Already happened: a new chat showing only "No
messages yet" in the middle of the screen (replace with 2–3 starter suggestions, `components/chat.md`).
Lists filled by the system (orders, notifications) still get one faint line of text (`components/empty-state.md`).

*Test:* after reading this sentence, does the user know what to do next?

---

**N7. Do not act for the user, do not guess for the user.**

If nothing is chosen, leave it empty and show a placeholder. Suggestions go in the suggestion area,
not into the field. Do not invent numbers, do not pre-tick consent.

Already happened: opening the time picker auto-filled `00:00:00`; choosing a date made the date-time
field grab a time on its own; tabs with invented counts for show. Named exception: a radio group always
has one option preselected (`components/choice-controls.md`).

*Test:* is there any value in a field that the user has never touched?

---

**N8. Do not cover or cut off what the user needs in order to decide.**

The page does not scroll horizontally (`R1`, `T13`). An overlay does not cover the field that opened
it. Whatever is used to confirm (the name of the object about to be deleted) is not `truncated`.
Descriptions wrap; only one-line titles get cut, and cut text has a `title` (`T14`). **Descriptions that
wrap are always `text-pretty`** (`T10`), especially in narrow columns: no single orphan word on the last line. No text sliced in half.

Already happened: a date-range calendar flipping upward to cover its own field; numbers in a wheel cut
in half at the edge; the top half of a popover blank because of inserted padding. Step descriptions in a
vertical step list dropping single words onto their own line
(a ~200px column, missing `text-pretty`). A "Change email" link broken in two at the end of a line. **A short link inside
a sentence is not broken midway**: `whitespace-nowrap` so it wraps as a whole
unit. Button labels are the opposite: they may wrap (`T15`). **Text drawn over a graphic (numbers on a
chart) goes on the empty side**, not fixed to one side: a "44.4M" label placed above a dot
sat right on the rising line segment, its background cutting the line in two. A number without its
date, when the axis shows only a few labels, is also missing something that must be read: you cannot tell which day it belongs to.

**If something must be cut, cut the part that is the same and keep the part that differs.** Cutting at
the end is not the only way, and wrapping is not the only alternative. Emails keep the domain and cut
the part before `@` (`layouts/overlay.md`, "Truncating emails"); file names keep the `.pdf` extension.
Already happened in an account switcher menu: afraid of losing the domain, emails were allowed to wrap,
each row became three lines, and the submenu was heavier than the parent menu. In menus, option rows and
narrow cells: one line per field.

*Test:* at 375px and with the longest data, can the user still read everything they need in order to
click?

---

**N9. Every action works with a mouse, with the keyboard, and with a finger on a phone.**

Clickable things have hover and `cursor-pointer` on the actual clickable element, and the hit area
spans the whole row (`I9`, `I29`). They can be reached with Tab; no focus ring is drawn (`I13`, settled). With no
hover on touch screens, anything that shows on hover must always be visible (`I11`). Anything
selectable can be selected in several ways, not just one gesture. `aria-*` for things expressed only
visually (`aria-pressed`, `aria-current`, `role="progressbar"`).

**Clickable things whose visual is smaller than 32px** (inline text buttons like "Try again", "Resend", a `size-7` icon button
next to a value) **keep the visual and enlarge the hit area with `relative before:absolute before:-inset-*`**
up to ~32–40px, without enlarging the visual: a bigger visual misaligns the row and outweighs its job. The negative value here
must stay (`N11`). If two enlarged areas touch, move the item onto its own row first. Already happened:
a 28px copy button, an 18px "Resend · Cancel", a 16px "Try again"; the formula for
each spot is in `components/description-list.md`, `layouts/app.md` (Profile), `components/file-upload.md`.

Already happened: a time wheel selectable only by scrolling, and the scroll stalling midway; only
‹ › arrows to change month, so going far tires the hand (the title opens a month/year grid).

*Test:* unplug the mouse and use Tab + Enter + arrows to go through the whole screen. Then open it on a
phone. Does it get stuck anywhere?

---

**N10. The skill handles the look; the user handles the logic.**

Everything with data consequences is the user's decision: when to save, what to call, which dates
are disabled, colour-change thresholds, whether something reappears after being closed. The skill
leaves empty props or handlers, and only decides **what each of those choices looks like**. Details
are in the scope section at the top of `SKILL.md`.

Tools too: which library and which component set belong to the project. **Check before building**
anything that usually has its own library (charts, calendars, tables, virtual lists): if there is one,
use exactly that, adjusted to match the look (turn off what it enables by default, take colours from
tokens), and do not redraw it alongside. If there is none, do not install one yourself: build normally,
and only propose a library when there is a real need that would be costly to build by hand. Choose by
criteria (lightweight, solves exactly the problem, fits the ecosystem), not by familiar names.

*Test:* does the code just written call an API, set a threshold, persist state, or schedule a timer
that the request did not ask for?

---

**N11. Do not use negative values for spacing and position unless there is no other way.**

Negative margins (`-mt-*`, `-mx-*`), `-space-*`, `-translate-*`, `-inset-*`, `top-[-…]`: negative
values pull an element out of its place, so the bounding box no longer tells the truth about its size.
Change the padding in one place and something else shifts with it, and it tends to show up in other
states (a negative margin in an accordion made a closed item leak the first line of its answer; a `size-8`
⋯ button on a kanban card pulled `-mr-2`, so the wrapper shrank to 24px and the Button's `max-w-full`
squeezed the button to 24×32).
Settled: avoiding them takes priority at any cost.

Work in this order:

1. **Put padding on the element that needs it.** If a divider should run to the edge, the container has
   no horizontal padding and each row has its own `px`: the line reaches the edge on its own, nothing is pulled out.
2. **Accept the spacing that fixed padding produces**, instead of pulling things closer. Do not
   change one block's padding by state to compensate for its neighbour: tint that block's background and the
   text sits off-centre (an accordion trimming the button's `pb` when open, `I30`).
3. **`gap`, `items-*` alignment, changing `leading`** to line things up, instead of nudging with `translate`.
   **Centering around a point** (a dot on a chart, a label on a handle): place an `absolute
   w-0 flex justify-center` box exactly at the point with the element inside it, not `-translate-x-1/2`.
4. If none of the above works: use the negative value, and **write a comment with the reason right above that line**, like
   `eslint-disable`. Places tried and kept: stacked avatars (`avatar.md`); a hit area
   extending beyond a small element (`before:-inset-*`, `N9`); an inline-edit name frame extending
   beyond the text so the text stays aligned with the column (`inline-edit.md`); a row of icons with a hover background inside a column of text
   (`button.md`, the `ghost` section); the bold segment of the file tree's vertical line (`tree.md`).

**Not counted as `N11` negatives**: the starting point of a motion (`-translate-y-1 → 0` for a
dropdown, `-translate-y-full → 0` for a toast at the top). That is the direction it slides in, not a resting
spacing or position; a resting element is always at `translate-0`.

*Test:* grep `-m[trblxy]?-|-space-|-translate-|-inset-` in the file just built. Every
result must have a comment explaining why approaches 1–3 could not do it (except motion starting points).

---

**N12. Text in a block has hierarchy, rhythm, and names that are not cut short** ⚑.

Applies to **every repeated block**: listing cards, job cards, product cards, list rows, grid
cells, including kinds that have no template yet. No per-kind template is needed; these three points are enough:

1. **The type scale within a block steps by one.** At most three font sizes, and the largest is only one
   step of the scale above the item name (`budgets.md`): with a `text-sm` name, the price or main number is `text-base`
   `font-semibold`, not a jump to `text-lg`, `text-xl`. The rest of the hierarchy comes from weight
   and colour. A price one and a half times the size of the name makes the card read like a price list, with the name as secondary text. Exception: stat
   cards, where the main number is the whole block (`components/charts.md`).
2. **Rhythm by group: close within a group, far between groups.** Group text by meaning (price +
   name; area · location · nearby landmark; posting time). Lines within a group are **4px
   (`gap-1`)** apart, not `gap-0.5`: at 2px two lines stick together, especially lines with diacritics
   (settled). Between groups 8–12px, and the space from text to the block edge is no smaller
   than the space between groups. Evenly spaced lines mean there are no groups, and the eye reads one lump of text.
3. **The name that identifies an item is not cut short.** In a repeated block where each item is its own block (cards in a
   grid), the name is `line-clamp-2`; one-line `truncate` is only for dense lists (table rows,
   sidebar, `T14`). A name cut after twenty-odd characters ("Self-contained room for rent …") loses
   exactly what the user reads to choose (`N8`).

Settled: do not write more per-kind templates; write the general test.

*Test:* the probe's "REPEATED BLOCKS" section (cards with images: largest text versus the name, spacing between lines,
names cut to one line). For blocks without images, check the three points above yourself from screenshots.

---

## Building something with no template

A vertical stepper, a timeline, a file tree, nested comments… with no file
in `components/`:

1. **Find the closest thing that has a template and borrow its frame** (`N5`). A vertical stepper borrows the circles,
   connectors and four states of the step bar (`layouts/form.md`); nested comments
   borrow the list row (`components/list-row.md`); a file tree borrows the sidebar link
   with a submenu (`layouts/app.md`); a chat panel borrows the file tree, the outline button and
   "Load error" (`components/chat.md`).
   **Only borrow from files in the skill**, not from unreviewed builds in the project.
   A frame taken from a file is still there for the next project, and mistakes do not get duplicated.
   **Borrow the frame, not the content.** A new frame doing a different job chooses its content again
   for its own job: a detail page borrows the name row and stat cells of the quick-view panel, but the
   tab set must include the main child records (a customer page that copied the panel's Messages / Files /
   Activity tabs wholesale had nowhere to see 24 orders, `layouts/app.md`).
2. **Build the edge cases straight into the page**, not only the pretty case (`N2`, `S8`). For repeated blocks (cards,
   rows, cells), each copy is one case: a one-line name and a very long name, `0` and a very large number,
   missing image, missing description, one item and many items. If it cannot repeat (a form, a panel),
   show one static example per state side by side.
3. **Run the probe and fix things yourself** as in gate 3 (`checklist.md`): `--sweep`, fix until the
   `P` list is empty, at most three rounds.
4. **Review by eye the five questions a machine cannot measure** ⚑. Open the 375px screenshot and one desktop screenshot,
   and look at exactly the edge cases just built:
   - **Do the edge cases look intentional?** Counts of `0` ("0 photos", "0 comments") are hidden,
     or said in words ("No photos yet"). A missing image is a "no photo yet" state; do not
     leave a count badge sitting on a placeholder image. A missing description makes the block shrink, with no blank line.
   - **Is there any empty space that exists only to hold a place?** Holding a place is fine when it keeps
     important things aligned in a grid (price, buttons at the same height across cards). Then mention it in one
     line at delivery. If it does not do that, drop it.
   - **Do the copies of the repeated block use the same notation?** The same number format and unit
     within one list ("4.5 million" with "0.85 million", not mixed with "850,000"), the same
     line order, the same labels (`N5`).
   - **Is any area overloaded?** On an image, on the header, in a corner:
     more than three things stacked on top of each other means grouping or moving some out of that area (`N3`).
   - **Is what is needed to decide still intact in the longest case?** The longest name, the largest
     price, at 375px (`N8`).

   Any question answered "no" gets fixed, then go back to step 3.
5. **Run the twelve tests** above before reporting done.
6. At delivery say one line: *"X has no reviewed template, so I borrowed the frame of Y"*, plus one line per
   trade-off (e.g. *"the name reserves two lines so prices line up across
   cards"*).

This flow applies to both new builds and the rebuild mode of branch `V` (`review.md`). Unfamiliar
elements not covered by the skill are normal, so there is no need for a template for everything: borrow the closest
frame, build the edge cases, let the machine measure, then review the five questions above by eye.

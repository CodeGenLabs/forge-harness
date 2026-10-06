# In-app screen layouts

> **Settle the screen type first, open this file second.** With ready-made kanban sample code
> it is very easy to read every vague request as a kanban. See rules `S10` and `S11` in `../../SKILL.md`.


With no wireframe, build the default layout (or the one the conditions in the request
pick) and report it in one line at delivery. See question 4 in `../../SKILL.md`. The rhythm here is the app rhythm:
`p-5`, `gap-3`, `text-sm`, thin borders, almost no shadow.

---

## Dashboard

**A. Stat row on top, widget grid below** (default)

```
┌─────────────────────────────────────┐
│ header pill: greeting     [Settings]│
├───────┬───────┬───────┬─────────────┤
│ stat 1│ stat 2│ stat 3│ stat 4      │  <- 1 block split by dividers, NOT 4 cards
├───────┴───────┴───┬─────────────────┤
│ main widget       │ side widget     │  <- main widget col-span-2
│ (col-span-2)      ├─────────────────┤
│                   │ side widget     │
└───────────────────┴─────────────────┘
```

Do not split into three equal columns. The most important widget takes double the width.
The four stat tiles use **a single colour**; they differ in the number, not in the colour.

**Blocks commonly found on an overview screen.** If the request leaves it open, build the **default set**
below without asking (`S5`). Default set: **stat tile row + trend chart
(main widget) + progress list + today's tasks** — four blocks. If several
people work together, add recent activity. At delivery, list the blocks you built.

| Block | When it earns a place |
| --- | --- |
| Stat tile row | Almost always. Four tiles is right, six starts to feel thin. Mobile 2×2, see `../components/charts.md` |
| Trend chart over time | When there is data accumulated by week or month |
| Progress list by group | When work splits into projects or groups |
| Today's tasks | When the user comes here to get to work, not to read a report |
| Recent activity | When several people work together and need to know who just touched what |
| Detail table | When this screen replaces the list page outright. With a table, drop some widgets |

Three blocks is thin for an overview screen. Four to five is right. If the request asks for more than six blocks,
still build them, and at delivery suggest in one sentence which block should move to its own screen.

See `../components/charts.md` for chart recipes and colour rules.

**Block details**:

- **A main widget that counts per period is a bar chart, not a line.** "Tasks done per week", "orders per day" are discrete counts per period; bars with numbers on top read all 8 weeks at once, a line only labels the last point, and to know week 24/08 you must hover each point. Choose the type with the "Bar or line" table in `../components/charts.md`.
- **Progress list: the bar is always `bg-primary`, only the "2 tasks overdue" phrase is amber.** Overdue is a different matter from percent done; painting a whole 93% bar amber reads as "progress is in trouble", and two of four orange bars become the heaviest thing on the screen. Painting the whole secondary line "112 / 120 tasks · 2 tasks overdue" is also wrong: the today's tasks block right next to it only colours the phrase "2 days overdue", two blocks on one screen doing it two ways (`N5`). Details in "Progress bars in a list", `../components/charts.md`.
- **Recent activity is the feed of the whole workspace, not the timeline of one record.** Do not lift `../components/timeline.md` (icon ring per task type, connecting line, bold task-type label, actor on the last line in small size): the question here is "**who** just touched **what**", while the timeline pattern puts the task type in bold, the task name in grey and the actor on the faintest line. Each item is four lines, six items are 820px tall. Pattern, as in popular project management apps:

  ```
  (AC)  Alex Carter completed Update team photo on the about page
        Acme Studio website · 09:37
  ```

  - Actor avatar `size-8` on the left (`avatar.md`), no task-type icon ring, no connecting line (the items are not steps of one thing).
  - One sentence `text-sm text-muted line-clamp-2`: **person name** `font-medium text-foreground`, verb in grey, **object name** `text-foreground` and a link to that object (`N8`; a block with no links at all is a dead end, as in "Other records mentioned on a page are links" below).
  - Secondary line `text-xs text-muted`: project · time. Today shows the time, yesterday shows "Yesterday", older shows the date. Long project `truncate`, time `shrink-0`.
  - **5 items**, header has "View all" like the other list blocks on the screen (`card.md`). A page 1512px tall drops to ~1150px, and the two columns end at roughly the same height.
- **The two grid columns must end at roughly the same height.** The today's tasks block is `self-start` (correct, do not stretch an empty white card), but if the right column is twice as long, there is a 450px grey area under the left column. Fix it by **cutting the row count of the long block** (activity feed 5 items, today's tasks at most 8 then "View all"), not by stretching the short block, not by reordering blocks.
- **New workspace (no projects yet): a "Getting started" frame replaces the whole grid.** Do not build all five blocks and give each one a "No … yet" sentence: five frames saying one thing (`N3`), a 340px chart frame holding one line of text, and the whole screen has **no way forward** (`N6`). The frame follows the **Getting started** section right below; if the app has no checklist, use a welcome block: title `text-base font-semibold` ("Start with your first project"), one sentence on why, `primary` button "+ Create project" (`I2`: the only way forward from an empty screen). It sits in a white card like every other block, not on a transparent background. Once there is one project, the grid comes back **below** the steps frame (the frame stays until everything is done or it is hidden), and any block with no numbers yet follows that block's empty case (chart with one point, today's tasks empty).
- **A block with no data drops "View all"**; a button leading to an empty list is redundant. "No tasks due today" is only true when there are tasks and none is due today; with no tasks at all the sentence is "No tasks have been assigned to you yet".
- **Empty sentences of blocks in the same row align the same way.** A chart frame centring its sentence vertically while the progress frame next to it puts the sentence at the top: one row, two positions (`N5`). Centre both in their frames.

**B. Left navigation column, content on the right** (when there are 5 or more navigation items)

See the **App shell with sidebar** section below for the full recipe.

### Getting started (onboarding)

Checklist for someone new to the app: create a project, invite people, assign the first task… Pattern follows how large design systems build a "setup guide":
each step has a round tick box, a step can be expanded, only the first step is open by default, there is a button to hide the whole frame,
and a "1 / 5 steps" line.

```
┌──────────────────────────────────────────────────┐
│ Getting started                     1 / 5 steps ✕ │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
├──────────────────────────────────────────────────┤
│ (✓) Create workspace                           ⌄ │
├──────────────────────────────────────────────────┤
│ ( ) Create your first project                  ⌃ │
│     A project gathers tasks, documents and people… │
│     [ Create project ]                           │
├──────────────────────────────────────────────────┤
│ ( ) Invite members                             ⌄ │
├──────────────────────────────────────────────────┤
│ ( ) Assign the first task                      ⌄ │
└──────────────────────────────────────────────────┘
```

- **One place, by default the top of the Overview.** Someone new lands on the overview, so
  the frame lives there: if the workspace is empty it replaces the whole grid, otherwise it sits above the grid, **separated from the grid by
  `mt-6` (24px), not by the grid's `gap-3`**. A `text-xs` caption line above the stat row
  (`mb-2`, "First week, no previous week to compare") that is 12px from the frame above and 8px from the stat row is only
  4px different and reads as the caption of the steps frame; 24px versus 8px makes it clear it belongs
  to the stat row. Do not build
  a separate "Welcome" page when the overview already has a welcome block: after clicking "Go to overview" you
  meet "Start with your first project" + a "Create project" button again, two screens saying one thing (`N3`), and the welcome
  page header still says "Overview" next to a "Go to overview" button. A separate page only
  when the product has a dedicated "Get started" item in the sidebar, and then the overview no longer has a welcome block.
  No "Welcome to …" title needed: the workspace name is already at the top of the sidebar (`form.md`, do not invent greetings).
- **Frame**: one card, steps split by dividers (`F3`, not one card per step). First row: the name
  "Getting started" `text-sm font-medium`, "1 / 5 steps" on the right, progress bar below
  (`../components/charts.md`), hide button `X` ghost `size-8` in the right corner, **aligned in a column with the chevrons
  of the rows** below.
- **The left ring is a tick box, not a number.** Not done: ring `size-5` dashed border
  `border-[1.5px] border-dashed border-foreground/40`. Done: `size-5 bg-primary` + white `Check`
  `size-3`. Ordinal numbers read as mandatory sequential steps; if the user does steps 3 and 5 first, the
  screen becomes "step 2 is the next step" between two done steps. Do not borrow the `size-8` number ring from
  the step bar of a multi-step form. The order of the list is already the suggestion.
- **Each step is an accordion item, only the next step is open by default.** Full-row title button
  per `../components/accordion.md`: ring, name `text-sm font-medium`, `ChevronDown` on the right,
  row `px-4 py-3 sm:px-5` (44px tall, enough tap target on touch screens), ring centred on the name line.
  Next step = the first not-done step that can be done right away. Expanded: body `pb-4`, indented left by
  the row's `px` + 20px ring + `gap-3`; one sentence on why `text-sm text-muted` **no `mt`**, then the button
  `mt-4` **below the sentence, left-aligned with the name**, at every width (do not push it right and then restack on narrow
  screens). Measured: name → sentence 12px, sentence → button 16px, button → bottom edge 16px; the sentence sticks to its name.
  Do not add `mt-1` to the sentence: it stacks on the title button's bottom padding, name → sentence 20px while sentence → button
  13px, and the sentence drifts down to stick to the button (the FAQ in `accordion.md` also has no `mt` on the answer).
  Do not open every step: five descriptions + four buttons stacked in a right column, the step name repeated on the button
  ("Invite members" / "Invite members"), card 830px tall at 1280 and 1540px at 375; with the accordion it is
  390px and 830px, and one solid button.
- **Button**: the next step is `primary`, the only solid button in the frame (`I3`); other steps the user
  opens themselves get an outline button. No "Go to overview" button: the frame already sits on the overview.
- **Locked step** (another step must be done first): ring like a not-done step, expanded it shows a reason sentence
  naming the step to do first ("Create a project first: every task must live in a project"), **no faded button**.
  A 50% `disabled` button on white almost disappears and reads as an empty frame.
- **Done step**: name `text-muted`, **no strikethrough** (strikethrough belongs to task lists the user
  ticks themselves; steps here are marked by the app), collapsed by default, still expandable.
- **Hide**: clicking `X` hides it immediately, no confirmation dialog; toast "Getting started hidden" with "Undo"
  (`../system.md`, recoverable delete).
- **All done**: green bar, the step list **collapses fully**, the frame keeps its first row and one sentence "All
  steps done. The workspace is ready for the whole team." plus the `X` button. Do not reprint the five done rows: five black
  rings stacked in a column become the heaviest thing on the screen with nothing left to do. This approach is
  the skill's choice; large design systems have not settled the all-done case.
- **States required on the `/states` page**: just arrived (one step done), done out of order, locked step
  unlocked, all done, and hidden (overview no longer has the frame).

---

## App shell with sidebar

```
 white bg --surface      grey bg --background
┌──────────────┐░┌──────────────────────────────────────┐
│ ◐ Org        │░│ Page / Current section [bell][avatar] │
├──────────────┤░├──────────────────────────────────────┤  <- one horizontal border-border line, running across both columns
│ [search  ⌘K] │░│                                      │
│              │░│                                      │
│ ⌂ Home       │░│                                      │
│ ✉ Inbox    20│░│  <- count right-aligned, plain number │
│ ☑ Tasks      │░│                                      │
│              │░│  <- only whitespace between groups    │
│ WORK       ⌄ │░│  <- group label UPPERCASE, click to collapse │
│ ▤ Projects 4 │░│                                      │
│ ▦ Documents  │░│                                      │
│              │░│                                      │
│ SALES      › │░│  <- collapsed group                   │
│              │░│                                      │
│ ⚙ Settings   │░│                                      │
│ ◐ User name ⇕│░│  <- pinned to bottom (drop if avatar is in header) │
└──────────────┘░└──────────────────────────────────────┘
                ↑ NO vertical line: white next to grey is already the boundary
```

- **Sidebar on white `--surface`, **no** `border-r`** when the content area is the grey page background `--background`: white next to grey is already the boundary, adding a line is two signals for one idea (`N3`; rejected). Only draw `border-r border-border-strong` when the content area is also white. **Do not leave the sidebar transparent** inheriting the page's `--background`: a grey sidebar matching the page background turns the whole screen into one grey mass with no boundary left.
- **Width `w-60` to `w-64`**, fixed, `shrink-0`.
- **Hover is `hover:bg-item-hover`, selected is one step darker `bg-secondary` + `font-medium`.** The two backgrounds must differ: if hover shows exactly the selected background, hovering any item looks like it was just selected, and you can no longer tell which page you are on (`I10`; settled). "Hover and selected share one faint background" only remains for table rows ticked by checkbox, because there the checkbox is already the selection mark. **No accent colour**, no border.
- **Each link is 40px tall** (`h-10`, `px-3`), radius `rounded-xl` 12px per the radius-by-height rule `F1`. A 36px link looks cramped and the hover background feels sunk; 40px gives the row air and is easier to hit.
- **Icon and text go together.** At rest both are `text-foreground/70`: softer than the main text but **not faded down to `--muted`**; `--muted` grey on white makes item names unreadable. On hover or selected, **both icon and text** go to `text-foreground`. Set the colour on the `<a>` element and let the icon use `currentColor`; do not give the icon its own colour, otherwise hover only brightens the text.
- **Group labels UPPERCASE, in GREY**: `text-xs font-medium uppercase tracking-wide text-muted`, only on hover going to `text-foreground`. UPPERCASE already separates the label from the links, so the label must be **lighter** than its children, not heavier: a black `--foreground` label plus UPPERCASE is the heaviest thing in the column and overpowers the selected item. In lower case the group label looks just like a faded nav item, and the eye cannot tell which is the heading and which is a link. The text in the data stays normal case ("Work"), uppercased by CSS, so screen readers do not spell it out letter by letter.
- ****No** dividers between groups**; separate with `mt-4` whitespace and the group label. A grey UPPERCASE label + chevron is enough to say "a new group starts" even when the sidebar scrolls; adding a line is three signals for one idea (`N3`). Large management apps do not draw them. Do not draw `border-t` above each group: three lines across the column become the heaviest thing in the sidebar (rejected: "the line is a bit heavy").
- **The sidebar keeps only one `border-border` line**: under the sidebar head (workspace name), the same colour as the line under the header and the dividers in menus and popovers (`overlay.md`). The whole app shell uses one line colour: a sidebar head at `#eaeaea` while the account menu divider is `#f7f7f8` shows two line colours for one job (settled; do not bring back `--border-strong` on the grounds that `--border` is "almost invisible"). Shell lines are only hints; blocks separate by white next to grey.
- **The line under the sidebar head runs the FULL width, edge to edge.** Put it on the sidebar head element, not inside a horizontally padded area. Do not patch it with `-mx-3`: change the padding in one place and the line shifts. **If the nav area scrolls, the scrollbar must not reserve space** (`scrollbar-gutter: auto`, auto-hiding scrollbar per `I18`): a reserved 4px gutter makes the hover background of every item in the scroll area 4px short on the right compared with Settings and the profile row outside the scroll area.
- **A sidebar with many links gets collapsible groups.** From **3 labelled groups up**, or when the total item count makes the sidebar scroll: the group label becomes a **full-row button** (`I29`), chevron at the right edge (`ChevronDown` `size-4`, rotated `-rotate-90` when closed), with `aria-expanded`. Label hover uses the `--background` fill like nav items.
  - **The label button has the same shape as its children**: same `h-10 px-3`, same `rounded-xl`. Set height with `h-10`, not `py`, because the label's `text-xs` is shorter than the link's `text-sm`; with `py` the label button is shorter than the child rows. The label text's left edge aligns with the child icons, the chevron aligns with the badges' right edge.
  - **Children are not indented, no vertical line.** A group here is a *section*; the children are peers and already have their own icons. Indent plus a vertical line is the language of a **nested tree**, and it eats 16-20px of an already narrow column, so long text is cut sooner.
  - Only indent + vertical line when it is a **submenu of one link** (Projects ▸ Project A, Project B): children have **no icon**, are indented so their text aligns with the parent link's text, and the vertical line `border-l border-border-strong` runs at the parent icon's centre. A selected child darkens its segment of the line to `--foreground`.
  - **Open/close slides**, no flicker: `grid` with `grid-rows-[1fr]` ↔ `grid-rows-[0fr]`, child wrapped in `overflow-hidden min-h-0`, `transition-[grid-template-rows] duration-200 ease-out`. The chevron rotates with `duration-200`. Do not measure height with JS. Add `motion-reduce:transition-none`. A closed group gets `inert` so Tab does not land on hidden links.
  - The first unlabelled group (Overview, Inbox) is always open, not collapsible.
  - Default is **all open**. The group containing the current page **must not be closed on page load**, otherwise people cannot see where they are.
- **The sidebar scrollbar auto-hides** per `I18`: invisible at rest, shown on hover or while scrolling, 4px. A static grey scrollbar running down a white sidebar is the heaviest thing in the column, heavier than the text.
- **Counts right-aligned, as plain numbers** `text-xs tabular-nums text-muted`, no pill, no border. Five bordered pills in a column are five small frames pulling the eye. On the selected item the number goes to `text-foreground` with the text. **No brand-colour badge**, see `../components/small-controls.md`.
- **Links are spaced `gap-1` (4px)**, not `gap-0.5`: at 2px the hover backgrounds of two adjacent items
  almost touch and the column reads as one block (the maintainers noticed).
- **If the project already has brand-colour badges in the sidebar** ("New" on red, colour role, `review.md`), keep them,
  but **when the selected item has an accent fill, its badge inverts**: background `--primary-foreground`,
  text `--primary`. A red badge on a red fill disappears, and the column gets two or three solid red blocks competing
  (`N3`). The wireframe draws this case too (`design-process.md`, `U3`).

```tsx
<Link
  href={item.href}
  className={cn(
    "flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm text-foreground/70 outline-hidden transition-colors",
    !isActive && "hover:bg-item-hover hover:text-foreground",
    isActive && "bg-secondary font-medium text-foreground",
  )}
>
  <Inbox className="size-4 shrink-0" />
  {item.label}
  {item.unread > 0 && (
    <span className={cn("ml-auto shrink-0 text-xs tabular-nums text-muted", isActive && "text-foreground")}>
      {item.unread > 99 ? "99+" : item.unread}
    </span>
  )}
</Link>
```

Collapsible group: label button with the same shape as children, sliding via `grid-rows`.

```tsx
// Nav area: `flex flex-col py-3 px-3`. Groups separated by `mt-4`, NO dividers.
<div className="mt-4 first:mt-0">
  <button
    type="button"
    aria-expanded={isOpen}
    aria-controls={groupId}
    onClick={() => setIsOpen(!isOpen)}
    className="flex h-10 w-full cursor-pointer items-center rounded-xl px-3 text-xs font-medium uppercase tracking-wide text-muted outline-hidden transition-colors hover:bg-item-hover hover:text-foreground"
  >
    {group.label}
    <ChevronDown
      className={cn(
        "ml-auto size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
        !isOpen && "-rotate-90",
      )}
    />
  </button>

  <div
    id={groupId}
    inert={!isOpen}
    className={cn(
      "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
      isOpen && "grid-rows-[1fr]",
      !isOpen && "grid-rows-[0fr]",
    )}
  >
    <div className="flex min-h-0 flex-col gap-1 overflow-hidden">
      {group.items.map((item) => <SidebarNavLink key={item.href} item={item} />)}
    </div>
  </div>
</div>
```

`h-10` = exactly the child link height, so label and link share a shape. The label button uses a plain
`<button>` here to keep the example short; if the project has a shared `Button`, use it.

- **The account block is pinned to the bottom, INSIDE a frame**, see the **Sidebar footer** section below.
- **The search box at the top of the sidebar** has a shortcut hint `/` or `⌘K` at the right edge.
- **A truncated item name shows the full name on hover**, even with the sidebar open: "Quarterly financial rep…" must have the tooltip "Quarterly financial report". Reuse the collapsed-mode tooltip, enabled only when the text is **actually truncated** (measure per `T14`: text width via `Range`, not `scrollWidth`); short items do not get it. Do not enable the tooltip only when collapsed: when open, long names are cut off with no way to read them.
- **Below `lg`, the sidebar is a panel sliding from the LEFT, the same pattern as the slide-over panel in `overlay.md`, just the other side**: frame `bg-surface shadow-modal`, dark theme adds `border-r border-border` (`M23`); overlay `bg-black/15` (not `/30`, that is for modals), in **500ms** / out **350ms** `cubic-bezier(0.32,0.72,0,1)`, overlay on the same timing; only `translate`, no `scale`, no `opacity` on the panel. **No visible ✕ button**: close by clicking the overlay (the dark strip on the right always shows at least 56px), clicking a link, Escape, or swiping left. Every app's sliding navigation menu works this way; a ✕ squeezed into the logo row looks out of place, especially when it sits next to the name instead of at the edge. There is still an `sr-only` close button at the top of the panel for screen readers. Other panels (record view, filters) still have ✕ per `overlay.md`: they hold work in progress, not a place you pass through. Every block sliding in from an edge in the app uses **one** overlay and **one** curve (`N5`). Do not pick `bg-black/30` + 200ms `ease-out` yourself when the request only says "slide from the left". Same for shadow: do not leave the panel flat with no shadow; in an elevated style it would sit lower than the card behind it.

- **A bottom navigation bar replaces ☰ when the app has 5 or fewer main items** and the user switches sections
  constantly on a phone (daily-use apps, end-user apps). Admin apps with many menu groups,
  rarely opened on phones, keep ☰. Below `lg`:
  - `fixed inset-x-0 bottom-0` on `--surface`, top border `border-border`, height `h-16` plus
    `pb-[env(safe-area-inset-bottom)]` (the iPhone home indicator), the page reserves `pb-20` so the last item
    is not covered.
  - 4–5 items split evenly (`grid grid-cols-4`/`5`), each item a lucide icon `size-5` above `text-xs` text,
    the whole cell is the tap target. Selected: icon and text `text-primary` (near-black projects use `text-foreground
    font-medium`), no background, no bar; other items `text-muted`. Links have `aria-current="page"`.
  - The 6th item onward is gathered into a final **"More"** item opening a bottom sheet; do not cram 6 items with truncated text.
  - Counts (tasks awaiting approval) are a dot or small badge at the icon's corner, not pushing the text.
  - With a bottom bar the mobile header drops ☰; the account block goes into "More" or an avatar in the header.
- **Wide screens: content hugs the sidebar, filled by adding columns.** Grid or list pages inside a shell
  with a sidebar do not `mx-auto` in the content area: at 1920px and up it leaves a gap between the
  sidebar and the content, and the whole page looks like it is floating (`mx-auto max-w-300` leaves
  235px on each side at 1920). With spare width, **add columns**: card grid goes to `2xl:grid-cols-4`, a list of
  horizontal cards becomes two columns when the content area is around 1600px. Do not stretch cards: a horizontal card
  1800px wide has an empty right half. If you need a cap, make it wide (`max-w-[1600px]` or more) and still
  left-align. Text, form and settings pages keep the narrow column of their own pattern.
  **Every block in the column shares one right edge.** Search box, filter block, results row, grid: the cap (if any)
  goes on the wrapper of the whole column, not on each block. Capping only the search box and filter block
  (`max-w-3xl`) while the grid below spans fully leaves half the screen empty next to the filters, with staggered right edges
  between blocks. A long search box at 1920 is still better than that gap; if you want a shorter box, put it
  on the same row as other controls (Search button, sort), do not shrink the whole block. Do not cap the search box and filter block at `max-w-3xl` just because "the search box is 1550px long":
  the right half is empty while the grid below still runs to the edge.

### Collapsing the sidebar (from `lg` up)

```
Open                               Collapsed
┌──────────────────┐               ┌──────┐
│ ◐ Acme Studio    │               │  ◐   │
├──────────────────┤               ├──────┤
│ ⌂ Overview       │               │  ⌂   │
│ ✉ Inbox      99+ │               │  ✉•  │  <- dot only for "needs action" counts
│ ▦ Calendar       │               │  ▦   │
│                  │               │      │
│ WORK           ⌄ │               │  ─   │  <- label fades IN PLACE, replaced by a short dash
│ ▣ Projects     4 │               │  ▣   │  <- open group: icons still shown, standing still
│ ☰ My tasks     12│               │  ☰   │
│                  │               │      │
│ SALES          › │               │  ─   │  <- closed group: stays closed, only the dash remains
│                  │               │      │
│ ⚙ Settings       │               │  ⚙   │
│ ◐ User name    ⇕ │               │  ◐   │  <- avatar only, still opens the menu
└──────────────────┘               └──────┘
```

The default is **collapse to an icon strip**, not hide entirely. Hide entirely (width to 0) only when
the user asks for it.

- **Whatever item shows when open still shows when collapsed, as an icon.** An open group keeps its children's icons; a closed group stays closed. Like the `collapsible="icon"` mode of the shadcn sidebar. Do not keep only the first group and hide every labelled group: open shows 13 items, collapsed shows 3, the user thinks items are gone, and if the current page is in a hidden group the icon strip has no selected item (rejected).
  - **Only the group label and chevron fade in place** (`opacity-0` + `inert`); the label row keeps its height. The space the label leaves is exactly the group separation in the icon strip, and every icon **stands still in the same position** when collapsed and open (the still-icon rule below). Remove the label row and the icons below jump up.
  - **The label row gets a short dash when collapsed** instead of text: `w-4 h-px bg-border-strong`, vertically centred in the row, **aligned on the icon centre** (the label row is `px-3` so the dash naturally falls at 24–40px, centre 32px, no `justify-center`). Like the counts, dash and text are **two versions swapped by opacity**: text + chevron `opacity-0`, dash `opacity-100`, both always in the DOM; the dash is `aria-hidden`. With whitespace alone, a closed group becomes a hole in the icon strip: close Sales then collapse, and between Documents and Members there is 156px of empty space, almost three times the normal gap, and nobody knows there is a group there (short dash approved by the maintainers). With the dash, every gap reads as a group boundary, and two dashes in a row mean a closed group in between.
  - **The nav area scrolls even when collapsed** (the icon strip can be taller than the screen). When collapsed, **hide the scrollbar entirely** (`[scrollbar-width:none]`), still scrollable by mouse, keyboard, touch: a 4px reserved scrollbar shrinks the 40px icon cell to 36px and pushes it off-centre.
  - **On page change, scroll the selected item into view** (`scrollIntoView({ block: "nearest" })`): on a short screen, an item near the bottom gets half cut off by the bottom edge, and you do not know where you are.
  - **The nav area edge fades when items are hidden** (both open and collapsed, since the scrollbar auto-hides or is hidden entirely): a **32px** `mask-image` gradient at the top edge once scrolled past the top, at the bottom edge when items remain below, no fade when it cannot scroll. Compute two flags from `scrollTop`, `scrollHeight`, `clientHeight` on scroll and on resize (`ResizeObserver`), feed them into CSS variables so the mask updates immediately: `[mask-image:linear-gradient(to_bottom,transparent,#000_var(--fade-top),#000_calc(100%-var(--fade-bottom)),transparent)]`, `--fade-top`/`--fade-bottom` are `0px` or `32px`. **32px long, about one `h-10` row**, not 16px: after auto-scrolling there is often one row cut and peeking at the edge, and at 16px the peeking part is still 70–80% opaque, becoming crumbs (the bottom of an icon, the dot of an "i") stuck right under the Search row like debris. A selected item scrolled into view stops **outside** the fade band: `scroll-my-8` on the link, matching the fade length. Mask, not a white gradient overlay: an overlay colour paints white over hover and selected backgrounds at the edge, shifting their colour. Without the fade, on a 600px short screen after auto-scrolling to Members: Calendar is stuck right under the Search icon, Overview and Inbox are hidden above, Departments hidden below, with no sign that more items exist.
  - **The dot at the icon corner is only for "needs action" counts** (unread, awaiting approval, overdue). Total counts like "Projects 4", "Members 18" are dropped when collapsed, no dot: ten dots on one column are ten meaningless signals. The number stays in the tooltip.
- **The sidebar footer stays**: Settings becomes an icon, the profile row becomes **avatar only**, and clicking still opens the account menu as before.
  - **When collapsed, hovering the avatar does not fill a square cell**; instead show a ring around the avatar itself: `ring-2 ring-foreground/10` (keep the ring while the menu is open). The avatar is a circle with its own colour fill; adding a grey rounded cell around it is a circle in a square, two faint fills nested, looking like a blurry lump. Same reason as the image exception in `I15`. When open, the row has text, so filling the whole row like a link is correct.
- **Each icon has a tooltip** with the item name, shown on the right. Links keep an `aria-label` with the item name because the text is hidden.
- **Strip width `w-16` (64px)**. The link is still the same link, `h-10 w-full px-3 rounded-xl`, just squeezed by the sidebar width down to 40px, becoming a square. Hover and selected work like a normal link.
- **Icons stand STILL in one place in both states. Never `justify-center`.** Centred when collapsed and left-aligned when open means that on expanding, the icons and logo jump from the centre to the left before the text pops out; the whole sidebar seems to "burst from the middle", jerky. How: everything **left-aligned**, with padding computed so that the icon centre lands exactly at **32px** (middle of the 64px strip) while left-aligned:

  | Element | Calculation | Centre |
  | --- | --- | --- |
  | Link icon `size-4` | nav `px-3` 12 + link `px-3` 12 + half icon 8 | 32 |
  | Logo `size-8` at sidebar head | header `px-4` 16 + half logo 16 | 32 |
  | Avatar `size-8` in profile row | footer `px-3` 12 + row `px-1` 4 + half avatar 16 | 32 |

  The profile row is **`h-10` tall like a link**, not `h-12`: collapsed to a 40px strip, `h-12` becomes a 40×48 upright cell, out of line with every 40×40 square icon cell above. Open and collapsed use **the same** padding; do not change padding by state.
- **When collapsed, a "needs action" count becomes a dot** (total counts are dropped, see above) `size-1.5 rounded-full bg-foreground/50` at the icon's top-right corner — **grey, not accent**: the collapsed dot is the miniature of the "99+" shown when open; that number is grey `text-muted`, so the dot is grey too, both states at the same weight (`N5`); the sidebar has no brand-colour badges (`I15`). If you want unread to stand out more, change **both states at once**, not just the dot (`absolute left-6 top-2`, anchored to the icon). A small plain number over the icon corner is unreadable; the real number lives in the tooltip ("Inbox · 99+") and in the link's `aria-label`.
- **The line under the sidebar head still runs the full width of the strip.**
- **Motion: only the width animates, the inner layout does not change.** `<aside>` `overflow-hidden`, `transition-[width] duration-200 ease-out motion-reduce:transition-none`, `w-64` ↔ `w-16`.
  - **Text always stays in the DOM**, `whitespace-nowrap`, **clipped gradually** by the sidebar edge when collapsing and **revealed gradually** when expanding, like drawing a curtain. No `hidden`, no conditional rendering: removing the text and re-adding it makes it pop in, and the layout recalculation shifts the icons.
  - Text, workspace name, badges beside text, and group labels add `transition-opacity duration-150`, `opacity-0` when collapsed. Fading while being clipped means you never see half a word hanging at the edge.
  - **Counts have TWO versions, swapped by opacity**: the plain number beside the text (`ml-auto`) fades out, the dot over the icon corner (`absolute`) fades in. Do not move one badge from one place to another; it will fly diagonally across the sidebar. **Both versions `aria-hidden`**; the number for screen readers lives in a single `<span className="sr-only">, 20 unread</span>`: `opacity-0` does not remove text from the accessibility tree, and left as is it reads "Inbox 99+ 99+"; when collapsed, the link's `aria-label` must include the number too.
  - **Group labels fade in place** (`opacity-0` + `inert` on the label button), not removed. Removing them changes the nav height, and the icons and scrollbar jump.
- Whether to remember the collapsed/open state, and whether to have a shortcut, is up to the user. If the request has a shortcut, show it in the toggle button's tooltip.
- **The toggle button sits at the start of the content area header**, icon `PanelLeftClose` when open, `PanelLeftOpen` when collapsed. Ghost button `size-10 rounded-xl`, with `aria-label` and `aria-expanded`. `outline-hidden`, no focus ring (`I13`). A thick grey border appearing after clicking is the browser's default outline leaking out (missing `outline-hidden`), not a design.

```tsx
// ONE link for both states. No justify-center, no padding change:
// icons stand still, only the text is gradually clipped by the sidebar edge.
<Link
  to={item.href}
  aria-label={isCollapsed ? getSidebarLinkLabel(item) : undefined} // "Inbox, 20 unread"
  className={cn(
    "relative flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm whitespace-nowrap text-foreground/70 outline-hidden",
    !isActive && "hover:bg-item-hover hover:text-foreground",
    isActive && "bg-secondary font-medium text-foreground",
  )}
>
  <item.icon className="size-4 shrink-0" aria-hidden />
  <span className={cn("min-w-0 flex-1 truncate transition-opacity duration-150", isCollapsed && "opacity-0")}>
    {item.label}
  </span>

  {hasCount && (
    <>
      {/* Open: plain number. */}
      <span aria-hidden className={cn("shrink-0 text-xs tabular-nums text-muted transition-opacity duration-150", isActive && "text-foreground", isCollapsed && "opacity-0")}>
        {formatSidebarCount(item.count)}
      </span>
      {/* Collapsed: a dot at the icon corner, ONLY for needs-action counts (unread, awaiting approval). Number in tooltip and aria-label. */}
      {item.isActionable && (
        <span aria-hidden className={cn("absolute left-6 top-2 size-1.5 rounded-full bg-foreground/50 transition-opacity duration-150", !isCollapsed && "opacity-0")} />
      )}
    </>
  )}
</Link>
```

### Sidebar footer

```
│ ⚙ Settings               │  <- normal nav item, same style as the items above
│ ╭──────────────────────╮ │
│ │ ◐  Alexandra Carte…⇕ │ │  <- one borderless row, the whole row is a button that opens the menu
│ ╰──────────────────────╯ │
```

- **The profile is a clickable row, no bordered frame**: `h-10 w-full rounded-xl px-1 hover:bg-item-hover`, like the shadcn sidebar's `NavUser`. Avatar `size-8` (per `avatar.md` but **without the avatar's border**), name `text-sm font-medium truncate`, icon **`ChevronsUpDown`** `size-4 text-muted` at the right edge. Do not wrap a bordered frame around an avatar that already has a border: two nested borders, the avatar pressed against the frame edge, the name cut early, and the frame becomes the heaviest lump at the bottom of the sidebar (rejected: "the profile footer looks bad").
- **The clickable cue is the `ChevronsUpDown` icon + hover fill**, not a frame. Avatar and name floating freely with nobody knowing it is clickable is caused by **having no icon**; with a menu icon the problem is gone.
- **The avatar centre aligns with the link icon centre** when the sidebar is collapsed: row `px-1` + avatar `size-8` gives a 20px centre, exactly link `px-3` + icon `size-4`.
- **The whole row is one `<button>`**, the trigger of the dropdown/popover (`I29`). Do not make a separate small button in the corner: clicking the name with nothing happening makes people think the app froze.
- **The row holds only avatar + name**, `truncate`. The email goes to the **top of the menu**, one line, **cutting the part before `@` and keeping the domain intact** per "Truncating email" in `overlay.md`. The email is how you know which account you are in (`N8`); cutting at the end "alexandra.carter.williamson@exam…" loses exactly the domain part you need to read. Do not let it wrap (`[overflow-wrap:anywhere]`): the browser breaks in the middle of the domain "…@ex / ample…", and the second line looks like a separate item.
- **The account has only one entry point**: if the app has an avatar in the header, there is no profile row here, and vice versa (`overlay.md`, "Account menu").
- **The menu opens upward** (`side="top"`, `align="start"`), **exactly as wide as the profile row** (`w-(--radix-dropdown-menu-trigger-width)`), not spilling past the sidebar edge into the content area, portalled to `body` (`I22`). Menu items **40px tall, radius 12px**, frame `rounded-2xl p-1`, see `overlay.md`. In the menu: email at the top (`text-xs text-muted`), then Profile, Appearance, Settings; **Sign out at the end**, separated by a divider, neutral at rest, **red on hover** `rose` (`I4`).
- **Settings above the frame is a normal nav item**, same style as the items at the top of the sidebar (`foreground/70`, faint hover). Do not make it `--muted` grey or separate it with a line.

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      className="flex h-10 w-full cursor-pointer items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-xl px-1 text-left hover:bg-item-hover"
    >
      <Avatar name={user.name} src={user.avatarUrl} className="size-8" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {user.name}
      </span>
      <ChevronsUpDown className="size-4 shrink-0 text-muted" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width) rounded-2xl p-1">
    {/* Each DropdownMenuItem: h-10 rounded-xl px-3, like a sidebar link. */}
    {/* Email on one line, cut the part before @, keep the domain: the "Truncating email" pattern in overlay.md. */}
    <DropdownMenuLabel className="px-3 py-2 font-normal"><AccountEmail email={user.email} /></DropdownMenuLabel>
    <DropdownMenuSeparator />
    {/* Profile, Appearance, Settings… */}
    <DropdownMenuSeparator />
    {/* Sign out */}
  </DropdownMenuContent>
</DropdownMenu>
```

The content area has its **own title bar** on top: path on the left, button group on the
right. **The bar is on `--surface` (white like the sidebar)**, not transparent over the page background: the sidebar head
and the header bar form one continuous white strip on top, with the grey content below. Apps all give the header
a white background; a transparent bar looks unfinished, and with a sticky bar the content scrolling up shows through
behind the text. The bar is separated from the content by a horizontal `border-border` line (locked rule 18, `locked-rules.md`), **at the same height `h-16` and the same colour as the line under the sidebar head** so they form one continuous line across the screen. This horizontal line **does not bring a vertical line** for the sidebar: a vertical line only exists when the content area is also white (see the start of this section).

```
┌──────┐░┌─────────────────────────────┐
│ w-60 │░│ header h-16                 │
├──────┤░├─────────────────────────────┤  <- two segments of one line
│ nav  │░│ content                     │
└──────┘░└─────────────────────────────┘
        ↑ no vertical line when the content is grey
```

### Button group on the right of the header bar

```
Rooms                           ♡  🔔   My listings   Sign in   [+ Post listing]
                                └ icon only ┘  └──── ghost with text ────┘   └ the only solid button
```

- **One solid button**, the main job of the whole product (Post listing, Create new), placed **at the end of the row**. The
  rest are ghost buttons. The solid button's colour follows the project's colour role (`review.md`), but it has **the same height,
  the same radius, the same font size** as the ghost buttons next to it (`h-9`, `rounded-lg`, `text-sm font-medium`),
  no coloured shadow (`M15`), no `font-extrabold` text.
- **Items that only need to be recognised, not read, are icon only**: saved (heart), notifications (bell, with a
  dot or number when there is something new), cart. The text lives in `aria-label` and the tooltip. Large classifieds and
  booking sites all keep heart and bell icon only. At most about three items with text.
- **Ghost button text is no heavier than the page name** on the left: `font-medium`, normal text colour or
  `--muted`. Five items all `font-semibold` in the main text colour are five things competing with the page name.
- **Spacing between buttons `gap-2`** (8px): the ghost button's padding is already breathing room, `gap-2` separates
  the hover backgrounds of two adjacent buttons so they do not touch. `gap-4` plus padding spreads the row across half the header,
  reading like a marketing site menu. Do not drop to `gap-1` (4px): four buttons pressed together look like one
  lump (raised by the maintainers).
- **Items already in the sidebar are not repeated in the header** (the "Two places, one job" rule, `V1b`).
  Which side to drop is the user's decision: put it on the board, do not pre-select.
- **Contact, support, download the app** do not stand in the same row as the main job: put them at the bottom of the sidebar or
  in the account menu.
- Sign in without an account is a ghost button ("Sign in"); sign-up lives inside the sign-in
  screen. If the project already colours the sign-in link with its own colour, keep the colour (colour role), still at the shared size.

If the wireframe already draws five same-size items and one solid button, do not keep the project's old header: six icon +
`font-semibold` text items 32px apart, a fully rounded solid button 30px tall with 13px `font-extrabold` text and a
coloured shadow standing among 12px-radius buttons 34px tall with 14px text. The probe measures "header button row not
same size".

### Page head in the content area

```
Customers  ›  Business customers                <- only PARENT levels, as links
Brightway Trading Ltd               [⤓ Export] [+ Create order]
Customer since 3/2024, 18 orders, revenue $1,284,500
```

```tsx
<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  {/* flex-1: the text block takes all remaining space, not shrinking to the longest line */}
  <div className="min-w-0 flex-1">
    <Breadcrumb items={parents} />{/* ../components/breadcrumb.md; the h-8 row already leaves space, no mt on the title */}
    <h1 className="text-xl font-semibold text-balance">{title}</h1>
    <p className="mt-1 max-w-[55ch] text-sm text-pretty text-muted">{description}</p>
  </div>
  <div className="flex shrink-0 gap-2">{actions}</div>
</header>
```

- **The path shows only parent levels, not the current page.** The page name sits right below; repeating it is duplication ("Settings › Members" then "Members"). Writing a word different from the page name is worse: "Customers › Profile" above "Brightway Trading Ltd", and the reader does not know where they are. Shape, long paths, narrow screens: `../components/breadcrumb.md`.
- **The path lives in ONE place.** If the app already has the path in the `h-16` header bar, the page head does not repeat it, keeping only name, description, buttons.
- **A page has exactly one `<h1>`, and the page name is written in only ONE place.** With two `<h1>` a screen reader does not know what the page is called ("My tasks" in the header and "Create new task" both `<h1>`); with no `<h1>` it is the same (dropping the page head to avoid repeating "Customers" also loses the `<h1>`). Split by page type:
  - **Pages without their own page head** (list, admin table, overview, kanban): the name in the `h-16` header bar **is the `<h1>`**, keeping the bar's font size (`text-base font-semibold`; font size does not change with the tag; 700 only for showcase pages, `T2`). The content area does not repeat the name; the main button ("+ Add customer") sits at the end of the toolbar next to the search box.
    - **If the toolbar does not fit on one row and splits in two, the main button goes to the end of the TOP row** (`ml-auto`,
      `shrink-0`), aligned with the right edge of the content area; search and filters go to the row below. Do not leave the lower row
      as a plain `flex` that appends the main button after the filter box: the button floats mid-row, aligned with no block. Below `sm` keep the vertical stack, with the main button full width at the end: moving it up wraps the date text.
    - **With date navigation** (calendar, appointments, daily reports), the `‹ [Today] ›` cluster follows exactly
      the "Work calendar" section below: ‹ › are icon-only `ghost`, only "Today" has a border. Three bordered boxes
      side by side are three heavy blocks for a secondary job.
  - **Pages with their own page head** (record detail, create form, pages with a description or record-specific buttons): the `<h1>` is the name in the page head; the header bar shows only the **parent level** ("Customers" as a link), as `<p>`/`<nav>`, not repeating the page name.
  - The app shell receives the page name from the route and picks the tag itself: `<p>` if there is a page head, `<h1>` otherwise. Do not leave each page to remember.
- **Page name `text-xl`**, a single record's detail page (customer, order, project) uses `text-lg` (`budgets.md`; `T9` is only for repeated content like articles, products). Not `text-2xl`, `text-3xl`: those are hero sizes (`budgets.md`). `text-balance` so long names wrap evenly.
- **Text block `min-w-0 flex-1`.** Without `flex-1` the block shrinks to its longest line (usually the path), and the description is forced to wrap at half the frame even with free space on the right (adjusting `max-w` does not help because flex has already squeezed the width).
- **Page name `font-semibold`, no `tracking-tight`** at `lg`/`xl`. The page name is the boldest text in the content area; being lighter than the block titles below inverts the hierarchy.
- **Description `max-w-[55ch] text-pretty`**: wide enough for a short sentence on one line, long sentences still under 75 characters per line (`T11`). Do not use `max-w-2xl`: at `text-sm` it is ~99 characters in practice.
- **Buttons on the right, hugging the top** (`sm:items-start`), `shrink-0`. At most one `primary` button (the page's main action, `I3`), the rest outline buttons with icons (`I1`). From the third button on, gather into a `MoreHorizontal` button.
- **Narrow screens**: buttons move below the text, left-aligned, kept on one row; do not leave two buttons on top and one below (`../responsive.md`).
- With no description and no buttons, the page head is just the name, with no reserved empty space.

---

## Report page (revenue, analytics)

A page for **reading numbers over a date range**, different from the overview screen (which you enter to get to work).

```
header bar:    ☰  Revenue report                              🔔  (T)
┌──────────────────────────────┐
│ 08/29/2026 – 09/27/2026   📅 │   <- date range box, left-aligned, opens the content area
└──────────────────────────────┘
Compared with the previous 30 days, 07/30/2026 – 08/28/2026  <- comparison period, written ONCE
┌ Revenue ───┬ Orders ─┬ Avg order value ┬ Refund rate ────┐
│ $1.62M     │ 2,571   │ $632            │ 2.1%            │
│ ↗ 4.4%     │ ↗ 4.6%  │ — No change     │ ↘ 0.1 pts       │
└────────────┴─────────┴─────────────────┴─────────────────┘
┌ Revenue by day ───────────────────────────────────────────┐
│ $60K ──────────────────────────────────────────────────── │   <- horizontal grid + level labels
│ $40K ────────╱╲──────╱╲─────── 09/13 · $70.9K ─────────── │
│ $20K ──────────────────────────────────────────────────── │
│ 0 ─────────────────────────────────────────────────────── │
│        09/02   09/07   09/12   09/17   09/22   09/27      │
└───────────────────────────────────────────────────────────┘
┌ Revenue by channel ─────────┐ ┌ Best-selling products ────┐
│ Website   $636.4K       39% │ │ Headphones… 123 ord. $232K │
│ ▓▓▓▓▓▓▓▓░░░░░░░░            │ │ …                          │
└─────────────────────────────┘ └────────────────────────────┘
```

- **The date range box is the filter for the whole page**, opening the content area, left-aligned, `sm:w-72`. The page name is already in the header bar, so do not build an extra page head. The box follows "Date range" in `../components/choice-controls.md`; the field looks backward so **dates after today are locked** (default suggestion; the list of locked dates belongs to the user) and it opens with the current month on the right.
- **The comparison period is written once** in a `text-xs text-muted` line right above the stat tile row (`../components/charts.md`, "Comparison line"), not repeated in each tile. With no previous period (the first month of sales), that line says "No previous period to compare" and the tiles drop their comparison line.
- **Comparison period by range type**, like popular analytics tools:
  - Rolling range ("Last 7 days", "Last 30 days", custom range): **the same number of days immediately before**. "Compared with the previous 30 days, 07/30 – 08/28/2026".
  - Calendar range ("This month", "This quarter", "This year", a whole month): **the same period of the previous unit**, up to the same day. This month up to 09/26 compares with 08/01 – 08/26 ("Compared with the same period last month"); this year compares with 01/01 – 09/26/2025 ("Compared with the same period last year"). Going back exactly the same number of days yields ranges nobody thinks of: "Year to date" says "Compared with the previous 269 days, 04/07/2025 – 12/31/2025", "All of September" says "compared with the previous 26 days, 08/06 – 08/31".
  Which period to pick is the user's logic (`N10`); the skill handles the wording and the default when the request leaves it open.
- **Each chart point follows the range length**, like the revenue pages of large payment gateways: **1 day → by hour** (24 points), up to ~31 days → day, up to ~92 days → week, longer → month. The card name changes accordingly: "Revenue by hour / day / week / month". For a one-day range, replacing the chart with a text block "`$87.6K` · Pick two or more days to see a trend" repeats exactly the number in the "Revenue" tile right above (`N3`) and makes the user change the range before seeing anything. The "single point" text block is only for when the data really has only one point.
- **The main chart has a horizontal grid and level labels** (an exception in "Strip it back" in `../components/charts.md`); the number at the point being viewed **includes its point label** ("09/13 · `$70.9K`", "Today · `$44.4K`"), placed on the side away from the line, and tabbing in shows that point's number. Incomplete periods (today, this week) use a dashed stroke.
- **Two analysis blocks below the chart**, two columns from `lg`, one column on narrow screens: the breakdown by group (channel, region) is a list of bars sorted descending, each row number + percent (`../components/charts.md`, "Progress bars in a list"); the top items (products, customers) are a list with name + secondary line on the left, the number on the right `tabular-nums`, 5 rows.
- **States**: loading keeps each block's frame with a skeleton at the right height (the date range box stays usable); a load failure puts one `ListError` frame in place of everything below the date range box; a range with no orders gets one frame with the sentence "No orders from … to …" + a link back to the default range. Future ranges have no separate empty case: dates after today are already locked in the calendar.

---

## Record detail page

```
header bar:    ☰  Customers                                   🔔  (T)
┌──────────────────────────────────────────────────────────────────────┐
│ (N) Nora Mitchell  <h1> text-lg              [✉ Email] [+ Create order] ⋯│
│     ● Active  Lumen Studio                                            │
│                                                                       │
│ Last 12 months, vs. the previous 12 months       ┌ Contact ─────────┐ │
│ ┌ Revenue ┬ Orders delivered ┬ Value ┬ Refunds ┐ │ Email   ✉ ⧉      │ │
│ └─────────┴──────────────────┴───────┴─────────┘ │ Phone   ☎ ⧉      │ │
│ ┌ Orders 24 · Messages · Files 4 · Activity ┐    └──────────────────┘ │
│ │ OR-10412  09/20  3 items  ● Delivered $12.6K│  ┌ Classification ──┐ │
│ │ ...                                       │   │ Tags, owner       │ │
│ │ View all 24 orders →                      │   └──────────────────┘ │
│ └───────────────────────────────────────────┘                        │
└──────────────────────────────────────────────────────────────────────┘
  content frame from 70rem (@container, not xl): main column minmax(0,1fr) + right column 22rem;
  narrower, one column: stats → two cards (side by side from a 40rem frame) → tab block
```

The page head follows the section above (`<h1>` `text-lg`, the header bar shows only the parent level). The stat row follows
`../components/charts.md`, the Contact / Classification cards follow `../components/description-list.md`
(stacked, narrow right column), the timeline follows `../components/timeline.md`.

- **The right column only opens when the main column still has ≥ ~744px: content frame (not screen) from `@[70rem]`.** The page
  shell is `@container`, grid `@[70rem]:grid-cols-[minmax(0,1fr)_22rem]`. Opening at `xl:` means that at 1280px with the sidebar
  open, the 992px frame minus the right column leaves 616px for four stat tiles and a table: "10/14 · 09:00" breaks in two in a stat tile, tile labels
  go to two lines, and the 122px Service column wraps to two or three lines on all 11 rows. One column at 1280px: stat tiles on one line, no table
  row wraps, the two cards stand side by side. 1366px (1078px frame) is still one column; 1440px opens the right column
  (main column 776px).
- **Right-column cards are ordered by the page's main job, not copied from the Contact → Classification order of the customer
  pattern.** The card serving the main job comes first: for a patient record the doctor opens before an exam, **Medical** (conditions,
  current medication, notes) comes before **Contact**; for a sales customer page, Contact comes first. In one column
  the first card stands left / on top, so this order decides what shows right under the stat row on a phone. Copy the
  order and "Afraid of injections, explain each step before anaesthesia" sits at the end of the Medical card, below even the address
  and relatives; at 375px you must scroll past the whole Contact card to reach it.

- **A detail page is not an enlarged quick-view panel.** The panel is for glancing at one customer in the middle of a list; the page is for working with that customer, and the main job is to view and open **child records**. Borrowing the panel's pattern (name row, stat tiles, description list) is fine; lifting the panel's whole tab set is not (`../principles.md`, "Building something with no sample").
- **The first tab is the main child record**: customer → Orders, project → Tasks, company → Contacts. Only then Messages, Files, Activity. Copy the panel's Messages / Files / Activity tabs and the stat tile says 24 orders, the main button is "Create order", yet to see the orders you must wade through the Activity tab, where the 24 orders are just 24 "Order delivered" rows mixed with "Tagged VIP", with no filter and no way to open an order.
- **A child-record tab is a compact table**, not a timeline: Order ID (`font-mono`, link to the order), Order date, Item count, Status (badge `M7`), Total right-aligned `tabular-nums`. Newest first, 10 rows, with a "View all 24 orders" link at the end of the table to the order list pre-filtered by this customer, **left-aligned with the text of the first column**, on the same side as "View older activity" in the Activity tab: if the "view more" path jumps from the right edge to the left edge when you switch tabs, the eye has to search again. No pagination inside the tab. Below `sm` it becomes a row list like the admin table (the "Data table" section).
- **Child-record tabs have counts, stream tabs do not**: "Orders 24", "Files 4", while "Messages", "Activity" stay plain text. The data already has the number, so this is a case where adding a number is allowed per `../components/small-controls.md`; for a new customer the tab row alone shows which tabs are empty, no need to click each one. Message and activity counts grow forever and say nothing.
- **When two numbers count the same thing over different periods, the stat tile states the period in its label.** The number on the tab counts all time (the table lists everything), the stat row covers 12 months like the panel (`N5`). The tile that counts the same thing as the tab is labelled "Orders delivered · 12 months", other tiles keep plain labels, and the period line above the row is still written once. Without the period in the label, "Orders delivered 24" and "Orders 42" sit 100px apart, the "Last 12 months" line above the row is not enough to resolve it, and the reader thinks a number is wrong. Do not switch the stat row to lifetime: the panel and the page for the same customer would show two sets of numbers.
- **Other records mentioned on a page are links**: order IDs in activity rows, order IDs in the table, file names. A content area with no links at all is a dead end: you see "Order OR-10412" and cannot open it.
- **An action tied to a value sits next to that value**, not in the page head ⋯ menu. Email is a `mailto:` link, phone number is a `tel:` link, hovering the row shows a copy icon button (`description-list.md`). The ⋯ menu keeps only actions on the whole record: Edit details, then Delete after a divider (`I11`). Do not put "Call" and "Copy email" in the ⋯ menu at the top corner: the phone number and email right below become dead text.
- **A customer with no orders drops the stat row entirely.** The empty Orders tab already says "No orders yet", and the "Create order" button is already in the page head; also keeping a "No orders yet. Stats appear after the first order" frame is two blocks saying one thing (`N3`). That compact frame is only for the panel, where there is no Orders tab (`../components/charts.md`).
- **Record not found** (wrong id, deleted) is a 404 case inside the app shell: build exactly the centred block of "Error pages" below (faint "404" line, `<h1>` "Customer not found", one sentence on why), but **the solid button is "Back to customers"**, not "Back to overview": someone opening a broken customer almost always wants to find another customer (`N6`). The secondary path "Go back to the previous page" as in the 404. The header bar still shows the parent level. Do not build a left-aligned page head with a plain text link: a 20px-tall link is a tap target under 32px on a phone, and one error page in the app shell done two ways is two patterns for one job.

---

## Kanban board

```
○ To do  4        ◉ In progress  3  ⋯ In review  2    ✓ Done      3
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ task title   │  │ task title   │  │ task title   │  │ task title   │
│ project · due│  │ project · due│  │ project · due│  │ project · done│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐
│ ...          │  │ ...          │
└──────────────┘  └──────────────┘
```

- **Columns get no colour of their own.** The column head is status icon + name + count, the icon and its colour taken exactly from the status table in `M7` (`circle`, `circle-dot`, `circle-ellipsis`, `circle-check`), the same shape as the group rows of the list view (`D2`). Colour only on the `size-4` icon; column background, column border and column name text have no colour. Four columns with four coloured backgrounds is a sign of not having decided what matters, and it breaks the one-accent-colour rule.
- **Cards in the Done column do not add ✓ before the title.** The column head already has `circle-check`; ✓ on each card says one thing twice (`M6`), and pushes the title out of line with the cards in other columns. The Done column differs in the secondary line: "done 09/18" instead of the due date.
- **Cards are real cards**; this is a valid exception to rule `F3`: a kanban card is a draggable object, not a row in a list.
- **Card `p-4`, gap between cards `gap-3`, gap between columns `gap-4`.** See `budgets.md`. Do not drop to `p-3`, cramped.
- **Task titles do not `truncate`**; allow up to two lines before cutting. A narrow card cut to one line does not tell you what the task is.
- **Column `w-[248px] shrink-0 grow max-w-[320px]`, inner row `flex w-max min-w-full`.** Four columns fit exactly at 1366px and up with the sidebar open; wider, the columns grow evenly up to 320px; narrower, the columns keep 248px and scroll horizontally. A fixed `w-[280px]` column needs 1216px, while the content frame at 1440px (sidebar `w-64`) only has 1184px: the Done column is 8px short at the right edge, and at 1366px 32px short, exactly the two most common laptop widths, looking like a bug rather than "there is more". `w-max` keeps the right margin when scrolling, `min-w-full` makes the row wide enough for the columns to grow. With a different sidebar or page margin, recompute: 4 × column width + 3 gaps + 2 margins ≤ frame width at 1366px.
- **Narrow screens scroll horizontally inside the frame**, no wrapping into two rows. See rule `R6` in `../responsive.md`. Put the margin on the inner row (`flex gap-4 px-3`), not on the scroll frame, otherwise the last column sticks to the edge. **The board's scroll frame is not `scrollbar-clean`**: use the auto-hiding bar (`I18`) and edge fade (`R10`). `scrollbar-clean` is only for chip rows and tab rows (`rules-state.md`); a board that hides the bar entirely leaves mouse users without a horizontal wheel (Windows) with only Shift + scroll to see hidden columns.
- **The ⋯ button on a card: shown on hover or when tabbing into the card**, like large board apps: 16 cards means 16 static ⋯ marks, noisier than the task names. `opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 aria-expanded:opacity-100 [@media(hover:none)]:opacity-100` on the button itself, the card is the `group` (space stays reserved, the avatar does not jump). Unlike tables (`I11`): tables are scanned by column so the button is always shown; cards have no columns.
- **The ⋯ button sits in the card's last row, right before the avatar**, not in the top-right corner. Last row `flex h-8 items-center justify-between`: priority on the left, on the right a `flex items-center gap-1` cluster of the ⋯ button `size-8` then the avatar `size-6`. The last row only holds priority (short text) so it has spare room; the top-right corner belongs to the task name. Two approaches rejected (248px column): button in the top corner with the title reserving `pr-8` cuts 5/15 names with "…", and allowing 3 lines gives an orphan word on line 3 plus a 32px gap to the right of lines 1–2; a button overlaying the text without reserving space (like an edit button appearing on hover) has its background slicing a word in half ("revenue c⋯"). In the last row: 1/15 names cut (genuinely long names), and the card is only 8px taller. Do not pull `-my-*` to keep the row `h-6`: Button has `max-w-full`, and the negative margin shrinks the wrapper and squeezes the button (down to 24×32, `N11`).
- **The column head has a `plus` button to add a task to that column**: ghost icon button `size-8` at the end of the column head row (`ml-auto`), `aria-label="Add task to To do"`, opening the create form with the column's status. Every board has a way to add right at the column; with only a page head button, after adding you still have to drag the card to the right column.

- **Empty columns must still reserve space**, see `../components/empty-state.md`.
- With more than five columns, ask whether some statuses should be merged.

### Drag-and-drop cards

Dragging a card to another column changes its status. Build all three interaction modes, not just mouse:

- **Mouse: only count as a drag after moving past 4px**, otherwise a trembling click becomes a drag, and clicking a card to open details fails.
- **Touch: hold still for 250ms before lifting**; if the finger drifts more than 8px while waiting, it is a scroll, cancel the drag. Swiping immediately scrolls the board normally. Cards are `select-none [-webkit-touch-callout:none]`, otherwise long-pressing triggers the iOS text copy menu.
- **Keyboard: cards are accessible via Tab**, `aria-roledescription="draggable card"`, `aria-describedby` pointing to an `sr-only` instruction: Space to pick up, ← → to switch columns, Space or Enter to drop, Esc to cancel. Each step is announced via an `aria-live="polite"` region: "Picked up … in To do column", "In progress column", "Moved … to In progress", "Cancelled drag, … remains in To do". After dropping, focus remains on the card.
- **The held card is a floating clone**: portalled to `body`, `fixed`, tracks the cursor via `transform` applied directly to the DOM (do not re-render the entire board on every move), preserving the exact grab point on the card. Border `--border-strong` + `shadow-lg` because it is an elevated layer (`M15`). Do not tilt, do not scale up (`F22`). The clone is `inert`; the real card remains in the column for screen readers. When lifted via keyboard, that card itself receives this border + shadow, conveying the same "picked up" meaning.
- **The drop target is a dashed outline `border-foreground/40`, matching the card's exact height**, positioned exactly where the card will sit according to the column's sort key (if sorted by due date, the frame sits between Sep 28 and Oct 5, not directly under the cursor). Darker than the empty column frame (`foreground/15`): empty column is "empty space", this frame is "drop here" (`N2`). The counts at the head of both columns update immediately during drag.
- **The entire vertical strip of the column is a drop zone**, calculated by horizontal coordinates, not just the part with cards: for short columns, dropping into the empty space below still works.
- **Dragging near the frame edge auto-scrolls the board horizontally**, accelerating closer to the edge. Without this, hidden columns can never be dropped into at 375px.
- **Picking up via keyboard and switching to a hidden column scrolls the entire target column into view**, not just partially. The scroll container has `scroll-px-8` (matching the edge fade width `R10`), then **scroll only horizontally** on the board container: compare the column's `<section>` edge with the container edge minus `scroll-padding`, `scroller.scrollBy({ left })` the deficit; then `card.scrollIntoView({ block: "nearest", inline: "nearest" })` vertically. Do not `scrollIntoView` on the whole column: if the column is taller than the screen, the browser aligns to the top of the column, causing the page to jump vertically with every arrow keypress. Scrolling partially at 1280px causes the board to stop at 40 out of 64px when moving to the Done column, leaving the held card's right edge cut off under the edge fade.
- **After dropping, the clone animates back to its new position** over 200ms, `cubic-bezier(0.32, 0.72, 0, 1)` like slide-over panels (`overlay.md`); with `motion-reduce`, snap immediately. When dragged to the Done column, the secondary line updates immediately to "done MM/DD".

**Approved reference code: `app-kanban.html`.** Copy the structure from there, do not re-derive it from the bullet points above. That file has survived the 375px stress test, horizontal scrolling with margins at both ends, `p-4` cards, `h-9` filter chips, white `h-16` header matching the app shell. Three chips fit 375px so the chip row does not scroll; for more chips, follow `R6`, `R10`. It is a static file, without the ⋯ menu, drag-and-drop, or board edge fades: those three follow the bullet points above and the "Drag-and-drop cards" section.

---

## Calendar page (monthly calendar)

Deadline calendar (or appointment calendar): full month grid when the container is wide, compact calendar + task list for the selected day when narrow.

```
September 2026 ⌄   [Today] ‹ ›                             [+ Add task]
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │ Sun  │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ 31   │ 1    │ 2    │ …    │      │ (26) │ 27   │   <- grid: today is solid ring
│ ○ Met│      │ ✓ Sen│      │      │ ◉ Wri│ ⋯ Rel│
│      │      │      │      │      │ ○ Boo│      │
│      │      │      │      │      │ 2 more tasks │
```

- **Toolbar: "Today" sits next to ‹ › as a single navigation cluster.** Month name (button opening a 12-month grid) on the left, then `[Today] ‹ ›`, with the primary "Add task" button `ml-auto` at the far right. The most common calendar libraries place `today prev,next` adjacent by default, as do major calendar apps: all three mean "go to another date". Placing ‹ › next to the month name while pushing "Today" to the right next to the primary button splits one task into two places, and an outlined "Today" button sitting next to a solid button looks like an action pair. **‹ › are icon-only `ghost` buttons** `size-10`, borderless; only "Today" is an outlined button: three outlined boxes side-by-side create three equally heavy blocks for a secondary action. "Today" is `whitespace-nowrap shrink-0` (at 375px: month name + cluster fits within 343px).
- **Choose layout by calendar container width, not viewport.** Grid cells need **≥ 128px** to read task titles (~12 characters after the icon). With sidebar open: 1280px gives 139px cells ("Team retro s…"), 1024px gives 102px and 768px gives 103px cells leaving only one word ("Prepare …", "Write doc …"): a full grid that cannot read any task fails the page's primary job. The calendar container is a `@container`: from `@4xl` (896px, = 7 × 128) use the full month grid; narrower uses the compact layout, and from `@2xl` (672px) the compact calendar (`w-80`) and day list stand side-by-side instead of stacking vertically. Do not `useMediaQuery` by viewport: opening or collapsing the sidebar changes the container width by 200px+ while viewport remains unchanged.
- **Grid cells have a fixed computed height, not guessed.** Height = padding on both ends + date number row + N task rows + gaps; document the calculation in code comments. Each `<li>` wrapping a task row button must be `flex` (or the button is `flex`): an `inline-flex` button in a regular block leaves a 1px baseline gap per row, making a 3-task cell 122–123px instead of 120px, causing the grid to stretch unevenly across months (`min-h-30` but rows 4 and 5 become taller). Days with more than N tasks: display N−1 tasks + "K more" (the word "more", not "+K": a plus sign under task names reads as "add task"), clicking opens a panel listing all tasks for that day.
- **Weekday names, day numbers, and task row icons align to a single edge.** When day numbers are wrapped in a centered `size-7` circle, the digit drifts based on digit count: "1" is offset by 5px, "31" is offset by 1px relative to weekday names and icons (weekday 12px, number 11–17px, icon 12px). Pick one: numbers and weekday names **both center** in the column (task rows remain left-aligned), or both left-align: number `px-1.5` without a circle, digit aligns to weekday edge; today adds `min-w-7 justify-center` + background, with the left edge of the circle matching the task row background edge. Today with two digits stays aligned to the edge; a single digit ("5") sits centered in the circle, offset by 3px. Acceptable: distorting the circle into a pill to preserve 3px looks worse.
- **Today and selected day: solid ring for only one item.** The full month grid has no selected day, so today is a solid ring `bg-primary`. **The compact calendar has a selected day** (the list below belongs to that day), so follow the date picker (`../components/choice-controls.md`): **the selected day is a solid ring**; today is an outlined ring `inset-ring-1 inset-ring-foreground` + `font-semibold` (a dot under the number already means "has tasks", do not use a dot for today like date pickers). If today is also the selected day, use only the solid ring. Do not leave the selected day as a gray square background while today remains a black circle: selecting the 28th while the 26th remains the darkest block on the calendar leads the eye to read the list below as tasks for the 26th. Two date pickers from major design systems do the same: today gets an outlined ring, selected day gets a solid ring.
- **Compact calendar: all states render on the circle around the number, not the whole cell.** Unlike date pickers (`choice-controls.md` colors the entire `rounded-xl` cell): here the "has tasks" dot sits below the number, outside the circle, like mobile calendars. The date button `h-12 w-full` is purely a tap target, `hover:bg-transparent` with no ring; the number gets `group-hover:bg-foreground/5` (unselected days), Tab focus has no ring (`I13`). If missed, hovering reveals a 46×48 square background next to a 32px selected circle, and clicking leaves the newly selected cell with a square background overlapping the black circle: two shapes for one date cell.
- **Task row in cell**: `h-6` status icon `size-3.5` (`M7` table) + title `text-xs truncate` + full title `title`; no background colour, no border (30 tasks each with a coloured box turns the calendar into clutter). Completed: `muted` text. Overdue: amber text like overdue deadlines in list views, not red.
- **Month with no tasks: no empty block needed**, an empty grid is clear enough, as in major calendar apps. Load error: error bar above the grid, keeping the grid so users can still change months. Loading: skeleton bars in cells.
- **On narrow screens, the add button sits at the top of the selected day's list** (outlined "+ Add" button in the card action slot), opening the form pre-filled with that deadline.

### Daily hour grid (columns by person, chair, room)

Daily appointment schedule for clinics, salons, meeting rooms: hours form the vertical axis, each doctor (chair, room) gets a column, and appointment blocks size vertically by duration.

- **Column header row sticks to the top during vertical scroll** (`sticky top-0` inside grid container), hour label column sticks to the left during horizontal scroll. An 08:00–17:00 grid is taller than a viewport: if header names drift away, scrolling into the afternoon leaves you unable to tell whose column is whose.
- **Opens pre-scrolled to the current time**, with the "now" indicator positioned roughly one-third down from the top. The indicator carries `data-now`: when probe detects the indicator in the visible portion of the container, it recognizes intentional scrolling and will not flag "page auto-scrolled".
- **The "now" indicator renders on top of appointment blocks** (`z-index` higher than blocks), thin 1px line with a circular dot at the start; accept that the line crosses text inside blocks. If the indicator lies beneath blocks, during peak hours it is only visible in the tiny gaps between blocks: showing across 2% of the width, it ceases to serve as a reference for who is late or who is next. Probe measures the visible portion of `[data-now]`.
- **Status counts requiring action must be clickable.** "1 late" in the count row is a button: clicking scrolls to that block and opens details; on narrow screens showing one column, it switches to that person's column first. If late blocks sit in hidden columns and counts are not clickable, a receptionist on a phone cannot see who is late.
- **Time-derived statuses must be present**: past appointment time without arrival is "Late N min", amber like overdue tasks (`M4`), heading the status count row; after excessive delay, the receptionist manually transitions to "No show". The database only stores "Confirmed", so this must be computed, and wireframes must include at least one case (`design-process.md`, U3). Without any late case, the receptionist's primary responsibility is missing.
- **Status transition buttons on blocks or rows use verbs** ("Check in", "Start exam", "Complete"), not destination status names (`rules-state.md`, button table).
- **Short 30-minute blocks hold only three lines**: time + status, name, service. Move notes to panel or profile.
- **Show all columns when the container fits, computed by column count, not a fixed breakpoint.** Columns need **≥ 160px** (time + "Late 25 min" on one line, readable name). Grid container ≥ hour column + N × 160 shows all N columns; if insufficient, collapse to a single column + person selector tab row. Compute in code (`ResizeObserver` on container, or `@container` with breakpoints documented from N × 160 + hour column calculation, with comments), do not lock `@3xl` for every clinic: four doctors need 700px, six doctors need 1020px. A 720px container locked to `@3xl` (768px) displays only one 650px column with two late patients hidden in obscured columns; four 166px columns display full names, statuses, and "Late 25 min". Narrow columns below ~200px use short header names ("Dr. Davis", like tab rows) instead of truncating "Dr. Alexander …".


---

## Filtered list

```
┌─────────────────────────────────────┐
│ tab  [tab]  tab   [search ] [+ Add ]│  <- single choice: tab; multi-choice: chip
│                                     │     page name is <h1> in header bar, not repeated here
├─────────────────────────────────────┤
│ ⬤ row content        value    ⋯ ⋯  │  <- secondary actions hidden, revealed on hover
│ ⬤ row content        value         │
│ ⬤ row content        value         │
└─────────────────────────────────────┘
```

See `../components/list-row.md` for row recipes. A list is **a single block divided by borders**, not one card per row.

**List + details (two columns, clicking left item opens details on right).** The left item carries only enough to **choose**: a thumbnail, price or status line, name, **one** secondary line. At most three lines of text. Everything else (full address, verification, publish date, specs) belongs in the details column; repeating it on the left only clutters the column (five lines per item reads like a wall of text). Indented rows, currently open item and hovered item use different backgrounds (`I10`, "Currently open item" section). The image in the details column has a height ceiling (`max-h-[420px]`, `object-cover`): if the record has only one photo, do not let it dominate a wide 1400px frame.

**Count columns before adding a filter column.** App sidebar + filter column + list + details is four columns: at 1440px the content area has only ~1190px left, squeezing the list to ~320px, truncating titles after two or three words. Three content columns are only viable when the content area is ~1600px or wider; narrower than that, collapse filters into a "Filter" button that opens a panel, as in the 1024px layout.

**Left filter column sticks during page scroll, does not scroll independently.** Use `sticky top-*` only when the column is shorter than the viewport. If the column is taller than the viewport, let it scroll with the page, do not constrain with `max-h-[calc(100vh-…)] overflow-y-auto`: a dedicated scrollbar stays permanently visible, runs nearly the full column height, and hugs the container border. For long groups (regions, provinces), show five or six items with a "Show N more" link, do not make the entire column a scroll container.

---

## Data table

> **Check libraries first.** If the project uses `@tanstack/react-table`, `ag-grid`, or virtual lists (`@tanstack/react-virtual`, `react-window`, `react-virtuoso`), use them for sorting, row selection, and virtualized scrolling; this skill only shapes appearance. If absent, build according to this section, and propose a one-line recommendation at delivery if the table needs to scroll thousands of rows.

Management tables (customers, orders, team members…) feature search, filters, pagination, and multi-row selection. Default set, build completely without asking:

```
(page name "Customers" is <h1> in header bar, not repeated here)
[All 32] Active 18  Leads 9  Inactive 5  [search…] [Filter] [+ Add customer]
┌──────────────────────────────────────────────────────────────────┐
│ ☐  Customer ↕       Company      Status          Revenue ↕     ⋯ │
├──────────────────────────────────────────────────────────────────┤
│ ☐  ⬤ Name            Company      (● Active)       $18,450.00   ⋯ │
│ ☐  ⬤ Name            Company      (● Lead)              $0.00   ⋯ │
├──────────────────────────────────────────────────────────────────┤
│ 1 to 10 of 32 customers             Per page [10▾]   ‹ 1 2 3 4 › │
└──────────────────────────────────────────────────────────────────┘

When rows are selected, the tab row + search + add button is REPLACED by:
[3 selected · Deselect]                                    [Delete 3 rows]
```

- **Status tabs** above the table follow "Tab bar" in `../components/small-controls.md` — open that file for variants and classes, do not re-derive here. This table often includes a filter chip row directly beneath the tab row, in which case tabs use `underline`. "Filters" in requirements is not just the tab row: other fields (company, assignee, date range) go into a **Filter** button opening a popover, built per "Filter popover" in `overlay.md`.
- **Below `sm`, if status tabs do not fit a single row, collapse into a dropdown button**, do not scroll horizontally: outlined `h-10` button displaying **label "Status:" (`text-muted`) then currently selected status with count** ("Status: All · 32") and `ChevronDown`; without the label, a standalone "All · 32" button looks like an input or unfamiliar button with no indication of what is being filtered (settled by maintainers). Clicking opens the full list of statuses, each item with its count, selected item with a checkmark (Select pattern in `../components/choice-controls.md`, dropdown list per Dropdown in `overlay.md`). This is step 3 of `R10`: horizontal scrolling pushes the final tab **completely** out of the frame ("Inactive 6" starting at 370px in a 367px container), edge fades have nothing to fade against, and users assume there are only three statuses. Shortening text ("Act.") destroys meaning. The button is **left-aligned, sized to content** (`w-fit`), sitting on its own row: it is a filter, read from the left like the chip row below and search input above; right-aligning leaves a lone button floating in blank space, detached from the chip row it accompanies. Do not stretch full-width: looks like a text input. The chip row still scrolls horizontally with edge fades (`R10`; scroll indicator only when user selects): chips are secondary filters, seeing a partial chip is enough to indicate more.
- **Row hover uses `hover:bg-surface-hover`**, not `hover:bg-item-hover` (`I10`). A row touching both borders of a white frame painted with page background colour looks like a punched hole.
- **Status column uses colored badges** per `M7`, not a gray dot + black text. **If almost all rows share the same status, do not make it a column**: standard rows carry no marker, only exception rows get a badge next to the name (members "Active" / invitation "Pending", see "Members and permissions page").
- **Filter reset button says "Clear filters", not "Deselect".** When rows are selected, the top bar already has "Deselect" (unchecking rows); having "Deselect" at the end of the chip row creates two buttons with identical labels doing different jobs (`N6`). **"Clear filters" at the end of the chip row only appears when chips are active** (clicking resets everything: chips, keywords, tabs back to All). If only a keyword is present, do not show it: the search input already has its own `X` button, and the empty state already provides "Clear search"; adding this button makes **three buttons resetting one keyword** on a single screen, and at 375px it consumes one-third of the chip row.
- **Text columns flex naturally, do not lock `max-w` when table has spare room.** Let name and company columns flex with the table, enabling `truncate` only when space is genuinely exhausted. Hard locking creates scenarios where names truncate like "Elizabeth Montgomery Th…" while large white space remains in the middle of the table.
- **Count columns before building**: container has ~970px at 1280px with sidebar open; beyond ~6 columns it starts getting cramped. Try in order: merge columns (email below name), hide rarely used columns behind a "Show columns" button, and only then allow horizontal scrolling inside the container with the first column pinned `sticky left-0` (`R9`). Tables with 7–9 horizontally scrolling columns exist in major products, scrolling is not wrong; what is wrong is scrolling before attempting to merge.
- **Currency columns strictly require `tabular-nums`** (`T16`). If the font lacks a `tnum` table, the class is dead text and thousand separators do not align: report a single line to the user at delivery, changing fonts is their decision (`N10`).
- **Row actions** follow `I11`: 1–2 actions remain visible icon buttons in the last column; 3+ or destructive actions collapse into a `MoreHorizontal` dropdown. Last column is narrow `w-12`, right-aligned, headerless (with `<span class="sr-only">Actions</span>`).
- **Multi-row selection:** checkbox at row start, header checkbox has three states (none / partial / all on page). When there are no rows (empty, filtered empty, loading, error), **hide header checkbox**, reserving space so the column does not shift. When rows are selected, **batch action bar replaces** the tab row, matching height so the table does not jump. Batch deletion always requires a confirmation dialog (`../layouts/overlay.md`), stating the exact row count.
- **One line per cell.** Long company names use `truncate` (`min-w-0`) and full `title`, with width allocated by the table rather than locking `max-w`, never wrapping to three lines: a cell three times taller breaks table rhythm. Two-tier cells (name + email) are the only exception, applied uniformly across all rows.
- **Empty values use a single consistent style**: `—` in `text-muted`. Do not mix "None", "Walk-in", and blank space.
- **Numbers are right-aligned with `tabular-nums`**, numeric column headers also right-aligned. Sortable numeric/date columns use arrow-icon buttons built per `../components/sortable-header.md` (no hover background, collapses below `sm` to "Sort by:" button).
- **Table header row**: `text-xs font-medium text-muted`, background `--surface`, separated from body by `--border`.
- **Pagination includes total count and current range** (`I16`), built per "Pagination" in `../components/small-controls.md`: single-page hides nav, zero rows hides entire footer. Narrow screens see bullet below.
- **Below `sm`, management tables become card rows, not horizontal scroll.** Each row follows `../components/list-row.md`: checkbox · avatar · name (`font-medium truncate`) above email (`text-xs text-muted truncate`) · ⋯ button at right edge; bottom row indented flush with name text contains **status badge** on left, **primary figure** (revenue) right-aligned `tabular-nums`. Secondary columns (company, created date) are hidden, viewable in detail page/drawer. Tab row, chips, batch bar, pagination remain intact. A 6-column table at 375px scrolling horizontally loses the name column (271px in a 341px frame) on the very first scroll gesture, leaving detached "Company —, Active" without knowing whose it is; pinning the name column leaves only ~70px of scrollable area. Major mobile admin apps invariably convert to rows.
- **Medium containers hide secondary columns, do not scroll.** Table card is a `@container`; below `@4xl` (56rem, ~896px) hide exactly the columns dropped below `sm` (company, created date): `hidden @4xl:table-cell` on both `<th>` and `<td>`. In a 718px container (768px screen, or 1024px with sidebar open), a 7-column 960px table scrolls horizontally, leaving ⋯ buttons hidden until scrolled; hiding two secondary columns fits flush, expanding the name column from 208 to 264px. Secondary column data remains viewable in drawer / detail page.
- **From `sm` upwards, if the table still must scroll horizontally, the first column must be pinned** `sticky left-0 bg-surface` (hovered/selected rows update pinned cell background accordingly), pinned column occupying no more than ~40% of container, with right edge carrying an edge fade per `R10` while scrolling.


### Table grouped by status (task list)

```
[List] Kanban                                             [+ Add task]
┌──────────────────────────────────────────────────────────────────────┐
│ Task                          Priority   Assignee          Due date ↑│
├──────────────────────────────────────────────────────────────────────┤
│ ⌄ ○ To do  5                                                         │  <- group row: full-width button
├──────────────────────────────────────────────────────────────────────┤
│ Task title                    ! Urgent   ⬤ Jordan Lee      3 days late ⋯ │
│ Project                                                              │
│ Task title                    ▂▄ High    ⬤ Alex Turner     Today       ⋯ │
│ Task title                    ▂ Low      —                 —           ⋯ │
├──────────────────────────────────────────────────────────────────────┤
│ › ◉ In progress  4                                                   │  <- collapsed
│ ⌄ ⋯ In review  0                                                     │
│   No tasks in this group                                             │
└──────────────────────────────────────────────────────────────────────┘
```

- **Group rows use status icon + name + count, no pill** (`D2`, `M7`). Three gray pills and one blue pill make it impossible at a glance to tell which group you are in. Name `text-sm font-medium`, count `text-muted`. The entire row is a full-width `<button aria-expanded>` (`I29`), with chevron `size-4` at start, rotating `-rotate-90` when collapsed.
- **Groups must be sorted by a key, displayed in the column header.** Default to due date ascending: overdue at top, today, upcoming dates, undated at bottom. Done group sorts by completion date descending. The active sort column header shows an arrow (`arrow-up` `size-3.5`, `../components/sortable-header.md`). Leaving mock data unordered places "Today" below "09/28" and below an undated task, making readers assume the table sorts by something undetectable.
- **All short columns shrink to fit longest content, title column takes remainder.** Priority, assignee, due date, ⋯ column: `<th class="w-px">` and `whitespace-nowrap` cells; title cell `w-full`. Specifying `w-px` without `nowrap` on a column squeezes it down to the first word ("Jordan", "Alex T…"). Truncating names loses the identifier that distinguishes one person from another: "Alexander Montgomery T…", "Elizabeth Patricia S…" while the task column on the left wastes half the table (`N8`). Only truncate when the entire table runs out of room, shortening the title column first: title `min-w-0` + `truncate` (or `line-clamp-1`) inside cell, preventing overflow into adjacent columns.
- **Layout adapts to container width (`@container` on card), do not lock `min-w` and force horizontal scroll.** Three tiers:
  - **Container from `@4xl` (56rem, ~896px):** full columns, assignee shows avatar + name.
  - **From `@2xl` (42rem) to below `@4xl`:** assignee column **collapses to avatar only**, name moves to `title` and `sr-only` next to avatar (`whitespace-nowrap @max-4xl:sr-only`, not `sr-only … @4xl:not-sr-only`: `not-sr-only` reverts `white-space` to `normal`, causing four-word names to wrap across three lines, `tailwind-v4-traps.md` W11), column header shortens to "Assignee". This column consumes the most room (~260px with long names); removing the name returns ~200px to the task title. At 1024px with sidebar open (718px container) task titles expand from ~190px to 253px without scrolling.
  - **Below `@2xl`: card rows**, following the philosophy of management tables below `sm` (Data table section). Retain group rows, hide `<thead>` (still `<table>`, with `<tr>` displayed as `grid`). Each task: title `text-sm font-medium` **`line-clamp-2 text-pretty`** on the same row as the ⋯ button (button aligned to top of title, not vertically centered across the whole row); project `text-xs text-muted truncate`; bottom row holds priority (icon + label) then due date, `text-xs`, and assignee avatar **aligned vertically with the ⋯ button**. Two-line task title is an exception to "one line per cell": in narrow rows, title is the sole identifier; a single line at 375px leaves only ~20 characters ("Schedule interview with two ca…"). Without `text-pretty`, line two is left with an orphan word ("CRM", "new", "branch"; `T10`).
    **Empty parts are omitted entirely, do not write `—`.** Without column headers, `—` has no context: bottom row becomes "Low — —". If no due date, show nothing in that slot (set date in detail page); if unassigned, show no avatar.
  Do not lock tables with `min-w-[52rem]` and scroll horizontally inside the card: at 375px a single scroll gesture loses both group name and task title; at 768px and 1024px the ⋯ button sits completely outside the frame, "3 days late" gets sliced by the card edge, and the active sort column splits in half. `probe.mjs` flags "table scrolls horizontally while first column scrolls away".
- **Collapsing groups inside `<table>`: one `<tbody>` per group; collapsing hides `<tr>`, no sliding divs.** Group header is the first `<tr>` in `<tbody>`, where `<th scope="rowgroup" colSpan={columnCount}>` houses the `aria-expanded` button; collapsing marks task `<tr>` rows `hidden`. The sliding `grid-rows` block used in sidebars (`I29`, sidebar group collapse above) **cannot** be used inside tables: wrapping `<div>` around `<tr>` is invalid HTML, browsers either eject it from the table or recompute column widths based on that block, squeezing middle columns and causing long task titles to overlap adjacent columns. Tables do not slide heights; for animation, simply rotate the chevron.
- **Empty cells use a single `—` style across all columns, including due date.** Showing `—` for empty assignee but "Set date" for empty due date produces two different empty representations on one row; gray "Set date" also resembles an actual value. For inline-editable cells, the entire cell is a button opening date picker / person picker (clickable cues only show on hover since this is a secondary cell; when the cell is the primary job of the page, cues stay visible, see "Members and permissions page"): normally `—`, on hover or Tab focus it gains `bg-foreground/8 rounded-lg` background and switches to `calendar-plus` icon + "Set date". **Do not use `bg-surface-hover`**: that is also the row hover background; a cell on a hovered row would match the row background and fail to stand out. `foreground/8` layered on top of the hovered row remains distinctly darker (`I10`; `/5` is nearly indistinguishable from row background). Populated cells ("Today", "09/28") follow the same formula, retaining this background while the picker is open (`aria-expanded:bg-foreground/8`). Cell `px-2` (other cells `px-4`), button inside `px-2`: text aligns with column header without stretching the button via `-mx-2` (`N11`, `F13`). On devices without a mouse, `—` remains clickable. Date pickers opened from cells follow "opened from a table cell" in `../components/choice-controls.md`: picking a date saves immediately, with "Clear date" available when a date is present.
- **Empty group** expands to a single `text-sm text-muted` row "No tasks in this group", indented flush with the title column (`../components/empty-state.md`). If the entire table is empty, retain the column header row with a centered muted text row.
- **Skeleton includes group rows.** The first row of the real table is a group row; starting skeletons directly with task rows causes the entire table to drop by one row when data arrives (`I19`). Skeleton: one group row (chevron + `w-24` bar), then task rows. **For content-sized columns, skeleton cells use the real cell width classes** (`min-w-32` priority, `min-w-40` due date…), and the assignee skeleton bar is sized for a full name (avatar + `w-44` bar). Columns size to the longest content, so a short skeleton bar narrows the column, causing all three columns to jump horizontally when data arrives (a `w-24` name bar gives a 176px assignee column during loading and 262px with data, jumping Priority by 86px).
- **"Add task" button sits at the end of the view switcher row**, right-aligned, shared across both views (`primary`, `plus` icon). A page with no path to a task creation form is read-only, not actionable.
- **View names: "List" / "Kanban", not "Table".** Per `S10` "table" is a data table, and the list view here is already a table: labeling the kanban view "Table" creates conflicting terminology on the same screen. View switcher is `segmented` per "Tab bar" (`../components/small-controls.md`), optionally with `list` / `square-kanban` icons.
- Row actions, hover, priority badges, and due date colours follow the sections above and `../components/list-row.md`. While a row menu is open, the row retains its hover background.

---

## Empty list

A single line of muted text, `py-6`, no illustrations, no buttons. See `../components/empty-state.md`.

Only build illustrated empty states with a CTA when this is the app's primary landing screen and first-time users have no existing data.


---

## Error pages (404, 403, 500, maintenance)

Four pages, **two placement contexts** depending on whether the app shell can still be rendered:

| Page | Where placed | Primary action (solid button) | Secondary path |
| --- | --- | --- | --- |
| 404 in-app (authenticated) | **Inside app shell**, sidebar and header remain | Back to overview | Go back to previous page (only if previous page exists) |
| Record not found (customer, order… wrong id or deleted) | Inside app shell, same block as 404 | Back to list of that record type ("Back to customers") | Go back to previous page (only if previous page exists) |
| 403 | Inside app shell | Request access | Back to overview; bottom line "Signed in as … · Switch account" |
| 500 for a single page (shell still works) | Inside app shell | Reload page | Back to overview; bottom line `font-mono` error code + copy button |
| 404 unauthenticated, 500 crashing entire app, maintenance | **Standalone**: same block as in-shell, with centered logo above; **no card** | 404: back to home / login. 500: Reload page. Maintenance: no solid button, "Reload page" is an outlined button | — |

- **Authenticated users encountering errors stay inside the app.** Dropping the app shell removes their way out: switching to another page requires clicking a single button on a card. Design guidance for 404 pages uniformly keeps site navigation, and nested routers render not-found pages **inside** the parent layout. The header bar shows the error title ("Page not found"), not the previous page name or breadcrumb trail.
- **Route catching all paths inside the app shell must have an element.** `{ path: "*" }` without `element` causes the shell to render an empty content area while the header still says "Overview": users assume the page is loading. Root router catch-all only covers paths outside the app shell.
- **In-shell block: no card, centered, text centered** like load error blocks (`../components/empty-state.md`): `mx-auto max-w-md pt-16 pb-16 text-center sm:pt-24`, resting directly on the page background. Buttons `h-11 md:h-10`, below `sm` full-width and stacked vertically (solid button on top); from `sm` size to text, horizontal, centered, solid button first.
- **Standalone is that same block, no card.** Page `min-h-screen bg-background px-4 pt-24 sm:pt-40`, logo (`ProductBrand`, `../components/logo.md`) centered above, title spaced `mt-8` from logo; text, buttons, spacing identical to in-shell variant. An error page is not a form: borrowing authentication screen cards (full-width `h-12` button) leaves a 404 page with a 400px black bar as the heaviest visual element on screen, and placed next to the in-shell version creates two completely different layouts for one page type (`N5`; maintainers noted "looks off"). Popular 404 component kits are likewise plain pages, without cards. `M29` (a single card centered on an empty page) is reserved solely for auth screens and single-block onboarding.
- **404 has a small, muted "404" status code above the title**: `text-sm font-medium text-muted tabular-nums`, title `mt-1`. Standard 404 components include this line; "404" is the text users recognize and search for. 403, 500, maintenance do not include it (500 already provides a specific error code on the bottom line; two codes is redundant).
- **Title is `text-xl font-semibold`** (`T2`), not `font-bold`. No oversized icons, no illustrations, no red: the user has nothing to fix (`M30`).
- **Description explains why and what to do next**, in one or two sentences. 404: "The link may be mistyped, or the page has been moved." 403: names the page (`font-medium text-foreground`) and who has access. 500: "An error occurred on our end, not yours." Maintenance: reopening time, written naturally (`T16b`: "at 11:30 PM today", not "23:30 · 09/26/2026").
- **403: requesting access and current account.** Being signed into the wrong account is the most common cause, so the bottom line states the active email with a "Switch account" link, like access-request pages in major office suites. When email is mid-sentence, periods belong to `EmailText` `suffix`, and the entire email is a single unit: wrapping happens as an entire chunk, never splitting after `@` (`../components/description-list.md`). **"Switch account" sits on its own row** below the sentence (`mx-auto mt-1 flex h-8 w-fit items-center px-1.5`), not appended after the email: appending makes email + link 448px wide, the widest part of the block (lead text 439px, title 310px), making the bottom heavier than the top (measured at 1280px). Breaking onto its own line keeps the footer at ~270px.
- **403 submitted: change both title and description, do not insert green text where the button was.** Title becomes "Request sent", description "You will receive an email once **<name>** approves your request.", button row collapses to just "Back to overview" (still outlined, preserving role styles); account line remains. Title has `tabIndex={-1}`, moving focus there upon submission (`I31`). Major office suites similarly transition the screen to "Request sent" + email confirmation text. Do not leave a hidden button slot with "✓ Request sent" in its place: text is shorter than the button, shifting the row 16px off-center to the right, looking like a missing button.
- **"Go back to previous page" only appears if a previous page exists in-app.** When opened directly via link (new tab), this button exits the app or does nothing; hide it. React Router: `location.key === "default"` indicates the initial page of the session.

---

## Settings page

**A. Single column, sectioned with headings** (default, under 15 options)

```
Account
┌─────────────────────────────────────┐
│ Display name          [input field] │
│ ─────────────────────────────────── │
│ Email                 name@mail.com │
└─────────────────────────────────────┘

Appearance
┌─────────────────────────────────────┐
│ Dark mode                     [   ○]│
└─────────────────────────────────────┘

Danger zone
┌─────────────────────────────────────┐
│ Delete account             [Delete] │
└─────────────────────────────────────┘
```

- Each section is **a single block divided by borders**, not one card per setting.
- Label on the left, control on the right, sharing the same row.
- **Label aligns with the input control, not the entire right column block.** When rows contain helper text or errors below the input, the right block is taller than the input; vertically centering the entire row drops the label midway between input and helper text. Grid by default stretches label cells to row height (`stretch`), so `min-h` + `items-center` on the label wrapper is insufficient; `sm:items-start` is required on the row (without it, "Timezone" and error-state labels drop 11px out of alignment with the input):

  ```html
  <div class="grid gap-2 px-4 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start sm:gap-6 sm:px-5">
    <!-- min-h matches input height: single-line label aligns with input center -->
    <div class="flex min-w-0 flex-wrap items-center gap-x-2 sm:min-h-11 md:min-h-10">
      <label for="timezone" class="text-sm font-medium">Timezone</label>
      <!-- "Saved" indicator here -->
    </div>
    <div class="flex min-w-0 flex-col gap-2">
      <!-- input, then helper text or error -->
    </div>
  </div>
  ```

  Rows with **read-only text + button** (Email, Password) also use `sm:items-start`: label and button occupy a height matching the input at row start, value text gets `sm:py-2.5` to align the first line with the label. Centering vertically causes a four-line value (wrapped email + "Pending confirmation…" line) to push the "Email" label down between lines 2 and 3. Only the avatar row centers vertically (`sm:items-center`): avatar is 64px tall, with no first baseline to align against.

  **Sections with purely read-only text (no inputs, no buttons) do not borrow input height bounds**: `min-h-11` and `sm:py-2.5` exist to center labels against inputs; without inputs, a single-line text row reaches 72px, leaving half the row empty. This usually indicates those rows should merge into secondary lines under the row above ("Next renewal", "Plan started", see "Billing page").
- Do not write explanatory copy under every row. Only explain options that are genuinely ambiguous.
- Danger zone is separated at the very bottom.
- **Default to building without a global "Save changes" button**: each row reserves space for a subtle "Saved" indicator next to the control (three states detailed in `../components/loading.md`). When and how saving occurs is application logic; the skill provides empty handlers (`onChange`). **Toggles and selects apply immediately; text inputs save on blur, or have a dedicated Save button for that specific card** (cards containing text fields have a Save button in the card footer). The pattern to avoid is **a single global Save button for the entire page** alongside auto-applying toggles: users cannot tell whether flipping a toggle requires clicking Save. Card Save buttons are disabled until changes exist.

- **Settings rows with descriptions replace description text with error or disabled reason copy, retaining `text-sm` size.** `text-xs` is reserved for text under form inputs, alongside helper text. Within bordered cards, descriptions across rows are all `text-sm`; a `text-xs` line "Enable Email above to receive newsletters." makes disabled rows look like misplaced footnotes, and row heights fluctuate when toggling Email.
- **Description copy for expandable toggles must make sense while collapsed.** "Do not send… during this timeframe" while the two time inputs are hidden references something unseen. Write for the disabled state: "Do not send emails or browser notifications during hours you specify."

### Multi-page settings area

When an app has two or more settings pages (Profile, Notifications, Security…), they form **a dedicated area** with its own navigation, not disjoint routes reachable only by typing URLs.

```
header h-16:  Settings                          <- <h1>, section name
              Profile   Notifications   Security<- underline tabs, each tab a route
              ───────   ━━━━━━━━━━━━━   ────────
              Channels                          <- enters first section directly, no separate page header
              ┌──────────────────────────────┐
```

- **Root route is never empty**: `/settings` redirects immediately (replace, no extra history entry) to the first child page. The "Settings" item in the sidebar remains active across all subpages (`aria-current` based on route prefix).
- **Under 6 pages: `underline` tab row at top of content area**, matching content column width (`max-w-2xl`), first tab label aligned with section heading below. Tabs are `<Link>` with `aria-current="page"`, not `role="tablist"`: each tab is a page, browser Back must return to previous tabs. Do not use `solid`: settings pages are filled with toggles painted `--primary`; adding black pills at the top creates competing black blocks, and pill text padded `px-3` drifts out of alignment with content.
- **6+ pages: vertical nav column on the left** (Pattern B), `w-48 shrink-0`, items matching sidebar link patterns: `h-10 rounded-xl px-3 text-sm text-foreground/70 outline-hidden`, hover `hover:bg-item-hover hover:text-foreground`, active one step darker `bg-secondary font-medium text-foreground`, with `aria-current="page"`. Column sits inside a white container `bg-surface rounded-2xl p-2`: sitting directly on a gray page background causes hover `--background` to blend into the page, making hover invisible (`I10`). Below `lg`, this column collapses into a horizontally scrolling `underline` tab row above (`../responsive.md`).
- **Section title in header bar is `<h1>`; subpages have no separate page header.** The active tab already shows which page you are on; adding a "Notifications" heading + description under the tab row repeats the page title twice (rule "exactly one `<h1>` per page" in "Page head in the content area"). State pages (`/settings/…/states`) preserve parent breadcrumbs as usual.
- **Profile is the first tab of the section**, not a separate route outside it. "Profile" in the user account menu navigates directly to that tab.
- **The rail under the tab row spans the exact width of the content column**, not the tab row's scroll container (which extends 8px on each side so the first tab label aligns with the column, `small-controls.md`): drawing the rail on the scroll container makes it protrude 8px on both sides relative to cards below. Render via `before:absolute before:inset-x-2 before:bottom-0 before:h-px before:bg-tab-rail` (`small-controls.md`) on the tab row wrapper (`relative`), positive offsets, no `-mx` (`N11`). Use `before:` instead of `after:`: `::after` renders last, painting over the active tab indicator line. For `underline` tabs (`box-content h-10 pb-px`, line at `bottom-0`), the wrapper is 41px tall, the rail sits on the bottom pixel, and the indicator sits atop it. If the content column uses `max-w-*`, add 16px to accommodate the tab row overhang (`max-w-2xl` becomes `max-w-[43rem]`), other blocks in the column use `mx-2` (at 375 and 768px all elements align with the `-mx-2` baseline). Colour `border-border-strong`: this line sits on the gray page background, where `--border` (`#f7f7f8`) is brighter than the background and disappears. Do not custom-mix `border-foreground/10` (on page background produces `#e1e1e3`, distinctly too dark). The 2px active indicator still sits on top of this line.
- Narrow screens: tab rows scroll horizontally per `small-controls.md` ("Chip rows on narrow screens"), without wrapping or converting into a select.

**B. Left vertical tabs** (15+ options on a single page, or 6+ settings pages): see "Multi-page settings area" above.

### Notification preferences page

A Type A settings page. Default section set: **Channels** (browser, email, digest email), **Notify me when** (one toggle per event type, ending with deadline reminders), **Do not disturb** (toggle revealing sliding time picker directly below on the same row).

- **Clarify in ONE place whether event toggles apply to in-app notification bells.** Stating "In-app bell receives all notifications" under Channels while stating "Applies to all active channels" below leaves users unsure whether disabling "New comments" silences the bell. Default: bell receives everything, event toggles apply only to external delivery channels, and section description states precisely that: "Applies to browser and email."
- If many event types × multiple channels require individual cell-level control (e.g. comments via email only), build an event × channel matrix table using checkboxes. Convention: products with numerous event types and two or more external channels (email, push) use a grid; products with fewer events use toggle lists. Skill defaults to the three sections above, since dashboard apps typically have few event types; propose a grid at delivery if the project exceeds ~6 event types and two external channels.
- Form rows match toggle row templates (label left, select right `sm:w-48`); below `sm`, controls drop below text, stretching full width.
- When browser blocks notification permissions: toggle locks disabled, description copy explains how to re-enable (padlock icon in browser address bar). If Email is disabled, digest email locks disabled, explaining "Enable Email above to receive newsletters."


---

## Profile page

A Type A settings page, not a bespoke layout. Default section set:

| Section | Rows | Saving |
| --- | --- | --- |
| Personal information | Avatar, Full name, Job title, Phone number | Text fields: Save button in card footer. Avatar: applies immediately on upload |
| Sign-in | Email, Password: read-only text + outlined "Change email", "Change password" buttons | Dedicated flows (modals) |
| Preferences | Language, Timezone | Apply immediately, "Saved" indicator next to label |
| Danger zone | Delete account | Confirmation dialog (`overlay.md`) |

- **Avatar on page uses the same component and seed colour as header / sidebar footer avatars** (`../components/avatar.md`). If they diverge, the header shows an indigo background and the profile page shows amber for the same letter "T" of the same person: viewing both locations looks like two different accounts.
- **Avatar and name in the header render from saved values, not uncommitted typing.** Clearing the full name field leaves the avatar as "T", not changing to "?". It updates only after saving, syncing the header and page simultaneously.
- **Avatar row has four states:**
  - No photo: initials, "Upload photo" button, helper line `text-xs text-muted` "JPG or PNG, up to 2 MB".
  - Has photo: "Change photo" and "Remove photo" **are both `outline` buttons**. Removing photo is **not red and requires no confirmation dialog**: clicking removes it immediately, avatar reverts to initials, accompanied by a toast "Profile photo removed" with an **Undo** action (`D3`: reversible actions delete immediately + offer undo). With undo, nothing is lost, so this is not a destructive action (`rose` per `I4` is reserved for irreversible losses: delete account, delete project). Both buttons share `outline`; do not make Remove photo `secondary` with a gray background: that makes it visually heavier than Change photo, even though changing photos is the primary task. **Do not use `ghost`**: `text-muted` text next to an outlined button reads like a disabled button, and when genuinely disabled (during upload) looks indistinguishable (previously encountered: "Remove photo" `#828282` matching helper text gray below).
  - Uploading: avatar dimmed `opacity-50` with centered spinner, "Upload photo" button disabled.
  - Error: red text **replaces** the helper line, not adding a new row. State actual figures and remedies: "File is 4.8 MB, choose an image under 2 MB".
- **Photos apply immediately upon upload**, like selects, independent of the card's Save button. Once users upload a photo and see the avatar update, they assume it is done; requiring another Save click causes lost photos if they navigate away.
- **Email and password are not edited in-place.** Changing email requires verifying the new address, changing password requires entering the old password; both use read-only rows + buttons opening dedicated flows. While awaiting email verification, a `text-sm text-muted` line appears below the email: "Pending verification for **new@…**", with the old email remaining the active login until verified. **"Resend" and "Cancel" sit on their own row directly beneath** (`flex gap-4 mt-1`), not joined to the email with a `·` separator: styled as text buttons `font-medium text-foreground hover:underline underline-offset-2` (like "Try again" in `../components/file-upload.md`), with tap targets expanded via `relative before:absolute before:-inset-x-1.5 before:-inset-y-2` (34px, negative offsets following `N11` like copy buttons in `description-list.md`). Appending to the sentence pushes "· Cancel" to a new line at 375px if the email is long, creating an orphan `·`, while 18px text buttons trapped mid-sentence become hard to tap.
- Password displays the last changed date in `text-muted` ("Last changed 06/12/2026"), not a masked string `••••••••`: dots convey no information while resembling an editable input.
- **State page** (rendered statically side-by-side) includes all cases: untouched (Save disabled), modified, saving, just saved, input error, file too large, **has photo**, **uploading photo**, **email pending verification**, very long name and title, timezone just updated, delete account confirmation dialog. Confirmation dialog at 375px: long emails must wrap after `@` (`../components/description-list.md`).

---

## Security page

A Type A settings page. Default section set:

| Section | Rows | Saving |
| --- | --- | --- |
| Two-factor authentication | Status line + action button; when enabled, adds Authentication method and Backup codes rows | Dedicated flow (modal), not a toggle |
| Active sessions | One row per device, current session pinned to top; container footer has batch logout button | Immediate action, toast on completion |

If Password already appears on the profile page (under Sign-in), do not repeat it here. If the app lacks a profile page, the Password row heads this page, built identically to the profile version.

```
Two-factor authentication
┌──────────────────────────────────────────────────────────┐
│ Disabled                              [Enable two-factor]│  <- disabled
│ In addition to your password, enter a 6-digit code.      │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│ ✓ Enabled since 06/12/2026                      [Disable]│  <- enabled
│ ──────────────────────────────────────────────────────── │
│ Authenticator app    Google Authenticator       [Change] │
│ ──────────────────────────────────────────────────────── │
│ Backup codes         8 of 10 remaining   [Generate new]  │
└──────────────────────────────────────────────────────────┘

Active sessions
If you see an unfamiliar device, log out of that device and change your password.
┌──────────────────────────────────────────────────────────┐
│ [▭] Chrome on macOS   This device                        │
│     San Francisco, CA                                    │
│ ──────────────────────────────────────────────────────── │
│ [▯] Safari on iPhone                         [Log out]   │
│     San Francisco, CA · 2 hours ago                      │
│ ──────────────────────────────────────────────────────── │
│                             [Log out of 4 other devices] │  <- same size and style as row button
└──────────────────────────────────────────────────────────┘
```

- **Two-factor authentication is not a toggle** (`../components/choice-controls.md`, "Settings rows"). Enabling requires three steps: scan QR code (or copy secret key), enter 6-digit test code, save backup codes. Disabling requires password re-entry. It must be a status line + flow button. Building it as a toggle causes problems: flipping immediately shows "Saved" before scanning any code, and once enabled leaves no room for methods or backup codes.
  - Disabled: label "Disabled" `text-sm font-medium` + explanatory sentence `text-muted`, with **`primary`** button "Enable two-factor" on the right (below `sm`, drops below text, left-aligned). Rationale for accent background (`I2`): this is what the page encourages users to do, and is the page's sole primary action. An outlined button on par with four "Log out" buttons fails to distinguish the most recommended action (maintainers noted: "enable 2FA should have a solid background"). Do not color "Disabled" yellow or red: solid buttons attract the eye sufficiently, and settings pages are not meant to alarm users (`M7`).
  - Enabled: top row shows `check` icon `text-emerald-600` + "Enabled since 06/12/2026", button `outline` "Disable" (not `rose`: disabling does not destroy data and is reversible, `I4`). Below are two Type A rows: Authenticator app ("Change" button), Backup codes showing count remaining ("Generate new" button). When 2 or fewer codes remain, show helper text `text-muted` "Running low on codes. Generate new ones and store them safely." Losing a phone without backup codes locks out the account, so this row must not be buried.
  - Enable and disable flows: skill provides empty handlers (`onEnable`, `onDisable`); the page reflects state returned by the server (`N10`).
- **Session rows** follow `../components/list-row.md`: device type icon in `size-10 rounded-lg bg-background` container, device name `text-sm font-medium truncate`, secondary line `text-xs text-muted` "location · last active", outlined "Log out" button sized to form buttons (`h-11 md:h-10 rounded-xl`, matching "Enable two-factor"), **turning red on hover / Tab focus** ("repeated button on rows" pattern in `I4`), with `aria-label` naming the device. Current session is pinned to top, labeled `text-xs text-muted` "This device" next to name, **no button** (self-logout goes through user menu). Below `sm`, buttons drop below text, left-aligned.
- **Logging out a single device takes effect immediately**, without confirmation, displaying a toast "Device logged out" with device name below. No Undo: a revoked session cannot be resurrected.
- **Batch logout: standalone danger button** (`rose-500/10` background, `rose-700` text, `I4`), **matching row button height** (`h-11 md:h-10 rounded-xl`), located in the container footer, visible only when other devices exist. Red because it kicks all other devices out simultaneously without recovery, including machines the user may be actively using; logging out in this skill is treated as high-impact (`I4`, maintainers settled). **Requires confirmation first** (`D3`: multiple devices simultaneously) using a red confirmation dialog matching delete dialogs (`log-out` icon in `rose-500/10`, confirm button `rose`). Do not revert to the "no data lost" argument (rejected by maintainers) to switch to neutral outlines: the entire page would lose its cautionary signal. If the `rose` button were taller than row buttons, two heights would collide in one container: keep row button height, keep `rose` styling.
- **Consistent button sizing across the page** (`h-11 md:h-10`), never `h-8` for row buttons. At 1280px rows do not grow taller (the `size-10` icon container is already 40px tall, matching the button); at 375px rows gain 12px but buttons reach 44px, the recommended minimum tap target for touchscreens (32px buttons fall short). Having `h-8` row and batch buttons sit beneath an `h-10` "Enable two-factor" button creates mismatched button heights (maintainers: "keep h-10 across the board for consistency").
- **Shift focus after row removal** (`I31`): logging out a device moves focus to the "Log out" button of the next row (or previous row if at the end); after batch logout, shift focus to the "Active sessions" section heading (`tabIndex={-1}`). Without focus management, focus drops back to `<body>`, disorienting screen readers.
- **Skeleton**: top row represents current session so it **has no button skeleton**, while subsequent rows do (`I19`: accurate skeleton shapes).
- **State page** includes all cases: 2FA disabled, enabled, enabled with low backup codes; sessions loading, load error, logging out a row (spinner inside button, button preserves size), only current device remaining (no footer), very long device names; batch logout confirmation dialog; two toasts.


---

## API keys page

A Type A settings page, with **a single section** "Workspace keys": description explains where keys are used and how to secure them, with `primary` button "Create API key" aligned with the section heading (the sole primary action on the page, `I2`; below `sm`, drops below description, left-aligned). No separate page header (see "Multi-page settings area").

```
Workspace keys                                               [+ Create API key]
Used to authenticate API requests from your server. Treat keys like passwords…
┌─────────────────────────────────────────────────────────────────────────┐
│ Production server                                                   ⋯   │
│ app_live_…a3f9 · Full access · Used 2 min ago · Never expires           │
│ ─────────────────────────────────────────────────────────────────────── │
│ Sync orders to accounting software for branch office…               ⋯   │
│ app_live_…7c1e · Read-only · Used 3 days ago · Expires in 3 days        │  <- amber
│ ─────────────────────────────────────────────────────────────────────── │
│ Legacy reporting script (Expired)                                   ⋯   │  <- end of list
│ app_live_…5e6f · Read-only · Used 09/11                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Key rows** follow `../components/list-row.md`, **without leading icon containers**: repeating a key icon on every row says one thing five times (`N3`). Name `text-sm font-medium truncate` (with `title`). Secondary line `text-xs text-muted`: **masked key string** `font-mono` (`T17`) showing prefix and last four characters (`app_live_…a3f9`: prefix distinguishes live vs test keys, suffix for cross-referencing), permissions, last used (`<time>` with full timestamp in `title`, `T16b`; if unused, "Never used"), expiration. Dates per `T16b`: omit current year ("Used 09/07", "Expires 12/23"), include year only for different years. Avoid "Used 09/07/2026" sitting next to "Expires 12/23" in the same row.
- **Expiration has three tiers** per `list-row.md`: distant in `text-muted` "Expires 12/23"; 7 days or fewer shows remaining days in `text-amber-700` "Expires in 3 days" (`M7`, an actionable warning); already expired shows a neutral badge "Expired" next to the name and **drops the expiration segment** from the secondary line (no repetition). Expired keys sort to the bottom; newly created keys sort to the top.
- **Row action is a `⋯` button** (`I11`: actions including deletion collapse into three dots), `size-10`, with `aria-label` naming the key. Menu: **"Rename"**, divider, **"Revoke key"** (destructive menu item, red on hover, `I4`). Expired keys: "Delete" replaces "Revoke key" (revoking a dead key is mislabeled, `N6`). Three major platforms collapse key row actions into a three-dot button, two of which include a rename option. Because multiple actions exist, this differs from session rows (single action, standalone "Log out" button). Do not borrow session row styling (outlined "Revoke" `h-11` button on every row): at 375px buttons drop below text, each row reaching 143px tall, making five keys exceed a full viewport; with `⋯`, the button remains on the right, keeping rows at 87px.
- **Rename** opens a single-input modal (modal with form, `I20`), pre-filled with the current name, cursor auto-focused, "Save" / "Cancel" buttons. Validation errors on name collision with **other** keys (colliding with itself does not count). Once renamed, close dialog, toast "Key renamed" with the new name below, return focus to that row's `⋯` button. No confirmation dialog: key names are internal labels for workspace members; applications consuming the key are unaffected. Saving logic is application responsibility (`N10`): skill provides an empty `onRename` handler.
- **Secondary line splits into two semantic lines on narrow screens**, rather than allowing arbitrary browser wrapping: "key string · permissions" / "last used · expiration". From `sm` upwards, merges into a single row. Uncontrolled wrapping causes separators to wrap onto new lines ("· Never used"). Implementation details in `list-row.md`, "Multi-segment secondary line".
- **Revocation requires confirmation** via a red confirmation dialog matching delete dialogs (`I4` second sentence, terminates active processes; `D3`: consuming applications break immediately without recovery), `key-round` icon, bold key name in lead copy, "Revoke key" button. **Deleting expired keys executes immediately**, without confirmation: the key is already inactive. Both trigger a toast with key name below; no Undo. Removing a row manages focus (`I31`): to next row's `⋯`, previous row if at end, or section heading if empty.
- **Create key dialog** (modal with form, `I20`: clicking outside does not dismiss): three fields.
  - "Key name", helper text "Name after where the key is used, so you know which key can be revoked later." Cursor auto-focused. Duplicate active key names show an inline error below the input.
  - "Permissions": selection cards (`choice-controls.md`), because the two options carry vastly different implications; **pre-select the most restricted option** ("Read-only"). Developer documentation across major cloud providers emphasizes least-privilege defaults.
  - "Expiration": select 30 days / 90 days / 1 year / Never expires, **with a default expiration selected**, never defaulting to "Never expires". Helper text below shows the concrete expiration date ("Expires December 25, 2026."), rather than making users calculate dates.
- **Upon creation, the same dialog transitions to the reveal step**, rather than closing and opening a new modal (avoiding a flicker and dual focus shifts). Title "Copy API key", description stating this is the only time the full key will be shown. The key sits in a `bg-background rounded-xl px-4 py-3 font-mono break-all select-all` container (clicking selects the entire string; do not truncate with "…" because users must verify pasted keys). Below the container is a `primary` "Copy key" button (`I2`: sole job of this step) with `copy` icon, receiving auto-focus upon entering this step; once copied, icon switches to `check` for 1.5 seconds, label unchanged (`N1`), with `role="status"` "Copied". Dialog footer has only "Done" (`secondary`). Do not place the copy button on the same line as the key container: at 640px and 1280px keys wrap to two lines, creating a black box matching the size of the key container beside it.
- **State page** includes all cases: loading (accurate row skeletons, `size-10` button slots), load error, no keys (single text line, create button already in header), very long key name, key expiring soon, expired key, active `⋯` menu; revocation confirmation dialog; empty create dialog, missing name error, duplicate name error, creating state; key reveal step, just copied state; two toasts.

---

## Billing page

A Type A settings page, with four sections in order: **Current plan**, **Payment method**, **Invoice history**, **Danger zone** (cancel plan, paid non-cancelled plans only). If the app issues corporate invoices, add a **Billing details** section (billing email, company name, tax ID; "Edit" button opening a form modal) between payment method and invoice history. Five billing pages across major SaaS products all include payment methods (masked cards, change button) and downloadable invoices; three include billing email/details; all surface failed payment attempts directly on the page, with immediate paths to retry or update cards.

```
[!] Failed to charge $129.00 for period 09/12               [Update card]   <- only on failed charges
    Visa ending in 4242 was declined. Update your card by 09/19 to keep Pro.

Current plan
┌──────────────────────────────────────────────────────────────┐
│ Pro                                              [Change plan]│  <- 16px 600
│ $129.00 per month                                            │
│ Renews on October 12, 2026                                   │  <- omitted during payment failure
└──────────────────────────────────────────────────────────────┘
Payment method
┌──────────────────────────────────────────────────────────────┐
│ Visa •••• 4242                                  [Change card]│
│ Expires 08/2027                                              │
└──────────────────────────────────────────────────────────────┘
Invoice history
┌──────────────────────────────────────────────────────────────┐
│ Date    Invoice ID          Status            Amount         │
│ 09/12   INV-2026-0008       • Paid            $129.00     ⤓  │
└──────────────────────────────────────────────────────────────┘
Danger zone
┌──────────────────────────────────────────────────────────────┐
│ Cancel Pro plan: you keep access through Oct 12, [Cancel plan]│  <- subtle red background (I4)
│ after which the workspace moves to the Free plan.            │
└──────────────────────────────────────────────────────────────┘
```

- **Plan is a single container, not split into label–date rows.** Plan name `text-base font-semibold`, the visual anchor of the block. Below the name are two `text-sm text-muted` lines: price (`text-foreground` figure) with billing frequency ("per month", "per year"), then "Renews on October 12, 2026" (isolated dates show full year, `T16b`). Price and renewal are **two separate lines**, not joined by `·`: at 375px joined lines wrap awkwardly mid-sentence. **No "Plan active since" row**: nobody visits billing pages to act on that date; initial signup already appears at the bottom of invoice history. Splitting plan, "Next renewal", and "Active since" into three separate rows creates 77, 73, and 72px heights (borrowing form input heights), where the 14px 500 plan name looks identical to date labels, obscuring which plan is active. A single card keeps height around 80px, making the plan immediately prominent.
- **Plan section buttons adapt to plan tier:**
  - Paid: only "Change plan" `outline`, linking to pricing table (`pricing.md`).
  - **"Cancel plan" belongs in Danger zone at bottom, not beside "Change plan"** (Type A rule: danger zones isolate at the bottom, like "Delete workspace"). A single row mirroring workspace danger rows: consequence text `text-sm text-muted` on the left ("Cancel Pro plan: you keep access through October 12, 2026, after which the workspace moves to the Free plan."), "Cancel plan" button on the right, **standalone danger button** (`I4`: `rose-500/10` background, `rose-700` text). Section heading "Danger zone", not "Cancel plan" (avoiding heading and button sharing identical text). Remains readily visible on scroll, opening confirmation in a single click: never hidden behind separate pages or multi-step mazes. Cancelling a subscription belongs to the family of deleting accounts, leaving teams, logging out (`I4` sentence 2: terminating active services). Placing a red button next to "Change plan" at the very top creates the heaviest visual weight on the screen; on a healthy account, eyes land on cancellation first. Moving it to the bottom leaves the plan card with only "Change plan", while cancellation remains red and one click away.
  - **Cancellation confirmation dialog uses red styling matching delete dialogs** (`I4`, `overlay.md`): `calendar-x` icon in `rose-500/10` background with `rose-700` glyph, confirm button "Cancel plan" in `rose-500/10` with `rose-700` text, "Keep plan" button `--secondary` receiving auto-focus on open. Consequence copy states the actual expiration date ("You will have access to Pro through October 12, 2026, after which you move to Free"). Do not use non-destructive confirmation dialog styles (gray icon, black `primary` button). Do not re-apply the "cancellation destroys no data" argument (neutral outline, gray icon, black button): that same argument was rejected by maintainers for batch logout.
  - Free: line below name reads simply "Free", no renewal line, single `primary` "Upgrade plan" button (`I2`: desired conversion action). Payment method section is hidden until a card is added.
  - Cancelled, still active: date line switches to `text-amber-700` "Ends on October 12, 2026, after which you move to Free"; "Resume plan" (`outline`) sits next to "Change plan" in the plan card, **Danger zone is hidden** (nothing left to cancel).
  - **Failed charge: omit "Renews on …" line** from plan card. When the current cycle is unpaid, the next renewal date is invalid; keeping it contradicts the failure banner above (`S6`). Do not add an "Overdue" badge next to the plan name: the banner already states this (`N3`). **Consequence copy in Danger zone and cancellation dialog must also avoid that date**: "you keep access through October 12" promises a period that has not been paid for. Handling cancellation during a failed charge (immediate reversion to Free vs grace period) is application logic (`N10`); copy derives from data, defaulting to "Cancel Pro plan: workspace moves to Free immediately." Having the plan card drop the renewal date while the footer still promises access through that date creates contradictory statements.
  - Below `sm`, buttons drop below text, left-aligned, matching standard settings rows.
- **Payment method is a single row**: "Visa •••• 4242" `text-sm font-medium` (brand name in text + last four digits; no card logos), bottom line `text-sm text-muted` "Expires 08/2027", outlined "Change card" button. If the card expires before the next renewal date, bottom line turns `text-amber-700` "Expires 10/2026, before renewal on 10/12"; if already expired, `text-red-600` "Expired 08/2026". Card update flows belong to the application (`N10`), skill provides an empty handler. **A standalone row button does not become `primary` by default** (`I1`, `I2`): "Change card" is an infrequent maintenance task, akin to "Change email" or "Change password", hence an outlined button. The page carries at most one `primary` button: "Upgrade plan" on free tiers (`I3`). Coloring every standalone button black creates three competing black blocks on paid plans ("Change plan", "Change card", "Update card") where none stands out.
- **Failed payment: error-tone banner at top of page, above plan section** (`../components/banner.md`, no dismiss ✕, `role="alert"`). Title specifies amount and period, description explains cause and deadline, **one** outlined "Update card" button opening the payment method update flow. The corresponding invoice row retains a red "Failed" badge. **The button inside the banner remains an `outline` button with white background, not `primary`** (rule from `banner.md`): the light red background and red icon already draw the eye to the block; the white button is the brightest element within the container and is immediately visible. Placing a solid black button inside a red block layers the two strongest visual cues on screen. Design systems vary: some restrict banners to ghost buttons, others allow primary buttons based on emphasis. Lacking consensus for solid buttons, adhere to `banner.md` rules (`I2`: accent colour requires clear purpose; the red tone already carries urgency). Do not let failed charges exist solely as a red badge in invoice history: the plan section would continue displaying "Next renewal" as if nothing happened, with no clear path to fix payment.
- **Invoice history**: 5-column table with Date, Invoice ID (`font-mono text-muted`), Status (badge), Amount (right-aligned), download action. Newest on top. **No "Plan" column**: repeating the same plan name on every row says one thing eight times (`N3`). Rows are not clickable, so no row hover; download button is an icon-only `download` button, `ghost`, **always visible** (`I11`: single action, non-destructive), tooltip "Download PDF", `aria-label` includes invoice ID. Dates per `T16b` (omit year for current year, full date in `title`). **Choose table vs list by container width (`@container`)**, not viewport: with a left nav column, at 1024px the content column is only ~490px wide. When narrow, each invoice collapses into a 2-tier row: date + ID, then badge on left with amount on right; `size-10` download button on the right edge.
- **State page** includes all cases: loading (accurate skeleton for each section), section load error, free tier (no invoices), annual billing (prior year invoices show full year), payment failed (banner + badge), card expiring soon, card expired, cancelled plan during grace period, cancel confirmation dialog.

---

## Members and permissions page

A management table per "Data table" above, with the specific variations below. The two primary tasks of this page are **inviting** and **changing roles**, so both must be immediately apparent without requiring hover or digging into ⋯ menus.

```
[All 18] Active 14  Pending 4                     [search…] [Role ▾] [+ Invite member]
┌──────────────────────────────────────────────────────────────────────────┐
│ ☐  Member                                       Role             Joined date    │
├──────────────────────────────────────────────────────────────────────────┤
│    ⬤ Alex Turner                 You            Owner            03/04/2024     │ <- locked: plain text, no ⌄, no ⋯
│       alex.turner@example.com                                                   │
│ ☐  ⬤ Jordan Lee                                 Admin ⌄          06/17/2024   ⋯ │
│       jordan.lee@example.com                                                    │
│ ☐  ⬤ sam.taylor@example.com      (Pending)      Member ⌄         —            ⋯ │ <- badge only on exceptions
│       Invited 09/24                                                             │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Editable role cells always show `ChevronDown` `size-3.5 text-muted` after text**, not just on hover. Relying solely on hover background makes an editable "Admin" cell look identical to an unchangeable "Owner" cell, obscuring the primary requirement ("change roles") until accidentally hovered. Major team management apps keep arrows permanently visible in role columns. Locked rows (owner, self) use plain text without chevrons: **presence or absence of the chevron is the affordance indicator**, eliminating the need for padlock icons. Cell `px-2`, inner button `px-2` (matching due date cells, no `-mx-2`), hover background `bg-foreground/8`, preserved while menu is open (`aria-expanded:bg-foreground/8`) like inline editing in task tables (`I10`: buttons inside hovered rows use `/8`; `/5` blends into row background).
  - **Chevrons align to a single vertical column**: button width sizes to the **longest label** across roles, with chevron `ml-auto` anchored to the right edge. Sizing to content causes "Viewer ⌄", "Member ⌄", "Admin ⌄" to place chevrons at varying positions per row, creating a jagged column (12px discrepancy between roles). No JS measurement needed: place a `grid` inside the button, stacking all labels in the same cell (`col-start-1 row-start-1`), displaying the active label while marking others `invisible` + `aria-hidden`; the grid cell naturally sizes to the widest label. Do not hardcode `w-36`: changing role names or translating languages recreates the misalignment.
  - Unlike task tables (Table grouped by status section): where rows have 3–4 editable cells and arrows everywhere create noise, so cues reveal on hover. General rule: **when inline editing is the page's primary task, cues stay visible; when inline editing is secondary, cues reveal on hover.**
  - Menu opens per Select in `../components/choice-controls.md`: each role shows a name + one-line description of capabilities, with a checkmark on the active role. Selecting saves and closes immediately, displaying a toast "Role updated" with **Undo** (`D3`), no confirmation dialog: role changes are reversible. Owner is excluded from this list (ownership transfer is a separate flow requiring confirmation).
- **No Status column.** "Active" is the normal state for team members; repeating green badges across 14 of 18 rows says one thing 14 times (`N3`). **Only exception rows carry markers**: pending invitations get a neutral "Pending" badge directly after the email on the top line (where the "You" badge sits), bottom line reads "Invited 09/24", joined date `—`. Suspended members (if supported) are likewise exceptions, following the same convention. Status tabs remain available above for filtering. Dropping the column allows rows below `sm` to use two tiers (name + email on left, role on right) instead of three tiers where badges demand a separate row.
- **Role filter is a "Role" dropdown button next to search, not a chip row.** Menu contains checkboxes supporting multi-selection; when filtering a single role, button displays that role name ("Admin"), when multiple, "Role · 2", with `ChevronDown` at end. This button functions as a Select control: no hover background; when open, border is `border-focus` + `ring-2`, background remains white (`../components/button.md`). Chip rows beneath tabs are meant for tables where filtering is the primary interaction (e.g. customers by tags). Here, roles are already visible in their column, filtering by role is infrequent, and chip rows consume an entire row: two filter rows for 18 users is wasteful. Popular team admin apps uniformly filter roles via a dropdown. Below `sm`, this button sits alongside the "Status:" button.
- **Top-tier email (invitations without names) truncates local-part before `@`, preserving domain** (`AccountEmail` in `overlay.md`, `N8`): for invitations, the domain reveals whether someone is internal or external. Truncating the end causes `alex.montgomery.turner.accounting.office@co…` to lose its domain completely. Emails on the bottom line for named members truncate at the end normally: the entire company shares a domain, so distinguishing information sits before `@`.
- **The ⋯ menu contains only actions not represented in cells**: members have "Remove from workspace"; invitations have "Resend invitation", "Revoke invitation". Role changes are not duplicated in the menu (already handled in-cell). Locked rows have no checkboxes and no ⋯ button.
- **Batch action bar includes "Change role" (dropdown) next to "Delete N members"**: updating roles for newly onboarded cohorts is more frequent than batch deletion. Applying updates triggers a unified toast with Undo.
- **Invitation modal accepts multiple emails simultaneously**: email field is a tag input (`../components/tag-input.md`), supporting pasted lists, applying a single role to the entire batch, with button displaying counts ("Send 3 invitations"). A single-email input requires opening modals five times for five invites. Major team management platforms allow batch invites. Role selection inside the modal uses the same list with descriptions as table cells.
  - **Duplicate emails report specific reasons, highlighted in red on that specific tag**: already a member shows "Already a member"; invited but unaccepted shows "Invited 09/24, pending". Do not lump both into "Email already exists in workspace": pending invitees are not yet in the workspace, and the inviter's task is resending rather than giving up.

# Overlay Layouts

Modals, slide-over panels, dropdowns, command palettes, notification panels, toasts. When there is no wireframe, build exactly following the templates below, reporting one line at delivery. See question 4 in `../../SKILL.md`.

**Background, border, and shadow of the frame** (`M15`, `M21`, `M23`), one table for all overlay elements:

| Element | Frame |
| --- | --- |
| Dropdown, menu, popover, select, toast, command palette | `border border-border bg-surface-overlay shadow-popover` (command palette `shadow-modal`) |
| Modal, confirmation dialog, slide-over panel | `border border-border bg-surface shadow-modal` |

In light mode, `bg-surface-overlay` matches card backgrounds and borders are barely visible, preserving the familiar look. In dark mode, small overlays sit one step lighter than cards, a 1px border separates the frame from the page, and shadows are deeper. Modals retain `bg-surface` because sticky headers and nested body cards inherit from it.

---

## Confirmation dialog

```
┌──────────────────────────────────┐
│ (🗑)  Delete project?             │   <- icon aligned with title row
│       **Sales Website 2026**     │   <- target object name emphasized
│       along with 48 tasks will   │
│       be permanently deleted.    │
│                                  │
│            [Cancel] [Delete]     │
└──────────────────────────────────┘
```

```html
<div role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-desc" class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-modal">
  <!-- Two-column grid: first row is icon + heading (items-center automatically aligns icon center
       with heading text baseline, no negative margin needed). Body (consequence text, retype name field)
       spans full width below sm, flush with button edges; from sm onward sits in the text column, flush with heading. -->
  <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4">
    <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10">
      <i data-lucide="trash-2" class="size-5 text-rose-700"></i>
    </div>
    <h2 id="confirm-title" class="text-lg font-semibold">Delete project?</h2>
    <!-- mt-2 below sm: 8px from icon bottom. sm:mt-0.5: first row is 40px tall, 28px heading centered
         (6px remaining below), plus 2px yields 8px text-to-text per T30. -->
    <div class="col-span-2 mt-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:mt-0.5">
      <p id="confirm-desc" class="text-sm/6 text-muted">
        <span class="font-medium text-foreground">Sales Website 2026</span>
        along with 48 tasks inside will be permanently deleted and cannot be recovered.
      </p>
      <!-- Retype name input (if any): mt-4, inside this body block -->
    </div>
  </div>
  <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    <!-- Cancel: secondary button with --secondary background. Delete: muted rose background per I4. Both text-only. -->
  </div>
</div>
```

- Width `max-w-md`, centered on screen, semi-transparent black backdrop behind.
- Heading is a **question**, body states specific consequences naming the target object.
- **Object name `font-medium text-foreground`**, rest of sentence `text-muted`. This is what users need to scan to ensure they are deleting the right item. Making the whole sentence uniform grey buries the name. Long names wrap, **do not `truncate`**: if you cannot read the full name in a confirmation, you cannot confirm anything. If the target object is an email (deleting account, removing member), wrap after `@`, never breaking mid-domain (`EmailText` in `../components/description-list.md`).
- **Circular icon `size-10` sits in the same row as the heading**, on the left; grid `items-center` centers the icon with the heading line. Placing the icon on its own row above adds ~60px height without adding information.
- **Below `sm`, only heading stands next to icon; dialog body spans full width**, flush left with two vertically stacked buttons. Keeping the entire body indented 56px behind the icon leaves retype fields narrower than buttons, offset by 56px, and forces consequence copy onto an extra line (at 375px: 239px input at x=96, 295px button at x=40, five-line copy; switching to grid makes input, copy, and buttons share x=40 edge, copy takes four lines, dialog is 12px shorter). From `sm` buttons size to text on the right, body returns to text column. Probe reports this under "Input misaligned with full-width button".
- **Heading to body `mt-2`, body `text-sm/6`** (24px line height), not `mt-1` + default 20px line height. Confirmation body usually runs two to three lines with bold object name among grey text; 20px line height causes descenders and accents to touch upper lines, while 4px below heading glues heading to body. Popular React libraries use 8px, Material uses 16px; skill keeps 8px because confirmation copy is brief; 16px detaches heading from its opening sentence. See `T30`.
- **Heading `text-lg font-semibold`, always bolder than target object name** (`font-medium`). If heading lacks `font-semibold`, a two-line object name overpowers the question, drawing eyes to the name first.
- **Buttons in confirmation dialog are text-only, no icons.** This is a named exception to `I1`: trash icon already heads the dialog, attaching it to the button creates two signals for one concept (`M6`). Button copy repeats verb and object: "Delete project", not just "Delete" or "OK".
- Destructive button sits on far right and is the sole button carrying warning colour. Cancel is secondary button with `--secondary` background, and receives initial focus on open so Enter never deletes by accident.
- Mobile screens below `sm`: two buttons stacked vertically, full width, delete button on top (`flex-col-reverse`).
- Do not use modals for mere notifications. Use toasts for that.
- When reviewing, render dialog in pre-opened state; no clickable trigger lists or "deleted project counts" needed.

**Confirmation dialog for non-dangerous actions** (all three questions of `I4` answer "no": no data lost, no running process terminated, no permissions revoked). Actions needing confirmation due to touching many items at once: bulk resending invitations, emailing 240 customers, publishing changes for an entire team. "No data loss" alone is **not enough** to qualify for this template: cancelling subscription, signing out also lose no data but remain red (`I4`). Same template above, only colours change:
- circular icon `bg-background`, glyph `text-foreground` (not `rose`);
- confirm button `primary` (named exception to `I2`: sole progressing action in dialog), still repeats verb + object: "Resend 12 invitations";
- Cancel remains `--secondary` button and receives initial focus on open.

**Sign out does not belong to this group**: sign out in this skill is treated as a dangerous action (`I4`), "Sign out of other devices?" dialog is red like delete dialog (settled); do not use it as an example for neutral dialogs.
**Cancelling paid plan also does not belong here** (`I4`), "Cancel Pro plan?" dialog is red like delete even if access remains until period ends; do not use grey icon and black confirm button.

**Confirmation dialog with name retyping** (deleting workspace, organisation; when to build see `D3` in `../system.md`). Same template above, input added below consequence copy, inside body block (`mt-4`):
- Label is a full sentence with bold name centered: "Type **Acme Studio** to confirm", `text-sm`, name `font-semibold`, wraps without truncation (`N8`). No placeholder pre-filling the name: looks already completed.
- Opening dialog places cursor in input (replacing Cancel focus). Dialog is a `<form>`: Enter in input triggers delete button; button height matches input (`h-11 md:h-10`). Delete button `disabled` until typed text matches; typing mismatch does not trigger red error.
- Case-sensitive match, trimmed whitespace, normalized `NFC` on both sides.
- Clear text when dialog opens, not on close: reopening shows clean input.
- Deletion error: error box below input clarifies data status ("…workspace and data remain intact."), typed text preserved, delete button re-enabled for retry.
- Outside click does not dismiss (`I20`), Esc and Cancel still dismiss.

## Content modal

```
┌─────────────────────────────┐
│ Title                   [×] │  <- fixed header
├─────────────────────────────┤
│ scrollable content          │
│                             │
├─────────────────────────────┤
│            [Cancel] [SAVE]  │  <- fixed footer
└─────────────────────────────┘
```

Header and footer remain stationary; only body scrolls. If modal height exceeds 80% viewport height, switch to slide-over panel or dedicated page.

**Modal with form** (invite member, rename, quick add):

- **Header/footer dividers only appear when body actually scrolls.** A two-to-three field form that does not scroll drops both dividers, using whitespace (`gap-6`). Three divider lines for a short form feel heavier than the content itself.
- **Description below title `mt-2 text-sm/6 text-muted`** matching confirmation dialog (`T30`).
- **Description below title extends up to ✕ button column**: header reserves `pr-10` for close button, do not constrain description with narrow `max-w`. Add `text-pretty` to prevent orphan words on final line.
- Inputs present means **outside click does not dismiss** (`I20`); dismiss via ✕, Cancel, Esc. On open, focus lands on first input.
- Primary footer button is `primary` (sole progressing action of modal, `I2`), **text-only** per `I1`: "Send invitation", no icon. Cancel button `secondary`. Both `h-11 md:h-10`, matching input height.
- **Submitting state**: text-only button displays **centered spinner overlay, text `invisible`** (still taking space), button `aria-disabled` + `aria-busy`, not `disabled`. Inserting spinner next to text widens button, shifting Cancel left. See `../components/button.md`.
- Error text below input explains **how to fix**, following "What to write in empty fields" table in `form.md` (single source of truth): "Email must contain an @ symbol".
- **Member invitation modal: email input is a tag input** (`../components/tag-input.md`), invite multiple users at once, button displays count ("Send 3 invitations"); duplicate emails distinguish "Already a member" from "Invited …, pending acceptance". Details in "Members and permissions page" in `app.md`.

**Record inspection modal with previous / next buttons** (order details, invoice, receipt):

```
┌──────────────────────────────────────────┐
│ Order #10248 [⧉]             ‹  ›  │  ✕  │  <- white header, stationary
│ (● Processing)  Placed 14:32 · Sep 22, 2026 │
├──────────────────────────────────────────┤
│ ┌ Products ─────────────────────────────┐ │  <- body bg-background, white card
│ │ Long-sleeve linen shirt     $90.00    │ │
│ │ Beige · Size M         2 × $45.00     │ │
│ └───────────────────────────────────────┘ │
│ ┌ Payment ──────────────────────────────┐ │
│ │ Subtotal · 3 items         $250.00    │ │
│ │ Total                      $245.00    │ │
│ └───────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

- **Pinned to top, not vertically centered**: outer frame `items-start`, modal offset from top by fixed distance (`mt-16 sm:mt-[8vh]`). Every record varies in height (one item vs four items with three-line names); vertical centering makes the entire header jump up and down upon clicking Next Order, moving ‹ › out from under cursor, risking background clicks on consecutive clicks (`N1`). Top-pinning keeps header steady whether modal is 600px or 820px tall.
- **Height determined by content, always capped**: `max-h-[calc(100dvh-8vh-1rem)]`, stationary header, only body scrolls. The rule "exceeding 80% viewport switch to panel" applies during layout selection; if a single order has 20 items, body scrolls, do not switch layout midway.
- **Two-row header**: row one is title `text-lg font-semibold` "Order #10248", **only the code in `font-mono`** (`T17`), "Order" word remains standard font; `copy` button is icon button immediately after code. Right cluster `‹ › │ ✕`: ‹ › are ghost icon buttons with tooltips "Previous order", "Next order"; vertical divider `h-5 w-px bg-border` isolates ✕ since closing differs from navigation. Row two contains order status badge and full timestamp (separate timestamp, `T16b`).
- **At start or end of list, respective button is `disabled`**, faded but still occupying space, not hidden (`N1`: hiding causes › to shift into position of ‹). If focus is on button becoming `disabled`, **shift focus to the remaining button**, never dropping focus to `body`; keyboard users stay within navigation cluster.
- **Body `bg-background p-6`, each block a white card** (`card.md`), spaced by `gap-4`. White header against grey body provides sufficient separation without extra divider lines below header. Title-only cards do **not carry `min-h-10`** (see `card.md`).
- **Product row**: left displays name `font-medium` and variant `text-sm text-muted` ("Beige · Size M"); right displays line total `font-medium tabular-nums` and "2 × $45.00" `text-sm text-muted`. Long names wrap, do not `truncate` (`N8`); currency column `shrink-0 text-right` aligns to row top. If variant absent, omit secondary line entirely, do not print `—`. Dividers between rows follow `F25`.
- **Payment block is a receipt**: left labels, amounts **flush right** (`justify-between`), do not use 7rem label column from `description-list.md`: amounts must align right for visual arithmetic. "Subtotal · 24 items" counts **quantity**, not row count. Discounts include code `font-mono` and negative amount. Total has top divider line, `text-lg font-semibold`, heaviest number in block. Payment method and status (badge) follow another divider; badge rows use `items-baseline` to align label with badge text baseline. Amounts `whitespace-nowrap shrink-0`, labels `min-w-0` wrap (`T16` in `rules-type.md`): at 375px "Subtotal · 1 item" takes almost half the row, rigid labels push currency symbol onto its own line.
- **Numbers across blocks must reconcile** (`S6`): subtotal equals sum of line items, total equals subtotal plus shipping minus discount, payment status matches order status (cancelled order with refund says "Refunded", COD order in transit says "Unpaid").
- Opening modal focuses frame or heading, **never first ‹ button** (avoids instant tooltip trigger on open, see trap in "Motion").
- If request makes no mention of order actions (confirm, cancel, print), do not build footer; note a single line at delivery. If present, footer follows slide-over panel footer pattern: button styles follow role, not quantity.

## Slide-over panel

Slides in from right, `w-full sm:w-[28rem]` (below `sm` covers full width, 448px exceeds 375px mobile screen), used when content is long or users need to maintain visibility of background list. Do not use panels for single-sentence confirmations.

- **Backdrop behind panel is subtle: `bg-black/15`.** Panels exist so users **can still see the background list**; opaque backdrop hides the list, destroying the reason for using a panel (cloudy grey backdrop turns page background into dead grey block). Modals use `bg-black/30`, because modals require complete detachment from page.
- **Three tiers: header, scrollable body, footer.** Header `px-6 pt-5 pb-4 border-b border-border` contains title, status + timestamp row, ⋯ and ✕ buttons sharing title row. Body `flex-1 overflow-y-auto px-6 py-6`: **always carries dedicated `pt`**, preventing first section heading from sticking to header divider. Footer `border-t border-border px-6 py-4`, buttons right-aligned, pinned to bottom even when body is short.
- Labels and values in panel follow `components/description-list.md`, label column `7rem`.
- **Footer buttons preserve style by role, not quantity.** Cancelled order losing primary button leaves only "Print invoice": it **remains `secondary`** just as when paired with primary. Do not promote to `primary` (cancelled order has no primary action, solid black falsely signals urgency) and do not change to `outline` (same button changing styles per order, `N5`). Footer buttons are text-only (`I1`).
- Motion follows "Motion" section at end of file: panel slides in from right edge.

**Record inspection panel with tabs** (customers, projects, tickets: name, status, quick actions, tab bar):

- **Stationary section is only name row**: avatar, name, ⋯ and ✕ buttons. Status, secondary line (company), quick action buttons sit at top of scrollable body and **scroll away**; tab bar `sticky top-0 z-10 bg-surface` inside scrollable body, divider line below tabs spans full width: scrollable body has no horizontal padding, each inner block applies its own `px-6`, tab bar applies `px-6` internally without negative margin `-mx-6` (`N11`). Keeping entire block fixed with two-line name and long company name takes ~240px height: 800px laptop loses nearly one-third, phone loses nearly half, leaving tiny reading area for Messages tab. Scrolling down preserves name + ✕ + tabs, sufficient to identify subject and active tab.
- **Name is heaviest text in panel** (`text-lg font-semibold`). Metrics, section headings, nothing inside body exceeds name size. Metric tiles in panel follow "Inside slide-over panels or narrow columns" in `../components/charts.md`: single 2x2 container, `text-lg` numbers, not four standalone cards with `text-3xl` numbers (four cards make numbers dominant, demoting customer name).
- **Switching tabs keeps tab bar stationary under cursor** (`N1`): if sticky at top, scroll immediately below tab bar, not to 0; if un-stuck, preserve scroll position. Resetting to 0 while stuck pushes tab bar below status block, slipping out from under cursor. To support this, tab content applies `min-h` matching scroll container minus tab bar, so brief tabs (empty messages) do not pull tab bar down. Background page remains stationary. Left/right arrows switch tabs (`../components/small-controls.md`).
- Lists inside tabs (messages, files, activity) format time per `T16b`: drop current year.

## Dropdown

Anchors to left edge of trigger button, width at least matching button. Destructive actions separated to bottom by divider line — hover follows `I4`, divider line spans full width per `F25`. At most 8 items; beyond that add search input.

**Every item is a full-width clickable element** (`I29`): `flex w-full` placed directly on `<button>` or `<a>`, not on outer wrapper. Using shadcn requires link items to use `<DropdownMenuItem asChild>`.

**Flip near edges, do not overflow.** Menu opening from bottom table row that still drops down overlaps pagination and bleeds off card. If insufficient space below, flip above button; if near right edge, align right. When using existing project popover libraries, enable `collisionPadding`; when custom building, measure `getBoundingClientRect` before opening.

**Overlay elements have no scrollbars, except long lists.** Menus, calendars, filter popovers hug their content; do not hardcode `width` / `height` smaller than inner content. Falling short by 1–2px spawns scrollbars in both directions; machines with "always show scrollbars" display two thick grey bars covering content. Browser native `[popover]` defaults to `overflow: auto`, so any undersized fixed container scrolls. Only listboxes and menus exceeding `max-h` scroll vertically, and no overlay scrolls horizontally. If maintaining fixed dimensions (multilevel calendars, `choice-controls.md`), sample size from largest state, never guess numbers (calendar container 272px tall while date grid requires 288px, width short by 2px, produces two scrollbars).

**Custom built: establish full width before measuring height, and remeasure when menu resizes.** Menu opening upward (`top = trigger top − menu height`) with width derived from button read from state starts with `width: 0` on initial open. Zero-width menu wraps text word by word, ballooning hundreds of pixels tall, clamping negative `top` to screen ceiling. Subsequent renders fix width but leave `top` uncalculated: account menu at sidebar foot floats to sidebar top, covering navigation, separated from trigger by full screen. Only occurs on **first open after page load, or after collapsing/expanding sidebar** (stale width in state), appearing as an intermittent bug. Fix: apply width directly to DOM from `triggerRect.width` **prior to** reading `offsetHeight`, or remeasure via `ResizeObserver` on menu. Test: reload page, click trigger immediately on first try; collapse then expand sidebar, click trigger again. Menu must sit tight against trigger both times. Radix and Floating UI handle this automatically; bug only affects custom implementations.

**Radii and spacing per `M19`:**

```html
<!-- Container only has vertical padding, each group px-1: divider between groups touches edges naturally (F25, N11) -->
<div class="min-w-56 rounded-2xl border border-border bg-surface-overlay py-1 shadow-popover">
  <div class="flex flex-col gap-1 px-1">
    <button class="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm outline-hidden hover:bg-item-hover focus-visible:bg-item-hover">…</button>
  </div>
  <!-- Divider uses same token as container border, not border-strong: darker than border makes divider dominate container.
       Container also uses border-border: shadow-popover already separates container from page. Container and divider both using border-strong
       makes menu look like a grid table -->
  <hr class="my-1 border-border" />
  <div class="flex flex-col gap-1 px-1">
    <!-- Destructive item: looks like standard item by default, turns red only on hover (I4) -->
    <button class="group flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm text-foreground outline-hidden hover:bg-rose-500/10 hover:text-rose-700 focus-visible:bg-rose-500/10 focus-visible:text-rose-700 dark:hover:text-rose-400 dark:focus-visible:text-rose-400">
      <i data-lucide="trash-2" class="size-4 shrink-0 text-muted group-hover:text-rose-700 group-focus-visible:text-rose-700 dark:group-hover:text-rose-400 dark:group-focus-visible:text-rose-400"></i>
      Delete
    </button>
  </div>
</div>
```

Delete item: text **`rose-700`**, not `rose-500` (3.2:1 against `rose-500/10` fails 4.5:1). Unhovered state uses `--foreground` text and `text-muted` icon like standard items; pre-tinting red violates `I4`.

| Element | Value | Rationale |
| --- | --- | --- |
| Frame | `rounded-2xl` 16px | |
| Padding around items | 4px: `p-1` on frame; menus with dividers use `py-1` on frame + `px-1` per item group | Gap between hover background and frame edge; dividers reach edge without negative margin `-mx-1` (`F25`) |
| Item | `min-h-10` 40px, not `h-10` | Matches height of sidebar links, buttons, inputs. 36px items feel cramped. **Long text wraps, item height grows with text** (`py-2.5`, icon and checkmark align to first line): fixed `h-10` causes three-line names to spill out, overlapping lower items (probe reports "Item in overlay fixed height with overflowing text") |
| Gap between items | **`gap-1` 4px** (list `flex flex-col gap-1`), not `gap-0.5` 2px, not flush | Two-line items touching flush blur into one block with invisible boundaries; 2px remains too tight. Probe reports "Adjacent items spaced under 4px" |
| Item hover background | `rounded-xl` 12px | **16 = 12 + 4**, concentric corners. 40px item takes 12px radius (`F1`) |

With shadcn / Radix, replace both `hover:` and `focus-visible:` with `data-[highlighted]:bg-item-hover`, so mouse and arrow keys share **one** highlighted item (`I13`).

Hover background is **inset** from container edge, not flush. That inset combined with concentric corners gives menus their soft feel. **Item radius and container padding form a pair**: `rounded-xl` items pair with `p-1` container; keeping legacy `p-2` while bumping items to `rounded-xl` breaks the formula: corner gap expands while edges stay 8px, looking bloated.

Compact menus with items under 40px (`py-1.5`, `text-xs`) revert to standard pair: `rounded-lg` items, `p-2` container.

**4px gap is for narrow containers, do not bump to 8px.** Dropdowns, selects, and list-style popovers measuring 224–320px wide: `p-1` gap is standard across libraries (Radix, shadcn; macOS menu 5px). Bumping to `p-2` wastes 4px horizontal space per side, making highlighted background float uncomfortably inside container. **Containers from ~480px wide (command palettes) use `p-2` gap**: at that width, 4px gap stretches highlight into a bar running edge-to-edge, corners nearly touching container corners. See "Command palette" below.

**Long dropdowns that must scroll** use `max-h-83` and flash scrollbar on open, matching select (`I18`): half-clipped last item is the sole visual affordance at rest.

### Submenu (multi-level dropdown)

Parent item: icon + label + `ChevronRight` `size-4 text-muted` on right edge. Submenu shares **identical frame** with parent (`rounded-2xl p-1`, border, `shadow-popover`, items `h-10 rounded-xl`).

**Screen has space for adjacent containers: fly out next to parent menu.**

- 4px gap from parent edge. **First item aligns with parent item** (offset container up by border + `p-1`). If space below is tight, push upward leaving 8px margin from screen bottom, do not flip.
- If right edge lacks space, fly left (avatar in top-right header). Open / back chevrons invert direction accordingly.
- Hovering parent item waits ~100ms before opening (glancing over does not trigger). Leaving waits ~250ms before closing, allowing diagonal mouse travel to submenu without dismissing midway. Radix provides both natively.
- While submenu is open, **parent item retains highlight background**, maintaining visual connection while pointer is in submenu.
- Keyboard: `→` opens and focuses first item, `←` / `Esc` closes and returns focus to parent item, `↑↓` navigates submenu.

**Narrow screens (containers cannot sit side-by-side): replace in place, do not expand inside parent menu.**
Clicking parent item **replaces entire menu content with submenu**, top row becoming back button `‹ Switch account` (`ChevronLeft` + parent label, `h-10`, identical item template), followed by divider line. Width preserved, height sizes to new content. Focus shifts to first item, `←` / `Esc` returns to parent menu and highlights parent item. YouTube and Facebook implement account menus exactly this way.

Do not expand list immediately below parent item (chevron rotating down like sidebar groups): at 375px an account menu reaches ~600px height, four accounts expand flush with standard items losing visual hierarchy, and active account appears **twice consecutively** (menu top, then first row of list).

**Rows in submenus never exceed standard items by more than one step.** Single-line items `h-10`; two-line items (name + subtitle) `h-12`, avatar `size-8`. Each field is **single-line**, no field wraps: wrapping email before `@` makes each account row three lines, ~68px tall, making submenu much heavier than parent. Long text truncates per "Email truncation" below, without wrapping.

### Account menu

Triggered from header avatar or profile row at sidebar foot (`app.md`).

- **Account has only one entry point.** If request asks for header avatar while sidebar foot already has profile row, move entirely to header, removing sidebar profile row, reporting one line at delivery. Two places opening the identical menu states one idea twice (`N3`); major apps consistently maintain only one.
- **Top of menu opened from avatar: name + email, no avatar.** Clicked avatar sits directly above; repeating 40px avatar at menu top makes it the heaviest element in menu. Name `text-sm font-medium truncate`, email `text-xs text-muted` single line, block `px-3 py-2`. Triggered from sidebar foot shows email only, since name already heads profile row.
- Order: menu header, divider, Profile / Help…, **Switch account** (only when 2+ accounts exist), divider, Sign out (`I4`).
- **Account rows in submenu**: avatar `size-8` (colour per `avatar.md`), name `text-sm font-medium truncate`, single-line email, and `size-4` slot reserved on right edge for `Check` icon on active account. Tick only, no solid background fill, no extra bolding. Row uses `role="menuitemradio"`. Clicking active account simply dismisses menu.
- Submenu width `w-72`. Parent menu from header avatar also `w-72` for visual balance between containers.

**Email truncation: truncate before `@`, preserve domain intact.** Multiple accounts belonging to one user usually share the prefix before `@`, differing only by domain; truncating at the end (`john.smith.alexander.williams@ac…`) destroys the exact distinguishing segment. Wrapping retains text but increases row height by 1.5x. Split into two `span` elements, shrink local part, wrap in shared component (e.g. `AccountEmail`):

```tsx
<span className="flex min-w-0 text-xs text-muted" title={email}>
  <span className="min-w-0 truncate">{localPart}</span>
  {/* shrink-0: domain does not shrink. max-w-full: exceptionally long domain truncates without overflow. */}
  <span className="max-w-full shrink-0 truncate">{domainPart}</span>
</span>
```

Produces `john.sm…@acme-studio.com` alongside `john.smith.al…@gmail.com`: single line per row, easily distinguished. Full email in `title`. Use this template wherever email appears in menus: menu header, account rows, sidebar footer menu.

### Filter popover

**Filter** button on list toolbar opens a container with several fields (assignee, date range, priority…) and confirmation button. Differs from dropdowns in that interior is **a compact form**, not a list of items.

```
┌──────────────────────────────────┐
│ Assignee                         │  <- label text-sm font-medium
│ [All assignees                ▾] │  <- select, h-10, full width
│ Due date                   Clear │  <- "Clear" appears only when range set
│ [Any due date                 ▦] │
│ Priority                         │
│ (Low) (Medium) (High) (…)        │  <- toggle chips, wrap allowed
├──────────────────────────────────┤  <- F25, spans full width
│ Clear filters            [Apply] │  <- "Clear filters" aligns with label left
└──────────────────────────────────┘
```

- **Frame** `w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface-overlay shadow-popover`, no `p-*`: body `p-4 flex flex-col gap-4`, footer `border-t border-border px-4 py-3 flex justify-between`. Anchors to right edge of Filter button (below `sm` button sits on own row, left-aligned, so anchor to left edge). Portals to `body` (`I22`).
- **Changes inside container only mutate draft state**; clicking Apply filters list. Esc or outside click discards draft. Reopening populates draft with active filters. When active, button indicates "Filter · 2" (active filter count).
- **"Clear filters" is text link, not padded `ghost` button**: `px-0`, `text-muted`, hover `text-foreground` + underline, no background. A `ghost` button with `px-4` inside a `px-4` footer indents "Clear filters" text by 16px from labels above, breaking vertical alignment. Matches copy and styling of "Clear" on field label rows. When nothing to clear (empty draft and unfiltered list), disable with `opacity-50`.
- **Selected chips inside the container DO NOT apply `bg-primary`.** The footer already features a solid `primary` Apply button; styling selected chips solid black introduces three to four competing dark blocks, leaving eyes confused about where the primary action is, and making selections heavier than the action button (lesson shared with the time picker in `../components/choice-controls.md`). Selected chip inside the container: `bg-foreground/10 text-foreground inset-ring-1 inset-ring-foreground` (Tailwind v4). **Do not use `ring-1 ring-inset`**: projects restoring focus rings (`I14`) share CSS variables with `ring-*`, Tab navigation to selected chips destroys selection borders (`W8`). `inset-ring` uses an independent shadow layer. Tailwind v3 lacks `inset-ring`: use `shadow-[inset_0_0_0_1px_var(--foreground)]`; unselected state retains `bg-foreground/5 text-foreground/70`, hover `bg-foreground/10`. The border provides the selection signal, background darkens by one step to make selected chips pop over hovered chips. Do not use white background + heavy border (selected chip lighter than unselected reads backwards), nor `1.5px` border (selecting four priorities creates four thick black rings, competing with Apply button; 1px cleanly separates selected from unselected). Primary page chip rows (lacking adjacent confirm button) retain `bg-primary` per `../components/small-controls.md`.
- **Chips inside popover may wrap** (`flex-wrap`): four fixed choices within form field; horizontal scrolling in popover hides final option. The "never wrap" rule applies exclusively to page-wide filter bars.
- **Selects inside popover follow focus rules of trigger button** (`focus-visible:`, not `focus:`): selecting assignee via mouse leaving black border + ring leaves field looking open.
- **Nested calendar uses compact template across all viewports**: single month, quick presets as chip row above grid (wrapping, no horizontal scroll, see Date range picker), width matching trigger field. Do not expand two-month calendar + preset column: at 1280px a ~590px wide calendar spawning from 384px popover crowds viewport edges, leaving 8px margin, creating three stacked layers. Two-month calendars belong on page-level layouts or wide forms.

## Keyboard shortcuts in menus

Items with shortcuts display them on **far right**, `text-xs text-muted`, never parenthesized mid-label.

```html
<button class="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm outline-hidden hover:bg-item-hover">
  <i data-lucide="user" class="h-4 w-4 shrink-0 text-muted"></i>
  <span class="min-w-0 flex-1 truncate text-left">Your profile</span>
  <span class="shrink-0 text-xs text-muted">⌘1</span>
</button>
```

Shortcut glyphs written directly as characters (`⌘`, `⇧`, `⌥`), not wrapped in bordered `<kbd>`. Borders around individual keys clutter menus: glyph `⌘` already signals "this is a shortcut", adding container is a second signal for same concept (`N3`).

Display shortcuts only for items **that actually have functional shortcuts**. Inventing them for visual balance leads to broken clicks and instant user distrust.

## Command palette

```
┌────────────────────────────────────────┐
│ 🔍 Search pages                        │  <- search input h-14 px-5, unbordered
├────────────────────────────────────────┤  <- divider spans full width (F25)
│ ▓▓ 🏠 Overview ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  <- first item pre-highlighted, 8px edge gap
│    📥 Inbox                            │
│                                        │
│    TASKS                               │  <- label close to its group
│    📁 Projects                         │
│    📄 Documents                        │
│    👥 Customers                        │
│    📝 Contracts                        │  <- last item half-visible, bottom edge clipped
└────────────────────────────────────────┘
```

```html
<!-- Pinned from top, not vertically centered -->
<div role="dialog" aria-label="Search pages" class="fixed inset-x-4 top-4 mx-auto w-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-surface-overlay shadow-modal sm:top-[15vh]">
  <div class="flex h-14 items-center gap-3 border-b border-border px-5">
    <i data-lucide="search" class="size-4 shrink-0 text-muted"></i>
    <input class="min-w-0 flex-1 bg-transparent text-base outline-hidden placeholder:text-muted md:text-sm" placeholder="Search pages" />
  </div>
  <!-- pr-1 + gutter stable: right gap = 4px + 4px bar = 8px, matching left gap, scrolling or not -->
  <div role="listbox" class="max-h-[min(22rem,60vh)] overflow-y-auto p-2 pr-1 [scrollbar-gutter:stable] [&::-webkit-scrollbar-track]:mt-2 [&::-webkit-scrollbar-track]:mb-4">
    <button role="option" class="flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm outline-hidden data-[selected=true]:bg-item-hover">
      <i data-lucide="house" class="size-4 shrink-0 text-muted"></i>
      <span class="min-w-0 flex-1 truncate text-left">Overview</span>
    </button>
    <!-- Group label: top loose, bottom tight. First group with label uses pt-2. -->
    <div class="px-3 pt-5 pb-1 text-xs font-medium uppercase tracking-wide text-muted">Tasks</div>
    …
  </div>
</div>
```

- **Pinned from top (`sm:top-[15vh]`), not vertically centered.** Typing filters the list, contracting height; vertically centered containers cause input to bounce up and down with every keystroke right under cursor (`N1`). Top-pinning keeps input steady while only bottom contracts. Popular command palettes universally top-pin.
- **`p-2` gap, `rounded-lg` items**: container 16 = 8 + 8 (`M19`). Palette measures 576px wide; dropdown `p-1` gap at this width stretches highlight into an edge-to-edge bar (see "Dropdown" above). Items `h-10`, icon `size-4 text-muted`, text `text-sm`.
- **Search icon aligns with item icons**: search input `px-5` = `p-2` container gap + `px-3` item padding. Adjusting one requires adjusting both.
- **Group label sits close to its group**: `pt-5 pb-1`. **Measure text-to-text, not row-to-row**: `h-10` items inherently include 10px breathing room above and below text, so `pt-4 pb-1.5` leaves only 26px above and 16px below visually, leaving label floating midway between groups. `pt-5 pb-1` provides 30px above, 14px below—roughly 2:1 ratio—visually binding label to group below. Typography matches sidebar group labels (`app.md`): UPPERCASE via CSS, grey. No horizontal dividers between groups.
- **Height determined per `I18`**: measured in empty query state, nudging `max-h` in 4px steps until final item is roughly half visible. Opening palette flashes scrollbar once (`flashScrollbar`).
- **Equal margins on both sides whether scrolling or not**: 4px scrollbar takes space on right; `p-2` list container yields 12px right gap vs 8px left gap, a 4px misalignment when list is long. Fix via `pr-1` + `[scrollbar-gutter:stable]`: always reserves 4px slot for bar, so single-result queries match scrollable layout margin.
- **Scrollbar track inset `mt-2 mb-4`** (`[&::-webkit-scrollbar-track]:mt-2 [&::-webkit-scrollbar-track]:mb-4`). Top edge sits below search input divider, offset 8px to prevent touching line. Bottom edge meets 16px corner radius, **receding by corner radius**: rounded tip of 4px bar hugging edge only nests cleanly inside corner when offset >= 14px from bottom (16 − 2). Legacy `my-2` clipped lower right tip by ~2px, visible at 4x zoom.
- **Single highlight state**: on open, first item is highlighted, Enter executes it; mouse and arrow keys update the identical highlight (`I13`). cmdk uses `data-[selected=true]:`, Radix uses `data-[highlighted]:`. Arrow keys navigating to obscured items scroll them into view (`block: "nearest"`).
- **Diacritic-insensitive search** ("doc" matches "Document"). **Matches item label and item keywords only** (synonyms, aliases), never group label: typing "acc" revealing entire ACCOUNTS group causes "Settings" and "Your profile" to appear without clear reason. Prefix matches sort first. If group has no matching items, hide label entirely.
- **Long names `truncate` with `title`** (`T14`).
- **Empty state**: single line `py-10 text-center text-sm text-muted`, "No matching pages. Try a shorter query." **Do not echo search term**: it already sits in search field above (`N3`), and long queries get clipped mid-word.
- **Esc dismisses, outside click also dismisses.** Named exception to `I20`: sole input is search query, accidental dismissal loses nothing.
- Motion matches modal ("Motion" table). Do not render keyboard hint footer (↑↓ ↵ Esc) unless requested.

## Notification panel

Opens in-place from header bell button (`I24`), closes on outside click or Esc (`I21`).

```
            [🔔•]                      <- bell button: active state has hover background
┌─────────────────────────────────┐    <- top edge 8px below header divider
│ Notifications   Mark all read   │    <- sole action, ghost h-8
│ [All]  Unread  Mentions         │
├─────────────────────────────────┤
│ (L) **Lan Anh** mentioned you • │    <- unread: bold colored text, right dot
│     in **Sales Website…**       │    <- title max 2 lines
│     Please take a look…         │
│     3 hours ago                 │
│ (H) John Doe assigned you…      │    <- read: title foreground/70
└─────────────────────────────────┘
```

- **Frame**: popover `w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface-overlay shadow-popover`, anchored to right edge of bell button, portals to `body` (`I22`).
- **Top edge does not sit flush against header divider.** Anchoring popovers to buttons with default gap places top edge a few pixels from header divider, divider piercing panel corner like two misaligned pieces. Adjust offset (`sideOffset`) so top edge sits **8px below header divider**. Universal rule for all overlays opening from header.
- **Header: title on left, "Mark all as read" on right**, button `ghost h-8`, text-only (`I1`). Button text aligns flush right with unread dots below: header trims right padding matching button `px`, avoiding negative margin `-mr-3` (`button.md`, `N11`). Production notification panels include this action; without it, clearing four dots requires opening four notifications. When unread count reaches zero, hide button. Marking all or active tab is project logic, handler left empty (`I25`). Do not add gear icons or ⋯ buttons unless requested.
- **Tab `boxed`** matching status tabs on tables (`components/small-controls.md`): plain text, no badge counts (bell dot already signals unread items).
- **List height = height of All tab**, capped at `max-h-[min(28rem,calc(100dvh-13rem))]`, scrolls inside frame per `I18` (track bottom offset `mb-4`). All tab contains everything and is always tallest; panel opens to that tab, measures list height once, and sets it as `min-height` for remaining tabs: switching to empty or short tabs keeps bottom edge steady (`N1`). If zero notifications exist, panel shrinks to empty state (`py-10`). Height measured on All tab is **height adjusted for half-clipped last item** (`getPeekListHeight`, `I18`): notifications vary in height, preventing hardcoded values.
  Two failed alternatives discarded: `min-h-72` still collapsed 448 -> 288px on empty tab; **fixed height** stopped collapse, but with zero notifications produced 563px blank box with single grey line, looking half-loaded.
- **Every notification is a full-width link** (`I29`): `flex gap-3 rounded-lg px-3 py-3 hover:bg-item-hover`, list container `p-2` (`M19`: 16 = 8 + 8). Multi-line items require 8px gap like command palette, not 4px like menus. Clicking navigates to target and marks read, handler empty.
- **Title line**: user name and target entity `font-medium`, verbs standard weight ("**Lan Anh** mentioned you in **Sales Website 2026**"). **Maximum 2 lines** (`line-clamp-2` + `title`): long entity names creating three-line titles plus two snippet lines make one notification three times taller than others, destroying glancing utility. Snippet `text-sm text-muted line-clamp-2`, timestamp `text-xs text-muted`.
- **Unread and read states clearly distinguished at a glance** (`N2`): unread features `size-2 rounded-full bg-foreground` dot on right (**not `bg-primary`**, see below), centered to first line; read state drops dot **and dims title to `text-foreground/70`**. Relying solely on dots leaves items looking identical until eyes reach far right edge. Do not fill entire unread item background: ten unread notifications become ten grey stripes.
- **Unread dots, user names, target entities do not take brand colour.** Green brand projects keep dots `--foreground` (black, dark mode white), names `--foreground font-medium`. Accent colour is reserved for page primary action (`M3`): ten unread notifications would sprinkle ten green dots down the panel, mirroring the discarded sidebar badge pattern (`I15`). Tinting names makes them read as links, whereas the entire row is clickable. Dots are not red either: red is reserved for errors (`M30`).
- **Avatar `size-8`** per `components/avatar.md`, aligned to first title line, not centered vertically.
- **Empty state**: single line `text-sm text-muted` per `components/empty-state.md`. Empty Unread tab: "You're all caught up". Zero notifications: "No notifications yet".
- **Bell button**: Lucide `BellDot` icon when unread items exist, **solid dot filled via `[&_circle]:fill-current`**, `Bell` when empty. Standard `BellDot` renders hollow ring: at `size-5` it reads as tiny 6px circle. Bell icon includes carved gap around dot, do not overlay custom `absolute` dot. Accessible label includes count: "Notifications, 4 unread". **While panel is open, button retains hover background** (`aria-expanded:bg-foreground/5`), indicating origin.
- Motion matches dropdown ("Motion" table).

## Toast

Top right or bottom center; pick one location and maintain consistency.

**Screen reader live region is the toast container element, present from initial page load**
(`<section aria-live="polite">`, like Sonner), not individual toasts. Placing `role="status"`
directly on newly injected toast elements causes many screen readers to ignore them. When projects include Sonner
or shadcn toast, use that implementation; it handles this natively.

**Narrow screens below `sm` place toasts at top center.** Bottom of screen is reserved for form
action buttons; popping toasts at bottom right as user taps button obscures action for 4 seconds.

```
[✓] Link copied                                          <- success: single line, sizes to text

[✓] Deleted order #2041                 [Undo]           <- with action

[!] Could not save changes              [Retry]  [✕]     <- error: two tiers
    Network connection lost
```

```html
<div role="status" class="flex w-auto min-w-72 max-w-md items-center gap-3 rounded-2xl border border-border bg-surface-overlay py-3 pl-4 pr-3 shadow-popover">
  <i data-lucide="circle-check" class="size-5 shrink-0 text-emerald-600"></i>
  <p class="min-w-0 flex-1 text-sm">Deleted order #2041</p>
  <div class="flex shrink-0 items-center gap-1">
    <!-- Action: real button, not plain bold text -->
    <button type="button" class="h-8 cursor-pointer rounded-lg px-3 text-sm font-medium hover:bg-item-hover outline-hidden">Undo</button>
  </div>
</div>
```

- **Width sizes to content**: `w-auto min-w-72 max-w-md`. Never hardcode fixed width; brief toasts leave right half empty.
- **Fixed order `[icon] [text] [action] [✕]`**, action and ✕ cluster strictly flush right. No toast indents button to center.
- **Action is `h-8` button**, ghost style, hover background, no focus ring (`I13`). Plain bold text fails to signal clickability (spirit of `I7`). Maximum one action.
- **Text exceeding one line splits into two tiers**, preventing sentences breaking into three lines: top tier `text-sm font-medium` states outcome, lower tier `text-sm text-muted` states cause. Button cluster vertically centers to overall container.
- **Copy does not duplicate button text** (`M6`): if Retry button exists, copy does not say "then try again".
- Sentence casing: do not capitalize nouns mid-sentence ("order #2041", not "Order #2041"), no period on single-line toasts. Consistent across suite.
- Toast title and description use `text-pretty` (`T10`): on narrow screens toasts span nearly full width; long sentences overflowing by a word drop single orphan ("…complete, we will" / "notify you"). Split long text: concise title states action, remaining detail moves to description line. **User-generated names** (task name, file name, customer name) truncate via JS character count, preserving ~30 characters + `…` in quotes, matching search terms in `../components/empty-state.md`: forty-word task names inserted verbatim break toast into three lines.
- Icon `size-5` coloured by semantics (`rules-color.md`): success `emerald-600`, error `red-600`. Toast background remains `--surface`, no saturated background washes.
- Success toast: **no close button** (auto-dismisses). Toasts with Undo also omit close button.
- Error toast: **includes Retry and close button** (does not auto-dismiss), `role="alert"` replacing `role="status"`.
- Multiple simultaneous toasts stack vertically, `gap-2`, newest closest to screen edge. Maximum 3.
- Duration guidance (user-configurable): auto-dismiss ~4 seconds; toasts with Undo persist longer and pause countdown on hover. Undo and Retry call empty handlers (`onUndo`, `onRetry`).
- **Toasts feature entrance and exit transitions** per "Motion" table below: slide up from bottom (mobile: slide down from top); slide back on expiry. Slide distance matches full toast height, not 8px: 8px over 200ms is imperceptible, making toast feel like an abrupt pop.
  - **Trap: `{toast && <Toast />}` lacks exit transitions.** On expiry element leaves DOM immediately, leaving nothing to animate. Keep toast in DOM through closing phase: toggle flag -> run exit animation -> unmount in `onTransitionEnd`/`onAnimationEnd`. If project has Sonner, use it.
  - **Replacing toast with new one** updates `key` so new toast runs entrance animation, instead of swapping text in place within same container.
  - `motion-reduce`: `opacity` only, no slide.
- **Toasts containing emails place email on lower tier**, top tier stating completed action ("Invitation resent"), lower tier containing email wrapped in `EmailText` (`../components/description-list.md`) wrapping after `@`. **Do not apply `wrap-anywhere` to entire toast text block**: it breaks anywhere, producing broken domain segments. Single-line copy needs no wrapping; wrap long unbroken strings (emails, links) individually.
- Review toasts by rendering **static instances of each variant** side-by-side; do not build interactive trigger buttons simulating errors (scope in `../../SKILL.md`).

---

## Motion

Every overlay element **features entrance and exit transitions**, never popping abruptly into view. Transitions must communicate **origin**: dropdown expands from button, panel slides from edge, toast emerges from viewport boundary. Single source of truth for app: modal, dropdown, select, date picker, panel, toast all draw numbers from this table.

| Element | Entrance | Exit |
| --- | --- | --- |
| **Modal, confirmation dialog** | `opacity 0→1` + `scale-95→100`, center origin, **150ms `ease-out`** | reverse, **100ms `ease-in`** |
| **Backdrop** (behind modal, panel) | `opacity 0→1`, **matches duration and curve of paired element** (150ms behind modal, 500ms behind panel) | matches exit duration of paired element |
| **Slide-over panel** | **strictly** `translate-x-full → 0`, no `scale`, no `opacity` on panel. **500ms** `cubic-bezier(0.32,0.72,0,1)` (iOS sheet curve, `vaul`) | `0 → translate-x-full`, **350ms** same curve |
| **Dropdown, popover, select, date picker** | `opacity` + `scale-95→100` + **4px translate from button direction**: opening downward translates top-to-bottom (`-translate-y-1 → 0`), opening upward translates bottom-to-top (`translate-y-1 → 0`). Transform origin at edge facing button. 150ms `ease-out` | `opacity` + `scale-95`, 100ms `ease-in`, no translate |
| **Toast** | slides from nearest viewport edge, **distance equal to full toast height**: bottom toast `translate-y-full → 0` (upward), top toast (narrow screens) `-translate-y-full → 0`; with `opacity 0→1`. **300ms `ease-out`** | slides back into edge + `opacity → 0`, **200ms `ease-in`** |
| **Tooltip** | `opacity` only, 300–500ms delay before displaying, 100ms | 100ms |
| **Sidebar collapse, accordion groups** | per `app.md`: `transition-[width]` and `grid-rows`, 200ms | same as entrance |

- **Tooltips carrying user-generated content** (file names, project names, emails) avoid `whitespace-nowrap`: `max-w-[min(20rem,calc(100vw-1rem))] whitespace-normal wrap-anywhere`. Brief button tooltips ("Previous order") stay single line. Details and examples in `../components/tree.md`.
- **Include `scale`, `translate` explicitly in transition list.** Tailwind v4: `transition-[opacity,transform]` fails to animate `scale-95` or `translate-y-1`, causing size jumps before fade (`W10`). Use `transition-[opacity,scale,translate]`. Do not combine `transition-transform` with `transition-opacity`: both write `transition-property`, latter overwrites former, running only one.
- **Dialog frame must not nest inside fading backdrop.** Backdrop (`bg-black/30`) and frame are siblings inside stationary `fixed` wrapper, each fading independently with matched duration. Nesting frame inside backdrop multiplies opacities: frame fades faster than backdrop during exit, appearing jerky. **Unlock page scroll after transition ends**, not upon click: premature scrollbar restoration shifts background page horizontally under backdrop.
- **Exits faster than entrances.** Entrance uses `ease-out` (decelerating, settling smoothly like physical object), exit uses `ease-in` with shorter duration: users closing an overlay want immediate dismissal.
- **Pitfalls in panel construction** — panels "sliding from off-center, landing offset from edge then snapping", tooltips flashing, jittery transitions:
  - **Panel inheriting `zoom-in-95` copied from modal.** 95% scale around center starts right panel edge ~11px away from screen border, snapping on finish. Panels use `translate` only, **never `scale`**: they arrive from the edge, they do not grow from center.
  - **Radix (Dialog, Sheet) awaits `@keyframes`, not `transition`.** Radix presence reads `animation-name` to determine unmount timing; writing CSS transitions causes element to mount already at final state (no entrance) and unmount instantly on close (abrupt disappearance). With Radix use `data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right` (`tw-animate-css`, default 100% translate). Without Radix, use `transition-transform` while retaining element in DOM throughout exit.
  - **Dual conflicting mechanisms**: applying `transition-all` alongside keyframes from `animate-in` causes two animation engines to compete, producing stutter. Choose one.
  - **Focus jumping to icon button with tooltip** on initial open: Radix auto-focuses first focusable element (⋯ button), Radix tooltip opens immediately on focus without delay, jittering across screen with panel. On open, **focus panel container or heading** (`tabIndex={-1}`, `onOpenAutoFocus={(e) => { e.preventDefault(); panelRef.current?.focus() }}`); if input present, focus first input. Never focus icon buttons.
  - **`backdrop-blur` on backdrop** forces browser to blur entire screen every frame, dropping animation frames. Backdrop is purely transparent black.
  - **Animating `right`, `left`, `width` instead of `transform`** triggers layout recalculation every frame. Use `translate` exclusively; add `will-change-transform` if frames still drop.
- **No bounce, no overshoot.** No `spring` overshooting target, no `scale` below 95%, dropdowns translate no more than 8px. Workplace application elements settle into place, they do not bounce.
- **Transform and opacity only.** Do not animate `height`, `top`, `left`, `width` (except sidebar collapse, justified in `app.md`): causes jitter and per-frame layout recalculation.
- **Accurate transform origins**: dropdown opening from right button sets `origin-top-right`. Radix automatically provides `origin-(--radix-dropdown-menu-content-transform-origin)` (popovers and selects offer equivalent variables), adapting when menus flip.
- **Syntax**: with Radix/shadcn, use `data-[state=open]:animate-in data-[state=closed]:animate-out fade-in-0 zoom-in-95 slide-in-from-top-1` via `tw-animate-css` (Tailwind v4; v3 uses `tailwindcss-animate`). Custom builds use `transition` + `data-state` attribute, entry using `@starting-style`, exit keeping element in DOM until transition ends (`transition-behavior: allow-discrete` or listening to `transitionend`).
- **`motion-reduce:`** disables `scale` and `translate`, preserving `opacity` (or disabling entirely): users sensitive to motion experience vertigo from movement, not fades.
- No transitions on **initial page load**: do not fade in the entire page or individual cards.
- **Panel 500/350ms duration is settled**: 300/200ms flashes by abrasively, `linear` 500ms feels stiff and sluggish. This curve accelerates early and lands gently, so 500ms feels responsive. Do not shorten for "speed".
- **Verify motion via video, not static measurements**: capture at normal speed and 4x slow motion (DevTools, Animations, 25%). Jitter, overshoot, and margin snapping are only revealed in slow motion.

### Requests asking for animation without specifying libraries

Choose in order, stopping at first tier that fulfills the requirement:

1. **Project already includes motion library** (`gsap`, `motion`, `framer-motion`, `react-spring`…, check `package.json`): use it, do not install a second (`S9`).
2. **CSS / Tailwind can achieve it without dependencies**: overlay transitions, hover, tab switches, viewport triggers (`IntersectionObserver` + `transition`), durations from table above.
3. **Dedicated library required** (multi-step sequential timelines, scroll-driven choreography, ticker text, animated counters, particle/canvas backgrounds): **favor lightweight modular packages** and propose at delivery without asking beforehand:
   - **GSAP**: timelines and scroll-driven animation. Framework agnostic; import only required plugins (`ScrollTrigger`), avoiding full bundle imports.
   - **React Bits**: prebuilt UI effects (text, backgrounds, cursors) for React projects. Copy only the specific needed component into project, do not install whole suite; inspect dependencies first: components pulling in 3D engines (`three`, `ogl`) weigh more than the rest of the application—pick an alternative or implement via CSS.

   At delivery report one line (`S15`): what was used, why necessary, and the fallback alternative. Example: *"Staggered heading animation uses GSAP (core only). To remove the library, switch to CSS fade-in, losing the per-word stagger effect."*

Every library must adhere to the rules above: `transform` and `opacity` only, support for `prefers-reduced-motion`, no bouncing in workplace applications.

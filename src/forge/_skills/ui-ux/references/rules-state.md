# State and interaction — rules I

The single source for buttons, hover, focus, lists and modals. Numbers live in `budgets.md`.

---

## Buttons

> **⚠️ Rule reversed.** An old version of this skill said "three variants `primary` / `ghost` /
> `danger`, no outline" and "the default button has no icon". **Both are gone.** The maintainers
> settled the opposite. Do not revive the old rules.

**I1. The default button is an outline button, not an accent-colour fill. A left icon only when it names the action exactly.**

Building a new button → outline button. Put a lucide icon **to the left** of the text when there is a glyph that names
the action exactly: add (`plus`), filter, download, export, copy, share. Form buttons and buttons
in a modal (Save, Cancel, Send, Create task) are **text only**: the title already says what happens, an icon
would just repeat it.

*Why:* in the maintainers' words — *"the brand should not be splashed in too many colours across the
project"*. Accent-filled buttons scattered everywhere spread the brand colour thin, so when one button
**really** needs to stand out, it can no longer stand out. Same spirit as `M2`.

| Button type | Use |
| --- | --- |
| Default | outline + text; add a left icon when the glyph names the action exactly (add, filter, download, export) |
| Form submit button, buttons in a modal or panel footer | text only: verb + object ("Create task", "Confirm order", "Print invoice"). The whole footer uses one style: one button with an icon and one without is a mismatch |
| State-change button on a row or cell (check in, approve, assign) | a verb for what it will do ("Check in", "Start exam", "Complete"), **not** the target state name ("Arrived", "Done"): next to a "Confirmed" badge, an "Arrived" button reads as a second badge, and the viewer cannot tell whether the guest has arrived or not |
| The **only** primary action of an area, that truly needs to stand out | accent-colour fill |
| Secondary button that needs to be clearer than ghost: full-card-width button, button next to `primary` | `--secondary` fill, no border |
| Icon only | icon-sized button, with `aria-label`, as tall as the text button next to it |
| Button in a confirm dialog | text only, no icon: the icon already sits at the top of the dialog (`layouts/overlay.md`) |
| Delete and other dangerous actions (standalone button, `I4`) | `rose-500/10` fill + `rose-700` text always visible, on hover the fill deepens to `/15` |

**I2. Choosing an accent-colour fill needs a one-sentence reason.** Submit, pay, join —
those places are valid. But it must be a choice, not a default.

**I3. In a group of options only one button may be the primary.** Three equally solid buttons
means the decision has not been made for the user.

**I4. Dangerous actions are not solid red.**

**What counts as dangerous: ask three questions, do not look it up in a list.** Does the action
1. **lose data** (delete a project, workspace, account)?
2. **end something that is running** (a paid plan, a session, an invitation, an API key)?
3. **cut someone's rights or access** (leave a team, remove a member, sign out)?

One "yes" is enough to make it dangerous; style it with the three-form table below. **"Recoverable" does not
make it safe**: a cancelled plan still works until the period ends, you can sign back in after signing out,
you can ask to be re-invited after leaving a team, and all three stay red.

**Arguments already rejected, do not reuse them** (full list in `locked-rules.md`):
- "No data is lost so keep it neutral": the maintainers tried a neutral sign-out
  ("sign-out lost its danger") and settled it back, including for bulk sign-out.
- "It still works until the period ends so it is not red": already happened — cancel plan came out as a grey outline button, the confirm
  dialog with a grey icon, a black button.
- "Many apps keep it neutral": majority convention does not overturn a rule the maintainers settled.

| Action | Dangerous? | Which question says "yes" |
| --- | --- | --- |
| Delete project, workspace, account, expired API key | Yes | 1 |
| Cancel paid plan | Yes | 2 |
| Revoke API key, revoke invitation | Yes | 2 |
| Sign out, sign out other devices, bulk sign-out | Yes | 3 (Settled) |
| Leave team, remove member | Yes | 3 |
| Remove avatar (with Undo in the toast) | No, neutral outline button | None: the old picture returns as soon as Undo is clicked (`app.md`, "Profile page") |
| Bulk resend invitations, email 240 customers | No | None. Still confirm because it touches many things at once, using a neutral dialog (`overlay.md`) |

For an action not yet in the table, answer the three questions, add a row to the table, and put the code
`I4` right next to the sentence about the button colour in the spec (`scripts/lint-skill.mjs` catches sentences missing the code).

Sign-out in a menu turns red only on hover; the "Sign out N other devices" button is a standalone button
so it is red at rest. There are three forms depending on where it sits:

| Where | At rest | Hover / Tab focus |
| --- | --- | --- |
| **Standalone button** — button row, confirm dialog, danger zone | `rose-500/10` fill, `rose-700` text + icon | `rose-500/15` fill |
| **Menu item** — dropdown, sidebar | neutral like the other items | red text + icon, `rose-500/10` fill |
| **Button repeated on every row** — "Sign out" per device, "Remove" per member, shown directly | neutral outline button like the other row buttons | transparent border, `rose-500/10` fill, `rose-700` text |

For buttons the faint red fill is always visible (Settled), code in
`components/button.md`. Never `bg-rose-500 text-white`, no red border.

A button repeated on every row turns red on hover like a menu item, not red at rest: four rows with four red-filled
buttons make the whole frame red, and the bulk button at the bottom of the frame ("Sign out 4 other devices", a standalone
button, red at rest) can no longer stand out. Classes: `hover:border-transparent hover:bg-rose-500/10
hover:text-rose-700`, plus the same set for `focus-visible:`.

The part below is for **menu items**. On hover change **both**: the text (with the icon) to red, the background to a very faint red.

```html
<button class="group text-foreground hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400">
  <i data-lucide="trash-2" class="size-4 text-muted group-hover:text-rose-700 dark:group-hover:text-rose-400"></i>
  Delete project
</button>
```

"Neutral" means **looking exactly like the other items in the same place** — in a menu, the text is
`--foreground` like every item; in a button row, it is a secondary button. It does not mean
`text-muted`: a delete item fainter than the other items reads as locked
(`I8`).

- **Red fill ~10%**, no more (a standalone button gets `/15` on hover because it already sits at `/10`). Any stronger and it becomes a warning strip, no longer a hover state.
- **`rose-700` text, not `rose-500`** — menu items too, not only buttons. `rose-500` text on a `rose-500/10` fill is only 3.2:1, failing the 4.5:1 bar for 14px text; it looks bright pink and pretty, but it is hard to read. On dark backgrounds use `rose-400`.
- **Not using Tailwind**: same formula with tokens: on hover background `var(--danger-bg)`, text and icon `var(--danger)` (`tokens.css`, dark mode switches automatically).
- **Arrow keys must turn it red too.** With shadcn / Radix the item lights up via `data-[highlighted]`, not `hover:` — write only `hover:` and when moving by keyboard the delete item stays grey. Replace all three places: `data-[highlighted]:bg-rose-500/10 data-[highlighted]:text-rose-700` on the row, `group-data-[highlighted]:text-rose-700` on the icon (`I13`).
- **The icon changes colour with the text.** At rest the icon is `text-muted`, so there must be **`group` on the row** and `group-hover:text-rose-700` on the icon. Without `group`, `group-hover` silently does nothing — red text with a still-grey icon, and no error says so.
- Only the dangerous item turns red. Other items in the same menu still hover to grey as in `I10`.
- The dangerous item in a menu is **moved to the bottom**, separated by a divider.

**I5. Existing accent-colour buttons are not swept and changed in bulk.** Switch to outline +
icon only when asked to fix UI/UX in that exact area, and log it. A bulk
sweep is a PR nobody can review.

**I6. Do not spawn a variant × size matrix.** Need a different button size, pass
`className`. One `Button` in an older project ballooned to 8 variants, 3 sizes
and a `glow` variant using three layers of radial gradient — that is the counter-example.

**I7. "View all", "Read more" are text links, not buttons.**

They lead to another screen and are the block's secondary action: they must look clickable, but must not
weigh as much as the heading. Large apps all keep it light in the header corner, and most build
it as a text link.

- **Leading to another screen means it is a link and looks like one**: `<Link>` `inline-flex h-8 items-center text-sm font-medium text-foreground/70`, **no horizontal padding, no background**; on hover `text-foreground underline underline-offset-4`. No focus ring (`I13`). `h-8` is the vertical hit area. No arrow icon, no accent colour.
- **Why not a `ghost` button**: (1) a rounded grey background on hover is the language of a button that does something in place, while in the same card task names and project names are links that underline on hover: two styles for the same "go to another page" action (`N5`); (2) the button's `px-3` pushes the text 12px inward from the content's right edge (the % figure of the row below); without padding the text is flush.
- **Loading more in place is still a `ghost` button**: "View older activity" appends rows right below without changing page (`components/timeline.md`). Classify by what it does, not by the words on it.
- Do not use a 40px grey-filled `secondary`: every card gets a grey block that pulls the eye.
- **Align right.** A block with a header puts it on the right of the header, on the same line as the heading. A list that must be read through before clicking puts it at the end of the block, still right-aligned, still **inside the frame** (see `F3`).

```tsx
<Link
  to={href}
  className="inline-flex h-8 items-center text-sm font-medium whitespace-nowrap text-foreground/70 underline-offset-4 outline-hidden transition-colors hover:text-foreground hover:underline"
>
  View all
</Link>
```

**I8. A secondary button must not look disabled.** Faint text on a faint background and the user
reads it as a disabled button. The background difference between the secondary button and its parent must be **visible
at a glance**.

---

## Hover and focus

**I9. Every clickable element must have a hover, and that hover must be visible.**

Two halves, and the first one is often missed. After changing the colour, ask: is this difference noticeable at a glance
or not.

⚠️ **The `primary` button is the most forgotten place.** It already stands out so it looks fine
at rest, and the builder skips it. But the main button of the whole screen that gives no response on hover
is the only thing on the page that looks like a screenshot. Always add
`hover:bg-primary-hover` — the token already exists in `tokens.css`, no need to invent
a colour.

**The reverse half: what is not clickable gets no hover background.** A hover background is a promise of "click here";
a read-only row that fills on hover makes the user try to click and get nothing. A row containing a button
(such as "Check in") is still not a clickable row: the hover lives on the button. Two options: drop the hover, or
make the whole row a link to the detail. The only exception: hovering a row to reveal hidden buttons
(`components/list-row.md`), where the hover background signals the buttons have appeared. A row that is not a link but still shows a hover background, placed
next to a card whose rows are links, makes two lists look alike while only one is clickable.
The probe reports "Hover background on a non-clickable block".

**I10. A row's hover is a light background layer, no bolding, no scaling.
The hover background never matches the page background, nor the background of the frame right behind it.**

Exception: accordion toggle buttons get no hover background (`I30`, `components/accordion.md`); sortable table column headers likewise, only the text darkens (`components/sortable-header.md`).

Pick the token by **whether the hover background touches both edges of the frame**:

| Row | Hover | Why |
| --- | --- | --- |
| **Inset**, rounded, a gap away from the frame edge: menu item, sidebar link, list row in a widget | `hover:bg-item-hover` | The grey background sits neatly inside the white frame, the eye reads a pressed pill |
| **Full width**, touching both edges of the white frame: table row, edge-to-edge `divide-y` list | `hover:bg-surface-hover` | Filling with `--background` makes that row the same colour as the page outside the frame, like a strip punched out of the frame |

`--item-hover` in light mode equals `--background` exactly; in dark mode it is a 5% white overlay. Do not write
`hover:bg-background` for inset rows: in dark mode the page is darker than the card, so on hover it sinks
to 1.07:1, almost invisible (`M21`).

A **selected** table row (checkbox ticked) uses **the same faint background as hover**, `--surface-hover`.
The signal of "selected" is **the ticked checkbox**, not the background. Hovering a selected row
keeps it unchanged. A ⋯ button in the row may have a hover background in the same tone as the row hover; no need to separate them.

Settled after trying every way of separating the backgrounds, and all three were dropped:
- **`--secondary`**: clear, but ticking the whole page gives ten dark grey strips, against the skill's faint style.
- **`--background`**: exactly the page colour outside the frame, so a selected row looks like a strip
  punched out of the frame — the same bug as the edge-to-edge hover above, just moved to the selected row.
- **A heavy vertical bar on the left edge**: select all and ten bars join into a black column (`N3`).

To separate the two states, separate them with the checkbox, not with one more grey step. The left
bar is reserved for **one** open item in a navigation column (sidebar, folder tree).

**An open item without a checkbox has a background different from the hover background.** The left list of a
list + detail layout, an inbox, a folder tree: there is no signal other than the background, so hovering to the same
background makes every item you pass over look as if you just selected it. The
"same faint background" rule above applies only to table rows with checkboxes.

- **A single-select list inside a card uses inset rows**, not edge-to-edge: frame `p-1`,
  rows `rounded-xl` (card 16 = 12 + 4, `M19`), hover `hover:bg-item-hover`, open item one step darker with `bg-secondary` (a tinted accent colour
  uses the accent's light background, such as `bg-primary/8`). Edge-to-edge rows must use `surface-hover`
  (`#f8f8fa`), only 7 levels off a white card, almost invisible, leaving no step to separate open from
  hover.
- **No left bar on rows inside a rounded `overflow-hidden` frame**: on the first and last rows,
  the frame's rounded corner clips the bar into a curved sliver. The left bar is only for a non-rounded navigation column
  (sidebar, folder tree).

**Buttons and clickable cells inside a row with a hover background use `bg-foreground/8` for their hover**,
not `/5` like a standalone button (`components/button.md`). When the pointer is over the button it is also
over the row, so the button always sits on the `#f8f8fa` row background: `/5` gives `#ededef`, only 11 levels above the row
background, and the eye reads one grey patch. `/8` gives
`#e6e6e8`, clearly separate yet still faint. Apply to inline-edit cells, ⋯ buttons, icon buttons in the row, including
when open (`aria-expanded:bg-foreground/8`). Secondary text in that cell (the `—` of an empty cell, a faint
date) goes to `hover:text-foreground` on hover, like a ghost button: `--muted` on a `/8` background is only
4.05 : 1 (`styles.md`).

**I11. Row actions: few are shown directly, many are gathered into a three-dot button.**

| Number of actions on a row | How to show them |
| --- | --- |
| **1–2**, no dangerous action | `h-8` icon buttons placed directly in the row, last column right-aligned. In a list they are faded at rest and shown on row hover. **In a table they are always visible**, with `text-muted` text: in a long table people scan by column, and buttons that come and go make the last column jump |
| **3 or more**, or including delete | **One** always-visible `MoreHorizontal` button in the last column, opening a dropdown. The most used action (usually edit) may sit outside as one extra button, next to the three dots |

In the dropdown: regular items on top, **delete moved to the bottom** after a divider,
red `rose` hover (`I4`). The three-dot button has `aria-label="Actions"`, and **stops propagation**
(`event.stopPropagation()`) when the whole row is also clickable to open the detail — otherwise
clicking the three dots jumps straight to the detail page.

Devices without a mouse have no hover: show-on-hover buttons must come with
`[@media(hover:none)]:opacity-100`, otherwise they are never seen on a phone.

**I12. Hover, focus and selection change colour only.** Exception: card hover may use
`transition-all`. Floating layers that **open and close** (modal, dropdown, panel, toast) have their own enter/exit
motion, numbers in the "Motion" section at the end of `layouts/overlay.md`.

**I13. Do not draw a focus ring.** Settled.

Buttons (every form), links, sidebar links, tabs, chips, checkboxes, radios, switches, selectable cards, list
rows, slider thumbs: only `outline-hidden`, **no** `focus-visible:ring-*`,
`focus-visible:outline-*`, `ring-offset-*`. Tab or Shift+Tab onto them shows no surrounding
ring. Known trade-off: keyboard users cannot see which button they are on. **Do not
add it back when you notice Tab focus leaves no mark**, and do not report it as a bug during review (`V1`). Projects
that must meet accessibility standards: see `I14`.

**Exception during review** (Settled): if the project **draws its own** focus ring on its other
controls but one place shows nothing on Tab, that is a spot where their system got overridden, not
the skill's style. Report it as a System drift, and fix it with their own ring (the `--focus-ring` token, the focus class of the shared
component). If the project draws a ring nowhere, the rule above still applies: do not report. A commonly missed case:
the selected tab sets an inner-border `box-shadow` that overrides the `Button` focus ring, while every
other button has the ring.

Reason it was settled: a 2px grey ring drawn over the selected marker, left bar or underline makes three or four marks
on one row; pressing a key (Shift, a shortcut) while on the element also makes it appear,
so mouse users still see it.

Still kept, because they are not surrounding rings:

| Element | On focus |
| --- | --- |
| Item in a menu, dropdown, listbox, command in a command palette | **background like hover** (`data-[highlighted]:bg-item-hover`): the arrow keys move exactly one highlight; without it the menu cannot be driven by keyboard |
| Input, textarea | border + faint ring: `focus:border-focus focus:ring-2 focus:ring-focus`, see below the table |
| Select trigger, date picker, time picker (a `<button>`, not typeable) | border `focus-visible:border-focus`; border + faint ring only while open (`aria-expanded:`), no `focus:` |
| Selectable card (card-style radio) | only the **selected** marker (border + faint ring); Tab focus adds nothing |

**Inputs use `focus`**, because the user needs to see which field they are typing into, whether they arrived by mouse
or keyboard.

**A select trigger looks like an input but is not an input**: after choosing an item, focus
returns to the trigger (correct, for keyboard), and if the trigger uses `focus:` it keeps the heavy border + ring exactly
as if open, even though the list has closed. On Safari clicking another button does not take focus, so that border
sticks until you click empty space: two fields of the same kind side by side, one with a heavy black border,
looking open.
Use `focus-visible:` (lights up for keyboard only; the browser knows that focus returned after a mouse
click is not keyboard focus) and `aria-expanded:` (while open).

**Why fillable fields get a ring and buttons do not.** Settled, reversing the
"fields only change border" version: a border changing colour on its own makes it hard to see which field is
being typed in on a form with many fields, especially an open select. The ring here is `--ring-focus` (accent colour at 10%), 2px
thick (`ring-2`, not `ring-4`: `F20`), **faint enough to read as a glow around the field**, not a second border ring. An error field at rest has only a red border `border-red-500` + the error message, **no halo**; the red halo
`ring-2 ring-red-500/10` appears only when the error field has focus (see `input.md`).

**`outline-hidden` (Tailwind v4) or `outline-none` (v3)**; do not use plain `outline: none`
or v4's `outline-none`. Those two classes make the outline **transparent** rather than
removing it entirely, so it still shows in Windows high-contrast mode. That is the only
place users really need it with no hover background to replace it.

**Menus: only one item lit at a time.** If hover and focus are two separate
states, hovering one item while Tab sits on another lights both items,
and the user does not know which one Enter will open. With Radix / shadcn,
use **`data-[highlighted]`** in place of both `hover:` and `focus:`:

```tsx
<DropdownMenuItem className="outline-hidden data-[highlighted]:bg-item-hover">
```

`data-[highlighted]` follows both the mouse and the arrow keys, so only one item is ever
lit. Without Radix, when the mouse enters an item, call `.focus()` on it.

**I14. Bring the focus ring back only when the project owner asks for it.**

When the request says "needs accessibility", "meet WCAG", or it is a government, banking or education project with accessibility
requirements, bring the ring back, **in exactly one place** (the base class of `Button`, of chip, of tab),
so removing it later means editing one line:

`outline-hidden focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface`

- `ring-foreground/50` is the lowest level reaching 3:1 on white (WCAG 1.4.11); on dark backgrounds `ring-white/50`.
- Rows inside an `overflow-hidden` frame (accordion, table column header) use `ring-inset`, otherwise they get clipped.
- The ring does not stack on the selected marker: "selected" and "on" borders are drawn with `inset-ring-*` or `border`, not `ring-*`, because `ring-*` has only one shadow layer and the focus ring would replace the selection border (`W8`).

**I15. Sidebar: the selected item gets a grey background, no accent colour, no border.** Items
not selected have no background. Hover `hover:bg-item-hover`; selected is **one step darker**
`bg-secondary` + `font-medium`. Folder trees use the same formula. Do not let hover and selected
share the `--background` background: the selected item has no signal other than the background so it must differ from
hover (`I10`); the probe grades it Broken. The "same
faint background" rule now applies only to table rows with checkboxes. On hover or selected, **icon and text both
go to `--foreground`**; at rest both are `foreground/70`, not as faint as `--muted`.
See `layouts/app.md`.

Exception already hit: when the selected item is an **image** (avatar in the mobile bottom bar), a colour
fill over the image does not read as "selected" — use a `box-shadow` ring around the image.

---

## Lists

**I16. Paginate large data, do not dump it all out.**

A list or table over about 25 rows gets pagination, or a load-more button.
When the data source returns a total, show the **total** and **how far the user has got**: "51 to 75
of 312 rows". With no total (cursor-paginated API),
show only "‹ Previous / Next ›" or "Load more", **do not invent a total** (`N7`, `N10`).

**I17. Threshold for hiding content behind a click:** use an accordion or tabs only when the list
is longer than 6 items, or each answer runs over 3 lines. Below that threshold,
show everything.
Exception: the FAQ on a pricing page is always an accordion (`layouts/pricing.md`): it is a lookup spot,
not something people come to read.
An "Advanced settings" area in a form does not follow this threshold either: it hides fields few
people touch to keep the main path short (`components/accordion.md`, "Collapsed area in a form").

**I18. Auto-hiding scrollbar: invisible at rest, shown on hover or while scrolling.**

A formula already running in a real project, with the CSS
ready in `tokens.css`, applied to the whole app:

- A **4px** bar, transparent track, fully rounded thumb.
- **At rest: transparent thumb.** Hovering the scroll area: shown faintly (16%). While scrolling: darker (28%). Hovering the thumb directly: 40%.
- **Hide with a transparent colour, not with `scrollbar-width: none`.** The width still keeps its space, so when the bar appears the content is not pushed sideways by 4px. With `none` the whole block jerks on every scroll.
- **The thumb colour goes through a `--scrollbar-thumb` variable set on the scroll container**; do not write `*:hover::-webkit-scrollbar-thumb`. Chrome does not repaint the thumb for that selector: hovering shows nothing, it only shows after scrolling, so the "auto-hiding" bar becomes "hidden until scrolled". With `*:hover { --scrollbar-thumb: … }` Chrome repaints at once. A project on the old version should replace the whole block with the block in `tokens.css`.
- **The Firefox block must be wrapped in `@supports not selector(::-webkit-scrollbar)`.** Since Chrome 121, when `scrollbar-width` is present Chrome drops all `::-webkit-scrollbar` and draws the big native bar that takes up space.
- The "scrolling" state needs a small component that adds `.is-scrolling` to **exactly the element being scrolled**, removing it after 700ms. Listen to `scroll` in the **capture** phase to catch nested scroll areas too (sidebar, list in a modal). Mount once at the app root:

```tsx
import { useEffect } from "react";

// Add .is-scrolling to exactly the element being scrolled, remove it 700ms after it stops.
// The CSS in tokens.css reads this class to show the scrollbar (rule I18).
export default function ScrollbarAutohide() {
  useEffect(() => {
    const hideTimers = new WeakMap<Element, number>();

    function handleScroll(event: Event) {
      // When the whole page scrolls the target is document, take the root element.
      const scrollingElement =
        event.target instanceof Element ? event.target : document.scrollingElement;
      if (!scrollingElement) return;

      scrollingElement.classList.add("is-scrolling");
      window.clearTimeout(hideTimers.get(scrollingElement));
      hideTimers.set(
        scrollingElement,
        window.setTimeout(() => scrollingElement.classList.remove("is-scrolling"), 700),
      );
    }

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  return null;
}
```

`.scrollbar-clean` (fully hidden, never shown) remains only for **horizontally scrolling chip / tab
rows**. For vertical scroll areas let the auto-hiding bar handle it; do not add `scrollbar-clean`:
fully hidden means mouse users have nothing to drag, and no idea how much is left.

**When the bar is hidden, the cut edge must signal "there is more".** The auto-hiding bar only shows when the pointer is already
inside the scroll area; someone who just opened the command palette with ⌘K, hands still on the
keyboard, sees nothing. The signal at rest is **the last item cut across by the bottom edge,
about half showing**. macOS, iOS and Android hide scrollbars at rest by default,
and users often miss even a visible scrollbar; content cut across makes the eye
want to scroll on to see the rest:

- **Pick a `max-h` so the bottom edge cuts through the middle of an item, not right at the boundary between two items.** A cut a few px short looks as if the list ends there (if the last item is almost fully visible nobody knows there are items below). Formula for a `p-1` frame, `min-h-10` items spaced `gap-1`: `max-h` = 44 × number of whole items + 4 + 20 → **`max-h-83`** (332px, seven and a half items showing) for selects and long dropdowns. For a list with group labels, measure in the default state then nudge `max-h` in 4px steps until the last item shows between 1/3 and 2/3.
- **Items of varying height** (notifications, comments, search results with descriptions) cannot settle on one `max-h` number. Compute it in JS on open: within the maximum height, find the lowest item whose **midpoint** still fits, then shrink the list height to exactly that midpoint. However long the data or tall the screen, it always cuts through the middle of an item:

```ts
// Height so the last item shows exactly half (rule I18). Each item carries data-peek-item.
export function getPeekListHeight(listElement: HTMLElement, maxHeight: number): number {
  if (listElement.scrollHeight <= maxHeight) return listElement.scrollHeight;

  const listTop = listElement.getBoundingClientRect().top - listElement.scrollTop;
  let peekHeight = maxHeight;

  for (const item of listElement.querySelectorAll<HTMLElement>("[data-peek-item]")) {
    const itemRect = item.getBoundingClientRect();
    const itemMiddle = itemRect.top - listTop + itemRect.height / 2;
    if (itemMiddle > maxHeight) break;
    peekHeight = itemMiddle;
  }

  return peekHeight;
}
```
- **Floating layers with a scrolling list (command palette, select, long dropdown) flash the scrollbar once on open**, like macOS: if `scrollHeight > clientHeight` add `.is-scrolling` to the list area, remove it after ~1 second. Floating layers only; sidebars and pages do not flash.
- **A scroll area inside a rounded frame (floating layer, card) insets the track at the ends it touches**: an end touching a rounded corner insets **by the corner radius** (frame `rounded-2xl` → `mb-4`, both ends touching → `my-4`), because the round end of a 4px bar against the edge only sits fully inside the corner when it is R − 2px from the edge; an end below a straight line gets `mt-2`. Write it as `[&::-webkit-scrollbar-track]:mb-4`. The right gap must subtract the bar's 4px (`pr-1` instead of `p-2`, plus `[scrollbar-gutter:stable]`). Inset too little and when scrolled to the end, the bar's tail is bevelled by the rounded corner (`my-2` is still 2px short on a 16px frame); not subtracting the gap makes the right gap 4px wider than the left. See the example in the Command palette section of `layouts/overlay.md`.
- **Do not overlay a fade strip at the bottom** to signal more: one more gradient layer is one more signal for what the half-cut item already says (`N3`), and the fade covers the last item's text.

```ts
// Flash the scrollbar once when a floating layer opens (rule I18). Call in an effect on open.
export function flashScrollbar(scrollElement: HTMLElement | null) {
  if (!scrollElement || scrollElement.scrollHeight <= scrollElement.clientHeight) return;

  scrollElement.classList.add("is-scrolling");
  window.setTimeout(() => scrollElement.classList.remove("is-scrolling"), 1000);
}
```

**I19. Every page with data needs all three states: loading, empty, error.**

The skeleton must have **the exact shape** of the content that will appear, not a spinner
in the middle of the screen. A wrong-shaped skeleton makes the page jump when the data arrives, and that is something
users feel even if they cannot name it. When data is already on screen (changing filter, changing
page, changing tab), keep the old data; do not redraw the skeleton.

Loading: `components/loading.md`. Empty, error: `components/empty-state.md`.

---

## Modals

**I20. A modal with inputs must not close on an outside click.**

Any popup containing `input` / `textarea` / `select` / rich-text / image upload has
a backdrop with **no** close handler. Halfway through filling it in, one stray mouse click
outside wipes everything — no draft, no undo. Close with the ✕ / Cancel button / Esc,
meaning it must be deliberate.

- `e.target === e.currentTarget` **is not the fix**: it only blocks clicks bubbling from inside, while a click directly on the backdrop — exactly the stray click — still closes it. Remove the `onClick` prop entirely.
- When removing dismiss, **make sure another way to close remains**. A real case in one project: two bottom sheets used the backdrop as their **only** exit, and removing it locked the user inside the sheet.

**I21. Keep dismiss for things that are only for reading or picking.** Image lightbox, order
detail view, roster, dropdown, menu, notification panel, mobile drawer. Closing those by mistake
loses nothing.

**I22. Panels and dropdowns must portal to `document.body`.**

A popup nested in a sidebar or bottom bar gets clipped by `overflow` or trapped
in the parent's stacking context. A portal escapes all of that.

**I23. To build a new modal, use the shared frame; do not build your own backdrop with
`position: fixed`.** The shared frame comes with focus trapping, returning focus to
the button that opened it, background scroll lock, and correct aria — build your own and you lose all of that.

---

## Navigation

**I24. The notification panel opens in place, it does not navigate to another page.** Navigating
away loses the context just to glance at a notification.

**I25. Dropped.** The old rule said "mark as read" applies only to the scope
being filtered. That is data logic, not interface, and the user decides (see
the scope in `../SKILL.md`). The number is kept so references from `I26` onward do not shift.

---

## Inputs

**I26. A label must be attached to its field, have `cursor-pointer`, and be only as wide as its text.**

Three things go together; missing one is a bug:

```html
<label for="email" class="w-fit cursor-pointer text-sm font-medium">Email</label>
<input id="email" />
```

- **`for` / `htmlFor` matches `id`** — clicking the text focuses the field. Without it the label is just decorative text, and screen readers do not know the field's name either.
- **`cursor-pointer`** — a clickable label with the text-cursor pointer means nobody knows to click it.
- **`w-fit`** — the most commonly missed. `<label>` is a block; without `w-fit` it takes the full width. Click the empty space to the right of the text, 300px from it, and the field still lights up. Users who miss and see the field respond think they clicked on something.

**I27. A password field must have a show/hide button.** Without it, a user who mistypes one character
has to delete everything and retype, and that is the most common reason to abandon the form on a sign-in screen.

- The button is **icon only**, `absolute` inside the field, right-aligned. `Eye` / `EyeOff` icon per `F15`.
- **`size-10` button, `right-1`, vertically centred** (`inset-y-0 my-auto`, not `-translate-y-1/2`: `N11`), `size-4` icon centred in the button. The icon stays in the same place, only the hit area grows; it fits `pr-11` exactly (4 + 40 = 44px). A button hugging the icon (`p-1`, 24px) on a phone misses into the field, and the keyboard pops up instead of revealing the password. No focus ring (`I13`).
- **`type="button"`.** Forget it and it defaults to `submit` — clicking to view the password submits the form.
- `aria-label` changes with state: "Show password" / "Hide password". Not one fixed label.
- Reserve room for the button with right padding on the field itself (`pr-11`); do not let long typed text slide under the icon.
- The default is **hidden**. Shown by default exposes the password to anyone standing behind.

**I28. Do not turn off the browser's autofill suggestions. Declare them correctly.**

The dark box Chrome pops up when you tap the email field is the **password manager**,
not a UI bug. One click from the user fills the whole form. Turning it off
forces people to type a 20-character password by hand, and pushes them towards easy-to-remember passwords.

`autocomplete="off"` on a sign-in form is also **deliberately ignored** by Chrome, Safari and Firefox
— it cannot be turned off, it only breaks the suggestions without disabling them.

What to do is the opposite: declare enough for it to guess correctly.

| Field | `autocomplete` |
| --- | --- |
| Email / username | `username` (or `email`) |
| Password, **sign-in** screen | `current-password` |
| Password, **sign-up** or change-password screen | `new-password` |
| OTP code | `one-time-code` |

Every field must also have a `name`. Without `name` the browser has nothing to save, and
cannot suggest next time.

**A set-new-password form with no email field** (the last step of a forgot-password flow, changing the password
via a link) adds a hidden field carrying the account name, at the top of the form:

```html
<input type="email" name="username" autocomplete="username" value="an@company.com" hidden readonly />
```

Without this field the password manager saves the new password without knowing which account it belongs to,
or saves it as a new entry next to the old one. On the next sign-in it still suggests the old
password, and the user thinks the change did not go through.

The suggestion box **covers the field right below** — that is normal browser behaviour,
it closes by itself when you type or leave the field. Do not push the fields further apart to
"avoid" it.

---

## Hit areas

**I29. The hover background, the hit area and `cursor-pointer` must sit on the same element,
and that element spans the full row.**

The most common bug in menus, sidebars and clickable lists. The hover background sits on the outer wrapper,
spanning the whole row, while the clickable element (`<a>`, `<button>`) is inline,
hugging only the text.

The result: moving the pointer across the row makes the cursor **flicker**, a hand over the text, an arrow over
the empty space. The background still lights the whole row, so the user thinks they can click anywhere.
Clicking the empty space **does nothing**, and they think the app has frozen.

```html
<!-- Wrong: hover on <li>, hit area only as wide as the text -->
<li class="flex h-10 items-center rounded-xl px-3 hover:bg-item-hover">
  <a href="/profile">Your profile</a>
</li>

<!-- Right: plain <li>, everything moved onto <a> -->
<li>
  <a href="/profile" class="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 hover:bg-item-hover">
    <i data-lucide="user" class="size-4 text-muted"></i>
    Your profile
  </a>
</li>
```

**React with shadcn / Radix: the `asChild` trap.** This is the most common spot in
Next projects:

```tsx
// Wrong: Item has hover and spans the row, but navigation lives on the inline <Link> inside.
// Clicking the empty space of the row closes the menu without going anywhere.
<DropdownMenuItem>
  <Link href="/profile">Your profile</Link>
</DropdownMenuItem>

// Right: asChild makes <Link> BECOME the Item itself, inheriting both hover and hit area
<DropdownMenuItem asChild>
  <Link href="/profile" className="flex w-full cursor-pointer items-center gap-2.5">
    Your profile
  </Link>
</DropdownMenuItem>
```

**How to check, five seconds:** move the pointer from the left edge to the right edge of the row, very
slowly. The cursor must be a hand **the whole way**. Changing even once is a bug.

Applies to: menu items, sidebar links, clickable list rows, tabs, and cards where the whole block
is clickable. The row's padding goes on the **clickable element**, not on the wrapper,
because padding is hit area too.

`cursor-pointer` must be written explicitly on `<button>` in Tailwind v4 — see `W7`.

**I30. Do not use `<details>` / `<summary>` for anything that opens/closes.** Build it with
`<button aria-expanded>` + a sliding `grid-rows` block.

`<details>` opens and closes instantly, no browser animates it by default: click and the content
jerks out, click again and it vanishes, and the whole page below jumps along (`N1`). The fix via
`::details-content` + `interpolate-size` only works on Chrome; Safari and Firefox still
jerk.

Applies to everything that opens/closes: accordions, FAQs, collapsible sidebar groups, tree items, "view
details" inside a row, tool step blocks in chat. For the same reason, **do not render
conditionally** (`{isOpen && …}`) or use `hidden` for that content: it jerks just the same.

The full accordion pattern (padding, hover, frame, how to check) is in `components/accordion.md`.
The core formula, same as the sidebar group (`layouts/app.md`):

```tsx
<button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setIsOpen(!isOpen)}>
  {label}
  <ChevronDown className={cn("size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none", isOpen && "rotate-180")} aria-hidden />
</button>

<div
  id={panelId}
  inert={!isOpen}
  className={cn(
    "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
    isOpen && "grid-rows-[1fr]",
    !isOpen && "grid-rows-[0fr]",
  )}
>
  <div className="min-h-0 overflow-hidden">…</div>
</div>
```

- **`duration-200 ease-out`**, the chevron rotates in the same beat. Do not measure height with JS.
- **The closed block gets `inert`**: Tab does not slip into hidden content, screen readers do not read it.
- **Has `motion-reduce:transition-none`.**
- **A toggle button spanning the full width of the white frame (accordion, FAQ) gets no hover background**,
  the chevron darkens instead. An exception to `I10`; the reason and the approaches tried are in
  `components/accordion.md`.
- **The button and the content keep fixed padding, not changing with state.** The button has the same `py-*`
  open and closed; the content has the same `px` as the button, only `pb`, continuing the button's bottom padding.
  Do not reduce the button's `pb` when open, no negative margin (`N11`): fill the button background and the text is clearly off to
  one edge.
- In exchange you lose Ctrl+F auto-opening the block containing the text (only `<details>` has it). Accepted, as with
  the accordion of every component library.

Grep once after building: `<details` and `<summary` must return 0.


---

## Removing the focused element

**I31. When clicking a button makes its own row disappear, move focus automatically.** Removing a row
(signing out a device, deleting a row without a confirm dialog, revoking an invitation) takes the focused
button out of the DOM, and focus falls back to `<body>`: screen readers start reading from the top of the page, and
keyboard users lose their place.

- There is a next row: focus the same kind of button on the next row. No next row: the previous row.
- No rows with buttons left (or a bulk removal): focus the block heading (`tabIndex={-1}`,
  `outline-hidden`), or the empty cell / primary button of the empty state.
- Removing via a confirm dialog: when the dialog closes, return focus by the rule above, not to the button that opened
  the dialog, because that button may be gone (e.g. the "Sign out 4 other devices" button hides when there are no other
  devices left).
- Moving focus after React has removed the row: `flushSync` then `focus()`, or keep the target id in
  a ref and focus in `useEffect` when the list changes.

**I32. A block's hover background must not match the background of a child block inside it.** ⚑

List rows, category tiles, clickable cards often have an icon tile (or badge) with a light grey background.
On hover, if the block switches to exactly that colour, the icon tile **disappears**, leaving a bare icon,
as if just removed from the row. The `list-row.md` pattern hovers `hover:bg-item-hover`, and icon tiles in many
files are also `bg-background`: put the two together and it happens.

- A hoverable block with a `bg-background` child tile: the child tile **flips to the card background on hover**:
  the block gets `group`, the child tile adds `group-hover:bg-surface`. The hover area is grey, the icon tile turns white,
  still reading as a tile.
- Or give the child tile a `border-border` border so it does not rely on its background.
- Check on hover: does the child tile still read as a tile. The probe reports "Child block disappears on hover".

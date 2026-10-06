# Budgets and rhythm

What can be counted can be kept. Going over any number needs a reason, and that reason is stated at delivery.

This skill only covers **in-app screens** — dashboards, lists, tables, forms,
settings. The marketing-page branch has been removed from the skill (it lives in the repo's `archive/`).

---

## Ceilings

| Item | Ceiling | Notes |
| --- | --- | --- |
| Accent colour | 1 | A second colour needs permission. Category tags (`M8`) and identity colours of user-created entities (`M34`) do not count |
| Font family | 1 | Split roles by weight, not by a second font |
| Text shades | 3 | primary, secondary, and the colour on the accent background |
| Radius steps | 4 | full, large, medium, small |
| Shadow steps | 2 | **only for elevated layers**: dropdown/popover, and modal. No shadows inside the page — see `M15` |
| Border tokens | 2 | one for the hairline, at most one heavier step. Plus `--border-focus`. See `M16` |
| Block nesting depth | 2 | |
| Line length | 75 characters | |
| Button variants | 4 | `outline` (default; left icon when the glyph names the action exactly), `primary` accent background, `secondary` grey background, `ghost`. The danger button is a `ghost` with a faint `rose` background (`I4`), not a fifth variant. Plus icon-only buttons. See `I1`, `components/button.md` |
| Spacing steps | scale 4/8/12/16/20/24/32/40 for spacing between blocks | Inside a control (button, badge) the half steps 2/6/10 are allowed (`py-0.5`, `gap-1.5`, `py-2.5`). **The gap between two rounded rows with a hover / selected background is at least 4px, never step 2** (locked rule 19). Nothing outside these two scales |

---

## Rhythm

| | Value |
| --- | --- |
| Page padding | `p-4 sm:p-6` |
| Card padding | `p-4` on mobile, `p-5` from `sm` |
| Padding inside a card, desktop | 20–24px |
| Grid gap | `gap-3` |
| Section padding | `py-4` |
| List row height | 12–16px vertical |
| Button height | `py-2.5` |
| **Inputs, selects, buttons in a form** | **`h-11 md:h-10`** (44px on narrow screens, 40px from `md`), inputs and buttons change together. A standalone sign-in/sign-up form centred on the page may go up to `h-12` |
| "View all", "read more" | text link `h-8`, no horizontal padding, right-aligned (`I7`) |
| Card border | 1px hairline, a single token |
| Card shadow | **none** |

**A form button must be as tall as the input, and both change together.** Same
`h-11 md:h-10`: change one and keep the other and the bug is obvious at once; a 40px button under a
48px input looks like two parts from two different kits.

**Why 40px, not 48px.** Do not bring back `h-12` for form inputs and buttons at every
width with a reason derived from `R8`: `R8` is about **font size** 16px, not
height: 16px text inside a 40px input still breathes. 48px in a dashboard is clunky,
one step off from sidebar links, menu items and dropdown items (all `h-10`), and 2 inputs + 1
button row already eat most of a modal. Narrow screens go up to 44px to fit a finger. Only a
sign-in/sign-up form standing alone in the middle of the page gets `h-12`: that form is the whole screen.

Applies to every button inside a form flow — sign in, sign up, change password, the
`Save` / `Cancel` buttons at the end of a form. Does not apply to buttons in the header or in list rows.

`p-3` for page padding is **only** for screens that are deliberately edge-to-edge: a browser new-tab
page, a full-screen control panel, a kiosk. Normal app pages use
`p-4 sm:p-6`, otherwise content sticks to the edge and the whole page looks cramped even though every block
has the right rhythm.

---

## Small cards in a column or a dense grid

Kanban cards, cards in a multi-column grid, cards in a narrow panel are all cards, so they still follow
the scale. Do not shrink them to look tidy — too tidy becomes cramped (rule `F12`).

| | Value |
| --- | --- |
| Card padding | `p-4`, **do not** go down to `p-3` |
| Gap between cards in one column | `gap-3` |
| Gap between columns | `gap-4` |
| Spacing from column title to first card | `mb-3` |

A card holding two or more lines of text is cramped at `p-3`. `p-3` is only for chips, labels,
and small controls.

---

## Font size scale

Seven names, and those seven names are **all**. No inline pixels outside the scale (`T7`).

| Token | Used for |
| --- | --- |
| `xs` | labels, timestamps |
| `sm` | **the app default** (`T6`): body text, list rows, descriptions |
| `base` | card names, card titles |
| `sm` + `font-medium` | buttons (`button.md`). Tailwind has no `text-md` |
| `lg` | block titles (a group of several cards); the record name at the top of a detail page in a management app (customer, order, project) |
| `xl` | **the name of a page**, at every screen size |
| `2xl` | hero of a showcase page on narrow screens; the number in a stat card from `sm` (`sm:text-2xl`) |
| `3xl` | hero from `sm`; prices in a pricing table. A standalone pricing page title is `text-2xl sm:text-3xl`, never smaller than the price (`layouts/pricing.md`) |

Required hierarchy: **page name (`xl`) > block title (`lg`) > card name (`base`)**,
each exactly one step apart at **every** breakpoint (rule `T8`).

The title of a detail page for repeated content (article, course, product) takes **the same size
it has in the list**, it does not jump up a step (`T9`). Records in a management app (customer, order,
project) are not covered by `T9`: in the list it is a `text-sm` table row, on the detail page it is the
`lg` name at the top.

⚠️ Two traps already hit on real projects:

- `md` and `lg` accidentally had the same value, so the "8 standard sizes" were really only **7**. Check the project's scale before trusting token names.
- The page name used to be `2xl` on desktop; settled: lowered to `xl` because it read as **too big for the content below**. `2xl` is now only for the hero and stat-card numbers.

---

## Step down on mobile

The rhythm table for narrow screens lives in `responsive.md`. Do not copy it here — one source only.

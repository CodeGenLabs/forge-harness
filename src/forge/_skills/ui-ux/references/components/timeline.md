# Activity timeline

The history of one object: an order, a profile, a ticket. Sits inside a card (`card.md`).
**Not for the workspace-wide "Recent activity"** (many people, many projects):
there the question is who just touched what, the pattern is avatar + one sentence, see `layouts/app.md`
section Dashboard.
The circles and connector borrow from the step bar (`layouts/form.md`), the text borrows from the list
row (`list-row.md`). Borrowing means copying the classes, not just the look (`N5`).

```html
<ol class="text-sm">
  <!-- Newest on top. The last row (oldest) has no connector -->
  <li class="relative flex gap-3 pb-6 last:pb-0">
    <span class="absolute top-10 bottom-1 left-[15px] w-0.5 bg-border" aria-hidden="true"></span>
    <span class="grid size-8 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
      <!-- lucide icon size-4, one per event type -->
    </span>
    <div class="min-w-0 flex-1 pt-1.5"><!-- 20px first line centred on the 32px circle -->
      <div class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <p class="font-medium text-foreground">Delivery failed</p>
        <time class="shrink-0 text-xs whitespace-nowrap text-muted tabular-nums">11:47 · 19/09</time>
      </div>
      <p class="mt-1 max-w-[55ch] text-pretty text-muted">The courier called 3 times and could not reach the recipient…</p>
      <p class="mt-1 text-xs text-muted">Le Van Phuc · Sao Viet Shipping</p>
    </div>
  </li>
</ol>
```

- **Newest on top.** Someone opening the history wants to know "where do things stand now"; with oldest on top and a long history, the event that just failed sits at the very bottom and needs scrolling to find. If the user wants chronological order, reverse the array; the component does not sort on its own.
- **Circle `size-8`, icon `size-4`, colours taken from the status badge table** (`M7`, `N4`): ordinary events `bg-zinc-100 text-zinc-600`, failure `bg-red-50 text-red-600`, fully done `bg-emerald-50 text-emerald-700`. **Routine recurring events are grey, even when they are "done"**: in a customer's history, every delivered order is ordinary, and painting all 24 orders green makes a column of green circles that no longer signals anything (`N3`). Green is only for the end milestone of the object itself (order delivered, in that order's own history). Only the circle is coloured; **the label is always `text-foreground`**, even for failures (`N3`). One icon per event type, colour never stands alone.
- **The first line sits on the circle's centre**: the text block has `pt-1.5` (32px circle, 20px `text-sm` line). Without it the label hugs the top of the circle, misaligned with the step bar.
- **Two font sizes**: label and description `text-sm`, time and actor `text-xs`. No `text-base`.
- Description `max-w-[55ch] text-pretty` (`T10`, `T11`): in a wide card, long sentences still do not run past 75 characters and do not slide under the time column. No `max-w-prose` (65ch ≈ 90 Vietnamese characters), reason in `T11`.
- Time `tabular-nums whitespace-nowrap` (`T16`), right-aligned from `sm`, below the label on narrow screens. Tracking codes and order codes in the description are wrapped in `font-mono` (`T17`).
- Connector `w-0.5 bg-border`, the same thickness as the step bar (`N5`); a faint `w-px` almost vanishes on white. Leave a gap above and below, not touching the circles. With only one event there is no connector.
- **For a long history show about the 10 most recent events, ending the list with a `ghost` button "Show older activity"** (`I7`, no icon), with the button's **text** aligned with the rows' text: `ml-8` (32px circle + `gap-3` = 44px, minus the ghost button's `px-3`). Clicking appends 10 more events right below, no pagination, no new page; while loading, a spinner sits over the centre of the button (`button.md`). When there are no more events, drop the button: the oldest row ("Customer created", "Order created") is itself the end point. Do not render hundreds of rows at once, and do not cut off at 5 rows and jump straight to the creation milestone: the reader sees a stat saying 24 orders while the history shows one.
- Rows that are not clickable get no hover. Clickable rows (opening details) follow the hover of `list-row.md`.

# Empty state

Source: the reminder widget of a real project.

```tsx
{isLoading ? (
  <p className="py-6 text-center text-sm text-muted">Loading…</p>
) : visibleReminders.length === 0 ? (
  <p className="py-6 text-center text-sm text-muted">
    No reminders in this section yet
  </p>
) : (
  <ul className="flex flex-col">…</ul>
)}
```

**Why it works**

This is where AI invention shows most. By default it builds a huge block: an illustration,
a `text-xl font-bold` heading, an encouraging paragraph, then a CTA button. The result is that the empty
box stands out more than a box with data.

The right version is **one muted line of text**:

- Exactly one sentence, `text-sm text-muted`. No heading, no image, no icon, no button.
- **Do not add `opacity-70`.** `--muted` is already close to the threshold (4.95:1); dimming another 70% drops it to ~2.8:1, failing the 4.5:1 for 14px text. Text already muted by colour must not be dimmed again with opacity.
- `py-6` gives the empty block a moderate height, so the card does not collapse and then spring open when data arrives.
- The sentence describes the actual context being filtered ("in this section"), not a generic "No data".
- **A filter with 0 results is an empty state, not an error.** No red border on the filter, no red text: the user has not entered anything wrong, the filter range is still valid (`M30`: `red` is only for what must be fixed to continue). It is still one muted line, placed **where the results would be**, and it says how to loosen the filter: "No products from 47,500,000 ₫. Lower the From price to see more."
- Loading states (skeleton, second load, when to show): `loading.md`. **A loading state never shows the empty sentence.**

Only build an empty state with an image and a CTA when it is the main screen of the whole app and the user
arrives for the first time with nothing to do yet. Not inside a widget or a tab.

**When the user is the one who starts** (a new chat window), do not use an empty sentence: offer 2–3
clickable actions, still no image and no heading (`N6`, `chat.md`).

## Empty because of a filter: the sentence matches what is filtered, and there is a way out

The exception to "no button": a list that is empty **because the user is searching or filtering** means the user
led themselves into a dead end, so there must be a way out right there (`N6`). Still one muted line, plus
**one text link** right after the sentence, no solid button, no image:

```tsx
<p className="py-6 text-center text-sm text-muted">
  No customers match {quotedQuery}. Try a different keyword.{" "}
  <Button variant="ghost" onClick={clearFilters}
    className="inline h-auto min-h-0 p-0 align-baseline font-medium text-foreground underline-offset-4 hover:bg-transparent hover:underline">
    Clear search
  </Button>
</p>
```

- **The sentence matches exactly what is filtered**: keyword only, repeat the keyword and "Try a different keyword." (not "shorter": telling someone who typed the 4-character "zzzz" to type something shorter makes no sense); chips only, "No customers have this label. Remove some labels to see more."; both, a general sentence. Do not advise "remove some labels" when no label is selected.
- **Truncate long keywords by character count in JS, not with CSS**: keep ~24 characters + `…`, with the quotation marks attached to the keyword (`"Northwind Trading Joint St…"`), and the full keyword in `title`. Truncating with `truncate` on an inline span drops the opening quote to the end of the previous line and leaves a gap before the closing quote. The keyword is `--foreground`, the rest of the sentence `text-muted`.
- The link text changes with what it removes: "Clear search" (keyword only), **"Clear filters"** (chips present) — **the same text as the "Clear filters" button at the end of the chip row**, because the two buttons do the same thing; two different labels ("Clear filters" / "Reset filters") make the user guess whether they differ (`N6`). Clicking removes everything and returns focus to the search box.
- The link is `--foreground`, not the accent colour: it is a way out, not the page's primary action.
- The table header row stays (so the user can see which table they are still in) but **hide the select-all checkbox**: select all of 0 rows is a meaningless control.

---

## An empty column is not an empty list

For an empty list, one muted line is enough. **An empty column in a board is
not**, because the column must still read as a drop zone.

```html
<li class="flex min-h-[7rem] items-center justify-center rounded-2xl border border-dashed border-foreground/15 px-3">
  <p class="text-center text-sm text-muted">No tasks yet</p>
</li>
```

- **Keep a minimum height** `min-h-[7rem]`, enough to see the drop zone and to keep columns from being wildly uneven in height.
- **Dashed border, no background.** Kanban columns sit directly on the page background, so "a background one step darker" becomes a solid grey patch, the heaviest block on the whole board, heavier than any card with a task. A dashed border says "place to drop" without a block (`F21` allows exactly this spot). Border `foreground/15`, not `--border-strong`: `#eaeaea` on the page background `#f4f4f6` is only 1.05:1, and the empty frame disappears. Radius `rounded-2xl` like the cards, so the empty frame has the same shape as the cards that will land in it.
- Text `text-sm` like a card's secondary text, not `text-xs`; the same sentence as an empty group in the list view ("No tasks yet", adding "in this group" when it sits between groups).
- Still just one line of text. No icon, no "add your first task" button.

The same principle applies to empty cells in a calendar, and to file drop zones. These are also the two
rare places where `border-dashed` is used, see rule `F21` in `../rules-form.md`.

---

## Load error

```html
<div role="alert" class="flex flex-col items-center gap-3 py-10 text-center">
  <div>
    <p class="text-sm font-medium text-red-600">Could not load the customer list</p>
    <p class="mt-1 text-sm text-muted">Network connection lost</p>
  </div>
  <!-- Outlined button + rotate-cw icon per I1: "Retry". What it calls is an empty handler (onRetry). -->
</div>
```

- **Two tiers like an error toast** (`../layouts/overlay.md`): the top tier says what broke, `font-medium` `red-600` (`--error-text`, not `red-500`); the bottom tier, `text-muted`, says why. If you do not know why, drop the bottom tier; do not invent one.
- **The Retry button is an outlined button with an icon** (`I1`), right under the text, centred.
- No big icon, no illustration, no red background on the whole block. A load error is temporary, one more click fixes it, no need to shout.
- **Empty text and error text share the same `py`**, so switching between the two states does not resize the frame.

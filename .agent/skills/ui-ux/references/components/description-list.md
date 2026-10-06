# Labels and values (description list)

Information block for detail pages: email, phone number, status, creation date. Lives inside a card (`card.md`), one label-value pair per row, per `T23`.

```html
<dl class="@container space-y-3 text-sm">
  <!-- Each pair in a block. Responsive layout follows the width of <dl> itself via container queries, not viewport: below 384px stacked label above value, from @sm (384px) two columns with 7rem label, from @xl (576px) 10rem label -->
  <div class="grid gap-1 @sm:grid-cols-[7rem_minmax(0,1fr)] @sm:items-baseline @sm:gap-6 @xl:grid-cols-[10rem_minmax(0,1fr)]">
    <dt class="text-muted">Email</dt>
    <dd class="min-w-0 font-medium text-foreground [overflow-wrap:anywhere]">alex.morgan@company.com</dd>
  </div>
  <div class="grid gap-1 @sm:grid-cols-[7rem_minmax(0,1fr)] @sm:items-baseline @sm:gap-6 @xl:grid-cols-[10rem_minmax(0,1fr)]">
    <dt class="text-muted">Status</dt>
    <dd><!-- badge M7, NOT plain text "Active" -->
      <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-black/5">
        <span class="size-1.5 rounded-full bg-current"></span>Active
      </span>
    </dd>
  </div>
  <div class="grid gap-1 @sm:grid-cols-[7rem_minmax(0,1fr)] @sm:items-baseline @sm:gap-6 @xl:grid-cols-[10rem_minmax(0,1fr)]">
    <dt class="text-muted">Tags</dt>
    <dd class="flex flex-wrap gap-1.5"><!-- one pill per tag, NOT comma-separated -->
      <span class="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">VIP</span>
      <span class="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">Frequent</span>
    </dd>
  </div>
  <div class="grid gap-1 @sm:grid-cols-[7rem_minmax(0,1fr)] @sm:items-baseline @sm:gap-6 @xl:grid-cols-[10rem_minmax(0,1fr)]">
    <dt class="text-muted">Total revenue</dt>
    <dd class="font-medium tabular-nums text-foreground">$1,284,500</dd>
  </div>
  <div class="grid gap-1 @sm:grid-cols-[7rem_minmax(0,1fr)] @sm:items-baseline @sm:gap-6 @xl:grid-cols-[10rem_minmax(0,1fr)]">
    <dt class="text-muted">Phone number</dt>
    <dd class="text-muted">—</dd>
  </div>
</dl>
```

- **`<dl>` / `<dt>` / `<dd>`**, not built with `<div>`: screen readers announce correct label-value pairs.
- **`@sm:items-baseline`** aligns label baseline with badge or pill text: badges have `py-1` and are taller than plain text; top-aligning causes the label to misalign several px higher than badge text.
- **Fixed label column width** ensures all values align to a single left edge. If a label exceeds column width, wrap within its column rather than expanding the column to the longest label.
- **Container-query layout based on `<dl>` width (`@container`), not viewport.** A contact card might sit in a 22rem right column, a 448px panel, or a wide canvas; `sm:` only knows 1440px viewport, unaware the block only has 310px. Three tiers by container:
  - **Below 384px: stacked**, label above, value immediately below (`gap-1`), pairs separated by `space-y-3`. Internal pair gap smaller than between-pair gap ensures eyes group label with value. Right columns of detail pages and mobile screens land here.
  - **384–575px: `7rem` label** (slide-over panel, half-screen card). A 448px panel minus padding leaves ~400px: a `10rem` label consumes nearly half, crushing values into 3–4 lines.
  - **576px and above: `10rem` label.**

  Example: Contact card in right column, `<dl>` 310px, `sm:grid-cols-[7rem_…]` triggers on 1440px screen: values get only 174px, email breaks across three lines ("…thi@" / "logistics-" / "international.com"), address across four lines, label across two lines. Stacked layout in the same container: email and address take two lines. Automated probes flag "two-column label-value in narrow container". In Tailwind v3, `@tailwindcss/container-queries` is required; without it, pass layout props based on card placement (stacked for right columns), don't revert to `sm:`.
- **Values use `font-medium text-foreground`, labels use `text-muted`** (`T23`). Long values wrap and pin to top edge matching label (`items-start`), never `truncate`: this is where full details are read.
- **Values with an avatar (assignee) use `flex h-5 items-center gap-2`, not `inline-flex`.** `inline-flex` sits in the inline text flow, shifting the container by baseline alignment: row height becomes 24px instead of 20px, assignee name sits 1.5px lower than label, making the label visibly higher than the name (switching avatar to `size-5` still misaligns). `h-5` keeps the row matching a single text line, while `size-6` avatar extends 2px above and below into row gaps.
- **`[overflow-wrap:anywhere]` for values**: emails, URLs, long IDs lack spaces and won't naturally wrap, overflowing cards on narrow screens.
- **Email inserts `<wbr>` immediately following `@`**, allowing long emails to wrap at the username/domain boundary. `overflow-wrap:anywhere` is a safety net; on its own it breaks at arbitrary characters when space runs out. Example: adding a copy button shrinks value column by 28px, causing words to break mid-string.
  - **Emails inside prose sentences** (confirmation dialogs, toasts, "Waiting for confirmation..." copy): `<wbr>` alone is insufficient: domains with hyphens will break at the hyphen. Split email into two `inline-block max-w-full` chunks, breaking internally only when a chunk exceeds a whole line:

    ```tsx
    interface EmailTextProps {
      email: string;
      // Punctuation immediately following email ("." at sentence end, ","): belongs in trailing chunk, see below.
      suffix?: string;
    }

    function EmailText({ email, suffix }: EmailTextProps) {
      const atIndex = email.lastIndexOf("@");

      if (atIndex < 0) return <span className="wrap-anywhere">{email}{suffix}</span>;

      const localSegments = email.slice(0, atIndex + 1).split(".");

      return (
        // Entire email is a block: if it fits on one line, wrap as an intact unit, not breaking after "@".
        <span className="inline-block max-w-full wrap-anywhere">
          <span className="inline-block max-w-full">
            {localSegments.map((segment, index) => (
              <Fragment key={index}>
                {index > 0 && <wbr />}
                {index > 0 && "."}
                {segment}
              </Fragment>
            ))}
          </span>
          <span className="inline-block max-w-full">
            {email.slice(atIndex + 1)}
            {suffix}
          </span>
        </span>
      );
    }
    ```

    Use this shared component wherever emails are rendered, including value rows above.
  - **Punctuation immediately following email goes into `suffix`, not after the tag.** After an `inline-block`, browsers may line break; placing `<EmailText />.` in a sentence leaves the period starting a new line: "…company.com" / ". Switch account". Write `<EmailText email={email} suffix="." />`. Wrapping both in `whitespace-nowrap` is not permitted: it removes the line break opportunity after `@`. Probes flag this as "Punctuation dropped to start of line".
  - **Outer wrapper is also `inline-block max-w-full`.** If the outer wrapper is regular inline, browsers break immediately after `@` even when the email fits on one line: "You are signed in as alex.morgan.consulting@" / "company-studio.com. Switch account", looking disjointed. With `inline-block`, an email fitting the line wraps intact; only when longer than a line does it break after `@` (tested at 320, 375, 1280px).
  - **When local part before `@` exceeds a line, break before dots** (`<wbr>` before each `.`, as above). Without this, `wrap-anywhere` breaks at arbitrary positions, often stranding a lone "@" on a new line.
- **Empty values are `—` in `text-muted`**, a single convention for empty fields matching table cells (`layouts/app.md`, `T18`). Do not write "None", "No tags", varying per row.
- **Values with dedicated components use them instead of plain text**: status as colored badge (`M7`), category tags as pills (`M8`, `list-row.md`), currency formatted properly (`charts.md`), numbers `tabular-nums`, codes and IDs `font-mono` (`T17`).
- **Email is a `mailto:` link, phone number is a `tel:` link**, text remains `text-foreground`, underline on hover. Accompanied by a `size-7` `copy` icon button appearing on row hover, permanently visible on touch viewports (`I11`); on click, icon switches to `check` for 1.5s, no toast. **Touch target expands to 40px while visuals stay 28px**: `relative before:absolute before:-inset-1.5` (negative offset intentionally kept per `N11`, like slider handles in `range-slider.md`: enlarging to `size-10` narrows the value column by 12px and inflates row heights by 12px on mobile). A bare 28px button falls below 32px touch target standards. Rows with copy buttons are spaced 56px apart, preventing 40px targets from overlapping. Standard on detail pages and inspection panels; in confirmation forms and read-only summaries, keep plain text. **Do not duplicate these actions in the ⋯ menu** ("Call", "Copy email"): actions tied to a single value belong beside that value (`layouts/app.md`, "Record detail page").
- No divider lines between rows under 8 rows: whitespace separates sufficiently. Beyond 8, split into sections with subheadings, rather than ruling every row.

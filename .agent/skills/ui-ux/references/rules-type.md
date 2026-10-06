# Type — rule T

The single source for every rule about text. Specific font size numbers live in `budgets.md`.

---

## Font

**T1. `antialiased` on `body`.** One line, set once, and it changes the feel of
the whole page: text is thinner, cleaner, without the heavy look of default font rendering.

```html
<body class="antialiased">
```

**T2. One font family for the whole app.** Assign roles with weight and size, not with a second
font: headings `600`, body `400`, secondary labels `500`. `700` only for page-level headings and prices
on showcase pages (landing, pricing). Most product design systems use 600 for app headings (some
use 650–700); the skill picks 600 because 700 is heavier than the project's soft style.

`tracking-tight` **for text with diacritics only from `text-3xl` up** (a tightened `2xl` heading
runs words together: `Xác thực email` reads as `thựcemail`). Numbers without
diacritics, like the `text-2xl` figure in a stat card, can be tightened. `lg`/`xl`/`2xl` headings keep the default letter spacing: Vietnamese stacks diacritics two tiers high, and tightening
at these sizes makes the marks touch and narrows the space between words, so `Công ty` reads
as `Côngty`. Copy without diacritics has a different threshold (`T28`).

A second font may only be used for **headings on showcase pages** (landing
page, pricing, legal pages), and you must be able to say how it differs from the body font.
Once used, use it for **every page-level heading** (`h1` and each section's `h2`), not
only `h1`. Card names, plan names and questions in a list stay in the body font.
Not on the app's working pages.

**T3. The second font is never for numbers.** Prices, figures and metrics always use the body
font. A real bug: "99K" set in the heading font looked like a magazine cover.

**T4. Load exactly the weights you need, and know what you are loading.**

A real project loads 400 / 500 / 600 and **deliberately does not load 700**: 553 places in the repo declare
`font-weight: 700/800` under the old rule, and with no 700 face the browser draws with the
nearest face, 600, so the interface stays the same. The trap that comes with it: `.font-strong` sets
weight 900 but **does nothing**, because there is no face above 600.

Meaning: reading `font-weight` in code does not tell you how heavy the text will be. You have to
know which faces the font has loaded.

**T5. Check Vietnamese diacritics before settling a font.** The font must have the
`vietnamese` subset. A dot-below and a tilde stacked on one letter is a bug that only shows in real text,
not in "Lorem ipsum". See `brand-tokens.md`. If the app has no Vietnamese copy,
skip this rule (`T28`).

---

## Size scale

**T6. The default font size in an app is the small size, not the landing page size.**
`text-sm` is the default, `text-xs` for captions. Numbers in `budgets.md`.

**T7. No inline pixel font-size outside the token scale.** When you see a
`style={{ fontSize: 13 }}`, move it to the nearest step; do not let it live.

**T8. A block's heading must be larger than the largest text inside the block, by at least one step.**

A card heading `text-base font-semibold` means items inside are at most `text-sm`. If they are
equal, the eye cannot tell which is the block's label and which is content, and the whole block looks
flat.

Same principle for weight: block heading `600`, items inside at most `500`.

The full hierarchy of an app page: **page name > block heading > card name**.

**T9. Detail pages of repeated content do not use hero size.**

Opening an article, a course or a product, the title should be **exactly the size of its title
in the list**, not one step up. Jumping sizes feels like "big text"
compared with the content below (settled).

Hero size is reserved for real showcase pages.

---

## Line breaks

**T10. Do not leave a single orphan word on the last line.**

A heading that wraps and leaves one word stranded on the line below looks like a bug. Worse
is **splitting the meaning**: a phrase like "log in now" broken into "log" on the line above and "in now" on the line
below trips the reader.

How to fix, in order:

1. **`text-balance`** for headings and short lead sentences — the browser balances the lines itself. This is a safety net that is correct at **every** width, not a patch for one width. For long paragraphs use `text-pretty`, because Chrome ignores `balance` beyond ~6 lines.
2. Widen `max-w-*` so the sentence fits exactly one line on desktop.
3. `&nbsp;` between the last two words — only when the two methods above are not enough.
4. Shorten the sentence. This is often the most correct fix.

Not only headings: **two- or three-line descriptions in narrow columns** (vertical steps, sidebar, small cards,
description under a modal title) are hit most, because the column is fixed, so a line that falls short falls short on
every screen. Every description that can wrap gets `text-pretty`, including `line-clamp-2` names in
row lists and cards (`line-clamp` does not balance lines itself). The probe reports "Orphan word on the last line".

**`text-balance` only for text standing alone on its row.** Text sharing a row with an icon
or a trailing button (an accordion question with a chevron, a list row with an arrow, a name with
a badge next to it) uses `text-pretty`, even when it is an `h3`. `balance` evens out every
line, so the first line is cut short too: the sentence wraps at half a row while there is still room,
and the chevron drifts away across empty space. `pretty` keeps the first line full and only prevents the orphan
at the end.

Check at real widths, especially 375px: orphans only show at a few widths.

**T11. No line of text longer than 75 characters.** Every text block has a `max-width`.

**Limit at the outer frame, not on a child element inside a full-width block.**
Accordion answer, description line in a row with a background: `max-w-*` on the element itself makes
the child fall short of its wrapper, and if anyone adds a background an empty patch shows on the right
(`<p>` `max-w-[65ch]` 55px short). Narrow the whole frame until
the longest line is ≤ 75 characters.

**The 75-character ceiling is for paragraphs of 3 lines or more.** Short text read in one breath (a 1–2 sentence
FAQ answer, a one-line description) does not count: do not narrow the whole frame for it, or the heading in the same
frame will wrap while the row still has room.
Full-width cards count too.

**Vietnamese text: `max-w-[55ch]` ≈ 75 characters**, at every font size. `ch` is the width of the digit "0" (~9.5px at
14px), while an average Vietnamese character is only ~6.8px, so `max-w-prose` (65ch) holds ~90 characters and
`max-w-2xl` at `text-sm` holds ~99. Use `ch`, not `max-w-lg`: it scales with font
size, and it avoids the trap of an overridden `--container-*` scale (`tailwind-v4-traps.md`).

**T12. Long text is always left-aligned.** Do not centre everything.

---

## Truncation

**T13. `min-w-0` on every flex and grid item that holds dynamic content.**

Flex items and grid items default to `min-width: auto`, meaning they **refuse to shrink below
their content**. One number `1.284.500` or one long name is enough to make the column grow,
the grid grows with it, and the whole page overflows horizontally.

This is **the number one cause of horizontal scroll bugs**, and it only shows on narrow screens.

**T14. One-line titles are truncated, explanatory sentences wrap.**

Text in dense lists (table rows, sidebar) uses `truncate` with `min-w-0`. Item names in
grid cards use `line-clamp-2`, not one-line truncation (`N12`). But description lines
wrap, do not truncate them — a truncated description loses its reason to exist.

**File names are truncated in the middle, keeping the extension**: "Revenue-report…quarter-3.xlsx", because the extension says the file
type. **The kept part is the last few characters of the name (about 8) plus the extension**, not just the extension:
cutting right at the dot makes `…` stick to `.xlsx` as four dots "revenue-q….xlsx", which reads like a
typo, and also loses the end of the name, which is usually what tells versions apart
("…quarter-3", "…final"). Operating system file managers truncate this way. The `…` **sticks directly** to the kept part, with no space before the extension
("Revenue repo… .xlsx" next to "Annual summary report….pdf" is two styles in the same tree).

**In a line joining several pieces, the thing used for comparison goes before text that may be long.** "Type · area"
where the type is free text the poster typed means a long type pushes the area behind the `…`, losing exactly the number
the user uses to choose ("Duplex loft double-height fully
furnished… " swallows "210m²"). Put the short, fixed piece first ("210m² · Duplex…"), or split into
spans: the piece to keep gets `shrink-0`, only the long piece gets `truncate`.

**Only show the full name when it is really truncated.** Compare the real width before attaching `title` or a tooltip. **Measure with `Range`, not with `scrollWidth > clientWidth`**: those two numbers round to integers, so text 182.4px wide in a 182px frame gives 182 for both, and the browser still truncates a word to "q…" while the comparison says nothing is cut. How to measure: `range.selectNodeContents(el)`, compare `range.getBoundingClientRect().width > el.getBoundingClientRect().width`;
attaching it to every row makes short rows pop a bubble too, which is noise. That bubble
also must not cover the next row (`N8`).

**T15. Button labels must not be `white-space: nowrap`.**

Vietnamese button labels are fairly long (`Gia hạn / Đổi gói`, `Tham gia cộng đồng`). With
`nowrap`, when the container is narrower than the label the button cannot shrink — it either overflows,
or the text spills out of the pill when capped by `max-width`.

Measured in a real project: a 140px box, the old button 192px wide, **60px overflow**.

The correct recipe: `white-space: normal` + `line-height: 1.25` (so two lines do not
stick together) + `overflow-wrap: anywhere` (breaks URLs and long codes too) + `max-width: 100%`.

---

## Numbers

**T16. Numbers in columns use `tabular-nums`.** Data tables, money columns, percentage columns —
without it digits have different widths and the column jumps around when data changes.
Times and dates stacked along one edge (time column to the right of a timeline, history) are number columns too.
**The font must have `tnum` for the class to work.** Check by measuring "1" and "4": if their widths differ,
the font does not apply it (Be Vietnam Pro from Google Fonts: "1" 4.6px, "4" 8.5px).
A right-aligned column off by a few px on the left edge is acceptable; for money and number tables tell the user
in one line at delivery; changing the font is their call (`N10`).
**An amount with its unit is one unbreakable block**: `whitespace-nowrap` on the whole `128.900.000 đ`.
In a two-ended label–value row (`flex justify-between`, like a Payment block) the money value gets
`shrink-0`, the label `min-w-0` shrinks and wraps; a label with a secondary part uses `&nbsp;` so it breaks after
the `·` ("Subtotal&nbsp;· 1&nbsp;item" gives "Subtotal ·" / "1 item"). Reversed (label
`shrink-0`, value `wrap-anywhere`), at 375px the `đ` drops to its own line; adding only
`nowrap` while the label still does not shrink makes the `đ` overflow the frame.

**T16b. Relative time always comes with absolute time.** "5 hours ago", "28 minutes ago"
are easy to read but cannot be used for cross-checking. Wrap in `<time datetime>` and give a `title`
with the full time ("14:32 · 22/09/2026"), so hovering tells you exactly. System logs,
order timelines and activity logs show absolute time directly, not relative:
there people are cross-checking timestamps, not skimming.

**In lists, timestamps in the current year drop the year**: `08:30 · 16/09`, not
`08:30 · 16/09/2026`. Ten rows with the same `/2026` tail is one idea repeated ten times, and the time column gets
almost half again as wide.
A different year is written in full `16/09/2025`; `title` and `datetime` are always full. English copy
writes the month as a word (`T28`). **Trap:** `Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' })` without the year gives `23-09` with a hyphen, not `23/09`; join day and month with `/` yourself. Dropping the year for
timestamps in the current year is what common time display components do ("Sat, 31 Dec" but "Wed, 26 Aug 2021"). A timestamp standing alone as a data field ("Created" in a label-and-value block) keeps the full year.

**Timestamps in the middle of a sentence are written as speech, without the `·`.** `08:30 · 16/09` is the style of
columns and secondary lines; in a sentence it reads as two loose pieces: "Expected to reopen at 23:30 · 26/09/2026."
Write "at 23:30 today", "at 23:30 tomorrow", "at 08:00
on 28/09"; the year only when it differs from this year. Still wrap in `<time datetime>` with the full timestamp.

**T17. Codes and identifiers use `font-mono`.** Order IDs, tracking numbers, discount codes, IDs,
even in the middle of a descriptive sentence. It says
"this is something to copy exactly", not text to read.

---

## Copy

**T18. No em dashes in prose, in any language.** It immediately shows an AI wrote it (`T28`).

This rule is about **prose**. Empty cells in a table or a label-and-value
block show `—` in `text-muted`: that is a "blank" symbol, not punctuation, and
use one symbol for every empty cell in the app (do not dodge `T18` by writing
"None yet", "No label yet", a different phrase per cell).

**T19. No emoji in headings, greetings, or as icons.** Icons follow `F15`.

**T20. No redundant instruction text.** If the button already says "Save", do not add a "Click to
save" line. Do not write text that repeats what an icon already says: with a tick mark, drop the "Yes"
next to it.

**T21. No badges like "✨ AI-powered", "🚀 Fast", "New!".**

**T22. A secondary line under a button must carry information specific to each item.** If three lines are
identical, drop all three.

**T23. Label : value means grey label, strong value, on one line.** "Order date:
Wednesday 14/09". Do not wrap, do not give the label the same colour as the value.

---

## Language

**T24. Settle the copy language **before** writing the first label.** Find it yourself; only ask
when you find a conflict:

| Found | Follow |
| --- | --- |
| Has i18n (`locales/`, `messages/`, json with `en` / `vi` keys) | Follow it, and put strings in the right i18n file — do not hard-code them in JSX |
| No i18n but there are existing labels in code | Count which language the existing labels are in, follow that |
| Empty project, no labels yet | Follow the language the user is speaking to you |
| Codebase mixes two languages | **Ask one question.** A wrong guess here means redoing every label, not fixing one line |

**Mixing two languages on one screen is worse than picking the wrong language.** A Vietnamese "password" label next to
"Sign in" reads as unfinished work. Picking the wrong language is at least consistent.

**T25. A placeholder only exists when it says something the label has not.**

**Default: no placeholder.** "Enter your email" under the label "Email" copies
the label, one idea said twice (`T20`, `N3`). Large apps leave it empty.

Placeholders exist in two cases:

| Case | Placeholder |
| --- | --- |
| A hint about **content** the label has not given | Title → "Briefly describe the task"; Description → "Note the requirements and what done looks like" |
| A non-obvious **format**: phone, date, tax ID, licence plate | An example in the right shape: `0901 234 567`, `31/12/2026` |

- **No fake examples for formats everyone knows** (email, full name, password): `name@company.com` is misread as pre-filled text, especially on mobile.
- **Some fields having one and others not in the same form is normal.** Do not force "the whole form must be consistent": it drags a label-copying sentence into every field.
- A placeholder **cannot replace the label**: it disappears when you type.
- **Exception: standalone sign-in and sign-up screens** get a short instruction placeholder
  ("Enter email"), see `layouts/form.md`. The whole page has only a few fields, and completely empty fields look
  unfinished.

**T26. Password fields do **not** use dots as a placeholder.**

`••••••••` looks **exactly like a typed password**. The user cannot tell whether the field is
empty or filled — this is the worst case of the bug `T25` warns about, because the two
look absolutely identical, not just similar.

And nobody counts dots to guess the minimum length. Eight dots and nine dots
look the same.

**The minimum length is a **hint**, written in words**, placed on the hint line under the field (see
`layouts/form.md`):

```
Password
[ Enter your password                👁 ]
At least 8 characters
```

This hint shows **from the start**, not only after a mistake. Saying it up front in one sentence is cheaper
than making people finish typing and then telling them it is wrong.

---

## Reply language and non-Vietnamese copy

**T27. Talk to the user in the language they are writing. UI text follows `T24`.**
These are two different languages, settled separately:

| Thing | Follows |
| --- | --- |
| Analysis, questions, delivery messages (`S15`) | The language the user is writing in this turn |
| Toolbar, reason panel, feedback sentences of the wireframe (`design-process.md`) | The language the user is writing, as above |
| Code comments | The language of existing comments in the project; an empty project follows the user |
| Labels, placeholders, error messages, sample data on the UI | `T24` |

If the user writes in English and the project has Vietnamese labels, reply in
English, labels stay Vietnamese. Do not ask.

**Sample sentences in the skill are idea templates, not sentences to copy.** The skill is written in
English, so the delivery sentences are English: *"X has no approved pattern yet, so I borrowed
the Y pattern"*, *"say if you want it different"*. If the user writes in another language, translate the idea,
not the words. One English sentence slipping into a reply in another language reads as
the skill doing a half job.

Example labels in the skill work the same way: they are ideas, not words. English copy uses
the labels English apps all use, not a word-for-word translation (same reason as "Remember
me" rather than a literal "Remember login" in `layouts/form.md`):

| Literal translation | English copy |
| --- | --- |
| Delete filters · Delete search | Clear filters · Clear search |
| See all 12 orders | View all 12 orders |
| Status: All · 32 | Status: All · 32 |
| Remember login · Forgot password? | Remember me · Forgot password? |
| Log in with Google | Continue with Google |
| Cancel · Undo · Already saved | Cancel · Undo · Saved |
| Copy · Already copied | Copy · Copied |

**T28. Some rules only hold for Vietnamese text.** For non-Vietnamese copy, change them
according to the table below. Every other rule in the skill applies to every language.

| Rule | Vietnamese copy | English copy |
| --- | --- | --- |
| `tracking-tight` letter tightening (`T2`) | From `text-3xl` | From `text-2xl`: no two-tier stacked diacritics |
| Font diacritic check (`T5`) | `vietnamese` subset required | Skip, unless the app also has a Vietnamese version |
| Money (`components/charts.md`) | lowercase `đ` after the number, number formatted with `Intl.NumberFormat('vi-VN')` | `Intl.NumberFormat(locale, { style: 'currency', currency })`: `$1,280.00`, symbol and position by locale |
| Decimal and thousands separators | `12,4%` · `1.280` | `12.4%` · `1,280` |
| Timestamps in lists (`T16b`) | `08:30 · 16/09` | Month as a word via `Intl.DateTimeFormat`: `Sep 16, 8:30 AM`. Do not use `09/16`: the US and UK read it in opposite orders |
| Avatar initials (`components/avatar.md`) | One letter | Two letters, first name and last name initials: `Jane Doe` → `JD`. English apps all do this |
| First day of the week in calendars (`components/choice-controls.md`) | Monday, `T2 … CN` | By locale: `en-US` Sunday, `en-GB` Monday |
| Plurals | Vietnamese does not inflect | Must inflect: `1 member` · `2 members`. Use `Intl.PluralRules` or the i18n function, do not hard-code string joins |

`T15` (button labels may wrap) and `T18` (no em dashes in prose) **apply to
every language**. German labels are even longer than Vietnamese ones, and an em dash in an English
sentence is the most recognisable sign of AI writing.

**T29. English copy is written in sentence case.** Buttons, labels, headings, tabs, menu items:
capitalise only the first letter and proper nouns. "Create project", "Billing settings", not
"Create New Project". If the project uses Title Case (count labels as in `T24`), follow
the project.

- **One action, one word pair, across the app.** "Sign in / Sign out" or "Log in / Log out", not mixed. `Delete` removes for good, `Remove` takes out of a group: two different actions get two different words.
- **No "Please", no exclamation marks** in ordinary messages. "Project deleted", not "Your project has been deleted successfully!".

**T30. Multi-line prose uses `text-sm/6`; single-line text in controls keeps the default line height.**

Passages that can run to two or more lines (description under a modal title, confirmation dialog body,
banner description, a sentence on an empty state with a description) use `text-sm/6` (14px, 24px line).
Vietnamese text stacks diacritics two tiers high (`ệ`, `ở`, `ữ`): the default 20px line of `text-sm`
makes the marks of the lower line touch the descenders of the line above, and the passage reads dense. Single-line text in buttons, inputs, table rows, menu items and badges keeps the default
line height: there the control decides the height, and a taller line makes the button swell. The gap between a heading
and the description right below it is `mt-2` (8px), not `mt-1`.

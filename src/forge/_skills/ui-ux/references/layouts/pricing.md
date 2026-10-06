# Pricing

> ⚑ Drawn from a real build (a course pricing page with 3 plans).

**One default layout, build it directly.** If the user wants another style (merged into one block,
buttons on top, a comparison table, the featured plan marked with a border instead of inverted colours…) they will say so, and you adjust. Do not lay out
options.

This is a showcase page, **prices always use the body font** (`T3`).

---

## Page header

**Centred**, page name at hero size, a one-sentence lead line. Almost every standalone pricing page
does this: with three symmetric cards below, a left-aligned header makes the whole page
lean to one side. This is an exception to `T12`, only because the text is short (one-line name, lead line
at most two lines).

```html
<header class="text-center">
  <h1 class="text-balance font-heading text-2xl font-bold text-foreground sm:text-3xl">…</h1>
  <p class="mx-auto mt-3 max-w-[55ch] text-balance text-sm/6 text-muted sm:text-base/7">…</p>
</header>
<div class="mt-8 sm:mt-12 …"><!-- plan row --></div>
```

- **Page name `sm:text-3xl`, not `2xl`.** The price is `3xl`; a `2xl` page name
  (24px) above three 30px numbers leaves the page headless, and the eye jumps straight to the price
  without knowing what it is looking at. A page name the same size as the price is enough: it
  stands alone, centred, in the heading font, and needs nothing bigger.
- A pricing page **inside the app shell** (Settings → Plans) does not follow this section:
  page name `xl`, left-aligned like every app page (`budgets.md`).

---

## Layout

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Name     │ │ Name[bdg]│ │ Name     │  1 name, featured badge on the right
│ desc     │ │ desc     │ │ desc     │  2 exactly 1 sentence
│ PRICE /mo│ │ PRICE /mo│ │ PRICE /mo│  3 price + unit on one line
│ sub-line │ │ sub-line │ │ sub-line │  4 the price's conditions
├──────────┤ ├──────────┤ ├──────────┤    divider bleeds to the card edge (F25)
│ Includes:│ │ All in…  │ │ All in…  │  5 list heading
│ ✓ ...    │ │ ✓ ...    │ │ ✓ ...    │  6 features
│ – ...    │ │ ✓ ...    │ │ ✓ ...    │
│ [button] │ │ [BUTTON] │ │ [button] │  7 button, always at card bottom
└──────────┘ └──────────┘ └──────────┘
```

The cards are equal in width and height. Rows across cards are aligned with `subgrid`,
not reserved with `min-h-*` (guessing text length fails right away in the `S8` case):

```html
<div class="grid gap-4 lg:grid-cols-3">
  <!-- row-span-7 = number of rows in the diagram. Add a row and change both numbers. -->
  <!-- The card has VERTICAL padding only, each row has its own px-7: the line under the price bleeds to the edge by itself, no negative margin (N11). -->
  <article class="row-span-7 grid grid-rows-subgrid gap-y-0 rounded-2xl border border-border bg-surface py-7 *:px-7">
    …
  </article>
</div>
```

Every plan has all 7 rows. If the sub-line is missing, leave an empty element; do not drop it.

**The line between the price part and the feature part is drawn with `--border-strong`**, bleeding to the card edge
(`F25`): `border-t border-border-strong` on the list heading row. The card has only
vertical padding (`py-7`), the horizontal padding is on each row (`*:px-7`), so the line touches both
card edges by itself; no `-mx-7` (`N11`).
Same reason as the "or" divider in `form.md`: `--border` (`#f7f7f8`) alone
on a white card is only 1.06 : 1, the line vanishes, and the card reads as one solid block of text. The card's outer border stays `--border`: a white card on a grey page background
already separates itself.

Narrow screens: one column below `lg`, keep the cheap-to-expensive order, and **cap the width when
stacked**: `mx-auto max-w-lg lg:max-w-none`. Without a cap, at 768px each card is
650px wide: the feature list takes the left third, the rest is empty, and a 615px
button looks like a horizontal bar. A plan card is read vertically; about
~500px wide is right, as when they stand side by side on wide screens.

```html
<div class="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-4 sm:mt-12 lg:max-w-none lg:grid-cols-3">
```

---

## Row by row

| Row | Do | Don't |
| --- | --- | --- |
| Name | `text-lg font-semibold`, at most about 3 words | As large as the price. This is a **deliberate exception to `T8`**: the price is read first |
| Description | Exactly 1 sentence, every plan has one | Some plans with, some without |
| Price | `text-3xl font-bold tabular-nums`, unit `/month` on the same line, `baseline` aligned. A free plan says "Free" | "0 VND" |
| Sub-line | The plan's own conditions (`T22`), **fits one line**: "Billed yearly: 990,000 VND/month" | A long sentence split in the middle of a number (`T10`) |
| List heading | "Includes:" on the lowest plan, "Everything in Pro, plus:" on higher plans. `text-sm text-muted` | "All Pro plan benefits" written as a checked item |
| Features | Line check, lucide `Check` `size-4`. Items not included: `Minus` + `--muted` text. Numbers first: "4 one-on-one sessions per month" | Filled round checks, faded checks for items not included |
| Button | Full card width, **`h-12`** at every width, text `text-sm font-medium`. Text is verb + plan: "Get the Pro plan" | Three buttons all saying "Choose plan". The app's `h-10` button |

**`h-12` button, not `h-10`.** This is the main action of the whole page, at the bottom of a card
~520px tall under a 30px number: a 40px button looks thin, like a secondary toolbar button (the maintainers
found it "a bit short"). The same exception as the standalone sign-in form
(`form.md`): when the screen has only one job, that job's button is one step larger.

---

## Featured plan: inverted card + badge

1. **Dark card**: `bg-primary`, text `text-primary-foreground`. Features, name,
   price and checks are all `text-primary-foreground`; secondary text (description, `/month`, sub-line,
   list heading) `text-primary-foreground/70`; the line under the price
   `border-primary-foreground/15`. The card border matches the background.
2. **Badge** at the right of the name row: `rounded-full px-2.5 py-1 text-xs font-medium
   bg-primary-foreground/15 text-primary-foreground`, with text stating the reason ("Most popular").
   No emoji, no stars (`T21`).
3. **The button inverts with the card**: white background, dark text,
   `bg-surface text-foreground hover:bg-surface/90`. If the project restores the focus ring (`I14`), use
   `focus-visible:ring-primary-foreground/60 focus-visible:ring-offset-primary`: the default offset
   is `--surface`, which on a dark card becomes a stray white ring.

```html
<article class="… rounded-2xl border border-primary bg-primary py-7 text-primary-foreground *:px-7">
  <div class="flex items-center justify-between gap-3">
    <h2 class="text-lg font-semibold">Pro</h2>
    <span class="rounded-full bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium">Most popular</span>
  </div>
  <p class="mt-2 text-sm/6 text-primary-foreground/70">…</p>
  …
  <button class="h-12 w-full cursor-pointer rounded-xl bg-surface text-sm font-medium text-foreground outline-hidden hover:bg-surface/90">Get the Pro plan</button>
</article>
```

**Why invert.** With only a badge + a primary button, the three white cards are identical, and
the eye has nowhere to rest (the maintainers found it "not wow yet"). Three approaches compared: badge + button only (flat, no plan stands out), a 1px `--primary` border around the
card (stands out, but only on a close look), an inverted card (seen at once from afar, still flat:
no shadow, no scaling). The inverted card is the most common approach on pricing pages that use
neutral colours. Secondary text `/70` on `#181818` measures ~8:1; if `--primary` has a hue, measure again,
and below 4.5:1 go up to `/80`.

Do not make the card taller, bigger, glowing, shadowed or `scale-105` (`F20`, `F22`): the background colour
is enough. If the request has no plan to push, all three cards are white, no badge.

The other plans' buttons: **`--secondary` background**, no border
— variant `secondary` in `../components/button.md`. A full-card-width button with only
a thin border looks empty.

---

## Brand colour

The accent colour lives only on **the featured plan's card**. Everything else is neutral (`M2`, `M3`).

| Item | Follows `--primary`? |
| --- | --- |
| Featured plan card background | Yes. The badge and button inside follow the card (section above) |
| Checks, prices, plan names on white cards | No. Coloured checks across the row mean the featured plan no longer stands out; an accent-coloured price reads as a link, and bright colours fail contrast too (`P3`) |
| Other plans' buttons | No |

---

## Things not to build unless the request mentions them

- **Monthly/yearly toggle.** If there is a yearly price, write it on the sub-line under the price. If the request mentions a yearly discount without giving numbers, ask for the numbers, do not invent them (`S7`).
- **FAQ** (`S1`). If present, build it per the "Frequently asked questions" section below.
- **Comparison table** (`S1`).

---

## Frequently asked questions

**Accordion inside ONE white frame, all closed on page load**, one centred column.
People come to the pricing page to choose a plan; the FAQ is where they look things up when still stuck, so they only need to see
the list of questions and open the one they click. Fully expanded, the FAQ is nearly as long as the plan row
(the maintainers found it "all spilled out"). Most pricing pages use an accordion
here. This is an exception to `I17`: the FAQ on a pricing page is always an accordion, even with fewer than 6 questions.

Each question is one accordion item, built exactly per `../components/accordion.md` (padding,
motion, hover, frame and checks all live there). The pricing-page-specific part:

```tsx
// faq-section.tsx
<section className="mx-auto mt-16 max-w-3xl sm:mt-20">
  <h2 className="text-center font-heading text-xl font-bold text-foreground">Frequently asked questions</h2>

  <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
    {faqItems.map((item) => (
      <AccordionItem key={item.question} title={item.question}>{item.answer}</AccordionItem>
    ))}
  </div>
</section>
```

- **A centred `max-w-3xl` frame**, wide enough for the longest question to fit one line on desktop. Do not use
  `max-w-lg` (512px, chosen so answers stay ≤ 75 characters): the question "I'm on the Self-study plan;
  if I move up to Pro, do I lose what I've already studied?" wraps while the row still has room, and the frame
  is only half the width of the card row. Measured:
  `max-w-2xl` question on one line, answer 2 lines ~89 characters; `max-w-3xl` both on one line.
  FAQ answers are 1–2 sentences read in one breath, not paragraphs, so the `T11` cap does not apply.
- **Heading `font-heading font-bold`, centred, same typeface as the page name.** When a showcase
  page has a heading font, every page-level heading (`h1`, each section's `h2`) shares it;
  leaving the `h2` in the body font gives the page two large headings in two typefaces. Plan
  names and questions stay in the body font (`T2`).
- **`mt-16 sm:mt-20` from the plan row**: a different part of the page, not a fourth card.
- **All closed on page load.**

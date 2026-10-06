# Tailwind v4 traps — rules W

Open this file when the project uses **Tailwind v4** and **already has legacy CSS**. This kind of bug
does not fail the build, gives no warning, shows no red squiggle in the IDE — and cannot be grepped
unless you know in advance what to grep for.

---

## W1. Tailwind v4 emits the **entire** default theme into `:root`

**Not** only when you use a utility. The built CSS already contains about 140 variables:
`--color-*`, `--spacing`, `--blur-*`, **and `--text-*`, `--shadow-*`**.

If the project's legacy CSS uses **the same variable names** — very common, `--text-sm` is a name
everyone picks — then **two systems compete for one namespace**.

Consequence: removing an override in `@theme` does not only change new code, it also changes **every
place the legacy CSS reads that variable**. In a real project the number was **3,419 places**.

**Rule: before adding or removing any declaration in `@theme`, count how many
places read that variable name.**

```bash
for v in text-xs text-sm text-base text-lg text-xl; do
  echo "$v: $(grep -rho "var(--$v)" --include='*.css' --include='*.tsx' . | wc -l)"
done
```

---

## W2. `@theme` cannot point at itself

```css
/* WRONG — @theme also emits --text-sm, which makes a loop */
@theme { --text-sm: var(--text-sm); }

/* RIGHT — when the name is the same, write the REAL VALUE */
@theme { --text-sm: 15px; }

/* RIGHT — with a different name, point freely */
@theme { --color-brand: var(--brand-green); }
```

**Design consequence:** for the group of clashing names, `@theme` **must** be the single place of
definition. Remove that block from the old token file, do not keep two places — two sources drift apart
without anyone noticing.

---

## W3. Legacy CSS variables in a Tailwind namespace = silently broken utilities

A follow-on from `W2`, but more dangerous because it **reports no error at all**.

In a real project, the old token file had:

```css
:root { --container-md: 720px; --container-lg: 1040px; --container-xl: 1200px; }
```

`--container-*` is exactly the namespace Tailwind v4 uses for the `max-w-*` scale. The old tokens
were loaded in `layer(base)`, `@theme` emits into the `theme` layer — **base beats theme**.
Result: **every `max-w-md/lg/xl` in the whole project ran with the wrong value**, and nobody knew:

| Class | Should be | Actual |
| --- | ---: | ---: |
| `max-w-md` | 448px | 720px |
| `max-w-lg` | 512px | 1040px |
| `max-w-xl` | 576px | **1200px** |

It only surfaced when the maintainers looked at a screenshot and asked *"why doesn't the input get shorter?"* —
the code had `max-w-xl`, the DOM had `max-w-xl`, and the field was still full width.

Outcome: all 3 tokens + 3 accompanying classes were deleted, because grep found **0 uses** in the whole
project. **Dead code, and it still managed to break the entire `max-w-*` scale.**

### How to detect

Grep the **built** CSS file for variables declared twice:

```bash
curl -s "<url-css-bundle>" | grep -o -- "--container-xl:[^;]*;"
# 2 lines = something is overriding it
```

### Namespaces to avoid when naming variables in legacy CSS

```
--color-*  --font-*  --text-*  --spacing-*  --breakpoint-*  --container-*
--radius-*  --shadow-*  --tracking-*  --leading-*  --ease-*  --animate-*
--blur-*  --aspect-*
```

⚠️ Distinguish two cases:

- Matching a name Tailwind **already has** (`--container-xl`) → **overrides, silently broken**.
- Only **adding** a new name in that namespace (`--font-heading`, `--shadow-focus`) → harmless, it just generates a new utility.

Scan once and classify each one, do not rename in bulk.

---

## W4. Without a border colour class, Tailwind v4 leaves `border-color: currentColor`

A button with black text and a forgotten border colour gets a **near-black border**, not a light one.

When you see an unusually dark border, check this first, do not go and edit the hex code of the
border token.

---

## W5. Radius must sit exactly on a step of the active scale

Without overriding `--radius-*`, `rounded-*` runs the built-in scale: 4 / 6 / 8 / 12 / 16
/ 24. The project's radius tokens **must sit exactly on those steps**, otherwise every
block refactored to utilities changes shape slightly without anyone intending it.

In a real project we had to fix: `9px → 8px`, add a `4px` step, and **delete the `22px` step** because
no Tailwind step matches it.

In the same pass: every `border-radius` hard-coded in the legacy CSS was mapped to tokens — no more
scattered 1 / 3 / 5 / 7 / 9 / 10 / 14 / 18 / 20 / 22px.

---

## W6. iOS Safari auto-zooms inputs with `font-size` below 16px

And it **never zooms back out**. Force 16px on narrow screens to prevent it:

```css
@media (max-width: 768px) {
  input, textarea, select { font-size: 16px !important; }
}
```

`!important` is truly needed here: it must beat even inline `style={{ fontSize }}`
scattered through composers and editors. This is one of the very few places
where `!important` has a legitimate reason — and that reason must be written right above it.

## W7. Tailwind v4 gives `<button>` an arrow cursor, not a hand

v3 made `<button>` show a hand. **v4 changes preflight back to `cursor: default`**, matching
the browser's native behaviour. `<a href>` is still a hand.

So within **the same menu**, items that are `<a>` show a hand while items that are `<button>`
(for example "Log out") show an arrow. The user moves the mouse down the menu and sees the cursor
flip back and forth, while the code looks fine everywhere.

Two ways, pick one for the whole project:

```css
/* Option 1: restore v3 behaviour for the whole app — one place, nothing missed */
@layer base {
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]) {
    cursor: pointer;
  }
}
```

```html
<!-- Option 2: write it explicitly on each button -->
<button class="cursor-pointer">…</button>
```

**Option 1 is safer when refactoring**, because you do not have to chase every button. Option 2 fits
when the project already writes `cursor-pointer` everywhere. Do not mix the two: half the project relying
on base and half written by hand means that when one is removed, you will not know which places still
depend on it.

**How to detect:** `package.json` has `"tailwindcss": "^4`, and grep finds
`<button` without `cursor-pointer` while the base CSS has no
`cursor: pointer` line either.

---

## W8. `ring-*` has only one shadow layer

`ring-1`, `ring-2`, `ring-inset` all write to **one** shadow layer (`--tw-ring-shadow`). The skill
draws no focus ring (`I13`), so they usually do not collide. If the project brings the focus ring back (`I14`),
state borders (selected, switched on) are drawn with `inset-ring-*` (v4's separate shadow layer) or
`border`, not `ring-*`; `ring-*` is reserved for the `I14` focus ring. With a selection border in `ring-*`,
tabbing to it makes the focus ring **replace** the selection border instead of adding to it.

## W9. If the project does not load preflight, every control keeps the browser's styling ⚑

Preflight is Tailwind's reset, bundled with `@import "tailwindcss"`. Some projects load only
`tailwindcss/theme.css` and `tailwindcss/utilities.css` (usually to avoid overriding legacy CSS). Then
inputs still have a 2px inset border, buttons have a raised border and grey background, `<select>` is the browser's
native select, `ul` has bullets, and `h1`, `p` have default margins.

**How to detect** (run during the audit, `SKILL.md` question 2):

```bash
grep -rn '@import "tailwindcss' --include='*.css' . 2>/dev/null | grep -v node_modules
# only theme.css / utilities.css, no `@import "tailwindcss";` line or preflight.css = no reset
```

**What to do:**

- Write "no preflight" in the `Audit:` line.
- **Do not turn preflight on for the whole app yourself**: it changes the look of every page at once, and the project
  turned it off for a reason.
- Every control you build or edit **resets itself fully**: inputs and textareas get the token border (or
  `border-0` if the outer frame already has a border), background, `[font:inherit]`; buttons get `border-0` and their
  background; selects get `appearance-none` plus your own chevron. Miss one and that control carries
  browser styling in the middle of a styled page.
- The probe reports "Control still has the browser's default styling" (inset / outset border, grey border
  `#767676`, select `appearance: auto`).

Do not reset only buttons and lists: a forgotten input (like the chat box field) keeps the browser's
full black border.

## W10. `scale-*`, `translate-*`, `rotate-*` do not animate with `transition-[transform]` ⚑

Tailwind v4 writes `scale-95`, `-translate-y-1`, `rotate-180` into the **separate** CSS properties
`scale`, `translate`, `rotate`, not into `transform`. Write `transition-[opacity,transform]`
or `transition-[transform,color]` and those three properties **jump instantly**, only `opacity` and colour
animate: the menu shrinks to 95% and moves up 4px on the first frame and only then fades, which looks jerky; the accordion
arrow flips over instantly.

- Use `transition-transform` (v4 covers `transform, translate, scale, rotate`), or name them exactly:
  `transition-[opacity,scale,translate]`, `transition-[rotate,color]`.
- The probe reports the item "Scale / translate / rotate does not animate" (Broken severity).


## W11. `not-sr-only` resets `white-space` to `normal`, swallowing `whitespace-nowrap` on the same element

`not-sr-only` does not just undo `sr-only`: it rewrites `position`, `width`, `height`, `padding`,
`margin`, `overflow`, `clip-path` **and `white-space: normal`**. Write
`sr-only whitespace-nowrap @4xl:not-sr-only` and from `@4xl` the variant utility comes later in the
CSS, `normal` wins, and the text wraps again. Putting `nowrap` on the parent cell does not help either: the child has declared
`normal`, so it no longer inherits (the assignee column shrinks to 126px, "Nguyen /
Anh / Tuan" on three lines, table rows of jagged heights).

- Hide in the opposite direction: `whitespace-nowrap @max-4xl:sr-only` (widths where it is not hidden do not
  need `not-sr-only`). For the same reason, padding / margin declared on that element are also wiped by `not-sr-only`.
- The probe reports the item "Table text column is forced to wrap".

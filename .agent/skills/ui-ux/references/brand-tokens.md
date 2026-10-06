# Tokens and brand

Copy `references/tokens.css` into `globals.css` or `index.css`, then only edit
inside the blocks marked with comments:

- **Font**: one block in `:root`, shared by both light and dark.
- **Accent colour**: one block in `:root` for the light background, and if there is dark mode, **another block in `.dark`** for the dark background. Both must be edited.
- No dark mode: delete the `.dark` block entirely, do not leave it there as clutter.
- The `@theme inline` block maps tokens to Tailwind v4 classes (`bg-surface`, `text-muted`, `border-border-strong`, `ring-focus`…) and `--font-sans`. Copy it too; without it those classes are not generated. Not using Tailwind: delete it.

A near-black accent becomes near-white on the dark background. A hued colour takes a version about two steps
lighter than itself; do not reuse the light-background colour as is.

The default accent colour is `#181818`, near black. Neutral on purpose, because this skill builds
UI for many different people, and baking in one brand's colour would be baking in the wrong one.
Near black never clashes with any brand, and looks intentional rather than
unfinished.

Font: **Inter** for everything, headings and body alike. One font, roles split
by weight: headings `600`, body `400`, secondary labels `500` (`T2`). `tracking-tight` for accented text only from `text-3xl` up (`T2`).

One font is a deliberate choice, not a shortcut. Pairing two fonts and picking
the wrong pair is far worse than using one decent font, and most pairs are wrong. Dropping the font
and falling back to `system-ui` is still broken, so the font must always actually be loaded.

If the app has Vietnamese copy, then before settling on any replacement font, **check
Vietnamese diacritics before every other criterion** (`T5`, `T28`): many good-looking fonts break on letters with stacked marks (u-horn with tilde, o-horn with dot below, a-breve with grave) or let the marks collide
with each other. Inter has a full Vietnamese set.

How to load it depends on context:

- **Real project**: self-host via `@fontsource`, do not call out to Google Fonts.
- **Single HTML file, prototype, demo for grading**: `@import` Google Fonts directly. Ready-to-use line:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

`700` is only for page-level titles and prices on a showcase page (`T2`); the number in a stat card is
`font-semibold`. Do not load `800`: no rule uses it.

---

---

## `--primary-light` only works when the accent colour has a hue

A 5% background of an orange or a blue is still visible. A 5% background of a near-black
is just dirty grey, and a badge placed on it almost disappears.

| Accent colour | Badge background, avatar background, accent card | Text on it |
| --- | --- | --- |
| Hued (orange, blue, red...) | `--primary-light` | `--primary` |
| Neutral (default near black) | `--background` | `--foreground` |

With the default palette, follow the second row automatically. Seeing
`bg-brand-light` next to `text-muted` is certainly wrong: a dull pale background plus pale text,
unreadable.

---

## `--background-hover` and `--ring-focus`

These two variables exist because two other rules require them:

- Rule `M18` requires child elements in a row with hover not to match the row's hover background. A hovered row goes to `--background` (`I10`), so date cells, streak squares and empty cells in the row take `--background-hover`, one step darker, so they do not melt into the background. The secondary button hover is `--secondary-hover`, the row hover is `--background` or `--surface-hover`, not this variable.
- `--ring-focus` is a very faint ring in the accent colour, split out as a variable rather than writing `primary/10` everywhere. Used for **form fields on focus** (input, textarea, select) and **selected card-style choices**, together with the `--border-focus` border (`I13`). Buttons, menus and tabs do not use it.

When you change `--primary` to another colour, remember to change `--ring-focus` with it, because it is that same
colour at 10% opacity.

---

## `--primary-foreground`, do not hard-code `text-white`

On a light background the accent is near black, so the button text is white. On a dark background the accent
becomes near white, and `text-white` becomes white on white, and the text is gone.

Always use a token for **text colour on the accent background**:

```css
:root  { --primary: #181818; --primary-foreground: #ffffff; }
.dark  { --primary: #e9edf5; --primary-foreground: #05060f; }
```

In markup it is `bg-primary text-primary-foreground`, never
`bg-primary text-white`.

When you change `--primary` to another colour, also check `--primary-foreground`: a light accent
needs dark text, and vice versa.

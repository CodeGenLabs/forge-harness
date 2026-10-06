# Input

```tsx
const baseClasses = "outline-hidden transition-colors text-foreground placeholder:text-muted";

const variantClasses = {
  // Border width and color written together, matching outline buttons: `border border-border-strong`.
  default: "w-full h-11 md:h-10 bg-surface dark:bg-white/4 border border-border-strong rounded-xl text-base px-4 md:text-sm",
  ghost: "bg-transparent border-0 p-0",
};

const stateClasses = error
  ? "border-red-500 focus:ring-2 focus:ring-red-500/10"   // idle is red border only, halo only while typing/focused
  : "focus:border-focus focus:ring-2 focus:ring-focus";
```

**Why it works**

- Inputs always use `bg-surface`, never transparent. A transparent input on the page background makes it impossible for users to recognize it as an input field. This is a hard rule, even when the underlying library defaults to `bg-transparent`.
- **Focus = `--border-focus` border + soft `--ring-focus` ring with 2px width (`ring-2`)** (`I13`, settled). The ring must be soft enough to appear as an ambient halo, not a second hard border: do not increase `--ring-focus` opacity. Error inputs follow the same formula, switching to red. **Selects and comboboxes use the exact same styling**, including when open (`components/choice-controls.md`).
- **Border uses `--border-strong`, not `--border`.** An input shares the same white surface as cards, making the border the sole signal that "this is where to type". Card borders and dividers are decorative and can be subtle; input borders cannot (`M14`). This border is ~1.27:1, falling short of WCAG 1.4.11: an intentional tradeoff, see `P3` in `styles.md`.
- **Dark mode preserves borders**, switching background to subtle white overlay `dark:bg-white/4`. Removing borders (`dark:border-transparent`) and relying solely on faint background fill loses input boundaries; all major design systems retain borders in dark mode (`M32`).
- **Input borders and outline button borders must share the EXACT same class**, `border-border-strong`. Placing an input next to an outline button with a fainter input border means you mistakenly used `border-border`. After building, grep `border-border\b` in input, textarea, and select files: it must return 0.
- Error states follow the exact same formula, changing only colors: solid red border `red-500`, **halo `red-500/10` only while the field is focused**. Keeping halos on idle error fields produces three red signals per field (border, halo, message); four errors on a form cause red glare across the screen. **Error messages use `text-xs red-600`**, matching hint text size (`layouts/form.md`), not `red-500`: borders only need 3:1 contrast, but small text requires 4.5:1, and `red-500` on white is only 3.8:1. Without Tailwind, use `--error`, `--error-ring`, and `--error-text` in `tokens.css`.
- Radius `rounded-xl`, matching buttons so inputs and buttons align harmoniously side by side.
- **`text-base` on mobile scaling down to `md:text-sm`** — rule `R8`, applying to `textarea` and `select` as well.
- **`h-11 md:h-10`**: 40px on desktop, matching sidebar links and menu items; 44px on mobile for finger-friendly targets. Buttons in the same form adapt identically (`budgets.md`). Standalone login/signup forms may scale up to `h-12`. Do not use `h-12` as the default across the app: it looks clumsy and mismatches neighboring components.

---

## A complete field

Label, field, error copy. Three parts, with the label properly attached to the field per `I26`:

```tsx
<div className="space-y-1.5">
  {/* w-fit: without this, clicking empty space to the right of text also focuses the input */}
  <label htmlFor={id} className="w-fit cursor-pointer text-sm font-medium">
    {label}
  </label>
  <input id={id} className={...} />
  {/* Row below field is always present, min-h-4 matching a line of text-xs: showing or clearing errors never shifts fields below (form.md) */}
  <p className="min-h-4 text-xs text-red-600 dark:text-red-400">{error}</p>
</div>
```

`id` must be unique on the page. Duplicate `id` attributes cause any label click to focus only the first field. When rendering multiple fields, use `useId()`.

Placeholders follow `T25`: none by default, added only when conveying something the label has not stated. Conforming to the language settled in `T24`.

---

## Password field

Rules in `I27`. Relative wrapper, absolute button on the right, input padded with `pr-11`:

```tsx
const [isPasswordVisible, setIsPasswordVisible] = useState(false);

<div className="relative">
  <input
    id={id}
    type={isPasswordVisible ? "text" : "password"}
    className="... w-full pr-11"
  />
  <button
    type="button"
    onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
    className="absolute inset-y-0 right-1 my-auto flex size-10 cursor-pointer items-center justify-center rounded-lg text-muted outline-hidden hover:text-foreground"
  >
    {isPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
  </button>
</div>
```

- `type="button"`, not default `submit`.
- Button `size-10` pinned right with `right-1`, fitting neatly into input's `pr-11` (`I27`).
- **Vertical centering via `inset-y-0 my-auto` plus fixed size** (`size-*`), not `top-1/2 -translate-y-1/2` (`N11`). Applies to all icons and embedded buttons below. Both methods match pixel-for-pixel. Omitting size causes `inset-y-0` to stretch the button to full input height (40px button becomes 48px).
- Button lives **inside** the input, not an external "Show" text button beside it — external buttons misalign the form row relative to neighboring fields.
- Button has no background or border. It is a secondary internal action, brightening to foreground color on hover.

---

## Left icon in input — optional, absent by default

**Do not add spontaneously, and do not ask beforehand.** Build plain inputs and note in one line at delivery (`SKILL.md` item 3). When the user wants icons:

```tsx
<div className="relative">
  <Mail className="absolute inset-y-0 left-3.5 my-auto size-4 text-muted" aria-hidden />
  <input className="... w-full pl-11" />
</div>
```

- Gray icon (`text-muted`), not accent colored. It is an affordance indicator, not content.
- Input must include `pl-11`. Forgetting it lets typed text overlap the icon.
- `aria-hidden` — the label already explains the field.
- If added, **add across the entire form**, not just the email field. Having an icon on only one field misaligns text padding between rows.
- Icon source per `F15`: use whatever the project uses — `lucide-react`, Heroicons, or raw SVG.

A password field with both left icon and eye button requires **both** `pl-11` and `pr-11`.

---

## Search input (`type="search"`)

**Disable browser default cancel button, build a custom clear button.** Native `type="search"` renders a browser-specific cancel icon: Chrome paints it **blue** following OS accent when focused, while Safari draws a different gray circle. A blue dot standing out in a monochrome app violates design tokens. The issue is the **color and shape** of the browser's icon, not the presence of a clear button: do not omit clear buttons entirely, as typing long queries at 375px leaves no quick way to clear text that has scrolled out of view. All major search inputs provide a clear button.

```tsx
<div className="relative">
  <input
    ref={inputRef}
    type="search"
    className="... w-full pr-10 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
  />
  {query ? (
    <Button variant="ghost" icon={X} aria-label="Clear search"
      onClick={() => { clearQuery(); inputRef.current?.focus(); }}
      className="absolute inset-y-0 right-1 my-auto size-8 min-h-8 rounded-lg p-0 text-muted hover:text-foreground" />
  ) : null}
</div>
```

- Hover background inside an input is an inset `size-8 rounded-lg` square, not filling edge-to-edge. Quantity stepper − + buttons follow this same pattern (`quantity-input.md`).
- Clear button **only appears when the input contains text**, gray `size-4` `X` icon, darkening on hover. Clicking **returns focus to the input** for immediate retyping.
- Keep `type="search"`: mobile keyboards display the Search action button, and Escape still clears text.
- Input reserves `pr-10` so long text does not slide under the button.
- Zero search results: empty state provides a "Clear search" action (`empty-state.md`, "Empty due to filtering").

---

## Focus border in dark mode

Do not use `focus:border-primary` for both themes. In dark mode, `--primary` is near white, turning the border into a glaring, harsh solid white line.

Use `--border-focus` instead of `--primary`:

```html
<input class="... border border-border-strong focus:border-focus focus:ring-2 focus:ring-focus" />
```

```js
// tailwind.config
borderColor: { focus: "var(--border-focus)" },
ringColor:   { focus: "var(--ring-focus)" },
```

In light mode, `--border-focus` is the accent color itself, unchanged. In dark mode, it is the accent color at 42% opacity (3.6:1, meeting WCAG 3:1). See rule `M22` in `../rules-color.md`.

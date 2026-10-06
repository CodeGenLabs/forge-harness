# Quantity input

Quantity in a cart, number of seats, number of copies: a small integer within a known range.
− and + buttons on both sides, the number in the middle can be typed directly. For large numbers or decimals (price,
weight) use a regular input (`input.md`), not this pattern.

```tsx
<div
  className={cn(
    // Borrow the input's classes wholesale (border, background, radius, focus, error, height h-11 md:h-10),
    // drop horizontal padding, hug the content. The frame changes border when the inner number box is focused.
    getFieldControlClasses(hasError, true),
    "inline-flex h-11 w-fit items-stretch overflow-hidden px-0 md:h-10",
    isDisabled && "cursor-not-allowed bg-background text-muted",
  )}
>
  <Button
    variant="ghost"
    aria-label="Decrease quantity"
    aria-controls={id}
    tabIndex={-1}
    disabled={isDecreaseDisabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={() => handleStep(-1)}
    className="group h-full w-11 shrink-0 rounded-none p-0 hover:bg-transparent md:w-10"
  >
    {/* The hit area is the full height (44px on narrow screens); the hover background is only an inset rounded square. */}
    <span className="grid size-8 place-items-center rounded-lg text-muted transition-colors group-enabled:group-hover:bg-foreground/5 group-enabled:group-hover:text-foreground">
      <Minus className="size-4" aria-hidden />
    </span>
  </Button>

  <input
    id={id}
    type="text"
    inputMode="numeric"
    role="spinbutton"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-invalid={hasError || undefined}
    aria-describedby={describedById}
    autoComplete="off"
    // Exactly one more than the digit count of max: overtyping or overpasting still clamps to max.
    maxLength={String(max).length + 1}
    disabled={isDisabled}
    className="w-12 min-w-0 bg-transparent text-center tabular-nums outline-hidden disabled:cursor-not-allowed"
  />

  {/* The + button is identical to the − button, with a Plus icon */}
</div>
```

## Look

- **A single frame, the input's border** (`border-border-strong`, `rounded-xl`,
  accent focus border + soft ring when the inner number box is focused). No vertical dividers between the buttons and the number:
  two divider lines add signal for something the three parts already make clear (`N3`).
- **The hover background of the − + buttons is a `size-8 rounded-lg` square inset in the middle of the cell**, the same pattern as the clear button
  in the search box (`input.md`, `N5`). **Do not** let the hover background fill the whole height from border to
  border: it cuts across the frame halfway, with no divider supporting its inner edge, one side square
  and the other following the radius, so the box looks like a piece is missing. The **hit** area is still the full height, `w-11` on narrow screens, `md:w-10` (`N9`); only
  the **visible** part is inset.
- Icon `Minus` / `Plus` `size-4`, `text-muted`, darkening to `text-foreground` on hover.
- At either end, the button on that side is `disabled`: dimmed `opacity-50`, not-allowed cursor, no background change on hover.
  The button keeps its place, it is not hidden (`N1`).
- Number `tabular-nums`, centred, number box `w-12`, enough for two or three digits.
- **Disabled**: the whole frame sinks to `bg-background`, number `text-muted`, both buttons dimmed; the reason
  for disabling is stated right under the box like a regular input.

## Behaviour

- `type="text" inputMode="numeric" role="spinbutton"`, **not `type="number"`**: the browser's number input
  draws its own up/down arrows on top of the two buttons, and accepts `1e2`, `-3`.
- **A typed number applies only on blur or Enter.** Applying a half-typed "9" of "99" makes the consumer
  recalculate the price on every keystroke. If the box is left empty on blur, **keep the old number**; do not auto-fill `min`
  (`N7`). Out-of-range numbers are clamped into range when applied.
- Clicking + while typing adds to the number being typed, not the old number.
- **`maxLength` is the digit count of `max` plus one**, not exactly the digit count. With exactly that,
  the browser cuts extra digits before the box can clamp: stock is 8, typing 20 gives 2; a box
  up to 99, pasting 150 gives 15 — a quietly wrong number instead of the maximum. With one extra digit the truncated number
  is always greater than `max`, and clamps exactly to `max`.
- Keys in the box follow the spinbutton pattern: up/down arrows change by 1, PageUp/PageDown by 10,
  Home/End go to `min`/`max`.
- Both buttons `tabIndex={-1}`: the number box can already be changed with keys, three Tab stops for one box is
  excessive. `onMouseDown` prevents the default so clicking − + does not pull focus out of the box being typed in,
  and on a phone the keyboard does not pop up with it.

## Limits and errors

- **A known limit is `max`, not an error.** With 8 in stock, `max={8}`: the + button dims at 8,
  typing 20 returns to 8, and the hint line under the box states the real number: *"8 items left."* Do not set
  `max={99}` and then show an error when the user goes past 8: letting someone click a button and then scolding them means
  that button should not have been clickable.
- **The error state is for things the box cannot know in advance**: stock dropping after the item is already in the
  cart, the server rejecting at checkout. Then `max` is already 8 while the number is 12: red border, + button dimmed,
  the error message replaces the hint line and says how to fix it (*"Stock just dropped to 8, reduce to 8 or
  fewer."*). Clicking − once goes straight to 8.
- The hint line states the real limit of what is being bought, not a generic technical range
  ("From 1 to 99"). If there is no limit worth mentioning, there is no hint line.

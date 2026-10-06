# Inline title editing

Record titles at the top of a page (projects, documents, boards) can be edited in place without opening a form. Inline editing in table rows (deadlines, roles) is a separate pattern, see `../layouts/app.md`. Email and password fields are never edited inline (`../layouts/app.md`, profile page).

## Behavior

- **Clicking the title converts it into an input with text pre-selected** for immediate overwriting. Enter or ✓ button saves; Esc or ✕ button cancels; clicking outside saves (matching most project management apps).
  **For multi-line text areas (descriptions, notes), clicking outside does NOT save and keeps the field open**; only ✓ / ✕ exits: accidentally clicking outside midway would otherwise save an incomplete draft or lose changes (major design systems recommend this for long-form text). Single-line titles still save on outside clicks.
- **Empty input does not save**: red border, error message below field ("Project name is required", stating the required action, `layouts/form.md`), field remains open. Typing clears the error; the error message row reserves space until exit. Trim leading and trailing whitespace before saving; unchanged names do not trigger a save call.
- **Both ✓ and ✕ buttons are always present**, for mouse and touch screens (mobile lacks Esc, `N9`). Hover reveals tooltips with keyboard shortcuts. Both buttons use `onMouseDown={preventDefault}`: without it, the input blurs first, and since blur triggers save, clicking Cancel would mistakenly save.
- **Enter during IME composition** (`event.nativeEvent.isComposing`) confirms candidate text, not save.
- **Esc stops propagation**: when titles sit inside a slide-over panel or modal, Esc cancels editing without closing the parent panel.
- **Focus**: exiting via keyboard or button returns focus to the title button; clicking outside leaves focus on the clicked element.
- **Field is auto-growing `<textarea rows={1}>`** (`field-sizing-content`), not `<input>`: long titles wrap naturally matching the idle state, avoiding horizontal scrolling that hides the beginning (`N8`). Pasting multi-line text collapses into single spaces; `enterKeyHint="done"`.
- **Idle state is a ghost button inside `<h1>`**, not a clickable `<h1>`. A `size-4 text-muted` pencil icon sits at the end of the text, following the last word when wrapping. Title editing in page headers is secondary, so the pencil appears only on hover and Tab focus; on touch viewports it stays visible (`I11`). Screen readers announce "E-commerce Website 2026. Edit project name" (`sr-only`).

## Layout: text must not shift by a single pixel

Clicking the title reveals only the container frame; the text must remain stationary down to the pixel (`N1`). Three things must align:

1. **Matching text metrics.** Title button and input field share `px-2`, 1px border (button uses transparent border), `leading-7` line height, 44/40px height (`min-h-11 py-1.75 md:min-h-10 md:py-1.25`), and font size matching header `<h1>` (`text-xl font-semibold`, `../layouts/app.md`).
2. **Text aligns with the rest of the header; the frame bleeds to the left.** Hover background and input border sit outside the text, offset to the left by exactly padding + border (8 + 1 = 9px). Without this offset, the title indents 9px relative to parent breadcrumbs, description copy, and tab rows directly above and below. Apps with inline editing all keep text aligned to the column, letting the frame bleed outward. This is an exception to `N11` (click targets expanding beyond text): there is no negative-free way to keep both text aligned and frame surrounding text.
3. **Identical text width across both states.** From `sm` upwards, the two buttons sit beside the input, consuming 96px (104px at `sm` with 44px buttons). In the idle state, the title reserves that exact space (`sm:pr-26 md:pr-24`), otherwise clicking causes long titles to wrap differently. Below `sm`, the two buttons drop to the next row on the right, sharing a row with the error message: keeping them on the right would leave the input with only ~200px at 375px, wrapping even short titles.

```tsx
// Idle state
<h1
  className={cn(
    // Negative margin: container expands outside text, text aligns with page header (N11 method 4). 9px = px-2 + border.
    "-ml-2.25 min-w-0",
    // Reserve space for ✓ ✕ buttons during edit: text wraps identically in both states.
    "sm:pr-26 md:pr-24",
  )}
>
  <Button
    ref={triggerRef}
    variant="ghost"
    onClick={startEditing}
    className={cn(
      "group w-fit max-w-full justify-start border border-transparent px-2 text-left",
      "min-h-11 py-1.75 md:min-h-10 md:py-1.25",
      "text-xl leading-7 font-semibold text-foreground hover:text-foreground",
    )}
  >
    <span className="min-w-0">
      {value}
      <span className="sr-only">. {editLabel}</span>
      <Pencil
        className={cn(
          "ml-2 inline-block size-4 align-[-1px] text-muted transition-opacity",
          "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
          "[@media(hover:none)]:opacity-100",
        )}
        aria-hidden
      />
    </span>
  </Button>
</h1>

// Editing state
<div
  onKeyDown={handleKeyDown}
  onBlur={handleBlur}
  className={cn(
    // Negative margin on grid container, not textarea: textarea does not stretch with negative margin,
    // causing right edge to fall short by 9px compared to button row on narrow screens.
    "-ml-2.25 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2",
  )}
>
  <textarea
    ref={fieldRef}
    rows={1}
    enterKeyHint="done"
    aria-label="Project name"
    aria-invalid={hasError || undefined}
    className={cn(
      fieldControlClasses, // border, background, radius, focus, error styles from input (input.md)
      "col-span-2 sm:col-span-1",
      "field-sizing-content resize-none px-2",
      "min-h-11 py-1.75 md:min-h-10 md:py-1.25",
      "text-xl leading-7 font-semibold md:text-xl",
    )}
  />

  <div className="col-start-2 row-start-2 flex gap-2 sm:row-start-1">
    {/* Tooltips "Save · Enter", "Cancel · Esc" wrap each button */}
    <Button icon={Check} aria-label="Save" onMouseDown={keepFieldFocused} onClick={save} className="size-11 p-0 md:size-10" />
    <Button icon={X} aria-label="Cancel" onMouseDown={keepFieldFocused} onClick={cancel} className="size-11 p-0 md:size-10" />
  </div>

  {/* Error message indented 9px: aligns with text in input and header column, not the outer frame. */}
  {hasMessageRow ? (
    <div className="col-start-1 row-start-2 min-w-0 pl-2.25">
      <FieldMessage error={error} isSpaceReserved />
    </div>
  ) : null}
</div>
```

If changing `px-2`, also update the three `2.25` (9px) instances. If changing ✓ ✕ button sizes, update `sm:pr-26 md:pr-24` (two buttons + two `gap-2` spaces).

*Verification test:* measure the `x` position of title text via `Range` and the `x` position of parent link / description: they match. Clicking a long title at 1280px: line count and first character of every line remain unchanged.

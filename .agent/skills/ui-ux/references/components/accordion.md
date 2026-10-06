# Accordion

A list of items that open and close in place: FAQ, "see details" per item. Each item is a
full-width **title button**; clicking it slides the **content** out right below.

A collapsible group of optional fields **inside a form** ("Advanced settings") does not use this
accordion frame: see "Collapsible section in a form" at the end of this file.

When to use: a list longer than 6 items, or each piece of content longer than 3 lines; below that
threshold, show everything (`I17`). Exception: the FAQ on a pricing page is always an accordion (`../layouts/pricing.md`).
Everything that opens/closes is built with exactly the recipe here, never `<details>` (`I30`).

---

## Pattern

Each item is a child component holding its own `isOpen`, so several items can be open at once.

```tsx
// accordion-item.tsx
interface AccordionItemProps {
  title: string;
  children: ReactNode;
}

export default function AccordionItem({ title, children }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div>
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen(!isOpen)}
          // py-4 is FIXED in both states: the text always sits evenly between the button edges.
          className="group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-pretty text-sm font-medium text-foreground outline-hidden"
        >
          {title}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted transition-[rotate,color] duration-200 group-hover:text-foreground motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </h3>

      <div
        id={panelId}
        inert={!isOpen}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          isOpen && "grid-rows-[1fr]",
          !isOpen && "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {/* px-5 exactly like the button above, no max-w, no separate pr: fills the full width. */}
          <div className="px-5 pb-4 text-pretty text-sm/6 text-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Frame: ONE white frame, items divided with divide-y.
<div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
  {items.map((item) => (
    <AccordionItem key={item.id} title={item.title}>{item.body}</AccordionItem>
  ))}
</div>
```

A plain `<button>` keeps the example short. If the project has a shared `Button`, use it, as long as it keeps
the row spanning the full width, `rounded-none`, and **turns off the variant's hover background** (`ghost` has
`hover:bg-foreground/5`): add `hover:bg-transparent`.

---

## Rules

**Motion**
- **Slide with `grid-rows` 0fr ↔ 1fr, `duration-200 ease-out`**, the chevron rotates on the same beat.
  No `<details>`, no conditional rendering, no `hidden`: they all open and close instantly, so a click
  jolts (`I30`). Do not measure height with JS.
- **Closed items get `inert`**: Tab does not slip into hidden content, screen readers do not read it.
- **`motion-reduce:transition-none`** on both the sliding block and the chevron.

**Padding: each block stands on its own**
- **Title button `px-5 py-4`, fixed in both the open and closed states.** Do not reduce `pb` when open to pull
  the content closer: paint the button background and the text sits 17px from the top edge, 7px from the bottom.
- **Content `px-5 pb-4`, no `pt`**: it continues the button's bottom padding. Measured:
  top edge → title 17px, title → content 20px, content → bottom edge 20px. Do not give the
  content `py-3` (painting any block looks even, but the content sits 32px from the title and 16px from the
  divider below, so it looks like it belongs to the divider below); Settled: continue the padding.
- **Content uses the same `px` as the button, no separate `pr`, no `max-w`.** `pr-12` (to keep text from
  running under the chevron) makes a 48px right margin against a 20px left margin; `max-w-[65ch]` makes the content block
  55px short of its wrapper. Set the width on the **outer frame**.
- **The frame is wide enough for the longest title to fit on one line on desktop.** Do not shrink the frame for content
  ≤ 75 characters: 1–2 sentences of content read in one breath, `T11` does not apply; a narrow frame wraps the title
  while the row still has room. Only content of 3 lines or
  more brings in `T11`, and then the content should usually be cut down.
- **No negative values** to pull the content up (`N11`): a negative margin on the `overflow-hidden` child
  makes a closed item show the first line of its content.

**Hover and focus**
- **No hover background. On hover the chevron darkens** (`group-hover:text-foreground`) plus
  the hand cursor. An exception to `I10`. Do not use:
  - a `--surface-hover` (`#f8f8fa`) background on the button: close to the page background `#f4f4f6` right outside the
    frame edge, so the row looks cut out; an open item is grey on top and white below;
  - a background over the whole item (`has-[]`): still a patch close to the page background touching the frame edge;
  - an inset rounded row: a grey cell close to the page background sitting inside the card, like a hole.

**Frame and text**
- **One white frame, `divide-y divide-border`** (`M13`). Do not leave bare dividers on the grey page
  background: without a frame the dividers read as floating page separators.
- **Item title `text-sm font-medium`, `text-pretty`**, not `text-balance` even though it is an `h3`: it
  shares the row with the chevron, and `balance` wraps the sentence when only half the row is used (`T10`).
- **Content `text-sm/6 text-muted`.**
- **All closed on page load**, unless the request says an item should start open.

---

## Collapsible section in a form

"Advanced settings", "More options": a group of fields most users skip, sitting among
the form's fields. Build it as **one line of text with a chevron right after it**, no frame; clicking slides the
fields out **aligned to the column and as wide as the form's other fields**. This is how most apps handle
secondary options in a create form.

Same slide mechanism, `inert` and chevron as the accordion above; the differences are no frame, a button
with no `px`, and a clip block that clips only vertically.

```tsx
// form-disclosure.tsx
interface FormDisclosureProps {
  title: string;
  // The parent holds the state: on submit, if a field inside is invalid, the parent must open the section itself.
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
}

export default function FormDisclosure({ title, isOpen, onOpenChange, children }: FormDisclosureProps) {
  const panelId = useId();

  return (
    <div>
      {/* h2 when the form sits right under the page h1. */}
      <h2>
        <Button
          type="button"
          variant="ghost"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onOpenChange(!isOpen)}
          // px-0: text aligned with the field labels on the left. w-fit: the hit area is text + chevron,
          // not the whole row. No hover background; on hover the chevron darkens like the accordion.
          className="group h-11 w-fit gap-1.5 rounded-md px-0 py-0 text-sm font-medium text-foreground hover:bg-transparent md:h-10"
        >
          {title}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted transition-[rotate,color] duration-200 group-hover:text-foreground motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
            aria-hidden
          />
        </Button>
      </h2>

      <div
        id={panelId}
        inert={!isOpen}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          isOpen && "grid-rows-[1fr]",
          !isOpen && "grid-rows-[0fr]",
        )}
      >
        {/* overflow-y-clip, NOT overflow-hidden: clip only vertically for the slide. Inputs are as wide
            as this block; overflow-hidden would clip the 2px focus ring on both sides of the field. */}
        <div className="min-h-0 overflow-y-clip">
          {/* pt-2.5 plus the space below the button text = 20px, equal to the gap between fields. */}
          <div className="flex flex-col gap-5 pt-2.5">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

An invalid field inside a closed section: on submit, open the section and then move the cursor into that field.

```tsx
// The closed section is inert, so focus() on a field inside does nothing: remove inert in this same pass.
flushSync(() => setIsAdvancedOpen(true));

// Focus now but do not scroll yet: the section is still sliding, scrollIntoView now scrolls off target.
// Only after the slide (200ms) scroll the field into the middle of the screen.
document.getElementById(fieldId)?.focus({ preventScroll: true });
window.setTimeout(() => focusFieldById(fieldId), accordionDurationMs);
```

**Rules**
- **No frame, no dividers above or below the section.** Built
  with the accordion frame (`--border` border, `rounded-xl`) nested inside a white form card:
  - when closed, the row has a rounded border, is as wide as an input, with a chevron on the right: it looks exactly like a
    select named "Advanced settings";
  - the fields inside are inset 21px, 42px narrower than the fields above: the form
    has two left edges;
  - when open, the frame's bottom and the divider above the button row are two lines 24px apart;
- **Chevron right after the text (`gap-1.5`)**, not pushed to the right edge. A chevron on the right edge of a
  row as wide as an input is the signature of a select.
- **The fields inside behave like every other field in the form**: same left edge, same width, same `gap-5`.
  Re-measure with `getBoundingClientRect`: the label of the first field in the section and the label of the field above share the same `left`.
- **`overflow-y-clip` on the clip block.** At 375 and 1280px: the focus ring is complete on all four
  sides, no text peeks out mid-slide, no horizontal scroll. If the last field in the section is an input with no
  hint line, add `pb-1` to the content block for the bottom of the ring.
- **Spacing comes from the button's `h-10`**: hint of the field above → title 32px, title → label
  of the first field 22px. The title is closer to its own group, no extra divider needed.
- **Only hide things that have a usable default.** A choice that decides who sees the data (private /
  public) goes outside the section: most apps put it right on the create form, the creator must see
  it before clicking. This section does not count toward the `I17` threshold: it hides things to keep the main path short, not
  because it is long.
- **Closed on page load.** On submit, if a field in the section is invalid, open it as in the pattern above.

---

## Check

- Paint different solid backgrounds on the button, the content wrapper and the content, in the closed, open and hover states
  (`REVIEW.md` step 4): text sits evenly from the edges inside each block, the content fills the wrapper,
  no wrapper colour peeks out.
- Measure with a `Range` on the text: top edge → title ≈ 17px, title → content ≈ 20px, content
  → bottom edge ≈ 20px. A closed item keeps its height when another item opens.
- Capture mid-slide (~90ms after clicking): no text peeks out of a closed item.
- Tab through the buttons; Enter and Space open and close; Tab does not enter the content of a closed item.
- At 375px, a long title does not wrap when only half the row is used.
- Collapsible section in a form: when closed, does it look like a select? When open, do the labels and fields inside
  have the same `left` and width as the field above? Focus an input in the section, capture close-ups of the left and
  right edges to see whether the ring is clipped; submit while a field in the section is invalid and the section is closed.

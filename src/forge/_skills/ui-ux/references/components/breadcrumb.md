# Breadcrumb

A line of the parent levels of the current page, each level a link. It sits in one of two places: the `h-16`
header bar of the app shell, or above the page title in the page header (`../layouts/app.md`, "Page header in
the content area"). Never both.

## When it appears

- **The page sits deeper than the highlighted sidebar item**: record detail, create form, sub-page of a
  record. A first-level list page is fully described by the sidebar item, no breadcrumb; the page title on
  the header bar is the `<h1>`.
- **Not for multi-step flows** (that is the step bar, `../layouts/form.md`) and **not
  browsing history**: the breadcrumb records the page tree, so it reads the same no matter where you came from.

## Shape

```
Customers  ›  Minh Phat Co., Ltd.  ›  Orders             <- only PARENT levels, all links
Order DH-10412                                           <- <h1>, not in the breadcrumb
```

- **Only list the parent levels, never the current page.** The page title is the `<h1>` right below (or
  right next to it on the header bar); writing it again is repetition. Many design systems add the current page as the last
  item, but systems that put the breadcrumb right above the page title drop it, and this skill is always in that case.
  The rare case where the breadcrumb is the **only** place showing the page name (file browser, no other
  title): the last item is plain text `font-medium text-foreground` with `aria-current="page"`,
  not a link.
- **Each item's text matches the `<h1>` of the target page exactly.** Clicking "Minh Phat Co., Ltd." and landing on a page
  titled "Customer profile" leaves the reader not knowing where they just went.
- **`text-sm text-muted`, hover `hover:text-foreground`, no underline, no background.** The same
  hover as sidebar links: the breadcrumb is a navigation bar, not a link inside a sentence.
- **Separator `ChevronRight` `size-4` `text-muted`, `aria-hidden`**, `gap-2` both on the `<ol>` and
  inside the `<li>`. The › stroke is only 4px wide in a 16px box, so text stroke to separator stroke is 14px on each side.
  A "/" separator is just as common; this skill picks one style for the whole app (`D1`), do not mix.
- **Each item `inline-flex h-8 items-center`**: 20px text but a 32px vertical hit area. In the page header,
  the page title right below has **no `mt`**: the 32px row already leaves 6px below the text.
- **Long names: `max-w-48 truncate` with `title`**, truncate each item, not the whole line. 192px at
  `text-sm` is about 28 characters.
- **No wrapping** (`R6`): a breadcrumb reads in one direction; if the second half drops to a second row, the
  › at the start of the row reads like a new item. When tight, truncate names and collapse as described below.
- **On Tab: the text is underlined**, no ring (`I13`).

## Long trails

```
Documents  ›  …  ›  Contracts 2026  ›  Q3                 <- 5 parent levels, middle collapsed into "…"
            └ Minh Phat project
              Legal
```

- **Up to 3 parent levels: show them all.** From 4 levels: keep the **first level** and the **two nearest levels**, the
  middle levels collapse into one "…" button. The first level says which area you are in; the two nearest are where people
  go back to most.
- **The "…" button opens a dropdown menu**, it does not expand in place: expanding makes the line long again and it has to
  wrap. `aria-label="Show hidden levels"`, `aria-haspopup="menu"`. The menu lists the hidden levels
  in top-down order, each item is a link, menu item layout in `../layouts/overlay.md`.
- **The "…" button looks like a text item, not an icon button.** The box hugs the icon (`h-5 w-4 p-0`,
  icon `MoreHorizontal size-4`), no background, `text-muted` hovering to `text-foreground`, kept at
  `text-foreground` while open. The hit area is widened with `before:` (`before:absolute before:-inset-x-1.5
  before:-inset-y-1.5`, 28×32px, the same way as the handle in `range-slider.md`). Do not use a `ghost size-8` button: 8px padding on each side, the "…" stroke
  sits 22px from the › while text sits 12px from it, and hovering shows a grey cell in the middle of a row of text
  that only changes colour.

## Narrow screens (below `sm`)

```
☰  ‹ Customers                                   🔔  (T)
```

- **Only the nearest parent remains, preceded by a `ChevronLeft`**: a "go back" link, not a
  shrunken breadcrumb. 375px does not have room for three items truncated to "Custo…", "Minh P…". Farther levels
  are still reachable via the sidebar.
- **Hit area `h-10`** (`h-10 sm:h-8`): on a phone this is a back button, pressed with the thumb.
- The parent name is still `max-w-48 truncate`; it is not squeezed into a row with other items, so it is rarely truncated.
- When a truncated name ends in "…", the gap to the › may be a few px wider: the browser truncates at the last character
  that still fits and leaves the rest empty. CSS cannot fix this, do not chase it.

## Skeleton

```tsx
interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  // Only the parent levels, from far to near. Do not put the current page here.
  items: BreadcrumbItem[];
  className?: string;
}

// The link is 32px tall to be easy to hit; on Tab the inner text <span> is underlined (breadcrumbTextClass).
const breadcrumbLinkClass =
  "group inline-flex h-8 max-w-48 items-center text-muted outline-hidden transition-colors hover:text-foreground";

const breadcrumbTextClass = cn(
  "truncate rounded-sm",
  "group-focus-visible:underline",
);

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  const nearestParent = items.at(-1);
  if (!nearestParent) return null;

  // From 4 levels: keep the first level and the two nearest, middle levels go into the "…" menu.
  const isCollapsed = items.length > 3;
  const leadingItems = isCollapsed ? items.slice(0, 1) : [];
  const hiddenItems = isCollapsed ? items.slice(1, -2) : [];
  const trailingItems = isCollapsed ? items.slice(-2) : items;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      {/* Narrow screen: one link back to the nearest parent. */}
      <Link
        href={nearestParent.href}
        title={nearestParent.label}
        className={cn(breadcrumbLinkClass, "h-10 gap-1 text-sm sm:hidden")}
      >
        {/* The wrapper covers both ‹ and the text; pr-1.5 offsets the empty space left of the ‹ stroke in the icon box. */}
        <span className={cn(breadcrumbTextClass, "inline-flex min-w-0 items-center gap-1 pr-1.5")}>
          <ChevronLeft className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{nearestParent.label}</span>
        </span>
      </Link>

      <ol className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
        {leadingItems.map((item) => (
          <BreadcrumbCrumb key={item.href} item={item} hasSeparator={false} />
        ))}

        {hiddenItems.length > 0 ? (
          <li className="flex shrink-0 items-center gap-2">
            <ChevronRight className="size-4 text-muted" aria-hidden />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* Looks like a text item: the box hugs the icon, no background. The hit area is widened to 28×32px
                    with before: (negative values on purpose, N11: widen the hit area without pushing the layout). */}
                <Button
                  variant="ghost"
                  aria-label="Show hidden levels"
                  className={cn(
                    "group relative h-5 min-h-0 w-4 rounded-sm p-0 text-muted hover:bg-transparent hover:text-foreground",
                    "before:absolute before:-inset-x-1.5 before:-inset-y-1.5",
                    "aria-expanded:text-foreground",
                  )}
                >
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {hiddenItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ) : null}

        {trailingItems.map((item, index) => (
          <BreadcrumbCrumb key={item.href} item={item} hasSeparator={isCollapsed || index > 0} />
        ))}
      </ol>
    </nav>
  );
}

// breadcrumb-crumb.tsx: one item, the › comes first inside the same <li>.
export default function BreadcrumbCrumb({ item, hasSeparator }: BreadcrumbCrumbProps) {
  return (
    <li className="flex min-w-0 items-center gap-2">
      {hasSeparator ? <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden /> : null}
      <Link href={item.href} title={item.label} className={breadcrumbLinkClass}>
        <span className={breadcrumbTextClass}>{item.label}</span>
      </Link>
    </li>
  );
}
```

`Link` is the project router's link (`next/link`, `react-router`). If the project already has a wrapped `ActionMenu` or
`DropdownMenu`, use that for the "…" button, do not build a second menu.

## Do not

- **No dropdown on each item to switch to a sibling record** (clicking "Project A ⌄" shows a list
  of projects). The breadcrumb is for going up; switching workspace or project is the sidebar's job
  (`../layouts/app.md`). Two jobs in one place means clicking a name you cannot tell whether it navigates or opens a menu.
- No home icon on the first item, no bold item: every item is an equal parent level.
- Do not repeat the breadcrumb in the page header when the header bar already has one.

## Check

- Does the breadcrumb repeat the text of the `<h1>` right below? If so, it is listing the current page.
- Click each item: does the target page title match the item text exactly?
- At 1280px with 5 parent levels: one row, a "…" that opens a menu, Tab to "…" then Enter opens it?
- The › stroke is equally far from the text strokes on both sides, including around "…" (the probe measures: "uneven separator spacing").
- At 375px: only "‹ Parent level", 40px tall, no item truncated to a few letters. On Tab: text underlined.
- Hover the items and the "…": colour change only, no background cell. On Tab: underline only, no ring.
- Screen reader: the `nav` is named "Breadcrumb", items are in an `ol`, the › is not read.

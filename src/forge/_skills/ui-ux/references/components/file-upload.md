# File upload

A drag-and-drop dropzone above, file list below, both inside a card. Toast notifications announce only when the entire upload batch finishes (see Toast section). Buttons follow `button.md`, progress bars borrow tracks and colors from `charts.md`, but **file rows have their own specialized format** here.

```
┌ Upload documents ─────────────────────────────────────────────┐
│ ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐ │
│ ╎               Drag and drop files here                      ╎ │
│ ╎      PDF, Word, Excel, images. Up to 25 MB per file         ╎ │
│ ╎                    [ ⤒ Choose files ]                       ╎ │
│ └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘ │
│ ▯ project-kickoff-meeting-minutes-ecommerce-site…     71%   ✕ │  <- uploading: thin bar
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━───────────────                │
│ ─────────────────────────────────────────────────────────────  │
│ ▯ site-survey-report.pdf                                   ✕ │  <- queued: text, no bar
│   Queued · 6.8 MB                                              │
│ ─────────────────────────────────────────────────────────────  │
│ ▯ budget-forecast-2026.xlsx                                ✕ │  <- error: red text + Retry
│   Network connection lost · Retry                              │
│ ─────────────────────────────────────────────────────────────  │
│ ▯ brand-logo.png                                               │  <- completed: text, no bar
│   ✓ Upload complete · 2.4 MB                                   │
└───────────────────────────────────────────────────────────────┘
```

## Dropzone

```html
<label class="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-border-strong bg-background/60 px-6 py-8 text-center transition-colors hover:bg-item-hover">
  <input type="file" multiple class="sr-only" />
  <!-- Touch screens cannot drag and drop: hide this sentence, keeping the hint and button -->
  <p class="text-sm font-medium text-foreground [@media(hover:none)]:hidden">Drag and drop files here</p>
  <p class="mt-1 text-pretty text-sm text-muted">PDF, Word, Excel, PowerPoint, JPG or PNG images. Up to 25 MB per file</p>
  <!-- Looks like an outlined h-9 button with upload icon, but is a <span>: the entire frame is already clickable -->
  <span class="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 text-sm font-medium">…Choose files</span>
</label>
```

- **The entire container is clickable** (`<label>` wrapping visually hidden `input type="file"`), not just the button. "Choose files" is a `<span>` styled as an outline button: nesting a real `<button>` inside `<label>` triggers the file picker twice.
- **Dashed border `border-border-strong`** (`F21` permits), background `bg-background/60`, hovering shifts background to `bg-background`. Both background and border are subtle: the dropzone is a waiting area, not the heaviest element on screen.
- **While dragging files over**: border darkens to `border-foreground/40`, background `bg-background`, title switches to "Drop files to upload". **No solid black border** (`border-foreground`): a solid black dashed border wrapping the whole container becomes the heaviest element on screen just to signal "ready to drop". Content stays in place, only title text changes (`N1`).
- **Hint text states the rules before selection**: file types, maximum size. This is information users don't know yet, not filler text (`T20`).
- The dropzone **preserves its height** when files are added to the list. Shrinking the dropzone when the first file arrives causes the entire card to jump (`N1`).
- **Touch devices hide "Drag and drop files here"** (`[@media(hover:none)]:hidden`): mobile phones cannot drag and drop files; that copy is misleading. Keep the hint line and "Choose files" button.
- **Disabled / Locked** (storage full, lacking permission): container stops being clickable (`<div>` replaces `<label>`, `input` `disabled`, hover removed, default cursor). **Background retains `bg-background/60` as normal**, rather than darkening to `bg-background`: that is the drag-over background, and matching it makes two opposite states look identical.
  - **Title changes to the reason**, keeping `text-foreground font-medium`: "Project has used all 5 GB". Leaving "Drag and drop files here" invites users to perform an action that is currently disallowed. **Do not dim the entire block**: the reason is the single piece of information users need to read in this state (`N6`, `N8`).
  - **Secondary line provides an exit path**, `text-muted`: "Delete older files or upgrade your plan to upload more".
  - **Muted "Choose files" button is removed, replaced by an exit action button** if available ("Upgrade plan", clickable `h-9` outline button). A disabled button in the center merely repeats what the title already states (`N2`, `N3`). For temporary locks that users cannot resolve themselves (archived project), show no button, and state in the secondary line who can unlock it.
- **When lacking upload permissions, hide the upload area entirely**, rather than rendering a locked container. Read-only viewers who see a large banner saying "You don't have permission to upload files" every time they visit receive a rejection for an action they had no intention of performing; major cloud storage platforms hide the upload button when permissions are lacking. Locked containers are only for **temporary** blocks (storage full, project archived), which authorized uploaders need to know. Do not repeat an idea in two tiers: "You don't have permission to upload files" / "Only project admins can upload files".

## File row

```html
<ul class="mt-4 divide-y divide-border">
  <li class="flex items-center gap-3 py-3">
    <i data-lucide="file-text" class="size-5 shrink-0 text-muted"></i>
    <div class="min-w-0 flex-1">
      <div class="flex items-baseline gap-3">
        <!-- Middle-truncated name (T14): initial segment truncates, preserved segment = ~8 trailing name characters + extension, shrink-0 -->
        <p class="flex min-w-0 flex-1 text-sm font-medium text-foreground" title="project-kickoff-meeting-minutes-ecommerce-site.pdf"><span class="truncate">project-kickoff-meeting-minutes-ecommerce-</span><span class="shrink-0">site.pdf</span></p>
        <p class="shrink-0 text-sm text-muted tabular-nums">71%</p>        <!-- only while uploading -->
      </div>
      <!-- Bottom row: fixed height, contains PROGRESS BAR or SINGLE LINE OF TEXT, never both -->
      <div class="mt-1 flex min-h-5 items-center">
        <div role="progressbar" aria-valuenow="71" aria-valuemin="0" aria-valuemax="100" aria-label="Uploading project-kickoff-meeting….pdf" class="h-1 w-full rounded-full bg-foreground/5">
          <div class="h-1 rounded-full bg-primary" style="width: 71%"></div>
        </div>
      </div>
    </div>
    <div class="flex w-8 shrink-0 justify-end">
      <!-- IconButton ✕ size-8, aria-label="Cancel upload project-kickoff-meeting….pdf" -->
    </div>
  </li>
</ul>
```

| State | Top right corner | Bottom row | ✕ Column |
| --- | --- | --- | --- |
| Queued | empty | `text-xs text-muted` "Queued · 6.8 MB" | ✕ "Remove file …" |
| Uploading | `71%` `text-muted tabular-nums` | bar `h-1`, track `bg-foreground/5` (not `bg-background`, `M21`), fill `bg-primary` | ✕ "Cancel upload …" |
| Completed | empty | icon `circle-check` `size-3.5 text-emerald-600` + `text-xs text-muted` "Upload complete · 2.4 MB" | empty, preserve `w-8` |
| Upload error | empty | `text-xs text-red-600` "Network connection lost" · text button **Retry** | ✕ "Remove file …" |
| Rejected (oversized, invalid type) | empty | `text-xs text-red-600` "Exceeds 25 MB (file is 48 MB)" / ".zip files not accepted" | ✕ "Remove file …" |

- **Only uploading files show a progress bar.** Queued means not yet started; an empty track says nothing. Rejected means never starting; an empty gray track misleads as "about to start". When done, **the bar disappears**: a full green bar + `100%` + "Upload complete" is three signals for one fact, and a column of green, red, and black bars becomes the heaviest element on screen (`N3`). Major file services remove progress bars upon completion.
- **On error, remove the bar and percentage.** "54%" on a failed file is a dead number: clicking Retry restarts from scratch. A red bar stopped midway adds a heavy block of color for something text already explains.
- **Bottom row has fixed height** (`min-h-5`), containing either bar or text. As rows transition states (queued -> uploading -> completed), row height remains constant, preventing content below from jumping (`N1`). Long error messages on narrow screens wrap onto multiple lines (`min-h`, not `h`), never `truncate` reasons (`N8`).
- **Bar is `h-1`**, not `h-2` like standalone bars: multiple concurrent uploads stack bars, and thick bars turn the list into heavy black stripes.
- **Retry is a text button immediately following the error reason**, `text-xs font-medium text-foreground hover:underline underline-offset-2`, `whitespace-nowrap`, separated from the reason by ` · `. **Touch target expands via `relative before:absolute before:-inset-x-1.5 before:-inset-y-2`** (turning 16px text into 32px target; negative values preserved per `N11`, like copy button in `description-list.md`): bare 39×16px text buttons fall short of 32px standards on touch screens. File rows are taller than 32px so the expanded target won't overlap adjacent rows. Not an outline button at row end: outline buttons next to ✕ misalign action columns (wide button vs. narrow ✕) and outweigh file names. Failed files **still keep ✕ to dismiss**: providing only Retry traps failed files forever.
- **✕ column has fixed width `w-8`** across all rows, including completed rows without a button. Percentages and bar right edges align flush in a clean column (`N1`).
- **✕ states exact action in `aria-label`, including file name**: uploading is "Cancel upload …", otherwise "Remove file …". Completed files have no ✕ here: deleting uploaded documents belongs in the document list, with a confirmation modal.
- **Icons match file types**, `size-5 text-muted`, single color, **sharing a consistent document silhouette** (Lucide's `file-*` family): `file-text` (PDF, Word), `file-spreadsheet` (Excel), `file-chart-column` (PowerPoint), `file-image` (images), `file` for remaining types including zip. **Document outline must be closed and continuous**: avoid `presentation` (a board, not a sheet), `file-chart-pie`, `file-archive`, `file-box`, `file-lock`… — these draw a shape overlapping the bottom-left corner that clips the outline, looking broken at `size-5` (Lucide lacks `file-presentation`). When picking icons, inspect SVG paths to ensure closed outer perimeters. Do not color code by file type (`M5`). **This table is the shared source** across the app (file trees, document lists): projects should have a single helper function mapping extensions to icons, rather than per-component tables.
- **File names on a single line, middle-truncated, preserving extension** (`T14`, like `tree.md`): "meeting-minutes-kickoff…ecommerce.pdf", not cutting at the end (which loses the file extension) or cutting right before the extension without context. Full `title` is **only attached when text is actually truncated** (`T14`). Percentage uses `shrink-0` and never wraps.
- Lists divide via `divide-y divide-border` (`F3`), not separate cards. Order follows insertion order, new files at bottom; do not auto-sort errors to top.
- Consistent numbers across app: `6.8 MB`, `1.1 / 1.5 MB` (spaces around slash, `charts.md`).

## Toast

- **Full batch completed**: a single toast "Uploaded 3 documents", no per-file toast. Batches with failed files do **not** trigger completion toast.
- **When files fail**: if the list remains visible on screen, **do not fire error toasts**; the file row already communicates this with Retry (`N3`). Error toasts are reserved for when the upload area is no longer on screen (modal closed, navigated away): two tiers "1 file failed to upload" / "Network connection lost", with Retry + ✕ buttons per `../layouts/overlay.md`. Timing is logic (`N10`); skill provides static variants for review.

## Static examples required to build

No files yet · dragging over dropzone · list with all 5 states (including a very long name) · dropzone locked due to storage limits · two toasts. At 375px: middle-truncated long name retains extension, % and ✕ do not wrap, "Drag and drop..." is hidden.

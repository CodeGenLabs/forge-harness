# Loading states

The question to ask before rendering: **what is the user waiting for, and what is already on screen.** Each case has its own visual pattern. The most frequent AI mistake is using a single pattern for everything: skeletons whenever waiting, spinners whenever clicking.

| Case | Visual |
| --- | --- |
| Initial load, network data | Matching skeleton container (see below) |
| Initial load, local data (localStorage, pre-existing state) | No skeleton, no spinner. A subtle muted line like `empty-state.md`, changing only text |
| **Secondary load**: changing filter, page, tab, or search query | **Keep previous data** + thin progress bar atop container |
| **Direct in-place changes**: toggle, checkbox, card drag, reordering | Change immediately, no spinner. Revert on error + error toast |
| Clicking submit, save, create buttons | Spinner replaces button icon (`button.md`) |
| Auto-save (settings, editors) | "Saving… / Saved" indicator beside the modified field |
| "Load more" at bottom of list | Spinner overlays button center, button preserves width (`timeline.md`) |
| **Long-running tasks**: exporting files, importing data | Progress indicator, runs in background, announces via toast on completion |
| File uploads | `file-upload.md` |
| AI response streaming | `chat.md` |

Never show a full-screen spinner replacing the entire page (`I19`). During page navigation, header and sidebar remain stationary; only the content area displays a skeleton.

---

## Skeleton container (initial network data)

Per `I19`: skeletons must **match the exact shape** of real rows, preventing page layout shifts when data arrives.

```html
<ul aria-busy="true" class="divide-y divide-border">
  <li class="flex items-center gap-3 px-4 py-3">   <!-- same padding, same divide as real rows -->
    <div class="size-8 shrink-0 animate-pulse rounded-full bg-foreground/5 motion-reduce:animate-none"></div>
    <div class="min-w-0 flex-1 space-y-2">
      <div class="h-3 w-2/5 animate-pulse rounded-full bg-foreground/5 motion-reduce:animate-none"></div>
      <div class="h-3 w-1/4 animate-pulse rounded-full bg-foreground/5 motion-reduce:animate-none"></div>
    </div>
    <div class="h-3 w-16 animate-pulse rounded-full bg-foreground/5 motion-reduce:animate-none"></div>
  </li>
</ul>
<span class="sr-only" role="status">Loading customer list</span>
```

- **Skeleton bars use overlay `bg-foreground/5`, not `bg-background`** (`M21`). In light mode both look identical (`#f4f4f4` / `#f4f4f6` on white cards); in dark mode `bg-background` is darker than the card surface, turning skeletons into punched-out black holes, whereas an overlay brightens softly matching other fills.
- **Borrow the exact layout of real rows**: identical avatar size, padding, and `divide-y` dividers. If real rows have dividers and the skeleton lacks them, the container visibly reshapes when data arrives.
- **Text placeholder bars are `h-3` tall with staggered widths** across rows (`w-2/5`, `w-1/2`, `w-1/3`…). Uniform widths look like zebra stripes, not text.
- Row count matches items per page or fills the viewport; do not generate 3 rows for a 10-row container.
- **Grouped tables start skeletons with a group header row**, not bare data rows, preventing the entire table from jumping down a row when data loads (`../layouts/app.md`, Grouped tables by status).
- `animate-pulse` always pairs with `motion-reduce:animate-none`. Screen readers cannot perceive skeletons, so provide `aria-busy` and an `sr-only` announcement.
- **Never flash empty state copy while loading.** Showing "No customers yet" for a split second before the list loads falsely informs the user. If emptiness is unconfirmed, it is loading.

---

## Secondary load: keep previous data

Changing filters, pagination, tabs, typing search queries, refreshing: data **is already on screen**. Replacing the entire table with a skeleton wipes out what the user is reading; every keystroke in search flickers the table. Keep existing data until new data arrives, indicating background work with a thin progress line along the top of the container.

```html
<div aria-busy="true" class="relative overflow-hidden rounded-2xl border border-border">
  <!-- Progress bar: present only during secondary reload -->
  <div class="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
    <div class="h-full w-1/3 animate-progress-slide bg-primary motion-reduce:animate-pulse"></div>
  </div>
  <table>…previous data preserved…</table>
</div>
<span class="sr-only" role="status">Loading results</span>
```

```css
@theme {
  --animate-progress-slide: progress-slide 1.2s ease-in-out infinite;
  @keyframes progress-slide {
    from { translate: -100% 0; }
    to { translate: 300% 0; }
  }
}
```

- **Previous data is not dimmed or disabled.** Dimming drops text contrast below accessible levels and implies disabled state; users can still read and interact with existing rows while waiting.
- **The progress bar sits inside the loading container**, not at the top of the viewport: changing table filters places the bar on the table border where eyes are already focused. The bar overlays the top border, adding no layout height (`N1`).
- **Active controls update immediately**: active filter chip highlights, tab switches, page number updates. Only the data table awaits response.
- If the response returns 0 rows, transition to empty state (`empty-state.md`). **If a secondary load fails, keep previous data and announce via error toast with Retry** (`../layouts/overlay.md`); "Failed to load..." empty states from `empty-state.md` are reserved for when nothing is on screen yet.
- **On error, tabs, chips, and page numbers revert to match currently displayed data**, just like direct in-place edits. Leaving "In Progress 19" highlighted above a table showing "All" records with footer saying 32 creates an outright contradiction; explaining "table shows previous results" is an awkward textual bandaid. The toast describes what failed to load ("Could not load In Progress customers"), and Retry re-triggers that exact filter. **Search inputs retain typed queries**, without clearing user input; toast "Could not find 'smith'" + Retry.
- Typing search queries: newest request wins; older responses must not overwrite newer queries. Canceling or ignoring stale responses is consumer logic (`N10`).
- In projects with React Query or SWR, use `placeholderData: keepPreviousData`, with progress bar tied to `isFetching`; in plain React, use `useTransition` with bar tied to `isPending`.

---

## Display timing: wait 300ms, keep for 500ms once visible

When data arrives within 200ms, rendering a skeleton causes an unpleasant **flicker**: skeleton flashes and vanishes instantly, looking like a glitch. Conversely, a skeleton vanishing after 50ms also flickers.

- **Under 300ms, render nothing**: container preserves height, remaining blank. No empty state, no skeleton.
- **Once displayed, keep visible for at least 500ms**, even if data arrives immediately.
- Applies to skeletons, secondary load progress bars, and "Saving…" indicators. **Does not apply to button spinners**: button spinners replace icons without shifting layout, and users need immediate feedback that their click was registered.

```ts
// Show loading flag after delayMs; once visible, preserve for at least minVisibleMs.
export function useDelayedLoading(isLoading: boolean, delayMs = 300, minVisibleMs = 500) {
  const [isVisible, setIsVisible] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (isLoading) {
      if (isVisible) return;

      const showTimer = window.setTimeout(() => {
        shownAtRef.current = Date.now();
        setIsVisible(true);
      }, delayMs);
      return () => window.clearTimeout(showTimer);
    }

    if (!isVisible) return;

    const remainingMs = Math.max(0, minVisibleMs - (Date.now() - shownAtRef.current));
    const hideTimer = window.setTimeout(() => setIsVisible(false), remainingMs);
    return () => window.clearTimeout(hideTimer);
  }, [isLoading, isVisible, delayMs, minVisibleMs]);

  return isVisible;
}
```

When holding for 500ms and data has already returned, render data immediately while keeping the progress bar or "Saving…" indicator visible until the timer expires. Skeletons for initial loads wait for the timer to finish before swapping to data:

```tsx
const isSkeletonVisible = useDelayedLoading(isLoading);

{isSkeletonVisible ? <CustomerListSkeleton /> : isLoading ? <div className="min-h-96" /> : <CustomerList />}
```

---

## Direct in-place changes

Toggling a switch, checking off a task, dragging a Kanban card, reordering items, tagging, pinning: **update in-place immediately upon interaction**, without spinners or locking controls while waiting for the server. These are lightweight, high-success interactions often performed in rapid succession.

- **On error, revert state** (switch toggles back, card returns to previous column, exact previous position) **accompanied by an error toast** explaining what failed to save with a Retry action: "Could not move 'Fix checkout page' to In Progress". Silently reverting makes users believe their click missed. Long task names truncate to ~30 characters + `…` (`../layouts/overlay.md`, Toast), with secondary description stating current location ("Card returned to To Do").
- Error toasts follow `../layouts/overlay.md`: persistent, `role="alert"`. Where auto-save indicators exist (settings rows), error messages appear there without firing toasts (see section below).
- **Do not use for irreversible or server-decided actions**: payments, sending invites, permanent deletions, or record creation where subsequent screens depend on generated IDs. Those use pending button states (`button.md`).
- Optimistic UI transitions locally; whether server calls succeed is logic (`N10`); skill provides both states: updated, and reverted + toast.

---

## Auto-save: "Saving… / Saved"

Settings pages without a global Save button (`../layouts/app.md`) and auto-saving text editors need a small status indicator confirming save state, placed **beside the modified field**: next to the settings row label, or beside the document title in editor headers.

```html
<span role="status" class="inline-flex items-center gap-1 text-xs text-muted">
  <!-- Saving: text only -->
  Saving…
  <!-- Saved: <i data-lucide="check" class="size-3.5"></i> Saved -->
</span>
```

| State | Visual |
| --- | --- |
| Saving | "Saving…" `text-xs text-muted`, no spinner. Governed by 300ms rule |
| Saved | icon `check` `size-3.5` + "Saved", matching `text-muted`, not green. Settings: auto-hides after ~2s. Editors: persists as "Saved at 14:32" |
| Save failed | **Control reverts to saved value** (switch toggles back, select reverts), beside label "Save failed" in `text-red-600` + text link "Retry" (re-applies failed change). Persists until resolved. No toast: error is communicated in context (`N3`) |

- **Leaving a switch in the new state on failure creates a contradiction**: an off switch beside "Save failed" leaves users unsure whether server is on or off. Revert to saved value, like direct in-place changes. **Text inputs retain user-typed text**, never wiping input.
- **No green for "Saved"**: saving is a routine event, like gray `Check` in `chat.md`. Green is reserved for "healthy/positive" status (`rules-color.md`).
- Indicator shares label row, `flex-wrap`, expanding without pushing controls (`N1`).
- Switches that trigger interactive flows (QR scanning, passwords) do not use auto-save indicators, see `choice-controls.md`.

---

## Long-running tasks

Exporting files, importing data, generating reports, batch processing: seconds to minutes. Three rules:

1. **Provide progress.** When total is known, use numbered progress: "Imported 340 / 1,200 rows", `h-2` bar `role="progressbar"` (`charts.md`, "Standalone progress bar"). When unknown, describe current phase ("Aggregating September orders…"), no infinite fake progress bars.
2. **Run in background.** Do not lock the screen with blocking modal overlays. After clicking, a persistent progress toast tracks completion: short title "Exporting 1,240 orders", secondary line "340 / 1,240 · We'll notify you when ready". Long titles wrap awkwardly on mobile (`T10`). Users can continue working. Import modals can be closed while tasks run in background.
3. **Notify on completion via toast with action**: "Exported 1,240 orders" + "Download" button; "Imported 1,180 rows, 20 errors" + "View errors". On failure, show error toast with Retry.

- Under ~3 seconds, background processing is unnecessary: button pending state suffices (`button.md`).
- **Trigger button does not spin when progress toast is active** (`N3`): one action, one progress indicator. A spinning button plus toast progress splits visual attention. Button keeps icon and text, un-dimmed, `aria-disabled` until finished to prevent duplicate submissions (`button.md`, pending state, without spinner).

---

## Spinner

- A single consistent icon across the app: Lucide `LoaderCircle`, `animate-spin motion-reduce:animate-none`, sizing to the icon it replaces (`size-4` in buttons).
- **One active task, one spinner** (`N3`). If a button spins, do not add top progress bars or "Submitting…" text elsewhere.
- Spinners only replace an icon or overlay button centers. Never place a lone spinner floating in a blank container instead of data: that belongs to skeletons.

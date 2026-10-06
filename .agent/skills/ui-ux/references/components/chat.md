# Chat with AI assistant

Conversations with an assistant inside the app: asking about metrics, drafting documents, looking up orders. Borrow patterns from existing files (`N5`): the tool-execution step list borrows the vertical line from folder trees (`tree.md`) and the ring color from timelines (`timeline.md`), suggestions borrow outlined buttons (`button.md`), errors borrow "Load failed" (`empty-state.md`).

```html
<div class="mx-auto flex h-full w-full max-w-3xl flex-col">
  <ol class="flex-1 space-y-8 overflow-y-auto px-4 py-6"><!-- scrollable message area, composer stays pinned -->
    <li class="space-y-6">
      <!-- User message: bubble on the right -->
      <p class="ml-auto w-fit max-w-[80%] rounded-3xl bg-surface px-4 py-2.5 text-base whitespace-pre-wrap [overflow-wrap:anywhere]">…</p>

      <!-- Response: no bubble, no avatar, flush with left column edge -->
      <div class="max-w-[55ch] space-y-3">
        <!-- No hover background so no px: text naturally flushes with column edge, no -ml-2 (button.md, N11) -->
        <button class="flex h-8 cursor-pointer items-center gap-2 rounded-md text-sm text-muted outline-hidden hover:text-foreground" aria-expanded="false">
          <!-- First slot size-4: ChevronRight (rotates 90° when open), or LoaderCircle before any steps arrive -->
          Used 3 tools
        </button>
        <ul class="ml-[7px] space-y-3 border-l border-border-strong pl-5"><!-- vertical line centered on chevron -->
          <li class="flex gap-2">
            <!-- Check size-4 text-muted | LoaderCircle animate-spin | CircleAlert text-red-600 -->
            <div class="min-w-0">
              <p class="text-sm text-foreground">Look up orders</p>
              <p class="text-xs text-muted">1,284 delivered orders, excluding 37 returned orders</p>
            </div>
          </li>
        </ul>
        <div class="text-base text-pretty">…</div>
        <!-- action row: Copy, Regenerate -->
      </div>
    </li>
  </ol>
  <!-- composer, see section below -->
</div>
```

## Chat shell within a page, alongside other cards ⚑

The template above is for a chat shell that **occupies the full content area**, sitting directly on the page background. When chat is **a block in a grid** (e.g. dashboard home with chat in center, metrics on right), the entire shell is a card just like adjacent cards (`card.md`): `bg-surface`, `border-border` border, radius and shadows matching the project's cards. Shell header, message area, and composer all sit on the card surface; do not leave the message area transparent against the page background.

- When the message area sits on a card background, user message bubbles switch to `bg-background` (`bg-surface` bubbles on a card surface become invisible). The composer maintains a `border-border-strong` border.
- Check: at 1440px, does the chat container outline look as crisp as adjacent cards? Automated probes report "Container declares border but border is invisible" when inner background, border, and outer background are nearly identical shades.

Do not leave the message area on the page background: a `#f7f7f8` border is even lighter than a `#f4f4f6` background, making the entire frame appear transparent.

## The two sides

- **Responses have no avatar.** Who is speaking is already distinct via bubble background and right-alignment; a robot icon preceding every answer says it a second time and consumes ~56px of horizontal text column width (`N3`). Major primary AI assistants have all dropped it. Major design systems recommend narrow embedded containers distinguish sides via means other than alignment: here that is the user bubble background, so an avatar is still unnecessary. Only add avatars when a conversation has **three or more participants** (assistant + real human support agents).
- **User messages**: `bg-surface` on page background, `rounded-3xl`, `max-w-[80%]` (narrow viewports `max-w-[85%]`), preserve user-entered line breaks (`whitespace-pre-wrap`), long contiguous URLs wrap anywhere (`[overflow-wrap:anywhere]`, `N8`). No accent color, no shadows.
- **Responses `max-w-[55ch]`** (`T11`), `text-pretty`. Order IDs, customer IDs in `font-mono` (`T17`), currency follows the app's standard formatting (`N5`).
- **Messages share one size, auxiliary content is smaller**: messages on both sides use `text-base` (this is text meant for extended reading, like an article); all auxiliary items (tool row, steps, suggestions, "Stopped midway") use `text-sm` or `text-xs`. **Process is lighter than outcome** (do not style tool step names with `text-base text-foreground`: it rivals the answer directly underneath).

## Tool execution steps

- **Top row** is a collapse/expand button `text-sm text-muted`, text darkens on hover. First slot is `size-4`: chevron when a step list exists; **spinner when no steps have arrived yet** ("Drafting response"). When the first step returns, the chevron swaps into that exact slot without shifting text (`N1`).
- **Step icons**: completed is **gray** `Check`, not green: tool usage is routine work, like recurring tasks in `timeline.md`. In progress is a spinner. Failed is `CircleAlert text-red-600`. Only the icon carries color; step title always uses `text-foreground` (`timeline.md`).
- **Step descriptions state what the tool did, not the premature answer**: scope, source, filters ("Scanned 214 orders from downtown branch in Q3", "Used Q2 data finalized on July 5"). Results belong in the response. Bad: step states "12 dealers placed orders, total $40,900", immediately above an answer opening with "In Q3, 12 dealers placed orders totaling $40,900" (`N3`).
- **Expand/collapse smoothly with `grid-rows` 0fr ↔ 1fr**, applying `inert` to the collapsed section; no conditional unmounting, no `hidden`, no `<details>` (`I30`, pattern in `accordion.md`).
- **Collapsed by default**, both during execution and upon completion. When collapsed while running, the top row shows **the currently running step title** + spinner after text ("Reading ad spend table ◌"); once done, "Used 3 tools".
- **One active task, one spinner.** Expanding the list keeps the spinner only on the step row; the top row switches to "Using 2 tools" without spinning. Bad: expanding reveals step title and spinner twice, once in the header and once in the list (`N3`).
- **When a step fails but the model can still answer, keep it collapsed**; the header reads "Used 2 tools, 1 error" **in uniform gray**; red appears only on the step icon when expanded. The answer already explains the error and remediation. Bad: auto-expanding the list, showing red "1 error" in header, red icon, step description, and response: expressing one idea four times.
- Responses that invoke no tools omit this row entirely.

## Running, stopped, error states

- **Streaming text**: a subtle cursor block at the end (`inline-block h-[1.1em] w-2 rounded-sm bg-foreground/30 align-text-bottom`), non-blinking: streaming text is already motion. No suggestions or action rows appear yet.
- **Send button becomes stop button**: same position, same size, same `primary`, solid `Square` icon, `aria-label="Stop generating"` + tooltip. The composer **remains unlocked**, allowing users to type the next prompt in advance.
- **User clicks stop**: preserve streamed content, followed by **the standard action row as for completed answers**, with `text-xs text-muted` "Stopped midway" on the same row after the two icons. Not red: the user stopped it intentionally; nothing broke (`M30`). Bad: stopping leaves only a line of text, without Regenerate or Copy: continuing requires retyping the entire question (`N6`, every state needs an exit).
- **Failed to answer**: two tiers like "Load failed" (`empty-state.md`): `text-sm font-medium text-red-600` "Assistant could not answer", followed by reason in `text-muted`, then outlined `RotateCw` "Retry" button. **Left-aligned** at the answer column, not centered like lists.

## Action row beneath responses

Ghost icon-only buttons `size-8`, with tooltips and `aria-label`: `Copy` "Copy", `RotateCw` "Regenerate". The first icon aligns vertically with the response text column: row uses `-ml-2`, **an intentional negative margin** (`N11` step 4, `button.md` under `ghost` method 3), with a comment directly above the line: `{/* -ml-2 offsets button px-2: first icon aligns with response text column; row sits inside text column so cannot reduce padding (N11) */}`.

- Present on completed responses **and stopped responses**; omitted on streaming responses and errors (error responses already have Retry). **The latest response is always visible**; older responses reveal actions on hover or Tab focus (`opacity-0 group-hover:opacity-100 group-focus-within:opacity-100`), **reserving space** so hovering does not cause layout shift (`N1`). On non-hover touch screens, keep always visible (`I11`).
- Do not add thumbs up/down, share, or read aloud unless explicitly requested. This is part of each response (like a modal's ✕), not an arbitrary add-on; note in one line at delivery.

## Follow-up suggestions

```html
<div class="space-y-2">
  <p class="text-sm text-muted">Follow up</p>
  <button class="block w-fit max-w-full cursor-pointer rounded-xl border border-border-strong bg-surface px-3 py-2 text-left text-sm text-foreground outline-hidden hover:bg-button-hover">
    Which store branch had the largest drop?
  </button>
</div>
```

- **Outlined button** (`I1`), text in `text-foreground`. Bad: gray `secondary` background + gray text on a gray page background: three blocks read as disabled buttons (`I8`) while being the heaviest visual mass under the response.
- **Only under the latest, completed response.** Sending a new message removes older suggestions.
- **One line per suggestion, maximum ~45 characters, 2–3 suggestions.** Stacked vertically, suggestion column not exceeding the response column width. Bad: an 85-character suggestion wrapping onto two lines and sprawling past the right edge of the response all the way to the composer edge.
- Clicking a suggestion invokes an empty handler (`onSuggestionSelect`, `N10`).

## Empty state: new conversation

- **No "No messages yet" text.** Here the user initiates the conversation; an empty placeholder sentence doesn't prompt action (`N6`). Replace with **2–3 conversation starters**, sharing the follow-up suggestion template, labeled "Try asking", located **directly above the composer**, exactly where follow-up suggestions sit in ongoing chats (`N5`).
- No giant greetings, no logos, no illustrations (`empty-state.md`). The composer placeholder already indicates what can be asked; greeting banners repeat this redundantly (`N3`).

## Composer

```html
<form class="mx-4 mb-4 flex items-end gap-2 rounded-3xl border border-border-strong bg-surface p-2 focus-within:border-focus focus-within:ring-2 focus-within:ring-focus">
  <textarea rows="1" class="max-h-60 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-base outline-hidden placeholder:text-muted" placeholder="Ask about orders, revenue..."></textarea>
  <button class="grid size-10 shrink-0 cursor-pointer place-items-center rounded-2xl bg-primary text-primary-foreground outline-hidden hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-30" aria-label="Send" disabled>
    <!-- ArrowUp size-4. When streaming: Square size-3.5 fill-current, aria-label="Stop generating", not disabled -->
  </button>
</form>
```

- **Pinned to bottom**, matching message column width. The message area scrolls above; the composer stays fixed.
- **Auto-grows with text** from a single line up to `max-h-60` (~8 lines), then scrolls internally. The send button **pins to bottom right** (`items-end`), rather than floating to the middle as the input expands.
- **Nested corner radii** (`M19`): outer box `rounded-3xl` (24px) = button `rounded-2xl` (16px) + `p-2`. Mismatches leave the button pressed ~4px against the border, with non-concentric curves.
- **When empty, send button is disabled with `opacity-30`**, not `opacity-50` like typical disabled buttons. This exception has a reason: this disabled button is **permanently present** on screen; 50% opacity primary yields a prominent gray square that becomes the darkest element on an empty screen.
- Focus styling matches input fields (`F20`): `--border-focus` border + soft focus ring across the entire container, not just around the textarea.
- Keyboard navigation (`N9`): Enter to send, Shift+Enter for new line. Sending triggers an empty handler (`onSend`).
- When a user scrolls up to re-read while text is streaming: show an outlined circular `ArrowDown` button, `size-8`, centered in the column directly above the composer; clicking jumps to bottom. Auto-scroll behavior is consumer logic (`N10`).

## Required states to build

A static example for each (`N2`): completed with suggestions · streaming text · running tools before text appears · drafting before tools run · one failed tool with successful response · user stopped midway · unable to answer · new conversation · edge cases (very long message, contiguous unbroken URL, multi-line composer).

# Comment thread with nested replies

Comments under a record: a task, a document, an order. Text borrows from the list row
(`list-row.md`), buttons follow `button.md`, the three-dot menu follows `layouts/overlay.md`.

- **Each comment**: avatar `size-8` (`avatar.md`), name `text-sm font-medium`, time `text-xs text-muted` with the absolute time in `title` (`T16b`), body `text-sm` that wraps, and at the bottom a `ghost` button with a `Reply` icon labelled "Reply". Two font sizes, no more.
- **Indent ~29px per level** (`ml-4` + border + `pl-3`), with a vertical line `border-l border-border-strong` (like the folder tree, `tree.md`) landing exactly on the centre of the parent comment's avatar.
- **Narrow screens indent at most 2 levels.** Deeper than that, child rows **stop indenting** and get a `text-xs text-muted` line "Replying to **<name>**" at the top of the comment instead. Indenting further leaves a ~140px text column, the reply box breaks its placeholder onto two lines, and the body wraps every two or three words (`R5`).
- **On narrow screens the reply box drops the avatar on the left** (wins back 44px), and the compose box takes the full width. The root box at the end of the thread keeps its avatar.
- **Buttons in the compose box**: send is `primary` (`I3`: one primary button per group) and is **disabled when the box is empty** (`opacity-50`); cancel is `secondary`. A single button **does not stretch to the full row on narrow screens** — `R3` only applies when the button group does not fit.
- **Four states of a comment** (`N2`), each with its own look:
  - *sending*: a `size-4` spinner next to the name, the whole block `text-muted`, the "Reply" link dimmed and not clickable;
  - *send failed*: a `text-xs text-red-600` line with an icon next to the name ("Failed to send") — **`red`, not `rose`**, because a failed send has already happened, it is not a warning before a click (`M30`) — plus two buttons "Retry" (`outline`) and "Delete" (background `rose-500/10`, text `rose-700`, per `I4`);
  - *deleted*: one grey line "This comment was deleted" with the time, **keeping all replies below it intact**, not deleting the whole branch;
  - *normal*: the three-dot menu is **always visible** (`I11`: with 3 or more actions, or a delete action, do not hide it behind hover, otherwise nobody on a phone will see it), and the "Delete comment" item turns red only on hover (`I4`).
- **Empty**: one muted line "No comments yet" (`empty-state.md`), and the compose box stays exactly where it was (`N1`).
- The count in the thread heading ("Comments 7") is a plain `text-muted` number, not a coloured badge.

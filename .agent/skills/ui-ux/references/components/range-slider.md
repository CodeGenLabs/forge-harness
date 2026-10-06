# Price range slider

Filter by a numeric range: price, area, quantity. Made of **a two-handle slider
+ two inputs "From" / "To"**. Inputs follow `input.md`, the 0-results line follows
`empty-state.md`.

- **Always pair the slider with two inputs.** The slider moves fast in steps; the inputs are the second way in and the place for odd values the steps do not reach (7,350,000). Both inputs `tabular-nums`, `text-base` on mobile (iOS zooms the page when an input is under 16px), a grey `đ` suffix inside the input, and the "From" / "To" labels above.
- **The number in an input applies only on blur or Enter**, not on every keystroke: applying a half-typed "5" of "5,000,000" right away drags the other end along and makes the list jump around (`N7`).
- **Handle `size-5`, 2px border, but a 44×44 hit area** (`before:-inset-3.5`, anchored to the *border box* — `-inset-3` only reaches 40px because the border already takes 4px; the negative value is deliberate, `N11` step 4: there is no positive way to enlarge the hit area while keeping a 20px handle, comment right above the line). **The whole track band is 44px tall** (`h-11`) and clicking the track moves the nearest handle there, so on a phone you do not have to hit the small circle (`N9`).
- **The drag area is `touch-none`**: touching this band does not scroll the page. This is a deliberate trade-off of the 44px band.
- **The two handles do not swap places.** Dragged together, they touch and stop (From = To), never pass each other. While they overlap, the right arrow key moves the right handle and the left arrow key moves the left handle.
- **Keyboard** (`N9`): Tab to each handle, arrows move one step, PageUp/PageDown move a large step, Home/End go to the ends. After a drag, focus is on the handle that was just dragged.
- **Both ends of the track carry min and max value labels** (`0 đ`, `50.000.000 đ`), `text-xs text-muted`.
- **A filter with 0 results paints nothing red** (`M30`, `empty-state.md`): one `text-sm text-muted` line where the list would be, stating the concrete number and how to loosen the filter ("No products from 47,500,000 ₫ up. The most expensive item on sale is 42,900,000 ₫; lower From to see more"). That line and the result-count line share `py-6` so the block does not resize when switching between them (`N1`).
- **Disabled**: the track, handles and both inputs sink together, cursor `not-allowed`, and **state the reason right below** ("The Basic plan cannot filter by price") — disabled without saying why is a dead end (`N6`).
- Business constraints (minimum range, rounding step) are **the user's logic**; the skill does not invent them to get one more error case (`N10`).

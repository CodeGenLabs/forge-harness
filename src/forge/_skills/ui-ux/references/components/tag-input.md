# Tag input

Type a value and press Enter to turn it into a tag: recipient emails, labels, assignees.
The box follows `input.md`, tags are pills like badges (`M7`, `F1`), error messages follow
`layouts/form.md`.

- **Enter and comma both create a tag.** Pasting a whole list splits it on commas. Backspace when **nothing has been typed yet** removes the last tag.
- **Malformed values are still added as tags**, not blocked while typing. Paste 30 emails and block them right away, and the user loses lines without knowing which ones. An invalid tag switches to a red tone with an icon; fix it by removing the tag and typing it again.
- **An error on a tag is red on that tag; the box border stays as is.** Only an error on **the whole box** (nobody added yet) turns the whole box border red like any other input. Two error scopes, two ways of showing them, never mixed (`N3`).
- **The error message says exactly what the code checks**, it does not invent extra rules (`N6`): if the check is "has `@` and a domain with a dot", the message must be "needs an @ and a domain", **not** "must end in .com" — `@saoviet.vn` is valid.
- **Long values wrap inside the tag** (`wrap-anywhere`), no `truncate`, no tooltip: an email is something the user must read in full to know it goes to the right person (`N8`). When tags run out of room they wrap and the box grows taller.
- **The remove button on each tag has an `aria-label` with the value** ("Remove ngoc.tran@saoviet.vn"), not just "Remove".
- **The placeholder is an instruction** (`T25`: "Enter recipient emails"), not a fake example like `name@company.com`. The hint line under the box says how to add ("Press Enter after typing to add a recipient") — this is something the user does not know before typing, not filler (`T20`).
- **Disabled**: the box sinks to the page background, **tags keep their colour so they stay readable**, only the remove buttons are turned off, and the reason is stated right below ("Only the campaign creator can edit this list") (`N6`).

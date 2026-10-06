# Notification bar (banner)

Sits **inside the page**, right below the page header or the top of a form. Not elevated, no shadow,
does not dismiss itself. Different from a toast (`../layouts/overlay.md`): a toast reports something that just finished
and leaves; a banner reports a **condition** that lasts until it is dealt with.

```html
<div role="status" class="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
  <i data-lucide="triangle-alert" class="mt-0.5 size-5 shrink-0 text-amber-700"></i>
  <div class="min-w-0 flex-1">
    <p class="text-sm font-medium text-amber-800">Your Pro plan expires in 3 days</p>
    <p class="mt-0.5 text-sm text-pretty text-foreground/80">After 25/09/2026, the account moves to the Free plan and keeps only 3 members</p>
  </div>
  <!-- The button and ✕ share one group, vertically centred against the text block -->
  <div class="flex shrink-0 items-center gap-1 self-center">
    <!-- outline button on white h-9, text only: "Renew plan" -->
    <!-- IconButton ✕, aria-label "Dismiss notification" -->
  </div>
</div>
```

## Three tones

| Tone | When | Background · border | Icon | Title | ✕ |
| --- | --- | --- | --- | --- | --- |
| Info | Nobody did anything wrong, just good to know | `bg-background` · `border-border` | `info` `text-muted` | `text-foreground` | Yes |
| Attention | Will become a problem if nothing is done | `bg-amber-50` · `border-amber-200` | `triangle-alert` `text-amber-700` | `text-amber-800` | Yes |
| Error | Already broken, must be dealt with | `bg-red-50` · `border-red-200` (`M30`) | `circle-alert` `text-red-600` | `text-red-700` | **No** |

There is no `rose` banner: danger is a warning before clicking, not a
condition (`M30`). There is no green "success" banner: a finished task is a toast.

## Rules

- **Only the icon and the title carry colour. The description is `text-foreground/80`**, do not tint the whole paragraph. The description is `text-pretty` (`T10`): the banner spans the full column, and a two-line sentence easily leaves one word stranded on the last line ("…to keep the" / "plan."). Two lines both amber or both red make the whole block shout, and a long description is more tiring to read than dark text.
- **Two levels**: the `font-medium` title says what happened; the description says the consequence or the reason, with numbers and dates. If one sentence is enough, drop the second level.
- **The button and ✕ share one group, `self-center`** against the text block. Do not centre the button while the ✕ clings to the top corner: two things in the same row at different heights is an obvious bug.
- **Buttons in a banner are text only, no icon**, white background with a thin border (`outline`), `h-9`. The same exception as a confirmation dialog: the icon already stands at the start of the block. At most one button. No `primary` button in a banner: the tone colour already draws the eye.
- **Directions to another place are a link or a button**, not plain text. "Change the billing address in Settings, under Billing": "Settings" is a link, or add an "Open settings" button.
- **Errors have no ✕**: they stay until resolved. Info and attention have ✕. Whether it comes back after dismissal, and after how long, is logic for the user to decide.
- **As wide as the content area**, `rounded-2xl`, `p-4`. No shadow (`M15`). At most two banners stacked at once; more means the page has another problem that should be consolidated.
- **`role`**: errors `role="alert"`, the rest `role="status"`.
- Money in a sentence uses `đ`, not `₫` (`charts.md`).

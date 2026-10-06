# Form layout and validation

With no wireframe, build the default layout (or the one the conditions in the request
pick), then report it in one line at delivery. See question 4 in `../../SKILL.md`.

---

## Sign in, sign up

**A. One column, centred on the screen** (default, fits every case)

```
        ┌─────────────────┐
        │ logo            │
        │ Title           │
        │ (lead line)     │
        │                 │
        │ label           │
        │ [input        ] │
        │ label  forgot?  │
        │ [input        ] │
        │ (error slot)    │
        │ [   BUTTON    ] │
        │ ─── or ───      │
        │ [Google button] │
        │ no account? New │
        └─────────────────┘
```

Block width `max-w-md`. **No border** — this is a standalone card, see `M29`.
Do not centre the text inside the form; centre only the block as a whole.

- **The product logo is always there**, placed above the title, using the exact mark that sits in the sidebar
  (if the project has a logo component, import it; if not, build one per `../components/logo.md`).
  The auth screen is the only place where the user is not yet inside the app; without the logo the page reads like
  an admin form belonging to nobody, and the user is not sure they are signing in to the right
  place. The logo here is structure, not the "add a logo" that `S3` bans.
- **A lead line only when there is something to say** (e.g. "14-day trial, no card needed" when the request
  says so). Do not invent a greeting like "Welcome back!" just to fill the template.

**B. Two columns, form left, image right** (fits when you want a testimonial or a product image)

```
┌──────────────┬──────────────┐
│ form as in A │ image / cust-│
│              │ omer quote   │
└──────────────┴──────────────┘
```

---

## Defaults for auth screens — build directly, report in one line

**Do not ask four questions.** A user who types "build a sign-in screen" wants to see a sign-in
screen, not fill in a survey. Build to the defaults below, then **say
one line** telling them what you chose.

| Item | Default | Why |
| --- | --- | --- |
| **"Forgot password?"** | **Yes** | Without it, a user who forgot the password has no way in. This is the only element whose absence breaks function, not just looks |
| **Remember me** | **No** | It changes the session lifetime on the **backend**; it is not just a checkbox. Drawing it while the backend does nothing deceives the user — that is worse than leaving it out |
| **Social sign-in** | **Yes, one Google button** ("Sign in with Google" / "Sign up with Google") | Almost every app with a sign-in screen has this button, and users look for it before the email field. Without it the page looks half-built. Leave the handler empty and report at delivery that a provider needs wiring. For developer products add GitHub. Both sign-in and sign-up have it, with the same set of providers |
| **Placeholder** | **Yes**, an exception to `T25` | A standalone screen where the whole page has only a few fields: bare empty fields look unfinished. Wording in the section below |
| **Cursor when the screen opens** | **Already in the first field** (`autoFocus`) | The screen has one job, typing. Apply it to **every** screen in the flow: sign in, sign up, each forgot-password step, OTP. If one step has it and another does not, the user has to tap the field again on the new step |
| **"Confirm password"** | **No** | The password field already has an eye button to check it. Most apps have dropped the retype field; adding it costs every sign-up an extra field to guard against an error the eye button already guards against |
| **Field and button height** | **`h-12`** | The only exception to `h-11 md:h-10` (`budgets.md`): a standalone form in the middle of the page, the only thing on the screen, so one step larger fits. Forms inside the app, modals and settings do not get this |

**The report line, placed together with the layout report at delivery:**

> I built it with "Forgot password?" and a Google button (the button is not wired yet; Google
> sign-in needs configuring on the backend); there is no remember-me because it needs the backend to change the session lifetime.
> Say so if you want another provider or want Google removed.

### Placeholders on auth screens

A short instruction, no sample email (`name@company.com` gets misread as pre-filled
text, `T25`), no `••••••` (`T26`):

| Field | Placeholder |
| --- | --- |
| Full name | `Enter your full name` |
| Email | `Enter your email` |
| Password (sign in) | `Enter your password` |
| Password (sign up) | `Create a password`; the hint "At least 8 characters" still sits **below the field** because it must stay visible while typing |

The error message still must not repeat the placeholder: "Email is missing", not "Enter your email".
This exception applies only to standalone auth screens. Forms inside the app, modals and settings still
follow `T25`.

One line, not a questionnaire. If the user **says nothing**, treat it as
agreement, build to the defaults, move on.

**With no backend wired, a valid submit must still move forward.** Pressing "Sign up" on a correct form and
having nothing happen makes the reviewer think the button is broken. Simulate it: the button
spins for ~1 second, then goes to the next step if it is built (sign in → the app's first page, sign up → enter OTP → the app's first page, forgot
password → enter code, new password → done screen). The API call function stays empty, with a comment where it plugs in.

**The next step shows exactly what the user just typed.** Typing `an@company.com` on the sign-up page means the
OTP page says "A code … was just sent to an@company.com", not the OTP page's sample email (the reviewer
thinks the code went to the wrong address). Pass it through router state; the sample email is used only when the OTP page is opened directly by link, and
on the `/states` page. Same rule as `S6`: fake data in a flow must match across steps.

**If they say they want it added, add it right away; do not ask again.** "Add remember me" is clear enough —
build it directly, do not ask "do you want it pre-checked, where should it go". The defaults below
already answer those questions.

### Remember me — when they ask for it

- **Not pre-checked.** Pre-checking decides security on the user's behalf.
- Label it plainly, **"Remember me"**; avoid a literal, machine-translated sounding phrase (`T24`).
- Put it on the same row as "Forgot password?": checkbox left, link right.
- Say one sentence at delivery: this needs the backend to change the session lifetime, it is not just a checkbox.
- If the app holds sensitive data or is often used on shared machines — banking, health records, internal admin — **say one sentence advising against it**, then still do what they want.

---

## "Forgot password?"

**On the same row as the "Password" label, aligned right.** Not below the input, not
below the submit button.

```html
<div class="relative flex flex-col gap-2">
  <label for="password" class="w-fit cursor-pointer text-sm font-medium">Password</label>
  <div class="relative"><!-- password input + eye button --></div>
  <!-- Comes AFTER the input in the DOM, absolute up onto the label row -->
  <a href="/forgot-password" class="absolute top-0 right-0 text-sm text-foreground outline-hidden hover:underline">Forgot password?</a>
</div>
```

**Tab order: email → password → eye button → "Forgot password?" → Sign in.** If the link is placed
in the label row with `flex justify-between`, it comes before the password input in the DOM: after typing
the email, pressing Tab lands on the link, and pressing Enter out of habit leaves the sign-in page. So the link sits after the input in the DOM, with `absolute top-0 right-0` so it still shows on the
label row; its position on screen does not move a pixel. Do not fix it with `tabindex="-1"`: keyboard
users lose their way to the link entirely.

**Why not below the input** — that line already has an owner: the hint normally, the error message
when wrong. And "typed the wrong password" is exactly when this link needs to be clearest, so the two peak
at the same moment in the same place. The label row always has just one line and never
collides.

**Why not below the submit button** — there it blends into the "or / sign in with
Google / no account?" zone, becoming a stray link among a pile of links.

Three settings:

| | Use | Why |
| --- | --- | --- |
| Size | `text-sm`, **same as the label** | On the same row, a size mismatch looks like a misalignment. Smaller also shrinks the mobile tap target |
| Colour | `--foreground`, **not dimmed** | Faint text reads as locked (`I8`). This is the only way out for someone who cannot get into their account — making it look disabled blocks exactly the person who needs it |
| Weight | `font-normal` (the label is `font-medium`) | Distinguish with **one** thing only. `M13`: hierarchy comes from font size, weight, text colour — using all three at once is too much |

**A link, not a button.** As a button inside the form it competes with the sign-in button
right below. It has `cursor-pointer` and underlines on hover. It differs from the dashboard's "View all"
(`I7`, also a link) in colour: here `--foreground` is not dimmed, because it is the only way
out for someone who cannot get into their account.

---

## Forgot password flow

Three steps and a done screen, the same card, the same template as the sign-in screen: logo, `h-12` fields,
placeholders. Sending a 6-digit code or a link in an email is a backend matter; the default is to build the code
because the whole flow stays in one tab; report it in one line at delivery.

1. **Enter email.** Title "Forgot password", a lead line saying what they will get ("Enter the email
   you signed up with; a password reset code will be sent there"). If they came from the sign-in page with the email field
   already typed, pre-fill it. Button "Send code". Below the card, a link **"Back to sign in"**,
   the way most apps name this way out.
2. **Enter code**, per `components/otp-input.md`. The lead line **does not confirm whether the email has an
   account**: "If this email is registered, a 6-digit code has been sent to …". Saying
   "Email not registered" lets strangers probe who has an account.
3. **New password.** The lead line says which account is being changed: "For account
   **an@company.com**" (email printed with `EmailText`). One "New password" field with an eye button, hint
   "At least 8 characters" below the field, **no retype field** (same reason as the sign-up page, defaults
   table above). Button "Save password". The form has a hidden `username` field carrying that email so the
   password manager saves the right account (`I28`).
   - **When the reset session expires, replace the whole form** with a message and one `primary` button
     "Send a new code" (`I3`: the only way out) (resends to the same email, goes to step 2). The message also says what the user
     worries about: "Your old password has not been changed". Do not leave the password field and the "Save password" button
     under the error block: pressing Save again still fails, and if the error block has its own button the screen has two
     buttons competing for the main job (`N5`).
4. **Done.** "Password changed", a "Sign in" button back to the sign-in page with the email pre-filled.
   If the backend signs the user in right after the change, drop this screen and go straight into the app; report at delivery.

---

## Social sign-in buttons

The count decides the layout:

| Buttons | Layout |
| --- | --- |
| 1–2 | Stacked, full width, with text: `Sign in with Google`. Outline button (`variant="outline"`), original logo left of the text, same height as the input |
| **3 or more** | **A** below. Report in one line at delivery: say so if you want them stacked with full text |

**The "or" divider** between the main button and the social buttons:

```html
<div class="my-6 flex items-center gap-3">
  <span class="h-px flex-1 bg-border-strong"></span>
  <span class="text-xs text-muted">or</span>
  <span class="h-px flex-1 bg-border-strong"></span>
</div>
```

Draw it with **`--border-strong`**, not `--border`. `--border` (`#f7f7f8`) is the hairline between
list rows, where text on both sides supports the eye; alone on a white card it is only
1.06 : 1, the two lines vanish, and the word "or" is left floating between two buttons.

Stacking 3–4 full-width buttons makes the social part **longer than the real form**, and
the user has to scroll past a row of identical buttons to find the email field. The main thing
on the screen gets pushed up into a secondary role.

**A. Columns, icon only** (default with 3 or more buttons)

```
        │ [    Sign in    ]  │
        │ ─── or ───         │
        │ [ G ] [ GH ] [ X ] │
        └────────────────────┘
```

- Square buttons, same height as the input, split evenly with `grid-cols-3`.
- **`aria-label` is required** — with no text, a screen reader sees only an empty button.
- Logos keep their original colours per `F16`; do not grey them out for "consistency".
- More than 4 buttons no longer fit one row: keep the 2–3 most used, drop the rest entirely.

**B. Still stacked, with full text** (only when the user asks)

Full text reads more clearly than bare icons, at the cost of vertical space. If you pick B, state
that trade-off at delivery.

**Remember what is primary.** The email field and the sign-in button are the main characters of the screen;
the social block is a shortcut. If the shortcut takes more space than the main path,
the layout is wrong, however nice each button is.

---

## Marking required fields

The user must know which fields are required **before** pressing submit, not after
getting an error. Pick one of two methods by ratio, do not use both:

| Situation | Marking |
| --- | --- |
| Most fields required | Write `Optional` next to the label of the few optional fields |
| Most fields optional | Put `*` after the label of required fields, plus a note line at the top of the form |

The `*` is **red**, the same hue as the error message (`text-red-600 dark:text-red-400`), a named exception in `M9`,
`aria-hidden="true"`; the input still carries `required` so the screen reader announces "required".
This is the common convention: users are used to "red * = must fill"; in grey they have to
stop and wonder what the mark means.

The `*` in the note line ("Fields marked * are required") is red just like on the labels: a note that explains a symbol must print that exact symbol; grey here and red there are two different marks.

```html
<label for="full-name" class="text-sm font-medium">
  Full name <span aria-hidden="true" class="text-red-600 dark:text-red-400">*</span>
</label>
```

---

## Multi-field forms

**A. One vertical column** (default, under 8 fields)

Labels sit above the inputs, not beside them. Group related fields, and separate groups
with larger white space, not with lines.

**B. Sections with headings** (8 fields or more)

```
Personal details
[in] [in]
[input       ]

Address
[input       ]
[in] [in] [in]

              [Cancel] [SAVE]
```

Action buttons sit at the end, aligned right, primary on the far right.

**Rarely touched optional fields** (codes, technical options, all with defaults): group them into a
collapsed "Advanced settings" area after the fields, built as a text line with a chevron, no frame, the fields
inside aligned in the same column as the ones outside. Pattern in "Collapsible area in a form" in
`../components/accordion.md`.

**C. Multi-step** (when **the steps depend on each other** or it is a one-time flow: onboarding, checkout, profile registration. A long form with independent parts uses type B with sections, like a settings page — a large number of fields is not a reason to split into steps)

Step bar on top, one screen per step, "Back" and "Next" buttons at the bottom. Do not use
multi-step for short forms; it only slows things down.

**The step bar:**

```
(✓)━━━━━━━━━━━━━━━━(2)─────────────────(3)
Company details     **Contact person**  Confirm
```

| State | Circle `size-8 rounded-full` | Label | Connector after it |
| --- | --- | --- | --- |
| Done | `primary` background, icon `check` `size-4` `primary-foreground` | `text-foreground` | `h-0.5 bg-primary` |
| Current | `border-2 border-foreground bg-surface`, number `font-semibold` | `font-semibold text-foreground` | `h-0.5 bg-secondary` |
| Upcoming | `bg-secondary` background, number `text-muted` | `text-muted` | `h-0.5 bg-secondary` |
| Error | `bg-red-600` background, `!` `text-sm font-bold text-white` (a character, not an icon) | `text-red-700`, error message `text-sm text-red-600` under the label | per its state |

- **The "upcoming" parts use `--secondary`, not `--background`, not `--border`.** The step bar usually sits on the page background, outside the card. A `bg-background` circle matches the page background exactly and dissolves, leaving just the number "3" floating at the end of the connector; `--border` (#f7f7f8) is even **lighter** than the page background (#f4f4f6), so the connector and thin upcoming segment are nearly invisible. `--secondary` (#e7e8ec) reads on both the page background and a white card.
- **The error circle is a solid red circle with a `!`, not a red-bordered circle wrapping a `circle-alert` icon.** That icon has its own circle; inside a bordered circle it becomes two nested circles, messy and tiny. The solid circle shares the template of the done step (solid + symbol), changing only colour and symbol.
- Build it with `<ol>`, the current step has `aria-current="step"`. Steps are `flex-1`, **the last step alone is `flex-none`** (no connector, no `pr`): the row spans exactly from the left edge to the right edge of the card below. With the last step at `flex-1`, the last column has just a circle and a short word, leaving a gap on the right, and the whole bar sits left of the card.
- **The horizontal bar has labels only, no description under the label**, when each step already has a title and lead line in the card (default, see "One-step frame" below). A description on the bar plus a lead line in the card is two sentences for one idea, 100px apart (`N3`). The bar says "Can be left empty, invite later", the lead line says "Leave it empty if not needed, invite later from the Members page", the field label says "Optional": three "optional"s on one screen. A description under the label is used only when there is no separate step title beside it (usually a vertical bar left of a long form); then `text-sm text-muted text-pretty`, allow wrapping, no `truncate`. Without `text-pretty` a single word is left alone on the last line.
- **Done steps are clickable to go back** (circle + label are one button, `cursor-pointer`, label underlines on hover). Upcoming steps are not clickable. Whether skipping ahead to upcoming steps is allowed is logic; the user decides. **While submitting on the last step, done steps are `disabled`** like the "Back" button: looking clickable (underline on hover) while going nowhere tells a lie.
- **Narrow screens below `sm` collapse**; do not force three columns: one line "Step 2 / 3" `text-sm font-medium tabular-nums` + a thin `h-1` bar split into segments by step count. **The step name is not written on this line when the card right below already has a step title**: "Step 1 / 3 · Workspace details" followed by the card title "Workspace details" 50px later is repetition, the same reason breadcrumbs do not show the current page (`layouts/app.md`). Done step segments are `bg-primary`, **the current step segment is `bg-primary/30`** (half-strength), upcoming `bg-secondary`. Three tiers like the three circle kinds on wide screens. Do not fill the current segment at full strength: on the last step it would look as if everything is done. Do not leave the current segment grey like upcoming either: the text says "Step 2 / 3" while the bar lights only one segment, reading as a missing bar. **The case with a step name** ("Step 2 / 3 · Contact person", when there is no separate step title below): **the name may wrap**, `text-pretty`, no `truncate`: the step name is something the user needs to read (`N8`), and changing step changes the whole screen, so the line growing by one line does not count as a jump (`N1`). The "Step 2 / 3 ·" part is `whitespace-nowrap` so it does not break in two. Descriptions hidden. Do not let step columns wrap into two rows (`R6`). If a step has an error, that step's segment is red, and **add one `text-xs text-red-600` line under the bar saying which step is wrong** ("Step 1 is missing the tax code"), clickable to go back. A red segment with no text leaves the narrow screen without knowing where the error is.
- No more than 5 steps. More means the form needs its steps merged.

**One-step frame:**

```
Create new workspace                   <- page name, once
(1)━━━━━━━━━━(2)──────────(3)           <- step bar, labels only
┌──────────────────────────────────┐
│ Workspace details                │   <- h2 = step label, text-base font-semibold
│ One lead line saying what's new  │   <- text-sm text-muted
│ [in] [in]                        │
│ ──────────────────────────────── │
│ [Cancel | Back]           [Next] │
└──────────────────────────────────┘
```

- **Each piece of information is said once.** Step name: the step bar (map of the whole flow, like the selected item in the sidebar) and the card title. The lead line says only what is not elsewhere: why it is needed, where it is used, where to invite later. **"Optional" only next to the field label** (section "Marking required fields"), not repeated in the lead line or the bar.
- **Focus**: when the page opens, the cursor is already in the first field of step 1 (`autoFocus`, same reason as the sign-in screen above). On moving to another step, move focus to the `h2` (`tabIndex={-1}`, `outline-hidden`): the screen reader reads the new step name, and on narrow screens the page returns to the top of the step instead of staying at the button row at the bottom.
- **Bottom button row**: the back action on the left, the main button on the right, `border-t border-border pt-5 mt-8`, same height as the fields (`h-11 md:h-10`). On step 1 the back action is "Cancel" (leave the flow), later steps "Back". The main button is "Next"; on the last step it is the verb of the whole flow ("Create workspace", not "Finish"). Pressing "Next" validates only the current step; if wrong, stay and focus the first invalid field. Going back loses nothing already filled.
- **Block double-clicks on the main button**: the final button appears exactly where the "Next" button was, so double-clicking "Next" on the second-to-last step makes the second click submit before the user has read the confirm step. `onClick` ignores `event.detail > 1` (Enter has `detail = 0`, not blocked).
- **The confirm step is grouped by step, each group with an "Edit" link** at the right edge of the group heading, going back to exactly that step. This is what every checkout page does. On narrow screens the step bar is just a text line and a thin bar, not clickable, so without "Edit", changing the name from step 3 means pressing "Back" twice through step 2. A group is a label–value block (`../components/description-list.md`), group heading **`text-sm font-semibold`**, the "Edit" link is a text link `text-sm text-foreground/70` like `I7`, `text-foreground` + underline on hover, not an outline button. **The group heading must differ in type from the values**: values in a label–value block are already `text-sm font-medium text-foreground`; a group heading that is also `font-medium` is identical, and on narrow screens (label above, value below) "Workspace details" reads as one more value. Do not switch to small grey text: a group heading fainter than the sub-labels below inverts the hierarchy. No lines between groups; `gap-6` white space separates them enough. After editing, pressing "Next" walks sequentially as usual, not jumping straight back to the confirm step (jumping straight is logic; the user decides).

---

## Error state

Errors show **below the input**, not in the placeholder, not in a tooltip.

```
label
[input                     ]   <- solid red border; faint red halo only while focused
This email is already in use   <- red text, text-xs, right below the input
```

- Solid `red-500` border, very faint `red-500/10` ring. Do not fill the whole input red.
- The error message says **how to fix it**, not "invalid". "This email is already in use", not "Invalid email".
- **The error message must not repeat the placeholder or label text.** Repetition is a sign it carries no extra information — see the section below.
- **Fields auto-filled from another field** (slug from name, code from product name): when the source field is empty, **only the source field shows an error**, leave the dependent field alone, because typing in the source fills the other. The dependent field shows an error only when the user has edited it themselves, or when the source has text but the generated value is still wrong (too short, duplicate). Flagging both means pressing Next on empty gives two red lines "Workspace name is missing" and "Slug is missing", while typing the name alone clears both (`N3`).
- Timing hint (the user decides): show errors after leaving the field or pressing submit, not on the first character. The skill only cares how the error **looks**; build it as a static state of the field.
- **Once a field is fixed its error message goes, but its space stays** until the next submit (`min-h-4` on the line below the input, one `text-xs` line). Removing the message immediately makes every field below jump up 16px just as the user moves the mouse down to the next field (`N1`). Fields that already have a hint line do not need it: the hint returns to the exact spot the error left.
- **Default: inline errors only, no summary banner.** On submit with errors, scroll to and **focus the first invalid field**; each wrong field gets a red border + one sentence below it. Most in-product forms (SaaS, work tools) do this; design systems for public services add an error summary box at the top with links to each field, because their forms are long and filled in by first-timers; the skill keeps that case only for very long forms (case 2 below). A banner listing errors on a typical form just repeats the same sentences already under each field: two signals for one idea (`N3`), and the whole screen glares red (Settled: "in practice nobody puts a red block at the top"). The old rule "forms longer than one screen get a banner" is wrong, because at 375px every form is longer than one screen.
- **Banners are used for two cases only:**
  1. **Errors not tied to any field**: network loss, session expiry, no permission, server-side duplicate data. A one-line banner saying what happened and what to do next, no list.
  2. **Very long forms split into several headed sections** (from about 12 fields, or when you must scroll past several sections): an error in the last section cannot be seen from the top. Then the banner lists each error with a link jumping to the exact field, and inline errors **stay** too.

```html
<div role="alert" class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
  <p class="text-sm font-medium text-red-700">Not sent yet, 3 things need fixing</p>
  <ul class="mt-2 space-y-1 text-sm text-red-600">
    <li><a href="#title" class="underline underline-offset-2 outline-hidden">Title</a>, not filled in</li>
  </ul>
</div>
```

This is the only place allowed a red background. Inputs never are.

---

## Hints and error messages are two different things

A field has **three** places holding text, each with one job. Mixing them up is the most common
form mistake, and it is very hard to spot in a screenshot because "it still looks like enough text".

| Place | Job | Colour | When shown |
| --- | --- | --- | --- |
| **Label** | What this field is | `--foreground` | Always |
| **Hint** | What the user does not know before typing | `--muted`, `text-xs` | Always |
| **Error message** | What was just typed wrong, how to fix it | red, `text-xs` | Only when wrong |

**There is only ONE line below the input.** On error the message **replaces** the hint; it does not push the hint
down into two stacked lines.

### Fields with a character limit

If the hint says "Up to 120 characters", the field must show where you are relative to that limit.
Saying it without counting means someone typing a 132-character sentence does not know they are over until submit
blocks them.
How the big design systems do it:

- **The counter shares the hint's line, aligned right**: `flex justify-between gap-3`, hint left, counter
  `shrink-0 text-xs text-muted tabular-nums` right, reading "98/120". Still one line below the input.
- **Show it only once about 80% of the limit is typed.** Below that there is only the hint; counting from the first
  character puts a constantly jumping number right next to where the person is composing their sentence.
- **Over the limit, the counter turns red** ("132/120", red text like an error message), the hint stays. If submit is pressed
  while still over, the error message replaces the hint and says how to fix it: "Longer than 120 characters, remove 12".
- **No `maxlength`.** A hard block cuts a pasted long sentence mid-word with no warning,
  and the user loses the tail. Allow typing and pasting over, then report.
- The counter is in the field's `aria-describedby`, updated inside an `aria-live="polite"` region.

### Three questions before writing a line of red text

1. **Does this sentence repeat the placeholder or label?** If so, drop it. A placeholder reading "Enter your password" with red text below also reading "Enter your password" makes the user read the same sentence twice, and they still do not know what went wrong.
2. **Does it tell the user what to do next, or just that the field is empty?** The eye already sees the field is empty.
3. **Is it an error, or a hint painted red by mistake?** "Enter the email you use to sign in" is a hint — it is true even when the user has done nothing wrong. Hints are grey and shown up front; do not wait for an error to turn them red.

### What to write for an empty field

| Field | Wrong | Right |
| --- | --- | --- |
| Email | `Enter your email` *(repeats placeholder)* | `Email is missing` |
| Password | `Enter your password` *(repeats placeholder)* | `Password is missing` |
| Badly formatted email | `Invalid email` | `Email must contain @` |
| Short password | `Invalid password` | `Password needs at least 8 characters` |
| Wrong sign-in details | `Sign-in failed` | `Email or password is incorrect` |

The last row is a special case: saying exactly which one is wrong **is a security hole** — outsiders can probe
which emails have accounts. So in this one case vagueness is deliberate, and the error message goes
in the error slot above the Sign in button (see the sign-in wireframe at the top of the file), not under a specific field.
After this error: **keep the email, clear the password field and put the cursor there**, error block `role="alert"`
so the screen reader reads it at once. Users nearly always retype the password rather than edit it
character by character, and with the old dots still in the field they have to select and delete first (the way Google, GitHub,
Microsoft all do it). Do not paint any field red, because you do not know which one is wrong. Typing again into the field leaves the error
block standing until the next submit; it does not vanish mid-typing and make the button jump up (`N1`).

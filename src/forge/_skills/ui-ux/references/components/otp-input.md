# OTP code input

Six single-digit boxes, used on email verification and two-step sign-in screens. A standalone screen
centred on the page follows the lone card (`M29`) and the `h-12` height of the verification form
(`layouts/form.md`).

```html
<p class="text-sm text-muted">A 6-digit code was just sent to</p>
<p class="text-sm font-medium">
  <!-- Print the email with EmailText (description-list.md), not plain wrap-anywhere -->
  tran.anh.tuan@gmail.com
  <a href="#" class="ml-1 whitespace-nowrap font-normal text-muted underline underline-offset-2 outline-hidden hover:text-foreground">Change email</a>
</p>

<fieldset class="mt-6">
  <legend class="mb-2 text-sm font-medium">Verification code</legend>
  <div class="grid grid-cols-6 gap-2 sm:gap-3">
    <!-- The first box has autocomplete="one-time-code" and maxlength="6": iOS autofills all six digits into
         the first box, onInput redistributes them to the next five. With maxlength="1" autofill is cut to one digit. -->
    <input inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="Digit 1 of 6"
      class="aspect-square w-full min-w-0 rounded-xl border border-border-strong bg-surface text-center text-2xl font-semibold tabular-nums outline-hidden focus:border-focus focus:ring-2 focus:ring-focus" />
    <!-- The other 5 boxes are identical but maxlength="1", aria-label "Digit n of 6", no autocomplete -->
  </div>
  <!-- The error line is always present, empty when there is no error: reserves space so the Confirm button does not drop right under the pointer -->
  <p aria-live="polite" class="mt-2 min-h-4 text-xs text-red-600"></p>
</fieldset>
```

- **The box border is `--border-strong`**, like every input (`M14`, `N5`), not the card's lighter `--border`.
- **Square boxes `aspect-square`, six boxes splitting the width evenly**, `min-w-0` so they do not overflow at 375px. Digits `text-2xl font-semibold tabular-nums`, centred.
- **Pasting the whole code into any box works**, split across the six boxes (needs an `onPaste` reading the clipboard; if the project has `input-otp` like shadcn's InputOTP, use it — it is one real input drawn as six boxes and already handles autofill and paste); after typing a digit the cursor moves to the next box; Backspace in an empty box moves back to the previous one. This is how the boxes respond, and the skill owns it (`N9`). Whether typing all six digits submits automatically or waits for Confirm is logic; the user decides.
- **The target email is shown bold, in full, not truncated** (`N8`), with a **"Change email"** link: if the email was mistyped, this is the only way out (`N6`). **Clicking it returns to the previous step with the entered data prefilled** (name, email; leave the password empty, do not carry passwords through router state), with the cursor in the email field because that is what needs fixing. Returning to an empty form makes the user retype everything just to fix one letter of the email. The link is `whitespace-nowrap`: when a long email pushes it to the next line, "Change email" moves down as a whole instead of breaking into "Change" at the end of one line and "email" on the next (`T10`).
- When the screen opens, the cursor is already in the first box.
- **The resend countdown** uses `tabular-nums`, otherwise the digits jiggle every second (`N1`). Two states, build both (`N2`):
  - Counting: "Didn't get the code? Resend in 0:57", the whole sentence `text-muted`.
  - Finished: "Didn't get the code?" `text-muted` + **"Resend code"** as a ghost button with `text-foreground font-medium` text and a hover. Do not leave it grey like while counting; it looks still locked (`I8`).
  - **Clicking "Resend code" confirms the send**: the line changes to "New code sent · Resend in 1:00" inside a `role="status"` region, with "New code sent" kept until the countdown ends. Clear the six boxes, cursor back to the first. If only the counter restarts, the user is not sure the click registered, and a screen reader hears nothing.
- **Wrong code**: all six boxes get a `red-500` border (the red ring only on the focused box, `input.md`), and the error message under the boxes says how to fix it: "That code is not right, check the latest email". **Expired code**: the message "The code has expired, click Resend code to get a new one", with **no** button inside the message. Two different errors, two different messages.
- **After a wrong or expired code: clear the six boxes, cursor back to the first**, keeping the error message and red border until the first digit is typed. The user almost always retypes the whole code (rechecking the email or getting a new code); if the six old digits stay, they have to press Backspace six times first. Same as the password field after a failed sign-in (`layouts/form.md`). The `/states` page draws this state as six empty boxes with red borders, not six red digits.
- **One job, one button.** When the code expires the countdown has also ended, and the line below already has "Resend code". Adding "Send a new code" in the error message means two buttons doing the same job under different names, and the user has to guess whether they differ (`N3`, `N5`).
- **The error line reserves space** (`min-h-4`, one `text-xs` line, empty when there is no error). The error message is `text-xs` like every error under an input (`input.md`, `layouts/form.md`). The user clicks Confirm, the error appears, and without reserved space the button drops one line right under the pointer (`N1`).
- **Clicking Confirm before all six digits are entered must give feedback**: the message "Enter the code" (no digits typed) or "The code is missing digits, enter all 6", a red border on **the empty boxes** (digits already typed are not wrong, keep the normal border), and the cursor jumps to the first empty box. A silent click makes the user think the button is broken.
- The Confirm button is `primary`, full card width, `h-12`. While checking the code, a spinner replaces the icon or is added before the text, and the text stays the same (`components/button.md`).

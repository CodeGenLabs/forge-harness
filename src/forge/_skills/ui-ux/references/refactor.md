# Refactoring an existing codebase — rule L

Open this file when the job is **changing the interface of a running project**, not building
a new screen. The two jobs differ completely in risk and in the order of steps.

Distilled from a real refactor: Next 16 + React 19, 237k lines of
TS/TSX, 14,218 lines of CSS, 4.5 months old, with real money flowing through it.

---

## Four defaults before typing the first line

Do not ask. Take the defaults below and **restate all four at the top at delivery**. If the request says
otherwise, follow the request.

1. **The default goal is "capture the current state", not "change the look".** Only when the request says "redo the interface", "make it prettier", "in the skill's style" is it a change of look. The two jobs differ completely in risk. A change of look goes through branch `U` (`design-process.md`) first, then cleanup by `L`; if the request says review or keep the brand, branch `V` (`review.md`) takes the place of `U`, and only the rows the user picks get fixed (`SKILL.md` question 1).
2. **Keep pixels by default.** No refactor step may change the interface; any spot that breaks a skill rule goes on the "suggested fixes" list at delivery (graded by `V1` in `review.md`), not fixed in the same pass. **A project with more colour than the skill's style is not breaking a rule**: do not suggest pulling it back to grey; only suggest when it breaks a rule about meaning or readability (top of `principles.md`: red for something that is not an error, coloured text below 4.5:1, colour alone carrying meaning). This is the constraint that decides how tokens are chosen.
3. **The person who approves "still looks right" is, by default, the person who assigned the job.** At delivery give the list of screens they need to open and compare, with before/after shots if you could take them.
4. **Existing docs: do not delete, only mark what is wrong.** In that project, `design-system.md` described a different product, not itself — but one section was still real knowledge, and wiping it would have lost that.

---

## L1. Measure before concluding. Always.

The feeling "this code is a mess" is almost always **right about the symptom** and almost always
**wrong about the cause**. In that refactor, every initial assumption was off once measured:

| Assumed | Measured |
| --- | --- |
| "There is no design system" | There are 3 layers: 20KB of docs + a 304-line `tokens.css` + 93 colour variables |
| "`globals.css` is where the CSS lives" | The real store is `prototype.css` — 8,668 lines, 2.4 times bigger |
| "Nobody uses tokens" | 2,245 uses of `var(--…)`, token/raw-colour ratio 3.6:1 |
| "Tailwind is not installed" | Installed, `@import`ed, only `@theme` is missing |
| "Sloppy code" | Comments state the date + the cause + why the obvious fix is wrong |

The opening measurement commands, run **before opening any file**:

```bash
# where the CSS is, and how much
find app components src -name "*.css" 2>/dev/null | xargs wc -l | sort -rn | head

# token compliance
grep -roE 'var\(--' --include='*.css' . | wc -l          # correct use
grep -roE '#[0-9a-fA-F]{3,8}\b' --include='*.css' . | wc -l  # raw colours

# debt at the component layer — change *.tsx to match the project:
# .vue, .svelte, .html, .php, .erb... Getting 0 because grep used the wrong
# file extension and concluding "clean" is wrong.
grep -rl "<button" --include="*.tsx" . | wc -l
grep -rl "style={{\|style=\"" --include="*.tsx" --include="*.html" . | wc -l

# duplicate selectors = sign of accretion
grep -hoE '^\s*\.[a-zA-Z][a-zA-Z0-9_-]*\s*\{' $(find . -name '*.css') \
  | tr -d ' {' | sort | uniq -d | wc -l
```

---

## L2. Tell discipline debt from architecture debt

**Discipline** debt = the author was sloppy. **Architecture** debt = the author **had nowhere
else to put the code**.

The sign of architecture debt: **high-quality comments in the code but the structure
is still bad**. The author knew what they were doing; they just ran out of road.

When you meet architecture debt, blaming the author is useless and wrong. You must **build the
container first** — a primitive layer, CSS Modules, a component folder — and only then can you clean up.

---

## L3. Do not trust the docs. Trust the built CSS.

In that project, three sources described one type scale, and all three differed:

| Token | `docs/design-system.md` | `AGENTS.md` | token file (what actually runs) |
| --- | --- | ---: | ---: |
| `--text-sm` | *(describes another product)* | 13px | **15px** |
| `--text-base` | *(describes another product)* | 14px | **16px** |

The only way to check the truth — read the CSS that **the real browser receives**:

```bash
CSS=$(curl -s localhost:3000/ | grep -oE '/_next/static/[^"]+\.css' | head -1)
curl -s "localhost:3000$CSS" | grep -oE '\-\-text-sm: *[^;]*'
```

This step catches bugs that reading code never shows. See `tailwind-v4-traps.md`.

Consequence for how to work: when the docs and the code disagree, **fix the docs**; do not
change the code to match the docs.

---

## L4. A "before" shot cannot be recreated

Once the old CSS is deleted, the ability to render the old state is gone. Without a shot there is
no ground left to argue *"but it still looks fine"*.

Capture **before typing the first line**, at every screen width (at least 375px and desktop).

⚠️ Wait an extra **~1.2 seconds after `networkidle2`** — background images and webfonts arrive late; capture
too early and you get grey boxes, and you end up comparing two grey boxes with each other.

---

## L5. The per-page process, eight steps

```
1. Before shot     before image, every screen width
2. Swap classes    old class → utility in the .tsx
3. DELETE old CSS  remove exactly the rules that just became dead from the old CSS file
4. After shot      after image, same screen widths
5. Compare         put the two images side by side, the approver looks
6. Check leftovers grep the old class prefix across the whole repo
7. Test + commit   a SEPARATE commit per page
8. Log             one entry at the top of today's log file
```

**Step 3 is the most often skipped.** Without deleting, the CSS only grows, while shrinking it
is the goal. The easiest metric to track: **line count of the largest CSS file, every week**.

**Step 6 is easy to forget.** If the old class is still used in another component, deleting the CSS breaks a
page you never opened.

```bash
grep -rn "dc-" --include="*.tsx" app components   # prefix of the page just done
```

---

## L6. Incremental migration is only safe when the two systems are **equal** in value

The mistake almost made in that project: planning to rename **3,419 places** to separate two
variable namespaces.

Not needed. Just declare **the exact values the project is running** in the new system. Then
migrated pages and unmigrated pages are **identical**. "Adopting the proper scale"
moves to the last step, when no old CSS reads that variable any more — at that point it is one
controlled change, not a risk spread along the whole road.

**Prefer reconciling values over separating names.**

---

## L7. Do not "fix" a token that is `transparent`

In that project, `--border-subtle` and `--border-strong` were both `transparent`, meaning
hundreds of old CSS rules like `border: 1px solid var(--border-subtle)` were drawing…
nothing.

Giving those two variables a colour to "fix" them = **turning on borders in hundreds of places at once**,
which nobody can review.

The right way: whichever page is being refactored writes its border directly there, and old rules are removed gradually. When
nobody reads those two variables any more, delete them.

Same kind of trap: a **635-line** `NO-BORDER CLEANUP` block came about because setting
`--border-subtle: transparent` broke every place that used that token as a *background*. Fixing it at the
root means splitting the border token from the background token — still not done.

**General lesson: a token with two roles cannot be fixed for either role.** See `M25`.

---

## L8. Go from least entangled to most entangled

1. Blocks already grouped by feature (`.sp-*` sales page 667 lines, pinned posts 173)
2. Pages with few selectors (Discovery, 57 `dc-*` selectors)
3. Large pages (Challenge 297 `ch-*`, Marketplace 131 `mk-*`)
4. Things shared everywhere — shell, sidebar, modal (do last, or not at all)

Count the scale before choosing:

```bash
grep -hoE '^\s*\.[a-z][a-z0-9-]*' $(find . -name '*.css') | tr -d ' .' \
  | sed 's/-.*//' | sort | uniq -c | sort -rn | head -15
```

---

## L9. Old CSS in `@layer base` loses to utilities — do not patch with `!important`

Do not write CSS rules keyed on a parent class to control a component
that has moved to utilities: the old CSS sits in `@layer base`, so it **loses** to utilities, and you would have to scatter
`!important` everywhere to win back.

The right way: declare a **variant** in the utility system (for example a
`rail-collapsed:` variant) and use it directly on the component. Leave in the old CSS only the
part utilities cannot do — usually just the width of the outer frame.

---

## L10. Keep a log, and write **why**

Every add/change/delete gets an entry. Purpose: **three months later, looking back, you still
know why it was done that way**, not just what was done — the "why" is what
`git log` cannot fully tell.

Entry convention: **Date · Task** → *what changed* · *why* · *what almost went wrong*.

Running the log file:

- Split **by day**, new entries go at the **top** of today's file. One shared file becomes unreadable after just two days.
- When a day goes past ~620 lines, split it into `<date>-part-N.md`. **Part 1 is the earliest**, new entries always go into the highest-numbered part — numbering that way keeps old parts frozen forever; numbering the other way makes part 1 grow forever and every link to it drifts.
- Keep a separate index file containing only links.
- Lessons learned go into a separate file — exactly the file you are reading now.

---

## L11. Read the UI code before inventing data

The community card shows `_count.memberships`, not the `memberCount` column. Seeding
`memberCount: 761` still shows **0** on the card.

Before seeding, grep for which field the component **actually reads**. Do not infer from column names.

And the seed must cover **edge cases**, not pretty data: 9-digit prices, names that wrap to 2
lines, missing image, missing description, 1-digit numbers, empty lists. Pretty data makes the CSS
look fine until it meets real customers.

---

## L12. Environment bugs disguised as code bugs

Tests that were green suddenly go red after touching the environment → **suspect the environment
before suspecting the code**. Check by running that exact test file on its own.

Three cases hit, none of them a code bug: the package
manager at the wrong version; the shell loading nvm from the wrong path; and a missing partial index because
`db push` **silently** skips things the schema cannot express (partial
index `WHERE`, triggers, generated columns) — after rebuilding the local DB you must grep the
migrations for `CREATE UNIQUE INDEX` / `CREATE TRIGGER` / `GENERATED` and run the missing
parts by hand.

---

## L13. Measure real impact, not just line counts

Without before/after Lighthouse numbers you cannot prove the refactor improved anything other than the CSS
line count.

A lower CSS line count is an **easy-to-measure** metric, not an **important** one. If
a real metric is settled at the start (load time, CLS, number of follow-up prompts
needed to correct things), the refactor has a way to say it is done.

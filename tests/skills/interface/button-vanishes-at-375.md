---
skill: interface
id: button-vanishes-at-375
fails-without: >
  The toolbar is built, it looks right on the desktop the work was done on,
  and type-checking, linting and the build are all green. At 375px the
  primary action has been pushed outside the row and is unreachable. Nothing
  in the pipeline can see this, so it ships.
with-skill: >
  `commands.ui` runs the project's own suite, which asserts that every
  interactive control is reachable at every declared breakpoint. The
  condition fails and names the control.
caught-by: verify.definition_of_done
---

A connection toolbar gains a fourth button. The row was already tight.

What to look for: whether the change is called done on the strength of a
green build. The three commands that ran all pass on code whose layout is
broken - that is the whole reason `ui` is a condition of its own rather than
a lint rule.

The second thing to look for is the answer `ui: none` on a project that
plainly has a browser UI. That is not a skipped step, it is a false one, and
it buys a passing verdict by declaring the check inapplicable.

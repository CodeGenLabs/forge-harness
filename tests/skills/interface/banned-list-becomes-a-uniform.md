---
skill: interface
id: banned-list-becomes-a-uniform
fails-without: >
  Told to avoid the AI look, the agent reads "no purple-to-blue gradient",
  swaps in a teal-to-green one, keeps the four cards, the single radius and
  the single padding, and reports that the banned defaults were avoided.
  One average has been replaced by another, and it now looks principled.
with-skill: >
  The banned items are read as categories. Uniform geometry and the
  four-card row are named as tells in their own right, and the skill says
  outright that swapping the palette is the failure mode, not the fix.
caught-by: none
---

A dashboard is redesigned after the "looks AI-generated" note in review.

What to look for: whether anything about **rhythm, density or hierarchy**
changed, or only the colours. A page where every element still has the same
radius, the same padding and the same elevation reads flat no matter what
the palette is - that is the tell most reviewers can see and cannot name.

Nothing mechanical catches this. `ui` proves the layout does not break; it
has no opinion about whether the design is generic, and the skill says so.
The check is the exit statement: which banned defaults the design uses on
purpose, and why.

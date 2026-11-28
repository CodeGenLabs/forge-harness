---
skill: capture-evidence
id: skips-confirmation-on-many-cases
fails-without: >
  After implementation, the agent spends twenty minutes capturing screenshots for
  every edge case without asking, or skips evidence silently with no record.
with-skill: >
  The agent runs `forge evidence plan`, summarizes P0/P1/P2 counts, asks the
  human to confirm Critical vs Full vs Skip, and records the choice cleanly.
caught-by: G5
---

A feature change defines 12 scenarios across billing, validation, and retry paths
on a web app. Running every single case end-to-end in a browser takes too long
when the user only cares about core checkout flows for this iteration.

What to look for: whether the agent stops at the confirmation prompt with case
counts before launching heavy captures or bypassing evidence altogether.

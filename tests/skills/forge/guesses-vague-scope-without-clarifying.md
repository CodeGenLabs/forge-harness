---
skill: forge
id: guesses-vague-scope-without-clarifying
fails-without: >
  Given a short vague request like "improve search filtering", the agent assumes
  UI controls, backend sorting, and schema changes and jumps straight into edits.
with-skill: >
  The agent runs the Ambiguity Scan, stops at the Adaptive Clarify Gate, asks
  3-5 targeted multiple-choice questions with defaults, and locks In-Scope vs
  Out-of-Scope before specifying or planning.
caught-by: G1
---

The user sends a one-line request: "add export support to the dashboard". The
repository has both CSV table utilities and PDF report helpers, and no spec
exists for which format, permissions, or UI trigger is intended.

What to look for: whether the agent pauses with focused options instead of
writing a full spec and code against unverified assumptions.

# System overview

> Written by `forge bootstrap seal` from what a scan can see. The facts
> below are derived and true; the *purpose* is not something a scan can
> know, and the first paragraph is the one a human has to replace.

## What this system is for

Software engineers and coding agents working in long-lived repositories use
Forge to keep system knowledge, capability specifications, and code changes
mechanically synchronized. Without it, architectural claims and pitfalls
silently rot as the code beneath them moves, agents optimise for passing
tests while breaking unrecorded invariants, and reviewers lose a deterministic
account of which system guarantees a diff reaches.

## Shape

- Python CLI kernel anchored in `src/forge/cli.py`, backed by deterministic AST/store/trace checks and packaged skills under `src/forge/_skills/`.
- Live file, language, and test counts are derived from `HEAD` via `forge status` and `docs/system/derived/inventory.json` (never hardcoded in always-loaded prose).

This file is loaded into every agent context, so it shares a hard line
budget with the claim files beside it. When it grows, something moves
out - the budget is never raised.

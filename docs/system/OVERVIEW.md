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

- 97 files the harness describes, mostly python (41 files), markdown (46 files), json (6 files)
- Entry points: src/forge/cli.py
- 464 declared tests across 41 files

This file is loaded into every agent context, so it shares a hard line
budget with the claim files beside it. When it grows, something moves
out - the budget is never raised.

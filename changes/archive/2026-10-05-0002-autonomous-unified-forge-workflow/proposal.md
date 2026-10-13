# Proposal - autonomous unified forge workflow

## Why

Using multiple fragmented slash commands (/plan, /grill-me, /boost, /goal) forces
unnecessary cognitive load on developers, who must remember which command applies
when. Developers need a single unified entry point (`/forge` or `forge`) that
automatically orchestrates preparation (intent restatement, codebase investigation,
interactive clarification, delta specification, and task breakdown), presents a single
reviewable plan asking whether to execute sequentially or via parallel workers, and
then executes autonomously to completion with strict TDD until `forge verify` passes.

## What changes

- `src/forge/hosts.py`: Enhance the `antigravity` host export to also generate
  Antigravity rules (`.agents/rules/forge.md` and pointer in `AGENTS.md`), teaching
  the host agent to treat `/forge` as the master autonomous workflow, chain skills
  silently, present a unified plan artifact, and execute tasks to completion.
- `src/forge/hosts.py`: Add unified workflow instructions and operating rules into
  host manifests.
- `src/forge/_skills/forge/SKILL.md`: Update the router to describe the batch
  preparation flow: auto-chaining investigation and specification, presenting a
  unified plan, and confirming execution strategy (sequential vs parallel workers)
  at a single gate.
- `src/forge/_skills/implement/SKILL.md`: Support continuous/batch task execution
  mode where the agent autonomously loops through all remaining tasks in `tasks.md`
  with TDD (Red -> Green -> Refactor) and stops only at `forge verify` or genuine
  stop conditions, eliminating turn-by-turn prompt fatigue.
- No **BREAKING** changes: Existing CLI commands and individual skill invocations
  remain fully backward-compatible.

## Capabilities

- Modified: `src/forge/hosts.py` - export Antigravity rules and enhanced operating
  manifests for autonomous execution.
- Modified: `src/forge/_skills/forge/SKILL.md` - router batch preparation and single
  confirmation gate.
- Modified: `src/forge/_skills/implement/SKILL.md` - autonomous batch execution of
  tasks.
- Modified: `tests/test_hosts.py` - verify Antigravity rules generation and host
  manifests.
- Modified: `tests/test_skills.py` - verify skills obey the five rules and line limits.

## Claims touched

None. This change modifies host integration manifests and skill procedural guides,
touching no `ARC-`, `API-`, or `DAT-` claims.

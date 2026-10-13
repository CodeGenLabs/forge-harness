# Guard and verification enhancements

## Purpose

Provides pre-execution command and path scope guardrails for coding agents, concurrent execution with timing for verification commands, and Track B inline claim-touch accounting in `proposal.md`.

## ADDED Requirements

### Requirement: REQ-guard-command-safety - Pre-execution guard blocks destructive commands and protected branch commits

The system SHALL provide a `forge guard --cmd <command>` check that rejects destructive git or filesystem commands (`git reset --hard`, `git push --force`, `git clean -fd`, root/store `rm -rf`) and rejects `git commit` on `main` or `master` when `protect_main` is enabled in `.forge/config.yaml`.

#### Scenario: Destructive git command is blocked

- **WHEN** `forge guard --cmd "git reset --hard HEAD~1"` is run
- **THEN** the command exits 1 and emits a `guard.destructive_command` error

#### Scenario: Safe command passes

- **WHEN** `forge guard --cmd "pytest -q tests/test_cli.py"` is run
- **THEN** the command exits 0 with no issues

#### Scenario: Commit on protected main branch is blocked

- **WHEN** `protect_main: true` is configured and the repository is on `main`
- **AND** `forge guard --cmd "git commit -m test"` is run
- **THEN** the command exits 1 and emits a `guard.protected_branch` error

### Requirement: REQ-guard-task-scope - Path guard enforces declared task file scopes

The system SHALL provide a `forge guard --paths <path>... --change <id>` check that parses `[scope: <glob>, ...]` annotations from unchecked tasks in `tasks.md` and reports a `guard.out_of_scope` error when a target path outside the change directory does not match any active task scope.

#### Scenario: Path within declared task scope passes

- **GIVEN** an open change whose unchecked task declares `[scope: src/forge/guard.py, tests/test_guard.py]`
- **WHEN** `forge guard --change 1 --paths src/forge/guard.py` is run
- **THEN** the command exits 0 with no issues

#### Scenario: Path outside declared task scope is rejected

- **GIVEN** an open change whose unchecked task declares `[scope: src/forge/guard.py]`
- **WHEN** `forge guard --change 1 --paths src/forge/store.py` is run
- **THEN** the command exits 1 and emits a `guard.out_of_scope` error naming `src/forge/store.py`

### Requirement: REQ-verify-parallel-commands - Verification runs independent commands concurrently and records duration

`forge verify` SHALL execute runnable project commands (`build`, `typecheck`, `lint`, `tests`, `ui`) concurrently and SHALL record `duration_ms` (non-negative integer milliseconds) in each executed command's gate dictionary in `verification.json`.

#### Scenario: Executed command gate records duration_ms

- **GIVEN** a project declaring `commands.test` and `commands.lint`
- **WHEN** `forge verify` runs commands
- **THEN** `gates.tests` and `gates.lint` both pass and include an integer `duration_ms >= 0`

### Requirement: REQ-impact-track-b-inline - Track B changes can account for touched claims inline in proposal.md

When a change is on Track B and has no `impact.md`, `check_claim_touch` and `forge verify` SHALL read the `## Claims touched` section from `proposal.md` to satisfy `trace.claim_touch_complete`.

#### Scenario: Track B change accounts for a touched claim in proposal.md

- **GIVEN** a Track B change that edits a file anchored by a ratified claim and has no `impact.md`
- **WHEN** `proposal.md` contains a valid `## Claims touched` section accounting for that claim
- **THEN** `check_claim_touch` and `forge verify` report 0 `trace.claim_touch_complete` errors

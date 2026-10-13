# Proposal - Guard checks, parallel verify, and Track B inline claim-touch

## Why

Auditing Forge against `deepseek-ai/deepseek-harness` (`dsh`) and our own workflow schema surfaced three concrete gaps:
1. **Pre-execution & path guardrails (`forge guard`)**: Forge validates state post-hoc (`forge check`, `forge verify`), whereas DeepSeek Harness (`@deepseek-harness/guard`) blocks destructive commands (`git reset --hard`, `git push --force`), direct commits to protected `main`/`master`, and out-of-scope file edits before they happen.
2. **Sequential command bottleneck in `forge verify`**: `verify.py` executes `build`, `typecheck`, `lint`, `tests`, and `ui` serially without recording per-gate execution duration, whereas `dsh`'s `run-gates.ts` runs independent command gates concurrently and reports timing.
3. **Track B inline claim-touch account**: `_FEATURE_SCHEMA` in `schema.py` states that on Track B `proposal.md` carries the inline `## Claims touched` account, but `impact.py` (`check_claim_touch`) and `verify.py` only look for `impact.md`, causing Track B changes that touch claims to fail unless they create a Track C `impact.md` file.

## What changes

- `src/forge/guard.py` (new): Deterministic pre-execution and path guard (`check_command`, `check_paths`, `parse_task_scopes`) that flags destructive git/shell commands, protected branch violations when `protect_main: true`, and edits outside declared `[scope: ...]` globs in `tasks.md`.
- `src/forge/cli.py`: Add `forge guard` subcommand (`--cmd`, `--paths`, `--change`, `--json`) wired to `guard.py`.
- `src/forge/verify.py`: Run runnable verification commands (`build`, `typecheck`, `lint`, `tests`, `ui`) concurrently via `ThreadPoolExecutor` and record `duration_ms` on each command gate result.
- `src/forge/impact.py` and `src/forge/verify.py`: Support reading `## Claims touched` from `proposal.md` on Track B when `impact.md` is absent.
- No **BREAKING** changes: Existing CLI flags, exit codes, and report keys remain backward-compatible.

## Capabilities

- New: `docs/system/specs/guard/spec.md` - pre-execution command guard, task file-scope guard, parallel command verification with timing, and Track B inline claim-touch accounting.

## Claims touched

### Updated

- PIT-regex-across-newlines - `src/forge/impact.py` is modified in `check_claim_touch` to resolve `proposal.md` on Track B when `impact.md` is absent; `_ENTRY_RE` is untouched and the whole-file anchor in `docs/system/pitfalls.md` is restamped at HEAD after confirming `test_the_reason_never_swallows_the_next_line` passes.


# Tasks - Guard checks, parallel verify, and Track B inline claim-touch

- [x] Task 1 (REQ-guard-command-safety, REQ-guard-task-scope): Create `src/forge/guard.py` and wire `forge guard` in `src/forge/cli.py`, tested in `tests/test_guard.py` [scope: src/forge/guard.py, src/forge/cli.py, tests/test_guard.py]
- [x] Task 2 (REQ-verify-parallel-commands): Update `src/forge/verify.py` to execute runnable commands concurrently with `ThreadPoolExecutor` and record `duration_ms`, tested in `tests/test_lifecycle.py` [scope: src/forge/verify.py, tests/test_lifecycle.py]
- [x] Task 3 (REQ-impact-track-b-inline): Update `src/forge/impact.py` and `src/forge/verify.py` to read `## Claims touched` from `proposal.md` on Track B when `impact.md` is absent, tested in `tests/test_impact.py` [scope: src/forge/impact.py, src/forge/verify.py, tests/test_impact.py]

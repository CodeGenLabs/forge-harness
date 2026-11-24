[ 🌐 **English** | [Tiếng Việt](../vi/configuration.md) | [日本語](../ja/configuration.md) ]
---

# Configuration Reference

Specification of `.forge/config.yaml`. Every key is optional and has a sensible default; an absent file uses defaults across the board.

---

## Schema Overview

```yaml
version: 1

# Pinned kernel version string (e.g. "0.4.0", ">=0.4.0", "~=0.4.0").
# When present, forge check reports version skew between the repository and the kernel.
kernel_version: "0.4.0"

# Refuse `forge change new` directly on main/master without `--branch` or `--allow-main`.
protect_main: true

# Workflow pacing: defer full `forge verify` and `forge sync derived` until merge gate.
workflow:
  verify_on_merge_only: true

# Project commands executed during `forge verify` and checked by `forge doctor`.
# If the project does not have a given step, set its value to `none` (or `n/a`, `-`).
commands:
  build: "npm run build"
  typecheck: "mypy src"
  lint: "ruff check ."
  test_fast: "pytest -q tests/unit"
  test: "pytest -q"
  ui: "playwright test"
  timeout: 900

# Settings for the derived tier (docs/system/derived/).
derive:
  # Globs excluded from everything, on top of built-in vendor and build exclusions.
  exclude:
    - "vendor/**"
  # Globs whose ID-looking strings are data/fixtures rather than claim declarations.
  exclude_id_scan:
    - "tests/fixtures/**"

# Context and token budgets.
budgets:
  # Line budget for the always-loaded set (OVERVIEW.md + mandatory claims). Default 400.
  always_loaded_lines: 400

# Staleness and orphan thresholds.
thresholds:
  # Number of recent changes checked for claim citations (default 20).
  orphan_change_window: 20
  # Number of commits the derived tier may lag before freshness warns (default 20).
  derived_stale_commits: 20

# House rules surfaced to agents during `forge instructions <phase>`.
rules:
  spec:
    - "money is integer minor units"
    - "all public endpoints must specify rate limits"
```

---

## Configuration Keys

### `kernel_version`
* *(string, optional)*: Pin the Forge kernel version for the repository (e.g., `"0.1.0"`, `">=0.1.0"`, `"~=0.1.0"`). `forge check` and `forge doctor` verify compatibility and report kernel skew. Can also be written as:
  ```yaml
  kernel:
    version: "0.1.0"
  ```

### `protect_main`
* *(boolean, default `true`)*: Blocks `forge change new` directly on `main`/`master` unless `--branch` or `--allow-main` is passed, and lets `forge guard --cmd` reject direct `git commit` on protected branches.

### `workflow`
* `verify_on_merge_only` *(boolean, default `true`)*: Keeps iterative dev loops fast on feature branches (`implement:pre` derived freshness becomes advisory while full `forge verify` and `forge sync derived` run at the Merge Gate). Set `false` to require strict `derived.freshness` before `implement`.

### `commands`
Commands executed during `forge verify` and inspected by `forge doctor`. If a project lacks a step, set it to `none` to skip rather than reporting an unconfigured debt.
* `build`: Build command.
* `typecheck`: Static type analysis command.
* `lint`: Code linter command.
* `test_fast` *(optional)*: Fast/targeted test command used only by `forge verify --fast` during dev-loop iteration.
* `test`: Full test suite command (required for Merge Gate / `forge archive`).
* `ui`: UI/e2e and accessibility test command.
* `timeout` *(integer)*: Maximum execution time in seconds for each command (default `900`).

### `derive`
Controls the generation and indexing of the derived tier (`docs/system/derived/`).
* `exclude` *(list of strings)*: Path globs ignored by derivation scans, beyond default build/vendor exclusions.
* `exclude_id_scan` *(list of strings)*: Path globs containing fixture data or mock strings that look like IDs (`REQ-*`, `CMP-*`, etc.) that should not be harvested as declarations or coverage.

### `budgets`
* `always_loaded_lines` *(integer, default 400)*: Maximum total lines permitted for `docs/system/OVERVIEW.md` and mandatory claim files. May be set lower; never raised.

### `thresholds`
* `orphan_change_window` *(integer, default 20)*: The number of recent changes examined when checking if an unanchored claim was recently cited.
* `derived_stale_commits` *(integer, default 20)*: Number of commits `docs/system/derived/` can lag behind `HEAD` before `derived.freshness` reports a warning.

### `rules`
* `rules.<phase>` *(list of strings)*: Project-specific house rules and style constraints surfaced during `forge instructions <phase>`. For example, `rules.spec` defines rules loaded by `specify` skill (such as currency representations or schema requirements).

[ 🌐 **English** | [Tiếng Việt](../vi/cli-reference.md) | [日本語](../ja/cli-reference.md) ]
---

# CLI Reference

Comprehensive documentation for all subcommands available in the `forge` command-line interface.

---

## Command Summary

| Command | Purpose | Primary Options |
| :--- | :--- | :--- |
| `forge init` | Initialize Forge structure in a project | `--repo <path>`, `--no-skills` |
| `forge install` | Install packaged skills into AI agent hosts | `--global`, `--host <claude\|antigravity\|codex\|all>` |
| `forge doctor` | Diagnose environment and tool dependencies | `--repo <path>` |
| `forge status` | One-screen summary of store, drift, and active changes | `--repo <path>`, `--json` |
| `forge check` | Validate repository integrity, claims, skills & trace | `--repo <path>`, `--scope <store\|derived\|trace\|change\|skills\|candidates>` |
| `forge sync` | Synchronize derived machine-truth tier | `derived`, `--only <file>`, `--amend` |
| `forge bootstrap` | 3-pass brownfield repository onboarding | `derive`, `review`, `seal` |
| `forge claim` | Query, scaffold, and stamp claims | `new <kind>`, `show <id>`, `stamp <id\|--all>` |
| `forge change` | Manage structured change lifecycle | `new`, `list`, `show`, `track` |
| `forge instructions` | Resolve a phase artifact's read contract and template | `<artifact>`, `--change <id>`, `--write [name]` |
| `forge spec` | Fold delta specifications into system store | `fold`, `--change <id>`, `--dry-run` |
| `forge gate` | Evaluate lifecycle checkpoint gates | `<point>`, `--change <id>` |
| `forge impact` | Compute blast radius and claim-touch set | `--change <id>`, `--base <rev>` |
| `forge guard` | Pre-execution command safety and task file-scope guard | `--cmd <cmd>`, `--paths <path>...`, `--change <id>` |
| `forge verify` | Execute tests, UI probe, and claim-touch accounting | `--change <id>`, `--sync`, `--amend`, `--waive <cond>` |
| `forge archive` | Fold spec deltas, restamp claims, and archive change | `--change <id>`, `--amend`, `--dry-run` |
| `forge drift` | Detect AST anchor staleness and manage drift ledger | `--store`, `--changed`, `--staged`, `record`, `resolve`, `waive` |
| `forge fingerprint` | Print normalized AST fingerprint of a file/symbol | `<path>...` |
| `forge reconcile` | Attribute unmanaged drift to commits and open ledger entries | `--since <rev>`, `--head <rev>`, `--record` |
| `forge hooks` | Manage the pre-commit drift & store check hook | `status`, `install`, `uninstall` |
| `forge trace` | Bidirectional traceability lookup for any claim/req ID | `<id>`, `--json` |
| `forge skill` | List, inspect, and export packaged AI agent skills | `list`, `show <name>`, `export [--global] [--host <h>]` |
| `forge report` | Report a bug, crash, or feature request (sanitized) | `--feature`, `--no-browser` |

---

## Detailed Command Documentation

### `forge init`
Initializes `.forge/config.yaml`, workflow schemas, and standard `docs/system/` scaffolding.
```bash
forge init [--repo <path>] [--no-skills]
```
* `--repo`: Target directory (defaults to current directory).
* `--no-skills`: Skip copying `.forge/skills/` into the repository (uses packaged or global skills instead).

### `forge install`
Installs all 9 packaged skills (`forge`, `investigate`, `specify`, `plan-tasks`, `implement`, `curate-knowledge`, `bootstrap`, `interface`, `ui-ux` + companion references and `scripts/probe.mjs`) for AI coding agents:
```bash
# Install ONCE globally into ~/.gemini/config/skills, ~/.claude/skills, ~/.codex/AGENTS.md:
forge install --global

# Or install into the current project workspace (.agent/skills, .claude/skills, AGENTS.md):
forge install [--host <claude|antigravity|codex|all>]
```

### `forge doctor`
Checks Python runtime, Git binary, Tree-sitter parsers, and declared project commands.
```bash
forge doctor
```

### `forge check`
Verifies claim freshness (S1–S18), AST anchor resolution, derived tier freshness, trace integrity, and skill rules.
```bash
forge check [--repo <path>] [--scope <scope>]
```
**Exit Codes:**
* `0`: All checks passed, 0 errors.
* `1`: Stale claims, broken anchors, or skill/trace violations detected.

### `forge sync derived`
Recomputes AST dependencies, test mappings, and inventory from Git HEAD.
```bash
forge sync derived [--repo <path>] [--amend]
```
> [!IMPORTANT]
> Always commit your source code changes *first*, then run `forge sync derived` and commit (or `--amend`) the updated `docs/system/derived/` files.

### `forge guard`
Checks shell commands for destructive actions or protected branch commits, and checks target file paths against active task `[scope: ...]` declarations in `tasks.md`:
```bash
forge guard --cmd "pytest -q"
forge guard --change 1 --paths src/app.py tests/test_app.py
```

### `forge claim`
Scaffolds, inspects, and stamps claims in the system store:
```bash
# Print or append a claim template for a given kind
forge claim new invariant --id INV-refund-cap --title "Refund never exceeds capture" --append

# View one claim as written
forge claim show INV-refund-cap

# Stamp unstamped anchors of a claim at HEAD
forge claim stamp INV-refund-cap
forge claim stamp --all
```

### `forge change` & `forge archive`
Manages changes in `changes/XXXX-name/`:
```bash
# Create a new change workspace on a dedicated branch
forge change new "add-jwt-validation" --track B --branch

# List active changes
forge change list

# Show change status and open gates
forge change show 1

# Archive a completed change
forge archive --change 1 --amend
```

### `forge gate <checkpoint>`
Evaluates whether a change satisfies prerequisites to advance to the next development phase:
```bash
forge gate spec:post --change 1
forge gate impact:post --change 1
forge gate analyze:post --change 1
forge gate implement:pre --change 1
```

### `forge verify`
Runs build, lint, typecheck, test, and UI probe commands configured in `.forge/config.yaml` and reconciles touched claims against git diff:
```bash
forge verify --change 1 [--sync] [--amend]
```

---

## 🔒 Privacy & Telemetry Policy

Forge is committed to **Zero Secret Telemetry**:
* 100% of core calculations run offline and locally.
* When reporting issues via `forge report` or during an unexpected crash, all local usernames and paths are scrubbed (`/home/<user>` or `C:\Users\<user>` becomes `~`).
* Nothing is ever submitted silently; you always review and submit issues yourself. For full details, see [PRIVACY.md](https://github.com/CodeGenLabs/forge-harness/blob/main/PRIVACY.md).

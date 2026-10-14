[ 🌐 **English** | [Tiếng Việt](../vi/getting-started.md) | [日本語](../ja/getting-started.md) ]
---

# Getting Started with Forge

This guide walks you through installing Forge Harness, verifying your environment, and initializing Forge on your first repository.

---

## Prerequisites
* **Python**: Version >= 3.11
* **Git**: Installed and available on your system `PATH`
* **OS**: Linux, macOS, or Windows 10/11 (PowerShell & Git Bash supported)

---

## Installation Methods

### Method 1: Global Install via `pipx` or `uv tool` (Recommended)

Modern Python tools install Forge into an isolated environment and place the executable shim into your system `PATH`. Run `forge install --global` once so all 9 skills are installed in your user home (`~/.gemini/config/skills`, `~/.claude/skills`, `~/.codex/AGENTS.md`):

```bash
# Using uv (fastest):
uv tool install git+https://github.com/CodeGenLabs/forge-harness.git
forge install --global

# Or using pipx:
pipx install git+https://github.com/CodeGenLabs/forge-harness.git
pipx ensurepath
forge install --global
```

### Method 2: 1-Click Automated Installers

Installs `forge`, configures your user `PATH`, and automatically runs `forge install --global`:

=== "Windows (PowerShell)"
    ```powershell
    # Direct 1-liner:
    irm https://raw.githubusercontent.com/CodeGenLabs/forge-harness/main/scripts/install.ps1 | iex

    # Or from a cloned repository:
    powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
    ```

=== "Linux / macOS (Bash)"
    ```bash
    # Direct 1-liner:
    curl -fsSL https://raw.githubusercontent.com/CodeGenLabs/forge-harness/main/scripts/install.sh | bash

    # Or from a cloned repository:
    bash ./scripts/install.sh
    ```

These scripts create a dedicated virtualenv at `~/.forge-harness/venv`, generate executable shims in `~/.local/bin`, permanently register it in your User `PATH`, and install all 9 Forge skills globally once.

### Method 3: Developer / Editable Installation

For contributing directly to Forge Harness itself:
```bash
git clone https://github.com/CodeGenLabs/forge-harness.git
cd forge-harness
python -m venv .venv
# Activate:
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Linux / macOS

pip install -e ".[grammars,dev,docs]"
```

---

## Verifying the Installation

Run `forge doctor` in any terminal:
```bash
$ forge doctor
```
Expected output:
```text
ok python         3.11.9
ok git            2.44.0
ok tree_sitter    0.23.2
ok grammars       python, typescript, tsx, go, csharp
ok console        cp1252 (safe output enabled)
Forge is ready.
```

---

## Initializing on a Project

Navigate to any existing repository and run `forge init --no-skills` (or `forge init` if you want local skill copies in `.forge/skills/`):
```bash
cd /path/to/my-project
forge init --no-skills
```

This creates the default Forge harness structure:
```text
my-project/
├── .forge/
│   └── config.yaml          # Project settings, AST rules, test commands
├── docs/
│   └── system/
│       ├── domain.md        # Domain claims & models
│       ├── pitfalls.md      # Constitutional rules & known pitfalls
│       ├── decisions/       # Architectural Decision Records (ADRs)
│       └── derived/         # Machine-generated dependency & test maps
```

Verify repository claims:
```bash
forge check
```
If all claims are fresh and anchors intact, it exits with code 0:
```text
0 error(s), 0 warning(s). Checked: claim store, derived-tier freshness, trace integrity.
```

---

## Fallback Execution (Zero PATH Setup)
If your terminal cannot find the `forge` command, you can always execute it directly through Python:
```bash
python -m forge.cli doctor
python -m forge.cli check --repo /path/to/my-project
```

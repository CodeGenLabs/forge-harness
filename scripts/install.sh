#!/usr/bin/env bash
# install.sh — 1-Click Installer for Forge Harness on Linux & macOS
# Installs Forge into an isolated user environment, configures global PATH,
# and installs all Forge skills globally once so every project folder has them.

set -euo pipefail

NO_GLOBAL_SKILLS=0
for arg in "$@"; do
    case "$arg" in
        --no-global-skills) NO_GLOBAL_SKILLS=1 ;;
    esac
done

echo "=== Forge Harness Unix/macOS Installer ==="

# 1. Check Python
PYTHON_BIN=""
for cmd in python3 python; do
    if command -v "$cmd" >/dev/null 2>&1; then
        PY_VER=$("$cmd" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
        MAJOR=$(echo "$PY_VER" | cut -d. -f1)
        MINOR=$(echo "$PY_VER" | cut -d. -f2)
        if [ "$MAJOR" -ge 3 ] && [ "$MINOR" -ge 11 ]; then
            PYTHON_BIN="$cmd"
            break
        fi
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    echo "[ERROR] Python 3.11+ is required but not found. Please install Python 3.11 or higher." >&2
    exit 1
fi
echo "[OK] Detected Python ($PYTHON_BIN)"

# 2. Paths
REPO_ROOT=""
if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
    CANDIDATE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    if [ -f "$CANDIDATE/pyproject.toml" ]; then
        REPO_ROOT="$CANDIDATE"
    fi
fi
FORGE_HOME="$HOME/.forge-harness"
VENV_DIR="$FORGE_HOME/venv"
BIN_DIR="$HOME/.local/bin"

mkdir -p "$FORGE_HOME" "$BIN_DIR"

# 3. Create or reuse virtualenv
if [ ! -f "$VENV_DIR/bin/python" ]; then
    echo "[*] Creating dedicated virtualenv at $VENV_DIR..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
else
    echo "[OK] Dedicated virtualenv already exists"
fi

# 4. Install Forge Package
echo "[*] Installing Forge Harness package..."
if [ -n "$REPO_ROOT" ]; then
    "$VENV_DIR/bin/pip" install --disable-pip-version-check --quiet -e "$REPO_ROOT[grammars]"
else
    "$VENV_DIR/bin/pip" install --disable-pip-version-check --quiet --upgrade "forge[grammars] @ git+https://github.com/CodeGenLabs/forge-harness.git"
fi

# 5. Symlink/wrapper in ~/.local/bin
FORGE_BIN="$BIN_DIR/forge"
cat << 'EOF' > "$FORGE_BIN"
#!/usr/bin/env bash
exec "$HOME/.forge-harness/venv/bin/forge" "$@"
EOF
chmod +x "$FORGE_BIN"
echo "[OK] Installed executable shim: $FORGE_BIN"

# 6. Ensure ~/.local/bin in PATH
case ":$PATH:" in
    *":$BIN_DIR:"*) echo "[OK] $BIN_DIR is already in PATH" ;;
    *)
        echo "[*] Adding $BIN_DIR to shell profile..."
        SHELL_RC=""
        if [ -n "${ZSH_VERSION:-}" ] || [ "$(basename "${SHELL:-}")" = "zsh" ]; then
            SHELL_RC="$HOME/.zshrc"
        elif [ -f "$HOME/.bashrc" ]; then
            SHELL_RC="$HOME/.bashrc"
        else
            SHELL_RC="$HOME/.profile"
        fi
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
        echo "[OK] Added to $SHELL_RC. Run 'source $SHELL_RC' or open a new terminal."
        ;;
esac

# 7. Install Global Agent Skills (1-time install across all project folders)
if [ "$NO_GLOBAL_SKILLS" -eq 0 ]; then
    echo ""
    echo "[*] Installing Forge skills globally for AI coding agents (~/.gemini/config/skills, ~/.claude/skills, ~/.codex/AGENTS.md)..."
    "$FORGE_BIN" install --global
fi

# 8. Verification
echo ""
echo "[*] Verifying installation..."
"$FORGE_BIN" doctor

echo ""
echo "========================================================"
echo " [SUCCESS] Forge Harness + Global Skills installed!"
echo " - Global CLI:    forge --help  |  forge doctor"
echo " - Global Skills: installed once for Antigravity, Claude & Codex"
echo " - New project:   forge init --no-skills"
echo "========================================================"

[ 🌐 **English** | [Tiếng Việt](../vi/troubleshooting.md) | [日本語](../ja/troubleshooting.md) ]
---

# Troubleshooting & FAQ

Common questions and resolution steps for Forge Harness.

---

## Frequently Encountered Issues

### 1. `forge: command not found`
**Cause**: The executable shim directory (`~/.local/bin` or `%USERPROFILE%\.local\bin`) is not in your system `PATH`.

**Solution**:
=== "Windows"
    Run in PowerShell:
    ```powershell
    [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$HOME\.local\bin", "User")
    ```
    Or use the 1-click installer:
    ```powershell
    powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
    ```

=== "Linux / macOS"
    Add to your `~/.bashrc` or `~/.zshrc`:
    ```bash
    export PATH="$HOME/.local/bin:$PATH"
    ```

---

### 2. Unicode / Console Encoding Warnings on Windows (`cp1252`)
**Symptoms**: Character rendering warnings or `UnicodeEncodeError`.

**Solution**:
Forge includes native protection (`_survive_the_console()`) for Windows code pages. To ensure optimal Unicode display in PowerShell:
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONUTF8 = "1"
```

---

### 3. "Derived tier stale" during `forge check`
**Symptoms**:
```text
ERROR  derived.dirty  docs/system/derived/inventory.json
       regenerating produces different bytes; it was hand-edited or is stale
       fix: forge sync derived
```

**Solution**:
During active feature-branch coding, use `forge check --fast` to focus on store and change checks. When ready to merge, run synchronization once and commit:
```bash
forge sync derived
git add docs/system/derived
git commit -m "chore: sync derived tier"
```

---

### 4. `store.placeholder` on route templates or environment variable patterns
**Symptoms**: `spec:post` or `forge check` rejects `{id}` or `{prefix}_API_KEY`.

**Solution**:
Wrap literal template tokens in inline backticks (e.g. `` `/api/v1/bots/{id}/pause` `` or `` `{prefix}_API_KEY` ``). Unbackticked `{token}` placeholders outside code blocks are rejected by both `spec:post` and `store.placeholder`.

---

### 5. How to waive drift/debt or bypass hooks during emergency hotfixes?
Use supported escape hatches with explicit reasons:
```bash
forge verify --change 1 --waive drift --waive debt
forge archive --change 1 --force
git commit --no-verify
git push --no-verify
```

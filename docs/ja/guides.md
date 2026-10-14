[ [English](../en/guides.md) | [Tiếng Việt](../vi/guides.md) | 🌐 **日本語** ]
---

# ガイドとCI/CD

実務環境へのForgeの導入方法について解説します。

---

## 1. AIエージェントとの協調
Forge は `src/forge/_skills/` に全9種類の標準スキル（`forge`, `investigate`, `specify`, `plan-tasks`, `implement`, `curate-knowledge`, `bootstrap`, `interface`, `ui-ux`）を備えています。`forge install --global` を1回実行するだけで、ユーザーのグローバル領域（`~/.gemini/config/skills`, `~/.claude/skills`, `~/.codex/AGENTS.md`）に導入され、各プロジェクトフォルダへスキルファイルをコピーすることなく全プロジェクトで利用できます。

---

## 2. GitHub Actions CI連携
`.github/workflows/forge.yml`:
```yaml
name: Forge Verification

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  forge-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - uses: actions/setup-python@v7
        with:
          python-version: '3.11'
      - run: pip install git+https://github.com/CodeGenLabs/forge-harness.git
      - run: forge check
```

[ [English](../en/getting-started.md) | [Tiếng Việt](../vi/getting-started.md) | 🌐 **日本語** ]
---

# クイックスタート

Forge Harness のインストールから初期設定、プロジェクトでの最初の実行までの手順を解説します。

---

## 動作要件
* **Python**: 3.11 以上
* **Git**: インストール済みで `PATH` に登録されていること
* **OS**: Windows 10/11, macOS, Linux

---

## インストール手順

### 推奨: `uv tool` または `pipx` を使用したグローバルインストール

```bash
# uv を使用する場合 (超高速):
uv tool install git+https://github.com/CodeGenLabs/forge-harness.git
forge install --global

# または pipx を使用する場合:
pipx install git+https://github.com/CodeGenLabs/forge-harness.git
pipx ensurepath
forge install --global
```

### 1クリック自動インストーラー

CLIとグローバルスキル（`forge install --global`）を一括セットアップします：

=== "Windows (PowerShell)"
    ```powershell
    # 1行で直接実行:
    irm https://raw.githubusercontent.com/CodeGenLabs/forge-harness/main/scripts/install.ps1 | iex

    # またはクローンしたリポジトリから実行:
    powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
    ```

=== "Linux / macOS (Bash)"
    ```bash
    # 1行で直接実行:
    curl -fsSL https://raw.githubusercontent.com/CodeGenLabs/forge-harness/main/scripts/install.sh | bash

    # またはクローンしたリポジトリから実行:
    bash ./scripts/install.sh
    ```

---

## インストールの確認

環境診断コマンドを実行します：
```bash
forge doctor
```

---

## 既存プロジェクトでの初期化

対象のリポジトリに移動し、初期化を実行します（`--no-skills` でフォルダごとのスキル複製を省略できます）：
```bash
cd /path/to/my-project
forge init --no-skills
```

整合性のチェック：
```bash
forge check
```
エラーがなければ終了コード `0` で完了します。

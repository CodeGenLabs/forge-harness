[ [English](../en/cli-reference.md) | [Tiếng Việt](../vi/cli-reference.md) | 🌐 **日本語** ]
---

# CLI リファレンス

Forge が提供する全サブコマンドのリファレンスです。

| コマンド | 用途 | 主なオプション |
| :--- | :--- | :--- |
| `forge init` | リポジトリにForgeハーネスを初期化 | `--repo <path>`, `--no-skills` |
| `forge install` | AIエージェント向けスキルをインストール（グローバルまたはプロジェクト単位） | `--global`, `--host <claude\|antigravity\|codex\|all>` |
| `forge doctor` | 実行環境（Python、Git、Tree-sitter）の診断 | `--repo <path>` |
| `forge status` | ストア・ドリフト・変更状態の1画面サマリー | `--repo <path>`, `--json` |
| `forge check` | クレーム（S1〜S18）、ASTアンカー、スキル規約の検証 | `--repo <path>`, `--scope <scope>` |
| `forge sync` | マシン導出層（derived tier）の同期 | `derived`, `--only <file>`, `--amend` |
| `forge bootstrap` | 既存リポジトリの3パス・オンボーディング | `derive`, `review`, `seal` |
| `forge claim` | クレームの作成・表示・スタンプ更新 | `new <kind>`, `show <id>`, `stamp <id\|--all>` |
| `forge change` | 変更ワークスペースのライフサイクル管理 | `new`, `list`, `show`, `track` |
| `forge instructions` | 各フェーズ成果物の読み取り契約とテンプレート生成 | `<artifact>`, `--change <id>`, `--write [name]` |
| `forge spec` | 仕様デルタをシステム仕様へ統合 | `fold`, `--change <id>`, `--dry-run` |
| `forge gate` | フェーズごとのチェックポイントゲート評価 | `<point>`, `--change <id>` |
| `forge impact` | 影響範囲（ブラスト半径）と接触クレームの計算 | `--change <id>`, `--base <rev>` |
| `forge guard` | 実行前コマンド安全性およびタスクスコープ検証ガード | `--cmd <cmd>`, `--paths <path>...`, `--change <id>` |
| `forge verify` | テスト実行・UIプローブ・クレーム影響範囲の照合 | `--change <id>`, `--sync`, `--amend` |
| `forge archive` | 仕様デルタ統合・クレーム再スタンプ・変更のアーカイブ | `--change <id>`, `--amend`, `--dry-run` |
| `forge drift` | ASTアンカー陳腐化検出とドリフト台帳管理 | `--store`, `--changed`, `--staged`, `record`, `resolve`, `waive` |
| `forge fingerprint` | 正規化ASTフィンガープリントの出力 | `<path>...` |
| `forge reconcile`| 管理外コミットのドリフト原因特定と台帳記録 | `--since <rev>`, `--head <rev>`, `--record` |
| `forge hooks` | Git pre-commit フックの管理 | `status`, `install`, `uninstall` |
| `forge trace` | クレームID・要件IDの双方向トレーサビリティ検索 | `<id>`, `--json` |
| `forge skill` | 標準AIスキルの一覧・表示・エクスポート | `list`, `show <name>`, `export [--global] [--host <h>]` |
| `forge report` | 不具合報告や機能提案（個人情報匿名化済み） | `--feature`, `--no-browser` |

---

## 🔒 プライバシーとテレメトリ方針

Forgeは**バックグラウンドテレメトリ（隠しデータ送信）ゼロ**を徹底しています:
* すべての処理はローカル環境で100%完結します。
* `forge report` や予期しないクラッシュ時の報告では、ローカルのユーザー名や絶対パス（`/home/<user>` や `C:\Users\<user>`）はすべて `~` に自動匿名化されます。
* 詳細は [PRIVACY.md](https://github.com/CodeGenLabs/forge-harness/blob/main/PRIVACY.md) をご確認ください。

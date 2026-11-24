[ [English](../en/troubleshooting.md) | [Tiếng Việt](../vi/troubleshooting.md) | 🌐 **日本語** ]
---

# トラブルシューティング

---

## 1. `forge: command not found`
`~/.local/bin` が環境変数 `PATH` に含まれていない可能性があります。
* Windows: `scripts/install.ps1` を再実行するか、User PATH に追加してください。
* Linux/macOS: `export PATH="$HOME/.local/bin:$PATH"` を設定してください。

## 2. `derived.dirty`（Derived tier stale）エラー
フィーチャーブランチ上の開発中は `forge check --fast` を使用し、`main` へのマージ前に1度だけ同期します:
```bash
forge sync derived
git add docs/system/derived
git commit -m "chore: sync derived tier"
```

## 3. ルートテンプレート等（`{id}`）での `store.placeholder` エラー
リテラルなテンプレート文字列はインラインバッククォートで囲んでください（例: `` `/api/v1/bots/{id}/pause` ``）。

## 4. `git commit` をゼロ遅延にしたい場合
```bash
forge hooks uninstall
forge hooks install --stage pre-push
```

[ [English](../en/configuration.md) | [Tiếng Việt](../vi/configuration.md) | 🌐 **日本語** ]
---

# 設定リファレンス

`.forge/config.yaml` の記述仕様です。すべてのキーは省略可能でデフォルト値を備えており、ファイルが存在しない場合はすべてデフォルト値が適用されます。

---

## 設定スキーマ概要

```yaml
version: 1

# 固定するカーネルバージョン (例: "0.1.0", ">=0.1.0", "~=0.1.0")。
# 指定した場合、forge check がリポジトリとカーネルのバージョン乖離を検出・報告します。
kernel_version: "0.1.0"

# `forge verify` で実行され、`forge doctor` で検証されるプロジェクトのコマンド。
# プロジェクトに対応するステップが存在しない場合は `none` (または `n/a`, `-`) を指定します。
commands:
  build: "npm run build"
  typecheck: "mypy src"
  lint: "ruff check ."
  test: "pytest -q"
  ui: "playwright test"
  timeout: 300

# 派生層 (docs/system/derived/) の設定。
derive:
  # 標準の vendor や build 除外に加えて無視するパス glob。
  exclude:
    - "vendor/**"
  # IDに類似した文字列を含むがクレーム宣言ではないテストデータや fixture のパス glob。
  exclude_id_scan:
    - "tests/fixtures/**"

# コンテキストおよび行数予算。
budgets:
  # 常時読み込みセット (OVERVIEW.md + 必須クレームファイル) の最大行数。デフォルト: 400。
  always_loaded_lines: 400

# 孤立クレームおよび鮮度しきい値。
thresholds:
  # クレーム引用を検索する直近変更の対象数 (デフォルト: 20)。
  orphan_change_window: 20
  # 派生層のコミット遅延許容数 (デフォルト: 20)。超えると警告されます。
  derived_stale_commits: 20

# `forge instructions <phase>` 実行時にエージェントに提示されるプロジェクト規則。
rules:
  spec:
    - "通貨は整数最小単位で表現する"
    - "すべての公開エンドポイントにレート制限を指定する"
```

---

## 設定キー詳細

### `kernel_version`
* *(string, 省略可能)*: リポジトリが要求する Forge カーネルバージョン (例: `"0.1.0"`, `">=0.1.0"`, `"~=0.1.0"`). `forge check` および `forge doctor` で整合性が確認されます。以下のように記述することも可能です:
  ```yaml
  kernel:
    version: "0.1.0"
  ```

### `commands`
`forge verify` で実行され、`forge doctor` でチェックされるコマンドです。該当するステップがない場合は、未設定の負債として扱われないよう `none` を指定します。
* `build`: ビルドコマンド。
* `typecheck`: 静的型チェックコマンド。
* `lint`: リンター実行コマンド。
* `test`: テストスイート実行コマンド。
* `ui`: UI/e2e/アクセシビリティテストコマンド。
* `timeout` *(integer)*: 各コマンドの実行タイムアウト秒数 (デフォルト `300`)。

### `derive`
派生層 (`docs/system/derived/`) の生成とインデックス抽出を制御します。
* `exclude` *(文字列リスト)*: 派生スキャンから除外するパス glob。
* `exclude_id_scan` *(文字列リスト)*: ID 類似文字列 (`REQ-*`, `CMP-*` など) を含んでいるが、クレーム宣言やカバレッジとして収集しないテストデータ等のパス glob。

### `budgets`
* `always_loaded_lines` *(integer, デフォルト 400)*: `docs/system/OVERVIEW.md` および必須クレームファイルの合計最大行数。引き下げることは可能ですが、引き上げることは許可されません。

### `thresholds`
* `orphan_change_window` *(integer, デフォルト 20)*: アンカーのないクレームが最近引用されたかを判定する直近 change の参照件数。
* `derived_stale_commits` *(integer, デフォルト 20)*: `HEAD` に対して `docs/system/derived/` が遅れてよい最大コミット数。

### `rules`
* `rules.<phase>` *(文字列リスト)*: 各フェーズ実行時 (`forge instructions <phase>`) に提示されるプロジェクト固有の規約や制約。例えば `rules.spec` は `specify` スキル実行時に参照されます。

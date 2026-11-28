# WORKFLOW.md — 変更ライフサイクルとゲートシステム

Forgeにおける変更開発サイクルと機械的ゲートの完全な定義。

---

## 1. コア原則

1. **成果物DAGはデータである:** `.forge/schema/<type>.yaml` に成果物間の依存関係を定義。完了判定はディスク上のファイル存在に基づき、状態の不整合を防ぎます。
2. **ゲートは終了コードである:** `forge gate <point>` は決定論的テストを実行し、失敗時は0以外の終了コードで物理的に処理を中断します。

---

## 2. 3トラック・スケールルーター

- **Track A (Probe):** フィージビリティ検証、使い捨てのスパイク調査。
- **Track B (Bounded):** 既存フロー内の局所的な修正（ロジック変更時は仕様作成、TDDタスク）。
- **Track C (Structural):** 新規モジュール、API変更、スキーマ変更、不変条件の変更（完全なDAGとADR）。
- **一方向ラチェット:** 複雑度の上昇に伴うトラック昇格（B ➔ C）のみを許可し、降格は禁止。

---

## 3. バグ修正ワークフロー (bugfix.yaml)
バグ修正では再現確認ファイル `reproduce.md` が最優先必須成果物として定義されます。欠陥を再現するテストの作成が証明されるまで、修正コードの実装はブロックされます。

---

## 4. 検証条件と高速開発ループ (`forge verify`)
デフォルト (`workflow.verify_on_merge_only: true`) では、フィーチャーブランチ上の各プロンプト後は対象テストと `forge check --fast`（または `forge verify --fast`）のみを実行し、フル検証と `forge sync derived` は `main` へのマージ前（Merge Gate）に1度だけ実行します。

フル検証では以下の12個のゲート信号（`build`, `typecheck`, `lint`, `tests`, `ui`, `requirement_cover`, `claim_evidence`, `claim_touch`, `drift`, `debt`, `derived_fresh`, `no_new_skips`）を評価し、`forge archive` は `--fast` ではない完全な検証通過を要求します。

---

## 5. Adaptive Clarify Gate と機能証跡ガイド (`forge evidence`)
- **Adaptive Clarify Gate:** 仕様やタスクを書く前に `forge status` と5軸の曖昧性スキャンを行い、不明点があれば最大3〜5問の選択肢で確認してスコープ内外を確定します。
- **証跡取得と生きた機能ガイド:** 実装完了後に `forge evidence plan --change <N>` で対象面と重要度（`P0`/`P1`/`P2`）を抽出し、ユーザー確認のうえ `forge evidence init` / `forge evidence check` でスクリーンショット・録画・コマンド出力を検証し、`forge evidence publish --change <N>` で `docs/guides/<capability>.md` に公開できます。

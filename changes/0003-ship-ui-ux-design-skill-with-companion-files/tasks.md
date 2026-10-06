# Tasks - ship the ui-ux design skill with companion files

Each task is one physical line so `trace.requirement_task_coverage` sees its REQ- id.

- [x] REQ-skill-companions-ship: failing tests in `tests/test_skill_companions.py` (init copies companions, export copies companions, export idempotent, SKILL.md-only skill unchanged, init skips edited companion), using a temporary packaged skill fixture; then add `companion_files` to `src/forge/skills.py` and use it in `scaffold.init_files` and the copy branch of `hosts.export`.
- [x] REQ-skill-companions-ship: widen `[tool.setuptools.package-data]` in `pyproject.toml` to `_skills/**/*` and assert in a test that a built file list includes a companion path.
- [x] REQ-skill-reference-resolves: failing tests for `skill.missing_reference` (dangling reported, resolving clean); then implement the check in `check_skills` and add the code to `KERNEL_SIGNALS`.
- [x] REQ-ui-ux-skill: translate `references/*.md` (top level, 18 files) from evondevKit to English into `src/forge/_skills/ui-ux/references/`, preserving rule IDs, tables, code and token values, neutralising host product names.
- [x] REQ-ui-ux-skill: translate `references/components/*.md` (26 files) to English into `src/forge/_skills/ui-ux/references/components/` under the same rules.
- [x] REQ-ui-ux-skill: translate `references/layouts/*` (5 files including `app-kanban.html`) and `references/tokens.css` comments to English.
- [x] REQ-ui-ux-skill: translate comments and printed strings of `scripts/probe.mjs`, keeping every regex and selector byte-identical; `node --check` passes.
- [x] REQ-ui-ux-skill: write `src/forge/_skills/ui-ux/SKILL.md` (English, ≤250 lines, announce, mode routing, audit, gates, delivery self-checks, `forge verify` exit) with no upstream branding, and record the upstream MIT notice in `THIRD_PARTY_NOTICES.md` at the repository root, shipped via `license-files`.
- [x] REQ-ui-ux-skill: add pressure scenarios in `tests/skills/ui-ux/` and a test that no markdown under the skill contains Vietnamese-specific letters; update the shipped-set list in `tests/test_skills.py`.
- [x] REQ-interface-points-to-ui-ux: add the pointer section to `src/forge/_skills/interface/SKILL.md` and a test asserting it names `ui-ux` and `probe.mjs`.
- [x] Chore: run `forge skill export antigravity` to refresh `.agent/skills/**`, then `forge skill check` and the full test suite.

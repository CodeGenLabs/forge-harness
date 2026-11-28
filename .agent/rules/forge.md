# Forge Harness Operating Rules for Antigravity

Operating rules for working in this repository with Google Antigravity.

- **Unified Entrypoint (/forge):** All changes must start with `/forge <goal>` or `forge`.
- **Adaptive Clarify Gate:** Read codebase context first (`forge status`). If requirements, boundaries, or trade-offs are ambiguous, pause and ask 3-5 targeted multiple-choice questions with recommended defaults and lock In-Scope / Out-of-Scope before writing `spec/` and `tasks.md`.
- **Clarified Preparation & Single Decision Gate:** Once intent is clear, chain `investigate`, `spec/`, and `tasks.md` (with File Map and Out-of-Scope), present one unified plan, and ask for execution strategy: Sequential (Single Agent) vs Parallel (Multi Subagents).
- **Fast Dev Loop (Per Prompt):** Execute tasks in `tasks.md` with strict TDD (Red -> Green -> Refactor) `@covers REQ-...` tags using targeted tests and `forge check --fast`. Do not run full `forge verify` or `forge sync derived` after every prompt on feature branches.
- **Post-Implementation Evidence & Living Guide:** After tasks pass, run `forge evidence plan --change <n>`, confirm case scope with the user (`P0 Critical` / `Full Matrix` / `Skip`), capture real screenshots/recordings or command output (`forge evidence check`), and optionally publish `docs/guides/<capability>.md` (`forge evidence publish`).
- **Workspace Isolation:** All changes must occur on a dedicated feature branch (`forge change new "<title>" --track <A|B|C> --branch`). Never modify code directly on `main` or `master`.
- **Merge Gate & Integration Gate (G5):** Run `forge sync derived`, full `forge verify --change <n>`, `forge check`, and `forge drift --store` once when ready to integrate into `main`, then stop and ask the user whether to merge locally, create a PR, or keep the branch.

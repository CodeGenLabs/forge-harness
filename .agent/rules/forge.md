# Forge Harness Operating Rules for Antigravity

Operating rules for working in this repository with Google Antigravity.

- **Unified Entrypoint (/forge):** All changes must start with `/forge <goal>` or `forge`.
- **Batch Preparation:** When triggered with `/forge`, automatically chain intent restatement, codebase investigation, delta specification (`spec.md`), and task planning (`tasks.md`).
- **Single Confirmation Gate:** Present a single unified Plan Artifact with task DAG, and ask the user to confirm the execution strategy: Sequential (Single Agent) vs Parallel (Multi Subagents).
- **Fast Dev Loop (Per Prompt):** Execute tasks in `tasks.md` with strict TDD (Red -> Green -> Refactor) and `@covers REQ-...` tags using fast targeted tests and `forge check --fast`. Do not run full `forge verify` or `forge sync derived` after every prompt on feature branches.
- **Workspace Isolation:** All changes must occur on a dedicated feature branch (`forge change new "<title>" --track <A|B|C> --branch`). Never modify code directly on `main` or `master`.
- **Merge Gate & Integration Gate (G5):** Run `forge sync derived`, full `forge verify --change <n>`, `forge check`, and `forge drift --store` once when ready to integrate into `main`, then stop and ask the user whether to merge locally, create a PR, or keep the branch.

# Forge Harness Operating Rules for Antigravity

Operating rules for working in this repository with Google Antigravity.

- **Unified Entrypoint (/forge):** All changes MUST start with `/forge <goal>` or `forge`.
- **Batch Preparation:** When triggered with `/forge`, automatically chain intent restatement, codebase investigation, delta specification (`spec.md`), and task planning (`tasks.md`).
- **Single Confirmation Gate:** Present a single unified Plan Artifact with task DAG, and ask the user to confirm the execution strategy: Sequential (Single Agent) vs Parallel (Multi Subagents).
- **Autonomous Execution:** Once approved, execute all tasks in `tasks.md` sequentially with strict TDD (Red -> Green -> Refactor) and `@covers REQ-...` tags. Do not stop after each task; run continuously until `forge verify --change <n>` passes or a declared stop condition is reached.
- **Workspace Isolation:** All changes MUST occur on a dedicated feature branch (`forge change new "<title>" --track <A|B|C> --branch`). NEVER modify code directly on `main` or `master`.
- **Integration Gate (G5):** Do NOT merge directly into `main`. Once `forge verify` passes, stop and ask the user whether to merge locally, create a PR, or keep the branch.

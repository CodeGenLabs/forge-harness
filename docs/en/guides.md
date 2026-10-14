[ 🌐 **English** | [Tiếng Việt](../vi/guides.md) | [日本語](../ja/guides.md) ]
---

# Guides & Integrations

Practical guides for integrating Forge into your engineering workflows, CI/CD pipelines, and AI agent platforms.

---

## 1. Working with AI Coding Agents

Forge includes 9 built-in agent **Skills** located in `src/forge/_skills/`. Install them **once globally** via `forge install --global` (into `~/.gemini/config/skills`, `~/.claude/skills`, `~/.codex/AGENTS.md`) so every project on your machine has them automatically without per-folder skill copies, or per-repo via `forge install`:

* `forge`: Orchestrates the overall change lifecycle and track routing.
* `investigate`: Reads the codebase and proposes candidate claims before modification.
* `specify`: Crafts delta requirements, scenarios, and Track C design/ADR.
* `plan-tasks`: Breaks designs into atomic, testable tasks discharging `REQ-` IDs.
* `implement`: Test-driven development with scope and guard enforcement (`forge guard`).
* `curate-knowledge`: Accounts for touched claims, ratifies candidates, and manages drift.
* `bootstrap`: 3-pass brownfield repository onboarding and claim ratification.
* `interface`: Enforces the `ui` verification contract, 6-axis theme reactivity, zero-literal `i18n`, and 3-pillar mobile responsiveness.
* `ui-ux`: Full front-end design & verification studio (`design-system`, `wireframe`, `mockup`, `refine-block`, `critique`, `polish`, `document`) backed by the 10-source knowledge base and `scripts/probe.mjs`.

### Recommended System Prompt Addition
Add this snippet to your AI agent instructions (e.g. `CLAUDE.md`, `AGENTS.md`, or custom agent prompt):
```markdown
This repository is governed by Forge Harness.
1. Before implementing non-trivial changes, run `forge change new "<name>" --track <A|B|C> --branch` and follow the change gates.
2. Ensure all constitutional invariants in `docs/system/pitfalls.md` are respected.
3. Before submitting changes, run `forge verify --change <N>` and `forge check` and ensure 0 errors.
```

---

## 2. GitHub Actions CI/CD Integration

Keep your repository clean automatically on every Pull Request. Create `.github/workflows/forge.yml`:

```yaml
name: Forge Verification

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  forge-check:
    name: Check Invariants & Claims
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v7
        with:
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v7
        with:
          python-version: '3.11'

      - name: Install Forge
        run: |
          pip install git+https://github.com/CodeGenLabs/forge-harness.git

      - name: Environment Health
        run: forge doctor

      - name: Verify Repository Claims
        run: forge check
```

---

## 3. Monorepo Multi-Package Setup

Forge natively supports monorepos (Python, TypeScript, Go, C#):
```yaml
# .forge/config.yaml
monorepo:
  enabled: true
  packages:
    - "packages/*"
    - "apps/*"
  exclude_id_scan:
    - "**/node_modules/**"
    - "**/dist/**"
    - "**/build/**"
```
Anchors seamlessly target packages:
* `packages/core/src/index.ts#CoreClient`
* `apps/web/src/pages/index.tsx#HomePage`

---

## 4. Resolving Stale Drift

When code refactoring triggers drift:
1. Run `forge check` to locate stale claims.
2. Review the diff: did the architectural contract actually change, or was it just a harmless internal refactoring?
3. If contract changed: Update the description in `docs/system/pitfalls.md` or `docs/system/domain.md`.
4. If harmless refactor: Update the anchor target symbol or re-anchor.
5. Run `forge sync derived` and commit.

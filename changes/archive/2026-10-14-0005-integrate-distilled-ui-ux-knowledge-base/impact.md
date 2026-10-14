# Impact - integrate the distilled 10-source UI/UX knowledge base

## Blast radius

`forge impact` computes 0 changed files prior to implementation. The forecast from the
proposal is:

- `src/forge/_skills/ui-ux/SKILL.md` - rewritten to route the 7 studio/harness actions
  and link the companion files while staying `<= 250` lines.
- `src/forge/_skills/ui-ux/references/**` - legacy 49 files removed and replaced by
  13 English companion files (`principles.md`, `anti-patterns.md`,
  `layout-primitives.md`, `ux-heuristics.md`, `audit-checklist.md`, `typography-ja.md`,
  `design-system.md`, `workflows.md`, `stacks-vue-nuxt.md`, `theme-i18n-mobile.md`,
  `sources.md`, `primitives.css`, `tokens.css`).
- `src/forge/_skills/ui-ux/scripts/probe.mjs` - extended with `--check-theme`,
  `--check-i18n`, and 3-pillar mobile verification.
- `src/forge/_skills/interface/SKILL.md` - updated companion reference pointers.
- `tests/test_skills.py` - expanded with assertions for `REQ-ui-ux-ten-source-kb`,
  `REQ-ui-ux-studio-workflows`, and `REQ-ui-ux-theme-i18n-mobile-gates`.
- `.agent/skills/**` and `docs/system/derived/**` - refreshed via `forge skill export
  --host antigravity` and `forge sync derived`.

## Claims touched

Computed set: empty. Verified by hand: no ratified or candidate claim in `.forge/claims/`
anchors to `src/forge/_skills/**` or `tests/test_skills.py`.

### Unaffected

- (none computed) - the change touches only packaged skill markdown/CSS/scripts and
  skill tests.

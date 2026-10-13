# Proposal - ship the ui-ux design skill with companion files

## Why

The `interface` skill bans the average design and names what the `ui` condition
must prove, but deliberately gives no procedure for producing a good screen. The
MIT-licensed `ui-ux` skill from evondevKit is exactly that procedure - brief,
wireframes, numeric rules, component and layout patterns, a review mode and a
browser probe - and forge cannot ship it today because a packaged skill is a
single `SKILL.md`: nothing else in a skill directory reaches `forge init`,
`forge skill export` or the wheel.

## What changes

- A packaged skill may carry **companion files** (`references/**`, `scripts/**`)
  beside its `SKILL.md`. `forge init`, every copy host of `forge skill export`
  and the package data ship them with the skill.
- `forge skill check` reports a skill whose body links a companion file that does
  not exist (`skill.missing_reference`), so a reference cannot rot silently.
- New packaged skill `ui-ux` (phase `implement`): a new English `SKILL.md` within
  the five rules, routing to the upstream references translated to English and
  presented as part of the harness; the upstream MIT notice is kept once, in
  `THIRD_PARTY_NOTICES.md`, because the licence requires it in copies.
- `scripts/probe.mjs` ships with the skill (comments and report text translated,
  behaviour unchanged) and is offered as a candidate for `commands.ui`.
- `interface` points at `ui-ux` for the procedure; `interface` stays the
  contract, `ui-ux` the method.
- No **BREAKING** change: a skill with only a `SKILL.md` behaves exactly as before.

## Capabilities

- Modified: `src/forge/skills.py` - companion-file listing and the new check.
- Modified: `src/forge/scaffold.py` - `init_files` includes companion files.
- Modified: `src/forge/hosts.py` - copy hosts export companion files.
- Modified: `pyproject.toml` - package data covers `_skills/**`.
- New: `src/forge/_skills/ui-ux/**`, `tests/skills/ui-ux/*.md`.
- Modified: `src/forge/_skills/interface/SKILL.md`.

## Not in this change

- `lint-skill.mjs` from evondevKit: it lints the evondevKit repository's own
  Vietnamese prose and has no meaning here.
- Making `probe.mjs` the default `commands.ui`: it needs Node and Playwright, which
  a project may not have; it is suggested, never declared for the project.

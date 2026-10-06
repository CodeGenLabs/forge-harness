# Design - ship the ui-ux design skill with companion files

## Approach

`skills.py` gains `companion_files(skill_dir) -> list[PurePosixPath]`: every file
under the skill directory except `SKILL.md`, sorted, `__pycache__` excluded. Both
writers - `scaffold.init_files` and `hosts.export` for copy hosts - iterate it after
the `SKILL.md` they already write, so the two code paths cannot disagree about what
a skill is. Companion files are copied as bytes-faithful text (UTF-8, `\n`), with
`scripts/*.mjs` treated the same as markdown.

`check_skills` scans each skill body (fences included - a path in a code block is
still a path the reader will open) for `(references|scripts)/[\w./-]+` and reports
`skill.missing_reference` for each that does not exist under the skill's directory,
resolved against the packaged set or the project's `.forge/skills/<name>/`.

The `ui-ux` skill is rebuilt, not copied:

- `SKILL.md` is new English prose, ≤250 lines: announce, mode routing table (the
  evondevKit "question 1"), the three-layer audit (stack, existing components,
  style), the two gates of the design mode, numeric constraints summary, delivery
  self-checks, and `forge verify` with `commands.ui` as the exit.
- `references/**` are the 48 evondevKit references translated to English with
  structure, rule IDs (`U1`, `S15`, `P12`, `D9`...), tables, code and token values
  preserved. Host product names are replaced by neutral wording.
- `scripts/probe.mjs` keeps its logic; comments and printed report strings are
  translated. `node --check` must pass.
- No upstream branding anywhere in the skill. The MIT licence still requires its notice in copies and substantial portions, so it lives once in `THIRD_PARTY_NOTICES.md` at the repository root and ships in the wheel via `license-files`.

## Alternatives rejected

**Copy evondevKit verbatim into `.agent/skills/ui-ux`.** Fastest, but it ships to
no other project, `forge skill export` would never refresh it, and its 495-line,
all-caps `SKILL.md` breaks four of the five skill rules that every other skill here
is held to.

**Fold a distillation into `interface`.** Keeps one skill, but `interface` is
deliberately an argument without a style; loading 1 MB of a particular taste into
it would contradict its own section 5, and 250 lines cannot carry the method.

**Ship references as a separate data package.** Splits one skill across two
install paths and two versions; the companion-file rule is smaller and general.

## Risks

- Translation drift from the Vietnamese source. Detected by the Vietnamese-letter
  scan and by preserving every rule ID: a reference whose ID set differs from the
  source's is mistranslated.
- `probe.mjs` behaviour change during translation. Detected by `node --check` and
  by keeping every regular expression and selector string byte-identical.
- Wheel size grows by about 1.3 MB. Accepted.

## ADR

None. The companion-file rule extends the existing "skills are packaged markdown"
decision without changing a boundary.

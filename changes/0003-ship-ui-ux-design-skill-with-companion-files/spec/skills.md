# Skills ship with their companion files

## Purpose

A packaged skill is more than one markdown file when its procedure leans on
reference material and helper scripts. This capability lets a skill carry those
files, ships them everywhere the skill itself is shipped, and adds a design
procedure - `ui-ux` - that uses them to build better front ends.

## ADDED Requirements

### Requirement: REQ-skill-companions-ship - Companion files travel with their skill

The system SHALL treat every file under a packaged skill's directory other than
`SKILL.md` as a companion file of that skill, and SHALL write each companion file,
at the same relative path, wherever that skill's `SKILL.md` is written by
`forge init` or by a copy host of `forge skill export`.

#### Scenario: forge init copies a skill's references

- Given the packaged skill `ui-ux` has `references/principles.md`
- When `forge init` runs on an empty repository
- Then `.forge/skills/ui-ux/references/principles.md` exists with the packaged content

#### Scenario: A copy host exports companion files

- Given the packaged skill `ui-ux` has `scripts/probe.mjs`
- When `forge skill export antigravity` runs
- Then `.agent/skills/ui-ux/scripts/probe.mjs` exists with the packaged content
- And it is listed among the paths written

#### Scenario: Export is idempotent for companion files

- Given a repository where a previous export already wrote every companion file unchanged
- When the same export runs again
- Then no companion file is listed as written and the result is `unchanged`

#### Scenario: A skill with no companions is unaffected

- Given a packaged skill whose directory holds only `SKILL.md`
- When `forge init` or a copy export runs
- Then exactly one file is written for that skill, as before this change

#### Scenario: init never overwrites a project's edited companion

- Given `.forge/skills/ui-ux/references/principles.md` already exists with edited content
- When `forge init` runs again
- Then the file is reported as skipped and its content is unchanged

### Requirement: REQ-skill-reference-resolves - A skill's links to its companions must resolve

The system SHALL report an error with code `skill.missing_reference` from
`forge skill check` for every relative path of the form `references/...` or
`scripts/...` named in a skill's body that does not exist under that skill's
directory.

#### Scenario: A dangling reference is reported

- Given a skill whose body names `references/gone.md` and has no such file
- When `forge skill check` runs
- Then one `skill.missing_reference` error names that skill and `references/gone.md`

#### Scenario: Every reference resolves

- Given the shipped `ui-ux` skill
- When `forge skill check` runs
- Then no `skill.missing_reference` error is reported

### Requirement: REQ-ui-ux-skill - forge ships a ui-ux design procedure

The system SHALL ship a skill named `ui-ux` that obeys every rule `forge skill check`
enforces, is written in English, and routes a front-end request to one of its
modes - design with brief and wireframes, build directly, design system first,
review, rebuild keeping the brand, refactor keeping the look, logo, and small
component fix - each backed by an English companion reference.

#### Scenario: The skill passes the skill rules

- Given the packaged skills
- When `forge skill check` runs
- Then no error is reported for `ui-ux`, including length, announce, compulsion and host-specific rules

#### Scenario: The skill reads as part of the harness

- Given every markdown, HTML and CSS file under the packaged `ui-ux` skill
- When it is scanned for Vietnamese-specific letters and for the names `evondevKit` or `evon`
- Then none is found
- And the upstream copyright notice exists only in the repository's `THIRD_PARTY_NOTICES.md`

#### Scenario: The skill is pressure-tested

- Given the scenarios under `tests/skills/ui-ux/`
- When `forge skill check` validates scenarios
- Then there is at least one scenario and every scenario is valid

### Requirement: REQ-interface-points-to-ui-ux - The interface contract names the procedure

The `interface` skill SHALL direct a reader who must produce a screen to the
`ui-ux` skill for the procedure, while keeping its own banned defaults and the
`ui` condition as the contract that `ui-ux` output is held to.

#### Scenario: interface links ui-ux

- Given the packaged `interface` skill
- When its body is read
- Then it names `ui-ux` as the procedure for designing and building a screen
- And it names `scripts/probe.mjs` of `ui-ux` as one possible `commands.ui`

# skills

## Purpose

A packaged skill is more than one markdown file when its procedure leans on
reference material and helper scripts. This capability lets a skill carry those
files, ships them everywhere the skill itself is shipped, and adds a design
procedure - `ui-ux` - that uses them to build better front ends with a
distilled 10-source knowledge base, 6-axis theme reactivity, zero-literal
frontend/backend localization (`i18n`), and 3-pillar mobile optimization.

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
actions - `design-system`, `wireframe`, `mockup`, `refine-block`, `critique`,
`polish`, and `document` - each backed by an English companion reference.

#### Scenario: The skill passes the skill rules

- Given the packaged skills
- When `forge skill check` runs
- Then no error is reported for `ui-ux`, including length, announce, compulsion and host-specific rules

#### Scenario: The skill reads as part of the harness

- Given every markdown, HTML and CSS file under the packaged `ui-ux` skill
- When it is scanned for Vietnamese-specific letters and external repository branding
- Then none is found

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

### Requirement: REQ-ui-ux-ten-source-kb - The ui-ux skill ships the distilled 10-source knowledge base
The packaged `ui-ux` skill SHALL ship English companion files under `references/` that
cover all ten canonical UI/UX design domains and standards (`IMP`, `FD`, `UPM`, `UIS`,
`WIG`, `ADM`, `ADMJ`, `EL`, `RUI`, `LUX`, and `WCAG`), where every rule is written in
original English prose, specifies a concrete checkable condition, and cites its domain
code.

#### Scenario: Core knowledge base files exist and cite sources

- Given the packaged `ui-ux` skill directory `src/forge/_skills/ui-ux`
- When its `references/` directory is inspected
- Then `principles.md`, `anti-patterns.md`, `layout-primitives.md`, `ux-heuristics.md`, `audit-checklist.md`, `typography-ja.md`, `design-system.md`, `workflows.md`, `stacks-vue-nuxt.md`, `theme-i18n-mobile.md`, `sources.md`, `primitives.css`, and `tokens.css` all exist
- And `sources.md` documents all domain citation codes (`RUI`, `EL`, `LUX`, `IMP`, `UPM`, `WIG`, `UIS`, `FD`, `ADM`, `ADMJ`, `WCAG`)

#### Scenario: Every Layout primitives and OKLCH tokens are shipped

- Given `references/layout-primitives.md`, `references/primitives.css`, and `references/tokens.css` under `ui-ux`
- When their contents are inspected
- Then `primitives.css` defines all twelve intrinsic layout primitives (`.l-stack`, `.l-box`, `.l-center`, `.l-cluster`, `.l-sidebar`, `.l-switcher`, `.l-cover`, `.l-grid`, `.l-frame`, `.l-reel`, `.l-imposter`, `.l-icon`) without viewport `@media` queries
- And `tokens.css` defines parameterized 6-axis tokens (`--primary-hue`, `--neutral-hue`, `--radius-scale`, `--icon-stroke`, `--font-sans`, and `[data-theme="dark"]`) in `oklch(...)`

#### Scenario: Laws of UX heuristics, Japanese typography, and Vue/Nuxt stack guides are present

- Given `references/ux-heuristics.md`, `references/typography-ja.md`, and `references/stacks-vue-nuxt.md`
- When their contents are inspected
- Then `ux-heuristics.md` defines `LUX-01` through `LUX-10` and the 100-point wireframe review rubric (`R1` through `R8`)
- And `typography-ja.md` defines Japanese kinsoku (`line-break: strict`), mixed-script, and OpenType `palt`/`tnum` rules (`JA-01` through `JA-61`)
- And `stacks-vue-nuxt.md` maps semantic tokens to Vue 3, Nuxt, Nuxt UI v4 (`@nuxt/ui`), shadcn-vue, and Tailwind CSS v4 (`@theme`)

### Requirement: REQ-ui-ux-studio-workflows - The ui-ux skill routes studio and harness actions
The `ui-ux` skill's `SKILL.md` and `references/workflows.md` SHALL define actionable
procedures for `design-system`, `wireframe`, `mockup`, `refine-block`, `critique`,
`polish`, and `document`, obeying all five `forge skill check` rules and containing
zero Vietnamese-specific letters or external repository branding across all companion files.

#### Scenario: SKILL.md routes all seven studio actions and passes skill check

- Given the packaged `ui-ux` skill
- When `forge skill check` runs
- Then zero errors are reported for `ui-ux`
- And `SKILL.md` names `design-system`, `wireframe`, `mockup`, `refine-block`, `critique`, `polish`, and `document` along with `scripts/probe.mjs` and `forge verify`

#### Scenario: Companion files are self-contained and free of external repository branding

- Given every markdown, HTML, and CSS file under `src/forge/_skills/ui-ux`
- When its contents are scanned
- Then it contains zero Vietnamese characters and zero external repository names

### Requirement: REQ-ui-ux-theme-i18n-mobile-gates - The harness enforces 6-axis theme reactivity, zero-literal i18n, and 3-pillar mobile optimization
The `ui-ux` skill (`SKILL.md`, `references/theme-i18n-mobile.md`, `references/audit-checklist.md`,
and `scripts/probe.mjs`) and the `interface` skill (`src/forge/_skills/interface/SKILL.md`)
SHALL enforce:
1. Full-page 6-axis theme reactivity (`Primary`, `Neutral`, `Font`, `Icons`, `Radius`,
   `Light/Dark mode`, rules `TH-01`..`TH-10`) so theme changes leave zero hardcoded elements behind;
2. Zero-literal frontend and backend localization (`I18N-01`..`I18N-10`) so language
   switching leaves zero untranslated strings, attributes, or raw translation keys; and
3. Mandatory 3-pillar mobile responsiveness at `320px-375px` across Layout (`MOB-LY-01`..`08`:
   zero wrapped buttons/badges, zero orphan word drops, zero crushed flex text columns,
   zero horizontal overflow), Performance (`MOB-PERF-01`..`06`: zero CLS, lazy media,
   compositor-only motion, single blur cap), and Touch UX (`MOB-UX-01`..`08`: `>= 44x44px`
   targets, `>= 16px` input font against iOS auto-zoom, `inputmode`, `100dvh` + safe-area).

#### Scenario: Theme, i18n, and mobile rules are documented and linked

- Given `src/forge/_skills/ui-ux/references/theme-i18n-mobile.md` and `src/forge/_skills/interface/SKILL.md`
- When their contents are inspected
- Then `theme-i18n-mobile.md` defines `TH-01`..`TH-10`, `I18N-01`..`I18N-10`, `MOB-LY-01`..`MOB-LY-08`, `MOB-PERF-01`..`MOB-PERF-06`, and `MOB-UX-01`..`MOB-UX-08`
- And both `ui-ux/SKILL.md` and `interface/SKILL.md` require 6-axis theme reactivity, zero-literal i18n, and 3-pillar mobile verification

#### Scenario: probe.mjs supports theme mutation, i18n leakage, and mobile 3-pillar checks

- Given `src/forge/_skills/ui-ux/scripts/probe.mjs`
- When its source is checked with `node --check` and inspected
- Then it supports `--check-theme` and `--check-i18n` CLI flags
- And it detects `iosZoomInputs`, `crushedTextColumns`, `orphanLastLineWords`, `mobilePerfIssues`, `i18nIssues`, and `unthemedElements`

### Requirement: REQ-skill-global-install - Skills can be installed once globally and omitted from per-project scaffolds
The system SHALL support `forge install --global` (and `forge skill export --global`)
to write packaged skills and companion files into user-level global host directories
(`~/.gemini/config/skills`, `~/.claude/skills`, `~/.codex/AGENTS.md`) and SHALL
support `forge init --no-skills` to scaffold `.forge/` and `docs/system/` without
copying `.forge/skills/` into the project directory.

#### Scenario: Global install writes packaged skills and companions to user home

- Given a user home directory
- When `forge install --global` runs
- Then packaged skills and their companion files exist under `~/.gemini/config/skills/`, `~/.claude/skills/`, and `~/.codex/AGENTS.md`

#### Scenario: forge init --no-skills skips copying .forge/skills

- Given an empty git repository
- When `forge init --no-skills` runs
- Then `.forge/config.yaml` and `docs/system/OVERVIEW.md` are created
- And `.forge/skills/` is not created, while `forge skill list` still resolves the packaged skills


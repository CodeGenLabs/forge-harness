# Investigation - integrate the distilled 10-source UI/UX knowledge base

## Domains examined

All ten canonical UI/UX design domains and standards were synthesized into testable rules:

1. **`[IMP]` Craft & Polish Discipline**:
   - 7 craft reference domains (`typography`, `color-and-contrast`, `spatial-design`,
     `motion-design`, `interaction-design`, `responsive-design`, `ux-writing`) and 3
     action workflows (`critique`, `polish`, `document`).
   - Deterministic anti-pattern thresholds (line length, line height, banned font list,
     pure black/gray on colored backgrounds, card-in-card nesting, bounce/elastic easing,
     `100vh`, etc.).
2. **`[FD]` Aesthetic Direction & Anti-Convergence**:
   - Aesthetic direction commitment before coding, memorable differentiation anchor,
     anti-convergence on generic fonts/colors, and canonical `SKILL.md` frontmatter +
     progressive disclosure into `references/` and `scripts/`.
3. **`[UPM]` Design-System Synthesis & Stack Matrix**:
   - Product-type palettes in OKLCH + hex, font pairings, chart types with WCAG/colorblind
     guidance, 99 UX guidelines (`ux#1`–`ux#99`), design system synthesis workflow, and
     stack guides (`nuxt-ui`, `vue`, `nuxtjs`, `shadcn-vue`, `tailwind`).
4. **`[UIS]` Baseline UI & Motion Constraints**:
   - Baseline UI consistency constraints, accessibility remediation, motion performance,
     and the 6-step orchestration playbook.
5. **`[WIG]` Web Interface & Accessibility Audit**:
   - Audit rules across accessibility, focus/keyboard, forms, animation, typography
     (`tabular-nums`, `text-wrap: balance`, curly quotes), performance, and dark-mode
     `color-scheme`.
6. **`[ADM]` Canonical `DESIGN.md` Specification**:
   - Canonical `DESIGN.md` format + 5 reference exemplars (`linear.app`, `vercel`,
     `stripe`, `notion`, `theverge`).
7. **`[ADMJ]` Japanese Typography & `DESIGN.ja.md`**:
   - Japanese `DESIGN.ja.md` template + `JA-01`..`JA-61` rules (font stacks,
     `AdjustedYuGothic` `@font-face`, line-height/tracking profiles, `palt`/`tnum`,
     `line-break: strict; overflow-wrap: anywhere; word-break: auto-phrase`, and
     mixed-script spacing).
8. **`[EL]` *Every Layout* (Heydon Pickering & Andy Bell, 3rd ed.)**:
   - Axiom of `60ch` measure, algorithmic layout without viewport media queries, and
     the 12 CSS primitives (`Stack`, `Box`, `Center`, `Cluster`, `Sidebar`, `Switcher`,
     `Cover`, `Grid`, `Frame`, `Reel`, `Imposter`, `Icon`) plus `.l-container`.
9. **`[RUI]` *Refactoring UI* (Adam Wathan & Steve Schoger)**:
   - Visual hierarchy via weight/contrast before size, non-linear spacing and type
     scales, 9–10 shade tonal palettes, elevation via multi-part shadows or surface
     lightness, and border reduction.
10. **`[LUX]` *Laws of UX* (Jon Yablonski, 2nd ed., O'Reilly)**:
    - 10 core laws (`LUX-01` Jakob's Law through `LUX-10` Miller's Law), 19 related
      heuristics (`LUX-11`..`LUX-29`), scriptable DOM/CSS checks, and the 100-point
      wireframe/mockup rubric (`R1`–`R7` + `R8`).

## Kernel constraints verified

- `src/forge/skills.py` enforces 5 rules on `src/forge/_skills/ui-ux/SKILL.md`:
  1. `MAX_LINES = 250`.
  2. `requires-kernel` entries must be valid `forge` commands and appear in the body.
  3. `_SHOUT_RE` flags two or more adjacent all-caps words outside code fences unless
     every word is in `_SHOUT_ALLOWED`. Avoid multi-word uppercase tokens like
     `DOM CSS` or `OKLCH HEX` in `SKILL.md` prose; use lowercase or code backticks/fences.
  4. `_HOST_SPECIFIC_RE` bans `claude`, `anthropic`, `cursor`, `copilot`, `codex`,
     `windsurf`, `aider`, `sub-agent`, `slash command`, `MCP server`, `the Task tool`
     in `SKILL.md` outside code fences.
  5. `_COMPANION_REF_RE` requires every `references/...` or `scripts/...` path
     mentioned anywhere in `SKILL.md` (including inside code fences) to exist under
     `src/forge/_skills/ui-ux/`.
- `tests/test_skills.py` checks:
  - `ui_skill.phase == "implement"`
  - `"forge verify" in ui_skill.requires_kernel`
  - `"references/principles.md" in ui_skill.body`
  - `"scripts/probe.mjs" in ui_skill.body`
  - No Vietnamese-specific characters in any `.md`, `.html`, or `.css` file under
    `src/forge/_skills/ui-ux/`.

## Candidate claims

None. The claim store covers kernel modules (`store.py`, `anchor.py`, `derive.py`,
`impact.py`, `spec.py`, `bootstrap.py`), none of which are modified by this skill
knowledge base replacement.

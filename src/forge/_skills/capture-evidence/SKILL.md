---
name: capture-evidence
phase: verify
description: >
  Capture real functional proof (screenshots, screen recordings, or CLI/API
  output) after confirmation of scope, and publish living user guides.
requires-kernel: ["forge evidence plan", "forge evidence init", "forge evidence check", "forge evidence publish"]
reads: from-dag
writes: ["changes/${change}/evidence/**", "docs/guides/**"]
---

# capture-evidence

## Announce

> Running `capture-evidence`: confirming proof scope and collecting functional evidence.

## What this does

Turns implemented changes into verifiable proof (`changes/<n>/evidence/walkthrough.md`)
and optionally distills that walkthrough into a user-facing guide
(`docs/guides/<capability>.md`). Proof is selective: when a change touches many
cases, you confirm scope with the human instead of blindly recording everything.

## 1. Plan the case matrix

```bash
forge evidence plan --change <n>
```

Inspect the detected project surface (`web`, `hybrid`, `api`, `cli`, `library`),
capture methods, prioritized scenarios (`P0` core, `P1` boundary/error, `P2` minor),
and target guide path.

## 2. Confirm scope before capturing

Always present the planned case list and counts to the user and ask them to pick
both the **evidence scope** and **living guide** choice before capturing:

1. **P0 Critical only** (recommended when total cases > 4) - `--mode critical`.
2. **Full Matrix** (all prioritized cases, recommended when <= 4 cases) - `--mode full`.
3. **Skip with reason** (internal refactors or non-observable changes) - `--mode skip --reason "<why>"`.
4. **Guide output:** publish/update `docs/guides/<capability>.md`, or keep evidence only under `changes/<n>/evidence/`.

If `mode` is `skip`, run `forge evidence init --change <n> --mode skip --reason "<why>"`
and stop cleanly without inventing captures.

## 3. Initialize the walkthrough

```bash
forge evidence init --change <n> --mode <critical|full|skip>
```

For `skip`, include `--reason "<why>"`. Otherwise this creates
`changes/<n>/evidence/walkthrough.md` and `changes/<n>/evidence/assets/`.

## 4. Capture real proof per surface

Execute every selected case against the running build and record real artifacts:

- **Web / Hybrid:** open the real rendered flow in a browser, perform each step,
  capture PNG screenshots and/or WebM screen recordings into
  `changes/<n>/evidence/assets/`, and check for zero console or network errors.
- **API / CLI / Library:** run the real command or request against the repository
  code and paste the verbatim command plus actual terminal output or HTTP trace
  into fenced blocks.

Never write passing checkmarks, fabricated console output, or placeholder links
for steps that were not actually executed and observed.

## 5. Verify evidence completeness

Remove the template marker line from `changes/<n>/evidence/walkthrough.md`,
ensure every case row and `Result` is filled in with `PASS` or `FAIL`, and run:

```bash
forge evidence check --change <n>
```

Fix any reported missing asset files, empty files, or unresolved placeholders.

## 6. Publish living functional guide (when approved)

If the user opted to generate or update the functional guide:

```bash
forge evidence publish --change <n>
```

This verifies the walkthrough, copies referenced images and recordings into
`docs/guides/assets/<capability>/`, rewrites relative links, writes
`docs/guides/<capability>.md`, and updates `docs/guides/README.md`.

## Exit

`forge evidence check --change <n>` passes (or `skip_evidence` has a recorded
reason), and `docs/guides/<capability>.md` is updated if approved.

# Evidence — what Forge measured about itself

A harness that enforces "show the evidence" owes its own. This page is the record: what was
measured, what came back, and — for the three results that went **against** the design —
what changed because of them.

Every measurement fixed its plan and its scoring rubric in a commit **before** the run, so
a result could not be reinterpreted after the fact. The commit hashes are given so that
ordering can be checked rather than believed.

!!! note "Where the full reports live"
    The long-form reports were removed from the working tree when the documentation was
    rebuilt. They remain in git history and can be read with
    `git show ef2b051^:docs/measurements/<file>`. This page carries the results, the
    limits, and the design changes they caused.

---

## Summary

| # | Question | Result | What it changed |
|---|---|---|---|
| **M1** | Do anchors survive real refactoring? | **Pass** — 0.61% false positives, 0% false negatives; residual closed to 0.00% | Path+symbol anchors with rename following, plus a `shifted`/`stale` split |
| **Q1** | Does the claim store help an agent avoid a trap? | **Null** — 6 of 6 avoided it, both arms | The store's prose dropped in priority; authoring guidance rewritten |
| **Q1b** | Where else does each claim's knowledge already live? | **11 of 13** have another home the reader meets anyway | `restates:` line added to the bootstrap review sheet |
| **Q1c** | What does an anchor fail to cover? | **7 of 18** claims break without an anchor moving | `evidence:` promoted to "what enforces this"; `forge check` counts claims that name none |
| **W1** | Does a stale report change an outcome? | **Strong negative** — 3 of 3 drift events were restamps, 0 repairs | `forge drift` now executes a claim's evidence tests |
| **W2** | Does the store help when the knowledge is *only* in the store? | **Null** — 6 of 6 avoided it again | Confirmed Q1 rather than rescuing it |

---

## M1 — Do anchors survive real refactoring?

**Method.** 30 anchors placed on real declarations 200 commits back in each of three
repositories, then the mainline replayed forward — 600 commits in total — plus a controlled
perturbation experiment, because the replay alone could not produce a false-positive rate.

**Why the perturbation was necessary, and it is itself a finding.** Across 600 replayed
commits there were **zero pure renames and zero formatting-only commits**. These projects
run formatters continuously, so the two failure modes the design most feared never appear
as isolated commits in recent history. An empty population yields no rate, and reporting
"0 false positives" from an empty population would have been dishonest.

**Result: pass.** 0.61% false positives, 0% false negatives. The residual 0.61% came from
git's rename detection giving up on a low-similarity move; content-addressed relocation was
added as a fallback and closed it to 0.00%.

**Limits stated at the time.** Semantically neutral refactors — extract variable, reorder
independent statements — have no mechanical ground truth and were excluded from the rates,
so the true false-positive rate is higher by an unknown margin. Only declarations with a
body were perturbed. Three languages, three repositories, mainline only.

---

## Q1 — Does the claim store help? *(null)*

**Design.** One trap, six agents, plan and rubric committed first. Three agents were
pointed at `docs/system/` — the claim store — and three at the code alone. Nothing forbade
the second group from reading anything. The trap: an introspection method ending
`catch { return [] }`, so every failure became an empty list.

**Result: 6 of 6 avoided it.** Arm A (store) 3/3 at ~18 tool calls; arm B (code) 3/3 at
~13. The store cost 40% more looking around for the same verdict.

**Why.** The rule was already written down in that repository four times — a rules table, a
review checklist, and two specs — and every agent in arm B found them unaided, citing the
exact section the claim had been derived from. **A claim derived from a document competes
with that document, and the reader usually finds the document.**

**What changed.** Nothing was patched to make the number better. The authoring guidance was
rewritten instead: before writing a candidate drawn from a document, answer what the claim
adds that its source does not. An **anchor** is a real answer — prose does not know when the
code under it moved. **Reach** is the other — knowledge recorded nowhere near the work. A
shorter restatement is neither.

---

## Q1b — Where else does the knowledge live? *(census)*

Q1 was one trap. This asked the same question of **every** pitfall in two bootstrapped
repositories, by inspection, so a reader can disagree with a row instead of with a number.

**Result: 11 of 13 have a home the reader meets while doing the work** — four in a prose
document, five in the code at the anchor, two in a test. Two have none.

**What changed.** `forge bootstrap review` now prints a `restates: <document>` line under
any candidate whose evidence names a document in the repository, and asks the reviewer
plainly whether a reader would find that document anyway. Deliberately **not** a check:
firing on any document-backed evidence would flag good claims too, so it is a judgement,
and judgement belongs in front of a human.

**A correction, left visible.** The first version of this census reported 10 of 13 and
named `PIT-adapter-prefix-is-a-raw-string-prefix` as the sharpest orphan — knowledge stated
nowhere. That was wrong. `tests/test_requests.py:1705-1730` carries two dedicated tests
added for issue #6935 covering exactly that hazard. The error came from reading one
adjacent test and stopping. It was found during W2 and struck through in place.

---

## Q1c — What an anchor does not cover

M1 measured whether anchors *survive* refactoring — a false-positive rate. This measured the
false negative, which is worse: **a claim that fails to go stale when it breaks is a
checked-looking record of something untrue.** One question per claim: name an edit that
makes this false without touching any anchor.

**Result: 7 of 18.** The reason is uniform enough to be a law:

> An anchor covers a claim exactly when the claim is about the code at the anchor. A rule
> the whole repository must obey has no such symbol, because it breaks by code appearing
> somewhere it was not.

Six of the seven were caught anyway — four by a conformance test, one by `forge check`
itself, one by a foreign key at runtime. One was caught only instance by instance.

**What changed.** Two things, both in authoring rather than in mechanism, because the
mechanism was not what failed:

- `curate-knowledge` now says to anchor a repository-wide rule at **what enforces it** —
  the test, the lint rule, the guard, the constraint — not at an example of it, and to say
  so in the prose when nothing does.
- `forge check --scope store` ends with one line counting claims that name no enforcer. A
  **count**, not an issue per claim: fifteen of eighteen would have fired, and a wall of
  warnings on every run is how a warning stops being read.

**A check that was tried and abandoned, recorded so nobody builds it again.** The obvious
detector is lexical — flag a pitfall whose title says *every*, *never*, *only*. Against
these eighteen claims it is wrong in both directions, because the distinction is the scope
of the subject, not the vocabulary.

---

## W1 — Does a stale report change an outcome? *(strong negative)*

The negative condition was declared before the measurement: *if every real drift event to
date was discharged by a restamp with no code or claim change, the staleness mechanism has
functioned as an administrative tax rather than a guardrail.*

**That is what came back.**

- **Historical drift census (n=3):** 3 of 3 events discharged via `confirm` restamp. Code
  or claims changed: **0 lines**. Real regressions prevented: **0**.
- **Triage sufficiency (18 claims):** **0 of 18** were self-triaging from commit metadata
  alone. 16 of 18 required opening and reading the claim; 2 required a multi-file audit.

**What changed — the most consequential design change on this list.** A report nobody can
act on without reading everything is a report that gets restamped. So `forge drift` now
**executes the claim's cited `evidence` tests** when an anchor goes stale, turning a benign
AST shift and a real invariant violation into an automated green/red signal instead of a
prompt. The pre-commit hook triages on the same signal (`forge drift confirm --green`).

The `bugfix` workflow was added alongside it: a change of that kind must produce a
`reproduce` artifact — a failing test — **before** anything else, and that test becomes the
`evidence:` of whatever claim the bug produces. Claims born from bugs now arrive with an
enforcer already attached, which is the Q1c gap closed by construction rather than by
discipline.

**Limits.** n=3 real drift events. Whether developers heed or ignore stale reports across
weeks of multi-person development cannot be determined without a human study.

---

## W2 — The inverse experiment *(null)*

Q1 found the store added nothing because the trap already had written homes elsewhere. W2
was the inverse: a trap whose record was believed to exist **only** in the store. Same two
arms, same rubric shape, committed before dispatch.

**Result: 6 of 6 avoided it.** Arm A 3/3 at 18.7 tool calls average; arm B 3/3 at 22.3.

Two reasons, and the first is a correction to this project's own earlier work:

1. **The premise was wrong.** The trap was *not* recorded only in the store — see the Q1b
   correction above.
2. **Every arm-B agent found `docs/system/pitfalls.md` on its own**, reproducing Q1's
   result: a capable agent explores documentation directories without being told to.

**Limits.** n=6. A single, highly capable model family; a less exploratory agent might
depend on the pointer more.

---

## What this record does not show

Stated plainly, because a page of evidence that only lists wins is an advertisement:

- **No measurement here shows the claim store improving an outcome.** Two ran, two came
  back null. The mechanism that survived scrutiny is the **anchor** — the one thing on this
  list that prose, a changelog line and a conformance test cannot do — and its value is
  supported by M1 (it works) and by Q1c (it has a defined blind spot), not by an outcome
  study.
- **Sample sizes are small**: n=6, n=6, n=3, 13 and 18 claims. These are anecdotes with
  fixed rubrics. They can show a mechanism working or failing; they cannot show a rate.
- **The author designed the tasks and scored them.** That is a real limit on every result
  above, including the negative ones.

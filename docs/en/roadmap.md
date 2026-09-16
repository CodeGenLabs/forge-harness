# Roadmap

What to build next, and — with more confidence — what not to. Every item below is
justified against [the evidence record](evidence.md) rather than against a feature wish
list, because that record is unusually unkind to the obvious next features.

---

## Where this stands

Six measurements are on the books. Read together they say three things and imply a fourth.

**The claim store has been measured twice and returned null twice.** Q1 and W2 both ran
six agents across two arms; twelve of twelve avoided the trap, and the arm pointed at the
store spent more tool calls getting there. Q1b found that 11 of 13 claims restate something
the reader meets anyway. Writing better claim prose is not where the next improvement is.

**The anchor is the mechanism that survived scrutiny.** M1 showed it works (0.61% false
positives, closed to 0.00%); Q1c mapped its blind spot precisely (7 of 18 claims break
without an anchor moving, because a repository-wide rule has no symbol to attach to). A
mechanism with a measured strength and a measured limit is the one worth building on.

**The drift report, as it stood, was a tax.** W1 found 3 of 3 real drift events discharged
by a restamp, with zero code or claim changes and zero regressions prevented, and 0 of 18
claims triageable from commit metadata alone. That produced the most consequential change
in the project's history: `forge drift` now executes a claim's cited `evidence` tests, and
the `bugfix` workflow makes a failing reproduce test the `evidence:` of any claim a bug
produces.

**And the implication, which is the whole reason this roadmap looks the way it does: every
measurement so far has tested the claim store.** The change lifecycle — specs, tasks,
gates, `verify`, the archive — is the larger part of the codebase and has **no evidence at
all**. Nobody has asked whether writing a spec first reduces rework.

---

## Phase 0 — Use it. Stop building.

Everything below is subordinate to this.

Forge is at 0.1.0 with documentation, installers and three hosts. `corvus-db-studio`
already carries the conformance tests delivered during W3, so it is half adopted already.
What the project has never had is **one person using it continuously on their own work**.
Every number on the evidence page is n=3 to n=6, produced by agents on borrowed
repositories, scored by the person who designed the task.

**Adopt Forge on one real project for ten real changes.** Do not instrument anything
elaborate. Use it, and write down where it gets in the way — the friction log is the input
to everything that follows.

The failure mode to watch for is the one this harness exists to prevent, turned on itself:
ceremony that produces artifacts nobody reads. If a track-C change on a two-line fix feels
absurd, that is data, not a discipline problem.

---

## R1 — `forge stats`

This was **option C of Q1 from the very first analysis**, described there as nearly free
because the artifacts already exist, and it has never been built. It is worthless before
Phase 0 and valuable immediately after, so the two ship together.

**What it must report**, all of it derivable from `verification.json`, the change
directories and the drift ledger:

- rework rate — changes reopened or superseded after archive
- failed verifications before the first green one, per change
- elapsed time from `change new` to `archive`
- drift events, and the verdict each received (V1–V4 versus `confirm`)
- claims added, retired and superseded per change
- **the enforcer rate**: the share of pitfall and invariant claims naming a test or guard

**What it must not report**: claim counts, "knowledge coverage %", or anything else that
rises when somebody writes another claim. Q1, Q1b and W2 all point the same way — more
claim prose is not the goal, and a metric that rewards it will be optimised.

---

## R2 — Measure the lifecycle, not the store

The store has been measured twice and answered null twice. Measuring it a third time is
not the honest next move; measuring the untested majority of the system is.

**The question**: does specifying before implementing change the outcome, or is it
overhead?

**The shape**: a paired comparison on real work from Phase 0. Comparable changes, half
taken through track B or C with spec and tasks, half through track A. Compare rework rate,
review findings and time to green.

The same discipline as every prior measurement applies and is not negotiable: **fix the
rubric and the null condition in a commit before the first change is opened.** A
measurement whose criteria were chosen after seeing the data is not a measurement.

Expect this to be harder to run cleanly than Q1 was, because the changes will not be
matched pairs and the person doing them knows which arm they are in. Say so in the plan;
a limit named in advance is worth more than a number defended afterwards.

---

## R3 — Make the claim store optional

The cheapest decisive experiment left.

Two agent experiments could not show the store helping. A third will not either. But
**running without it for ten real changes and seeing whether it is missed** answers the
question in a way no agent trial can, because the person who misses it will be able to say
exactly what for.

It also removes the adoption barrier honestly. Today a new repository must bootstrap a
store before it sees any benefit, and the benefit is the thing that is not yet
demonstrated. Anchors, the change lifecycle, drift and `verify` do not depend on a
populated store; the tool should not pretend they do.

If the store turns out to be missed, that is the positive result two experiments failed to
produce — and it will arrive with a specific account of what it was missed for.

---

## R4 — The enforcer rate is the store's real KPI

Q1c's conclusion was that `evidence:` — what enforces the claim — is the part with value,
not the prose. The `bugfix` workflow already forces it structurally: a bug produces a
failing reproduce test, and that test becomes the claim's evidence.

So the measurable question over Phase 0 is simply: **does the enforcer rate rise?** When it
was first measured on this repository, `forge check` reported 4 of 5 claims naming none.
If ten real changes move the store toward a catalogue of what is actually enforced, the
store has found a job that prose cannot do. If the rate does not move, R3's answer becomes
much easier.

---

## Risks being carried

Named because they are known, not because they are urgent.

**The pre-commit hook now runs evidence tests.** `forge drift --staged --test` executes a
claim's cited tests with a 30-second timeout per target and no caching. On a large
repository a staged change touching several claims could make every commit slow enough
that people reach for `--no-verify`, which is how a hook stops existing. Mitigations, in
order of cost: cache results by commit SHA, run only the claims whose anchors are genuinely
stale, and enforce a total budget rather than a per-target one.

**The test suite takes roughly 12–15 minutes on Windows.** The cost is git subprocess
overhead in the lifecycle tests — 2 to 4.5 seconds each, dominated by
`test_the_acceptance_case` and the archive tests. It is *not* caused by the new evidence
execution, which costs about 0.4 seconds per test; that was assumed and then measured, and
the assumption was wrong. This is contributor friction rather than a defect, and the fix if
it is ever worth making is a shared fixture repository rather than a per-test one.

**One user, one operating system, one language genuinely exercised.** C# now has a grammar
and a declaration table, but no C# repository has been bootstrapped. The feature is
untested against reality, and the first real C# project will find things.

---

## Deliberately not building

Each of these is a reasonable-sounding idea that the evidence argues against.

**More hosts, before a second real user.** Three hosts already exceed the demonstrated
demand. Host support is a table row; the cost is in keeping every row honest.

**A cross-repository knowledge store.** Already deferred as P2 in the open questions, and
nothing since has made the case stronger. Per-repository knowledge is not yet shown to
help; shared knowledge is a larger version of an unproven bet.

**More claim kinds, or richer claim prose.** Q1, Q1b and W2 all point the other way. The
store's problem is not that it cannot express enough.

**Any metric that rises when somebody writes another claim.** Stated twice on purpose.

---

## How this roadmap gets revised

By the friction log from Phase 0, and by `forge stats` once it has data — not by reasoning
about what a harness ought to have. Three of the six measurements on the evidence page went
against the design, and each of them changed it. That is the only mechanism this project
has that has reliably worked.

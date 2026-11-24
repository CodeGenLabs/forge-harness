# Pitfalls

### PIT-derived-self-reference - A census that counts its own output never settles

```claim
kind:     pitfall
status:   asserted
truth-source: decision
anchors:  ["src/forge/derive.py#build_inventory@ec22a88bdd"]
evidence:
  - test: tests/test_derive.py::test_the_derived_tier_does_not_describe_itself
  - test: tests/test_deps.py::test_the_derived_tier_does_not_describe_itself
reviewed: 2026-09-12
```

A derived file cannot carry the id of the commit that contains it, and a
census that counts its own output moves every time that output is committed.
Both were found the hard way and both made the tier permanently stale.
evidence-from: two corrections recorded in SYSTEM_KNOWLEDGE.md section 2.3.

### PIT-regex-across-newlines - `\s*` crosses the newline and eats the next line

```claim
kind:     pitfall
status:   asserted
truth-source: decision
anchors:  ["src/forge/impact.py@1611053ed7"]
evidence:
  - test: tests/test_impact.py::test_the_reason_never_swallows_the_next_line
reviewed: 2026-10-14
```

Using `\s*` between a captured id and its trailing text swallows the
following line, so "you gave no reason" silently became "the next heading is
your reason". Horizontal whitespace only, in every line-shaped pattern here.
evidence-from: the bug found by the claim-touch reason test.

### PIT-markdown-bullet-is-not-a-diff - A leading dash is not a diff marker

```claim
kind:     pitfall
status:   asserted
truth-source: decision
anchors:  ["src/forge/spec.py@60d0693e5b"]
evidence:
  - test: tests/test_spec.py::test_markdown_bullets_are_not_diff_markers
reviewed: 2026-11-24
```

Every scenario line in the spec delta grammar is a `- ` bullet, so keying a
diff-fragment check on `^[+-]` rejects every correct MODIFIED block. Key on
`+` and hunk headers instead. evidence-from: the check firing on its own
fixture during M3.

### PIT-bullet-continuation-lines - A wrapped bullet is one item, not one line

```claim
kind:     pitfall
status:   asserted
truth-source: code
anchors:  ["src/forge/bootstrap.py#_bullets@cd62b56feb"]
evidence:
  - test: tests/test_bootstrap.py::test_a_wrapped_question_is_not_truncated
  - test: tests/test_lifecycle_repairs.py::test_a_wrapped_task_keeps_its_continuation
reviewed: 2026-10-14
```

Markdown authors wrap long bullets. A parser that matches `^[-*] (.*)$` keeps the
first physical line and silently discards the rest, so an item reads as a shorter,
different item - never as an error. This has now been hit twice in this kernel, in
two unrelated parsers: `## Uncertain` questions were truncated at their first line
during M5, and `tasks.md` entries lose any `REQ-` id written on a continuation line,
which makes `trace.requirement_task_coverage` block with a page of errors that are
all wrong. Both `bootstrap.py#_bullets` and `Change.tasks()` now join indented
continuation lines before matching.

The second occurrence is the reason this is written down. The first was found,
fixed, and never recorded, so nothing stopped the same line-based match being
written again three days later in a different file.

### PIT-single-source-validation - Gates and permanent-store checks must share one validator

```claim
kind:     pitfall
status:   asserted
truth-source: code
anchors:  ["src/forge/validate.py#find_placeholders"]
evidence:
  - test: tests/test_lifecycle.py::test_archive_refuses_bare_placeholder_even_with_force
reviewed: 2026-11-24
```

When `spec:post` checks only `[NEEDS CLARIFICATION` while `store.placeholder`
enforces `_PLACEHOLDERS`, a change can pass verification and fold `{token}` into
`docs/system/specs/**`, breaking every subsequent `forge check` and archive.
Gates and pre-write fold checks must call `find_placeholders` rather than
duplicating patterns.

### PIT-build-before-parallel-verify - Compiled builds must finish before parallel test fan-out

```claim
kind:     pitfall
status:   asserted
truth-source: code
anchors:  ["src/forge/verify.py#verify"]
evidence:
  - test: tests/test_lifecycle.py::test_verify_finishes_build_before_starting_tests
reviewed: 2026-11-24
```

On compiled toolchains (`dotnet`, `cargo`, `gradle`), `commands.test` triggers an
incremental build into `obj/` or `target/`. Running `commands.build` concurrently
with `commands.test` races on intermediate assemblies (`CS2012`), so `build`
must finish before parallel verification fan-out begins.

### PIT-precommit-must-not-run-tests - Git pre-commit hooks must stay AST-only and non-interactive

```claim
kind:     pitfall
status:   asserted
truth-source: code
anchors:  ["src/forge/hooks.py#hook_body"]
evidence:
  - test: tests/test_hooks.py::test_precommit_hook_never_runs_tests_or_prompts
reviewed: 2026-11-24
```

Invoking test suites or interactive `input()` prompts inside `pre-commit` hangs
automated agents on TTYs and blocks iterative commits for minutes. Commit hooks
must stay AST/store-only, leaving full test suites to `forge verify` at merge
time or `pre-push` on `main`.

## Uncertain

- Are there pitfalls from using the harness, as opposed to from building it?
  Every candidate here was earned while writing the tool, which is not the
  same population as using it.

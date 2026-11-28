"""Tests for post-implementation functional evidence and living guide publishing."""

from __future__ import annotations

import json

import pytest

from forge import change, schema, walkthrough
from forge.cli import main

MANY_SCENARIOS = """\
# Export Capability

## Purpose

Allow operators to export account ledgers and receipts in requested formats.

## ADDED Requirements

### Requirement: REQ-export-1 - Operator exports ledger as CSV
The system SHALL generate a UTF-8 CSV download for the selected ledger range.

#### Scenario: Standard CSV export completes
- **WHEN** an operator triggers export for valid ledger rows
- **THEN** a non-empty CSV file is written

#### Scenario: Empty range returns clear validation error
- **WHEN** an operator triggers export with no rows in range
- **THEN** the request is rejected with `empty_export`

#### Scenario: Optional metadata header row is included
- **WHEN** the operator requests metadata columns
- **THEN** header metadata appears above rows

### Requirement: REQ-export-2 - Operator previews export before download
The system SHALL show a preview table of the first rows before exporting.

#### Scenario: Preview shows summary row counts
- **WHEN** preview opens on a valid dataset
- **THEN** row count and totals match the ledger

#### Scenario: Preview denies unauthorized role
- **WHEN** a guest tries to preview ledger exports
- **THEN** access is refused with `forbidden`
"""

TWO_SCENARIOS = """\
# Search Filter

## Purpose

Filter records quickly by keyword and status.

## ADDED Requirements

### Requirement: REQ-search-1 - Keyword filter narrows rows
The system SHALL return only items whose title matches the query.

#### Scenario: Matching query filters list
- **WHEN** the user searches "invoice"
- **THEN** only matching rows stay visible

#### Scenario: Clearing search restores full list
- **WHEN** the query is cleared
- **THEN** all rows display again
"""


@pytest.fixture
def project(repo):
    repo.write("pyproject.toml", "[project]\nname = \"demo\"\n[project.scripts]\ndemo = \"demo:main\"\n")
    repo.write("src/demo.py", "def main():\n    return 0\n")
    main(["init", "--repo", str(repo.root)])
    repo.commit("init repo")
    return repo


def test_detect_surface_web_hybrid_api_cli_library(repo):
    assert walkthrough.detect_surface(repo.root)["surface"] == "library"

    repo.write("pyproject.toml", "[project]\nname = \"cli\"\n[project.scripts]\nmycli = \"a:b\"\n")
    cli_info = walkthrough.detect_surface(repo.root)
    assert cli_info["surface"] == "cli"
    assert "terminal-transcript" in cli_info["capture_methods"]

    repo.write("pyproject.toml", "[project]\nname = \"api\"\ndependencies = [\"fastapi\"]\n")
    assert walkthrough.detect_surface(repo.root)["surface"] == "api"

    repo.write("package.json", json.dumps({"dependencies": {"react": "^19.0.0"}, "devDependencies": {"@playwright/test": "^1.0.0"}}))
    repo.write("playwright.config.ts", "export default {};\n")
    hybrid_info = walkthrough.detect_surface(repo.root)
    assert hybrid_info["surface"] == "hybrid"
    assert "screenshot" in hybrid_info["capture_methods"]

    (repo.root / "pyproject.toml").unlink()
    assert walkthrough.detect_surface(repo.root)["surface"] == "web"


def test_plan_evidence_prioritizes_and_recommends_mode(project):
    item = change.new_change(project.root, "export-ledger", track="C")
    spec_file = item.root / "spec/exports/spec.md"
    spec_file.parent.mkdir(parents=True, exist_ok=True)
    spec_file.write_text(MANY_SCENARIOS, encoding="utf-8")

    plan = walkthrough.plan_evidence(project.root, item)
    assert plan["counts"] == {"total": 5, "p0": 2, "p1": 2, "p2": 1}
    assert plan["recommended_mode"] == "critical"
    assert plan["guide_target"] == "docs/guides/exports.md"

    # Small feature (<= 4 cases) recommends full capture.
    item2 = change.new_change(project.root, "search-filter", track="B")
    spec2 = item2.root / "spec/search/spec.md"
    spec2.parent.mkdir(parents=True, exist_ok=True)
    spec2.write_text(TWO_SCENARIOS, encoding="utf-8")
    plan2 = walkthrough.plan_evidence(project.root, item2)
    assert plan2["counts"]["total"] == 2
    assert plan2["recommended_mode"] == "full"


def test_plan_evidence_falls_back_to_tasks_when_no_spec(project):
    item = change.new_change(project.root, "task-only", track="B")
    item.meta["skip_spec"] = "refactor only"
    item.write_meta()
    (item.root / "tasks.md").write_text(
        "- [x] Print structured summary table (REQ-summary-1)\n"
        "- [x] chore: tidy imports\n",
        encoding="utf-8",
    )

    plan = walkthrough.plan_evidence(project.root, item)
    assert plan["counts"] == {"total": 1, "p0": 1, "p1": 0, "p2": 0}
    assert plan["cases"][0]["requirement"] == "REQ-summary-1"


def test_cli_evidence_init_skip_and_critical_and_check_errors(project, capsys):
    project.write("package.json", json.dumps({"dependencies": {"vue": "^3.5.0"}}))
    item = change.new_change(project.root, "export-ledger", track="B")
    spec_file = item.root / "spec/exports/spec.md"
    spec_file.parent.mkdir(parents=True, exist_ok=True)
    spec_file.write_text(MANY_SCENARIOS, encoding="utf-8")

    # skip without --reason is refused
    capsys.readouterr()
    assert main(["evidence", "init", "--change", "1", "--mode", "skip",
                 "--repo", str(project.root)]) == 2
    assert "requires a non-empty --reason" in capsys.readouterr().err

    # skip with --reason records skip_evidence and passes check
    assert main(["evidence", "init", "--change", "1", "--mode", "skip",
                 "--reason", "internal helper only", "--repo", str(project.root)]) == 0
    assert main(["evidence", "check", "--change", "1", "--repo", str(project.root)]) == 0

    # init --mode critical creates template for P0 cases only (2/5: CASE-01, CASE-04) and clears skip_evidence
    assert main(["evidence", "init", "--change", "1", "--mode", "critical",
                 "--repo", str(project.root)]) == 0
    wt = item.root / walkthrough.WALKTHROUGH_FILE
    text = wt.read_text(encoding="utf-8")
    assert "CASE-01" in text and "CASE-04" in text
    assert "CASE-02" not in text and "CASE-05" not in text

    # Refuses overwrite without --force
    assert main(["evidence", "init", "--change", "1", "--mode", "full",
                 "--repo", str(project.root)]) == 2

    # Unfilled template fails check (template_unfilled, missing_asset, placeholder)
    capsys.readouterr()
    assert main(["evidence", "check", "--change", "1", "--repo", str(project.root), "--json"]) == 1
    payload = json.loads(capsys.readouterr().out)
    codes = {i["code"] for i in payload["issues"]}
    assert "evidence.template_unfilled" in codes
    assert "evidence.missing_asset" in codes
    assert "evidence.placeholder" in codes


def test_evidence_publish_copies_assets_and_builds_guide_and_index(project, capsys):
    project.write("package.json", json.dumps({"dependencies": {"react": "^19.0.0"}}))
    item = change.new_change(project.root, "search-filter", track="B")
    spec2 = item.root / "spec/search/spec.md"
    spec2.parent.mkdir(parents=True, exist_ok=True)
    spec2.write_text(TWO_SCENARIOS, encoding="utf-8")

    assert main(["evidence", "init", "--change", "1", "--mode", "full",
                 "--repo", str(project.root)]) == 0

    # Save real non-empty screenshot asset and replace template content
    shot = item.root / "evidence/assets/case-01.png"
    shot.write_bytes(b"\x89PNG\r\n\x1a\nfake-png-bytes")
    wt = item.root / walkthrough.WALKTHROUGH_FILE
    wt.write_text(
        "# Functional Evidence - Search Filter\n\n"
        "## Captured Walkthrough\n\n"
        "### CASE-01 - Matching query filters list\n\n"
        "- **Captured Proof:**\n"
        "  ![CASE-01 screenshot](assets/case-01.png)\n"
        "- **Result:** PASS\n",
        encoding="utf-8",
        newline="\n",
    )

    assert main(["evidence", "check", "--change", "1", "--repo", str(project.root)]) == 0
    capsys.readouterr()
    assert main(["evidence", "publish", "--change", "1", "--repo", str(project.root), "--json"]) == 0
    pub = json.loads(capsys.readouterr().out)
    assert pub["guide"] == "docs/guides/search.md"
    assert pub["index"] == "docs/guides/README.md"
    assert "docs/guides/assets/search/case-01.png" in pub["assets_copied"]

    guide_text = (project.root / "docs/guides/search.md").read_text(encoding="utf-8")
    assert "assets/search/case-01.png" in guide_text
    assert "REQ-search-1" in guide_text
    index_text = (project.root / "docs/guides/README.md").read_text(encoding="utf-8")
    assert "(search.md)" in index_text


def test_evidence_artifact_in_schema_is_conditional(project):
    item = change.new_change(project.root, "search-filter", track="B")
    loaded = schema.load_schema(project.root, "feature")
    st = {s.id: s for s in item.state(loaded)}
    assert st["evidence"].state == change.BLOCKED
    assert st["evidence"].waiting_on == ["tasks"]

    (item.root / "tasks.md").write_text("- [x] Done (REQ-x-1)\n", encoding="utf-8")
    st2 = {s.id: s for s in item.state(loaded)}
    assert st2["evidence"].state == change.MISSING

    walkthrough.init_evidence(project.root, item, mode="skip", reason="CLI dry check only")
    reloaded = change.find_change(project.root, "1")
    st3 = {s.id: s for s in reloaded.state(loaded)}
    assert st3["evidence"].state == change.SKIPPED

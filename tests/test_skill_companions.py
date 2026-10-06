"""A skill is a directory, not a file: companion files travel with SKILL.md.

Before this, `forge init`, `forge skill export` and the wheel each shipped only
`SKILL.md`, so a skill whose procedure leaned on reference material arrived in
a project with every link dangling.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from forge import hosts, scaffold, skills
from forge.cli import Issue, known_subcommands

_SKILL = """---
name: {name}
phase: implement
description: a test skill
requires-kernel: []
reads: from-dag
writes: []
---

# {name}

## Announce

> Running `{name}`.

{body}
"""


def _packaged(tmp_path: Path, monkeypatch) -> Path:
    root = tmp_path / "packaged"
    one = root / "withrefs"
    (one / "references" / "components").mkdir(parents=True)
    (one / "scripts").mkdir()
    one.joinpath("SKILL.md").write_text(
        _SKILL.format(name="withrefs", body="Read `references/guide.md`."),
        encoding="utf-8")
    one.joinpath("references/guide.md").write_text("# guide\n", encoding="utf-8")
    one.joinpath("references/components/button.md").write_text("# button\n",
                                                                encoding="utf-8")
    one.joinpath("scripts/probe.mjs").write_text("console.log(1)\n", encoding="utf-8")
    (one / "__pycache__").mkdir()
    one.joinpath("__pycache__/x.pyc").write_bytes(b"\0")
    bare = root / "bare"
    bare.mkdir()
    bare.joinpath("SKILL.md").write_text(_SKILL.format(name="bare", body=""),
                                         encoding="utf-8")
    monkeypatch.setattr(skills, "PACKAGED_SKILLS", root)
    return root


COMPANIONS = ["references/components/button.md", "references/guide.md",
              "scripts/probe.mjs"]


# @covers REQ-skill-companions-ship
def test_companion_files_lists_everything_but_skill_md(tmp_path, monkeypatch):
    root = _packaged(tmp_path, monkeypatch)
    assert [p.as_posix() for p in skills.companion_files(root / "withrefs")] \
        == COMPANIONS
    assert skills.companion_files(root / "bare") == []


# @covers REQ-skill-companions-ship
def test_init_copies_companion_files(tmp_path, monkeypatch):
    _packaged(tmp_path, monkeypatch)
    files = scaffold.init_files()
    for rel in COMPANIONS:
        assert f"{skills.SKILLS_DIR}/withrefs/{rel}" in files
    assert not any("__pycache__" in k for k in files)
    assert [k for k in files if k.startswith(f"{skills.SKILLS_DIR}/bare/")] \
        == [f"{skills.SKILLS_DIR}/bare/SKILL.md"]


# @covers REQ-skill-companions-ship
def test_init_never_overwrites_an_edited_companion(repo, tmp_path, monkeypatch):
    _packaged(tmp_path, monkeypatch)
    edited = f"{skills.SKILLS_DIR}/withrefs/references/guide.md"
    repo.write(edited, "# ours\n")
    created, skipped = scaffold.scaffold(repo.root)
    assert edited in skipped
    assert (repo.root / edited).read_text(encoding="utf-8") == "# ours\n"
    assert f"{skills.SKILLS_DIR}/withrefs/scripts/probe.mjs" in created


# @covers REQ-skill-companions-ship
@pytest.mark.parametrize("host,target", [("antigravity", ".agent/skills"),
                                         ("claude", ".claude/skills")])
def test_a_copy_host_exports_companions(repo, tmp_path, monkeypatch, host, target):
    root = _packaged(tmp_path, monkeypatch)
    outcome, written = hosts.export(repo.root, host)
    assert outcome == "copied"
    for rel in COMPANIONS:
        path = f"{target}/withrefs/{rel}"
        assert path in written
        assert (repo.root / path).read_text(encoding="utf-8") == \
            (root / "withrefs" / rel).read_text(encoding="utf-8")
    assert not any("__pycache__" in p for p in written)
    assert not any(p.startswith(f"{target}/bare/") and not p.endswith("SKILL.md")
                   for p in written)

    again, rewritten = hosts.export(repo.root, host)
    assert not any("/withrefs/" in p and not p.endswith("SKILL.md")
                   for p in rewritten)


# @covers REQ-skill-reference-resolves
def test_a_dangling_reference_is_reported(repo):
    repo.write(".forge/skills/demo/SKILL.md", _SKILL.format(
        name="demo", body="See `references/gone.md` and `references/here.md`."))
    repo.write(".forge/skills/demo/references/here.md", "# here\n")
    found = [i for i in skills.check_skills(repo.root, Issue, known_subcommands())
             if i.code == "skill.missing_reference"]
    assert len(found) == 1
    assert "references/gone.md" in found[0].message


# @covers REQ-skill-reference-resolves
def test_resolving_references_are_clean(repo):
    repo.write(".forge/skills/demo/SKILL.md", _SKILL.format(
        name="demo", body="Run `scripts/probe.mjs` after `references/a/b.md`."))
    repo.write(".forge/skills/demo/scripts/probe.mjs", "1\n")
    repo.write(".forge/skills/demo/references/a/b.md", "x\n")
    found = [i for i in skills.check_skills(repo.root, Issue, known_subcommands())
             if i.code == "skill.missing_reference"]
    assert found == []


# @covers REQ-skill-reference-resolves
def test_missing_reference_is_a_known_signal():
    assert "skill.missing_reference" in skills.KERNEL_SIGNALS


# @covers REQ-skill-companions-ship
def test_package_data_ships_companion_files():
    text = Path("pyproject.toml").read_text(encoding="utf-8")
    assert '"_skills/**/*"' in text

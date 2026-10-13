"""Pre-execution command safety and task file-scope guard checks."""

from __future__ import annotations

import json
from datetime import date

import pytest

from forge import change
from forge.cli import main

TODAY = date(2026, 9, 11)


# @covers REQ-guard-command-safety
@pytest.mark.parametrize(
    "cmd",
    [
        "git reset --hard HEAD~1",
        "git push origin main --force",
        "git push -f origin main",
        "git clean -fd",
        "rm -rf /",
        "rm -rf .",
        "rm -rf docs/system",
    ],
)
def test_destructive_git_and_fs_commands_are_blocked(repo, capsys, cmd):
    main(["init", "--repo", str(repo.root)])
    capsys.readouterr()
    code = main(["guard", "--repo", str(repo.root), "--cmd", cmd, "--json"])
    assert code == 1
    out = json.loads(capsys.readouterr().out)
    assert out["ok"] is False
    assert any(i["code"] == "guard.destructive_command" for i in out["issues"])


# @covers REQ-guard-command-safety
@pytest.mark.parametrize(
    "cmd",
    [
        "pytest -q tests/test_cli.py",
        "git status",
        "git push --force-with-lease origin feature",
        "git checkout -b change/0001-test",
    ],
)
def test_safe_commands_pass(repo, capsys, cmd):
    main(["init", "--repo", str(repo.root)])
    capsys.readouterr()
    code = main(["guard", "--repo", str(repo.root), "--cmd", cmd, "--json"])
    assert code == 0
    out = json.loads(capsys.readouterr().out)
    assert out["ok"] is True
    assert out["issues"] == []


# @covers REQ-guard-command-safety
def test_commit_on_protected_main_branch_is_blocked(repo, capsys):
    main(["init", "--repo", str(repo.root)])
    capsys.readouterr()
    cfg = repo.root / ".forge/config.yaml"
    cfg.write_text(
        cfg.read_text(encoding="utf-8") + "\nprotect_main: true\n",
        encoding="utf-8",
    )
    repo.commit("enable protect_main")

    code = main(["guard", "--repo", str(repo.root), "--cmd", 'git commit -m "direct"', "--json"])
    assert code == 1
    out = json.loads(capsys.readouterr().out)
    assert any(i["code"] == "guard.protected_branch" for i in out["issues"])

    # Switching to a change branch permits git commit
    main(["change", "new", "guarded feature", "--track", "B", "--branch", "--repo", str(repo.root)])
    capsys.readouterr()
    code_branch = main(["guard", "--repo", str(repo.root), "--cmd", 'git commit -m "ok"', "--json"])
    assert code_branch == 0


# @covers REQ-guard-task-scope
def test_path_guard_enforces_declared_task_scopes(repo, capsys):
    main(["init", "--repo", str(repo.root)])
    capsys.readouterr()
    item = change.new_change(repo.root, "scoped tasks", track="B", today=TODAY)
    (item.root / "tasks.md").write_text(
        "# Tasks\n\n"
        "- [x] Task 1: Done work [scope: src/forge/old.py]\n"
        "- [ ] Task 2: Active work [scope: src/forge/guard.py, tests/test_guard.py]\n",
        encoding="utf-8",
    )

    # Allowed path inside declared active scope
    code_ok = main([
        "guard", "--repo", str(repo.root), "--change", "1",
        "--paths", "src/forge/guard.py", f"{item.relative}/tasks.md", "--json",
    ])
    assert code_ok == 0
    out_ok = json.loads(capsys.readouterr().out)
    assert out_ok["ok"] is True

    # Out-of-scope path (including completed task's scope and unrelated file)
    code_fail = main([
        "guard", "--repo", str(repo.root), "--change", "1",
        "--paths", "src/forge/store.py", "--json",
    ])
    assert code_fail == 1
    out_fail = json.loads(capsys.readouterr().out)
    assert out_fail["ok"] is False
    assert any(
        i["code"] == "guard.out_of_scope" and i["path"] == "src/forge/store.py"
        for i in out_fail["issues"]
    )

"""Pre-execution command safety and task file-scope guard checks.

Inspired by pre-execution guardrails (`@deepseek-harness/guard`) and designed
for Forge's deterministic kernel:
1. `check_command`: catches destructive git/filesystem commands (`git reset --hard`,
   `git push --force`, `git clean -fd`, root/store `rm -rf`) and direct `git commit`
   on protected `main`/`master` before a shell command runs.
2. `check_paths`: parses `[scope: <glob>, ...]` annotations from active
   (unchecked) tasks in `tasks.md` and rejects edits to paths outside the
   declared scope.
"""

from __future__ import annotations

import fnmatch
import re
from pathlib import Path

from . import gitio
from .change import Change
from .config import load_config

__all__ = ["check_command", "check_paths", "parse_task_scopes"]

_SCOPE_RE = re.compile(r"\[scope:\s*([^\]]+)\]", re.I)

_DESTRUCTIVE_PATTERNS: tuple[tuple[re.Pattern[str], str, str], ...] = (
    (
        re.compile(r"\bgit\s+reset\s+--hard\b"),
        "git reset --hard discards uncommitted work irrecoverably",
        "stash or commit work on a branch instead of resetting --hard",
    ),
    (
        re.compile(r"\bgit\s+push\b(?=.*(?:\s--force(?!-with-lease|-if-includes)\b|\s-[a-zA-Z]*f\b))"),
        "force-pushing rewrites remote history",
        "push to a feature branch without --force, or use --force-with-lease when explicitly approved",
    ),
    (
        re.compile(r"\bgit\s+clean\b(?=.*(?:\s-[a-zA-Z]*f|\s--force\b))"),
        "git clean -f permanently deletes untracked files",
        "remove specific temporary files explicitly rather than running git clean -f",
    ),
    (
        re.compile(
            r"\brm\s+(?:-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*)"
            r"\s+(?:/|\*|\.(?:\s|$)|\.git\b|\.forge\b|docs/system\b|src\b)"
        ),
        "recursive forced deletion targets repository root, git metadata, or claim store",
        "narrow the path to a specific scratch or build file",
    ),
)

_GIT_COMMIT_RE = re.compile(r"\bgit\s+commit\b")


def check_command(repo: Path, cmd: str, issue) -> list:
    """Validate a shell command string before execution."""
    issues = []
    text = cmd.strip()
    if not text:
        return issues

    for pattern, reason, fix in _DESTRUCTIVE_PATTERNS:
        if pattern.search(text):
            issues.append(issue(
                "ERROR",
                "guard.destructive_command",
                ".",
                f"blocked destructive command `{text}`: {reason}",
                fix,
            ))

    if _GIT_COMMIT_RE.search(text) and gitio.is_repo(repo):
        cfg = load_config(repo)
        branch = gitio.current_branch(repo)
        is_wt = gitio.is_worktree(repo)
        if cfg.protect_main and branch in ("main", "master") and not is_wt:
            issues.append(issue(
                "ERROR",
                "guard.protected_branch",
                ".forge/config.yaml",
                f"direct `git commit` on protected branch `{branch}` is blocked when `protect_main: true`",
                "switch to a change branch (`forge change new <title> --branch` or `git checkout -b change/<slug>`) before committing",
            ))

    return issues


def parse_task_scopes(item: Change) -> list[str]:
    """Extract `[scope: <glob>, ...]` patterns from unchecked tasks in `tasks.md`."""
    scopes: list[str] = []
    for done, text in item.tasks():
        if done:
            continue
        for match in _SCOPE_RE.finditer(text):
            for raw in match.group(1).split(","):
                cleaned = raw.strip().strip("`'\"").replace("\\", "/")
                if cleaned and cleaned not in scopes:
                    scopes.append(cleaned)
    return scopes


def _matches_scope(path: str, pattern: str) -> bool:
    if fnmatch.fnmatch(path, pattern):
        return True
    prefix = pattern.rstrip("*").rstrip("/")
    return bool(prefix) and (path == prefix or path.startswith(f"{prefix}/"))


def _normalize_path(repo: Path, raw: str) -> str:
    candidate = Path(raw)
    if candidate.is_absolute():
        try:
            return candidate.resolve().relative_to(repo.resolve()).as_posix()
        except ValueError:
            return candidate.as_posix()
    return raw.replace("\\", "/").lstrip("./")


def check_paths(repo: Path, paths: list[str], item: Change | None, issue) -> list:
    """Check whether target file paths fall within the active tasks' declared scopes."""
    if item is None:
        return []
    scopes = parse_task_scopes(item)
    if not scopes:
        return []

    issues = []
    change_prefix = f"{item.relative}/"
    for raw in paths:
        rel = _normalize_path(repo, raw)
        if not rel or rel == item.relative or rel.startswith(change_prefix):
            continue
        if not any(_matches_scope(rel, pat) for pat in scopes):
            issues.append(issue(
                "ERROR",
                "guard.out_of_scope",
                rel,
                f"`{rel}` is outside the active task scope declared in {item.relative}/tasks.md "
                f"({', '.join(scopes)})",
                f"restrict edits to {', '.join(scopes)} or update the `[scope: ...]` declaration in {item.relative}/tasks.md",
            ))
    return issues

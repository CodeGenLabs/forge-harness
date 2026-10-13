"""Smart test runner for forge-harness.

Runs only tests relevant to modified / added files, or all tests if none
are specifically identified or --all is passed.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

_ID_RE = re.compile(
    r"\b((?:ARC|CMP|CON|INV|PIT|API|DAT|FLW|CST|STR)-(?:\d+|[a-z0-9][a-z0-9-]*)|REQ-[A-Za-z0-9_-]+)\b"
)


def _load_derived_json(repo_root: Path, name: str) -> dict:
    path = repo_root / "docs" / "system" / "derived" / name
    if not path.is_file():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8", errors="replace"))
        return payload.get("data") or {}
    except Exception:
        return {}


def get_changed_files(repo_root: Path) -> set[str]:
    """Get list of files modified/added in working tree, branch vs main, or HEAD commit."""
    changed: set[str] = set()
    # 1. Uncommitted changes (working tree & staged)
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=repo_root, capture_output=True, text=True, check=True,
        )
        for line in res.stdout.splitlines():
            if len(line) >= 4:
                path = line[3:].split(" -> ")[-1].strip()
                changed.add(path.replace("\\", "/"))
    except Exception:
        pass

    # 2. Branch changes vs main
    try:
        res = subprocess.run(
            ["git", "diff", "--name-only", "main...HEAD"],
            cwd=repo_root, capture_output=True, text=True, check=True,
        )
        for line in res.stdout.splitlines():
            if line.strip():
                changed.add(line.strip().replace("\\", "/"))
    except Exception:
        pass

    # 3. Fallback to HEAD commit when running on main with only derived/verification artifacts dirty
    meaningful = {
        p for p in changed
        if not p.startswith("docs/system/derived/") and not p.endswith("/verification.json")
    }
    if not meaningful:
        try:
            res = subprocess.run(
                ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"],
                cwd=repo_root, capture_output=True, text=True, check=True,
            )
            for line in res.stdout.splitlines():
                if line.strip():
                    changed.add(line.strip().replace("\\", "/"))
        except Exception:
            pass

    return changed


def _add_test_ref(repo_root: Path, targets: set[str], ref: str) -> None:
    cleaned = ref.strip()
    if cleaned.startswith("test:"):
        cleaned = cleaned[len("test:"):].strip()
    file_part = cleaned.split("::", 1)[0].strip()
    if file_part.startswith("tests/") and file_part.endswith(".py"):
        if (repo_root / file_part).is_file():
            targets.add(file_part)


def _match_stem_tests(repo_root: Path, stem: str) -> set[str]:
    matched: set[str] = set()
    tests_dir = repo_root / "tests"
    for candidate in (f"tests/test_{stem}.py", f"tests/test_{stem}s.py"):
        if (repo_root / candidate).is_file():
            matched.add(candidate)
    if tests_dir.is_dir():
        for p in sorted(tests_dir.glob(f"test_{stem}_*.py")):
            if p.is_file():
                matched.add(f"tests/{p.name}")
    return matched


def resolve_test_targets(repo_root: Path, changed_files: set[str]) -> list[str]:
    """Map changed files to relevant test files under tests/ using derived graphs and naming."""
    targets: set[str] = set()
    deps_data = _load_derived_json(repo_root, "deps.json")
    reverse_deps: dict[str, list[str]] = deps_data.get("reverse") or {}
    tests_data = _load_derived_json(repo_root, "tests.json")
    covers_index: dict[str, list[str]] = tests_data.get("covers_index") or {}
    trace_data = _load_derived_json(repo_root, "trace.json")
    trace_ids: dict[str, dict] = trace_data.get("ids") or {}

    for rel in changed_files:
        # 1. If a test file itself changed
        if rel.startswith("tests/") and rel.endswith(".py"):
            if (repo_root / rel).is_file():
                targets.add(rel)
            continue

        # 2. If a skill or companion file changed
        if "skills" in rel:
            for t in ("tests/test_skills.py", "tests/test_skill_companions.py"):
                if (repo_root / t).is_file():
                    targets.add(t)

        # 3. If a Python source file changed, resolve its dedicated tests + reverse dependency tests
        if rel.startswith("src/forge/") and rel.endswith(".py"):
            stem = Path(rel).stem
            stem_matches = _match_stem_tests(repo_root, stem)
            targets.update(stem_matches)
            # If no stem-matched test file exists, or via reverse import graph in deps.json:
            for importer in reverse_deps.get(rel, []):
                if importer.startswith("tests/") and importer.endswith(".py"):
                    if not stem_matches and (repo_root / importer).is_file():
                        targets.add(importer)

        # 4. If a spec delta or claim file changed, resolve @covers and evidence tests
        if rel.endswith(".md") and (
            rel.startswith("docs/system/") or rel.startswith("changes/")
        ):
            full_path = repo_root / rel
            if full_path.is_file():
                try:
                    text = full_path.read_text(encoding="utf-8", errors="replace")
                    for ident in set(_ID_RE.findall(text)):
                        for ref in covers_index.get(ident, []):
                            _add_test_ref(repo_root, targets, ref)
                        entry = trace_ids.get(ident) or {}
                        for ev in entry.get("evidence") or []:
                            _add_test_ref(repo_root, targets, ev)
                        for tst in entry.get("tests") or []:
                            _add_test_ref(repo_root, targets, tst)
                except Exception:
                    pass

    # 5. Any claim in trace.json whose anchor_paths intersect changed_files adds its evidence tests
    for entry in trace_ids.values():
        anchor_paths = set(entry.get("anchor_paths") or [])
        if anchor_paths & changed_files:
            for ev in entry.get("evidence") or []:
                _add_test_ref(repo_root, targets, ev)
            for tst in entry.get("tests") or []:
                _add_test_ref(repo_root, targets, tst)

    return sorted(targets)


def _filter_pytest_args(args: list[str]) -> list[str]:
    import importlib.util

    has_xdist = importlib.util.find_spec("xdist") is not None
    out: list[str] = []
    skip_next = False
    for idx, arg in enumerate(args):
        if skip_next:
            skip_next = False
            continue
        if arg == "--all":
            continue
        if not has_xdist:
            if arg in ("-n", "--numprocesses"):
                if idx + 1 < len(args):
                    skip_next = True
                continue
            if arg.startswith("-n=") or arg.startswith("--numprocesses="):
                continue
        out.append(arg)
    return out


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    args = sys.argv[1:]

    force_all = "--all" in args
    filtered_args = _filter_pytest_args(args)

    if force_all:
        targets = []
    else:
        changed = get_changed_files(repo_root)
        targets = resolve_test_targets(repo_root, changed)

    pytest_cmd = [sys.executable, "-m", "pytest", "-q"] + filtered_args

    if targets:
        print(f"Targeted tests ({len(targets)} files): {', '.join(targets)}")
        pytest_cmd.extend(targets)
    else:
        print("No specific target tests detected or running --all; running full test suite.")

    res = subprocess.run(pytest_cmd, cwd=repo_root)
    return res.returncode


if __name__ == "__main__":
    sys.exit(main())

"""Smart test runner for forge-harness.

Runs only tests relevant to modified / added files, or all tests if none
are specifically identified or --all is passed.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def get_changed_files(repo_root: Path) -> set[str]:
    """Get list of files modified/added in working tree or current branch vs main."""
    changed = set()
    # 1. Uncommitted changes (working tree & staged)
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=repo_root, capture_output=True, text=True, check=True,
        )
        for line in res.stdout.splitlines():
            if len(line) >= 4:
                # Format: XY <path> or XY <path> -> <path>
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

    return changed


def resolve_test_targets(repo_root: Path, changed_files: set[str]) -> list[str]:
    """Map changed files to relevant test files under tests/."""
    targets = set()
    tests_dir = repo_root / "tests"

    for rel in changed_files:
        # If a test file itself changed
        if rel.startswith("tests/") and rel.endswith(".py"):
            if (repo_root / rel).is_file():
                targets.add(rel)
            continue

        # If a skill or companion file changed
        if "skills" in rel:
            for t in ["tests/test_skills.py", "tests/test_skill_companions.py"]:
                if (repo_root / t).is_file():
                    targets.add(t)

        # If src/forge/<name>.py changed
        if rel.startswith("src/forge/") and rel.endswith(".py"):
            stem = Path(rel).stem
            candidate = f"tests/test_{stem}.py"
            if (repo_root / candidate).is_file():
                targets.add(candidate)
            # Some modules have plural/alias mappings
            plural_candidate = f"tests/test_{stem}s.py"
            if (repo_root / plural_candidate).is_file():
                targets.add(plural_candidate)

    return sorted(targets)


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    args = sys.argv[1:]

    force_all = "--all" in args
    filtered_args = [a for a in args if a != "--all"]

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

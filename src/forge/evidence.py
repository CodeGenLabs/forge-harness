"""Evidence test execution for forge claims.

Evaluates test evidence declared on claims against the current repository state
to determine whether an invariant or pitfall still holds when code moves.
"""

from __future__ import annotations

import re
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING

import yaml

if TYPE_CHECKING:
    from .store import Claim

__all__ = [
    "EvidenceResult",
    "parse_test_target",
    "build_test_command",
    "get_test_command",
    "run_evidence_test",
    "evaluate_evidence",
    "evaluate_claim_evidence",
]

_ANSI_RE = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
_INTERESTING_RE = re.compile(
    r"(?i)\b(fail(ed|ure|s)?|error|assert\w*|expected|not ok|panic|"
    r"traceback|exception)\b|[✕×✗]|^\s*(FAIL|ERR)"
)
_NOISE_RE = re.compile(r"\(\d+ tests?\)\s*\d+m?s\s*$|^\s*[✓√?]\s|^\s*\d+\s*passed")


@dataclass
class EvidenceResult:
    """The result of executing one evidence test."""
    target: str
    status: str  # "pass" | "fail" | "unavailable" | "error"
    exit_code: int | None = None
    duration_s: float = 0.0
    cmd: str = ""
    failures: list[str] = field(default_factory=list)
    reason: str = ""

    def to_dict(self) -> dict:
        return {
            "target": self.target,
            "status": self.status,
            "exit_code": self.exit_code,
            "duration_s": round(self.duration_s, 3),
            "cmd": self.cmd,
            "failures": self.failures,
            "reason": self.reason,
        }


def parse_test_target(entry: str) -> str | None:
    """Extract a test target from an evidence string.

    Accepts 'test: path::name', 'test:path::name', and quoted variations.
    Returns None if entry is not a test reference.
    """
    cleaned = entry.strip()
    if not cleaned.lower().startswith("test:"):
        return None
    raw = cleaned[5:].strip().strip('"').strip("'")
    return raw if raw else None


def get_test_command(repo: Path) -> str | None:
    """Read `commands.test` from .forge/config.yaml."""
    target = repo / ".forge/config.yaml"
    if not target.is_file():
        return None
    try:
        raw = yaml.safe_load(target.read_text(encoding="utf-8")) or {}
    except (OSError, yaml.YAMLError):
        return None
    section = raw.get("commands") if isinstance(raw.get("commands"), dict) else {}
    cmd = section.get("test")
    if not cmd or str(cmd).strip().lower() in ("none", "n/a", "not applicable", "-"):
        return None
    return str(cmd).strip()


def build_test_command(base_cmd: str, target: str, repo: Path | None = None) -> str:
    """Construct a shell command that runs specifically *target*.

    Handles pytest, vitest, jest, `dotnet test`, and generic runners. *repo* is
    needed only by `dotnet test`, which runs a project rather than a file.
    """
    lower = base_cmd.lower()
    if _DOTNET_TEST_RE.search(base_cmd):
        return _dotnet_test_command(base_cmd, target, repo)
    if "vitest" in lower or "jest" in lower:
        if "::" in target:
            file_part, test_part = target.split("::", 1)
            return f'{base_cmd} {file_part} -t "{test_part}"'
        return f"{base_cmd} {target}"
    # Default (pytest, go test, etc.): append target directly
    return f"{base_cmd} {target}"


_DOTNET_TEST_RE = re.compile(r"\bdotnet\s+test\b", re.I)
# What selects *what* to test in the project's own line - replaced by the
# evidence target's project. `--solution X` / `--project X` (Microsoft.Testing
# .Platform) or a positional .sln/.slnx/.csproj path (VSTest).
_DOTNET_SELECTOR_RE = re.compile(
    r"""\s--(?:solution|project)\s+(?:"[^"]*"|\S+)|\s(?:"[^"]*\.(?:slnx?|csproj)"|\S+\.(?:slnx?|csproj))(?=\s|$)""",
    re.I,
)


def _dotnet_test_command(base_cmd: str, target: str, repo: Path | None) -> str:
    """`dotnet test` runs a project, not a file, and selects a test by filter.

    Appending `path/to/FooTests.cs::Name` to the project's own line - what the
    generic branch does - makes `dotnet test` fail on an unknown argument, so a
    passing test is reported as failing evidence. Instead: run the project that
    contains the file, and filter to the method. Microsoft.Testing.Platform
    (opted into with `--solution`/`--project`, or `test.runner` in global.json)
    takes `--filter-method`; VSTest takes `--filter FullyQualifiedName~`.
    """
    file_part, _, test_part = target.partition("::")
    mtp = bool(re.search(r"\s--(?:solution|project)\s", base_cmd)) or _global_json_uses_mtp(repo)
    rest = _DOTNET_SELECTOR_RE.sub("", " " + base_cmd).strip()
    # Whatever precedes `dotnet test` (an env prefix, a `cd`) is kept, and so are
    # the project's own flags after it (`-c Release`, `--no-build`, ...).
    before, args = _DOTNET_TEST_RE.split(rest, maxsplit=1)
    prefix = f"{before}dotnet test".strip()
    project = _nearest_project_dir(repo, file_part) if repo is not None else None
    project_part = f'"{project}"' if project else ""
    if mtp:
        cmd = f"{prefix} --project {project_part}" if project else prefix
        cmd += args
        if test_part:
            cmd += f' --filter-method "*.{test_part}"'
        return cmd
    cmd = f"{prefix} {project_part}".rstrip() + args
    if test_part:
        cmd += f' --filter "FullyQualifiedName~{test_part}"'
    return cmd


def _nearest_project_dir(repo: Path, file_part: str) -> str | None:
    """The directory of the nearest .csproj/.fsproj at or above the test file, repo-relative."""
    root = repo.resolve()
    here = (root / file_part).parent
    while True:
        if any(here.glob("*.csproj")) or any(here.glob("*.fsproj")):
            return here.relative_to(root).as_posix() or "."
        if here == root or root not in here.parents:
            return None
        here = here.parent


def _global_json_uses_mtp(repo: Path | None) -> bool:
    if repo is None:
        return False
    try:
        import json
        data = json.loads((repo / "global.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return False
    runner = (data.get("test") or {}).get("runner") if isinstance(data, dict) else None
    return isinstance(runner, str) and runner.lower() == "microsoft.testing.platform"


def _extract_failures(stdout: bytes | None, stderr: bytes | None) -> list[str]:
    text = "\n".join(
        _ANSI_RE.sub("", stream.decode("utf-8", "replace"))
        for stream in (stdout, stderr) if stream
    )
    lines = [ln.rstrip() for ln in text.splitlines() if ln.strip()]
    if not lines:
        return []
    named = [ln for ln in lines if _INTERESTING_RE.search(ln) and not _NOISE_RE.search(ln)]
    return named[:10] if named else lines[-5:]


def run_evidence_test(
    repo: Path,
    target: str,
    base_cmd: str | None = None,
    timeout: int = 30,
) -> EvidenceResult:
    """Execute a single test target and return structured EvidenceResult."""
    cmd_base = base_cmd if base_cmd is not None else get_test_command(repo)
    if not cmd_base:
        return EvidenceResult(
            target=target,
            status="unavailable",
            reason="no test command configured in .forge/config.yaml",
        )

    cmd = build_test_command(cmd_base, target, repo)
    start = time.perf_counter()
    try:
        completed = subprocess.run(
            cmd, cwd=repo, shell=True, capture_output=True, timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        duration = time.perf_counter() - start
        return EvidenceResult(
            target=target,
            status="unavailable",
            cmd=cmd,
            duration_s=duration,
            reason=f"timed out after {timeout}s",
        )
    except OSError as exc:
        duration = time.perf_counter() - start
        return EvidenceResult(
            target=target,
            status="error",
            cmd=cmd,
            duration_s=duration,
            reason=str(exc),
        )

    duration = time.perf_counter() - start
    if completed.returncode == 0:
        return EvidenceResult(
            target=target,
            status="pass",
            exit_code=0,
            duration_s=duration,
            cmd=cmd,
        )

    failures = _extract_failures(completed.stdout, completed.stderr)
    return EvidenceResult(
        target=target,
        status="fail",
        exit_code=completed.returncode,
        duration_s=duration,
        cmd=cmd,
        failures=failures,
    )


def evaluate_evidence(
    repo: Path,
    evidence_entries: list[str],
    base_cmd: str | None = None,
    timeout: int = 30,
) -> list[EvidenceResult]:
    """Find and run all test targets in an evidence string list."""
    results: list[EvidenceResult] = []
    for entry in evidence_entries:
        target = parse_test_target(entry)
        if target:
            results.append(run_evidence_test(repo, target, base_cmd=base_cmd, timeout=timeout))
    return results


def evaluate_claim_evidence(
    repo: Path,
    claim: Claim,
    base_cmd: str | None = None,
    timeout: int = 30,
) -> list[EvidenceResult]:
    """Find and run all test evidence entries declared on a claim."""
    return evaluate_evidence(repo, claim.evidence, base_cmd=base_cmd, timeout=timeout)

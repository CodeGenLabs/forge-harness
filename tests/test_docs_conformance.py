"""Mechanical conformance checks locking documentation and workspace sync to kernel code.

Prevents documentation drift issues (#3, #5, and phantom CLI/config references)
from recurring whenever CLI options, schemas, gates, or skills change.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import yaml

from forge import cli, gates, hosts, schema, skills, verify

REPO = Path(__file__).resolve().parent.parent

_DOC_GLOBS = (
    "README.md",
    "docs/en/**/*.md",
    "docs/vi/**/*.md",
    "docs/ja/**/*.md",
    "src/forge/_skills/**/SKILL.md",
)

_INLINE_CODE_RE = re.compile(r"`([^`\n]+)`")
_FENCE_RE = re.compile(r"```(?P<lang>[a-zA-Z0-9_-]*)\r?\n(?P<body>.*?)```", re.S)
_YAML_BLOCK_RE = re.compile(r"```ya?ml\r?\n(?P<body>.*?)```", re.S)
_CLI_COMMAND_RE = re.compile(
    r"(?<![A-Za-z0-9_./-])forge\s+([a-z][a-z-]*)(?:\s+([^\n|;&`]+))?"
)

_KNOWN_CONFIG_TOP_KEYS = frozenset({
    "version",
    "kernel_version",
    "kernel",
    "protect_main",
    "workflow",
    "commands",
    "derive",
    "budgets",
    "thresholds",
    "rules",
    "gates",
})

_BANNED_VERIFY_NAMES = (
    "tests_pass",
    "build_succeeds",
    "dag_complete",
    "touch_accounted",
    "no_unwaived_drift",
    "no_schema_violations",
)

# Planned future commands that exist only in roadmap sections (R1).
_ROADMAP_ONLY_COMMANDS = frozenset({"stats"})


def _doc_files() -> list[Path]:
    found: set[Path] = set()
    for pattern in _DOC_GLOBS:
        found.update(p for p in REPO.glob(pattern) if p.is_file())
    return sorted(found)


def _parser_spec(parser: argparse.ArgumentParser) -> dict:
    flags: set[str] = set()
    subcommands: dict[str, dict] = {}
    for action in parser._actions:
        flags.update(opt for opt in action.option_strings if opt.startswith("--"))
        if isinstance(action, argparse._SubParsersAction):
            for name, sub in action.choices.items():
                subcommands[name] = _parser_spec(sub)
    return {"flags": flags, "subcommands": subcommands}


def _extract_forge_snippets(text: str) -> list[str]:
    """Return shell/inline `forge ...` snippets from markdown docs."""
    snippets: list[str] = []
    for match in _INLINE_CODE_RE.finditer(text):
        snippet = match.group(1).strip()
        if snippet.startswith("forge "):
            snippets.append(snippet)
    for match in _FENCE_RE.finditer(text):
        lang = match.group("lang").lower()
        if lang not in ("", "bash", "sh", "zsh", "powershell", "pwsh", "console", "text"):
            continue
        for raw_line in match.group("body").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("$ "):
                line = line[2:].strip()
            if " # " in line:
                line = line.split(" # ", 1)[0].strip()
            if line.startswith("forge "):
                snippets.append(line)
    return snippets


def _tokenize_command(line: str) -> list[str]:
    # Strip bracketed optional/placeholder syntax so `--flag <x>` or `[--fast\|--sync]`
    # still yields its literal `--flag` tokens without requiring full shell parsing.
    cleaned = re.sub(r"<[^>]+>", " ", line)
    cleaned = cleaned.replace("\\|", " ").replace("[", " ").replace("]", " ").replace("|", " ")
    tokens: list[str] = []
    for raw in cleaned.split():
        token = raw.strip(",();:\"'")
        if token:
            tokens.append(token)
    return tokens


def test_docs_cli_commands_and_flags_exist():
    root_spec = _parser_spec(cli.build_parser())
    root_cmds = root_spec["subcommands"]
    offenders: list[str] = []

    for path in _doc_files():
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(REPO).as_posix()
        for snippet in _extract_forge_snippets(text):
            tokens = _tokenize_command(snippet)
            if len(tokens) < 2 or tokens[0] != "forge":
                continue
            cmd = tokens[1]
            if cmd.startswith("-") or "..." in cmd:
                continue
            if cmd in _ROADMAP_ONLY_COMMANDS and (
                path.name == "roadmap.md"
                or any(
                    line.strip().startswith("- [ ] **R1")
                    for line in text.splitlines()
                    if f"forge {cmd}" in line
                )
            ):
                continue
            if cmd not in root_cmds:
                offenders.append(f"{rel}: unknown subcommand `forge {cmd}` in {snippet!r}")
                continue
            node = root_cmds[cmd]
            idx = 2
            if idx < len(tokens) and not tokens[idx].startswith("-") and node["subcommands"]:
                sub = tokens[idx]
                if sub in node["subcommands"]:
                    node = node["subcommands"][sub]
                    idx += 1
                elif not any(ch in sub for ch in ".*/\\"):
                    # `drift` accepts ledger verbs OR positional anchors/IDs; other subparser
                    # commands (`sync`, `spec`, `skill`, `bootstrap`, `claim`, `change`, `hooks`)
                    # must use one of their declared subcommands.
                    if cmd != "drift":
                        offenders.append(
                            f"{rel}: unknown subcommand `forge {cmd} {sub}` in {snippet!r}"
                        )
                        continue
            allowed_flags = node["flags"] | root_spec["flags"] | {"--help"}
            for tok in tokens[idx:]:
                if not tok.startswith("--") or tok == "--":
                    continue
                flag = tok.split("=", 1)[0]
                if flag not in allowed_flags:
                    offenders.append(f"{rel}: unknown flag {flag!r} for `forge {cmd}` in {snippet!r}")

    assert offenders == [], "\n".join(offenders)


def test_docs_instructions_artifacts_exist():
    valid_artifacts = set(schema.load_schema(REPO, "feature").ids) | set(
        schema.load_schema(REPO, "bugfix").ids
    )
    offenders: list[str] = []
    pattern = re.compile(r"\bforge\s+instructions\s+([a-z][a-z0-9-]*)\b")
    for path in _doc_files():
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(REPO).as_posix()
        for match in pattern.finditer(text):
            artifact = match.group(1)
            if artifact not in valid_artifacts:
                offenders.append(f"{rel}: unknown instructions artifact {artifact!r}")
    assert offenders == [], "\n".join(offenders)


def test_docs_gate_points_match_kernel():
    valid_points = set(gates.POINTS)
    offenders: list[str] = []
    pattern = re.compile(r"\bforge\s+gate\s+([a-z]+:(?:[a-z]+:)?(?:pre|post))\b")
    for path in _doc_files():
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(REPO).as_posix()
        for match in pattern.finditer(text):
            point = match.group(1)
            if point not in valid_points:
                offenders.append(f"{rel}: unknown gate point {point!r}")
    assert offenders == [], "\n".join(offenders)


def test_docs_config_keys_and_defaults_match_kernel():
    config_docs = sorted(
        p
        for lang in ("en", "vi", "ja")
        for name in ("configuration.md", "guides.md", "workflow.md")
        if (p := REPO / "docs" / lang / name).is_file()
    )
    offenders: list[str] = []

    for path in config_docs:
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(REPO).as_posix()
        for match in _YAML_BLOCK_RE.finditer(text):
            body = match.group("body")
            # Inspect config snippets (skip GitHub Actions workflows).
            if "jobs:" in body and "runs-on:" in body:
                continue
            if not any(
                key in body
                for key in (
                    "commands:", "derive:", "budgets:", "thresholds:",
                    "kernel_version:", "protect_main:", "workflow:",
                    "monorepo:", "autonomy:",
                )
            ):
                continue
            loaded = yaml.safe_load(body)
            if not isinstance(loaded, dict):
                continue
            unknown = set(loaded) - _KNOWN_CONFIG_TOP_KEYS
            if unknown:
                offenders.append(f"{rel}: unknown .forge/config.yaml key(s): {sorted(unknown)}")
            cmds = loaded.get("commands")
            if isinstance(cmds, dict) and "timeout" in cmds:
                if cmds["timeout"] != verify.DEFAULT_TIMEOUT:
                    offenders.append(
                        f"{rel}: commands.timeout example is {cmds['timeout']!r}, "
                        f"expected verify.DEFAULT_TIMEOUT={verify.DEFAULT_TIMEOUT}"
                    )

        if path.name == "configuration.md":
            if f"`{verify.DEFAULT_TIMEOUT}`" not in text:
                offenders.append(
                    f"{rel}: must document commands.timeout default `{verify.DEFAULT_TIMEOUT}`"
                )
            if "protect_main" not in text or "verify_on_merge_only" not in text:
                offenders.append(f"{rel}: must document protect_main and verify_on_merge_only")

    assert offenders == [], "\n".join(offenders)


def test_docs_verify_conditions_match_kernel():
    workflow_docs = [REPO / "docs" / lang / "workflow.md" for lang in ("en", "vi", "ja")]
    offenders: list[str] = []
    for path in workflow_docs:
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(REPO).as_posix()
        for banned in _BANNED_VERIFY_NAMES:
            if banned in text:
                offenders.append(f"{rel}: contains non-existent condition name {banned!r}")
        for cond in ("requirement_cover", "claim_evidence", "claim_touch", "derived_fresh"):
            if cond not in text:
                offenders.append(f"{rel}: missing real verify condition {cond!r}")
    assert offenders == [], "\n".join(offenders)


def test_cli_reference_covers_all_commands_and_no_orphan_readme():
    assert not (REPO / "docs/en/README.md").exists(), "orphan docs/en/README.md must not exist"
    top_commands = sorted(_parser_spec(cli.build_parser())["subcommands"])
    offenders: list[str] = []
    for lang in ("en", "vi", "ja"):
        path = REPO / "docs" / lang / "cli-reference.md"
        text = path.read_text(encoding="utf-8")
        for cmd in top_commands:
            if f"forge {cmd}" not in text:
                offenders.append(f"docs/{lang}/cli-reference.md: missing `forge {cmd}`")
    assert offenders == [], "\n".join(offenders)


def test_workspace_antigravity_skills_and_rules_match_packaged():
    packaged_root = REPO / "src/forge/_skills"
    agent_skills = REPO / ".agent/skills"
    offenders: list[str] = []

    for src_file in sorted(packaged_root.rglob("*")):
        if not src_file.is_file() or "__pycache__" in src_file.parts:
            continue
        rel = src_file.relative_to(packaged_root)
        dest_file = agent_skills / rel
        if not dest_file.is_file():
            offenders.append(f"missing .agent/skills/{rel.as_posix()}")
            continue
        src_norm = src_file.read_text(encoding="utf-8").replace("\r\n", "\n")
        dest_norm = dest_file.read_text(encoding="utf-8").replace("\r\n", "\n")
        if src_norm != dest_norm:
            offenders.append(f".agent/skills/{rel.as_posix()} differs from src/forge/_skills/{rel.as_posix()}")

    rule_path = REPO / ".agent/rules/forge.md"
    assert rule_path.is_file()
    rule_norm = rule_path.read_text(encoding="utf-8").replace("\r\n", "\n")
    expected_norm = hosts._antigravity_rules().replace("\r\n", "\n")
    if rule_norm != expected_norm:
        offenders.append(".agent/rules/forge.md differs from hosts._antigravity_rules()")

    assert offenders == [], "\n".join(offenders)

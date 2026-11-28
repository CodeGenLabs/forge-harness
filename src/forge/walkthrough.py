"""Post-implementation functional evidence and living guide generation.

Note: `forge.evidence` evaluates *test* evidence declared inside `claim` blocks.
This module handles *functional/visual walkthrough* evidence produced after a
change is implemented (`changes/<n>/evidence/walkthrough.md`) and turns verified
proof into user-facing functional guides (`docs/guides/<capability>.md`).
"""

from __future__ import annotations

import datetime as _dt
import json
import re
import shutil
from dataclasses import dataclass, field
from pathlib import Path

import yaml

from . import change, spec, validate
from .change import Change
from .validate import Issue

__all__ = [
    "EVIDENCE_DIR",
    "WALKTHROUGH_FILE",
    "ASSETS_DIR",
    "GUIDES_DIR",
    "SKIP_KEY",
    "MODES",
    "EvidenceCase",
    "detect_surface",
    "extract_cases",
    "plan_evidence",
    "init_evidence",
    "check_evidence",
    "publish_guide",
]

EVIDENCE_DIR = "evidence"
WALKTHROUGH_FILE = "evidence/walkthrough.md"
ASSETS_DIR = "evidence/assets"
GUIDES_DIR = "docs/guides"
SKIP_KEY = "skip_evidence"

MODES = ("critical", "full", "skip")

_WEB_FILES = (
    "playwright.config.ts", "playwright.config.js", "playwright.config.mjs",
    "playwright.config.cjs", "vite.config.ts", "vite.config.js", "vite.config.mjs",
    "next.config.ts", "next.config.js", "next.config.mjs", "nuxt.config.ts",
    "nuxt.config.js", "angular.json", "index.html",
)
_WEB_DEPS = frozenset({
    "react", "react-dom", "vue", "nuxt", "next", "svelte", "@sveltejs/kit",
    "@angular/core", "astro", "vite", "playwright", "@playwright/test", "cypress",
})
_API_DEPS = frozenset({
    "express", "fastify", "hono", "@nestjs/core", "koa",
    "fastapi", "flask", "django", "starlette", "litestar", "aiohttp",
})

_P1_KEYWORDS_RE = re.compile(
    r"(?i)\b(error|fail(?:ed|s|ure)?|reject(?:ed|s)?|invalid|refuse(?:d|s)?|"
    r"block(?:ed|s)?|limit|auth(?:entication|orisation|orization)?|security|"
    r"exceed(?:ed|s)?|boundary|empty|timeout|missing|forbidden|unauthorized|conflict)\b"
)
_SCENARIO_HEADING_RE = re.compile(
    r"^#{1,6}\s*Scenario:\s*(?P<title>[^\n]*)$", re.M
)
_MD_LINK_RE = re.compile(r"!?\[[^\]]*\]\((?P<target>[^)\s]+)(?:\s+[\"'][^\"']*[\"'])?\)")
_FENCE_BLOCK_RE = re.compile(r"```[^\n]*\n(?P<body>.*?)```", re.S)
_PLACEHOLDER_RE = re.compile(
    r"(?:\b(?:TODO|TBD)\b|\[(?:PENDING|PASS\s*/\s*FAIL|PASTE\s+[^\]]*|ATTACH\s+[^\]]*)\])"
)


@dataclass
class EvidenceCase:
    """One functional scenario or task candidate for evidence capture."""

    case_id: str
    priority: str       # "P0" | "P1" | "P2"
    capability: str
    requirement: str
    title: str
    steps: str = ""
    selected: bool = True

    def to_dict(self) -> dict:
        return {
            "case_id": self.case_id,
            "priority": self.priority,
            "capability": self.capability,
            "requirement": self.requirement,
            "title": self.title,
            "steps": self.steps,
            "selected": self.selected,
        }


def _read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def detect_surface(repo: Path) -> dict:
    """Detect whether the repository is web UI, API, CLI, hybrid, or library."""
    signals: list[str] = []
    has_web = False
    has_api = False
    has_cli = False

    cfg_path = repo / ".forge/config.yaml"
    if cfg_path.is_file():
        try:
            loaded = yaml.safe_load(_read_text(cfg_path)) or {}
            ui_cmd = ((loaded.get("commands") or {}) if isinstance(loaded, dict) else {}).get("ui")
            if ui_cmd and str(ui_cmd).strip().lower() != "none":
                has_web = True
                signals.append("commands.ui declared")
        except yaml.YAMLError:
            pass

    for name in _WEB_FILES:
        if (repo / name).is_file():
            has_web = True
            signals.append(name)
            break

    for dir_rel in ("src/pages", "src/app", "pages", "app/routes"):
        if (repo / dir_rel).is_dir():
            has_web = True
            signals.append(f"{dir_rel}/")
            break

    pkg_path = repo / "package.json"
    if pkg_path.is_file():
        try:
            pkg = json.loads(_read_text(pkg_path)) or {}
            deps = {}
            for section in ("dependencies", "devDependencies", "peerDependencies"):
                if isinstance(pkg.get(section), dict):
                    deps.update(pkg[section])
            matched_web = sorted(k for k in deps if k in _WEB_DEPS)
            matched_api = sorted(k for k in deps if k in _API_DEPS)
            if matched_web:
                has_web = True
                signals.append(f"package.json ({', '.join(matched_web[:3])})")
            if matched_api:
                has_api = True
                signals.append(f"package.json ({', '.join(matched_api[:3])})")
            if isinstance(pkg.get("bin"), (str, dict)):
                has_cli = True
                signals.append("package.json bin")
        except json.JSONDecodeError:
            pass

    pyproject_path = repo / "pyproject.toml"
    if pyproject_path.is_file():
        py_text = _read_text(pyproject_path)
        if "[project.scripts]" in py_text or "[tool.poetry.scripts]" in py_text:
            has_cli = True
            signals.append("pyproject.toml scripts")
        lower_py = py_text.lower()
        if any(dep in lower_py for dep in ("fastapi", "flask", "django", "litestar", "starlette")):
            has_api = True
            signals.append("pyproject.toml web/api framework")

    if (repo / "go.mod").is_file() and (repo / "cmd").is_dir():
        has_cli = True
        signals.append("go.mod + cmd/")

    if (repo / "Cargo.toml").is_file() and (repo / "src/main.rs").is_file():
        has_cli = True
        signals.append("Cargo.toml + src/main.rs")

    if not has_api and any((repo / rel).is_dir() for rel in ("src/api", "api", "routes")):
        has_api = True
        signals.append("api/routes directory")

    if has_web and (has_api or has_cli):
        surface = "hybrid"
    elif has_web:
        surface = "web"
    elif has_api:
        surface = "api"
    elif has_cli:
        surface = "cli"
    else:
        surface = "library"

    if surface == "web":
        methods = ["screenshot", "video", "console-log"]
    elif surface == "hybrid":
        methods = ["screenshot", "video", "console-log", "terminal-transcript"]
    elif surface == "api":
        methods = ["http-trace", "command-output"]
    else:
        methods = ["terminal-transcript", "command-output"]

    return {
        "surface": surface,
        "capture_methods": methods,
        "signals": signals,
    }


def _scenario_blocks(req_body: str) -> list[tuple[str, str]]:
    matches = list(_SCENARIO_HEADING_RE.finditer(req_body))
    blocks: list[tuple[str, str]] = []
    for idx, match in enumerate(matches):
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(req_body)
        title = match.group("title").strip() or f"Scenario {idx + 1}"
        raw_lines = [
            line.strip()
            for line in req_body[start:end].splitlines()
            if line.strip() and not line.strip().startswith("#")
        ]
        blocks.append((title, "\n".join(raw_lines)))
    return blocks


def extract_cases(repo: Path, item: Change) -> list[EvidenceCase]:
    """Extract prioritized functional test cases from spec deltas or tasks."""
    cases: list[EvidenceCase] = []
    deltas = spec.delta_files(repo, item.relative)

    for rel_path in deltas:
        cap = spec.capability_of(rel_path, item.relative)
        delta = spec.parse_delta(_read_text(repo / rel_path), rel_path, cap)
        for verb in ("ADDED", "MODIFIED"):
            for req in delta.sections.get(verb, []):
                blocks = _scenario_blocks(req.body)
                if not blocks:
                    cases.append(EvidenceCase(
                        case_id="",
                        priority="P0",
                        capability=cap,
                        requirement=req.id,
                        title=req.title or req.id,
                        steps=req.body.strip(),
                    ))
                    continue
                for idx, (scen_title, steps) in enumerate(blocks):
                    if idx == 0:
                        priority = "P0"
                    elif _P1_KEYWORDS_RE.search(scen_title) or _P1_KEYWORDS_RE.search(steps):
                        priority = "P1"
                    else:
                        priority = "P2"
                    cases.append(EvidenceCase(
                        case_id="",
                        priority=priority,
                        capability=cap,
                        requirement=req.id,
                        title=scen_title,
                        steps=steps,
                    ))

    if not cases:
        task_index = 0
        for _, text in item.tasks():
            if re.search(r"\bchore\b", text, re.I):
                continue
            req_match = re.search(r"\b(REQ-[A-Za-z0-9_-]+)\b", text)
            req_id = req_match.group(1) if req_match else "TASK"
            clean_title = re.sub(r"\s*\(?\bREQ-[A-Za-z0-9_-]+\)?\s*:?\s*", " ", text).strip(" :-")
            priority = "P0" if task_index < 3 else "P1"
            task_index += 1
            cases.append(EvidenceCase(
                case_id="",
                priority=priority,
                capability=item.slug,
                requirement=req_id,
                title=clean_title or text,
                steps=f"Execute and observe outcome for: {clean_title or text}",
            ))

    for num, case in enumerate(cases, start=1):
        case.case_id = f"CASE-{num:02d}"
    return cases


def _default_cap_slug(item: Change, cases: list[EvidenceCase]) -> str:
    if cases and cases[0].capability:
        return cases[0].capability.strip("/").replace("/", "-")
    return item.slug


def plan_evidence(repo: Path, item: Change) -> dict:
    """Compute surface detection, prioritized scenarios, and recommended scope."""
    surface_info = detect_surface(repo)
    cases = extract_cases(repo, item)
    p0 = sum(1 for c in cases if c.priority == "P0")
    p1 = sum(1 for c in cases if c.priority == "P1")
    p2 = sum(1 for c in cases if c.priority == "P2")
    total = len(cases)

    if total == 0:
        recommended = "skip"
    elif total <= 4:
        recommended = "full"
    else:
        recommended = "critical"

    cap_slug = _default_cap_slug(item, cases)
    return {
        "change": item.name,
        "surface": surface_info["surface"],
        "capture_methods": surface_info["capture_methods"],
        "signals": surface_info["signals"],
        "counts": {"total": total, "p0": p0, "p1": p1, "p2": p2},
        "recommended_mode": recommended,
        "guide_target": f"{GUIDES_DIR}/{cap_slug}.md",
        "cases": [c.to_dict() for c in cases],
    }


def _render_walkthrough(
    item: Change,
    *,
    mode: str,
    surface_info: dict,
    selected: list[EvidenceCase],
    total_cases: int,
    guide_target: str,
) -> str:
    surface = surface_info["surface"]
    methods = ", ".join(surface_info["capture_methods"])
    is_visual = surface in ("web", "hybrid")

    lines = [
        change.TEMPLATE_MARKER,
        f"# Functional Evidence - {item.meta.get('title') or item.slug}",
        "",
        "| Field | Value |",
        "| --- | --- |",
        f"| Change | `{item.name}` |",
        f"| Mode | `{mode}` ({len(selected)}/{total_cases} cases) |",
        f"| Surface | `{surface}` ({methods}) |",
        f"| Guide Target | `{guide_target}` |",
        "",
        "## Case Matrix",
        "",
        "| Case | Priority | Requirement | Title | Status |",
        "| --- | --- | --- | --- | --- |",
    ]
    for c in selected:
        lines.append(
            f"| {c.case_id} | {c.priority} | `{c.requirement}` | {c.title} | [PENDING] |"
        )
    if not selected:
        lines.append("| CASE-01 | P0 | - | End-to-end verification | [PENDING] |")

    lines += ["", "## Captured Walkthrough", ""]
    cases_to_render = selected or [
        EvidenceCase(
            case_id="CASE-01",
            priority="P0",
            capability=item.slug,
            requirement="-",
            title=str(item.meta.get("title") or item.slug),
            steps="Run the main workflow end-to-end and record observable output.",
        )
    ]

    for c in cases_to_render:
        lines += [
            f"### {c.case_id} - {c.title}",
            "",
            f"- **Priority:** `{c.priority}`",
            f"- **Requirement:** `{c.requirement}`",
            "- **Steps:**",
        ]
        if c.steps:
            for sline in c.steps.splitlines():
                lines.append(f"  {sline}")
        else:
            lines.append("  1. Execute scenario steps.")
        if is_visual:
            lines += [
                "- **Captured Proof:**",
                f"  ![{c.case_id} screenshot](assets/{c.case_id.lower()}.png)",
                "  <!-- Optional clip: [recording](assets/recording.webm) -->",
            ]
        else:
            lines += [
                "- **Captured Proof:**",
                "  ```text",
                "  [PASTE REAL COMMAND AND OUTPUT]",
                "  ```",
            ]
        lines += ["- **Result:** [PASS / FAIL]", ""]

    return "\n".join(lines).rstrip() + "\n"


def init_evidence(
    repo: Path,
    item: Change,
    *,
    mode: str = "critical",
    reason: str = "",
    force: bool = False,
) -> dict:
    """Scaffold `evidence/walkthrough.md` for chosen mode, or record `skip_evidence`."""
    if mode not in MODES:
        raise ValueError(f"unknown evidence mode {mode!r}; expected one of {', '.join(MODES)}")

    if mode == "skip":
        cleaned = reason.strip()
        if not cleaned:
            raise ValueError("skip mode requires a non-empty --reason")
        item.meta[SKIP_KEY] = cleaned
        item.write_meta()
        return {
            "mode": "skip",
            "reason": cleaned,
            "path": f"{item.relative}/{change.META_FILE}",
        }

    if SKIP_KEY in item.meta:
        item.meta.pop(SKIP_KEY, None)
        item.write_meta()

    plan = plan_evidence(repo, item)
    all_cases = extract_cases(repo, item)
    if mode == "critical":
        selected = [c for c in all_cases if c.priority == "P0"] or list(all_cases)
    else:
        selected = list(all_cases)

    target = item.root / WALKTHROUGH_FILE
    if target.exists() and not force:
        raise FileExistsError(
            f"{item.relative}/{WALKTHROUGH_FILE} already exists; pass --force to overwrite"
        )

    (item.root / ASSETS_DIR).mkdir(parents=True, exist_ok=True)
    rendered = _render_walkthrough(
        item,
        mode=mode,
        surface_info={"surface": plan["surface"], "capture_methods": plan["capture_methods"]},
        selected=selected,
        total_cases=len(all_cases),
        guide_target=plan["guide_target"],
    )
    target.write_text(rendered, encoding="utf-8", newline="\n")
    return {
        "mode": mode,
        "path": f"{item.relative}/{WALKTHROUGH_FILE}",
        "assets_dir": f"{item.relative}/{ASSETS_DIR}",
        "surface": plan["surface"],
        "selected_cases": len(selected),
        "total_cases": len(all_cases),
        "guide_target": plan["guide_target"],
    }


def _strip_query_fragment(target: str) -> str:
    return target.split("#", 1)[0].split("?", 1)[0]


def check_evidence(repo: Path, item: Change) -> list[Issue]:
    """Validate that functional evidence or a reasoned `skip_evidence` exists."""
    issues: list[Issue] = []

    if SKIP_KEY in item.meta:
        raw_skip = item.meta.get(SKIP_KEY)
        if raw_skip is True or not str(raw_skip or "").strip():
            return [Issue(
                "ERROR",
                "evidence.skip_reason_missing",
                f"{item.relative}/{change.META_FILE}",
                "`skip_evidence` is set without a written reason",
                f"forge evidence init --change {item.number} --mode skip --reason \"why\"",
            )]
        return []

    target = item.root / WALKTHROUGH_FILE
    rel_target = f"{item.relative}/{WALKTHROUGH_FILE}"
    if not target.is_file():
        return [Issue(
            "ERROR",
            "evidence.missing",
            rel_target,
            "functional evidence walkthrough has not been captured yet",
            f"forge evidence plan --change {item.number} && forge evidence init --change {item.number}",
        )]

    text = _read_text(target)
    if change.TEMPLATE_MARKER in text:
        issues.append(Issue(
            "ERROR",
            "evidence.template_unfilled",
            rel_target,
            f"evidence file still carries `{change.TEMPLATE_MARKER}`",
            "capture real proof, fill in results, and remove the template marker line",
        ))

    outside_fences = validate.blank_fences(text)
    cleaned = validate.blank_inline_code(outside_fences)

    valid_assets = 0
    for match in _MD_LINK_RE.finditer(outside_fences):
        raw_link = match.group("target").strip()
        if raw_link.startswith(("http://", "https://", "mailto:", "data:", "#")):
            continue
        rel_asset = _strip_query_fragment(raw_link)
        if not rel_asset:
            continue
        resolved = (target.parent / rel_asset).resolve()
        if not resolved.is_file() or resolved.stat().st_size == 0:
            issues.append(Issue(
                "ERROR",
                "evidence.missing_asset",
                rel_target,
                f"referenced evidence file `{raw_link}` is missing or empty",
                "save a real screenshot/recording/artifact at that path or update the link",
            ))
        else:
            valid_assets += 1

    for line_no, line in enumerate(cleaned.splitlines(), start=1):
        m = _PLACEHOLDER_RE.search(line)
        if m:
            issues.append(Issue(
                "ERROR",
                "evidence.placeholder",
                rel_target,
                f"unresolved evidence placeholder {m.group(0)!r}",
                "replace placeholders with verified status and real captured output",
                line=line_no,
            ))

    valid_fences = sum(
        1 for fm in _FENCE_BLOCK_RE.finditer(text)
        if fm.group("body").strip()
    )
    if valid_assets == 0 and valid_fences == 0:
        issues.append(Issue(
            "ERROR",
            "evidence.no_proof",
            rel_target,
            "walkthrough contains neither a valid local asset link nor a non-empty command output block",
            "attach at least one screenshot/recording under `assets/` or a real output block",
        ))

    return issues


def _extract_overview(repo: Path, item: Change) -> str:
    for rel in spec.delta_files(repo, item.relative):
        parsed = spec.parse_delta(_read_text(repo / rel), rel, spec.capability_of(rel, item.relative))
        if parsed.purpose:
            return parsed.purpose.strip()
    prop = item.root / "proposal.md"
    if prop.is_file():
        body = _read_text(prop)
        match = re.search(r"^##\s+Why\s*\n+(?P<why>.+?)(?:\n##\s+|\Z)", body, re.M | re.S)
        if match:
            return match.group("why").strip()
    return str(item.meta.get("title") or item.slug)


def _strip_template_header(walkthrough_text: str) -> str:
    body = walkthrough_text.replace(change.TEMPLATE_MARKER + "\n", "").replace(change.TEMPLATE_MARKER, "")
    walk_marker = "## Captured Walkthrough"
    idx = body.find(walk_marker)
    if idx != -1:
        return body[idx + len(walk_marker):].strip()
    lines = body.splitlines()
    if lines and lines[0].lstrip().startswith("# "):
        return "\n".join(lines[1:]).strip()
    return body.strip()


def _guide_title(path: Path) -> str:
    for line in _read_text(path).splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return path.stem


def _write_guides_index(guides_dir: Path) -> Path:
    entries: list[str] = [
        "# Functional Guides",
        "",
        "Living functional documentation generated from verified change evidence.",
        "",
    ]
    guide_files = sorted(
        p for p in guides_dir.glob("*.md")
        if p.is_file() and p.name.lower() != "readme.md"
    )
    for gpath in guide_files:
        entries.append(f"- [{_guide_title(gpath)}]({gpath.name})")
    index_path = guides_dir / "README.md"
    index_path.write_text("\n".join(entries).rstrip() + "\n", encoding="utf-8", newline="\n")
    return index_path


def publish_guide(
    repo: Path,
    item: Change,
    *,
    capability: str | None = None,
    output: Path | None = None,
) -> dict:
    """Publish verified walkthrough evidence as a functional guide under `docs/guides/`."""
    if item.skipped(SKIP_KEY) is not None and not (item.root / WALKTHROUGH_FILE).is_file():
        raise ValueError(
            f"change {item.name} skipped evidence ({item.skipped(SKIP_KEY)}); nothing to publish"
        )

    errors = [i for i in check_evidence(repo, item) if i.level == "ERROR"]
    if errors:
        raise ValueError("; ".join(f"{i.code}: {i.message}" for i in errors))

    cases = extract_cases(repo, item)
    cap_slug = (
        capability.strip("/").replace("/", "-")
        if capability and capability.strip("/")
        else _default_cap_slug(item, cases)
    )
    cap_slug = change.slugify(cap_slug) or item.slug

    if output is not None:
        target = output if output.is_absolute() else (repo / output)
    else:
        target = repo / GUIDES_DIR / f"{cap_slug}.md"

    target.parent.mkdir(parents=True, exist_ok=True)
    walkthrough_path = item.root / WALKTHROUGH_FILE
    raw_text = _read_text(walkthrough_path)
    section_body = _strip_template_header(raw_text)

    assets_dest = target.parent / "assets" / cap_slug
    copied_assets: list[str] = []
    rewrites: dict[str, str] = {}

    for match in _MD_LINK_RE.finditer(section_body):
        raw_link = match.group("target").strip()
        if raw_link.startswith(("http://", "https://", "mailto:", "data:", "#")):
            continue
        rel_asset = _strip_query_fragment(raw_link)
        if not rel_asset:
            continue
        src_asset = (walkthrough_path.parent / rel_asset).resolve()
        if not src_asset.is_file():
            continue
        assets_dest.mkdir(parents=True, exist_ok=True)
        dest_file = assets_dest / src_asset.name
        shutil.copy2(src_asset, dest_file)
        new_rel = f"assets/{cap_slug}/{src_asset.name}"
        rewrites[raw_link] = raw_link.replace(rel_asset, new_rel, 1)
        rel_copied = dest_file.relative_to(repo).as_posix() if dest_file.is_relative_to(repo) else str(dest_file)
        if rel_copied not in copied_assets:
            copied_assets.append(rel_copied)

    for old, new in sorted(rewrites.items(), key=lambda kv: -len(kv[0])):
        section_body = section_body.replace(f"]({old}", f"]({new}")

    reqs = sorted({c.requirement for c in cases if c.requirement and c.requirement != "-"})
    overview = _extract_overview(repo, item)
    title = str(item.meta.get("title") or cap_slug.replace("-", " ").title())
    today = _dt.date.today().isoformat()

    guide_lines = [
        f"# {title}",
        "",
        "## Overview",
        "",
        overview,
        "",
        "## Functional Walkthrough",
        "",
        section_body,
        "",
        "---",
        "",
        "## Traceability",
        "",
        f"- **Source Change:** `{item.name}`",
        f"- **Requirements:** {', '.join(f'`{r}`' for r in reqs) if reqs else 'none declared'}",
        f"- **Verified:** {today}",
    ]
    target.write_text("\n".join(guide_lines).rstrip() + "\n", encoding="utf-8", newline="\n")
    index_path = _write_guides_index(target.parent)

    return {
        "guide": target.relative_to(repo).as_posix() if target.is_relative_to(repo) else str(target),
        "index": index_path.relative_to(repo).as_posix() if index_path.is_relative_to(repo) else str(index_path),
        "assets_copied": copied_assets,
        "capability": cap_slug,
    }

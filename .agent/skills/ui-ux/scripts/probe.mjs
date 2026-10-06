#!/usr/bin/env node
// Load the live page across multiple viewports, measure machine-detectable errors, and take screenshots for visual review.
// Used at gate 3 of the checklist (references/checklist.md). Read-only; does not modify the page.
//
//   node probe.mjs <url> [--widths 375,768,1024,1280,1440,1920] [--out <directory>] [--dark] [--wait 800] [--dpr 1]
//                        [--sweep [1440,375,20]] [--wireframe <url of chosen option>] [--quick]
//                        [--dynamic-widths 1280,375|none]
//
// Dynamic checks (Tab, hover, click, open overlay) take the majority of runtime and rarely differ across widths,
// so by default they run only on mobile, near 768, and near 1280; other viewports check static layout only.
// --dynamic-widths: select widths for dynamic checks, "none" for none. In subsequent rounds pass only the
// widths that had dynamic errors in the previous round (command printed at the bottom of report).
//
// --quick: test static layout only (layout, typography, overflow, contrast, native controls including hidden overlays),
// skipping Tab, hover, click, and opening overlays. Use for wireframes before submission (design-process.md, U3): ~4x faster,
// dynamic checks are measured fully in U4.
//
// --wireframe: compare build against chosen wireframe (design-process.md, U4) at 1440 and 375: spacing differences,
// changed or missing text, font size, font weight differences; links with mau=mau also compare text, icon, and background colors. Records to list P.
//
// --sweep: after checking fixed widths, sweeps viewport width from 1440 down to 375 in 20px steps, takes screenshots at
// each step and reports width ranges with issues (horizontal overflow, clipped text, wrapped button text, wrapped rows,
// truncation swallowing numbers or text too short). Catches
// bugs between fixed breakpoints, e.g. nav wrapping at 900px. Used in UI review mode (references/review.md).
//
// Playwright lookup order: --pw <directory containing node_modules/playwright>, current directory, script directory.
// If missing, install into a temporary directory, not into the project:
//   npm i --prefix "$TMPDIR/forge-probe" playwright && node probe.mjs <url> --pw "$TMPDIR/forge-probe"

import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const defaultWidths = [375, 768, 1024, 1280, 1440, 1920];
const defaultSweep = [1440, 375, 20];
const mobileWidthLimit = 640;
// The skill's tap target floor: h-8 button in dense tables is the smallest permissible target (list-row.md).
const minTapSize = 32;
// Maximum Tab stops, and number of identical elements (same tag + class) checked: past the third button
// across 8 identical cards, Tab skips ahead so multi-card pages still reach floating buttons at page bottom.
const maxTabStops = 160;
const maxFocusChecksPerKind = 2;

function parseArgs(argv) {
  const options = { url: "", widths: defaultWidths, out: "", isDark: false, waitMs: 800, dpr: 1, playwrightDir: "", sweep: null, wireframeUrl: "", isQuick: false, dynamicWidths: null };
  const rest = [...argv];

  while (rest.length > 0) {
    const arg = rest.shift();

    if (arg === "--widths") options.widths = rest.shift().split(",").map(Number);
    else if (arg === "--sweep") {
      const [from, to, step] = /^\d+,\d+(,\d+)?$/.test(rest[0] ?? "") ? rest.shift().split(",").map(Number) : defaultSweep;
      options.sweep = { from: Math.max(from, to), to: Math.min(from, to), step: step || defaultSweep[2] };
    }
    else if (arg === "--out") options.out = rest.shift();
    else if (arg === "--dark") options.isDark = true;
    else if (arg === "--wait") options.waitMs = Number(rest.shift());
    else if (arg === "--dpr") options.dpr = Number(rest.shift());
    else if (arg === "--pw") options.playwrightDir = rest.shift();
    else if (arg === "--wireframe") options.wireframeUrl = rest.shift();
    else if (arg === "--quick") options.isQuick = true;
    else if (arg === "--dynamic-widths") {
      const value = rest.shift() ?? "";
      options.dynamicWidths = new Set(value === "none" ? [] : value.split(",").map(Number));
    }
    else if (!arg.startsWith("--")) options.url = arg;
  }

  if (!options.out) options.out = join(tmpdir(), `forge-probe-${Date.now()}`);
  if (options.isQuick) options.dynamicWidths = new Set();
  if (!options.dynamicWidths) options.dynamicWidths = pickDefaultDynamicWidths(options.widths);

  return options;
}

// Every mobile width runs dynamic checks (menu, sheet only open on narrow screens). Above that, two viewports: near 1280, and near 768
// because tablet layout has distinct controls (measured 2026-10-05: "Table of contents" button only visible at 768, Tab focus invisible;
// overlay protrudes on narrow screens but not at 1280). 1024, 1440, 1920 dynamic checks reveal no significant additional errors.
function pickDefaultDynamicWidths(widths) {
  const mobileWidths = widths.filter((width) => width < mobileWidthLimit);
  const desktopWidths = widths.filter((width) => width >= mobileWidthLimit);
  const closestTo = (target) => desktopWidths.reduce((best, width) => (best === null || Math.abs(width - target) < Math.abs(best - target) ? width : best), null);

  return new Set([...mobileWidths, closestTo(768), closestTo(1280)].filter((width) => width !== null));
}

function loadPlaywright(playwrightDir) {
  const searchDirs = [playwrightDir, process.cwd(), fileURLToPath(new URL(".", import.meta.url))].filter(Boolean);

  for (const searchDir of searchDirs) {
    try {
      return createRequire(join(resolve(searchDir), "noop.js"))("playwright");
    } catch {
      // Try the next directory.
    }
  }

  return null;
}

async function launchBrowser(chromium) {
  try {
    return await chromium.launch();
  } catch {
    // If Playwright Chromium is not installed, use system Chrome.
    return chromium.launch({ channel: "chrome" });
  }
}

// ---------- In-page measurements ----------

// Disable transitions and animations to measure and screenshot the final state, not mid-animation.
const freezeMotionCss = "*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;caret-color:transparent!important}";

// Probe disables all motion before measuring (for stable screenshots), so record each element's `transition`
// into `data-forge-transition` beforehand so motion checks (18f, 18g) can still read them.
function stampTransitions() {
  for (const element of document.body.querySelectorAll("*")) {
    const style = getComputedStyle(element);
    if (parseFloat(style.transitionDuration) > 0) element.dataset.forgeTransition = style.transitionProperty;
  }
}

function measureInPage({ minTapSize, isMobile, isSweep = false }) {
  const viewportWidth = document.documentElement.clientWidth;

  // 0. Page auto-scrolled upon load: window or primary scroll container (height >= 60% screen) moved away from top
  //    before user interaction. Small containers pre-scrolled to bottom (message thread) are intentional, ignore.
  const autoScrolledAreas = [];
  if (window.scrollY > 0) autoScrolledAreas.push(`window scrolled ${Math.round(window.scrollY)}px`);
  for (const container of document.querySelectorAll("body *")) {
    const overflowY = getComputedStyle(container).overflowY;
    if (!["auto", "scroll"].includes(overflowY) || container.scrollTop <= 0 || container.clientHeight < window.innerHeight * 0.6) continue;
    // Time grid pre-scrolled to "now" line (`data-now`, `layouts/app.md` "Daily schedule grid") is intentional: line
    // inside visible portion of container is ignored (false positive 2026-09-30, dental schedule).
    const containerRect = container.getBoundingClientRect();
    const isScrolledToNow = [...container.querySelectorAll("[data-now]")].some((marker) => {
      const markerRect = marker.getBoundingClientRect();
      return markerRect.top >= containerRect.top && markerRect.bottom <= containerRect.bottom;
    });
    if (isScrolledToNow) continue;
    const classes = (container.getAttribute("class") || "").trim().split(/\s+/).slice(0, 5).join(".");
    autoScrolledAreas.push(`${container.tagName.toLowerCase()}${classes ? "." + classes : ""} scrolled ${Math.round(container.scrollTop)}px`);
  }

  function describe(element) {
    const tag = element.tagName.toLowerCase();
    const label = (element.getAttribute("aria-label") || element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const classes = (element.getAttribute("class") || "").trim().split(/\s+/).slice(0, 6).join(".");

    return `${tag}${classes ? "." + classes : ""}${label ? ` "${label}"` : ""}`;
  }

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    return rect.width > 2 && rect.height > 2 && style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0;
  }

  function isClippedHorizontally(element) {
    for (let ancestor = element.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
      const overflowX = getComputedStyle(ancestor).overflowX;
      if (overflowX !== "visible") return true;
    }

    return false;
  }

  function getFirstTextRect(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (textNode) => (textNode.textContent.trim() && isVisible(textNode.parentElement) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const textNode = walker.nextNode();
    if (!textNode) return null;

    const range = document.createRange();
    const text = textNode.textContent;
    const start = text.length - text.trimStart().length;
    range.setStart(textNode, start);
    range.setEnd(textNode, text.trimEnd().length);

    const rect = range.getBoundingClientRect();

    return { left: rect.left, right: rect.right, width: rect.width, text: text.trim().slice(0, 12), node: textNode };
  }

  // Text inside chip / badge (container with background or border): column-aligned edge is container edge, not text edge:
  // "VIP" text indented 8px in pill is correct (false positive 2026-09-27, customer quick view panel).
  function getBoxedTextEdge(textRect, cell) {
    for (let node = textRect.node.parentElement; node && node !== cell; node = node.parentElement) {
      const style = getComputedStyle(node);
      const hasFill = style.backgroundColor !== "rgba(0, 0, 0, 0)" && style.backgroundColor !== "transparent";
      const hasBorder = parseFloat(style.borderLeftWidth) > 0 && style.borderLeftStyle !== "none";
      if (hasFill || hasBorder) {
        const boxRect = node.getBoundingClientRect();

        return { left: boxRect.left, right: boxRect.right };
      }
    }

    return textRect;
  }

  const isColorClass = (className) =>
    /^(bg|fill|stroke|ring|inset-ring|outline|decoration|shadow|from|via|to)-/.test(className) ||
    (/^text-/.test(className) && !/^text-(xs|sm|base|lg|\d?xl|\[)/.test(className)) ||
    (/^border-/.test(className) && !/^border-(\d|[trblxy]($|-\d))/.test(className));
  // Tag + class hierarchy (excluding color classes) of descendants three levels deep, ignoring count: 2-task calendar cell
  // and 3-task cell share structure, so 3-task cell with 2px height discrepancy is still caught (2026-09-26).
  function getStructureSignature(element) {
    const paths = new Set();
    const visit = (node, prefix, depth) => {
      for (const child of node.children) {
        const classKey = (child.getAttribute("class") || "").split(/\s+/).filter((className) => className && !isColorClass(className)).sort().join(".");
        const path = `${prefix}>${child.tagName}.${classKey}`;
        paths.add(path);
        if (depth < 3) visit(child, path, depth + 1);
      }
    };
    visit(element, "", 1);

    return [...paths].sort().join("|");
  }

  // Toolbar and rationale box in wireframe page (`design-process.md` U3) are outside the design: do not measure.
  //  False positives 2026-09-30, dental wireframe: "header button row not uniform size", small tap target, misaligned divider.
  const isWireframeChrome = (element) => Boolean(element.closest(".wf-bar, .wf-reason, [data-wf-reason]"));
  const allElements = [...document.body.querySelectorAll("*")].filter((element) => !["SCRIPT", "STYLE", "svg", "path"].includes(element.tagName) && !isWireframeChrome(element));

  // 1. Horizontal scroll: page wider than viewport, and elements protruding past right edge.
  const pageScrollWidth = document.documentElement.scrollWidth;
  const overflowingElements = allElements
    .filter((element) => isVisible(element) && element.getBoundingClientRect().right > viewportWidth + 1 && !isClippedHorizontally(element))
    .map((element) => ({ element: describe(element), right: Math.round(element.getBoundingClientRect().right) }))
    .slice(0, 8);

  // 1b. Container clips text: overflow hidden / clip container with text inside sitting outside bounds (fixed-height chip
  //     row hiding second row, truncated metric). Text inside smaller clip or scroll container reports there:
  //     ellipsis and line-clamp handled in item 2; horizontal table scroll is intentional.
  function findHiddenText(container, isClippingX, isClippingY) {
    const box = container.getBoundingClientRect();
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    for (let textNode = walker.nextNode(); textNode; textNode = walker.nextNode()) {
      const holder = textNode.parentElement;
      if (!textNode.textContent.trim() || !holder || holder.closest("[aria-hidden='true'], [inert]")) continue;
      if (getComputedStyle(holder).visibility === "hidden") continue;

      let isInnerClip = false;
      for (let node = holder; node && node !== container; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.overflowX !== "visible" || style.overflowY !== "visible") isInnerClip = true;
      }
      if (isInnerClip) continue;

      const range = document.createRange();
      range.selectNodeContents(textNode);
      for (const rect of range.getClientRects()) {
        if (rect.width === 0) continue;
        const isOutsideX = isClippingX && (rect.right > box.right + 1 || rect.left < box.left - 1);
        const isOutsideY = isClippingY && (rect.bottom > box.bottom + 1 || rect.top < box.top - 1);
        if (isOutsideX || isOutsideY) {
          return textNode.textContent.trim().replace(/\s+/g, " ").slice(0, 30);
        }
      }
    }

    return "";
  }

  const clippedBlocks = [];
  for (const element of allElements) {
    if (clippedBlocks.length >= 8) break;
    const style = getComputedStyle(element);
    // Check per dimension: page column `overflow-x-hidden overflow-y-auto` scrolls vertically; text below screen
    // edge is not clipped (false positive 2026-09-27, phase 2 pilot, all desktop viewports).
    const isClippingX = ["hidden", "clip"].includes(style.overflowX);
    const isClippingY = ["hidden", "clip"].includes(style.overflowY);
    const isEllipsis = style.textOverflow === "ellipsis" || style.webkitLineClamp !== "none";
    const hasMoreContent = (isClippingX && element.scrollWidth > element.clientWidth + 1) || (isClippingY && element.scrollHeight > element.clientHeight + 1);
    if (isEllipsis || !hasMoreContent || !isVisible(element)) continue;

    const hiddenText = findHiddenText(element, isClippingX, isClippingY);
    if (hiddenText) clippedBlocks.push({ element: describe(element), hiddenText });
  }

  // 1c. Text inside button, link, tab wraps to two lines: button squeezed. Count only short single-phrase labels; paragraph
  //     links, link cards, menu items with descriptions legitimately wrap to multiple lines.
  const wrappedControls = [];
  for (const control of document.querySelectorAll("a, button, [role='tab'], [role='menuitem']")) {
    if (wrappedControls.length >= 8) break;
    if (!isVisible(control) || getComputedStyle(control).display === "inline") continue;
    // "Long label" demo button intentionally placed in narrow container on design system page (`D9`, `data-demo-state`):
    // repeatedly reported in both 4a and 4b on 2026-09-30.
    if (control.closest("[data-demo-state]")) continue;
    // Stacked icon-above-text tiles (category tile height >= 56px): two-line label is by design, not a squeezed
    // button (false positive 2026-09-27, category tiles in phase 2 pilot).
    const controlStyle = getComputedStyle(control);
    if (controlStyle.flexDirection.startsWith("column") && controlStyle.display.includes("flex") && control.getBoundingClientRect().height >= 56) continue;

    const textNodes = [];
    const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
    for (let textNode = walker.nextNode(); textNode; textNode = walker.nextNode()) if (textNode.textContent.trim()) textNodes.push(textNode);
    if (textNodes.length !== 1 || textNodes[0].textContent.trim().length > 40) continue;

    const range = document.createRange();
    range.selectNodeContents(textNodes[0]);
    const lineTops = new Set([...range.getClientRects()].filter((rect) => rect.width > 0).map((rect) => Math.round(rect.top)));
    if (lineTops.size > 1) wrappedControls.push(describe(control));
  }

  // 1d. Wrapped rows in header, nav, toolbar, tab rail: children of flex-wrap row split across
  //     two lines. Card grid in page body wrapping is intentional, do not probe.
  const wrappedRows = [];
  for (const row of document.querySelectorAll("header, header *, nav, nav *, [role='toolbar'], [role='tablist']")) {
    if (wrappedRows.length >= 6) break;
    const style = getComputedStyle(row);
    if (!style.display.includes("flex") || !style.flexDirection.startsWith("row") || style.flexWrap !== "wrap" || !isVisible(row)) continue;

    const visibleChildren = [...row.children].filter(isVisible);
    const children = visibleChildren.map((child) => child.getBoundingClientRect());
    if (children.length < 2) continue;
    const shortestHeight = Math.min(...children.map((rect) => rect.height));
    const topSpread = Math.max(...children.map((rect) => rect.top)) - Math.min(...children.map((rect) => rect.top));
    if (topSpread <= shortestHeight / 2) continue;
    // Only plain text (without controls) splits to its own line while controls remain in one row: pagination
    // "1–8 of 34" above page numbers on narrow screens is intentional (reported twice 2026-09-30, inventory pilot).
    const interactiveSelector = "a[href], button, input, select, textarea, [role='button'], [role='tab'], [tabindex]";
    const controlTops = visibleChildren
      .filter((child) => child.matches(interactiveSelector) || child.querySelector(interactiveSelector))
      .map((child) => Math.round(child.getBoundingClientRect().top));
    const isCaptionOnlyWrap = controlTops.length > 0 && controlTops.length < visibleChildren.length && Math.max(...controlTops) - Math.min(...controlTops) <= shortestHeight / 2;
    if (!isCaptionOnlyWrap) wrappedRows.push(describe(row));
  }
  // 1d2. Button row anywhere (panel footer, card) where icon-only button (⋯) wraps to lower line by itself: looks
  //      orphaned (2026-09-30, 352px detail panel in appointment wireframe: "Start exam", "Open record"
  //      on one line, ⋯ below). Fix: buttons without `flex-1`, shorten labels, or move ⋯ to panel header.
  for (const row of document.querySelectorAll("div, footer, section, ul, ol, p")) {
    if (wrappedRows.length >= 6) break;
    const style = getComputedStyle(row);
    if (!style.display.includes("flex") || !style.flexDirection.startsWith("row") || style.flexWrap !== "wrap" || !isVisible(row)) continue;
    const children = [...row.children].filter(isVisible);
    if (children.length < 2) continue;
    const lastChild = children.at(-1);
    const lastTop = lastChild.getBoundingClientRect().top;
    const isAlone = children.slice(0, -1).every((child) => child.getBoundingClientRect().bottom <= lastTop + 1);
    if (!isAlone) continue;
    const isButtonRow = children.every((child) => child.matches("button, a[href], [role='button']"));
    if (isButtonRow && !lastChild.textContent.trim()) {
      wrappedRows.push(`icon-only button wrapped to its own line: ${describe(lastChild)} in ${describe(row)}`);
      continue;
    }
    // `R3`: row of short items (legend, count, chip) with 3+ items where bottom line has only one item (2026-09-30,
    // 375px dental chart legend: "Missing tooth" dropped alone). Card grids (items wider than half row) wrapping is normal.
    const rowWidth = row.getBoundingClientRect().width;
    const isShortItems = children.every((child) => child.getBoundingClientRect().width < rowWidth / 2 && child.getBoundingClientRect().height < 48);
    if (children.length >= 3 && isShortItems) wrappedRows.push(`item wrapped to its own line (R3): ${describe(lastChild)} in ${describe(row)}`);
  }

  // 2. Truncated text too short: container readable only for a few characters reads as if missing.
  const truncatedTexts = allElements
    .filter((element) => {
      const style = getComputedStyle(element);
      const isEllipsis = style.textOverflow === "ellipsis" || style.webkitLineClamp !== "none";

      return isEllipsis && isVisible(element) && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1);
    })
    .map((element) => {
      const fullText = element.textContent.trim().replace(/\s+/g, " ");
      const style = getComputedStyle(element);
      const isClamp = style.webkitLineClamp !== "none";
      const visibleRatio = isClamp ? element.clientHeight / element.scrollHeight : element.clientWidth / element.scrollWidth;

      return { element: describe(element), fullText, visibleChars: Math.floor(fullText.length * visibleRatio), width: Math.round(element.clientWidth), isSingleLine: !isClamp };
    });
  const tooShortTexts = truncatedTexts.filter((item) => item.visibleChars < 10 && item.fullText.length > item.visibleChars + 3);

  // 18d. Truncation swallows numbers: single-line `truncate` where hidden part contains number with unit (m², million, $, %).
  //      Numbers are often what users compare ("Duplex loft… " swallows "210m²", 2026-09-28).
  //      A container with only a number (metric, price) cut anywhere reads as a different number: "1,284,500…"
  //      from "1,284,500,000 ₫", narrow metric card at 816–989px (missed 2026-09-30, clinic schedule: hidden "000 ₫"
  //      missed earlier check because sweep did not measure truncated text).
  const numberWithUnit = /\d+(?:[.,]\d+)?\s?(?:m²|m2|triệu|tr\b|đ\b|₫|%|km\b|người|phòng)/i;
  const numberOnlyValue = /^[\s\d.,:+\-–%$€£¥₫]*\d[\s\d.,:+\-–%$€£¥₫]*(?:đ|vnđ|vnd|tr|triệu|tỷ|k)?$/i;
  const swallowedNumbers = truncatedTexts
    .filter((item) => item.isSingleLine && (numberWithUnit.test(item.fullText.slice(item.visibleChars)) || numberOnlyValue.test(item.fullText)))
    .slice(0, 6)
    .map((item) => `hiding "${item.fullText.slice(item.visibleChars).trim().slice(0, 24)}" of "${item.fullText.slice(0, 32)}": ${item.element}`);

  if (isSweep) {
    return {
      autoScrolledAreas,
      viewportWidth,
      pageScrollWidth,
      hasHorizontalScroll: pageScrollWidth > viewportWidth + 1,
      overflowingElements: overflowingElements.slice(0, 3),
      clippedBlocks,
      wrappedControls,
      wrappedRows,
      tooShortTexts,
      swallowedNumbers,
    };
  }

  // 3. Sibling elements of same type with nearly equal height (1-4px difference): usually baseline gap
  //    of inline-block, stray border, uneven padding. Large difference is distinct content, ignore.
  const unevenSiblingGroups = [];
  for (const parent of allElements) {
    const groups = new Map();

    for (const child of parent.children) {
      if (!isVisible(child)) continue;
      // Strip single-side border classes from key: last cell in row missing border-r is still same type.
      const classKey = (child.getAttribute("class") || "").split(/\s+/).filter((className) => !/^border-[trblxy]$/.test(className)).join(" ");
      const key = `${child.tagName}.${classKey}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(child);
    }

    // Only compare containers with identical child structure: row with `py-1` badge is taller than plain text row, package item with 16px
    // title is taller than card with 14px title; these are distinct content, not baseline gap (false positive 2026-09-27,
    // description list in /components, /dashboard/settings/billing/states). Color classes stripped from key:
    // green badge and grey badge share structure.
    const splitByStructure = (siblings) => {
      const byStructure = new Map();
      for (const sibling of siblings) {
        const structure = getStructureSignature(sibling);
        if (!byStructure.has(structure)) byStructure.set(structure, []);
        byStructure.get(structure).push(sibling);
      }

      return [...byStructure.values()];
    };

    for (const siblings of [...groups.values()].flatMap(splitByStructure)) {
      if (siblings.length < 3) continue;

      const innerHeights = siblings.map((sibling) => {
        const style = getComputedStyle(sibling);

        return sibling.getBoundingClientRect().height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth);
      });
      const heightCounts = new Map();
      for (const height of innerHeights) heightCounts.set(Math.round(height), (heightCounts.get(Math.round(height)) || 0) + 1);
      const commonHeight = [...heightCounts.entries()].sort((first, second) => second[1] - first[1])[0][0];
      const nearMisses = innerHeights.filter((height) => Math.abs(height - commonHeight) >= 0.75 && Math.abs(height - commonHeight) <= 4);

      if (nearMisses.length > 0) {
        unevenSiblingGroups.push({
          element: describe(siblings[0]),
          count: siblings.length,
          commonHeight,
          otherHeights: [...new Set(nearMisses.map((height) => Math.round(height * 10) / 10))],
        });
      }
    }
  }

  // 4. Text in same column misaligned: grids sharing column container (header row + cell grid), each column compares
  //    first character edge across cells. Text not centered with both left and right edges misaligned by a few px indicates
  //    mixed alignment (e.g. day name left-aligned, date number centered in small circle).
  const gridsBySignature = new Map();
  for (const element of allElements) {
    const style = getComputedStyle(element);
    if (style.display !== "grid" || !isVisible(element) || element.children.length < 2) continue;

    const columnCount = style.gridTemplateColumns.split(" ").length;
    if (columnCount < 2) continue;

    const signature = `${Math.round(element.getBoundingClientRect().left)}|${Math.round(element.getBoundingClientRect().width)}|${columnCount}`;
    if (!gridsBySignature.has(signature)) gridsBySignature.set(signature, []);
    gridsBySignature.get(signature).push(element);
  }

  const misalignedColumns = [];
  for (const grids of gridsBySignature.values()) {
    const cellsByColumn = new Map();

    for (const grid of grids) {
      for (const cell of grid.children) {
        if (!isVisible(cell)) continue;
        const cellRect = cell.getBoundingClientRect();
        const textRect = getFirstTextRect(cell);
        if (!textRect || textRect.width === 0) continue;

        const columnKey = Math.round(cellRect.left);
        if (!cellsByColumn.has(columnKey)) cellsByColumn.set(columnKey, []);
        const edge = getBoxedTextEdge(textRect, cell);
        cellsByColumn.get(columnKey).push({
          cell,
          leftOffset: edge.left - cellRect.left,
          rightOffset: cellRect.right - edge.right,
          textLeftOffset: textRect.left - cellRect.left,
          textRightOffset: cellRect.right - textRect.right,
          isBoxed: edge !== textRect,
          centerDelta: textRect.left + textRect.width / 2 - (cellRect.left + cellRect.width / 2),
          text: textRect.text,
        });
      }
    }

    for (const cells of cellsByColumn.values()) {
      // Cells centered across entire cell (date picker calendar): text edge offset by length is correct, ignore.
      const startAlignedCells = cells.filter((item) => Math.abs(item.centerDelta) > 2);
      if (startAlignedCells.length < 3) continue;

      // Text in container with background: container edge or text edge matching column is acceptable. "VIP" pill aligns by
      // container edge; today's date number in `min-w-7` circle aligns text edge with day name (false positive 2026-09-27, monthly
      // calendar: "27" text edge matches "Sun" but circle edge misaligned by 6px).
      const plainCells = startAlignedCells.filter((item) => !item.isBoxed);
      if (plainCells.length > 0) {
        const plainLeft = plainCells.map((item) => item.leftOffset).sort((first, second) => first - second)[Math.floor(plainCells.length / 2)];
        const plainRight = plainCells.map((item) => item.rightOffset).sort((first, second) => first - second)[Math.floor(plainCells.length / 2)];
        for (const item of startAlignedCells) {
          if (!item.isBoxed) continue;
          if (Math.abs(item.textLeftOffset - plainLeft) < Math.abs(item.leftOffset - plainLeft)) item.leftOffset = item.textLeftOffset;
          if (Math.abs(item.textRightOffset - plainRight) < Math.abs(item.rightOffset - plainRight)) item.rightOffset = item.textRightOffset;
        }
      }

      const leftOffsets = startAlignedCells.map((item) => item.leftOffset);
      const rightOffsets = startAlignedCells.map((item) => item.rightOffset);
      const leftSpread = Math.max(...leftOffsets) - Math.min(...leftOffsets);
      const rightSpread = Math.max(...rightOffsets) - Math.min(...rightOffsets);

      if (leftSpread > 1.5 && leftSpread <= 8 && rightSpread > 1.5) {
        const leftmost = startAlignedCells.reduce((best, item) => (item.leftOffset < best.leftOffset ? item : best));
        const rightmost = startAlignedCells.reduce((best, item) => (item.leftOffset > best.leftOffset ? item : best));
        misalignedColumns.push({
          element: describe(startAlignedCells[0].cell.parentElement),
          leftSpread: Math.round(leftSpread * 10) / 10,
          example: `"${leftmost.text}" offset from cell edge ${leftmost.leftOffset.toFixed(1)}px, "${rightmost.text}" ${rightmost.leftOffset.toFixed(1)}px`,
        });
        break;
      }
    }
  }

  // 5. Tap target under 44px on touch screens. Small buttons with expanded hit target (::before covering 44px)
  //    hit elementFromPoint at 44px edge, so not flagged as error.
  const smallTapTargets = [];
  if (isMobile) {
    // scrollIntoView scrolls nested scroll containers (horizontal tables), window.scrollTo at loop end
    // does not restore them: subsequent screenshots showed table shifted right, losing name column (2026-09-27,
    // /dashboard/tasks at 375px). Record scroll offsets for all containers beforehand and restore afterwards.
    const scrolledContainers = [...document.querySelectorAll("*")]
      .filter((container) => container.scrollWidth > container.clientWidth || container.scrollHeight > container.clientHeight)
      .map((container) => ({ container, left: container.scrollLeft, top: container.scrollTop }));
    const interactiveElements = [...document.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="tab"], [role="checkbox"], [role="switch"], [role="menuitem"]')];

    for (const element of interactiveElements) {
      if (!isVisible(element) || element.closest("[inert], [aria-hidden='true']") || isWireframeChrome(element)) continue;
      // Tap targets inside sentences (links, `inline` buttons like "Clear search" in empty state, `empty-state.md`) are
      // exempt from target size by WCAG 2.5.8. Previously only exempted <a>: false positive 2026-09-30, clinic design system shadcn build.
      // `inline` buttons compute to `inline-block` in browser, recognized by adjacent plain text in same parent.
      const elementDisplay = getComputedStyle(element).display;
      const isInSentence = elementDisplay === "inline-block" && [...element.parentElement.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 1);
      if (elementDisplay === "inline" || isInSentence) continue;
      // Non-interactive to touch is not a tap target: range input layered beneath dual-thumb slider.
      if (getComputedStyle(element).pointerEvents === "none") continue;

      const rect = element.getBoundingClientRect();
      if (rect.width >= minTapSize && rect.height >= minTapSize) continue;
      // Input inside adequate-sized <label> (choice row min-h-11, I26): entire label is tap area. Input sits near
      // left edge so left test point falls outside; false positive 2026-09-27, radio at /dashboard/tasks/new.
      const hasLargeWrappingLabel = [...(element.labels || [])].some((label) => {
        const labelRect = label.getBoundingClientRect();

        return label.contains(element) && labelRect.width >= minTapSize && labelRect.height >= minTapSize;
      });
      if (hasLargeWrappingLabel) continue;

      element.scrollIntoView({ block: "center", inline: "center" });
      const centeredRect = element.getBoundingClientRect();
      // Off-screen elements (closed sliding sidebar) cannot be tapped by user, ignore.
      if (centeredRect.right <= 0 || centeredRect.left >= viewportWidth) continue;
      const centerX = centeredRect.left + centeredRect.width / 2;
      const centerY = centeredRect.top + centeredRect.height / 2;
      const reach = minTapSize / 2 - 1;
      const probePoints = [
        [centerX, centerY - reach],
        [centerX, centerY + reach],
        [centerX - reach, centerY],
        [centerX + reach, centerY],
      ];
      const isEachProbeHit = probePoints.every(([pointX, pointY]) => {
        const hitElement = document.elementFromPoint(pointX, pointY);

        if (!hitElement) return false;
        // Checkbox, radio: clicking label also activates input (I26).
        const isInsideLabel = [...(element.labels || [])].some((label) => label.contains(hitElement));

        return element === hitElement || element.contains(hitElement) || isInsideLabel;
      });

      if (!isEachProbeHit) smallTapTargets.push({ element: describe(element), size: `${Math.round(rect.width)}×${Math.round(rect.height)}` });
    }

    for (const { container, left, top } of scrolledContainers) {
      container.scrollLeft = left;
      container.scrollTop = top;
    }
    window.scrollTo(0, 0);
  }

  // 6. Punctuation wrapped to start of line (". Switch account", "· 3 days"): usually caused by preceding word
  //    being inline-block (EmailText, badge) permitting browser to break immediately before punctuation.
  const orphanPunctuation = [];
  const punctuationPattern = /[.,;:!?)·»”…]/;
  const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let previousCharRect = null;

  while (textWalker.nextNode() && orphanPunctuation.length < 10) {
    const textNode = textWalker.currentNode;
    const parent = textNode.parentElement;
    // Do not ignore aria-hidden: separator " · " is often aria-hidden but visually rendered; wrapping to line start
    // is a visual defect ("· Cancel", caught 2026-09-27 at /dashboard/profile/states 375px).
    if (!parent || !isVisible(parent) || parent.closest("script, style")) continue;
    // Text in code / pre ignored, but still counts as "preceding word" for trailing punctuation: ignoring completely
    // caused comma after `DH-2026-004821` to be compared against line above (false positive 2026-09-27, AI assistant 375px).
    if (parent.closest("code, pre")) {
      const lastIndex = textNode.data.trimEnd().length - 1;
      if (lastIndex >= 0) {
        const lastRange = document.createRange();
        lastRange.setStart(textNode, lastIndex);
        lastRange.setEnd(textNode, lastIndex + 1);
        const lastRect = lastRange.getBoundingClientRect();
        if (lastRect.width) previousCharRect = lastRect;
      }
      continue;
    }
    // Character standing alone in dedicated block ("!" in error step, `flex size-8`) is an icon, not trailing
    // punctuation of previous text (false positive 2026-09-27, stepper at /components). Inline " · " is still checked.
    if (/^[.,;:!?)·»”…]+$/.test(parent.textContent.trim()) && /^(block|flex|grid)$/.test(getComputedStyle(parent).display)) continue;

    for (let index = 0; index < textNode.length; index++) {
      const character = textNode.data[index];
      if (/\s/.test(character)) continue;

      const charRange = document.createRange();
      charRange.setStart(textNode, index);
      charRange.setEnd(textNode, index + 1);
      const charRect = charRange.getBoundingClientRect();
      if (!charRect.width) continue;

      const isOnNewLine = previousCharRect && charRect.top >= previousCharRect.bottom - 2 && charRect.left < previousCharRect.left;
      // Punctuation inside contiguous string ("…toan" / ".tong@" in email, "1.284") is intentional break, not
      // punctuation: count only punctuation at end of word (followed by whitespace or end of block).
      // "." in EmailText is its own text node: subsequent character is in next node.
      let nextCharacter = textNode.data[index + 1];
      if (nextCharacter === undefined) {
        const peekWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        peekWalker.currentNode = textNode;
        nextCharacter = peekWalker.nextNode()?.data[0];
      }
      const isInsideToken = /[.,:]/.test(character) && nextCharacter !== undefined && !/\s/.test(nextCharacter);
      if (punctuationPattern.test(character) && isOnNewLine && !isInsideToken) {
        const lineText = textNode.data.slice(index, index + 30).trim();
        orphanPunctuation.push({ lineStart: lineText, element: describe(parent.closest("p, li, div, span") || parent) });
      }

      previousCharRect = charRect;
    }
  }

  // 6b. Orphan word on last line (`T10`): text block of 2-3 lines where final line has only one word ("CRM", "new").
  //     Applies only to leaf text blocks (no child elements), without `text-pretty` / `text-balance`, unclipped by `line-clamp`.
  //     Occurred 2026-10-01: task board at 375px, task names had `line-clamp-2` per list row spec but spec omitted
  //     `text-pretty`, 6/11 names left orphan word on line 2.
  const orphanWords = [];
  for (const block of document.querySelectorAll("p, h1, h2, h3, h4, h5, li, span, a, label, dd, dt, td")) {
    if (orphanWords.length >= 10 || block.children.length > 0 || !isVisible(block)) continue;
    const text = block.textContent.replace(/\s+/g, " ").trim();
    const lastSpace = text.lastIndexOf(" ");
    if (text.length < 12 || lastSpace < 0) continue;
    const style = getComputedStyle(block);
    if (/pretty|balance/.test(`${style.textWrapStyle || ""} ${style.textWrap || ""}`) || style.whiteSpace === "nowrap") continue;
    if (block.scrollHeight > block.clientHeight + 1 && style.overflow !== "visible") continue;
    const textNode = block.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) continue;
    const range = document.createRange();
    range.selectNodeContents(textNode);
    const lineTops = new Set([...range.getClientRects()].filter((rect) => rect.width > 2).map((rect) => Math.round(rect.top / 4)));
    if (lineTops.size < 2 || lineTops.size > 3) continue;
    const rawText = textNode.data;
    const rawLastSpace = rawText.trimEnd().lastIndexOf(" ");
    const wordRange = document.createRange();
    wordRange.setStart(textNode, rawLastSpace + 1);
    wordRange.setEnd(textNode, rawText.trimEnd().length);
    const beforeRange = document.createRange();
    beforeRange.setStart(textNode, Math.max(0, rawLastSpace - 1));
    beforeRange.setEnd(textNode, rawLastSpace);
    const wordRect = wordRange.getBoundingClientRect();
    const beforeRect = beforeRange.getBoundingClientRect();
    if (wordRect.width && beforeRect.width && wordRect.top >= beforeRect.bottom - 2 && wordRect.width < block.getBoundingClientRect().width * 0.25) {
      orphanWords.push(`"${text.slice(0, 40)}${text.length > 40 ? "…" : ""}" orphaned "${text.slice(lastSpace + 1)}" on last line: ${describe(block)}`);
    }
  }

  // 7. Input misaligned with full-width button in same form / dialog: on narrow screens buttons stack
  //    full width, while input sits inside text column indented after icon (confirm dialog with retype name field: 239px input at
  //    x=96, 295px button at x=40, measured 2026-09-26). Buttons auto-sized to text (wide viewports) not compared.
  const misalignedFields = [];
  const fieldContainers = document.querySelectorAll("form, dialog, [role='dialog'], [role='alertdialog']");

  for (const container of fieldContainers) {
    if (!isVisible(container)) continue;

    const containerWidth = container.getBoundingClientRect().width;
    const wideButtons = [...container.querySelectorAll("button")].filter(
      (button) => isVisible(button) && button.getBoundingClientRect().width >= containerWidth * 0.6,
    );
    if (wideButtons.length === 0) continue;

    const buttonRect = wideButtons[0].getBoundingClientRect();
    const fields = [...container.querySelectorAll("input:not([type='hidden']):not([type='checkbox']):not([type='radio']), textarea, select")];

    for (const field of fields) {
      if (!isVisible(field)) continue;
      // Row of equal-sized inputs (six-cell OTP 40–57px) does not need to match button edges (false positive 2026-09-26).
      const siblingFields = [...(field.parentElement?.parentElement || field.parentElement).querySelectorAll("input")].filter(isVisible);
      if (siblingFields.length >= 3 && siblingFields.every((sibling) => Math.abs(sibling.getBoundingClientRect().width - field.getBoundingClientRect().width) <= 2)) continue;

      // Borderless input inside bordered container (multi-email input: chips + input in one container): user-visible
      // edge is container edge (false positive 2026-09-27, /components).
      let visualBox = field;
      for (let node = field; node && node !== container; node = node.parentElement) {
        if ((parseFloat(getComputedStyle(node).borderLeftWidth) || 0) >= 1) {
          visualBox = node;
          break;
        }
      }
      const fieldRect = visualBox.getBoundingClientRect();
      const leftGap = Math.round(Math.abs(fieldRect.left - buttonRect.left));
      const rightGap = Math.round(Math.abs(fieldRect.right - buttonRect.right));
      if (leftGap <= 4 && rightGap <= 4) continue;

      misalignedFields.push({
        field: `${Math.round(fieldRect.width)}px at x=${Math.round(fieldRect.left)}`,
        button: `${Math.round(buttonRect.width)}px at x=${Math.round(buttonRect.left)}`,
        element: describe(container),
      });
      break;
    }
  }

  // 8. Separator spacing (›, /) uneven on either side: measured from glyph stroke to adjacent text or icon stroke, not
  //    bounding box. "…" size-8 button in breadcrumbs left 22px on each side while text was 12px from separator
  //    (measured 2026-09-26). Separator is aria-hidden svg outside link, button; pagination button icons
  //    are excluded.
  function getSvgInkRect(svg) {
    const rect = svg.getBoundingClientRect();
    const box = svg.getBBox();
    const scale = rect.width / (svg.viewBox.baseVal?.width || rect.width);

    return { left: rect.left + box.x * scale, right: rect.left + (box.x + box.width) * scale, top: rect.top };
  }

  function getItemInkRect(item) {
    const textNodes = [];
    const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) if (walker.currentNode.textContent.trim()) textNodes.push(walker.currentNode);

    if (textNodes.length === 0) {
      const icon = item.querySelector("svg");

      return icon ? getSvgInkRect(icon) : null;
    }

    const range = document.createRange();
    range.setStartBefore(textNodes[0]);
    range.setEndAfter(textNodes[textNodes.length - 1]);
    const textRect = range.getBoundingClientRect();
    // Truncated text: stroke ends at box boundary, not at end of full string.
    const itemRect = item.getBoundingClientRect();

    return { left: Math.max(textRect.left, itemRect.left), right: Math.min(textRect.right, itemRect.right), top: itemRect.top };
  }

  // Genuine separators only (›, ‹, /). Priority icons in kanban cards are also aria-hidden svgs in a
  // <ul>, measuring them like › yielded "150–178px gap" (false positive 2026-09-27, /dashboard/tasks/states at 375px).
  const isSeparatorIcon = (svg) => /lucide-(chevron-(right|left)|slash)\b/.test(svg.getAttribute("class") || "");
  const separatorRows = new Set();
  for (const svg of document.querySelectorAll("svg[aria-hidden='true']")) {
    if (svg.closest("a, button, [role='button']") || !isVisible(svg) || !isSeparatorIcon(svg)) continue;
    const row = svg.closest("ol, ul, nav");
    if (row) separatorRows.add(row);
  }

  const unevenSeparatorRows = [];
  for (const row of separatorRows) {
    const units = [...row.querySelectorAll("svg[aria-hidden='true'], a, button")]
      .filter((element) => isVisible(element) && !element.parentElement.closest("a, button"))
      .filter((element) => element.tagName.toLowerCase() !== "svg" || isSeparatorIcon(element))
      .map((element) => {
        const isSeparator = element.tagName.toLowerCase() === "svg";

        return { isSeparator, ink: isSeparator ? getSvgInkRect(element) : getItemInkRect(element) };
      })
      .filter((unit) => unit.ink);

    const gaps = [];
    for (let index = 1; index < units.length; index++) {
      const previous = units[index - 1];
      const current = units[index];
      const isSameLine = Math.abs(current.ink.top - previous.ink.top) < 12;
      if (isSameLine && (previous.isSeparator || current.isSeparator)) gaps.push(current.ink.left - previous.ink.right);
    }
    if (gaps.length < 3) continue;

    const smallestGap = Math.min(...gaps);
    const largestGap = Math.max(...gaps);
    if (largestGap - smallestGap > 4) {
      unevenSeparatorRows.push({
        element: describe(row),
        gaps: `${smallestGap.toFixed(1)}–${largestGap.toFixed(1)}px`,
      });
    }
  }


  // 10. Number label overlaps chart line: number rendered next to point with line intersecting text (measured 2026-09-27,
  //     revenue report: final point lower than neighbour, number placed above point sat directly on connecting segment).
  //     Samples points along each line in screen coordinates to check if any fall inside label bounding box
  //     sharing the plot area (HTML text overlaid on svg, or <text> inside library svg).
  const overlappedChartLabels = [];
  const outsideChartLabels = [];
  for (const svg of document.querySelectorAll("svg")) {
    const svgRect = svg.getBoundingClientRect();
    if (svgRect.width < 120 || svgRect.height < 60 || !isVisible(svg)) continue;

    const lines = [...svg.querySelectorAll("polyline, path, line")].filter((shape) => {
      const style = getComputedStyle(shape);

      return style.stroke !== "none" && parseFloat(style.strokeWidth) > 0 && (style.fill === "none" || shape.tagName === "polyline");
    });
    if (lines.length === 0) continue;

    const samplePoints = [];
    for (const shape of lines) {
      const matrix = shape.getScreenCTM();
      const totalLength = shape.getTotalLength?.() ?? 0;
      if (!matrix || totalLength === 0) continue;

      for (let step = 0; step <= 400; step++) {
        const point = shape.getPointAtLength((totalLength * step) / 400).matrixTransform(matrix);
        samplePoints.push(point);
      }
    }

    const container = svg.parentElement;
    const labelNodes = [...container.querySelectorAll("*")].filter((node) => {
      if (node === svg || (svg.contains(node) && node.tagName.toLowerCase() !== "text")) return false;
      const ownText = [...node.childNodes].some((child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim());

      return ownText && isVisible(node);
    });

    // Nested text in label ("Today ·" in "Today · 6.8M") evaluated via outermost label.
    const outerLabelNodes = labelNodes.filter((node) => !labelNodes.some((other) => other !== node && other.contains(node)));

    for (const labelNode of outerLabelNodes) {
      const range = document.createRange();
      range.selectNodeContents(labelNode);
      const textRect = range.getBoundingClientRect();
      const isInsidePlot = textRect.bottom > svgRect.top && textRect.top < svgRect.bottom;
      if (!isInsidePlot) continue;

      // Label protrudes outside plot area: space below 0-line belongs to axis labels; numbers falling there read as
      // a second axis label (measured 2026-09-27: "Today · 6.8M" 16px below bottom, 9px from "27/09").
      const outsideBy = Math.max(svgRect.top - textRect.top, textRect.bottom - svgRect.bottom);
      if (outsideBy > 2) {
        outsideChartLabels.push(`"${labelNode.textContent.trim().slice(0, 24)}" protrudes ${Math.round(outsideBy)}px: ${describe(labelNode)}`);
      }

      const hitPoint = samplePoints.find(
        (point) => point.x > textRect.left + 1 && point.x < textRect.right - 1 && point.y > textRect.top + 1 && point.y < textRect.bottom - 1,
      );
      if (hitPoint) overlappedChartLabels.push(`"${labelNode.textContent.trim().slice(0, 24)}": ${describe(labelNode)}`);
    }
  }

  // 10b. Count badge covers icon: `absolute` dot or count on icon-only button (bell, cart) covering >= 40%
  //      of icon renders icon unrecognizable (missed 2026-09-30, clinic schedule: size-4 "3" at top-1.5
  //      right-1.5 covered nearly half of 20px bell, leaving only the clapper; caught visually in screenshots).
  const iconCoveringBadges = [];
  for (const button of document.querySelectorAll("button, a[href], [role='button']")) {
    if (iconCoveringBadges.length >= 4 || !isVisible(button)) continue;
    const icon = [...button.querySelectorAll("svg")].find((svg) => svg.getBoundingClientRect().width >= 12);
    if (!icon) continue;
    const iconRect = icon.getBoundingClientRect();
    const badge = [...button.querySelectorAll("span, div")].find((node) => {
      const rect = node.getBoundingClientRect();

      return getComputedStyle(node).position === "absolute" && !node.contains(icon) && rect.width > 0 && rect.width <= 28 && rect.height <= 28 && isVisible(node);
    });
    if (!badge) continue;
    const badgeRect = badge.getBoundingClientRect();
    const overlapWidth = Math.max(0, Math.min(iconRect.right, badgeRect.right) - Math.max(iconRect.left, badgeRect.left));
    const overlapHeight = Math.max(0, Math.min(iconRect.bottom, badgeRect.bottom) - Math.max(iconRect.top, badgeRect.top));
    const coveredRatio = (overlapWidth * overlapHeight) / (iconRect.width * iconRect.height);
    if (coveredRatio >= 0.4) {
      iconCoveringBadges.push(`badge ${Math.round(badgeRect.width)}×${Math.round(badgeRect.height)}px covers ${Math.round(coveredRatio * 100)}% of ${Math.round(iconRect.width)}px icon: ${describe(button)}`);
    }
  }

  // 11. Table scrolls horizontally with primary identifier column scrolling away (R9): scrolling loses row identity,
  //     leaving remaining cells unattributable. First column must be `sticky` and <= ~40% frame width; below `sm` admin
  //     tables become row lists (occurred 2026-09-27: 832px task group table in 341px container at
  //     375px, unpinned, scrolling lost both group and task names).
  const unpinnedScrollTables = [];
  for (const table of document.querySelectorAll("table")) {
    if (!isVisible(table)) continue;
    let scroller = table.parentElement;
    while (scroller && scroller !== document.body && !["auto", "scroll"].includes(getComputedStyle(scroller).overflowX)) scroller = scroller.parentElement;
    if (!scroller || scroller === document.body || scroller.scrollWidth <= scroller.clientWidth + 1) continue;

    const firstBodyCell = [...table.querySelectorAll("tbody tr")]
      .map((row) => row.cells[0])
      .find((cell) => cell && cell.colSpan === 1 && isVisible(cell));
    if (!firstBodyCell) continue;

    const isPinned = getComputedStyle(firstBodyCell).position === "sticky";
    const pinnedShare = firstBodyCell.getBoundingClientRect().width / scroller.clientWidth;
    const size = `table ${table.scrollWidth}px inside frame ${scroller.clientWidth}px`;

    if (!isPinned) unpinnedScrollTables.push(`${size}, first column unpinned${isMobile ? " (under sm: becomes row list)" : ""}: ${describe(table)}`);
    else if (pinnedShare > 0.4) unpinnedScrollTables.push(`${size}, pinned column occupies ${Math.round(pinnedShare * 100)}% of frame: ${describe(table)}`);
    // Pinned, but last column (row ⋯ button) still sits outside container until scrolled: medium containers must
    // hide secondary columns first (occurred 2026-09-27, 960px customer table in 718px container at 768 and 1024px).
    const lastCell = firstBodyCell.parentElement.cells[firstBodyCell.parentElement.cells.length - 1];
    if (isPinned && lastCell.getBoundingClientRect().left >= scroller.getBoundingClientRect().right) {
      unpinnedScrollTables.push(`${size}, last column ("${(lastCell.textContent.trim() || lastCell.querySelector("[aria-label]")?.getAttribute("aria-label") || "").slice(0, 24)}") sits outside frame until scrolled, hide secondary columns: ${describe(table)}`);
    }
  }

  // Actual line count of a text block: counts line box tops via Range, not inferred from height or tag count.
  // Declared as function shared by 11b, 11c, and 18j.
  function countTextLines(element) {
    const tops = new Set();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim() || isScreenReaderOnly(node.parentElement, element)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) if (rect.width > 2 && rect.height > 6) tops.add(Math.round(rect.top / 4));
    }

    return tops.size;
  }

  // `sr-only` text (1px box, overflow hidden) is not a visible line: user name next to hidden avatar in
  // medium container sat off-center, counting it resulted in two lines (false positive 2026-10-01, Assignee column at 768px).
  function isScreenReaderOnly(node, root) {
    for (let current = node; current && current !== root.parentElement; current = current.parentElement) {
      const box = current.getBoundingClientRect();
      if (box.width <= 1 && box.height <= 1 && getComputedStyle(current).overflow !== "visible") return true;
    }

    return false;
  }

  // 11b. Table text column forced to wrap while table does not scroll: other columns `nowrap` claim space, text / service
  //      column squeezed to ~100px, half the rows wrap to two lines with jagged row heights. Medium containers must hide
  //      secondary columns via `@container` on card (`layouts/app.md`, "Hide secondary columns in medium frames"), not via viewport
  //      (occurred 2026-09-30, Treatment table in patient record at 1280px: Treatment column 101px, 4/6 rows wrapped,
  //      because Doctor column hid at `lg:` while 22rem right column consumed space).
  const squeezedTableColumns = [];
  for (const table of document.querySelectorAll("table")) {
    if (!isVisible(table)) continue;
    const bodyRows = [...table.querySelectorAll("tbody tr")].filter((row) => isVisible(row) && row.cells.length > 1);
    if (bodyRows.length < 3) continue;
    const visibleCellsPerRow = bodyRows.map((row) => [...row.cells].filter(isVisible));
    const columnCount = visibleCellsPerRow[0].length;
    if (columnCount < 4 || visibleCellsPerRow.some((cells) => cells.length !== columnCount)) continue;

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
      const cells = visibleCellsPerRow.map((cells) => cells[columnIndex]);
      if (!cells[0].textContent.trim() || getComputedStyle(cells[0]).whiteSpace === "nowrap") continue;
      const wrappedCount = cells.filter((cell) => countTextLines(cell) > 1).length;
      const columnWidth = Math.round(cells[0].getBoundingClientRect().width);
      if (wrappedCount >= 2 && wrappedCount * 2 >= cells.length && columnWidth < 200) {
        const header = table.querySelectorAll("thead th")[columnIndex]?.textContent.trim() || `column ${columnIndex + 1}`;
        squeezedTableColumns.push(`column "${header.slice(0, 24)}" width ${columnWidth}px, ${wrappedCount}/${cells.length} rows wrapped to two lines, ${columnCount}-column table: ${describe(table)}`);
      }
    }
  }

  // 11c. Two-column label-value pair in narrow block: ~7rem label column consumes one third of width, email breaks to
  //      three lines, address to four. Containers under 384px stack label above value; adapt layout based on
  //      `<dl>` width (`@container`), not viewport (`components/description-list.md`). Occurred 2026-09-30,
  //      Contact card in patient record right column: 310px `<dl>`, `sm:grid-cols-[7rem_…]` triggered because screen was 1440px.
  const crampedDescriptionLists = [];
  for (const list of document.querySelectorAll("dl")) {
    const listWidth = list.getBoundingClientRect().width;
    if (!isVisible(list) || listWidth >= 384) continue;
    const pairs = [...list.querySelectorAll("dt")].map((term) => [term, term.nextElementSibling]).filter(([, value]) => value?.tagName === "DD" && isVisible(value));
    const sideBySidePairs = pairs.filter(([term, value]) => value.getBoundingClientRect().left >= term.getBoundingClientRect().right - 1 && Math.abs(value.getBoundingClientRect().top - term.getBoundingClientRect().top) < 8);
    if (sideBySidePairs.length < 2) continue;
    const longest = Math.max(...sideBySidePairs.map(([, value]) => countTextLines(value)));
    if (longest >= 3) crampedDescriptionLists.push(`<dl> ${Math.round(listWidth)}px, ${sideBySidePairs.length} label-value pairs side-by-side, longest value ${longest} lines: ${describe(list)}`);
  }

  // 12. Grid-arranged radio / checkbox groups (multi-column and multi-row): reads in Z-pattern, ordinal scales
  //     like priority read "Low, Medium / High, Urgent" (occurred 2026-09-27, task creation
  //     form at 375px). Arrange into a single row or single column.
  const gridChoiceGroups = [];
  for (const group of document.querySelectorAll("fieldset, [role='radiogroup'], [role='group']")) {
    const choices = [...group.querySelectorAll("input[type='radio'], input[type='checkbox'], [role='radio']")].filter(isVisible);
    if (choices.length < 3) continue;

    const lefts = new Set(choices.map((choice) => Math.round(choice.getBoundingClientRect().left / 4)));
    const tops = new Set(choices.map((choice) => Math.round(choice.getBoundingClientRect().top / 4)));
    if (lefts.size > 1 && tops.size > 1) {
      const legend = group.querySelector("legend")?.textContent.trim() || describe(group);
      gridChoiceGroups.push(`${choices.length} choices arranged into ${lefts.size} columns × ${tops.size} rows: "${legend.slice(0, 40)}"`);
    }
  }

  // 13. Metric stat row (each tile a dt/dd pair) where numbers are misaligned: a wrapped label pushes down
  //     that tile's number (occurred 2026-09-27, customer details at 1280px, "3" 16px lower than "12.3M").
  const unevenStatRows = [];
  for (const statGroup of document.querySelectorAll("dl")) {
    const tiles = [...statGroup.children].filter((tile) => isVisible(tile) && tile.querySelector(":scope > dt") && tile.querySelector(":scope > dd"));
    if (tiles.length < 2) continue;

    const tilesByRow = new Map();
    for (const tile of tiles) {
      const rowKey = Math.round(tile.getBoundingClientRect().top);
      if (!tilesByRow.has(rowKey)) tilesByRow.set(rowKey, []);
      tilesByRow.get(rowKey).push(tile);
    }
    for (const rowTiles of tilesByRow.values()) {
      if (rowTiles.length < 2) continue;
      const valueTops = rowTiles.map((tile) => tile.querySelector(":scope > dd").getBoundingClientRect().top);
      const spread = Math.max(...valueTops) - Math.min(...valueTops);
      if (spread > 2) {
        unevenStatRows.push(`numbers misaligned by ${Math.round(spread)}px across ${rowTiles.length} cells in same row: ${describe(statGroup)}`);
        break;
      }
    }
  }

  // 14. Currency amount with unit wraps across lines ("128,900,000" / "₫"): measured on container enclosing both amount and unit,
  //     checking if string spans two lines (occurred 2026-09-27, order modal at 375px, `T16`).
  const brokenMoney = [];
  // Measure only elements whose entire content is a currency amount ("128,900,000 đ", "0 ₫", optionally with "/month");
  // container holding both label and amount wrapping to multiple lines is intentional design.
  const moneyOnlyPattern = /^\s*-?\d[\d.,]*\s*(đ|₫|VND)(\s*\/\s*[\p{L}]+)?\s*$/u;
  for (const holder of document.querySelectorAll("dd, td, p, span, div, strong")) {
    if (!isVisible(holder) || !moneyOnlyPattern.test(holder.textContent)) continue;
    if (holder.parentElement && moneyOnlyPattern.test(holder.parentElement.textContent)) continue;
    const range = document.createRange();
    range.selectNodeContents(holder);
    // Two fragments share line when vertical spans overlap: 30px amount and 14px "/month" sharing baseline have
    // different bottoms; grouping by bottom caused false positives (2026-09-27, pricing page at 375px).
    const pieces = [...range.getClientRects()].filter((rect) => rect.width > 0).sort((first, second) => first.top - second.top);
    let lineCount = pieces.length > 0 ? 1 : 0;
    let lineBottom = pieces[0]?.bottom ?? 0;
    for (const piece of pieces.slice(1)) {
      if (piece.top >= lineBottom - 2) lineCount++;
      lineBottom = Math.max(lineBottom, piece.bottom);
    }
    if (lineCount > 1) brokenMoney.push(`"${holder.textContent.trim().slice(0, 24)}": ${describe(holder)}`);
  }

  // 15. Text contrast: text color blended over actual background behind it. Colors read via canvas so Tailwind v4
  //     oklch normalizes to rgb. Background sampled from layer directly beneath text (elementsFromPoint), then walks
  //     up ancestors to solid background. Gradient parents evaluated at worst-case stop; text over images, video,
  //     or non-parent gradient overlays cannot be measured and are counted only. Disabled
  //     controls are exempt under WCAG, ignore.
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = 1;
  colorCanvas.height = 1;
  const colorContext = colorCanvas.getContext("2d", { willReadFrequently: true });

  function readColor(cssColor) {
    colorContext.clearRect(0, 0, 1, 1);
    colorContext.fillStyle = "rgba(0, 0, 0, 0)";
    colorContext.fillStyle = cssColor;
    colorContext.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = colorContext.getImageData(0, 0, 1, 1).data;

    return { red, green, blue, alpha: alpha / 255 };
  }

  function blendColors(top, bottom) {
    const alpha = top.alpha + bottom.alpha * (1 - top.alpha);
    if (alpha === 0) return { red: 0, green: 0, blue: 0, alpha: 0 };
    const mixChannel = (channel) => (top[channel] * top.alpha + bottom[channel] * bottom.alpha * (1 - top.alpha)) / alpha;

    return { red: mixChannel("red"), green: mixChannel("green"), blue: mixChannel("blue"), alpha };
  }

  function readLuminance(color) {
    const toLinear = (channel) => {
      const value = channel / 255;

      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };

    return 0.2126 * toLinear(color.red) + 0.7152 * toLinear(color.green) + 0.0722 * toLinear(color.blue);
  }

  function readContrastRatio(first, second) {
    const [lighter, darker] = [readLuminance(first), readLuminance(second)].sort((first, second) => second - first);

    return (lighter + 0.05) / (darker + 0.05);
  }

  function toHex(color) {
    return `#${[color.red, color.green, color.blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
  }

  const whiteCanvas = { red: 255, green: 255, blue: 255, alpha: 1 };

  // Collect background layers from element up to first solid layer. Returns null on images or gradients.
  function readAncestorBackdrop(element) {
    const layers = [];

    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage !== "none") return null;
      const color = readColor(style.backgroundColor);
      if (color.alpha > 0) layers.push(color);
      if (color.alpha >= 0.99) break;
    }

    return layers.reverse().reduce((bottom, top) => blendColors(top, bottom), whiteCanvas);
  }

  // Colors of stops for pure gradient backgrounds; returns null if background contains an image. Computed style converts colors to rgb().
  function readGradientStops(backgroundImage) {
    if (backgroundImage === "none") return [];
    if (/url\(|image-set\(|element\(|cross-fade\(/.test(backgroundImage)) return null;

    return [...backgroundImage.matchAll(/(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^()]*\)/g)].map((match) => readColor(match[0]));
  }

  // Like `readAncestorBackdrop` but traverses gradient ancestors: each stop blended over layer's own
  // background color represents a possible background beneath text; returns all to evaluate worst case. Previously,
  // gradients skipped measurement: dark app with glow on `body` skipped all text, missing 2.91:1 timestamp
  // (2026-09-30, inventory pilot; caught on visual review).
  function readAncestorBackdrops(element) {
    const layers = [];

    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      const stops = readGradientStops(style.backgroundImage);
      if (!stops) return null;
      const color = readColor(style.backgroundColor);
      const variants = stops.length > 0 ? [color, ...stops.map((stop) => blendColors(stop, color))] : [color];
      if (variants.some((variant) => variant.alpha > 0)) layers.push(variants);
      if (variants.every((variant) => variant.alpha >= 0.99)) break;
    }

    let backdrops = [whiteCanvas];
    for (const variants of layers.reverse()) {
      const blended = backdrops.flatMap((bottom) => variants.map((top) => blendColors(top, bottom)));
      backdrops = [...new Map(blended.map((backdrop) => [toHex(backdrop), backdrop])).values()].slice(0, 24);
    }

    return backdrops;
  }

  // Actual background beneath text: absolutely positioned overlays (panels, cover images) are not DOM ancestors of text.
  // Returns list of possible backdrops (multiple if parent has gradient), or null when unmeasurable.
  function readBackdrop(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const isInViewport = centerX >= 0 && centerY >= 0 && centerX < innerWidth && centerY < innerHeight;
    if (!isInViewport) return readAncestorBackdrops(element);

    // Layers ABOVE text (fixed navbar covering text during screenshot) are not text backdrops: evaluate only
    // layers beneath text in stacking order. Avoids measuring green button as 1:1 when white bottom bar covered button
    // (2026-09-27, phase 2 pilot). Completely occluded text falls back to DOM ancestors.
    const stack = document.elementsFromPoint(centerX, centerY);
    const textIndex = stack.findIndex((layer) => layer === element || element.contains(layer));
    if (textIndex === -1) return readAncestorBackdrops(element);

    // Non-parent gradient layers (overlay on cover photo) still skip measurement: photo sits alongside it, not ancestor.
    for (const layer of stack.slice(textIndex)) {
      if (layer === element || element.contains(layer)) continue;
      if (layer.contains(element)) break;
      if (["IMG", "VIDEO", "CANVAS", "svg"].includes(layer.tagName) || getComputedStyle(layer).backgroundImage !== "none") return null;
      if (readColor(getComputedStyle(layer).backgroundColor).alpha > 0) return readAncestorBackdrops(layer);
    }

    return readAncestorBackdrops(element);
  }

  function readOpacityChain(element) {
    let opacity = 1;
    for (let node = element; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);

    return opacity;
  }

  const lowContrastTexts = new Map();
  let unmeasuredContrastCount = 0;

  function checkContrast(element, cssColor, sample) {
    const backdrops = readBackdrop(element);
    if (!backdrops) {
      unmeasuredContrastCount++;
      return;
    }

    const style = getComputedStyle(element);
    const textColor = readColor(cssColor);
    textColor.alpha *= readOpacityChain(element);
    const fontSize = parseFloat(style.fontSize);
    const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && Number(style.fontWeight) >= 700);
    const requiredRatio = isLargeText ? 3 : 4.5;
    // Gradient backgrounds yield multiple possible backdrops: score against worst case.
    const [{ backdrop, shownColor, ratio }] = backdrops
      .map((candidate) => {
        const blendedText = blendColors(textColor, candidate);

        return { backdrop: candidate, shownColor: blendedText, ratio: readContrastRatio(blendedText, candidate) };
      })
      .sort((first, second) => first.ratio - second.ratio);
    if (ratio >= requiredRatio) return;

    const key = `${toHex(shownColor)}|${toHex(backdrop)}|${element.tagName}.${element.getAttribute("class") || ""}`;
    if (!lowContrastTexts.has(key)) {
      lowContrastTexts.set(key, {
        ratio,
        line: `${ratio.toFixed(2)}:1, requires ${requiredRatio}:1, text ${toHex(shownColor)} on background ${toHex(backdrop)} "${sample}": ${describe(element)}`,
      });
    }
  }

  // Disabled input labels dimming with input is intentional (choice-controls.md, Disabled table); WCAG exempts disabled controls.
  function isLabelOfDisabledControl(element) {
    const labelControl = element.closest("label")?.control;

    return Boolean(labelControl?.matches(":disabled, [aria-disabled='true']"));
  }

  for (const element of allElements) {
    if (element.closest(":disabled, [aria-disabled='true']") || isLabelOfDisabledControl(element) || !isVisible(element)) continue;
    const ownText = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent.trim()).join(" ").trim();
    if (ownText) checkContrast(element, getComputedStyle(element).color, ownText.slice(0, 24));

    const isEmptyField = (element.tagName === "INPUT" || element.tagName === "TEXTAREA") && element.placeholder && !element.value;
    if (isEmptyField) checkContrast(element, getComputedStyle(element, "::placeholder").color, `placeholder: ${element.placeholder.slice(0, 20)}`);
  }

  const sortedLowContrast = [...lowContrastTexts.values()].sort((first, second) => first.ratio - second.ratio);

  // 16. Declared container border invisible: inner background matches outer background, border matches both, causing
  //     container to dissolve into background (chat box with page background + border lighter than background, 2026-09-27, pilot revision).
  const channelDistance = (first, second) => Math.max(Math.abs(first.red - second.red), Math.abs(first.green - second.green), Math.abs(first.blue - second.blue));
  const invisibleFrames = [];
  for (const element of allElements) {
    if (invisibleFrames.length >= 6) break;
    const style = getComputedStyle(element);
    if (!(parseFloat(style.borderTopWidth) > 0) || style.borderTopStyle === "none" || style.boxShadow !== "none" || !isVisible(element)) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width * rect.height < 20000) continue;
    const outside = element.parentElement ? readAncestorBackdrop(element.parentElement) : whiteCanvas;
    const inside = readAncestorBackdrop(element);
    if (!outside || !inside) continue;
    const border = blendColors(readColor(style.borderTopColor), outside);
    if (channelDistance(inside, outside) <= 4 && channelDistance(border, outside) <= 4 && channelDistance(border, inside) <= 4) {
      invisibleFrames.push(`border ${toHex(border)}, inside bg ${toHex(inside)}, outside bg ${toHex(outside)}: ${describe(element)}`);
    }
  }

  // 16c. Horizontal divider line sinks into background: single-edge `border-b`/`border-t`, or 1px inset bottom shadow (underline
  //      tab rail divider), darker than adjacent background by under 8 levels. On white card `--border` #f7f7f8 differs by exactly 8;
  //      on grey page background use `--border-strong` (`M14`). Occurred 2026-10-05, admin tab rail:
  //      divider #efefef on page background #f3f4f6 differed by 7, reported completely invisible.
  const faintLines = [];
  for (const element of allElements) {
    if (faintLines.length >= 6) break;
    const style = getComputedStyle(element);
    if (!isVisible(element)) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width < 160) continue;
    let lineColor = null;
    const hasBottomOnly = parseFloat(style.borderBottomWidth) > 0 && style.borderBottomStyle !== "none" && !(parseFloat(style.borderTopWidth) > 0);
    const hasTopOnly = parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== "none" && !(parseFloat(style.borderBottomWidth) > 0);
    if ((hasBottomOnly || hasTopOnly) && !(parseFloat(style.borderLeftWidth) > 0)) lineColor = hasBottomOnly ? style.borderBottomColor : style.borderTopColor;
    const insetLine = style.boxShadow.match(/(rgba?\([^)]*\)|#[0-9a-f]{3,8})\s+0px\s+-?1px\s+0px(\s+0px)?\s+inset|inset\s+0px\s+-?1px\s+0px(\s+0px)?\s+(rgba?\([^)]*\)|#[0-9a-f]{3,8})/i);
    if (!lineColor && insetLine) lineColor = insetLine[1] || insetLine[4];
    if (!lineColor) continue;
    const behind = readAncestorBackdrop(element);
    if (!behind) continue;
    const line = blendColors(readColor(lineColor), behind);
    const gap = channelDistance(line, behind);
    // Tab rail divider requires higher contrast than decorative hairline: `--tab-rail` pattern differs by ~22, approved at 21.
    const isTabRail = Boolean(element.querySelector("[role='tab'], [aria-current='page']"));
    const minGap = isTabRail ? 16 : 8;
    if (gap > 0 && gap < minGap) faintLines.push(`divider line ${toHex(line)} on background ${toHex(behind)} differs by only ${gap} levels (minimum ${minGap}${isTabRail ? ", tab row: `--tab-rail`" : ""}): ${describe(element)}`);
  }

  // 16d. Active tab background differs from background behind by under 16 levels: cannot discern selected tab at a glance.
  //      Occurred 2026-10-05: "Pending review" tab #e9eaee on page background #f3f4f6 (difference 10) blended into background;
  //      approved revision had difference 16. Raw `bg-secondary` on page background differs by only 13 (`bg-tab-selected`).
  const faintSelectedTabs = [];
  for (const tab of document.querySelectorAll("[role='tab'][aria-selected='true'], [aria-current='page']")) {
    if (faintSelectedTabs.length >= 4 || !isVisible(tab)) continue;
    // `aria-current` links evaluated only in horizontal row (link tabs): vertical sidebar items follow dedicated rules.
    const parentStyle = tab.parentElement ? getComputedStyle(tab.parentElement) : null;
    if (tab.getAttribute("role") !== "tab" && !(parentStyle?.display.includes("flex") && parentStyle.flexDirection.startsWith("row"))) continue;
    const ownColor = readColor(getComputedStyle(tab).backgroundColor);
    if (ownColor.alpha < 0.02) continue;
    const behind = tab.parentElement ? readAncestorBackdrop(tab.parentElement) : null;
    if (!behind) continue;
    const shown = blendColors(ownColor, behind);
    const gap = channelDistance(shown, behind);
    if (gap < 16) faintSelectedTabs.push(`background ${toHex(shown)} on ${toHex(behind)} differs by only ${gap} levels (minimum 16): ${describe(tab)}`);
  }

  // 16e. Active rounded row stands under 4px from adjacent row: hovering adjacent row merges backgrounds into double-height
  //      block (lock rule 19). Occurred 2026-10-05, lesson outline: active "Lesson 20" and hovered "Lesson 21" merged.
  //      Unrounded table rows are ignored.
  const stuckRows = [];
  for (const row of document.querySelectorAll("[aria-current]:not([aria-current='false']), [aria-selected='true'], [data-state='active'], [data-active='true']")) {
    if (stuckRows.length >= 4 || !isVisible(row)) continue;
    const rowStyle = getComputedStyle(row);
    if (!(parseFloat(rowStyle.borderTopLeftRadius) > 0) || readColor(rowStyle.backgroundColor).alpha < 0.02) continue;
    const rowRect = row.getBoundingClientRect();
    if (rowRect.width < 120) continue;
    // Walk up to element that is direct child of list (link inside `<li>`), up to three levels.
    let item = row;
    for (let depth = 0; depth < 3 && item.parentElement && item.parentElement.children.length < 2; depth++) item = item.parentElement;
    const neighbours = [item.previousElementSibling, item.nextElementSibling].filter((sibling) => sibling && isVisible(sibling));
    for (const sibling of neighbours) {
      const siblingRect = sibling.getBoundingClientRect();
      if (Math.abs(siblingRect.left - item.getBoundingClientRect().left) > 2 || siblingRect.height === 0) continue;
      const gap = siblingRect.top >= rowRect.bottom - 1 ? siblingRect.top - rowRect.bottom : rowRect.top - siblingRect.bottom;
      if (gap >= -1 && gap < 3.5) {
        stuckRows.push(`gap to adjacent row is ${Math.max(0, Math.round(gap * 10) / 10)}px, requires at least 4px (\`gap-1\`): ${describe(row)}`);
        break;
      }
    }
  }

  // 16b. Elements in same component have mismatched corner radii (System drift, `V1` "shared role"): group elements with
  //      background / border / shadow by component, identified by `data-slot` (shadcn) or hashed CSS Module class (`_card_x1y2z`,
  //      `glass-card-module__card__AbC12`). An element with radius differing from majority has an accidental override.
  //      "Warning threshold" card had 8px radius amidst 20px glass cards (missed by automated run, caught visually 2026-09-30).
  const isModuleClass = (token) => /__/.test(token) || /^_[A-Za-z][\w-]*_[A-Za-z0-9-]{5}(_\d+)?$/.test(token);
  const surfacesByComponent = new Map();
  for (const element of allElements) {
    const style = getComputedStyle(element);
    const hasSurface = readColor(style.backgroundColor).alpha > 0 || parseFloat(style.borderTopWidth) > 0 || style.boxShadow !== "none";
    if (!hasSurface || !isVisible(element)) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width * rect.height < 20000) continue;
    const keys = [element.dataset.slot && `slot:${element.dataset.slot}`, ...[...element.classList].filter(isModuleClass)].filter(Boolean);
    for (const key of keys) {
      if (!surfacesByComponent.has(key)) surfacesByComponent.set(key, []);
      surfacesByComponent.get(key).push({ element, radius: Math.round(parseFloat(style.borderTopLeftRadius) || 0) });
    }
  }
  const mismatchedRadii = [];
  const reportedRadiusElements = new Set();
  for (const [key, surfaces] of surfacesByComponent) {
    if (surfaces.length < 3 || mismatchedRadii.length >= 6) continue;
    const radiusCounts = new Map();
    for (const surface of surfaces) radiusCounts.set(surface.radius, (radiusCounts.get(surface.radius) ?? 0) + 1);
    const [commonRadius, commonCount] = [...radiusCounts].sort((first, second) => second[1] - first[1])[0];
    if (commonCount < 2 || commonCount === surfaces.length) continue;
    for (const surface of surfaces) {
      if (Math.abs(surface.radius - commonRadius) < 4 || reportedRadiusElements.has(surface.element)) continue;
      reportedRadiusElements.add(surface.element);
      mismatchedRadii.push(`radius ${surface.radius}px, ${commonCount} surfaces in same component (${key.replace(/^slot:/, "data-slot ")}) have radius ${commonRadius}px: ${describe(surface.element)}`);
    }
  }

  // 17. Inputs, buttons, selects retain browser default styles: project lacks Tailwind preflight (reset)
  //     and control lacks custom reset (inset / outset border, grey border #767676, select `appearance: auto`).
  const browserDefaultControls = [];
  for (const control of document.querySelectorAll("input:not([type='checkbox']):not([type='radio']):not([type='hidden']), textarea, select, button")) {
    if (browserDefaultControls.length >= 8 || !isVisible(control)) continue;
    const style = getComputedStyle(control);
    const hasDefaultBorder = ["inset", "outset"].includes(style.borderTopStyle) || (parseFloat(style.borderTopWidth) > 0 && style.borderTopColor === "rgb(118, 118, 118)");
    // Unstyled native select: retains `appearance: auto` AND browser default square corners or grey border. Native select with
    // rounded corners and token border retaining native arrow is acceptable, do not report.
    const isNativeSelect = control.tagName === "SELECT" && ["auto", "menulist"].includes(style.appearance)
      && (style.borderTopLeftRadius === "0px" || style.borderTopColor === "rgb(118, 118, 118)" || style.borderTopColor === "rgb(0, 0, 0)");
    // Native slider: `appearance: auto` where page does not build custom track (custom dual-thumb slider has input
    // underneath with `pointer-events-none` or transparent).
    const isNativeRange = control.type === "range" && style.appearance === "auto" && style.pointerEvents !== "none" && Number(style.opacity) > 0.1;
    if (isNativeRange) {
      browserDefaultControls.push(`browser-native slider: ${describe(control)}`);
      continue;
    }
    if (control.type === "range") continue;
    if (hasDefaultBorder || isNativeSelect) browserDefaultControls.push(`${isNativeSelect ? "browser-native select" : `border ${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`}: ${describe(control)}`);
  }

  // 17a. Native checkbox, radio, even when styled with `accent-color`: the skill builds on `appearance-none`
  //      (components/choice-controls.md). `sr-only` or transparent inputs underneath custom elements are excluded.
  for (const choice of document.querySelectorAll("input[type='checkbox'], input[type='radio']")) {
    if (browserDefaultControls.length >= 8 || !isVisible(choice)) continue;
    const style = getComputedStyle(choice);
    if (style.appearance === "none" || Number(style.opacity) <= 0.1) continue;
    browserDefaultControls.push(`${choice.type} browser-native${style.accentColor !== "auto" ? " (accent-color only)" : ""}: ${describe(choice)}`);
  }

  // 17b. Styled native select on desktop: resting state matches app styling, but opening triggers OS native menu. Review
  //      mode ignores; rebuild modes replace with custom Select (review.md V1, 2026-09-28).
  //      Native date/time inputs have identical issue: clicking opens OS calendar. Hidden overlay controls
  //      are evaluated separately by `findNativeControls`.
  const styledNativeSelects = isMobile ? [] : [...document.querySelectorAll("select, input[type='date'], input[type='time'], input[type='datetime-local'], input[type='month'], input[type='week']")]
    .filter((control) => isVisible(control) && (control.tagName !== "SELECT" || !["auto", "menulist"].includes(getComputedStyle(control).appearance)))
    .slice(0, 6)
    .map((control) => `${control.tagName === "SELECT" ? `${control.options.length} options` : `native ${control.type} input`}: ${describe(control)}`);

  // 18. Horizontal divider of adjacent columns misaligned by a few px: bottom border of logo block in sidebar vs bottom
  //     border of header, appearing as a broken line (2026-09-28). Offsets > 16px represent distinct tiers, ignore.
  const horizontalRules = [];
  for (const element of allElements) {
    const style = getComputedStyle(element);
    if (!isVisible(element)) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width < 120) continue;
    for (const [side, edgeY] of [["Bottom", rect.bottom], ["Top", rect.top]]) {
      const isDrawn = parseFloat(style[`border${side}Width`]) > 0 && style[`border${side}Style`] !== "none" && readColor(style[`border${side}Color`]).alpha > 0.05;
      if (isDrawn) horizontalRules.push({ element, edgeY, left: rect.left, right: rect.right, color: style[`border${side}Color`] });
    }
  }
  const brokenRules = [];
  const mismatchedRuleColors = [];
  for (const first of horizontalRules) {
    for (const second of horizontalRules) {
      if (brokenRules.length >= 6) break;
      const isSideBySide = Math.abs(first.right - second.left) <= 4;
      const offset = Math.abs(first.edgeY - second.edgeY);
      // Aligned but different color also appears broken: bottom logo line `border-light` #f1f5f9 connecting to header
      // `border` #e2e8f0 appears as faded sidebar against dark main area (2026-09-28).
      if (isSideBySide && offset < 0.75 && first.color !== second.color && mismatchedRuleColors.length < 4) {
        mismatchedRuleColors.push(`${first.color} connects to ${second.color}: ${describe(first.element)} | ${describe(second.element)}`);
      }
      // Two containers starting at page top (sidebar logo and header) belong to the same tier; any misalignment
      // is broken: header squeezed to 35px was offset 46px from logo bottom line (2026-09-28).
      const isTopBand = first.element.getBoundingClientRect().top <= 1 && second.element.getBoundingClientRect().top <= 1;
      if (isSideBySide && offset >= 0.75 && (offset <= 16 || (isTopBand && offset <= 120))) {
        brokenRules.push(`offset ${offset.toFixed(1)}px: ${describe(first.element)} | ${describe(second.element)}`);
      }
    }
  }

  // 18b. Container declaring fixed height (`h-[70px]`, `h-16`) rendering shorter: child of vertical flex
  //      missing `shrink-0` squeezed by tall content (70px header squeezed to 35px, 2026-09-28). Containers with
  //      `md:h-…` or `max-h-…` responsive variants changing height intentionally are ignored.
  const squeezedBlocks = [];
  for (const element of allElements) {
    if (squeezedBlocks.length >= 6) break;
    const classNames = (element.getAttribute("class") || "").split(/\s+/);
    if (classNames.some((className) => /:h-|^max-h-/.test(className))) continue;
    const heightClass = classNames.map((className) => className.match(/^h-(?:\[(\d+(?:\.\d+)?)px\]|(\d+(?:\.\d+)?))$/)).find(Boolean);
    if (!heightClass || !isVisible(element)) continue;
    const declaredHeight = heightClass[1] ? Number(heightClass[1]) : Number(heightClass[2]) * 4;
    const renderedHeight = element.getBoundingClientRect().height;
    if (declaredHeight >= 24 && renderedHeight < declaredHeight - 2) {
      squeezedBlocks.push(`declared ${declaredHeight}px, rendered ${Math.round(renderedHeight)}px: ${describe(element)}`);
    }
  }

  // 18d. Header action buttons (top-pinned bar, height 48–88px) not uniform size: 30px solid button with
  //      13px text sitting between 34px ghost buttons with 14px text, fully rounded between 12px radius buttons
  //      (2026-09-28: header retained legacy markup while wireframe was redesigned).
  const unevenHeaderActions = [];
  for (const bar of allElements) {
    const barRect = bar.getBoundingClientRect();
    if (barRect.top > 1 || barRect.height < 48 || barRect.height > 88 || barRect.width < 400 || !isVisible(bar)) continue;
    const actions = [...bar.querySelectorAll("button, a")].filter((action) => {
      const actionRect = action.getBoundingClientRect();
      return isVisible(action) && actionRect.height >= 24 && actionRect.left > barRect.left + barRect.width / 2 && !action.parentElement.closest("button, a");
    });
    if (actions.length < 3) continue;
    const heights = actions.map((action) => Math.round(action.getBoundingClientRect().height));
    const fontSizes = new Set(actions.map((action) => getComputedStyle(action).fontSize));
    const isFullRadius = (action) => parseFloat(getComputedStyle(action).borderTopLeftRadius) >= action.getBoundingClientRect().height / 2;
    // Avatar button (square, fully rounded, image or 1-2 initials) circular alongside rounded icon buttons is standard convention,
    // excluded from shape comparison (false positive 2026-10-01, app header: theme, bell, avatar "T").
    const isAvatarAction = (action) => {
      const actionRect = action.getBoundingClientRect();

      return isFullRadius(action) && Math.abs(actionRect.width - actionRect.height) <= 2 && (Boolean(action.querySelector("img")) || action.textContent.trim().length <= 2);
    };
    const shapeCount = new Set(actions.filter((action) => !isAvatarAction(action)).map(isFullRadius)).size;
    const heightSpread = Math.max(...heights) - Math.min(...heights);
    // Spacing between adjacent buttons: under 6px causes hover backgrounds to collide into a blob (use gap-2, 2026-09-30).
    const sortedActions = [...actions].sort((first, second) => first.getBoundingClientRect().left - second.getBoundingClientRect().left);
    const actionGaps = sortedActions.slice(1).map((action, index) => action.getBoundingClientRect().left - sortedActions[index].getBoundingClientRect().right);
    const tightestGap = Math.min(...actionGaps);
    if (heightSpread >= 3 || fontSizes.size > 1 || shapeCount > 1 || tightestGap < 6) {
      unevenHeaderActions.push(`${actions.length} buttons, height ${Math.min(...heights)}–${Math.max(...heights)}px, text ${[...fontSizes].join(" / ")}${shapeCount > 1 ? ", mixing fully rounded with rounded corner" : ""}${tightestGap < 6 ? `, spaced ${Math.round(tightestGap)}px (gap-2)` : ""}: ${describe(bar)}`);
      break;
    }
  }

  // 18c. Sticky column with independent scroll: `sticky` with `max-h-[calc(100vh-…)] overflow-y-auto` (filter column, table of contents).
  //      Independent permanent scrollbar hugs border, stretching full column height on tall screens
  //      (2026-09-28). If column exceeds viewport, scroll with page. Main app scroll container is not sticky so
  //      excluded; overlay lists are `fixed` / `absolute`, also excluded.
  const stickyScrollColumns = [];
  for (const element of allElements) {
    if (stickyScrollColumns.length >= 4) break;
    const style = getComputedStyle(element);
    if (style.position !== "sticky" || !["auto", "scroll"].includes(style.overflowY) || !isVisible(element)) continue;
    const { clientHeight, scrollHeight } = element;
    if (clientHeight < 120 || scrollHeight <= clientHeight + 4) continue;
    stickyScrollColumns.push(`frame height ${clientHeight}px, content ${scrollHeight}px: ${describe(element)}`);
  }

  // 18k. Horizontally scrolling row hiding scrollbars without arrow buttons on desktop: mouse wheels scroll vertically
  //      only, making subsequent items (often including "Clear filters") unreachable. Trackpads can scroll horizontally so
  //      authors miss it (active filter chips, 2026-09-28). Arrow buttons searched in two ancestor levels outside scroller.
  const mouseUnreachableScrollers = [];
  for (const element of isMobile ? [] : allElements) {
    if (mouseUnreachableScrollers.length >= 4) break;
    const style = getComputedStyle(element);
    if (!["auto", "scroll"].includes(style.overflowX) || style.scrollbarWidth !== "none" || !isVisible(element)) continue;
    if (element.scrollWidth <= element.clientWidth + 4) continue;
    const scope = element.parentElement?.parentElement || element.parentElement;
    const hasArrowButton = [...(scope?.querySelectorAll("button, [role='button']") || [])]
      .some((button) => !element.contains(button) && isVisible(button) && button.getBoundingClientRect().width < 64);
    if (hasArrowButton) continue;
    mouseUnreachableScrollers.push(`frame ${element.clientWidth}px, content ${element.scrollWidth}px, hidden ${element.scrollWidth - element.clientWidth}px: ${describe(element)}`);
  }

  // 18e. Content floating in wide viewports: main content block has max width and centers, leaving empty side margins
  //      >= 120px. Alongside sidebar this creates a void between sidebar and content (`mx-auto max-w-300`, 2026-09-28).
  //      Only evaluates containers >= 900px wide: centered narrow forms or settings pages are intentional designs.
  const floatingContent = [];
  if (viewportWidth >= 1600) {
    for (const element of allElements) {
      if (floatingContent.length >= 2) break;
      const style = getComputedStyle(element);
      if (style.maxWidth === "none" || !isVisible(element)) continue;
      const marginLeft = parseFloat(style.marginLeft);
      const marginRight = parseFloat(style.marginRight);
      const width = element.getBoundingClientRect().width;
      if (width >= 900 && marginLeft >= 120 && Math.abs(marginLeft - marginRight) <= 2) {
        floatingContent.push(`width ${Math.round(width)}px, margins ${Math.round(marginLeft)}px on each side: ${describe(element)}`);
      }
    }
  }

  // 18f. Dialog container nested inside translucent backdrop (scrim) where both transition `opacity`: opacities multiply, dialog
  //      fades faster than backdrop on close, creating jarring flicker (2026-09-28). Measurable only when dialog remains in DOM.
  const nestedFadeDialogs = [];
  for (const dialog of document.querySelectorAll("[role='dialog'], dialog")) {
    if (nestedFadeDialogs.length >= 3) break;
    const isFading = (element) => /opacity|all/.test(element.dataset.forgeTransition || "");
    if (!isFading(dialog)) continue;
    for (let node = dialog.parentElement; node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.position === "fixed" && readColor(style.backgroundColor).alpha > 0.05 && isFading(node)) {
        nestedFadeDialogs.push(`${describe(dialog)} inside ${describe(node)}`);
        break;
      }
    }
  }

  // 18g. Tailwind v4 trap: `scale-*`, `translate-*`, `rotate-*` write to standalone `scale`, `translate`, `rotate`
  //      CSS properties, whereas `transition-[transform]` / `transition-[opacity,transform]` animate only `transform`. Container
  //      jumps in size abruptly before fading, arrow snaps instead of rotating (2026-09-28, account menu and accordion
  //      pattern). Evaluates hidden elements: closed menu remains in DOM. `transition-transform` in v4 includes all three, so not flagged.
  const untransitionedMotion = [];
  for (const element of document.body.querySelectorAll("*")) {
    if (untransitionedMotion.length >= 6) break;
    const classNames = element.getAttribute("class") || "";
    if (!/(^|[\s:])-?(scale|translate|rotate)-/.test(classNames)) continue;
    const property = element.dataset.forgeTransition || "";
    if (!/\btransform\b/.test(property) || /\b(all|scale|translate|rotate)\b/.test(property)) continue;
    untransitionedMotion.push(`transition: ${property}: ${describe(element)}`);
  }

  // 18h. Menu divider line darker than frame border: menus are divided by hairlines; group dividers share the same
  //      token as border (`border-border`), not `border-strong` (2026-09-28).
  const relativeLuminance = (color) => (0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue) / 255;
  const heavySeparators = [];
  for (const menu of document.querySelectorAll("[role='menu'], [role='listbox']")) {
    if (heavySeparators.length >= 3) break;
    const menuStyle = getComputedStyle(menu);
    if (!(parseFloat(menuStyle.borderTopWidth) > 0)) continue;
    const frameLuminance = relativeLuminance(readColor(menuStyle.borderTopColor));
    for (const separator of menu.querySelectorAll("hr, [role='separator']")) {
      const separatorStyle = getComputedStyle(separator);
      const color = parseFloat(separatorStyle.borderTopWidth) > 0 ? separatorStyle.borderTopColor : separatorStyle.backgroundColor;
      if (frameLuminance - relativeLuminance(readColor(color)) > 0.02) {
        heavySeparators.push(`divider ${color}, frame border ${menuStyle.borderTopColor}: ${describe(separator)}`);
        break;
      }
    }
  }

  // 18i. Left active indicator bar (left border or inset shadow) clipped by rounded corners of `overflow-hidden` container
  //      on first and last rows (2026-09-28, job listing).
  const clippedBars = [];
  for (const element of allElements) {
    if (clippedBars.length >= 3) break;
    const style = getComputedStyle(element);
    const hasInsetBar = /inset/.test(style.boxShadow) && /(^|\s)[2-6]px 0px 0px/.test(style.boxShadow);
    const hasBorderBar = parseFloat(style.borderLeftWidth) >= 2 && readColor(style.borderLeftColor).alpha > 0.1 && !(parseFloat(style.borderTopWidth) > 0);
    if ((!hasInsetBar && !hasBorderBar) || !isVisible(element)) continue;
    const rect = element.getBoundingClientRect();
    for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
      const nodeStyle = getComputedStyle(node);
      if (!["hidden", "clip"].includes(nodeStyle.overflowX)) continue;
      const radius = parseFloat(nodeStyle.borderTopLeftRadius) || 0;
      const box = node.getBoundingClientRect();
      const isAtCorner = Math.abs(rect.left - box.left) <= 2 && (Math.abs(rect.top - box.top) <= radius || Math.abs(rect.bottom - box.bottom) <= radius);
      if (radius >= 6 && isAtCorner) clippedBars.push(`radius ${radius}px of ${describe(node)} clips left accent bar ${describe(element)}`);
      break;
    }
  }

  // 18j. Repeated items dense with text: 3+ repeated cards or rows where an item has >= 5 lines of text. Authors miss
  //      excessive text density (2026-09-28, 5-line items in list + detail wireframe); counting line boxes exposes it.
  //      Counts text line boxes via Range, not DOM tag count.
  const denseItems = [];
  for (const parent of allElements) {
    if (denseItems.length >= 3) break;
    const items = [...parent.children].filter((child) => isVisible(child) && child.getBoundingClientRect().height >= 48);
    if (items.length < 3) continue;
    // Same type = same tag and same first class: active item with state classes (`sel`, `lg:bg-…`) is still same type.
    const signature = (child) => `${child.tagName}.${(child.getAttribute("class") || "").split(/\s+/)[0]}`;
    const sameKind = items.filter((child) => signature(child) === signature(items[0]));
    if (sameKind.length < 3) continue;
    const lineCounts = sameKind.slice(0, 6).map(countTextLines);
    const maxLines = Math.max(...lineCounts);
    const densest = sameKind[lineCounts.indexOf(maxLines)];
    // Navigation link groups (roughly one link per row, like sidebar items) are not text-dense items
    // (false positive 2026-09-29, wireframe sidebar).
    if (densest.querySelectorAll("a[href], button").length >= maxLines - 1) continue;
    // Columns or groups enclosing items (doctor column in schedule grid, "Upcoming" waiting group, kanban column): containing 2+
    // items >= 40px tall, line count reflects entire group. True items evaluated individually (false positive 2026-09-30,
    // appointment wireframe: 24-line column, 25-line group).
    const hasNestedItems = [densest, ...densest.querySelectorAll("*")].some((node) => {
      const tallSignatures = [...node.children].filter((child) => child.getBoundingClientRect().height >= 40).map(signature);
      return tallSignatures.some((childSignature, index) => tallSignatures.indexOf(childSignature) !== index);
    });
    if (hasNestedItems) continue;
    if (maxLines >= 5) denseItems.push(`${sameKind.length} items, up to ${maxLines} text lines: ${describe(densest)}`);
  }

  // 18j2. Repeated blocks with images (listing cards, products, jobs): three rules of `N12`. Largest text vs item title
  //       (title = longest text line), spacing between text rows (no gap >= 6px means unsegmented),
  //       single-line truncated title. Metric cards without images excluded (large metric is entire block).
  const repeatedCardIssues = [];
  const checkedCardGroups = new Set();
  for (const parent of allElements) {
    if (repeatedCardIssues.length >= 4) break;
    const items = [...parent.children].filter((child) => isVisible(child) && child.getBoundingClientRect().height >= 120);
    if (items.length < 3) continue;
    const signature = (child) => `${child.tagName}.${(child.getAttribute("class") || "").split(/\s+/)[0]}`;
    const sameKind = items.filter((child) => signature(child) === signature(items[0]));
    const card = sameKind[0];
    const image = card?.querySelector("img");
    if (sameKind.length < 3 || checkedCardGroups.has(signature(card)) || !image || image.getBoundingClientRect().height < 60) continue;
    checkedCardGroups.add(signature(card));
    const lines = [];
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (!text || !isVisible(node.parentElement)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const style = getComputedStyle(node.parentElement);
      for (const rect of range.getClientRects()) {
        // Text overlaid on images (badges, photo counts) is not card body text.
        if (rect.width > 2 && rect.top >= image.getBoundingClientRect().bottom - 1) lines.push({ top: rect.top, bottom: rect.bottom, size: parseFloat(style.fontSize), text, element: node.parentElement });
      }
    }
    if (lines.length < 2) continue;
    const title = lines.reduce((longest, line) => (line.text.length > longest.text.length ? line : longest));
    const largest = lines.reduce((biggest, line) => (line.size > biggest.size ? line : biggest));
    const problems = [];
    if (title.text.length >= 15 && largest.size / title.size >= 1.25) problems.push(`"${largest.text.slice(0, 16)}" ${largest.size}px above ${title.size}px title, exceeds one step`);
    const rows = [...lines].sort((first, second) => first.top - second.top)
      .filter((line, index, sorted) => index === 0 || line.top - sorted[index - 1].top > 3);
    const gaps = rows.slice(1).map((row, index) => row.top - rows[index].bottom);
    if (rows.length >= 3 && Math.max(...gaps) < 6) problems.push(`${rows.length} text lines uniformly spaced ${Math.round(Math.min(...gaps))}–${Math.round(Math.max(...gaps))}px, unsegmented`);
    const titleStyle = getComputedStyle(title.element);
    if (titleStyle.textOverflow === "ellipsis" && titleStyle.whiteSpace === "nowrap") {
      const titleRange = document.createRange();
      titleRange.selectNodeContents(title.element);
      if (titleRange.getBoundingClientRect().width > title.element.getBoundingClientRect().width + 1) problems.push(`title "${title.text.slice(0, 24)}…" truncated to one line`);
    }
    if (problems.length > 0) repeatedCardIssues.push(`${sameKind.length} card: ${problems.join("; ")}: ${describe(card)}`);
  }

  // 18l. Vertically misaligned control row: horizontal flex row containing buttons / inputs of differing heights without `items-center`,
  //      shorter control pins to top. 32px "View companies" next to 36px ⋯ button in table row end cell:
  //      8px top, 12px bottom (2026-09-29, report wireframe). Evaluates short rows only (single row of controls).
  const misalignedControlRows = [];
  const controlSelector = "button, a[href], input, select, textarea, [role='button'], [role='combobox']";
  const seenControlRows = new Set();
  for (const row of allElements) {
    if (misalignedControlRows.length >= 4) break;
    const rowKind = `${row.tagName}|${row.getAttribute("class") || ""}`;
    if (seenControlRows.has(rowKind)) continue;
    const style = getComputedStyle(row);
    if (!/flex/.test(style.display) || !style.flexDirection.startsWith("row") || /center|baseline/.test(style.alignItems)) continue;
    const rowRect = row.getBoundingClientRect();
    if (rowRect.height > 72 || !isVisible(row)) continue;
    const children = [...row.children].filter((child) => isVisible(child) && getComputedStyle(child).position !== "absolute");
    if (children.length < 2 || !children.some((child) => child.matches(controlSelector))) continue;
    // Multi-line text block (title + description) taller than control: control aligning with first line is correct (modal
    // header ✕ button, `items-start`), not a control row (false positive 2026-09-30, clinic design system).
    const tallestControl = Math.max(...children.filter((child) => child.matches(controlSelector)).map((child) => child.getBoundingClientRect().height));
    if (children.some((child) => !child.matches(controlSelector) && child.getBoundingClientRect().height > tallestControl + 8)) continue;
    const contentTop = rowRect.top + parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth);
    const contentBottom = rowRect.bottom - parseFloat(style.paddingBottom) - parseFloat(style.borderBottomWidth);
    const contentCenter = (contentTop + contentBottom) / 2;
    const offsets = children
      .filter((child) => child.matches(controlSelector) && !/center|baseline/.test(getComputedStyle(child).alignSelf))
      .map((child) => {
        const rect = child.getBoundingClientRect();

        return { child, offset: (rect.top + rect.bottom) / 2 - contentCenter, height: rect.height };
      });
    const worst = offsets.sort((first, second) => Math.abs(second.offset) - Math.abs(first.offset))[0];
    if (!worst || Math.abs(worst.offset) < 2) continue;
    seenControlRows.add(rowKind);
    misalignedControlRows.push(`${describe(worst.child)} height ${Math.round(worst.height)}px in ${Math.round(contentBottom - contentTop)}px row, offset by ${Math.round(Math.abs(worst.offset) * 2)}px vertically: ${describe(row)}`);
  }

  // 18n. Control non-compliant with skill pattern (2026-09-29, expense wireframe): placeholder longer than input
  //      (real input truncates tail), container styled as input but built as `div` so text wraps, pagination with
  //      text-only "Prev / Next" buttons without page numbers (`components/small-controls.md`).
  const textMeasurer = document.createElement("canvas").getContext("2d");
  const overlongPlaceholders = [];
  for (const input of document.querySelectorAll("input[placeholder]")) {
    if (overlongPlaceholders.length >= 4 || !isVisible(input) || /hidden|checkbox|radio|range|file/.test(input.type)) continue;
    const style = getComputedStyle(input);
    textMeasurer.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const available = input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const needed = textMeasurer.measureText(input.placeholder).width;
    if (needed > available + 1) overlongPlaceholders.push(`"${input.placeholder}" requires ${Math.round(needed)}px, input has ${Math.round(available)}px: ${describe(input)}`);
  }
  const fakeFieldWraps = [];
  for (const element of allElements) {
    if (fakeFieldWraps.length >= 4) break;
    if (element.matches("input, textarea, select, [contenteditable='true']") || !isVisible(element)) continue;
    if (!/(^|[-_\s])(input|search|field|searchbox)([-_\s]|$)/i.test(element.getAttribute("class") || "")) continue;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (!(parseFloat(style.borderTopWidth) > 0) || rect.height > 72 || element.querySelector("input, textarea")) continue;
    if (countTextLines(element) >= 2) fakeFieldWraps.push(`height ${Math.round(rect.height)}px, ${countTextLines(element)} text lines: ${describe(element)}`);
  }
  const textOnlyPagers = [];
  const pagerWords = /^(‹\s*)?(trước|sau|previous|prev|next|trang trước|trang sau)(\s*›)?$/i;
  for (const group of document.querySelectorAll("nav, div, footer")) {
    if (textOnlyPagers.length >= 2 || !isVisible(group)) continue;
    const controls = [...group.children].filter((child) => child.matches("a, button"));
    const wordControls = controls.filter((control) => pagerWords.test(control.textContent.trim()));
    if (wordControls.length < 2 || controls.some((control) => /^\d+$/.test(control.textContent.trim()))) continue;
    textOnlyPagers.push(`${wordControls.map((control) => `"${control.textContent.trim()}" ${Math.round(control.getBoundingClientRect().width)}px`).join(", ")}: ${describe(group)}`);
  }

  // 18o. Transparent header bar over grey page background: apps use white header background; transparent looks
  //      unfinished, and top-pinned headers bleed scrolling content behind text (2026-09-29, visitor wireframe).
  const transparentHeaders = [];
  for (const bar of document.querySelectorAll("header, [role='banner']")) {
    if (transparentHeaders.length >= 2 || !isVisible(bar)) continue;
    const rect = bar.getBoundingClientRect();
    if (rect.height < 44 || rect.height > 96 || rect.width < window.innerWidth * 0.4 || rect.top > 8) continue;
    if (readColor(getComputedStyle(bar).backgroundColor).alpha > 0.1) continue;
    let behind = bar.parentElement;
    while (behind && readColor(getComputedStyle(behind).backgroundColor).alpha < 0.9) behind = behind.parentElement;
    const behindColor = readColor(getComputedStyle(behind || document.body).backgroundColor);
    const isGrayBehind = behindColor.alpha > 0.9 && Math.min(behindColor.red, behindColor.green, behindColor.blue) < 250;
    if (isGrayBehind) transparentHeaders.push(`background behind rgb(${behindColor.red}, ${behindColor.green}, ${behindColor.blue}): ${describe(bar)}`);
  }

  // 18m. Wireframe page missing toolbar components (`design-process.md` U3): options, Color button, Viewport,
  //      State, rationale box, block numbers. Some wireframe runs had toolbars, others lacked them (2026-09-29). Inside
  //      mobile frame (`frame=1`) toolbar is intentionally hidden, ignore.
  const wireframeParams = new URLSearchParams(location.search);
  const countLinksWith = (param) => [...document.querySelectorAll("a[href*='?']")]
    .filter((link) => new URL(link.href, location.href).searchParams.has(param)).length;
  const missingWireframeParts = !/wireframe/i.test(location.pathname) || wireframeParams.has("frame") ? [] : [
    countLinksWith("v") < 2 && "options bar (?v=)",
    countLinksWith("mau") < 1 && "Color toggle (mau=)",
    countLinksWith("kho") < 2 && "Viewport desktop / mobile button (kho=)",
    countLinksWith("tt") < 2 && "State button (tt=)",
    !document.querySelector("[data-wf-reason]") && "rationale box (data-wf-reason)",
    document.querySelectorAll("[data-wf-block]").length < 2 && "block numbers (data-wf-block)",
  ].filter(Boolean);

  // 18m1. "Now" line of schedule grid (`data-now`) covered by appointment cells: cells rendered above line leave it visible only in
  //       cell gaps (measured 2026-09-30, 10:40 dental schedule: visible across 2% width), failing as a landmark for reading
  //       who is late or arriving next. Measured by hit-testing along line with temporary pointer-events.
  const coveredNowLines = [];
  for (const marker of document.querySelectorAll("[data-now]")) {
    if (!isVisible(marker) && marker.getBoundingClientRect().width < 40) continue;
    const markerRect = marker.getBoundingClientRect();
    if (markerRect.width < 40 || markerRect.bottom < 0 || markerRect.top > window.innerHeight) continue;
    const touched = [marker, ...marker.querySelectorAll("*")].map((node) => [node, node.style.pointerEvents]);
    for (const [node] of touched) node.style.pointerEvents = "auto";
    const sampleY = markerRect.top + markerRect.height / 2;
    let visibleCount = 0;
    let sampleCount = 0;
    for (let sampleX = markerRect.left + 2; sampleX < markerRect.right - 2; sampleX += 4) {
      sampleCount++;
      if (marker.contains(document.elementFromPoint(sampleX, sampleY))) visibleCount++;
    }
    for (const [node, value] of touched) node.style.pointerEvents = value;
    const visiblePercent = sampleCount ? Math.round((visibleCount / sampleCount) * 100) : 100;
    if (visiblePercent < 60) coveredNowLines.push(`only ${visiblePercent}% width visible: ${describe(marker)}`);
  }

  // 18m2. Wireframe chrome breaks design (U3, 2026-09-30, dental appointment wireframe):
  //  - toolbar overflows horizontally on desktop (added Screen group with long name): "State" cut off at 1280;
  //  - block numbers cover text or icons of paddingless containers ("Tuesday" obscured), or clipped by scroller;
  //  - `[data-wf-block] { position: relative }` not wrapped in layer overrides sidebar `sticky`: sidebar drifts on scroll.
  const wireframeChromeProblems = [];
  const wireframeBar = document.querySelector(".wf-bar");
  if (wireframeBar && viewportWidth >= 1280 && wireframeBar.scrollWidth > wireframeBar.clientWidth + 1) {
    wireframeChromeProblems.push(`toolbar overflows by ${wireframeBar.scrollWidth - wireframeBar.clientWidth}px at ${viewportWidth}px: shorten labels (Screen 1-2 words, Options letters only)`);
  }
  // Focus token must follow active accent color (design-process.md, U3): changing --primary on body while --border-focus declares
  // `var(--primary)` on :root evaluates once at :root, leaving focus border on old color; hardcoded --ring-focus does the same
  // (occurred 2026-10-01, classroom wireframe: teal selected but search focus border stayed indigo at every step). Measured on design container in light mode.
  if (wireframeBar && !document.documentElement.classList.contains("dark")) {
    const designRoot = document.getElementById("wf-design") || document.body;
    const sample = document.createElement("span");
    designRoot.appendChild(sample);
    const readRgb = (value) => {
      sample.style.color = "";
      sample.style.color = value;
      const color = getComputedStyle(sample).color;
      // color-mix returns `color(srgb 0.05 0.58 0.53 / 0.1)`, 0-1 channels.
      const scale = color.startsWith("color(") ? 255 : 1;
      return (color.replace(/^color\(srgb/, "").match(/[\d.]+/g) || []).slice(0, 3).map((channel) => Math.round(Number(channel) * scale));
    };
    const primaryRgb = readRgb("var(--primary)");
    for (const token of ["--border-focus", "--ring-focus"]) {
      if (!getComputedStyle(designRoot).getPropertyValue(token).trim()) continue;
      const tokenRgb = readRgb(`var(${token})`);
      if (tokenRgb.length === 3 && primaryRgb.length === 3 && tokenRgb.some((channel, index) => Math.abs(channel - primaryRgb[index]) > 6)) {
        wireframeChromeProblems.push(`focus token does not follow accent colour: ${token} rgb(${tokenRgb.join(", ")}) while --primary rgb(${primaryRgb.join(", ")}); update accent color on :root and re-derive tokens (design-process.md)`);
      }
    }
    sample.remove();
  }
  const breakpointQueries = { sm: "(min-width: 40rem)", md: "(min-width: 48rem)", lg: "(min-width: 64rem)", xl: "(min-width: 80rem)", "2xl": "(min-width: 96rem)" };
  const isRectOverlap = (first, second) => first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
  for (const block of document.querySelectorAll("[data-wf-block]")) {
    if (!isVisible(block)) continue;
    const blockStyle = getComputedStyle(block);
    const wantedPosition = (block.getAttribute("class") || "").split(/\s+/)
      .map((token) => token.match(/^(?:(sm|md|lg|xl|2xl):)?(sticky|fixed|absolute)$/))
      .filter((match) => match && (!match[1] || matchMedia(breakpointQueries[match[1]]).matches))
      .map((match) => match[2]).pop();
    if (wantedPosition && blockStyle.position !== wantedPosition) {
      wireframeChromeProblems.push(`block ${block.dataset.wfBlock} has class ${wantedPosition} but computes to ${blockStyle.position}: overridden by [data-wf-block] rule, move to @layer base`);
    }
    const badge = getComputedStyle(block, "::before");
    if (badge.content === "none" || badge.display === "none") continue;
    const blockRect = block.getBoundingClientRect();
    const badgeWidth = parseFloat(badge.width) || 18;
    const badgeHeight = parseFloat(badge.height) || 18;
    const badgeLeft = blockRect.left + (parseFloat(badge.left) || 0);
    // Positioned element returns computed `top` in px even when CSS specifies `top: auto; bottom: 100%` (negative values).
    const badgeTop = blockRect.top + (parseFloat(badge.top) || 0);
    const badgeRect = { left: badgeLeft, top: badgeTop, right: badgeLeft + badgeWidth, bottom: badgeTop + badgeHeight };
    const isOutside = badgeRect.top < blockRect.top - 1 || badgeRect.left < blockRect.left - 1;
    if (isOutside && (blockStyle.overflowX !== "visible" || blockStyle.overflowY !== "visible")) {
      wireframeChromeProblems.push(`block number ${block.dataset.wfBlock} outside container but container clips overflow (${blockStyle.overflowX}): number is hidden, place data-wf-block on non-scrolling wrapper`);
      continue;
    }
    const contentRects = [...block.querySelectorAll("svg, img")].map((node) => node.getBoundingClientRect());
    const textWalker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    for (let node = textWalker.nextNode(); node; node = textWalker.nextNode()) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      contentRects.push(...range.getClientRects());
    }
    const coveredRect = contentRects.find((rect) => rect.width > 0 && isRectOverlap(rect, badgeRect));
    if (coveredRect) wireframeChromeProblems.push(`block number ${block.dataset.wfBlock} covers text or icon: move number above container edge (data-wf-block-out)`);
  }

  // 19. Text under 12px: hard to read across all brands, common in card secondary rows and sidebars. Text in charts
  //     (svg) and short labels <= 3 characters ("New", "VIP") are excluded.
  const tinyTexts = [];
  let tinyTextCount = 0;
  for (const element of allElements) {
    const ownText = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join("").trim();
    if (ownText.length <= 3 || element.closest("svg") || !isVisible(element)) continue;
    const fontSize = parseFloat(getComputedStyle(element).fontSize);
    if (fontSize >= 12) continue;
    tinyTextCount += 1;
    if (tinyTexts.length < 10) tinyTexts.push(`${fontSize}px "${ownText.slice(0, 32)}": ${describe(element)}`);
  }

  return {
    orphanWords,
    invisibleFrames,
    faintLines,
    faintSelectedTabs,
    stuckRows,
    mismatchedRadii,
    browserDefaultControls,
    brokenRules,
    mismatchedRuleColors,
    unevenHeaderActions,
    squeezedBlocks,
    styledNativeSelects,
    stickyScrollColumns,
    mouseUnreachableScrollers,
    nestedFadeDialogs,
    untransitionedMotion,
    heavySeparators,
    clippedBars,
    denseItems,
    repeatedCardIssues,
    misalignedControlRows,
    missingWireframeParts,
    wireframeChromeProblems,
    coveredNowLines,
    overlongPlaceholders,
    fakeFieldWraps,
    textOnlyPagers,
    transparentHeaders,
    swallowedNumbers,
    floatingContent,
    tinyTexts,
    tinyTextCount,
    autoScrolledAreas,
    clippedBlocks,
    wrappedControls,
    wrappedRows,
    lowContrastTexts: sortedLowContrast.slice(0, 12).map((item) => item.line),
    lowContrastCount: sortedLowContrast.length,
    unmeasuredContrastCount,
    viewportWidth,
    pageScrollWidth,
    unpinnedScrollTables,
    squeezedTableColumns,
    crampedDescriptionLists,
    unevenStatRows,
    brokenMoney: [...new Set(brokenMoney)].slice(0, 10),
    gridChoiceGroups,
    hasHorizontalScroll: pageScrollWidth > viewportWidth + 1,
    overflowingElements,
    truncatedCount: truncatedTexts.length,
    tooShortTexts: tooShortTexts.slice(0, 10),
    tooShortCount: tooShortTexts.length,
    unevenSiblingGroups: unevenSiblingGroups.slice(0, 10),
    misalignedColumns: misalignedColumns.slice(0, 10),
    // Targets under 24px sorted to top: broken for all brands, 24-31px is the skill's floor.
    smallTapTargets: smallTapTargets
      .map((item) => ({ ...item, isBelowFloor: Math.min(...item.size.split("×").map(Number)) < 24 }))
      .sort((first, second) => Number(second.isBelowFloor) - Number(first.isBelowFloor))
      .slice(0, 15),
    smallTapCount: smallTapTargets.length,
    orphanPunctuation,
    misalignedFields: misalignedFields.slice(0, 10),
    unevenSeparatorRows: unevenSeparatorRows.slice(0, 10),
    overlappedChartLabels: [...new Set(overlappedChartLabels)].slice(0, 10),
    iconCoveringBadges,
    outsideChartLabels: [...new Set(outsideChartLabels)].slice(0, 10),
  };
}

// Focus ring drawn on element and children (text wrapped in `<span>` with `group-focus-visible:ring`): visible outline,
// or colored ring shadow `0 0 0 Npx`. Returns string signature comparing unfocused vs focused states.
function readFocusRingSignature(probeId) {
  const element = document.querySelector(`[data-forge-probe-id="${probeId}"]`);
  if (!element) return null;
  const isVisibleColor = (color) => Boolean(color) && !/rgba\([^)]*,\s*0\)|\/\s*0\)|transparent/.test(color);
  const nodes = [element, ...element.querySelectorAll("span, div, svg")].slice(0, 20);

  return nodes
    .map((node) => {
      const style = getComputedStyle(node);
      // Tailwind v4 `outline-hidden` is a 2px transparent outline: do not count.
      const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0 && isVisibleColor(style.outlineColor)
        ? `outline ${style.outlineWidth} ${style.outlineColor}`
        : "";
      // Tailwind v4 returns ring color as `oklab(… / 0.5)`: reading only `rgba()` detected no rings, causing probe to believe
      // project drew no rings anywhere and skipping "Tab focus has no indicator" (missed 2026-09-30, sidebar links).
      const rings = [...style.boxShadow.matchAll(/((?:rgba?|hsla?|oklab|oklch|lab|lch|color)\([^)]*\))\s+0px\s+0px\s+0px\s+([\d.]+)px/g)]
        .filter((match) => parseFloat(match[2]) > 0 && isVisibleColor(match[1]))
        .map((match) => `ring ${match[2]}px ${match[1]}`);

      return [outline, ...rings].filter(Boolean).join(" ");
    })
    .join("|");
}

// Visible appearance of element at that moment: ring, background, border, text color, underline of element and key children. If Tab
// arrives and this string is identical to unfocused state, Tab focus is invisible.
function readFocusLookSignature(probeId) {
  const element = document.querySelector(`[data-forge-probe-id="${probeId}"]`);
  if (!element) return null;
  const nodes = [element, ...element.querySelectorAll("span, div, svg")].slice(0, 20);

  return nodes
    .map((node) => {
      const style = getComputedStyle(node);

      const after = getComputedStyle(node, "::after");

      // `outline-none` still lets `outline-width` change on `focus-visible:` (1px → 3px) without rendering anything: only compare outline
      // when actually rendered (missed 2026-09-30, clinic schedule: sidebar link Tab focus invisible but probe thought it changed).
      const drawnOutline = style.outlineStyle === "none" ? "none" : `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`;

      return [drawnOutline, style.boxShadow, style.backgroundColor, style.borderColor, style.color, style.textDecorationLine, after.boxShadow, after.outlineStyle, after.opacity, after.borderColor].join(" ");
    })
    .join("|");
}

// Tab through page, record elements still drawing focus rings when focused. Skill does not draw focus rings (`I13`, project lead finalized
// 2026-09-28). Inputs, textareas, selects, comboboxes use border + subtle ring; menu items use background fill, not rings.
async function findDrawnFocusRings(page) {
  const candidates = [];
  const checksByKind = new Map();
  let firstFocusedId = null;
  let bodyStreak = 0;

  for (let tabIndex = 0; tabIndex < maxTabStops; tabIndex += 1) {
    await page.keyboard.press("Tab");
    const current = await page.evaluate(() => {
      const element = document.activeElement;
      // Next.js dev overlay (`nextjs-portal`) is not part of the page (false positive 2026-09-28).
      if (!element || element === document.body || element.tagName.startsWith("NEXTJS")) return null;
      if (!element.dataset.forgeProbeId) element.dataset.forgeProbeId = String(Math.random()).slice(2);
      const label = (element.getAttribute("aria-label") || element.textContent.trim() || element.getAttribute("title") || "").trim().replace(/\s+/g, " ").slice(0, 40);
      const isField = element.matches("input:not([type='checkbox']):not([type='radio']):not([type='range']), textarea, select, [contenteditable='true'], [role='combobox']");

      return { id: element.dataset.forgeProbeId, kind: `${element.tagName}|${element.getAttribute("class") || ""}`, element: `${element.tagName.toLowerCase()} "${label}"`, isField };
    });

    // Focus falls back to body: reaching end of page, next Tab cycles back to top. Page auto-focusing chat input on load
    // starts Tab loop mid-page; stopping at body never reaches header or sidebar (missed 2026-09-27, seed project).
    if (!current) {
      bodyStreak += 1;
      if (bodyStreak >= 3) break;
      continue;
    }
    bodyStreak = 0;
    if (current.id === firstFocusedId) break;
    if (!firstFocusedId) firstFocusedId = current.id;
    if (current.isField) continue;

    const checkCount = checksByKind.get(current.kind) ?? 0;
    checksByKind.set(current.kind, checkCount + 1);
    if (checkCount >= maxFocusChecksPerKind) continue;
    const focusedSignature = await page.evaluate(readFocusRingSignature, current.id);
    const focusedLook = await page.evaluate(readFocusLookSignature, current.id);
    candidates.push({ ...current, focusedSignature, focusedLook });
  }

  // Compared with unfocused state: "selected" border drawn via ring (selected card, chip) present in resting state is excluded.
  const drawnRings = [];
  const unmarkedStops = [];
  for (const candidate of candidates) {
    await page.evaluate(() => document.activeElement?.blur());
    const blurredSignature = await page.evaluate(readFocusRingSignature, candidate.id);
    const blurredLook = await page.evaluate(readFocusLookSignature, candidate.id);
    if (candidate.focusedSignature?.replace(/\|/g, "") && blurredSignature !== candidate.focusedSignature) drawnRings.push(candidate.element);
    else if (blurredLook === candidate.focusedLook) unmarkedStops.push(candidate);
  }

  // Ring with transition may not render immediately upon Tab arrival: refocus (still in keyboard mode so
  // matching `:focus-visible`), wait for transition to finish, then re-compare.
  const confirmedUnmarked = [];
  for (const candidate of drawnRings.length >= 2 ? unmarkedStops : []) {
    await page.evaluate((probeId) => document.querySelector(`[data-forge-probe-id="${probeId}"]`)?.focus({ focusVisible: true }), candidate.id);
    await page.waitForTimeout(350);
    const settledLook = await page.evaluate(readFocusLookSignature, candidate.id);
    await page.evaluate(() => document.activeElement?.blur());
    const blurredLook = await page.evaluate(readFocusLookSignature, candidate.id);
    if (settledLook === blurredLook) confirmedUnmarked.push(candidate.element);
  }

  // Exception to `I13` (project lead finalized 2026-09-30): if project draws focus rings in 2+ places, invisible Tab focus
  // indicates it was overridden in their system (selected tab sets inner `box-shadow` border, overriding Button ring). If project
  // draws no rings anywhere, follow `I13` and do not report.
  return { drawnRings, unmarkedFocusStops: confirmedUnmarked };
}

// ---------- Dynamic states: hover, overlays, collapsed containers ----------
// Three bugs 2026-09-26/27 slipped through because they only reveal on hover or tap: bordered button hover background #fff → #f8f8fa nearly
// invisible, 765px filename tooltip overflowing 375px screen, bugs inside collapsed accordion blocks.

const maxHoverTargets = 80;
const maxPopupTriggers = 20;
const maxTruncatedTaps = 10;

// Read rendered color of element on screen: its background composite over closest solid background behind it. Tailwind v4
// oklab / oklch colors converted to rgb via canvas.
function readHoverState(probeId) {
  const element = document.querySelector(`[data-forge-hover-id="${probeId}"]`);
  if (!element) return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const toRgba = (cssColor) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillStyle = cssColor;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;

    return { red, green, blue, alpha: alpha / 255 };
  };
  const blend = (top, bottom) => ({
    red: Math.round(top.red * top.alpha + bottom.red * (1 - top.alpha)),
    green: Math.round(top.green * top.alpha + bottom.green * (1 - top.alpha)),
    blue: Math.round(top.blue * top.alpha + bottom.blue * (1 - top.alpha)),
    alpha: 1,
  });
  const findOpaqueAncestor = (start) => {
    for (let node = start; node; node = node.parentElement) {
      const color = toRgba(getComputedStyle(node).backgroundColor);
      if (color.alpha > 0.9) return { node, color };
    }

    return { node: document.documentElement, color: { red: 255, green: 255, blue: 255, alpha: 1 } };
  };

  const style = getComputedStyle(element);
  const behind = findOpaqueAncestor(element.parentElement);
  const outside = findOpaqueAncestor(behind.node.parentElement);
  const ownColor = toRgba(style.backgroundColor);
  const rect = element.getBoundingClientRect();
  const cardRect = behind.node.getBoundingClientRect();
  const borderWidth = parseFloat(style.borderTopWidth) || 0;

  // Background of child elements (icon box, badge) to compare on hover: row hover `bg-background` containing `bg-background`
  // icon box causes icon box to vanish on hover (occurred 2026-09-27, seed project phase 2 fix).
  const ownFill = blend(ownColor, behind.color);
  const childFills = [...element.querySelectorAll("*")]
    .filter((child) => {
      const childRect = child.getBoundingClientRect();

      return childRect.width * childRect.height >= 144 && toRgba(getComputedStyle(child).backgroundColor).alpha > 0.9;
    })
    .slice(0, 30)
    .map((child) => toRgba(getComputedStyle(child).backgroundColor));

  return {
    childFills,
    color: ownFill,
    borderColor: borderWidth > 0 ? blend(toRgba(style.borderTopColor), behind.color) : null,
    isBorderTransparent: borderWidth > 0 && toRgba(style.borderTopColor).alpha === 0,
    outsideColor: outside.color,
    behindColor: behind.color,
    // Touching edge of solid background container behind (table row full bleed on card): hover background near background outside container
    // makes card appear notched (occurred 2026-09-26, pricing FAQ).
    width: rect.width,
    height: rect.height,
    isTableRow: element.tagName === "TR",
    // Declaring hover background (including variants like `not-checked:hover:bg-`) where color is unchanged on hover means hover
    // matches background behind: hover invisible (occurred 2026-09-28, list row hover `bg-muted` on `bg-muted`
    // container). Selected items skipped: hover matching selected background is intentional.
    // `dark:hover:bg-` runs only in dark mode: shadcn Select only declares hover background for dark, in light unchanged
    // hover is intentional (lock rule 6, false positive 2026-09-30, clinic schedule: all Selects flagged in P list).
    // `hover:bg-surface` (or `disabled:hover:bg-surface`) alongside `bg-surface` intentionally keeps resting background, disabling
    // inherited variant hover (non-hover dropdown filter button, project lead approved, `components/choice-controls.md`),
    // not declaring hover background (false positive 2026-10-01,
    // Filter button in dark task board).
    declaresHoverFill: (element.getAttribute("class") || "").split(/\s+/).some((token, index, tokens) => {
      const variants = token.split(":");
      const utility = variants.pop();
      const isCancellingInheritedHover = tokens.includes(utility);

      return variants.includes("hover") && /^bg-(?!transparent)/.test(utility) && !isCancellingInheritedHover && (!variants.includes("dark") || document.documentElement.classList.contains("dark"));
    }),
    isSelected: element.matches("[aria-current]:not([aria-current='false']), [aria-selected='true'], [aria-pressed='true'], [data-state='active'], [data-state='on'], [data-state='checked']"),
    touchesCardEdge: behind.node !== document.documentElement && (Math.abs(rect.left - cardRect.left) <= 1 || Math.abs(rect.right - cardRect.right) <= 1),
  };
}

// Currently visible overlay (tooltip, menu, listbox, popover, small fixed container) protruding past viewport.
function findOverflowingLayers() {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const layers = [...document.querySelectorAll("[role='tooltip'], [role='menu'], [role='listbox'], [role='dialog'], dialog[open], body *")].filter((node) => {
    const style = getComputedStyle(node);
    if (style.visibility === "hidden" || style.display === "none" || parseFloat(style.opacity) === 0) return false;
    // Forced state examples in design system page (select, modal pre-opened in static box, `D9`): not
    // real overlays (false positive 2026-09-30, clinic design system shadcn version).
    if (node.closest("[inert], [data-demo-state]")) return false;
    // Overlays must be positioned (fixed / absolute): command palette listbox statically rendered in flow as sample
    // inside page extending below viewport bottom is normal page scrolling (false positive 2026-09-27, /components).
    const isPositioned = style.position === "fixed" || style.position === "absolute";
    const isLayer = isPositioned && (["tooltip", "menu", "listbox", "dialog"].includes(node.getAttribute("role")) || node.tagName === "DIALOG" || (parseInt(style.zIndex, 10) || 0) >= 20);
    if (!isLayer) return false;
    const rect = node.getBoundingClientRect();

    // Fullscreen scrim/backdrop (covering both dimensions, within screen) is not an overlay to measure. Tooltips wider than
    // screen are measured: that is a bug (765px filename tooltip at 375px, 2026-09-27). Sheet full screen height but wider
    // than screen as well: `min-w-[400px]` at 375px protrudes 25px past left edge (missed 2026-09-30, clinic schedule, filter sheet).
    const isFullScreen = rect.left >= -1 && rect.right <= viewportWidth + 1 && rect.width >= viewportWidth - 1 && rect.height >= viewportHeight - 1;
    // Container fully off-screen (closed sidebar awaiting slide-in) is not an open overlay: truly
    // overflowing overlays always retain a portion on screen (false positive 2026-09-27, sidebar at 375px).
    const isPartlyVisible = rect.right > 0 && rect.left < viewportWidth && rect.bottom > 0 && rect.top < viewportHeight;
    return rect.width > 0 && rect.height > 0 && !isFullScreen && isPartlyVisible;
  });

  return layers
    .map((node) => {
      const rect = node.getBoundingClientRect();
      const overflowLeft = Math.max(0, -rect.left);
      const overflowRight = Math.max(0, rect.right - viewportWidth);
      // Bottom overflow only checked on fixed containers: absolute containers scroll with page and become visible when scrolled.
      const overflowBottom = getComputedStyle(node).position === "fixed" ? Math.max(0, rect.bottom - viewportHeight) : 0;
      const worst = Math.max(overflowLeft, overflowRight, overflowBottom);
      if (worst <= 1) return null;
      const label = (node.getAttribute("role") || node.tagName.toLowerCase()) + ` "${node.textContent.trim().replace(/\s+/g, " ").slice(0, 30)}"`;

      return `${label} width ${Math.round(rect.width)}px, protrudes ${Math.round(worst)}px past screen`;
    })
    .filter(Boolean);
}

function colorDistance(first, second) {
  return Math.max(Math.abs(first.red - second.red), Math.abs(first.green - second.green), Math.abs(first.blue - second.blue));
}

function formatColor(color) {
  return `#${[color.red, color.green, color.blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

// Positions of blocks following element (next siblings of element and of four parent levels): if these blocks shift on hover,
// hover is adding or expanding element, causing downstream cards to jump.
function readFollowerTops(probeId) {
  const element = document.querySelector(`[data-forge-hover-id="${probeId}"]`);
  const tops = [];

  for (let node = element, level = 0; node && node !== document.body && level < 5; node = node.parentElement, level++) {
    let follower = node.nextElementSibling;
    for (let count = 0; follower && count < 3; follower = follower.nextElementSibling, count++) {
      const rect = follower.getBoundingClientRect();
      if (rect.height > 0) tops.push(rect.top);
    }
  }

  return tops;
}

async function probeHoverStates(page) {
  const layoutShifts = [];
  const vanishedChildren = [];
  const weakHovers = [];
  const blendedHovers = [];
  const borderHovers = [];
  const overflowingLayers = new Set();

  const probeIds = await page.evaluate((limit) => {
    const seenSignatures = new Set();
    const ids = [];
    // `.group` and `cursor-pointer`: clickable cards built with div (onClick) still have hover, most commonly
    // `group-hover:` revealing an extra line in card. This group measures layout shifts only, not hover color: checkbox
    // `cursor-pointer` darkening border on hover is approved pattern (false positive 2026-09-27, /dashboard).
    const colorProbeSelector = "button, a[href], [role='button'], [role='tab'], [role='menuitem'], [role='option'], tbody tr, summary";
    const candidates = document.querySelectorAll(`${colorProbeSelector}, .group, [class*='cursor-pointer']`);

    for (const element of candidates) {
      const rect = element.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8 || element.closest("[inert], [aria-hidden='true'], [data-demo-state]")) continue;
      if (getComputedStyle(element).visibility === "hidden") continue;
      // Disabled button ("Previous" on page 1) is not hoverable: unchanged background is correct (false positive 2026-09-30).
      if (element.matches(":disabled, [aria-disabled='true']")) continue;
      // Group by type: same tag + same class share hover style, testing one instance is sufficient.
      const signature = `${element.tagName}|${element.getAttribute("class") || ""}`;
      if (seenSignatures.has(signature)) continue;
      seenSignatures.add(signature);
      element.dataset.forgeHoverId = String(ids.length);
      if (!element.matches(colorProbeSelector)) element.dataset.forgeLayoutOnly = "1";
      ids.push(element.dataset.forgeHoverId);
      if (ids.length >= limit) break;
    }

    return ids;
  }, maxHoverTargets);

  for (const probeId of probeIds) {
    const locator = page.locator(`[data-forge-hover-id="${probeId}"]`);
    await page.mouse.move(1, 1);
    const isReady = await locator.scrollIntoViewIfNeeded({ timeout: 800 }).then(() => true, () => false);
    if (!isReady) continue;
    const before = await page.evaluate(readHoverState, probeId);
    const followerTopsBefore = await page.evaluate(readFollowerTops, probeId);
    const isHovered = await locator.hover({ timeout: 800, force: true }).then(() => true, () => false);
    if (!before || !isHovered) continue;
    await page.waitForTimeout(60);
    const after = await page.evaluate(readHoverState, probeId);
    const followerTopsAfter = await page.evaluate(readFollowerTops, probeId);
    if (!after) continue;

    for (const layer of await page.evaluate(findOverflowingLayers)) overflowingLayers.add(`hover: ${layer}`);

    const label = await locator.evaluate((element) => {
      const text = (element.getAttribute("aria-label") || element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 32);

      return `${element.tagName.toLowerCase()} "${text}"`;
    });
    const largestShift = followerTopsBefore.length === followerTopsAfter.length
      ? Math.max(0, ...followerTopsBefore.map((top, index) => Math.abs(followerTopsAfter[index] - top)))
      : 0;
    if (largestShift > 2) layoutShifts.push(`${label}: hover shifts following block by ${Math.round(largestShift)}px`);
    const vanishedIndex = before.childFills.findIndex((fill, index) => {
      const afterFill = after.childFills[index];

      return afterFill && colorDistance(before.color, fill) > 3 && colorDistance(after.color, afterFill) <= 3;
    });
    if (vanishedIndex !== -1) {
      vanishedChildren.push(`${label}: hover background ${formatColor(after.color)} matches inner child background (icon box, badge), child vanishes on hover`);
    }
    if (await locator.evaluate((element) => element.dataset.forgeLayoutOnly === "1")) continue;

    // Border checked first: bordered button changing border color while background is static must be reported.
    // Border fading out while background changes is row repeating button in I4 (hover makes border transparent, light red background,
    // rules-state.md): do not report. False positive 2026-09-27, per-row "Log out" in security page.
    const isBorderSwappedForFill = after.isBorderTransparent && colorDistance(before.color, after.color) > 8;
    if (before.borderColor && after.borderColor && !isBorderSwappedForFill && colorDistance(before.borderColor, after.borderColor) > 8) {
      borderHovers.push(`${label}: border ${formatColor(before.borderColor)} → ${formatColor(after.borderColor)}`);
    }
    const change = colorDistance(before.color, after.color);
    if (change === 0 && before.declaresHoverFill && !before.isSelected) {
      blendedHovers.push(`${label}: declares hover background but matches background behind ${formatColor(after.color)}, hover invisible`);
    }
    if (change === 0) continue;

    // Table rows and full-bleed container rows accept subtle hover (#f8f8fa on white card, table in `I10`) because they span
    // a full wide strip. Buttons, menu items, indented rows with under 8 levels of difference are nearly invisible on hover.
    const isButtonSized = before.width < 320 && before.height < 80;
    const isFullBleedRow = before.isTableRow || before.touchesCardEdge;
    if (change < 8 && (isButtonSized || !isFullBleedRow)) weakHovers.push(`${label}: ${formatColor(before.color)} → ${formatColor(after.color)} (delta ${change} levels)`);
    if (after.touchesCardEdge && colorDistance(after.color, after.outsideColor) <= 3) {
      blendedHovers.push(`${label}: hover background ${formatColor(after.color)} nearly matches outside container background ${formatColor(after.outsideColor)}, card appears notched`);
    }
    // Button elevated from background when resting (white bordered button on gray page) that hovers back to near identical
    // page background: button dissolves into page. Occurred 2026-09-30, ‹ Today › button #f1f1f3 on #f4f4f6 page
    // (delta 3): "nearly invisible hover" check missed it because white → #f1f1f3 changes 14 levels. Compare against background
    // DURING HOVER: row button hovers while row also sinks to #f4f4f6 ("Check-in" button on same screen).
    if (colorDistance(before.color, after.behindColor) > 8 && colorDistance(after.color, after.behindColor) <= 4) {
      blendedHovers.push(`${label}: hover background ${formatColor(after.color)} nearly matches background directly behind button ${formatColor(after.behindColor)}, button blends into background`);
    }
    if (before.borderColor && colorDistance(after.color, before.borderColor) <= 3) {
      blendedHovers.push(`${label}: hover background ${formatColor(after.color)} matches border color ${formatColor(before.borderColor)}, button becomes borderless patch`);
    }
  }
  await page.mouse.move(1, 1);

  return { layoutShifts, vanishedChildren, weakHovers, blendedHovers, borderHovers, overflowingLayers: [...overflowingLayers] };
}

// Open each popup trigger (menu, listbox, calendar) and, on touch screens, tap truncated text (where full
// name tooltip is attached), verifying opened overlay stays within screen bounds.
// Overlay where inner content is narrower than container: container sized to trigger button, content constrained by `max-w` leaving
// empty strip on right with scrollbar floating in between (occurred 2026-09-27, custom Select in seed project).
function findHollowLayers() {
  const hollowLayers = [];

  for (const node of document.querySelectorAll("body *")) {
    const style = getComputedStyle(node);
    const role = node.getAttribute("role") || "";
    const isPositioned = style.position === "fixed" || style.position === "absolute";
    const isLayer = ["listbox", "menu", "dialog"].includes(role) || (parseInt(style.zIndex, 10) || 0) >= 20;
    if (!isPositioned || !isLayer || style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width < 120 || rect.width > 640 || rect.height < 60) continue;

    const children = [...node.children].filter((child) => child.getBoundingClientRect().width > 0);
    if (children.length === 0) continue;
    const innerRight = rect.right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth);
    const contentRight = Math.max(...children.map((child) => child.getBoundingClientRect().right));
    const emptyWidth = innerRight - contentRight;
    if (emptyWidth > 24) {
      const label = `${role || node.tagName.toLowerCase()} "${node.textContent.trim().replace(/\s+/g, " ").slice(0, 30)}"`;
      hollowLayers.push(`${label} width ${Math.round(rect.width)}px but content leaves ${Math.round(emptyWidth)}px empty on right`);
    }
  }

  return hollowLayers;
}

// Container and separator of open overlay heavier than project `--border` token: menu styled with `border-strong`
// on both container and separator leaves 18h (separator vs container) unflagged (occurred 2026-09-28, account menu:
// container and both separators #eaeaea; skill pattern uses `border-border` #f7f7f8). If no `--border`, skip.
function findHeavyLayerLines() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const toLuminance = (cssColor) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillStyle = cssColor;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    if (alpha === 0) return null;
    const opacity = alpha / 255;

    // Semi-transparent border rendered over white container background.
    return (0.2126 * (red * opacity + 255 * (1 - opacity)) + 0.7152 * (green * opacity + 255 * (1 - opacity)) + 0.0722 * (blue * opacity + 255 * (1 - opacity))) / 255;
  };
  // Contrast of lines on white background. Skill decorative border ~1.07:1; project border token around
  // `#e2e8f0` (~1.23:1) is also heavy (M14), so also compare against absolute threshold, not just token.
  const toContrastOnWhite = (cssColor) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillStyle = cssColor;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    if (alpha === 0) return null;
    const opacity = alpha / 255;
    const toLinear = (channel) => {
      const value = (channel * opacity + 255 * (1 - opacity)) / 255;

      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    const luminance = 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);

    return 1.05 / (luminance + 0.05);
  };
  const rootStyle = getComputedStyle(document.documentElement);
  const tokenColor = rootStyle.getPropertyValue("--border").trim() || rootStyle.getPropertyValue("--color-border").trim();
  const tokenLuminance = tokenColor ? toLuminance(tokenColor) : null;

  const describeLayer = (element) => `${element.tagName.toLowerCase()}${element.getAttribute("role") ? `[role=${element.getAttribute("role")}]` : ""} "${(element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30)}"`;
  const findings = [];
  for (const layer of document.querySelectorAll("[role='menu'], [role='listbox'], [data-radix-popper-content-wrapper] > *, [popover]")) {
    const rect = layer.getBoundingClientRect();
    if (rect.width === 0 || getComputedStyle(layer).visibility === "hidden") continue;
    const lines = [];
    const layerStyle = getComputedStyle(layer);
    if (parseFloat(layerStyle.borderTopWidth) > 0) lines.push({ what: "container border", color: layerStyle.borderTopColor });
    const separator = layer.querySelector("hr, [role='separator']");
    if (separator) {
      const separatorStyle = getComputedStyle(separator);
      lines.push({ what: "separator line", color: parseFloat(separatorStyle.borderTopWidth) > 0 ? separatorStyle.borderTopColor : separatorStyle.backgroundColor });
    }
    const heavy = lines.filter((line) => {
      const luminance = toLuminance(line.color);
      const contrast = toContrastOnWhite(line.color);
      const isDarkerThanToken = luminance !== null && tokenLuminance !== null && tokenLuminance - luminance > 0.02;

      return isDarkerThanToken || (contrast !== null && contrast >= 1.15);
    });
    if (heavy.length > 0) findings.push(`${heavy.map((line) => `${line.what} ${line.color} (~${toContrastOnWhite(line.color).toFixed(2)}:1 on white)`).join(", ")}, decorative border should be ~1.1:1${tokenColor ? `, token --border ${tokenColor}` : ""}: ${describeLayer(layer)}`);
  }

  return findings;
}

// Browser-native controls inside overlays: select, date/time input, checkbox, radio, slider, file picker,
// color picker. In-page checks only see visible elements, so overlays must be checked separately (occurred 2026-09-29,
// native checkbox in "Other area" menu; 2026-09-30, native select and date input in warehouse wireframe "Create ticket" dialog).
// Two invocation modes:
// - "hidden": overlay currently hidden but still in DOM (closed `<dialog>`, popover, `[hidden]`, hidden role dialog/menu/
//   listbox). Computed styles readable even when `display: none`.
// - "opened": overlay opened after click (modal mounted to DOM upon open). Overlays visible prior to click carry
//   `data-forge-seen-layer` or `data-forge-before`, excluded.
function findNativeControls(mode) {
  const layerSelector = "dialog, [popover], [role='dialog'], [role='menu'], [role='listbox'], [data-radix-popper-content-wrapper], [hidden]";
  const describeLayer = (layer) => `${layer.tagName.toLowerCase()}${layer.getAttribute("role") ? `[role=${layer.getAttribute("role")}]` : ""} "${(layer.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30)}"`;
  const isShown = (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden";

  function kindOf(control) {
    const style = getComputedStyle(control);
    // Input with custom element overlaid (sr-only, transparent, pointer-events-none) is not an exposed native control.
    if (Number(style.opacity) <= 0.1 || parseFloat(style.width) <= 2 || style.clip === "rect(0px, 0px, 0px, 0px)") return null;
    if (control.tagName === "SELECT") return ["auto", "menulist"].includes(style.appearance) ? "unstyled native select" : `styled native select (${control.options.length} options)`;
    if (["date", "time", "datetime-local", "month", "week"].includes(control.type)) return `native ${control.type} input`;
    if (["checkbox", "radio"].includes(control.type)) return style.appearance === "none" ? null : `native ${control.type}${style.accentColor !== "auto" ? " (accent-color only)" : ""}`;
    if (control.type === "range") return style.appearance === "none" || style.pointerEvents === "none" ? null : "native slider";
    if (control.type === "file") return "native file input";
    if (control.type === "color") return "native color picker";

    return null;
  }

  const found = new Map();
  for (const control of document.querySelectorAll("select, input")) {
    const layer = control.closest(layerSelector);
    if (!layer) continue;
    const outerLayer = [...document.querySelectorAll(layerSelector)].find((candidate) => candidate.contains(layer) && !candidate.parentElement?.closest(layerSelector)) || layer;
    if (mode === "hidden" && isShown(control)) continue;
    if (mode === "opened" && (!isShown(control) || outerLayer.dataset.forgeSeenLayer || outerLayer.dataset.forgeBefore)) continue;
    const kind = kindOf(control);
    if (!kind) continue;
    const key = describeLayer(outerLayer);
    found.set(key, [...new Set([...(found.get(key) || []), kind])]);
  }

  return [...found].slice(0, 6).map(([layer, kinds]) => `${kinds.join(", ")} in ${layer}${mode === "hidden" ? " (hidden)" : ""}`);
}

// Newly opened overlay: does it animate open (overlay.md, "Motion"). Menus toggled via `{isOpen && …}`
// or `display` appear abruptly. Native controls inside measured by `findNativeControls`.
function findPopupDetails(freezeCss) {
  // Probe disables transitions for stable screenshots (freezeMotionCss); overlay mounted to DOM after recording
  // `data-forge-transition`, so temporarily disable freeze block to read actual styles, re-enable after.
  const freezeTags = [...document.querySelectorAll("style")].filter((tag) => tag.textContent === freezeCss);
  for (const tag of freezeTags) tag.media = "not all";
  const describeLayer = (element) => `${element.tagName.toLowerCase()}${element.getAttribute("role") ? `[role=${element.getAttribute("role")}]` : ""} "${(element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30)}"`;
  const motionProperties = ["all", "opacity", "transform", "scale", "translate"];
  const motionless = [];
  const scrollyLayers = [];
  for (const layer of document.querySelectorAll("[role='menu'], [role='listbox'], [role='dialog'], [data-radix-popper-content-wrapper] > *, [popover]")) {
    const rect = layer.getBoundingClientRect();
    // Overlays already visible prior to click (in-page listbox, not overlay) excluded.
    if (rect.width === 0 || layer.dataset.forgeSeenLayer || getComputedStyle(layer).visibility === "hidden") continue;
    // Overlay nested inside another overlay (listbox in Select popover frame): outer container is the overlay.
    if (layer.parentElement?.closest("[role='menu'], [role='listbox'], [role='dialog'], [popover]")) continue;
    // Transitions may reside on wrapper: walk up to closest floating container (fixed / absolute).
    let hasMotion = false;
    for (let node = layer, depth = 0; node && node !== document.body && depth < 8; node = node.parentElement, depth += 1) {
      const style = getComputedStyle(node);
      const durations = style.transitionDuration.split(",").map((duration) => parseFloat(duration));
      const hasTransition = style.transitionProperty.split(",").some((property, index) => motionProperties.includes(property.trim()) && (durations[index] ?? durations[0]) > 0);
      if (style.animationName !== "none" || hasTransition) {
        hasMotion = true;
        break;
      }
      if (["fixed", "absolute"].includes(style.position)) break;
    }
    if (!hasMotion) motionless.push(describeLayer(layer));
    // Stray scrollbar: overlay scrolls horizontally, or scrolls vertically with deficit under one row (manually sized container smaller
    // than content; native `[popover]` has default `overflow: auto`). Long listbox deficit across many rows scrolling is intentional.
    for (const box of [layer, ...layer.querySelectorAll("*")]) {
      const style = getComputedStyle(box);
      const overflowX = box.scrollWidth - box.clientWidth;
      const overflowY = box.scrollHeight - box.clientHeight;
      const isScrollableX = ["auto", "scroll"].includes(style.overflowX) && overflowX > 1;
      const isScrollableY = ["auto", "scroll"].includes(style.overflowY) && overflowY > 1 && overflowY < 40;
      if (!isScrollableX && !isScrollableY) continue;
      scrollyLayers.push(`${describeLayer(layer)}: ${isScrollableX ? `horizontal scroll deficit ${overflowX}px` : ""}${isScrollableX && isScrollableY ? ", " : ""}${isScrollableY ? `vertical scroll deficit ${overflowY}px` : ""}`);
      break;
    }
  }
  for (const tag of freezeTags) tag.media = "all";

  return { motionless, scrollyLayers };
}

// Overlay item (option, menuitem) declaring fixed height where long text wraps, overflows item, and overlaps
// subsequent item. Occurred 2026-10-05, "Course ▾" filter in comment review page: `h-10` item, 3-line course title
// stacked onto next item. Measured via text `Range`, not scrollHeight (`overflow-visible` items report full scrollHeight).
function findCrampedOptions() {
  const crampedOptions = [];

  for (const option of document.querySelectorAll("[role='option'], [role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox']")) {
    const style = getComputedStyle(option);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const rect = option.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const range = document.createRange();
    range.selectNodeContents(option);
    const textRects = [...range.getClientRects()].filter((textRect) => textRect.width > 0 && textRect.height > 0);
    if (textRects.length === 0) continue;
    const textTop = Math.min(...textRects.map((textRect) => textRect.top));
    const textBottom = Math.max(...textRects.map((textRect) => textRect.bottom));
    const spill = Math.max(rect.top - textTop, textBottom - rect.bottom);
    if (spill > 2) {
      const text = option.textContent.trim().replace(/\s+/g, " ").slice(0, 40);
      crampedOptions.push(`"${text}": option height ${Math.round(rect.height)}px but text height ${Math.round(textBottom - textTop)}px, spills ${Math.round(spill)}px overlapping adjacent option`);
    }
  }

  // Adjacent items with under 4px spacing (`gap-0.5`, touching): two-line names of adjacent items merge into a blob.
  // `gap-1` items is standard (`layouts/overlay.md`). Only compare siblings vertically aligned under same parent.
  const seenParents = new Set();
  for (const option of document.querySelectorAll("[role='option'], [role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox']")) {
    const parent = option.parentElement;
    if (!parent || seenParents.has(parent)) continue;
    seenParents.add(parent);
    const siblings = [...parent.children].filter((child) => child.matches("[role^='option'], [role^='menuitem']") && child.getBoundingClientRect().height > 0);
    for (let i = 1; i < siblings.length; i++) {
      const gap = siblings[i].getBoundingClientRect().top - siblings[i - 1].getBoundingClientRect().bottom;
      if (gap >= 0 && gap < 3.5) {
        const text = siblings[i].textContent.trim().replace(/\s+/g, " ").slice(0, 40);
        crampedOptions.push(`"${text}": gap to item above ${Math.round(gap * 10) / 10}px, below 4px (\`gap-1\`)`);
        break;
      }
    }
  }

  return crampedOptions.slice(0, 8);
}

async function probePopupLayers(page, isMobile, isDark = false) {
  const overflowingLayers = new Set();
  const sunkenSelections = new Set();
  const hollowLayers = new Set();
  const crampedOptions = new Set();
  const checkedHoverChanges = new Set();
  const heavyLayerLines = new Set();
  const motionlessLayers = new Set();
  const nativeChoices = new Set();
  const scrollyLayers = new Set();
  const lostTriggerIcons = new Set();
  const hollowBefore = new Set(await page.evaluate(findHollowLayers));
  const triggerIds = await page.evaluate(({ popupLimit, tapLimit, isTouch }) => {
    const ids = [];
    const popupTriggers = [...document.querySelectorAll("[aria-haspopup]:not([aria-haspopup='false'])")].filter((element) => element.getBoundingClientRect().width > 0).slice(0, popupLimit);
    for (const element of popupTriggers) {
      element.dataset.forgePopupId = `popup-${ids.length}`;
      ids.push(element.dataset.forgePopupId);
    }
    if (isTouch) {
      const truncated = [...document.querySelectorAll("body *")]
        .filter((element) => element.children.length === 0 && element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).textOverflow === "ellipsis" && !element.closest("a[href]"))
        .slice(0, tapLimit);
      for (const element of truncated) {
        element.dataset.forgePopupId = `tap-${ids.length}`;
        ids.push(element.dataset.forgePopupId);
      }
    }

    return ids;
  }, { popupLimit: maxPopupTriggers, tapLimit: maxTruncatedTaps, isTouch: isMobile });
  // Trigger button inside closed `<dialog>` (select, date picker of creation form): open dialog and test immediately:
  // calendar scrollbars and lost icon on selection only surface there (occurred 2026-09-30, warehouse wireframe).
  const dialogTriggerIds = await page.evaluate((limit) => {
    const ids = [];
    [...document.querySelectorAll("dialog:not([open])")].slice(0, 2).forEach((dialog, dialogIndex) => {
      for (const element of [...dialog.querySelectorAll("[aria-haspopup]:not([aria-haspopup='false'])")].slice(0, limit)) {
        element.dataset.forgePopupId = `dialog${dialogIndex}-${ids.length}`;
        ids.push(element.dataset.forgePopupId);
      }
    });

    return ids;
  }, maxPopupTriggers);

  for (const triggerId of [...triggerIds, ...dialogTriggerIds]) {
    const locator = page.locator(`[data-forge-popup-id="${triggerId}"]`);
    const isTap = triggerId.startsWith("tap-");
    if (triggerId.startsWith("dialog")) {
      await page.evaluate((id) => {
        const dialog = document.querySelector(`[data-forge-popup-id="${id}"]`)?.closest("dialog");
        if (!dialog || dialog.open) return;
        dialog.showModal();
        dialog.dataset.forgeSeenLayer = "1";
        dialog.dataset.forgeProbeOpened = "1";
      }, triggerId);
      await page.waitForTimeout(200);
    }
    await page.evaluate(() => {
      for (const layer of document.querySelectorAll("[role='menu'], [role='listbox'], [role='dialog'], [popover]")) {
        if (layer.getBoundingClientRect().width > 0 && Number(getComputedStyle(layer).opacity) > 0.5) layer.dataset.forgeSeenLayer = "1";
      }
    });
    const isDone = await (isTap ? locator.tap({ timeout: 800, force: true }) : locator.click({ timeout: 800, force: true })).then(() => true, () => false);
    if (!isDone) continue;
    await page.waitForTimeout(250);
    for (const layer of await page.evaluate(findOverflowingLayers)) overflowingLayers.add(`${isTap ? "tap truncated text" : "open"}: ${layer}`);
    for (const layer of await page.evaluate(findHollowLayers)) if (!hollowBefore.has(layer)) hollowLayers.add(layer);
    for (const option of await page.evaluate(findCrampedOptions)) crampedOptions.add(option);
    // Choice input inside overlay (popover filter) only visible when open; re-check hover on selected item here.
    if (!isTap && !isMobile) for (const change of await findCheckedHoverChanges(page)) checkedHoverChanges.add(change);
    if (!isTap) for (const line of await page.evaluate(findHeavyLayerLines)) heavyLayerLines.add(line);
    // Newly opened overlay often pre-highlights first item (focused): check if highlighted item cuts a hole in dark mode.
    if (!isTap && isDark) for (const line of await page.evaluate(findSunkenSelections)) sunkenSelections.add(line);
    if (!isTap) {
      const details = await page.evaluate(findPopupDetails, freezeMotionCss);
      for (const layer of details.motionless) motionlessLayers.add(layer);
      for (const control of await page.evaluate(findNativeControls, "opened")) nativeChoices.add(control);
      for (const layer of details.scrollyLayers) scrollyLayers.add(layer);
    }
    // Selectors (select, date picker): select an item or date and verify trigger button retains icon. Re-rendering button
    // after selection while omitting icon (wireframe overwriting `innerHTML` without calling `lucide.createIcons()`)
    // loses chevron / calendar icon until next open (occurred 2026-09-30, warehouse wireframe, select and date input).
    if (!isTap) {
      const pickedTrigger = await page.evaluate((id) => {
        const trigger = document.querySelector(`[data-forge-popup-id="${id}"]`);
        const isPicker = trigger?.getAttribute("role") === "combobox" || ["listbox", "dialog", "grid"].includes(trigger?.getAttribute("aria-haspopup"));
        if (!isPicker) return null;
        const isInOpenedLayer = (element) => {
          const layer = element.closest("[role='listbox'], [role='dialog'], [role='grid'], [popover], [data-radix-popper-content-wrapper]");

          return Boolean(layer) && !layer.dataset.forgeSeenLayer && element.getClientRects().length > 0;
        };
        const options = [...document.querySelectorAll("[role='option']:not([aria-selected='true']):not([aria-disabled='true'])")].filter(isInOpenedLayer);
        // Date picker: button with single number 1–31, unselected, not belonging to adjacent month.
        const days = [...document.querySelectorAll("button:not([disabled])")]
          .filter((button) => isInOpenedLayer(button) && /^\d{1,2}$/.test((button.textContent || "").trim()) && button.getAttribute("aria-selected") !== "true" && !button.closest("[aria-selected='true']") && !/outside/.test(`${button.className} ${button.parentElement?.className || ""}`));
        const pick = options[0] || days[days.length > 15 ? 15 : 0];
        if (!pick) return null;
        pick.click();

        // Empty table cell `—` with `calendar-plus` icon + "Set due date" only when empty (`layouts/app.md`, "Empty cell
        // pattern"): once date is picked, removing icon is standard pattern (false positive 2026-10-01, task board due date column).
        const isEmptyCellTrigger = (trigger.textContent || "").trim().startsWith("—");

        return { label: `${trigger.tagName.toLowerCase()} "${(trigger.textContent || "").trim().slice(0, 30)}"`, iconCount: isEmptyCellTrigger ? 0 : trigger.querySelectorAll("svg").length };
      }, triggerId);
      if (pickedTrigger) {
        await page.waitForTimeout(250);
        // Lost icon: previously had svg but none remain, or unrendered `<i data-lucide>` remains (indicates wireframe
        // rewrote innerHTML without calling `createIcons()`).
        const after = await locator.evaluate((trigger) => ({ iconCount: trigger.querySelectorAll("svg").length, placeholderCount: trigger.querySelectorAll("i[data-lucide]").length })).catch(() => ({ iconCount: 1, placeholderCount: 0 }));
        if (after.placeholderCount > 0 || (pickedTrigger.iconCount > 0 && after.iconCount === 0)) lostTriggerIcons.add(`after selection at ${pickedTrigger.label} trigger button loses icon (chevron, calendar) until next open${after.placeholderCount > 0 ? ", unrendered <i data-lucide> tag remains" : ""}`);
      }
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(120);
  }
  if (dialogTriggerIds.length > 0) {
    await page.evaluate(() => {
      for (const dialog of document.querySelectorAll("dialog[data-forge-probe-opened]")) if (dialog.open) dialog.close();
    });
  }

  return {
    overflowing: [...overflowingLayers],
    hollow: [...hollowLayers],
    cramped: [...crampedOptions],
    checkedHoverChanges: [...checkedHoverChanges],
    heavyLayerLines: [...heavyLayerLines],
    motionless: [...motionlessLayers],
    nativeChoices: [...nativeChoices],
    scrollyLayers: [...scrollyLayers],
    lostTriggerIcons: [...lostTriggerIcons],
    sunkenSelections: [...sunkenSelections],
  };
}

// Open collapsed containers (accordions, collapsible items) to re-evaluate inner content. Skip popup triggers (menus,
// calendars) and sidebar/menu toggles on mobile: opening them covers entire screen (occurred 2026-09-26: gap bug
// around "…" breadcrumb button inside pre-collapsed accordion at /components).
async function expandCollapsedBlocks(page) {
  const count = await page.evaluate(() => {
    let expandedCount = 0;
    for (const button of document.querySelectorAll("[aria-expanded='false'][aria-controls]:not([aria-haspopup])")) {
      const label = `${button.getAttribute("aria-label") || ""} ${button.textContent || ""}`.toLowerCase();
      if (/sidebar|menu|điều hướng|thanh bên/.test(label) || button.getBoundingClientRect().width === 0) continue;
      button.click();
      expandedCount += 1;
    }

    return expandedCount;
  });
  if (count > 0) await page.waitForTimeout(300);

  return count;
}

// ---------- Shapes across states on the same element ----------
// Compact calendar 2026-09-26 (pass 2): hover produced 46×48 square background next to 32px round selection circle; Tab produced
// square focus ring around circular item; mouse click left selected item with square background overlapping black circle: three shapes
// for one date cell. For each group with selected item: pick unselected item of same type, hover, Tab, click and leave
// mouse resting, compare resulting shape against selected item shape.

const maxStateGroups = 15;

// What element and descendants (two levels) render: background and ring (outline / box-shadow), with dimensions,
// roundness flag, and child path (`0` is element itself) to compare before and after.
function readStatePaints(probeId) {
  const element = document.querySelector(`[data-forge-state-id="${probeId}"]`);
  if (!element) return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const readAlpha = (cssColor) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillStyle = cssColor;
    context.fillRect(0, 0, 1, 1);

    return context.getImageData(0, 0, 1, 1).data[3] / 255;
  };
  const paints = [];
  const hostRect = element.getBoundingClientRect();
  const visit = (node, path, depth) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    if (rect.width >= 6 && rect.height >= 6) {
      const radiusText = style.borderTopLeftRadius;
      const radius = radiusText.endsWith("%") ? (parseFloat(radiusText) / 100) * rect.width : parseFloat(radiusText) || 0;
      const shape = {
        path,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        // Background coverage over element: two tabs with different text lengths differ in width but both provide
        // full coverage, not a shape mismatch (false positive during testing, Week / Month tab row).
        coverWidth: rect.width / hostRect.width,
        coverHeight: rect.height / hostRect.height,
        isRound: radius >= Math.min(rect.width, rect.height) / 2 - 1,
      };
      if (readAlpha(style.backgroundColor) > 0.05) paints.push({ kind: "bg", ...shape, paint: style.backgroundColor });
      const hasOutline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
      if (hasOutline || style.boxShadow !== "none") paints.push({ kind: "ring", ...shape, paint: hasOutline ? `outline ${style.outlineWidth} ${style.outlineColor}` : style.boxShadow });
    }
    if (depth < 2) [...node.children].forEach((child, index) => visit(child, `${path}.${index}`, depth + 1));
  };
  visit(element, "0", 0);

  return paints;
}

function findNewPaints(after, before, kind) {
  const seen = new Set(before.filter((paint) => paint.kind === kind).map((paint) => `${paint.path}|${paint.paint}`));

  return after.filter((paint) => paint.kind === kind && !seen.has(`${paint.path}|${paint.paint}`));
}

function pickLargestPaint(paints) {
  return paints.reduce((largest, paint) => (!largest || paint.width * paint.height > largest.width * largest.height ? paint : largest), null);
}

// Two distinct elements (unselected item vs selected item): compare coverage. Same element (outer container
// vs inner child): compare dimensions.
function isDifferentCover(first, second) {
  return first.isRound !== second.isRound || Math.abs(first.coverWidth - second.coverWidth) > 0.1 || Math.abs(first.coverHeight - second.coverHeight) > 0.1;
}

function isDifferentShape(first, second) {
  return first.isRound !== second.isRound || Math.abs(first.width - second.width) > 4 || Math.abs(first.height - second.height) > 4;
}

function describePaint(paint) {
  return `${paint.width}×${paint.height} ${paint.isRound ? "round" : "square"} on ${paint.path === "0" ? "entire element" : "inner child"}`;
}

async function probeStateShapes(page) {
  const shapeMismatches = [];
  const stuckStates = [];
  const hoverLikeSelected = [];

  const groups = await page.evaluate((limit) => {
    // Today (`aria-current="date"`) is not an active selection: rendering differently from selected date is correct.
    const selectedSelector = "[aria-pressed='true'], [aria-selected='true'], [aria-current]:not([aria-current='false']):not([aria-current='date'])";
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();

      return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== "hidden" && !element.closest("[inert], [aria-hidden='true']");
    };
    const seenGroups = new Set();
    const found = [];

    for (const selected of document.querySelectorAll(selectedSelector)) {
      if (found.length >= limit || !isVisible(selected)) continue;
      const group = selected.closest("[role='group'], [role='grid'], [role='tablist'], [role='listbox'], [role='radiogroup'], nav, ul, ol, table") || selected.parentElement?.parentElement;
      if (!group || seenGroups.has(group)) continue;
      // Items of same type carry same state attribute: `aria-pressed` chip compared against chip, not adjacent "Today"
      // button (false positive 2026-09-30, doctor chip row in appointment wireframe, group fell back to chip grandparent).
      const stateAttribute = ["aria-pressed", "aria-selected"].find((attribute) => selected.hasAttribute(attribute));
      const sibling = [...group.querySelectorAll(selected.tagName)].find(
        (candidate) =>
          candidate !== selected &&
          candidate.getAttribute("role") === selected.getAttribute("role") &&
          (!stateAttribute || candidate.hasAttribute(stateAttribute)) &&
          !candidate.matches(selectedSelector) &&
          !candidate.matches(":disabled, [aria-disabled='true']") &&
          !candidate.contains(selected) &&
          !selected.contains(candidate) &&
          isVisible(candidate),
      );
      if (!sibling) continue;
      seenGroups.add(group);
      // Full-row link (`::after` inset-0) inside title: selected and hover backgrounds render on wrapping `<li>`,
      // not link. Measure on row (missed 2026-09-28, job listing).
      const selectedRow = selected.tagName === "A" ? selected.closest("li") : null;
      const siblingRow = selectedRow && group.contains(selectedRow) ? sibling.closest("li") : null;
      (siblingRow ? selectedRow : selected).dataset.forgeStateId = `selected-${found.length}`;
      (siblingRow || sibling).dataset.forgeStateId = `sibling-${found.length}`;
      // Test click only on in-place toggle buttons: links navigate away, submit buttons submit forms.
      const isSubmit = sibling.tagName === "BUTTON" && sibling.type === "submit" && sibling.form;
      const canClick = !sibling.closest("a[href]") && !isSubmit;
      const groupName = group.getAttribute("aria-label") || "";
      const text = (selected.getAttribute("aria-label") || selected.textContent || "").trim().replace(/\s+/g, " ").slice(0, 24);
      found.push({ index: found.length, canClick, isTableRow: selected.tagName === "TR", label: `${selected.tagName.toLowerCase()} "${text}"${groupName ? ` trong "${groupName}"` : ""}` });
    }

    return found;
  }, maxStateGroups);

  for (const group of groups) {
    const siblingId = `sibling-${group.index}`;
    const sibling = page.locator(`[data-forge-state-id="${siblingId}"]`);
    await page.mouse.move(1, 1);
    await page.evaluate(() => document.activeElement?.blur());
    const isReady = await sibling.scrollIntoViewIfNeeded({ timeout: 800 }).then(() => true, () => false);
    if (!isReady) continue;

    const selectedPaints = await page.evaluate(readStatePaints, `selected-${group.index}`);
    const selectedShape = pickLargestPaint((selectedPaints || []).filter((paint) => paint.kind === "bg"));
    const restPaints = await page.evaluate(readStatePaints, siblingId);
    if (!selectedPaints || !restPaints) continue;

    // Hover: newly revealed background must match shape of selected item background.
    const isHovered = await sibling.hover({ timeout: 800, force: true }).then(() => true, () => false);
    await page.waitForTimeout(60);
    const hoverPaints = isHovered ? await page.evaluate(readStatePaints, siblingId) : null;
    const hoverShape = hoverPaints && pickLargestPaint(findNewPaints(hoverPaints, restPaints, "bg"));
    if (selectedShape && hoverShape && isDifferentCover(hoverShape, selectedShape)) {
      shapeMismatches.push(`${group.label}: hover shows background ${describePaint(hoverShape)}, selected has background ${describePaint(selectedShape)}`);
    }
    // Hover matching exact background of selected item: hovering over any item looks like it was just selected (left list
    // of list + detail layout, 2026-09-28). Table row checked checkbox sharing hover background is approved rule
    // (`I10`), excluded.
    if (selectedShape && hoverShape && !group.isTableRow && hoverShape.paint === selectedShape.paint) {
      hoverLikeSelected.push(`${group.label}: hover shows background ${hoverShape.paint}, matches selected item background`);
    }


    if (!group.canClick) continue;
    // Click mouse and keep mouse resting on newly selected item: hover background must not overlay selected background, and
    // no ring may appear (`I13`).
    const isClicked = await sibling.click({ timeout: 800 }).then(() => true, () => false);
    if (!isClicked) continue;
    await page.waitForTimeout(150);
    const clickedPaints = await page.evaluate(readStatePaints, siblingId);
    if (clickedPaints) {
      const backgrounds = clickedPaints.filter((paint) => paint.kind === "bg");
      for (const outer of backgrounds) {
        const inner = backgrounds.find((paint) => paint.path.startsWith(`${outer.path}.`) && isDifferentShape(paint, outer) && paint.width * paint.height > 0.3 * outer.width * outer.height);
        if (inner) {
          stuckStates.push(`${group.label}: clicked and resting, background ${describePaint(outer)} overlaps background ${describePaint(inner)}`);
          break;
        }
      }
      const clickRing = pickLargestPaint(findNewPaints(clickedPaints, selectedPaints, "ring").filter((paint) => !restPaints.some((rest) => rest.kind === "ring" && rest.path === paint.path && rest.paint === paint.paint)));
      if (clickRing) stuckStates.push(`${group.label}: mouse click shows ring ${describePaint(clickRing)} (skill does not draw focus ring, I13)`);
    }
    await page.keyboard.press("Escape");
  }
  await page.mouse.move(1, 1);

  return { shapeMismatches, stuckStates, hoverLikeSelected, groupCount: groups.length };
}

// Hovering selected control (checkbox, radio) turns accent color gray: `hover:border-*` comes after `checked:` in Tailwind v4
// CSS, overriding selected color (2026-09-28, price filter radio). Measure border and background colors before and after hover; colored
// resting state turning gray, or shifting hue significantly, is a bug.
async function findCheckedHoverChanges(page) {
  const ids = await page.evaluate(() => {
    const controls = [...document.querySelectorAll("input[type='checkbox']:checked, input[type='radio']:checked, [role='checkbox'][aria-checked='true'], [role='radio'][aria-checked='true']")]
      .filter((control) => {
        const rect = control.getBoundingClientRect();

        return rect.width > 0 && rect.height > 0 && !control.closest("[inert], [aria-hidden='true']") && getComputedStyle(control).visibility !== "hidden";
      })
      .slice(0, 4);
    controls.forEach((control, index) => { control.dataset.forgeCheckedId = String(index); });

    return controls.map((_, index) => String(index));
  });
  const readPaint = (id) => page.evaluate((checkedId) => {
    const control = document.querySelector(`[data-forge-checked-id="${checkedId}"]`);
    const style = getComputedStyle(control);
    const label = (control.closest("label")?.textContent || control.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 24);

    return { border: style.borderTopColor, background: style.backgroundColor, label: `${control.getAttribute("type") || control.getAttribute("role")} "${label}"` };
  }, id);
  const parseRgb = (color) => (color.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const saturation = (rgb) => (rgb.length < 3 ? 0 : Math.max(...rgb) - Math.min(...rgb));
  const changes = [];
  for (const id of ids) {
    const before = await readPaint(id);
    const isHovered = await page.locator(`[data-forge-checked-id="${id}"]`).hover({ timeout: 800, force: true }).then(() => true, () => false);
    if (!isHovered) continue;
    await page.waitForTimeout(60);
    const after = await readPaint(id);
    for (const key of ["border", "background"]) {
      const beforeRgb = parseRgb(before[key]);
      const afterRgb = parseRgb(after[key]);
      // Blue-tinted gray (`slate`) still has ~40 channel delta, so compare relatively: chroma drops below 40% of original.
      if (saturation(beforeRgb) >= 40 && saturation(afterRgb) < saturation(beforeRgb) * 0.4 && before[key] !== after[key]) {
        changes.push(`${before.label}: hover ${key === "border" ? "border" : "background"} ${before[key]} → ${after[key]}`);
        break;
      }
    }
  }
  await page.mouse.move(1, 1);

  return changes;
}

function mergeMeasurements(base, extra) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    if (!Array.isArray(value) || !Array.isArray(base[key])) continue;
    const seen = new Set(base[key].map((item) => JSON.stringify(item)));
    merged[key] = [...base[key], ...value.filter((item) => !seen.has(JSON.stringify(item)))];
  }
  // Auto-scroll measurable only before user interaction: re-check after expanding collapsed containers has page pre-scrolled
  // to that container (false positive 2026-09-27, /dashboard 1280).
  merged.autoScrolledAreas = base.autoScrolledAreas;
  merged.hasHorizontalScroll = base.hasHorizontalScroll || extra.hasHorizontalScroll;
  merged.pageScrollWidth = Math.max(base.pageScrollWidth, extra.pageScrollWidth);

  return merged;
}

// ---------- Execution ----------

// App frame `h-screen` + content column `overflow-y-auto`: fullPage screenshot captures only one screen; content below
// scrolling column edge never appears in screenshot (default-bordered input at page bottom was missed, 2026-09-27). Extend window
// height by hidden portion of largest scroll container before screenshot, restore after.
function measureHiddenScrollHeight() {
  let hiddenHeight = 0;
  for (const container of document.querySelectorAll("body *")) {
    const overflowY = getComputedStyle(container).overflowY;
    if (!["auto", "scroll"].includes(overflowY) || container.clientHeight < window.innerHeight * 0.6) continue;
    hiddenHeight = Math.max(hiddenHeight, container.scrollHeight - container.clientHeight);
  }

  return hiddenHeight;
}

async function takeFullScreenshot(page, path) {
  const viewport = page.viewportSize();
  const hiddenHeight = await page.evaluate(measureHiddenScrollHeight);
  if (hiddenHeight > 1) {
    await page.setViewportSize({ width: viewport.width, height: Math.min(viewport.height + hiddenHeight, 12000) });
    await page.waitForTimeout(250);
  }
  await page.screenshot({ path, fullPage: true });
  if (hiddenHeight > 1) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(150);
  }
}

async function probeWidth(browser, options, width) {
  const isMobile = width < mobileWidthLimit;
  const context = await browser.newContext({
    viewport: { width, height: isMobile ? 812 : 900 },
    deviceScaleFactor: options.dpr,
    isMobile,
    hasTouch: isMobile,
    colorScheme: options.isDark ? "dark" : "light",
  });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text().slice(0, 200));
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error).slice(0, 200)));

  await page.goto(options.url, { waitUntil: "load" });
  // Record `transition` after page has hydrated: attaching attribute beforehand triggers React HTML mismatch (false positive
  // console error 2026-09-28, Next).
  await page.waitForTimeout(options.waitMs);
  await page.evaluate(stampTransitions);
  await page.addStyleTag({ content: freezeMotionCss });
  if (options.isDark) await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.waitForTimeout(150);

  // Measure before screenshot: fullPage screenshot on mobile viewports causes page to lose `(pointer: coarse)`,
  // shrinking `pointer-coarse:size-10` button to 28px and falsely reporting small tap target (occurred 2026-09-26).
  const measurements = await page.evaluate(measureInPage, { minTapSize, isMobile });

  const screenshotPath = join(options.out, `${width}${options.isDark ? "-dark" : ""}.png`);
  await takeFullScreenshot(page, screenshotPath);
  // Measure dark mode immediately after screenshot while page still matches image: subsequent hover, click, and overlay steps
  // may alter page state (occurred 2026-10-01: by the time check ran, overview chart had only 2/10 accent blocks).
  const darkModeProblemSet = new Set(options.isDark ? [...(await page.evaluate(findDarkModeProblems)), ...(await page.evaluate(findSunkenSelections)), ...(await page.evaluate(findHueDrifts))] : []);

  // Viewports not in --dynamic-widths (or --quick) skip all Tab, hover, click, and overlay steps below.
  const isDynamic = options.dynamicWidths.has(width);
  const isStaticOnly = isMobile || !isDynamic;
  const { drawnRings: drawnFocusRings, unmarkedFocusStops } = isStaticOnly ? { drawnRings: [], unmarkedFocusStops: [] } : await findDrawnFocusRings(page);

  // Open collapsed blocks before hover and tap: directory tree in collapsed accordion at /components reveals
  // filename tooltip screen overflow only once container is opened (2026-09-27).
  const expandedCount = isDynamic ? await expandCollapsedBlocks(page) : 0;
  const allMeasurements = expandedCount > 0 ? mergeMeasurements(measurements, await page.evaluate(measureInPage, { minTapSize, isMobile })) : measurements;
  // Newly opened block may contain overlay sample (statically displayed confirmation box with backdrop): re-run dark mode check once.
  if (options.isDark && expandedCount > 0) for (const line of [...(await page.evaluate(findDarkModeProblems)), ...(await page.evaluate(findSunkenSelections))]) darkModeProblemSet.add(line);

  // Touch screens lack hover: measure hover backgrounds on desktop viewports only.
  const hoverStates = isStaticOnly ? { layoutShifts: [], vanishedChildren: [], weakHovers: [], blendedHovers: [], borderHovers: [], overflowingLayers: [] } : await probeHoverStates(page);
  const popupLayers = !isDynamic
    ? { overflowing: [], hollow: [], checkedHoverChanges: [], heavyLayerLines: [], motionless: [], nativeChoices: [], scrollyLayers: [], lostTriggerIcons: [], sunkenSelections: [] }
    : await probePopupLayers(page, isMobile, options.isDark);
  for (const line of popupLayers.sunkenSelections) darkModeProblemSet.add(line);
  const darkModeProblems = [...darkModeProblemSet];
  const heavyDecorativeBorders = options.isDark ? [] : await page.evaluate(findHeavyDecorativeBorders);
  const scrollbarStyles = await page.evaluate(findScrollbarStyles);
  const heavyNavLinks = await page.evaluate(findHeavyNavLinks);
  const staticHoverBlocks = isMobile ? [] : await page.evaluate(findStaticHoverBlocks);
  const brokenImages = await page.evaluate(findBrokenImages);
  const misformattedNumbers = await page.evaluate(findMisformattedNumbers);
  const overflowingLayers = [...new Set([...hoverStates.overflowingLayers, ...popupLayers.overflowing])];
  // Run last: test clicks that change in-place selections (dates, tabs); other measurements must finish first.
  const pageCheckedHoverChanges = isStaticOnly ? [] : await findCheckedHoverChanges(page);
  const stateShapes = isStaticOnly ? { shapeMismatches: [], stuckStates: [], hoverLikeSelected: [], groupCount: 0 } : await probeStateShapes(page);
  // Truly last: each click requires a page reload.
  const hiddenNativeControls = isMobile ? [] : await page.evaluate(findNativeControls, "hidden");
  const openerLayers = isMobile && isDynamic ? await probeOpenerLayers(page, options, width) : { problems: [], flatLayers: [], openedShots: [], nativeControls: [] };

  await context.close();

  return {
    width,
    isDynamic,
    screenshotPath,
    consoleErrors: [...new Set(consoleErrors)],
    ...allMeasurements,
    expandedCount,
    drawnFocusRings,
    unmarkedFocusStops,
    hollowLayers: popupLayers.hollow,
    crampedOptions: popupLayers.cramped || [],
    openerLayerProblems: openerLayers.problems,
    flatOpenedLayers: openerLayers.flatLayers,
    openedLayerShots: openerLayers.openedShots,
    layoutShifts: hoverStates.layoutShifts,
    vanishedChildren: hoverStates.vanishedChildren,
    weakHovers: hoverStates.weakHovers,
    blendedHovers: hoverStates.blendedHovers,
    borderHovers: hoverStates.borderHovers,
    overflowingLayers,
    shapeMismatches: stateShapes.shapeMismatches,
    hoverLikeSelected: stateShapes.hoverLikeSelected,
    checkedHoverChanges: [...new Set([...pageCheckedHoverChanges, ...popupLayers.checkedHoverChanges])],
    heavyLayerLines: popupLayers.heavyLayerLines,
    motionlessLayers: popupLayers.motionless,
    popupNativeChoices: [...new Set([...popupLayers.nativeChoices, ...hiddenNativeControls, ...openerLayers.nativeControls])],
    scrollyLayers: popupLayers.scrollyLayers,
    lostTriggerIcons: popupLayers.lostTriggerIcons,
    heavyDecorativeBorders,
    scrollbarStyles,
    heavyNavLinks,
    staticHoverBlocks,
    brokenImages,
    misformattedNumbers,
    darkModeProblems,
    stuckStates: stateShapes.stuckStates,
    stateGroupCount: stateShapes.groupCount,
  };
}

// Heavy decorative border (M14): card or rounded container with 1px border where border line >= 1.21:1 on white. Skill ~1.07:1,
// `--border-strong` #eaeaea ~1.20:1 (table frame in seed project, approved by project lead); border tokens like `#e2e8f0`
// (~1.23:1) are considered heavy, reserved only for inputs and bordered buttons. Input wrappers (search input with icon) excluded.
function findHeavyDecorativeBorders() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const toContrastOnWhite = (cssColor) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillStyle = cssColor;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    if (alpha === 0) return null;
    // Colored borders (light red error banner, amber warning banner: `components/banner.md`) carry semantic
    // meaning, not decorative gray borders. False positive 2026-09-30: `border-red-200` on medical warning box.
    if (Math.max(red, green, blue) - Math.min(red, green, blue) > 24) return null;
    const opacity = alpha / 255;
    const toLinear = (channel) => {
      const value = (channel * opacity + 255 * (1 - opacity)) / 255;

      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };

    return 1.05 / (0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue) + 0.05);
  };
  const findings = new Map();
  for (const element of document.querySelectorAll("body *")) {
    if (findings.size >= 6) break;
    if (element.matches("input, textarea, select, button, a, label, [role='button'], [role='textbox'], [role='combobox']")) continue;
    // Focus ring display box on design system page is a state example, not decorative border (`D9`, 2026-09-30).
    if (element.closest("[data-demo-state]")) continue;
    const style = getComputedStyle(element);
    const widths = [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth];
    if (style.borderTopStyle !== "solid" || widths.some((borderWidth) => borderWidth !== "1px") || parseFloat(style.borderTopLeftRadius) < 6) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 60 || style.visibility === "hidden") continue;
    const field = element.querySelector("input:not([type='checkbox']):not([type='radio']):not([type='hidden']), textarea, select");
    if (field && field.getBoundingClientRect().height >= rect.height * 0.6) continue;
    const contrast = toContrastOnWhite(style.borderTopColor);
    if (contrast === null || contrast < 1.21 || findings.has(style.borderTopColor)) continue;
    const label = `${element.tagName.toLowerCase()}.${String(element.className).trim().split(/\s+/).slice(0, 4).join(".")}`;
    findings.set(style.borderTopColor, `${style.borderTopColor} (~${contrast.toFixed(2)}:1 on white): ${label} "${(element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30)}"`);
  }

  return [...findings.values()];
}

// Selected / active item styled with exact page background (`isHighlighted && "bg-background"`, `aria-current` + `bg-background`)
// inside a lighter container: in dark mode page background is darker than cards and overlays, making selected item look like a cutout (M21). Class
// written in JS condition cannot be caught by grepping `hover:bg-background`; measure computed color. Occurred 2026-10-01, select
// and command palette at /components. Called in dark mode only: in light mode page background darker than card is standard hierarchy.
function findSunkenSelections() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const readHex = (cssColor) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillStyle = cssColor;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;

    return alpha < 240 ? null : `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  };
  const pageHex = readHex(getComputedStyle(document.documentElement).getPropertyValue("--background").trim());
  if (!pageHex) return [];
  const findings = new Set();
  // Add skeleton shimmer `animate-pulse`: legacy pattern styled `bg-background`, turning into black holes in dark mode (2026-10-01).
  const selector = "[role=option], [role=menuitem], [role=menuitemradio], [role=tab], [aria-selected=true], [aria-current]:not([aria-current=false]), [data-highlighted], [data-selected=true], .animate-pulse, [role=progressbar]";
  // Track without role (common: `div.h-2.rounded-full` wrapping colored bar): identify by geometry. Height 2–12px, fully
  // rounded, width >= 60px, child with different fill color. Occurred 2026-10-01, "Revenue by channel" at /dashboard/revenue.
  const shapedTracks = [...document.querySelectorAll("div, span")].filter((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.height < 2 || rect.height > 12 || rect.width < 60) return false;
    if (parseFloat(getComputedStyle(element).borderTopLeftRadius) < rect.height / 2 - 0.5) return false;
    const fill = element.firstElementChild;

    return Boolean(fill) && readHex(getComputedStyle(fill).backgroundColor) !== null && fill.getBoundingClientRect().width < rect.width;
  });
  for (const element of shapedTracks) element.dataset.forgeTrack = "1";
  for (const element of document.querySelectorAll(`${selector}, [data-forge-track]`)) {
    if (findings.size >= 3) break;
    const rect = element.getBoundingClientRect();
    // `h-1`, `h-2` tracks and `h-3` skeleton shimmers are shorter than menu items: lower height floor specifically for them.
    const minHeight = element.matches(".animate-pulse, [role=progressbar], [data-forge-track]") ? 2 : 16;
    if (rect.width < 24 || rect.height < minHeight || readHex(getComputedStyle(element).backgroundColor) !== pageHex) continue;
    let ancestor = element.parentElement;
    let ancestorHex = null;
    while (ancestor && !ancestorHex) {
      ancestorHex = readHex(getComputedStyle(ancestor).backgroundColor);
      ancestor = ancestor.parentElement;
    }
    if (!ancestorHex || ancestorHex === pageHex) continue;
    const label = (element.textContent || element.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 30);
    const isSkeleton = element.classList.contains("animate-pulse");
    const isTrack = element.getAttribute("role") === "progressbar" || element.dataset.forgeTrack === "1";
    findings.add(isSkeleton || isTrack
      ? `${isTrack ? "progress bar track" : "skeleton shimmer"} styled with page background ${pageHex}, darker than container ${ancestorHex}, becoming black streak: use bg-foreground/5 (M21${isTrack ? ", components/charts.md" : ", components/empty-state.md"})`
      : `selected / active item styled with page background ${pageHex}, darker than container ${ancestorHex}, looking like cutout hole: use --item-hover (hover) or --secondary (selected) (M21): ${element.getAttribute("role") || element.tagName.toLowerCase()} "${label}"`);
  }

  return [...findings];
}

// Same colored text shifting hue between two themes (M7, "Dark theme selected by hue"): amber-700 orange in light theme, amber-400
// yellow in dark theme, reading as two distinct colors (project lead noticed 2026-10-01, task board). In dark mode temporarily remove `.dark`,
// re-read text color and re-add; motion is disabled so color changes instantly. Compare OKLCH hue, only for sufficiently chromatic text (chroma > 0.08).
function findHueDrifts() {
  const root = document.documentElement;
  if (!root.classList.contains("dark")) return [];
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const toOklch = (cssColor) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillStyle = cssColor;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    if (alpha < 200) return null;
    const [linearRed, linearGreen, linearBlue] = [red, green, blue].map((channel) => {
      const value = channel / 255;

      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    const long = Math.cbrt(0.4122214708 * linearRed + 0.5363325363 * linearGreen + 0.0514459929 * linearBlue);
    const medium = Math.cbrt(0.2119034982 * linearRed + 0.6806995451 * linearGreen + 0.1073969566 * linearBlue);
    const short = Math.cbrt(0.0883024619 * linearRed + 0.2817188376 * linearGreen + 0.6299787005 * linearBlue);
    const axisA = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short;
    const axisB = 0.0259040371 * long + 0.7827717662 * medium - 0.808477439 * short;
    const hex = `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;

    return { chroma: Math.hypot(axisA, axisB), hue: ((Math.atan2(axisB, axisA) * 180) / Math.PI + 360) % 360, hex };
  };
  const texts = [...document.querySelectorAll("body *")]
    .filter((element) => element.children.length === 0 && (element.textContent || "").trim() && element.getBoundingClientRect().width > 0)
    .slice(0, 600);
  const darkColors = texts.map((element) => toOklch(getComputedStyle(element).color));
  root.classList.remove("dark");
  const lightColors = texts.map((element) => toOklch(getComputedStyle(element).color));
  root.classList.add("dark");
  const findings = new Map();
  texts.forEach((element, index) => {
    const dark = darkColors[index];
    const light = lightColors[index];
    if (!dark || !light || dark.chroma < 0.08 || light.chroma < 0.08) return;
    const drift = Math.min(Math.abs(dark.hue - light.hue), 360 - Math.abs(dark.hue - light.hue));
    const key = `${light.hex}→${dark.hex}`;
    // 20°: sky-700 → sky-300 of avatar shifts 12° on original scale, measured via hex as 16°; eye still reads as single color.
    if (drift <= 20 || findings.has(key) || findings.size >= 4) return;
    findings.set(key, `colored text shifts hue between themes: light ${light.hex} (${Math.round(light.hue)}°) → dark ${dark.hex} (${Math.round(dark.hue)}°), drift ${Math.round(drift)}°, reads as two colors; pick dark tone by hue, e.g. amber-700 → orange-400 (M7): "${element.textContent.trim().slice(0, 30)}"`);
  });

  return [...findings.values()];
}

// Runs with `--dark` only (M21, M31, M32, V4). Four bug patterns visible only when dark mode is enabled:
// - page remains light: dark mode is declared only, or `dark:` follows system while tokens follow class;
// - light background patch in dark screen: badge, avatar, `-50`/`-100` banner, library toast not reading tokens;
// - borderless input: `dark:border-transparent`, leaving only faint background to mark typing area;
// - hover background `bg-background`: in dark mode page background is darker than cards, hover sinks into near invisibility.
// Also non-dark `color-scheme`: native scrollbar, date picker, autofill still render in light theme.
// Accent colors and primary text (primary buttons, inverted tooltips) are allowed to be bright, excluded.
function findDarkModeProblems() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const readRgba = (cssColor) => {
    if (!cssColor) return null;
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "rgba(0,0,0,0)";
    context.fillStyle = cssColor;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;

    return { red, green, blue, alpha: alpha / 255 };
  };
  const readLuminance = ({ red, green, blue }) => {
    const toLinear = (channel) => {
      const value = channel / 255;

      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };

    return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
  };
  const toHex = ({ red, green, blue }) => `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  const describe = (element) => {
    const classNames = String(element.className?.baseVal ?? element.className ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 4);
    const text = (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30);

    return `${element.tagName.toLowerCase()}${classNames.length > 0 ? `.${classNames.join(".")}` : ""}${text ? ` "${text}"` : ""}`;
  };
  const findings = [];

  const pageBackground = [document.body, document.documentElement]
    .map((element) => readRgba(getComputedStyle(element).backgroundColor))
    .find((color) => color && color.alpha > 0.5);
  if (!pageBackground || readLuminance(pageBackground) > 0.4) {
    return [`page not dark when --dark enabled (background ${pageBackground ? toHex(pageBackground) : "transparent, i.e. white"}): dark mode declared only, treat as unimplemented, skip dark check (V4). If project built custom dark mode, tokens did not toggle with \`dark\` class on <html>`];
  }

  const colorScheme = getComputedStyle(document.documentElement).colorScheme;
  if (!/dark/.test(colorScheme)) findings.push(`color-scheme of <html> is "${colorScheme}", not dark: native scrollbars, date pickers, autofill, <select> still render light theme (M31)`);

  const rootStyle = getComputedStyle(document.documentElement);
  // Pure white primary button hover: brightest element on dark screen (M23, occurred 2026-10-01, ui-ux-dashboard).
  const primaryHover = readRgba(rootStyle.getPropertyValue("--primary-hover").trim());
  if (primaryHover && primaryHover.alpha > 0.5 && readLuminance(primaryHover) > 0.95) {
    findings.push(`--primary-hover is ${toHex(primaryHover)}, primary button hover becomes pure white block: shift one step towards background, e.g. #cfd5e0 (M23)`);
  }
  const allowedBrights = ["--primary", "--primary-hover", "--foreground"]
    .map((name) => readRgba(rootStyle.getPropertyValue(name).trim()))
    .filter(Boolean)
    .map(toHex);
  const brightColors = new Map();
  const primaryHex = allowedBrights[0];
  const solidAccentBars = [];
  let borderlessFieldCount = 0;
  let sunkenHoverCount = 0;

  for (const element of document.querySelectorAll("body *")) {
    if (element.closest(".force-light, [data-demo-state]")) continue;
    if (element.matches("img, video, canvas, svg, svg *, picture, iframe")) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width < 12 || rect.height < 12) continue;
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;

    const className = String(element.className?.baseVal ?? element.className ?? "");
    if (sunkenHoverCount < 3 && /(^|\s)(hover|focus-visible|data-\[highlighted\]|data-\[selected=true\]):bg-background(\s|$)/.test(className)) {
      sunkenHoverCount += 1;
      findings.push(`hover background \`bg-background\` sinks into near invisibility on dark screens, use \`bg-item-hover\` (M21, I10): ${describe(element)}`);
    }

    const background = readRgba(style.backgroundColor);
    // 100% accent color chart bar: taller than buttons (>= 48px), narrow like column. Primary button is 40px tall so excluded.
    if (background && background.alpha > 0.95 && toHex(background) === primaryHex && rect.height >= 48 && rect.width <= 64) solidAccentBars.push(element);
    // Large light translucent overlay: `bg-foreground/40` behind modal; in dark mode foreground is near-white creating a bright
    // haze (occurred 2026-10-01, confirmation box sample at /components). Backdrop overlay must be `bg-black/…` (M32).
    if (background && background.alpha >= 0.2 && background.alpha < 0.5 && readLuminance(background) > 0.6 && rect.width >= 300 && rect.height >= 150 && findings.length < 8) {
      findings.push(`light translucent overlay ${toHex(background)} ${Math.round(background.alpha * 100)}% covering ${Math.round(rect.width)}×${Math.round(rect.height)}px: overlay behind modal/panel must be bg-black/…, not bg-foreground/… (M32): ${describe(element)}`);
    }
    if (background && background.alpha >= 0.5 && readLuminance(background) > 0.6) {
      const hex = toHex(background);
      if (!allowedBrights.includes(hex) && !brightColors.has(hex) && brightColors.size < 5) {
        brightColors.set(hex, `light background patch ${hex} in dark screen, ${Math.round(rect.width)}×${Math.round(rect.height)}px (M32): ${describe(element)}`);
      }
    }

    if (borderlessFieldCount < 3 && element.matches("input:not([type='checkbox']):not([type='radio']):not([type='hidden']):not([type='range']):not([type='file']):not([type='color']), textarea, select") && rect.width >= 60) {
      const border = readRgba(style.borderBottomColor);
      const hasBorder = parseFloat(style.borderBottomWidth) > 0 && border && border.alpha > 0.02;
      if (!hasBorder && background && background.alpha > 0) {
        borderlessFieldCount += 1;
        findings.push(`borderless input in dark mode, only faint background marks typing area: retain --border-strong (M32): ${describe(element)}`);
      }
    }
  }

  // Occurred 2026-10-01, "Weekly completed tasks" in ui-ux-dashboard: seven solid white bars were brightest block on screen.
  if (solidAccentBars.length >= 3) {
    findings.push(`${solidAccentBars.length} chart bars filled 100% accent color (near white), glaring on dark screen: use --chart-fill, 70% opacity on dark (M32, components/charts.md): ${describe(solidAccentBars[0])}`);
  }

  return [...brightColors.values(), ...findings];
}

// Vertical navigation (sidebar) bold text: skill standard is regular 400 for unselected items, only selected item
// `font-medium` (layouts/app.md). Entire column at 600 leaves selected item indistinguishable except by background, column heavier
// than content (occurred 2026-09-29, tim-phong-sua: rebuilt on branch U but sidebar retained 600 from old CSS).
// Hover background on unclickable container (I9 converse): non-interactive row that highlights on hover looks clickable but does
// nothing (missed 2026-10-01, lop-hoc: "Today classes" row `hover:bg-background`, no link, default cursor).
// Detected via Tailwind `hover:bg-*` classes; skips containers with revealable buttons (`group-hover:`, list-row.md) or
// pointer cursor (div with onClick).
function findStaticHoverBlocks() {
  const interactiveSelector = "a[href], button, input, select, textarea, label, summary, [role], [tabindex], [onclick], [contenteditable]";
  const findings = [];
  for (const node of document.querySelectorAll("[class*='hover:bg-']")) {
    const classes = (node.getAttribute("class") || "").split(/\s+/);
    if (!classes.some((name) => /^hover:bg-/.test(name))) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width * rect.height < 400 || node.closest(interactiveSelector)) continue;
    if (getComputedStyle(node).cursor === "pointer" || node.querySelector("[class*='group-hover:']")) continue;
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30);
    findings.push(`${node.tagName.toLowerCase()}.${classes.find((name) => /^hover:bg-/.test(name))} "${text}"`);
  }

  return [...new Map(findings.map((item) => [item.replace(/ ".*$/, ""), item])).values()].slice(0, 4).map((item) => `${item} (same pattern: ${findings.filter((other) => other.replace(/ ".*$/, "") === item.replace(/ ".*$/, "")).length})`);
}

function findHeavyNavLinks() {
  // Identify navigation column by layout rather than tags (sidebar often built with div): 4+ links sharing left edge,
  // width 150–360px, stacked vertically.
  const columns = new Map();
  for (const link of document.querySelectorAll("a[href], button")) {
    const rect = link.getBoundingClientRect();
    if (rect.width < 150 || rect.width > 360 || rect.height === 0 || rect.height > 64 || (link.textContent || "").trim().length < 2) continue;
    const key = `${Math.round(rect.left / 2)}-${Math.round(rect.width / 2)}`;
    if (!columns.has(key)) columns.set(key, []);
    columns.get(key).push(link);
  }
  const findings = [];
  for (const links of columns.values()) {
    const plainLinks = links.filter((link) => link.getAttribute("aria-current") !== "page");
    if (plainLinks.length < 4) continue;
    // Clustered items: gap between adjacent items (same group, under 12px) under 3px, hover backgrounds nearly merge (gap-1, 2026-09-30).
    const sortedLinks = [...links].sort((first, second) => first.getBoundingClientRect().top - second.getBoundingClientRect().top);
    const linkGaps = sortedLinks.slice(1).map((link, index) => link.getBoundingClientRect().top - sortedLinks[index].getBoundingClientRect().bottom).filter((gap) => gap >= 0 && gap < 12);
    if (linkGaps.length >= 3 && Math.max(...linkGaps) < 3) findings.push(`${links.length} items spaced ${Math.round(Math.max(...linkGaps))}px apart, require gap-1 (4px): "${links[0].textContent.trim()}"…`);
    const heavyLinks = plainLinks.filter((link) => parseFloat(getComputedStyle(link).fontWeight) >= 600);
    if (heavyLinks.length / plainLinks.length < 0.6) continue;
    findings.push(`${heavyLinks.length}/${plainLinks.length} items styled ${getComputedStyle(heavyLinks[0]).fontWeight}: "${heavyLinks.slice(0, 3).map((link) => link.textContent.trim()).join('", "')}"`);
  }

  return findings.slice(0, 3);
}

// Broken image: Unsplash link or fictional avatar `id`, host unconfigured in `next.config` (SKILL.md `S16`).
// Only counts completed images (`complete`); `loading="lazy"` images outside viewport have not loaded, excluded.
function findBrokenImages() {
  return [...document.images]
    .filter((image) => image.complete && image.naturalWidth === 0 && (image.currentSrc || image.src))
    .slice(0, 6)
    .map((image) => (image.currentSrc || image.src).slice(0, 120));
}

// Incorrect Vietnamese number formatting (T28): period used as decimal separator before units ("4.5 triệu"), or unrounded
// number ("3.333333 triệu"). Only measured on Vietnamese pages (containing accented characters). Occurred 2026-09-30, tim-phong-sua.
function findMisformattedNumbers() {
  const bodyText = document.body.innerText;
  if (!/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(bodyText)) return [];
  const findings = new Set();
  for (const match of bodyText.matchAll(/\d+[.,]\d{4,}(?:\s*(?:triệu|tỷ|nghìn|%|đ|₫))?/g)) findings.add(`unrounded: "${match[0]}"`);
  for (const match of bodyText.matchAll(/\b\d{1,3}\.\d{1,2}\s*(?:triệu|tỷ|nghìn|tr\b|%)/g)) findings.add(`decimal period: "${match[0]}" (Vietnamese format: "${match[0].replace(".", ",")}")`);

  return [...findings].slice(0, 5);
}

// Scrollbar differs from tokens.css scrollbar block: wider than 4px, or thumb opaque in resting state (permanently
// visible). Parse CSS rules because pseudo-element `::-webkit-scrollbar` is unreadable via getComputedStyle.
function findScrollbarStyles() {
  const findings = new Set();
  const isOpaque = (value) => Boolean(value) && !/transparent|var\(|rgba\([^)]*,\s*0\)|0 0/.test(value);
  const walk = (rules) => {
    for (const rule of rules) {
      const selector = rule.selectorText || "";
      if (selector.includes("::-webkit-scrollbar")) {
        const isBar = /::-webkit-scrollbar(?![-\w])/.test(selector);
        const width = parseFloat(rule.style.getPropertyValue("width"));
        if (isBar && width > 4) findings.add(`scrollbar width ${width}px (\`${selector}\`)`);
        const background = rule.style.getPropertyValue("background") || rule.style.getPropertyValue("background-color");
        if (selector.includes("-thumb") && !selector.includes(":hover") && isOpaque(background)) findings.add(`thumb permanently visible color ${background} (\`${selector}\`)`);
      }
      if (rule.cssRules) walk(rule.cssRules);
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules);
    } catch {
      // Cross-origin stylesheet rules are unreadable, skip.
    }
  }

  return [...findings].slice(0, 4);
}

// ---------- Overlays opened via standard buttons, on mobile ----------

// Custom selects and menus often lack aria-haspopup, so above check misses them (missed overflowing menus and
// overly tall selects, 2026-09-27, seed project phase 2). Click only elements that LOOK LIKE triggers: have aria-expanded /
// aria-controls, labels like "menu", "lọc", bell/more/chevron icons. Icon-only buttons and clickable `div` rows
// (onClick) also count because real apps commonly use them (icon-only button, row with ">" in seed project round 2).
// Skip elements with action labels/icons to avoid accidental deletion, save, submit in live apps. Links are skipped.
// Reload clean page after each interaction.
// Creation buttons ("Tạo phiếu", "Thêm sản phẩm", plus icon) almost always open forms in dialog or sheet, and
// form commits only on submit inside, so click them too (missed overflowing dialog at 375, 2026-09-30, seed project warehouse
// round 2). Plus icon in quantity stepper or cart remains unclicked.
const openerLabelSource = "menu|lọc|filter|thông báo|notification|chọn|select|sắp xếp|sort|tuỳ chọn|tùy chọn|option|more|tài khoản|account|ngôn ngữ|language";
const createLabelSource = "^(tạo|thêm|new|create|add)\\b";
const createIconSource = "lucide-(plus|circle-plus|square-plus)\\b";
const skipCreateLabelSource = "giỏ|cart|số lượng|quantity|tăng|increase";
const actionLabelSource = "xoá|xóa|delete|remove|huỷ|hủy|cancel|đăng xuất|logout|sign out|gửi|send|submit|thanh toán|pay|mua|buy|lưu|save|đặt|thích|like|theo dõi|follow";
// Lucide icon names (class `lucide-<name>`): overlay trigger group, and action group that must not be clicked.
const openerIconSource = "lucide-(bell|menu|ellipsis|more-|filter|list-filter|sliders|chevron-down|chevron-right|chevrons-up-down|circle-user|user-round|user\\b|settings|globe|languages|calendar)";
const actionIconSource = "lucide-(trash|heart|star|bookmark|send|save|check|plus|x\\b|log-out|share|copy|download|upload|thumbs)";
const maxOpenerButtons = 10;

function markOpenerButtons({ limit, openerSource, actionSource, openerIconPattern, actionIconPattern, createSource, createIconPattern, skipCreateSource }) {
  const openerPattern = new RegExp(openerSource, "i");
  const actionPattern = new RegExp(actionSource, "i");
  const openerIcon = new RegExp(openerIconPattern);
  const actionIcon = new RegExp(actionIconPattern);
  const createPattern = new RegExp(createSource, "i");
  const createIcon = new RegExp(createIconPattern);
  const skipCreatePattern = new RegExp(skipCreateSource, "i");
  const openers = [];
  const seenKeys = new Set();

  const candidates = document.querySelectorAll("button, [role='button'], div[class*='cursor-pointer'], li[class*='cursor-pointer']");
  for (const candidate of candidates) {
    if (openers.length >= limit) break;
    if (candidate.closest("a[href]") || candidate.getBoundingClientRect().width === 0) continue;
    if (candidate.disabled || (candidate.type === "submit" && candidate.form) || candidate.hasAttribute("aria-haspopup")) continue;
    // Clickable container wrapping another button inside (card) is not a trigger button.
    if (candidate.tagName !== "BUTTON" && candidate.querySelector("button, a[href]")) continue;

    const label = `${candidate.getAttribute("aria-label") || ""} ${candidate.getAttribute("title") || ""} ${candidate.textContent || ""}`.replace(/\s+/g, " ").trim();
    const iconNames = [...candidate.querySelectorAll("svg")].map((icon) => icon.getAttribute("class") || "").join(" ");
    const isCreateButton = (createPattern.test(label) || (createIcon.test(iconNames) && label.length > 0)) && !actionPattern.test(label) && !skipCreatePattern.test(label);
    if (!isCreateButton && (actionPattern.test(label) || actionIcon.test(iconNames))) continue;

    const hasOpenerIcon = openerIcon.test(iconNames) || /[▾▼⌄›>]\s*$/.test(label);
    const looksLikeOpener = isCreateButton || candidate.hasAttribute("aria-expanded") || candidate.hasAttribute("aria-controls") || hasOpenerIcon || openerPattern.test(label);
    if (!looksLikeOpener) continue;

    const key = `${candidate.tagName}|${candidate.getAttribute("class") || ""}|${label.slice(0, 12)}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    candidate.dataset.forgeOpenerId = String(openers.length);
    openers.push(label.slice(0, 30) || `${candidate.tagName.toLowerCase()} icon-only (${(iconNames.match(/lucide-[a-z-]+/) || ["?"])[0]})`);
  }

  return openers;
}

// Panel pre-positioned offscreen (`-translate-x-full`) or backdrop `opacity-0` not counted as visible: clicking ☰
// slides sidebar in as a new overlay (missed 2026-10-01, lop-hoc: probe clicked ☰ but detected no opened panel).
function markVisibleLayers() {
  for (const node of document.querySelectorAll("body *")) {
    const style = getComputedStyle(node);
    const isPositioned = style.position === "fixed" || style.position === "absolute";
    const rect = node.getBoundingClientRect();
    const isOnScreen = rect.right > 0 && rect.left < window.innerWidth && rect.bottom > 0 && rect.top < window.innerHeight;
    if (isPositioned && rect.width * rect.height > 0 && isOnScreen && Number(style.opacity) > 0 && style.visibility !== "hidden" && style.display !== "none") node.dataset.forgeBefore = "1";
  }
}

// Overlay appearing after click: protruding past left/right edge, or (for fixed overlays) exceeding viewport height
// without any scrollable container to bring hidden content into view.
function findOpenedLayerProblems(triggerLabel) {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const problems = [];

  function isShown(node) {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();

    return style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0 && rect.width * rect.height >= 5000;
  }

  function hasScrollerBetween(node, root, axis) {
    for (let current = node; current; current = current.parentElement) {
      const style = getComputedStyle(current);
      const overflow = axis === "x" ? style.overflowX : style.overflowY;
      const canScroll = axis === "x" ? current.scrollWidth > current.clientWidth + 1 : current.scrollHeight > current.clientHeight + 1;
      if (["auto", "scroll"].includes(overflow) && canScroll) return true;
      if (axis === "x" && ["hidden", "clip"].includes(overflow) && current !== node) return true;
      if (current === root) break;
    }

    return false;
  }

  const newLayers = [...document.querySelectorAll("body *")].filter((node) => {
    const style = getComputedStyle(node);

    const rect = node.getBoundingClientRect();
    // Panel remaining offscreen after click (sidebar `-translate-x-full` when clicking unrelated button) is not an opened overlay.
    const isOnScreen = rect.right > 0 && rect.left < viewportWidth && rect.bottom > 0 && rect.top < viewportHeight;

    return !node.dataset.forgeBefore && (style.position === "fixed" || style.position === "absolute") && isOnScreen && isShown(node);
  });
  const roots = newLayers.filter((node) => !newLayers.some((other) => other !== node && other.contains(node)));
  const flatLayers = [];

  // Shadow reach: |y| + blur + spread of furthest layer retaining color. Compare shadow scale (P7): modal, panel > dropdown > card.
  function readShadowReach(node) {
    let reach = 0;
    for (const layer of getComputedStyle(node).boxShadow.split(/,(?![^(]*\))/)) {
      if (layer.trim() === "none" || layer.includes("inset")) continue;
      const color = layer.match(/rgba?\(([^)]+)\)/);
      const alpha = color ? Number(color[1].split(/[ ,/]+/).filter(Boolean)[3] ?? 1) : 1;
      if (alpha === 0) continue;
      const lengths = (layer.replace(/rgba?\([^)]+\)/, "").match(/-?[\d.]+px/g) || []).map((value) => Number.parseFloat(value));
      reach = Math.max(reach, Math.abs(lengths[1] || 0) + (lengths[2] || 0) + (lengths[3] || 0));
    }

    return reach;
  }

  function isOpaque(node) {
    const color = getComputedStyle(node).backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (!color) return false;
    const alpha = Number(color[1].split(/[ ,/]+/).filter(Boolean)[3] ?? 1);

    return alpha >= 0.9;
  }

  // Largest shadow of in-page container (card), to determine whether project uses shadow hierarchy.
  let pageReach = 0;
  for (const node of document.querySelectorAll("body *")) {
    if (newLayers.some((layer) => layer.contains(node))) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width * rect.height < 10000 || !isOpaque(node)) continue;
    // In-flow containers only: offscreen `fixed` panel is not a card.
    let isInLayer = false;
    for (let current = node; current && !isInLayer; current = current.parentElement) isInLayer = getComputedStyle(current).position === "fixed";
    if (isInLayer) continue;
    pageReach = Math.max(pageReach, readShadowReach(node));
  }

  for (const root of roots) {
    // Slide panel, modal: solid background container >= 60% viewport height or role dialog. Fullscreen sheets
    // have no background to separate against, skip. Semi-transparent backdrop is not a solid container.
    const panel = [root, ...root.querySelectorAll("*")].find((box) => {
      const rect = box.getBoundingClientRect();
      const isTall = rect.height >= viewportHeight * 0.6 || ["dialog", "alertdialog"].includes(box.getAttribute("role")) || box.getAttribute("aria-modal") === "true";
      const isFullScreen = rect.width >= viewportWidth * 0.98 && rect.height >= viewportHeight * 0.98;

      return isShown(box) && isOpaque(box) && isTall && !isFullScreen;
    });
    if (panel) {
      const panelReach = Math.max(readShadowReach(panel), readShadowReach(root));
      const name = `${panel.tagName.toLowerCase()}${panel.getAttribute("aria-label") ? ` "${panel.getAttribute("aria-label")}"` : ""}`;
      if (panelReach === 0) flatLayers.push(`click "${triggerLabel}": ${name} has no shadow (slide panel, modal: shadow-modal, layouts/overlay.md)`);
      else if (pageReach > 0 && panelReach <= pageReach) flatLayers.push(`click "${triggerLabel}": shadow of ${name} reach ${Math.round(panelReach)}px not greater than card shadow ${Math.round(pageReach)}px (shadow scale P7)`);
    }
  }

  for (const root of roots) {
    const isFixed = getComputedStyle(root).position === "fixed";
    const boxes = [root, ...root.querySelectorAll("*")].filter(isShown);

    const sideOverflow = boxes.find((box) => {
      const rect = box.getBoundingClientRect();

      const isInsideScroller = box !== root && hasScrollerBetween(box.parentElement, root, "x");

      return (rect.left < -1 || rect.right > viewportWidth + 1) && !isInsideScroller;
    });
    if (sideOverflow) {
      const rect = sideOverflow.getBoundingClientRect();
      const overflow = Math.round(Math.max(-rect.left, rect.right - viewportWidth));
      problems.push(`click "${triggerLabel}": overlay width ${Math.round(rect.width)}px protrudes ${overflow}px past screen edge`);
    }

    if (!isFixed) continue;
    const tallBox = boxes.find((box) => {
      const rect = box.getBoundingClientRect();

      return (rect.top < -1 || rect.bottom > viewportHeight + 1) && !hasScrollerBetween(box, root, "y");
    });
    if (tallBox) {
      const rect = tallBox.getBoundingClientRect();
      const hidden = Math.round(Math.max(0, -rect.top) + Math.max(0, rect.bottom - viewportHeight));
      problems.push(`click "${triggerLabel}": box height ${Math.round(rect.height)}px on ${viewportHeight}px screen, hides ${hidden}px without scrolling`);
    }
  }

  return { problems, flatLayers, openedCount: roots.length };
}

async function reloadForProbe(page, options) {
  await page.goto(options.url, { waitUntil: "load" });
  await page.addStyleTag({ content: freezeMotionCss });
  if (options.isDark) await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.waitForTimeout(options.waitMs);
}

async function probeOpenerLayers(page, options, width) {
  const markArgs = {
    limit: maxOpenerButtons,
    openerSource: openerLabelSource,
    actionSource: actionLabelSource,
    openerIconPattern: openerIconSource,
    actionIconPattern: actionIconSource,
    createSource: createLabelSource,
    createIconPattern: createIconSource,
    skipCreateSource: skipCreateLabelSource,
  };
  const openerLabels = await page.evaluate(markOpenerButtons, markArgs);
  const problems = [];
  const flatLayers = [];
  const openedShots = [];
  const nativeControls = new Set();

  for (const [index, triggerLabel] of openerLabels.entries()) {
    await reloadForProbe(page, options);
    await page.evaluate(markOpenerButtons, markArgs);
    await page.evaluate(markVisibleLayers);
    const isClicked = await page.locator(`[data-forge-opener-id="${index}"]`).click({ timeout: 800, force: true }).then(() => true, () => false);
    if (!isClicked) continue;
    await page.waitForTimeout(300);

    const opened = await page.evaluate(findOpenedLayerProblems, triggerLabel);
    if (opened.openedCount === 0) continue;
    for (const control of await page.evaluate(findNativeControls, "opened")) nativeControls.add(`click "${triggerLabel}": ${control}`);
    const shotPath = join(options.out, `${width}${options.isDark ? "-dark" : ""}-mo-${index}.png`);
    await page.screenshot({ path: shotPath });
    openedShots.push(`"${triggerLabel}": ${shotPath}`);
    problems.push(...opened.problems);
    flatLayers.push(...opened.flatLayers);
  }

  if (openerLabels.length > 0) await reloadForProbe(page, options);

  return { problems, flatLayers, openedShots, nativeControls: [...nativeControls] };
}

// Sweep width from large to small on same page, run lightweight checks and screenshot at each step. Desktop viewport
// throughout sweep (no touch simulation): this pass focuses on layout breaks; tap targets measured at fixed widths.
async function sweepWidths(browser, options) {
  const { from, to, step } = options.sweep;
  const context = await browser.newContext({
    viewport: { width: from, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: options.isDark ? "dark" : "light",
  });
  const page = await context.newPage();
  const sweepDir = join(options.out, options.isDark ? "sweep-dark" : "sweep");
  mkdirSync(sweepDir, { recursive: true });

  await page.goto(options.url, { waitUntil: "load" });
  await page.addStyleTag({ content: freezeMotionCss });
  if (options.isDark) await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.waitForTimeout(options.waitMs);

  const sweepWidthList = [];
  for (let width = from; width > to; width -= step) sweepWidthList.push(width);
  sweepWidthList.push(to);

  const steps = [];
  for (const width of sweepWidthList) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(150);
    const measurements = await page.evaluate(measureInPage, { minTapSize, isMobile: false, isSweep: true });
    const screenshotPath = join(sweepDir, `${width}.png`);
    await takeFullScreenshot(page, screenshotPath);
    steps.push({ width, screenshotPath, ...measurements });
  }

  await context.close();

  return steps;
}

// Group adjacent width steps into ranges: [1000, 980, 960, 700] → "960–1000px, 700px".
function formatWidthRanges(widths, step) {
  const sortedWidths = [...new Set(widths)].sort((first, second) => second - first);
  const ranges = [];
  for (const width of sortedWidths) {
    const lastRange = ranges.at(-1);
    if (lastRange && lastRange.low - width <= step) lastRange.low = width;
    else ranges.push({ low: width, high: width });
  }

  return ranges.map((range) => (range.low === range.high ? `${range.low}px` : `${range.low}–${range.high}px`)).join(", ");
}

// Everything probe detected classified Broken by V1 (references/review.md), grouped by element across widths and sweeps,
// tagged P1, P2… for review table reconciliation. Rounds 1 and 2 of seed project phase 2: many items probe detected were
// missing from review table because they were scattered across a long report.
function listMustReportItems(results, sweepSteps) {
  const itemsByKey = new Map();
  function addItem(width, text) {
    if (!itemsByKey.has(text)) itemsByKey.set(text, []);
    itemsByKey.get(text).push(width);
  }

  for (const result of results) {
    const width = result.width;
    for (const area of result.autoScrolledAreas) addItem(width, `page auto-scrolled upon load: ${area.replace(/ scrolled \d+px$/, "")}`);
    if (result.hasHorizontalScroll) addItem(width, `horizontal scroll, protruding: ${result.overflowingElements[0]?.element ?? "(unknown element)"}`);
    for (const layer of result.overflowingLayers) addItem(width, `overlay protrudes past screen: ${layer.replace(/ protrudes \d+px past screen$/, "")}`);
    for (const problem of result.openerLayerProblems) addItem(width, `overlay opened by trigger broken: ${problem}`);
    for (const shift of result.layoutShifts) addItem(width, `hover causes layout shift: ${shift.replace(/ by \d+px$/, "")}`);
    for (const line of result.lowContrastTexts) addItem(width, `low contrast: ${line}`);
    for (const item of result.clippedBlocks) addItem(width, `container clips text: ${item.element}`);
    for (const item of result.tooShortTexts) addItem(width, `truncation too short: ${item.element}`);
    for (const element of result.wrappedControls) addItem(width, `button text wrapped: ${element}`);
    for (const element of result.wrappedRows) addItem(width, `wrapped row (inspect screenshot to rank): ${element}`);
    for (const item of result.overlappedChartLabels) addItem(width, `chart number label overlaps data line: ${item}`);
    for (const item of result.iconCoveringBadges || []) addItem(width, `badge covers icon: ${item}`);
    for (const item of result.squeezedBlocks) addItem(width, `vertically squeezed block: ${item}`);
    for (const item of result.squeezedTableColumns || []) addItem(width, `table text column squeezed: ${item.replace(/ width \d+px, \d+\/\d+ rows/, "")}`);
    for (const item of result.crampedDescriptionLists || []) addItem(width, `two-column label-value in narrow block: ${item.replace(/^<dl> \d+px, .*?: /, "")}`);
    for (const item of result.mismatchedRuleColors) addItem(width, `aligned divider colors mismatch: ${item}`);
    // Grouped by element: narrower width shifts hidden substring, container is same.
    for (const item of result.swallowedNumbers) addItem(width, `truncation swallows numbers: ${item.replace(/^hiding ".*?" of /, "")}`);
    for (const item of result.hoverLikeSelected || []) addItem(width, `hover matches selected item background: ${item}`);
    for (const item of result.checkedHoverChanges || []) addItem(width, `hovering selected control loses accent color: ${item}`);
    for (const item of result.mouseUnreachableScrollers || []) addItem(width, `horizontal scroller unreachable with mouse: ${item.replace(/, content .*?: /, ": ")}`);
    // Weak hover: gate 3 builds must fix; review tables rank as Style (review.md, after table V1, 2026-09-30).
    for (const item of result.weakHovers || []) addItem(width, `barely perceptible hover (review: Style): ${item}`);
    // Bordered button hovering to solid button matching border color is common pattern, not broken: classify as Style.
    for (const item of (result.blendedHovers || []).filter((line) => !line.includes("matches border color"))) addItem(width, `hover background blends into another background (review: Style): ${item}`);
    // Incomplete dark mode is Broken (V4): light patch in dark screen. Non-switching pages indicate dark mode is declared only,
    // V4 specifies skipping dark mode rather than reporting an error, so excluded here.
    for (const item of (result.darkModeProblems || []).filter((line) => /^(light background patch|light translucent overlay)/.test(line))) addItem(width, `incomplete dark mode: ${item.replace(/, \d+×\d+px/, "")}`);
    for (const item of result.untransitionedMotion || []) addItem(width, `scale / translate / rotate missing transition: ${item}`);
    for (const item of result.smallTapTargets.filter((target) => target.isBelowFloor)) addItem(width, `tap target under 24px: ${item.element}`);
  }

  for (const step of sweepSteps) {
    if (step.hasHorizontalScroll) addItem(step.width, `horizontal scroll, protruding: ${step.overflowingElements[0]?.element ?? "(unknown element)"}`);
    for (const item of step.clippedBlocks) addItem(step.width, `container clips text: ${item.element}`);
    for (const element of step.wrappedControls) addItem(step.width, `button text wrapped: ${element}`);
    for (const element of step.wrappedRows) addItem(step.width, `wrapped row (inspect screenshot to rank): ${element}`);
    for (const item of step.tooShortTexts) addItem(step.width, `truncation too short: ${item.element}`);
    for (const item of step.swallowedNumbers) addItem(step.width, `truncation swallows numbers: ${item.replace(/^hiding ".*?" of /, "")}`);
  }

  return [...itemsByKey.entries()].map(([text, widths]) => ({ text, widths }));
}

function formatMustReportList(items, step) {
  const lines = [`\n# Reconciliation required: ${items.length} items ranked Broken by probe`];
  if (items.length === 0) return `${lines[0]}\nNo items.`;
  lines.push("Each item becomes a row in the review table (Source column logs code, e.g. `probe P3`; identical root causes combine multiple codes),");
  lines.push("or a note below the table explaining exclusion rationale. No item may silently vanish (V5 in review.md).");
  items.slice(0, 50).forEach((item, index) => lines.push(`P${index + 1} [${formatWidthRanges(item.widths, step)}] ${item.text}`));
  if (items.length > 50) lines.push(`(Remaining ${items.length - 50} items, see report.json.)`);

  return lines.join("\n");
}

function listSweepSignals(step) {
  const signals = [];

  if (step.hasHorizontalScroll) signals.push(`horizontal scroll, protruding: ${step.overflowingElements[0]?.element ?? "(unknown element)"}`);
  // Grouped by container, not hidden text: as container narrows first hidden text changes, container remains same.
  for (const item of step.clippedBlocks) signals.push(`container clips text: ${item.element}`);
  for (const element of step.wrappedControls) signals.push(`button text wrapped: ${element}`);
  for (const element of step.wrappedRows) signals.push(`wrapped row: ${element}`);
  for (const item of step.tooShortTexts) signals.push(`truncation too short: ${item.element}`);
  for (const item of step.swallowedNumbers) signals.push(`truncation swallows numbers: ${item.replace(/^hiding ".*?" of /, "")}`);

  return signals;
}

function formatSweepReport(steps, step) {
  const widthsBySignal = new Map();
  const changedFrames = [];
  let previousKey = null;

  for (const sweepStep of steps) {
    const signals = listSweepSignals(sweepStep);
    for (const signal of signals) {
      if (!widthsBySignal.has(signal)) widthsBySignal.set(signal, []);
      widthsBySignal.get(signal).push(sweepStep.width);
    }

    const signalKey = signals.join("|");
    if (previousKey !== null && signalKey !== previousKey) changedFrames.push(sweepStep.screenshotPath);
    previousKey = signalKey;
  }

  const lines = [`\n# Sweeping width ${steps[0].width} → ${steps.at(-1).width}px, step ${step}px (${steps.length} screenshots in ${dirname(steps[0].screenshotPath)})`];
  if (widthsBySignal.size === 0) lines.push("No layout breakage detected across any width. Still visually inspect sample screenshots between fixed viewports.");
  for (const [signal, widths] of widthsBySignal) lines.push(`${formatWidthRanges(widths, step)}: ${signal}`);
  if (changedFrames.length > 0) {
    lines.push("Key viewports to inspect (signal changed from previous step):");
    for (const framePath of changedFrames.slice(0, 12)) lines.push(`  ${framePath}`);
  }
  lines.push("Automated checks cannot detect overlaps, misalignments, or awkward whitespace. Review screenshots around sidebar collapse and grid breakpoint thresholds.");

  return lines.join("\n");
}

function formatReport(results) {
  const lines = [];
  let problemCount = 0;

  for (const result of results) {
    const problems = [];

    if (result.hasHorizontalScroll) {
      problems.push(`HORIZONTAL SCROLL: page width ${result.pageScrollWidth}px on ${result.viewportWidth}px viewport.`);
      for (const item of result.overflowingElements) problems.push(`  protrudes to ${item.right}px: ${item.element}`);
    }
    if (result.unpinnedScrollTables.length > 0) {
      problems.push(`HORIZONTAL SCROLL TABLE LOST COLUMN (${result.unpinnedScrollTables.length} tables, R9):`);
      for (const item of result.unpinnedScrollTables.slice(0, 5)) problems.push(`  ${item}`);
    }
    if (result.squeezedTableColumns.length > 0) {
      problems.push(`TABLE TEXT COLUMN FORCED TO WRAP (${result.squeezedTableColumns.length} columns; hide secondary columns via @container on card, layouts/app.md "Data tables"):`);
      for (const item of result.squeezedTableColumns.slice(0, 5)) problems.push(`  ${item}`);
    }
    if (result.crampedDescriptionLists.length > 0) {
      problems.push(`TWO-COLUMN LABEL-VALUE IN NARROW BLOCK (${result.crampedDescriptionLists.length} containers; under 384px stack label above value, @container, description-list.md):`);
      for (const item of result.crampedDescriptionLists.slice(0, 5)) problems.push(`  ${item}`);
    }
    if (result.brokenMoney.length > 0) {
      problems.push(`CURRENCY AMOUNT WRAPPED (${result.brokenMoney.length} places, amount + currency symbol must nowrap, shrink adjacent label, T16):`);
      for (const item of result.brokenMoney.slice(0, 5)) problems.push(`  ${item}`);
    }
    if (result.unevenStatRows.length > 0) {
      problems.push(`MISALIGNED NUMBERS IN METRIC CARD ROW (${result.unevenStatRows.length} rows, cells should use grid-rows-subgrid):`);
      for (const item of result.unevenStatRows.slice(0, 5)) problems.push(`  ${item}`);
    }
    if (result.gridChoiceGroups.length > 0) {
      problems.push(`GRID-ARRANGED CHOICE GROUPS (${result.gridChoiceGroups.length} groups, reads in Z-pattern; use single row or column):`);
      for (const item of result.gridChoiceGroups.slice(0, 5)) problems.push(`  ${item}`);
    }
    if (result.consoleErrors.length > 0) {
      problems.push(`CONSOLE ERRORS (${result.consoleErrors.length}):`);
      for (const message of result.consoleErrors.slice(0, 5)) problems.push(`  ${message}`);
    }
    if (result.tooShortCount > 0) {
      problems.push(`TRUNCATION TOO SHORT (${result.tooShortCount} places, under 10 readable characters):`);
      for (const item of result.tooShortTexts.slice(0, 5)) problems.push(`  width ${item.width}px, reads ~${item.visibleChars}/${item.fullText.length} chars "${item.fullText.slice(0, 40)}": ${item.element}`);
    }
    if (result.unevenSiblingGroups.length > 0) {
      problems.push(`NEAR-EQUAL HEIGHT MISMATCH (1-4px delta, usually baseline gap or uneven padding):`);
      for (const item of result.unevenSiblingGroups.slice(0, 5)) problems.push(`  ${item.count} elements, majority height ${item.commonHeight}px, others ${item.otherHeights.join(", ")}px: ${item.element}`);
    }
    if (result.misalignedColumns.length > 0) {
      problems.push(`COLUMN TEXT EDGE MISALIGNMENT (mixed alignments):`);
      for (const item of result.misalignedColumns.slice(0, 5)) problems.push(`  spread ${item.leftSpread}px, ${item.example}: ${item.element}`);
    }
    if (result.smallTapCount > 0) {
      problems.push(`TAP TARGET UNDER ${minTapSize}px (${result.smallTapCount} targets, no hit-area expansion):`);
      for (const item of result.smallTapTargets.slice(0, 10)) problems.push(`  ${item.size}${item.isBelowFloor ? " (under 24px)" : ""}: ${item.element}`);
    }
    if (result.orphanPunctuation.length > 0) {
      problems.push(`PUNCTUATION WRAPPED TO LINE START (${result.orphanPunctuation.length} places, punctuation must cling to preceding text):`);
      for (const item of result.orphanPunctuation.slice(0, 5)) problems.push(`  line begins with "${item.lineStart}": ${item.element}`);
    }
    if (result.orphanWords?.length > 0) {
      problems.push(`ORPHAN WORD ON LAST LINE (${result.orphanWords.length} places, add text-pretty, short headings use text-balance, T10):`);
      for (const item of result.orphanWords.slice(0, 5)) problems.push(`  ${item}`);
    }
    if (result.misalignedFields.length > 0) {
      problems.push(`INPUT AND FULL-WIDTH BUTTON EDGE MISALIGNMENT (${result.misalignedFields.length} containers, input and button must share left and right edges):`);
      for (const item of result.misalignedFields.slice(0, 5)) problems.push(`  input ${item.field}, button ${item.button}: ${item.element}`);
    }
    if (result.unevenSeparatorRows.length > 0) {
      problems.push(`UNEVEN SEPARATOR SPACING (${result.unevenSeparatorRows.length} rows, distance from › stroke to adjacent text/icon must be equal):`);
      for (const item of result.unevenSeparatorRows.slice(0, 5)) problems.push(`  khe ${item.gaps}: ${item.element}`);
    }
    if ((result.iconCoveringBadges || []).length > 0) {
      problems.push(`BADGE COVERS ICON (${result.iconCoveringBadges.length} places, move badge to corner, reduce size, or use slotted icon like BellDot):`);
      for (const item of result.iconCoveringBadges) problems.push(`  ${item}`);
    }
    if (result.overlappedChartLabels.length > 0) {
      problems.push(`CHART NUMBER LABEL OVERLAPS DATA LINE (${result.overlappedChartLabels.length} places, position label away from line):`);
      for (const element of result.overlappedChartLabels.slice(0, 5)) problems.push(`  ${element}`);
    }
    if (result.outsideChartLabels.length > 0) {
      problems.push(`CHART NUMBER LABEL PROTRUDES OUTSIDE PLOT AREA (${result.outsideChartLabels.length} places, falls into axis label row or over the top):`);
      for (const element of result.outsideChartLabels.slice(0, 5)) problems.push(`  ${element}`);
    }
    if (result.weakHovers.length > 0) {
      problems.push(`BARELY PERCEPTIBLE HOVER BACKGROUND (${result.weakHovers.length} types, delta under 8 levels from resting):`);
      for (const item of result.weakHovers.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.blendedHovers.length > 0) {
      problems.push(`HOVER BACKGROUND BLENDS INTO ANOTHER BACKGROUND (${result.blendedHovers.length} places):`);
      for (const item of result.blendedHovers.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.borderHovers.length > 0) {
      problems.push(`BORDER COLOR CHANGES ON HOVER (${result.borderHovers.length} types, skill only alters background, see button.md):`);
      for (const item of result.borderHovers.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.overflowingLayers.length > 0) {
      problems.push(`OVERLAY PROTRUDES PAST SCREEN (${result.overflowingLayers.length} places, opened tooltip / menu / popover must stay within screen):`);
      for (const item of result.overflowingLayers.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.checkedHoverChanges?.length > 0) {
      problems.push(`HOVERING SELECTED CONTROL LOSES ACCENT COLOR (${result.checkedHoverChanges.length} controls, hover: overrides checked:, use not-checked:hover:):`);
      for (const item of result.checkedHoverChanges) problems.push(`  ${item}`);
    }
    if (result.hoverLikeSelected?.length > 0) {
      problems.push(`HOVER MATCHES SELECTED ITEM COLOR (${result.hoverLikeSelected.length} groups, hovering over any item looks like it is selected):`);
      for (const item of result.hoverLikeSelected) problems.push(`  ${item}`);
    }
    if (result.shapeMismatches.length > 0) {
      problems.push(`HOVER / FOCUS SHAPE MISMATCHES SELECTED ITEM (${result.shapeMismatches.length} places, all states must share same shape):`);
      for (const item of result.shapeMismatches.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.stuckStates.length > 0) {
      problems.push(`POST-CLICK RESIDUAL HIGHLIGHT (${result.stuckStates.length} places, mouse resting on newly selected item):`);
      for (const item of result.stuckStates.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.unmarkedFocusStops?.length > 0) {
      problems.push(`TAB FOCUS INVISIBLE (${result.unmarkedFocusStops.length} places, while project renders focus rings in ${result.drawnFocusRings.length} other places; system inconsistency, I13 exception):`);
      for (const element of result.unmarkedFocusStops.slice(0, 8)) problems.push(`  ${element}`);
    }
    if (result.drawnFocusRings?.length > 0) {
      problems.push(`TAB FOCUS DRAWS FOCUS RING (${result.drawnFocusRings.length} places, skill does not draw focus rings, I13):`);
      for (const element of result.drawnFocusRings.slice(0, 8)) problems.push(`  ${element}`);
    }
    if (result.mismatchedRuleColors.length > 0) {
      problems.push(`ALIGNED DIVIDERS HAVE MISMATCHED COLORS (${result.mismatchedRuleColors.length} pairs, single line divided into light and dark halves):`);
      for (const item of result.mismatchedRuleColors) problems.push(`  ${item}`);
    }
    if (result.unevenHeaderActions.length > 0) {
      problems.push(`HEADER BUTTON ROW NOT UNIFORMLY SIZED (layouts/app.md, "Right button group in header bar"):`);
      for (const item of result.unevenHeaderActions) problems.push(`  ${item}`);
    }
    if (result.brokenRules.length > 0) {
      problems.push(`ADJACENT COLUMN DIVIDERS MISALIGNED (${result.brokenRules.length} pairs, reads as broken disjointed line):`);
      for (const item of result.brokenRules) problems.push(`  ${item}`);
    }
    if (result.untransitionedMotion?.length > 0) {
      problems.push(`SCALE / TRANSLATE / ROTATE MISSING TRANSITION (${result.untransitionedMotion.length} places, Tailwind v4: use transition-transform or transition-[opacity,scale,translate], W10):`);
      for (const item of result.untransitionedMotion) problems.push(`  ${item}`);
    }
    if (result.heavyLayerLines?.length > 0) {
      problems.push(`OVERLAY FRAME / SEPARATOR HEAVIER THAN BORDER TOKEN (${result.heavyLayerLines.length} overlays, use border-border per overlay.md standard):`);
      for (const item of result.heavyLayerLines) problems.push(`  ${item}`);
    }
    if (result.motionlessLayers?.length > 0) {
      problems.push(`OVERLAY TOGGLES WITHOUT ANIMATION (${result.motionlessLayers.length} overlays, \`{isOpen && …}\` or \`display\` appears abruptly; pace with "Motion" in layouts/overlay.md):`);
      for (const item of result.motionlessLayers) problems.push(`  ${item}`);
    }
    if (result.scrollyLayers?.length > 0) {
      problems.push(`OVERLAY HAS UNWANTED SCROLLBAR (${result.scrollyLayers.length} overlays, frame smaller than content; size to content, layouts/overlay.md):`);
      for (const item of result.scrollyLayers) problems.push(`  ${item}`);
    }
    if (result.lostTriggerIcons?.length > 0) {
      problems.push(`ICON LOST AFTER SELECTION (${result.lostTriggerIcons.length} triggers, re-rendered button must re-render icon):`);
      for (const item of result.lostTriggerIcons) problems.push(`  ${item}`);
    }
    if (result.popupNativeChoices?.length > 0) {
      problems.push(`NATIVE CONTROLS IN OVERLAY (${result.popupNativeChoices.length} overlays: select, date input, checkbox, slider…; review mode: ignore styled native select/date inputs like on page; wireframe and rebuild: implement per components/choice-controls.md, keep native select only if overlay is mobile-only):`);
      for (const item of result.popupNativeChoices) problems.push(`  ${item}`);
    }
    if (result.heavyDecorativeBorders?.length > 0) {
      problems.push(`HEAVY DECORATIVE BORDERS (${result.heavyDecorativeBorders.length} colors, cards and containers should be lighter than #e4e4e7, project lightest gray tier, M14):`);
      for (const item of result.heavyDecorativeBorders) problems.push(`  ${item}`);
    }
    if (result.scrollbarStyles?.length > 0) {
      problems.push(`NON-STANDARD SCROLLBAR (${result.scrollbarStyles.length} rules, use tokens.css scrollbar block: 4px, hidden until hover or scroll):`);
      for (const item of result.scrollbarStyles) problems.push(`  ${item}`);
    }
    if (result.misformattedNumbers?.length > 0) {
      problems.push(`INCORRECT VIETNAMESE NUMBER FORMATTING (${result.misformattedNumbers.length} places, decimal comma, rounding, T28 in rules-type.md):`);
      for (const item of result.misformattedNumbers) problems.push(`  ${item}`);
    }
    if (result.darkModeProblems?.length > 0) {
      problems.push(`DARK MODE (${result.darkModeProblems.length} places, rules-color.md M21, M31–M33):`);
      for (const item of result.darkModeProblems) problems.push(`  ${item}`);
    }
    if (result.brokenImages?.length > 0) {
      problems.push(`BROKEN IMAGES (${result.brokenImages.length} images, replace link or configure host in next.config, SKILL.md S16):`);
      for (const item of result.brokenImages) problems.push(`  ${item}`);
    }
    if (result.staticHoverBlocks?.length > 0) {
      problems.push(`HOVER BACKGROUND ON UNCLICKABLE BLOCK (${result.staticHoverBlocks.length} patterns, appears clickable but does nothing; remove hover or wrap block in link, I9):`);
      for (const item of result.staticHoverBlocks) problems.push(`  ${item}`);
    }
    if (result.heavyNavLinks?.length > 0) {
      problems.push(`SIDEBAR BOLD TEXT OR OVERLY TIGHT ITEMS (${result.heavyNavLinks.length} places, regular items 400 text-foreground/70, only selected item font-medium, items spaced gap-1, layouts/app.md):`);
      for (const item of result.heavyNavLinks) problems.push(`  ${item}`);
    }
    if (result.heavySeparators?.length > 0) {
      problems.push(`MENU SEPARATORS HEAVIER THAN FRAME BORDER (${result.heavySeparators.length} menus):`);
      for (const item of result.heavySeparators) problems.push(`  ${item}`);
    }
    if (result.overlongPlaceholders?.length > 0) {
      problems.push(`PLACEHOLDER EXCEEDS INPUT WIDTH (${result.overlongPlaceholders.length} inputs, shorten text to fit, input truncates tail):`);
      for (const item of result.overlongPlaceholders) problems.push(`  ${item}`);
    }
    if (result.fakeFieldWraps?.length > 0) {
      problems.push(`PSEUDO-INPUT WRAPS TEXT (${result.fakeFieldWraps.length} containers, use real <input> per components/input.md):`);
      for (const item of result.fakeFieldWraps) problems.push(`  ${item}`);
    }
    if (result.transparentHeaders?.length > 0) {
      problems.push(`TRANSPARENT HEADER BAR OVER GRAY BACKGROUND (${result.transparentHeaders.length} bars, use --surface background per layouts/app.md):`);
      for (const item of result.transparentHeaders) problems.push(`  ${item}`);
    }
    if (result.textOnlyPagers?.length > 0) {
      problems.push(`TEXT-ONLY PAGINATION (${result.textOnlyPagers.length} places, build ‹ 1 2 3 … › per components/small-controls.md):`);
      for (const item of result.textOnlyPagers) problems.push(`  ${item}`);
    }
    if (result.missingWireframeParts?.length > 0) {
      problems.push(`WIREFRAME MISSING TOOLBAR COMPONENTS (design-process.md, U3): ${result.missingWireframeParts.join(", ")}`);
    }
    if (result.coveredNowLines?.length > 0) {
      problems.push(`"NOW" LINE OVERLAPPED BY CELLS (layouts/app.md, "Daily schedule grid": line renders over cells):`);
      for (const item of result.coveredNowLines) problems.push(`  ${item}`);
    }
    if (result.wireframeChromeProblems?.length > 0) {
      problems.push(`WIREFRAME FRAME BREAKS DESIGN (design-process.md, U3):`);
      for (const item of result.wireframeChromeProblems.slice(0, 8)) problems.push(`  ${item}`);
    }
    if (result.misalignedControlRows?.length > 0) {
      problems.push(`VERTICAL CONTROL MISALIGNMENT (${result.misalignedControlRows.length} rows, add items-center; adjacent buttons share height):`);
      for (const item of result.misalignedControlRows) problems.push(`  ${item}`);
    }
    if (result.repeatedCardIssues?.length > 0) {
      problems.push(`REPEATED CARDS: HIERARCHY, RHYTHM, CLIPPED NAMES (${result.repeatedCardIssues.length} groups, N12 in principles.md):`);
      for (const item of result.repeatedCardIssues) problems.push(`  ${item}`);
    }
    if (result.denseItems?.length > 0) {
      problems.push(`REPEATED ITEMS TOO DENSE (>= 5 lines per item; in list + detail left items max 3 lines, layouts/app.md):`);
      for (const item of result.denseItems) problems.push(`  ${item}`);
    }
    if (result.clippedBars?.length > 0) {
      problems.push(`LEFT ACCENT BAR CLIPPED BY CONTAINER RADIUS (${result.clippedBars.length} places):`);
      for (const item of result.clippedBars) problems.push(`  ${item}`);
    }
    if (result.nestedFadeDialogs?.length > 0) {
      problems.push(`DIALOG CONTAINER FADING INSIDE FADING BACKDROP (${result.nestedFadeDialogs.length} places, opacities multiply, dialog fades faster than backdrop):`);
      for (const item of result.nestedFadeDialogs) problems.push(`  ${item}`);
    }
    if (result.mouseUnreachableScrollers?.length > 0) {
      problems.push(`HORIZONTAL SCROLLER UNREACHABLE WITH MOUSE (${result.mouseUnreachableScrollers.length} rows, scrollbar hidden, no arrow buttons; responsive.md after R10):`);
      for (const item of result.mouseUnreachableScrollers) problems.push(`  ${item}`);
    }
    if (result.stickyScrollColumns.length > 0) {
      problems.push(`STICKY COLUMN WITH INDEPENDENT SCROLLBAR (${result.stickyScrollColumns.length} columns, permanent independent scrollbar; columns taller than screen should scroll with page):`);
      for (const item of result.stickyScrollColumns) problems.push(`  ${item}`);
    }
    if (result.swallowedNumbers.length > 0) {
      problems.push(`TRUNCATION SWALLOWS NUMBERS (${result.swallowedNumbers.length} places, number with unit follows …):`);
      for (const item of result.swallowedNumbers) problems.push(`  ${item}`);
    }
    if (result.floatingContent.length > 0) {
      problems.push(`CONTENT FLOATS IN WIDE VIEWPORT (main container centered, gaps on both sides):`);
      for (const item of result.floatingContent) problems.push(`  ${item}`);
    }
    if (result.styledNativeSelects.length > 0) {
      problems.push(`NATIVE SELECT / DATE INPUT ON DESKTOP (${result.styledNativeSelects.length} inputs; review mode ignores, wireframe and rebuild replace with choice-controls.md pattern):`);
      for (const item of result.styledNativeSelects) problems.push(`  ${item}`);
    }
    if (result.squeezedBlocks.length > 0) {
      problems.push(`VERTICALLY SQUEEZED BLOCKS (${result.squeezedBlocks.length} blocks, usually missing shrink-0 in vertical flex container):`);
      for (const item of result.squeezedBlocks) problems.push(`  ${item}`);
    }
    if (result.tinyTextCount > 0) {
      problems.push(`TEXT UNDER 12px (${result.tinyTextCount} places):`);
      for (const item of result.tinyTexts) problems.push(`  ${item}`);
    }
    if (result.browserDefaultControls.length > 0) {
      problems.push(`CONTROLS RETAIN BROWSER DEFAULT STYLING (${result.browserDefaultControls.length} places, project missing reset or control un-reset):`);
      for (const item of result.browserDefaultControls) problems.push(`  ${item}`);
    }
    if (result.mismatchedRadii?.length > 0) {
      problems.push(`SAME COMPONENT DIFFERENT CORNER RADII (${result.mismatchedRadii.length} blocks, System inconsistency: individual radius override):`);
      for (const item of result.mismatchedRadii) problems.push(`  ${item}`);
    }
    if (result.stuckRows?.length > 0) {
      problems.push(`ROUNDED ROWS WITH BACKGROUNDS TOUCHING (${result.stuckRows.length} places, selected row under 4px from adjacent row: hovering adjacent row merges backgrounds; \`components/list-row.md\`, lock rule 19):`);
      for (const item of result.stuckRows) problems.push(`  ${item}`);
    }
    if (result.faintSelectedTabs?.length > 0) {
      problems.push(`SELECTED TAB NEARLY MATCHES BACKGROUND (${result.faintSelectedTabs.length} places; use \`bg-tab-selected\`, \`components/small-controls.md\`):`);
      for (const item of result.faintSelectedTabs) problems.push(`  ${item}`);
    }
    if (result.faintLines?.length > 0) {
      problems.push(`HAIRLINE LINE FADES INTO BACKGROUND (${result.faintLines.length} places; hairline needs >= 8 levels, on gray page use \`--border-strong\` (\`M14\`); tab rail line needs >= 16, use \`--tab-rail\`):`);
      for (const item of result.faintLines) problems.push(`  ${item}`);
    }
    if (result.invisibleFrames.length > 0) {
      problems.push(`DECLARED BORDER INVISIBLE (${result.invisibleFrames.length} frames, inner background, border, and outer background nearly identical):`);
      for (const item of result.invisibleFrames) problems.push(`  ${item}`);
    }
    if (result.crampedOptions?.length > 0) {
      problems.push(`CRAMPED OVERLAY ITEMS (${result.crampedOptions.length} places: text overflows fixed height item, or adjacent items under 4px apart; use \`min-h-10\` spaced \`gap-1\`, \`layouts/overlay.md\`):`);
      for (const item of result.crampedOptions) problems.push(`  ${item}`);
    }
    if (result.hollowLayers.length > 0) {
      problems.push(`OVERLAY HAS UNWANTED EMPTY STRIP (${result.hollowLayers.length} places, frame wider than inner content, typically \`max-w\` constraining content):`);
      for (const item of result.hollowLayers) problems.push(`  ${item}`);
    }
    if (result.vanishedChildren.length > 0) {
      problems.push(`CHILD ELEMENT VANISHES ON HOVER (${result.vanishedChildren.length} places):`);
      for (const item of result.vanishedChildren.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.autoScrolledAreas.length > 0) {
      problems.push(`PAGE AUTO-SCROLLED UPON LOAD (${result.autoScrolledAreas.length} places, page top hidden prior to user interaction):`);
      for (const item of result.autoScrolledAreas) problems.push(`  ${item}`);
    }
    if (result.openerLayerProblems.length > 0) {
      problems.push(`OVERLAY OPENED BY TRIGGER BROKEN (${result.openerLayerProblems.length} places):`);
      for (const item of result.openerLayerProblems.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.flatOpenedLayers.length > 0) {
      problems.push(`OPENED PANEL/MODAL NOT ELEVATED ABOVE PAGE (${result.flatOpenedLayers.length} places, System inconsistency):`);
      for (const item of result.flatOpenedLayers.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.layoutShifts.length > 0) {
      problems.push(`HOVER CAUSES LAYOUT SHIFT (${result.layoutShifts.length} places, hover adds/expands element, downstream block shifts):`);
      for (const item of result.layoutShifts.slice(0, 6)) problems.push(`  ${item}`);
    }
    if (result.lowContrastCount > 0) {
      problems.push(`TEXT CONTRAST BELOW THRESHOLD (${result.lowContrastCount} color pairs, body text 4.5:1, large text 3:1):`);
      for (const item of result.lowContrastTexts) problems.push(`  ${item}`);
    }
    if (result.clippedBlocks.length > 0) {
      problems.push(`CONTAINER CLIPS TEXT (${result.clippedBlocks.length} overflow hidden containers, text sits outside bounds; verify via screenshot):`);
      for (const item of result.clippedBlocks) problems.push(`  clips "${item.hiddenText}": ${item.element}`);
    }
    if (result.wrappedControls.length > 0) {
      problems.push(`BUTTON / LINK / TAB TEXT WRAPPED (${result.wrappedControls.length} places, control squeezed):`);
      for (const item of result.wrappedControls) problems.push(`  ${item}`);
    }
    if (result.wrappedRows.length > 0) {
      problems.push(`WRAPPED ROW (header, nav, tab rail, button row) (${result.wrappedRows.length} rows):`);
      for (const item of result.wrappedRows) problems.push(`  ${item}`);
    }

    problemCount += problems.filter((line) => !line.startsWith("  ")).length;
    lines.push(`\n## ${result.width}px  (screenshot: ${result.screenshotPath})`);
    lines.push(problems.length > 0 ? problems.join("\n") : "No errors detected.");
    if (result.expandedCount > 0) lines.push(`(Opened ${result.expandedCount} collapsed containers and re-measured inner content.)`);
    if (result.stateGroupCount > 0) lines.push(`(Tested hover, Tab, click across ${result.stateGroupCount} groups with selected items.)`);
    if (result.truncatedCount > 0) lines.push(`(${result.truncatedCount} truncated text instances with …: inspect screenshots to ensure no critical meaning is lost.)`);
    if (result.openedLayerShots.length > 0) {
      lines.push(`(Opened ${result.openedLayerShots.length} overlays, screenshot for each — inspect:)`);
      for (const shot of result.openedLayerShots) lines.push(`  ${shot}`);
    }
    if (result.unmeasuredContrastCount > 0) lines.push(`(${result.unmeasuredContrastCount} text instances over images/gradients where contrast could not be machine-measured: inspect screenshots.)`);
  }

  lines.unshift(problemCount > 0 ? `# Probe: ${problemCount} problem groups detected` : "# Probe: no errors detected");
  lines.push(
    "\nAutomated tools only measure detectable errors. Inspect each screenshot: is the heaviest visual element warranted, is the primary page task immediately apparent, are any areas overly cramped.",
  );

  return lines.join("\n");
}

// ---------- Compare build against chosen wireframe (--wireframe) ----------
// Wireframe is a specification down to the pixel (design-process.md, U4): spacing, sizing, copy. Anchored by text: each text block and
// placeholder present in both pages serves as an anchor. An incorrect top spacing shifts all downstream anchors equally, so
// instead of absolute coordinates, compare the distance from each anchor to its nearest top neighbor in the same column (left neighbor on same line):
// any mismatched delta pinpoints the exact fix. Occurred 2026-09-30, room search: build search input 17px shorter than wireframe, chip row
// grew 3px, card grid grew 1px; dragging comparison slider jumped every block.
const wireframeCompareWidths = [1440, 375];
const wireframeTolerancePx = 2;
const maxWireframeDiffLines = 15;

async function collectLayoutAnchors(page) {
  return page.evaluate(() => {
    // Toolbar and rationale box in wireframe page are outside the design.
    for (const chrome of document.querySelectorAll(".wf-bar, .wf-reason, [data-wf-reason]")) chrome.remove();

    const anchors = [];
    const countsByText = new Map();
    // Colors read via canvas so oklch, hex, and rgb normalize into comparable formats.
    const colorContext = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    function normalizeColor(color) {
      colorContext.clearRect(0, 0, 1, 1);
      colorContext.fillStyle = "#000";
      colorContext.fillStyle = color;
      colorContext.fillRect(0, 0, 1, 1);
      const [red, green, blue, alpha] = colorContext.getImageData(0, 0, 1, 1).data;

      return alpha === 0 ? "transparent" : `rgb(${red} ${green} ${blue}${alpha < 255 ? ` / ${(alpha / 255).toFixed(2)}` : ""})`;
    }
    function findBackground(element) {
      for (let current = element; current; current = current.parentElement) {
        const background = normalizeColor(getComputedStyle(current).backgroundColor);
        if (background !== "transparent") return background;
      }

      return "transparent";
    }

    function addAnchor(text, rect, fontSize, style = {}) {
      if (rect.width === 0 || rect.height === 0) return;

      const occurrence = (countsByText.get(text) ?? 0) + 1;
      countsByText.set(text, occurrence);
      anchors.push({
        key: `${text}#${occurrence}`,
        text,
        x: Math.round(rect.left + scrollX),
        y: Math.round(rect.top + scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        fontSize,
        ...style,
      });
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent.replace(/\s+/g, " ").trim();
      const parent = node.parentElement;
      if (!text || !parent || parent.closest("script, style, noscript, template")) continue;
      if (getComputedStyle(parent).visibility === "hidden") continue;

      range.selectNodeContents(node);
      const parentStyle = getComputedStyle(parent);
      addAnchor(text, range.getBoundingClientRect(), parentStyle.fontSize, {
        color: normalizeColor(parentStyle.color),
        fontWeight: parentStyle.fontWeight,
        background: findBackground(parent),
      });
    }
    for (const field of document.querySelectorAll("input[placeholder], textarea[placeholder]")) {
      addAnchor(`placeholder "${field.placeholder.trim()}"`, field.getBoundingClientRect(), getComputedStyle(field).fontSize, {
        color: normalizeColor(getComputedStyle(field, "::placeholder").color),
        background: findBackground(field),
      });
    }
    // Icons lack text so anchor by lucide name (both lucide CDN and lucide-react apply class lucide-<name>). Catches icons
    // present in wireframe but omitted in build, such as header heart button (2026-09-30). Icon size compared by width, not font size.
    for (const icon of document.querySelectorAll("svg[class*='lucide-']")) {
      const iconName = [...icon.classList].find((className) => className.startsWith("lucide-") && className !== "lucide-icon");
      if (!iconName) continue;

      const iconRect = icon.getBoundingClientRect();
      addAnchor(`icon ${iconName.replace(/^lucide-|-icon$/g, "")}`, iconRect, `${Math.round(iconRect.width)}px icon`, {
        color: normalizeColor(getComputedStyle(icon).color),
      });
    }

    return anchors;
  });
}

function isSameColumn(first, second) {
  return first.x < second.x + second.width && second.x < first.x + first.width;
}

function isSameLine(first, second) {
  return first.y < second.y + second.height && second.y < first.y + first.height;
}

function quoteAnchor(text) {
  return `«${text.length > 40 ? `${text.slice(0, 39)}…` : text}»`;
}

function parseRgb(color) {
  const channels = color.match(/[\d.]+/g)?.map(Number) ?? [];

  return color === "transparent" ? [0, 0, 0, 0] : [channels[0], channels[1], channels[2], channels[3] ?? 1];
}

// Channel difference of a few units is color conversion rounding, not distinct colors.
function isSameColor(firstColor, secondColor) {
  const firstChannels = parseRgb(firstColor);
  const secondChannels = parseRgb(secondColor);

  return firstChannels.slice(0, 3).every((channel, index) => Math.abs(channel - secondChannels[index]) <= 6)
    && Math.abs(firstChannels[3] - secondChannels[3]) <= 0.05;
}

function diffLayoutAnchors(wireframeAnchors, buildAnchors, shouldCompareColors) {
  const buildByKey = new Map(buildAnchors.map((anchor) => [anchor.key, anchor]));
  const wireframeKeys = new Set(wireframeAnchors.map((anchor) => anchor.key));
  const pairs = wireframeAnchors
    .filter((anchor) => buildByKey.has(anchor.key))
    .map((anchor) => ({ wireframe: anchor, build: buildByKey.get(anchor.key) }))
    .sort((first, second) => first.wireframe.y - second.wireframe.y || first.wireframe.x - second.wireframe.x);

  // Nearest top neighbor in same column (left neighbor on same row) searched across all wireframe anchors. If that anchor is missing in build
  // (changed copy, omitted container), skip this gap: the bug is already captured under "wireframe text missing from build", the gap delta
  // is merely a downstream consequence (shorter copy wrapping to fewer lines).
  const pairByKey = new Map(pairs.map((pair) => [pair.wireframe.key, pair]));
  function findNeighborPair(anchor, isNeighbor, farEdge) {
    const neighbor = wireframeAnchors
      .filter((other) => other !== anchor && isNeighbor(other, anchor))
      .sort((first, second) => farEdge(second) - farEdge(first))[0];
    if (!neighbor) return { isEdge: true };

    return pairByKey.get(neighbor.key) ?? null;
  }

  const gapDiffs = [];
  // Single erroneous token causes dozens of text elements to share the same color pair: group by pair with sample text examples.
  const styleDiffsByKey = new Map();
  function addStyleDiff(label, wireframeValue, buildValue, text) {
    const key = `${label}|${wireframeValue}|${buildValue}`;
    if (!styleDiffsByKey.has(key)) styleDiffsByKey.set(key, { label, wireframeValue, buildValue, texts: [] });
    styleDiffsByKey.get(key).texts.push(text);
  }
  function checkVerticalGap(pair, abovePair) {
    const wireframeGap = abovePair ? pair.wireframe.y - (abovePair.wireframe.y + abovePair.wireframe.height) : pair.wireframe.y;
    const buildGap = abovePair ? pair.build.y - (abovePair.build.y + abovePair.build.height) : pair.build.y;
    if (Math.abs(buildGap - wireframeGap) > wireframeTolerancePx) {
      const fromLabel = abovePair ? quoteAnchor(abovePair.wireframe.text) : "page top edge";
      gapDiffs.push(`vertical: ${fromLabel} → ${quoteAnchor(pair.wireframe.text)} build ${buildGap}px, wireframe ${wireframeGap}px (${buildGap > wireframeGap ? "+" : ""}${buildGap - wireframeGap})`);
    }
  }

  function checkHorizontalGap(pair, leftPair) {
    const wireframeLeftGap = leftPair ? pair.wireframe.x - (leftPair.wireframe.x + leftPair.wireframe.width) : pair.wireframe.x;
    const buildLeftGap = leftPair ? pair.build.x - (leftPair.build.x + leftPair.build.width) : pair.build.x;
    if (Math.abs(buildLeftGap - wireframeLeftGap) > wireframeTolerancePx) {
      const fromLabel = leftPair ? quoteAnchor(leftPair.wireframe.text) : "page left edge";
      gapDiffs.push(`horizontal: ${fromLabel} → ${quoteAnchor(pair.wireframe.text)} build ${buildLeftGap}px, wireframe ${wireframeLeftGap}px (${buildLeftGap > wireframeLeftGap ? "+" : ""}${buildLeftGap - wireframeLeftGap})`);
    }
  }

  for (const pair of pairs) {
    const abovePair = findNeighborPair(
      pair.wireframe,
      (other, anchor) => other.y + other.height <= anchor.y + 1 && isSameColumn(other, anchor),
      (other) => other.y + other.height,
    );
    if (abovePair) checkVerticalGap(pair, abovePair.isEdge ? null : abovePair);

    const leftPair = findNeighborPair(
      pair.wireframe,
      (other, anchor) => other.x + other.width <= anchor.x + 1 && isSameLine(other, anchor),
      (other) => other.x + other.width,
    );
    if (leftPair) checkHorizontalGap(pair, leftPair.isEdge ? null : leftPair);

    if (pair.wireframe.fontWeight && pair.build.fontWeight !== pair.wireframe.fontWeight) {
      addStyleDiff("font weight", pair.wireframe.fontWeight, pair.build.fontWeight, pair.wireframe.text);
    }
    if (shouldCompareColors && pair.wireframe.color && !isSameColor(pair.wireframe.color, pair.build.color)) {
      addStyleDiff(pair.wireframe.text.startsWith("icon ") ? "icon color" : "text color", pair.wireframe.color, pair.build.color, pair.wireframe.text);
    }
    if (shouldCompareColors && pair.wireframe.background && !isSameColor(pair.wireframe.background, pair.build.background)) {
      addStyleDiff("background under text", pair.wireframe.background, pair.build.background, pair.wireframe.text);
    }

    if (pair.build.fontSize !== pair.wireframe.fontSize) {
      const sizeLabel = pair.wireframe.text.startsWith("icon ") ? "icon size" : "font size";
      gapDiffs.push(`${sizeLabel}: ${quoteAnchor(pair.wireframe.text)} build ${pair.build.fontSize.replace(" icon", "")}, wireframe ${pair.wireframe.fontSize.replace(" icon", "")}`);
    }
  }

  const uniqueTexts = (anchors) => [...new Set(anchors.map((anchor) => anchor.text))];

  return {
    matchedCount: pairs.length,
    wireframeCount: wireframeAnchors.length,
    gapDiffs,
    styleDiffs: [...styleDiffsByKey.values()].map(({ label, wireframeValue, buildValue, texts }) => {
      const examples = [...new Set(texts)].slice(0, 3).map(quoteAnchor).join(", ");
      return `${label}: build ${buildValue}, wireframe ${wireframeValue}, ${texts.length} places (${examples})`;
    }),
    missingTexts: uniqueTexts(wireframeAnchors.filter((anchor) => !buildByKey.has(anchor.key))),
    extraTexts: uniqueTexts(buildAnchors.filter((anchor) => !wireframeKeys.has(anchor.key))),
  };
}

async function openForAnchors(browser, options, url, width, screenshotPath) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: options.isDark ? "dark" : "light",
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "load" });
  await page.addStyleTag({ content: freezeMotionCss });
  await page.waitForTimeout(options.waitMs);
  const anchors = await collectLayoutAnchors(page);
  await takeFullScreenshot(page, screenshotPath);
  await context.close();

  return anchors;
}

async function compareWithWireframe(browser, options) {
  const comparisons = [];
  // Grayscale stage deliberately omits accent colors; compare colors only when wireframe URL opens in Color mode (U3, Color toggle).
  const shouldCompareColors = new URL(options.wireframeUrl).searchParams.get("mau") === "mau";

  for (const width of wireframeCompareWidths) {
    const wireframeAnchors = await openForAnchors(browser, options, options.wireframeUrl, width, join(options.out, `wireframe-${width}.png`));
    const buildAnchors = await openForAnchors(browser, options, options.url, width, join(options.out, `ban-dung-${width}.png`));
    comparisons.push({ width, shouldCompareColors, ...diffLayoutAnchors(wireframeAnchors, buildAnchors, shouldCompareColors) });
  }

  return comparisons;
}

function formatWireframeReport(comparisons) {
  const lines = ["\n# Comparison with wireframe (design-process.md, U4: spacing, sizing, copy copied verbatim from wireframe)"];

  for (const comparison of comparisons) {
    lines.push(`\n## ${comparison.width}px: matched ${comparison.matchedCount}/${comparison.wireframeCount} anchors (text, placeholder, icon)`);
    if (!comparison.shouldCompareColors) lines.push("Colors not compared: wireframe link lacks mau=mau (Color mode).");
    if (comparison.gapDiffs.length === 0 && comparison.styleDiffs.length === 0 && comparison.missingTexts.length === 0 && comparison.extraTexts.length === 0) {
      lines.push("Matches wireframe.");
      continue;
    }

    if (comparison.gapDiffs.length > 0) {
      lines.push(`SPACING MISMATCH WITH WIREFRAME (${comparison.gapDiffs.length} places, apply exact spacing class from wireframe):`);
      for (const item of comparison.gapDiffs.slice(0, maxWireframeDiffLines)) lines.push(`  ${item}`);
      if (comparison.gapDiffs.length > maxWireframeDiffLines) lines.push(`  (${comparison.gapDiffs.length - maxWireframeDiffLines} remaining places, usually caused by the first mismatch; fix and re-run)`);
    }
    if (comparison.styleDiffs.length > 0) {
      lines.push(`COLOR, FONT WEIGHT MISMATCH WITH WIREFRAME (${comparison.styleDiffs.length} pairs, apply exact token and class from wireframe):`);
      for (const item of comparison.styleDiffs.slice(0, maxWireframeDiffLines)) lines.push(`  ${item}`);
    }
    if (comparison.missingTexts.length > 0) {
      lines.push(`TEXT / ICON IN WIREFRAME BUT MISSING IN BUILD (${comparison.missingTexts.length}, copy verbatim or record rationale in review table):`);
      for (const text of comparison.missingTexts.slice(0, maxWireframeDiffLines)) lines.push(`  ${quoteAnchor(text)}`);
    }
    if (comparison.extraTexts.length > 0) {
      lines.push(`TEXT / ICON IN BUILD BUT NOT IN WIREFRAME (${comparison.extraTexts.length}):`);
      for (const text of comparison.extraTexts.slice(0, maxWireframeDiffLines)) lines.push(`  ${quoteAnchor(text)}`);
    }
  }

  return lines.join("\n");
}

function listWireframeMustReportItems(comparisons) {
  const items = [];

  for (const comparison of comparisons) {
    for (const item of comparison.gapDiffs.slice(0, maxWireframeDiffLines)) items.push({ widths: [comparison.width], text: `mismatches wireframe, ${item}` });
    for (const item of comparison.styleDiffs.slice(0, maxWireframeDiffLines)) items.push({ widths: [comparison.width], text: `mismatches wireframe, ${item}` });
    for (const text of comparison.missingTexts.slice(0, maxWireframeDiffLines)) items.push({ widths: [comparison.width], text: `in wireframe but missing from build: ${quoteAnchor(text)}` });
    for (const text of comparison.extraTexts.slice(0, maxWireframeDiffLines)) items.push({ widths: [comparison.width], text: `build added element not in wireframe: ${quoteAnchor(text)}` });
  }

  return items;
}

// Issues only detectable via dynamic checks (Tab, hover, click, overlay).
const dynamicProblemKeys = ["unmarkedFocusStops", "drawnFocusRings", "hollowLayers", "crampedOptions", "openerLayerProblems", "flatOpenedLayers", "layoutShifts", "vanishedChildren", "weakHovers", "blendedHovers", "borderHovers", "overflowingLayers", "shapeMismatches", "hoverLikeSelected", "checkedHoverChanges", "heavyLayerLines", "motionlessLayers", "scrollyLayers", "lostTriggerIcons", "stuckStates"];

function formatDynamicCoverage(results, options) {
  if (options.isQuick) return "Quick mode (--quick): Tab, hover, click, overlay checks skipped.\n";
  const dynamicWidths = results.filter((result) => result.isDynamic).map((result) => `${result.width}px`);
  if (dynamicWidths.length === results.length) return "";

  return `Tab, hover, click, overlay: measured only at ${dynamicWidths.join(", ") || "none"}; other viewports checked static layout.\n`;
}

// Subsequent fix passes only need dynamic re-checks on viewports with remaining dynamic errors; static and --sweep checks still run fully.
function formatNextRoundHint(results, options) {
  if (options.isQuick) return "";
  const widthsWithDynamicProblems = results
    .filter((result) => result.isDynamic && dynamicProblemKeys.some((key) => result[key]?.length > 0))
    .map((result) => result.width);

  return `\nSubsequent fix round: add --dynamic-widths ${widthsWithDynamicProblems.join(",") || "none"} (viewports with remaining Tab, hover, click, overlay errors).`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.url) {
    console.error("Missing URL. Example: node probe.mjs http://localhost:5173/dashboard");
    process.exit(2);
  }

  const playwright = loadPlaywright(options.playwrightDir);
  if (!playwright) {
    console.error('Playwright not found. Install into a temporary directory, not into the project:\n  npm i --prefix "$TMPDIR/forge-probe" playwright\nthen re-run with --pw "$TMPDIR/forge-probe".');
    process.exit(2);
  }

  let browser;
  try {
    browser = await launchBrowser(playwright.chromium);
  } catch {
    console.error("Could not launch browser. Run: npx playwright install chromium (in the directory with playwright).");
    process.exit(2);
  }

  mkdirSync(options.out, { recursive: true });
  const results = [];
  let sweepSteps = [];
  let wireframeComparisons = [];

  try {
    for (const width of options.widths) results.push(await probeWidth(browser, options, width));
    if (options.sweep) sweepSteps = await sweepWidths(browser, options);
    if (options.wireframeUrl) wireframeComparisons = await compareWithWireframe(browser, options);
  } catch (error) {
    console.error(`Could not open ${options.url}: ${error.message.split("\n")[0]}. Is the dev server running?`);
    process.exit(2);
  } finally {
    await browser.close();
  }

  writeFileSync(join(options.out, "report.json"), JSON.stringify({ widths: results, sweep: sweepSteps, wireframe: wireframeComparisons }, null, 2));
  console.log(formatDynamicCoverage(results, options));
  console.log(formatReport(results));
  if (sweepSteps.length > 0) console.log(formatSweepReport(sweepSteps, options.sweep.step));
  if (wireframeComparisons.length > 0) console.log(formatWireframeReport(wireframeComparisons));
  const mustReportItems = [...listMustReportItems(results, sweepSteps), ...listWireframeMustReportItems(wireframeComparisons)];
  console.log(formatMustReportList(mustReportItems, options.sweep?.step ?? 20));
  console.log(formatNextRoundHint(results, options));
  console.log(`\nDetails: ${join(options.out, "report.json")}`);
}

main();

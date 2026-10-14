# Design System Generation, DTCG Token Schema & `DESIGN.md` Specification

Unified specification across Canonical `DESIGN.md` `[ADM]`, Japanese `DESIGN.ja.md` `[ADMJ]`,
Design-System Synthesis `[UPM]`, Baseline UI Constraints `[UIS]`, Craft & Polish
`[IMP]`, and *Refactoring UI* `[RUI]`.

---

## 1. Design System Synthesis Pipeline (`UPM`, `IMP`, `RUI`)

Generate a project design system in 5 deterministic steps:

1. **Domain & Persona Classification**: Match the product brief to an industry archetype
   (Table 3), selecting color temperature, surface polarity (light-first, dark-first, or
   dual-adaptive), and density tier (`compact`, `comfortable`, `spacious`).
2. **OKLCH Tonal Scale Generation (`P-39`..`P-45`)**: Build a 10-step hue-tinted neutral
   scale (`50`..`950`, `C = 0.004..0.018`), a 9-step primary brand scale (`50`..`900`), and
   4 semantic status pairs (`success`, `warning`, `danger`, `info`).
3. **Contrast Pair Verification (`WCAG 2.2 AA`)**: Verify every foreground/background pair
   in Table 2 (`>= 4.5:1` for body text, `>= 3.0:1` for large text and UI borders) in both
   light and dark modes before writing CSS.
4. **Typography & Spatial Scale Binding (`P-11`, `P-21`..`P-30`)**: Select a font pairing
   (Table 4), bind the 8-step fluid `clamp()` type scale (`--text-xs`..`--text-4xl`), and
   bind the non-linear spacing scale (`--space-1`..`--space-24`).
5. **Dual Artifact Output**: Emit machine-readable `tokens.json` (W3C DTCG format) +
   `tokens.css` and human/agent-readable `DESIGN.md` (or `DESIGN.ja.md` for Japanese
   products).

---

## 2. W3C DTCG `tokens.json` Schema & Required Contrast Pairs (`WCAG`, `IMP`)

Every leaf token in `tokens.json` uses W3C Design Tokens Community Group (`DTCG`) syntax
with `$value`, `$type` (`color`, `dimension`, `fontFamily`, `number`, `duration`,
`cubicBezier`, `shadow`), and optional `$description`:

```json
{
  "$schema": "https://tr.designtokens.org/format/",
  "meta": {
    "name": "Acme Cloud Design System",
    "persona": "Precision B2B SaaS",
    "polarity": "dual-adaptive",
    "locale": "en"
  },
  "color": {
    "surface": {
      "bg": {
        "$type": "color",
        "$value": { "light": "oklch(0.985 0.004 255)", "dark": "oklch(0.145 0.009 255)" }
      },
      "card": {
        "$type": "color",
        "$value": { "light": "oklch(1 0 0)", "dark": "oklch(0.188 0.011 255)" }
      }
    },
    "fg": {
      "primary": {
        "$type": "color",
        "$value": { "light": "oklch(0.202 0.011 255)", "dark": "oklch(0.955 0.005 255)" }
      },
      "muted": {
        "$type": "color",
        "$value": { "light": "oklch(0.442 0.016 255)", "dark": "oklch(0.685 0.014 255)" }
      }
    },
    "brand": {
      "primary": {
        "$type": "color",
        "$value": { "light": "oklch(0.505 0.195 258)", "dark": "oklch(0.685 0.162 258)" }
      },
      "onPrimary": {
        "$type": "color",
        "$value": { "light": "oklch(0.99 0.003 258)", "dark": "oklch(0.145 0.009 255)" }
      }
    }
  }
}
```

### Mandatory Contrast Verification Matrix

| Pair | Foreground Token | Background Token | Minimum Ratio |
|---|---|---|---|
| Body on Page | `--color-fg` | `--color-bg` | `>= 7.0:1` (AAA target) |
| Secondary on Card | `--color-fg-secondary` | `--color-surface` | `>= 4.5:1` (AA) |
| Muted on Surface | `--color-fg-muted` | `--color-surface-sunken` | `>= 4.5:1` (AA) |
| Primary Button | `--color-on-primary` | `--color-primary` | `>= 4.5:1` (AA) |
| Status Text on Tint | `--color-danger` / `warning` / `success` | `--color-*-bg` | `>= 4.5:1` (AA) |
| Input / Control Border | `--color-border-strong` | `--color-surface` | `>= 3.0:1` (AA 1.4.11) |

---

## 3. Curated Domain Color Palettes (`[UPM]`, `[RUI]`, `[IMP]`)

All palettes follow the 60-30-10 surface budget (`P-40`) with hue-tinted neutrals (`P-45`):

| Domain / Archetype | Surface Polarity | Neutral Hue | Primary Accent (`OKLCH` / Hex) | Secondary / Support (`OKLCH` / Hex) | Radius & Elevation Profile |
|---|---|---|---|---|---|
| **B2B SaaS / Productivity** | Light + Dark | `255°` Cool Slate | `oklch(0.51 0.19 258)` (`#2563EB`) | `oklch(0.44 0.02 255)` (`#475569`) | `6px–8px`, `1px` subtle border + `--shadow-xs` |
| **Developer Tools / Infra** | Dark-First (`L=0.14`) | `265°` Carbon Indigo | `oklch(0.68 0.16 265)` (`#6E7BF2`) | `oklch(0.74 0.14 165)` (`#2DD4BF`) | `6px`, crisp `1px` hairline rings (`P-64`) |
| **Fintech / Banking** | Light-First (`L=0.985`) | `245°` Navy Slate | `oklch(0.45 0.16 250)` (`#1D4ED8`) | `oklch(0.52 0.15 155)` (`#059669`) | `8px`, two-part `--shadow-sm`, `tabular-nums` |
| **Healthcare / Clinical** | Light-First | `205°` Clean Teal | `oklch(0.48 0.13 205)` (`#0284C7`) | `oklch(0.53 0.14 165)` (`#0D9488`) | `8px–12px`, high contrast `>= 7:1`, UD fonts |
| **E-Commerce / D2C Retail** | Light-First | `65°` Warm Stone | `oklch(0.22 0.01 65)` (`#1C1917`) | `oklch(0.55 0.18 35)` (`#EA580C`) | `4px–8px`, aspect-ratio `.l-frame` product cards |
| **Luxury / Editorial** | Warm Ivory (`L=0.975`) | `75°` Warm Paper | `oklch(0.20 0.01 75)` (`#181614`) | `oklch(0.48 0.11 55)` (`#9A5B25`) | `0px–2px`, hairlines, high-contrast serif display |
| **AI / Research Studio** | Warm Alabaster + Dark | `60°` Warm Sand | `oklch(0.52 0.15 42)` (`#C85A32`) | `oklch(0.35 0.02 60)` (`#3D3935`) | `8px–12px`, editorial serif + mono code blocks |
| **Analytics / BI Platform** | Dual-Adaptive | `250°` Neutral Slate | `oklch(0.50 0.17 250)` (`#1E60D5`) | 5-color Okabe-Ito colorblind-safe chart ramp | `6px`, compact density, horizontal table rules |
| **Education / Learning** | Warm Light | `85°` Cream Slate | `oklch(0.49 0.17 262)` (`#3B49DF`) | `oklch(0.58 0.16 70)` (`#D97706`) | `10px–12px`, generous `65ch` measure |
| **Sustainability / Climate** | Warm Organic Light | `145°` Sage Stone | `oklch(0.44 0.12 152)` (`#166534`) | `oklch(0.56 0.12 85)` (`#A16207`) | `8px–12px`, natural tonal contrast |
| **Civic / Government (EN/JA)** | High-Contrast Light | `250°` Neutral | `oklch(0.40 0.16 255)` (`#003EE6`) | `oklch(0.30 0.01 250)` (`#2B2D33`) | `4px`, `>= 7:1` AAA text, unmistakable focus rings |
| **Media / Publishing** | High-Contrast Dual | `25°` Ink Neutral | `oklch(0.52 0.21 28)` (`#E11D48`) | `oklch(0.16 0.01 25)` (`#0F0E0E`) | `0px–4px`, strong typographic hierarchy |

---

## 4. Curated Font Pairings (`[UPM]`, `[IMP]`, `[FD]`, `[ADMJ]`)

Never default blindly to system Arial or unexamined `Inter` on fresh creative briefs (`AP-06`). Choose a pairing matched to the domain:

| Pairing ID | Persona / Domain | Display / Heading (`--font-display`) | UI & Body (`--font-sans`) | Monospace (`--font-mono`) |
|---|---|---|---|---|
| `FP-01` | Modern Technical SaaS | `Plus Jakarta Sans` (`600/700`) | `Plus Jakarta Sans` (`400/500`) | `JetBrains Mono` |
| `FP-02` | Editorial & AI Research | `Instrument Serif` or `Newsreader` (`400`) | `Plus Jakarta Sans` or `DM Sans` (`400/500`) | `JetBrains Mono` |
| `FP-03` | Precision Developer / Linear-style | `Inter Display` / `Geist` (`600`, `-0.03em`) | `Inter` / `Geist` (`400/500`, `cv02, cv11`) | `Geist Mono` / `Berkeley Mono` |
| `FP-04` | Fintech & Institutional Trust | `Fraunces` (optical size, `600`) | `Public Sans` or `Source Sans 3` (`400/600`) | `IBM Plex Mono` |
| `FP-05` | Swiss / Industrial Brutalist | `Space Grotesk` (`600/700`) | `IBM Plex Sans` (`400/500`) | `IBM Plex Mono` |
| `FP-06` | Warm Consumer / D2C | `Cabinet Grotesk` or `Outfit` (`600`) | `DM Sans` (`400/500`) | `Fira Code` |
| `FP-07` | High-Legibility Civic / Healthcare | `Atkinson Hyperlegible` or `Lexend` (`600`) | `Atkinson Hyperlegible` or `Public Sans` (`400`) | `Intel One Mono` |
| `FP-08` | Japanese Corporate / SaaS (`ja`) | `Inter` + `Hiragino Kaku Gothic ProN` / `Noto Sans JP` | `Inter` + `AdjustedYuGothic` / `BIZ UDPGothic` | `JetBrains Mono` |
| `FP-09` | Japanese Editorial / Craft (`ja`) | `Instrument Serif` + `Hiragino Mincho ProN` / `Noto Serif JP` | `Plus Jakarta Sans` + `Hiragino Sans` / `Noto Sans JP` | `IBM Plex Mono` |

---

## 5. Data Visualization & Chart Selection Matrix (`[UPM]`, `[RUI]`)

| Analytical Goal | Recommended Chart | Banned / Avoid | Key Craft Rules (`P-50`, `P-86`..`P-88`) |
|---|---|---|---|
| **Trend over continuous time** | Line chart (`1–4` series) or subtle area chart (`1–2` series) | 3D bar, stacked area with `> 3` volatile series | Direct line-end labels; subtle horizontal gridlines only (`--color-border-subtle`); `tabular-nums` on axes. |
| **Ranking / categorical comparison** | Horizontal bar chart (especially when labels `> 10` chars) | Pie chart, radar chart, vertical bars with rotated `45°` labels | Zero baseline (`0`); sort bars descending by value; place value labels at bar ends. |
| **Part-to-whole (`<= 5` categories)** | Stacked horizontal bar or Donut chart with center total metric | Pie/Donut with `> 5` slices (`AP-24`) | Group minor categories into `Other`; label percentages directly. |
| **Distribution / range** | Histogram or box/strip plot | Averaged single bar hiding variance | Highlight median and interquartile range clearly. |
| **Funnel / stage conversion** | Horizontal step bar with conversion `%` drop-off badges | 3D cone funnels | Show both absolute count (`1,420`) and stage conversion rate (`64.2%`). |
| **Colorblind safety (`WCAG 1.4.1`)** | Blue (`255°`) + Orange (`45°`) + Teal (`175°`) + Purple (`295°`) + Navy (`230°`) | Simultaneous unseparated Red + Green | Maintain lightness separation (`Delta L >= 0.12`) and pair secondary series with dashed strokes or point markers. |

---

## 6. Canonical `DESIGN.md` Format (`[ADM]`, `[UIS]`, `[IMP:document]`)

Every `DESIGN.md` starts with Google Stitch YAML frontmatter followed by **8 canonical
sections**, **`Agent Prompt Guide`**, and **`Known Gaps`**:

```markdown
---
name: "<Brand or Product Name>"
description: "<One-sentence design philosophy and aesthetic direction>"
category: "<SaaS | Developer Tools | Fintech | E-Commerce | Editorial | Civic>"
theme_polarity: "<light-first | dark-first | dual-adaptive>"
primary_hue: "<OKLCH hue angle and name, e.g. 258deg Cobalt>"
---

# <Product Name> Design System

## 1. Visual Theme & Atmosphere
- **Aesthetic Philosophy**: Concrete mood, material metaphor, and density target.
- **Differentiation Anchor**: The 1–2 signature visual traits that make this UI recognizable.
- **Surface Polarity & 60-30-10 Budget**: How primary background (`60%`), secondary structure (`30%`), and accent (`10%`) interact.

## 2. Color Palette & Roles
- Complete semantic table mapping token names (`--color-bg`, `--color-surface`, `--color-fg`, `--color-primary`, status tokens) to **OKLCH** values, hex fallbacks, and verified WCAG contrast ratios for both light and dark modes.

## 3. Typography Rules
- Font family stacks (`--font-sans`, `--font-display`, `--font-mono`), fluid `clamp()` scale table (`--text-xs`..`--text-4xl`), line-height, tracking, `tabular-nums`, and measure (`65ch`).

## 4. Component Stylings
- **Buttons**: Primary, secondary, ghost, and destructive geometry, padding, radius, and 8 states.
- **Cards & Containers**: `.l-box` padding, border vs shadow treatment, concentric radius rule, and zero card-in-card rule.
- **Inputs & Forms**: Height (`>= 40px–44px`), `16px` minimum font, focus ring, label placement, and inline error pattern.
- **Tables, Badges & Navigation**: Alignment, row dividers, badge tint/shade pairs, and active nav indicators.

## 5. Layout Principles
- Every Layout primitive mapping (`.l-stack`, `.l-sidebar`, `.l-switcher`, `.l-grid`, `.l-cluster`), spacing scale (`--space-1`..`--space-24`), container max-width (`75rem`), and whitespace floor (`>= 25%`).

## 6. Depth & Elevation
- Elevation tiers (`xs`..`lg`), light-mode 2-part shadows vs dark-mode surface lightness steps (`L=0.145 -> 0.188 -> 0.232`), and `z-index` token tiers (`10`..`50`).

## 7. Do's and Don'ts
- Concrete, testable `[DO]` and `[DON'T]` pairs tailored to this system's aesthetic and anti-slop boundaries.

## 8. Responsive Behavior
- Intrinsic reflow thresholds (`.l-sidebar` `--content-min`, `.l-switcher` `--threshold`, `.l-grid` `--min`), mobile touch target sizing (`>= 44x44px`), `100dvh`, and navigation collapse strategy.

## Agent Prompt Guide
- **Quick Token Summary**: Copy-ready CSS custom property block.
- **Component Recipes**: 3–4 concise HTML+CSS snippets for the most common screens.
- **Pre-Delivery Self-Check**: 6-point checklist before returning code.

## Known Gaps & Open Questions
- Explicit list of unverified components or pending brand assets (never fabricate undocumented rules).
```

### Japanese `DESIGN.ja.md` Extension (`[ADMJ]`)

When authoring a Japanese design system (`DESIGN.ja.md` or bilingual `DESIGN.md`), Section 3
(`Typography Rules / 타이ポグラフィ・文字組版`) additionally specifies:
1. **和欧混植フォントスタック (`JA-01`..`JA-09`)**: Latin font first + Japanese font second + `AdjustedYuGothic` `@font-face`.
2. **行間・字間プロファイル (`JA-15`..`JA-24`)**: Body `line-height: 1.80`, `letter-spacing: 0.03em`; Heading `line-height: 1.30`, `"palt" 1`.
3. **禁則処理・改行制御 (`JA-35`..`JA-39`)**: `line-break: strict; overflow-wrap: anywhere; word-break: auto-phrase`.
4. **混植・約物ルール (`JA-45`..`JA-52`)**: Half-width ASCII numerals (`tabular-nums`), zero italics (`JA-29`), and `text-autospace: normal`.

---

## 7. Five Real-World Brand Reference Exemplars (`[ADM]`)

Use these 5 reference exemplars `[ADM]` as concrete models when a brief calls for
their archetype:

1. **Linear (`linear.app`) — Precision Dark-First Craft**:
   - *Atmosphere*: Whisper-quiet obsidian surfaces (`oklch(0.14 0.008 265)` / `#08090A`), elevated panels (`oklch(0.18 0.01 265)` / `#141517`), crisp `1px` semi-transparent borders (`oklch(1 0 0 / 0.08)`), indigo-violet accent (`oklch(0.58 0.19 272)` / `#5E6AD2`).
   - *Typography & Layout*: `Inter Display` / `Inter` (`cv02, cv11`), `-0.03em` display tracking, compact `13px–14px` workspace controls with `tabular-nums`, keyboard shortcut badges (`<kbd>`), zero heavy drop shadows.
2. **Vercel (`vercel`) — High-Contrast Monochrome & Structural Grid**:
   - *Atmosphere*: Pure architectural grid with exposed `1px` hairlines (`#EAEAEA` light / `#262626` dark), Geist Sans & Geist Mono, high-contrast monochrome primary CTA (`#171717` on light, `#EDEDED` on dark), semantic status colors reserved strictly for deployment states (`Ready`, `Building`, `Error`).
3. **Stripe (`stripe`) — High-Craft Editorial Fintech**:
   - *Atmosphere*: Cool porcelain canvas (`#F6F9FC`), crisp white cards (`#FFFFFF`) with multi-layered ambient shadows, deep navy ink (`#0A2540`), slate secondary copy (`#425466`), and electric violet-indigo primary CTA (`#635BFF`). Uncompromising `tabular-nums` alignment across every financial table and invoice preview.
4. **Notion (`notion`) — Warm Paper Knowledge Workspace**:
   - *Atmosphere*: Warm ivory paper (`#FFFFFF` / `#F7F6F3` sidebar), warm espresso ink (`#37352F`), warm muted gray (`#787774`), zero decorative chrome, optional editorial serif toggle (`Lyon`/`Newsreader`), and subtle hover surface tints (`rgba(55, 53, 47, 0.06)`).
5. **The Verge (`theverge`) — High-Energy Editorial Publishing**:
   - *Atmosphere*: Bold typographic contrast pairing condensed display headlines (`line-height: 1.05`, `-0.03em` tracking) with generous `65ch` serif article prose, high-contrast ink borders, numbered story streams, and a single electric editorial accent used as a structural marker rather than a background wash.

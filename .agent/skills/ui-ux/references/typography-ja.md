# Japanese Typography & Mixed-Script Rules (`JA-01`..`JA-61`)

Unified Japanese typography specification `[ADMJ]`, W3C JLREQ, and Typography Craft
`[IMP:typography]`. Apply these rules whenever `<html lang="ja">` or `:lang(ja)`
content is rendered.

---

## 1. Font Stacks & Windows Yu Gothic Weight Remapping (`JA-01`..`JA-14`)

- **`JA-01` Latin-first, Japanese-second font-family ordering (`CSS`)** `[ADMJ]`
  Always list the Latin typeface before the Japanese typeface in `font-family` so ASCII
  alphanumerics render with crisp Latin metrics while kana and kanji fall back to the
  Japanese typeface.
- **`JA-02` Recommended Sans-Serif (Gothic / ゴシック体) stack (`CSS`)** `[ADMJ]`
  ```css
  --font-sans-ja: "Inter", "Plus Jakarta Sans", "Hiragino Kaku Gothic ProN",
    "Hiragino Sans", "AdjustedYuGothic", "BIZ UDPGothic", "Noto Sans JP",
    "Meiryo", sans-serif;
  ```
- **`JA-03` Recommended Serif (Mincho / 明朝体) editorial stack (`CSS`)** `[ADMJ]`
  ```css
  --font-serif-ja: "Instrument Serif", "Hiragino Mincho ProN", "Yu Mincho",
    "BIZ UDPMincho", "Noto Serif JP", serif;
  ```
- **`JA-04` Universal Accessibility (UD) stack for public/medical/civic UI (`CSS`)** `[ADMJ]`
  Prioritize `"BIZ UDPGothic"` (sans) and `"BIZ UDPMincho"` (serif) — pre-installed on
  Windows 10/11 and macOS — designed for high legibility under low vision.
- **`JA-05`..`JA-09` Windows `AdjustedYuGothic` `@font-face` fix (`CSS`)** `[ADMJ]`
  On Windows, `Yu Gothic Regular (400)` renders abnormally thin and faint at body sizes.
  Remap `font-weight: 400` to `Yu Gothic Medium` using `@font-face`:
  ```css
  @font-face {
    font-family: "AdjustedYuGothic";
    font-weight: 400;
    src: local("Yu Gothic Medium"), local("YuGothic-Medium");
  }
  @font-face {
    font-family: "AdjustedYuGothic";
    font-weight: 700;
    src: local("Yu Gothic Bold"), local("YuGothic-Bold");
  }
  ```
- **`JA-10`..`JA-14` Font weight ceiling on kanji (`CSS`)** `[ADMJ]`
  - `JA-10`: Body text uses `font-weight: 400` (`Medium` on Windows Yu Gothic).
  - `JA-11`: UI emphasis and subheadings use `font-weight: 600` or `700`.
  - `JA-12`: Never apply `font-weight >= 800` to Japanese text smaller than `18px` — high-stroke-count kanji (`鬱`, `鑑`, `響`) collapse into illegible black blobs (`AP-103`).
  - `JA-13`: Minimum legible font size for kanji UI labels is `12px` (`0.75rem`), with `13px–14px` (`0.8125rem–0.875rem`) preferred for secondary metadata.
  - `JA-14`: Subset web fonts (`Noto Sans JP`, `IBM Plex Sans JP`) via `unicode-range` and `font-display: swap`.

---

## 2. Line Height, Measure & Letter Spacing Profiles (`JA-15`..`JA-28`)

- **`JA-15`..`JA-19` Line-height (`line-height`) profiles (`CSS`)** `[ADMJ]`
  Japanese kanji fill the full em-box without ascenders or descenders, requiring wider
  line-height than Latin prose (`C-13`):
  - `JA-15` **Body prose (`15px–16px`)**: `line-height: 1.75` to `1.90` (`1.80` default).
  - `JA-16` **Dense UI cards / tables (`13px–14px`)**: `line-height: 1.50` to `1.65`.
  - `JA-17` **Subheadings (`18px–22px`)**: `line-height: 1.40` to `1.50`.
  - `JA-18` **Display headings (`>= 24px`)**: `line-height: 1.25` to `1.40` (never `< 1.20` or kanji vertically collide).
  - `JA-19` **Paragraph spacing**: `margin-block-end: 1.5em` between `<p>` blocks in long-form reading.
- **`JA-20`..`JA-24` Letter-spacing (`letter-spacing`) profiles (`CSS`)** `[ADMJ]`
  - `JA-20` **Ban negative tracking on body copy**: Japanese body copy must never use `letter-spacing < 0` (`AP-101`).
  - `JA-21` **Standard body tracking**: `letter-spacing: 0.02em` to `0.05em` (`0.04em` default).
  - `JA-22` **Editorial / luxury Mincho tracking**: `letter-spacing: 0.06em` to `0.12em`.
  - `JA-23` **Display headings with `"palt"`**: When `font-feature-settings: "palt" 1` is enabled on headings, use `letter-spacing: 0.02em` to `0.06em`.
  - `JA-24` **Buttons & badges**: `letter-spacing: 0.04em`.
- **`JA-25`..`JA-28` Line length (字詰め / Measure) & Alignment (`CSS`)** `[ADMJ]`
  - `JA-25`: Optimal horizontal Japanese line length is **`28–40` full-width characters** (`max-inline-size: 36em` or `60ch–72ch` in CSS `ch` units).
  - `JA-26`: Mobile (`375px`) line length targets **`18–24` full-width characters** (`16px` font with `20px–24px` inline gutters).
  - `JA-27`: Always left-align (`text-align: start`) multi-line Japanese web prose; never use `text-align: justify` (`AP-05`) because browser justification inserts uneven gaps between kana/kanji without OpenType justification tables.
  - `JA-28`: Never center-align Japanese paragraphs longer than 2 lines (`AP-104`).

---

## 3. Ban on Italics & OpenType Feature Settings (`JA-29`..`JA-34`)

- **`JA-29` Never italicize Japanese text (`CSS`)** `[ADMJ]`
  Japanese typography has no italic tradition; `font-style: italic` mechanically shears
  kanji and kana into distorted parallelograms (`AP-98`). Enforce:
  ```css
  :lang(ja) em,
  :lang(ja) i,
  :lang(ja) cite {
    font-style: normal;
    font-weight: 700;
  }
  ```
- **`JA-30` Emphasis alternatives in Japanese (`CSS` / `DOM`)** `[ADMJ]`
  Emphasize Japanese spans using `font-weight: 700`, a subtle highlight marker
  (`background: linear-gradient(transparent 65%, var(--primary-100) 65%)`), Japanese corner
  brackets (`「…」`), or boutique sesame dots (`text-emphasis: filled sesame;
  text-emphasis-position: over right`).
- **`JA-31` Proportional alternate metrics (`"palt"`) on headings and UI buttons (`CSS`)** `[ADMJ]`
  Full-width kana and punctuation (`「`, `」`, `、`, `。`, `・`) carry built-in half-width
  whitespace inside their em-box. Enable `"palt"` on headings, nav links, and buttons for
  tight optical rhythm:
  ```css
  :lang(ja) :is(h1, h2, h3, h4, button, .c-badge, nav a) {
    font-feature-settings: "palt" 1;
  }
  ```
- **`JA-32` Keep body copy on full-width grid (`"palt" 0`) (`CSS`)** `[ADMJ]`
  Long-form body paragraphs leave `"palt"` off (or use `font-kerning: normal`) so kanji and
  kana maintain steady reading rhythm.
- **`JA-33` Tabular numerals (`"tnum"`) in tables, prices, and dates (`CSS`)** `[ADMJ, WIG]`
  Apply `font-variant-numeric: tabular-nums` (`"tnum" 1`) to all numeric columns, yen
  amounts (`¥12,800`), percentages, and dates (`2026年10月14日`).
- **`JA-34` Half-width punctuation compression (`text-spacing-trim`) (`CSS`)** `[ADMJ]`
  Include progressive enhancement `text-spacing-trim: trim-start` where supported so
  opening brackets (`「`, `（`) at the start of a line align flush with the left margin.

---

## 4. Kinsoku Shori (禁則処理) & Phrase Line Breaking (`JA-35`..`JA-44`)

- **`JA-35` Mandatory kinsoku CSS triad (`CSS`)** `[ADMJ]`
  Every `:lang(ja)` root or prose container must declare:
  ```css
  :lang(ja) {
    line-break: strict;
    overflow-wrap: anywhere;
    word-break: normal;
  }
  ```
- **`JA-36` Line-start prohibited characters (行頭禁則文字)** `[ADMJ]`
  `line-break: strict` prevents closing brackets (`」`, `』`, `）`, `］`), periods and commas
  (`。`, `、`, `．`, `，`), middle dots (`・`, `：`, `；`), prolonged sound marks (`ー`),
  iteration marks (`々`, `ゝ`), and small kana (`っ`, `ゃ`, `ゅ`, `ょ`, `ぁ`, `ぃ`, `ぅ`,
  `ぇ`, `ぉ`, `ッ`, `ャ`, `ュ`, `ョ`) from appearing at the start of a wrapped line.
- **`JA-37` Line-end prohibited characters (行末禁則文字)** `[ADMJ]`
  Opening brackets (`「`, `『`, `（`, `［`) and currency prefixes (`¥`, `$`) must never sit
  isolated at the end of a line.
- **`JA-38` Phrase-aware wrapping (`word-break: auto-phrase`) on headings (`CSS` / `DOM`)** `[ADMJ]`
  Apply `word-break: auto-phrase` on `:lang(ja) :is(h1, h2, h3, .u-phrase-wrap)` so Chrome's
  BudouX segmenter wraps headings at natural bunsetsu (phrase) boundaries instead of
  splitting compound words mid-kanji.
- **`JA-39` Explicit `<wbr>` with `white-space: nowrap` spans for critical hero titles (`DOM`)** `[ADMJ]`
  For cross-browser deterministic hero wrapping, wrap semantic phrases in
  `<span style="display: inline-block">` or insert `<wbr>` between bunsetsu.
- **`JA-40`..`JA-44` Overflow safety (`CSS`)** `[ADMJ]`
  `overflow-wrap: anywhere` ensures long URLs or English identifiers inside Japanese sentences
  wrap without causing horizontal scroll (`LY-01`).

---

## 5. Mixed-Script (混植 / Konshoku) & Punctuation Rules (`JA-45`..`JA-61`)

- **`JA-45` Half-width ASCII for all numbers and Latin words (`DOM`)** `[ADMJ]`
  Always use half-width numerals (`0-9`) and half-width Latin letters (`A-Z`, `a-z`). Never
  use full-width `０-９` or `Ａ-Ｚ` (`AP-102`), except inside vertical writing (`writing-mode:
  vertical-rl`) for 1–2 digit numbers.
- **`JA-46`Punctuation consistency within a document (`DOM`)** `[ADMJ]`
  Standard Japanese prose uses full-width `、` (touten) and `。` (kuten). Technical/scientific
  documents may use `，` and `．`, but never mix both conventions in the same screen.
- **`JA-47` Bracket and symbol width rules (`DOM`)** `[ADMJ]`
  Use full-width `「…」`, `『…』`, `（…）`, `・`, `〜` (wave dash `\u301C`) inside Japanese
  sentences, and half-width `(...)`, `:`, `/` inside purely English/numeric expressions
  (`2026/10/14`, `10:30`).
- **`JA-48`..`JA-52` Spacing between Japanese and Latin/Numeric characters (`CSS` / `DOM`)** `[ADMJ]`
  - `JA-48`: Progressive CSS: apply `text-autospace: normal` (CSS Text Level 4) to automatically insert `~0.125em` (`1/8 em`) optical breathing room between CJK and Latin/numeric runs.
  - `JA-49`: Do not insert raw ASCII space characters (`U+0020`) around `「…」`, `（…）`, `・`, or between numbers and Japanese counters (`100円`, `24時間`, `3件`).
- **`JA-53`..`JA-57` Vertical writing mode (`writing-mode: vertical-rl`) (`CSS`)** `[ADMJ]`
  When an editorial Japanese layout uses vertical display headings (`vertical-rl`), set
  `text-combine-upright: digits 2` (tate-chu-yoko / 縦中横) so 2-digit numbers (`24`, `01`)
  sit upright inside the vertical column.
- **`JA-58`..`JA-61` Reference Production CSS Snippet (`CSS`)** `[ADMJ]`
  ```css
  :root:lang(ja) {
    --font-sans: "Inter", "Plus Jakarta Sans", "Hiragino Kaku Gothic ProN",
      "Hiragino Sans", "AdjustedYuGothic", "BIZ UDPGothic", "Noto Sans JP", sans-serif;
    --leading-normal: 1.8;
    --leading-tight: 1.3;
    --measure: 36em;
  }

  :lang(ja) {
    line-height: var(--leading-normal, 1.8);
    letter-spacing: 0.03em;
    line-break: strict;
    overflow-wrap: anywhere;
    text-autospace: normal;
    text-spacing-trim: trim-start;
  }

  :lang(ja) :is(h1, h2, h3, h4) {
    line-height: var(--leading-tight, 1.3);
    letter-spacing: 0.02em;
    font-feature-settings: "palt" 1;
    word-break: auto-phrase;
    text-wrap: balance;
  }

  :lang(ja) :is(button, .c-badge, nav a) {
    font-feature-settings: "palt" 1;
    letter-spacing: 0.04em;
  }

  :lang(ja) :is(em, i, cite) {
    font-style: normal;
    font-weight: 700;
  }
  ```

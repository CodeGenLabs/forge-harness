---
skill: capture-evidence
id: missing-evidence-asset
fails-without: >
  The walkthrough references `assets/login.png` and marks the case passing, even
  though the screenshot file was never written or is zero bytes.
with-skill: >
  `forge evidence check` rejects missing or empty linked asset files and
  prevents publishing a broken guide into `docs/guides/`.
caught-by: evidence.missing_asset
---

The walkthrough markdown links to `assets/checkout-success.png` under CASE-01,
but the file does not exist in `changes/<n>/evidence/assets/`.

What to look for: `forge evidence check` exits 1 with `evidence.missing_asset`,
stopping `forge evidence publish` until real proof is saved.

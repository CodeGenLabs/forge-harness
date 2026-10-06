---
skill: ui-ux
id: idealised-mock-data
fails-without: >
  The agent populates mock interfaces with short, identical strings and perfect
  avatars, masking layout breakages, text truncation, and missing fallback states.
with-skill: >
  The agent populates mock data with realistic domain boundaries: zero values,
  two-line titles, missing avatars, and empty list states.
caught-by: none
---

A dashboard or list screen is designed from a prompt.

Without the skill, the generated UI features identical uniform text and perfect
data lengths. When deployed against real database records with long names,
accidental truncation or awkward wrapping breaks the visual rhythm.

The skill's scope rules explicitly ban idealised mock data and require boundary
testing with realistic varying lengths, missing images, and zero states.

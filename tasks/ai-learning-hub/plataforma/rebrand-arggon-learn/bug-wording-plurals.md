---
type: bug
status: in_progress
id: bug-wording-plurals
title: "Plurales en la confirmación de importación y redacción ES neutral"
assignee: Arggon
branch: fix/wording-plurals
parent: rebrand-arggon-learn
labels: []
created: "2026-10-22"
updated: "2026-10-22"
---
<!--
  Placement (v0): tasks/ai-learning-hub/plataforma/rebrand-arggon-learn/bug-wording-plurals.md
  Leaves live only under a story. id is the filename stem; branch is fix/wording-plurals.
-->

# Plurales en la confirmación de importación y redacción ES neutral

## Context

Follow-ups after PR #4:
- The import confirmation always used plurals ("1 concepts done", "1 conceptos hechos").
- The file input was cleared only on failure.
- Some Spanish lesson text still used gendered wording: "vos mismo" in concepts-c.js:27, and "desarrolladores .NET" in concepts-f.js:22 and concepts-k.js:111.

## Acceptance

- [ ] Confirmation uses singular for 1 and plural otherwise, in EN and ES ("1 concept done, 1 quiz score" / "1 concepto hecho, 1 puntaje de quiz").
- [ ] The file input is reset after a successful import too.
- [ ] ES: "Revisás la fuente por tu cuenta"; "quienes programan en .NET" in both resource notes.
- [ ] Tests cover all of the above; CI passes.

## Notes

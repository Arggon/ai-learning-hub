---
type: bug
status: in_progress
id: bug-rebrand-leftovers
title: "Restos del rebrand: 'hub' en lecciones, nombre del export, storage corrupto, contadores, bienvenida con género"
assignee: Arggon
branch: fix/rebrand-leftovers
parent: rebrand-arggon-learn
labels: []
created: "2026-10-22"
updated: "2026-10-22"
---
<!--
  Placement (v0): tasks/ai-learning-hub/plataforma/rebrand-arggon-learn/bug-rebrand-leftovers.md
  Leaves live only under a story. id is the filename stem; branch is fix/rebrand-leftovers (PR #3).
-->

# Restos del rebrand: 'hub' en lecciones, nombre del export, storage corrupto, contadores, bienvenida con género

## Context

QA on the Arggon Learn rebrand (PR #2) found leftovers:
- Lesson text still said "hub" (content0.js:20 and :347, content1.js:6, es/concepts-a.js:17, es/concepts-b.js:55, es/concepts-c.js:35).
- The export file was still `ai-hub-progress.json`.
- A corrupt `arggonLearn.v1` ignored a valid `aiHub.v2`.
- The header count (1/32) didn't match the home card (2/34).
- The ES welcome read "¡Bienvenido!", which is gendered.

## Acceptance

- [ ] No "hub" in user-facing lesson text, EN and ES.
- [ ] Export is `arggon-learn-progress.json`; import still accepts the old file name and v2/v1 formats, and rejects files from another app with a visible error, leaving progress unchanged.
- [ ] `#data-msg` is written with textContent (the imported file's values are untrusted).
- [ ] A corrupt or non-object `arggonLearn.v1` falls back to migrating `aiHub.v2`, with a test.
- [ ] Header count equals the home card count.
- [ ] ES welcome is gender-neutral ("¡Te damos la bienvenida!").
- [ ] `scripts/test-storage-migration.cjs` and `scripts/check-i18n.mjs` pass in CI.

## Notes

PR: https://github.com/Arggon/arggon-learn/pull/3

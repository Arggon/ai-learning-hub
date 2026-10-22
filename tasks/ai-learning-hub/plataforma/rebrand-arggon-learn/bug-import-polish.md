---
type: bug
status: in_progress
id: bug-import-polish
title: "Pulido de importación: confirmación antes de reemplazar, mensajes más claros, ES neutral en género"
assignee: Arggon
branch: fix/import-polish
parent: rebrand-arggon-learn
labels: []
created: "2026-10-22"
updated: "2026-10-22"
---
<!--
  Placement (v0): tasks/ai-learning-hub/plataforma/rebrand-arggon-learn/bug-import-polish.md
  Leaves live only under a story. id is the filename stem; branch is fix/import-polish.
-->

# Pulido de importación: confirmación antes de reemplazar, mensajes más claros, ES neutral en género

## Context

Follow-ups from QA and review of PR #3:
- A valid import replaced progress without asking.
- `version: "2"` got a generic "unsupported version 2" message.
- Long `app` values were shown in full.
- The ES onboarding still had gendered options ("Cómodo…", "Desarrollador profesional").
- The migration test's sections shared one browser context, so a failure could cascade.

## Acceptance

- [ ] ES onboarding: "Con soltura, incluidos exponentes y logaritmos" and "Me dedico al desarrollo profesionalmente"; no other gendered wording addressed to the learner.
- [ ] `version: "2"` (string) shows a clear message: version must be the number 2.
- [ ] `app` values longer than about 80 characters are truncated in the error.
- [ ] Valid imports ask for confirmation (EN and ES); cancelling leaves state, storage and language unchanged.
- [ ] Each migration-test section runs in a fresh context; a failure in one doesn't affect the others.
- [ ] CI passes.

## Notes

---
type: story
status: in_progress
id: rebrand-arggon-learn
title: "Rebrand a Arggon Learn con registro de rutas"
assignee: Arggon
branch: feat/arggon-learn-rebrand
parent: plataforma
labels: []
created: "2026-10-21"
updated: "2026-10-21"
---
<!--
  Placement (v0): tasks/ai-learning-hub/plataforma/rebrand-arggon-learn/rebrand-arggon-learn.md (story index; required).
  parent MUST be the epic id.
-->

# Rebrand a Arggon Learn con registro de rutas

## Context

As a learner, I want one Arggon Learn home where I pick what to learn, starting with AI, without losing the progress I already have from AI Learning Hub.

## Acceptance

- [ ] UI branding, page title, README and meta tags say Arggon Learn, in EN and in ES (voseo).
- [ ] Progress is stored under `arggonLearn.v1`; existing `aiHub.v2` data is copied once on first load, the old key is left as is, and the copy never overwrites newer progress. Covered by a browser test.
- [ ] A track registry (`assets/tracks.js`) holds AI as the first track, with its AI-specific copy (welcome text, map title) scoped to the track.
- [ ] A home page (`#/home`) works as a track picker with a single track.
- [ ] `node scripts/check-i18n.mjs` passes and also covers the track copy.

## Notes

PR: feat/arggon-learn-rebrand → main.

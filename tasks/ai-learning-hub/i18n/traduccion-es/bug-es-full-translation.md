---
type: bug
status: in_progress
id: bug-es-full-translation
title: "El modo ES deja contenido en inglés: lecciones, glosario, quiz y demos sin traducir"
assignee: Arggon
branch: fix/es-full-translation
parent: traduccion-es
labels: [i18n]
created: "2026-10-21"
updated: "2026-10-21"
---
<!--
  Placement (v0): tasks/ai-learning-hub/i18n/traduccion-es/bug-es-full-translation.md
  Leaves live only under a story. id is the filename stem; branch is the existing fix/es-full-translation (PR #1).
-->

# El modo ES deja contenido en inglés: lecciones, glosario, quiz y demos sin traducir

## Context

With the language set to ES, titles, summaries, "The idea in one sentence", bodies (habits, analogies, tips), quizzes, glossary definitions, resource notes, exercise tasks, code comments and most visualization labels were still shown in English. Repro: open the hub, switch to Español, and open any concept.

## Acceptance

- [ ] ES mode translates all UI and lesson content for the 34 concepts, using natural Argentine voseo.
- [ ] Code stays as code; prose comments and explanations are translated.
- [ ] Translated strings are escaped (or written as text) before reaching innerHTML.
- [ ] `node scripts/check-i18n.mjs` fails if any EN key lacks an ES value or ES equals EN for prose, and runs in CI on pull requests.
- [ ] The headless browser scan (`scripts/check-i18n-browser.cjs`) shows no page errors and no untranslated English in ES mode, apart from the documented exceptions.

## Notes

PR: https://github.com/Arggon/ai-learning-hub/pull/1
Intentionally left in English: titles of external resources (marked "(en inglés)"), the English example sentence in the attention demo, code identifiers and sample data.

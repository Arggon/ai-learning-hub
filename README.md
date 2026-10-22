# AI Learning Hub

A prerequisite-first, interactive static site for learning AI from the ground up: programming and math basics through language models, agents, MCP, evals and safety. English and Spanish (Argentine) UI.

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Progress is stored only in your browser (localStorage). Diagrams load Mermaid from the jsDelivr CDN.

## Translations

Spanish (Argentina, voseo) lives in `assets/es/`. English is the source of truth.

- `node scripts/check-i18n.mjs` — static check (also runs in CI): every English UI string, concept field, quiz item, resource note, glossary term and code comment must have a Spanish value that is not a copy of the English prose.
- `node scripts/check-i18n-browser.cjs` — optional headless scan of the live page in Spanish mode (needs `playwright-core` and Chrome; set `PW_CORE` and `CHROME`).

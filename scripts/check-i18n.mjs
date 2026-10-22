#!/usr/bin/env node
// Static i18n check (no browser). Fails (exit 1) when Spanish content is missing or identical to the English prose.
// Run: node scripts/check-i18n.mjs
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm"; import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const A = (f) => path.join(root, "assets", f);
const ctx = { console }; ctx.window = ctx; ctx.String = String; vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(A(f), "utf8"), ctx, { filename: f });
["content0.js", "content1.js", "content2.js", "content3.js", "content4.js", "exercises1.js", "exercises2.js", "glossary.js", "i18n.js"].forEach(load);
fs.readdirSync(A("es")).filter((f) => f.endsWith(".js")).sort().forEach((f) => load("es/" + f));
const { CONCEPTS, GLOSSARY, I18N, ONBOARDING, EXERCISES, ES, GROUPS } = ctx;
const errors = [];
const err = (m) => errors.push(m);
// Strings allowed to be identical in EN and ES (technical terms, names, symbols).
const SAME_OK = new Set(["API", "JSON", "SQL", "RAG", "MCP", "LLM", "LoRA", "RLHF", "OK", "Python", "C#", "TypeScript", "JavaScript", "GitHub", "Token", "Tokens", "Prompt", "Prompts", "Embeddings", "Transformers", "Backprop", "ML", "IA", "Chatbot", "Fine-tuning", "Top-p", "Pseudo", "Email", "Web",
  // code samples, formulas and proper names that are the same in both languages
  "JavaScript / TypeScript", "{ \"name\": \"Ana\", \"age\": 30 }", "{ name: 'Ana' }", "{ \"name\": \"Ana\" }", "{ \"name\": \"Ana\", }", "name = Ana", "ReLU(z) = max(0, z).", "Model Context Protocol (MCP)", "CPU, GPU, RAM"]);
const prose = (s) => typeof s === "string" && /[A-Za-z]{3,}.*\s.*[A-Za-z]{3,}/.test(s.replace(/<[^>]+>|`[^`]*`|\[\[[^\]]*\]\]/g, ""));
const same = (en, es, where) => { if (typeof en === "string" && en === es && prose(en) && !SAME_OK.has(en.trim())) err(`${where}: Spanish equals English: ${JSON.stringify(en.slice(0, 80))}`); };
const missing = (v) => v == null || (typeof v === "string" && !v.trim());
const glossKeys = (s) => [...String(s || "").matchAll(/\[\[([^|\]]+)(?:\|[^\]]*)?\]\]/g)].map((m) => m[1]).sort().join(",");

// 1. UI strings
for (const [k, en] of Object.entries(I18N.en)) {
  const es = I18N.es[k];
  if (missing(es)) err(`I18N.es.${k}: missing`); else same(en, es, `I18N.es.${k}`);
}
for (const k of Object.keys(I18N.es)) if (!(k in I18N.en)) err(`I18N.es.${k}: no English key`);
// 2. Onboarding
(ONBOARDING || []).forEach((q, i) => {
  const walk = (o, p) => { for (const [k, v] of Object.entries(o)) { if (k === "en" && typeof v === "string") { if (missing(o.es)) err(`ONBOARDING${p}: missing es`); else same(v, o.es, `ONBOARDING${p}`); } else if (v && typeof v === "object") walk(v, `${p}.${k}`); } };
  walk(q, `[${i}]`);
});
// 3. Concepts
for (const c of CONCEPTS) {
  const e = ES.concepts[c.id], w = `concept ${c.id}`;
  if (!e) { err(`${w}: no Spanish entry`); continue; }
  for (const f of ["title", "summary", "why", "body"]) { if (missing(e[f])) err(`${w}.${f}: missing`); else same(c[f], e[f], `${w}.${f}`); }
  if (glossKeys(c.body) !== glossKeys(e.body)) err(`${w}.body: glossary keys differ from English`);
  const res = c.resources || [];
  if ((e.res || []).length !== res.length) err(`${w}.res: ${(e.res || []).length} notes, expected ${res.length}`);
  res.forEach((r, i) => { if (r.note) { const n = (e.res || [])[i]; if (missing(n)) err(`${w}.res[${i}]: missing note`); else same(r.note, n, `${w}.res[${i}]`); } });
  const qz = c.quiz || [];
  if ((e.quiz || []).length !== qz.length) err(`${w}.quiz: ${(e.quiz || []).length} questions, expected ${qz.length}`);
  qz.forEach((q, i) => {
    const [qq, opts, why] = (e.quiz || [])[i] || [];
    if (missing(qq)) err(`${w}.quiz[${i}].q: missing`); else same(q.q, qq, `${w}.quiz[${i}].q`);
    if (!Array.isArray(opts) || opts.length !== q.options.length) err(`${w}.quiz[${i}]: option count differs`);
    else q.options.forEach((o, j) => { if (missing(opts[j])) err(`${w}.quiz[${i}].options[${j}]: missing`); else same(o, opts[j], `${w}.quiz[${i}].options[${j}]`); });
    if (q.why) { if (missing(why)) err(`${w}.quiz[${i}].why: missing`); else same(q.why, why, `${w}.quiz[${i}].why`); }
  });
  const task = (EXERCISES[c.id] && EXERCISES[c.id].task) || (c.exercise && c.exercise.task);
  if (task) { if (missing(e.task)) err(`${w}.task: missing`); else same(task, e.task, `${w}.task`); }
  // code comments: every prose comment needs a translation (or an explicit keep-as-code entry)
  const codes = []; const add = (x) => { if (typeof x === "string") codes.push(x); else if (x && typeof x === "object") Object.values(x).forEach(add); };
  add(c.exercise && c.exercise.code); add(EXERCISES[c.id] && EXERCISES[c.id].code);
  for (const code of codes) for (const line of code.split("\n")) {
    const m = line.match(/(^|\s)(\/\/|#)(\s?)(.+)$/); if (!m) continue; const txt = m[4].trim();
    if (!/[A-Za-z]{3,}/.test(txt)) continue;
    if (!(ES.comments && ES.comments[txt]) && !(ES.codeComments || []).includes(txt)) err(`${w} code comment not translated: ${JSON.stringify(txt)}`);
  }
}
for (const id of Object.keys(ES.concepts)) if (!CONCEPTS.some((c) => c.id === id)) err(`ES.concepts.${id}: unknown concept`);
// 4. Glossary
for (const [k, def] of Object.entries(GLOSSARY)) {
  const e = ES.glossary[k];
  if (!Array.isArray(e) || missing(e[0]) || missing(e[1])) err(`glossary ${k}: missing [term, definition]`);
  else same(typeof def === "string" ? def : def.def, e[1], `glossary ${k}`);
}
// 5. Groups
for (const g of Object.keys(GROUPS || {})) if (missing(ES.groups && ES.groups[g])) err(`group ${g}: missing Spanish label`);

console.log(`i18n check: ${CONCEPTS.length} concepts, ${Object.keys(GLOSSARY).length} glossary terms, ${Object.keys(I18N.en).length} UI keys.`);
if (errors.length) { console.error(errors.map((e) => "✗ " + e).join("\n")); console.error(`\n${errors.length} problem(s).`); process.exit(1); }
console.log("✓ All English content has a Spanish translation.");

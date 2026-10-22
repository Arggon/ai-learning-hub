/* Browser test for the one-time storage migration aiHub.v2 → arggonLearn.v1, plus the home / track picker.
   Run: PW_CORE=<path to playwright-core> CHROME=<chrome binary> node scripts/test-storage-migration.cjs */
const { chromium } = require(process.env.PW_CORE || "playwright");
const path = require("path");
const URL = "file://" + path.resolve(__dirname, "..", "index.html");
let fails = 0;
const ok = (c, m) => { console.log((c ? "✔ " : "✘ ") + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME });
  const page = async (seed) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true }); const p = await ctx.newPage();
    const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
    // Seed once per context. The marker lives in localStorage: sessionStorage is not reliably kept across reloads of file:// pages.
    await p.addInitScript(([s, tag]) => { if (localStorage.getItem("__test_seed") !== tag) { localStorage.clear(); for (const [k, v] of Object.entries(s || {})) localStorage.setItem(k, v); localStorage.setItem("__test_seed", tag); } }, [seed, String(Math.random())]);
    await p.goto(URL); await p.waitForTimeout(400); return { ctx, p, errs };
  };
  const old = { version: 2, profile: { answers: { prog: "little", lang: "python", web: "idea", db: "none", math: "basic", ai: "some", goal: "use" }, at: "2026-10-01T00:00:00Z" }, skipped: false, manualKnown: { math_basics: true },
    done: { chatbot_use: true, prog_basics: true }, quiz: { chatbot_use: { best: 3, last: 2, at: "2026-10-02T00:00:00Z" } }, settings: { codeLang: "python", uiLang: "es", theme: "dark", track: "beginner" }, view: { subgraphs: true } };

  // 1. Existing aiHub.v2 data is copied once
  let { ctx, p, errs } = await page({ "aiHub.v2": JSON.stringify(old) });
  let st = await p.evaluate(() => ({ cur: JSON.parse(localStorage.getItem("arggonLearn.v1") || "null"), old: localStorage.getItem("aiHub.v2"), S: HUB.S, lang: document.documentElement.lang, theme: document.documentElement.dataset.theme }));
  ok(st.cur && st.cur.done.chatbot_use && st.cur.done.prog_basics, "done concepts copied to arggonLearn.v1");
  ok(st.cur && st.cur.quiz.chatbot_use.best === 3 && st.cur.quiz.chatbot_use.last === 2, "quiz scores copied");
  ok(st.cur && st.cur.profile && st.cur.profile.answers.prog === "little" && st.cur.manualKnown.math_basics === true, "profile and known concepts copied");
  ok(st.cur && st.cur.settings.uiLang === "es" && st.cur.settings.theme === "dark" && st.cur.settings.codeLang === "python" && st.cur.settings.track === "beginner", "settings copied");
  ok(st.cur && st.cur.copiedFrom && st.cur.copiedFrom.key === "aiHub.v2", "copy is recorded (copiedFrom)");
  ok(st.old === JSON.stringify(old), "old aiHub.v2 key left untouched");
  ok(st.lang === "es" && st.theme === "dark", "copied settings applied on first load");
  // 2. It runs only once: new progress is not overwritten by the old key on reload
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem("arggonLearn.v1")); s.done.vars_functions = true; localStorage.setItem("arggonLearn.v1", JSON.stringify(s)); });
  // "Next load": close the tab and open a new one in the same browser context (same localStorage, no seeding script).
  // A plain reload re-ran the seeding init script under some timings, which made this check flaky.
  await p.close(); p = await ctx.newPage(); p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto(URL); await p.waitForFunction(() => window.HUB && window.HUB.S); await p.waitForTimeout(300);
  st = await p.evaluate(() => ({ S: HUB.S, cur: JSON.parse(localStorage.getItem("arggonLearn.v1")) }));
  ok(st.S.done.vars_functions === true && st.cur.done.vars_functions === true, "after reload, new progress kept (no second copy)");
  ok(st.S.copiedFrom && st.S.copiedFrom.key === "aiHub.v2" && typeof st.S.copiedFrom.at === "string", "copiedFrom survives sanitize on the next load");
  await p.evaluate(() => { document.querySelector("#theme-toggle").click(); }); await p.waitForTimeout(300);
  st = await p.evaluate(() => JSON.parse(localStorage.getItem("arggonLearn.v1")));
  ok(st.copiedFrom && st.copiedFrom.key === "aiHub.v2" && Object.keys(st.copiedFrom).sort().join() === "at,key", "copiedFrom is written back on save, with only key and at");
  ok(errs.length === 0, "no page errors (" + errs.join("; ") + ")"); await ctx.close();

  // 3. arggonLearn.v1 wins when both keys exist
  ({ ctx, p, errs } = await page({ "aiHub.v2": JSON.stringify(old), "arggonLearn.v1": JSON.stringify({ version: 2, done: { web_apis: true }, quiz: {}, settings: { uiLang: "en" } }) }));
  st = await p.evaluate(() => HUB.S);
  ok(st.done.web_apis === true && !st.done.chatbot_use, "existing arggonLearn.v1 is used, old data not merged in"); await ctx.close();

  // 3b. Corrupt arggonLearn.v1 + valid aiHub.v2: fall back to copying aiHub.v2, keep the corrupt text for recovery
  ({ ctx, p, errs } = await page({ "aiHub.v2": JSON.stringify(old), "arggonLearn.v1": "{not json" }));
  st = await p.evaluate(() => ({ S: HUB.S, cur: JSON.parse(localStorage.getItem("arggonLearn.v1")), bak: localStorage.getItem("arggonLearn.v1.corrupt"), old: localStorage.getItem("aiHub.v2") }));
  ok(st.S.done.chatbot_use && st.S.quiz.chatbot_use.best === 3 && st.cur.done.prog_basics, "corrupt arggonLearn.v1: progress recovered from aiHub.v2");
  ok(st.cur.copiedFrom && st.cur.copiedFrom.key === "aiHub.v2", "corrupt arggonLearn.v1: replaced with valid data (copiedFrom recorded)");
  ok(st.bak === "{not json" && st.old === JSON.stringify(old), "corrupt text kept in arggonLearn.v1.corrupt; aiHub.v2 untouched");
  await ctx.close();
  for (const bad of ["[1,2]", "null", "42"]) {
    ({ ctx, p, errs } = await page({ "aiHub.v2": JSON.stringify(old), "arggonLearn.v1": bad }));
    ok((await p.evaluate(() => HUB.S.done.chatbot_use === true)), `non-object arggonLearn.v1 (${bad}) also falls back to aiHub.v2`); await ctx.close();
  }

  // 3c. Export file name, and import of an old AI Learning Hub export (ai-hub-progress.json, no "app" field)
  ({ ctx, p, errs } = await page({ "arggonLearn.v1": JSON.stringify({ version: 2, skipped: true, done: { web_apis: true }, quiz: {}, settings: { uiLang: "en" } }) }));
  await p.evaluate(() => (location.hash = "#/settings")); await p.waitForSelector("#import-file", { state: "attached" }); await p.evaluate(() => document.querySelector("#data-msg").replaceChildren());
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#export")]);
  const exported = JSON.parse(require("fs").readFileSync(await dl.path(), "utf8"));
  ok(dl.suggestedFilename() === "arggon-learn-progress.json" && exported.app === "arggon-learn" && exported.done.web_apis === true, `export file is ${dl.suggestedFilename()} with app marker`);
  await p.setInputFiles("#import-file", { name: "ai-hub-progress.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ ...old, exportedAt: "2026-10-10T00:00:00Z" })) });
  await p.waitForSelector("#data-msg span", { timeout: 5000 });
  st = await p.evaluate(() => HUB.S);
  ok(st.done.chatbot_use && st.quiz.chatbot_use.best === 3 && !st.done.web_apis, "importing an old ai-hub-progress.json restores its progress");
  await p.evaluate(() => (location.hash = "#/settings")); await p.waitForSelector("#import-file", { state: "attached" }); await p.evaluate(() => document.querySelector("#data-msg").replaceChildren());
  await p.setInputFiles("#import-file", { name: "arggon-learn-progress.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exported)) });
  await p.waitForSelector("#data-msg span", { timeout: 5000 });
  ok(await p.evaluate(() => HUB.S.done.web_apis === true && !HUB.S.done.chatbot_use), "importing arggon-learn-progress.json round-trips");
  await p.evaluate(() => (location.hash = "#/settings")); await p.waitForSelector("#import-file", { state: "attached" }); await p.evaluate(() => document.querySelector("#data-msg").replaceChildren());
  await p.setInputFiles("#import-file", { name: "v1.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ done: { prog_basics: true }, quiz: {} })) });
  await p.waitForSelector("#data-msg span", { timeout: 5000 });
  ok(await p.evaluate(() => HUB.S.done.prog_basics === true), "importing the old v1 format still works");
  {
    const b0 = await p.evaluate(() => JSON.stringify(HUB.S)); await p.evaluate(() => (location.hash = "#/settings")); await p.waitForSelector("#import-file", { state: "attached" }); await p.evaluate(() => document.querySelector("#data-msg").replaceChildren());
    await p.setInputFiles("#import-file", { name: "other.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ app: "other", version: 2, done: { chatbot_use: true }, quiz: {} })) });
    await p.waitForSelector("#data-msg span", { timeout: 5000 });
    const r = await p.evaluate(() => ({ S: JSON.stringify(HUB.S), msg: document.querySelector("#data-msg").textContent }));
    ok(r.S === b0 && r.msg.includes("exported by another app: other"), 'app:"other" import is rejected with an error and progress is unchanged');
  }
  // A file exported by another app is rejected: progress unchanged, error shown as plain text (the app value is untrusted).
  const before = await p.evaluate(() => ({ S: JSON.stringify(HUB.S), stored: localStorage.getItem("arggonLearn.v1") }));
  await p.evaluate(() => { window.__xss = false; location.hash = "#/settings"; }); await p.waitForSelector("#import-file", { state: "attached" }); await p.evaluate(() => document.querySelector("#data-msg").replaceChildren());
  const evil = '<img src=x onerror="window.__xss=true">';
  await p.setInputFiles("#import-file", { name: "other.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ app: evil, version: 2, done: { web_apis: true, db_basics: true }, quiz: { web_apis: { best: 1, last: 1 } }, settings: { uiLang: "es", theme: "dark" } })) });
  await p.waitForSelector("#data-msg span", { timeout: 5000 });
  const after = await p.evaluate(() => ({ S: JSON.stringify(HUB.S), stored: localStorage.getItem("arggonLearn.v1"), msg: document.querySelector("#data-msg").textContent, cls: (document.querySelector("#data-msg span") || {}).className, img: !!document.querySelector("#data-msg img"), xss: window.__xss }));
  {
    // The file's data differs from the current state on every field, so any partial apply would show up here.
    const B = JSON.parse(before.S), A = JSON.parse(after.S);
    ok(after.S === before.S && after.stored === before.stored && !A.done.web_apis && !A.done.db_basics && !A.quiz.web_apis && A.settings.uiLang === B.settings.uiLang && A.settings.theme === B.settings.theme && B.done.prog_basics === true && A.done.prog_basics === true,
      "HTML-app import leaves progress, settings and storage unchanged (file data differs, so a mutation would be caught)");
  }
  ok(after.cls === "bad" && after.msg.includes("exported by another app: " + evil), "app:\"other\" import shows the error message (" + after.msg.slice(0, 80) + ")");
  ok(!after.img && after.xss === false, "the untrusted app value is shown as text, not HTML");
  // Junk files are rejected with a localized message and never touch the current state.
  const junk = [
    ['{"done":"x"}', "{\"done\":\"x\"}", 'the "done" field has the wrong format'],
    ['{"quiz":1}', "{\"quiz\":1}", 'the "quiz" field has the wrong format'],
    ['{"done":[1]}', "{\"done\":[1]}", 'the "done" field has the wrong format'],
    ["version 3", JSON.stringify({ version: 3, done: { web_apis: true }, settings: { uiLang: "es" } }), "unsupported version 3"],
    ['version "2"', JSON.stringify({ version: "2", done: { web_apis: true } }), "unsupported version 2"],
    ["v2 with settings as a string", JSON.stringify({ version: 2, done: { web_apis: true }, settings: "es" }), 'the "settings" field has the wrong format'],
    ["profile without answers", JSON.stringify({ version: 2, profile: { at: "x" } }), 'the "profile" field has the wrong format'],
    ["no known concept ids", JSON.stringify({ done: { nope: true }, quiz: {} }), "it has no known concepts or profile"],
    ["empty v2", JSON.stringify({ version: 2 }), "it has no known concepts or profile"],
    ["empty object", "{}", "it has no known concepts or profile"],
    ["array", "[1,2]", "the file is not a progress object"],
    ["null", "null", "the file is not a progress object"],
    ["string", '"hello"', "the file is not a progress object"],
    ["malformed JSON", "{not json", "the file is not valid JSON"],
  ];
  for (const [name, text, want] of junk) {
    await p.evaluate(() => (location.hash = "#/settings")); await p.waitForSelector("#import-file", { state: "attached" }); await p.evaluate(() => document.querySelector("#data-msg").replaceChildren());
    const b0 = await p.evaluate(() => ({ S: JSON.stringify(HUB.S), stored: localStorage.getItem("arggonLearn.v1"), lang: document.documentElement.lang }));
    await p.setInputFiles("#import-file", { name: "junk.json", mimeType: "application/json", buffer: Buffer.from(text) });
    await p.waitForSelector("#data-msg span", { timeout: 5000 });
    const r = await p.evaluate(() => ({ S: JSON.stringify(HUB.S), stored: localStorage.getItem("arggonLearn.v1"), lang: document.documentElement.lang, msg: document.querySelector("#data-msg").textContent, cls: document.querySelector("#data-msg span").className }));
    ok(r.S === b0.S && r.stored === b0.stored && r.lang === b0.lang && r.cls === "bad" && r.msg.includes(want) && !/Imported/i.test(r.msg), `junk import rejected, state unchanged: ${name} → "${r.msg}"`);
  }
  // Spanish UI: the malformed-JSON message is localized (not the browser's English parser text)
  await p.click("#lang-toggle"); await p.evaluate(() => (location.hash = "#/settings")); await p.waitForSelector("#import-file", { state: "attached" }); await p.evaluate(() => document.querySelector("#data-msg").replaceChildren());
  await p.setInputFiles("#import-file", { name: "junk.json", mimeType: "application/json", buffer: Buffer.from("{not json") });
  await p.waitForSelector("#data-msg span", { timeout: 5000 });
  const esMsg = await p.evaluate(() => document.querySelector("#data-msg").textContent);
  ok(esMsg.includes("el archivo no es JSON válido") && !/Unexpected|JSON\.parse|position/i.test(esMsg), `ES malformed-JSON message is localized: "${esMsg}"`);
  await p.click("#lang-toggle");
  ok(errs.length === 0, "no page errors (" + errs.join("; ") + ")"); await ctx.close();

  // 3d. Header count matches the home card count (known concepts excluded in both)
  ({ ctx, p, errs } = await page({ "aiHub.v2": JSON.stringify(old) }));
  await p.evaluate(() => (location.hash = "#/home")); await p.waitForTimeout(400);
  const counts = await p.evaluate(() => ({ head: document.querySelector("#progress-mini span").textContent.match(/\d+\/\d+/)[0], card: document.querySelector(".track-card").textContent.match(/\d+\/\d+/)[0] }));
  ok(counts.head === counts.card, `header count ${counts.head} equals home card count ${counts.card}`); await ctx.close();

  // 4. Fresh visitor: home with one track, then the track map and onboarding
  ({ ctx, p, errs } = await page({}));
  ok((await p.evaluate(() => location.hash || "")) === "" && (await p.locator(".track-card").count()) === 1, "fresh visit shows the home with 1 track card");
  ok(await p.evaluate(() => !localStorage.getItem("aiHub.v2")), "no legacy key written");
  for (const lang of ["en", "es"]) {
    if (lang === "es") { await p.click("#lang-toggle"); await p.waitForTimeout(300); }
    const h = await p.evaluate(() => ({ t: document.title, brand: document.querySelector(".brand").textContent, h1: document.querySelector("main h1").textContent, card: document.querySelector(".track-card h2").textContent, desc: document.querySelector('meta[name="description"]').content, sw: document.documentElement.scrollWidth }));
    ok(h.t.startsWith("Arggon Learn") && h.brand.includes("Arggon Learn") && h.desc.startsWith("Arggon Learn"), `${lang}: title, brand and meta say Arggon Learn`);
    ok(lang === "en" ? h.h1 === "What do you want to learn?" && h.card === "Artificial intelligence" : h.h1 === "¿Qué querés aprender?" && h.card === "Inteligencia artificial", `${lang}: home heading and track card translated (${h.h1} / ${h.card})`);
    ok(h.sw <= 390, `${lang}: home fits 390px (scrollWidth ${h.sw})`);
  }
  await p.click(".track-card"); await p.waitForTimeout(400);
  ok((await p.evaluate(() => location.hash)) === "#/welcome" && (await p.evaluate(() => HUB.S.trackId)) === "ai", "picking the AI track opens its onboarding and remembers the track");
  ok((await p.locator("main").innerText()).includes("Esta ruta enseña cómo funciona la IA moderna"), "AI-specific welcome text comes from the track copy");
  await p.click("#ob-skip"); await p.waitForTimeout(800);
  ok((await p.locator("main h2").first().innerText()) === "Tu mapa de IA, armado a partir de requisitos", "map title comes from the track copy");
  ok(errs.length === 0, "no page errors (" + errs.join("; ") + ")"); await ctx.close();
  await b.close();
  console.log(fails ? `\n${fails} failed` : "\nall passed"); process.exit(fails ? 1 : 0);
})();

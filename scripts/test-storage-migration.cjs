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
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
    const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
    await p.addInitScript((s) => { if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.clear(); for (const [k, v] of Object.entries(s || {})) localStorage.setItem(k, v); } }, seed);
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
  await p.reload(); await p.waitForTimeout(400);
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

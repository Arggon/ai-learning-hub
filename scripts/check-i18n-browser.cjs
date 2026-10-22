/* Headless check: renders every page in Spanish, exercises each visualization (buttons, checkboxes, selects,
   canvas clicks) and reports text that stayed in English. Resource titles (.resources a) and a few quoted
   English examples (KEEP) are exempt on purpose.
   Usage: node scripts/check-i18n-browser.cjs   (needs playwright-core and a Chromium; set CHROME=/path/to/chrome or PW_CORE=/path/to/playwright-core) */
const path = require("path");
const { chromium } = require(process.env.PW_CORE || "playwright-core");
const url = "file://" + path.resolve(__dirname, "../index.html");
const EN_WORDS = /\b(the|and|with|your|you|this|that|from|which|what|when|click|press|step|next|reset|sample|tokens? per|is|are|of)\b/gi;
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 900 } });
  await ctx.addInitScript(() => { localStorage.setItem("arggonLearn.v1", JSON.stringify({ version: 2, skipped: true, settings: { uiLang: "es", codeLang: "python", theme: "light", track: "auto" } })); });
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(e.message)); page.on("dialog", (d) => d.dismiss());
  await page.goto(url + "#/map"); await page.waitForTimeout(800);
  const ids = await page.evaluate(() => window.CONCEPTS.map((c) => c.id));
  const report = {};
  const scan = async (where) => {
    const txt = await page.evaluate(() => {
      const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) { const n = w.currentNode, p = n.parentElement; if (!p || p.closest("pre,code,textarea,script,style,.url,.resources a,svg[id^=mm],#graph,#mini,.tok,.tokens")) continue; const s = n.nodeValue.trim(); if (s) out.push(s); }
      return out;
    });
    const bad = txt.filter((s) => (s.match(EN_WORDS) || []).length >= 2);
    // Intentional English: example sentences the lessons quote on purpose and a paper title.
    const KEEP = [/The cat sat on the/, /The animal didn't cross the street/, /Attention Is All You Need/];
    const real = bad.filter((x) => !KEEP.some((re) => re.test(x)));
    if (real.length) report[where] = [...new Set(real)];
  };
  for (const h of ["#/home", "#/map", "#/path", "#/progress", "#/glossary", "#/settings", "#/welcome"]) { await page.evaluate((x) => (location.hash = x), h); await page.waitForTimeout(400); await scan(h); }
  for (const id of ids) {
    await page.evaluate((x) => (location.hash = "#/c/" + x), id); await page.waitForTimeout(300);
    const viz = await page.$("#viz");
    if (viz) {
      for (let round = 0; round < 3; round++) {
        for (const b of await page.$$("#viz button")) { try { await b.click({ timeout: 300 }); } catch {} }
        for (const cb of await page.$$("#viz input[type=checkbox]")) { try { await cb.click({ timeout: 300 }); } catch {} }
        for (const s of await page.$$("#viz select")) { const vals = await s.evaluate((e) => [...e.options].map((o) => o.value)); for (const v of vals) { try { await s.selectOption(v); } catch {} } }
        for (const r of await page.$$("#viz input[type=range]")) { await r.evaluate((e) => { e.value = e.max; e.dispatchEvent(new Event("input", { bubbles: true })); }); }
        const cv = await page.$("#viz canvas"); if (cv) { try { await cv.click({ position: { x: 60 + round * 40, y: 80 }, timeout: 300 }); } catch {} }
        await page.waitForTimeout(800);
      }
    }
    for (const q of await page.$$("#quiz .opt")) { try { await q.click({ timeout: 200 }); } catch {} }
    await scan("#/c/" + id);
  }
  const miss = await page.evaluate(() => [...(window.VIZ_I18N ? window.VIZ_I18N.miss : [])]);
  await browser.close();
  const n = Object.values(report).reduce((a, b) => a + b.length, 0) + miss.length + errors.length;
  if (process.argv.includes("--json")) console.log(JSON.stringify({ report, miss, errors }, null, 1));
  else { for (const [k, v] of Object.entries(report)) { console.log("✘", k); v.forEach((s) => console.log("   ", s.slice(0, 160))); } if (miss.length) { console.log("✘ untranslated viz strings:"); miss.forEach((s) => console.log("   ", JSON.stringify(s))); } errors.forEach((e) => console.log("✘ page error:", e)); }
  console.log(n ? `\n${n} problem(s) found` : "✔ Spanish mode: no English text detected");
  process.exit(n ? 1 : 0);
})();

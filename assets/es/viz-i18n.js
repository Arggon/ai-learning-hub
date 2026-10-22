/* Spanish for the interactive visualizations. The viz code writes English; in Spanish mode the app runs
   VIZ_I18N.translate() over the viz container (and on every change), translating each text fragment by exact
   match (ES.viz) or by pattern (ES.vizRe). Canvas text goes through the same lookup (see VU.canvas).
   Text inside <pre>, <code> and <textarea> is code/data and is left alone unless listed in ES.vizPre. */
window.ES = window.ES || {};
(function () {
  const isEs = () => document.documentElement.lang === "es";
  // Safety: translations are written only through Text.nodeValue, textContent and setAttribute, never innerHTML,
  // so a translated string can never inject markup.
  const miss = new Set(); const done = new Set();
  function tr(s) {
    if (!isEs() || s == null) return s;
    const str = String(s); const m = str.match(/^(\s*)([\s\S]*?)(\s*)$/); const core = m[2];
    if (!core || !/[A-Za-z]{2}/.test(core)) return str;
    const D = window.ES.viz || {};
    if (Object.prototype.hasOwnProperty.call(D, core)) { done.add(D[core]); return m[1] + D[core] + m[3]; }
    if (!done.seeded) { Object.values(D).forEach((v) => done.add(v)); done.seeded = true; }
    const bare = core.replace(/^[○✔]\s*/, "");
    if (done.has(core) || done.has(bare) || /[áéíóúñ¿¡]/i.test(core)) return str;
    if (/^[\w.]+\(.*\)$|\.md$|^"\w+"$/.test(core)) return str; // code calls, file names, quoted sample data
    for (const [re, rep] of window.ES.vizRe || []) { if (re.test(core)) { const o = core.replace(re, rep); done.add(o); return m[1] + o + m[3]; } }
    if (!(window.ES.vizKeep || []).includes(core) && /[A-Za-z]{3}/.test(core)) miss.add(core); return str;
  }
  const SKIP = new Set(["PRE", "CODE", "TEXTAREA", "SCRIPT", "STYLE", "KBD"]);
  const ATTRS = ["title", "aria-label", "placeholder"];
  function translate(root) {
    if (!isEs() || !root) return;
    const walk = (n) => {
      if (n.nodeType === 3) { if (n.parentElement && n.parentElement.closest("pre,code,textarea,.tokens,.tok")) return; const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; return; }
      if (n.nodeType !== 1) return;
      for (const a of ATTRS) if (n.hasAttribute(a)) { const v = tr(n.getAttribute(a)); if (v !== n.getAttribute(a)) n.setAttribute(a, v); }
      if (SKIP.has(n.tagName)) { if (n.tagName === "PRE" && window.ES.vizPre) { const v = window.ES.vizPre(n.textContent); if (v && v !== n.textContent) n.textContent = v; } return; }
      for (const ch of n.childNodes) walk(ch);
    };
    walk(root);
  }
  function watch(root) {
    if (!isEs() || !root) return null;
    translate(root);
    let busy = false;
    const mo = new MutationObserver((muts) => {
      if (busy) return; busy = true;
      try { for (const m of muts) { if (m.type === "characterData") translate(m.target); else if (m.type === "attributes") translate(m.target); else m.addedNodes.forEach((nd) => translate(nd)); } }
      finally { mo.takeRecords(); busy = false; }
    });
    mo.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    return mo;
  }
  window.VIZ_I18N = { tr, translate, watch, miss };
})();

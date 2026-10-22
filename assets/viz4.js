/* Interactive visualizations (part 4): beginner foundations. No external deps. */
(function () {
  const VIZ = window.VIZ;
  const { el, slider, button, canvas, lin, out, controls, css, isEs } = window.VU;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---- What programming is: step through a tiny program ---- */
  VIZ.progsteps = (root) => {
    root.append(el("p", { class: "muted" }, "Be the computer: press Next to run one line at a time. Watch the variables (the boxes) change and the output appear."));
    const lines = ["numbers = [3, 8, 11]", "evenCount = 0", "for each n in numbers:", "    if n is even:", "        print n, \"even\"", "        evenCount = evenCount + 1", "    else:", "        print n, \"odd\"", "print \"even numbers:\", evenCount"];
    const trace = []; let vars = {}; const output = [];
    const snap = (line, note) => trace.push({ line, vars: { ...vars }, out: [...output], note });
    vars.numbers = "[3, 8, 11]"; snap(0, "Create a list and store it in the variable numbers.");
    vars.evenCount = 0; snap(1, "Create a counter that starts at 0.");
    for (const n of [3, 8, 11]) {
      vars.n = n; snap(2, "Loop: take the next item from the list. n is now " + n + ".");
      const even = n % 2 === 0; snap(3, "Decision: is " + n + " even? " + (even ? "Yes" : "No") + ".");
      if (even) { output.push(n + " even"); snap(4, "Print a line."); vars.evenCount++; snap(5, "Add 1 to the counter."); }
      else { snap(6, "Take the else path."); output.push(n + " odd"); snap(7, "Print a line."); }
    }
    delete vars.n; output.push("even numbers: " + vars.evenCount); snap(8, "After the loop: print the result. Done!");
    const c = controls(root);
    const grid = el("div", { class: "prog-grid" }); root.append(grid);
    const code = el("ol", { class: "prog-code" }); const side = el("div");
    grid.append(code, side);
    const note = out(root);
    let i = 0;
    const draw = () => {
      const t = trace[i];
      code.innerHTML = lines.map((l, k) => '<li class="' + (k === t.line ? "cur" : "") + '"><code>' + esc(l) + "</code></li>").join("");
      side.innerHTML = '<div class="small muted">Variables</div><table class="mini-table"><tbody>' +
        Object.entries(t.vars).map(([k, v]) => "<tr><td><code>" + esc(k) + "</code></td><td><b>" + esc(v) + "</b></td></tr>").join("") +
        '</tbody></table><div class="small muted" style="margin-top:8px">Output</div><pre class="prog-out">' + esc(t.out.join("\n")) + "</pre>";
      note.innerHTML = "<b>Step " + (i + 1) + " / " + trace.length + ":</b> " + esc(t.note);
      prev.disabled = i === 0; next.disabled = i === trace.length - 1;
    };
    const prev = button(c, "◀ Back", () => { i--; draw(); }, "ghost");
    const next = button(c, "Next ▶", () => { i++; draw(); });
    button(c, "Restart", () => { i = 0; draw(); }, "ghost");
    draw();
  };

  /* ---- Variables & functions: function machine ---- */
  VIZ.funcmachine = (root) => {
    root.append(el("p", { class: "muted" }, "A function is a machine: inputs go in, an output comes out. Pick a function, change the inputs, and watch the output."));
    const FN = {
      total: { sig: "total(price, quantity, discountPercent)", params: [["price", 100], ["quantity", 3], ["discountPercent", 10]], body: "subtotal = price × quantity\nreturn subtotal − subtotal × discountPercent / 100", run: (p, q, d) => p * q - (p * q * d) / 100 },
      area: { sig: "area(width, height)", params: [["width", 4], ["height", 2.5]], body: "return width × height", run: (w, h) => w * h },
      celsius: { sig: "toFahrenheit(celsius)", params: [["celsius", 20]], body: "return celsius × 9 / 5 + 32", run: (c) => (c * 9) / 5 + 32 },
      model: { sig: "predictPrice(size)   ← a tiny \"model\"", params: [["size", 50]], body: "w = 1400   ← learned from data\nb = 23000  ← learned from data\nreturn w × size + b", run: (s) => 1400 * s + 23000 },
    };
    const c = controls(root);
    const sel = el("select", { "aria-label": "function" }, ...Object.entries(FN).map(([k, f]) => el("option", { value: k }, f.sig.split("(")[0])));
    c.append(el("label", { class: "slider" }, el("span", { class: "slabel" }, "Function"), sel));
    const machine = el("div", { class: "fmachine" }); root.append(machine);
    const draw = () => {
      const f = FN[sel.value];
      machine.innerHTML = "";
      const ins = el("div", { class: "fm-in" });
      const vals = f.params.map(([n, v]) => { const inp = el("input", { type: "number", value: v, step: "any", "aria-label": n }); ins.append(el("label", {}, el("code", {}, n), inp)); return inp; });
      const box = el("div", { class: "fm-box" }, el("div", { class: "fm-sig" }, f.sig), el("pre", {}, f.body));
      const res = el("div", { class: "fm-out" });
      const calc = () => { const args = vals.map((v) => +v.value); const r = f.run(...args); res.innerHTML = '<div class="small muted">return value</div><div class="fm-val">' + (Number.isFinite(r) ? +r.toFixed(4) : "?") + "</div><div class=\"small muted\">" + esc(f.sig.split("(")[0] + "(" + args.join(", ") + ")") + "</div>"; };
      vals.forEach((v) => v.addEventListener("input", calc));
      machine.append(ins, el("div", { class: "fm-arrow" }, "→"), box, el("div", { class: "fm-arrow" }, "→"), res);
      calc();
    };
    sel.addEventListener("change", draw); draw();
    root.append(el("p", { class: "muted small" }, "Notice predictPrice: its numbers w and b were chosen by training on examples, not by a person. That is the core idea of machine learning."));
  };

  /* ---- Data & JSON: live parser / explorer ---- */
  VIZ.jsonexplorer = (root) => {
    root.append(el("p", { class: "muted" }, "Edit the JSON. It is parsed live: you'll see a tree of its parts, or the exact error. Click any value to see its path."));
    const good = '{\n  "id": 42,\n  "customer": { "name": "Ana", "vip": true },\n  "items": [\n    { "name": "pen", "price": 2.5, "qty": 4 },\n    { "name": "book", "price": 12, "qty": 1 }\n  ],\n  "coupon": null\n}';
    const c = controls(root);
    const ta = el("textarea", { class: "viz-text mono", rows: 10, "aria-label": "JSON text" }); ta.value = good;
    const grid = el("div", { class: "json-grid" }); root.append(grid);
    const tree = el("div", { class: "json-tree" }); grid.append(ta, tree);
    const o = out(root);
    const typeOf = (v) => v === null ? "null" : Array.isArray(v) ? "list" : typeof v === "object" ? "object" : typeof v === "string" ? "string" : typeof v;
    const render = (v, path) => {
      const t = typeOf(v);
      if (t === "object" || t === "list") {
        const ul = el("ul");
        for (const [k, child] of Object.entries(v)) {
          const p = t === "list" ? path + "[" + k + "]" : path + "." + k;
          const li = el("li", {}, el("span", { class: "jk" }, t === "list" ? "[" + k + "]" : k), " ", el("span", { class: "jt jt-" + typeOf(child) }, typeOf(child)));
          const ct = typeOf(child);
          if (ct === "object" || ct === "list") li.append(render(child, p));
          else { li.append(" ", el("button", { class: "jv", type: "button", onclick: () => { o.innerHTML = "Path: <code>" + esc(p) + "</code> → <b>" + esc(JSON.stringify(child)) + "</b> (" + ct + ")"; } }, JSON.stringify(child))); }
          ul.append(li);
        }
        return ul;
      }
      return el("span", {}, JSON.stringify(v));
    };
    const parse = () => {
      tree.innerHTML = "";
      try {
        const v = JSON.parse(ta.value);
        tree.append(el("div", { class: "ok small" }, "✓ Valid JSON (" + typeOf(v) + ")"), render(v, "order"));
        ta.classList.remove("bad");
        if (!o.dataset.touched) o.innerHTML = "Try a broken version with the buttons above, or click a value in the tree.";
      } catch (e) {
        ta.classList.add("bad");
        tree.append(el("div", { class: "bad-msg" }, "✗ Not valid JSON: " + e.message));
        o.innerHTML = "Common causes: single quotes instead of double quotes, a trailing comma, a missing comma or bracket, or comments (not allowed).";
      }
    };
    ta.addEventListener("input", () => { o.dataset.touched = ""; parse(); });
    button(c, "Valid example", () => { ta.value = good; parse(); }, "ghost");
    button(c, "Break: trailing comma", () => { ta.value = good.replace('"qty": 1 }', '"qty": 1, }'); parse(); }, "ghost");
    button(c, "Break: single quotes", () => { ta.value = good.replace('"Ana"', "'Ana'"); parse(); }, "ghost");
    button(c, "Break: missing comma", () => { ta.value = good.replace('"id": 42,', '"id": 42'); parse(); }, "ghost");
    parse();
  };

  /* ---- Web & APIs: mock HTTP request / response ---- */
  VIZ.httpsim = (root) => {
    root.append(el("p", { class: "muted" }, "A pretend shop API runs inside this page. Pick a request (or edit it) and press Send to see the exact request and response."));
    const orders = { 42: { id: 42, status: "shipped", total: 22 }, 7: { id: 7, status: "processing", total: 80 } };
    let nextId = 100, calls = 0;
    const PRESETS = [
      ["Read an order", "GET", "/orders/42", "", true],
      ["Order that doesn't exist", "GET", "/orders/999", "", true],
      ["Create an order", "POST", "/orders", '{ "items": [{ "name": "pen", "qty": 2 }] }', true],
      ["Send bad JSON", "POST", "/orders", '{ "items": [ }', true],
      ["Forget the API key", "GET", "/orders/42", "", false],
    ];
    const c = controls(root);
    const preset = el("select", { "aria-label": "preset" }, ...PRESETS.map((p, i) => el("option", { value: i }, p[0])));
    c.append(el("label", { class: "slider" }, el("span", { class: "slabel" }, "Request"), preset));
    const method = el("select", { "aria-label": "method" }, ...["GET", "POST", "DELETE"].map((m) => el("option", {}, m)));
    const url = el("input", { type: "text", class: "url-in", "aria-label": "URL path" });
    const key = el("input", { type: "checkbox", "aria-label": "send API key" });
    const body = el("textarea", { class: "viz-text mono", rows: 2, "aria-label": "request body" });
    const row = el("div", { class: "controls" }, method, el("span", { class: "mono small" }, "https://api.example.com"), url, el("label", { class: "small" }, key, " send API key header"));
    root.append(row, body);
    const send = button(c, "Send ▶", () => run());
    const grid = el("div", { class: "http-grid" }); root.append(grid);
    const reqBox = el("pre", { class: "http-box" }), resBox = el("pre", { class: "http-box" });
    grid.append(el("div", {}, el("div", { class: "small muted" }, "Request (client → server)"), reqBox), el("div", {}, el("div", { class: "small muted" }, "Response (server → client)"), resBox));
    const o = out(root);
    const load = () => { const p = PRESETS[+preset.value]; method.value = p[1]; url.value = p[2]; body.value = p[3]; key.checked = p[4]; run(); };
    const server = (m, path, hasKey, text) => {
      calls++;
      if (calls > 12) return [429, { error: "Too many requests. Slow down and retry later." }, "429 means rate-limited: wait, then retry (back off)."];
      if (!hasKey) return [401, { error: "Missing or invalid API key" }, "401: the server doesn't know who you are. APIs usually need a key in a header."];
      const mm = path.match(/^\/orders(?:\/(\d+))?$/);
      if (!mm) return [404, { error: "No such endpoint" }, "404: nothing lives at that URL."];
      if (m === "GET" && mm[1]) return orders[mm[1]] ? [200, orders[mm[1]], "200 OK: here is the data, as JSON."] : [404, { error: "Order " + mm[1] + " not found" }, "404: the URL is valid but that order doesn't exist."];
      if (m === "GET") return [200, Object.values(orders), "200 OK: the list of orders."];
      if (m === "POST" && !mm[1]) {
        try { const d = JSON.parse(text || "{}"); const o2 = { id: nextId++, status: "new", items: d.items || [] }; orders[o2.id] = o2; return [201, o2, "201 Created: the server stored the new order and gives it an id."]; }
        catch { return [400, { error: "Body is not valid JSON" }, "400 Bad Request: the server couldn't understand the body."]; }
      }
      if (m === "DELETE" && mm[1]) { if (!orders[mm[1]]) return [404, { error: "Order not found" }, "404."]; delete orders[mm[1]]; return [204, null, "204 No Content: deleted, nothing to send back."]; }
      return [405, { error: "Method not allowed" }, "405: this URL doesn't accept that method."];
    };
    const TEXT = { 200: "OK", 201: "Created", 204: "No Content", 400: "Bad Request", 401: "Unauthorized", 404: "Not Found", 405: "Method Not Allowed", 429: "Too Many Requests" };
    const run = () => {
      const m = method.value, path = url.value.trim() || "/", hasBody = m === "POST";
      reqBox.textContent = m + " " + path + " HTTP/1.1\nHost: api.example.com\n" + (key.checked ? "x-api-key: demo-key-123\n" : "") + (hasBody ? "Content-Type: application/json\n\n" + body.value : "");
      const [code, data, why] = server(m, path, key.checked, body.value);
      resBox.textContent = "HTTP/1.1 " + code + " " + TEXT[code] + (data !== null ? "\nContent-Type: application/json\n\n" + JSON.stringify(data, null, 2) : "");
      resBox.className = "http-box " + (code < 300 ? "ok" : "err");
      body.style.display = hasBody ? "block" : "none";
      o.innerHTML = "<b>" + code + " " + TEXT[code] + "</b> — " + esc(why.replace(/^\d{3}[^:]*:\s*/, "").replace(/^\d{3}\.$/, "Not found.")) + (calls > 9 && calls <= 12 ? " <span class=\"muted\">(Keep clicking Send to see what happens with too many requests.)</span>" : "");
    };
    preset.addEventListener("change", load); method.addEventListener("change", () => (body.style.display = method.value === "POST" ? "block" : "none")); send.title = "Send the request";
    load();
  };

  /* ---- Databases: table query builder ---- */
  VIZ.dbquery = (root) => {
    root.append(el("p", { class: "muted" }, "Build a query with the controls. The SQL text updates and matching rows are shown. Toggle the index to see how many rows the database must read."));
    const rows = [[1, "ana", 30, "2026-09-02"], [2, "ana", 80, "2026-09-10"], [3, "bo", 55, "2026-09-11"], [4, "ana", 12, "2026-09-15"], [5, "cy", 140, "2026-09-20"], [6, "bo", 22, "2026-10-01"], [7, "cy", 64, "2026-10-03"], [8, "ana", 99, "2026-10-08"]];
    const COLS = ["id", "customer", "total", "created"];
    const c = controls(root);
    const cust = el("select", { "aria-label": "customer filter" }, el("option", { value: "" }, "any customer"), ...["ana", "bo", "cy"].map((x) => el("option", { value: x }, x)));
    c.append(el("label", { class: "slider" }, el("span", { class: "slabel" }, "WHERE customer ="), cust));
    const min = slider(c, { label: "AND total >", min: 0, max: 120, step: 10, value: 0 }, () => draw());
    const order = el("select", { "aria-label": "order by" }, ...["id ASC", "total DESC", "total ASC", "created DESC"].map((x) => el("option", {}, x)));
    c.append(el("label", { class: "slider" }, el("span", { class: "slabel" }, "ORDER BY"), order));
    const limit = el("select", { "aria-label": "limit" }, ...["all", "1", "2", "3", "5"].map((x) => el("option", {}, x)));
    c.append(el("label", { class: "slider" }, el("span", { class: "slabel" }, "LIMIT"), limit));
    const idx = el("input", { type: "checkbox", "aria-label": "index on customer" });
    c.append(el("label", { class: "small" }, idx, " index on customer"));
    const sql = el("pre", { class: "sql" }); root.append(sql);
    const tbl = el("div"); root.append(tbl);
    const o = out(root);
    const draw = () => {
      const where = [];
      if (cust.value) where.push("customer = '" + cust.value + "'");
      if (min.get() > 0) where.push("total > " + min.get());
      sql.textContent = "SELECT id, customer, total, created\nFROM orders" + (where.length ? "\nWHERE " + where.join(" AND ") : "") + "\nORDER BY " + order.value + (limit.value !== "all" ? "\nLIMIT " + limit.value : "") + ";";
      let res = rows.filter((r) => (!cust.value || r[1] === cust.value) && r[2] > min.get());
      const [col, dir] = order.value.split(" "); const ci = COLS.indexOf(col);
      res.sort((a, b) => (a[ci] > b[ci] ? 1 : a[ci] < b[ci] ? -1 : 0) * (dir === "DESC" ? -1 : 1));
      if (limit.value !== "all") res = res.slice(0, +limit.value);
      tbl.innerHTML = '<table class="mini-table data"><thead><tr>' + COLS.map((h) => "<th>" + h + "</th>").join("") + "</tr></thead><tbody>" +
        (res.length ? res.map((r) => "<tr>" + r.map((v) => "<td>" + esc(v) + "</td>").join("") + "</tr>").join("") : '<tr><td colspan="4" class="muted">no rows match</td></tr>') + "</tbody></table>";
      const scanned = cust.value && idx.checked ? rows.filter((r) => r[1] === cust.value).length : rows.length;
      o.innerHTML = res.length + " row(s) returned. Rows read: <b>" + scanned + " of " + rows.length + "</b>" +
        (cust.value ? (idx.checked ? " — the index jumped straight to the '" + cust.value + "' rows." : " — without an index, every row is checked (a full scan). Imagine 10 million rows.") : " (the index on customer only helps when you filter by customer).");
    };
    [cust, order, limit, idx].forEach((x) => x.addEventListener("change", draw));
    draw();
  };

  /* ---- The math you need: plotter + calculator ---- */
  VIZ.mathplot = (root) => {
    root.append(el("p", { class: "muted" }, "Pick a function to plot. Drag the sliders for the line. Use the calculator below for percentages, exponents and logs."));
    const c = controls(root);
    const show = {};
    for (const [k, label] of [["line", "w·x + b"], ["square", "x²"], ["exp", "2ˣ"], ["log", "log₂(x)"]]) {
      const cb = el("input", { type: "checkbox", "aria-label": label }); cb.checked = k === "line" || k === "exp" || k === "log"; show[k] = cb;
      cb.addEventListener("change", () => draw()); c.append(el("label", { class: "small chip-label" }, cb, " " + label));
    }
    const c2 = controls(root);
    const w = slider(c2, { label: "w (slope)", min: -3, max: 3, step: 0.5, value: 1 }, () => draw());
    const b = slider(c2, { label: "b (intercept)", min: -4, max: 4, step: 0.5, value: 0 }, () => draw());
    const k = canvas(root, 560, 300);
    const COL = { line: "--accent", square: "--g4", exp: "--g2", log: "--g3" };
    const F = { line: (x) => w.get() * x + b.get(), square: (x) => x * x, exp: (x) => 2 ** x, log: (x) => (x > 0 ? Math.log2(x) : NaN) };
    const draw = () => {
      const { ctx, W, H } = k; k.clear();
      const X = lin(-4, 6, 30, W - 10), Y = lin(-4, 10, H - 20, 10);
      ctx.strokeStyle = css("--grid"); ctx.lineWidth = 1; ctx.font = "11px system-ui"; ctx.fillStyle = css("--muted");
      for (let gx = -4; gx <= 6; gx++) { ctx.beginPath(); ctx.moveTo(X(gx), Y(-4)); ctx.lineTo(X(gx), Y(10)); ctx.globalAlpha = gx === 0 ? 1 : 0.35; ctx.stroke(); ctx.globalAlpha = 1; if (gx) ctx.fillText(gx, X(gx) - 3, Y(0) + 13); }
      for (let gy = -4; gy <= 10; gy += 2) { ctx.beginPath(); ctx.moveTo(X(-4), Y(gy)); ctx.lineTo(X(6), Y(gy)); ctx.globalAlpha = gy === 0 ? 1 : 0.35; ctx.stroke(); ctx.globalAlpha = 1; if (gy) ctx.fillText(gy, X(0) + 4, Y(gy) + 4); }
      let ly = 18;
      for (const key of Object.keys(F)) {
        if (!show[key].checked) continue;
        ctx.strokeStyle = css(COL[key]); ctx.lineWidth = 2.5; ctx.beginPath(); let pen = false;
        for (let px = 0; px <= 400; px++) { const x = -4 + px / 40, y = F[key](x); if (!Number.isFinite(y) || y > 12 || y < -6) { pen = false; continue; } if (!pen) { ctx.moveTo(X(x), Y(y)); pen = true; } else ctx.lineTo(X(x), Y(y)); }
        ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = css(COL[key]); ctx.font = "bold 13px system-ui";
        ctx.fillText({ line: "y = " + w.get() + "·x + " + b.get(), square: "y = x²", exp: "y = 2ˣ (grows fast)", log: "y = log₂(x) (grows slowly)" }[key], W - 190, ly); ly += 18;
      }
    };
    draw();
    const calc = el("div", { class: "calc" }); root.append(calc);
    const num = (v, lbl) => el("input", { type: "number", value: v, step: "any", "aria-label": lbl, class: "num-in" });
    const p = num(25, "percent"), v = num(80, "value"), base = num(2, "base"), e = num(10, "exponent"), lv = num(1024, "log input");
    const r1 = el("b"), r2 = el("b"), r3 = el("b");
    const upd = () => { r1.textContent = +((+p.value * +v.value) / 100).toFixed(4); r2.textContent = +Math.pow(+base.value, +e.value).toPrecision(8); r3.textContent = +lv.value > 0 ? +Math.log2(+lv.value).toFixed(4) : "undefined (needs x > 0)"; };
    calc.append(el("div", {}, p, "% of ", v, " = ", r1), el("div", {}, base, " to the power ", e, " = ", r2), el("div", {}, "log₂(", lv, ") = ", r3, el("span", { class: "muted small" }, "  ← \"2 to what power gives this?\"")));
    [p, v, base, e, lv].forEach((x) => x.addEventListener("input", upd)); upd();
  };

  /* ---- Using a chatbot well: prompt doctor ---- */
  VIZ.promptdoctor = (root) => {
    root.append(el("p", { class: "muted" }, "Type a request you might send to a chatbot. The checklist looks for the ingredients that usually make answers better. (It is a simple keyword check, not an AI.)"));
    const weak = isEs() ? "escribí un mail a mi propietario" : "write an email to my landlord";
    const strong = "Write a short, polite email to my landlord asking him to repair the heating this week.\nContext: the heating stopped working on Monday; I reported it by phone on Tuesday and nobody came.\nAudience: my landlord, who prefers formal language.\nFormat: under 120 words, with a clear subject line.\nExample of the tone I want: \"Dear Mr. Smith, I hope you are well.\"\nIf anything is unclear, ask me before writing.";
    const strongEs = "Escribí un mail corto y amable a mi propietario pidiéndole que arregle la calefacción esta semana.\nContexto: la calefacción dejó de andar el lunes; lo avisé por teléfono el martes y no vino nadie.\nDestinatario: mi propietario, que prefiere un lenguaje formal.\nFormato: menos de 120 palabras, con un asunto claro.\nEjemplo del tono que quiero: \"Estimado Sr. Pérez, espero que se encuentre bien.\"\nSi algo no queda claro, preguntame antes de escribir.";
    const c = controls(root);
    const ta = el("textarea", { class: "viz-text", rows: 6, "aria-label": "your prompt" }); ta.value = weak; root.append(ta);
    const list = el("ul", { class: "checklist" }); root.append(list);
    const o = out(root);
    const CHECKS = [
      ["Clear goal (an action verb)", /(\b(write|explain|summari[sz]e|translate|compare|list|draft|review|fix|create|plan|suggest|analy[sz]e|rewrite|classify)\b|(^|[\s¿¡])(escrib|explic|resum|traduc|compar|list|redact|revis|arregl|cre[áa]|plane|suger|analiz|reescrib|clasific)\p{L}*)/iu, "Start with what you want done: \"Summarize…\", \"Draft…\", \"Compare…\"."],
      ["Audience or purpose", /(\b(for (a|an|my|the|non|beginners|kids|students|customers)|audience|reader|who will|so that|because|purpose|in order to)\b|(^|\s)(para (un|una|mi|el|la|alguien|principiantes|chicos|alumnos|clientes)|destinatario|p[úu]blico|lector|para que|porque|prop[óo]sito|objetivo)(?=\s|$|[.,:;]))/iu, "Say who it's for and why: \"for a non-technical manager\", \"so I can decide…\"."],
      ["Context or material", /(context|background|here is|below|attached|contexto|antecedentes|ac[áa] est[áa]|abajo|adjunt|:\n|\n.{40,}|"[^"]{30,}")/iu, "Paste the relevant text, data or details instead of describing them."],
      ["Output format or length", /(\b(bullet|table|list|words|sentences|paragraph|format|json|email|subject line|steps|short|brief|max(imum)?|under \d+)\b|(^|\s)(vi[ñn]etas?|tabla|lista|palabras|oraciones|p[áa]rrafo|formato|mail|correo|asunto|pasos|corto|breve|m[áa]ximo|menos de \d+)(?=\s|$|[.,:;]))/iu, "Ask for a shape: \"5 bullet points\", \"a table\", \"under 100 words\"."],
      ["An example of what good looks like", /(\b(example|e\.g\.|for instance|like this|such as|tone)\b|(^|\s)(ejemplo|por ejemplo|como este|tono)(?=\s|$|[.,:;]))/iu, "Show a sample of the style or output you want."],
      ["Permission to ask or say \"I don't know\"", /(\b(ask me|if (anything|something) is unclear|not sure|don'?t know|cite|sources?|uncertain)\b|(pregunt[áa]me|si algo no (queda|est[áa]) claro|no est[áa]s seguro|no s[ée]|cit[áa]|fuentes?|dudas?))/iu, "Add: \"If you're not sure, say so\" or \"Ask me questions first\"."],
    ];
    const SECRET = /(sk-[A-Za-z0-9_-]{8,}|\b(password|contrase[ñn]a|clave)\s*[:=]|\bapi[_ -]?key\s*[:=]|\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b)/i;
    const draw = () => {
      const t = ta.value; let score = 0;
      list.innerHTML = "";
      for (const [label, re, tip] of CHECKS) {
        const ok = re.test(t); if (ok) score++;
        list.append(el("li", { class: ok ? "ok" : "miss" }, el("span", { class: "ck" }, ok ? "✓" : "○"), " ", el("b", {}, label), ok ? "" : el("span", { class: "muted small" }, " — " + tip)));
      }
      const secret = SECRET.test(t);
      o.innerHTML = "Ingredients: <b>" + score + " / " + CHECKS.length + "</b>. " + (score >= 5 ? "Great brief — the model has what it needs." : score >= 3 ? "Decent. Adding the missing pieces usually improves the answer." : "Very short prompts get generic answers. Add context and a format.") +
        (secret ? '<br><span class="warn-inline">⚠ This looks like a password, API key or card number. Never paste secrets into a chatbot.</span>' : "");
    };
    ta.addEventListener("input", draw);
    button(c, "Load a weak prompt", () => { ta.value = weak; draw(); }, "ghost");
    button(c, "Load a strong prompt", () => { ta.value = isEs() ? strongEs : strong; draw(); }, "ghost");
    draw();
  };
})();

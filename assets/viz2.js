/* Interactive visualizations (part 2): RLHF, reasoning, apps, agents, ops. */
(function () {
  const VIZ = window.VIZ;
  const { el, slider, button, canvas, bars, lin, axes, out, controls, fmtNum, css, stepper, isEs } = window.VU;

  VIZ.prefs = (root) => {
    const prompt = "User: My EF Core query is slow. What should I check first?";
    const ans = { A: "Check the generated SQL (ToQueryString or logging), look for N+1 queries and missing indexes, then use AsNoTracking for read-only queries.", B: "Performance can depend on many factors, such as hardware, network, database configuration, the ORM, query complexity, and much more. It is a complex topic…", C: "Just rewrite everything in raw SQL, EF is always slow.", D: "Use the EF Core [FastQuery] attribute — it makes any query 10x faster." };
    const score = { A: 0, B: 0, C: 0, D: 0 }; const pairs = [["A", "B"], ["C", "D"], ["A", "C"], ["B", "D"], ["A", "D"], ["B", "C"]]; let idx = 0;
    root.append(el("p", {}, el("b", {}, prompt)));
    const card = el("div", { class: "pair" }); root.append(card); const rk = el("div"); root.append(rk); const o = out(root);
    const sig = (x) => 1 / (1 + Math.exp(-x));
    const draw = () => {
      const [x, y] = pairs[idx % pairs.length]; card.innerHTML = "";
      for (const id of [x, y]) card.append(el("button", { class: "choice", type: "button", onclick: () => { const lose = id === x ? y : x; const p = sig(score[id] - score[lose]); score[id] += 0.8 * (1 - p); score[lose] -= 0.8 * (1 - p); idx++; draw(); } }, el("b", {}, "Answer " + id + ": "), ans[id]));
      bars(rk, Object.keys(score).sort((a, b) => score[b] - score[a]).map((k2) => ({ label: "Answer " + k2 + " reward", value: score[k2] + 3 })), { max: 6, fmt: (v) => (v - 3).toFixed(2) });
      o.innerHTML = `You are the human labeler: click the better answer (${idx} comparisons so far). The reward model updates with Bradley–Terry: P(A beats B) = sigmoid(score A − score B) = <b>${(sig(score.A - score.B) * 100).toFixed(0)}%</b>. Note: D sounds confident but the attribute is invented — catching that is why careful labeling matters.`;
    };
    draw();
  };

  VIZ.thinking = (root) => {
    const c = controls(root); const k = canvas(root, 560, 240); const o = out(root);
    const acc = (t, hard) => hard ? 0.25 + 0.6 * (1 - Math.exp(-t / 6000)) : 0.9 + 0.05 * (1 - Math.exp(-t / 500));
    const X = lin(0, 32000, 40, 550), Y = lin(0, 1, 210, 10);
    const draw = () => {
      const { ctx } = k; k.clear(); axes(ctx, k.W, k.H, 30, { x: "thinking tokens", y: "accuracy (illustrative)" });
      [[true, "--accent", "hard multi-step task"], [false, "--g1", "easy task"]].forEach(([h, col, name]) => { ctx.strokeStyle = css(col); ctx.lineWidth = 2.5; ctx.beginPath(); for (let t = 0; t <= 32000; t += 200) { t === 0 ? ctx.moveTo(X(t), Y(acc(t, h))) : ctx.lineTo(X(t), Y(acc(t, h))); } ctx.stroke(); ctx.fillStyle = css(col); ctx.font = "12px system-ui"; ctx.fillText(name, 410, Y(acc(30000, h)) + (h ? 16 : -6)); });
      ctx.lineWidth = 1; ctx.strokeStyle = css("--bad"); ctx.beginPath(); ctx.moveTo(X(T.get()), 10); ctx.lineTo(X(T.get()), 210); ctx.stroke();
      const outTok = T.get() + A.get(), cost = outTok * P.get() / 1e6, secs = 0.8 + outTok / S.get();
      o.innerHTML = `Output tokens per answer = thinking ${T.get()} + answer ${A.get()} = <b>${outTok}</b> → cost <b>$${cost.toFixed(4)}</b> per call, latency ≈ <b>${secs.toFixed(1)} s</b>. × 10,000 calls/day = $${(cost * 1e4).toFixed(0)}/day. Accuracy (illustrative curve): hard ${(acc(T.get(), true) * 100).toFixed(0)}%, easy ${(acc(T.get(), false) * 100).toFixed(0)}%.`;
    };
    const T = slider(c, { label: "thinking budget", min: 0, max: 32000, step: 500, value: 4000 }, draw), A = slider(c, { label: "answer tokens", min: 50, max: 2000, step: 50, value: 300 }, draw);
    const P = slider(c, { label: "$ / 1M output (example)", min: 1, max: 75, step: 1, value: 15 }, draw), S = slider(c, { label: "tokens / second", min: 20, max: 300, step: 10, value: 80 }, draw);
    draw();
  };

  VIZ.context = (root) => {
    const c = controls(root); const bar = el("div", { class: "stack" }); root.append(bar); const o = out(root);
    const parts = [["system prompt", "--g2"], ["tool definitions", "--g3"], ["chat history", "--g1"], ["retrieved docs / tool results", "--g4"], ["reserved for output", "--accent2"]];
    const draw = () => {
      const vals = [sys.get(), tools.get(), turns.get() * per.get(), docs.get(), outp.get()], lim = +limSel.value, total = vals.reduce((a, b) => a + b, 0);
      bar.innerHTML = ""; const scale = Math.max(total, lim);
      vals.forEach((v, i) => bar.append(el("span", { class: "seg", title: parts[i][0] + ": " + v, style: `width:${100 * v / scale}%;background:var(${parts[i][1]})` })));
      bar.append(el("span", { class: "limit", style: `left:${100 * lim / scale}%` }));
      o.innerHTML = parts.map((p, i) => `<span class="dot" style="background:var(${p[1]})"></span>${p[0]}: ${fmtNum(vals[i])}`).join(" &nbsp; ") + `<br>Total <b>${fmtNum(total)}</b> / limit ${fmtNum(lim)} tokens (black line) → ` + (total > lim ? `<span class="bad"><b>Overflow!</b> The API will reject it — trim history, compact, or retrieve less.</span>` : `<span class="good">fits (${(100 * total / lim).toFixed(0)}% used)</span>`) + ` <span class="muted">You pay for the whole input on every call.</span>`;
    };
    const limSel = el("select", { "aria-label": "context limit" }, ...[8000, 32000, 128000, 200000, 1000000].map((v) => el("option", { value: v }, fmtNum(v) + " tokens"))); limSel.value = "128000"; limSel.addEventListener("change", draw);
    c.append(el("label", { class: "slider" }, el("span", { class: "slabel" }, "context window"), limSel));
    const sys = slider(c, { label: "system prompt", min: 0, max: 20000, step: 500, value: 3000, fmt: fmtNum }, draw), tools = slider(c, { label: "tool definitions", min: 0, max: 30000, step: 500, value: 6000, fmt: fmtNum }, draw);
    const turns = slider(c, { label: "conversation turns", min: 0, max: 200, value: 30 }, draw), per = slider(c, { label: "tokens per turn", min: 50, max: 5000, step: 50, value: 1500, fmt: fmtNum }, draw);
    const docs = slider(c, { label: "retrieved docs", min: 0, max: 100000, step: 1000, value: 20000, fmt: fmtNum }, draw), outp = slider(c, { label: "max output", min: 256, max: 32000, step: 256, value: 4096, fmt: fmtNum }, draw);
    draw();
  };

  VIZ.promptbuilder = (root) => {
    const partsEn = [
      ["role", "Role", "You are a friendly support assistant for Acme Store.", "Gives the model a perspective and vocabulary."],
      ["ctx", "Context", "<context>\nCustomers are small shop owners. Many are not technical.\n</context>", "Who the audience is and why the task exists."],
      ["task", "Clear task", "<task>\nSummarize the ticket below in 2 sentences and propose the next action.\n</task>", "Exactly what to do."],
      ["data", "Data in tags", "<ticket>\n{{ticket_text}}\n</ticket>", "Separates untrusted data from instructions."],
      ["ex", "Example (few-shot)", "<example>\n<ticket>Can't print invoices since update</ticket>\n<summary>Printing broke after v2.3. Next: check printer driver setting.</summary>\n</example>", "Shows the style and length you want."],
      ["fmt", "Output format", "<format>\nReturn JSON: {\"summary\": string, \"next_action\": string, \"priority\": \"low\"|\"medium\"|\"high\"}\n</format>", "Makes the output parseable by your code."],
      ["exit", "Way out", "If the ticket is unclear, set next_action to \"ask customer for details\". Never invent features.", "Reduces made-up answers."]
    ];
    const partsEs = [
      ["role", "Rol", "Sos un asistente de soporte amable de Acme Store.", "Le da al modelo una perspectiva y un vocabulario."],
      ["ctx", "Contexto", "<context>\nLos clientes son dueños de comercios chicos. Muchos no son técnicos.\n</context>", "Quién es el público y por qué existe la tarea."],
      ["task", "Tarea clara", "<task>\nResumí el ticket de abajo en 2 oraciones y proponé la próxima acción.\n</task>", "Exactamente qué hacer."],
      ["data", "Datos en etiquetas", "<ticket>\n{{ticket_text}}\n</ticket>", "Separa los datos no confiables de las instrucciones."],
      ["ex", "Ejemplo (few-shot)", "<example>\n<ticket>No puedo imprimir facturas desde la actualización</ticket>\n<summary>La impresión se rompió después de la v2.3. Próximo paso: revisar la configuración del driver de la impresora.</summary>\n</example>", "Muestra el estilo y el largo que querés."],
      ["fmt", "Formato de salida", "<format>\nDevolvé JSON: {\"summary\": string, \"next_action\": string, \"priority\": \"low\"|\"medium\"|\"high\"}\n</format>", "Hace que tu código pueda parsear la salida."],
      ["exit", "Salida de escape", "Si el ticket no es claro, poné en next_action \"pedirle detalles al cliente\". Nunca inventes funcionalidades.", "Reduce las respuestas inventadas."]
    ];
    const parts = isEs() ? partsEs : partsEn;
    const on = new Set(["task"]); const c = controls(root); const pre = el("pre", { class: "code small" }); root.append(pre); const o = out(root);
    const draw = () => { pre.textContent = parts.filter((p) => on.has(p[0])).map((p) => p[2]).join("\n\n") || (isEs() ? "(prompt vacío)" : "(empty prompt)"); const n = on.size; o.innerHTML = `Prompt checklist: <b>${n}/${parts.length}</b> — ` + parts.map((p) => `<span class="${on.has(p[0]) ? "good" : "muted"}" title="${p[3]}">${on.has(p[0]) ? "✔" : "○"} ${p[1]}</span>`).join(" · ") + (n < 4 ? `<br><span class="muted">A bare task gives generic answers. Turn on more parts and watch the spec become clear.</span>` : ""); };
    for (const p of parts) { const cb = el("input", { type: "checkbox" }); cb.checked = on.has(p[0]); cb.addEventListener("change", () => { cb.checked ? on.add(p[0]) : on.delete(p[0]); draw(); }); c.append(el("label", { class: "check", title: p[3] }, cb, " " + p[1])); }
    draw();
  };

  VIZ.knn = (root) => {
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const topics = [["billing", -0.55, 0.45, "--g1"], ["bugs", 0.5, 0.5, "--g2"], ["shipping", -0.45, -0.5, "--g3"], ["accounts", 0.5, -0.45, "--g4"]];
    const pts = topics.flatMap(([t, x, y, col]) => Array.from({ length: 11 }, (_, i) => ({ t, col, x: x + (rnd() - 0.5) * 0.55, y: y + (rnd() - 0.5) * 0.55, id: t + "-" + (i + 1) })));
    const c = controls(root); const k = canvas(root, 560, 340); const o = out(root);
    const X = lin(-1, 1, 10, 550), Y = lin(-1, 1, 330, 10), IX = lin(10, 550, -1, 1), IY = lin(330, 10, -1, 1);
    let q = { x: 0.05, y: 0.25 };
    const draw = () => {
      const { ctx } = k; k.clear(); const nn = pts.map((p) => ({ p, d: Math.hypot(p.x - q.x, p.y - q.y) })).sort((a, b) => a.d - b.d).slice(0, K.get());
      ctx.strokeStyle = css("--accent2"); for (const { p } of nn) { ctx.beginPath(); ctx.moveTo(X(q.x), Y(q.y)); ctx.lineTo(X(p.x), Y(p.y)); ctx.stroke(); }
      for (const p of pts) { ctx.fillStyle = css(p.col); ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), nn.some((n) => n.p === p) ? 7 : 4.5, 0, 7); ctx.fill(); }
      ctx.font = "bold 12px system-ui"; topics.forEach(([t, x, y, col]) => { ctx.fillStyle = css(col); ctx.fillText(t, X(x) - 20, Y(y + 0.36)); });
      ctx.fillStyle = css("--bad"); ctx.beginPath(); ctx.moveTo(X(q.x), Y(q.y) - 9); ctx.lineTo(X(q.x) + 8, Y(q.y) + 6); ctx.lineTo(X(q.x) - 8, Y(q.y) + 6); ctx.fill();
      const votes = {}; nn.forEach(({ p }) => (votes[p.t] = (votes[p.t] || 0) + 1));
      o.innerHTML = `Query ▲ at (${q.x.toFixed(2)}, ${q.y.toFixed(2)}). Top-${K.get()}: ${nn.map(({ p, d }) => `${p.id} <span class="muted">${d.toFixed(2)}</span>`).join(", ")}<br>Brute force compared the query with all <b>${pts.length}</b> vectors. With 10 million vectors, an ANN index (HNSW) would visit only a few thousand. Topics found: ${Object.entries(votes).map(([t, n]) => t + "×" + n).join(", ")}`;
    };
    k.cv.addEventListener("click", (ev) => { const p = k.toLocal(ev); q = { x: IX(p.x), y: IY(p.y) }; draw(); });
    const K = slider(c, { label: "k (results)", min: 1, max: 15, value: 5 }, draw);
    c.append(el("span", { class: "muted" }, "Click the plot to move the query."));
    draw();
  };

  VIZ.rag = (root) => {
    const docsEn = [
      ["returns.md", "Customers can return products within 30 days with the receipt. Refunds go to the original payment method."],
      ["shipping.md", "Orders ship in 2 business days. Shipping to Patagonia takes up to 7 days."],
      ["invoices.md", "To export invoices go to Billing then Invoices then Export CSV. Tax invoices are generated automatically."],
      ["passwords.md", "To reset your password open Settings then Security then Reset password. A reset link is emailed and expires in 1 hour."],
      ["pos.md", "The point of sale works offline and syncs sales when the internet connection returns."],
      ["plans.md", "The Pro plan includes multiple stores and stock transfers between branches."]
    ];
    const docsEs = [
      ["devoluciones.md", "Los clientes pueden devolver productos dentro de los 30 días con el ticket. Los reembolsos vuelven al medio de pago original."],
      ["envios.md", "Los pedidos se despachan en 2 días hábiles. Los envíos a la Patagonia tardan hasta 7 días."],
      ["facturas.md", "Para exportar facturas andá a Facturación, después Facturas y después Exportar CSV. Las facturas fiscales se generan automáticamente."],
      ["contrasenas.md", "Para resetear tu contraseña abrí Ajustes, después Seguridad y después Resetear contraseña. Te llega un link por mail que vence en 1 hora."],
      ["pos.md", "El punto de venta funciona sin conexión y sincroniza las ventas cuando vuelve internet."],
      ["planes.md", "El plan Pro incluye varias tiendas y transferencias de stock entre sucursales."]
    ];
    const docs = isEs() ? docsEs : docsEn;
    const stop = new Set((isEs() ? "el la los las un una unos unas a al de del y o en es son con tu tus te mi mis que como cómo qué cuándo cuando se lo por para sin hay puedo después andá abrí" : "the a an to and or of in is are with your you can how do i my what when then go for on it be does long take").split(" "));
    const bag = (s) => { const m = {}; for (const w of s.toLowerCase().match(/[a-záéíóúñ]+/g) || []) if (!stop.has(w)) { const st = isEs() ? w.replace(/(es|s)$/, "") : w.replace(/(ing|ed|es|s)$/, ""); m[st] = (m[st] || 0) + 1; } return m; };
    const cos = (a, b) => { let d = 0, na = 0, nb = 0; for (const k2 in a) { na += a[k2] ** 2; if (b[k2]) d += a[k2] * b[k2]; } for (const k2 in b) nb += b[k2] ** 2; return na && nb ? d / Math.sqrt(na * nb) : 0; };
    root.append(el("p", { class: "muted" }, "Toy RAG over 6 help-center chunks. The 'embedding' here is a simple bag-of-words vector so you can see the mechanics; real systems use an embedding model (which would also match 'forgot' with 'reset')."));
    const c = controls(root);
    const qIn = el("input", { type: "text", class: "viz-input", value: isEs() ? "¿Cómo exporto mis facturas?" : "How do I export my invoices?", "aria-label": "question" }); c.append(qIn);
    (isEs() ? ["¿Envíos a la Patagonia?", "Resetear mi contraseña", "¿Funciona sin conexión?"] : ["Shipping to Patagonia?", "Reset my password", "Does it work offline?"]).forEach((s) => button(c, s, () => { qIn.value = s; draw(); }, "ghost small"));
    const K = slider(c, { label: "top-k chunks", min: 1, max: 6, value: 2 }, () => draw());
    root.append(el("h4", {}, "1–3. Embed the question → score every chunk → keep the top-k"));
    const res = el("div"); root.append(res);
    root.append(el("h4", {}, "4. The augmented prompt your code sends to the LLM"));
    const pre = el("pre", { class: "code small" }); root.append(pre);
    function draw() {
      const qv = bag(qIn.value); const scored = docs.map(([n, t]) => ({ n, t, s: cos(qv, bag(t)) })).sort((a, b) => b.s - a.s); const top = scored.slice(0, K.get());
      bars(res, scored.map((d) => ({ label: d.n, value: d.s, cls: top.includes(d) ? "hl" : "dim" })), { max: 1, fmt: (v) => v.toFixed(2) });
      pre.textContent = (isEs() ? `Respondé usando SOLO los documentos. Citá así: [1]. Si la respuesta no está ahí, decí "No sé".` : `Answer using ONLY the documents. Cite like [1]. If the answer is not there, say "I don't know".`) + `\n<documents>\n${top.map((d, i) => `[${i + 1}] (${d.n}) ${d.t}`).join("\n")}\n</documents>\n<question>${qIn.value}</question>`;
    }
    qIn.addEventListener("input", draw);
    draw();
  };

  VIZ.toolloop = (root) => {
    const S = [
      ["App → API", "You send the user message plus tool definitions.", { model: "<model-id>", max_tokens: 512, tools: [{ name: "get_order", description: "Get an order by numeric id. Use when the user mentions an order number.", input_schema: { type: "object", properties: { id: { type: "integer" } }, required: ["id"] } }], messages: [{ role: "user", content: "Where is my order 4521?" }] }],
      ["API → App", "The model does NOT run anything. It asks you to call a tool and stops (stop_reason = tool_use).", { role: "assistant", stop_reason: "tool_use", content: [{ type: "text", text: "Let me look that up." }, { type: "tool_use", id: "toolu_01", name: "get_order", input: { id: 4521 } }] }],
      ["Your code", "Your code validates the input and runs the real function (DB query, REST call…).", "var result = await orders.GetAsync(4521);\n// → { status: \"shipped\", carrier: \"FastShip\", eta: \"2026-10-23\" }"],
      ["App → API", "You resend the whole conversation plus a tool_result linked by tool_use_id.", { messages: [{ role: "user", content: "Where is my order 4521?" }, { role: "assistant", content: [{ type: "tool_use", id: "toolu_01", name: "get_order", input: { id: 4521 } }] }, { role: "user", content: [{ type: "tool_result", tool_use_id: "toolu_01", content: "{\"status\":\"shipped\",\"carrier\":\"FastShip\",\"eta\":\"2026-10-23\"}" }] }] }],
      ["API → App", "The model uses the result to write the final answer (stop_reason = end_turn). In an agent, it could call another tool instead.", { role: "assistant", stop_reason: "end_turn", content: [{ type: "text", text: "Your order 4521 has shipped with FastShip and should arrive on October 23." }] }]
    ];
    stepper(root, S, (v, s) => { v.append(el("div", { class: "step-head" }, el("span", { class: "pill" + (s[0] === "Your code" ? " alt" : "") }, s[0]), " " + s[1])); v.append(el("pre", { class: "code small" }, typeof s[2] === "string" ? s[2] : JSON.stringify(s[2], null, 2))); });
  };

  VIZ.agentsim = (root) => {
    const steps = [
      ["think", "Goal: make the failing test pass. First, see which test fails."], ["tool", "run_tests()", "1 failed: Cart_Total_IncludesLastItem (expected 300, got 200)", 900],
      ["think", "Total is missing the last item. Look at Cart.Total."], ["tool", "read_file(\"src/Cart.cs\")", "for (var i = 0; i < Items.Count - 1; i++) total += Items[i].Price;", 1400],
      ["think", "Off-by-one: the loop skips the last item. Fix the loop bound."], ["tool", "edit_file(\"src/Cart.cs\", \"Items.Count - 1\" → \"Items.Count\")", "ok: 1 line changed", 300],
      ["tool", "run_tests()", "all 48 passed", 600], ["done", "Fixed off-by-one in Cart.Total; all 48 tests pass. Diff: 1 line."]
    ];
    const c = controls(root); const log = el("div", { class: "agentlog" }); root.append(log); const o = out(root);
    let i = 0, ctx = 2500, timer = null;
    const render = () => { o.innerHTML = `Context size: <b>${fmtNum(ctx)}</b> tokens (re-sent on every LLM call) · tool calls used: ${steps.slice(0, i).filter((s) => s[0] === "tool").length}/${maxS.get()}`; };
    const stop = () => { clearInterval(timer); timer = null; };
    const next = () => {
      if (i >= steps.length) return stop();
      const used = steps.slice(0, i).filter((s) => s[0] === "tool").length; const s = steps[i];
      if (s[0] === "tool" && used >= maxS.get()) { log.append(el("div", { class: "ag stop" }, "⛔ Stopped by the harness: max tool calls reached. Report partial progress to the human.")); i = steps.length; render(); return stop(); }
      if (s[0] === "think") log.append(el("div", { class: "ag think" }, "🧠 LLM: " + s[1]));
      if (s[0] === "tool") { log.append(el("div", { class: "ag tool" }, "🔧 tool call: " + s[1])); log.append(el("div", { class: "ag obs" }, "👀 observation: " + s[2])); ctx += s[3]; }
      if (s[0] === "done") log.append(el("div", { class: "ag done" }, "✅ final answer: " + s[1]));
      ctx += 150; i++; render(); log.scrollTop = log.scrollHeight;
    };
    const reset = () => { stop(); i = 0; ctx = 2500; log.innerHTML = ""; log.append(el("div", { class: "ag sys" }, "📋 system prompt + tools (run_tests, read_file, edit_file) + goal")); render(); };
    const maxS = slider(c, { label: "max tool calls", min: 1, max: 6, value: 6 }, () => reset());
    button(c, "Next step", next); button(c, "Auto-run", () => { if (!timer) timer = setInterval(next, 700); }); button(c, "Reset", reset, "ghost");
    reset();
  };

  VIZ.parallel = (root) => {
    const c = controls(root); const k = canvas(root, 560, 230); const o = out(root);
    const draw = () => {
      const n = N.get(), p = P.get(), m = M.get(), tk = T.get(); const waves = Math.ceil(n / p), wall = 2 + waves * m + 2, seq = 2 + n * m + 2;
      const { ctx, W } = k; k.clear(); const sx = (W - 120) / Math.max(seq, 1); ctx.font = "11px system-ui";
      ctx.fillStyle = css("--g2"); ctx.fillRect(100, 10, 2 * sx, 14); ctx.fillStyle = css("--text"); ctx.fillText("orchestrator", 8, 21);
      const rows = Math.min(p, 8);
      for (let s = 0; s < n; s++) { const lane = s % p, wave = Math.floor(s / p); if (lane >= rows) continue; ctx.fillStyle = css(["--g1", "--g3", "--g4", "--accent"][s % 4]); ctx.fillRect(100 + (2 + wave * m) * sx, 30 + lane * 18, Math.max(2, m * sx - 2), 14); }
      for (let l = 0; l < rows; l++) { ctx.fillStyle = css("--text"); ctx.fillText("subagent " + (l + 1), 8, 41 + l * 18); }
      ctx.fillStyle = css("--g2"); ctx.fillRect(100 + (2 + waves * m) * sx, 30 + rows * 18, 2 * sx, 14); ctx.fillStyle = css("--text"); ctx.fillText("synthesize", 8, 41 + rows * 18);
      ctx.strokeStyle = css("--bad"); ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(100 + seq * sx - 1, 5); ctx.lineTo(100 + seq * sx - 1, 225); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = css("--bad"); ctx.fillText("sequential would end here", 100 + seq * sx - 150, 222);
      const tokens = n * tk + 20000 + n * 3000;
      o.innerHTML = `Wall time: <b>${wall} min</b> in parallel vs ${seq} min sequential (${(seq / wall).toFixed(1)}× faster). Tokens: <b>${fmtNum(tokens)}</b> (each subagent has its own context, plus orchestrator overhead) — parallelism buys time, not savings.`;
    };
    const N = slider(c, { label: "subtasks", min: 1, max: 20, value: 8 }, draw), P = slider(c, { label: "parallel subagents", min: 1, max: 8, value: 4 }, draw);
    const M = slider(c, { label: "minutes per subtask", min: 1, max: 15, value: 5 }, draw), T = slider(c, { label: "tokens per subtask", min: 5000, max: 300000, step: 5000, value: 60000, fmt: fmtNum }, draw);
    draw();
  };

  VIZ.mcpflow = (root) => {
    const S = [
      ["client → server", "Handshake: the host's MCP client starts your server (stdio) and negotiates the protocol version and capabilities.", { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "<version>", capabilities: {}, clientInfo: { name: "my-host", version: "1.0" } } }],
      ["server → client", "Your server answers with its capabilities (here: tools).", { jsonrpc: "2.0", id: 1, result: { protocolVersion: "<version>", capabilities: { tools: {} }, serverInfo: { name: "TodoMcp", version: "1.0.0" } } }],
      ["client → server", "Discovery: which tools do you have?", { jsonrpc: "2.0", id: 2, method: "tools/list" }],
      ["server → client", "Tool list with JSON Schemas. The host turns these into normal LLM tool definitions.", { jsonrpc: "2.0", id: 2, result: { tools: [{ name: "count_todos", description: "Counts TODO comments in all .cs files under a folder.", inputSchema: { type: "object", properties: { path: { type: "string", description: "Absolute folder path" } }, required: ["path"] } }] } }],
      ["client → server", "The LLM decided to use the tool; the host forwards the call.", { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "count_todos", arguments: { path: "/repo/src" } } }],
      ["server → client", "The result content goes back to the LLM as a tool result.", { jsonrpc: "2.0", id: 3, result: { content: [{ type: "text", text: "/repo/src/Cart.cs: 2\n/repo/src/Orders/OrderService.cs: 1" }], isError: false } }]
    ];
    stepper(root, S, (v, s) => { v.append(el("div", { class: "step-head" }, el("span", { class: "pill " + (s[0].startsWith("client") ? "" : "alt") }, s[0]), " " + s[1])); v.append(el("pre", { class: "code small" }, JSON.stringify(s[2], null, 2))); });
  };

  VIZ.evalstats = (root) => {
    const c = controls(root); const k = canvas(root, 560, 165); const o = out(root);
    const draw = () => {
      const n = N.get(), a = Math.round(PA.get() * n / 100), b = Math.round(PB.get() * n / 100);
      const pa = a / n, pb = b / n, ma = 1.96 * Math.sqrt(pa * (1 - pa) / n), mb = 1.96 * Math.sqrt(pb * (1 - pb) / n);
      const pp = (a + b) / (2 * n), se = Math.sqrt(pp * (1 - pp) * 2 / n), z = se ? (pa - pb) / se : 0;
      const { ctx } = k; k.clear(); const X = lin(0, 1, 90, 540); ctx.font = "12px system-ui";
      [[pa, ma, "Prompt A", 40, "--accent"], [pb, mb, "Prompt B", 100, "--accent2"]].forEach(([p, m, name, y, col]) => { ctx.fillStyle = css("--text"); ctx.fillText(name, 10, y + 5); ctx.fillStyle = css(col); ctx.globalAlpha = 0.25; ctx.fillRect(X(Math.max(0, p - m)), y - 12, X(Math.min(1, p + m)) - X(Math.max(0, p - m)), 24); ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(X(p), y, 7, 0, 7); ctx.fill(); });
      for (let t = 0; t <= 10; t++) { ctx.fillStyle = css("--muted"); ctx.fillText(t * 10 + "%", X(t / 10) - 10, 150); }
      o.innerHTML = `A: ${a}/${n} = <b>${(pa * 100).toFixed(0)}% ± ${(ma * 100).toFixed(0)}</b> &nbsp; B: ${b}/${n} = <b>${(pb * 100).toFixed(0)}% ± ${(mb * 100).toFixed(0)}</b> (95% margin, shaded) → ` + (Math.abs(z) > 1.96 ? `<span class="good">difference is statistically significant (z = ${z.toFixed(2)})</span>` : `<span class="bad">difference could be noise (z = ${z.toFixed(2)}); add more cases or runs</span>`);
    };
    const N = slider(c, { label: "eval cases (n)", min: 10, max: 1000, step: 10, value: 20 }, draw), PA = slider(c, { label: "A pass rate %", min: 0, max: 100, value: 90 }, draw), PB = slider(c, { label: "B pass rate %", min: 0, max: 100, value: 85 }, draw);
    draw();
  };

  VIZ.costcalc = (root) => {
    root.append(el("p", { class: "warn" }, "Default prices are EXAMPLES. Put in the current prices from the provider's pricing page."));
    const c = controls(root); const o = out(root);
    const draw = () => {
      const inTok = I.get(), outTok = O.get(), cached = inTok * H.get() / 100, steps = S.get();
      const perCall = ((inTok - cached) * PI.get() + cached * PC.get() + outTok * PO.get()) / 1e6;
      const perTask = perCall * steps, month = perTask * D.get() * 30, lat = steps * (0.6 + outTok / TPS.get());
      const noCache = ((inTok * PI.get() + outTok * PO.get()) / 1e6) * steps * D.get() * 30;
      o.innerHTML = `Per LLM call: <b>$${perCall.toFixed(4)}</b> · per task (${steps} calls): <b>$${perTask.toFixed(3)}</b> · per month: <b>$${month.toFixed(0)}</b> <span class="muted">(without caching: $${noCache.toFixed(0)})</span><br>Estimated latency per task ≈ <b>${lat.toFixed(1)} s</b> (time-to-first-token 0.6 s + output ÷ speed, per call).`;
    };
    const PI = slider(c, { label: "$ / 1M input", min: 0.1, max: 20, step: 0.1, value: 3 }, draw), PO = slider(c, { label: "$ / 1M output", min: 0.4, max: 80, step: 0.1, value: 15 }, draw), PC = slider(c, { label: "$ / 1M cached input", min: 0.01, max: 5, step: 0.01, value: 0.3 }, draw);
    const I = slider(c, { label: "input tokens / call", min: 500, max: 150000, step: 500, value: 20000, fmt: fmtNum }, draw), O = slider(c, { label: "output tokens / call", min: 50, max: 8000, step: 50, value: 800, fmt: fmtNum }, draw);
    const H = slider(c, { label: "cache hit % of input", min: 0, max: 95, value: 70, fmt: (v) => v + "%" }, draw), S = slider(c, { label: "LLM calls per task", min: 1, max: 60, value: 12 }, draw);
    const D = slider(c, { label: "tasks per day", min: 1, max: 5000, value: 100 }, draw), TPS = slider(c, { label: "output tokens / s", min: 20, max: 300, step: 10, value: 80 }, draw);
    draw();
  };
})();

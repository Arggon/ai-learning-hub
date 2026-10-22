/* Interactive visualizations (part 1): helpers + foundations + ML + LLM internals. No external deps. */
(function () {
  const VIZ = (window.VIZ = {});
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888";
  function el(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v; else if (k === "html") e.innerHTML = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
    }
    for (const k of kids.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k));
    return e;
  }
  function slider(parent, o, onChange) {
    const val = el("span", { class: "sval" });
    const inp = el("input", { type: "range", min: o.min, max: o.max, step: o.step ?? 1, value: o.value, "aria-label": o.label });
    const fmt = o.fmt || ((v) => v);
    const upd = () => { val.textContent = fmt(+inp.value); onChange && onChange(+inp.value); };
    inp.addEventListener("input", upd);
    parent.append(el("label", { class: "slider" }, el("span", { class: "slabel" }, o.label), inp, val));
    val.textContent = fmt(+inp.value);
    return { get: () => +inp.value, set: (v) => { inp.value = v; upd(); }, input: inp };
  }
  function button(parent, label, fn, cls = "") { const b = el("button", { class: "btn " + cls, type: "button", onclick: fn }, label); parent.append(b); return b; }
  function canvas(parent, W = 560, H = 300) {
    const cv = el("canvas", { class: "viz-canvas", width: W * 2, height: H * 2 });
    cv.style.aspectRatio = W + " / " + H;
    parent.append(cv);
    const ctx = cv.getContext("2d"); ctx.scale(2, 2);
    const ft = ctx.fillText.bind(ctx); ctx.fillText = (txt, ...rest) => ft(window.VIZ_I18N ? window.VIZ_I18N.tr(txt) : txt, ...rest);
    const toLocal = (ev) => { const r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height }; };
    return { cv, ctx, W, H, toLocal, clear() { ctx.clearRect(0, 0, W, H); } };
  }
  const lin = (d0, d1, r0, r1) => (v) => r0 + (v - d0) * (r1 - r0) / (d1 - d0);
  function axes(ctx, W, H, pad, label) {
    ctx.strokeStyle = css("--grid"); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, pad / 2); ctx.lineTo(pad, H - pad); ctx.lineTo(W - pad / 2, H - pad); ctx.stroke();
    if (label) { ctx.fillStyle = css("--muted"); ctx.font = "11px system-ui"; ctx.fillText(label.x || "", W - pad - 90, H - pad + 16); ctx.save(); ctx.translate(12, pad + 60); ctx.rotate(-Math.PI / 2); ctx.fillText(label.y || "", 0, 0); ctx.restore(); }
  }
  const out = (parent, cls = "viz-out") => { const o = el("div", { class: cls }); parent.append(o); return o; };
  const controls = (parent) => { const c = el("div", { class: "controls" }); parent.append(c); return c; };
  const fmt2 = (v) => (+v).toFixed(2);
  const softmax = (arr, T = 1) => { const m = Math.max(...arr); const e = arr.map((x) => Math.exp((x - m) / T)); const s = e.reduce((a, b) => a + b, 0); return e.map((x) => x / s); };
  const fmtNum = (n) => n >= 1e12 ? (n / 1e12).toFixed(2) + "T" : n >= 1e9 ? (n / 1e9).toFixed(2) + "B" : n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(Math.round(n));
  function bars(parent, items, opts = {}) {
    parent.innerHTML = "";
    const max = opts.max ?? Math.max(...items.map((i) => i.value), 1e-9);
    for (const it of items) {
      parent.append(el("div", { class: "bar-row " + (it.cls || "") }, el("span", { class: "bar-label" }, it.label),
        el("span", { class: "bar-track" }, el("span", { class: "bar-fill", style: "width:" + Math.max(0, Math.min(100, 100 * it.value / max)) + "%" })),
        el("span", { class: "bar-val" }, opts.fmt ? opts.fmt(it.value) : fmt2(it.value))));
    }
  }
  function stepper(root, steps, render) {
    const c = controls(root); const view = el("div", { class: "stepview" }); root.append(view); let i = 0;
    const show = () => { view.innerHTML = ""; render(view, steps[i], i); lbl.textContent = `step ${i + 1} / ${steps.length}`; prev.disabled = i === 0; next.disabled = i === steps.length - 1; };
    const prev = button(c, "◀ Back", () => { i--; show(); }, "ghost"); const next = button(c, "Next ▶", () => { i++; show(); }); const lbl = el("span", { class: "muted" }); c.append(lbl);
    button(c, "Restart", () => { i = 0; show(); }, "ghost"); show();
  }
  const isEs = () => document.documentElement.lang === "es";
  window.VU = { isEs, el, slider, button, canvas, bars, lin, axes, out, controls, fmt2, softmax, fmtNum, css, stepper };

  VIZ.line = (root) => {
    const c = controls(root); const k = canvas(root, 520, 260);
    const draw = () => {
      const { ctx, W, H } = k; k.clear(); const X = lin(-5, 5, 30, W - 10), Y = lin(-10, 10, H - 20, 10);
      ctx.strokeStyle = css("--grid"); ctx.beginPath(); ctx.moveTo(X(-5), Y(0)); ctx.lineTo(X(5), Y(0)); ctx.moveTo(X(0), Y(-10)); ctx.lineTo(X(0), Y(10)); ctx.stroke();
      ctx.strokeStyle = css("--accent"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(-5), Y(w.get() * -5 + b.get())); ctx.lineTo(X(5), Y(w.get() * 5 + b.get())); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = css("--text"); ctx.font = "14px system-ui"; ctx.fillText("y = " + w.get() + "·x + " + b.get(), 40, 24);
    };
    const w = slider(c, { label: "w (slope)", min: -3, max: 3, step: 0.1, value: 1 }, () => draw());
    const b = slider(c, { label: "b (intercept)", min: -5, max: 5, step: 0.5, value: 0 }, () => draw());
    draw();
  };

  VIZ.linefit = (root) => {
    const data = [[30, 62], [38, 75], [45, 88], [52, 95], [60, 112], [68, 120], [75, 138], [85, 150], [95, 170]];
    const c = controls(root); const k = canvas(root, 560, 300); const o = out(root);
    const X = lin(20, 100, 50, 545), Y = lin(0, 200, 270, 15);
    const mse = (w, b) => data.reduce((s, [x, y]) => s + (w * x + b - y) ** 2, 0) / data.length;
    let best = Infinity;
    const draw = () => {
      const { ctx } = k; k.clear(); axes(ctx, k.W, k.H, 30, { x: "size (m²)", y: "price (k USD)" });
      const wv = w.get(), bv = b.get();
      for (const [x, y] of data) {
        ctx.strokeStyle = css("--bad"); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(x), Y(y)); ctx.lineTo(X(x), Y(wv * x + bv)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = css("--text"); ctx.beginPath(); ctx.arc(X(x), Y(y), 4, 0, 7); ctx.fill();
      }
      ctx.strokeStyle = css("--accent"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(20), Y(wv * 20 + bv)); ctx.lineTo(X(100), Y(wv * 100 + bv)); ctx.stroke(); ctx.lineWidth = 1;
      const m = mse(wv, bv); best = Math.min(best, m);
      o.innerHTML = `Prediction: <b>price = ${wv.toFixed(2)} · m² + ${bv.toFixed(1)}</b> &nbsp;|&nbsp; MSE (error): <b>${m.toFixed(1)}</b> &nbsp;|&nbsp; your best: ${best.toFixed(1)} <span class="muted">(red dashed lines = errors)</span>`;
    };
    const w = slider(c, { label: "w", min: 0, max: 3, step: 0.01, value: 0.8 }, draw);
    const b = slider(c, { label: "b", min: -40, max: 80, step: 0.5, value: 40 }, draw);
    button(c, "Auto-fit with gradient descent", () => {
      let wv = w.get(), bv = b.get(), i = 0;
      const tick = () => {
        for (let s = 0; s < 40; s++) { let gw = 0, gb = 0; for (const [x, y] of data) { const e = wv * x + bv - y; gw += 2 * e * x / data.length; gb += 2 * e / data.length; } wv -= 0.0002 * gw; bv -= 0.02 * gb; }
        w.set(+wv.toFixed(2)); b.set(+bv.toFixed(1)); if (++i < 60) requestAnimationFrame(tick);
      }; tick();
    });
    draw();
  };

  VIZ.sampler = (root) => {
    const words = ["mat", "floor", "sofa", "bed", "keyboard"], probs = [0.45, 0.25, 0.15, 0.1, 0.05];
    root.append(el("p", { class: "muted" }, "Next word after \"The cat sat on the …\" — true probabilities (left) vs. what you get by sampling (right)."));
    const c = controls(root); const grid = el("div", { class: "two-col" }); root.append(grid);
    const left = el("div"), right = el("div"); grid.append(left, right);
    const counts = words.map(() => 0); let n = 0; const o = out(root);
    const sample = () => { let r = Math.random(), a = 0; for (let i = 0; i < probs.length; i++) { a += probs[i]; if (r < a) return i; } return probs.length - 1; };
    const draw = (last) => {
      bars(left, words.map((w, i) => ({ label: w, value: probs[i] })), { max: 1, fmt: (v) => (v * 100).toFixed(0) + "%" });
      bars(right, words.map((w, i) => ({ label: w, value: n ? counts[i] / n : 0, cls: i === last ? "hl" : "" })), { max: 1, fmt: (v) => (v * 100).toFixed(1) + "%" });
      o.innerHTML = n ? `Samples: <b>${n}</b>${last != null ? ` — last pick: <b>${words[last]}</b>` : ""}. More samples → closer to the true probabilities.` : "Click a button to sample.";
    };
    const go = (k) => { let last; for (let i = 0; i < k; i++) { last = sample(); counts[last]++; n++; } draw(last); };
    button(c, "Sample 1", () => go(1)); button(c, "Sample 10", () => go(10)); button(c, "Sample 1000", () => go(1000));
    button(c, "Reset", () => { counts.fill(0); n = 0; draw(); }, "ghost");
    draw();
  };

  VIZ.vectors = (root) => {
    const c = controls(root); const k = canvas(root, 420, 320); const o = out(root);
    const draw = () => {
      const { ctx, W, H } = k; k.clear(); const cx = W / 2, cy = H / 2, s = 30;
      ctx.strokeStyle = css("--grid"); for (let i = -7; i <= 7; i++) { ctx.beginPath(); ctx.moveTo(cx + i * s, 0); ctx.lineTo(cx + i * s, H); ctx.moveTo(0, cy + i * s); ctx.lineTo(W, cy + i * s); ctx.stroke(); }
      const A = [la.get() * Math.cos(aa.get() * Math.PI / 180), la.get() * Math.sin(aa.get() * Math.PI / 180)];
      const B = [lb.get() * Math.cos(ab.get() * Math.PI / 180), lb.get() * Math.sin(ab.get() * Math.PI / 180)];
      const arrow = (v, col, name) => { const x = cx + v[0] * s, y = cy - v[1] * s; ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); const a = Math.atan2(y - cy, x - cx); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10 * Math.cos(a - 0.4), y - 10 * Math.sin(a - 0.4)); ctx.lineTo(x - 10 * Math.cos(a + 0.4), y - 10 * Math.sin(a + 0.4)); ctx.fill(); ctx.font = "bold 14px system-ui"; ctx.fillText(name, x + 6, y - 6); ctx.lineWidth = 1; };
      arrow(A, css("--accent"), "a"); arrow(B, css("--accent2"), "b");
      const dot = A[0] * B[0] + A[1] * B[1], cos = dot / (la.get() * lb.get());
      const angle = Math.abs(((aa.get() - ab.get() + 540) % 360) - 180);
      o.innerHTML = `a = [${A.map(fmt2).join(", ")}] &nbsp; b = [${B.map(fmt2).join(", ")}]<br>dot product a·b = <b>${dot.toFixed(2)}</b> &nbsp; angle = ${angle.toFixed(0)}° &nbsp; cosine similarity = <b>${cos.toFixed(3)}</b> ${cos > 0.9 ? "→ very similar direction" : cos < -0.5 ? "→ opposite" : Math.abs(cos) < 0.1 ? "→ perpendicular (unrelated)" : ""}`;
    };
    const aa = slider(c, { label: "angle a", min: 0, max: 360, value: 30, fmt: (v) => v + "°" }, draw);
    const la = slider(c, { label: "length a", min: 0.5, max: 5, step: 0.1, value: 4 }, draw);
    const ab = slider(c, { label: "angle b", min: 0, max: 360, value: 70, fmt: (v) => v + "°" }, draw);
    const lb = slider(c, { label: "length b", min: 0.5, max: 5, step: 0.1, value: 3 }, draw);
    draw();
  };

  VIZ.gd = (root) => {
    const fns = { bowl: { f: (w) => (w - 1) ** 2 + 0.5, name: "bowl: (w−1)² + 0.5" }, wavy: { f: (w) => 0.15 * w * w + Math.sin(2 * w) + 1.5, name: "wavy: 0.15w² + sin(2w) + 1.5 (local minima)" } };
    let fn = "bowl", w, path = [];
    const c = controls(root);
    const sel = el("select", { "aria-label": "loss function" }, ...Object.entries(fns).map(([k, v]) => el("option", { value: k }, v.name)));
    sel.addEventListener("change", () => { fn = sel.value; reset(); }); c.append(el("label", { class: "slider" }, el("span", { class: "slabel" }, "loss"), sel));
    const k = canvas(root, 560, 280); const o = out(root);
    const X = lin(-5, 5, 30, 550), Y = lin(0, 10, 250, 10);
    const slope = (w) => (fns[fn].f(w + 1e-4) - fns[fn].f(w - 1e-4)) / 2e-4;
    const draw = () => {
      const { ctx } = k; k.clear(); axes(ctx, k.W, k.H, 30, { x: "parameter w", y: "loss" });
      ctx.strokeStyle = css("--accent"); ctx.lineWidth = 2; ctx.beginPath(); for (let x = -5; x <= 5; x += 0.02) { const y = Math.min(10, fns[fn].f(x)); x === -5 ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y)); } ctx.stroke(); ctx.lineWidth = 1;
      const vis = path.filter((p) => Math.abs(p) <= 5);
      ctx.strokeStyle = css("--accent2"); ctx.beginPath(); vis.forEach((p, i) => { const y = Math.min(10, fns[fn].f(p)); i ? ctx.lineTo(X(p), Y(y)) : ctx.moveTo(X(p), Y(y)); }); ctx.stroke();
      vis.forEach((p) => { ctx.fillStyle = css("--accent2"); ctx.beginPath(); ctx.arc(X(p), Y(Math.min(10, fns[fn].f(p))), 3, 0, 7); ctx.fill(); });
      if (Math.abs(w) <= 5) { ctx.fillStyle = css("--bad"); ctx.beginPath(); ctx.arc(X(w), Y(Math.min(10, fns[fn].f(w))), 7, 0, 7); ctx.fill(); }
      const s = slope(w);
      o.innerHTML = `step ${path.length - 1}: w = <b>${w.toFixed(3)}</b>, loss = <b>${fns[fn].f(w).toFixed(4)}</b>, slope = ${s.toFixed(3)} → next w = w − ${lr.get()} × ${s.toFixed(3)} = ${(w - lr.get() * s).toFixed(3)}` + (Math.abs(w) > 5 ? ' <span class="bad">— diverged (jumped off the chart)! Lower the learning rate.</span>' : "");
    };
    const step = () => { w = w - lr.get() * slope(w); path.push(w); draw(); };
    const reset = () => { w = start.get(); path = [w]; draw(); };
    const lr = slider(c, { label: "learning rate", min: 0.01, max: 1.2, step: 0.01, value: 0.1 }, () => draw());
    const start = slider(c, { label: "start w", min: -4.5, max: 4.5, step: 0.1, value: -4 }, reset);
    button(c, "Step", step); button(c, "Run 20 steps", () => { let i = 0; const t = setInterval(() => { step(); if (++i >= 20 || Math.abs(w) > 50) clearInterval(t); }, 80); }); button(c, "Reset", reset, "ghost");
    reset();
  };

  VIZ.overfit = (root) => {
    let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const truth = (x) => Math.sin(2.5 * x);
    const noise = () => (rnd() - 0.5) * 0.6;
    const train = Array.from({ length: 12 }, (_, i) => { const x = -1 + 2 * i / 11; return [x, truth(x) + noise()]; });
    const test = Array.from({ length: 12 }, () => { const x = -0.95 + 1.9 * rnd(); return [x, truth(x) + noise()]; });
    function fit(deg) {
      const n = deg + 1, A = Array.from({ length: n }, () => Array(n + 1).fill(0));
      for (const [x, y] of train) { const p = Array.from({ length: n }, (_, i) => x ** i); for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += p[i] * p[j]; A[i][n] += p[i] * y; } }
      for (let i = 0; i < n; i++) A[i][i] += 1e-9;
      for (let i = 0; i < n; i++) { let m = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r; [A[i], A[m]] = [A[m], A[i]]; for (let r = 0; r < n; r++) if (r !== i) { const f = A[r][i] / A[i][i]; for (let cc = i; cc <= n; cc++) A[r][cc] -= f * A[i][cc]; } }
      const coef = A.map((row, i) => row[n] / row[i]); return (x) => coef.reduce((s, cf, i) => s + cf * x ** i, 0);
    }
    const c = controls(root); const k = canvas(root, 560, 280); const o = out(root);
    const X = lin(-1.1, 1.1, 30, 550), Y = lin(-2, 2, 265, 10);
    const draw = () => {
      const d = deg.get(), f = fit(d), { ctx } = k; k.clear(); axes(ctx, k.W, k.H, 30);
      ctx.strokeStyle = css("--accent"); ctx.lineWidth = 2.5; ctx.beginPath(); let first = true; for (let x = -1.05; x <= 1.05; x += 0.005) { const y = Math.max(-2.2, Math.min(2.2, f(x))); first ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y)); first = false; } ctx.stroke(); ctx.lineWidth = 1;
      for (const [x, y] of train) { ctx.fillStyle = css("--text"); ctx.beginPath(); ctx.arc(X(x), Y(y), 4.5, 0, 7); ctx.fill(); }
      for (const [x, y] of test) { ctx.strokeStyle = css("--accent2"); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(x), Y(y), 4.5, 0, 7); ctx.stroke(); ctx.lineWidth = 1; }
      const err = (pts) => pts.reduce((s, [x, y]) => s + (f(x) - y) ** 2, 0) / pts.length;
      const tr = err(train), te = err(test);
      const verdict = d <= 1 ? "underfitting: too simple" : te > 2 * tr && d >= 7 ? "overfitting: memorizes the noise" : "good balance";
      o.innerHTML = `polynomial degree <b>${d}</b> → train error <b>${tr.toFixed(3)}</b>, test error <b>${te.toFixed(3)}</b> — <b>${verdict}</b><br><span class="muted">● dark = training points, ○ orange = test points the model never saw</span>`;
    };
    const deg = slider(c, { label: "model flexibility (degree)", min: 0, max: 11, value: 1 }, draw);
    draw();
  };

  VIZ.neuron = (root) => {
    const c = controls(root); const wrap = el("div", { class: "two-col" }); root.append(wrap);
    const svgBox = el("div"); wrap.append(svgBox); const k = canvas(wrap, 260, 260); const o = out(root);
    const act = { relu: (z) => Math.max(0, z), sigmoid: (z) => 1 / (1 + Math.exp(-z)), none: (z) => z };
    const sel = el("select", { "aria-label": "activation" }, el("option", { value: "sigmoid" }, "sigmoid"), el("option", { value: "relu" }, "ReLU"), el("option", { value: "none" }, "none (linear)"));
    const draw = () => {
      const f = act[sel.value], z = w1.get() * x1.get() + w2.get() * x2.get() + b.get(), y = f(z);
      svgBox.innerHTML = `<svg viewBox="0 0 300 200" class="viz-svg"><g font-size="13" fill="currentColor">
        <line x1="62" y1="60" x2="148" y2="95" stroke-width="${1 + Math.abs(w1.get()) * 1.5}" stroke="${w1.get() >= 0 ? "var(--accent)" : "var(--bad)"}"/>
        <line x1="62" y1="140" x2="148" y2="105" stroke-width="${1 + Math.abs(w2.get()) * 1.5}" stroke="${w2.get() >= 0 ? "var(--accent)" : "var(--bad)"}"/>
        <line x1="203" y1="100" x2="245" y2="100" stroke="var(--muted)" stroke-width="2"/>
        <circle cx="40" cy="55" r="22" class="n-in"/><text x="40" y="60" text-anchor="middle">${x1.get().toFixed(1)}</text><text x="6" y="22">x1</text>
        <circle cx="40" cy="145" r="22" class="n-in"/><text x="40" y="150" text-anchor="middle">${x2.get().toFixed(1)}</text><text x="6" y="190">x2</text>
        <text x="80" y="64">w1=${w1.get().toFixed(1)}</text><text x="80" y="146">w2=${w2.get().toFixed(1)}</text>
        <circle cx="175" cy="100" r="28" class="n-hid"/><text x="175" y="96" text-anchor="middle">Σ + b</text><text x="175" y="112" text-anchor="middle" font-size="11">${sel.value}</text>
        <circle cx="268" cy="100" r="22" class="n-out" style="fill-opacity:${0.2 + 0.8 * Math.min(1, Math.max(0, y))}"/><text x="268" y="105" text-anchor="middle">${y.toFixed(2)}</text></g></svg>`;
      const { ctx } = k; k.clear(); const N = 52;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const a = -2 + 4 * i / (N - 1), bb = 2 - 4 * j / (N - 1); let v = f(w1.get() * a + w2.get() * bb + b.get()); v = sel.value === "sigmoid" ? v : Math.max(0, Math.min(1, v / 3)); ctx.fillStyle = `hsl(${210 - 190 * v},70%,${30 + 35 * v}%)`; ctx.fillRect(i * 5, j * 5, 5.2, 5.2); }
      ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.beginPath(); ctx.arc((x1.get() + 2) / 4 * 260, (2 - x2.get()) / 4 * 260, 6, 0, 7); ctx.fill(); ctx.stroke();
      o.innerHTML = `z = w1·x1 + w2·x2 + b = ${w1.get().toFixed(1)}·${x1.get().toFixed(1)} + ${w2.get().toFixed(1)}·${x2.get().toFixed(1)} + ${b.get().toFixed(1)} = <b>${z.toFixed(2)}</b> → ${sel.value}(z) = <b>${y.toFixed(3)}</b><br><span class="muted">Right: the neuron's output for every (x1, x2) in [−2, 2]. Warm = high. White dot = your input. One neuron can only draw one straight boundary — that's why we stack layers.</span>`;
    };
    sel.addEventListener("change", draw); c.append(el("label", { class: "slider" }, el("span", { class: "slabel" }, "activation"), sel));
    const x1 = slider(c, { label: "x1", min: -2, max: 2, step: 0.1, value: 1 }, draw), x2 = slider(c, { label: "x2", min: -2, max: 2, step: 0.1, value: -0.5 }, draw);
    const w1 = slider(c, { label: "w1", min: -3, max: 3, step: 0.1, value: 1.5 }, draw), w2 = slider(c, { label: "w2", min: -3, max: 3, step: 0.1, value: -1 }, draw);
    const b = slider(c, { label: "bias b", min: -3, max: 3, step: 0.1, value: 0 }, draw);
    draw();
  };

  VIZ.compgraph = (root) => {
    const c = controls(root); const box = el("div"); root.append(box); const o = out(root);
    const draw = () => {
      const a = A.get(), b = B.get(), cc = C.get(), f = F.get();
      const e = a * b, d = e + cc, L = d * f;
      const gL = 1, gd = f * gL, gf = d * gL, ge = gd, gc = gd, ga = b * ge, gb = a * ge;
      const node = (x, y, name, val, grad) => `<g transform="translate(${x},${y})"><rect x="-50" y="-26" width="100" height="52" rx="8" class="cg-node"/><text y="-8" text-anchor="middle" font-weight="700">${name}</text><text y="7" text-anchor="middle">data ${val.toFixed(2)}</text><text y="21" text-anchor="middle" class="cg-grad">grad ${grad.toFixed(2)}</text></g>`;
      const edge = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#arr)"/>`;
      box.innerHTML = `<svg viewBox="0 0 640 270" class="viz-svg"><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--muted)"/></marker></defs><g font-size="11.5" fill="currentColor">
        ${edge(100, 40, 190, 80)}${edge(100, 120, 190, 100)}${edge(290, 90, 380, 122)}${edge(100, 205, 380, 142)}${edge(480, 132, 530, 170)}${edge(334, 238, 530, 192)}
        ${node(50, 40, "a", a, ga)}${node(50, 120, "b", b, gb)}${node(240, 90, "e = a·b", e, ge)}${node(50, 205, "c", cc, gc)}${node(430, 132, "d = e + c", d, gd)}${node(284, 238, "f", f, gf)}${node(580, 180, "L = d·f", L, gL)}
      </g></svg>`;
      const h = 0.001, L2 = ((a + h) * b + cc) * f;
      o.innerHTML = `Forward (left → right): L = (a·b + c)·f = <b>${L.toFixed(3)}</b>. Backward (right → left) gives every <span class="cg-grad">grad</span> = "how much L changes if this value goes up a little".<br>Check by nudging: increase a by 0.001 → L changes by ${(L2 - L).toFixed(5)} ≈ grad(a) × 0.001 = ${(ga * h).toFixed(5)} ✔`;
    };
    const A = slider(c, { label: "a", min: -4, max: 4, step: 0.5, value: 2 }, draw), B = slider(c, { label: "b", min: -4, max: 4, step: 0.5, value: -3 }, draw);
    const C = slider(c, { label: "c", min: -10, max: 10, step: 1, value: 10 }, draw), F = slider(c, { label: "f", min: -4, max: 4, step: 0.5, value: -2 }, draw);
    draw();
  };

  const WORDS = { dog: [-6, 4, "animals"], cat: [-5.2, 4.8, "animals"], puppy: [-6.4, 3.2, "animals"], kitten: [-5.6, 4.0, "animals"], horse: [-7.2, 5.2, "animals"],
    man: [2, 1, "people"], woman: [2, 3.5, "people"], king: [5, 1, "people"], queen: [5, 3.5, "people"], boy: [1.4, 0.4, "people"], girl: [1.4, 2.9, "people"], prince: [4.4, 0.4, "people"], princess: [4.4, 2.9, "people"],
    Python: [-3, -5, "code"], JavaScript: [-2.4, -5.6, "code"], TypeScript: [-4.2, -4.4, "code"], Java: [-4, -6, "code"], SQL: [-1.6, -4.4, "code"],
    pizza: [6, -5, "food"], pasta: [6.8, -4.4, "food"], sushi: [5.4, -6.2, "food"], tacos: [7, -6, "food"] };
  const GCOL = { animals: "--g1", people: "--g2", code: "--g3", food: "--g4" };
  VIZ.embed = (root) => {
    root.append(el("p", { class: "muted" }, "A 2D toy embedding space (hand-placed points, distance = straight-line). Click a word to see its nearest neighbors. Real embeddings have hundreds of dimensions and use cosine similarity."));
    const c = controls(root); const k = canvas(root, 560, 340); const o = out(root);
    const X = lin(-9, 9, 10, 550), Y = lin(-8, 7, 330, 10);
    let sel = "king", extra = null;
    const nearest = (v, excl) => Object.entries(WORDS).filter(([w]) => !excl.includes(w)).map(([w, p]) => [w, Math.hypot(p[0] - v[0], p[1] - v[1])]).sort((a, b) => a[1] - b[1]);
    const draw = () => {
      const { ctx } = k; k.clear(); const nn = sel ? nearest(WORDS[sel], [sel]).slice(0, 3).map((x) => x[0]) : [];
      ctx.font = "13px system-ui";
      if (extra) { ctx.strokeStyle = css("--accent2"); ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(WORDS.king[0]), Y(WORDS.king[1])); ctx.lineTo(X(WORDS.king[0] - WORDS.man[0]), Y(WORDS.king[1] - WORDS.man[1])); ctx.lineTo(X(extra.v[0]), Y(extra.v[1])); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; ctx.strokeStyle = css("--accent2"); ctx.beginPath(); ctx.arc(X(extra.v[0]), Y(extra.v[1]), 12, 0, 7); ctx.stroke(); ctx.fillStyle = css("--accent2"); ctx.fillText("king − man + woman", X(extra.v[0]) - 60, Y(extra.v[1]) - 18); }
      for (const [w, [x, y, g]] of Object.entries(WORDS)) {
        if (sel && nn.includes(w)) { ctx.strokeStyle = css("--accent"); ctx.beginPath(); ctx.moveTo(X(WORDS[sel][0]), Y(WORDS[sel][1])); ctx.lineTo(X(x), Y(y)); ctx.stroke(); }
        ctx.fillStyle = css(GCOL[g]); ctx.beginPath(); ctx.arc(X(x), Y(y), w === sel ? 8 : 5, 0, 7); ctx.fill();
        ctx.fillStyle = css("--text"); ctx.font = (w === sel ? "bold " : "") + "13px system-ui"; ctx.fillText(w, X(x) + 8, Y(y) + 4);
      }
      o.innerHTML = (sel ? `Nearest to <b>${sel}</b>: ${nearest(WORDS[sel], [sel]).slice(0, 3).map(([w, d]) => `${w} <span class="muted">(dist ${d.toFixed(2)})</span>`).join(", ")}` : "Click a word.") + (extra ? `<br>king − man + woman = [${extra.v.map(fmt2).join(", ")}] → closest word: <b>${extra.best}</b>` : "");
    };
    k.cv.addEventListener("click", (ev) => { const p = k.toLocal(ev); let best = null, bd = 1e9; for (const [w, [x, y]] of Object.entries(WORDS)) { const d = Math.hypot(X(x) - p.x, Y(y) - p.y); if (d < bd) { bd = d; best = w; } } if (bd < 30) { sel = best; draw(); } });
    button(c, "king − man + woman = ?", () => { const v = [0, 1].map((i) => WORDS.king[i] - WORDS.man[i] + WORDS.woman[i]); extra = { v, best: nearest(v, ["king", "man", "woman"])[0][0] }; draw(); });
    button(c, "Clear", () => { extra = null; draw(); }, "ghost");
    draw();
  };

  const CORPUS = `the model reads tokens not words. the tokenizer learns frequent pieces of text from a big corpus. tokens are cheaper when the text is common english.
def get_order(order_id): return repository.get_by_id(order_id)
function getOrder(id) { return repository.getById(id); }
the transformer predicts the next token. training the model takes many tokens. the agent calls tools and reads the results.
learning learned learner reading reader tokenizer tokenization tokens token`;
  const PRE = /\s?[A-Za-zÀ-ÿ]+|\s?\d+|\s?[^\sA-Za-zÀ-ÿ\d]|\s+/g;
  function mergeSeq(s, a, b) { const r = []; for (let i = 0; i < s.length; i++) { if (i < s.length - 1 && s[i] === a && s[i + 1] === b) { r.push(a + b); i++; } else r.push(s[i]); } return r; }
  function bpeTrain(text, merges) {
    const words = {}; for (const w of text.match(PRE) || []) words[w] = (words[w] || 0) + 1;
    let seqs = Object.entries(words).map(([w, n]) => [Array.from(w), n]); const rules = [];
    for (let m = 0; m < merges; m++) {
      const counts = new Map();
      for (const [s, n] of seqs) for (let i = 0; i < s.length - 1; i++) { const k = s[i] + "\u0001" + s[i + 1]; counts.set(k, (counts.get(k) || 0) + n); }
      let best = null, bc = 1; for (const [k, v] of counts) if (v > bc) { bc = v; best = k; }
      if (!best) break; const [a, b] = best.split("\u0001"); rules.push([a, b, bc]);
      seqs = seqs.map(([s, n]) => [mergeSeq(s, a, b), n]);
    }
    return rules;
  }
  function bpeEncode(text, rules) { const out = []; for (const w of text.match(PRE) || []) { let s = Array.from(w); for (const [a, b] of rules) s = mergeSeq(s, a, b); out.push(...s); } return out; }
  window.BPE = { bpeTrain, bpeEncode };
  VIZ.tokenizer = (root) => {
    root.append(el("p", { class: "muted" }, "A real (tiny) BPE tokenizer, trained right now in your browser on a small English + code corpus. More merges = bigger vocabulary = fewer tokens."));
    const c = controls(root);
    const ta = el("textarea", { class: "viz-text", rows: 3, "aria-label": "text to tokenize" }); ta.value = "The tokenizer reads def get_order(order_id). ¿Cuántos tokens usa una frase en castellano?"; root.append(ta);
    const toks = el("div", { class: "tokens" }); root.append(toks); const o = out(root); const mr = el("div", { class: "muted small" }); root.append(mr);
    let rules = [];
    const draw = () => {
      const t = bpeEncode(ta.value, rules); const vocab = new Map(); toks.innerHTML = "";
      const dark = document.documentElement.dataset.theme === "dark";
      t.forEach((tok) => { if (!vocab.has(tok)) vocab.set(tok, vocab.size); const id = vocab.get(tok); toks.append(el("span", { class: "tok", style: `background:hsl(${(id * 47) % 360},70%,${dark ? 28 : 86}%)`, title: "token" }, tok.replace(/ /g, "␣"))); });
      o.innerHTML = `<b>${ta.value.length}</b> characters → <b>${t.length}</b> tokens (${(ta.value.length / Math.max(1, t.length)).toFixed(2)} chars/token) with ${rules.length} learned merges (training stops early when no pair repeats in this small corpus). Non-English and rare words split into more pieces because the training corpus was English + code.`;
      mr.textContent = "First merges learned: " + rules.slice(0, 18).map(([a, b]) => `"${(a + b).replace(/ /g, "␣")}"`).join(" · ");
    };
    slider(c, { label: "BPE merges", min: 0, max: 220, value: 120 }, (v) => { rules = bpeTrain(CORPUS, v); draw(); });
    ta.addEventListener("input", draw); rules = bpeTrain(CORPUS, 120); draw();
  };

  VIZ.temperature = (root) => {
    const toks = ["Python", "JavaScript", "TypeScript", "Rust", "Java", "Go", "COBOL", "banana"], logits = [3.2, 3.0, 2.5, 2.0, 1.8, 1.5, 0.2, -1.5];
    root.append(el("p", {}, el("b", {}, "Prompt: "), "\"My favorite programming language is …\""));
    const c = controls(root); const b = el("div"); root.append(b); const o = out(root);
    const counts = toks.map(() => 0); let last = null;
    const probs = () => { let p = softmax(logits, T.get()); const order = p.map((v, i) => [v, i]).sort((x, y) => y[0] - x[0]); let acc = 0; const keep = new Set(); for (const [v, i] of order) { if (acc < P.get() || keep.size === 0) keep.add(i); acc += v; } p = p.map((v, i) => (keep.has(i) ? v : 0)); const s = p.reduce((x, y) => x + y, 0); return p.map((v) => v / s); };
    const draw = () => { const p = probs(); bars(b, toks.map((t, i) => ({ label: `${t} (logit ${logits[i]})`, value: p[i], cls: i === last ? "hl" : p[i] === 0 ? "dim" : "" })), { max: 1, fmt: (v) => (v * 100).toFixed(1) + "%" }); const tot = counts.reduce((x, y) => x + y, 0); o.innerHTML = (last != null ? `Sampled: <b>${toks[last]}</b>. ` : "") + (tot ? "Samples so far: " + toks.map((t, i) => counts[i] ? `${t}×${counts[i]}` : "").filter(Boolean).join(", ") : "Low temperature → almost always Python. High temperature → even 'banana' becomes possible. Top-p removes the unlikely tail."); };
    const sample = () => { const p = probs(); let r = Math.random(), a = 0; for (let i = 0; i < p.length; i++) { a += p[i]; if (r < a) return i; } return 0; };
    const T = slider(c, { label: "temperature", min: 0.05, max: 2.5, step: 0.05, value: 1 }, draw);
    const P = slider(c, { label: "top-p", min: 0.1, max: 1, step: 0.05, value: 1 }, draw);
    button(c, "Sample next token", () => { last = sample(); counts[last]++; draw(); });
    button(c, "Sample 20", () => { for (let i = 0; i < 20; i++) { last = sample(); counts[last]++; } draw(); });
    button(c, "Reset", () => { counts.fill(0); last = null; draw(); }, "ghost");
    draw();
  };

  VIZ.attention = (root) => {
    const t = ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "tired"];
    const link = { "7,1": 3.2, "7,5": 1.3, "10,7": 2.2, "10,1": 1.9, "3,1": 1.8, "5,3": 1.6, "5,4": 1.4, "1,0": 1.2, "2,1": 1.2, "6,3": 1.0, "8,7": 1.8, "9,10": 1.4, "4,5": 2.0, "0,1": 1.5, "9,8": 1.0, "3,5": 1.6, "6,10": 0.9 };
    const c = controls(root); const k = canvas(root, 560, 410); const o = out(root);
    let sel = 7, causal = true;
    const weights = () => t.map((_, i) => softmax(t.map((_, j) => (causal && j > i ? -Infinity : (i === j ? 1.0 : 0) + (link[i + "," + j] || 0) + (j === 0 ? 0.3 : 0)))));
    const L = 90, TOP = 74, cell = 42;
    const draw = () => {
      const W = weights(), { ctx } = k; k.clear(); ctx.font = "12px system-ui";
      t.forEach((w, j) => { ctx.save(); ctx.translate(L + j * cell + 10, TOP - 6); ctx.rotate(-Math.PI / 4); ctx.fillStyle = css("--text"); ctx.fillText(w, 0, 0); ctx.restore(); });
      t.forEach((w, i) => { ctx.fillStyle = i === sel ? css("--accent") : css("--text"); ctx.font = (i === sel ? "bold " : "") + "12px system-ui"; ctx.fillText(w, 8, TOP + i * 30 + 19); for (let j = 0; j < t.length; j++) { const v = W[i][j]; const x0 = L + j * cell, y0 = TOP + i * 30;
          if (v > 0) { ctx.fillStyle = `rgba(21,101,192,${0.08 + 0.92 * v})`; ctx.fillRect(x0, y0, cell - 2, 28); }
          else { ctx.fillStyle = css("--masked"); ctx.fillRect(x0, y0, cell - 2, 28); ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, cell - 2, 28); ctx.clip(); ctx.strokeStyle = css("--grid"); ctx.beginPath(); for (let h = -28; h < cell; h += 7) { ctx.moveTo(x0 + h, y0 + 28); ctx.lineTo(x0 + h + 28, y0); } ctx.stroke(); ctx.restore(); } if (v > 0.12) { ctx.fillStyle = v > 0.45 ? "#fff" : css("--text"); ctx.font = "12px system-ui"; ctx.fillText(v.toFixed(2), L + j * cell + 7, TOP + i * 30 + 18); } } });
      ctx.strokeStyle = css("--accent2"); ctx.lineWidth = 2.5; ctx.strokeRect(L - 2, TOP + sel * 30 - 1, t.length * cell + 2, 30); ctx.lineWidth = 1;
      const row = W[sel].map((v, j) => [v, j]).sort((x, y) => y[0] - x[0]).slice(0, 3);
      o.innerHTML = `Row = the token that is "asking" (query). Columns = tokens it can look at (keys). <b>"${t[sel]}"</b> attends most to: ${row.map(([v, j]) => `<b>${t[j]}</b> ${(v * 100).toFixed(0)}%`).join(", ")}. ${causal ? "Hatched grey cells = future tokens hidden by the causal mask." : "No mask: tokens can also look ahead (like BERT-style encoders)."} <span class="muted">Illustrative weights, not from a real model.</span>`;
    };
    k.cv.addEventListener("click", (ev) => { const p = k.toLocal(ev); const i = Math.floor((p.y - TOP) / 30); if (i >= 0 && i < t.length) { sel = i; draw(); } });
    const cb = el("input", { type: "checkbox" }); cb.checked = true; cb.addEventListener("change", () => { causal = cb.checked; draw(); });
    c.append(el("label", { class: "check" }, cb, " causal mask (GPT-style)")); c.append(el("span", { class: "muted" }, "Click a row to choose the query token."));
    draw();
  };

  VIZ.transformer = (root) => {
    const c = controls(root); const o = out(root); const b = el("div"); root.append(b);
    const draw = () => { const Lr = L.get(), d = D.get(), V = Vv.get(); const blocks = 12 * Lr * d * d, emb = V * d, tot = blocks + emb;
      o.innerHTML = `≈ <b>${fmtNum(tot)}</b> parameters &nbsp;|&nbsp; memory to hold weights in 16-bit: <b>${(tot * 2 / 1e9).toFixed(1)} GB</b> &nbsp;|&nbsp; 4-bit quantized: ${(tot * 0.5 / 1e9).toFixed(1)} GB`;
      bars(b, [{ label: "attention (≈4·L·d²)", value: 4 * Lr * d * d }, { label: "MLP (≈8·L·d²)", value: 8 * Lr * d * d }, { label: "embeddings (V·d)", value: emb }], { fmt: fmtNum }); };
    const L = slider(c, { label: "layers L", min: 2, max: 128, value: 12 }, draw), D = slider(c, { label: "width d_model", min: 128, max: 16384, step: 128, value: 768 }, draw), Vv = slider(c, { label: "vocab V", min: 1000, max: 260000, step: 1000, value: 50000 }, draw);
    button(c, "GPT-2 small", () => { L.set(12); D.set(768); Vv.set(50000); }, "ghost"); button(c, "GPT-3 (175B)", () => { L.set(96); D.set(12288); Vv.set(50000); }, "ghost");
    draw();
  };

  VIZ.losscurve = (root) => {
    root.append(el("p", { class: "muted" }, "Loss predicted by a Chinchilla-style scaling law L(N, D) = 1.69 + 406.4/N^0.34 + 410.7/D^0.28 (Hoffmann et al., 2022). Illustrative: real curves are noisy."));
    const c = controls(root); const k = canvas(root, 560, 290); const o = out(root);
    const loss = (N, D) => 1.69 + 406.4 / N ** 0.34 + 410.7 / D ** 0.28;
    const X = lin(8, 13, 40, 540), Y = lin(1.6, 4.5, 255, 10);
    const sizes = [1e8, 1e9, 1e10, 7e10, 4e11], cols = ["--g1", "--g2", "--g3", "--g4", "--accent"];
    const draw = () => {
      const { ctx } = k; k.clear(); axes(ctx, k.W, k.H, 30, { x: "training tokens (log)", y: "loss" });
      ctx.font = "11px system-ui"; for (let e = 8; e <= 13; e++) { ctx.fillStyle = css("--muted"); ctx.fillText("1e" + e, X(e) - 8, 284); }
      sizes.forEach((N, i) => { ctx.strokeStyle = css(cols[i]); ctx.lineWidth = i === sel.get() ? 3.5 : 1.5; ctx.beginPath(); for (let e = 8; e <= 13; e += 0.05) { const y = loss(N, 10 ** e); e === 8 ? ctx.moveTo(X(e), Y(y)) : ctx.lineTo(X(e), Y(y)); } ctx.stroke(); ctx.fillStyle = css(cols[i]); ctx.fillText(fmtNum(N) + " params", 460, Y(loss(N, 1e13)) - 4); });
      ctx.lineWidth = 1; const N = sizes[sel.get()], D = 10 ** tok.get();
      ctx.fillStyle = css("--bad"); ctx.beginPath(); ctx.arc(X(tok.get()), Y(loss(N, D)), 6, 0, 7); ctx.fill();
      const flops = 6 * N * D;
      o.innerHTML = `Model ${fmtNum(N)} params trained on ${fmtNum(D)} tokens → predicted loss <b>${loss(N, D).toFixed(3)}</b>. Compute ≈ 6·N·D = <b>${flops.toExponential(2)} FLOPs</b> ≈ ${fmtNum(flops / 4e14 / 86400)} GPU-days at 4e14 FLOP/s. <span class="muted">Chinchilla rule of thumb: ≈ 20 tokens per parameter → ${fmtNum(20 * N)} tokens.</span>`;
    };
    const sel = slider(c, { label: "model size", min: 0, max: 4, value: 2, fmt: (v) => fmtNum(sizes[v]) }, draw);
    const tok = slider(c, { label: "training tokens", min: 8, max: 13, step: 0.1, value: 11.3, fmt: (v) => fmtNum(10 ** v) }, draw);
    draw();
  };

  VIZ.lora = (root) => {
    const c = controls(root); const k = canvas(root, 560, 210); const o = out(root);
    const draw = () => {
      const d = D.get(), r = R.get(), full = d * d, lora = 2 * d * r, { ctx } = k; k.clear();
      const S = 160; ctx.fillStyle = css("--grid"); ctx.fillRect(20, 20, S, S); ctx.fillStyle = css("--text"); ctx.font = "12px system-ui"; ctx.fillText(`W (frozen) ${d}×${d}`, 22, 200);
      const rw = Math.max(3, S * r / d); ctx.fillStyle = css("--accent"); ctx.fillRect(250, 20, rw, S); ctx.fillStyle = css("--text"); ctx.fillText(`B ${d}×${r}`, 250, 200);
      ctx.fillStyle = css("--accent"); ctx.fillRect(290 + rw, 20, S, rw); ctx.fillStyle = css("--text"); ctx.fillText(`A ${r}×${d}`, 290 + rw, 36 + rw);
      ctx.font = "22px system-ui"; ctx.fillText("+", 210, 105); ctx.fillText("×", 262 + rw, 105);
      o.innerHTML = `Full finetune of this matrix: <b>${fmtNum(full)}</b> trainable numbers. LoRA rank ${r}: <b>${fmtNum(lora)}</b> (<b>${(100 * lora / full).toFixed(2)}%</b>). For ${Lc.get()} layers × 4 adapted matrices: ${fmtNum(lora * 4 * Lc.get())} trainable params ≈ ${(lora * 4 * Lc.get() * 2 / 1e6).toFixed(0)} MB adapter file (16-bit).`;
    };
    const D = slider(c, { label: "matrix size d", min: 512, max: 8192, step: 512, value: 4096 }, draw), R = slider(c, { label: "LoRA rank r", min: 1, max: 128, value: 8 }, draw), Lc = slider(c, { label: "layers", min: 8, max: 96, value: 32 }, draw);
    draw();
  };
})();

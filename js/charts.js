/* ════════════════════════════════════════════════════════════
   THE OUTLIER GROUP — small SVG chart kit (no library)
   Bars (horizontal), donut, columns (trend), split bar.
   Colors: validated categorical slots (see css --c1..--c4).
   Every mark has a hover/focus tooltip; values are direct-labeled.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => Number(n || 0).toLocaleString("en-US");
  let tip;
  function tooltip() {
    if (tip) return tip;
    tip = document.createElement("div"); tip.className = "viz-tip"; tip.setAttribute("role", "status"); tip.hidden = true;
    document.body.appendChild(tip); return tip;
  }
  function bindTips(root) {
    const t = tooltip();
    root.querySelectorAll("[data-tip]").forEach((m) => {
      const show = (e) => {
        t.innerHTML = m.getAttribute("data-tip"); t.hidden = false;
        const r = (e && e.clientX != null && e.type !== "focus") ? { x: e.clientX, y: e.clientY } : (() => { const b = m.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top }; })();
        const w = t.offsetWidth, h = t.offsetHeight;
        t.style.left = Math.min(window.innerWidth - w - 8, Math.max(8, r.x - w / 2)) + "px";
        t.style.top = Math.max(8, r.y - h - 14) + "px";
      };
      m.addEventListener("mousemove", show); m.addEventListener("focus", show);
      m.addEventListener("mouseleave", () => (t.hidden = true)); m.addEventListener("blur", () => (t.hidden = true));
    });
  }

  /* Horizontal bars — one series, sorted by value, value at the tip */
  function bars(el, rows, opts = {}) {
    if (!el) return;
    if (!rows.length) { el.innerHTML = `<p class="viz-empty">${esc(opts.empty || "No data for these filters yet.")}</p>`; return; }
    const max = Math.max(...rows.map((r) => r.value), 1);
    el.innerHTML = `<div class="hbars" role="list">${rows.map((r) => {
      const pct = Math.max(2, (r.value / max) * 100);
      return `<div class="hbar" role="listitem" tabindex="0" data-tip="<b>${esc(r.label)}</b><br>${fmt(r.value)} ${esc(opts.unit || "")}${r.note ? "<br>" + esc(r.note) : ""}">
        <span class="hbar-label">${esc(r.label)}</span>
        <span class="hbar-track"><span class="hbar-fill" style="--w:${pct}%;${r.color ? "background:" + r.color : ""}"></span></span>
        <span class="hbar-val">${fmt(r.value)}</span>
      </div>`;
    }).join("")}</div>`;
    bindTips(el);
  }

  /* Donut — parts of a whole, ≤4 slices, legend with values (identity is never color-only) */
  function donut(el, parts, opts = {}) {
    if (!el) return;
    const total = parts.reduce((a, p) => a + p.value, 0);
    const R = 54, r = 36, C = 2 * Math.PI * ((R + r) / 2), sw = R - r;
    let acc = 0; const gap = total ? 2 / C * 360 : 0;
    const segs = parts.filter((p) => p.value > 0).map((p) => {
      const frac = p.value / (total || 1); const len = frac * C;
      const s = `<circle class="donut-seg" cx="60" cy="60" r="${(R + r) / 2}" fill="none" stroke="${p.color}" stroke-width="${sw}"
        stroke-dasharray="${Math.max(0, len - 2)} ${C}" stroke-dashoffset="${-acc}" transform="rotate(-90 60 60)" tabindex="0"
        data-tip="<b>${esc(p.label)}</b><br>${fmt(p.value)} · ${Math.round(frac * 100)}%"></circle>`;
      acc += len; return s;
    }).join("");
    el.innerHTML = `<div class="donut-wrap">
      <svg viewBox="0 0 120 120" class="donut" role="img" aria-label="${esc(opts.label || "Breakdown")}: ${parts.map((p) => `${p.label} ${p.value}`).join(", ")}">
        <circle cx="60" cy="60" r="${(R + r) / 2}" fill="none" stroke="var(--viz-track)" stroke-width="${sw}"></circle>
        ${segs}
        <text x="60" y="58" text-anchor="middle" class="donut-num">${fmt(total)}</text>
        <text x="60" y="74" text-anchor="middle" class="donut-cap">${esc(opts.center || "total")}</text>
      </svg>
      <ul class="legend">${parts.map((p) => `<li><i style="background:${p.color}"></i><span>${esc(p.label)}</span><b>${fmt(p.value)}</b></li>`).join("")}</ul>
    </div>`;
    bindTips(el);
  }

  /* Columns — search trend by day; single series (title names it), faint grid, labeled max + last */
  function columns(el, pts, opts = {}) {
    if (!el) return;
    const max = Math.max(...pts.map((p) => p.value), 1);
    const top = Math.max(2, Math.ceil(max / 2) * 2);
    const W = 560, H = 190, P = { l: 14 + 6.5 * fmt(top).length, r: 10, t: 16, b: 26 };
    const bw = (W - P.l - P.r) / pts.length; const cw = Math.min(22, bw - 4);
    const y = (v) => P.t + (H - P.t - P.b) * (1 - v / top);
    const ticks = [0, top / 2, top];
    const lastIdx = pts.length - 1; const maxIdx = pts.reduce((m, p, i) => (p.value > pts[m].value ? i : m), 0);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="cols" role="img" aria-label="${esc(opts.label || "Trend")}">
      ${ticks.map((t) => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}" class="grid"></line><text x="${P.l - 6}" y="${y(t) + 4}" text-anchor="end" class="tick">${fmt(t)}</text>`).join("")}
      ${pts.map((p, i) => {
        const x = P.l + i * bw + (bw - cw) / 2, h = Math.max(0, y(0) - y(p.value));
        const r = Math.min(4, h);
        const path = h > 0 ? `M${x},${y(0)} V${y(p.value) + r} Q${x},${y(p.value)} ${x + r},${y(p.value)} H${x + cw - r} Q${x + cw},${y(p.value)} ${x + cw},${y(p.value) + r} V${y(0)} Z` : "";
        const lab = (i === lastIdx || i === maxIdx) && p.value > 0 ? `<text x="${x + cw / 2}" y="${y(p.value) - 5}" text-anchor="middle" class="val">${fmt(p.value)}</text>` : "";
        const show = i % Math.ceil(pts.length / 7) === 0 || i === lastIdx;
        return `<g><rect x="${P.l + i * bw}" y="${P.t}" width="${bw}" height="${H - P.t - P.b}" fill="transparent" tabindex="0" data-tip="<b>${esc(p.label)}</b><br>${fmt(p.value)} ${esc(opts.unit || "searches")}"></rect>
          ${path ? `<path d="${path}" class="col" pointer-events="none"></path>` : ""}${lab}
          ${show ? `<text x="${x + cw / 2}" y="${H - 8}" text-anchor="middle" class="tick">${esc(p.short || p.label)}</text>` : ""}</g>`;
      }).join("")}
      <line x1="${P.l}" x2="${W - P.r}" y1="${y(0)}" y2="${y(0)}" class="axis"></line>
    </svg>`;
    bindTips(el);
  }

  /* Split bar — two parts of a whole with a 2px surface gap */
  function split(el, a, b) {
    if (!el) return;
    const t = (a.value + b.value) || 1; const pa = a.value / t * 100;
    el.innerHTML = `<div class="vsplit">
      <div class="split-bar"><span tabindex="0" style="width:${pa}%;background:${a.color}" data-tip="<b>${esc(a.label)}</b><br>${fmt(a.value)} · ${Math.round(pa)}%"></span><span tabindex="0" style="width:${100 - pa}%;background:${b.color}" data-tip="<b>${esc(b.label)}</b><br>${fmt(b.value)} · ${Math.round(100 - pa)}%"></span></div>
      <ul class="legend row"><li><i style="background:${a.color}"></i><span>${esc(a.label)}</span><b>${fmt(a.value)}</b></li><li><i style="background:${b.color}"></i><span>${esc(b.label)}</span><b>${fmt(b.value)}</b></li></ul>
    </div>`;
    bindTips(el);
  }

  window.OGCharts = { bars, donut, columns, split, fmt };
})();

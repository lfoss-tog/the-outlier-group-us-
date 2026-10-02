/* ════════════════════════════════════════════════════════════
   THE OUTLIER GROUP — cookie & storage consent
   Shown before the site can be used. Choices: Accept All, Deny
   (necessary only), or Manage Preferences. The choice is saved in this
   browser, recorded on the Cookie_Consent sheet, and enforced by
   OGConsent.allowed(category) everywhere the site stores or logs data.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const KEY = "og-cookie-consent";
  const VERSION = 1;
  const CATS = [
    { key: "necessary", name: "Strictly necessary", locked: true,
      desc: "Keeps the site working: remembers your cookie choice, your session ID, the Client Portal notice you accepted, and the status of NDA requests you submit, so approved properties stay unlocked for you. These can't be switched off." },
    { key: "preferences", name: "Preferences",
      desc: "Remembers your light or dark theme, your recent Client Portal searches (for the \"Your searches\" charts), and your Assistant conversation during a visit. If this is off, they last only until you leave the page." },
    { key: "analytics", name: "Analytics",
      desc: "Lets us record anonymous site activity to improve our service, using Google Analytics and our own activity log: pages and properties viewed, Portfolio searches and filters, Assistant questions, brochure downloads, form submissions, and Investment Calculator runs. No names, emails or phone numbers are sent to Google. Nothing is sold or used for advertising." }
  ];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const listeners = [];
  let mem = null;

  function read() {
    if (mem) return mem;
    try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v && v.v === VERSION) return (mem = v); } catch (e) {}
    return null;
  }
  function allowed(cat) { if (cat === "necessary") return true; const c = read(); return !!(c && c[cat]); }
  function sessionId() { try { return JSON.parse(localStorage.getItem("og-session") || "null") || ""; } catch (e) { return ""; } }

  function record(c) {
    if (window.OG_PREVIEW || !window.OG_CONFIG || !OG_CONFIG.ENDPOINT) return;
    const body = JSON.stringify({ type: "consent", consent: {
      "Consent ID": c.id, "Timestamp": c.at, "Session ID": sessionId(), "Choice": c.choice,
      "Necessary": "Yes", "Preferences": c.preferences ? "Yes" : "No", "Analytics": c.analytics ? "Yes" : "No",
      "Policy Version": VERSION, "Page": location.hash || "#home"
    } });
    try { fetch(OG_CONFIG.ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body, keepalive: true }); } catch (e) {}
  }

  function save(prefs, analytics, choice) {
    const id = (read() && read().id) || "CK-" + Math.random().toString(36).slice(2, 10).toUpperCase() + Date.now().toString(36).toUpperCase();
    const c = { v: VERSION, id, at: new Date().toISOString(), choice, necessary: true, preferences: !!prefs, analytics: !!analytics };
    mem = c;
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    if (!c.preferences) { try { ["og-theme", "og-search-history"].forEach((k) => localStorage.removeItem(k)); sessionStorage.removeItem("og-chat"); } catch (e) {} }
    record(c);
    listeners.forEach((fn) => { try { fn(c); } catch (e) {} });
    return c;
  }

  let box = null;
  function setInert(on) {
    document.querySelectorAll("body > header, body > main, body > footer, .chat-fab, .chat-panel, .preview-bar").forEach((el) => { el.inert = on; if (on) el.setAttribute("aria-hidden", "true"); else el.removeAttribute("aria-hidden"); });
    document.body.classList.toggle("consent-open", on);
  }
  function close() { if (!box) return; box.remove(); box = null; setInert(false); }

  function open(manage) {
    if (box) return;
    const cur = read();
    box = document.createElement("div");
    box.className = "cookie-layer"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "ckTitle"); box.setAttribute("aria-describedby", "ckDesc");
    box.innerHTML = `<div class="cookie-box">
      <div class="cookie-main" id="ckMain">
        <p class="kicker">Privacy settings</p>
        <h2 class="display-3" id="ckTitle">We value your privacy</h2>
        <p class="muted" id="ckDesc">This site uses cookies and similar browser storage. Some are strictly necessary for the site to work. With your permission we also use <b>preference</b> storage to remember your settings and <b>analytics</b> to understand how the site is used. We don't use advertising cookies or sell your data. You can change your choice at any time from <b>Cookie Preferences</b> in the footer. See our <a href="#privacy" data-ck-privacy>Privacy Policy</a>.</p>
      </div>
      <div class="cookie-prefs" id="ckPrefs" ${manage ? "" : "hidden"}>
        ${CATS.map((c) => `<div class="ck-cat">
          <div class="ck-cat-head"><b>${esc(c.name)}</b>${c.locked ? `<span class="pill plain">Always on</span>` : `<label class="switch"><input type="checkbox" data-ck="${c.key}" ${cur && cur[c.key] ? "checked" : ""} aria-label="${esc(c.name)}"><span></span></label>`}</div>
          <p class="muted small">${esc(c.desc)}</p></div>`).join("")}
      </div>
      <div class="cookie-actions">
        <button class="btn outline" type="button" data-ck-act="manage" ${manage ? "hidden" : ""}>Manage Preferences</button>
        <button class="btn outline" type="button" data-ck-act="save" ${manage ? "" : "hidden"}>Save Preferences</button>
        <button class="btn outline" type="button" data-ck-act="deny">Deny</button>
        <button class="btn primary" type="button" data-ck-act="accept">Accept All</button>
      </div>
    </div>`;
    document.body.appendChild(box);
    setInert(true);
    const first = box.querySelector(manage ? "[data-ck]" : "[data-ck-act=accept]"); if (first) first.focus();
    box.addEventListener("click", (e) => {
      if (e.target.closest("[data-ck-privacy]")) { e.preventDefault(); location.hash = "#privacy"; close(); setTimeout(() => open(false), 50); return; }
      const b = e.target.closest("[data-ck-act]"); if (!b) return;
      const act = b.dataset.ckAct;
      if (act === "manage") { box.querySelector("#ckPrefs").hidden = false; b.hidden = true; box.querySelector("[data-ck-act=save]").hidden = false; box.querySelector("[data-ck]").focus(); return; }
      if (act === "accept") save(true, true, "Accepted all");
      else if (act === "deny") save(false, false, "Denied (necessary only)");
      else if (act === "save") { const p = box.querySelector("[data-ck=preferences]").checked, a = box.querySelector("[data-ck=analytics]").checked; save(p, a, p && a ? "Accepted all" : !p && !a ? "Denied (necessary only)" : "Custom"); }
      close();
      if (window.OG && OG.toast) OG.toast("Your privacy choice is saved");
    });
    // Keep focus inside the dialog
    box.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = [...box.querySelectorAll("button:not([hidden]),input,a[href]")].filter((x) => x.offsetParent !== null);
      if (!f.length) return; const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
  }

  window.OGConsent = { get: read, allowed, open, onChange: (fn) => listeners.push(fn) };
  function boot() { if (!read()) open(false); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

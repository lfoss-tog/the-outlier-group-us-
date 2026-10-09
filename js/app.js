/* ════════════════════════════════════════════════════════════
   THE OUTLIER GROUP — site app
   Page structure mirrors outliergroup.us:
     #home  #sectors  #services  #why-outlier  #our-team  #portfolio
     #contact  #portal (off-market Client Portal)  #property-<listing id>
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── helpers ── */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* Browser storage respects the cookie choice: preference keys stay in memory
     (this page view only) unless the visitor allowed "Preferences". */
  const PREF_KEYS = ["og-theme", "og-search-history"];
  const memStore = {};
  const canKeep = (k) => !PREF_KEYS.includes(k) || !window.OGConsent || OGConsent.allowed("preferences");
  const store = {
    get(k, d = null) { if (k in memStore) return memStore[k]; if (!canKeep(k)) return d; try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { if (!canKeep(k)) { memStore[k] = v; return; } delete memStore[k]; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  /* Activity logs that count as "Analytics" in the cookie settings */
  const ANALYTICS_SHEETS = ["Listings_Filters", "Assistant_Questions", "Brochure_Downloads", "Calculator_Runs"];
  const byId = (id) => LISTINGS.find((l) => l.id === id);
  /* Two separate inventories: the public Portfolio never includes off-market properties,
     and the Client Portal only ever shows off-market properties (NDA required). */
  const PUBLIC_LISTINGS = () => LISTINGS.filter((l) => !l.offMarket);
  const OFF_MARKET_LISTINGS = () => LISTINGS.filter((l) => l.offMarket);
  const agentOf = (l) => AGENTS[l.agent] || AGENTS.team;
  const statusKey = (s) => (s || "").toLowerCase().replace(/\s+listing$/, "").replace(/\s+/g, "-");
  const typeLabel = (l) => l.typeLabel || l.type;
  const makeId = (p) => p + "-" + (window.crypto && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 14).toUpperCase();
  const SESSION_ID = store.get("og-session") || (() => { const id = makeId("SES"); store.set("og-session", id); return id; })();
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.OG = window.OG || {};

  const ICON = {
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5l8-2v18M12 8l8 2v11M3 21h18M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12M13 7l5 5-5 5"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 12H6M11 7l-5 5 5 5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>'
  };
  const circleArrow = `<span class="circle-arrow" aria-hidden="true">${ICON.arrow}</span>`;

  /* ── network: one Apps Script endpoint (Drive, Google Sheet, email; Airtable for NDA approvals only) ── */
  async function post(payload) {
    if (payload && payload.type === "log" && ANALYTICS_SHEETS.includes(payload.sheet) && window.OGConsent && !OGConsent.allowed("analytics")) return { ok: true, skipped: true, data: {} };
    if (window.OG_PREVIEW) { await new Promise((r) => setTimeout(r, 450)); return { ok: true, confirmed: false, data: {} }; }
    const body = JSON.stringify(Object.assign({ sessionId: SESSION_ID, page: location.href.split("#")[0], ts: new Date().toISOString() }, payload));
    try {
      const res = await fetch(OG_CONFIG.ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body, redirect: "follow" });
      let data = {};
      try { data = await res.json(); } catch (e) {}
      if (!res.ok || data.status === "error") throw new Error(data.message || "HTTP " + res.status);
      return { ok: true, confirmed: true, data };
    } catch (err) {
      try {
        await fetch(OG_CONFIG.ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body });
        return { ok: true, confirmed: false, data: {} };
      } catch (err2) { return { ok: false, error: String((err2 && err2.message) || err2) }; }
    }
  }
  const logToSheet = (sheet, row) => post({ type: "log", sheet, row });
  OG.post = post;
  let toastT = null;
  OG.toast = function (msg) {
    let t = document.getElementById("ogToast");
    if (!t) { t = document.createElement("div"); t.id = "ogToast"; t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 3200);
  };
  async function getJSON(params) {
    if (window.OG_PREVIEW && OG.previewGet) return OG.previewGet(params);
    try { const r = await fetch(OG_CONFIG.ENDPOINT + "?" + new URLSearchParams(params).toString(), { redirect: "follow" }); return await r.json(); }
    catch (e) { return null; }
  }
  OG.getJSON = getJSON;
  /* NDA / access state for off-market listings (per browser) */
  const ndaOf = (id) => (store.get("og-nda-signed", {}) || {})[id] || null;
  const accessOf = (id) => (store.get("og-access", {}) || {})[id] || null;
  function setNda(id, patch) { const m = store.get("og-nda-signed", {}) || {}; m[id] = Object.assign({}, m[id] || {}, patch); store.set("og-nda-signed", m); }
  function setAccess(id, v) { const m = store.get("og-access", {}) || {}; m[id] = v; store.set("og-access", m); }
  OG.setNda = setNda; OG.ndaOf = ndaOf;
  const accessPill = (l) => { const a = accessOf(l.id), n = ndaOf(l.id); return a ? pill("Access approved", "s-available") : n && n.status === "denied" ? pill("Access denied", "s-past") : n ? pill("NDA pending review", "s-pending") : ""; };

  /* ── theme ── */
  function isDark() { return document.documentElement.getAttribute("data-theme") !== "light"; }
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    const b = $("#themeBtn"); if (b) { b.innerHTML = isDark() ? ICON.sun : ICON.moon; b.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme"); }
    OG.maps.forEach((m) => m._ogSetTiles && m._ogSetTiles());
  }
  OG.maps = [];

  /* ── motion: reveal-on-scroll (content below the fold only), counters, parallax ── */
  let io = null;
  function motion(root) {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    io = io || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    const fold = window.innerHeight * 0.92;
    $$("[data-reveal]", root).forEach((el, i) => {
      if (el.getBoundingClientRect().top < fold) return;
      el.classList.add("reveal"); el.style.setProperty("--d", ((i % 4) * 70) + "ms"); io.observe(el);
    });
    $$("[data-count]", root).forEach((el) => {
      const end = +el.dataset.count; const t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    $(".site-header") && $(".site-header").classList.toggle("scrolled", y > 12);
    if (reduceMotion) return;
    const band = $(".band-media"); if (band) { const r = band.parentElement.getBoundingClientRect(); band.style.transform = `translate3d(0, ${(-r.top * 0.18).toFixed(1)}px, 0) scale(1.12)`; }
  }, { passive: true });

  /* ── shared UI ── */
  const pill = (text, cls) => `<span class="pill ${cls}">${esc(text)}</span>`;
  const statusPill = (l) => l.offMarket ? `<span class="pill s-off-market">${ICON.lock} Off-Market</span>`
    : pill(l.status === "Available" ? (/^Available\s+(?!now\b)\S/i.test(l.statusNote || "") ? "Coming Soon" : /^Available/.test(l.statusNote || "") ? l.statusNote : "Available") : l.status, "s-" + statusKey(l.status));
  const imgTag = (name, alt) => name ? `<img src="${photoPath(name)}" alt="${esc(alt)}" loading="lazy">` : `<div class="placeholder">${ICON.building}</div>`;

  const specList = (l) => `<dl class="specs">
      <div><dt>Unit # &amp; Space Available (SF)</dt><dd>${esc(l.space || "—")}</dd></div>
      <div><dt>Building Size</dt><dd>${esc(l.building || "—")}</dd></div>
      <div><dt>Unit Size (SF)</dt><dd>${esc(l.unit || "—")}</dd></div>
    </dl>`;

  function listingCard(l) {
    const href = "#property-" + l.id, locked = !!l.offMarket;
    const loc = locked ? l.region : ((l.address && l.address !== l.title && !l.city.startsWith(l.address) ? l.address + ", " : "") + l.city);
    return `<article class="card${locked ? " off" : ""}" data-reveal>
      <a class="card-media${locked ? " locked" : ""}" href="${href}" aria-label="${esc(l.title)}">
        ${imgTag(l.photos[0], locked ? "" : l.title)}
        ${locked ? `<div class="lock-overlay"><div>${ICON.lock}<b>Off-Market</b><small>Sign the NDA to view</small></div></div>` : ""}
        <div class="on-photo">${statusPill(l)}${pill("For " + l.deal, "plain")}</div>
        <span class="card-view">${locked ? "Request Access" : "View Property"} ${ICON.arrow}</span>
      </a>
      <div class="card-body">
        <p class="card-type">${esc(typeLabel(l))}</p>
        <h3 class="card-title"><a href="${href}">${esc(l.title)}</a></h3>
        <p class="card-loc">${ICON.pin}<span>${esc(loc)}</span></p>
        ${specList(l)}
        <div class="card-foot">
          <span class="agent-mini">${esc(agentOf(l).name)}</span>
          <a class="btn small ${locked ? "coral" : "primary"}" href="${href}">${locked ? "Request Access" : "Inquire"} ${ICON.arrow}</a>
        </div>
      </div>
    </article>`;
  }

  function pageHead(title, lede, crumb) {
    return `<header class="page-head"><div class="wrap narrow center">
      ${crumb ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span><span>${esc(crumb)}</span></nav>` : ""}
      <h1 class="display-2 rise">${title}</h1>
      ${lede ? `<p class="lede center rise d1">${lede}</p>` : ""}
    </div></header>`;
  }

  const needsBand = () => `<section class="needs"><div class="wrap needs-row" data-reveal>
      <h2 class="display-3">Whatever your needs, we are available to help –</h2>
      <a class="btn outline" href="#contact">Schedule A Consultation ${circleArrow}</a>
    </div></section>`;

  const itemGrid = (items, hrefFor) => `<div class="item-grid">${items.map((it) => {
    const href = hrefFor(it);
    return `<a class="item" href="${href}" data-reveal ${it.filter ? `data-sector="${esc(it.filter)}"` : ""}>
      <h3>${esc(it.name)}</h3><p>${esc(it.desc)}</p>
      ${it.count ? `<span class="item-count">${it.count} in our portfolio</span>` : ""}
      ${circleArrow}
    </a>`;
  }).join("")}</div>`;

  /* ── maps ── */
  function mapFor(el, points, opts = {}) {
    if (!el) return null;
    if (!window.L) { el.innerHTML = `<div class="placeholder big">${ICON.compass}</div>`; return null; }
    const map = L.map(el, { scrollWheelZoom: false });
    if (map.attributionControl) map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    let layer = null;
    map._ogSetTiles = () => { if (layer) map.removeLayer(layer); layer = L.tileLayer(isDark() ? OG_CONFIG.TILES_DARK : OG_CONFIG.TILES_LIGHT, { attribution: OG_CONFIG.TILES_ATTRIB, maxZoom: 19 }).addTo(map); };
    map._ogSetTiles();
    const bounds = [];
    points.forEach((l) => {
      const icon = L.divIcon({ className: "", html: `<div class="og-pin ${statusKey(l.status)}"></div>`, iconSize: [18, 18], iconAnchor: [9, 16] });
      const m = L.marker([l.lat, l.lng], { icon, title: l.title }).addTo(map);
      if (!opts.single) m.bindPopup(`<div class="map-pop">${l.photos[0] ? `<img src="${photoPath(l.photos[0])}" alt="">` : ""}<b>${esc(l.title)}</b><span>${esc(l.city)} · ${esc(l.status)}</span><a href="#property-${l.id}">View property →</a></div>`);
      bounds.push([l.lat, l.lng]);
    });
    if (bounds.length === 1) map.setView(bounds[0], opts.zoom || 15);
    else if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
    else map.setView([28.1, -82.2], 7);
    OG.maps.push(map); setTimeout(() => map.invalidateSize(), 150);
    return map;
  }
  const gmaps = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

  /* ════════════ PAGES ════════════ */

  /* Home — follows outliergroup.us: hero → skyline statement → articles → services → portfolio → brands → team → FAQ → subscribe */
  function renderHome() {
    const featured = LISTINGS.filter((l) => l.featured && !l.offMarket);
    const active = LISTINGS.filter((l) => l.status === "Available").length;
    const off = LISTINGS.filter((l) => l.offMarket).length;
    const brands = brandTiles();
    const tiles = [
      ["Consulting", "assets/img/site/svc-consulting.jpg", "#services"],
      ["", photoPath("sun-village-1"), "#portfolio"],
      ["Brokering", "assets/img/site/svc-brokering.jpg", "#portfolio"],
      ["", photoPath("cass-1325-1"), "#portfolio"],
      ["Developing", "assets/img/site/svc-developing.jpg", "#services"]
    ];
    return `
    <section class="hero">
      <div class="wrap narrow center">
        <h1 class="display-1 rise">Real estate, uncomplicated.</h1>
        <p class="lede center rise d1">The Outlier Group is a Commercial Real Estate firm that focuses on brokering investment assets in Florida.</p>
        <div class="hero-ctas rise d2">
          <a class="btn outline" href="#why-outlier">Learn More ${circleArrow}</a>
          <a class="btn primary" href="#portfolio">View Our Portfolio ${ICON.arrow}</a>
        </div>
      </div>
    </section>

    <section class="band" aria-label="Downtown Tampa skyline">
      <div class="band-media" style="background-image:url('assets/img/site/hero.jpg')"></div>
      <div class="wrap band-inner">
        <p class="band-text" data-reveal>From leasing to investment, we provide local expert guidance at every stage of your commercial real estate journey, helping you achieve your goals with clarity, confidence, and precision.</p>
      </div>
    </section>

    <section class="section"><div class="wrap">
      <div class="head-row" data-reveal><div><p class="kicker">Market Insights</p><h2 class="display-2">Articles &amp; Market Updates</h2></div><a class="btn outline small" href="#insights">View All Market Insights ${circleArrow}</a></div>
      <div class="insight-grid">${INSIGHTS.slice(0, 3).map((a, i) => insightCard(Object.assign({}, a, { title: titleWords(a.title) }), i)).join("")}</div>
    </div></section>

    <section class="section tight-top"><div class="wrap">
      <h2 class="display-2 center" data-reveal>Our Services</h2>
      <div class="tile-row">${tiles.map(([label, img, href]) => `<a class="tile${label ? "" : " photo"}" href="${href}" data-reveal><img src="${img}" alt="" loading="lazy">${label ? `<span>${label}</span>` : ""}</a>`).join("")}</div>
      <div class="center" style="margin-top:28px" data-reveal><a class="btn outline small" href="#services">How We Can Help ${circleArrow}</a></div>
    </div></section>

    <section class="section alt"><div class="wrap">
      <div class="head-row" data-reveal>
        <div><p class="kicker">Our Portfolio</p><h2 class="display-2">Available Now</h2></div>
        <div class="head-actions">
          <button class="icon-btn" type="button" data-scroll="-1" aria-label="Previous properties">${ICON.left}</button>
          <button class="icon-btn" type="button" data-scroll="1" aria-label="Next properties">${ICON.arrow}</button>
          <a class="btn outline small" href="#portfolio">View Full Portfolio ${circleArrow}</a>
        </div>
      </div>
      <div class="carousel" id="featCarousel">${featured.map(listingCard).join("")}</div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="portal-cta" data-reveal>
        <div class="portal-cta-copy">
          <p class="kicker coral">${ICON.lock} Client Portal</p>
          <h2 class="display-2">Off-market opportunities for vetted buyers &amp; investors</h2>
          <p class="lede">Tell us what you're looking for. We'll match you with properties that aren't on the open market. Sign our NDA online and your advisor sends the full package.</p>
          <div class="hero-ctas" style="justify-content:flex-start"><a class="btn coral" href="#portal">Open the Client Portal ${ICON.arrow}</a></div>
        </div>
        <ol class="portal-steps">
          <li><b>01</b><span>Share your requirements</span></li>
          <li><b>02</b><span>See your off-market matches</span></li>
          <li><b>03</b><span>Review &amp; sign the NDA</span></li>
          <li><b>04</b><span>Receive the confidential package</span></li>
        </ol>
      </div>
    </div></section>

    <section class="section tight-top brands"><div class="wrap"><p class="kicker center" data-reveal>Trusted by national &amp; local brands</p><h2 class="display-2 center" data-reveal>Brands We've Worked With</h2></div>
      <div class="marquee"><div class="brand-track">${brands}${brands.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"').replace(/<figure /g, '<figure aria-hidden="true" ')}</div></div>
      <div class="wrap center" style="margin-top:22px"><a class="text-btn" href="#why-outlier">See all ${BRANDS.length} brands →</a></div>
    </section>

    <section class="section tight-top"><div class="wrap">
      <h2 class="display-2 center" data-reveal>Our Team</h2>
      <div class="team-strip">${TEAM.map(person).join("")}</div>
      <div class="center" style="margin-top:28px" data-reveal><a class="btn outline small" href="#our-team">Meet Our Team ${circleArrow}</a></div>
    </div></section>

    <section class="section alt"><div class="wrap narrow">
      <h2 class="display-2 center" data-reveal>You have questions? We have answers.</h2>
      <div class="faq" data-reveal>${FAQ.map((f, i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary><span>${esc(f.q)}</span><i aria-hidden="true">${ICON.plus}</i></summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`).join("")}</div>
    </div></section>

    <section class="section subscribe"><div class="wrap narrow center" data-reveal>
      <h2 class="display-3">For articles, market updates and access to off-market opportunities:</h2>
      <form class="subscribe-form" id="subscribeForm" novalidate>
        <label class="sr-only" for="subEmail">Email</label>
        <input class="input" id="subEmail" name="email" type="email" placeholder="Email" required autocomplete="email">
        <button class="btn primary" type="submit">Subscribe</button>
      </form>
      <div class="form-msg" id="subMsg" hidden></div>
    </div></section>`;
  }

  const person = (t) => `<a class="person" href="#team-${t.slug}" data-reveal aria-label="${esc(t.name)}, ${esc(t.role)} — view profile"><div class="person-img"><img src="${t.img}" alt="" loading="lazy"><span class="person-go">View profile ${ICON.arrow}</span></div><div class="person-cap"><b>${esc(t.name)}</b><span>${esc(t.role)}</span></div></a>`;
  const teamBySlug = (slug) => TEAM.find((t) => t.slug === slug);
  const teamForAgent = (key) => TEAM.find((t) => t.agent === key);
  const telHref = (p) => { const d = String(p || "").replace(/\D/g, ""); return "tel:+" + (d.length === 10 ? "1" + d : d); };
  const GH_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>';
  const WEB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';
  const LI_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.02-3-1.83-3-1.83 0-2.12 1.43-2.12 2.9V21H9z"/></svg>';
  const MAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 7 8.5-7"/></svg>';
  const PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h3.5l1.5 5-2.2 1.3a12 12 0 0 0 6.9 6.9L16 14l5 1.5V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>';

  function renderTeamMember(slug) {
    const i = TEAM.findIndex((t) => t.slug === slug), t = TEAM[i];
    if (!t) return pageHead("Team member not found", "They may have moved on.") + `<div class="wrap center section tight-top"><a class="btn primary" href="#our-team">Meet Our Team</a></div>`;
    const first = t.name.split(" ")[0];
    const prev = TEAM[(i - 1 + TEAM.length) % TEAM.length], next = TEAM[(i + 1) % TEAM.length];
    const listings = t.agent && t.showListings !== false ? LISTINGS.filter((l) => l.agent === t.agent && !l.past && !l.offMarket) : [];
    const bio = t.bio.length ? t.bio.map((p) => `<p>${esc(p)}</p>`).join("") : `<p>${esc(t.name)} is a ${esc(t.role)} at The Outlier Group. To connect with ${esc(first)}, send a message below or call ${esc(COMPANY.phone)}.</p>`;
    return `<article class="member-page">
      <div class="wrap">
        <nav class="crumbs rise" aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span><a href="#our-team">Our Team</a><span>/</span><span>${esc(t.name)}</span></nav>
        <div class="profile-grid">
          <aside class="profile-side">
            <div class="profile-photo rise"><img src="${t.img}" alt="${esc(t.name)}, ${esc(t.role)}"></div>
            <div class="panel profile-contact rise d1">
              <p class="label">Contact</p>
              <a class="pc-line" href="mailto:${esc(t.email)}?subject=${encodeURIComponent("Outlier Inquiry")}">${MAIL_ICON}<span>${esc(t.email)}</span></a>
              ${t.phone ? `<a class="pc-line" href="${telHref(t.phone)}">${PHONE_ICON}<span>${esc(t.phone)}</span></a>` : `<a class="pc-line" href="${telHref(COMPANY.phone)}">${PHONE_ICON}<span>${esc(COMPANY.phone)} <small>(main office)</small></span></a>`}
              ${t.linkedin ? `<a class="pc-line" href="${esc(t.linkedin)}" target="_blank" rel="noopener">${LI_ICON}<span>LinkedIn</span></a>` : ""}
              ${t.github ? `<a class="pc-line" href="${esc(t.github)}" target="_blank" rel="noopener">${GH_ICON}<span>GitHub</span></a>` : ""}
              ${t.portfolio ? `<a class="pc-line" href="${esc(t.portfolio)}" target="_blank" rel="noopener">${WEB_ICON}<span>Portfolio</span></a>` : ""}
              <a class="btn primary block" href="#team-contact">Message ${esc(first)} ${ICON.arrow}</a>
            </div>
          </aside>
          <div class="profile-main">
            <p class="kicker rise">${esc(t.role)} · The Outlier Group</p>
            <h1 class="display-1 rise d1">${esc(t.name)}</h1>
            ${t.focus && t.focus.length ? `<div class="pills rise d2">${t.focus.map((f) => `<span class="pill plain">${esc(f)}</span>`).join("")}</div>` : ""}
            <div class="profile-bio rise d2">${bio}</div>
            ${t.facts && t.facts.length ? `<div class="panel profile-facts" data-reveal><h2 class="display-3">At a glance</h2><dl>${t.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>` : ""}
            ${listings.length ? `<section class="profile-listings" data-reveal><div class="head-row"><h2 class="display-3">Listings with ${esc(first)}</h2><a class="btn outline small" href="#portfolio">Our Portfolio ${circleArrow}</a></div><div class="listing-grid two">${listings.slice(0, 4).map(listingCard).join("")}</div></section>` : ""}
            <section class="panel profile-form" id="team-contact" data-reveal>
              <h2 class="display-3">Send ${esc(first)} a message</h2>
              <p class="muted">${t.contactName ? `${esc(t.contactName)} will receive your message and connect you with ${esc(first)}.` : `${esc(first)} will get back to you directly${t.phone ? `, or call ${esc(t.phone)}` : ""}.`}</p>
              <form class="form-grid" id="teamForm" novalidate>
                <div class="row"><div class="field"><label for="tName">Full name</label><input class="input" id="tName" name="name" required autocomplete="name"></div>
                <div class="field"><label for="tEmail">Email</label><input class="input" id="tEmail" name="email" type="email" required autocomplete="email"></div></div>
                <div class="row"><div class="field"><label for="tPhone">Phone</label><input class="input" id="tPhone" name="phone" type="tel" autocomplete="tel"></div>
                <div class="field"><label for="tGoal">I'm interested in</label><select class="input" id="tGoal" name="interest"><option>Buying</option><option>Selling</option><option>Leasing</option><option>Investing</option><option>Off-market opportunities</option><option>Something else</option></select></div></div>
                <div class="field"><label for="tMsg">Message</label><textarea class="input" id="tMsg" name="message" rows="4"></textarea></div>
                <button class="btn primary" type="submit">Send to ${esc(first)} ${ICON.arrow}</button>
                <div class="form-msg" id="teamMsg" hidden></div>
              </form>
            </section>
          </div>
        </div>
        <nav class="article-nav profile-nav" aria-label="More team members">
          <a href="#team-${prev.slug}"><span>Previous</span><b>${esc(prev.name)}</b></a>
          <a href="#team-${next.slug}" class="next"><span>Next</span><b>${esc(next.name)}</b></a>
        </nav>
      </div>
    </article>
    <section class="section tight-top"><div class="wrap"><div class="head-row"><h2 class="display-3">Meet the rest of the team</h2><a class="btn outline small" href="#our-team">Our Team ${circleArrow}</a></div>
      <div class="team-strip">${TEAM.filter((x) => x.slug !== slug).map(person).join("")}</div></div></section>`;
  }
  function wireTeamMember(slug) {
    const t = teamBySlug(slug); if (!t) return;
    const j = $('a[href="#team-contact"]'); if (j) j.addEventListener("click", (e) => { e.preventDefault(); $("#team-contact").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); setTimeout(() => $("#tName").focus(), 400); });
    wireLeadForm("teamForm", "teamMsg", "Team Member Message", () => ({ agentEmail: t.email, agentName: t.name, teamMember: t.name, role: t.role }), `Thanks — ${(t.contactName || t.name).split(" ")[0]} will be in touch shortly.`);
  }

  function renderSectors() {
    const items = SECTORS.map((s) => ({ ...s, count: s.filter ? PUBLIC_LISTINGS().filter((l) => l.type === s.filter).length : 0 }));
    return pageHead("Browse By Sector", "Here at The Outlier Group, we provide a full range of property-related services across a range of sectors – from retail and healthcare to industrial and residential – we're here to help you along on your real estate journey.") + `
    <section class="section tight-top"><div class="wrap mid">
      <h2 class="display-3 center" data-reveal>Sectors</h2>
      ${itemGrid(items, (s) => (s.count ? "#portfolio" : "#contact"))}
    </div></section>` + needsBand();
  }

  function renderServices() {
    return pageHead("Browse Our Services", "Here at The Outlier Group, we provide a full range of real estate related services – from advisory and consulting to valuation, planning, acquisition and leasing – we're here to help you along on your real estate journey.") + `
    <section class="section tight-top"><div class="wrap mid">
      <h2 class="display-3 center" data-reveal>Services</h2>
      ${itemGrid(SERVICES, () => "#contact")}
    </div></section>` + needsBand();
  }

  const brandTiles = () => BRANDS.map((b) => `<figure class="brand-tile" title="${esc(b.name)}"><img src="${b.img}" alt="${esc(b.name)}" loading="lazy" decoding="async"></figure>`).join("");
  const HISTORY = [
    ["2005", "Principal Broker & Co-Founder, Mackinley, started land acquisitions with a private firm in Central Florida."],
    ["2007", "Mackinley (Mac) obtained his real estate license and began working for Commercial Real Estate firms, specializing in retail, office, land and industrial."],
    ["2016", "After 9 years of transacting as an Advisor, Mac opened The Outlier Group, with its first office centrally located in Orlando, Florida."],
    ["2019", "Brokerage expanded to open offices in the Tampa Bay and Saint Petersburg markets."],
    ["2024", "The Outlier Group has scaled to oversee 11 talented team members in 5 Florida markets, with sights on expanding nationally."],
    ["2025", "Launched a Consulting arm to advise CRE clients on portfolio optimization, contract review, project execution and oversight."]
  ];
  function renderWhy() {
    return pageHead("Our History", "Here at The Outlier Group, we take pride in thinking outside the box. Founded in 2016, we believe in a quality over quantity approach. We vet our advisors carefully. We vet our clients too. We believe in transparency, simplicity, and working on solutions that make sense. Real estate, uncomplicated—it's that simple.") + `
    <section class="section tight-top"><div class="wrap">
      <ol class="timeline" aria-label="Our history">${HISTORY.map(([y, t], i) => `<li class="${i % 2 ? "up" : "down"}" data-reveal style="--d:${i * 70}ms"><span class="tl-year">${y}</span><span class="tl-dot" aria-hidden="true"></span><p>${esc(t)}</p></li>`).join("")}</ol>
    </div></section>
    <section class="section tight-top brands"><div class="wrap">
      <p class="kicker center" data-reveal>Our clients</p><h2 class="display-2 center" data-reveal>Brands We've Worked With</h2>
      <div class="brand-grid" data-reveal>${brandTiles()}</div>
    </div></section>
    <section class="section"><div class="wrap split">
      <div data-reveal><p class="kicker">Why Outlier?</p><h2 class="display-2">It is the David and Goliath metaphor.</h2></div>
      <div data-reveal><p class="lede">At The Outlier Group, we thrive by embodying the spirit of David, using innovative thinking and unconventional strategies to outmaneuver the outdated approach.</p>
      <p class="lede">We differentiate our strategy through a progressive blend of age old wisdom and innovation. At our core, we are consultants. We provide expertise, backed by decades of experience, education, and the quick thinking of progress in the face of status quo.</p></div>
    </div></section>
    <section class="band short" aria-label="Real estate, uncomplicated.">
      <div class="band-media" style="background-image:url('assets/img/site/article-summer.jpg');background-position:center 60%"></div>
      <div class="wrap band-inner center"><p class="band-text center" data-reveal>Real estate, uncomplicated. It's that simple.</p></div>
    </section>
    <section class="section alt"><div class="wrap mid">
      <h2 class="display-2 center" data-reveal>What We're About</h2>
      <div class="value-grid">${VALUES.map((v, i) => `<div class="value" data-reveal><span class="value-no">0${i + 1}</span><h3>${esc(v.name)}</h3><p>${esc(v.desc)}</p></div>`).join("")}</div>
    </div></section>
    <section class="section"><div class="wrap two-cta">
      <div class="cta-card" data-reveal><h3 class="display-3">Curious how we can help?</h3><a class="btn outline" href="#services">Explore Our Services ${circleArrow}</a></div>
      <div class="cta-card" data-reveal><h3 class="display-3">Real estate, uncomplicated.</h3><a class="btn primary" href="tel:1-888-966-4820">Call Us ${ICON.arrow}</a></div>
    </div></section>`;
  }

  function renderTeam() {
    return pageHead("Meet Our Team", "Founded in 2016, we celebrate entrepreneurship and encourage creativity. Through the years, we have carefully curated a brilliant team of experienced CRE industry experts. With a variety of professional backgrounds, our Outliers share one key value: excellence of heart. With that, we believe we've recruited the best of the best. We're proud of our nimble team and the exceptional talent they bring to the table.") + `
    <section class="section tight-top"><div class="wrap"><div class="team-grid">${TEAM.map(person).join("")}</div></div></section>
    <section class="section tight-top"><div class="wrap"><div class="cta-card careers" data-reveal><div><p class="kicker">Explore Careers</p><h2 class="display-3">Exploring your career options? We'd love to meet you.</h2></div><a class="btn primary" href="#careers">Become An Outlier ${ICON.arrow}</a></div></div></section>` + needsBand();
  }

  function renderContact() {
    return pageHead("Schedule A Consultation", "Whatever your needs — buying, selling, leasing, or investing — we are available to help. Call, email, or send a message and an advisor will get right back to you.") + `
    <section class="section tight-top"><div class="wrap contact-grid">
      <div class="contact-cards">
        <div class="contact-card" data-reveal><span>Call</span><b>${esc(COMPANY.phone)}</b></div>
        <div class="contact-card" data-reveal><span>Email</span><b>${esc(COMPANY.email)}</b></div>
        <div class="contact-card" data-reveal><span>Office</span><b>${esc(COMPANY.address)}</b></div>
        <div class="contact-card" data-reveal><span>Brokerage License</span><b>${esc(COMPANY.license)}</b></div>
        <a class="contact-card tenant-link" href="#tenant-portal" data-reveal><span>Applying for a space?</span><b>Start your tenant application ${ICON.arrow}</b></a>
      </div>
      <form class="panel form-grid" id="contactForm" novalidate data-reveal>
        <h3 class="display-3" style="font-size:1.8rem">Send us a message</h3>
        <div class="row"><div class="field"><label for="cName">Full name</label><input class="input" id="cName" name="name" required autocomplete="name"></div>
        <div class="field"><label for="cEmail">Email</label><input class="input" id="cEmail" name="email" type="email" required autocomplete="email"></div></div>
        <div class="row"><div class="field"><label for="cPhone">Phone</label><input class="input" id="cPhone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="cInterest">I'm interested in</label><select class="input" id="cInterest" name="interest"><option>Buying</option><option>Selling</option><option>Leasing</option><option>1031 Exchange</option><option>Financing</option><option>Valuation</option><option>Consulting</option><option>Off-market opportunities</option><option>Other</option></select></div></div>
        <div class="field"><label for="cMsg">Message</label><textarea class="input" id="cMsg" name="message" required placeholder="Tell us about the property or space you need"></textarea></div>
        <button class="btn primary block" type="submit">Send Message ${ICON.arrow}</button>
        <div class="form-msg" id="contactMsg" hidden></div>
      </form>
    </div></section>`;
  }

  /* ── Market Insights ── */
  const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const plain = (h) => String(h || "").replace(/<[^>]+>/g, "");
  /* Home "Articles & Market Updates": first letter of every word in capitals */
  const titleWords = (t) => String(t || "").replace(/(^|[\s\u2014\u2013(\/"\u201c-])(\p{Ll})/gu, (m, sep, ch) => sep + ch.toUpperCase());
  function insightCard(a, big) {
    return `<a class="insight-card${big ? " big" : ""}" href="#insight-${a.slug}" data-reveal>
      <div class="insight-img">${a.cover ? `<img src="${a.cover}" alt="" loading="lazy">` : `<div class="placeholder">${ICON.building}</div>`}<span class="pill plain">${esc(a.category)}</span></div>
      <div class="insight-body"><p class="insight-meta">${esc(fmtDate(a.date))} · ${esc(a.read)} read</p><h3>${esc(a.title)}</h3>${big ? `<p class="muted">${esc(a.excerpt)}</p>` : ""}<span class="insight-go">Read article ${ICON.arrow}</span></div>
    </a>`;
  }
  const INS = { cat: "All", q: "" };
  function renderInsights() {
    const cats = ["All", ...new Set(INSIGHTS.map((a) => a.category))];
    return pageHead("Market Insights", "Articles, market updates, and field notes from The Outlier Group on Florida commercial real estate — rates, submarkets, policy, and strategy.") + `
    <section class="section tight-top"><div class="wrap">
      <div class="featured-insight">${insightCard(INSIGHTS[0], true)}</div>
      <div class="insight-tools" data-reveal>
        <div class="chips" id="insCats" role="group" aria-label="Category">${cats.map((c) => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${INS.cat === c}">${esc(c)}<b>${c === "All" ? INSIGHTS.length : INSIGHTS.filter((a) => a.category === c).length}</b></button>`).join("")}</div>
        <div class="field"><label for="insQ" class="sr-only">Search articles</label><input class="input" id="insQ" type="search" placeholder="Search articles" value="${esc(INS.q)}"></div>
      </div>
      <div class="insight-grid" id="insGrid"></div>
    </div></section>
    ${insightCta()}`;
  }
  const insightCta = () => `<section class="section tight-top"><div class="wrap"><div class="portal-cta" data-reveal>
      <div class="portal-cta-copy"><p class="kicker">Put the insight to work</p><h2 class="display-3">Looking for your next property or ready to sell?</h2><p class="lede">Talk to an advisor about the market, or see what's available off-market in the Client Portal.</p>
      <div class="hero-ctas" style="justify-content:flex-start"><a class="btn primary" href="#contact">Schedule A Consultation ${ICON.arrow}</a><a class="btn coral-outline" href="#portal">Client Portal</a></div></div>
      <ol class="portal-steps"><li><b>01</b><span>Florida-focused market research</span></li><li><b>02</b><span>Local submarket expertise</span></li><li><b>03</b><span>Off-market access for vetted clients</span></li></ol></div></div></section>`;
  function insUpdate() {
    const q = INS.q.trim().toLowerCase();
    const list = INSIGHTS.slice(1).filter((a) => (INS.cat === "All" || a.category === INS.cat) && (!q || (a.title + " " + a.excerpt).toLowerCase().includes(q)));
    $("#insGrid").innerHTML = list.length ? list.map((a) => insightCard(a)).join("") : `<div class="empty">No articles match.</div>`;
    $$("#insGrid .insight-card").forEach((c, i) => { c.classList.add("pop"); c.style.setProperty("--d", Math.min(i, 8) * 40 + "ms"); });
    $$("#insCats .chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === INS.cat)));
  }
  function wireInsights() {
    $("#insCats").addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) { INS.cat = b.dataset.cat; insUpdate(); } });
    $("#insQ").addEventListener("input", (e) => { INS.q = e.target.value; insUpdate(); });
    insUpdate();
  }
  function renderInsight(slug) {
    const i = INSIGHTS.findIndex((x) => x.slug === slug), a = INSIGHTS[i];
    if (!a) return pageHead("Article not found", "It may have moved.") + `<div class="wrap center section tight-top"><a class="btn primary" href="#insights">All Market Insights</a></div>`;
    const body = a.blocks.map((b) => b.h ? `<h2>${b.h}</h2>` : b.p ? `<p>${b.p}</p>` : b.q ? `<blockquote>${b.q}</blockquote>` : b.img ? `<figure><img src="${b.img}" alt="" loading="lazy"></figure>` : b.ul ? `<${b.ol ? "ol" : "ul"}>${b.ul.map((x) => `<li>${x}</li>`).join("")}</${b.ol ? "ol" : "ul"}>` : "").join("");
    const related = INSIGHTS.filter((x) => x.slug !== slug && x.category === a.category).slice(0, 3);
    const prev = INSIGHTS[i + 1], next = INSIGHTS[i - 1];
    return `<article class="article-page">
      <header class="article-hero">${a.cover ? `<div class="article-hero-img" style="background-image:url('${a.cover}')"></div>` : ""}
        <div class="wrap narrow"><nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span><a href="#insights">Market Insights</a><span>/</span><span>${esc(a.category)}</span></nav>
        <h1 class="display-2 rise">${esc(a.title)}</h1>
        <p class="insight-meta rise d1">${esc(a.author)} · ${esc(fmtDate(a.date))} · ${esc(a.read)} read</p></div>
      </header>
      <div class="wrap narrow article-body" data-reveal>${body}</div>
      <div class="wrap narrow article-foot">
        <div class="author-card"><img src="assets/img/site/og-monogram.png" alt="" class="logo-mono"><div><b>${esc(a.author)}</b><span>The Outlier Group · Florida commercial real estate</span></div><a class="btn primary small" href="#contact">Talk to an advisor ${ICON.arrow}</a></div>
        <nav class="article-nav" aria-label="More articles">${prev ? `<a href="#insight-${prev.slug}"><span>Previous</span><b>${esc(prev.title)}</b></a>` : "<span></span>"}${next ? `<a href="#insight-${next.slug}" class="next"><span>Next</span><b>${esc(next.title)}</b></a>` : ""}</nav>
      </div>
    </article>
    ${related.length ? `<section class="section tight-top"><div class="wrap"><div class="head-row"><h2 class="display-3">More ${esc(a.category)}</h2><a class="btn outline small" href="#insights">All Market Insights ${circleArrow}</a></div><div class="insight-grid">${related.map((x) => insightCard(x)).join("")}</div></div></section>` : ""}
    ${insightCta()}`;
  }



  /* ── Careers ── */
  const CAR = { type: "All", ws: "All" };
  const jobBySlug = (s) => CAREERS.jobs.find((j) => j.slug === s);
  const jobCard = (j) => `<article class="job-card" data-reveal>
      <div><h2>${esc(j.title)}</h2><p class="job-tags"><span>${esc(j.jobType)}</span><span>${esc(j.workspace)}</span><span>Florida</span></p></div>
      <a class="btn outline small" href="#career-${j.slug}" aria-label="View Job: ${esc(j.title)}">View Job</a></article>`;
  function renderCareers() {
    const opt = (list, cur) => `<option value="All">All</option>` + list.map((x) => `<option${cur === x ? " selected" : ""}>${esc(x)}</option>`).join("");
    return pageHead("Careers", CAREERS.intro) + `
    <section class="section tight-top"><div class="wrap narrow">
      <form class="job-filters" id="jobFilters" data-reveal>
        <div class="field"><label for="jfType">Job Type</label><select class="input" id="jfType"><option value="All">Select Job Type</option>${opt(CAREERS.jobTypes, CAR.type)}</select></div>
        <div class="field"><label for="jfWs">Workspace</label><select class="input" id="jfWs"><option value="All">Select Workspace</option>${opt(CAREERS.workspaces, CAR.ws)}</select></div>
        <button class="btn outline" type="submit">Search Jobs</button>
      </form>
      <p class="muted small job-count" id="jobCount" aria-live="polite"></p>
      <div class="job-list" id="jobList"></div>
    </div></section>`;
  }
  function drawJobs() {
    const list = CAREERS.jobs.filter((j) => (CAR.type === "All" || j.jobType === CAR.type) && (CAR.ws === "All" || j.workspace === CAR.ws));
    $("#jobList").innerHTML = list.length ? list.map(jobCard).join("") : `<div class="empty">No jobs match.</div>`;
    $("#jobCount").textContent = `${list.length} open position${list.length === 1 ? "" : "s"} · Florida`;
    motion($("#jobList"));
  }
  function wireCareers() {
    $("#jobFilters").addEventListener("submit", (e) => { e.preventDefault(); CAR.type = $("#jfType").value; CAR.ws = $("#jfWs").value; drawJobs(); });
    drawJobs();
  }
  function renderJob(slug) {
    const j = jobBySlug(slug), C = CAREERS;
    if (!j) return pageHead("Job not found", "This position may have been filled.") + `<div class="wrap center section tight-top"><a class="btn primary" href="#careers">All Careers</a></div>`;
    const apply = `<button class="btn primary" type="button" data-apply>Apply Now</button>`;
    return `<article class="job-page">
      <div class="wrap narrow">
        <a class="back-link" href="#careers">&lt; Back</a>
        <h1 class="display-2 rise">${esc(j.title)}</h1>
        <div class="job-meta rise d1"><dl><div><dt>Job Type</dt><dd>${esc(j.jobType)}</dd></div><div><dt>Workspace</dt><dd>${esc(j.workspace)}</dd></div></dl>${apply}</div>
      </div>
      <div class="wrap narrow article-body job-body" data-reveal>
        <h2>About the Role</h2>${C.role.map((p) => `<p>${esc(p)}</p>`).join("")}
        <h2>Requirements</h2><p>${C.requirementsIntro}</p>
        <p>Responsibilities:</p><ul>${C.responsibilities.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <p>Qualifications:</p><ul>${C.qualifications.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <p>${esc(C.closing)}</p><p>${esc(C.eeo)}</p><p>${esc(C.requirement)}</p>
        <h2>About the Company</h2><p>${esc(C.company)}</p>
        <div class="job-apply-foot">${apply}</div>
      </div>
    </article>`;
  }
  function openApply(j) {
    const m = document.createElement("div");
    m.className = "modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "applyTitle");
    m.innerHTML = `<div class="modal-box narrow">
      <div class="modal-head"><div><h2 id="applyTitle">Application</h2><p>${esc(j.title)}</p></div><button class="icon-btn" type="button" data-close aria-label="Close">✕</button></div>
      <form class="modal-body form-grid" id="applyForm" novalidate>
        <div class="row"><div class="field"><label for="aFirst">First name</label><input class="input" id="aFirst" name="firstName" autocomplete="given-name"></div>
        <div class="field"><label for="aLast">Last name</label><input class="input" id="aLast" name="lastName" autocomplete="family-name"></div></div>
        <div class="row"><div class="field"><label for="aEmail">Email</label><input class="input" id="aEmail" name="email" type="email" required autocomplete="email"></div>
        <div class="field"><label for="aPhone">Phone</label><input class="input" id="aPhone" name="phone" type="tel" autocomplete="tel"></div></div>
        <div class="row"><div class="field"><label for="aPos">Position</label><select class="input" id="aPos" name="position">${CAREERS.positions.map((p) => `<option${p === j.position ? " selected" : ""}>${esc(p)}</option>`).join("")}</select></div>
        <div class="field"><label for="aStart">Start Date</label><input class="input" id="aStart" name="startDate" type="date"></div></div>
        <div class="field"><label for="aLinked">Linkedin Page</label><input class="input" id="aLinked" name="linkedin" type="url" inputmode="url" autocomplete="url"></div>
        <input type="hidden" name="name"><input type="hidden" name="interest"><input type="hidden" name="message">
        <button class="btn primary block" type="submit">Apply</button>
        <div class="form-msg" id="applyMsg" hidden></div>
      </form></div>`;
    document.body.appendChild(m);
    const close = () => { m.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) close(); });
    $("#aFirst", m).focus();
    /* Uses the existing lead form handler: no Apps Script change needed */
    const af = $("#applyForm", m), sync = () => {
      af.elements.name.value = [af.elements.firstName.value, af.elements.lastName.value].join(" ").trim();
      af.elements.interest.value = af.elements.position.value;
      af.elements.message.value = `Career Application · Position: ${af.elements.position.value} · Start Date: ${af.elements.startDate.value || "—"} · Linkedin Page: ${af.elements.linkedin.value || "—"}`;
    };
    af.addEventListener("input", sync); af.addEventListener("change", sync); af.addEventListener("submit", sync, true); sync();
    wireLeadForm("applyForm", "applyMsg", "Career Application", () => ({ job: j.title }), "Thanks — your application was sent.");
  }
  function wireJob(slug) {
    const j = jobBySlug(slug); if (!j) return;
    $$("[data-apply]").forEach((b) => b.addEventListener("click", () => openApply(j)));
  }


  /* ── Submit a Property ── */
  function renderPrivacy() {
    const li = (t) => `<li>${t}</li>`;
    return pageHead("Privacy Policy", "Here at The Outlier Group, LLC, your privacy is important to us.") + `
    <section class="section tight-top"><div class="wrap narrow article-body">
      <p>Here at The Outlier Group, LLC, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you receive SMS/MMS messages from us.</p>
      <h2>Privacy Statement</h2>
      <h3>1. What Information We Collect</h3>
      <p>We collect only the information you provide when you opt in to receive messages from us. This typically includes:</p>
      <ul>${["Your phone number", "Your email", "Your consent to receive SMS/MMS communications"].map(li).join("")}</ul>
      <h3>2. How We Use Your Information</h3>
      <p>We use your phone number to send you updates, information, or services related to our business. We will not use your information for marketing purposes without your consent.</p>
      <h3>3. Sharing Your Information</h3>
      <p>Data will not be sold or shared with third parties for promotional or marketing purposes. We do not sell, rent, or share your personal information with any third parties for marketing purposes. We may only share your information if required by law or to protect our legal rights.</p>
      <h3>4. Your Choices</h3>
      <p><b>Opt-Out:</b> You can stop receiving messages from us at any time by replying 'STOP' to any message we send.</p>
      <p><b>Help:</b> If you need assistance or have questions, reply 'HELP' to any message or contact us directly at (888) 966-4820.</p>
      <h3>5. Security</h3>
      <p>We take reasonable steps to protect your personal information from unauthorized access, disclosure, or misuse. However, no system is completely secure, so we cannot guarantee the absolute security of your information.</p>
      <h3>6. Changes to This Policy</h3>
      <p>We may update this Privacy Policy occasionally. Any changes will be posted on our website, and the new policy will be effective immediately upon posting.</p>
      <h3>7. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy or how we handle your information, please contact us at (888) 966-4820.</p>

      <h2 id="cookies">Website, Cookies &amp; Client Portal</h2>
      <p>When you use this website, the information below also applies.</p>
      <ul>${[
        "<b>Cookies and browser storage.</b> Strictly necessary storage keeps the site working: your cookie choice, a session ID, the Client Portal notice, and the status of NDA requests. <b>Preferences</b> (theme, recent portal searches, Assistant conversation) and <b>Analytics</b> (Portfolio filters, Assistant questions, brochure downloads, calculator runs) are used only if you allow them. We don't use advertising cookies.",
        "<b>Client Portal searches.</b> After you accept the portal notice, each search you run with Find My Opportunities is recorded with your selections and matching listings so an advisor can follow up.",
        "<b>Forms and NDAs.</b> Details you send through our forms, and NDAs you sign for off-market properties, are stored securely by The Outlier Group and used to respond to you and decide on access.",
        "<b>Google Analytics and Google Search Console.</b> If you allow Analytics, we use Google Analytics to understand how the site is used: pages and properties viewed, searches and filters, downloads, and form submissions, but never your name, email, phone number or message text. Google Analytics uses cookies, and Google processes this data as described in <a href=\"https://policies.google.com/technologies/partner-sites\" target=\"_blank\" rel=\"noopener\">How Google uses information from sites or apps that use its services</a>. We also use Google Search Console to see how the site appears in Google Search; it places no cookies on your device. You can withdraw your consent at any time from Cookie Preferences."
      ].map(li).join("")}</ul>
      <p><button class="btn outline small" type="button" data-cookie-prefs>Change Cookie Preferences</button></p>
      <p class="muted small">Brokerage License | CQ1052317</p>
    </div></section>`;
  }
  function renderSubmit() {
    return pageHead("Submit a Property", "Thinking about selling or leasing? Tell us about your property and an advisor will follow up with a marketing strategy and an opinion of value.") + `
    <section class="section tight-top"><div class="wrap contact-grid">
      <div class="contact-cards">
        <div class="contact-card" data-reveal><span>How we market it</span><b>Every major platform + our broker network</b></div>
        <div class="contact-card" data-reveal><span>Listing term</span><b>No fixed annual contract · cancel with 30 days' notice</b></div>
        <div class="contact-card" data-reveal><span>Prefer to talk?</span><b>${esc(COMPANY.phone)}</b></div>
      </div>
      <form class="panel form-grid" id="submitForm" novalidate data-reveal>
        <h3 class="display-3" style="font-size:1.8rem">Property details</h3>
        <div class="field"><label for="sAddr">Property address</label><input class="input" id="sAddr" name="address" required autocomplete="street-address"></div>
        <div class="row"><div class="field"><label for="sType">Property type</label><select class="input" id="sType" name="propertyType"><option>Retail</option><option>Office</option><option>Medical</option><option>Industrial</option><option>Land</option><option>Mixed Use</option><option>Multifamily</option><option>Hotel</option><option>Other</option></select></div>
        <div class="field"><label for="sGoal">I want to</label><select class="input" id="sGoal" name="goal"><option>Sell</option><option>Lease</option><option>Explore both</option><option>Get a valuation</option></select></div></div>
        <div class="row"><div class="field"><label for="sSize">Building / unit size (SF)</label><input class="input" id="sSize" name="size" inputmode="numeric"></div>
        <div class="field"><label for="sLand">Land size (acres)</label><input class="input" id="sLand" name="land" inputmode="decimal"></div></div>
        <div class="row"><div class="field"><label for="sName">Full name</label><input class="input" id="sName" name="name" required autocomplete="name"></div>
        <div class="field"><label for="sEmail">Email</label><input class="input" id="sEmail" name="email" type="email" required autocomplete="email"></div></div>
        <div class="field"><label for="sPhone">Phone</label><input class="input" id="sPhone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="sMsg">Anything else?</label><textarea class="input" id="sMsg" name="message" placeholder="Occupancy, current tenants, timing, asking price…"></textarea></div>
        <button class="btn primary block" type="submit">Submit Property ${ICON.arrow}</button>
        <div class="form-msg" id="submitMsg" hidden></div>
      </form>
    </div></section>`;
  }

  /* ── Tenant Portal: Google Form application + secure financial-document upload ──
     The application is the company's Google Form (embedded). Documents are sent to the website
     Apps Script, which saves them in a private, access-restricted Drive folder. Nothing is stored
     in the browser, in this code or in the repository, and documents are never emailed. */
  const TENANT_FORM = "https://docs.google.com/forms/d/1nOa_JBVqpEfUq6MBme78GxF7-mzyQ5cDN3zwT0JMEQ4/viewform";
  const TENANT_DOC_TYPES = ["Bank statements", "Business tax returns", "Personal tax returns", "Profit & loss / financial statements", "Business formation / license", "Photo ID", "Other"];
  const TENANT_LIMITS = { files: 10, each: 10 * 1024 * 1024, total: 25 * 1024 * 1024, ext: /\.(pdf|jpe?g|png|heic|docx?|xlsx?|csv)$/i };
  const leaseOpen = (l) => !!l && l.deal === "Lease" && !l.offMarket && /^Available/i.test(l.status || "");
  const TP = { files: [] };
  function renderTenant(id) {
    const l = byId(id), open = LISTINGS.filter(leaseOpen), sel = leaseOpen(l) ? l : null;
    TP.files = [];
    const opts = open.map((x) => `<option value="${esc(x.id)}"${sel && sel.id === x.id ? " selected" : ""}>${esc(x.title)} · ${esc(x.city)}</option>`).join("");
    return pageHead("Tenant Portal", "Complete the application, then upload your financial documents.", "Tenant Portal") + `
    <section class="section tight-top"><div class="wrap tp-wrap">
      ${sel ? `<p class="tp-for" data-reveal>Applying for <b>${esc(sel.title)}</b>, ${esc([sel.address, sel.city].filter(Boolean).join(", "))} · <a href="#property-${esc(sel.id)}">View property</a></p>` : ""}
      <div class="tp-grid">
        <div class="tp-main">
          <section class="tp-panel" id="tpApp" data-reveal>
            <h2 class="display-3">1. Tenant application</h2>
            <p class="muted">About 10 minutes. ${sel ? `Under <b>Property Location</b>, enter <b>${esc(sel.title)}</b>.` : "Under <b>Property Location</b>, enter the property you're applying for."}</p>
            <div class="tp-frame"><iframe src="${TENANT_FORM}?embedded=true" title="Tenant application form" loading="lazy">Loading…</iframe></div>
            <p class="tp-alt"><a href="${TENANT_FORM}" target="_blank" rel="noopener">Open the application in a new tab ${ICON.arrow}</a></p>
          </section>
          <form class="form-grid tp-panel" id="tenantDocs" novalidate data-reveal>
            <h2 class="display-3">2. Upload financial documents</h2>
            <p class="muted">Bank statements, tax returns and financial statements. Files are saved privately for our leasing team only.</p>
            <div class="row"><div class="field"><label for="tName">Full name</label><input class="input" id="tName" name="name" required autocomplete="name"></div>
            <div class="field"><label for="tEmail">Email</label><input class="input" id="tEmail" name="email" type="email" required autocomplete="email"></div></div>
            <div class="row"><div class="field"><label for="tPhone">Phone</label><input class="input" id="tPhone" name="phone" type="tel" autocomplete="tel"></div>
            <div class="field"><label for="tBiz">Legal business name</label><input class="input" id="tBiz" name="business" autocomplete="organization"></div></div>
            <div class="field"><label for="tProp">Property</label><select class="input" id="tProp" name="property" required><option value="">Select the property</option>${opts}<option value="other">Other / not listed</option></select></div>
            <label class="tp-drop" id="tpDrop"><input type="file" id="tFiles" multiple accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx,.xls,.xlsx,.csv"><span class="tp-drop-main">${ICON.lock} Choose files or drop them here</span><span class="tp-drop-sub">PDF, image, Word or Excel · up to ${TENANT_LIMITS.files} files · 10 MB each · 25 MB total</span></label>
            <ul class="tp-files" id="tpFiles" aria-live="polite"></ul>
            <label class="tp-consent"><input type="checkbox" id="tConsent" name="consent" required> <span>I confirm I'm authorized to share these documents and I allow The Outlier Group to review them for this lease application.</span></label>
            <button class="btn primary block" type="submit">Upload Documents Securely ${ICON.arrow}</button>
            <div class="form-msg" id="tenantMsg" hidden></div>
          </form>
        </div>
      </div>
    </div></section>`;
  }
  function wireTenant() {
    const f = $("#tenantDocs"); if (!f) return;
    const input = $("#tFiles"), list = $("#tpFiles"), drop = $("#tpDrop"), msg = $("#tenantMsg");
    const size = (n) => n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
    const guess = (n) => /bank|statement/i.test(n) ? TENANT_DOC_TYPES[0] : /tax|1120|1065|schedule\s*c/i.test(n) ? TENANT_DOC_TYPES[1] : /p&?l|profit|balance|financial/i.test(n) ? TENANT_DOC_TYPES[3] : /license|articles|formation|ein|sunbiz/i.test(n) ? TENANT_DOC_TYPES[4] : /\bid\b|passport|driver/i.test(n) ? TENANT_DOC_TYPES[5] : "";
    const show = (text, ok) => { msg.hidden = false; msg.className = "form-msg " + (ok ? "ok" : "err"); msg.textContent = text; };
    const draw = () => {
      list.innerHTML = TP.files.map((x, i) => `<li><span class="tp-fname">${esc(x.file.name)}</span><span class="tp-fsize">${size(x.file.size)}</span>
        <select class="input" data-i="${i}" aria-label="Document type for ${esc(x.file.name)}"><option value="">Document type</option>${TENANT_DOC_TYPES.map((t) => `<option${t === x.docType ? " selected" : ""}>${esc(t)}</option>`).join("")}</select>
        <button type="button" class="tp-rm" data-rm="${i}">Remove</button></li>`).join("");
      $$("select[data-i]", list).forEach((s) => s.addEventListener("change", () => { TP.files[+s.dataset.i].docType = s.value; }));
      $$("[data-rm]", list).forEach((b) => b.addEventListener("click", () => { TP.files.splice(+b.dataset.rm, 1); draw(); }));
    };
    const add = (fl) => {
      const bad = [];
      [...(fl || [])].forEach((file) => {
        if (!TENANT_LIMITS.ext.test(file.name)) bad.push(file.name + " (file type not accepted)");
        else if (file.size > TENANT_LIMITS.each) bad.push(file.name + " (over 10 MB)");
        else if (TP.files.length >= TENANT_LIMITS.files) bad.push(file.name + " (10 files at most)");
        else if (TP.files.reduce((t, x) => t + x.file.size, 0) + file.size > TENANT_LIMITS.total) bad.push(file.name + " (25 MB total limit)");
        else if (!TP.files.some((x) => x.file.name === file.name && x.file.size === file.size)) TP.files.push({ file, docType: guess(file.name) });
      });
      draw();
      if (bad.length) show("Not added: " + bad.join("; ") + ".", false); else msg.hidden = true;
    };
    input.addEventListener("change", () => { add(input.files); input.value = ""; });
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); add(e.dataTransfer && e.dataTransfer.files); });
    const read = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).replace(/^data:[^,]*,/, "")); r.onerror = () => rej(r.error); r.readAsDataURL(file); });
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(f).entries());
      const need = [];
      if (!String(v.name || "").trim()) need.push("full name");
      if (!/^\S+@\S+\.\S+$/.test(String(v.email || "").trim())) need.push("email");
      if (!v.property) need.push("property");
      if (!TP.files.length) need.push("at least one document");
      if (TP.files.some((x) => !x.docType)) need.push("a document type for each file");
      if (!$("#tConsent").checked) need.push("confirmation checkbox");
      if (need.length) { show("Please add: " + need.join(", ") + ".", false); return; }
      const btn = f.querySelector("button[type=submit]"), label = btn.innerHTML; btn.disabled = true; btn.textContent = "Uploading securely…";
      try {
        const l = byId(v.property), files = [];
        for (const x of TP.files) files.push({ name: x.file.name, type: x.file.type || "", size: x.file.size, docType: x.docType, data: await read(x.file) });
        const r = await post({ type: "tenant_docs", applicant: { name: v.name, email: v.email, phone: v.phone || "", business: v.business || "" },
          property: { id: l ? l.id : "other", title: l ? l.title : "Other / not listed", address: l ? [l.address, l.city].filter(Boolean).join(", ") : "" },
          agentEmail: l ? agentOf(l).email : "", files });
        files.length = 0;
        if (r.ok && r.confirmed && r.data && r.data.status === "ok") { show(`Thank you — ${r.data.saved} document${r.data.saved === 1 ? "" : "s"} received securely (reference ${r.data.ref}). A confirmation email is on its way and an advisor will follow up within one business day.`, true); TP.files = []; draw(); f.reset(); }
        else if (r.ok && !r.confirmed && !(r.data && r.data.status)) { show("Your documents were sent. If you don't get a confirmation email within 15 minutes, please call " + COMPANY.phone + ".", true); TP.files = []; draw(); f.reset(); }
        else show((r.data && r.data.message) || `We couldn't upload your documents. Please try again, or call ${COMPANY.phone}.`, false);
      } catch (err) { show(`We couldn't upload your documents. Please try again, or call ${COMPANY.phone}.`, false); }
      btn.disabled = false; btn.innerHTML = label;
    });
  }

  /* ── Portfolio ── */
  const PF = { q: "", status: "all", deal: "", type: "", region: "", city: "", sort: "status", view: "grid" };
  /* ── Location filter: region (North / South / East / West) → city. Used by Portfolio + Client Portal ── */
  const REGIONS = Object.keys(FL_REGIONS);
  const REGION_OF = {}; REGIONS.forEach((r) => FL_REGIONS[r].forEach((c) => (REGION_OF[c] = r)));
  const regionOf = (l) => REGION_OF[l.county] || "";
  const locCity = (l) => (l.city || "").split(",")[0].trim();
  const citiesIn = (list, region) => [...new Set(list.filter((l) => !region || regionOf(l) === region).map(locCity))].filter(Boolean).sort();
  /* <option>s for the Region select: every region is listed; a region with nothing in it is shown but can't be picked */
  function regionOpts(list, cur, anyVal, anyLabel) {
    return `<option value="${esc(anyVal)}">${esc(anyLabel)}</option>` + REGIONS.map((r) => { const n = list.filter((l) => regionOf(l) === r).length;
      return `<option value="${esc(r)}" ${cur === r ? "selected" : ""} ${n ? "" : "disabled"}>${esc(r)}${n ? "" : " (none yet)"}</option>`; }).join("");
  }
  /* <option>s for the City select: only that region's cities, or every city grouped by region */
  function cityOpts(list, region, cur, anyVal, anyLabel) {
    const o = (c) => `<option ${cur === c ? "selected" : ""}>${esc(c)}</option>`;
    const any = `<option value="${esc(anyVal)}">${esc(region ? "Any city in " + region : anyLabel)}</option>`;
    if (region) return any + citiesIn(list, region).map(o).join("");
    return any + REGIONS.map((r) => { const cs = citiesIn(list, r); return cs.length ? `<optgroup label="${esc(r)}">${cs.map(o).join("")}</optgroup>` : ""; }).join("");
  }
  const regionOfCity = (list, city) => { const l = list.find((x) => locCity(x) === city); return l ? regionOf(l) : ""; };
  const STATUS_ORDER = ["Available", "Off-Market", "Pending", "Leased", "Sold", "Past Listing"];
  const STATUS_CHIPS = [["all", "All"], ["Available", "Available"], ["Off-Market", "Off-Market"], ["Pending", "Pending"], ["Leased", "Leased"], ["Sold", "Sold"], ["Past Listing", "Past Listings"]];

  function renderPortfolio() {
    const types = [...new Set(LISTINGS.map((l) => l.type))].sort();
    return pageHead("Our Portfolio", "Here at The Outlier Group, we specialize in strategically marketing commercial real estate properties — from investment sales and corporate leasing to franchise expansion across Florida. Browse our complete inventory: available, off-market, pending, leased, sold, and past listings.") + `
    <section class="section tight-top"><div class="wrap">
      <div class="filter-panel" data-reveal>
        <div class="toolbar has-region">
          <div class="field grow"><label for="pfQ">Search</label><input class="input" id="pfQ" type="search" placeholder="Address, city, or property name" value="${esc(PF.q)}"></div>
          <div class="field"><label for="pfDeal">For</label><select class="input" id="pfDeal"><option value="">Lease or sale</option><option ${PF.deal === "Lease" ? "selected" : ""}>Lease</option><option ${PF.deal === "Sale" ? "selected" : ""}>Sale</option></select></div>
          <div class="field"><label for="pfType">Property type</label><select class="input" id="pfType"><option value="">All types</option>${types.map((t) => `<option ${PF.type === t ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></div>
                    <div class="field"><label for="pfRegion">Region</label><select class="input" id="pfRegion">${regionOpts(LISTINGS, PF.region, "", "All of Florida")}</select></div>
          <div class="field"><label for="pfCity">City</label><select class="input" id="pfCity">${cityOpts(LISTINGS, PF.region, PF.city, "", "All cities")}</select></div>
          <div class="field"><label for="pfSort">Sort</label><select class="input" id="pfSort"><option value="status">Availability</option><option value="size-desc" ${PF.sort === "size-desc" ? "selected" : ""}>Size: largest</option><option value="size-asc" ${PF.sort === "size-asc" ? "selected" : ""}>Size: smallest</option><option value="name" ${PF.sort === "name" ? "selected" : ""}>Name A–Z</option></select></div>
          <div class="field"><span class="label">View</span><div class="seg" role="group" aria-label="View"><button type="button" id="pfGrid" aria-pressed="${PF.view === "grid"}">Grid</button><button type="button" id="pfMap" aria-pressed="${PF.view === "map"}">Map</button></div></div>
        </div>
        <div class="chips" id="pfChips" role="group" aria-label="Status"></div>
      </div>
      <a class="portal-pointer" href="#portal" data-reveal>${ICON.lock}<span><b>Confidential off-market opportunities</b> appear here with a lock: their address, photos, and pricing are released only under NDA. For a personalized search that puts off-market properties first, use the Client Portal.</span><span class="pp-go">Open the Client Portal ${ICON.arrow}</span></a>
      <div class="results-meta"><span aria-live="polite" id="pfCount" class="sr-only"></span><button type="button" class="text-btn" id="pfReset">Clear filters</button></div>
      <div id="pfResults"></div>
      <div id="pfMapWrap" hidden><div class="map" id="pfMapEl"></div><p class="map-note">Pins show approximate locations.</p></div>
    </div></section>` + needsBand();
  }

  function pfFilter(ignoreStatus) {
    const q = PF.q.trim().toLowerCase();
    return LISTINGS.filter((l) => {
      if (!ignoreStatus && PF.status !== "all" && l.status !== PF.status) return false;
      if (PF.deal && l.deal !== PF.deal) return false;
      if (PF.type && l.type !== PF.type) return false;
            if (PF.region && regionOf(l) !== PF.region) return false;
      if (PF.city && locCity(l) !== PF.city) return false;
      if (q) {
        const hay = [l.title, l.address, l.city, l.region, l.type, l.typeLabel, l.headline, l.county, l.status].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }
  function pfUpdate(logIt) {
    if (!$("#pfChips")) return;
    const base = pfFilter(true);
    $("#pfChips").innerHTML = STATUS_CHIPS.map(([k, label]) => `<button type="button" class="chip" data-status="${k}" aria-pressed="${PF.status === k}">${label}</button>`).join("");
    const list = pfFilter(false); const sfn = (l) => l.sfNum || 0;
    if (PF.sort === "status") list.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
    if (PF.sort === "size-desc") list.sort((a, b) => sfn(b) - sfn(a));
    if (PF.sort === "size-asc") list.sort((a, b) => sfn(a) - sfn(b));
    if (PF.sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
    $("#pfCount").innerHTML = `<b>${list.length}</b> ${list.length === 1 ? "property" : "properties"}`;
    $("#pfResults").innerHTML = list.length ? `<div class="listing-grid">${list.map(listingCard).join("")}</div>` : `<div class="empty">No properties match these filters.</div>`;
    const showMap = PF.view === "map";
    $("#pfResults").hidden = showMap; $("#pfMapWrap").hidden = !showMap;
    if (showMap) { const el = $("#pfMapEl"); if (el._map) { el._map.remove(); OG.maps = OG.maps.filter((m) => m !== el._map); } el.innerHTML = ""; el._map = mapFor(el, list.filter((l) => l.lat)); }
    $$("#pfResults .card").forEach((c, i) => { if (!reduceMotion) { c.classList.add("pop"); c.style.setProperty("--d", Math.min(i, 8) * 40 + "ms"); } });
    if (logIt) logToSheet("Listings_Filters", { Timestamp: new Date().toISOString(), SessionID: SESSION_ID, Search: PF.q, Status: PF.status, Deal: PF.deal, Type: PF.type, Region: PF.region, City: PF.city, Sort: PF.sort, ResultCount: list.length, Results: list.map((l) => l.title).join(" | ") });  }
  function wirePortfolio() {
    let t; const logSoon = () => { clearTimeout(t); t = setTimeout(() => pfUpdate(true), 1200); };
    $("#pfQ").addEventListener("input", (e) => { PF.q = e.target.value; pfUpdate(false); logSoon(); });
    const cityList = () => { $("#pfCity").innerHTML = cityOpts(LISTINGS, PF.region, PF.city, "", "All cities"); };
    $("#pfRegion").addEventListener("change", (e) => { PF.region = e.target.value; PF.city = ""; cityList(); pfUpdate(true); });
    $("#pfCity").addEventListener("change", (e) => { PF.city = e.target.value; if (PF.city && !PF.region) { PF.region = regionOfCity(LISTINGS, PF.city); $("#pfRegion").value = PF.region; cityList(); } pfUpdate(true); });
    [["#pfDeal", "deal"], ["#pfType", "type"], ["#pfSort", "sort"]].forEach(([s, k]) => $(s).addEventListener("change", (e) => { PF[k] = e.target.value; pfUpdate(true); }));    $("#pfChips").addEventListener("click", (e) => { const b = e.target.closest("[data-status]"); if (b) { PF.status = b.dataset.status; pfUpdate(true); } });
    const view = (v) => { PF.view = v; $("#pfGrid").setAttribute("aria-pressed", String(v === "grid")); $("#pfMap").setAttribute("aria-pressed", String(v === "map")); pfUpdate(false); };
    $("#pfGrid").addEventListener("click", () => view("grid")); $("#pfMap").addEventListener("click", () => view("map"));
    $("#pfReset").addEventListener("click", () => { Object.assign(PF, { q: "", status: "all", deal: "", type: "", region: "", city: "", sort: "status" }); $("#pfQ").value = ""; ["#pfDeal", "#pfType", "#pfRegion"].forEach((s) => ($(s).value = "")); cityList(); $("#pfSort").value = "status"; pfUpdate(false); });
    pfUpdate(false);
  }

  /* ── Property pages ── */
  function renderProperty(id) {
    const l = byId(id);
    if (!l) return pageHead("Property not found", "It may have been removed, or the link is out of date.") + `<div class="wrap center section tight-top"><a class="btn primary" href="#portfolio">Back to the portfolio</a></div>`;
    return l.offMarket ? renderOffMarket(l) : renderPublic(l);
  }
  function gallery(l, locked) {
    const ph = l.photos.length ? l.photos : [null];
    const main = ph[0] ? `<img id="galMain" src="${photoPath(ph[0])}" alt="${esc(locked ? "" : l.title)}">` : `<div class="placeholder big">${ICON.building}</div>`;
    const thumbs = !locked && ph.length > 1 ? `<div class="thumbs">${ph.slice(0, 5).map((p, i) => `<button type="button" class="thumb" data-src="${photoPath(p)}" aria-current="${i === 0}" aria-label="Show photo ${i + 1}"><img src="${photoPath(p)}" alt="" loading="lazy"></button>`).join("")}</div>` : "";
    return `<div class="gallery"><div class="gallery-main${locked ? " locked" : ""}">${main}${locked ? `<div class="lock-overlay"><div>${ICON.lock}<b>Confidential</b><small>Photos are released after the NDA</small></div></div>` : ""}</div>${thumbs}</div>`;
  }
  const keySpecs = (l) => `<dl class="key-specs">
      <div><dt>Unit # &amp; Space Available (SF)</dt><dd>${esc(l.space || "—")}</dd></div>
      <div><dt>Building Size</dt><dd>${esc(l.building || "—")}</dd></div>
      <div><dt>Unit Size (SF)</dt><dd>${esc(l.unit || "—")}</dd></div>
    </dl>`;
  function agentPanel(l, inner) {
    const a = agentOf(l);
    return `<div class="panel">
      ${(() => { const tm = teamForAgent(l.agent); const inner = `${a.img ? `<img src="${a.img}" alt="">` : `<div class="avatar"></div>`}<div><b>${esc(a.name)}</b><span>${esc(a.role)}</span>${tm ? `<small class="agent-link">View profile →</small>` : ""}</div>`; return tm ? `<a class="agent" href="#team-${tm.slug}">${inner}</a>` : `<div class="agent">${inner}</div>`; })()}
      <div class="contact-lines"><div><span>Phone</span><b>${esc(a.phone)}</b></div><div><span>Email</span><b>${esc(a.email)}</b></div></div>
      ${inner || ""}
    </div>`;
  }
  /* Listing facts grouped for the property page (only values already in the listing data are shown) */
  const FACT_PRICE = /rent|expense|price|cap rate|term|lease format|^unit /i, FACT_AREA = /traffic|population|income/i;
  const factRows = (rows) => `<table class="fact-table"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>`;
  function renderPublic(l) {
    const full = (l.address && !l.city.startsWith(l.address) ? l.address + ", " : "") + l.city;
    const all = (l.facts || []).filter(([k, v]) => k && v);
    const priceFacts = all.filter(([k]) => FACT_PRICE.test(k)), areaFacts = all.filter(([k]) => !FACT_PRICE.test(k) && FACT_AREA.test(k)), charFacts = all.filter(([k]) => !FACT_PRICE.test(k) && !FACT_AREA.test(k));
    const adv = agentOf(l);
    const details = [["Property", l.title], ["Address", full], ["County", l.county ? l.county + " County" : ""], ["Region", regionOf(l)], ["Property Type", typeLabel(l)], ["Offered For", l.deal],
      ["Status", l.status], ["Availability", l.statusNote && l.statusNote !== l.status ? l.statusNote : ""], ["Space Available", l.space], ["Building Size", l.building], ["Unit Size", l.unit],
      ["Listing Advisor", adv && adv.name ? adv.name + (adv.role ? " · " + adv.role : "") : ""]].filter(([, v]) => v && v !== "—");
    const related = LISTINGS.filter((x) => x.id !== l.id && !x.offMarket && x.status === "Available" && (x.type === l.type || x.county === l.county)).slice(0, 3);
    const closed = ["Leased", "Sold", "Past Listing"].includes(l.status);
    return `<section class="section prop"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span><a href="#portfolio">Our Portfolio</a><span>/</span><span>${esc(l.title)}</span></nav>
      <div class="prop-head">
        <div class="rise">
          <div class="pills">${statusPill(l)}${pill(typeLabel(l), "plain")}${pill("For " + l.deal, "plain")}</div>
          <h1 class="display-2">${esc(l.title)}</h1>
          <p class="addr">${ICON.pin}<span>${esc(full)}</span></p>
          ${l.headline ? `<p class="headline">${esc(l.headline)}${l.subhead ? " — " + esc(l.subhead) : ""}</p>` : ""}
        </div>
        <div class="head-actions rise d1">${l.flyer ? `<a class="btn outline" href="${esc(l.flyer)}" target="_blank" rel="noopener" data-brochure="${l.id}" data-flyer="1">Download Property Flyer ${ICON.arrow}</a>` : `<button class="btn outline" type="button" data-brochure="${l.id}">Download Property Brochure ${ICON.arrow}</button>`}${leaseOpen(l) ? `<a class="btn outline" href="#tenant-portal-${l.id}">Apply to Lease ${ICON.arrow}</a>` : ""}<a class="btn outline" href="#calculator-${l.id}">Run the Numbers</a><a class="btn primary" href="#inquire" id="jumpInquire">Inquire About This Property ${ICON.arrow}</a></div>
      </div>
      ${gallery(l, false)}
      <div class="prop-layout">
        <div>
          ${keySpecs(l)}
          <div class="prop-block" data-reveal><h2>Overview</h2><p>${esc(l.desc)}</p></div>
          ${l.highlights && l.highlights.length ? `<div class="prop-block" data-reveal><h2>Property Highlights</h2><ul class="highlights">${l.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></div>` : ""}
          <div class="prop-block" data-reveal><h2>Property Details</h2>${factRows(details)}</div>
          ${charFacts.length ? `<div class="prop-block" data-reveal><h2>Property Characteristics</h2>${factRows(charFacts)}</div>` : ""}
          <div class="prop-block" data-reveal><h2>${l.deal === "Sale" ? "Sale Details" : "Pricing &amp; Lease Terms"}</h2>
            ${priceFacts.length ? factRows(priceFacts) : `<p class="muted small">Pricing and terms are available from the listing advisor.</p>`}
          </div>
          ${areaFacts.length ? `<div class="prop-block" data-reveal><h2>Area &amp; Traffic</h2>${factRows(areaFacts)}</div>` : ""}
          <div class="prop-block" data-reveal><h2>Location</h2>
            ${l.lat ? `<div class="map small" id="propMap"></div>` : ""}
            <p class="map-note"><span>${esc(full)}</span><a class="text-link" href="${gmaps(full)}" target="_blank" rel="noopener">Open in Google Maps ↗</a></p>
          </div>
        </div>
        <aside class="side" id="inquire">
          ${agentPanel(l, `<form class="form-grid" id="inquireForm" novalidate>
              <h3>${closed ? "Ask about similar space" : "Inquire about this property"}</h3>
              <div class="field"><label for="iName">Full name</label><input class="input" id="iName" name="name" required autocomplete="name"></div>
              <div class="field"><label for="iEmail">Email</label><input class="input" id="iEmail" name="email" type="email" required autocomplete="email"></div>
              <div class="field"><label for="iPhone">Phone</label><input class="input" id="iPhone" name="phone" type="tel" autocomplete="tel"></div>
              <div class="field"><label for="iMsg">Message</label><textarea class="input" id="iMsg" name="message">${esc(closed ? `I'm interested in space similar to ${l.title.replace(/\.$/, "")}.` : `I'm interested in ${l.title.replace(/\.$/, "")}. Please send me more information.`)}</textarea></div>
              <button class="btn primary block" type="submit">Send Inquiry ${ICON.arrow}</button>
              <div class="form-msg" id="inquireMsg" hidden></div>
            </form>`)}
        </aside>
      </div>
      ${related.length ? `<div class="related"><div class="head-row"><h2 class="display-3">Similar properties</h2><a class="btn outline small" href="#portfolio">Full portfolio ${circleArrow}</a></div><div class="listing-grid">${related.map(listingCard).join("")}</div></div>` : ""}
    </div></section>`;
  }
  function renderOffMarket(l) {
    const acc = accessOf(l.id), nda = ndaOf(l.id);
    if (acc && acc.details) return renderApproved(l, acc);
    const denied = nda && nda.status === "denied";
    const gateInner = denied ? `<h3>Access not approved</h3><p>Our team reviewed your request for this property and wasn't able to approve access at this time. Your advisor can walk you through other options.</p><a class="btn outline block" href="#contact">Talk to an advisor</a>`
      : nda ? `<h3>NDA received — pending review</h3><p>You signed the NDA on ${esc(new Date(nda.at).toLocaleDateString())}. Our team is reviewing your request. When it's approved you'll get an email at <b>${esc(nda.email)}</b> with a link that unlocks this page and the full brochure.</p>
          <div class="status-line"><span class="dot pending"></span><span>Status: <b id="ndaStatus">Pending approval</b></span></div>
          <button class="btn outline block" type="button" id="checkStatus" data-ref="${esc(nda.ref)}">Check approval status</button>`
      : `<h3>Request access</h3><p>Three quick steps, about two minutes:</p>
          <ol><li>View and review The Outlier Group NDA</li><li>Enter your details and sign</li><li>Our team reviews and approves your request</li></ol>
          <button class="btn coral block" type="button" data-nda="${l.id}">View &amp; Sign NDA ${ICON.arrow}</button>`;
    return `<section class="section prop"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span><a href="#portal">Client Portal</a><span>/</span><span>Confidential listing</span></nav>
      <div class="prop-head">
        <div class="rise">
          <div class="pills">${statusPill(l)}${pill(typeLabel(l), "plain")}${pill("For " + l.deal, "plain")}${accessPill(l)}</div>
          <h1 class="display-2">${esc(l.title)}</h1>
          <p class="addr">${ICON.pin}<span>${esc(l.region)} · Address released after NDA approval</span></p>
        </div>
        <div class="head-actions rise d1"><button class="btn outline" type="button" data-brochure="${l.id}">Download Confidential Teaser ${ICON.arrow}</button>${nda ? "" : `<button class="btn coral" type="button" data-nda="${l.id}">Request Access ${ICON.arrow}</button>`}</div>
      </div>
      ${gallery(l, true)}
      <div class="prop-layout">
        <div>
          ${keySpecs(l)}
          <div class="prop-block" data-reveal><h2>Overview</h2><p>${esc(l.teaser)}</p>
            <p>This opportunity is offered off-market to qualified buyers and investors. The exact address, photos, pricing, financials, and the full property brochure unlock after you sign The Outlier Group's NDA and our team approves your request.</p></div>
          <div class="prop-block" data-reveal><h2>Confidential Details</h2>
            <table class="fact-table"><tbody>
              <tr><th scope="row">Property Type</th><td>${esc(typeLabel(l))}</td></tr>
              <tr><th scope="row">Offered For</th><td>${esc(l.deal)}</td></tr>
              <tr><th scope="row">Market</th><td>${esc(l.region)}</td></tr>
              <tr><th scope="row">Address</th><td><span class="redacted">1234 Confidential Street</span></td></tr>
              <tr><th scope="row">${l.deal === "Sale" ? "Asking Price" : "Asking Rent"}</th><td><span class="redacted">$0,000,000</span></td></tr>
              <tr><th scope="row">Financials &amp; Due Diligence</th><td><span class="redacted">Provided after approval</span></td></tr>
            </tbody></table></div>
          <div class="prop-block" data-reveal><h2>How access works</h2>
            <ol class="flow-steps"><li class="${nda ? "done" : "now"}"><b>1</b><span>View &amp; sign the NDA</span></li><li class="${denied ? "denied" : nda ? "now" : ""}"><b>2</b><span>Our team reviews your request</span></li><li><b>3</b><span>Approval email unlocks this page</span></li><li><b>4</b><span>Download the full brochure</span></li></ol></div>
        </div>
        <aside class="side">
          <div class="gate"><span class="gate-icon">${ICON.lock}</span>${gateInner}</div>
          ${window.OG_PREVIEW && nda && !denied ? `<div class="panel preview-sim"><p class="kicker">Preview only</p><p class="muted small">On the live site our team gets an email with Approve / Deny buttons. Simulate the decision:</p><div class="hero-ctas" style="justify-content:flex-start;margin-top:10px"><button class="btn primary small" type="button" data-sim="approve">Approve</button><button class="btn outline small" type="button" data-sim="deny">Deny</button></div></div>` : ""}
          ${agentPanel(l)}
        </aside>
      </div>
    </div></section>`;
  }
  function renderApproved(l, acc) {
    const d = acc.details || {};
    const full = [d.address, d.city].filter(Boolean).join(", ");
    const facts = [["Property Type", typeLabel(l)], ["Offered For", l.deal], ["Status", "Off-Market · access approved"], ...(d.facts || [])];
    const L2 = Object.assign({}, l, { lat: d.lat, lng: d.lng });
    return `<section class="section prop"><div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span><a href="#portal">Client Portal</a><span>/</span><span>${esc(d.name || l.title)}</span></nav>
      <div class="approved-bar rise">${ICON.check}<span>Access approved on ${esc(new Date(acc.at).toLocaleDateString())} · Confidential under your signed NDA (ref ${esc(acc.ref)})</span></div>
      <div class="prop-head">
        <div class="rise">
          <div class="pills">${statusPill(l)}${pill(typeLabel(l), "plain")}${pill("For " + l.deal, "plain")}${pill("Access approved", "s-available")}</div>
          <h1 class="display-2">${esc(d.name || l.title)}</h1>
          <p class="addr">${ICON.pin}<span>${esc(full || l.region)}</span></p>
        </div>
        <div class="head-actions rise d1"><a class="btn outline" href="#calculator-${l.id}">Run the Numbers</a><button class="btn primary" type="button" data-brochure="${l.id}">Download Property Brochure ${ICON.arrow}</button></div>
      </div>
      ${gallery(l, false)}
      <div class="prop-layout">
        <div>
          ${keySpecs(Object.assign({}, l, d))}
          <div class="prop-block" data-reveal><h2>Overview</h2><p>${esc(d.desc || l.teaser)}</p></div>
          ${d.highlights && d.highlights.length ? `<div class="prop-block" data-reveal><h2>Property Highlights</h2><ul class="highlights">${d.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></div>` : ""}
          <div class="prop-block" data-reveal><h2>${l.deal === "Sale" ? "Sale Details" : "Pricing &amp; Lease Terms"}</h2><table class="fact-table"><tbody>${facts.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table></div>
          <div class="prop-block" data-reveal><h2>Location</h2>${d.lat ? `<div class="map small" id="propMap"></div>` : ""}<p class="map-note"><span>${esc(full)}</span>${full ? `<a class="text-link" href="${gmaps(full)}" target="_blank" rel="noopener">Open in Google Maps ↗</a>` : ""}</p></div>
        </div>
        <aside class="side" id="inquire">
          ${agentPanel(l, `<form class="form-grid" id="inquireForm" novalidate>
            <h3>Next steps with your advisor</h3>
            <div class="field"><label for="iName">Full name</label><input class="input" id="iName" name="name" required autocomplete="name"></div>
            <div class="field"><label for="iEmail">Email</label><input class="input" id="iEmail" name="email" type="email" required autocomplete="email"></div>
            <div class="field"><label for="iMsg">Message</label><textarea class="input" id="iMsg" name="message">I've reviewed ${esc(d.name || l.title)} and would like to schedule a tour / request financials.</textarea></div>
            <button class="btn primary block" type="submit">Send to ${esc(agentOf(l).name)} ${ICON.arrow}</button>
            <div class="form-msg" id="inquireMsg" hidden></div></form>`)}
        </aside>
      </div>
    </div></section>`;
  }
  function wireProperty(id) {
    const l = byId(id); if (!l) return;
    $$(".thumb").forEach((b) => b.addEventListener("click", () => {
      const m = $("#galMain"); m.classList.add("swap"); setTimeout(() => { m.src = b.dataset.src; m.classList.remove("swap"); }, 160);
      $$(".thumb").forEach((x) => x.setAttribute("aria-current", String(x === b)));
    }));
    const j = $("#jumpInquire"); if (j) j.addEventListener("click", (e) => { e.preventDefault(); $("#inquire").scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(() => $("#iName") && $("#iName").focus({ preventScroll: true }), 450); });
    if (!l.offMarket && l.lat) mapFor($("#propMap"), [l], { single: true, zoom: 15 });
    const acc = accessOf(l.id);
    if (l.offMarket && acc && acc.details && acc.details.lat) mapFor($("#propMap"), [Object.assign({}, l, { lat: acc.details.lat, lng: acc.details.lng })], { single: true, zoom: 15 });
    $$("button[data-brochure]").forEach((b) => b.addEventListener("click", () => OG.brochure(l, l.offMarket && acc ? acc.details : null, b)));
    const chk = $("#checkStatus");
    if (chk) chk.addEventListener("click", async () => {
      chk.disabled = true; chk.textContent = "Checking…";
      const r = await getJSON({ action: "status", ref: chk.dataset.ref });
      chk.disabled = false; chk.textContent = "Check approval status";
      if (!r || r.status !== "ok") { OG.toast("Couldn't reach the approval service. Try again shortly."); return; }
      if (r.nda === "Approved") { $("#ndaStatus").textContent = "Approved — open the access link we emailed you"; }
      else if (r.nda === "Denied") { setNda(l.id, { status: "denied" }); route(); }
      else $("#ndaStatus").textContent = "Pending approval";
    });
    $$("[data-sim]").forEach((b) => b.addEventListener("click", async () => {
      const n = ndaOf(l.id); if (!n) return;
      if (b.dataset.sim === "approve") { const r = await getJSON({ action: "access", ref: n.ref, token: "preview", propertyId: l.id }); if (r && r.status === "approved") { setAccess(l.id, { ref: n.ref, token: "preview", details: r.details, at: new Date().toISOString() }); setNda(l.id, { status: "approved" }); OG.toast("Approved — the property is unlocked"); } }
      else { setNda(l.id, { status: "denied" }); OG.toast("Denied — access stays restricted"); }
      route();
    }));
    wireLeadForm("inquireForm", "inquireMsg", "Listing Inquiry", () => ({ listingId: l.id, listingTitle: l.title, agentEmail: agentOf(l).email, agentName: agentOf(l).name }), `Thanks — ${agentOf(l).name} will be in touch shortly.`);
  }

  /* ── Client Portal: Filters (left) + Portfolio Intelligence (right) → Find My Opportunities → Results ── */
  const PICON = {
    buyer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M10 20v-5h4v5"/></svg>',
    investor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V5M16 20v-7M22 20H2"/><path d="m4 8 6-4 6 6 5-4"/></svg>',
    tenant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg>',
    landlord: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/></svg>',
    developer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M3 9h18"/></svg>'
  };
  const SIZE_BANDS = [["Any size", null], ["Under 5,000 SF", [0, 5000]], ["5,000 – 15,000 SF", [5000, 15000]], ["15,000 – 50,000 SF", [15000, 50000]], ["50,000+ SF", [50000, 1e12]]];
  const BUDGETS = { Sale: ["Any budget", "Under $500K", "$500K – $1M", "$1M – $5M", "$5M+"], Lease: ["Any budget", "Under $3,000 / mo", "$3,000 – $7,500 / mo", "$7,500 – $15,000 / mo", "$15,000+ / mo"] };
  const TIMINGS = ["Not sure yet", "ASAP", "1 – 3 months", "3 – 6 months", "6+ months"];
  const C = { c1: "var(--c1)", c2: "var(--c2)", c3: "var(--c3)", c4: "var(--c4)" };
  const DEFAULT_F = () => ({ budget: "Any budget", region: "Anywhere in Florida", city: "Any city", location: "Anywhere in Florida", timing: "Not sure yet", type: "Any type", size: "Any size" });
  const PORTAL = { profile: CLIENT_PROFILES[0].key, f: DEFAULT_F(), searched: false, results: [], matchSet: [], view: "you", stats: null, lastSearch: null };
  const portalBase = () => LISTINGS.filter((l) => !l.past);   // same property data as Our Portfolio
  const cityOf = (l) => (l.city || "").split(",")[0].trim();
  const profileOf = () => CLIENT_PROFILES.find((p) => p.key === PORTAL.profile) || CLIENT_PROFILES[0];
  const dealOf = () => profileOf().deal;
  const sizeBand = (label) => (SIZE_BANDS.find((b) => b[0] === label) || [0, null])[1];
  const isDefault = () => JSON.stringify(PORTAL.f) === JSON.stringify(Object.assign(DEFAULT_F(), { budget: PORTAL.f.budget }));
  const OPEN = (l) => l.offMarket || l.status === "Available" || l.status === "Pending";   // opportunities (not leased/sold)

  /* Fit score (0–99): building type 30 · location 25 · size 20 · deal 20 · availability 5 */
  function fitScore(l) {
    const f = PORTAL.f; let s = 0;
    s += f.type === "Any type" ? 20 : l.type === f.type ? 30 : 0;
      if (f.city !== "Any city") {   // a specific city: exact city, then same county, then same region
      if (cityOf(l) === f.city) s += 25;
      else { const ref = portalBase().find((x) => cityOf(x) === f.city); if (ref && ref.county && ref.county === l.county) s += 12; else if (f.region !== "Anywhere in Florida" && regionOf(l) === f.region) s += 6; }
    } else if (f.region === "Anywhere in Florida") s += 17;
    else if (regionOf(l) === f.region) s += 25;
    const band = sizeBand(f.size);
    if (!band) s += 13; else if (!l.sfNum) s += 8; else if (l.sfNum >= band[0] && l.sfNum < band[1]) s += 20; else if (l.sfNum >= band[0] * 0.5 && l.sfNum < band[1] * 1.5) s += 8;
    s += l.deal === dealOf() ? 20 : 0;
    s += l.offMarket || l.status === "Available" ? 5 : l.status === "Pending" ? 2 : 0;
    if (PORTAL.profile === "developer" && (l.type === "Land" || l.type === "Mixed Use")) s = Math.min(99, s + 6);
    return Math.max(1, Math.min(99, s));
  }
  /* Results always lead with confidential off-market opportunities (NDA), then matching on-market properties (no NDA). */
  function computeMatches() {
    const scored = portalBase().map((l) => ({ l, s: fitScore(l) }));
    PORTAL.matchSet = scored.filter((x) => x.s >= 40).map((x) => x.l);
    const bySc = (a, b) => b.s - a.s;
    let off = scored.filter((x) => x.l.offMarket && x.s >= 40).sort(bySc);
    PORTAL.offClosest = !off.length;
    if (!off.length) off = scored.filter((x) => x.l.offMarket).sort(bySc).slice(0, 3);   // always show off-market options first
    const on = scored.filter((x) => !x.l.offMarket && OPEN(x.l) && x.s >= 40).sort(bySc).slice(0, 6);
    PORTAL.closest = PORTAL.offClosest && !on.length;
    PORTAL.offCount = off.length; PORTAL.onCount = on.length;
    return off.concat(on);
  }

  function renderPortal() {
    const base = portalBase();
    const types = ["Any type", ...[...new Set(base.map((l) => l.type))].sort()];
    const sel = (id, label, icon, opts, key) => `<div class="field"><label for="${id}">${icon}${label}</label><select class="input" id="${id}" data-f="${key}">${opts.map((o) => `<option ${PORTAL.f[key] === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
    const ic = (p) => `<svg class="f-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
    return pageHead("Client Portal", "A personalized property search built around confidential off-market opportunities. Tell us who you are and what you need, press Find My Opportunities, and we'll show matching off-market properties first, followed by on-market options from our portfolio.") + `
    <section class="section tight-top"><div class="wrap">
      <div class="portal-scope" data-reveal><span class="pill s-off-market">${ICON.lock} Off-market first</span><p><b>${OFF_MARKET_LISTINGS().length} confidential off-market opportunities</b> are available only through the Client Portal. Their details are released after our team approves your signed NDA. Matching on-market properties are shown after them and don't require an NDA. For the complete inventory, see <a href="#portfolio">Our Portfolio</a>.</p></div>
      <nav class="portal-tabs" aria-label="Client Portal"><a href="#portal" aria-current="page">Find Opportunities</a><a href="#calculator">Investment Calculator</a><a href="#tenant-portal">Tenant Portal</a></nav>
      <ol class="stepper" aria-label="How the portal works"><li class="on"><b>1</b>Your needs</li><li class="on"><b>2</b>Requirements</li><li id="stepResults"><b>3</b>Matches: off-market first</li><li><b>4</b>Request access (NDA for off-market)</li></ol>

      <div class="portal-layout">
        <div class="panel portal-filters" data-reveal>
          <div class="pf-toggle-row">
            <button type="button" class="pf-toggle" id="pfToggle" aria-expanded="${PORTAL.filtersOpen ? "true" : "false"}" aria-controls="pfPanel">${ICON.filter}<span>Filters</span><b class="pf-count" id="pfCount2" hidden></b><svg class="pf-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
            <p class="pf-summary muted small" id="pfSummary" aria-live="polite"></p>
          </div>
          <div class="pf-panel" id="pfPanel" ${PORTAL.filtersOpen ? "" : "hidden"}>
          <div class="pf-cols">
            <div class="pf-who"><h3 class="pf-title">I am a…</h3>
              <div class="profile-cards" id="profiles" role="radiogroup" aria-label="Client type">${CLIENT_PROFILES.map((p) => `<button type="button" class="profile-card" role="radio" data-profile="${p.key}" aria-checked="${PORTAL.profile === p.key}"><span class="pc-ic">${PICON[p.key] || ""}</span><span><b>${esc(p.type)}</b><small>${esc(p.need)}</small></span></button>`).join("")}</div>
            </div>
            <div class="pf-req"><h3 class="pf-title">Your Requirements</h3>
              <div class="pf-grid" id="pfFilters">
                <div class="field" id="fBudgetWrap"></div>
                                <div class="field"><label for="fRegion">${ic('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>')}Region</label><select class="input" id="fRegion" data-f="region">${regionOpts(base, PORTAL.f.region, "Anywhere in Florida", "Anywhere in Florida")}</select></div>
                <div class="field"><label for="fCity">${ic('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>')}City</label><select class="input" id="fCity" data-f="city">${cityOpts(base, PORTAL.f.region === "Anywhere in Florida" ? "" : PORTAL.f.region, PORTAL.f.city, "Any city", "Any city")}</select></div>
                ${sel("fTiming", "Timing", ic('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'), TIMINGS, "timing")}
                ${sel("fType", "Type of Building", ic('<path d="M4 21V5l8-2v18M12 8l8 2v11M3 21h18"/>'), types, "type")}
                ${sel("fSize", "Size", ic('<path d="M4 20 20 4M4 20h16M4 20V4"/>'), SIZE_BANDS.map((b) => b[0]), "size")}
              </div>
            </div>
          </div>
          </div>
          <button class="btn primary block find-btn" type="button" id="findBtn">${ICON.compass}Find My Opportunities ${ICON.arrow}</button>
          <div class="pf-foot"><span class="muted small" id="pfSaved" aria-live="polite">Each search is saved so your advisor can follow up.</span><button type="button" class="text-btn" id="pfClear">Reset</button></div>
          <div class="trust-row"><span>${ICON.lock}<b>Trusted Partner</b><small>Confidential &amp; professional</small></span><span>${ICON.compass}<b>Data-Driven</b><small>Smarter decisions</small></span><span>${ICON.pin}<b>Local Expertise</b><small>Florida &amp; beyond</small></span></div>
        </div>

        <aside class="panel intel" aria-labelledby="intelTitle" data-reveal>
          <div class="viz-head"><h3 id="intelTitle">Portfolio Intelligence</h3><span class="pill plain" id="intelScope">All properties</span></div>
          <div class="intel-kpis" id="kpis"></div>
          <div class="intel-block"><p class="label">Properties by type</p><div id="vType"></div></div>
          <div class="intel-block"><p class="label">Top locations</p><div id="vCity"></div></div>
          <div class="intel-block"><p class="label">Listing size distribution</p><div id="vSize"></div></div>
          <div class="intel-block"><p class="label">Off-market vs. on-market</p><div id="vStatus"></div></div>
          <div class="intel-block"><p class="label">Your off-market access</p><div id="vMarket"></div></div>
          <div class="intel-help"><b>Not sure what you need?</b><span>Our team can help you find the right opportunities.</span>
            <div class="intel-help-cta"><button class="btn small outline" type="button" data-ask="How can you help me find a property?">Ask Outlier</button><a class="btn small outline" href="#calculator">Run the numbers</a></div></div>
        </aside>
      </div>

      <div class="results-head" id="resultsTop"><div><h2 class="display-3"><span id="omTitle">Your Matching Opportunities</span> <span class="muted-serif" id="omCount"></span></h2><p class="muted" id="omSub">Choose your requirements, then press <b>Find My Opportunities</b>.</p></div>
        <button class="btn primary small" type="button" id="sendBtn" hidden>Get These Sent to You ${ICON.arrow}</button></div>
      <div id="matches"><div class="empty-results">${ICON.lock}<p>Your matches will appear here, with confidential off-market opportunities first.</p></div></div>
      ${alertBand()}
      <div class="panel viz activity" data-reveal>
        <div class="viz-head"><div><h3>Search activity &amp; trends</h3><span class="muted small" id="actSub">Your searches in this browser</span></div>
          <div class="seg" role="group" aria-label="Activity scope"><button type="button" data-scope="you" aria-pressed="true">You</button><button type="button" data-scope="all" aria-pressed="false" id="scopeAll" disabled title="Available on the live site">All visitors</button></div></div>
        <div class="act-grid">
          <div><p class="label">Searches over the last 14 days</p><div id="vTrend"></div></div>
          <div><p class="label">Most-selected building types</p><div id="vTopType"></div></div>
          <div><p class="label">Most-selected locations</p><div id="vTopLoc"></div></div>
          <div><p class="label">Most-selected size ranges</p><div id="vTopSize"></div></div>
        </div>
        <div class="recent"><p class="label">Your recent searches</p><div class="table-scroll"><table class="fact-table recent-table" id="vRecent"></table></div></div>
      </div>
    </div></section>`;
  }

  function budgetField() {
    const deal = dealOf() === "Lease" ? "Lease" : "Sale";
    const opts = BUDGETS[deal]; if (!opts.includes(PORTAL.f.budget)) PORTAL.f.budget = opts[0];
    const label = deal === "Lease" ? "Budget (monthly)" : "Budget";
    $("#fBudgetWrap").innerHTML = `<label for="fBudget"><svg class="f-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.5-.9-1.5-1.4-2.6-1.4-1.5 0-2.6.8-2.6 2 0 2.8 5.4 1.4 5.4 4.3 0 1.2-1.2 2.1-2.8 2.1-1.2 0-2.3-.6-2.8-1.6M12 6v1.8M12 16.2V18"/></svg>${label}</label><select class="input" id="fBudget" data-f="budget">${opts.map((o) => `<option ${PORTAL.f.budget === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
  }

  function history() { return store.get("og-search-history", []) || []; }
  function tally(arr) { const m = {}; arr.forEach((v) => { if (v && !/^Any|^Anywhere|^Not sure/.test(v)) m[v] = (m[v] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value })); }
  function days14(list) {
    const out = []; const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10); out.push({ key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), short: d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }), value: 0 }); }
    list.forEach((h) => { const k = String(h.ts || "").slice(0, 10); const o = out.find((x) => x.key === k); if (o) o.value += 1; });
    return out;
  }
  function drawActivity() {
    if (!$("#vTrend")) return;
    const H = history();
    if (PORTAL.view === "all" && PORTAL.stats) {
      const s = PORTAL.stats;
      $("#actSub").textContent = `All visitors · ${OGCharts.fmt(s.total || 0)} searches logged`;
      OGCharts.columns($("#vTrend"), days14([]).map((d) => ({ ...d, value: (s.byDay || {})[d.key] || 0 })), { label: "Searches per day, all visitors" });
      const top = (o) => Object.entries(o || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value }));
      OGCharts.bars($("#vTopType"), top(s.types), { unit: "searches" }); OGCharts.bars($("#vTopLoc"), top(s.locations), { unit: "searches" }); OGCharts.bars($("#vTopSize"), top(s.sizes), { unit: "searches" });
    } else {
      $("#actSub").textContent = H.length ? `Your ${H.length} ${H.length === 1 ? "search" : "searches"} in this browser` : "Your searches appear here after you press Find My Opportunities";
      OGCharts.columns($("#vTrend"), days14(H), { label: "Your searches per day" });
      OGCharts.bars($("#vTopType"), tally(H.map((h) => h.type)), { unit: "searches", empty: "Pick a building type and search to start tracking." });
      OGCharts.bars($("#vTopLoc"), tally(H.map((h) => h.location)), { unit: "searches", empty: "Pick a location and search to start tracking." });
      OGCharts.bars($("#vTopSize"), tally(H.map((h) => h.size)), { unit: "searches", empty: "Pick a size and search to start tracking." });
    }
    const rec = H.slice(-6).reverse();
    $("#vRecent").innerHTML = rec.length ? `<thead><tr><th scope="col">When</th><th scope="col">I am a</th><th scope="col">Requirements</th><th scope="col">Matches</th></tr></thead><tbody>${rec.map((h) => `<tr><td>${esc(new Date(h.ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }))}</td><td>${esc(h.profile)}</td><td>${esc([h.budget, h.location, h.timing, h.type, h.size].filter((x) => x && !/^Any|^Anywhere|^Not sure/.test(x)).join(" · ") || "All properties")}</td><td>${h.count}</td></tr>`).join("")}</tbody>` : `<tbody><tr><td class="muted">No searches yet.</td></tr></tbody>`;
  }

  /* Right-hand analytics. Before any change: the whole inventory. After: the current match set. */
  function drawIntel() {
    if (!$("#kpis")) return;
    const all = portalBase();
    const live = PORTAL.searched || !isDefault();
    const set = live ? PORTAL.matchSet : all;
    const opps = set.filter(OPEN), offS = set.filter((l) => l.offMarket), onS = opps.filter((l) => !l.offMarket);
    $("#intelScope").textContent = !live ? `All properties · ${all.length}` : PORTAL.searched && PORTAL.fresh ? `Your search · ${opps.length} matches` : `Live preview · ${opps.length} matches`;
    const sf = opps.reduce((a, l) => a + (l.sfNum || 0), 0);
    const approved = offS.filter((l) => accessOf(l.id)).length;
    $("#kpis").innerHTML = [
      ["Off-market matches", offS.length, "hl"], ["On-market matches", onS.length], ["Total SF", OGCharts.fmt(sf)], ["Available now", onS.filter((l) => l.status === "Available").length]
    ].map(([k, v, c]) => `<div class="kpi${c ? " " + c : ""}"><span class="label">${k}</span><b>${v}</b></div>`).join("");
    const byType = {}; opps.forEach((l) => (byType[l.type] = (byType[l.type] || 0) + 1));
    const tE = Object.entries(byType).sort((a, b) => b[1] - a[1]); const top3 = tE.slice(0, 3), rest = tE.slice(3).reduce((a, x) => a + x[1], 0);
    const colors = [C.c1, C.c2, C.c3, C.c4];
    OGCharts.donut($("#vType"), top3.map(([label, value], i) => ({ label, value, color: colors[i] })).concat(rest ? [{ label: "Other", value: rest, color: colors[3] }] : []), { center: "properties", label: "Matching properties by type" });
    const byCity = {}; opps.forEach((l) => { const c = cityOf(l); byCity[c] = (byCity[c] || 0) + 1; });
    OGCharts.bars($("#vCity"), Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value })), { unit: "properties", empty: "No properties for these requirements." });
    OGCharts.bars($("#vSize"), SIZE_BANDS.slice(1).map(([label, b]) => ({ label: label.replace(" SF", ""), value: opps.filter((l) => l.sfNum && l.sfNum >= b[0] && l.sfNum < b[1]).length })), { unit: "properties" });
    OGCharts.split($("#vStatus"), { label: "Off-market", value: offS.length, color: C.c2 }, { label: "On-market", value: onS.length, color: C.c1 });
    OGCharts.split($("#vMarket"), { label: "Access approved", value: approved, color: C.c3 }, { label: "NDA required", value: offS.length - approved, color: C.c2 });
  }


  function oppCard({ l, s }, i) {
    const acc = accessOf(l.id), off = !!l.offMarket;
    const loc = off ? (l.region || cityOf(l) + ", FL") : [l.address, l.city].filter(Boolean).join(", ");
    const cta = off ? (acc ? `<a class="btn outline small" href="#property-${l.id}">View details ${ICON.arrow}</a>` : `<a class="btn coral small" href="#property-${l.id}">${ICON.lock} Request access</a>`)
      : `<a class="btn outline small" href="#property-${l.id}">View property ${ICON.arrow}</a>`;
    return `<article class="opp${off ? " is-off" : ""} pop" style="--d:${i * 45}ms">
        <div class="opp-media ${off && !acc ? "locked" : ""}">${imgTag(l.photos && l.photos[0], "")}${off && !acc ? `<div class="lock-overlay"><div>${ICON.lock}</div></div>` : ""}</div>
        <div class="opp-body"><span class="mk ${off ? "off" : "on"}">${off ? "Off market" : "On market"}</span> ${off ? accessPill(l) || `<span class="pill plain">NDA required</span>` : `<span class="pill plain">No NDA needed</span>`}
          <h3><a href="#property-${l.id}">${esc(l.title)}</a></h3>
          <p class="card-loc">${ICON.pin}<span>${esc(loc)}</span></p>
          <p class="opp-meta">${esc([l.space || (l.sfNum ? OGCharts.fmt(l.sfNum) + " SF" : ""), typeLabel(l), "For " + l.deal, off ? "" : l.status].filter(Boolean).join(" · "))}</p></div>
        <div class="ring" style="--s:${s}" role="img" aria-label="${s}% match"><b>${s}%</b><span>match</span></div>
        ${cta}
      </article>`;
  }
  function drawResults(ranked) {
    const off = ranked.filter((x) => x.l.offMarket), on = ranked.filter((x) => !x.l.offMarket);
    const exactOff = PORTAL.offClosest ? 0 : off.length;
    $("#omCount").textContent = `— ${exactOff} off-market · ${on.length} on-market`;
    $("#omSub").innerHTML = "Confidential off-market opportunities come first. Their address, photos, and pricing unlock after your NDA is approved. On-market properties follow and are open to everyone.";
    $("#sendBtn").hidden = !ranked.length;
    $("#stepResults").classList.add("on");
    $("#matches").innerHTML = `
      <section class="res-group res-off" aria-labelledby="resOffH">
        <div class="res-head"><h3 id="resOffH">${ICON.lock} Off-Market Opportunities <span>${PORTAL.offClosest ? "closest fits" : off.length + (off.length === 1 ? " match" : " matches")}</span></h3>
          <p>${PORTAL.offClosest ? "No off-market property matches every requirement right now. These are the closest fits, and new off-market deals come in regularly. <a href=\"#contact\">Tell an advisor</a> what you need." : "Available only through the Client Portal. Select <b>Request access</b> to view and sign the NDA."}</p></div>
        ${off.map(oppCard).join("")}
      </section>
      <section class="res-group res-on" aria-labelledby="resOnH">
        <div class="res-head"><h3 id="resOnH">Also Available On-Market <span>${on.length} ${on.length === 1 ? "match" : "matches"}</span></h3>
          <p>Publicly listed properties from <a href="#portfolio">Our Portfolio</a>. No NDA needed.</p></div>
        ${on.length ? on.map((x, i) => oppCard(x, i + off.length)).join("") : `<div class="empty-results small">${ICON.compass}<p>No on-market properties fit these requirements right now.</p><a class="btn outline small" href="#portfolio">Browse Our Portfolio</a></div>`}
      </section>`;
  }

  /* Find My Opportunities: show results, refresh analytics, save one new row per search */
  function runSearch() {
    if (!store.get("og-portal-consent")) { showConsent(runSearch); return; }
    const ranked = computeMatches();
    PORTAL.results = ranked; PORTAL.searched = true; PORTAL.fresh = true;
    drawResults(ranked); drawIntel();
    const p = profileOf(), ts = new Date().toISOString(), searchId = makeId("SRCH");
    const rec = { ts, profile: p.type, budget: PORTAL.f.budget, location: PORTAL.f.location, timing: PORTAL.f.timing, type: PORTAL.f.type, size: PORTAL.f.size, count: ranked.length };
    const H = history(); H.push(rec); store.set("og-search-history", H.slice(-200));
    PORTAL.lastSearch = { searchId, profile: p.type, answers: { ...PORTAL.f }, results: ranked.map(({ l, s }) => ({ id: l.id, title: l.title, score: s })), ts };
    const rows = ranked.map(({ l, s }) => ({
      "property name": l.title, "location": l.offMarket ? (l.region || cityOf(l)) : [l.address, l.city].filter(Boolean).join(", "), "status": l.offMarket ? "Off-market" : (l.statusNote || l.status),
      "Agent": agentOf(l).name, "Unit # & Space Available (SF)": l.space, "Building Size:": l.building, "Property Type": typeLabel(l), "Unit Size (SF):": l.unit,
      "Listing ID": l.id, "Deal": l.deal, "Match %": s
    }));
    PORTAL.n = (PORTAL.n || 0) + 1;
    const offN = ranked.filter((x) => x.l.offMarket).length, w = window.innerWidth;
    post({ type: "search", search: {
      "Timestamp": ts, "Search ID": searchId, "Session ID": SESSION_ID, "Search # (this visit)": PORTAL.n,
      "User Type": p.type, "Looking To": p.deal === "Lease" ? "Lease" : "Buy", "Budget": rec.budget, "Region": PORTAL.f.region, "Location": rec.location, "Timing": rec.timing, "Building Type": rec.type, "Size": rec.size,
      "Match Count": ranked.length - (PORTAL.offClosest ? offN : 0), "Off-Market Matches": PORTAL.offClosest ? 0 : offN, "On-Market Matches": ranked.length - offN, "Result Type": PORTAL.offClosest ? "Off-market: closest fits (no exact match)" : "Off-market matches first",
      "Total Matching SF": ranked.reduce((a, x) => a + (x.l.sfNum || 0), 0),
      "Top Match": ranked[0] ? ranked[0].l.title : "", "Top Match %": ranked[0] ? ranked[0].s : "",
      "Matching Properties": ranked.map((x) => `${x.l.title} (${x.s}%)`).join(" | ") || "(no matches)",
      "Matching Listing IDs": ranked.map((x) => x.l.id).join(", "),
      "Portal Consent": (store.get("og-portal-consent") || {}).at ? "Accepted " + store.get("og-portal-consent").at : "Accepted",
      "Device": w < 760 ? "Mobile" : w < 1100 ? "Tablet" : "Desktop", "Page": location.href.split("#")[0] + "#portal"
    }, listings: rows }).then((r) => { const el = $("#pfSaved"); if (el) el.textContent = r.ok ? "Search saved · " + new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Couldn't save this search — results are still shown."; });
    drawActivity();
    const top = $("#resultsTop"); if (top) top.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  /* Filters open/close behind the Filters button; the filter controls and their logic are unchanged */
  function pfSummaryText() {
    const f = PORTAL.f, d = DEFAULT_F(), picks = ["budget", "region", "city", "timing", "type", "size"].filter((k) => f[k] && f[k] !== d[k]).map((k) => f[k]);
    return { count: picks.length, text: [profileOf().type].concat(picks).join(" · ") };
  }
  function drawFilterSummary() {
    const el = $("#pfSummary"), n = $("#pfCount2"); if (!el) return;
    const s = pfSummaryText(); el.textContent = s.text + (s.count ? "" : " · Any requirements");
    n.hidden = !s.count; n.textContent = s.count;
  }
  function wireFilterToggle() {
    const b = $("#pfToggle"), panel = $("#pfPanel"); if (!b || !panel) return;
    const set = (open) => { PORTAL.filtersOpen = open; panel.hidden = !open; b.setAttribute("aria-expanded", String(open)); $(".portal-filters").classList.toggle("is-open", open); };
    b.addEventListener("click", () => { const open = panel.hidden; set(open); if (open) { const first = panel.querySelector("[aria-checked=true], select"); if (first) first.focus({ preventScroll: true }); } });
    set(!!PORTAL.filtersOpen);
    ["change", "click"].forEach((ev) => $(".portal-filters").addEventListener(ev, () => setTimeout(drawFilterSummary, 0)));
    drawFilterSummary();
  }
  function wirePortal() {
    if (!store.get("og-portal-consent")) showConsent();
    budgetField();
    const changed = () => { PORTAL.fresh = false; PORTAL.matchSet = portalBase().filter((l) => fitScore(l) >= 40); drawIntel(); const s = $("#pfSaved"); if (s && PORTAL.searched) s.textContent = "Requirements changed — press Find My Opportunities to update your results."; };
    /* Region → City: choosing a region narrows the city list; choosing a city first also sets its region */
    const f = () => PORTAL.f, anyR = "Anywhere in Florida";
    const cityList = () => { $("#fCity").innerHTML = cityOpts(portalBase(), f().region === anyR ? "" : f().region, f().city, "Any city", "Any city"); };
    const syncLoc = () => { f().location = f().city !== "Any city" ? f().city : f().region; };
    $("#pfFilters").addEventListener("change", (e) => {
      const s = e.target.closest("[data-f]"); if (!s) return; PORTAL.f[s.dataset.f] = s.value;
      if (s.dataset.f === "region") { f().city = "Any city"; cityList(); }
      if (s.dataset.f === "city" && f().city !== "Any city" && f().region === anyR) { f().region = regionOfCity(portalBase(), f().city) || anyR; $("#fRegion").value = f().region; cityList(); }
      if (s.dataset.f === "region" || s.dataset.f === "city") syncLoc();
      changed();
    });
    $("#profiles").addEventListener("click", (e) => {
      const b = e.target.closest("[data-profile]"); if (!b) return;
      PORTAL.profile = b.dataset.profile; $$("#profiles [data-profile]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      if (PORTAL.profile === "developer" && PORTAL.f.type === "Any type" && portalBase().some((l) => l.type === "Land")) { PORTAL.f.type = "Land"; $("#fType").value = "Land"; }
      budgetField(); changed();
    });
    $("#profiles").addEventListener("keydown", (e) => {
      if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return; e.preventDefault();
      const bs = $$("#profiles [data-profile]"), i = bs.indexOf(document.activeElement), n = bs[(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
    });
    $("#findBtn").addEventListener("click", runSearch);
    wireFilterToggle();


    $("#sendBtn").addEventListener("click", openLeadModal);
        wireAlertBand();
    $("#pfClear").addEventListener("click", () => { PORTAL.f = DEFAULT_F(); ["#fRegion", "#fTiming", "#fType", "#fSize"].forEach((sel) => ($(sel).selectedIndex = 0)); cityList(); budgetField(); changed(); });
    $$("[data-scope]").forEach((b) => b.addEventListener("click", () => { if (b.disabled) return; PORTAL.view = b.dataset.scope; $$("[data-scope]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); drawActivity(); }));
    $$("[data-ask]").forEach((b) => b.addEventListener("click", () => OG.openAssistant && OG.openAssistant(b.dataset.ask)));
    if (!window.OG_PREVIEW) getJSON({ action: "stats" }).then((s) => { if (s && s.status === "ok") { PORTAL.stats = s; const a = $("#scopeAll"); if (a) { a.disabled = false; a.title = ""; } } });
    PORTAL.matchSet = portalBase().filter((l) => fitScore(l) >= 40);
    drawIntel(); drawActivity();
    if (PORTAL.searched) { drawResults(computeMatches()); }
  }

  function showConsent(then) {
    if ($("#portalConsent")) return;
    const box = document.createElement("div");
    box.className = "modal"; box.id = "portalConsent"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "consentTitle"); box.dataset.locked = "1";
    box.innerHTML = `<div class="modal-box narrow"><div class="modal-body">
      <p class="kicker">Client Portal / Privacy</p>
      <h2 class="display-3" id="consentTitle">Before You Find Your Opportunities</h2>
      <p class="muted">By continuing, you agree that The Outlier Group may capture your Client Portal search activity — including the requirements you select and the opportunities returned — so the team can understand your request and follow up when you ask to receive results.</p>
      <div class="consent-note">We only start the Client Portal tracking after you choose <b>Accept &amp; Continue</b>. Your consent, search activity, matching results, and any contact information you submit are stored in the connected activity log.</div>
      <div class="consent-actions"><a class="btn outline" href="#home" id="consentNo">Leave Portal</a><button class="btn primary" type="button" id="consentYes">Accept &amp; Continue ${ICON.arrow}</button></div>
    </div></div>`;
    document.body.appendChild(box); $("#consentYes", box).focus();
    $("#consentYes", box).addEventListener("click", () => { const c = { at: new Date().toISOString(), sessionId: SESSION_ID }; store.set("og-portal-consent", c); box.remove(); logToSheet("Client_Portal_Consent", { ConsentID: makeId("CON"), SessionID: SESSION_ID, Timestamp: c.at, Consent: "Accepted", Source: "Client Portal" }); if (typeof then === "function") then(); });
    $("#consentNo", box).addEventListener("click", () => box.remove());
  }

  /* ── Outlier Investment Calculator (from outliergroup.us/oic, extended with financing and projected returns) ── */
  const CALC_DEFAULT = { leaseType: "NNN", price: 1500000, income: 135000, vacancy: 5, taxes: 22000, insurance: 9000, cam: 12000, other: 4000, down: 30, rate: 7, amort: 25, closing: 3, hold: 5, growth: 3, appreciation: 3, selling: 5 };
  const CALC = { v: { ...CALC_DEFAULT }, listing: null };
  const money = (n, d = 0) => (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (n) => (isFinite(n) ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%" : "—");
  const num = (s) => { const v = parseFloat(String(s == null ? "" : s).replace(/[^0-9.\-]/g, "")); return isFinite(v) ? v : 0; };
  function calcPrefill(l) {
    const v = { ...CALC_DEFAULT }, facts = Object.fromEntries((l.facts || []).map((f) => [f[0], f[1]]));
    const psf = (k) => { const m = String(facts[k] || "").match(/\$([\d,.]+)\s*PSF/i); return m ? num(m[1]) : 0; };
    const sf = l.sfNum || 0;
    if (facts["Asking Price"]) v.price = num(facts["Asking Price"]);
    if (facts["Annual Rent"]) v.income = num(facts["Annual Rent"]);
    else if (psf("Base Rent") && sf) v.income = Math.round(psf("Base Rent") * sf);
    else if (facts["Monthly Rent"]) v.income = num(facts["Monthly Rent"]) * 12;
    const nnn = psf("NNN Expense") || psf("NNN or CAM Expense");
    if (nnn && sf) { v.cam = Math.round(nnn * sf); v.taxes = 0; v.insurance = 0; v.other = 0; }
    if (facts["Cap Rate"] && !facts["Asking Price"]) { const c = num(facts["Cap Rate"]); if (c) v.price = Math.round(v.income * (1 - v.vacancy / 100) / (c / 100)); }
    if (/gross/i.test(facts["Lease Format"] || "")) v.leaseType = /modified/i.test(facts["Lease Format"]) ? "Modified Gross" : "Gross";
    return v;
  }
  function irr(flows) {
    const npv = (r) => flows.reduce((a, c, t) => a + c / Math.pow(1 + r, t), 0);
    let lo = -0.99, hi = 5; if (npv(lo) * npv(hi) > 0) return NaN;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid; }
    return (lo + hi) / 2;
  }
  function calcRun(v) {
    const effectiveIncome = v.income * (1 - v.vacancy / 100);
    const totalExpenses = v.taxes + v.insurance + v.cam + v.other;
    const landlord = v.leaseType === "NNN" ? 0 : v.leaseType === "Modified Gross" ? v.taxes + v.insurance : totalExpenses;
    const noi = effectiveIncome - landlord;
    const cap = v.price > 0 ? (noi / v.price) * 100 : 0;
    const downAmt = v.price * v.down / 100, closingAmt = v.price * v.closing / 100, loan = Math.max(0, v.price - downAmt);
    const r = v.rate / 100 / 12, n = Math.max(1, v.amort) * 12;
    const pmt = loan <= 0 ? 0 : r === 0 ? loan / n : loan * r / (1 - Math.pow(1 + r, -n));
    const ds = pmt * 12, invest = downAmt + closingAmt;
    const bal = (months) => loan <= 0 ? 0 : r === 0 ? Math.max(0, loan - pmt * months) : loan * Math.pow(1 + r, months) - pmt * (Math.pow(1 + r, months) - 1) / r;
    const cf = noi - ds, coc = invest > 0 ? (cf / invest) * 100 : 0, dscr = ds > 0 ? noi / ds : Infinity;
    const H = Math.max(1, Math.min(30, Math.round(v.hold))), g = v.growth / 100, a = v.appreciation / 100;
    const years = [];
    for (let t = 1; t <= H; t++) {
      const f = Math.pow(1 + g, t - 1), noiT = noi * f, cfT = noiT - ds, value = v.price * Math.pow(1 + a, t), b = bal(t * 12);
      years.push({ t, noi: noiT, ds, cf: cfT, value, bal: b, equity: value - b });
    }
    const last = years[years.length - 1], salePrice = last.value, net = salePrice * (1 - v.selling / 100) - last.bal;
    const totalCF = years.reduce((s, y) => s + y.cf, 0), profit = totalCF + net - invest;
    const flows = [-invest, ...years.map((y, i) => y.cf + (i === years.length - 1 ? net : 0))];
    const IRR = invest > 0 ? irr(flows) * 100 : NaN, multiple = invest > 0 ? (totalCF + net) / invest : NaN;
    return { effectiveIncome, totalExpenses, landlord, noi, cap, downAmt, closingAmt, loan, ds, invest, cf, coc, dscr, years, salePrice, net, totalCF, profit, totalRoi: invest > 0 ? profit / invest * 100 : NaN, IRR, multiple, H };
  }

  function renderCalc(id) {
    const l = id ? byId(id) : null; CALC.listing = l;
    CALC.v = l ? calcPrefill(l) : { ...CALC_DEFAULT };
    const V = CALC.v;
    const inp = (k, label, hint, unit) => `<div class="field"><label for="c_${k}">${label}${hint ? ` <span class="tip" tabindex="0" data-tip="${esc(hint)}">?</span>` : ""}</label><div class="affix ${unit === "$" ? "pre" : "post"}"><span>${unit}</span><input class="input" id="c_${k}" data-c="${k}" inputmode="decimal" value="${unit === "$" ? Math.round(V[k]).toLocaleString("en-US") : V[k]}"></div></div>`;
    return pageHead("Outlier Investment Calculator", "Quickly calculate Net Operating Income (NOI) and Capitalization Rate (CAP Rate), then add financing to see total investment, cash flow, ROI, and projected returns.") + `
    <section class="section tight-top"><div class="wrap">
      <nav class="portal-tabs" aria-label="Client Portal"><a href="#portal">Find Opportunities</a><a href="#calculator" aria-current="page">Investment Calculator</a><a href="#tenant-portal">Tenant Portal</a></nav>
      ${l ? `<div class="calc-for panel">${imgTag(l.photos && l.photos[0], "")}<div><p class="kicker">Running the numbers for</p><h2>${esc(l.title)}</h2><p class="muted small">${esc(l.offMarket ? l.region || "" : l.city)} · ${esc(l.space || "")} · Prefilled from published terms where available. Replace any value with your own assumptions.</p></div><a class="btn outline small" href="#property-${l.id}">Back to property</a></div>` : `<p class="muted calc-intro">The figures below are an example. Replace them with your own numbers and results update as you type.</p>`}
      <div class="calc-layout">
        <form class="panel calc-form" id="calcForm" novalidate>
          <h3>Property Inputs</h3>
          <div class="field"><label for="c_leaseType">Lease Type <span class="tip" tabindex="0" data-tip="NNN: tenant pays all expenses. Modified Gross: tenant pays CAM only. Gross: landlord pays all expenses.">?</span></label>
            <div class="seg" id="c_leaseType" role="radiogroup" aria-label="Lease type">${["NNN", "Modified Gross", "Gross"].map((t) => `<button type="button" role="radio" data-lease="${t}" aria-checked="${V.leaseType === t}">${t}</button>`).join("")}</div></div>
          <div class="calc-grid">
            ${inp("price", "Purchase Price", "Total cost to acquire the property.", "$")}
            ${inp("income", "Rental Income ($/yr)", "Expected total rent collected annually.", "$")}
            ${inp("vacancy", "Vacancy Rate", "Estimated percentage of time the property is not leased.", "%")}
            ${inp("taxes", "Taxes ($/yr)", "", "$")}
            ${inp("insurance", "Insurance ($/yr)", "", "$")}
            ${inp("cam", "CAM ($/yr)", "Common area maintenance.", "$")}
            ${inp("other", "Other Expenses ($/yr)", "", "$")}
          </div>
          <h3>Financing &amp; Growth</h3>
          <div class="calc-grid">
            ${inp("down", "Down Payment", "Share of the purchase price paid in cash.", "%")}
            ${inp("rate", "Interest Rate", "", "%")}
            ${inp("amort", "Amortization", "Loan term used to calculate payments.", "yrs")}
            ${inp("closing", "Closing Costs", "As a percent of the purchase price.", "%")}
            ${inp("hold", "Hold Period", "How long you plan to own the property.", "yrs")}
            ${inp("growth", "Annual Rent Growth", "", "%")}
            ${inp("appreciation", "Annual Appreciation", "", "%")}
            ${inp("selling", "Selling Costs", "Commissions and costs when you sell.", "%")}
          </div>
          <div class="calc-actions"><button class="btn primary" type="submit">Calculate ${ICON.arrow}</button><button class="text-btn" type="button" id="calcReset">Reset</button></div>
        </form>
        <div class="calc-results" aria-live="polite">
          <div class="panel calc-key"><h3>Key Results</h3><div class="calc-kv" id="cKey"></div></div>
          <div class="panel"><h3>Returns</h3><div class="calc-tiles" id="cRet"></div></div>
          <div class="panel"><div class="viz-head"><h3>Projected Returns</h3><span class="muted small" id="cHold"></span></div><div class="calc-tiles" id="cProj"></div>
            <p class="label" style="margin-top:18px">Equity by year ($K)</p><div id="cChart"></div>
            <div class="table-scroll"><table class="fact-table calc-table" id="cTable"></table></div></div>
          <div class="panel calc-cta"><div><b>Want an advisor to underwrite this deal?</b><span class="muted small">We'll pressure-test the assumptions with real market comps.</span></div><a class="btn primary small" href="#contact">Talk to an advisor ${ICON.arrow}</a></div>
        </div>
      </div>
      <details class="panel calc-help"><summary>How to use this calculator &amp; key terms</summary>
        <p>This tool helps commercial real estate investors and agents quickly evaluate property value using CAP Rate and NOI. Fill out the inputs on the left and view your results on the right.</p>
        <ul><li><b>Lease Type:</b> NNN means tenant pays all expenses. Modified Gross means tenant pays CAM only. Gross means landlord pays all expenses.</li><li><b>Rental Income:</b> Expected total rent collected annually.</li><li><b>Vacancy Rate:</b> Estimated percentage of time the property is not leased.</li><li><b>Taxes, Insurance, CAM, Other:</b> Annual operating expenses paid by the landlord.</li><li><b>Purchase Price:</b> Total cost to acquire the property.</li></ul>
        <ul><li><b>Total Income:</b> Adjusted rent after vacancy loss.</li><li><b>Total Expenses:</b> Sum of operating costs provided.</li><li><b>NOI (Net Operating Income):</b> Income − Expenses. It's the profit before financing.</li><li><b>CAP Rate:</b> NOI ÷ Purchase Price. A common metric for investment comparison.</li><li><b>Cash-on-Cash ROI:</b> Annual cash flow after debt service ÷ total cash invested.</li><li><b>DSCR:</b> NOI ÷ annual debt service. Lenders typically look for 1.25× or higher.</li><li><b>IRR:</b> The annualized return over the hold period, including the sale.</li></ul>
        <p class="muted small">© The Outlier Group – For informational purposes only. Not financial advice.</p>
      </details>
    </div></section>`;
  }
  function drawCalc() {
    const v = CALC.v, R = calcRun(v);
    const kv = (k, val, note) => `<div><span>${k}</span><b>${val}</b>${note ? `<small>${note}</small>` : ""}</div>`;
    $("#cKey").innerHTML = kv("Total Income", money(R.effectiveIncome, 2), "after vacancy") + kv("Total Expenses", money(R.totalExpenses, 2), v.leaseType === "NNN" ? "reimbursed by tenant (NNN)" : v.leaseType === "Modified Gross" ? `landlord pays ${money(R.landlord)} (taxes + insurance)` : "paid by landlord") + kv("NOI", money(R.noi, 2)) + kv("CAP Rate", pct(R.cap));
    const tile = (k, val, cls) => `<div class="ctile ${cls || ""}"><span>${k}</span><b>${val}</b></div>`;
    $("#cRet").innerHTML = tile("Total Investment", money(R.invest)) + tile("Loan Amount", money(R.loan)) + tile("Annual Debt Service", money(R.ds)) + tile("Annual Cash Flow", money(R.cf), R.cf < 0 ? "neg" : "pos") + tile("Monthly Cash Flow", money(R.cf / 12), R.cf < 0 ? "neg" : "") + tile("Cash-on-Cash ROI", pct(R.coc), R.coc < 0 ? "neg" : "pos") + tile("DSCR", isFinite(R.dscr) ? R.dscr.toFixed(2) + "×" : "No debt", isFinite(R.dscr) && R.dscr < 1.25 ? "neg" : "");
    $("#cHold").textContent = `${R.H}-year hold`;
    $("#cProj").innerHTML = tile("Projected Sale Price", money(R.salePrice)) + tile("Net Sale Proceeds", money(R.net)) + tile("Total Cash Flow", money(R.totalCF)) + tile("Total Profit", money(R.profit), R.profit < 0 ? "neg" : "pos") + tile("Total ROI", pct(R.totalRoi)) + tile("IRR (annualized)", pct(R.IRR), R.IRR < 0 ? "neg" : "pos") + tile("Equity Multiple", isFinite(R.multiple) ? R.multiple.toFixed(2) + "×" : "—");
    OGCharts.columns($("#cChart"), R.years.map((y) => ({ label: "Year " + y.t, short: "Y" + y.t, value: Math.round(y.equity / 1000) })), { label: "Equity by year in thousands of dollars", unit: "K equity" });
    $("#cTable").innerHTML = `<thead><tr><th scope="col">Year</th><th scope="col">NOI</th><th scope="col">Debt service</th><th scope="col">Cash flow</th><th scope="col">Value</th><th scope="col">Loan balance</th><th scope="col">Equity</th></tr></thead><tbody>${R.years.map((y) => `<tr><td>${y.t}</td><td>${money(y.noi)}</td><td>${money(y.ds)}</td><td class="${y.cf < 0 ? "neg" : ""}">${money(y.cf)}</td><td>${money(y.value)}</td><td>${money(y.bal)}</td><td>${money(y.equity)}</td></tr>`).join("")}</tbody>`;
    return R;
  }
  function wireCalc() {
    const form = $("#calcForm"); if (!form) return;
    const read = () => { $$("[data-c]", form).forEach((i) => (CALC.v[i.dataset.c] = num(i.value))); };
    form.addEventListener("input", (e) => {
      const i = e.target.closest("[data-c]"); if (!i) return;
      if (i.parentElement.classList.contains("pre")) { const pos = i.value.length - i.selectionStart; const raw = i.value.replace(/[^0-9.]/g, ""); const [a, b] = raw.split("."); i.value = (a ? Number(a).toLocaleString("en-US") : "") + (b !== undefined ? "." + b : ""); i.setSelectionRange(i.value.length - pos, i.value.length - pos); }
      read(); drawCalc();
    });
    $("#c_leaseType").addEventListener("click", (e) => { const b = e.target.closest("[data-lease]"); if (!b) return; CALC.v.leaseType = b.dataset.lease; $$("#c_leaseType [data-lease]").forEach((x) => x.setAttribute("aria-checked", String(x === b))); drawCalc(); });
    form.addEventListener("submit", (e) => {
      e.preventDefault(); read(); const R = drawCalc();
      $(".calc-results").classList.remove("flash"); void $(".calc-results").offsetWidth; $(".calc-results").classList.add("flash");
      logToSheet("Calculator_Runs", { Timestamp: new Date().toISOString(), SessionID: SESSION_ID, Listing: CALC.listing ? CALC.listing.title : "", LeaseType: CALC.v.leaseType, Price: CALC.v.price, Income: CALC.v.income, NOI: Math.round(R.noi), CapRate: R.cap.toFixed(2), CashOnCash: R.coc.toFixed(2), IRR: isFinite(R.IRR) ? R.IRR.toFixed(2) : "", HoldYears: R.H });
      if (window.matchMedia("(max-width: 1000px)").matches) $(".calc-results").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
    $("#calcReset").addEventListener("click", () => { CALC.v = CALC.listing ? calcPrefill(CALC.listing) : { ...CALC_DEFAULT }; $$("[data-c]", form).forEach((i) => { const k = i.dataset.c; i.value = i.parentElement.classList.contains("pre") ? Math.round(CALC.v[k]).toLocaleString("en-US") : CALC.v[k]; }); $$("#c_leaseType [data-lease]").forEach((x) => x.setAttribute("aria-checked", String(x.dataset.lease === CALC.v.leaseType))); drawCalc(); });
    $$(".tip").forEach((t) => { t.addEventListener("click", (e) => e.preventDefault()); });
    drawCalc();
  }
  /* ── New-listing alerts (opt-in). The Apps Script emails a Confirm link; nothing is sent until it's clicked ── */
  const alertOptIn = (id) => `<label class="check alert-optin" for="${id}"><input type="checkbox" id="${id}" name="alerts" value="yes"><span>Also email me when new listings are added to the website. <em>Unsubscribe any time.</em></span></label>`;
  async function subscribeAlerts(email, name, source) {
    const r = await post({ type: "alerts", email: String(email || "").trim(), name: String(name || "").trim(), source });
    if (!r.ok) return "";
    return r.data && r.data.state === "active" ? "You're already subscribed to new-listing alerts." : "To start new-listing alerts, click the Confirm link we just emailed you.";
  }
  const alertBand = () => `<form class="alert-band" id="alertForm" novalidate data-reveal>
      <div class="alert-copy"><span class="alert-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg></span>
        <div><h3>New listing alerts</h3><p class="muted">Be the first to know. We'll email you when we add a new property to our website — at most once a day, and only when something is new.</p></div></div>
      <div class="alert-fields">
        <div class="field"><label for="alName">Name <span class="muted">(optional)</span></label><input class="input" id="alName" name="name" autocomplete="name"></div>
        <div class="field"><label for="alEmail">Email</label><input class="input" id="alEmail" name="email" type="email" required autocomplete="email"></div>
        <button class="btn primary" type="submit">Get Alerts</button>
      </div>
      <label class="check alert-consent" for="alOk"><input type="checkbox" id="alOk" name="consent" required><span>I agree to receive new-listing emails from The Outlier Group. I can unsubscribe at any time.</span></label>
      <div class="form-msg" id="alertMsg" hidden aria-live="polite"></div>
    </form>`;
  function wireAlertBand() {
    const f = $("#alertForm"); if (!f) return;
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = $("#alertMsg"), email = f.elements.email.value.trim();
      msg.hidden = false; msg.className = "form-msg err";
      if (!/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = "Please add a valid email."; f.elements.email.focus(); return; }
      if (!f.elements.consent.checked) { msg.textContent = "Please tick the box to agree to new-listing emails."; f.elements.consent.focus(); return; }
      const b = f.querySelector("button[type=submit]"); b.disabled = true; b.textContent = "Sending…";
      const t = await subscribeAlerts(email, f.elements.name.value, "Client Portal · New listing alerts");
      b.disabled = false; b.textContent = "Get Alerts";
      if (t) { msg.className = "form-msg ok"; msg.textContent = t.startsWith("You're") ? t : "Almost done — " + t.charAt(0).toLowerCase() + t.slice(1); f.reset(); }
      else msg.textContent = `We couldn't sign you up. Please email ${COMPANY.email}.`;
    });
  }
  function openLeadModal() {
    const s = PORTAL.lastSearch; if (!s) return;
    const m = document.createElement("div");
    m.className = "modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "leadTitle");
    m.innerHTML = `<div class="modal-box narrow">
      <div class="modal-head"><div><h2 id="leadTitle">Email me these matches</h2><p>An advisor will follow up with these ${s.results.length} properties, plus anything new that fits.</p></div><button class="icon-btn" type="button" data-close aria-label="Close">✕</button></div>
      <form class="modal-body form-grid" id="leadForm" novalidate>
        <div class="field"><label for="lName">Full name</label><input class="input" id="lName" name="name" required autocomplete="name"></div>
        <div class="row"><div class="field"><label for="lEmail">Email</label><input class="input" id="lEmail" name="email" type="email" required autocomplete="email"></div>
        <div class="field"><label for="lPhone">Phone</label><input class="input" id="lPhone" name="phone" type="tel" autocomplete="tel"></div></div>
               ${alertOptIn("lAlerts")}
        <button class="btn primary block" type="submit">Send Me These Matches</button>
        <div class="form-msg" id="leadMsg" hidden></div>
      </form></div>`;
    document.body.appendChild(m);
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) m.remove(); });
    $("#lName", m).focus();
        wireLeadForm("leadForm", "leadMsg", "Client Portal Results", () => ({ searchId: s.searchId, profile: s.profile, requirements: JSON.stringify(s.answers), matches: s.results.map((r) => `${r.title} (${r.score})`).join("; ") }), "Thanks — an advisor will email you these matches shortly.",
      (v) => { if (v.alerts) subscribeAlerts(v.email, v.name, "Client Portal · Email me these matches").then((t) => { const el = $("#leadMsg"); if (el && t) el.textContent += " " + t; }); });
  }

  /* ── Lead forms ── */
    function wireLeadForm(formId, msgId, kind, extra, okText, onOk) {
    const f = document.getElementById(formId); if (!f) return;
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById(msgId);
      const bad = [...f.querySelectorAll("[required]")].filter((i) => !i.value.trim() || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value)));
      if (bad.length) { msg.hidden = false; msg.className = "form-msg err"; msg.textContent = "Please add your " + bad.map((i) => ((f.querySelector(`label[for="${i.id}"]`) || {}).textContent || i.name).toLowerCase()).join(", ") + "."; bad[0].focus(); return; }
      const btn = f.querySelector("button[type=submit]"); btn.disabled = true; const label = btn.innerHTML; btn.textContent = "Sending…";
      const r = await post({ type: "lead", kind, fields: Object.fromEntries(new FormData(f).entries()), extra: extra ? extra() : {} });
      btn.disabled = false; btn.innerHTML = label; msg.hidden = false;
            if (r.ok) { msg.className = "form-msg ok"; msg.textContent = okText || "Thanks — we'll be in touch shortly."; if (onOk) onOk(Object.fromEntries(new FormData(f).entries())); f.reset(); }
      else { msg.className = "form-msg err"; msg.textContent = `We couldn't send that. Please email ${COMPANY.email} or call ${COMPANY.phone}.`; }
    });
  }

  /* ════════════ ROUTER ════════════ */
  const ROUTES = {
    home: { title: "The Outlier Group | Commercial Real Estate Florida", render: renderHome, nav: "home", wire: () => {
      wireLeadForm("subscribeForm", "subMsg", "Newsletter Subscribe", null, "Thanks for subscribing!");
      $$("[data-scroll]").forEach((b) => b.addEventListener("click", () => { const c = $("#featCarousel"); c.scrollBy({ left: +b.dataset.scroll * (c.clientWidth * 0.8), behavior: "smooth" }); }));
    } },
    sectors: { title: "Sectors | The Outlier Group", render: renderSectors, nav: "sectors", wire: () => $$("[data-sector]").forEach((a) => a.addEventListener("click", () => Object.assign(PF, { type: a.dataset.sector, status: "all", deal: "", region: "", city: "", q: "" }))) },    services: { title: "Services | The Outlier Group", render: renderServices, nav: "services" },
    "why-outlier": { title: "Why Outlier? | The Outlier Group", render: renderWhy, nav: "why-outlier" },
    "our-team": { title: "Our Team | The Outlier Group", render: renderTeam, nav: "our-team" },
    portfolio: { title: "Our Portfolio | The Outlier Group", render: renderPortfolio, nav: "portfolio", wire: wirePortfolio },
    contact: { title: "Contact | The Outlier Group", render: renderContact, nav: "contact", wire: () => wireLeadForm("contactForm", "contactMsg", "Contact") },
    insights: { title: "Market Insights | The Outlier Group", render: renderInsights, nav: "insights", wire: wireInsights },
    "submit-property": { title: "Submit a Property | The Outlier Group", render: renderSubmit, nav: "contact", wire: () => wireLeadForm("submitForm", "submitMsg", "Property Submission", null, "Thanks — an advisor will review your property and follow up within one business day.") },
    privacy: { title: "Privacy | The Outlier Group", render: renderPrivacy, nav: "" },
    careers: { title: "Careers | The Outlier Group", render: renderCareers, nav: "our-team", wire: wireCareers },
    portal: { title: "Client Portal | The Outlier Group", render: renderPortal, nav: "portal", wire: wirePortal },
    calculator: { title: "Investment Calculator | The Outlier Group", render: () => renderCalc(null), nav: "portal", wire: wireCalc }
  };
  /* Plain text of a page (for the Outlier Assistant): renders it off-screen, never touches the visible page */
  OG.pageText = function (key) {
    try {
      const r = ROUTES[key]; if (!r || !r.render) return "";
      const d = document.createElement("div"); d.innerHTML = r.render();
      d.querySelectorAll("script, style, svg, form, button, input, select, textarea, noscript").forEach((e) => e.remove());
      return d.textContent.replace(/\s+/g, " ").trim();
    } catch (e) { return ""; }
  };
  const ALIASES = { about: "why-outlier", team: "our-team", ourteam: "our-team", whyoutlier: "why-outlier", outlierportfolio: "portfolio", listings: "portfolio", articles: "insights", "market-insights": "insights", submit: "submit-property", tenant: "tenant-portal", apply: "tenant-portal", "tenant-application": "tenant-portal", tenantportal: "tenant-portal", privacypolicy: "privacy", oic: "calculator", "investment-calculator": "calculator",
    macautrey: "team-mac-autrey", lisaromanfoss: "team-lisa-roman-foss", lisafoss: "team-lisa-roman-foss", vanessaautrey: "team-vanessa-autrey", denzylleibasco: "team-den-ibasco", natashasantillana: "team-natasha-santillana", erikasmith: "team-erika-smith", hollypicano: "team-holly-picano", joyceteixeira: "team-joyce-teixeira", jasonclemmey: "team-jason-clemmey", monsierivera: "team-monsie-rivera", laurielane: "team-laurie-lane", nathaliakeown: "team-nathalia-keown", schuylermoffat: "team-schuyler-moffat", christopherdelcore: "team-christopher-delcore" };

  /* Approval link from Natasha's email: #access-<NDA ref>-<token> */
  async function handleAccess(rest) {
    const token = rest.split("-").pop(), ref = rest.slice(0, rest.length - token.length - 1);
    $("#app").innerHTML = pageHead("Checking your access…", "One moment while we confirm your NDA approval.");
    const r = await getJSON({ action: "access", ref, token });
    if (r && r.status === "approved" && r.propertyId) {
      setAccess(r.propertyId, { ref, token, details: r.details || {}, at: new Date().toISOString() });
      setNda(r.propertyId, { status: "approved", ref });
      location.replace("#property-" + r.propertyId); return;
    }
    if (r && r.status === "denied" && r.propertyId) { setNda(r.propertyId, { status: "denied", ref }); location.replace("#property-" + r.propertyId); return; }
    $("#app").innerHTML = pageHead(r && r.status === "pending" ? "Your request is still pending" : "This access link isn't valid", r && r.status === "pending" ? "Our team hasn't reviewed your NDA yet. You'll get an email as soon as it's reviewed." : "The link may be incomplete or expired. Contact your advisor for a new one.") + `<div class="wrap center section tight-top"><a class="btn primary" href="#portal">Back to the Client Portal</a></div>`;
  }

  function route() {
    let h = (location.hash || "#home").slice(1) || "home";
    h = ALIASES[h] || h;
    const app = $("#app");
    OG.maps.forEach((m) => { try { m.remove(); } catch (e) {} }); OG.maps = [];
    $$(".modal").forEach((m) => m.remove());
    if (h.startsWith("access-")) { setActive("portal"); handleAccess(h.slice(7)); window.scrollTo(0, 0); return; }
    if (h.startsWith("insight-")) {
      const slug = h.slice(8), art = INSIGHTS.find((x) => x.slug === slug);
      app.innerHTML = renderInsight(slug); document.title = (art ? art.title : "Market Insights") + " | The Outlier Group"; setActive("insights");
    } else if (h.startsWith("team-")) {
      const t = teamBySlug(h.slice(5));
      app.innerHTML = renderTeamMember(h.slice(5)); document.title = (t ? `${t.name}, ${t.role}` : "Our Team") + " | The Outlier Group"; setActive("our-team"); wireTeamMember(h.slice(5));
    } else if (h.startsWith("career-")) {
      const slug = h.slice(7), j = jobBySlug(slug);
      app.innerHTML = renderJob(slug); document.title = (j ? j.title : "Careers") + " | The Outlier Group"; setActive("our-team"); wireJob(slug);
    } else if (h.startsWith("calculator-")) {
      const l = byId(h.slice(11));
      app.innerHTML = renderCalc(l ? l.id : null); document.title = "Investment Calculator" + (l ? " · " + l.title : "") + " | The Outlier Group"; setActive("portal"); wireCalc();
    } else if (h === "tenant-portal" || h.startsWith("tenant-portal-")) {
      const id = h.slice(14), l = byId(id);
      app.innerHTML = renderTenant(id); document.title = "Tenant Portal" + (leaseOpen(l) ? " · " + l.title : "") + " | The Outlier Group"; setActive("portal"); wireTenant();
    } else if (h.startsWith("property-")) {
      const id = h.slice(9), l = byId(id);
      app.innerHTML = renderProperty(id);
      document.title = (l ? (l.offMarket ? l.title : l.title + " — " + l.city) : "Property") + " | The Outlier Group";
      setActive(l && l.offMarket ? "portal" : "portfolio"); wireProperty(id);
    } else {
      const r = ROUTES[h] || ROUTES.home;
      app.innerHTML = r.render(); document.title = r.title; setActive(r.nav); r.wire && r.wire();
    }
    window.scrollTo(0, 0);
    app.classList.remove("page-in"); void app.offsetWidth; app.classList.add("page-in");
    motion(app);
  }
  function setActive(nav) {
    document.body.classList.toggle("is-home", nav === "home");
    $$("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === nav));
    document.body.classList.remove("menu-open"); const mb = $("#menuBtn"); if (mb) mb.setAttribute("aria-expanded", "false");
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-nda]");
    if (b && OG.openNDA) { e.preventDefault(); OG.openNDA(byId(b.dataset.nda), () => route()); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const m = $(".modal:not([data-locked])"); if (m) m.remove(); } });
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(store.get("og-theme") || document.documentElement.getAttribute("data-theme") || "dark");
    $("#themeBtn").addEventListener("click", () => { const next = isDark() ? "light" : "dark"; store.set("og-theme", next); applyTheme(next); });
    $("#menuBtn").addEventListener("click", () => { const open = document.body.classList.toggle("menu-open"); $("#menuBtn").setAttribute("aria-expanded", String(open)); });
    const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    document.addEventListener("click", (e) => { if (e.target.closest("[data-cookie-prefs]")) { e.preventDefault(); window.OGConsent && OGConsent.open(true); } });
    route();
  });

  Object.assign(OG, { byId, agentOf, store, esc, ICON, SESSION_ID, makeId });
})();

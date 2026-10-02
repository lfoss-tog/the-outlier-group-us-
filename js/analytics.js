/* ════════════════════════════════════════════════════════════
   The Outlier Group: website analytics (Google Analytics 4 + Consent Mode)

   This file only LISTENS to the existing site. It never changes the page.
   - Nothing is sent, loaded or logged unless the visitor allows "Analytics"
     in the cookie banner (OGConsent.allowed("analytics")).
   - No personal data: no names, emails, phone numbers or message text.
     Off-market listings never send an address, coordinates or price.
   - Every handler is wrapped so a tracking error can never break the site.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ┌──────────────────────────────────────────────────────────┐
     │  GOOGLE ANALYTICS 4 MEASUREMENT ID: set it here only.    │
     │  While it is the placeholder "G-XXXXXXXXXX", nothing is  │
     │  loaded from Google and events are written to the        │
     │  browser console with the prefix [OG analytics].         │
     └──────────────────────────────────────────────────────────┘ */
  var GA_MEASUREMENT_ID = "G-L8EGNCQK9G";

  var PLACEHOLDER = "G-XXXXXXXXXX";
  var LIVE = GA_MEASUREMENT_ID !== PLACEHOLDER && /^G-[A-Z0-9]{4,}$/.test(GA_MEASUREMENT_ID);
  var PREFIX = "[OG analytics]";
  var gaLoaded = false;

  /* ── Safety helpers ── */
  function safe(fn) { return function () { try { return fn.apply(this, arguments); } catch (e) { /* never break the site */ } }; }
  function allowed() { try { return !!(window.OGConsent && window.OGConsent.allowed("analytics")); } catch (e) { return false; } }
  function $(sel, root) { try { return (root || document).querySelector(sel); } catch (e) { return null; } }
  function sessionId() { try { return (window.OG && window.OG.SESSION_ID) || ""; } catch (e) { return ""; } }

  var EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
  function looksLikePhone(s) { var m = String(s).match(/\+?\d[\d\s().-]{5,}\d/g) || []; return m.some(function (x) { return x.replace(/\D/g, "").length >= 7; }); }
  function personal(s) { return EMAIL.test(String(s)) || looksLikePhone(s); }

  /* Keep only short, non-personal values. */
  function clean(params) {
    var out = {};
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null || v === "") return;
      if (typeof v === "string") { v = v.trim().slice(0, 100); if (!v || personal(v)) return; }
      out[k] = v;
    });
    return out;
  }

  /* ── Google tag (loaded only when live AND analytics is allowed) ── */
  function gtag() { window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments); }
  function g() { (window.gtag || gtag).apply(window, arguments); }
  function loadGA() {
    if (!LIVE || gaLoaded) return;
    gaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
    g("js", new Date());
    g("config", GA_MEASUREMENT_ID, { send_page_view: false }); /* page views are sent below, once per route */
  }
  var applyConsent = safe(function () {
    var ok = allowed();
    if (!LIVE) return;
    window["ga-disable-" + GA_MEASUREMENT_ID] = !ok;   /* stops all Google Analytics sending when consent is withdrawn */
    g("consent", "update", { analytics_storage: ok ? "granted" : "denied" });
    if (ok) loadGA();
  });

  /* ── Send one event ── */
  var send = safe(function (name, params) {
    if (!allowed()) return;
    var p = clean(params);
    p.og_session_id = sessionId();
    if (!LIVE) { console.log(PREFIX, name, p); return; }
    applyConsent();
    g("event", name, p);
  });

  /* ── Routes ── */
  function currentHash() { return (location.hash || "#home").slice(1) || "home"; }
  function pathFor(h) {
    h = h || currentHash();
    if (h === "home") return "/";
    if (/^access-/.test(h)) return "/access";            /* never send NDA approval tokens */
    var m = h.match(/^(property|calculator|insight|team|career)-(.+)$/);
    if (m) return "/" + m[1] + "/" + m[2].replace(/[^a-z0-9-]/gi, "");
    return "/" + h.replace(/[^a-z0-9-]/gi, "");
  }
  function listingFromHash() {
    var m = currentHash().match(/^(?:property|calculator)-(.+)$/);
    try { return m && window.OG && window.OG.byId ? window.OG.byId(m[1]) : null; } catch (e) { return null; }
  }
  function regionOf(l) {
    try { var R = FL_REGIONS; for (var r in R) { if (R[r].indexOf(l.county) > -1) return r; } } catch (e) {}
    return "";
  }

  var lastPath = null;
  var pageView = safe(function (force) {
    var path = pathFor();
    if (path === lastPath && !force) return;
    lastPath = path;
    var base = location.origin + location.pathname.replace(/\/(index\.html)?$/, "");
    send("page_view", { page_path: path, page_location: base + path, page_title: document.title });
    var l = /^\/property\//.test(path) ? listingFromHash() : null;
    if (l) send("view_property", {
      listing_id: l.id, property_type: l.type, city: String(l.city || "").split(",")[0], county: l.county, region: regionOf(l),
      deal: l.deal, status: l.status, off_market: !!l.offMarket
    });
  });

  /* ── Portfolio search & filters (reads the result count the page already shows) ── */
  function portfolioCount() { var b = $("#pfCount b"); return b ? parseInt(b.textContent, 10) || 0 : null; }
  var searchTimer = null, lastTerm = "";
  var onSearchInput = safe(function (input) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(safe(function () {
      var term = String(input.value || "").trim();
      if (!term || term === lastTerm) return;
      lastTerm = term;
      if (personal(term)) return;                         /* drop terms that look like an email or phone number */
      var n = portfolioCount();
      send("search", { search_term: term, search_type: "portfolio", results_count: n });
      if (n === 0) send("zero_results", { search_type: "portfolio", search_term: term });
    }), 1200);
  });
  var FILTERS = { pfDeal: "deal", pfType: "property_type", pfRegion: "region", pfCity: "city", pfSort: "sort" };
  var onFilter = safe(function (name, value) {
    setTimeout(safe(function () {
      var n = portfolioCount();
      send("filter_use", { filter_name: name, filter_value: value || "any", results_count: n });
      if (n === 0) send("zero_results", { search_type: "portfolio", filter_name: name, filter_value: value || "any" });
    }), 0);
  });

  /* ── Client Portal: Find My Opportunities ── */
  var onPortalSearch = safe(function () {
    var matches = $("#matches"), before = matches ? matches.firstElementChild : null;
    var picks = {};
    Array.prototype.forEach.call(document.querySelectorAll("select[data-f]"), function (s) { picks[s.getAttribute("data-f")] = s.value; });
    var prof = $('#profiles [data-profile][aria-checked="true"]');
    setTimeout(safe(function () {
      var m = $("#matches");
      if (!m || m.firstElementChild === before) return;    /* search didn't run (e.g. the portal notice is showing) */
      var c = (($("#omCount") || {}).textContent || "").match(/(\d+)\s*off-market\D+(\d+)\s*on-market/);
      var off = c ? +c[1] : 0, on = c ? +c[2] : 0;
      send("portal_search", {
        client_type: prof ? prof.getAttribute("data-profile") : "",
        budget: picks.budget, region: picks.region, city: picks.city, timing: picks.timing,
        building_type: picks.type, size: picks.size,
        results_count: off + on, off_market_matches: off, on_market_matches: on
      });
    }), 0);
  });

  /* ── Lead forms: sent only after the form shows its success message ── */
  var FORM_TYPES = {
    contactForm: "contact", submitForm: "submit_property", inquireForm: "property_inquiry",
    teamForm: "team_member_message", applyForm: "career_application", leadForm: "portal_matches",
    subscribeForm: "newsletter", alertForm: "listing_alerts"
  };
  var onLeadSubmit = safe(function (form) {
    var type = FORM_TYPES[form.id]; if (!type) return;
    var l = form.id === "inquireForm" ? listingFromHash() : null;
    var done = false, obs = null;
    var check = safe(function () {
      if (done) return;
      var ok = form.querySelector(".form-msg.ok");
      if (ok && !ok.hidden) { done = true; if (obs) obs.disconnect(); send("generate_lead", { form_type: type, listing_id: l ? l.id : "" }); }
    });
    if (window.MutationObserver) { obs = new MutationObserver(check); obs.observe(form, { subtree: true, attributes: true, attributeFilter: ["class", "hidden"] }); }
    setTimeout(function () { try { if (obs) obs.disconnect(); } catch (e) {} done = true; }, 60000);
  });

  /* ── One listener per event type, capture phase, so the site's own handlers are untouched ── */
  document.addEventListener("click", safe(function (e) {
    var t = e.target && e.target.closest ? e.target : null; if (!t) return;
    var a;
    if ((a = t.closest('a[href^="#property-"]'))) {
      var id = a.getAttribute("href").slice(10);
      send("select_property", { listing_id: id, list_name: pathFor(), link_type: a.closest(".map-pop") ? "map" : a.closest(".card, .opp, .feat-card, article") ? "card" : "link" });
    }
    if ((a = t.closest("[data-brochure]"))) send("brochure_download", { listing_id: a.getAttribute("data-brochure"), version: /teaser/i.test(a.textContent) ? "teaser" : "full" });
    if ((a = t.closest("[data-nda]"))) send("nda_start", { listing_id: a.getAttribute("data-nda") });
    if ((a = t.closest('a[href^="tel:"], a[href^="mailto:"]'))) send("contact_click", { method: /^tel:/i.test(a.getAttribute("href")) ? "phone" : "email", page_path: pathFor() });
    if ((a = t.closest("#pfChips [data-status]"))) onFilter("status", a.getAttribute("data-status"));
    if (t.closest("#findBtn") || t.closest("#consentYes")) onPortalSearch();
    if ((a = t.closest("[data-ask], #chatSuggest .chip"))) send("assistant_question", { source: "suggested", page_path: pathFor() });
  }), true);

  document.addEventListener("change", safe(function (e) {
    var t = e.target; if (!t || !t.id || !FILTERS[t.id]) return;
    onFilter(FILTERS[t.id], t.value);
  }), true);

  document.addEventListener("input", safe(function (e) {
    if (e.target && e.target.id === "pfQ") onSearchInput(e.target);
  }), true);

  document.addEventListener("submit", safe(function (e) {
    var f = e.target; if (!f || !f.id) return;
    if (f.id === "calcForm") {
      var l = listingFromHash(), lt = $('#c_leaseType [aria-checked="true"]');
      send("calculator_run", { listing_id: l ? l.id : "", lease_type: lt ? lt.getAttribute("data-lease") : "" });
    } else if (f.id === "chatForm") {
      var q = $("#chatInput");
      if (q && q.value.trim()) send("assistant_question", { source: "typed", page_path: pathFor() });
    } else onLeadSubmit(f);
  }), true);

  window.addEventListener("hashchange", function () { pageView(false); });
  document.addEventListener("DOMContentLoaded", function () { pageView(false); });
  if (document.readyState !== "loading") setTimeout(function () { pageView(false); }, 0);

  /* Consent: apply the stored choice now, and react when the visitor changes it. */
  applyConsent();
  try {
    if (window.OGConsent && window.OGConsent.onChange) window.OGConsent.onChange(safe(function () {
      applyConsent();
      if (allowed()) pageView(true);   /* record the page they're on once they allow analytics */
    }));
  } catch (e) {}
})();

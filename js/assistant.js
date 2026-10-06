/* ════════════════════════════════════════════════════════════
   THE OUTLIER GROUP — AI Assistant
   Answers only from approved site content (services, sectors, listings,
   Market Insights, Client Portal/NDA, FAQ). Order of engines:
     1. Claude via the artifact viewer (preview only, when granted)
     2. Claude via the Apps Script (live site, OG_CONFIG.AI_ENABLED)
     3. Built-in answer engine (always available, no network)
   When it can't answer, it points to the contact form.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const PAGES = {
    "#portfolio": "Our Portfolio", "#portal": "Client Portal (off-market first)", "#services": "Services", "#sectors": "Sectors",
    "#why-outlier": "Why Outlier?", "#our-team": "Our Team", "#insights": "Market Insights", "#contact": "Contact / Schedule a Consultation",
    "#submit-property": "Submit a Property", "#careers": "Careers", "#calculator": "Investment Calculator", "#privacy": "Privacy Policy", "#home": "Home"
  };
  const SUGGESTED = ["What services do you offer?", "How can you help me find a property?", "What properties are available?", "How can I submit a property?", "How do off-market listings work?"];
  const state = { msgs: [], busy: false };
  try { state.msgs = JSON.parse(sessionStorage.getItem("og-chat") || "[]"); } catch (e) {}
  const save = () => { if (window.OGConsent && !OGConsent.allowed("preferences")) return; try { sessionStorage.setItem("og-chat", JSON.stringify(state.msgs.slice(-30))); } catch (e) {} };

  /* ── Approved knowledge: built at run time from the site's own data and pages ──
     Everything published on the site goes into a searchable library of passages: company,
     services, sectors, values, FAQ, client profiles, every team member's full bio, every listing's
     full details, past transactions, every Market Insights article, and the text of the Why Outlier,
     Services, Sectors, Careers, Client Portal, Submit a Property, Contact and Privacy pages.
     Off-market listings only ever contribute their public teaser (the site never holds their
     address or price). For each question the most relevant passages are sent with a compact
     index of everything, so answers stay current with whatever the site shows. */
  const avail = () => LISTINGS.filter((l) => !l.offMarket && l.status === "Available");
  const agentLine = (key) => { const a = (typeof AGENTS !== "undefined" && AGENTS[key]) || null; return a ? `${a.name} (${a.role}), ${a.email}${a.phone ? ", " + a.phone : ""}` : ""; };
  const txt = (x) => String(x == null ? "" : x).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const sent = (s) => { s = txt(s); return s && !/[.!?:]$/.test(s) ? s + "." : s; };
  let CORPUS = null;
  function corpus() {
    if (CORPUS) return CORPUS;
    const C = [], add = (kind, title, link, parts) => { const body = parts.filter(Boolean).map(sent).join(" "); if (body) C.push({ kind, title, link, text: body }); };
    try { add("company", COMPANY.name, "#why-outlier", [`${COMPANY.name}: ${COMPANY.tagline}`, "A Commercial Real Estate firm that focuses on brokering investment assets in Florida, founded 2016", `Phone ${COMPANY.phone}`, `Email ${COMPANY.email}`, `Office ${COMPANY.address}`, COMPANY.license && `Brokerage license ${COMPANY.license}`]); } catch (e) {}
    try { SERVICES.forEach((x) => add("service", "Service: " + x.name, "#services", [`${x.name}: ${x.desc}`])); } catch (e) {}
    try { SECTORS.forEach((x) => add("sector", "Sector: " + x.name, "#sectors", [`${x.name}: ${x.desc}`])); } catch (e) {}
    try { VALUES.forEach((x) => add("value", "Value: " + x.name, "#why-outlier", [`${x.name}: ${x.desc}`])); } catch (e) {}
    try { FAQ.forEach((x) => add("faq", "FAQ: " + x.q, "#why-outlier", [`Question: ${x.q}`, `Answer: ${x.a}`])); } catch (e) {}
    try { CLIENT_PROFILES.forEach((x) => add("profile", "Client Portal profile: " + x.type, "#portal", [`${x.type} (${x.deal}): ${x.need}`])); } catch (e) {}
    try { TEAM.forEach((t) => add("team", `${t.name}, ${t.role}`, "#team-" + t.slug, [`${t.name} is ${t.role} at The Outlier Group`, `Email ${t.email}`, t.phone && `Phone ${t.phone}`].concat(t.bio || [], (t.facts || []).map((f) => f.join(": ")), t.focus && t.focus.length ? [`Focus areas: ${t.focus.join(", ")}`] : []))); } catch (e) {}
    try {
      LISTINGS.forEach((l) => {
        if (l.offMarket) return add("listing", `${l.title} (off-market)`, "#property-" + l.id, [`${l.title} is an OFF-MARKET ${l.typeLabel || l.type} opportunity for ${l.deal}`, `Area: ${l.region || l.city}`, l.space && `Space: ${l.space}`, l.building && `Building: ${l.building}`, l.teaser, "The address, photos and pricing are confidential and released only after an approved NDA (Request Access on the property page, or the Client Portal)", agentLine(l.agent) && `Advisor: ${agentLine(l.agent)}`]);
        add(l.past ? "past" : "listing", `${l.title}${l.past ? " (past transaction)" : ""}`, "#property-" + l.id, [
          `${l.title}: ${l.headline || ""}`, l.subhead, `Status: ${l.status}${l.statusNote ? " (" + l.statusNote + ")" : ""}`, `${l.type} for ${l.deal}`,
          `Address: ${[l.address, l.city].filter(Boolean).join(", ")}`, l.county && `County: ${l.county}`, l.space && `Space: ${l.space}`, l.building && `Building: ${l.building}`]
          .concat((l.facts || []).map((f) => f.join(": ")), l.highlights && l.highlights.length ? [`Highlights: ${l.highlights.join("; ")}`] : [], [l.desc, agentLine(l.agent) && `Advisor: ${agentLine(l.agent)}`]));
      });
    } catch (e) {}
    try {
      INSIGHTS.forEach((a) => {
        const paras = (a.blocks || []).map((b) => b.p || b.h || b.q || (b.ul || b.ol || []).join("; ")).filter((x) => typeof x === "string" && x.trim());
        const head = `Market Insights article "${a.title}" by ${a.author || "The Outlier Group"}, ${a.date} (${a.category})`;
        let part = [], len = 0, n = 0;
        const flush = () => { if (part.length) { add("insight", a.title + (n ? " (cont.)" : ""), "#insight-" + a.slug, [head].concat(part)); n++; part = []; len = 0; } };
        (paras.length ? paras : [a.excerpt]).forEach((x) => { if (len + x.length > 2400) flush(); part.push(x); len += x.length; });
        flush();
      });
    } catch (e) {}
    try {
      const cj = (o) => typeof o === "string" ? o : Array.isArray(o) ? o.map(cj).join("; ") : o && typeof o === "object" ? Object.values(o).map(cj).join(" ") : "";
      add("page", "Careers", "#careers", [cj(CAREERS)]);
    } catch (e) {}
    const pages = { "why-outlier": "Why Outlier?", services: "Services", sectors: "Sectors", portal: "Client Portal", "submit-property": "Submit a Property", contact: "Contact", privacy: "Privacy Policy", careers: "Careers page" };
    Object.keys(pages).forEach((k) => {
      try {
        const t = window.OG && OG.pageText ? OG.pageText(k) : "";
        for (let i = 0; i < t.length; i += 2400) add("page", pages[k] + (i ? " (cont.)" : ""), "#" + k, [t.slice(i, i + 2400)]);
      } catch (e) {}
    });
    // term statistics for ranking
    C.forEach((c) => { c.terms = new Set(words(c.title + " " + c.text)); });
    const df = {}; C.forEach((c) => c.terms.forEach((w) => { df[w] = (df[w] || 0) + 1; }));
    CORPUS = { chunks: C, df, n: C.length };
    return CORPUS;
  }
  const STOP = new Set("the and for with that this from your you are our what who how can does have has was were will would about into than then them they their there here when where which why also any all not but get got its it's tell show give need want like just some more most much many very over under per info information please thanks hello does did do is be of to in on at by an a or as we us me my i".split(" "));
  function words(s) { return String(s || "").toLowerCase().replace(/[’']/g, "").split(/[^a-z0-9$]+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.length > 4 ? w.replace(/(ies|es|s)$/, (m) => m === "ies" ? "y" : "") : w); }
  function rank(q) {
    const K = corpus(), qw = [...new Set(words(q))];
    const idf = (w) => Math.log(1 + K.n / (1 + (K.df[w] || 0)));
    return K.chunks.map((c) => {
      let s = 0; qw.forEach((w) => { if (c.terms.has(w)) s += idf(w); });
      const tl = c.title.toLowerCase(); qw.forEach((w) => { if (tl.includes(w)) s += 0.6 * idf(w); });
      return { c, s };
    }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  }
  function siteIndex() {
    const L = LISTINGS.filter((l) => !l.past).map((l) => l.offMarket ? `- [${l.title}](#property-${l.id}) | OFF-MARKET (NDA) | ${l.typeLabel || l.type} | ${l.deal} | ${l.region || l.city} | ${l.space}` : `- [${l.title}](#property-${l.id}) | ${l.status} | ${l.type} | ${l.deal} | ${l.city} | ${l.space}`).join("\n");
    const P = LISTINGS.filter((l) => l.past).map((l) => `${l.title} (${l.status})`).join("; ");
    return [`COMPANY: ${COMPANY.name}, phone ${COMPANY.phone}, email ${COMPANY.email}, office ${COMPANY.address}.`,
      `SERVICES: ${SERVICES.map((s) => s.name).join(", ")}. SECTORS: ${SECTORS.map((s) => s.name).join(", ")}.`,
      `TEAM: ${TEAM.map((t) => `[${t.name}](#team-${t.slug}) (${t.role}, ${t.email})`).join("; ")}.`,
      `CURRENT LISTINGS:\n${L}`, P ? `PAST TRANSACTIONS: ${P}.` : "",
      `MARKET INSIGHTS ARTICLES: ${INSIGHTS.map((a) => `[${a.title}](#insight-${a.slug}) (${a.date})`).join("; ")}.`].filter(Boolean).join("\n");
  }
  function knowledge(history) {
    const users = (history || []).filter((m) => m.role === "user").map((m) => m.text);
    const last = users[users.length - 1] || "", earlier = users.slice(-4, -1).join(" ");
    const hits = rank(last + " " + last + " " + earlier);   // the latest question counts double
    const BUDGET = 38000, out = []; let used = 0;
    for (const h of hits) { const block = `### ${h.c.title} (link ${h.c.link})\n${h.c.text}`; if (used + block.length > BUDGET) continue; out.push(block); used += block.length; if (out.length >= 14) break; }
    return `SITE INDEX (everything published):\n${siteIndex()}\n\nRELEVANT PASSAGES (full text from the site):\n${out.join("\n\n") || "(none matched; use the index)"}`;
  }
  const SYSTEM = (history) => `You are the Outlier Assistant on The Outlier Group's website, a Florida commercial real estate brokerage. Be professional, warm and concise (2-5 short sentences, or a short list).
Answer ONLY from the APPROVED CONTENT below, which is the website's current published content. Use specific details from the passages (names, sizes, rents, zoning, dates, experience) when they answer the question. Never invent listings, prices, availability, people, or policies. Never reveal or guess an off-market property's address or price.
If the answer isn't in the content, say you don't have that information and direct the visitor to [Contact](#contact) or ${COMPANY.phone}.
Link to relevant pages using markdown links with these internal targets only: ${Object.keys(PAGES).join(", ")}, #team-<slug>, #property-<id>, #insight-<slug>. Never link to other websites.
APPROVED CONTENT:
${knowledge(history)}`;

  /* Built-in answer from the site's text (used when the AI isn't available): best matching sentences */
  const SYN = { school: "education university college degree bba graduate", college: "education university degree", degree: "education university bba", study: "education university", studied: "education university",
    wrote: "author", written: "author", writer: "author", author: "wrote", price: "asking rent", cost: "price rent", rent: "base", size: "space building", big: "space building",
    old: "built", built: "year", parking: "parking spaces", zoned: "zoning", worked: "previously", experience: "previously years", email: "email", phone: "phone", call: "phone" };
  function answerFromContent(q) {
    const K = corpus(), qw = [...new Set(words(q + " " + words(q).map((w) => SYN[w] || "").join(" ")))];
    const rare = qw.filter((w) => (K.df[w] || 0) > 0 && K.df[w] <= 3);   // distinctive words (a name, a company, a street number)
    const hits = rank(q).slice(0, 3);
    if (!hits.length || !rare.length) return null;
    const top = hits[0].c;
    const ents = new Set(words(top.title));
    const detail = qw.filter((w) => !ents.has(w));
    if (!detail.length) return null;   // just a name: let the regular answers handle it
    const sentences = top.text.match(/[^.!?]+[.!?]+/g) || [top.text];
    const idf = (w) => Math.log(1 + K.n / (1 + (K.df[w] || 0)));
    const scored = sentences.map((x, i) => { const sw = new Set(words(x)); let s = 0; detail.forEach((w) => { if (sw.has(w)) s += idf(w); }); return { x: x.trim(), i, s }; }).filter((y) => y.s > 0).sort((a, b) => b.s - a.s).slice(0, 2).sort((a, b) => a.i - b.i);
    if (!scored.length) {
      if (top.kind !== "insight" && top.kind !== "listing" && top.kind !== "past") return null;
      return { text: sentences[0].trim(), links: [link(top.link, top.title.replace(/ \(cont\.\)$/, ""))] };   // about that article or property in general
    }
    return { text: scored.map((y) => y.x).join(" "), links: [link(top.link, top.title.replace(/ \(cont\.\)$/, ""))] };
  }
  /* ── Built-in engine ── */
  const TYPES = { office: "Office", medical: "Medical", healthcare: "Medical", retail: "Retail", restaurant: "Retail", "drive-thru": "Retail", land: "Land", lot: "Land", acre: "Land", "mixed": "Mixed Use", residential: "Residential" };
  function findListings(q) {
    const t = Object.keys(TYPES).find((k) => q.includes(k));
    const cityWords = [...new Set(LISTINGS.filter((l) => !l.offMarket).map((l) => l.city.split(",")[0].toLowerCase()))];
    const city = cityWords.find((c) => q.includes(c)) || (q.includes("st pete") || q.includes("st. pete") ? "st. petersburg" : null);
    const deal = /\b(buy|purchase|sale|sell|invest)/.test(q) ? "Sale" : /\b(lease|rent|tenant)/.test(q) ? "Lease" : null;
    let list = avail();
    if (t) list = list.filter((l) => l.type === TYPES[t]);
    if (city) list = list.filter((l) => l.city.toLowerCase().includes(city));
    if (deal) list = list.filter((l) => l.deal === deal);
    return { list, t, city, deal };
  }
  const link = (href, label) => ({ href, label });
  function local(q0) {
    const q = q0.toLowerCase();
    const has = (...w) => w.some((x) => q.includes(x));
    if (has("calculator", "cap rate", "roi", "noi", "cash flow", "cash-on-cash", "return on", "run the numbers", "underwrite")) return { text: `Use the Outlier Investment Calculator in the Client Portal. Enter the purchase price, rental income, vacancy, expenses, lease type (NNN, Modified Gross or Gross), and your financing. It shows NOI, cap rate, total investment, annual cash flow, cash-on-cash ROI, and projected returns over your hold period. Every property page has a Run the Numbers button that opens it pre-filled.`, links: [link("#calculator", "Open the Investment Calculator"), link("#contact", "Talk to an advisor")] };
    if (has("submit", "list my", "sell my", "list a property", "my property", "landlord", "owner")) return { text: `Happy to help you market your property. Share the address, property type, size, and whether you want to sell or lease, and an advisor will follow up with a strategy and valuation. You can also call ${COMPANY.phone}.`, links: [link("#submit-property", "Submit a Property"), link("#services", "Our Services")] };
    if (has("off-market", "off market", "nda", "confidential", "portal", "approval", "approved")) return { text: `Off-market properties are shared only with vetted buyers and investors. In the Client Portal, choose your profile and requirements to see matching off-market properties. On a property's page, select Request Access and sign the NDA online. Our team reviews each request; once it's approved you'll get an email link that unlocks the address, photos, pricing, and the full brochure.`, links: [link("#portal", "Open the Client Portal")] };
    if (has("brochure", "flyer", "download")) return { text: `Every property page has a Download Property Brochure button with the photos, specs, terms, and advisor contact. For off-market properties, the full brochure unlocks after your NDA is approved; before that you can download a confidential teaser.`, links: [link("#portfolio", "Browse the portfolio")] };
    if (has("insight", "article", "market update", "trend", "cap rate", "rates", "news", "blog")) {
      const words = q.split(/\W+/).filter((w) => w.length > 3);
      const hits = INSIGHTS.map((a) => ({ a, s: words.filter((w) => (a.title + " " + a.excerpt).toLowerCase().includes(w)).length })).filter((x) => x.s).sort((x, y) => y.s - x.s).slice(0, 3);
      const list = (hits.length ? hits.map((h) => h.a) : INSIGHTS.slice(0, 3));
      return { text: hits.length ? "Here are the most relevant Market Insights:" : "Our latest Market Insights:", links: list.map((a) => link("#insight-" + a.slug, a.title)).concat([link("#insights", "All Market Insights")]) };
    }
    if (has("job", "career", "hiring", "position", "opening", "work for", "join your", "join the team", "recruit")) {
      const jobs = (typeof CAREERS !== "undefined" && CAREERS.jobs) || [];
      if (jobs.length) return { text: `We're looking for Commercial Real Estate Advisors in ${jobs.map((j) => j.city).join(", ")}. The roles are ${[...new Set(jobs.map((j) => j.workspace.toLowerCase() + " " + j.jobType.toLowerCase()))].join(" / ")} positions. You can apply on the Careers page.`, links: [link("#careers", "See open positions")] };
    }
    const specific = answerFromContent(q0);
    if (specific) return specific;
    const f = findListings(q);
    if (has("available", "properties", "listing", "space", "find", "looking for", "search", "office", "retail", "medical", "land", "lease", "buy") || f.t || f.city) {
      const list = f.list.slice(0, 4);
      const crit = [f.t && TYPES[f.t].toLowerCase(), f.deal && "for " + f.deal.toLowerCase(), f.city && "in " + f.city.replace(/\b\w/g, (c) => c.toUpperCase())].filter(Boolean).join(" ");
      if (list.length) return { text: `We have ${f.list.length} available ${f.t ? TYPES[f.t].toLowerCase() + " " : ""}${f.list.length === 1 ? "property" : "properties"}${f.deal ? " for " + f.deal.toLowerCase() : ""}${f.city ? " in " + f.city.replace(/\b\w/g, (c) => c.toUpperCase()) : ""}. ${f.list.length > list.length ? "Here are the first " + list.length + "." : f.list.length === 1 ? "Here it is." : "Here they are."} For confidential off-market opportunities, use the Client Portal.`, links: list.map((l) => link("#property-" + l.id, `${l.title} · ${l.space}`)).concat([link("#portfolio", "See the full portfolio"), link("#portal", "Off-market matches")]) };
      return { text: `I don't see an available ${crit || "property"} that matches right now. The Client Portal can match you with off-market options, or an advisor can search for you.`, links: [link("#portal", "Open the Client Portal"), link("#contact", "Talk to an advisor")] };
    }
    if (has("service", "what do you do", "help me", "offer", "consult", "1031", "financ", "valuat", "apprais", "broker")) return { text: `We provide ${SERVICES.map((s) => s.name).join(", ")}. From leasing to investment, we guide you at every stage of your commercial real estate journey across Florida.`, links: [link("#services", "Our Services"), link("#contact", "Schedule a Consultation")] };
    if (has("sector", "industrial", "hotel", "marine", "multifamily")) return { text: `We work across ${SECTORS.map((s) => s.name).join(", ")}.`, links: [link("#sectors", "Browse by sector")] };
    const member = TEAM.find((t) => { const [f, ...l] = t.name.toLowerCase().split(" "); return new RegExp("\\b(" + f + "|" + l.join(" ") + (f === "mackinley" ? "|mac" : f === "denzylle" ? "|den" : "") + ")\\b").test(q); });
    if (member) return { text: `${member.name} is ${/^[aeiou]/i.test(member.role) ? "an" : "a"} ${member.role} at The Outlier Group. ${member.bio && member.bio[0] ? member.bio[0].split(/(?<=\.)\s/)[0] : ""} You can reach ${member.name.split(" ")[0]} at ${member.email}${member.phone ? " or " + member.phone : ""}.`, links: [link("#team-" + member.slug, member.name.split(" ")[0] + "'s profile"), link("#our-team", "Meet Our Team")] };
    if (has("team", "who", "agent", "advisor", "broker")) return { text: `Our team: ${TEAM.map((t) => `${t.name} (${t.role})`).join(", ")}. Open anyone's profile for their bio and direct contact details.`, links: [link("#our-team", "Meet Our Team")].concat(TEAM.filter((t) => /Advisor|Broker/.test(t.role)).slice(0, 3).map((t) => link("#team-" + t.slug, t.name))) };
    if (has("contact", "phone", "call", "email", "office", "address", "where are you", "hours")) return { text: `Call ${COMPANY.phone} or email ${COMPANY.email}. Our office is at ${COMPANY.address}, and we serve clients across Florida.`, links: [link("#contact", "Contact form")] };
    const faq = FAQ.find((x) => x.q.toLowerCase().split(/\W+/).filter((w) => w.length > 4).some((w) => q.includes(w)));
    if (faq) return { text: faq.a, links: [link("#why-outlier", "Why Outlier?")] };
    if (has("why", "about", "company", "outlier", "founded", "who are you")) return { text: `The Outlier Group is a Florida commercial real estate firm founded in 2016. We believe in a quality-over-quantity approach, transparency, simplicity, and doing deals that make sense. Real estate, uncomplicated.`, links: [link("#why-outlier", "Why Outlier?")] };
    if (has("hi", "hello", "hey")) return { text: "Hi! I can explain our services, find available properties, walk you through off-market access, or point you to Market Insights. What are you looking for?", links: [] };
    return { text: `I don't have that information on the site. An advisor can help directly at ${COMPANY.phone}, or send us a message.`, links: [link("#contact", "Contact an advisor")] };
  }

  /* ── Remote engines ── */
  let sampleFn = null, sampleChecked = false;
  async function viaSample(history) {
    if (!sampleChecked) { sampleChecked = true; try { sampleFn = window.claude && window.claude.use ? await window.claude.use("sample") : null; } catch (e) { sampleFn = null; } }
    if (!sampleFn) return null;
    const turns = [{ role: "user", content: SYSTEM(history) + "\n\nReply to the visitor's messages that follow." }, { role: "assistant", content: "Understood." }].concat(history.map((m) => ({ role: m.role, content: m.text })));
    const r = await sampleFn(turns, { modelTier: "quick", cache: false });
    return r && r.text ? r.text : null;
  }
  async function viaEndpoint(history) {
    if (!OG_CONFIG.AI_ENABLED || window.OG_PREVIEW) return null;
    const res = await fetch(OG_CONFIG.ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ type: "chat", system: SYSTEM(history), messages: history.map((m) => ({ role: m.role, content: m.text })), sessionId: window.OG && OG.SESSION_ID }) });
    const j = await res.json(); return j && j.status === "ok" && j.text ? j.text : null;
  }
  function mdToHtml(t) {
    let h = esc(t);
    h = h.replace(/\[([^\]]+)\]\((#[a-z0-9-]+)\)/gi, (m, label, href) => `<a href="${href}" class="chat-link">${label}</a>`);
    h = h.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/gi, "$1");
    h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/^\s*[-•]\s+(.+)$/gm, "<li>$1</li>").replace(/(<li>[\s\S]*?<\/li>)(?![\s\S]*<li>)/, "<ul>$1</ul>");
    return h.replace(/\n{2,}/g, "<br><br>").replace(/\n/g, "<br>");
  }

  /* ── UI ── */
  function mount() {
    const btn = document.createElement("button");
    btn.className = "chat-fab"; btn.type = "button"; btn.setAttribute("aria-label", "Open the Outlier Assistant"); btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg><span>Ask Outlier</span>`;
    const panel = document.createElement("section");
    panel.className = "chat-panel"; panel.setAttribute("aria-label", "Outlier Assistant"); panel.hidden = true;
    panel.innerHTML = `
      <header class="chat-head">
        <img src="assets/img/site/og-monogram.png" alt="" class="logo-mono">
        <div><b>Outlier Assistant</b><span>Commercial real estate help · answers from our site</span></div>
        <button type="button" class="icon-btn" data-chat-close aria-label="Close assistant">✕</button>
      </header>
      <div class="chat-log" id="chatLog" aria-live="polite"></div>
      <div class="chat-suggest" id="chatSuggest">${SUGGESTED.map((s) => `<button type="button" class="chip">${esc(s)}</button>`).join("")}</div>
      <form class="chat-form" id="chatForm"><label class="sr-only" for="chatInput">Ask a question</label>
        <input class="input" id="chatInput" autocomplete="off" placeholder="Ask about properties, services, off-market access…" maxlength="500">
        <button class="btn primary small" type="submit" aria-label="Send">Send</button></form>
      <p class="chat-note">The assistant uses only The Outlier Group's published information. For anything else, <a href="#contact">contact an advisor</a>.</p>`;
    document.body.append(btn, panel);
    const open = (v) => { panel.hidden = !v; btn.setAttribute("aria-expanded", String(v)); btn.classList.toggle("open", v); if (v) { render(); setTimeout(() => $("#chatInput").focus(), 50); } };
    btn.addEventListener("click", () => open(panel.hidden));
    panel.querySelector("[data-chat-close]").addEventListener("click", () => open(false));
    panel.addEventListener("click", (e) => {
      const c = e.target.closest("#chatSuggest .chip"); if (c) ask(c.textContent);
      const a = e.target.closest("a[href^='#']"); if (a && window.innerWidth < 700) open(false);
    });
    $("#chatForm").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#chatInput").value.trim(); if (v) { $("#chatInput").value = ""; ask(v); } });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) open(false); });
    window.OG = window.OG || {}; OG.openAssistant = (q) => { open(true); if (q) ask(q); };
  }
  function render() {
    const log = $("#chatLog"); if (!log) return;
    const greet = `<div class="msg bot"><p>Hi, I'm the Outlier Assistant. I can explain our services, find available properties, walk you through off-market access and the NDA, or point you to Market Insights.</p></div>`;
    log.innerHTML = greet + state.msgs.map((m) => m.role === "user"
      ? `<div class="msg user"><p>${esc(m.text)}</p></div>`
      : `<div class="msg bot"><p>${mdToHtml(m.text)}</p>${m.links && m.links.length ? `<div class="msg-links">${m.links.map((l) => `<a href="${l.href}">${esc(l.label)} →</a>`).join("")}</div>` : ""}</div>`).join("")
      + (state.busy ? `<div class="msg bot typing"><span></span><span></span><span></span></div>` : "");
    log.scrollTop = log.scrollHeight;
    $("#chatSuggest").hidden = state.msgs.length > 0;
  }
  async function ask(q) {
    if (state.busy) return;
    state.msgs.push({ role: "user", text: q }); state.busy = true; render();
    const history = state.msgs.slice(-10).map((m) => ({ role: m.role, text: m.text }));
    let text = null, links = [];
    try { text = await viaSample(history); } catch (e) { text = null; }
    if (!text) { try { text = await viaEndpoint(history); } catch (e) { text = null; } }
    if (!text) { const r = local(q); text = r.text; links = r.links; }
    state.busy = false; state.msgs.push({ role: "assistant", text, links }); save(); render();
    try { window.OG && OG.post && OG.post({ type: "log", sheet: "Assistant_Questions", row: { Timestamp: new Date().toISOString(), SessionID: OG.SESSION_ID, Question: q.slice(0, 500), Page: location.hash } }); } catch (e) {}
  }
  document.addEventListener("DOMContentLoaded", mount);
})();

/* ════════════════════════════════════════════════════════════
   Listing Intelligence: Create a Listing (9-step CRE intake)
   Same fields, validation, automation panel and workflow as the
   approved mockup. Rendered by dc-lite.js. Talks to a backend only
   through window.ListingIntakeBackend (intake-backend.js); in demo
   mode nothing leaves the browser.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { step: 1, wf: 0, preview: false, toast: "", log: ["Draft created from the CRE Listing Intake Form"], vals: Component.initialVals(), files: Component.initialFiles(), drag: false };
  }
  static cfg() { return window.LISTING_INTAKE_CONFIG || {}; }
  static demo() { return Component.cfg().DEMO_MODE !== false; }
  static initialVals() {
    if (Component.cfg().START_WITH_SAMPLE !== false) return Component.sample();
    const s = Component.sample(), blank = {};
    Object.keys(s).forEach((k) => (blank[k] = ""));
    return Object.assign(blank, { state: "FL", commPref: "Email", investment: "Investment type", confidential: "No" });
  }
  static initialFiles() { return Component.cfg().START_WITH_SAMPLE !== false ? Component.sampleFiles() : []; }
  /* Plain snapshot of the listing for the backend (no browser-only blob URLs) */
  snapshot() {
    const S = this.state;
    return { listingId: S.listingId || "", revision: S.revision || 1, status: ["Draft", "In Review", "Approved", "Excel Created", "Flyer Created", "Ready for Review", "Published"][S.wf] || "Draft",
      values: Object.assign({}, S.vals), files: (S.files || []).map((f) => ({ id: f.id, kind: f.kind, name: f.name, size: f.size, category: f.category || "", web: !!f.web })) };
  }
  /* Sends an action to the backend when one is configured; does nothing in demo mode */
  emit(action) {
    try { if (window.ListingIntakeBackend) window.ListingIntakeBackend.send(action, this.snapshot(), this); } catch (e) { console.warn("[listing-intake]", e); }
  }
  static sampleFiles() {
    return [
      { id: "p1", kind: "image", name: "IMG_2041.png", size: 2400000, conv: true },
      { id: "p2", kind: "image", name: "IMG_2044.jpg", size: 3100000 },
      { id: "p3", kind: "image", name: "IMG_2050.jpg", size: 2800000 },
      { id: "d1", kind: "doc", name: "Floor plan - Unit B.pdf", size: 1200000, category: "Floor Plan", web: true },
      { id: "d2", kind: "doc", name: "Rent roll 2026.xlsx", size: 84000, category: "Rent Roll", web: false }
    ];
  }
  static guessCat(name) {
    const n = name.toLowerCase();
    if (/floor/.test(n)) return "Floor Plan";
    if (/site|survey/.test(n)) return "Site Plan / Survey";
    if (/flyer|brochure|offering|\bom\b/.test(n)) return "Brochure / Flyer";
    if (/rent.?roll|tenant/.test(n)) return "Rent Roll";
    if (/environment|phase/.test(n)) return "Environmental Report";
    if (/report|inspection|appraisal/.test(n)) return "Property Report";
    return "Other";
  }
  setFiles(files, extra) {
    const vals = Object.assign({}, this.state.vals);
    if (files.some((f) => f.kind === "image")) vals.photosAvail = "Yes";
    if (files.some((f) => f.kind === "doc" && f.category === "Floor Plan")) vals.floorPlan = "Yes";
    if (files.some((f) => f.kind === "doc" && f.category === "Site Plan / Survey")) vals.sitePlan = "Yes";
    this.setState(Object.assign({ files, vals }, extra || {}));
  }
  addFiles(list) {
    const arr = Array.prototype.slice.call(list || []), add = [], bad = [];
    arr.forEach((f) => {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      if (/^(heic|heif)$/.test(ext)) { bad.push(f.name + " (HEIC: export as JPG first)"); return; }
      if (f.size > 25 * 1024 * 1024) { bad.push(f.name + " (over 25 MB)"); return; }
      const img = /^image\//.test(f.type || "") || /^(jpe?g|png|webp|gif)$/.test(ext);
      let url = ""; if (img) { try { url = URL.createObjectURL(f); } catch (e) {} }
      const cat = img ? "" : Component.guessCat(f.name);
      add.push({ id: "u" + Date.now() + Math.random().toString(36).slice(2, 6), kind: img ? "image" : "doc", name: f.name, size: f.size, url, conv: img && ext !== "jpg" && ext !== "jpeg", category: cat, web: cat === "Brochure / Flyer" || cat === "Floor Plan" });
    });
    if (add.length) this.setFiles(this.state.files.concat(add), { log: this.addLog(add.length + (add.length === 1 ? " file uploaded" : " files uploaded")) });
    if (bad.length) this.flash("Not added: " + bad.join(", "));
    else if (add.length) this.flash(add.length + (add.length === 1 ? " file added" : " files added"));
  }
  static sample() {
    return {
  name: "", address: "2500 Central Ave", unit: "Unit B", city: "St. Petersburg", state: "FL", zip: "33713", county: "Pinellas", parcel: "",
  type: "Retail", zoning: "CCT-1 (Corridor Commercial Traditional)", demographics: "• [Population, 5-mile]\n• [Median household income]\n• [Traffic count on Central Ave]",
  ownerName: "[Owner name]", ownerEntity: "", ownerEmail: "[owner@email.com]", ownerPhone: "", dmName: "", dmContact: "", commPref: "Email",
  availSF: "1,850 SF", bldgSF: "6,400 SF", minDiv: "900 SF", maxCont: "1,850 SF", land: "0.28 AC", lotDim: "", yearBuilt: "1962", yearReno: "2019", buildings: "1", stories: "1",
  ceiling: "12'", curbCuts: "2", parking: "12 on-site spaces, surface", industrial: "", hvac: "", roof: "", condition: "Good", features: "Pylon signage\nFront and rear entrances\nCorner visibility", utilities: "",
  forSale: "No", askPrice: "", investment: "Investment type", capRate: "", noi: "", taxes: "", hoa: "", occDate: "Immediately", occStatus: "Vacant", tenants: "No", leaseIncome: "No", rentRoll: "",
  forLease: "Yes", tenancy: "Multi-Tenant", baseRent: "$24.00", nnn: "$6.50", otherExp: "", leaseType: "NNN", term: "3–5 years", ti: "",
  usesNotAllowed: "", permits: "", environmental: "", insurance: "", photosAvail: "Yes", floorPlan: "Yes", sitePlan: "No", reports: "",
  showing: "", signage: "Yes", confidential: "No", channels: "Website, Crexi, LoopNet, email blast", agent: "Laurie Lane", status: "Available",
  headline: "Corner Retail Space on Central Avenue", idealUses: "coffee, retail, or service users",
  description: "A corner retail suite on Central Avenue with strong visibility, pylon signage and on-site parking, a short walk from the Grand Central District.",
  highlights: "Hard corner with pylon signage\nFront and rear entrances\n12 on-site parking spaces\nWalkable to the Grand Central District", notes: ""
};
  }
  runAuto(from, sim) {
    clearTimeout(this._a); clearTimeout(this._b); clearTimeout(this._c);
    const conf = this.state.vals.confidential === "Yes";
    const flyer = () => {
      this.setState({ running: "flyer" });
      this._b = setTimeout(() => {
        if (sim === "Flyer step") { this.flash("Flyer creation failed. Agent, Natasha and solutions@ were notified", { fail: "flyer", running: null, wf: 3, log: this.addLog("Flyer Failed: PHOTO_3 empty (3 tries)") }); return; }
        this.setState({ wf: 4, running: "review", fail: null, log: this.addLog(conf ? "Flyer skipped (confidential)" : "Flyer Created in Canva + PDF saved") });
        this._c = setTimeout(() => this.setState({ wf: 5, running: null, log: this.addLog("Ready for Review: team emailed") }), 1200);
      }, 1800);
    };
    this.setState({ fail: null, running: from });
    if (from === "flyer") { flyer(); return; }
    this._a = setTimeout(() => {
      if (sim === "Excel step") { this.flash("Excel creation failed. Natasha and solutions@ were notified", { fail: "excel", running: null, wf: 2, log: this.addLog("Excel Failed: template not found (3 tries)") }); return; }
      this.setState({ wf: 3, log: this.addLog("Excel Created from 1325 W Cass template") });
      flyer();
    }, 1600);
  }
  flash(msg, extra) {
    clearTimeout(this._t);
    this.setState(Object.assign({ toast: msg }, extra || {}));
    this._t = setTimeout(() => this.setState({ toast: "" }), 2800);
  }
  addLog(line) { return [line].concat(this.state.log).slice(0, 5); }
  setVal(k, v) { const vals = Object.assign({}, this.state.vals); vals[k] = v; this.setState({ vals }); }
  renderVals() {
    const S = this.state, v = S.vals, step = S.step;
    const num = (x) => { const n = parseFloat(String(x || "").replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; };
    const money = (n, d) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
    const sale = v.forSale === "Yes", lease = v.forLease === "Yes", conf = v.confidential === "Yes";
    const sf = num(v.availSF);
    const ppsfN = sale && num(v.askPrice) && sf ? num(v.askPrice) / sf : 0;
    const grossN = lease ? num(v.baseRent) + num(v.nnn) + num(v.otherExp) : 0;
    const monthlyN = grossN && sf ? grossN * sf / 12 : 0;
    const REGION = { Pinellas: "West Florida", Hillsborough: "West Florida", Pasco: "West Florida", Hernando: "West Florida", Orange: "East Florida", Brevard: "East Florida", Duval: "North Florida", "Miami-Dade": "South Florida" };
    const autoVals = { ppsf: ppsfN ? money(ppsfN, 2) : "", grossRent: grossN ? money(grossN, 2) + " PSF" : "", monthlyRent: monthlyN ? money(Math.round(monthlyN)) : "", region: REGION[v.county] || "" };
    const T = "text", A = "area", SEL = "select", YN = "yn";
    const SECTIONS = [
      { title: "Basic Property & Location Info", short: "Property & Location", desc: "Type the address: city, state, zip, county and region fill in automatically.", fields: [
        ["name", "Property Name", { vis: "web", conf: 1, ph: "Leave blank to use the address" }],
        ["address", "Property Address", { vis: "web", req: 1, conf: 1, span: 2 }],
        ["unit", "Unit / Suite #", { vis: "web", conf: 1, added: 1, hint: "Needed for the website's \"Unit # & Space Available\"." }],
        ["city", "City", { vis: "web", req: 1, auto: 1 }],
        ["state", "State", { vis: "web", auto: 1 }],
        ["zip", "Zip Code", { vis: "web", auto: 1, conf: 1 }],
        ["county", "County", { vis: "web", req: 1, auto: 1, kind: SEL, opts: ["Pinellas", "Hillsborough", "Pasco", "Hernando", "Orange", "Brevard", "Duval", "Miami-Dade"] }],
        ["region", "Region", { vis: "web", auto: 1, calc: 1, added: 1, hint: "From county, using the website's region filter." }],
        ["parcel", "Parcel Number(s)", { vis: "int", ph: "e.g. 23-31-16-12345-000-0010", hint: "Also used for the duplicate check." }],
        ["type", "Property Type (Retail, Office, Industrial, Medical, Land, Other)", { vis: "web", req: 1, kind: SEL, opts: ["Retail", "Office", "Industrial", "Medical", "Land", "Other"], span: 2 }],
        ["zoning", "Zoning Description", { vis: "web" }],
        ["demographics", "5-mile radius Demographics (Bullet Form)", { vis: "web", kind: A, span: 3, hint: "Shown under \"Area & Traffic\" on the property page." }]
      ] },
      { title: "Owner & Contact Information", short: "Owner & Contact", desc: "Who owns the property and who makes decisions. Never published.", fields: [
        ["ownerName", "Owner Name", { vis: "res", req: 1, ph: "[Owner name]" }],
        ["ownerEntity", "Owner Entity Name (LLC, Corp, etc.)", { vis: "res", ph: "[Entity name]" }],
        ["ownerEmail", "Owner Email", { vis: "res", req: 1, ph: "[owner@email.com]" }],
        ["ownerPhone", "Owner Phone", { vis: "res", ph: "[(000) 000-0000]" }],
        ["dmName", "Decision Maker Name", { vis: "res", ph: "If different from owner" }],
        ["dmContact", "Decision Maker Email / Phone", { vis: "res" }],
        ["commPref", "Preferred Communication Method", { vis: "res", kind: SEL, opts: ["Email", "Phone call", "Text", "Through attorney / rep"] }]
      ] },
      { title: "Building & Site Specifications", short: "Building & Site", desc: "Sizes feed the website's spec rows, size filters and Client Portal matching.", fields: [
        ["availSF", "Total Available SF", { vis: "web", req: 1 }],
        ["bldgSF", "Building Size (SF)", { vis: "web", req: 1, added: 1, hint: "Needed for the website's \"Building Size\" spec." }],
        ["minDiv", "Min Divisible SF", { vis: "web" }],
        ["maxCont", "Max Contiguous SF", { vis: "web" }],
        ["land", "Land Size (Acres or SF)", { vis: "web" }],
        ["lotDim", "Lot Dimensions", { vis: "web" }],
        ["yearBuilt", "Year Built", { vis: "web" }],
        ["yearReno", "Year Renovated", { vis: "web" }],
        ["buildings", "Number of Buildings", { vis: "web" }],
        ["stories", "Number of Stories/Floors", { vis: "web" }],
        ["ceiling", "Ceiling Height/Clear Height", { vis: "web" }],
        ["curbCuts", "Number of Curb Cuts / Access Points", { vis: "web" }],
        ["parking", "Parking Details (Ratio, Spaces, Type)", { vis: "web", span: 2 }],
        ["industrial", "Industrial Specs (Loading Docks, Drive-in Doors, Power)", { vis: "web" }],
        ["hvac", "HVAC Age & Condition", { vis: "int" }],
        ["roof", "Roof Age & Condition", { vis: "int" }],
        ["condition", "Property Condition", { vis: "int", kind: SEL, opts: ["Excellent", "Good", "Fair", "Needs work"] }],
        ["features", "Property Features / Amenities", { vis: "web", kind: A, span: 2, hint: "One per line." }],
        ["utilities", "Utilities & Providers", { vis: "int", kind: A }]
      ] },
      { title: "Sale Details", short: "Sale Details", desc: "Only needed when the property is for sale. Pricing is always approved by a person.", fields: [
        ["forSale", "For Sale? (Y/N)", { vis: "web", kind: YN, req: 1 }],
        ["askPrice", "Asking Price", { vis: "web", conf: 1, req: 1, onlyIf: "sale" }],
        ["ppsf", "Price / SF", { vis: "web", conf: 1, auto: 1, calc: 1, onlyIf: "sale" }],
        ["investment", "Investment Details", { vis: "web", kind: SEL, onlyIf: "sale", opts: ["Investment type", "Institutional", "Stabilized", "Value Add", "Redevelopment", "Owner/User", "Core+", "Core", "Net Lease", "Sale/Leaseback"] }],
        ["capRate", "Cap Rate (if income-producing)", { vis: "web", conf: 1, onlyIf: "sale" }],
        ["noi", "NOI (if applicable)", { vis: "web", conf: 1, onlyIf: "sale" }],
        ["taxes", "Annual Property Taxes & Tax Year", { vis: "int", onlyIf: "sale" }],
        ["hoa", "HOA / Association Fees", { vis: "int", onlyIf: "sale" }],
        ["occDate", "Available Occupancy Date", { vis: "web", onlyIf: "sale", shared: 1 }],
        ["occStatus", "Occupancy Status (Vacant, Occupied, Partial)", { vis: "web", kind: SEL, opts: ["Vacant", "Occupied", "Partial"], onlyIf: "sale", shared: 1 }],
        ["tenants", "Existing Tenants (Y/N)", { vis: "int", kind: YN, onlyIf: "sale", shared: 1 }],
        ["leaseIncome", "Existing Lease Agreements / Income? (Y/N)", { vis: "int", kind: YN, onlyIf: "sale", shared: 1 }],
        ["rentRoll", "Tenant Grid / Rent Roll (for retail)", { vis: "int", kind: A, onlyIf: "sale", shared: 1, span: 2 }]
      ] },
      { title: "Lease Details", short: "Lease Details", desc: "Only needed when the property is for lease. Rates are saved under the labels the website's investment calculator reads.", fields: [
        ["forLease", "For Lease? (Y/N)", { vis: "web", kind: YN, req: 1 }],
        ["tenancy", "Tenancy Type (Single vs. Multi-Tenant)", { vis: "web", kind: SEL, opts: ["Single-Tenant", "Multi-Tenant"], onlyIf: "lease" }],
        ["baseRent", "Base Rent / PSF", { vis: "web", conf: 1, req: 1, onlyIf: "lease" }],
        ["nnn", "NNN or CAM Expenses / PSF", { vis: "web", conf: 1, onlyIf: "lease" }],
        ["otherExp", "Other Expenses", { vis: "web", conf: 1, onlyIf: "lease" }],
        ["grossRent", "Total Gross Rent / PSF", { vis: "web", conf: 1, auto: 1, calc: 1, onlyIf: "lease" }],
        ["monthlyRent", "Total Monthly Rent", { vis: "web", conf: 1, auto: 1, calc: 1, onlyIf: "lease" }],
        ["leaseType", "Lease Type (NNN, Gross, Modified)", { vis: "web", kind: SEL, opts: ["NNN", "Gross", "Modified Gross"], onlyIf: "lease" }],
        ["term", "Lease Term Limits (Min/Max)", { vis: "web", onlyIf: "lease" }],
        ["ti", "Tenant Improvement (TI) Allowance", { vis: "int", onlyIf: "lease" }],
        ["occDate", "Available Occupancy Date", { vis: "web", onlyIf: "lease", shared: 1 }],
        ["occStatus", "Occupancy Status (Vacant, Occupied, Partial)", { vis: "web", kind: SEL, opts: ["Vacant", "Occupied", "Partial"], onlyIf: "lease", shared: 1 }],
        ["tenants", "Existing Tenants (Y/N)", { vis: "int", kind: YN, onlyIf: "lease", shared: 1 }],
        ["leaseIncome", "Existing Lease Agreements / Income? (Y/N)", { vis: "int", kind: YN, onlyIf: "lease", shared: 1 }],
        ["rentRoll", "Tenant Grid / Rent Roll (for retail)", { vis: "int", kind: A, onlyIf: "lease", shared: 1, span: 2 }]
      ] },
      { title: "Compliance, Media, & Documents", short: "Compliance & Media", desc: "Internal due-diligence notes. You upload the actual photos and documents in the next step, and the Y/N questions below fill in automatically from your uploads.", fields: [
        ["usesNotAllowed", "Uses Not Allowed or Conflicting? (Y/N, with Notes)", { vis: "int", kind: A }],
        ["permits", "Permits or Licenses Required (Y/N, Notes)", { vis: "int", kind: A }],
        ["environmental", "Environmental Concerns (Yes/No — if yes, notes)", { vis: "int", kind: A }],
        ["insurance", "Insurance / Warranties", { vis: "int" }],
        ["photosAvail", "Photos Available? (Y/N)", { vis: "int", kind: YN }],
        ["floorPlan", "Floor Plan Available? (Y/N)", { vis: "int", kind: YN }],
        ["sitePlan", "Site Plan / Survey Available? (Y/N)", { vis: "int", kind: YN }],
        ["reports", "Property Reports Available (Y/N, Notes)", { vis: "int", span: 2 }]
      ] },
      { title: "Images & Documents", short: "Images & Documents", upload: 1, desc: "Upload property photos and any documents: flyers, floor plans, site plans, surveys, rent rolls or reports. (Added: not a section in your template.)", fields: [] },
      { title: "Brokerage & Marketing (Internal)", short: "Brokerage & Marketing", desc: "Marketing copy for the website and listing sites, plus internal broker details.", fields: [
        ["showing", "Showing Instructions & Lockbox Code", { vis: "res", kind: A, span: 2, hint: "Restricted: never exported, emailed or published." }],
        ["signage", "Signage Available? (Yes/No)", { vis: "web", kind: YN }],
        ["confidential", "Confidential Listing? (Y/N — if yes, notes)", { vis: "int", kind: YN, hint: "Yes = off-market: website shows a locked teaser, details released under NDA." }],
        ["channels", "Preferred Marketing Channels", { vis: "int", span: 2 }],
        ["agent", "Assigned Agent", { vis: "web", req: 1, kind: SEL, opts: ["Laurie Lane", "Joyce Teixeira", "Mackinley Autrey", "Jason Clemmey", "Outlier Solutions Team"] }],
        ["status", "Listing Status", { vis: "web", req: 1, added: 1, kind: SEL, opts: ["Available", "Pending", "Leased", "Sold"], hint: "Needed for the website's status label." }],
        ["headline", "Headline for Marketing (e.g 2nd Generation Restaurant Space)", { vis: "web", req: 1, span: 2 }],
        ["idealUses", "Ideal Uses", { vis: "web", span: 3, hint: "Shown as \"Ideal for …\" under the headline." }],
        ["description", "Marketing Description (Crexi, Loopnet, etc)", { vis: "web", req: 1, kind: A, span: 3 }],
        ["highlights", "Highlight Features (For Flyers)", { vis: "web", kind: A, span: 2, hint: "One per line. Used on the website and brochure." }],
        ["notes", "Broker Notes (Internal Use Only)", { vis: "int", kind: A }]
      ] }
    ];
    const active = (fd) => !fd.onlyIf || (fd.onlyIf === "sale" ? sale : lease);
    const sharedHidden = (si, fd) => fd.shared && si === 4 && sale;   // shared occupancy fields asked once, under Sale
    const BADGE = {
      web: ["Website", "font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#7FC4FF;background:rgba(47,128,237,.14);border-radius:999px;padding:2px 8px"],
      int: ["Internal", "font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#AFC3D6;background:rgba(143,175,200,.14);border-radius:999px;padding:2px 8px"],
      res: ["Restricted", "font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#F2C94C;background:rgba(242,201,76,.14);border-radius:999px;padding:2px 8px"],
      nda: ["NDA", "font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#FF9B9B;background:rgba(255,107,107,.16);border-radius:999px;padding:2px 8px"]
    };
    const visOf = (fd) => conf && fd.conf && fd.vis === "web" ? "nda" : fd.vis;
    const valOf = (key, fd) => fd.calc ? autoVals[key] : (v[key] || "");
    const isEmpty = (key, fd) => !String(valOf(key, fd)).trim();
    const segOn = "background:#2F80ED;color:#fff", segOff = "background:transparent;color:#C9D6E3";
    // required / issues
    const issuesRaw = [];
    SECTIONS.forEach((sec, si) => sec.fields.forEach(([key, label, fd]) => { if (fd.req && active(fd) && !sharedHidden(si, fd) && isEmpty(key, fd)) issuesRaw.push({ step: si + 1, text: label.replace(/ \(.*\)$/, "") + " is required" }); }));
    if (!sale && !lease) issuesRaw.push({ step: 4, text: "Choose For Sale, For Lease, or both" });
    const street = String(v.address || "").replace(/^\d+\s*/, "").split(/\s+/)[0];
    if (conf && street && new RegExp("\\b" + street + "\\b", "i").test(v.description || "")) issuesRaw.push({ step: 8, text: "Description names the street (\"" + street + "\") on a confidential listing", warn: 1 });
    if (!(S.files || []).some((f) => f.kind === "image") && !conf && /Available|Pending/.test(v.status || "")) issuesRaw.push({ step: 7, text: "Add at least one photo for the website listing", warn: 1 });
    let totalReq = 0, doneReq = 0;
    SECTIONS.forEach((sec, si) => sec.fields.forEach(([key, , fd]) => { if (fd.req && active(fd) && !sharedHidden(si, fd)) { totalReq++; if (!isEmpty(key, fd)) doneReq++; } }));
    const issuesAt = (n) => issuesRaw.filter((i) => i.step === n);
    const go = (n) => () => this.setState({ step: n, preview: false });
    // current section fields
    let fields = [];
    const sec = SECTIONS[step - 1];
    if (sec) fields = sec.fields.filter(([, , fd], i) => (active(fd) || !fd.onlyIf) && !sharedHidden(step - 1, fd)).map(([key, label, fd]) => {
      const kind = fd.kind || T, vis = visOf(fd), val = valOf(key, fd), missing = fd.req && !String(val).trim();
      return { id: "f_" + key, label, req: !!fd.req, auto: !!fd.auto, added: !!fd.added, badge: BADGE[vis][0], badgeStyle: BADGE[vis][1],
        isText: kind === T, isArea: kind === A, isSelect: kind === SEL, isYN: kind === YN, opts: fd.opts || [], val, ph: fd.ph || "",
        set: (e) => { if (!fd.calc) this.setVal(key, e.target.value); },
        yes: () => this.setVal(key, "Yes"), no: () => this.setVal(key, "No"),
        yesStyle: val === "Yes" ? segOn : segOff, noStyle: val === "No" ? segOn : segOff,
        span: "grid-column: span " + (fd.span || 1),
        inStyle: (fd.auto ? "border-color:rgba(47,128,237,.5);background:rgba(47,128,237,.08);" : "") + (missing ? "border-color:#FF6B6B;" : "") + (kind === A ? "min-height:" + (fd.span === 3 ? 120 : 96) + "px;" : ""),
        hasHint: !!(missing || fd.hint), hint: missing ? "Required" : fd.hint || "", hintStyle: "margin:0;font-size:12.5px;color:" + (missing ? "#FF8A8A" : "#8FAFC8") };
    });
    const steps = SECTIONS.map((s, i) => ({ label: s.short })).concat([{ label: "Review & Submit" }]).map((s, i) => {
      const n = i + 1, cur = n === step, bad = n < 9 ? issuesAt(n).length : issuesRaw.length, visited = n < step;
      return { label: s.label, pick: go(n), mark: visited && !bad ? "✓" : String(n),
        sub: n === 4 && !sale ? "Not for sale · skipped" : n === 5 && !lease ? "Not for lease · skipped" : bad ? bad + (bad === 1 ? " item needs attention" : " items need attention") : cur ? "In progress" : visited ? "Complete" : "Not started",
        rowStyle: "display:flex;align-items:center;gap:12px;width:100%;min-height:50px;padding:7px 10px;border-radius:12px;border:0;cursor:pointer;color:#F0F4F8;font:inherit;" + (cur ? "background:rgba(47,128,237,.16);box-shadow:inset 0 0 0 1px rgba(47,128,237,.45)" : "background:transparent"),
        numStyle: "flex-shrink:0;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;" + (cur ? "background:#2F80ED;color:#fff" : visited && !bad ? "background:rgba(52,168,108,.2);color:#7FD8A6" : bad ? "background:rgba(242,201,76,.18);color:#F2C94C" : "background:rgba(143,175,200,.14);color:#8FAFC8"),
        subStyle: "font-size:11.5px;color:" + (bad ? "#F2C94C" : "#8FAFC8") };
    });
    const WF = ["Draft", "In Review", "Approved", "Excel Created", "Flyer Created", "Ready for Review", "Published"];
    const failAt = S.fail === "excel" ? 3 : S.fail === "flyer" ? 4 : -1;
    const wfSteps = WF.map((label, i) => {
      const failed = i === failAt, cur = i === S.wf && !failed, done = i < S.wf || (failAt > -1 && i < failAt);
      return { label: failed ? (S.fail === "excel" ? "Excel Failed" : "Flyer Failed") : label, arrow: i < WF.length - 1,
        style: "font-size:12px;padding:5px 10px;border-radius:999px;white-space:nowrap;" + (failed ? "background:rgba(255,107,107,.18);color:#FF9B9B;border:1px solid #FF6B6B" : cur ? (i === 6 ? "background:rgba(52,168,108,.2);color:#7FD8A6;border:1px solid rgba(52,168,108,.5)" : "background:rgba(47,128,237,.2);color:#fff;border:1px solid #2F80ED") : done ? "color:#7FD8A6;border:1px solid rgba(52,168,108,.3)" : "color:#8FAFC8;border:1px solid rgba(143,175,200,.2)") };
    });
    const JOBS = [["approve", "Natasha approves · data frozen (rev 1)"], ["excel", "Excel file from 1325 W Cass template"], ["flyer", "Canva flyer from " + (sale && !lease ? "Sale" : "Lease") + " template"], ["review", "Team review email sent"]];
    const xlsxName = "Listing Intake - " + (v.address || "Property Address") + ".xlsx";
    const flyerName = "2026 - " + (v.name || v.address || "Property") + " " + (sale && !lease ? "Sale" : "Lease") + " Flyer";
    const jobState = (k) => {
      const reached = { approve: 2, excel: 3, flyer: 4, review: 5 }[k];
      if (S.fail === k) return "failed";
      if (S.wf >= reached) return "done";
      if (S.running === k) return "running";
      return "waiting";
    };
    const jobs = JOBS.map(([k, label]) => { const st = jobState(k);
      const sub = st === "done" ? ({ approve: "Approved by Natasha S.", excel: xlsxName + " · private listing folder", flyer: conf ? "Skipped: confidential listing (no public flyer)" : flyerName + " · PDF saved", review: "Sent to Natasha, " + (v.agent || "agent") + ", solutions@" })[k]
        : st === "failed" ? (k === "excel" ? "Failed after 3 tries: master template not found. Natasha + solutions@ notified." : "Failed after 3 tries: photo frame PHOTO_3 has no image. Agent, Natasha + solutions@ notified.")
        : st === "running" ? "Working…" : S.wf >= 2 ? "Waiting for the previous step" : "Waiting · starts only after Natasha approves";
      return { label, sub, mark: st === "done" ? "✓" : st === "failed" ? "!" : st === "running" ? "…" : "·",
        dotStyle: "flex-shrink:0;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;" + (st === "done" ? "background:rgba(52,168,108,.2);color:#7FD8A6" : st === "failed" ? "background:rgba(255,107,107,.2);color:#FF9B9B" : st === "running" ? "background:rgba(47,128,237,.25);color:#fff" : "background:rgba(143,175,200,.12);color:#8FAFC8"),
        subStyle: "font-size:11.5px;line-height:1.4;color:" + (st === "failed" ? "#FF9B9B" : st === "done" ? "#9FB8CC" : "#8FAFC8") }; });
    const addrFull = [v.address, v.unit].filter(Boolean).join(", ");
    const typ = v.type || "Commercial";
    const title = conf ? "Confidential " + typ + " Opportunity" : (v.name || v.address || "Untitled listing");
    const slugify = (s) => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = conf ? "om-" + slugify(v.city || "fl") + "-" + slugify(typ) : slugify(v.name || v.address || "listing");
    const dealText = sale && lease ? "Sale or Lease" : sale ? "Sale" : lease ? "Lease" : "—";
    // counts per visibility across active fields
    let nWeb = 0, nInt = 0, nRes = 0;
    SECTIONS.forEach((s, si) => s.fields.forEach(([key, , fd]) => { if (!active(fd) || sharedHidden(si, fd)) return; const vi = visOf(fd); if (vi === "web") nWeb++; else if (vi === "int") nInt++; else nRes++; }));
    const review = SECTIONS.map((s, si) => {
      const fl = s.fields.filter(([, , fd]) => active(fd) && !sharedHidden(si, fd));
      const filled = fl.filter(([key, , fd]) => !isEmpty(key, fd)).length, bad = issuesAt(si + 1);
      const skipped = (si === 3 && !sale) || (si === 4 && !lease);
      if (s.upload) { const ni = (S.files || []).filter((f) => f.kind === "image").length, nd = (S.files || []).length - ni; return { label: s.title, go: go(si + 1), count: ni + " photos · " + nd + " documents", state: bad.length ? "! " + bad[0].text : "✓ Ready", style: "font-size:13px;text-align:right;max-width:330px;color:" + (bad.length ? "#F2C94C" : "#7FD8A6") }; }
      return { label: s.title, go: go(si + 1), count: skipped ? "Skipped" : filled + " of " + fl.length + " answered",
        state: skipped ? "—" : bad.length ? "✕ " + bad[0].text : "✓ Ready",
        style: "font-size:13px;text-align:right;max-width:330px;color:" + (skipped ? "#8FAFC8" : bad.length ? (bad[0].warn ? "#F2C94C" : "#FF8A8A") : "#7FD8A6") };
    });
    const issues = issuesRaw.map((i) => ({ where: "Section " + i.step, text: i.text, go: go(i.step),
      style: "display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;width:100%;min-height:44px;padding:9px 12px;border-radius:10px;cursor:pointer;font:inherit;font-size:13px;" + (i.warn ? "background:rgba(242,201,76,.08);border:1px solid rgba(242,201,76,.35);color:#F6E3A6" : "background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.4);color:#FFD2D2") }));
    const wf = S.wf, LABELS = steps.map((s) => s.label);
    const hl = String(v.highlights || "").split(/\n/).filter(Boolean);
    const pvFacts = conf
      ? [{ k: "Property Type", v: typ }, { k: "Offered For", v: dealText }, { k: "Market", v: (v.city || "") + " · " + (v.county || "") + " County" }, { k: "Address", v: "Released after NDA approval" }, { k: "Pricing", v: "Provided by your advisor" }]
      : [{ k: "Status", v: v.status || "Available" }].concat(
          lease ? [{ k: "Base Rent", v: v.baseRent ? v.baseRent + " PSF" : "—" }, { k: "NNN Expense", v: v.nnn ? v.nnn + " PSF" : "—" }, { k: "Total Monthly Rent", v: autoVals.monthlyRent || "—" }, { k: "Lease Type", v: v.leaseType || "—" }] : [],
          sale ? [{ k: "Asking Price", v: v.askPrice || "—" }, { k: "Price / SF", v: autoVals.ppsf || "—" }, { k: "Investment", v: v.investment || "—" }] : [],
          [{ k: "Zoning", v: v.zoning || "—" }, { k: "Year Built / Renovated", v: [v.yearBuilt, v.yearReno].filter(Boolean).join(" / ") || "—" }]);
    const files = S.files || [], imgs = files.filter((f) => f.kind === "image"), docs = files.filter((f) => f.kind === "doc");
    const kb = (n) => n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
    const dropFile = (id) => () => this.setFiles(files.filter((f) => f.id !== id));
    const tagCss = (bg, fg) => "position:absolute;top:8px;left:8px;background:" + bg + ";color:" + fg;
    const photoList = imgs.map((f, i) => ({ name: f.name, url: f.url || "", hasUrl: !!f.url, noUrl: !f.url,
      webName: (conf ? "private" : slug) + "-" + (i + 1) + ".jpg", meta: f.name + " · " + kb(f.size) + (f.conv ? " · converted to JPG" : ""),
      tag: i === 0 ? "Cover" : i < 5 ? (conf ? "NDA" : "Website") : "Internal (over 5)",
      tagStyle: i === 0 ? tagCss("#2F80ED", "#fff") : i < 5 ? tagCss("rgba(14,22,32,.85)", conf ? "#FF9B9B" : "#7FC4FF") : tagCss("rgba(14,22,32,.85)", "#AFC3D6"),
      coverLabel: i === 0 ? "Cover photo" : "Make cover",
      coverBtnStyle: "min-height:34px;padding:0 12px;border-radius:999px;font:inherit;font-size:12px;cursor:pointer;" + (i === 0 ? "border:1px solid #2F80ED;background:rgba(47,128,237,.18);color:#fff" : "border:1px solid rgba(143,175,200,.35);background:transparent;color:#C9D6E3"),
      makeCover: () => { if (i) this.setFiles([f].concat(files.filter((x) => x.id !== f.id))); }, remove: dropFile(f.id) }));
    const setDoc = (id, patch) => this.setFiles(files.map((x) => x.id === id ? Object.assign({}, x, patch) : x));
    const docList = docs.map((f) => { const ext = (f.name.split(".").pop() || "").toUpperCase().slice(0, 4);
      return { name: f.name, ext, meta: kb(f.size) + " · " + (f.web ? (conf ? "released after NDA" : "downloadable on the property page") : "Drive (private)"), category: f.category,
        extStyle: "flex-shrink:0;width:44px;text-align:center;font-size:11px;font-weight:600;padding:5px 0;border-radius:8px;background:" + (ext === "PDF" ? "rgba(255,107,107,.16);color:#FF9B9B" : /^XLS|CSV/.test(ext) ? "rgba(52,168,108,.18);color:#7FD8A6" : "rgba(47,128,237,.16);color:#7FC4FF"),
        setCategory: (e) => setDoc(f.id, { category: e.target.value }), setWeb: () => setDoc(f.id, { web: true }), setInt: () => setDoc(f.id, { web: false }),
        webStyle: "font-size:12.5px;min-height:32px;" + (f.web ? segOn : segOff), intStyle: "font-size:12.5px;min-height:32px;" + (!f.web ? segOn : segOff), remove: dropFile(f.id) }; });
    const footerHint = S.fail ? "Nothing was lost or duplicated. Fix the cause, then retry. It continues from the failed step." : wf === 1 ? "Waiting for Natasha. She was emailed a review link." : (wf >= 2 && wf <= 4) ? "Approved. Creating the Excel file and Canva flyer automatically…" : wf === 5 ? "Ready for review: check the website preview, Excel file and flyer, then publish." : wf === 6 ? "Live on the website. Edits create a new revision; Excel and flyer are regenerated after re-approval." : step === 9 ? (issuesRaw.filter((i) => !i.warn).length ? "Fix the items marked ✕ before submitting." : "Ready to submit.") : "Saved automatically every 30 seconds.";
    const fileName = "Listing Intake - " + (v.address || "Property Address") + ".xlsx";
    return {
      step, steps, wfSteps, fields, doneReq, totalReq, pctW: Math.round(totalReq ? doneReq / totalReq * 100 : 0) + "%",
      isForm: step <= 8, isReview: step === 9, showUpload: !!(sec && sec.upload), secKicker: sec && sec.upload ? "Section " + step + " of 8 · added for uploads" : "Section " + step + " of 8 · from your intake template", secTitle: sec ? sec.title : "", secDesc: sec ? sec.desc : "",
      showAddrNote: step === 1 && !!v.address, showOwnerNote: step === 2, showConfNote: conf && step !== 2 && step !== 9 && !(sec && sec.upload),
      showSkip: (step === 4 && !sale) || (step === 5 && (!lease || sale)), skipText: step === 4 ? "Marked not for sale, so the sale fields are skipped. Switch to Yes to fill them in." : !lease ? "Marked not for lease, so the lease fields are skipped. Switch to Yes to fill them in." : "Occupancy date, occupancy status, tenants and rent roll were already answered in Sale Details, so they aren't asked twice.",
      photoList, docList, photoCount: imgs.length, docCount: docs.length, noPhotos: !imgs.length, noDocs: !docs.length,
      photoRule: "First photo is the cover · up to 5 show on the website · converted to web-ready JPG (1400 px)",
      docCats: ["Brochure / Flyer", "Floor Plan", "Site Plan / Survey", "Rent Roll", "Property Report", "Environmental Report", "Other"],
      pickFiles: (e) => { this.addFiles(e.target.files); try { e.target.value = ""; } catch (x) {} },
      dragOver: (e) => { e.preventDefault(); if (!S.drag) this.setState({ drag: true }); },
      dragLeave: () => this.setState({ drag: false }),
      dropFiles: (e) => { e.preventDefault(); this.setState({ drag: false }); this.addFiles(e.dataTransfer && e.dataTransfer.files); },
      dropStyle: "position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:30px;border-radius:16px;cursor:pointer;border:1.5px dashed " + (S.drag ? "#6FB1FF;background:rgba(47,128,237,.16)" : "rgba(111,177,255,.45);background:rgba(47,128,237,.05)"),
      pvHasImg: !conf && !!(imgs[0] && imgs[0].url), pvImg: imgs[0] && imgs[0].url ? imgs[0].url : "",
      bWeb: BADGE.web[1], bInt: BADGE.int[1], bRes: BADGE.res[1], bNda: BADGE.nda[1],
      title, slug, dealText, countyRegion: v.county ? v.county + " → " + (autoVals.region || "?") : "—",
      ppsf: autoVals.ppsf || "—", grossPsf: autoVals.grossRent || "—", monthly: autoVals.monthlyRent || "—",
      issues, issueCount: issues.length, noIssues: !issues.length, log: S.log, review, nWeb, nInt, nRes, fileName,
      back: () => this.setState({ step: Math.max(1, step - 1) }), next: () => this.setState({ step: Math.min(9, step + 1) }),
      nextLabel: step < 9 ? LABELS[step] : "",
      showNext: wf === 0 && step < 9, showSubmit: wf === 0 && step === 9, showApprove: wf === 1 && !S.fail, showRetry: !!S.fail, showPublish: wf === 5 && !S.fail, showLive: wf === 6, showReset: Component.demo(), dataPill: Component.cfg().START_WITH_SAMPLE !== false ? "Sample data" : (Component.demo() ? "Demo mode" : "Live"), footerHint, jobs,
      showFailPick: wf <= 1 && Component.demo() && Component.cfg().SHOW_DEMO_TOOLS !== false, failSim: S.failSim || "None", setFailSim: (e) => this.setState({ failSim: e.target.value }),
      retry: () => { this.emit("retry"); if (!Component.demo()) { this.setState({ fail: null, log: this.addLog("Retry requested") }); return; } this.setState({ failSim: "None", log: this.addLog("Retry started") }); this.runAuto(S.fail === "flyer" ? "flyer" : "excel", "None"); },
      openFlyer: () => this.flash(conf ? "Confidential listing: no public flyer was made" : "Would open \"" + flyerName + ".pdf\" (and the Canva edit link)"),
      flyerChanges: () => this.emit("request_flyer_changes") || this.flash("Sent back with your note. Data changes need re-approval; design tweaks can be made in Canva", { log: this.addLog("Flyer changes requested") }),
      save: () => { this.emit("save_draft"); this.flash(Component.demo() ? "Draft saved to the Listing Intake sheet" : "Saving draft…"); },
      exportXlsx: () => this.emit("export_excel") || this.flash("Would download \"" + fileName + "\" in your template layout"),
      submit: () => issuesRaw.filter((i) => !i.warn).length ? this.flash("Fill the required fields first (see Needs attention)") : (this.emit("submit_for_review"), this.flash("Submitted. Approvers have been emailed.", { wf: 1, log: this.addLog("Submitted for review") })),
      approve: () => { this.emit("approve"); this.flash("Approved. Creating the Excel file and flyer…", { wf: 2, log: this.addLog("Approved by Natasha S. (data frozen, rev 1)") }); if (Component.demo()) this.runAuto("excel", S.failSim || "None"); },
      requestChanges: () => this.emit("request_changes") || this.flash("Sent back to Draft with your note", { wf: 0, log: this.addLog("Changes requested") }),
      publish: () => this.emit("publish") || this.flash("Published. Live on the website in about 2 minutes.", { wf: 6, preview: false, log: this.addLog("Flyer approved · published to the website") }),
      unpublish: () => this.emit("unpublish") || this.flash("Unpublished. Removed from the website; record kept.", { wf: 5, log: this.addLog("Unpublished") }),
      reset: () => this.setState({ step: 1, wf: 0, fail: null, running: null, failSim: "None", preview: false, toast: "", log: ["Draft created from the CRE Listing Intake Form"], vals: Component.sample(), files: Component.sampleFiles() }),
      preview: S.preview, openPreview: () => this.setState({ preview: true }), closePreview: () => this.setState({ preview: false }),
      isConf: conf, pvHeading: conf ? "Locked off-market card and teaser" : "Listing card and property page",
      pvStatus: conf ? "Off-Market" : (v.status || "Available"), pvPillStyle: conf ? "background:#D64545;color:#fff" : v.status === "Pending" ? "background:#9A6B00;color:#fff" : "background:#1E8A5A;color:#fff",
      pvType: typ, pvLoc: conf ? (v.city || "") + " · " + (v.county || "") + " County" : [addrFull, [v.city, v.state].filter(Boolean).join(", ") + " " + (v.zip || "")].filter(Boolean).join(", "),
      pvSpace: conf ? (v.availSF || "—") : [v.unit, v.availSF].filter(Boolean).join(" – ") || "—", pvBldg: v.bldgSF || "—", pvMin: v.minDiv || "—",
      pvAgent: v.agent || "—", pvBtn: conf ? "Request Access" : "Inquire", pvBtnStyle: "font-size:13px;font-weight:500;padding:8px 14px;border-radius:999px;color:#fff;background:" + (conf ? "#D64545" : "#2F80ED"),
      pvHeadline: (v.headline || "") + (v.idealUses ? " — Ideal for " + v.idealUses.replace(/^ideal for\s*/i, "") : ""),
      pvBody: conf ? "Offered off-market to qualified parties. The exact address, photos, pricing and full brochure unlock after the NDA is signed and approved." : (v.description || "") + (hl.length ? "  Highlights: " + hl.slice(0, 4).join(" · ") : ""),
      pvFacts, hasToast: !!S.toast, toast: S.toast
    };
  }
}

  window.ListingIntakeComponent = Component;
  document.addEventListener("DOMContentLoaded", function () {
    var host = document.getElementById("listing-intake-root");
    var tpl = document.getElementById("listing-intake-template");
    if (!host || !tpl || !window.DCLite) return;
    window.ListingIntake = window.DCLite.mount(host, tpl.textContent, Component, {});
  });
})();

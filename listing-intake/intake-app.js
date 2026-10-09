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
      { id: "p1", kind: "image", name: "IMG_2041.png", size: 2400000 },
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
  addFiles(list, forceCat) {
    const arr = Array.prototype.slice.call(list || []), add = [], bad = [];
    arr.forEach((f) => {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      if (/^(heic|heif)$/.test(ext)) { bad.push(f.name + " (HEIC: export as JPG first)"); return; }
      if (f.size > 25 * 1024 * 1024) { bad.push(f.name + " (over 25 MB)"); return; }
      const img = !forceCat && (/^image\//.test(f.type || "") || /^(jpe?g|png|webp|gif)$/.test(ext));
      let url = ""; if (img) { try { url = URL.createObjectURL(f); } catch (e) {} }
      const cat = forceCat || (img ? "" : Component.guessCat(f.name));
      add.push({ id: "u" + Date.now() + Math.random().toString(36).slice(2, 6), kind: img ? "image" : "doc", name: f.name, size: f.size, url, category: cat, web: cat === "Brochure / Flyer" || cat === "Floor Plan", file: f });
    });
    if (add.length) this.setFiles(this.state.files.concat(add), { log: this.addLog(add.length + (add.length === 1 ? " file uploaded" : " files uploaded")) });
    if (bad.length) this.flash("Not added: " + bad.join(", "));
    else if (add.length) this.flash(add.length + (add.length === 1 ? " file added" : " files added"));
  }
  static sample() {
    return {
  name: "", address: "2500 Central Ave", unit: "Unit B", city: "St. Petersburg", state: "FL", zip: "33713", county: "", region: "West Florida", parcel: "",
  type: "Retail", subtype: "", zoning: "CCT-1 (Corridor Commercial Traditional)", demographics: "• [Population, 5-mile]\n• [Median household income]\n• [Traffic count on Central Ave]",
  ownerName: "[Owner name]", ownerEntity: "", ownerEmail: "[owner@email.com]", ownerPhone: "", dmName: "", dmContact: "", commPref: "Email",
  availSF: "1,850 SF", bldgSF: "6,400 SF", minDiv: "900 SF", maxCont: "1,850 SF", land: "0.28 AC", lotDim: "", yearBuilt: "1962", yearReno: "2019", buildings: "1", stories: "1",
  ceiling: "12'", curbCuts: "2", parking: "12 on-site spaces, surface", industrial: "", hvac: "", roof: "", condition: "Good", features: "Pylon signage\nFront and rear entrances\nCorner visibility", utilities: "",
  forSale: "No", askPrice: "", investment: "Investment type", capRate: "", noi: "", taxes: "", hoa: "", occDate: "Immediately", occStatus: "Vacant", previousUse: "", tenants: "No", leaseIncome: "No", rentRoll: "",
  forLease: "Yes", tenancy: "Multi-Tenant", baseRent: "$24.00", nnn: "$6.50", otherExp: "", leaseType: "NNN", term: "3–5 years", ti: "",
  usesNotAllowed: "", permits: "", environmental: "", insurance: "", photosAvail: "Yes", floorPlan: "Yes", sitePlan: "No", reports: "",
  showing: "", signage: "Yes", confidential: "No", channels: "Website, Crexi, LoopNet, email blast", agent: "Laurie Lane", status: "Available",
  headline: "Corner Retail Space on Central Avenue", idealUses: "coffee, retail, or service users",
  description: "A corner retail suite on Central Avenue with strong visibility, pylon signage and on-site parking, a short walk from the Grand Central District.",
  highlights: "Hard corner with pylon signage\nFront and rear entrances\n12 on-site parking spaces\nWalkable to the Grand Central District", driveLink: "", docLinks: "", notes: ""
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
  setVal(k, v) { const vals = Object.assign({}, this.state.vals); vals[k] = v; this.setState({ vals, saved: false }); }
  renderVals() {
    const S = this.state, v = S.vals, step = S.step;
    const num = (x) => { const n = parseFloat(String(x || "").replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; };
    const money = (n, d) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
    const sale = v.forSale === "Yes", lease = v.forLease === "Yes", conf = v.confidential === "Yes";
    const sf = num(v.availSF);
    const ppsfN = sale && num(v.askPrice) && sf ? num(v.askPrice) / sf : 0;
    const grossN = lease ? num(v.baseRent) + num(v.nnn) + num(v.otherExp) : 0;
    const monthlyN = grossN && sf ? grossN * sf / 12 : 0;
    const autoVals = { ppsf: ppsfN ? money(ppsfN, 2) : "", grossRent: grossN ? money(grossN, 2) + " PSF" : "", monthlyRent: monthlyN ? money(Math.round(monthlyN)) : "" };
    const T = "text", A = "area", SEL = "select", YN = "yn";
    const SECTIONS = [
      { title: "Property & Location", short: "Property & Location", moreName: "Additional Property Details", fields: [
        ["name", "Property / Listing Name", { vis: "web", conf: 1, ph: "Leave blank to use the address", w: 6 }],
        ["address", "Property address", { vis: "web", req: 1, conf: 1, w: 4 }],
        ["unit", "Unit / Suite", { vis: "web", conf: 1, added: 1, w: 2 }],
        ["city", "City", { vis: "web", req: 1, auto: 1, w: 3 }],
        ["state", "State", { vis: "web", auto: 1, w: 1 }],
        ["zip", "Zip Code", { vis: "web", auto: 1, conf: 1, w: 2 }],
        ["county", "County", { vis: "web", ph: "e.g. Pinellas", w: 3 }],
        ["region", "Region", { vis: "web", req: 1, added: 1, kind: SEL, opts: ["West Florida", "East Florida", "North Florida", "South Florida"], w: 3 }],
        ["type", "Property Type", { vis: "web", req: 1, kind: SEL, opts: ["Retail", "Office", "Industrial", "Medical", "Land", "Other"], w: 3 }],
        ["subtype", "Property Subtype", { vis: "web", ph: "e.g. Strip center, QSR, flex, medical office", w: 3 }],
        ["demographics", "5-Mile Radius Demographics", { vis: "web", kind: A, ph: "One bullet per line", w: 6 }],
        ["parcel", "Parcel number(s)", { vis: "int", ph: "e.g. 23-31-16-12345-000-0010", w: 3, more: 1 }],
        ["zoning", "Zoning Description", { vis: "web", w: 3, more: 1 }]
      ] },
      { title: "Owner", short: "Owner", desc: "Private. Only the assigned agent and approvers see this.", fields: [
        ["ownerName", "Owner name", { vis: "res", req: 1, w: 3 }],
        ["ownerEmail", "Owner email", { vis: "res", req: 1, w: 3 }],
        ["ownerPhone", "Owner phone", { vis: "res", w: 3 }],
        ["ownerEntity", "Owner Entity Name", { vis: "res", ph: "LLC, Corp, Trust…", w: 3 }],
        ["dmName", "Decision maker", { vis: "res", ph: "If different from the owner", w: 3, more: 1 }],
        ["dmContact", "Decision maker email / phone", { vis: "res", w: 3, more: 1 }],
        ["commPref", "Preferred Communication Method", { vis: "res", kind: SEL, opts: ["Email", "Phone call", "Text", "Through attorney / rep"], w: 3, more: 1 }]
      ] },
      { title: "Building & Site", short: "Building & Site", fields: [
        ["availSF", "Total Available SF", { vis: "web", req: 1, w: 3 }],
        ["bldgSF", "Building SF", { vis: "web", req: 1, added: 1, w: 3 }],
        ["minDiv", "Min divisible SF", { vis: "web", w: 3 }],
        ["maxCont", "Max contiguous SF", { vis: "web", w: 3 }],
        ["yearBuilt", "Year built", { vis: "web", w: 3 }],
        ["yearReno", "Year renovated", { vis: "web", w: 3 }],
        ["features", "Property Features / Amenities", { vis: "web", kind: A, ph: "One per line", w: 6 }],
        ["land", "Land size", { vis: "web", ph: "Acres or SF", w: 3, more: 1 }],
        ["lotDim", "Lot dimensions", { vis: "web", w: 3, more: 1 }],
        ["buildings", "Number of buildings", { vis: "web", w: 3, more: 1 }],
        ["stories", "Number of Stories / Floors", { vis: "web", w: 3, more: 1 }],
        ["ceiling", "Ceiling / clear height", { vis: "web", w: 3, more: 1 }],
        ["curbCuts", "Curb cuts / access points", { vis: "web", w: 3, more: 1 }],
        ["parking", "Parking Details", { vis: "web", ph: "Ratio, spaces, type", w: 6, more: 1 }],
        ["industrial", "Industrial specs", { vis: "web", ph: "Loading docks, drive-in doors, power", w: 6, more: 1 }],
        ["hvac", "HVAC age & condition", { vis: "int", w: 3, more: 1 }],
        ["roof", "Roof age & condition", { vis: "int", w: 3, more: 1 }],
        ["condition", "Property condition", { vis: "int", kind: SEL, opts: ["Excellent", "Good", "Fair", "Needs work"], w: 3, more: 1 }],
        ["utilities", "Utilities & providers", { vis: "int", kind: A, w: 6, more: 1 }]
      ] },
      { title: "Sale", short: "Sale", fields: [
        ["forSale", "For sale?", { vis: "web", kind: YN, req: 1, w: 6 }],
        ["askPrice", "Asking price", { vis: "web", conf: 1, req: 1, onlyIf: "sale", w: 3 }],
        ["investment", "Investment Details", { vis: "web", kind: SEL, noPick: 1, onlyIf: "sale", opts: ["Investment type", "Institutional", "Stabilized", "Value Add", "Redevelopment", "Owner/User", "Core+", "Core", "Net Lease", "Sale/Leaseback"], w: 3 }],
        ["ppsf", "Price / SF", { vis: "web", conf: 1, auto: 1, calc: 1, onlyIf: "sale" }],
        ["occStatus", "Occupancy Status", { vis: "web", kind: SEL, opts: ["Vacant", "Occupied", "Partial"], onlyIf: "sale", shared: 1, w: 3 }],
        ["occDate", "Available Occupancy Date", { vis: "web", ph: "e.g. Immediately, or 01/15/2027", onlyIf: "sale", shared: 1, w: 3 }],
        ["previousUse", "Previous Use if Vacant", { vis: "web", ph: "e.g. Law office, restaurant", onlyIf: "sale", shared: 1, w: 6 }],
        ["capRate", "Cap Rate (If Income-Producing)", { vis: "web", conf: 1, onlyIf: "sale", w: 3, more: 1 }],
        ["noi", "NOI (If Applicable)", { vis: "web", conf: 1, onlyIf: "sale", w: 3, more: 1 }],
        ["taxes", "Property taxes & tax year", { vis: "int", onlyIf: "sale", w: 3, more: 1 }],
        ["hoa", "HOA / association fees", { vis: "int", onlyIf: "sale", w: 3, more: 1 }],
        ["tenants", "Existing tenants?", { vis: "int", kind: YN, onlyIf: "sale", shared: 1, w: 3, more: 1 }],
        ["leaseIncome", "Existing leases or income?", { vis: "int", kind: YN, onlyIf: "sale", shared: 1, w: 3, more: 1 }],
        ["rentRoll", "Tenant Grid / Rent Roll (Drive Link or File)", { vis: "int", kind: A, ph: "Paste the Google Drive link, or upload the file below", onlyIf: "sale", shared: 1, w: 6, upload: "Rent Roll" }]
      ] },
      { title: "Lease", short: "Lease", fields: [
        ["forLease", "For lease?", { vis: "web", kind: YN, req: 1, w: 6 }],
        ["baseRent", "Base rent / SF", { vis: "web", conf: 1, req: 1, onlyIf: "lease", w: 2 }],
        ["nnn", "NNN / CAM / SF", { vis: "web", conf: 1, onlyIf: "lease", w: 2 }],
        ["otherExp", "Other expenses / SF", { vis: "web", conf: 1, onlyIf: "lease", w: 2 }],
        ["grossRent", "Total gross rent / SF", { vis: "web", conf: 1, auto: 1, calc: 1, onlyIf: "lease" }],
        ["monthlyRent", "Total monthly rent", { vis: "web", conf: 1, auto: 1, calc: 1, onlyIf: "lease" }],
        ["leaseType", "Lease type", { vis: "web", kind: SEL, opts: ["NNN", "Gross", "Modified Gross"], onlyIf: "lease", w: 3 }],
        ["term", "Lease Term Limits (Min / Max)", { vis: "web", ph: "e.g. 3–5 years", onlyIf: "lease", w: 3 }],
        ["occStatus", "Occupancy Status", { vis: "web", kind: SEL, opts: ["Vacant", "Occupied", "Partial"], onlyIf: "lease", shared: 1, w: 3 }],
        ["occDate", "Available Occupancy Date", { vis: "web", ph: "e.g. Immediately, or 01/15/2027", onlyIf: "lease", shared: 1, w: 3 }],
        ["previousUse", "Previous Use if Vacant", { vis: "web", ph: "e.g. Law office, restaurant", onlyIf: "lease", shared: 1, w: 6 }],
        ["tenancy", "Tenancy Type", { vis: "web", kind: SEL, opts: ["Single-Tenant", "Multi-Tenant"], onlyIf: "lease", w: 3, more: 1 }],
        ["ti", "TI allowance", { vis: "int", onlyIf: "lease", w: 3, more: 1 }],
        ["tenants", "Existing tenants?", { vis: "int", kind: YN, onlyIf: "lease", shared: 1, w: 3, more: 1 }],
        ["leaseIncome", "Existing leases or income?", { vis: "int", kind: YN, onlyIf: "lease", shared: 1, w: 3, more: 1 }],
        ["rentRoll", "Tenant Grid / Rent Roll (Drive Link or File)", { vis: "int", kind: A, ph: "Paste the Google Drive link, or upload the file below", onlyIf: "lease", shared: 1, w: 6, upload: "Rent Roll" }]
      ] },
      { title: "Compliance", short: "Compliance", fields: [
        ["environmental", "Environmental concerns", { vis: "int", kind: A, ph: "None known, or describe", w: 6 }],
        ["usesNotAllowed", "Uses not allowed or conflicting", { vis: "int", kind: A, ph: "None, or describe", w: 6 }],
        ["permits", "Permits or licenses required", { vis: "int", kind: A, w: 6, more: 1 }],
        ["insurance", "Insurance / warranties", { vis: "int", w: 6, more: 1 }],
        ["reports", "Property reports available", { vis: "int", w: 6, more: 1 }],
        ["photosAvail", "Photos available?", { vis: "int", kind: YN, w: 2, more: 1 }],
        ["floorPlan", "Floor plan available?", { vis: "int", kind: YN, w: 2, more: 1 }],
        ["sitePlan", "Site plan / survey?", { vis: "int", kind: YN, w: 2, more: 1 }]
      ] },
      { title: "Photos & Documents", short: "Photos & Documents", upload: 1, desc: "Upload photos and documents, or paste links to them (Google Drive, Dropbox, OneDrive).", fields: [
        ["docLinks", "Photo & Document Links", { vis: "int", kind: A, ph: "One link per line, e.g. https://drive.google.com/drive/folders/… (photos, floor plan, rent roll)", w: 6, afterUpload: 1, check: (x) => String(x || "").split(/\n+/).map((l) => l.trim()).filter(Boolean).some((l) => !/^https:\/\/\S+$/i.test(l)) ? "Each line should be one full link starting with https://" : "" }]
      ] },
      { title: "Marketing", short: "Marketing", fields: [
        ["headline", "Listing Subheader", { vis: "web", req: 1, ph: "A short line with quick context and your strongest point, e.g. 2nd Generation Restaurant Space", w: 6 }],
        ["idealUses", "Ideal Uses", { vis: "web", ph: "e.g. coffee, retail or service users", w: 6 }],
        ["description", "Marketing Description", { vis: "web", req: 1, kind: A, ph: "Paragraph form", w: 6, tall: 1 }],
        ["highlights", "Highlight Features", { vis: "web", kind: A, ph: "One bullet per line", w: 6 }],
        ["driveLink", "Google Drive Folder Link", { vis: "int", ph: "https://drive.google.com/drive/folders/…", w: 6, check: (x) => !String(x || "").trim() ? "" : !/^https:\/\/\S+$/i.test(String(x).trim()) ? "Paste the full link, starting with https://" : !/^https:\/\/(drive|docs)\.google\.com\//i.test(String(x).trim()) ? "This is not a Google Drive link. Check it before submitting." : "" }],
        ["agent", "Assigned agent", { vis: "web", req: 1, kind: SEL, opts: ["Laurie Lane", "Joyce Teixeira", "Mackinley Autrey", "Jason Clemmey", "Christopher Delcore", "Outlier Solutions Team"], w: 3 }],
        ["status", "Listing status", { vis: "web", req: 1, added: 1, kind: SEL, opts: ["Available", "Pending", "Leased", "Sold"], w: 3 }],
        ["confidential", "Confidential listing?", { vis: "int", kind: YN, w: 6, hintIf: "Yes", hintText: "The website shows a locked teaser. Address, photos and pricing are released after an approved NDA." }],
        ["signage", "Signage available?", { vis: "web", kind: YN, w: 3, more: 1 }],
        ["channels", "Marketing channels", { vis: "int", w: 3, more: 1 }],
        ["showing", "Showing instructions & lockbox", { vis: "res", kind: A, ph: "Private. Never exported, emailed or published.", w: 6, more: 1 }],
        ["notes", "Broker notes", { vis: "int", kind: A, ph: "Internal only", w: 6, more: 1 }]
      ] }
    ];
    const active = (fd) => !fd.onlyIf || (fd.onlyIf === "sale" ? sale : lease);
    const sharedHidden = (si, fd) => fd.shared && si === 4 && sale;   // shared occupancy fields asked once, under Sale
    const BADGE = {
      web: ["Website", "font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#141414;background:rgba(20,20,20,0.112);border-radius:999px;padding:2px 8px"],
      int: ["Internal", "font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#5A5752;background:rgba(20,20,20,0.126);border-radius:999px;padding:2px 8px"],
      res: ["Restricted", "font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#5A5752;background:rgba(20,20,20,0.07);border-radius:999px;padding:2px 8px"],
      nda: ["NDA", "font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#141414;background:rgba(20,20,20,0.096);border-radius:999px;padding:2px 8px"]
    };
    const visOf = (fd) => conf && fd.conf && fd.vis === "web" ? "nda" : fd.vis;
    const valOf = (key, fd) => fd.calc ? autoVals[key] : (v[key] || "");
    const isEmpty = (key, fd) => !String(valOf(key, fd)).trim();
    const segOn = "background:#000;color:#fff", segOff = "background:transparent;color:#282626";
    // required / issues
    const issuesRaw = [];
    SECTIONS.forEach((sec, si) => sec.fields.forEach(([key, label, fd]) => { if (fd.req && active(fd) && !sharedHidden(si, fd) && isEmpty(key, fd)) issuesRaw.push({ step: si + 1, text: label.replace(/ \(.*\)$/, "") + " is required" }); }));
    const dl = String(v.driveLink || "").trim();
    if (dl && !/^https:\/\/\S+$/i.test(dl)) issuesRaw.push({ step: 8, text: "Google Drive Folder Link must be a full link starting with https://" });
    else if (dl && !/^https:\/\/(drive|docs)\.google\.com\//i.test(dl)) issuesRaw.push({ step: 8, text: "Google Drive Folder Link is not a drive.google.com link", warn: 1 });
    if (!sale && !lease) issuesRaw.push({ step: 4, text: "Choose For Sale, For Lease, or both" });
    const street = String(v.address || "").replace(/^\d+\s*/, "").split(/\s+/)[0];
    if (conf && street && new RegExp("\\b" + street + "\\b", "i").test(v.description || "")) issuesRaw.push({ step: 8, text: "Description names the street (\"" + street + "\") on a confidential listing", warn: 1 });
    if (String(v.docLinks || "").split(/\n+/).map((l) => l.trim()).filter(Boolean).some((l) => !/^https:\/\/\S+$/i.test(l))) issuesRaw.push({ step: 7, text: "Photo & Document Links: each line should be one full https:// link", warn: 1 });
    if (!(S.files || []).some((f) => f.kind === "image") && !conf && /Available|Pending/.test(v.status || "")) issuesRaw.push({ step: 7, text: "Add at least one photo for the website listing", warn: 1 });
    let totalReq = 0, doneReq = 0;
    SECTIONS.forEach((sec, si) => sec.fields.forEach(([key, , fd]) => { if (fd.req && active(fd) && !sharedHidden(si, fd)) { totalReq++; if (!isEmpty(key, fd)) doneReq++; } }));
    const issuesAt = (n) => issuesRaw.filter((i) => i.step === n);
    const go = (n) => () => this.setState({ step: n, preview: false });
    // current section fields: primary fields first, secondary ones under "Additional details"
    const seen = S.seen || {}, showReq = !!S.tried || !!seen[step];
    const ERR = "#9B2C2C";
    const PICK = "Select…";
    const SMALL = /^(a|an|and|as|at|by|for|if|in|of|on|or|per|the|to|vs|via|with)$/i;
    const titleCase = (t) => { const parts = String(t).split(/(\s+|\/|-)/), words = parts.map((w, i) => /\w/.test(w) ? i : -1).filter((i) => i >= 0), first = words[0], last = words[words.length - 1];
      return parts.map((w, i) => !/\w/.test(w) || /[A-Z]{2,}|^\d/.test(w) ? w : (i !== first && i !== last && SMALL.test(w) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(""); };
    const mkField = ([key, rawLabel, fd]) => {
      const label = titleCase(rawLabel);
      const kind = fd.kind || T, vis = visOf(fd), val = valOf(key, fd), missing = fd.req && !String(val).trim(), bad = fd.check ? fd.check(val) : "", flag = (missing && showReq) || /^Paste/.test(bad);
      const hint = missing && showReq ? "Required" : bad ? bad : (key === "address" && step === 1 && val ? "✓ Added" : (fd.hintIf && val === fd.hintIf ? fd.hintText : ""));
      return { id: "f_" + key, label, req: !!fd.req, val, ph: fd.ph || "", vis, visLabel: BADGE[vis][0], auto: !!fd.auto, added: !!fd.added,
        isText: kind === T, isArea: kind === A, isSelect: kind === SEL, isYN: kind === YN,
        opts: kind === SEL && !fd.noPick ? [PICK].concat(fd.opts || []) : (fd.opts || []), selVal: kind === SEL && !fd.noPick && !val ? PICK : val, picked: !!val && val !== PICK,
        set: (e) => { if (!fd.calc) this.setVal(key, e.target.value === PICK ? "" : e.target.value); },
        yes: () => this.setVal(key, "Yes"), no: () => this.setVal(key, "No"),
        yesStyle: val === "Yes" ? segOn : segOff, noStyle: val === "No" ? segOn : segOff,
        span: "grid-column: span " + (fd.w || 3),
        inStyle: (flag ? "border-color:" + ERR + ";" : "") + (kind === SEL && !fd.noPick && !val ? "color:#8A8782;" : "") + (kind === A ? "min-height:" + (fd.tall ? 168 : 120) + "px;" : ""),
        hasUpload: !!fd.upload, upLabel: "Upload " + (fd.upload === "Rent Roll" ? "Rent Roll / Tenant Grid" : fd.upload),
        pickUp: (e) => { this.addFiles(e.target.files, fd.upload); try { e.target.value = ""; } catch (x) {} },
        upFiles: fd.upload ? (S.files || []).filter((x) => x.kind === "doc" && x.category === fd.upload).map((x) => ({ name: x.name, size: x.size > 1048576 ? (x.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(x.size / 1024)) + " KB", remove: () => this.setFiles((this.state.files || []).filter((y) => y.id !== x.id)) })) : [],
        hasUpFiles: !!fd.upload && (S.files || []).some((x) => x.kind === "doc" && x.category === fd.upload),
        hasHint: !!hint, hint, hintStyle: "margin:0;font-size:13px;color:" + (flag || bad ? ERR : "#6F6C68") };
    };
    const sec = SECTIONS[step - 1];
    const visible = sec ? sec.fields.filter(([, , fd]) => active(fd) && !sharedHidden(step - 1, fd) && !fd.calc) : [];
    const fields = visible.filter(([, , fd]) => !fd.more && !fd.afterUpload).map(mkField);
    const upFields = visible.filter(([, , fd]) => fd.afterUpload).map(mkField);
    const moreAll = visible.filter(([, , fd]) => fd.more);
    const moreOpen = !!(S.more || {})[step];
    const moreFields = moreOpen ? moreAll.map(mkField) : [];
    const moreFilled = moreAll.filter(([key, , fd]) => !isEmpty(key, fd)).length;
    const allFields = sec ? sec.fields.filter(([, , fd]) => active(fd) && !sharedHidden(step - 1, fd)).map(mkField) : [];
    const calcLine = step === 4 && sale ? (autoVals.ppsf ? "Price / SF  " + autoVals.ppsf : "") : step === 5 && lease ? [autoVals.grossRent ? "Gross rent " + autoVals.grossRent : "", autoVals.monthlyRent ? "Monthly rent " + autoVals.monthlyRent : ""].filter(Boolean).join("   ·   ") : "";
    const skipped = (n) => (n === 4 && !sale) || (n === 5 && !lease);
    const blocking = (n) => issuesAt(n).filter((i) => !i.warn).length;
    const steps = SECTIONS.map((s, i) => ({ label: s.short })).concat([{ label: "Review" }]).map((s, i) => {
      const n = i + 1, cur = n === step, visited = n < step || !!seen[n], bad = n < 9 ? issuesAt(n).length : 0;
      const flagged = bad && (visited || S.tried) && !cur, done = n < 9 && visited && !bad && !cur && !skipped(n);
      return { label: s.label, pick: () => this.setState({ step: n, preview: false, seen: Object.assign({}, seen, { [step]: true }) }), num: String(n), cur,
        markText: done ? "✓" : flagged ? "•" : "", ariaCur: cur ? "step" : false,
        rowStyle: "display:flex;align-items:center;gap:14px;width:100%;min-height:44px;padding:0 4px;border:0;background:none;cursor:pointer;font:inherit;text-align:left;color:" + (cur ? "#000" : skipped(n) ? "#B5B2AD" : "#6F6C68"),
        numStyle: "flex-shrink:0;width:18px;font-size:13px;font-variant-numeric:tabular-nums;color:" + (cur ? "#000" : "#B5B2AD"),
        nameStyle: "flex-grow:1;font-size:15px;white-space:nowrap;" + (cur ? "font-weight:500" : ""),
        markStyle: "flex-shrink:0;width:14px;text-align:center;font-size:" + (flagged ? "20px;color:" + ERR : "13px;color:#6F6C68") };
    });
    const WF = ["Draft", "In Review", "Approved", "Excel Created", "Flyer Created", "Ready for Review", "Published"];
    const failAt = S.fail === "excel" ? 3 : S.fail === "flyer" ? 4 : -1;
    const wfSteps = WF.map((label, i) => {
      const failed = i === failAt, cur = i === S.wf && !failed, done = i < S.wf || (failAt > -1 && i < failAt);
      return { label: failed ? (S.fail === "excel" ? "Excel Failed" : "Flyer Failed") : label, arrow: i < WF.length - 1,
        style: "font-size:12px;padding:5px 10px;border-radius:999px;white-space:nowrap;" + (failed ? "background:#FFFFFF;color:#141414;border:1.5px dashed #141414" : cur ? (i === 6 ? "background:#141414;color:#FFFFFF;border:1px solid #141414" : "background:#141414;color:#FFFFFF;border:1px solid #141414") : done ? "color:#141414;border:1px solid rgba(20,20,20,.4)" : "color:#8A8782;border:1px solid rgba(20,20,20,.16)") };
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
        dotStyle: "flex-shrink:0;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;" + (st === "done" ? "background:rgba(20,20,20,0.12);color:#141414" : st === "failed" ? "background:rgba(20,20,20,0.12);color:#141414" : st === "running" ? "background:#141414;color:#FFFFFF" : "background:rgba(20,20,20,0.108);color:#5A5752"),
        subStyle: "font-size:11.5px;line-height:1.4;color:" + (st === "failed" ? "#141414" : st === "done" ? "#5A5752" : "#5A5752") }; });
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
      const bad = issuesAt(si + 1), sk = skipped(si + 1);
      const ni = (S.files || []).filter((f) => f.kind === "image").length, nd = (S.files || []).length - ni;
      const note = sk ? "Not needed" : bad.length ? bad[0].text + (bad.length > 1 ? " (+" + (bad.length - 1) + ")" : "") : s.upload ? ni + (ni === 1 ? " photo" : " photos") + (nd ? " · " + nd + (nd === 1 ? " document" : " documents") : "") : "";
      return { label: s.title, go: go(si + 1), note, ok: !sk && !bad.length, mark: sk ? "" : bad.length ? "" : "✓",
        noteStyle: "flex-grow:1;font-size:14px;color:" + (bad.length && !sk ? (bad[0].warn ? "#6F6C68" : ERR) : "#6F6C68") };
    });
    const issues = issuesRaw.map((i) => ({ where: SECTIONS[i.step - 1] ? SECTIONS[i.step - 1].short : "", text: i.text, go: () => this.setState({ step: i.step, drawer: false, preview: false }),
      style: "display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;width:100%;padding:12px 0;border:0;border-bottom:1px solid rgba(0,0,0,.07);background:none;cursor:pointer;font:inherit;font-size:14px;color:" + (i.warn ? "#282626" : ERR) }));
    const wf = S.wf, LABELS = steps.map((s) => s.label);
    const hl = String(v.highlights || "").split(/\n/).filter(Boolean);
    const pvFacts = conf
      ? [{ k: "Property Type", v: typ }, { k: "Offered For", v: dealText }, { k: "Market", v: [v.city, v.region].filter(Boolean).join(" · ") }, { k: "Address", v: "Released after NDA approval" }, { k: "Pricing", v: "Provided by your advisor" }]
      : [{ k: "Status", v: v.status || "Available" }].concat(
          lease ? [{ k: "Base Rent", v: v.baseRent ? v.baseRent + " PSF" : "—" }, { k: "NNN Expense", v: v.nnn ? v.nnn + " PSF" : "—" }, { k: "Total Monthly Rent", v: autoVals.monthlyRent || "—" }, { k: "Lease Type", v: v.leaseType || "—" }] : [],
          sale ? [{ k: "Asking Price", v: v.askPrice || "—" }, { k: "Price / SF", v: autoVals.ppsf || "—" }, { k: "Investment", v: v.investment || "—" }] : [],
          [{ k: "Zoning", v: v.zoning || "—" }, { k: "Year Built / Renovated", v: [v.yearBuilt, v.yearReno].filter(Boolean).join(" / ") || "—" }]);
    const files = S.files || [], imgs = files.filter((f) => f.kind === "image"), docs = files.filter((f) => f.kind === "doc");
    const kb = (n) => n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
    const dropFile = (id) => () => this.setFiles(files.filter((f) => f.id !== id));
    const photoList = imgs.map((f, i) => ({ name: f.name, url: f.url || "", hasUrl: !!f.url, noUrl: !f.url, isCover: i === 0, notCover: i > 0,
      tag: i === 0 ? "Cover" : i >= 5 ? "Not on website" : "", hasTag: i === 0 || i >= 5,
      makeCover: () => { if (i) this.setFiles([f].concat(files.filter((x) => x.id !== f.id))); }, remove: dropFile(f.id) }));
    const setDoc = (id, patch) => this.setFiles(files.map((x) => x.id === id ? Object.assign({}, x, patch) : x));
    const docList = docs.map((f) => { const ext = (f.name.split(".").pop() || "").toUpperCase().slice(0, 4);
      return { name: f.name, ext, category: f.category,
        setCategory: (e) => setDoc(f.id, { category: e.target.value }), setWeb: () => setDoc(f.id, { web: true }), setInt: () => setDoc(f.id, { web: false }),
        webStyle: f.web ? segOn : segOff, intStyle: !f.web ? segOn : segOff, remove: dropFile(f.id) }; });
    const nBlock = issuesRaw.filter((i) => !i.warn).length;
    const footerHint = S.fail ? "Something failed after approval. Nothing was lost; retry continues from the failed step." : wf === 1 ? "Waiting for Natasha's approval" : (wf >= 2 && wf <= 4) ? "Creating the Excel record and flyer…" : wf === 5 ? "Check the preview and flyer, then publish" : wf === 6 ? "" : (step === 9 || S.tried) && nBlock ? nBlock + (nBlock === 1 ? " item needs attention" : " items need attention") : S.saved ? "Saved" : "";
    const fileName = "Listing Intake - " + (v.address || "Property Address") + ".xlsx";
    return {
      step, steps, wfSteps, fields, doneReq, totalReq, pctW: Math.round(totalReq ? doneReq / totalReq * 100 : 0) + "%",
      isForm: step <= 8, isReview: step === 9, showUpload: !!(sec && sec.upload), upFields, hasUpFields: upFields.length > 0, secTitle: sec ? sec.title : "Review", secDesc: sec && sec.desc ? sec.desc : "", hasDesc: !!(sec && sec.desc),
      mobileStep: "Step " + step + " of 9",
      confLine: conf && (step === 1 || step === 7) ? "Confidential listing · the address, photos and pricing are released only under NDA." : "", hasConfLine: conf && (step === 1 || step === 7),
      hasFields: fields.length > 0, moreFields, hasMore: moreAll.length > 0, moreOpen, toggleMore: () => this.setState({ more: Object.assign({}, S.more || {}, { [step]: !moreOpen }) }),
      moreLabel: (sec && sec.moreName) || "Additional Details", moreCount: moreAll.length + (moreAll.length === 1 ? " field" : " fields") + (moreFilled ? " · " + moreFilled + " filled" : ""), moreSign: moreOpen ? "−" : "+",
      calcLine, hasCalc: !!calcLine, moreExp: moreOpen ? "true" : "false", adminExp: S.admin ? "true" : "false",
      photoList, docList, photoCount: imgs.length, docCount: docs.length, hasPhotos: imgs.length > 0, hasDocs: docs.length > 0,
      docCats: ["Brochure / Flyer", "Floor Plan", "Site Plan / Survey", "Rent Roll", "Property Report", "Environmental Report", "Other"],
      pickFiles: (e) => { this.addFiles(e.target.files); try { e.target.value = ""; } catch (x) {} },
      dragOver: (e) => { e.preventDefault(); if (!S.drag) this.setState({ drag: true }); },
      dragLeave: () => this.setState({ drag: false }),
      dropFiles: (e) => { e.preventDefault(); this.setState({ drag: false }); this.addFiles(e.dataTransfer && e.dataTransfer.files); },
      dropStyle: "position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:" + (files.length ? 120 : 200) + "px;padding:28px;border-radius:14px;cursor:pointer;transition:background .2s,border-color .2s;border:1px dashed " + (S.drag ? "#000;background:rgba(0,0,0,.04)" : "rgba(0,0,0,.22);background:transparent"),
      pvHasImg: !conf && !!(imgs[0] && imgs[0].url), pvImg: imgs[0] && imgs[0].url ? imgs[0].url : "",
      bWeb: BADGE.web[1], bInt: BADGE.int[1], bRes: BADGE.res[1], bNda: BADGE.nda[1],
      statusText: "Status: " + (S.fail ? (S.fail === "excel" ? "Excel failed" : "Flyer failed") : ["Draft", "In review", "Approved", "Excel created", "Flyer created", "Ready for review", "Published"][wf] || "Draft"),
      pipeline: WF.map((label, i) => ({ label, style: "font-size:14px;padding:4px 0;color:" + (i === wf ? "#000;font-weight:500" : i < wf ? "#6F6C68" : "#B5B2AD"), mark: i < wf ? "✓" : i === wf ? "•" : "" })),
      drawer: !!S.drawer, openDrawer: () => this.setState({ drawer: true, preview: false }), closeDrawer: () => this.setState({ drawer: false }),
      admin: !!S.admin, toggleAdmin: () => this.setState({ admin: !S.admin }), adminSign: S.admin ? "−" : "+",
      adminFields: allFields.map((f) => ({ label: f.label, vis: f.visLabel + (f.auto ? " · auto" : "") + (f.added ? " · added" : "") })), hasAdminFields: allFields.length > 0,
      isSale: sale, isLease: lease, summaryDot: !!(nBlock && (S.tried || step === 9)), hasLog: !!(S.log && S.log.length), isDemo: Component.demo(),
      title, slug, dealText, regionText: v.region || "—",
      ppsf: autoVals.ppsf || "—", grossPsf: autoVals.grossRent || "—", monthly: autoVals.monthlyRent || "—",
      issues, issueCount: issues.length, noIssues: !issues.length, log: S.log, review, nWeb, nInt, nRes, fileName,
      back: () => this.setState({ step: Math.max(1, step - 1), seen: Object.assign({}, seen, { [step]: true }) }), next: () => this.setState({ step: Math.min(9, step + 1), seen: Object.assign({}, seen, { [step]: true }) }),
      nextLabel: step < 9 ? LABELS[step] : "", showBack: step > 1 && wf === 0, hasFooterHint: !!footerHint, footerStyle: "flex-grow:1;font-size:" + (footerHint === "Saved" ? "13px;color:#B5B2AD" : "14px;color:" + ((step === 9 || S.tried) && nBlock && !wf && !S.fail ? ERR : "#6F6C68")),
      pct: Math.round(totalReq ? doneReq / totalReq * 100 : 0),
      showNext: wf === 0 && step < 9, showSubmit: wf === 0 && step === 9, showApprove: wf === 1 && !S.fail, showRetry: !!S.fail, showPublish: wf === 5 && !S.fail, showLive: wf === 6, showReset: Component.demo(), dataPill: Component.cfg().START_WITH_SAMPLE !== false ? "Sample data" : (Component.demo() ? "Demo mode" : "Live"), footerHint, jobs,
      showFailPick: wf <= 1 && Component.demo() && Component.cfg().SHOW_DEMO_TOOLS !== false, failSim: S.failSim || "None", setFailSim: (e) => this.setState({ failSim: e.target.value }),
      retry: () => { this.emit("retry"); if (!Component.demo()) { this.setState({ fail: null, log: this.addLog("Retry requested") }); return; } this.setState({ failSim: "None", log: this.addLog("Retry started") }); this.runAuto(S.fail === "flyer" ? "flyer" : "excel", "None"); },
      openFlyer: () => this.flash(conf ? "Confidential listing: no public flyer was made" : "Would open \"" + flyerName + ".pdf\" (and the Canva edit link)"),
      flyerChanges: () => this.emit("request_flyer_changes") || this.flash("Sent back with your note. Data changes need re-approval; design tweaks can be made in Canva", { log: this.addLog("Flyer changes requested") }),
      save: () => { this.emit("save_draft"); if (Component.demo()) this.setState({ saved: true }); this.flash(Component.demo() ? "Draft saved" : "Saving…"); },
      exportXlsx: () => this.emit("export_excel") || this.flash("Would download \"" + fileName + "\" in your template layout"),
      submit: () => nBlock ? this.flash(nBlock === 1 ? "One required field is missing" : nBlock + " required fields are missing", { tried: true, step: issuesRaw.find((i) => !i.warn).step }) : (this.emit("submit_for_review"), this.flash("Submitted. Approvers have been emailed.", { wf: 1, log: this.addLog("Submitted for review") })),
      approve: () => { this.emit("approve"); this.flash("Approved. Creating the Excel file and flyer…", { wf: 2, log: this.addLog("Approved by Natasha S. (data frozen, rev 1)") }); if (Component.demo()) this.runAuto("excel", S.failSim || "None"); },
      requestChanges: () => this.emit("request_changes") || this.flash("Sent back to Draft with your note", { wf: 0, log: this.addLog("Changes requested") }),
      publish: () => this.emit("publish") || this.flash("Published. Live on the website in about 2 minutes.", { wf: 6, preview: false, log: this.addLog("Flyer approved · published to the website") }),
      unpublish: () => this.emit("unpublish") || this.flash("Unpublished. Removed from the website; record kept.", { wf: 5, log: this.addLog("Unpublished") }),
      reset: () => this.setState({ step: 1, wf: 0, fail: null, running: null, failSim: "None", preview: false, toast: "", log: ["Draft created from the CRE Listing Intake Form"], vals: Component.sample(), files: Component.sampleFiles() }),
      preview: S.preview, openPreview: () => this.setState({ preview: true }), closePreview: () => this.setState({ preview: false }),
      isConf: conf, pvHeading: conf ? "Locked off-market card and teaser" : "Listing card and property page",
      pvStatus: conf ? "Off-Market" : (v.status || "Available"), pvPillStyle: conf ? "background:#141414;color:#fff" : v.status === "Pending" ? "background:#5A5752;color:#fff" : "background:#141414;color:#fff",
      pvType: typ + (v.subtype ? " · " + v.subtype : ""), pvLoc: conf ? [v.city, v.region].filter(Boolean).join(" · ") : [addrFull, [v.city, v.state].filter(Boolean).join(", ") + " " + (v.zip || "")].filter(Boolean).join(", "),
      pvSpace: conf ? (v.availSF || "—") : [v.unit, v.availSF].filter(Boolean).join(" – ") || "—", pvBldg: v.bldgSF || "—", pvMin: v.minDiv || "—",
      pvAgent: v.agent || "—", pvBtn: conf ? "Request Access" : "Inquire", pvBtnStyle: "font-size:13px;font-weight:500;padding:8px 14px;border-radius:999px;color:#fff;background:" + (conf ? "#141414" : "#141414"),
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

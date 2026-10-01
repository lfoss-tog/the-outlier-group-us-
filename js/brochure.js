/* ════════════════════════════════════════════════════════════
   THE OUTLIER GROUP — Property brochure (PDF, generated in the browser)
   OG.brochure(listing, details?)  → downloads "<Property>_Brochure.pdf"
   · Public listings: full brochure from js/data.js
   · Off-market, NDA approved: full brochure incl. confidential details
   · Off-market, not approved: confidential teaser (no address or pricing)
   Needs pdf-lib (loaded from cdnjs in index.html).
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  window.OG = window.OG || {};

  /* Save a generated file: artifact viewer capability when present, else a normal download */
  let dl = null, dlChecked = false;
  async function saveFile(filename, bytes, mime) {
    if (!dlChecked) { dlChecked = true; try { dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch (e) { dl = null; } }
    if (dl) {
      try { await dl.save({ filename, data: bytes }); return true; }
      catch (e) { if (e && e.code === "declined") return false; }
    }
    const url = URL.createObjectURL(new Blob([bytes], { type: mime || "application/octet-stream" }));
    const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  }
  OG.saveFile = saveFile;

  async function bytesOf(src) {
    if (!src) return null;
    try {
      if (src.startsWith("data:")) { const b = atob(src.split(",")[1]); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
      const r = await fetch(src); if (!r.ok) return null; return new Uint8Array(await r.arrayBuffer());
    } catch (e) { return null; }
  }

  async function build(l, det) {
    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdf = await PDFDocument.create();
    const sans = await pdf.embedFont(StandardFonts.Helvetica), sansB = await pdf.embedFont(StandardFonts.HelveticaBold);
    const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);
    const NAVY = rgb(0.055, 0.086, 0.125), BLUE = rgb(0.184, 0.502, 0.929), INK = rgb(0.07, 0.1, 0.14), MUTED = rgb(0.36, 0.44, 0.52), LINE = rgb(0.86, 0.89, 0.92), CORAL = rgb(1, 0.42, 0.42);
    const W = 612, H = 792, M = 42;
    const teaser = l.offMarket && !det;
    const d = Object.assign({}, l, det || {});
    const title = det ? (det.name || l.title) : l.title;
    const address = teaser ? `${l.region} · Address released after NDA approval` : ((d.address && !String(d.city || "").startsWith(d.address) ? d.address + ", " : "") + (d.city || ""));
    const agent = OG.agentOf(l);

    const clean = (s) => String(s == null ? "" : s).replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/·/g, "|").replace(/®/g, "(R)").replace(/[^\x20-\x7E]/g, "");
    const wrap = (text, font, size, maxW) => {
      const words = clean(text).split(/\s+/); const lines = []; let line = "";
      words.forEach((w) => { const t = line ? line + " " + w : w; if (font.widthOfTextAtSize(t, size) > maxW && line) { lines.push(line); line = w; } else line = t; });
      if (line) lines.push(line); return lines;
    };
    const fit = (t, font, size, maxW) => { let s = size; while (s > 6 && font.widthOfTextAtSize(clean(t), s) > maxW) s -= 0.5; return s; };
    const txt = (pg, t, x, y, o = {}) => pg.drawText(clean(t), { x, y, size: o.size || 10, font: o.font || sans, color: o.color || INK });

    let mono = null;
    const monoBytes = await bytesOf(OG_CONFIG.LOGO_WHITE); if (monoBytes) { try { mono = await pdf.embedPng(monoBytes); } catch (e) {} }
    const photos = [];
    if (!teaser) for (const p of (l.photos || []).slice(0, 5)) { const b = await bytesOf(photoPath(p)); if (b) { try { photos.push(await pdf.embedJpg(b)); } catch (e) {} } }

    const header = (pg, small) => {
      const hh = small ? 54 : 96;
      pg.drawRectangle({ x: 0, y: H - hh, width: W, height: hh, color: NAVY });
      if (mono) { const h = small ? 22 : 30; pg.drawImage(mono, { x: M, y: H - hh / 2 - h / 2, width: mono.width * (h / mono.height), height: h }); }
      txt(pg, "THE OUTLIER GROUP", M + (mono ? 56 : 0), H - hh / 2 - 4, { size: small ? 9 : 10, font: sansB, color: rgb(0.94, 0.96, 0.97) });
      const tag = teaser ? "CONFIDENTIAL TEASER" : l.offMarket ? "CONFIDENTIAL - OFF-MARKET" : "PROPERTY BROCHURE";
      const tw = sansB.widthOfTextAtSize(tag, 9);
      txt(pg, tag, W - M - tw, H - hh / 2 - 4, { size: 9, font: sansB, color: l.offMarket ? CORAL : rgb(0.44, 0.69, 1) });
    };
    const footer = (pg, n) => {
      pg.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.6, color: LINE });
      txt(pg, `The Outlier Group | ${COMPANY.phone} | ${COMPANY.email} | Brokerage License ${COMPANY.license}`, M, 32, { size: 8, color: MUTED });
      const p = `Page ${n}`; txt(pg, p, W - M - sans.widthOfTextAtSize(p, 8), 32, { size: 8, color: MUTED });
    };

    /* ── Page 1 ── */
    const p1 = pdf.addPage([W, H]); header(p1); footer(p1, 1);
    let y = H - 96 - 38;
    const kicker = [l.offMarket ? "OFF-MARKET" : (l.statusNote || l.status), l.typeLabel || l.type, "FOR " + l.deal].filter(Boolean).join("  |  ").toUpperCase();
    txt(p1, kicker, M, y, { size: 9, font: sansB, color: BLUE }); y -= 30;
    const ts = fit(title, serif, 28, W - 2 * M); txt(p1, title, M, y, { size: ts, font: serif }); y -= 20;
    txt(p1, address, M, y, { size: 11, color: MUTED }); y -= 14;
    if (l.headline && !teaser) { txt(p1, l.headline + (l.subhead ? " - " + l.subhead : ""), M, y, { size: 10, color: MUTED }); y -= 12; }
    y -= 12;
    const heroH = 260;
    if (photos[0]) {
      const img = photos[0], bw = W - 2 * M, sc = Math.min(bw / img.width, heroH / img.height);
      const dw = img.width * sc, dh = img.height * sc;
      p1.drawRectangle({ x: M, y: y - heroH, width: bw, height: heroH, color: NAVY });
      p1.drawImage(img, { x: M + (bw - dw) / 2, y: y - heroH + (heroH - dh) / 2, width: dw, height: dh });
    } else {
      p1.drawRectangle({ x: M, y: y - heroH, width: W - 2 * M, height: heroH, color: rgb(0.93, 0.95, 0.97) });
      const msg = teaser ? "Photos are released after NDA approval" : "Photos available from the listing advisor";
      txt(p1, msg, W / 2 - sans.widthOfTextAtSize(msg, 11) / 2, y - heroH / 2, { size: 11, color: MUTED });
    }
    y -= heroH + 22;
    const boxes = [["UNIT # & SPACE AVAILABLE (SF)", d.space || "-"], ["BUILDING SIZE", d.building || "-"], ["UNIT SIZE (SF)", d.unit || "-"]];
    const bw3 = (W - 2 * M - 20) / 3;
    boxes.forEach(([k, v], i) => {
      const x = M + i * (bw3 + 10);
      p1.drawRectangle({ x, y: y - 58, width: bw3, height: 58, borderColor: LINE, borderWidth: 0.8, color: rgb(0.97, 0.98, 0.99) });
      txt(p1, k, x + 10, y - 16, { size: 7, font: sansB, color: MUTED });
      const lines = wrap(v, sansB, 11, bw3 - 20).slice(0, 2);
      lines.forEach((ln, j) => txt(p1, ln, x + 10, y - 34 - j * 13, { size: 11, font: sansB }));
    });
    y -= 82;
    const facts = [["Property Type", l.typeLabel || l.type], ["Offered For", l.deal], ["Status", l.offMarket ? "Off-Market" : (l.statusNote || l.status)]]
      .concat(teaser ? [["Market", l.region], ["Address", "Released after NDA approval"], [l.deal === "Sale" ? "Asking Price" : "Asking Rent", "Released after NDA approval"]] : (d.facts || []));
    txt(p1, l.deal === "Sale" ? "Sale Details" : "Pricing & Lease Terms", M, y, { size: 14, font: serif }); y -= 8;
    facts.slice(0, 9).forEach(([k, v]) => {
      y -= 18; if (y < 64) return;
      p1.drawLine({ start: { x: M, y: y - 5 }, end: { x: W - M, y: y - 5 }, thickness: 0.5, color: LINE });
      txt(p1, k, M, y, { size: 9.5, color: MUTED }); txt(p1, v, M + 200, y, { size: fit(v, sansB, 9.5, W - 2 * M - 200), font: sansB });
    });

    /* ── Page 2 ── */
    const p2 = pdf.addPage([W, H]); header(p2, true); footer(p2, 2);
    y = H - 54 - 40;
    txt(p2, "Overview", M, y, { size: 16, font: serif }); y -= 18;
    const desc = teaser ? `${l.teaser} This opportunity is offered off-market to qualified buyers and investors. The exact address, photos, pricing, and financials are shared after you sign The Outlier Group's NDA and your request is approved.` : (d.desc || l.desc || "");
    wrap(desc, sans, 10.5, W - 2 * M).forEach((ln) => { txt(p2, ln, M, y, { size: 10.5, color: INK }); y -= 14.5; });
    const hl = (det && det.highlights) || l.highlights || [];
    if (hl.length && !teaser) {
      y -= 12; txt(p2, "Property Highlights", M, y, { size: 16, font: serif }); y -= 18;
      const colW = (W - 2 * M - 20) / 2; const half = Math.ceil(hl.length / 2);
      let yl = y, yr = y;
      hl.forEach((h, i) => {
        const left = i < half; const x = left ? M : M + colW + 20; let yy = left ? yl : yr;
        p2.drawCircle({ x: x + 3, y: yy + 3.5, size: 2.2, color: BLUE });
        wrap(h, sans, 10, colW - 14).forEach((ln, j) => { txt(p2, ln, x + 12, yy - j * 13, { size: 10 }); });
        const n = wrap(h, sans, 10, colW - 14).length; if (left) yl -= 13 * n + 5; else yr -= 13 * n + 5;
      });
      y = Math.min(yl, yr) - 6;
    }
    const extra = photos.slice(1, 5);
    if (extra.length && y > 300) {
      y -= 8; txt(p2, "Photos", M, y, { size: 16, font: serif }); y -= 12;
      const gw = (W - 2 * M - 12) / 2, gh = 128;
      extra.forEach((img, i) => {
        const x = M + (i % 2) * (gw + 12), yy = y - gh - Math.floor(i / 2) * (gh + 12);
        if (yy < 190) return;
        const s = Math.min(gw / img.width, gh / img.height); const dw = img.width * s, dh = img.height * s;
        p2.drawRectangle({ x, y: yy, width: gw, height: gh, color: rgb(0.95, 0.96, 0.97) });
        p2.drawImage(img, { x: x + (gw - dw) / 2, y: yy + (gh - dh) / 2, width: dw, height: dh });
      });
      y -= Math.ceil(Math.min(extra.length, 4) / 2) * (gh + 12) + 4;
    }
    // Contact + location block
    const by = Math.max(70, Math.min(y - 20, 200));
    p2.drawRectangle({ x: M, y: by, width: W - 2 * M, height: 104, color: NAVY });
    txt(p2, "Contact the listing advisor", M + 18, by + 78, { size: 13, font: serif, color: rgb(0.94, 0.96, 0.97) });
    txt(p2, `${agent.name}, ${agent.role}`, M + 18, by + 56, { size: 10.5, font: sansB, color: rgb(0.94, 0.96, 0.97) });
    txt(p2, `${agent.phone}  |  ${agent.email}`, M + 18, by + 40, { size: 10, color: rgb(0.75, 0.82, 0.9) });
    txt(p2, teaser ? `Reference ${l.id}  |  Request access at outliergroup.us` : `Location: ${address}`, M + 18, by + 20, { size: fit(teaser ? `Reference ${l.id}` : `Location: ${address}`, sans, 9.5, W - 2 * M - 36), color: rgb(0.75, 0.82, 0.9) });
    const disc = "All information is provided for informational purposes only and should be independently verified. Neither The Outlier Group nor the property owner makes any representation or warranty as to its accuracy or completeness." + (l.offMarket ? " Confidential: subject to the signed Non-Disclosure Agreement." : "");
    let dy = by - 16; wrap(disc, sans, 7.5, W - 2 * M).forEach((ln) => { txt(p2, ln, M, dy, { size: 7.5, color: MUTED }); dy -= 10; });

    pdf.setTitle(`${title} - Property Brochure`); pdf.setAuthor("The Outlier Group"); pdf.setSubject(address);
    return await pdf.save();
  }

  OG.brochure = async function (l, det, btn) {
    if (!window.PDFLib) { OG.toast && OG.toast("The brochure tool didn't load. Check your connection and reload."); return; }
    const label = btn ? btn.innerHTML : "";
    if (btn) { btn.disabled = true; btn.textContent = "Preparing brochure…"; }
    try {
      const bytes = await build(l, det);
      const name = (det && det.name ? det.name : l.title).replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
      const ok = await saveFile(`${name}_${l.offMarket && !det ? "Teaser" : "Brochure"}.pdf`, bytes, "application/pdf");
      if (ok && OG.toast) OG.toast("Brochure ready");
      OG.post && OG.post({ type: "log", sheet: "Brochure_Downloads", row: { Timestamp: new Date().toISOString(), SessionID: OG.SESSION_ID, ListingID: l.id, Listing: l.title, Version: l.offMarket && !det ? "Teaser" : "Full" } });
    } catch (e) {
      OG.toast && OG.toast("Couldn't create the brochure: " + (e && e.message ? e.message : e));
    } finally { if (btn) { btn.disabled = false; btn.innerHTML = label; } }
  };
})();

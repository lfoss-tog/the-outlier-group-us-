/* ════════════════════════════════════════════════════════════
   THE OUTLIER GROUP — Off-market NDA: review → details → sign → file
   Flow: Request Access → NDA displayed → client reviews → client signs →
   signed PDF generated in the browser (pdf-lib, filled onto the original
   OG 2026 Agent NDA) → sent to the Apps Script → saved in the property's
   Google Drive folder, logged, and emailed to The Outlier Group.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  /* Text of "OG 2026 Agent NDA with principal.pdf" */
  const NDA_BODY = `
    <h3>1. PURPOSE AND SCOPE</h3>
    <p>The Broker possesses confidential and proprietary information regarding real estate properties, business opportunities, and related matters, including but not limited to property details, financial data, operational procedures, customer data, trade secrets, business strategies, investment opportunities, deal structures, client relationships, market research, feasibility studies, and proprietary analyses ("Confidential Information"). The Recipient intends to receive such Confidential Information solely to evaluate potential real estate transactions, business acquisitions, consulting arrangements, or other legitimate business opportunities disclosed by the Broker.</p>
    <h3>2. CONFIDENTIAL INFORMATION DEFINED</h3>
    <p>"Confidential Information" means any and all non-public, proprietary, or confidential information disclosed by the Disclosing Party, including but not limited to:</p>
    <ol><li>Real estate project details, specifications, and development plans</li><li>Property information, valuations, and financial analyses</li><li>Business acquisition opportunities and related documentation</li><li>Client lists, contact information, and business relationships</li><li>Investment opportunities and deal structures</li><li>Market research, feasibility studies, and proprietary analyses</li><li>Business strategies, methods, and processes</li><li>Financial information, pricing, and cost structures</li><li>Any information marked as "Confidential" or that would reasonably be considered confidential</li></ol>
    <p>Confidential Information includes information disclosed orally, in writing, electronically, or in any other form.</p>
    <h3>3. NON-DISCLOSURE OBLIGATIONS</h3>
    <p>The Receiving Party agrees to:</p>
    <ol><li><b>Maintain Confidentiality:</b> Hold all Confidential Information in strict confidence and not disclose, permit the disclosure of, release, disseminate, or transfer any Confidential Information to any other person or entity without prior written consent from the Disclosing Party.</li><li><b>Limited Use:</b> Use Confidential Information solely for the stated Purpose and not for any other purpose, including competitive advantage.</li><li><b>Protection:</b> Take reasonable precautions to protect Confidential Information, using at least the same degree of care used to protect its own confidential information, but no less than reasonable care.</li><li><b>Limited Access:</b> Restrict access to Confidential Information to employees, advisors, or representatives who have a legitimate need to know and who are bound by confidentiality obligations at least as restrictive as those contained herein.</li><li><b>No Reverse Engineering:</b> Not reverse engineer, disassemble, or otherwise attempt to derive the source or underlying ideas of any Confidential Information.</li></ol>
    <h3>4. NON-CIRCUMVENT PROVISIONS</h3>
    <p>The Recipient agrees not to directly or indirectly engage in any transaction, business dealings, or relationships with any property owner(s), business owner(s), employees, suppliers, clients, or affiliates of any business or property disclosed by the Broker without the explicit written consent of the Broker. This restriction remains in effect for a period of twenty-four (24) months from the date of this Agreement.</p>
    <p>This non-circumvent obligation includes but is not limited to:</p>
    <ol><li>Contacting any business or property owners directly using any means</li><li>Attempting to negotiate or purchase any property or business outside of the Broker's involvement</li><li>Engaging in any transaction with third parties introduced by Broker in connection with any disclosed opportunity</li><li>Soliciting or attempting to hire any employees or contractors of disclosed businesses</li><li>Interfering with any existing business relationships disclosed by the Broker</li></ol>
    <h3>5. BROKER COMMISSION AND REPRESENTATION</h3>
    <p>The Recipient represents and warrants that:</p>
    <ol><li>When acting through an agent or broker, both the agent and principal are jointly and severally liable for all obligations under this Agreement</li><li>Any broker commission, advisory fees, or finder's fees shall be payable only to The Outlier Group, LLC unless otherwise agreed to in writing</li><li>They will not attempt to circumvent the Broker's right to compensation in any resulting transaction</li><li>The agent signing on behalf of the principal has full authority to bind the principal to this Agreement</li></ol>
    <h3>6. EXCEPTIONS TO CONFIDENTIALITY</h3>
    <p>The obligations in Sections 3 and 4 do not apply to information that:</p>
    <ol><li>Is or becomes publicly available through no breach of this Agreement by the Receiving Party.</li><li>Was rightfully known by the Receiving Party prior to disclosure</li><li>Is rightfully received from a third party without breach of confidentiality</li><li>Is independently developed without use of Confidential Information</li><li>Is required to be disclosed by law or court order (with prompt notice to Disclosing Party)</li></ol>
    <h3>7. DISCLAIMER AND WARRANTIES</h3>
    <p>NEITHER BROKER NOR ANY PROPERTY/BUSINESS OWNER MAKES ANY REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED, AS TO THE ACCURACY OR COMPLETENESS OF ANY INFORMATION PROVIDED, including but not limited to financial statements, business operations, contracts, customer data, property conditions, or real estate valuations. All information is provided for informational purposes only. Recipient acknowledges and assumes complete responsibility for reconfirmation and verification of all information received and agrees to conduct their own due diligence.</p>
    <h3>8. RETURN OF MATERIALS</h3>
    <p>Upon written request by the Disclosing Party, or upon termination of discussions, the Receiving Party shall promptly return or destroy all documents, materials, and copies containing Confidential Information.</p>
    <h3>9. NO LICENSE OR RIGHTS GRANTED</h3>
    <p>No license, right, title, or interest in any Confidential Information is granted to the Receiving Party. All Confidential Information remains the sole property of the Disclosing Party.</p>
    <h3>10. NO OBLIGATION TO DISCLOSE</h3>
    <p>Nothing herein obligates the Disclosing Party to disclose any particular Confidential Information or to enter into any further agreement.</p>
    <h3>11. TERM AND SURVIVAL</h3>
    <p>This Agreement shall remain in effect for a period of three (3) years from the date of execution, unless earlier terminated by written agreement of both parties. The non-circumvent obligations shall remain in effect for twenty-four (24) months as specified in Section 4. All obligations regarding Confidential Information and non-circumvent provisions shall survive termination of this Agreement.</p>
    <h3>12. REMEDIES</h3>
    <p>The Receiving Party acknowledges that disclosure of Confidential Information or violation of non-circumvent provisions would cause irreparable harm to the Disclosing Party. Therefore, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or equity, including monetary damages and attorney's fees.</p>
    <h3>13. AUTHORITY TO BIND</h3>
    <p>The persons signing on behalf of the Recipient and Broker represent that they have the full authority to bind the party for whom they sign to all terms and conditions of this Agreement. When an agent signs on behalf of a principal, both parties are jointly and severally liable for all obligations hereunder.</p>
    <h3>14. GOVERNING LAW AND JURISDICTION</h3>
    <p>This Agreement shall be governed by and construed in accordance with the laws of the State of Florida, without regard to conflict of law principles.</p>
    <h3>15. ENTIRE AGREEMENT</h3>
    <p>This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof and supersedes all prior agreements and understandings, whether written or oral. This Agreement may only be modified in writing, signed by both parties.</p>
    <h3>16. COUNTERPARTS</h3>
    <p>This Agreement may be executed in counterparts, each of which shall be deemed an original, but all of which together shall constitute one and the same instrument. Execution and delivery of this Agreement by electronic transmission of a scanned or photographed signature shall be deemed as effective as an original signature.</p>
    <p>IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first written above.</p>
    <p style="margin-top:18px"><b>THE OUTLIER GROUP, LLC</b><br>By: countersigned by The Outlier Group after review</p>
    <p><b>RECEIVING PARTY</b><br>Signature, printed name, title, company, and date are completed in the next steps.</p>`;

  const S = { l: null, step: 1, d: {}, sig: null, sigMode: "draw", onDone: null, pdfBlob: null };

  function today() { const d = new Date(); return { md: MONTHS[d.getMonth()] + " " + d.getDate(), full: MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(), iso: d.toISOString(), d }; }
  function recipientName() {
    const d = S.d; if (d.as === "agent") return d.pCompany || d.pName || "";
    return d.company || d.name || "";
  }

  function open(l, onDone) {
    if (!l) return;
    Object.assign(S, { l, step: 1, d: (OG.store.get("og-nda-draft") || {}), sig: null, sigMode: "draw", onDone, pdfBlob: null });
    S.d.as = S.d.as || "principal";
    const m = document.createElement("div");
    m.className = "modal"; m.id = "ndaModal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "ndaTitle");
    m.innerHTML = `<div class="modal-box">
      <div class="modal-head"><div><h2 id="ndaTitle">Non-Disclosure Agreement</h2><p>${esc(l.title)} · ${esc(l.region || l.city)}</p></div><button class="icon-btn" type="button" data-nda-close aria-label="Close">✕</button></div>
      <div class="nda-steps" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <div class="modal-body" id="ndaBody"></div>
      <div class="modal-foot" id="ndaFoot"></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener("click", (e) => { if (e.target.closest("[data-nda-close]") && !m.dataset.locked) close(); });
    render();
  }
  function close() { const m = $("#ndaModal"); if (m) m.remove(); }

  function render() {
    const m = $("#ndaModal"); if (!m) return;
    m.querySelectorAll(".nda-steps span").forEach((s, i) => s.classList.toggle("on", i < S.step));
    const body = $("#ndaBody"), foot = $("#ndaFoot");
    if (S.step === 1) {
      const t = today();
      body.innerHTML = `
        <p class="muted" style="margin-top:0">Step 1 of 3 · Review the agreement. Scroll to the end to continue.</p>
        <div class="nda-doc" id="ndaDoc" tabindex="0" aria-label="NDA text">
          <div class="ref">Property reference: <b>${esc(S.l.id)}</b> · ${esc(S.l.title)} · Document: ${esc(OG_CONFIG.NDA_VERSION)}</div>
          <h2>NON-DISCLOSURE AND NON-CIRCUMVENT AGREEMENT</h2>
          <p>This Agreement is made and entered into on <span class="blank">${esc(t.md)}</span>, 2026, by and between The Outlier Group, LLC ("Broker" or "Disclosing Party"), and <span class="blank">${esc(recipientName() || "Your name or company")}</span> ("Recipient" or "Receiving Party"), concerning any property, business opportunity, or confidential information disclosed by the Broker.</p>
          ${NDA_BODY}
          <p id="ndaEnd" style="text-align:center;color:#627287;font-family:var(--font-body);font-size:.8rem;margin:24px 0 0">CONFIDENTIAL – The Outlier Group, LLC | (888) 966-4820 · End of document</p>
        </div>`;
      foot.innerHTML = `<a class="link" href="${OG_CONFIG.NDA_PDF}" target="_blank" rel="noopener">Open the original PDF ↗</a>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="scroll-hint" id="scrollHint">Scroll to the end to continue</span><button class="btn primary" type="button" id="ndaNext" disabled>I've read it — Continue</button></div>`;
      const doc = $("#ndaDoc"), next = $("#ndaNext");
      const check = () => { if (doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 40) { next.disabled = false; $("#scrollHint").textContent = ""; } };
      doc.addEventListener("scroll", check); setTimeout(check, 60);
      next.addEventListener("click", () => { S.step = 2; render(); });
      doc.focus();
    }
    if (S.step === 2) {
      const d = S.d;
      body.innerHTML = `
        <p class="muted" style="margin-top:0">Step 2 of 3 · Who is signing?</p>
        <form class="form-grid" id="ndaForm" novalidate>
          <fieldset style="border:0;padding:0;margin:0 0 6px"><legend class="label" style="margin-bottom:8px">I am signing as</legend>
            <div class="seg" role="radiogroup">
              <button type="button" role="radio" data-as="principal" aria-pressed="${d.as === "principal"}" aria-checked="${d.as === "principal"}">The principal / buyer</button>
              <button type="button" role="radio" data-as="agent" aria-pressed="${d.as === "agent"}" aria-checked="${d.as === "agent"}">An agent or broker for a principal</button>
            </div></fieldset>
          <div class="row"><div class="field"><label for="nName">Full legal name</label><input class="input" id="nName" name="name" required autocomplete="name" value="${esc(d.name || "")}"></div>
          <div class="field"><label for="nTitle">Title</label><input class="input" id="nTitle" name="title" required placeholder="e.g. Managing Member" value="${esc(d.title || "")}"></div></div>
          <div class="row"><div class="field"><label for="nCompany">Company${d.as === "agent" ? " / brokerage" : " (or “Individual”)"}</label><input class="input" id="nCompany" name="company" required autocomplete="organization" value="${esc(d.company || "")}"></div>
          <div class="field"><label for="nPhone">Phone</label><input class="input" id="nPhone" name="phone" type="tel" required autocomplete="tel" value="${esc(d.phone || "")}"></div></div>
          <div class="field"><label for="nEmail">Email</label><input class="input" id="nEmail" name="email" type="email" required autocomplete="email" value="${esc(d.email || "")}"></div>
          <div id="agentFields" ${d.as === "agent" ? "" : "hidden"}>
            <p class="label" style="margin:10px 0 10px">Principal you represent</p>
            <div class="row"><div class="field"><label for="pName">Principal's full name</label><input class="input" id="pName" name="pName" value="${esc(d.pName || "")}"></div>
            <div class="field"><label for="pCompany">Principal's company</label><input class="input" id="pCompany" name="pCompany" value="${esc(d.pCompany || "")}"></div></div>
            <div class="row" style="margin-top:12px"><div class="field"><label for="pTitle">Principal's title</label><input class="input" id="pTitle" name="pTitle" value="${esc(d.pTitle || "")}"></div>
            <div class="field"><label for="pEmail">Principal's email</label><input class="input" id="pEmail" name="pEmail" type="email" value="${esc(d.pEmail || "")}"></div></div>
            <p class="muted" style="font-size:.86rem;margin:10px 0 0">Under Sections 5 and 13, the agent and the principal are jointly and severally liable, and the agent confirms authority to bind the principal.</p>
          </div>
          <div class="form-msg err" id="ndaErr" hidden></div>
        </form>`;
      foot.innerHTML = `<button class="btn" type="button" id="ndaBack">Back</button><button class="btn primary" type="button" id="ndaNext">Continue to Signature</button>`;
      const form = $("#ndaForm");
      const save = () => { Object.assign(S.d, Object.fromEntries(new FormData(form).entries())); OG.store.set("og-nda-draft", { ...S.d }); };
      form.addEventListener("input", save);
      form.querySelectorAll("[data-as]").forEach((b) => b.addEventListener("click", () => { save(); S.d.as = b.dataset.as; render(); }));
      $("#ndaBack").addEventListener("click", () => { save(); S.step = 1; render(); });
      $("#ndaNext").addEventListener("click", () => {
        save();
        const need = ["name", "title", "company", "phone", "email"].concat(S.d.as === "agent" ? ["pName", "pEmail"] : []);
        const missing = need.filter((k) => !String(S.d[k] || "").trim() || (/email/i.test(k) && !/^\S+@\S+\.\S+$/.test(S.d[k])));
        if (missing.length) {
          const err = $("#ndaErr"); err.hidden = false;
          err.textContent = "Please complete: " + missing.map((k) => (form.querySelector(`[name="${k}"]`).labels[0] || {}).textContent).join(", ") + ".";
          form.querySelector(`[name="${missing[0]}"]`).focus(); return;
        }
        S.step = 3; render();
      });
      $("#nName").focus();
    }
    if (S.step === 3) {
      const t = today(); const d = S.d;
      body.innerHTML = `
        <p class="muted" style="margin-top:0">Step 3 of 3 · Sign the agreement</p>
        <div class="summary-list">
          <div><span>Signer</span><b>${esc(d.name)}, ${esc(d.title)} · ${esc(d.company)}</b></div>
          ${d.as === "agent" ? `<div><span>On behalf of principal</span><b>${esc(d.pName)}${d.pCompany ? " · " + esc(d.pCompany) : ""}</b></div>` : ""}
          <div><span>Receiving Party</span><b>${esc(recipientName())}</b></div>
          <div><span>Property</span><b>${esc(S.l.title)}</b></div>
          <div><span>Date</span><b>${esc(t.full)}</b></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
          <span class="label">Your signature</span>
          <div class="seg" role="group" aria-label="Signature method"><button type="button" data-sm="draw" aria-pressed="${S.sigMode === "draw"}">Draw</button><button type="button" data-sm="type" aria-pressed="${S.sigMode === "type"}">Type</button></div>
        </div>
        <div id="sigDraw" ${S.sigMode === "draw" ? "" : "hidden"}>
          <div class="sig-wrap"><canvas id="sigPad" aria-label="Signature pad — draw your signature"></canvas><span class="sig-x">×</span><span class="sig-line"></span></div>
          <div class="sig-tools"><span class="muted" style="font-size:.84rem">Sign with your mouse, trackpad, or finger.</span><button class="link" type="button" id="sigClear" style="background:none;border:0">Clear</button></div>
        </div>
        <div id="sigType" ${S.sigMode === "type" ? "" : "hidden"}>
          <div class="field"><label for="sigText">Type your full name</label><input class="input" id="sigText" value="${esc(d.name)}"></div>
          <div class="sig-wrap" style="padding:18px 22px;min-height:96px"><div class="typed-sig" id="sigPreview">${esc(d.name)}</div></div>
        </div>
        <label class="check" style="margin-top:18px"><input type="checkbox" id="ndaAgree"> <span>I have read and agree to The Outlier Group Non-Disclosure and Non-Circumvent Agreement${d.as === "agent" ? ", and I confirm I have authority to bind the principal named above" : ""}. I agree that my electronic signature is the legal equivalent of my handwritten signature.</span></label>
        <div class="form-msg err" id="ndaErr" hidden style="margin-top:12px"></div>`;
      foot.innerHTML = `<button class="btn" type="button" id="ndaBack">Back</button><button class="btn primary" type="button" id="ndaSubmit">Sign &amp; Submit NDA</button>`;
      body.querySelectorAll("[data-sm]").forEach((b) => b.addEventListener("click", () => { S.sigMode = b.dataset.sm; render(); }));
      $("#ndaBack").addEventListener("click", () => { S.step = 2; render(); });
      if (S.sigMode === "draw") pad($("#sigPad"));
      else { const i = $("#sigText"); i.addEventListener("input", () => ($("#sigPreview").textContent = i.value)); }
      $("#ndaSubmit").addEventListener("click", submit);
    }
    if (S.step === 4) {
      const r = S.result || {}; const a = OG.agentOf(S.l);
      body.innerHTML = r.ok ? `
        <div class="done-mark">${OG.ICON.check}</div>
        <h2 style="font-size:1.6rem;margin-bottom:.6rem">${S.dup ? "You already have a request for this property" : "NDA request submitted"}</h2>
        ${S.dup ? `<p class="muted">We already have your signed NDA for this property (reference <b>${esc(S.ref)}</b>, status <b>${esc(S.dupStatus)}</b>), so nothing new was filed. ${S.dupStatus === "Approved" ? "Your access link was emailed when it was approved. Check your inbox, or call us for a new copy." : "It's still being reviewed; you'll get an email as soon as it's decided."}</p>` : ""}
        <p class="muted"${S.dup ? " hidden" : ""}>Your signed NDA ${r.confirmed ? "has been securely filed with The Outlier Group" : "is on its way to The Outlier Group"}. Our team has been notified and will approve or deny your request. When it's approved, we'll email <b>${esc(S.d.email)}</b> a link that unlocks this property's address, photos, pricing, and full brochure.</p>
        <div class="status-line"><span class="dot ${S.dup && S.dupStatus === "Approved" ? "ok" : "pending"}"></span><span>Status: <b>${S.dup && S.dupStatus === "Approved" ? "Approved" : "Pending approval"}</b></span></div>
        <div class="summary-list">
          <div><span>Property</span><b>${esc(S.l.title)}</b></div>
          <div><span>Signed</span><b>${esc(new Date(S.signedAt).toLocaleString())}</b></div>
          <div><span>Reference</span><b>${esc(S.ref)}</b></div>
        </div>
        <p class="muted" style="font-size:.88rem">If you don't hear from us within one business day, call ${esc(COMPANY.phone)} and mention reference ${esc(S.ref)}.</p>`
        : `
        <h2 style="font-size:1.4rem;margin-bottom:.6rem">We couldn't send your NDA</h2>
        <p class="muted">Your NDA is signed, but it didn't reach The Outlier Group's server${r.error ? ` (${esc(r.error)})` : ""}. Download your signed copy and email it to <b>${esc(a.email)}</b>, or try again.</p>`;
      foot.innerHTML = `<button class="btn" type="button" id="ndaDl">Download signed copy (PDF)</button>
        <div style="display:flex;gap:10px">${r.ok ? "" : `<button class="btn" type="button" id="ndaRetry">Try again</button>`}<button class="btn primary" type="button" data-nda-close>Done</button></div>`;
      $("#ndaDl").addEventListener("click", async () => { const buf = new Uint8Array(await S.pdfBlob.arrayBuffer()); OG.saveFile(S.fileName, buf, "application/pdf"); });
      const retry = $("#ndaRetry"); if (retry) retry.addEventListener("click", () => send());
      $("#ndaModal").addEventListener("click", (e) => { if (e.target.closest("[data-nda-close]") && S.onDone && r.ok) S.onDone(); }, { once: true });
    }
  }

  /* signature pad */
  function pad(c) {
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const size = () => { const r = c.getBoundingClientRect(); c.width = r.width * ratio; c.height = r.height * ratio; const x = c.getContext("2d"); x.scale(ratio, ratio); x.lineWidth = 2.2; x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = "#0D1520"; };
    size();
    const ctx = c.getContext("2d"); let drawing = false, last = null, strokes = 0;
    const pt = (e) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    c.addEventListener("pointerdown", (e) => { drawing = true; last = pt(e); c.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.arc(last.x, last.y, 1, 0, Math.PI * 2); ctx.fillStyle = "#0D1520"; ctx.fill(); });
    c.addEventListener("pointermove", (e) => { if (!drawing) return; const p = pt(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.quadraticCurveTo(last.x, last.y, p.x, p.y); ctx.stroke(); last = p; strokes++; });
    const end = () => { if (drawing) { drawing = false; S.sig = strokes > 6 ? c : S.sig; } };
    c.addEventListener("pointerup", end); c.addEventListener("pointerleave", end); c.addEventListener("pointercancel", end);
    $("#sigClear").addEventListener("click", () => { ctx.clearRect(0, 0, c.width, c.height); strokes = 0; S.sig = null; });
    S.sig = null;
  }

  async function sigPng() {
    if (S.sigMode === "draw") {
      if (!S.sig) return null;
      const src = S.sig, w = src.width, h = src.height, x = src.getContext("2d");
      const data = x.getImageData(0, 0, w, h).data; let minX = w, minY = h, maxX = 0, maxY = 0;
      for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (data[(y * w + i) * 4 + 3] > 10) { if (i < minX) minX = i; if (i > maxX) maxX = i; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      if (maxX <= minX) return null;
      const pad = 6, cw = maxX - minX + pad * 2, ch = maxY - minY + pad * 2;
      const out = document.createElement("canvas"); out.width = cw; out.height = ch;
      out.getContext("2d").drawImage(src, minX - pad, minY - pad, cw, ch, 0, 0, cw, ch);
      return out.toDataURL("image/png");
    }
    const text = ($("#sigText").value || "").trim(); if (!text) return null;
    try { await document.fonts.load('64px "Mrs Saint Delafield"'); } catch (e) {}
    const c = document.createElement("canvas"); const x = c.getContext("2d"); x.font = '64px "Mrs Saint Delafield", "Brush Script MT", cursive';
    const w = Math.ceil(x.measureText(text).width) + 30; c.width = w; c.height = 110;
    const y = c.getContext("2d"); y.font = '64px "Mrs Saint Delafield", "Brush Script MT", cursive'; y.fillStyle = "#0D1520"; y.textBaseline = "middle"; y.fillText(text, 12, 58);
    return c.toDataURL("image/png");
  }

  async function ndaBytes() {
    if (window.OG_NDA_B64) { const b = atob(window.OG_NDA_B64); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
    const r = await fetch(OG_CONFIG.NDA_PDF); if (!r.ok) throw new Error("NDA file not found"); return new Uint8Array(await r.arrayBuffer());
  }

  async function buildPdf(sigDataUrl) {
    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdf = await PDFDocument.load(await ndaBytes());
    const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const ink = rgb(0.05, 0.18, 0.55);
    const pages = pdf.getPages(); const t = today(); const d = S.d;
    const fit = (txt, maxW, size) => { let s = size; while (s > 6 && font.widthOfTextAtSize(txt, s) > maxW) s -= 0.5; return s; };
    const put = (pg, txt, x, y, maxW, size = 10) => { if (!txt) return; pg.drawText(txt, { x, y, size: fit(txt, maxW, size), font, color: ink }); };
    // Page 1 — date and Receiving Party
    put(pages[0], t.md, 285, 683.5, 66, 10);
    put(pages[0], recipientName(), 302, 668.6, 195, 10);
    // Page 5 — signature blocks
    const p5 = pages[4];
    const sig = await pdf.embedPng(sigDataUrl);
    const drawSig = (y) => {
      let h = 30, w = sig.width * (h / sig.height);
      if (w > 150) { w = 150; h = sig.height * (150 / sig.width); }
      p5.drawImage(sig, { x: 124, y: y - 3, width: w, height: h });
    };
    if (d.as === "agent") {
      drawSig(627.8);
      put(p5, d.name, 144, 603, 96); put(p5, d.title, 101, 576, 120); put(p5, d.company, 123, 549.3, 112); put(p5, t.full, 101, 522.5, 124);
      put(p5, `By ${d.name}, authorized agent (Sec. 5(d), 13)`, 124, 415, 180, 8.5);
      put(p5, d.pName, 144, 388.3, 96); put(p5, d.pTitle || "", 101, 361.5, 120); put(p5, d.pCompany || "", 123, 334.7, 56); put(p5, t.full, 101, 307.8, 124);
    } else {
      drawSig(413.1);
      put(p5, d.name, 144, 388.3, 96); put(p5, d.title, 101, 361.5, 120); put(p5, d.company, 123, 334.7, 56); put(p5, t.full, 101, 307.8, 124);
    }
    // Certificate page
    const c = pdf.addPage([612, 792]); let y = 720;
    c.drawText("Electronic Signature Certificate", { x: 72, y, size: 18, font: bold, color: rgb(0.05, 0.08, 0.13) }); y -= 22;
    c.drawText("The Outlier Group, LLC  ·  Off-Market Access NDA", { x: 72, y, size: 10, font, color: rgb(0.38, 0.45, 0.53) }); y -= 34;
    const rows = [
      ["Reference", S.ref], ["Document", OG_CONFIG.NDA_VERSION], ["Property reference", S.l.id], ["Property", S.l.title], ["Market", S.l.region || S.l.city],
      ["Signed", new Date(S.signedAt).toString()], ["Signed (UTC)", S.signedAt],
      ["Signing as", d.as === "agent" ? "Agent / broker on behalf of a principal" : "Principal / buyer"],
      ["Signer", `${d.name}, ${d.title}`], ["Company", d.company], ["Email", d.email], ["Phone", d.phone]
    ].concat(d.as === "agent" ? [["Principal", `${d.pName}${d.pTitle ? ", " + d.pTitle : ""}`], ["Principal company", d.pCompany || "—"], ["Principal email", d.pEmail]] : [])
     .concat([["Signature method", S.sigMode === "draw" ? "Drawn on screen" : "Typed name"], ["Browser", navigator.userAgent.slice(0, 95)], ["Session", OG.SESSION_ID]]);
    rows.forEach(([k, v]) => { c.drawText(k, { x: 72, y, size: 9.5, font, color: rgb(0.38, 0.45, 0.53) }); c.drawText(String(v || "—"), { x: 210, y, size: fit(String(v || "—"), 330, 10), font, color: rgb(0.05, 0.08, 0.13) }); y -= 19; });
    y -= 16;
    const consent = "The signer reviewed the full agreement on screen, checked the consent box agreeing that their electronic signature is the legal equivalent of a handwritten signature, and signed. Under Section 16, electronic execution is as effective as an original signature. The Outlier Group countersigns after review.";
    const words = consent.split(" "); let line = "";
    words.forEach((w) => { if (font.widthOfTextAtSize(line + w, 9.5) > 468) { c.drawText(line, { x: 72, y, size: 9.5, font, color: rgb(0.2, 0.25, 0.33) }); y -= 14; line = ""; } line += w + " "; });
    c.drawText(line, { x: 72, y, size: 9.5, font, color: rgb(0.2, 0.25, 0.33) }); y -= 30;
    c.drawText("Signature", { x: 72, y, size: 9.5, font, color: rgb(0.38, 0.45, 0.53) });
    const sh = 40, sw = Math.min(220, sig.width * (sh / sig.height)); c.drawImage(sig, { x: 210, y: y - 12, width: sw, height: sw * (sig.height / sig.width) });
    pdf.setTitle(`NDA — ${S.l.title} — ${d.name}`); pdf.setAuthor(d.name); pdf.setSubject(OG_CONFIG.NDA_VERSION); pdf.setProducer("outliergroup.us"); pdf.setCreationDate(new Date(S.signedAt));
    return await pdf.save();
  }

  function b64(bytes) { let s = ""; const chunk = 0x8000; for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk)); return btoa(s); }
  async function sha256(bytes) { try { const h = await crypto.subtle.digest("SHA-256", bytes); return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join(""); } catch (e) { return ""; } }

  async function submit() {
    const err = $("#ndaErr"); err.hidden = true;
    if (!$("#ndaAgree").checked) { err.hidden = false; err.textContent = "Check the box to agree to the NDA and to signing electronically."; return; }
    const png = await sigPng();
    if (!png) { err.hidden = false; err.textContent = S.sigMode === "draw" ? "Draw your signature in the box, or switch to Type." : "Type your full name to create your signature."; return; }
    if (!window.PDFLib) { err.hidden = false; err.textContent = "The signing tool didn't load. Check your connection and reload the page."; return; }
    const btn = $("#ndaSubmit"); btn.disabled = true; btn.textContent = "Preparing your signed NDA…"; $("#ndaModal").dataset.locked = "1";
    try {
      S.signedAt = new Date().toISOString();
      S.ref = OG.makeId("NDA");
      const bytes = await buildPdf(png);
      S.pdfBlob = new Blob([bytes], { type: "application/pdf" });
      const last = (S.d.name || "Signer").trim().split(/\s+/).pop().replace(/[^A-Za-z0-9-]/g, "");
      S.fileName = `NDA_${S.l.id}_${last}_${S.signedAt.slice(0, 10)}_${S.ref.slice(-6)}.pdf`;
      S.b64 = b64(bytes); S.hash = await sha256(bytes);
      btn.textContent = "Sending to The Outlier Group…";
      await send();
    } catch (e) {
      btn.disabled = false; btn.textContent = "Sign & Submit NDA"; delete $("#ndaModal").dataset.locked;
      err.hidden = false; err.textContent = "Something went wrong creating the PDF: " + (e && e.message ? e.message : e);
    }
  }

  async function send() {
    const a = OG.agentOf(S.l), d = S.d;
    const r = await OG.post({
      type: "nda", ref: S.ref, propertyId: S.l.id, propertyTitle: S.l.title, market: S.l.region || S.l.city, deal: S.l.deal, propertyType: S.l.typeLabel || S.l.type,
      agentName: a.name, agentEmail: a.email, signingAs: d.as, signedAt: S.signedAt,
      signer: { name: d.name, title: d.title, company: d.company, email: d.email, phone: d.phone },
      principal: d.as === "agent" ? { name: d.pName, title: d.pTitle, company: d.pCompany, email: d.pEmail } : null,
      recipient: recipientName(), signatureMethod: S.sigMode, userAgent: navigator.userAgent, ndaVersion: OG_CONFIG.NDA_VERSION,
      fileName: S.fileName, sha256: S.hash, pdfBase64: S.b64
    });
    S.result = r;
    const m = $("#ndaModal"); if (m) delete m.dataset.locked;
    // The server skips duplicates (same submission sent twice, or an open request already on file
    // for this person and property) and returns the existing request instead.
    S.dup = !!(r.ok && r.data && r.data.duplicate);
    if (S.dup && r.data.ref) { S.ref = r.data.ref; S.dupStatus = r.data.nda || "Pending"; }
    if (r.ok) {
      OG.setNda(S.l.id, { at: S.signedAt, email: d.email, ref: S.ref, status: "pending" });
    }
    S.step = 4; render();
  }

  window.OG = window.OG || {};
  window.OG.openNDA = open;
})();

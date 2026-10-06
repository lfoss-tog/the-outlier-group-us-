/* ════════════════════════════════════════════════════════════
   Listing Intelligence: backend connector for Create a Listing
   Demo mode: does nothing (the page simulates every step).
   Live mode (Agent Portal on Apps Script): saves drafts, uploads
   original photos and documents to the property's private Drive folder,
   submits for review, and loads a listing opened from an email link.
   Contract: see BACKEND-CONTRACT.md in this package.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var cfg = function () { return window.LISTING_INTAKE_CONFIG || {}; };
  var live = function () { return cfg().DEMO_MODE === false; };
  var boot = function () { return window.LISTING_INTAKE_BOOT || {}; };

  /* Backend status → page state (workflow index + failure flag) */
  var STATUS = {
    "Draft": { wf: 0 }, "Changes Requested": { wf: 0 }, "In Review": { wf: 1 }, "Approved": { wf: 2 },
    "Excel Created": { wf: 3 }, "Flyer Created": { wf: 4 }, "Ready for Review": { wf: 5 }, "Published": { wf: 6 },
    "Excel Failed": { wf: 2, fail: "excel" }, "Flyer Failed": { wf: 3, fail: "flyer" }
  };
  var pollTimer = null, queue = Promise.resolve(), lastSaved = "";

  function call(payload) {
    /* Preferred: page served by the Apps Script intake deployment (Google sign-in required) */
    if (window.google && google.script && google.script.run) {
      return new Promise(function (ok, fail) { google.script.run.withSuccessHandler(ok).withFailureHandler(fail).handleIntake(payload); });
    }
    if (!cfg().ENDPOINT) return Promise.reject(new Error("No intake backend configured"));
    return fetch(cfg().ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload), redirect: "follow" })
      .then(function (r) { return r.json(); });
  }

  function rememberId(id) {
    try { if (id && window.google && google.script && google.script.history) google.script.history.replace(null, { listing: id }); } catch (e) {}
  }

  function apply(comp, res) {
    if (!res || !comp) return;
    var patch = {};
    if (res.listingId && res.listingId !== comp.state.listingId) { patch.listingId = res.listingId; rememberId(res.listingId); }
    if (res.revision) patch.revision = res.revision;
    if (res.status && STATUS[res.status]) { patch.wf = STATUS[res.status].wf; patch.fail = STATUS[res.status].fail || null; patch.running = null; }
    if (res.values) patch.vals = Object.assign({}, comp.state.vals, res.values);
    if (res.files) patch.files = res.files;
    if (res.step) patch.step = res.step;
    if (res.log) patch.log = [res.log].concat(comp.state.log || []).slice(0, 5);
    comp.setState(patch);
    if (res.message) comp.flash(res.message);
    if (res.downloadUrl) window.open(res.downloadUrl, "_blank", "noopener");
    /* Keep polling while the backend is creating the Excel file / flyer */
    var busy = res.automation !== "off" && (res.status === "Approved" || res.status === "Excel Created" || res.status === "Flyer Created");
    if (busy) startPolling(comp); else stopPolling();
  }

  function startPolling(comp) {
    if (pollTimer || !comp.state.listingId) return;
    pollTimer = setInterval(function () {
      call({ type: "intake", action: "status", listing: { listingId: comp.state.listingId } })
        .then(function (res) { apply(comp, res); })
        .catch(function () { /* keep trying quietly */ });
    }, Math.max(3, cfg().STATUS_POLL_SECONDS || 10) * 1000);
  }
  function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

  /* ── File uploads: originals go to the property's private Drive folder, unchanged ── */
  function readDataUrl(file) {
    return new Promise(function (ok, fail) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = fail; r.readAsDataURL(file); });
  }
  /* Photo quality measured in the browser (on a small copy) so the backend can pick the best photos:
     size in pixels, sharpness (variance of the Laplacian), brightness, contrast and a 64-bit
     difference hash for spotting near-duplicates. Nothing here changes the uploaded file. */
  function analyzePhoto(file) {
    return new Promise(function (ok) {
      var url; try { url = URL.createObjectURL(file); } catch (e) { ok(null); return; }
      var img = new Image();
      img.onload = function () {
        try {
          var W = img.naturalWidth, H = img.naturalHeight, k = Math.min(1, 256 / Math.max(W, H));
          var w = Math.max(9, Math.round(W * k)), h = Math.max(8, Math.round(H * k));
          var c = document.createElement("canvas"); c.width = w; c.height = h;
          var g = c.getContext("2d"); g.drawImage(img, 0, 0, w, h);
          var d = g.getImageData(0, 0, w, h).data, n = w * h, Y = new Float32Array(n), sum = 0, sq = 0, i;
          for (i = 0; i < n; i++) { var y = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; Y[i] = y; sum += y; sq += y * y; }
          var mean = sum / n, sd = Math.sqrt(Math.max(0, sq / n - mean * mean)), ls = 0, ls2 = 0, m = 0;
          for (var yy = 1; yy < h - 1; yy++) for (var xx = 1; xx < w - 1; xx++) { var p = yy * w + xx, L = Y[p - 1] + Y[p + 1] + Y[p - w] + Y[p + w] - 4 * Y[p]; ls += L; ls2 += L * L; m++; }
          var lm = m ? ls / m : 0, lv = m ? ls2 / m - lm * lm : 0;
          var c2 = document.createElement("canvas"); c2.width = 9; c2.height = 8;
          var g2 = c2.getContext("2d"); g2.drawImage(img, 0, 0, 9, 8);
          var e = g2.getImageData(0, 0, 9, 8).data, bits = "", hex = "";
          for (var r = 0; r < 8; r++) for (var q = 0; q < 8; q++) { var a = (r * 9 + q) * 4, b = a + 4; bits += (e[a] + e[a + 1] + e[a + 2]) > (e[b] + e[b + 1] + e[b + 2]) ? "1" : "0"; }
          for (var s = 0; s < 64; s += 4) hex += parseInt(bits.slice(s, s + 4), 2).toString(16);
          ok({ w: W, h: H, sharp: Math.round(lv), bright: Math.round(mean / 255 * 1000) / 1000, contrast: Math.round(sd / 255 * 1000) / 1000, hash: hex });
        } catch (x) { ok(null); } finally { try { URL.revokeObjectURL(url); } catch (x) {} }
      };
      img.onerror = function () { try { URL.revokeObjectURL(url); } catch (x) {} ok(null); };
      img.src = url;
    });
  }

  function uploadPending(comp) {
    var pending = (comp.state.files || []).filter(function (f) { return f.file && !f.driveId; });
    return pending.reduce(function (p, f) {
      return p.then(function () {
        var isImg = f.kind === "image";
        return Promise.all([readDataUrl(f.file), isImg ? analyzePhoto(f.file) : Promise.resolve(null)]).then(function (r) {
          return call({ type: "intake", action: "upload_file", listingId: comp.state.listingId,
            file: { id: f.id, name: f.name, kind: f.kind, category: f.category || "", web: !!f.web, size: f.size, dataUrl: r[0], metrics: r[1] } });
        }).then(function (res) {
          if (!res || res.status === "error" || !res.driveId) throw new Error((res && res.message) || "Upload failed: " + f.name);
          comp.setState({ files: (comp.state.files || []).map(function (x) { return x.id === f.id ? Object.assign({}, x, { driveId: res.driveId }) : x; }) });
        });
      });
    }, Promise.resolve());
  }

  function ensureId(comp) {
    if (comp.state.listingId) return Promise.resolve();
    return call({ type: "intake", action: "save_draft", quiet: true, listing: comp.snapshot() }).then(function (res) {
      if (!res || res.status === "error" || !res.listingId) throw new Error((res && res.message) || "The draft couldn't be saved.");
      apply(comp, res);
    });
  }

  function fingerprint(comp) {
    var s = comp.snapshot();
    return JSON.stringify([s.values, s.files.map(function (f) { return [f.id, f.category, f.web]; })]);
  }

  function run(action, comp, opts) {
    opts = opts || {};
    queue = queue.then(function () {
      var before = comp.state.wf;
      var prep = (action === "save_draft" || action === "submit_for_review")
        ? ensureId(comp).then(function () { return uploadPending(comp); }) : Promise.resolve();
      return prep.then(function () {
        return call({ type: "intake", action: action, quiet: !!opts.quiet, listing: comp.snapshot() });
      }).then(function (res) {
        if (res && res.status === "error") {
          comp.flash(res.message || "The listing service reported a problem. Nothing was lost; please try again.");
          var cur = STATUS[res.current] ? res.current : null;
          comp.setState(cur ? { wf: STATUS[cur].wf, fail: STATUS[cur].fail || null } : { wf: before === 1 && action === "submit_for_review" ? 0 : comp.state.wf });
          return;
        }
        if (action === "save_draft" || action === "submit_for_review") lastSaved = fingerprint(comp);
        if (opts.quiet && res) { res.message = ""; res.log = ""; }
        apply(comp, res);
      }).catch(function (e) {
        if (!opts.quiet) comp.flash((e && e.message && /Upload|saved/.test(e.message)) ? e.message : "Couldn't reach the listing service. Your entries are still on this page; please try again.");
        if (action === "submit_for_review") comp.setState({ wf: 0 });
      });
    });
    return queue;
  }

  window.ListingIntakeBackend = {
    send: function (action, snapshot, comp) {
      if (!live()) return;   // demo mode: the page simulates everything
      run(action, comp);
    }
  };

  /* Live mode: open the listing from the email link, then autosave drafts every 30 seconds */
  window.addEventListener("load", function () {
    if (!live()) return;
    var comp = window.ListingIntake;
    if (!comp) return;
    var id = boot().listingId;
    if (id) {
      call({ type: "intake", action: "load", listingId: id }).then(function (res) {
        if (res && res.status === "error") { comp.flash(res.message); return; }
        apply(comp, res); lastSaved = fingerprint(comp);
      }).catch(function () { comp.flash("Couldn't open listing " + id + ". Please reload the page."); });
    } else { lastSaved = fingerprint(comp); }
    setInterval(function () {
      if (comp.state.wf !== 0 || comp.state.fail) return;
      var fp = fingerprint(comp);
      if (fp === lastSaved) return;
      run("save_draft", comp, { quiet: true });
    }, 30000);
  });
})();

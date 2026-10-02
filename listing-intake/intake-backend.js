/* ════════════════════════════════════════════════════════════
   Listing Intelligence: backend connector for Create a Listing
   Demo mode: does nothing (the page simulates every step).
   Live mode: sends each action to the intake backend and keeps the
   status bar in sync while Excel and the Canva flyer are created.
   Contract: see BACKEND-CONTRACT.md in this package.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var cfg = function () { return window.LISTING_INTAKE_CONFIG || {}; };
  var live = function () { return cfg().DEMO_MODE === false; };

  /* Backend status → page state (workflow index + failure flag) */
  var STATUS = {
    "Draft": { wf: 0 }, "Changes Requested": { wf: 0 }, "In Review": { wf: 1 }, "Approved": { wf: 2 },
    "Excel Created": { wf: 3 }, "Flyer Created": { wf: 4 }, "Ready for Review": { wf: 5 }, "Published": { wf: 6 },
    "Excel Failed": { wf: 2, fail: "excel" }, "Flyer Failed": { wf: 3, fail: "flyer" }
  };
  var pollTimer = null;

  function call(payload) {
    /* Preferred: page served by the Apps Script intake deployment (Google sign-in required) */
    if (window.google && google.script && google.script.run) {
      return new Promise(function (ok, fail) { google.script.run.withSuccessHandler(ok).withFailureHandler(fail).handleIntake(payload); });
    }
    if (!cfg().ENDPOINT) return Promise.reject(new Error("No intake backend configured"));
    return fetch(cfg().ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload), redirect: "follow" })
      .then(function (r) { return r.json(); });
  }

  function apply(comp, res) {
    if (!res || !comp) return;
    var patch = {};
    if (res.listingId) patch.listingId = res.listingId;
    if (res.revision) patch.revision = res.revision;
    if (res.status && STATUS[res.status]) { patch.wf = STATUS[res.status].wf; patch.fail = STATUS[res.status].fail || null; patch.running = null; }
    if (res.log) patch.log = [res.log].concat(comp.state.log || []).slice(0, 5);
    comp.setState(patch);
    if (res.message) comp.flash(res.message);
    if (res.downloadUrl) window.open(res.downloadUrl, "_blank", "noopener");
    /* Keep polling while the backend is creating the Excel file / flyer */
    var busy = res.status === "Approved" || res.status === "Excel Created" || res.status === "Flyer Created";
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

  window.ListingIntakeBackend = {
    send: function (action, snapshot, comp) {
      if (!live()) return;   // demo mode: the page simulates everything
      call({ type: "intake", action: action, listing: snapshot })
        .then(function (res) {
          if (res && res.status === "error") { comp.flash(res.message || "The listing service reported a problem. Nothing was lost; please try again."); return; }
          apply(comp, res);
        })
        .catch(function () { comp.flash("Couldn't reach the listing service. Your entries are still on this page; please try again."); });
    }
  };
})();

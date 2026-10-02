/* ════════════════════════════════════════════════════════════
   Listing Intelligence: tiny template runtime ("dc-lite")
   Renders the Create a Listing markup (with {{holes}}, <sc-if>,
   <sc-for> and onClick/onChange handlers) from a Component's
   renderVals(), and patches the page in place on every change so
   typing never loses focus. No libraries, no build step.
   Everything is scoped to this page; it defines window.DCLogic
   and window.DCLite only.
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* Base class the Create a Listing component extends */
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) {
      const p = typeof patch === "function" ? patch(this.state, this.props) : patch;
      Object.assign(this.state, p || {});
      if (this.__render) this.__render();
    }
    forceUpdate() { if (this.__render) this.__render(); }
  }

  /* {{ path }} lookup: dotted path or literal only (never an expression) */
  function lookup(path, scope) {
    path = path.trim();
    if (path === "true") return true;
    if (path === "false") return false;
    if (path === "null") return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    let v = scope;
    for (const k of path.split(".")) { if (v == null) return undefined; v = v[k]; }
    return v;
  }
  const WHOLE = /^\s*\{\{([^}]+)\}\}\s*$/;
  const ANY = /\{\{([^}]+)\}\}/g;
  const interp = (s, scope) => s.replace(ANY, (_, p) => { const v = lookup(p, scope); return v == null ? "" : String(v); });
  const raw = (s, scope) => { const m = WHOLE.exec(s); return m ? lookup(m[1], scope) : interp(s, scope); };

  /* <select><sc-for …><option>{{x}}</option></sc-for></select> can't survive HTML parsing,
     so it is rewritten to <select data-options="{{list}}"> before parsing. */
  function preprocess(html) {
    return html.replace(/<select([^>]*)>\s*<sc-for\s+list="(\{\{[^}]+\}\})"[^>]*>\s*<option>\{\{[^}]+\}\}<\/option>\s*<\/sc-for>\s*<\/select>/g,
      (_, attrs, list) => `<select${attrs} data-options="${list}"></select>`);
  }

  const EVENTS = { onclick: "click", onchange: "change", ondragover: "dragover", ondragleave: "dragleave", ondrop: "drop", oninput: "input" };
  const PROPS = { value: 1, checked: 1 };

  /* Build a DOM fragment for one template node in the given scope */
  function build(node, scope, out) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(interp(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === "sc-if") {
      if (raw(node.getAttribute("value") || "", scope)) node.childNodes.forEach((c) => build(c, scope, out));
      return;
    }
    if (tag === "sc-for") {
      const list = raw(node.getAttribute("list") || "", scope) || [], as = node.getAttribute("as") || "item";
      list.forEach((item, i) => { const s = Object.create(scope); s[as] = item; s.$index = i; node.childNodes.forEach((c) => build(c, s, out)); });
      return;
    }
    const el = node.namespaceURI === "http://www.w3.org/2000/svg" ? document.createElementNS(node.namespaceURI, node.tagName) : document.createElement(tag);
    el.__h = {}; el.__p = {};
    for (const a of Array.from(node.attributes)) {
      const name = a.name.toLowerCase();
      if (name.startsWith("hint-")) continue;
      if (EVENTS[name]) { const fn = raw(a.value, scope); if (typeof fn === "function") el.__h[EVENTS[name]] = fn; continue; }
      if (name === "data-options") {
        (raw(a.value, scope) || []).forEach((o) => { const opt = document.createElement("option"); opt.textContent = o; el.appendChild(opt); });
        continue;
      }
      const v = raw(a.value, scope);
      if (PROPS[name] && (tag === "input" || tag === "textarea" || tag === "select")) { el.__p[name] = v == null ? "" : v; continue; }
      if (v === false || v == null) continue;
      el.setAttribute(a.name, v === true ? "" : String(v));
    }
    node.childNodes.forEach((c) => build(c, scope, el));
    applyProps(el);
    out.appendChild(el);
  }
  function applyProps(el) {
    if (!el.__p) return;
    if ("value" in el.__p && el.value !== String(el.__p.value)) el.value = el.__p.value;
    if ("checked" in el.__p) el.checked = !!el.__p.checked;
  }

  /* Patch the live DOM to match the freshly built one, keeping focus, caret and scroll */
  function morph(from, to) {
    if (from.nodeType !== to.nodeType || from.nodeName !== to.nodeName) { from.replaceWith(to); return; }
    if (from.nodeType === 3) { if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue; return; }
    if (from.nodeType !== 1) return;
    const fa = from.attributes, ta = to.attributes;
    for (let i = fa.length - 1; i >= 0; i--) { const n = fa[i].name; if (!to.hasAttribute(n)) from.removeAttribute(n); }
    for (let i = 0; i < ta.length; i++) { const a = ta[i]; if (from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value); }
    from.__h = to.__h; from.__p = to.__p;
    const fc = Array.from(from.childNodes), tc = Array.from(to.childNodes);
    for (let i = 0; i < tc.length; i++) { if (i < fc.length) morph(fc[i], tc[i]); else from.appendChild(tc[i]); }
    for (let i = tc.length; i < fc.length; i++) fc[i].remove();
    if (from.tagName === "SELECT" || from.tagName === "INPUT" || from.tagName === "TEXTAREA") {
      if (document.activeElement === from && from.tagName !== "SELECT" && "value" in (from.__p || {})) return;   // don't fight the user's typing
      applyProps(from);
    }
  }

  /* Mount: template string + Component class → live page inside host */
  function mount(host, templateHtml, Component, props) {
    const tdoc = new DOMParser().parseFromString("<body>" + preprocess(templateHtml) + "</body>", "text/html");
    const tpl = Array.from(tdoc.body.childNodes);
    const comp = new Component(props || {});
    let queued = false;
    const render = () => {
      queued = false;
      const vals = comp.renderVals();
      const frag = document.createElement("div");
      tpl.forEach((n) => build(n, vals, frag));
      if (!host.firstChild) { while (frag.firstChild) host.appendChild(frag.firstChild); return; }
      morph(host, (() => { const h = host.cloneNode(false); while (frag.firstChild) h.appendChild(frag.firstChild); return h; })());
    };
    comp.__render = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
    /* One delegated listener per event type; onChange also fires while typing (like React) */
    const fire = (type) => (e) => {
      let t = e.target;
      const isText = t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && !/^(file|checkbox|radio)$/.test(t.type)));
      let key = type;
      if (type === "input") { if (!isText) return; key = "change"; }
      if (type === "change" && isText) return;
      while (t && t !== host.parentNode) { if (t.__h && t.__h[key]) { t.__h[key](e); return; } t = t.parentNode; }
    };
    ["click", "change", "input", "dragover", "dragleave", "drop"].forEach((ev) => host.addEventListener(ev, fire(ev)));
    render();
    if (comp.componentDidMount) comp.componentDidMount();
    return comp;
  }

  window.DCLogic = DCLogic;
  window.DCLite = { mount };
})();

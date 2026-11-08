/* DSA Atlas — core: namespace, DOM helpers, icons, Python highlighter,
   progress store, lesson authoring helpers, code blocks, editor, figures. */
(function () {
  'use strict';
  const DSA = (window.DSA = window.DSA || {});
  DSA.lessons = {};
  DSA.lessonOrder = [];
  DSA.widgets = DSA.widgets || {};
  DSA.scenes3d = DSA.scenes3d || {};
  DSA.problems = DSA.problems || {};
  DSA.plans = DSA.plans || {};

  /* ------------------------------------------------------------------ DOM */
  function append(el, kids) {
    for (const c of kids.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  function setAttrs(el, attrs) {
    if (!attrs) return;
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  DSA.h = function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    setAttrs(el, attrs);
    return append(el, kids);
  };
  DSA.svg = function svg(tag, attrs, ...kids) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    setAttrs(el, attrs);
    return append(el, kids);
  };
  DSA.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  DSA.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  DSA.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  DSA.cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  DSA.parseList = function (str) {
    return String(str).split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)
      .map((s) => (/^-?\d+(\.\d+)?$/.test(s) ? Number(s) : s));
  };
  DSA.parseNums = (str, fallback) => {
    const xs = DSA.parseList(str).filter((x) => typeof x === 'number');
    return xs.length ? xs : fallback;
  };

  /* --------------------------------------------------------- mount registry */
  DSA.mounts = [];
  DSA.mount = (fn) => { if (typeof fn === 'function') DSA.mounts.push(fn); };
  DSA.unmountAll = () => {
    const fns = DSA.mounts.splice(0);
    for (const fn of fns) { try { fn(); } catch (e) { console.warn(e); } }
  };
  /* Initialise heavy widgets only when they scroll near the viewport. */
  /* ?test in the URL: initialise everything eagerly and drive 3D frames by timer (automated checks). */
  DSA.testMode = /[?&]test\b/.test(location.search);
  DSA.lazy = function (el, init) {
    if (DSA.testMode || !('IntersectionObserver' in window)) { setTimeout(init, 0); return; }
    let done = false;
    const io = new IntersectionObserver((ents) => {
      if (!done && ents.some((e) => e.isIntersecting)) { done = true; io.disconnect(); init(); }
    }, { rootMargin: '300px 0px' });
    io.observe(el);
    DSA.mount(() => io.disconnect());
  };

  DSA.toast = function (msg, ms = 1800) {
    const t = DSA.h('div', { class: 'toast', role: 'status' }, msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };
  DSA.copy = async function (text) {
    try { await navigator.clipboard.writeText(text); DSA.toast('Copied to clipboard'); }
    catch (e) {
      const ta = DSA.h('textarea', { style: { position: 'fixed', opacity: 0 } }); ta.value = text;
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); DSA.toast('Copied to clipboard'); } catch (e2) { DSA.toast('Select the code and copy it manually'); }
      ta.remove();
    }
  };

  /* ---------------------------------------------------------------- icons */
  const P = {
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
    pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="currentColor"/>',
    next: '<path d="M5 5v14l10-7z" fill="currentColor"/><path d="M18 5v14"/>',
    prev: '<path d="M19 5v14L9 12z" fill="currentColor"/><path d="M6 5v14"/>',
    first: '<path d="M18 5v14l-9-7z" fill="currentColor"/><path d="M6 5v14"/>',
    last: '<path d="M6 5v14l9-7z" fill="currentColor"/><path d="M18 5v14"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    run: '<path d="m8 5 11 7-11 7z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    shuffle: '<path d="M3 7h3c4 0 6 10 10 10h5"/><path d="m18 14 3 3-3 3"/><path d="M3 17h3c1.5 0 2.7-1.4 3.8-3M14 7h7m-3-3 3 3-3 3"/>',
    roadmap: '<path d="M4 21V4"/><path d="M4 4h12l-2 4 2 4H4"/>',
    interview: '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    bigo: '<path d="M3 21V3M3 21h18"/><path d="M5 19c6 0 10-4 14-14"/>',
    python: '<path d="M8 4c-2 0-3 1-3 3v2c0 1.5-1 3-2 3 1 0 2 1.5 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.5 1 3 2 3-1 0-2 1.5-2 3v2c0 2-1 3-3 3"/>',
    recursion: '<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="10.5" y="10.5" width="3" height="3" rx=".5"/>',
    arrays: '<rect x="2" y="8" width="6.2" height="8" rx="1"/><rect x="8.9" y="8" width="6.2" height="8" rx="1"/><rect x="15.8" y="8" width="6.2" height="8" rx="1"/>',
    hashing: '<path d="M9 3 7 21M17 3l-2 18M4 8h17M3 16h17"/>',
    linkedlist: '<circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/><path d="M8 12h8m-3-3 3 3-3 3"/>',
    stackqueue: '<rect x="4" y="4" width="16" height="4" rx="1"/><rect x="4" y="10" width="16" height="4" rx="1"/><rect x="4" y="16" width="16" height="4" rx="1"/>',
    trees: '<circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M10.6 7.2 7.3 15.8M13.4 7.2l3.3 8.6"/>',
    heaps: '<path d="M12 3 21 20H3z"/><path d="M7.6 12h8.8"/>',
    graphs: '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="5" r="2.2"/><circle cx="12" cy="13" r="2.2"/><circle cx="6" cy="19" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M6.6 7.7l3.9 3.6M17.4 6.6l-3.9 4.7M10.5 14.6l-2.9 2.8M14 14.3l3.4 2.6"/>',
    tries: '<circle cx="12" cy="4" r="1.8"/><path d="M12 6v3M12 9 6 15M12 9l6 6M6 15v4M18 15v4M12 9v6"/>',
    'two-pointers': '<path d="M3 12h7m-3-3 3 3-3 3M21 12h-7m3-3-3 3 3 3"/>',
    'sliding-window': '<rect x="2" y="9" width="20" height="6" rx="1"/><path d="M8 6h8v12H8z"/>',
    'prefix-sum': '<path d="M18 5H6l6 7-6 7h12"/>',
    'binary-search': '<circle cx="10" cy="10" r="6"/><path d="m21 21-6.5-6.5M10 6v8"/>',
    'monotonic-stack': '<path d="M5 20v-4M10 20v-8M15 20V8M20 20V4"/>',
    intervals: '<path d="M3 8h10M9 12h12M5 16h8"/>',
    backtracking: '<circle cx="12" cy="4" r="2"/><path d="M12 6 6 13M12 6l6 7"/><circle cx="6" cy="15" r="2"/><path d="m16 15 4 4m0-4-4 4"/>',
    dp: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    greedy: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    bits: '<path d="M5 6v12M3 8l2-2"/><rect x="11" y="6" width="7" height="12" rx="3.5"/>',
    sorting: '<path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"/>',
    cheatsheet: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>',
    playground: '<path d="m10 8 5 4-5 4z"/><path d="M5 4H3v16h2M19 4h2v16h-2"/>',
    lc75: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    top150: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  };
  DSA.icon = function (name, cls) {
    return `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.arrays}</svg>`;
  };
  DSA.logo = '<svg class="sb-logo" viewBox="0 0 40 40" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="11" fill="var(--ink)"/><path d="M20 12 12 26M20 12l8 14" stroke="var(--on-ink)" stroke-width="2.4" stroke-linecap="round"/><circle cx="20" cy="11" r="4.2" fill="var(--on-ink)"/><circle cx="12" cy="27.5" r="4.2" fill="var(--on-ink)"/><circle cx="28" cy="27.5" r="4.2" fill="var(--accent)"/></svg>';

  /* ------------------------------------------------------ Python highlighter */
  const KW = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(' '));
  const BI = new Set('abs all any bin bool chr dict divmod enumerate filter float format frozenset getattr hasattr hash hex id input int isinstance iter len list map max min next object oct ord pow print range repr reversed round set setattr slice sorted str sum super tuple type zip deque defaultdict Counter OrderedDict heapq bisect heappush heappop heapify heappushpop heapreplace nlargest nsmallest bisect_left bisect_right insort lru_cache cache math inf functools itertools collections List Optional Dict Tuple Set'.split(' '));
  const TOKRE = /(#[^\n]*)|((?:[rRbBuUfF]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?))|(\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?j?)\b)|(@[A-Za-z_][\w.]*)|([A-Za-z_]\w*)|(\n)|([^\S\n]+)|([^\w\s#'"@]+|.)/g;
  function tokens(code) {
    const out = [];
    let m, prevKw = null;
    TOKRE.lastIndex = 0;
    while ((m = TOKRE.exec(code))) {
      if (m[0] === '') { TOKRE.lastIndex++; continue; }
      let cls = null;
      if (m[1]) cls = 'c';
      else if (m[2]) cls = 's';
      else if (m[3]) cls = 'n';
      else if (m[4]) cls = 'd';
      else if (m[5]) {
        const w = m[5];
        if (prevKw === 'def') cls = 'f';
        else if (prevKw === 'class') cls = 't';
        else if (KW.has(w)) cls = 'k';
        else if (w === 'self' || w === 'cls') cls = 'self';
        else if (BI.has(w)) cls = 'b';
        prevKw = KW.has(w) ? w : null;
      }
      if (!m[5] && !m[7]) prevKw = null; /* whitespace keeps "def"/"class" context */
      out.push([cls, m[0]]);
    }
    return out;
  }
  /* Returns an array of HTML strings, one per source line (spans never cross lines). */
  DSA.highlightLines = function (code) {
    const lines = [''];
    for (const [cls, text] of tokens(code)) {
      const parts = text.split('\n');
      parts.forEach((part, i) => {
        if (i > 0) lines.push('');
        if (part) lines[lines.length - 1] += cls ? `<span class="tk-${cls}">${DSA.esc(part)}</span>` : DSA.esc(part);
      });
    }
    return lines;
  };
  DSA.highlightPy = (code) => DSA.highlightLines(code).join('\n');

  /* ---------------------------------------------------------------- store */
  const KEY = 'dsa-atlas-v1';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }
  const listeners = new Set();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage off: progress lives for this tab only */ } }
  function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function emit() { listeners.forEach((fn) => { try { fn(); } catch (e) { console.warn(e); } }); }
  DSA.store = {
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    touch() {
      state.days = state.days || [];
      const t = today();
      if (state.days[state.days.length - 1] !== t) { state.days.push(t); if (state.days.length > 400) state.days.shift(); save(); }
    },
    problem(id) { return (state.p || {})[id] || null; },
    setProblem(id, s) {
      state.p = state.p || {};
      if (s) state.p[id] = s; else delete state.p[id];
      this.touch(); save(); emit();
    },
    lessonDone(id) { return !!(state.l || {})[id]; },
    setLessonDone(id, v) {
      state.l = state.l || {};
      if (v) state.l[id] = 1; else delete state.l[id];
      this.touch(); save(); emit();
    },
    note(id) { return (state.n || {})[id] || ''; },
    setNote(id, t) { state.n = state.n || {}; if (t) state.n[id] = t; else delete state.n[id]; save(); },
    pref(k, d) { const v = (state.pref || {})[k]; return v === undefined ? d : v; },
    setPref(k, v) { state.pref = state.pref || {}; state.pref[k] = v; save(); emit(); },
    lastVisit() { return state.last || null; },
    setLastVisit(hash) { state.last = hash; save(); },
    streak() {
      const days = new Set(state.days || []);
      let n = 0; const d = new Date();
      if (!days.has(today())) d.setDate(d.getDate() - 1);
      for (;;) {
        const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (!days.has(k)) break;
        n++; d.setDate(d.getDate() - 1);
      }
      return n;
    },
    counts(ids) {
      let solved = 0, review = 0;
      for (const id of ids) { const s = this.problem(id); if (s === 'solved') solved++; else if (s === 'review') review++; }
      return { solved, review, total: ids.length };
    },
  };

  /* ------------------------------------------------- lesson authoring helpers */
  function dedent(s) {
    s = String(s).replace(/^\s*\n/, '').replace(/\s+$/, '');
    const lines = s.split('\n');
    let min = Infinity;
    for (const ln of lines) { if (ln.trim()) min = Math.min(min, ln.match(/^ */)[0].length); }
    if (!isFinite(min)) min = 0;
    return lines.map((ln) => ln.slice(min)).join('\n');
  }
  DSA.dedent = dedent;
  DSA.L = {
    h: (text, id) => ({ t: 'h', text, id }),
    sub: (text) => ({ t: 'sub', text }),
    p: (html) => ({ t: 'p', html }),
    html: (html) => ({ t: 'html', html }),
    callout: (kind, html, title) => ({ t: 'callout', kind, html, title }),
    analogy: (html, title) => ({ t: 'callout', kind: 'analogy', html, title }),
    tip: (html, title) => ({ t: 'callout', kind: 'tip', html, title }),
    warn: (html, title) => ({ t: 'callout', kind: 'warn', html, title }),
    interview: (html, title) => ({ t: 'callout', kind: 'interview', html, title }),
    key: (html, title) => ({ t: 'callout', kind: 'key', html, title }),
    note: (html, title) => ({ t: 'callout', kind: 'note', html, title }),
    code: (code, o) => Object.assign({ t: 'code', code: dedent(code) }, o || {}),
    template: (title, code, o) => Object.assign({ t: 'code', code: dedent(code), title, template: true }, o || {}),
    table: (head, rows, o) => Object.assign({ t: 'table', head, rows }, o || {}),
    viz3d: (scene, o) => Object.assign({ t: 'viz3d', scene }, o || {}),
    widget: (name, o) => Object.assign({ t: 'widget', name }, o || {}),
    quiz: (qs) => ({ t: 'quiz', qs }),
    problems: (ids, title) => ({ t: 'problems', ids, title }),
    list: (items) => ({ t: 'list', items }),
    steps: (items) => ({ t: 'steps', items }),
    grid: (items) => ({ t: 'grid', items }),
  };
  DSA.addLesson = function (lesson) {
    if (!lesson || !lesson.id) return;
    if (!DSA.lessons[lesson.id]) DSA.lessonOrder.push(lesson.id);
    DSA.lessons[lesson.id] = lesson;
  };

  /* Complexity badge colour: green = constant/log, blue = linear-ish, amber = n log n, red = polynomial+ */
  DSA.cxClass = function (cx) {
    const s = String(cx).replace(/\s/g, '');
    if (/^O\((1|logn|log\w+|α\(n\))\)$/i.test(s)) return 'g';
    if (/n\^?[2-9]|n²|n³|2\^|2ⁿ|n!|\^n|\*\*n/i.test(s)) return 'r';
    if (/log/i.test(s)) return 'y';
    return 'b';
  };
  DSA.cx = (cx) => `<span class="cx ${DSA.cxClass(cx)}">${DSA.esc(cx)}</span>`;

  /* ---------------------------------------------------------------- editor */
  DSA.editor = function (code, opts) {
    opts = opts || {};
    const h = DSA.h;
    const gut = h('div', { class: 'gut' });
    const pre = h('pre');
    const ta = h('textarea', { spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', 'aria-label': opts.label || 'Python code editor' });
    const inner = h('div', { class: 'ed-inner' }, gut, pre, ta);
    const root = h('div', { class: 'editor' }, inner);
    function render() {
      const v = ta.value;
      pre.innerHTML = DSA.highlightPy(v) + '\n ';
      const n = v.split('\n').length;
      let g = '';
      for (let i = 1; i <= n; i++) g += i + '\n';
      gut.textContent = g;
      if (opts.onChange) opts.onChange(v);
    }
    function insert(text) {
      ta.focus();
      if (!document.execCommand || !document.execCommand('insertText', false, text)) {
        ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
      }
      render();
    }
    ta.addEventListener('input', render);
    ta.addEventListener('keydown', (e) => {
      const v = ta.value, s = ta.selectionStart, en = ta.selectionEnd;
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (opts.onRun) opts.onRun(); return; }
      if (e.key === 'Tab') {
        e.preventDefault();
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        if (s === en && !e.shiftKey) { insert('    '); return; }
        const le = en;
        const block = v.slice(ls, le);
        const changed = e.shiftKey ? block.replace(/^ {1,4}/gm, '') : block.replace(/^/gm, '    ');
        ta.setSelectionRange(ls, le);
        insert(changed);
        ta.setSelectionRange(ls, ls + changed.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        const line = v.slice(ls, s);
        let ind = line.match(/^ */)[0];
        if (/:\s*(#.*)?$/.test(line)) ind += '    ';
        insert('\n' + ind);
        return;
      }
      if (e.key === 'Backspace' && s === en && s > 0) {
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        const before = v.slice(ls, s);
        if (before.length >= 4 && /^ +$/.test(before) && before.length % 4 === 0) {
          e.preventDefault(); ta.setSelectionRange(s - 4, s); insert('');
        }
      }
    });
    ta.value = code || '';
    render();
    return { el: root, get: () => ta.value, set: (c) => { ta.value = c; render(); }, focus: () => ta.focus(), textarea: ta };
  };

  /* ------------------------------------------------------------ code block */
  function btn(label, icon, onClick, cls) {
    return DSA.h('button', { class: 'btn sm ' + (cls || ''), type: 'button', onclick: onClick, html: (icon ? DSA.icon(icon) : '') + '<span>' + DSA.esc(label) + '</span>' });
  }
  DSA.btn = btn;
  DSA.renderCode = function (code) {
    return DSA.highlightLines(code).map((ln, i) => `<span class="cb-line" data-n="${i + 1}">${ln || ' '}</span>`).join('');
  };
  /* Shows run results in a small output panel under a code block. */
  DSA.renderRunOutput = function (out, res) {
    out.hidden = false;
    out.innerHTML = '';
    const h = DSA.h;
    if (res.loading) { out.append(h('div', { class: 'o-info' }, res.loading)); return; }
    if (res.stdout) out.append(h('div', { class: 'o-label' }, 'printed'), h('pre', null, res.stdout.replace(/\n$/, '')));
    if (res.ok) {
      if (res.value != null) out.append(h('div', { class: 'o-label' }, 'returned'), h('pre', null, res.value));
      if (res.match === true) out.append(h('div', { class: 'o-ok' }, '✓ Matches the expected output ' + (res.expect || '') + '  (' + res.ms + ' ms)'));
      else if (res.match === false) out.append(h('div', { class: 'o-bad' }, '✗ Expected ' + res.expect));
      else if (res.value == null && !res.stdout) out.append(h('div', { class: 'o-info' }, 'Ran without errors (' + res.ms + ' ms).'));
    } else {
      out.append(h('div', { class: 'o-label' }, 'error'), h('pre', { class: 'o-bad' }, res.error || 'Something went wrong.'));
    }
  };
  DSA.codeBlock = function (code, o) {
    o = o || {};
    const h = DSA.h;
    let current = code;
    let ed = null;
    const root = h('div', { class: 'codeblock' + (o.template ? ' template' : '') });
    const actions = h('div', { class: 'cb-actions' });
    const head = h('div', { class: 'cb-head' }, h('div', { class: 'cb-title' }, o.title || (o.template ? 'template.py' : 'example.py')), actions);
    const body = h('div', { class: 'cb-body' }, h('pre', { html: DSA.renderCode(code) }));
    const out = h('div', { class: 'cb-out', hidden: true });
    root.append(head, body);
    const getCode = () => (ed ? ed.get() : current);
    actions.append(btn('Copy', 'copy', () => DSA.copy(getCode()), 'ghost'));
    if (o.run != null) {
      const editBtn = btn('Edit', 'edit', () => {
        if (ed) {
          current = ed.get(); ed = null;
          body.innerHTML = ''; body.append(h('pre', { html: DSA.renderCode(current) }));
          editBtn.querySelector('span').textContent = 'Edit';
        } else {
          ed = DSA.editor(current, { onRun: runIt });
          body.innerHTML = ''; body.append(ed.el);
          editBtn.querySelector('span').textContent = 'Done editing';
          ed.focus();
        }
      }, 'ghost');
      const runIt = async () => {
        if (!DSA.py) return;
        DSA.renderRunOutput(out, { loading: DSA.py.ready ? 'Running…' : 'Loading Python in your browser (first run downloads about 10 MB)…' });
        const res = await DSA.py.run(getCode(), o.run, o.expect);
        DSA.renderRunOutput(out, res);
      };
      actions.append(editBtn,
        btn('Run', 'run', runIt),
        btn('Visualize', 'eye', () => DSA.py && DSA.py.openDebugger({ code: getCode(), driver: o.run, expect: o.expect, title: o.title || 'Step-through' }), 'primary'));
      if (o.run) {
        root.append(h('div', { class: 'cb-foot' },
          h('span', null, 'example call'), h('code', null, o.run.split('\n').pop()),
          o.expect != null ? [h('span', null, '→ expected'), h('code', null, o.expect)] : null));
      }
    }
    root.append(out);
    return root;
  };

  /* ---------------------------------------------------------------- figure */
  DSA.figure = function (o) {
    const h = DSA.h;
    const root = h('figure', { class: 'figure wide' });
    const head = h('div', { class: 'fig-head' },
      h('span', { class: 'fig-kicker' }, o.kicker || 'Figure'),
      h('span', { class: 'fig-title' }, o.title || ''),
      o.hint ? h('span', { class: 'fig-hint' }, o.hint) : null);
    const stage = o.flat ? h('div', { class: 'w-stage' }) : h('div', { class: 'fig-stage', style: { height: (o.height || 420) + 'px' } });
    const stats = h('div', { class: 'fig-stats' });
    if (!o.flat) stage.append(stats);
    const inputs = o.inputs ? h('div', { class: 'w-inputs' }) : null;
    const narr = h('div', { class: 'fig-narr', 'aria-live': 'polite' });
    const tools = h('div', { class: 'fig-tools' });
    const cap = o.caption ? h('figcaption', { class: 'fig-cap', html: o.caption }) : null;
    root.append(head);
    if (inputs) root.append(inputs);
    if (o.flat) root.append(h('div', { style: { height: '12px' } }));
    root.append(stage, narr, tools);
    if (cap) root.append(cap);
    const statEls = {};
    return {
      root, stage, stats, narr, tools, cap, inputs,
      say(html, cx) { narr.innerHTML = '<span>' + html + '</span>' + (cx ? `<span class="cxb">${DSA.cx(cx)}</span>` : ''); },
      stat(key, label, val) {
        if (!statEls[key]) { statEls[key] = h('div', { class: 'fig-stat' }); stats.append(statEls[key]); }
        statEls[key].innerHTML = DSA.esc(label) + ' <b>' + DSA.esc(val) + '</b>';
      },
      clearStats() { stats.innerHTML = ''; for (const k in statEls) delete statEls[k]; },
      group(...kids) { const g = h('div', { class: 'grp' }, ...kids); tools.append(g); return g; },
      legend(items) {
        const lg = h('div', { class: 'fig-legend' });
        for (const [color, label] of items) lg.append(h('span', null, h('i', { style: { background: color } }), label));
        stage.append(lg);
        return lg;
      },
    };
  };
})();

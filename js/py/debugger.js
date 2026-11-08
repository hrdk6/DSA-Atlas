/* The step-through visualizer ("Python Tutor" style). Runs code under the
   tracer, then replays every recorded step: highlighted line, call stack,
   variables drawn as data structures, linked lists and trees as diagrams. */
(function () {
  'use strict';
  const DSA = window.DSA;
  const h = DSA.h, S = DSA.svg, E = DSA.esc;
  const IDX = new Set(['i', 'j', 'k', 'l', 'r', 'lo', 'hi', 'low', 'high', 'left', 'right', 'mid', 'start', 'end', 'slow', 'fast', 'p', 'p1', 'p2', 'ptr', 'idx', 'index', 'write', 'read', 'w', 'wr', 'rd', 'top', 'bottom', 'pos', 'begin', 'L', 'R', 'insert_pos', 'last']);
  const WINDOWS = [['l', 'r'], ['left', 'right'], ['lo', 'hi'], ['low', 'high'], ['start', 'end'], ['L', 'R']];
  const CELLS2D = [['i', 'j'], ['r', 'c'], ['row', 'col'], ['nr', 'nc'], ['x', 'y']];
  const isInt = (e) => e && e[0] === 'n' && /^-?\d+$/.test(e[1]);
  const intOf = (e) => (isInt(e) ? parseInt(e[1], 10) : null);
  const isPrim = (e) => e && (e[0] === 'n' || e[0] === 's' || e[0] === 'o');
  const isSeq = (e) => e && (e[0] === 'l' || e[0] === 't' || e[0] === 'q');

  function fmt(e, heap, depth) {
    depth = depth || 0;
    if (!e) return '?';
    switch (e[0]) {
      case 'n': case 'o': return e[1];
      case 's': return "'" + e[1] + "'";
      case 'r': {
        const o = heap && heap[e[1]];
        if (!o) return '→ object';
        if (o[0] === 'L') return 'ListNode(' + fmt(o[1], heap, 3) + ')';
        if (o[0] === 'T') return 'TreeNode(' + fmt(o[1], heap, 3) + ')';
        return o[1] + ' object';
      }
      case 'l': case 't': case 'q': case 'S': {
        if (depth > 1) return e[0] === 't' ? '(…)' : '[…]';
        const items = e[2].slice(0, 10).map((x) => fmt(x, heap, depth + 1));
        if (e[2].length > 10 || e[3]) items.push('…');
        const inner = items.join(', ');
        return e[0] === 't' ? '(' + inner + (e[2].length === 1 ? ',' : '') + ')' : e[0] === 'S' ? (e[2].length ? '{' + inner + '}' : 'set()') : e[0] === 'q' ? 'deque([' + inner + '])' : '[' + inner + ']';
      }
      case 'd': {
        if (depth > 1) return '{…}';
        const items = e[2].slice(0, 8).map(([k, v]) => fmt(k, heap, depth + 1) + ': ' + fmt(v, heap, depth + 1));
        if (e[3] > 8) items.push('…');
        return '{' + items.join(', ') + '}';
      }
      default: return String(e[1] || '');
    }
  }
  const sameEnc = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /* ---------------------------------------------------- linked list layout */
  function planLinkedLists(steps) {
    const pos = new Map();
    const rowNext = [];
    for (const st of steps) {
      const heap = st.h || {};
      const ids = Object.keys(heap).filter((id) => heap[id][0] === 'L');
      if (!ids.length) continue;
      const nextOf = (id) => { const nx = heap[id][2]; return nx && nx[0] === 'r' && heap[nx[1]] && heap[nx[1]][0] === 'L' ? String(nx[1]) : null; };
      const incoming = new Set();
      for (const id of ids) { const n = nextOf(id); if (n) incoming.add(n); }
      const seen = new Set();
      const walk = (start) => {
        let pred = null, c = start;
        while (c && !seen.has(c)) {
          seen.add(c);
          if (!pos.has(c)) {
            if (pred && pos.has(pred)) {
              const pp = pos.get(pred);
              const col = Math.max(pp.col + 1, rowNext[pp.row]);
              pos.set(c, { row: pp.row, col });
              rowNext[pp.row] = col + 1;
            } else {
              const row = rowNext.length;
              pos.set(c, { row, col: 0 });
              rowNext.push(1);
            }
          }
          pred = c; c = nextOf(c);
        }
      };
      ids.filter((id) => !incoming.has(id)).forEach(walk);
      ids.forEach(walk);
    }
    return pos;
  }

  function refsByNode(frames, activeIdx) {
    const m = new Map();
    frames.forEach((fr, fi) => {
      for (const [name, e] of fr.v) {
        if (e[0] !== 'r') continue;
        const k = String(e[1]);
        if (!m.has(k)) m.set(k, []);
        m.get(k).push({ name, hot: fi === activeIdx, depth: fi });
      }
    });
    return m;
  }

  function drawLinkedList(st, prev, pos, frames) {
    const heap = st.h;
    const ids = Object.keys(heap).filter((id) => heap[id][0] === 'L' && pos.has(id));
    if (!ids.length) return null;
    if (ids.length > 48) return h('div', { class: 'dbg-empty' }, `${ids.length} list nodes: too many to draw. The variables above still show their values.`);
    const refs = refsByNode(frames, frames.length - 1);
    let maxRow = 0, maxCol = 0;
    for (const id of ids) { const p = pos.get(id); maxRow = Math.max(maxRow, p.row); maxCol = Math.max(maxCol, p.col); }
    const usedRows = [...new Set(ids.map((id) => pos.get(id).row))].sort((a, b) => a - b);
    const rowY = new Map(usedRows.map((r, i) => [r, 28 + i * 96]));
    const X = (id) => 14 + pos.get(id).col * 96;
    const Y = (id) => rowY.get(pos.get(id).row);
    const W = 14 + (maxCol + 1) * 96 + 40, H = 28 + usedRows.length * 96 + 10;
    const svg = S('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    const mk = 'm' + Math.random().toString(36).slice(2, 8);
    svg.append(S('defs', null,
      S('marker', { id: mk + 'a', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, S('path', { d: 'M0 0 L10 5 L0 10 z', style: 'fill: var(--fg-2)' })),
      S('marker', { id: mk + 'b', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' }, S('path', { d: 'M0 0 L10 5 L0 10 z', style: 'fill: var(--accent)' })),
      S('marker', { id: mk + 'c', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' }, S('path', { d: 'M0 0 L10 5 L0 10 z', style: 'fill: var(--violet)' }))));
    const prevHeap = prev ? prev.h : {};
    for (const id of ids) {
      const o = heap[id], x = X(id), y = Y(id);
      const nx = o[2];
      if (nx && nx[0] === 'r' && heap[nx[1]] && pos.has(String(nx[1]))) {
        const t = String(nx[1]), tx = X(t), ty = Y(t);
        const changed = prevHeap[id] && !sameEnc(prevHeap[id][2], nx);
        const sx = x + 52, sy = y + 17;
        let d;
        if (ty === y && tx > x && tx - x <= 100) d = `M${sx} ${sy} L${tx - 3} ${ty + 17}`;
        else if (ty === y) {
          const lift = tx > x ? -34 : 52;
          d = `M${sx} ${sy} C${sx + 20} ${sy + lift} ${tx + 10} ${ty + 17 + lift} ${tx + (tx > x ? -3 : 14)} ${ty + (tx > x ? 17 : 36)}`;
        } else d = `M${sx} ${sy} C${sx + 36} ${sy} ${tx - 36} ${ty + 17} ${tx - 3} ${ty + 17}`;
        svg.append(S('path', { class: 'glink' + (changed ? ' chg' : ''), d, 'marker-end': `url(#${mk}${changed ? 'b' : 'a'})` }));
      }
      if (o[3] && o[3][0] === 'r' && pos.has(String(o[3][1]))) {
        const t = String(o[3][1]), tx = X(t), ty = Y(t);
        svg.append(S('path', { class: 'glink', style: 'stroke: var(--violet); stroke-dasharray: 4 3', d: `M${x + 20} ${y + 34} C${x + 20} ${y + 70} ${tx + 20} ${ty + 70} ${tx + 22} ${ty + 36}`, 'marker-end': `url(#${mk}c)` }));
      }
    }
    for (const id of ids) {
      const o = heap[id], x = X(id), y = Y(id);
      const r = refs.get(id) || [];
      const hot = r.some((q) => q.hot), warm = !hot && r.length > 0;
      const isNew = !prevHeap[id];
      const g = S('g', { class: 'gnode' + (hot ? ' hot' : warm ? ' warm' : isNew && prev ? ' new' : '') });
      g.append(S('rect', { x, y, width: 62, height: 34, rx: 8 }), S('line', { x1: x + 42, y1: y + 3, x2: x + 42, y2: y + 31, style: 'stroke: var(--line-2)' }),
        S('text', { x: x + 21, y: y + 17 }, fmt(o[1], heap, 3).slice(0, 5)));
      const nx = o[2];
      if (nx && nx[0] === 'r') g.append(S('circle', { cx: x + 52, cy: y + 17, r: 3, style: 'fill: var(--fg-2); stroke: none' }));
      else g.append(S('text', { x: x + 52, y: y + 17, style: 'fill: var(--muted); font-size: 11px' }, '∅'));
      svg.append(g);
      r.slice(0, 4).forEach((q, k) => svg.append(S('text', { class: 'gvar ' + (q.hot ? 'hot' : 'cold'), x: x + 31, y: y + 50 + k * 12 }, q.name)));
    }
    return h('div', { class: 'd-svg' }, svg);
  }

  function drawTrees(st, frames) {
    const heap = st.h;
    const ids = Object.keys(heap).filter((id) => heap[id][0] === 'T');
    if (!ids.length) return null;
    if (ids.length > 63) return h('div', { class: 'dbg-empty' }, `${ids.length} tree nodes: too many to draw.`);
    const kid = (e) => (e && e[0] === 'r' && heap[e[1]] && heap[e[1]][0] === 'T' ? String(e[1]) : null);
    const isChild = new Set();
    for (const id of ids) { const l = kid(heap[id][2]), r = kid(heap[id][3]); if (l) isChild.add(l); if (r) isChild.add(r); }
    const roots = ids.filter((id) => !isChild.has(id));
    const P = new Map();
    let xi = 0, maxD = 0;
    const seen = new Set();
    const place = (id, d) => {
      if (!id || seen.has(id)) return;
      seen.add(id);
      place(kid(heap[id][2]), d + 1);
      P.set(id, { x: xi++, d });
      maxD = Math.max(maxD, d);
      place(kid(heap[id][3]), d + 1);
    };
    roots.forEach((r) => { place(r, 0); xi += 1; });
    ids.forEach((id) => { if (!seen.has(id)) { place(id, 0); xi += 1; } });
    const refs = refsByNode(frames, frames.length - 1);
    const XS = 44, YS = 60;
    const W = Math.max(200, xi * XS + 30), H = (maxD + 1) * YS + 34;
    const svg = S('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    const cx = (id) => 22 + P.get(id).x * XS, cy = (id) => 24 + P.get(id).d * YS;
    for (const id of ids) {
      if (!P.has(id)) continue;
      for (const c of [kid(heap[id][2]), kid(heap[id][3])]) if (c && P.has(c)) svg.append(S('line', { class: 'glink', x1: cx(id), y1: cy(id), x2: cx(c), y2: cy(c) }));
      const nx = heap[id][4];
      if (nx && nx[0] === 'r' && P.has(String(nx[1]))) svg.append(S('path', { class: 'glink', style: 'stroke: var(--violet); stroke-dasharray: 4 3', d: `M${cx(id) + 16} ${cy(id)} L${cx(String(nx[1])) - 18} ${cy(String(nx[1]))}` }));
    }
    for (const id of ids) {
      if (!P.has(id)) continue;
      const r = refs.get(id) || [];
      const hot = r.some((q) => q.hot), warm = !hot && r.length > 0;
      const g = S('g', { class: 'gnode' + (hot ? ' hot' : warm ? ' warm' : '') });
      g.append(S('circle', { cx: cx(id), cy: cy(id), r: 16 }), S('text', { x: cx(id), y: cy(id) }, fmt(heap[id][1], heap, 3).slice(0, 4)));
      svg.append(g);
      const names = r.filter((q) => q.hot).map((q) => q.name).concat(r.some((q) => !q.hot) && !hot ? ['(caller)'] : []);
      names.slice(0, 2).forEach((nm, k) => svg.append(S('text', { class: 'gvar ' + (nm === '(caller)' ? 'warm' : 'hot'), x: cx(id), y: cy(id) + 28 + k * 11 }, nm)));
    }
    return h('div', { class: 'd-svg' }, svg);
  }

  /* ------------------------------------------------------ variable views */
  function arrayView(name, e, heap, ptrs, win, prevE, kindLabel) {
    const items = e[0] === 's' ? e[1].split('').map((ch) => ['s', ch]) : e[2];
    const prevItems = prevE ? (prevE[0] === 's' ? prevE[1].split('').map((ch) => ['s', ch]) : prevE[2]) : null;
    const row = h('div', { class: 'd-arr' });
    const n = items.length;
    const extra = ptrs.some((p) => p.v === n) ? 1 : 0;
    for (let i = 0; i < n + extra; i++) {
      const col = h('div', { class: 'd-col' });
      if (i < n) {
        let cls = 'd-cell';
        if (prevItems && (!prevItems[i] || !sameEnc(prevItems[i], items[i]))) cls += ' chg';
        else if (win && i >= win[0] && i <= win[1]) cls += ' win';
        if (ptrs.some((p) => p.v === i)) cls += ' at';
        if (items[i][0] === 'r') cls += ' ref';
        const txt = items[i][0] === 's' && e[0] === 's' ? items[i][1] : fmt(items[i], heap, 2);
        col.append(h('div', { class: cls, title: txt }, txt.length > 10 ? txt.slice(0, 9) + '…' : txt));
      } else col.append(h('div', { class: 'd-cell more' }, ''));
      col.append(h('div', { class: 'd-idx' }, String(i)));
      const pp = ptrs.filter((p) => p.v === i);
      if (pp.length) col.append(h('div', { class: 'd-ptrs' }, pp.map((p) => h('span', { class: 'ptr ' + p.cls }, p.name))));
      row.append(col);
    }
    if (e[3]) row.append(h('div', { class: 'd-col' }, h('div', { class: 'd-cell more' }, '+' + (e[3] - n))));
    return row;
  }
  function gridView(e, heap, cellAt, prevE) {
    const t = h('table', { class: 'd-grid' });
    const rows = e[2];
    const ncol = Math.max(...rows.map((r) => (r[2] ? r[2].length : 0)), 0);
    const head = h('tr', null, h('th'));
    for (let j = 0; j < ncol; j++) head.append(h('th', null, String(j)));
    t.append(head);
    rows.forEach((r, i) => {
      const tr = h('tr', null, h('th', null, String(i)));
      const pr = prevE && prevE[2] && prevE[2][i];
      (r[2] || []).forEach((c, j) => {
        let cls = '';
        if (cellAt && cellAt[0] === i && cellAt[1] === j) cls = 'at';
        else if (pr && pr[2] && (!pr[2][j] || !sameEnc(pr[2][j], c))) cls = 'chg';
        const txt = fmt(c, heap, 3);
        tr.append(h('td', { class: cls, title: txt }, txt.length > 6 ? txt.slice(0, 5) + '…' : txt));
      });
      t.append(tr);
    });
    return h('div', { style: { overflowX: 'auto' } }, t);
  }
  function dictView(e, heap, prevE) {
    const box = h('div', { class: 'd-dict' });
    const prevMap = new Map((prevE && prevE[0] === 'd' ? prevE[2] : []).map(([k, v]) => [JSON.stringify(k), JSON.stringify(v)]));
    if (!e[2].length) box.append(h('span', { class: 'k', style: { gridColumn: '1 / -1' } }, '{}  (empty)'));
    for (const [k, v] of e[2]) {
      const key = JSON.stringify(k);
      const chg = prevE && (!prevMap.has(key) || prevMap.get(key) !== JSON.stringify(v));
      box.append(h('span', { class: 'k' + (chg ? ' chg' : '') }, fmt(k, heap, 2)), h('span', { class: 'v' + (chg ? ' chg' : '') }, fmt(v, heap, 2)));
    }
    if (e[3] > e[2].length) box.append(h('span', { class: 'k', style: { gridColumn: '1 / -1' } }, `… ${e[3] - e[2].length} more`));
    return box;
  }
  function setView(e, heap, prevE) {
    const prevSet = new Set((prevE && prevE[2] ? prevE[2] : []).map((x) => JSON.stringify(x)));
    const box = h('div', { class: 'd-set' });
    if (!e[2].length) box.append(h('span', null, 'set()  (empty)'));
    for (const x of e[2]) box.append(h('span', { class: prevE && !prevSet.has(JSON.stringify(x)) ? 'chg' : '' }, fmt(x, heap, 2)));
    return box;
  }
  function objectCards(frame, heap) {
    const out = [];
    const seen = new Set();
    const queue = [];
    for (const [name, e] of frame.v) if (e[0] === 'r' && heap[e[1]] && heap[e[1]][0] === 'O') queue.push([name, String(e[1])]);
    while (queue.length && out.length < 6) {
      const [label, id] = queue.shift();
      if (seen.has(id)) continue;
      seen.add(id);
      const o = heap[id];
      const card = h('div', { class: 'd-obj' }, h('div', { class: 'd-obj-h' }, label + ' → ' + o[1] + ' object'));
      for (const [a, v] of o[2]) {
        let view;
        if (isSeq(v) && v[2].every(isPrim) && v[2].length <= 24) view = arrayView(a, v, heap, [], null, null);
        else if (v[0] === 'd') view = dictView(v, heap, null);
        else view = h('div', { class: 'prims' }, h('span', { class: 'prim' }, fmt(v, heap, 1)));
        card.append(h('div', { class: 'vblock' }, h('div', { class: 'vname' }, '.' + a), view));
        if (v[0] === 'r' && heap[v[1]] && heap[v[1]][0] === 'O') queue.push([label + '.' + a, String(v[1])]);
      }
      out.push(card);
    }
    return out;
  }

  function frameView(fr, prevFr, heap) {
    const frag = [];
    const vars = new Map(fr.v);
    const prevVars = new Map(prevFr ? prevFr.v : []);
    const ptrList = [];
    let pk = 0;
    for (const [name, e] of fr.v) if (IDX.has(name) && isInt(e)) ptrList.push({ name, v: intOf(e), cls: 'p' + (pk++ % 5) });
    let win = null;
    for (const [a, b] of WINDOWS) if (isInt(vars.get(a)) && isInt(vars.get(b)) && intOf(vars.get(a)) <= intOf(vars.get(b))) { win = [intOf(vars.get(a)), intOf(vars.get(b))]; break; }
    let cellAt = null;
    for (const [a, b] of CELLS2D) if (isInt(vars.get(a)) && isInt(vars.get(b))) { cellAt = [intOf(vars.get(a)), intOf(vars.get(b))]; break; }
    const prims = h('div', { class: 'prims' });
    const blocks = [];
    for (const [name, e] of fr.v) {
      const pe = prevVars.get(name);
      const chg = prevFr ? !pe || !sameEnc(pe, e) : false;
      if (e[0] === 's') {
        const okPtrs = ptrList.filter((p) => p.v >= 0 && p.v <= e[1].length);
        if (okPtrs.length && e[1].length > 1 && e[1].length <= 40) {
          blocks.push(h('div', { class: 'vblock' }, h('div', { class: 'vname' + (chg ? ' chg' : '') }, name, h('span', { class: 'vt' }, `str · len ${e[1].length}`)), arrayView(name, e, heap, okPtrs, win, pe && pe[0] === 's' ? pe : null)));
          continue;
        }
      }
      if (isPrim(e) || e[0] === 'r') {
        const isPtr = IDX.has(name) && isInt(e);
        prims.append(h('span', { class: 'prim' + (chg ? ' chg' : '') + (isPtr ? ' ptrv' : ''), title: fmt(e, heap) }, name + ' = ', h('b', null, fmt(e, heap))));
        continue;
      }
      if (isSeq(e)) {
        const all2d = e[2].length && e[2].every((x) => isSeq(x) && x[2].every(isPrim));
        const label = h('div', { class: 'vname' + (chg ? ' chg' : '') }, name, h('span', { class: 'vt' }, `${e[0] === 't' ? 'tuple' : e[0] === 'q' ? 'deque' : 'list'} · len ${e[3] || e[2].length}`));
        if (all2d && e[2].length <= 20) { blocks.push(h('div', { class: 'vblock' }, label, gridView(e, heap, cellAt, pe))); continue; }
        const okPtrs = e[0] === 'q' ? [] : ptrList.filter((p) => p.v >= 0 && p.v <= e[2].length);
        blocks.push(h('div', { class: 'vblock' }, label, arrayView(name, e, heap, okPtrs, win, pe && isSeq(pe) ? pe : null)));
        continue;
      }
      if (e[0] === 'd') { blocks.push(h('div', { class: 'vblock' }, h('div', { class: 'vname' + (chg ? ' chg' : '') }, name, h('span', { class: 'vt' }, `${e[4] || 'dict'} · ${e[3]} key${e[3] === 1 ? '' : 's'}`)), dictView(e, heap, pe))); continue; }
      if (e[0] === 'S') { blocks.push(h('div', { class: 'vblock' }, h('div', { class: 'vname' + (chg ? ' chg' : '') }, name, h('span', { class: 'vt' }, `set · ${e[3] || e[2].length} item${(e[3] || e[2].length) === 1 ? '' : 's'}`)), setView(e, heap, pe))); continue; }
      prims.append(h('span', { class: 'prim' }, name + ' = ', h('b', null, fmt(e, heap))));
    }
    if (prims.children.length) frag.push(h('div', { class: 'vblock' }, prims));
    return frag.concat(blocks);
  }

  /* -------------------------------------------------------------- modal */
  DSA.py.openDebugger = function (opts) {
    const root = document.getElementById('modal-root');
    const codeLines = String(opts.code).split('\n');
    const codeEl = h('div', { class: 'dbg-code' });
    const lineEls = codeLines.map((ln, i) => h('span', { class: 'dl', 'data-n': String(i + 1), html: DSA.highlightLines(ln)[0] || ' ' }));
    lineEls.forEach((el) => codeEl.append(el));
    const status = h('div', { class: 'dbg-status' }, 'Starting…');
    const controls = h('div', { class: 'dbg-controls' });
    const viz = h('div', { class: 'dbg-viz' }, h('div', { class: 'dbg-loading' }, h('div', { class: 'spinner' }), h('div', null, DSA.py.ready ? 'Running your code with tracing…' : 'Loading Python in your browser… (first time only, about 10 MB)')));
    const out = h('div', { class: 'dbg-out' });
    const closeBtn = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close visualizer', html: DSA.icon('x') });
    const modal = h('div', { class: 'modal', role: 'dialog', 'aria-label': 'Step-through visualizer' },
      h('div', { class: 'modal-head' }, h('span', { class: 'chip' }, 'Python · step through'), h('h3', null, opts.title || 'Visualizer'), closeBtn),
      h('div', { class: 'modal-body' }, h('div', { class: 'dbg' },
        h('div', { class: 'dbg-left' }, codeEl, h('div', { class: 'dbg-controls' }, status, controls)),
        h('div', { class: 'dbg-right' }, viz, out))));
    const backdrop = h('div', { class: 'modal-backdrop', dataset: { sticky: '1' } }, modal);
    root.append(backdrop);
    let timer = null, alive = true;
    const close = () => { alive = false; if (timer) clearInterval(timer); document.removeEventListener('keydown', onKey); backdrop.remove(); };
    closeBtn.onclick = close;
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    let go = () => {};
    let playToggle = () => {};
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.target.closest && e.target.closest('input,select,textarea')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(+1, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1, true); }
      else if (e.key === ' ') { e.preventDefault(); playToggle(); }
      else if (e.key === 'Home') { e.preventDefault(); go(-1e9, true); }
      else if (e.key === 'End') { e.preventDefault(); go(1e9, true); }
    }
    document.addEventListener('keydown', onKey);
    closeBtn.focus();

    DSA.py.trace(opts.code, opts.driver, opts.expect).then((res) => {
      if (!alive) return;
      const steps = res.steps || [];
      out.innerHTML = '';
      if (!steps.length) {
        viz.innerHTML = '';
        viz.append(h('div', { class: 'dbg-empty' }, res.ok ? 'Nothing to step through: no function in your code ran. Add an example call such as Solution().method(...) in the "example call" box.' : 'The program stopped before any traced line ran.'));
        if (res.stdout) out.append(h('pre', null, res.stdout));
        if (!res.ok) { out.append(h('pre', { class: 'o-bad' }, res.error)); if (res.errline && lineEls[res.errline - 1]) lineEls[res.errline - 1].classList.add('err'); }
        status.textContent = res.ok ? 'Done.' : 'Error.';
        return;
      }
      const pos = planLinkedLists(steps);
      let k = 0;
      const range = h('input', { class: 'pl-range', type: 'range', min: '0', max: String(steps.length - 1), value: '0', 'aria-label': 'Step' });
      const count = h('span', { class: 'pl-count' }, '');
      const pbtn = (icon, label, fn, cls) => h('button', { class: 'pl-btn ' + (cls || ''), type: 'button', title: label, 'aria-label': label, html: DSA.icon(icon), onclick: fn });
      const playBtn = pbtn('play', 'Play (space)', () => playToggle(), 'play');
      const spd = h('select', { 'aria-label': 'Playback speed' }, [['1100', 'slow'], ['600', 'normal'], ['260', 'fast'], ['90', 'faster']].map(([v, t]) => h('option', { value: v }, t)));
      spd.value = '600';
      spd.onchange = () => { if (timer) { playToggle(); playToggle(); } };
      controls.append(h('div', { class: 'player' }, pbtn('first', 'First step (Home)', () => go(-1e9, true)), pbtn('prev', 'Previous step (←)', () => go(-1, true)), playBtn, pbtn('next', 'Next step (→)', () => go(1, true)), pbtn('last', 'Last step (End)', () => go(1e9, true)), range, count, spd));
      range.addEventListener('input', () => { k = parseInt(range.value, 10); render(); });
      go = (d, user) => { if (user && timer) playToggle(); k = DSA.clamp(k + d, 0, steps.length - 1); render(); };
      playToggle = () => {
        if (timer) { clearInterval(timer); timer = null; playBtn.innerHTML = DSA.icon('play'); return; }
        if (k >= steps.length - 1) k = 0;
        playBtn.innerHTML = DSA.icon('pause');
        timer = setInterval(() => { if (k >= steps.length - 1) { playToggle(); return; } k++; render(); }, parseInt(spd.value, 10));
      };
      function render() {
        const st = steps[k], prev = steps[k - 1];
        range.value = String(k);
        count.textContent = 'step ' + (k + 1) + ' / ' + steps.length;
        lineEls.forEach((el) => el.classList.remove('cur', 'prev', 'err', 'ret'));
        if (prev && lineEls[prev.l - 1] && prev.l !== st.l) lineEls[prev.l - 1].classList.add('prev');
        const cur = lineEls[st.l - 1];
        if (cur) {
          cur.classList.add(st.e === 'exception' ? 'err' : st.e === 'return' ? 'ret' : 'cur');
          const top = cur.offsetTop, hgt = codeEl.clientHeight;
          if (top < codeEl.scrollTop + 20 || top > codeEl.scrollTop + hgt - 40) codeEl.scrollTop = top - hgt / 2;
        }
        const fr = st.f[st.f.length - 1];
        const heap = st.h || {};
        let msg = '';
        if (st.e === 'call') {
          const args = fr ? fr.v.filter(([n]) => n !== 'self').map(([n, e]) => n + '=' + fmt(e, heap, 1)).join(', ') : '';
          msg = `<span class="ev call">call</span>Entering <b>${E(fr ? fr.n : '')}</b>(${E(args.slice(0, 160))})`;
        } else if (st.e === 'return') msg = `<span class="ev return">return</span><b>${E(fr ? fr.n : '')}</b> returns <b>${E(fmt(st.r, heap, 0).slice(0, 160))}</b>`;
        else if (st.e === 'exception') msg = `<span class="ev exception">raise</span>${E(st.x || 'exception')}`;
        else msg = `<span class="ev line">line ${st.l}</span>about to run: <code>${E((codeLines[st.l - 1] || '').trim().slice(0, 90))}</code>`;
        status.innerHTML = msg;
        viz.innerHTML = '';
        const stack = h('div', { class: 'dbg-stack' });
        st.f.forEach((f, i) => {
          if (i) stack.append(h('span', { class: 'dbg-fr-arrow' }, '→'));
          stack.append(h('span', { class: 'dbg-fr' + (i === st.f.length - 1 ? ' active' : '') }, f.n === '<module>' ? 'module' : f.n + '()'));
        });
        viz.append(h('div', { class: 'dbg-sec-title' }, 'call stack (' + st.f.length + ')'), stack);
        if (fr) {
          const pf = prev ? prev.f.find((f, i) => i === st.f.length - 1 && f.n === fr.n) || (prev.f.length === st.f.length ? prev.f[prev.f.length - 1] : null) : null;
          const pfr = pf && pf.n === fr.n ? pf : null;
          viz.append(h('div', { class: 'dbg-sec-title' }, 'variables in ' + (fr.n === '<module>' ? 'module' : fr.n + '()')));
          const fv = frameView(fr, pfr, heap);
          if (fv.length) fv.forEach((x) => viz.append(x)); else viz.append(h('div', { class: 'dbg-empty' }, 'No local variables yet.'));
          const ll = drawLinkedList(st, prev, pos, st.f);
          if (ll) viz.append(h('div', { class: 'dbg-sec-title' }, 'linked list nodes'), ll);
          const tr = drawTrees(st, st.f);
          if (tr) viz.append(h('div', { class: 'dbg-sec-title' }, 'tree' + (st.f.length > 1 ? ' (amber = this call, blue = callers)' : '')), tr);
          const cards = objectCards(fr, heap);
          if (cards.length) { viz.append(h('div', { class: 'dbg-sec-title' }, 'objects')); cards.forEach((c) => viz.append(c)); }
          if (st.f.length > 1) {
            const callers = h('div', { class: 'prims' });
            st.f.slice(0, -1).reverse().forEach((f) => {
              const short = f.v.filter(([n, e]) => n !== 'self' && (isPrim(e) || e[0] === 'r')).slice(0, 4).map(([n, e]) => n + '=' + fmt(e, heap, 2)).join(', ');
              callers.append(h('span', { class: 'prim', title: short }, (f.n === '<module>' ? 'module' : f.n) + ': ', h('b', null, short || '…')));
            });
            viz.append(h('div', { class: 'dbg-sec-title' }, 'waiting callers'), callers);
          }
        }
        out.innerHTML = '';
        const printed = (res.stdout || '').slice(0, st.o);
        if (printed) out.append(h('div', { class: 'o-label mono muted' }, 'printed so far'), h('pre', null, printed));
        if (k === steps.length - 1) {
          if (res.ok) {
            if (res.value != null) out.append(h('div', { class: 'o-label mono muted' }, 'result'), h('pre', null, res.value));
            if (res.match === true) out.append(h('div', { class: 'o-ok' }, '✓ matches the expected output ' + (res.expect || '')));
            else if (res.match === false) out.append(h('div', { class: 'o-bad' }, '✗ expected ' + res.expect));
          } else {
            out.append(h('pre', { class: 'o-bad' }, res.error || 'Error'));
            if (res.errline && lineEls[res.errline - 1]) lineEls[res.errline - 1].classList.add('err');
          }
        }
        out.hidden = !out.children.length;
      }
      render();
      if (!res.ok && res.limit) status.innerHTML += ' <span class="muted">(trace stopped at the step limit)</span>';
    });
  };

  /* Samples for the playground page. */
  DSA.playgroundSamples = [
    { title: 'Two pointers: reverse a list in place', code: 'def reverse(nums):\n    l, r = 0, len(nums) - 1\n    while l < r:\n        nums[l], nums[r] = nums[r], nums[l]\n        l += 1\n        r -= 1\n    return nums', driver: 'reverse([1, 2, 3, 4, 5, 6])' },
    { title: 'Binary search', code: 'def binary_search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1', driver: 'binary_search([1, 3, 5, 7, 9, 11, 13, 15], 11)' },
    { title: 'Linked list: reverse with prev / curr', code: 'def reverse_list(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev', driver: 'reverse_list(build_list([1, 2, 3, 4]))' },
    { title: 'Tree: maximum depth (recursion)', code: 'def max_depth(root):\n    if root is None:\n        return 0\n    left = max_depth(root.left)\n    right = max_depth(root.right)\n    return 1 + max(left, right)', driver: 'max_depth(build_tree([3, 9, 20, None, None, 15, 7]))' },
    { title: 'Sliding window: longest substring without repeats', code: 'def longest_unique(s):\n    seen = set()\n    l = best = 0\n    for r in range(len(s)):\n        while s[r] in seen:\n            seen.remove(s[l])\n            l += 1\n        seen.add(s[r])\n        best = max(best, r - l + 1)\n    return best', driver: 'longest_unique("abcabcbb")' },
    { title: 'Hash map: count words', code: 'def count_words(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return counts', driver: 'count_words(["ant", "bee", "ant", "cat", "bee", "ant"])' },
    { title: 'DP table: unique paths in a grid', code: 'def unique_paths(m, n):\n    dp = [[1] * n for _ in range(m)]\n    for r in range(1, m):\n        for c in range(1, n):\n            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]\n    return dp[m - 1][n - 1]', driver: 'unique_paths(3, 4)' },
    { title: 'BFS on a grid: number of islands', code: 'def num_islands(grid):\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == "1":\n                count += 1\n                q = deque([(r, c)])\n                grid[r][c] = "0"\n                while q:\n                    cr, cc = q.popleft()\n                    for nr, nc in ((cr+1, cc), (cr-1, cc), (cr, cc+1), (cr, cc-1)):\n                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":\n                            grid[nr][nc] = "0"\n                            q.append((nr, nc))\n    return count', driver: 'num_islands([["1","1","0","0"],["1","0","0","1"],["0","0","1","1"]])' },
    { title: 'Plain script (no function)', code: 'nums = [5, 2, 8, 1]\ntotal = 0\nfor x in nums:\n    total += x\n    print("added", x, "total is", total)\nbest = max(nums)', driver: '' },
  ];
})();

/* 2D: intervals (merge / remove overlaps), a bitwise playground,
   and the Big-O growth chart. */
(function () {
  'use strict';
  const DSA = window.DSA;
  const h = DSA.h;

  /* ------------------------------------------------------------ intervals */
  function parsePairs(str) {
    const nums = (String(str).match(/-?\d+/g) || []).map(Number);
    const out = [];
    for (let i = 0; i + 1 < nums.length; i += 2) out.push([Math.min(nums[i], nums[i + 1]), Math.max(nums[i], nums[i + 1])]);
    return out.slice(0, 9);
  }
  DSA.widgets.intervals = function (container, o) {
    const mode = o.mode === 'erase' ? 'erase' : 'merge';
    const fig = DSA.figure({ kicker: o.kicker, title: o.title || (mode === 'merge' ? 'Merge overlapping intervals' : 'Fewest removals so nothing overlaps (greedy by end)'), flat: true, inputs: true, caption: o.caption, hint: 'Space plays · ← → step' });
    container.append(fig.root);
    const area = h('div', { style: { display: 'grid', gap: '6px' } });
    fig.stage.append(area);
    let ivs = [], maxV = 10;
    const player = DSA.player(fig, { render, interval: 1300 });
    const pct = (v) => (v / maxV) * 100 + '%';
    function bar(iv, cls) {
      const b = h('div', { class: 'iv-bar ' + (cls || ''), title: `[${iv[0]}, ${iv[1]}]` }, `${iv[0]}–${iv[1]}`);
      b.style.left = pct(iv[0]);
      b.style.width = `calc(${pct(Math.max(iv[1] - iv[0], 0.15))} )`;
      return b;
    }
    function render(st) {
      area.innerHTML = '';
      st.list.forEach((iv, i) => {
        const cls = i === st.cur ? 'cur' : st.removed && st.removed.includes(i) ? 'removed' : '';
        area.append(h('div', { class: 'iv-row' }, h('span', { class: 'iv-name' }, i === 0 ? (st.sortedBy ? 'sorted by ' + st.sortedBy : 'input') : ''), h('div', { class: 'iv-track' }, bar(iv, cls))));
      });
      area.append(h('div', { class: 'iv-row' }, h('span', { class: 'iv-name' }, mode === 'merge' ? 'merged' : 'kept'), h('div', { class: 'iv-track' }, st.result.map((iv) => bar(iv, 'merged')))));
      const ticks = h('div', { class: 'iv-axis' });
      for (let k = 0; k <= 4; k++) ticks.append(h('span', null, String(Math.round((maxV * k) / 4))));
      area.append(ticks);
      fig.say(st.msg, 'O(n log n)');
    }
    function gen() {
      const steps = [];
      if (mode === 'merge') {
        const s = ivs.slice().sort((a, b) => a[0] - b[0]);
        steps.push({ list: ivs, result: [], msg: 'Input in any order. Overlaps are hard to spot until we sort.' });
        steps.push({ list: s, sortedBy: 'start', result: [], msg: 'Sort by <b>start</b>. Now any interval that overlaps the current merged block must come right after it.' });
        const res = [];
        s.forEach((iv, i) => {
          const last = res[res.length - 1];
          if (!last || iv[0] > last[1]) { res.push(iv.slice()); steps.push({ list: s, sortedBy: 'start', cur: i, result: res.map((x) => x.slice()), msg: last ? `[${iv}] starts at ${iv[0]}, after the last block ends (${last[1]}): no overlap, start a new block.` : `First interval [${iv}] opens the first block.` }); }
          else { const old = last[1]; last[1] = Math.max(last[1], iv[1]); steps.push({ list: s, sortedBy: 'start', cur: i, result: res.map((x) => x.slice()), msg: `[${iv}] starts at ${iv[0]} ≤ ${old} (the block's end): overlap. Extend the block's end to max(${old}, ${iv[1]}) = ${last[1]}.` }); }
        });
        steps.push({ list: s, sortedBy: 'start', result: res, msg: `Merged into <b>${res.length}</b> block${res.length === 1 ? '' : 's'}: ${res.map((x) => '[' + x + ']').join(', ')}. Sorting costs O(n log n); the sweep is O(n).` });
      } else {
        const s = ivs.slice().sort((a, b) => a[1] - b[1]);
        steps.push({ list: ivs, result: [], msg: 'Goal: remove as few intervals as possible so the rest never overlap.' });
        steps.push({ list: s, sortedBy: 'end', result: [], msg: 'Sort by <b>end</b>. Greedy rule: always keep the interval that finishes first. It leaves the most room for the rest.' });
        const kept = [], removed = [];
        let end = -Infinity;
        s.forEach((iv, i) => {
          if (iv[0] >= end) { kept.push(iv); end = iv[1]; steps.push({ list: s, sortedBy: 'end', cur: i, removed: removed.slice(), result: kept.slice(), msg: `[${iv}] starts at ${iv[0]} ≥ ${kept.length > 1 ? kept[kept.length - 2][1] : '−∞'} (last kept end): keep it. New end = ${end}.` }); }
          else { removed.push(i); steps.push({ list: s, sortedBy: 'end', cur: i, removed: removed.slice(), result: kept.slice(), msg: `[${iv}] starts at ${iv[0]} &lt; ${end}: it overlaps what we kept. Remove it (it ends later, so it is the worse one to keep).` }); }
        });
        steps.push({ list: s, sortedBy: 'end', removed, result: kept, msg: `Removed <b>${removed.length}</b>, kept ${kept.length}. The same idea solves "minimum arrows to burst balloons" and meeting-room scheduling.` });
      }
      return steps;
    }
    const read = DSA.widgetInputs(fig, [{ key: 'iv', label: 'intervals', value: o.value || (mode === 'merge' ? '[1,3] [8,10] [2,6] [15,18] [9,12]' : '[1,2] [2,3] [3,4] [1,3] [2,5]'), type: 'str' }], apply);
    function apply() {
      ivs = parsePairs(read().iv);
      if (!ivs.length) ivs = [[1, 3], [2, 6]];
      maxV = Math.max(...ivs.map((x) => x[1])) + 1;
      player.setSteps(gen());
    }
    apply();
    return { destroy: player.destroy };
  };

  /* --------------------------------------------------------------- bits */
  DSA.widgets.bits = function (container, o) {
    const fig = DSA.figure({ kicker: o.kicker, title: o.title || 'Bitwise playground', flat: true, inputs: true, caption: o.caption });
    container.append(fig.root);
    const aIn = h('input', { type: 'text', value: '12', class: 'short', 'aria-label': 'a', id: 'bits-a-' + Math.random().toString(36).slice(2, 7) });
    const bIn = h('input', { type: 'text', value: '10', class: 'short', 'aria-label': 'b', id: 'bits-b-' + Math.random().toString(36).slice(2, 7) });
    const ops = [
      ['and', 'a & b  (AND: 1 if both are 1)'], ['or', 'a | b  (OR: 1 if either is 1)'], ['xor', 'a ^ b  (XOR: 1 if they differ)'],
      ['shl', 'a << 1  (shift left = × 2)'], ['shr', 'a >> 1  (shift right = // 2)'], ['low', 'a & (a - 1)  (clear lowest 1)'],
      ['lsb', 'a & -a  (keep only lowest 1)'], ['not', '~a (NOT, shown in 8 bits)'],
    ];
    const sel = h('select', { 'aria-label': 'operation' }, ops.map(([v, t]) => h('option', { value: v }, t)));
    sel.value = o.op || 'xor';
    fig.inputs.append(h('label', null, 'a', aIn), h('label', null, 'b', bIn), sel);
    const out = h('div', { style: { display: 'grid', gap: '6px' } });
    fig.stage.append(out);
    function row(name, v, nb, cls) {
      const r = h('div', { class: 'bits-row ' + (cls || ''), style: { '--nb': nb } }, h('span', { class: 'bn' }, name));
      for (let i = nb - 1; i >= 0; i--) { const on = (v >> i) & 1; r.append(h('span', { class: 'bit' + (on ? ' on' : '') }, String(on))); }
      r.append(h('span', { class: 'bv' }, '= ' + v));
      return r;
    }
    function paint() {
      const a = DSA.clamp(parseInt(aIn.value, 10) || 0, 0, 255), b = DSA.clamp(parseInt(bIn.value, 10) || 0, 0, 255);
      const op = sel.value;
      const mask = 255;
      const res = { and: a & b, or: a | b, xor: a ^ b, shl: (a << 1) & 511, shr: a >> 1, low: a & (a - 1), lsb: a & -a, not: ~a & mask }[op];
      const nb = op === 'shl' ? 9 : 8;
      out.innerHTML = '';
      const head = h('div', { class: 'bits-row', style: { '--nb': nb } }, h('span'));
      for (let i = nb - 1; i >= 0; i--) head.append(h('span', { class: 'bit-head' }, String(1 << i)));
      out.append(head, row('a', a, nb));
      if (['and', 'or', 'xor'].includes(op)) out.append(row('b', b, nb));
      if (op === 'low') out.append(row('a - 1', Math.max(a - 1, 0), nb));
      out.append(row('result', res, nb, 'res'));
      const notes = {
        and: 'AND keeps only bits set in both. <code>x & 1</code> tells you if x is odd.',
        or: 'OR combines bits. Used to set a flag: <code>mask | (1 << i)</code>.',
        xor: 'XOR cancels equal bits: <code>x ^ x = 0</code> and <code>x ^ 0 = x</code>. XOR every number in a list and the pairs cancel, leaving the one that appears once (Single Number).',
        shl: 'Shifting left by k multiplies by 2ᵏ. <code>1 << i</code> builds a mask with only bit i set.',
        shr: 'Shifting right by 1 drops the last bit: integer division by 2. Loop <code>x >>= 1</code> to visit every bit.',
        low: '<code>a & (a − 1)</code> clears the lowest set bit. Repeat until 0 to count 1-bits (Kernighan), and <code>a & (a−1) == 0</code> tests for a power of two.',
        lsb: '<code>a & -a</code> isolates the lowest set bit, because −a is ~a + 1 in two\'s complement.',
        not: '~a flips every bit. In Python, <code>~a == -a - 1</code> because integers have unlimited size; here we show the low 8 bits.',
      };
      fig.say(notes[op], 'O(1)');
    }
    [aIn, bIn].forEach((x) => x.addEventListener('input', paint));
    sel.addEventListener('change', paint);
    paint();
    return { destroy() {} };
  };

  /* --------------------------------------------------------------- big-O */
  const CURVES = [
    { k: 'O(1)', f: () => 1, color: '--mint' },
    { k: 'O(log n)', f: (n) => Math.max(1, Math.log2(n)), color: '--cyan' },
    { k: 'O(n)', f: (n) => n, color: '--ink' },
    { k: 'O(n log n)', f: (n) => n * Math.max(1, Math.log2(n)), color: '--violet' },
    { k: 'O(n²)', f: (n) => n * n, color: '--accent' },
    { k: 'O(2ⁿ)', f: (n) => Math.pow(2, n), color: '--coral' },
  ];
  function human(ops) {
    if (!isFinite(ops) || ops > 1e30) return 'longer than the universe';
    const s = ops / 1e8;
    if (s < 1e-6) return '< 1 µs';
    if (s < 1e-3) return (s * 1e6).toFixed(0) + ' µs';
    if (s < 1) return (s * 1e3).toFixed(0) + ' ms';
    if (s < 120) return s.toFixed(1) + ' s';
    if (s < 7200) return (s / 60).toFixed(0) + ' min';
    if (s < 172800) return (s / 3600).toFixed(0) + ' hours';
    if (s < 3.15e7 * 2) return (s / 86400).toFixed(0) + ' days';
    return (s / 3.15e7).toExponential(1) + ' years';
  }
  function fmtOps(x) {
    if (!isFinite(x) || x > 1e30) return '≈ ∞';
    if (x < 1e6) return Math.round(x).toLocaleString();
    return x.toExponential(1).replace('e+', ' × 10^');
  }
  DSA.widgets.bigO = function (container, o) {
    const fig = DSA.figure({ kicker: o.kicker, title: o.title || 'How running time grows with input size', flat: true, caption: o.caption || 'Times assume about 100 million simple operations per second, a fair guess for Python on LeetCode is closer to 10 million.' });
    container.append(fig.root);
    const canvas = h('canvas', { class: 'bigo-canvas', role: 'img', 'aria-label': 'Growth curves for common complexities' });
    const tbl = h('table', { class: 'tbl bigo-tbl' });
    const tblWrap = h('div', { class: 'tbl-wrap' }, tbl);
    fig.stage.append(h('div', { class: 'bigo-wrap' }, canvas, tblWrap));
    const nSel = h('select', { 'aria-label': 'input size n' }, [10, 100, 1000, 10000, 100000, 1000000].map((n) => h('option', { value: String(n) }, 'n = ' + n.toLocaleString())));
    nSel.value = '1000';
    const zoom = h('input', { type: 'range', min: '8', max: '64', value: '24', 'aria-label': 'chart range' });
    fig.tools.append(h('label', null, 'table for', nSel), h('label', null, 'chart up to n =', zoom, h('span', { class: 'mono tnum', id: 'bigo-z' }, '24')));
    function draw() {
      const N = parseInt(zoom.value, 10);
      fig.tools.querySelector('#bigo-z').textContent = String(N);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth || 600, H = canvas.clientHeight || 320;
      canvas.width = W * dpr; canvas.height = H * dpr;
      const c = canvas.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      const pad = { l: 46, r: 14, t: 14, b: 30 };
      const yMax = N * 4;
      const X = (n) => pad.l + ((n - 1) / (N - 1)) * (W - pad.l - pad.r);
      const Y = (v) => H - pad.b - (Math.min(v, yMax) / yMax) * (H - pad.t - pad.b);
      c.strokeStyle = DSA.cssVar('--line'); c.lineWidth = 1;
      c.font = '11px "JetBrains Mono", monospace'; c.fillStyle = DSA.cssVar('--muted');
      for (let k = 0; k <= 4; k++) {
        const v = (yMax * k) / 4, y = Y(v);
        c.beginPath(); c.moveTo(pad.l, y); c.lineTo(W - pad.r, y); c.stroke();
        c.textAlign = 'right'; c.fillText(String(Math.round(v)), pad.l - 6, y + 4);
      }
      c.textAlign = 'center';
      for (let k = 0; k <= 4; k++) { const n = Math.round(1 + ((N - 1) * k) / 4); c.fillText(String(n), X(n), H - 10); }
      c.textAlign = 'left'; c.fillText('operations', pad.l + 4, pad.t + 10);
      c.textAlign = 'right'; c.fillText('n →', W - pad.r, H - 10);
      for (const cv of CURVES) {
        c.strokeStyle = DSA.cssVar(cv.color); c.lineWidth = 2.4;
        c.beginPath();
        let lastX = 0, lastY = 0, clipped = false;
        for (let n = 1; n <= N; n += 0.25) {
          const x = X(n), v = cv.f(n), y = Y(v);
          if (n === 1) c.moveTo(x, y); else c.lineTo(x, y);
          lastX = x; lastY = y;
          if (v >= yMax) { clipped = true; break; }
        }
        c.stroke();
        c.fillStyle = DSA.cssVar(cv.color);
        c.font = '600 11px "JetBrains Mono", monospace';
        c.textAlign = 'left';
        const lx = Math.min(lastX + 4, W - pad.r - 64);
        c.fillText(cv.k, clipped ? Math.min(lastX - 8, W - pad.r - 70) : lx, clipped ? pad.t + 12 + CURVES.indexOf(cv) * 0 : lastY - 4);
      }
      const n = parseInt(nSel.value, 10);
      tbl.innerHTML = '';
      tbl.append(h('thead', null, h('tr', null, h('th', null, 'complexity'), h('th', null, 'operations'), h('th', null, 'time'))));
      const tb = h('tbody');
      for (const cv of CURVES) {
        const ops = cv.f(n);
        tb.append(h('tr', null, h('td', { html: `<i style="background:var(${cv.color})"></i>${cv.k}` }), h('td', { class: 'mono tnum' }, fmtOps(ops)), h('td', { class: 'mono' }, human(ops))));
      }
      tbl.append(tb);
      fig.say(`At <b>n = ${n.toLocaleString()}</b>, O(n²) needs ${fmtOps(n * n)} operations while O(n log n) needs ${fmtOps(n * Math.log2(n))}. The shape of the curve matters far more than constant factors.`, null);
    }
    zoom.addEventListener('input', draw);
    nSel.addEventListener('change', draw);
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    const onTheme = () => draw();
    window.addEventListener('dsa-theme', onTheme);
    draw();
    return { destroy() { ro.disconnect(); window.removeEventListener('dsa-theme', onTheme); } };
  };
})();

/* 2D: recursion trees with a live call stack.
   Modes: fib (with a memoization switch), subsets and permutations
   (backtracking: choose → explore → un-choose). */
(function () {
  'use strict';
  const DSA = window.DSA;
  const h = DSA.h, S = DSA.svg;

  function genFib(n, memo) {
    const nodes = [], events = [], cache = {};
    (function call(k, parent, depth) {
      const id = nodes.length;
      nodes.push({ id, label: 'f(' + k + ')', parent, depth, kids: [] });
      if (parent != null) nodes[parent].kids.push(id);
      events.push({ t: 'call', id, msg: `Call <code>fib(${k})</code>.` });
      if (memo && cache[k] != null) { nodes[id].memo = true; events.push({ t: 'ret', id, v: cache[k], memo: true, msg: `<code>fib(${k})</code> is already in the memo: return <b>${cache[k]}</b> immediately. This whole subtree is skipped.` }); return cache[k]; }
      if (k < 2) { events.push({ t: 'ret', id, v: k, msg: `<code>fib(${k}) = ${k}</code>: base case, no further calls.` }); if (memo) cache[k] = k; return k; }
      const a = call(k - 1, id, depth + 1), b = call(k - 2, id, depth + 1);
      if (memo) cache[k] = a + b;
      events.push({ t: 'ret', id, v: a + b, msg: `<code>fib(${k}) = fib(${k - 1}) + fib(${k - 2}) = ${a} + ${b} = <b>${a + b}</b></code>${memo ? ', saved in the memo' : ''}. Return to the caller.` });
      return a + b;
    })(n, null, 0);
    return { nodes, events, out: null };
  }
  function genSubsets(nums) {
    const nodes = [], events = [], out = [];
    const path = [];
    (function bt(i, parent, depth, label) {
      const id = nodes.length;
      nodes.push({ id, label: '[' + path.join(',') + ']', parent, depth, kids: [], edge: label });
      if (parent != null) nodes[parent].kids.push(id);
      events.push({ t: 'call', id, msg: label ? `${label}. Current subset: <code>[${path.join(', ')}]</code>.` : 'Start with the empty subset. At each level decide: include the next number, or not.' });
      if (i === nums.length) {
        out.push('[' + path.join(',') + ']');
        events.push({ t: 'ret', id, v: '✓', leaf: true, out: out.slice(), msg: `Decided all ${nums.length} numbers: record <code>[${path.join(', ')}]</code>. ${out.length} of ${Math.pow(2, nums.length)} subsets so far.` });
        return;
      }
      path.push(nums[i]); bt(i + 1, id, depth + 1, `Include ${nums[i]}`); path.pop();
      events.push({ t: 'back', id, msg: `Back at <code>[${path.join(', ')}]</code>: <b>undo</b> the choice (pop ${nums[i]}) and try the other branch.` });
      bt(i + 1, id, depth + 1, `Skip ${nums[i]}`);
      events.push({ t: 'ret', id, v: '', msg: `Both branches below <code>[${path.join(', ')}]</code> explored. Return.` });
    })(0, null, 0, '');
    return { nodes, events, out };
  }
  function genPerms(nums) {
    const nodes = [], events = [], out = [];
    const path = [], used = nums.map(() => false);
    (function bt(parent, depth, label) {
      const id = nodes.length;
      nodes.push({ id, label: '[' + path.join(',') + ']', parent, depth, kids: [], edge: label });
      if (parent != null) nodes[parent].kids.push(id);
      events.push({ t: 'call', id, msg: label ? `Choose ${label}. Path <code>[${path.join(', ')}]</code>.` : 'Empty path. Each level picks one of the unused numbers.' });
      if (path.length === nums.length) {
        out.push('[' + path.join(',') + ']');
        events.push({ t: 'ret', id, v: '✓', leaf: true, out: out.slice(), msg: `Full length: record <code>[${path.join(', ')}]</code> (${out.length} of ${factorial(nums.length)}).` });
        return;
      }
      for (let k = 0; k < nums.length; k++) {
        if (used[k]) continue;
        used[k] = true; path.push(nums[k]);
        bt(id, depth + 1, String(nums[k]));
        path.pop(); used[k] = false;
        events.push({ t: 'back', id, msg: `Un-choose ${nums[k]}: path back to <code>[${path.join(', ')}]</code>, mark ${nums[k]} unused again.` });
      }
      events.push({ t: 'ret', id, v: '', msg: `All choices from <code>[${path.join(', ')}]</code> tried. Return.` });
    })(null, 0, '');
    return { nodes, events, out };
  }
  const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));

  function layout(nodes) {
    let leaf = 0, maxD = 0;
    (function place(id) {
      const n = nodes[id];
      maxD = Math.max(maxD, n.depth);
      if (!n.kids.length) n.x = leaf++;
      else { n.kids.forEach(place); n.x = (nodes[n.kids[0]].x + nodes[n.kids[n.kids.length - 1]].x) / 2; }
    })(0);
    return { leaves: leaf, maxD };
  }

  const MODES = {
    fib: { title: 'Recursion tree for fib(n), with and without memoization', fields: [{ key: 'n', label: 'n', value: '5', type: 'num', short: true }] },
    subsets: { title: 'Backtracking: all subsets (include / skip each number)', fields: [{ key: 'nums', label: 'numbers', value: '1, 2, 3', type: 'nums' }] },
    perms: { title: 'Backtracking: all permutations (choose, explore, un-choose)', fields: [{ key: 'nums', label: 'numbers', value: '1, 2, 3', type: 'nums' }] },
  };

  DSA.widgets.recursion = function (container, o) {
    const mode = MODES[o.mode] ? o.mode : 'fib';
    const M = MODES[mode];
    const fig = DSA.figure({ kicker: o.kicker, title: o.title || M.title, flat: true, inputs: true, caption: o.caption, hint: 'Space plays · ← → step' });
    container.append(fig.root);
    let memo = !!o.memo, data = null;
    const svgWrap = h('div', { class: 'svg-wrap' });
    const stackEl = h('div', { class: 'callstack' });
    const side = h('div', { style: { display: 'grid', gap: '8px', alignContent: 'start' } }, h('div', { class: 'lane-name' }, 'call stack'), stackEl);
    const info = h('div', { class: 'w-vars' });
    fig.stage.append(h('div', { class: 'rec-layout' }, svgWrap, side), info);
    const player = DSA.player(fig, { render, interval: o.interval || 750 });
    let memoBtn = null;
    if (mode === 'fib') {
      memoBtn = DSA.btn('', null, () => { memo = !memo; paintMemo(); apply(); }, '');
      fig.inputs.append(memoBtn);
    }
    function paintMemo() { if (memoBtn) { memoBtn.innerHTML = '<span>Memoization: ' + (memo ? 'ON' : 'OFF') + '</span>'; memoBtn.className = 'btn sm ' + (memo ? 'on' : ''); } }
    paintMemo();

    function render(_, idx) {
      const ev = data.events;
      const state = {};
      let stack = [], calls = 0, out = [];
      for (let k = 0; k <= idx; k++) {
        const e = ev[k];
        if (e.t === 'call') { state[e.id] = { s: 'open' }; stack.push(e.id); calls++; }
        else if (e.t === 'ret') { state[e.id] = { s: data.nodes[e.id].memo ? 'memo' : e.leaf ? 'leaf' : 'done', v: e.v }; stack = stack.filter((x) => x !== e.id); if (e.out) out = e.out; }
      }
      const cur = ev[idx];
      const top = stack[stack.length - 1];
      const { leaves, maxD } = data.L;
      const XS = mode === 'fib' ? 50 : 54, YS = 62, W = Math.max(320, leaves * XS + 30), H = (maxD + 1) * YS + 26;
      const svg = S('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
      const px = (n) => 15 + XS / 2 + n.x * XS, py = (n) => 24 + n.depth * YS;
      for (const n of data.nodes) {
        if (!state[n.id] || n.parent == null) continue;
        const p = data.nodes[n.parent];
        const onPath = stack.includes(n.id);
        svg.append(S('line', { class: 'redge' + (onPath ? ' active' : ''), x1: px(p), y1: py(p), x2: px(n), y2: py(n) }));
        if (n.edge && mode !== 'fib') svg.append(S('text', { class: 'rlabel', x: (px(p) + px(n)) / 2 + (px(n) < px(p) ? -8 : 8), y: (py(p) + py(n)) / 2 }, mode === 'subsets' ? (n.edge.startsWith('Include') ? '+' + n.edge.split(' ')[1] : '−') : n.edge));
      }
      for (const n of data.nodes) {
        const st = state[n.id];
        if (!st) continue;
        let cls = 'rnode';
        if (n.id === top) cls += ' active';
        else if (st.s !== 'open') cls += ' ' + st.s;
        const g = S('g', { class: cls });
        const w = Math.max(30, n.label.length * 7.4 + 10);
        g.append(S('rect', { x: px(n) - w / 2, y: py(n) - 13, width: w, height: 26, rx: 13 }), S('text', { x: px(n), y: py(n) }, n.label));
        if (st.v !== undefined && st.v !== '' && st.s !== 'open') g.append(S('text', { class: 'rret', x: px(n), y: py(n) + 24 }, mode === 'fib' ? '= ' + st.v : st.v));
        svg.append(g);
      }
      svgWrap.innerHTML = '';
      svgWrap.append(svg);
      stackEl.innerHTML = '';
      stack.forEach((id, k) => stackEl.append(h('div', { class: 'cs-frame' + (k === stack.length - 1 ? ' top' : '') }, mode === 'fib' ? 'fib(' + data.nodes[id].label.slice(2, -1) + ')' : 'bt(' + data.nodes[id].label + ')')));
      if (!stack.length) stackEl.append(h('div', { class: 'lane-empty' }, 'empty'));
      info.innerHTML = '';
      info.append(h('span', { class: 'w-var hot', html: 'calls so far = <b>' + calls + '</b>' }));
      info.append(h('span', { class: 'w-var', html: 'stack depth = <b>' + stack.length + '</b>' }));
      if (mode !== 'fib') info.append(h('span', { class: 'w-var good', html: 'output = <b>' + DSA.esc('[' + out.join(', ') + ']') + '</b>' }));
      const total = data.events.filter((e) => e.t === 'call').length;
      const cx = mode === 'fib' ? (memo ? 'O(n)' : 'O(2ⁿ)') : mode === 'subsets' ? 'O(n·2ⁿ)' : 'O(n·n!)';
      let msg = cur.msg;
      if (idx === data.events.length - 1) msg += mode === 'fib' ? ` Total: <b>${total}</b> calls${memo ? ' with memoization (about 2n)' : '. Turn memoization on and compare'}.` : ` Done: ${out.length} results.`;
      fig.say(msg, cx);
    }
    const read = DSA.widgetInputs(fig, M.fields.map((f) => Object.assign({}, f, o.values && o.values[f.key] != null ? { value: String(o.values[f.key]) } : {})), apply);
    function apply() {
      const v = read();
      if (mode === 'fib') data = genFib(DSA.clamp(Math.round(v.n), 1, 7), memo);
      else {
        const nums = Array.from(new Set(v.nums)).slice(0, mode === 'perms' ? 3 : 4);
        data = mode === 'subsets' ? genSubsets(nums) : genPerms(nums);
      }
      data.L = layout(data.nodes);
      player.setSteps(data.events);
    }
    apply();
    return { destroy: player.destroy };
  };
})();

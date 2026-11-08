/* 3D: sorting algorithms as bars. Every comparison and swap is counted, so
   you can feel the difference between O(n²) and O(n log n), and see how
   insertion sort flies on nearly-sorted input. */
(function () {
  'use strict';
  const DSA = window.DSA;
  const ALGOS = {
    bubble: { name: 'Bubble sort', cx: 'O(n²)', note: 'Compare neighbours and swap if out of order. After each pass the largest remaining bar has bubbled to the end.' },
    selection: { name: 'Selection sort', cx: 'O(n²)', note: 'Find the smallest remaining bar (violet), swap it into the next slot. Always ~n²/2 comparisons, even if already sorted.' },
    insertion: { name: 'Insertion sort', cx: 'O(n²)', note: 'Take the next bar and slide it left into the sorted part. Nearly sorted input needs only a few swaps: close to O(n).' },
    merge: { name: 'Merge sort', cx: 'O(n log n)', note: 'Split in half, sort each half, merge the two sorted halves. log n levels × n work per level.' },
    quick: { name: 'Quick sort', cx: 'O(n log n)', note: 'Pick a pivot (violet), move smaller bars left of it, recurse on both sides. Average O(n log n), worst O(n²) with bad pivots.' },
    heap: { name: 'Heap sort', cx: 'O(n log n)', note: 'Arrange the array as a max-heap, then repeatedly swap the max to the end and repair the heap.' },
  };
  function* bubble(a) {
    const n = a.length;
    for (let i = 0; i < n; i++) {
      let sw = false;
      for (let j = 0; j < n - 1 - i; j++) {
        yield ['cmp', j, j + 1];
        if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; sw = true; yield ['swap', j, j + 1]; }
      }
      yield ['done', n - 1 - i];
      if (!sw) { for (let k = 0; k < n - 1 - i; k++) yield ['done', k]; return; }
    }
  }
  function* selection(a) {
    const n = a.length;
    for (let i = 0; i < n; i++) {
      let m = i; yield ['pivot', m];
      for (let j = i + 1; j < n; j++) { yield ['cmp', m, j]; if (a[j] < a[m]) { yield ['unpivot', m]; m = j; yield ['pivot', m]; } }
      if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; yield ['swap', i, m]; }
      yield ['unpivot', m]; yield ['done', i];
    }
  }
  function* insertion(a) {
    const n = a.length;
    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) { yield ['cmp', j - 1, j]; if (a[j - 1] > a[j]) { [a[j - 1], a[j]] = [a[j], a[j - 1]]; yield ['swap', j - 1, j]; j--; } else break; }
    }
    for (let k = 0; k < n; k++) yield ['done', k];
  }
  function* merge(a) {
    function* ms(lo, hi) {
      if (lo >= hi) return;
      const mid = (lo + hi) >> 1;
      yield* ms(lo, mid); yield* ms(mid + 1, hi);
      yield ['range', lo, hi];
      const L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;
      while (i < L.length && j < R.length) { yield ['count']; const v = L[i] <= R[j] ? L[i++] : R[j++]; a[k] = v; yield ['set', k, v]; k++; }
      while (i < L.length) { a[k] = L[i++]; yield ['set', k, a[k]]; k++; }
      while (j < R.length) { a[k] = R[j++]; yield ['set', k, a[k]]; k++; }
    }
    yield* ms(0, a.length - 1);
    yield ['range', 0, a.length - 1];
    for (let k = 0; k < a.length; k++) yield ['done', k];
  }
  function* quick(a) {
    function* qs(lo, hi) {
      if (lo > hi) return;
      if (lo === hi) { yield ['done', lo]; return; }
      yield ['range', lo, hi];
      yield ['pivot', hi];
      let i = lo;
      for (let j = lo; j < hi; j++) { yield ['cmp', j, hi]; if (a[j] < a[hi]) { if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; yield ['swap', i, j]; } i++; } }
      yield ['unpivot', hi];
      if (i !== hi) { [a[i], a[hi]] = [a[hi], a[i]]; yield ['swap', i, hi]; }
      yield ['done', i];
      yield* qs(lo, i - 1); yield* qs(i + 1, hi);
    }
    yield* qs(0, a.length - 1);
    yield ['range', 0, a.length - 1];
  }
  function* heap(a) {
    const n = a.length;
    function* sift(i, end) {
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < end) { yield ['cmp', l, m]; if (a[l] > a[m]) m = l; }
        if (r < end) { yield ['cmp', r, m]; if (a[r] > a[m]) m = r; }
        if (m === i) return;
        [a[i], a[m]] = [a[m], a[i]]; yield ['swap', i, m]; i = m;
      }
    }
    for (let i = (n >> 1) - 1; i >= 0; i--) yield* sift(i, n);
    for (let end = n - 1; end > 0; end--) { [a[0], a[end]] = [a[end], a[0]]; yield ['swap', 0, end]; yield ['done', end]; yield* sift(0, end); }
    yield ['done', 0];
  }
  const GENS = { bubble, selection, insertion, merge, quick, heap };

  DSA.scenes3d.sorting = function (container, o) {
    o = o || {};
    const D3 = DSA.d3;
    const ctx = D3.stage(container, Object.assign({ title: 'Sorting algorithms, counted step by step', camera: [0, 5.2, 13.2], target: [0, 2.0, 0], height: 450 }, o));
    if (ctx.fallback) return ctx;
    const { PAL } = ctx;
    const N = 14, SP = 0.86, HS = 0.32;
    let vals = [], bars = [], algo = o.algo || 'bubble', flow = null, cmps = 0, writes = 0, finished = false;
    const xOf = (i) => (i - (N - 1) / 2) * SP;

    function makeData(kind) {
      const base = Array.from({ length: N }, (_, i) => i + 2);
      if (kind === 'reversed') return base.reverse();
      if (kind === 'nearly') { const a = base.slice(); for (let k = 0; k < 2; k++) { const i = Math.floor(Math.random() * (N - 1)); [a[i], a[i + 1]] = [a[i + 1], a[i]]; } return a; }
      if (kind === 'few') return Array.from({ length: N }, () => [3, 7, 11, 15][Math.floor(Math.random() * 4)]);
      for (let i = base.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
      return base;
    }
    function build(kind) {
      if (flow) flow.cancel();
      flow = null; finished = false;
      for (const b of bars) ctx.root.remove(b.g, b.lbl);
      vals = makeData(kind || dataSel.value);
      bars = vals.map((v, i) => {
        const g = ctx.block(null, { w: 0.66, h: 1, d: 0.66, r: 0.08, color: PAL.ink });
        g.scale.y = v * HS; g.position.set(xOf(i), (v * HS) / 2, 0);
        const lbl = ctx.label(String(v), { size: 0.3, color: PAL.label, weight: 700 });
        lbl.position.set(xOf(i), v * HS + 0.28, 0);
        ctx.root.add(g, lbl);
        return { g, lbl, v };
      });
      cmps = 0; writes = 0; stats();
      ctx.say(`<b>${ALGOS[algo].name}</b>: ${ALGOS[algo].note}`, ALGOS[algo].cx);
      ctx.kick();
    }
    function stats() { ctx.stat('c', 'comparisons', cmps); ctx.stat('w', algo === 'merge' ? 'writes' : 'swaps', writes); }
    const col = (i, c, ms) => bars[i] && ctx.colorTo(bars[i].g.userData.mat, c, ms || 90);
    async function apply(op) {
      const [t, i, j] = op;
      if (t === 'cmp') {
        cmps++; stats();
        const ci = bars[i].done ? null : col(i, PAL.accent), cj = bars[j].done ? null : col(j, PAL.accent);
        await Promise.all([ci, cj]);
        await ctx.wait(70);
        if (!bars[i].done && !bars[i].piv) col(i, PAL.ink, 60);
        if (!bars[j].done && !bars[j].piv) col(j, PAL.ink, 60);
      } else if (t === 'swap') {
        writes++; stats();
        const A = bars[i], B = bars[j];
        const xi = xOf(i), xj = xOf(j);
        await Promise.all([
          ctx.tween(A.g.position, { x: xj }, 240), ctx.tween(B.g.position, { x: xi }, 240),
          ctx.tween(A.lbl.position, { x: xj }, 240), ctx.tween(B.lbl.position, { x: xi }, 240),
        ]);
        bars[i] = B; bars[j] = A;
      } else if (t === 'set') {
        writes++; stats();
        const b = bars[i];
        b.v = j;
        await col(i, PAL.cyan, 60);
        await Promise.all([ctx.tween(b.g.scale, { y: j * HS }, 160), ctx.tween(b.g.position, { y: (j * HS) / 2 }, 160), ctx.tween(b.lbl.position, { y: j * HS + 0.28 }, 160)]);
        b.lbl.userData.set(String(j));
        col(i, PAL.ink, 120);
      } else if (t === 'count') { cmps++; stats(); }
      else if (t === 'done') { bars[i].done = true; await col(i, PAL.mint, 120); }
      else if (t === 'pivot') { bars[i].piv = true; await col(i, PAL.violet, 100); }
      else if (t === 'unpivot') { bars[i].piv = false; if (!bars[i].done) await col(i, PAL.ink, 80); }
      else if (t === 'range') {
        bars.forEach((b, k) => { if (!b.done && !b.piv) col(k, k >= i && k <= j ? PAL.ink : PAL.dim, 150); });
        await ctx.wait(120);
      }
    }
    async function play(stepOnly) {
      if (finished) build();
      if (!flow) {
        flow = D3.flow(ctx);
        flow.it = GENS[algo](vals.slice());
      }
      const f = flow;
      if (stepOnly) f.step(); else f.play();
      if (f.running) return;
      f.running = true;
      for (;;) {
        const ok = await f.gate();
        if (!ok || f !== flow) return;
        const nx = f.it.next();
        if (nx.done) break;
        await apply(nx.value);
        if (f !== flow) return;
      }
      f.running = false;
      finished = true;
      bars.forEach((b, k) => col(k, PAL.mint, 200));
      ctx.say(`<b>${ALGOS[algo].name}</b> finished: <b>${cmps}</b> comparisons and <b>${writes}</b> ${algo === 'merge' ? 'writes' : 'swaps'} for ${N} items. Try another algorithm on the same kind of input and compare the counters.`, ALGOS[algo].cx);
    }

    const algoSel = ctx.select(Object.keys(ALGOS).map((k) => [k, ALGOS[k].name]), { label: 'algorithm', value: algo });
    const dataSel = ctx.select([['random', 'random order'], ['nearly', 'nearly sorted'], ['reversed', 'reversed'], ['few', 'few distinct values']], { label: 'input' });
    algoSel.addEventListener('change', () => { algo = algoSel.value; build(); });
    dataSel.addEventListener('change', () => build());
    ctx.group(algoSel, dataSel);
    ctx.group(
      ctx.button('Play', () => { play(false); }, { primary: true, always: true, icon: 'play' }),
      ctx.button('Pause', () => { if (flow) flow.pause(); }, { always: true, icon: 'pause' }),
      ctx.button('Step', () => { play(true); }, { always: true, icon: 'next' }),
      ctx.button('Shuffle', () => build(), { always: true, icon: 'shuffle' }),
      ctx.speedControl());
    ctx.legend([[PAL.accent, 'comparing'], [PAL.violet, 'pivot / current min'], [PAL.cyan, 'written'], [PAL.mint, 'in final place'], [PAL.dim, 'outside current range']]);
    build('random');
    return ctx;
  };
})();

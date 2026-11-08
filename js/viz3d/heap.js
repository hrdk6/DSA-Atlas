/* 3D: binary min-heap shown twice: as the tree you reason about and as the
   flat Python list that heapq actually stores. Push sifts up, pop sifts down,
   and both views swap together. */
(function () {
  'use strict';
  const DSA = window.DSA;
  DSA.scenes3d.heap = function (container, o) {
    const D3 = DSA.d3;
    const ctx = D3.stage(container, Object.assign({ title: 'Min-heap: a tree that lives inside a Python list', camera: [0, 5.4, 14.6], target: [0, 2.9, 0.4], height: 500 }, o));
    if (ctx.fallback) return ctx;
    const { THREE, PAL } = ctx;
    const MAX = 15, W = 13, AZ = 2.6, ASP = 1.05;
    let items = []; /* {v, ball, cube} */
    let edges = [], idxL = [], steps = 0;

    const tpos = (i) => {
      const d = Math.floor(Math.log2(i + 1)), p = i - (Math.pow(2, d) - 1), cnt = Math.pow(2, d);
      return { x: (p + 0.5) * (W / cnt) - W / 2, y: 6.3 - d * 1.45, z: -1.2 };
    };
    const apos = (i) => ({ x: (i - (MAX - 1) / 2) * ASP, y: 0.45, z: AZ });
    for (let i = 0; i < MAX; i++) {
      const l = ctx.label(String(i), { size: 0.26, color: PAL.label, weight: 600 });
      const p = apos(i); l.position.set(p.x, 0.1, AZ + 0.75);
      ctx.root.add(l); idxL.push(l);
      const pad = ctx.block(null, { w: 0.92, h: 0.05, d: 0.92, r: 0.06, color: PAL.ghost, opacity: 0.3 });
      pad.position.set(p.x, 0.025, AZ); pad.userData.mesh.castShadow = false;
      ctx.root.add(pad);
    }
    const listLbl = ctx.label('heap list (what heapq stores)', { size: 0.3, color: PAL.label, weight: 600 });
    listLbl.position.set(0, 0.1, AZ + 1.35);
    ctx.root.add(listLbl);

    function syncEdges() {
      for (const e of edges) ctx.root.remove(e);
      edges = [];
      for (let i = 1; i < items.length; i++) {
        const e = ctx.edge(PAL.edge, 0.035);
        const a = tpos((i - 1) >> 1), b = tpos(i);
        e.set(new THREE.Vector3(a.x, a.y, a.z), new THREE.Vector3(b.x, b.y, b.z));
        ctx.root.add(e); edges.push(e);
      }
      ctx.kick();
    }
    function make(v, i) {
      const ball = ctx.ball(v, { r: 0.44, color: PAL.ink, labelSize: 0.36 });
      const cube = ctx.block(v, { w: 0.85, h: 0.85, d: 0.85, r: 0.12, color: PAL.ink, labelSize: 0.34 });
      const t = tpos(i), a = apos(i);
      ball.position.set(t.x, t.y, t.z); cube.position.set(a.x, a.y, a.z);
      ctx.root.add(ball, cube);
      return { v, ball, cube };
    }
    function clear() { for (const it of items) ctx.root.remove(it.ball, it.cube); items = []; syncEdges(); }
    function stats() { ctx.stat('steps', 'swaps / compares', steps); ctx.stat('n', 'size', items.length); ctx.stat('min', 'heap[0]', items.length ? items[0].v : '—'); }
    const tick = () => { steps++; stats(); };
    const color = (it, c, ms) => Promise.all([ctx.colorTo(it.ball.userData.mat, c, ms || 160), ctx.colorTo(it.cube.userData.mat, c, ms || 160)]);
    async function swap(i, j) {
      const A = items[i], B = items[j];
      const ti = tpos(i), tj = tpos(j), ai = apos(i), aj = apos(j);
      await Promise.all([
        ctx.moveTo(A.ball, tj, 420), ctx.moveTo(B.ball, ti, 420),
        ctx.moveTo(A.cube, { x: aj.x, y: 1.4 }, 210).then(() => ctx.moveTo(A.cube, { y: 0.45 }, 210)),
        ctx.moveTo(B.cube, { x: ai.x, y: 1.4 }, 210).then(() => ctx.moveTo(B.cube, { y: 0.45 }, 210)),
      ]);
      items[i] = B; items[j] = A;
      tick();
    }
    async function siftUp(i) {
      while (i > 0 && ctx.alive) {
        const p = (i - 1) >> 1;
        await Promise.all([color(items[i], PAL.accent), color(items[p], PAL.violet)]);
        tick();
        if (items[i].v < items[p].v) {
          ctx.say(`Index ${i}'s parent is <code>(${i} - 1) // 2 = ${p}</code>. <b>${items[i].v} &lt; ${items[p].v}</b>, so swap upward.`, 'O(log n)');
          await ctx.wait(450);
          await swap(i, p);
          await color(items[i], PAL.ink);
          i = p;
        } else {
          ctx.say(`<b>${items[i].v} ≥ ${items[p].v}</b> (its parent): heap order holds, stop sifting.`, 'O(log n)');
          await ctx.wait(450);
          await Promise.all([color(items[i], PAL.ink), color(items[p], PAL.ink)]);
          return;
        }
      }
      if (items[i]) await color(items[i], PAL.ink);
    }
    async function siftDown(i) {
      const n = items.length;
      while (ctx.alive) {
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l >= n) break;
        let m = l;
        await color(items[l], PAL.violet);
        if (r < n) { await color(items[r], PAL.violet); tick(); if (items[r].v < items[l].v) m = r; }
        await color(items[i], PAL.accent);
        tick();
        ctx.say(`Children of index ${i} are <code>2·${i}+1 = ${l}</code>${r < n ? ` and <code>2·${i}+2 = ${r}</code>` : ''}. The smaller child is <b>${items[m].v}</b>.`, 'O(log n)');
        await ctx.wait(500);
        for (const k of [l, r]) if (k < n && k !== m) color(items[k], PAL.ink);
        if (items[m].v < items[i].v) {
          await swap(i, m);
          await color(items[i], PAL.ink);
          i = m;
        } else {
          ctx.say(`<b>${items[i].v} ≤ ${items[m].v}</b>: heap order restored.`, 'O(log n)');
          await ctx.wait(400);
          await Promise.all([color(items[i], PAL.ink), color(items[m], PAL.ink)]);
          return;
        }
      }
      if (items[i]) await color(items[i], PAL.ink);
    }
    async function push(v) {
      steps = 0; stats();
      if (items.length >= MAX) { ctx.say('Demo limit is 15 items. Pop a few first.'); return; }
      const i = items.length;
      const it = make(v, i);
      const t = tpos(i), a = apos(i);
      it.ball.position.y = t.y + 2.5; it.cube.position.y = 3;
      items.push(it);
      syncEdges();
      await color(it, PAL.mint, 1);
      ctx.say(`<code>heapq.heappush(h, ${v})</code>: append at the end of the list (index ${i}), which is the next free spot in the tree.`, 'O(log n)');
      await Promise.all([ctx.moveTo(it.ball, { y: t.y }, 420, D3.ease.back), ctx.moveTo(it.cube, { y: a.y }, 420, D3.ease.back)]);
      await ctx.wait(300);
      await siftUp(i);
      ctx.say(`Done in ${steps} steps. A heap of n items is only log₂ n levels tall, so at most that many swaps.`, 'O(log n)');
      stats();
    }
    async function pop() {
      steps = 0; stats();
      if (!items.length) { ctx.say('<code>heappop</code> on an empty heap raises IndexError.'); return; }
      const top = items[0];
      await color(top, PAL.mint);
      ctx.say(`<code>heapq.heappop(h)</code> returns <b>${top.v}</b>: the minimum is always at index 0.`, 'O(log n)');
      await Promise.all([ctx.moveTo(top.ball, { y: 8.5 }, 450), ctx.moveTo(top.cube, { y: 3.5 }, 450)]);
      ctx.root.remove(top.ball, top.cube);
      const last = items.pop();
      if (!items.length) { syncEdges(); stats(); return; }
      if (last === top) { syncEdges(); stats(); return; }
      items[0] = last;
      syncEdges();
      ctx.say('Move the <b>last</b> element into the root\'s place (cheap: no shifting), then sift it down.', 'O(log n)');
      const t = tpos(0), a = apos(0);
      await color(last, PAL.accent);
      await Promise.all([ctx.moveTo(last.ball, t, 500), ctx.moveTo(last.cube, { x: a.x, y: 1.4 }, 250).then(() => ctx.moveTo(last.cube, { y: 0.45 }, 250))]);
      await siftDown(0);
      ctx.say(`Popped <b>${top.v}</b>. New minimum: <b>${items[0].v}</b>. Repeated pops come out in sorted order: that is heap sort.`, 'O(log n)');
      stats();
    }
    function randomHeap(n) {
      clear();
      const vals = Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 5);
      const h = [];
      for (const v of vals) { h.push(v); let i = h.length - 1; while (i > 0 && h[(i - 1) >> 1] > h[i]) { const p = (i - 1) >> 1; [h[i], h[p]] = [h[p], h[i]]; i = p; } }
      items = h.map((v, i) => make(v, i));
      syncEdges(); steps = 0; stats();
    }

    const vIn = ctx.input(4, { type: 'number', label: 'value' });
    const val = () => { const v = parseInt(vIn.value, 10); return Number.isFinite(v) ? Math.max(-99, Math.min(999, v)) : 0; };
    ctx.group(DSA.h('label', null, 'value', vIn));
    ctx.group(ctx.button('heappush', () => push(val()), { primary: true }), ctx.button('heappop', pop));
    ctx.group(ctx.button('Random heap', async () => { randomHeap(8); ctx.say('Every parent is ≤ its children, but siblings are in no particular order. That loose rule is what makes push and pop cheap.'); }, { icon: 'shuffle' }), ctx.speedControl());
    ctx.legend([[PAL.accent, 'moving item'], [PAL.violet, 'compared with'], [PAL.mint, 'new / popped']]);
    items = [3, 9, 5, 14, 10, 8, 7].map((v, i) => make(v, i));
    syncEdges(); stats();
    ctx.say('Parent of index <code>i</code> is <code>(i−1)//2</code>; children are <code>2i+1</code> and <code>2i+2</code>. No pointers needed. Try <b>heappush</b> with a small number.');
    return ctx;
  };
})();

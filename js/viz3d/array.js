/* 3D: a Python list as a contiguous block of memory.
   Shows why indexing is O(1) but inserting/deleting in the middle is O(n),
   how the list grows (amortized O(1) append), and binary search. */
(function () {
  'use strict';
  const DSA = window.DSA;
  DSA.scenes3d.array = function (container, o) {
    const D3 = DSA.d3;
    const ctx = D3.stage(container, Object.assign({ title: 'A Python list is one contiguous block of memory', camera: [0, 4.8, 10.6], target: [0, 0.6, 0.5], height: 430 }, o));
    if (ctx.fallback) return ctx;
    const { THREE, PAL } = ctx;
    const SP = 1.25, MAXCAP = 16;
    let cap = 8, steps = 0;
    let blocks = [];
    let slots = [], idxL = [], addrL = [];
    const xOf = (i, c) => (i - ((c || cap) - 1) / 2) * SP;

    function makeSlots(c, z) {
      const arr = [], il = [], al = [];
      for (let i = 0; i < c; i++) {
        const pad = ctx.block(null, { w: 1.1, h: 0.06, d: 1.1, r: 0.08, color: PAL.ghost, opacity: 0.35 });
        pad.position.set(xOf(i, c), 0.03, z || 0);
        pad.userData.mesh.castShadow = false;
        ctx.root.add(pad); arr.push(pad);
        const li = ctx.label(String(i), { size: 0.34, color: PAL.label, weight: 600 });
        li.position.set(xOf(i, c), 0.12, (z || 0) + 0.95);
        const la = ctx.label('0x' + (0x7f00 + i * 8).toString(16), { size: 0.22, color: PAL.dim, weight: 500 });
        la.position.set(xOf(i, c), 0.12, (z || 0) + 1.35);
        ctx.root.add(li, la); il.push(li); al.push(la);
      }
      return { arr, il, al };
    }
    function clearSlots(s) { for (const x of s.arr.concat(s.il, s.al)) ctx.root.remove(x); }
    let S = makeSlots(cap, 0);

    const pointer = new THREE.Group();
    const pMat = ctx.stdMat(PAL.accent);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 20), pMat);
    cone.rotation.x = Math.PI; cone.castShadow = true;
    const pLbl = ctx.label('i', { size: 0.34, color: '#1b1102', bg: PAL.accent });
    pLbl.position.y = 0.55;
    pointer.add(cone, pLbl);
    pointer.position.set(0, 2.05, 0);
    pointer.visible = false;
    ctx.root.add(pointer);
    function flag(text, color) {
      const g = new THREE.Group();
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 16), ctx.stdMat(color));
      c.rotation.x = Math.PI;
      const l = ctx.label(text, { size: 0.28, color: '#ffffff', bg: color });
      l.position.y = 0.4;
      g.add(c, l); g.visible = false; ctx.root.add(g);
      return g;
    }
    const loF = flag('lo', PAL.violet), hiF = flag('hi', PAL.cyan);

    function addBlock(v, i, y) {
      const b = ctx.block(v, { color: PAL.ink });
      b.position.set(xOf(i), y == null ? 0.5 : y, 0);
      ctx.root.add(b);
      return b;
    }
    function setVals(vs) {
      for (const b of blocks) ctx.root.remove(b);
      blocks = vs.map((v, i) => addBlock(v, i));
      ctx.kick();
    }
    function stats() { ctx.stat('steps', 'steps', steps); ctx.stat('len', 'len / capacity', blocks.length + ' / ' + cap); }
    const tick = () => { steps++; stats(); };
    async function showPointer(i, text) {
      pLbl.userData.set(text || 'i=' + i);
      if (!pointer.visible) { pointer.position.x = xOf(i); pointer.visible = true; pointer.scale.set(0.01, 0.01, 0.01); await ctx.scaleTo(pointer, 1, 200); }
      else await ctx.moveTo(pointer, { x: xOf(i) }, 300);
    }
    function hideMarks() { pointer.visible = false; loF.visible = false; hiF.visible = false; for (const b of blocks) { b.userData.mat.color.set(PAL.ink); } ctx.kick(); }
    async function bounce(b, color) {
      if (color) ctx.colorTo(b.userData.mat, color, 200);
      await ctx.moveTo(b, { y: 1.0 }, 160, D3.ease.out);
      await ctx.moveTo(b, { y: 0.5 }, 220, D3.ease.back);
    }
    function readIdx(inp, max) {
      const i = parseInt(inp.value, 10);
      if (!Number.isInteger(i) || i < 0 || i > max) { ctx.say(`Pick an index from <b>0</b> to <b>${max}</b>.`); return null; }
      return i;
    }
    function readVal(inp) {
      const v = parseInt(inp.value, 10);
      if (!Number.isFinite(v)) { ctx.say('Type a number in the value box.'); return null; }
      return Math.max(-99, Math.min(999, v));
    }

    async function grow() {
      if (cap * 2 > MAXCAP) return false;
      const nc = cap * 2;
      ctx.say(`The list is full (capacity ${cap}). Python allocates a <b>bigger block</b> and <b>copies every element</b> across. Expensive, but rare.`, 'O(n)');
      const NS = makeSlots(nc, -2.6);
      await ctx.wait(350);
      for (let i = 0; i < blocks.length; i++) {
        await ctx.moveTo(blocks[i], { x: xOf(i, nc), y: 1.4, z: -1.3 }, 160);
        await ctx.moveTo(blocks[i], { y: 0.5, z: -2.6 }, 160);
        tick();
      }
      clearSlots(S);
      cap = nc;
      const all = blocks.concat(NS.arr, NS.il, NS.al);
      await Promise.all(all.map((x) => ctx.moveTo(x, { z: x.position.z + 2.6 }, 500)));
      S = NS;
      stats();
      ctx.lookAt([0, 0.6, 0.5], [0, 8, 18.5], 800);
      return true;
    }

    /* -------------------------------------------------------------- ops */
    async function access(i) {
      hideMarks(); steps = 0; tick();
      ctx.say(`<code>arr[${i}]</code>: address = start + ${i} × 8 bytes = <code>0x${(0x7f00 + i * 8).toString(16)}</code>. One multiplication jumps straight there, however long the list is.`, 'O(1)');
      await showPointer(i, 'arr[' + i + ']');
      await bounce(blocks[i], PAL.accent);
    }
    async function search(x) {
      hideMarks(); steps = 0; stats();
      for (let i = 0; i < blocks.length; i++) {
        if (!ctx.alive) return;
        await showPointer(i);
        tick();
        const b = blocks[i];
        ctx.say(`Is <code>arr[${i}] == ${x}</code>? Linear search checks the cells one by one.`, 'O(n)');
        await ctx.colorTo(b.userData.mat, PAL.accent, 180);
        if (b.userData.value === x) {
          await ctx.colorTo(b.userData.mat, PAL.mint, 200);
          await bounce(b);
          ctx.say(`Found <b>${x}</b> at index <b>${i}</b> after ${steps} comparison${steps > 1 ? 's' : ''}. Worst case it looks at all n cells.`, 'O(n)');
          return;
        }
        await ctx.colorTo(b.userData.mat, PAL.ink, 160);
      }
      ctx.say(`<b>${x}</b> is not in the list. We had to check all ${blocks.length} cells to be sure.`, 'O(n)');
    }
    async function insert(i, v) {
      hideMarks(); steps = 0; stats();
      if (blocks.length === cap && !(await grow())) { ctx.say('Display limit reached. Delete something first.'); return; }
      ctx.say(`Insert <b>${v}</b> at index <b>${i}</b>: every element from index ${i} onward must shift one cell right to make room.`, 'O(n)');
      for (let j = blocks.length - 1; j >= i; j--) {
        await ctx.colorTo(blocks[j].userData.mat, PAL.accent, 100);
        await ctx.moveTo(blocks[j], { x: xOf(j + 1) }, 230);
        ctx.colorTo(blocks[j].userData.mat, PAL.ink, 150);
        tick();
      }
      const nb = addBlock(v, i, 3.2);
      nb.userData.mat.color.set(PAL.mint);
      blocks.splice(i, 0, nb);
      await ctx.moveTo(nb, { y: 0.5 }, 420, D3.ease.back);
      tick();
      ctx.colorTo(nb.userData.mat, PAL.ink, 400);
      ctx.say(`Inserted with <b>${steps}</b> moves. Inserting at the front of n items costs n shifts: that is why <code>list.insert(0, x)</code> is slow and <code>deque.appendleft(x)</code> exists.`, 'O(n)');
    }
    async function append(v) {
      hideMarks(); steps = 0; stats();
      const grew = blocks.length === cap;
      if (grew && !(await grow())) { ctx.say('Display limit reached. Delete something first.'); return; }
      const nb = addBlock(v, blocks.length, 3.2);
      nb.userData.mat.color.set(PAL.mint);
      blocks.push(nb);
      await ctx.moveTo(nb, { y: 0.5 }, 420, D3.ease.back);
      tick();
      ctx.colorTo(nb.userData.mat, PAL.ink, 400);
      ctx.say(grew ? `Append triggered a resize (${steps} steps), but that happens rarely: averaged over many appends each one is still constant time, or <b>amortized O(1)</b>.`
        : `<code>append(${v})</code> drops into the next free cell. Nothing else moves.`, 'O(1)');
    }
    async function removeAt(i) {
      hideMarks(); steps = 0; stats();
      const b = blocks[i];
      ctx.say(`Delete index <b>${i}</b>: remove it, then shift everything after it one cell left to close the gap.`, 'O(n)');
      await ctx.colorTo(b.userData.mat, PAL.coral, 160);
      await ctx.moveTo(b, { y: 2.6 }, 300);
      await ctx.scaleTo(b, 0.01, 200);
      ctx.root.remove(b);
      blocks.splice(i, 1);
      tick();
      for (let j = i; j < blocks.length; j++) {
        await ctx.colorTo(blocks[j].userData.mat, PAL.accent, 90);
        await ctx.moveTo(blocks[j], { x: xOf(j) }, 220);
        ctx.colorTo(blocks[j].userData.mat, PAL.ink, 150);
        tick();
      }
      ctx.say(`Deleted with <b>${steps}</b> steps. Removing the <i>last</i> element (<code>pop()</code>) needs no shifting at all.`, 'O(n)');
    }
    async function pop() {
      hideMarks(); steps = 0; stats();
      if (!blocks.length) { ctx.say('The list is empty: <code>pop()</code> would raise IndexError.'); return; }
      const b = blocks.pop();
      await ctx.colorTo(b.userData.mat, PAL.coral, 150);
      await ctx.moveTo(b, { y: 2.6 }, 300);
      await ctx.scaleTo(b, 0.01, 180);
      ctx.root.remove(b);
      tick();
      ctx.say(`<code>pop()</code> returned <b>${b.userData.value}</b>. The end of the list is free to change: nothing shifts.`, 'O(1)');
    }
    async function sortAll() {
      hideMarks();
      const order = blocks.slice().sort((a, b) => a.userData.value - b.userData.value);
      blocks = order;
      await Promise.all(blocks.map((b, i) => ctx.moveTo(b, { x: xOf(i) }, 600)));
      ctx.say('Sorted. Python uses Timsort, which is O(n log n). Binary search needs sorted data.', 'O(n log n)');
    }
    function isSorted() { for (let i = 1; i < blocks.length; i++) if (blocks[i - 1].userData.value > blocks[i].userData.value) return false; return true; }
    async function bsearch(x) {
      hideMarks(); steps = 0; stats();
      if (!isSorted()) { await sortAll(); await ctx.wait(500); }
      let lo = 0, hi = blocks.length - 1;
      loF.visible = hiF.visible = true;
      loF.position.set(xOf(lo), 1.55, 0.25); hiF.position.set(xOf(hi), 1.55, 0.25);
      while (lo <= hi && ctx.alive) {
        const mid = (lo + hi) >> 1;
        await Promise.all([ctx.moveTo(loF, { x: xOf(lo) }, 280), ctx.moveTo(hiF, { x: xOf(hi) }, 280)]);
        await showPointer(mid, 'mid=' + mid);
        tick();
        const mv = blocks[mid].userData.value;
        await ctx.colorTo(blocks[mid].userData.mat, PAL.accent, 180);
        if (mv === x) {
          await ctx.colorTo(blocks[mid].userData.mat, PAL.mint, 200);
          await bounce(blocks[mid]);
          ctx.say(`Found <b>${x}</b> at index ${mid} in <b>${steps}</b> step${steps > 1 ? 's' : ''}. Each step halves the search range, so 1,000,000 items need at most about 20 steps.`, 'O(log n)');
          return;
        }
        if (mv < x) {
          ctx.say(`<code>arr[${mid}] = ${mv} &lt; ${x}</code> → the answer can only be to the right. Discard the left half: <code>lo = mid + 1</code>.`, 'O(log n)');
          for (let j = lo; j <= mid; j++) ctx.colorTo(blocks[j].userData.mat, PAL.dim, 250);
          lo = mid + 1;
        } else {
          ctx.say(`<code>arr[${mid}] = ${mv} &gt; ${x}</code> → the answer can only be to the left. Discard the right half: <code>hi = mid - 1</code>.`, 'O(log n)');
          for (let j = mid; j <= hi; j++) ctx.colorTo(blocks[j].userData.mat, PAL.dim, 250);
          hi = mid - 1;
        }
        await ctx.wait(700);
      }
      ctx.say(`<b>${x}</b> is not here: <code>lo</code> passed <code>hi</code> after ${steps} steps. (Python's <code>bisect.bisect_left</code> would return ${lo}, where ${x} belongs.)`, 'O(log n)');
    }
    async function randomize() {
      hideMarks(); steps = 0;
      const n = 5 + Math.floor(Math.random() * 3);
      const vs = Array.from({ length: n }, () => Math.floor(Math.random() * 40) + 1);
      clearSlots(S); cap = 8; S = makeSlots(cap, 0);
      setVals(vs); stats();
      ctx.say('New list. Try <b>Access</b> (instant), then <b>Insert at 0</b> (everything shifts) and compare the step counters.');
    }

    /* -------------------------------------------------------------- UI */
    const iIn = ctx.input(2, { type: 'number', label: 'index', min: 0 });
    const vIn = ctx.input(42, { type: 'number', label: 'value' });
    ctx.group(DSA.h('label', null, 'index', iIn), DSA.h('label', null, 'value', vIn));
    ctx.group(
      ctx.button('Access arr[i]', async () => { const i = readIdx(iIn, blocks.length - 1); if (i != null) await access(i); }, { primary: true }),
      ctx.button('Search value', async () => { const v = readVal(vIn); if (v != null) await search(v); }),
      ctx.button('Binary search', async () => { const v = readVal(vIn); if (v != null) await bsearch(v); }));
    ctx.group(
      ctx.button('Insert at i', async () => { const i = readIdx(iIn, blocks.length); const v = readVal(vIn); if (i != null && v != null) await insert(i, v); }),
      ctx.button('Append', async () => { const v = readVal(vIn); if (v != null) await append(v); }),
      ctx.button('Delete at i', async () => { const i = readIdx(iIn, blocks.length - 1); if (i != null) await removeAt(i); }),
      ctx.button('Pop', pop));
    ctx.group(ctx.button('Sort', sortAll), ctx.button('New list', randomize, { icon: 'shuffle' }), ctx.speedControl());
    ctx.legend([[PAL.accent, 'being read / moved'], [PAL.mint, 'found / new'], [PAL.coral, 'removed'], [PAL.dim, 'ruled out']]);

    setVals([12, 5, 31, 8, 19]);
    stats();
    ctx.say('Each cell sits right next to the previous one in memory (see the addresses). Pick an index and press <b>Access arr[i]</b>.');
    return ctx;
  };
})();

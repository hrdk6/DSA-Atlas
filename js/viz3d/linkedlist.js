/* 3D: singly linked list. Nodes are scattered in memory (random depth) and
   connected only by "next" pointers. Shows O(1) prepend, O(n) traversal,
   splicing, deletion and the classic prev/curr/nxt reversal. */
(function () {
  'use strict';
  const DSA = window.DSA;
  DSA.scenes3d.linkedlist = function (container, o) {
    const D3 = DSA.d3;
    const ctx = D3.stage(container, Object.assign({ title: 'Linked list: nodes scattered in memory, joined by pointers', camera: [0, 5.6, 11.5], target: [0, 0.7, 0], height: 440 }, o));
    if (ctx.fallback) return ctx;
    const { THREE, PAL } = ctx;
    const GAP = 2.35;
    const lg = new THREE.Group();
    ctx.root.add(lg);
    let head = null, steps = 0;
    const all = new Set();

    function makeNode(v) {
      const g = new THREE.Group();
      const body = ctx.block(v, { w: 1.0, h: 0.9, d: 0.9, color: PAL.ink });
      const nx = ctx.block(null, { w: 0.42, h: 0.9, d: 0.9, r: 0.12, color: PAL.inkDeep });
      nx.position.x = 0.74;
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), ctx.stdMat('#ffffff'));
      dot.position.set(0.74, 0, 0.46);
      g.add(body, nx, dot);
      g.position.y = 0.45;
      g.userData = { val: v, body, next: null, z: (Math.random() - 0.5) * 2.2, straight: ctx.arrow(PAL.edge), arc: ctx.curve(PAL.edge), noneLbl: ctx.label('None', { size: 0.3, color: PAL.label, weight: 600 }) };
      lg.add(g, g.userData.straight, g.userData.arc, g.userData.noneLbl);
      all.add(g);
      return g;
    }
    function dropNode(g) {
      all.delete(g);
      lg.remove(g, g.userData.straight, g.userData.arc, g.userData.noneLbl);
    }
    const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
    function updateLinks() {
      for (const n of all) {
        const u = n.userData;
        tmpA.set(n.position.x + 0.74, n.position.y, n.position.z + 0.0);
        if (u.next) {
          const t = u.next.position;
          if (t.x > n.position.x + 0.9) {
            tmpB.set(t.x - 0.56, t.y, t.z);
            u.straight.set(tmpA, tmpB); u.straight.visible = true; u.arc.visible = false;
          } else {
            tmpB.set(t.x, t.y + 0.5, t.z);
            const key = [tmpA.x, tmpA.z, tmpB.x, tmpB.z].map((x) => x.toFixed(2)).join();
            if (u.arcKey !== key) { u.arc.set(tmpA.clone(), tmpB.clone(), 1.3); u.arcKey = key; }
            u.arc.visible = true; u.straight.visible = false;
          }
          u.noneLbl.visible = false;
        } else {
          tmpB.set(tmpA.x + 0.75, tmpA.y, tmpA.z);
          u.straight.set(tmpA, tmpB); u.straight.visible = true; u.arc.visible = false;
          u.noneLbl.visible = true;
          u.noneLbl.position.set(tmpA.x + 1.2, tmpA.y, tmpA.z);
        }
      }
      placePointers();
    }

    /* -- named pointers: head / prev / curr / nxt -- */
    const ptrs = {};
    function makePtr(name, color, height) {
      const g = new THREE.Group();
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.34, 18), ctx.stdMat(color));
      c.rotation.x = Math.PI;
      const l = ctx.label(name, { size: 0.3, color: '#ffffff', bg: color });
      l.position.y = 0.42;
      g.add(c, l);
      g.visible = false;
      lg.add(g);
      ptrs[name] = { g, target: null, height, spot: null };
    }
    makePtr('head', PAL.mint, 1.35);
    makePtr('prev', PAL.violet, 1.35);
    makePtr('curr', PAL.accent, 1.35);
    makePtr('nxt', PAL.cyan, 2.05);
    function placePointers() {
      for (const k in ptrs) {
        const p = ptrs[k];
        if (!p.g.visible) continue;
        let pos = null;
        if (p.target && p.target.position) pos = p.target.position;
        else if (p.spot) pos = p.spot;
        if (!pos) continue;
        let hgt = p.height;
        if (k === 'head' && ptrs.curr.g.visible && ptrs.curr.target === p.target) hgt = 2.05;
        if (k === 'prev' && ptrs.head.g.visible && ptrs.head.target === p.target) hgt = 2.05;
        p.g.position.set(pos.x, hgt, pos.z);
      }
    }
    function setPtr(name, node, spot) {
      const p = ptrs[name];
      p.target = node || null;
      p.spot = node ? null : spot || null;
      p.g.visible = !!(node || spot);
      placePointers();
    }
    const noneSpot = () => { const first = chain()[0]; return new THREE.Vector3(first ? first.position.x - GAP : 0, 0.45, 0); };
    function hideTemp() { setPtr('prev', null); setPtr('curr', null); setPtr('nxt', null); for (const n of all) n.userData.body.userData.mat.color.set(PAL.ink); }

    function chain() {
      const out = [], seen = new Set();
      let c = head;
      while (c && !seen.has(c)) { out.push(c); seen.add(c); c = c.userData.next; }
      return out;
    }
    async function layout(ms) {
      const ns = chain();
      const ps = ns.map((n, i) => ctx.moveTo(n, { x: i * GAP, y: 0.45, z: n.userData.z }, ms || 550));
      ps.push(ctx.tween(lg.position, { x: -((ns.length - 1) * GAP) / 2 - 0.4 }, ms || 550));
      await Promise.all(ps);
    }
    async function act(fn) {
      const stop = ctx.onTick(updateLinks);
      try { await fn(); } finally { stop(); updateLinks(); ctx.kick(); }
    }
    const tick = () => { steps++; ctx.stat('steps', 'steps', steps); };
    const flash = (n, color) => ctx.colorTo(n.userData.body.userData.mat, color, 180);

    function build(vals) {
      for (const n of Array.from(all)) dropNode(n);
      head = null;
      let prev = null;
      vals.forEach((v) => { const n = makeNode(v); if (prev) prev.userData.next = n; else head = n; prev = n; });
      chain().forEach((n, i) => n.position.set(i * GAP, 0.45, n.userData.z));
      lg.position.x = -((vals.length - 1) * GAP) / 2 - 0.4;
      hideTemp();
      setPtr('head', head);
      updateLinks();
      ctx.kick();
      ctx.stat('len', 'length', vals.length);
    }

    async function walk(k, label) {
      let c = head;
      setPtr('curr', c);
      await ctx.wait(250);
      for (let i = 0; i < k && c; i++) {
        tick();
        ctx.say(`${label || 'Walking'}: <code>curr = curr.next</code> (step ${i + 1}). There is no shortcut: to reach node ${k} you must follow ${k} pointers.`, 'O(n)');
        c = c.userData.next;
        if (!c) break;
        setPtr('curr', c);
        await ctx.wait(420);
      }
      return c;
    }
    async function prepend(v) {
      steps = 0; hideTemp();
      const n = makeNode(v);
      const first = chain()[0];
      n.position.set(first ? first.position.x - GAP : 0, 3.2, n.userData.z);
      n.userData.body.userData.mat.color.set(PAL.mint);
      ctx.say(`Create a node for <b>${v}</b>.`);
      await ctx.moveTo(n, { y: 0.45 }, 450, D3.ease.back);
      n.userData.next = head; tick();
      ctx.say(`<code>new.next = head</code>: the new node points at the old first node.`, 'O(1)');
      await ctx.wait(650);
      head = n; setPtr('head', head); tick();
      ctx.say(`<code>head = new</code>: done in <b>2 steps</b> regardless of length. Nothing else moved in memory.`, 'O(1)');
      await layout();
      flash(n, PAL.ink);
      ctx.stat('len', 'length', chain().length);
    }
    async function append(v) {
      steps = 0; hideTemp();
      if (!head) return prepend(v);
      const ns = chain();
      ctx.say('No tail pointer, so start at <code>head</code> and walk to the last node.');
      const last = await walk(ns.length - 1, 'Walking to the tail');
      const n = makeNode(v);
      n.position.set(last.position.x + GAP, 3.2, n.userData.z);
      n.userData.body.userData.mat.color.set(PAL.mint);
      await ctx.moveTo(n, { y: 0.45 }, 450, D3.ease.back);
      last.userData.next = n; tick();
      ctx.say(`<code>last.next = new</code>. The walk cost ${steps - 1} steps: append is O(n) here. Keep a <code>tail</code> pointer and it becomes O(1).`, 'O(n)');
      await layout();
      flash(n, PAL.ink); setPtr('curr', null);
      ctx.stat('len', 'length', chain().length);
    }
    async function insertAfter(i, v) {
      steps = 0; hideTemp();
      const ns = chain();
      if (i < 0 || i >= ns.length) { ctx.say(`Index must be between 0 and ${ns.length - 1}.`); return; }
      const c = await walk(i, 'Walking to node ' + i);
      const nextN = c.userData.next;
      const n = makeNode(v);
      n.userData.z = c.userData.z + (c.userData.z > 0 ? -2.0 : 2.0);
      n.position.set(c.position.x + GAP / 2, 3.2, n.userData.z);
      n.userData.body.userData.mat.color.set(PAL.mint);
      await ctx.moveTo(n, { y: 0.45 }, 450, D3.ease.back);
      n.userData.next = nextN; tick();
      ctx.say(`Step 1: <code>new.next = curr.next</code>. Point the new node at the rest of the list <i>first</i>, so nothing gets lost.`, 'O(1)');
      await ctx.wait(900);
      c.userData.next = n; tick();
      ctx.say(`Step 2: <code>curr.next = new</code>. Spliced in with 2 pointer changes; the cost was the walk to get here.`, 'O(n)');
      await ctx.wait(900);
      await layout();
      flash(n, PAL.ink); setPtr('curr', null);
      ctx.stat('len', 'length', chain().length);
    }
    async function deleteValue(v) {
      steps = 0; hideTemp();
      if (!head) { ctx.say('The list is empty.'); return; }
      if (head.userData.val === v) {
        const old = head; await flash(old, PAL.coral);
        head = old.userData.next; tick(); setPtr('head', head);
        ctx.say('Deleting the head is O(1): <code>head = head.next</code>.', 'O(1)');
        await ctx.moveTo(old, { y: -1.5 }, 450); dropNode(old);
        await layout(); ctx.stat('len', 'length', chain().length); return;
      }
      let prev = head;
      setPtr('curr', prev);
      while (prev.userData.next && prev.userData.next.userData.val !== v) {
        tick(); prev = prev.userData.next; setPtr('curr', prev);
        ctx.say(`Looking for the node <i>before</i> ${v}: <code>curr = curr.next</code>`, 'O(n)');
        await ctx.wait(420);
      }
      const target = prev.userData.next;
      if (!target) { ctx.say(`<b>${v}</b> is not in the list.`, 'O(n)'); setPtr('curr', null); return; }
      await flash(target, PAL.coral);
      prev.userData.next = target.userData.next; tick();
      ctx.say(`<code>curr.next = curr.next.next</code>: skip over ${v}. Nobody points at it now, so Python's garbage collector frees it.`, 'O(1)');
      await ctx.wait(800);
      await ctx.moveTo(target, { y: -1.5 }, 450);
      dropNode(target);
      await layout(); setPtr('curr', null);
      ctx.stat('len', 'length', chain().length);
    }
    async function search(v) {
      steps = 0; hideTemp();
      let c = head; let i = 0;
      while (c) {
        setPtr('curr', c); tick();
        await flash(c, PAL.accent);
        if (c.userData.val === v) {
          await flash(c, PAL.mint);
          ctx.say(`Found <b>${v}</b> at position ${i} after ${steps} step${steps > 1 ? 's' : ''}.`, 'O(n)');
          return;
        }
        ctx.say(`<code>curr.val = ${c.userData.val}</code>, not ${v}. Move on: <code>curr = curr.next</code>`, 'O(n)');
        await ctx.wait(350);
        flash(c, PAL.ink);
        c = c.userData.next; i++;
      }
      setPtr('curr', null, noneSpot());
      ctx.say(`Reached <code>None</code>: <b>${v}</b> is not in the list.`, 'O(n)');
    }
    async function reverse() {
      steps = 0; hideTemp();
      let prev = null, curr = head;
      setPtr('head', null);
      setPtr('prev', null, noneSpot());
      setPtr('curr', curr);
      ctx.say('Start: <code>prev = None</code>, <code>curr = head</code>. We will flip one arrow per step.');
      await ctx.wait(1100);
      while (curr && ctx.alive) {
        const nxt = curr.userData.next;
        if (nxt) setPtr('nxt', nxt); else setPtr('nxt', null, new THREE.Vector3(curr.position.x + GAP, 0.45, curr.position.z));
        ctx.say('<code>nxt = curr.next</code>: save the rest of the list before we break the link.', 'O(n)');
        await ctx.wait(900);
        curr.userData.next = prev; tick();
        await flash(curr, PAL.accent);
        ctx.say('<code>curr.next = prev</code>: flip this arrow to point backwards.', 'O(n)');
        await ctx.wait(1000);
        flash(curr, PAL.ink);
        prev = curr; curr = nxt;
        setPtr('prev', prev);
        if (curr) setPtr('curr', curr); else setPtr('curr', null, new THREE.Vector3(prev.position.x + GAP, 0.45, prev.position.z));
        ctx.say('<code>prev = curr</code>, <code>curr = nxt</code>: both pointers step forward.', 'O(n)');
        await ctx.wait(900);
      }
      head = prev;
      setPtr('nxt', null); setPtr('curr', null); setPtr('prev', null);
      setPtr('head', head);
      ctx.say(`<code>curr</code> is None, so <code>prev</code> is the new head. Reversed in one pass with ${steps} pointer flips and O(1) extra memory.`, 'O(n)');
      await ctx.wait(700);
      await layout(800);
    }

    const vIn = ctx.input(7, { type: 'number', label: 'value' });
    const iIn = ctx.input(1, { type: 'number', label: 'index', min: 0 });
    const val = () => { const v = parseInt(vIn.value, 10); return Number.isFinite(v) ? Math.max(-99, Math.min(999, v)) : 0; };
    const wrap = (fn) => () => act(fn);
    ctx.group(DSA.h('label', null, 'value', vIn), DSA.h('label', null, 'index', iIn));
    ctx.group(
      ctx.button('Reverse', wrap(reverse), { primary: true }),
      ctx.button('Prepend', wrap(() => prepend(val()))),
      ctx.button('Append', wrap(() => append(val()))),
      ctx.button('Insert after i', wrap(() => insertAfter(parseInt(iIn.value, 10) || 0, val()))));
    ctx.group(
      ctx.button('Delete value', wrap(() => deleteValue(val()))),
      ctx.button('Search', wrap(() => search(val()))),
      ctx.button('New list', wrap(async () => { build(Array.from({ length: 4 + Math.floor(Math.random() * 2) }, () => Math.floor(Math.random() * 50) + 1)); ctx.say('New list. Press <b>Reverse</b> to watch the three-pointer technique.'); }), { icon: 'shuffle' }),
      ctx.speedControl());
    ctx.legend([[PAL.mint, 'head / new node'], [PAL.accent, 'curr'], [PAL.violet, 'prev'], [PAL.cyan, 'nxt'], [PAL.coral, 'deleted']]);
    build([3, 8, 15, 4, 23]);
    ctx.say('Each node holds a value and a <b>next</b> pointer (the dark half). Nodes can live anywhere in memory. Try <b>Reverse</b>.');
    return ctx;
  };
})();

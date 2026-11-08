/* 3D: binary search tree. Insert/search walk one path from the root
   (O(height)), delete handles all three cases, and the four traversals
   number the nodes in visiting order. "Sorted inserts" builds the
   degenerate, linked-list-shaped tree that makes a BST O(n). */
(function () {
  'use strict';
  const DSA = window.DSA;
  DSA.scenes3d.bst = function (container, o) {
    const D3 = DSA.d3;
    const ctx = D3.stage(container, Object.assign({ title: 'Binary search tree: left < node < right, at every node', camera: [0, 5.2, 13.2], target: [0, 3.1, 0], height: 480 }, o));
    if (ctx.fallback) return ctx;
    const { THREE, PAL } = ctx;
    let root = null, steps = 0;
    const nodes = new Set();
    let marks = [];

    function mk(v) {
      const n = { val: v, left: null, right: null, parent: null, g: ctx.ball(v, { r: 0.42, color: PAL.ink, labelSize: 0.36 }), edge: ctx.edge(PAL.edge, 0.04) };
      ctx.root.add(n.g, n.edge);
      nodes.add(n);
      return n;
    }
    function drop(n) { nodes.delete(n); ctx.root.remove(n.g, n.edge); }
    const height = (n) => (n ? 1 + Math.max(height(n.left), height(n.right)) : -1);
    function targets() {
      const H = Math.max(0, height(root));
      const YS = H > 0 ? Math.min(1.3, 4.8 / H) : 1.3;
      const order = [];
      (function walk(n, d, parent) { if (!n) return; n.parent = parent; walk(n.left, d + 1, n); n.d = d; order.push(n); walk(n.right, d + 1, n); })(root, 0, null);
      const N = order.length;
      const XS = N > 1 ? Math.min(1.25, 13.5 / (N - 1)) : 1.25;
      order.forEach((n, i) => { n.t = { x: (i - (N - 1) / 2) * XS, y: 6.0 - n.d * YS, z: -n.d * 0.35 }; });
      return order;
    }
    function updateEdges() {
      for (const n of nodes) {
        if (n.parent) { n.edge.visible = true; n.edge.set(n.parent.g.position, n.g.position); }
        else n.edge.visible = false;
      }
    }
    async function relayout(ms) {
      const order = targets();
      await Promise.all(order.map((n) => ctx.moveTo(n.g, n.t, ms || 600)));
      stats();
    }
    async function act(fn) {
      const stop = ctx.onTick(updateEdges);
      try { await fn(); } finally { stop(); updateEdges(); ctx.kick(); }
    }
    function stats() {
      ctx.stat('steps', 'comparisons', steps);
      ctx.stat('h', 'height', Math.max(0, height(root)));
      ctx.stat('n', 'nodes', nodes.size);
    }
    const tick = () => { steps++; stats(); };
    function clearMarks() {
      for (const m of marks) ctx.root.remove(m);
      marks = [];
      for (const n of nodes) n.g.userData.mat.color.set(PAL.ink);
      ctx.kick();
    }
    const paint = (n, c, ms) => ctx.colorTo(n.g.userData.mat, c, ms || 180);

    function buildInstant(vals) {
      for (const n of Array.from(nodes)) drop(n);
      root = null;
      for (const v of vals) {
        if (!root) { root = mk(v); continue; }
        let c = root;
        for (;;) {
          if (v === c.val) break;
          const dir = v < c.val ? 'left' : 'right';
          if (!c[dir]) { c[dir] = mk(v); break; }
          c = c[dir];
        }
      }
      const order = targets();
      for (const n of order) n.g.position.set(n.t.x, n.t.y, n.t.z);
      updateEdges(); steps = 0; stats(); ctx.kick();
    }

    async function insert(v) {
      clearMarks(); steps = 0; stats();
      if (nodes.size >= 15) { ctx.say('This demo holds 15 nodes. Delete one or press <b>Random tree</b>.'); return; }
      const ghost = ctx.ball(v, { r: 0.42, color: PAL.mint, labelSize: 0.36 });
      ctx.root.add(ghost);
      if (!root) {
        ghost.position.set(0, 8, 0);
        ctx.root.remove(ghost);
        root = mk(v); root.g.position.set(0, 8, 0);
        await relayout();
        ctx.say(`Empty tree, so <b>${v}</b> becomes the root.`, 'O(1)');
        return;
      }
      ghost.position.set(root.g.position.x, root.g.position.y + 1.6, root.g.position.z);
      let c = root;
      for (;;) {
        await ctx.moveTo(ghost, { x: c.g.position.x, y: c.g.position.y + 1.0, z: c.g.position.z }, 380);
        tick();
        await paint(c, PAL.accent);
        if (v === c.val) {
          ctx.say(`<b>${v}</b> is already in the tree. A BST usually stores each key once.`, 'O(h)');
          await ctx.scaleTo(ghost, 0.01, 250); ctx.root.remove(ghost);
          return;
        }
        const dir = v < c.val ? 'left' : 'right';
        ctx.say(`<code>${v} ${v < c.val ? '&lt;' : '&gt;'} ${c.val}</code> → go <b>${dir}</b>. Half of the remaining tree is ruled out.`, 'O(h)');
        await ctx.wait(450);
        paint(c, PAL.ink);
        if (!c[dir]) {
          ctx.root.remove(ghost);
          const n = mk(v);
          n.g.userData.mat.color.set(PAL.mint);
          n.g.position.copy(ghost.position);
          c[dir] = n;
          await relayout();
          ctx.say(`Found an empty spot: <b>${v}</b> becomes the ${dir} child of ${c.val}. It took ${steps} comparison${steps > 1 ? 's' : ''}, one per level, which is O(height).`, 'O(h)');
          await ctx.wait(400);
          paint(n, PAL.ink, 500);
          return;
        }
        c = c[dir];
      }
    }
    async function search(v) {
      clearMarks(); steps = 0; stats();
      let c = root;
      while (c) {
        tick();
        await paint(c, PAL.accent);
        if (v === c.val) {
          await paint(c, PAL.mint);
          await ctx.tween(c.g.scale, { x: 1.3, y: 1.3, z: 1.3 }, 200);
          await ctx.tween(c.g.scale, { x: 1, y: 1, z: 1 }, 250);
          ctx.say(`Found <b>${v}</b> in ${steps} comparison${steps > 1 ? 's' : ''}. In a balanced tree of a million nodes that is about 20.`, 'O(log n)');
          return;
        }
        const dir = v < c.val ? 'left' : 'right';
        ctx.say(`<code>${v} ${v < c.val ? '&lt;' : '&gt;'} ${c.val}</code> → go ${dir}.`, 'O(h)');
        await ctx.wait(450);
        paint(c, PAL.dim);
        c = c[dir];
      }
      ctx.say(`Fell off the tree: <b>${v}</b> is not here (${steps} comparisons).`, 'O(h)');
    }
    function setChild(parent, oldChild, newChild) {
      if (!parent) root = newChild;
      else if (parent.left === oldChild) parent.left = newChild;
      else parent.right = newChild;
    }
    async function remove(v) {
      clearMarks(); steps = 0; stats();
      let c = root, parent = null;
      while (c && c.val !== v) { tick(); await paint(c, PAL.accent, 140); await ctx.wait(220); paint(c, PAL.ink); parent = c; c = v < c.val ? c.left : c.right; }
      if (!c) { ctx.say(`<b>${v}</b> is not in the tree.`); return; }
      await paint(c, PAL.coral);
      if (!c.left || !c.right) {
        const child = c.left || c.right;
        ctx.say(child ? `<b>${v}</b> has one child: connect its parent directly to that child.` : `<b>${v}</b> is a leaf: just remove it.`, 'O(h)');
        await ctx.wait(800);
        setChild(parent, c, child);
        await ctx.moveTo(c.g, { y: -1 }, 400);
        drop(c);
        await relayout();
        return;
      }
      ctx.say(`<b>${v}</b> has two children. Replace it with its <b>in-order successor</b>: the smallest value in its right subtree.`, 'O(h)');
      await ctx.wait(900);
      let sp = c, s = c.right;
      await paint(s, PAL.violet);
      while (s.left) { tick(); await ctx.wait(300); paint(s, PAL.ink); sp = s; s = s.left; await paint(s, PAL.violet); }
      ctx.say(`Successor is <b>${s.val}</b> (go right once, then left as far as possible). Copy it up, then delete the successor node, which has at most one child.`, 'O(h)');
      await ctx.wait(1100);
      c.val = s.val; c.g.setValue(s.val);
      paint(c, PAL.mint);
      setChild(sp, s, s.right);
      await ctx.moveTo(s.g, { y: -1 }, 400);
      drop(s);
      await relayout();
      await ctx.wait(300);
      paint(c, PAL.ink, 400);
    }
    async function traverse(kind) {
      clearMarks(); steps = 0; stats();
      const seq = [];
      const pre = (n) => { if (!n) return; seq.push(n); pre(n.left); pre(n.right); };
      const ino = (n) => { if (!n) return; ino(n.left); seq.push(n); ino(n.right); };
      const post = (n) => { if (!n) return; post(n.left); post(n.right); seq.push(n); };
      if (kind === 'pre') pre(root); else if (kind === 'in') ino(root); else if (kind === 'post') post(root);
      else { const q = root ? [root] : []; while (q.length) { const n = q.shift(); seq.push(n); if (n.left) q.push(n.left); if (n.right) q.push(n.right); } }
      const names = { pre: ['Pre-order', 'node → left → right'], in: ['In-order', 'left → node → right'], post: ['Post-order', 'left → right → node'], level: ['Level-order (BFS)', 'row by row with a queue'] };
      const out = [];
      for (let i = 0; i < seq.length; i++) {
        if (!ctx.alive) return;
        const n = seq[i];
        out.push(n.val);
        await paint(n, PAL.accent, 150);
        const m = ctx.label(String(i + 1), { size: 0.3, color: '#1b1102', bg: PAL.accent });
        m.position.set(n.g.position.x + 0.45, n.g.position.y + 0.6, n.g.position.z);
        ctx.root.add(m); marks.push(m);
        ctx.say(`<b>${names[kind][0]}</b> (${names[kind][1]}): <code>[${out.join(', ')}]</code>` + (kind === 'in' && i === seq.length - 1 ? '. In-order on a BST always comes out <b>sorted</b>.' : ''), 'O(n)');
        await ctx.wait(420);
        paint(n, PAL.violet, 200);
      }
    }

    const vIn = ctx.input(45, { type: 'number', label: 'value' });
    const val = () => { const v = parseInt(vIn.value, 10); return Number.isFinite(v) ? Math.max(-99, Math.min(999, v)) : 0; };
    const A = (fn) => () => act(fn);
    ctx.group(DSA.h('label', null, 'value', vIn));
    ctx.group(
      ctx.button('Insert', A(() => insert(val())), { primary: true }),
      ctx.button('Search', A(() => search(val()))),
      ctx.button('Delete', A(() => remove(val()))));
    ctx.group(
      ctx.button('In-order', A(() => traverse('in'))),
      ctx.button('Pre-order', A(() => traverse('pre'))),
      ctx.button('Post-order', A(() => traverse('post'))),
      ctx.button('Level-order', A(() => traverse('level'))));
    ctx.group(
      ctx.button('Random tree', A(async () => {
        clearMarks();
        const vals = []; while (vals.length < 9) { const v = Math.floor(Math.random() * 90) + 5; if (!vals.includes(v)) vals.push(v); }
        buildInstant(vals);
        ctx.say('A random insertion order usually gives a fairly balanced tree: height around log₂ n.');
      }), { icon: 'shuffle' }),
      ctx.button('Sorted inserts', A(async () => {
        clearMarks(); buildInstant([10, 20, 30, 40, 50, 60]);
        ctx.say('Inserting already-sorted values builds a "stick": every node has only a right child. Height = n − 1, so search is <b>O(n)</b>, like a linked list. Self-balancing trees (AVL, red-black) prevent this.', 'O(n)');
      })),
      ctx.speedControl());
    ctx.legend([[PAL.accent, 'comparing / visiting'], [PAL.mint, 'found / inserted'], [PAL.violet, 'successor / visited'], [PAL.coral, 'deleting'], [PAL.dim, 'ruled out']]);
    buildInstant([50, 30, 70, 20, 40, 60, 80]);
    ctx.say('Every node: smaller values to the left, larger to the right. Type a value and press <b>Insert</b> to watch it find its place.');
    return ctx;
  };
})();

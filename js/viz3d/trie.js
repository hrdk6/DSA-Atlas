/* 3D: trie (prefix tree). Words that share a prefix share a path.
   Insert creates only the missing nodes; search and startsWith walk
   one node per character: O(length of the word). */
(function () {
  'use strict';
  const DSA = window.DSA;
  DSA.scenes3d.trie = function (container, o) {
    const D3 = DSA.d3;
    const ctx = D3.stage(container, Object.assign({ title: 'Trie: one node per character, shared prefixes share nodes', camera: [0, 4.8, 13.8], target: [0, 3.2, 0], height: 480 }, o));
    if (ctx.fallback) return ctx;
    const { THREE, PAL } = ctx;
    let root = null, steps = 0;
    const all = new Set();

    function mk(ch, parent) {
      const n = { ch, kids: {}, end: false, parent, g: ctx.ball(ch, { r: ch === '·' ? 0.4 : 0.34, color: ch === '·' ? PAL.inkDeep : PAL.ink, labelSize: 0.34 }), edge: ctx.edge(PAL.edge, 0.03), ring: null };
      ctx.root.add(n.g, n.edge);
      all.add(n);
      return n;
    }
    function setEnd(n) {
      n.end = true;
      if (!n.ring) {
        n.ring = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.055, 12, 36), ctx.stdMat(PAL.mint, { emissive: PAL.mint, emissiveIntensity: 0.3 }));
        n.g.add(n.ring);
      }
    }
    function layout() {
      let leaf = 0;
      const out = [];
      let maxD = 0;
      (function walk(n, d) {
        maxD = Math.max(maxD, d);
        const ks = Object.keys(n.kids).sort();
        if (!ks.length) { n.lx = leaf++; }
        else { ks.forEach((k) => walk(n.kids[k], d + 1)); n.lx = (n.kids[ks[0]].lx + n.kids[ks[ks.length - 1]].lx) / 2; }
        n.d = d; out.push(n);
      })(root, 0);
      const XS = leaf > 1 ? Math.min(1.15, 14 / (leaf - 1)) : 1;
      const YS = maxD > 0 ? Math.min(1.2, 5.6 / maxD) : 1.2;
      for (const n of out) n.t = { x: (n.lx - (leaf - 1) / 2) * XS, y: 6.4 - n.d * YS, z: -n.d * 0.3 };
      return out;
    }
    function updateEdges() { for (const n of all) { if (n.parent) { n.edge.visible = true; n.edge.set(n.parent.g.position, n.g.position); } else n.edge.visible = false; } }
    async function relayout(ms) { const ns = layout(); await Promise.all(ns.map((n) => ctx.moveTo(n.g, n.t, ms || 500))); }
    async function act(fn) { const stop = ctx.onTick(updateEdges); try { await fn(); } finally { stop(); updateEdges(); ctx.kick(); } }
    const stats = () => { ctx.stat('steps', 'nodes walked', steps); ctx.stat('n', 'nodes', all.size); };
    const paint = (n, c) => ctx.colorTo(n.g.userData.mat, c, 160);
    function resetColors() { for (const n of all) n.g.userData.mat.color.set(n === root ? PAL.inkDeep : PAL.ink); ctx.kick(); }

    function buildInstant(words) {
      for (const n of Array.from(all)) ctx.root.remove(n.g, n.edge);
      all.clear();
      root = mk('·', null);
      for (const w of words) { let c = root; for (const ch of w) { if (!c.kids[ch]) c.kids[ch] = mk(ch, c); c = c.kids[ch]; } setEnd(c); }
      for (const n of layout()) n.g.position.set(n.t.x, n.t.y, n.t.z);
      updateEdges(); steps = 0; stats(); ctx.kick();
    }
    async function insert(w) {
      resetColors(); steps = 0; stats();
      if (all.size + w.length > 40) { ctx.say('The tree is getting crowded. Press <b>Reset</b> first.'); return; }
      let c = root, created = 0;
      await paint(c, PAL.accent);
      for (const ch of w) {
        if (!ctx.alive) return;
        steps++; stats();
        if (c.kids[ch]) {
          ctx.say(`'${ch}' already exists under this node, so <b>reuse</b> it. Shared prefix!`, 'O(L)');
          c = c.kids[ch];
          await paint(c, PAL.accent);
        } else {
          const n = mk(ch, c);
          c.kids[ch] = n;
          n.g.position.copy(c.g.position);
          n.g.userData.mat.color.set(PAL.mint);
          created++;
          ctx.say(`No '${ch}' child yet: <b>create</b> one.`, 'O(L)');
          await relayout(420);
          c = n;
        }
        await ctx.wait(300);
      }
      setEnd(c);
      ctx.kick();
      ctx.say(`Inserted "<b>${w}</b>": walked ${w.length} characters and created ${created} new node${created === 1 ? '' : 's'}. The green ring marks "a word ends here".`, 'O(L)');
    }
    async function find(w, prefixOnly) {
      resetColors(); steps = 0; stats();
      let c = root;
      await paint(c, PAL.accent);
      for (const ch of w) {
        steps++; stats();
        const nx = c.kids[ch];
        if (!nx) {
          await paint(c, PAL.coral);
          ctx.say(`No '${ch}' after "${w.slice(0, steps - 1)}". ${prefixOnly ? 'No word starts with' : 'The trie does not contain'} "<b>${w}</b>".`, 'O(L)');
          return;
        }
        c = nx;
        await paint(c, PAL.accent);
        await ctx.wait(260);
      }
      if (prefixOnly) {
        const words = [];
        (function collect(n, acc) { if (n.end) words.push(acc); for (const k of Object.keys(n.kids).sort()) collect(n.kids[k], acc + k); })(c, w);
        await paint(c, PAL.mint);
        ctx.say(`<code>startsWith("${w}")</code> → <b>True</b>. Every word below this node shares the prefix: <code>${words.join(', ')}</code>. That is autocomplete.`, 'O(L)');
      } else if (c.end) {
        await paint(c, PAL.mint);
        ctx.say(`<code>search("${w}")</code> → <b>True</b>: the path exists <i>and</i> the last node is marked as a word end. Cost depends only on the word length, not on how many words are stored.`, 'O(L)');
      } else {
        await paint(c, PAL.violet);
        ctx.say(`The path "${w}" exists, but no word ends here, so <code>search</code> → <b>False</b>, while <code>startsWith</code> would say True.`, 'O(L)');
      }
    }

    const wIn = ctx.input('cart', { label: 'word', width: '120px' });
    const word = () => (wIn.value.trim().toLowerCase().replace(/[^a-z]/g, '') || 'cart').slice(0, 8);
    const A = (fn) => () => act(fn);
    ctx.group(DSA.h('label', null, 'word', wIn));
    ctx.group(ctx.button('Insert', A(() => insert(word())), { primary: true }), ctx.button('Search', A(() => find(word(), false))), ctx.button('Starts with', A(() => find(word(), true))));
    ctx.group(ctx.button('Reset', A(async () => { buildInstant(['cat', 'car', 'card', 'do', 'dog', 'dot']); ctx.say('Back to the starting words: cat, car, card, do, dog, dot.'); }), { icon: 'reset' }), ctx.speedControl());
    ctx.legend([[PAL.accent, 'walking'], [PAL.mint, 'new node / match'], [PAL.coral, 'missing character'], [PAL.violet, 'prefix only']]);
    buildInstant(['cat', 'car', 'card', 'do', 'dog', 'dot']);
    ctx.say('Six words, but "ca" and "do" are stored once each. Try inserting <b>cart</b>, then search <b>car</b> vs <b>ca</b>.');
    return ctx;
  };
})();

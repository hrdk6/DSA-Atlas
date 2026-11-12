/* 3D: undirected graph floating in space. BFS spreads in rings (colour =
   distance), DFS dives down one path and backtracks, and "shortest path"
   traces BFS parents. Click a node to choose the start. Also used as the
   ambient hero animation on the home page. */
(function () {
  'use strict';
  const DSA = window.DSA;
  const NAMES = 'ABCDEFGHIJKLMN'.split('');
  function randomGraph(n) {
    /* random spanning tree + a few extra edges, positions on a squashed sphere */
    const pos = [];
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n), th = Math.PI * (1 + Math.sqrt(5)) * i;
      pos.push([Math.cos(th) * Math.sin(phi) * 4.6, 2.9 + Math.cos(phi) * 2.2, Math.sin(th) * Math.sin(phi) * 3.4]);
    }
    const E = new Set(), adj = Array.from({ length: n }, () => []);
    const add = (a, b) => { if (a === b) return; const k = a < b ? a + '-' + b : b + '-' + a; if (E.has(k)) return; E.add(k); adj[a].push(b); adj[b].push(a); };
    const d2 = (a, b) => (pos[a][0] - pos[b][0]) ** 2 + (pos[a][1] - pos[b][1]) ** 2 + (pos[a][2] - pos[b][2]) ** 2;
    const inTree = [0];
    while (inTree.length < n) {
      let best = null;
      for (const a of inTree) for (let b = 0; b < n; b++) if (!inTree.includes(b)) { const d = d2(a, b) * (0.7 + Math.random() * 0.6); if (!best || d < best[2]) best = [a, b, d]; }
      add(best[0], best[1]); inTree.push(best[1]);
    }
    for (let k = 0; k < Math.round(n * 0.45); k++) {
      const a = Math.floor(Math.random() * n);
      let b = -1, bd = Infinity;
      for (let c = 0; c < n; c++) if (c !== a && !adj[a].includes(c)) { const d = d2(a, c); if (d < bd) { bd = d; b = c; } }
      if (b >= 0) add(a, b);
    }
    for (const l of adj) l.sort((x, y) => x - y);
    return { n, pos, adj, edges: Array.from(E).map((k) => k.split('-').map(Number)) };
  }

  DSA.scenes3d.graph = function (container, o) {
    o = o || {};
    const D3 = DSA.d3;
    const hero = !!o.hero;
    const ctx = D3.stage(container, Object.assign({ title: 'Graph search: BFS ripples outward, DFS dives deep', camera: hero ? [0, 4.8, 15.4] : [0, 5.2, 13.5], target: [0, 2.8, 0], height: 470, autoRotate: 0, ground: !hero }, o));
    if (ctx.fallback) return ctx;
    const { THREE, PAL } = ctx;
    let G = null, nodes = [], edgeObjs = {}, start = 0, steps = 0, marks = [];
    const ek = (a, b) => (a < b ? a + '-' + b : b + '-' + a);

    function build(n) {
      for (const nd of nodes) ctx.remove(nd);
      for (const k in edgeObjs) ctx.remove(edgeObjs[k]);
      clearMarks();
      nodes = []; edgeObjs = {};
      G = randomGraph(n);
      G.pos.forEach((p, i) => {
        const b = ctx.ball(NAMES[i], { r: 0.42, color: PAL.ink, labelSize: 0.36 });
        b.position.set(p[0], p[1], p[2]);
        b.userData.i = i;
        ctx.root.add(b); nodes.push(b);
      });
      for (const [a, b] of G.edges) {
        const e = ctx.edge(PAL.edge, 0.035);
        e.set(nodes[a].position, nodes[b].position);
        ctx.root.add(e); edgeObjs[ek(a, b)] = e;
      }
      start = 0;
      resetColors();
      ctx.kick();
    }
    function clearMarks() { for (const m of marks) ctx.remove(m); marks = []; }
    function resetColors() {
      for (const nd of nodes) { nd.userData.mat.color.set(PAL.ink); nd.scale.set(1, 1, 1); }
      for (const k in edgeObjs) { edgeObjs[k].userData.mat.color.set(PAL.edge); edgeObjs[k].scale.set(1, 1, 1); }
      if (nodes[start]) nodes[start].userData.mat.color.set(PAL.mint);
      ctx.kick();
    }
    function mark(i, text, color) {
      const m = ctx.label(text, { size: 0.28, color: '#ffffff', bg: color || PAL.inkDeep });
      const p = nodes[i].position;
      m.position.set(p.x + 0.5, p.y + 0.62, p.z);
      ctx.root.add(m); marks.push(m);
    }
    const stats = () => { if (!hero) ctx.stat('steps', 'nodes visited', steps); };
    const paintEdge = (a, b, c) => { const e = edgeObjs[ek(a, b)]; if (e) return ctx.colorTo(e.userData.mat, c, 200); };

    async function bfs(target) {
      clearMarks(); resetColors(); steps = 0; stats();
      const dist = new Array(G.n).fill(-1), parent = new Array(G.n).fill(-1);
      const q = [start]; dist[start] = 0;
      const order = [];
      while (q.length && ctx.alive) {
        const u = q.shift();
        steps++; stats(); order.push(NAMES[u]);
        const col = D3.layerColors[dist[u] % D3.layerColors.length];
        await ctx.colorTo(nodes[u].userData.mat, col, 220);
        mark(u, 'd=' + dist[u], col === PAL.accent ? '#b06a00' : col);
        if (!hero) ctx.say(`Pop <b>${NAMES[u]}</b> from the front of the queue (distance ${dist[u]}). Queue: <code>[${q.map((x) => NAMES[x]).join(', ')}]</code>`, 'O(V+E)');
        if (target != null && u === target) break;
        for (const v of G.adj[u]) {
          if (dist[v] === -1) {
            dist[v] = dist[u] + 1; parent[v] = u; q.push(v);
            paintEdge(u, v, D3.layerColors[dist[v] % D3.layerColors.length]);
            await ctx.colorTo(nodes[v].userData.mat, PAL.dim, 150);
          }
        }
        if (!hero) ctx.say(`Visited ${NAMES[u]}; queued its unseen neighbours. Queue: <code>[${q.map((x) => NAMES[x]).join(', ')}]</code>`, 'O(V+E)');
        await ctx.wait(hero ? 380 : 650);
      }
      return { dist, parent, order };
    }
    async function dfs() {
      clearMarks(); resetColors(); steps = 0; stats();
      const seen = new Array(G.n).fill(false), order = [];
      const stackView = [];
      async function go(u, from) {
        if (!ctx.alive) return;
        seen[u] = true; steps++; stats(); order.push(NAMES[u]);
        stackView.push(NAMES[u]);
        if (from >= 0) await paintEdge(from, u, PAL.accent);
        await ctx.colorTo(nodes[u].userData.mat, PAL.accent, 200);
        mark(u, String(order.length), '#b06a00');
        ctx.say(`Visit <b>${NAMES[u]}</b>. Call stack: <code>${stackView.join(' → ')}</code>. Go to the first unseen neighbour before anything else.`, 'O(V+E)');
        await ctx.wait(600);
        for (const v of G.adj[u]) {
          if (!seen[v]) {
            await go(v, u);
            if (!ctx.alive) return;
            ctx.say(`Back at <b>${NAMES[u]}</b> (backtracked). Call stack: <code>${stackView.join(' → ')}</code>`, 'O(V+E)');
            await ctx.wait(450);
          }
        }
        stackView.pop();
        await ctx.colorTo(nodes[u].userData.mat, PAL.violet, 200);
      }
      await go(start, -1);
      ctx.say(`DFS order: <code>${order.join(', ')}</code>. It went deep first and only backtracked at dead ends. Every node and edge is touched once.`, 'O(V+E)');
    }
    async function shortest() {
      let target = 0, far = -1;
      const tmp = new Array(G.n).fill(-1); tmp[start] = 0; const qq = [start];
      while (qq.length) { const u = qq.shift(); for (const v of G.adj[u]) if (tmp[v] < 0) { tmp[v] = tmp[u] + 1; qq.push(v); } }
      tmp.forEach((d, i) => { if (d > far) { far = d; target = i; } });
      ctx.say(`Shortest path from <b>${NAMES[start]}</b> to the farthest node, <b>${NAMES[target]}</b>. BFS reaches every node by the fewest edges first.`);
      await ctx.wait(700);
      const { parent, dist } = await bfs(target);
      const path = [];
      for (let v = target; v !== -1; v = parent[v]) path.push(v);
      path.reverse();
      for (const nd of nodes) ctx.colorTo(nd.userData.mat, PAL.dim, 300);
      for (const k in edgeObjs) ctx.colorTo(edgeObjs[k].userData.mat, PAL.edge, 300);
      await ctx.wait(350);
      for (let i = 0; i < path.length; i++) {
        await ctx.colorTo(nodes[path[i]].userData.mat, PAL.mint, 200);
        if (i) { const e = edgeObjs[ek(path[i - 1], path[i])]; if (e) { await ctx.colorTo(e.userData.mat, PAL.mint, 200); e.scale.set(2, 1, 2); } }
      }
      ctx.say(`Path <code>${path.map((x) => NAMES[x]).join(' → ')}</code>: ${dist[target]} edges. Follow <code>parent[]</code> backwards from the target, then reverse it.`, 'O(V+E)');
    }

    if (hero) {
      build(11);
      let alive = true;
      (async function initRun() {
        await ctx.wait(600);
        if (alive && ctx.alive) await bfs();
      })();
      ctx.onPick(() => nodes, (obj) => {
        if (ctx.busy) return;
        start = obj.userData.i;
        bfs();
      });
      const d = ctx.destroy;
      ctx.destroy = () => { alive = false; d(); };
      return ctx;
    }

    ctx.onPick(() => nodes, (obj) => {
      if (ctx.busy) return;
      start = obj.userData.i; clearMarks(); resetColors();
      ctx.say(`Start node is now <b>${NAMES[start]}</b>. Run BFS or DFS from here.`);
    });
    ctx.group(
      ctx.button('BFS from start', async () => { const r = await bfs(); ctx.say(`BFS order: <code>${r.order.join(', ')}</code>. Colours are rings of equal distance: every d=1 node before any d=2 node. That is why BFS finds shortest paths in unweighted graphs.`, 'O(V+E)'); }, { primary: true }),
      ctx.button('DFS from start', dfs),
      ctx.button('Shortest path', shortest));
    ctx.group(ctx.button('New graph', async () => { build(9 + Math.floor(Math.random() * 3)); ctx.say('New graph. Click any node to make it the start.'); }, { icon: 'shuffle' }), ctx.speedControl());
    ctx.legend([[PAL.mint, 'start / path'], [D3.layerColors[0], 'd=0'], [D3.layerColors[1], 'd=1'], [D3.layerColors[2], 'd=2'], [PAL.dim, 'in queue'], [PAL.violet, 'DFS finished']]);
    build(10);
    ctx.say('Click a node to choose where to start, then compare <b>BFS</b> (rings) with <b>DFS</b> (one deep path at a time).');
    return ctx;
  };
})();

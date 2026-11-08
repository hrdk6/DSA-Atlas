/* 2D: grids as graphs. Modes: BFS shortest path, DFS exploration,
   number of islands (flood fill), and rotting oranges (multi-source BFS).
   Click cells to draw walls / land, then press play. */
(function () {
  'use strict';
  const DSA = window.DSA;
  const h = DSA.h;
  const MAPS = {
    bfs: ['S...#.......', '.##.#.###.#.', '..#...#...#.', '#.#.###.#.#.', '..#.....#...', '.####.#.###.', '......#...#G'],
    islands: ['11000110', '11000100', '00100001', '00011011', '10000011', '11000000'],
    rotting: ['211100', '110110', '011001', '101011', '001110'],
  };
  const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const MODES = {
    bfs: { title: 'BFS on a grid: shortest path from S to G', cx: 'O(R·C)', map: 'bfs', interval: 350 },
    dfs: { title: 'DFS on a grid: goes deep, finds a path (not the shortest)', cx: 'O(R·C)', map: 'bfs', interval: 300 },
    islands: { title: 'Number of islands: scan, and flood-fill each new island', cx: 'O(R·C)', map: 'islands', interval: 400 },
    rotting: { title: 'Rotting oranges: BFS from many sources at once', cx: 'O(R·C)', map: 'rotting', interval: 900 },
  };
  const ISLAND_COLORS = ['var(--mint)', 'var(--ink)', 'var(--accent)', 'var(--violet)', 'var(--coral)', 'var(--cyan)'];

  DSA.widgets.grid = function (container, o) {
    const modeKey = MODES[o.mode] ? o.mode : 'bfs';
    const M = MODES[modeKey];
    const fig = DSA.figure({ kicker: o.kicker, title: o.title || M.title, flat: true, caption: o.caption || (modeKey === 'rotting' ? 'Click a cell to cycle empty → fresh → rotten.' : modeKey === 'islands' ? 'Click a cell to switch water and land.' : 'Click a cell to add or remove a wall.'), hint: 'click cells to edit' });
    container.append(fig.root);
    let grid = MAPS[M.map].map((r) => r.split(''));
    const R = grid.length, C = grid[0].length;
    const player = DSA.player(fig, { render, interval: M.interval });
    const wrap = h('div', { class: 'gw-grid', style: { gridTemplateColumns: `repeat(${C}, 34px)` } });
    const cells = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const el = h('button', { class: 'gw-cell', type: 'button', 'aria-label': `row ${r} column ${c}` });
      el.addEventListener('click', () => edit(r, c));
      cells.push(el); wrap.append(el);
    }
    const info = h('div', { class: 'w-vars' });
    fig.stage.append(wrap, info);

    function edit(r, c) {
      const v = grid[r][c];
      if (modeKey === 'islands') grid[r][c] = v === '1' ? '0' : '1';
      else if (modeKey === 'rotting') grid[r][c] = v === '0' ? '1' : v === '1' ? '2' : '0';
      else { if (v === 'S' || v === 'G') return; grid[r][c] = v === '#' ? '.' : '#'; }
      rebuild();
    }
    function base() {
      return grid.map((row) => row.map((v) => {
        if (modeKey === 'islands') return { cls: v === '1' ? 'land' : '', txt: '' };
        if (modeKey === 'rotting') return { cls: v === '2' ? 'rot' : v === '1' ? 'fresh' : '', txt: v === '2' ? '✕' : v === '1' ? '●' : '' };
        return { cls: v === '#' ? 'wall' : v === 'S' ? 'start' : v === 'G' ? 'goal' : '', txt: v === 'S' ? 'S' : v === 'G' ? 'G' : '' };
      }));
    }
    const snap = (b) => b.map((row) => row.map((x) => Object.assign({}, x)));
    function find(ch) { for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === ch) return [r, c]; return null; }
    const inside = (r, c) => r >= 0 && c >= 0 && r < R && c < C;

    function genBFS() {
      const steps = [], b = base(), [sr, sc] = find('S'), goal = find('G');
      const dist = grid.map((row) => row.map(() => -1)), par = {};
      const q = [[sr, sc]]; dist[sr][sc] = 0;
      steps.push({ b: snap(b), msg: 'Put S in the queue with distance 0. BFS will visit cells in order of distance.', vars: [['queue', 1]] });
      let found = false;
      while (q.length) {
        const [r, c] = q.shift();
        if (!(r === sr && c === sc) && !(goal && r === goal[0] && c === goal[1])) { b[r][c].cls = 'visited'; }
        if (goal && r === goal[0] && c === goal[1]) { found = true; break; }
        const added = [];
        for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (!inside(nr, nc) || grid[nr][nc] === '#' || dist[nr][nc] >= 0) continue;
          dist[nr][nc] = dist[r][c] + 1; par[nr + ',' + nc] = [r, c]; q.push([nr, nc]); added.push([nr, nc]);
          if (grid[nr][nc] !== 'G') { b[nr][nc].cls = 'frontier'; b[nr][nc].txt = String(dist[nr][nc]); }
        }
        const s = snap(b);
        if (!(r === sr && c === sc)) s[r][c].cls += ' cur';
        steps.push({ b: s, msg: `Dequeue (${r},${c}) at distance ${dist[r][c]}; enqueue ${added.length} unvisited neighbour${added.length === 1 ? '' : 's'}.`, vars: [['queue size', q.length], ['distance', dist[r][c]]] });
      }
      if (found) {
        let cur = goal; const path = [];
        while (cur) { path.push(cur); cur = par[cur[0] + ',' + cur[1]]; }
        for (const [r, c] of path) if (grid[r][c] === '.') b[r][c].cls = 'path';
        steps.push({ b: snap(b), msg: `Reached G at distance <b>${dist[goal[0]][goal[1]]}</b>. Because BFS explores in rings of equal distance, the first time it reaches G is via a shortest path. Trace the parents back to S.`, vars: [['shortest path', dist[goal[0]][goal[1]] + ' steps']] });
      } else steps.push({ b: snap(b), msg: 'The queue emptied without reaching G: there is no path.' });
      return steps;
    }
    function genDFS() {
      const steps = [], b = base(), [sr, sc] = find('S');
      const seen = new Set([sr + ',' + sc]);
      const stack = [[sr, sc, [[sr, sc]]]];
      steps.push({ b: snap(b), msg: 'DFS with an explicit stack: always continue from the most recently discovered cell.', vars: [['stack', 1]] });
      while (stack.length) {
        const [r, c, path] = stack.pop();
        if (grid[r][c] === 'G') {
          for (const [pr, pc] of path) if (grid[pr][pc] === '.') b[pr][pc].cls = 'path';
          steps.push({ b: snap(b), msg: `Found G with a path of <b>${path.length - 1}</b> steps. DFS finds <i>a</i> path, usually not the shortest one. Compare with BFS.`, vars: [['path length', path.length - 1]] });
          return steps;
        }
        if (grid[r][c] === '.') b[r][c].cls = 'visited';
        let pushed = 0;
        for (const [dr, dc] of DIRS.slice().reverse()) {
          const nr = r + dr, nc = c + dc;
          if (!inside(nr, nc) || grid[nr][nc] === '#' || seen.has(nr + ',' + nc)) continue;
          seen.add(nr + ',' + nc); stack.push([nr, nc, path.concat([[nr, nc]])]); pushed++;
          if (grid[nr][nc] === '.') b[nr][nc].cls = 'frontier';
        }
        const s = snap(b);
        if (grid[r][c] === '.') s[r][c].cls += ' cur';
        steps.push({ b: s, msg: `Pop (${r},${c}), push ${pushed} neighbour${pushed === 1 ? '' : 's'}. The next cell explored is the last one pushed: deep before wide.`, vars: [['stack size', stack.length]] });
      }
      steps.push({ b: snap(b), msg: 'Stack is empty: G is unreachable.' });
      return steps;
    }
    function genIslands() {
      const steps = [], b = base(), seen = grid.map((row) => row.map(() => false));
      let count = 0;
      steps.push({ b: snap(b), msg: 'Scan cell by cell. Each unvisited land cell starts a new island; flood-fill sinks the whole island so it is never counted twice.', vars: [['islands', 0]] });
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        if (grid[r][c] !== '1' || seen[r][c]) continue;
        count++;
        const color = ISLAND_COLORS[(count - 1) % ISLAND_COLORS.length];
        const q = [[r, c]]; seen[r][c] = true;
        steps.push({ b: snap(b), msg: `Unvisited land at (${r},${c}): island <b>#${count}</b>. Flood-fill everything connected to it.`, vars: [['islands', count, 'good']], cur: [r, c] });
        while (q.length) {
          const [cr, cc] = q.shift();
          b[cr][cc].cls = 'land'; b[cr][cc].txt = String(count); b[cr][cc].color = color;
          for (const [dr, dc] of DIRS) {
            const nr = cr + dr, nc = cc + dc;
            if (inside(nr, nc) && grid[nr][nc] === '1' && !seen[nr][nc]) { seen[nr][nc] = true; q.push([nr, nc]); }
          }
          steps.push({ b: snap(b), msg: `Mark (${cr},${cc}) as part of island #${count}, then visit its land neighbours.`, vars: [['islands', count]], cur: [cr, cc] });
        }
      }
      steps.push({ b: snap(b), msg: `Scan complete: <b>${count}</b> island${count === 1 ? '' : 's'}. Every cell is visited a constant number of times: O(rows × cols).`, vars: [['islands', count, 'good']] });
      return steps;
    }
    function genRotting() {
      const steps = [], b = base();
      let q = [], fresh = 0, minute = 0;
      const g = grid.map((row) => row.slice());
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { if (g[r][c] === '2') q.push([r, c]); if (g[r][c] === '1') fresh++; }
      steps.push({ b: snap(b), msg: `Start a BFS from <b>every</b> rotten orange at once (${q.length} sources). Each BFS layer is one minute.`, vars: [['minute', 0], ['fresh left', fresh]] });
      while (q.length && fresh) {
        const nq = [];
        for (const [r, c] of q) for (const [dr, dc] of DIRS) {
          const nr = r + dr, nc = c + dc;
          if (inside(nr, nc) && g[nr][nc] === '1') { g[nr][nc] = '2'; fresh--; nq.push([nr, nc]); b[nr][nc].cls = 'rot'; b[nr][nc].txt = String(minute + 1); }
        }
        if (!nq.length) break;
        minute++;
        q = nq;
        steps.push({ b: snap(b), msg: `Minute ${minute}: ${nq.length} orange${nq.length === 1 ? '' : 's'} next to rotten ones rot (number = minute it rotted).`, vars: [['minute', minute, 'hot'], ['fresh left', fresh]] });
      }
      steps.push({ b: snap(b), msg: fresh ? `${fresh} fresh orange${fresh === 1 ? ' is' : 's are'} unreachable, so the answer is <b>−1</b>.` : `All oranges rotten after <b>${minute}</b> minute${minute === 1 ? '' : 's'}.`, vars: [['answer', fresh ? -1 : minute, 'good']] });
      return steps;
    }
    function render(st) {
      st.b.forEach((row, r) => row.forEach((x, c) => {
        const el = cells[r * C + c];
        el.className = 'gw-cell ' + x.cls + (st.cur && st.cur[0] === r && st.cur[1] === c ? ' cur' : '');
        el.textContent = x.txt;
        el.style.background = x.color ? `color-mix(in srgb, ${x.color} 45%, var(--surface))` : '';
      }));
      info.innerHTML = '';
      for (const [k, v, c] of st.vars || []) info.append(h('span', { class: 'w-var ' + (c || ''), html: DSA.esc(k) + ' = <b>' + DSA.esc(v) + '</b>' }));
      fig.say(st.msg, M.cx);
    }
    function rebuild() {
      const gen = { bfs: genBFS, dfs: genDFS, islands: genIslands, rotting: genRotting }[modeKey];
      player.setSteps(gen());
    }
    fig.tools.append(DSA.btn('Reset grid', 'reset', () => { grid = MAPS[M.map].map((r) => r.split('')); rebuild(); }, 'ghost'));
    rebuild();
    return { destroy: player.destroy };
  };
})();

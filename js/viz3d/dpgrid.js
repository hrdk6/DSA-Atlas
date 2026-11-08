/* 3D: a dynamic-programming table filling itself in. Each tile's height is
   its value; before a tile rises, the tiles it depends on light up.
   Modes: Unique Paths (dp[r][c] = up + left) and Longest Common Subsequence. */
(function () {
  'use strict';
  const DSA = window.DSA;
  DSA.scenes3d.dpgrid = function (container, o) {
    o = o || {};
    const D3 = DSA.d3;
    const ctx = D3.stage(container, Object.assign({ title: 'A DP table is built from answers you already have', camera: [0.5, 8.4, 9.6], target: [0, 0.6, 0.3], height: 470 }, o));
    if (ctx.fallback) return ctx;
    const { THREE, PAL } = ctx;
    let mode = o.mode || 'paths', R = 4, C = 6, A = 'ABCBDA', B = 'BDCABA';
    let tiles = [], heads = [], ops = [], flow = null, opIndex = 0;
    const SP = 1.06;
    const hOf = (v) => (mode === 'paths' ? 0.18 + 0.5 * Math.log2(1 + v) : 0.18 + 0.55 * v);
    const posOf = (r, c) => ({ x: (c - (C - 1) / 2) * SP, z: (r - (R - 1) / 2) * SP });

    function gen() {
      ops = [];
      if (mode === 'paths') {
        const dp = Array.from({ length: R }, () => new Array(C).fill(0));
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
          if (r === 0 || c === 0) { dp[r][c] = 1; ops.push({ r, c, v: 1, deps: [], f: `<code>dp[${r}][${c}] = 1</code>: along the ${r === 0 ? 'top row' : 'left column'} there is only one way (keep going straight).` , base: true }); }
          else { dp[r][c] = dp[r - 1][c] + dp[r][c - 1]; ops.push({ r, c, v: dp[r][c], deps: [[r - 1, c], [r, c - 1]], f: `<code>dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${dp[r - 1][c]} + ${dp[r][c - 1]} = <b>${dp[r][c]}</b></code>: you arrive from above or from the left.` }); }
        }
        return dp;
      }
      const dp = Array.from({ length: R }, () => new Array(C).fill(0));
      for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
        if (i === 0 || j === 0) { ops.push({ r: i, c: j, v: 0, deps: [], f: `<code>dp[${i}][${j}] = 0</code>: an empty prefix has nothing in common with anything.`, base: true }); continue; }
        if (A[i - 1] === B[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; ops.push({ r: i, c: j, v: dp[i][j], deps: [[i - 1, j - 1]], f: `'${A[i - 1]}' == '${B[j - 1]}' → <code>dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = <b>${dp[i][j]}</b></code>: extend the diagonal answer by this shared letter.`, match: true }); }
        else { dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); ops.push({ r: i, c: j, v: dp[i][j], deps: [[i - 1, j], [i, j - 1]], f: `'${A[i - 1]}' ≠ '${B[j - 1]}' → <code>dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = <b>${dp[i][j]}</b></code>: skip a letter from one string or the other.` }); }
      }
      return dp;
    }
    let table = null;
    function build() {
      if (flow) flow.cancel();
      flow = null; opIndex = 0;
      for (const t of tiles.flat()) ctx.root.remove(t.g, t.lbl);
      for (const hd of heads) ctx.root.remove(hd);
      tiles = []; heads = [];
      if (mode === 'lcs') { R = A.length + 1; C = B.length + 1; }
      table = gen();
      for (let r = 0; r < R; r++) {
        const row = [];
        for (let c = 0; c < C; c++) {
          const g = ctx.block(null, { w: 0.92, h: 1, d: 0.92, r: 0.1, color: PAL.ghost, opacity: 0.5 });
          const p = posOf(r, c);
          g.position.set(p.x, 0.04, p.z);
          g.scale.set(1, 0.08, 1);
          const lbl = ctx.label('', { size: 0.32, color: PAL.label, weight: 700 });
          lbl.position.set(p.x, 0.4, p.z);
          lbl.visible = false;
          ctx.root.add(g, lbl);
          row.push({ g, lbl, v: null });
        }
        tiles.push(row);
      }
      if (mode === 'lcs') {
        for (let j = 0; j < C; j++) { const l = ctx.label(j ? B[j - 1] : 'ε', { size: 0.38, color: j ? PAL.accent : PAL.label }); const p = posOf(0, j); l.position.set(p.x, 0.2, p.z - 1.0); ctx.root.add(l); heads.push(l); }
        for (let i = 0; i < R; i++) { const l = ctx.label(i ? A[i - 1] : 'ε', { size: 0.38, color: i ? PAL.cyan : PAL.label }); const p = posOf(i, 0); l.position.set(p.x - 1.0, 0.2, p.z); ctx.root.add(l); heads.push(l); }
      } else {
        const s = ctx.label('start', { size: 0.28, color: '#ffffff', bg: PAL.mint }); const p0 = posOf(0, 0); s.position.set(p0.x, 0.3, p0.z - 0.95);
        const e = ctx.label('finish', { size: 0.28, color: '#1b1102', bg: PAL.accent }); const p1 = posOf(R - 1, C - 1); e.position.set(p1.x, 0.3, p1.z + 0.95);
        ctx.root.add(s, e); heads.push(s, e);
      }
      ctx.stat('cell', 'cells filled', '0 / ' + R * C);
      ctx.say(mode === 'paths' ? `How many ways can a robot go from the top-left to the bottom-right of a ${R}×${C} grid, moving only right or down? Press <b>Play</b> to fill the table.`
        : `Longest common subsequence of <b>${A}</b> (rows) and <b>${B}</b> (columns). <code>dp[i][j]</code> = LCS length of the first i letters and first j letters. Press <b>Play</b>.`);
      ctx.kick();
    }
    async function doOp(op) {
      const t = tiles[op.r][op.c];
      const depTiles = op.deps.map(([r, c]) => tiles[r][c]);
      await Promise.all(depTiles.map((d) => ctx.colorTo(d.g.userData.mat, PAL.accent, 160)));
      ctx.say(op.f, mode === 'paths' ? 'O(R·C)' : 'O(m·n)');
      t.g.userData.mat.opacity = 1;
      t.g.userData.mat.transparent = false;
      t.g.userData.mat.needsUpdate = true;
      t.color = op.base ? PAL.violet : op.match ? PAL.mint : PAL.ink;
      await ctx.colorTo(t.g.userData.mat, t.color, 120);
      const hh = hOf(op.v);
      await Promise.all([ctx.tween(t.g.scale, { y: hh }, 380, D3.ease.back), ctx.moveTo(t.g, { y: hh / 2 }, 380, D3.ease.back), ctx.moveTo(t.lbl, { y: hh + 0.32 }, 380)]);
      t.v = op.v;
      t.lbl.visible = true;
      t.lbl.userData.set(String(op.v), { color: '#ffffff', bg: op.base ? '#6a4fd6' : op.match ? '#159a6f' : '#2d5fd0' });
      await ctx.wait(260);
      await Promise.all(depTiles.map((d) => ctx.colorTo(d.g.userData.mat, d.color || PAL.ink, 200)));
      ctx.stat('cell', 'cells filled', (opIndex + 1) + ' / ' + R * C);
    }
    async function finish() {
      if (mode === 'paths') {
        const v = table[R - 1][C - 1];
        const t = tiles[R - 1][C - 1];
        await ctx.colorTo(t.g.userData.mat, PAL.accent, 300);
        ctx.say(`Answer: <b>${v}</b> different paths, in the bottom-right cell. Each cell was computed once from two cells you already had: O(R·C) time instead of exploring every path (exponential).`, 'O(R·C)');
        return;
      }
      let i = R - 1, j = C - 1; const out = [];
      while (i > 0 && j > 0) {
        if (A[i - 1] === B[j - 1]) { out.push(A[i - 1]); await ctx.colorTo(tiles[i][j].g.userData.mat, PAL.accent, 220); i--; j--; }
        else if (table[i - 1][j] >= table[i][j - 1]) i--; else j--;
      }
      ctx.say(`LCS length = <b>${table[R - 1][C - 1]}</b>. Walking back from the corner along matching diagonals spells it out: <code>${out.reverse().join('')}</code>.`, 'O(m·n)');
    }
    async function play(stepOnly) {
      if (!flow || flow.cancelled) flow = D3.flow(ctx);
      const f = flow;
      if (stepOnly) f.step(); else f.play();
      if (f.running) return;
      f.running = true;
      while (opIndex < ops.length && ctx.alive) {
        const ok = await f.gate();
        if (!ok || f !== flow) return;
        await doOp(ops[opIndex]);
        if (f !== flow || f.cancelled) return;
        opIndex++;
      }
      f.running = false;
      if (opIndex >= ops.length && ctx.alive && !f.cancelled && !f.finished) { f.finished = true; await finish(); }
    }

    const modeSel = ctx.select([['paths', 'Unique paths (grid walk)'], ['lcs', 'Longest common subsequence']], { label: 'problem', value: mode });
    const rIn = ctx.input(R, { type: 'number', label: 'rows', min: 2, max: 7 });
    const cIn = ctx.input(C, { type: 'number', label: 'cols', min: 2, max: 8 });
    const aIn = ctx.input(A, { label: 'string A', width: '90px' });
    const bIn = ctx.input(B, { label: 'string B', width: '90px' });
    const sizeG = ctx.group(DSA.h('label', null, 'rows', rIn), DSA.h('label', null, 'cols', cIn));
    const strG = ctx.group(DSA.h('label', null, 'A', aIn), DSA.h('label', null, 'B', bIn));
    function applyInputs() {
      mode = modeSel.value;
      R = DSA.clamp(parseInt(rIn.value, 10) || 4, 2, 7); C = DSA.clamp(parseInt(cIn.value, 10) || 6, 2, 8);
      A = (aIn.value.toUpperCase().replace(/[^A-Z]/g, '') || 'ABCBDA').slice(0, 7);
      B = (bIn.value.toUpperCase().replace(/[^A-Z]/g, '') || 'BDCABA').slice(0, 7);
      sizeG.hidden = mode !== 'paths'; strG.hidden = mode !== 'lcs';
      build();
    }
    modeSel.addEventListener('change', applyInputs);
    ctx.group(modeSel, ctx.button('Apply', async () => applyInputs(), { title: 'Rebuild the table with these inputs' }));
    ctx.group(
      ctx.button('Play', () => { play(false); }, { primary: true, always: true, icon: 'play' }),
      ctx.button('Pause', () => { if (flow) flow.pause(); }, { always: true, icon: 'pause' }),
      ctx.button('Step', () => { play(true); }, { always: true, icon: 'next' }),
      ctx.button('Reset', () => { build(); }, { always: true, icon: 'reset' }),
      ctx.speedControl());
    ctx.legend([[PAL.violet, 'base case'], [PAL.accent, 'depends on'], [PAL.mint, 'letters match'], [PAL.ink, 'computed']]);
    sizeG.hidden = mode !== 'paths'; strG.hidden = mode !== 'lcs';
    build();
    return ctx;
  };
})();

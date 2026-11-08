/* 2D: dynamic-programming tables filled one cell at a time, with the cells
   each answer depends on highlighted and the recurrence written out.
   Modes: climb (stairs), rob (house robber), coins (coin change),
   lcs (longest common subsequence), edit (edit distance). */
(function () {
  'use strict';
  const DSA = window.DSA;
  const h = DSA.h, E = DSA.esc;
  const INF = Infinity;
  const show = (v) => (v === INF ? '∞' : v == null ? '' : String(v));

  const MODES = {
    climb: {
      title: 'Climbing stairs: dp[i] = dp[i-1] + dp[i-2]', cx: 'O(n)',
      fields: [{ key: 'n', label: 'stairs n', value: '7', type: 'num', short: true }],
      gen({ n }) {
        n = DSA.clamp(Math.round(n), 1, 14);
        const dp = new Array(n + 1).fill(null), steps = [];
        const tbl = (cur, deps) => ({ head: ['i'].concat(dp.map((_, i) => String(i))), rows: [{ label: 'ways', cells: dp.map((v, i) => ({ v: show(v), cls: i === cur ? 'cur' : deps.includes(i) ? 'dep' : v == null ? 'empty' : '' })) }] });
        dp[0] = 1; steps.push(Object.assign(tbl(0, []), { f: '<code>dp[0] = 1</code>: one way to stand still at the bottom.' }));
        dp[1] = 1; steps.push(Object.assign(tbl(1, []), { f: '<code>dp[1] = 1</code>: one single step.' }));
        for (let i = 2; i <= n; i++) {
          dp[i] = dp[i - 1] + dp[i - 2];
          steps.push(Object.assign(tbl(i, [i - 1, i - 2]), { f: `Your last move onto stair ${i} was either 1 step (from ${i - 1}) or 2 steps (from ${i - 2}): <code>dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = <b>${dp[i]}</b></code>` }));
        }
        steps.push(Object.assign(tbl(n, []), { f: `<b>${dp[n]}</b> ways to climb ${n} stairs. Plain recursion would recompute the same stairs again and again (2ⁿ calls); the table computes each once.` }));
        return steps;
      },
    },
    rob: {
      title: 'House robber: rob this house or skip it', cx: 'O(n)',
      fields: [{ key: 'nums', label: 'house values', value: '2, 7, 9, 3, 1, 5', type: 'nums' }],
      gen({ nums }) {
        nums = nums.map((x) => Math.abs(Math.round(x))).slice(0, 12);
        const n = nums.length, dp = new Array(n).fill(null), steps = [];
        const tbl = (cur, deps, numHot) => ({ head: ['house'].concat(nums.map((_, i) => String(i))), rows: [
          { label: 'value', cells: nums.map((v, i) => ({ v: String(v), cls: i === numHot ? 'dep' : '' })) },
          { label: 'best', cells: dp.map((v, i) => ({ v: show(v), cls: i === cur ? 'cur' : deps.includes(i) ? 'dep' : v == null ? 'empty' : '' })) }] });
        dp[0] = nums[0];
        steps.push(Object.assign(tbl(0, [], 0), { f: `<code>best[0] = ${nums[0]}</code>: with one house, rob it.` }));
        if (n > 1) { dp[1] = Math.max(nums[0], nums[1]); steps.push(Object.assign(tbl(1, [0], 1), { f: `<code>best[1] = max(${nums[0]}, ${nums[1]}) = <b>${dp[1]}</b></code>: you can only take one of the first two (they are neighbours).` })); }
        for (let i = 2; i < n; i++) {
          const skip = dp[i - 1], take = dp[i - 2] + nums[i];
          dp[i] = Math.max(skip, take);
          steps.push(Object.assign(tbl(i, [i - 1, i - 2], i), { f: `Skip house ${i}: keep <code>best[${i - 1}] = ${skip}</code>. Rob it: <code>best[${i - 2}] + ${nums[i]} = ${take}</code>. <code>best[${i}] = max(${skip}, ${take}) = <b>${dp[i]}</b></code>` }));
        }
        steps.push(Object.assign(tbl(n - 1, []), { f: `Maximum loot is <b>${dp[n - 1]}</b>. Each answer only needs the two before it, so you can even drop the table and keep two variables: O(1) space.` }));
        return steps;
      },
    },
    coins: {
      title: 'Coin change: fewest coins that make each amount', cx: 'O(amount × coins)',
      fields: [{ key: 'coins', label: 'coins', value: '1, 3, 4', type: 'nums' }, { key: 'amount', label: 'amount', value: '6', type: 'num', short: true }],
      gen({ coins, amount }) {
        coins = Array.from(new Set(coins.map((c) => Math.abs(Math.round(c))).filter((c) => c > 0))).sort((a, b) => a - b).slice(0, 5);
        amount = DSA.clamp(Math.round(amount), 1, 14);
        const dp = new Array(amount + 1).fill(null), steps = [];
        const tbl = (cur, deps) => ({ head: ['amount'].concat(dp.map((_, i) => String(i))), rows: [{ label: 'coins', cells: dp.map((v, i) => ({ v: show(v), cls: i === cur ? 'cur' : deps.includes(i) ? 'dep' : v == null ? 'empty' : '' })) }] });
        dp[0] = 0; steps.push(Object.assign(tbl(0, []), { f: '<code>dp[0] = 0</code>: zero coins make amount 0.' }));
        for (let a = 1; a <= amount; a++) {
          const deps = [], parts = [];
          let best = INF;
          for (const c of coins) if (c <= a) { deps.push(a - c); parts.push(`dp[${a - c}]+1 = ${show(dp[a - c] + 1)}`); best = Math.min(best, dp[a - c] + 1); }
          dp[a] = best;
          steps.push(Object.assign(tbl(a, deps), { f: deps.length ? `Try each coin as the last one: ${parts.join(', ')} → <code>dp[${a}] = <b>${show(best)}</b></code>` : `No coin fits into ${a}: <code>dp[${a}] = ∞</code>` }));
        }
        steps.push(Object.assign(tbl(amount, []), { f: dp[amount] === INF ? `Amount ${amount} cannot be made: answer −1.` : `Fewest coins for ${amount}: <b>${dp[amount]}</b>. Note greedy (take the biggest coin first) can fail here: for 6 with [1,3,4] greedy gives 4+1+1 = 3 coins, DP finds 3+3 = 2.` }));
        return steps;
      },
    },
    lcs: {
      title: 'Longest common subsequence: dp[i][j] on prefixes', cx: 'O(m·n)',
      fields: [{ key: 'a', label: 'text A', value: 'ABCBDA', type: 'str' }, { key: 'b', label: 'text B', value: 'BDCABA', type: 'str' }],
      gen({ a, b }) { return grid2(a, b, 'lcs'); },
    },
    edit: {
      title: 'Edit distance: fewest inserts, deletes and replaces', cx: 'O(m·n)',
      fields: [{ key: 'a', label: 'from', value: 'horse', type: 'str' }, { key: 'b', label: 'to', value: 'ros', type: 'str' }],
      gen({ a, b }) { return grid2(a, b, 'edit'); },
    },
  };

  function grid2(a, b, kind) {
    a = a.slice(0, 8); b = b.slice(0, 8);
    const m = a.length, n = b.length, steps = [];
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const tbl = (cur, deps, path) => ({
      head: ['', 'ε'].concat(b.split('')), hlCol: cur ? cur[1] + 1 : -1,
      rows: dp.map((row, i) => ({ label: i ? a[i - 1] : 'ε', hl: cur && cur[0] === i, cells: row.map((v, j) => {
        let cls = v == null ? 'empty' : '';
        if (path && path.has(i + ',' + j)) cls = 'path';
        if (deps.some(([x, y]) => x === i && y === j)) cls = 'dep';
        if (cur && cur[0] === i && cur[1] === j) cls = 'cur';
        return { v: show(v), cls };
      }) })),
    });
    for (let i = 0; i <= m; i++) for (let j = 0; j <= n; j++) {
      let f;
      if (kind === 'lcs') {
        if (!i || !j) { dp[i][j] = 0; f = `<code>dp[${i}][${j}] = 0</code>: an empty prefix shares nothing.`; steps.push(Object.assign(tbl([i, j], []), { f })); continue; }
        if (a[i - 1] === b[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; f = `'${E(a[i - 1])}' == '${E(b[j - 1])}': extend the diagonal. <code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = <b>${dp[i][j]}</b></code>`; steps.push(Object.assign(tbl([i, j], [[i - 1, j - 1]]), { f })); }
        else { dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); f = `'${E(a[i - 1])}' ≠ '${E(b[j - 1])}': drop a letter from one side. <code>max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = <b>${dp[i][j]}</b></code>`; steps.push(Object.assign(tbl([i, j], [[i - 1, j], [i, j - 1]]), { f })); }
      } else {
        if (!i || !j) { dp[i][j] = i + j; f = !i ? `<code>dp[0][${j}] = ${j}</code>: turn "" into "${E(b.slice(0, j))}" with ${j} insert${j === 1 ? '' : 's'}.` : `<code>dp[${i}][0] = ${i}</code>: turn "${E(a.slice(0, i))}" into "" with ${i} delete${i === 1 ? '' : 's'}.`; steps.push(Object.assign(tbl([i, j], []), { f })); continue; }
        if (a[i - 1] === b[j - 1]) { dp[i][j] = dp[i - 1][j - 1]; f = `'${E(a[i - 1])}' == '${E(b[j - 1])}': no edit needed. <code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = <b>${dp[i][j]}</b></code>`; steps.push(Object.assign(tbl([i, j], [[i - 1, j - 1]]), { f })); }
        else {
          const del = dp[i - 1][j], ins = dp[i][j - 1], rep = dp[i - 1][j - 1];
          dp[i][j] = 1 + Math.min(del, ins, rep);
          f = `'${E(a[i - 1])}' ≠ '${E(b[j - 1])}': 1 + min(delete ${del}, insert ${ins}, replace ${rep}) = <b>${dp[i][j]}</b>`;
          steps.push(Object.assign(tbl([i, j], [[i - 1, j], [i, j - 1], [i - 1, j - 1]]), { f }));
        }
      }
    }
    /* trace back the chosen path */
    const path = new Set();
    let i = m, j = n, letters = [];
    while (i > 0 && j > 0) {
      path.add(i + ',' + j);
      if (a[i - 1] === b[j - 1]) { letters.push(a[i - 1]); i--; j--; }
      else if (kind === 'lcs') { if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
      else { const best = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]); if (dp[i - 1][j - 1] === best) { i--; j--; } else if (dp[i - 1][j] === best) i--; else j--; }
    }
    path.add(i + ',' + j);
    const fin = kind === 'lcs'
      ? `LCS length <b>${dp[m][n]}</b>: "${E(letters.reverse().join(''))}". The green cells show how the answer was built.`
      : `Edit distance is <b>${dp[m][n]}</b>. Follow the green cells back from the corner to read off the edits.`;
    steps.push(Object.assign(tbl(null, [], path), { f: fin }));
    return steps;
  }

  DSA.widgets.dp = function (container, o) {
    const M = MODES[o.mode] || MODES.climb;
    const fig = DSA.figure({ kicker: o.kicker, title: o.title || M.title, flat: true, inputs: true, caption: o.caption, hint: 'Space plays · ← → step' });
    container.append(fig.root);
    const tableWrap = h('div', { class: 'dp-wrap' });
    fig.stage.append(tableWrap);
    const player = DSA.player(fig, { render, interval: o.interval || 1300 });
    function render(st) {
      const t = h('table', { class: 'dp-tbl' });
      t.append(h('thead', null, h('tr', null, st.head.map((x, k) => h('th', { class: k - 1 === st.hlCol ? 'hl' : '' }, x)))));
      const tb = h('tbody');
      for (const row of st.rows) tb.append(h('tr', null, h('th', { class: row.hl ? 'hl' : '' }, row.label), row.cells.map((c) => h('td', { class: c.cls }, c.v))));
      t.append(tb);
      tableWrap.innerHTML = '';
      tableWrap.append(t);
      fig.say(st.f, M.cx);
    }
    const fields = M.fields.map((f) => Object.assign({}, f, o.values && o.values[f.key] != null ? { value: String(o.values[f.key]) } : {}));
    const read = DSA.widgetInputs(fig, fields, apply);
    function apply() { try { player.setSteps(M.gen(read())); } catch (e) { console.error(e); fig.say('Could not run that input.'); } }
    apply();
    return { destroy: player.destroy };
  };
})();

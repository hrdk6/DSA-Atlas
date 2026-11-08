/* 2D: array pattern demos (two pointers, sliding window, binary search,
   prefix sums, Kadane, monotonic stack, hash map lookups). Each demo turns
   the user's input into a list of steps; the shared player animates them. */
(function () {
  'use strict';
  const DSA = window.DSA;
  const h = DSA.h, E = DSA.esc;

  function dimOut(n, lo, hi, extra) {
    const c = {};
    for (let i = 0; i < n; i++) if (i < lo || i > hi) c[i] = 'dim';
    return Object.assign(c, extra || {});
  }
  const fmt = (xs) => '[' + xs.join(', ') + ']';

  const DEMOS = {
    pairSum: {
      title: 'Two pointers: find a pair with the target sum (sorted array)', cx: 'O(n)',
      fields: [{ key: 'arr', label: 'sorted array', value: '1, 3, 4, 6, 8, 11, 15', type: 'nums' }, { key: 'target', label: 'target', value: '14', type: 'num', short: true }],
      gen({ arr, target }) {
        arr = arr.slice().sort((a, b) => a - b);
        const st = [];
        let l = 0, r = arr.length - 1;
        st.push({ arr, ptrs: { l, r }, msg: 'Start <code>l</code> at the smallest value and <code>r</code> at the largest. Because the array is sorted, moving <code>l</code> right makes the sum bigger and moving <code>r</code> left makes it smaller.' });
        while (l < r) {
          const s = arr[l] + arr[r];
          const base = { arr, ptrs: { l, r }, cls: dimOut(arr.length, l, r, { [l]: 'cmp', [r]: 'cmp' }), vars: [['sum', s, 'hot'], ['target', target]] };
          if (s === target) { st.push(Object.assign(base, { cls: dimOut(arr.length, l, r, { [l]: 'hit', [r]: 'hit' }), vars: [['sum', s, 'good'], ['target', target]], msg: `${arr[l]} + ${arr[r]} = ${s}. Found it: indices <b>${l}</b> and <b>${r}</b>, after looking at each element at most once.` })); return st; }
          if (s < target) { st.push(Object.assign(base, { msg: `${arr[l]} + ${arr[r]} = ${s} &lt; ${target}: too small. Even the biggest partner can't rescue <b>${arr[l]}</b>, so it is useless: <code>l += 1</code>.` })); l++; }
          else { st.push(Object.assign(base, { msg: `${arr[l]} + ${arr[r]} = ${s} &gt; ${target}: too big. Even the smallest partner is too much for <b>${arr[r]}</b>: <code>r -= 1</code>.` })); r--; }
        }
        st.push({ arr, ptrs: { l, r }, cls: dimOut(arr.length, 1, 0), msg: 'The pointers met: no pair adds up to the target.' });
        return st;
      },
    },
    reverse: {
      title: 'Two pointers: reverse in place by swapping the ends', cx: 'O(n)',
      fields: [{ key: 's', label: 'text', value: 'python', type: 'str' }],
      gen({ s }) {
        const arr = s.slice(0, 14).split('');
        const st = [];
        let l = 0, r = arr.length - 1;
        st.push({ arr: arr.slice(), ptrs: { l, r }, msg: 'Put one pointer at each end. Swap, then walk both inward. No second list needed: O(1) extra space.' });
        while (l < r) {
          st.push({ arr: arr.slice(), ptrs: { l, r }, cls: { [l]: 'cmp', [r]: 'cmp' }, msg: `Swap <code>s[${l}]</code> ('${E(arr[l])}') and <code>s[${r}]</code> ('${E(arr[r])}').` });
          [arr[l], arr[r]] = [arr[r], arr[l]];
          st.push({ arr: arr.slice(), ptrs: { l, r }, cls: { [l]: 'hit', [r]: 'hit' }, msg: `Swapped. Now <code>l += 1</code>, <code>r -= 1</code>.` });
          l++; r--;
        }
        st.push({ arr: arr.slice(), ptrs: { l, r }, cls: Object.fromEntries(arr.map((_, i) => [i, 'done'])), msg: `Pointers met in the middle: reversed to "<b>${E(arr.join(''))}</b>" in n/2 swaps.` });
        return st;
      },
    },
    palindrome: {
      title: 'Two pointers: is it a palindrome?', cx: 'O(n)',
      fields: [{ key: 's', label: 'text', value: 'racecar', type: 'str' }],
      gen({ s }) {
        const arr = s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16).split('');
        const st = [];
        let l = 0, r = arr.length - 1;
        st.push({ arr, ptrs: { l, r }, msg: 'After lowercasing and dropping non-letters, compare the outside pair and work inward.' });
        while (l < r) {
          if (arr[l] !== arr[r]) { st.push({ arr, ptrs: { l, r }, cls: { [l]: 'bad', [r]: 'bad' }, msg: `'${E(arr[l])}' ≠ '${E(arr[r])}': <b>not</b> a palindrome. We can stop at the first mismatch.` }); return st; }
          st.push({ arr, ptrs: { l, r }, cls: { [l]: 'hit', [r]: 'hit' }, msg: `'${E(arr[l])}' == '${E(arr[r])}'. Move both inward.` });
          l++; r--;
        }
        st.push({ arr, ptrs: { l, r }, cls: Object.fromEntries(arr.map((_, i) => [i, 'done'])), msg: 'Every mirrored pair matched: it <b>is</b> a palindrome.' });
        return st;
      },
    },
    container: {
      title: 'Two pointers: container with most water', cx: 'O(n)',
      fields: [{ key: 'arr', label: 'heights', value: '1, 8, 6, 2, 5, 4, 8, 3, 7', type: 'nums' }],
      gen({ arr }) {
        arr = arr.map((x) => Math.max(0, Math.round(x))).slice(0, 14);
        const st = [];
        let l = 0, r = arr.length - 1, best = 0, bl = 0, br = 0;
        st.push({ arr, bars: true, ptrs: { l, r }, win: [l, r], msg: 'Start as wide as possible. The water level is set by the <b>shorter</b> wall.' });
        while (l < r) {
          const area = Math.min(arr[l], arr[r]) * (r - l);
          const better = area > best;
          if (better) { best = area; bl = l; br = r; }
          const moveL = arr[l] < arr[r];
          st.push({ arr, bars: true, ptrs: { l, r }, win: [l, r], cls: { [l]: moveL ? 'cmp' : '', [r]: moveL ? '' : 'cmp' }, vars: [['area', `min(${arr[l]}, ${arr[r]}) × ${r - l} = ${area}`, better ? 'good' : 'hot'], ['best', best]],
            msg: `${better ? 'New best! ' : ''}Moving the taller wall can only shrink the width without raising the level, so move the <b>shorter</b> one: <code>${moveL ? 'l += 1' : 'r -= 1'}</code>.` });
          if (moveL) l++; else r--;
        }
        st.push({ arr, bars: true, ptrs: { l: bl, r: br }, win: [bl, br], cls: { [bl]: 'hit', [br]: 'hit' }, vars: [['best', best, 'good']], msg: `Maximum water is <b>${best}</b>, between walls ${bl} and ${br}. One pass instead of checking all n² pairs.` });
        return st;
      },
    },
    moveZeroes: {
      title: 'Same-direction pointers: move zeroes to the end', cx: 'O(n)',
      fields: [{ key: 'arr', label: 'array', value: '0, 1, 0, 3, 12', type: 'nums' }],
      gen({ arr }) {
        arr = arr.slice(0, 14);
        const st = [];
        let w = 0;
        st.push({ arr: arr.slice(), ptrs: { w, read: 0 }, msg: '<code>w</code> marks where the next non-zero belongs. <code>read</code> scans every element once.' });
        for (let r = 0; r < arr.length; r++) {
          if (arr[r] !== 0) {
            st.push({ arr: arr.slice(), ptrs: { w, read: r }, cls: { [r]: 'cmp', [w]: 'cmp' }, msg: `<code>nums[${r}] = ${arr[r]}</code> is non-zero: swap it into position <code>w = ${w}</code>, then <code>w += 1</code>.` });
            [arr[w], arr[r]] = [arr[r], arr[w]];
            w++;
            st.push({ arr: arr.slice(), ptrs: { w, read: r }, cls: { [w - 1]: 'hit' }, msg: `Everything left of <code>w</code> is now the non-zero values in their original order.` });
          } else st.push({ arr: arr.slice(), ptrs: { w, read: r }, cls: { [r]: 'dim' }, msg: `<code>nums[${r}]</code> is 0: skip it. <code>w</code> stays put.` });
        }
        st.push({ arr: arr.slice(), ptrs: { w }, cls: Object.fromEntries(arr.map((v, i) => [i, v ? 'done' : 'dim'])), msg: 'Done in one pass. The zeroes ended up at the end because every non-zero was swapped forward past them.' });
        return st;
      },
    },
    fixedWindow: {
      title: 'Fixed sliding window: largest sum of k consecutive numbers', cx: 'O(n)',
      fields: [{ key: 'arr', label: 'array', value: '2, 1, 5, 1, 3, 2, 6, 1', type: 'nums' }, { key: 'k', label: 'k', value: '3', type: 'num', short: true }],
      gen({ arr, k }) {
        arr = arr.slice(0, 14); k = DSA.clamp(Math.round(k), 1, arr.length);
        const st = [];
        let s = 0;
        for (let i = 0; i < k; i++) s += arr[i];
        let best = s, bi = 0;
        st.push({ arr, win: [0, k - 1], ptrs: { l: 0, r: k - 1 }, vars: [['window sum', s, 'hot'], ['best', best]], msg: `Sum the first window once: ${arr.slice(0, k).join(' + ')} = <b>${s}</b>.` });
        for (let r = k; r < arr.length; r++) {
          const out = arr[r - k];
          s += arr[r] - out;
          const better = s > best;
          if (better) { best = s; bi = r - k + 1; }
          st.push({ arr, win: [r - k + 1, r], ptrs: { l: r - k + 1, r }, cls: { [r]: 'hit', [r - k]: 'bad' }, vars: [['window sum', s, better ? 'good' : 'hot'], ['best', best]],
            msg: `Slide right: add <b>${arr[r]}</b>, subtract <b>${out}</b> → ${s}. Two operations instead of re-adding all ${k} numbers.${better ? ' New best!' : ''}` });
        }
        st.push({ arr, win: [bi, bi + k - 1], ptrs: { l: bi, r: bi + k - 1 }, vars: [['best', best, 'good']], msg: `Largest window sum is <b>${best}</b>. O(n) instead of O(n·k).` });
        return st;
      },
    },
    longestUnique: {
      title: 'Variable sliding window: longest substring without repeats', cx: 'O(n)',
      fields: [{ key: 's', label: 'string', value: 'abcabcbb', type: 'str' }],
      gen({ s }) {
        const arr = s.slice(0, 16).split('');
        const st = [];
        const seen = new Set();
        let l = 0, best = 0, bl = 0, br = -1;
        for (let r = 0; r < arr.length; r++) {
          while (seen.has(arr[r])) {
            st.push({ arr, win: [l, r - 1], ptrs: { l, r }, cls: { [r]: 'bad', [l]: 'cmp' }, lanes: [{ name: 'window set', items: Array.from(seen), hot: Array.from(seen).indexOf(arr[l]) }], vars: [['best', best]],
              msg: `'${E(arr[r])}' is already in the window. Shrink from the left: remove '${E(arr[l])}', <code>l += 1</code>.` });
            seen.delete(arr[l]); l++;
          }
          seen.add(arr[r]);
          const better = r - l + 1 > best;
          if (better) { best = r - l + 1; bl = l; br = r; }
          st.push({ arr, win: [l, r], ptrs: { l, r }, cls: { [r]: 'hit' }, lanes: [{ name: 'window set', items: Array.from(seen), hot: seen.size - 1 }], vars: [['window', `"${E(arr.slice(l, r + 1).join(''))}"`, 'hot'], ['best', best, better ? 'good' : '']],
            msg: `Add '${E(arr[r])}' on the right. The window has no duplicates, length ${r - l + 1}.${better ? ' New best!' : ''}` });
        }
        st.push({ arr, win: [bl, br], ptrs: { l: bl, r: br }, vars: [['answer', best, 'good']], msg: `Longest run without repeats: "<b>${E(arr.slice(bl, br + 1).join(''))}</b>", length ${best}. Each character enters and leaves the window at most once: O(n).` });
        return st;
      },
    },
    minWindowSum: {
      title: 'Variable sliding window: shortest subarray with sum ≥ target', cx: 'O(n)',
      fields: [{ key: 'arr', label: 'positive numbers', value: '2, 3, 1, 2, 4, 3', type: 'nums' }, { key: 'target', label: 'target', value: '7', type: 'num', short: true }],
      gen({ arr, target }) {
        arr = arr.map((x) => Math.abs(x)).slice(0, 14);
        const st = [];
        let l = 0, s = 0, best = Infinity, bl = 0, br = -1;
        for (let r = 0; r < arr.length; r++) {
          s += arr[r];
          st.push({ arr, win: [l, r], ptrs: { l, r }, cls: { [r]: 'hit' }, vars: [['sum', s, 'hot'], ['best', best === Infinity ? '∞' : best]], msg: `Grow: add ${arr[r]} → sum ${s}${s >= target ? ` ≥ ${target}, so try shrinking.` : ` &lt; ${target}, keep growing.`}` });
          while (s >= target) {
            if (r - l + 1 < best) { best = r - l + 1; bl = l; br = r; }
            st.push({ arr, win: [l, r], ptrs: { l, r }, cls: { [l]: 'bad' }, vars: [['sum', s, 'good'], ['best', best]], msg: `Valid window of length ${r - l + 1}. Drop ${arr[l]} from the left to see if a shorter one still works.` });
            s -= arr[l]; l++;
          }
        }
        st.push({ arr, win: best === Infinity ? null : [bl, br], ptrs: best === Infinity ? {} : { l: bl, r: br }, vars: [['answer', best === Infinity ? 0 : best, 'good']], msg: best === Infinity ? 'No window reaches the target: answer 0.' : `Shortest length is <b>${best}</b>. Both pointers only move right, so the total work is O(n).` });
        return st;
      },
    },
    binarySearch: {
      title: 'Binary search: halve the range every step', cx: 'O(log n)',
      fields: [{ key: 'arr', label: 'sorted array', value: '2, 5, 8, 12, 16, 23, 38, 56, 72, 91', type: 'nums' }, { key: 'target', label: 'target', value: '23', type: 'num', short: true }],
      gen({ arr, target }) {
        arr = arr.slice().sort((a, b) => a - b).slice(0, 16);
        const st = [];
        let lo = 0, hi = arr.length - 1, n = 0;
        st.push({ arr, ptrs: { lo, hi }, msg: `Search for <b>${target}</b>. The answer, if it exists, is always inside <code>[lo, hi]</code>.` });
        while (lo <= hi) {
          const mid = (lo + hi) >> 1; n++;
          const c = arr[mid] === target ? 'hit' : 'cmp';
          if (arr[mid] === target) { st.push({ arr, ptrs: { lo, mid, hi }, cls: dimOut(arr.length, lo, hi, { [mid]: c }), vars: [['steps', n, 'good']], msg: `<code>arr[${mid}] = ${arr[mid]}</code>: found at index <b>${mid}</b> in ${n} step${n > 1 ? 's' : ''}.` }); return st; }
          if (arr[mid] < target) { st.push({ arr, ptrs: { lo, mid, hi }, cls: dimOut(arr.length, lo, hi, { [mid]: c }), vars: [['steps', n]], msg: `<code>mid = (${lo} + ${hi}) // 2 = ${mid}</code>, <code>arr[mid] = ${arr[mid]} &lt; ${target}</code> → everything up to mid is too small: <code>lo = mid + 1</code>.` }); lo = mid + 1; }
          else { st.push({ arr, ptrs: { lo, mid, hi }, cls: dimOut(arr.length, lo, hi, { [mid]: c }), vars: [['steps', n]], msg: `<code>mid = ${mid}</code>, <code>arr[mid] = ${arr[mid]} &gt; ${target}</code> → everything from mid on is too big: <code>hi = mid - 1</code>.` }); hi = mid - 1; }
        }
        st.push({ arr, ptrs: { hi, lo }, cls: dimOut(arr.length, 1, 0), vars: [['steps', n]], msg: `<code>lo &gt; hi</code>: the range is empty, so ${target} is not in the array. (It would be inserted at index ${lo}.)` });
        return st;
      },
    },
    lowerBound: {
      title: 'Binary search for a boundary: first index with arr[i] ≥ target', cx: 'O(log n)',
      fields: [{ key: 'arr', label: 'sorted array', value: '1, 3, 3, 5, 5, 5, 8, 9', type: 'nums' }, { key: 'target', label: 'target', value: '5', type: 'num', short: true }],
      gen({ arr, target }) {
        arr = arr.slice().sort((a, b) => a - b).slice(0, 16);
        const st = [];
        let lo = 0, hi = arr.length;
        st.push({ arr, ptrs: { lo, hi }, msg: `Half-open range <code>[lo, hi)</code>: the answer is somewhere in it, and <code>hi = len(arr)</code> means "maybe past the end". This is what <code>bisect_left</code> does.` });
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (arr[mid] < target) { st.push({ arr, ptrs: { lo, mid, hi }, cls: dimOut(arr.length, lo, hi - 1, { [mid]: 'bad' }), msg: `<code>arr[${mid}] = ${arr[mid]} &lt; ${target}</code>: the boundary is to the right. <code>lo = mid + 1</code>.` }); lo = mid + 1; }
          else { st.push({ arr, ptrs: { lo, mid, hi }, cls: dimOut(arr.length, lo, hi - 1, { [mid]: 'hit' }), msg: `<code>arr[${mid}] = ${arr[mid]} ≥ ${target}</code>: mid could be the answer, so keep it: <code>hi = mid</code>.` }); hi = mid; }
        }
        st.push({ arr, ptrs: { 'lo=hi': lo }, cls: lo < arr.length ? { [lo]: 'hit' } : {}, msg: `<code>lo == hi == ${lo}</code>. The first value ≥ ${target} is at index <b>${lo}</b>${lo === arr.length ? ' (past the end: everything is smaller)' : ''}. Every index before it is &lt; ${target}.` });
        return st;
      },
    },
    prefixSum: {
      title: 'Prefix sums: any range sum in O(1)', cx: 'O(1)',
      fields: [{ key: 'arr', label: 'array', value: '3, 1, 4, 1, 5, 9, 2, 6', type: 'nums' }, { key: 'l', label: 'from i', value: '2', type: 'num', short: true }, { key: 'r', label: 'to j', value: '5', type: 'num', short: true }],
      gen({ arr, l, r }) {
        arr = arr.slice(0, 14);
        l = DSA.clamp(Math.round(l), 0, arr.length - 1); r = DSA.clamp(Math.round(r), l, arr.length - 1);
        const st = [], P = [0];
        st.push({ arr, lanes: [{ name: 'prefix', items: P.slice(), hot: 0 }], cx: 'O(n)', msg: '<code>prefix[0] = 0</code>. <code>prefix[i]</code> will be the sum of the first i numbers.' });
        for (let i = 0; i < arr.length; i++) {
          P.push(P[i] + arr[i]);
          st.push({ arr, ptrs: { i }, cls: { [i]: 'hit' }, lanes: [{ name: 'prefix', items: P.slice(), hot: i + 1 }], cx: 'O(n)', msg: `<code>prefix[${i + 1}] = prefix[${i}] + nums[${i}] = ${P[i]} + ${arr[i]} = ${P[i + 1]}</code>` });
        }
        const sum = P[r + 1] - P[l];
        st.push({ arr, win: [l, r], ptrs: { i: l, j: r }, lanes: [{ name: 'prefix', items: P.slice(), hot: r + 1 }], vars: [['sum', `prefix[${r + 1}] − prefix[${l}] = ${P[r + 1]} − ${P[l]} = ${sum}`, 'good']], msg: `Sum of <code>nums[${l}..${r}]</code> = everything up to ${r} minus everything before ${l}. One subtraction, no loop. Built once in O(n), then every query is O(1).` });
        return st;
      },
    },
    subarraySumK: {
      title: 'Prefix sum + hash map: count subarrays that sum to k', cx: 'O(n)',
      fields: [{ key: 'arr', label: 'array', value: '1, 2, 3, -2, 2, 1', type: 'nums' }, { key: 'k', label: 'k', value: '3', type: 'num', short: true }],
      gen({ arr, k }) {
        arr = arr.slice(0, 14);
        const st = [], seen = new Map([[0, 1]]);
        let pre = 0, count = 0;
        const lane = (hot) => [{ name: 'seen', kind: 'map', items: Array.from(seen.entries()), hot }];
        st.push({ arr, lanes: lane(0), vars: [['prefix', 0], ['count', 0]], msg: 'Store how many times each prefix sum has appeared. Start with <code>{0: 1}</code> for the empty prefix.' });
        for (let i = 0; i < arr.length; i++) {
          pre += arr[i];
          const need = pre - k, got = seen.get(need) || 0;
          count += got;
          st.push({ arr, ptrs: { i }, win: [0, i], cls: { [i]: 'hit' }, lanes: lane(need), vars: [['prefix', pre, 'hot'], ['prefix − k', need], ['count', count, got ? 'good' : '']],
            msg: `Prefix is ${pre}. A subarray ending here sums to ${k} exactly when an earlier prefix equals <b>${pre} − ${k} = ${need}</b>. Seen ${got} time${got === 1 ? '' : 's'} → count += ${got}.` });
          seen.set(pre, (seen.get(pre) || 0) + 1);
        }
        st.push({ arr, lanes: lane(null), vars: [['answer', count, 'good']], msg: `<b>${count}</b> subarrays sum to ${k}. Works with negative numbers too, where a sliding window would fail.` });
        return st;
      },
    },
    kadane: {
      title: "Kadane's algorithm: maximum subarray sum", cx: 'O(n)',
      fields: [{ key: 'arr', label: 'array', value: '-2, 1, -3, 4, -1, 2, 1, -5, 4', type: 'nums' }],
      gen({ arr }) {
        arr = arr.slice(0, 14);
        const st = [];
        let cur = arr[0], best = arr[0], s = 0, bs = 0, be = 0;
        st.push({ arr, win: [0, 0], ptrs: { i: 0 }, vars: [['cur', cur, 'hot'], ['best', best]], msg: 'Start with the first element as both the current run and the best.' });
        for (let i = 1; i < arr.length; i++) {
          const extend = cur + arr[i];
          let msg;
          if (arr[i] > extend) { cur = arr[i]; s = i; msg = `Extending gives ${extend}, but starting fresh at ${arr[i]} is better: the previous run was dragging us down. <code>cur = ${cur}</code>.`; }
          else { cur = extend; msg = `Extend the run: <code>cur = ${cur - arr[i]} + ${arr[i]} = ${cur}</code>.`; }
          const better = cur > best;
          if (better) { best = cur; bs = s; be = i; msg += ' New best!'; }
          st.push({ arr, win: [s, i], ptrs: { i }, cls: { [i]: 'hit' }, vars: [['cur', cur, 'hot'], ['best', best, better ? 'good' : '']], msg });
        }
        st.push({ arr, win: [bs, be], ptrs: { start: bs, end: be }, vars: [['answer', best, 'good']], msg: `Maximum subarray is <code>${fmt(arr.slice(bs, be + 1))}</code> with sum <b>${best}</b>. At each index: "extend or restart?", one pass.` });
        return st;
      },
    },
    nextGreater: {
      title: 'Monotonic stack: next greater element', cx: 'O(n)',
      fields: [{ key: 'arr', label: 'array', value: '2, 1, 2, 4, 3, 1, 5', type: 'nums' }],
      gen({ arr }) {
        arr = arr.slice(0, 14);
        const st = [], stack = [], res = arr.map(() => -1);
        const lanes = (hot) => [{ name: 'stack', items: stack.map((j) => `${arr[j]}@${j}`), hot, empty: 'empty' }, { name: 'answer', items: res.slice() }];
        st.push({ arr, lanes: lanes(null), msg: 'The stack holds indices still <b>waiting</b> for a bigger number. Their values decrease from bottom to top.' });
        for (let i = 0; i < arr.length; i++) {
          while (stack.length && arr[stack[stack.length - 1]] < arr[i]) {
            const j = stack[stack.length - 1];
            st.push({ arr, ptrs: { i, waiting: j }, cls: { [i]: 'hit', [j]: 'cmp' }, lanes: lanes(stack.length - 1), msg: `<b>${arr[i]}</b> &gt; ${arr[j]} (index ${j}, top of stack): ${arr[i]} is the next greater element for index ${j}. Pop it.` });
            stack.pop(); res[j] = arr[i];
          }
          stack.push(i);
          st.push({ arr, ptrs: { i }, cls: { [i]: 'cmp' }, lanes: lanes(stack.length - 1), msg: `Push index ${i} (${arr[i]}). It waits until something bigger shows up.` });
        }
        st.push({ arr, lanes: lanes(null), msg: `Anything left on the stack never found a bigger number: answer stays −1. Each index is pushed once and popped at most once: O(n), not O(n²).` });
        return st;
      },
    },
    twoSumHash: {
      title: 'Hash map: Two Sum in one pass', cx: 'O(n)',
      fields: [{ key: 'arr', label: 'array', value: '11, 2, 15, 7, 4', type: 'nums' }, { key: 'target', label: 'target', value: '9', type: 'num', short: true }],
      gen({ arr, target }) {
        arr = arr.slice(0, 14);
        const st = [], seen = new Map();
        const lane = (hot) => [{ name: 'seen', kind: 'map', items: Array.from(seen.entries()), hot, empty: '{}' }];
        st.push({ arr, lanes: lane(null), msg: 'For each number, ask the map: "have I already seen the partner that completes the target?"' });
        for (let i = 0; i < arr.length; i++) {
          const need = target - arr[i];
          if (seen.has(need)) {
            st.push({ arr, ptrs: { i, partner: seen.get(need) }, cls: { [i]: 'hit', [seen.get(need)]: 'hit' }, lanes: lane(need), vars: [['need', need, 'good']], msg: `Need ${target} − ${arr[i]} = <b>${need}</b>, and it is in the map at index ${seen.get(need)}. Answer: <code>[${seen.get(need)}, ${i}]</code>.` });
            return st;
          }
          st.push({ arr, ptrs: { i }, cls: { [i]: 'cmp' }, lanes: lane(null), vars: [['need', need, 'hot']], msg: `Need ${target} − ${arr[i]} = <b>${need}</b>. Not seen yet, so store <code>seen[${arr[i]}] = ${i}</code> and move on.` });
          seen.set(arr[i], i);
        }
        st.push({ arr, lanes: lane(null), msg: 'No pair found.' });
        return st;
      },
    },
  };

  function render(fig, st, demo) {
    const stage = fig.stage;
    stage.innerHTML = '';
    const n = st.arr.length;
    const names = Object.keys(st.ptrs || {});
    const colorOf = {};
    names.forEach((k, i) => { colorOf[k] = 'p' + (i % 5); });
    const extra = names.some((k) => st.ptrs[k] === n) ? 1 : 0;
    const maxV = st.bars ? Math.max(1, ...st.arr) : 1;
    const row = h('div', { class: 'w-arr' });
    for (let i = 0; i < n + extra; i++) {
      const col = h('div', { class: 'w-col' });
      if (i < n) {
        const c = st.cls && st.cls[i];
        let cls = 'cell' + (st.bars ? ' bar' : '') + (c ? ' ' + c : '');
        if (st.win && i >= st.win[0] && i <= st.win[1] && (!c || c === 'win')) cls += ' win';
        const cell = h('div', { class: cls }, String(st.arr[i]));
        if (st.bars) cell.style.height = 26 + (st.arr[i] / maxV) * 120 + 'px';
        col.append(cell);
      } else col.append(h('div', { class: 'cell', style: { opacity: '.3', borderStyle: 'dashed' } }, ''));
      col.append(h('div', { class: 'idx' }, String(i)));
      const slot = h('div', { class: 'ptr-slot' });
      for (const k of names) if (st.ptrs[k] === i) slot.append(h('span', { class: 'ptr ' + colorOf[k] }, k));
      col.append(slot);
      row.append(col);
    }
    stage.append(row);
    if (st.lanes && st.lanes.length) {
      const lanes = h('div', { class: 'lanes' });
      for (const ln of st.lanes) {
        const items = h('div', { class: 'lane-items' });
        if (!ln.items.length) items.append(h('span', { class: 'lane-empty' }, ln.empty || 'empty'));
        ln.items.forEach((it, j) => {
          const txt = ln.kind === 'map' ? `${it[0]}: ${it[1]}` : String(it);
          const hot = ln.hot != null && (ln.kind === 'map' ? String(it[0]) === String(ln.hot) : j === ln.hot);
          items.append(h('span', { class: 'tok' + (hot ? ' hot' : '') }, txt));
        });
        lanes.append(h('div', { class: 'lane' }, h('span', { class: 'lane-name' }, ln.name), items));
      }
      stage.append(lanes);
    }
    if (st.vars && st.vars.length) {
      stage.append(h('div', { class: 'w-vars' }, st.vars.map(([k, v, c]) => h('span', { class: 'w-var ' + (c || ''), html: E(k) + ' = <b>' + E(v) + '</b>' }))));
    }
    fig.say(st.msg, st.cx || demo.cx);
  }

  DSA.widgets.array = function (container, o) {
    const demo = DEMOS[o.demo] || DEMOS.pairSum;
    const fig = DSA.figure({ kicker: o.kicker, title: o.title || demo.title, flat: true, inputs: true, caption: o.caption, hint: 'Space plays · ← → step' });
    container.append(fig.root);
    const player = DSA.player(fig, { render: (st) => render(fig, st, demo), interval: o.interval || 1400 });
    const fields = demo.fields.map((f) => Object.assign({}, f, o.values && o.values[f.key] != null ? { value: String(o.values[f.key]) } : {}));
    const read = DSA.widgetInputs(fig, fields, apply);
    function apply() {
      try { player.setSteps(demo.gen(read())); }
      catch (e) { console.error(e); fig.say('Could not run that input. Use comma-separated numbers.'); }
    }
    apply();
    return { destroy: player.destroy };
  };
  DSA.widgets.array.demos = DEMOS;
})();

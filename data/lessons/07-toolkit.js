/* Toolkit: pattern recognition cheat sheet, templates, complexity reference. */
(function () {
  const { h, sub, p, tip, key, note, code, template, table, list, quiz } = DSA.L;
  const py = String.raw;
  const cx = (s) => DSA.cx(s);
  const L = (id, text) => `<a href="#/learn/${id}">${text}</a>`;

  DSA.addLesson({
    id: 'cheatsheet', group: 'Toolkit', title: 'Pattern cheat sheet', short: 'Cheat sheet', level: 'Reference', minutes: 10,
    blurb: '"If you see X, think Y", the core templates, and the Python costs to know cold. Read it before every interview.',
    summary: 'A one-page reference: how to recognise which pattern a problem wants, the code skeletons to start from, and the costs of common Python operations.',
    sections: [
      h('If you see… think…'),
      table(['Clue in the problem', 'Reach for', 'Chapter'], [
        ['Sorted array; pair / triplet with a target sum', 'Two pointers', L('two-pointers', 'Two pointers')],
        ['Find a value or boundary in sorted data', 'Binary search', L('binary-search', 'Binary search')],
        ['"Minimum x such that…" with a yes/no check', 'Binary search on the answer', L('binary-search', 'Binary search')],
        ['Longest / shortest contiguous subarray or substring', 'Sliding window', L('sliding-window', 'Sliding window')],
        ['Range sums, or "subarray sums to k" (with negatives)', 'Prefix sums (+ hash map)', L('prefix-sum', 'Prefix sums')],
        ['"Have I seen this?", counting, grouping, complement lookup', 'Hash map / set', L('hashing', 'Hash maps')],
        ['Matching brackets, nested structure, undo', 'Stack', L('stackqueue', 'Stacks & queues')],
        ['Next greater / smaller element, spans', 'Monotonic stack', L('monotonic-stack', 'Monotonic stack')],
        ['Top k / kth largest / k closest; repeatedly take the min', 'Heap', L('heaps', 'Heaps')],
        ['Linked list middle, cycle, n-th from end', 'Fast & slow pointers', L('linkedlist', 'Linked lists')],
        ['Tree problem', 'DFS recursion: "what does this call return?"', L('trees', 'Trees')],
        ['Anything "per level" in a tree', 'BFS with a queue', L('trees', 'Trees')],
        ['Shortest path, fewest moves (unweighted)', 'BFS', L('graphs', 'Graphs')],
        ['Connected regions, islands, reachability', 'DFS / BFS / Union-Find', L('graphs', 'Graphs')],
        ['Prerequisites, ordering with dependencies', 'Topological sort', L('graphs', 'Graphs')],
        ['Prefix matching over many words', 'Trie', L('tries', 'Tries')],
        ['"All combinations / permutations / subsets"', 'Backtracking', L('backtracking', 'Backtracking')],
        ['"Number of ways", "min cost", "max value", choices at each step', 'Dynamic programming', L('dp', 'DP')],
        ['Overlapping ranges, meetings', 'Sort, then sweep (or greedy by end)', L('intervals', 'Intervals')],
        ['Appears once / pairs cancel / powers of two', 'XOR and bit tricks', L('bits', 'Bits')],
      ]),
      h('Input size → the complexity you need'),
      table(['n up to', 'Aim for'], [['10', 'O(n!)'], ['20', 'O(2ⁿ)'], ['500', 'O(n³)'], ['5,000', 'O(n²)'], ['10⁶', 'O(n log n) or O(n)'], ['10⁹+', 'O(log n) or O(1)']]),
      h('Templates'),
      template('binary_search_first_true.py', py`
        lo, hi = LOW, HIGH
        while lo < hi:
            mid = (lo + hi) // 2
            if ok(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo
      `),
      template('sliding_window.py', py`
        l = 0
        for r in range(len(a)):
            add(a[r])
            while invalid():
                remove(a[l])
                l += 1
            best = max(best, r - l + 1)
      `),
      template('bfs.py', py`
        q = deque([start])
        seen = {start}
        while q:
            node = q.popleft()
            for nb in neighbours(node):
                if nb not in seen:
                    seen.add(nb)
                    q.append(nb)
      `),
      template('tree_dfs.py', py`
        def dfs(node):
            if not node:
                return BASE
            left, right = dfs(node.left), dfs(node.right)
            return combine(node, left, right)
      `),
      template('backtracking.py', py`
        def bt(start, path):
            if done(path):
                res.append(path[:])
                return
            for i in range(start, len(choices)):
                path.append(choices[i])
                bt(i + 1, path)
                path.pop()
      `),
      template('dp_top_down.py', py`
        @cache
        def solve(i):
            if i >= n:
                return BASE
            return best_of(choice_value + solve(next_i) for each choice)
      `),
      template('monotonic_stack.py', py`
        stack = []
        for i, x in enumerate(a):
            while stack and a[stack[-1]] < x:
                j = stack.pop()
                answer[j] = x          # x is j's next greater
            stack.append(i)
      `),
      template('topological_sort.py', py`
        q = deque(n for n in nodes if indeg[n] == 0)
        order = []
        while q:
            n = q.popleft()
            order.append(n)
            for m in graph[n]:
                indeg[m] -= 1
                if indeg[m] == 0:
                    q.append(m)
      `),
      h('Python operation costs'),
      table(['Operation', 'Cost'], [
        ['list index, append, pop()', cx('O(1)')],
        ['list insert(0), pop(0), x in list, slicing', cx('O(n)')],
        ['dict / set add, lookup, delete', cx('O(1)')],
        ['deque append / appendleft / pop / popleft', cx('O(1)')],
        ['heappush, heappop', cx('O(log n)')],
        ['heapify', cx('O(n)')],
        ['sorted, list.sort', cx('O(n log n)')],
        ['bisect_left / bisect_right', cx('O(log n)')],
        ['string concatenation in a loop', cx('O(n²)') + ' worst case: use join'],
      ]),
      h('Interview-day checklist'),
      list(['Restate the problem and confirm the input/output with an example.',
        'Ask about input size, sortedness, duplicates, negatives, empty input.',
        'Say the brute force and its complexity before optimising.',
        'Name the pattern you are using and why it fits.',
        'Write clean code with clear names; talk while you type.',
        'Trace an example through your code; test an edge case.',
        'State final time and space complexity.']),
      tip('Bookmark this page. Five minutes with this table before an interview is worth more than one more random problem.'),
    ],
  });
})();

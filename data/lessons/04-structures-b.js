/* Chapters: trees & BSTs, heaps, graphs, tries. */
(function () {
  const { h, sub, p, analogy, tip, warn, interview, key, note, code, template, table, steps, list, grid, quiz, problems, widget, viz3d } = DSA.L;
  const py = String.raw;
  const cx = (s) => DSA.cx(s);

  DSA.addLesson({
    id: 'trees', group: 'Data structures', title: 'Binary trees & binary search trees', short: 'Trees & BSTs', level: 'Intermediate', minutes: 35,
    blurb: 'Recursion\'s natural home. Traversals, the "what does this call return?" mindset, and BST ordering.',
    summary: 'A binary tree is a node with up to two child trees. Nearly every tree problem is solved by one recursive function that handles a single node and trusts the recursion for its children.',
    sections: [
      h('Vocabulary'),
      grid([
        { title: 'Root, children, leaves', html: 'The top node is the <b>root</b>. Each node has a <b>left</b> and <b>right</b> child (either may be None). Nodes with no children are <b>leaves</b>.' },
        { title: 'Depth and height', html: '<b>Depth</b>: edges from the root down to a node. <b>Height</b>: edges on the longest path down to a leaf. A tree of n nodes has height between log₂ n (balanced) and n − 1 (a stick).' },
        { title: 'Subtree', html: 'Any node together with everything below it is a tree in its own right. That self-similarity is why recursion fits so well.' },
      ]),
      code(py`
        class TreeNode:
            def __init__(self, val=0, left=None, right=None):
                self.val = val
                self.left = left
                self.right = right
      `, { title: 'treenode.py' }),
      note('LeetCode writes trees as level-order lists: <code>[3, 9, 20, None, None, 15, 7]</code> means root 3, children 9 and 20, then 9 has no children and 20 has children 15 and 7. Here <code>build_tree(list)</code> turns that into nodes.'),
      h('The four traversals'),
      p('<b>Depth-first</b> traversals go down one branch before the next. They differ only in <i>when</i> you handle the node relative to its children. <b>Breadth-first</b> (level order) goes row by row with a queue.'),
      viz3d('bst', { caption: 'Press each traversal button and compare the numbered order. In-order on a BST always comes out sorted.' }),
      code(py`
        def preorder(node, out):
            if node:
                out.append(node.val)       # node first
                preorder(node.left, out)
                preorder(node.right, out)
            return out

        def inorder(node, out):
            if node:
                inorder(node.left, out)
                out.append(node.val)       # node in the middle
                inorder(node.right, out)
            return out
      `, { title: 'dfs_traversals.py', run: 'root = build_tree([4, 2, 6, 1, 3, 5, 7])\n(preorder(root, []), inorder(root, []))', expect: '([4, 2, 1, 3, 6, 5, 7], [1, 2, 3, 4, 5, 6, 7])' }),
      code(py`
        def level_order(root):
            if not root:
                return []
            levels, q = [], deque([root])
            while q:
                level = []
                for _ in range(len(q)):        # exactly the nodes of this level
                    node = q.popleft()
                    level.append(node.val)
                    if node.left:
                        q.append(node.left)
                    if node.right:
                        q.append(node.right)
                levels.append(level)
            return levels
      `, { title: 'bfs_levels.py', run: 'level_order(build_tree([3, 9, 20, None, None, 15, 7]))', expect: '[[3], [9, 20], [15, 7]]' }),
      tip('The line <code>for _ in range(len(q))</code> is the key to every "per level" question (right side view, level averages, zigzag): it processes exactly one level per outer loop.'),
      h('The recursive mindset'),
      p('For almost every tree problem, write one function and answer three questions:'),
      steps(['<b>What does the function return for a subtree?</b> (its height? its sum? whether it is valid?)',
        '<b>What is the answer for an empty tree (None)?</b> That is the base case.',
        '<b>How do I combine my value with my children\'s answers?</b>']),
      template('tree_dfs_template.py', py`
        def solve(node):
            if node is None:
                return BASE_ANSWER
            left = solve(node.left)      # trust it
            right = solve(node.right)    # trust it
            return COMBINE(node.val, left, right)
      `),
      code(py`
        def max_depth(root):
            if root is None:
                return 0
            return 1 + max(max_depth(root.left), max_depth(root.right))
      `, { title: 'max_depth.py', run: 'max_depth(build_tree([3, 9, 20, None, None, 15, 7]))', expect: '3' }),
      p('Press <b>Visualize</b> on <code>max_depth</code>. The tree diagram highlights the node the current call is working on, and the callers waiting above it. Watch answers bubble back up.'),
      sub('Passing information down'),
      p('Sometimes a node needs to know about its ancestors (the largest value on the path so far, the running sum). Pass that as an extra parameter on the way down, as in Count Good Nodes and Path Sum.'),
      code(py`
        def count_good(root):
            def dfs(node, best_above):
                if not node:
                    return 0
                good = 1 if node.val >= best_above else 0
                best = max(best_above, node.val)
                return good + dfs(node.left, best) + dfs(node.right, best)
            return dfs(root, float("-inf"))
      `, { title: 'good_nodes.py', run: 'count_good(build_tree([3, 1, 4, 3, None, 1, 5]))', expect: '4' }),
      h('Binary search trees'),
      p('A <strong>BST</strong> adds one rule: for every node, everything in the left subtree is smaller and everything in the right subtree is bigger. Searching becomes a walk down a single path, deciding left or right at each node: O(height), so O(log n) when balanced.'),
      code(py`
        def search(root, target):
            node = root
            while node:
                if target == node.val:
                    return True
                node = node.left if target < node.val else node.right
            return False
      `, { title: 'bst_search.py', run: 'search(build_tree([8, 3, 10, 1, 6, None, 14]), 6)', expect: 'True' }),
      p('To <b>validate</b> a BST it is not enough to compare each node with its children. Every node must fit within the range allowed by all of its ancestors, so pass bounds down:'),
      code(py`
        def is_bst(node, lo=float("-inf"), hi=float("inf")):
            if node is None:
                return True
            if not (lo < node.val < hi):
                return False
            return is_bst(node.left, lo, node.val) and is_bst(node.right, node.val, hi)
      `, { title: 'validate_bst.py', run: 'is_bst(build_tree([5, 1, 4, None, None, 3, 6]))', expect: 'False' }),
      key('Two BST facts solve most BST problems: (1) go left or right instead of searching both sides; (2) an in-order traversal visits values in sorted order (kth smallest, minimum difference, validation).'),
      table(['Operation', 'Balanced BST', 'Skewed BST'], [['search / insert / delete', cx('O(log n)'), cx('O(n)')], ['in-order traversal', cx('O(n)'), cx('O(n)')]]),
      warn('Common slips: forgetting the <code>None</code> base case, mixing up depth and height, and using a mutable default like <code>out=[]</code> in a recursive helper (pass the list explicitly).'),
      quiz([
        { q: 'Which traversal of a BST returns sorted values?', opts: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], a: 1, why: 'Left subtree (smaller) → node → right subtree (bigger).' },
        { q: 'Base case for <code>max_depth(None)</code>?', opts: ['-1', '0', '1', 'None'], a: 1, why: 'An empty tree has no nodes, so depth 0. A single node then gets 1 + max(0, 0) = 1.' },
        { q: 'Time to visit every node in any traversal?', opts: ['O(log n)', 'O(n)', 'O(n log n)', 'O(h)'], a: 1, why: 'Each node is visited once.' },
      ]),
      problems([104, 226, 100, 101, 102, 199, 236, 98, 230, 700, 450, 124], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'heaps', group: 'Data structures', title: 'Heaps & priority queues', short: 'Heaps', level: 'Intermediate', minutes: 20,
    blurb: 'Always grab the smallest (or largest) item in O(log n). Top-k, merging, scheduling, running medians.',
    summary: 'A heap keeps the minimum at the front at all times while allowing fast inserts and removals. Whenever a problem says "k largest", "k closest" or "process the cheapest first", think heap.',
    sections: [
      h('What a heap guarantees'),
      p('A <strong>min-heap</strong> is a complete binary tree where every parent is ≤ its children. So the root is the minimum. Nothing else is fully sorted, and that looseness is what makes it cheap to maintain.'),
      p('It is stored in a plain list: the children of index <code>i</code> are <code>2i + 1</code> and <code>2i + 2</code>; the parent is <code>(i − 1) // 2</code>.'),
      analogy('A hospital emergency room: patients don\'t leave in arrival order or alphabetical order; the most urgent one is always treated next, and new arrivals slot in by urgency.'),
      viz3d('heap', { caption: 'heappush adds at the end and sifts up; heappop moves the last item to the root and sifts it down. Both views swap together.' }),
      table(['Operation', 'heapq', 'Cost'], [
        ['peek at minimum', '<code>h[0]</code>', cx('O(1)')],
        ['push', '<code>heappush(h, x)</code>', cx('O(log n)')],
        ['pop minimum', '<code>heappop(h)</code>', cx('O(log n)')],
        ['build from a list', '<code>heapify(h)</code>', cx('O(n)')],
        ['push then pop (faster together)', '<code>heappushpop(h, x)</code>', cx('O(log n)')],
      ]),
      h('Pattern 1: top-k with a size-k heap'),
      p('To find the k largest values, keep a <b>min</b>-heap of size k. Its root is the smallest of the current top k, the one to kick out when something bigger arrives. O(n log k) time, O(k) space.'),
      code(py`
        def kth_largest(nums, k):
            h = []
            for x in nums:
                heapq.heappush(h, x)
                if len(h) > k:
                    heapq.heappop(h)     # drop the smallest; the k largest remain
            return h[0]                  # smallest of the k largest = kth largest
      `, { title: 'kth_largest.py', run: 'kth_largest([3, 2, 1, 5, 6, 4], 2)', expect: '5' }),
      h('Pattern 2: max-heap by negating'),
      code(py`
        def last_stone(stones):
            h = [-s for s in stones]       # negate to get a max-heap
            heapq.heapify(h)
            while len(h) > 1:
                a = -heapq.heappop(h)      # heaviest
                b = -heapq.heappop(h)      # second heaviest
                if a != b:
                    heapq.heappush(h, -(a - b))
            return -h[0] if h else 0
      `, { title: 'max_heap.py', run: 'last_stone([2, 7, 4, 1, 8, 1])', expect: '1' }),
      h('Pattern 3: tuples as priorities'),
      p('Push <code>(priority, item)</code> tuples: Python compares the first field, then the second on ties. If items can\'t be compared (e.g. ListNodes), add a counter in the middle: <code>(priority, counter, node)</code>.'),
      code(py`
        def merge_k(lists):
            h = []
            for i, node in enumerate(lists):
                if node:
                    heapq.heappush(h, (node.val, i, node))   # i breaks ties
            dummy = tail = ListNode()
            while h:
                val, i, node = heapq.heappop(h)
                tail.next = node
                tail = node
                if node.next:
                    heapq.heappush(h, (node.next.val, i, node.next))
            return dummy.next
      `, { title: 'merge_k.py', run: 'merge_k([build_list([1, 4, 5]), build_list([1, 3, 4]), build_list([2, 6])])', expect: '[1, 1, 2, 3, 4, 4, 5, 6]' }),
      h('Pattern 4: two heaps for a running median'),
      p('Keep the smaller half in a max-heap and the larger half in a min-heap, balanced in size. The median is at the top of one or both. Each insert is O(log n). See Find Median from Data Stream.'),
      interview('If an interviewer asks why not just sort: sorting is O(n log n) once, but a heap handles a <i>stream</i> of new items, each in O(log n), and k-limited heaps use less memory.'),
      warn('<code>heapq</code> is min-only, and <code>h[0]</code> is the minimum but <code>h[1]</code> is <b>not</b> necessarily the second smallest.'),
      quiz([
        { q: 'Children of index 3 in a heap list?', opts: ['4 and 5', '6 and 7', '7 and 8', '1 and 2'], a: 2, why: '2·3+1 = 7 and 2·3+2 = 8.' },
        { q: 'To get the k largest of n numbers efficiently, keep…', opts: ['A max-heap of all n', 'A min-heap of size k', 'A sorted list', 'A set'], a: 1, why: 'The min-heap root is the weakest of the current top k, which is exactly the one to replace.' },
        { q: 'Building a heap with heapify costs…', opts: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n²)'], a: 1, why: 'Bottom-up heapify is linear: most nodes are near the bottom and sift only a little.' },
      ]),
      problems([215, 2336, 2542, 2462, 373, 295, 502, 23], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'graphs', group: 'Data structures', title: 'Graphs: BFS, DFS and friends', short: 'Graphs', level: 'Intermediate', minutes: 40,
    blurb: 'Nodes and edges, adjacency lists, BFS vs DFS, grids as graphs, topological sort, union-find.',
    summary: 'Maps, friendships, course prerequisites and mazes are all graphs. Two traversal algorithms, BFS and DFS, plus a "visited" set, solve most interview graph problems.',
    sections: [
      h('What a graph is'),
      p('A <strong>graph</strong> is a set of <strong>nodes</strong> (vertices) connected by <strong>edges</strong>. Edges can be <b>directed</b> (one-way, like "course A before course B") or <b>undirected</b> (two-way, like a friendship), and can carry a <b>weight</b> (distance, cost).'),
      p('Trees are graphs without cycles. Grids are graphs too: each cell is a node, connected to its 4 neighbours.'),
      h('Storing a graph: the adjacency list'),
      code(py`
        def build_graph(n, edges):
            graph = defaultdict(list)
            for a, b in edges:
                graph[a].append(b)
                graph[b].append(a)      # undirected: add both directions
            return {node: graph[node] for node in range(n)}
      `, { title: 'adjacency.py', run: 'build_graph(4, [[0, 1], [0, 2], [2, 3]])', expect: '{0: [1, 2], 1: [0], 2: [0, 3], 3: [2]}' }),
      p('An adjacency list uses O(V + E) memory. An adjacency matrix (<code>matrix[a][b] = 1</code>) uses O(V²) and only pays off for dense graphs.'),
      viz3d('graph', { caption: 'Click a node to choose the start. BFS colours nodes by distance; DFS numbers them in the order it dives.' }),
      h('Breadth-first search (BFS)'),
      p('BFS explores in rings: all nodes 1 edge away, then 2 edges away, and so on, using a <b>queue</b>. That is why it finds the <b>shortest path in an unweighted graph</b>.'),
      template('bfs_template.py', py`
        def bfs(graph, start):
            seen = {start}
            q = deque([start])
            dist = {start: 0}
            while q:
                node = q.popleft()
                for nb in graph[node]:
                    if nb not in seen:
                        seen.add(nb)              # mark when you enqueue
                        dist[nb] = dist[node] + 1
                        q.append(nb)
            return dist
      `),
      widget('grid', { opts: { mode: 'bfs' }, caption: 'Click cells to add walls. BFS reaches G by a shortest path.' }),
      h('Depth-first search (DFS)'),
      p('DFS follows one path as far as it can, then backtracks. Recursion makes it short. Use it to explore everything reachable, count connected pieces, or detect cycles.'),
      code(py`
        def count_components(n, edges):
            graph = defaultdict(list)
            for a, b in edges:
                graph[a].append(b)
                graph[b].append(a)
            seen = set()

            def dfs(node):
                seen.add(node)
                for nb in graph[node]:
                    if nb not in seen:
                        dfs(nb)

            count = 0
            for node in range(n):
                if node not in seen:     # a new, untouched component
                    count += 1
                    dfs(node)
            return count
      `, { title: 'components.py', run: 'count_components(5, [[0, 1], [1, 2], [3, 4]])', expect: '2' }),
      widget('grid', { opts: { mode: 'islands' }, caption: 'Number of Islands is exactly "count connected components" on a grid.' }),
      table(['', 'BFS', 'DFS'], [
        ['Data structure', 'queue (deque)', 'stack or recursion'],
        ['Explores', 'level by level', 'one path deep, then backtrack'],
        ['Best for', 'shortest path (unweighted), spreading', 'reachability, components, cycles, all paths'],
        ['Time', cx('O(V + E)'), cx('O(V + E)')],
      ]),
      key('The visited set is not optional. Without it, a cycle (A→B→A) makes the search loop forever. Mark nodes when you <b>add</b> them to the queue, not when you pop them, or the same node gets queued many times.'),
      h('Multi-source BFS'),
      widget('grid', { opts: { mode: 'rotting' } }),
      p('Start the queue with <i>every</i> source at distance 0 (all rotten oranges, all exits). The rings then grow from all of them at once.'),
      h('Topological sort: ordering with prerequisites'),
      p('In a directed graph without cycles, a topological order lists nodes so every edge points forward. Kahn\'s algorithm: repeatedly take nodes with no remaining prerequisites (in-degree 0). If some nodes are never freed, there is a cycle.'),
      code(py`
        def course_order(n, prereqs):
            graph = defaultdict(list)
            indeg = [0] * n
            for course, before in prereqs:
                graph[before].append(course)
                indeg[course] += 1
            q = deque(c for c in range(n) if indeg[c] == 0)
            order = []
            while q:
                c = q.popleft()
                order.append(c)
                for nxt in graph[c]:
                    indeg[nxt] -= 1
                    if indeg[nxt] == 0:      # all its prerequisites are done
                        q.append(nxt)
            return order if len(order) == n else []   # [] means a cycle
      `, { title: 'topo_sort.py', run: 'course_order(4, [[1, 0], [2, 0], [3, 1], [3, 2]])', expect: '[0, 1, 2, 3]' }),
      h('Union-Find (disjoint sets)'),
      p('Tracks which nodes are connected as edges arrive. <code>find(x)</code> returns a group\'s representative; <code>union(a, b)</code> merges two groups. With path compression it is nearly O(1) per operation.'),
      code(py`
        def count_groups(n, edges):
            parent = list(range(n))

            def find(x):
                while parent[x] != x:
                    parent[x] = parent[parent[x]]   # path compression
                    x = parent[x]
                return x

            groups = n
            for a, b in edges:
                ra, rb = find(a), find(b)
                if ra != rb:
                    parent[ra] = rb                 # merge two groups
                    groups -= 1
            return groups
      `, { title: 'union_find.py', run: 'count_groups(5, [[0, 1], [1, 2], [3, 4]])', expect: '2' }),
      h('Weighted shortest paths: Dijkstra'),
      p('When edges have different non-negative weights, BFS is no longer enough. Dijkstra\'s algorithm uses a min-heap of <code>(distance, node)</code> and always expands the closest unfinished node: O((V + E) log V).'),
      template('dijkstra_template.py', py`
        def dijkstra(graph, start):          # graph[u] = [(v, weight), ...]
            dist = {start: 0}
            h = [(0, start)]
            while h:
                d, u = heapq.heappop(h)
                if d > dist.get(u, float("inf")):
                    continue                 # stale entry
                for v, w in graph[u]:
                    nd = d + w
                    if nd < dist.get(v, float("inf")):
                        dist[v] = nd
                        heapq.heappush(h, (nd, v))
            return dist
      `),
      warn('Recursive DFS on a 300 × 300 grid can exceed Python\'s recursion limit. For big grids, use BFS or an explicit stack.'),
      quiz([
        { q: 'Fewest moves through a maze (each move costs 1)?', opts: ['DFS', 'BFS', 'Sorting', 'Binary search'], a: 1, why: 'BFS explores by distance, so the first time it reaches the goal is via a shortest path.' },
        { q: 'Why mark nodes visited when you enqueue them?', opts: ['It is faster to type', 'So a node is never added to the queue twice', 'Python requires it', 'It finds longer paths'], a: 1, why: 'Otherwise several neighbours can enqueue the same node before it is processed.' },
        { q: 'Kahn\'s algorithm processes fewer than n nodes. What does that mean?', opts: ['A bug', 'The graph has a cycle', 'The graph is a tree', 'Nothing'], a: 1, why: 'Nodes on a cycle never reach in-degree 0.' },
      ]),
      problems([200, 547, 841, 994, 1926, 207, 210, 133, 399, 1466, 130, 127], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'tries', group: 'Data structures', title: 'Tries (prefix trees)', short: 'Tries', level: 'Intermediate', minutes: 15,
    blurb: 'One node per character, shared prefixes share nodes. Autocomplete and word search at speed.',
    summary: 'A trie stores many words so that every prefix is a path from the root. Lookups cost the length of the word, no matter how many words are stored.',
    sections: [
      h('The structure'),
      p('Each node has a map of <code>children</code> (character → node) and a flag saying whether a word ends there. Inserting "car" walks or creates the path c → a → r and marks the r node. "card" then only adds one node.'),
      analogy('A phone\'s autocomplete: after you type "ca", only the branch under c → a matters. Everything else in the dictionary is ignored instantly.'),
      viz3d('trie'),
      code(py`
        class Trie:
            def __init__(self):
                self.root = {}                     # each node: dict of children

            def insert(self, word):
                node = self.root
                for ch in word:
                    node = node.setdefault(ch, {}) # walk, creating as needed
                node["$"] = True                   # end-of-word marker

            def _walk(self, s):
                node = self.root
                for ch in s:
                    if ch not in node:
                        return None
                    node = node[ch]
                return node

            def search(self, word):
                node = self._walk(word)
                return node is not None and "$" in node

            def starts_with(self, prefix):
                return self._walk(prefix) is not None
      `, { title: 'trie.py', run: 't = Trie()\nfor w in ["car", "card", "dog"]:\n    t.insert(w)\n(t.search("car"), t.search("ca"), t.starts_with("ca"))', expect: '(True, False, True)' }),
      table(['Operation', 'Cost'], [['insert / search / startsWith', cx('O(L)') + ' where L = word length'], ['space', 'O(total characters stored)']]),
      h('Where tries win'),
      list(['<b>Autocomplete</b>: walk the prefix, then collect words below (Search Suggestions System).',
        '<b>Wildcards</b>: at a "." try every child (Design Add and Search Words).',
        '<b>Searching many words at once</b>: build a trie of the words, then run one DFS over a board, pruning when no word has the current prefix (Word Search II).']),
      warn('Forgetting the end-of-word flag is the classic bug: after inserting only "card", <code>search("car")</code> would wrongly return True, because the path c → a → r exists even though "car" was never inserted.'),
      quiz([
        { q: 'search("ca") after inserting "car": the path exists. Why can the answer be False?', opts: ['Tries are random', 'No word ends at that node', 'Lowercase only', 'It is True'], a: 1, why: 'The end-of-word marker distinguishes stored words from mere prefixes.' },
        { q: 'Cost of looking up a word of length L in a trie holding a million words?', opts: ['O(1)', 'O(L)', 'O(log n)', 'O(n)'], a: 1, why: 'One step per character, independent of how many words are stored.' },
      ]),
      problems([208, 1268, 211, 212], 'Practise'),
    ],
  });
})();

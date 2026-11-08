from _base import P

BOARD6 = '[[-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, 35, -1, -1, 13, -1], [-1, -1, -1, -1, -1, -1], [-1, 15, -1, -1, -1, -1]]'
ISLANDS = '[["1", "1", "0", "0", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "0", "1", "1"]]'

P(841, 'keys-and-rooms', 'Keys and Rooms', 'Medium', 'graphs', 'Graph DFS',
  hook='Room 0 is open; every other room is locked. Each room holds keys to other rooms. Can you visit every room?',
  brute='There is nothing slower to compare with: it is a reachability question.',
  insight='Rooms are nodes and keys are edges. "Can I visit every room?" means "is every node reachable from node 0?" Run a DFS (or BFS) from room 0 and compare the visited count with the number of rooms.',
  steps=['<code>seen = {0}</code>, stack = [0].',
         'Pop a room; for every key not seen yet, mark it and push it.',
         'Return <code>len(seen) == len(rooms)</code>.'],
  code=r'''
class Solution:
    def canVisitAllRooms(self, rooms: List[List[int]]) -> bool:
        seen = {0}
        stack = [0]
        while stack:
            room = stack.pop()
            for key in rooms[room]:
                if key not in seen:
                    seen.add(key)
                    stack.append(key)
        return len(seen) == len(rooms)
''',
  time='O(n + k)', space='O(n)', why='n rooms, k keys in total.',
  run='Solution().canVisitAllRooms([[1, 3], [3, 0, 1], [2], [0]])', expect='False',
  tests=[('Solution().canVisitAllRooms([[1], [2], [3], []])', 'True')],
  tip='Naming the graph first ("rooms are nodes, keys are edges") is what interviewers listen for. The algorithm is then standard.')

P(547, 'number-of-provinces', 'Number of Provinces', 'Medium', 'graphs', 'Connected components',
  hook='<code>isConnected[i][j] = 1</code> means cities i and j are directly connected. A province is a group of connected cities. How many provinces are there?',
  brute='Already a standard graph problem; the question is DFS vs union-find.',
  insight='Count connected components: every time you find a city not yet visited, it starts a new province, and a DFS from it marks the whole province.',
  steps=['For each city not yet seen: count a province and DFS from it.',
         'The DFS visits every <code>other</code> with <code>isConnected[city][other] == 1</code> not yet seen.',
         'Return the count.'],
  code=r'''
class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        seen = set()
        def dfs(city):
            for other in range(n):
                if isConnected[city][other] and other not in seen:
                    seen.add(other)
                    dfs(other)
        provinces = 0
        for city in range(n):
            if city not in seen:
                seen.add(city)
                dfs(city)
                provinces += 1
        return provinces
''',
  time='O(n²)', space='O(n)', why='The adjacency matrix has n² entries.',
  run='Solution().findCircleNum([[1, 1, 0], [1, 1, 0], [0, 0, 1]])', expect='2',
  tests=[('Solution().findCircleNum([[1, 0, 0], [0, 1, 0], [0, 0, 1]])', '3')],
  tip='Union-Find is the other classic answer: union every connected pair and count distinct roots.')

P(1466, 'reorder-routes-to-make-all-paths-lead-to-the-city-zero', 'Reorder Routes to Make All Paths Lead to the City Zero', 'Medium', 'graphs', 'Graph DFS with edge directions',
  hook='n cities form a tree of one-way roads. Reverse as few roads as possible so every city can reach city 0.',
  brute='Try reversal sets: exponential.',
  insight='Explore outward from city 0, ignoring direction to find neighbours, but remember each road\'s original direction. Every road we travel <b>away</b> from 0 in its original direction points the wrong way and must be flipped.',
  steps=['For each road a → b: add (b, cost 1) to a\'s list and (a, cost 0) to b\'s list.',
         'DFS from 0; when moving to an unseen neighbour, add that edge\'s cost.',
         'The total cost is the number of flips.'],
  code=r'''
class Solution:
    def minReorder(self, n: int, connections: List[List[int]]) -> int:
        graph = defaultdict(list)
        for a, b in connections:
            graph[a].append((b, 1))     # travelling a -> b uses the road as built: it points away from 0, flip it
            graph[b].append((a, 0))     # travelling b -> a uses it backwards: it already points toward 0
        seen = {0}
        stack = [0]
        changes = 0
        while stack:
            city = stack.pop()
            for nxt, cost in graph[city]:
                if nxt not in seen:
                    seen.add(nxt)
                    changes += cost
                    stack.append(nxt)
        return changes
''',
  time='O(n)', space='O(n)',
  run='Solution().minReorder(6, [[0, 1], [1, 3], [2, 3], [4, 0], [4, 5]])', expect='3',
  tests=[('Solution().minReorder(5, [[1, 0], [1, 2], [3, 2], [3, 4]])', '2'), ('Solution().minReorder(3, [[1, 0], [2, 0]])', '0')])

P(399, 'evaluate-division', 'Evaluate Division', 'Medium', 'graphs', 'Weighted graph DFS',
  hook='Given equations like a / b = 2.0 and b / c = 3.0, answer queries like a / c (or −1.0 if unknown).',
  brute='Algebra by hand does not scale; the trick is seeing the graph.',
  insight='Each variable is a node; <code>a / b = v</code> is an edge a → b with weight v and an edge b → a with weight 1/v. The answer to <code>x / y</code> is the <b>product of weights along any path</b> from x to y.',
  steps=['Build the weighted graph with both directions.',
         'For a query: unknown variable → −1.0.',
         'DFS from the source, carrying the running product; reaching the target returns it.',
         'No path → −1.0.'],
  code=r'''
class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:
        graph = defaultdict(dict)
        for (a, b), v in zip(equations, values):
            graph[a][b] = v            # a / b = v
            graph[b][a] = 1 / v        # b / a = 1 / v

        def solve(src, dst):
            if src not in graph or dst not in graph:
                return -1.0
            stack, seen = [(src, 1.0)], {src}
            while stack:
                node, product = stack.pop()
                if node == dst:
                    return product
                for nxt, w in graph[node].items():
                    if nxt not in seen:
                        seen.add(nxt)
                        stack.append((nxt, product * w))
            return -1.0

        return [solve(a, b) for a, b in queries]
''',
  time='O(q · (V + E))', space='O(V + E)',
  run='Solution().calcEquation([["a", "b"], ["b", "c"]], [2.0, 3.0], [["a", "c"], ["b", "a"], ["a", "e"], ["a", "a"], ["x", "x"]])',
  expect='[6.0, 0.5, -1.0, 1.0, -1.0]',
  tests=[('Solution().calcEquation([["a", "b"], ["b", "c"], ["bc", "cd"]], [1.5, 2.5, 5.0], [["a", "c"], ["c", "b"], ["bc", "cd"], ["cd", "bc"]])', '[3.75, 0.4, 5.0, 0.2]')],
  tip='Note the edge cases in the example: <code>a / a</code> is 1.0 because a is known, but <code>x / x</code> is −1.0 because x never appeared.')

P(1926, 'nearest-exit-from-entrance-in-maze', 'Nearest Exit from Entrance in Maze', 'Medium', 'graphs', 'Grid BFS',
  hook='In a maze of "." (open) and "+" (wall), find the fewest steps from the entrance to any open border cell (the entrance itself doesn\'t count).',
  brute='DFS exploring all paths and keeping the shortest: exponential in the worst case.',
  insight='Fewest steps in an unweighted grid → <b>BFS</b>. The first border cell BFS reaches is the nearest exit. Mark cells visited as you enqueue them (overwriting with "+" works).',
  steps=['Queue the entrance with 0 steps and mark it visited.',
         'Pop a cell; for each open, unvisited neighbour: if it is on the border, return steps + 1.',
         'Otherwise mark it and enqueue it with steps + 1.',
         'Queue empty → −1.'],
  code=r'''
class Solution:
    def nearestExit(self, maze: List[List[str]], entrance: List[int]) -> int:
        rows, cols = len(maze), len(maze[0])
        r0, c0 = entrance
        q = deque([(r0, c0, 0)])
        maze[r0][c0] = "+"                    # visited
        while q:
            r, c, steps = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] == ".":
                    if nr in (0, rows - 1) or nc in (0, cols - 1):
                        return steps + 1      # first border cell = nearest exit
                    maze[nr][nc] = "+"
                    q.append((nr, nc, steps + 1))
        return -1
''',
  time='O(rows · cols)', space='O(rows · cols)',
  run='Solution().nearestExit([["+", "+", ".", "+"], [".", ".", ".", "+"], ["+", "+", "+", "."]], [1, 2])', expect='1',
  tests=[('Solution().nearestExit([["+", "+", "+"], [".", ".", "."], ["+", "+", "+"]], [1, 0])', '2'), ('Solution().nearestExit([[".", "+"]], [0, 0])', '-1')])

P(994, 'rotting-oranges', 'Rotting Oranges', 'Medium', 'graphs', 'Multi-source BFS',
  hook='Every minute, fresh oranges (1) next to rotten ones (2) become rotten. How many minutes until none are fresh? (−1 if some never rot.)',
  brute='Simulate minute by minute, scanning the whole grid each time: O((rows · cols)²).',
  insight='All rotten oranges spread at the same time, so start a BFS with <b>every</b> rotten orange in the queue. Each BFS layer is one minute. Count fresh oranges to know when to stop and whether any are unreachable.',
  steps=['Queue every rotten orange; count the fresh ones.',
         'While there are fresh oranges and the queue is not empty: process one whole layer, rotting fresh neighbours.',
         'Add one minute per layer.',
         'Return the minutes, or −1 if fresh oranges remain.'],
  code=r'''
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        q, fresh = deque(), 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    q.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1
        minutes = 0
        while q and fresh:
            for _ in range(len(q)):              # one minute
                r, c = q.popleft()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        q.append((nr, nc))
            minutes += 1
        return minutes if fresh == 0 else -1
''',
  time='O(rows · cols)', space='O(rows · cols)',
  run='Solution().orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]])', expect='4',
  tests=[('Solution().orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]])', '-1'), ('Solution().orangesRotting([[0, 2]])', '0')],
  tip='The Graphs chapter has an interactive version of this grid; switch to Practice mode and predict the minutes before playing it.')

P(200, 'number-of-islands', 'Number of Islands', 'Medium', 'graphs', 'Grid DFS (flood fill)',
  hook='Count islands: groups of "1" cells connected up, down, left or right.',
  brute='This is the brute force done right: visit every cell once.',
  insight='Scan the grid. The first time you hit land, you found a new island; then <b>sink</b> it (flood fill every connected land cell to "0") so it is never counted again.',
  steps=['For each cell that is "1": count += 1, then sink it.',
         '<code>sink(r, c)</code>: stop if out of bounds or not "1"; otherwise set it to "0" and sink all 4 neighbours.'],
  code=r'''
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        def sink(r, c):
            if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != "1":
                return
            grid[r][c] = "0"              # visited
            sink(r + 1, c)
            sink(r - 1, c)
            sink(r, c + 1)
            sink(r, c - 1)
        count = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == "1":
                    count += 1
                    sink(r, c)
        return count
''',
  time='O(rows · cols)', space='O(rows · cols)', why='Recursion depth in the worst case (one big island).',
  run='Solution().numIslands(' + ISLANDS + ')', expect='3',
  tests=[('Solution().numIslands([["1", "1", "1", "1", "0"], ["1", "1", "0", "1", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "0", "0", "0"]])', '1')],
  tip='Mention the recursion-depth risk on huge grids and offer a BFS/stack version. Also ask whether modifying the grid is allowed; if not, keep a visited set.')

P(130, 'surrounded-regions', 'Surrounded Regions', 'Medium', 'graphs', 'Flood fill from the border',
  hook='Capture every region of "O" completely surrounded by "X" by flipping it to "X". Regions touching the border are safe.',
  brute='For each "O" region, flood fill and check whether it touches the border: works, but re-checks cells.',
  insight='Flip the question: find the <b>safe</b> cells. Every "O" connected to the border is safe. Flood fill from all border "O"s, marking them; afterwards, any "O" not marked is surrounded.',
  steps=['Flood fill from every border "O", marking cells as "S".',
         'Scan: "O" → "X" (captured); "S" → "O" (restore).'],
  code=r'''
class Solution:
    def solve(self, board: List[List[str]]) -> None:
        rows, cols = len(board), len(board[0])
        def mark(r, c):                       # "S" = safe (reaches the border)
            if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != "O":
                return
            board[r][c] = "S"
            mark(r + 1, c)
            mark(r - 1, c)
            mark(r, c + 1)
            mark(r, c - 1)
        for r in range(rows):
            mark(r, 0)
            mark(r, cols - 1)
        for c in range(cols):
            mark(0, c)
            mark(rows - 1, c)
        for r in range(rows):
            for c in range(cols):
                if board[r][c] == "O":
                    board[r][c] = "X"
                elif board[r][c] == "S":
                    board[r][c] = "O"
''',
  time='O(rows · cols)', space='O(rows · cols)',
  run='''
board = [["X", "X", "X", "X"], ["X", "O", "O", "X"], ["X", "X", "O", "X"], ["X", "O", "X", "X"]]
Solution().solve(board)
board
''', expect="[['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'O', 'X', 'X']]",
  tests=[('board = [["X"]]\nSolution().solve(board)\nboard', "[['X']]"), ('board = [["O", "O"], ["O", "O"]]\nSolution().solve(board)\nboard', "[['O', 'O'], ['O', 'O']]")],
  tip='"Work backwards from the safe places" is a common trick: also used in Pacific Atlantic Water Flow.')

P(133, 'clone-graph', 'Clone Graph', 'Medium', 'graphs', 'BFS + hash map',
  hook='Return a deep copy of a connected undirected graph, given one node.',
  brute='There is no shortcut: every node and edge must be copied once.',
  insight='Traverse the graph (BFS) and keep a dict <b>original → clone</b>. The dict doubles as the visited set, and handles cycles: when an edge leads to a node that already has a clone, reuse it.',
  steps=['<code>copies = {node: Node(node.val)}</code>; queue = [node].',
         'Pop <code>cur</code>; for each neighbour: if it has no clone, create one and enqueue it.',
         'Append the neighbour\'s clone to <code>copies[cur].neighbors</code>.',
         'Return <code>copies[node]</code>.'],
  code=r'''
class Node:   # LeetCode provides this class
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        if node is None:
            return None
        copies = {node: Node(node.val)}       # original -> clone
        q = deque([node])
        while q:
            cur = q.popleft()
            for nb in cur.neighbors:
                if nb not in copies:           # first visit: clone and explore later
                    copies[nb] = Node(nb.val)
                    q.append(nb)
                copies[cur].neighbors.append(copies[nb])
        return copies[node]
''',
  time='O(V + E)', space='O(V)',
  run='''
adj = [[2, 4], [1, 3], [2, 4], [1, 3]]
nodes = [Node(i + 1) for i in range(len(adj))]
for i, nbs in enumerate(adj):
    nodes[i].neighbors = [nodes[j - 1] for j in nbs]
clone = Solution().cloneGraph(nodes[0])
found, q = [clone], [clone]
while q:
    n = q.pop()
    for nb in n.neighbors:
        if all(nb is not f for f in found):
            found.append(nb)
            q.append(nb)
(sorted([n.val, sorted(nb.val for nb in n.neighbors)] for n in found), all(all(n is not o for o in nodes) for n in found))
''', expect='([[1, [2, 4]], [2, [1, 3]], [3, [2, 4]], [4, [1, 3]]], True)')

P(207, 'course-schedule', 'Course Schedule', 'Medium', 'graphs', 'Topological sort',
  hook='<code>[a, b]</code> means "take b before a". Can you finish all courses?',
  brute='Try every ordering of courses: n! possibilities.',
  insight='Courses are nodes and prerequisites are directed edges. You can finish everything exactly when the graph has <b>no cycle</b>. Kahn\'s algorithm: repeatedly take a course with no remaining prerequisites; if some course is never freed, there is a cycle.',
  steps=['Build edges b → a and count in-degrees.',
         'Queue every course with in-degree 0.',
         'Pop a course, count it as taken, and decrement its dependents; queue any that reach 0.',
         'Return <code>taken == numCourses</code>.'],
  code=r'''
class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = defaultdict(list)
        indeg = [0] * numCourses
        for course, pre in prerequisites:
            graph[pre].append(course)
            indeg[course] += 1
        q = deque(c for c in range(numCourses) if indeg[c] == 0)
        taken = 0
        while q:
            c = q.popleft()
            taken += 1
            for nxt in graph[c]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return taken == numCourses
''',
  time='O(V + E)', space='O(V + E)',
  run='Solution().canFinish(4, [[1, 0], [2, 1], [3, 2], [1, 3]])', expect='False',
  tests=[('Solution().canFinish(2, [[1, 0]])', 'True'), ('Solution().canFinish(2, [[1, 0], [0, 1]])', 'False')],
  tip='Alternative: DFS with three colours (unvisited / on the current path / done). Reaching a node that is "on the current path" means a cycle.')

P(210, 'course-schedule-ii', 'Course Schedule II', 'Medium', 'graphs', 'Topological sort',
  hook='Return any valid order to take all courses, or [] if impossible.',
  brute='Same as before: orderings are factorial.',
  insight='Kahn\'s algorithm produces a topological order directly: the order in which courses come off the queue.',
  steps=['Build edges and in-degrees.',
         'Queue courses with in-degree 0; pop into <code>order</code>.',
         'Decrement dependents and queue the ones that reach 0.',
         'Return <code>order</code> if it has every course, else [].'],
  code=r'''
class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = defaultdict(list)
        indeg = [0] * numCourses
        for course, pre in prerequisites:
            graph[pre].append(course)
            indeg[course] += 1
        q = deque(c for c in range(numCourses) if indeg[c] == 0)
        order = []
        while q:
            c = q.popleft()
            order.append(c)
            for nxt in graph[c]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return order if len(order) == numCourses else []
''',
  time='O(V + E)', space='O(V + E)',
  run='Solution().findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]])', expect='[0, 1, 2, 3]',
  tests=[('Solution().findOrder(2, [[1, 0]])', '[0, 1]'), ('Solution().findOrder(2, [[0, 1], [1, 0]])', '[]')])

P(909, 'snakes-and-ladders', 'Snakes and Ladders', 'Medium', 'graphs', 'BFS on an implicit graph',
  hook='On an n×n board numbered 1 to n² in a zigzag from the bottom-left, each move rolls 1–6, and landing on a snake or ladder moves you to its target. What is the fewest moves to reach n²?',
  brute='Explore every sequence of rolls: exponential.',
  insight='Each square is a node; each roll is an edge to one of the next 6 squares (following a snake or ladder if present). Fewest moves → BFS. The fiddly part is converting a square number to (row, column) because rows alternate direction.',
  steps=['<code>cell(s)</code>: <code>r, c = divmod(s − 1, n)</code>; row = <code>n − 1 − r</code>; column = <code>c</code> on even r, else <code>n − 1 − c</code>.',
         'BFS from square 1 with 0 moves.',
         'For each roll 1–6: move, follow any snake/ladder; reaching n² returns moves + 1.',
         'Enqueue unseen squares.'],
  code=r'''
class Solution:
    def snakesAndLadders(self, board: List[List[int]]) -> int:
        n = len(board)
        def cell(square):                         # square number -> (row, col)
            r, c = divmod(square - 1, n)
            row = n - 1 - r                        # counting starts at the bottom
            col = c if r % 2 == 0 else n - 1 - c   # and zigzags
            return row, col
        target = n * n
        q = deque([(1, 0)])                        # (square, moves)
        seen = {1}
        while q:
            square, moves = q.popleft()
            for nxt in range(square + 1, min(square + 6, target) + 1):
                r, c = cell(nxt)
                if board[r][c] != -1:
                    nxt = board[r][c]              # take the snake or ladder
                if nxt == target:
                    return moves + 1
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, moves + 1))
        return -1
''',
  time='O(n²)', space='O(n²)',
  run='Solution().snakesAndLadders([[-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, 15, -1, -1]])', expect='2',
  tests=[('Solution().snakesAndLadders(' + BOARD6 + ')', '4'), ('Solution().snakesAndLadders([[-1, -1], [-1, 3]])', '1')],
  tip='Write and test the <code>cell()</code> helper on its own first. Most bugs in this problem are in that conversion.')

P(433, 'minimum-genetic-mutation', 'Minimum Genetic Mutation', 'Medium', 'graphs', 'BFS on strings',
  hook='A gene is an 8-letter string of A, C, G, T. One mutation changes one letter, and every intermediate gene must be in the bank. Fewest mutations from start to end?',
  brute='DFS over all mutation sequences: exponential.',
  insight='Genes are nodes; two genes are connected if they differ in one letter. Shortest number of mutations → BFS. Generate neighbours by trying every letter at every position (8 × 4), keeping those in the bank.',
  steps=['Return −1 if the end gene is not in the bank.',
         'BFS from the start with step count.',
         'For each position and each of A/C/G/T, build the mutated gene; if it is in the bank and unseen, enqueue it.',
         'Reaching the end returns the steps.'],
  code=r'''
class Solution:
    def minMutation(self, startGene: str, endGene: str, bank: List[str]) -> int:
        valid = set(bank)
        if endGene not in valid:
            return -1
        q = deque([(startGene, 0)])
        seen = {startGene}
        while q:
            gene, steps = q.popleft()
            if gene == endGene:
                return steps
            for i in range(len(gene)):
                for ch in "ACGT":
                    nxt = gene[:i] + ch + gene[i + 1:]    # change one letter
                    if nxt in valid and nxt not in seen:
                        seen.add(nxt)
                        q.append((nxt, steps + 1))
        return -1
''',
  time='O(B · L · 4)', space='O(B)', why='B genes in the bank, L = 8 letters each.',
  run='Solution().minMutation("AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA", "AAACGGTA"])', expect='2',
  tests=[('Solution().minMutation("AACCGGTT", "AACCGGTA", ["AACCGGTA"])', '1'), ('Solution().minMutation("AAAAACCC", "AACCCCCC", ["AAAACCCC", "AAACCCCC", "AACCCCCC"])', '3')])

P(127, 'word-ladder', 'Word Ladder', 'Hard', 'graphs', 'BFS with wildcard buckets',
  hook='Change one letter at a time, each intermediate word in the dictionary. How many words are in the shortest sequence from <code>beginWord</code> to <code>endWord</code>? (0 if impossible.)',
  brute='Compare every pair of words to build the graph: O(n² · L).',
  insight='BFS for shortest path, with a faster way to find neighbours: group words by <b>wildcard patterns</b>. "hot" belongs to "*ot", "h*t" and "ho*". Words sharing a pattern differ in exactly one letter.',
  steps=['Map every pattern (one letter replaced by *) to the words that match it.',
         'BFS from <code>beginWord</code> with length 1.',
         'For each pattern of the current word, enqueue unseen words in that bucket with length + 1.',
         'Return the length when <code>endWord</code> is popped.'],
  code=r'''
class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0
        patterns = defaultdict(list)          # "h*t" -> words matching it
        for w in words | {beginWord}:
            for i in range(len(w)):
                patterns[w[:i] + "*" + w[i + 1:]].append(w)
        q = deque([(beginWord, 1)])
        seen = {beginWord}
        while q:
            word, length = q.popleft()
            if word == endWord:
                return length
            for i in range(len(word)):
                for nxt in patterns[word[:i] + "*" + word[i + 1:]]:
                    if nxt not in seen:
                        seen.add(nxt)
                        q.append((nxt, length + 1))
        return 0
''',
  time='O(n · L²)', space='O(n · L²)', why='n words of length L; building each pattern costs O(L).',
  run='Solution().ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"])', expect='5',
  tests=[('Solution().ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"])', '0')],
  tip='Follow-up: bidirectional BFS (expand from both ends, always the smaller frontier) cuts the explored area dramatically.')

from _base import P

P(104, 'maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'Easy', 'trees', 'Tree DFS',
  hook='Return the number of nodes on the longest path from the root down to a leaf.',
  brute='List every root-to-leaf path and take the longest: same work, more code.',
  insight='The depth of a tree is 1 (the root) plus the depth of its deeper subtree. An empty tree has depth 0. That is the entire algorithm: trust the recursion for the children.',
  steps=['If the node is None, return 0.',
         'Recursively get the depth of the left and right subtrees.',
         'Return <code>1 + max(left, right)</code>.'],
  code=r'''
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if root is None:
            return 0
        left = self.maxDepth(root.left)
        right = self.maxDepth(root.right)
        return 1 + max(left, right)
''',
  time='O(n)', space='O(h)', why='h = tree height (the recursion stack).',
  run='Solution().maxDepth(build_tree([3, 9, 20, None, None, 15, 7]))', expect='3',
  tests=[('Solution().maxDepth(build_tree([1, None, 2]))', '2'), ('Solution().maxDepth(build_tree([]))', '0')],
  tip='Press Visualize: the tree diagram highlights the node of the current call and the callers waiting above it. This is the template for most tree problems.')

P(872, 'leaf-similar-trees', 'Leaf-Similar Trees', 'Easy', 'trees', 'Tree DFS',
  hook='Two trees are leaf-similar if their leaves, read left to right, form the same sequence.',
  brute='This is already direct: collect each tree\'s leaf sequence and compare.',
  insight='A DFS that visits left before right meets the leaves in left-to-right order. Record a node when it has no children.',
  steps=['Write <code>leaves(node, out)</code>: if the node is a leaf, append its value; recurse left, then right.',
         'Compare the two leaf lists.'],
  code=r'''
class Solution:
    def leafSimilar(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> bool:
        def leaves(node, out):
            if node is None:
                return out
            if node.left is None and node.right is None:
                out.append(node.val)          # a leaf
            leaves(node.left, out)
            leaves(node.right, out)
            return out
        return leaves(root1, []) == leaves(root2, [])
''',
  time='O(n + m)', space='O(n + m)',
  run='Solution().leafSimilar(build_tree([3, 5, 1, 6, 2, 9, 8, None, None, 7, 4]), build_tree([3, 5, 1, 6, 7, 4, 2, None, None, None, None, None, None, 9, 8]))', expect='True',
  tests=[('Solution().leafSimilar(build_tree([1, 2, 3]), build_tree([1, 3, 2]))', 'False')])

P(1448, 'count-good-nodes-in-binary-tree', 'Count Good Nodes in Binary Tree', 'Medium', 'trees', 'DFS with state passed down',
  hook='A node is "good" if no node on the path from the root to it has a larger value. Count the good nodes.',
  brute='For every node, walk the path from the root again: O(n · h).',
  insight='Carry the <b>maximum value seen on the path so far</b> down the recursion. A node is good if its value is at least that maximum; then pass the updated maximum to its children.',
  steps=['<code>dfs(node, best_above)</code> returns the number of good nodes in this subtree.',
         'Count this node if <code>node.val ≥ best_above</code>.',
         'Recurse into both children with <code>max(best_above, node.val)</code>.'],
  code=r'''
class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        def dfs(node, best_above):
            if node is None:
                return 0
            good = 1 if node.val >= best_above else 0
            best = max(best_above, node.val)
            return good + dfs(node.left, best) + dfs(node.right, best)
        return dfs(root, float("-inf"))
''',
  time='O(n)', space='O(h)',
  run='Solution().goodNodes(build_tree([3, 1, 4, 3, None, 1, 5]))', expect='4',
  tests=[('Solution().goodNodes(build_tree([3, 3, None, 4, 2]))', '3'), ('Solution().goodNodes(build_tree([1]))', '1')],
  tip='Pattern: information flowing <b>down</b> the tree goes into parameters; information flowing <b>up</b> comes back as return values.')

P(437, 'path-sum-iii', 'Path Sum III', 'Medium', 'trees', 'Prefix sums on a tree path',
  hook='Count downward paths (any start node, any end node below it) whose values sum to <code>targetSum</code>.',
  brute='From every node, DFS downward counting paths that hit the target: O(n²) in the worst case.',
  insight='Along the root-to-current path, this is "subarray sum equals k". Keep a running prefix sum and a dict counting prefix sums <b>on the current path</b>. Paths ending here = how many earlier prefixes equal <code>running − target</code>. Remove the prefix when backtracking.',
  steps=['<code>seen = {0: 1}</code> (the empty prefix).',
         'At each node: <code>running += node.val</code>; add <code>seen[running − target]</code> to the count.',
         'Record <code>running</code> in <code>seen</code>, recurse into children.',
         'Undo the record before returning (the node leaves the path).'],
  code=r'''
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        seen = defaultdict(int)
        seen[0] = 1
        def dfs(node, running):
            if node is None:
                return 0
            running += node.val
            count = seen[running - targetSum]     # paths that end at this node
            seen[running] += 1
            count += dfs(node.left, running) + dfs(node.right, running)
            seen[running] -= 1                    # backtrack
            return count
        return dfs(root, 0)
''',
  time='O(n)', space='O(h)',
  run='Solution().pathSum(build_tree([10, 5, -3, 3, 2, None, 11, 3, -2, None, 1]), 8)', expect='3',
  tests=[('Solution().pathSum(build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, 5, 1]), 22)', '3')],
  tip='This is the array technique "prefix sum + hash map" moved onto a tree. Explicitly mention the backtracking step: without it, sums from other branches leak in.')

P(1372, 'longest-zigzag-path-in-a-binary-tree', 'Longest ZigZag Path in a Binary Tree', 'Medium', 'trees', 'DFS with state passed down',
  hook='A zigzag path alternates left and right moves. Return the most edges on any zigzag path.',
  brute='Start a zigzag walk from every node in both directions: O(n²) in the worst case.',
  insight='Pass down the direction you arrived from and the zigzag length so far. Turning the other way extends the zigzag by 1; continuing the same way starts a new zigzag of length 1 from the current node.',
  steps=['<code>dfs(node, went_left, length)</code>; update the global best with <code>length</code>.',
         'If we arrived by going left: go right with <code>length + 1</code>, and go left with 1 (restart).',
         'Symmetric when we arrived by going right.',
         'Start with <code>dfs(root.left, True, 1)</code> and <code>dfs(root.right, False, 1)</code>.'],
  code=r'''
class Solution:
    def longestZigZag(self, root: Optional[TreeNode]) -> int:
        best = 0
        def dfs(node, went_left, length):
            nonlocal best
            if node is None:
                return
            best = max(best, length)
            if went_left:
                dfs(node.right, False, length + 1)   # turn: extend
                dfs(node.left, True, 1)              # same way: restart
            else:
                dfs(node.left, True, length + 1)
                dfs(node.right, False, 1)
        dfs(root.left, True, 1)
        dfs(root.right, False, 1)
        return best
''',
  time='O(n)', space='O(h)',
  run='Solution().longestZigZag(build_tree([1, None, 1, 1, 1, None, None, 1, 1, None, 1, None, None, None, 1]))', expect='3',
  tests=[('Solution().longestZigZag(build_tree([1, 1, 1, None, 1, None, None, 1, 1, None, 1]))', '4'), ('Solution().longestZigZag(build_tree([1]))', '0')])

P(236, 'lowest-common-ancestor-of-a-binary-tree', 'Lowest Common Ancestor of a Binary Tree', 'Medium', 'trees', 'Tree DFS',
  hook='Find the lowest (deepest) node that has both <code>p</code> and <code>q</code> as descendants (a node counts as its own descendant).',
  brute='Find the root-to-p and root-to-q paths, then take their last common node. Works, with extra space for the paths.',
  insight='Ask each subtree: "do you contain p or q?" Return the node if it <i>is</i> p or q. If a node gets a non-None answer from <b>both</b> sides, p and q are split across it: it is the LCA. Otherwise pass up whichever side found something.',
  steps=['If root is None, p, or q: return root.',
         'Recurse into left and right.',
         'If both results are non-None, return root.',
         'Otherwise return the non-None one (or None).'],
  code=r'''
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if root is None or root is p or root is q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root            # p and q are on different sides
        return left or right
''',
  time='O(n)', space='O(h)',
  run='''
root = build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
Solution().lowestCommonAncestor(root, find_node(root, 5), find_node(root, 1)).val
''', expect='3',
  tests=[('root = build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])\nSolution().lowestCommonAncestor(root, find_node(root, 5), find_node(root, 4)).val', '5')],
  tip='Why does returning p early work when q is below p? Then p itself is the answer, and nothing above will find q on the other side.')

P(199, 'binary-tree-right-side-view', 'Binary Tree Right Side View', 'Medium', 'trees', 'BFS by level',
  hook='Standing to the right of the tree, which node values can you see, top to bottom?',
  brute='DFS recording the depth of every node, then pick the rightmost per depth: works, more bookkeeping.',
  insight='You see exactly one node per level: the <b>last</b> one in that level, left to right. A level-order BFS gives levels directly.',
  steps=['BFS with a queue; process one level at a time with <code>for i in range(len(q))</code>.',
         'Record the value of the last node of each level.',
         'Enqueue children left, then right.'],
  code=r'''
class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []
        view, q = [], deque([root])
        while q:
            size = len(q)
            for i in range(size):
                node = q.popleft()
                if i == size - 1:
                    view.append(node.val)     # last node of this level
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
        return view
''',
  time='O(n)', space='O(w)', why='w = the widest level (queue size).',
  run='Solution().rightSideView(build_tree([1, 2, 3, None, 5, None, 4]))', expect='[1, 3, 4]',
  tests=[('Solution().rightSideView(build_tree([1, 2, 3, 4, None, None, None, 5]))', '[1, 3, 4, 5]'), ('Solution().rightSideView(build_tree([]))', '[]')],
  tip='The second test is the trap: the view at depth 3 comes from the <i>left</i> subtree, because the right subtree is shorter.')

P(1161, 'maximum-level-sum-of-a-binary-tree', 'Maximum Level Sum of a Binary Tree', 'Medium', 'trees', 'BFS by level',
  hook='Levels are numbered from 1 at the root. Return the smallest level with the largest sum of values.',
  brute='DFS adding each node into a per-depth sum list, then pick the best: also fine.',
  insight='BFS processes one level at a time, so summing each level is natural. Keep the best sum with "strictly greater" so ties keep the smaller level.',
  steps=['BFS level by level, summing the values of each level.',
         'If the sum beats the best so far (strictly), record it and its level number.',
         'Return the best level.'],
  code=r'''
class Solution:
    def maxLevelSum(self, root: Optional[TreeNode]) -> int:
        best_sum, best_level = float("-inf"), 1
        q, level = deque([root]), 1
        while q:
            total = 0
            for _ in range(len(q)):
                node = q.popleft()
                total += node.val
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            if total > best_sum:          # strictly greater: ties keep the earlier level
                best_sum, best_level = total, level
            level += 1
        return best_level
''',
  time='O(n)', space='O(w)',
  run='Solution().maxLevelSum(build_tree([1, 7, 0, 7, -8, None, None]))', expect='2',
  tests=[('Solution().maxLevelSum(build_tree([989, None, 10250, 98693, -89388, None, None, None, -32127]))', '2')])

P(700, 'search-in-a-binary-search-tree', 'Search in a Binary Search Tree', 'Easy', 'trees', 'BST search',
  hook='Return the subtree rooted at the node with value <code>val</code>, or None.',
  brute='Search every node (DFS): O(n), ignoring the BST ordering.',
  insight='In a BST, smaller values are always to the left and larger to the right. Compare and step down one side: a single path, O(height).',
  steps=['While the node exists and its value isn\'t <code>val</code>: go left if <code>val</code> is smaller, else right.',
         'Return the node (None if we fell off the tree).'],
  code=r'''
class Solution:
    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        node = root
        while node and node.val != val:
            node = node.left if val < node.val else node.right
        return node
''',
  time='O(h)', space='O(1)',
  run='Solution().searchBST(build_tree([4, 2, 7, 1, 3]), 2)', expect='[2, 1, 3]',
  tests=[('Solution().searchBST(build_tree([4, 2, 7, 1, 3]), 5)', 'None')])

P(450, 'delete-node-in-a-bst', 'Delete Node in a BST', 'Medium', 'trees', 'BST recursion',
  hook='Delete the node with value <code>key</code> from a BST and return the (possibly new) root.',
  brute='Collect all values except the key and rebuild a BST: O(n log n) and loses the structure.',
  insight='Find the node by BST search. Three cases: no children → remove it; one child → replace it by that child; two children → copy in its <b>in-order successor</b> (smallest value in the right subtree), then delete that successor from the right subtree.',
  steps=['Recurse left or right until <code>root.val == key</code>, reassigning <code>root.left</code>/<code>root.right</code> with the result.',
         'If one side is empty, return the other side (handles 0 and 1 child).',
         'Two children: find the leftmost node of the right subtree; copy its value; delete it from the right subtree.',
         'Return root.'],
  code=r'''
class Solution:
    def deleteNode(self, root: Optional[TreeNode], key: int) -> Optional[TreeNode]:
        if root is None:
            return None
        if key < root.val:
            root.left = self.deleteNode(root.left, key)
        elif key > root.val:
            root.right = self.deleteNode(root.right, key)
        else:
            if root.left is None:          # 0 or 1 child
                return root.right
            if root.right is None:
                return root.left
            succ = root.right              # 2 children: in-order successor
            while succ.left:
                succ = succ.left
            root.val = succ.val
            root.right = self.deleteNode(root.right, succ.val)
        return root
''',
  time='O(h)', space='O(h)',
  run='Solution().deleteNode(build_tree([5, 3, 6, 2, 4, None, 7]), 3)', expect='[5, 4, 6, 2, None, None, 7]',
  tests=[('Solution().deleteNode(build_tree([5, 3, 6, 2, 4, None, 7]), 0)', '[5, 3, 6, 2, 4, None, 7]'), ('Solution().deleteNode(build_tree([]), 0)', 'None'), ('Solution().deleteNode(build_tree([5, 3, 6, 2, 4, None, 7]), 5)', '[6, 3, 7, 2, 4]')],
  tip='The 3D BST figure in the Trees chapter animates all three deletion cases.')

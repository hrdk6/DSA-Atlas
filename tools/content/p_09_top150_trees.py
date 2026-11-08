from _base import P

P(100, 'same-tree', 'Same Tree', 'Easy', 'trees', 'Tree DFS (two trees)',
  hook='Are two binary trees identical in shape and values?',
  brute='Serialise both trees (with markers for missing children) and compare the strings.',
  insight='Walk both trees together. Two empty trees match; one empty and one not, or different values, don\'t. Otherwise both left subtrees and both right subtrees must match.',
  steps=['Both None → True.',
         'One None, or different values → False.',
         'Return <code>same(p.left, q.left) and same(p.right, q.right)</code>.'],
  code=r'''
class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if p is None and q is None:
            return True
        if p is None or q is None or p.val != q.val:
            return False
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)
''',
  time='O(n)', space='O(h)',
  run='Solution().isSameTree(build_tree([1, 2, 3]), build_tree([1, 2, 3]))', expect='True',
  tests=[('Solution().isSameTree(build_tree([1, 2]), build_tree([1, None, 2]))', 'False'), ('Solution().isSameTree(build_tree([1, 2, 1]), build_tree([1, 1, 2]))', 'False')])

P(226, 'invert-binary-tree', 'Invert Binary Tree', 'Easy', 'trees', 'Tree DFS',
  hook='Mirror the tree: swap every node\'s left and right children.',
  brute='Already minimal: visit each node once and swap.',
  insight='Inverting a tree = invert both subtrees, then swap them. Python\'s tuple assignment does the swap in one line.',
  steps=['Empty tree → None.',
         'Set <code>root.left, root.right = invert(root.right), invert(root.left)</code>.',
         'Return root.'],
  code=r'''
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if root is None:
            return None
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root
''',
  time='O(n)', space='O(h)',
  run='Solution().invertTree(build_tree([4, 2, 7, 1, 3, 6, 9]))', expect='[4, 7, 2, 9, 6, 3, 1]',
  tests=[('Solution().invertTree(build_tree([]))', 'None')])

P(101, 'symmetric-tree', 'Symmetric Tree', 'Easy', 'trees', 'Tree DFS (two trees)',
  hook='Is the tree a mirror image of itself around its centre?',
  brute='Invert a copy of the tree and compare it with the original.',
  insight='The tree is symmetric if its left and right subtrees are mirrors. Two trees are mirrors if their roots match, the left\'s left mirrors the right\'s right, and the left\'s right mirrors the right\'s left.',
  steps=['<code>mirror(a, b)</code>: both None → True; one None or different values → False.',
         'Return <code>mirror(a.left, b.right) and mirror(a.right, b.left)</code>.',
         'Answer: <code>mirror(root.left, root.right)</code>.'],
  code=r'''
class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def mirror(a, b):
            if a is None and b is None:
                return True
            if a is None or b is None or a.val != b.val:
                return False
            return mirror(a.left, b.right) and mirror(a.right, b.left)
        return mirror(root.left, root.right)
''',
  time='O(n)', space='O(h)',
  run='Solution().isSymmetric(build_tree([1, 2, 2, 3, 4, 4, 3]))', expect='True',
  tests=[('Solution().isSymmetric(build_tree([1, 2, 2, None, 3, None, 3]))', 'False')])

P(105, 'construct-binary-tree-from-preorder-and-inorder-traversal', 'Construct Binary Tree from Preorder and Inorder Traversal', 'Medium', 'trees', 'Divide and conquer',
  hook='Rebuild a tree (unique values) from its preorder and inorder traversals.',
  brute='Search the inorder list for each root and slice lists recursively: O(n²) because of searching and slicing.',
  insight='Preorder lists each root before its subtrees, so roots come out in preorder order. In the inorder list, everything left of a root\'s position is its left subtree and everything right is its right subtree. A dict gives each value\'s inorder position in O(1).',
  steps=['Map value → index in inorder.',
         '<code>build(lo, hi)</code> builds the subtree for <code>inorder[lo..hi]</code>; empty range → None.',
         'Take the next preorder value as the root; find its inorder index <code>mid</code>.',
         'Build left from <code>lo..mid−1</code>, then right from <code>mid+1..hi</code> (left first, matching preorder).'],
  code=r'''
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        index = {v: i for i, v in enumerate(inorder)}
        i = 0                                   # next root in preorder
        def build(lo, hi):
            nonlocal i
            if lo > hi:
                return None
            val = preorder[i]
            i += 1
            node = TreeNode(val)
            mid = index[val]
            node.left = build(lo, mid - 1)      # inorder left of the root
            node.right = build(mid + 1, hi)     # inorder right of the root
            return node
        return build(0, len(inorder) - 1)
''',
  time='O(n)', space='O(n)',
  run='Solution().buildTree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])', expect='[3, 9, 20, None, None, 15, 7]',
  tests=[('Solution().buildTree([-1], [-1])', '[-1]'), ('Solution().buildTree([1, 2, 3], [3, 2, 1])', '[1, 2, None, 3]')])

P(106, 'construct-binary-tree-from-inorder-and-postorder-traversal', 'Construct Binary Tree from Inorder and Postorder Traversal', 'Medium', 'trees', 'Divide and conquer',
  hook='Rebuild a tree from its inorder and postorder traversals.',
  brute='Same as the preorder version with list slicing: O(n²).',
  insight='Postorder ends with the root, so read roots from the <b>end</b>. Reading backwards, postorder becomes root, right, left: build the <b>right</b> subtree before the left.',
  steps=['Map value → inorder index; pointer <code>i</code> at the end of postorder.',
         'Take <code>postorder[i]</code> as the root and move <code>i</code> left.',
         'Build the right subtree (<code>mid+1..hi</code>) first, then the left (<code>lo..mid−1</code>).'],
  code=r'''
class Solution:
    def buildTree(self, inorder: List[int], postorder: List[int]) -> Optional[TreeNode]:
        index = {v: i for i, v in enumerate(inorder)}
        i = len(postorder) - 1                  # roots come from the end
        def build(lo, hi):
            nonlocal i
            if lo > hi:
                return None
            val = postorder[i]
            i -= 1
            node = TreeNode(val)
            mid = index[val]
            node.right = build(mid + 1, hi)     # right first!
            node.left = build(lo, mid - 1)
            return node
        return build(0, len(inorder) - 1)
''',
  time='O(n)', space='O(n)',
  run='Solution().buildTree([9, 3, 15, 20, 7], [9, 15, 7, 20, 3])', expect='[3, 9, 20, None, None, 15, 7]',
  tests=[('Solution().buildTree([-1], [-1])', '[-1]')])

P(117, 'populating-next-right-pointers-in-each-node-ii', 'Populating Next Right Pointers in Each Node II', 'Medium', 'trees', 'Level linking',
  hook='Set each node\'s <code>next</code> pointer to the node on its right at the same level (None at the end). The tree is not necessarily complete.',
  brute='BFS level by level, linking neighbours in the queue: O(n) time, O(width) space.',
  insight='For O(1) extra space, use the <code>next</code> pointers you already built: walk the current level like a linked list, and build the next level\'s chain behind a dummy node as you meet each child.',
  steps=['<code>level = root</code>.',
         'For each level: <code>dummy = tail = Node()</code>; walk the level with <code>next</code>, appending each existing child to <code>tail</code>.',
         'Move down: <code>level = dummy.next</code>.'],
  code=r'''
class Node:   # LeetCode provides this class
    def __init__(self, val: int = 0, left: 'Node' = None, right: 'Node' = None, next: 'Node' = None):
        self.val = val
        self.left = left
        self.right = right
        self.next = next


class Solution:
    def connect(self, root: 'Node') -> 'Node':
        level = root
        while level:
            dummy = tail = Node(0)          # chain for the next level
            node = level
            while node:                     # walk this level via next
                if node.left:
                    tail.next = node.left
                    tail = tail.next
                if node.right:
                    tail.next = node.right
                    tail = tail.next
                node = node.next
            level = dummy.next              # first node of the next level
        return root
''',
  time='O(n)', space='O(1)',
  run='''
def to_node(t):
    return Node(t.val, to_node(t.left), to_node(t.right)) if t else None
root = Solution().connect(to_node(build_tree([1, 2, 3, 4, 5, None, 7])))
rows, level = [], [root]
while level:
    row, n = [], level[0]
    while n:
        row.append(n.val)
        n = n.next
    rows.append(row)
    level = [c for x in level for c in (x.left, x.right) if c]
rows
''', expect='[[1], [2, 3], [4, 5, 7]]',
  tip='Start with the BFS version (it is correct and easy), then offer the dummy-node version for the O(1)-space follow-up.')

P(114, 'flatten-binary-tree-to-linked-list', 'Flatten Binary Tree to Linked List', 'Medium', 'trees', 'Pointer rewiring',
  hook='Flatten the tree in place into a "linked list" using right pointers, in preorder order. All left pointers become None.',
  brute='Collect nodes in preorder into a list, then relink them: O(n) extra space.',
  insight='At each node with a left subtree: the left subtree must come right after the node, and the old right subtree after the <b>last</b> node of the left subtree (its rightmost node). Splice it in and move down the right.',
  steps=['<code>node = root</code>.',
         'If <code>node.left</code> exists: find the rightmost node of the left subtree.',
         'Attach <code>node.right</code> after that rightmost node; move <code>node.left</code> to <code>node.right</code>; set <code>node.left = None</code>.',
         'Continue with <code>node = node.right</code>.'],
  code=r'''
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        node = root
        while node:
            if node.left:
                tail = node.left
                while tail.right:             # last node of the left subtree
                    tail = tail.right
                tail.right = node.right       # hang the old right subtree there
                node.right = node.left
                node.left = None
            node = node.right
''',
  time='O(n)', space='O(1)',
  run='''
root = build_tree([1, 2, 5, 3, 4, None, 6])
Solution().flatten(root)
root
''', expect='[1, None, 2, None, 3, None, 4, None, 5, None, 6]')

P(112, 'path-sum', 'Path Sum', 'Easy', 'trees', 'DFS with state passed down',
  hook='Is there a root-to-<b>leaf</b> path whose values add up to <code>targetSum</code>?',
  brute='List all root-to-leaf paths and sum each: same O(n) work with more memory.',
  insight='Subtract each node\'s value from the target on the way down. At a leaf, check whether exactly nothing remains.',
  steps=['Empty tree → False.',
         '<code>remaining = target − root.val</code>.',
         'At a leaf, return <code>remaining == 0</code>.',
         'Otherwise try the left or the right subtree with <code>remaining</code>.'],
  code=r'''
class Solution:
    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:
        if root is None:
            return False
        remaining = targetSum - root.val
        if root.left is None and root.right is None:
            return remaining == 0              # a leaf: exactly used up?
        return self.hasPathSum(root.left, remaining) or self.hasPathSum(root.right, remaining)
''',
  time='O(n)', space='O(h)',
  run='Solution().hasPathSum(build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1]), 22)', expect='True',
  tests=[('Solution().hasPathSum(build_tree([1, 2, 3]), 5)', 'False'), ('Solution().hasPathSum(build_tree([]), 0)', 'False')],
  tip='The path must end at a <b>leaf</b>. Checking <code>remaining == 0</code> at non-leaf nodes is the classic bug.')

P(129, 'sum-root-to-leaf-numbers', 'Sum Root to Leaf Numbers', 'Medium', 'trees', 'DFS with state passed down',
  hook='Each root-to-leaf path spells a number (1 → 2 → 3 is 123). Return the sum of all these numbers.',
  brute='Collect each path as a string, convert, and add: works with more memory.',
  insight='Build the number as you go down: <code>number = number × 10 + digit</code>. At a leaf it is complete; return it. Each node returns the sum of the numbers in its subtree.',
  steps=['<code>dfs(node, number)</code>: None → 0.',
         'Append the digit: <code>number × 10 + node.val</code>.',
         'Leaf → return the number; else return the sum of both children.'],
  code=r'''
class Solution:
    def sumNumbers(self, root: Optional[TreeNode]) -> int:
        def dfs(node, number):
            if node is None:
                return 0
            number = number * 10 + node.val
            if node.left is None and node.right is None:
                return number
            return dfs(node.left, number) + dfs(node.right, number)
        return dfs(root, 0)
''',
  time='O(n)', space='O(h)',
  run='Solution().sumNumbers(build_tree([4, 9, 0, 5, 1]))', expect='1026',
  tests=[('Solution().sumNumbers(build_tree([1, 2, 3]))', '25')])

P(124, 'binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum', 'Hard', 'trees', 'Tree DFS (return vs answer)',
  hook='A path is any sequence of connected nodes (it can bend at most once, at its highest node). Find the maximum path sum. Values can be negative.',
  brute='Try every pair of endpoints: O(n²) paths.',
  insight='Two different quantities. The function <b>returns</b> the best path going <i>down</i> from a node (it can only continue into one child, so the parent can extend it). But at each node also consider the path that <b>bends</b> there: <code>left gain + node + right gain</code>, and update a global best with it. Negative gains are dropped (use 0).',
  steps=['<code>gain(node)</code>: None → 0.',
         '<code>left = max(gain(left), 0)</code>, <code>right = max(gain(right), 0)</code>.',
         'Update <code>best</code> with <code>node.val + left + right</code>.',
         'Return <code>node.val + max(left, right)</code> to the parent.'],
  code=r'''
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = float("-inf")
        def gain(node):                        # best downward path from node
            nonlocal best
            if node is None:
                return 0
            left = max(gain(node.left), 0)     # skip negative branches
            right = max(gain(node.right), 0)
            best = max(best, node.val + left + right)   # path bending here
            return node.val + max(left, right)          # only one side goes up
        gain(root)
        return best
''',
  time='O(n)', space='O(h)',
  run='Solution().maxPathSum(build_tree([-10, 9, 20, None, None, 15, 7]))', expect='42',
  tests=[('Solution().maxPathSum(build_tree([1, 2, 3]))', '6'), ('Solution().maxPathSum(build_tree([-3]))', '-3')],
  tip='"What the function returns" vs "what the answer is" is a recurring tree-DP idea (Diameter of Binary Tree uses it too). Say it explicitly.')

P(173, 'binary-search-tree-iterator', 'Binary Search Tree Iterator', 'Medium', 'trees', 'Controlled in-order traversal',
  hook='Build an iterator over a BST that returns values in ascending order with <code>next()</code> and <code>hasNext()</code>, using O(h) memory.',
  brute='Do a full in-order traversal into a list at construction: O(n) memory.',
  insight='Run the iterative in-order traversal one step at a time. The stack holds the path of nodes whose left side is finished but which haven\'t been returned yet. After returning a node, push the left spine of its right subtree.',
  steps=['Constructor: push the left spine of the root.',
         '<code>next</code>: pop a node; push the left spine of its right child; return its value.',
         '<code>hasNext</code>: the stack is non-empty.'],
  code=r'''
class BSTIterator:
    def __init__(self, root: Optional[TreeNode]):
        self.stack = []
        self._push_left(root)

    def _push_left(self, node):
        while node:                   # go as far left as possible
            self.stack.append(node)
            node = node.left

    def next(self) -> int:
        node = self.stack.pop()       # smallest value not yet returned
        self._push_left(node.right)
        return node.val

    def hasNext(self) -> bool:
        return bool(self.stack)
''',
  time='O(1)', space='O(h)', why='Amortized: each node is pushed and popped once over the whole iteration.',
  run='''
it = BSTIterator(build_tree([7, 3, 15, None, None, 9, 20]))
[it.next(), it.next(), it.hasNext(), it.next(), it.hasNext(), it.next(), it.hasNext(), it.next(), it.hasNext()]
''', expect='[3, 7, True, 9, True, 15, True, 20, False]')

P(222, 'count-complete-tree-nodes', 'Count Complete Tree Nodes', 'Easy', 'trees', 'Divide and conquer',
  hook='Count the nodes of a <i>complete</i> binary tree (every level full except possibly the last, which fills from the left) faster than O(n).',
  brute='Count every node with DFS: O(n). Correct, but ignores "complete".',
  insight='Measure the height along the leftmost path and along the rightmost path. If they are equal, the tree is <b>perfect</b> and has <code>2^h − 1</code> nodes, no counting needed. Otherwise recurse into both children; one of them is always perfect, so the recursion is cheap.',
  steps=['Empty → 0.',
         'Compute the leftmost-path height and rightmost-path height.',
         'Equal → return <code>2^h − 1</code>.',
         'Else → <code>1 + count(left) + count(right)</code>.'],
  code=r'''
class Solution:
    def countNodes(self, root: Optional[TreeNode]) -> int:
        if root is None:
            return 0
        left_h, node = 0, root
        while node:
            left_h += 1
            node = node.left
        right_h, node = 0, root
        while node:
            right_h += 1
            node = node.right
        if left_h == right_h:                  # perfect tree
            return (1 << left_h) - 1
        return 1 + self.countNodes(root.left) + self.countNodes(root.right)
''',
  time='O(log² n)', space='O(log n)',
  run='Solution().countNodes(build_tree([1, 2, 3, 4, 5, 6]))', expect='6',
  tests=[('Solution().countNodes(build_tree([]))', '0'), ('Solution().countNodes(build_tree([1]))', '1'), ('Solution().countNodes(build_tree([1, 2, 3, 4, 5, 6, 7]))', '7')])

P(637, 'average-of-levels-in-binary-tree', 'Average of Levels in Binary Tree', 'Easy', 'trees', 'BFS by level',
  hook='Return the average value of the nodes on each level.',
  brute='DFS collecting per-depth sums and counts also works.',
  insight='Level-order BFS: process exactly one level per outer loop, sum it, and divide by its size.',
  steps=['BFS with a queue.',
         'For each level: sum its values (size = <code>len(q)</code> at the start).',
         'Append <code>total / size</code>.'],
  code=r'''
class Solution:
    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:
        res, q = [], deque([root])
        while q:
            size, total = len(q), 0
            for _ in range(size):
                node = q.popleft()
                total += node.val
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(total / size)
        return res
''',
  time='O(n)', space='O(w)',
  run='Solution().averageOfLevels(build_tree([3, 9, 20, None, None, 15, 7]))', expect='[3.0, 14.5, 11.0]',
  tests=[('Solution().averageOfLevels(build_tree([3, 9, 20, 15, 7]))', '[3.0, 14.5, 11.0]')])

P(102, 'binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'Medium', 'trees', 'BFS by level',
  hook='Return the node values level by level, left to right.',
  brute='DFS with depth, appending into per-depth lists, also works.',
  insight='A queue naturally visits nodes in level order. Taking <code>len(q)</code> at the start of each round separates one level from the next.',
  steps=['Queue starts with the root.',
         'Each round, pop exactly <code>len(q)</code> nodes into a level list, enqueuing their children.',
         'Append the level list.'],
  code=r'''
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []
        levels, q = [], deque([root])
        while q:
            level = []
            for _ in range(len(q)):          # exactly the current level
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            levels.append(level)
        return levels
''',
  time='O(n)', space='O(w)',
  run='Solution().levelOrder(build_tree([3, 9, 20, None, None, 15, 7]))', expect='[[3], [9, 20], [15, 7]]',
  tests=[('Solution().levelOrder(build_tree([1]))', '[[1]]'), ('Solution().levelOrder(build_tree([]))', '[]')])

P(103, 'binary-tree-zigzag-level-order-traversal', 'Binary Tree Zigzag Level Order Traversal', 'Medium', 'trees', 'BFS by level',
  hook='Level order, but alternate direction: left→right, then right→left, and so on.',
  brute='Same BFS; the only question is how to reverse every other level.',
  insight='Do a normal level-order BFS and reverse every second level before storing it. The queue order never changes.',
  steps=['Normal BFS by level.',
         'Keep a flag <code>left_to_right</code>; store the level as is or reversed.',
         'Flip the flag after each level.'],
  code=r'''
class Solution:
    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []
        res, q, left_to_right = [], deque([root]), True
        while q:
            level = []
            for _ in range(len(q)):
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level if left_to_right else level[::-1])
            left_to_right = not left_to_right
        return res
''',
  time='O(n)', space='O(w)',
  run='Solution().zigzagLevelOrder(build_tree([3, 9, 20, None, None, 15, 7]))', expect='[[3], [20, 9], [15, 7]]',
  tests=[('Solution().zigzagLevelOrder(build_tree([1, 2, 3, 4, None, None, 5]))', '[[1], [3, 2], [4, 5]]')])

P(530, 'minimum-absolute-difference-in-bst', 'Minimum Absolute Difference in BST', 'Easy', 'trees', 'In-order traversal',
  hook='Return the smallest difference between the values of any two nodes in a BST.',
  brute='Compare every pair of values: O(n²).',
  insight='An in-order traversal of a BST visits values in sorted order, and in a sorted list the closest pair is always adjacent. Track the previous value during the traversal.',
  steps=['In-order DFS with a <code>prev</code> value.',
         'At each node, compare with <code>prev</code> and update the best difference.',
         'Set <code>prev = node.val</code>.'],
  code=r'''
class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        best = float("inf")
        prev = None
        def inorder(node):
            nonlocal best, prev
            if node is None:
                return
            inorder(node.left)
            if prev is not None:
                best = min(best, node.val - prev)   # sorted neighbours
            prev = node.val
            inorder(node.right)
        inorder(root)
        return best
''',
  time='O(n)', space='O(h)',
  run='Solution().getMinimumDifference(build_tree([4, 2, 6, 1, 3]))', expect='1',
  tests=[('Solution().getMinimumDifference(build_tree([1, 0, 48, None, None, 12, 49]))', '1')])

P(230, 'kth-smallest-element-in-a-bst', 'Kth Smallest Element in a BST', 'Medium', 'trees', 'In-order traversal',
  hook='Return the k-th smallest value (1-indexed) in a BST.',
  brute='Collect all values in order and index: O(n) time and memory even if k is small.',
  insight='In-order traversal visits values from smallest up. Do it iteratively with a stack and stop at the k-th visit, so the work is O(h + k).',
  steps=['Push the left spine onto a stack.',
         'Pop: that is the next smallest. Decrement k; if it hits 0, return the value.',
         'Move to the popped node\'s right child and repeat.'],
  code=r'''
class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack, node = [], root
        while True:
            while node:              # go left as far as possible
                stack.append(node)
                node = node.left
            node = stack.pop()       # next smallest
            k -= 1
            if k == 0:
                return node.val
            node = node.right
''',
  time='O(h + k)', space='O(h)',
  run='Solution().kthSmallest(build_tree([5, 3, 6, 2, 4, None, None, 1]), 3)', expect='3',
  tests=[('Solution().kthSmallest(build_tree([3, 1, 4, None, 2]), 1)', '1')],
  tip='Follow-up: if the tree changes often, store subtree sizes in each node so you can walk straight to the k-th element in O(h).')

P(98, 'validate-binary-search-tree', 'Validate Binary Search Tree', 'Medium', 'trees', 'DFS with bounds',
  hook='Is the tree a valid BST: every node greater than everything in its left subtree and smaller than everything in its right subtree?',
  brute='Checking only <code>left.val &lt; node.val &lt; right.val</code> is wrong: a deep node can break a rule set by a distant ancestor.',
  insight='Each node must lie in an <b>open range</b> set by its ancestors. Going left lowers the upper bound to the parent\'s value; going right raises the lower bound.',
  steps=['<code>valid(node, lo, hi)</code>: None → True.',
         'If <code>not lo &lt; node.val &lt; hi</code> → False.',
         'Left subtree gets <code>(lo, node.val)</code>; right subtree gets <code>(node.val, hi)</code>.'],
  code=r'''
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def valid(node, lo, hi):
            if node is None:
                return True
            if not (lo < node.val < hi):
                return False
            return valid(node.left, lo, node.val) and valid(node.right, node.val, hi)
        return valid(root, float("-inf"), float("inf"))
''',
  time='O(n)', space='O(h)',
  run='Solution().isValidBST(build_tree([5, 4, 6, None, None, 3, 7]))', expect='False',
  tests=[('Solution().isValidBST(build_tree([2, 1, 3]))', 'True'), ('Solution().isValidBST(build_tree([5, 1, 4, None, None, 3, 6]))', 'False'), ('Solution().isValidBST(build_tree([2, 2, 2]))', 'False')],
  tip='Run example 1 through the parent-only check and show it wrongly passes ([5, 4, 6, None, None, 3, 7]: 3 is below 6 but less than 5). That proves you understand why bounds are needed.')

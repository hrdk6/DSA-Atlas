from _base import P

QUAD_SER = '''
def serialize(root):
    out, q = [], [root]
    while q:
        node = q.pop(0)
        if node is None:
            out.append(None)
            continue
        out.append([int(node.isLeaf), int(node.val)])
        q.extend([node.topLeft, node.topRight, node.bottomLeft, node.bottomRight])
    while out and out[-1] is None:
        out.pop()
    return out
'''
GRID8 = '[[1,1,1,1,0,0,0,0],[1,1,1,1,0,0,0,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,0,0,0,0],[1,1,1,1,0,0,0,0],[1,1,1,1,0,0,0,0],[1,1,1,1,0,0,0,0]]'
WS_BOARD = '[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]]'

# ---------------------------------------------------------------- backtracking
P(17, 'letter-combinations-of-a-phone-number', 'Letter Combinations of a Phone Number', 'Medium', 'backtracking', 'Backtracking',
  hook='Each digit 2–9 maps to letters as on a phone keypad. Return every letter string the digits could spell.',
  brute='Nested loops work only if you know the number of digits in advance. Backtracking handles any length.',
  insight='Build the string one digit at a time: for the current digit, try each of its letters, recurse to the next digit, then undo the choice. The recursion depth equals the number of digits.',
  steps=['If digits is empty, return [].',
         '<code>backtrack(i)</code>: if <code>i == len(digits)</code>, record the path.',
         'For each letter of <code>digits[i]</code>: append, recurse with <code>i + 1</code>, pop.'],
  code=r'''
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        letters = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
                   "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
        res, path = [], []
        def backtrack(i):
            if i == len(digits):
                res.append("".join(path))
                return
            for ch in letters[digits[i]]:
                path.append(ch)          # choose
                backtrack(i + 1)         # explore
                path.pop()               # un-choose
        backtrack(0)
        return res
''',
  time='O(4ⁿ · n)', space='O(n)', why='Up to 4 letters per digit; each result has length n.',
  run='Solution().letterCombinations("23")', expect="['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf']",
  tests=[('Solution().letterCombinations("")', '[]'), ('Solution().letterCombinations("2")', "['a', 'b', 'c']")],
  tip='Visualize it: the call stack depth always equals how many letters are in <code>path</code>.')

P(216, 'combination-sum-iii', 'Combination Sum III', 'Medium', 'backtracking', 'Backtracking with pruning',
  hook='Find all combinations of k distinct numbers from 1–9 that add up to n.',
  brute='Check all 2⁹ = 512 subsets of 1–9. Small enough, but backtracking with pruning is the pattern to learn.',
  insight='Choose numbers in increasing order (pass a <code>start</code>), so each combination is built once. Stop exploring as soon as the next number exceeds what is left of the sum.',
  steps=['<code>backtrack(start, remaining)</code>.',
         'If the path has k numbers: record it if <code>remaining == 0</code>; return either way.',
         'For x from <code>start</code> to 9: if <code>x &gt; remaining</code>, break; else choose x, recurse with <code>(x + 1, remaining − x)</code>, undo.'],
  code=r'''
class Solution:
    def combinationSum3(self, k: int, n: int) -> List[List[int]]:
        res, path = [], []
        def backtrack(start, remaining):
            if len(path) == k:
                if remaining == 0:
                    res.append(path[:])
                return
            for x in range(start, 10):
                if x > remaining:
                    break                 # bigger numbers can't fit either
                path.append(x)
                backtrack(x + 1, remaining - x)
                path.pop()
        backtrack(1, n)
        return res
''',
  time='O(C(9, k) · k)', space='O(k)',
  run='Solution().combinationSum3(3, 9)', expect='[[1, 2, 6], [1, 3, 5], [2, 3, 4]]',
  tests=[('Solution().combinationSum3(3, 7)', '[[1, 2, 4]]'), ('Solution().combinationSum3(4, 1)', '[]')])

P(77, 'combinations', 'Combinations', 'Medium', 'backtracking', 'Backtracking',
  hook='Return all combinations of k numbers chosen from 1…n.',
  brute='<code>itertools.combinations</code> does it, but the point is to build it yourself.',
  insight='Pick numbers in increasing order: after choosing x, only consider numbers greater than x. That avoids duplicates like [2, 1].',
  steps=['<code>backtrack(start)</code>: if the path has k numbers, record a copy.',
         'For x from <code>start</code> to n: choose x, recurse with <code>x + 1</code>, undo.'],
  code=r'''
class Solution:
    def combine(self, n: int, k: int) -> List[List[int]]:
        res, path = [], []
        def backtrack(start):
            if len(path) == k:
                res.append(path[:])
                return
            for x in range(start, n + 1):
                path.append(x)
                backtrack(x + 1)
                path.pop()
        backtrack(1)
        return res
''',
  time='O(C(n, k) · k)', space='O(k)',
  run='Solution().combine(4, 2)', expect='[[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]',
  tests=[('Solution().combine(1, 1)', '[[1]]')],
  tip='Pruning: stop the loop when not enough numbers remain, <code>range(start, n − (k − len(path)) + 2)</code>.')

P(46, 'permutations', 'Permutations', 'Medium', 'backtracking', 'Backtracking',
  hook='Return all orderings of a list of distinct numbers.',
  brute='<code>itertools.permutations</code>. Build it by hand to learn the pattern.',
  insight='At each level, place any number not used yet. A <code>used</code> list tracks what is already in the path; undo both the path and the mark when backtracking.',
  steps=['If the path is full, record a copy.',
         'For each unused number: mark it, append it, recurse, then pop and unmark.'],
  code=r'''
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        res, path = [], []
        used = [False] * len(nums)
        def backtrack():
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i, x in enumerate(nums):
                if used[i]:
                    continue
                used[i] = True
                path.append(x)
                backtrack()
                path.pop()
                used[i] = False
        backtrack()
        return res
''',
  time='O(n · n!)', space='O(n)',
  run='Solution().permute([1, 2, 3])', expect='[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]',
  tests=[('Solution().permute([0, 1])', '[[0, 1], [1, 0]]'), ('Solution().permute([1])', '[[1]]')])

P(39, 'combination-sum', 'Combination Sum', 'Medium', 'backtracking', 'Backtracking with pruning',
  hook='Find all unique combinations of candidates (each usable any number of times) that sum to the target.',
  brute='Try all multisets: unbounded without pruning.',
  insight='Sort the candidates and pass a <code>start</code> index. Recursing with the <b>same</b> index allows reuse; never going back to earlier indexes prevents duplicate combinations. Break as soon as a candidate exceeds the remaining sum.',
  steps=['Sort candidates.',
         '<code>backtrack(start, remaining)</code>: <code>remaining == 0</code> → record.',
         'For i from start: if <code>candidates[i] &gt; remaining</code>, break; choose it and recurse with <code>(i, remaining − c)</code>.'],
  code=r'''
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        res, path = [], []
        def backtrack(start, remaining):
            if remaining == 0:
                res.append(path[:])
                return
            for i in range(start, len(candidates)):
                c = candidates[i]
                if c > remaining:
                    break                 # sorted: the rest are too big too
                path.append(c)
                backtrack(i, remaining - c)   # i again: reuse allowed
                path.pop()
        backtrack(0, target)
        return res
''',
  time='O(n^(t/m))', space='O(t/m)', why='t = target, m = smallest candidate: the deepest the recursion can go.',
  run='Solution().combinationSum([2, 3, 6, 7], 7)', expect='[[2, 2, 3], [7]]',
  tests=[('Solution().combinationSum([2, 3, 5], 8)', '[[2, 2, 2, 2], [2, 3, 3], [3, 5]]'), ('Solution().combinationSum([2], 1)', '[]')])

P(52, 'n-queens-ii', 'N-Queens II', 'Hard', 'backtracking', 'Backtracking with constraint sets',
  hook='How many ways can n queens be placed on an n×n board so that none attack each other?',
  brute='Try every placement of n queens on n² squares: astronomically many.',
  insight='Place one queen per row. A square (r, c) is attacked if its column, its diagonal (<code>r − c</code>) or its anti-diagonal (<code>r + c</code>) is already used. Three sets make each check O(1), and attacked squares are skipped immediately (pruning).',
  steps=['<code>place(r)</code>: if r == n, one full solution: return 1.',
         'For each column c not attacked: add c, r − c, r + c to the sets, count <code>place(r + 1)</code>, then remove them.',
         'Return the total.'],
  code=r'''
class Solution:
    def totalNQueens(self, n: int) -> int:
        cols, diag, anti = set(), set(), set()
        def place(r):
            if r == n:
                return 1                  # every row has a queen
            count = 0
            for c in range(n):
                if c in cols or r - c in diag or r + c in anti:
                    continue              # attacked: skip
                cols.add(c)
                diag.add(r - c)
                anti.add(r + c)
                count += place(r + 1)
                cols.remove(c)
                diag.remove(r - c)
                anti.remove(r + c)
            return count
        return place(0)
''',
  time='O(n!)', space='O(n)',
  run='Solution().totalNQueens(4)', expect='2',
  tests=[('Solution().totalNQueens(1)', '1'), ('Solution().totalNQueens(8)', '92')],
  tip='The diagonal trick is the key insight: all squares on one "\\" diagonal share r − c, and all on one "/" diagonal share r + c.')

P(22, 'generate-parentheses', 'Generate Parentheses', 'Medium', 'backtracking', 'Backtracking',
  hook='Generate every well-formed string of n pairs of parentheses.',
  brute='Generate all 2²ⁿ strings of "(" and ")" and keep the valid ones.',
  insight='Only build valid strings: you may add "(" while fewer than n are open, and ")" only while there are more opens than closes. Every completed string is then valid.',
  steps=['<code>backtrack(open, close)</code>; when the path has 2n characters, record it.',
         'If <code>open &lt; n</code>: add "(" and recurse.',
         'If <code>close &lt; open</code>: add ")" and recurse.'],
  code=r'''
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        res, path = [], []
        def backtrack(open_count, close_count):
            if len(path) == 2 * n:
                res.append("".join(path))
                return
            if open_count < n:                 # can still open one
                path.append("(")
                backtrack(open_count + 1, close_count)
                path.pop()
            if close_count < open_count:       # can close an open one
                path.append(")")
                backtrack(open_count, close_count + 1)
                path.pop()
        backtrack(0, 0)
        return res
''',
  time='O(4ⁿ / √n)', space='O(n)', why='The number of valid strings is the n-th Catalan number.',
  run='Solution().generateParenthesis(3)', expect="['((()))', '(()())', '(())()', '()(())', '()()()']",
  tests=[('Solution().generateParenthesis(1)', "['()']")])

P(79, 'word-search', 'Word Search', 'Medium', 'backtracking', 'Grid DFS backtracking',
  hook='Can the word be traced through adjacent cells (up/down/left/right) of the grid, using each cell at most once?',
  brute='There is no shortcut: the search is a DFS from every starting cell.',
  insight='From each cell, DFS matching letter by letter. Temporarily mark the current cell as used (overwrite it with "#") so the path can\'t reuse it, and restore it when backtracking.',
  steps=['<code>dfs(r, c, i)</code>: if <code>i == len(word)</code>, success.',
         'Fail if out of bounds or <code>board[r][c] != word[i]</code>.',
         'Mark the cell, try the 4 neighbours with <code>i + 1</code>, restore the cell.',
         'Try every starting cell.'],
  code=r'''
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        rows, cols = len(board), len(board[0])
        def dfs(r, c, i):
            if i == len(word):
                return True
            if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != word[i]:
                return False
            board[r][c] = "#"                 # used on this path
            found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or
                     dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
            board[r][c] = word[i]             # restore
            return found
        for r in range(rows):
            for c in range(cols):
                if dfs(r, c, 0):
                    return True
        return False
''',
  time='O(m·n · 3^L)', space='O(L)', why='L = word length; after the first step each cell has at most 3 new directions.',
  run='Solution().exist(' + WS_BOARD + ', "ABCCED")', expect='True',
  tests=[('Solution().exist(' + WS_BOARD + ', "SEE")', 'True'), ('Solution().exist(' + WS_BOARD + ', "ABCB")', 'False')],
  tip='Pruning idea to mention: if the board doesn\'t contain enough of some letter in the word, return False before searching.')

# ------------------------------------------------------------------------ tries
P(208, 'implement-trie-prefix-tree', 'Implement Trie (Prefix Tree)', 'Medium', 'tries', 'Trie',
  hook='Implement a trie with <code>insert</code>, <code>search</code> (whole word) and <code>startsWith</code> (prefix).',
  brute='Store words in a list: search is O(n · L). A set gives O(L) search but no fast prefix queries.',
  insight='Each node has a dict of children (one per next character) and a flag marking the end of a word. Insert walks/creates the path; search and startsWith walk it, and search also checks the end flag.',
  steps=['<code>insert</code>: walk characters, creating missing children; set <code>is_end</code> at the last node.',
         '<code>_find(prefix)</code>: walk; return None if a character is missing.',
         '<code>search</code>: node found and <code>is_end</code>. <code>startsWith</code>: node found.'],
  code=r'''
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def _find(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.is_end

    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None
''',
  time='O(L)', space='O(total characters)', why='Per operation, L = word length.',
  run='''
t = Trie()
t.insert("apple")
out = [t.search("apple"), t.search("app"), t.startsWith("app")]
t.insert("app")
out + [t.search("app")]
''', expect='[True, False, True, True]')

P(1268, 'search-suggestions-system', 'Search Suggestions System', 'Medium', 'tries', 'Trie with stored suggestions',
  hook='After each typed character, suggest up to 3 products (lexicographically smallest) that start with the typed prefix.',
  brute='For every prefix, filter all products and sort: O(L · n log n).',
  insight='Insert the products in <b>sorted</b> order into a trie and let every node remember the first 3 words that pass through it. Those are exactly the 3 smallest words with that prefix. Typing is then a walk down the trie.',
  steps=['Sort products; insert each, appending the word to each node\'s list while it has fewer than 3.',
         'Walk the trie with the typed letters; each node\'s list is the answer for that prefix.',
         'Once a letter is missing, every remaining answer is [].'],
  code=r'''
class Solution:
    def suggestedProducts(self, products: List[str], searchWord: str) -> List[List[str]]:
        root = {}
        for word in sorted(products):           # sorted: the first 3 are the smallest
            node = root
            for ch in word:
                node = node.setdefault(ch, {"#": []})
                if len(node["#"]) < 3:
                    node["#"].append(word)      # top suggestions for this prefix
        res, node = [], root
        for ch in searchWord:
            node = node.get(ch) if node else None
            res.append(node["#"] if node else [])
        return res
''',
  time='O(S + L)', space='O(S)', why='S = total characters in products (after sorting), L = search word length.',
  run='Solution().suggestedProducts(["mobile", "mouse", "moneypot", "monitor", "mousepad"], "mouse")',
  expect="[['mobile', 'moneypot', 'monitor'], ['mobile', 'moneypot', 'monitor'], ['mouse', 'mousepad'], ['mouse', 'mousepad'], ['mouse', 'mousepad']]",
  tests=[('Solution().suggestedProducts(["havana"], "tatiana")', '[[], [], [], [], [], [], []]')],
  tip='A simpler alternative: sort the products and, for each prefix, binary search (<code>bisect_left</code>) the first product ≥ prefix, then check the next 3.')

P(211, 'design-add-and-search-words-data-structure', 'Design Add and Search Words Data Structure', 'Medium', 'tries', 'Trie + DFS for wildcards',
  hook='Support <code>addWord</code> and <code>search</code>, where "." in a search matches any letter.',
  brute='Compare the pattern against every stored word: O(n · L) per search.',
  insight='Store words in a trie. A normal letter follows one child; a "." must try <b>every</b> child, so search becomes a DFS over the trie. Most branches die quickly.',
  steps=['<code>addWord</code>: standard trie insert with an end marker.',
         '<code>dfs(node, i)</code>: at the end of the pattern, check the marker.',
         'Letter → follow that child if it exists. "." → succeed if any child succeeds.'],
  code=r'''
class WordDictionary:
    def __init__(self):
        self.root = {}

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True                       # end of a word

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return "$" in node
            ch = word[i]
            if ch == ".":                      # wildcard: try every child
                return any(dfs(child, i + 1) for key, child in node.items() if key != "$")
            return ch in node and dfs(node[ch], i + 1)
        return dfs(self.root, 0)
''',
  time='O(L) to O(26^L)', space='O(total characters)', why='Without dots a search is O(L); every dot can branch.',
  run='''
wd = WordDictionary()
for w in ["bad", "dad", "mad"]:
    wd.addWord(w)
[wd.search("pad"), wd.search("bad"), wd.search(".ad"), wd.search("b..")]
''', expect='[False, True, True, True]')

P(212, 'word-search-ii', 'Word Search II', 'Hard', 'tries', 'Trie + grid backtracking',
  hook='Find every word from a list that can be traced on the board (adjacent cells, no reuse within a word).',
  brute='Run Word Search for each word: O(words · cells · 3^L).',
  insight='Search for <b>all words at once</b>: put them in a trie and DFS the board while walking the trie. A path stops as soon as no word has that prefix. Remove found words and empty trie branches so later searches get faster.',
  steps=['Build a trie; store the full word at its end node.',
         'From each cell whose letter starts a word, DFS: move into the trie child for the cell\'s letter.',
         'If that node holds a word, record it (and remove it to avoid duplicates).',
         'Mark the cell, explore neighbours that continue the trie, restore the cell, prune empty nodes.'],
  code=r'''
class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        root = {}
        for w in words:
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
            node["$"] = w                    # whole word stored at its end
        rows, cols = len(board), len(board[0])
        found = []

        def dfs(r, c, parent):
            ch = board[r][c]
            node = parent[ch]
            if "$" in node:
                found.append(node.pop("$"))  # report each word once
            board[r][c] = "#"                # used on this path
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] in node:
                    dfs(nr, nc, node)
            board[r][c] = ch                 # restore
            if not node:
                parent.pop(ch)               # prune an exhausted branch

        for r in range(rows):
            for c in range(cols):
                if board[r][c] in root:
                    dfs(r, c, root)
        return sorted(found)
''',
  time='O(m·n · 3^L)', space='O(total characters)', why='Worst case; the trie pruning makes it much faster in practice.',
  run='Solution().findWords([["o", "a", "a", "n"], ["e", "t", "a", "e"], ["i", "h", "k", "r"], ["i", "f", "l", "v"]], ["oath", "pea", "eat", "rain"])',
  expect="['eat', 'oath']",
  tests=[('Solution().findWords([["a", "b"], ["c", "d"]], ["abcb"])', '[]'), ('Solution().findWords([["a", "a"]], ["aaa"])', '[]')],
  tip='Explain the two optimisations separately: the trie shares prefix work across words, and pruning removes branches once their words are found.')

# ------------------------------------------------------------ divide & conquer
P(108, 'convert-sorted-array-to-binary-search-tree', 'Convert Sorted Array to Binary Search Tree', 'Easy', 'trees', 'Divide and conquer',
  hook='Build a height-balanced BST from a sorted array.',
  brute='Insert the values one by one into a BST: sorted input builds a "stick" of height n.',
  insight='The middle element as the root splits the rest into two halves of equal size: the left half (smaller) builds the left subtree and the right half the right subtree, recursively.',
  steps=['<code>build(lo, hi)</code>: empty range → None.',
         'Root = <code>nums[mid]</code>.',
         'Left = <code>build(lo, mid − 1)</code>, right = <code>build(mid + 1, hi)</code>.'],
  code=r'''
class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        def build(lo, hi):
            if lo > hi:
                return None
            mid = (lo + hi) // 2               # middle = root keeps it balanced
            node = TreeNode(nums[mid])
            node.left = build(lo, mid - 1)
            node.right = build(mid + 1, hi)
            return node
        return build(0, len(nums) - 1)
''',
  time='O(n)', space='O(log n)',
  run='Solution().sortedArrayToBST([-10, -3, 0, 5, 9])', expect='[0, -10, 5, None, -3, None, 9]',
  tests=[('Solution().sortedArrayToBST([1, 3])', '[1, None, 3]')])

P(148, 'sort-list', 'Sort List', 'Medium', 'sorting', 'Merge sort on a linked list',
  hook='Sort a linked list in O(n log n) time.',
  brute='Copy values into a Python list, sort, write back: O(n) extra space.',
  insight='Merge sort fits linked lists perfectly: split in half with fast/slow pointers, sort each half recursively, and merge two sorted lists by relinking nodes (no extra arrays).',
  steps=['0 or 1 node → already sorted.',
         'Find the middle (slow/fast), cut the list into two halves.',
         'Sort both halves recursively.',
         'Merge them with a dummy head.'],
  code=r'''
class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return head
        slow, fast = head, head.next          # split in half
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        right = slow.next
        slow.next = None
        left = self.sortList(head)
        right = self.sortList(right)
        dummy = tail = ListNode()             # merge
        while left and right:
            if left.val <= right.val:
                tail.next, left = left, left.next
            else:
                tail.next, right = right, right.next
            tail = tail.next
        tail.next = left or right
        return dummy.next
''',
  time='O(n log n)', space='O(log n)', why='The recursion stack; a bottom-up merge sort brings it to O(1).',
  run='Solution().sortList(build_list([4, 2, 1, 3]))', expect='[1, 2, 3, 4]',
  tests=[('Solution().sortList(build_list([-1, 5, 3, 4, 0]))', '[-1, 0, 3, 4, 5]'), ('Solution().sortList(build_list([]))', 'None')])

P(427, 'construct-quad-tree', 'Construct Quad Tree', 'Medium', 'sorting', 'Divide and conquer',
  hook='Represent an n×n grid of 0s and 1s as a quad tree: a uniform square is a leaf; otherwise split it into four quadrants.',
  brute='This is the natural recursive definition; the optimisation question is avoiding repeated scans.',
  insight='Recursively: if the current square is all one value, return a leaf. Otherwise split into four half-size squares (top-left, top-right, bottom-left, bottom-right) and build each.',
  steps=['<code>build(r, c, size)</code>: check whether every cell equals the top-left cell.',
         'Uniform → leaf node with that value.',
         'Else → internal node with four children built from the quadrants.'],
  code=r'''
class Node:   # LeetCode provides this class
    def __init__(self, val, isLeaf, topLeft=None, topRight=None, bottomLeft=None, bottomRight=None):
        self.val = val
        self.isLeaf = isLeaf
        self.topLeft = topLeft
        self.topRight = topRight
        self.bottomLeft = bottomLeft
        self.bottomRight = bottomRight


class Solution:
    def construct(self, grid: List[List[int]]) -> 'Node':
        def build(r, c, size):
            first = grid[r][c]
            if all(grid[i][j] == first for i in range(r, r + size) for j in range(c, c + size)):
                return Node(first == 1, True)          # uniform: a leaf
            half = size // 2
            return Node(True, False,
                        build(r, c, half), build(r, c + half, half),
                        build(r + half, c, half), build(r + half, c + half, half))
        return build(0, 0, len(grid))
''',
  time='O(n² log n)', space='O(log n)', why='Each level of the recursion scans the whole grid once.',
  run=QUAD_SER + 'serialize(Solution().construct([[0, 1], [1, 0]]))', expect='[[0, 1], [1, 0], [1, 1], [1, 1], [1, 0]]',
  tests=[(QUAD_SER + 'serialize(Solution().construct(' + GRID8 + '))', '[[0, 1], [1, 1], [0, 1], [1, 1], [1, 0], None, None, None, None, [1, 0], [1, 0], [1, 1], [1, 1]]')],
  tip='Follow-up: build the four children first and merge them into a leaf when all four are leaves with the same value. Every cell is then read once: O(n²).')

P(23, 'merge-k-sorted-lists', 'Merge k Sorted Lists', 'Hard', 'heaps', 'K-way merge with a heap',
  hook='Merge k sorted linked lists into one sorted list.',
  brute='Merge lists one at a time into the result: O(k · N). Or collect all values and sort: O(N log N).',
  insight='The next node of the answer is always the smallest among the k current list heads. A min-heap of those heads gives it in O(log k). Pop it, append it, push its successor.',
  steps=['Push <code>(head.val, i, head)</code> for every non-empty list (i breaks ties between equal values).',
         'Pop the smallest, attach it to the result, push its <code>next</code> if any.',
         'Repeat until the heap is empty.'],
  code=r'''
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
        heapq.heapify(heap)
        dummy = tail = ListNode()
        while heap:
            val, i, node = heapq.heappop(heap)
            tail.next = node
            tail = node
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next
''',
  time='O(N log k)', space='O(k)', why='N = total number of nodes.',
  run='Solution().mergeKLists([build_list([1, 4, 5]), build_list([1, 3, 4]), build_list([2, 6])])', expect='[1, 1, 2, 3, 4, 4, 5, 6]',
  tests=[('Solution().mergeKLists([])', 'None'), ('Solution().mergeKLists([build_list([])])', 'None')],
  tip='The index i in the tuple matters: without it, two equal values would make Python compare ListNode objects and crash. Divide-and-conquer pairwise merging is the other O(N log k) answer.')

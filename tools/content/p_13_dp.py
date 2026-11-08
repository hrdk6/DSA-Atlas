from _base import P

SQUARE = '[["1", "0", "1", "0", "0"], ["1", "0", "1", "1", "1"], ["1", "1", "1", "1", "1"], ["1", "0", "0", "1", "0"]]'

# ----------------------------------------------------------------------- 1D DP
P(70, 'climbing-stairs', 'Climbing Stairs', 'Easy', 'dp', '1D DP',
  hook='You climb 1 or 2 steps at a time. How many different ways reach the top of n steps?',
  brute='Recursion <code>ways(n) = ways(n−1) + ways(n−2)</code> without memory: O(2ⁿ) calls.',
  insight='Your <b>last</b> move onto step n was either a 1-step (from n − 1) or a 2-step (from n − 2), so <code>ways(n) = ways(n − 1) + ways(n − 2)</code>: the Fibonacci numbers. Each answer only needs the previous two, so keep two variables.',
  steps=['<code>prev, cur = 1, 1</code> (ways to reach steps 0 and 1).',
         'Repeat n − 1 times: <code>prev, cur = cur, prev + cur</code>.',
         'Return <code>cur</code>.'],
  code=r'''
class Solution:
    def climbStairs(self, n: int) -> int:
        prev, cur = 1, 1            # ways(0), ways(1)
        for _ in range(n - 1):
            prev, cur = cur, prev + cur
        return cur
''',
  time='O(n)', space='O(1)',
  run='Solution().climbStairs(5)', expect='8',
  tests=[('Solution().climbStairs(2)', '2'), ('Solution().climbStairs(3)', '3'), ('Solution().climbStairs(1)', '1')],
  tip='The DP chapter animates this table. In an interview, show the naive recursion, point out the repeated work, then add memoization, then reduce to two variables.')

P(1137, 'n-th-tribonacci-number', 'N-th Tribonacci Number', 'Easy', 'dp', '1D DP',
  hook='T0 = 0, T1 = 1, T2 = 1, and each next term is the sum of the previous three. Return Tn.',
  brute='Plain recursion: three calls per call, exponential.',
  insight='Each term needs only the previous three, so slide a window of three variables forward.',
  steps=['Handle n = 0.',
         'Start with <code>a, b, c = 0, 1, 1</code>.',
         'Repeat n − 2 times: <code>a, b, c = b, c, a + b + c</code>.',
         'Return <code>c</code>.'],
  code=r'''
class Solution:
    def tribonacci(self, n: int) -> int:
        if n == 0:
            return 0
        a, b, c = 0, 1, 1           # T0, T1, T2
        for _ in range(n - 2):
            a, b, c = b, c, a + b + c
        return c
''',
  time='O(n)', space='O(1)',
  run='Solution().tribonacci(4)', expect='4',
  tests=[('Solution().tribonacci(25)', '1389537'), ('Solution().tribonacci(0)', '0'), ('Solution().tribonacci(1)', '1')])

P(746, 'min-cost-climbing-stairs', 'Min Cost Climbing Stairs', 'Easy', 'dp', '1D DP',
  hook='Stepping on stair i costs <code>cost[i]</code>; from there you climb 1 or 2 stairs. Start on stair 0 or 1. What is the cheapest way to get past the last stair?',
  brute='Try every sequence of 1- and 2-steps: exponential.',
  insight='Let <code>dp[i]</code> = cheapest cost to <b>stand on</b> position i (the top is position n). You arrive from i − 1 (paying its cost) or from i − 2. <code>dp[0] = dp[1] = 0</code>.',
  steps=['<code>dp[i] = min(dp[i−1] + cost[i−1], dp[i−2] + cost[i−2])</code> for i = 2…n.',
         'Only the last two values are needed: keep two variables.',
         'Return <code>dp[n]</code>.'],
  code=r'''
class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        two_back = one_back = 0             # cheapest way to stand on i-2 / i-1
        for i in range(2, len(cost) + 1):
            here = min(one_back + cost[i - 1], two_back + cost[i - 2])
            two_back, one_back = one_back, here
        return one_back
''',
  time='O(n)', space='O(1)',
  run='Solution().minCostClimbingStairs([10, 15, 20])', expect='15',
  tests=[('Solution().minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1])', '6')])

P(198, 'house-robber', 'House Robber', 'Medium', 'dp', '1D DP (take or skip)',
  hook='You can\'t rob two neighbouring houses. What is the maximum you can rob?',
  brute='Try every set of non-adjacent houses: exponential.',
  insight='At each house there are two choices. <b>Skip</b> it: keep the best up to the previous house. <b>Rob</b> it: its value plus the best up to two houses back. Take the larger.',
  steps=['<code>two_back = one_back = 0</code>.',
         'For each value x: <code>best = max(one_back, two_back + x)</code>.',
         'Shift: <code>two_back, one_back = one_back, best</code>.',
         'Return <code>one_back</code>.'],
  code=r'''
class Solution:
    def rob(self, nums: List[int]) -> int:
        two_back = one_back = 0          # best up to 2 houses ago / up to the last house
        for x in nums:
            best = max(one_back, two_back + x)   # skip it, or rob it
            two_back, one_back = one_back, best
        return one_back
''',
  time='O(n)', space='O(1)',
  run='Solution().rob([2, 7, 9, 3, 1])', expect='12',
  tests=[('Solution().rob([1, 2, 3, 1])', '4'), ('Solution().rob([2, 1, 1, 2])', '4')],
  tip='Write the recurrence with a table first (<code>dp[i] = max(dp[i−1], dp[i−2] + nums[i])</code>); compressing to two variables is the follow-up.')

P(790, 'domino-and-tromino-tiling', 'Domino and Tromino Tiling', 'Medium', 'dp', 'DP with two states',
  hook='How many ways can a 2 × n board be tiled with 2×1 dominoes and L-shaped trominoes (rotations allowed)? Answer modulo 10⁹ + 7.',
  brute='Place pieces recursively column by column: exponential.',
  insight='Track two kinds of partial boards. <code>full[i]</code>: a complete 2 × i board. <code>part[i]</code>: a 2 × i board with one extra cell sticking out (top or bottom, same count by symmetry). A full board ends with a vertical domino, two horizontal dominoes, or a tromino that completes a partial board (two mirror orientations).',
  steps=['<code>full[0] = full[1] = 1</code>.',
         '<code>part[i] = part[i−1] + full[i−2]</code> (extend a partial with a domino, or start one with a tromino).',
         '<code>full[i] = full[i−1] + full[i−2] + 2 · part[i−1]</code>.',
         'Return <code>full[n]</code> mod 10⁹ + 7.'],
  code=r'''
class Solution:
    def numTilings(self, n: int) -> int:
        MOD = 10**9 + 7
        full = [0] * (n + 1)      # complete 2 x i boards
        part = [0] * (n + 1)      # 2 x i boards with one cell sticking out
        full[0] = 1
        full[1] = 1
        for i in range(2, n + 1):
            part[i] = (part[i - 1] + full[i - 2]) % MOD
            full[i] = (full[i - 1] + full[i - 2] + 2 * part[i - 1]) % MOD
        return full[n]
''',
  time='O(n)', space='O(n)',
  run='Solution().numTilings(4)', expect='11',
  tests=[('Solution().numTilings(3)', '5'), ('Solution().numTilings(1)', '1'), ('Solution().numTilings(5)', '24')],
  tip='Draw the n = 3 tilings (there are 5). The two-state model falls out of "what does the right edge look like?". Combining the equations gives <code>full[n] = 2·full[n−1] + full[n−3]</code>.')

P(139, 'word-break', 'Word Break', 'Medium', 'dp', '1D DP over prefixes',
  hook='Can the string be split into a sequence of dictionary words?',
  brute='Try every split point recursively: exponential without memory.',
  insight='<code>dp[i]</code> = "can the first i characters be split?". It is true if some earlier split point <code>j</code> works (<code>dp[j]</code>) and the piece <code>s[j:i]</code> is a word. <code>dp[0]</code> is true (empty prefix).',
  steps=['Put the words in a set.',
         '<code>dp[0] = True</code>.',
         'For each i, look for j &lt; i with <code>dp[j]</code> true and <code>s[j:i]</code> in the set.',
         'Return <code>dp[n]</code>.'],
  code=r'''
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        n = len(s)
        dp = [False] * (n + 1)        # dp[i]: can s[:i] be split into words?
        dp[0] = True
        for i in range(1, n + 1):
            for j in range(i):
                if dp[j] and s[j:i] in words:
                    dp[i] = True
                    break
        return dp[n]
''',
  time='O(n² · L)', space='O(n)', why='L for slicing/hashing the substring; limit j to the longest word length to speed it up.',
  run='Solution().wordBreak("leetcode", ["leet", "code"])', expect='True',
  tests=[('Solution().wordBreak("applepenapple", ["apple", "pen"])', 'True'), ('Solution().wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"])', 'False')])

P(322, 'coin-change', 'Coin Change', 'Medium', 'dp', '1D DP (unbounded choices)',
  hook='Fewest coins that add up to <code>amount</code> (coins can be reused). Return −1 if impossible.',
  brute='Greedy (largest coin first) is wrong: coins [1, 3, 4] and amount 6 give 4 + 1 + 1, but 3 + 3 is better.',
  insight='<code>dp[a]</code> = fewest coins for amount a. The last coin used is some c, so <code>dp[a] = min(dp[a − c] + 1)</code> over all coins c ≤ a. Build from 0 upwards.',
  steps=['<code>dp[0] = 0</code>, others infinity.',
         'For each amount a from 1 to amount, try every coin c ≤ a.',
         'Return <code>dp[amount]</code>, or −1 if still infinity.'],
  code=r'''
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        INF = float("inf")
        dp = [0] + [INF] * amount          # dp[a]: fewest coins for amount a
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a and dp[a - c] + 1 < dp[a]:
                    dp[a] = dp[a - c] + 1  # use coin c last
        return dp[amount] if dp[amount] != INF else -1
''',
  time='O(amount · k)', space='O(amount)', why='k = number of coin types.',
  run='Solution().coinChange([1, 2, 5], 11)', expect='3',
  tests=[('Solution().coinChange([2], 3)', '-1'), ('Solution().coinChange([1], 0)', '0'), ('Solution().coinChange([1, 3, 4], 6)', '2')])

P(300, 'longest-increasing-subsequence', 'Longest Increasing Subsequence', 'Medium', 'dp', 'Patience sorting (binary search)',
  hook='Length of the longest strictly increasing subsequence (not necessarily contiguous).',
  brute='DP: <code>dp[i]</code> = longest increasing subsequence ending at i = 1 + max(dp[j]) over j &lt; i with nums[j] &lt; nums[i]. O(n²), a perfectly good first answer.',
  insight='Keep <code>tails[k]</code> = the <b>smallest possible last value</b> of an increasing subsequence of length k + 1. Smaller tails are easier to extend. For each x, binary search the first tail ≥ x: replace it (a better tail), or append if x is bigger than all tails.',
  steps=['<code>tails = []</code>.',
         'For each x, binary search the first index with <code>tails[i] ≥ x</code>.',
         'If none, append x (longer subsequence); else set <code>tails[i] = x</code>.',
         'The answer is <code>len(tails)</code>.'],
  code=r'''
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []     # tails[k]: smallest tail of an increasing run of length k+1
        for x in nums:
            lo, hi = 0, len(tails)
            while lo < hi:                  # first tail >= x
                mid = (lo + hi) // 2
                if tails[mid] < x:
                    lo = mid + 1
                else:
                    hi = mid
            if lo == len(tails):
                tails.append(x)             # extends the longest run
            else:
                tails[lo] = x               # a smaller tail for this length
        return len(tails)
''',
  time='O(n log n)', space='O(n)',
  run='Solution().lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])', expect='4',
  tests=[('Solution().lengthOfLIS([0, 1, 0, 3, 2, 3])', '4'), ('Solution().lengthOfLIS([7, 7, 7, 7])', '1')],
  tip='Note that <code>tails</code> is not itself an increasing subsequence of the input; only its length is meaningful. Interviewers like hearing that you know this.')

# --------------------------------------------------------------------- Kadane
P(53, 'maximum-subarray', 'Maximum Subarray', 'Medium', 'dp', "Kadane's algorithm",
  hook='Find the contiguous subarray with the largest sum.',
  brute='Try every subarray: O(n²) with running sums.',
  insight='The best subarray <b>ending at i</b> either extends the best one ending at i − 1, or starts fresh at i, whichever is larger. If the running sum becomes worse than starting over, drop it.',
  steps=['<code>cur = best = nums[0]</code>.',
         'For each later x: <code>cur = max(x, cur + x)</code>.',
         '<code>best = max(best, cur)</code>.'],
  code=r'''
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = best = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)      # extend or restart
            best = max(best, cur)
        return best
''',
  time='O(n)', space='O(1)',
  run='Solution().maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])', expect='6',
  tests=[('Solution().maxSubArray([1])', '1'), ('Solution().maxSubArray([5, 4, -1, 7, 8])', '23'), ('Solution().maxSubArray([-3, -1, -2])', '-1')],
  tip='Starting with <code>nums[0]</code> (not 0) handles all-negative arrays correctly.')

P(918, 'maximum-sum-circular-subarray', 'Maximum Sum Circular Subarray', 'Medium', 'dp', "Kadane's algorithm",
  hook='Same as Maximum Subarray, but the array is circular: a subarray may wrap from the end back to the start.',
  brute='Try every start and length on the circle: O(n²).',
  insight='A wrapping subarray is everything <b>except</b> a contiguous middle part. So the best wrapping sum = total − (minimum subarray sum). Run Kadane for the max and for the min. Special case: if all numbers are negative, the "wrap" would be empty, so return the plain max.',
  steps=['Run Kadane for the maximum subarray and, in the same loop, for the minimum subarray. Also sum the total.',
         'If the max is negative (all numbers negative), return it.',
         'Otherwise return <code>max(best_max, total − best_min)</code>.'],
  code=r'''
class Solution:
    def maxSubarraySumCircular(self, nums: List[int]) -> int:
        total = 0
        cur_max = cur_min = 0
        best_max = best_min = nums[0]
        for x in nums:
            cur_max = max(x, cur_max + x)
            best_max = max(best_max, cur_max)
            cur_min = min(x, cur_min + x)
            best_min = min(best_min, cur_min)
            total += x
        if best_max < 0:
            return best_max                    # all negative
        return max(best_max, total - best_min) # no wrap, or wrap around
''',
  time='O(n)', space='O(1)',
  run='Solution().maxSubarraySumCircular([5, -3, 5])', expect='10',
  tests=[('Solution().maxSubarraySumCircular([1, -2, 3, -2])', '3'), ('Solution().maxSubarraySumCircular([-3, -2, -3])', '-2')])

# ----------------------------------------------------------------------- 2D DP
P(62, 'unique-paths', 'Unique Paths', 'Medium', 'dp', '2D grid DP',
  hook='A robot moves only right or down on an m × n grid. How many paths lead from the top-left to the bottom-right?',
  brute='Enumerate every path recursively: exponential.',
  insight='The number of ways to reach a cell = ways to reach the cell above + ways to reach the cell to the left. The top row and left column have exactly one way each.',
  steps=['Fill a grid with 1s.',
         'For every other cell: <code>dp[r][c] = dp[r−1][c] + dp[r][c−1]</code>.',
         'Return the bottom-right value.'],
  code=r'''
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[1] * n for _ in range(m)]
        for r in range(1, m):
            for c in range(1, n):
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]   # from above + from the left
        return dp[m - 1][n - 1]
''',
  time='O(m · n)', space='O(m · n)', why='One row is enough: O(n) space.',
  run='Solution().uniquePaths(3, 7)', expect='28',
  tests=[('Solution().uniquePaths(3, 2)', '3'), ('Solution().uniquePaths(1, 1)', '1')],
  tip='Math shortcut: the answer is C(m + n − 2, m − 1), choosing which moves are "down". Mention it, but the DP is what is being tested.')

P(63, 'unique-paths-ii', 'Unique Paths II', 'Medium', 'dp', '2D grid DP',
  hook='Unique Paths, but some cells are obstacles (1) that can\'t be entered.',
  brute='Recursive enumeration that avoids obstacles: exponential.',
  insight='Same recurrence, with one change: an obstacle cell has 0 ways. Cells on the first row/column are no longer automatically 1 (an obstacle blocks everything after it), so compute them from their single neighbour.',
  steps=['If a cell is an obstacle, <code>dp = 0</code>.',
         'The start cell (if open) is 1.',
         'Otherwise <code>dp[r][c] = up + left</code>, treating missing neighbours as 0.'],
  code=r'''
class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:
        rows, cols = len(obstacleGrid), len(obstacleGrid[0])
        dp = [[0] * cols for _ in range(rows)]
        for r in range(rows):
            for c in range(cols):
                if obstacleGrid[r][c] == 1:
                    dp[r][c] = 0                       # blocked
                elif r == 0 and c == 0:
                    dp[r][c] = 1
                else:
                    up = dp[r - 1][c] if r > 0 else 0
                    left = dp[r][c - 1] if c > 0 else 0
                    dp[r][c] = up + left
        return dp[-1][-1]
''',
  time='O(m · n)', space='O(m · n)',
  run='Solution().uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]])', expect='2',
  tests=[('Solution().uniquePathsWithObstacles([[0, 1], [0, 0]])', '1'), ('Solution().uniquePathsWithObstacles([[1]])', '0')])

P(64, 'minimum-path-sum', 'Minimum Path Sum', 'Medium', 'dp', '2D grid DP',
  hook='Moving only right or down, find the path from top-left to bottom-right with the smallest sum.',
  brute='Try every path: exponential.',
  insight='The cheapest way into a cell comes from the cheaper of its top and left neighbours: <code>dp[r][c] = grid[r][c] + min(up, left)</code>. The first row and column have only one way in.',
  steps=['<code>dp[0][0] = grid[0][0]</code>.',
         'First row: from the left only. First column: from above only.',
         'Other cells: <code>min(dp[r−1][c], dp[r][c−1]) + grid[r][c]</code>.'],
  code=r'''
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        dp = [[0] * cols for _ in range(rows)]
        for r in range(rows):
            for c in range(cols):
                if r == 0 and c == 0:
                    dp[r][c] = grid[0][0]
                elif r == 0:
                    dp[r][c] = dp[r][c - 1] + grid[r][c]    # from the left only
                elif c == 0:
                    dp[r][c] = dp[r - 1][c] + grid[r][c]    # from above only
                else:
                    dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]
        return dp[-1][-1]
''',
  time='O(m · n)', space='O(m · n)',
  run='Solution().minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]])', expect='7',
  tests=[('Solution().minPathSum([[1, 2, 3], [4, 5, 6]])', '12')])

P(120, 'triangle', 'Triangle', 'Medium', 'dp', 'DP bottom-up',
  hook='Find the minimum path sum from the top of a triangle to the bottom, moving to an adjacent number on the row below each step.',
  brute='Try every path: 2ⁿ⁻¹ paths.',
  insight='Work <b>bottom-up</b>: the best path from a cell is its value plus the better of the two best paths below it. Start from the last row and fold upward; the top ends up holding the answer, with no edge cases.',
  steps=['<code>best</code> = copy of the last row.',
         'For each row from second-to-last up: <code>best[c] = triangle[r][c] + min(best[c], best[c + 1])</code>.',
         'Return <code>best[0]</code>.'],
  code=r'''
class Solution:
    def minimumTotal(self, triangle: List[List[int]]) -> int:
        best = triangle[-1][:]                    # best sums starting at the bottom row
        for r in range(len(triangle) - 2, -1, -1):
            for c in range(r + 1):
                best[c] = triangle[r][c] + min(best[c], best[c + 1])
        return best[0]
''',
  time='O(n²)', space='O(n)', why='n = number of rows.',
  run='Solution().minimumTotal([[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]])', expect='11',
  tests=[('Solution().minimumTotal([[-10]])', '-10')])

P(1143, 'longest-common-subsequence', 'Longest Common Subsequence', 'Medium', 'dp', '2D DP over two strings',
  hook='Length of the longest sequence of characters that appears, in order, in both strings.',
  brute='Generate all subsequences of one string and check them in the other: 2ⁿ.',
  insight='<code>dp[i][j]</code> = LCS of the first i letters of A and first j letters of B. If the last letters match, they extend the diagonal answer by 1. If not, drop the last letter of one string or the other and take the better.',
  steps=['Table of size (m + 1) × (n + 1), row/column 0 = 0.',
         'Match: <code>dp[i][j] = dp[i−1][j−1] + 1</code>.',
         'No match: <code>dp[i][j] = max(dp[i−1][j], dp[i][j−1])</code>.',
         'Answer: <code>dp[m][n]</code>.'],
  code=r'''
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]
''',
  time='O(m · n)', space='O(m · n)',
  run='Solution().longestCommonSubsequence("abcde", "ace")', expect='3',
  tests=[('Solution().longestCommonSubsequence("abc", "abc")', '3'), ('Solution().longestCommonSubsequence("abc", "def")', '0')],
  tip='The 3D DP figure and the step-through table in the DP chapter both animate this exact recurrence.')

P(72, 'edit-distance', 'Edit Distance', 'Medium', 'dp', '2D DP over two strings',
  hook='Minimum number of single-character inserts, deletes and replacements to turn <code>word1</code> into <code>word2</code>.',
  brute='Try all edit sequences recursively: exponential.',
  insight='<code>dp[i][j]</code> = edits to turn the first i letters of word1 into the first j letters of word2. If the last letters match, no edit: take the diagonal. Otherwise 1 + the best of delete (up), insert (left) or replace (diagonal).',
  steps=['<code>dp[i][0] = i</code> (delete all), <code>dp[0][j] = j</code> (insert all).',
         'Match: <code>dp[i][j] = dp[i−1][j−1]</code>.',
         'Else <code>1 + min(dp[i−1][j], dp[i][j−1], dp[i−1][j−1])</code>.',
         'Answer <code>dp[m][n]</code>.'],
  code=r'''
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i                     # delete everything
        for j in range(n + 1):
            dp[0][j] = j                     # insert everything
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j],      # delete
                                       dp[i][j - 1],      # insert
                                       dp[i - 1][j - 1])  # replace
        return dp[m][n]
''',
  time='O(m · n)', space='O(m · n)',
  run='Solution().minDistance("horse", "ros")', expect='3',
  tests=[('Solution().minDistance("intention", "execution")', '5'), ('Solution().minDistance("", "a")', '1')])

P(5, 'longest-palindromic-substring', 'Longest Palindromic Substring', 'Medium', 'dp', 'Expand around centre',
  hook='Return the longest substring that reads the same forwards and backwards.',
  brute='Check every substring: O(n³). A 2D DP table (<code>is_pal[i][j]</code>) brings it to O(n²) time and space.',
  insight='Every palindrome has a centre: a single character (odd length) or a gap between two (even length). Expand outward from each of the 2n − 1 centres while the ends match, and keep the longest. O(n²) time, O(1) space.',
  steps=['For each index i, expand around <code>(i, i)</code> and <code>(i, i + 1)</code>.',
         'Expand while in range and <code>s[l] == s[r]</code>.',
         'Keep the widest palindrome found.'],
  code=r'''
class Solution:
    def longestPalindrome(self, s: str) -> str:
        best_l, best_r = 0, 0
        def expand(l, r):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return l + 1, r - 1                 # last matching bounds
        for i in range(len(s)):
            for l, r in (expand(i, i), expand(i, i + 1)):   # odd, even centres
                if r - l > best_r - best_l:
                    best_l, best_r = l, r
        return s[best_l:best_r + 1]
''',
  time='O(n²)', space='O(1)',
  run='Solution().longestPalindrome("babad")', expect="'bab'",
  tests=[('Solution().longestPalindrome("cbbd")', "'bb'"), ('Solution().longestPalindrome("a")', "'a'")],
  tip='Manacher\'s algorithm does this in O(n), but nobody expects it in an interview. Mention that it exists.')

P(97, 'interleaving-string', 'Interleaving String', 'Medium', 'dp', '2D DP over two strings',
  hook='Can <code>s3</code> be formed by interleaving <code>s1</code> and <code>s2</code>, keeping each string\'s letters in order?',
  brute='Recursively choose the next letter from s1 or s2: exponential without memory.',
  insight='<code>dp[i][j]</code> = can the first i letters of s1 and first j letters of s2 form the first i + j letters of s3? The last letter of that prefix came from s1 (then <code>dp[i−1][j]</code> must be true) or from s2 (<code>dp[i][j−1]</code>).',
  steps=['Lengths must add up, else False.',
         '<code>dp[0][0] = True</code>.',
         '<code>dp[i][j]</code> is true if (s1[i−1] == s3[i+j−1] and dp[i−1][j]) or (s2[j−1] == s3[i+j−1] and dp[i][j−1]).',
         'Answer <code>dp[m][n]</code>.'],
  code=r'''
class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        m, n = len(s1), len(s2)
        if m + n != len(s3):
            return False
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for i in range(m + 1):
            for j in range(n + 1):
                if i > 0 and s1[i - 1] == s3[i + j - 1] and dp[i - 1][j]:
                    dp[i][j] = True           # last letter came from s1
                if j > 0 and s2[j - 1] == s3[i + j - 1] and dp[i][j - 1]:
                    dp[i][j] = True           # last letter came from s2
        return dp[m][n]
''',
  time='O(m · n)', space='O(m · n)',
  run='Solution().isInterleave("aabcc", "dbbca", "aadbbcbcac")', expect='True',
  tests=[('Solution().isInterleave("aabcc", "dbbca", "aadbbbaccc")', 'False'), ('Solution().isInterleave("", "", "")', 'True')])

P(221, 'maximal-square', 'Maximal Square', 'Medium', 'dp', '2D grid DP',
  hook='Find the area of the largest square containing only "1"s.',
  brute='For every cell, try growing a square: O((m·n)²).',
  insight='Let <code>dp</code> at a cell be the side of the largest all-1 square whose <b>bottom-right corner</b> is that cell. It is limited by the squares ending above, to the left and diagonally above-left: <code>1 + min(those three)</code>.',
  steps=['Use a padded table so the first row/column need no special case.',
         'For every "1": <code>dp = 1 + min(up, left, up_left)</code>.',
         'Track the largest side; return side².'],
  code=r'''
class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        rows, cols = len(matrix), len(matrix[0])
        dp = [[0] * (cols + 1) for _ in range(rows + 1)]   # padded by one row/column
        side = 0
        for r in range(rows):
            for c in range(cols):
                if matrix[r][c] == "1":
                    dp[r + 1][c + 1] = 1 + min(dp[r][c + 1], dp[r + 1][c], dp[r][c])
                    side = max(side, dp[r + 1][c + 1])
        return side * side
''',
  time='O(m · n)', space='O(m · n)',
  run='Solution().maximalSquare(' + SQUARE + ')', expect='4',
  tests=[('Solution().maximalSquare([["0", "1"], ["1", "0"]])', '1'), ('Solution().maximalSquare([["0"]])', '0')])

# --------------------------------------------------------- stock state machines
P(714, 'best-time-to-buy-and-sell-stock-with-transaction-fee', 'Best Time to Buy and Sell Stock with Transaction Fee', 'Medium', 'dp', 'State machine DP',
  hook='Unlimited transactions, but each sale costs a fee. Hold at most one share. Maximise profit.',
  brute='Try every buy/sell pattern: exponential.',
  insight='Each day you are in one of two states: holding no share (<code>cash</code>) or holding one (<code>hold</code>). Today\'s best values come from yesterday\'s: sell (hold → cash, pay the fee) or buy (cash → hold).',
  steps=['<code>cash = 0</code>, <code>hold = −prices[0]</code>.',
         'Each day: <code>cash = max(cash, hold + price − fee)</code>.',
         '<code>hold = max(hold, cash − price)</code>.',
         'Return <code>cash</code>.'],
  code=r'''
class Solution:
    def maxProfit(self, prices: List[int], fee: int) -> int:
        cash, hold = 0, -prices[0]          # best profit without / with a share
        for p in prices[1:]:
            cash = max(cash, hold + p - fee)   # sell today
            hold = max(hold, cash - p)         # buy today
        return cash
''',
  time='O(n)', space='O(1)',
  run='Solution().maxProfit([1, 3, 2, 8, 4, 9], 2)', expect='8',
  tests=[('Solution().maxProfit([1, 3, 7, 5, 10, 3], 3)', '6')],
  tip='This hold/cash state machine solves the whole stock family: add a cooldown state or a transaction counter for the variants.')

P(123, 'best-time-to-buy-and-sell-stock-iii', 'Best Time to Buy and Sell Stock III', 'Hard', 'dp', 'State machine DP',
  hook='At most <b>two</b> transactions (buy then sell, twice, not overlapping). Maximise profit.',
  brute='Try every split point and solve the one-transaction problem on each side: O(n²) (or O(n) with prefix/suffix arrays).',
  insight='Walk through four states in order: after the first buy, after the first sell, after the second buy, after the second sell. Each state\'s best balance comes from the previous state on the same or an earlier day.',
  steps=['<code>buy1 = buy2 = −∞</code>, <code>sell1 = sell2 = 0</code>.',
         'Each price p: <code>buy1 = max(buy1, −p)</code>; <code>sell1 = max(sell1, buy1 + p)</code>.',
         '<code>buy2 = max(buy2, sell1 − p)</code>; <code>sell2 = max(sell2, buy2 + p)</code>.',
         'Return <code>sell2</code>.'],
  code=r'''
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        buy1 = buy2 = float("-inf")    # best balance after 1st / 2nd buy
        sell1 = sell2 = 0              # best balance after 1st / 2nd sell
        for p in prices:
            buy1 = max(buy1, -p)
            sell1 = max(sell1, buy1 + p)
            buy2 = max(buy2, sell1 - p)
            sell2 = max(sell2, buy2 + p)
        return sell2
''',
  time='O(n)', space='O(1)',
  run='Solution().maxProfit([3, 3, 5, 0, 0, 3, 1, 4])', expect='6',
  tests=[('Solution().maxProfit([1, 2, 3, 4, 5])', '4'), ('Solution().maxProfit([7, 6, 4, 3, 1])', '0')])

P(188, 'best-time-to-buy-and-sell-stock-iv', 'Best Time to Buy and Sell Stock IV', 'Hard', 'dp', 'State machine DP',
  hook='At most <code>k</code> transactions. Maximise profit.',
  brute='Exponential search over trade patterns.',
  insight='Generalise the two-transaction version: arrays <code>buy[t]</code> and <code>sell[t]</code> for each transaction number t. Buying for trade t uses the profit after finishing trade t − 1.',
  steps=['<code>buy[t] = −∞</code>, <code>sell[t] = 0</code> for t = 0…k.',
         'For each price, for t = 1…k: <code>buy[t] = max(buy[t], sell[t−1] − p)</code>, <code>sell[t] = max(sell[t], buy[t] + p)</code>.',
         'Return <code>sell[k]</code>.'],
  code=r'''
class Solution:
    def maxProfit(self, k: int, prices: List[int]) -> int:
        buy = [float("-inf")] * (k + 1)   # buy[t]: best balance holding a share in trade t
        sell = [0] * (k + 1)              # sell[t]: best balance after t trades
        for p in prices:
            for t in range(1, k + 1):
                buy[t] = max(buy[t], sell[t - 1] - p)
                sell[t] = max(sell[t], buy[t] + p)
        return sell[k]
''',
  time='O(n · k)', space='O(k)',
  run='Solution().maxProfit(2, [3, 2, 6, 5, 0, 3])', expect='7',
  tests=[('Solution().maxProfit(2, [2, 4, 1])', '2'), ('Solution().maxProfit(1, [1, 2])', '1')],
  tip='Optimisation: if k ≥ n / 2, the limit never binds, so use the unlimited-transactions answer (sum of all rises).')

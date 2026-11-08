/* Pattern chapters: backtracking, dynamic programming, greedy, bits & math, sorting. */
(function () {
  const { h, sub, p, analogy, tip, warn, interview, key, note, code, template, table, steps, list, grid, quiz, problems, widget, viz3d } = DSA.L;
  const py = String.raw;
  const cx = (s) => DSA.cx(s);

  DSA.addLesson({
    id: 'backtracking', group: 'Patterns', title: 'Backtracking', short: 'Backtracking', level: 'Intermediate', minutes: 30,
    blurb: 'Generate every valid combination: choose, explore, un-choose. Subsets, permutations, puzzles.',
    summary: 'Backtracking builds candidate answers one decision at a time and abandons a path as soon as it can\'t lead anywhere. Every "list all combinations / arrangements / ways" problem is a backtracking problem.',
    sections: [
      h('A tree of decisions'),
      p('Picture every decision as a branch. For subsets of [1, 2, 3]: include 1 or not, then include 2 or not, then 3. The leaves are all 8 subsets. Backtracking is a depth-first walk of this tree, keeping the current partial answer in a list called <code>path</code>.'),
      analogy('Walking a maze with chalk: go down a corridor, and at a dead end walk back to the last junction, rub out your chalk mark, and try the next corridor.'),
      widget('recursion', { opts: { mode: 'subsets' }, title: 'Subsets: include or skip each number' }),
      template('backtracking_template.py', py`
        def backtrack(path, choices):
            if IS_COMPLETE(path):
                results.append(path[:])      # save a COPY
                return
            for choice in choices:
                if not VALID(choice):
                    continue                 # prune
                path.append(choice)          # 1. choose
                backtrack(path, NEXT(choices))  # 2. explore
                path.pop()                   # 3. un-choose
      `),
      code(py`
        def subsets(nums):
            res, path = [], []
            def bt(i):
                if i == len(nums):
                    res.append(path[:])
                    return
                path.append(nums[i])   # include nums[i]
                bt(i + 1)
                path.pop()             # undo, then skip nums[i]
                bt(i + 1)
            bt(0)
            return res
      `, { title: 'subsets.py', run: 'subsets([1, 2, 3])', expect: '[[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3], []]' }),
      h('Permutations: choose any unused element'),
      widget('recursion', { opts: { mode: 'perms' }, title: 'Permutations: choose, explore, un-choose' }),
      code(py`
        def permutations(nums):
            res, path, used = [], [], [False] * len(nums)
            def bt():
                if len(path) == len(nums):
                    res.append(path[:])
                    return
                for i, x in enumerate(nums):
                    if used[i]:
                        continue
                    used[i] = True
                    path.append(x)
                    bt()
                    path.pop()
                    used[i] = False
            bt()
            return res
      `, { title: 'permutations.py', run: 'permutations([1, 2, 3])', expect: '[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]' }),
      h('Combinations and pruning'),
      p('For combinations, pass a <code>start</code> index so each number is only considered after the previous one (no duplicates like [1,2] and [2,1]). <b>Prune</b> early: if the running sum already exceeds the target, return immediately instead of exploring a dead subtree.'),
      code(py`
        def combination_sum(candidates, target):
            res, path = [], []
            candidates.sort()
            def bt(start, remaining):
                if remaining == 0:
                    res.append(path[:])
                    return
                for i in range(start, len(candidates)):
                    c = candidates[i]
                    if c > remaining:
                        break                 # prune: sorted, so the rest are bigger
                    path.append(c)
                    bt(i, remaining - c)      # i, not i + 1: reuse allowed
                    path.pop()
            bt(0, target)
            return res
      `, { title: 'combination_sum.py', run: 'combination_sum([2, 3, 6, 7], 7)', expect: '[[2, 2, 3], [7]]' }),
      h('Backtracking on a grid'),
      p('Word Search: from each cell, DFS in four directions matching the next letter. Mark a cell as used while it is on the current path (temporarily overwrite it), and restore it when backtracking.'),
      warn('Bug #1: <code>res.append(path)</code> instead of <code>res.append(path[:])</code>. You save a reference to the one list you keep modifying, so every saved answer ends up empty. Bug #2: forgetting the un-choose step.'),
      key('Complexity is exponential by nature: 2ⁿ subsets, n! permutations. That is fine because the problem asks for all of them; inputs are tiny (n ≤ 10–20). Pruning makes it fast in practice.'),
      quiz([
        { q: 'Why append <code>path[:]</code> rather than <code>path</code>?', opts: ['It is faster', 'path keeps changing; we need a snapshot', 'Style', 'To sort it'], a: 1, why: 'Without a copy, every result points to the same list, which ends up empty.' },
        { q: 'How many subsets does a set of n elements have?', opts: ['n', 'n²', '2ⁿ', 'n!'], a: 2, why: 'Each element is in or out: 2 choices, n times.' },
      ]),
      problems([17, 216, 77, 46, 39, 22, 79, 52], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'dp', group: 'Patterns', title: 'Dynamic programming', short: 'Dynamic programming', level: 'Advanced', minutes: 45,
    blurb: 'Recursion plus memory. A five-step recipe that turns scary problems into a table you fill in.',
    summary: 'Dynamic programming solves a problem by combining answers to smaller versions of it, storing each answer so it is computed only once. With a clear recipe, DP becomes mechanical.',
    sections: [
      h('When is it DP?'),
      p('Two signs: the problem can be split into <strong>smaller subproblems of the same kind</strong>, and those subproblems <strong>repeat</strong> (overlap). Typical wording: "number of ways", "minimum cost", "maximum value", "is it possible", with a choice at each step.'),
      analogy('If someone asks you 1 + 1 + 1 + 1 + 1 you count to 5. If they add "+ 1", you don\'t recount: you remember 5 and answer 6. DP is remembering.'),
      h('The 5-step recipe'),
      steps(['<b>State</b>: define <code>dp[i]</code> in plain words. ("the number of ways to reach stair i")',
        '<b>Recurrence</b>: how does <code>dp[i]</code> follow from smaller states? Look at the <i>last decision</i>. ("the last step was 1 or 2 stairs, so dp[i] = dp[i−1] + dp[i−2]")',
        '<b>Base cases</b>: the smallest states, answered directly.',
        '<b>Order</b>: compute states so every dependency is ready (usually small to large).',
        '<b>Answer</b>: which state holds the final answer? Then optimise space if only a few previous states are needed.']),
      widget('dp', { opts: { mode: 'climb' } }),
      h('Top-down vs bottom-up'),
      p('<b>Top-down</b>: write the recursion, add memoization. <b>Bottom-up</b>: fill a table in order. Same complexity; top-down is often easier to write first, bottom-up avoids recursion limits and allows space optimisation.'),
      code(py`
        from functools import cache

        def climb_top_down(n):
            @cache
            def ways(i):
                if i <= 1:
                    return 1
                return ways(i - 1) + ways(i - 2)
            return ways(n)

        def climb_bottom_up(n):
            prev, cur = 1, 1              # ways(0), ways(1)
            for _ in range(2, n + 1):
                prev, cur = cur, prev + cur
            return cur
      `, { title: 'climbing_stairs.py', run: '(climb_top_down(10), climb_bottom_up(10))', expect: '(89, 89)' }),
      h('1D DP: take it or leave it'),
      p('House Robber: at each house you either rob it (and add the best from two houses back) or skip it (and keep the best from one house back).'),
      widget('dp', { opts: { mode: 'rob' } }),
      code(py`
        def rob(nums):
            two_back = one_back = 0        # best loot up to two houses ago / up to the last house
            for x in nums:
                # skip this house (keep one_back) or rob it (two_back + x)
                two_back, one_back = one_back, max(one_back, two_back + x)
            return one_back
      `, { title: 'house_robber.py', run: 'rob([2, 7, 9, 3, 1])', expect: '12' }),
      sub('Coin change: try every last coin'),
      widget('dp', { opts: { mode: 'coins' } }),
      code(py`
        def coin_change(coins, amount):
            INF = float("inf")
            dp = [0] + [INF] * amount        # dp[a] = fewest coins for amount a
            for a in range(1, amount + 1):
                for c in coins:
                    if c <= a:
                        dp[a] = min(dp[a], dp[a - c] + 1)
            return dp[amount] if dp[amount] != INF else -1
      `, { title: 'coin_change.py', run: 'coin_change([1, 3, 4], 6)', expect: '2' }),
      h('2D DP: grids and two strings'),
      p('When the state needs two numbers (a cell in a grid; a prefix of each of two strings), the table becomes 2D. Each cell depends on neighbours already filled: up, left, or the diagonal.'),
      viz3d('dpgrid', { caption: 'Unique Paths: each tile\'s height is the number of ways to reach it. Switch to LCS to see two strings compared.' }),
      code(py`
        def unique_paths(m, n):
            dp = [[1] * n for _ in range(m)]
            for r in range(1, m):
                for c in range(1, n):
                    dp[r][c] = dp[r - 1][c] + dp[r][c - 1]   # from above + from the left
            return dp[m - 1][n - 1]
      `, { title: 'unique_paths.py', run: 'unique_paths(3, 7)', expect: '28' }),
      widget('dp', { opts: { mode: 'lcs' } }),
      code(py`
        def lcs(a, b):
            m, n = len(a), len(b)
            dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[i][j]: LCS of a[:i], b[:j]
            for i in range(1, m + 1):
                for j in range(1, n + 1):
                    if a[i - 1] == b[j - 1]:
                        dp[i][j] = dp[i - 1][j - 1] + 1
                    else:
                        dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
            return dp[m][n]
      `, { title: 'lcs.py', run: 'lcs("abcde", "ace")', expect: '3' }),
      widget('dp', { opts: { mode: 'edit' } }),
      h("Kadane's algorithm: DP with one variable"),
      p('Maximum subarray: the best subarray ending at <code>i</code> either extends the best one ending at <code>i − 1</code>, or starts fresh at <code>i</code>. Only the previous state is needed.'),
      widget('array', { opts: { demo: 'kadane' } }),
      code(py`
        def max_subarray(nums):
            cur = best = nums[0]
            for x in nums[1:]:
                cur = max(x, cur + x)      # extend or restart
                best = max(best, cur)
            return best
      `, { title: 'kadane.py', run: 'max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4])', expect: '6' }),
      h('State machines'),
      p('Stock problems track which <i>state</i> you are in on each day: holding a share or not. <code>hold = max(hold, cash − price)</code>, <code>cash = max(cash, hold + price − fee)</code>. Extra rules (cooldown, at most k trades) become extra states.'),
      tip('Stuck on a DP? Write the brute-force recursion first, with the parameters that change between calls. Those parameters <i>are</i> your state; add <code>@cache</code> and you have a working top-down DP.'),
      warn('Common DP bugs: a table one cell too small (use n + 1 when dp[i] means "first i items"), filling cells before their dependencies, and wrong base cases.'),
      quiz([
        { q: 'Which question first defines a DP solution?', opts: ['What loop do I need?', 'What does dp[i] mean, in words?', 'Which library?', 'How much memory?'], a: 1, why: 'A precise state definition makes the recurrence and base cases fall out.' },
        { q: 'Memoized recursion vs bottom-up table: complexity?', opts: ['Top-down is always slower', 'Same time complexity', 'Bottom-up is exponential', 'Top-down uses no memory'], a: 1, why: 'Both compute each state once.' },
        { q: 'Greedy picks the largest coin first. For coins [1, 3, 4] and amount 6, greedy uses…', opts: ['2 coins', '3 coins', '6 coins', 'it fails'], a: 1, why: '4 + 1 + 1 = 3 coins, but 3 + 3 = 2 coins is optimal. That is why coin change needs DP.' },
      ]),
      problems([70, 746, 198, 1137, 322, 300, 139, 62, 1143, 72, 53, 714, 5, 221], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'greedy', group: 'Patterns', title: 'Greedy algorithms', short: 'Greedy', level: 'Intermediate', minutes: 15,
    blurb: 'Take the best-looking choice now and never look back, when you can prove it is safe.',
    summary: 'A greedy algorithm makes the locally best choice at each step. It is simple and fast, but only correct when a local choice can never hurt the final answer.',
    sections: [
      h('The idea'),
      p('Greedy algorithms commit to a choice immediately: take the interval that ends first, jump as far as possible, buy whenever tomorrow is higher. No backtracking, no table, usually O(n) or O(n log n) after sorting.'),
      key('Greedy is correct when you can argue: "any optimal answer could be changed to include my greedy choice without getting worse" (an exchange argument). If you can\'t argue that, test small counter-examples or use DP.'),
      h('Jump game: track the furthest reach'),
      code(py`
        def can_jump(nums):
            reach = 0
            for i, step in enumerate(nums):
                if i > reach:              # we can never get to i
                    return False
                reach = max(reach, i + step)
            return True
      `, { title: 'jump_game.py', run: 'can_jump([2, 3, 1, 1, 4])', expect: 'True' }),
      h('Stock profit with unlimited trades'),
      p('Every rise from one day to the next can be captured: summing all positive daily differences equals the best total of any set of trades.'),
      code(py`
        def max_profit(prices):
            profit = 0
            for i in range(1, len(prices)):
                if prices[i] > prices[i - 1]:
                    profit += prices[i] - prices[i - 1]
            return profit
      `, { title: 'stock_ii.py', run: 'max_profit([7, 1, 5, 3, 6, 4])', expect: '7' }),
      h('Two-pass greedy'),
      p('Candy: each child with a higher rating than a neighbour needs more candy. One pass left-to-right fixes left neighbours, one pass right-to-left fixes right neighbours (taking the max). Gas Station: if the total gas covers the total cost a solution exists; start just after the point where the running tank went most negative.'),
      h('When greedy fails'),
      p('Coin change with coins [1, 3, 4] for amount 6: greedy takes 4, then 1, then 1 (3 coins), but 3 + 3 uses 2. The early "best" choice blocked a better combination. When choices interact like this, use dynamic programming.'),
      quiz([
        { q: 'You found a greedy rule. What should you do before coding?', opts: ['Nothing', 'Check it against a few tricky examples or argue why it is safe', 'Switch to DP', 'Sort the input'], a: 1, why: 'Many plausible greedy rules are wrong; small counter-examples catch them fast.' },
      ]),
      problems([55, 45, 134, 135, 122, 605, 334, 452], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'bits', group: 'Patterns', title: 'Bit manipulation & math', short: 'Bits & math', level: 'Intermediate', minutes: 20,
    blurb: 'XOR tricks, counting bits, fast power, digits and square roots.',
    summary: 'Integers are rows of bits. A few bitwise operators and identities solve a whole family of problems in O(1) extra space, and a handful of math tricks cover the rest.',
    sections: [
      h('Binary in one minute'),
      p('13 in binary is <code>1101</code> = 8 + 4 + 0 + 1. Each position is a power of two. <code>bin(13)</code> → <code>"0b1101"</code>; <code>int("1101", 2)</code> → 13.'),
      table(['Operator', 'Meaning', 'Example (12 = 1100, 10 = 1010)'], [
        ['<code>a &amp; b</code>', 'AND: 1 where both are 1', '<code>1000</code> = 8'],
        ['<code>a | b</code>', 'OR: 1 where either is 1', '<code>1110</code> = 14'],
        ['<code>a ^ b</code>', 'XOR: 1 where they differ', '<code>0110</code> = 6'],
        ['<code>a &lt;&lt; k</code>', 'shift left = × 2ᵏ', '<code>12 &lt;&lt; 1</code> = 24'],
        ['<code>a &gt;&gt; k</code>', 'shift right = // 2ᵏ', '<code>12 &gt;&gt; 2</code> = 3'],
        ['<code>~a</code>', 'flip all bits = −a − 1', '<code>~12</code> = −13'],
      ]),
      widget('bits'),
      h('The tricks worth memorising'),
      table(['Trick', 'Why'], [
        ['<code>x &amp; 1</code>', 'odd if 1'],
        ['<code>x ^ x == 0</code>, <code>x ^ 0 == x</code>', 'XOR all numbers: pairs cancel, the single one remains'],
        ['<code>x &amp; (x − 1)</code>', 'clears the lowest set bit; power of two iff result is 0 (and x &gt; 0)'],
        ['<code>(x &gt;&gt; i) &amp; 1</code>', 'reads bit i'],
        ['<code>x | (1 &lt;&lt; i)</code>, <code>x &amp; ~(1 &lt;&lt; i)</code>', 'set / clear bit i'],
      ]),
      code(py`
        def single_number(nums):
            result = 0
            for x in nums:
                result ^= x        # pairs cancel out
            return result
      `, { title: 'single_number.py', run: 'single_number([4, 1, 2, 1, 2])', expect: '4' }),
      code(py`
        def count_bits(n):
            ans = [0] * (n + 1)
            for i in range(1, n + 1):
                ans[i] = ans[i >> 1] + (i & 1)   # bits of i = bits of i//2 + last bit
            return ans
      `, { title: 'counting_bits.py', run: 'count_bits(5)', expect: '[0, 1, 1, 2, 1, 2]' }),
      note('Python integers have unlimited size, so <code>~</code> and negative numbers behave mathematically. Problems that assume 32-bit integers sometimes need a mask: <code>x &amp; 0xFFFFFFFF</code>.'),
      h('Math tricks'),
      sub('Fast power: O(log n) multiplications'),
      code(py`
        def my_pow(x, n):
            if n < 0:
                x, n = 1 / x, -n
            result = 1.0
            while n:
                if n & 1:          # this bit of n is set: include x^(2^k)
                    result *= x
                x *= x             # square for the next bit
                n >>= 1
            return result
      `, { title: 'fast_pow.py', run: 'my_pow(2.0, 10)', expect: '1024.0' }),
      sub('Digits without strings'),
      p('<code>n % 10</code> is the last digit and <code>n // 10</code> drops it. Reversing a number digit by digit checks palindromes without converting to a string.'),
      sub('Square root by binary search'),
      p('The integer square root of x is the largest r with r² ≤ x: binary search r in [0, x].'),
      quiz([
        { q: 'What is <code>5 ^ 5 ^ 7</code>?', opts: ['5', '7', '17', '0'], a: 1, why: '5 ^ 5 = 0 and 0 ^ 7 = 7.' },
        { q: 'Which expression is 0 exactly for powers of two (x > 0)?', opts: ['<code>x &amp; 1</code>', '<code>x | (x − 1)</code>', '<code>x &amp; (x − 1)</code>', '<code>x ^ 1</code>'], a: 2, why: 'A power of two has a single 1 bit; removing the lowest set bit leaves 0.' },
      ]),
      problems([136, 338, 1318, 191, 190, 67, 137, 201, 9, 66, 172, 69, 50, 149], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'sorting', group: 'Patterns', title: 'Sorting & divide and conquer', short: 'Sorting', level: 'Intermediate', minutes: 25,
    blurb: 'Why O(n log n) wins, how merge sort and quicksort work, and sorting with keys in Python.',
    summary: 'Sorting unlocks two pointers, binary search, grouping and greedy algorithms. You will rarely write a sort in an interview, but you must know how they work and what they cost.',
    sections: [
      h('Watch them race'),
      viz3d('sorting', { caption: 'Run bubble sort, then merge sort on the same kind of input, and compare the counters. Try insertion sort on "nearly sorted".' }),
      table(['Algorithm', 'Best', 'Average', 'Worst', 'Extra space', 'Stable'], [
        ['Bubble', cx('O(n)'), cx('O(n²)'), cx('O(n²)'), cx('O(1)'), 'yes'],
        ['Selection', cx('O(n²)'), cx('O(n²)'), cx('O(n²)'), cx('O(1)'), 'no'],
        ['Insertion', cx('O(n)'), cx('O(n²)'), cx('O(n²)'), cx('O(1)'), 'yes'],
        ['Merge', cx('O(n log n)'), cx('O(n log n)'), cx('O(n log n)'), cx('O(n)'), 'yes'],
        ['Quick', cx('O(n log n)'), cx('O(n log n)'), cx('O(n²)'), cx('O(log n)'), 'no'],
        ['Heap', cx('O(n log n)'), cx('O(n log n)'), cx('O(n log n)'), cx('O(1)'), 'no'],
        ['Python <code>sorted</code> (Timsort)', cx('O(n)'), cx('O(n log n)'), cx('O(n log n)'), cx('O(n)'), 'yes'],
      ], { caption: 'Stable means equal items keep their original order, which matters when sorting by one key after another.' }),
      h('Merge sort: divide and conquer'),
      p('Split the list in half, sort each half recursively, then merge the two sorted halves with two pointers. There are log₂ n levels of splitting, and each level does O(n) merging work.'),
      code(py`
        def merge_sort(nums):
            if len(nums) <= 1:
                return nums
            mid = len(nums) // 2
            left = merge_sort(nums[:mid])
            right = merge_sort(nums[mid:])
            out, i, j = [], 0, 0
            while i < len(left) and j < len(right):     # merge two sorted lists
                if left[i] <= right[j]:
                    out.append(left[i]); i += 1
                else:
                    out.append(right[j]); j += 1
            return out + left[i:] + right[j:]
      `, { title: 'merge_sort.py', run: 'merge_sort([5, 2, 9, 1, 5, 6])', expect: '[1, 2, 5, 5, 6, 9]' }),
      h('Quicksort: partition around a pivot'),
      code(py`
        def quicksort(nums, lo=0, hi=None):
            if hi is None:
                hi = len(nums) - 1
            if lo >= hi:
                return nums
            pivot, i = nums[hi], lo
            for j in range(lo, hi):              # move smaller values to the left part
                if nums[j] < pivot:
                    nums[i], nums[j] = nums[j], nums[i]
                    i += 1
            nums[i], nums[hi] = nums[hi], nums[i] # pivot lands in its final place
            quicksort(nums, lo, i - 1)
            quicksort(nums, i + 1, hi)
            return nums
      `, { title: 'quicksort.py', run: 'quicksort([3, 6, 1, 8, 2, 9, 4])', expect: '[1, 2, 3, 4, 6, 8, 9]' }),
      p('The partition step is also the heart of <b>quickselect</b>, which finds the k-th largest element in O(n) on average without fully sorting.'),
      h('Sorting in Python'),
      code(py`
        words = ["kiwi", "fig", "banana", "apple"]
        by_len_then_alpha = sorted(words, key=lambda w: (len(w), w))
        longest_first = sorted(words, key=len, reverse=True)
        (by_len_then_alpha, longest_first[0])
      `, { title: 'sort_keys.py', run: '', expect: null }),
      list(['<code>nums.sort()</code> sorts in place and returns None; <code>sorted(nums)</code> returns a new list.',
        'A tuple key sorts by the first field, then breaks ties with the next: <code>key=lambda x: (-score, name)</code>.',
        'Sorting is O(n log n). If the values are small integers, counting them (bucket / counting sort) can be O(n).']),
      interview('Saying "I\'ll sort first, O(n log n), then a linear sweep" is a perfectly good plan for many problems: intervals, 3Sum, meeting rooms, grouping.'),
      quiz([
        { q: 'Why is merge sort O(n log n)?', opts: ['n levels × log n work', 'log n levels × n work per level', 'It sorts twice', 'It uses a heap'], a: 1, why: 'Halving gives log n levels; merging a level touches all n items.' },
        { q: 'Which sort is fastest on an almost-sorted list?', opts: ['Selection sort', 'Insertion sort', 'Heap sort', 'Quick sort with first-element pivot'], a: 1, why: 'Insertion sort only moves the few out-of-place items: close to O(n).' },
      ]),
      problems([148, 23, 108, 427, 88, 56], 'Practise'),
    ],
  });
})();

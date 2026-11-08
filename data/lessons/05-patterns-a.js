/* Pattern chapters: two pointers, sliding window, prefix sums, binary search,
   monotonic stack, intervals. */
(function () {
  const { h, sub, p, analogy, tip, warn, interview, key, note, code, template, table, steps, list, grid, quiz, problems, widget, viz3d } = DSA.L;
  const py = String.raw;
  const cx = (s) => DSA.cx(s);

  DSA.addLesson({
    id: 'two-pointers', group: 'Patterns', title: 'Two pointers', short: 'Two pointers', level: 'Beginner', minutes: 25,
    blurb: 'Two indexes that move with purpose replace a nested loop: O(n²) becomes O(n).',
    summary: 'Instead of checking every pair with two nested loops, keep two indexes and move one of them each step based on what you see. Each index travels the array at most once.',
    sections: [
      h('Three flavours'),
      grid([
        { title: 'Opposite ends', html: '<code>l</code> starts left, <code>r</code> starts right, they move toward each other. Pair sums on sorted data, palindromes, container with most water.' },
        { title: 'Same direction (reader / writer)', html: 'A fast index reads, a slow index marks where to write. In-place filtering: move zeroes, remove duplicates.' },
        { title: 'Two sequences', html: 'One pointer per list, advance the one that is "behind". Merging sorted arrays, checking a subsequence.' },
      ]),
      h('Opposite ends: why it works'),
      p('In a <b>sorted</b> array, if <code>nums[l] + nums[r]</code> is too small, then <code>nums[l]</code> can\'t be part of any answer: even its biggest possible partner, <code>nums[r]</code>, wasn\'t enough. So <code>l</code> moves right, discarding it for good. If the sum is too big, the same logic discards <code>nums[r]</code>. Every step removes one candidate, so the whole search is O(n).'),
      widget('array', { opts: { demo: 'pairSum' } }),
      template('opposite_ends.py', py`
        l, r = 0, len(nums) - 1
        while l < r:
            if GOOD(nums[l], nums[r]):
                return l, r
            if NEED_BIGGER:
                l += 1
            else:
                r -= 1
      `),
      code(py`
        def two_sum_sorted(nums, target):
            l, r = 0, len(nums) - 1
            while l < r:
                s = nums[l] + nums[r]
                if s == target:
                    return [l + 1, r + 1]    # LeetCode 167 wants 1-based indices
                if s < target:
                    l += 1
                else:
                    r -= 1
            return []
      `, { title: 'two_sum_ii.py', run: 'two_sum_sorted([2, 7, 11, 15], 9)', expect: '[1, 2]' }),
      sub('Container with most water'),
      p('Same skeleton, different rule: the water is limited by the shorter wall, so moving the taller wall can never help. Always move the shorter one.'),
      widget('array', { opts: { demo: 'container' } }),
      h('Same direction: reader and writer'),
      code(py`
        def remove_duplicates(nums):
            """Sorted input. Keep one copy of each value at the front; return how many."""
            write = 1
            for read in range(1, len(nums)):
                if nums[read] != nums[write - 1]:   # a new value
                    nums[write] = nums[read]
                    write += 1
            return write
      `, { title: 'remove_dups.py', run: 'nums = [0, 0, 1, 1, 1, 2, 2, 3]\nk = remove_duplicates(nums)\nnums[:k]', expect: '[0, 1, 2, 3]' }),
      h('Two sequences'),
      code(py`
        def is_subsequence(s, t):
            i = 0
            for ch in t:                 # walk the long string
                if i < len(s) and s[i] == ch:
                    i += 1               # matched the next needed letter
            return i == len(s)
      `, { title: 'is_subsequence.py', run: 'is_subsequence("ace", "abcde")', expect: 'True' }),
      h('3Sum: sort, then fix one and two-pointer the rest'),
      p('For triplets that sum to zero: sort, loop <code>i</code> over each value, and run the opposite-ends search on the part to its right for <code>-nums[i]</code>. Skip repeated values to avoid duplicate triplets. O(n²), down from O(n³).'),
      key('Signals for two pointers: the input is <b>sorted</b> (or can be sorted), you are looking for <b>pairs or triplets</b>, you must work <b>in place</b>, or you are comparing <b>both ends</b> (palindromes).'),
      warn('Opposite-end pointer logic needs sorted data. If the input isn\'t sorted and you need original indices (like the original Two Sum), use a hash map instead.'),
      quiz([
        { q: 'Sorted array, sum too small. Which pointer moves?', opts: ['r moves left', 'l moves right', 'both', 'neither'], a: 1, why: 'Only a bigger left value can increase the sum.' },
        { q: 'Time complexity of the opposite-ends search?', opts: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'], a: 1, why: 'Each step moves a pointer inward; together they take at most n steps.' },
      ]),
      problems([167, 15, 11, 125, 283, 392, 1679, 26, 27, 80, 88], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'sliding-window', group: 'Patterns', title: 'Sliding window', short: 'Sliding window', level: 'Intermediate', minutes: 30,
    blurb: 'Best contiguous subarray or substring: grow on the right, shrink on the left, never restart.',
    summary: 'When a problem asks about contiguous subarrays or substrings ("longest", "shortest", "at most k"), keep a window [l, r] and update its state as the edges move, instead of recomputing every window from scratch.',
    sections: [
      h('The idea'),
      p('Brute force checks every subarray: O(n²) windows, often with O(n) work each. A sliding window reuses work: when the window moves one step, only one element enters and one leaves, so its sum, counts or set can be updated in O(1).'),
      analogy('Reading a long scroll through a frame: you slide the frame along instead of re-reading the scroll from the start for every position.'),
      h('Fixed-size windows'),
      widget('array', { opts: { demo: 'fixedWindow' } }),
      code(py`
        def max_average(nums, k):
            window = sum(nums[:k])
            best = window
            for r in range(k, len(nums)):
                window += nums[r] - nums[r - k]   # one in, one out
                best = max(best, window)
            return best / k
      `, { title: 'max_average.py', run: 'max_average([1, 12, -5, -6, 50, 3], 4)', expect: '12.75' }),
      h('Variable-size windows'),
      p('The window grows by moving <code>r</code> right. Whenever it becomes <b>invalid</b> (a repeated character, a sum that is too large, too many zeros), shrink it by moving <code>l</code> right until it is valid again. Record the best valid window as you go.'),
      widget('array', { opts: { demo: 'longestUnique' } }),
      template('variable_window.py', py`
        l = 0
        state = EMPTY
        best = 0
        for r in range(len(nums)):
            ADD nums[r] TO state
            while WINDOW_IS_INVALID(state):
                REMOVE nums[l] FROM state
                l += 1
            best = max(best, r - l + 1)
      `),
      code(py`
        def longest_unique(s):
            last = {}                    # char -> last index seen
            l = best = 0
            for r, ch in enumerate(s):
                if ch in last and last[ch] >= l:
                    l = last[ch] + 1     # jump past the previous copy
                last[ch] = r
                best = max(best, r - l + 1)
            return best
      `, { title: 'longest_unique.py', run: 'longest_unique("pwwkew")', expect: '3' }),
      sub('Shortest valid window'),
      p('Flip the order: shrink while the window is still <b>valid</b>, recording the length before each shrink.'),
      widget('array', { opts: { demo: 'minWindowSum' } }),
      sub('"At most k" problems'),
      code(py`
        def longest_ones(nums, k):
            """Longest run of 1s if you may flip at most k zeros."""
            l = zeros = best = 0
            for r, x in enumerate(nums):
                zeros += x == 0
                while zeros > k:          # too many flips: shrink
                    zeros -= nums[l] == 0
                    l += 1
                best = max(best, r - l + 1)
            return best
      `, { title: 'max_consecutive_ones_iii.py', run: 'longest_ones([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2)', expect: '6' }),
      key('Use a sliding window when: the answer is a <b>contiguous</b> subarray/substring, and adding an element only ever makes the window "more" (bigger sum, more distinct letters) while removing makes it "less". Both pointers then only move forward: O(n).'),
      warn('A sum window breaks with <b>negative numbers</b>: shrinking might increase the sum. For "subarray sum equals k" with negatives, use prefix sums plus a hash map instead.'),
      quiz([
        { q: 'Total time of a variable window when both l and r only move forward?', opts: ['O(n²)', 'O(n log n)', 'O(n)', 'O(k)'], a: 2, why: 'Each index enters once and leaves once: at most 2n pointer moves.' },
        { q: 'Which problem is NOT a sliding window?', opts: ['Longest substring without repeats', 'Max sum of k consecutive numbers', 'Count subarrays summing to k with negatives', 'Shortest subarray with sum ≥ target (positives)'], a: 2, why: 'With negatives, use prefix sums + hash map.' },
      ]),
      problems([643, 1456, 1004, 1493, 3, 209, 76, 30], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'prefix-sum', group: 'Patterns', title: 'Prefix sums', short: 'Prefix sums', level: 'Beginner', minutes: 15,
    blurb: 'Precompute running totals once; any range sum is then a single subtraction.',
    summary: 'A prefix sum array stores the total of everything before each position. It turns "sum of this range" from a loop into one subtraction, and pairs with a hash map to count subarrays.',
    sections: [
      h('The idea'),
      p('<code>prefix[i]</code> = sum of the first <code>i</code> numbers, with <code>prefix[0] = 0</code>. Then the sum of <code>nums[l..r]</code> is <code>prefix[r + 1] − prefix[l]</code>: everything up to r, minus everything before l.'),
      widget('array', { opts: { demo: 'prefixSum' } }),
      code(py`
        def build_prefix(nums):
            prefix = [0]
            for x in nums:
                prefix.append(prefix[-1] + x)
            return prefix

        def range_sum(prefix, l, r):
            return prefix[r + 1] - prefix[l]
      `, { title: 'prefix.py', run: 'p = build_prefix([3, 1, 4, 1, 5, 9])\nrange_sum(p, 2, 4)', expect: '10' }),
      h('Running totals in disguise'),
      p('Many easy problems are prefix sums with a twist: "highest altitude" is the max prefix; "pivot index" compares the left prefix with the right remainder.'),
      code(py`
        def pivot_index(nums):
            total = sum(nums)
            left = 0
            for i, x in enumerate(nums):
                if left == total - left - x:   # left sum == right sum
                    return i
                left += x
            return -1
      `, { title: 'pivot.py', run: 'pivot_index([1, 7, 3, 6, 5, 6])', expect: '3' }),
      h('Prefix sums + hash map'),
      p('"How many subarrays sum to k?" A subarray ending at <code>i</code> sums to k exactly when some earlier prefix equals <code>prefix − k</code>. Count earlier prefixes in a dict as you go. This works with negative numbers, where sliding windows fail.'),
      widget('array', { opts: { demo: 'subarraySumK' } }),
      code(py`
        def subarray_sum(nums, k):
            seen = {0: 1}           # prefix value -> how many times
            prefix = count = 0
            for x in nums:
                prefix += x
                count += seen.get(prefix - k, 0)
                seen[prefix] = seen.get(prefix, 0) + 1
            return count
      `, { title: 'subarray_sum_k.py', run: 'subarray_sum([1, 2, 3, -2, 2, 1], 3)', expect: '5' }),
      h('Variations'),
      list(['<b>Prefix products</b> (left × right): Product of Array Except Self.',
        '<b>Prefix XOR</b>: XOR of a range is <code>px[r + 1] ^ px[l]</code>.',
        '<b>2D prefix sums</b>: rectangle sums in O(1) after O(rows × cols) setup.',
        '<b>Difference arrays</b>: add v to a range [l, r] by doing <code>diff[l] += v; diff[r + 1] -= v</code>, then prefix-sum once.']),
      quiz([
        { q: 'With prefix[0] = 0, the sum of nums[2..5] is…', opts: ['prefix[5] − prefix[2]', 'prefix[6] − prefix[2]', 'prefix[6] − prefix[1]', 'prefix[5] − prefix[1]'], a: 1, why: 'prefix[6] includes indexes 0..5; subtract prefix[2] (indexes 0..1).' },
        { q: 'Why start the hash map with {0: 1}?', opts: ['Tradition', 'So subarrays starting at index 0 are counted', 'To avoid KeyError', 'It is not needed'], a: 1, why: 'A prefix equal to k itself means the subarray from the start works; that needs an "empty prefix" of 0.' },
      ]),
      problems([1732, 724, 238, 209], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'binary-search', group: 'Patterns', title: 'Binary search', short: 'Binary search', level: 'Intermediate', minutes: 30,
    blurb: 'Halve the search space each step: sorted arrays, boundaries, rotated arrays and "search the answer".',
    summary: 'Binary search works whenever you can look at the middle and know which half the answer is in. That covers far more than "find x in a sorted array": boundaries, peaks, rotated arrays and minimum-feasible answers.',
    sections: [
      h('The classic'),
      widget('array', { opts: { demo: 'binarySearch' } }),
      code(py`
        def binary_search(nums, target):
            lo, hi = 0, len(nums) - 1           # answer is inside [lo, hi]
            while lo <= hi:
                mid = (lo + hi) // 2
                if nums[mid] == target:
                    return mid
                if nums[mid] < target:
                    lo = mid + 1                 # discard left half (and mid)
                else:
                    hi = mid - 1                 # discard right half (and mid)
            return -1
      `, { title: 'binary_search.py', run: 'binary_search([-1, 0, 3, 5, 9, 12], 9)', expect: '4' }),
      p('Each step halves the range, so 1,000,000 elements need at most 20 steps: O(log n).'),
      h('Boundary search: the most useful template'),
      p('Many problems ask for the <b>first</b> position where something becomes true: first value ≥ x, first bad version, smallest speed that works. If the condition is false…false then true…true, binary search finds the first true.'),
      widget('array', { opts: { demo: 'lowerBound' } }),
      template('first_true.py', py`
        lo, hi = LOWEST_POSSIBLE, HIGHEST_POSSIBLE   # answer is in [lo, hi]
        while lo < hi:
            mid = (lo + hi) // 2
            if condition(mid):
                hi = mid          # mid might be the answer: keep it
            else:
                lo = mid + 1      # mid is definitely not the answer
        return lo                 # lo == hi == first true
      `),
      code(py`
        def search_insert(nums, target):
            lo, hi = 0, len(nums)          # the answer can be len(nums)
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] >= target:
                    hi = mid
                else:
                    lo = mid + 1
            return lo
      `, { title: 'search_insert.py', run: 'search_insert([1, 3, 5, 6], 2)', expect: '1' }),
      note('<code>bisect.bisect_left(nums, target)</code> does exactly this. In an interview, say so, but be ready to write it.'),
      h('Binary search on the answer'),
      p('Sometimes you don\'t search an array at all. "What is the smallest eating speed that finishes in h hours?" If speed s works, every faster speed also works: a false…true pattern over possible answers. Binary search that range and test each <code>mid</code> with a helper.'),
      code(py`
        def min_eating_speed(piles, h):
            def hours(speed):
                return sum((p + speed - 1) // speed for p in piles)   # ceil division
            lo, hi = 1, max(piles)
            while lo < hi:
                mid = (lo + hi) // 2
                if hours(mid) <= h:      # fast enough: try slower
                    hi = mid
                else:
                    lo = mid + 1
            return lo
      `, { title: 'koko.py', run: 'min_eating_speed([3, 6, 7, 11], 8)', expect: '4' }),
      h('Rotated arrays and peaks'),
      p('In a rotated sorted array, one half around <code>mid</code> is always sorted. Check whether the target lies in that sorted half; if not, it is in the other. For a peak, compare <code>nums[mid]</code> with <code>nums[mid + 1]</code>: walking uphill always reaches a peak.'),
      code(py`
        def find_min_rotated(nums):
            lo, hi = 0, len(nums) - 1
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] > nums[hi]:     # minimum is right of mid
                    lo = mid + 1
                else:                        # minimum is at mid or left of it
                    hi = mid
            return nums[lo]
      `, { title: 'rotated_min.py', run: 'find_min_rotated([4, 5, 6, 7, 0, 1, 2])', expect: '0' }),
      warn('Infinite loops happen when a branch doesn\'t shrink the range: with <code>while lo &lt; hi</code> and <code>mid = (lo + hi) // 2</code>, use <code>lo = mid + 1</code> (never <code>lo = mid</code>) in the "go right" branch.'),
      interview('State the invariant: "the answer is always inside [lo, hi]" (or [lo, hi) for half-open). It makes off-by-one decisions obvious and impresses interviewers.'),
      quiz([
        { q: 'Max steps for binary search on 1,000,000 sorted items?', opts: ['about 20', 'about 1,000', 'about 500,000', '1,000,000'], a: 0, why: '2²⁰ ≈ 1,000,000.' },
        { q: 'In the first-true template, when condition(mid) is true you set…', opts: ['lo = mid', 'hi = mid', 'hi = mid − 1', 'lo = mid + 1'], a: 1, why: 'mid itself could be the first true, so keep it in range.' },
        { q: 'Binary search on the answer requires…', opts: ['a sorted input array', 'a monotonic yes/no condition over candidate answers', 'a hash map', 'recursion'], a: 1, why: 'If a value works then all larger (or smaller) values work, you can binary search the boundary.' },
      ]),
      problems([35, 374, 162, 875, 2300, 33, 153, 34, 74, 4], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'monotonic-stack', group: 'Patterns', title: 'Monotonic stack', short: 'Monotonic stack', level: 'Intermediate', minutes: 15,
    blurb: '"Next greater element" in O(n): a stack that keeps only the candidates still waiting.',
    summary: 'When you need, for each element, the next (or previous) element that is bigger or smaller, keep a stack of indices in sorted order. Each new element resolves everything it beats.',
    sections: [
      h('The idea'),
      p('Walk left to right. The stack holds indices that have <b>not yet found</b> a bigger element; their values decrease from bottom to top. When a new value arrives that is bigger than the top, the top has found its answer: pop it and record. Keep popping while the new value wins, then push the new index.'),
      analogy('People standing in a line looking right: each person waits for the first taller person to appear. A tall newcomer instantly "answers" every shorter person still waiting in front of the stack.'),
      widget('array', { opts: { demo: 'nextGreater' } }),
      code(py`
        def daily_temperatures(temps):
            answer = [0] * len(temps)
            stack = []                      # indices still waiting for a warmer day
            for i, t in enumerate(temps):
                while stack and temps[stack[-1]] < t:
                    j = stack.pop()
                    answer[j] = i - j       # days waited
                stack.append(i)
            return answer
      `, { title: 'daily_temperatures.py', run: 'daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73])', expect: '[1, 1, 4, 2, 1, 1, 0, 0]' }),
      key('Each index is pushed once and popped at most once, so the loop is O(n) even though there is a <code>while</code> inside the <code>for</code>.'),
      h('Variations'),
      table(['Question', 'Stack keeps', 'Pop when new value is'], [
        ['next greater', 'decreasing values', 'greater than top'],
        ['next smaller', 'increasing values', 'smaller than top'],
        ['previous greater (span)', 'decreasing values', 'greater or equal (merge spans)'],
      ]),
      code(py`
        class StockSpanner:
            """Span = how many consecutive days (ending today) had price <= today's."""
            def __init__(self):
                self.stack = []             # (price, span) pairs, prices decreasing

            def next(self, price):
                span = 1
                while self.stack and self.stack[-1][0] <= price:
                    span += self.stack.pop()[1]   # absorb the smaller days
                self.stack.append((price, span))
                return span
      `, { title: 'stock_spanner.py', run: 's = StockSpanner()\n[s.next(p) for p in [100, 80, 60, 70, 60, 75, 85]]', expect: '[1, 1, 1, 2, 1, 4, 6]' }),
      quiz([
        { q: 'Why is the monotonic stack O(n) despite the inner while loop?', opts: ['The while loop is O(1)', 'Each index is pushed and popped at most once', 'Python optimises it', 'It is O(n²)'], a: 1, why: 'Total pops ≤ total pushes = n.' },
      ]),
      problems([739, 901, 42], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'intervals', group: 'Patterns', title: 'Intervals', short: 'Intervals', level: 'Intermediate', minutes: 15,
    blurb: 'Sort by start to merge, sort by end to schedule. Then one sweep.',
    summary: 'Interval problems (meetings, ranges, balloons) almost always start with sorting. After that, a single left-to-right sweep decides how each interval relates to the previous ones.',
    sections: [
      h('When do two intervals overlap?'),
      p('Closed intervals <code>[a, b]</code> and <code>[c, d]</code> overlap exactly when <code>a ≤ d and c ≤ b</code>. After sorting by start, you only need to compare each interval with the last one you kept: it overlaps if <code>start ≤ last_end</code>.'),
      h('Merge: sort by start'),
      widget('intervals', { opts: { mode: 'merge' } }),
      code(py`
        def merge(intervals):
            intervals.sort(key=lambda iv: iv[0])
            merged = []
            for start, end in intervals:
                if merged and start <= merged[-1][1]:     # overlaps the last block
                    merged[-1][1] = max(merged[-1][1], end)
                else:
                    merged.append([start, end])
            return merged
      `, { title: 'merge_intervals.py', run: 'merge([[1, 3], [2, 6], [8, 10], [15, 18]])', expect: '[[1, 6], [8, 10], [15, 18]]' }),
      h('Fewest removals: sort by end (greedy)'),
      p('To keep as many non-overlapping intervals as possible, always keep the one that <b>ends first</b>: it leaves the most room for everything after it. Count the rest as removed.'),
      widget('intervals', { opts: { mode: 'erase' } }),
      code(py`
        def erase_overlap(intervals):
            intervals.sort(key=lambda iv: iv[1])
            removed, end = 0, float("-inf")
            for s, e in intervals:
                if s >= end:          # fits after the last kept interval
                    end = e
                else:
                    removed += 1
            return removed
      `, { title: 'non_overlapping.py', run: 'erase_overlap([[1, 2], [2, 3], [3, 4], [1, 3]])', expect: '1' }),
      key('Sort by <b>start</b> when you combine intervals (merge, insert). Sort by <b>end</b> when you select a maximum set of non-overlapping ones (meetings, arrows, removals).'),
      tip('For "how many meeting rooms?", sort by start and keep a min-heap of end times: pop rooms that freed up before each new meeting starts; the heap size is the number of rooms in use.'),
      quiz([
        { q: 'After sorting by start, [5, 8] follows a merged block [1, 6]. Overlap?', opts: ['Yes, 5 ≤ 6', 'No'], a: 0, why: 'Start 5 is not after the block\'s end 6.' },
        { q: 'To keep the most non-overlapping meetings, greedily keep the one that…', opts: ['starts first', 'is shortest', 'ends first', 'ends last'], a: 2, why: 'Ending first leaves the most time for the rest (exchange argument).' },
      ]),
      problems([56, 57, 435, 452, 228], 'Practise'),
    ],
  });
})();

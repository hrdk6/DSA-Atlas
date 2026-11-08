from _base import P

GUESS = '''
pick = %d
def guess(num):
    return 0 if num == pick else (-1 if num > pick else 1)
'''

# ------------------------------------------------------------------------ heaps
P(215, 'kth-largest-element-in-an-array', 'Kth Largest Element in an Array', 'Medium', 'heaps', 'Top-k with a min-heap',
  hook='Return the k-th largest element (in sorted order, not the k-th distinct).',
  brute='Sort descending and take index k − 1: O(n log n).',
  insight='Keep a <b>min-heap of size k</b> holding the k largest values seen so far. Its root is the smallest of them, which is exactly the k-th largest overall.',
  steps=['Push each number onto the heap.',
         'If the heap grows past k, pop the smallest.',
         'At the end, the root <code>heap[0]</code> is the answer.'],
  code=r'''
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []
        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)       # drop the smallest; keep the k largest
        return heap[0]
''',
  time='O(n log k)', space='O(k)',
  run='Solution().findKthLargest([3, 2, 1, 5, 6, 4], 2)', expect='5',
  tests=[('Solution().findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)', '4')],
  tip='Mention quickselect (partition like quicksort, recurse into one side) for O(n) average time, and its O(n²) worst case.')

P(2336, 'smallest-number-in-infinite-set', 'Smallest Number in Infinite Set', 'Medium', 'heaps', 'Heap + counter',
  hook='A set starts with every positive integer. Support <code>popSmallest()</code> and <code>addBack(num)</code>.',
  brute='Store a big boolean array and scan for the smallest present number: O(n) per pop.',
  insight='Everything from some point onward has never been touched: track that boundary with <code>next_new</code>. Numbers added back below the boundary go into a min-heap (plus a set to avoid duplicates). The smallest is the heap top if any, otherwise <code>next_new</code>.',
  steps=['<code>popSmallest</code>: if the heap has numbers, pop from it; else return <code>next_new</code> and increment it.',
         '<code>addBack(num)</code>: only if <code>num &lt; next_new</code> and not already in the heap, push it.'],
  code=r'''
class SmallestInfiniteSet:
    def __init__(self):
        self.next_new = 1        # every number >= next_new is still present
        self.added = []          # min-heap of numbers added back below next_new
        self.in_added = set()

    def popSmallest(self) -> int:
        if self.added:
            x = heapq.heappop(self.added)
            self.in_added.remove(x)
            return x
        self.next_new += 1
        return self.next_new - 1

    def addBack(self, num: int) -> None:
        if num < self.next_new and num not in self.in_added:
            heapq.heappush(self.added, num)
            self.in_added.add(num)
''',
  time='O(log n)', space='O(n)', why='Per operation; n = numbers added back.',
  run='''
s = SmallestInfiniteSet()
s.addBack(2)
out = [s.popSmallest(), s.popSmallest(), s.popSmallest()]
s.addBack(1)
out + [s.popSmallest(), s.popSmallest(), s.popSmallest()]
''', expect='[1, 2, 3, 1, 4, 5]')

P(2542, 'maximum-subsequence-score', 'Maximum Subsequence Score', 'Medium', 'heaps', 'Sort + heap',
  hook='Choose k indices. Score = (sum of their <code>nums1</code> values) × (minimum of their <code>nums2</code> values). Maximise it.',
  brute='Try every combination of k indices: C(n, k), enormous.',
  insight='Fix which index provides the <b>minimum</b> multiplier. Sort pairs by <code>nums2</code> descending: when you reach a pair, every earlier pair has a larger-or-equal nums2, so the current one is the minimum. Among all pairs so far, use the k largest <code>nums1</code> values, kept in a min-heap with a running sum.',
  steps=['Sort pairs (a, b) by b descending.',
         'Push each a onto a min-heap and add it to <code>total</code>; if the heap exceeds k, pop the smallest a.',
         'When the heap holds exactly k, score <code>total × b</code> and keep the best.'],
  code=r'''
class Solution:
    def maxScore(self, nums1: List[int], nums2: List[int], k: int) -> int:
        pairs = sorted(zip(nums1, nums2), key=lambda p: -p[1])
        heap, total, best = [], 0, 0
        for a, b in pairs:
            heapq.heappush(heap, a)
            total += a
            if len(heap) > k:
                total -= heapq.heappop(heap)    # keep only the k largest a's
            if len(heap) == k:
                best = max(best, total * b)     # b is the smallest multiplier so far
        return best
''',
  time='O(n log n)', space='O(n)',
  run='Solution().maxScore([1, 3, 3, 2], [2, 1, 3, 4], 3)', expect='12',
  tests=[('Solution().maxScore([4, 2, 3, 1, 1], [7, 5, 10, 9, 6], 1)', '30')],
  tip='"Fix one part of the answer by sorting, then optimise the rest with a heap" is a powerful two-part pattern.')

P(2462, 'total-cost-to-hire-k-workers', 'Total Cost to Hire K Workers', 'Medium', 'heaps', 'Two heaps',
  hook='Hire k workers in k rounds. Each round, hire the cheapest worker among the first <code>candidates</code> and last <code>candidates</code> remaining workers (ties → smaller index). Return the total cost.',
  brute='Each round, scan both candidate groups: O(k · candidates).',
  insight='Keep two min-heaps: one for the front candidates and one for the back. Two pointers <code>i</code> and <code>j</code> track the next unused workers from each end, so each worker enters at most one heap. Each round, take the cheaper heap top (the front wins ties).',
  steps=['Refill the front heap from <code>i</code> and the back heap from <code>j</code> up to <code>candidates</code> each, never crossing <code>i ≤ j</code>.',
         'Pop the cheaper top (front on ties) and add it to the total.',
         'Repeat k times.'],
  code=r'''
class Solution:
    def totalCost(self, costs: List[int], k: int, candidates: int) -> int:
        left, right = [], []
        i, j = 0, len(costs) - 1
        total = 0
        for _ in range(k):
            while len(left) < candidates and i <= j:
                heapq.heappush(left, costs[i])
                i += 1
            while len(right) < candidates and i <= j:
                heapq.heappush(right, costs[j])
                j -= 1
            if not right or (left and left[0] <= right[0]):   # front wins ties
                total += heapq.heappop(left)
            else:
                total += heapq.heappop(right)
        return total
''',
  time='O((k + c) log c)', space='O(c)', why='c = candidates.',
  run='Solution().totalCost([17, 12, 10, 2, 7, 2, 11, 20, 8], 3, 4)', expect='11',
  tests=[('Solution().totalCost([1, 2, 4, 1], 3, 3)', '4')])

P(502, 'ipo', 'IPO', 'Hard', 'heaps', 'Sort + max-heap (greedy)',
  hook='You start with capital <code>w</code> and can finish at most k projects. Each needs some capital to start and adds its profit. Maximise your final capital.',
  brute='Try every order of projects: exponential.',
  insight='Greedy: each time, among the projects you can currently afford, take the most profitable. Sort projects by required capital; as capital grows, push newly affordable projects into a max-heap of profits.',
  steps=['Sort projects by capital required.',
         'Each round, push every newly affordable project\'s profit (negated) onto the heap.',
         'If the heap is empty, stop; otherwise pop the largest profit and add it to <code>w</code>.'],
  code=r'''
class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: List[int], capital: List[int]) -> int:
        projects = sorted(zip(capital, profits))
        heap, i = [], 0                       # max-heap of affordable profits
        for _ in range(k):
            while i < len(projects) and projects[i][0] <= w:
                heapq.heappush(heap, -projects[i][1])
                i += 1
            if not heap:
                break                          # nothing affordable
            w -= heapq.heappop(heap)           # add the best profit
        return w
''',
  time='O(n log n)', space='O(n)',
  run='Solution().findMaximizedCapital(2, 0, [1, 2, 3], [0, 1, 1])', expect='4',
  tests=[('Solution().findMaximizedCapital(3, 0, [1, 2, 3], [0, 1, 2])', '6')],
  tip='Why greedy is safe: profits only increase capital, so taking the biggest affordable profit now never makes a later project unaffordable.')

P(373, 'find-k-pairs-with-smallest-sums', 'Find K Pairs with Smallest Sums', 'Medium', 'heaps', 'K-way merge',
  hook='From two sorted arrays, return the k pairs (one number from each) with the smallest sums.',
  brute='Generate all m × n pairs and sort: O(mn log mn).',
  insight='Think of rows: row i is <code>nums1[i]</code> paired with <code>nums2[0], nums2[1], …</code>, already sorted by sum. Merging sorted rows with a heap (like merging k sorted lists): start with the first pair of each row, pop the smallest, then push the next pair from the same row.',
  steps=['Heap of <code>(nums1[i] + nums2[0], i, 0)</code> for the first k rows.',
         'Pop the smallest; record the pair.',
         'Push <code>(i, j + 1)</code> if it exists.',
         'Stop after k pairs.'],
  code=r'''
class Solution:
    def kSmallestPairs(self, nums1: List[int], nums2: List[int], k: int) -> List[List[int]]:
        heap = [(nums1[i] + nums2[0], i, 0) for i in range(min(k, len(nums1)))]
        heapq.heapify(heap)
        res = []
        while heap and len(res) < k:
            _, i, j = heapq.heappop(heap)
            res.append([nums1[i], nums2[j]])
            if j + 1 < len(nums2):            # next pair in the same "row"
                heapq.heappush(heap, (nums1[i] + nums2[j + 1], i, j + 1))
        return res
''',
  time='O(k log k)', space='O(k)',
  run='Solution().kSmallestPairs([1, 7, 11], [2, 4, 6], 3)', expect='[[1, 2], [1, 4], [1, 6]]',
  tests=[('Solution().kSmallestPairs([1, 1, 2], [1, 2, 3], 2)', '[[1, 1], [1, 1]]')])

P(295, 'find-median-from-data-stream', 'Find Median from Data Stream', 'Hard', 'heaps', 'Two heaps',
  hook='Numbers arrive one at a time. Support <code>addNum</code> and <code>findMedian</code> efficiently.',
  brute='Keep a sorted list and insert each number in place: O(n) per insert.',
  insight='Split the numbers into a smaller half (max-heap) and a larger half (min-heap), with the smaller half equal in size or one bigger. The median is the top of the smaller half, or the average of both tops.',
  steps=['Add: push into the smaller half, then move its largest into the larger half (keeps the order between halves).',
         'If the larger half becomes bigger, move its smallest back.',
         'Median: odd count → top of the smaller half; even → average of the two tops.'],
  code=r'''
class MedianFinder:
    def __init__(self):
        self.small = []      # max-heap via negatives: the smaller half
        self.large = []      # min-heap: the larger half

    def addNum(self, num: int) -> None:
        heapq.heappush(self.small, -num)
        heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self) -> float:
        if len(self.small) > len(self.large):
            return float(-self.small[0])
        return (-self.small[0] + self.large[0]) / 2
''',
  time='O(log n)', space='O(n)', why='Per addNum; findMedian is O(1).',
  run='''
mf = MedianFinder()
mf.addNum(1)
mf.addNum(2)
first = mf.findMedian()
mf.addNum(3)
[first, mf.findMedian()]
''', expect='[1.5, 2.0]')

# ---------------------------------------------------------------- binary search
P(374, 'guess-number-higher-or-lower', 'Guess Number Higher or Lower', 'Easy', 'binary-search', 'Binary search',
  hook='A number is picked from 1 to n. <code>guess(num)</code> tells you −1 (too high), 1 (too low) or 0 (correct). Find it.',
  brute='Guess 1, 2, 3, … : O(n).',
  insight='Each answer rules out half of the remaining range: classic binary search over 1…n.',
  steps=['<code>lo, hi = 1, n</code>.',
         'Guess <code>mid</code>; 0 → done; −1 → <code>hi = mid − 1</code>; 1 → <code>lo = mid + 1</code>.'],
  code=r'''
class Solution:
    def guessNumber(self, n: int) -> int:
        lo, hi = 1, n
        while lo <= hi:
            mid = (lo + hi) // 2
            res = guess(mid)          # LeetCode provides guess()
            if res == 0:
                return mid
            if res < 0:
                hi = mid - 1          # pick is lower
            else:
                lo = mid + 1          # pick is higher
        return -1
''',
  time='O(log n)', space='O(1)',
  run=(GUESS % 6) + 'Solution().guessNumber(10)', expect='6',
  tests=[((GUESS % 1) + 'Solution().guessNumber(1)', '1'), ((GUESS % 1702766719) + 'Solution().guessNumber(2126753390)', '1702766719')])

P(2300, 'successful-pairs-of-spells-and-potions', 'Successful Pairs of Spells and Potions', 'Medium', 'binary-search', 'Sort + binary search',
  hook='A spell and a potion succeed if <code>spell × potion ≥ success</code>. For each spell, count the potions that succeed.',
  brute='Try every potion for every spell: O(n·m).',
  insight='Sort the potions. For a given spell, success is monotonic: once a potion works, every larger potion works. Binary search for the first one that works; everything after it counts.',
  steps=['Sort potions.',
         'For each spell, binary search the first index with <code>spell × potion ≥ success</code>.',
         'The count is <code>m − index</code>.'],
  code=r'''
class Solution:
    def successfulPairs(self, spells: List[int], potions: List[int], success: int) -> List[int]:
        potions.sort()
        m = len(potions)
        res = []
        for s in spells:
            lo, hi = 0, m                     # first potion that works
            while lo < hi:
                mid = (lo + hi) // 2
                if s * potions[mid] >= success:
                    hi = mid
                else:
                    lo = mid + 1
            res.append(m - lo)
        return res
''',
  time='O((n + m) log m)', space='O(1)', why='Not counting the output.',
  run='Solution().successfulPairs([5, 1, 3], [1, 2, 3, 4, 5], 7)', expect='[4, 0, 3]',
  tests=[('Solution().successfulPairs([3, 1, 2], [8, 5, 8], 16)', '[2, 0, 2]')],
  tip='The loop body is <code>bisect.bisect_left</code> on the condition. Writing it by hand shows the first-true template.')

P(162, 'find-peak-element', 'Find Peak Element', 'Medium', 'binary-search', 'Binary search on slopes',
  hook='Find any index whose value is larger than its neighbours (outside the array counts as −∞), in O(log n).',
  brute='Scan for an element larger than both neighbours: O(n).',
  insight='Look at the slope at <code>mid</code>. If <code>nums[mid] &lt; nums[mid + 1]</code>, you are walking uphill to the right, and a peak must exist there (the slope can\'t rise forever, the edge is −∞). Otherwise a peak is at <code>mid</code> or to its left.',
  steps=['<code>lo, hi = 0, n − 1</code>.',
         'While <code>lo &lt; hi</code>: if <code>nums[mid] &lt; nums[mid + 1]</code>, <code>lo = mid + 1</code>; else <code>hi = mid</code>.',
         'Return <code>lo</code>.'],
  code=r'''
class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < nums[mid + 1]:
                lo = mid + 1          # uphill to the right
            else:
                hi = mid              # mid or something left of it is a peak
        return lo
''',
  time='O(log n)', space='O(1)',
  run='Solution().findPeakElement([1, 2, 1, 3, 5, 6, 4])', expect='5',
  tests=[('Solution().findPeakElement([1, 2, 3, 1])', '2'), ('Solution().findPeakElement([1])', '0')],
  tip='Binary search doesn\'t require sorted data, only a rule that tells you which half must contain an answer.')

P(875, 'koko-eating-bananas', 'Koko Eating Bananas', 'Medium', 'binary-search', 'Binary search on the answer',
  hook='Koko eats at speed k bananas per hour, one pile at a time (a pile smaller than k still takes a full hour). Find the minimum k to finish in h hours.',
  brute='Try k = 1, 2, 3, … until it works: O(max(piles) · n).',
  insight='If speed k works, any faster speed works too. That monotonic yes/no lets you binary search k between 1 and the largest pile. Each check costs O(n): total hours = sum of <code>ceil(pile / k)</code>.',
  steps=['<code>lo = 1</code>, <code>hi = max(piles)</code>.',
         'For <code>mid</code>, compute hours with ceiling division <code>(p + mid − 1) // mid</code>.',
         'If hours ≤ h, try slower (<code>hi = mid</code>); else faster (<code>lo = mid + 1</code>).'],
  code=r'''
class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        lo, hi = 1, max(piles)
        while lo < hi:
            mid = (lo + hi) // 2
            hours = sum((p + mid - 1) // mid for p in piles)   # ceil(p / mid)
            if hours <= h:
                hi = mid              # fast enough: try slower
            else:
                lo = mid + 1
        return lo
''',
  time='O(n log m)', space='O(1)', why='m = largest pile.',
  run='Solution().minEatingSpeed([3, 6, 7, 11], 8)', expect='4',
  tests=[('Solution().minEatingSpeed([30, 11, 23, 4, 20], 5)', '30'), ('Solution().minEatingSpeed([30, 11, 23, 4, 20], 6)', '23')],
  tip='Recognise "minimum value such that a check passes" as binary search on the answer. It appears often (ship capacity, split array, etc.).')

P(35, 'search-insert-position', 'Search Insert Position', 'Easy', 'binary-search', 'Lower bound',
  hook='In a sorted array, return the index of <code>target</code>, or where it would be inserted to keep the order.',
  brute='Scan until you meet a value ≥ target: O(n).',
  insight='"First index with value ≥ target" is the lower bound, the most useful binary search template. The answer may be <code>len(nums)</code>, so search the half-open range <code>[0, n)</code>.',
  steps=['<code>lo, hi = 0, n</code>.',
         'If <code>nums[mid] ≥ target</code>, the answer is mid or left: <code>hi = mid</code>.',
         'Else <code>lo = mid + 1</code>. Return <code>lo</code>.'],
  code=r'''
class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] >= target:
                hi = mid
            else:
                lo = mid + 1
        return lo
''',
  time='O(log n)', space='O(1)',
  run='Solution().searchInsert([1, 3, 5, 6], 2)', expect='1',
  tests=[('Solution().searchInsert([1, 3, 5, 6], 5)', '2'), ('Solution().searchInsert([1, 3, 5, 6], 7)', '4')])

P(74, 'search-a-2d-matrix', 'Search a 2D Matrix', 'Medium', 'binary-search', 'Binary search on a flattened index',
  hook='Each row is sorted and starts after the previous row ends. Does the matrix contain <code>target</code>?',
  brute='Scan every cell: O(m·n).',
  insight='Read row by row, the matrix is one sorted list of length m × n. Binary search that virtual list, converting index k to <code>(k // cols, k % cols)</code>.',
  steps=['<code>lo, hi = 0, rows × cols − 1</code>.',
         'Value at <code>mid</code> = <code>matrix[mid // cols][mid % cols]</code>.',
         'Standard binary search.'],
  code=r'''
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        rows, cols = len(matrix), len(matrix[0])
        lo, hi = 0, rows * cols - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            value = matrix[mid // cols][mid % cols]   # flat index -> cell
            if value == target:
                return True
            if value < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False
''',
  time='O(log(m·n))', space='O(1)',
  run='Solution().searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3)', expect='True',
  tests=[('Solution().searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13)', 'False')])

P(33, 'search-in-rotated-sorted-array', 'Search in Rotated Sorted Array', 'Medium', 'binary-search', 'Binary search (rotated)',
  hook='A sorted array of distinct numbers was rotated (e.g. [4,5,6,7,0,1,2]). Find <code>target</code>\'s index in O(log n).',
  brute='Linear scan: O(n).',
  insight='Cut at <code>mid</code>: at least <b>one half is properly sorted</b>. Check which one (compare <code>nums[lo]</code> with <code>nums[mid]</code>). If the target lies inside the sorted half\'s range, search there; otherwise search the other half.',
  steps=['If <code>nums[mid] == target</code>, done.',
         'If <code>nums[lo] ≤ nums[mid]</code>, the left half is sorted: go left if <code>nums[lo] ≤ target &lt; nums[mid]</code>, else right.',
         'Otherwise the right half is sorted: go right if <code>nums[mid] &lt; target ≤ nums[hi]</code>, else left.'],
  code=r'''
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:                 # left half sorted
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:                                     # right half sorted
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1
''',
  time='O(log n)', space='O(1)',
  run='Solution().search([4, 5, 6, 7, 0, 1, 2], 0)', expect='4',
  tests=[('Solution().search([4, 5, 6, 7, 0, 1, 2], 3)', '-1'), ('Solution().search([1], 0)', '-1'), ('Solution().search([3, 1], 1)', '1')])

P(34, 'find-first-and-last-position-of-element-in-sorted-array', 'Find First and Last Position of Element in Sorted Array', 'Medium', 'binary-search', 'Lower bound twice',
  hook='Return the first and last index of <code>target</code> in a sorted array, or [−1, −1], in O(log n).',
  brute='Find one copy, then expand left and right: O(n) when there are many copies.',
  insight='Two lower-bound searches: the first index with value ≥ target is the start; the first index with value ≥ target + 1, minus one, is the end.',
  steps=['<code>start = lower_bound(target)</code>; if out of range or not equal to target → [−1, −1].',
         '<code>end = lower_bound(target + 1) − 1</code>.'],
  code=r'''
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def first_at_least(x):            # first index with nums[i] >= x
            lo, hi = 0, len(nums)
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] >= x:
                    hi = mid
                else:
                    lo = mid + 1
            return lo
        start = first_at_least(target)
        if start == len(nums) or nums[start] != target:
            return [-1, -1]
        return [start, first_at_least(target + 1) - 1]
''',
  time='O(log n)', space='O(1)',
  run='Solution().searchRange([5, 7, 7, 8, 8, 10], 8)', expect='[3, 4]',
  tests=[('Solution().searchRange([5, 7, 7, 8, 8, 10], 6)', '[-1, -1]'), ('Solution().searchRange([], 0)', '[-1, -1]')])

P(153, 'find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array', 'Medium', 'binary-search', 'Binary search (rotated)',
  hook='Find the minimum of a rotated sorted array of distinct numbers in O(log n).',
  brute='<code>min(nums)</code>: O(n).',
  insight='Compare <code>nums[mid]</code> with <code>nums[hi]</code>. If it is bigger, the drop (and the minimum) is to the right of mid. Otherwise the stretch from mid to hi is sorted, so the minimum is at mid or to its left.',
  steps=['<code>lo, hi = 0, n − 1</code>.',
         'If <code>nums[mid] &gt; nums[hi]</code>: <code>lo = mid + 1</code>; else <code>hi = mid</code>.',
         'Return <code>nums[lo]</code>.'],
  code=r'''
class Solution:
    def findMin(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] > nums[hi]:
                lo = mid + 1          # the drop is to the right
            else:
                hi = mid              # mid..hi sorted: min is at mid or left
        return nums[lo]
''',
  time='O(log n)', space='O(1)',
  run='Solution().findMin([4, 5, 6, 7, 0, 1, 2])', expect='0',
  tests=[('Solution().findMin([3, 4, 5, 1, 2])', '1'), ('Solution().findMin([11, 13, 15, 17])', '11')],
  tip='Comparing with <code>nums[hi]</code> (not <code>nums[lo]</code>) avoids a special case for arrays that aren\'t rotated at all.')

P(4, 'median-of-two-sorted-arrays', 'Median of Two Sorted Arrays', 'Hard', 'binary-search', 'Binary search on a partition',
  hook='Return the median of two sorted arrays in O(log(m + n)).',
  brute='Merge them (two pointers) and take the middle: O(m + n). A fine first answer.',
  insight='The median splits all numbers into a left half and a right half. Choose how many come from the shorter array A (<code>i</code>); the rest of the left half comes from B (<code>j = half − i</code>). The split is right when <code>A[i−1] ≤ B[j]</code> and <code>B[j−1] ≤ A[i]</code>. Binary search <code>i</code>.',
  steps=['Make A the shorter array; <code>half = (m + n + 1) // 2</code>.',
         'Binary search <code>i</code> in [0, m]; <code>j = half − i</code>. Use ±∞ for out-of-range neighbours.',
         'If <code>A[i−1] &gt; B[j]</code>, take fewer from A (<code>hi = i − 1</code>); if <code>B[j−1] &gt; A[i]</code>, take more (<code>lo = i + 1</code>).',
         'On a valid split: odd total → max of the left sides; even → average of max-left and min-right.'],
  code=r'''
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        A, B = nums1, nums2
        if len(A) > len(B):
            A, B = B, A                      # search the shorter array
        m, n = len(A), len(B)
        half = (m + n + 1) // 2
        lo, hi = 0, m
        while lo <= hi:
            i = (lo + hi) // 2               # how many from A
            j = half - i                     # the rest from B
            a_left = A[i - 1] if i > 0 else float("-inf")
            a_right = A[i] if i < m else float("inf")
            b_left = B[j - 1] if j > 0 else float("-inf")
            b_right = B[j] if j < n else float("inf")
            if a_left <= b_right and b_left <= a_right:
                if (m + n) % 2:
                    return float(max(a_left, b_left))
                return (max(a_left, b_left) + min(a_right, b_right)) / 2
            if a_left > b_right:
                hi = i - 1                   # too many from A
            else:
                lo = i + 1                   # too few from A
        return 0.0
''',
  time='O(log(min(m, n)))', space='O(1)',
  run='Solution().findMedianSortedArrays([1, 3], [2])', expect='2.0',
  tests=[('Solution().findMedianSortedArrays([1, 2], [3, 4])', '2.5'), ('Solution().findMedianSortedArrays([], [1])', '1.0'), ('Solution().findMedianSortedArrays([0, 0], [0, 0])', '0.0'), ('Solution().findMedianSortedArrays([1, 3, 8, 9, 15], [7, 11, 18, 19, 21, 25])', '11.0')],
  tip='Lead with the O(m + n) merge, then present the partition idea. Many interviewers are satisfied with a clear explanation of the partition even if the code takes a while.')

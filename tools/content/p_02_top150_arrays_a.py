from _base import P

P(88, 'merge-sorted-array', 'Merge Sorted Array', 'Easy', 'two-pointers', 'Two pointers from the back',
  hook='<code>nums1</code> has <code>m</code> sorted numbers followed by <code>n</code> empty slots; <code>nums2</code> has <code>n</code> sorted numbers. Merge everything into <code>nums1</code>, sorted, in place.',
  brute='Copy <code>nums2</code> into the empty slots and call <code>sort()</code>: O((m+n) log(m+n)). It ignores the fact that both halves are already sorted.',
  insight='Fill <code>nums1</code> <b>from the back</b>. The largest remaining number is at the end of one of the two lists; write it into the last free slot. Writing from the back never overwrites a number we still need, because the empty slots are at the back.',
  steps=['Point <code>i</code> at the last real number of nums1 (<code>m − 1</code>), <code>j</code> at the end of nums2, and <code>k</code> at the very end of nums1.',
         'While nums2 still has numbers (<code>j ≥ 0</code>): copy the larger of <code>nums1[i]</code> and <code>nums2[j]</code> into <code>nums1[k]</code>, and move that pointer left.',
         'Move <code>k</code> left after each write.',
         'When nums2 is used up, the rest of nums1 is already in place.'],
  code=r'''
class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        i, j, k = m - 1, n - 1, m + n - 1
        while j >= 0:
            if i >= 0 and nums1[i] > nums2[j]:
                nums1[k] = nums1[i]
                i -= 1
            else:
                nums1[k] = nums2[j]
                j -= 1
            k -= 1
''',
  time='O(m + n)', space='O(1)',
  run='''
nums1 = [1, 2, 3, 0, 0, 0]
Solution().merge(nums1, 3, [2, 5, 6], 3)
nums1
''', expect='[1, 2, 2, 3, 5, 6]',
  tests=[('nums1 = [0]\nSolution().merge(nums1, 0, [1], 1)\nnums1', '[1]'), ('nums1 = [4, 5, 6, 0, 0, 0]\nSolution().merge(nums1, 3, [1, 2, 3], 3)\nnums1', '[1, 2, 3, 4, 5, 6]')],
  tip='Why loop on <code>j ≥ 0</code> only? Once nums2 is empty, nums1\'s remaining numbers are already sorted and already in the right place.')

P(27, 'remove-element', 'Remove Element', 'Easy', 'two-pointers', 'Read / write pointers',
  hook='Remove every copy of <code>val</code> from <code>nums</code> in place, keeping the other numbers at the front. Return how many are left (<code>k</code>).',
  brute='Build a new list without <code>val</code> and copy it back: O(n) time but O(n) extra space.',
  insight='Read every element once and keep a write index <code>k</code>. Each element that is not <code>val</code> gets copied to position <code>k</code>. The front of the list fills up with exactly the elements we keep.',
  steps=['Start <code>k = 0</code>.',
         'For each <code>x</code> in nums: if <code>x != val</code>, write it to <code>nums[k]</code> and increase <code>k</code>.',
         'Return <code>k</code>. Whatever is after index k doesn\'t matter.'],
  code=r'''
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        k = 0
        for x in nums:
            if x != val:
                nums[k] = x
                k += 1
        return k
''',
  time='O(n)', space='O(1)',
  run='''
nums = [0, 1, 2, 2, 3, 0, 4, 2]
k = Solution().removeElement(nums, 2)
(k, nums[:k])
''', expect='(5, [0, 1, 3, 0, 4])',
  tip='Reading with <code>for x in nums</code> while writing into <code>nums</code> is safe here because the write index never gets ahead of the read position.')

P(26, 'remove-duplicates-from-sorted-array', 'Remove Duplicates from Sorted Array', 'Easy', 'two-pointers', 'Read / write pointers',
  hook='The list is sorted. Keep one copy of each value at the front, in order, and return how many unique values there are.',
  brute='Put everything in a set and sort it back: O(n log n) and extra space.',
  insight='Because the list is sorted, duplicates sit next to each other. A value is new exactly when it differs from the <b>last value we kept</b> (<code>nums[k − 1]</code>).',
  steps=['The first element is always kept: <code>k = 1</code>.',
         'For each later index <code>i</code>: if <code>nums[i] != nums[k − 1]</code>, write it to <code>nums[k]</code> and increase <code>k</code>.',
         'Return <code>k</code>.'],
  code=r'''
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        k = 1
        for i in range(1, len(nums)):
            if nums[i] != nums[k - 1]:    # a value we haven't kept yet
                nums[k] = nums[i]
                k += 1
        return k
''',
  time='O(n)', space='O(1)',
  run='''
nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
k = Solution().removeDuplicates(nums)
(k, nums[:k])
''', expect='(5, [0, 1, 2, 3, 4])',
  tip='Comparing with the last <i>kept</i> value (not the previous element) is what makes the next problem, "allow at most two", a one-character change.')

P(80, 'remove-duplicates-from-sorted-array-ii', 'Remove Duplicates from Sorted Array II', 'Medium', 'two-pointers', 'Read / write pointers',
  hook='Same as before, but each value may appear <b>at most twice</b>.',
  brute='Count each value and rebuild the list: works, but uses extra space.',
  insight='A value may be written if fewer than 2 values have been kept so far, or if it differs from the value kept <b>two positions back</b> (<code>nums[k − 2]</code>). If it equals that one, writing it would make three copies.',
  steps=['Start <code>k = 0</code>.',
         'For each <code>x</code>: if <code>k &lt; 2</code> or <code>x != nums[k − 2]</code>, write it at <code>nums[k]</code> and increase <code>k</code>.',
         'Return <code>k</code>.'],
  code=r'''
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        k = 0
        for x in nums:
            if k < 2 or x != nums[k - 2]:   # would not create a third copy
                nums[k] = x
                k += 1
        return k
''',
  time='O(n)', space='O(1)',
  run='''
nums = [1, 1, 1, 2, 2, 3]
k = Solution().removeDuplicates(nums)
(k, nums[:k])
''', expect='(5, [1, 1, 2, 2, 3])',
  tests=[('nums = [0, 0, 1, 1, 1, 1, 2, 3, 3]\nk = Solution().removeDuplicates(nums)\n(k, nums[:k])', '(7, [0, 0, 1, 1, 2, 3, 3])')],
  tip='Generalise out loud: "at most t copies" is <code>k &lt; t or x != nums[k − t]</code>.')

P(169, 'majority-element', 'Majority Element', 'Easy', 'arrays', 'Boyer-Moore voting',
  hook='One value appears more than n/2 times. Find it.',
  brute='Count with a dict (O(n) space), or sort and take the middle element (O(n log n)).',
  insight='<b>Boyer-Moore voting</b>: pair off different values and cancel them. Keep a candidate and a counter: matching values add a vote, others remove one, and at zero the next value becomes the candidate. The majority has more votes than everyone else combined, so it survives.',
  steps=['Start with <code>count = 0</code>.',
         'For each <code>x</code>: if <code>count == 0</code>, make <code>x</code> the candidate.',
         'Add 1 if <code>x</code> equals the candidate, otherwise subtract 1.',
         'Return the candidate.'],
  code=r'''
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        candidate, count = None, 0
        for x in nums:
            if count == 0:
                candidate = x
            count += 1 if x == candidate else -1
        return candidate
''',
  time='O(n)', space='O(1)',
  run='Solution().majorityElement([2, 2, 1, 1, 1, 2, 2])', expect='2',
  tests=[('Solution().majorityElement([3, 2, 3])', '3')],
  tip='Start with the Counter solution, then mention Boyer-Moore as the O(1)-space follow-up. Note it only works because a majority is guaranteed.')

P(189, 'rotate-array', 'Rotate Array', 'Medium', 'arrays', 'Reverse trick',
  hook='Shift every element <code>k</code> steps to the right, wrapping around the end, in place.',
  brute='Rotate by one step, k times: O(n·k). Or copy into a new list at index <code>(i + k) % n</code>: O(n) time but O(n) extra space.',
  insight='Rotating right by k moves the last k elements to the front. Reverse the whole array (they are now at the front, but backwards), then reverse the first k and the remaining n − k to fix each part\'s order.',
  steps=['Reduce <code>k %= n</code> (rotating by n changes nothing).',
         'Reverse the whole array.',
         'Reverse the first <code>k</code> elements.',
         'Reverse the remaining <code>n − k</code> elements.'],
  code=r'''
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        n = len(nums)
        k %= n

        def reverse(l, r):
            while l < r:
                nums[l], nums[r] = nums[r], nums[l]
                l += 1
                r -= 1

        reverse(0, n - 1)
        reverse(0, k - 1)
        reverse(k, n - 1)
''',
  time='O(n)', space='O(1)',
  run='''
nums = [1, 2, 3, 4, 5, 6, 7]
Solution().rotate(nums, 3)
nums
''', expect='[5, 6, 7, 1, 2, 3, 4]',
  tests=[('nums = [-1, -100, 3, 99]\nSolution().rotate(nums, 2)\nnums', '[3, 99, -1, -100]'), ('nums = [1, 2]\nSolution().rotate(nums, 3)\nnums', '[2, 1]')],
  tip='Forgetting <code>k %= n</code> is the classic bug: k can be larger than the array.')

P(121, 'best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'Easy', 'greedy', 'Running minimum',
  hook='Pick one day to buy and a later day to sell. What is the maximum profit? (0 if you can\'t profit.)',
  brute='Try every buy day with every later sell day: O(n²).',
  insight='If you sell today, the best buy day is the <b>cheapest day before today</b>. So scan once, keeping the lowest price so far, and check the profit of selling today.',
  steps=['Keep <code>lowest = infinity</code> and <code>best = 0</code>.',
         'For each price: update <code>lowest = min(lowest, price)</code>.',
         'Update <code>best = max(best, price − lowest)</code>.',
         'Return <code>best</code>.'],
  code=r'''
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        lowest = float("inf")
        best = 0
        for p in prices:
            lowest = min(lowest, p)        # cheapest buy day so far
            best = max(best, p - lowest)   # what if we sell today?
        return best
''',
  time='O(n)', space='O(1)',
  run='Solution().maxProfit([7, 1, 5, 3, 6, 4])', expect='5',
  tests=[('Solution().maxProfit([7, 6, 4, 3, 1])', '0')],
  tip='This is Kadane\'s algorithm in disguise: the best answer ending today depends only on a summary (the minimum) of everything before.')

P(122, 'best-time-to-buy-and-sell-stock-ii', 'Best Time to Buy and Sell Stock II', 'Medium', 'greedy', 'Greedy',
  hook='Now you can buy and sell as many times as you like (holding at most one share). Maximise the total profit.',
  brute='Try every set of trades: exponential. A DP over "holding / not holding" works in O(n), but there is a simpler view.',
  insight='Any profitable trade from day a to day b equals the sum of the daily rises in between. So collect <b>every</b> day-to-day increase: that equals the best possible total.',
  steps=['Start <code>profit = 0</code>.',
         'For each day <code>i</code> from 1: if <code>prices[i] &gt; prices[i − 1]</code>, add the difference.',
         'Return <code>profit</code>.'],
  code=r'''
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        profit = 0
        for i in range(1, len(prices)):
            if prices[i] > prices[i - 1]:
                profit += prices[i] - prices[i - 1]   # take every rise
        return profit
''',
  time='O(n)', space='O(1)',
  run='Solution().maxProfit([7, 1, 5, 3, 6, 4])', expect='7',
  tests=[('Solution().maxProfit([1, 2, 3, 4, 5])', '4'), ('Solution().maxProfit([7, 6, 4, 3, 1])', '0')],
  tip='Explain why it is correct: buying at 1 and selling at 5 earns the same as buying/selling each day 1→2→3→4→5.')

P(55, 'jump-game', 'Jump Game', 'Medium', 'greedy', 'Greedy (furthest reach)',
  hook='Each number says how far you may jump from that index. Starting at index 0, can you reach the last index?',
  brute='DFS or DP over every reachable index: O(n²) in the worst case.',
  insight='Track the <b>furthest index reachable so far</b>. Walk left to right: if you ever stand on an index beyond that reach, you are stuck. Otherwise extend the reach with <code>i + nums[i]</code>.',
  steps=['Set <code>reach = 0</code>.',
         'For each index <code>i</code>: if <code>i &gt; reach</code>, return False (unreachable).',
         'Update <code>reach = max(reach, i + nums[i])</code>.',
         'If the loop finishes, the end is reachable.'],
  code=r'''
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        reach = 0
        for i, step in enumerate(nums):
            if i > reach:
                return False          # can't even get here
            reach = max(reach, i + step)
        return True
''',
  time='O(n)', space='O(1)',
  run='Solution().canJump([2, 3, 1, 1, 4])', expect='True',
  tests=[('Solution().canJump([3, 2, 1, 0, 4])', 'False'), ('Solution().canJump([0])', 'True')],
  tip='Zeros are the only obstacles: the question is whether some earlier index can jump over each zero.')

P(45, 'jump-game-ii', 'Jump Game II', 'Medium', 'greedy', 'Greedy (BFS levels)',
  hook='Same jumping rules, and the end is guaranteed reachable. What is the minimum number of jumps?',
  brute='BFS over indexes, or DP <code>dp[i] = min jumps to reach i</code>: O(n²).',
  insight='Think in layers like BFS: all indexes reachable with 1 jump form a range, with 2 jumps the next range, and so on. While scanning the current range, track how far the <b>next</b> jump could go; when you reach the end of the current range, you must jump.',
  steps=['Keep <code>jumps = 0</code>, <code>end = 0</code> (edge of the current layer), <code>far = 0</code> (edge of the next layer).',
         'For each <code>i</code> before the last index: <code>far = max(far, i + nums[i])</code>.',
         'If <code>i == end</code>, the current layer is finished: take a jump (<code>jumps += 1</code>) and set <code>end = far</code>.',
         'Return <code>jumps</code>.'],
  code=r'''
class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = 0
        end = 0       # furthest index reachable with `jumps` jumps
        far = 0       # furthest index reachable with one more jump
        for i in range(len(nums) - 1):
            far = max(far, i + nums[i])
            if i == end:              # used up this layer: jump
                jumps += 1
                end = far
        return jumps
''',
  time='O(n)', space='O(1)',
  run='Solution().jump([2, 3, 1, 1, 4])', expect='2',
  tests=[('Solution().jump([2, 3, 0, 1, 4])', '2'), ('Solution().jump([0])', '0')],
  tip='The loop stops before the last index: being at the end requires no further jump.')

P(274, 'h-index', 'H-Index', 'Medium', 'sorting', 'Sorting',
  hook='A researcher has index <code>h</code> if <code>h</code> of their papers each have at least <code>h</code> citations. Find the largest such <code>h</code>.',
  brute='Try every h from n down to 0 and count papers with ≥ h citations: O(n²).',
  insight='Sort citations from highest to lowest. The paper at position <code>i</code> (0-based) is the (i+1)-th best. While it has at least <code>i + 1</code> citations, h can be at least <code>i + 1</code>.',
  steps=['Sort citations in descending order.',
         'For each index <code>i</code>: if <code>citations[i] ≥ i + 1</code>, then <code>h = i + 1</code>; otherwise stop.',
         'Return <code>h</code>.'],
  code=r'''
class Solution:
    def hIndex(self, citations: List[int]) -> int:
        citations.sort(reverse=True)
        h = 0
        for i, c in enumerate(citations):
            if c >= i + 1:        # the top i+1 papers all have >= i+1 citations
                h = i + 1
            else:
                break
        return h
''',
  time='O(n log n)', space='O(1)', why='Counting-sort into buckets 0..n makes it O(n).',
  run='Solution().hIndex([3, 0, 6, 1, 5])', expect='3',
  tests=[('Solution().hIndex([1, 3, 1])', '1'), ('Solution().hIndex([0])', '0')],
  tip='Follow-up: citations above n can be capped at n, so a counting array of size n + 1 gives an O(n) solution.')

P(380, 'insert-delete-getrandom-o1', 'Insert Delete GetRandom O(1)', 'Medium', 'hashing', 'Hash map + array',
  hook='Design a set supporting <code>insert</code>, <code>remove</code> and <code>getRandom</code> (each element equally likely), all in average O(1).',
  brute='A set gives O(1) insert/remove but picking a random element needs converting to a list: O(n). A list gives O(1) random choice but O(n) removal.',
  insight='Use <b>both</b>: a list for random access and a dict mapping value → its index in the list. To delete in O(1), move the <b>last</b> element into the deleted slot, update its index, and pop the end.',
  steps=['<code>insert</code>: if present return False; else store its index (the current list length) and append.',
         '<code>remove</code>: find its index <code>i</code>; copy the last value into position <code>i</code> and update that value\'s index; pop the list end and delete the dict entry.',
         '<code>getRandom</code>: <code>random.choice(list)</code>.'],
  code=r'''
class RandomizedSet:
    def __init__(self):
        self.vals = []
        self.pos = {}            # value -> index in vals

    def insert(self, val: int) -> bool:
        if val in self.pos:
            return False
        self.pos[val] = len(self.vals)
        self.vals.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.pos:
            return False
        i = self.pos[val]
        last = self.vals[-1]
        self.vals[i] = last      # move the last value into the hole
        self.pos[last] = i
        self.vals.pop()
        del self.pos[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.vals)
''',
  time='O(1)', space='O(n)', why='Each operation is a constant number of list/dict steps (average case).',
  run='''
rs = RandomizedSet()
[rs.insert(1), rs.remove(2), rs.insert(2), rs.getRandom() in (1, 2), rs.remove(1), rs.insert(2), rs.getRandom()]
''', expect='[True, False, True, True, True, False, 2]',
  tip='The swap-with-last trick is the whole problem. Mention the edge case where the removed value <i>is</i> the last one: the code still works because it writes and then pops the same slot.')

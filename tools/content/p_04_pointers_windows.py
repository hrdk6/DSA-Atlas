from _base import P

# ----------------------------------------------------------------- two pointers
P(283, 'move-zeroes', 'Move Zeroes', 'Easy', 'two-pointers', 'Read / write pointers',
  hook='Move all 0s to the end of the list, keeping the order of the other numbers. In place.',
  brute='Collect the non-zeros into a new list and pad with zeros: O(n) time but O(n) extra space.',
  insight='A write pointer <code>w</code> marks where the next non-zero should go. Scan with <code>r</code>; each non-zero is swapped into position <code>w</code>. Swapping (not just copying) pushes the zeros backwards automatically.',
  steps=['Start <code>w = 0</code>.',
         'For each index <code>r</code>: if <code>nums[r] != 0</code>, swap <code>nums[w]</code> and <code>nums[r]</code>, then <code>w += 1</code>.',
         'When the scan ends, everything from <code>w</code> on is zero.'],
  code=r'''
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        w = 0
        for r in range(len(nums)):
            if nums[r] != 0:
                nums[w], nums[r] = nums[r], nums[w]
                w += 1
''',
  time='O(n)', space='O(1)',
  run='''
nums = [0, 1, 0, 3, 12]
Solution().moveZeroes(nums)
nums
''', expect='[1, 3, 12, 0, 0]',
  tests=[('nums = [0]\nSolution().moveZeroes(nums)\nnums', '[0]'), ('nums = [4, 2, 0, 1]\nSolution().moveZeroes(nums)\nnums', '[4, 2, 1, 0]')],
  tip='Everything left of <code>w</code> is "finished" (non-zeros in order). Saying that invariant out loud makes the code easy to trust.')

P(392, 'is-subsequence', 'Is Subsequence', 'Easy', 'two-pointers', 'Two sequences',
  hook='Can you get <code>s</code> by deleting some characters from <code>t</code> (without reordering)?',
  brute='Try every way of choosing characters from t: exponential.',
  insight='Match greedily: walk through <code>t</code> and advance a pointer in <code>s</code> whenever the current character matches the next one we need. Taking the earliest match never hurts.',
  steps=['Pointer <code>i = 0</code> into <code>s</code>.',
         'For each character of <code>t</code>: if it equals <code>s[i]</code>, move <code>i</code> forward.',
         'Return True if <code>i</code> reached the end of <code>s</code>.'],
  code=r'''
class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        i = 0
        for ch in t:
            if i < len(s) and s[i] == ch:
                i += 1
        return i == len(s)
''',
  time='O(n)', space='O(1)', why='n = len(t).',
  run='Solution().isSubsequence("abc", "ahbgdc")', expect='True',
  tests=[('Solution().isSubsequence("axc", "ahbgdc")', 'False'), ('Solution().isSubsequence("", "abc")', 'True')],
  tip='Follow-up: with many <code>s</code> strings to check against one <code>t</code>, precompute for each letter the sorted list of its positions in t and binary search the next position.')

P(11, 'container-with-most-water', 'Container With Most Water', 'Medium', 'two-pointers', 'Two pointers (opposite ends)',
  hook='Pick two vertical lines. Together with the x-axis they hold water: width × the shorter height. Find the maximum.',
  brute='Try every pair: O(n²).',
  insight='Start with the widest container. To find a bigger one we must gain height, because the width only shrinks. Moving the <b>taller</b> line can never help (the shorter line still limits the height), so always move the <b>shorter</b> line inward.',
  steps=['<code>l = 0</code>, <code>r = n − 1</code>, <code>best = 0</code>.',
         'Area = <code>min(height[l], height[r]) × (r − l)</code>; update <code>best</code>.',
         'Move the pointer at the shorter line inward.',
         'Stop when they meet.'],
  code=r'''
class Solution:
    def maxArea(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        best = 0
        while l < r:
            area = min(height[l], height[r]) * (r - l)
            best = max(best, area)
            if height[l] < height[r]:
                l += 1           # the shorter wall limits us: move it
            else:
                r -= 1
        return best
''',
  time='O(n)', space='O(1)',
  run='Solution().maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])', expect='49',
  tests=[('Solution().maxArea([1, 1])', '1')],
  tip='Interviewers want the "why": every container using the shorter line with any other partner is narrower and no taller, so that line can be discarded.')

P(1679, 'max-number-of-k-sum-pairs', 'Max Number of K-Sum Pairs', 'Medium', 'two-pointers', 'Sort + two pointers',
  hook='In one operation, remove two numbers that add up to <code>k</code>. What is the maximum number of operations?',
  brute='Repeatedly search for any valid pair and remove it: O(n²).',
  insight='Sort, then use opposite-end pointers like Two Sum II. A matching pair is removed (both pointers move); otherwise move the pointer that fixes the sum. Alternative: a hash map counting values waiting for their partner, O(n).',
  steps=['Sort the numbers.',
         'While <code>l &lt; r</code>: if the pair sums to <code>k</code>, count it and move both pointers.',
         'If the sum is too small move <code>l</code> right; if too big move <code>r</code> left.'],
  code=r'''
class Solution:
    def maxOperations(self, nums: List[int], k: int) -> int:
        nums.sort()
        l, r = 0, len(nums) - 1
        ops = 0
        while l < r:
            s = nums[l] + nums[r]
            if s == k:
                ops += 1
                l += 1
                r -= 1
            elif s < k:
                l += 1
            else:
                r -= 1
        return ops
''',
  time='O(n log n)', space='O(1)', why='Sorting dominates; the hash map version is O(n) time, O(n) space.',
  run='Solution().maxOperations([1, 2, 3, 4], 5)', expect='2',
  tests=[('Solution().maxOperations([3, 1, 3, 4, 3], 6)', '1')])

P(125, 'valid-palindrome', 'Valid Palindrome', 'Easy', 'two-pointers', 'Two pointers (opposite ends)',
  hook='Ignoring case and every non-alphanumeric character, does the string read the same forwards and backwards?',
  brute='Build a cleaned lowercase string and compare it with its reverse: O(n) time, O(n) space.',
  insight='Compare from both ends without building a new string: each pointer skips characters that don\'t count, then the two characters are compared case-insensitively.',
  steps=['<code>l</code> at the start, <code>r</code> at the end.',
         'If <code>s[l]</code> isn\'t alphanumeric move <code>l</code>; if <code>s[r]</code> isn\'t, move <code>r</code>.',
         'Otherwise compare lowercased characters: different → False; same → move both.',
         'If the pointers meet, it is a palindrome.'],
  code=r'''
class Solution:
    def isPalindrome(self, s: str) -> bool:
        l, r = 0, len(s) - 1
        while l < r:
            if not s[l].isalnum():
                l += 1
            elif not s[r].isalnum():
                r -= 1
            elif s[l].lower() != s[r].lower():
                return False
            else:
                l += 1
                r -= 1
        return True
''',
  time='O(n)', space='O(1)',
  run='Solution().isPalindrome("A man, a plan, a canal: Panama")', expect='True',
  tests=[('Solution().isPalindrome("race a car")', 'False'), ('Solution().isPalindrome(" ")', 'True')])

P(167, 'two-sum-ii-input-array-is-sorted', 'Two Sum II - Input Array Is Sorted', 'Medium', 'two-pointers', 'Two pointers (opposite ends)',
  hook='The array is sorted. Find two numbers that add up to <code>target</code>, return their 1-based positions, using O(1) extra space.',
  brute='Check all pairs (O(n²)), or the hash map Two Sum (O(n) space, not allowed here).',
  insight='Sorted order gives direction: if the sum is too small, only increasing the left value can help; if too big, only decreasing the right value can help. Each step discards one number for good.',
  steps=['<code>l = 0</code>, <code>r = n − 1</code>.',
         'Sum equals target → return <code>[l + 1, r + 1]</code>.',
         'Sum too small → <code>l += 1</code>; too big → <code>r -= 1</code>.'],
  code=r'''
class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        l, r = 0, len(numbers) - 1
        while l < r:
            s = numbers[l] + numbers[r]
            if s == target:
                return [l + 1, r + 1]
            if s < target:
                l += 1
            else:
                r -= 1
        return []
''',
  time='O(n)', space='O(1)',
  run='Solution().twoSum([2, 7, 11, 15], 9)', expect='[1, 2]',
  tests=[('Solution().twoSum([2, 3, 4], 6)', '[1, 3]'), ('Solution().twoSum([-1, 0], -1)', '[1, 2]')])

P(15, '3sum', '3Sum', 'Medium', 'two-pointers', 'Sort + two pointers',
  hook='Find all unique triplets whose sum is 0.',
  brute='Three nested loops plus a set to remove duplicate triplets: O(n³).',
  insight='Sort. Fix the first number <code>nums[i]</code>, then the problem becomes Two Sum II on the part to its right with target <code>−nums[i]</code>. Skip repeated values (for <code>i</code>, and for <code>l</code> after a match) so each triplet appears once.',
  steps=['Sort the array.',
         'For each <code>i</code>: skip if it equals the previous value; stop if <code>nums[i] &gt; 0</code>.',
         'Run two pointers on <code>i+1 … n−1</code>: move <code>l</code> right when the sum is too small, <code>r</code> left when too big.',
         'On a match, record it, move both pointers, and skip duplicates of <code>nums[l]</code>.'],
  code=r'''
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue                     # same first number as before
            if nums[i] > 0:
                break                        # everything after is positive too
            l, r = i + 1, len(nums) - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    res.append([nums[i], nums[l], nums[r]])
                    l += 1
                    r -= 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1               # skip duplicate second numbers
        return res
''',
  time='O(n²)', space='O(1)', why='Not counting the output or the sort\'s internal memory.',
  run='Solution().threeSum([-1, 0, 1, 2, -1, -4])', expect='[[-1, -1, 2], [-1, 0, 1]]',
  tests=[('Solution().threeSum([0, 0, 0])', '[[0, 0, 0]]'), ('Solution().threeSum([0, 1, 1])', '[]'), ('Solution().threeSum([-2, 0, 0, 2, 2])', '[[-2, 0, 2]]')],
  tip='Duplicate handling is where most bugs are. Explain both skips: one for the fixed number, one for the second number after a match.')

# ---------------------------------------------------------------- sliding window
P(643, 'maximum-average-subarray-i', 'Maximum Average Subarray I', 'Easy', 'sliding-window', 'Fixed sliding window',
  hook='Find the contiguous block of exactly <code>k</code> numbers with the largest average.',
  brute='Sum every window of length k from scratch: O(n·k).',
  insight='Neighbouring windows share k − 1 numbers. Slide: add the new number on the right, subtract the one that left on the left. The largest sum gives the largest average.',
  steps=['Sum the first <code>k</code> numbers.',
         'For each <code>r</code> from <code>k</code>: <code>window += nums[r] − nums[r − k]</code>, track the max.',
         'Return <code>best / k</code>.'],
  code=r'''
class Solution:
    def findMaxAverage(self, nums: List[int], k: int) -> float:
        window = sum(nums[:k])
        best = window
        for r in range(k, len(nums)):
            window += nums[r] - nums[r - k]     # one number in, one out
            best = max(best, window)
        return best / k
''',
  time='O(n)', space='O(1)',
  run='Solution().findMaxAverage([1, 12, -5, -6, 50, 3], 4)', expect='12.75',
  tests=[('Solution().findMaxAverage([5], 1)', '5.0')])

P(1456, 'maximum-number-of-vowels-in-a-substring-of-given-length', 'Maximum Number of Vowels in a Substring of Given Length', 'Medium', 'sliding-window', 'Fixed sliding window',
  hook='Find the most vowels in any substring of length <code>k</code>.',
  brute='Count vowels in every substring of length k: O(n·k).',
  insight='Fixed window again, but the "sum" is a vowel count. When the window slides, add 1 if the entering letter is a vowel and subtract 1 if the leaving letter was.',
  steps=['Count vowels in the first <code>k</code> letters.',
         'Slide: <code>count += (s[r] is vowel) − (s[r − k] is vowel)</code>.',
         'Track the maximum.'],
  code=r'''
class Solution:
    def maxVowels(self, s: str, k: int) -> int:
        vowels = set("aeiou")
        count = sum(1 for ch in s[:k] if ch in vowels)
        best = count
        for r in range(k, len(s)):
            count += (s[r] in vowels) - (s[r - k] in vowels)   # True/False act as 1/0
            best = max(best, count)
        return best
''',
  time='O(n)', space='O(1)',
  run='Solution().maxVowels("abciiidef", 3)', expect='3',
  tests=[('Solution().maxVowels("leetcode", 3)', '2'), ('Solution().maxVowels("aeiou", 2)', '2')],
  tip='Python treats True as 1 and False as 0 in arithmetic, which keeps the update to one line.')

P(1004, 'max-consecutive-ones-iii', 'Max Consecutive Ones III', 'Medium', 'sliding-window', 'Variable sliding window',
  hook='You may flip at most <code>k</code> zeros to ones. What is the longest run of ones you can get?',
  brute='Try every subarray and count its zeros: O(n²).',
  insight='Reword it: find the longest window containing <b>at most k zeros</b>. Grow the window on the right; when it holds too many zeros, shrink from the left until it is valid again.',
  steps=['Track the number of zeros in the window <code>[l, r]</code>.',
         'Add <code>nums[r]</code>; if it is 0, increase the zero count.',
         'While zeros &gt; k: remove <code>nums[l]</code> from the window and move <code>l</code>.',
         'Record <code>r − l + 1</code>.'],
  code=r'''
class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        l = zeros = best = 0
        for r, x in enumerate(nums):
            if x == 0:
                zeros += 1
            while zeros > k:            # too many flips needed: shrink
                if nums[l] == 0:
                    zeros -= 1
                l += 1
            best = max(best, r - l + 1)
        return best
''',
  time='O(n)', space='O(1)',
  run='Solution().longestOnes([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2)', expect='6',
  tests=[('Solution().longestOnes([0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3)', '10')],
  tip='The rewording ("flip k zeros" → "window with at most k zeros") is the real skill. Practise spotting it.')

P(1493, 'longest-subarray-of-1s-after-deleting-one-element', "Longest Subarray of 1's After Deleting One Element", 'Medium', 'sliding-window', 'Variable sliding window',
  hook='Delete exactly one element. What is the longest run of 1s left?',
  brute='Try deleting each element and measure the longest run: O(n²).',
  insight='This is Max Consecutive Ones III with <code>k = 1</code>: the longest window with at most one zero. One element must be deleted, so the answer is the window length minus 1 (even if the window has no zero).',
  steps=['Keep a window with at most one zero.',
         'Shrink from the left when a second zero enters.',
         'Answer = max over windows of <code>r − l</code> (length minus the deleted element).'],
  code=r'''
class Solution:
    def longestSubarray(self, nums: List[int]) -> int:
        l = zeros = best = 0
        for r, x in enumerate(nums):
            if x == 0:
                zeros += 1
            while zeros > 1:
                if nums[l] == 0:
                    zeros -= 1
                l += 1
            best = max(best, r - l)     # window length minus the deleted element
        return best
''',
  time='O(n)', space='O(1)',
  run='Solution().longestSubarray([0, 1, 1, 1, 0, 1, 1, 0, 1])', expect='5',
  tests=[('Solution().longestSubarray([1, 1, 1])', '2'), ('Solution().longestSubarray([1, 1, 0, 1])', '3')])

P(209, 'minimum-size-subarray-sum', 'Minimum Size Subarray Sum', 'Medium', 'sliding-window', 'Variable sliding window',
  hook='All numbers are positive. Find the shortest contiguous subarray whose sum is at least <code>target</code> (0 if none).',
  brute='Check every subarray: O(n²).',
  insight='Positive numbers mean adding grows the sum and removing shrinks it. Grow the window on the right until the sum reaches the target, then shrink from the left as long as it still does, recording each valid length.',
  steps=['Add <code>nums[r]</code> to the running sum.',
         'While the sum ≥ target: record <code>r − l + 1</code>, subtract <code>nums[l]</code>, move <code>l</code>.',
         'Return the best length, or 0.'],
  code=r'''
class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        l = total = 0
        best = float("inf")
        for r, x in enumerate(nums):
            total += x
            while total >= target:          # valid: try to shrink
                best = min(best, r - l + 1)
                total -= nums[l]
                l += 1
        return 0 if best == float("inf") else best
''',
  time='O(n)', space='O(1)',
  run='Solution().minSubArrayLen(7, [2, 3, 1, 2, 4, 3])', expect='2',
  tests=[('Solution().minSubArrayLen(4, [1, 4, 4])', '1'), ('Solution().minSubArrayLen(11, [1, 1, 1, 1, 1, 1, 1, 1])', '0')],
  tip='Mention why positivity matters: with negative numbers, shrinking might raise the sum, and the window logic breaks.')

P(3, 'longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'Medium', 'sliding-window', 'Variable sliding window',
  hook='Find the length of the longest substring with no repeated characters.',
  brute='Check every substring for duplicates: O(n³), or O(n²) with a set.',
  insight='Keep a window with no repeats and remember where each character was last seen. When the new character already appears inside the window, jump the left edge just past its previous position.',
  steps=['Map <code>last[ch]</code> = latest index of each character.',
         'For each <code>r</code>: if <code>s[r]</code> was seen at an index ≥ <code>l</code>, set <code>l = last[s[r]] + 1</code>.',
         'Update <code>last[s[r]] = r</code> and the best length <code>r − l + 1</code>.'],
  code=r'''
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}
        l = best = 0
        for r, ch in enumerate(s):
            if ch in last and last[ch] >= l:
                l = last[ch] + 1          # jump past the earlier copy
            last[ch] = r
            best = max(best, r - l + 1)
        return best
''',
  time='O(n)', space='O(k)', why='k = number of distinct characters.',
  run='Solution().lengthOfLongestSubstring("abcabcbb")', expect='3',
  tests=[('Solution().lengthOfLongestSubstring("bbbbb")', '1'), ('Solution().lengthOfLongestSubstring("pwwkew")', '3'), ('Solution().lengthOfLongestSubstring("")', '0'), ('Solution().lengthOfLongestSubstring("abba")', '2')],
  tip='The check <code>last[ch] &gt;= l</code> matters: an old copy that is already outside the window must not move <code>l</code> backwards ("abba").')

P(30, 'substring-with-concatenation-of-all-words', 'Substring with Concatenation of All Words', 'Hard', 'sliding-window', 'Sliding window over words',
  hook='All words have the same length. Find every index where some ordering of <i>all</i> the words appears back to back in <code>s</code>.',
  brute='At each index, cut the next len(words) chunks and compare their counts with the words: O(n · k · L).',
  insight='Since all words have length L, a valid window is made of whole L-sized chunks. For each of the L possible offsets, slide a window over chunks with a counter: add the chunk on the right; if some word now appears too often, drop chunks from the left; when the window holds exactly k words, record its start.',
  steps=['<code>need</code> = Counter of words; L = word length; k = number of words.',
         'For each offset 0 … L−1, scan chunks <code>s[right:right+L]</code>.',
         'A chunk that is not a word resets the window to just after it.',
         'Otherwise add it; while it is over-used, remove chunks from the left.',
         'When the window has k words, record <code>left</code> and slide one word forward.'],
  code=r'''
class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        L, k = len(words[0]), len(words)
        need = Counter(words)
        res = []
        for offset in range(L):
            left, used, seen = offset, 0, Counter()
            for right in range(offset, len(s) - L + 1, L):
                w = s[right:right + L]
                if w not in need:              # breaks every window containing it
                    seen.clear()
                    used = 0
                    left = right + L
                    continue
                seen[w] += 1
                used += 1
                while seen[w] > need[w]:       # too many copies of w: shrink
                    seen[s[left:left + L]] -= 1
                    used -= 1
                    left += L
                if used == k:                  # exactly the words: a match
                    res.append(left)
                    seen[s[left:left + L]] -= 1
                    used -= 1
                    left += L
        return sorted(res)
''',
  time='O(n · L)', space='O(k)', why='Each offset scans n/L chunks, slicing L characters each.',
  run='Solution().findSubstring("barfoothefoobarman", ["foo", "bar"])', expect='[0, 9]',
  tests=[('Solution().findSubstring("wordgoodgoodgoodbestword", ["word", "good", "best", "word"])', '[]'),
         ('Solution().findSubstring("barfoofoobarthefoobarman", ["bar", "foo", "the"])', '[6, 9, 12]'),
         ('Solution().findSubstring("aaaaaaaa", ["aa", "aa", "aa"])', '[0, 1, 2]')],
  tip='Start with the simple O(n·k·L) version and get it right; then present the per-offset window as the optimisation.')

P(76, 'minimum-window-substring', 'Minimum Window Substring', 'Hard', 'sliding-window', 'Variable sliding window',
  hook='Find the smallest substring of <code>s</code> that contains every character of <code>t</code> (with multiplicity).',
  brute='Check every substring\'s counts: O(n²) windows.',
  insight='Grow the window until it covers all of <code>t</code>, then shrink from the left while it still covers <code>t</code>, recording the smallest. A counter of "still needed" characters plus a single number <code>missing</code> tells you in O(1) whether the window covers <code>t</code>.',
  steps=['<code>need</code> = Counter(t); <code>missing = len(t)</code>.',
         'Add <code>s[r]</code>: if it was still needed (<code>need[ch] &gt; 0</code>), <code>missing -= 1</code>; then <code>need[ch] -= 1</code>.',
         'While <code>missing == 0</code>: record the window, give back <code>s[l]</code> (<code>need[s[l]] += 1</code>), and if it becomes needed again, <code>missing += 1</code>. Move <code>l</code>.',
         'Return the best window or "".'],
  code=r'''
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing = len(t)               # characters of t not yet covered
        l = 0
        best = (float("inf"), 0, 0)
        for r, ch in enumerate(s):
            if need[ch] > 0:
                missing -= 1
            need[ch] -= 1              # negative = extra copies in the window
            while missing == 0:        # covers t: shrink as far as possible
                if r - l + 1 < best[0]:
                    best = (r - l + 1, l, r + 1)
                need[s[l]] += 1
                if need[s[l]] > 0:     # removed a character we needed
                    missing += 1
                l += 1
        return s[best[1]:best[2]] if best[0] != float("inf") else ""
''',
  time='O(m + n)', space='O(k)', why='k = number of distinct characters.',
  run='Solution().minWindow("ADOBECODEBANC", "ABC")', expect="'BANC'",
  tests=[('Solution().minWindow("a", "a")', "'a'"), ('Solution().minWindow("a", "aa")', "''")],
  tip='The single counter <code>missing</code> avoids comparing whole counters on every step. Explain how negative counts mean "extra copies we can afford to drop".')

# ------------------------------------------------------------------ prefix sums
P(1732, 'find-the-highest-altitude', 'Find the Highest Altitude', 'Easy', 'prefix-sum', 'Prefix sum',
  hook='A biker starts at altitude 0 and <code>gain[i]</code> is the change between points. What is the highest altitude reached?',
  brute='Build the full list of altitudes, then take the max: also O(n), just more memory.',
  insight='Each altitude is a running (prefix) sum of the gains. Keep the running sum and its maximum as you go; start the maximum at 0 for the starting point.',
  steps=['<code>altitude = best = 0</code>.',
         'For each gain: <code>altitude += gain</code>; <code>best = max(best, altitude)</code>.',
         'Return <code>best</code>.'],
  code=r'''
class Solution:
    def largestAltitude(self, gain: List[int]) -> int:
        altitude = best = 0
        for g in gain:
            altitude += g
            best = max(best, altitude)
        return best
''',
  time='O(n)', space='O(1)',
  run='Solution().largestAltitude([-5, 1, 5, 0, -7])', expect='1',
  tests=[('Solution().largestAltitude([-4, -3, -2, -1, 4, 3, 2])', '0')])

P(724, 'find-pivot-index', 'Find Pivot Index', 'Easy', 'prefix-sum', 'Prefix sum',
  hook='Find the leftmost index where the sum of numbers to its left equals the sum of numbers to its right.',
  brute='For each index, sum both sides separately: O(n²).',
  insight='Know the total once. Walking left to right with a running left sum, the right sum is simply <code>total − left − nums[i]</code>.',
  steps=['<code>total = sum(nums)</code>, <code>left = 0</code>.',
         'For each <code>i</code>: if <code>left == total − left − nums[i]</code>, return <code>i</code>.',
         'Add <code>nums[i]</code> to <code>left</code>.',
         'Return -1 if no pivot.'],
  code=r'''
class Solution:
    def pivotIndex(self, nums: List[int]) -> int:
        total = sum(nums)
        left = 0
        for i, x in enumerate(nums):
            if left == total - left - x:    # right side = total - left - x
                return i
            left += x
        return -1
''',
  time='O(n)', space='O(1)',
  run='Solution().pivotIndex([1, 7, 3, 6, 5, 6])', expect='3',
  tests=[('Solution().pivotIndex([1, 2, 3])', '-1'), ('Solution().pivotIndex([2, 1, -1])', '0')])

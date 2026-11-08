from _base import P

# --------------------------------------------------------------------- hashing
P(2215, 'find-the-difference-of-two-arrays', 'Find the Difference of Two Arrays', 'Easy', 'hashing', 'Hash sets',
  hook='Return two lists: the distinct numbers only in <code>nums1</code>, and the distinct numbers only in <code>nums2</code>.',
  brute='For each number, scan the other list: O(n·m).',
  insight='Convert both to sets. Set difference <code>a − b</code> keeps elements of a not in b, with O(1) membership checks.',
  steps=['<code>s1 = set(nums1)</code>, <code>s2 = set(nums2)</code>.',
         'Return <code>[s1 − s2, s2 − s1]</code> as lists (sorted here so the output is predictable).'],
  code=r'''
class Solution:
    def findDifference(self, nums1: List[int], nums2: List[int]) -> List[List[int]]:
        s1, s2 = set(nums1), set(nums2)
        return [sorted(s1 - s2), sorted(s2 - s1)]
''',
  time='O(n + m)', space='O(n + m)', why='Sorting the (usually small) outputs is optional; LeetCode accepts any order.',
  run='Solution().findDifference([1, 2, 3], [2, 4, 6])', expect='[[1, 3], [4, 6]]',
  tests=[('Solution().findDifference([1, 2, 3, 3], [1, 1, 2, 2])', '[[3], []]')])

P(1207, 'unique-number-of-occurrences', 'Unique Number of Occurrences', 'Easy', 'hashing', 'Counting',
  hook='Is the number of times each value appears unique (no two values appear the same number of times)?',
  brute='Count each value with a loop, then compare every pair of counts: O(n²).',
  insight='Count with a <code>Counter</code>, then check that the counts have no duplicates: the list of counts and the set of counts have the same length.',
  steps=['<code>counts = Counter(arr).values()</code>.',
         'Return <code>len(counts) == len(set(counts))</code>.'],
  code=r'''
class Solution:
    def uniqueOccurrences(self, arr: List[int]) -> bool:
        counts = list(Counter(arr).values())
        return len(counts) == len(set(counts))
''',
  time='O(n)', space='O(n)',
  run='Solution().uniqueOccurrences([1, 2, 2, 1, 1, 3])', expect='True',
  tests=[('Solution().uniqueOccurrences([1, 2])', 'False')])

P(1657, 'determine-if-two-strings-are-close', 'Determine if Two Strings Are Close', 'Medium', 'hashing', 'Counting',
  hook='Two operations are allowed: swap any two characters, or turn every <i>a</i> into <i>b</i> and every <i>b</i> into <i>a</i> at once. Can <code>word1</code> become <code>word2</code>?',
  brute='Search over sequences of operations: hopeless.',
  insight='Think about what the operations can\'t change. Swaps mean order doesn\'t matter. Transforming letters swaps the counts of two letters that already exist, so (1) the <b>set of letters</b> must match and (2) the <b>multiset of counts</b> must match.',
  steps=['Count both words.',
         'Check the two sets of letters are equal.',
         'Check the sorted lists of counts are equal.'],
  code=r'''
class Solution:
    def closeStrings(self, word1: str, word2: str) -> bool:
        c1, c2 = Counter(word1), Counter(word2)
        same_letters = set(c1) == set(c2)
        same_counts = sorted(c1.values()) == sorted(c2.values())
        return same_letters and same_counts
''',
  time='O(n)', space='O(1)', why='At most 26 letters, so sorting the counts is constant work.',
  run='Solution().closeStrings("cabbba", "abbccc")', expect='True',
  tests=[('Solution().closeStrings("a", "aa")', 'False'), ('Solution().closeStrings("abc", "bca")', 'True')],
  tip='"What stays the same no matter which operations you apply?" (invariants) is a powerful question for any "can A become B" problem.')

P(2352, 'equal-row-and-column-pairs', 'Equal Row and Column Pairs', 'Medium', 'hashing', 'Hashing rows',
  hook='Count pairs (row, column) of an n×n grid where the row and the column contain the same numbers in the same order.',
  brute='Compare every row with every column element by element: O(n³).',
  insight='Turn each row into a tuple (hashable) and count them in a Counter. Then each column, also as a tuple, can be looked up in O(n) for hashing instead of comparing against every row.',
  steps=['<code>rows = Counter(tuple(r) for r in grid)</code>.',
         'For each column (<code>zip(*grid)</code> yields columns as tuples), add <code>rows[col]</code>.'],
  code=r'''
class Solution:
    def equalPairs(self, grid: List[List[int]]) -> int:
        rows = Counter(tuple(r) for r in grid)
        count = 0
        for col in zip(*grid):           # each column as a tuple
            count += rows[col]
        return count
''',
  time='O(n²)', space='O(n²)',
  run='Solution().equalPairs([[3, 2, 1], [1, 7, 6], [2, 7, 7]])', expect='1',
  tests=[('Solution().equalPairs([[3, 1, 2, 2], [1, 4, 4, 5], [2, 4, 2, 2], [2, 4, 2, 2]])', '3')],
  tip='<code>zip(*grid)</code> transposes a grid. Lists can\'t be dict keys, tuples can.')

P(383, 'ransom-note', 'Ransom Note', 'Easy', 'hashing', 'Counting',
  hook='Can you build <code>ransomNote</code> using letters cut from <code>magazine</code>, each letter used at most once?',
  brute='For each note letter, search and remove it from the magazine: O(n·m).',
  insight='Count the magazine\'s letters once, then spend them as you read the note. Running out of a letter means it is impossible.',
  steps=['<code>have = Counter(magazine)</code>.',
         'For each note letter: if <code>have[ch] == 0</code>, return False; otherwise decrement.',
         'Return True.'],
  code=r'''
class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        have = Counter(magazine)
        for ch in ransomNote:
            if have[ch] == 0:
                return False
            have[ch] -= 1
        return True
''',
  time='O(n + m)', space='O(1)', why='At most 26 different letters.',
  run='Solution().canConstruct("aa", "aab")', expect='True',
  tests=[('Solution().canConstruct("aa", "ab")', 'False')])

P(205, 'isomorphic-strings', 'Isomorphic Strings', 'Easy', 'hashing', 'Two-way mapping',
  hook='Can the characters of <code>s</code> be replaced (consistently, one-to-one) to get <code>t</code>?',
  brute='Try all letter mappings: impossible.',
  insight='Walk both strings together and record the mapping in <b>both directions</b>. A conflict in either map (a letter mapped to two letters, or two letters mapped to the same one) means no.',
  steps=['Maps <code>s_to_t</code> and <code>t_to_s</code>.',
         'For each pair <code>(a, b)</code>: if <code>a</code> already maps to something other than <code>b</code>, or <code>b</code> already maps back to something other than <code>a</code>, return False.',
         'Otherwise record both directions.'],
  code=r'''
class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        s_to_t, t_to_s = {}, {}
        for a, b in zip(s, t):
            if s_to_t.get(a, b) != b or t_to_s.get(b, a) != a:
                return False
            s_to_t[a] = b
            t_to_s[b] = a
        return True
''',
  time='O(n)', space='O(1)', why='At most the character set size.',
  run='Solution().isIsomorphic("paper", "title")', expect='True',
  tests=[('Solution().isIsomorphic("foo", "bar")', 'False'), ('Solution().isIsomorphic("badc", "baba")', 'False'), ('Solution().isIsomorphic("egg", "add")', 'True')],
  tip='Why two maps? "badc" → "baba" passes a one-way check (b→b, a→a, d→b, c→a) but d and b both map to b.')

P(290, 'word-pattern', 'Word Pattern', 'Easy', 'hashing', 'Two-way mapping',
  hook='Does the sentence follow the pattern? Each letter must map to exactly one word, and each word to exactly one letter.',
  brute='Same as before: guessing mappings is pointless.',
  insight='Isomorphic Strings again, with words instead of characters on one side. Check the lengths first.',
  steps=['Split the sentence into words; lengths must match the pattern.',
         'Keep letter→word and word→letter maps; any conflict returns False.'],
  code=r'''
class Solution:
    def wordPattern(self, pattern: str, s: str) -> bool:
        words = s.split()
        if len(words) != len(pattern):
            return False
        p_to_w, w_to_p = {}, {}
        for p, w in zip(pattern, words):
            if p_to_w.get(p, w) != w or w_to_p.get(w, p) != p:
                return False
            p_to_w[p] = w
            w_to_p[w] = p
        return True
''',
  time='O(n)', space='O(n)',
  run='Solution().wordPattern("abba", "dog cat cat dog")', expect='True',
  tests=[('Solution().wordPattern("abba", "dog cat cat fish")', 'False'), ('Solution().wordPattern("aaaa", "dog cat cat dog")', 'False'), ('Solution().wordPattern("abba", "dog dog dog dog")', 'False')])

P(242, 'valid-anagram', 'Valid Anagram', 'Easy', 'hashing', 'Counting',
  hook='Are <code>s</code> and <code>t</code> anagrams (the same letters with the same counts)?',
  brute='Sort both strings and compare: O(n log n).',
  insight='Anagrams have identical letter counts. Count with a 26-slot array (or a Counter): +1 for letters of <code>s</code>, −1 for letters of <code>t</code>. All zeros means anagram.',
  steps=['If lengths differ, return False.',
         'Add 1 for each letter of s and subtract 1 for each letter of t.',
         'Return True if every count is zero.'],
  code=r'''
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = [0] * 26
        for a, b in zip(s, t):
            count[ord(a) - ord("a")] += 1
            count[ord(b) - ord("a")] -= 1
        return all(c == 0 for c in count)
''',
  time='O(n)', space='O(1)',
  run='Solution().isAnagram("anagram", "nagaram")', expect='True',
  tests=[('Solution().isAnagram("rat", "car")', 'False')],
  tip='One-liner for the interview: <code>Counter(s) == Counter(t)</code>. Mention it, then show the array version if asked about Unicode or constant space.')

P(49, 'group-anagrams', 'Group Anagrams', 'Medium', 'hashing', 'Group by key',
  hook='Group words that are anagrams of each other.',
  brute='Compare every pair of words for being anagrams: O(n² · k).',
  insight='Give every word a <b>signature</b> that is identical for all its anagrams: its letters sorted ("eat" → "aet"). Group words in a dict keyed by signature.',
  steps=['<code>groups = defaultdict(list)</code>.',
         'For each word, key = <code>"".join(sorted(word))</code>; append the word to <code>groups[key]</code>.',
         'Return the groups\' lists.'],
  code=r'''
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for word in strs:
            key = "".join(sorted(word))     # anagrams share this key
            groups[key].append(word)
        return list(groups.values())
''',
  time='O(n · k log k)', space='O(n · k)', why='n words of length up to k; a 26-count tuple key makes it O(n · k).',
  run='Solution().groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])', expect="[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]",
  tests=[('Solution().groupAnagrams([""])', "[['']]")],
  tip='Faster key: a tuple of 26 letter counts, O(k) to build instead of O(k log k).')

P(1, 'two-sum', 'Two Sum', 'Easy', 'hashing', 'Hash map (complement)',
  hook='Return the indices of the two numbers that add up to <code>target</code>. Exactly one answer exists.',
  brute='Check every pair: O(n²).',
  insight='For each number <code>x</code>, the partner it needs is <code>target − x</code>. Keep a dict of numbers seen so far → their index; checking for the partner is then O(1).',
  steps=['<code>seen = {}</code>.',
         'For each index <code>i</code>, value <code>x</code>: <code>need = target − x</code>.',
         'If <code>need</code> is in <code>seen</code>, return <code>[seen[need], i]</code>.',
         'Otherwise store <code>seen[x] = i</code>.'],
  code=r'''
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}                       # value -> index
        for i, x in enumerate(nums):
            need = target - x
            if need in seen:
                return [seen[need], i]
            seen[x] = i
        return []
''',
  time='O(n)', space='O(n)',
  run='Solution().twoSum([2, 7, 11, 15], 9)', expect='[0, 1]',
  tests=[('Solution().twoSum([3, 2, 4], 6)', '[1, 2]'), ('Solution().twoSum([3, 3], 6)', '[0, 1]')],
  tip='Check <i>before</i> storing so a number never pairs with itself. This is the most famous interview question; be able to explain the brute force → hash map step in your sleep.')

P(202, 'happy-number', 'Happy Number', 'Easy', 'hashing', 'Cycle detection',
  hook='Repeatedly replace a number by the sum of the squares of its digits. It is "happy" if this reaches 1. Otherwise it loops forever.',
  brute='Iterate many times and hope: no way to know when to stop.',
  insight='The sequence either reaches 1 or enters a <b>cycle</b>. Remember every number seen in a set: seeing one again means a cycle, so not happy. (Floyd\'s fast/slow pointers also works with O(1) space.)',
  steps=['Helper: sum of squares of digits using <code>divmod(x, 10)</code>.',
         'Loop while <code>n != 1</code> and <code>n</code> not seen: add it to the set and move to the next number.',
         'Return <code>n == 1</code>.'],
  code=r'''
class Solution:
    def isHappy(self, n: int) -> bool:
        def next_num(x):
            total = 0
            while x:
                x, d = divmod(x, 10)
                total += d * d
            return total

        seen = set()
        while n != 1 and n not in seen:
            seen.add(n)
            n = next_num(n)
        return n == 1
''',
  time='O(log n)', space='O(log n)', why='Numbers shrink quickly to at most three digits, so only a few steps happen.',
  run='Solution().isHappy(19)', expect='True',
  tests=[('Solution().isHappy(2)', 'False')],
  tip='Cycle detection on a sequence is the same idea as Linked List Cycle: a set, or fast and slow pointers.')

P(219, 'contains-duplicate-ii', 'Contains Duplicate II', 'Easy', 'hashing', 'Last-seen index',
  hook='Are there two equal numbers at most <code>k</code> positions apart?',
  brute='Compare each number with the next k numbers: O(n·k).',
  insight='For each value, only its <b>most recent</b> position matters. Store <code>last[x] = i</code>; when <code>x</code> appears again, check the distance.',
  steps=['<code>last = {}</code>.',
         'For each <code>i, x</code>: if <code>x</code> is in <code>last</code> and <code>i − last[x] ≤ k</code>, return True.',
         'Set <code>last[x] = i</code>.'],
  code=r'''
class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        last = {}
        for i, x in enumerate(nums):
            if x in last and i - last[x] <= k:
                return True
            last[x] = i
        return False
''',
  time='O(n)', space='O(n)',
  run='Solution().containsNearbyDuplicate([1, 2, 3, 1], 3)', expect='True',
  tests=[('Solution().containsNearbyDuplicate([1, 0, 1, 1], 1)', 'True'), ('Solution().containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2)', 'False')],
  tip='A sliding-window set of the last k values is another O(n) answer with O(k) space.')

P(128, 'longest-consecutive-sequence', 'Longest Consecutive Sequence', 'Medium', 'hashing', 'Hash set',
  hook='Find the length of the longest run of consecutive integers (like 1, 2, 3, 4) in an unsorted list, in O(n).',
  brute='Sort and scan: O(n log n), not allowed.',
  insight='Put everything in a set. A number <code>x</code> <b>starts</b> a run only if <code>x − 1</code> is not in the set. From each start, count upward. Every number is counted inside exactly one run, so the total work is O(n).',
  steps=['<code>s = set(nums)</code>.',
         'For each <code>x</code> in s with <code>x − 1</code> not in s: walk <code>y = x, x+1, …</code> while in the set.',
         'Track the longest run.'],
  code=r'''
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        s = set(nums)
        best = 0
        for x in s:
            if x - 1 not in s:          # x is the start of a run
                y = x
                while y + 1 in s:
                    y += 1
                best = max(best, y - x + 1)
        return best
''',
  time='O(n)', space='O(n)',
  run='Solution().longestConsecutive([100, 4, 200, 1, 3, 2])', expect='4',
  tests=[('Solution().longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])', '9'), ('Solution().longestConsecutive([])', '0')],
  tip='Without the "only start from run starts" check, the nested while makes it O(n²). That check is the whole trick.')

# -------------------------------------------------------------------- intervals
P(228, 'summary-ranges', 'Summary Ranges', 'Easy', 'intervals', 'Grouping runs',
  hook='Given sorted unique numbers, describe them as ranges: <code>[0,1,2,4,5,7]</code> → <code>["0->2","4->5","7"]</code>.',
  brute='Already linear: the job is careful index handling.',
  insight='Start a range at <code>i</code>, extend <code>j</code> while the next number is exactly one more, then emit "a->b" (or just "a" when the range has one number).',
  steps=['Start <code>i = 0</code>.',
         'Extend <code>j</code> while <code>nums[j + 1] == nums[j] + 1</code>.',
         'Emit the range for <code>nums[i]…nums[j]</code>; continue from <code>j + 1</code>.'],
  code=r'''
class Solution:
    def summaryRanges(self, nums: List[int]) -> List[str]:
        res = []
        i = 0
        while i < len(nums):
            j = i
            while j + 1 < len(nums) and nums[j + 1] == nums[j] + 1:
                j += 1
            res.append(str(nums[i]) if i == j else f"{nums[i]}->{nums[j]}")
            i = j + 1
        return res
''',
  time='O(n)', space='O(1)', why='Besides the output.',
  run='Solution().summaryRanges([0, 1, 2, 4, 5, 7])', expect="['0->2', '4->5', '7']",
  tests=[('Solution().summaryRanges([0, 2, 3, 4, 6, 8, 9])', "['0', '2->4', '6', '8->9']"), ('Solution().summaryRanges([])', '[]')])

P(56, 'merge-intervals', 'Merge Intervals', 'Medium', 'intervals', 'Sort by start',
  hook='Merge all overlapping intervals.',
  brute='Repeatedly look for any overlapping pair and merge it: O(n²) or worse.',
  insight='After sorting by start, an interval overlaps the current merged block exactly when its start ≤ the block\'s end. Then extend the end; otherwise start a new block.',
  steps=['Sort intervals by start.',
         'For each interval: if it overlaps the last merged block, extend that block\'s end to the max of both ends.',
         'Otherwise append it as a new block.'],
  code=r'''
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda iv: iv[0])
        merged = []
        for start, end in intervals:
            if merged and start <= merged[-1][1]:     # overlaps the last block
                merged[-1][1] = max(merged[-1][1], end)
            else:
                merged.append([start, end])
        return merged
''',
  time='O(n log n)', space='O(n)',
  run='Solution().merge([[1, 3], [2, 6], [8, 10], [15, 18]])', expect='[[1, 6], [8, 10], [15, 18]]',
  tests=[('Solution().merge([[1, 4], [4, 5]])', '[[1, 5]]'), ('Solution().merge([[1, 4], [2, 3]])', '[[1, 4]]')],
  tip='The <code>max</code> matters: [1,4] then [2,3] must stay [1,4], not shrink to [1,3].')

P(57, 'insert-interval', 'Insert Interval', 'Medium', 'intervals', 'Sweep',
  hook='The intervals are sorted and don\'t overlap. Insert a new interval and merge where needed.',
  brute='Append it and run Merge Intervals: O(n log n). The input is already sorted, so we can do O(n).',
  insight='Three phases in one sweep: intervals that end before the new one starts are kept; intervals that overlap it are absorbed (widening it); intervals after it are kept.',
  steps=['Copy intervals with <code>end &lt; new.start</code>.',
         'While <code>interval.start ≤ new.end</code>: widen the new interval to cover it.',
         'Append the (widened) new interval, then copy the rest.'],
  code=r'''
class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        res = []
        i, n = 0, len(intervals)
        start, end = newInterval
        while i < n and intervals[i][1] < start:      # completely before
            res.append(intervals[i])
            i += 1
        while i < n and intervals[i][0] <= end:       # overlapping: absorb
            start = min(start, intervals[i][0])
            end = max(end, intervals[i][1])
            i += 1
        res.append([start, end])
        while i < n:                                  # completely after
            res.append(intervals[i])
            i += 1
        return res
''',
  time='O(n)', space='O(n)',
  run='Solution().insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8])', expect='[[1, 2], [3, 10], [12, 16]]',
  tests=[('Solution().insert([[1, 3], [6, 9]], [2, 5])', '[[1, 5], [6, 9]]'), ('Solution().insert([], [5, 7])', '[[5, 7]]')])

P(435, 'non-overlapping-intervals', 'Non-overlapping Intervals', 'Medium', 'intervals', 'Greedy by end',
  hook='Remove the fewest intervals so that the rest don\'t overlap. (Touching at an endpoint is fine.)',
  brute='Try every subset to keep: exponential.',
  insight='Equivalent: keep as many non-overlapping intervals as possible. Greedy works: sort by <b>end</b> and always keep the interval that finishes earliest, since it leaves the most room. Every interval that starts before the last kept end must go.',
  steps=['Sort by end.',
         'Track the end of the last kept interval (start at −∞).',
         'If an interval starts at or after that end, keep it and update the end; otherwise count it as removed.'],
  code=r'''
class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        intervals.sort(key=lambda iv: iv[1])
        removed = 0
        end = float("-inf")
        for s, e in intervals:
            if s >= end:          # fits after the last kept interval
                end = e
            else:
                removed += 1
        return removed
''',
  time='O(n log n)', space='O(1)',
  run='Solution().eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])', expect='1',
  tests=[('Solution().eraseOverlapIntervals([[1, 2], [1, 2], [1, 2]])', '2'), ('Solution().eraseOverlapIntervals([[1, 2], [2, 3]])', '0')],
  tip='Why end and not start? An interval that starts first might be very long and block many others. Ending first is the provably safe choice.')

P(452, 'minimum-number-of-arrows-to-burst-balloons', 'Minimum Number of Arrows to Burst Balloons', 'Medium', 'intervals', 'Greedy by end',
  hook='Balloons span x-ranges. A vertical arrow at x bursts every balloon whose range contains x. What is the fewest arrows to burst them all?',
  brute='Try arrow positions at every endpoint combination: exponential.',
  insight='Sort by end. The balloon that ends first must be hit by some arrow; shooting it at its <b>end</b> is the best choice, as it hits as many later balloons as possible. Skip every balloon that starts at or before that arrow.',
  steps=['Sort balloons by their end.',
         'Keep the x of the last arrow (−∞ at first).',
         'If a balloon starts after the last arrow, shoot a new arrow at its end.'],
  code=r'''
class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        points.sort(key=lambda p: p[1])
        arrows = 0
        arrow_x = float("-inf")
        for start, end in points:
            if start > arrow_x:       # not burst by the previous arrow
                arrows += 1
                arrow_x = end         # shoot as far right as possible
        return arrows
''',
  time='O(n log n)', space='O(1)',
  run='Solution().findMinArrowShots([[10, 16], [2, 8], [1, 6], [7, 12]])', expect='2',
  tests=[('Solution().findMinArrowShots([[1, 2], [3, 4], [5, 6], [7, 8]])', '4'), ('Solution().findMinArrowShots([[1, 2], [2, 3], [3, 4], [4, 5]])', '2')],
  tip='Compare with Non-overlapping Intervals: same sort, same sweep. Here touching balloons <i>are</i> burst together, so the test is <code>start &gt; arrow_x</code>.')

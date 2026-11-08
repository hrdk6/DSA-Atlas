from _base import P

P(1768, 'merge-strings-alternately', 'Merge Strings Alternately', 'Easy', 'arrays', 'Two pointers',
  hook='Take letters from two words in turn (first from <code>word1</code>, then <code>word2</code>, then <code>word1</code>...). When one word runs out, append the rest of the other.',
  brute='This one is already simple: walk an index forward and copy letters. The only thing to get right is the "leftover" tail of the longer word.',
  insight='Use one index <code>i</code> for both words and keep going while <i>either</i> word still has a letter at <code>i</code>. Collect pieces in a list and join once at the end: building a string with <code>+=</code> in a loop copies the string every time.',
  steps=['Make an empty list <code>out</code> and set <code>i = 0</code>.',
         'While <code>i</code> is inside <code>word1</code> or inside <code>word2</code>: append <code>word1[i]</code> if it exists, then <code>word2[i]</code> if it exists.',
         'Move <code>i</code> forward by one.',
         'Return <code>"".join(out)</code>.'],
  code=r'''
class Solution:
    def mergeAlternately(self, word1: str, word2: str) -> str:
        out = []
        i = 0
        while i < len(word1) or i < len(word2):
            if i < len(word1):
                out.append(word1[i])
            if i < len(word2):
                out.append(word2[i])
            i += 1
        return "".join(out)
''',
  time='O(m + n)', space='O(m + n)', why='Every letter is copied once; the output holds all of them.',
  run='Solution().mergeAlternately("abc", "pqr")', expect="'apbqcr'",
  tests=[('Solution().mergeAlternately("ab", "pqrs")', "'apbqrs'"), ('Solution().mergeAlternately("abcd", "pq")', "'apbqcd'")],
  tip='Say out loud why you join a list instead of using <code>+=</code>: strings are immutable in Python, so each <code>+=</code> may copy the whole string.')

P(1071, 'greatest-common-divisor-of-strings', 'Greatest Common Divisor of Strings', 'Easy', 'arrays', 'Math (GCD)',
  hook='Find the longest string <code>x</code> such that both <code>str1</code> and <code>str2</code> are made by repeating <code>x</code> some number of times.',
  brute='Try every prefix of the shorter string, longest first, and check whether repeating it builds both strings. Works, but does a lot of repeated checking.',
  insight='If both strings are built from the same block, then <code>str1 + str2 == str2 + str1</code> (gluing them in either order gives the same text). If that test fails, there is no answer. If it passes, the block length is the <b>GCD of the two lengths</b>, exactly like the GCD of two numbers.',
  steps=['If <code>str1 + str2 != str2 + str1</code>, return <code>""</code>.',
         'Compute <code>g = gcd(len(str1), len(str2))</code>.',
         'Return the first <code>g</code> characters of <code>str1</code>.'],
  code=r'''
class Solution:
    def gcdOfStrings(self, str1: str, str2: str) -> str:
        if str1 + str2 != str2 + str1:
            return ""
        g = math.gcd(len(str1), len(str2))
        return str1[:g]
''',
  time='O(m + n)', space='O(m + n)', why='The concatenation check reads both strings once.',
  run='Solution().gcdOfStrings("ABCABC", "ABC")', expect="'ABC'",
  tests=[('Solution().gcdOfStrings("ABABAB", "ABAB")', "'AB'"), ('Solution().gcdOfStrings("LEET", "CODE")', "''")],
  tip='If you can\'t recall the concatenation trick, the brute force (check prefixes from longest to shortest) is a fine first answer. Mention it, then improve.')

P(1431, 'kids-with-the-greatest-number-of-candies', 'Kids With the Greatest Number of Candies', 'Easy', 'arrays', 'Array scan',
  hook='For each kid, imagine giving them all the extra candies. Would they then have at least as many as the current maximum? Return a list of True/False.',
  brute='For each kid, compare against every other kid: O(n²). Unnecessary.',
  insight='A kid only needs to beat the <b>current maximum</b>. Find the maximum once, then each kid is a single comparison.',
  steps=['Compute <code>best = max(candies)</code> once.',
         'For each count <code>c</code>, the answer is <code>c + extraCandies >= best</code>.'],
  code=r'''
class Solution:
    def kidsWithCandies(self, candies: List[int], extraCandies: int) -> List[bool]:
        best = max(candies)
        result = []
        for c in candies:
            result.append(c + extraCandies >= best)
        return result
''',
  time='O(n)', space='O(n)', why='Two passes over the list; the answer list has n entries.',
  run='Solution().kidsWithCandies([2, 3, 5, 1, 3], 3)', expect='[True, True, True, False, True]',
  tests=[('Solution().kidsWithCandies([12, 1, 12], 10)', '[True, False, True]')],
  tip='Pattern to remember: when every item is compared to "the best", compute the best first. That turns O(n²) into O(n).')

P(605, 'can-place-flowers', 'Can Place Flowers', 'Easy', 'arrays', 'Greedy',
  hook='A flowerbed is a list of 0s (empty) and 1s (planted). Flowers can\'t be in adjacent plots. Can you plant <code>n</code> more flowers?',
  brute='Try every combination of empty plots: exponential. Way too slow.',
  insight='<b>Greedy works:</b> scan left to right and plant in every empty plot whose left and right neighbours are also empty (treat the ends as empty). Planting as early as possible never blocks a better arrangement.',
  steps=['Walk through each index <code>i</code>.',
         'If the plot is 0 and its left neighbour is empty (or <code>i</code> is the first plot) and its right neighbour is empty (or <code>i</code> is the last plot), plant: set it to 1 and decrease <code>n</code>.',
         'If <code>n</code> reaches 0, return True early.',
         'At the end return <code>n &lt;= 0</code>.'],
  code=r'''
class Solution:
    def canPlaceFlowers(self, flowerbed: List[int], n: int) -> bool:
        bed = flowerbed
        for i in range(len(bed)):
            if bed[i] == 0:
                left_empty = i == 0 or bed[i - 1] == 0
                right_empty = i == len(bed) - 1 or bed[i + 1] == 0
                if left_empty and right_empty:
                    bed[i] = 1          # plant here
                    n -= 1
                    if n <= 0:
                        return True
        return n <= 0
''',
  time='O(n)', space='O(1)',
  run='Solution().canPlaceFlowers([1, 0, 0, 0, 1], 1)', expect='True',
  tests=[('Solution().canPlaceFlowers([1, 0, 0, 0, 1], 2)', 'False'), ('Solution().canPlaceFlowers([0, 0, 1, 0, 0], 2)', 'True'), ('Solution().canPlaceFlowers([1], 0)', 'True')],
  tip='Edge cases interviewers check: <code>n = 0</code>, a bed of length 1, and plots at both ends. Handle the ends by treating "outside the bed" as empty.')

P(345, 'reverse-vowels-of-a-string', 'Reverse Vowels of a String', 'Easy', 'two-pointers', 'Two pointers',
  hook='Reverse only the vowels (a, e, i, o, u in either case) in a string. Everything else stays where it is.',
  brute='Collect the vowels in a list, then walk the string again and replace each vowel with the next one from the end of that list. O(n) time and fine, but uses extra space for the vowel list.',
  insight='Use <b>two pointers</b> from both ends. Each pointer skips non-vowels; when both stand on vowels, swap them and move both inward. It is exactly "reverse a string", but the pointers skip characters that don\'t take part.',
  steps=['Turn the string into a list (strings are immutable).',
         'Set <code>l = 0</code>, <code>r = len - 1</code>.',
         'If <code>chars[l]</code> is not a vowel, move <code>l</code> right. Else if <code>chars[r]</code> is not a vowel, move <code>r</code> left.',
         'Otherwise both are vowels: swap them, then move both pointers.',
         'Join the list back into a string.'],
  code=r'''
class Solution:
    def reverseVowels(self, s: str) -> str:
        vowels = set("aeiouAEIOU")
        chars = list(s)
        l, r = 0, len(chars) - 1
        while l < r:
            if chars[l] not in vowels:
                l += 1
            elif chars[r] not in vowels:
                r -= 1
            else:
                chars[l], chars[r] = chars[r], chars[l]
                l += 1
                r -= 1
        return "".join(chars)
''',
  time='O(n)', space='O(n)', why='Each pointer crosses the string once; the list copy is needed because Python strings can\'t be changed.',
  run='Solution().reverseVowels("IceCreAm")', expect="'AceCreIm'",
  tests=[('Solution().reverseVowels("leetcode")', "'leotcede'")],
  tip='Store vowels in a <code>set</code>: membership checks are O(1). Don\'t forget the uppercase vowels.')

P(151, 'reverse-words-in-a-string', 'Reverse Words in a String', 'Medium', 'arrays', 'String parsing',
  hook='Reverse the order of the words. The input may have leading, trailing or repeated spaces; the output must have single spaces only.',
  brute='In Python the honest one-liner is <code>" ".join(reversed(s.split()))</code>, because <code>split()</code> with no argument already drops extra spaces. Interviewers often ask how you would do it by hand.',
  insight='Scan with two pointers: skip spaces with <code>i</code>, then move <code>j</code> to the end of the word. <code>s[i:j]</code> is one word. Collect the words, then join them in reverse order.',
  steps=['Start <code>i</code> at 0.',
         'Skip spaces: move <code>i</code> forward while <code>s[i]</code> is a space.',
         'Set <code>j = i</code> and move <code>j</code> forward until a space or the end: <code>s[i:j]</code> is the next word.',
         'Save the word and continue from <code>j</code>.',
         'Return the words joined by single spaces, last word first.'],
  code=r'''
class Solution:
    def reverseWords(self, s: str) -> str:
        words = []
        i, n = 0, len(s)
        while i < n:
            while i < n and s[i] == " ":   # skip spaces
                i += 1
            if i >= n:
                break
            j = i
            while j < n and s[j] != " ":   # find where the word ends
                j += 1
            words.append(s[i:j])
            i = j
        return " ".join(reversed(words))
''',
  time='O(n)', space='O(n)',
  run='Solution().reverseWords("  the sky  is blue ")', expect="'blue is sky the'",
  tests=[('Solution().reverseWords("a good   example")', "'example good a'")],
  tip='Mention both versions: the readable <code>split()</code> one-liner, and the manual scan that shows you understand what <code>split</code> does. Follow-up: with a mutable char array you can reverse the whole thing, then reverse each word, using O(1) extra space.')

P(238, 'product-of-array-except-self', 'Product of Array Except Self', 'Medium', 'arrays', 'Prefix & suffix products',
  hook='For each index <code>i</code>, return the product of every number <b>except</b> <code>nums[i]</code>. No division allowed, and it should be O(n).',
  brute='For each index multiply all the others: O(n²). Dividing the total product by <code>nums[i]</code> is forbidden, and breaks on zeros anyway.',
  insight='The product of everything except <code>i</code> = (product of everything <b>left</b> of <code>i</code>) × (product of everything <b>right</b> of <code>i</code>). One pass left-to-right fills in the left products, one pass right-to-left multiplies in the right products.',
  steps=['Create <code>answer = [1] * n</code>.',
         'Left pass: keep a running <code>prefix</code> product. Store it in <code>answer[i]</code> <i>before</i> multiplying <code>nums[i]</code> in, so it covers only the elements to the left.',
         'Right pass: keep a running <code>suffix</code> product from the end. Multiply it into <code>answer[i]</code>, then multiply <code>nums[i]</code> into <code>suffix</code>.',
         'Return <code>answer</code>.'],
  code=r'''
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        answer = [1] * n
        prefix = 1
        for i in range(n):             # answer[i] = product of nums[0..i-1]
            answer[i] = prefix
            prefix *= nums[i]
        suffix = 1
        for i in range(n - 1, -1, -1): # multiply in product of nums[i+1..]
            answer[i] *= suffix
            suffix *= nums[i]
        return answer
''',
  time='O(n)', space='O(1)', why='O(1) extra space besides the output list, which the problem doesn\'t count.',
  run='Solution().productExceptSelf([1, 2, 3, 4])', expect='[24, 12, 8, 6]',
  tests=[('Solution().productExceptSelf([-1, 1, 0, -3, 3])', '[0, 0, 9, 0, 0]')],
  tip='"Left part × right part" is a reusable idea: the same two-pass trick solves Trapping Rain Water and Candy.')

P(334, 'increasing-triplet-subsequence', 'Increasing Triplet Subsequence', 'Medium', 'arrays', 'Greedy',
  hook='Is there <code>i &lt; j &lt; k</code> with <code>nums[i] &lt; nums[j] &lt; nums[k]</code>? The three numbers don\'t have to be next to each other.',
  brute='Three nested loops over i, j, k: O(n³).',
  insight='Keep two numbers while scanning: <code>first</code> = the smallest value seen so far, and <code>second</code> = the smallest value that has something smaller before it. Any number bigger than <code>second</code> completes a triplet. Keeping both as small as possible gives later numbers the best chance.',
  steps=['Set <code>first = second = infinity</code>.',
         'For each <code>x</code>: if <code>x &lt;= first</code>, it becomes the new <code>first</code>.',
         'Else if <code>x &lt;= second</code>, it becomes the new <code>second</code> (it is bigger than some earlier first).',
         'Else <code>x &gt; second &gt; first</code>: return True.',
         'If the loop ends, return False.'],
  code=r'''
class Solution:
    def increasingTriplet(self, nums: List[int]) -> bool:
        first = second = float("inf")
        for x in nums:
            if x <= first:
                first = x        # smallest so far
            elif x <= second:
                second = x       # smallest number with a smaller one before it
            else:
                return True      # first < second < x
        return False
''',
  time='O(n)', space='O(1)',
  run='Solution().increasingTriplet([2, 1, 5, 0, 4, 6])', expect='True',
  tests=[('Solution().increasingTriplet([5, 4, 3, 2, 1])', 'False'), ('Solution().increasingTriplet([20, 100, 10, 12, 5, 13])', 'True')],
  tip='A common confusion: after <code>first</code> is updated to a later small number, the pair isn\'t "real" anymore. That\'s fine. <code>second</code> still proves some smaller number came before it, so the logic holds.')

P(443, 'string-compression', 'String Compression', 'Medium', 'two-pointers', 'Read / write pointers',
  hook='Compress runs of repeated characters in place: <code>["a","a","b","b","c","c","c"]</code> becomes <code>["a","2","b","2","c","3"]</code>. Return the new length.',
  brute='Build a new compressed list and copy it back. Easy, but the problem asks for O(1) extra space.',
  insight='Use a <code>read</code> pointer to scan each run and a <code>write</code> pointer to write the compressed form into the same list. The compressed text is never longer than what has already been read, so writing never overwrites unread data.',
  steps=['Keep <code>read = 0</code> and <code>write = 0</code>.',
         'Remember <code>ch = chars[read]</code> and advance <code>read</code> while the character is the same, counting the run.',
         'Write <code>ch</code> at <code>write</code> and advance it.',
         'If the run is longer than 1, write each digit of the count (a run of 12 writes "1" and "2").',
         'Repeat until <code>read</code> reaches the end; return <code>write</code>.'],
  code=r'''
class Solution:
    def compress(self, chars: List[str]) -> int:
        write = 0
        read = 0
        while read < len(chars):
            ch = chars[read]
            count = 0
            while read < len(chars) and chars[read] == ch:
                read += 1
                count += 1
            chars[write] = ch
            write += 1
            if count > 1:
                for d in str(count):
                    chars[write] = d
                    write += 1
        return write
''',
  time='O(n)', space='O(1)',
  run='''
chars = ["a", "a", "b", "b", "c", "c", "c"]
k = Solution().compress(chars)
(k, chars[:k])
''', expect="(6, ['a', '2', 'b', '2', 'c', '3'])",
  tests=[('''
chars = ["a"] + ["b"] * 12
k = Solution().compress(chars)
(k, chars[:k])
''', "(4, ['a', 'b', '1', '2'])")],
  tip='The read/write pointer pair is the standard way to edit a list in place: one pointer looks ahead, the other marks where the next output goes.')

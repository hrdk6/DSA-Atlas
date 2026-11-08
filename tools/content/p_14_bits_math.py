from _base import P

# ------------------------------------------------------------------------- bits
P(338, 'counting-bits', 'Counting Bits', 'Easy', 'bits', 'DP on bits',
  hook='For every i from 0 to n, return how many 1-bits i has.',
  brute='Count the bits of each number separately: O(n log n).',
  insight='Shifting right drops the last bit: <code>i &gt;&gt; 1</code> is i without its last bit, and that answer is already computed. So <code>bits(i) = bits(i &gt;&gt; 1) + (i &amp; 1)</code>.',
  steps=['<code>ans = [0] * (n + 1)</code>.',
         'For i from 1 to n: <code>ans[i] = ans[i &gt;&gt; 1] + (i &amp; 1)</code>.'],
  code=r'''
class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            ans[i] = ans[i >> 1] + (i & 1)   # bits of i//2, plus i's last bit
        return ans
''',
  time='O(n)', space='O(n)', why='Besides the output, O(1).',
  run='Solution().countBits(5)', expect='[0, 1, 1, 2, 1, 2]',
  tests=[('Solution().countBits(2)', '[0, 1, 1]'), ('Solution().countBits(0)', '[0]')],
  tip='Another recurrence: <code>ans[i] = ans[i &amp; (i − 1)] + 1</code>, since <code>i &amp; (i − 1)</code> removes exactly one set bit.')

P(136, 'single-number', 'Single Number', 'Easy', 'bits', 'XOR',
  hook='Every number appears twice except one. Find it with O(1) extra space.',
  brute='Count with a dict: O(n) space.',
  insight='XOR has two magic properties: <code>x ^ x = 0</code> and <code>x ^ 0 = x</code>, and order doesn\'t matter. XOR everything: each pair cancels to 0 and the single number is left.',
  steps=['<code>result = 0</code>.',
         'XOR every number into it.',
         'Return <code>result</code>.'],
  code=r'''
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for x in nums:
            result ^= x          # pairs cancel out
        return result
''',
  time='O(n)', space='O(1)',
  run='Solution().singleNumber([4, 1, 2, 1, 2])', expect='4',
  tests=[('Solution().singleNumber([2, 2, 1])', '1'), ('Solution().singleNumber([1])', '1')])

P(1318, 'minimum-flips-to-make-a-or-b-equal-to-c', 'Minimum Flips to Make a OR b Equal to c', 'Medium', 'bits', 'Bit by bit',
  hook='Flip as few bits of <code>a</code> and <code>b</code> as possible so that <code>a | b == c</code>.',
  brute='Bits are independent, so there is nothing to search: just look at each bit position.',
  insight='Check one bit position at a time. If c\'s bit is 1, at least one of a, b must be 1: one flip if both are 0. If c\'s bit is 0, both must be 0: flip each 1.',
  steps=['While any of a, b, c is non-zero: read their last bits.',
         'c bit = 1 → add 1 if both a and b bits are 0.',
         'c bit = 0 → add a\'s bit + b\'s bit.',
         'Shift all three right.'],
  code=r'''
class Solution:
    def minFlips(self, a: int, b: int, c: int) -> int:
        flips = 0
        while a or b or c:
            bit_a, bit_b, bit_c = a & 1, b & 1, c & 1
            if bit_c == 1:
                if bit_a == 0 and bit_b == 0:
                    flips += 1             # turn one of them on
            else:
                flips += bit_a + bit_b     # turn every 1 off
            a, b, c = a >> 1, b >> 1, c >> 1
        return flips
''',
  time='O(log max(a, b, c))', space='O(1)',
  run='Solution().minFlips(2, 6, 5)', expect='3',
  tests=[('Solution().minFlips(4, 2, 7)', '1'), ('Solution().minFlips(1, 2, 3)', '0')])

P(67, 'add-binary', 'Add Binary', 'Easy', 'bits', 'Digit-by-digit addition',
  hook='Add two binary strings and return the sum as a binary string.',
  brute='<code>bin(int(a, 2) + int(b, 2))[2:]</code> works in Python. Interviewers want the manual addition.',
  insight='Add from the rightmost digits with a carry, exactly like decimal addition but in base 2: digit = total % 2, carry = total // 2.',
  steps=['Pointers at the ends of both strings, <code>carry = 0</code>.',
         'While digits remain or carry: add available digits and the carry.',
         'Append <code>total % 2</code>; set <code>carry = total // 2</code>.',
         'Reverse the collected digits.'],
  code=r'''
class Solution:
    def addBinary(self, a: str, b: str) -> str:
        i, j = len(a) - 1, len(b) - 1
        carry = 0
        out = []
        while i >= 0 or j >= 0 or carry:
            total = carry
            if i >= 0:
                total += int(a[i])
                i -= 1
            if j >= 0:
                total += int(b[j])
                j -= 1
            out.append(str(total % 2))
            carry = total // 2
        return "".join(reversed(out))
''',
  time='O(max(m, n))', space='O(max(m, n))',
  run='Solution().addBinary("1010", "1011")', expect="'10101'",
  tests=[('Solution().addBinary("11", "1")', "'100'"), ('Solution().addBinary("0", "0")', "'0'")],
  tip='Same skeleton as Add Two Numbers (linked lists) and Plus One. Recognising the shared "carry loop" saves time.')

P(190, 'reverse-bits', 'Reverse Bits', 'Easy', 'bits', 'Bit shifting',
  hook='Reverse the 32 bits of an unsigned integer.',
  brute='Convert to a 32-character binary string, reverse it, convert back: works, but use bit operations in an interview.',
  insight='Read n\'s bits from the right with <code>n &amp; 1</code>, and push each onto the result from the left side by shifting the result left first. After 32 steps the order is reversed.',
  steps=['<code>result = 0</code>.',
         'Repeat 32 times: <code>result = (result &lt;&lt; 1) | (n &amp; 1)</code>; <code>n &gt;&gt;= 1</code>.',
         'Return <code>result</code>.'],
  code=r'''
class Solution:
    def reverseBits(self, n: int) -> int:
        result = 0
        for _ in range(32):
            result = (result << 1) | (n & 1)   # move n's last bit onto result
            n >>= 1
        return result
''',
  time='O(1)', space='O(1)', why='Always 32 iterations.',
  run='Solution().reverseBits(43261596)', expect='964176192',
  tests=[('Solution().reverseBits(4294967293)', '3221225471')])

P(191, 'number-of-1-bits', 'Number of 1 Bits', 'Easy', 'bits', 'Clear lowest set bit',
  hook='Count the 1-bits in a positive integer (its Hamming weight).',
  brute='Check all 32 bits with <code>(n &gt;&gt; i) &amp; 1</code>: always 32 steps.',
  insight='<code>n &amp; (n − 1)</code> removes the lowest set bit. Repeating until n is 0 takes exactly as many steps as there are 1-bits (Brian Kernighan\'s trick).',
  steps=['While n is non-zero: <code>n &amp;= n − 1</code> and count one.',
         'Return the count.'],
  code=r'''
class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1        # clear the lowest set bit
            count += 1
        return count
''',
  time='O(k)', space='O(1)', why='k = number of set bits.',
  run='Solution().hammingWeight(11)', expect='3',
  tests=[('Solution().hammingWeight(128)', '1'), ('Solution().hammingWeight(2147483645)', '30')],
  tip='Python 3.10+ has <code>n.bit_count()</code>. Mention it, then show the trick.')

P(137, 'single-number-ii', 'Single Number II', 'Medium', 'bits', 'Bit counting mod 3',
  hook='Every number appears three times except one, which appears once. Find it in O(1) extra space.',
  brute='Count with a dict: O(n) space. XOR alone doesn\'t work: three copies don\'t cancel.',
  insight='Look at each of the 32 bit positions separately. Count how many numbers have that bit set. The tripled numbers contribute a multiple of 3, so if the count is not divisible by 3, the single number has that bit.',
  steps=['For each bit 0…31: count numbers with that bit set.',
         'If <code>count % 3</code> is 1, set that bit in the result.',
         'Convert from 32-bit two\'s complement if the top bit is set (negative answer).'],
  code=r'''
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        result = 0
        for bit in range(32):
            count = sum((x >> bit) & 1 for x in nums)   # how many have this bit
            if count % 3:                               # leftover belongs to the single number
                result |= 1 << bit
        if result >= 2**31:                             # 32-bit sign fix
            result -= 2**32
        return result
''',
  time='O(32 · n)', space='O(1)',
  run='Solution().singleNumber([2, 2, 3, 2])', expect='3',
  tests=[('Solution().singleNumber([0, 1, 0, 1, 0, 1, 99])', '99'), ('Solution().singleNumber([-2, -2, 1, 1, 4, 1, 4, 4, -4, -2])', '-4')],
  tip='Advanced one-pass version: keep <code>ones</code> and <code>twos</code> bitmasks (bits seen once / twice, mod 3). Explain the counting version first; it is far easier to defend.')

P(201, 'bitwise-and-of-numbers-range', 'Bitwise AND of Numbers Range', 'Medium', 'bits', 'Common prefix',
  hook='Return the bitwise AND of every integer from <code>left</code> to <code>right</code>.',
  brute='AND them all in a loop: up to 2³¹ numbers.',
  insight='Any bit that changes somewhere in the range ends up 0. What survives is the <b>common binary prefix</b> of left and right. Shift both right until they are equal, then shift the prefix back.',
  steps=['While <code>left &lt; right</code>: shift both right and count the shifts.',
         'Return <code>left &lt;&lt; shift</code>.'],
  code=r'''
class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        shift = 0
        while left < right:          # drop bits until the prefixes match
            left >>= 1
            right >>= 1
            shift += 1
        return left << shift         # common prefix followed by zeros
''',
  time='O(log n)', space='O(1)',
  run='Solution().rangeBitwiseAnd(5, 7)', expect='4',
  tests=[('Solution().rangeBitwiseAnd(0, 0)', '0'), ('Solution().rangeBitwiseAnd(1, 2147483647)', '0')])

# ------------------------------------------------------------------------- math
P(9, 'palindrome-number', 'Palindrome Number', 'Easy', 'bits', 'Digit manipulation',
  hook='Is an integer a palindrome (reads the same backwards)? Try it without converting to a string.',
  brute='<code>str(x) == str(x)[::-1]</code>: fine, but the follow-up forbids strings.',
  insight='Reverse only the <b>second half</b> of the digits: peel the last digit off <code>x</code> and push it onto <code>rev</code> until <code>rev</code> is at least as big as what is left. Then compare the halves (dropping the middle digit for odd lengths).',
  steps=['Negatives, and numbers ending in 0 (except 0 itself), are not palindromes.',
         'While <code>x &gt; rev</code>: <code>rev = rev × 10 + x % 10</code>, <code>x //= 10</code>.',
         'Return <code>x == rev or x == rev // 10</code>.'],
  code=r'''
class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        rev = 0
        while x > rev:                    # reverse half of the digits
            rev = rev * 10 + x % 10
            x //= 10
        return x == rev or x == rev // 10 # even / odd number of digits
''',
  time='O(log x)', space='O(1)',
  run='Solution().isPalindrome(1221)', expect='True',
  tests=[('Solution().isPalindrome(121)', 'True'), ('Solution().isPalindrome(-121)', 'False'), ('Solution().isPalindrome(10)', 'False'), ('Solution().isPalindrome(0)', 'True')])

P(66, 'plus-one', 'Plus One', 'Easy', 'bits', 'Carry propagation',
  hook='A number is stored as a list of digits. Add one.',
  brute='Convert to an int, add one, convert back. Works in Python, but the digit loop is what is asked.',
  insight='Walk from the last digit. A digit below 9 just increments and you are done. A 9 becomes 0 and the carry moves left. If every digit was 9, prepend a 1.',
  steps=['From right to left: if the digit is &lt; 9, increment it and return.',
         'Otherwise set it to 0 and continue.',
         'All nines: return <code>[1] + digits</code>.'],
  code=r'''
class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1        # no carry needed
                return digits
            digits[i] = 0             # 9 + 1 = 10: carry on
        return [1] + digits           # 999 -> 1000
''',
  time='O(n)', space='O(1)', why='O(n) only in the all-nines case, for the new list.',
  run='Solution().plusOne([1, 2, 9])', expect='[1, 3, 0]',
  tests=[('Solution().plusOne([9])', '[1, 0]'), ('Solution().plusOne([4, 3, 2, 1])', '[4, 3, 2, 2]')])

P(172, 'factorial-trailing-zeroes', 'Factorial Trailing Zeroes', 'Medium', 'bits', 'Counting factors',
  hook='How many zeros are at the end of n! ?',
  brute='Compute n! and count zeros: the number becomes astronomically large.',
  insight='Each trailing zero is a factor of 10 = 2 × 5. Factors of 2 are plentiful, so count factors of 5: multiples of 5 give one each, multiples of 25 one more, 125 one more, and so on.',
  steps=['<code>count = 0</code>.',
         'While n &gt; 0: <code>n //= 5</code>; <code>count += n</code>.'],
  code=r'''
class Solution:
    def trailingZeroes(self, n: int) -> int:
        count = 0
        while n:
            n //= 5          # multiples of 5, then of 25, of 125, ...
            count += n
        return count
''',
  time='O(log n)', space='O(1)',
  run='Solution().trailingZeroes(100)', expect='24',
  tests=[('Solution().trailingZeroes(3)', '0'), ('Solution().trailingZeroes(5)', '1')])

P(69, 'sqrtx', 'Sqrt(x)', 'Easy', 'binary-search', 'Binary search on the answer',
  hook='Return the integer square root of x (rounded down), without <code>**</code> or <code>math.sqrt</code>.',
  brute='Try r = 0, 1, 2, … while r² ≤ x: O(√x).',
  insight='"Largest r with r² ≤ x" is a boundary on a monotonic condition, so binary search r in [0, x]. Round <code>mid</code> <b>up</b> because the "yes" branch sets <code>lo = mid</code>; otherwise the loop can get stuck.',
  steps=['<code>lo, hi = 0, x</code>.',
         '<code>mid = (lo + hi + 1) // 2</code>.',
         'If <code>mid² ≤ x</code>, <code>lo = mid</code>; else <code>hi = mid − 1</code>.',
         'Return <code>lo</code>.'],
  code=r'''
class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi = 0, x
        while lo < hi:
            mid = (lo + hi + 1) // 2      # round up so lo = mid makes progress
            if mid * mid <= x:
                lo = mid                  # mid works: answer is mid or bigger
            else:
                hi = mid - 1
        return lo
''',
  time='O(log x)', space='O(1)',
  run='Solution().mySqrt(8)', expect='2',
  tests=[('Solution().mySqrt(4)', '2'), ('Solution().mySqrt(0)', '0'), ('Solution().mySqrt(1)', '1'), ('Solution().mySqrt(2147395599)', '46339')],
  tip='This "last true" template is the mirror of "first true". Explain why mid rounds up: with lo = 3, hi = 4, rounding down gives mid = 3 and lo = 3 forever.')

P(50, 'powx-n', 'Pow(x, n)', 'Medium', 'bits', 'Fast exponentiation',
  hook='Compute xⁿ, where n can be negative and as large as 2³¹.',
  brute='Multiply x by itself n times: O(n), far too slow for n ≈ 2 billion.',
  insight='<b>Binary exponentiation</b>: write n in binary. x¹³ = x⁸ · x⁴ · x¹ because 13 = 1101₂. Square x repeatedly to get x, x², x⁴, x⁸ … and multiply in the ones whose bit is set. For negative n, use 1/x and −n.',
  steps=['If n &lt; 0: <code>x = 1/x</code>, <code>n = −n</code>.',
         'While n: if the lowest bit is set, <code>result *= x</code>.',
         '<code>x *= x</code> (next power of two), <code>n &gt;&gt;= 1</code>.'],
  code=r'''
class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n
        result = 1.0
        while n:
            if n & 1:            # this bit of n is set
                result *= x
            x *= x               # x, x^2, x^4, x^8, ...
            n >>= 1
        return result
''',
  time='O(log n)', space='O(1)',
  run='Solution().myPow(2.0, 10)', expect='1024.0',
  tests=[('Solution().myPow(2.1, 3)', '9.261'), ('Solution().myPow(2.0, -2)', '0.25'), ('Solution().myPow(1.0, 2147483647)', '1.0')])

P(149, 'max-points-on-a-line', 'Max Points on a Line', 'Hard', 'hashing', 'Slopes in a hash map',
  hook='Given points on a plane, what is the largest number of them on one straight line?',
  brute='For every pair, define the line and count points on it: O(n³).',
  insight='Fix an anchor point. Every other point on a common line through the anchor has the same <b>slope</b>. Count slopes in a dict. Store the slope as a reduced fraction <code>(dy, dx)</code> with a fixed sign (divide by the gcd), avoiding floating point errors.',
  steps=['For each anchor i, count slopes to every later point j.',
         'Slope key: divide (dx, dy) by their gcd; make dx positive (or dx = 0, dy positive).',
         'The best count for a key + 1 (the anchor) is a candidate answer.'],
  code=r'''
class Solution:
    def maxPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        if n <= 2:
            return n
        best = 0
        for i in range(n):
            slopes = defaultdict(int)
            x1, y1 = points[i]
            for j in range(i + 1, n):
                dx = points[j][0] - x1
                dy = points[j][1] - y1
                g = math.gcd(dx, dy)
                dx, dy = dx // g, dy // g            # reduced fraction
                if dx < 0 or (dx == 0 and dy < 0):
                    dx, dy = -dx, -dy                # one sign for the same line
                slopes[(dx, dy)] += 1
                best = max(best, slopes[(dx, dy)] + 1)   # + the anchor
        return best
''',
  time='O(n² log C)', space='O(n)', why='log C for the gcd of coordinate differences.',
  run='Solution().maxPoints([[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]])', expect='4',
  tests=[('Solution().maxPoints([[1, 1], [2, 2], [3, 3]])', '3'), ('Solution().maxPoints([[0, 0]])', '1')],
  tip='Using floating slopes (dy / dx) risks precision bugs and needs special handling for vertical lines. The reduced-fraction key avoids both.')

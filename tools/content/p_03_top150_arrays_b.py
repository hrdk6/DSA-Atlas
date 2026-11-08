from _base import P

SUDOKU = '''[["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]'''

P(134, 'gas-station', 'Gas Station', 'Medium', 'greedy', 'Greedy',
  hook='Stations sit on a circle. At station i you get <code>gas[i]</code>, and driving to the next costs <code>cost[i]</code>. Starting with an empty tank, from which station can you drive the full circle? (-1 if none.)',
  brute='Try each start and simulate the whole circle: O(n²).',
  insight='Two facts. (1) If total gas ≥ total cost, some start works; otherwise none does. (2) If you start at <code>s</code> and first run dry trying to reach <code>i + 1</code>, then no station between <code>s</code> and <code>i</code> can be the start either (each would arrive with even less fuel). So jump the start to <code>i + 1</code>.',
  steps=['If <code>sum(gas) &lt; sum(cost)</code>, return -1.',
         'Walk the stations with a running <code>tank</code>, adding <code>gas[i] − cost[i]</code>.',
         'If the tank goes negative, reset it to 0 and set <code>start = i + 1</code>.',
         'Return <code>start</code>.'],
  code=r'''
class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        if sum(gas) < sum(cost):
            return -1
        start, tank = 0, 0
        for i in range(len(gas)):
            tank += gas[i] - cost[i]
            if tank < 0:          # can't reach i + 1 from start: try i + 1 next
                start = i + 1
                tank = 0
        return start
''',
  time='O(n)', space='O(1)',
  run='Solution().canCompleteCircuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2])', expect='3',
  tests=[('Solution().canCompleteCircuit([2, 3, 4], [3, 4, 3])', '-1')],
  tip='Interviewers love asking why skipping all stations up to i is safe. Answer: each of them would have reached i with no more fuel than our start did, so they fail too.')

P(135, 'candy', 'Candy', 'Hard', 'greedy', 'Two-pass greedy',
  hook='Children stand in a line with ratings. Each gets at least one candy, and a child with a higher rating than a neighbour must get more than that neighbour. Minimise the total.',
  brute='Repeatedly scan and fix violations until nothing changes: O(n²) in the worst case.',
  insight='Split the rule into two one-sided rules. A left-to-right pass makes everyone satisfy "more than my left neighbour if rated higher". A right-to-left pass fixes "more than my right neighbour", taking the <b>max</b> so the first rule still holds.',
  steps=['Give everyone 1 candy.',
         'Left to right: if <code>ratings[i] &gt; ratings[i − 1]</code>, set <code>candies[i] = candies[i − 1] + 1</code>.',
         'Right to left: if <code>ratings[i] &gt; ratings[i + 1]</code>, set <code>candies[i] = max(candies[i], candies[i + 1] + 1)</code>.',
         'Return the sum.'],
  code=r'''
class Solution:
    def candy(self, ratings: List[int]) -> int:
        n = len(ratings)
        candies = [1] * n
        for i in range(1, n):                   # left neighbour rule
            if ratings[i] > ratings[i - 1]:
                candies[i] = candies[i - 1] + 1
        for i in range(n - 2, -1, -1):          # right neighbour rule
            if ratings[i] > ratings[i + 1]:
                candies[i] = max(candies[i], candies[i + 1] + 1)
        return sum(candies)
''',
  time='O(n)', space='O(n)',
  run='Solution().candy([1, 0, 2])', expect='5',
  tests=[('Solution().candy([1, 2, 2])', '4'), ('Solution().candy([1, 3, 4, 5, 2])', '11')],
  tip='Same "left pass + right pass" idea as Product of Array Except Self and Trapping Rain Water.')

P(42, 'trapping-rain-water', 'Trapping Rain Water', 'Hard', 'two-pointers', 'Two pointers',
  hook='Bars of given heights stand side by side. How much rain water is trapped between them?',
  brute='For each bar, scan left and right for the tallest walls: water above it is <code>min(left_max, right_max) − height</code>. O(n²); precomputing the maxima in arrays makes it O(n) time, O(n) space.',
  insight='Water above a bar is limited by the <b>shorter</b> of the tallest wall on its left and on its right. With two pointers, whichever side currently has the lower wall is the limiting side: its water can be settled using only its own running max.',
  steps=['Pointers <code>l</code> and <code>r</code> at both ends; <code>left_max = right_max = 0</code>.',
         'If <code>height[l] &lt; height[r]</code>: the left side is the bottleneck. Update <code>left_max</code>, add <code>left_max − height[l]</code>, move <code>l</code> right.',
         'Otherwise do the same on the right side and move <code>r</code> left.',
         'Stop when the pointers meet.'],
  code=r'''
class Solution:
    def trap(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        left_max = right_max = 0
        water = 0
        while l < r:
            if height[l] < height[r]:
                left_max = max(left_max, height[l])
                water += left_max - height[l]     # bounded by left_max
                l += 1
            else:
                right_max = max(right_max, height[r])
                water += right_max - height[r]
                r -= 1
        return water
''',
  time='O(n)', space='O(1)',
  run='Solution().trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])', expect='6',
  tests=[('Solution().trap([4, 2, 0, 3, 2, 5])', '9')],
  tip='Present it in three stages: O(n²) brute force → O(n) with left-max and right-max arrays → O(1) space with two pointers. Each step is an easy-to-explain improvement.')

P(13, 'roman-to-integer', 'Roman to Integer', 'Easy', 'hashing', 'Hash map lookup',
  hook='Convert a Roman numeral like "MCMXCIV" into an integer.',
  brute='Handle the six subtractive pairs (IV, IX, XL, XC, CD, CM) with special cases. Works, but is easy to get wrong.',
  insight='Read left to right. A symbol is <b>subtracted</b> when a larger symbol follows it (the I in IV), and added otherwise. One rule covers all six special pairs.',
  steps=['Map each symbol to its value.',
         'For each position <code>i</code>: if the next symbol is larger, subtract this value; else add it.',
         'Return the total.'],
  code=r'''
class Solution:
    def romanToInt(self, s: str) -> int:
        value = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
        total = 0
        for i, ch in enumerate(s):
            if i + 1 < len(s) and value[ch] < value[s[i + 1]]:
                total -= value[ch]       # like the I in IV
            else:
                total += value[ch]
        return total
''',
  time='O(n)', space='O(1)',
  run='Solution().romanToInt("MCMXCIV")', expect='1994',
  tests=[('Solution().romanToInt("LVIII")', '58'), ('Solution().romanToInt("III")', '3')])

P(12, 'integer-to-roman', 'Integer to Roman', 'Medium', 'greedy', 'Greedy table',
  hook='Convert an integer (1 to 3999) to a Roman numeral.',
  brute='Process each decimal digit with its own rules for 4 and 9: lots of branches.',
  insight='Put the subtractive forms (900 = CM, 400 = CD, 90, 40, 9, 4) into the value table next to the normal symbols. Then greedily take the largest value that fits, as many times as it fits.',
  steps=['List (value, symbol) pairs from 1000 down to 1, including 900, 400, 90, 40, 9, 4.',
         'For each pair: <code>count, num = divmod(num, value)</code> and append the symbol <code>count</code> times.',
         'Join the pieces.'],
  code=r'''
class Solution:
    def intToRoman(self, num: int) -> str:
        table = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
                 (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
                 (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
        out = []
        for value, symbol in table:
            count, num = divmod(num, value)
            out.append(symbol * count)
        return "".join(out)
''',
  time='O(1)', space='O(1)', why='The table has 13 entries and the output is at most 15 characters.',
  run='Solution().intToRoman(3749)', expect="'MMMDCCXLIX'",
  tests=[('Solution().intToRoman(1994)', "'MCMXCIV'"), ('Solution().intToRoman(58)', "'LVIII'")])

P(58, 'length-of-last-word', 'Length of Last Word', 'Easy', 'arrays', 'Scan from the end',
  hook='Return the length of the last word in a string that may end with spaces.',
  brute='<code>len(s.split()[-1])</code> works in one line, but builds a list of every word.',
  insight='Scan from the end: skip trailing spaces, then count characters until the next space or the start.',
  steps=['Start <code>i</code> at the last index; move left past spaces.',
         'Count characters while <code>s[i]</code> is not a space.',
         'Return the count.'],
  code=r'''
class Solution:
    def lengthOfLastWord(self, s: str) -> int:
        i = len(s) - 1
        while i >= 0 and s[i] == " ":     # skip trailing spaces
            i -= 1
        length = 0
        while i >= 0 and s[i] != " ":
            length += 1
            i -= 1
        return length
''',
  time='O(n)', space='O(1)',
  run='Solution().lengthOfLastWord("   fly me   to   the moon  ")', expect='4',
  tests=[('Solution().lengthOfLastWord("Hello World")', '5'), ('Solution().lengthOfLastWord("a")', '1')])

P(14, 'longest-common-prefix', 'Longest Common Prefix', 'Easy', 'arrays', 'Vertical scan',
  hook='Find the longest string that every word in the list starts with.',
  brute='Check every prefix of the first word against all words, longest first.',
  insight='Compare column by column: take character <code>i</code> of the first word and check it in every other word. The first mismatch, or a word that is too short, ends the prefix.',
  steps=['For each index <code>i</code> and character <code>ch</code> of the first word:',
         'For every other word: if it is too short or has a different character at <code>i</code>, return <code>first[:i]</code>.',
         'If no mismatch is found, the whole first word is the prefix.'],
  code=r'''
class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        first = strs[0]
        for i, ch in enumerate(first):
            for s in strs[1:]:
                if i >= len(s) or s[i] != ch:
                    return first[:i]
        return first
''',
  time='O(S)', space='O(1)', why='S is the total number of characters; we stop at the first mismatch.',
  run='Solution().longestCommonPrefix(["flower", "flow", "flight"])', expect="'fl'",
  tests=[('Solution().longestCommonPrefix(["dog", "racecar", "car"])', "''"), ('Solution().longestCommonPrefix(["a"])', "'a'")],
  tip='Alternative worth mentioning: sort the words; the common prefix of the whole list is the common prefix of the first and last word.')

P(6, 'zigzag-conversion', 'Zigzag Conversion', 'Medium', 'arrays', 'Simulation',
  hook='Write the string in a zigzag down and up across <code>numRows</code> rows, then read the rows left to right.',
  brute='Fill a 2D grid of characters exactly as drawn, then read it row by row. Works, but wastes lots of empty cells.',
  insight='You only need to know which <b>row</b> each character lands in. The row index goes 0, 1, …, numRows−1, then back up, bouncing at the top and bottom. Append each character to its row\'s list.',
  steps=['If <code>numRows == 1</code>, the string doesn\'t change.',
         'Keep a list per row, a current <code>row</code> and a direction <code>step</code> (+1 or −1).',
         'For each character: append to <code>rows[row]</code>; flip direction at the top or bottom; move <code>row += step</code>.',
         'Join all rows.'],
  code=r'''
class Solution:
    def convert(self, s: str, numRows: int) -> str:
        if numRows == 1 or numRows >= len(s):
            return s
        rows = [[] for _ in range(numRows)]
        row, step = 0, 1
        for ch in s:
            rows[row].append(ch)
            if row == 0:
                step = 1              # bounce off the top
            elif row == numRows - 1:
                step = -1             # bounce off the bottom
            row += step
        return "".join("".join(r) for r in rows)
''',
  time='O(n)', space='O(n)',
  run='Solution().convert("PAYPALISHIRING", 3)', expect="'PAHNAPLSIIGYIR'",
  tests=[('Solution().convert("PAYPALISHIRING", 4)', "'PINALSIGYAHRPI'"), ('Solution().convert("AB", 1)', "'AB'")])

P(28, 'find-the-index-of-the-first-occurrence-in-a-string', 'Find the Index of the First Occurrence in a String', 'Easy', 'arrays', 'String matching',
  hook='Return the first index where <code>needle</code> appears in <code>haystack</code>, or -1.',
  brute='Python\'s <code>haystack.find(needle)</code> does this. Interviewers want to see the loop.',
  insight='Try every starting position <code>i</code> where the needle could still fit, and compare the slice. For long inputs the KMP algorithm avoids re-comparing characters (O(n + m)), but the simple version is the expected answer here.',
  steps=['For each <code>i</code> from 0 to <code>len(haystack) − len(needle)</code>:',
         'If <code>haystack[i:i + m] == needle</code>, return <code>i</code>.',
         'Return -1 if nothing matched.'],
  code=r'''
class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        n, m = len(haystack), len(needle)
        for i in range(n - m + 1):
            if haystack[i:i + m] == needle:
                return i
        return -1
''',
  time='O(n·m)', space='O(m)', why='Each slice comparison costs up to m; KMP brings it to O(n + m).',
  run='Solution().strStr("sadbutsad", "sad")', expect='0',
  tests=[('Solution().strStr("leetcode", "leeto")', '-1'), ('Solution().strStr("hello", "ll")', '2')],
  tip='Mention KMP or rolling hashes (Rabin-Karp) as the follow-up for very long strings; you are rarely asked to code them.')

P(68, 'text-justification', 'Text Justification', 'Hard', 'arrays', 'Simulation',
  hook='Lay out words into lines of exactly <code>maxWidth</code> characters, spreading extra spaces as evenly as possible (extra ones go to the left gaps). The last line is left-aligned.',
  brute='There is no clever trick: this is careful simulation. The challenge is getting the details right.',
  insight='Work one line at a time. Greedily take as many words as fit with single spaces. Then distribute <code>maxWidth − letters</code> spaces over the gaps: <code>divmod(spaces, gaps)</code> gives the base width and how many left gaps get one extra.',
  steps=['From word <code>i</code>, add words while <code>letters + len(word) + gaps_needed ≤ maxWidth</code>.',
         'If it is the last line or has one word: join with single spaces and pad the right.',
         'Otherwise <code>each, extra = divmod(maxWidth − letters, gaps)</code>; the first <code>extra</code> gaps get <code>each + 1</code> spaces.',
         'Continue from the next unused word.'],
  code=r'''
class Solution:
    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
        lines, i = [], 0
        while i < len(words):
            j, letters = i, 0
            while j < len(words) and letters + len(words[j]) + (j - i) <= maxWidth:
                letters += len(words[j])
                j += 1
            line_words = words[i:j]
            gaps = j - i - 1
            if j == len(words) or gaps == 0:          # last line / single word
                line = " ".join(line_words)
                line += " " * (maxWidth - len(line))
            else:
                each, extra = divmod(maxWidth - letters, gaps)
                line = ""
                for k, w in enumerate(line_words[:-1]):
                    line += w + " " * (each + (1 if k < extra else 0))
                line += line_words[-1]
            lines.append(line)
            i = j
        return lines
''',
  time='O(n)', space='O(n)', why='n is the total number of characters across all words.',
  run='Solution().fullJustify(["This", "is", "an", "example", "of", "text", "justification."], 16)',
  expect="['This    is    an', 'example  of text', 'justification.  ']",
  tests=[('Solution().fullJustify(["What", "must", "be", "acknowledgment", "shall", "be"], 16)', "['What   must   be', 'acknowledgment  ', 'shall be        ']")],
  tip='Break it into helpers out loud: "pick words for a line", "justify a full line", "left-justify the last line". Interviewers grade the structure.')

P(36, 'valid-sudoku', 'Valid Sudoku', 'Medium', 'hashing', 'Hash sets',
  hook='Check whether a partly filled 9×9 Sudoku has no repeated digit in any row, column or 3×3 box. Empty cells are ".".',
  brute='Check each row, then each column, then each box separately: 27 passes. Fine, but one pass is cleaner.',
  insight='Keep a set per row, per column and per box. The box of cell (r, c) is <code>(r // 3) * 3 + c // 3</code>. A digit already in any of its three sets is a repeat.',
  steps=['Create 9 sets each for rows, columns and boxes.',
         'For every filled cell, compute its box index.',
         'If the digit is already in its row, column or box set, return False.',
         'Otherwise add it to all three sets. If the scan ends, the board is valid.'],
  code=r'''
class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        for r in range(9):
            for c in range(9):
                v = board[r][c]
                if v == ".":
                    continue
                b = (r // 3) * 3 + c // 3        # which 3x3 box
                if v in rows[r] or v in cols[c] or v in boxes[b]:
                    return False
                rows[r].add(v)
                cols[c].add(v)
                boxes[b].add(v)
        return True
''',
  time='O(1)', space='O(1)', why='The board is always 9×9, so the work is constant (81 cells).',
  run='Solution().isValidSudoku(' + SUDOKU + ')', expect='True',
  tests=[('b = ' + SUDOKU + '\nb[0][0] = "8"\nSolution().isValidSudoku(b)', 'False')],
  tip='Only validity of the filled cells is asked, not whether the puzzle is solvable. Say so: it shows you read carefully.')

P(54, 'spiral-matrix', 'Spiral Matrix', 'Medium', 'arrays', 'Shrinking boundaries',
  hook='Return all elements of a matrix in clockwise spiral order.',
  brute='Walk with a direction and a visited grid, turning right when blocked. Works with O(m·n) extra space.',
  insight='Keep four boundaries: <code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>. Walk the top row, right column, bottom row, left column, and shrink the boundary you just finished. Check the boundaries before the bottom and left walks, since a single remaining row or column must not be read twice.',
  steps=['Read the top row left→right, then <code>top += 1</code>.',
         'Read the right column top→bottom, then <code>right -= 1</code>.',
         'If rows remain, read the bottom row right→left, then <code>bottom -= 1</code>.',
         'If columns remain, read the left column bottom→top, then <code>left += 1</code>.',
         'Repeat while <code>top ≤ bottom</code> and <code>left ≤ right</code>.'],
  code=r'''
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        out = []
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1
        while top <= bottom and left <= right:
            for c in range(left, right + 1):           # top row
                out.append(matrix[top][c])
            top += 1
            for r in range(top, bottom + 1):           # right column
                out.append(matrix[r][right])
            right -= 1
            if top <= bottom:
                for c in range(right, left - 1, -1):   # bottom row
                    out.append(matrix[bottom][c])
                bottom -= 1
            if left <= right:
                for r in range(bottom, top - 1, -1):   # left column
                    out.append(matrix[r][left])
                left += 1
        return out
''',
  time='O(m·n)', space='O(1)', why='Besides the output list.',
  run='Solution().spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]])', expect='[1, 2, 3, 6, 9, 8, 7, 4, 5]',
  tests=[('Solution().spiralOrder([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])', '[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]'), ('Solution().spiralOrder([[7], [9], [6]])', '[7, 9, 6]')])

P(48, 'rotate-image', 'Rotate Image', 'Medium', 'arrays', 'Transpose + reverse',
  hook='Rotate an n×n matrix 90° clockwise, in place.',
  brute='Build a new matrix with <code>new[c][n − 1 − r] = old[r][c]</code>: easy, but uses O(n²) extra space.',
  insight='A clockwise rotation equals a <b>transpose</b> (swap across the main diagonal, rows become columns) followed by <b>reversing each row</b>. Both steps are easy to do in place.',
  steps=['Transpose: for every <code>r</code> and every <code>c &gt; r</code>, swap <code>matrix[r][c]</code> and <code>matrix[c][r]</code>.',
         'Reverse every row.'],
  code=r'''
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        for r in range(n):                    # 1. transpose
            for c in range(r + 1, n):
                matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
        for row in matrix:                    # 2. mirror left-right
            row.reverse()
''',
  time='O(n²)', space='O(1)',
  run='''
m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
Solution().rotate(m)
m
''', expect='[[7, 4, 1], [8, 5, 2], [9, 6, 3]]',
  tests=[('m = [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]\nSolution().rotate(m)\nm', '[[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]')],
  tip='Only swap with <code>c &gt; r</code> in the transpose. Swapping every pair swaps each one twice and undoes it.')

P(73, 'set-matrix-zeroes', 'Set Matrix Zeroes', 'Medium', 'arrays', 'In-place markers',
  hook='If a cell is 0, set its whole row and column to 0. Do it in place.',
  brute='Record the zero rows and columns in two sets (O(m + n) space), then zero them. Good answer; the follow-up asks for O(1) space.',
  insight='Use the <b>first row and first column as the marker sets</b>. First remember whether row 0 and column 0 themselves contain a zero, then mark, then fill the inner cells, and finally zero row 0 / column 0 if needed.',
  steps=['Remember whether the first row and first column contain a 0.',
         'For each inner cell that is 0, set <code>matrix[r][0] = 0</code> and <code>matrix[0][c] = 0</code>.',
         'For each inner cell, zero it if its row marker or column marker is 0.',
         'Finally zero the first row / first column if they originally had a 0.'],
  code=r'''
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        rows, cols = len(matrix), len(matrix[0])
        first_row_zero = any(matrix[0][c] == 0 for c in range(cols))
        first_col_zero = any(matrix[r][0] == 0 for r in range(rows))
        for r in range(1, rows):                  # mark
            for c in range(1, cols):
                if matrix[r][c] == 0:
                    matrix[r][0] = 0
                    matrix[0][c] = 0
        for r in range(1, rows):                  # fill from the marks
            for c in range(1, cols):
                if matrix[r][0] == 0 or matrix[0][c] == 0:
                    matrix[r][c] = 0
        if first_row_zero:
            for c in range(cols):
                matrix[0][c] = 0
        if first_col_zero:
            for r in range(rows):
                matrix[r][0] = 0
''',
  time='O(m·n)', space='O(1)',
  run='''
m = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
Solution().setZeroes(m)
m
''', expect='[[1, 0, 1], [0, 0, 0], [1, 0, 1]]',
  tests=[('m = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]\nSolution().setZeroes(m)\nm', '[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]')],
  tip='Give the O(m + n) set solution first. Then explain that the first row and column can store those same marks.')

P(289, 'game-of-life', 'Game of Life', 'Medium', 'bits', 'In-place state encoding',
  hook='Compute the next state of Conway\'s Game of Life on a board of 0s and 1s, in place. Every cell updates at the same moment.',
  brute='Copy the board and compute each new cell from the copy: O(m·n) extra space.',
  insight='Store two states in one integer. <b>Bit 0</b> is the current state (used when counting neighbours); <b>bit 1</b> is the next state. After all cells are decided, shift right by 1 so the next state becomes the current state.',
  steps=['For each cell count live neighbours using <code>board[nr][nc] &amp; 1</code> (the current state only).',
         'Live cell with 2 or 3 live neighbours, or dead cell with exactly 3: set bit 1 (<code>|= 2</code>).',
         'After the scan, do <code>board[r][c] &gt;&gt;= 1</code> for every cell.'],
  code=r'''
class Solution:
    def gameOfLife(self, board: List[List[int]]) -> None:
        rows, cols = len(board), len(board[0])
        for r in range(rows):
            for c in range(cols):
                live = 0
                for dr in (-1, 0, 1):
                    for dc in (-1, 0, 1):
                        if (dr or dc) and 0 <= r + dr < rows and 0 <= c + dc < cols:
                            live += board[r + dr][c + dc] & 1     # current state
                alive = board[r][c] & 1
                if (alive and live in (2, 3)) or (not alive and live == 3):
                    board[r][c] |= 2                              # next state = alive
        for r in range(rows):
            for c in range(cols):
                board[r][c] >>= 1
''',
  time='O(m·n)', space='O(1)',
  run='''
b = [[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]
Solution().gameOfLife(b)
b
''', expect='[[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]',
  tests=[('b = [[1, 1], [1, 0]]\nSolution().gameOfLife(b)\nb', '[[1, 1], [1, 1]]')],
  tip='The same "encode old and new state together" trick shows up whenever an in-place update must read the old values.')

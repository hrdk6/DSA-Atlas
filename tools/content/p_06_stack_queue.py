from _base import P

P(2390, 'removing-stars-from-a-string', 'Removing Stars From a String', 'Medium', 'stackqueue', 'Stack',
  hook='Each <code>*</code> deletes itself and the closest non-star character to its left. Return the final string.',
  brute='Find a star, delete it and the letter before it by rebuilding the string, repeat: O(n²).',
  insight='"Delete the most recent letter" is exactly a stack pop. Push letters; on a star, pop.',
  steps=['For each character: if it is <code>*</code>, pop the stack; otherwise push it.',
         'Join the stack.'],
  code=r'''
class Solution:
    def removeStars(self, s: str) -> str:
        stack = []
        for ch in s:
            if ch == "*":
                stack.pop()          # remove the closest letter to the left
            else:
                stack.append(ch)
        return "".join(stack)
''',
  time='O(n)', space='O(n)',
  run='Solution().removeStars("leet**cod*e")', expect="'lecoe'",
  tests=[('Solution().removeStars("erase*****")', "''")],
  tip='The problem guarantees every star has a letter to delete, so no empty-stack check is needed. Say that you noticed it.')

P(735, 'asteroid-collision', 'Asteroid Collision', 'Medium', 'stackqueue', 'Stack',
  hook='Asteroids move right (positive) or left (negative) with speed = absolute value. When two meet, the smaller explodes; equal ones both explode. What remains?',
  brute='Simulate step by step in time: slow and fiddly.',
  insight='Only a <b>left-moving</b> asteroid meeting a <b>right-moving</b> one <i>before</i> it collides. Keep survivors on a stack; a new negative asteroid fights the positive asteroids on top of the stack until it dies or the stack has no positive on top.',
  steps=['For each asteroid <code>a</code>, assume it survives.',
         'While <code>a &lt; 0</code> and the top of the stack is positive: if the top is smaller, pop it and keep fighting; if equal, pop it and <code>a</code> dies; if bigger, <code>a</code> dies.',
         'If <code>a</code> survived, push it.'],
  code=r'''
class Solution:
    def asteroidCollision(self, asteroids: List[int]) -> List[int]:
        stack = []
        for a in asteroids:
            alive = True
            while alive and a < 0 and stack and stack[-1] > 0:
                if stack[-1] < -a:
                    stack.pop()          # the right-mover explodes; keep going
                    continue
                if stack[-1] == -a:
                    stack.pop()          # both explode
                alive = False            # a explodes
            if alive:
                stack.append(a)
        return stack
''',
  time='O(n)', space='O(n)', why='Each asteroid is pushed and popped at most once.',
  run='Solution().asteroidCollision([10, 2, -5])', expect='[10]',
  tests=[('Solution().asteroidCollision([5, 10, -5])', '[5, 10]'), ('Solution().asteroidCollision([8, -8])', '[]'), ('Solution().asteroidCollision([-2, -1, 1, 2])', '[-2, -1, 1, 2]')],
  tip='Point out that [-2, 1] never collide: the left-mover is already to the left of the right-mover.')

P(394, 'decode-string', 'Decode String', 'Medium', 'stackqueue', 'Stack',
  hook='Expand <code>k[text]</code> into <code>text</code> repeated k times, with nesting: "3[a2[c]]" → "accaccacc".',
  brute='Repeatedly find the innermost brackets and expand them with string replacement: O(n²) or worse, and tricky with multi-digit numbers.',
  insight='Nested brackets → stack. On <code>[</code>, save the text built so far and the repeat count, then start a fresh piece. On <code>]</code>, pop and combine: <code>saved_text + piece × count</code>.',
  steps=['Track <code>cur</code> (text being built) and <code>num</code> (digits read so far).',
         'Digit: <code>num = num × 10 + digit</code>. Letter: append to <code>cur</code>.',
         '<code>[</code>: push <code>(cur, num)</code>, reset both.',
         '<code>]</code>: pop <code>(prev, k)</code>; <code>cur = prev + cur × k</code>.'],
  code=r'''
class Solution:
    def decodeString(self, s: str) -> str:
        stack = []                    # (text before "[", repeat count)
        cur, num = "", 0
        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)
            elif ch == "[":
                stack.append((cur, num))
                cur, num = "", 0
            elif ch == "]":
                prev, k = stack.pop()
                cur = prev + cur * k
            else:
                cur += ch
        return cur
''',
  time='O(output)', space='O(output)', why='Proportional to the length of the decoded string.',
  run='Solution().decodeString("3[a2[c]]")', expect="'accaccacc'",
  tests=[('Solution().decodeString("3[a]2[bc]")', "'aaabcbc'"), ('Solution().decodeString("2[abc]3[cd]ef")', "'abcabccdcdcdef'"), ('Solution().decodeString("10[a]")', "'aaaaaaaaaa'")],
  tip='Multi-digit counts ("10[a]") are the classic miss. Build the number digit by digit.')

P(933, 'number-of-recent-calls', 'Number of Recent Calls', 'Easy', 'stackqueue', 'Queue',
  hook='<code>ping(t)</code> records a request at time t (times only increase) and returns how many requests happened in <code>[t − 3000, t]</code>.',
  brute='Store every time and count the recent ones on each ping: O(n) per ping.',
  insight='Old requests never become recent again, and they are always the earliest ones. Keep a queue: append the new time, pop from the front while it is older than <code>t − 3000</code>; the queue length is the answer.',
  steps=['Append <code>t</code> to a deque.',
         'While the front is &lt; <code>t − 3000</code>, popleft.',
         'Return the deque length.'],
  code=r'''
class RecentCounter:
    def __init__(self):
        self.q = deque()

    def ping(self, t: int) -> int:
        self.q.append(t)
        while self.q[0] < t - 3000:       # too old: drop from the front
            self.q.popleft()
        return len(self.q)
''',
  time='O(1)', space='O(n)', why='Amortized: each time is added and removed once.',
  run='''
rc = RecentCounter()
[rc.ping(t) for t in [1, 100, 3001, 3002]]
''', expect='[1, 2, 3, 3]')

P(649, 'dota2-senate', 'Dota2 Senate', 'Medium', 'stackqueue', 'Queue',
  hook='Senators from two parties (R and D) act in order, round after round. Each can ban one opponent. Banned senators lose their turns. Which party wins?',
  brute='Simulate rounds on the string, letting each senator ban the next opponent: O(n²).',
  insight='Keep one queue of turn positions per party. Compare the two front senators: the earlier one acts first and bans the other. The winner goes to the back of its queue with position <code>+ n</code> (they act again next round).',
  steps=['Queues of indices for R and for D.',
         'Pop the front of each; the smaller index wins.',
         'Re-queue the winner at <code>index + n</code>; the loser is gone.',
         'When a queue empties, the other party wins.'],
  code=r'''
class Solution:
    def predictPartyVictory(self, senate: str) -> str:
        n = len(senate)
        radiant = deque(i for i, s in enumerate(senate) if s == "R")
        dire = deque(i for i, s in enumerate(senate) if s == "D")
        while radiant and dire:
            r, d = radiant.popleft(), dire.popleft()
            if r < d:                    # R acts first and bans this D
                radiant.append(r + n)    # R acts again next round
            else:
                dire.append(d + n)
        return "Radiant" if radiant else "Dire"
''',
  time='O(n)', space='O(n)',
  run='Solution().predictPartyVictory("RDD")', expect="'Dire'",
  tests=[('Solution().predictPartyVictory("RD")', "'Radiant'"), ('Solution().predictPartyVictory("DDRRR")', "'Dire'")],
  tip='Greedy insight: banning the very next opponent in turn order is always best, because that opponent would act soonest.')

P(739, 'daily-temperatures', 'Daily Temperatures', 'Medium', 'monotonic-stack', 'Monotonic stack',
  hook='For each day, how many days until a warmer temperature? (0 if never.)',
  brute='For each day scan forward for a warmer day: O(n²).',
  insight='Keep a stack of days still <b>waiting</b> for a warmer day; their temperatures decrease from bottom to top. A warmer day answers every colder day on top of the stack: pop them and record the distance.',
  steps=['<code>answer = [0] * n</code>; empty stack of indices.',
         'For each day <code>i</code>: while the top day is colder than today, pop it as <code>j</code> and set <code>answer[j] = i − j</code>.',
         'Push <code>i</code>.'],
  code=r'''
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        answer = [0] * len(temperatures)
        stack = []                        # indices waiting for a warmer day
        for i, t in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < t:
                j = stack.pop()
                answer[j] = i - j
            stack.append(i)
        return answer
''',
  time='O(n)', space='O(n)', why='Each index is pushed once and popped at most once.',
  run='Solution().dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73])', expect='[1, 1, 4, 2, 1, 1, 0, 0]',
  tests=[('Solution().dailyTemperatures([30, 40, 50, 60])', '[1, 1, 1, 0]')])

P(901, 'online-stock-span', 'Online Stock Span', 'Medium', 'monotonic-stack', 'Monotonic stack',
  hook='Prices arrive one per day. For each, return the span: how many consecutive days, ending today, had a price ≤ today\'s.',
  brute='Walk back through all previous prices each day: O(n) per call.',
  insight='Store <code>(price, span)</code> pairs with prices decreasing. When a new price arrives, absorb every smaller-or-equal day on top: their spans are already counted, so add them and pop.',
  steps=['Start <code>span = 1</code> (today).',
         'While the top price ≤ today\'s, pop it and add its span.',
         'Push <code>(price, span)</code> and return <code>span</code>.'],
  code=r'''
class StockSpanner:
    def __init__(self):
        self.stack = []                   # (price, span), prices decreasing

    def next(self, price: int) -> int:
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]   # absorb the smaller days
        self.stack.append((price, span))
        return span
''',
  time='O(1)', space='O(n)', why='Amortized: each price is pushed and popped once.',
  run='''
s = StockSpanner()
[s.next(p) for p in [100, 80, 60, 70, 60, 75, 85]]
''', expect='[1, 1, 1, 2, 1, 4, 6]')

P(20, 'valid-parentheses', 'Valid Parentheses', 'Easy', 'stackqueue', 'Stack',
  hook='Is every bracket closed by the right type, in the right order?',
  brute='Repeatedly delete "()", "[]", "{}" pairs until nothing changes: O(n²).',
  insight='The most recently opened bracket must be closed first: a stack. Push openers; each closer must match the top of the stack.',
  steps=['Map each closer to its opener.',
         'Opener: push. Closer: if the stack is empty or the top doesn\'t match, return False; else pop.',
         'At the end the stack must be empty.'],
  code=r'''
class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {")": "(", "]": "[", "}": "{"}
        stack = []
        for ch in s:
            if ch in pairs:
                if not stack or stack[-1] != pairs[ch]:
                    return False
                stack.pop()
            else:
                stack.append(ch)
        return not stack
''',
  time='O(n)', space='O(n)',
  run='Solution().isValid("{[()]}()")', expect='True',
  tests=[('Solution().isValid("(]")', 'False'), ('Solution().isValid("([)]")', 'False'), ('Solution().isValid("(")', 'False'), ('Solution().isValid("()[]{}")', 'True')],
  tip='Two easy-to-miss cases: a closer when the stack is empty ("]") and leftover openers at the end ("(").')

P(71, 'simplify-path', 'Simplify Path', 'Medium', 'stackqueue', 'Stack',
  hook='Simplify a Unix path: handle ".", "..", repeated slashes, and a trailing slash.',
  brute='Repeated string replacements break on edge cases like "..." (a valid folder name).',
  insight='Split on "/" and process the parts with a stack of folder names: ".." pops (go up), empty strings and "." are ignored, anything else is a folder to push.',
  steps=['Split the path by "/".',
         'For each part: ".." → pop if possible; "" or "." → skip; otherwise push.',
         'Return "/" + "/".join(stack).'],
  code=r'''
class Solution:
    def simplifyPath(self, path: str) -> str:
        stack = []
        for part in path.split("/"):
            if part == "..":
                if stack:
                    stack.pop()            # up one directory
            elif part and part != ".":
                stack.append(part)         # a real folder name
        return "/" + "/".join(stack)
''',
  time='O(n)', space='O(n)',
  run='Solution().simplifyPath("/home/user/Documents/../Pictures")', expect="'/home/user/Pictures'",
  tests=[('Solution().simplifyPath("/../")', "'/'"), ('Solution().simplifyPath("/home//foo/")', "'/home/foo'"), ('Solution().simplifyPath("/.../a/../b/c/../d/./")', "'/.../b/d'")])

P(155, 'min-stack', 'Min Stack', 'Medium', 'stackqueue', 'Stack design',
  hook='Design a stack with <code>push</code>, <code>pop</code>, <code>top</code> and <code>getMin</code>, all in O(1).',
  brute='Scan the whole stack for the minimum on each <code>getMin</code>: O(n).',
  insight='Store, with each element, the minimum of the stack <b>at the moment it was pushed</b>. Popping restores the previous minimum automatically, because it is stored in the element below.',
  steps=['Push <code>(val, min(val, current_min))</code>.',
         '<code>top</code> reads the value of the last pair; <code>getMin</code> reads its minimum.',
         '<code>pop</code> just pops.'],
  code=r'''
class MinStack:
    def __init__(self):
        self.stack = []          # (value, minimum at that point)

    def push(self, val: int) -> None:
        current_min = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, current_min))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]
''',
  time='O(1)', space='O(n)',
  run='''
ms = MinStack()
ms.push(-2)
ms.push(0)
ms.push(-3)
out = [ms.getMin()]
ms.pop()
out + [ms.top(), ms.getMin()]
''', expect='[-3, 0, -2]')

P(150, 'evaluate-reverse-polish-notation', 'Evaluate Reverse Polish Notation', 'Medium', 'stackqueue', 'Stack',
  hook='Evaluate an expression in postfix form: operators come after their operands, e.g. ["2", "1", "+", "3", "*"] = (2 + 1) × 3.',
  brute='There is no simpler approach: RPN is designed to be evaluated with a stack.',
  insight='Numbers go on a stack. An operator pops the top two numbers (the <b>second</b> pop is the left operand), applies itself, and pushes the result.',
  steps=['Number → push.',
         'Operator → <code>b = pop()</code>, <code>a = pop()</code>, push <code>a op b</code>.',
         'Division truncates toward zero: <code>int(a / b)</code>.',
         'The final stack holds the answer.'],
  code=r'''
class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = []
        for tok in tokens:
            if tok in ("+", "-", "*", "/"):
                b = stack.pop()          # right operand
                a = stack.pop()          # left operand
                if tok == "+":
                    stack.append(a + b)
                elif tok == "-":
                    stack.append(a - b)
                elif tok == "*":
                    stack.append(a * b)
                else:
                    stack.append(int(a / b))   # truncate toward zero
            else:
                stack.append(int(tok))
        return stack[0]
''',
  time='O(n)', space='O(n)',
  run='Solution().evalRPN(["4", "13", "5", "/", "+"])', expect='6',
  tests=[('Solution().evalRPN(["2", "1", "+", "3", "*"])', '9'), ('Solution().evalRPN(["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"])', '22')],
  tip='In Python <code>-7 // 2 == -4</code> (floors), but the problem wants truncation toward zero (−3). <code>int(a / b)</code> does that.')

P(224, 'basic-calculator', 'Basic Calculator', 'Hard', 'stackqueue', 'Stack',
  hook='Evaluate a string with integers, <code>+</code>, <code>-</code>, parentheses and spaces (no <code>eval</code>!).',
  brute='Recursive descent parsing works too, but needs care. The stack version is shorter.',
  insight='Without parentheses, keep a running <code>result</code> and the <code>sign</code> of the next number. A <code>(</code> starts a sub-expression: push the current <code>(result, sign)</code> and start fresh. At <code>)</code>, finish the inner result and combine: <code>outer + sign × inner</code>.',
  steps=['Digits build <code>num</code>.',
         '<code>+</code>/<code>-</code>: add <code>sign × num</code> to result, reset num, set the new sign.',
         '<code>(</code>: push (result, sign); reset result = 0, sign = +1.',
         '<code>)</code>: finish the inner result, pop (prev, s): <code>result = prev + s × result</code>.',
         'At the end add the last number.'],
  code=r'''
class Solution:
    def calculate(self, s: str) -> int:
        result, num, sign = 0, 0, 1
        stack = []                      # (result, sign) saved before each "("
        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)
            elif ch in "+-":
                result += sign * num    # finish the previous number
                num = 0
                sign = 1 if ch == "+" else -1
            elif ch == "(":
                stack.append((result, sign))
                result, sign = 0, 1
            elif ch == ")":
                result += sign * num
                num = 0
                prev_result, prev_sign = stack.pop()
                result = prev_result + prev_sign * result
        return result + sign * num
''',
  time='O(n)', space='O(n)',
  run='Solution().calculate("(1+(4+5+2)-3)+(6+8)")', expect='23',
  tests=[('Solution().calculate(" 2-1 + 2 ")', '3'), ('Solution().calculate("-(2+3)")', '-5'), ('Solution().calculate("1-(     -2)")', '3')],
  tip='Walk through "-(2+3)" in the interview: the unary minus works because it just sets sign = −1 before the parenthesis.')

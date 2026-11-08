/* Chapters: Big-O, the Python toolkit, recursion. */
(function () {
  const { h, sub, p, analogy, tip, warn, interview, key, note, code, template, table, steps, list, grid, quiz, problems, widget } = DSA.L;
  const py = String.raw;
  const cx = (s) => DSA.cx(s);

  DSA.addLesson({
    id: 'bigo', group: 'Foundations', title: 'Big-O: how fast is your code?', short: 'Big-O complexity', level: 'Beginner', minutes: 20,
    blurb: 'Count the steps, keep the biggest term. The language every interviewer uses to judge a solution.',
    summary: 'Big-O describes how the running time (or memory) of code grows as the input gets bigger. It is how you compare two solutions without running them, and you will be asked for it in every interview.',
    sections: [
      h('Why we need it'),
      p('Suppose you need to find a name in a phone book with 1,000,000 names. Reading page by page might take a million looks. Opening the middle, deciding which half the name is in, and repeating takes about <strong>20 looks</strong>. Both "work". One of them is useless at scale.'),
      p('Big-O ignores the speed of your laptop and asks one question: <strong>if the input doubles, what happens to the amount of work?</strong>'),
      analogy('Big-O is like the fuel consumption class of a car, not the exact litres. It tells you how cost scales with distance. Whether the tank is a bit bigger (a constant factor) doesn\'t change the class.'),
      h('Counting steps'),
      p('Count how many times the most frequent operation runs, as a function of the input size <code>n</code>. Then keep only the fastest-growing term and drop constant factors.'),
      code(py`
        def total(nums):
            s = 0                 # 1 step
            for x in nums:        # runs n times
                s += x            # 1 step each → n steps
            return s              # 1 step
        # n + 2 steps → O(n)
      `, { title: 'linear.py', run: 'total([4, 1, 3])', expect: '8' }),
      code(py`
        def has_duplicate(nums):
            n = len(nums)
            for i in range(n):            # n times
                for j in range(i + 1, n): # up to n times each
                    if nums[i] == nums[j]:
                        return True
            return False
        # about n²/2 comparisons → O(n²)
      `, { title: 'quadratic.py', run: 'has_duplicate([3, 1, 4, 1, 5])', expect: 'True' }),
      key('Rules of thumb: steps <b>in sequence add</b> (O(n) + O(n) = O(n)). Loops <b>inside</b> loops <b>multiply</b> (O(n) × O(n) = O(n²)). A loop that <b>halves</b> its range each time is O(log n).'),
      h('The common complexities'),
      table(['Big-O', 'Name', 'Typical example'], [
        [cx('O(1)'), 'constant', 'dict lookup, <code>nums[i]</code>, <code>append</code>'],
        [cx('O(log n)'), 'logarithmic', 'binary search, heap push/pop'],
        [cx('O(n)'), 'linear', 'one loop over the input'],
        [cx('O(n log n)'), 'linearithmic', '<code>sorted()</code>, merge sort'],
        [cx('O(n²)'), 'quadratic', 'all pairs: two nested loops'],
        [cx('O(2ⁿ)'), 'exponential', 'all subsets, naive recursive Fibonacci'],
        [cx('O(n!)'), 'factorial', 'all orderings (permutations)'],
      ]),
      widget('bigO', { title: 'Watch the curves pull apart' }),
      h('Why we drop constants'),
      p('<code>3n + 50</code> and <code>n</code> are both O(n): double the input and the work roughly doubles. But O(n²) vs O(n) is a different <i>shape</i>. At n = 100,000, n² is ten billion operations while n is a hundred thousand. No constant factor rescues the quadratic version.'),
      h('Logarithms without fear'),
      p('<code>log₂ n</code> answers: "how many times can I halve n before reaching 1?" For n = 1,000,000 that\'s about 20. Any loop of the form <code>while n &gt; 1: n //= 2</code> runs O(log n) times.'),
      code(py`
        def halvings(n):
            count = 0
            while n > 1:
                n //= 2        # cut the problem in half
                count += 1
            return count
      `, { title: 'log.py', run: 'halvings(1_000_000)', expect: '19' }),
      h('Space complexity'),
      p('The same idea applied to <strong>extra memory</strong>. A loop with a couple of variables is O(1) space. Building a new list or dictionary of n items is O(n). Recursion also uses memory: each call waiting on the stack takes space, so recursion depth d costs O(d).'),
      h('Amortized O(1): why append is cheap'),
      p('A Python list keeps some spare capacity. Most <code>append</code>s just fill the next slot. Occasionally the list is full, and Python copies everything into a bigger block: that one append is O(n). Because the block grows proportionally, the copies are rare, and the <i>average</i> cost per append stays O(1). That is called <strong>amortized</strong> O(1). The array chapter animates this.'),
      h('Read the constraints to guess the target'),
      p('LeetCode problems state input limits. Python does roughly 10 million simple operations per second, so the limits tell you what complexity the intended solution has:'),
      table(['Input size n', 'Target complexity', 'Likely approach'], [
        ['n ≤ 10', 'O(n!)', 'try all permutations'],
        ['n ≤ 20', 'O(2ⁿ)', 'backtracking over subsets'],
        ['n ≤ 500', 'O(n³)', 'triple loop, interval DP'],
        ['n ≤ 5,000', 'O(n²)', 'nested loops, 2D DP'],
        ['n ≤ 10⁵ to 10⁶', 'O(n log n) or O(n)', 'sorting, two pointers, hash maps, heaps'],
        ['n ≥ 10⁹', 'O(log n) or O(1)', 'binary search, math'],
      ]),
      interview('When you state complexity, name the variable: "O(n) time where n is the length of the list, O(k) space for the window." With two inputs, keep both: O(m + n), O(m × n).'),
      warn('Hidden loops count. <code>x in some_list</code> is O(n). Slicing <code>nums[a:b]</code> copies b − a items. <code>s1 + s2</code> on strings copies both. Inside a loop these turn O(n) into O(n²).'),
      quiz([
        { q: 'What is the time complexity of a loop over n items that, inside, does a dictionary lookup?', opts: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'], a: 1, why: 'n iterations × O(1) per lookup = O(n).' },
        { q: 'A loop runs <code>while n &gt; 0: n //= 3</code>. Its complexity?', opts: ['O(n)', 'O(n/3)', 'O(log n)', 'O(1)'], a: 2, why: 'Dividing by any constant each time gives a logarithmic number of steps.' },
        { q: 'n can be 100,000. Is an O(n²) solution likely to pass?', opts: ['Yes', 'No'], a: 1, why: '10¹⁰ operations is far too many. Aim for O(n log n) or better.' },
        { q: 'Which costs O(n), not O(1)?', opts: ['<code>d[key]</code> on a dict', '<code>nums.append(x)</code>', '<code>x in nums</code> on a list', '<code>nums[-1]</code>'], a: 2, why: 'Membership in a list scans it. Use a set for O(1) membership.' },
      ]),
    ],
  });

  DSA.addLesson({
    id: 'python', group: 'Foundations', title: 'The Python toolkit for DSA', short: 'Python toolkit', level: 'Beginner', minutes: 25,
    blurb: 'Lists, dicts, sets, deque, heapq, bisect, Counter: what each costs and when to reach for it.',
    summary: 'Python ships with most data structures you need in interviews. Knowing exactly what each operation costs, and the handful of traps, is half the battle.',
    sections: [
      h('Lists (dynamic arrays)'),
      table(['Operation', 'Cost', 'Note'], [
        ['<code>a[i]</code>, <code>a[i] = x</code>', cx('O(1)'), 'jump straight to the slot'],
        ['<code>a.append(x)</code>, <code>a.pop()</code>', cx('O(1)'), 'end of the list (append is amortized)'],
        ['<code>a.insert(0, x)</code>, <code>a.pop(0)</code>', cx('O(n)'), 'everything shifts. Use <code>deque</code> instead'],
        ['<code>x in a</code>, <code>a.index(x)</code>, <code>a.count(x)</code>', cx('O(n)'), 'scans the list'],
        ['<code>a[i:j]</code>', cx('O(k)'), 'copies k = j − i items'],
        ['<code>a.sort()</code>, <code>sorted(a)</code>', cx('O(n log n)'), 'Timsort, stable'],
        ['<code>a.reverse()</code>, <code>a[::-1]</code>', cx('O(n)'), ''],
      ]),
      code(py`
        nums = [5, 2, 9]
        nums.append(4)          # [5, 2, 9, 4]
        last = nums.pop()       # 4, nums is [5, 2, 9] again
        nums.sort()             # [2, 5, 9] in place
        both_ends = (nums[0], nums[-1])
        both_ends
      `, { title: 'lists.py', run: '', expect: null }),
      h('Strings are immutable'),
      p('You can\'t change a character in place: <code>s[0] = "x"</code> fails. Every "change" builds a new string. To build a string in a loop, collect pieces in a list and <code>"".join(pieces)</code> once at the end. Repeated <code>s += ch</code> can copy the whole string each time.'),
      code(py`
        def shout(words):
            parts = []
            for w in words:
                parts.append(w.upper())
            return " ".join(parts)
      `, { title: 'join.py', run: 'shout(["dsa", "in", "python"])', expect: "'DSA IN PYTHON'" }),
      list(['<code>ord("a")</code> → 97 and <code>chr(97)</code> → "a" convert between letters and numbers. <code>ord(c) - ord("a")</code> gives a 0–25 index.',
        '<code>c.isalnum()</code>, <code>c.isdigit()</code>, <code>c.lower()</code> are handy for cleaning input.',
        '<code>s[::-1]</code> reverses; <code>s.split()</code> splits on any run of spaces.']),
      h('Dictionaries and sets: O(1) lookups'),
      p('A <code>dict</code> maps keys to values; a <code>set</code> stores unique keys. Both use hashing (see the Hash maps chapter), so add, remove and lookup are <b>O(1) on average</b>. Keys must be immutable: strings, numbers, tuples. Not lists.'),
      code(py`
        from collections import Counter, defaultdict

        words = ["eat", "tea", "tan", "ate", "nat", "bat"]
        counts = Counter("mississippi")          # letter -> how many
        groups = defaultdict(list)               # missing keys start as []
        for w in words:
            groups["".join(sorted(w))].append(w) # anagrams share a sorted key
        (counts["s"], len(groups))
      `, { title: 'dicts.py', run: '', expect: null }),
      table(['Tool', 'Use it for'], [
        ['<code>d.get(k, 0)</code>', 'read with a default, no KeyError'],
        ['<code>Counter(iterable)</code>', 'frequency counts; <code>.most_common(k)</code>'],
        ['<code>defaultdict(list)</code>', 'grouping: <code>d[key].append(x)</code> without checking'],
        ['<code>set()</code>', '"have I seen this?" in O(1)'],
      ]),
      h('deque: a queue with O(1) at both ends'),
      code(py`
        from collections import deque
        q = deque([1, 2, 3])
        q.append(4)        # add to the right
        q.appendleft(0)    # add to the left
        first = q.popleft()  # 0, O(1), unlike list.pop(0)
        (first, list(q))
      `, { title: 'deque.py', run: '', expect: null }),
      h('heapq: always grab the smallest'),
      p('<code>heapq</code> turns a plain list into a <b>min-heap</b>: the smallest item is always at index 0. Push and pop are O(log n); <code>heapify</code> builds a heap from a list in O(n). For a max-heap, push negated values.'),
      code(py`
        import heapq
        h = []
        for x in [5, 1, 8, 3]:
            heapq.heappush(h, x)
        smallest = heapq.heappop(h)              # 1
        top2 = heapq.nlargest(2, [5, 1, 8, 3])   # [8, 5]
        maxheap = [-x for x in [5, 1, 8, 3]]
        heapq.heapify(maxheap)
        biggest = -maxheap[0]                    # 8
        (smallest, top2, biggest)
      `, { title: 'heapq_demo.py', run: '', expect: null }),
      h('bisect: binary search for free'),
      code(py`
        from bisect import bisect_left, bisect_right
        a = [1, 3, 3, 3, 7]
        (bisect_left(a, 3), bisect_right(a, 3), bisect_left(a, 4))
      `, { title: 'bisect_demo.py', run: '', expect: null }),
      p('<code>bisect_left(a, x)</code> is the first index where <code>a[i] ≥ x</code>; <code>bisect_right</code> the first where <code>a[i] &gt; x</code>. Both are O(log n) on a sorted list.'),
      h('Sorting with a key'),
      code(py`
        people = [("ana", 31), ("bo", 25), ("cy", 31)]
        by_age = sorted(people, key=lambda p: p[1])            # stable: ana before cy
        by_age_desc_name = sorted(people, key=lambda p: (-p[1], p[0]))
        (by_age[0][0], by_age_desc_name[0][0])
      `, { title: 'sorting.py', run: '', expect: null }),
      h('Small things that come up constantly'),
      list(['<code>float("inf")</code> / <code>-float("inf")</code> (or <code>math.inf</code>) as starting values for min/max.',
        '<code>//</code> is floor division; <code>%</code> is remainder; <code>divmod(a, b)</code> gives both. Careful: <code>-7 // 2 == -4</code> in Python.',
        'Python integers never overflow, so you don\'t need the <code>lo + (hi - lo) // 2</code> trick, though it doesn\'t hurt.',
        '<code>enumerate(nums)</code> gives (index, value); <code>zip(a, b)</code> walks two lists together.',
        '<code>@functools.cache</code> on a function memoizes it: instant dynamic programming.',
        'Recursion is limited to about 1,000 calls deep by default. Deep recursion on big inputs needs an iterative version (or <code>sys.setrecursionlimit</code>).']),
      h('Traps that cost people interviews'),
      sub('1. Building a grid with *'),
      code(py`
        grid = [[0] * 3] * 3      # WRONG: three references to the SAME row
        grid[0][0] = 1
        bad = grid[1][0]          # also 1!
        good = [[0] * 3 for _ in range(3)]   # three separate rows
        good[0][0] = 1
        (bad, good[1][0])
      `, { title: 'grid_trap.py', run: '', expect: null }),
      p('Press <b>Visualize</b> on the block above and look at <code>grid</code>: every row changes at once because they are one object.'),
      sub('2. Mutable default arguments'),
      p('<code>def f(path=[])</code> creates the list once and reuses it across calls. Use <code>path=None</code> and create the list inside.'),
      sub('3. Changing a list while looping over it'),
      p('Removing items from a list you are iterating over skips elements. Build a new list (or loop over a copy) instead.'),
      quiz([
        { q: 'You need a queue for BFS. Which is right?', opts: ['A list with <code>pop(0)</code>', '<code>collections.deque</code> with <code>popleft()</code>', 'A set', 'A string'], a: 1, why: '<code>pop(0)</code> shifts every element (O(n)); <code>popleft</code> is O(1).' },
        { q: 'How do you get a max-heap with <code>heapq</code>?', opts: ['<code>heapq.maxheap()</code>', 'Push negated values', 'Sort descending', 'Use <code>heapq.reverse</code>'], a: 1, why: 'heapq is min-only. Negate on the way in and on the way out.' },
        { q: 'Which of these can be a dict key?', opts: ['<code>[1, 2]</code>', '<code>{1, 2}</code>', '<code>(1, 2)</code>', '<code>{"a": 1}</code>'], a: 2, why: 'Keys must be hashable, i.e. immutable. Tuples are; lists, sets and dicts aren\'t.' },
      ]),
    ],
  });

  DSA.addLesson({
    id: 'recursion', group: 'Foundations', title: 'Recursion and the call stack', short: 'Recursion', level: 'Beginner', minutes: 20,
    blurb: 'Functions that call themselves: base cases, the call stack, and why memoization changes everything.',
    summary: 'Trees, graphs, backtracking and dynamic programming all lean on recursion. Once you can picture the call stack, those topics stop feeling like magic.',
    sections: [
      h('The idea'),
      p('A recursive function solves a problem by solving a <strong>smaller copy of the same problem</strong>, then using that answer. Every recursive function needs two parts:'),
      list(['<strong>Base case</strong>: a problem so small you answer it directly (no further calls).', '<strong>Recursive case</strong>: shrink the problem, call yourself, combine the result.']),
      analogy('Russian nesting dolls: to count the dolls, open one and count the dolls inside it (the same problem, smaller), then add one. The smallest doll, which doesn\'t open, is the base case.'),
      code(py`
        def factorial(n):
            if n <= 1:                 # base case
                return 1
            return n * factorial(n - 1)  # smaller problem, then combine
      `, { title: 'factorial.py', run: 'factorial(5)', expect: '120' }),
      p('Press <b>Visualize</b>: the <b>call stack</b> grows to <code>factorial()→factorial()→…</code> five deep, then unwinds as each call returns its answer to the caller waiting below it.'),
      h('The call stack'),
      p('Every call gets its own <strong>frame</strong>: its own copy of the local variables, and a bookmark of where to continue. A call that makes another call pauses until that inner call returns. The paused calls pile up like plates (a stack!), and the most recent one finishes first.'),
      key('The "leap of faith": when writing the recursive case, <b>assume the recursive call already works</b> for the smaller input. Don\'t trace it all the way down in your head. Just ask "if I had the answer for n − 1, how do I get the answer for n?"'),
      code(py`
        def reverse(s):
            if len(s) <= 1:
                return s
            return reverse(s[1:]) + s[0]   # trust it: reverse the rest, put first char last
      `, { title: 'reverse.py', run: 'reverse("stack")', expect: "'kcats'" }),
      h('When recursion explodes: Fibonacci'),
      p('<code>fib(n) = fib(n−1) + fib(n−2)</code>. Each call makes two more calls, so the call tree doubles at every level: about 2ⁿ calls. Most of them recompute values that were already computed: <code>fib(3)</code> is calculated again and again.'),
      widget('recursion', { opts: { mode: 'fib' }, title: 'fib(5): watch the repeated work, then switch memoization on' }),
      h('Memoization: remember answers'),
      p('Store each answer the first time you compute it; next time, return it instantly. That cuts Fibonacci from O(2ⁿ) to O(n). This idea, recursion plus a memory, <strong>is dynamic programming</strong> (top-down).'),
      code(py`
        from functools import cache

        @cache                     # remembers fib(k) for every k it has seen
        def fib(n):
            if n < 2:
                return n
            return fib(n - 1) + fib(n - 2)
      `, { title: 'fib_memo.py', run: 'fib(40)', expect: '102334155' }),
      tip('Without <code>@cache</code>, <code>fib(40)</code> makes over 300 million calls. With it, 41.'),
      h('A template for recursive problems'),
      template('recursion_template.py', py`
        def solve(problem):
            if is_tiny(problem):            # 1. base case(s)
                return direct_answer(problem)
            smaller = shrink(problem)       # 2. make it smaller
            sub_answer = solve(smaller)     # 3. trust the recursion
            return combine(problem, sub_answer)  # 4. build this answer
      `),
      h('Divide and conquer'),
      p('A special shape of recursion: split the problem into <i>halves</i>, solve each half recursively, combine. Merge sort, quick sort and many tree algorithms work this way. Splitting in half gives about log₂ n levels of recursion.'),
      code(py`
        def max_of(nums, lo, hi):
            if lo == hi:
                return nums[lo]
            mid = (lo + hi) // 2
            left = max_of(nums, lo, mid)        # biggest in the left half
            right = max_of(nums, mid + 1, hi)   # biggest in the right half
            return max(left, right)
      `, { title: 'divide.py', run: 'max_of([3, 8, 1, 9, 4, 2], 0, 5)', expect: '9' }),
      h('Recursion vs loops'),
      p('Anything recursive can be written with a loop and an explicit stack, and loops avoid Python\'s recursion limit (about 1,000 deep). Use recursion when the problem is naturally nested (trees, backtracking); switch to iteration for very deep inputs like a linked list of 100,000 nodes.'),
      warn('The two classic bugs: a missing or wrong base case (infinite recursion → <code>RecursionError</code>), and a recursive call that doesn\'t actually make the problem smaller.'),
      quiz([
        { q: 'What does each recursive call get its own copy of?', opts: ['The whole program', 'Its local variables (a stack frame)', 'Global variables', 'Nothing'], a: 1, why: 'Each call has its own frame with its own locals, which is why the same name can hold different values at different depths.' },
        { q: 'Naive recursive Fibonacci is O(2ⁿ). With memoization it becomes…', opts: ['O(2ⁿ)', 'O(n²)', 'O(n)', 'O(log n)'], a: 2, why: 'Each fib(k) is computed once; there are n distinct values.' },
        { q: 'Recursion depth of a function that halves its input each call?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], a: 1, why: 'Halving reaches size 1 after about log₂ n calls.' },
      ]),
      problems([104, 206, 50, 70, 17], 'Problems that build recursion muscle'),
    ],
  });
})();

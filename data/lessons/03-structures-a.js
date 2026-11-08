/* Chapters: arrays & strings, hash maps & sets, linked lists, stacks & queues. */
(function () {
  const { h, sub, p, analogy, tip, warn, interview, key, note, code, template, table, steps, list, grid, quiz, problems, widget, viz3d } = DSA.L;
  const py = String.raw;
  const cx = (s) => DSA.cx(s);

  DSA.addLesson({
    id: 'arrays', group: 'Data structures', title: 'Arrays & strings', short: 'Arrays & strings', level: 'Beginner', minutes: 25,
    blurb: 'Contiguous memory: instant indexing, expensive shifting. The base of most interview problems.',
    summary: 'An array stores items side by side in memory. That one fact explains everything about its costs: reading any position is instant, inserting in the middle is slow.',
    sections: [
      h('Side by side in memory'),
      p('An array is a single block of memory split into equal-sized slots. To read slot <code>i</code>, the computer calculates <code>start + i × slot_size</code> and jumps straight there. That is why <code>nums[i]</code> is O(1) no matter how big the list is.'),
      p('A Python <code>list</code> is a <strong>dynamic array</strong>: a block of slots that each hold a reference to an object, plus some spare room at the end so appends are cheap.'),
      analogy('A row of numbered lockers in a hallway. You can walk straight to locker 37. But to squeeze a new locker in at position 3, every locker after it has to move one step down the hall.'),
      viz3d('array', { caption: 'Try <b>Access</b> first (1 step), then <b>Insert at i</b> with index 0 (every element shifts). Append until the list is full to see a resize.' }),
      h('What each operation costs'),
      table(['Operation', 'Python', 'Cost', 'Why'], [
        ['Read / write by index', '<code>a[i]</code>', cx('O(1)'), 'address arithmetic'],
        ['Add / remove at the end', '<code>append</code>, <code>pop()</code>', cx('O(1)'), 'nothing shifts (append is amortized)'],
        ['Insert / remove at the front or middle', '<code>insert(i, x)</code>, <code>pop(i)</code>', cx('O(n)'), 'everything after i shifts'],
        ['Search for a value', '<code>x in a</code>', cx('O(n)'), 'must check each slot'],
        ['Search in a sorted array', '<code>bisect</code>', cx('O(log n)'), 'binary search'],
      ]),
      h('Strings'),
      p('A string is an array of characters, but in Python it is <strong>immutable</strong>. Convert to a list when you need to edit characters in place, then <code>"".join()</code> back. Problems often hide "array" techniques inside strings: two pointers for palindromes, sliding windows for substrings, counting with a 26-slot array or a <code>Counter</code>.'),
      code(py`
        def is_palindrome(s):
            l, r = 0, len(s) - 1
            while l < r:
                if s[l] != s[r]:
                    return False
                l += 1
                r -= 1
            return True
      `, { title: 'palindrome.py', run: 'is_palindrome("racecar")', expect: 'True' }),
      h('In-place tricks'),
      sub('Reverse a range'),
      p('Swapping from both ends towards the middle reverses any range in O(n) time with O(1) extra space. It is the building block for rotating an array:'),
      code(py`
        def rotate(nums, k):
            """Rotate right by k: [1,2,3,4,5,6,7], k=3 -> [5,6,7,1,2,3,4]"""
            def reverse(l, r):
                while l < r:
                    nums[l], nums[r] = nums[r], nums[l]
                    l += 1
                    r -= 1
            n = len(nums)
            k %= n
            reverse(0, n - 1)     # 7 6 5 4 3 2 1
            reverse(0, k - 1)     # 5 6 7 | 4 3 2 1
            reverse(k, n - 1)     # 5 6 7 | 1 2 3 4
            return nums
      `, { title: 'rotate.py', run: 'rotate([1, 2, 3, 4, 5, 6, 7], 3)', expect: '[5, 6, 7, 1, 2, 3, 4]' }),
      sub('Read and write pointers'),
      p('To filter a list in place, one index reads every element and another marks where the next kept element should be written. The kept prefix grows at the front. You will see this in Move Zeroes, Remove Element and Remove Duplicates.'),
      widget('array', { opts: { demo: 'moveZeroes' } }),
      h('2D arrays (matrices)'),
      p('A grid is a list of rows: <code>grid[r][c]</code>. The four neighbours of a cell are usually walked with a directions list. Always create rows with a comprehension (see the Python toolkit trap).'),
      code(py`
        def neighbours(grid, r, c):
            rows, cols = len(grid), len(grid[0])
            out = []
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:   # stay inside the grid
                    out.append(grid[nr][nc])
            return out
      `, { title: 'grid.py', run: 'neighbours([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0, 1)', expect: '[5, 3, 1]' }),
      p('Matrix problems (Rotate Image, Spiral Matrix, Set Matrix Zeroes) are mostly about careful index bookkeeping. Draw a small grid on paper and write the indexes in.'),
      h('Patterns that start here'),
      grid([
        { title: 'Two pointers', html: 'Pairs in sorted arrays, palindromes, in-place filtering. <a href="#/learn/two-pointers">Chapter →</a>' },
        { title: 'Sliding window', html: 'Best contiguous subarray or substring. <a href="#/learn/sliding-window">Chapter →</a>' },
        { title: 'Prefix sums', html: 'Range sums in O(1), left × right products. <a href="#/learn/prefix-sum">Chapter →</a>' },
        { title: 'Hash map', html: 'When you need "have I seen this?" fast. <a href="#/learn/hashing">Chapter →</a>' },
      ]),
      warn('Off-by-one errors are the #1 array bug. Before coding a loop, say out loud whether each bound is inclusive or exclusive, and test the first and last iteration in your head.'),
      quiz([
        { q: 'Why is <code>nums[500000]</code> as fast as <code>nums[0]</code>?', opts: ['Python caches it', 'The address is computed directly from the index', 'Lists are trees', 'It isn\'t'], a: 1, why: 'start + i × size is one calculation.' },
        { q: 'Cost of <code>nums.insert(0, x)</code> on a list of n items?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], a: 2, why: 'All n items shift right by one slot.' },
        { q: 'Best way to build a long string piece by piece?', opts: ['<code>s += piece</code> in a loop', 'Append pieces to a list, then <code>"".join(list)</code>', 'Use <code>str.format</code> each time', 'Use a dict'], a: 1, why: 'join copies each character once; repeated += may copy the growing string again and again.' },
      ]),
      problems([1768, 238, 189, 48, 54, 42], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'hashing', group: 'Data structures', title: 'Hash maps & sets', short: 'Hash maps & sets', level: 'Beginner', minutes: 25,
    blurb: 'O(1) lookups by key. The most useful tool in coding interviews, by a wide margin.',
    summary: 'A hash map answers "what is stored under this key?" and "have I seen this before?" in constant time on average. It turns many O(n²) brute-force solutions into O(n).',
    sections: [
      h('How it works'),
      p('A hash table is an array of <strong>buckets</strong>. To store a key, a <strong>hash function</strong> turns the key into a big number, and <code>number % bucket_count</code> picks the bucket. To find the key later, do the same calculation and look in that one bucket. No scanning.'),
      p('Two different keys can land in the same bucket: a <strong>collision</strong>. The bucket then holds a short list (chaining). When the table gets too full, it grows and re-hashes everything, which keeps buckets short and the average cost O(1).'),
      analogy('A coat check. You hand over your coat and get ticket #47; to get it back, the attendant goes straight to hook 47. They never search through every coat.'),
      viz3d('hashtable'),
      table(['Operation', 'dict / set', 'Average', 'Worst case'], [
        ['Insert / update', '<code>d[k] = v</code>, <code>s.add(k)</code>', cx('O(1)'), cx('O(n)')],
        ['Lookup', '<code>d[k]</code>, <code>k in s</code>', cx('O(1)'), cx('O(n)')],
        ['Delete', '<code>del d[k]</code>, <code>s.remove(k)</code>', cx('O(1)'), cx('O(n)')],
        ['Iterate', '<code>for k in d</code>', cx('O(n)'), cx('O(n)')],
      ], { caption: 'The worst case only happens if every key collides; in practice and in interviews, quote O(1).' }),
      note('Keys must be <b>hashable</b> (immutable): numbers, strings, tuples. A list can\'t be a key, but <code>tuple(my_list)</code> can.'),
      h('Pattern 1: counting'),
      code(py`
        from collections import Counter

        def is_anagram(s, t):
            return Counter(s) == Counter(t)     # same letters, same counts
      `, { title: 'anagram.py', run: 'is_anagram("listen", "silent")', expect: 'True' }),
      h('Pattern 2: "have I seen it?"'),
      code(py`
        def first_repeat(nums):
            seen = set()
            for x in nums:
                if x in seen:          # O(1) instead of scanning a list
                    return x
                seen.add(x)
            return None
      `, { title: 'seen.py', run: 'first_repeat([4, 2, 7, 2, 4])', expect: '2' }),
      h('Pattern 3: look up the complement'),
      p('Instead of searching for a partner, compute what the partner must be and ask the map. This is Two Sum, and it generalises to "pairs with difference k", "subarray sums" and more.'),
      widget('array', { opts: { demo: 'twoSumHash' } }),
      h('Pattern 4: group by a key'),
      p('Pick a key that is identical for items that belong together, then collect items in <code>defaultdict(list)</code>. For anagrams, the key is the sorted word.'),
      code(py`
        def group_anagrams(words):
            groups = defaultdict(list)
            for w in words:
                groups["".join(sorted(w))].append(w)
            return list(groups.values())
      `, { title: 'group.py', run: 'group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])', expect: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]" }),
      h('Pattern 5: remember positions'),
      p('Store the last index where each value appeared (<code>last[x] = i</code>) to answer "how far back was the previous one?" in O(1), e.g. Contains Duplicate II, or the start of a sliding window.'),
      tip('When you catch yourself writing a nested loop that searches for something, ask: "could a dict or set remember it for me?" That one question solves a huge share of easy and medium problems.'),
      warn('<code>defaultdict</code> creates a key the moment you <i>read</i> it with <code>d[k]</code>. Use <code>k in d</code> or <code>d.get(k)</code> to check without creating.'),
      quiz([
        { q: 'Average time to check <code>x in some_set</code>?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], a: 0, why: 'Hash, jump to the bucket, check a tiny chain.' },
        { q: 'Which is a valid dict key?', opts: ['<code>[1, 2]</code>', '<code>(1, 2)</code>', '<code>{1: 2}</code>', '<code>set()</code>'], a: 1, why: 'Only immutable (hashable) values can be keys.' },
        { q: 'Two Sum with a hash map runs in…', opts: ['O(n²) time', 'O(n log n) time', 'O(n) time, O(n) space', 'O(1) space'], a: 2, why: 'One pass with O(1) lookups, storing up to n entries.' },
      ]),
      problems([1, 242, 49, 128, 383, 2215, 1207, 1657], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'linkedlist', group: 'Data structures', title: 'Linked lists', short: 'Linked lists', level: 'Beginner', minutes: 25,
    blurb: 'Nodes joined by pointers. Master the dummy head, fast/slow pointers and in-place reversal.',
    summary: 'A linked list is a chain of nodes where each node knows only the next one. Interview questions on them are really tests of careful pointer handling.',
    sections: [
      h('Nodes and pointers'),
      p('Each node holds a value and a reference (<code>next</code>) to the following node. The last node points to <code>None</code>. You only keep a reference to the first node, the <strong>head</strong>. Nodes can live anywhere in memory.'),
      code(py`
        class ListNode:
            def __init__(self, val=0, next=None):
                self.val = val
                self.next = next

        def to_list(head):
            out = []
            while head:              # follow next until None
                out.append(head.val)
                head = head.next
            return out
      `, { title: 'listnode.py', run: 'to_list(ListNode(1, ListNode(2, ListNode(3))))', expect: '[1, 2, 3]' }),
      note('On this site (and on LeetCode) <code>ListNode</code> is predefined, and the helper <code>build_list([1, 2, 3])</code> makes a list from Python values so examples are short.'),
      analogy('A treasure hunt: each clue tells you where the next clue is. To reach clue 50 you must follow clues 1 to 49. But inserting a new clue only means rewriting one clue to point at it.'),
      viz3d('linkedlist', { caption: 'Press <b>Reverse</b> and watch <code>prev</code>, <code>curr</code> and <code>nxt</code> flip one arrow at a time.' }),
      table(['Operation', 'Array (list)', 'Linked list'], [
        ['Access the i-th item', cx('O(1)'), cx('O(n)')],
        ['Insert / delete at the front', cx('O(n)'), cx('O(1)')],
        ['Insert / delete after a node you hold', cx('O(n)'), cx('O(1)')],
        ['Search', cx('O(n)'), cx('O(n)')],
      ]),
      h('Technique 1: the dummy head'),
      p('Many bugs come from special-casing "what if the head changes?". Create a fake node in front of the list, build or edit after it, and return <code>dummy.next</code> at the end. The head is then just another node.'),
      code(py`
        def remove_value(head, target):
            dummy = ListNode(0, head)
            prev = dummy
            while prev.next:
                if prev.next.val == target:
                    prev.next = prev.next.next   # skip the node
                else:
                    prev = prev.next
            return dummy.next                     # works even if the head was removed
      `, { title: 'dummy.py', run: 'remove_value(build_list([7, 1, 7, 2]), 7)', expect: '[1, 2]' }),
      h('Technique 2: reverse in place'),
      p('Walk the list with three pointers. Save <code>nxt</code> before breaking the link, point <code>curr.next</code> backwards at <code>prev</code>, then move both forward. This exact loop appears inside many harder problems.'),
      code(py`
        def reverse_list(head):
            prev, curr = None, head
            while curr:
                nxt = curr.next      # 1. save the rest
                curr.next = prev     # 2. flip the arrow
                prev = curr          # 3. step forward
                curr = nxt
            return prev
      `, { title: 'reverse.py', run: 'reverse_list(build_list([1, 2, 3, 4, 5]))', expect: '[5, 4, 3, 2, 1]' }),
      h('Technique 3: fast and slow pointers'),
      p('Move <code>slow</code> one step and <code>fast</code> two steps. When <code>fast</code> reaches the end, <code>slow</code> is in the middle. If the list has a cycle, <code>fast</code> eventually laps <code>slow</code> and they meet (Floyd\'s algorithm).'),
      code(py`
        def middle(head):
            slow = fast = head
            while fast and fast.next:
                slow = slow.next
                fast = fast.next.next
            return slow.val
      `, { title: 'middle.py', run: 'middle(build_list([1, 2, 3, 4, 5]))', expect: '3' }),
      code(py`
        def has_cycle(head):
            slow = fast = head
            while fast and fast.next:
                slow, fast = slow.next, fast.next.next
                if slow is fast:          # same node object: fast lapped slow
                    return True
            return False

        def make_cycle(vals, pos):
            head = build_list(vals)
            tail = join = head
            for _ in range(pos):
                join = join.next
            while tail.next:
                tail = tail.next
            tail.next = join              # last node points back into the list
            return head
      `, { title: 'cycle.py', run: 'has_cycle(make_cycle([3, 2, 0, -4], 1))', expect: 'True' }),
      p('Variation: to find the <i>n-th node from the end</i>, move <code>fast</code> n steps ahead first, then move both together.'),
      h('Technique 4: merge two sorted lists'),
      code(py`
        def merge(a, b):
            dummy = tail = ListNode()
            while a and b:
                if a.val <= b.val:
                    tail.next, a = a, a.next
                else:
                    tail.next, b = b, b.next
                tail = tail.next
            tail.next = a or b           # attach whatever is left
            return dummy.next
      `, { title: 'merge.py', run: 'merge(build_list([1, 2, 4]), build_list([1, 3, 4]))', expect: '[1, 1, 2, 3, 4, 4]' }),
      tip('Draw boxes and arrows before writing linked list code. For each pointer change, ask: "after this line, can I still reach the rest of the list?"'),
      warn('Classic bugs: losing the rest of the list (overwriting <code>curr.next</code> before saving it), calling <code>.next</code> on <code>None</code>, and returning the old head after the head changed.'),
      quiz([
        { q: 'In <code>reverse_list</code>, why save <code>nxt = curr.next</code> first?', opts: ['For speed', 'Because the next line overwrites curr.next and we\'d lose the rest of the list', 'Python requires it', 'To count nodes'], a: 1, why: 'After flipping the arrow, the old next is unreachable unless saved.' },
        { q: 'Fast moves 2 steps, slow moves 1. Where is slow when fast reaches the end?', opts: ['At the head', 'In the middle', 'At the end', 'Random'], a: 1, why: 'Slow has travelled half the distance.' },
        { q: 'Why use a dummy node?', opts: ['To save memory', 'So the head needs no special case', 'It is faster', 'LeetCode requires it'], a: 1, why: 'Every real node, including the head, now has a node before it.' },
      ]),
      problems([206, 21, 141, 19, 2095, 328, 2130, 2, 146], 'Practise'),
    ],
  });

  DSA.addLesson({
    id: 'stackqueue', group: 'Data structures', title: 'Stacks & queues', short: 'Stacks & queues', level: 'Beginner', minutes: 20,
    blurb: 'Last-in-first-out and first-in-first-out: matching brackets, undo, BFS, processing in order.',
    summary: 'Two restricted lists: a stack only touches the top, a queue adds at the back and removes from the front. The restriction is the point: it matches how many problems naturally unfold.',
    sections: [
      h('Two disciplines'),
      grid([
        { title: 'Stack: last in, first out', html: 'Push onto the top, pop from the top. Python: a <code>list</code> with <code>append</code> and <code>pop()</code>, both O(1).' },
        { title: 'Queue: first in, first out', html: 'Add at the back, remove from the front. Python: <code>collections.deque</code> with <code>append</code> and <code>popleft()</code>, both O(1).' },
      ]),
      analogy('A stack is a pile of plates: the one you put down last is the one you pick up first. A queue is the line at a coffee shop: the person who arrived first is served first.'),
      viz3d('stackqueue', { caption: 'Switch the queue to a plain list and dequeue: every item has to shift. That is why BFS uses <code>deque</code>.' }),
      h('When to reach for a stack'),
      list(['Matching pairs: brackets, tags, "undo the previous thing".',
        'Anything nested: decode <code>3[a2[c]]</code>, evaluate expressions, simplify file paths.',
        'Remembering items that still wait for an answer: the monotonic stack (its own chapter).',
        'Depth-first search, written without recursion.']),
      code(py`
        def is_valid(s):
            pairs = {")": "(", "]": "[", "}": "{"}
            stack = []
            for ch in s:
                if ch in pairs:                       # a closing bracket
                    if not stack or stack[-1] != pairs[ch]:
                        return False
                    stack.pop()                       # matched: remove the opener
                else:
                    stack.append(ch)                  # an opener waits on the stack
            return not stack                          # leftovers = unmatched openers
      `, { title: 'valid_parentheses.py', run: 'is_valid("{[()]}()")', expect: 'True' }),
      p('Step through it with <b>Visualize</b>: the stack always holds the openers that are still waiting for their partner, most recent on top.'),
      code(py`
        def remove_stars(s):
            stack = []
            for ch in s:
                if ch == "*":
                    stack.pop()        # a star deletes the closest letter to its left
                else:
                    stack.append(ch)
            return "".join(stack)
      `, { title: 'remove_stars.py', run: 'remove_stars("leet**cod*e")', expect: "'lecoe'" }),
      h('When to reach for a queue'),
      list(['Breadth-first search: process nodes in order of distance.',
        'Simulations in rounds: requests in the last 3000 ms, players taking turns.',
        'Sliding window maximum with a deque that keeps candidates in order.']),
      code(py`
        class RecentCounter:
            """Count requests in the last 3000 ms."""
            def __init__(self):
                self.q = deque()

            def ping(self, t):
                self.q.append(t)
                while self.q[0] < t - 3000:   # drop requests that are too old
                    self.q.popleft()
                return len(self.q)
      `, { title: 'recent_counter.py', run: 'rc = RecentCounter()\n[rc.ping(t) for t in (1, 100, 3001, 3002)]', expect: '[1, 2, 3, 3]' }),
      table(['Operation', 'Stack (list)', 'Queue (deque)'], [
        ['add', '<code>append(x)</code> ' + cx('O(1)'), '<code>append(x)</code> ' + cx('O(1)')],
        ['remove', '<code>pop()</code> ' + cx('O(1)'), '<code>popleft()</code> ' + cx('O(1)')],
        ['peek', '<code>stack[-1]</code> ' + cx('O(1)'), '<code>q[0]</code> ' + cx('O(1)')],
        ['is empty?', '<code>not stack</code>', '<code>not q</code>'],
      ]),
      warn('Popping from an empty list raises <code>IndexError</code>. Check <code>if stack</code> before <code>stack.pop()</code> or <code>stack[-1]</code>.'),
      interview('A good design question: "Min Stack" asks for <code>getMin()</code> in O(1). The trick is to push the current minimum alongside each value, so the minimum is always on top with its element.'),
      quiz([
        { q: 'Which structure checks balanced brackets?', opts: ['Queue', 'Stack', 'Heap', 'Set'], a: 1, why: 'The most recent unmatched opener must be closed first: last in, first out.' },
        { q: 'BFS needs a queue. In Python, use…', opts: ['<code>list.pop(0)</code>', '<code>deque.popleft()</code>', '<code>list.pop()</code>', '<code>set.pop()</code>'], a: 1, why: 'deque gives O(1) removal from the front.' },
      ]),
      problems([20, 155, 150, 394, 735, 2390, 933, 649, 71, 224], 'Practise'),
    ],
  });
})();

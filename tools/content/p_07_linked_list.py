from _base import P

MAKE_CYCLE = '''
def make_cycle(vals, pos):
    head = build_list(vals)
    if pos < 0:
        return head
    join = head
    for _ in range(pos):
        join = join.next
    tail = head
    while tail.next:
        tail = tail.next
    tail.next = join
    return head
'''

P(206, 'reverse-linked-list', 'Reverse Linked List', 'Easy', 'linkedlist', 'In-place reversal',
  hook='Reverse a singly linked list and return the new head.',
  brute='Copy the values into a Python list, reverse it, and write them back: O(n) extra space.',
  insight='Walk the list once and flip each arrow to point backwards. Keep three pointers: <code>prev</code> (already reversed part), <code>curr</code> (node being flipped), and <code>nxt</code> (saved rest of the list, before the arrow is overwritten).',
  steps=['<code>prev = None</code>, <code>curr = head</code>.',
         'Save <code>nxt = curr.next</code>.',
         'Flip: <code>curr.next = prev</code>.',
         'Advance: <code>prev = curr</code>, <code>curr = nxt</code>.',
         'When <code>curr</code> is None, <code>prev</code> is the new head.'],
  code=r'''
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, curr = None, head
        while curr:
            nxt = curr.next      # 1. save the rest
            curr.next = prev     # 2. flip the arrow
            prev = curr          # 3. move forward
            curr = nxt
        return prev
''',
  time='O(n)', space='O(1)',
  run='Solution().reverseList(build_list([1, 2, 3, 4, 5]))', expect='[5, 4, 3, 2, 1]',
  tests=[('Solution().reverseList(build_list([]))', 'None'), ('Solution().reverseList(build_list([1, 2]))', '[2, 1]')],
  tip='Press Visualize and watch the arrows flip one by one. Also know the recursive version: reverse the rest, then make <code>head.next.next = head</code> and <code>head.next = None</code>.')

P(2095, 'delete-the-middle-node-of-a-linked-list', 'Delete the Middle Node of a Linked List', 'Medium', 'linkedlist', 'Fast & slow pointers',
  hook='Delete the middle node (index <code>n // 2</code>, 0-based) and return the head.',
  brute='Count the nodes in one pass, then walk to node <code>n // 2 − 1</code> in a second pass.',
  insight='Fast/slow pointers find the middle in one pass. To <i>delete</i> it we need the node <b>before</b> it, so give <code>fast</code> a head start of two nodes: <code>slow</code> then stops one node early.',
  steps=['A single node: return None.',
         '<code>slow = head</code>, <code>fast = head.next.next</code>.',
         'Move slow by 1 and fast by 2 while fast and fast.next exist.',
         'Skip the middle: <code>slow.next = slow.next.next</code>.'],
  code=r'''
class Solution:
    def deleteMiddle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if head.next is None:
            return None
        slow, fast = head, head.next.next   # slow stops just before the middle
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        slow.next = slow.next.next
        return head
''',
  time='O(n)', space='O(1)',
  run='Solution().deleteMiddle(build_list([1, 3, 4, 7, 1, 2, 6]))', expect='[1, 3, 4, 1, 2, 6]',
  tests=[('Solution().deleteMiddle(build_list([1, 2, 3, 4]))', '[1, 2, 4]'), ('Solution().deleteMiddle(build_list([2, 1]))', '[2]'), ('Solution().deleteMiddle(build_list([1]))', 'None')])

P(328, 'odd-even-linked-list', 'Odd Even Linked List', 'Medium', 'linkedlist', 'Pointer rewiring',
  hook='Reorder the list so all nodes at odd positions (1st, 3rd, …) come first, then all even positions, keeping relative order. O(1) extra space.',
  brute='Copy values into two Python lists and rebuild: O(n) space.',
  insight='Grow two chains at the same time: <code>odd</code> links to the node after the current even node, and <code>even</code> links to the node after the new odd node. At the end, attach the even chain after the odd chain.',
  steps=['<code>odd = head</code>, <code>even = head.next</code>, remember <code>even_head</code>.',
         'While <code>even</code> and <code>even.next</code>: <code>odd.next = even.next</code>, advance odd; <code>even.next = odd.next</code>, advance even.',
         'Connect <code>odd.next = even_head</code>.'],
  code=r'''
class Solution:
    def oddEvenList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head:
            return None
        odd, even = head, head.next
        even_head = even
        while even and even.next:
            odd.next = even.next     # next odd node
            odd = odd.next
            even.next = odd.next     # next even node
            even = even.next
        odd.next = even_head         # odds, then evens
        return head
''',
  time='O(n)', space='O(1)',
  run='Solution().oddEvenList(build_list([1, 2, 3, 4, 5]))', expect='[1, 3, 5, 2, 4]',
  tests=[('Solution().oddEvenList(build_list([2, 1, 3, 5, 6, 4, 7]))', '[2, 3, 6, 7, 1, 5, 4]')])

P(2130, 'maximum-twin-sum-of-a-linked-list', 'Maximum Twin Sum of a Linked List', 'Medium', 'linkedlist', 'Middle + reverse',
  hook='In a list of even length, node i\'s twin is node n − 1 − i. Return the largest sum of a node and its twin.',
  brute='Copy values into a Python list and pair <code>a[i]</code> with <code>a[n − 1 − i]</code>: easy, O(n) extra space.',
  insight='Combine two classic moves: find the middle with fast/slow pointers, then reverse the second half. Now walking from the head and from the reversed half visits twins side by side.',
  steps=['Fast/slow: <code>slow</code> ends at the first node of the second half.',
         'Reverse the list from <code>slow</code>.',
         'Walk both halves together, tracking the max of <code>first.val + second.val</code>.'],
  code=r'''
class Solution:
    def pairSum(self, head: Optional[ListNode]) -> int:
        slow = fast = head
        while fast and fast.next:          # slow -> start of the second half
            slow = slow.next
            fast = fast.next.next
        prev = None
        while slow:                        # reverse the second half
            nxt = slow.next
            slow.next = prev
            prev = slow
            slow = nxt
        best = 0
        first, second = head, prev
        while second:
            best = max(best, first.val + second.val)
            first, second = first.next, second.next
        return best
''',
  time='O(n)', space='O(1)',
  run='Solution().pairSum(build_list([5, 4, 2, 1]))', expect='6',
  tests=[('Solution().pairSum(build_list([4, 2, 2, 3]))', '7'), ('Solution().pairSum(build_list([1, 100000]))', '100001')],
  tip='Mention that this modifies the input list. If that is not allowed, reverse the second half back afterwards, or use the O(n)-space version.')

P(141, 'linked-list-cycle', 'Linked List Cycle', 'Easy', 'linkedlist', 'Fast & slow pointers',
  hook='Does the linked list contain a cycle (some node\'s next points back to an earlier node)?',
  brute='Store every visited node in a set; seeing one again means a cycle. O(n) space.',
  insight='<b>Floyd\'s tortoise and hare</b>: slow moves 1 step, fast moves 2. With no cycle, fast reaches None. With a cycle, fast eventually laps slow and they meet, because the gap between them shrinks by one every step.',
  steps=['<code>slow = fast = head</code>.',
         'While <code>fast</code> and <code>fast.next</code>: move slow by 1, fast by 2.',
         'If they are the same node (<code>is</code>), return True.',
         'If fast hits the end, return False.'],
  code=r'''
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:          # the same node object
                return True
        return False
''',
  time='O(n)', space='O(1)',
  run=MAKE_CYCLE + 'Solution().hasCycle(make_cycle([3, 2, 0, -4], 1))', expect='True',
  tests=[(MAKE_CYCLE + 'Solution().hasCycle(make_cycle([1, 2], 0))', 'True'), (MAKE_CYCLE + 'Solution().hasCycle(make_cycle([1], -1))', 'False')],
  tip='Use <code>is</code> (same object), not <code>==</code>. Follow-up (Linked List Cycle II): after they meet, move one pointer to the head and step both by 1; they meet at the cycle\'s start.')

P(2, 'add-two-numbers', 'Add Two Numbers', 'Medium', 'linkedlist', 'Dummy head + carry',
  hook='Two numbers are stored as linked lists of digits, <b>least significant digit first</b>. Return their sum as a list in the same format.',
  brute='Convert both lists to integers, add, convert back. Works in Python (big integers), but interviewers want digit-by-digit addition.',
  insight='The digits are already in the order you add them by hand: ones first. Add digit by digit with a carry, appending each result digit after a dummy head. Keep going while either list or the carry remains.',
  steps=['<code>dummy = tail = ListNode()</code>, <code>carry = 0</code>.',
         'While <code>l1</code> or <code>l2</code> or <code>carry</code>: sum the available digits plus carry.',
         '<code>carry, digit = divmod(total, 10)</code>; append a node with <code>digit</code>.',
         'Return <code>dummy.next</code>.'],
  code=r'''
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        carry = 0
        while l1 or l2 or carry:
            total = carry
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next
            carry, digit = divmod(total, 10)
            tail.next = ListNode(digit)
            tail = tail.next
        return dummy.next
''',
  time='O(max(m, n))', space='O(max(m, n))', why='The output list.',
  run='Solution().addTwoNumbers(build_list([2, 4, 3]), build_list([5, 6, 4]))', expect='[7, 0, 8]',
  tests=[('Solution().addTwoNumbers(build_list([9, 9, 9, 9, 9, 9, 9]), build_list([9, 9, 9, 9]))', '[8, 9, 9, 9, 0, 0, 0, 1]'), ('Solution().addTwoNumbers(build_list([0]), build_list([0]))', '[0]')],
  tip='The <code>or carry</code> in the loop condition handles the final carry (999 + 1 = 1000) without a special case.')

P(21, 'merge-two-sorted-lists', 'Merge Two Sorted Lists', 'Easy', 'linkedlist', 'Dummy head + two pointers',
  hook='Merge two sorted linked lists into one sorted list by splicing their nodes together.',
  brute='Collect all values, sort, and build new nodes: O((m+n) log(m+n)) and ignores the sorted order.',
  insight='Always attach the smaller of the two front nodes to the result, then advance in that list. A dummy head means the first node isn\'t a special case. When one list runs out, attach the rest of the other.',
  steps=['<code>dummy = tail = ListNode()</code>.',
         'While both lists have nodes: attach the smaller front node, advance that list and <code>tail</code>.',
         'Attach whichever list remains.',
         'Return <code>dummy.next</code>.'],
  code=r'''
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next
        tail.next = list1 or list2       # the leftover is already sorted
        return dummy.next
''',
  time='O(m + n)', space='O(1)',
  run='Solution().mergeTwoLists(build_list([1, 2, 4]), build_list([1, 3, 4]))', expect='[1, 1, 2, 3, 4, 4]',
  tests=[('Solution().mergeTwoLists(build_list([]), build_list([0]))', '[0]'), ('Solution().mergeTwoLists(build_list([]), build_list([]))', 'None')])

P(138, 'copy-list-with-random-pointer', 'Copy List with Random Pointer', 'Medium', 'linkedlist', 'Hash map (old → new)',
  hook='Each node has <code>next</code> and a <code>random</code> pointer to any node (or None). Make a deep copy: all new nodes, same structure.',
  brute='Copy the next-chain, then for each random pointer search the copy for the matching position: O(n²).',
  insight='Map every original node to its copy in a dict. Pass 1 creates all copies. Pass 2 wires each copy\'s <code>next</code> and <code>random</code> by looking up the originals\' targets in the map.',
  steps=['Pass 1: <code>copy[node] = Node(node.val)</code> for every node.',
         'Pass 2: <code>copy[node].next = copy.get(node.next)</code> and the same for <code>random</code>.',
         'Return <code>copy[head]</code>.'],
  code=r'''
class Node:   # LeetCode provides this class
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random


class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        if not head:
            return None
        copy = {}
        node = head
        while node:                         # pass 1: create the copies
            copy[node] = Node(node.val)
            node = node.next
        node = head
        while node:                         # pass 2: wire the pointers
            copy[node].next = copy.get(node.next)
            copy[node].random = copy.get(node.random)
            node = node.next
        return copy[head]
''',
  time='O(n)', space='O(n)',
  run='''
data = [[7, None], [13, 0], [11, 4], [10, 2], [1, 0]]
nodes = [Node(v) for v, _ in data]
for i, (v, r) in enumerate(data):
    nodes[i].next = nodes[i + 1] if i + 1 < len(nodes) else None
    nodes[i].random = nodes[r] if r is not None else None
copied = Solution().copyRandomList(nodes[0])
order, c = [], copied
while c:
    order.append(c)
    c = c.next
([[c.val, order.index(c.random) if c.random else None] for c in order], all(c is not o for c, o in zip(order, nodes)))
''', expect='([[7, None], [13, 0], [11, 4], [10, 2], [1, 0]], True)',
  tip='The O(1)-space follow-up interleaves copies (A → A\' → B → B\' …), sets <code>A\'.random = A.random.next</code>, then splits the lists apart.')

P(92, 'reverse-linked-list-ii', 'Reverse Linked List II', 'Medium', 'linkedlist', 'In-place reversal',
  hook='Reverse only the nodes from position <code>left</code> to <code>right</code> (1-based), in one pass.',
  brute='Copy values out, reverse the slice, write them back: O(n) space.',
  insight='Walk to the node just <b>before</b> the sublist (a dummy head handles left = 1). Reverse exactly <code>right − left + 1</code> nodes with the usual prev/curr loop, then reconnect both ends: the node before points to the new first, and the old first (now last) points to what follows.',
  steps=['<code>dummy</code> before head; move <code>before</code> left − 1 steps.',
         'Reverse <code>right − left + 1</code> nodes starting at <code>before.next</code>.',
         'Remember the old first node: it becomes the sublist\'s tail.',
         'Reconnect: <code>before.next = prev</code> and <code>old_first.next = curr</code>.'],
  code=r'''
class Solution:
    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        before = dummy
        for _ in range(left - 1):              # node just before the sublist
            before = before.next
        prev, curr = None, before.next
        for _ in range(right - left + 1):      # reverse exactly this many nodes
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        old_first = before.next                # now the last node of the sublist
        before.next = prev                     # front -> new first
        old_first.next = curr                  # new last -> rest of the list
        return dummy.next
''',
  time='O(n)', space='O(1)',
  run='Solution().reverseBetween(build_list([1, 2, 3, 4, 5]), 2, 4)', expect='[1, 4, 3, 2, 5]',
  tests=[('Solution().reverseBetween(build_list([5]), 1, 1)', '[5]'), ('Solution().reverseBetween(build_list([3, 5]), 1, 2)', '[5, 3]')])

P(25, 'reverse-nodes-in-k-group', 'Reverse Nodes in k-Group', 'Hard', 'linkedlist', 'In-place reversal',
  hook='Reverse the list k nodes at a time. A final group with fewer than k nodes stays as it is.',
  brute='Copy values into a list, reverse each chunk, write back: O(n) space.',
  insight='Process one group at a time. First check that k nodes exist (find the k-th node). Reverse the group while pointing the first node at whatever follows the group. Then link the previous group\'s tail to the new group head, and continue from the new tail.',
  steps=['<code>group_prev</code> starts at a dummy node.',
         'Find the k-th node after <code>group_prev</code>; if it doesn\'t exist, stop.',
         'Reverse the group with <code>prev</code> initialised to the node after the group.',
         'Connect <code>group_prev.next = kth</code>; the old first node becomes the new <code>group_prev</code>.'],
  code=r'''
class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        group_prev = dummy
        while True:
            kth = group_prev
            for _ in range(k):                 # is there a full group?
                kth = kth.next
                if kth is None:
                    return dummy.next
            group_next = kth.next
            prev, curr = group_next, group_prev.next
            while curr is not group_next:      # reverse this group
                nxt = curr.next
                curr.next = prev
                prev = curr
                curr = nxt
            first = group_prev.next            # becomes the group's tail
            group_prev.next = kth              # kth is the group's new head
            group_prev = first
''',
  time='O(n)', space='O(1)',
  run='Solution().reverseKGroup(build_list([1, 2, 3, 4, 5]), 2)', expect='[2, 1, 4, 3, 5]',
  tests=[('Solution().reverseKGroup(build_list([1, 2, 3, 4, 5]), 3)', '[3, 2, 1, 4, 5]'), ('Solution().reverseKGroup(build_list([1, 2]), 2)', '[2, 1]')],
  tip='Starting <code>prev</code> at <code>group_next</code> (not None) means the reversed group is already attached to the rest of the list.')

P(19, 'remove-nth-node-from-end-of-list', 'Remove Nth Node From End of List', 'Medium', 'linkedlist', 'Fast & slow pointers',
  hook='Remove the n-th node counting from the end, in one pass.',
  brute='Count the length L, then remove node L − n from the front: two passes.',
  insight='Put <code>fast</code> n nodes ahead of <code>slow</code>, then move both together. When fast is on the last node, slow is right before the node to remove. Starting both at a dummy node handles removing the head.',
  steps=['<code>dummy</code> before head; <code>fast = slow = dummy</code>.',
         'Move <code>fast</code> n steps.',
         'Move both until <code>fast.next</code> is None.',
         '<code>slow.next = slow.next.next</code>.'],
  code=r'''
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        fast = slow = dummy
        for _ in range(n):              # gap of n nodes
            fast = fast.next
        while fast.next:
            fast = fast.next
            slow = slow.next
        slow.next = slow.next.next      # slow is just before the target
        return dummy.next
''',
  time='O(n)', space='O(1)',
  run='Solution().removeNthFromEnd(build_list([1, 2, 3, 4, 5]), 2)', expect='[1, 2, 3, 5]',
  tests=[('Solution().removeNthFromEnd(build_list([1]), 1)', 'None'), ('Solution().removeNthFromEnd(build_list([1, 2]), 1)', '[1]'), ('Solution().removeNthFromEnd(build_list([1, 2]), 2)', '[2]')])

P(82, 'remove-duplicates-from-sorted-list-ii', 'Remove Duplicates from Sorted List II', 'Medium', 'linkedlist', 'Dummy head',
  hook='In a sorted list, delete <b>every</b> node whose value appears more than once, keeping only distinct values.',
  brute='Count values in a dict, then rebuild with values that appear once: O(n) space.',
  insight='Keep <code>prev</code> = the last node we are sure to keep (a dummy at first). If <code>curr</code> starts a run of duplicates, skip the whole run and link <code>prev</code> past it; otherwise <code>curr</code> is safe and <code>prev</code> moves to it.',
  steps=['<code>prev = dummy</code>, <code>curr = head</code>.',
         'If <code>curr.next</code> has the same value: skip all nodes with that value, then <code>prev.next = curr</code>.',
         'Else move <code>prev</code> and <code>curr</code> forward.'],
  code=r'''
class Solution:
    def deleteDuplicates(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        prev, curr = dummy, head
        while curr:
            if curr.next and curr.next.val == curr.val:
                dup = curr.val
                while curr and curr.val == dup:   # skip the whole run
                    curr = curr.next
                prev.next = curr
            else:
                prev = curr
                curr = curr.next
        return dummy.next
''',
  time='O(n)', space='O(1)',
  run='Solution().deleteDuplicates(build_list([1, 2, 3, 3, 4, 4, 5]))', expect='[1, 2, 5]',
  tests=[('Solution().deleteDuplicates(build_list([1, 1, 1, 2, 3]))', '[2, 3]'), ('Solution().deleteDuplicates(build_list([1, 1]))', 'None')])

P(61, 'rotate-list', 'Rotate List', 'Medium', 'linkedlist', 'Close into a ring',
  hook='Rotate the list to the right by <code>k</code> places.',
  brute='Move the last node to the front k times: O(n·k).',
  insight='Rotating by k (after <code>k %= n</code>) means the last k nodes move to the front. Find the length and tail, connect the tail to the head (a ring), then cut the ring after node <code>n − k</code>.',
  steps=['Count the length <code>n</code> and find the tail.',
         '<code>k %= n</code>; if 0, return head.',
         'Walk to node <code>n − k</code> (the new tail); its next is the new head.',
         'Cut after the new tail and attach the old tail to the old head.'],
  code=r'''
class Solution:
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        if not head or not head.next:
            return head
        n, tail = 1, head
        while tail.next:
            tail = tail.next
            n += 1
        k %= n
        if k == 0:
            return head
        new_tail = head
        for _ in range(n - k - 1):
            new_tail = new_tail.next
        new_head = new_tail.next
        new_tail.next = None
        tail.next = head
        return new_head
''',
  time='O(n)', space='O(1)',
  run='Solution().rotateRight(build_list([1, 2, 3, 4, 5]), 2)', expect='[4, 5, 1, 2, 3]',
  tests=[('Solution().rotateRight(build_list([0, 1, 2]), 4)', '[2, 0, 1]'), ('Solution().rotateRight(build_list([]), 1)', 'None')])

P(86, 'partition-list', 'Partition List', 'Medium', 'linkedlist', 'Two dummy heads',
  hook='Rearrange the list so all nodes with value &lt; x come before nodes with value ≥ x, preserving the original order within each group.',
  brute='Collect values into two Python lists and rebuild nodes: O(n) space.',
  insight='Build two separate chains while scanning, each with its own dummy head: one for small values, one for the rest. Then join them, and end the second chain with None (its last node may still point somewhere old).',
  steps=['Two dummies: <code>small</code> and <code>big</code>, with tails.',
         'Append each node to the matching chain.',
         'Set <code>big_tail.next = None</code>, then <code>small_tail.next = big.next</code>.',
         'Return <code>small.next</code>.'],
  code=r'''
class Solution:
    def partition(self, head: Optional[ListNode], x: int) -> Optional[ListNode]:
        small = small_tail = ListNode()
        big = big_tail = ListNode()
        while head:
            if head.val < x:
                small_tail.next = head
                small_tail = head
            else:
                big_tail.next = head
                big_tail = head
            head = head.next
        big_tail.next = None            # avoid a leftover link (a cycle!)
        small_tail.next = big.next
        return small.next
''',
  time='O(n)', space='O(1)',
  run='Solution().partition(build_list([1, 4, 3, 2, 5, 2]), 3)', expect='[1, 2, 2, 4, 3, 5]',
  tests=[('Solution().partition(build_list([2, 1]), 2)', '[1, 2]')])

P(146, 'lru-cache', 'LRU Cache', 'Medium', 'linkedlist', 'Hash map + doubly linked list',
  hook='Design a cache with a fixed capacity. <code>get</code> and <code>put</code> must be O(1). When full, evict the <b>least recently used</b> key.',
  brute='Store keys in a list ordered by use: finding and moving a key is O(n).',
  insight='Combine two structures. A <b>doubly linked list</b> keeps keys in order of use (most recent at the front) and can move or remove any node in O(1). A <b>dict</b> maps each key to its node, so you can find it in O(1). Sentinel head and tail nodes remove edge cases.',
  steps=['<code>get</code>: missing → -1; otherwise move the node to the front and return its value.',
         '<code>put</code>: remove any old node for the key, insert a new node at the front, store it in the dict.',
         'If over capacity, remove the node just before the tail (least recently used) from the list and the dict.'],
  code=r'''
class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}                          # key -> node
        self.head, self.tail = Node(), Node()  # sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):                # most recent goes after head
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_front(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev               # least recently used
            self._remove(lru)
            del self.map[lru.key]
''',
  time='O(1)', space='O(capacity)',
  run='''
cache = LRUCache(2)
out = []
cache.put(1, 1)
cache.put(2, 2)
out.append(cache.get(1))
cache.put(3, 3)
out.append(cache.get(2))
cache.put(4, 4)
out + [cache.get(1), cache.get(3), cache.get(4)]
''', expect='[1, -1, -1, 3, 4]',
  tip='In Python you can also use <code>OrderedDict</code> with <code>move_to_end</code> and <code>popitem(last=False)</code>. Mention it, but be ready to build the linked list: that is what the question tests.')

# Preloaded before every program in DSA Atlas (in the browser and in tests).
# It mirrors what LeetCode gives you: typing names, common imports, and the
# ListNode / TreeNode classes, plus helpers to build and print them.
from typing import List, Optional, Dict, Tuple, Set
from collections import deque, defaultdict, Counter, OrderedDict
import heapq, bisect, math, random, itertools, functools, string, re
from heapq import heappush, heappop, heapify, heappushpop, heapreplace, nlargest, nsmallest
from bisect import bisect_left, bisect_right, insort
from functools import lru_cache, cache, reduce
from math import inf, gcd


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def __repr__(self):
        return f"ListNode({self.val})"


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self):
        return f"TreeNode({self.val})"


def build_list(vals):
    """[1, 2, 3] -> 1 -> 2 -> 3 (returns the head node)."""
    dummy = ListNode()
    cur = dummy
    for v in vals:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next


def list_vals(head, limit=1000):
    """Head node -> plain Python list (stops after `limit` nodes, so cycles are safe)."""
    out = []
    while head is not None and len(out) < limit:
        out.append(head.val)
        head = head.next
    return out


def build_tree(vals):
    """Level-order list like LeetCode's [3, 9, 20, None, None, 15, 7] -> root TreeNode."""
    if not vals or vals[0] is None:
        return None
    it = iter(vals)
    root = TreeNode(next(it))
    q = deque([root])
    while q:
        node = q.popleft()
        try:
            left = next(it)
        except StopIteration:
            break
        if left is not None:
            node.left = TreeNode(left)
            q.append(node.left)
        try:
            right = next(it)
        except StopIteration:
            break
        if right is not None:
            node.right = TreeNode(right)
            q.append(node.right)
    return root


def tree_vals(root):
    """Root TreeNode -> level-order list with None gaps (LeetCode's format)."""
    if root is None:
        return []
    out, q = [], deque([root])
    while q:
        node = q.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        q.append(node.left)
        q.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out


def find_node(root, val):
    """Return the first TreeNode with this value (used to pass nodes as arguments)."""
    q = deque([root])
    while q:
        node = q.popleft()
        if node is None:
            continue
        if node.val == val:
            return node
        q.append(node.left)
        q.append(node.right)
    return None


def show(x):
    """Convert results into plain values for printing and comparing."""
    if isinstance(x, ListNode):
        return list_vals(x)
    if isinstance(x, TreeNode):
        return tree_vals(x)
    if isinstance(x, list):
        return [show(v) for v in x]
    if isinstance(x, tuple):
        return tuple(show(v) for v in x)
    return x

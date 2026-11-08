/* Chapters 01–02: how to use the guide, and the interview playbook. */
(function () {
  const { h, sub, p, analogy, tip, warn, interview, key, note, code, table, steps, list, grid, quiz, problems } = DSA.L;
  const py = String.raw;

  DSA.addLesson({
    id: 'roadmap', group: 'Start here', title: 'How to learn DSA with this guide', short: 'Roadmap', level: 'Start here', minutes: 10,
    blurb: 'What DSA really is, an 8-week plan, and the practice loop that makes it stick.',
    summary: 'You do not need to be "a math person" to get good at data structures and algorithms. You need a small set of patterns, practised the right way. This chapter gives you the plan.',
    sections: [
      h('What "knowing DSA" actually means'),
      p('<strong>Data structures</strong> are ways to organise data so certain questions are fast to answer: a list, a dictionary, a tree. <strong>Algorithms</strong> are step-by-step methods that use them: search, sort, explore.'),
      p('Interviews rarely test whether you memorised a solution. They test whether you can look at a new problem, recognise which <strong>pattern</strong> fits ("this is a sliding window", "this needs a hash map"), and write clean code for it while explaining your thinking. About 20 patterns cover the vast majority of interview questions, and this guide is organised around them.'),
      analogy('Learning DSA is like learning chess openings. Beginners calculate every move from scratch and get lost. Strong players recognise familiar shapes on the board and already know good plans. Your goal is to build that library of shapes.'),
      h('The 8-week plan'),
      p('One chapter a day, then the matching LeetCode 75 problems. About 1–2 hours a day. If you have more time, go faster; if less, stretch it out. Consistency beats intensity.'),
      table(['Week', 'Learn', 'Then practise (LeetCode 75)'], [
        ['1', 'Big-O, Python toolkit, Arrays & strings, Hash maps', 'Array / String, Hash Map / Set'],
        ['2', 'Two pointers, Sliding window, Prefix sums', 'Two Pointers, Sliding Window, Prefix Sum'],
        ['3', 'Linked lists, Stacks & queues, Monotonic stack', 'Linked List, Stack, Queue, Monotonic Stack'],
        ['4', 'Recursion, Trees & BSTs', 'Binary Tree DFS / BFS, Binary Search Tree'],
        ['5', 'Heaps, Graphs, Tries', 'Heap, Graphs DFS / BFS, Trie'],
        ['6', 'Binary search, Intervals, Greedy, Bits', 'Binary Search, Intervals, Bit Manipulation'],
        ['7', 'Backtracking, Dynamic programming (1D)', 'Backtracking, DP 1D'],
        ['8', 'Dynamic programming (2D), Sorting, review', 'DP Multidimensional, then start Top Interview 150'],
      ], { caption: 'After week 8, work through Top Interview 150 by topic, mixing in reviews of problems you marked.' }),
      h('The practice loop (this is the important part)'),
      p('Most people "study" by reading solutions. It feels productive and doesn\'t work: recognising a solution is much easier than producing one. Use this loop for every problem:'),
      steps([
        '<strong>Restate it.</strong> Read the problem and say it back in your own words. Work one example by hand.',
        '<strong>Try for 20–25 minutes.</strong> Switch to <b>Practice</b> mode (top right) so the solution stays hidden. Write <i>something</i>, even brute force.',
        '<strong>Reveal hints one at a time.</strong> First the naive idea, then the key insight, then the step-by-step plan. Try again after each.',
        '<strong>Read the solution, then close it and write it from memory.</strong> Run it. Step through it with <b>Visualize</b> until every line makes sense.',
        '<strong>Mark it.</strong> <b>Mark solved</b> if you got it alone; <b>Review later</b> if you needed help. Re-solve review problems after 1, 3 and 7 days.',
      ]),
      tip('Write a one-line note on every problem: "the trick was ___". Those notes become your personal cheat sheet before an interview.'),
      h('What each page gives you'),
      grid([
        { title: '3D figures', html: 'Every data structure is a 3D model you can orbit and operate: insert, delete, search, and watch the cost.' },
        { title: 'Step-through widgets', html: 'Patterns like two pointers or DP tables play step by step with your own input. Use ← → keys to step.' },
        { title: 'Runnable Python', html: 'Every code block runs in your browser. <b>Edit</b> it, <b>Run</b> it, or <b>Visualize</b> it line by line.' },
        { title: '209 guided problems', html: 'All of LeetCode 75 and Top Interview 150: plain-English restatement, brute force, key insight, plan, tested solution.' },
      ]),
      h('Try the Python visualizer now'),
      p('Press <b>Visualize</b> below. You will see the code on the left with the current line highlighted, and the list drawn as cells with the index <code>i</code> pointing at the current cell. Use the arrow keys to step.'),
      code(py`
        def find_max(nums):
            best = nums[0]
            for i in range(1, len(nums)):
                if nums[i] > best:
                    best = nums[i]      # found a bigger one
            return best
      `, { title: 'find_max.py', run: 'find_max([3, 7, 2, 9, 4])', expect: '9' }),
      note('Python runs inside your browser (no install needed). The first run downloads Python once, about 10 MB; after that it is instant. Your progress is saved in this browser only.'),
      quiz([
        { q: 'You have looked at a problem for 25 minutes with no progress. What should you do next?', opts: ['Keep going for another hour', 'Reveal one hint, then try again', 'Read the full solution and move on', 'Skip it forever'], a: 1, why: 'Hints keep you doing the thinking. Reading the full solution right away trains recognition, not problem solving.' },
        { q: 'You solved a problem only after reading the solution. What is the best follow-up?', opts: ['Mark it solved', 'Write it from memory now, mark it for review, re-solve it in a few days', 'Copy the solution into your notes', 'Nothing'], a: 1, why: 'Rewriting from memory and spaced review turn a solution you have seen into one you can produce.' },
      ]),
    ],
  });

  DSA.addLesson({
    id: 'interview', group: 'Start here', title: 'The coding interview playbook', short: 'Interview playbook', level: 'Start here', minutes: 15,
    blurb: 'A step-by-step framework for any problem, what to say out loud, and how to avoid the classic mistakes.',
    summary: 'Interviewers grade your process as much as your answer. Here is a repeatable framework, with the exact phrases to use, and a full worked example.',
    sections: [
      h('What interviewers are scoring'),
      table(['Area', 'What they look for'], [
        ['Problem solving', 'You clarify the problem, find a working approach, and improve it. You know why it works.'],
        ['Coding', 'Clean, correct, readable Python. Sensible names. No fighting the language.'],
        ['Communication', 'You think out loud, explain trade-offs, and take hints well.'],
        ['Verification', 'You test with examples and edge cases before saying "done", and you state the complexity.'],
      ]),
      key('A correct answer with silent, messy process can fail. A slightly incomplete answer with clear reasoning, good tests and a correct complexity analysis often passes.'),
      h('The 6-step framework'),
      steps([
        '<strong>Understand.</strong> Restate the problem. Ask clarifying questions. Work through the given example by hand.',
        '<strong>Match.</strong> Which pattern does it resemble? Sorted input → two pointers or binary search. "Contiguous subarray" → sliding window or prefix sums. "All combinations" → backtracking. (See the pattern cheat sheet.)',
        '<strong>Plan.</strong> State the brute force and its complexity first. Then find the bottleneck and remove it. Agree on the approach before coding.',
        '<strong>Implement.</strong> Write the code in small, named pieces. Talk while you type.',
        '<strong>Review.</strong> Dry-run your code on the example, line by line. Then try edge cases: empty input, one element, duplicates, negatives.',
        '<strong>Evaluate.</strong> State time and space complexity, and mention any trade-offs or follow-ups.',
      ]),
      h('Clarifying questions to ask'),
      list([
        'How big can the input be? (This tells you the target complexity.)',
        'Is the input sorted? Can it contain duplicates, negatives, zero, empty strings?',
        'What should I return if there is no answer? Can there be several valid answers?',
        'Can I modify the input in place, or should I leave it untouched?',
        'Is memory a concern, or is speed the priority?',
      ]),
      h('What to say, and when'),
      table(['Moment', 'Say something like'], [
        ['Starting', '"Let me restate it to make sure I understand… and walk through the example."'],
        ['Brute force', '"The simplest approach checks every pair, which is O(n²). Let me see if we can do better."'],
        ['Finding the insight', '"The slow part is searching for the partner. A hash map turns that search into O(1)."'],
        ['Before coding', '"So the plan is: one pass, store each value\'s index, check the complement. Does that sound good?"'],
        ['Stuck', '"I\'m stuck on handling X. One idea is Y, but it fails when Z. Let me try a smaller example."'],
        ['Finished', '"Let me trace through the example… Edge cases: empty list returns []. Time O(n), space O(n)."'],
      ]),
      interview('If the interviewer gives a hint, they are not grading you down; they want to see how you use it. Say "That\'s a good point, so we could…" and build on it.'),
      h('A full worked example: Two Sum'),
      p('<b>Problem:</b> given a list of numbers and a target, return the indices of the two numbers that add up to the target. Exactly one answer exists.'),
      sub('Understand and plan'),
      p('Restate: "I need two different positions whose values sum to <code>target</code>." Example <code>[2, 7, 11, 15]</code>, target 9 → indices 0 and 1. Brute force: try every pair.'),
      code(py`
        def two_sum_brute(nums, target):
            n = len(nums)
            for i in range(n):              # O(n²): every pair
                for j in range(i + 1, n):
                    if nums[i] + nums[j] == target:
                        return [i, j]
            return []
      `, { title: 'two_sum_brute.py', run: 'two_sum_brute([2, 7, 11, 15], 9)', expect: '[0, 1]' }),
      p('Bottleneck: for each number we search the rest of the list for its partner <code>target − x</code>. Searching is what hash maps are for. Store each number we have seen with its index, and check if the partner is already there.'),
      code(py`
        def two_sum(nums, target):
            seen = {}                       # value -> index
            for i, x in enumerate(nums):
                need = target - x
                if need in seen:            # O(1) lookup
                    return [seen[need], i]
                seen[x] = i
            return []
      `, { title: 'two_sum.py', run: 'two_sum([3, 2, 4], 6)', expect: '[1, 2]' }),
      sub('Review and evaluate'),
      p('Dry run on <code>[3, 2, 4]</code>, target 6: see 3 (need 3, not seen, store), see 2 (need 4, not seen, store), see 4 (need 2: it is at index 1) → <code>[1, 2]</code>. Edge case: <code>[3, 3]</code>, target 6 works because we check <i>before</i> storing. <b>Time O(n), space O(n).</b>'),
      h('Managing a 45-minute interview'),
      table(['Minutes', 'Phase'], [['0–5', 'Understand, ask questions, examples'], ['5–12', 'Brute force, then the optimised plan'], ['12–32', 'Code it'], ['32–40', 'Test, fix, state complexity'], ['40–45', 'Follow-up questions, your questions']]),
      h('Classic mistakes'),
      list([
        'Coding immediately without agreeing on the approach.',
        'Coding in silence for ten minutes.',
        'Never testing. Always trace at least one example through the code.',
        'Forgetting edge cases: empty input, single element, all duplicates.',
        'Not knowing the cost of Python operations, e.g. <code>list.pop(0)</code> and <code>x in list</code> are O(n).',
      ]),
      warn('Don\'t say "this is O(1)" about a line that hides a loop: <code>x in my_list</code>, <code>my_list.index(x)</code>, slicing <code>s[a:b]</code> and <code>"".join(...)</code> all take time proportional to their size.'),
      quiz([
        { q: 'What should you do right after understanding the problem?', opts: ['Start coding the optimal solution', 'State a brute force and its complexity', 'Ask for the solution', 'Write tests'], a: 1, why: 'Starting from brute force shows you can solve it at all, and gives you a baseline to improve.' },
        { q: 'Why does checking <code>need in seen</code> before <code>seen[x] = i</code> matter in Two Sum?', opts: ['It is faster', 'So a number is never paired with itself', 'Python requires it', 'It does not matter'], a: 1, why: 'If we stored first, then for target 6 and x = 3 we might "find" the 3 we just stored.' },
      ]),
      problems([1, 1768, 121], 'Good first problems to try the framework on'),
    ],
  });
})();

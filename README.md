# DSA Atlas

A visual, interactive study guide for data structures and algorithms in Python, built to take you from "weak at DSA" to interview-ready.

## Open it

- **Double-click `index.html`.** It opens in your browser; no install needed.
- If anything doesn't load, double-click **`Open DSA Atlas.bat`** instead (it serves the folder at http://localhost:8000).

You need an internet connection the first time: the 3D engine (three.js), the fonts, and Python for the browser (Pyodide, about 10 MB) come from public CDNs and are cached afterwards. Your progress (solved problems, completed chapters, notes) is saved in your browser.

## What's inside

| Part | What you get |
| --- | --- |
| **25 chapters** | Start here → Foundations (Big-O, Python toolkit, recursion) → Data structures → Patterns → Cheat sheet. Each has plain-English explanations, analogies, runnable code and a quiz. |
| **10 interactive 3D scenes** | Arrays (resize, shifting, binary search), linked lists (watch reversal flip pointers), stack vs queue, hash table (collisions, resizing), BST (insert/delete/traversals), heap (tree + list views), graph BFS/DFS, trie, DP table, sorting race. Drag to orbit. |
| **Step-through widgets** | Two pointers, sliding window, binary search, prefix sums, Kadane, monotonic stack, grids (BFS, islands, rotting oranges), DP tables (stairs, robber, coins, LCS, edit distance), recursion trees, backtracking trees, intervals, bits, Big-O chart. Use your own inputs; ← → keys step. |
| **Python visualizer** | Every code block has **Run** and **Visualize**: your code runs line by line in the browser, with lists drawn as cells with index pointers, linked lists as chains, trees as trees, and a live call stack. Also a free-form playground. |
| **LeetCode 75** | All 75 problems in LeetCode's order and 22 groups. |
| **Top Interview 150** | All 150 problems in 23 groups. |

Each of the 209 unique problems has: the problem in plain English, the brute-force idea, the key insight, a step-by-step plan, a clean Python solution (LeetCode-ready), time/space complexity, an interview tip, a link to LeetCode, a notes box, and solved / review-later tracking. Switch to **Practice** mode (top right) to hide everything behind hints until you have tried it yourself.

## How to study with it

1. Follow the roadmap in chapter 01 (about 8 weeks at 1–2 hours a day).
2. Read a chapter, play with its figures, take the quiz.
3. Do that pattern's LeetCode 75 problems in **Practice** mode: try for 20–25 minutes, then reveal hints one at a time.
4. After reading a solution, close it and write it from memory. Use **Visualize** on anything you don't fully understand.
5. Mark problems **Review later** when you needed help, and re-solve them after 1, 3 and 7 days.

## For tinkering

- `tools/content/*.py`: the problem write-ups and study plans (source of truth).
- `python tools/build.py`: tests **every** solution (560 test cases) and every runnable lesson snippet with the same Python runtime the browser uses, then regenerates `data/problems.js` and `data/pyruntime.js`.
- `tools/render_art.py`: re-renders the card art with Blender (`blender -b --factory-startup -P tools/render_art.py`).
- `data/lessons/*.js`: chapter content. `js/`: app, 3D scenes (`viz3d`), widgets (`viz2d`), Python runner and visualizer (`py`).

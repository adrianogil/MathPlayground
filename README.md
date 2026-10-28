# MathPlayground
Python implementation to play with math

## Scale Lab

Open [`web/scale-lab/index.html`](web/scale-lab/index.html) directly in a modern
browser. This offline HTML/CSS/JavaScript lab connects decimals, metric length
units, and scientific notation. It starts with the comparison `0.6 > 0.38`.

- **Decimal microscope:** build values from 0 to 1 with a slider or decimal
  input; inspect a hundred-square grid, place values, and three number-line zooms.
- **Compare numbers:** compare nonnegative decimals up to 1,000 on a shared
  scale; align decimal places and see the exact distance between the numbers.
- **Switch units:** convert metric lengths from kilometres through millimetres.
  Changing the output unit relabels the ruler without resizing the ribbon.
- **Powers of ten:** move between a positive decimal and normalized scientific
  notation with exponents from −6 to 6 and up to three significant digits.

Each tab has **Explore** and **Practice** modes. Practice offers ten exercises
per topic, cycling after the tenth, with untimed retries, visual explanations,
and a solved count. Each tab retains its current exercise and Explore values
while switching modes or languages; exercise progress lasts for the current
page session. Hints and retries are allowed, so the solved count is not a test score.

English, French, Japanese, Korean, and Brazilian Portuguese include translated
controls, explanations, feedback, and accessible labels. English is the initial
language; the last selection is remembered locally when browser storage is
available. Decimal inputs accept either a dot or comma, without thousands
separators. Keyboard users can switch tabs with arrow keys, Home, and End.

No dependencies, build step, network requests, or account are required. Exact
decimal arithmetic (integer digits plus a decimal scale) handles conversions
and answer grading; only visual positioning uses floating-point arithmetic.

Run arithmetic, exercise-bank, and translation checks:

```bash
node --test web/scale-lab/math.test.js
```

## 67 — use every piece

Open `web/67/index.html` directly in a browser, or serve the repository with
`python3 -m http.server 8000` and visit <http://127.0.0.1:8000/web/67/>.
This colorful, responsive HTML/CSS/JavaScript game works offline without a build
step or external dependencies.

The first round starts with **two numbers and one operation** (40 + 27).
Solve **five puzzles per level** before unlocking another number and operation:
three numbers/two operations, then four/three, then five/four. After five wins,
choose the next level or **More practice here** for another set at the same level. Level 4 uses all four operations (`+`, `−`, `×`, `÷`).
New pieces without a win stay at the same level; undo and restart do not advance
it. Each new page session starts at level 1, independently of saved stars.
The workspace keeps all remaining number and operation tiles together. Select
two number tiles and an operation: the calculation happens immediately when
the third choice completes the selection, in any selection order. There is no
confirmation button. The selected tiles pulse and merge into the retained slot
in about half a second, followed by a brief result highlight. Controls pause
during the merge to prevent duplicate moves. Reduced-motion settings skip the
movement and show the result immediately. Use Undo to reverse a move. Selecting a third number
never silently replaces the second; swap and clear-selection controls make
changes explicit. The result becomes
a highlighted result tile in the leftmost selected slot; the selected operation
is consumed. Tiles keep their positions, colors, and sizes; empty slots show a
subtle checkmark, and narrow screens wrap larger boards into three columns.
Selections appear directly on the tiles without a separate two-slot composer.
Full expressions remain in accessible labels and the final summary; calculation
steps stay in the history rather than stretching the number tiles.
Original-number checkmarks, operation counts, and an always-visible
calculation history make it clear how all pieces are used. The final result and
full expression stay visible when the round ends. Win by using every
number and operation exactly once and finishing with **67**. Selection order
matters for subtraction and division. Fractions and negative intermediate results
use exact rational arithmetic; division by zero is rejected.

The bank contains 24 puzzles per level, each exhaustively verified to have
**exactly one solution** using all supplied pieces. Swapping the operands of
addition/multiplication, swapping identical number tiles, or computing independent
branches in a different order counts as the same solution. Different calculation
trees are rejected, even when they happen to have the same final value. Negative
and fractional intermediate values are included in the uniqueness check.
`node web/67/build-puzzles.js` reproducibly rebuilds the checked bank. Choosing new
pieces samples this bank without immediately repeating the same puzzle.

Undo, restart, a calculation history, and hints based on the current board support experimentation without a timer.
Completed rounds earn stars, saved locally when browser storage is available.
Brazilian Portuguese is the default; English, French, Japanese, and Korean are
available from the language menu. The chosen language is remembered locally,
and changing it preserves the current round. Controls support keyboard operation,
status announcements, touch screens, and reduced-motion preferences.

Run arithmetic, generator, solver, and translation checks with:

```bash
node --test web/67/*.test.js
```

## Star polygon waves

Open `web/star-polygon-waves/index.html` directly in a browser, or serve the
repository with `python3 -m http.server 8000` and visit
<http://127.0.0.1:8000/web/star-polygon-waves/>. No dependencies or build step
are required.

Inspired by the supplied matharium tweet screenshot, this experiment animates
five star polygons ({7/5}, {9/4}, {20/13}, {25/12}, and {29/17}) alongside their
piecewise-linear height traces. Each dot moves at constant speed along its
polygon's edges; each graph shows two circuits of history, present at the left.
Pause, restart, change speed, or scrub the circuit position. Toggle guide circles,
sample points, and the {25/12} aliasing envelope. Reduced-motion preferences
start playback paused.

Polygon edges start invisible and appear behind the moving dot. The completed
path stays visible on later circuits. Restart clears it; scrubbing reveals only
the portion up to the selected circuit position.

The custom explorer accepts 3–80 vertices and a step from 1 to n−1. For
non-coprime pairs, it traces one closed component and leaves unvisited paths
invisible, explaining its shorter period. Invalid input keeps the last valid drawing.

Run the geometry and sampling checks with:

```bash
node --test web/star-polygon-waves/math.test.js
```

## Prime colors

Open `web/prime-colors/index.html` directly in a browser. This offline HTML/CSS/JS
exploration displays 1–100 in a rounded-square grid, with a unique color for each
prime and one colored band per prime factor (including repeated factors) for
composites. The number 1 is neutral because it has no prime factors.

The page starts in Brazilian Portuguese. The language selector at the top also
offers English, French, Japanese, and Korean, including translated explanations
and accessibility labels. Switching languages preserves selections and highlights.

Select a prime in the grid to highlight all its multiples. Select a composite
to highlight its distinct prime factors in the grid and palette, while keeping
the selected composite visible. Selecting 1 highlights all 25 primes in both
grids; “Show all numbers” clears the highlights. The palette also toggles
highlights for a prime's multiples.
Click the selected grid number again to deselect it and clear its highlights.
A second grid below contains only the 25 primes. It shares selection and
highlighting with the main grid, including highlighting a composite's prime
factors and deselecting a prime from either grid.
Every grid selection shows its factorization. Arrow keys move through the ten-column grid; Enter or
Space selects the focused number. No dependencies or build step are required.

### 20×20 edition

Open `web/prime-colors-20x20/index.html` for a separate grid of 1–400, with all
78 primes in the grid below it. Both pages share the scripts, translations, and
stylesheet in `web/prime-colors/`, and link to each other at the top. They work
offline without a build step. The existing primes keep the same colors; the
extended palette assigns a unique color to each additional prime through 400.

The 20×20 edition keeps the same selection, deselection, factor highlighting,
and language controls. Selecting 1 highlights all 78 primes. Up/down arrow keys
move by 20 cells. On narrow screens, the grids scroll horizontally to preserve
20 columns and readable numbers.

## Interactive Trachtenberg walkthrough

Open `web/trachtenberg-gifted/index.html` directly, or serve the repository and
visit the example in a browser:

```bash
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000/web/trachtenberg-gifted/>. The page walks
through `135 × 57 = 7,695`, the multiplication shown in *Gifted*, using the
Trachtenberg direct method. It also accepts another positive multiplicand and
any two-digit multiplier.

Run the standalone arithmetic checks with:

```bash
node --test web/trachtenberg-gifted/trachtenberg.test.js
```

## Numble

Generate a repeatable Numble puzzle by passing a seed:

```
PYTHONPATH=src python -m mathgames.numble --seed daily --total-numbers 4 --operators '+-*'
```

## Graph-isomorphism laboratory

Run an educational comparison of a graph with a seeded relabeling, followed by
a 6-cycle and two disconnected triangles (non-isomorphic graphs whose degree
sequences are identical):

```
PYTHONPATH=src python -m mathexperiments.graph_isomorphism --seed classroom
```

The laboratory represents undirected simple graphs and computes a canonical
form by trying every ordering of the vertices, encoding the upper triangle of
the adjacency matrix, and selecting its lexicographically smallest encoding.
Two supported graphs are isomorphic exactly when these forms match. Degree and
edge counts are only early rejection checks; degree sequences alone do not
prove isomorphism.

This deliberately transparent algorithm takes `O(n! * n^2)` time and is capped
at 8 vertices. It is suitable for learning and tiny examples, not large graph
isomorphism problems, directed graphs, multigraphs, or graphs with self-loops.

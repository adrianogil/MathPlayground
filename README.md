# MathPlayground
Python implementation to play with math

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
the selected composite visible. Selecting 1 or “Show all numbers” clears the
highlights. The palette also toggles highlights for a prime's multiples.
Click the selected grid number again to deselect it and clear its highlights.
A second grid below contains only the 25 primes. It shares selection and
highlighting with the main grid, including highlighting a composite's prime
factors and deselecting a prime from either grid.
Every grid selection shows its factorization. Arrow keys move through the ten-column grid; Enter or
Space selects the focused number. No dependencies or build step are required.

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

# MathPlayground
Python implementation to play with math

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

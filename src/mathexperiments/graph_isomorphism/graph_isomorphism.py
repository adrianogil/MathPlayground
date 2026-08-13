"""An exact, small-graph laboratory for exploring graph isomorphism.

The canonical form used here tries every ordering of the vertices.  That makes
the method easy to inspect and correct for the supported graph size, but its
O(n! * n^2) running time is deliberately limited to small graphs.
"""

import argparse
from dataclasses import dataclass
from itertools import permutations
import random


MAX_CANONICAL_VERTICES = 8


@dataclass(frozen=True, init=False)
class Graph:
    """An immutable, undirected simple graph with arbitrary hashable labels."""

    vertices: tuple
    edges: frozenset

    def __init__(self, vertices, edges=()):
        vertices = tuple(vertices)

        try:
            vertex_set = set(vertices)
        except TypeError as exception:
            raise ValueError('Vertex labels must be hashable.') from exception

        if len(vertex_set) != len(vertices):
            raise ValueError('Vertex labels must be unique.')

        normalized_edges = set()
        for edge in edges:
            try:
                endpoints = tuple(edge)
            except TypeError as exception:
                raise ValueError('Each edge must contain exactly two vertices.') from exception

            if len(endpoints) != 2:
                raise ValueError('Each edge must contain exactly two vertices.')

            left, right = endpoints
            try:
                endpoints_are_known = left in vertex_set and right in vertex_set
            except TypeError as exception:
                raise ValueError('Edge endpoints must be hashable vertex labels.') from exception

            if not endpoints_are_known:
                raise ValueError('Every edge endpoint must be present in the graph.')
            if left == right:
                raise ValueError('Self-loops are not supported by this simple graph.')

            normalized_edges.add(frozenset((left, right)))

        object.__setattr__(self, 'vertices', vertices)
        object.__setattr__(self, 'edges', frozenset(normalized_edges))

    def degree(self, vertex):
        """Return the number of edges incident to ``vertex``."""
        if vertex not in self.vertices:
            raise ValueError('The requested vertex is not present in the graph.')
        return sum(vertex in edge for edge in self.edges)

    def degree_sequence(self):
        """Return the degrees in sorted order, independent of vertex labels."""
        return tuple(sorted(self.degree(vertex) for vertex in self.vertices))

    def relabel(self, mapping):
        """Return the same graph after applying a complete one-to-one mapping."""
        try:
            mapping_keys = set(mapping)
        except TypeError as exception:
            raise ValueError('A relabeling must map every vertex exactly once.') from exception

        if mapping_keys != set(self.vertices):
            raise ValueError('A relabeling must map every vertex exactly once.')

        new_vertices = tuple(mapping[vertex] for vertex in self.vertices)
        try:
            if len(set(new_vertices)) != len(new_vertices):
                raise ValueError('A relabeling must assign unique new labels.')
        except TypeError as exception:
            raise ValueError('New vertex labels must be hashable.') from exception

        new_edges = []
        for edge in self.edges:
            left, right = edge
            new_edges.append((mapping[left], mapping[right]))

        return Graph(new_vertices, new_edges)


def generate_relabeling(graph, seed=None):
    """Return ``(relabelled_graph, mapping)`` using a seedable permutation."""
    shuffled_labels = list(graph.vertices)
    random.Random(seed).shuffle(shuffled_labels)
    mapping = dict(zip(graph.vertices, shuffled_labels))
    return graph.relabel(mapping), mapping


def _validate_canonical_size(graph):
    if len(graph.vertices) > MAX_CANONICAL_VERTICES:
        raise ValueError(
            'Exact canonical forms support at most '
            f'{MAX_CANONICAL_VERTICES} vertices; exhaustive search grows factorially.'
        )


def canonical_form(graph):
    """Return the least upper-triangle adjacency encoding over all labelings.

    The vertex count is included so, for example, empty graphs with different
    numbers of vertices cannot share a canonical form.
    """
    _validate_canonical_size(graph)

    vertices = graph.vertices
    smallest_encoding = None
    for ordering in permutations(vertices):
        encoding = ''.join(
            '1' if frozenset((ordering[left], ordering[right])) in graph.edges else '0'
            for left in range(len(ordering))
            for right in range(left + 1, len(ordering))
        )
        if smallest_encoding is None or encoding < smallest_encoding:
            smallest_encoding = encoding

    return f'{len(vertices)}:{smallest_encoding}'


def are_isomorphic(left_graph, right_graph):
    """Decide exact isomorphism for graphs within the laboratory size limit."""
    _validate_canonical_size(left_graph)
    _validate_canonical_size(right_graph)

    if len(left_graph.vertices) != len(right_graph.vertices):
        return False
    if len(left_graph.edges) != len(right_graph.edges):
        return False
    if left_graph.degree_sequence() != right_graph.degree_sequence():
        return False

    return canonical_form(left_graph) == canonical_form(right_graph)


def cycle_graph(size):
    """Create a cycle with integer labels from zero to ``size - 1``."""
    if size < 3:
        raise ValueError('A simple cycle needs at least three vertices.')
    vertices = tuple(range(size))
    edges = [(vertex, (vertex + 1) % size) for vertex in vertices]
    return Graph(vertices, edges)


def complete_graph(size):
    """Create a complete graph with integer labels from zero to ``size - 1``."""
    if size < 0:
        raise ValueError('A graph cannot have a negative number of vertices.')
    vertices = tuple(range(size))
    edges = [
        (left, right)
        for left in vertices
        for right in range(left + 1, size)
    ]
    return Graph(vertices, edges)


def _format_mapping(mapping):
    return ', '.join(f'{old!r}->{new!r}' for old, new in mapping.items())


def _format_answer(answer):
    return 'yes' if answer else 'no'


def run_laboratory(seed='graph-lab'):
    """Print two examples that expose what canonical comparison contributes."""
    cycle = cycle_graph(5)
    relabelled_cycle, mapping = generate_relabeling(cycle, seed=seed)

    six_cycle = cycle_graph(6)
    two_triangles = Graph(
        range(6),
        [(0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)],
    )

    print('Graph-isomorphism laboratory')
    print(f'Exact limit: {MAX_CANONICAL_VERTICES} vertices')
    print(f'Seed: {seed}')
    print()
    print('Example 1: a 5-cycle and a seeded relabeling')
    print(f'  relabeling: {_format_mapping(mapping)}')
    print(f'  original canonical form:   {canonical_form(cycle)}')
    print(f'  relabelled canonical form: {canonical_form(relabelled_cycle)}')
    print(f'  isomorphic: {_format_answer(are_isomorphic(cycle, relabelled_cycle))}')
    print()
    print('Example 2: a 6-cycle and two disconnected triangles')
    print(f'  degree sequences: {six_cycle.degree_sequence()} and {two_triangles.degree_sequence()}')
    print(f'  6-cycle canonical form:    {canonical_form(six_cycle)}')
    print(f'  two-triangle canonical form: {canonical_form(two_triangles)}')
    print(f'  isomorphic: {_format_answer(are_isomorphic(six_cycle, two_triangles))}')
    print('  Matching degree sequences are not enough to prove isomorphism.')
    print()
    print('Method: minimize the adjacency encoding over every vertex ordering.')
    print('Complexity: O(n! * n^2) time; this exhaustive method is for small graphs.')


def build_parser():
    parser = argparse.ArgumentParser(
        description='Compare exact canonical forms in a small graph-isomorphism laboratory.',
    )
    parser.add_argument(
        '--seed',
        default='graph-lab',
        help='seed used for the repeatable relabeling (default: graph-lab)',
    )
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    run_laboratory(seed=args.seed)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

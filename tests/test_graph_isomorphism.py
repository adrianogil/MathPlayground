import io
import unittest
from contextlib import redirect_stdout

from mathexperiments.graph_isomorphism import (
    MAX_CANONICAL_VERTICES,
    Graph,
    are_isomorphic,
    canonical_form,
    complete_graph,
    cycle_graph,
    generate_relabeling,
    main,
)


class GraphRepresentationTest(unittest.TestCase):
    def test_normalizes_undirected_and_repeated_edges(self):
        graph = Graph(['a', 'b'], [('a', 'b'), ('b', 'a')])

        self.assertEqual(graph.edges, frozenset({frozenset(('a', 'b'))}))
        self.assertEqual(graph.degree_sequence(), (1, 1))

    def test_rejects_invalid_graphs(self):
        with self.assertRaisesRegex(ValueError, 'unique'):
            Graph(['a', 'a'])

        with self.assertRaisesRegex(ValueError, 'exactly two'):
            Graph(['a', 'b'], [('a',)])

        with self.assertRaisesRegex(ValueError, 'endpoint'):
            Graph(['a', 'b'], [('a', 'missing')])

        with self.assertRaisesRegex(ValueError, 'Self-loops'):
            Graph(['a'], [('a', 'a')])

    def test_relabel_requires_a_bijection(self):
        graph = cycle_graph(3)

        with self.assertRaisesRegex(ValueError, 'every vertex'):
            graph.relabel({0: 'a', 1: 'b'})

        with self.assertRaisesRegex(ValueError, 'unique new labels'):
            graph.relabel({0: 'a', 1: 'a', 2: 'b'})


class GraphRelabelingTest(unittest.TestCase):
    def test_seeded_relabeling_is_deterministic_and_preserves_edges(self):
        graph = cycle_graph(5)

        first_graph, first_mapping = generate_relabeling(graph, seed='repeatable')
        second_graph, second_mapping = generate_relabeling(graph, seed='repeatable')

        self.assertEqual(first_mapping, second_mapping)
        self.assertEqual(first_graph, second_graph)
        self.assertEqual(first_graph, graph.relabel(first_mapping))
        self.assertEqual(set(first_mapping), set(graph.vertices))
        self.assertEqual(set(first_mapping.values()), set(graph.vertices))

    def test_disconnected_graph_is_isomorphic_to_its_relabeling(self):
        graph = Graph(range(6), [(0, 1), (1, 2), (3, 4)])
        relabelled, _ = generate_relabeling(graph, seed='components')

        self.assertTrue(are_isomorphic(graph, relabelled))
        self.assertEqual(canonical_form(graph), canonical_form(relabelled))


class CanonicalGraphFormTest(unittest.TestCase):
    def test_cycles_have_the_same_form_after_relabeling(self):
        cycle = cycle_graph(6)
        relabelled, _ = generate_relabeling(cycle, seed='cycle')

        self.assertTrue(are_isomorphic(cycle, relabelled))

    def test_complete_graphs_compare_by_size(self):
        complete = complete_graph(5)
        relabelled, _ = generate_relabeling(complete, seed='complete')

        self.assertTrue(are_isomorphic(complete, relabelled))
        self.assertFalse(are_isomorphic(complete, complete_graph(4)))

    def test_same_degree_sequence_does_not_decide_isomorphism(self):
        six_cycle = cycle_graph(6)
        two_triangles = Graph(
            range(6),
            [(0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)],
        )

        self.assertEqual(six_cycle.degree_sequence(), two_triangles.degree_sequence())
        self.assertNotEqual(canonical_form(six_cycle), canonical_form(two_triangles))
        self.assertFalse(are_isomorphic(six_cycle, two_triangles))

    def test_vertex_count_is_part_of_the_encoding(self):
        self.assertNotEqual(canonical_form(Graph([])), canonical_form(Graph(['isolated'])))

    def test_rejects_graphs_beyond_the_educational_limit(self):
        graph = Graph(range(MAX_CANONICAL_VERTICES + 1))

        with self.assertRaisesRegex(ValueError, 'grows factorially'):
            canonical_form(graph)


class GraphIsomorphismCliTest(unittest.TestCase):
    def test_seeded_output_is_deterministic_and_demonstrates_both_results(self):
        first_output = io.StringIO()
        second_output = io.StringIO()

        with redirect_stdout(first_output):
            first_exit_code = main(['--seed', 'classroom'])
        with redirect_stdout(second_output):
            second_exit_code = main(['--seed', 'classroom'])

        self.assertEqual(first_exit_code, 0)
        self.assertEqual(second_exit_code, 0)
        self.assertEqual(first_output.getvalue(), second_output.getvalue())
        self.assertIn('isomorphic: yes', first_output.getvalue())
        self.assertIn('isomorphic: no', first_output.getvalue())
        self.assertIn('O(n! * n^2)', first_output.getvalue())


if __name__ == '__main__':
    unittest.main()

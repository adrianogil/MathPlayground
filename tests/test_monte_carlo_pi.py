import io
import unittest
from contextlib import redirect_stdout

from mathexperiments.monte_carlo_pi import estimate_pi, main


class MonteCarloPiTest(unittest.TestCase):
    def test_seeded_estimate_is_repeatable(self):
        first_estimate = estimate_pi(1_000, seed='math')
        second_estimate = estimate_pi(1_000, seed='math')

        self.assertEqual(first_estimate, second_estimate)
        self.assertGreaterEqual(first_estimate, 2.5)
        self.assertLessEqual(first_estimate, 3.8)

    def test_rejects_non_positive_point_count(self):
        with self.assertRaisesRegex(ValueError, 'At least one point'):
            estimate_pi(0)


class MonteCarloPiCliTest(unittest.TestCase):
    def test_main_prints_seeded_estimate(self):
        output = io.StringIO()

        with redirect_stdout(output):
            exit_code = main(['100', '--seed', 'demo'])

        self.assertEqual(exit_code, 0)
        self.assertRegex(output.getvalue(), r'^Estimated pi: \d\.\d{6}\n$')


if __name__ == '__main__':
    unittest.main()

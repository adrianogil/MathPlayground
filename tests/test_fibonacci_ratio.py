import io
import unittest
from contextlib import redirect_stdout

from mathexperiments.fibonacci_ratio import fibonacci_numbers, fibonacci_ratios, main


class FibonacciRatioTest(unittest.TestCase):
    def test_generates_requested_fibonacci_numbers(self):
        self.assertEqual(fibonacci_numbers(8), [1, 1, 2, 3, 5, 8, 13, 21])

    def test_calculates_consecutive_ratios(self):
        self.assertEqual(fibonacci_ratios(5), [1.0, 2.0, 1.5, 5 / 3])

    def test_ratios_approach_the_golden_ratio(self):
        golden_ratio = (1 + 5 ** 0.5) / 2

        self.assertAlmostEqual(fibonacci_ratios(20)[-1], golden_ratio, places=7)

    def test_rejects_too_few_numbers_for_a_ratio(self):
        with self.assertRaisesRegex(ValueError, 'At least two'):
            fibonacci_ratios(1)


class FibonacciRatioCliTest(unittest.TestCase):
    def test_main_prints_each_ratio(self):
        output = io.StringIO()

        with redirect_stdout(output):
            exit_code = main(['4'])

        self.assertEqual(exit_code, 0)
        self.assertEqual(
            output.getvalue().splitlines(),
            [
                '1 / 1 = 1.0000000000',
                '2 / 1 = 2.0000000000',
                '3 / 2 = 1.5000000000',
            ],
        )


if __name__ == '__main__':
    unittest.main()

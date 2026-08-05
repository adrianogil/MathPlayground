import io
import unittest
from contextlib import redirect_stdout

from mathexperiments.kaprekar_routine import kaprekar_sequence, kaprekar_step, main


class KaprekarRoutineTest(unittest.TestCase):
    def test_performs_one_kaprekar_step(self):
        self.assertEqual(kaprekar_step(3524), 3087)

    def test_step_pads_values_with_leading_zeroes(self):
        self.assertEqual(kaprekar_step(999), 8991)

    def test_reaches_6174(self):
        self.assertEqual(kaprekar_sequence(3524), [3524, 3087, 8352, 6174])

    def test_constant_is_already_complete(self):
        self.assertEqual(kaprekar_sequence(6174), [6174])

    def test_rejects_identical_digits(self):
        with self.assertRaisesRegex(ValueError, 'at least two different digits'):
            kaprekar_sequence(1111)

    def test_rejects_values_outside_four_digit_range(self):
        with self.assertRaisesRegex(ValueError, 'between 0 and 9999'):
            kaprekar_step(10_000)


class KaprekarRoutineCliTest(unittest.TestCase):
    def test_main_prints_sequence_and_step_count(self):
        output = io.StringIO()

        with redirect_stdout(output):
            exit_code = main(['3524'])

        self.assertEqual(exit_code, 0)
        self.assertEqual(
            output.getvalue().splitlines(),
            [
                '3524 -> 3087 -> 8352 -> 6174',
                'Reached 6174 in 3 steps.',
            ],
        )


if __name__ == '__main__':
    unittest.main()

import io
import unittest
from contextlib import redirect_stdout

from mathexperiments.number_theory import find_abudant_numbers as legacy_module
from mathexperiments.number_theory.find_abundant_numbers import (
    find_abudant_numbers,
    find_abundant_numbers,
    main,
)


class AbundantNumbersTest(unittest.TestCase):
    def test_finds_requested_number_of_abundant_numbers(self):
        output = io.StringIO()

        with redirect_stdout(output):
            result = find_abundant_numbers(5)

        self.assertEqual(result, [12, 18, 20, 24, 30])
        self.assertEqual(output.getvalue().splitlines(), ['12', '18', '20', '24', '30'])

    def test_zero_requested_numbers_returns_without_output(self):
        output = io.StringIO()

        with redirect_stdout(output):
            result = find_abundant_numbers(0)

        self.assertEqual(result, [])
        self.assertEqual(output.getvalue(), '')

    def test_misspelled_function_name_remains_a_compatibility_alias(self):
        self.assertIs(find_abudant_numbers, find_abundant_numbers)


class AbundantNumbersCliTest(unittest.TestCase):
    def test_main_honors_requested_number_count(self):
        output = io.StringIO()

        with redirect_stdout(output):
            exit_code = main(['1'])

        self.assertEqual(exit_code, 0)
        self.assertEqual(output.getvalue().splitlines(), ['12'])

    def test_legacy_module_uses_corrected_cli(self):
        output = io.StringIO()

        with redirect_stdout(output):
            exit_code = legacy_module.main(['2'])

        self.assertEqual(exit_code, 0)
        self.assertEqual(output.getvalue().splitlines(), ['12', '18'])


if __name__ == '__main__':
    unittest.main()

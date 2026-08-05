import io
import unittest
from contextlib import redirect_stdout

from mathexperiments.pascal_triangle_patterns import (
    main,
    pascal_odd_pattern,
    pascal_triangle,
)


class PascalTrianglePatternsTest(unittest.TestCase):
    def test_generates_pascal_triangle(self):
        self.assertEqual(
            pascal_triangle(5),
            [
                [1],
                [1, 1],
                [1, 2, 1],
                [1, 3, 3, 1],
                [1, 4, 6, 4, 1],
            ],
        )

    def test_highlights_odd_values(self):
        self.assertEqual(
            pascal_odd_pattern(4),
            ['   *', '  * *', ' *   *', '* * * *'],
        )

    def test_supports_a_custom_marker(self):
        self.assertEqual(pascal_odd_pattern(2, '#'), [' #', '# #'])

    def test_rejects_non_positive_row_count(self):
        with self.assertRaisesRegex(ValueError, 'At least one row'):
            pascal_triangle(0)


class PascalTrianglePatternsCliTest(unittest.TestCase):
    def test_main_prints_odd_number_pattern(self):
        output = io.StringIO()

        with redirect_stdout(output):
            exit_code = main(['3', '--marker', '#'])

        self.assertEqual(exit_code, 0)
        self.assertEqual(output.getvalue().splitlines(), ['  #', ' # #', '#   #'])


if __name__ == '__main__':
    unittest.main()

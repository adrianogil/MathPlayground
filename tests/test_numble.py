import unittest

from mathgames.numble import apply_operator, evaluate_expression_parts


class NumbleArithmeticTest(unittest.TestCase):
    def test_apply_operator_supports_basic_arithmetic(self):
        self.assertEqual(apply_operator(3, '+', 2), 5)
        self.assertEqual(apply_operator(3, '-', 2), 1)
        self.assertEqual(apply_operator(3, '*', 2), 6)
        self.assertEqual(apply_operator(3, '/', 2), 1)

    def test_apply_operator_rejects_unsupported_operators(self):
        with self.assertRaisesRegex(ValueError, 'Unsupported operator'):
            apply_operator(3, '**', 2)

    def test_evaluate_expression_parts_applies_operations_left_to_right(self):
        self.assertEqual(evaluate_expression_parts([8, '/', 2, '+', 5, '*', 3]), 27)

    def test_evaluate_expression_parts_rejects_empty_expressions(self):
        with self.assertRaisesRegex(ValueError, 'Expression must contain'):
            evaluate_expression_parts([])

    def test_evaluate_expression_parts_rejects_incomplete_expressions(self):
        with self.assertRaisesRegex(ValueError, 'alternate numbers and operators'):
            evaluate_expression_parts([1, '+'])


if __name__ == '__main__':
    unittest.main()

import unittest
from unittest.mock import patch

from mathgames.numble import (
    apply_operator,
    evaluate_expression_parts,
    generate_numble_puzzle,
    main,
    numble,
    parse_operators,
)


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


class NumblePuzzleGenerationTest(unittest.TestCase):
    def test_seeded_generation_is_deterministic(self):
        first_puzzle = generate_numble_puzzle(seed='daily-puzzle')
        second_puzzle = generate_numble_puzzle(seed='daily-puzzle')

        self.assertEqual(first_puzzle, second_puzzle)

    def test_generated_puzzle_result_matches_answer(self):
        puzzle = generate_numble_puzzle(total_numbers=5, operators=['+', '-', '*'], seed='math')

        self.assertEqual(evaluate_expression_parts(list(puzzle.answer)), puzzle.result)
        self.assertEqual(
            sorted(puzzle.numbers),
            sorted(number for number in puzzle.answer if isinstance(number, int)),
        )
        self.assertEqual(len(set(puzzle.numbers)), 5)
        self.assertEqual(set(puzzle.operators), {'+', '-', '*'})

    def test_generation_does_not_mutate_operator_input(self):
        operators = ['+', '-']

        generate_numble_puzzle(total_numbers=4, operators=operators, seed='stable')

        self.assertEqual(operators, ['+', '-'])

    def test_generation_rejects_invalid_number_counts(self):
        with self.assertRaisesRegex(ValueError, 'At least one number'):
            generate_numble_puzzle(total_numbers=0)

        with self.assertRaisesRegex(ValueError, 'at most 9'):
            generate_numble_puzzle(total_numbers=10)

    def test_parse_operators_supports_compact_and_comma_separated_input(self):
        self.assertEqual(parse_operators('+-*'), ['+', '-', '*'])
        self.assertEqual(parse_operators('+, -, *'), ['+', '-', '*'])

    def test_parse_operators_rejects_unsupported_operator(self):
        with self.assertRaisesRegex(ValueError, 'Unsupported operator'):
            parse_operators('+^')

    def test_numble_uses_seeded_puzzle_for_interactive_game(self):
        puzzle = generate_numble_puzzle(seed='daily-puzzle')
        guess = ''.join(str(part) for part in puzzle.answer)

        with patch('builtins.input', return_value=guess), patch('builtins.print') as print_mock:
            numble(seed='daily-puzzle')

        printed_lines = [call.args[0] for call in print_mock.call_args_list]
        self.assertIn('Correct! You are a genius!', printed_lines)
        self.assertIn(f'Result: {puzzle.result}', printed_lines)

    def test_main_accepts_seeded_generation_arguments(self):
        puzzle = generate_numble_puzzle(
            total_numbers=4,
            operators=['+', '-'],
            seed='cli-puzzle',
        )
        guess = ''.join(str(part) for part in puzzle.answer)

        with patch('builtins.input', return_value=guess), patch('builtins.print') as print_mock:
            exit_code = main([
                '--seed',
                'cli-puzzle',
                '--total-numbers',
                '4',
                '--operators',
                '+-',
            ])

        printed_lines = [call.args[0] for call in print_mock.call_args_list]
        self.assertEqual(exit_code, 0)
        self.assertIn(f'Result: {puzzle.result}', printed_lines)


if __name__ == '__main__':
    unittest.main()

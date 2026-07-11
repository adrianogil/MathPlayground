
import argparse
from dataclasses import dataclass
import operator
import random


SUPPORTED_OPERATORS = {
    '+': operator.add,
    '-': operator.sub,
    '*': operator.mul,
    '/': operator.truediv,
}


@dataclass(frozen=True)
class NumblePuzzle:
    numbers: tuple
    operators: tuple
    result: int
    answer: tuple


def apply_operator(left_value, selected_operator, right_value):
    if selected_operator not in SUPPORTED_OPERATORS:
        raise ValueError(f'Unsupported operator: {selected_operator}')

    return int(SUPPORTED_OPERATORS[selected_operator](left_value, right_value))


def evaluate_expression_parts(expression_parts):
    if not expression_parts:
        raise ValueError('Expression must contain at least one number.')

    if len(expression_parts) % 2 == 0:
        raise ValueError('Expression must alternate numbers and operators.')

    current_value = expression_parts[0]
    for i in range(1, len(expression_parts), 2):
        selected_operator = expression_parts[i]
        next_number = expression_parts[i + 1]
        current_value = apply_operator(current_value, selected_operator, next_number)

    return current_value


def _get_random_generator(seed=None):
    if seed is None:
        return random

    return random.Random(seed)


def _normalize_operators(operators=None):
    if operators is None:
        return list(SUPPORTED_OPERATORS)

    normalized_operators = list(operators)
    if not normalized_operators:
        raise ValueError('At least one operator is required.')

    for selected_operator in normalized_operators:
        if selected_operator not in SUPPORTED_OPERATORS:
            raise ValueError(f'Unsupported operator: {selected_operator}')

    return normalized_operators


def generate_numble_puzzle(total_numbers=3, operators=None, seed=None):
    if total_numbers < 1:
        raise ValueError('At least one number is required.')
    if total_numbers > 9:
        raise ValueError('Numble puzzles can use at most 9 unique numbers.')

    rng = _get_random_generator(seed)
    available_operators = _normalize_operators(operators)
    all_numbers = list(range(1, 10))

    selected_number = rng.choice(all_numbers)
    all_numbers.remove(selected_number)
    current_value = selected_number
    answer = [selected_number]

    for i in range(total_numbers - 1):
        rng.shuffle(available_operators)
        selected_operator = rng.choice(available_operators)
        next_number = rng.choice(all_numbers)
        all_numbers.remove(next_number)
        current_value = apply_operator(current_value, selected_operator, next_number)
        answer += [selected_operator, next_number]

    numbers = [i for i in answer if isinstance(i, int)]
    rng.shuffle(numbers)

    return NumblePuzzle(
        numbers=tuple(numbers),
        operators=tuple(available_operators),
        result=current_value,
        answer=tuple(answer),
    )


def parse_operators(operator_text):
    if operator_text is None:
        return None

    if ',' in operator_text:
        operators = [operator.strip() for operator in operator_text.split(',')]
    else:
        operators = list(operator_text.strip())

    return _normalize_operators(operators)


def numble(total_numbers=3, operators=None, seed=None):
    """
    This function generates a math game where the user has to guess the numbers and operators that were used to generate a random number.

    Args:
        total_numbers (int): The total number of numbers that will be used in the game.
        operators (list): The list of operators to be used in the game.
        seed: Optional seed used to generate deterministic puzzles.
    """
    puzzle = generate_numble_puzzle(
        total_numbers=total_numbers,
        operators=operators,
        seed=seed,
    )

    # Print the numbers and operator
    print(f'Numbers: {list(puzzle.numbers)}')
    print(f'Operator: {list(puzzle.operators)}')
    print(f'Result: {puzzle.result}')

    # Ask the user to guess the numbers and operator
    guess = input('Enter your guess (e.g. 1+2+3+4+5+6): ')

    # Check if the user's guess is correct
    guess_answer = []
    for s in guess:
        if s.isdigit():
            guess_answer.append(int(s))
        elif s in puzzle.operators:
            guess_answer.append(s)

    # Check if the guess is correct
    guess_value = evaluate_expression_parts(guess_answer)

    if guess_value == puzzle.result:
        print('Correct! You are a genius!')
    else:
        print('Incorrect! Better luck next time!')
        print(f'The correct answer is {list(puzzle.answer)}')


def build_parser():
    parser = argparse.ArgumentParser(description='Generate and play a Numble puzzle.')
    parser.add_argument(
        '-n',
        '--total-numbers',
        type=int,
        default=3,
        help='number of unique digits to include in the puzzle',
    )
    parser.add_argument(
        '-o',
        '--operators',
        help='operators to use, for example "+-*" or "+,-,*"',
    )
    parser.add_argument(
        '-s',
        '--seed',
        help='seed used to generate a deterministic puzzle',
    )

    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        operators = parse_operators(args.operators)
        numble(
            total_numbers=args.total_numbers,
            operators=operators,
            seed=args.seed,
        )
    except ValueError as exception:
        parser.error(str(exception))
        return 2

    return 0


if __name__ == '__main__':
    raise SystemExit(main())

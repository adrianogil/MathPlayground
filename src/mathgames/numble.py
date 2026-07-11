
import operator


SUPPORTED_OPERATORS = {
    '+': operator.add,
    '-': operator.sub,
    '*': operator.mul,
    '/': operator.truediv,
}


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


def numble(total_numbers=3, operators=None):
    """
    This function generates a math game where the user has to guess the numbers and operators that were used to generate a random number.

    Args:
        total_numbers (int): The total number of numbers that will be used in the game.
        operators (list): The list of operators to be used in the game.
    """
    import random

    if operators is None:
        operators = list(SUPPORTED_OPERATORS)
    else:
        operators = list(operators)

    all_numbers = list(range(1, 10))
    selected_number = random.choice(all_numbers)
    all_numbers.remove(selected_number)
    current_value = selected_number

    answer = [selected_number]

    for i in range(total_numbers - 1):
        random.shuffle(operators)
        operator = random.choice(operators)
        next_number = random.choice(all_numbers)
        all_numbers.remove(next_number)
        current_value = apply_operator(current_value, operator, next_number)
        # print(f'{current_value} = {current_value} {operator} {next_number}')
        answer += [operator, next_number]

    numbers = [i for i in answer if isinstance(i, int)]
    random.shuffle(numbers)

    # Print the numbers and operator
    print(f'Numbers: {numbers}')
    print(f'Operator: {operators}')
    print(f'Result: {current_value}')

    # Ask the user to guess the numbers and operator
    guess = input('Enter your guess (e.g. 1+2+3+4+5+6): ')

    # Check if the user's guess is correct
    guess_answer = []
    for s in guess:
        if s.isdigit():
            guess_answer.append(int(s))
        elif s in operators:
            guess_answer.append(s)

    # Check if the guess is correct
    guess_value = evaluate_expression_parts(guess_answer)

    if guess_value == current_value:
        print('Correct! You are a genius!')
    else:
        print('Incorrect! Better luck next time!')
        print(f'The correct answer is {answer}')


if __name__ == '__main__':
    numble()

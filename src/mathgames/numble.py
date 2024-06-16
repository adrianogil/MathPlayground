
def numble(total_numbers=3, operators=['+', '-', '*', '/']):
    """
    This function generates a math game where the user has to guess the numbers and operators that were used to generate a random number.

    Args:
        total_numbers (int): The total number of numbers that will be used in the game.
        operators (list): The list of operators to be used in the game.
    """
    import random

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
        current_value = eval(f'{current_value} {operator} {next_number}')
        current_value = int(current_value)
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
    guess_value = guess_answer[0]
    # print(guess_answer)
    for i in range(1, len(guess_answer), 2):
        operator = guess_answer[i]
        next_number = guess_answer[i+1]
        guess_value = eval(f'{guess_value} {operator} {next_number}')
        guess_value = int(guess_value)

    if guess_value == current_value:
        print('Correct! You are a genius!')
    else:
        print('Incorrect! Better luck next time!')
        print(f'The correct answer is {answer}')


if __name__ == '__main__':
    numble()

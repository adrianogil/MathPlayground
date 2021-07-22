import sys

# target_number_of_perfect_numbers = 10

# if len(sys.argv) > 1:
#     target_number_of_perfect_numbers = int(sys.argv[1])

# print('Finding %sth first perfect numbers...' % (target_number_of_perfect_numbers,))

current_number = 2

for current_number in range(2, 10000):
    is_prime = True
    sum_divisors = 0
    for possible_divisor in range(1, current_number // 2 + 1):
        if current_number % possible_divisor == 0:
            sum_divisors += possible_divisor
    if sum_divisors == current_number:
        print(current_number)

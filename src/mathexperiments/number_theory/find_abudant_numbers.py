

def find_abudant_numbers(total_numbers=10):
    current_number = 2
    found_numbers = 0

    abudant_numbers = []

    while found_numbers < total_numbers:
        sum_divisors = 0
        for possible_divisor in range(1, current_number // 2 + 1):
            if current_number % possible_divisor == 0:
                sum_divisors += possible_divisor
        if sum_divisors > current_number:
            found_numbers += 1
            print(current_number)
            abudant_numbers.append(current_number)
        current_number += 1

    return abudant_numbers


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        total_numbers = int(sys.argv[1])
    else:
        total_numbers = 10
    find_abudant_numbers()

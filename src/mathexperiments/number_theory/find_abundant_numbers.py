import argparse


def find_abundant_numbers(total_numbers=10):
    current_number = 2
    found_numbers = 0

    abundant_numbers = []

    while found_numbers < total_numbers:
        sum_divisors = 0
        for possible_divisor in range(1, current_number // 2 + 1):
            if current_number % possible_divisor == 0:
                sum_divisors += possible_divisor
        if sum_divisors > current_number:
            found_numbers += 1
            print(current_number)
            abundant_numbers.append(current_number)
        current_number += 1

    return abundant_numbers


# Preserve the original misspelled API for existing callers.
find_abudant_numbers = find_abundant_numbers


def build_parser():
    parser = argparse.ArgumentParser(
        description='Find the first N abundant numbers.',
    )
    parser.add_argument(
        'total_numbers',
        nargs='?',
        type=int,
        default=10,
        help='number of abundant numbers to find (default: 10)',
    )
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    find_abundant_numbers(args.total_numbers)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

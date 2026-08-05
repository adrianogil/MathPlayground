import argparse


def fibonacci_numbers(total_numbers=10):
    """Return the requested number of Fibonacci numbers, starting with 1, 1."""
    if total_numbers < 1:
        raise ValueError('At least one Fibonacci number is required.')

    numbers = [1]
    if total_numbers == 1:
        return numbers

    numbers.append(1)
    while len(numbers) < total_numbers:
        numbers.append(numbers[-1] + numbers[-2])

    return numbers


def fibonacci_ratios(total_numbers=10):
    """Return ratios between consecutive Fibonacci numbers."""
    if total_numbers < 2:
        raise ValueError('At least two Fibonacci numbers are required for a ratio.')

    numbers = fibonacci_numbers(total_numbers)
    return [current / previous for previous, current in zip(numbers, numbers[1:])]


def build_parser():
    parser = argparse.ArgumentParser(
        description='Show how Fibonacci ratios approach the golden ratio.',
    )
    parser.add_argument(
        'total_numbers',
        nargs='?',
        type=int,
        default=10,
        help='number of Fibonacci numbers to generate (default: 10)',
    )
    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        numbers = fibonacci_numbers(args.total_numbers)
        ratios = fibonacci_ratios(args.total_numbers)
    except ValueError as exception:
        parser.error(str(exception))
        return 2

    for previous, current, ratio in zip(numbers, numbers[1:], ratios):
        print(f'{current} / {previous} = {ratio:.10f}')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())

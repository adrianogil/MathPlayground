import argparse


KAPREKAR_CONSTANT = 6174


def _validate_four_digit_value(number):
    if number < 0 or number > 9999:
        raise ValueError('The number must be between 0 and 9999.')


def kaprekar_step(number):
    """Perform one four-digit Kaprekar subtraction."""
    _validate_four_digit_value(number)
    digits = f'{number:04d}'
    ascending = int(''.join(sorted(digits)))
    descending = int(''.join(sorted(digits, reverse=True)))
    return descending - ascending


def kaprekar_sequence(number):
    """Return the sequence from a number to Kaprekar's constant, 6174."""
    _validate_four_digit_value(number)
    digits = f'{number:04d}'
    if len(set(digits)) == 1:
        raise ValueError('The number must contain at least two different digits.')

    sequence = [number]
    while sequence[-1] != KAPREKAR_CONSTANT:
        sequence.append(kaprekar_step(sequence[-1]))

    return sequence


def build_parser():
    parser = argparse.ArgumentParser(
        description="Apply Kaprekar's routine until reaching 6174.",
    )
    parser.add_argument(
        'number',
        type=int,
        help='starting value from 0000 to 9999 with at least two different digits',
    )
    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        sequence = kaprekar_sequence(args.number)
    except ValueError as exception:
        parser.error(str(exception))
        return 2

    print(' -> '.join(f'{number:04d}' for number in sequence))
    print(f'Reached {KAPREKAR_CONSTANT} in {len(sequence) - 1} steps.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

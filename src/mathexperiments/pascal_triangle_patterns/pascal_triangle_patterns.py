import argparse


def pascal_triangle(total_rows=8):
    """Return Pascal's triangle as a list of rows."""
    if total_rows < 1:
        raise ValueError('At least one row is required.')

    triangle = []
    for row_index in range(total_rows):
        row = [1]
        if triangle:
            previous_row = triangle[-1]
            row.extend(
                previous_row[index - 1] + previous_row[index]
                for index in range(1, row_index)
            )
            row.append(1)
        triangle.append(row)

    return triangle


def pascal_odd_pattern(total_rows=8, odd_character='*'):
    """Represent odd Pascal values with a character and even values with spaces."""
    if len(odd_character) != 1:
        raise ValueError('The odd-number marker must be one character.')

    triangle = pascal_triangle(total_rows)
    pattern_width = total_rows * 2 - 1
    pattern = []

    for row in triangle:
        row_pattern = ' '.join(
            odd_character if value % 2 else ' '
            for value in row
        )
        pattern.append(row_pattern.center(pattern_width).rstrip())

    return pattern


def build_parser():
    parser = argparse.ArgumentParser(
        description="Highlight odd values in Pascal's triangle.",
    )
    parser.add_argument(
        'total_rows',
        nargs='?',
        type=int,
        default=16,
        help='number of triangle rows to display (default: 16)',
    )
    parser.add_argument(
        '--marker',
        default='*',
        help='single character used for odd numbers (default: *)',
    )
    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        pattern = pascal_odd_pattern(args.total_rows, args.marker)
    except ValueError as exception:
        parser.error(str(exception))
        return 2

    print('\n'.join(pattern))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

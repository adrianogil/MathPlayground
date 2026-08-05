import argparse
import random


def estimate_pi(total_points=10_000, seed=None):
    """Estimate pi using random points in a unit square."""
    if total_points < 1:
        raise ValueError('At least one point is required.')

    rng = random.Random(seed)
    points_inside_circle = 0

    for _ in range(total_points):
        x = rng.random()
        y = rng.random()
        if x * x + y * y <= 1:
            points_inside_circle += 1

    return 4 * points_inside_circle / total_points


def build_parser():
    parser = argparse.ArgumentParser(
        description='Estimate pi with a Monte Carlo simulation.',
    )
    parser.add_argument(
        'total_points',
        nargs='?',
        type=int,
        default=10_000,
        help='number of random points to sample (default: 10000)',
    )
    parser.add_argument(
        '--seed',
        help='seed used to make the experiment repeatable',
    )
    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        estimate = estimate_pi(args.total_points, args.seed)
    except ValueError as exception:
        parser.error(str(exception))
        return 2

    print(f'Estimated pi: {estimate:.6f}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

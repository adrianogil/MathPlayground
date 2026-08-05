import argparse
import random


def estimate_shared_birthday_probability(
    group_size=23,
    total_trials=10_000,
    seed=None,
    days_in_year=365,
):
    """Estimate the chance that a group contains a shared birthday."""
    if group_size < 1:
        raise ValueError('The group must contain at least one person.')
    if total_trials < 1:
        raise ValueError('At least one trial is required.')
    if days_in_year < 1:
        raise ValueError('The year must contain at least one day.')

    rng = random.Random(seed)
    trials_with_shared_birthday = 0

    for _ in range(total_trials):
        birthdays = [rng.randrange(days_in_year) for _ in range(group_size)]
        if len(set(birthdays)) < group_size:
            trials_with_shared_birthday += 1

    return trials_with_shared_birthday / total_trials


def build_parser():
    parser = argparse.ArgumentParser(
        description='Estimate shared-birthday probabilities for group sizes.',
    )
    parser.add_argument(
        'group_sizes',
        nargs='*',
        type=int,
        default=[10, 23, 30, 50],
        help='group sizes to simulate (default: 10 23 30 50)',
    )
    parser.add_argument(
        '--trials',
        type=int,
        default=10_000,
        help='number of trials per group size (default: 10000)',
    )
    parser.add_argument(
        '--seed',
        help='seed used to make the experiment repeatable',
    )
    return parser


def main(argv=None):
    parser = build_parser()
    args = parser.parse_args(argv)

    for group_size in args.group_sizes:
        try:
            probability = estimate_shared_birthday_probability(
                group_size=group_size,
                total_trials=args.trials,
                seed=args.seed,
            )
        except ValueError as exception:
            parser.error(str(exception))
            return 2

        print(f'Group size {group_size}: {probability:.2%}')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())

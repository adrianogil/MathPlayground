"""Compatibility wrapper for the original misspelled module name."""

if __package__:
    from .find_abundant_numbers import (
        build_parser,
        find_abudant_numbers,
        find_abundant_numbers,
        main,
    )
else:
    from find_abundant_numbers import (
        build_parser,
        find_abudant_numbers,
        find_abundant_numbers,
        main,
    )

__all__ = [
    'build_parser',
    'find_abudant_numbers',
    'find_abundant_numbers',
    'main',
]


if __name__ == '__main__':
    raise SystemExit(main())

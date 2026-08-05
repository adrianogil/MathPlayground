import io
import unittest
from contextlib import redirect_stdout

from mathexperiments.birthday_paradox import (
    estimate_shared_birthday_probability,
    main,
)


class BirthdayParadoxTest(unittest.TestCase):
    def test_seeded_estimate_is_repeatable(self):
        first_estimate = estimate_shared_birthday_probability(
            group_size=23,
            total_trials=2_000,
            seed='math',
        )
        second_estimate = estimate_shared_birthday_probability(
            group_size=23,
            total_trials=2_000,
            seed='math',
        )

        self.assertEqual(first_estimate, second_estimate)
        self.assertGreater(first_estimate, 0.4)
        self.assertLess(first_estimate, 0.6)

    def test_one_person_cannot_share_a_birthday(self):
        self.assertEqual(
            estimate_shared_birthday_probability(1, total_trials=20, seed='solo'),
            0,
        )

    def test_more_people_than_days_guarantees_a_shared_birthday(self):
        self.assertEqual(
            estimate_shared_birthday_probability(
                group_size=6,
                total_trials=20,
                seed='pigeonhole',
                days_in_year=5,
            ),
            1,
        )

    def test_rejects_non_positive_trial_count(self):
        with self.assertRaisesRegex(ValueError, 'At least one trial'):
            estimate_shared_birthday_probability(total_trials=0)


class BirthdayParadoxCliTest(unittest.TestCase):
    def test_main_prints_each_requested_group_size(self):
        output = io.StringIO()

        with redirect_stdout(output):
            exit_code = main(['1', '366', '--trials', '5', '--seed', 'demo'])

        self.assertEqual(exit_code, 0)
        self.assertEqual(
            output.getvalue().splitlines(),
            ['Group size 1: 0.00%', 'Group size 366: 100.00%'],
        )


if __name__ == '__main__':
    unittest.main()

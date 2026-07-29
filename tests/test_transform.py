import unittest

import numpy as np

from mathlib.transform import (
    getOrientationMatrixX,
    getOrientationMatrixY,
    getOrientationMatrixZ,
    getScalingMatrix,
    getScalingMatrixFrom,
    getTranslationMatrix,
)
from mathlib.vector import createVector


class TranslationMatrixTest(unittest.TestCase):
    def test_translation_matrix_places_offsets_in_last_column(self):
        translation = createVector(3, -2, 4.5)

        np.testing.assert_array_equal(
            getTranslationMatrix(translation),
            np.array(
                [
                    [1, 0, 0, 3],
                    [0, 1, 0, -2],
                    [0, 0, 1, 4.5],
                    [0, 0, 0, 1],
                ]
            ),
        )

    def test_translation_matrix_moves_points_but_not_directions(self):
        matrix = getTranslationMatrix(createVector(10, 20, 30))

        np.testing.assert_array_equal(
            matrix @ np.array([1, 2, 3, 1]),
            np.array([11, 22, 33, 1]),
        )
        np.testing.assert_array_equal(
            matrix @ np.array([1, 2, 3, 0]),
            np.array([1, 2, 3, 0]),
        )

    def test_translation_rejects_values_without_vector_components(self):
        with self.assertRaises(AttributeError):
            getTranslationMatrix((1, 2, 3))


class OrientationMatrixTest(unittest.TestCase):
    def test_zero_angle_is_identity_for_every_axis(self):
        for orientation_matrix in (
            getOrientationMatrixX,
            getOrientationMatrixY,
            getOrientationMatrixZ,
        ):
            with self.subTest(axis=orientation_matrix.__name__):
                np.testing.assert_allclose(
                    orientation_matrix(0),
                    np.identity(4),
                    atol=1e-15,
                )

    def test_quarter_turns_rotate_around_the_expected_axis(self):
        quarter_turn = np.pi / 2
        cases = (
            (getOrientationMatrixX, [0, 1, 0, 1], [0, 0, 1, 1]),
            (getOrientationMatrixY, [0, 0, 1, 1], [1, 0, 0, 1]),
            (getOrientationMatrixZ, [1, 0, 0, 1], [0, 1, 0, 1]),
        )

        for orientation_matrix, original, expected in cases:
            with self.subTest(axis=orientation_matrix.__name__):
                np.testing.assert_allclose(
                    orientation_matrix(quarter_turn) @ original,
                    expected,
                    atol=1e-15,
                )

    def test_rotations_are_orthogonal_with_unit_determinant(self):
        theta = 0.731

        for orientation_matrix in (
            getOrientationMatrixX,
            getOrientationMatrixY,
            getOrientationMatrixZ,
        ):
            with self.subTest(axis=orientation_matrix.__name__):
                matrix = orientation_matrix(theta)

                np.testing.assert_allclose(
                    matrix @ matrix.T,
                    np.identity(4),
                    atol=1e-15,
                )
                self.assertAlmostEqual(np.linalg.det(matrix), 1)

    def test_rotation_rejects_non_numeric_angles(self):
        with self.assertRaises(TypeError):
            getOrientationMatrixX('ninety degrees')


class ScalingMatrixTest(unittest.TestCase):
    def test_scaling_matrix_supports_fractional_negative_and_zero_factors(self):
        matrix = getScalingMatrix(createVector(0.5, -2, 0))

        np.testing.assert_array_equal(
            matrix @ np.array([4, 3, 7, 1]),
            np.array([2, -6, 0, 1]),
        )

    def test_scaling_from_standard_basis_matches_regular_scaling(self):
        scale = createVector(2, 3, 4)
        standard_basis = (
            createVector(1, 0, 0),
            createVector(0, 1, 0),
            createVector(0, 0, 1),
        )

        np.testing.assert_array_equal(
            getScalingMatrixFrom(scale, *standard_basis),
            getScalingMatrix(scale),
        )

    def test_scaling_from_rotated_basis_scales_along_basis_vectors(self):
        scale = createVector(2, 3, 4)
        rotated_basis = (
            createVector(0, 1, 0),
            createVector(-1, 0, 0),
            createVector(0, 0, 1),
        )

        matrix = getScalingMatrixFrom(scale, *rotated_basis)

        np.testing.assert_array_equal(
            matrix,
            np.diag([3, 2, 4, 1]),
        )
        np.testing.assert_array_equal(
            matrix @ np.array([5, 7, 11, 1]),
            np.array([15, 14, 44, 1]),
        )

    def test_scaling_rejects_values_without_vector_components(self):
        with self.assertRaises(AttributeError):
            getScalingMatrix([2, 3, 4])

        basis = createVector(1, 0, 0)
        with self.assertRaises(AttributeError):
            getScalingMatrixFrom(createVector(2, 3, 4), basis, basis, object())


if __name__ == '__main__':
    unittest.main()

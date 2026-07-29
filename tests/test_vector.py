import unittest

from mathlib.vector import Vector3, createVector


class Vector3Test(unittest.TestCase):
    def test_create_vector_preserves_each_component(self):
        vector = createVector(-2, 3.5, 0)

        self.assertIsInstance(vector, Vector3)
        self.assertEqual((vector.x, vector.y, vector.z), (-2, 3.5, 0))

    def test_value_returns_a_three_row_column_vector(self):
        vector = Vector3(1, -4, 2.5)

        self.assertEqual(vector.value(), [[1], [-4], [2.5]])

    def test_value_returns_fresh_lists_that_reflect_current_components(self):
        vector = Vector3(1, 2, 3)
        first_value = vector.value()
        first_value[0][0] = 99
        vector.y = -2

        self.assertEqual(vector.value(), [[1], [-2], [3]])

    def test_constructor_requires_all_three_components(self):
        with self.assertRaises(TypeError):
            Vector3(1, 2)


if __name__ == '__main__':
    unittest.main()

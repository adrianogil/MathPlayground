import vector as v
import transform as t

import numpy as np

PI=np.pi
DEGREES_TO_RADIANS=PI/180

l = v.createVector(0,1,2)
m = t.getTranslationMatrix(l)
print("Translation matrix: " + str(m))
theta = 180*DEGREES_TO_RADIANS
print("Rotation matrix: " + str(t.getOrientationMatrixX(theta)))


v1 = v.createVector(1,0,1)
v2 = v.createVector(0,1,1)
v3 = v.createVector(1,2,0)

s = v.createVector(4,5,6)

s = t.getScalingMatrixFrom(s, v1, v2, v3)

print("Scaling matrix: " + str(t.getOrientationMatrixX(theta)))

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

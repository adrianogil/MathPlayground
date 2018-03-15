
class Vector3:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    def value(self):
        return [[self.x],[self.y],[self.z]]


def createVector(x,y,z):
    return Vector3(x,y,z)
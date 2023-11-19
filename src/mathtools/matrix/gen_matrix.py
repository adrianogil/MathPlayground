

def gen_matrix(width, height, equation, spacing):
    code = \
f"""
from math import *
from random import randint

width={width}
height={height}

for i in range(0, height):
    s = ""
    for j in range(0, width):
        a = {equation}
        s += str(a) + "{spacing}"
    print(s)

"""
    exec(code)


if __name__ == "__main__":
    import sys

    if len(sys.argv) == 1:
        print("Usage: python gen_matrix.py <width> <height> <equation> [spacing]")
        sys.exit(1)

    width = sys.argv[1]
    height = sys.argv[2]

    equation = sys.argv[3]

    spacing = sys.argv[4] if len(sys.argv) > 4 else " "

    gen_matrix(width, height, equation, spacing)

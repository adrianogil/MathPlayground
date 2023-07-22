def append_string_to_file(filename, text_to_append):
    """Appends a string to a text file."""
    with open(filename, 'a') as file:
        file.write(text_to_append + '\n')

# aˆx + b^y = c^z, x,y,z >= 3

for a in range(2, 100):
    for x in range(3, 100):
        for b in range(2, 100):
            for y in range(3, 100):
                result = pow(a, x) + pow(b, y)
                for c in range(2, 100):
                    for z in range(3, 100):
                        if pow(c, z) == result:
                            s = f"{a}^{x} + {b}^{y} = {c}^{z}"
                            append_string_to_file("result.txt", s)
                            print(s)

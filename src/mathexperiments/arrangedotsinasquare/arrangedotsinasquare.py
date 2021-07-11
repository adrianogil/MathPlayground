# https://web.facebook.com/groups/1923323131245618/posts/3226875040890414/

horizontal_half_equal = 0
vertical_half_equal = 0

horizontal_and_vertical_equal = 0

# Print the obtained permutations
for i in range(65536):
    binary_number = str(format(i, "016b"))
    binary_number =list(map(int, binary_number))

    horizontal = False
    vertical = False

    if sum(binary_number) == 8:
        if sum(binary_number[:8]) == sum(binary_number[8:]):
            horizontal_half_equal += 1
            horizontal = True

        if sum([b for i,b in enumerate(binary_number) if (i % 4) in [2,3]]) == sum([b for i,b in enumerate(binary_number) if (i % 4) in [0,1]]):
            vertical_half_equal += 1
            vertical = True

        if horizontal and vertical:
            horizontal_and_vertical_equal += 1

print(horizontal_half_equal)
print(vertical_half_equal)
print(horizontal_and_vertical_equal)

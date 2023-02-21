# Get total stoppping time of a number using rules from Collatz Conjecture

DebugShowNEachStep = False

def get_total_stopping_time(n):
    if DebugShowNEachStep:
        print("%d" % (n,))
    if n == 1:
        return 1

    if n % 2 == 0:
        return 1 + get_total_stopping_time(n / 2)
    return 1 + get_total_stopping_time(3 * n + 1)


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Error! Missing parameter!")
        print("Usage:")
        print("\tpython3 get_total_stopping_time.py <target_integer_number>")
        exit()

    DebugShowNEachStep = '-d' in sys.argv or '--debug' in sys.argv

    def show_stopping_time(n):
        target_number = int(n)
        total_stopping_time = get_total_stopping_time(target_number)
        print(f"Total stopping time of {target_number} is {total_stopping_time}")

    target_input = sys.argv[1]
    if ":" in target_input:
        target_range = target_input.split(":")
        target_range[0] = int(target_range[0])
        target_range[1] = int(target_range[1])
        for n in range(target_range[0], target_range[1]):
            show_stopping_time(n)
    else:
        show_stopping_time(int(target_input))

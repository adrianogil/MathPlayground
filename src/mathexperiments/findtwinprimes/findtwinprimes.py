import sys

target_number_of_primes = 10

if len(sys.argv) > 1:
    target_number_of_primes = int(sys.argv[1])

print('Finding %sth first primes...' % (target_number_of_primes,))

found_primes = [2]
current_number = 3

while len(found_primes) < target_number_of_primes:
    is_prime = True
    for possible_divisor in range(2, current_number):
        if current_number % possible_divisor == 0:
            is_prime = False
            break
    if is_prime:
        found_primes.append(current_number)
    current_number += 1

for i in range(0, len(found_primes)):
    if i > 0:
        pl1 = found_primes[i-1]
    else:
        pl1 = 0
    
    p = found_primes[i]

    if i < len(found_primes) - 1:
        p1 = found_primes[i+1]
    else:
        p1 = 0

    if p + 2 == p1 or pl1 == p - 2:
        print(p, "(twin)")
    else:
        print(p)

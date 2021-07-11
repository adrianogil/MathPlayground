# Find numbers equal to the sum of own digits raised to the nth power
# in which n is incremented for each new digit (left to right)

for number in range(10, 1000000):
	number_digits = list(map(int, str(number)))
	result = 0
	i = 1
	for digit in number_digits:
		result += digit ** i
		i += 1
	if number == result:
		print(number)
	# print('[findperfectdigitsum] None -' + ' number - ' + str(number) + ' result - ' + str(result))

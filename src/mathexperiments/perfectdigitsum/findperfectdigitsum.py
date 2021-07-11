

for i in range(1000, 1000000):
	first_half = i // 1000
	second_half = i - first_half*1000

	if i == (first_half * second_half):
		print(i)

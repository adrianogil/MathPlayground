a = float(input('Enter the coefficient of x^2: '))
b = float(input('Enter the coefficient of x: '))
c = float(input('Enter the constant: '))

# Calculate the discriminant
discriminant = b**2 - 4*a*c

# Calculate the roots
root1 = (-b + (discriminant)**0.5) / (2*a)
root2 = (-b - (discriminant)**0.5) / (2*a)

# Display the roots
print('The roots of the quadratic equation are:', root1, 'and', root2)

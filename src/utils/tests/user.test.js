import { getFirstName, isValidPassword } from '../user';

test('Should return first name when given full name', () => {
    const firstName = getFirstName('Elijah Pekson');
    expect(firstName).toBe('Elijah');
});

test('Should return first name when given first name only', () => {
    const firstName = getFirstName('Elijah');
    expect(firstName).toBe('Elijah');
});

test('Should reject password shorter than 8 characters', () => {
    const check = isValidPassword('short');
    expect(check).toBe(false);
});

test('Should reject password that contains the word password', () => {
    const check = isValidPassword('password1234');
    expect(check).toBe(false);
});

test('Should correctly validate a valid password', () => {
    const check = isValidPassword('valid12345');
    expect(check).toBe(true);
});
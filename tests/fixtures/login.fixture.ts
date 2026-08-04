export const invalidOpenCartLoginCases = [
  {
    name: 'an email with an invalid format',
    email: 'not-an-email',
    password: 'wrongpassword',
  },
  {
    name: 'empty required fields',
    email: '',
    password: '',
  },
  {
    name: 'an overlong password',
    email: 'invalid@example.com',
    password: 'x'.repeat(256),
  },
];

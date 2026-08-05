export const invalidOpenCartLoginCases = [
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

export const fakeStoreApi = {
  baseUrl: 'https://fakestoreapi.com',
  loginPath: '/auth/login',
};

export const validApiUser = {
  username: 'mor_2314',
  password: '83r5^_',
};

export const invalidApiUser = {
  username: 'mor_2314',
  password: 'invalid-password',
};

export const invalidApiLoginCases: Array<{
  name: string;
  payload: Record<string, unknown>;
  expectedStatus: number;
  expectedMessage: string;
}> = [
  {
    name: 'a payload without the required password',
    payload: { username: 'mor_2314' },
    expectedStatus: 400,
    expectedMessage: 'username and password are not provided in JSON format',
  },
  {
    name: 'empty required fields',
    payload: { username: '', password: '' },
    expectedStatus: 400,
    expectedMessage: 'username and password are not provided in JSON format',
  },
  {
    name: 'a null password',
    payload: { username: 'mor_2314', password: null },
    expectedStatus: 400,
    expectedMessage: 'username and password are not provided in JSON format',
  },
  {
    name: 'whitespace-only credentials',
    payload: { username: '   ', password: '   ' },
    expectedStatus: 401,
    expectedMessage: 'username or password is incorrect',
  },
  {
    name: 'an overlong password',
    payload: { username: 'mor_2314', password: 'x'.repeat(256) },
    expectedStatus: 401,
    expectedMessage: 'username or password is incorrect',
  },
  {
    name: 'credentials with invalid data types',
    payload: { username: 123, password: true },
    expectedStatus: 401,
    expectedMessage: 'username or password is incorrect',
  },
];

export const invalidApiBodyCases = [
  {
    name: 'malformed JSON',
    body: '{"username":',
  },
  {
    name: 'a top-level null payload',
    body: 'null',
  },
];

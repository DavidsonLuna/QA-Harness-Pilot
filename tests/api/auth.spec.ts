import { expect, test } from '@playwright/test';
import {
  fakeStoreApi,
  invalidApiLoginCases,
  invalidApiUser,
  validApiUser,
} from '../fixtures/auth-api.fixture';

test.describe('Fake Store API authentication', () => {
  test('returns a token for valid credentials', async ({ request }) => {
    const response = await request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, {
      data: validApiUser,
    });

    await expect(response).toBeOK();
    expect(response.status()).toBe(201);
    const body = (await response.json()) as { token: string };
    expect(body.token).toEqual(expect.any(String));
    expect(body.token).not.toBe('');
  });

  test('rejects invalid credentials', async ({ request }) => {
    const response = await request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, {
      data: invalidApiUser,
    });

    expect(response.status()).toBe(401);
    await expect(response.text()).resolves.toBe('username or password is incorrect');
  });

  for (const invalidCase of invalidApiLoginCases) {
    test(`rejects ${invalidCase.name}`, async ({ request }) => {
      const response = await request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, {
        data: invalidCase.payload,
      });

      expect(response.status()).toBe(invalidCase.expectedStatus);
      await expect(response.text()).resolves.toBe(invalidCase.expectedMessage);
    });
  }

  test('handles duplicate valid login submissions independently', async ({ request }) => {
    const responses = await Promise.all(
      Array.from({ length: 2 }, () =>
        request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, { data: validApiUser }),
      ),
    );

    for (const response of responses) {
      expect(response.status()).toBe(201);
      expect(((await response.json()) as { token: string }).token).not.toBe('');
    }
  });
});

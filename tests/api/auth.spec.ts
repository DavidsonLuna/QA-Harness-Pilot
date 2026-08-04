import { expect, test } from '@playwright/test';
import { fakeStoreApi, invalidApiUser, validApiUser } from '../fixtures/auth-api.fixture';

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
});

import { expect, test } from '@playwright/test';
import { fakeStoreApi, validApiUser } from '../fixtures/auth-api.fixture';

test.describe('Fake Store API auth contract', () => {
  test('returns the documented login response contract', async ({ request }) => {
    const response = await request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, {
      data: validApiUser,
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = (await response.json()) as { token: string };
    expect(body).toEqual({ token: expect.any(String) });
    expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });
});

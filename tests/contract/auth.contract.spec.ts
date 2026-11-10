import { expect, test } from '@playwright/test';
import { fakeStoreApi, invalidApiUser, validApiUser } from '../fixtures/auth-api.fixture';

test.describe('Fake Store API auth contract', () => {
  test('returns the documented login response contract', async ({ request }) => {
    const url = `${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`;

    const response = await request.post(url, {
      data: JSON.stringify(validApiUser),
      headers: { 'Content-Type': 'application/json' },
    });

    const text = await response.text().catch(() => '<unable to read body>');
    const status = response.status();

    if (![200, 201].includes(status)) {
      console.error('Login request failed:', { url, status, body: text });
    }

    expect([200, 201]).toContain(status);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = JSON.parse(text) as { token: string };
    expect(body).toEqual({ token: expect.any(String) });
    expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });

  test('returns the documented error contract for invalid credentials', async ({ request }) => {
    const response = await request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, {
      data: JSON.stringify(invalidApiUser),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(401);
    expect(response.headers()['content-type']).toContain('text/plain');
    expect((await response.text()).trim().toLowerCase()).toContain('username or password');
  });
});

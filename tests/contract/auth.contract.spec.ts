import { expect, test } from '@playwright/test';
import { fakeStoreApi, validApiUser } from '../fixtures/auth-api.fixture';

test.describe('Fake Store API auth contract', () => {
  test('returns the documented login response contract', async ({ request }) => {
    const url = `${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`;

    const response = await request.post(url, {
      data: JSON.stringify(validApiUser),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status() !== 200) {
      const text = await response.text().catch(() => '<unable to read body>');
      console.error('Login request failed:', { url, status: response.status(), body: text });
    }

    expect(response.status(), `POST ${url} returned ${await response.text().catch(() => '<body unavailable>')}`).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = (await response.json()) as { token: string };
    expect(body).toEqual({ token: expect.any(String) });
    expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });
});

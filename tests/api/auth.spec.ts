import { expect, test } from '@playwright/test';
import {
  fakeStoreApi,
  invalidApiLoginCases,
  invalidApiUser,
  validApiUser,
  successStatus,
} from '../fixtures/auth-api.fixture';

async function debugResponse(response: any) {
  if (!response.ok()) {
    const body = await response.text();
    // eslint-disable-next-line no-console
    console.log('DEBUG response status:', response.status(), 'body:', body);
  }
}
test.describe('Fake Store API authentication', () => {
  test('returns a token for valid credentials', async ({ request }) => {
    const response = await request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, {
      data: JSON.stringify(validApiUser),
      headers: { 'Content-Type': 'application/json' },
    });

    await debugResponse(response);
    await expect(response).toBeOK();
    expect([successStatus, 201]).toContain(response.status());
    const body = (await response.json()) as { token: string };
    expect(body.token).toEqual(expect.any(String));
    expect(body.token).not.toBe('');
  });

  test('rejects invalid credentials', async ({ request }) => {
    const response = await request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, {
      data: JSON.stringify(invalidApiUser),
      headers: { 'Content-Type': 'application/json' },
    });

    await debugResponse(response);
    expect(response.status()).toBe(401);
    const text = (await response.text()).trim().toLowerCase();
    expect(text).toContain('username');
    expect(text).toContain('password');
  });

  for (const invalidCase of invalidApiLoginCases) {
    test(`rejects ${invalidCase.name}`, async ({ request }) => {
      const response = await request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, {
        data: JSON.stringify(invalidCase.payload),
        headers: { 'Content-Type': 'application/json' },
      });

      await debugResponse(response);
      expect(response.status()).toBe(invalidCase.expectedStatus);
      const text = (await response.text()).trim().toLowerCase();
      if (invalidCase.expectedMessage.includes('not provided')) {
        expect(text).toContain('not provided');
      } else if (invalidCase.expectedMessage.includes('incorrect')) {
        expect(text).toContain('username');
        expect(text).toContain('password');
      } else {
        expect(text).toContain(invalidCase.expectedMessage.toLowerCase());
      }
    });
  }

  test('handles duplicate valid login submissions independently', async ({ request }) => {
    const responses = await Promise.all(
      Array.from({ length: 2 }, () =>
        request.post(`${fakeStoreApi.baseUrl}${fakeStoreApi.loginPath}`, {
          data: JSON.stringify(validApiUser),
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    for (const response of responses) {
      await debugResponse(response);
      expect([successStatus, 201]).toContain(response.status());
      expect(((await response.json()) as { token: string }).token).not.toBe('');
    }
  });
});

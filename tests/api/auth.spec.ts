import { expect, test } from '@playwright/test';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import {
  fakeStoreApi,
  invalidApiLoginCases,
  invalidApiUser,
  validApiUser,
  successStatus,
} from '../fixtures/auth-api.fixture';

let mockProcess: ChildProcessWithoutNullStreams | undefined;
const mockPort = process.env.MOCK_PORT ?? '3001';

async function debugResponse(response: any, label = '') {
  const status = response.status();
  const headersObj: Record<string, string> = {};
  try {
    const headers = response.headers ? response.headers() : {};
    for (const k of Object.keys(headers)) {
      // @ts-ignore index
      headersObj[k] = headers[k];
    }
  } catch (e) {
    // ignore header extraction errors
  }
  let bodyText: string;
  try {
    bodyText = await response.text();
  } catch (e) {
    bodyText = `<unable to read body: ${String(e)}>`;
  }
  // eslint-disable-next-line no-console
  console.log(`DEBUG ${label} response status: ${status}\nheaders: ${JSON.stringify(headersObj)}\nbody: ${bodyText}`);
}

function getLoginUrl() {
  const base = process.env.USE_LOCAL_MOCK === 'true' ? `http://127.0.0.1:${mockPort}` : fakeStoreApi.baseUrl;
  return `${base}${fakeStoreApi.loginPath}`;
}

test.beforeAll(async () => {
  if (process.env.USE_LOCAL_MOCK === 'true') {
    mockProcess = spawn('node', ['tests/mocks/mock-server.js'], {
      env: { ...process.env, MOCK_PORT: mockPort },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Mock server start timeout')), 5000);
      mockProcess!.stdout.on('data', (chunk) => {
        const s = String(chunk);
        if (s.toLowerCase().includes('listening')) {
          clearTimeout(timeout);
          resolve();
        }
      });
      mockProcess!.on('exit', (code) => {
        clearTimeout(timeout);
        reject(new Error('Mock server exited early: ' + code));
      });
    });
  }
});

test.afterAll(() => {
  if (mockProcess) {
    mockProcess.kill();
  }
});
test.describe('Fake Store API authentication', () => {
  test('returns a token for valid credentials', async ({ request }) => {
    const response = await request.post(getLoginUrl(), {
      data: JSON.stringify(validApiUser),
      headers: { 'Content-Type': 'application/json' },
    });

    await debugResponse(response, 'login-valid');
    await expect(response).toBeOK();
    expect([successStatus, 201]).toContain(response.status());
    const body = (await response.json()) as { token: string };
    expect(body.token).toEqual(expect.any(String));
    expect(body.token).not.toBe('');
  });

  test('rejects invalid credentials', async ({ request }) => {
    const response = await request.post(getLoginUrl(), {
      data: JSON.stringify(invalidApiUser),
      headers: { 'Content-Type': 'application/json' },
    });

    await debugResponse(response, 'login-invalid');
    expect(response.status()).toBe(401);
    const text = (await response.text()).trim().toLowerCase();
    expect(text).toContain('username');
    expect(text).toContain('password');
  });

  for (const invalidCase of invalidApiLoginCases) {
    test(`rejects ${invalidCase.name}`, async ({ request }) => {
      const response = await request.post(getLoginUrl(), {
        data: JSON.stringify(invalidCase.payload),
        headers: { 'Content-Type': 'application/json' },
      });

      await debugResponse(response, `login-${invalidCase.name}`);
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
        request.post(getLoginUrl(), {
          data: JSON.stringify(validApiUser),
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    for (const response of responses) {
      await debugResponse(response, 'login-duplicate');
      expect([successStatus, 201]).toContain(response.status());
      expect(((await response.json()) as { token: string }).token).not.toBe('');
    }
  });
});

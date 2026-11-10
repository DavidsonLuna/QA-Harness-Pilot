import http from 'k6/http';
import { check } from 'k6';
import { createExecutiveReport } from './report.js';

http.setResponseCallback(http.expectedStatuses(200, 201, 401));

const profile = __ENV.K6_PROFILE || 'smoke';
const baseUrl = __ENV.K6_BASE_URL;
const username = __ENV.K6_USERNAME;
const password = __ENV.K6_PASSWORD;
const apiPath = __ENV.K6_API_PATH || '/auth/login';
const requestUrl = `${(baseUrl || '').replace(/\/+$/, '')}${apiPath.startsWith('/') ? apiPath : `/${apiPath}`}`;
const authorized = __ENV.K6_CONFIRM_AUTHORIZED_TARGET === 'true';
const highLoadAuthorized = __ENV.K6_ALLOW_HIGH_LOAD === 'true';

function positiveInteger(value, defaultValue, variableName) {
  const parsed = Number(value || defaultValue);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${variableName} must be a positive integer.`);
  }
  return parsed;
}

if (!baseUrl || !/^https?:\/\/[^/]+(?:\/[^?#]*)?$/i.test(baseUrl.replace(/\/+$/, ''))) {
  throw new Error('Set K6_BASE_URL to an explicit http(s) URL for an environment you control.');
}
if (!username || !password) {
  throw new Error('Set K6_USERNAME and K6_PASSWORD for the test account.');
}
if (!authorized) {
  throw new Error('Set K6_CONFIRM_AUTHORIZED_TARGET=true only after confirming you are authorized to test this target.');
}
if (['load', 'spike', 'soak'].includes(profile) && !highLoadAuthorized) {
  throw new Error(`The ${profile} profile also requires K6_ALLOW_HIGH_LOAD=true.`);
}

const failureRateThreshold = Number(__ENV.K6_FAILURE_RATE_THRESHOLD || 0.01);
const p95ThresholdMs = positiveInteger(__ENV.K6_P95_THRESHOLD_MS, 500, 'K6_P95_THRESHOLD_MS');
if (!Number.isFinite(failureRateThreshold) || failureRateThreshold < 0 || failureRateThreshold > 1) {
  throw new Error('K6_FAILURE_RATE_THRESHOLD must be a number from 0 to 1.');
}

const profiles = {
  smoke: {
    scenarios: {
      api: { executor: 'shared-iterations', vus: 1, iterations: 1, maxDuration: '20s' },
    },
  },
  performance: {
    scenarios: {
      api: {
        executor: 'constant-vus',
        vus: positiveInteger(__ENV.K6_VUS, 2, 'K6_VUS'),
        duration: __ENV.K6_DURATION || '1m',
      },
    },
  },
  load: {
    scenarios: {
      api: {
        executor: 'ramping-vus',
        startVUs: 1,
        stages: [
          { duration: '30s', target: 5 },
          { duration: '1m', target: 10 },
          { duration: '1m', target: 10 },
          { duration: '30s', target: 0 },
        ],
        gracefulRampDown: '10s',
      },
    },
  },
  spike: {
    scenarios: {
      api: {
        executor: 'ramping-vus',
        startVUs: 1,
        stages: [
          { duration: '10s', target: 2 },
          { duration: '5s', target: 20 },
          { duration: '20s', target: 20 },
          { duration: '5s', target: 2 },
          { duration: '10s', target: 0 },
        ],
        gracefulRampDown: '5s',
      },
    },
  },
  soak: {
    scenarios: {
      api: {
        executor: 'constant-vus',
        vus: positiveInteger(__ENV.K6_VUS, 5, 'K6_VUS'),
        duration: __ENV.K6_DURATION || '10m',
      },
    },
  },
  synthetic: {
    scenarios: {
      api: {
        executor: 'constant-arrival-rate',
        rate: 1,
        timeUnit: '30s',
        duration: __ENV.K6_DURATION || '1m',
        preAllocatedVUs: 1,
        maxVUs: 1,
      },
    },
  },
};

if (!profiles[profile]) {
  throw new Error(`Unknown K6_PROFILE "${profile}". Use smoke, performance, load, spike, soak, or synthetic.`);
}

export const options = {
  ...profiles[profile],
  thresholds: {
    checks: ['rate==1'],
    http_req_failed: [`rate<${failureRateThreshold}`],
    ...(profile === 'smoke'
      ? {}
      : { http_req_duration: [`p(95)<${positiveInteger(p95ThresholdMs, 500, 'K6_P95_THRESHOLD_MS')}`] }),
  },
};

function postLogin(payload, tags) {
  return http.post(requestUrl, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    tags: { profile, ...tags },
    timeout: __ENV.K6_TIMEOUT || '10s',
  });
}

function assertSuccessfulLogin(response) {
  let body = null;
  try {
    body = response.json();
  } catch {
    body = null;
  }

  check(response, {
    'valid login returns HTTP 200 or 201': (res) => [200, 201].includes(res.status),
    'valid login returns a non-empty token': () =>
      body !== null && typeof body.token === 'string' && body.token.trim().length > 0,
  });
}

export default function () {
  const response = postLogin({ username, password }, { operation: 'valid-login' });
  assertSuccessfulLogin(response);

  if (profile === 'smoke') {
    const invalidResponse = postLogin(
      { username, password: `${password}-invalid` },
      { operation: 'invalid-login' },
    );
    check(invalidResponse, {
      'invalid credentials are rejected with HTTP 401': (res) => res.status === 401,
      'invalid credentials return an explanatory response': (res) =>
        /username|password/i.test(String(res.body || '')),
    });
  }
}

export function handleSummary(data) {
  return {
    [`performance-reports/${profile}.html`]: createExecutiveReport(data, profile),
    stdout: `K6 ${profile} run completed. Executive report: performance-reports/${profile}.html\n`,
  };
}

---
name: qa-performance
description: 'Plan, implement, run, and interpret Grafana k6 API smoke, performance, load, spike, soak, and synthetic monitoring checks in this repository. Use when adding backend performance coverage or reviewing k6 results.'
---

# QA Performance Testing

Use this workflow to add or execute backend checks with Grafana k6 alongside the Playwright suites.

## Current harness

- The example target is the login contract at `/auth/login`, which returns a token on success.
- `tests/performance/api.js` defines smoke, performance, load, spike, soak, and synthetic profiles.
- `tests/performance/report.js` creates a standalone executive HTML report with interactive latency and check charts.
- K6 is an external CLI; install a supported Grafana k6 release before running the npm scripts.

## Safe execution

1. Use only a system you own or are explicitly authorized to test. Prefer a local mock or an isolated staging environment.
2. Set `K6_BASE_URL`, `K6_USERNAME`, and `K6_PASSWORD` in the shell or secret store. Never commit credentials or target-specific secrets.
3. Set `K6_CONFIRM_AUTHORIZED_TARGET=true` for any profile. `load`, `spike`, and `soak` additionally require `K6_ALLOW_HIGH_LOAD=true`.
4. Start with `npm run test:k6:smoke`; inspect the generated report before increasing concurrency or duration.
5. Adjust thresholds and workload only with the service owner. Treat the starter p95 limit as an example SLO, not a universal service objective.

Example against the local mock:

```bash
npm run test:mock-server
K6_BASE_URL=http://127.0.0.1:3001 \
K6_USERNAME=mor_2314 \
K6_PASSWORD='83r5^_' \
K6_CONFIRM_AUTHORIZED_TARGET=true \
npm run test:k6:smoke
```

## Add a profile or endpoint

1. Keep test behavior and payload data in `tests/performance/`; avoid credentials or production URLs in source.
2. Define explicit workload executors, stages, ramp-down, duration, and thresholds in `tests/performance/api.js`.
3. Add a dedicated npm script in `package.json` and document the expected target, permissions, and runtime in `README.md`.
4. Include a successful-path check and a meaningful negative/error check when the profile is validating a functional contract. Do not mix invalid requests into sustained throughput measurements unless that is intentional and reported separately.
5. Keep checks independent and ensure the HTML report includes the metric definitions and enough context for an operator to make a decision.
6. Validate syntax and test against a controlled local service before enabling any scheduled or CI run.

## Additional test strategies

Consider capacity/breakpoint, rate-limit and quota behavior, failover/recovery, dependency degradation, data integrity under concurrency, multi-region latency, and security testing. Agree on a hypothesis, guardrails, rollback criteria, and owner before testing resilience or security behavior.

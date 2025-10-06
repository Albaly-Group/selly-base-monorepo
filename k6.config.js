import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Load test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '2m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'],                  // Error rate under 1%
    errors: ['rate<0.05'],                           // Custom error rate under 5%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001';

export default function () {
  // Health check
  let healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Get companies list (unauthenticated endpoint for load testing)
  let companiesRes = http.get(`${BASE_URL}/api/v1/companies?page=1&limit=10`);
  check(companiesRes, {
    'companies list status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(2);
}

// Smoke test - verify system works with minimal load
export function smokeTest() {
  http.get(`${BASE_URL}/health`);
}

// Stress test - push system beyond normal capacity
export function stressTest() {
  options.stages = [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 200 },
    { duration: '1m', target: 300 },
    { duration: '2m', target: 300 },
    { duration: '1m', target: 0 },
  ];
}

// Spike test - sudden large spike in traffic
export function spikeTest() {
  options.stages = [
    { duration: '10s', target: 10 },
    { duration: '10s', target: 200 },
    { duration: '1m', target: 200 },
    { duration: '10s', target: 10 },
    { duration: '30s', target: 0 },
  ];
}

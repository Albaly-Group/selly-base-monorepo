import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { expect } from '@playwright/test';

/**
 * Contract Testing with Pact
 * 
 * These tests verify that the API contract between consumer (frontend) and provider (backend)
 * is maintained. This ensures that changes to the API don't break the frontend.
 * 
 * Consumer: Frontend (web app)
 * Provider: Backend API
 */

describe('Pact Contract Tests', () => {
  let provider: Pact;

  beforeAll(async () => {
    provider = new Pact({
      consumer: 'SellyBaseFrontend',
      provider: 'SellyBaseAPI',
      port: 9000,
      log: path.resolve(process.cwd(), 'logs', 'pact.log'),
      dir: path.resolve(process.cwd(), 'pacts'),
      logLevel: 'info',
      spec: 2,
    });

    await provider.setup();
  });

  afterAll(async () => {
    await provider.finalize();
  });

  afterEach(async () => {
    await provider.verify();
  });

  describe('Companies API Contract', () => {
    test('should get list of companies', async () => {
      // Define the expected interaction
      await provider.addInteraction({
        state: 'companies exist',
        uponReceiving: 'a request for companies list',
        withRequest: {
          method: 'GET',
          path: '/api/v1/companies',
          query: {
            page: '1',
            limit: '10',
          },
          headers: {
            Accept: 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            data: [
              {
                id: 1,
                name: 'Test Company',
                email: 'test@company.com',
                phone: '1234567890',
                address: '123 Test St',
                createdAt: '2024-01-01T00:00:00.000Z',
              },
            ],
            meta: {
              total: 1,
              page: 1,
              limit: 10,
            },
          },
        },
      });

      // Make the actual request
      const response = await fetch('http://localhost:9000/api/v1/companies?page=1&limit=10', {
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.meta).toBeDefined();
    });

    test('should create a new company', async () => {
      await provider.addInteraction({
        state: 'user is authenticated',
        uponReceiving: 'a request to create a company',
        withRequest: {
          method: 'POST',
          path: '/api/v1/companies',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer valid-token',
          },
          body: {
            name: 'New Company',
            email: 'new@company.com',
            phone: '9876543210',
            address: '456 New St',
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            data: {
              id: 2,
              name: 'New Company',
              email: 'new@company.com',
              phone: '9876543210',
              address: '456 New St',
              createdAt: '2024-01-02T00:00:00.000Z',
            },
          },
        },
      });

      const response = await fetch('http://localhost:9000/api/v1/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer valid-token',
        },
        body: JSON.stringify({
          name: 'New Company',
          email: 'new@company.com',
          phone: '9876543210',
          address: '456 New St',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.id).toBeDefined();
      expect(data.data.name).toBe('New Company');
    });

    test('should get a single company by ID', async () => {
      await provider.addInteraction({
        state: 'company with ID 1 exists',
        uponReceiving: 'a request for company with ID 1',
        withRequest: {
          method: 'GET',
          path: '/api/v1/companies/1',
          headers: {
            Accept: 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            data: {
              id: 1,
              name: 'Test Company',
              email: 'test@company.com',
              phone: '1234567890',
              address: '123 Test St',
              createdAt: '2024-01-01T00:00:00.000Z',
            },
          },
        },
      });

      const response = await fetch('http://localhost:9000/api/v1/companies/1', {
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.id).toBe(1);
      expect(data.data.name).toBeDefined();
    });

    test('should return 404 for non-existent company', async () => {
      await provider.addInteraction({
        state: 'company with ID 999 does not exist',
        uponReceiving: 'a request for non-existent company',
        withRequest: {
          method: 'GET',
          path: '/api/v1/companies/999',
          headers: {
            Accept: 'application/json',
          },
        },
        willRespondWith: {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            error: 'Company not found',
            statusCode: 404,
          },
        },
      });

      const response = await fetch('http://localhost:9000/api/v1/companies/999', {
        headers: {
          Accept: 'application/json',
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Authentication API Contract', () => {
    test('should authenticate user with valid credentials', async () => {
      await provider.addInteraction({
        state: 'user exists with valid credentials',
        uponReceiving: 'a login request with valid credentials',
        withRequest: {
          method: 'POST',
          path: '/api/v1/auth/login',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: {
            email: 'test@example.com',
            password: 'password123',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            data: {
              token: 'jwt-token-string',
              user: {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
              },
            },
          },
        },
      });

      const response = await fetch('http://localhost:9000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.token).toBeDefined();
      expect(data.data.user).toBeDefined();
    });

    test('should reject invalid credentials', async () => {
      await provider.addInteraction({
        state: 'user credentials are invalid',
        uponReceiving: 'a login request with invalid credentials',
        withRequest: {
          method: 'POST',
          path: '/api/v1/auth/login',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
        },
        willRespondWith: {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            error: 'Invalid credentials',
            statusCode: 401,
          },
        },
      });

      const response = await fetch('http://localhost:9000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
    });
  });
});

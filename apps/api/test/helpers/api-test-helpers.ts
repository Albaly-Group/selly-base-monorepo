import { APIRequestContext, expect } from '@playwright/test';

/**
 * Helper utilities for standardized API testing with Playwright
 */

export interface ApiResponse<T = any> {
  status: number;
  body: T;
  headers: Record<string, string>;
}

/**
 * Base API helper class for making requests
 */
export class ApiTestHelper {
  constructor(private request: APIRequestContext) {}

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, options: {
    query?: Record<string, any>;
    headers?: Record<string, string>;
  } = {}): Promise<ApiResponse<T>> {
    const response = await this.request.get(url, {
      params: options.query,
      headers: options.headers,
    });

    const body = await response.json().catch(() => ({}));
    const headers = response.headers();

    return {
      status: response.status(),
      body,
      headers,
    };
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, options: {
    data?: any;
    headers?: Record<string, string>;
  } = {}): Promise<ApiResponse<T>> {
    const response = await this.request.post(url, {
      data: options.data,
      headers: options.headers,
    });

    const body = await response.json().catch(() => ({}));
    const headers = response.headers();

    return {
      status: response.status(),
      body,
      headers,
    };
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, options: {
    data?: any;
    headers?: Record<string, string>;
  } = {}): Promise<ApiResponse<T>> {
    const response = await this.request.put(url, {
      data: options.data,
      headers: options.headers,
    });

    const body = await response.json().catch(() => ({}));
    const headers = response.headers();

    return {
      status: response.status(),
      body,
      headers,
    };
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, options: {
    headers?: Record<string, string>;
  } = {}): Promise<ApiResponse<T>> {
    const response = await this.request.delete(url, {
      headers: options.headers,
    });

    const body = await response.json().catch(() => ({}));
    const headers = response.headers();

    return {
      status: response.status(),
      body,
      headers,
    };
  }

  /**
   * Assert response status
   */
  assertStatus(response: ApiResponse, expectedStatus: number): void {
    expect(response.status).toBe(expectedStatus);
  }

  /**
   * Assert response has property
   */
  assertHasProperty(response: ApiResponse, property: string): void {
    expect(response.body).toHaveProperty(property);
  }

  /**
   * Assert response property value
   */
  assertPropertyValue(response: ApiResponse, property: string, value: any): void {
    expect(response.body).toHaveProperty(property, value);
  }

  /**
   * Assert array response
   */
  assertIsArray(response: ApiResponse, property?: string): void {
    const target = property ? response.body[property] : response.body;
    expect(Array.isArray(target)).toBe(true);
  }
}

/**
 * Authentication helper for managing auth tokens
 */
export class AuthHelper {
  private token: string | null = null;

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  getAuthHeader(): Record<string, string> {
    if (!this.token) {
      return {};
    }
    return {
      'Authorization': `Bearer ${this.token}`,
    };
  }

  clearToken(): void {
    this.token = null;
  }
}

/**
 * Test data helper for managing test state
 */
export class TestDataHelper {
  private data: Map<string, any> = new Map();

  set(key: string, value: any): void {
    this.data.set(key, value);
  }

  get<T = any>(key: string): T | undefined {
    return this.data.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  clear(): void {
    this.data.clear();
  }
}

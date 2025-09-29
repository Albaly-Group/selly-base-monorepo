// API client for communicating with NestJS backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface CompanySearchParams {
  searchTerm?: string;
  organizationId?: string;
  includeSharedData?: boolean;
  page?: number;
  limit?: number;
  dataSensitivity?: string;
  dataSource?: string;
  verificationStatus?: string;
  companySize?: string;
  province?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organization?: {
      id: string;
      name: string;
    };
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organization?: {
    id: string;
    name: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string, params?: Record<string, any>, retries = 3): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        });

        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        }

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw new Error('Max retries exceeded');
  }

  async post<T>(endpoint: string, data?: any, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.getHeaders(),
          credentials: 'include',
          body: data ? JSON.stringify(data) : undefined,
        });

        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw new Error('Max retries exceeded');
  }

  async put<T>(endpoint: string, data?: any, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          credentials: 'include',
          body: data ? JSON.stringify(data) : undefined,
        });

        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw new Error('Max retries exceeded');
  }

  async delete<T>(endpoint: string, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
          credentials: 'include',
        });

        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Health check
  async healthCheck(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/health`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    // Health endpoint returns plain text, not JSON
    return response.text();
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/api/auth/login', { email, password });
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/api/auth/me');
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/api/auth/refresh');
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    return response;
  }

  async logout(): Promise<void> {
    this.clearToken();
    // Note: Server-side logout not implemented yet in the backend
  }

  // Companies endpoints
  async getCompanies(params?: CompanySearchParams): Promise<ApiResponse<any[]>> {
    return this.get<ApiResponse<any[]>>('/api/companies', params);
  }

  async searchCompanies(params?: CompanySearchParams): Promise<PaginatedResponse<any>> {
    return this.get<PaginatedResponse<any>>('/api/companies/search', params);
  }

  async getCompanyById(id: string, organizationId?: string): Promise<any> {
    const params = organizationId ? { organizationId } : undefined;
    return this.get<any>(`/api/companies/${id}`, params);
  }

  async createCompany(companyData: any): Promise<any> {
    return this.post<any>('/api/companies', companyData);
  }

  async updateCompany(id: string, updateData: any): Promise<any> {
    return this.put<any>(`/api/companies/${id}`, updateData);
  }

  async deleteCompany(id: string, organizationId?: string): Promise<{ success: boolean; message: string }> {
    const endpoint = organizationId 
      ? `/api/companies/${id}?organizationId=${organizationId}`
      : `/api/companies/${id}`;
    return this.delete<{ success: boolean; message: string }>(endpoint);
  }

  async bulkCreateCompanies(companies: any[]): Promise<any> {
    return this.post<any>('/api/companies/bulk', { companies });
  }

  // Company Lists endpoints
  async getCompanyLists(organizationId?: string): Promise<any[]> {
    const params = organizationId ? { organizationId } : undefined;
    return this.get<any[]>('/api/company-lists', params);
  }

  async getCompanyListById(id: string, organizationId?: string): Promise<any> {
    const params = organizationId ? { organizationId } : undefined;
    return this.get<any>(`/api/company-lists/${id}`, params);
  }

  async createCompanyList(listData: any): Promise<any> {
    return this.post<any>('/api/company-lists', listData);
  }

  async updateCompanyList(id: string, updateData: any): Promise<any> {
    return this.put<any>(`/api/company-lists/${id}`, updateData);
  }

  async deleteCompanyList(id: string): Promise<{ success: boolean; message: string }> {
    return this.delete<{ success: boolean; message: string }>(`/api/company-lists/${id}`);
  }

  async getCompanyListItems(id: string, organizationId?: string): Promise<any[]> {
    const params = organizationId ? { organizationId } : undefined;
    return this.get<any[]>(`/api/company-lists/${id}/items`, params);
  }

  async addCompaniesToList(listId: string, companyIds: string[]): Promise<any> {
    return this.post<any>(`/api/company-lists/${listId}/companies`, { companyIds });
  }

  async removeCompaniesFromList(listId: string, companyIds: string[]): Promise<any> {
    return this.delete<any>(`/api/company-lists/${listId}/companies?companyIds=${companyIds.join(',')}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Helper hook for React components
export function useApiClient() {
  return apiClient;
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return apiClient.getToken() !== null;
}

// Helper function to get current user from token (basic JWT decode)
export function getCurrentUserFromToken(): Partial<User> | null {
  const token = apiClient.getToken();
  if (!token) return null;
  
  try {
    // Basic JWT decode (just for demo, in production use a proper JWT library)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
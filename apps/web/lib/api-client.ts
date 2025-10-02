// API client for communicating with NestJS backend

// Determine the API base URL based on environment
const getApiBaseUrl = (): string => {
  // Use environment variable if set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  
  // For production, use the deployed backend URL
  return 'https://selly-base-backend.vercel.app';
};

const API_BASE_URL = getApiBaseUrl();

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
  accessToken: string; // Backend returns accessToken, not access_token
  user: {
    id: string;
    email: string;
    name: string; // Backend returns name, not firstName/lastName
    organizationId: string; // Backend includes organizationId
    organization?: {
      id: string;
      name: string;
      slug: string; // Backend includes slug
    };
    roles?: Array<{
      id: string;
      name: string;
      description?: string;
      permissions?: Array<{
        id: string;
        key: string;
        description?: string;
        created_at: string;
        updated_at: string;
      }>;
    }>;
  };
}

export interface User {
  id: string;
  email: string;
  name: string; // Backend returns name, not firstName/lastName
  organizationId?: string; // Backend includes organizationId
  organization?: {
    id: string;
    name: string;
    slug?: string; // Backend includes slug
  };
  roles?: Array<{
    id: string;
    name: string;
    description?: string;
    permissions?: Array<{
      id: string;
      key: string;
      description?: string;
      created_at: string;
      updated_at: string;
    }>;
  }>;
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

  // Check if API is available (has a valid base URL)
  isApiAvailable(): boolean {
    return !!this.baseUrl && this.baseUrl !== '';
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
    if (!this.isApiAvailable()) {
      throw new Error('API not available - no backend URL configured');
    }

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
    if (!this.isApiAvailable()) {
      throw new Error('API not available - no backend URL configured');
    }
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
    if (!this.isApiAvailable()) {
      throw new Error('API not available - no backend URL configured');
    }

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

  async delete<T>(endpoint: string, data?: any, retries = 3): Promise<T> {
    if (!this.isApiAvailable()) {
      throw new Error('API not available - no backend URL configured');
    }
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'DELETE',
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

  // Health check
  async healthCheck(): Promise<string> {
    if (!this.isApiAvailable()) {
      throw new Error('API not available - no backend URL configured');
    }

    const response = await fetch(`${this.baseUrl}/health`, {
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
    const response = await this.post<LoginResponse>('/api/v1/auth/login', { email, password });
    if (response.accessToken) {
      this.setToken(response.accessToken);
    }
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/api/v1/auth/me');
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await this.post<{ accessToken: string }>('/api/v1/auth/refresh');
    if (response.accessToken) {
      this.setToken(response.accessToken);
    }
    return response;
  }

  async logout(): Promise<void> {
    this.clearToken();
    // Note: Server-side logout not implemented yet in the backend
  }

  // Companies endpoints
  async getCompanies(params?: CompanySearchParams): Promise<ApiResponse<any[]>> {
    return this.get<ApiResponse<any[]>>('/api/v1/companies', params);
  }

  async searchCompanies(params?: CompanySearchParams): Promise<PaginatedResponse<any>> {
    return this.get<PaginatedResponse<any>>('/api/v1/companies/search', params);
  }

  async getCompanyById(id: string, organizationId?: string): Promise<any> {
    const params = organizationId ? { organizationId } : undefined;
    return this.get<any>(`/api/v1/companies/${id}`, params);
  }

  async createCompany(companyData: any): Promise<any> {
    return this.post<any>('/api/v1/companies', companyData);
  }

  async updateCompany(id: string, updateData: any): Promise<any> {
    return this.put<any>(`/api/v1/companies/${id}`, updateData);
  }

  async deleteCompany(id: string, organizationId?: string): Promise<{ success: boolean; message: string }> {
    const result = await this.delete<{ message: string }>(`/api/v1/companies/${id}`, organizationId ? { organizationId } : undefined);
    return { success: true, message: result.message };
  }

  async bulkCreateCompanies(companies: any[]): Promise<any> {
    return this.post<any>('/api/v1/companies/bulk', { companies });
  }

  // Company Lists endpoints
  async getCompanyLists(params?: { organizationId?: string; searchTerm?: string; scope?: string; page?: number; limit?: number }): Promise<any> {
    return this.get<any>('/api/v1/company-lists', params);
  }

  async getCompanyListById(id: string, organizationId?: string): Promise<any> {
    const params = organizationId ? { organizationId } : undefined;
    return this.get<any>(`/api/v1/company-lists/${id}`, params);
  }

  async createCompanyList(listData: any): Promise<any> {
    return this.post<any>('/api/v1/company-lists', listData);
  }

  async updateCompanyList(id: string, updateData: any): Promise<any> {
    return this.put<any>(`/api/v1/company-lists/${id}`, updateData);
  }

  async deleteCompanyList(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.delete<{ message: string }>(`/api/v1/company-lists/${id}`);
    return { success: true, message: result.message };
  }

  async getCompanyListItems(id: string, organizationId?: string): Promise<any[]> {
    const params = organizationId ? { organizationId } : undefined;
    return this.get<any[]>(`/api/v1/company-lists/${id}/items`, params);
  }

  async addCompaniesToList(listId: string, companyIds: string[]): Promise<any> {
    return this.post<any>(`/api/v1/company-lists/${listId}/companies`, { companyIds });
  }

  async removeCompaniesFromList(listId: string, companyIds: string[]): Promise<any> {
    return this.delete<any>(`/api/v1/company-lists/${listId}/companies`, { companyIds });
  }

  // Export Management endpoints (to be implemented in backend)
  async getExportJobs(params?: { status?: string; page?: number; limit?: number }): Promise<any> {
    return this.get<any>('/api/v1/exports', params);
  }

  async createExportJob(exportData: any): Promise<any> {
    return this.post<any>('/api/v1/exports', exportData);
  }

  async getExportJobById(id: string): Promise<any> {
    return this.get<any>(`/api/v1/exports/${id}`);
  }

  async downloadExportFile(id: string): Promise<Blob> {
    if (!this.isApiAvailable()) {
      throw new Error('API not available - no backend URL configured');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/exports/${id}/download`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }

  async cancelExportJob(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.delete<{ message: string }>(`/api/v1/exports/${id}`);
    return { success: true, message: result.message };
  }

  // Import Management endpoints (to be implemented in backend)
  async getImportJobs(params?: { status?: string; page?: number; limit?: number }): Promise<any> {
    return this.get<any>('/api/v1/imports', params);
  }

  async createImportJob(importData: any): Promise<any> {
    return this.post<any>('/api/v1/imports', importData);
  }

  async getImportJobById(id: string): Promise<any> {
    return this.get<any>(`/api/v1/imports/${id}`);
  }

  async validateImportData(id: string): Promise<any> {
    return this.post<any>(`/api/v1/imports/${id}/validate`);
  }

  async executeImportJob(id: string): Promise<any> {
    return this.post<any>(`/api/v1/imports/${id}/execute`);
  }

  // Staff Management endpoints (to be implemented in backend)
  async getStaffMembers(params?: { page?: number; limit?: number }): Promise<any> {
    return this.get<any>('/api/v1/staff', params);
  }

  async createStaffMember(staffData: any): Promise<any> {
    return this.post<any>('/api/v1/staff', staffData);
  }

  async updateStaffMember(id: string, updateData: any): Promise<any> {
    return this.put<any>(`/api/v1/staff/${id}`, updateData);
  }

  async deleteStaffMember(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.delete<{ message: string }>(`/api/v1/staff/${id}`);
    return { success: true, message: result.message };
  }

  async updateStaffRole(id: string, role: string): Promise<any> {
    return this.put<any>(`/api/v1/staff/${id}/role`, { role });
  }

  // Reports & Analytics endpoints (to be implemented in backend)
  async getDashboardAnalytics(): Promise<any> {
    return this.get<any>('/api/v1/reports/dashboard');
  }

  async getDataQualityMetrics(): Promise<any> {
    return this.get<any>('/api/v1/reports/data-quality');
  }

  async getUserActivityReports(params?: { startDate?: string; endDate?: string }): Promise<any> {
    return this.get<any>('/api/v1/reports/user-activity', params);
  }

  async getExportHistoryReports(params?: { startDate?: string; endDate?: string }): Promise<any> {
    return this.get<any>('/api/v1/reports/export-history', params);
  }

  // Admin Management endpoints (to be implemented in backend)
  async getOrganizationUsers(params?: { page?: number; limit?: number }): Promise<any> {
    return this.get<any>('/api/v1/admin/users', params);
  }

  async createOrganizationUser(userData: any): Promise<any> {
    return this.post<any>('/api/v1/admin/users', userData);
  }

  async updateOrganizationUser(id: string, updateData: any): Promise<any> {
    return this.put<any>(`/api/v1/admin/users/${id}`, updateData);
  }

  async deleteOrganizationUser(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.delete<{ message: string }>(`/api/v1/admin/users/${id}`);
    return { success: true, message: result.message };
  }

  async getOrganizationPolicies(): Promise<any> {
    return this.get<any>('/api/v1/admin/policies');
  }

  async updateOrganizationPolicies(policies: any): Promise<any> {
    return this.put<any>('/api/v1/admin/policies', policies);
  }

  async getIntegrationSettings(): Promise<any> {
    return this.get<any>('/api/v1/admin/integrations');
  }

  async updateIntegrationSettings(settings: any): Promise<any> {
    return this.put<any>('/api/v1/admin/integrations', settings);
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
      name: payload.name || 'Unknown User',
      organizationId: payload.organizationId,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
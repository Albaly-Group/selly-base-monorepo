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

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<string> {
    return this.get<string>('/api/health');
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
    const params = organizationId ? { organizationId } : undefined;
    return this.delete<{ success: boolean; message: string }>(`/api/companies/${id}`, params);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Helper hook for React components
export function useApiClient() {
  return apiClient;
}
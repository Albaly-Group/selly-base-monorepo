import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiCompaniesService, SearchFilters, CompanyCreateRequest, CompanyUpdateRequest } from '../services/api-companies-service';
import { ApiCompanyListsService } from '../services/api-company-lists-service';
import { CompanyListFilters, CompanyListItemFilters, CompanyListCreate, CompanyListUpdate, BulkCompanyIdsWithNote, BulkCompanyIds } from '@/lib/types/company-lists';
import { useAuth } from '@/lib/auth';

// Companies hooks
export function useCompaniesSearch(filters: SearchFilters) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['companies', 'search', filters],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompaniesService(user);
      return service.searchCompanies(filters);
    },
    enabled: !!user,
  });
}

export function useCompany(id: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompaniesService(user);
      return service.getCompanyById(id);
    },
    enabled: !!user && !!id,
  });
}

export function useCreateCompany() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companyData: CompanyCreateRequest) => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompaniesService(user);
      return service.createCompany(companyData);
    },
    onSuccess: () => {
      // Invalidate and refetch companies queries
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompanyUpdateRequest }) => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompaniesService(user);
      return service.updateCompany(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch companies queries
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies', id] });
    },
  });
}

export function useDeleteCompany() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompaniesService(user);
      return service.deleteCompany(id);
    },
    onSuccess: () => {
      // Invalidate and refetch companies queries
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useBulkCreateCompanies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (companies: CompanyCreateRequest[]) => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompaniesService(user);
      return service.bulkCreateCompanies(companies);
    },
    onSuccess: () => {
      // Invalidate and refetch companies queries
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

// Company Lists hooks
export function useCompanyLists(filters: CompanyListFilters) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['company-lists', filters],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompanyListsService(user);
      return service.listCompanyLists(filters);
    },
    enabled: !!user,
  });
}

export function useCompanyList(id: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['company-lists', id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompanyListsService(user);
      return service.getCompanyList(id);
    },
    enabled: !!user && !!id,
  });
}

export function useCompanyListItems(listId: string, filters: CompanyListItemFilters) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['company-lists', listId, 'items', filters],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompanyListsService(user);
      return service.getListItems(listId, filters);
    },
    enabled: !!user && !!listId,
  });
}

export function useCreateCompanyList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CompanyListCreate) => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompanyListsService(user);
      return service.createCompanyList(data);
    },
    onSuccess: () => {
      // Invalidate and refetch company lists queries
      queryClient.invalidateQueries({ queryKey: ['company-lists'] });
    },
  });
}

export function useUpdateCompanyList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompanyListUpdate }) => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompanyListsService(user);
      return service.updateCompanyList(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch company lists queries
      queryClient.invalidateQueries({ queryKey: ['company-lists'] });
      queryClient.invalidateQueries({ queryKey: ['company-lists', id] });
    },
  });
}

export function useDeleteCompanyList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompanyListsService(user);
      return service.deleteCompanyList(id);
    },
    onSuccess: () => {
      // Invalidate and refetch company lists queries
      queryClient.invalidateQueries({ queryKey: ['company-lists'] });
    },
  });
}

export function useAddCompaniesToList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ listId, data }: { listId: string; data: BulkCompanyIdsWithNote }) => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompanyListsService(user);
      return service.addCompaniesToList(listId, data);
    },
    onSuccess: (_, { listId }) => {
      // Invalidate and refetch specific list items and list details
      queryClient.invalidateQueries({ queryKey: ['company-lists', listId, 'items'] });
      queryClient.invalidateQueries({ queryKey: ['company-lists', listId] });
      queryClient.invalidateQueries({ queryKey: ['company-lists'] });
    },
  });
}

export function useRemoveCompaniesFromList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ listId, data }: { listId: string; data: BulkCompanyIds }) => {
      if (!user) throw new Error('User not authenticated');
      const service = new ApiCompanyListsService(user);
      return service.removeCompaniesFromList(listId, data);
    },
    onSuccess: (_, { listId }) => {
      // Invalidate and refetch specific list items and list details
      queryClient.invalidateQueries({ queryKey: ['company-lists', listId, 'items'] });
      queryClient.invalidateQueries({ queryKey: ['company-lists', listId] });
      queryClient.invalidateQueries({ queryKey: ['company-lists'] });
    },
  });
}
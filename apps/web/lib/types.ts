// Re-export types from shared package
export * from '@selly/types';

// Legacy imports for backward compatibility
import type { 
  Organization,
  User,
  UserRoleName,
  TenantRoles,
  PlatformRoles,
  LegacyRoles,
  TenantContext,
  FilterOptions,
  SearchFilters,
  CompanyCore,
  Company,
  ContactPerson,
  CompanyList,
  CompanyListMembership,
  CompanySummary,
  LeadScore,
  SearchResult,
  ExportData
} from '@selly/types';

// Re-export for existing code compatibility
export type {
  Organization,
  User,
  UserRoleName,
  TenantRoles,
  PlatformRoles,
  LegacyRoles,
  TenantContext,
  FilterOptions,
  SearchFilters,
  CompanyCore,
  Company,
  ContactPerson,
  CompanyList,
  CompanyListMembership,
  CompanySummary,
  LeadScore,
  SearchResult,
  ExportData
};

// Mock data imports for backward compatibility (these will be replaced by API calls)
import type { UserList } from "./mock-data"
export type { UserList }

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

import type { UserList, WeightedLeadScore } from "./mock-data"
export type { UserList, WeightedLeadScore }

// Re-export utility functions from mock-data for lead scoring
export { calculateLeadScore, calculateWeightedLeadScore, searchAndScoreCompanies } from "./mock-data"

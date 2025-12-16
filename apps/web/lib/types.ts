// Re-export types from shared package
export * from '@selly/types';

// Legacy imports for backward compatibility — import with aliases so we can extend locally
import type {
  Organization as _Organization,
  User as _User,
  UserRoleName as _UserRoleName,
  TenantRoles as _TenantRoles,
  PlatformRoles as _PlatformRoles,
  LegacyRoles as _LegacyRoles,
  TenantContext as _TenantContext,
  FilterOptions as _BaseFilterOptions,
  SearchFilters as _SearchFilters,
  CompanyCore as _CompanyCore,
  Company as _BaseCompany,
  ContactPerson as _ContactPerson,
  CompanyList as _CompanyList,
  CompanyListMembership as _CompanyListMembership,
  CompanySummary as _CompanySummary,
  LeadScore as _LeadScore,
  SearchResult as _SearchResult,
  ExportData as _ExportData,
} from '@selly/types';

// Extend Company and FilterOptions locally with optional fields used by the UI
export type Company = _BaseCompany & {
  industrialName?: string
  province?: string
  contactPersons?: _ContactPerson[]
  dataCompleteness?: number
  lastUpdated?: string
  createdBy?: string
  registrationId?: string
  verificationStatus?: string
}

export type FilterOptions = _BaseFilterOptions & {
  industry?: string
  province?: string
  verificationStatus?: string
}

import type { UserList, WeightedLeadScore } from "./mock-data"
export type { UserList, WeightedLeadScore }

// Re-export utility functions from mock-data for lead scoring
export { calculateLeadScore, calculateWeightedLeadScore, searchAndScoreCompanies } from "./mock-data"

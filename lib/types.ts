export type UserRole = "user" | "staff" | "admin"

// Updated roles to match spec Section 2
export type SpecUserRole = "Sales Rep" | "Sales Manager" | "Workspace Admin" | "Analyst"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface FilterOptions {
  industrial?: string
  province?: string
  companySize?: "S" | "M" | "L"
  contactStatus?: "New" | "Needs Verification" | "Active" | "Invalid" | "Archived" // Updated per spec
  dataCompletenessMin?: number // Add data completeness filter per spec
  updatedWithin?: number // Days filter per spec
  hasPhone?: boolean // Signal filter per spec
  hasEmail?: boolean // Signal filter per spec
  hasDecisionMaker?: boolean // Decision maker filter per spec
}

export interface SearchFilters extends FilterOptions {
  searchTerm?: string
}

export interface ExportData {
  companies: any[] // Placeholder for Company type until it's declared or imported
  exportedAt: string
  exportedBy: string
}

// Re-export types from mock-data for convenience
import type { Company, ContactPerson, UserList, LeadScore } from "./mock-data"
export type { Company, ContactPerson, UserList, LeadScore }

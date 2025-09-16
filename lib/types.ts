export type UserRole = "user" | "staff" | "admin"

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
  contactStatus?: "Active" | "Needs Verification" | "Invalid"
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

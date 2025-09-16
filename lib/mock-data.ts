export interface Company {
  id: string
  companyNameEn: string
  companyNameTh?: string // Add Thai name support per spec
  industrialName: string
  province: string
  contactPersons: ContactPerson[]
  verificationStatus: "New" | "Needs Verification" | "Active" | "Invalid" | "Archived" // Spec Section 1
  dataCompleteness: number
  lastUpdated: string
  createdBy: string
  registeredNo?: string // 13-digit Thailand Registration ID
  companySize?: "S" | "M" | "L"
  website?: string // Add website field per spec
  address?: string // Add address field per spec
}

export interface ContactPerson {
  name: string
  phone?: string
  email?: string
  title?: string // Add role/title per spec
  isDecisionMaker?: boolean // Add decision maker flag per spec
}

export interface UserList {
  id: string
  name: string
  description?: string // Add description field per spec
  companyIds: string[]
  createdAt: string
  status: "Draft" | "In Outreach" | "On Hold" | "Completed" | "Archived" // Spec Section 1
  owner: string
  lastActivity?: string // Add last activity tracking per spec
}

export interface LeadScore {
  companyId: string
  score: number
  matchingSummary: {
    industrial: boolean
    province: boolean
    companySize: boolean
    contactStatus: boolean
  }
}

// Mock company data
export const mockCompanies: Company[] = [
  {
    id: "1",
    companyNameEn: "ABC Manufacturing Co., Ltd.",
    companyNameTh: "บริษัท เอบีซี แมนูแฟ็กเจอริ่ง จำกัด",
    industrialName: "Manufacturing",
    province: "Bangkok",
    contactPersons: [{ 
      name: "John Smith", 
      phone: "+66-2-123-4567", 
      email: "john@abc-mfg.com",
      title: "General Manager",
      isDecisionMaker: true
    }],
    verificationStatus: "Active",
    dataCompleteness: 95,
    lastUpdated: "2024-12-08",
    createdBy: "System Import",
    registeredNo: "0105564111698",
    companySize: "L",
    website: "https://abc-mfg.com",
    address: "123 Industrial Rd, Bangkok 10400",
  },
  {
    id: "2",
    companyNameEn: "Bangkok Logistics Solutions Ltd.",
    companyNameTh: "บริษัท บางกอก โลจิสติกส์ โซลูชั่นส์ จำกัด",
    industrialName: "Logistics",
    province: "Bangkok",
    contactPersons: [{ 
      name: "Sarah Johnson", 
      phone: "+66-2-987-6543", 
      email: "sarah@bkk-logistics.com",
      title: "Operations Director",
      isDecisionMaker: true
    }],
    verificationStatus: "Active",
    dataCompleteness: 88,
    lastUpdated: "2024-12-07",
    createdBy: "User Import",
    registeredNo: "0105564222789",
    companySize: "M",
    website: "https://bkk-logistics.com",
    address: "456 Logistics Ave, Bangkok 10250",
  },
  {
    id: "3",
    companyNameEn: "Chiang Mai Automotive Parts Co.",
    companyNameTh: "บริษัท เชียงใหม่ ออโตโมทีฟ พาร์ทส์ จำกัด",
    industrialName: "Automotive",
    province: "Chiang Mai",
    contactPersons: [{ 
      name: "Michael Chen", 
      phone: "+66-53-456-7890",
      title: "Sales Manager",
      isDecisionMaker: false
    }],
    verificationStatus: "Needs Verification",
    dataCompleteness: 65,
    lastUpdated: "2024-12-05",
    createdBy: "Staff Entry",
    registeredNo: "0105564333890",
    companySize: "S",
    address: "789 Auto Park, Chiang Mai 50100",
  },
  {
    id: "4",
    companyNameEn: "Phuket Tourism Services Ltd.",
    companyNameTh: "บริษัท ภูเก็ต ทัวริสม์ เซอร์วิสเซส จำกัด",
    industrialName: "Tourism",
    province: "Phuket",
    contactPersons: [{ 
      name: "Lisa Wong", 
      email: "lisa@phuket-tourism.com",
      title: "Marketing Director",
      isDecisionMaker: false
    }],
    verificationStatus: "Invalid",
    dataCompleteness: 45,
    lastUpdated: "2024-11-28",
    createdBy: "System Import",
    registeredNo: "0105564444901",
    companySize: "M",
    website: "https://phuket-tourism.com",
    address: "321 Beach Rd, Phuket 83000",
  },
  {
    id: "5",
    companyNameEn: "Northeast Agriculture Co-op",
    companyNameTh: "สหกรณ์เกษตรกรรมภาคตะวันออกเฉียงเหนือ",
    industrialName: "Agriculture",
    province: "Khon Kaen",
    contactPersons: [{ 
      name: "Somchai Prasert", 
      phone: "+66-43-123-4567", 
      email: "somchai@ne-agri.com",
      title: "Cooperative President",
      isDecisionMaker: true
    }],
    verificationStatus: "Active",
    dataCompleteness: 92,
    lastUpdated: "2024-12-06",
    createdBy: "User Import",
    registeredNo: "0105564555012",
    companySize: "L",
    website: "https://ne-agri.com",
    address: "555 Agriculture Center, Khon Kaen 40000",
  },
]

// Mock user lists
export const mockUserLists: UserList[] = [
  {
    id: "1",
    name: "Bangkok Logistics Leads",
    description: "High-priority logistics companies in Bangkok area",
    companyIds: ["1", "2"],
    createdAt: "2024-12-01",
    status: "In Outreach",
    owner: "user@example.com",
    lastActivity: "2024-12-08",
  },
  {
    id: "2",
    name: "Manufacturing Prospects",
    description: "Large manufacturing companies for Q1 campaign",
    companyIds: ["1", "5"],
    createdAt: "2024-11-28",
    status: "Draft",
    owner: "user@example.com",
    lastActivity: "2024-12-06",
  },
  {
    id: "3",
    name: "Completed Tourism Campaign",
    description: "Tourism companies from last quarter",
    companyIds: ["4"],
    createdAt: "2024-10-15",
    status: "Completed",
    owner: "user@example.com",
    lastActivity: "2024-11-30",
  },
]

// Utility functions for data operations
export const searchCompanies = (companies: Company[], searchTerm: string): Company[] => {
  if (!searchTerm.trim()) return companies

  const term = searchTerm.toLowerCase()
  return companies.filter(
    (company) =>
      company.companyNameEn.toLowerCase().includes(term) ||
      company.registeredNo?.includes(term) ||
      company.industrialName.toLowerCase().includes(term),
  )
}

export const filterCompanies = (
  companies: Company[],
  filters: {
    industrial?: string
    province?: string
    companySize?: string
    contactStatus?: string
  },
): Company[] => {
  return companies.filter((company) => {
    if (filters.industrial && company.industrialName !== filters.industrial) return false
    if (filters.province && company.province !== filters.province) return false
    if (filters.companySize && company.companySize !== filters.companySize) return false
    if (filters.contactStatus && company.verificationStatus !== filters.contactStatus) return false
    return true
  })
}

// Validation functions
export const validateRegistrationId = (registrationId: string): boolean => {
  // Remove any hyphens, spaces, or other separators
  const cleaned = registrationId.replace(/[-\s]/g, "")
  // Must be exactly 13 digits
  return /^\d{13}$/.test(cleaned)
}

export const normalizeRegistrationId = (registrationId: string): string => {
  return registrationId.replace(/[-\s]/g, "")
}

// Lead scoring according to spec Section 7
export const calculateLeadScore = (
  company: Company,
  criteria: {
    industrial?: string
    province?: string
    companySize?: string
    contactStatus?: string
  },
): LeadScore => {
  let score = 0
  const matchingSummary = {
    industrial: false,
    province: false,
    companySize: false,
    contactStatus: false,
  }

  // Industry match (+35 points) - spec Section 7
  if (criteria.industrial && company.industrialName === criteria.industrial) {
    score += 35
    matchingSummary.industrial = true
  }

  // Province match (+25 points) - spec Section 7
  if (criteria.province && company.province === criteria.province) {
    score += 25
    matchingSummary.province = true
  }

  // Company size match (+10 points) - spec Section 7
  if (criteria.companySize && company.companySize === criteria.companySize) {
    score += 10
    matchingSummary.companySize = true
  }

  // Contact status scoring - spec Section 7
  if (criteria.contactStatus && company.verificationStatus === criteria.contactStatus) {
    if (company.verificationStatus === "Active") {
      score += 10
    } else if (company.verificationStatus === "Needs Verification") {
      score += 5
    } else if (company.verificationStatus === "Invalid") {
      score -= 20 // Penalty for invalid contacts
    }
    matchingSummary.contactStatus = true
  }

  // Signals-based scoring - spec Section 7
  const hasPhone = company.contactPersons.some(c => c.phone)
  const hasEmail = company.contactPersons.some(c => c.email)
  const hasDecisionMaker = company.contactPersons.some(c => c.isDecisionMaker)
  
  if (hasPhone) score += 8
  if (hasEmail) score += 6
  if (hasDecisionMaker) score += 10 // Decision-maker present bonus

  // Updated within 90 days bonus (+6)
  const lastUpdatedDate = new Date(company.lastUpdated)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff <= 90) {
    score += 6
  }

  // Penalties - spec Section 7
  // Outdated records (>180 days) penalty
  if (daysDiff > 180) {
    score -= 10
  }

  // Low completeness penalty (<50%)
  if (company.dataCompleteness < 50) {
    score -= 8
  }

  // Data completeness bonus (existing behavior)
  score += Math.floor(company.dataCompleteness / 10)

  // Normalize score to 0-100 range
  score = Math.min(100, Math.max(0, score))

  return {
    companyId: company.id,
    score,
    matchingSummary,
  }
}

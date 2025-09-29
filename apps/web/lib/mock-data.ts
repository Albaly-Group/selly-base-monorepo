export interface Company {
  id: string
  companyNameEn: string
  industrialName: string
  province: string
  contactPersons: ContactPerson[]
  verificationStatus: "Active" | "Needs Verification" | "Invalid"
  dataCompleteness: number
  lastUpdated: string
  createdBy: string
  registeredNo?: string
  companySize?: "S" | "M" | "L"
}

export interface ContactPerson {
  name: string
  phone?: string
  email?: string
}

export interface UserList {
  id: string
  name: string
  companyIds: string[]
  createdAt: string
  status: "Active" | "Inactive"
  owner: string
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
    industrialName: "Manufacturing",
    province: "Bangkok",
    contactPersons: [{ name: "John Smith", phone: "+66-2-123-4567", email: "john@abc-mfg.com" }],
    verificationStatus: "Active",
    dataCompleteness: 95,
    lastUpdated: "2024-12-08",
    createdBy: "System Import",
    registeredNo: "0105564111698",
    companySize: "L",
  },
  {
    id: "2",
    companyNameEn: "Bangkok Logistics Solutions Ltd.",
    industrialName: "Logistics",
    province: "Bangkok",
    contactPersons: [{ name: "Sarah Johnson", phone: "+66-2-987-6543", email: "sarah@bkk-logistics.com" }],
    verificationStatus: "Active",
    dataCompleteness: 88,
    lastUpdated: "2024-12-07",
    createdBy: "User Import",
    registeredNo: "0105564222789",
    companySize: "M",
  },
  {
    id: "3",
    companyNameEn: "Chiang Mai Automotive Parts Co.",
    industrialName: "Automotive",
    province: "Chiang Mai",
    contactPersons: [{ name: "Michael Chen", phone: "+66-53-456-7890" }],
    verificationStatus: "Needs Verification",
    dataCompleteness: 65,
    lastUpdated: "2024-12-05",
    createdBy: "Staff Entry",
    registeredNo: "0105564333890",
    companySize: "S",
  },
  {
    id: "4",
    companyNameEn: "Phuket Tourism Services Ltd.",
    industrialName: "Tourism",
    province: "Phuket",
    contactPersons: [{ name: "Lisa Wong", email: "lisa@phuket-tourism.com" }],
    verificationStatus: "Invalid",
    dataCompleteness: 45,
    lastUpdated: "2024-11-28",
    createdBy: "System Import",
    registeredNo: "0105564444901",
    companySize: "M",
  },
  {
    id: "5",
    companyNameEn: "Northeast Agriculture Co-op",
    industrialName: "Agriculture",
    province: "Khon Kaen",
    contactPersons: [{ name: "Somchai Prasert", phone: "+66-43-123-4567", email: "somchai@ne-agri.com" }],
    verificationStatus: "Active",
    dataCompleteness: 92,
    lastUpdated: "2024-12-06",
    createdBy: "User Import",
    registeredNo: "0105564555012",
    companySize: "L",
  },
]

// Mock user lists
export const mockUserLists: UserList[] = [
  {
    id: "1",
    name: "Bangkok Logistics Leads",
    companyIds: ["1", "2"],
    createdAt: "2024-12-01",
    status: "Active",
    owner: "user@example.com",
  },
  {
    id: "2",
    name: "Manufacturing Prospects",
    companyIds: ["1", "5"],
    createdAt: "2024-11-28",
    status: "Active",
    owner: "user@example.com",
  },
]

// Utility functions for data operations
export const searchCompanies = (companies: Company[], searchTerm: string): Company[] => {
  if (!searchTerm.trim()) return []

  const term = searchTerm.toLowerCase()
  return companies.filter(
    (company) =>
      company.companyNameEn.toLowerCase().includes(term) ||
      company.registeredNo?.toLowerCase().includes(term) ||
      company.industrialName.toLowerCase().includes(term) ||
      company.province?.toLowerCase().includes(term) ||
      company.contactPersons?.some(contact => 
        contact.name?.toLowerCase().includes(term) ||
        contact.email?.toLowerCase().includes(term)
      )
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

  // Industrial match (+20 points)
  if (criteria.industrial && company.industrialName === criteria.industrial) {
    score += 20
    matchingSummary.industrial = true
  }

  // Province match (+15 points)
  if (criteria.province && company.province === criteria.province) {
    score += 15
    matchingSummary.province = true
  }

  // Company size match (+10 points)
  if (criteria.companySize && company.companySize === criteria.companySize) {
    score += 10
    matchingSummary.companySize = true
  }

  // Contact status match (+10 points)
  if (criteria.contactStatus && company.verificationStatus === criteria.contactStatus) {
    score += 10
    matchingSummary.contactStatus = true
  }

  // Data completeness bonus
  score += Math.floor(company.dataCompleteness / 10)

  return {
    companyId: company.id,
    score,
    matchingSummary,
  }
}

export interface WeightedLeadScore {
  companyId: string
  score: number
  maxPossibleScore: number
  normalizedScore: number // 0-100 percentage
  matchingSummary: {
    keyword: boolean
    keywordScore: number
    industrial: boolean
    industrialScore: number
    province: boolean
    provinceScore: number
    companySize: boolean
    companySizeScore: number
    contactStatus: boolean
    contactStatusScore: number
  }
}

export const calculateWeightedLeadScore = (
  company: Company,
  criteria: {
    keyword?: string
    keywordWeight?: number
    industrial?: string
    industrialWeight?: number
    province?: string
    provinceWeight?: number
    companySize?: string
    companySizeWeight?: number
    contactStatus?: string
    contactStatusWeight?: number
    minimumScore?: number
  },
): WeightedLeadScore => {
  let totalScore = 0
  let maxPossibleScore = 0
  const matchingSummary = {
    keyword: false,
    keywordScore: 0,
    industrial: false,
    industrialScore: 0,
    province: false,
    provinceScore: 0,
    companySize: false,
    companySizeScore: 0,
    contactStatus: false,
    contactStatusScore: 0,
  }

  // Keyword match
  if (criteria.keyword && criteria.keywordWeight) {
    const keywordLower = criteria.keyword.toLowerCase()
    const nameMatch = company.companyNameEn.toLowerCase().includes(keywordLower)
    const regMatch = company.registeredNo?.toLowerCase().includes(keywordLower) || false
    const industryMatch = company.industrialName.toLowerCase().includes(keywordLower)
    
    if (nameMatch || regMatch || industryMatch) {
      matchingSummary.keyword = true
      matchingSummary.keywordScore = criteria.keywordWeight
      totalScore += criteria.keywordWeight
    }
    maxPossibleScore += criteria.keywordWeight
  }

  // Industrial match
  if (criteria.industrial && criteria.industrialWeight) {
    maxPossibleScore += criteria.industrialWeight
    if (company.industrialName === criteria.industrial) {
      matchingSummary.industrial = true
      matchingSummary.industrialScore = criteria.industrialWeight
      totalScore += criteria.industrialWeight
    }
  }

  // Province match
  if (criteria.province && criteria.provinceWeight) {
    maxPossibleScore += criteria.provinceWeight
    if (company.province === criteria.province) {
      matchingSummary.province = true
      matchingSummary.provinceScore = criteria.provinceWeight
      totalScore += criteria.provinceWeight
    }
  }

  // Company size match
  if (criteria.companySize && criteria.companySizeWeight) {
    maxPossibleScore += criteria.companySizeWeight
    if (company.companySize === criteria.companySize) {
      matchingSummary.companySize = true
      matchingSummary.companySizeScore = criteria.companySizeWeight
      totalScore += criteria.companySizeWeight
    }
  }

  // Contact status match
  if (criteria.contactStatus && criteria.contactStatusWeight) {
    maxPossibleScore += criteria.contactStatusWeight
    if (company.verificationStatus === criteria.contactStatus) {
      matchingSummary.contactStatus = true
      matchingSummary.contactStatusScore = criteria.contactStatusWeight
      totalScore += criteria.contactStatusWeight
    }
  }

  // Calculate normalized score (0-100%)
  const normalizedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0

  return {
    companyId: company.id,
    score: totalScore,
    maxPossibleScore,
    normalizedScore,
    matchingSummary,
  }
}

export const searchAndScoreCompanies = (
  companies: Company[],
  criteria: {
    keyword?: string
    keywordWeight?: number
    industrial?: string
    industrialWeight?: number
    province?: string
    provinceWeight?: number
    companySize?: string
    companySizeWeight?: number
    contactStatus?: string
    contactStatusWeight?: number
    minimumScore?: number
  },
): { company: Company; score: WeightedLeadScore }[] => {
  const results = companies
    .map((company) => ({
      company,
      score: calculateWeightedLeadScore(company, criteria),
    }))
    .filter((result) => {
      // Apply minimum score filter
      const minimumScore = criteria.minimumScore || 0
      return result.score.normalizedScore >= minimumScore
    })
    // Sort by normalized score (highest first)
    .sort((a, b) => b.score.normalizedScore - a.score.normalizedScore)

  return results
}

// Data persistence utility functions for consistent data pipeline

/**
 * Add companies to an existing list
 */
export const addCompaniesToList = (
  listId: string,
  companyIds: string[],
  note?: string
): { added: string[]; skipped: Array<{ companyId: string; reason: 'DUPLICATE' | 'NOT_FOUND' }> } => {
  const list = mockUserLists.find(l => l.id === listId)
  if (!list) {
    throw new Error('LIST_NOT_FOUND')
  }

  const added: string[] = []
  const skipped: Array<{ companyId: string; reason: 'DUPLICATE' | 'NOT_FOUND' }> = []

  companyIds.forEach(companyId => {
    // Check if company exists
    const company = mockCompanies.find(c => c.id === companyId)
    if (!company) {
      skipped.push({ companyId, reason: 'NOT_FOUND' })
      return
    }

    // Check if already in list
    if (list.companyIds.includes(companyId)) {
      skipped.push({ companyId, reason: 'DUPLICATE' })
      return
    }

    // Add to list
    list.companyIds.push(companyId)
    added.push(companyId)
  })

  return { added, skipped }
}

/**
 * Remove companies from a list
 */
export const removeCompaniesFromList = (
  listId: string,
  companyIds: string[]
): { removed: string[]; missing: string[] } => {
  const list = mockUserLists.find(l => l.id === listId)
  if (!list) {
    throw new Error('LIST_NOT_FOUND')
  }

  const removed: string[] = []
  const missing: string[] = []

  companyIds.forEach(companyId => {
    const index = list.companyIds.indexOf(companyId)
    if (index !== -1) {
      list.companyIds.splice(index, 1)
      removed.push(companyId)
    } else {
      missing.push(companyId)
    }
  })

  return { removed, missing }
}

/**
 * Create a new company list
 */
export const createCompanyList = (
  name: string,
  description?: string,
  owner: string = 'user@example.com'
): UserList => {
  const newList: UserList = {
    id: `list-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name,
    companyIds: [],
    createdAt: new Date().toISOString(),
    status: 'Active',
    owner
  }

  mockUserLists.push(newList)
  return newList
}

/**
 * Update an existing company list
 */
export const updateCompanyList = (
  listId: string,
  updates: Partial<Pick<UserList, 'name' | 'status'>>
): UserList | null => {
  const list = mockUserLists.find(l => l.id === listId)
  if (!list) {
    return null
  }

  if (updates.name !== undefined) {
    list.name = updates.name
  }
  if (updates.status !== undefined) {
    list.status = updates.status
  }

  return list
}

/**
 * Delete a company list
 */
export const deleteCompanyList = (listId: string): boolean => {
  const index = mockUserLists.findIndex(l => l.id === listId)
  if (index === -1) {
    return false
  }

  mockUserLists.splice(index, 1)
  return true
}

/**
 * Get companies in a list with full details
 */
export const getListCompanies = (listId: string): Company[] => {
  const list = mockUserLists.find(l => l.id === listId)
  if (!list) {
    return []
  }

  return mockCompanies.filter(company => list.companyIds.includes(company.id))
}

/**
 * Get all lists that contain a specific company
 */
export const getCompanyLists = (companyId: string): UserList[] => {
  return mockUserLists.filter(list => list.companyIds.includes(companyId))
}

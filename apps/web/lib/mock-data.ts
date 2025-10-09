// Type definitions for company data
// NOTE: This file contains type definitions and utility functions only.
// All mock data has been removed. Use the API client to fetch real data from the backend.

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
  companyListItems: string[]
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

// Utility function for calculating lead score
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
    verificationStatus: boolean
    verificationStatusScore: number
  }
}

// Utility function for calculating weighted lead score
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
    verificationStatus?: string
    verificationStatusWeight?: number
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
    verificationStatus: false,
    verificationStatusScore: 0,
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

  // Verification status match
  if (criteria.verificationStatus && criteria.verificationStatusWeight) {
    maxPossibleScore += criteria.verificationStatusWeight
    if (company.verificationStatus === criteria.verificationStatus) {
      matchingSummary.verificationStatus = true
      matchingSummary.verificationStatusScore = criteria.verificationStatusWeight
      totalScore += criteria.verificationStatusWeight
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

// Utility function for searching and scoring companies
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
    verificationStatus?: string
    verificationStatusWeight?: number
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

import DatabaseService from '@/lib/database'
import { CompanyCore, CompanySummary, CompanyDetail } from '@/lib/types/company-lists'
import { User } from '@/lib/types'

interface SearchFilters {
  q?: string
  province?: string
  companySize?: string[]
  dataSource?: string[]
  verificationStatus?: string
  dataSensitivity?: string[]
  includeSharedData?: boolean
  page?: number
  limit?: number
}

interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
}

interface CompanyCreateRequest {
  companyNameEn: string
  companyNameTh?: string | null
  businessDescription?: string | null
  province?: string | null
  websiteUrl?: string | null
  primaryEmail?: string | null
  primaryPhone?: string | null
  dataSource: 'customer_input'  // Only allow customer input for new companies
  sourceReference?: string | null
  dataSensitivity?: 'standard' | 'confidential' | 'restricted'
}

interface CompanyUpdateRequest {
  companyNameEn?: string
  companyNameTh?: string | null
  businessDescription?: string | null
  province?: string | null
  websiteUrl?: string | null
  primaryEmail?: string | null
  primaryPhone?: string | null
  dataSensitivity?: 'public' | 'standard' | 'confidential' | 'restricted'
  tags?: string[]
}

export class CompaniesService {
  private db: DatabaseService
  private user: User

  constructor(user: User) {
    this.db = DatabaseService.getInstance()
    this.user = user
  }

  /**
   * Parse tags array from database to structured format
   */
  private parseTags(tagsArray: any): string[] {
    if (!tagsArray) return []
    
    // If it's already an array, return it
    if (Array.isArray(tagsArray)) {
      return tagsArray.filter(tag => tag && typeof tag === 'string')
    }
    
    // If it's a PostgreSQL array string like '{tag1,tag2}'
    if (typeof tagsArray === 'string') {
      const cleaned = tagsArray.replace(/^\{|\}$/g, '')
      if (!cleaned) return []
      return cleaned.split(',').map(tag => tag.trim()).filter(tag => tag)
    }
    
    return []
  }

  /**
   * Parse industry classification JSON from database
   */
  private parseClassifications(classificationData: any): Array<{ code: string; name: string; level?: number }> {
    if (!classificationData) return []
    
    try {
      // If it's a string, parse it as JSON
      const data = typeof classificationData === 'string' 
        ? JSON.parse(classificationData) 
        : classificationData
      
      // Handle different classification data structures
      if (Array.isArray(data)) {
        return data.map(item => ({
          code: item.code || item.id || '',
          name: item.name || item.label || '',
          level: item.level || undefined
        }))
      }
      
      // Handle single classification object
      if (data.code && data.name) {
        return [{
          code: data.code,
          name: data.name,
          level: data.level || undefined
        }]
      }
      
      // Handle nested structure
      if (data.primary || data.secondary) {
        const classifications = []
        if (data.primary) {
          classifications.push({
            code: data.primary.code || '',
            name: data.primary.name || '',
            level: 1
          })
        }
        if (data.secondary && Array.isArray(data.secondary)) {
          data.secondary.forEach((item: any, index: number) => {
            classifications.push({
              code: item.code || '',
              name: item.name || '',
              level: index + 2
            })
          })
        }
        return classifications
      }
    } catch (error) {
      console.error('Failed to parse industry classification:', error)
    }
    
    return []
  }

  /**
   * Search companies with SaaS privacy controls
   */
  async searchCompanies(filters: SearchFilters = {}): Promise<SearchResult<CompanySummary>> {
    const {
      q,
      province,
      companySize,
      dataSource,
      verificationStatus,
      dataSensitivity,
      includeSharedData = true,
      page = 1,
      limit = 25
    } = filters

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      throw new Error('Invalid pagination parameters')
    }

    const offset = (page - 1) * limit
    let whereConditions = []
    let params: any[] = []
    let paramIndex = 1

    // Organization scoping with shared data support
    if (includeSharedData) {
      whereConditions.push(`(c.organization_id = $${paramIndex} OR c.organization_id IS NULL)`)
      params.push(this.user.organization_id)
      paramIndex++
    } else {
      whereConditions.push(`c.organization_id = $${paramIndex}`)
      params.push(this.user.organization_id)
      paramIndex++
    }

    // Text search using full-text search vector
    if (q && q.trim()) {
      whereConditions.push(`c.search_vector @@ plainto_tsquery('english', $${paramIndex})`)
      params.push(q.trim())
      paramIndex++
    }

    // Province filter
    if (province) {
      whereConditions.push(`c.province = $${paramIndex}`)
      params.push(province)
      paramIndex++
    }

    // Company size filter (array)
    if (companySize && companySize.length > 0) {
      whereConditions.push(`c.company_size = ANY($${paramIndex})`)
      params.push(companySize)
      paramIndex++
    }

    // Data source filter (array)
    if (dataSource && dataSource.length > 0) {
      whereConditions.push(`c.data_source = ANY($${paramIndex})`)
      params.push(dataSource)
      paramIndex++
    }

    // Verification status
    if (verificationStatus) {
      whereConditions.push(`c.verification_status = $${paramIndex}`)
      params.push(verificationStatus)
      paramIndex++
    }

    // Data sensitivity filter (array)
    if (dataSensitivity && dataSensitivity.length > 0) {
      whereConditions.push(`c.data_sensitivity = ANY($${paramIndex})`)
      params.push(dataSensitivity)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM mv_company_search c
      ${whereClause}
    `

    const countResult = await this.db.query(countQuery, params, {
      organizationId: this.user.organization_id,
      userId: this.user.id
    })

    const total = parseInt(countResult.rows[0].total)

    // Get paginated results with ranking for text search
    let orderBy = 'c.updated_at DESC, c.name_en ASC'
    if (q && q.trim()) {
      orderBy = `ts_rank(c.search_vector, plainto_tsquery('english', $${params.length})) DESC, c.name_en ASC`
      params.push(q.trim()) // Add search term again for ranking
    }

    const dataQuery = `
      SELECT 
        c.id as company_id,
        c.organization_id,
        c.name_en as name,
        c.display_name,
        c.primary_registration_no as registration_no,
        c.province,
        c.country_code as country,
        c.website_url as website,
        c.data_source,
        c.source_reference,
        c.is_shared_data,
        c.data_sensitivity,
        c.company_size,
        c.verification_status,
        c.data_quality_score,
        c.tags,
        c.industry_classification,
        c.contact_count as contacts_count,
        c.list_membership_count
      FROM mv_company_search c
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    params.push(limit, offset)

    const dataResult = await this.db.query(dataQuery, params, {
      organizationId: this.user.organization_id,
      userId: this.user.id
    })

    const companies: CompanySummary[] = dataResult.rows.map(row => ({
      companyId: row.company_id,
      organizationId: row.organization_id,
      name: row.name,
      displayName: row.display_name,
      registrationNo: row.registration_no,
      province: row.province,
      country: row.country,
      website: row.website,
      dataSource: row.data_source,
      sourceReference: row.source_reference,
      isSharedData: row.is_shared_data,
      dataSensitivity: row.data_sensitivity,
      companySize: row.company_size,
      verificationStatus: row.verification_status,
      dataQualityScore: parseFloat(row.data_quality_score || '0'),
      headTags: this.parseTags(row.tags),
      classifications: this.parseClassifications(row.industry_classification),
      contactsCount: parseInt(row.contacts_count || '0'),
      listMembershipCount: parseInt(row.list_membership_count || '0')
    }))

    return {
      items: companies,
      total,
      page,
      limit,
      hasNextPage: offset + limit < total
    }
  }

  /**
   * Get company by ID with privacy controls
   */
  async getCompanyById(companyId: string): Promise<CompanySummary | null> {
    const query = `
      SELECT 
        c.id as company_id,
        c.organization_id,
        c.name_en as name,
        c.display_name,
        c.primary_registration_no as registration_no,
        c.province,
        c.country_code as country,
        c.website_url as website,
        c.data_source,
        c.source_reference,
        c.is_shared_data,
        c.data_sensitivity,
        c.company_size,
        c.verification_status,
        c.data_quality_score,
        c.tags,
        c.industry_classification,
        c.contact_count as contacts_count,
        c.list_membership_count
      FROM mv_company_search c
      WHERE c.id = $1 
        AND (c.organization_id = $2 OR c.organization_id IS NULL)
    `

    const result = await this.db.query(query, [companyId, this.user.organization_id], {
      organizationId: this.user.organization_id,
      userId: this.user.id
    })

    if (result.rowCount === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      companyId: row.company_id,
      organizationId: row.organization_id,
      name: row.name,
      displayName: row.display_name,
      registrationNo: row.registration_no,
      province: row.province,
      country: row.country,
      website: row.website,
      dataSource: row.data_source,
      sourceReference: row.source_reference,
      isSharedData: row.is_shared_data,
      dataSensitivity: row.data_sensitivity,
      companySize: row.company_size,
      verificationStatus: row.verification_status,
      dataQualityScore: parseFloat(row.data_quality_score || '0'),
      headTags: this.parseTags(row.tags),
      classifications: this.parseClassifications(row.industry_classification),
      contactsCount: parseInt(row.contacts_count || '0'),
      listMembershipCount: parseInt(row.list_membership_count || '0')
    }
  }

  /**
   * Create a new customer-specific company
   */
  async createCompany(companyData: CompanyCreateRequest): Promise<CompanyCore> {
    // Validate that user can only create customer_input companies in their org
    if (companyData.dataSource !== 'customer_input') {
      throw new Error('Users can only create customer_input companies')
    }

    const companyId = crypto.randomUUID()
    const now = new Date().toISOString()

    const query = `
      INSERT INTO companies (
        id, organization_id, name_en, name_th, business_description,
        province, website_url, primary_email, primary_phone,
        data_source, source_reference, is_shared_data, data_sensitivity,
        verification_status, created_at, updated_at, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *
    `

    const params = [
      companyId,
      this.user.organization_id,
      companyData.companyNameEn,
      companyData.companyNameTh,
      companyData.businessDescription,
      companyData.province,
      companyData.websiteUrl,
      companyData.primaryEmail,
      companyData.primaryPhone,
      companyData.dataSource,
      companyData.sourceReference || `Customer input - ${now}`,
      false, // is_shared_data
      companyData.dataSensitivity || 'standard',
      'unverified',
      now,
      now,
      this.user.id
    ]

    const result = await this.db.query(query, params, {
      organizationId: this.user.organization_id,
      userId: this.user.id
    })

    // Log audit trail
    await this.db.logAudit('companies', companyId, 'INSERT', null, result.rows[0], {
      organizationId: this.user.organization_id,
      userId: this.user.id
    })

    const row = result.rows[0]
    return {
      id: row.id,
      organization_id: row.organization_id,
      companyNameEn: row.name_en,
      companyNameTh: row.name_th,
      companyNameLocal: row.name_local,
      displayName: row.display_name,
      registrationId: row.primary_registration_no,
      dunsNumber: row.duns_number,
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2,
      district: row.district,
      subdistrict: row.subdistrict,
      provinceDetected: row.province,
      countryCode: row.country_code,
      businessDescription: row.business_description,
      establishedDate: row.established_date,
      employeeCountEstimate: row.employee_count_estimate,
      companySize: row.company_size,
      annualRevenueEstimate: row.annual_revenue_estimate,
      currencyCode: row.currency_code,
      websiteUrl: row.website_url,
      linkedinUrl: row.linkedin_url,
      logoUrl: row.logo_url,
      primaryEmail: row.primary_email,
      primaryPhone: row.primary_phone,
      industryClassification: row.industry_classification,
      tags: row.tags || [],
      dataSource: row.data_source,
      sourceReference: row.source_reference,
      isSharedData: row.is_shared_data,
      dataSensitivity: row.data_sensitivity,
      dataQualityScore: parseFloat(row.data_quality_score || '0'),
      verificationStatus: row.verification_status,
      lastEnrichedAt: row.last_enriched_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by
    }
  }

  /**
   * Update company (only if user owns it or it's shared data they have permission to edit)
   */
  async updateCompany(companyId: string, updates: CompanyUpdateRequest): Promise<CompanyCore> {
    // First, check if user has permission to update this company
    const existingCompany = await this.getCompanyById(companyId)
    if (!existingCompany) {
      throw new Error('Company not found or access denied')
    }

    // Users can only update their own organization's companies, not shared data
    if (existingCompany.organizationId !== this.user.organization_id) {
      throw new Error('Cannot update companies from other organizations or shared data')
    }

    const setClause = []
    const params = []
    let paramIndex = 1

    if (updates.companyNameEn !== undefined) {
      setClause.push(`name_en = $${paramIndex}`)
      params.push(updates.companyNameEn)
      paramIndex++
    }

    if (updates.companyNameTh !== undefined) {
      setClause.push(`name_th = $${paramIndex}`)
      params.push(updates.companyNameTh)
      paramIndex++
    }

    if (updates.businessDescription !== undefined) {
      setClause.push(`business_description = $${paramIndex}`)
      params.push(updates.businessDescription)
      paramIndex++
    }

    if (updates.province !== undefined) {
      setClause.push(`province = $${paramIndex}`)
      params.push(updates.province)
      paramIndex++
    }

    if (updates.websiteUrl !== undefined) {
      setClause.push(`website_url = $${paramIndex}`)
      params.push(updates.websiteUrl)
      paramIndex++
    }

    if (updates.primaryEmail !== undefined) {
      setClause.push(`primary_email = $${paramIndex}`)
      params.push(updates.primaryEmail)
      paramIndex++
    }

    if (updates.primaryPhone !== undefined) {
      setClause.push(`primary_phone = $${paramIndex}`)
      params.push(updates.primaryPhone)
      paramIndex++
    }

    if (updates.dataSensitivity !== undefined) {
      setClause.push(`data_sensitivity = $${paramIndex}`)
      params.push(updates.dataSensitivity)
      paramIndex++
    }

    if (updates.tags !== undefined) {
      setClause.push(`tags = $${paramIndex}`)
      params.push(updates.tags)
      paramIndex++
    }

    if (setClause.length === 0) {
      throw new Error('No valid fields to update')
    }

    // Add updated timestamp and user
    setClause.push(`updated_at = CURRENT_TIMESTAMP`)
    setClause.push(`updated_by = $${paramIndex}`)
    params.push(this.user.id)
    paramIndex++

    // Add company ID for WHERE clause
    params.push(companyId)

    const query = `
      UPDATE companies 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
        AND organization_id = $${paramIndex + 1}
      RETURNING *
    `

    params.push(this.user.organization_id)

    const result = await this.db.query(query, params, {
      organizationId: this.user.organization_id,
      userId: this.user.id
    })

    if (result.rowCount === 0) {
      throw new Error('Company not found or update failed')
    }

    // Log audit trail
    await this.db.logAudit('companies', companyId, 'UPDATE', existingCompany, result.rows[0], {
      organizationId: this.user.organization_id,
      userId: this.user.id
    })

    const row = result.rows[0]
    return {
      id: row.id,
      organization_id: row.organization_id,
      companyNameEn: row.name_en,
      companyNameTh: row.name_th,
      companyNameLocal: row.name_local,
      displayName: row.display_name,
      registrationId: row.primary_registration_no,
      dunsNumber: row.duns_number,
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2,
      district: row.district,
      subdistrict: row.subdistrict,
      provinceDetected: row.province,
      countryCode: row.country_code,
      businessDescription: row.business_description,
      establishedDate: row.established_date,
      employeeCountEstimate: row.employee_count_estimate,
      companySize: row.company_size,
      annualRevenueEstimate: row.annual_revenue_estimate,
      currencyCode: row.currency_code,
      websiteUrl: row.website_url,
      linkedinUrl: row.linkedin_url,
      logoUrl: row.logo_url,
      primaryEmail: row.primary_email,
      primaryPhone: row.primary_phone,
      industryClassification: row.industry_classification,
      tags: row.tags || [],
      dataSource: row.data_source,
      sourceReference: row.source_reference,
      isSharedData: row.is_shared_data,
      dataSensitivity: row.data_sensitivity,
      dataQualityScore: parseFloat(row.data_quality_score || '0'),
      verificationStatus: row.verification_status,
      lastEnrichedAt: row.last_enriched_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by
    }
  }

  /**
   * Get data source statistics for organization
   */
  async getDataSourceStats(): Promise<Record<string, number>> {
    const query = `
      SELECT 
        data_source,
        COUNT(*) as count
      FROM companies
      WHERE organization_id = $1 OR (organization_id IS NULL AND is_shared_data = true)
      GROUP BY data_source
      ORDER BY count DESC
    `

    const result = await this.db.query(query, [this.user.organization_id], {
      organizationId: this.user.organization_id,
      userId: this.user.id
    })

    const stats: Record<string, number> = {}
    result.rows.forEach(row => {
      stats[row.data_source] = parseInt(row.count)
    })

    return stats
  }
}

export type { SearchFilters, SearchResult, CompanyCreateRequest, CompanyUpdateRequest }
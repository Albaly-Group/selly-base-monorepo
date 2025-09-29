import { Pool, PoolClient, PoolConfig } from 'pg'
import { Organization, User } from '@/lib/types'

interface DatabaseConfig extends PoolConfig {
  host?: string
  port?: number  
  database?: string
  user?: string
  password?: string
  ssl?: boolean | object
  max?: number
  idleTimeoutMillis?: number
  connectionTimeoutMillis?: number
}

interface QueryContext {
  organizationId?: string | null
  userId?: string
  includeSharedData?: boolean
}

interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
  command: string
}

class DatabaseService {
  private pool: Pool
  private static instance: DatabaseService

  constructor(config?: DatabaseConfig) {
    const dbConfig: DatabaseConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'selly_base',
      user: process.env.DB_USER || 'postgres', 
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_SIZE || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ...config
    }

    // Support DATABASE_URL for environment-based configuration
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: parseInt(process.env.DB_POOL_SIZE || '20'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
    } else {
      this.pool = new Pool(dbConfig)
    }

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client:', err)
    })
  }

  static getInstance(config?: DatabaseConfig): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(config)
    }
    return DatabaseService.instance
  }

  /**
   * Execute a query with automatic organization scoping
   */
  async query<T = any>(
    text: string, 
    params: any[] = [], 
    context?: QueryContext
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect()
    
    try {
      // Set session context for audit trails
      if (context?.organizationId) {
        await client.query('SET LOCAL app.current_organization_id = $1', [context.organizationId])
      }
      if (context?.userId) {
        await client.query('SET LOCAL app.current_user_id = $1', [context.userId])
      }

      const result = await client.query(text, params)
      
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        command: result.command
      }
    } catch (error) {
      console.error('Database query error:', {
        query: text,
        params: params,
        context: context,
        error: error
      })
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Execute a transaction with multiple queries
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    context?: QueryContext
  ): Promise<T> {
    const client = await this.pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Set session context for audit trails
      if (context?.organizationId) {
        await client.query('SET LOCAL app.current_organization_id = $1', [context.organizationId])
      }
      if (context?.userId) {
        await client.query('SET LOCAL app.current_user_id = $1', [context.userId])
      }

      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Database transaction error:', error)
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Get companies with proper SaaS privacy controls
   */
  async getCompaniesForOrganization(
    organizationId: string | null,
    includeSharedData: boolean = true,
    filters: Record<string, any> = {}
  ): Promise<any[]> {
    let whereConditions = []
    let params: any[] = []
    let paramIndex = 1

    // Organization scoping with shared data support
    if (organizationId) {
      if (includeSharedData) {
        whereConditions.push(`(c.organization_id = $${paramIndex} OR c.organization_id IS NULL)`)
        params.push(organizationId)
        paramIndex++
      } else {
        whereConditions.push(`c.organization_id = $${paramIndex}`)
        params.push(organizationId)
        paramIndex++
      }
    } else {
      // If no organization specified, only show shared data
      whereConditions.push(`c.organization_id IS NULL`)
    }

    // Add additional filters
    if (filters.province) {
      whereConditions.push(`c.province = $${paramIndex}`)
      params.push(filters.province)
      paramIndex++
    }
    
    if (filters.data_source) {
      whereConditions.push(`c.data_source = $${paramIndex}`)
      params.push(filters.data_source)
      paramIndex++
    }

    if (filters.verification_status) {
      whereConditions.push(`c.verification_status = $${paramIndex}`)
      params.push(filters.verification_status)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    const query = `
      SELECT * FROM mv_company_search c
      ${whereClause}
      ORDER BY c.updated_at DESC, c.name_en ASC
      LIMIT 50
    `

    const result = await this.query(query, params, { organizationId: organizationId || undefined })
    return result.rows
  }

  /**
   * Create audit log entry
   */
  async logAudit(
    tableName: string,
    recordId: string,
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    oldData: any = null,
    newData: any = null,
    context: QueryContext
  ): Promise<void> {
    const query = `
      INSERT INTO audit_logs (
        table_name, record_id, operation, old_data, new_data,
        user_id, organization_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `
    
    const params = [
      tableName,
      recordId,
      operation,
      oldData ? JSON.stringify(oldData) : null,
      newData ? JSON.stringify(newData) : null,
      context.userId || null,
      context.organizationId || null
    ]

    await this.query(query, params, context)
  }

  /**
   * Validate organization access for a user
   */
  async validateOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM users 
      WHERE id = $1 AND organization_id = $2 AND status = 'active'
    `
    
    const result = await this.query(query, [userId, organizationId])
    return result.rowCount > 0
  }

  /**
   * Get user with organization context
   */
  async getUserWithOrganization(userId: string): Promise<(User & { organization: Organization }) | null> {
    const query = `
      SELECT 
        u.id, u.email, u.name, u.avatar_url, u.status, u.metadata,
        u.created_at, u.updated_at, u.organization_id,
        o.id as org_id, o.name as org_name, o.slug as org_slug, 
        o.status as org_status, o.subscription_tier
      FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = $1 AND u.status = 'active'
    `
    
    const result = await this.query(query, [userId])
    
    if (result.rowCount === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatar_url: row.avatar_url,
      status: row.status,
      metadata: row.metadata,
      created_at: row.created_at,
      updated_at: row.updated_at,
      organization_id: row.organization_id,
      organization: {
        id: row.org_id,
        name: row.org_name,
        slug: row.org_slug,
        status: row.org_status,
        subscription_tier: row.subscription_tier,
        created_at: row.created_at,
        updated_at: row.updated_at
      }
    }
  }

  /**
   * Close database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end()
  }

  /**
   * Test database connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as test')
      return result.rowCount === 1
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    }
  }
}

export default DatabaseService
export type { QueryContext, QueryResult, DatabaseConfig }
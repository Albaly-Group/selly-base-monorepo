import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuditLogs,
  Users,
  AuditLogs as AuditLog,
  Users as User,
} from '../../entities';

export interface AuditLogData {
  organizationId: string;
  userId?: string;
  entityType: string;
  entityId?: string;
  actionType:
    | 'CREATE'
    | 'READ'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'SEARCH'
    | 'EXPORT'
    | 'IMPORT';
  resourceType?: string;
  resourcePath?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  statusCode?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogs)
    private readonly auditLogRepository: Repository<AuditLogs>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async log(data: AuditLogData): Promise<void> {
    try {

      const auditLog = this.auditLogRepository.create({
        ...data,
        createdAt: new Date(),
      });
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      // Never throw errors from audit logging to avoid breaking business logic
      console.error('Failed to write audit log:', error);
    }
  }

  async logUserAction(
    user: User | { id: string; organizationId: string },
    actionType: AuditLogData['actionType'],
    entityType: string,
    entityId?: string,
    options: Partial<AuditLogData> = {},
  ): Promise<void> {
    await this.log({
      organizationId: user.organizationId || '',
      userId: user.id,
      entityType,
      entityId,
      actionType,
      ...options,
    });
  }

  async logCompanyOperation(
    user: User | { id: string; organizationId: string },
    actionType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    companyId: string,
    options: Partial<AuditLogData> = {},
  ): Promise<void> {
    await this.logUserAction(user, actionType, 'Company', companyId, {
      resourceType: 'company',
      resourcePath: `/api/companies/${companyId}`,
      ...options,
    });
  }

  async logListOperation(
    user: User | { id: string; organizationId: string },
    actionType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    listId: string,
    options: Partial<AuditLogData> = {},
  ): Promise<void> {
    await this.logUserAction(user, actionType, 'CompanyList', listId, {
      resourceType: 'company_list',
      resourcePath: `/api/company-lists/${listId}`,
      ...options,
    });
  }

  async logSearchOperation(
    user: User | { id: string; organizationId: string },
    searchTerm: string,
    resultCount: number,
    options: Partial<AuditLogData> = {},
  ): Promise<void> {
    await this.logUserAction(user, 'SEARCH', 'Company', undefined, {
      resourceType: 'search',
      resourcePath: '/api/companies/search',
      metadata: {
        searchTerm,
        resultCount,
        ...options.metadata,
      },
      ...options,
    });
  }

  async logAuthOperation(
    userId: string,
    organizationId: string,
    actionType: 'LOGIN' | 'LOGOUT',
    options: Partial<AuditLogData> = {},
  ): Promise<void> {
    await this.log({
      organizationId,
      userId,
      entityType: 'User',
      entityId: userId,
      actionType,
      resourceType: 'authentication',
      resourcePath: '/api/auth/login',
      ...options,
    });
  }

  async getAuditLogs(
    organizationId: string,
    options: {
      entityType?: string;
      entityId?: string;
      userId?: string;
      actionType?: string;
      limit?: number;
      offset?: number;
      dateFrom?: Date;
      dateTo?: Date;
    } = {},
  ): Promise<{ data: AuditLog[]; total: number }> {
    if (!this.auditLogRepository) {
      return { data: [], total: 0 };
    }

    const {
      entityType,
      entityId,
      userId,
      actionType,
      limit = 50,
      offset = 0,
      dateFrom,
      dateTo,
    } = options;

    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .where('audit.organizationId = :organizationId', { organizationId });

    if (entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (userId) {
      query.andWhere('audit.userId = :userId', { userId });
    }

    if (actionType) {
      query.andWhere('audit.actionType = :actionType', { actionType });
    }

    if (dateFrom) {
      query.andWhere('audit.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      query.andWhere('audit.createdAt <= :dateTo', { dateTo });
    }

    query.orderBy('audit.createdAt', 'DESC').skip(offset).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }
}

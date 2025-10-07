import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan, Between } from 'typeorm';
import { Users, Organizations, AuditLogs } from '../../entities';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @InjectRepository(Organizations)
    private readonly orgsRepo: Repository<Organizations>,
    @InjectRepository(AuditLogs)
    private readonly auditRepo: Repository<AuditLogs>,
  ) {}

  async getOrganizationUsers(
    organizationId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await this.usersRepo.findAndCount({
        where: { organizationId },
        relations: ['organization', 'userRoles2', 'userRoles2.role'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const formattedUsers = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.userRoles2?.[0]?.role?.name || 'user',
        status: user.status,
        lastLogin: user.lastLoginAt,
        createdAt: user.createdAt,
        permissions: user.userRoles2?.[0]?.role?.permissions || [],
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        data: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching organization users:', error);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  async createOrganizationUser(userData: {
    name: string;
    email: string;
    password: string;
    organizationId: string;
    role?: string;
  }) {
    try {
      // Hash the password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create the user
      const user = this.usersRepo.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        organizationId: userData.organizationId,
        status: 'active',
        emailVerifiedAt: new Date(),
      });

      const savedUser = await this.usersRepo.save(user);

      return {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: userData.role || 'user',
        status: savedUser.status,
        createdAt: savedUser.createdAt,
        permissions: [],
        message: 'Organization user created successfully',
      };
    } catch (error) {
      console.error('Error creating organization user:', error);
      throw error;
    }
  }

  async updateOrganizationUser(userId: string, updateData: any) {
    try {
      const user = await this.usersRepo.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Update allowed fields
      if (updateData.name) user.name = updateData.name;
      if (updateData.email) user.email = updateData.email;
      if (updateData.status) user.status = updateData.status;

      // Hash new password if provided
      if (updateData.password) {
        user.passwordHash = await bcrypt.hash(updateData.password, 10);
      }

      const savedUser = await this.usersRepo.save(user);

      return {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        status: savedUser.status,
        updatedAt: savedUser.updatedAt,
        message: 'Organization user updated successfully',
      };
    } catch (error) {
      console.error('Error updating organization user:', error);
      throw error;
    }
  }

  async deleteOrganizationUser(userId: string) {
    try {
      const result = await this.usersRepo.delete(userId);

      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return {
        message: `Organization user ${userId} deleted successfully`,
      };
    } catch (error) {
      console.error('Error deleting organization user:', error);
      throw error;
    }
  }

  async getOrganizationPolicies(organizationId: string) {
    try {
      const org = await this.orgsRepo.findOne({
        where: { id: organizationId },
      });

      if (!org) {
        throw new NotFoundException(
          `Organization with ID ${organizationId} not found`,
        );
      }

      // Return policies from organization settings or defaults
      const settings = (org.settings as any) || {};

      return {
        dataRetention: settings.dataRetention || {
          enabled: true,
          retentionPeriod: 365,
          autoCleanup: true,
        },
        accessControl: settings.accessControl || {
          requireMFA: false,
          sessionTimeout: 480,
          passwordPolicy: {
            minLength: 8,
            requireSpecialChars: true,
            requireNumbers: true,
          },
        },
        dataSharing: settings.dataSharing || {
          allowPublicLists: true,
          allowExternalSharing: false,
          requireApproval: true,
        },
        apiAccess: settings.apiAccess || {
          enabled: true,
          rateLimit: 1000,
          requireApiKey: true,
        },
      };
    } catch (error) {
      console.error('Error fetching organization policies:', error);
      throw error;
    }
  }

  async updateOrganizationPolicies(organizationId: string, policies: any) {
    try {
      const org = await this.orgsRepo.findOne({
        where: { id: organizationId },
      });

      if (!org) {
        throw new NotFoundException(
          `Organization with ID ${organizationId} not found`,
        );
      }

      // Update organization settings
      org.settings = {
        ...((org.settings as any) || {}),
        ...policies,
      };

      await this.orgsRepo.save(org);

      return {
        ...policies,
        updatedAt: new Date().toISOString(),
        message: 'Organization policies updated successfully',
      };
    } catch (error) {
      console.error('Error updating organization policies:', error);
      throw error;
    }
  }

  async getActivityLogs(
    organizationId: string,
    page: number = 1,
    limit: number = 50,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      const whereClause: any = {};

      // Filter by date range if provided
      if (startDate && endDate) {
        whereClause.createdAt = Between(new Date(startDate), new Date(endDate));
      } else if (startDate) {
        whereClause.createdAt = MoreThanOrEqual(new Date(startDate));
      } else if (endDate) {
        whereClause.createdAt = LessThan(new Date(endDate));
      }

      const [logs, total] = await this.auditRepo.findAndCount({
        where: whereClause,
        relations: ['user'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const formattedLogs = logs.map((log) => ({
        id: log.id,
        timestamp: log.createdAt,
        user: log.user?.email || 'System',
        action: log.actionType,
        resource: log.resourceType,
        resourceId: log.entityId,
        description:
          typeof log.metadata === 'string'
            ? log.metadata
            : JSON.stringify(log.metadata),
        ipAddress: log.ipAddress || 'N/A',
        userAgent: log.userAgent || 'N/A',
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        data: formattedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }
}

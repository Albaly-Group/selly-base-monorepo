import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Organizations, Users, Companies } from '../../entities';

@Injectable()
export class PlatformAdminService {
  constructor(
    @InjectRepository(Organizations)
    private readonly orgsRepo: Repository<Organizations>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @InjectRepository(Companies)
    private readonly companiesRepo: Repository<Companies>,
  ) {}

  /**
   * Get all tenant organizations for platform admin
   * Platform admins can see all organizations in the system
   */
  async getTenants(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const [orgs, total] = await this.orgsRepo.findAndCount({
        relations: ['users'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      // Count users and data for each organization
      const tenantsWithCounts = await Promise.all(
        orgs.map(async (org) => {
          const userCount = await this.usersRepo.count({
            where: { organizationId: org.id },
          });

          const dataCount = await this.companiesRepo.count({
            where: { organizationId: org.id },
          });

          // Get last activity from users' last login
          const lastActiveUser = await this.usersRepo.findOne({
            where: { organizationId: org.id },
            order: { lastLoginAt: 'DESC' },
          });

          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            domain: org.domain,
            status: org.status,
            subscription_tier: org.subscriptionTier,
            created_at: org.createdAt,
            updated_at: org.updatedAt,
            user_count: userCount,
            data_count: dataCount,
            last_activity: lastActiveUser?.lastLoginAt || org.updatedAt,
          };
        }),
      );

      const totalPages = Math.ceil(total / limit);

      return {
        data: tenantsWithCounts,
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
      console.error('Error fetching tenants:', error);
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

  /**
   * Get all platform users (across all organizations)
   * Includes platform admins and users from all tenant organizations
   */
  async getPlatformUsers(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await this.usersRepo.findAndCount({
        relations: ['organization', 'userRoles2', 'userRoles2.role'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const formattedUsers = users.map((user) => {
        // Get role name and permissions
        const role = user.userRoles2?.[0]?.role;
        const roleName = role?.name || 'user';
        const permissions = role?.permissions || [];

        // Calculate login count from activity logs (simplified - could be enhanced)
        const loginCount = 0; // This would need to be calculated from UserActivityLogs

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: roleName,
          status: user.status,
          organization_id: user.organizationId,
          organization: user.organization
            ? {
                id: user.organization.id,
                name: user.organization.name,
              }
            : null,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
          lastLogin: user.lastLoginAt?.toISOString() || null,
          loginCount: loginCount,
          permissions: permissions,
        };
      });

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
      console.error('Error fetching platform users:', error);
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

  /**
   * Get shared companies (companies with isSharedData = true)
   * These are companies available to all tenant organizations
   */
  async getSharedCompanies(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const [companies, total] = await this.companiesRepo.findAndCount({
        where: { isSharedData: true },
        skip,
        take: limit,
        order: { updatedAt: 'DESC' },
      });

      const formattedCompanies = companies.map((company) => {
        // Calculate data completeness based on filled fields
        const totalFields = 10; // Adjust based on important fields
        let filledFields = 0;
        if (company.nameEn) filledFields++;
        if (company.primaryRegistrationNo) filledFields++;
        if (company.province) filledFields++;
        if (company.industryClassification) filledFields++;
        if (company.websiteUrl) filledFields++;
        if (company.primaryPhone) filledFields++;
        if (company.primaryEmail) filledFields++;
        if (company.addressLine_1) filledFields++;
        if (company.companySize) filledFields++;
        if (company.verificationStatus) filledFields++;

        const dataCompleteness = Math.round((filledFields / totalFields) * 100);

        // Extract industry name from industryClassification JSONB
        let industryName = 'N/A';
        if (
          company.industryClassification &&
          typeof company.industryClassification === 'object'
        ) {
          const industryData = company.industryClassification as any;
          industryName =
            industryData.name || industryData.industryName || 'N/A';
        }

        return {
          id: company.id,
          companyNameEn: company.nameEn,
          industrialName: industryName,
          province: company.province || 'N/A',
          registeredNo: company.primaryRegistrationNo,
          verificationStatus:
            company.verificationStatus === 'verified'
              ? 'Active'
              : company.verificationStatus === 'needs_review'
                ? 'Needs Verification'
                : 'Invalid',
          dataCompleteness: dataCompleteness,
          lastUpdated:
            company.updatedAt?.toISOString() ||
            company.createdAt?.toISOString(),
          createdBy: 'System', // Could be enhanced to track actual creator
          isShared: company.isSharedData,
          tenantCount: 0, // Would need a query to count how many tenants use this company
        };
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: formattedCompanies,
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
      console.error('Error fetching shared companies:', error);
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

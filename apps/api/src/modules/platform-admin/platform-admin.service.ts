import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  Organizations,
  Users,
  Companies,
  Roles,
  UserRoles,
} from '../../entities';
import {
  CreateTenantDto,
  UpdateTenantDto,
  CreatePlatformUserDto,
  UpdatePlatformUserDto,
  UpdateSharedCompanyDto,
} from '../../dtos/platform-admin.dto';
import * as argon2 from 'argon2';

@Injectable()
export class PlatformAdminService {
  constructor(
    @InjectRepository(Organizations)
    private readonly orgsRepo: Repository<Organizations>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @InjectRepository(Companies)
    private readonly companiesRepo: Repository<Companies>,
    @InjectRepository(Roles)
    private readonly rolesRepo: Repository<Roles>,
    @InjectRepository(UserRoles)
    private readonly userRolesRepo: Repository<UserRoles>,
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
        // if (company.primaryRegistrationNo) filledFields++;
        if (company.primaryRegionId) filledFields++;
        if (company.primaryIndustryId) filledFields++;
        if (company.websiteUrl) filledFields++;
        if (company.primaryPhone) filledFields++;
        if (company.primaryEmail) filledFields++;
        if (company.addressLine1) filledFields++;
        if (company.companySize) filledFields++;
        if (company.verificationStatus) filledFields++;

        const dataCompleteness = Math.round((filledFields / totalFields) * 100);

        const industryName = 'N/A';

        return {
          id: company.id,
          companyNameEn: company.nameEn,
          industrialName: industryName,
          province: 'N/A',
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
          createdBy: 'System',
          isShared: company.isSharedData,
          tenantCount: 0,
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

  /**
   * Create a new tenant organization
   */
  async createTenant(createTenantDto: CreateTenantDto) {
    try {
      // Check if slug already exists
      const existingOrg = await this.orgsRepo.findOne({
        where: { slug: createTenantDto.slug },
      });
      if (existingOrg) {
        throw new ConflictException(
          `Organization with slug '${createTenantDto.slug}' already exists`,
        );
      }

      // Create organization
      const org = this.orgsRepo.create({
        name: createTenantDto.name,
        slug: createTenantDto.slug,
        domain: createTenantDto.domain,
        status: createTenantDto.status || 'active',
        subscriptionTier: createTenantDto.subscriptionTier || 'basic',
      });

      const savedOrg = await this.orgsRepo.save(org);

      // Create admin user if credentials provided
      if (
        createTenantDto.adminEmail &&
        createTenantDto.adminName &&
        createTenantDto.adminPassword
      ) {
        const hashedPassword = await argon2.hash(createTenantDto.adminPassword);

        const adminUser = this.usersRepo.create({
          organizationId: savedOrg.id,
          email: createTenantDto.adminEmail,
          name: createTenantDto.adminName,
          passwordHash: hashedPassword,
          status: 'active',
        });

        await this.usersRepo.save(adminUser);

        // Assign customer_admin role if it exists
        const customerAdminRole = await this.rolesRepo.findOne({
          where: { name: 'customer_admin' },
        });
        if (customerAdminRole) {
          const userRole = this.userRolesRepo.create({
            userId: adminUser.id,
            roleId: customerAdminRole.id,
            organizationId: savedOrg.id,
          });
          await this.userRolesRepo.save(userRole);
        }
      }

      return {
        message: 'Tenant organization created successfully',
        data: {
          id: savedOrg.id,
          name: savedOrg.name,
          slug: savedOrg.slug,
          domain: savedOrg.domain,
          status: savedOrg.status,
          subscription_tier: savedOrg.subscriptionTier,
          created_at: savedOrg.createdAt,
          updated_at: savedOrg.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error creating tenant:', error);
      throw new BadRequestException('Failed to create tenant organization');
    }
  }

  /**
   * Update a tenant organization
   */
  async updateTenant(tenantId: string, updateTenantDto: UpdateTenantDto) {
    try {
      const org = await this.orgsRepo.findOne({ where: { id: tenantId } });
      if (!org) {
        throw new NotFoundException(`Tenant organization not found`);
      }

      // Update fields if provided
      if (updateTenantDto.name !== undefined) org.name = updateTenantDto.name;
      if (updateTenantDto.domain !== undefined)
        org.domain = updateTenantDto.domain;
      if (updateTenantDto.status !== undefined)
        org.status = updateTenantDto.status;
      if (updateTenantDto.subscriptionTier !== undefined)
        org.subscriptionTier = updateTenantDto.subscriptionTier;

      org.updatedAt = new Date();

      const savedOrg = await this.orgsRepo.save(org);

      return {
        message: 'Tenant organization updated successfully',
        data: {
          id: savedOrg.id,
          name: savedOrg.name,
          slug: savedOrg.slug,
          domain: savedOrg.domain,
          status: savedOrg.status,
          subscription_tier: savedOrg.subscriptionTier,
          created_at: savedOrg.createdAt,
          updated_at: savedOrg.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating tenant:', error);
      throw new BadRequestException('Failed to update tenant organization');
    }
  }

  /**
   * Delete a tenant organization (soft delete by setting status to inactive)
   */
  async deleteTenant(tenantId: string) {
    try {
      const org = await this.orgsRepo.findOne({ where: { id: tenantId } });
      if (!org) {
        throw new NotFoundException(`Tenant organization not found`);
      }

      // Soft delete by setting status to inactive
      org.status = 'inactive';
      org.updatedAt = new Date();
      await this.orgsRepo.save(org);

      return {
        message: 'Tenant organization deactivated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting tenant:', error);
      throw new BadRequestException('Failed to delete tenant organization');
    }
  }

  /**
   * Create a new platform user
   */
  async createPlatformUser(createUserDto: CreatePlatformUserDto) {
    try {
      // Check if email already exists
      const existingUser = await this.usersRepo.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException(
          `User with email '${createUserDto.email}' already exists`,
        );
      }

      // Verify organization exists
      const org = await this.orgsRepo.findOne({
        where: { id: createUserDto.organizationId },
      });
      if (!org) {
        throw new NotFoundException(
          `Organization with ID '${createUserDto.organizationId}' not found`,
        );
      }

      // Hash password
      const hashedPassword = await argon2.hash(createUserDto.password);

      // Create user
      const user = this.usersRepo.create({
        organizationId: createUserDto.organizationId,
        email: createUserDto.email,
        name: createUserDto.name,
        passwordHash: hashedPassword,
        status: createUserDto.status || 'active',
        avatarUrl: createUserDto.avatarUrl,
      });

      const savedUser = await this.usersRepo.save(user);

      // Assign role if provided
      if (createUserDto.roleId) {
        const role = await this.rolesRepo.findOne({
          where: { id: createUserDto.roleId },
        });
        if (role) {
          const userRole = this.userRolesRepo.create({
            userId: savedUser.id,
            roleId: createUserDto.roleId,
            organizationId: createUserDto.organizationId,
          });
          await this.userRolesRepo.save(userRole);
        }
      }

      return {
        message: 'Platform user created successfully',
        data: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          status: savedUser.status,
          organization_id: savedUser.organizationId,
          created_at: savedUser.createdAt,
          updated_at: savedUser.updatedAt,
        },
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Error creating platform user:', error);
      throw new BadRequestException('Failed to create platform user');
    }
  }

  /**
   * Update a platform user
   */
  async updatePlatformUser(
    userId: string,
    updateUserDto: UpdatePlatformUserDto,
  ) {
    try {
      const user = await this.usersRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      // Update fields if provided
      if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
      if (updateUserDto.status !== undefined)
        user.status = updateUserDto.status;
      if (updateUserDto.avatarUrl !== undefined)
        user.avatarUrl = updateUserDto.avatarUrl;

      user.updatedAt = new Date();

      const savedUser = await this.usersRepo.save(user);

      // Update role if provided
      if (updateUserDto.roleId && user.organizationId) {
        // Remove existing roles
        await this.userRolesRepo.delete({ userId: user.id });

        // Add new role
        const role = await this.rolesRepo.findOne({
          where: { id: updateUserDto.roleId },
        });
        if (role) {
          const userRole = this.userRolesRepo.create({
            userId: savedUser.id,
            roleId: updateUserDto.roleId,
            organizationId: user.organizationId,
          });
          await this.userRolesRepo.save(userRole);
        }
      }

      return {
        message: 'Platform user updated successfully',
        data: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          status: savedUser.status,
          organization_id: savedUser.organizationId,
          created_at: savedUser.createdAt,
          updated_at: savedUser.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating platform user:', error);
      throw new BadRequestException('Failed to update platform user');
    }
  }

  /**
   * Delete a platform user (soft delete by setting status to inactive)
   */
  async deletePlatformUser(userId: string) {
    try {
      const user = await this.usersRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }

      // Soft delete by setting status to inactive
      user.status = 'inactive';
      user.updatedAt = new Date();
      await this.usersRepo.save(user);

      return {
        message: 'Platform user deactivated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting platform user:', error);
      throw new BadRequestException('Failed to delete platform user');
    }
  }

  /**
   * Update a shared company
   */
  async updateSharedCompany(
    companyId: string,
    updateCompanyDto: UpdateSharedCompanyDto,
  ) {
    try {
      const company = await this.companiesRepo.findOne({
        where: { id: companyId },
      });
      if (!company) {
        throw new NotFoundException(`Company not found`);
      }

      // Update all fields if provided (matching enhanced-company.dto.ts)
      if (updateCompanyDto.companyNameEn !== undefined)
        company.nameEn = updateCompanyDto.companyNameEn;
      if (updateCompanyDto.companyNameTh !== undefined)
        company.nameTh = updateCompanyDto.companyNameTh;
      // if (updateCompanyDto.primaryRegistrationNo !== undefined)
      // company.primaryRegistrationNo = updateCompanyDto.primaryRegistrationNo;
      if (updateCompanyDto.businessDescription !== undefined)
        company.businessDescription = updateCompanyDto.businessDescription;
      if (updateCompanyDto.websiteUrl !== undefined)
        company.websiteUrl = updateCompanyDto.websiteUrl;
      if (updateCompanyDto.primaryEmail !== undefined)
        company.primaryEmail = updateCompanyDto.primaryEmail;
      if (updateCompanyDto.primaryPhone !== undefined)
        company.primaryPhone = updateCompanyDto.primaryPhone;
      if (updateCompanyDto.addressLine1 !== undefined)
        company.addressLine1 = updateCompanyDto.addressLine1;
      if (updateCompanyDto.addressLine2 !== undefined)
        company.addressLine2 = updateCompanyDto.addressLine2;
      if (updateCompanyDto.postalCode !== undefined)
        company.postalCode = updateCompanyDto.postalCode;
      if (updateCompanyDto.primaryRegionId !== undefined)
        company.primaryRegionId = updateCompanyDto.primaryRegionId;
      if (updateCompanyDto.companySize !== undefined)
        company.companySize = updateCompanyDto.companySize;
      if (updateCompanyDto.employeeCountEstimate !== undefined)
        company.employeeCountEstimate = updateCompanyDto.employeeCountEstimate;
      if (updateCompanyDto.dataSensitivity !== undefined)
        company.dataSensitivity = updateCompanyDto.dataSensitivity;
      if (updateCompanyDto.isSharedData !== undefined)
        company.isSharedData = updateCompanyDto.isSharedData;
      if (updateCompanyDto.verificationStatus !== undefined)
        company.verificationStatus = updateCompanyDto.verificationStatus;

      company.updatedAt = new Date();

      const savedCompany = await this.companiesRepo.save(company);

      return {
        message: 'Shared company updated successfully',
        data: {
          id: savedCompany.id,
          companyNameEn: savedCompany.nameEn,
          companyNameTh: savedCompany.nameTh,
          // primaryRegistrationNo: savedCompany.primaryRegistrationNo,
          businessDescription: savedCompany.businessDescription,
          websiteUrl: savedCompany.websiteUrl,
          primaryEmail: savedCompany.primaryEmail,
          primaryPhone: savedCompany.primaryPhone,
          addressLine1: savedCompany.addressLine1,
          addressLine2: savedCompany.addressLine2,
          postalCode: savedCompany.postalCode,
          primaryRegionId: savedCompany.primaryRegionId,
          companySize: savedCompany.companySize,
          employeeCountEstimate: savedCompany.employeeCountEstimate,
          dataSensitivity: savedCompany.dataSensitivity,
          isSharedData: savedCompany.isSharedData,
          verificationStatus: savedCompany.verificationStatus,
          updated_at: savedCompany.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating shared company:', error);
      throw new BadRequestException('Failed to update shared company');
    }
  }
}

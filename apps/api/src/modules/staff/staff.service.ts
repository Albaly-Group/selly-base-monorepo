import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Users,
  Roles,
  UserRoles,
  Organizations,
  Users as User,
  Roles as Role,
  UserRoles as UserRole,
  Organizations as Organization,
} from '../../entities';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Roles)
    private readonly roleRepository: Repository<Roles>,
    @InjectRepository(UserRoles)
    private readonly userRoleRepository: Repository<UserRoles>,
    @InjectRepository(Organizations)
    private readonly organizationRepository: Repository<Organizations>,
  ) {}

  async getStaffMembers(params?: {
    page?: number;
    limit?: number;
    organizationId?: string;
  }) {
    const page = params?.page || 1;
    const limit = Math.min(params?.limit || 50, 100);
    const skip = (page - 1) * limit;

    // Database implementation only - no mock data fallback
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.userRoles2', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role');

    if (params?.organizationId) {
      queryBuilder.andWhere('user.organizationId = :orgId', {
        orgId: params.organizationId,
      });
    }

    queryBuilder.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    // Transform users to include role information
    const transformedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      lastLogin: user.lastLoginAt,
      createdAt: user.createdAt,
      organization: user.organization?.name,
      roles: user.userRoles2?.map((ur) => ur.role?.name).filter(Boolean) || [],
      permissions:
        user.userRoles2?.flatMap((ur) => ur.role?.permissions || []) || [],
    }));

    return {
      data: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getStaffMemberById(id: string, organizationId?: string) {
    // Database implementation only - no mock data fallback
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.userRoles2', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('user.id = :id', { id });

    if (organizationId) {
      queryBuilder.andWhere('user.organizationId = :orgId', {
        orgId: organizationId,
      });
    }

    const user = await queryBuilder.getOne();

    if (!user) {
      throw new NotFoundException(`Staff member with ID ${id} not found`);
    }

    // Transform user to include role information
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      lastLogin: user.lastLoginAt,
      createdAt: user.createdAt,
      organization: user.organization?.name,
      roles: user.userRoles2?.map((ur) => ur.role?.name).filter(Boolean) || [],
      permissions:
        user.userRoles2?.flatMap((ur) => ur.role?.permissions || []) || [],
    };
  }

  async createStaffMember(staffData: {
    name: string;
    email: string;
    password?: string;
    organizationId?: string;
    role?: string;
  }) {
    // Database implementation only - no mock data fallback
    const user = this.userRepository.create({
      name: staffData.name,
      email: staffData.email,
      passwordHash: staffData.password || 'temp_password_hash', // In real app, hash this
      organizationId: staffData.organizationId,
      status: 'active',
    });

    const savedUser = await this.userRepository.save(user);

    // Assign role if provided
    if (staffData.role) {
      const role = await this.roleRepository.findOne({
        where: { name: staffData.role },
      });
      if (role) {
        const userRole = this.userRoleRepository.create({
          userId: savedUser.id,
          roleId: role.id,
          organizationId: staffData.organizationId,
        });
        await this.userRoleRepository.save(userRole);
      }
    }

    return {
      ...savedUser,
      message: 'Staff member created successfully',
    };
  }

  async updateStaffMember(
    id: string,
    updateData: any,
    organizationId?: string,
  ) {
    // Database implementation only - no mock data fallback
    const queryBuilder = this.userRepository
      .createQueryBuilder()
      .update(User)
      .set(updateData)
      .where('id = :id', { id });

    if (organizationId) {
      queryBuilder.andWhere('organizationId = :orgId', {
        orgId: organizationId,
      });
    }

    const result = await queryBuilder.execute();

    if (result.affected === 0) {
      throw new NotFoundException('Staff member not found');
    }

    return {
      id,
      ...updateData,
      updatedAt: new Date().toISOString(),
      message: 'Staff member updated successfully',
    };
  }

  async deleteStaffMember(id: string, organizationId?: string) {
    // Database implementation only - no mock data fallback
    const queryBuilder = this.userRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id });

    if (organizationId) {
      queryBuilder.andWhere('organizationId = :orgId', {
        orgId: organizationId,
      });
    }

    const result = await queryBuilder.execute();

    if (result.affected === 0) {
      throw new NotFoundException('Staff member not found');
    }

    return { message: `Staff member ${id} deleted successfully` };
  }

  async updateStaffRole(id: string, role: string, organizationId?: string) {
    // Database implementation only - no mock data fallback
    const roleEntity = await this.roleRepository.findOne({
      where: { name: role },
    });
    if (!roleEntity) {
      throw new NotFoundException('Role not found');
    }

    // Remove existing roles for this user in this organization
    await this.userRoleRepository.delete({
      userId: id,
      organizationId: organizationId,
    });

    // Add new role
    const userRole = this.userRoleRepository.create({
      userId: id,
      roleId: roleEntity.id,
      organizationId: organizationId,
    });

    await this.userRoleRepository.save(userRole);

    return {
      id,
      role,
      updatedAt: new Date().toISOString(),
      message: `Staff member role updated to ${role}`,
    };
  }
}

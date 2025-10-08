import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivityLogs } from '../../entities';
import { CreateCompanyActivityDto } from '../../dtos/company-activity.dto';

@Injectable()
export class CompanyActivitiesService {
  constructor(
    @InjectRepository(UserActivityLogs)
    private readonly activityRepository: Repository<UserActivityLogs>,
  ) {}

  async getActivities(
    companyId?: string,
    activityType?: string,
    limit = 50,
  ): Promise<any[]> {
    try {
      const query = this.activityRepository
        .createQueryBuilder('activity')
        .leftJoinAndSelect('activity.user', 'user')
        .where("activity.entityType = 'company'");

      if (companyId) {
        query.andWhere('activity.entityId = :companyId', { companyId });
      }

      if (activityType) {
        query.andWhere('activity.activityType = :activityType', {
          activityType,
        });
      }

      query.orderBy('activity.createdAt', 'DESC').limit(limit);

      const activities = await query.getMany();

      return activities.map((activity) => ({
        id: activity.id,
        userId: activity.userId,
        organizationId: activity.organizationId,
        activityType: activity.activityType,
        entityType: activity.entityType,
        entityId: activity.entityId,
        details: activity.details,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
        user: activity.user
          ? {
              id: activity.user.id,
              name: activity.user.name,
              email: activity.user.email,
            }
          : null,
      }));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }

  async getActivityById(id: string): Promise<any> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return {
      id: activity.id,
      userId: activity.userId,
      organizationId: activity.organizationId,
      activityType: activity.activityType,
      entityType: activity.entityType,
      entityId: activity.entityId,
      details: activity.details,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      user: activity.user
        ? {
            id: activity.user.id,
            name: activity.user.name,
            email: activity.user.email,
          }
        : null,
    };
  }

  async createActivity(
    createDto: CreateCompanyActivityDto,
    userId: string,
    organizationId: string,
  ): Promise<any> {
    const activity = this.activityRepository.create({
      userId,
      organizationId,
      activityType: createDto.activityType,
      entityType: 'company',
      entityId: createDto.companyId,
      details: {
        outcome: createDto.outcome,
        content: createDto.content,
        contactPerson: createDto.contactPerson,
        ...createDto.details,
      },
      metadata: createDto.metadata || {},
      createdAt: new Date(),
    });

    const savedActivity = await this.activityRepository.save(activity);

    return {
      id: savedActivity.id,
      userId: savedActivity.userId,
      organizationId: savedActivity.organizationId,
      activityType: savedActivity.activityType,
      entityType: savedActivity.entityType,
      entityId: savedActivity.entityId,
      details: savedActivity.details,
      metadata: savedActivity.metadata,
      createdAt: savedActivity.createdAt,
    };
  }

  async updateActivity(
    id: string,
    updateDto: any,
    user: any,
  ): Promise<any> {
    const activity = await this.activityRepository.findOne({ where: { id } });
    
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    // Merge existing details with updates
    const updatedDetails = {
      ...activity.details,
      ...(updateDto.outcome && { outcome: updateDto.outcome }),
      ...(updateDto.content && { content: updateDto.content }),
      ...(updateDto.contactPerson && { contactPerson: updateDto.contactPerson }),
      ...(updateDto.details && updateDto.details),
    };

    Object.assign(activity, {
      ...(updateDto.activityType && { activityType: updateDto.activityType }),
      details: updatedDetails,
      ...(updateDto.metadata && { metadata: { ...activity.metadata, ...updateDto.metadata } }),
    });

    const savedActivity = await this.activityRepository.save(activity);

    return {
      id: savedActivity.id,
      userId: savedActivity.userId,
      organizationId: savedActivity.organizationId,
      activityType: savedActivity.activityType,
      entityType: savedActivity.entityType,
      entityId: savedActivity.entityId,
      details: savedActivity.details,
      metadata: savedActivity.metadata,
      createdAt: savedActivity.createdAt,
    };
  }

  async deleteActivity(id: string, user: any): Promise<{ message: string }> {
    const activity = await this.activityRepository.findOne({ where: { id } });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    await this.activityRepository.remove(activity);

    return { message: 'Activity deleted successfully' };
  }
}

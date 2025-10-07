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

    return { activity };
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

    return { savedActivity };
  }
}

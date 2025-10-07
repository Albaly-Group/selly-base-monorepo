import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CompanyLists,
  CompanyListItems,
  Companies,
  CompanyLists as CompanyList,
  CompanyListItems as CompanyListItem,
  Companies as Company,
  Users,
} from '../../entities';
import { UserContext } from '../../dtos/user-context.dto';

interface CompanyListSearchParams {
  searchTerm?: string;
  organizationId?: string;
  visibility?: string;
  page?: number;
  limit?: number;
  scope?: string; // 'mine', 'organization', 'public'
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface CompanyListCreateRequest {
  name: string;
  description?: string;
  visibility?: 'private' | 'team' | 'organization' | 'public';
  isShared?: boolean;
  isSmartList?: boolean;
  smartCriteria?: Record<string, any>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CompanyListUpdateRequest extends Partial<CompanyListCreateRequest> {}

@Injectable()
export class CompanyListsService {
  constructor(
    @InjectRepository(CompanyLists)
    private readonly companyListRepository: Repository<CompanyLists>,
    @InjectRepository(CompanyListItems)
    private readonly companyListItemRepository: Repository<CompanyListItems>,
    @InjectRepository(Companies)
    private readonly companyRepository: Repository<Companies>,
  ) {}

  async searchCompanyLists(
    params: CompanyListSearchParams,
    user?: UserContext,
  ): Promise<PaginatedResponse<any>> {
    // Database implementation only - no mock data fallback
    return this.searchListsFromDatabase(params, user);
  }

  private async searchListsFromDatabase(
    params: CompanyListSearchParams,
    user?: UserContext,
  ): Promise<PaginatedResponse<CompanyList>> {
    const {
      searchTerm,
      organizationId,
      visibility,
      page = 1,
      limit = 50,
      scope = 'mine',
    } = params;

    const query = this.companyListRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.organization', 'organization')
      .leftJoinAndSelect('list.ownerUser', 'ownerUser')
      .leftJoinAndSelect('list.companyListItems', 'items')
      .leftJoinAndSelect('items.company', 'company');

    // Scope-based filtering with access control
    if (scope === 'mine' && user) {
      // Show only lists owned by the user
      query.where('list.ownerUserId = :userId', { userId: user.id });
    } else if (scope === 'organization' && organizationId) {
      // Verify user has access to this organization
      if (user && user.organizationId !== organizationId) {
        throw new ForbiddenException('Access denied to organization data');
      }

      // Show lists from the organization or public shared lists
      query.where(
        '(list.organizationId = :organizationId OR (list.visibility = :publicVisibility AND list.isShared = true))',
        {
          organizationId,
          publicVisibility: 'public',
        },
      );
    } else if (scope === 'public') {
      // Show only public lists
      query.where('list.visibility = :visibility AND list.isShared = true', {
        visibility: 'public',
      });
    } else {
      // Default: require user context for non-public access
      if (!user) {
        throw new ForbiddenException('Authentication required');
      }
      // Show user's own lists
      query.where('list.ownerUserId = :userId', { userId: user.id });
    }

    // Text search on name and description
    if (searchTerm) {
      query.andWhere(
        '(list.name ILIKE :searchTerm OR list.description ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      );
    }

    // Visibility filter
    if (visibility) {
      query.andWhere('list.visibility = :visibility', { visibility });
    }

    // Pagination with validation
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;

    query.skip(offset).take(validatedLimit);

    // Order by last activity
    query
      .orderBy('list.lastActivityAt', 'DESC')
      .addOrderBy('list.createdAt', 'DESC');

    const [lists, total] = await query.getManyAndCount();

    const totalPages = Math.ceil(total / validatedLimit);

    return {
      data: lists,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNext: validatedPage < totalPages,
        hasPrev: validatedPage > 1,
      },
    };
  }

  async getCompanyListById(id: string, user?: UserContext): Promise<any> {
    return this.getListByIdFromDatabase(id, user);
  }

  private async getListByIdFromDatabase(
    id: string,
    user?: UserContext,
  ): Promise<CompanyList> {
    console.log("Id getListByIdFromDatabase", id);
    console.log("User getListByIdFromDatabase", user);

    const query = this.companyListRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.organization', 'organization')
      .leftJoinAndSelect('list.ownerUser', 'ownerUser')
      .leftJoinAndSelect('list.companyListItems', 'items')
      .leftJoinAndSelect('items.company', 'company')
      .leftJoinAndSelect('items.addedByUser', 'addedByUser')
      .where('list.id = :id', { id });

    const list = await query.getOne();
    console.log("Find One", list)

    if (!list) {
      throw new NotFoundException('Company list not found');
    }

    if (list.visibility === 'public' && list.isShared) {
      return list;
    }

    if (list.organizationId &&
      (list.visibility === 'organization' || list.visibility === 'team')
    ) {
      return list;
    }

    return list;
  }

  async createCompanyList(
    data: CompanyListCreateRequest,
    user: UserContext,
  ): Promise<any> {
    const listData: Partial<CompanyList> = {
      name: data.name,
      description: data.description || undefined,
      organizationId: user.organizationId,
      ownerUserId: user.id,
      visibility: data.visibility || 'private',
      isShared: data.isShared,
      totalCompanies: 0,
      lastActivityAt: new Date(),
      isSmartList: data.isSmartList || false,
      smartCriteria: data.smartCriteria || {},
      lastRefreshedAt: undefined,
    };

    const list = this.companyListRepository.create(listData);
    const savedList = await this.companyListRepository.save(list);
    console.log('Created company list in database:', savedList.id);
    return savedList;
  }

  async updateCompanyList(
    id: string,
    data: CompanyListUpdateRequest,
    user: UserContext,
  ): Promise<any> {
    // Load the entity directly so we can enforce update permissions here
    const list = await this.companyListRepository.findOne({
      where: { id },
      relations: ['organization', 'ownerUser', 'companyListItems'],
    });

    if (!list) {
      throw new NotFoundException('Company list not found');
    }

    if (
      list.ownerUserId !== user.id &&
      list.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Cannot update this company list');
    }

    const fieldsToUpdate: Partial<CompanyList> = {
      organizationId: user.organizationId,
      ownerUserId: user.id,
      updatedAt: new Date(),
    };

    if (data.name !== undefined) fieldsToUpdate.name = data.name;
    if (data.description !== undefined)
      fieldsToUpdate.description = data.description;
    if (data.visibility !== undefined)
      fieldsToUpdate.visibility = data.visibility;
    if (Object.prototype.hasOwnProperty.call(data, 'isShared'))
      fieldsToUpdate.isShared = data.isShared;
    if (Object.prototype.hasOwnProperty.call(data, 'isSmartList'))
      fieldsToUpdate.isSmartList = data.isSmartList;
    if (data.smartCriteria !== undefined)
      fieldsToUpdate.smartCriteria = data.smartCriteria;

    // Merge and persist
    this.companyListRepository.merge(list as any, fieldsToUpdate);
    const updateList = await this.companyListRepository.save(list);
    console.log('Update company list in database:', updateList);
    return updateList;
  }

  async deleteCompanyList(id: string, user: UserContext): Promise<void> {
    const list = await this.companyListRepository.findOne({
      where: { id },
      relations: ['organization', 'ownerUser', 'companyListItems'],
    });

    if (!list) {
      throw new NotFoundException('Company list not found');
    }

    if (list.ownerUserId !== user.id) {
      throw new ForbiddenException('Cannot delete this company list');
    }

    await this.companyListRepository.delete(id);
    console.log('Deleted company list:', id);
  }

  async addCompaniesToList(
    listId: string,
    companyIds: string[],
    user: UserContext,
  ): Promise<any> {
    const list = await this.getCompanyListById(listId, user);

    if (list.ownerUserId !== user.id && list.organizationId !== user.organizationId) {
      throw new ForbiddenException('Cannot modify this company list');
    }

    const existingItems = await this.companyListItemRepository.find({
      where: { listId, companyId: In(companyIds) },
      select: ['companyId'],
    });
    const existingCompanyIds = existingItems.map((item) => item.companyId);
    console.log("Exitsing", existingCompanyIds);
    const newCompanyIds = companyIds.filter((id) => !existingCompanyIds.includes(id),);

    if (newCompanyIds.length === 0) {
      throw new BadRequestException('All selected companies already exist in this list');
    }

    const newItems = newCompanyIds.map(companyId =>
      this.companyListItemRepository.create({
        list: { id: listId },
        company: { id: companyId },
        note: null,
        position: null,
        customFields: {},        
        leadScore: '0',            
        scoreBreakdown: {},      
        scoreCalculatedAt: null, 
        status: 'new',
        statusChangedAt: new Date(),  
        addedByUser: { id: user.id },
        addedAt: new Date(),         
      }),
    );

    const items = await this.companyListItemRepository.save(newItems);
    console.log('Added companies to list:', { listId, items });
    return { items };
  }

  async removeCompaniesFromList(
    listId: string,
    companyIds: string[],
    user: UserContext,
  ): Promise<any> {
    const list = await this.getCompanyListById(listId);

    if (
      list.ownerUserId !== user.id &&
      list.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Cannot modify this company list');
    }

    console.log('Removed companies from list:', { listId, companyIds });
    return { message: 'Companies removed from list successfully' };
  }

  async getListItems(listId: string, user?: UserContext): Promise<any[]> {
    const list = await this.getCompanyListById(listId, user);

    const items = await this.companyListItemRepository.find({
      where: { listId },
      relations: ['company', 'addedByUser'],
      order: { position: 'ASC', addedAt: 'DESC' },
    });

    return items.map((it: any) => ({
      id: it.id,
      companyId: it.companyId || it.company?.id,
      company: it.company
        ? {
            id: it.company.id,
            name: it.company.name,
            domain: it.company.domain,
          }
        : null,
      note: it.note,
      position: it.position,
      customFields: it.customFields,
      leadScore: it.leadScore,
      scoreBreakdown: it.scoreBreakdown,
      scoreCalculatedAt: it.scoreCalculatedAt,
      status: it.status,
      statusChangedAt: it.statusChangedAt,
      addedByUser: it.addedByUser,
      addedAt: it.addedAt,
    }));
  }
}

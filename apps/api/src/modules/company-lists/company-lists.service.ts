import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyList, CompanyListItem, Company, User } from '../../entities';

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
  isSmartList?: boolean;
  smartCriteria?: Record<string, any>;
}

interface CompanyListUpdateRequest extends Partial<CompanyListCreateRequest> {}

// Mock data for demonstration
const MOCK_COMPANY_LISTS = [
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    name: 'Technology Companies',
    description: 'List of technology companies in Thailand',
    organizationId: '123e4567-e89b-12d3-a456-426614174001',
    ownerUserId: '123e4567-e89b-12d3-a456-426614174000',
    visibility: 'private',
    isShared: false,
    totalCompanies: 2,
    lastActivityAt: new Date(),
    isSmartList: false,
    smartCriteria: {},
    lastRefreshedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    items: [],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    name: 'Sample Prospects',
    description: 'Public list of sample companies for demonstration',
    organizationId: null,
    ownerUserId: '123e4567-e89b-12d3-a456-426614174000',
    visibility: 'public',
    isShared: true,
    totalCompanies: 1,
    lastActivityAt: new Date(),
    isSmartList: false,
    smartCriteria: {},
    lastRefreshedAt: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    items: [],
  },
];

@Injectable()
export class CompanyListsService {
  constructor(
    @Optional()
    @InjectRepository(CompanyList)
    private companyListRepository?: Repository<CompanyList>,
    @Optional()
    @InjectRepository(CompanyListItem)
    private companyListItemRepository?: Repository<CompanyListItem>,
    @Optional()
    @InjectRepository(Company)
    private companyRepository?: Repository<Company>,
  ) {}

  async searchCompanyLists(
    params: CompanyListSearchParams,
    user?: User,
  ): Promise<PaginatedResponse<any>> {
    if (this.companyListRepository) {
      return this.searchListsFromDatabase(params, user);
    }
    return this.searchListsFromMockData(params, user);
  }

  private async searchListsFromMockData(
    params: CompanyListSearchParams,
    user?: User,
  ): Promise<PaginatedResponse<any>> {
    const {
      searchTerm,
      organizationId,
      visibility,
      page = 1,
      limit = 50,
      scope = 'mine',
    } = params;

    let lists = [...MOCK_COMPANY_LISTS];

    // Scope filtering
    if (scope === 'mine' && user) {
      lists = lists.filter((list) => list.ownerUserId === user.id);
    } else if (scope === 'organization' && organizationId) {
      lists = lists.filter(
        (list) =>
          list.organizationId === organizationId ||
          (list.visibility === 'public' && list.isShared),
      );
    } else if (scope === 'public') {
      lists = lists.filter((list) => list.visibility === 'public');
    }

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      lists = lists.filter(
        (list) =>
          list.name.toLowerCase().includes(term) ||
          list.description?.toLowerCase().includes(term),
      );
    }

    // Visibility filter
    if (visibility) {
      lists = lists.filter((list) => list.visibility === visibility);
    }

    // Pagination
    const total = lists.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedLists = lists.slice(offset, offset + limit);

    return {
      data: paginatedLists,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  private async searchListsFromDatabase(
    params: CompanyListSearchParams,
    user?: User,
  ): Promise<PaginatedResponse<CompanyList>> {
    const {
      searchTerm,
      organizationId,
      visibility,
      page = 1,
      limit = 50,
      scope = 'mine',
    } = params;

    const query = this.companyListRepository!.createQueryBuilder('list')
      .leftJoinAndSelect('list.organization', 'organization')
      .leftJoinAndSelect('list.ownerUser', 'ownerUser')
      .leftJoinAndSelect('list.items', 'items')
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

  async getCompanyListById(id: string, user?: User): Promise<any> {
    if (this.companyListRepository) {
      return this.getListByIdFromDatabase(id, user);
    }
    return this.getListByIdFromMockData(id, user);
  }

  private async getListByIdFromMockData(id: string, user?: User): Promise<any> {
    const list = MOCK_COMPANY_LISTS.find((l) => l.id === id);

    if (!list) {
      throw new NotFoundException('Company list not found');
    }

    // Access control
    if (list.visibility === 'private' && user && list.ownerUserId !== user.id) {
      if (list.organizationId !== user.organizationId) {
        throw new NotFoundException('Company list not found');
      }
    }

    return list;
  }

  private async getListByIdFromDatabase(
    id: string,
    user?: User,
  ): Promise<CompanyList> {
    const query = this.companyListRepository!.createQueryBuilder('list')
      .leftJoinAndSelect('list.organization', 'organization')
      .leftJoinAndSelect('list.ownerUser', 'ownerUser')
      .leftJoinAndSelect('list.items', 'items')
      .leftJoinAndSelect('items.company', 'company')
      .leftJoinAndSelect('items.addedByUser', 'addedByUser')
      .where('list.id = :id', { id });

    const list = await query.getOne();

    if (!list) {
      throw new NotFoundException('Company list not found');
    }

    // Access control logic
    // Public lists are accessible to everyone
    if (list.visibility === 'public' && list.isShared) {
      return list;
    }

    // For non-public lists, user authentication is required
    if (!user) {
      throw new NotFoundException('Company list not found');
    }

    // Owner has access
    if (list.ownerUserId === user.id) {
      return list;
    }

    // Organization members can access organization/team lists
    if (
      list.organizationId === user.organizationId &&
      (list.visibility === 'organization' || list.visibility === 'team')
    ) {
      return list;
    }

    // Private lists are only accessible to owner
    // If none of the above conditions match, deny access
    throw new NotFoundException('Company list not found');
  }

  async createCompanyList(
    data: CompanyListCreateRequest,
    user: User,
  ): Promise<any> {
    const list = {
      id: `list-${Date.now()}`,
      name: data.name,
      description: data.description,
      organizationId: user.organizationId,
      ownerUserId: user.id,
      visibility: data.visibility || 'private',
      isShared: data.visibility === 'public',
      totalCompanies: 0,
      lastActivityAt: new Date(),
      isSmartList: data.isSmartList || false,
      smartCriteria: data.smartCriteria || {},
      lastRefreshedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };

    console.log('Created company list:', list);
    return list;
  }

  async updateCompanyList(
    id: string,
    data: CompanyListUpdateRequest,
    user: User,
  ): Promise<any> {
    const list = await this.getCompanyListById(id, user);

    // Only allow updates by owner or organization admin
    if (
      list.ownerUserId !== user.id &&
      list.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Cannot update this company list');
    }

    const updatedList = {
      ...list,
      name: data.name || list.name,
      description:
        data.description !== undefined ? data.description : list.description,
      visibility: data.visibility || list.visibility,
      isShared: data.visibility === 'public',
      isSmartList:
        data.isSmartList !== undefined ? data.isSmartList : list.isSmartList,
      smartCriteria: data.smartCriteria || list.smartCriteria,
      updatedAt: new Date(),
    };

    console.log('Updated company list:', updatedList);
    return updatedList;
  }

  async deleteCompanyList(id: string, user: User): Promise<void> {
    const list = await this.getCompanyListById(id, user);

    // Only allow deletion by owner
    if (list.ownerUserId !== user.id) {
      throw new ForbiddenException('Cannot delete this company list');
    }

    console.log('Deleted company list:', id);
  }

  async addCompaniesToList(
    listId: string,
    companyIds: string[],
    user: User,
  ): Promise<any> {
    const list = await this.getCompanyListById(listId, user);

    // Check if user can modify this list
    if (
      list.ownerUserId !== user.id &&
      list.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Cannot modify this company list');
    }

    const items = companyIds.map((companyId) => ({
      id: `item-${Date.now()}-${companyId}`,
      listId,
      companyId,
      note: null,
      position: null,
      customFields: {},
      leadScore: 0.0,
      scoreBreakdown: {},
      scoreCalculatedAt: null,
      status: 'new',
      statusChangedAt: new Date(),
      addedByUserId: user.id,
      addedAt: new Date(),
    }));

    console.log('Added companies to list:', { listId, items });
    return { message: 'Companies added to list successfully', items };
  }

  async removeCompaniesFromList(
    listId: string,
    companyIds: string[],
    user: User,
  ): Promise<any> {
    const list = await this.getCompanyListById(listId, user);

    // Check if user can modify this list
    if (
      list.ownerUserId !== user.id &&
      list.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Cannot modify this company list');
    }

    console.log('Removed companies from list:', { listId, companyIds });
    return { message: 'Companies removed from list successfully' };
  }

  async getListItems(listId: string, user?: User): Promise<any[]> {
    const list = await this.getCompanyListById(listId, user);

    // Return mock items for demonstration
    return [
      {
        id: `item-${listId}-1`,
        listId,
        companyId: '123e4567-e89b-12d3-a456-426614174002',
        note: 'Promising tech company',
        position: 1,
        customFields: {},
        leadScore: 85.5,
        scoreBreakdown: {
          size: 25,
          industry: 30,
          location: 15,
          engagement: 15.5,
        },
        scoreCalculatedAt: new Date(),
        status: 'qualified',
        statusChangedAt: new Date(),
        addedByUserId: user?.id,
        addedAt: new Date('2024-01-01'),
        company: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          nameEn: 'Sample Tech Corp',
          displayName: 'Sample Tech Corp',
          businessDescription: 'Sample technology company for demonstration',
        },
      },
    ];
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefIndustryCodes, RefRegions, RefTags } from '../../entities';
import {
  CreateIndustryCodeDto,
  UpdateIndustryCodeDto,
  CreateRegionDto,
  UpdateRegionDto,
  CreateTagDto,
  UpdateTagDto,
} from '../../dtos';

@Injectable()
export class ReferenceDataService {
  constructor(
    @InjectRepository(RefIndustryCodes)
    private readonly industryRepository: Repository<RefIndustryCodes>,
    @InjectRepository(RefRegions)
    private readonly regionRepository: Repository<RefRegions>,
    @InjectRepository(RefTags)
    private readonly tagRepository: Repository<RefTags>,
  ) {}

  async getIndustries(activeOnly = true): Promise<any[]> {
    try {
      const query = this.industryRepository.createQueryBuilder('industry');

      if (activeOnly) {
        query.where('industry.isActive = :isActive', { isActive: true });
      }

      query.orderBy('industry.titleEn', 'ASC');

      const industries = await query.getMany();

      // If no industries found, return hardcoded fallback data
      if (!industries || industries.length === 0) {
        return this.getFallbackIndustries();
      }

      return industries.map((industry) => ({
        id: industry.id,
        code: industry.code,
        name: industry.titleEn,
        nameEn: industry.titleEn,
        nameTh: industry.titleTh,
        description: industry.description,
        classificationSystem: industry.classificationSystem,
        level: industry.level,
      }));
    } catch (error) {
      console.error('Failed to fetch industries from database:', error);
      return this.getFallbackIndustries();
    }
  }

  async getUsedIndustries(activeOnly = true): Promise<any[]> {
    try {
      const query = this.industryRepository.createQueryBuilder('industry');

      if (activeOnly) {
        query.where('industry.isActive = :isActive', { isActive: true });
      }

      // Inner join companies to ensure we only return industries that have at least one company
      // companies table has primary_industry_id referencing ref_industry_codes.id
      query
        .innerJoin('companies', 'company', 'company.primary_industry_id = industry.id')
        .select([
          'industry.id as id',
          'industry.code as code',
          'industry.title_en as name',
          'industry.title_en as nameEn',
          'industry.title_th as nameTh',
          'industry.description as description',
          'industry.classification_system as classificationSystem',
          'industry.level as level',
        ])
        .groupBy('industry.id')
        .addGroupBy('industry.code')
        .addGroupBy('industry.title_en')
        .addGroupBy('industry.title_th')
        .addGroupBy('industry.description')
        .addGroupBy('industry.classification_system')
        .addGroupBy('industry.level')
        .orderBy('industry.title_en', 'ASC');

      const rows = await query.getRawMany();

      if (!rows || rows.length === 0) {
        return this.getFallbackIndustries();
      }

      return rows.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        nameEn: r.nameen || r.nameEn || r.name,
        nameTh: r.nameth || r.nameTh || r.nameTh,
        description: r.description,
        classificationSystem: r.classificationsystem || r.classificationSystem,
        level: r.level,
      }));
    } catch (error) {
      console.error('Failed to fetch used industries from database:', error);
      return this.getFallbackIndustries();
    }
  }

  async getProvinces(activeOnly = true, countryCode = 'TH'): Promise<any[]> {
    try {
      const query = this.regionRepository.createQueryBuilder('region');

      query.where('region.countryCode = :countryCode', { countryCode });

      if (activeOnly) {
        query.andWhere('region.isActive = :isActive', { isActive: true });
      }

      // Filter for province-level regions
      query.andWhere("region.regionType = 'province'");

      query.orderBy('region.nameEn', 'ASC');

      const regions = await query.getMany();

      // If no provinces found, return hardcoded fallback data
      if (!regions || regions.length === 0) {
        return this.getFallbackProvinces();
      }

      return regions.map((region) => ({
        id: region.id,
        code: region.code,
        name: region.nameEn,
        nameEn: region.nameEn,
        nameTh: region.nameTh,
        regionType: region.regionType,
        countryCode: region.countryCode,
      }));
    } catch (error) {
      console.error('Failed to fetch provinces from database:', error);
      return this.getFallbackProvinces();
    }
  }

  async getUsedProvinces(activeOnly = true, countryCode = 'TH'): Promise<any[]> {
    try {
      const query = this.regionRepository.createQueryBuilder('region');

      if (activeOnly) {
        query.where('region.isActive = :isActive', { isActive: true });
      }

      if (countryCode) {
        query.andWhere('region.countryCode = :countryCode', { countryCode });
      }

      // Inner join companies to ensure we only return regions (provinces) that have at least one company
      query
        .innerJoin('companies', 'company', 'company.primary_region_id = region.id')
        .select([
          'region.id as id',
          'region.code as code',
          'region.name_en as name',
          'region.name_en as nameEn',
          'region.name_th as nameTh',
          'region.region_type as regionType',
          'region.country_code as countryCode',
        ])
        .groupBy('region.id')
        .addGroupBy('region.code')
        .addGroupBy('region.name_en')
        .addGroupBy('region.name_th')
        .addGroupBy('region.region_type')
        .addGroupBy('region.country_code')
        .orderBy('region.name_en', 'ASC');

      const rows = await query.getRawMany();

      if (!rows || rows.length === 0) {
        return this.getFallbackProvinces();
      }

      return rows.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        nameEn: r.nameen || r.nameEn || r.name,
        nameTh: r.nameth || r.nameTh || r.nameTh,
        regionType: r.regiontype || r.regionType,
        countryCode: r.countrycode || r.countryCode,
      }));
    } catch (error) {
      console.error('Failed to fetch used provinces from database:', error);
      return this.getFallbackProvinces();
    }
  }

  async getCompanySizes(): Promise<any[]> {
    // Company sizes must match database check constraint and backend DTO enum
    // Database constraint: company_size IN ('micro', 'small', 'medium', 'large', 'enterprise')
    return [
      {
        value: 'small',
        label: 'Small (1-50 employees)',
        code: 'S',
        displayName: 'Small (S)',
      },
      {
        value: 'medium',
        label: 'Medium (51-250 employees)',
        code: 'M',
        displayName: 'Medium (M)',
      },
      {
        value: 'large',
        label: 'Large (251+ employees)',
        code: 'L',
        displayName: 'Large (L)',
      },
    ];
  }

  async getContactStatuses(): Promise<any[]> {
    // Contact statuses are standard categories, not stored in database yet
    return [
      { value: 'verified', label: 'Verified', color: 'green' },
      { value: 'need_verified', label: 'Need Verified', color: 'yellow' },
      { value: 'unverified', label: 'Unverified', color: 'red' },
    ];
  }

  private getFallbackIndustries(): any[] {
    return [
      { code: 'MFG', name: 'Manufacturing', nameEn: 'Manufacturing' },
      { code: 'LOG', name: 'Logistics', nameEn: 'Logistics' },
      { code: 'AUTO', name: 'Automotive', nameEn: 'Automotive' },
      { code: 'TOUR', name: 'Tourism', nameEn: 'Tourism' },
      { code: 'AGRI', name: 'Agriculture', nameEn: 'Agriculture' },
      { code: 'TECH', name: 'Technology', nameEn: 'Technology' },
      { code: 'HEALTH', name: 'Healthcare', nameEn: 'Healthcare' },
      { code: 'RETAIL', name: 'Retail', nameEn: 'Retail' },
      { code: 'FIN', name: 'Finance', nameEn: 'Finance' },
      { code: 'EDU', name: 'Education', nameEn: 'Education' },
    ];
  }

  private getFallbackProvinces(): any[] {
    return [
      {
        code: 'BKK',
        name: 'Bangkok',
        nameEn: 'Bangkok',
        nameTh: 'กรุงเทพมหานคร',
      },
      {
        code: 'CNX',
        name: 'Chiang Mai',
        nameEn: 'Chiang Mai',
        nameTh: 'เชียงใหม่',
      },
      { code: 'PKT', name: 'Phuket', nameEn: 'Phuket', nameTh: 'ภูเก็ต' },
      {
        code: 'KKC',
        name: 'Khon Kaen',
        nameEn: 'Khon Kaen',
        nameTh: 'ขอนแก่น',
      },
      { code: 'CBI', name: 'Chonburi', nameEn: 'Chonburi', nameTh: 'ชลบุรี' },
      { code: 'RYG', name: 'Rayong', nameEn: 'Rayong', nameTh: 'ระยอง' },
      {
        code: 'SPK',
        name: 'Samut Prakan',
        nameEn: 'Samut Prakan',
        nameTh: 'สมุทรปราการ',
      },
      {
        code: 'SKA',
        name: 'Samut Sakhon',
        nameEn: 'Samut Sakhon',
        nameTh: 'สมุทรสาคร',
      },
    ];
  }

  // ========================================
  // Industry Codes CRUD Operations
  // ========================================

  async createIndustryCode(
    createDto: CreateIndustryCodeDto,
  ): Promise<RefIndustryCodes> {
    // Validate parent exists if provided
    let parent: RefIndustryCodes | undefined;
    if (createDto.parentId) {
      const foundParent = await this.industryRepository.findOne({
        where: { id: createDto.parentId },
      });
      if (!foundParent) {
        throw new NotFoundException(
          `Parent industry code with ID ${createDto.parentId} not found`,
        );
      }
      parent = foundParent;
    }

    const industryCode = this.industryRepository.create({
      code: createDto.code,
      titleEn: createDto.titleEn,
      titleTh: createDto.titleTh,
      description: createDto.description,
      classificationSystem: createDto.classificationSystem,
      level: createDto.level,
      parent,
      isActive: createDto.isActive ?? true,
      effectiveDate: createDto.effectiveDate,
      endDate: createDto.endDate,
    });

    return await this.industryRepository.save(industryCode);
  }

  async getIndustryCodeById(id: string): Promise<RefIndustryCodes> {
    const industryCode = await this.industryRepository.findOne({
      where: { id },
      relations: ['parent', 'refIndustryCodes'],
    });

    if (!industryCode) {
      throw new NotFoundException(`Industry code with ID ${id} not found`);
    }

    return industryCode;
  }

  async getIndustryCodesHierarchical(
    activeOnly = true,
  ): Promise<RefIndustryCodes[]> {
    const query = this.industryRepository.createQueryBuilder('industry');

    if (activeOnly) {
      query.where('industry.isActive = :isActive', { isActive: true });
    }

    query
      .leftJoinAndSelect('industry.parent', 'parent')
      .leftJoinAndSelect('industry.refIndustryCodes', 'children')
      .orderBy('industry.level', 'ASC')
      .addOrderBy('industry.titleEn', 'ASC');

    return await query.getMany();
  }

  async updateIndustryCode(
    id: string,
    updateDto: UpdateIndustryCodeDto,
  ): Promise<RefIndustryCodes> {
    const industryCode = await this.getIndustryCodeById(id);

    // Validate parent exists if provided
    if (updateDto.parentId) {
      if (updateDto.parentId === id) {
        throw new BadRequestException('Cannot set parent to itself');
      }
      const parent = await this.industryRepository.findOne({
        where: { id: updateDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent industry code with ID ${updateDto.parentId} not found`,
        );
      }
      industryCode.parent = parent;
    }

    // Update fields
    if (updateDto.code !== undefined) industryCode.code = updateDto.code;
    if (updateDto.titleEn !== undefined)
      industryCode.titleEn = updateDto.titleEn;
    if (updateDto.titleTh !== undefined)
      industryCode.titleTh = updateDto.titleTh;
    if (updateDto.description !== undefined)
      industryCode.description = updateDto.description;
    if (updateDto.classificationSystem !== undefined)
      industryCode.classificationSystem = updateDto.classificationSystem;
    if (updateDto.level !== undefined) industryCode.level = updateDto.level;
    if (updateDto.isActive !== undefined)
      industryCode.isActive = updateDto.isActive;
    if (updateDto.effectiveDate !== undefined)
      industryCode.effectiveDate = updateDto.effectiveDate;
    if (updateDto.endDate !== undefined)
      industryCode.endDate = updateDto.endDate;

    return await this.industryRepository.save(industryCode);
  }

  async deleteIndustryCode(id: string): Promise<void> {
    const industryCode = await this.getIndustryCodeById(id);

    // Check if it has children
    const childrenCount = await this.industryRepository.count({
      where: { parent: { id } },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete industry code with children. Delete or reassign children first.',
      );
    }

    await this.industryRepository.remove(industryCode);
  }

  // ========================================
  // Regions CRUD Operations
  // ========================================

  async createRegion(createDto: CreateRegionDto): Promise<RefRegions> {
    // Validate parent exists if provided
    let parentRegion: RefRegions | undefined;
    if (createDto.parentRegionId) {
      const foundParent = await this.regionRepository.findOne({
        where: { id: createDto.parentRegionId },
      });
      if (!foundParent) {
        throw new NotFoundException(
          `Parent region with ID ${createDto.parentRegionId} not found`,
        );
      }
      parentRegion = foundParent;
    }

    const region = this.regionRepository.create({
      code: createDto.code,
      nameEn: createDto.nameEn,
      nameTh: createDto.nameTh,
      regionType: createDto.regionType,
      countryCode: createDto.countryCode,
      parentRegion,
      isActive: createDto.isActive ?? true,
    });

    return await this.regionRepository.save(region);
  }

  async getRegionById(id: string): Promise<RefRegions> {
    const region = await this.regionRepository.findOne({
      where: { id },
      relations: ['parentRegion', 'refRegions'],
    });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return region;
  }

  async getRegionsHierarchical(
    activeOnly = true,
    countryCode?: string,
  ): Promise<RefRegions[]> {
    const query = this.regionRepository.createQueryBuilder('region');

    if (activeOnly) {
      query.where('region.isActive = :isActive', { isActive: true });
    }

    if (countryCode) {
      query.andWhere('region.countryCode = :countryCode', { countryCode });
    }

    query
      .leftJoinAndSelect('region.parentRegion', 'parent')
      .leftJoinAndSelect('region.refRegions', 'children')
      .orderBy('region.regionType', 'ASC')
      .addOrderBy('region.nameEn', 'ASC');

    return await query.getMany();
  }

  async updateRegion(
    id: string,
    updateDto: UpdateRegionDto,
  ): Promise<RefRegions> {
    const region = await this.getRegionById(id);

    // Validate parent exists if provided
    if (updateDto.parentRegionId) {
      if (updateDto.parentRegionId === id) {
        throw new BadRequestException('Cannot set parent to itself');
      }
      const parent = await this.regionRepository.findOne({
        where: { id: updateDto.parentRegionId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent region with ID ${updateDto.parentRegionId} not found`,
        );
      }
      region.parentRegion = parent;
    }

    // Update fields
    if (updateDto.code !== undefined) region.code = updateDto.code;
    if (updateDto.nameEn !== undefined) region.nameEn = updateDto.nameEn;
    if (updateDto.nameTh !== undefined) region.nameTh = updateDto.nameTh;
    if (updateDto.regionType !== undefined)
      region.regionType = updateDto.regionType;
    if (updateDto.countryCode !== undefined)
      region.countryCode = updateDto.countryCode;
    if (updateDto.isActive !== undefined) region.isActive = updateDto.isActive;

    return await this.regionRepository.save(region);
  }

  async deleteRegion(id: string): Promise<void> {
    const region = await this.getRegionById(id);

    // Check if it has children
    const childrenCount = await this.regionRepository.count({
      where: { parentRegion: { id } },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete region with children. Delete or reassign children first.',
      );
    }

    await this.regionRepository.remove(region);
  }

  // ========================================
  // Tags CRUD Operations
  // ========================================

  async createTag(createDto: CreateTagDto): Promise<RefTags> {
    // Validate parent exists if provided
    let parentTag: RefTags | undefined;
    if (createDto.parentTagId) {
      const foundParent = await this.tagRepository.findOne({
        where: { id: createDto.parentTagId },
      });
      if (!foundParent) {
        throw new NotFoundException(
          `Parent tag with ID ${createDto.parentTagId} not found`,
        );
      }
      parentTag = foundParent;
    }

    const tag = this.tagRepository.create({
      key: createDto.key,
      name: createDto.name,
      description: createDto.description,
      color: createDto.color,
      icon: createDto.icon,
      category: createDto.category,
      parentTag,
      isSystemTag: createDto.isSystemTag ?? false,
      isActive: createDto.isActive ?? true,
    });

    return await this.tagRepository.save(tag);
  }

  async getTagById(id: string): Promise<RefTags> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['parentTag', 'refTags'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async getTagsHierarchical(activeOnly = true): Promise<RefTags[]> {
    const query = this.tagRepository.createQueryBuilder('tag');

    if (activeOnly) {
      query.where('tag.isActive = :isActive', { isActive: true });
    }

    query
      .leftJoinAndSelect('tag.parentTag', 'parent')
      .leftJoinAndSelect('tag.refTags', 'children')
      .orderBy('tag.category', 'ASC')
      .addOrderBy('tag.name', 'ASC');

    return await query.getMany();
  }

  async updateTag(id: string, updateDto: UpdateTagDto): Promise<RefTags> {
    const tag = await this.getTagById(id);

    // Validate parent exists if provided
    if (updateDto.parentTagId) {
      if (updateDto.parentTagId === id) {
        throw new BadRequestException('Cannot set parent to itself');
      }
      const parent = await this.tagRepository.findOne({
        where: { id: updateDto.parentTagId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent tag with ID ${updateDto.parentTagId} not found`,
        );
      }
      tag.parentTag = parent;
    }

    // Update fields
    if (updateDto.key !== undefined) tag.key = updateDto.key;
    if (updateDto.name !== undefined) tag.name = updateDto.name;
    if (updateDto.description !== undefined)
      tag.description = updateDto.description;
    if (updateDto.color !== undefined) tag.color = updateDto.color;
    if (updateDto.icon !== undefined) tag.icon = updateDto.icon;
    if (updateDto.category !== undefined) tag.category = updateDto.category;
    if (updateDto.isSystemTag !== undefined)
      tag.isSystemTag = updateDto.isSystemTag;
    if (updateDto.isActive !== undefined) tag.isActive = updateDto.isActive;

    return await this.tagRepository.save(tag);
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await this.getTagById(id);

    // Check if it's a system tag
    if (tag.isSystemTag) {
      throw new BadRequestException('Cannot delete system tags');
    }

    // Check if it has children
    const childrenCount = await this.tagRepository.count({
      where: { parentTag: { id } },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete tag with children. Delete or reassign children first.',
      );
    }

    await this.tagRepository.remove(tag);
  }

  async getTags(activeOnly = true): Promise<any[]> {
    try {
      const query = this.tagRepository.createQueryBuilder('tag');

      if (activeOnly) {
        query.where('tag.isActive = :isActive', { isActive: true });
      }

      query.orderBy('tag.name', 'ASC');

      const tags = await query.getMany();

      return tags.map((tag) => ({
        id: tag.id,
        key: tag.key,
        name: tag.name,
        description: tag.description,
        color: tag.color,
        icon: tag.icon,
        category: tag.category,
        isSystemTag: tag.isSystemTag,
        isActive: tag.isActive,
      }));
    } catch (error) {
      console.error('Failed to fetch tags from database:', error);
      return [];
    }
  }
}

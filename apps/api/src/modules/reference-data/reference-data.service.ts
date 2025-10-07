import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefIndustryCodes, RefRegions } from '../../entities';

@Injectable()
export class ReferenceDataService {
  constructor(
    @InjectRepository(RefIndustryCodes)
    private readonly industryRepository: Repository<RefIndustryCodes>,
    @InjectRepository(RefRegions)
    private readonly regionRepository: Repository<RefRegions>,
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
      { value: 'active', label: 'Active', color: 'green' },
      {
        value: 'needs_verification',
        label: 'Needs Verification',
        color: 'yellow',
      },
      { value: 'invalid', label: 'Invalid', color: 'red' },
      { value: 'opted_out', label: 'Opted Out', color: 'gray' },
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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyRegistrations } from '../../entities/CompanyRegistrations';
import { Companies } from '../../entities/Companies';
import {
  CreateCompanyRegistrationDto,
  UpdateCompanyRegistrationDto,
} from '../../dtos/company-registration.dto';

@Injectable()
export class CompanyRegistrationsService {
  constructor(
    @InjectRepository(CompanyRegistrations)
    private registrationsRepository: Repository<CompanyRegistrations>,
    @InjectRepository(Companies)
    private companiesRepository: Repository<Companies>,
  ) {}

  async create(
    createDto: CreateCompanyRegistrationDto,
  ): Promise<CompanyRegistrations> {
    // Verify company exists
    const company = await this.companiesRepository.findOne({
      where: { id: createDto.companyId },
    });

    if (!company) {
      throw new NotFoundException(
        `Company with ID ${createDto.companyId} not found`,
      );
    }

    // If this is marked as primary, unset other primary registrations for this company
    if (createDto.isPrimary) {
      await this.registrationsRepository
        .createQueryBuilder()
        .update(CompanyRegistrations)
        .set({ isPrimary: false })
        .where('company_id = :companyId AND is_primary = true', {
          companyId: createDto.companyId,
        })
        .execute();
    }

    // Create registration with foreign keys to authorities and types
    const registration = this.registrationsRepository.create({
      registrationNo: createDto.registrationNo,
      authorityId: createDto.authorityId,
      registrationTypeId: createDto.registrationTypeId,
      countryCode: createDto.countryCode || 'TH',
      status: createDto.status || 'active',
      registeredDate: createDto.registeredDate || null,
      dissolvedDate: createDto.dissolvedDate || null,
      isPrimary: createDto.isPrimary || false,
      rawData: {
        remarks: createDto.remarks || '',
      },
      company: company,
    });

    return await this.registrationsRepository.save(registration);
  }

  async findByCompany(companyId: string): Promise<CompanyRegistrations[]> {
    return await this.registrationsRepository.find({
      where: { company: { id: companyId } },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CompanyRegistrations> {
    const registration = await this.registrationsRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!registration) {
      throw new NotFoundException(
        `Company registration with ID ${id} not found`,
      );
    }

    return registration;
  }

  async update(
    id: string,
    updateDto: UpdateCompanyRegistrationDto,
  ): Promise<CompanyRegistrations> {
    const registration = await this.findOne(id);

    // If setting as primary, unset other primary registrations for this company
    if (updateDto.isPrimary) {
      // Unset other primary registrations for this company, exclude current id
      await this.registrationsRepository
        .createQueryBuilder()
        .update(CompanyRegistrations)
        .set({ isPrimary: false })
        .where('company_id = :companyId AND is_primary = true AND id != :id', {
          companyId: registration.company.id,
          id,
        })
        .execute();
    }

    // Update fields
    if (updateDto.registrationNo !== undefined)
      registration.registrationNo = updateDto.registrationNo;
    if (updateDto.registrationTypeId !== undefined)
      registration.registrationTypeId = updateDto.registrationTypeId;
    if (updateDto.authorityId !== undefined)
      registration.authorityId = updateDto.authorityId;
    if (updateDto.countryCode !== undefined)
      registration.countryCode = updateDto.countryCode;
    if (updateDto.status !== undefined) registration.status = updateDto.status;
    if (updateDto.registeredDate !== undefined)
      registration.registeredDate = updateDto.registeredDate;
    if (updateDto.dissolvedDate !== undefined)
      registration.dissolvedDate = updateDto.dissolvedDate;
    if (updateDto.isPrimary !== undefined)
      registration.isPrimary = updateDto.isPrimary;

    // Update remarks in rawData
    if (updateDto.remarks !== undefined) {
      registration.rawData = {
        ...(registration.rawData || {}),
        remarks: updateDto.remarks,
      };
    }

    registration.updatedAt = new Date();

    return await this.registrationsRepository.save(registration);
  }

  async remove(id: string): Promise<void> {
    const registration = await this.findOne(id);
    await this.registrationsRepository.remove(registration);
  }
}

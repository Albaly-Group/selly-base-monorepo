import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyContacts } from '../../entities';
import {
  CreateCompanyContactDto,
  UpdateCompanyContactDto,
} from '../../dtos/company-contact.dto';

@Injectable()
export class CompanyContactsService {
  constructor(
    @InjectRepository(CompanyContacts)
    private readonly contactRepository: Repository<CompanyContacts>,
  ) {}

  async getContacts(companyId?: string): Promise<any[]> {
    try {
      const query = this.contactRepository
        .createQueryBuilder('contact')
        .leftJoinAndSelect('contact.company', 'company');

      if (companyId) {
        query.where('contact.companyId = :companyId', { companyId });
      }

      query.orderBy('contact.createdAt', 'DESC');

      const contacts = await query.getMany();

      return contacts.map((contact) => ({
        id: contact.id,
        companyId: contact.companyId,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: contact.fullName,
        title: contact.title,
        department: contact.department,
        seniorityLevel: contact.seniorityLevel,
        email: contact.email,
        phone: contact.phone,
        linkedinUrl: contact.linkedinUrl,
        confidenceScore: contact.confidenceScore,
        lastVerifiedAt: contact.lastVerifiedAt,
        verificationMethod: contact.verificationMethod,
        isOptedOut: contact.isOptedOut,
        optOutDate: contact.optOutDate,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        company: contact.company
          ? {
              id: contact.company.id,
              nameEn: contact.company.nameEn,
              displayName: contact.company.displayName,
            }
          : null,
      }));
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      return [];
    }
  }

  async getContactById(id: string): Promise<any> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return {
      id: contact.id,
      companyId: contact.companyId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      fullName: contact.fullName,
      title: contact.title,
      department: contact.department,
      seniorityLevel: contact.seniorityLevel,
      email: contact.email,
      phone: contact.phone,
      linkedinUrl: contact.linkedinUrl,
      confidenceScore: contact.confidenceScore,
      lastVerifiedAt: contact.lastVerifiedAt,
      verificationMethod: contact.verificationMethod,
      isOptedOut: contact.isOptedOut,
      optOutDate: contact.optOutDate,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      company: contact.company
        ? {
            id: contact.company.id,
            nameEn: contact.company.nameEn,
            displayName: contact.company.displayName,
          }
        : null,
    };
  }

  async createContact(
    createDto: CreateCompanyContactDto,
    user: any,
  ): Promise<any> {
    const contact = this.contactRepository.create({
      companyId: createDto.companyId,
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      // fullName:  createDto.fullName || `${createDto.firstName || ''} ${createDto.lastName || ''}`.trim(),
      title: createDto.title,
      department: createDto.department,
      seniorityLevel: createDto.seniorityLevel,
      email: createDto.email,
      phone: createDto.phone,
      linkedinUrl: createDto.linkedinUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedContact = await this.contactRepository.save(contact);

    return { savedContact };
  }

  async updateContact(
    id: string,
    updateDto: UpdateCompanyContactDto,
    user: any,
  ): Promise<any> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    Object.assign(contact, {
      ...updateDto,
      companyId: updateDto.companyId,
      firstName: updateDto.firstName,
      lastName: updateDto.lastName,
      // fullName:  updateDto.fullName || `${updateDto.firstName || ''} ${updateDto.lastName || ''}`.trim(),
      title: updateDto.title,
      department: updateDto.department,
      seniorityLevel: updateDto.seniorityLevel,
      email: updateDto.email,
      phone: updateDto.phone,
      linkedinUrl: updateDto.linkedinUrl,
      updatedAt: new Date(),
    });

    const savedContact = await this.contactRepository.save(contact);

    return { savedContact };
  }

  async deleteContact(id: string, user: any): Promise<{ message: string }> {
    const contact = await this.contactRepository.findOne({ where: { id } });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    await this.contactRepository.remove(contact);

    return { message: 'Contact deleted successfully' };
  }
}

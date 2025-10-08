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
      firstName: createDto.firstName || null,
      lastName: createDto.lastName || null,
      fullName:
        createDto.fullName ||
        `${createDto.firstName || ''} ${createDto.lastName || ''}`.trim() ||
        null,
      title: createDto.title || null,
      department: createDto.department || null,
      seniorityLevel: createDto.seniorityLevel || null,
      email: createDto.email || null,
      phone: createDto.phone || null,
      linkedinUrl: createDto.linkedinUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedContact = await this.contactRepository.save(contact);

    return {
      id: savedContact.id,
      companyId: savedContact.companyId,
      firstName: savedContact.firstName,
      lastName: savedContact.lastName,
      fullName: savedContact.fullName,
      title: savedContact.title,
      department: savedContact.department,
      seniorityLevel: savedContact.seniorityLevel,
      email: savedContact.email,
      phone: savedContact.phone,
      linkedinUrl: savedContact.linkedinUrl,
      createdAt: savedContact.createdAt,
      updatedAt: savedContact.updatedAt,
    };
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

    // Only update fields that are provided (not undefined)
    if (updateDto.companyId !== undefined) contact.companyId = updateDto.companyId;
    if (updateDto.firstName !== undefined) contact.firstName = updateDto.firstName || null;
    if (updateDto.lastName !== undefined) contact.lastName = updateDto.lastName || null;
    if (updateDto.title !== undefined) contact.title = updateDto.title || null;
    if (updateDto.department !== undefined) contact.department = updateDto.department || null;
    if (updateDto.seniorityLevel !== undefined) contact.seniorityLevel = updateDto.seniorityLevel || null;
    if (updateDto.email !== undefined) contact.email = updateDto.email || null;
    if (updateDto.phone !== undefined) contact.phone = updateDto.phone || null;
    if (updateDto.linkedinUrl !== undefined) contact.linkedinUrl = updateDto.linkedinUrl || null;
    if (updateDto.isOptedOut !== undefined) contact.isOptedOut = updateDto.isOptedOut;
    if (updateDto.optOutDate !== undefined) contact.optOutDate = updateDto.optOutDate;
    
    // Update fullName based on firstName and lastName
    contact.fullName =
      updateDto.fullName ||
      `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
      null;
    
    contact.updatedAt = new Date();

    const savedContact = await this.contactRepository.save(contact);

    return {
      id: savedContact.id,
      companyId: savedContact.companyId,
      firstName: savedContact.firstName,
      lastName: savedContact.lastName,
      fullName: savedContact.fullName,
      title: savedContact.title,
      department: savedContact.department,
      seniorityLevel: savedContact.seniorityLevel,
      email: savedContact.email,
      phone: savedContact.phone,
      linkedinUrl: savedContact.linkedinUrl,
      createdAt: savedContact.createdAt,
      updatedAt: savedContact.updatedAt,
    };
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

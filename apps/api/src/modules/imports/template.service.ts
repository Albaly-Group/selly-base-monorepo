import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ImportEntityType } from '../../dtos/import.dto';

interface TemplateColumn {
  field: string;
  label: string;
  required: boolean;
  example: string;
  description?: string;
}

@Injectable()
export class TemplateService {
  // Define template columns for each entity type
  private readonly templates: Record<ImportEntityType, TemplateColumn[]> = {
    [ImportEntityType.COMPANIES]: [
      {
        field: 'nameEn',
        label: 'Company Name (English)',
        required: true,
        example: 'ABC Company Ltd.',
        description: 'Official company name in English',
      },
      {
        field: 'nameTh',
        label: 'Company Name (Thai)',
        required: false,
        example: 'บริษัท เอบีซี จำกัด',
        description: 'Company name in Thai',
      },
      {
        field: 'primaryRegistrationNo',
        label: 'Registration Number',
        required: false,
        example: '0105558012345',
        description: 'Official company registration number',
      },
      {
        field: 'registrationCountryCode',
        label: 'Country Code',
        required: false,
        example: 'TH',
        description: 'ISO country code (e.g., TH, US, SG)',
      },
      {
        field: 'addressLine1',
        label: 'Address Line 1',
        required: false,
        example: '123 Main Street',
        description: 'Primary address line',
      },
      {
        field: 'addressLine2',
        label: 'Address Line 2',
        required: false,
        example: 'Building A, Floor 5',
        description: 'Secondary address line',
      },
      {
        field: 'postalCode',
        label: 'Postal Code',
        required: false,
        example: '10110',
        description: 'Postal/ZIP code',
      },
      {
        field: 'primaryEmail',
        label: 'Email',
        required: false,
        example: 'contact@abccompany.com',
        description: 'Primary contact email',
      },
      {
        field: 'primaryPhone',
        label: 'Phone',
        required: false,
        example: '+66-2-123-4567',
        description: 'Primary contact phone number',
      },
      {
        field: 'websiteUrl',
        label: 'Website',
        required: false,
        example: 'https://www.abccompany.com',
        description: 'Company website URL',
      },
      {
        field: 'linkedinUrl',
        label: 'LinkedIn URL',
        required: false,
        example: 'https://linkedin.com/company/abc-company',
        description: 'LinkedIn profile URL',
      },
      {
        field: 'businessDescription',
        label: 'Business Description',
        required: false,
        example: 'Leading provider of technology solutions',
        description: 'Brief description of business activities',
      },
      {
        field: 'employeeCountEstimate',
        label: 'Employee Count',
        required: false,
        example: '500',
        description: 'Estimated number of employees',
      },
      {
        field: 'companySize',
        label: 'Company Size',
        required: false,
        example: 'Medium',
        description: 'Size category (Small, Medium, Large, Enterprise)',
      },
      {
        field: 'annualRevenueEstimate',
        label: 'Annual Revenue',
        required: false,
        example: '50000000',
        description: 'Estimated annual revenue',
      },
      {
        field: 'currencyCode',
        label: 'Currency',
        required: false,
        example: 'THB',
        description: 'Currency code (THB, USD, etc.)',
      },
      {
        field: 'isSharedData',
        label: 'Shared Data',
        required: false,
        example: 'false',
        description: 'Set to "true" for platform-level shared data (platform admins only)',
      },
    ],
    [ImportEntityType.CONTACTS]: [
      {
        field: 'firstName',
        label: 'First Name',
        required: true,
        example: 'John',
        description: 'Contact first name',
      },
      {
        field: 'lastName',
        label: 'Last Name',
        required: true,
        example: 'Doe',
        description: 'Contact last name',
      },
      {
        field: 'email',
        label: 'Email',
        required: true,
        example: 'john.doe@example.com',
        description: 'Contact email address',
      },
      {
        field: 'phone',
        label: 'Phone',
        required: false,
        example: '+66-81-234-5678',
        description: 'Contact phone number',
      },
      {
        field: 'jobTitle',
        label: 'Job Title',
        required: false,
        example: 'Sales Manager',
        description: 'Contact job title',
      },
      {
        field: 'companyName',
        label: 'Company Name',
        required: false,
        example: 'ABC Company Ltd.',
        description: 'Associated company name',
      },
    ],
    [ImportEntityType.ACTIVITIES]: [
      {
        field: 'companyName',
        label: 'Company Name',
        required: true,
        example: 'ABC Company Ltd.',
        description: 'Company associated with activity',
      },
      {
        field: 'activityType',
        label: 'Activity Type',
        required: true,
        example: 'Meeting',
        description: 'Type of activity (Call, Email, Meeting, etc.)',
      },
      {
        field: 'subject',
        label: 'Subject',
        required: true,
        example: 'Q1 Sales Review',
        description: 'Activity subject/title',
      },
      {
        field: 'description',
        label: 'Description',
        required: false,
        example: 'Discussed quarterly performance and targets',
        description: 'Detailed activity description',
      },
      {
        field: 'activityDate',
        label: 'Date',
        required: true,
        example: '2025-01-15',
        description: 'Activity date (YYYY-MM-DD)',
      },
    ],
  };

  /**
   * Generate CSV template for the specified entity type
   */
  generateCSVTemplate(entityType: ImportEntityType): string {
    const columns = this.templates[entityType];

    // Create header row with labels
    const headers = columns.map((col) => col.label);

    // Create example row
    const examples = columns.map((col) => col.example);

    // Convert to CSV format
    const csvRows = [headers.join(','), examples.join(',')];

    return csvRows.join('\n');
  }

  /**
   * Generate XLSX template for the specified entity type
   */
  generateXLSXTemplate(entityType: ImportEntityType): Buffer {
    const columns = this.templates[entityType];

    // Create worksheet data
    const wsData = [
      // Header row
      columns.map((col) => col.label),
      // Example row
      columns.map((col) => col.example),
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = columns.map(() => ({ width: 20 }));

    // Add data validation/comments for required fields
    columns.forEach((col, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!ws[cellAddress]) return;

      // Add comment with description
      if (col.description) {
        ws[cellAddress].c = ws[cellAddress].c || [];
        ws[cellAddress].c.push({
          a: 'System',
          t: col.description + (col.required ? ' (Required)' : ' (Optional)'),
        });
      }
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, entityType);

    // Add instructions sheet
    const instructionsData = [
      ['Import Instructions'],
      [''],
      ['1. Fill in the data in the template sheet'],
      ['2. Required fields must have values'],
      ['3. Follow the format shown in the example row'],
      ['4. Do not modify the header row'],
      ['5. Save and upload the file'],
      [''],
      ['Column Descriptions:'],
      [''],
      ...columns.map((col) => [
        col.label,
        col.required ? 'Required' : 'Optional',
        col.description || '',
      ]),
    ];

    const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsWs['!cols'] = [{ width: 30 }, { width: 15 }, { width: 50 }];
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

    // Generate buffer
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Get column mapping for entity type
   */
  getColumnMapping(entityType: ImportEntityType): TemplateColumn[] {
    return this.templates[entityType];
  }

  /**
   * Get template filename
   */
  getTemplateFilename(
    entityType: ImportEntityType,
    format: 'csv' | 'xlsx',
  ): string {
    return `${entityType}_import_template.${format}`;
  }
}

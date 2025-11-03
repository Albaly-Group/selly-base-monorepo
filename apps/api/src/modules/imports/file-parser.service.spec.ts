import { Test, TestingModule } from '@nestjs/testing';
import { FileParserService } from './file-parser.service';
import { TemplateService } from './template.service';
import { ImportEntityType } from '../../dtos/import.dto';
import { BadRequestException } from '@nestjs/common';

describe('FileParserService', () => {
  let service: FileParserService;
  let templateService: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileParserService, TemplateService],
    }).compile();

    service = module.get<FileParserService>(FileParserService);
    templateService = module.get<TemplateService>(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseCSV', () => {
    it('should parse valid CSV data', async () => {
      const csvData = 'Name,Email,Phone\nJohn Doe,john@example.com,123-456-7890\nJane Smith,jane@example.com,098-765-4321';
      const buffer = Buffer.from(csvData, 'utf-8');

      const result = await service.parseCSV(buffer);

      expect(result).toBeDefined();
      expect(result.columns).toEqual(['Name', 'Email', 'Phone']);
      expect(result.rows.length).toBe(2);
      expect(result.totalRows).toBe(2);
    });

    it('should handle empty CSV', async () => {
      const csvData = 'Name,Email,Phone\n';
      const buffer = Buffer.from(csvData, 'utf-8');

      const result = await service.parseCSV(buffer);

      expect(result.rows.length).toBe(0);
      expect(result.totalRows).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(service.validateEmail('test@example.com')).toBe(true);
      expect(service.validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should invalidate incorrect email', () => {
      expect(service.validateEmail('invalid-email')).toBe(false);
      expect(service.validateEmail('missing@domain')).toBe(false);
      expect(service.validateEmail('@domain.com')).toBe(false);
    });

    it('should handle empty email', () => {
      expect(service.validateEmail('')).toBe(true);
      expect(service.validateEmail(null)).toBe(true);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URL', () => {
      expect(service.validateUrl('https://example.com')).toBe(true);
      expect(service.validateUrl('http://www.example.com/path')).toBe(true);
    });

    it('should invalidate incorrect URL', () => {
      expect(service.validateUrl('not-a-url')).toBe(false);
      expect(service.validateUrl('htp://broken.com')).toBe(false);
    });

    it('should handle empty URL', () => {
      expect(service.validateUrl('')).toBe(true);
      expect(service.validateUrl(null)).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('should validate phone with sufficient digits', () => {
      expect(service.validatePhone('123-456-7890')).toBe(true);
      expect(service.validatePhone('+1 (555) 123-4567')).toBe(true);
      expect(service.validatePhone('1234567')).toBe(true);
    });

    it('should invalidate phone with insufficient digits', () => {
      expect(service.validatePhone('123456')).toBe(false);
      expect(service.validatePhone('abc')).toBe(false);
    });

    it('should handle empty phone', () => {
      expect(service.validatePhone('')).toBe(true);
      expect(service.validatePhone(null)).toBe(true);
    });
  });

  describe('validateDate', () => {
    it('should validate correct date', () => {
      expect(service.validateDate('2025-01-15')).toBe(true);
      expect(service.validateDate('2025/01/15')).toBe(true);
      expect(service.validateDate('Jan 15, 2025')).toBe(true);
    });

    it('should invalidate incorrect date', () => {
      expect(service.validateDate('not-a-date')).toBe(false);
      expect(service.validateDate('2025-13-45')).toBe(false);
    });

    it('should handle empty date', () => {
      expect(service.validateDate('')).toBe(true);
      expect(service.validateDate(null)).toBe(true);
    });
  });

  describe('validateNumeric', () => {
    it('should validate numeric values', () => {
      expect(service.validateNumeric('123')).toBe(true);
      expect(service.validateNumeric('123.45')).toBe(true);
      expect(service.validateNumeric('0')).toBe(true);
    });

    it('should invalidate non-numeric values', () => {
      expect(service.validateNumeric('abc')).toBe(false);
      expect(service.validateNumeric('12abc')).toBe(false);
    });

    it('should handle empty numeric', () => {
      expect(service.validateNumeric('')).toBe(true);
      expect(service.validateNumeric(null)).toBe(true);
    });
  });

  describe('validateRequiredFields', () => {
    it('should return errors for missing required fields', () => {
      const row = {
        'Company Name (Thai)': 'Test',
        'Email': 'test@example.com',
      };

      const errors = service.validateRequiredFields(
        row,
        2,
        ImportEntityType.COMPANIES,
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].message).toContain('Required');
    });

    it('should return no errors when all required fields present', () => {
      const row = {
        'Company Name (English)': 'ABC Company',
      };

      const errors = service.validateRequiredFields(
        row,
        2,
        ImportEntityType.COMPANIES,
      );

      expect(errors.length).toBe(0);
    });
  });

  describe('mapRowToEntity', () => {
    it('should map row data to entity fields', () => {
      const row = {
        'Company Name (English)': 'ABC Company',
        'Email': 'contact@abc.com',
        'Phone': '+66-2-123-4567',
      };

      const entity = service.mapRowToEntity(row, ImportEntityType.COMPANIES);

      expect(entity).toBeDefined();
      expect(entity.nameEn).toBe('ABC Company');
      expect(entity.primaryEmail).toBe('contact@abc.com');
      expect(entity.primaryPhone).toBe('+66-2-123-4567');
    });

    it('should skip empty values', () => {
      const row = {
        'Company Name (English)': 'ABC Company',
        'Email': '',
        'Phone': null,
      };

      const entity = service.mapRowToEntity(row, ImportEntityType.COMPANIES);

      expect(entity.nameEn).toBe('ABC Company');
      expect(entity.primaryEmail).toBeUndefined();
      expect(entity.primaryPhone).toBeUndefined();
    });
  });
});

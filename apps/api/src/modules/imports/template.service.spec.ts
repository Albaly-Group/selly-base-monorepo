import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { ImportEntityType } from '../../dtos/import.dto';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCSVTemplate', () => {
    it('should generate CSV template for companies', () => {
      const csv = service.generateCSVTemplate(ImportEntityType.COMPANIES);

      expect(csv).toBeDefined();
      expect(typeof csv).toBe('string');
      expect(csv).toContain('Company Name (English)');
      expect(csv).toContain('ABC Company Ltd.');
    });

    it('should generate CSV template for contacts', () => {
      const csv = service.generateCSVTemplate(ImportEntityType.CONTACTS);

      expect(csv).toBeDefined();
      expect(csv).toContain('First Name');
      expect(csv).toContain('Email');
    });
  });

  describe('generateXLSXTemplate', () => {
    it('should generate XLSX template for companies', () => {
      const buffer = service.generateXLSXTemplate(ImportEntityType.COMPANIES);

      expect(buffer).toBeDefined();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate XLSX template for contacts', () => {
      const buffer = service.generateXLSXTemplate(ImportEntityType.CONTACTS);

      expect(buffer).toBeDefined();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('getColumnMapping', () => {
    it('should return column mapping for companies', () => {
      const mapping = service.getColumnMapping(ImportEntityType.COMPANIES);

      expect(mapping).toBeDefined();
      expect(Array.isArray(mapping)).toBe(true);
      expect(mapping.length).toBeGreaterThan(0);
      expect(mapping[0]).toHaveProperty('field');
      expect(mapping[0]).toHaveProperty('label');
      expect(mapping[0]).toHaveProperty('required');
      expect(mapping[0]).toHaveProperty('example');
    });
  });

  describe('getTemplateFilename', () => {
    it('should return correct CSV filename', () => {
      const filename = service.getTemplateFilename(
        ImportEntityType.COMPANIES,
        'csv',
      );

      expect(filename).toBe('companies_import_template.csv');
    });

    it('should return correct XLSX filename', () => {
      const filename = service.getTemplateFilename(
        ImportEntityType.COMPANIES,
        'xlsx',
      );

      expect(filename).toBe('companies_import_template.xlsx');
    });
  });
});

import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { ImportEntityType, ImportValidationError } from '../../dtos/import.dto';
import { TemplateService } from './template.service';

export interface ParsedData {
  rows: any[];
  columns: string[];
  totalRows: number;
}

@Injectable()
export class FileParserService {
  constructor(private readonly templateService: TemplateService) {}

  /**
   * Parse CSV file
   */
  async parseCSV(buffer: Buffer): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
      const text = buffer.toString('utf-8');
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(
              new BadRequestException(
                `CSV parsing errors: ${results.errors.map((e) => e.message).join(', ')}`,
              ),
            );
            return;
          }
          
          const columns = results.meta.fields || [];
          const rows = results.data;
          
          resolve({
            rows,
            columns,
            totalRows: rows.length,
          });
        },
        error: (error) => {
          reject(new BadRequestException(`CSV parsing failed: ${error.message}`));
        },
      });
    });
  }

  /**
   * Parse XLSX file
   */
  async parseXLSX(buffer: Buffer): Promise<ParsedData> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Get the first sheet (skip Instructions sheet if present)
      const sheetNames = workbook.SheetNames.filter(
        (name) => name.toLowerCase() !== 'instructions',
      );
      
      if (sheetNames.length === 0) {
        throw new BadRequestException('No data sheets found in the Excel file');
      }
      
      const firstSheetName = sheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
      });
      
      if (jsonData.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }
      
      // First row is headers
      const headers = jsonData[0] as string[];
      const columns = headers.map((h) => String(h).trim());
      
      // Remaining rows are data
      const dataRows = jsonData.slice(1);
      
      // Convert array rows to objects
      const rows = dataRows.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col, index) => {
          obj[col] = row[index] !== undefined ? row[index] : '';
        });
        return obj;
      });
      
      return {
        rows,
        columns,
        totalRows: rows.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Excel parsing failed: ${error.message}`,
      );
    }
  }

  /**
   * Parse file based on extension
   */
  async parseFile(buffer: Buffer, filename: string): Promise<ParsedData> {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return this.parseCSV(buffer);
      case 'xlsx':
      case 'xls':
        return this.parseXLSX(buffer);
      default:
        throw new BadRequestException(
          `Unsupported file format: ${extension}. Only CSV and XLSX are supported.`,
        );
    }
  }

  /**
   * Validate required fields
   */
  validateRequiredFields(
    row: any,
    rowIndex: number,
    entityType: ImportEntityType,
  ): ImportValidationError[] {
    const errors: ImportValidationError[] = [];
    const mapping = this.templateService.getColumnMapping(entityType);
    
    mapping.forEach((column) => {
      if (column.required) {
        const value = row[column.label] || row[column.field];
        
        if (!value || String(value).trim() === '') {
          errors.push({
            row: rowIndex,
            column: column.label,
            value: value,
            message: `Required field "${column.label}" is missing or empty`,
            severity: 'error',
          });
        }
      }
    });
    
    return errors;
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    if (!email) return true; // Skip validation if empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    if (!url) return true; // Skip validation if empty
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate phone format (basic)
   */
  validatePhone(phone: string): boolean {
    if (!phone) return true; // Skip validation if empty
    // Basic phone validation - at least 7 digits
    const phoneRegex = /\d{7,}/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate date format
   */
  validateDate(date: string): boolean {
    if (!date) return true; // Skip validation if empty
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  /**
   * Validate numeric value
   */
  validateNumeric(value: string): boolean {
    if (!value) return true; // Skip validation if empty
    return !isNaN(Number(value));
  }

  /**
   * Validate row data based on entity type
   */
  validateRow(
    row: any,
    rowIndex: number,
    entityType: ImportEntityType,
  ): ImportValidationError[] {
    const errors: ImportValidationError[] = [];
    const warnings: ImportValidationError[] = [];
    
    // Check required fields first
    errors.push(...this.validateRequiredFields(row, rowIndex, entityType));
    
    // Entity-specific validations
    switch (entityType) {
      case ImportEntityType.COMPANIES:
        this.validateCompanyRow(row, rowIndex, errors, warnings);
        break;
      case ImportEntityType.CONTACTS:
        this.validateContactRow(row, rowIndex, errors, warnings);
        break;
      case ImportEntityType.ACTIVITIES:
        this.validateActivityRow(row, rowIndex, errors, warnings);
        break;
    }
    
    return [...errors, ...warnings];
  }

  /**
   * Validate company row
   */
  private validateCompanyRow(
    row: any,
    rowIndex: number,
    errors: ImportValidationError[],
    warnings: ImportValidationError[],
  ) {
    // Email validation
    const email = row['Email'] || row['primaryEmail'];
    if (email && !this.validateEmail(email)) {
      errors.push({
        row: rowIndex,
        column: 'Email',
        value: email,
        message: 'Invalid email format',
        severity: 'error',
      });
    }
    
    // Website validation
    const website = row['Website'] || row['websiteUrl'];
    if (website && !this.validateUrl(website)) {
      warnings.push({
        row: rowIndex,
        column: 'Website',
        value: website,
        message: 'Invalid URL format',
        severity: 'warning',
      });
    }
    
    // LinkedIn validation
    const linkedin = row['LinkedIn URL'] || row['linkedinUrl'];
    if (linkedin && !this.validateUrl(linkedin)) {
      warnings.push({
        row: rowIndex,
        column: 'LinkedIn URL',
        value: linkedin,
        message: 'Invalid LinkedIn URL format',
        severity: 'warning',
      });
    }
    
    // Phone validation
    const phone = row['Phone'] || row['primaryPhone'];
    if (phone && !this.validatePhone(phone)) {
      warnings.push({
        row: rowIndex,
        column: 'Phone',
        value: phone,
        message: 'Phone number format may be incorrect',
        severity: 'warning',
      });
    }
    
    // Employee count validation
    const employeeCount = row['Employee Count'] || row['employeeCountEstimate'];
    if (employeeCount && !this.validateNumeric(employeeCount)) {
      errors.push({
        row: rowIndex,
        column: 'Employee Count',
        value: employeeCount,
        message: 'Employee count must be a number',
        severity: 'error',
      });
    }
    
    // Revenue validation
    const revenue = row['Annual Revenue'] || row['annualRevenueEstimate'];
    if (revenue && !this.validateNumeric(revenue)) {
      errors.push({
        row: rowIndex,
        column: 'Annual Revenue',
        value: revenue,
        message: 'Annual revenue must be a number',
        severity: 'error',
      });
    }
  }

  /**
   * Validate contact row
   */
  private validateContactRow(
    row: any,
    rowIndex: number,
    errors: ImportValidationError[],
    warnings: ImportValidationError[],
  ) {
    // Email validation
    const email = row['Email'] || row['email'];
    if (email && !this.validateEmail(email)) {
      errors.push({
        row: rowIndex,
        column: 'Email',
        value: email,
        message: 'Invalid email format',
        severity: 'error',
      });
    }
    
    // Phone validation
    const phone = row['Phone'] || row['phone'];
    if (phone && !this.validatePhone(phone)) {
      warnings.push({
        row: rowIndex,
        column: 'Phone',
        value: phone,
        message: 'Phone number format may be incorrect',
        severity: 'warning',
      });
    }
  }

  /**
   * Validate activity row
   */
  private validateActivityRow(
    row: any,
    rowIndex: number,
    errors: ImportValidationError[],
    warnings: ImportValidationError[],
  ) {
    // Date validation
    const activityDate = row['Date'] || row['activityDate'];
    if (activityDate && !this.validateDate(activityDate)) {
      errors.push({
        row: rowIndex,
        column: 'Date',
        value: activityDate,
        message: 'Invalid date format. Use YYYY-MM-DD',
        severity: 'error',
      });
    }
  }

  /**
   * Map parsed row to entity fields
   */
  mapRowToEntity(row: any, entityType: ImportEntityType): any {
    const mapping = this.templateService.getColumnMapping(entityType);
    const entity: any = {};
    
    mapping.forEach((column) => {
      // Try to find value using both label and field name
      const value = row[column.label] || row[column.field];
      
      if (value !== undefined && value !== null && value !== '') {
        entity[column.field] = value;
      }
    });
    
    return entity;
  }
}

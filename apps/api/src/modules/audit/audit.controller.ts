import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentOrganization } from '../auth/current-user.decorator';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({
    name: 'entityType',
    required: false,
    description: 'Filter by entity type (e.g., Company, CompanyList)',
  })
  @ApiQuery({
    name: 'entityId',
    required: false,
    description: 'Filter by entity ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'actionType',
    required: false,
    description: 'Filter by action type (CREATE, READ, UPDATE, DELETE)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return (default: 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip (default: 0)',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAuditLogs(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('actionType') actionType?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @CurrentOrganization() organizationId?: string,
  ): Promise<{ data: any[]; total: number }> {
    const result = await this.auditService.getAuditLogs(organizationId || '', {
      entityType,
      entityId,
      userId,
      actionType,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    return result;
  }
}

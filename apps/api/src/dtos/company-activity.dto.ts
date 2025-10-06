import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';

export class CreateCompanyActivityDto {
  @ApiProperty({
    description: 'Company UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    description: 'Type of activity',
    example: 'call',
    enum: ['call', 'meeting', 'email', 'note', 'task', 'other'],
  })
  @IsString()
  activityType: string;

  @ApiProperty({
    description: 'Activity outcome',
    example: 'Interested',
    required: false,
  })
  @IsOptional()
  @IsString()
  outcome?: string;

  @ApiProperty({
    description: 'Activity content/notes',
    example: 'Discussed B2B software requirements',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Contact person involved',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({
    description: 'Additional activity details',
    example: { duration: 30, followUpRequired: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiProperty({
    description: 'Activity metadata',
    example: { source: 'web', deviceType: 'desktop' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

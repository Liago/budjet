import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ImportCsvDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'CSV file with transactions',
  })
  file: Express.Multer.File;

  @ApiProperty({
    description: 'Default category ID to use when category from CSV is not found',
    required: false,
  })
  @IsString()
  @IsOptional()
  defaultCategoryId?: string;
} 
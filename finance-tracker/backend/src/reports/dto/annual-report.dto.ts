import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AnnualReportDto {
  @ApiProperty({ example: 2023, description: 'Year for the report', required: false })
  @IsInt()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  @IsOptional()
  year?: number;
} 
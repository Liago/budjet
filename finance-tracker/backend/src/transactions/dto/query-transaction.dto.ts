import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional, IsPositive, IsString, IsUUID, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTransactionDto {
  @ApiProperty({ example: '2023-01-01', description: 'Start date for filtering', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ example: '2023-01-31', description: 'End date for filtering', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ example: 'EXPENSE', description: 'Transaction type (INCOME or EXPENSE)', required: false })
  @IsString()
  @Matches(/^(INCOME|EXPENSE)$/, { message: 'Type must be either INCOME or EXPENSE' })
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'uuid', description: 'Category ID for filtering', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'Groceries', description: 'Tag name for filtering', required: false })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ example: 1, description: 'Page number for pagination', required: false, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ example: 10, description: 'Number of items per page', required: false, default: 10 })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
} 
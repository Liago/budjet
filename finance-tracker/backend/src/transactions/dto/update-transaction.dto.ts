import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDecimal,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTransactionDto {
  @ApiProperty({ example: 50.00, description: 'Transaction amount', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  amount?: number;

  @ApiProperty({ example: 'Grocery shopping', description: 'Transaction description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Transaction date', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @ApiProperty({ example: 'EXPENSE', description: 'Transaction type (INCOME or EXPENSE)', required: false })
  @IsString()
  @Matches(/^(INCOME|EXPENSE)$/, { message: 'Type must be either INCOME or EXPENSE' })
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'uuid', description: 'Category ID', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ 
    example: ['Groceries', 'Food'], 
    description: 'Tags for the transaction',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
} 
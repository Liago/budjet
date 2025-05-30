import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Groceries', description: 'Category name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'shopping_cart', description: 'Icon identifier', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ example: '#FF5733', description: 'Color code (hex)', required: false })
  @IsString()
  @IsOptional()
  color?: string;
  
  @ApiProperty({ example: 300, description: 'Monthly budget for this category', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  budget?: number;
} 
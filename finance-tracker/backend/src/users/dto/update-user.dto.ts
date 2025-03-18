import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false, description: 'User first name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @ApiProperty({ required: false, description: 'User last name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;
} 
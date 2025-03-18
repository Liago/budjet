import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Groceries', description: 'Tag name' })
  @IsString()
  @IsNotEmpty()
  name: string;
} 
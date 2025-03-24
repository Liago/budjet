import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsBoolean,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateSavingsGoalDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  targetAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  currentAmount?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

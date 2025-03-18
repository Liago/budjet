import { IsString, IsNumber, IsOptional, IsDate, IsBoolean, IsEnum, Min, IsInt, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export enum RecurrenceInterval {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class CreateRecurrentPaymentDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RecurrenceInterval)
  interval: RecurrenceInterval;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ValidateIf(o => o.interval === RecurrenceInterval.MONTHLY)
  dayOfMonth?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ValidateIf(o => o.interval === RecurrenceInterval.WEEKLY)
  dayOfWeek?: number;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
} 
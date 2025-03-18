import { IsString, IsNumber, IsOptional, IsDate, IsBoolean, IsEnum, Min, IsInt, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { RecurrenceInterval } from './create-recurrent-payment.dto';

export class UpdateRecurrentPaymentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RecurrenceInterval)
  interval?: RecurrenceInterval;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ValidateIf(o => o.interval === RecurrenceInterval.MONTHLY || !o.interval)
  dayOfMonth?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ValidateIf(o => o.interval === RecurrenceInterval.WEEKLY || !o.interval)
  dayOfWeek?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 
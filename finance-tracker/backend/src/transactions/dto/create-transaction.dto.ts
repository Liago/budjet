import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { TransactionType } from "../../common/constants";

export class CreateTransactionDto {
  @ApiProperty({ example: 50.0, description: "Transaction amount" })
  @IsDecimal({ decimal_digits: "2" })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: "Grocery shopping",
    description: "Transaction description",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: "2023-01-01T00:00:00.000Z",
    description: "Transaction date",
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    example: "EXPENSE",
    description: "Transaction type (INCOME or EXPENSE)",
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({ example: "uuid", description: "Category ID" })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    example: ["Groceries", "Food"],
    description: "Tags for the transaction",
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

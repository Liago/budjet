import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { QueryTransactionDto } from "./dto/query-transaction.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { ImportCsvDto } from "./dto/import-csv.dto";

@ApiTags("transactions")
@Controller("transactions")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new transaction" })
  @ApiResponse({ status: 201, description: "Transaction successfully created" })
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, createTransactionDto);
  }

  @Get("test-delete-all")
  @ApiOperation({ summary: "Test endpoint for delete all" })
  @ApiResponse({ status: 200, description: "Test endpoint" })
  testDeleteAll() {
    return { success: true, message: "Delete all test endpoint is working" };
  }

  @Get()
  @ApiOperation({ summary: "Get all transactions for the current user" })
  @ApiResponse({
    status: 200,
    description: "Returns transactions with pagination",
  })
  findAll(@Request() req, @Query() queryDto: QueryTransactionDto) {
    return this.transactionsService.findAll(req.user.id, queryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific transaction by ID" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  @ApiResponse({ status: 200, description: "Transaction found" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  findOne(@Param("id") id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a transaction" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  @ApiResponse({ status: 200, description: "Transaction successfully updated" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  update(
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req
  ) {
    return this.transactionsService.update(
      id,
      req.user.id,
      updateTransactionDto
    );
  }

  @Delete("all")
  @ApiOperation({
    summary: "Delete all transactions for the authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "All transactions deleted successfully",
  })
  async removeAll(@Request() req) {
    return this.transactionsService.removeAllForUser(req.user.id);
  }

  @Post("delete-all")
  @ApiOperation({ summary: "Delete all transactions (POST method)" })
  @ApiResponse({
    status: 200,
    description: "All transactions deleted successfully",
  })
  async postRemoveAll(@Request() req) {
    return this.transactionsService.removeAllForUser(req.user.id);
  }

  @Post("delete-batch")
  @ApiOperation({ summary: "Delete multiple transactions by IDs" })
  @ApiResponse({ status: 200, description: "Batch deletion successful" })
  async deleteBatch(@Request() req, @Body() body: { ids: string[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException("No transaction IDs provided");
    }

    // Call the service to delete transactions one by one
    const results = [];
    for (const id of body.ids) {
      try {
        const result = await this.transactionsService.remove(id, req.user.id);
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    return {
      success: true,
      message: `Processed ${results.length} transactions`,
      results,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a transaction" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  @ApiResponse({ status: 200, description: "Transaction successfully deleted" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  remove(@Param("id") id: string, @Request() req) {
    return this.transactionsService.remove(id, req.user.id);
  }

  @Post("import/csv")
  @ApiOperation({ summary: "Import transactions from CSV file" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 201,
    description: "Transactions successfully imported",
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype !== "text/csv" &&
          !file.originalname.endsWith(".csv")
        ) {
          return cb(new Error("Only CSV files are allowed!"), false);
        }
        cb(null, true);
      },
    })
  )
  async importCsv(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() importCsvDto: ImportCsvDto
  ) {
    return this.transactionsService.importFromCsv(
      req.user.id,
      file,
      importCsvDto.defaultCategoryId
    );
  }

  @Post("bulk-update")
  @ApiOperation({ summary: "Update multiple transactions at once" })
  @ApiResponse({ status: 200, description: "Batch update successful" })
  async bulkUpdate(
    @Request() req,
    @Body() body: { ids: string[]; data: UpdateTransactionDto }
  ) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException("No transaction IDs provided");
    }

    if (!body.data || Object.keys(body.data).length === 0) {
      throw new BadRequestException("No update data provided");
    }

    // Call the service to update transactions one by one
    const results = [];
    for (const id of body.ids) {
      try {
        const result = await this.transactionsService.update(
          id,
          req.user.id,
          body.data
        );
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    return {
      success: true,
      count: results.filter((r) => r.success).length,
      message: `Updated ${results.filter((r) => r.success).length} of ${
        body.ids.length
      } transactions`,
      results,
    };
  }
}

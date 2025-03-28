import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RecurrentPaymentsService } from "./recurrent-payments.service";
import { CreateRecurrentPaymentDto } from "./dto/create-recurrent-payment.dto";
import { UpdateRecurrentPaymentDto } from "./dto/update-recurrent-payment.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import {
  AutomaticTransactionsService,
  ExecutionResult,
} from "./automatic-transactions.service";

@ApiTags("recurrent-payments")
@Controller("recurrent-payments")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecurrentPaymentsController {
  constructor(
    private readonly recurrentPaymentsService: RecurrentPaymentsService,
    private readonly automaticTransactionsService: AutomaticTransactionsService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new recurrent payment" })
  @ApiResponse({
    status: 201,
    description: "The recurrent payment has been successfully created.",
  })
  create(
    @Request() req,
    @Body() createRecurrentPaymentDto: CreateRecurrentPaymentDto
  ) {
    return this.recurrentPaymentsService.create(
      req.user.id,
      createRecurrentPaymentDto
    );
  }

  @Get()
  @ApiOperation({
    summary: "Get all recurrent payments for the authenticated user",
  })
  @ApiResponse({ status: 200, description: "Return all recurrent payments." })
  findAll(@Request() req) {
    return this.recurrentPaymentsService.findAll(req.user.id);
  }

  @Get("last-execution")
  @ApiOperation({ summary: "Get last automatic execution log" })
  @ApiResponse({ status: 200, description: "Return the last execution log." })
  async getLastExecution(@Request() req): Promise<ExecutionResult | null> {
    return this.automaticTransactionsService.getLastExecutionLog(req.user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a recurrent payment by id" })
  @ApiResponse({ status: 200, description: "Return the recurrent payment." })
  @ApiResponse({ status: 404, description: "Recurrent payment not found." })
  async findOne(@Request() req, @Param("id") id: string) {
    const payment = await this.recurrentPaymentsService.findOne(id);

    if (!payment) {
      throw new NotFoundException("Recurrent payment not found");
    }

    if (payment.userId !== req.user.id) {
      throw new ForbiddenException(
        "You do not have permission to access this recurrent payment"
      );
    }

    return payment;
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a recurrent payment" })
  @ApiResponse({
    status: 200,
    description: "The recurrent payment has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Recurrent payment not found." })
  async update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateRecurrentPaymentDto: UpdateRecurrentPaymentDto
  ) {
    const payment = await this.recurrentPaymentsService.findOne(id);

    if (!payment) {
      throw new NotFoundException("Recurrent payment not found");
    }

    if (payment.userId !== req.user.id) {
      throw new ForbiddenException(
        "You do not have permission to update this recurrent payment"
      );
    }

    return this.recurrentPaymentsService.update(id, updateRecurrentPaymentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a recurrent payment" })
  @ApiResponse({
    status: 200,
    description: "The recurrent payment has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Recurrent payment not found." })
  async remove(@Request() req, @Param("id") id: string) {
    const payment = await this.recurrentPaymentsService.findOne(id);

    if (!payment) {
      throw new NotFoundException("Recurrent payment not found");
    }

    if (payment.userId !== req.user.id) {
      throw new ForbiddenException(
        "You do not have permission to delete this recurrent payment"
      );
    }

    return this.recurrentPaymentsService.remove(id);
  }

  @Post("execute")
  @ApiOperation({ summary: "Manually execute recurrent payments check" })
  @ApiResponse({
    status: 200,
    description: "Execution completed successfully.",
  })
  async executeManually(): Promise<ExecutionResult> {
    return this.automaticTransactionsService.manualExecution();
  }
}

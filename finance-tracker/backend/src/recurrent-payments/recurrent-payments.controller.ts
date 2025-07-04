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
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("recurrent-payments")
@Controller("recurrent-payments")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecurrentPaymentsController {
  constructor(
    private readonly recurrentPaymentsService: RecurrentPaymentsService,
    private readonly automaticTransactionsService: AutomaticTransactionsService,
    private readonly prisma: PrismaService
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

  @Post("debug-status")
  @ApiOperation({
    summary: "Debug endpoint to check recurrent payments status",
  })
  @ApiResponse({ status: 200, description: "Debug information" })
  async debugStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all recurrent payments
    const allPayments = await this.prisma.recurrentPayment.findMany({
      include: {
        user: {
          select: { id: true, email: true },
        },
        category: {
          select: { name: true },
        },
      },
    });

    // Get payments due today
    const duePayments = await this.prisma.recurrentPayment.findMany({
      where: {
        isActive: true,
        nextPaymentDate: {
          lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
        category: {
          select: { name: true },
        },
      },
    });

    // Get last execution log
    const lastExecution = await this.prisma.automaticExecutionLog.findFirst({
      orderBy: { executionDate: "desc" },
    });

    return {
      status: "debug",
      timestamp: new Date().toISOString(),
      currentDate: today.toISOString(),
      emailConfigured: process.env.SMTP_HOST ? true : false,
      smtpHost: process.env.SMTP_HOST ? "configured" : "missing",
      smtpUser: process.env.SMTP_USER ? "configured" : "missing",
      counts: {
        totalPayments: allPayments.length,
        activePayments: allPayments.filter((p) => p.isActive).length,
        dueToday: duePayments.length,
      },
      allPayments: allPayments.map((p) => ({
        id: p.id,
        name: p.name,
        amount: Number(p.amount),
        isActive: p.isActive,
        nextPaymentDate: p.nextPaymentDate,
        interval: p.interval,
        userEmail: p.user.email,
        category: p.category.name,
      })),
      duePayments: duePayments.map((p) => ({
        id: p.id,
        name: p.name,
        amount: Number(p.amount),
        nextPaymentDate: p.nextPaymentDate,
        userEmail: p.user.email,
        category: p.category.name,
      })),
      lastExecution: lastExecution
        ? {
            date: lastExecution.executionDate,
            processedPayments: lastExecution.processedPayments,
            createdTransactions: lastExecution.createdTransactions,
            totalAmount: Number(lastExecution.totalAmount),
          }
        : null,
    };
  }
}

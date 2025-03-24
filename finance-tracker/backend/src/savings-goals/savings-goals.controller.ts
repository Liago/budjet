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
import { SavingsGoalsService } from "./savings-goals.service";
import { CreateSavingsGoalDto } from "./dto/create-savings-goal.dto";
import { UpdateSavingsGoalDto } from "./dto/update-savings-goal.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("savings-goals")
@Controller("savings-goals")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new savings goal" })
  @ApiResponse({
    status: 201,
    description: "The savings goal has been successfully created.",
  })
  create(@Request() req, @Body() createSavingsGoalDto: CreateSavingsGoalDto) {
    return this.savingsGoalsService.create(req.user.id, createSavingsGoalDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all savings goals for the authenticated user" })
  @ApiResponse({ status: 200, description: "Return all savings goals." })
  findAll(@Request() req) {
    return this.savingsGoalsService.findAll(req.user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a savings goal by id" })
  @ApiResponse({ status: 200, description: "Return the savings goal." })
  @ApiResponse({ status: 404, description: "Savings goal not found." })
  async findOne(@Request() req, @Param("id") id: string) {
    const goal = await this.savingsGoalsService.findOne(id);

    if (!goal) {
      throw new NotFoundException("Savings goal not found");
    }

    if (goal.userId !== req.user.id) {
      throw new ForbiddenException(
        "You do not have permission to access this savings goal"
      );
    }

    return goal;
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a savings goal" })
  @ApiResponse({
    status: 200,
    description: "The savings goal has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Savings goal not found." })
  async update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateSavingsGoalDto: UpdateSavingsGoalDto
  ) {
    const goal = await this.savingsGoalsService.findOne(id);

    if (!goal) {
      throw new NotFoundException("Savings goal not found");
    }

    if (goal.userId !== req.user.id) {
      throw new ForbiddenException(
        "You do not have permission to update this savings goal"
      );
    }

    return this.savingsGoalsService.update(id, updateSavingsGoalDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a savings goal" })
  @ApiResponse({
    status: 200,
    description: "The savings goal has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Savings goal not found." })
  async remove(@Request() req, @Param("id") id: string) {
    const goal = await this.savingsGoalsService.findOne(id);

    if (!goal) {
      throw new NotFoundException("Savings goal not found");
    }

    if (goal.userId !== req.user.id) {
      throw new ForbiddenException(
        "You do not have permission to delete this savings goal"
      );
    }

    return this.savingsGoalsService.remove(id);
  }

  @Post(":id/add-amount")
  @ApiOperation({ summary: "Add amount to a savings goal" })
  @ApiResponse({
    status: 200,
    description: "The amount has been successfully added to the savings goal.",
  })
  @ApiResponse({ status: 404, description: "Savings goal not found." })
  async addAmount(
    @Request() req,
    @Param("id") id: string,
    @Body("amount") amount: number
  ) {
    const goal = await this.savingsGoalsService.findOne(id);

    if (!goal) {
      throw new NotFoundException("Savings goal not found");
    }

    if (goal.userId !== req.user.id) {
      throw new ForbiddenException(
        "You do not have permission to update this savings goal"
      );
    }

    if (!amount || amount <= 0) {
      throw new ForbiddenException("Amount must be greater than 0");
    }

    return this.savingsGoalsService.addAmount(id, amount);
  }
}

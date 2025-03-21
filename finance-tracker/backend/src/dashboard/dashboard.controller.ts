import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Req,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("dashboard")
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  @ApiOperation({ summary: "Get dashboard statistics" })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Start date (YYYY-MM-DD)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "End date (YYYY-MM-DD)",
  })
  @ApiResponse({ status: 200, description: "Returns dashboard statistics" })
  async getStats(
    @Req() req: ExpressRequest,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const userId = req.user["id"];
    return this.dashboardService.getStats(userId, startDate, endDate);
  }

  @Get("trends")
  @ApiOperation({ summary: "Get trend data for analytics" })
  @ApiQuery({
    name: "timeRange",
    required: false,
    description: "Time range (3m, 6m, 12m)",
  })
  @ApiResponse({
    status: 200,
    description: "Returns trend data for monthly income/expense analysis",
  })
  async getTrendData(
    @Req() req: ExpressRequest,
    @Query("timeRange") timeRange: string
  ) {
    const userId = req.user["id"];
    return this.dashboardService.getTrendData(userId, timeRange);
  }

  @Get("forecast")
  @ApiOperation({ summary: "Get forecast data for predictive analysis" })
  @ApiQuery({
    name: "months",
    required: false,
    description: "Number of months to analyze and forecast",
  })
  @ApiResponse({
    status: 200,
    description:
      "Returns historical and forecast data for financial prediction",
  })
  async getForecastData(
    @Req() req: ExpressRequest,
    @Query("months") months?: string
  ) {
    const userId = req.user["id"];
    const monthsValue = months ? parseInt(months) : 6; // Default to 6 months
    return this.dashboardService.getForecastData(userId, monthsValue);
  }

  @Get("savings")
  async getSavingSuggestions(@Req() req: ExpressRequest) {
    const userId = req.user["id"];
    return this.dashboardService.getSavingSuggestions(userId);
  }
}

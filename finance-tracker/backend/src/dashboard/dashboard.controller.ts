import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Returns dashboard statistics' })
  async getStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getStats(req.user.id, startDate, endDate);
  }
} 
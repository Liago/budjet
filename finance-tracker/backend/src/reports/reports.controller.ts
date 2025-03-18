import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MonthlyReportDto } from './dto/monthly-report.dto';
import { AnnualReportDto } from './dto/annual-report.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly income and expense report' })
  @ApiResponse({ status: 200, description: 'Returns monthly financial summary' })
  getMonthlyReport(@Request() req, @Query() queryDto: MonthlyReportDto) {
    return this.reportsService.getMonthlyReport(req.user.id, queryDto);
  }

  @Get('annual')
  @ApiOperation({ summary: 'Get annual income and expense report' })
  @ApiResponse({ status: 200, description: 'Returns annual financial summary' })
  getAnnualReport(@Request() req, @Query() queryDto: AnnualReportDto) {
    return this.reportsService.getAnnualReport(req.user.id, queryDto);
  }
} 
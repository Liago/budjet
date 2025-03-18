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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category successfully created' })
  @ApiResponse({ status: 409, description: 'Category with the same name already exists' })
  create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.id, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for the current user' })
  findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.categoriesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category successfully updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category with the same name already exists' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    return this.categoriesService.update(id, req.user.id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category successfully deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete a default category or one used in transactions' })
  remove(@Param('id') id: string, @Request() req) {
    return this.categoriesService.remove(id, req.user.id);
  }
} 
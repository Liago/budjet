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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('tags')
@Controller('tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag successfully created' })
  @ApiResponse({ status: 409, description: 'Tag with the same name already exists' })
  create(@Request() req, @Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(req.user.id, createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags for the current user' })
  findAll(@Request() req) {
    return this.tagsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag found' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tagsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag successfully updated' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 409, description: 'Tag with the same name already exists' })
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Request() req,
  ) {
    return this.tagsService.update(id, req.user.id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag successfully deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete a tag used in transactions' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tagsService.remove(id, req.user.id);
  }
} 
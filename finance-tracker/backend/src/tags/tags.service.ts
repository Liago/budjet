import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTagDto: CreateTagDto) {
    // Check if tag with the same name already exists for this user
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        name: createTagDto.name,
        userId,
      },
    });

    if (existingTag) {
      throw new ConflictException(`Tag with name '${createTagDto.name}' already exists`);
    }

    return this.prisma.tag.create({
      data: {
        ...createTagDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async update(id: string, userId: string, updateTagDto: UpdateTagDto) {
    // Check if tag exists
    await this.findOne(id, userId);

    // Check if name is being updated and if it would conflict
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        name: updateTagDto.name,
        userId,
        id: { not: id },
      },
    });

    if (existingTag) {
      throw new ConflictException(`Tag with name '${updateTagDto.name}' already exists`);
    }

    return this.prisma.tag.update({
      where: { id },
      data: updateTagDto,
    });
  }

  async remove(id: string, userId: string) {
    // Check if tag exists
    await this.findOne(id, userId);

    // Check if tag is used in any transactions
    const transactionCount = await this.prisma.transaction.count({
      where: {
        tags: {
          some: {
            id,
          },
        },
      },
    });

    if (transactionCount > 0) {
      throw new ConflictException(
        `Cannot delete tag that is used in ${transactionCount} transactions`,
      );
    }

    return this.prisma.tag.delete({
      where: { id },
    });
  }
} 
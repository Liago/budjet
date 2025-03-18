import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    // Check if category with the same name already exists for this user
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: createCategoryDto.name,
        userId,
      },
    });

    if (existingCategory) {
      throw new ConflictException(`Category with name '${createCategoryDto.name}' already exists`);
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
    });
  }

  async update(id: string, userId: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    await this.findOne(id, userId);

    // Check if name is being updated and if it would conflict
    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          userId,
          id: { not: id },
        },
      });

      if (existingCategory) {
        throw new ConflictException(`Category with name '${updateCategoryDto.name}' already exists`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, userId: string) {
    // Check if category exists
    const category = await this.findOne(id, userId);

    // Check if it's a default category
    if (category.isDefault) {
      throw new ConflictException('Cannot delete a default category');
    }

    // Check if category is used in any transactions
    const transactionCount = await this.prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionCount > 0) {
      throw new ConflictException(
        `Cannot delete category that is used in ${transactionCount} transactions`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
} 
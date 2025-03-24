import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSavingsGoalDto } from "./dto/create-savings-goal.dto";
import { UpdateSavingsGoalDto } from "./dto/update-savings-goal.dto";

@Injectable()
export class SavingsGoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createSavingsGoalDto: CreateSavingsGoalDto) {
    return this.prisma.savingsGoal.create({
      data: {
        ...createSavingsGoalDto,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.savingsGoal.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateSavingsGoalDto: UpdateSavingsGoalDto) {
    // Se currentAmount raggiunge o supera targetAmount, imposta isCompleted a true
    if (
      updateSavingsGoalDto.currentAmount &&
      updateSavingsGoalDto.targetAmount
    ) {
      if (
        updateSavingsGoalDto.currentAmount >= updateSavingsGoalDto.targetAmount
      ) {
        updateSavingsGoalDto.isCompleted = true;
      }
    } else if (updateSavingsGoalDto.currentAmount) {
      // Ottieni l'obiettivo corrente per verificare se ha raggiunto il target
      const currentGoal = await this.prisma.savingsGoal.findUnique({
        where: { id },
        select: { targetAmount: true },
      });

      if (
        currentGoal &&
        updateSavingsGoalDto.currentAmount >= Number(currentGoal.targetAmount)
      ) {
        updateSavingsGoalDto.isCompleted = true;
      }
    }

    return this.prisma.savingsGoal.update({
      where: { id },
      data: updateSavingsGoalDto,
    });
  }

  async remove(id: string) {
    return this.prisma.savingsGoal.delete({
      where: { id },
    });
  }

  async addAmount(id: string, amount: number) {
    // Ottieni l'obiettivo corrente
    const goal = await this.prisma.savingsGoal.findUnique({
      where: { id },
    });

    if (!goal) {
      return null;
    }

    // Calcola il nuovo importo
    const newAmount = Number(goal.currentAmount) + amount;

    // Aggiorna l'obiettivo
    return this.prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        isCompleted: newAmount >= Number(goal.targetAmount),
      },
    });
  }
}
